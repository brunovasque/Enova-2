# T8 — PR-DIAG — Telemetria cirúrgica: POST /__meta__/webhook → outbound PROD

**Tipo:** PR-DIAG  
**Data:** 2026-05-01  
**Branch:** `diag/t8-prod-webhook-outbound-telemetry`  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`

---

## Contexto

PROD `nv-enova-2` recebeu GET challenge (OK) e POST `/__meta__/webhook` (OK).  
A resposta WhatsApp não chegou ao número canary.  
Causa exata desconhecida. Esta PR instrumenta o caminho completo para diagnóstico.

---

## Problema identificado antes da PR

A telemetria existente (`emitTelemetry`) vai para buffer em memória — **não aparece no `wrangler tail`**.  
O `wrangler tail` mostra apenas `console.log`, exceções não tratadas e logs de rota.  
Portanto, a causa do bloqueio era opaca: não havia como saber em qual gate o fluxo parava.

---

## Solução implementada

### Novo arquivo: `src/meta/prod-diag.ts`

Helper com dois exports:
- `maskId(id)` — mascaramento seguro de IDs (wa_id, phone_number_id, message_id)
- `diagLog(action, details)` — `console.log(JSON.stringify({diag: action, ...details}))` visível no wrangler tail

### Logs adicionados — 11 pontos cirúrgicos

Todos os logs seguem o formato:
```
{"diag":"<action>", <campos>}
```

#### Log 1 — `meta.prod.webhook.received`
**Arquivo:** `src/meta/webhook.ts` — início de `processMetaWebhookPost`
```json
{
  "diag": "meta.prod.webhook.received",
  "method": "POST",
  "pathname": "/__meta__/webhook",
  "has_signature": true,
  "body_size": 412,
  "prod_marker": true
}
```

#### Log 2 — `meta.prod.webhook.signature`
**Arquivo:** `src/meta/webhook.ts` — após `verifyMetaSignature`
```json
{
  "diag": "meta.prod.webhook.signature",
  "ok": true,
  "reason": null
}
```
Se falhar: `ok: false, reason: "signature_mismatch"` (ou outro motivo)

#### Log 3 — `meta.prod.webhook.parsed`
**Arquivo:** `src/meta/webhook.ts` — após `parseMetaWebhookPayload`
```json
{
  "diag": "meta.prod.webhook.parsed",
  "accepted": true,
  "reason": null,
  "events_count": 1,
  "event_kind": "message",
  "wa_id_masked": "551****099",
  "phone_number_id_masked": "120****789",
  "message_id_masked": "wam****xyz",
  "message_type": "text",
  "text_present": true
}
```

#### Log 4 — `meta.prod.dedupe`
**Arquivo:** `src/meta/webhook.ts` — por evento no loop
```json
{
  "diag": "meta.prod.dedupe",
  "duplicate": false,
  "message_id_masked": "wam****xyz"
}
```

#### Log 5 — `meta.prod.flags.snapshot`
**Arquivo:** `src/meta/webhook.ts` — uma vez por request, antes do loop
```json
{
  "diag": "meta.prod.flags.snapshot",
  "ENOVA2_ENABLED": true,
  "CHANNEL_ENABLED": true,
  "META_OUTBOUND_ENABLED": true,
  "LLM_REAL_ENABLED": true,
  "OUTBOUND_CANARY_ENABLED": true,
  "CLIENT_REAL_ENABLED": false,
  "ROLLBACK_FLAG": false,
  "MAINTENANCE_MODE": false,
  "OUTBOUND_CANARY_WA_ID_present": true,
  "OUTBOUND_CANARY_WA_ID_masked": "551****099"
}
```
**Este log é o mais diagnóstico:** se `OUTBOUND_CANARY_WA_ID_present: false` ou `ROLLBACK_FLAG: true`, o bloqueio é aqui.

#### Log 6 — `meta.prod.pipeline.result`
**Arquivo:** `src/meta/canary-pipeline.ts` — após `runInboundPipeline`
```json
{
  "diag": "meta.prod.pipeline.result",
  "crm_ok": true,
  "lead_id_present": true,
  "turn_id_present": true,
  "memory_event_id_present": true,
  "errors_count": 0
}
```

#### Log 7 — `meta.prod.llm.gate`
**Arquivo:** `src/meta/canary-pipeline.ts` — antes dos branches LLM
```json
{
  "diag": "meta.prod.llm.gate",
  "allowed": true,
  "block_reason": null,
  "llm_invoked": true
}
```
Se bloqueado: `allowed: false, block_reason: "llm_disabled"` (ou `rollback_active`, `maintenance_active`, `llm_no_text`)

#### Log 8 — `meta.prod.llm.result`
**Arquivo:** `src/meta/canary-pipeline.ts` — após chamada LLM (sucesso ou falha)
```json
{
  "diag": "meta.prod.llm.result",
  "success": true,
  "reply_text_present": true,
  "reply_text_length": 87,
  "latency_ms": 1240,
  "error_type": null
}
```
Se falhar: `success: false, error_type: "llm_api_error_401"` (sem secret)

#### Log 9 — `meta.prod.outbound.gate`
**Arquivo:** `src/meta/canary-pipeline.ts` — após gate canary cascade
```json
{
  "diag": "meta.prod.outbound.gate",
  "allowed": true,
  "block_reason": null,
  "wa_id_masked": "551****099",
  "canary_allowed": true,
  "client_real_allowed": false,
  "wa_matches_canary": true,
  "outbound_attempted": true
}
```
Se bloqueado: `allowed: false, block_reason: "wa_not_allowed"` → wa_id inbound ≠ OUTBOUND_CANARY_WA_ID

#### Log 10 — `meta.prod.outbound.result`
**Arquivo:** `src/meta/canary-pipeline.ts` — após `sendMetaOutbound`
```json
{
  "diag": "meta.prod.outbound.result",
  "attempted": true,
  "external_dispatch": true,
  "meta_status": 200,
  "message_id_present": true,
  "error_type": null,
  "error_body_sanitized": null
}
```
Se Meta recusar: `external_dispatch: false, meta_status: 401, error_body_sanitized: "...corpo curto..."` (sem tokens)

#### Log 11 — `meta.prod.webhook.final`
**Arquivo:** `src/meta/webhook.ts` — ao final de `processMetaWebhookPost`
```json
{
  "diag": "meta.prod.webhook.final",
  "http_status": 200,
  "mode": "canary_llm_outbound",
  "llm_invoked": true,
  "reply_text_present": true,
  "outbound_attempted": true,
  "external_dispatch": true,
  "canary_block_reason": null,
  "client_block_reason": "client_real_disabled",
  "total_latency_ms": 1850
}
```

---

## Árvore de diagnóstico após deploy

Ao enviar mensagem real no WhatsApp e observar `wrangler tail nv-enova-2`:

```
Log 1 recebido?
  NÃO → POST não chegou no Worker (problema de webhook Meta ou deploy PROD)
  SIM ↓

Log 2: ok=true?
  NÃO → META_APP_SECRET errado no PROD (secret não configurado ou valor incorreto)
  SIM ↓

Log 3: accepted=true, text_present=true?
  NÃO → payload malformado ou mensagem de status (não de texto)
  SIM ↓

Log 4: duplicate=false?
  SIM (=false) ↓  (se duplicate=true, mensagem já foi processada antes)

Log 5: ver flags
  ROLLBACK_FLAG=true → bloqueia tudo → setar false no dashboard
  LLM_REAL_ENABLED=false → LLM não chamado → setar true no dashboard
  OUTBOUND_CANARY_WA_ID_present=false → canary WA ID não configurado → setar secret
  OUTBOUND_CANARY_ENABLED=false → outbound bloqueado → setar true no dashboard
  ↓ tudo true ↓

Log 7: allowed=true?
  NÃO → block_reason revela o gate exato
  SIM ↓

Log 8: success=true, reply_text_present=true?
  NÃO → error_type revela: key missing, API error (status), empty response
  SIM ↓

Log 9: allowed=true, wa_matches_canary=true?
  NÃO → block_reason: wa_not_allowed → wa_id inbound ≠ OUTBOUND_CANARY_WA_ID
         Verificar: número enviando ≠ número no secret OUTBOUND_CANARY_WA_ID
  SIM ↓

Log 10: external_dispatch=true?
  NÃO → meta_status + error_body_sanitized → problema na Graph API
         meta_status=401 → META_ACCESS_TOKEN inválido/expirado
         meta_status=400 → payload malformado (phone_number_id errado?)
  SIM → mensagem enviada para Meta com sucesso
         → problema pode estar no WhatsApp do destinatário
```

---

## Regras de segurança cumpridas

| Regra | Status |
|---|---|
| META_ACCESS_TOKEN nunca em log | ✅ |
| OPENAI_API_KEY nunca em log | ✅ |
| META_APP_SECRET nunca em log | ✅ |
| wa_id mascarado | ✅ `maskId()` |
| phone_number_id mascarado | ✅ `maskId()` |
| message_id mascarado | ✅ `maskId()` |
| error_body_sanitized limitado a 120 chars | ✅ |
| Nenhuma regra de negócio alterada | ✅ |
| Flags default não alteradas | ✅ |
| CLIENT_REAL_ENABLED não alterado | ✅ |
| Smokes existentes passando | ✅ 41/41 canary, 26/26 pipeline, 20/20 webhook |

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/meta/prod-diag.ts` | NOVO — maskId + diagLog |
| `src/meta/webhook.ts` | Logs 1, 2, 3, 4, 5, 11 |
| `src/meta/canary-pipeline.ts` | Logs 6, 7, 8, 9, 10 |
| `src/meta/outbound.ts` | OutboundResult.error_body_sanitized (diagnóstico) |

---

## Próxima PR autorizada

Após deploy desta PR em PROD e execução de mensagem real:

- Se o bloqueio for revelado por flag → PR-IMPL correção de secret/var no dashboard (não requer PR de código)
- Se o bloqueio for por código → PR-IMPL específica da causa identificada pelos logs

**PR-IMPL não pode iniciar sem esta PR-DIAG ter sido deployada e os logs inspecionados.**

---

## Marcadores de governança

**T8.12B: NÃO ENCERRADA — esta PR não fecha T8.12B.**  
**G8: NÃO FECHADO — esta PR não fecha G8.**  
**CLIENT_REAL_ENABLED=false.** Não alterado por esta PR.  
**Sem mudança de comportamento funcional.** Zero alteração de rota, gate, flag default ou regra de negócio.
