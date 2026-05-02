# Diagnóstico: LLM ↔ Sistema Inteiro Enova 2 — RAIO-X READ-ONLY

**Tipo:** PR-DIAG / READ-ONLY  
**Data:** 2026-05-01  
**Branch:** `diag/llm-funil-sistema-inteiro-readonly`  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Pré-condição:** G8 frente WhatsApp APROVADO (PR #176, 2026-05-01)

> Esta PR não altera nada em runtime. Apenas mapeia o estado real e propõe contrato/PRs para a próxima frente.

---

## 1. Resumo executivo

A Enova 2 hoje responde WhatsApp em PROD, mas o **LLM é cego ao funil mecânico**.

Existem dois sistemas paralelos no mesmo repositório que **nunca se encontram em runtime**:

1. **Pipeline WhatsApp** (`src/meta/canary-pipeline.ts`) — recebe inbound, cria lead/turno/memória in-memory, chama LLM com mensagem crua, envia outbound.
2. **Core mecânico** (`src/core/engine.ts`) — 9 stages, gates, parsers L04–L17 (topo, meio A, meio B, especiais, final). Exposto apenas via `POST /__core__/run` para uso técnico/teste — nunca é chamado pelo pipeline WhatsApp.

Consequência: o LLM gera fala sem saber stage, sem facts, sem histórico. O funil mecânico decide stages corretamente, mas só se alguém chamar `/__core__/run` manualmente.

Adicionalmente, **a persistência Supabase em PROD está silenciosamente desligada** — `getCrmBackend` retorna in-memory por default sem nenhuma telemetria/aviso, e o `wrangler.toml` declara zero bindings.

---

## 2. Estado real atual

### 2.1 O que funciona de verdade

| Item | Onde | Evidência |
|---|---|---|
| Webhook Meta GET challenge | `src/meta/webhook.ts:96-143` | smoke 20/20 PASS |
| Webhook Meta POST + assinatura HMAC | `src/meta/webhook.ts:154-375` | smoke 20/20 PASS |
| Parser inbound + dedupe in-memory | `src/meta/parser.ts`, `dedupe.ts` | smoke 20/20 PASS |
| Outbound real (gated) | `src/meta/outbound.ts` | PROD `external_dispatch=true` |
| LLM real (OpenAI gpt-4o-mini) | `src/llm/client.ts` | PROD respondendo |
| CRM upsertLeadByPhone + turn | `src/meta/pipeline.ts:99-115` | smoke 26/26 PASS |
| Memória `attendance_memory` por evento | `src/meta/pipeline.ts:144-161` | smoke 17/17 PASS |
| Telemetria `console.log` de PROD | `src/meta/prod-diag.ts` | 11 logs visíveis em `wrangler tail` |
| Flags + rollback + harness | `src/golive/*` | smoke 18/18 PASS, `prove:g8-readiness` 7/7 |
| Core mecânico (engine + L04–L17) | `src/core/*` | smoke `npm run smoke` PASS — **isolado** |

### 2.2 O que está só documentado mas não está conectado

| Item | Documentado em | Status real |
|---|---|---|
| Funil mecânico em runtime WhatsApp | L03–L17, contrato T0–T7 | **NÃO conectado** ao pipeline Meta |
| Stage atual do lead em conversa real | `CrmLeadState.stage_current` | **Nunca escrito** pelo runtime WhatsApp |
| Parsers (topo/meio/final/especiais) extraindo facts da fala | L04–L17 | **Nunca chamados** com texto real do WhatsApp |
| Living memory para LLM | `src/context/living-memory.ts` | **Nunca chamado** por ninguém |
| Semantic turn packet | `src/context/schema.ts` | **Nunca preenchido** em runtime |

### 2.3 O que está implementado mas sem env/binding/secret em PROD

| Item | Flag/env exigida | wrangler.toml | Comportamento PROD |
|---|---|---|---|
| Supabase real para CRM | `SUPABASE_REAL_ENABLED=true` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | **Nada declarado** | Silenciosamente in-memory |
| Memória persistida em Supabase | `MEMORY_SUPABASE_ENABLED=true` | **Nada declarado** | Sempre in-memory FIFO 5000 |
| Bindings KV/R2/D1/Queue | — | **Nada declarado** | Inexistente |
| Vars Meta (verify token, app secret, access token, phone_id) | `wrangler secret put` | **Não no toml** | OK em PROD via secret put |
| `OPENAI_API_KEY` | `wrangler secret put` | **Não no toml** | OK em PROD via secret put |
| `CLIENT_REAL_ENABLED=true` | `wrangler secret put` | **Não no toml** | OK em PROD via secret put (PR #175 fix) |

### 2.4 O que está mockado/in-memory

- **CRM backend default**: `CrmInMemoryBackend` (Map<table, T[]>) — `src/crm/store.ts:31-86`
- **Dedupe Meta**: FIFO 1000 chaves em memória — `src/meta/dedupe.ts`
- **Memória evolutiva**: FIFO 5000 — `src/memory/store.ts:32-118`
- **Telemetria**: buffer em memória — `src/telemetry/emit.ts`
- **Stage do lead**: `CrmLeadState` declarado mas **nunca preenchido em conversa real**
- **Override log**: in-memory — perde tudo no restart

### 2.5 O que está integrado ao WhatsApp real (PROD)

```
WhatsApp inbound → /__meta__/webhook
  → assinatura HMAC verificada
  → parser normaliza evento
  → dedupe checa wa_message_id
  → ENOVA2_ENABLED=true → runCanaryPipeline
    → upsertLeadByPhone (cria lead in-memory)
    → createConversationTurn (turno in-memory, stage_at_turn='unknown')
    → registerMemoryEvent (memória in-memory)
    → callLlm(text_body) — LLM cego
    → sendMetaOutbound (gated por flags)
  → outbound respondido no WhatsApp
```

### 2.6 O que está integrado ao CRM/memória/Supabase

- CRM in-memory: pipeline grava em-memória a cada inbound (perde no restart)
- Memória in-memory: pipeline grava `attendance_memory` (perde no restart)
- Supabase real: **inativo em PROD** (flag não setada)

### 2.7 Onde o LLM entra hoje

`src/meta/canary-pipeline.ts:170` chama `callLlm(userText, env)`.

`src/llm/client.ts:42-98` envia para OpenAI:
```
messages = [
  { role: 'system', content: SYSTEM_PROMPT_GENÉRICO },
  { role: 'user', content: msg.slice(0, 2000) }
]
```

**O LLM recebe apenas a mensagem atual.** Sem stage. Sem facts. Sem histórico. Sem contexto.

### 2.8 Onde o funil mecânico decide stage/gate

`src/core/engine.ts:57` — `runCoreEngine(state: LeadState)` é chamado APENAS por:
- `src/worker.ts:151` (rota `POST /__core__/run` para teste estrutural)
- `src/core/smoke.ts` (teste)
- `src/audio/smoke.ts`, `src/speech/smoke.ts` (testes)

**`src/meta/` NÃO importa nem chama `runCoreEngine`.** Confirmado por:
```
grep "runCoreEngine|core/engine" src/meta/  → 0 matches
```

---

## 3. Arquitetura atual encontrada

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Worker nv-enova-2                               │
│                                                              │
│  ┌──────────────┐                                           │
│  │ POST /__meta__/webhook                                   │
│  │   ↓                                                       │
│  │ webhook.ts → parser → dedupe → runCanaryPipeline         │
│  │   ↓                                                       │
│  │ canary-pipeline.ts                                        │
│  │   ↓                                                       │
│  │ runInboundPipeline (CRM upsert + turn + memória)         │
│  │   ↓                                                       │
│  │ callLlm(text_body) ← LLM CEGO                            │
│  │   ↓                                                       │
│  │ sendMetaOutbound (gated)                                 │
│  └──────────────┘                                           │
│                                                              │
│  ┌──────────────┐                                           │
│  │ POST /__core__/run  ← isolado, só técnico/teste          │
│  │   ↓                                                       │
│  │ runCoreEngine (engine + L04–L17 parsers + gates)         │
│  │   ↓                                                       │
│  │ CoreDecision(stage_after, next_objective, speech_intent) │
│  └──────────────┘                                           │
│                                                              │
│  Os dois caminhos NUNCA se cruzam em runtime.               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. WhatsApp runtime — mapa de entrada

| Etapa | Arquivo | Linhas | Flag/condição |
|---|---|---|---|
| Rota | `src/worker.ts` | 306-310 | `pathname === META_WEBHOOK_ROUTE` |
| Challenge GET | `src/meta/webhook.ts` | 96-143 | `META_VERIFY_TOKEN` |
| Assinatura HMAC | `src/meta/signature.ts` | — | `META_APP_SECRET` |
| Parser | `src/meta/parser.ts` | — | — |
| Dedupe | `src/meta/dedupe.ts` | — | in-memory |
| Eventos `message` | `src/meta/webhook.ts` | 282-306 | `ENOVA2_ENABLED=true` |
| Eventos `status` | `src/meta/webhook.ts` | 307-311 | apenas observado, sem ação |
| CRM/memória | `src/meta/pipeline.ts` (via canary) | 99-161 | `ENOVA2_ENABLED` |
| LLM | `src/meta/canary-pipeline.ts` | 165-211 | `LLM_REAL_ENABLED` + !ROLLBACK + !MAINTENANCE |
| Outbound | `src/meta/canary-pipeline.ts` + `src/meta/outbound.ts` | 213-314 | `META_OUTBOUND_ENABLED` + (`CLIENT_REAL_ENABLED` OR `OUTBOUND_CANARY_ENABLED+wa_id`) |
| Logs PROD | `src/meta/prod-diag.ts` (11 pontos) | — | sempre ON |

Eventos `status` (delivered/read) **não disparam nada além de telemetria observada**.

---

## 5. LLM runtime — mapa atual

- **Client**: `src/llm/client.ts:42-98` (`callLlm`)
- **Modelo**: `gpt-4o-mini` (hardcoded)
- **Envs exigidas**: `OPENAI_API_KEY`
- **Prompt**: SYSTEM_PROMPT genérico (linhas 18-26) — não recebe stage/contexto
- **Onde é chamado**: apenas `src/meta/canary-pipeline.ts:112,170`
- **Conhecimento de stage/funil**: **zero**
- **Risco de LLM livre**: **MÉDIO** — o prompt instrui "não decidir etapa/funil", mas sem mecânica externa que valide a saída

A regra "LLM é soberano da fala, mecânico é soberano da estrutura" está **escrita no system prompt e nos comentários de código**, mas **não é ativa em runtime** — nada hoje impede o LLM de inadvertidamente prometer aprovação de financiamento, mudar de assunto, ignorar regras MCMV.

---

## 6. Funil mecânico — mapa atual

| Item | Arquivo | Estado |
|---|---|---|
| Mapa de stages | `src/core/stage-map.ts` | 9 stages canônicos (L03) |
| Engine | `src/core/engine.ts` | `runCoreEngine` operacional, isolado |
| Topo (discovery) | `src/core/topo-{parser,gates,rules}.ts` | OK — L04/L05/L06 |
| Meio A (qualification_civil) | `src/core/meio-a-{parser,gates,rules}.ts` | OK — L07/L10 |
| Meio B (renda + elegibilidade) | `src/core/meio-b-{parser,gates,rules}.ts` | OK — L11/L14 |
| Especiais (P3, multi) | `src/core/especiais-{parser,gates,rules}.ts` | OK — L15/L16 |
| Final (docs/visit/handoff) | `src/core/final-{parser,gates,rules}.ts` | OK — L17 |
| `nextStage` por gate | `evaluateGateFatoCriticoAusente` + `evaluate*Criteria` | OK |
| Estado persistido | `CrmLeadState.stage_current` | **Nunca escrito por runtime real** |
| Conexão com WhatsApp | — | **Inexistente** |

**O funil mecânico está completo, mas isolado.** É chamado apenas em smokes e na rota técnica `/__core__/run`.

---

## 7. CRM/memória/contexto — mapa atual

### Lead

`src/crm/types.ts:53-70` — `CrmLead`:
- `lead_id` (UUID)
- `external_ref` ← `wa_id` (chave de associação)
- `phone_ref` ← `phone_number_id`
- `customer_name`, `status`, `manual_mode`
- **NÃO tem campo `current_stage`** (stage vive em `CrmLeadState`)

### Turn

`src/crm/types.ts:96-107` — `CrmTurn`:
- `turn_id`, `lead_id`
- `raw_input_summary` (primeiros ~500 chars)
- `stage_at_turn: 'unknown'` (gravado como literal `'unknown'` em `service.ts:448`)
- **Nunca preenchido com stage real**

### CrmLeadState

`src/crm/types.ts:78-89`:
- `stage_current`, `next_objective`, `block_advance`, `policy_flags`
- Marcado como **soberania do Core** em `src/adapter/boundaries.ts` (CRM lê, nunca escreve)
- **Hoje em PROD: nunca escrito** porque o Core não é chamado pelo pipeline WhatsApp

### Memória (7 categorias)

`src/memory/types.ts:21-28`:
- `attendance_memory`, `learning_candidate`, `contract_memory`, `performance_memory`, `error_memory`, `commercial_memory`, `product_memory`
- Indexado por `lead_ref`
- **In-memory FIFO 5000** — perde tudo no restart

### Contexto

`src/context/{schema,living-memory,multi-signal}.ts`:
- `SemanticTurnPacket`, `LivingMemorySnapshot` declarados
- **Nunca chamados em runtime** — existem apenas para futura integração

### Associação WA ID ↔ lead ↔ memória ↔ stage

| Vínculo | Existe? | Onde |
|---|---|---|
| WA ID → lead | SIM | `external_ref` em `CrmLead` |
| Lead → turnos | SIM | `lead_id` FK em `CrmTurn` |
| Lead → memória | SIM | `lead_ref` em `MemoryRecord` |
| Lead → stage | NÃO em runtime real | `CrmLeadState.lead_id` declarado, nunca escrito por inbound |
| Turno → stage no momento | NÃO funcional | `stage_at_turn='unknown'` literal |

**Conclusão crítica:** Quando uma mensagem chega no WhatsApp PROD, o LLM:
- **NÃO** vê turnos anteriores
- **NÃO** sabe o stage atual
- **NÃO** sabe os facts coletados
- Recebe apenas o texto cru da mensagem atual (até 2000 caracteres)

---

## 8. Supabase/envs/bindings — tabela diagnóstica

| Item | Existe no código? | Usado em runtime? | Env exigida | Env no wrangler.toml? | Fallback | Risco |
|---|---|---|---|---|---|---|
| Cliente Supabase HTTP | SIM (`src/supabase/client.ts`) | Não em PROD | `SUPABASE_URL` | NÃO | n/a | n/a |
| `SupabaseCrmBackend` | SIM (`src/supabase/crm-store.ts`) | Não em PROD | `SUPABASE_REAL_ENABLED=true` + URL + key | NÃO | `CrmInMemoryBackend` silencioso | **ALTO — fingimento de persistência** |
| `getCrmBackend(env)` factory | SIM (`src/crm/store.ts:113-130`) | SIM | flag + URL + key | NÃO | retorna in-memory sem aviso | ALTO |
| Memória → Supabase | NÃO implementado | NÃO | `MEMORY_SUPABASE_ENABLED` (futura) | NÃO | sempre in-memory | MÉDIO |
| `crm_lead_meta`, `enova_state`, `enova_docs`, `crm_override_log` | SIM (mapping) | SIM se flag ON | flag ON | NÃO | n/a | n/a |
| Buckets `emailsnv`, `documentos-pre-analise`, `enavia-brain`, `enavia-brain-test` | SIM (catalog) | NÃO | n/a | NÃO | n/a | n/a |
| Write real (UPDATE/INSERT) Supabase | **NÃO IMPLEMENTADO** mesmo com flag ON | NÃO | n/a | n/a | writeBuffer interno (in-memory) | **ALTO — escrita real é miragem** |
| `wrangler.toml` bindings | — | — | — | **ZERO bindings** (linhas 15-16 explicitam) | — | **ALTO** |

**`SUPABASE_*` é lido nesses arquivos:**
- `src/crm/store.ts:113-130` — gate principal
- `src/crm/routes.ts:67,173-215,217` — rota expõe readiness, retorna 503 se flag ON sem envs
- `src/supabase/{readiness,client,crm-store,types,smoke,proof}.ts`
- `src/memory/{sanitize,store,smoke,proof}.ts` — sanitização redige a chave em logs
- `src/golive/{flags,smoke,closeout-smoke}.ts`
- `src/adapter/{boundaries,policy,runtime,types,index,smoke,policy-smoke,runtime-smoke}.ts`

**Comportamento PROD se Vasques deploya sem nenhum secret Supabase:** o Worker NÃO crasha. `getCrmBackend` retorna `CrmInMemoryBackend` silenciosamente. `/crm/leads` responde 200 com lista possivelmente vazia ou parcial. Nenhum log/telemetria sinaliza "FALLBACK_IN_MEMORY_ATIVO_EM_PROD". Após restart do Worker, todos os leads/turnos/memória somem.

Veja também `schema/diagnostics/SUPABASE_RUNTIME_READINESS.md` para detalhes operacionais.

---

## 9. Telemetria — mapa observabilidade

| Sinal | Destino | Visível em wrangler tail? |
|---|---|---|
| `emitTelemetry(...)` | buffer em memória do Worker | **NÃO** (descoberto na PR-DIAG #174) |
| `console.log(JSON.stringify(...))` via `diagLog` | stdout do Worker | **SIM** |
| 11 pontos `meta.prod.*` | stdout | **SIM** (PR #174) |
| Health endpoints `/__admin__/go-live/health`, `/crm/health`, `/crm/memory/status` | response JSON | só via curl |

**Gaps de observabilidade para integração LLM ↔ funil:**
- Não há log de "qual stage o lead está" em runtime real
- Não há log de "quais facts foram extraídos" pelo Core (porque Core não roda em runtime real)
- Não há trace ponta-a-ponta correlacionando: wa_id → lead_id → turn_id → core_decision_id → llm_call → outbound_message_id
- Não há métrica de "LLM falou algo proibido" (prompt injection guard ausente)

---

## 10. Contrato de conexão LLM ↔ funil — proposta arquitetural

```
WhatsApp inbound
  → assinatura + parser + dedupe (mantém)
  → CRM/memória/contexto:
      - upsertLeadByPhone(wa_id) → lead_id
      - createConversationTurn(lead_id, raw_text)
      - leitura de CrmLeadState (stage atual)
      - leitura de últimos N turnos
      - leitura de memória attendance/commercial recente
  → Funil mecânico identifica stage atual + extrai sinais:
      - extract*Signals() do stage atual (topo/meio/final/especiais)
      - evaluate*Criteria() avalia gates
      - runCoreEngine() emite CoreDecision(stage_after, next_objective, speech_intent, gates_activated)
  → Persistir CrmLeadState.stage_current ANTES do LLM falar
  → LLM recebe pacote estruturado:
      - SYSTEM_PROMPT base
      - + stage_current, next_objective, speech_intent
      - + facts já coletados (resumo)
      - + últimas 3-5 trocas (resumo)
      - + regras MCMV permitidas para o stage
      - + restrições explícitas ("não aprove financiamento", etc.)
  → LLM gera reply_text
  → Mecânico valida resposta:
      - guard contra promessas de aprovação
      - guard contra mudança de stage pelo LLM
      - guard contra revelação de regras internas
  → Mecânico decide persistência/stage/next action:
      - se LLM ambíguo → stage permanece, retry/confirma
      - se sinais novos extraídos → grava facts, atualiza stage
  → outbound
```

### Regras invioláveis (já alinhadas com adendos canônicos)

- LLM **não** avança stage sozinho
- LLM **não** aprova financiamento
- LLM **não** altera regra MCMV
- Mecânico decide stage/gate
- LLM melhora fala, interpretação e condução
- Em ambiguidade, LLM confirma com pergunta antes de avançar
- Toda decisão estrutural deve ser rastreável (turn_id ↔ decision_id ↔ stage transition)

---

## 11. Gaps bloqueantes (antes de integrar LLM ao funil)

| ID | Gap | Severidade | Justificativa |
|---|---|---|---|
| BLK-01 | Pipeline WhatsApp não chama `runCoreEngine` | **BLOQUEANTE** | Sem isso, LLM nunca terá stage/contexto. |
| BLK-02 | `CrmLeadState.stage_current` nunca é escrito em runtime real | **BLOQUEANTE** | Sem stage persistido, próximo turno volta a stage default. |
| BLK-03 | Parsers L04–L17 nunca recebem texto WhatsApp real | **BLOQUEANTE** | Sem extração de facts, gates não avançam. |
| BLK-04 | LLM recebe apenas texto cru sem contexto | **BLOQUEANTE** | Risco de fala fora de regra. |
| BLK-05 | Persistência Supabase silenciosamente desligada em PROD | **BLOQUEANTE** | Stage e memória somem no restart. |
| BLK-06 | `wrangler.toml` sem nenhum binding declarado | **BLOQUEANTE** | Sem visibilidade de envs esperados. |

## 12. Gaps importantes (podem vir em PR seguinte)

| ID | Gap | Severidade |
|---|---|---|
| IMP-01 | Living memory snapshot não é construído | IMPORTANTE |
| IMP-02 | Semantic turn packet não é preenchido | IMPORTANTE |
| IMP-03 | LLM output guard contra promessas/aprovações | IMPORTANTE |
| IMP-04 | Trace ponta-a-ponta (wa_id → outbound_message_id) ausente | IMPORTANTE |
| IMP-05 | Telemetria de "qual stage no momento da resposta" ausente | IMPORTANTE |
| IMP-06 | Memória `commercial_memory` (objeções, follow-ups) não populada | IMPORTANTE |
| IMP-07 | Fallback LLM (timeout/erro) — hoje retorna `ok=false` sem reply | IMPORTANTE |

## 13. Opcionais — não mexer agora

| ID | Item | Razão |
|---|---|---|
| OPC-01 | Migrar memória in-memory para Supabase real | **Isso é opcional. Não mexa agora.** Pode coexistir um tempo com in-memory. |
| OPC-02 | Refatorar adapter/boundaries para tipos mais estritos | **Isso é opcional. Não mexa agora.** |
| OPC-03 | Implementar `MEMORY_SUPABASE_ENABLED` real | **Isso é opcional. Não mexa agora.** |
| OPC-04 | Adicionar bindings KV para dedupe distribuído | **Isso é opcional. Não mexa agora.** |
| OPC-05 | Speech engine separado do LLM | **Isso é opcional. Não mexa agora.** |

---

## 14. Riscos

| Risco | Probabilidade | Impacto | Mitigação proposta |
|---|---|---|---|
| LLM prometer aprovação MCMV indevida | MÉDIA | ALTO | Output guard mecânico (BLK-04 + IMP-03) |
| Stage perdido no restart do Worker | ALTA | ALTO | BLK-05 (Supabase real ativo) |
| Lead duplicado entre restarts | ALTA | MÉDIO | BLK-05 + dedupe persistente |
| Pipeline LLM lento (sem contexto) → respostas genéricas | ALTA | MÉDIO | BLK-01..04 |
| Telemetria oculta em PROD | RESOLVIDO PR #174 | — | — |
| LLM ignorar regra do system prompt | MÉDIA | ALTO | IMP-03 (guard pós-resposta) |
| Migração big-bang quebra PROD | ALTA | ALTO | Fragmentar em micro-PRs (§15) |

---

## 15. Plano recomendado de PRs (ordenado, micro)

| # | PR | Tipo | Objetivo | Arquivos prováveis | Critério de aceite |
|---|---|---|---|---|---|
| 1 | DIAG-FUNIL-LLM (esta) | DIAG | Mapeamento read-only | `schema/diagnostics/*` | PR mergeada, contrato novo aberto |
| 2 | CONTRATO-T9-FUNIL-LLM | DOC | Abrir contrato T9 com regras invioláveis e plano | `schema/contracts/active/*` | Contrato declarado, _INDEX atualizado |
| 3 | T9.1 — Wrangler binding declarations | INFRA | Declarar envs/secrets esperados em `wrangler.toml` (sem valores) | `wrangler.toml` | Deploy em test mostra envs faltantes explicitamente |
| 4 | T9.2 — Supabase runtime fallback guard | IMPL | Telemetria explícita quando in-memory ativo em PROD | `src/crm/store.ts`, `src/telemetry/*` | Log `runtime.guard.in_memory_fallback` em PROD |
| 5 | T9.3 — DIAG: contrato Stage ↔ pipeline | DIAG | Especificar onde Core entra no canary-pipeline | `schema/diagnostics/T9_CORE_PIPELINE_INTEGRATION.md` | DIAG aprovada |
| 6 | T9.4 — IMPL: chamada runCoreEngine no pipeline | IMPL | Pipeline chama Core, persiste stage_current | `src/meta/canary-pipeline.ts`, `src/crm/service.ts` | Smoke pipeline mostra `core_decision_id` em log |
| 7 | T9.5 — PROVA: stage_current persiste entre turnos | PROVA | Smoke real com 2 turnos no Worker test | `src/meta/pipeline-real-proof.ts` | Stage do turno 2 ≠ default |
| 8 | T9.6 — IMPL: parsers L04–L17 chamados com texto real | IMPL | Extract*Signals do stage atual sobre `event.text_body` | `src/meta/canary-pipeline.ts` | Smoke mostra facts extraídos |
| 9 | T9.7 — PROVA: facts extraídos persistem | PROVA | Smoke real evolui de discovery → qualification_civil | — | Stage avançou com fact preenchido |
| 10 | T9.8 — IMPL: LLM recebe contexto estruturado | IMPL | `callLlm` aceita `LlmContext` com stage/facts/históriço | `src/llm/client.ts`, `src/meta/canary-pipeline.ts` | LLM responde com pergunta certa do stage |
| 11 | T9.9 — IMPL: guard de saída LLM | IMPL | Validar resposta LLM contra promessas/aprovações | `src/meta/canary-pipeline.ts`, novo `src/llm/output-guard.ts` | Smoke fail se LLM falar "aprovado" |
| 12 | T9.10 — PROVA: conversa real ponta-a-ponta com 5+ turnos | PROVA | Lead avança discovery → qualification_civil → renda em conversa real | — | Vasques confirma fluxo natural |
| 13 | T9.11 — IMPL: persistência Supabase write real (CRM/memória) | IMPL | Escrita real em `crm_lead_meta`, `enova_state` | `src/supabase/crm-store.ts` | Worker restart preserva lead/stage |
| 14 | T9.12 — PROVA: persistência sobrevive restart | PROVA | Restart Worker, lead continua | — | Vasques confirma |
| 15 | T9.13 — Telemetria ponta-a-ponta | IMPL | Trace `wa_id → outbound_message_id` | `src/telemetry/*`, `src/meta/prod-diag.ts` | Log único por mensagem com correlação completa |
| 16 | T9.R — Closeout G9 frente Funil-LLM | CLOSEOUT | Encerrar frente | `schema/proofs/*` | G9 APROVADO frente funil |

**Separação obrigatória:**
- Worker/runtime (T9.1, T9.2)
- Supabase/envs (T9.11, T9.12)
- Funil/stages (T9.3–T9.7)
- LLM/prompt (T9.8, T9.9)
- Telemetria (T9.13)
- Provas (T9.5, T9.7, T9.10, T9.12)

Cada PR deve ter critério de aceite testável em smoke/PROD, sem dependências cruzadas que obriguem rebase.

---

## 16. Próximo contrato sugerido

**T9 — Integração LLM ↔ Funil Mecânico ↔ Persistência Real**

Cláusulas obrigatórias:
1. LLM cego ao funil é proibido a partir de T9.4 mergeada
2. Stage só avança via Core, nunca via LLM
3. `CLIENT_REAL_ENABLED=true` continua exigido para outbound real
4. `ROLLBACK_FLAG=true` permanece soberano
5. Persistência Supabase real ativa antes de fechar G9
6. Output guard LLM ativo antes de fechar G9
7. Smoke real ponta-a-ponta com Vasques antes de fechar G9
8. T8/G8 frente WhatsApp permanece **APROVADA** — T9 amplia, não revoga

Detalhes em `schema/handoffs/LLM_FUNIL_NEXT_CONTRACT_HANDOFF.md`.

---

## Marcadores de governança

**T8/G8 frente WhatsApp APROVADO permanece intacto.**  
**T9 não aberto formalmente nesta PR — esta é DIAG read-only.**  
Nenhuma regra de negócio alterada. Nenhum prompt LLM alterado. Nenhuma rota alterada. Nenhuma flag alterada.  
Rollback gate (`ROLLBACK_FLAG=true`) preservado como bloqueio soberano de tudo.

Adendo de soberania da IA lido (schema/ADENDO_CANONICO_SOBERANIA_IA.md): sim  
Adendo soberania LLM MCMV lido (schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md): sim  
Adendo fechamento por prova lido (schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md): sim
