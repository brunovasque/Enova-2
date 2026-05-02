# Mapa de Conexões — LLM ↔ Funil ↔ CRM ↔ Supabase

**Tipo:** PR-DIAG / READ-ONLY (anexo)  
**Data:** 2026-05-01  
**Documento principal:** `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md`

> Este documento é um anexo visual do diagnóstico principal — mostra graficamente onde os módulos se ligam e onde estão desconectados.

---

## 1. Estado atual (PROD 2026-05-01)

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  WhatsApp PROD                                                    │
│       │                                                           │
│       ↓                                                           │
│  POST /__meta__/webhook                                           │
│       │                                                           │
│       ↓                                                           │
│  ┌────────────────────┐                                           │
│  │ src/meta/webhook.ts│  signature + parser + dedupe              │
│  └─────────┬──────────┘                                           │
│            │                                                      │
│            ↓                                                      │
│  ┌────────────────────────────┐                                   │
│  │ src/meta/canary-pipeline.ts│                                   │
│  └────────┬───────────────────┘                                   │
│           │                                                       │
│      ┌────┴─────┐                                                 │
│      ↓          ↓                                                 │
│  ┌────────────┐ ┌────────────────┐                                │
│  │ pipeline.ts│ │ src/llm/client │                                │
│  │ (CRM+mem)  │ │ callLlm        │← apenas text_body              │
│  └─────┬──────┘ └───────┬────────┘                                │
│        │                │                                         │
│        ↓                ↓                                         │
│  ┌──────────────┐  ┌─────────────────┐                            │
│  │ in-memory    │  │ OpenAI gpt-4o-  │                            │
│  │ CrmBackend   │  │ mini            │                            │
│  │ MemoryStore  │  └─────────────────┘                            │
│  │ (FIFO 5000)  │                                                 │
│  └──────────────┘                                                 │
│                                                                   │
│  ⛔ src/core/engine.ts (runCoreEngine)                            │
│     └ chamado APENAS por POST /__core__/run (rota técnica)        │
│     └ NUNCA chamado pelo pipeline WhatsApp                        │
│                                                                   │
│  ⛔ src/context/{schema,living-memory,multi-signal}.ts            │
│     └ NUNCA chamado por ninguém                                   │
│                                                                   │
│  ⛔ src/supabase/crm-store.ts                                      │
│     └ código existe, flag SUPABASE_REAL_ENABLED não setada PROD   │
│     └ getCrmBackend retorna in-memory silenciosamente             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Estado proposto (após T9 fechado)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  WhatsApp PROD                                                       │
│       │                                                              │
│       ↓                                                              │
│  POST /__meta__/webhook                                              │
│       │                                                              │
│       ↓                                                              │
│  webhook.ts                                                          │
│       │                                                              │
│       ↓                                                              │
│  canary-pipeline.ts                                                  │
│       │                                                              │
│       ├──→ pipeline.ts                                               │
│       │     └─ upsertLeadByPhone(wa_id) → lead_id                    │
│       │     └─ createConversationTurn(lead_id, raw_text)             │
│       │     └─ registerMemoryEvent(attendance_memory)                │
│       │     └─ readLeadState(lead_id) → CrmLeadState                 │
│       │     └─ readRecentTurns(lead_id, n=5)                         │
│       │     └─ readRecentMemory(lead_id, ['attendance','commercial'])│
│       │                                                              │
│       ├──→ src/core/engine.ts                                        │
│       │     └─ extract*Signals(stage_current, raw_text)              │
│       │     └─ evaluate*Criteria → CoreDecision                      │
│       │         (stage_after, next_objective, gates_activated)       │
│       │     └─ persist CrmLeadState.stage_current                    │
│       │                                                              │
│       ├──→ src/context/living-memory.ts                              │
│       │     └─ build LivingMemorySnapshot(lead, turns, memory)       │
│       │                                                              │
│       ├──→ src/llm/client.ts                                         │
│       │     └─ callLlm(LlmContext{                                   │
│       │           stage: 'qualification_civil',                      │
│       │           next_objective: 'coletar_estado_civil',            │
│       │           speech_intent: 'coleta_dado',                      │
│       │           snapshot: LivingMemorySnapshot,                    │
│       │           message: text_body,                                │
│       │           rules: ['mcmv_no_promise','mcmv_no_approval']      │
│       │         })                                                   │
│       │                                                              │
│       ├──→ src/llm/output-guard.ts (NOVO)                            │
│       │     └─ valida reply_text contra:                             │
│       │         - promessa de aprovação                              │
│       │         - mudança de stage não autorizada                    │
│       │         - revelação de regra interna                         │
│       │     └─ se viola → reply genérico de fallback + alert         │
│       │                                                              │
│       └──→ outbound.ts                                               │
│             └─ sendMetaOutbound (mantém gates atuais)                │
│                                                                      │
│  ✅ src/supabase/crm-store.ts ativo em PROD                          │
│     └ SUPABASE_REAL_ENABLED=true + SUPABASE_URL + SERVICE_ROLE_KEY   │
│     └ writes reais em crm_lead_meta, enova_state, crm_override_log   │
│     └ stage e memória sobrevivem ao restart                          │
│                                                                      │
│  ✅ Telemetria ponta-a-ponta                                          │
│     └ trace_id correlaciona wa_id → lead_id → core_decision_id →     │
│       llm_call_id → outbound_message_id                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pontos críticos de conexão a criar

| Conexão | De → Para | Criada por | Formato esperado |
|---|---|---|---|
| pipeline → Core | `canary-pipeline.ts` chama `runCoreEngine(state)` | T9.4 | Input: `LeadState{lead_id, current_stage, facts}` |
| Core → CrmLeadState | `runCoreEngine` produz `CoreDecision`; pipeline persiste | T9.4 | `stage_after`, `next_objective`, `block_advance` |
| Parsers → texto WhatsApp | `extract*Signals` recebe `raw_text` por stage | T9.6 | `facts_extracted` |
| LLM ← contexto | `callLlm(LlmContext)` em vez de `callLlm(string)` | T9.8 | `LlmContext` interface nova |
| LLM → guard | reply_text passa por `validateReply(stage, decision, reply)` | T9.9 | guard fail → fallback message |
| CRM/memória → Supabase | `getCrmBackend` ativo com flag ON | T9.11 | writes reais |
| Telemetria correlation | `trace_id` injetado em todo log | T9.13 | `correlation_id == wa_message_id` |

---

## 4. Pontos onde o estado precisa persistir

| Estado | Hoje | Após T9 |
|---|---|---|
| Lead | in-memory Map | Supabase `crm_lead_meta` |
| Stage atual | `'unknown'` literal | `enova_state.stage_current` (Supabase) |
| Facts coletados | nunca extraídos | `enova_state` JSONB |
| Memória attendance | FIFO 5000 in-memory | Supabase ou KV (decisão futura) |
| Override log | in-memory | Supabase `crm_override_log` |
| Dedupe Meta | FIFO 1000 in-memory | Aceitável manter (perda OK) |
| Sessão LLM | n/a | n/a (stateless OK) |

---

## 5. Pontos invariantes (não mexer)

| Invariante | Onde | Por quê |
|---|---|---|
| `ROLLBACK_FLAG=true` bloqueia tudo | `canary-pipeline.ts:158-162,229-231` | Soberania de rollback |
| `CLIENT_REAL_ENABLED=true` exigido para outbound amplo | `canary-pipeline.ts:233-240` | Bloqueio cliente real |
| LLM nunca decide stage | invariante doutrinária | Adendo soberania IA |
| Mecânico nunca gera fala | invariante doutrinária | Adendo soberania IA |
| Secrets nunca em log/error/response | `src/memory/sanitize.ts` + práticas | Segurança |
| `META_APP_SECRET` valida assinatura ANTES de parse | `webhook.ts:174-201` | Segurança Meta |

---

## 6. Resumo executivo do mapa

- **2 sistemas no mesmo repo, isolados em runtime:** pipeline WhatsApp e Core mecânico.
- **3 lugares onde nada chega a Supabase real:** CRM, memória, override log — todos com flag desligada em PROD.
- **6 conexões críticas a criar** (tabela §3).
- **7 invariantes a preservar** (tabela §5).
- **Estimativa:** 13 micro-PRs entre IMPL/PROVA/DIAG (plano em §15 do documento principal).
