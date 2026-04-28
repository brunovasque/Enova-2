# T6_SURFACE_CANAL — Surface Única de Canal — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.2 |
| Branch | feat/t6-pr-t6-2-surface-canal |
| Artefato | Contrato declarativo da surface única de canal da ENOVA 2 |
| Status | entregue |
| Pré-requisito | PR-T6.1 merged (#126 — 2026-04-28T18:41:17Z); T6_PREFLIGHT_RISCOS_T5.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.3 — Contrato de anexos e documentos |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

A **surface única de canal** é a camada de normalização que recebe qualquer entrada bruta
do canal (WhatsApp/Meta) — texto, documento, imagem, PDF, áudio, sticker, botão/link,
evento de sistema, mídia inválida — e a converte em uma entrada normalizada que alimenta o
pipeline aprovado T4 → T3 → T2 → T1.

Este artefato declara formalmente:
- A finalidade da surface e seu princípio central
- Os 8 tipos de entrada suportados
- O shape conceitual da entrada normalizada
- Os campos permitidos e os campos absolutamente proibidos
- As 10 invariantes invioláveis da surface
- O roteamento conceitual para T4
- O tratamento esperado por tipo de entrada
- As proibições absolutas e os riscos
- A relação com as PRs futuras T6.3–T6.R

**Esta PR é declarativa — não implementa runtime, não cria código, não abre canal real.**

---

## §2 Finalidade da surface única

A surface única de canal é a **fronteira de normalização** entre o mundo externo (canal bruto)
e o mundo interno da governança ENOVA 2 (T1→T2→T3→T4→T5).

**O que a surface faz:**
- Recebe entradas heterogêneas do canal (texto, mídia, eventos)
- Normaliza cada entrada em um objeto estruturado padronizado
- Classifica o tipo de entrada com grau de confiança
- Registra avisos operacionais (warnings) quando a entrada é ambígua ou inválida
- Entrega a entrada normalizada ao pipeline T4 como insumo
- Preserva a referência à entrada bruta para rastreabilidade

**O que a surface NÃO faz:**
- Não escreve fala ao cliente
- Não decide stage ou fase do funil
- Não persiste fatos confirmados no lead_state
- Não aplica regras de negócio
- Não substitui o LLM na decisão de condução
- Não substitui o validador T3 na verificação de políticas
- Não substitui o orquestrador T4 na construção do contexto de turno
- Não aplica lógica de elegibilidade, crédito ou dossiê

---

## §3 Princípio central: canal é entrada, não cérebro

**Regra-mãe (herdada do contrato T6 §1 e A00-ADENDO-02):**

> **A surface não cria outro cérebro.**
> Tudo que entra pelo canal passa pela mesma governança já construída:
> T1 → T2 → T3 → T4 → T5.
> Canal não decide sozinho.
> Mídia não avança stage sozinha.
> Áudio não vira funil paralelo.
> OCR e transcrição não viram verdade absoluta.
> WhatsApp não escreve fala por conta própria.

A surface é somente a **porta de entrada normalizada**. Ela prepara — não decide.

---

## §4 Relação com T1 / T2 / T3 / T4 / T5

| Camada | Papel | Relação com a surface |
|---|---|---|
| **T1** — Contrato cognitivo | `reply_text` exclusivo do LLM; identidade do agente | Surface **não produz** `reply_text`; surface preserva texto bruto para o LLM ler |
| **T2** — Estado e memória | `lead_state` com 35 `fact_*`; `derived_*`; `signal_*` | Surface **não persiste** nem cria `fact_*`; entrega contexto de entrada; T4 persiste via T4.3 |
| **T3** — Policy engine | 5 classes de política; veto suave; validador VC-01..VC-09 | Surface **não aplica** política; entrega entrada normalizada para T4 que aciona T3 |
| **T4** — Orquestrador | TurnoEntrada → LLM → validação → persistência → rastro → fallback | Surface **alimenta** T4.1 (TurnoEntrada) com a entrada normalizada; T4 monta o pipeline completo |
| **T5** — Funil core F1–F5 | Regras de negócio MCMV; fatias F1–F5; dossiê | Surface **não altera** regras do funil; T5 permanece intocável |

**Fluxo de dados declarativo:**

```
Canal bruto (WhatsApp/Meta)
  ↓
Surface única (T6_SURFACE_CANAL — este artefato)
  → normaliza tipo de entrada
  → classifica com confiança
  → preserva referência bruta
  → registra avisos
  ↓
Entrada normalizada (SurfaceEventNormalizado)
  ↓
T4_ENTRADA_TURNO (TurnoEntrada)
  → monta ContextoTurno com: mensagem, lead_state, objetivo, contexto
  ↓
T4_PIPELINE_LLM
  → uma única chamada LLM por turno
  → captura reply_text (imutável)
  ↓
T4_VALIDACAO_PERSISTENCIA
  → VC-01..VC-09; PersistDecision
  ↓
T4_RESPOSTA_RASTRO_METRICAS
  → entrega reply_text ao canal quando reply_routing = "T4.4"
  → registra TurnoRastro
  ↓
T4_FALLBACKS (se necessário)
```

---

## §5 Tipos de entrada suportados (8)

A surface reconhece e normaliza os seguintes tipos de entrada:

| # | Tipo | `input_type` | Descrição |
|---|---|---|---|
| 1 | Texto | `text` | Mensagem de texto; legenda/caption de mídia; resposta digitada |
| 2 | Documento | `document` | PDF; arquivo anexado; documento com nome/tipo MIME |
| 3 | Imagem | `image` | Foto de documento; print; imagem avulsa; imagem ilegível |
| 4 | Áudio | `audio` | Áudio de WhatsApp; áudio ruim/inaudível; áudio sem transcrição |
| 5 | Sticker | `sticker` | Sticker sem texto; sticker com intenção emocional provável |
| 6 | Botão/link | `button_or_link` | Clique; resposta estruturada; link; interação de UI |
| 7 | Evento de sistema | `system_event` | Entrega; falha de entrega; retry; webhook; evento técnico |
| 8 | Inválido/ambíguo | `unknown_or_invalid` | Mídia corrompida; tipo não reconhecido; arquivo vazio; sem utilidade operacional |

### 5.1 Sub-tipos e variantes

| `input_type` | Variante / sub-tipo | Observação |
|---|---|---|
| `text` | `text/plain` | Mensagem de texto puro |
| `text` | `text/caption` | Legenda enviada junto com mídia |
| `document` | `document/pdf` | PDF com nome e MIME type identificados |
| `document` | `document/attachment` | Arquivo genérico anexado |
| `image` | `image/photo` | Imagem fotográfica |
| `image` | `image/screenshot` | Print de tela |
| `image` | `image/unreadable` | Imagem recebida mas ilegível/corrompida |
| `audio` | `audio/voice` | Áudio de voz gravado no WhatsApp |
| `audio` | `audio/poor_quality` | Áudio com qualidade ruim / inaudível |
| `sticker` | `sticker/standard` | Sticker padrão sem texto |
| `button_or_link` | `button/quick_reply` | Resposta de botão rápido |
| `button_or_link` | `link/url` | Link enviado |
| `system_event` | `system/delivery` | Confirmação de entrega |
| `system_event` | `system/failure` | Falha de entrega |
| `unknown_or_invalid` | `unknown/corrupted` | Mídia corrompida ou inidentificável |

---

## §6 Shape conceitual da entrada normalizada

> **Importante:** Este shape é **conceitual e declarativo**. Não é schema TypeScript,
> não é migration Supabase, não é runtime. É a definição formal dos campos que a surface
> deve produzir para alimentar T4.

```
SurfaceEventNormalizado {

  // — IDENTIFICAÇÃO DO EVENTO —
  surface_event_id:      string          — UUID único do evento de surface (gerado pela surface)
  channel:               ChannelEnum     — canal de origem: "whatsapp" | "meta" | futuro
  channel_message_id:    string          — ID original da mensagem no canal (para deduplicação)
  lead_external_id:      string          — identificador externo do lead no canal (ex: telefone)
  received_at:           ISO8601         — timestamp de recebimento no canal
  processed_at:          ISO8601         — timestamp de normalização pela surface

  // — CLASSIFICAÇÃO DA ENTRADA —
  input_type:            InputTypeEnum   — tipo principal: text | document | image | audio |
                                           sticker | button_or_link | system_event |
                                           unknown_or_invalid
  input_subtype:         string          — sub-tipo opcional (ver §5.1)
  confidence_hint:       float           — 0.0–1.0; grau de confiança na classificação do tipo
                                           (baixa confiança → surface_warnings)

  // — REFERÊNCIA AO PAYLOAD BRUTO —
  raw_payload_ref:       string          — referência ao payload bruto do canal (para auditoria)
                                           nunca expandido inline; apenas referência

  // — CONTEÚDO DE TEXTO —
  text_content:          string | null   — texto principal se input_type = "text";
                                           caption se houver; null se não houver texto

  // — REFERÊNCIA DE MÍDIA —
  media_ref:             string | null   — referência à mídia recebida (URL temporária, hash)
                                           null se input_type = "text" ou "system_event"
  media_mime_type:       string | null   — MIME type da mídia: "image/jpeg", "audio/ogg", etc.
  media_filename:        string | null   — nome do arquivo se disponível (para documentos)
  media_size_bytes:      integer | null  — tamanho em bytes se disponível
  caption:               string | null   — legenda/caption enviada junto com a mídia

  // — CONTEXTO DO REMETENTE —
  sender_role:           SenderRoleEnum  — "lead" | "operator" | "system"

  // — DEDUPLICAÇÃO —
  dedupe_key:            string          — chave de deduplicação: hash(channel + channel_message_id)
                                           idempotência: mesmo dedupe_key = mesmo evento

  // — SAÍDA PARA T4 —
  normalized_turn_input: NormalizedInput — input estruturado pronto para TurnoEntrada (T4.1)
                                           contém: text_for_llm, media_hint, event_type, context
  handoff_to_t4:         boolean         — true = deve ser entregue ao T4; false = descartável
                                           (eventos técnicos puros que não geram turno)

  // — AVISOS OPERACIONAIS —
  surface_warnings:      string[]        — lista de avisos; não bloqueiam fluxo mas são registrados
                                           Exemplos: "low_confidence_type", "audio_no_transcript",
                                           "image_unreadable", "mime_mismatch", "duplicate_detected"
}
```

### 6.1 Sub-shape `NormalizedInput` (entregue ao TurnoEntrada T4.1)

```
NormalizedInput {
  text_for_llm:    string | null  — texto disponível para o LLM processar neste turno
                                    pode ser: text_content, caption, ou placeholder de mídia
  media_hint:      MediaHint | null — dica de mídia recebida; não é fato; é contexto para LLM
                                    { type: InputTypeEnum, has_content: bool, quality: string }
  event_type:      string         — tipo de evento simplificado para roteamento T4
  context_notes:   string[]       — notas de contexto geradas pela surface (avisos, observações)
                                    O LLM pode usar como contexto — nunca como dado confirmado
}
```

---

## §7 Campos permitidos na surface

A surface **pode** produzir somente os campos declarados em §6. Resumo dos campos permitidos:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `surface_event_id` | string | ✅ | UUID único por evento |
| `channel` | enum | ✅ | Origem do evento |
| `channel_message_id` | string | ✅ | ID original no canal |
| `lead_external_id` | string | ✅ | Identificador externo do lead |
| `received_at` | ISO8601 | ✅ | Timestamp de recebimento |
| `processed_at` | ISO8601 | ✅ | Timestamp de normalização |
| `input_type` | enum | ✅ | Tipo classificado |
| `input_subtype` | string | ○ | Sub-tipo opcional |
| `confidence_hint` | float | ○ | 0.0–1.0 |
| `raw_payload_ref` | string | ✅ | Referência ao bruto |
| `text_content` | string/null | ○ | Texto se houver |
| `media_ref` | string/null | ○ | Referência de mídia |
| `media_mime_type` | string/null | ○ | MIME type |
| `media_filename` | string/null | ○ | Nome do arquivo |
| `media_size_bytes` | integer/null | ○ | Tamanho |
| `caption` | string/null | ○ | Legenda |
| `sender_role` | enum | ✅ | Papel do remetente |
| `dedupe_key` | string | ✅ | Chave de deduplicação |
| `normalized_turn_input` | NormalizedInput | ✅ | Entrada para T4.1 |
| `handoff_to_t4` | boolean | ✅ | Flag de entrega ao T4 |
| `surface_warnings` | string[] | ✅ | Lista de avisos (pode ser vazia) |

---

## §8 Campos absolutamente proibidos na surface

A surface **nunca** pode produzir os campos abaixo. Qualquer presença desses campos viola
A00-ADENDO-01, A00-ADENDO-02 e a regra-mãe de T6.

| Campo proibido | Motivo |
|---|---|
| `reply_text` | `reply_text` é exclusividade do LLM (T4.2 / T1_CONTRATO_SAIDA); canal não fala |
| `next_stage` | Stage é decidido pela governança T3/T4; surface não decide funil |
| `current_phase` (novo) | Valores canônicos são imutáveis; surface não cria `current_phase` |
| `fact_*` (novo) | Fatos são coletados pelo LLM e persistidos via T4.3; surface não persiste |
| `policy_decision` final | Decisão de política é de T3; surface não aplica policy engine |
| `approval_result` | Decisão de crédito/aprovação é do correspondente via F5; fora da surface |
| `credit_decision` | Idem — surface não avalia crédito |
| `dossier_final_status` | Status do dossiê é de F5/T6.8; surface não monta dossiê |
| `visit_confirmed` | Confirmação de visita é do funil F5; surface não confirma visitas |
| qualquer campo de decisão final de funil | Surface prepara entrada; governança T4/T3/T2/T5 decide |

---

## §9 Invariantes da surface (10)

As invariantes abaixo são invioláveis em qualquer implementação futura da surface.
Violação de qualquer invariante ativa o bloqueio **B-T6-04** do contrato T6.

| # | Invariante | Consequência de violação |
|---|---|---|
| INV-SC-01 | A surface **não escreve fala ao cliente** | Viola A00-ADENDO-01; B-T6-04 |
| INV-SC-02 | A surface **não cria `reply_text`** | Viola A00-ADENDO-01; B-T6-04 |
| INV-SC-03 | A surface **não decide `current_phase`** | Viola regra-mãe T6; B-T6-04 |
| INV-SC-04 | A surface **não persiste `fact_*` confirmado** | Viola pipeline T4.3; B-T6-04 |
| INV-SC-05 | A surface **não cria `fact_*` novo** | Viola schema T2; B-T6-04 |
| INV-SC-06 | A surface **não substitui o LLM** | O LLM é soberano na decisão de condução |
| INV-SC-07 | A surface **não substitui o validador T3** | Policy engine é T3; veto suave é T3 |
| INV-SC-08 | A surface **não substitui o `lead_state` T2** | Estado do lead é T2; surface não altera |
| INV-SC-09 | A surface **não muda regra comercial de T5** | Funil F1–F5 é intocável pela surface |
| INV-SC-10 | Toda entrada normalizada vai para T4 como **insumo**, nunca como **decisão** | Surface prepara; T4 decide o que fazer com a entrada |

---

## §10 Roteamento conceitual para T4

A surface entrega o resultado normalizado para o pipeline T4 via `normalized_turn_input`.
O campo `handoff_to_t4` controla se o evento gera um turno real:

| Condição | `handoff_to_t4` | Comportamento |
|---|---|---|
| Qualquer entrada de texto, imagem, PDF, áudio, sticker, botão/link | `true` | Gera TurnoEntrada → pipeline T4 completo |
| Evento de sistema puro (delivery, retry técnico) | `false` ou condicional | Registra o evento; pode gerar turno somente se há impacto operacional |
| Mídia inválida/corrompida | `true` | Gera TurnoEntrada com `input_type = "unknown_or_invalid"` e `surface_warnings`; T4 decide como responder |
| Entrada duplicada (`dedupe_key` já processado) | `false` | Evento descartado; não gera turno; idempotência preservada |

**Mapeamento surface → TurnoEntrada (T4.1):**

| Campo surface | Campo TurnoEntrada | Observação |
|---|---|---|
| `normalized_turn_input.text_for_llm` | `message_text` | Texto disponível para o LLM |
| `lead_external_id` + lookup | `case_id` | Surface provê ID externo; gateway mapeia para case_id |
| `normalized_turn_input.event_type` | parte de `current_objective` | Informa tipo de evento ao orquestrador |
| `normalized_turn_input.media_hint` | parte de `attachments[]` | Dica de mídia recebida |
| `normalized_turn_input.context_notes` | parte de `context_override` | Avisos e notas da surface |
| `channel` | `channel` | Canal de origem |
| `surface_event_id` | gerará `turn_id` | ID do turno derivado do evento |

**Nota:** O preenchimento completo dos campos obrigatórios de `TurnoEntrada` (lead_state,
current_objective, channel) é responsabilidade do gateway/orquestrador — não da surface.
A surface contribui com `normalized_turn_input`, `channel` e `surface_event_id`. O
orquestrador recupera o `lead_state` do T2 e monta `TurnoEntrada` completa.

---

## §11 Tratamento por tipo de entrada

### 11.1 Texto (`input_type = "text"`)

- Preservar texto bruto em `text_content` sem modificação
- Definir `text_for_llm = text_content` (texto disponível diretamente para o LLM)
- Caption de mídia: registrar em `caption`; `text_for_llm = caption` se não há texto principal
- `handoff_to_t4 = true` sempre para texto
- A surface **não interpreta** o significado do texto — isso é papel do LLM via T4
- `confidence_hint = 1.0` (classificação é certa para texto)

### 11.2 Imagem (`input_type = "image"`)

- Registrar referência da imagem em `media_ref`
- Registrar `media_mime_type` (image/jpeg, image/png, etc.)
- Se caption presente: registrar em `caption`; `text_for_llm = caption`
- Se imagem ilegível/corrompida: `input_subtype = "image/unreadable"`; registrar `surface_warnings = ["image_unreadable"]`
- `confidence_hint` baseado na qualidade da recepção
- `media_hint.type = "image"`; `media_hint.has_content = true/false` conforme disponibilidade
- A surface **não extrai texto da imagem** (OCR não é responsabilidade da surface)
- A surface **não classifica tipo de documento** da imagem — isso é PR-T6.4
- `handoff_to_t4 = true`; T4 decide como tratar a imagem (via T6.4 quando implementado)

### 11.3 PDF / Documento (`input_type = "document"`)

- Registrar referência em `media_ref`; nome em `media_filename`; MIME em `media_mime_type`
- `input_subtype = "document/pdf"` ou `"document/attachment"` conforme MIME
- Se caption: registrar em `caption`
- A surface **não declara documento válido** — validação de tipo de documento é PR-T6.3
- A surface **não processa conteúdo** do PDF — extração é PR-T6.4/T6.8
- `handoff_to_t4 = true`; orquestrador T4 decide tratamento
- `surface_warnings` se MIME inesperado ou tamanho suspeito

### 11.4 Áudio (`input_type = "audio"`)

- Registrar referência em `media_ref`; `media_mime_type` (audio/ogg, audio/mp4, etc.)
- `input_subtype = "audio/voice"` ou `"audio/poor_quality"` conforme qualidade perceptível
- Se qualidade ruim: `surface_warnings = ["audio_poor_quality"]`
- A surface **não transcreve** o áudio — transcrição (STT) é PR-T6.5
- A surface **não extrai fato** de áudio sem transcrição
- `text_for_llm = null` quando não há transcrição disponível ainda
- `media_hint.type = "audio"`; `media_hint.has_content = true`
- `handoff_to_t4 = true`; T4 saberá que há áudio sem texto disponível e tratará conforme T6.5

### 11.5 Sticker (`input_type = "sticker"`)

- Registrar como `input_type = "sticker"`
- `media_ref` se houver referência de imagem do sticker
- Sticker **não avança stage** — INV-SC-03
- Sticker **não encerra conversa** — nenhuma decisão de funil
- `surface_warnings = ["sticker_no_text"]` — sinal de que não há conteúdo textual
- Tratamento detalhado (sinal fraco de intenção/emoção) fica para PR-T6.6
- `handoff_to_t4 = true` com `text_for_llm = null`; T4 decide como lidar

### 11.6 Botão / Link (`input_type = "button_or_link"`)

- Registrar interação em `text_content` (texto do botão) e/ou `media_ref` (URL do link)
- `input_subtype = "button/quick_reply"` ou `"link/url"`
- Pode gerar entrada estruturada útil como texto para o LLM
- A surface **não decide stage** a partir do clique — isso é T4/T3
- `handoff_to_t4 = true`; T4 processa como turno com contexto de interação
- `text_for_llm` = texto do botão quando disponível

### 11.7 Evento de sistema (`input_type = "system_event"`)

- Registrar tipo de evento em `input_subtype`
- Evento de entrega (`system/delivery`): `handoff_to_t4 = false` por padrão (é técnico, não conversacional)
- Falha de entrega (`system/failure`): pode gerar `handoff_to_t4 = true` se há impacto operacional para o turno
- Webhooks técnicos: registrar; não gerar fala ao cliente automaticamente
- Adapter real (retry, rate limit, deduplicação) fica para PR-T6.7
- `surface_warnings` para eventos inesperados

### 11.8 Mídia inválida / Ambígua (`input_type = "unknown_or_invalid"`)

- Registrar o que foi recebido em `raw_payload_ref`
- `surface_warnings = ["unknown_type", "corrupted", "empty_file"]` conforme caso
- `handoff_to_t4 = true` com `text_for_llm = null`
- O funil **não deve quebrar** — lead não deve ser perdido por mídia inválida
- Tratamento de resposta ao lead fica para PR-T6.6 (sticker e mídia inútil)
- A surface **não gera fala** explicando que a mídia é inválida — isso é o LLM via T4

---

## §12 Tratamento de mídia inválida / ambígua

Além do §11.8, este cenário merece declaração específica por sua criticidade operacional.

**Princípio:** mídia inválida nunca deve quebrar o funil nem perder o lead.

**O que a surface faz com mídia inválida:**
1. Registra o evento com `input_type = "unknown_or_invalid"`
2. Preenche `surface_warnings` com o motivo (corrupted, empty, unrecognized_mime)
3. Define `handoff_to_t4 = true` — o evento continua sendo processado
4. Define `text_for_llm = null` — não há texto para o LLM neste turno
5. Preserva `raw_payload_ref` para auditoria futura

**O que a surface NÃO faz com mídia inválida:**
- Não gera `reply_text` de explicação ao lead
- Não descarta o lead silenciosamente
- Não gera um fato sobre o tipo de documento
- Não encerra o atendimento

**Decisão:** O LLM via T4 decide como responder ao lead sobre mídia inválida (ex: pedir
que reenvie). Isso é governança conversacional — não responsabilidade da surface.

---

## §13 Separação formal: entrada bruta × entrada normalizada × decisão do turno

| Conceito | Responsável | O que é |
|---|---|---|
| **Entrada bruta** | Canal (WhatsApp/Meta) | Payload original do webhook; preservado em `raw_payload_ref` |
| **Entrada normalizada** | Surface (este artefato) | `SurfaceEventNormalizado` com campos estruturados |
| **TurnoEntrada (T4.1)** | Orquestrador / gateway | `TurnoEntrada` completa com lead_state + objective + entrada normalizada |
| **Decisão do turno** | T4 → T3 → T2 + LLM | reply_text, policy_decisions, facts_updated, next_objective |

**A surface entrega apenas a entrada normalizada. Quem completa o TurnoEntrada é o gateway/orquestrador. Quem decide é a governança T4/T3/T2/T1.**

Nenhum desses papéis pode ser confundido ou combinado:
- Surface ≠ orquestrador
- Surface ≠ LLM
- Surface ≠ policy engine
- Surface ≠ validador de persistência

---

## §14 Proibições absolutas

| # | Proibição | Fundamento |
|---|---|---|
| PROB-SC-01 | Surface produzir `reply_text` em qualquer campo | A00-ADENDO-01; INV-SC-02; B-T6-04 |
| PROB-SC-02 | Surface decidir `current_phase` ou stage | Regra-mãe T6; INV-SC-03 |
| PROB-SC-03 | Surface criar ou persistir `fact_*` | Schema T2; INV-SC-04/05 |
| PROB-SC-04 | Surface aplicar política T3 ou veto suave | Policy engine é T3; INV-SC-07 |
| PROB-SC-05 | Surface avançar funil F1–F5 diretamente | Funil é T5; INV-SC-09 |
| PROB-SC-06 | Surface transcrever áudio como fato definitivo | Transcrição é hipótese; PR-T6.5 governa |
| PROB-SC-07 | Surface classificar tipo de documento como definitivo | Classificação documental é PR-T6.3/T6.4 |
| PROB-SC-08 | Surface extrair texto de imagem (OCR) como fato | OCR não é obrigatório; não é verdade absoluta |
| PROB-SC-09 | Surface gerar resposta ao cliente por mídia inválida | LLM via T4 decide como responder |
| PROB-SC-10 | Surface descartarsilenciosamente lead por falha de canal | Funil não deve perder lead; T4 governa |
| PROB-SC-11 | Surface implementar adapter Meta/WhatsApp real | Adapter real é PR-T6.7 |
| PROB-SC-12 | Surface montar dossiê operacional | Dossiê é PR-T6.8 |
| PROB-SC-13 | Surface avançar para T6.3+ dentro desta PR | Escopo: somente contrato da surface |

---

## §15 Riscos e mitigação

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Surface interpretando mídia como fato confirmado | Média | INV-SC-04/05; `confidence_hint`; `surface_warnings`; nunca fact_* |
| Surface gerando texto de resposta ao cliente | Média | INV-SC-01/02; campo proibido `reply_text`; T4 responsável pela entrega |
| Transcrição de áudio tratada como verdade | Alta | §11.4; `text_for_llm = null` sem transcrição; PR-T6.5 governa STT |
| Classificação de imagem como documento com certainty | Alta | §11.2; OCR não é responsabilidade da surface; PR-T6.4 governa |
| Sticker avançando stage automaticamente | Baixa | INV-SC-03; §11.5; `handoff_to_t4 = true` sem decisão |
| Lead perdido por mídia corrompida | Média | §12; `unknown_or_invalid` sempre gera handoff_to_t4 |
| Duplicação de eventos processados duas vezes | Média | `dedupe_key`; evento duplicado: `handoff_to_t4 = false` |
| Surface confundida com adapter Meta/WhatsApp | Alta | §13; PROB-SC-11; adapter é PR-T6.7 |
| Canal escrevendo reply_text mecânico | Alta | Bloqueio permanente B-T6-04; violação de A00-ADENDO-01 |

---

## §16 Critérios de aceite da PR-T6.2 (CA-T6.2)

| # | Critério | Verificação |
|---|---|---|
| CA-T6.2-01 | `T6_SURFACE_CANAL.md` existe e cobre 19 seções obrigatórias | Este artefato |
| CA-T6.2-02 | Todos os 8 tipos de entrada estão declarados com `input_type` | §5 |
| CA-T6.2-03 | Shape conceitual `SurfaceEventNormalizado` está definido | §6 |
| CA-T6.2-04 | Campos permitidos estão listados | §7 |
| CA-T6.2-05 | Campos proibidos estão declarados explicitamente | §8 |
| CA-T6.2-06 | 10 invariantes (INV-SC-01..10) estão declaradas | §9 |
| CA-T6.2-07 | Roteamento conceitual surface → T4 está claro | §10 |
| CA-T6.2-08 | Tratamento por tipo de entrada está declarado | §11 |
| CA-T6.2-09 | Surface **não** cria `reply_text` | §8; PROB-SC-01 |
| CA-T6.2-10 | Surface **não** cria `fact_*` | §8; PROB-SC-03 |
| CA-T6.2-11 | Surface **não** decide stage | §9 INV-SC-03 |
| CA-T6.2-12 | Surface **não** implementa runtime | §2; §14 PROB-SC-13 |
| CA-T6.2-13 | Relação com PRs futuras T6.3–T6.R declarada | §18 |
| CA-T6.2-14 | Zero `src/` tocado | Bloco E |
| CA-T6.2-15 | Próxima PR autorizada é PR-T6.3 | §18; Bloco E |

---

## §17 Provas obrigatórias

| Prova | Método de verificação |
|---|---|
| P-T6.2-01 | `T6_SURFACE_CANAL.md` existe: `git diff --stat` mostra create mode |
| P-T6.2-02 | Zero `src/`: `git status` não mostra nenhum arquivo em `src/` |
| P-T6.2-03 | Zero `fact_*` criado: busca textual em todo o artefato; nenhuma chave `fact_*` nova |
| P-T6.2-04 | Zero `reply_text`: busca textual; nenhum campo `reply_text` produzido pela surface |
| P-T6.2-05 | Zero runtime: nenhum arquivo TypeScript, nenhuma migration, nenhum adapter real |

---

## §18 Relação com PRs futuras T6.3–T6.R

Este artefato prepara a base conceitual para todas as PRs seguintes. Nenhuma delas é
implementada aqui.

| PR | Título | O que usa desta surface |
|---|---|---|
| **PR-T6.3** | Contrato de anexos e documentos | Usa `input_type = "document"`; governa tipos de documentos do dossiê MCMV |
| **PR-T6.4** | Pipeline de imagem/PDF/documento | Usa `media_ref`, `media_mime_type`; define processamento de mídia documental |
| **PR-T6.5** | Áudio no mesmo cérebro conversacional | Usa `input_type = "audio"`, `media_ref`; governa STT; `text_for_llm` pós-transcrição |
| **PR-T6.6** | Sticker, mídia inútil e rejeição graceful | Usa `input_type = "sticker"` e `"unknown_or_invalid"`; trata `surface_warnings` |
| **PR-T6.7** | Adapter Meta/WhatsApp governado | Implementa o lado canal desta surface; webhook, outbound, idempotência real |
| **PR-T6.8** | Dossiê operacional e link do correspondente | Usa resultado do processamento documental; montagem do link; associação a P1/P2/P3 |
| **PR-T6.9** | Suite de testes/sandbox multicanal | Valida cenários completos usando a surface como ponto de entrada dos testes |
| **PR-T6.R** | Readiness/Closeout G6 | Verifica CA-T6-01..CA-T6-10; T6_SURFACE_CANAL.md como S2 do smoke G6 |

---

## §19 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T6_SURFACE_CANAL.md
PR que fecha:                          PR-T6.2 — Surface única de canal
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não como bloqueante —
                                       Shape conceitual completo declarado (§6).
                                       8 tipos de entrada declarados (§5).
                                       10 invariantes declaradas (§9).
                                       13 proibições absolutas declaradas (§14).
                                       Relação com T4 mapeada (§10).
                                       Tratamento por tipo declarado (§11).
                                       Relação com PRs futuras T6.3–T6.R declarada (§18).
                                       Zero fact_*; zero reply_text; zero runtime; zero src/.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T6.2 CONCLUÍDA; T6_SURFACE_CANAL.md publicado;
                                       PR-T6.3 desbloqueada.
Próxima PR autorizada:                 PR-T6.3 — Contrato de anexos e documentos
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | §1 Resumo executivo — declaração do escopo e natureza declarativa | §1 |
| 2 | §2 Finalidade — o que a surface faz e não faz | §2 |
| 3 | §3 Princípio central — canal é entrada, não cérebro | §3 |
| 4 | §4 Relação com T1/T2/T3/T4/T5 — tabela + fluxo de dados | §4 |
| 5 | §5 8 tipos de entrada declarados com `input_type` e sub-tipos | §5 |
| 6 | §6 Shape `SurfaceEventNormalizado` — 20 campos conceituais | §6 |
| 7 | §7 Campos permitidos — tabela completa | §7 |
| 8 | §8 Campos proibidos — 9 campos proibidos explicitamente | §8 |
| 9 | §9 10 invariantes INV-SC-01..10 | §9 |
| 10 | §10 Roteamento conceitual surface → T4 com tabela de mapeamento | §10 |
| 11 | §11 Tratamento por tipo — 8 seções (text, image, PDF, audio, sticker, button, system, invalid) | §11 |
| 12 | §12 Tratamento de mídia inválida — seção dedicada | §12 |
| 13 | §13 Separação formal entrada bruta × normalizada × decisão | §13 |
| 14 | §14 13 proibições absolutas (PROB-SC-01..13) | §14 |
| 15 | §15 9 riscos com mitigação | §15 |
| 16 | §16 15 critérios de aceite CA-T6.2-01..15 | §16 |
| 17 | §17 5 provas obrigatórias | §17 |
| 18 | §18 Relação com 8 PRs futuras T6.3–T6.R | §18 |
| 19 | Zero `src/` tocado — confirmado por git status | git diff --stat |
| 20 | Zero `fact_*` criado | Busca textual; nenhuma chave nova |
| 21 | Zero `reply_text` produzido pela surface | PROB-SC-01; §8 |
| 22 | Zero runtime implementado | PR é declarativa |
| 23 | Bloco E completo | este §19 |

### ESTADO HERDADO

```
Fase: T6 em execução; PR-T6.1 (#126) merged 2026-04-28T18:41:17Z.
T6_PREFLIGHT_RISCOS_T5.md vigente; AT-01/03/04 tratados; AT-05 lacuna planejada.
Próximo passo autorizado: PR-T6.2 — Surface única de canal.
```

### ESTADO ENTREGUE

```
T6_SURFACE_CANAL.md criado: 19 seções; shape SurfaceEventNormalizado; 8 input_types;
10 invariantes INV-SC-01..10; 13 proibições PROB-SC-01..13; roteamento → T4;
tratamento por tipo (§11 8 seções); relação com T6.3–T6.R (§18).
Zero src/; zero runtime; zero fact_*; zero reply_text. PR-T6.3 desbloqueada.
```
