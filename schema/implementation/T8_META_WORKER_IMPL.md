# T8_META_WORKER_IMPL — Implementação Meta/WhatsApp + Worker (PR-T8.11)

## §1 — Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.11 |
| Tipo | PR-IMPL |
| Fase | T8 |
| Base | PR-T8.10 — `schema/diagnostics/T8_META_WORKER_DIAGNOSTICO.md` |
| Contrato T6.7 | `schema/implantation/T6_ADAPTER_META_WHATSAPP.md` |
| Próxima PR | PR-T8.12 — Prova Meta/WhatsApp controlada |
| Branch | `feat/t8-pr-t8-11-impl-meta-whatsapp-worker` |
| Data | 2026-04-30 |

---

## §2 — Objetivo

Transformar o diagnóstico da PR-T8.10 em código operacional mínimo, controlado por flags, que permita à Meta verificar o webhook (challenge), validar a integridade dos eventos inbound (assinatura HMAC-SHA256), normalizar o payload bruto Meta para um evento interno, deduplicar por `wa_message_id`, e dispor de uma função de outbound bloqueada por flag para uso futuro em PR-T8.12. Sem cliente real, sem LLM real, sem outbound automático.

---

## §3 — O que foi implementado

| Item | Onde |
|---|---|
| Rota GET webhook challenge | `src/meta/webhook.ts` — `handleMetaWebhookChallenge` |
| Rota POST webhook real | `src/meta/webhook.ts` — `processMetaWebhookPost` / `handleMetaWebhook` |
| Validação `X-Hub-Signature-256` | `src/meta/signature.ts` — `verifyMetaSignature` (HMAC-SHA256 via Web Crypto, comparação timing-safe) |
| Parser payload bruto Meta | `src/meta/parser.ts` — `parseMetaWebhookPayload` |
| Normalização para evento interno | `src/meta/parser.ts` — `NormalizedMetaEvent` |
| Dedupe por `wa_message_id` (in-memory) | `src/meta/dedupe.ts` — `createInMemoryDedupeStore`, `getSharedDedupeStore` |
| Cálculo de `dedupe_key` com fallback | `src/meta/parser.ts` — `computeDedupeKey` |
| Outbound controlado por flag | `src/meta/outbound.ts` — `sendMetaOutbound`, `evaluateOutboundReadiness`, `buildMetaOutboundPayload` |
| Tipo de env Meta | `src/meta/webhook-env.ts` — `MetaWorkerEnv`, `readEnvString` |
| Roteamento | `src/worker.ts` — `/__meta__/webhook` (GET+POST) e anúncio em `/` |
| Rollout guard | `src/rollout/guards.ts` — `/__meta__/webhook` adicionado às rotas conhecidas |
| Telemetria técnica | 12 eventos Meta dedicados (§7) |
| Smoke test dedicado | `src/meta/webhook-smoke.ts` — 20 cenários, 100% PASS |

---

## §4 — Rotas

| Método | Path | Função | Status | Segurança | Observação |
|---|---|---|---|---|---|
| GET | `/__meta__/webhook` | Webhook verification challenge | OPERACIONAL | `META_VERIFY_TOKEN` obrigatório | Retorna `hub.challenge` em texto puro com 200 quando válido; 403 caso contrário |
| POST | `/__meta__/webhook` | Webhook inbound real | OPERACIONAL | `X-Hub-Signature-256` HMAC-SHA256 obrigatório | Sem assinatura → 401; assinatura inválida → 403; sucesso → 200 com lista de eventos normalizados |
| Outros | `/__meta__/webhook` | — | 405 | — | Apenas GET/POST permitidos |
| POST | `/__meta__/ingest` | Ingest interno preservado | OPERACIONAL | Envelope interno `front6.v1` | Mantido para retrocompatibilidade — `smoke:meta` (14/14 PASS) |
| GET | `/` | Health/root | OPERACIONAL | — | Anuncia rota `meta_webhook` |

---

## §5 — Segurança

| Item | Estado |
|---|---|
| Assinatura obrigatória em POST inbound | **SIM** — `verifyMetaSignature` chamada antes de qualquer parse |
| HMAC-SHA256 usando `crypto.subtle` (Web Crypto) | **SIM** — compatível com Cloudflare Workers e Node ≥ 18 |
| Comparação timing-safe | **SIM** — XOR byte-a-byte sobre hex |
| Segredo nunca em log/error/response | **SIM** — apenas reason codes (`signature_missing`, `signature_invalid`, `signature_format`, `app_secret_missing`) |
| Challenge técnico — não cria turno | **SIM** — handler GET nunca chama pipeline |
| Token de verificação nunca em log | **SIM** — apenas `reason: token_mismatch` quando inválido |
| Outbound bloqueado por default | **SIM** — `CHANNEL_ENABLED=false` + `META_OUTBOUND_ENABLED=false` por default |
| Outbound nunca é chamado automaticamente pelo inbound | **SIM** — esta PR não invoca `sendMetaOutbound` a partir de `handleMetaWebhook` |
| Adapter nunca gera `reply_text` | **SIM** — `processMetaWebhookPost` retorna apenas metadados técnicos |
| Adapter nunca decide stage / fact_* / fase | **SIM** — `NormalizedMetaEvent` não contém esses campos |
| Adapter nunca chama LLM | **SIM** — `llm_invoked: false` no body de toda response |
| Adapter nunca persiste em Supabase | **SIM** — `external_dispatch: false`; nenhuma escrita |
| Adapter nunca baixa mídia | **SIM** — apenas `media_id`/`media_mime_type` preservados como referência |

---

## §6 — Parser inbound

Mapeamento de payload Meta bruto para `NormalizedMetaEvent`:

```
Meta Cloud API (raw)                       → NormalizedMetaEvent (interno)

object: "whatsapp_business_account"        → (validado; rejeita demais)
entry[].changes[].value.metadata.phone_number_id → phone_number_id
entry[].changes[].value.messages[].id      → wa_message_id
entry[].changes[].value.messages[].from    → wa_id
entry[].changes[].value.messages[].timestamp → timestamp
entry[].changes[].value.messages[].type    → message_type
entry[].changes[].value.messages[].text.body → text_body (quando type=text)
entry[].changes[].value.messages[].image.id → media_id (image)
entry[].changes[].value.messages[].document.id → media_id (document)
entry[].changes[].value.messages[].document.filename → media_filename
entry[].changes[].value.messages[].audio.id → media_id (audio)
entry[].changes[].value.messages[].video.id → media_id (video)
entry[].changes[].value.messages[].sticker.id → media_id (sticker)
entry[].changes[].value.messages[].interactive → text_body="[interactive_reply]"
entry[].changes[].value.statuses[].id      → status_id
entry[].changes[].value.statuses[].status  → status_value
entry[].changes[].value.statuses[].timestamp → timestamp
entry[].changes[].value.statuses[].recipient_id → wa_id
```

O parser **nunca** produz `reply_text`, `stage`, `fact_*`, `next_objective` ou `speech_intent`.

---

## §7 — Dedupe / idempotência

| Aspecto | Detalhe |
|---|---|
| Chave primária | `wa_message_id` (campo `id` do `messages[]` ou `statuses[]`) |
| Fallback | `${kind}:fallback:${wa_id}|${timestamp}|${type_or_status}` |
| Storage atual | **In-memory** por instância — `createInMemoryDedupeStore` |
| Limite | 1000 chaves (FIFO) |
| Limitação declarada | Cloudflare Worker pode ter múltiplas instâncias; in-memory não cobre dedupe cross-instance. PR posterior plugará Supabase/KV |
| Interface estável | `DedupeStore` (`has`, `remember`, `size`, `clear`) — futuro backend persistente substitui sem mudar consumidor |
| Comportamento | Evento duplicado → 200 + `duplicate: true`; **não** cria novo evento; **não** chama pipeline; loga `meta.webhook.inbound.duplicate` |

**Próximo passo (não nesta PR)**: implementar `SupabaseDedupeStore` ou `CloudflareKVDedupeStore` cumprindo a interface `DedupeStore`.

---

## §8 — Outbound controlado

| Aspecto | Detalhe |
|---|---|
| Função | `sendMetaOutbound(intent, env)` em `src/meta/outbound.ts` |
| Default | **BLOQUEADO** — `CHANNEL_ENABLED=false` E `META_OUTBOUND_ENABLED=false` |
| Pré-condições | `CHANNEL_ENABLED=true` + `META_OUTBOUND_ENABLED=true` + `META_ACCESS_TOKEN` presente + `phone_number_id` + `wa_id` + `reply_text` não vazio |
| Reasons de bloqueio | `flag_off_channel`, `flag_off_outbound`, `access_token_missing`, `phone_number_id_missing`, `wa_id_missing`, `reply_text_missing`, `graph_api_error`, `network_error` |
| Endpoint Graph API | `https://graph.facebook.com/${META_GRAPH_VERSION:-v20.0}/${phone_number_id}/messages` |
| Payload | `{messaging_product: "whatsapp", recipient_type: "individual", to: wa_id, type: "text", text: {body: reply_text}}` |
| `reply_text` | Copiado **literalmente** — adapter nunca modifica |
| Chamada automática | **NÃO** — esta PR não invoca `sendMetaOutbound` a partir do inbound |
| Próxima ativação | PR-T8.12 — prova controlada com autorização Vasques |

---

## §9 — Envs / secrets necessários

| Variável | Propósito | Setar via |
|---|---|---|
| `META_VERIFY_TOKEN` | Webhook challenge — comparar com `hub.verify_token` | `wrangler secret put META_VERIFY_TOKEN` |
| `META_APP_SECRET` | HMAC-SHA256 da assinatura `X-Hub-Signature-256` | `wrangler secret put META_APP_SECRET` |
| `META_ACCESS_TOKEN` | Outbound — Bearer token para Graph API | `wrangler secret put META_ACCESS_TOKEN` |
| `META_PHONE_NUMBER_ID` | Outbound — número ENOVA na Meta | `wrangler secret put META_PHONE_NUMBER_ID` |
| `META_GRAPH_VERSION` | (opcional) versão Graph API — default `v20.0` | `wrangler secret put META_GRAPH_VERSION` |
| `CHANNEL_ENABLED` | Feature flag global do canal — default `false` | `wrangler secret put CHANNEL_ENABLED` |
| `META_OUTBOUND_ENABLED` | Feature flag específica do outbound — default `false` | `wrangler secret put META_OUTBOUND_ENABLED` |

**O `wrangler.toml` não contém secrets nem valores** — em consonância com o bootstrap original que documenta "nenhuma binding, secret, KV, R2, D1, queue ou var foi declarada neste bootstrap". Os secrets são setados via CLI Cloudflare. Esta PR **não** modifica `wrangler.toml`.

---

## §10 — Logs e telemetria

12 eventos Meta dedicados emitidos via `emitTelemetry` (layer `channel`):

| Evento | Quando | Severidade |
|---|---|---|
| `meta.webhook.challenge.ok` | GET challenge bem-sucedido | info |
| `meta.webhook.challenge.fail` | GET challenge falha (token, mode, env ausente) | warn |
| `meta.webhook.signature.ok` | POST com assinatura válida | info |
| `meta.webhook.signature.fail` | POST com assinatura ausente/inválida | warn |
| `meta.webhook.inbound.accepted` | Mensagem normalizada (não duplicada) | info |
| `meta.webhook.inbound.duplicate` | Evento duplicado capturado por dedupe | info |
| `meta.webhook.inbound.invalid` | Payload malformado / método não permitido | warn |
| `meta.webhook.status.received` | Status event (delivered/read) | info |
| `meta.webhook.media.stub` | Mídia recebida — apenas referência preservada | info |
| `meta.outbound.blocked` | Outbound bloqueado (flag/token/etc) | info |
| `meta.outbound.ready` | (futuro PR-T8.12) outbound pronto para envio | info |
| `meta.outbound.failed` | (futuro PR-T8.12) outbound falhou no Graph API | error |

Sanitização: tokens, secrets, payloads completos, conteúdo de áudio/documento e dados sensíveis **nunca** entram em logs.

---

## §11 — Testes / Validação

### Smoke novo

`npm run smoke:meta:webhook` — **20/20 PASS**:

| Cenário | Resultado |
|---|---|
| GET challenge — token válido retorna challenge em texto puro | PASS |
| GET challenge — token inválido → 403 (`token_mismatch`) | PASS |
| GET challenge — `mode != subscribe` → 403 (`mode_invalid`) | PASS |
| GET challenge — sem `META_VERIFY_TOKEN` → 403 (`verify_token_not_configured`) | PASS |
| POST sem assinatura → 401 (`signature_missing`) | PASS |
| POST assinatura inválida → 403 (`signature_invalid`) | PASS |
| POST texto válido com assinatura válida → 200 + evento normalizado | PASS |
| POST duplicado por `wa_message_id` → 200 + `duplicate: true` | PASS |
| POST status event → 200 sem turno conversacional | PASS |
| POST mídia (document/PDF) → 200 com media stub | PASS |
| Outbound — `CHANNEL_ENABLED=false` → bloqueado | PASS |
| Outbound — `META_OUTBOUND_ENABLED=false` → bloqueado | PASS |
| Outbound — sem `META_ACCESS_TOKEN` → bloqueado | PASS |
| Outbound — `reply_text` vazio → bloqueado | PASS |
| Outbound — payload Graph API copia `reply_text` literal | PASS |
| Parser — evento normalizado nunca contém `reply_text/stage/fact_*` | PASS |
| Parser — `dedupe_key` estável para mesmo `wa_message_id` | PASS |
| Ingest interno `/__meta__/ingest` preservado (retrocompat) | PASS |
| Root técnico anuncia rota `meta_webhook` | PASS |
| Method inválido no webhook → 405 | PASS |

### Smokes existentes (retrocompatibilidade)

| Comando | Resultado |
|---|---|
| `npm run smoke:all` | **PASS** (exit 0) |
| `npm run smoke:meta` | **PASS** 14/14 |
| `npm run smoke:supabase` | **PASS** 70/70 |
| `npm run smoke:panel` | **PASS** 30/30 |
| `npm run prove:crm-e2e` | **PASS** 73/73 |

---

## §12 — Limitações declaradas

1. **Sem cliente real**: zero atendimento real a leads/clientes nesta PR.
2. **Sem outbound real automático**: `sendMetaOutbound` existe e é testável, mas não é chamado a partir do inbound nesta PR.
3. **Sem mídia real baixada**: apenas `media_id`/`media_mime_type` são preservados; download via Graph API é responsabilidade futura.
4. **Sem LLM real**: nenhuma chamada ao pipeline de fala. `llm_invoked: false` em toda response.
5. **Sem go-live**: o canal continua bloqueado em produção (`CHANNEL_ENABLED=false` por default).
6. **Idempotência in-memory**: dedupe não persiste entre instâncias do Worker. Limitação documentada; PR futura plugará backend persistente cumprindo a interface `DedupeStore`.
7. **Sem persistência Supabase do evento Meta**: evento normalizado é retornado na response técnica, mas não escrito em `crm_lead_meta`/`enova_state`/etc nesta PR.
8. **Sem integração com surface T6_SURFACE_CANAL**: `processMetaWebhookPost` não invoca surface/T4 nesta PR. PR posterior conectará após autorização Vasques.
9. **Auto-deploy em push/main (CONF-01)**: documentado em T8.2; não alterado nesta PR.

---

## §13 — Próxima PR

**PR-T8.12 — Prova Meta/WhatsApp controlada (PR-PROVA)**

Pré-condições para PR-T8.12:
- Secrets Meta declarados via `wrangler secret put` em ambiente de teste (`nv-enova-2-test`)
- Autorização explícita Vasques para canal real controlado
- Lead operacional autorizado (não cliente real amplo)
- Plano de rollback (flags off + revert do PR)

Provas que PR-T8.12 deve cobrir:
- Challenge real verificado pela Meta (registro do webhook no painel Meta)
- POST inbound real recebido com assinatura HMAC válida
- Inbound normalizado e exposto via response técnica
- Dedupe funciona em retry da Meta
- Outbound controlado: `CHANNEL_ENABLED=true` + `META_OUTBOUND_ENABLED=true` → mensagem entregue ao número de teste
- Logs/telemetria capturam o ciclo completo
- Rollback: setar flags off → outbound imediatamente bloqueado sem re-deploy

---

## §14 — Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implementation/T8_META_WORKER_IMPL.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não (para o escopo PR-IMPL desta etapa)
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T8.11 encerrada; PR-T8.12 desbloqueada
Próxima PR autorizada:                 PR-T8.12 — Prova Meta/WhatsApp controlada (PR-PROVA)
```

### Restrições herdadas

- Adapter nunca gera `reply_text` (PROB-AD-01)
- Adapter nunca decide stage / fact_* / fase (PROB-AD-02..04)
- Zero cliente real, zero LLM real, zero canal aberto sem `CHANNEL_ENABLED=true` + autorização Vasques
- T6.7 §3, §18, §21 plenamente respeitadas
