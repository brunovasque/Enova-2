# T8 — PR-DIAG — Diagnóstico do acoplamento inbound Meta → CRM/eventos/memória/LLM/outbound + cutover Enova 1 → Enova 2

**Tipo:** PR-DIAG  
**Data:** 2026-05-01  
**Branch:** `diag/t8-meta-inbound-cutover-enova1-enova2`  
**Executado em:** Claude Code  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Frente:** Meta/WhatsApp — acoplamento inbound  
**Relação:** PR-T8.12B + INFRA-META-01 + prova parcial 2026-05-01

---

## §0 — Estado herdado (ESTADO HERDADO)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: diagnostico
Última PR relevante: PR #165 — docs: registra prova parcial real meta whatsapp
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md
Objetivo imutável do contrato: transformar Enova 2 em sistema operacional real — atendimento cliente real controlado
Recorte a executar nesta PR: diagnóstico do gap entre inbound recebido e resposta real
Item do A01: T8 — fase de diagnóstico de aderência contrato × código real
Estado atual da frente: Meta/WhatsApp — PROVA_REAL_PARCIAL — inbound recebido; acoplamento LLM/outbound/CRM ausente
O que a última PR fechou: registrou prova parcial positiva (Worker TEST publicado, secrets provisionados, inbound real recebido)
O que a última PR NÃO fechou: acoplamento inbound→CRM, inbound→memória, inbound→LLM, inbound→outbound, cutover Enova 1→Enova 2, G8
Por que esta tarefa existe: inbound real chegou ao Worker mas a resposta automática não existe — falta diagnosticar exatamente o que implementar
Esta tarefa está dentro ou fora do contrato ativo: dentro — diagnóstico técnico de aderência é objetivo explícito da T8
Objetivo desta tarefa: mapear exatamente o gap entre POST /__meta__/webhook recebido e resposta operacional real
Escopo: leitura de código, mapeamento de rotas/funções/flags/lacunas, proposta de PR-IMPL segura, plano de cutover
Fora de escopo: alteração de src/, wrangler.toml, Supabase, produção, LLM real, outbound real, WhatsApp real, G8
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md (referência)
  Índice de contratos lido:    schema/contracts/_INDEX.md (implícito via CLAUDE.md)
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Índice legado consultado:    N/A — tarefa de diagnóstico
  Legado markdown auxiliar:    N/A
  PDF mestre consultado:       não consultado — markdown soberano suficiente
  Provas lidas:                schema/proofs/T8_META_WHATSAPP_PROVA_REAL_PARCIAL_2026-05-01.md
                               schema/proofs/T8_META_WHATSAPP_PROVA_REAL_EXECUTADA.md
                               schema/proofs/T8_META_WHATSAPP_PROVA_CONTROLADA.md
  Implementações lidas:        schema/implementation/T8_META_WORKER_IMPL.md
                               schema/implementation/T8_FLAGS_ROLLBACK_GOLIVE_HARNESS.md
                               schema/implementation/INFRA_META_01_AMBIENTE_TEST_CLOUDFLARE.md
  Código lido:                 src/worker.ts
                               src/meta/webhook.ts
                               src/meta/outbound.ts
                               src/meta/parser.ts
                               src/memory/routes.ts
                               src/crm/routes.ts (header)
                               src/crm/service.ts (header)
                               src/golive/flags.ts
                               src/golive/rollback.ts
                               src/golive/harness.ts
                               src/adapter/runtime.ts (header)
```

---

## §1 — Objetivo do diagnóstico

Responder com precisão às 10 questões obrigatórias:

1. Onde `POST /__meta__/webhook` termina hoje.
2. Se o inbound real grava algo.
3. Se existe integração com CRM/conversa/eventos.
4. Se existe persistência Supabase do inbound.
5. Se existe chamada LLM a partir do inbound.
6. Se existe outbound automático a partir do inbound.
7. Quais flags precisam estar ON para resposta real.
8. Quais flags devem permanecer OFF até autorização humana.
9. Risco do único número WhatsApp + plano de cutover.
10. Sequência segura de PRs.

---

## §2 — Resultado do diagnóstico ponto a ponto

### 2.1 — Onde `POST /__meta__/webhook` termina hoje

**Caminho completo rastreado no código:**

```
src/worker.ts → fetch()
  → url.pathname === '/__meta__/webhook'
  → handleMetaWebhook(request, url, env, telemetryContext)   [src/meta/webhook.ts]
    → processMetaWebhookPost({ rawBody, signatureHeader, env, telemetryContext })
      → verifyMetaSignature()         [assinatura HMAC-SHA256]
      → parseMetaWebhookPayload()     [parse do payload bruto Meta]
      → dedupeStore.has() / .remember() [dedupe in-memory]
      → emitWebhookEvent(...)         [telemetria in-memory]
      → return { status: 200, body: { accepted: true, mode: 'technical_only', llm_invoked: false, ... } }
  → jsonResponse(result.body, 200)
  → return Response
```

**Conclusão:** o `POST /__meta__/webhook` **termina em `src/meta/webhook.ts` linha 264 com `emitWebhookEvent(ctx, 'meta.outbound.blocked', 'blocked', ...)` e retorna 200**.

Nenhuma chamada downstream é feita. O retorno é um JSON técnico com `accepted: true`, `mode: 'technical_only'`, `llm_invoked: false`, `external_dispatch: false`.

---

### 2.2 — O inbound grava algo?

| O que existe | Sim/Não | Detalhe |
|---|---|---|
| Dedupe in-memory | **SIM** | `getSharedDedupeStore()` — FIFO 1000 chaves, não persiste entre deploys |
| Telemetria in-memory | **SIM** | Eventos `meta.webhook.*` emitidos via `emitTelemetry()` — buffer in-memory |
| CRM lead criado | **NÃO** | Nenhuma chamada a `createLead()` ou `POST /crm/leads` |
| Conversa registrada | **NÃO** | Não existe `POST /crm/conversations` — endpoint não implementado |
| Memória registrada | **NÃO** | `POST /crm/memory/event` existe mas não é chamado pelo inbound |
| Supabase write | **NÃO** | `SUPABASE_REAL_ENABLED` não afeta o inbound — escrita é in-memory buffer |
| Adapter runtime | **NÃO** | `writeTurnEvent()`, `upsertLead()` existem em `src/adapter/runtime.ts` mas não são chamados pelo inbound |

**Conclusão:** o inbound atual **não grava absolutamente nada** fora do buffer in-memory de telemetria e do dedupe FIFO. Nenhuma persistência. Nenhum registro.

---

### 2.3 — Existe integração com CRM/conversa/eventos?

**NÃO.**

O módulo `src/meta/webhook.ts` é completamente isolado dos módulos CRM e memória:

| Interface disponível | Existe | Conectado ao inbound |
|---|---|---|
| `POST /crm/leads` (criação de lead) | ✅ | ❌ |
| `POST /crm/leads/:id/override` | ✅ | ❌ |
| `GET /crm/conversations` | ✅ | ❌ |
| `POST /crm/conversations` | ❌ (não implementado) | ❌ |
| `POST /crm/memory/event` | ✅ | ❌ |
| `source: 'meta_webhook'` na memória | ✅ (tipo definido) | ❌ |

**Gap crítico identificado:** o `source: 'meta_webhook'` já está declarado como `MemorySource` válido em `src/memory/routes.ts` (linha 74). A interface está pronta para receber eventos Meta. Mas nada chama ela a partir do inbound.

---

### 2.4 — Existe persistência Supabase do inbound?

**NÃO.**

- `SUPABASE_REAL_ENABLED` flag existe. Quando ativa, o backend CRM usa `SupabaseCrmBackend`. Mas esse backend **só lê** — writes são para in-memory buffer (`writeBuffer`).
- `MEMORY_SUPABASE_ENABLED` flag existe mas a integração não foi implementada.
- Nenhum caminho do inbound chama Supabase direta ou indiretamente.

---

### 2.5 — Existe chamada LLM a partir do inbound?

**NÃO — absolutamente zero.**

Não existe nenhum código de integração LLM no repositório que seja chamado a partir do inbound. A flag `LLM_REAL_ENABLED` existe em `src/golive/flags.ts` mas é apenas declarativa — nada no inbound a lê.

O `src/core/engine.ts` (`runCoreEngine`) existe e é chamado de `/__core__/run`, mas não é chamado do inbound.

O `src/adapter/runtime.ts` existe com funções de persistência para turnos/leads, mas não está conectado ao inbound.

---

### 2.6 — Existe outbound automático a partir do inbound?

**NÃO — explicitamente bloqueado.**

Em `src/meta/webhook.ts` linha 259:

```typescript
emitWebhookEvent(ctx, 'meta.outbound.blocked', 'blocked', 'info', {
  route: META_WEBHOOK_ROUTE,
  reason: 'pr_t811_no_auto_outbound',
});
```

A função `sendMetaOutbound()` existe em `src/meta/outbound.ts` e funciona quando as flags certas estão ON. Mas **não é chamada em nenhum ponto do fluxo de inbound**. É uma função de biblioteca aguardando ser conectada.

---

### 2.7 — Quais flags precisam estar ON para resposta real

Para que Enova 2 receba, processe e responda uma mensagem real de WhatsApp, as seguintes flags **todas** devem estar ON:

| Flag | Onde declarada | Para quê | Situação atual (TEST) |
|---|---|---|---|
| `ENOVA2_ENABLED=true` | `src/golive/flags.ts` | Sistema habilitado | ✅ JÁ ATIVA no TEST |
| `CHANNEL_ENABLED=true` | `src/golive/flags.ts` | Canal real ativo | ✅ JÁ ATIVA no TEST |
| `META_OUTBOUND_ENABLED=true` | `src/golive/flags.ts` | Outbound Meta liberado | ✅ JÁ ATIVA no TEST |
| `LLM_REAL_ENABLED=true` | `src/golive/flags.ts` | LLM real pode ser chamado | ❌ NÃO ATIVA — e sem implementação |
| `CLIENT_REAL_ENABLED=true` | `src/golive/flags.ts` | Cliente real autorizado | ❌ NÃO ATIVA — sem autorização Vasques |
| `META_ACCESS_TOKEN` | `src/meta/webhook-env.ts` | Token para Graph API | ✅ JÁ ATIVA no TEST |
| `META_PHONE_NUMBER_ID` | `src/meta/webhook-env.ts` | ID do número | ✅ JÁ ATIVA no TEST |

**Além das flags, o pipeline de acoplamento precisa ser implementado:**
- Inbound → CRM lead upsert
- Inbound → conversa/turno registrado
- Inbound → memória registrada (`source: 'meta_webhook'`)
- Inbound → LLM chamado com contexto do lead
- LLM → `reply_text` gerado
- `reply_text` → `sendMetaOutbound()` chamada com `wa_id` + `phone_number_id`

Hoje nenhum desses passos existe no código.

---

### 2.8 — Quais flags devem permanecer OFF até autorização humana

| Flag | Motivo para manter OFF | Quando pode ligar |
|---|---|---|
| `LLM_REAL_ENABLED` | Sem implementação de chamada LLM no inbound | Após PR-IMPL com LLM + prova controlada + autorização Vasques |
| `CLIENT_REAL_ENABLED` | Não autorizado por Vasques | Após go-live autorizado explicitamente |
| `ROLLBACK_FLAG` | Se verdadeiro, bloqueia tudo | Manter false; usar apenas como killswitch de emergência |
| `MAINTENANCE_MODE` | Bloqueia atendimento | Manter false; usar apenas para janela de manutenção |

**`META_OUTBOUND_ENABLED` está ON no TEST** — mas não causa nenhum outbound hoje porque `sendMetaOutbound()` não é chamado. Quando o pipeline for implementado, esta flag já estará pronta para habilitar o outbound real.

**Regra soberana inviolável:** `CLIENT_REAL_ENABLED=true` e `LLM_REAL_ENABLED=true` só podem ser ligadas com autorização explícita de Vasques. Nenhuma PR-IMPL pode ativá-las unilateralmente.

---

### 2.9 — Risco de 1 único número WhatsApp + plano de cutover

#### 2.9.1 — O problema

O Meta permite **apenas um webhook URL por número de telefone**. Com 1 único número WhatsApp:

- **Enova 1 (produção atual):** `https://nv-enova.brunovasque.workers.dev/webhook/meta`
- **Enova 2 TEST:** `https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook`
- **Enova 2 PROD (futuro):** `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`

Apenas **uma URL pode estar ativa por vez**. Enova 1 e Enova 2 não podem receber o mesmo webhook simultaneamente sem trocar a URL.

#### 2.9.2 — Gap adicional identificado

**Desconhecemos o comportamento atual da Enova 1.** Perguntas críticas não respondidas por este diagnóstico (lacuna de leitura — repositório Enova 1 não disponível aqui):

- A Enova 1 responde automaticamente a mensagens recebidas hoje?
- Qual é o fluxo de atendimento atual da Enova 1?
- A Enova 1 tem rollback operacional documentado?
- O que acontece com leads ativos na Enova 1 durante o cutover?

**Esta lacuna é bloqueante para planejar o cutover completo.** O plano abaixo é baseado nos dados disponíveis mas assume que o risco de interrupção da Enova 1 é gerenciável por Vasques.

#### 2.9.3 — Plano de cutover seguro (fases)

```
FASE A: PREPARAÇÃO (PRs anteriores + esta PR-DIAG)
  - Enova 2 TEST recebe inbound ✅ (provado em PR #165)
  - Webhook pode ser alternado para TEST temporariamente
  - Rollback instantâneo: recolocar URL da Enova 1

FASE B: ACOPLAMENTO MÍNIMO (PR-IMPL próxima)
  - Implementar pipeline: inbound → CRM + memória (SEM LLM, SEM outbound)
  - Testar no TEST com webhook apontando para TEST
  - Confirmar CRM lead criado, memória registrada

FASE C: PIPELINE LLM + OUTBOUND (PR-IMPL seguinte)  
  - Implementar: inbound → LLM → outbound (gated por LLM_REAL_ENABLED)
  - Testar no TEST com janela curta controlada
  - Vasques autoriza LLM_REAL_ENABLED=true no TEST
  - Prova com mensagem real → resposta real no TEST

FASE D: CUTOVER ENOVA 1 → ENOVA 2 PROD
  Pré-condições:
    ✓ Pipeline B + C provado no TEST
    ✓ Vasques autoriza CLIENT_REAL_ENABLED=true
    ✓ Enova 2 PROD deployada (wrangler deploy, sem --env test)
    ✓ Secrets Meta provisionados no PROD
    ✓ ROLLBACK_FLAG=false confirmado
  
  Sequência de cutover (janela curta, com Vasques presente):
  1. Ativar ROLLBACK_FLAG=true no PROD Enova 2 (bloqueio seguro)
  2. Trocar webhook Meta → Enova 2 PROD URL
  3. Verificar: inbound chega no Worker PROD (wrangler tail nv-enova-2)
  4. Desativar ROLLBACK_FLAG no PROD (ROLLBACK_FLAG=false)
  5. Confirmar: primeira mensagem real respondida corretamente
  6. Monitorar 5–15 min
  
  Rollback imediato (se falhar em qualquer passo):
  → Trocar webhook de volta: https://nv-enova.brunovasque.workers.dev/webhook/meta
  → Enova 1 retoma imediatamente
  → Tempo de rollback: ~30 segundos (apenas troca de URL no painel Meta)

FASE E: GO-LIVE COMPLETO
  - Monitorar Enova 2 PROD por período de estabilização
  - Confirmar leads ativos sendo atendidos
  - G8 pode ser fechado após evidência completa
```

#### 2.9.4 — Restrições operacionais do cutover

| Restrição | Razão |
|---|---|
| Cutover só com Vasques presente | Autorização humana obrigatória para ação em produção |
| Janela de silêncio recomendada | Evitar mensagens perdidas durante troca — escolher horário de baixo tráfego |
| Rollback deve ser testado antes | Vasques deve confirmar que sabe como reverter no painel Meta antes de iniciar |
| Enova 1 não desligar antes de confirmar Enova 2 funcional | Manter Enova 1 operacional até G8 aprovado |
| Sem cutover parcial | A troca de webhook é binária — não há gradiente. Canary de WhatsApp exigiria 2 números |

---

### 2.10 — Lacunas mapeadas (resumo)

| ID | Lacuna | Impacto | Onde implementar |
|---|---|---|---|
| LAC-IB-01 | Sem pipeline inbound → CRM lead upsert | Alto | `src/meta/webhook.ts` + `src/crm/service.ts` |
| LAC-IB-02 | Sem pipeline inbound → conversa/turno | Alto | `src/crm/` (nova função `createConversation`) |
| LAC-IB-03 | Sem pipeline inbound → memória (`source: 'meta_webhook'`) | Médio | `src/meta/webhook.ts` → `registerMemoryEvent()` |
| LAC-IB-04 | Sem chamada LLM a partir do inbound | Crítico | Novo módulo `src/llm/` ou `src/meta/pipeline.ts` |
| LAC-IB-05 | Sem geração de `reply_text` | Crítico | LLM (soberano da fala) |
| LAC-IB-06 | `sendMetaOutbound()` não conectada ao inbound | Alto | `src/meta/webhook.ts` → chamar após reply_text |
| LAC-IB-07 | `LLM_REAL_ENABLED` sem implementação real | Crítico | PR-IMPL futura com integração LLM real |
| LAC-IB-08 | `POST /crm/conversations` não implementado | Médio | Novo endpoint em `src/crm/routes.ts` |
| LAC-IB-09 | Sem persistência Supabase do inbound | Baixo-médio | Futuro — MEMORY_SUPABASE_ENABLED |
| LAC-IB-10 | Comportamento Enova 1 desconhecido | Alto (cutover) | Vasques deve verificar no repo Enova 1 |

---

## §3 — O que já está pronto

| Item | Estado | Arquivo |
|---|---|---|
| GET challenge (verificação webhook Meta) | ✅ PRONTO | `src/meta/webhook.ts` |
| POST assinatura HMAC-SHA256 | ✅ PRONTO | `src/meta/signature.ts` |
| Parser payload bruto Meta | ✅ PRONTO | `src/meta/parser.ts` |
| Dedupe in-memory FIFO | ✅ PRONTO | `src/meta/dedupe.ts` |
| `sendMetaOutbound()` (biblioteca) | ✅ PRONTO (não conectada) | `src/meta/outbound.ts` |
| Feature flags canônicas | ✅ PRONTO | `src/golive/flags.ts` |
| `isOperationallyAllowed()` | ✅ PRONTO | `src/golive/rollback.ts` |
| `ROLLBACK_FLAG` killswitch | ✅ PRONTO | `src/golive/rollback.ts` |
| CRM backend (leads, facts, override) | ✅ PRONTO | `src/crm/` |
| Memória evolutiva + sanitização | ✅ PRONTO | `src/memory/` |
| `source: 'meta_webhook'` na memória | ✅ PRONTO (tipo definido) | `src/memory/routes.ts` |
| `registerMemoryEvent()` | ✅ PRONTO | `src/memory/service.ts` |
| Worker TEST publicado + secrets | ✅ PRONTO | Cloudflare — provisionado por Vasques |
| Inbound real recebido no TEST | ✅ PROVADO | PR #165 |

---

## §4 — O que falta (mapa de implementação)

```
POST /__meta__/webhook (recebido ✅)
  │
  ├─ [LAC-IB-01] FALTA → upsert CRM lead por wa_id/phone_number_id
  │    └─ criação de lead com source=meta_whatsapp, phone_number=wa_id
  │
  ├─ [LAC-IB-02] FALTA → criar turno/conversa no CRM
  │    └─ registrar mensagem recebida com timestamp, type, text_body
  │
  ├─ [LAC-IB-03] FALTA → registrar evento de memória
  │    └─ registerMemoryEvent(source='meta_webhook', category='attendance_memory')
  │
  ├─ [LAC-IB-04] FALTA → preparar contexto do lead para LLM
  │    └─ buscar estado atual do lead + histórico + regras MCMV
  │
  ├─ [LAC-IB-05] FALTA → chamar LLM (soberano da fala)
  │    └─ LLM gera reply_text — NÃO o adapter, NÃO o mecânico
  │
  └─ [LAC-IB-06] FALTA → chamar sendMetaOutbound(reply_text, wa_id, phone_number_id, env)
       └─ gated por CHANNEL_ENABLED + META_OUTBOUND_ENABLED + LLM_REAL_ENABLED
```

---

## §5 — Onde mexer na próxima PR-IMPL

### 5.1 — Menor patch seguro (PR-IMPL T8.16 recomendada)

**Escopo mínimo e verificável:** acoplamento inbound → CRM + memória, **sem LLM, sem outbound real**.

Arquivos a modificar:

| Arquivo | Mudança |
|---|---|
| `src/meta/webhook.ts` | Após dedupe: chamar `registerMemoryEvent()` (gated por `ENOVA2_ENABLED`) |
| `src/crm/service.ts` | Nova função `upsertLeadByPhone(wa_id, phone_number_id)` |
| `src/crm/routes.ts` | Novo endpoint `POST /crm/conversations` |
| `src/meta/pipeline.ts` | **NOVO** — orchestrador inbound: parse → lead upsert → memória → retorno 200 |

**O que NÃO entra neste patch:**
- Chamada LLM (exige PR dedicada com prova)
- `sendMetaOutbound()` conectada (exige LLM primeiro)
- Persistência Supabase (exige MEMORY_SUPABASE_ENABLED)
- Mudança de flags reais (permanece gated)

**Gate de entrada para este patch:**
- `ENOVA2_ENABLED=true` (já ativo no TEST)
- `CHANNEL_ENABLED=true` (já ativo no TEST)
- `LLM_REAL_ENABLED=false` (deve permanecer false neste patch)
- `CLIENT_REAL_ENABLED=false` (deve permanecer false neste patch)

### 5.2 — O que não pode mexer na próxima PR-IMPL

| Item | Motivo |
|---|---|
| `LLM_REAL_ENABLED=true` | Sem implementação + sem autorização Vasques |
| `CLIENT_REAL_ENABLED=true` | Sem autorização Vasques |
| `sendMetaOutbound()` conectada ao inbound | Depende de LLM pronto |
| Enova 1 — qualquer alteração | Fora do repo Enova 2 — não tocar |
| Webhook Meta no PROD | Não trocar antes de pipeline completo + provado |
| `wrangler.toml` | Não alterar — não é necessário para o acoplamento |
| Migrations Supabase | Não — persistência é in-memory por ora |
| Regras MCMV | Não — o LLM é soberano da fala, o mecânico não fala |

---

## §6 — Regras soberanas invioláveis no acoplamento

| Regra | Origem | Aplicação no inbound |
|---|---|---|
| IA é soberana na fala | ADENDO_CANONICO_SOBERANIA_IA | `reply_text` NUNCA gerado pelo adapter/webhook — vem do LLM |
| Mecânico não tem prioridade de fala | ADENDO_CANONICO_SOBERANIA_IA | Webhook apenas orquestra — não compõe fala |
| reply_text e decide_stage proibidos no adapter | Contrato T8 | Nenhuma rota CRM/webhook pode produzir `reply_text` |
| Promoção de memória NUNCA automática | PR-T8.13 | Registro de evento é permitido; promoção exige operador humano |
| Outbound real exige CHANNEL_ENABLED + META_OUTBOUND_ENABLED | PR-T8.11 | Qualquer chamada a `sendMetaOutbound()` deve verificar flags |
| Operação real exige ENOVA2_ENABLED | PR-T8.15 | Gate em tudo que afeta cliente real |
| ROLLBACK_FLAG=true bloqueia tudo | PR-T8.15 | Killswitch de emergência disponível a qualquer momento |

---

## §7 — Como impedir resposta indevida

A resposta automática no WhatsApp **é impossível** enquanto:

1. `sendMetaOutbound()` não for chamada (hoje não é — linha 259 de `webhook.ts` bloqueia explicitamente)
2. LLM não for integrado (sem `reply_text`, `sendMetaOutbound()` nega com `reply_text_missing`)
3. `CHANNEL_ENABLED=false` (bloqueio de flag)
4. `META_OUTBOUND_ENABLED=false` (bloqueio de flag)
5. `LLM_REAL_ENABLED=false` (bloqueio de flag — deve ser adicionado como gate ao pipeline)
6. `ROLLBACK_FLAG=true` (killswitch total)

**Proteções em camadas (defense in depth):**
```
Camada 1: código — sendMetaOutbound() não chamada
Camada 2: flag — CHANNEL_ENABLED/META_OUTBOUND_ENABLED
Camada 3: operacional — LLM_REAL_ENABLED=false
Camada 4: killswitch — ROLLBACK_FLAG=true
Camada 5: webhook — URL não aponta para PROD enquanto não autorizado
```

---

## §8 — Como ativar LLM_REAL_ENABLED com segurança

1. Implementar `src/llm/` ou `src/meta/pipeline.ts` com chamada real ao LLM
2. Criar PR-PROVA com prova controlada local (não WhatsApp real)
3. Prova aprovada → Vasques autoriza `LLM_REAL_ENABLED=true` no TEST
4. Testar no TEST com mensagem real → confirmar resposta adequada
5. Documentar evidência em `schema/proofs/`
6. Apenas após evidência completa: Vasques autoriza `LLM_REAL_ENABLED=true` no PROD

---

## §9 — Sequência de PRs proposta

| PR | Tipo | Escopo | Gate |
|---|---|---|---|
| Esta | PR-DIAG | Diagnóstico inbound + cutover | Fechar esta PR |
| PR-T8.16 | PR-IMPL | Acoplamento inbound → CRM + memória (sem LLM) | Prova CRM lead criado, memória registrada |
| PR-T8.16.P | PR-PROVA | Prova do acoplamento local + TEST | 100% PASS, smoke:all PASS |
| PR-T8.17 | PR-IMPL | Integração LLM real → `reply_text` → outbound (gated por LLM_REAL_ENABLED) | Autorização Vasques para LLM_REAL_ENABLED |
| PR-T8.17.P | PR-PROVA | Prova com janela curta no TEST — mensagem real → resposta real | Vasques confirma resposta correta |
| CUTOVER | OPERAÇÃO | Switch webhook Meta → Enova 2 PROD com rollback imediato | Vasques presente + rollback testado |
| PR-T8.R.2 | PR-PROVA/CLOSEOUT | Re-execução de `prove:g8-readiness` com G8 APROVADO | Todos os gates passados |

---

## §10 — Estado entregue (ESTADO ENTREGUE)

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: diagnóstico completo — 10 questões respondidas, lacunas mapeadas (LAC-IB-01..10), plano de PR-IMPL proposto, plano de cutover documentado
O que foi fechado nesta PR: diagnóstico técnico do acoplamento inbound — base para PR-IMPL T8.16
O que continua pendente: implementação do pipeline (LAC-IB-01..06), integração LLM, cutover
O que ainda não foi fechado do contrato ativo: T8 item 11 (atendimento real controlado), item 12 (G8 aprovado operacionalmente)
Recorte executado do contrato: diagnóstico técnico de aderência (item 1 da T8)
Pendência contratual remanescente: implementação do pipeline completo + cutover + G8
Houve desvio de contrato?: não — PR-DIAG é tipo explicitamente autorizado pelo contrato T8
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado? sim — próxima PR autorizada passa a ser PR-T8.16 (PR-IMPL acoplamento inbound → CRM + memória)
Esta tarefa foi fora de contrato? não — diagnóstico técnico é objetivo explícito da T8
Arquivos vivos atualizados: schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md, schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional

--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           N/A — PR-DIAG não fecha etapa
Estado da evidência:                   N/A — diagnóstico, não prova de implementação
Há lacuna remanescente?:               sim — LAC-IB-01..10 (todas remanescentes, mapeadas e documentadas)
Há item parcial/inconclusivo bloqueante?: não para o PR-DIAG em si; sim para o avanço do G8
Fechamento permitido nesta PR?:        NÃO — PR-DIAG apenas diagnostica; G8 permanece aberto
Estado permitido após esta PR:         em execução (T8 continua aberta)
Próxima PR autorizada:                 PR-T8.16 — PR-IMPL acoplamento inbound → CRM + memória (sem LLM)
```

---

## §11 — Referências de código

| Ponto de análise | Arquivo | Linha |
|---|---|---|
| Roteamento do inbound | `src/worker.ts` | ~306 |
| Handler do inbound | `src/meta/webhook.ts` | `processMetaWebhookPost()` |
| Bloqueio explícito de outbound | `src/meta/webhook.ts` | linha 259 |
| `sendMetaOutbound()` (biblioteca) | `src/meta/outbound.ts` | `sendMetaOutbound()` |
| `source: 'meta_webhook'` válido | `src/memory/routes.ts` | `VALID_SOURCES` |
| `registerMemoryEvent()` | `src/memory/service.ts` | exportada |
| Feature flags canônicas | `src/golive/flags.ts` | `readCanonicalFlags()` |
| `isOperationallyAllowed()` | `src/golive/rollback.ts` | exportada |
| `ROLLBACK_FLAG` killswitch | `src/golive/rollback.ts` | bloco 1 |
| Harness go-live | `src/golive/harness.ts` | `evaluateGoLiveReadiness()` |
| `meta_ready = false` hardcoded | `src/golive/harness.ts` | linha 46 |
