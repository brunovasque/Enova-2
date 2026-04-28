# T6_AUDIO_CEREBRO_CONVERSACIONAL — Áudio no Mesmo Cérebro Conversacional — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.5 |
| Branch | feat/t6-pr-t6-5-audio-cerebro-conversacional |
| Artefato | Contrato declarativo de áudio no mesmo cérebro conversacional — ENOVA 2 |
| Status | entregue |
| Pré-requisito | PR-T6.4 merged (#129 — 2026-04-28T20:07:41Z); T6_PIPELINE_IMAGEM_PDF.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.6 — Sticker, mídia inútil e mensagens não textuais |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Este artefato declara formalmente o **contrato de áudio no mesmo cérebro conversacional**
da ENOVA 2. Define como mensagens de voz enviadas pelo lead via WhatsApp são recebidas,
tratadas como hipótese transcrita, classificadas conversacionalmente, entregues ao pipeline
T4/LLM e governadas sem criar funil paralelo, sem substituir o LLM e sem avançar stage
sozinhas.

**Princípio-mãe desta PR:**

> Áudio é entrada conversacional.
> Áudio não é verdade absoluta. Áudio não escreve `reply_text`.
> Áudio não decide stage. Áudio não aprova/reprova cliente.
> Áudio não finaliza dossiê. Áudio não cria `fact_*` novo.
> Áudio não cria `current_phase` novo. Áudio não implementa STT real.
> Áudio não cria funil paralelo.
> Tudo passa pela governança: T6_SURFACE_CANAL → T4 → T3 → T2 → T5.

**Esta PR é declarativa — não implementa STT/transcrição real, não cria código,
não abre canal real, não cria migration Supabase.**

---

## §2 Finalidade do contrato de áudio

O contrato de áudio existe para responder, de forma canônica:

- Como a surface recebe e normaliza um áudio?
- Como a transcrição futura (STT) será tratada — como hipótese, não como verdade?
- Quais os níveis de confiança de transcrição e o que cada nível autoriza?
- Como informações extraídas de áudio entram no pipeline T4/T3/T2?
- Quando e o que deve ser confirmado textualmente antes de persistir como fato?
- Como tratar áudio ruim, incompreensível, cortado, repetido ou fora de contexto?
- O que o áudio nunca pode fazer sozinho?

**O que este contrato NÃO é:**
- Não é implementação de STT (Speech-to-Text)
- Não é motor de transcrição
- Não é validador de voz biométrica
- Não é classificador de sentimento
- Não é um cérebro de atendimento paralelo

---

## §3 Princípio central — áudio é entrada, não cérebro

### 3.1 Áudio não substitui o LLM

Nenhuma mensagem de áudio recebida pela ENOVA 2:
- Produz `reply_text` diretamente
- Avança o stage do funil sozinha
- Confirma fato crítico sem validação
- Aprova ou reprova o cliente
- Cria ou altera `fact_*` canônico sem passar pelo pipeline T4→T3→T2
- Cria ou altera `current_phase` canônico
- Substitui o raciocínio do LLM

O LLM usa o áudio (ou sua transcrição) como **insumo contextual** — e decide como conduzir
a conversa. O pipeline apenas prepara o insumo.

### 3.2 Transcrição é hipótese, não fato

A transcrição de áudio (quando disponível):
- É uma **hipótese** sobre o que o lead disse
- Pode estar correta, parcial ou errada
- Carrega um nível de confiança explícito
- Não persiste fato crítico sozinha
- Exige confirmação para fatos de negócio (renda, estado civil, restrição, etc.)

Sem STT: o sistema registra que recebeu áudio e orienta o LLM a pedir confirmação ou
reenvio por texto para informações importantes.

### 3.3 Âncora canônica — T2_POLITICA_CONFIANCA §3.3

`T2_POLITICA_CONFIANCA.md` §3.3 declara a origem canônica de áudio:

> **O3 — Áudio / transcrição (`AUDIO_TRANSCRIPT`):**
> - Áudio bom → `captured` (equivalente a `EXPLICIT_TEXT` de confiança média) → confirmar fatos críticos
> - Áudio médio → `captured` com `confidence = "low"` → confirmar qualquer fato de negócio
> - Áudio ruim → `hypothesis` (não persiste como `FactEntry`) → recoleta obrigatória

Tags de source no `FactEntry`: `"audio_good"` / `"audio_medium"` / `"audio_poor"`.

**Regras canônicas herdadas de T2:**
- Áudio ruim **nunca** confirma fato crítico (PC-06)
- Fato numérico (renda, valor) de áudio médio → `captured/low`; gera `PEND_CONFIRMACAO`
- `AUDIO_TRANSCRIPT` **nunca** promove diretamente a `confirmed` para fato crítico

---

## §4 Relação com T6_SURFACE_CANAL

`T6_SURFACE_CANAL.md` (PR-T6.2) define a camada de normalização. Para áudio:

| Campo surface | O que carrega | Relevância para o pipeline de áudio |
|---|---|---|
| `input_type` | `audio` | Ponto de entrada do pipeline de áudio |
| `input_subtype` | `ogg_opus` / `mp4_audio` / `other_audio` | Formato do arquivo de áudio |
| `media_ref` | Referência ao arquivo de áudio no storage | Ponteiro para transcrição futura |
| `media_mime_type` | MIME do áudio (ex: `audio/ogg; codecs=opus`) | Identificação do formato |
| `media_size_bytes` | Tamanho em bytes | Indica duração aproximada; detecta áudio muito longo |
| `caption` | Texto enviado junto ao áudio (raro, mas possível) | Insumo adicional de contexto |
| `confidence_hint` | `high` / `medium` / `low` — da surface | Grau de confiança da surface na classificação |
| `surface_warnings` | Lista de avisos | Sinais de problema: arquivo ilegível, muito grande, formato incomum |
| `raw_payload_ref` | Ponteiro para payload bruto | Rastreabilidade permanente |
| `dedupe_key` | Hash para deduplicação | Detecta áudio duplicado |

**Campos adicionais para áudio** (quando disponíveis na surface ou no canal):
- `duration_hint`: duração estimada em segundos (quando o canal fornece)

**O que a surface NÃO faz com áudio:**
- Não transcreve o áudio
- Não extrai dados da fala
- Não classifica intenção do lead
- Não produz `reply_text`
- Não associa a P1/P2/P3

---

## §5 Relação com T4 / T3 / T2 / T5

### 5.1 T4 — Orquestrador de turno

O pipeline de áudio entrega ao orquestrador T4 via campo `attachments[]` de `TurnoEntrada`:

```
TurnoEntrada.attachments[] = [
  {
    attachment_id:       string    — ID único do anexo neste turno
    surface_event_id:    string    — vínculo com SurfaceEventNormalizado
    media_ref:           string    — ponteiro para o arquivo de áudio
    media_mime_type:     string    — ex: "audio/ogg; codecs=opus"
    input_type:          "audio"
    input_subtype:       string    — "ogg_opus" | "mp4_audio" | "other_audio"
    duration_hint:       number | null — duração em segundos, se disponível
    transcript_text:     string | null — transcrição (hipótese), se STT disponível
    transcript_confidence: string | null — "audio_good" | "audio_medium" | "audio_poor" | null
    transcript_partial:  boolean   — true se transcrição é parcial
    audio_classification: string | null — hipótese: "resposta" | "duvida" | "objecao" | etc.
    caption:             string    — texto enviado junto ao áudio
    surface_warnings:    string[]  — avisos da surface
    dedupe_key:          string    — para detecção de duplicata
  }
]
```

**Invariante T4:** `TurnoEntrada` nunca carrega `reply_text`.
O orquestrador monta o contexto — o LLM decide o que dizer.

### 5.2 T3 — Policy engine

O policy engine T3 opera sobre o estado do lead (T2). Com áudio:
- T3 pode emitir `soft_veto` se uma informação extraída de áudio (com baixa confiança)
  tentar ser persistida como fato bloqueante sem confirmação
- T3 não transcreve áudio
- T3 não produz `reply_text`

### 5.3 T2 — Estado estruturado e política de confiança

T2 governa como fatos de áudio são persistidos:
- Origem canônica: `AUDIO_TRANSCRIPT` (O3 — `T2_POLITICA_CONFIANCA.md §3.3`)
- Status máximo direto: `captured` (áudio bom) / `hypothesis` (áudio ruim)
- Fato crítico extraído de áudio → sempre exige confirmação antes de `confirmed`
- Tag de source: `"audio_good"` / `"audio_medium"` / `"audio_poor"`
- Reconciliação: áudio que contradiz fato `confirmed` → `CONF_DADO_CONTRADITO` (T2_RECONCILIACAO)

### 5.4 T5 — Funil / F5

T5 declarou as regras comerciais de F5. O áudio pode trazer informações de qualquer fase
do funil — mas o tratamento das regras comerciais permanece em T5. T6.5 não altera
nenhuma regra de T5. Qualquer mudança de regra comercial exige revisão formal.

---

## §6 Tipos de áudio cobertos

### 6.1 Por qualidade

| Tipo | Descrição | Confiança de transcrição |
|---|---|---|
| Áudio curto e claro | Lead diz uma coisa de forma direta; sem ruído | `audio_good` |
| Áudio longo | Lead fala mais de 60s; pode conter múltiplas informações | variável por trecho |
| Áudio com ruído | Fundo barulhento, eco, compressão ruim | `audio_medium` ou `audio_poor` |
| Áudio incompreensível | Lead murmura, idioma diferente, qualidade péssima | `audio_poor` |
| Áudio cortado | Lead gravou parcialmente; frase incompleta | `transcript_partial = true` |
| Áudio sem transcrição | STT indisponível neste momento | `transcript_confidence = null` |
| Áudio com transcrição parcial | STT transcreveu parte; trecho incompreensível | `transcript_partial = true` |

### 6.2 Por conteúdo conversacional

| Tipo | Descrição | Classificação hipotética |
|---|---|---|
| Resposta direta ao stage atual | Lead responde à pergunta do atendente | `"resposta"` |
| Dúvida do cliente | Lead pergunta algo sobre o processo | `"duvida"` |
| Objeção / medo | Lead expressa resistência, insegurança, dúvida sobre WhatsApp | `"objecao"` |
| Envio de informação | Lead manda dado: renda, regime, estado civil | `"informacao"` |
| Correção de dado | Lead corrige algo que disse antes | `"correcao"` |
| Pedido de visita / agendamento | Lead pede para ir ao plantão | `"pedido_visita"` |
| Pedido de atendimento humano | Lead pede falar com pessoa | `"pedido_humano"` |
| Informação fora de ordem | Lead manda dado não solicitado ainda | `"informacao_fora_ordem"` |
| Demonstração de medo/insegurança | Lead demonstra preocupação | `"emocional"` |
| Sumiço / retorno | Lead some e volta depois; áudio de retorno | `"retorno"` |

### 6.3 Por situação especial

| Tipo | Descrição |
|---|---|
| Áudio fora de contexto | Conteúdo não se relaciona com o stage atual |
| Áudio repetido | Mesmo conteúdo de áudio enviado novamente (dedupe_key igual) |
| Áudio de terceiro | Voz de pessoa diferente do lead / alguém falando pelo lead |
| Áudio com informação sensível | CPF, senha, número de documento dito em voz |
| Áudio contraditório | Lead contradiz fato já confirmado anteriormente |
| Áudio com múltiplas informações | Um único áudio com vários dados misturados |

---

## §7 Fluxo declarativo do áudio

```
FLUXO DECLARATIVO — PIPELINE DE ÁUDIO

[1] Canal recebe áudio (mensagem de voz do lead)
        |
        ↓
[2] T6_SURFACE_CANAL normaliza como SurfaceEventNormalizado
    - input_type = "audio"
    - media_ref, media_mime_type, media_size_bytes
    - duration_hint (se disponível)
    - caption (se houver texto junto)
    - confidence_hint
    - surface_warnings
    - dedupe_key
        |
        ↓
[3] EA-01: Recepção — pipeline recebe SurfaceEventNormalizado
    - Preserva raw_payload_ref (rastreabilidade)
    - Preserva media_ref (ponteiro para áudio)
    - NÃO transcreve automaticamente (STT é lacuna futura)
    - NÃO responde ao cliente
        |
        ↓
[4] EA-02: Preparação para transcrição futura
    - STT declarado como lacuna futura (T6-LA-01)
    - transcript_text = null enquanto STT indisponível
    - transcript_confidence = null
    - Pipeline continua sem transcrição: contexto indica "áudio recebido sem transcrição"
        |
        ↓
[5] EA-03: Transcrição como hipótese (quando STT disponível)
    - Transcrição recebe transcript_confidence: audio_good | audio_medium | audio_poor
    - Se audio_poor: transcript_text permanece como hipótese — não persiste fato
    - Se audio_medium: candidates com confidence = "low"
    - Se audio_good: candidates com confidence adequada por tipo
    - Transcrição parcial: transcript_partial = true; trecho ausente = pendência
        |
        ↓
[6] EA-04: Classificação conversacional
    - Hipótese de intenção: resposta | duvida | objecao | informacao | correcao | etc.
    - Baseada em: transcrição (se disponível) + caption + contexto do stage atual
    - Classificação nunca é verdade absoluta
        |
        ↓
[7] EA-05: Extração de fatos candidatos
    - Fatos extraídos são "candidatos" — não confirmados automaticamente
    - Origem registrada como AUDIO_TRANSCRIPT + qualidade
    - Fatos críticos (renda, estado civil, restrição) → exigem confirmação independente da qualidade
    - Fatos numéricos de áudio médio → captured/low + PEND_CONFIRMACAO
        |
        ↓
[8] EA-06: Validação T4/T3/T2
    - T4 valida forma e monta contexto
    - T3 aplica policy/veto
    - T2 reconcilia confiança/conflito
    - Nenhum fato crítico confirmado só por áudio ambíguo
        |
        ↓
[9] EA-07: Resposta pelo LLM
    - LLM usa transcrição/contexto como insumo
    - reply_text vem EXCLUSIVAMENTE do LLM
    - Pipeline de áudio não escreve fala
        |
        ↓
[10] EA-08: Falha / áudio ruim
    - Se áudio incompreensível, sem transcrição ou com confiança muito baixa:
      LLM solicita reenvio ou confirmação por texto
    - Não quebra o funil
    - Não encerra o lead

Resultado: attachment[audio] em TurnoEntrada → LLM conduz → T4.3 valida → T2 persiste
```

---

## §8 Etapas do pipeline de áudio — detalhe

### EA-01 — Recepção via surface

**Entrada:** `SurfaceEventNormalizado` com `input_type = "audio"` entregue pela T6_SURFACE_CANAL.

**O que faz:**
- Registra recebimento
- Preserva `raw_payload_ref` — imutável, rastreabilidade permanente
- Preserva `media_ref` — ponteiro para arquivo de áudio
- Preserva `duration_hint` — duração (se disponível)
- Preserva `caption` — texto enviado junto (se houver)
- Preserva `surface_warnings` — avisos da surface
- Preserva `dedupe_key` — para detecção de duplicata

**O que NÃO faz:**
- NÃO transcreve o áudio
- NÃO abre o arquivo de áudio
- NÃO interpreta o conteúdo
- NÃO responde ao cliente
- NÃO avança stage

**Condição de rejeição imediata:**
- `surface_warnings` indica arquivo de áudio inválido/corrompido → EA-08 (falha)
- `media_size_bytes` acima do limite → `surface_warnings` adicional; orientar áudio mais curto

---

### EA-02 — Preparação para transcrição futura

**STT como lacuna declarada (T6-LA-01):**
- Nesta PR, STT não está implementado
- `transcript_text = null`; `transcript_confidence = null`
- O pipeline continua sem transcrição disponível

**O que o sistema pode fazer sem STT:**
- Registrar que recebeu áudio
- Informar o LLM: "lead enviou mensagem de voz; transcrição indisponível"
- LLM pode pedir confirmação: "Você enviou um áudio — pode me mandar por texto?"
- LLM pode prosseguir se o contexto conversacional sugere o conteúdo

**O que o sistema NÃO faz sem STT:**
- NÃO extrai nenhuma informação do áudio
- NÃO avança stage com base apenas no áudio recebido
- NÃO persiste nenhum fato
- NÃO confirma nenhuma informação crítica

**Quando STT futuramente existir:**
- Transcrição entra como campo `transcript_text` com `transcript_confidence`
- Fluxo continua em EA-03
- Regras de EA-03 a EA-07 aplicam-se integralmente

---

### EA-03 — Transcrição como hipótese

**Premissa canônica:** toda transcrição é hipótese até confirmação.

**Níveis de qualidade:**

| Indicadores | `transcript_confidence` | Status máximo em T2 | O que autoriza |
|---|---|---|---|
| Transcrição clara, sem artefatos, contexto inequívoco | `audio_good` | `captured` (conf. média) | Orientar conversa; candidato forte; confirmar fatos críticos |
| Palavras duvidosas, contexto parcial, possível erro STT | `audio_medium` | `captured/low` | Orientar conversa com cautela; confirmar **qualquer** fato de negócio |
| Muitos erros, contexto perdido, valor numérico ilegível | `audio_poor` | `hypothesis` (não persiste) | Recoleta obrigatória; LLM pede reenvio ou confirmação textual |
| Transcrição parcial (trecho ausente) | `transcript_partial = true` | `captured/low` (parte transcrita) | Perguntar sobre trecho faltante |
| STT indisponível | `null` | N/A | LLM pede texto ou reenvio |
| Transcrição contraditória com contexto | marcado como `conflicting` | `contradicted` | Reconciliação obrigatória |

**Regras absolutas herdadas de T2:**
- `audio_poor` NUNCA confirma fato crítico (PC-06 — `T2_POLITICA_CONFIANCA §3.3`)
- Fato numérico (renda, valor) de `audio_medium` → `PEND_CONFIRMACAO`
- Nenhuma qualidade de áudio promove diretamente a `confirmed` para fato crítico

---

### EA-04 — Classificação conversacional

**Objetivo:** inferir a intenção comunicativa do áudio para o LLM usar como contexto.

**Entradas disponíveis:**

| Insumo | Confiança | Descrição |
|---|---|---|
| Transcrição (`audio_good`) + stage atual | Alta | Lead claramente respondeu a pergunta específica |
| Caption enviada junto ao áudio | Alta | "aqui meu áudio com minha renda" |
| Transcrição (`audio_medium`) + contexto | Média | Inferência com ressalva |
| Stage atual + docs pendentes | Média | Em `docs_collection`: áudio sobre doc é provável `informacao` |
| Sem transcrição + contexto conversacional | Baixa | Hipótese especulativa |

**Classificações hipotéticas:**

| Classificação | Descrição | Ação LLM típica |
|---|---|---|
| `resposta` | Lead responde à pergunta atual | Processar resposta; confirmar se fato crítico |
| `duvida` | Lead tem pergunta/dúvida | LLM esclarece |
| `objecao` | Lead expressa resistência | LLM acolhe e conduz |
| `informacao` | Lead oferece dado não solicitado ainda | LLM registra; pode confirmar |
| `correcao` | Lead corrige dado anterior | T2 reconciliação obrigatória |
| `pedido_visita` | Lead quer ir ao plantão | LLM agenda conforme RC-F5-27 |
| `pedido_humano` | Lead quer atendente humano | LLM acolhe; pode chamar Vasques |
| `informacao_fora_ordem` | Dado inesperado para o stage | LLM registra; confirma depois |
| `emocional` | Medo, insegurança, ansiedade | LLM acolhe; não pressiona |
| `retorno` | Lead sumiu e volta | LLM retoma contexto |
| `desconhecido` | Não foi possível classificar | LLM pede confirmação por texto |

**Regra canônica:** classificação é hipótese. O LLM usa como orientação — não como verdade.

---

### EA-05 — Extração de fatos candidatos

**Objetivo:** identificar informações que o lead aparentemente declarou no áudio.

**Regras de extração:**

| Dado | Qualidade mínima para `captured` | Exige confirmação? |
|---|---|---|
| Renda (`fact_monthly_income_*`) | `audio_good` | **SIM** — sempre (fato crítico) |
| Regime de trabalho (`fact_work_regime_*`) | `audio_good` | **SIM** — fato crítico |
| Estado civil (`fact_estado_civil`) | `audio_good` | **SIM** — fato crítico |
| Restrição (`fact_credit_restriction`) | `audio_good` | **SIM** — fato crítico |
| Composição de renda / P2 / P3 | `audio_good` | **SIM** — fato crítico |
| RNM / naturalização | `audio_good` | **SIM** — fato crítico de elegibilidade |
| Objetivo (`fact_customer_goal`) | `audio_medium` | Recomendado |
| Interesse em visita (`fact_visit_interest`) | `audio_medium` | Recomendado para confirmar |
| Nome preferido (`fact_preferred_name`) | `audio_good` | Não obrigatório |
| Sinalização de FGTS | `audio_medium` | Confirmar valor/disponibilidade |
| Sinalização de entrada | `audio_medium` | Confirmar valor |
| Intenção de desistência | `audio_good` | **SIM** — consequência alta |

**O que não é extraído:**
- Nenhum fato de áudio `audio_poor`
- Nenhum fato de áudio sem transcrição
- Nenhum fato de trecho parcial/incompreensível
- Valores numéricos de `audio_medium` sem confirmação posterior

**Origem registrada em FactEntry.source:**
```
source = "AUDIO_TRANSCRIPT"
source_detail = "audio_good" | "audio_medium" | "audio_poor"
turn_id = <turn atual>
```

---

### EA-06 — Validação T4/T3/T2

**T4 — orquestrador:**
- Monta `TurnoEntrada.attachments[]` com contexto de áudio
- Valida forma do `attachment` (campos obrigatórios presentes)
- Aciona pipeline LLM (T4.2) com contexto documental/áudio
- Aciona validação/persistência (T4.3) após LLM responder

**T3 — policy engine:**
- Pode emitir `soft_veto` se candidato de áudio com baixa confiança tentar persistir como fato
  bloqueante de negócio
- Opera sobre `lead_state` + candidatos — não sobre áudio bruto
- Não produz `reply_text`

**T2 — estado e reconciliação:**
- Reconcilia candidatos de áudio com fatos já persistidos
- Se áudio contradiz fato `confirmed` → `CONF_DADO_CONTRADITO` (T2_RECONCILIACAO)
- Status máximo por qualidade: `audio_good → captured` / `audio_medium → captured/low` / `audio_poor → hypothesis`
- Nenhum fato crítico vai para `confirmed` apenas por áudio sem confirmação explícita do lead

---

### EA-07 — Resposta pelo LLM

**Invariante absoluta:** `reply_text` vem **exclusivamente** do LLM.

**O LLM usa o contexto de áudio para:**
- Confirmar o que entendeu: "Ouvi seu áudio — você disse que sua renda é R$ 2.800, certo?"
- Pedir confirmação de informação crítica: "Você mencionou que é autônomo — pode confirmar?"
- Pedir reenvio por texto: "Não consegui entender bem seu áudio — pode escrever para mim?"
- Acolher emoção: "Entendo a preocupação — vamos juntos resolver isso."
- Avançar conversa: "Perfeito, recebi! Agora preciso de..."
- Tratar objeção: acolher e conduzir para próximo passo
- Registrar informação fora de ordem: processar e usar no momento adequado

**O pipeline de áudio NÃO faz nenhuma dessas ações.**
O pipeline apenas prepara o insumo — o LLM decide o que dizer.

---

### EA-08 — Falha / áudio ruim

**Condições que acionam EA-08:**

| Condição | O que acontece |
|---|---|
| Arquivo de áudio inválido/corrompido | `surface_warnings` → LLM pede reenvio |
| Áudio inaudível / incompreensível (`audio_poor`) | LLM pede reenvio ou texto |
| Áudio sem transcrição (STT indisponível) | LLM orienta: "Pode escrever para mim?" |
| Áudio muito longo (>duração limite) | `surface_warnings` → LLM pede áudio mais curto ou texto |
| Áudio com transcrição parcial | LLM confirma parte transcrita; pede complemento |
| Áudio duplicado (`dedupe_key` igual) | Ignorar silenciosamente ou confirmar "já recebi" |

**Regras de falha:**
- Falha de áudio **não quebra o funil**
- Falha de áudio **não encerra o lead**
- Falha de áudio **não persiste nenhum fato**
- LLM orienta alternativa: texto, reenvio, visita ao plantão
- Se o lead insiste em áudio e qualidade é ruim: após 2–3 tentativas, LLM pode convidar para plantão

---

## §9 Níveis de confiança da transcrição

Declaração formal dos níveis canônicos, alinhados com `T2_POLITICA_CONFIANCA.md §3.3`:

| Nível | Código | Descrição | Status T2 máximo | Autoriza persistência de fato crítico? |
|---|---|---|---|---|
| Indisponível | `audio_unavailable` | Arquivo não chegou ou corrompido | N/A | Não — recoleta |
| Sem transcrição | `transcription_unavailable` | STT indisponível; áudio recebido | N/A | Não — pedir por texto |
| Baixa confiança | `transcription_low_confidence` = `audio_poor` | Muitos erros; contexto perdido | `hypothesis` | Não — recoleta obrigatória |
| Média confiança | `transcription_medium_confidence` = `audio_medium` | Palavras duvidosas; contexto parcial | `captured/low` | Não — confirmar qualquer fato de negócio |
| Alta confiança | `transcription_high_confidence` = `audio_good` | Transcrição clara; contexto inequívoco | `captured` | Não para fatos críticos — confirmar antes de `confirmed` |
| Parcial | `transcription_partial` | Parte transcrita; trecho ausente | `captured/low` (parte válida) | Não — confirmar; pedir trecho faltante |
| Conflitante | `transcription_conflicting` | Transcrição contradiz contexto/fato anterior | `contradicted` | Não — reconciliação obrigatória |

**Regra de ouro:** nenhum nível de confiança autoriza fato crítico como `confirmed` sem
confirmação explícita do lead no contexto da conversa.

---

## §10 Informações críticas que exigem confirmação

Áudio **nunca** confirma sozinho — por nenhum nível de confiança — os seguintes dados:

| Dado | `fact_*` canônico | Por quê é crítico |
|---|---|---|
| Renda | `fact_monthly_income_p1/p2/p3` | Define elegibilidade e cálculo de capacidade |
| Regime de trabalho | `fact_work_regime_p1/p2/p3` | Define documentação e limites de renda financiável |
| Composição de renda / multi-renda | sem `fact_*` único — RC-F5-38 | Cada fonte altera o perfil do dossiê |
| Estado civil | `fact_estado_civil` | Define P2 obrigatório; documentação civil |
| Intenção de financiar sozinho ou em conjunto | `fact_process_mode` | Define escopo do processo |
| Restrição de crédito | `fact_credit_restriction` | Pode bloquear avanço; orienta conduta |
| CPF / RG / documento sensível | — (informativo; não persistir via áudio) | Risco de captura incorreta de dado sensível |
| Naturalidade / RNM | `fact_rnm_status` | Impacto direto em elegibilidade MCMV |
| Autorização para seguir com dossiê | — (intenção de avançar) | Lead deve confirmar textualmente |
| Agendamento de visita | `fact_visit_interest` | Agendamento tem implicações operacionais |
| Aprovação/reprovação do correspondente | — (retorno externo) | Dado vem do correspondente, não do lead |
| Qualquer dado que altere elegibilidade | vários `fact_*` | Impacto direto no resultado do processo |

**Forma correta de confirmação:**
- LLM transcreve o entendido e pergunta diretamente: "Você disse X — está correto?"
- Lead confirma textualmente (texto ou voz + confirmação)
- Após confirmação explícita: T2 eleva para `confirmed`

---

## §11 Áudio como entrada conversacional

Áudio pode servir para qualquer das seguintes funções — sempre como **insumo ao LLM**, nunca como executor mecânico:

| Função | Descrição | Tratamento |
|---|---|---|
| Responder pergunta atual | Lead responde à pergunta do atendente | LLM processa; confirma se crítico |
| Explicar dúvida | Lead quer entender algo | LLM esclarece |
| Trazer objeção | Lead tem medo, insegurança, resistência | LLM acolhe e conduz |
| Mandar informação fora de ordem | Lead diz dado não solicitado ainda | LLM registra; usa no momento certo |
| Complementar renda | Lead cita renda adicional | LLM registra como candidato; confirma |
| Corrigir dado anterior | Lead diz que algo estava errado | T2 reconciliação; LLM confirma |
| Informar que enviará documentos | Lead diz que vai mandar doc | LLM registra intenção; aguarda doc |
| Demonstrar medo/insegurança | Emoção negativa | LLM acolhe; não pressiona |
| Pedir atendimento humano | Lead quer falar com pessoa | LLM acolhe; pode acionar Vasques |
| Pedir visita / ir ao plantão | Lead quer presencial | LLM conduz agendamento (RC-F5-27) |
| Sumir / retornar | Lead some e volta | LLM retoma contexto sem pressão |

---

## §12 Tratamento de casos problemáticos

### 12.1 Áudio inaudível / incompreensível

**Condição:** `transcript_confidence = audio_poor` ou `transcription_unavailable`
**Estado pipeline:** fatos não extraídos; classificação = `desconhecido`
**Ação LLM:** "Não consegui entender bem seu áudio. Pode me enviar por escrito?"
**Bloqueio?** Não — funil continua; apenas esse turno fica sem extração

---

### 12.2 Áudio com muito ruído

**Condição:** `transcript_confidence = audio_medium`; partes inteligíveis, partes com ruído
**Estado pipeline:** candidatos com `confidence = "low"`; fatos críticos → `PEND_CONFIRMACAO`
**Ação LLM:** confirmar entendimento; pedir confirmação dos pontos importantes
**Bloqueio?** Não para fatos não críticos; sim para fatos críticos até confirmação

---

### 12.3 Áudio cortado / incompleto

**Condição:** `transcript_partial = true`; frase claramente incompleta
**Estado pipeline:** parte transcrita processada; trecho ausente = pendência
**Ação LLM:** "Parece que seu áudio cortou. Pode completar o que ia dizer?"
**Bloqueio?** Não — processa o que há; pede complemento

---

### 12.4 Áudio muito longo

**Condição:** `duration_hint` > limite operacional (a ser definido em PR futura de runtime)
**Estado pipeline:** `surface_warnings` ativo; processar o que for possível
**Ação LLM:** "Áudio bem longo — vou ouvir com atenção. Se preferir, pode enviar por escrito também."
**Bloqueio?** Não — apenas sinaliza

---

### 12.5 Áudio em outro idioma

**Condição:** transcrição em idioma diferente do português; STT não reconheceu
**Estado pipeline:** `transcript_confidence = audio_poor`; classificação = `desconhecido`
**Ação LLM:** tentar identificar idioma; redirecionar para atendimento adequado se necessário
**Bloqueio?** Não — funil continua; mas sem extração de fato

---

### 12.6 Áudio de terceiro (outra pessoa falando pelo lead)

**Condição:** voz claramente diferente do lead; ou lead diz "estou passando para minha esposa"
**Estado pipeline:** fatos extraídos marcados como `person_hint = unknown` até confirmação
**Ação LLM:** confirmar quem está falando; ajustar contexto de pessoa (P1/P2/P3)
**Bloqueio?** Não — mas fatos associados exigem confirmação de pessoa

---

### 12.7 Áudio com múltiplas informações

**Condição:** lead fala renda, estado civil e FGTS no mesmo áudio
**Estado pipeline:** extrair cada candidato separado; cada um com sua confiança; cada um com confirmação pendente
**Ação LLM:** processar um por um; confirmar os críticos antes de seguir
**Bloqueio?** Não — mas organizar a confirmação por prioridade de negócio

---

### 12.8 Áudio contraditório com dados já confirmados

**Condição:** lead diz algo que contradiz `fact_*` com status `confirmed`
**Estado pipeline:** T2 → `CONF_DADO_CONTRADITO`; T2_RECONCILIACAO acionada
**Ação LLM:** "Antes você mencionou X — agora parece que está dizendo Y. Pode me confirmar qual é o correto?"
**Bloqueio?** Sim para o fato em conflito — reconciliação obrigatória

---

### 12.9 Áudio duplicado

**Condição:** `dedupe_key` igual ao de áudio anterior
**Estado pipeline:** marcar como duplicado; não reprocessar
**Ação LLM:** ignorar silenciosamente ou confirmar "já recebi esse áudio"
**Bloqueio?** Não

---

### 12.10 Áudio fora do stage atual

**Condição:** lead manda áudio com dado de fase diferente da atual
**Estado pipeline:** classificar como `informacao_fora_ordem`; registrar como candidato para fase futura
**Ação LLM:** reconhecer; registrar; focar no que é necessário agora; guardar para quando for relevante
**Bloqueio?** Não — funil continua no stage atual

---

### 12.11 Áudio com informação sensível (CPF, documento dito em voz)

**Condição:** lead diz número de CPF, RG ou outro dado sensível em áudio
**Estado pipeline:** registrar apenas como contexto; **NÃO persistir como fato via áudio**
**Ação LLM:** pedir confirmação por texto; dados sensíveis não são persistidos por voz
**Bloqueio?** Não para o fluxo; mas dado sensível aguarda confirmação textual

---

### 12.12 Áudio sem transcrição (STT indisponível)

**Condição:** STT não está disponível neste momento (`transcription_unavailable`)
**Estado pipeline:** `transcript_text = null`; pipeline continua sem extração
**Ação LLM:** "Você enviou um áudio — pode me mandar por texto também?"
**Bloqueio?** Não — funil continua; apenas sem extração de fato

---

### 12.13 Falha no STT futuro

**Condição:** STT disponível mas falha técnica no processamento
**Estado pipeline:** `transcript_confidence = null` (equiv. a `transcription_unavailable`)
**Ação LLM:** mesma de 12.12 — pedir por texto
**Bloqueio?** Não

---

## §13 Limites de avanço por áudio

### 13.1 O que áudio pode autorizar indiretamente

| Ação | Condição |
|---|---|
| Orientar próxima pergunta do LLM | Sempre — com qualquer confiança |
| Candidato para fato não crítico | `audio_good` |
| Candidato para fato crítico com pendência de confirmação | `audio_good` ou `audio_medium` |
| Reclassificação de intenção (dúvida, objeção, etc.) | Sempre — hipotético |

### 13.2 O que áudio NUNCA autoriza sozinho

| Ação proibida | Motivo |
|---|---|
| Confirmar fato crítico diretamente | Fato crítico exige confirmação explícita — qualquer qualidade |
| Avançar stage | Stage é decisão T3/T4; não do canal |
| Marcar dossiê como completo | Dossiê é T6.8 + correspondente |
| Agendar visita como fato confirmado | `fact_visit_interest` exige confirmação textual |
| Aprovar/reprovar cliente | Decisão do correspondente/banco |
| Persistir renda como `confirmed` | Renda é crítica; sempre exige confirmação |
| Iniciar envio ao correspondente | Responsabilidade de T6.8 |

---

## §14 Relação com T6.6 — Sticker, mídia inútil e mensagens não textuais

PR-T6.6 cobrir inputs que não são texto, documento, imagem, PDF nem áudio com conteúdo
conversacional relevante:
- Stickers (animados e estáticos)
- GIFs
- Reações
- Áudio de duração zero
- Entrada completamente ilegível ou vazia
- Inputs que não trazem dado conversacional

**Diferença fundamental:**
- **T6.5 (áudio):** conteúdo conversacional relevante que alimenta o cérebro do LLM
- **T6.6 (sticker/mídia inútil):** entrada sem conteúdo conversacional útil — tratamento seguro
  para não quebrar o funil

T6.6 herda os estados documentais de T6.3 e o mecanismo de surface de T6.2, mas declara
tratamento específico para "sujeira do WhatsApp real".

---

## §15 Proibições absolutas

| Código | Proibição | Motivo |
|---|---|---|
| PROB-AUD-01 | Áudio não pode gerar `reply_text` | Soberania da fala — A00-ADENDO-01 |
| PROB-AUD-02 | Áudio não pode decidir stage | Canal não decide stage — A00-ADENDO-02 |
| PROB-AUD-03 | Áudio não pode aprovar/reprovar cliente | Decisão do correspondente/banco |
| PROB-AUD-04 | Áudio não pode confirmar renda sozinho | Fato crítico — confirmação obrigatória |
| PROB-AUD-05 | Áudio não pode confirmar estado civil sozinho | Fato crítico — confirmação obrigatória |
| PROB-AUD-06 | Áudio não pode confirmar restrição sozinho | Fato crítico — confirmação obrigatória |
| PROB-AUD-07 | Áudio não pode confirmar agendamento sozinho | Implicações operacionais — confirmar |
| PROB-AUD-08 | Áudio não pode persistir fato crítico sem validação T4/T3/T2 | Pipeline canônico é obrigatório |
| PROB-AUD-09 | Áudio não pode criar `fact_*` novo | `fact_*` é responsabilidade de T4→T3→T2 |
| PROB-AUD-10 | Áudio não pode criar `current_phase` novo | Valores canônicos em T2_LEAD_STATE_V1 §3.3 |
| PROB-AUD-11 | Áudio não pode alterar regra comercial F5 | RC-F5-* são canônicas em T5 |
| PROB-AUD-12 | STT não pode ser obrigatório | STT é lacuna futura (T6-LA-01) |
| PROB-AUD-13 | STT não pode virar verdade absoluta | STT é insumo hipotético — não árbitro |
| PROB-AUD-14 | Transcrição não pode substituir o LLM | LLM é o único condutor da conversa |
| PROB-AUD-15 | Transcrição não pode substituir T3/T2 | Policy e estado são T3/T2 — não o canal |
| PROB-AUD-16 | Áudio não pode abrir canal real WhatsApp/Meta | Canal real é T6.7/T6.9 |
| PROB-AUD-17 | Áudio não pode abrir T7 | T7 é go-live controlado |
| PROB-AUD-18 | Áudio não pode implementar runtime | Esta PR é declarativa |
| PROB-AUD-19 | Áudio não pode criar pergunta fixa/template mecânico | Soberania da fala no LLM — A00-ADENDO-01 |
| PROB-AUD-20 | Áudio não pode criar funil paralelo | "T6 não cria outro cérebro" — A00-ADENDO-02 |

---

## §16 Riscos e mitigação

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R-AUD-01 | Transcrição tratada como verdade absoluta | Alta | Crítico | §3.2: transcrição é hipótese; §9: níveis de confiança; PROB-AUD-13 |
| R-AUD-02 | Fato crítico persistido sem confirmação via áudio | Alta | Alto | EA-05 + §10: fatos críticos sempre confirmados; PC-06 de T2 |
| R-AUD-03 | STT virar cérebro paralelo de atendimento | Média | Crítico | PROB-AUD-14/15/20; "T6 não cria outro cérebro" |
| R-AUD-04 | Áudio avançando stage sozinho | Baixa | Crítico | PROB-AUD-02 + A00-ADENDO-02 |
| R-AUD-05 | Renda capturada de áudio sem confirmação | Alta | Alto | §10 tabela; EA-05 regras; PROB-AUD-04 |
| R-AUD-06 | Áudio ruim persistindo fato (`audio_poor`) | Alta | Alto | PC-06 (T2); EA-03: `audio_poor → hypothesis` apenas |
| R-AUD-07 | Áudio de terceiro persistindo como P1 | Média | Alto | EA-06 §12.6: `person_hint = unknown`; confirmação obrigatória |
| R-AUD-08 | Dado sensível (CPF) capturado via áudio | Alta | Alto | §12.11: dados sensíveis nunca persistidos por voz |
| R-AUD-09 | Áudio contraditório sem reconciliação | Média | Médio | EA-06 + T2_RECONCILIACAO; §12.8: `CONF_DADO_CONTRADITO` |
| R-AUD-10 | Lead dependente de áudio com STT indisponível | Alta | Médio | EA-08: LLM pede texto; não bloqueia funil |

---

## §17 Critérios de aceite da PR-T6.5

| # | Critério | Status |
|---|---|---|
| CA-T6.5-01 | `T6_AUDIO_CEREBRO_CONVERSACIONAL.md` existe no repositório | ✅ |
| CA-T6.5-02 | Fluxo de áudio declarado (§7 — 10 passos) | ✅ |
| CA-T6.5-03 | Etapas EA-01..EA-08 declaradas em detalhe (§8) | ✅ |
| CA-T6.5-04 | Transcrição tratada como hipótese com níveis de confiança (§9) | ✅ |
| CA-T6.5-05 | Informações críticas que exigem confirmação definidas (§10) | ✅ |
| CA-T6.5-06 | Áudio como entrada conversacional declarado (§11) | ✅ |
| CA-T6.5-07 | 15 tipos de áudio cobertos (§6) | ✅ |
| CA-T6.5-08 | 13 casos problemáticos com tratamento (§12) | ✅ |
| CA-T6.5-09 | Limites de avanço por áudio declarados (§13) | ✅ |
| CA-T6.5-10 | Relação com T6.6 declarada (§14) | ✅ |
| CA-T6.5-11 | 20 proibições absolutas PROB-AUD-01..20 declaradas (§15) | ✅ |
| CA-T6.5-12 | STT declarado como lacuna futura (T6-LA-01) | ✅ |
| CA-T6.5-13 | Âncora canônica T2_POLITICA_CONFIANCA §3.3 declarada (§3.3) | ✅ |
| CA-T6.5-14 | Áudio não cria `reply_text` | ✅ |
| CA-T6.5-15 | Áudio não cria `fact_*` | ✅ |
| CA-T6.5-16 | Áudio não cria `current_phase` | ✅ |
| CA-T6.5-17 | Áudio não decide stage | ✅ |
| CA-T6.5-18 | Zero `src/` tocado | ✅ |
| CA-T6.5-19 | Zero STT real implementado | ✅ |
| CA-T6.5-20 | Zero canal real aberto | ✅ |
| CA-T6.5-21 | Próxima PR autorizada declarada como PR-T6.6 | ✅ |
| CA-T6.5-22 | A00-ADENDO-01/02/03 declarados conformes | ✅ |
| CA-T6.5-23 | Bloco E presente em §19 | ✅ |

---

## §18 Próxima PR autorizada

**PR-T6.6 — Sticker, mídia inútil e mensagens não textuais**

PR-T6.6 recebe este contrato (T6.5) e os anteriores como base e declara o tratamento seguro
de entradas que não carregam conteúdo conversacional útil:
- Stickers estáticos e animados
- GIFs
- Reações de emoji
- Mensagens de sistema sem ação
- Entradas `unknown_or_invalid` da surface
- Mídia corrompida sem possibilidade de recuperação
- "Sujeira do WhatsApp" que não deve quebrar o funil

**PR-T6.6 não pode abrir sem PR-T6.5 merged.**

---

## §19 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---

Documento-base da evidência:
  schema/implantation/T6_AUDIO_CEREBRO_CONVERSACIONAL.md (este artefato)

Estado da evidência:
  completa

Há lacuna remanescente?:
  não — STT é lacuna futura planejada (T6-LA-01), declarada explicitamente em EA-02
  e §15 PROB-AUD-12; não bloqueante desta PR.
  Nenhuma lacuna não declarada identificada.

Há item parcial/inconclusivo bloqueante?:
  não — todos os critérios de aceite CA-T6.5-01..23 estão ✅

Fechamento permitido nesta PR?:
  sim — todos os critérios satisfeitos; artefato completo; zero violações de adendo

Estado permitido após esta PR:
  PR-T6.5 encerrada — PR-T6.6 desbloqueada

Próxima PR autorizada:
  PR-T6.6 — Sticker, mídia inútil e mensagens não textuais

--- FIM BLOCO E ---
```

### Evidências consolidadas (25 provas)

| # | Prova | Verificação |
|---|---|---|
| 1 | `T6_AUDIO_CEREBRO_CONVERSACIONAL.md` criado | git diff HEAD |
| 2 | Zero `src/` | git diff HEAD — sem arquivos em src/ |
| 3 | Zero `fact_*` novo | inspeção textual — nenhuma chave nova declarada |
| 4 | Zero `current_phase` novo | inspeção textual |
| 5 | Zero migration Supabase | git diff HEAD |
| 6 | Zero `reply_text` produzido | inspeção — nenhum campo reply_text neste artefato |
| 7 | Zero canal real aberto | PROB-AUD-16 + git diff |
| 8 | Zero STT real implementado | PROB-AUD-12 + EA-02 + inspeção |
| 9 | PR-T6.4 merged verificado | #129 merged 2026-04-28T20:07:41Z |
| 10 | §6: 15 tipos de áudio cobertos | §6.1, 6.2, 6.3 |
| 11 | §7: fluxo declarativo completo (10 passos) | §7 diagrama |
| 12 | §8: EA-01..EA-08 declaradas | §8 detalhe |
| 13 | §9: 7 níveis de confiança com regras | §9 tabela |
| 14 | §10: 14 informações críticas com confirmação obrigatória | §10 tabela |
| 15 | §11: 11 funções conversacionais do áudio | §11 tabela |
| 16 | §13: limites de avanço declarados | §13.1 + §13.2 |
| 17 | §14: relação com T6.6 declarada | §14 |
| 18 | §15: 20 proibições absolutas PROB-AUD-01..20 | §15 |
| 19 | §16: 10 riscos com mitigação | §16 |
| 20 | §17: 23 critérios de aceite todos ✅ | §17 |
| 21 | A00-ADENDO-01 conforme | PROB-AUD-01 + §3.1 |
| 22 | A00-ADENDO-02 conforme | PROB-AUD-20 + §3 regra-mãe |
| 23 | A00-ADENDO-03 conforme | §19 Bloco E |
| 24 | Âncora T2_POLITICA_CONFIANCA §3.3 declarada | §3.3 + §9 + EA-03/05 |
| 25 | 12 casos problemáticos §12 tratados | §12.1–12.13 |

---

*Artefato gerado em 2026-04-28 — PR-T6.5 — ENOVA 2 / LLM-FIRST*
*Conformidade: A00-ADENDO-01 ✅ A00-ADENDO-02 ✅ A00-ADENDO-03 ✅*
*Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`*
