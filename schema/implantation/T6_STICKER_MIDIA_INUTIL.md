# T6_STICKER_MIDIA_INUTIL — Sticker, Mídia Inútil e Mensagens Não Textuais — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.6 |
| Branch | feat/t6-pr-t6-6-sticker-midia-inutil |
| Artefato | Contrato declarativo para sticker, mídia inútil e mensagens não textuais |
| Status | entregue |
| Pré-requisito | PR-T6.5 merged (#130 — 2026-04-28T20:28:20Z); T6_AUDIO_CEREBRO_CONVERSACIONAL.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.7 — Adapter Meta/WhatsApp governado |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Este artefato declara o contrato declarativo para tratamento de **sticker, mídia inútil e mensagens não
textuais** na ENOVA 2. Cobre toda entrada que chega pelo canal WhatsApp/Meta sem utilidade operacional
direta: sticker, emoji isolado, reação, imagem sem documento claro, print confuso, áudio inaudível,
arquivo corrompido, mensagem vazia e demais variantes de "sujeira de canal".

**Princípio-mãe:** sujeira de canal não é decisão. Nenhuma entrada inútil, ambígua ou não textual
pode decidir stage, escrever `reply_text`, confirmar fato crítico, avançar funil, ou criar `fact_*`.
Tudo continua passando pela mesma governança: `T6_SURFACE_CANAL → T4 → T3 → T2 → T5`.

**Esta PR é declarativa — não implementa runtime, não cria handler real, não abre canal real.**

---

## §2 Finalidade do contrato

Este documento define:
- O princípio central: sujeira de canal não é decisão
- Os tipos de entrada inútil, ambígua ou não textual cobertos
- O fluxo declarativo EM-01..EM-06
- O tratamento por tipo (sticker, emoji, imagem ambígua, print, áudio inaudível, etc.)
- Os limites de persistência e avançamento de stage
- As proibições absolutas PROB-STK-01..20
- Os critérios de aceite CA-T6.6-01..20
- As provas obrigatórias
- A relação com T6_SURFACE_CANAL, T4, T3, T2, T5 e T6.7

---

## §3 Princípio central: sujeira de canal não é decisão

**Regra-mãe (herdada do contrato T6 §1 e A00-ADENDO-02):**

> **Sticker não é resposta estruturada.**
> **Emoji isolado não decide stage.**
> **Reação não confirma dado.**
> **Mídia inválida não quebra o funil.**
> **Imagem sem documento claro não vira documento aceito.**
> **Print confuso não vira verdade absoluta.**
> **Áudio inaudível não confirma fato.**
> **Arquivo corrompido não bloqueia lead.**
>
> Tudo continua passando pela governança:
> `T6_SURFACE_CANAL → T4 → T3 → T2 → T5`

A surface normaliza — o LLM decide como conduzir — o validador T3/T2 decide qualquer persistência.
Nenhuma "sujeira" de canal bypassa esse fluxo.

---

## §4 Relação com `T6_SURFACE_CANAL`

`T6_SURFACE_CANAL` é a camada upstream que normaliza toda entrada bruta do canal em
`SurfaceEventNormalizado`. Este artefato (T6_STICKER_MIDIA_INUTIL) não cria nova surface — ele
**declara como o resultado da surface deve ser tratado** quando o `input_type` indicar entrada
inútil, ambígua ou não textual.

Campos relevantes herdados de `SurfaceEventNormalizado`:

| Campo | Relevância para mídia inútil |
|---|---|
| `input_type` | Classifica a entrada: `sticker`, `image`, `audio`, `document`, `unknown_or_invalid`, `system_event` |
| `input_subtype` | Refinamento: `sticker_static`, `sticker_animated`, `emoji_isolated`, `reaction`, `image_no_doc`, `image_random`, `print_confusing`, `audio_inaudible`, `file_corrupted`, `file_empty`, `message_empty`, etc. |
| `surface_warnings` | Lista de avisos operacionais (ex.: `mime_mismatch`, `zero_bytes`, `duplicate_dedupe`, `no_useful_content`) |
| `dedupe_key` | Identificador de deduplicação para mídia repetida |
| `media_ref` | Referência ao payload da mídia bruta (preservado para rastreabilidade) |
| `raw_payload_ref` | Referência ao payload bruto original (sempre preservado) |
| `caption` | Legenda enviada junto à mídia (pode estar ausente ou ser vazia) |
| `confidence_hint` | Nível de confiança da classificação do tipo de entrada |

**O que T6_SURFACE_CANAL já garante para mídia inútil:**
- INV-SC-01: surface jamais escreve `reply_text` — garantido upstream
- INV-SC-02: surface jamais decide stage — garantido upstream
- INV-SC-03: surface jamais persiste `fact_*` — garantido upstream
- INV-SC-07: entrada inválida ou unknown recebe `surface_warnings` — garantido upstream
- INV-SC-08: todo `SurfaceEventNormalizado` tem `dedupe_key` — garantido upstream

Este artefato declara o que acontece **depois** que a surface normaliza a entrada inútil.

---

## §5 Relação com T4/T3/T2/T5

Nenhuma mídia inútil bypassa o pipeline T4. O fluxo é:

```
Canal bruto → T6_SURFACE_CANAL → SurfaceEventNormalizado
                                          ↓
                               T6_STICKER_MIDIA_INUTIL (EM-01..EM-06)
                                          ↓
                               TurnoEntrada (T4.1) — attachments[]
                                          ↓
                               T4_PIPELINE_LLM — LLM decide conduta
                                          ↓
                         T3_CLASSES_POLITICA / T3_VETO_SUAVE_VALIDADOR
                                          ↓
                               T2_RECONCILIACAO / T2_POLITICA_CONFIANCA
                                          ↓
                               T4_VALIDACAO_PERSISTENCIA — persiste só o que VC-01..09 aprovam
                                          ↓
                               T4_RESPOSTA_RASTRO_METRICAS — entrega reply_text do LLM ao canal
```

**Garantia de integração:**
- T4.1 recebe `attachments[]` com contexto da mídia inútil (sem `reply_text`, sem `fact_*`)
- LLM recebe o contexto e decide: ignorar, acolher, retomar pergunta ou pedir reenvio
- T3 valida qualquer PolicyDecision gerada — mídia inútil não bypassa T3
- T2 reconcilia qualquer candidato a fato extraído — mídia inútil não bypassa T2
- T4.3 persiste somente o que passou pelo validador VC-01..09
- T4.4 entrega `reply_text` capturado do LLM ao canal — nunca gerado pela surface ou pelos handlers de mídia

---

## §6 Tipos de entrada cobertos

Este contrato cobre as seguintes categorias e subtipos de entrada não textual, inútil ou ambígua:

### 6.1 Sticker

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `sticker_static` | Sticker estático (imagem parada do WhatsApp) | Tratado como confirmação implícita de algo |
| `sticker_animated` | Sticker animado (GIF/APNG do WhatsApp) | Mesmo risco; pode carregar mais bytes sem mais sentido |

### 6.2 Emoji e reação

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `emoji_isolated` | Emoji enviado como mensagem (ex.: 👍, ❤️, 😊 sozinhos) | Tratado como confirmação forte de fato crítico |
| `reaction` | Reação de WhatsApp a uma mensagem anterior | Tratado como confirmação de dado ou aprovação de etapa |

### 6.3 Imagem sem documento claro

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `image_no_doc` | Foto enviada que não parece documento identificável | Tratada como documento válido quando não é |
| `image_random` | Imagem aleatória (paisagem, selfie, objeto) | Entra no dossiê de forma incorreta |
| `image_without_context` | Mídia enviada sem legenda e sem contexto de qual documento seria | Classificada erroneamente como doc específico |

### 6.4 Print confuso

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `print_confusing` | Print de tela com informação visual difícil de ler | Virar verdade absoluta sobre renda, restrição ou doc |
| `print_no_context` | Print enviado sem explicação do que representa | Classificado como documento válido sem verificação |

### 6.5 Áudio inaudível

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `audio_inaudible` | Áudio de qualidade `audio_poor` sem transcrição útil (reaproveitado de T6.5) | Confirmar fato crítico sem dado real |
| `audio_no_useful_transcript` | Áudio com transcrição parcial ou vazia sem informação acionável | Avançar stage com dado incompleto |

### 6.6 Mídia repetida

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `media_repeated` | Arquivo idêntico enviado mais de uma vez (mesmo `dedupe_key`) | Duplicar documento no dossiê ou gerar turnos redundantes |
| `media_repeated_different_name` | Arquivo com conteúdo idêntico mas nome diferente | Driblar deduplicação e criar entrada duplicada no dossiê |

### 6.7 Arquivo corrompido ou inválido

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `file_corrupted` | Arquivo que não pode ser aberto, lido ou validado | Bloquear lead ou entrar no dossiê como dado válido |
| `file_empty` | Arquivo com zero bytes ou tamanho mínimo não útil | Tratar como documento enviado válido |
| `file_unsupported_type` | Tipo MIME não suportado ou não reconhecido | Aceitar tipo fora do escopo de documentação |

### 6.8 Mensagem vazia ou sem utilidade operacional

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `message_empty` | Mensagem sem texto nem mídia (payload vazio) | Quebrar funil ou gerar erro de processamento |
| `message_punctuation_only` | Mensagem contendo apenas pontuação ("...", "!!!", "---") | Tratada como resposta ou confirmação |
| `message_weak_confirmation` | Mensagem com "ok", "blz", "👍", "certo" em contexto ambíguo | Confirmar fato crítico sem dado real |

### 6.9 Mídia ambígua ou sem dono

| Subtipo | Descrição | Risco principal |
|---|---|---|
| `media_out_of_context` | Mídia enviada fora do contexto conversacional atual | Associada ao stage errado ou dossiê errado |
| `media_no_owner` | Mídia enviada sem indicação de a quem pertence (P1/P2/P3 indefinido) | Associada à pessoa errada ou não associada |
| `media_looks_like_doc_but_unvalidatable` | Parece documento mas não permite validar (baixa qualidade, cortada, sem campo legível) | Entrar no dossiê como documento aceito |
| `payload_invalid` | Payload com estrutura inválida, campos ausentes ou formato não reconhecido | Erro de processamento ou bypass de validação |

---

## §7 Fluxo declarativo

O fluxo a seguir é **declarativo** — descreve o que deve acontecer, sem implementar runtime.

```
1. Canal recebe entrada não textual, inútil ou ambígua.
2. T6_SURFACE_CANAL normaliza como SurfaceEventNormalizado.
3. Surface define input_type:
   - sticker
   - image
   - audio
   - document
   - unknown_or_invalid
   - system_event (quando aplicável)
4. Surface adiciona surface_warnings se a entrada for ambígua, inválida ou suspeita.
5. SurfaceEventNormalizado vira insumo para TurnoEntrada(T4.1) via attachments[].
6. T4 monta ContextoTurno incluindo o contexto da mídia inútil.
7. LLM recebe o contexto e decide como conduzir:
   - ignorar o sinal inútil;
   - acolher sem sair do stage;
   - retomar a última pergunta;
   - pedir reenvio ou texto;
   - reconhecer confirmação fraca apenas se o contexto permitir.
8. T3/T2 validam qualquer candidato a persistência.
9. Nenhuma mídia inútil avança stage sozinha.
10. Nenhuma mídia inútil escreve reply_text.
11. Nenhuma mídia inútil confirma fato crítico.
12. Funil não quebra; lead segue vivo.
```

---

## §8 Etapas do tratamento — EM-01..EM-06

### EM-01 — Recepção via surface

**O que acontece:**
- Recebe `SurfaceEventNormalizado` vindo da surface (T6_SURFACE_CANAL)
- Preserva `raw_payload_ref` (referência ao payload bruto — sempre)
- Preserva `media_ref`, `dedupe_key`, `surface_warnings`, `caption`, `input_subtype`
- Registra `duration_hint` se for áudio, `media_size_bytes` se for arquivo
- Não interpreta o conteúdo como resposta final
- Não toma decisão de conduta
- Não gera fato

**Campos preservados obrigatoriamente:**

```
attachment_id
surface_event_id
media_ref
raw_payload_ref
input_type
input_subtype
dedupe_key
surface_warnings[]
caption               (pode ser null)
confidence_hint
media_size_bytes      (se disponível)
media_mime_type       (se disponível)
media_filename        (se disponível)
```

**Proibido em EM-01:**
- Escrever `reply_text`
- Criar `fact_*`
- Decidir stage
- Ignorar `surface_warnings`
- Ignorar `dedupe_key`
- Descartar `raw_payload_ref`

---

### EM-02 — Classificação de utilidade

**O que acontece:**
- Classifica a entrada em uma das categorias de utilidade:

| Categoria | Descrição | Exemplo |
|---|---|---|
| `útil` | Entrada com conteúdo acionável para o funil | Imagem que parece documento de renda |
| `ambígua` | Entrada com possível utilidade mas sem clareza suficiente | Print sem contexto |
| `inútil` | Entrada sem utilidade operacional clara | Sticker, emoji isolado, reação |
| `repetida` | Entrada idêntica a uma anterior (`dedupe_key` já visto) | Mesmo arquivo reenviado |
| `inválida` | Entrada tecnicamente inutilizável | Arquivo corrompido, payload inválido |
| `precisa_de_contexto` | Entrada que pode ser útil se o cliente explicar | Foto sem legenda que parece documento |

- A classificação é **hipótese** — não decisão
- A classificação informa o LLM mas não substitui o LLM
- Não decide stage nem avança funil

**Regras da classificação:**
- Sticker → sempre `inútil` (sinal fraco)
- Emoji isolado → `inútil` ou `ambíguo` (depende do contexto recente)
- Reação → `inútil` (não confirma dado)
- Arquivo corrompido → sempre `inválida`
- Arquivo vazio → sempre `inválida`
- Mídia repetida → sempre `repetida` (verificar `dedupe_key`)
- Imagem sem doc claro → `ambígua` ou `precisa_de_contexto`
- Print confuso → `ambígua`
- Áudio inaudível → `inútil` ou `precisa_de_contexto` (reaproveitado de T6.5)
- Mensagem vazia → `inútil`

---

### EM-03 — Definição de risco de confusão

**O que acontece:**
- Identifica o risco associado à entrada para informar o LLM:

| Risco | Código | Descrição |
|---|---|---|
| Confirmação fraca | RISCO-01 | Entrada pode ser interpretada como confirmação de dado crítico quando não é |
| Confusão documental | RISCO-02 | Entrada pode ser confundida com documento válido quando não é |
| Duplicidade | RISCO-03 | Entrada já foi recebida antes (dedupe_key repetido) |
| Arquivo inválido | RISCO-04 | Entrada tecnicamente inutilizável mas pode gerar erro de processamento |
| Dado sensível exposto | RISCO-05 | Entrada pode conter dado pessoal visível sem ser documento solicitado |
| Funil travado | RISCO-06 | Entrada pode ser confundida com resposta que avança stage |
| Contexto errado | RISCO-07 | Entrada enviada para o stage errado ou fora da conversa ativa |

- O risco informa o LLM para que ele conduza corretamente
- Nunca bloqueia o lead de forma cega
- Nunca descarta a entrada sem rastreabilidade

---

### EM-04 — Entrega ao T4

**O que acontece:**
- O contexto da mídia inútil é entregue ao T4 via `TurnoEntrada.attachments[]`
- O shape do attachment para mídia inútil/ambígua:

```
TurnoEntrada.attachments[] = [
  {
    attachment_id:          <uuid>,
    surface_event_id:       <uuid do SurfaceEventNormalizado>,
    media_ref:              <referência à mídia ou null>,
    raw_payload_ref:        <referência ao payload bruto>,
    input_type:             <sticker | image | audio | document | unknown_or_invalid>,
    input_subtype:          <sticker_static | emoji_isolated | reaction | image_no_doc | ...>,
    utility_classification: <útil | ambígua | inútil | repetida | inválida | precisa_de_contexto>,
    risk_flags:             [<RISCO-01>, <RISCO-02>, ...],
    surface_warnings:       [...],
    dedupe_key:             <string de deduplicação>,
    caption:                <string ou null>,
    confidence_hint:        <high | medium | low | none>,
    media_size_bytes:       <número ou null>,
    media_mime_type:        <string ou null>
  }
]
```

**Proibido em EM-04:**
- Criar `reply_text` no attachment
- Criar `fact_*` no attachment
- Decidir `current_phase` no attachment
- Criar template de fala no attachment
- Criar PolicyDecision no attachment (responsabilidade de T3)

---

### EM-05 — Conduta conversacional pelo LLM

**O LLM decide, dentre as opções disponíveis:**

| Conduta | Quando usar | O que não fazer |
|---|---|---|
| Ignorar o sinal inútil | Sticker/emoji sem impacto no contexto atual | Nunca silenciar lead sem razão |
| Acolher sem sair do stage | Reação emocional, sticker de humor, emoji de apoio | Nunca interpretar como confirmação de dado |
| Retomar a última pergunta | Mensagem vazia, pontuação, resposta fraca | Nunca travar o lead em loop infinito |
| Pedir reenvio | Arquivo corrompido, áudio inaudível, print ilegível | Nunca exigir reenvio de forma bloqueante |
| Pedir texto | Áudio sem transcrição útil, imagem sem contexto | Nunca impedir que o lead siga |
| Reconhecer confirmação fraca com cautela | Emoji/sticker em contexto de baixíssima criticidade | Nunca persistir fato crítico com base em sinal fraco |

**Regras de conduta:**
- LLM nunca interpreta sticker como assinatura ou aprovação de etapa
- LLM nunca interpreta emoji como confirmação de renda, estado civil, restrição ou docs
- LLM nunca interpreta reação como confirmação de dado sensível
- LLM pode reconhecer humor/emoção sem alterar o stage
- LLM pode fazer follow-up gentil em caso de silêncio ou mensagem vazia
- Qualquer persistência que o LLM proponha ainda passa por T4/T3/T2 — LLM não persiste diretamente
- O texto de follow-up do LLM é `reply_text` exclusivo do LLM, entregue via T4.4/T4_RESPOSTA

---

### EM-06 — Persistência limitada

**O que pode ser persistido:**

| Item | Condição | Via |
|---|---|---|
| Sinal de interação fraca | Apenas como rastro técnico (não como `fact_*`) | T4.4 (TurnoRastro) |
| Duplicidade detectada | Apenas como aviso no rastro, não como estado | TurnoRastro |
| Arquivo recebido mas inválido | Estado: `rejected_unreadable` ou `received` (hipótese) | T6.3 estados documentais |
| Mídia repetida | Marcada como `duplicate` no estado documental | T6.3 estados documentais |

**O que NUNCA pode ser persistido a partir de mídia inútil:**
- `fact_*` de qualquer tipo
- `current_phase` ou avanço de stage
- Fato de renda, estado civil, regime, restrição, CPF/RG, RNM, agendamento ou elegibilidade
- Confirmação de documento como `accepted_for_dossier` sem T6.3/T6.4
- `reply_text` gerado fora do LLM

---

## §9 Tratamento de sticker

### Sticker estático e sticker animado

**Princípio:**
Sticker é sinal fraco. Carrega contexto emocional/relacional mas não informação operacional. Em
nenhuma circunstância sticker confirma dado, aprova etapa, avança stage ou encerra conversa.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| STK-01 | Sticker é `input_type=sticker`, `utility_classification=inútil` |
| STK-02 | Sticker nunca confirma renda, estado civil, restrição, documento, visita ou aprovação |
| STK-03 | Sticker nunca encerra conversa nem "fecha" etapa |
| STK-04 | Sticker nunca substitui resposta textual a pergunta direta |
| STK-05 | LLM pode acolher o sticker sem alterar o stage (ex.: "Que fofo! Para prosseguirmos...") |
| STK-06 | LLM pode ignorar o sticker e retomar a última pergunta |
| STK-07 | Sticker não gera `fact_*`, não gera `current_phase`, não gera `reply_text` mecânico |
| STK-08 | Funil não quebra com sticker; lead segue vivo após resposta do LLM |

---

## §10 Tratamento de emoji isolado e reação

### Emoji isolado

**Princípio:**
Emoji isolado pode indicar humor ou emoção mas em contexto MCMV não confirma dado sensível. Em
situação de baixíssima criticidade (ex.: confirmação de horário de atendimento já agendado) o LLM
pode reconhecer o sinal, mas persistência ainda passa por T4/T3/T2.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| EMJ-01 | Emoji isolado é `input_type=sticker` (WhatsApp) ou `input_type=unknown_or_invalid` com `input_subtype=emoji_isolated` |
| EMJ-02 | Emoji isolado nunca confirma renda, estado civil, restrição, CPF/RG, RNM, dossiê ou elegibilidade |
| EMJ-03 | Emoji isolado nunca confirma documento, visita, aprovação ou reprovação do correspondente |
| EMJ-04 | Em contexto de baixíssima criticidade, LLM pode reconhecer como confirmação fraca — mas persistência passa por T4/T3/T2 |
| EMJ-05 | Se houver ambiguidade sobre o que o emoji confirma, LLM retoma a pergunta em texto |
| EMJ-06 | Emoji não gera `fact_*` diretamente; qualquer candidato a fato extraído pelo LLM segue para T2_RECONCILIACAO com `source="EMOJI_ISOLATED"` e `state=hypothesis` |

### Reação

**Princípio:**
Reação de WhatsApp (emoji aplicado a uma mensagem anterior) não é resposta — é gesto relacional.

| Regra | Descrição |
|---|---|
| REA-01 | Reação é `input_type=system_event` com `input_subtype=reaction` |
| REA-02 | Reação nunca confirma dado de nenhuma natureza |
| REA-03 | Reação nunca avança stage |
| REA-04 | LLM pode acolher a reação sem alterar o stage |
| REA-05 | Reação não gera `fact_*`, `current_phase` nem `reply_text` mecânico |

---

## §11 Tratamento de imagem sem documento claro

### Imagem não documental ou ambígua

**Princípio:**
Imagem que não claramente um documento identificável não entra como documento válido. Se parecer
documento, T6.3/T6.4 governam o processo. Se não parecer, LLM pode pedir clareza.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| IMG-01 | Imagem sem documento claro recebe `utility_classification=ambígua` ou `precisa_de_contexto` |
| IMG-02 | Imagem não documental pode virar `unknown_or_invalid` no estado documental de T6.3 |
| IMG-03 | Imagem não documental pode virar `needs_review` se o LLM identificar possível documento |
| IMG-04 | Se parecer documento, T6.3/T6.4 governam — este artefato declara apenas o tratamento de entrada |
| IMG-05 | LLM pode pedir que o cliente explique o que a imagem representa |
| IMG-06 | LLM pode pedir foto mais clara ou documento correto |
| IMG-07 | Imagem não documental nunca entra como `accepted_for_dossier` sem validação T6.3/T6.4 |
| IMG-08 | Selfie, paisagem, objeto sem relação com documentação → `inútil`; LLM pode ignorar ou acolher |

---

## §12 Tratamento de print confuso

### Print sem contexto ou print ilegível

**Princípio:**
Print de tela pode conter informação mas sem validação formal não comprova nada. Print não é
documento equivalente ao original e nunca vira fato confirmado sozinho.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| PRT-01 | Print confuso recebe `utility_classification=ambígua` ou `precisa_de_contexto` |
| PRT-02 | Print nunca comprova renda, restrição, estado civil ou elegibilidade sem documento original |
| PRT-03 | Print pode ser `informational_only` no estado documental de T6.3 — jamais `accepted_for_dossier` diretamente |
| PRT-04 | LLM deve pedir explicação do que o print representa |
| PRT-05 | LLM pode pedir o documento original em vez do print |
| PRT-06 | Se o print tiver dados legíveis, LLM pode usar como insumo hipotético — não como fato confirmado |
| PRT-07 | Dado extraído de print recebe `source="DOCUMENT"` com `confidence=low` e `state=hypothesis` em T2_RECONCILIACAO |
| PRT-08 | Print nunca vira `fact_*` confirmado sem validação formal |

---

## §13 Tratamento de áudio inaudível

### Áudio de qualidade `audio_poor` sem transcrição útil

**Princípio:** reaproveitado integralmente de `T6_AUDIO_CEREBRO_CONVERSACIONAL.md`.
Áudio inaudível é `audio_poor` → `hypothesis` na política de confiança T2. PC-06 da
T2_POLITICA_CONFIANCA confirma: áudio ruim **nunca** confirma fato crítico.

**Regras declarativas (complementares às de T6.5):**

| Regra | Descrição |
|---|---|
| AUD-01 | Áudio inaudível recebe `utility_classification=inútil` ou `precisa_de_contexto` |
| AUD-02 | Áudio inaudível nunca gera fato crítico — reaproveitado de T6.5 EA-08 |
| AUD-03 | LLM pode pedir que o cliente envie por texto ou grave novo áudio |
| AUD-04 | LLM não quebra o funil com áudio inaudível |
| AUD-05 | Áudio inaudível é tratado como T6.5 EA-08 (falha/áudio ruim) |
| AUD-06 | Se áudio for `media_repeated`, verificar `dedupe_key` antes de processar novamente |

---

## §14 Tratamento de mídia repetida

### Mesmo arquivo reenviado

**Princípio:**
Duplicidade não gera novo estado. Mídia repetida é identificada pelo `dedupe_key` e tratada como
sinal de reenvio intencional ou acidental — não como novo insumo independente.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| REP-01 | Mídia repetida é identificada pelo `dedupe_key` já visto no contexto do lead |
| REP-02 | Mídia repetida recebe `utility_classification=repetida` |
| REP-03 | Mídia repetida não gera novo turno decisório automaticamente |
| REP-04 | Mídia repetida não duplica documento no dossiê — estado permanece o que já estava em T6.3 |
| REP-05 | LLM pode reconhecer o reenvio ("Já recebi esse documento") ou ignorar silenciosamente |
| REP-06 | Se o estado do documento original era `rejected_unreadable`, LLM pode verificar se o reenvio é de melhor qualidade |
| REP-07 | Mídia repetida com `dedupe_key` diferente mas conteúdo idêntico pode ser identificada como `media_repeated_different_name` — tratamento igual |

---

## §15 Tratamento de arquivo corrompido ou inválido

### Arquivo que não pode ser processado

**Princípio:**
Arquivo inválido ou corrompido não é dado. Não entra no dossiê como aceito. Não bloqueia o lead.
O funil prossegue; o lead é orientado a reenviar quando necessário.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| COR-01 | Arquivo corrompido recebe `utility_classification=inválida` |
| COR-02 | Arquivo corrompido é marcado como `rejected_unreadable` no estado documental de T6.3 |
| COR-03 | Arquivo corrompido nunca entra como `accepted_for_dossier` |
| COR-04 | Arquivo vazio (zero bytes) recebe mesmo tratamento de arquivo corrompido |
| COR-05 | Tipo MIME não suportado recebe `surface_warnings=["mime_unsupported"]` e `utility_classification=inválida` |
| COR-06 | LLM pode pedir reenvio de forma não bloqueante ("Não consegui abrir esse arquivo. Pode tentar enviar novamente?") |
| COR-07 | Arquivo corrompido não altera `current_phase` nem cria `fact_*` |
| COR-08 | Arquivo corrompido não bloqueia o lead — funil prossegue |

---

## §16 Tratamento de mensagem vazia ou sem utilidade operacional

### Mensagem sem conteúdo, com pontuação ou com confirmação fraca

**Princípio:**
Mensagem vazia não é resposta. Pontuação isolada não é dado. "Ok", "blz", "👍" em contexto
ambíguo não confirmam fato crítico. O LLM conduz; o funil não quebra.

**Regras declarativas:**

| Regra | Descrição |
|---|---|
| VAZ-01 | Mensagem vazia recebe `utility_classification=inútil` |
| VAZ-02 | Mensagem com pontuação apenas recebe `utility_classification=inútil` |
| VAZ-03 | Mensagem com "ok", "blz", confirmação fraca recebe `utility_classification=ambígua` |
| VAZ-04 | LLM pode retomar a última pergunta em aberto |
| VAZ-05 | LLM pode fazer follow-up gentil ("Ainda estou por aqui! Posso te ajudar com algo?") |
| VAZ-06 | Silêncio contínuo e follow-up automático de lead ausente são regras operacionais futuras — fora do escopo desta PR |
| VAZ-07 | Mensagem vazia nunca avança stage |
| VAZ-08 | Confirmação fraca ("ok") nunca confirma fato crítico sem texto explícito ou dado real |
| VAZ-09 | Mensagem vazia não gera `fact_*`, não gera `current_phase` |

---

## §17 Limites de persistência

Toda persistência de qualquer informação derivada de mídia inútil obedece aos seguintes limites:

| Limite | Descrição |
|---|---|
| LP-01 | Nenhuma mídia inútil cria `fact_*` de forma autônoma |
| LP-02 | Nenhuma mídia inútil cria `current_phase` |
| LP-03 | Nenhuma mídia inútil confirma fato crítico (renda, estado civil, restrição, CPF/RG, RNM, elegibilidade) |
| LP-04 | Qualquer candidato a fato derivado de mídia ambígua entra em T2 como `state=hypothesis` com `confidence=low` |
| LP-05 | Persistência de qualquer dado passa obrigatoriamente por VC-01..09 (T4_VALIDACAO_PERSISTENCIA) |
| LP-06 | Rastro técnico de entrada inútil pode ser registrado no `TurnoRastro` — não em `fact_*` |
| LP-07 | Estado documental (`received`, `rejected_unreadable`, `duplicate`) pode ser registrado via T6.3 — não bypassa T6.3/T6.4 |
| LP-08 | `reply_text` é exclusivo do LLM entregue via T4.4 — nunca gerado pela surface ou handlers de mídia |

---

## §18 Proibições absolutas

| Código | Proibição |
|---|---|
| PROB-STK-01 | Sticker gerar `reply_text` de forma autônoma |
| PROB-STK-02 | Sticker decidir stage ou avançar funil |
| PROB-STK-03 | Emoji confirmar fato crítico (renda, estado civil, restrição, docs, elegibilidade) |
| PROB-STK-04 | Reação confirmar dado de qualquer natureza |
| PROB-STK-05 | Mídia inútil aprovar ou reprovar cliente |
| PROB-STK-06 | Print confuso virar documento válido ou `accepted_for_dossier` sem T6.3/T6.4 |
| PROB-STK-07 | Arquivo corrompido entrar no dossiê como aceito |
| PROB-STK-08 | Áudio inaudível gerar fato crítico (reaproveitado de T6.5) |
| PROB-STK-09 | Mídia repetida duplicar estado documental ou gerar segundo turno decisório autônomo |
| PROB-STK-10 | Mensagem vazia avançar funil |
| PROB-STK-11 | Entrada ambígua criar `fact_*` de forma autônoma |
| PROB-STK-12 | Entrada ambígua criar `current_phase` |
| PROB-STK-13 | Entrada ambígua criar template de fala ou pergunta fixa sem passar pelo LLM |
| PROB-STK-14 | Entrada ambígua substituir o LLM na decisão de conduta |
| PROB-STK-15 | Entrada ambígua substituir T3/T2 na validação e reconciliação |
| PROB-STK-16 | Criar handler real de sticker, emoji ou mídia inútil nesta PR |
| PROB-STK-17 | Criar runtime, deploy ou integração real com WhatsApp/Meta nesta PR |
| PROB-STK-18 | Avançar para PR-T6.7 sem esta PR estar mergeada |
| PROB-STK-19 | Abrir T7 antes de G6 APROVADO |
| PROB-STK-20 | Qualquer surface, pipeline ou handler de mídia inútil produzir `reply_text` ao cliente |

---

## §19 Riscos e mitigação

| # | Risco | Mitigação declarada |
|---|---|---|
| R-STK-01 | Sticker confundido com confirmação de etapa | STK-02: sticker nunca confirma — LLM acolhe ou retoma; T2 reconcilia com `source=STICKER` → `hypothesis` apenas |
| R-STK-02 | Emoji "👍" interpretado como confirmação de renda | EMJ-02/03: emoji não confirma fato crítico; LLM pede confirmação textual explícita |
| R-STK-03 | Print de tela entrando como documento válido | PRT-02/03: print só pode ser `informational_only`; `accepted_for_dossier` exige T6.3/T6.4 |
| R-STK-04 | Arquivo corrompido bloqueando o lead | COR-08: arquivo corrompido não bloqueia; LLM pede reenvio; funil prossegue |
| R-STK-05 | Mídia repetida duplicando o dossiê | REP-04: `dedupe_key` previne duplicata; estado documental não duplica |
| R-STK-06 | Áudio inaudível gerando fato | AUD-02: reaproveitado de T6.5 — áudio `audio_poor` → `hypothesis` apenas |
| R-STK-07 | Mensagem vazia travando o funil | VAZ-01/07: mensagem vazia é `inútil`; LLM retoma; funil não trava |
| R-STK-08 | Imagem ambígua entrando como documento aceito | IMG-07: imagem não documental nunca é `accepted_for_dossier` sem T6.3/T6.4 |
| R-STK-09 | Surface gerando `reply_text` para sujeira de canal | PROB-STK-20: surface jamais gera `reply_text`; invariante herdada de T6_SURFACE_CANAL |
| R-STK-10 | Lead sem `reply_text` em caso de entrada inútil repetida | EM-05: LLM pode acolher, retomar ou ignorar — sempre com resposta; funil não silencia lead |

---

## §20 Critérios de aceite da T6.6

| # | Critério | Verificação |
|---|---|---|
| CA-T6.6-01 | `T6_STICKER_MIDIA_INUTIL.md` existe com conteúdo completo | Este artefato |
| CA-T6.6-02 | 21+ tipos de sujeira/mídia inútil declarados | §6 — 21+ subtipos em 9 categorias |
| CA-T6.6-03 | Fluxo EM-01..EM-06 declarado | §8 |
| CA-T6.6-04 | Tratamento de sticker declarado (STK-01..08) | §9 |
| CA-T6.6-05 | Tratamento de emoji/reação isolada declarado (EMJ-01..06, REA-01..05) | §10 |
| CA-T6.6-06 | Tratamento de imagem sem documento claro declarado (IMG-01..08) | §11 |
| CA-T6.6-07 | Tratamento de print confuso declarado (PRT-01..08) | §12 |
| CA-T6.6-08 | Tratamento de áudio inaudível declarado com reaproveitamento de T6.5 (AUD-01..06) | §13 |
| CA-T6.6-09 | Tratamento de mídia repetida declarado (REP-01..07) | §14 |
| CA-T6.6-10 | Tratamento de arquivo inválido/corrompido declarado (COR-01..08) | §15 |
| CA-T6.6-11 | Tratamento de mensagem vazia/fraca declarado (VAZ-01..09) | §16 |
| CA-T6.6-12 | Limites de persistência LP-01..08 declarados | §17 |
| CA-T6.6-13 | 20 proibições absolutas PROB-STK-01..20 declaradas | §18 |
| CA-T6.6-14 | Mídia inútil não cria `reply_text` em nenhum output | §3, §8, §18 |
| CA-T6.6-15 | Mídia inútil não cria `fact_*` | §17 LP-01, §18 PROB-STK-11 |
| CA-T6.6-16 | Mídia inútil não cria `current_phase` | §17 LP-02, §18 PROB-STK-12 |
| CA-T6.6-17 | Mídia inútil não decide stage | §3, §8, §18 PROB-STK-02 |
| CA-T6.6-18 | Funil não quebra com nenhum tipo de sujeira | §3, §7 passo 12, §15 COR-08 |
| CA-T6.6-19 | Zero runtime implementado | §2 — PR declarativa; zero src/ |
| CA-T6.6-20 | Próxima PR autorizada é PR-T6.7 | §22 |

---

## §21 Provas obrigatórias

| Prova | Descrição | Verificável em |
|---|---|---|
| P-T6.6-01 | `T6_STICKER_MIDIA_INUTIL.md` criado com §1–§23 + Bloco E | `git diff --stat` |
| P-T6.6-02 | Zero `reply_text` declarado como output de surface ou handler de mídia | Inspeção §3, §8, §18 |
| P-T6.6-03 | Zero `fact_*` criado ou alterado | Inspeção §17 LP-01 |
| P-T6.6-04 | Zero `current_phase` criado ou alterado | Inspeção §17 LP-02 |
| P-T6.6-05 | Zero `src/` tocado | `git diff --name-only` |
| P-T6.6-06 | Zero runtime ou handler real criado | `git diff --name-only` |
| P-T6.6-07 | Conformidade A00-ADENDO-01: canal é entrada, não cérebro de fala | §3 |
| P-T6.6-08 | Conformidade A00-ADENDO-02: multimodal sob mesma governança T1–T5 | §5 |
| P-T6.6-09 | PR-T6.5 (#130) confirmada merged antes desta PR | `gh pr list --state merged` |
| P-T6.6-10 | Live files atualizados: STATUS, LATEST, _INDEX, CONTRATO_T6 | `git diff --stat` |

---

## §22 Próxima PR autorizada

**PR-T6.7 — Adapter Meta/WhatsApp governado**

Artefato: `schema/implantation/T6_ADAPTER_META_WHATSAPP.md`

Escopo: webhook inbound/outbound; verificação de assinatura; idempotência; deduplicação por
`message_id`; retries controlados; erros; rate limit; separação canal/cérebro; declaração de que
não é go-live amplo; zero produção real; zero rollout.

Dependência: PR-T6.6 mergeada (esta PR).

---

## §23 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T6_STICKER_MIDIA_INUTIL.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T6.6 encerrada; T6 em execução; PR-T6.7 desbloqueada
Próxima PR autorizada:                 PR-T6.7 — Adapter Meta/WhatsApp governado
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | Regra-mãe declarada: sujeira de canal não é decisão | §3 |
| 2 | Relação com T6_SURFACE_CANAL declarada (campos herdados, invariantes) | §4 |
| 3 | Relação com T4/T3/T2/T5 declarada (fluxo completo) | §5 |
| 4 | 21+ tipos de sujeira em 9 categorias declarados | §6 |
| 5 | Fluxo declarativo 12 passos declarado | §7 |
| 6 | EM-01 — Recepção via surface (shape do attachment) | §8 EM-01 |
| 7 | EM-02 — Classificação de utilidade (6 categorias) | §8 EM-02 |
| 8 | EM-03 — Definição de risco de confusão (7 riscos) | §8 EM-03 |
| 9 | EM-04 — Entrega ao T4 (shape attachment para mídia inútil) | §8 EM-04 |
| 10 | EM-05 — Conduta conversacional pelo LLM (6 condutas) | §8 EM-05 |
| 11 | EM-06 — Persistência limitada | §8 EM-06 |
| 12 | Tratamento de sticker — STK-01..08 | §9 |
| 13 | Tratamento de emoji isolado e reação — EMJ-01..06, REA-01..05 | §10 |
| 14 | Tratamento de imagem sem documento claro — IMG-01..08 | §11 |
| 15 | Tratamento de print confuso — PRT-01..08 | §12 |
| 16 | Tratamento de áudio inaudível — AUD-01..06 (reaproveitado de T6.5) | §13 |
| 17 | Tratamento de mídia repetida — REP-01..07 | §14 |
| 18 | Tratamento de arquivo corrompido/inválido — COR-01..08 | §15 |
| 19 | Tratamento de mensagem vazia/fraca — VAZ-01..09 | §16 |
| 20 | Limites de persistência LP-01..08 | §17 |
| 21 | 20 proibições absolutas PROB-STK-01..20 | §18 |
| 22 | 10 riscos com mitigação R-STK-01..10 | §19 |
| 23 | 20 critérios de aceite CA-T6.6-01..20 | §20 |
| 24 | 10 provas obrigatórias P-T6.6-01..10 | §21 |
| 25 | Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime | §19, §21 |

### Estado herdado

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual — PR-T6.6 dentro do contrato T6
Última PR relevante: PR-T6.5 (#130) — merged 2026-04-28T20:28:20Z — T6_AUDIO_CEREBRO_CONVERSACIONAL.md
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Objetivo imutável do contrato: Canal sob mesma governança T1–T5; multimodal sem criar cérebro paralelo
Recorte a executar nesta PR: PR-T6.6 — Sticker, mídia inútil e mensagens não textuais
Item do A01: T6 — Prioridade 7 — Docs, multimodal e superfícies de canal
Estado atual da frente: T6 em execução — PR-T6.6
O que a última PR fechou: Contrato declarativo de áudio; EA-01..EA-08; STT como lacuna T6-LA-01; 7 níveis de confiança
O que a última PR NÃO fechou: sticker/mídia inútil; adapter Meta; dossiê; suite de testes; G6
Por que esta tarefa existe: A01 e contrato T6 §2 item 6 exigem PR-T6.6 após PR-T6.5
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar T6_STICKER_MIDIA_INUTIL.md — contrato declarativo para sujeira de canal
Escopo: schema/implantation/T6_STICKER_MIDIA_INUTIL.md + live files
Fora de escopo: src/, runtime, canal real, handler real, T1–T5, T6.7–T6.R
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
O que foi feito nesta PR: Criado T6_STICKER_MIDIA_INUTIL.md — contrato declarativo para sujeira de canal
O que foi fechado nesta PR: Sub-contrato declarativo para sticker, mídia inútil, mensagens não textuais
O que continua pendente: PR-T6.7 (adapter Meta/WhatsApp); PR-T6.8 (dossiê); PR-T6.9 (testes); PR-T6.R (G6)
O que ainda não foi fechado do contrato ativo: T6.7–T6.R; gate G6; canal real; dossiê; adapter Meta
Recorte executado do contrato: T6 — PR-T6.6 — sticker, mídia inútil, mensagens não textuais
Pendência contratual remanescente: PR-T6.7..T6.R
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — PR-T6.7 agora autorizada
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX, CONTRATO_T6
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
