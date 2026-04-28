# T6_ADAPTER_META_WHATSAPP — Adapter Meta/WhatsApp Governado — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.7 |
| Branch | feat/t6-pr-t6-7-adapter-meta-whatsapp |
| Artefato | Contrato declarativo do adapter Meta/WhatsApp governado |
| Status | entregue |
| Pré-requisito | PR-T6.6 merged (#131 — 2026-04-28T20:56:34Z); T6_STICKER_MIDIA_INUTIL.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.8 — Dossiê operacional e link do correspondente |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Este artefato declara o contrato declarativo do **adapter Meta/WhatsApp governado** da ENOVA 2.
Cobre como eventos do canal WhatsApp/Meta (mensagens, mídia, status, challenge de verificação) devem
ser recebidos (inbound), validados, deduplicados, normalizados e entregues à surface; e como a saída
validada do pipeline é enviada de volta ao canal (outbound).

**Princípio-mãe:** o adapter é canal — não é cérebro. Adapter não escreve `reply_text`, não decide
stage, não cria `fact_*`, não valida documento, não transcreve áudio, não interpreta aprovação e não
faz go-live. O adapter apenas transporta: recebe evento → entrega à surface/T4; recebe saída validada
do T4/T4.4 → envia ao canal.

```
Meta/WhatsApp bruto → Adapter governado → T6_SURFACE_CANAL → T4 → T3 → T2 → T5
                                      ↑                              ↓
                                      └─────── Outbound aprovado ────┘
```

**Esta PR é declarativa — não implementa runtime, não cria webhook real, não abre canal real.**

---

## §2 Finalidade do adapter Meta/WhatsApp

O adapter Meta/WhatsApp é a **fronteira técnica entre o canal externo (Meta/WhatsApp Cloud API) e a
governança interna da ENOVA 2 (T6_SURFACE_CANAL → T4 → T3 → T2 → T5)**.

**O que o adapter faz:**
- Recebe eventos inbound via webhook Meta (mensagens, mídia, status, verificação)
- Valida a assinatura criptográfica do payload inbound
- Extrai identificadores técnicos do evento (`wa_message_id`, `wa_id`, `phone_number_id`, etc.)
- Calcula e verifica `dedupe_key` para prevenção de duplicidade
- Normaliza o evento bruto para o formato que a surface espera
- Entrega o evento normalizado à `T6_SURFACE_CANAL`
- Recebe a intenção de envio outbound do pipeline (T4.4)
- Monta o payload técnico para a API Meta/WhatsApp
- Aplica rate limit e retry policy
- Envia o outbound ao canal
- Registra eventos técnicos de observabilidade

**O que o adapter NÃO faz:**
- Não escreve `reply_text` ao cliente
- Não decide stage ou fase do funil
- Não persiste `fact_*` confirmados no lead_state
- Não classifica documento, imagem, sticker ou mídia
- Não transcreve áudio
- Não faz OCR
- Não aplica regras de negócio MCMV
- Não decide aprovação/reprovação de cliente
- Não decide se documento é válido
- Não monta dossiê
- Não envia ao correspondente
- Não faz shadow, canary ou cutover
- Não é go-live amplo

---

## §3 Princípio central: canal não é cérebro

**Regra-mãe (herdada do contrato T6 §1, A00-ADENDO-01 e A00-ADENDO-02):**

> **Adapter é canal.**
> **Adapter não é cérebro.**
> **Adapter não escreve `reply_text`.**
> **Adapter não decide stage.**
> **Adapter não cria `fact_*`.**
> **Adapter não cria `current_phase`.**
> **Adapter não persiste fato confirmado.**
> **Adapter não valida documento.**
> **Adapter não transcreve áudio.**
> **Adapter não faz OCR.**
> **Adapter não classifica mídia como aceita.**
> **Adapter não interpreta aprovação/reprovação.**
> **Adapter só recebe e envia — nunca decide.**

O adapter é somente a **camada de transporte técnico governada**. Ele normaliza a entrada e transporta
a saída — sem raciocinar, sem produzir fala, sem decidir nada sobre o funil.

---

## §4 Relação com `T6_SURFACE_CANAL`

O adapter é upstream de `T6_SURFACE_CANAL`. A relação entre os dois é:

```
Evento bruto Meta → Adapter (validação técnica, dedupe) → Evento bruto de canal
                                                                ↓
                                              T6_SURFACE_CANAL (normalização)
                                                                ↓
                                                 SurfaceEventNormalizado
                                                                ↓
                                               TurnoEntrada (T4.1) → T4_PIPELINE_LLM
```

**Responsabilidades do adapter vs. surface:**

| Responsabilidade | Adapter | Surface (T6_SURFACE_CANAL) |
|---|---|---|
| Verificação de assinatura Meta | ✅ | ❌ |
| Deduplicação por `wa_message_id` | ✅ | complementar |
| Extração de identificadores técnicos Meta | ✅ | ❌ |
| Classificação do `input_type` | ❌ | ✅ |
| Criação de `SurfaceEventNormalizado` | ❌ | ✅ |
| Criação de `dedupe_key` | base técnica | consolidado |
| Adição de `surface_warnings` | pode contribuir | ✅ |
| Roteamento para T4 | ❌ | ✅ |

**O adapter não substitui a surface.** Ele prepara o evento bruto para que a surface possa normalizá-lo
de acordo com seu contrato próprio (T6_SURFACE_CANAL §4–§8).

---

## §5 Relação com T4/T3/T2/T5

O adapter não acessa T4/T3/T2/T5 diretamente. O fluxo completo:

```
Meta/WhatsApp bruto
        ↓
Adapter (§7 — inbound) → validação, dedupe, extração de identificadores
        ↓
T6_SURFACE_CANAL → SurfaceEventNormalizado
        ↓
TurnoEntrada(T4.1) → attachments[]
        ↓
T4_PIPELINE_LLM → LLM gera reply_text
        ↓
T3_CLASSES_POLITICA / T3_VETO_SUAVE_VALIDADOR
        ↓
T2_RECONCILIACAO / T2_POLITICA_CONFIANCA
        ↓
T4_VALIDACAO_PERSISTENCIA — persiste somente o que VC-01..09 aprovam
        ↓
T4_RESPOSTA_RASTRO_METRICAS — reply_text aprovado entregue ao adapter
        ↓
Adapter (§8 — outbound) → payload técnico → Meta/WhatsApp canal
```

**Garantia de integração:**
- Adapter nunca bypassa a surface ou o pipeline T4
- `reply_text` do outbound é exclusivamente o que saiu do LLM via T4.4 (T4_RESPOSTA_RASTRO_METRICAS)
- Adapter não reescreve nem complementa o `reply_text`
- Falhas de envio outbound viram `system_event` — não viram fala mecânica ao cliente
- Status de entrega (delivered/read) voltam como `system_event` para rastro/observabilidade

---

## §6 Tipos de evento Meta/WhatsApp cobertos

### 6.1 Eventos inbound (mensagens do cliente)

| Tipo de evento | Código | Mapeamento na surface |
|---|---|---|
| Mensagem de texto | `text_message` | `input_type=text` |
| Imagem | `image_message` | `input_type=image` |
| Documento/PDF | `document_message` | `input_type=document` |
| Áudio | `audio_message` | `input_type=audio` |
| Sticker | `sticker_message` | `input_type=sticker` |
| Botão/list reply | `interactive_reply` | `input_type=button_or_link` |
| Link/clique | `link_click` | `input_type=button_or_link` |
| Reação | `reaction_event` | `input_type=system_event`, `input_subtype=reaction` |
| Vídeo | `video_message` | `input_type=unknown_or_invalid` (fora de escopo documental) |
| Contato | `contact_message` | `input_type=unknown_or_invalid` |
| Localização | `location_message` | `input_type=unknown_or_invalid` |

### 6.2 Eventos de status (sistema)

| Tipo de evento | Código | Tratamento |
|---|---|---|
| Confirmação de entrega | `delivery_status` | `input_type=system_event` → rastro técnico |
| Confirmação de leitura | `read_status` | `input_type=system_event` → rastro técnico |
| Falha de envio | `send_failure` | `input_type=system_event` → rastro técnico; não cria fala |
| Erro de rate limit | `rate_limit_error` | `input_type=system_event` → controle técnico |

### 6.3 Eventos técnicos do adapter

| Tipo de evento | Código | Tratamento |
|---|---|---|
| Webhook verification challenge | `wh_challenge` | Responde tecnicamente; não cria turno |
| Payload duplicado | `duplicate_event` | Idempotência — descarta; não cria turno |
| Payload fora de ordem | `out_of_order_event` | Registra; processo de ordenação conceitual |
| Payload inválido | `invalid_payload` | Rejeita; rastro técnico; não entra no pipeline |
| Mídia pendente de download | `media_pending` | Preserva referência; surface recebe com warning |
| Mídia indisponível | `media_unavailable` | Preserva referência; surface recebe como `unknown_or_invalid` |
| Retry da Meta | `meta_retry` | Idempotência — verifica `wa_message_id`; não duplica turno |
| Opt-in futuro | `optin_event` | Evento técnico; governança futura; não avança funil |
| Opt-out futuro | `optout_event` | Evento técnico; governança futura; não avança funil |

---

## §7 Fluxo inbound declarativo

O fluxo a seguir é **declarativo** — descreve o que deve acontecer, sem implementar runtime.

```
Etapa 1  — Meta/WhatsApp envia POST para endpoint de webhook.
Etapa 2  — Adapter valida método HTTP e rota conceitual.
           ├─ Método inválido → rejeita (HTTP 405) sem entrar no pipeline.
           └─ Rota inválida  → rejeita (HTTP 404) sem entrar no pipeline.
Etapa 3  — Adapter valida assinatura/verificação conforme §10.
           ├─ Assinatura inválida → rejeita (HTTP 401/403); rastro técnico; não entra no pipeline.
           └─ Assinatura válida  → prossegue.
Etapa 4  — Adapter extrai identificadores técnicos:
           ├─ wa_message_id   (identificador único da mensagem na Meta API)
           ├─ wa_id           (WhatsApp ID do remetente)
           ├─ phone_number_id (identificador do número da ENOVA no canal)
           ├─ timestamp       (timestamp do evento na Meta)
           ├─ event_type      (tipo do evento: text, image, audio, sticker, status, etc.)
           └─ payload_ref     (referência ao payload bruto para rastreabilidade)
Etapa 5  — Adapter calcula dedupe_key:
           ├─ Fonte primária: wa_message_id (quando presente)
           └─ Fallback:       sha256(wa_id + timestamp + event_type + payload_hash_parcial) [conceitual]
Etapa 6  — Adapter consulta idempotência conceitual (§11):
           ├─ dedupe_key já visto → evento duplicado → descarta; retorna HTTP 200 sem novo turno.
           └─ dedupe_key novo    → evento original → prossegue.
Etapa 7  — Adapter verifica se é evento técnico puro (§6.3):
           ├─ wh_challenge  → responde challenge tecnicamente; não cria turno; não gera reply_text.
           ├─ status event  → registra para rastro/observabilidade; não cria turno conversacional.
           └─ Evento de mensagem → prossegue.
Etapa 8  — Adapter normaliza para evento bruto de canal:
           Cria objeto AdapterEventoBruto com:
           ├─ adapter_event_id  (UUID gerado pelo adapter)
           ├─ wa_message_id
           ├─ wa_id
           ├─ phone_number_id
           ├─ timestamp
           ├─ event_type
           ├─ dedupe_key
           ├─ media_ref          (URL/referência da mídia, se houver)
           ├─ media_mime_type    (se disponível no payload Meta)
           ├─ media_filename     (se disponível)
           ├─ media_size_bytes   (se disponível)
           ├─ text_content       (texto da mensagem, se houver)
           ├─ caption            (legenda de mídia, se houver)
           ├─ interactive_payload (para botão/list reply)
           ├─ adapter_warnings   (warnings técnicos identificados pelo adapter)
           └─ raw_payload_ref    (referência ao payload Meta original — preservado sempre)
Etapa 9  — Adapter entrega AdapterEventoBruto à T6_SURFACE_CANAL.
Etapa 10 — T6_SURFACE_CANAL normaliza para SurfaceEventNormalizado (governança da surface).
Etapa 11 — Surface entrega TurnoEntrada(T4.1) ao pipeline.
Etapa 12 — T4_PIPELINE_LLM gera reply_text via LLM.
Etapa 13 — T3/T2 validam e reconciliam.
Etapa 14 — T4_VALIDACAO_PERSISTENCIA persiste o que VC-01..09 aprovam.
Etapa 15 — T4_RESPOSTA_RASTRO_METRICAS produz saída aprovada com reply_text do LLM.
Etapa 16 — Adapter recebe intenção de envio outbound (§8).
```

**Invariantes do fluxo inbound:**

| Código | Invariante |
|---|---|
| INV-AD-01 | Assinatura inválida nunca entra no pipeline |
| INV-AD-02 | Evento duplicado nunca cria novo turno |
| INV-AD-03 | wh_challenge nunca cria turno conversacional |
| INV-AD-04 | Status event (delivered/read/failed) nunca cria turno conversacional |
| INV-AD-05 | Adapter nunca cria `reply_text` no fluxo inbound |
| INV-AD-06 | Adapter nunca cria `fact_*` no fluxo inbound |
| INV-AD-07 | raw_payload_ref é sempre preservado |
| INV-AD-08 | Adapter responde HTTP 200 ao Meta assim que valida — não espera conclusão do pipeline |

---

## §8 Fluxo outbound declarativo

O fluxo a seguir é **declarativo** — descreve o que deve acontecer, sem implementar runtime.

```
Etapa 1  — T4_RESPOSTA_RASTRO_METRICAS produz TurnoSaida com reply_text aprovado pelo pipeline.
Etapa 2  — TurnoSaida contém reply_text do LLM já validado por T3/T2/T4.3.
Etapa 3  — Adapter recebe IntencaoEnvioOutbound:
           ├─ turn_id           (identificador do turno)
           ├─ case_id           (identificador do lead)
           ├─ surface_event_id  (referência ao evento inbound que gerou este outbound)
           ├─ wa_id             (destinatário WhatsApp)
           ├─ phone_number_id   (número da ENOVA no canal)
           ├─ reply_text        (texto aprovado — exclusivamente do LLM via T4.4)
           ├─ reply_type        (text | template_future | media_future)
           └─ context_message_id (opcional — para responder no contexto da mensagem original)
Etapa 4  — Adapter monta payload técnico para Meta WhatsApp Cloud API:
           ├─ Campo "to": wa_id
           ├─ Campo "type": "text" (ou tipo específico)
           ├─ Campo "text.body": reply_text (copiado literalmente — sem modificação)
           └─ Metadados técnicos de rastreabilidade
Etapa 5  — Adapter preserva rastreabilidade outbound:
           ├─ outbound_attempt_id  (UUID do attempt de envio)
           ├─ turn_id
           ├─ case_id
           ├─ surface_event_id
           ├─ wa_id
           ├─ phone_number_id
           ├─ timestamp_requested
           └─ reply_text_hash     (hash do conteúdo para auditoria — nunca logar em claro em excesso)
Etapa 6  — Adapter aplica rate limit (§15) antes do envio.
Etapa 7  — Adapter aplica retry policy (§13) se configurado.
Etapa 8  — Adapter envia ao canal via Meta API.
Etapa 9  — Adapter registra resultado do envio:
           ├─ Sucesso: outbound_message_id devolvido pela Meta API; evento adapter.outbound.sent
           └─ Falha:   código de erro; evento adapter.outbound.failed; rastro técnico
Etapa 10 — Eventos de status de entrega (delivered/read) voltam como inbound system_event → §6.2.
Etapa 11 — Falha permanente de envio vira rastro técnico; não vira fala mecânica ao cliente.
```

**Invariantes do fluxo outbound:**

| Código | Invariante |
|---|---|
| INV-AD-09 | Adapter nunca cria nem modifica reply_text — copia literalmente o que recebeu do pipeline |
| INV-AD-10 | Adapter nunca envia outbound sem IntencaoEnvioOutbound aprovada pelo pipeline T4 |
| INV-AD-11 | Retry outbound não duplica o outbound_message_id se o envio anterior já foi aceito pela Meta |
| INV-AD-12 | Falha de envio vira rastro técnico — não vira fala mecânica gerada pelo adapter |
| INV-AD-13 | Adapter nunca envia template de fala próprio |

---

## §9 Verificação de webhook

**Webhook verification challenge (GET endpoint):**

Quando a Meta envia um GET de verificação ao endpoint configurado, o adapter deve:

1. Verificar que o parâmetro `hub.mode` é `subscribe`
2. Verificar que o parâmetro `hub.verify_token` bate com o token configurado (conceitual)
3. Responder com o valor de `hub.challenge` — HTTP 200

**Regras:**

| Código | Regra |
|---|---|
| WH-01 | Challenge é evento técnico — não cria turno |
| WH-02 | Challenge não gera `reply_text` |
| WH-03 | Challenge não cria `fact_*` nem `current_phase` |
| WH-04 | Verificação com token inválido → HTTP 403; rastro técnico; não entra no pipeline |
| WH-05 | Token de verificação não deve ser exposto em log nem em documento |
| WH-06 | Endpoint de verificação e endpoint de eventos podem ser o mesmo (diferenciação por método: GET vs POST) |
| WH-07 | Implementação real do challenge é futura — esta PR apenas declara o contrato |

---

## §10 Verificação de assinatura

**Assinatura Meta (X-Hub-Signature-256):**

Toda requisição POST inbound da Meta inclui o header `X-Hub-Signature-256` com HMAC-SHA256 do
payload usando o App Secret. O adapter deve validar essa assinatura antes de processar qualquer evento.

**Regras:**

| Código | Regra |
|---|---|
| SIG-01 | Assinatura ausente → rejeitar; HTTP 401; rastro técnico |
| SIG-02 | Assinatura inválida → rejeitar; HTTP 403; rastro técnico |
| SIG-03 | Payload sem assinatura válida nunca entra no pipeline T6_SURFACE_CANAL → T4 |
| SIG-04 | Falha de assinatura é controle de segurança — não é conversa com o cliente |
| SIG-05 | Falha de assinatura não gera `reply_text`, não cria `fact_*`, não altera stage |
| SIG-06 | App Secret não deve aparecer em log, documento ou variável exposta |
| SIG-07 | Proteção contra replay: verificar `timestamp` do payload; rejeitar payloads muito antigos (limiar conceitual: > 5 minutos) |
| SIG-08 | Implementação real da assinatura é futura — esta PR declara o contrato para futura implementação |
| SIG-09 | Validação deve acontecer antes de qualquer outra etapa do fluxo inbound |

---

## §11 Idempotência

**Princípio:** todo evento inbound pode ser reenviado pela Meta (retry automático). O adapter deve
garantir que um mesmo evento seja processado apenas uma vez, independente de quantas vezes a Meta
o enviar.

**Mecanismo conceitual de idempotência:**

```
1. Extrair dedupe_key do evento (§7 etapa 5).
2. Consultar registro conceitual de eventos processados.
3. Se dedupe_key encontrado → evento já processado → descartar; HTTP 200 (Meta precisa do 200).
4. Se dedupe_key não encontrado → evento novo → registrar + processar.
5. Registro conceitual: { dedupe_key, adapter_event_id, timestamp_received, status }
```

**Regras de idempotência:**

| Código | Regra |
|---|---|
| IDP-01 | Todo inbound precisa de dedupe_key calculado antes de chegar na surface |
| IDP-02 | `wa_message_id` é a fonte primária de dedupe quando presente |
| IDP-03 | Fallback de dedupe: combinação conceitual de `wa_id + timestamp + event_type + payload_hash` |
| IDP-04 | Retry da Meta (mesmo `wa_message_id`) não cria novo turno conversacional |
| IDP-05 | Mídia repetida (mesmo conteúdo, mesmo `wa_message_id`) não duplica documento no dossiê |
| IDP-06 | Status events (delivered/read) nunca criam turno conversacional |
| IDP-07 | Dedupe acontece antes de entregar para T6_SURFACE_CANAL |
| IDP-08 | Idempotência é requisito bloqueante antes de qualquer runtime futuro |
| IDP-09 | Adapter responde HTTP 200 ao Meta para qualquer evento (duplicado ou novo) — Meta interpreta não-200 como falha e faz retry |
| IDP-10 | Implementação real do registro de idempotência é futura — esta PR declara o contrato |

---

## §12 Deduplicação por `message_id`

**Deduplicação é o mecanismo prático da idempotência. Complementa §11.**

**Campos de deduplicação:**

| Campo | Fonte | Prioridade |
|---|---|---|
| `wa_message_id` | Meta API (campo `id` do objeto messages) | Principal — quando presente |
| `wa_id + timestamp + event_type` | Meta API (combinação conceitual) | Fallback — quando `wa_message_id` ausente |
| `payload_hash` | Hash do payload bruto (SHA256 conceitual) | Complementar |

**Regras de deduplicação:**

| Código | Regra |
|---|---|
| DD-01 | `wa_message_id` é a chave de dedupe primária para mensagens inbound |
| DD-02 | Para status events (delivered/read), dedupe por `status_id` da Meta API |
| DD-03 | Para eventos sem `message_id` claro, usar combinação `wa_id + timestamp + event_type` |
| DD-04 | Evento duplicado (dedupe_key repetido) → descartar; não gerar turno; HTTP 200 ao Meta |
| DD-05 | Mídia repetida identificada por dedupe → referência ao evento original; não criar novo documento |
| DD-06 | `dedupe_key` gerado pelo adapter é repassado à surface como campo de `SurfaceEventNormalizado` |
| DD-07 | Deduplicação é responsabilidade do adapter — surface herda o `dedupe_key` calculado |
| DD-08 | Reenvio intencional do cliente (mensagem nova com conteúdo idêntico) gera `wa_message_id` diferente → não é duplicata |

---

## §13 Regras de retry

### Retry inbound (Meta → Adapter)

O retry inbound é controlado pela Meta: ela reenveia automaticamente se não receber HTTP 200.

| Código | Regra |
|---|---|
| RTI-01 | Adapter responde HTTP 200 imediatamente após validação de assinatura (antes do pipeline completar) |
| RTI-02 | Retry inbound da Meta é capturado pela idempotência (§11) — não gera novo turno |
| RTI-03 | Adapter não controla o retry inbound da Meta — controla apenas a idempotência |

### Retry outbound (Adapter → Meta)

O retry outbound é iniciado pelo adapter quando o envio ao canal falha.

| Código | Regra |
|---|---|
| RTO-01 | Erro temporário (HTTP 5xx da Meta, timeout) pode ser reprocessado com retry |
| RTO-02 | Retry outbound tem limite máximo declarado (conceitual: máximo 3 tentativas) |
| RTO-03 | Retry não pode duplicar mensagem ao cliente (verificar `outbound_message_id` da Meta) |
| RTO-04 | Erro permanente (HTTP 4xx da Meta) não deve ser reprocessado — vira rastro técnico |
| RTO-05 | Retry não cria novo `reply_text` — reenvia o mesmo payload original |
| RTO-06 | Retry não altera stage, não confirma fato, não cria `fact_*` |
| RTO-07 | Após esgotar retries → evento `adapter.retry_exhausted`; rastro técnico; ação operacional futura |
| RTO-08 | Timeout entre retries: backoff exponencial conceitual (ex.: 1s, 4s, 16s) |
| RTO-09 | Falha permanente de envio não gera fala mecânica ao cliente pelo adapter |

---

## §14 Tratamento de erro

**Erros do adapter são técnicos — não são conversas com o cliente.**

### Erros inbound

| Código | Cenário | Tratamento |
|---|---|---|
| ERR-AD-01 | Assinatura inválida | Rejeitar (HTTP 401/403); rastro técnico; não entra no pipeline |
| ERR-AD-02 | Payload inválido/malformado | Rejeitar; rastro técnico; não entra no pipeline |
| ERR-AD-03 | Tipo de evento desconhecido | Mapear para `unknown_or_invalid`; surface recebe com warning |
| ERR-AD-04 | Mídia indisponível | Preservar referência; surface recebe com `surface_warnings=["media_unavailable"]` |
| ERR-AD-05 | Mídia muito grande | Preservar referência; surface recebe com `surface_warnings=["media_too_large"]` |
| ERR-AD-06 | Payload fora de ordem | Registrar; tentar ordenar conceitual; se impossível, processar com warning |
| ERR-AD-07 | Falha na extração de `wa_message_id` | Usar fallback de dedupe; registrar warning; continuar |
| ERR-AD-08 | Erro interno do adapter | Registrar; retornar HTTP 500 ao Meta (Meta faz retry — idempotência captura) |

### Erros outbound

| Código | Cenário | Tratamento |
|---|---|---|
| ERR-AD-09 | HTTP 4xx da Meta API | Erro permanente; rastro técnico; sem retry |
| ERR-AD-10 | HTTP 5xx da Meta API | Erro temporário; retry com backoff (§13) |
| ERR-AD-11 | Timeout na Meta API | Erro temporário; retry com backoff (§13) |
| ERR-AD-12 | Rate limit atingido (HTTP 429 da Meta) | Aguardar conforme §15; retry após intervalo |
| ERR-AD-13 | wa_id inválido ou bloqueado | Erro permanente; rastro técnico; sem retry; sem fala mecânica |
| ERR-AD-14 | reply_text ausente ou nulo | Erro de pipeline — não enviar; rastro técnico; T4_FALLBACKS.md governa |

**Nenhum erro do adapter gera fala mecânica ao cliente.** Toda falha é rastro técnico + evento de
observabilidade. Se o cliente precisa ser informado de algo, é o LLM que decide a fala via pipeline.

---

## §15 Rate limit

**Rate limit é controle técnico — não é conversa e não altera regra de negócio.**

**Tipos de rate limit relevantes:**

| Tipo | Fonte | Tratamento |
|---|---|---|
| Rate limit de mensagens outbound | Meta API (tier do WABA) | Esperar; retry após intervalo; não enviar fala mecânica |
| Rate limit de download de mídia | Meta API | Esperar; surface recebe referência com warning |
| Rate limit interno (conceitual) | Controle interno do adapter | Fila de envio conceitual; sem duplicação |

**Regras de rate limit:**

| Código | Regra |
|---|---|
| RL-01 | Rate limit é controle técnico — não altera regra de negócio MCMV |
| RL-02 | Rate limit não muda stage do funil |
| RL-03 | Rate limit não gera fala mecânica ao cliente pelo adapter |
| RL-04 | Em fila/espera por rate limit, qualquer fala ao cliente continua responsabilidade do LLM/T4 |
| RL-05 | Evento de rate limit registra `adapter.rate_limited` para observabilidade |
| RL-06 | T6.7 não implementa fila real — declara apenas o contrato conceitual |
| RL-07 | Rate limit de download de mídia: adapter preserva referência e entrega à surface com warning |

---

## §16 Mídia e anexos

**O adapter é somente transportador de mídia — não processa, classifica, transcreve nem valida.**

**Regras de mídia:**

| Código | Regra |
|---|---|
| MID-01 | Adapter não classifica documento — preserva referência (`media_ref`) e `media_mime_type` |
| MID-02 | Adapter não faz OCR em nenhuma circunstância |
| MID-03 | Adapter não transcreve áudio — preserva referência e repassa para surface |
| MID-04 | Adapter não valida documento — nem de identidade, nem de renda, nem de qualquer tipo |
| MID-05 | Adapter só preserva referência técnica: `media_ref`, `media_mime_type`, `media_filename`, `media_size_bytes` |
| MID-06 | Mídia de mensagem segue para T6_SURFACE_CANAL com todos os campos técnicos preservados |
| MID-07 | Documento/imagem/PDF → governança de T6.3/T6.4 (via surface → T4 → LLM) |
| MID-08 | Áudio → governança de T6.5 (via surface → T4 → LLM) |
| MID-09 | Sticker/mídia inútil → governança de T6.6 (via surface → T4 → LLM) |
| MID-10 | Mídia pendente de download: surface recebe referência + `surface_warnings=["media_pending"]` |
| MID-11 | Mídia indisponível: surface recebe referência + `surface_warnings=["media_unavailable"]` |
| MID-12 | Mídia muito grande: surface recebe referência + `surface_warnings=["media_too_large"]` |
| MID-13 | Adapter nunca entra em dossiê — quem monta dossiê é T6.8 |
| MID-14 | Download real de mídia da Meta API é operação futura — esta PR declara o contrato |

---

## §17 Eventos de status

**Status events são técnicos — não são mensagens do cliente e não criam turno conversacional.**

**Mapeamento de status events:**

| Status Meta API | Código interno | Tratamento |
|---|---|---|
| `delivered` | `delivery_status` | `system_event` → rastro técnico; não cria turno |
| `read` | `read_status` | `system_event` → rastro técnico; não cria turno |
| `sent` | `send_confirmed` | `system_event` → rastro técnico; não cria turno |
| `failed` | `send_failure` | `system_event` → rastro técnico; possível ação técnica; não gera fala |
| `deleted` | `message_deleted` | `system_event` → rastro técnico; não altera lead_state |

**Regras de status:**

| Código | Regra |
|---|---|
| ST-01 | Status events (delivered/read/failed) são `system_event` — não são mensagens do cliente |
| ST-02 | Status não avança stage |
| ST-03 | Status não confirma intenção do cliente |
| ST-04 | Status não gera `reply_text` |
| ST-05 | Status não cria `fact_*` |
| ST-06 | Status alimenta rastro/observabilidade futura (TurnoRastro, métricas) |
| ST-07 | Erro de envio (`failed`) pode exigir ação técnica futura — não decisão de funil |
| ST-08 | Status event não cria turno conversacional — não vai para T4_PIPELINE_LLM como conversa |

---

## §18 Separação canal/cérebro

**Esta seção declara explicitamente a separação entre responsabilidades do adapter (canal) e do
pipeline (cérebro). É a âncora de conformidade com A00-ADENDO-01 e A00-ADENDO-02.**

| Responsabilidade | Quem decide | Adapter pode? |
|---|---|---|
| O que dizer ao cliente | LLM (via T4_PIPELINE_LLM) | NÃO |
| Quando avançar de stage | T3/T2/T4 (via pipeline) | NÃO |
| Se documento é válido | T6.3/T6.4 (via pipeline + LLM) | NÃO |
| Se cliente aprovou visita | LLM + T2 (via pipeline) | NÃO |
| Se cliente foi aprovado/reprovado | Pipeline T3/T2/T4 | NÃO |
| Se dossiê está completo | T6.8 (via pipeline) | NÃO |
| Regra comercial MCMV | T2/T3 (via pipeline) | NÃO |
| Interpretação de emoji/sticker | LLM (via pipeline) | NÃO |
| Classificação de mídia | T6_SURFACE_CANAL (via pipeline) | NÃO |
| Transcrição de áudio | T6.5 (via pipeline + LLM) | NÃO |
| Recepcionar evento bruto | Adapter | ✅ |
| Validar assinatura Meta | Adapter | ✅ |
| Calcular dedupe_key | Adapter | ✅ |
| Verificar idempotência | Adapter | ✅ |
| Extrair identificadores técnicos | Adapter | ✅ |
| Montar payload outbound técnico | Adapter | ✅ |
| Copiar reply_text literalmente | Adapter | ✅ |
| Aplicar rate limit/retry | Adapter | ✅ |
| Registrar eventos de observabilidade | Adapter | ✅ |

**Regra absoluta:** o adapter só recebe e envia — nunca decide.

---

## §19 Segurança mínima

**Requisitos de segurança declarados para futura implementação:**

| Código | Requisito | Descrição |
|---|---|---|
| SEC-01 | Validação de assinatura obrigatória | Toda requisição POST deve ter `X-Hub-Signature-256` válida (§10) |
| SEC-02 | Proteção contra replay | Rejeitar payloads com timestamp > limiar (conceitual: 5 minutos) |
| SEC-03 | Proteção contra duplicidade | Idempotência por `dedupe_key` (§11) |
| SEC-04 | Rejeição de payload inválido | Payload malformado ou com schema inválido → HTTP 400; rastro técnico |
| SEC-05 | Não logar conteúdo sensível em excesso | `reply_text` e dados de identificação não devem aparecer em logs de debug em produção |
| SEC-06 | Preservar referências técnicas | `wa_message_id`, `wa_id`, `dedupe_key` preservados para rastreabilidade |
| SEC-07 | Não expor tokens em documento | Verify token, App Secret, Access Token: nunca em código comentado, documento ou variável exposta |
| SEC-08 | Não criar env real nesta PR | Declarar apenas as variáveis conceituais necessárias |
| SEC-09 | Não mexer em Cloudflare/Meta nesta PR | Esta PR é declarativa |
| SEC-10 | Não criar webhook endpoint real em `src/` | Esta PR é declarativa |

**Variáveis conceituais necessárias (para futura implementação — não criar aqui):**

```
META_APP_SECRET          — para validação de assinatura HMAC-SHA256
META_VERIFY_TOKEN        — para webhook verification challenge
META_ACCESS_TOKEN        — para chamadas outbound à Meta API
META_PHONE_NUMBER_ID     — identificador do número ENOVA no canal
META_WABA_ID             — WhatsApp Business Account ID
```

Estas variáveis são conceituais. Nenhuma deve ser criada, exposta ou hardcoded nesta PR.

---

## §20 Observabilidade mínima

**Eventos conceituais de observabilidade — não criar logger real nesta PR.**

| Evento | Descrição | Quando |
|---|---|---|
| `adapter.inbound.received` | Evento inbound chegou ao adapter | Etapa 2 do fluxo inbound |
| `adapter.inbound.signature_invalid` | Assinatura Meta inválida | §10 SIG-01/02 |
| `adapter.inbound.duplicate` | Evento duplicado capturado pela idempotência | §11 |
| `adapter.inbound.normalized` | AdapterEventoBruto criado | §7 etapa 8 |
| `adapter.inbound.forwarded_to_surface` | Evento entregue à T6_SURFACE_CANAL | §7 etapa 9 |
| `adapter.inbound.challenge_responded` | wh_challenge respondido | §9 |
| `adapter.outbound.requested` | IntencaoEnvioOutbound recebida pelo adapter | §8 etapa 3 |
| `adapter.outbound.sent` | Envio ao canal confirmado | §8 etapa 9 (sucesso) |
| `adapter.outbound.failed` | Falha de envio ao canal | §8 etapa 9 (falha) |
| `adapter.status.received` | Status event (delivered/read/failed) recebido | §17 |
| `adapter.rate_limited` | Rate limit aplicado | §15 RL-05 |
| `adapter.retry_scheduled` | Retry outbound agendado | §13 RTO-01..08 |
| `adapter.retry_exhausted` | Retries outbound esgotados | §13 RTO-07 |

Estes eventos são conceituais. A implementação real de logger/telemetria é responsabilidade futura,
complementada pela suite de testes T6.9 e observabilidade de T7.

---

## §21 Proibições absolutas

| Código | Proibição |
|---|---|
| PROB-AD-01 | Adapter gerar `reply_text` de forma autônoma |
| PROB-AD-02 | Adapter decidir stage ou avançar funil |
| PROB-AD-03 | Adapter criar `fact_*` de qualquer tipo |
| PROB-AD-04 | Adapter criar `current_phase` |
| PROB-AD-05 | Adapter confirmar dado de cliente (renda, estado civil, restrição, CPF/RG, elegibilidade) |
| PROB-AD-06 | Adapter validar documento |
| PROB-AD-07 | Adapter transcrever áudio |
| PROB-AD-08 | Adapter fazer OCR em qualquer mídia |
| PROB-AD-09 | Adapter classificar mídia como `accepted_for_dossier` |
| PROB-AD-10 | Adapter montar ou enviar dossiê |
| PROB-AD-11 | Adapter enviar ao correspondente |
| PROB-AD-12 | Adapter interpretar aprovação/reprovação de cliente |
| PROB-AD-13 | Adapter tratar status de entrega como resposta do cliente |
| PROB-AD-14 | Retry criar novo turno duplicado (idempotência violada) |
| PROB-AD-15 | Webhook duplicado criar duas conversas simultâneas |
| PROB-AD-16 | Rate limit gerar fala mecânica ao cliente pelo adapter |
| PROB-AD-17 | Assinatura inválida entrar no pipeline T6_SURFACE_CANAL |
| PROB-AD-18 | Criar webhook real em `src/` nesta PR |
| PROB-AD-19 | Criar env/secret real nesta PR |
| PROB-AD-20 | Executar deploy, abrir WhatsApp real, abrir T7, fazer shadow/canary/cutover |

---

## §22 Riscos e mitigação

| # | Risco | Mitigação declarada |
|---|---|---|
| R-AD-01 | Meta enviar evento duplicado (retry automático) | §11 IDP-01..10: idempotência por dedupe_key; duplicate descarta; HTTP 200 ao Meta |
| R-AD-02 | Adapter gerar reply_text próprio | PROB-AD-01 + INV-AD-09: adapter copia literalmente — nunca cria conteúdo |
| R-AD-03 | Assinatura não verificada | §10 SIG-01..09: validação obrigatória antes de qualquer processamento |
| R-AD-04 | Mídia bypassar T6_SURFACE_CANAL | §16 MID-06: toda mídia passa pela surface; adapter só preserva referência |
| R-AD-05 | Status event (delivered) ser tratado como mensagem de cliente | §17 ST-01..08: status é system_event; não cria turno |
| R-AD-06 | Retry outbound duplicar mensagem ao cliente | §13 RTO-03: verificar outbound_message_id; se já aceito pela Meta, não reenviar |
| R-AD-07 | Rate limit interromper atendimento | §15 RL-01..07: rate limit é técnico; funil não para; fala é do LLM quando necessário |
| R-AD-08 | Evento fora de ordem alterar contexto | §6.3 `out_of_order_event`: registrar; processar com warning; surface recebe com aviso |
| R-AD-09 | T6.7 ser confundido com go-live | §2, §21 PROB-AD-20: esta PR é declarativa; T7 governa go-live; B-T6-07/08 ativos |
| R-AD-10 | App Secret ou Access Token exposto | §19 SEC-07: nunca em código, documento ou variável exposta; variáveis conceituais apenas |

---

## §23 Critérios de aceite da T6.7

| # | Critério | Verificação |
|---|---|---|
| CA-T6.7-01 | `T6_ADAPTER_META_WHATSAPP.md` existe com conteúdo completo | Este artefato |
| CA-T6.7-02 | Fluxo inbound declarado (§7, etapas 1–16) | §7 |
| CA-T6.7-03 | Fluxo outbound declarado (§8, etapas 1–11) | §8 |
| CA-T6.7-04 | Verificação de webhook declarada (WH-01..07) | §9 |
| CA-T6.7-05 | Verificação de assinatura declarada (SIG-01..09) | §10 |
| CA-T6.7-06 | Idempotência declarada (IDP-01..10) | §11 |
| CA-T6.7-07 | Deduplicação por `wa_message_id` declarada (DD-01..08) | §12 |
| CA-T6.7-08 | Regras de retry declaradas (RTI-01..03, RTO-01..09) | §13 |
| CA-T6.7-09 | Tratamento de erro declarado (ERR-AD-01..14) | §14 |
| CA-T6.7-10 | Rate limit declarado (RL-01..07) | §15 |
| CA-T6.7-11 | Mídia/anexos roteados para T6.3/T6.4/T6.5/T6.6 | §16 MID-07..09 |
| CA-T6.7-12 | Status events declarados como `system_event` (ST-01..08) | §17 |
| CA-T6.7-13 | Separação canal/cérebro declarada explicitamente | §18 |
| CA-T6.7-14 | Segurança mínima declarada (SEC-01..10) | §19 |
| CA-T6.7-15 | 13 eventos de observabilidade conceituais declarados | §20 |
| CA-T6.7-16 | 20 proibições absolutas PROB-AD-01..20 declaradas | §21 |
| CA-T6.7-17 | Adapter não cria `reply_text` em nenhum output | §3, §21 PROB-AD-01 |
| CA-T6.7-18 | Adapter não cria `fact_*` | §21 PROB-AD-03 |
| CA-T6.7-19 | Adapter não cria `current_phase` | §21 PROB-AD-04 |
| CA-T6.7-20 | Zero runtime implementado; zero webhook real; zero canal real | §2 — PR declarativa |
| CA-T6.7-21 | Próxima PR autorizada é PR-T6.8 | §25 |

---

## §24 Provas obrigatórias

| Prova | Descrição | Verificável em |
|---|---|---|
| P-T6.7-01 | `T6_ADAPTER_META_WHATSAPP.md` criado com §1–§26 + Bloco E | `git diff --stat` |
| P-T6.7-02 | Zero `reply_text` declarado como output do adapter | §3, §7, §8, §21 PROB-AD-01 |
| P-T6.7-03 | Zero `fact_*` criado ou alterado | §21 PROB-AD-03 |
| P-T6.7-04 | Zero `current_phase` criado ou alterado | §21 PROB-AD-04 |
| P-T6.7-05 | Zero `src/` tocado | `git diff --name-only` |
| P-T6.7-06 | Zero webhook real, canal real, env/secret real criado | `git diff --name-only` |
| P-T6.7-07 | Conformidade A00-ADENDO-01: canal é entrada, não cérebro de fala | §3, §18 |
| P-T6.7-08 | Conformidade A00-ADENDO-02: multimodal sob mesma governança T1–T5 | §5 |
| P-T6.7-09 | PR-T6.6 (#131) confirmada merged antes desta PR | `gh pr list --state merged` |
| P-T6.7-10 | Live files atualizados: STATUS, LATEST, _INDEX, CONTRATO_T6 | `git diff --stat` |

---

## §25 Próxima PR autorizada

**PR-T6.8 — Dossiê operacional e link do correspondente**

Artefato: `schema/implantation/T6_DOSSIE_OPERACIONAL.md`

Escopo: montagem do link do correspondente; lista de anexos recebidos; docs pendentes por perfil
(P1/P2/P3); envio ao correspondente; retorno/resposta do correspondente; segurança mínima do dossiê;
trilha de auditoria; estados do dossiê.

Dependência: PR-T6.7 mergeada (esta PR).

---

## §26 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T6_ADAPTER_META_WHATSAPP.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T6.7 encerrada; T6 em execução; PR-T6.8 desbloqueada
Próxima PR autorizada:                 PR-T6.8 — Dossiê operacional e link do correspondente
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | Regra-mãe declarada: adapter é canal, não cérebro | §3 |
| 2 | Relação com T6_SURFACE_CANAL declarada (responsabilidades, tabela comparativa) | §4 |
| 3 | Relação com T4/T3/T2/T5 declarada (fluxo completo) | §5 |
| 4 | 20 tipos de evento Meta/WhatsApp cobertos | §6 |
| 5 | Fluxo inbound declarativo (16 etapas, 8 invariantes INV-AD-01..08) | §7 |
| 6 | Fluxo outbound declarativo (11 etapas, 5 invariantes INV-AD-09..13) | §8 |
| 7 | Verificação de webhook declarada (WH-01..07) | §9 |
| 8 | Verificação de assinatura declarada (SIG-01..09) | §10 |
| 9 | Idempotência declarada (IDP-01..10) | §11 |
| 10 | Deduplicação por `wa_message_id` declarada (DD-01..08) | §12 |
| 11 | Retry inbound e outbound declarados (RTI-01..03, RTO-01..09) | §13 |
| 12 | 14 erros tratados (ERR-AD-01..14) | §14 |
| 13 | Rate limit declarado (RL-01..07) | §15 |
| 14 | 14 regras de mídia declaradas (MID-01..14) | §16 |
| 15 | Status events declarados (ST-01..08) | §17 |
| 16 | Separação canal/cérebro declarada explicitamente (tabela completa) | §18 |
| 17 | Segurança mínima declarada (SEC-01..10) + variáveis conceituais | §19 |
| 18 | 13 eventos de observabilidade conceituais declarados | §20 |
| 19 | 20 proibições absolutas PROB-AD-01..20 | §21 |
| 20 | 10 riscos com mitigação R-AD-01..10 | §22 |
| 21 | 21 critérios de aceite CA-T6.7-01..21 | §23 |
| 22 | 10 provas obrigatórias P-T6.7-01..10 | §24 |
| 23 | Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime | §21, §24 |
| 24 | Zero webhook real, env/secret real, canal real | §19 SEC-08..10, §24 P-T6.7-06 |
| 25 | Conformidade A00-ADENDO-01/02/03 declarada | §3, §5, este Bloco E |

### Estado herdado

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual — PR-T6.7 dentro do contrato T6
Última PR relevante: PR-T6.6 (#131) — merged 2026-04-28T20:56:34Z — T6_STICKER_MIDIA_INUTIL.md
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Objetivo imutável do contrato: Canal sob mesma governança T1–T5; multimodal sem criar cérebro paralelo
Recorte a executar nesta PR: PR-T6.7 — Adapter Meta/WhatsApp governado
Item do A01: T6 — Prioridade 7 — Docs, multimodal e superfícies de canal
Estado atual da frente: T6 em execução — PR-T6.7
O que a última PR fechou: Sticker/mídia inútil/mensagens não textuais — EM-01..EM-06; 21 tipos; 20 proibições
O que a última PR NÃO fechou: Adapter Meta; dossiê; suite de testes; G6
Por que esta tarefa existe: A01 e contrato T6 §2 item 7 exigem PR-T6.7 após PR-T6.6
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar T6_ADAPTER_META_WHATSAPP.md — contrato declarativo do adapter
Escopo: schema/implantation/T6_ADAPTER_META_WHATSAPP.md + live files
Fora de escopo: src/, runtime, webhook real, canal real, env/secret, T1–T5, T6.8–T6.R
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    N/A — contrato declarativo; legados por PR específica
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

### Estado entregue

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T6_ADAPTER_META_WHATSAPP.md — contrato declarativo do adapter
O que foi fechado nesta PR: Sub-contrato declarativo do adapter Meta/WhatsApp governado
O que continua pendente: PR-T6.8 (dossiê); PR-T6.9 (testes); PR-T6.R (G6)
O que ainda não foi fechado do contrato ativo: T6.8–T6.R; gate G6; canal real; dossiê; suite de testes
Recorte executado do contrato: T6 — PR-T6.7 — adapter Meta/WhatsApp governado
Pendência contratual remanescente: PR-T6.8..T6.R
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — PR-T6.8 agora autorizada
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX, CONTRATO_T6
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
