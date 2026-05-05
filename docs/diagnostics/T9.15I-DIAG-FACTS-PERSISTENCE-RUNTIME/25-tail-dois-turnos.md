# Diagnóstico T9.15I — 25 — wrangler tail dois turnos (T9.15H persistência cross-turn)
# Capturado: 2026-05-04 22:49–22:51 BRT
# Worker: nv-enova-2
# Duração tail: 90s
# Branch ativa em PROD: fix/t9.15i-facts-persistence-telemetry (commit e68d035, PR #237)
# Objetivo: verificar se facts do turno 1 chegam ao Core no turno 2 (T9.15H cross-turn)

---

## Conversa executada

- **Turno 1 (22:49:28):** "Tenho interesse no MCMV"
- **Turno 2 (22:51:02):** "Bruno Vasques"

---

## ⚠️ CONCLUSÃO PRINCIPAL

**T9.15H NÃO funciona em PROD.**

- Turno 1: extrai `customer_goal`, write falha (pg_code=22P02), fact não persiste
- Turno 2: `facts_persistence.read` retorna `persisted_count=0` (esperado: 1)
- Turno 2: `core.facts_received` recebe `facts_count=1, fact_keys=["nome_completo"]` (esperado: 2, com `customer_goal` do turno 1)

**Bug raiz:** `crmResult.lead_id = "554185260518"` (wa_id, número de telefone). `enova_state.lead_id` é coluna UUID. Supabase rejeita com `pg_code=22P02`.

---

## Output raw — Turno 1 (22:49:28)

```
POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:49:28
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":584,"prod_marker":true}
  (log) {"diag":"meta.prod.webhook.signature","ok":true,"reason":null}
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"message","wa_id_masked":"554****518","phone_number_id_masked":"766****780","message_id_masked":"wam****AA=","message_type":"text","text_present":true}
  (log) {"diag":"meta.prod.flags.snapshot","ENOVA2_ENABLED":true,"CHANNEL_ENABLED":true,"META_OUTBOUND_ENABLED":true,"LLM_REAL_ENABLED":true,"OUTBOUND_CANARY_ENABLED":true,"CLIENT_REAL_ENABLED":false,"ROLLBACK_FLAG":false,"MAINTENANCE_MODE":false,"OUTBOUND_CANARY_WA_ID_present":true,"OUTBOUND_CANARY_WA_ID_masked":"554****518"}
  (log) {"diag":"meta.prod.dedupe","duplicate":false,"message_id_masked":"wam****AA="}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,"lead_id_present":true,"turn_id_present":true,"memory_event_id_present":true,"errors_count":0}
  (log) {"diag":"facts_persistence.read","ok":true,"persisted_count":0,"persisted_keys":[],"lead_id_present":true}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["customer_goal"],"persisted_facts_count":0,"persisted_fact_keys":[]}
  (log) {"diag":"short_memory.built","turns_total":1,"turns_included":0}
  (log) {"diag":"core.facts_received","facts_count":1,"fact_keys":["customer_goal"],"stage_current":"discovery"}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["customer_goal"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777945771041-ru3aw"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":148,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":186,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":186,"latency_ms":1630,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":6690}
```

---

## Output raw — Status events (22:49:35, entre turnos)

```
POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:49:35
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"status","wa_id_masked":"554****518","message_type":null,"text_present":false}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"crm_memory_only","llm_invoked":false,"reply_text_present":false,"outbound_attempted":false,"external_dispatch":false,"canary_block_reason":"no_pipeline_ran","client_block_reason":"client_real_disabled","total_latency_ms":0}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:49:35
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"status","wa_id_masked":"554****518","message_type":null,"text_present":false}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"crm_memory_only","llm_invoked":false,...}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:50:59
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"status","wa_id_masked":"554****518","message_type":null,"text_present":false}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"crm_memory_only","llm_invoked":false,...}
```

---

## Output raw — Turno 2 (22:51:02)

```
POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:51:02
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":574,"prod_marker":true}
  (log) {"diag":"meta.prod.webhook.signature","ok":true,"reason":null}
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"message","wa_id_masked":"554****518","phone_number_id_masked":"766****780","message_id_masked":"wam****QA=","message_type":"text","text_present":true}
  (log) {"diag":"meta.prod.flags.snapshot","ENOVA2_ENABLED":true,"CHANNEL_ENABLED":true,"META_OUTBOUND_ENABLED":true,"LLM_REAL_ENABLED":true,"OUTBOUND_CANARY_ENABLED":true,"CLIENT_REAL_ENABLED":false,"ROLLBACK_FLAG":false,"MAINTENANCE_MODE":false,"OUTBOUND_CANARY_WA_ID_present":true,"OUTBOUND_CANARY_WA_ID_masked":"554****518"}
  (log) {"diag":"meta.prod.dedupe","duplicate":false,"message_id_masked":"wam****QA="}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,"lead_id_present":true,"turn_id_present":true,"memory_event_id_present":true,"errors_count":0}
  (log) {"diag":"facts_persistence.read","ok":true,"persisted_count":0,"persisted_keys":[],"lead_id_present":true}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["nome_completo"],"persisted_facts_count":0,"persisted_fact_keys":[]}
  (log) {"diag":"short_memory.built","turns_total":1,"turns_included":0}
  (log) {"diag":"core.facts_received","facts_count":1,"fact_keys":["nome_completo"],"stage_current":"discovery"}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["nome_completo"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777945864723-0x4z8"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":85,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":129,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":129,"latency_ms":1435,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":5412}
```

---

## Análise cross-turn

### Turno 1 — "Tenho interesse no MCMV"

| Evento | Valor | Interpretação |
|--------|-------|---------------|
| `facts_persistence.read` | persisted_count=0 | Correto (primeiro turno) |
| `text_extractor.result` | facts_extracted_count=1, fact_keys=["customer_goal"] | LLM extraiu customer_goal |
| `core.facts_received` | facts_count=1, fact_keys=["customer_goal"] | Core recebeu 1 fact |
| `facts_persistence.write` | ok=false, error=pg_code=22P02 | **BUG T9.15J: write falhou** |
| `core.decision` | stage_after=discovery, block_advance=true | Stage não avançou |

### Turno 2 — "Bruno Vasques"

| Evento | Valor | Interpretação |
|--------|-------|---------------|
| `facts_persistence.read` | persisted_count=0 | **BUG T9.15J confirmado: turno 1 não persistiu** |
| `text_extractor.result` | facts_extracted_count=1, fact_keys=["nome_completo"] | LLM extraiu nome |
| `core.facts_received` | facts_count=1, fact_keys=["nome_completo"] | **Esperado: 2 facts (customer_goal + nome_completo)** |
| `facts_persistence.write` | ok=false, error=pg_code=22P02 | **BUG T9.15J: write falhou novamente** |
| `core.decision` | stage_after=discovery, block_advance=true | Stage não avançou |

---

## Prova do bug T9.15J

### O que deveria acontecer (T9.15H funcionando)

```
Turno 2 — core.facts_received esperado:
{"facts_count":2,"fact_keys":["customer_goal","nome_completo"],"stage_current":"discovery"}
```

### O que acontece em PROD

```
Turno 2 — core.facts_received real:
{"facts_count":1,"fact_keys":["nome_completo"],"stage_current":"discovery"}
```

**`customer_goal` do turno 1 não chegou ao turno 2. T9.15H não funciona.**

### Causa raiz

```
facts_persistence.write — turno 1:
{"ok":false,"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
```

`crmResult.lead_id` em PROD = `"554185260518"` (wa_id / número de telefone).
`enova_state.lead_id` é coluna UUID no Postgres.
Supabase rejeita o upsert: `invalid input syntax for type uuid`.

---

## Estado de produção confirmado por este tail

| Componente | Status |
|------------|--------|
| Webhook recepção | ✅ ok |
| Assinatura WhatsApp | ✅ ok |
| CRM (lead criado) | ✅ ok |
| LLM invocado | ✅ ok |
| Outbound (resposta enviada) | ✅ ok |
| Facts extraction (LLM extrai facts) | ✅ ok |
| Facts persistence write (T9.15H) | ❌ 100% falha (pg_code=22P02) |
| Facts persistence read (T9.15H) | ❌ 100% vazio (write nunca persistiu) |
| Core recebe facts cross-turn | ❌ 0 facts do turno anterior |
| Stage advancement | ❌ bloqueado (facts incompletos) |

---

## Próximo passo

**T9.15J — Fix lead_id para UUID em PROD**

Raiz a investigar em `src/meta/canary-pipeline.ts`: de onde vem `crmResult.lead_id` e como substituí-lo por UUID real.

Opções:
1. `runInboundPipeline` retorna `enova_state.id` (UUID gerado pelo Supabase) como `lead_id`
2. `readLeadAccumulatedFacts` / `writeLeadAccumulatedFacts` usam `wa_id` como chave (sem depender de `lead_id`)
