# T8_META_WORKER_DIAGNOSTICO — Diagnóstico Meta/WhatsApp + Worker runtime

## §1 Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.10 |
| Tipo | PR-DIAG |
| Fase | T8 |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` |
| Base declarativa principal | `schema/implantation/T6_ADAPTER_META_WHATSAPP.md` |
| Próxima PR esperada | PR-T8.11 |
| Data do diagnóstico | 2026-04-30 |

---

## §2 Objetivo

Diagnosticar o estado real da integração Meta/WhatsApp + Worker runtime no Repo2, cruzando o que já foi contratado/documentado em T0–T7 (especialmente T6.7) com o código real atual. Esta PR é diagnóstico puro — zero alteração de `src/`, zero webhook real, zero canal real.

---

## §3 Fontes analisadas

### Contratos

| Arquivo | Relevância |
|---|---|
| `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` | Contrato ativo T8 — mapa de PRs T8.10→T8.11→T8.12 |
| `schema/implantation/T6_ADAPTER_META_WHATSAPP.md` | Base declarativa principal — 26 seções, 20+ proibições, fluxos inbound/outbound |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | Soberania IA — adapter nunca fala ao cliente |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | Soberania LLM no contexto MCMV |
| `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` | Fechamento por prova — obrigatório antes de declarar encerrado |
| `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | Status atual T8 — PR-T8.9B ENCERRADA, Supabase ENCERRADO |
| `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | Handoff atual — frente Meta/WhatsApp a definir |

### Código Worker

| Arquivo | Relevância |
|---|---|
| `src/worker.ts` | Entrypoint Worker — roteamento de todas as requests |
| `src/meta/ingest.ts` | Handler POST `/__meta__/ingest` — envelope interno |
| `src/meta/validate.ts` | Validador do envelope interno (não do webhook bruto Meta) |
| `src/meta/types.ts` | Tipos do envelope interno + 5 event types mapeados |
| `src/meta/smoke.ts` | Smoke tests do canal Meta (14 cenários) |

### Adapters / Persistência

| Arquivo | Relevância |
|---|---|
| `src/adapter/index.ts` | Supabase Adapter (persistência de dados — NÃO é adapter de canal) |
| `src/adapter/runtime.ts` | Runtime real do Supabase Adapter (in-memory, não Supabase real) |
| `src/adapter/types.ts` | Tipos do Supabase Adapter (enova2_*) |
| `src/adapter/boundaries.ts` | Limites do Supabase Adapter |
| `src/adapter/policy.ts` | Política de consistência do Supabase Adapter |
| `src/adapter/smoke.ts` | Smoke do Supabase Adapter |

### Routes / Worker

| Arquivo | Relevância |
|---|---|
| `src/rollout/controller.ts` | Rollout guard — avalia gate de ativação |
| `src/rollout/guards.ts` | Controle de flags — `allow_meta_real_activation: false` hardcoded |
| `src/rollout/types.ts` | Tipos do rollout |
| `src/worker-route-smoke.ts` | Smoke de rotas do Worker |

### Env / Config

| Arquivo | Relevância |
|---|---|
| `wrangler.toml` | Configuração Cloudflare — ZERO bindings/secrets declarados |
| `package.json` | Scripts — `smoke:meta` presente; nenhum script de webhook real |

### Tests / Smokes

| Arquivo | Relevância |
|---|---|
| `src/meta/smoke.ts` | 14 cenários para envelope interno `/__meta__/ingest` |
| `src/speech/smoke.ts` | Smoke do Speech Engine |
| `src/audio/smoke.ts` | Smoke do pipeline de áudio |
| `src/supabase/smoke.ts` | 70/70 PASS — Supabase (sem HTTP real) |
| `src/panel/e2e-smoke.ts` | 73/73 PASS — CRM E2E |

### Workflows

| Arquivo | Relevância |
|---|---|
| `.github/workflows/deploy.yml` | Auto-deploy prod em push/merge main — CONFLITO CONF-01 documentado em T8.2 |
| `.github/workflows/pr-governance-check.yml` | Governança de PR |
| `.github/workflows/pr-governance-autofix.yml` | Autofix de governança |

---

## §4 Resumo executivo

### O que já existe (parcial/stub)

1. **Rota `POST /__meta__/ingest`** — endpoint Worker presente em `src/meta/ingest.ts`. Recebe envelope **interno** (não o payload bruto da Meta API). Valida method, JSON, campos obrigatórios. Retorna `mode: technical_only`, `real_meta_integration: false`, `external_dispatch: false`. **NÃO é um webhook Meta real.**

2. **Envelope interno** — `src/meta/types.ts` define `MetaInboundEnvelope` com 5 event types: `inbound.message.text`, `inbound.message.audio_stub`, `inbound.message.media_stub`, `inbound.delivery.status`, `inbound.system.ping`. Este é um formato **interno de normalização**, não o payload JSON bruto da Meta Cloud API.

3. **Smoke `smoke:meta`** — 14 cenários testando o endpoint interno: method, JSON inválido, envelope sem campos, version inválida, direction inválida, channel inválido, event_type fora da taxonomia, timestamps ISO, envelope válido, integridade sem conversa real. **Todos passam.**

4. **Supabase Adapter (`src/adapter/`)** — está implementado com runtime in-memory. É o adapter de **persistência de dados** (enova2_*), não o adapter de canal Meta/WhatsApp.

5. **Feature flag de rollout** — `allow_meta_real_activation: false` hardcoded em `src/rollout/guards.ts`. Bloqueia ativação real do canal Meta.

6. **Telemetria** — `emitTelemetry` chamado no ingest: `layer: 'channel'`, `category: 'channel_signal'`, `action: 'accepted'` + `category: 'external_boundary_blocked'`.

### O que está parcial

1. **Inbound parsing** — existe validação de envelope interno. Não existe parsing do payload bruto da Meta (JSON com `object`, `entry[]`, `changes[]`, `value.messages[]`, `value.statuses[]`).

2. **Idempotência** — usa `idempotency_key` do envelope interno. Não usa `wa_message_id` nativo da Meta. Sem registro persistente de eventos processados.

3. **Event types** — mapeados internamente mas sem lógica diferenciada por tipo (text vs. audio vs. media vs. status).

4. **E1 channel hook** — chamado após validação válida, mas não integra pipeline T4/LLM real.

### O que está ausente

| Item | Estado |
|---|---|
| Endpoint GET para webhook challenge (`hub.mode`, `hub.verify_token`, `hub.challenge`) | **AUSENTE** |
| Validação `X-Hub-Signature-256` (HMAC-SHA256 com App Secret) | **AUSENTE** |
| Parsing do payload bruto Meta Cloud API | **AUSENTE** |
| Extração de `wa_message_id`, `wa_id`, `phone_number_id` do payload Meta | **AUSENTE** |
| Outbound para Meta Graph API | **AUSENTE** |
| `META_ACCESS_TOKEN`, `META_APP_SECRET`, `META_VERIFY_TOKEN` | **AUSENTE** (zero bindings no wrangler.toml) |
| `META_PHONE_NUMBER_ID` / `META_WABA_ID` | **AUSENTE** |
| Download de mídia da Meta API | **AUSENTE** |
| Dedupe por `wa_message_id` nativo | **AUSENTE** |
| Registro persistente de idempotência | **AUSENTE** |
| Rate limit / retry outbound | **AUSENTE** |
| Separação GET vs POST no webhook | **AUSENTE** (rota atual só responde POST) |

### O que bloqueia PR-T8.11

1. **Ausência de endpoint GET para challenge** — Meta não consegue verificar o webhook sem um GET que responda `hub.challenge`.
2. **Ausência de `X-Hub-Signature-256`** — toda request POST real da Meta virá com assinatura HMAC; sem validação o Worker não pode diferenciar Meta legítima de payload malicioso.
3. **Ausência de env vars/bindings** — `META_VERIFY_TOKEN`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID` não existem no `wrangler.toml`. Sem eles nenhuma integração real é possível.
4. **Ausência de parsing do payload bruto Meta** — o formato real da Meta é completamente diferente do envelope interno atual.

### O que NÃO deve ser implementado ainda (PR-T8.11 só)

- Outbound real para Meta Graph API com mensagem a cliente (apenas infra controlada)
- Media download real (apenas stub de referência)
- LLM real integrado
- Cliente real / lead real de produção
- Ativação do canal em produção sem `prove:meta-controlada` executado primeiro (PR-T8.12)

---

## §5 Mapa do contrato T6.7 × código real

| Item | Exigência T6.7 | Existe no código? | Arquivos encontrados | Lacuna | Severidade | Bloqueia T8.11? | Recomendação |
|---|---|---|---|---|---|---|---|
| Webhook challenge GET | §9 WH-01..07: GET com `hub.mode`, `hub.verify_token`, responder `hub.challenge` | **NÃO** | — | Nenhuma rota GET existe para `/__meta__/webhook` ou equivalente | CRÍTICA | **SIM** | Criar rota GET com challenge em PR-T8.11 |
| Assinatura `X-Hub-Signature-256` | §10 SIG-01..09: HMAC-SHA256, rejeitar sem assinatura (401/403) | **NÃO** | — | Nenhum código de validação HMAC em todo `src/` | CRÍTICA | **SIM** | Implementar verificação HMAC com `META_APP_SECRET` em PR-T8.11 |
| Proteção anti-replay (timestamp) | §10 SIG-07: rejeitar payloads > 5 min | **NÃO** | — | Nenhuma lógica de timestamp comparison | ALTA | SIM | Implementar em PR-T8.11 junto com assinatura |
| Parsing payload bruto Meta | §7 etapas 1-9: `entry[].changes[].value.messages[]`, wa_message_id, wa_id | **NÃO** | `src/meta/types.ts` (envelope interno ≠ formato Meta) | Formato atual é interno; payload real Meta é completamente diferente | CRÍTICA | **SIM** | Criar parser de payload bruto Meta em PR-T8.11 |
| Extração `wa_message_id` | §7 etapa 4, §12 DD-01: identificador único Meta | **NÃO** | — | Envelope interno usa `idempotency_key` mas não extrai `wa_message_id` nativo | CRÍTICA | **SIM** | Extrair do payload bruto em PR-T8.11 |
| Extração `wa_id` | §7 etapa 4: WhatsApp ID do remetente | **NÃO** | — | Ausente do parser real | ALTA | SIM | Extrair em PR-T8.11 |
| Extração `phone_number_id` | §7 etapa 4: número ENOVA no canal | **NÃO** | — | Ausente | ALTA | SIM | Extrair em PR-T8.11 |
| Inbound parser (texto) | §6.1: `text_message → input_type=text` | **PARCIAL** | `src/meta/types.ts` (`inbound.message.text`) | Envelope interno mapeia o tipo mas não parseia do payload bruto Meta | ALTA | SIM | Completar em PR-T8.11 |
| Inbound parser (audio) | §6.1: `audio_message → input_type=audio` | **PARCIAL** | `src/meta/types.ts` (`inbound.message.audio_stub`) | Stub apenas | ALTA | não (PR-T8.12) | Refinar em T8.11 |
| Inbound parser (document/PDF) | §6.1: `document_message → input_type=document` | **PARCIAL** | `src/meta/types.ts` (`inbound.message.media_stub`) | Stub genérico | ALTA | não (PR-T8.12) | Refinar em T8.11 |
| Inbound parser (interactive/button) | §6.1: `interactive_reply → input_type=button_or_link` | **NÃO** | — | Não mapeado | MÉDIA | não | PR-T8.11 ou posterior |
| Status events (delivered/read) | §17 ST-01..08: system_event, não cria turno | **PARCIAL** | `src/meta/types.ts` (`inbound.delivery.status`) | Tipo mapeado mas sem handling específico (não cria turno) | MÉDIA | não | Verificar no parser real |
| Dedupe por `wa_message_id` | §11/§12 IDP-01..10: evento duplicado descartado | **NÃO** | — | `idempotency_key` existe no envelope interno, mas não usa `wa_message_id` nativo | ALTA | SIM | Implementar em PR-T8.11 com armazenamento em KV ou Supabase |
| Idempotência persistente | §11 IDP-08: requisito bloqueante | **NÃO** | — | Sem storage persistente de eventos processados | ALTA | SIM | Implementar em PR-T8.11 |
| Outbound para Meta Graph API | §8 etapas 1-11: enviar reply_text aprovado | **NÃO** | — | `external_dispatch: false` hardcoded | CRÍTICA | **SIM** (stub básico) | Criar outbound stub controlado em PR-T8.11 |
| `META_ACCESS_TOKEN` | §19 SEC-01: necessário para outbound | **NÃO** | `wrangler.toml` — zero bindings | Ausente no wrangler.toml | CRÍTICA | **SIM** | Declarar binding em PR-T8.11 |
| `META_VERIFY_TOKEN` | §9 WH-05: token para challenge | **NÃO** | `wrangler.toml` — zero bindings | Ausente | CRÍTICA | **SIM** | Declarar secret em PR-T8.11 |
| `META_APP_SECRET` | §10 SIG-06: para HMAC | **NÃO** | `wrangler.toml` — zero bindings | Ausente | CRÍTICA | **SIM** | Declarar secret em PR-T8.11 |
| `META_PHONE_NUMBER_ID` | §8 etapa 4: campo "to" no outbound | **NÃO** | — | Ausente | ALTA | SIM | Declarar binding em PR-T8.11 |
| Mídia — preservar referência | §16 MID-01..05: `media_ref`, `media_mime_type` | **NÃO** | — | Ausente do parser real | MÉDIA | não | PR-T8.11 |
| Mídia — download real Meta API | §16 MID-14: operação futura | **NÃO** (ok) | — | Declarado como futuro no contrato | BAIXA | não | PR-T8.12/T8.13 |
| Retry outbound (§13 RTO-01..09) | Máx 3 tentativas, backoff exponencial | **NÃO** | — | Ausente | ALTA | não (stub básico suficiente para T8.11) | Implementar em PR-T8.11 |
| Rate limit (§15 RL-01..07) | Controle técnico de envio | **NÃO** | — | Ausente | MÉDIA | não | PR-T8.11 |
| Logs de observabilidade (§20) | 13 eventos de adapter | **PARCIAL** | `src/meta/ingest.ts` — 2 eventos emitidos | Apenas `channel_signal.accepted` e `external_boundary_blocked`; faltam 11 eventos | MÉDIA | não | Completar em PR-T8.11 |
| Separação GET vs POST no webhook | §9 WH-06: mesmo endpoint, método diferente | **NÃO** | `src/worker.ts` (rota POST-only) | Sem GET handler | CRÍTICA | **SIM** | Adicionar GET em PR-T8.11 |
| Integração com surface/T4 | §5: adapter → T6_SURFACE_CANAL → T4 | **NÃO** | — | `handleMetaIngest` retorna `technical_only`, não entrega à surface | CRÍTICA | SIM (infra mínima) | PR-T8.11 |
| Proibição `reply_text` no adapter | §3/§18/PROB-AD-01: adapter nunca cria texto | **CONFORME** | `src/meta/ingest.ts` — `mode: technical_only` | Conforme | — | Manter |
| Proibição `fact_*` no adapter | §21 PROB-AD-03 | **CONFORME** | Nenhuma lógica de fact_* em meta/ | Conforme | — | Manter |
| Proibição de stage decision | §21 PROB-AD-02 | **CONFORME** | Nenhuma lógica de stage | Conforme | — | Manter |

---

## §6 Worker routes reais

| Método | Path | Handler | Arquivo | Auth/Assinatura | Risco | Status |
|---|---|---|---|---|---|---|
| GET | `/` | `handleRoot()` | `src/worker.ts:247` | Nenhuma | Baixo — apenas health info técnica | OPERACIONAL |
| POST | `/__core__/run` | `handleCoreRun()` | `src/worker.ts:109` | Nenhuma — técnico interno | Médio — expõe estrutura interna | OPERACIONAL |
| POST | `/__meta__/ingest` | `handleMetaIngest()` | `src/meta/ingest.ts:51` | Nenhuma — NÃO valida X-Hub-Signature-256 | **ALTO** — aceita POST sem assinatura | PARCIAL (técnico apenas) |
| GET | `/__meta__/ingest` | `handleMetaIngest()` (rejeita 405) | `src/meta/ingest.ts:61` | — | — | Rejeita corretamente |
| GET/POST | `/crm/*` | `handleCrmRequest()` | `src/crm/routes.ts` | `X-CRM-Admin-Key` | Baixo — auth presente | OPERACIONAL |
| GET | `/panel[/*]` | `handlePanelRequest()` | `src/panel/handler.ts` | Admin key via localStorage | Baixo | OPERACIONAL |
| Qualquer | `*` (fallback) | 404 | `src/worker.ts:314` | — | Baixo | OPERACIONAL |
| **GET** | `/__meta__/webhook` ou `/webhook` | **NÃO EXISTE** | — | — | **CRÍTICO** — Meta não consegue verificar o webhook | **AUSENTE** |

**Observação crítica**: Não existe rota GET para webhook challenge da Meta. A Meta exige um endpoint GET que responda `hub.challenge` para verificação. Sem isso, o webhook não pode ser registrado no painel Meta.

---

## §7 Webhook Meta

| Item | Estado | Detalhe |
|---|---|---|
| Endpoint GET para challenge | **AUSENTE** | Nenhuma rota GET existe para receber a verificação Meta |
| Parâmetro `hub.mode` | **AUSENTE** | Nenhum parsing de query params de verificação |
| Parâmetro `hub.verify_token` | **AUSENTE** | Token não declarado em nenhum lugar do código |
| Parâmetro `hub.challenge` | **AUSENTE** | Nenhuma lógica de retorno do challenge |
| Resposta 200 com challenge | **AUSENTE** | — |
| Resposta 403 para token inválido | **AUSENTE** | — |
| Separação GET vs POST | **AUSENTE** | Rota atual responde apenas a POST |
| Proteção contra criar turno em challenge | **N/A** | Endpoint challenge não existe; se criado, deve ser implementado |

**Lacuna principal**: Para registrar o webhook no painel Meta for Developers, é necessário fornecer uma URL que responda a um GET com `hub.mode=subscribe`, `hub.verify_token=<token>` retornando HTTP 200 com o valor de `hub.challenge`. Esta capacidade é **completamente ausente**.

---

## §8 Assinatura Meta

| Item | Estado | Detalhe |
|---|---|---|
| Header `X-Hub-Signature-256` | **AUSENTE** | Nenhuma lógica de leitura deste header em `src/meta/ingest.ts` |
| `META_APP_SECRET` | **AUSENTE** | Não declarado em `wrangler.toml`, não referenciado em código |
| HMAC SHA256 | **AUSENTE** | Nenhuma chamada a `crypto.subtle.sign` ou equivalente em `src/` |
| Assinatura inválida bloqueia pipeline | **AUSENTE** | Qualquer POST é aceito pela rota sem verificação |
| Payload bruto preservado antes de parse | **AUSENTE** | `request.json()` chamado diretamente; payload bruto não preservado |
| Segredo protegido | **N/A** | Não existe secret para proteger |
| Anti-replay por timestamp | **AUSENTE** | Nenhuma verificação de timestamp do payload Meta |

**Risco**: O endpoint `/__meta__/ingest` aceita qualquer POST JSON sem autenticação ou verificação de origem. Em ambiente de produção, isso significa que qualquer agente externo pode injetar eventos no pipeline.

---

## §9 Inbound WhatsApp

| Item | Estado | Detalhe |
|---|---|---|
| Parsing de mensagens Meta (payload bruto) | **AUSENTE** | Formato real Meta: `{object: "whatsapp_business_account", entry: [{changes: [{value: {messages: [...]}}]}]}` |
| `wa_id` | **AUSENTE** | Não extraído do payload Meta real |
| `phone_number_id` | **AUSENTE** | Não extraído |
| `wa_message_id` | **AUSENTE** | Não extraído (envelope usa `event_id` interno) |
| `timestamp` (Meta) | **PARCIAL** | `occurred_at` no envelope interno; não vem do timestamp nativo Meta |
| Texto | **PARCIAL** | Tipo `inbound.message.text` mapeado; não parseia `messages[0].text.body` |
| Interactive/button | **NÃO** | Não mapeado no parser real |
| Status event (delivered/read) | **PARCIAL** | Tipo `inbound.delivery.status` mapeado; sem handling específico |
| Mídia (image, document, audio) | **PARCIAL** | `inbound.message.media_stub` — stub apenas |
| Normalização para surface/canal | **NÃO** | `handleMetaIngest` retorna `technical_only`; não entrega à `T6_SURFACE_CANAL` |
| Dedupe | **PARCIAL** | `idempotency_key` existe no envelope interno; sem `wa_message_id` real |
| Persistência | **NÃO** | Envelope aceito mas não persiste evento no Supabase |
| Integração com Supabase | **NÃO** | Supabase real não acionado no fluxo inbound |
| Integração com CRM | **NÃO** | `handleMetaIngest` não chama `getCrmBackend` |

---

## §10 Outbound WhatsApp

| Item | Estado | Detalhe |
|---|---|---|
| Envio para Meta API | **AUSENTE** | `external_dispatch: false` hardcoded |
| `phone_number_id` | **AUSENTE** | Não declarado como binding |
| `META_ACCESS_TOKEN` | **AUSENTE** | Não declarado no `wrangler.toml` |
| Endpoint Graph API | **AUSENTE** | Nenhuma chamada `https://graph.facebook.com/v*/...` |
| Payload text | **AUSENTE** | Nenhuma montagem de payload `{messaging_product: "whatsapp", to: wa_id, type: "text", text: {body: reply_text}}` |
| Template (futuro) | **NÃO** (ok) | Fora do escopo de T8.11 |
| Retry | **AUSENTE** | — |
| Rate limit | **AUSENTE** | — |
| Logs de outbound | **PARCIAL** | `external_boundary_blocked` emitido no ingest, não no outbound |
| Proteção `reply_text` só do pipeline | **CONFORME** | `mode: technical_only` — nenhum reply_text gerado pelo adapter |
| Fala própria do adapter | **CONFORME** | Zero text gerado pelo adapter |

---

## §11 Mídia e documentos

| Item | Estado | Detalhe |
|---|---|---|
| Image | **AUSENTE** do parser real | `media_stub` genérico |
| Document/PDF | **AUSENTE** do parser real | `media_stub` genérico |
| Audio | **AUSENTE** do parser real | `audio_stub` existe; `src/audio/` tem pipeline, mas sem integração com inbound Meta real |
| Sticker | **NÃO** | Não mapeado |
| Video | **NÃO** | Não mapeado |
| `media_id` | **AUSENTE** | Não extraído do payload Meta real |
| Download de mídia Meta API | **AUSENTE** | Nenhuma chamada `https://graph.facebook.com/v*/media_id` |
| Armazenamento em Supabase | **AUSENTE** | Supabase real não acionado no fluxo inbound |
| Relação com `enova_docs` | **AUSENTE** | `enova_docs` lida na prova Supabase mas não conectada ao inbound Meta |
| Relação com `enova_document_files` | **AUSENTE** | Tabela existe (rows=0 na prova T8.9B) mas sem integração |
| Risco de bucket público | **DOCUMENTADO** | `documentos-pre-analise` (141 obj) e `enavia-brain` (112 obj) públicos — risco T8.7 |
| O que falta para T8.11 | — | Parser de `media_id` + referência ao Supabase; download real → T8.12/T8.13 |

---

## §12 Envs / secrets / bindings esperados

### Estado atual do `wrangler.toml`

```
name = "nv-enova-2"
main = "src/worker.ts"
compatibility_date = "2026-04-20"

[env.test]
name = "nv-enova-2-test"
```

**ZERO bindings, ZERO vars, ZERO secrets declarados.**

### Mapa de variáveis necessárias para Meta/WhatsApp

| Variável | Propósito | Existe no wrangler.toml? | Existe referenciada no código? |
|---|---|---|---|
| `META_VERIFY_TOKEN` | Webhook challenge — verificar token da Meta | **NÃO** | **NÃO** |
| `META_APP_SECRET` | Assinatura HMAC-SHA256 | **NÃO** | **NÃO** |
| `META_ACCESS_TOKEN` | Outbound — chamadas à Graph API | **NÃO** | **NÃO** |
| `META_PHONE_NUMBER_ID` | Identificador do número ENOVA na Meta | **NÃO** | **NÃO** |
| `META_WABA_ID` | WhatsApp Business Account ID | **NÃO** | **NÃO** |
| `META_GRAPH_VERSION` | Versão da Graph API (ex: v20.0) | **NÃO** | **NÃO** |
| `SUPABASE_REAL_ENABLED` | Feature flag Supabase | **NÃO** (env var runtime) | **SIM** (`src/supabase/readiness.ts`) |
| `SUPABASE_URL` | URL Supabase | **NÃO** | **SIM** |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role Supabase | **NÃO** | **SIM** |
| `CHANNEL_ENABLED` | Feature flag do canal WhatsApp | **NÃO** | **NÃO** |
| `ENOVA2_ENABLED` | Feature flag global Enova 2 | **NÃO** | **NÃO** |
| `CRM_ADMIN_KEY` | Auth do painel CRM | **NÃO** (env var runtime) | **SIM** (`src/crm/routes.ts`) |

**Nenhum secret Meta está declarado.** Para declarar secrets no Cloudflare Worker, deve-se usar `wrangler secret put <NAME>` (nunca expor valores em código ou documento).

---

## §13 Logs e telemetria

| Evento | Existe? | Arquivo | Observação |
|---|---|---|---|
| `adapter.inbound.received` | **PARCIAL** | `src/meta/ingest.ts` — `channel_signal.accepted` | Nome diferente do T6.7 §20 |
| `adapter.inbound.signature_invalid` | **NÃO** | — | Sem validação de assinatura |
| `adapter.inbound.duplicate` | **NÃO** | — | Sem lógica de dedupe real |
| `adapter.inbound.normalized` | **NÃO** | — | Nenhuma normalização real |
| `adapter.inbound.forwarded_to_surface` | **NÃO** | — | Surface não chamada |
| `adapter.inbound.challenge_responded` | **NÃO** | — | Challenge não existe |
| `adapter.outbound.requested` | **NÃO** | — | Outbound não implementado |
| `adapter.outbound.sent` | **NÃO** | — | — |
| `adapter.outbound.failed` | **NÃO** | — | — |
| `adapter.status.received` | **NÃO** | — | — |
| `adapter.rate_limited` | **NÃO** | — | — |
| `adapter.retry_scheduled` | **NÃO** | — | — |
| `adapter.retry_exhausted` | **NÃO** | — | — |
| `external_boundary_blocked` | **SIM** | `src/meta/ingest.ts:151` | Emitido corretamente — documenta que canal real está bloqueado |

**Dos 13 eventos de observabilidade exigidos pelo T6.7 §20, apenas 2 estão presentes** (com nomenclatura interna diferente). Telemetria de canal praticamente ausente.

---

## §14 Testes existentes

### Scripts no `package.json` relacionados a Meta/WhatsApp/adapter/channel

| Script | Arquivo | Status | O que testa |
|---|---|---|---|
| `smoke:meta` | `src/meta/smoke.ts` | **PASS** (14 cenários) | Endpoint `/__meta__/ingest` com envelope interno |
| `smoke:adapter` | `src/adapter/smoke.ts` | **PASS** | Supabase Adapter in-memory (persistência, não canal) |
| `smoke:adapter:policy` | `src/adapter/policy-smoke.ts` | **PASS** | Política do Supabase Adapter |
| `smoke:adapter:runtime` | `src/adapter/runtime-smoke.ts` | **PASS** | Runtime in-memory do Supabase Adapter |
| `smoke:audio` | `src/audio/smoke.ts` | **PASS** | Pipeline de áudio (stub) |
| `smoke:speech` | `src/speech/smoke.ts` | **PASS** | Speech Engine |

### O que falta para PR-T8.11 criar

| Teste | O que deve cobrir |
|---|---|
| `smoke:meta:challenge` | GET com hub.mode/hub.verify_token válido → 200 + hub.challenge; token inválido → 403 |
| `smoke:meta:signature` | POST com X-Hub-Signature-256 inválida → 401; válida → aceito |
| `smoke:meta:inbound-raw` | Parsing do payload bruto Meta (entry/changes/value/messages); extração wa_message_id, wa_id, phone_number_id |
| `smoke:meta:dedupe` | Mesmo wa_message_id → segunda entrega descartada sem novo turno |
| `smoke:meta:outbound` | Outbound stub controlado → payload correto montado; `external_dispatch: false` mantido até T8.12 |
| `smoke:meta:status-events` | `statuses[]` → system_event; não cria turno |

---

## §15 Riscos de produção

| ID | Risco | Origem | Impacto | Severidade | Mitigação | Bloqueia implementação? |
|---|---|---|---|---|---|---|
| R-T810-01 | **Outbound indevido para cliente** — adapter envia mensagem sem `reply_text` aprovado pelo pipeline | Implementação parcial de outbound sem proteção T4 | Lead recebe mensagem mecânica não autorizada | **CRÍTICA** | Só implementar outbound após pipeline T4 conectado; feature flag `CHANNEL_ENABLED=false` por default | **SIM** — T8.11 deve implementar outbound bloqueado por default |
| R-T810-02 | **Assinatura ausente** — endpoint aceita POST de qualquer origem | `src/meta/ingest.ts` sem `X-Hub-Signature-256` | Injeção de eventos maliciosos no pipeline | **CRÍTICA** | Implementar HMAC-SHA256 em PR-T8.11 como primeira barreira | **SIM** |
| R-T810-03 | **Replay / dedup ausente** — mesmo evento processado múltiplas vezes | Sem registro persistente de `wa_message_id` | Turno duplicado, estado corrompido, lead recebe resposta duplicada | **ALTA** | Implementar dedupe com KV ou Supabase em PR-T8.11 | **SIM** |
| R-T810-04 | **Mídia sem storage seguro** — mídia recebida sem armazenamento em Supabase controlado | Buckets públicos (`documentos-pre-analise`, `enavia-brain`) | Exposição de documentos de clientes | **ALTA** | Não implementar media download até RLS/bucket policy corrigidos (PRs próprias) | não (bloqueante para T8.12, não T8.11 básico) |
| R-T810-05 | **Token exposto** — `META_APP_SECRET` ou `META_ACCESS_TOKEN` em código, log ou documento | Ausência de procedimento de secret management | Comprometimento da conta Meta | **CRÍTICA** | Usar somente `wrangler secret put`; nunca em wrangler.toml, código ou documento | **SIM** (procedimento) |
| R-T810-06 | **Adapter escrevendo fala/stage/fact** | Implementação incorreta de outbound | Violação dos adendos de soberania | **CRÍTICA** | Smoke de conformidade obrigatório em PR-T8.11 | **SIM** |
| R-T810-07 | **Falta de rollback** — sem feature flag para desabilitar canal | `rollout/guards.ts` tem `allow_meta_real_activation: false` hardcoded | Sem como desligar canal em produção sem re-deploy | **ALTA** | Implementar `CHANNEL_ENABLED` como env var real em PR-T8.11 | **SIM** |
| R-T810-08 | **Rate limit** — Meta limita outbound por tier do WABA | Ausência de controle de rate limit | Mensagens perdidas, conta bloqueada pela Meta | **MÉDIA** | Implementar controle básico de rate limit em PR-T8.11 | não (stub básico suficiente) |
| R-T810-09 | **Logs insuficientes** — apenas 2/13 eventos de observabilidade | `src/meta/ingest.ts` | Sem visibilidade de falhas de assinatura, dedupe, outbound | **ALTA** | Completar logs em PR-T8.11 | não (importante mas não bloqueia básico) |
| R-T810-10 | **Auto-deploy em push/merge main** | `.github/workflows/deploy.yml` | Qualquer push em main faz deploy automático em produção | **ALTA** | CONF-01 documentado em T8.2; Vasques deve decidir se desativa ou mantém | não (existente desde T8.2) |
| R-T810-11 | **Webhook sem challenge** — Meta não consegue verificar endpoint | Ausência de GET handler | Meta não consegue configurar o webhook | **CRÍTICA** | Criar GET handler em PR-T8.11 | **SIM** |

---

## §16 Plano recomendado para PR-T8.11

### Objetivo da PR-T8.11

Implementar a integração operacional mínima Meta/WhatsApp no Worker, permitindo que o webhook seja verificado pela Meta e que eventos inbound sejam recebidos e validados com segurança. Outbound controlado mínimo (bloqueado por default). Sem cliente real, sem LLM real, sem canal aberto.

### Blocos de implementação

#### Bloco A — Webhook challenge

- Criar rota GET para verificação do webhook Meta (no mesmo path do POST ou em path dedicado)
- Validar `hub.mode === 'subscribe'`
- Validar `hub.verify_token` contra `env.META_VERIFY_TOKEN`
- Retornar 200 + `hub.challenge` se válido; 403 se inválido
- Garantir que GET não cria turno, não gera `reply_text`, não altera estado

#### Bloco B — Assinatura

- Ler header `X-Hub-Signature-256` do POST inbound
- Comparar com `sha256=` + HMAC-SHA256(payload bruto, `env.META_APP_SECRET`)
- Usar `crypto.subtle.sign` disponível no Cloudflare Worker runtime
- Rejeitar com 401/403 se ausente ou inválida
- Preservar payload bruto antes de `request.json()` para cálculo correto do HMAC

#### Bloco C — Inbound parser (payload bruto Meta)

- Parser do formato real Meta Cloud API:
  ```json
  { "object": "whatsapp_business_account",
    "entry": [{ "id": "...", "changes": [{ "value": {
      "messaging_product": "whatsapp",
      "metadata": { "phone_number_id": "..." },
      "messages": [{ "id": "wamid...", "from": "...", "type": "text", "timestamp": "...", "text": { "body": "..." }}],
      "statuses": [{ "id": "...", "status": "delivered", ... }]
    }}]}]}
  ```
- Extrair: `wa_message_id` (campo `id`), `wa_id` (campo `from`), `phone_number_id` (metadata), `timestamp`, `event_type`, `text_content`, `media_ref`
- Separar mensagens de status events
- Status events → system_event; não criar turno

#### Bloco D — Dedupe / idempotência

- Calcular `dedupe_key` a partir de `wa_message_id` (primário) ou `wa_id + timestamp + event_type` (fallback)
- Armazenar em KV ou Supabase (append-only) eventos já processados
- Se `dedupe_key` visto → descartar; HTTP 200 (Meta precisa do 200)
- Se `dedupe_key` novo → processar

#### Bloco E — Outbound controlado (stub)

- Implementar função `sendOutbound(wa_id, phone_number_id, reply_text, access_token)` 
- Por default: `CHANNEL_ENABLED=false` → log de observabilidade, sem envio real
- Quando `CHANNEL_ENABLED=true` + `META_ACCESS_TOKEN` presentes → montar payload e chamar Graph API
- Nunca gerar `reply_text` próprio — somente copiar literalmente o que veio do pipeline

#### Bloco F — Feature flags

- Declarar `CHANNEL_ENABLED` como binding no `wrangler.toml` com default `false`
- Rollout guard atualizado para ler `CHANNEL_ENABLED` do env ao invés de hardcoded
- Smoke confirma que com `CHANNEL_ENABLED=false` nenhum outbound real acontece

#### Bloco G — Logs

- Implementar os 13 eventos de observabilidade do T6.7 §20 mapeados para a telemetria interna (`emitTelemetry`)
- Prioridade: `signature_invalid`, `challenge_responded`, `duplicate`, `normalized`, `forwarded_to_surface`, `outbound_sent/failed`

#### Bloco H — Smoke tests

- `smoke:meta:challenge` — GET challenge válido/inválido
- `smoke:meta:signature` — HMAC válida/inválida/ausente
- `smoke:meta:inbound-raw` — parser payload bruto Meta
- `smoke:meta:dedupe` — idempotência por wa_message_id
- `smoke:meta:outbound` — outbound stub bloqueado por default
- `smoke:meta:status-events` — status não cria turno

#### Bloco I — Rollback

- Com `CHANNEL_ENABLED=false`: zero envio real, canal desabilitado instantaneamente
- Sem re-deploy necessário: apenas setar env var
- `smoke:meta:rollback` — confirma que flag OFF bloqueia outbound

### Declaração explícita de sequência

- **PR-T8.11** é implementação (PR-IMPL) — zero cliente real, zero LLM real, zero canal aberto em produção sem `CHANNEL_ENABLED=true`
- **PR-T8.12** será prova Meta/WhatsApp controlada (PR-PROVA) — requer autorização Vasques para canal real controlado

---

## §17 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/diagnostics/T8_META_WORKER_DIAGNOSTICO.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não — diagnóstico cobre todas as 17 seções solicitadas
Há item parcial/inconclusivo bloqueante?: não — PR-DIAG não implementa; diagnostica
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T8.10 encerrada; PR-T8.11 desbloqueada
Próxima PR autorizada:                 PR-T8.11 — Implementação Meta/WhatsApp + Worker inbound/outbound
```

### Evidência suficiente para avançar?

**SIM** — O diagnóstico cobriu:
- Cruzamento completo T6.7 × código real (§5 — 29 itens)
- Worker routes mapeadas (§6)
- Webhook challenge diagnosticado (§7)
- Assinatura diagnosticada (§8)
- Inbound/outbound diagnosticados (§9 e §10)
- Mídia e documentos (§11)
- Envs/secrets mapeados (§12 — todos ausentes)
- Logs diagnosticados (§13)
- Testes existentes e faltantes (§14)
- 11 riscos de produção (§15)
- Plano objetivo para PR-T8.11 (§16)

### PR-T8.11 autorizada?

**SIM**, com as seguintes condições:
1. Bloco A (challenge) é pré-requisito para registro do webhook na Meta
2. Bloco B (assinatura) é pré-requisito de segurança obrigatório
3. Outbound real só ativo com `CHANNEL_ENABLED=true` + autorização Vasques
4. Zero cliente real em PR-T8.11
5. Zero LLM real em PR-T8.11

### Bloqueios remanescentes

| # | Bloqueio | Para quê está bloqueado |
|---|---|---|
| BLK-01 | Env vars Meta (`META_VERIFY_TOKEN`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`) não declarados | Qualquer integração real — declarar em PR-T8.11 via `wrangler secret put` |
| BLK-02 | Buckets públicos com RLS desativado | Media download real — PR específica antes de T8.12 |
| BLK-03 | Auto-deploy em push/merge main (CONF-01) | Deploy controlado — decisão de Vasques |
| BLK-04 | Pipeline T4/LLM não conectado ao inbound Meta | Outbound real — PR-T8.11 só faz stub; LLM real em T8.R |

### Riscos obrigatórios para PR-T8.11

- R-T810-01: outbound indevido → `CHANNEL_ENABLED=false` por default
- R-T810-02: assinatura ausente → implementar HMAC como primeira barreira
- R-T810-03: replay/dedup ausente → implementar dedupe com KV ou Supabase
- R-T810-05: token exposto → usar apenas `wrangler secret put`, nunca código/documento
- R-T810-06: adapter escrevendo fala → smoke de conformidade obrigatório

### Restrições herdadas

- Adapter nunca escreve `reply_text` (PROB-AD-01 / adendo soberania IA)
- Adapter nunca decide stage, fact_* ou current_phase
- Zero cliente real sem PR-PROVA e autorização Vasques
- Zero LLM real sem PR-PROVA
- PR-T8.12 (prova Meta/WhatsApp controlada) depende de PR-T8.11 aprovada
