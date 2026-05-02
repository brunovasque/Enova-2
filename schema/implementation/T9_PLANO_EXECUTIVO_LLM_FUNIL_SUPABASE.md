# T9 — Plano Executivo: LLM ↔ Funil ↔ Supabase ↔ Telemetria

**Tipo:** PR-DOC / Plano de execução  
**Data:** 2026-05-01  
**Contrato:** `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`  
**Diagnóstico base:** `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md`

---

## 1. Frentes e macro-objetivos

| Frente | Macro-objetivo | PRs |
|---|---|---|
| **Runtime** | `wrangler.toml` declara todas as envs; fallback in-memory emite telemetria | T9.1, T9.2 |
| **Funil** | `runCoreEngine` chamado pelo pipeline WhatsApp; parsers L04-L17 extraem facts | T9.3, T9.4, T9.5, T9.6, T9.7 |
| **LLM** | `callLlm` recebe `LlmContext` completo; output guard valida reply | T9.8, T9.9, T9.10 |
| **Persistência** | Supabase write real ativo em PROD; state sobrevive restart | T9.11, T9.12 |
| **Telemetria** | `correlation_id` correlaciona toda pipeline ponta-a-ponta | T9.13 |
| **Closeout** | G9 fechado com evidência completa | T9.R |

---

## 2. Detalhamento de cada PR

### T9.0 — Contrato executivo T9 (esta PR)
- **Tipo:** DOC
- **Escopo:** Criar contrato + plano + handoff. Zero runtime. Zero código.
- **Entregáveis:**
  - `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`
  - `schema/implementation/T9_PLANO_EXECUTIVO_LLM_FUNIL_SUPABASE.md` (este arquivo)
  - `schema/handoffs/T9_LLM_FUNIL_SUPABASE_HANDOFF.md`
  - `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` (atualizado)
  - `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` (atualizado)

---

### T9.1 — Supabase runtime/env readiness
- **Tipo:** IMPL (infra/config)
- **Frente:** Runtime
- **Depende de:** T9.0
- **Problema:** `wrangler.toml` declara zero bindings; envs esperadas não são documentadas; sem lista canônica de secrets vs vars.
- **Escopo:**
  - Adicionar bloco `[vars]` em `wrangler.toml` com placeholders para todas as envs (sem valores reais)
  - Documentar quais são `var` (não-sensíveis) vs `secret` (via `wrangler secret put`)
  - Adicionar comentários com nomes canônicos esperados: `SUPABASE_REAL_ENABLED`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MEMORY_SUPABASE_ENABLED`, `LLM_REAL_ENABLED`, `CLIENT_REAL_ENABLED`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `OPENAI_API_KEY`, `CRM_ADMIN_KEY`, `ROLLBACK_FLAG`
  - Criar `src/runtime/env-validator.ts` — validador de envs na inicialização do Worker
- **Smoke exigido:** `smoke:runtime:env` — valida que envs esperadas estão declaradas ou com fallback seguro
- **Restrições:** Zero alteração de valores em PROD; zero secrets commitados; apenas estrutura declarativa

---

### T9.2 — Fallback guard com telemetria explícita
- **Tipo:** IMPL
- **Frente:** Runtime
- **Depende de:** T9.1
- **Problema:** Quando `SUPABASE_REAL_ENABLED !== 'true'`, o sistema cai em `CrmInMemoryBackend` silenciosamente — sem log, sem alerta, sem diferenciação em health.
- **Escopo:**
  - Em `getCrmBackend(env)` (`src/crm/store.ts:113-130`): emitir `diagLog('runtime.guard.in_memory_fallback', { module: 'crm', reason: 'flag_off' | 'envs_missing' })`
  - Em `/crm/health`: expor `persistence_mode: 'in_memory' | 'supabase_read_only' | 'supabase_full'`
  - Em `/__admin__/go-live/health`: adicionar `supabase_runtime_active: boolean`
  - Mesmo padrão para `getMemoryStore(env)` quando `MEMORY_SUPABASE_ENABLED === false`
- **Smoke exigido:** `smoke:runtime:fallback-guard` — verifica que fallback emite telemetria e health reporta modo correto

---

### T9.3 — DIAG integração Core ↔ pipeline
- **Tipo:** DIAG (read-only)
- **Frente:** Funil
- **Depende de:** T9.0
- **Objetivo:** Mapear exatamente o que `runCoreEngine` espera como input, o que produz como output e como encaixar no `canary-pipeline.ts` sem quebrar o fluxo atual.
- **Perguntas a responder:**
  1. Qual é o shape exato de `LeadState` esperado por `runCoreEngine`?
  2. O que `CoreDecision` retorna e o que o pipeline deve fazer com cada campo?
  3. Quais parsers L04–L17 são chamados por qual stage?
  4. Como `stage_current` deve ser lido do CRM antes de chamar o Core?
  5. Como `stage_after` deve ser persistido no CRM depois da decisão do Core?
  6. Qual é o contrato de chamada entre `canary-pipeline.ts` e `src/core/engine.ts`?
- **Entregável:** `schema/diagnostics/T9_CORE_PIPELINE_INTEGRACAO_DIAG.md`

---

### T9.4 — IMPL chamada runCoreEngine no canary-pipeline
- **Tipo:** IMPL
- **Frente:** Funil
- **Depende de:** T9.3
- **Problema:** `src/meta/canary-pipeline.ts` nunca chama `runCoreEngine`. BLK-01.
- **Escopo:**
  - Importar `runCoreEngine` de `src/core/engine.ts` em `canary-pipeline.ts`
  - Antes de `callLlm`: ler `stage_current` do CRM via `readLeadState` + construir `LeadState` mínimo
  - Chamar `runCoreEngine(state)` → `CoreDecision`
  - Persistir `stage_after` em `CrmLeadState.stage_current` (via CRM service)
  - Passar `CoreDecision.speech_intent` e `stage_after` para o próximo passo (LLM, em T9.8)
  - Gate: chamada ao Core só roda quando `ENOVA2_ENABLED=true` (preserva rollback)
- **Smoke exigido:** `smoke:meta:core-pipeline` — verifica que Core é chamado e `stage_current` é atualizado
- **Restrições:** LLM ainda recebe só `text_body` nesta PR (LlmContext vem em T9.8); não altera outbound

---

### T9.5 — PROVA stage_current persiste entre turnos
- **Tipo:** PROVA
- **Frente:** Funil
- **Depende de:** T9.4
- **Objetivo:** Provar que após dois turnos reais, `CrmLeadState.stage_current` reflete o stage correto e não é `'unknown'`.
- **Escopo:**
  - `src/meta/core-stage-proof.ts` — harness dual-mode
  - Sem credenciais: smokes locais PASS, fases reais SKIP (exit 0)
  - Com credenciais + `CORE_STAGE_PROOF_ENABLED=true`: POST dois turnos ao Worker TEST, verifica que `stage_current !== 'unknown'` após o segundo turno
  - Entregável: `schema/proofs/T9_CORE_STAGE_PERSISTENCIA.md`
- **Critério de aceite:** `stage_current` não é `'unknown'` após turno com texto de discovery

---

### T9.6 — IMPL parsers L04–L17 chamados com texto real
- **Tipo:** IMPL
- **Frente:** Funil
- **Depende de:** T9.5
- **Problema:** Parsers L04–L17 existem e funcionam via `runCoreEngine`, mas `runCoreEngine` precisa receber `raw_text` do WhatsApp para que os parsers extraiam facts. BLK-03.
- **Escopo:**
  - Verificar que `runCoreEngine` já chama os parsers internamente com `state.raw_text`
  - Garantir que `canary-pipeline.ts` passa `raw_text` no `LeadState` para o Core
  - Verificar que `facts_extracted` de cada turno é preservado no `CrmLeadState.facts`
  - Adicionar log de facts extraídos por turno (sem expor dados sensíveis)
- **Smoke exigido:** `smoke:meta:parsers-facts` — verifica que texto de qualificação retorna facts não-vazios

---

### T9.7 — PROVA facts extraídos e stage avança
- **Tipo:** PROVA
- **Frente:** Funil
- **Depende de:** T9.6
- **Objetivo:** Provar que texto de qualificação real extrai facts e avança stage.
- **Escopo:**
  - `src/meta/facts-proof.ts` — harness dual-mode
  - Prova: turno com "sou casado, moro em São Paulo, renda 3000" → `facts.estado_civil`, `facts.cidade`, `facts.renda` não-vazios
  - Prova: após turno de discovery completo, `stage_current` avança para `qualification_civil`
  - Entregável: `schema/proofs/T9_FACTS_EXTRAIDOS_STAGE_AVANCO.md`

---

### T9.8 — IMPL LLM recebe LlmContext estruturado
- **Tipo:** IMPL
- **Frente:** LLM
- **Depende de:** T9.7
- **Problema:** `callLlm(text_body)` recebe apenas mensagem atual. BLK-04.
- **Escopo:**
  - Criar `src/llm/context.ts` — interface `LlmContext`:
    ```typescript
    interface LlmContext {
      stage: StageId;
      next_objective: string;
      speech_intent: 'coleta_dado' | 'transicao_stage' | 'bloqueio';
      recent_turns: Array<{ role: 'user' | 'assistant'; content: string }>;
      facts: Record<string, unknown>;
      rules: string[];
      message: string;
    }
    ```
  - Atualizar `callLlm(context: LlmContext, env)` em `src/llm/client.ts` — montar system prompt dinâmico com stage + next_objective + regras MCMV
  - Atualizar `canary-pipeline.ts` para construir `LlmContext` a partir de `CoreDecision` + histórico CRM
  - Histórico: últimos 3 turnos brutos + facts atuais (ponto de partida; ajustável via smoke)
- **Smoke exigido:** `smoke:llm:context` — verifica que LlmContext é construído corretamente e callLlm não quebra

---

### T9.9 — IMPL output guard LLM
- **Tipo:** IMPL
- **Frente:** LLM
- **Depende de:** T9.8
- **Problema:** LLM pode prometer aprovação de financiamento, falar de stage futuro ou revelar regras internas — sem nenhuma validação.
- **Escopo:**
  - Criar `src/llm/output-guard.ts`:
    - `validateReply(stage, decision, reply_text): GuardResult`
    - Hard-fail: promessa de aprovação MCMV → `{ ok: false, reason: 'approval_promise', action: 'block' }` → fallback genérico + `learning_candidate`
    - Soft-fail: mudança de assunto não autorizada → `{ ok: false, reason: 'topic_change', action: 'warn' }` → `learning_candidate` sem bloquear
    - Pass-through: reply válido → `{ ok: true }`
  - Integrar no `canary-pipeline.ts` entre LLM e outbound
  - `src/llm/output-guard-smoke.ts` — `smoke:llm:output-guard`
- **Entregável:** `src/llm/output-guard.ts` com smoke **≥ 10 cases**

---

### T9.10 — PROVA conversa real 5+ turnos com Vasques
- **Tipo:** PROVA
- **Frente:** LLM/funil
- **Depende de:** T9.9
- **Objetivo:** Provar que uma conversa real de 5+ turnos com Vasques avança de `discovery` → `qualification_civil` → `qualification_renda` com LLM ciente do contexto em cada turno.
- **Escopo:**
  - `src/meta/funil-llm-real-proof.ts` — harness dual-mode (sem creds: SKIP gracioso)
  - Com `FUNIL_LLM_PROOF_ENABLED=true` + credenciais reais: executa 5 turnos simulados via Worker PROD
  - Verifica: stage avança, LLM responde de acordo com `next_objective`, output guard não bloqueia falsamente
  - Entregável: `schema/proofs/T9_FUNIL_LLM_CONVERSA_REAL.md`

---

### T9.11 — IMPL Supabase write real (CRM/stage/override)
- **Tipo:** IMPL
- **Frente:** Persistência
- **Depende de:** T9.2, T9.5
- **Problema:** `SupabaseCrmBackend` implementa apenas leitura. Toda escrita vai para `writeBuffer` in-memory. BLK-02 (parcial) + BLK-05.
- **Escopo:**
  - Implementar escrita real em `src/supabase/crm-store.ts`:
    - `addLead` / `updateLead` → INSERT/UPDATE `crm_lead_meta`
    - Persist `stage_current` → UPSERT `enova_state`
    - `addOverride` → INSERT `crm_override_log`
  - Feature flag: `SUPABASE_WRITE_ENABLED=true` (adicional ao `SUPABASE_REAL_ENABLED`)
  - Timeout + fallback in-memory se Supabase não responder em 2s (com telemetria do fallback)
  - Zero ALTER TABLE, zero DROP, zero DELETE — apenas INSERT/UPDATE/UPSERT em tabelas existentes
- **Smoke exigido:** `smoke:supabase:write` — verifica INSERT/UPSERT via flag ativa

---

### T9.12 — PROVA persistência sobrevive restart
- **Tipo:** PROVA
- **Frente:** Persistência
- **Depende de:** T9.11
- **Objetivo:** Provar que stage e lead sobrevivem a um deploy (restart do Worker).
- **Escopo:**
  - `src/supabase/write-real-proof.ts` — harness dual-mode
  - Sequência: POST turno → verificar Supabase → `wrangler deploy` (restart) → novo POST → verificar que `stage_current` é o mesmo de antes do restart
  - Entregável: `schema/proofs/T9_PERSISTENCIA_SOBREVIVE_RESTART.md`

---

### T9.13 — IMPL telemetria ponta-a-ponta (correlation_id)
- **Tipo:** IMPL
- **Frente:** Observabilidade
- **Depende de:** T9.10
- **Problema:** Logs de `wrangler tail` existem, mas não correlacionam wa_id → lead_id → core_decision_id → llm_call_id → outbound_id.
- **Escopo:**
  - Injetar `correlation_id = wa_message_id` no contexto de cada request
  - Propagar `correlation_id` para todos os `diagLog` em webhook, pipeline, Core, LLM, outbound
  - Log estruturado: `{ correlation_id, wa_id_masked, lead_id, stage_before, stage_after, llm_invoked, outbound_attempted }`
  - `src/meta/telemetry-smoke.ts` — `smoke:telemetry`
- **Entregável:** `src/meta/telemetry.ts` (correlation context) + smoke

---

### T9.R — Closeout G9 frente Funil-LLM-Persistência
- **Tipo:** CLOSEOUT
- **Frente:** Governança
- **Depende de:** T9.12, T9.13
- **Objetivo:** Fechar formalmente a frente T9.
- **Escopo:**
  - `src/golive/closeout-smoke.ts`: adicionar seção G9 com todos os critérios G9-01..G9-10
  - `schema/proofs/T9_G9_FUNIL_LLM_PERSISTENCIA_CLOSEOUT.md`: evidência completa
  - `src/golive/harness.ts`: atualizar `g9_allowed` quando todos os critérios atendidos
  - Smoke `prove:g9-readiness` **10/10 PASS**
  - Vasques confirma em conversa real (G9-10)

---

## 3. Arquivos a criar (T9 completa)

### Código
| Arquivo | Criado em | Descrição |
|---|---|---|
| `src/runtime/env-validator.ts` | T9.1 | Validador de envs na inicialização |
| `src/llm/context.ts` | T9.8 | Interface LlmContext |
| `src/llm/output-guard.ts` | T9.9 | Validador de reply LLM |
| `src/meta/telemetry.ts` | T9.13 | Correlation context |

### Arquivos modificados
| Arquivo | Modificado em | Mudança |
|---|---|---|
| `wrangler.toml` | T9.1 | Bloco `[vars]` com envs declaradas |
| `src/crm/store.ts` | T9.2 | Telemetria em fallback |
| `src/meta/canary-pipeline.ts` | T9.4, T9.8 | Chamar Core + LlmContext |
| `src/llm/client.ts` | T9.8 | Receber LlmContext |
| `src/supabase/crm-store.ts` | T9.11 | Writes reais |
| `src/golive/harness.ts` | T9.R | g9_allowed |
| `src/golive/closeout-smoke.ts` | T9.R | Seção G9 |

### Documentos
| Arquivo | Criado em |
|---|---|
| `schema/diagnostics/T9_CORE_PIPELINE_INTEGRACAO_DIAG.md` | T9.3 |
| `schema/proofs/T9_CORE_STAGE_PERSISTENCIA.md` | T9.5 |
| `schema/proofs/T9_FACTS_EXTRAIDOS_STAGE_AVANCO.md` | T9.7 |
| `schema/proofs/T9_FUNIL_LLM_CONVERSA_REAL.md` | T9.10 |
| `schema/proofs/T9_PERSISTENCIA_SOBREVIVE_RESTART.md` | T9.12 |
| `schema/proofs/T9_G9_FUNIL_LLM_PERSISTENCIA_CLOSEOUT.md` | T9.R |

---

## 4. Smoke mínimo por PR

| PR | Smoke | Mínimo exigido |
|---|---|---|
| T9.1 | `smoke:runtime:env` | PASS |
| T9.2 | `smoke:runtime:fallback-guard` | PASS |
| T9.4 | `smoke:meta:core-pipeline` | PASS |
| T9.5 | `prove:core-stage` | PASS (dual-mode) |
| T9.6 | `smoke:meta:parsers-facts` | PASS |
| T9.7 | `prove:facts-stage` | PASS (dual-mode) |
| T9.8 | `smoke:llm:context` | PASS |
| T9.9 | `smoke:llm:output-guard` | ≥10 PASS |
| T9.10 | `prove:funil-llm-real` | PASS (dual-mode) |
| T9.11 | `smoke:supabase:write` | PASS |
| T9.12 | `prove:supabase-restart` | PASS (dual-mode) |
| T9.13 | `smoke:telemetry` | PASS |
| T9.R | `prove:g9-readiness` | 10/10 PASS |

Todas as PRs também devem verificar retrocompatibilidade:
- `smoke:meta:canary` 41/41 PASS
- `smoke:meta:webhook` 20/20 PASS
- `smoke:meta:pipeline` 26/26 PASS
- `prove:g8-readiness` 7/7 PASS (G8 não pode regredir)
