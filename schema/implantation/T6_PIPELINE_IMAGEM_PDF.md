# T6_PIPELINE_IMAGEM_PDF — Pipeline de Imagem / PDF / Documento — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.4 |
| Branch | feat/t6-pr-t6-4-pipeline-imagem-pdf |
| Artefato | Pipeline declarativo de imagem/PDF/documento — ENOVA 2 |
| Status | entregue |
| Pré-requisito | PR-T6.3 merged (#128 — 2026-04-28T19:39:58Z); T6_CONTRATO_ANEXOS_DOCUMENTOS.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.5 — Áudio no mesmo cérebro conversacional |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Este artefato declara formalmente o **pipeline declarativo de tratamento de imagem, PDF e
documento** recebido pela ENOVA 2. Define, sem implementar código ou OCR real, como mídia
documental transita da surface única (`T6_SURFACE_CANAL.md`) pelo contrato de anexos
(`T6_CONTRATO_ANEXOS_DOCUMENTOS.md`), chega ao contexto de turno (`TurnoEntrada` — T4.1),
alimenta o LLM com insumo contextual e prepara a referência documental para o dossiê
operacional futuro (PR-T6.8).

**Princípio-mãe desta PR:**

> Imagem/PDF/documento é entrada documental.
> Não é verdade absoluta. Não escreve `reply_text`.
> Não decide stage. Não aprova/reprova cliente.
> Não finaliza dossiê sozinho. Não cria `fact_*` novo.
> Não cria `current_phase` novo. Não implementa OCR obrigatório.
> Tudo passa pela governança: T6_SURFACE_CANAL → T6_CONTRATO_ANEXOS_DOCUMENTOS → T4 → T3 → T2 → T5.

**Esta PR é declarativa — não implementa runtime, não cria código, não abre canal real,
não implementa OCR, não cria classificador real, não cria migration Supabase.**

---

## §2 Finalidade do pipeline de imagem/PDF/documento

O pipeline declarativo de imagem/PDF/documento existe para responder, de forma canônica:

- Como a surface entrega mídia documental ao pipeline T4?
- Como o tipo documental é classificado hipoteticamente sem OCR?
- Como o documento é associado ao lead, ao caso e à pessoa correta (P1/P2/P3)?
- Quais estados documentais se aplicam ao longo do ciclo de vida?
- Como o LLM usa o contexto do documento para conduzir a coleta?
- Como imagem ruim, PDF protegido ou arquivo corrompido são tratados?
- Como documentos duplicados são identificados?
- O que vai para o dossiê futuro (T6.8) e o que fica pendente?

**O que este pipeline NÃO é:**
- Não é OCR automático
- Não é classificador de visão computacional
- Não é validador de autenticidade de documentos
- Não é decisor de stage ou de aprovação de crédito
- Não é montador do dossiê operacional (T6.8 é o responsável)

---

## §3 Princípio central — mídia documental é evidência, não decisão

### 3.1 A mídia não decide — o LLM decide

Nenhuma imagem, PDF ou documento recebido pela ENOVA 2:
- Aprova ou reprova automaticamente o cliente
- Avança o stage do funil sozinho
- Finaliza o dossiê
- Confirma renda como formalizada sem análise do correspondente
- Produz `reply_text` diretamente
- Cria ou altera `fact_*` canônico sem validação por T4→T3→T2
- Cria ou altera `current_phase` canônico

O LLM é o único que conduz a conversa com base no contexto documental recebido.
O pipeline apenas prepara o insumo — o LLM decide o que fazer com ele.

### 3.2 Hipótese, não certeza

Todo processamento sem OCR opera em **modo hipotético**:
- O sistema pode inferir o tipo documental com base em metadados e contexto conversacional
- Essa inferência é uma **hipótese** — não um fato confirmado
- A hipótese pode estar errada
- O LLM pode confirmar, corrigir ou pedir mais informação ao lead
- Só após confirmação contextual o documento assume estado `accepted_for_dossier`

### 3.3 OCR como lacuna futura — não como requisito

O sistema opera sem OCR obrigatório. Quando OCR futuro existir:
- Será tratado como origem de confiança baixa/média — não como verdade
- Nunca criará `fact_*` confirmado sem validação pelo pipeline T4
- Nunca produzirá `reply_text`
- Nunca aprovará documento sozinho
- Será mais um sinal de entrada — não o árbitro

---

## §4 Relação com T6_SURFACE_CANAL

`T6_SURFACE_CANAL.md` (PR-T6.2) define a camada de normalização que recebe toda entrada
do canal e produz um `SurfaceEventNormalizado`.

**Para mídia documental, a surface:**

| Campo surface | O que carrega | Relevância para o pipeline |
|---|---|---|
| `input_type` | `image`, `document`, ou `unknown_or_invalid` | Ponto de entrada do pipeline — determina ramificação |
| `input_subtype` | pdf / docx / spreadsheet / jpeg / png / webp / other_* | Refinamento do tipo de mídia |
| `media_ref` | Referência ao arquivo (storage handle) | Ponteiro para recuperação futura |
| `media_mime_type` | MIME real do arquivo (ex: `application/pdf`, `image/jpeg`) | Insumo para classificação hipotética |
| `media_filename` | Nome original do arquivo enviado | Insumo para classificação hipotética |
| `media_size_bytes` | Tamanho em bytes | Detecção de arquivo muito pesado |
| `caption` | Texto enviado junto com a mídia | Insumo prioritário de classificação hipotética |
| `confidence_hint` | `high`, `medium`, `low` | Grau de confiança da surface no tipo classificado |
| `surface_warnings` | Lista de avisos | Sinais de problema: ilegível, muito grande, MIME divergente |
| `raw_payload_ref` | Ponteiro para payload bruto | Rastreabilidade — preservado sem leitura de conteúdo |
| `dedupe_key` | Hash para deduplicação | Detecção de documento duplicado |

**O que a surface NÃO entrega ao pipeline:**
- Conteúdo real do arquivo (bytes não são lidos pela surface)
- Classificação documental por finalidade (isso é T4/LLM)
- Associação a P1/P2/P3 (isso é contexto de turno — T4/LLM)
- Extração de dados (nome, CPF, renda, etc.)
- Estado documental final

---

## §5 Relação com T6_CONTRATO_ANEXOS_DOCUMENTOS

`T6_CONTRATO_ANEXOS_DOCUMENTOS.md` (PR-T6.3) declara a governança documental:
- Quais tipos são aceitos (§6), rejeitados (§7), informativos (§7.1)
- Os 11 estados documentais e suas transições (§8)
- Regras de associação P1/P2/P3 (§9)
- Documentos por perfil/regime (§10)
- Documentos por finalidade (§11)
- Regras de validade declarativa (§12)

**Este pipeline (T6.4) é o motor operacional desse contrato:** aplica as regras de T6.3
no fluxo real de processamento de mídia. T6.3 define **o que** — T6.4 define **como**.

Hierarquia de artefatos documental:

```
T6_SURFACE_CANAL.md        ← normaliza entrada bruta → SurfaceEventNormalizado
        ↓
T6_CONTRATO_ANEXOS_DOCUMENTOS.md ← governa: tipos, estados, perfis, proibições
        ↓
T6_PIPELINE_IMAGEM_PDF.md (este) ← pipeline: como a mídia flui, etapas, tratamento
        ↓
T4_ENTRADA_TURNO.md        ← TurnoEntrada: attachment[] com contexto documental
        ↓
T4_PIPELINE_LLM.md         ← LLM conduz com base no contexto
        ↓
T6_DOSSIÊ_OPERACIONAL.md (T6.8) ← monta dossiê, link correspondente
```

---

## §6 Relação com T4 / T3 / T2 / T5

### 6.1 T4 — Orquestrador de turno

O pipeline documental entrega seu resultado ao orquestrador T4 como parte do campo
`attachments[]` da `TurnoEntrada`:

```
TurnoEntrada.attachments[] = [
  {
    attachment_id:     string    — ID único do anexo neste turno
    surface_event_id:  string    — vínculo com SurfaceEventNormalizado
    media_ref:         string    — ponteiro para o arquivo
    media_mime_type:   string
    media_filename:    string
    input_type:        string    — "image" | "document" | "unknown_or_invalid"
    input_subtype:     string
    doc_state_hint:    string    — estado hipotético: "classified_hypothesis" | "needs_owner" | etc.
    doc_type_hint:     string    — tipo hipotético: "holerite", "rg", "certidao_casamento", etc.
    person_hint:       string    — P1 | P2 | P3 | unknown
    confidence_hint:   string    — "high" | "medium" | "low"
    caption:           string    — legenda enviada pelo lead
    surface_warnings:  string[]  — avisos da surface
  }
]
```

**Invariante T4:** `TurnoEntrada` nunca carrega `reply_text`. O orquestrador monta contexto
documental e entrega ao LLM — o LLM decide como conduzir a conversa.

### 6.2 T3 — Policy engine

O policy engine T3 opera sobre o estado do lead (T2) — não sobre o documento diretamente.
O documento pode informar o contexto que influencia as policy decisions, mas:
- T3 não classifica documento
- T3 não valida autenticidade
- T3 não produz `reply_text`
- T3 pode emitir soft_veto se o documento declarado não estiver compatível com o perfil

### 6.3 T2 — Estado estruturado

O T2 persiste os `fact_*` canônicos. O pipeline documental alimenta o contexto que o LLM
usa para extrair fatos — mas:
- Nenhum `fact_*` é criado diretamente pelo pipeline documental
- Toda persistência de fato passa por T4.3 (validação) antes de chegar ao T2
- Os `fact_doc_*_status` (Group IX) são os marcadores de coleta documental canônicos

### 6.4 T5 — Funil / F5

T5 declarou as regras comerciais de F5 (RC-F5-01..38). T6.4 as consome como contexto
para o pipeline, mas não as altera. Qualquer mudança de regra comercial exige revisão
formal contratual em T5.

---

## §7 Tipos de entrada cobertos

O pipeline cobre os seguintes tipos de entrada documental, em ordem de frequência esperada:

### 7.1 Imagens de documentos (input_type = image)

| Tipo | Descrição | Sub-type surface |
|---|---|---|
| Foto de RG / CNH / CPF | Lead fotografou documento de identidade | `jpeg`, `png`, `webp` |
| Foto de comprovante de residência | Conta de luz, água, gás, internet fotografada | `jpeg`, `png` |
| Foto de holerite / contracheque | Comprovante de renda CLT/servidor fotografado | `jpeg`, `png` |
| Foto de CTPS | Carteira de trabalho aberta na página relevante | `jpeg`, `png` |
| Foto de extrato bancário / previdenciário | Extrato impresso e fotografado | `jpeg`, `png` |
| Foto de certidão civil | Certidão de casamento, óbito, registro civil | `jpeg`, `png` |
| Foto de comprovante de pagamento | Acordo SPC/Serasa, regularização | `jpeg`, `png` |
| Print de aplicativo | Screenshot de aplicativo bancário, INSS digital | `png`, `jpeg` |
| Imagem ilegível | Foto escura, tremida, fora de foco, corrompida | qualquer image/* |
| Imagem cortada | Documento parcial — borda cortada | qualquer image/* |
| Imagem duplicada | Mesmo arquivo ou conteúdo enviado novamente | qualquer image/* |

### 7.2 Arquivos PDF (input_type = document, input_subtype = pdf)

| Tipo | Descrição |
|---|---|
| PDF de documento de identidade | Digitalização profissional de RG/CNH |
| PDF de comprovante de residência | Conta digital em PDF |
| PDF de holerite / contracheque | Folha de pagamento em PDF emitida digitalmente |
| PDF de declaração IRPF | Declaração do imposto de renda em PDF |
| PDF de recibo de entrega IRPF | Recibo de entrega emitido pela Receita em PDF |
| PDF de extrato bancário | Extrato bancário digital |
| PDF de extrato FGTS | Extrato FGTS emitido pelo app |
| PDF de extrato de aposentadoria / benefício | Extrato INSS / previdência complementar |
| PDF de certidão civil | Certidão digitalizada em PDF |
| PDF de comprovante de regularização | Comprovante de pagamento / acordo |
| PDF protegido com senha | Não pode ser aberto sem senha → `rejected_unreadable` |
| PDF corrompido | Arquivo inválido → `rejected_unreadable` |

### 7.3 Arquivos de documento (input_type = document, outros sub-types)

| Tipo | Sub-type | Descrição |
|---|---|---|
| DOCX / Word | `docx` | Declaração em Word — aceitar; não é o formato preferido |
| Planilha | `spreadsheet` | Eventual; contexto comercial — `informational_only` |
| Outros documentos | `other_document` | Formato não convencional — `needs_review` |

### 7.4 Entradas com características especiais

| Caso | Descrição | Tratamento esperado |
|---|---|---|
| Arquivo com nome sugestivo | Ex: `holerite_marco.pdf`, `rg_joao.jpeg` | Usar no `doc_type_hint` com baixa confiança |
| Arquivo sem nome útil | Ex: `IMG_20240312_083452.jpg`, `document.pdf` | Nome não contribui para classificação |
| Arquivo com caption/legenda | Lead escreveu "meu holerite" junto ao envio | Caption é insumo prioritário de classificação |
| Arquivo sem legenda | Enviado sem texto adicional | Classificar por MIME + filename + contexto conversacional |
| Documento enviado fora de ordem | Ex: enviou certidão antes do lead declarar estado civil | `classified_hypothesis` + `needs_review` |
| Documento enviado sem dizer de quem é | Composição multi-pessoa — não claro se é P1, P2 ou P3 | `needs_owner` obrigatório |
| Documento enviado com MIME divergente | MIME declarado pela surface ≠ extensão do arquivo | `surface_warnings` ativo; `needs_review` |
| Arquivo muito pesado | Acima do limite operacional | `surface_warnings` ativo; orientar reenvio comprimido |
| Arquivo com extensão desconhecida | Não mapeado como image/* nem application/pdf | `unknown_or_invalid` → `rejected_wrong_type` |

---

## §8 Fluxo declarativo do pipeline

```
FLUXO DECLARATIVO — PIPELINE IMAGEM/PDF/DOCUMENTO

[1] Canal recebe imagem/PDF/documento
        |
        ↓
[2] T6_SURFACE_CANAL normaliza como SurfaceEventNormalizado
    - input_type: image | document | unknown_or_invalid
    - media_ref, media_mime_type, media_filename, media_size_bytes
    - caption (se houver)
    - confidence_hint
    - surface_warnings (se arquivo problemático)
    - dedupe_key
        |
        ↓
[3] EP-01: Recepção — pipeline recebe SurfaceEventNormalizado
    - Preserva raw_payload_ref (rastreabilidade)
    - Preserva media_ref (ponteiro para arquivo)
    - NÃO lê conteúdo real do arquivo
        |
        ↓
[4] EP-02: Classificação hipotética de tipo documental
    - Usa: input_type, MIME, filename, caption, contexto conversacional,
      etapa atual do funil, perfil/regime declarado, docs pendentes esperados
    - Gera: doc_type_hint (hipótese) + confidence_hint atualizado
    - HIPÓTESE — nunca verdade absoluta
    - Se confiança baixa → confidence_hint = "low" → estado = needs_review
        |
        ↓
[5] EP-03: Associação inicial P1/P2/P3
    - Tenta associar pela conversa/contexto: quem enviou? para quem é?
    - SE claro no contexto → person_hint = P1 | P2 | P3
    - SE não claro → person_hint = unknown → estado = needs_owner
    - Multi-renda: associar à fonte/regime específico (RC-F5-38)
        |
        ↓
[6] EP-04: Validação declarativa de adequação
    - Tipo hipotético ↔ perfil/regime do lead
    - Tipo hipotético ↔ docs pendentes esperados
    - Verifica enquadramento: obrigatório | complementar | informativo | rejeitável
    - NÃO faz aprovação de crédito
    - NÃO decide stage
    - NÃO altera regra comercial
        |
        ↓
[7] EP-05: Atribuição de estado documental
    - Aplica estado compatível com T6_CONTRATO_ANEXOS_DOCUMENTOS.md §8
    - Estado inicial mais provável:
      · Arquivo OK + tipo inferido → classified_hypothesis
      · Arquivo OK + sem dono claro → needs_owner
      · Arquivo OK + tipo incerto → needs_review
      · Arquivo ilegível/corrompido → rejected_unreadable
      · Arquivo tipo errado → rejected_wrong_type
      · Arquivo duplicado → duplicate
      · Arquivo renda não financiável → informational_only
        |
        ↓
[8] EP-06: Montagem de contexto para T4/LLM
    - Monta attachment[] para TurnoEntrada
    - LLM recebe: tipo hipotético, pessoa hipotética, estado, avisos
    - LLM conduz a confirmação com o lead
    - LLM pode perguntar: "Você enviou seu holerite?" "Esse documento é seu ou do cônjuge?"
    - LLM não é substituído por nenhuma automação
    - NÃO gera reply_text automaticamente
        |
        ↓
[9] EP-07: Preparação de referência para dossiê futuro (T6.8)
    - Registra referência documental (media_ref + estado + tipo + pessoa)
    - Dossiê futuro T6.8 consome essa referência
    - T6.4 NÃO monta link do correspondente
    - T6.4 NÃO envia ao correspondente
    - T6.4 NÃO declara dossiê completo

Resultado final do pipeline:
  attachment[] em TurnoEntrada → LLM conduz → T4.3 valida → T2 persiste fact_doc_*_status
```

---

## §9 Etapas do pipeline — detalhe

### EP-01 — Recepção via surface

**Entrada:** `SurfaceEventNormalizado` entregue pela T6_SURFACE_CANAL

**O que faz:**
- Registra recebimento: `doc_state = received`
- Preserva `raw_payload_ref` — âncora de rastreabilidade imutável
- Preserva `media_ref` — ponteiro para arquivo no storage
- Preserva `caption` — texto enviado junto com a mídia (insumo de alta confiança)
- Preserva `surface_warnings` — avisos já identificados pela surface
- Preserva `dedupe_key` — para detecção de duplicata na EP-04

**O que NÃO faz:**
- NÃO abre o arquivo
- NÃO lê conteúdo real
- NÃO extrai dados
- NÃO classifica por finalidade
- NÃO associa a pessoa

**Condição de rejeição imediata:**
- `input_type = unknown_or_invalid` E `surface_warnings` indica arquivo inválido → `rejected_unreadable` direto
- `media_size_bytes` acima do limite operacional → `surface_warnings` adicional; orientar reenvio

---

### EP-02 — Classificação hipotética

**Entradas disponíveis (em ordem de confiança):**

| Insumo | Confiança | Descrição |
|---|---|---|
| `caption` enviada pelo lead | Alta | "esse é meu holerite", "comprovante de residência" |
| Texto da mensagem anterior no contexto conversacional | Alta | LLM identifica que o lead estava falando sobre um documento específico |
| `media_filename` sugestivo | Média | `holerite_fev_2026.pdf`, `rg_carlos.jpeg` |
| `media_mime_type` | Média | `application/pdf`, `image/jpeg` — informa o formato, não o conteúdo |
| `input_subtype` da surface | Média | `pdf`, `jpeg`, `png` — refinamento do tipo de mídia |
| Etapa atual do funil (`current_phase`) | Média | Em `docs_collection`: docs esperados por perfil |
| Perfil/regime declarado do lead | Média | CLT: esperar holerite; autônomo: esperar IRPF ou extrato |
| Docs pendentes declarados no contexto | Média | Lista de docs ainda não recebidos para o perfil |
| `media_filename` genérico | Baixa | `IMG_2024.jpg`, `document.pdf` |
| Ausência de informações | Muito baixa | Nenhum insumo contextual disponível |

**Resultado da classificação:**
- `doc_type_hint`: tipo documental hipotético (ex: `"holerite"`, `"rg"`, `"certidao_casamento"`)
- `confidence_hint` atualizado: `high` | `medium` | `low`
- Se `confidence_hint = low` → estado = `classified_hypothesis` + `needs_review`
- Se `confidence_hint = high` e tipo claro → estado = `classified_hypothesis` (aguarda EP-03/04)

**Regra canônica:** a hipótese NUNCA substitui a confirmação do lead via LLM.

---

### EP-03 — Associação inicial P1/P2/P3

**Objetivo:** identificar a quem o documento pertence.

**Fontes de associação (em ordem de confiança):**

| Fonte | Confiança | Exemplo |
|---|---|---|
| Caption explícita | Alta | "esse é o holerite da minha esposa" |
| Contexto conversacional | Alta | LLM está perguntando docs de P2 e lead envia |
| Perfil do processo (solo / casal / composição) | Média | Processo solo: tudo é P1 |
| `fact_process_mode` do lead_state | Média | `solo` = P1; `casal` = P1 ou P2 |
| Nome no filename | Baixa | `rg_ana.jpg` — pode ser P2 se Ana é cônjuge |
| Sem informação disponível | — | `person_hint = unknown` → estado = `needs_owner` |

**Regra de multi-renda (RC-F5-38):**
Quando o lead tem múltiplas fontes de renda:
- Cada documento de renda deve ser associado a `(pessoa, regime, fonte)`
- Ex: `(P1, CLT, holerite)` E `(P1, informal, extrato_bancario)`
- `person_hint` sozinho não é suficiente — `regime_hint` e `source_hint` também necessários

**Regra de documento civil (estado civil):**
- Documento civil deve ter `(pessoa, estado_civil_ref)`
- Ex: certidão de casamento → `(P1 + P2, casados)`
- Certidão de óbito → `(P1, viúvo — cônjuge falecido)`

**Condição de bloqueio suave:**
- `person_hint = unknown` → estado = `needs_owner`
- Documento em `needs_owner` não entra como válido no dossiê
- LLM orienta confirmação da pessoa antes de seguir

---

### EP-04 — Validação declarativa

**Objetivo:** verificar se tipo hipotético é adequado ao perfil e ao momento do funil.

**Verificações declarativas:**

| Verificação | Fonte | Resultado possível |
|---|---|---|
| Tipo hipotético ↔ perfil/regime | RC-F5-04..14, §10 T6.3 | compatível | incompatível | informativo |
| Tipo hipotético ↔ docs pendentes | contexto conversacional | necessário | complementar | não esperado |
| Tipo hipotético ↔ renda financiável | RC-F5-15, §7.1 T6.3 | financiável | não financiável → `informational_only` |
| Prazo do documento | §12.1 T6.3 | dentro do prazo | `expired_or_outdated` |
| Arquivo duplicado | `dedupe_key` | novo | `duplicate` |
| MIME vs extensão | `surface_warnings` | coerente | divergente → `needs_review` |

**O que a validação NÃO faz:**
- NÃO confirma autenticidade
- NÃO extrai dados do documento
- NÃO faz aprovação de crédito
- NÃO decide stage
- NÃO produz `reply_text`

---

### EP-05 — Estado documental

Aplicação do estado declarativo compatível com `T6_CONTRATO_ANEXOS_DOCUMENTOS.md §8`.

**Matriz de atribuição de estado:**

| Condição | Estado inicial | Transição possível |
|---|---|---|
| Arquivo recebido, tipo inferível, pessoa identificável | `classified_hypothesis` | → `needs_review` (baixa confiança) ou → `accepted_for_dossier` (confirmado) |
| Arquivo recebido, tipo inferível, pessoa desconhecida | `needs_owner` | → `classified_hypothesis` (após confirmação) |
| Arquivo recebido, tipo ambíguo, pessoa desconhecida | `needs_owner` + `needs_review` | → confirmação de ambos via LLM |
| Arquivo ilegível / corrompido / PDF protegido | `rejected_unreadable` | → `pending_replacement` |
| Arquivo de tipo errado para o perfil | `rejected_wrong_type` | → `pending_replacement` |
| Arquivo duplicado (mesmo `dedupe_key`) | `duplicate` | → descartar ou manter mais recente |
| Arquivo de renda não financiável | `informational_only` | → mantido como contexto; não entra como renda |
| Arquivo vencido/fora do prazo | `expired_or_outdated` | → `pending_replacement` |
| Arquivo confirmado por LLM + lead | `accepted_for_dossier` | estado final para dossiê |

**Regra de estado:** estado não é permanente até `accepted_for_dossier` ou `rejected_*`.
Enquanto está em `classified_hypothesis`, `needs_owner` ou `needs_review`, o documento
aguarda confirmação via contexto de turno / LLM.

---

### EP-06 — Contexto para T4/LLM

**Objetivo:** montar o `attachment[]` que vai para `TurnoEntrada` e alimentar o LLM.

**O que o LLM recebe como contexto documental:**
- Tipo hipotético do documento (`doc_type_hint`)
- Estado atual (`doc_state_hint`)
- Pessoa hipotética (`person_hint`)
- Grau de confiança (`confidence_hint`)
- Avisos da surface (`surface_warnings`)
- Legenda enviada pelo lead (`caption`)

**O que o LLM pode fazer com esse contexto:**
- Confirmar com o lead: "Você enviou seu holerite — está correto?"
- Perguntar a quem pertence: "Esse documento é seu ou da sua esposa?"
- Orientar reenvio: "Essa imagem ficou um pouco escura — pode enviar de novo com mais luz?"
- Aceitar e seguir: "Ótimo, recebi seu holerite. Agora preciso do seu comprovante de residência."
- Sinalizar pendência: "Esse documento está fora do prazo. Você tem um mais recente?"
- Contextualizar multi-renda: "Esse extrato é da sua renda como autônomo ou da sua conta do CLT?"

**Invariante EP-06:** O LLM conduz — o pipeline apenas prepara o insumo.
O `attachment[]` nunca carrega `reply_text`.

---

### EP-07 — Saída para dossiê futuro (T6.8)

**Objetivo:** registrar referência documental que T6.8 (dossiê operacional) consumirá.

**O que EP-07 prepara:**
- Referência consolidada: `(media_ref, doc_type, person, state, regime_hint, source_hint)`
- Estado documental no momento de saída do pipeline
- Avisos e pendências identificadas

**O que EP-07 NÃO faz:**
- NÃO monta o link do correspondente (T6.8)
- NÃO envia o dossiê ao correspondente (T6.8)
- NÃO declara o dossiê como completo
- NÃO define quais docs ainda faltam (isso é T4/LLM com base em RC-F5-20)

**Condição de saída do pipeline:**
- Documento vai para referência em estado `accepted_for_dossier`, `informational_only`,
  `rejected_*`, `duplicate`, ou `pending_replacement`
- Documento em `needs_owner`, `classified_hypothesis`, ou `needs_review` permanece em loop
  no contexto de turno até resolução pelo LLM/lead

---

## §10 Estados documentais — reaproveitamento de T6.3

Reutilizando integralmente os estados declarados em `T6_CONTRATO_ANEXOS_DOCUMENTOS.md §8`.
**Nenhum estado novo foi criado.**

| Estado | Sigla | Quando este pipeline aplica |
|---|---|---|
| `received` | Recebido | EP-01: arquivo chegou via surface |
| `classified_hypothesis` | Hipótese classificada | EP-02: tipo inferido com média/alta confiança |
| `needs_owner` | Sem dono claro | EP-03: pessoa não identificável no contexto |
| `needs_review` | Aguardando revisão | EP-02/04: confiança baixa ou tipo ambíguo |
| `accepted_for_dossier` | Aceito para dossiê | EP-05: confirmado por LLM/lead; associação clara |
| `rejected_unreadable` | Rejeitado — ilegível | EP-01/05: arquivo ilegível, corrompido, PDF com senha |
| `rejected_wrong_type` | Rejeitado — tipo errado | EP-04/05: tipo não compatível com perfil/solicitação |
| `duplicate` | Duplicado | EP-04: mesmo `dedupe_key` de arquivo anterior |
| `expired_or_outdated` | Vencido | EP-04: prazo excedido (ex: holerite >3 meses) |
| `informational_only` | Apenas informativo | EP-04: renda não financiável ou doc contextual |
| `pending_replacement` | Aguardando substituto | EP-05: após rejeição; orientação de reenvio |

---

## §11 Associação P1/P2/P3 — regras do pipeline

### 11.1 Regra geral

| Pessoa | Quando associar | Condição |
|---|---|---|
| P1 (titular) | Documento é do lead/titular | Contexto: "esse é meu documento" ou processo solo |
| P2 (cônjuge/parceiro) | Documento é do cônjuge/parceiro | `fact_process_mode = casal`; "minha esposa", "meu marido" |
| P3 (familiar/composição) | Documento é de familiar compondo renda | `fact_p3_required = true` |
| `unknown` | Não foi possível identificar | → `needs_owner`; LLM confirma |

### 11.2 Documento de renda — associação ampliada

Documento de renda deve ter associação completa `(pessoa, regime, fonte)`:

| Campo | Exemplo |
|---|---|
| `person_hint` | P1 |
| `regime_hint` | CLT | autônomo | servidor | aposentado | MEI | informal |
| `source_hint` | renda_principal | renda_complementar | renda_informal |
| `doc_type_hint` | holerite | extrato_bancario_3 | irpf_declaracao |

**Proibido:** associar documento de renda apenas como `(P1)` sem discriminar regime/fonte
quando o lead declarou multi-renda ou multi-regime (RC-F5-38).

### 11.3 Documento civil — associação por estado civil

| Estado civil | Documento | Associação |
|---|---|---|
| Casado(a) civil | Certidão de casamento | P1 + P2 (ambos cobertos) |
| Divorciado(a) | Certidão com averbação | P1 (estado civil post-divórcio) |
| Viúvo(a) | Certidão de óbito do cônjuge | P1 (referência ao cônjuge falecido) |
| Separado(a) sem averbação | Certidão sem averbação | P1 + status `needs_review` (AT-03) |

---

## §12 Classificação hipotética — limites e fontes

### 12.1 O que pode ser inferido

| Inferência | Fonte | Limitação |
|---|---|---|
| Tipo documental geral | Caption + filename + MIME + contexto | Hipótese; não fato confirmado |
| Pessoa destinatária | Caption + contexto conversacional | Hipótese; confirmar com lead |
| Regime/fonte de renda | Perfil declarado + contexto | Hipótese; confirmar se multi-renda |
| Prazo/validade | Filename com data (ex: `holerite_jan_2026.pdf`) | Apenas se data explícita no nome |
| Adequação ao perfil | `fact_work_regime_p1` + lista de docs pendentes | Inferência baseada em estado do lead |

### 12.2 O que NUNCA pode ser inferido

| Inferência proibida | Motivo |
|---|---|
| Conteúdo real do documento (texto, números, imagem) | Não há OCR — conteúdo é opaco sem leitura |
| Autenticidade do documento | Sem validação externa |
| Renda exata declarada no documento | Sem extração de dados |
| CPF/RG da pessoa no documento | Sem OCR |
| Que o documento cobre todo o requisito esperado | Sem leitura de conteúdo |
| Que o dossiê mínimo está completo | Sem verificação real de conteúdo |

### 12.3 Quando OCR futuramente existir

Mesmo com OCR futuro, as regras de hipótese se mantêm com ajustes:
- OCR gera dados brutos com confiança variável
- Dados de OCR entram no contexto com `confidence_hint` refletindo a confiança do OCR
- OCR NUNCA cria `fact_*` confirmado sem passar pelo pipeline T4 → T3 → T2
- OCR NUNCA produz `reply_text`
- OCR NUNCA aprova documento sozinho
- OCR é mais um insumo — não o árbitro

---

## §13 Tratamento de casos problemáticos

### 13.1 Imagem ilegível / muito escura / tremida

| Etapa de detecção | EP-01 (surface_warnings) ou EP-04 (validação declarativa) |
|---|---|
| Estado resultante | `rejected_unreadable` |
| Transição para | `pending_replacement` |
| Ação do LLM | Orientar reenvio com boa iluminação, câmera estável, documento plano |
| Bloqueio? | NÃO bloqueia dossiê se outros docs mínimos presentes |

### 13.2 Imagem cortada / documento parcial

| Etapa de detecção | EP-04 (surface_warnings ou análise contextual) |
|---|---|
| Estado resultante | `rejected_unreadable` |
| Transição para | `pending_replacement` |
| Ação do LLM | Solicitar foto completa do documento, capturando todas as bordas |
| Bloqueio? | NÃO bloqueia dossiê se outros docs mínimos presentes |

### 13.3 PDF com senha / PDF protegido

| Etapa de detecção | EP-01 (surface_warnings — arquivo não abre) |
|---|---|
| Estado resultante | `rejected_unreadable` |
| Transição para | `pending_replacement` |
| Ação do LLM | Solicitar versão sem senha, ou captura de tela do documento aberto, ou cópia impressa fotografada |
| Bloqueio? | NÃO bloqueia dossiê se outros docs mínimos presentes |

### 13.4 PDF corrompido

| Etapa de detecção | EP-01 (surface_warnings — arquivo inválido) |
|---|---|
| Estado resultante | `rejected_unreadable` |
| Transição para | `pending_replacement` |
| Ação do LLM | Solicitar reenvio em outro formato (PDF sem compressão, imagem, etc.) |
| Bloqueio? | NÃO bloqueia dossiê se outros docs mínimos presentes |

### 13.5 Arquivo duplicado

| Etapa de detecção | EP-04 (`dedupe_key` igual a arquivo anterior) |
|---|---|
| Estado resultante | `duplicate` |
| Transição | Manter o mais recente ou o de maior qualidade; descartar duplicata |
| Ação do LLM | Pode ignorar silenciosamente ou confirmar "já recebi esse documento anteriormente" |
| Bloqueio? | NÃO bloqueia — apenas registra |

### 13.6 Arquivo muito pesado

| Etapa de detecção | EP-01 (`media_size_bytes` > limite operacional; surface_warning) |
|---|---|
| Estado resultante | `classified_hypothesis` + `surface_warnings` |
| Transição | Aguardar confirmação se sistema conseguiu processar |
| Ação do LLM | Orientar envio de versão menor, ou fotografar ao invés de digitalização HD |
| Bloqueio? | NÃO bloqueia se arquivo foi recebido mesmo sendo grande |

### 13.7 Arquivo com MIME divergente

| Etapa de detecção | EP-01/EP-04 (`surface_warnings` indica MIME ≠ extensão) |
|---|---|
| Estado resultante | `needs_review` |
| Ação do LLM | Confirmar com lead qual é o documento enviado; solicitar reenvio em formato correto |
| Bloqueio? | NÃO bloqueia automaticamente |

### 13.8 Print de aplicativo sem contexto

| Etapa de detecção | EP-02 (MIME = image; filename genérico; caption ausente) |
|---|---|
| Estado resultante | `classified_hypothesis` (baixa confiança) → `needs_review` |
| Ação do LLM | Perguntar ao lead o que é o print: "Você enviou um extrato? Qual banco?" |
| Bloqueio? | NÃO bloqueia — aguarda confirmação |

### 13.9 CNPJ isolado (sem renda PF)

| Etapa de detecção | EP-04 (tipo classificado como `doc_info_cnpj` ou similar) |
|---|---|
| Estado resultante | `informational_only` |
| Ação do LLM | Contextualizou atividade empresarial; CNPJ não é renda MCMV; solicitar IRPF ou extrato PF |
| Bloqueio? | NÃO bloqueia — registro informativo |

### 13.10 Benefício assistencial (Bolsa Família, BPC, seguro-desemprego)

| Etapa de detecção | EP-04 (tipo = `informational_only` por RC-F5-15) |
|---|---|
| Estado resultante | `informational_only` |
| Ação do LLM | Registrar como contexto; orientar composição ou alternativas de renda |
| Bloqueio? | NÃO bloqueia — se única renda: buscar composição |

### 13.11 Holerite vencido (> 3 meses)

| Etapa de detecção | EP-04 (prazo por RC-F5-06 e §12.1 T6.3) |
|---|---|
| Estado resultante | `expired_or_outdated` |
| Transição para | `pending_replacement` |
| Ação do LLM | Solicitar holerite mais recente |
| Bloqueio? | NÃO bloqueia dossiê se outros docs mínimos presentes com obs. |

### 13.12 Extrato incompleto / parcial

| Etapa de detecção | EP-04 (contextual — lead menciona período parcial ou surface_warning de arquivo pequeno) |
|---|---|
| Estado resultante | `needs_review` |
| Ação do LLM | Confirmar se são os 3 meses completos; solicitar completar se necessário |
| Bloqueio? | NÃO bloqueia automaticamente |

### 13.13 Documento enviado sem dizer de quem é

| Etapa de detecção | EP-03 (`person_hint = unknown`) |
|---|---|
| Estado resultante | `needs_owner` |
| Ação do LLM | Perguntar ao lead: "Esse documento é seu ou de outra pessoa que está compondo?" |
| Bloqueio? | NÃO bloqueia dossiê; ficou como pendência até confirmar |

### 13.14 Documento de tipo errado para o perfil

| Etapa de detecção | EP-04 (tipo hipotético incompatível com perfil/regime) |
|---|---|
| Estado resultante | `rejected_wrong_type` |
| Transição para | `pending_replacement` |
| Ação do LLM | Orientar o tipo correto esperado para o perfil: "Para CLT, preciso do seu holerite — você enviou um extrato bancário. Pode enviar o holerite?" |
| Bloqueio? | NÃO bloqueia — solicitar substituição |

---

## §14 Relação com dossiê operacional futuro (T6.8)

**PR-T6.8 — Dossiê operacional e link do correspondente** receberá como entrada o conjunto
de referências documentais produzidas por este pipeline. A responsabilidade de T6.4 termina
com EP-07: preparar referências, não montar dossiê.

| Responsabilidade | T6.4 (este pipeline) | T6.8 (futuro) |
|---|---|---|
| Receber e classificar mídia documental | ✅ | — |
| Associar documento a P1/P2/P3 | ✅ | — |
| Aplicar estado documental | ✅ | — |
| Preparar referência para dossiê | ✅ | — |
| Montar dossiê organizado por perfil | — | ✅ |
| Gerar link para correspondente | — | ✅ |
| Enviar dossiê ao correspondente | — | ✅ |
| Tratar retorno do correspondente | — | ✅ |
| Declarar dossiê mínimo completo | — | ✅ |

**Invariante T6.4:** Este pipeline nunca declara dossiê completo, nunca envia ao correspondente
e nunca declara aprovação de documentação. Essas são responsabilidades de T6.8.

---

## §15 Proibições absolutas

| Código | Proibição | Motivo |
|---|---|---|
| PROB-PIP-01 | Imagem/PDF/documento não pode gerar `reply_text` | Soberania da fala — A00-ADENDO-01 |
| PROB-PIP-02 | Imagem/PDF/documento não pode decidir `next_stage` | Canal não decide stage — A00-ADENDO-02 |
| PROB-PIP-03 | Imagem/PDF/documento não pode aprovar/reprovar cliente | Aprovação é do correspondente/banco |
| PROB-PIP-04 | Imagem/PDF/documento não pode finalizar dossiê | Dossiê é T6.8 |
| PROB-PIP-05 | Imagem/PDF/documento não pode enviar ao correspondente | Envio é T6.8 |
| PROB-PIP-06 | Imagem/PDF/documento não pode criar `fact_*` novo | `fact_*` é responsabilidade de T4→T3→T2 |
| PROB-PIP-07 | Imagem/PDF/documento não pode criar `current_phase` novo | Valores canônicos em T2_LEAD_STATE_V1 §3.3 |
| PROB-PIP-08 | Imagem/PDF/documento não pode alterar regra comercial F5 | RC-F5-* são canônicas em T5 |
| PROB-PIP-09 | OCR não pode ser obrigatório | OCR é lacuna futura |
| PROB-PIP-10 | OCR não pode virar verdade absoluta | OCR é insumo de baixa/média confiança |
| PROB-PIP-11 | Classificador automático não pode virar verdade absoluta | Classificação é hipótese — confirmar com lead |
| PROB-PIP-12 | Documento sem dono claro não pode ser aceito como válido | `needs_owner` obrigatório antes de `accepted_for_dossier` |
| PROB-PIP-13 | Documento ilegível não pode ser aceito | `rejected_unreadable` obrigatório |
| PROB-PIP-14 | Print sem origem/contexto não pode virar comprovante | `needs_review` + confirmação pelo LLM obrigatória |
| PROB-PIP-15 | Benefício assistencial não pode virar renda financiável | RC-F5-15; `informational_only` obrigatório |
| PROB-PIP-16 | CNPJ isolado não pode virar renda válida | RC-F5-12; `informational_only` obrigatório |
| PROB-PIP-17 | Pipeline não pode criar runtime | Esta PR é declarativa |
| PROB-PIP-18 | Pipeline não pode mexer em Supabase | Zero migration |
| PROB-PIP-19 | Pipeline não pode abrir canal real WhatsApp/Meta | Canal real é T6.7/T6.9 |
| PROB-PIP-20 | Pipeline não pode avançar para T6.5 ou T6.8 nesta PR | Próxima PR autorizada é T6.5 |

---

## §16 Riscos e mitigação

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R-PIP-01 | Pipeline trata hipótese como certeza | Alta | Alto | Regra §12 + `confidence_hint` + confirmação obrigatória do LLM |
| R-PIP-02 | Documento associado à pessoa errada (P2 como P1) | Alta | Alto | EP-03 `needs_owner` obrigatório quando incerto; LLM confirma |
| R-PIP-03 | OCR futuro tratado como verdade absoluta | Média | Alto | §12.3: OCR = insumo hipotético; nunca cria `fact_*` sozinho |
| R-PIP-04 | Dossiê marcado completo sem conteúdo verificado | Média | Alto | PROB-PIP-04 explícita; T6.8 é responsável |
| R-PIP-05 | Benefício assistencial tratado como renda principal | Média | Alto | EP-04 + `informational_only` + RC-F5-15 |
| R-PIP-06 | PDF protegido/corrompido bloqueando fluxo | Alta | Médio | `rejected_unreadable` → `pending_replacement` sem bloquear dossiê mínimo |
| R-PIP-07 | Multi-renda somada sem discriminar fonte | Média | Alto | EP-03 `regime_hint` + `source_hint` obrigatórios por RC-F5-38 |
| R-PIP-08 | Classificação errada por filename genérico | Alta | Médio | `confidence_hint = low` → `needs_review` + confirmação LLM |
| R-PIP-09 | Documento de T6.4 gerando reply_text | Baixa | Crítico | PROB-PIP-01 + INV-SC-01 (T6.2) + B-T6-04 (bloqueio permanente) |
| R-PIP-10 | Pipeline criando pipeline paralelo de resposta | Baixa | Crítico | PROB-PIP-17 + "T6 não cria outro cérebro" A00-ADENDO-02 |

---

## §17 Critérios de aceite da PR-T6.4

| # | Critério | Status |
|---|---|---|
| CA-T6.4-01 | `T6_PIPELINE_IMAGEM_PDF.md` existe no repositório | ✅ |
| CA-T6.4-02 | Pipeline declarativo definido (§8 + EP-01..EP-07) | ✅ |
| CA-T6.4-03 | Relação com T6_SURFACE_CANAL clara (§4) | ✅ |
| CA-T6.4-04 | Relação com T6_CONTRATO_ANEXOS_DOCUMENTOS clara (§5) | ✅ |
| CA-T6.4-05 | Relação com T4/T3/T2/T5 clara (§6) | ✅ |
| CA-T6.4-06 | Tipos de entrada cobertos (§7 — 19+ tipos) | ✅ |
| CA-T6.4-07 | Etapas EP-01..EP-07 declaradas (§9) | ✅ |
| CA-T6.4-08 | Estados documentais de T6.3 reaproveitados sem criar novo (§10) | ✅ |
| CA-T6.4-09 | Associação P1/P2/P3 definida (§11) | ✅ |
| CA-T6.4-10 | Classificação hipotética limitada com fontes e proibições (§12) | ✅ |
| CA-T6.4-11 | OCR declarado como lacuna futura (§12.3 + §15 PROB-PIP-09/10) | ✅ |
| CA-T6.4-12 | 14 casos problemáticos tratados (§13) | ✅ |
| CA-T6.4-13 | Relação com dossiê futuro T6.8 declarada (§14) | ✅ |
| CA-T6.4-14 | 20 proibições absolutas PROB-PIP-01..20 declaradas (§15) | ✅ |
| CA-T6.4-15 | Documento não cria `reply_text` | ✅ |
| CA-T6.4-16 | Documento não cria `fact_*` | ✅ |
| CA-T6.4-17 | Documento não cria `current_phase` | ✅ |
| CA-T6.4-18 | Documento não decide stage | ✅ |
| CA-T6.4-19 | Documento não monta dossiê operacional | ✅ |
| CA-T6.4-20 | Zero `src/` tocado | ✅ |
| CA-T6.4-21 | Zero runtime / migration / Supabase | ✅ |
| CA-T6.4-22 | Zero canal real aberto | ✅ |
| CA-T6.4-23 | Zero OCR real implementado | ✅ |
| CA-T6.4-24 | Próxima PR autorizada declarada como PR-T6.5 | ✅ |
| CA-T6.4-25 | A00-ADENDO-01/02/03 declarados conformes | ✅ |
| CA-T6.4-26 | Bloco E presente em §19 | ✅ |

---

## §18 Próxima PR autorizada

**PR-T6.5 — Áudio no mesmo cérebro conversacional**

PR-T6.5 receberá este contrato (T6.4) como contexto e declarará o pipeline de tratamento
de áudio:
- Como `input_type = audio` é recebido pela surface
- Transcrição como processo hipotético (não verdade absoluta)
- Confiança de transcrição
- Extração de fatos via LLM a partir da transcrição — não diretamente do áudio
- Tratamento de áudio ruim / incompreensível
- Confirmação de informações extraídas de áudio quando ambíguas
- Limites: áudio não avança stage sozinho; áudio não cria `fact_*` sem validação

**PR-T6.5 não pode abrir sem PR-T6.4 merged.**

---

## §19 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---

Documento-base da evidência:
  schema/implantation/T6_PIPELINE_IMAGEM_PDF.md (este artefato)

Estado da evidência:
  completa

Há lacuna remanescente?:
  não — ausência de OCR é lacuna planejada (T6-LF-05/06 herdada de T6.3),
  declarada explicitamente em §12.3 e §15; não bloqueante desta PR.
  Nenhuma lacuna não declarada identificada.

Há item parcial/inconclusivo bloqueante?:
  não — todos os critérios de aceite CA-T6.4-01..26 estão ✅

Fechamento permitido nesta PR?:
  sim — todos os critérios satisfeitos; artefato completo; zero violações de adendo

Estado permitido após esta PR:
  PR-T6.4 encerrada — PR-T6.5 desbloqueada

Próxima PR autorizada:
  PR-T6.5 — Áudio no mesmo cérebro conversacional

--- FIM BLOCO E ---
```

### Evidências consolidadas (26 provas)

| # | Prova | Verificação |
|---|---|---|
| 1 | `T6_PIPELINE_IMAGEM_PDF.md` criado | git diff HEAD |
| 2 | Zero `src/` | git diff HEAD — sem arquivos em src/ |
| 3 | Zero `fact_*` novo | inspeção textual — nenhuma chave nova declarada |
| 4 | Zero `current_phase` novo | inspeção textual — nenhum valor novo |
| 5 | Zero migration Supabase | git diff HEAD — sem arquivos .sql |
| 6 | Zero `reply_text` produzido | inspeção — nenhum campo reply_text neste artefato |
| 7 | Zero canal real aberto | PROB-PIP-19 + git diff |
| 8 | Zero OCR real implementado | PROB-PIP-09 + §12.3 + inspeção |
| 9 | PR-T6.3 merged verificado | #128 merged 2026-04-28T19:39:58Z |
| 10 | §7: 19+ tipos de entrada cobertos | §7.1, 7.2, 7.3, 7.4 |
| 11 | §8: fluxo declarativo completo (9 passos) | §8 diagrama |
| 12 | §9: EP-01..EP-07 declaradas | §9 detalhes |
| 13 | §10: 11 estados reaproveitados de T6.3 — zero novos | §10 tabela |
| 14 | §11: associação P1/P2/P3 + multi-renda + docs civis | §11.1–11.3 |
| 15 | §12: classificação hipotética limitada — fontes e proibições | §12.1–12.3 |
| 16 | §13: 14 casos problemáticos com tratamento declarado | §13.1–13.14 |
| 17 | §14: relação com T6.8 (dossiê) declarada com responsabilidades separadas | §14 tabela |
| 18 | §15: 20 proibições absolutas PROB-PIP-01..20 | §15 |
| 19 | §16: 10 riscos com mitigação | §16 |
| 20 | §17: 26 critérios de aceite todos ✅ | §17 |
| 21 | A00-ADENDO-01 conforme | PROB-PIP-01 + §3.1 |
| 22 | A00-ADENDO-02 conforme | PROB-PIP-10 + §3.1 regra-mãe |
| 23 | A00-ADENDO-03 conforme | §19 Bloco E |
| 24 | RC-F5-38 (multi-renda) aplicada em EP-03 e §11.2 | §11.2 |
| 25 | Relação com T6_SURFACE_CANAL (T6.2) declarada | §4 tabela |
| 26 | Relação com T6_CONTRATO_ANEXOS_DOCUMENTOS (T6.3) declarada | §5 hierarquia |

---

*Artefato gerado em 2026-04-28 — PR-T6.4 — ENOVA 2 / LLM-FIRST*
*Conformidade: A00-ADENDO-01 ✅ A00-ADENDO-02 ✅ A00-ADENDO-03 ✅*
*Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`*
