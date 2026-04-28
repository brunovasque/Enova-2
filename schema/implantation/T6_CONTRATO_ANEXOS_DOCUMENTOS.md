# T6_CONTRATO_ANEXOS_DOCUMENTOS — Contrato de Anexos e Documentos — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.3 |
| Branch | feat/t6-pr-t6-3-contrato-anexos-documentos |
| Artefato | Contrato declarativo de governança documental — anexos e documentos MCMV |
| Status | entregue |
| Pré-requisito | PR-T6.2 merged (#127 — 2026-04-28T19:19:31Z); T6_SURFACE_CANAL.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.4 — Pipeline de imagem/PDF/documento |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Este artefato declara formalmente a **governança documental de anexos** recebidos pela ENOVA 2 via
canal. Define como documentos enviados pelo lead (PDFs, imagens, fotos de documentos, extratos,
certidões, comprovantes) são classificados, associados à pessoa correta, marcados com estado
documental e alimentam o dossiê — sem jamais decidirem stage, aprovarem cliente, gerarem `reply_text`
ou substituírem a análise do correspondente.

**Princípio-mãe desta PR:**

> Documento é evidência de entrada. Documento não é verdade absoluta.
> Documento não escreve `reply_text`. Documento não decide stage.
> Documento não aprova/reprova cliente. Documento não finaliza dossiê sozinho.
> Documento não cria `fact_*` novo. Documento alimenta a governança T1→T2→T3→T4→T5.

**Esta PR é declarativa — não implementa runtime, não cria código, não abre canal real,
não implementa OCR obrigatório, não cria migration Supabase.**

---

## §2 Finalidade do contrato de anexos

O contrato de anexos existe para responder, de forma canônica e declarativa:

- Quais tipos de documento são aceitos no dossiê MCMV?
- Quais tipos são informativos mas não comprobatórios de renda financiável?
- Quais tipos são rejeitados (ilegíveis, corrompidos, incorretos)?
- Quais estados um documento pode assumir ao longo do ciclo?
- Como um documento é associado ao lead/caso e à pessoa correta (P1/P2/P3)?
- Quais documentos são necessários por perfil de renda e regime de trabalho?
- Quais documentos são necessários por finalidade (identificação, renda, composição, etc.)?
- Quais são as regras de validade declarativa (sem exigir OCR ou automação)?
- Quais são as proibições absolutas nesta camada?

A resposta a cada uma dessas perguntas alimenta o contexto que o LLM usa para conduzir a
coleta documental em F5 — sem que o documento em si decida ou fale por conta própria.

---

## §3 Princípio central — documento é evidência, não decisão

### 3.1 O documento não é o árbitro

Nenhum documento recebido pela ENOVA 2:
- Aprova ou reprova automaticamente o cliente
- Avança o stage do funil sozinho
- Finaliza o dossiê sozinho
- Confirma renda como formalizada sem análise
- Dispensa a verificação do correspondente
- Gera fala ao cliente sem mediação do LLM
- Cria ou altera fatos canônicos (`fact_*`) sem validação pelo pipeline T4→T3→T2

### 3.2 O documento é insumo do contexto

O documento recebido via canal:
1. É capturado pela surface única (`T6_SURFACE_CANAL.md`) como `input_type = document`
2. Gera um `SurfaceEventNormalizado` que alimenta `TurnoEntrada(T4.1)`
3. O contexto do turno descreve o documento recebido (tipo, pessoa informada, finalidade esperada)
4. O LLM usa esse contexto para conduzir a coleta — perguntar o que falta, confirmar associação,
   sinalizar pendência, orientar próximo documento
5. O pipeline T3/T2 valida se o documento se encaixa no perfil declarado
6. O dossiê registra o documento como recebido, pendente ou informativo
7. **Nenhum passo acima produz `reply_text` fora do LLM**

### 3.3 Ilegível, incompleto ou inválido é pendência — não bloqueio cego

Documento ilegível, cortado ou corrompido:
- Gera estado `rejected_unreadable` ou `rejected_wrong_type`
- Vira **pendência** — o LLM pode solicitar reenvio ou orientar alternativa
- Não bloqueia automaticamente a análise se o dossiê mínimo (RC-F5-20) está presente
- Não impede o envio parcial ao correspondente com observação

### 3.4 OCR e classificação automática são lacunas futuras

**OCR e classificação automática de documentos são declarados como lacuna futura.**
Nesta PR e nas PRs T6.3 e T6.4, o sistema opera sem OCR obrigatório.

O que o sistema pode fazer sem OCR:
- Registrar que recebeu um arquivo do tipo declarado (PDF, imagem, etc.)
- Associar ao lead e à pessoa informada pelo lead no contexto da conversa
- Marcar o documento como "recebido aguardando revisão"
- Orientar o LLM a confirmar com o lead o que foi enviado e por quê

O que **não pode** ser assumido sem OCR:
- Que o conteúdo do documento é o que o cliente disse que era
- Que os dados extraídos automaticamente são corretos
- Que a renda declarada no documento está correta
- Que a identidade da pessoa no documento bate com P1/P2/P3 cadastrado

---

## §4 Relação com T6_SURFACE_CANAL

`T6_SURFACE_CANAL.md` define a camada de normalização que recebe toda entrada do canal e
produz um `SurfaceEventNormalizado`. Quando a entrada é um documento (arquivo), a surface:

- Classifica `input_type = document`
- Classifica `input_subtype` (pdf, docx, spreadsheet, other_document)
- Preenche `media_ref`, `media_mime_type`, `media_filename`, `media_size_bytes`
- Registra `caption` (texto enviado junto com o arquivo, se houver)
- Registra `confidence_hint` (grau de confiança na classificação do tipo)
- Marca `surface_warnings` se o arquivo parecer ilegível, muito grande, ou de tipo não suportado
- Entrega o `SurfaceEventNormalizado` ao pipeline T4

**O que a surface NÃO faz com documentos:**
- Não lê o conteúdo do arquivo
- Não extrai dados do documento
- Não associa o documento a P1/P2/P3 (isso é contexto de turno — T4/LLM)
- Não valida a autenticidade do documento
- Não classifica o documento por finalidade (identificação, renda, etc.)
- Não escreve `reply_text`

**Este contrato (T6.3) governa o que acontece após a surface entregar o documento ao pipeline.**

---

## §5 Relação com F5 / documentação / dossiê

`T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` contém as regras comerciais validadas pelo Vasques
para coleta documental (§5 — RC-F5-01 a RC-F5-38). Este contrato (T6.3) é o artefato de
governança do canal que alinha e operacionaliza essas regras quando os documentos chegam
via canal digital (WhatsApp/Meta):

| Artefato | Papel |
|---|---|
| `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` | Regras comerciais: quais docs exigir, por perfil, por regime |
| `T6_SURFACE_CANAL.md` | Camada de normalização: recebe arquivo bruto → SurfaceEventNormalizado |
| `T6_CONTRATO_ANEXOS_DOCUMENTOS.md` (este) | Governança documental: estados, associação, validade, proibições |
| `T6_PIPELINE_IMAGEM_PDF.md` (T6.4) | Pipeline técnico: como processar mídia documental passo a passo |

**Cross-references obrigatórios com F5:**
- RC-F5-04: documentação básica para todos (P1/P2/P3)
- RC-F5-05: CTPS completa — quando exigir
- RC-F5-06 a RC-F5-14: docs por regime (CLT, servidor, aposentado, autônomo, MEI, empresário, informal)
- RC-F5-15: benefícios não financiáveis
- RC-F5-16: casado civil / P2
- RC-F5-17: familiar / P3
- RC-F5-19: montagem de dossiê por perfil
- RC-F5-20: dossiê mínimo para envio ao correspondente
- RC-F5-35: certidão de óbito do cônjuge — viúvo(a)
- RC-F5-36: certidão de casamento com averbação — divorciado(a)
- RC-F5-37: separado(a) sem averbação — caminhos possíveis
- RC-F5-38: multi-renda / multi-regime — documentos por fonte separada

---

## §6 Tipos documentais aceitos

Tipos declarados como **aceitos para o dossiê MCMV**. Cada tipo pode chegar como imagem (JPEG/PNG),
PDF, ou arquivo de documento (DOCX, planilha). A classificação do tipo é contextual — declarada
pelo lead ou inferida pelo LLM com base na conversa.

### 6.1 Identificação pessoal

| Documento | Sigla interna | Observação |
|---|---|---|
| RG (Registro Geral) — novo modelo com CPF | `doc_id_rg` | RG com CPF embutido — CPF separado dispensável |
| CNH (Carteira Nacional de Habilitação) | `doc_id_cnh` | CNH com CPF — CPF separado dispensável |
| RG — modelo antigo (sem CPF) | `doc_id_rg_antigo` | CPF separado obrigatório |
| Passaporte | `doc_id_passaporte` | Aceitável; CPF separado pode ser necessário |
| CPF — documento separado | `doc_cpf` | Necessário apenas se não constar no doc de identificação |

### 6.2 Comprovante de residência

| Documento | Sigla interna | Observação |
|---|---|---|
| Conta de água, luz, gás ou telefone | `doc_residencia_conta` | Em nome do titular ou familiar direto declarado |
| Fatura de internet/TV a cabo | `doc_residencia_internet` | Em nome do titular |
| Declaração de residência — holerite com endereço | `doc_residencia_holerite` | Complementar; pode apoiar |
| Contrato de aluguel registrado | `doc_residencia_aluguel` | Aceitável; verificar validade |
| Correspondência bancária ou fiscal | `doc_residencia_bancaria` | Aceitável como complemento |

**Validade:** comprovante de residência com mais de 3 meses pode ser questionado pelo correspondente.
O LLM pode sinalizar essa limitação ao lead sem impedir o envio do dossiê.

### 6.3 Renda CLT / vínculo formal

| Documento | Sigla interna | Observação |
|---|---|---|
| Último holerite | `doc_renda_holerite_1` | CLT sem variação de renda |
| 3 últimos holerites | `doc_renda_holerite_3` | CLT com variação de renda |
| Holerite com data superior a 3 meses | `doc_renda_holerite_expirado` | Não serve — pedir holerite atual |
| CTPS completa (digitalizada) | `doc_ctps` | Quando possui 36 meses ou não soube informar |

### 6.4 Renda servidor público / estatutário

| Documento | Sigla interna | Observação |
|---|---|---|
| Folha de pagamento | `doc_renda_folha_pagamento` | Servidor público / estatutário |
| Contracheque | `doc_renda_contracheque` | Equivalente a folha de pagamento |

### 6.5 Renda aposentado / previdenciário financiável

| Documento | Sigla interna | Observação |
|---|---|---|
| Extrato de aposentadoria INSS | `doc_renda_extrato_aposentadoria` | Aposentado por tempo de contribuição / idade |
| Extrato de pensão por morte | `doc_renda_extrato_pensao_morte` | Pensão por morte é financiável — separar de pensão alimentícia |
| Extrato de benefício previdenciário | `doc_renda_extrato_beneficio_prev` | Verificar se é previdenciário (financiável) ou assistencial (não financiável) |

### 6.6 Renda autônomo / MEI / empresário — com IRPF

| Documento | Sigla interna | Observação |
|---|---|---|
| Declaração de IRPF (último ano) | `doc_renda_irpf_declaracao` | Autônomo / MEI / empresário com IRPF |
| Recibo de entrega do IRPF | `doc_renda_irpf_recibo` | Obrigatório junto com a declaração |

### 6.7 Renda autônomo / MEI / informal — sem IRPF

| Documento | Sigla interna | Observação |
|---|---|---|
| 3 últimos extratos bancários (movimentação) | `doc_renda_extrato_bancario_3` | Autônomo sem IRPF / informal / MEI sem IRPF |
| FGTS — extrato para uso | `doc_fgts_extrato` | Apenas se for usar o FGTS; não é obrigatório para aprovação |

**Regra:** autônomo sem IRPF tem limitação no dossiê — marcar; buscar composição, entrada ou FGTS.

### 6.8 Documentos civis / estado civil

| Documento | Sigla interna | Regra de uso | Referência F5 |
|---|---|---|---|
| Certidão de casamento | `doc_civil_certidao_casamento` | Casado civil (P1 e P2) | RC-F5-16 |
| Certidão de casamento com averbação de divórcio | `doc_civil_certidao_casamento_averbacao` | Divorciado(a) formal | RC-F5-36 |
| Certidão de óbito do cônjuge | `doc_civil_certidao_obito_conjuge` | Viúvo(a) | RC-F5-35 |
| Certidão de casamento sem averbação (separado) | `doc_civil_certidao_casamento_sem_averbacao` | Separado sem averbação — ver §9.4 | RC-F5-37 |

### 6.9 Comprovantes de regularização de restrição

| Documento | Sigla interna | Observação |
|---|---|---|
| Comprovante de pagamento / acordo | `doc_regularizacao_pagamento` | Após negociação SPC/Serasa — RC-F5-25 |
| Comprovante de regularização Receita Federal | `doc_regularizacao_receita` | Após pendência CPF — RC-F5-26 |
| Extrato Registrato (BACEN) | `doc_registrato_extrato` | SCR/BACEN — RC-F5-24; solicitado ao lead quando reprovação envolve BACEN |
| PDF Registrato (enviado pela Enova ao lead) | `doc_registrato_pdf_enova` | Arquivo informativo — enviado ao lead para orientação; não é doc do lead |

### 6.10 Dossiê e correspondente

| Documento | Sigla interna | Observação |
|---|---|---|
| Registrato futuro (quando disponível) | `doc_registrato_futuro` | Integração futura LF-13; sem schema real ainda |

### 6.11 Outros anexos informativos aceitos

| Documento | Sigla interna | Observação |
|---|---|---|
| Comprovante bancário de entrada / reserva | `doc_info_entrada` | Informativo — não substitui análise formal da entrada |
| CNPJ / contrato social | `doc_info_cnpj` | Contextualiza atividade; CNPJ isolado NÃO é renda MCMV |
| Print bancário / extrato digital avulso | `doc_info_extrato_avulso` | Apenas como contexto / histórico — não como renda principal |
| Declaração pessoal de renda informal | `doc_info_declaracao_renda_informal` | Informativa; não substitui extrato ou IRPF |
| Outros anexos sem categoria definida | `doc_info_outro` | Marcar como informativo; LLM contextualiza |

---

## §7 Tipos documentais rejeitados ou não comprobatórios

### 7.1 Rendas não financiáveis — documentos informativos apenas

Os seguintes documentos **não comprovam renda financiável** para o dossiê MCMV.
Podem aparecer como **contexto/observação**, mas nunca como renda principal validada.

| Documento / Origem | Motivo | Referência F5 |
|---|---|---|
| Extrato Bolsa Família | Benefício assistencial — não financiável | RC-F5-15 |
| Extrato BPC / LOAS | Benefício assistencial — não financiável | RC-F5-15 |
| Extrato seguro-desemprego | Temporário — não financiável | RC-F5-15 |
| Comprovante de trabalho temporário | Sem estabilidade — não financiável | RC-F5-15 |
| Comprovante de pensão alimentícia | Pensão alimentícia — não entra como renda | RC-F5-09 |
| CNPJ isolado (sem renda PF documentada) | CNPJ contextualiza — não é renda MCMV | RC-F5-12 |
| Pró-labore declarado sem IRPF PF | Sem IRPF: tratar como autônomo sem IRPF | RC-F5-13 |
| Extrato de renda informal sem vínculo formal | Complementar — marcar limitação | RC-F5-14 |

**Regra:** se a única renda do lead vier de fonte não financiável → buscar composição, entrada ou FGTS.
O LLM orienta sem bloquear automaticamente.

### 7.2 Documentos rejeitados — inválidos para o dossiê

Os seguintes documentos **não podem ser aceitos como válidos** para o dossiê.
Geram estado `rejected_*` e viram pendência de reenvio.

| Documento / Situação | Estado gerado | Ação esperada |
|---|---|---|
| Imagem ilegível / muito escura / fora de foco | `rejected_unreadable` | Solicitar reenvio — orientar foto com boa iluminação |
| Documento cortado / parcial | `rejected_unreadable` | Solicitar foto completa |
| Arquivo corrompido (não abre) | `rejected_unreadable` | Solicitar reenvio em outro formato |
| Print de tela de aplicativo sem contexto | `rejected_wrong_type` | Solicitar documento original |
| Conversa de WhatsApp sem documento real | `rejected_wrong_type` | Não é comprovante — solicitar documento |
| Holerite vencido (>3 meses) | `expired_or_outdated` | Solicitar holerite atual |
| Documento sem identificação da pessoa | `needs_owner` | Confirmar com lead para qual pessoa é |
| Arquivo em formato não suportado | `rejected_unreadable` | Solicitar em PDF ou imagem |
| PDF protegido / com senha | `rejected_unreadable` | Solicitar versão sem senha ou impresso/fotografado |

---

## §8 Estados documentais

Estados declarativos do ciclo de vida de um documento recebido.
**Estados são conceituais — não criam enum runtime, schema Supabase ou migration.**

| Estado | Sigla | Descrição |
|---|---|---|
| `received` | Recebido | Arquivo chegou pelo canal; surface processou; aguarda classificação contextual |
| `classified_hypothesis` | Hipótese classificada | LLM inferiu o tipo com base no contexto da conversa; não confirmado pelo lead |
| `needs_owner` | Sem dono claro | Documento recebido sem identificação de a qual pessoa pertence (P1/P2/P3) |
| `needs_review` | Aguardando revisão | Recebido, associado, mas pendente de confirmação ou verificação operacional |
| `accepted_for_dossier` | Aceito para dossiê | Documento confirmado, associado a pessoa e finalidade; integra dossiê ativo |
| `rejected_unreadable` | Rejeitado — ilegível | Arquivo ilegível, cortado, corrompido ou em formato inválido |
| `rejected_wrong_type` | Rejeitado — tipo incorreto | Documento não corresponde ao que era esperado ou ao que o lead declarou |
| `duplicate` | Duplicado | Mesmo documento enviado mais de uma vez; preservar o mais recente/legível |
| `expired_or_outdated` | Vencido ou desatualizado | Documento com data fora do prazo aceitável (ex: holerite >3 meses) |
| `informational_only` | Apenas informativo | Documento recebido; não comprobatório de renda financiável; registrado como contexto |
| `pending_replacement` | Aguardando substituto | Documento rejeitado e lead foi orientado a reenviar; aguardando novo envio |

### 8.1 Transições de estado permitidas

```
received
  → classified_hypothesis  (LLM classifica tipo com base no contexto)
  → needs_owner            (não há contexto de pessoa suficiente)

classified_hypothesis
  → needs_review           (lead confirmou tipo; aguardando verificação)
  → needs_owner            (tipo classificado mas pessoa não identificada)
  → rejected_wrong_type    (tipo inferido não confere com conteúdo ou conversa)

needs_owner
  → classified_hypothesis  (lead informa para quem é)
  → needs_review           (pessoa informada; aguardando revisão)

needs_review
  → accepted_for_dossier   (verificação concluída; documento válido)
  → rejected_unreadable    (verificação: ilegível ou corrompido)
  → rejected_wrong_type    (verificação: tipo errado)
  → expired_or_outdated    (verificação: fora do prazo)
  → informational_only     (documento válido mas renda não financiável)

accepted_for_dossier
  → duplicate              (outro arquivo mais recente substitui este)
  → expired_or_outdated    (documento aceito mas data expirou antes do envio)

rejected_unreadable | rejected_wrong_type | expired_or_outdated
  → pending_replacement    (lead orientado a reenviar)

pending_replacement
  → received               (novo arquivo recebido — ciclo reinicia)
```

### 8.2 Regras dos estados

- **Um documento por estado.** Mesmo arquivo não pode ter dois estados simultâneos.
- **`accepted_for_dossier` não é aprovação do cliente** — é que o documento está no dossiê.
- **`rejected_*` não bloqueia dossiê mínimo** — se os documentos essenciais restantes estão presentes,
  o dossiê pode ser enviado com observação de pendência.
- **Estados são atualizados pelo contexto do turno** — o mecânico não muda estado sozinho sem
  insumo do pipeline T4/LLM.

---

## §9 Associação do documento ao lead e à pessoa correta

### 9.1 Regra de associação obrigatória

Todo documento deve ser associado, quando possível, a:

1. **Lead/caso** — identificado por `lead_external_id` (vindo do `SurfaceEventNormalizado`)
2. **Pessoa** — P1 (titular), P2 (cônjuge/parceiro), P3 (familiar/composição)
3. **Origem da renda** — quando for comprovante de renda (ex: "renda principal P1", "renda informal P2")
4. **Regime/fonte** — quando houver multi-renda (ex: "holerite CLT P1", "extrato autônomo P1")

### 9.2 Documento sem dono claro vira pendência — não bloqueio cego

Se o documento chega sem contexto suficiente para associar à pessoa correta:
- Estado → `needs_owner`
- LLM é responsável por perguntar ao lead para qual pessoa o documento é destinado
- O LLM **não presume** a associação — confirma com o lead
- Documento em `needs_owner` **não bloqueia automaticamente o dossiê** — pode ser tratado como
  pendência e enviado ao correspondente com observação

### 9.3 Multi-renda / multi-regime — documentos separados por fonte

Quando o lead possui mais de uma fonte de renda (RC-F5-38):

- Cada comprovante de renda deve ser associado à fonte específica: `(pessoa, regime, fonte)`
- Exemplo: P1 tem holerite CLT E extrato de renda informal → dois documentos, dois registros separados
- **Proibido somar em um único documento todas as rendas de P1** sem identificar origem

```
Associação correta:
  doc_renda_holerite_1 → P1 / renda principal / CLT
  doc_renda_extrato_bancario_3 → P1 / renda complementar / informal

Associação proibida:
  doc_renda_total_p1 → P1 / "renda total" (sem discriminar fonte)
```

### 9.4 Documentos civis — regras de associação por estado civil

| Estado civil | Documento necessário | Pessoa | Lacuna de schema | Referência F5 |
|---|---|---|---|---|
| Casado(a) civil | Certidão de casamento | P1 + P2 | — | RC-F5-16 |
| Divorciado(a) com averbação | Certidão de casamento com averbação | P1 | LF-33 | RC-F5-36 |
| Viúvo(a) | Certidão de óbito do cônjuge | P1 (referente ao cônjuge falecido) | LF-32 | RC-F5-35 |
| Separado(a) sem averbação | Certidão de casamento (sem averbação) | P1 | LF-34 | RC-F5-37 |
| Separado(a) regularizando | Certidão com averbação em andamento | P1 | LF-35 | RC-F5-37 |

**Nota sobre separado(a) sem averbação (AT-03):**
O `fact_estado_civil` não distingue "separado informal" de "divorciado formal". Dois caminhos
possíveis (ver `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md §2.5`):
1. Regularizar averbação primeiro — retorna quando concluído
2. Seguir com o cônjuge — P2 obrigatório com documentação completa

O documento civil recebido nesse caso vai para `needs_review` até que o caminho seja definido.

---

## §10 Documentos por perfil / regime

Amarrado com as regras comerciais de F5. Esta seção declara o que esperar de cada perfil —
sem prescrever fala, pergunta fixa ou template.

| Perfil | Documentos obrigatórios | Documentos condicionais | Referência F5 |
|---|---|---|---|
| **Todos os participantes (base)** | Identificação + comprovante de residência + comprovante de renda aplicável | CPF separado se não constar no doc de identificação; CTPS se 36 meses ou dúvida | RC-F5-04 |
| **CLT sem variação de renda** | Identificação + residência + último holerite | CTPS se 36 meses; FGTS se for usar | RC-F5-06 |
| **CLT com variação de renda** | Identificação + residência + 3 últimos holerites | CTPS se 36 meses; FGTS se for usar | RC-F5-06 |
| **CLT com CTPS necessária** | + CTPS completa digitalizada | — | RC-F5-05 |
| **Servidor público / estatutário** | Identificação + residência + folha de pagamento ou contracheque | CTPS se aplicável | RC-F5-07 |
| **Aposentado** | Identificação + residência + extrato da aposentadoria | CTPS se aplicável | RC-F5-08 |
| **Pensionista por morte** | Identificação + residência + extrato de pensão por morte | Separar de pensão alimentícia | RC-F5-09 |
| **Autônomo com IRPF** | Identificação + residência + declaração IRPF + recibo de entrega | CTPS se aplicável | RC-F5-10 |
| **Autônomo sem IRPF** | Identificação + residência + 3 últimos extratos de movimentação bancária | CTPS se aplicável; marcar limitação | RC-F5-11 |
| **MEI com IRPF** | Identificação + residência + declaração IRPF PF + recibo | CTPS se aplicável | RC-F5-12 |
| **MEI sem IRPF** | Identificação + residência + 3 últimos extratos bancários | CTPS se aplicável; marcar limitação; CNPJ isolado não é renda | RC-F5-12 |
| **Empresário (pró-labore com IRPF)** | Identificação + residência + IRPF PF + pró-labore se existir | CTPS se aplicável; CNPJ só contextualiza | RC-F5-13 |
| **Informal / bico** | Identificação + residência + 3 últimos extratos bancários | Renda por fora não é financiável — marcar | RC-F5-14 |
| **CLT + renda informal** | Holerite CLT + 3 extratos da renda informal | Separar por fonte — RC-F5-38 | RC-F5-14, RC-F5-38 |
| **Multi-renda / multi-regime** | Documentos por cada fonte/regime separados | Cada fonte tem dono e documento próprio | RC-F5-38 |
| **Casado(a) civil — P2** | Certidão de casamento + docs completos P2 | Renda P2 se tiver | RC-F5-16 |
| **Divorciado(a) com averbação** | Certidão de casamento com averbação de divórcio | — | RC-F5-36 |
| **Viúvo(a)** | Certidão de óbito do cônjuge | — | RC-F5-35 |
| **Separado(a) sem averbação** | Certidão de casamento (sem averbação) | Regularizar averbação OU seguir com cônjuge | RC-F5-37 |
| **Familiar / P3** | Identificação + residência + renda conforme regime | CTPS se aplicável; cônjuge de P3 se casado | RC-F5-17 |

**Nota de lacuna de schema:**
- Sem `fact_*` canônico para lista documental dinâmica por perfil (LF-01)
- Sem `fact_doc_*_status_p2` / `fact_doc_*_status_p3` (LF-02)
- Sem `fact_*` para múltiplas fontes de renda por pessoa (RC-F5-38 + LF declarada em T5)

---

## §11 Documentos por finalidade

| Finalidade | Descrição | Tipos documentais esperados |
|---|---|---|
| `identificação` | Provar identidade de P1/P2/P3 | RG + CPF, CNH, passaporte |
| `residência` | Comprovar endereço atual | Conta de concessionária, contrato de aluguel, correspondência |
| `renda_principal` | Renda financiável principal declarada | Holerite, folha de pagamento, extrato de aposentadoria, IRPF |
| `renda_complementar` | Renda secundária ou parcialmente financiável | Extrato informal, extrato de pensão alimentícia (informativo), extrato de benefício não financiável |
| `renda_formal_autônomo` | Renda de autônomo formalizada via IRPF | Declaração IRPF + recibo |
| `renda_extrato` | Renda de autônomo sem IRPF — via extratos | 3 extratos bancários de movimentação |
| `histórico_vínculo` | Histórico de vínculo empregatício | CTPS completa |
| `fgts` | FGTS disponível para uso como entrada | Extrato FGTS |
| `composição_familiar_conjugal` | Estado civil e composição do processo | Certidão de casamento, certidão de óbito, certidão com averbação |
| `estado_civil` | Comprovação de estado civil | Certidão de casamento (com ou sem averbação), certidão de óbito do cônjuge |
| `regularização_restrição` | Comprovação de regularização de dívida/restrição | Comprovante de pagamento, extrato Registrato, regularização Receita |
| `dossiê_correspondente` | Documento compondo o dossiê para análise do banco | Conjunto consolidado dos itens acima |
| `visita_plantão` | Documento trazido presencialmente (visita/plantão) | Qualquer documento físico digitalizado no plantão |
| `informação_auxiliar` | Documento informativo — não comprobatório de renda | CNPJ, print bancário, declaração informal |

---

## §12 Regras de validade declarativa

Regras de validade aplicáveis sem exigir OCR ou automação. O LLM usa essas regras como
contexto para orientar o lead, sinalizar pendências e marcar observações no dossiê.

### 12.1 Prazo de documentos

| Documento | Prazo de validade declarativo |
|---|---|
| Holerite | Máximo 3 meses; holerite mais recente disponível |
| Extrato de aposentadoria | Máximo 3 meses |
| Extrato bancário de movimentação | Máximo 3 meses |
| Comprovante de residência | Máximo 3 meses (recomendado); correspondente pode questionar se maior |
| Extrato FGTS | Máximo 6 meses |
| Declaração IRPF | Último exercício declarado |
| Certidão de casamento | Sem prazo fixo; validade depende de não ter alteração de estado civil posterior |
| Certidão de óbito do cônjuge | Sem prazo fixo |
| Extrato Registrato | Recente (solicitado na etapa de regularização) |
| Comprovante de pagamento / acordo | Recente (comprovação de pagamento realizado) |

### 12.2 Legibilidade mínima declarada

Sem OCR, o critério de legibilidade é declarativo e operacional:

- **Legível:** arquivo abre, imagem tem resolução visível, texto não está cortado
- **Duvidoso:** imagem escura, parcialmente visível, ou com parte cortada → `classified_hypothesis` + sinalizar ao LLM
- **Ilegível:** arquivo não abre, imagem completamente ilegível, PDF corrompido → `rejected_unreadable`

O LLM não afirma que o documento é legível — apenas sinaliza que o arquivo foi recebido e
orienta o lead a garantir qualidade mínima.

### 12.3 Completude do dossiê mínimo

Para envio ao correspondente, o dossiê mínimo (RC-F5-20) exige, no mínimo:
- Identificação P1: estado `accepted_for_dossier`
- Residência P1: estado `accepted_for_dossier`
- Renda principal P1: estado `accepted_for_dossier` (ou `informational_only` com obs.)
- Composição identificada: P2/P3 com docs básicos quando aplicável

**O dossiê pode ser enviado com documentos em `pending_replacement` ou `needs_review` desde que:**
- O dossiê mínimo esteja preenchido
- A observação de pendência esteja registrada para o correspondente

**O dossiê NÃO pode ser declarado `completo` sem Bloco E de evidências (A00-ADENDO-03).**

---

## §13 Limites — OCR e classificação automática como lacuna futura

### 13.1 O que NÃO está disponível nesta PR (T6.3)

- **OCR automático de conteúdo** — extração automática de texto de imagem/PDF não é obrigatória
- **Classificação automática de tipo** — o sistema não classifica o documento sem contexto da conversa
- **Validação de autenticidade** — o sistema não verifica se o documento é autêntico ou foi adulterado
- **Extração automática de dados** — renda, CPF, nome, data não são extraídos automaticamente
- **Cruzamento automático de dados** — dados do documento não são cruzados automaticamente com o lead_state

### 13.2 Lacunas declaradas de schema

| # | LF | Dado ausente | Impacto |
|---|---|---|---|
| T6-LF-01 | Lista documental dinâmica por perfil/regime | Sem `fact_*` para lista dinâmica — herdado de LF-01 (F5) |
| T6-LF-02 | `fact_doc_*_status_p2` / `fact_doc_*_status_p3` | Docs de co-participantes sem `fact_*` canônico — herdado de LF-02 |
| T6-LF-03 | Estado documental persistido por documento | Sem schema de tabela de documentos no Supabase — futura PR T2/infra |
| T6-LF-04 | `fact_*` para múltiplas fontes de renda por pessoa | Sem `fact_*` canônico para multi-renda — declarado em RC-F5-38 |
| T6-LF-05 | OCR / extração automática de dados de documentos | Lacuna de automação — futura frente de IA documental |
| T6-LF-06 | Classificação automática de tipo de documento por visão computacional | Futura — não é requisito de T6.3 ou T6.4 |
| T6-LF-07 | Validação de autenticidade de documento | Futura — depende de integração com base de validação externa |

### 13.3 O que o sistema pode fazer hoje sem OCR

- **Registrar** que recebeu um arquivo (surface → `SurfaceEventNormalizado`)
- **Associar** ao lead via `lead_external_id`
- **Classificar hipótese** de tipo com base no contexto da conversa (o lead diz "estou enviando meu holerite")
- **Confirmar associação** com o lead via LLM
- **Marcar estado** inicial (`received` → `classified_hypothesis` → etc.)
- **Orientar** o lead sobre qualidade mínima, prazo e completude
- **Sinalizar pendências** sem bloquear automaticamente

---

## §14 Proibições absolutas

| Código | Proibição | Motivo |
|---|---|---|
| PROB-AD-01 | Documento não pode gerar `reply_text` diretamente | Soberania da fala é exclusiva do LLM — A00-ADENDO-01 |
| PROB-AD-02 | Documento não pode decidir `next_stage` ou avançar o funil | Canal não decide stage — A00-ADENDO-02 |
| PROB-AD-03 | Documento não pode aprovar ou reprovar o cliente | Aprovação é do correspondente, não do sistema documental |
| PROB-AD-04 | Documento ilegível não pode ser aceito como válido | Estado `rejected_unreadable` obrigatório |
| PROB-AD-05 | Documento sem dono claro não pode ser anexado ao dossiê como válido | Estado `needs_owner` obrigatório — associação é pré-requisito |
| PROB-AD-06 | Imagem/PDF não é verdade absoluta | OCR e automação são lacunas — não afirmar certeza de conteúdo |
| PROB-AD-07 | OCR não pode ser pré-requisito obrigatório do fluxo | OCR é lacuna futura — sistema opera sem OCR |
| PROB-AD-08 | Criar `fact_*` novo sem autorização de PR de T2 | Nenhum `fact_*` novo nesta PR |
| PROB-AD-09 | Criar `current_phase` novo | Valores de `current_phase` são canônicos em `T2_LEAD_STATE_V1.md §3.3` |
| PROB-AD-10 | Alterar regra comercial de T5 (RC-F5-*) | T6 consome T5; não a reescreve |
| PROB-AD-11 | Criar enum runtime, schema Supabase ou migration | Esta PR é declarativa — zero implementação técnica |
| PROB-AD-12 | Criar pipeline paralelo de resposta | "T6 não cria outro cérebro" — A00-ADENDO-02 |
| PROB-AD-13 | Mexer em `src/` | Implementação runtime fora de escopo |
| PROB-AD-14 | Abrir canal real (WhatsApp/Meta) | Canal real é PR-T6.9 |
| PROB-AD-15 | Avançar para PR-T6.4 dentro desta PR | Próxima PR autorizada é T6.4 — não misturar escopos |
| PROB-AD-16 | Tratar renda não financiável como financiável | Bolsa Família, BPC, seguro-desemprego, pensão alimentícia — nunca como renda principal |
| PROB-AD-17 | Somar rendas multi-regime sem discriminar fonte | Proibido por RC-F5-38 — cada fonte tem documento próprio |
| PROB-AD-18 | Declarar dossiê completo sem evidência real | Bloco E obrigatório para qualquer declaração de conclusão |

---

## §15 Riscos e mitigação

| # | Risco | Probabilidade | Impacto | Mitigação declarativa |
|---|---|---|---|---|
| R-AD-01 | Documento mal associado a pessoa errada (P2 como P1) | Alta | Alto | `needs_owner` obrigatório; LLM confirma com lead; proibido pressumir |
| R-AD-02 | Renda não financiável tratada como válida | Média | Alto | RC-F5-15 enforced; estado `informational_only` obrigatório; LLM orientado |
| R-AD-03 | OCR parcial tratado como verdade | Alta | Alto | OCR declarado como lacuna futura; proibido afirmar certeza sem confirmação |
| R-AD-04 | Dossiê mínimo declarado completo sem documentos | Média | Alto | Bloco E obrigatório; estado `accepted_for_dossier` exige processo completo |
| R-AD-05 | Documento ilegível aceito sem revisão | Alta | Médio | `rejected_unreadable` obrigatório; reenvio via `pending_replacement` |
| R-AD-06 | Multi-renda somada sem discriminar fonte | Média | Alto | RC-F5-38 enforced; proibição PROB-AD-17 explícita |
| R-AD-07 | Documento decidindo stage autonomamente | Baixa | Crítico | INV-SC-03 (surface) + PROB-AD-02 (docs) + B-T6-04 (bloqueio permanente) |
| R-AD-08 | Dossiê enviado sem documento civil correto (estado civil) | Média | Alto | §10 declara docs por estado civil; LLM orientado por AT-01/03 |
| R-AD-09 | PDF protegido com senha bloqueando análise | Alta | Médio | `rejected_unreadable`; orientar reenvio sem senha |
| R-AD-10 | Comprovante de residência vencido aceito | Média | Médio | Regra de prazo §12.1; LLM sinaliza; não bloqueia automaticamente mas registra |

---

## §16 Critérios de aceite da PR-T6.3

A PR-T6.3 está pronta quando todos os critérios abaixo forem atendidos:

| # | Critério | Status |
|---|---|---|
| CA-T6.3-01 | `T6_CONTRATO_ANEXOS_DOCUMENTOS.md` existe no repositório | ✅ |
| CA-T6.3-02 | Tipos documentais aceitos declarados (§6, mín. 20 tipos) | ✅ |
| CA-T6.3-03 | Tipos não comprobatórios/rejeitados declarados (§7) | ✅ |
| CA-T6.3-04 | Estados documentais declarados (§8, mín. 10 estados) | ✅ |
| CA-T6.3-05 | Associação P1/P2/P3 definida (§9) | ✅ |
| CA-T6.3-06 | Documentos por perfil/regime definidos (§10, mín. 15 perfis) | ✅ |
| CA-T6.3-07 | Documentos por finalidade definidos (§11, mín. 10 finalidades) | ✅ |
| CA-T6.3-08 | Regras de validade declarativa declaradas (§12) | ✅ |
| CA-T6.3-09 | OCR/classificação automática declarada como lacuna futura (§13) | ✅ |
| CA-T6.3-10 | 18 proibições absolutas declaradas (§14) | ✅ |
| CA-T6.3-11 | Documento não cria `reply_text` | ✅ |
| CA-T6.3-12 | Documento não cria `fact_*` | ✅ |
| CA-T6.3-13 | Documento não cria `current_phase` | ✅ |
| CA-T6.3-14 | Documento não decide stage | ✅ |
| CA-T6.3-15 | Zero `src/` tocado | ✅ |
| CA-T6.3-16 | Zero runtime / migration / Supabase | ✅ |
| CA-T6.3-17 | Zero canal real aberto | ✅ |
| CA-T6.3-18 | Próxima PR autorizada declarada como PR-T6.4 | ✅ |
| CA-T6.3-19 | A00-ADENDO-01/02/03 declarados conformes | ✅ |
| CA-T6.3-20 | Bloco E presente em §19 | ✅ |

---

## §17 Provas obrigatórias

| # | Prova | Tipo |
|---|---|---|
| P-AD-01 | Arquivo `T6_CONTRATO_ANEXOS_DOCUMENTOS.md` existe e está no diff da PR | Documental |
| P-AD-02 | Nenhum arquivo em `src/` foi modificado | Git diff |
| P-AD-03 | Nenhum `fact_*` novo foi criado nesta PR | Inspeção textual |
| P-AD-04 | Nenhum `current_phase` novo foi criado | Inspeção textual |
| P-AD-05 | Nenhuma migration Supabase foi adicionada | Git diff |
| P-AD-06 | Nenhum `reply_text` é produzido por lógica neste artefato | Inspeção textual |
| P-AD-07 | CONTRATO_IMPLANTACAO_MACRO_T6.md atualizado (próxima: PR-T6.4) | Git diff |
| P-AD-08 | _INDEX.md atualizado com sync PR-T6.3 | Git diff |
| P-AD-09 | STATUS.md atualizado com ultima tarefa PR-T6.3 | Git diff |
| P-AD-10 | LATEST.md atualizado com seção PR-T6.3 | Git diff |
| P-AD-11 | A00-ADENDO-01: nenhuma surface produz reply_text | Declaração §14 PROB-AD-01 |
| P-AD-12 | A00-ADENDO-02: T6 não cria outro cérebro | Declaração §3 + PROB-AD-12 |
| P-AD-13 | A00-ADENDO-03: Bloco E presente | §19 abaixo |
| P-AD-14 | RC-F5-38 referenciada e aplicada (multi-renda) | §9.3 + §10 |
| P-AD-15 | AT-01/03 referenciados (estado civil / separado sem averbação) | §9.4 |
| P-AD-16 | PR-T6.2 pré-requisito verificado (merged #127) | Git / GitHub |
| P-AD-17 | Lacunas de schema declaradas explicitamente (§13.2) | Textual |
| P-AD-18 | Critérios de aceite CA-T6.3-01..20 todos ✅ | §16 |
| P-AD-19 | Regra-mãe canônica declarada (§1 + §3) | Textual |
| P-AD-20 | Relação com T6_SURFACE_CANAL declarada (§4) | Textual |
| P-AD-21 | Relação com F5/dossiê declarada (§5) | Textual |
| P-AD-22 | 11 estados documentais com transições (§8) | Textual |
| P-AD-23 | 18 proibições absolutas PROB-AD-01..18 declaradas | §14 |

---

## §18 Próxima PR autorizada

**PR-T6.4 — Pipeline de imagem / PDF / documento**

PR-T6.4 recebe este contrato (T6.3) como base e declara o pipeline técnico conceitual para:
- Como a surface entrega `SurfaceEventNormalizado` com `input_type = document` ao T4
- Como o T4/LLM processa o contexto do documento recebido
- Como o documento transita pelos estados documentais declarados neste artefato
- Como o documento é associado ao perfil/regime e à pessoa correta
- Como o LLM orienta o lead na coleta documental sem produzir fala mecânica
- Limites de automação (sem OCR obrigatório, sem classificação automática obrigatória)
- Relação com o dossiê operacional (PR-T6.8)

**PR-T6.4 não pode abrir sem PR-T6.3 merged.**

---

## §19 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---

Documento-base da evidência:
  schema/implantation/T6_CONTRATO_ANEXOS_DOCUMENTOS.md (este artefato)

Estado da evidência:
  completa

Há lacuna remanescente?:
  não — lacunas declaradas explicitamente em §13 são lacunas planejadas (LF futuras),
  não bloqueantes desta PR; nenhuma lacuna não declarada identificada.

Há item parcial/inconclusivo bloqueante?:
  não — todos os critérios de aceite CA-T6.3-01..20 estão ✅

Fechamento permitido nesta PR?:
  sim — todos os critérios satisfeitos; artefato completo; zero violações de adendo

Estado permitido após esta PR:
  PR-T6.3 encerrada — PR-T6.4 desbloqueada

Próxima PR autorizada:
  PR-T6.4 — Pipeline de imagem/PDF/documento

--- FIM BLOCO E ---
```

### Evidências consolidadas (23 provas)

| # | Prova | Verificação |
|---|---|---|
| 1 | `T6_CONTRATO_ANEXOS_DOCUMENTOS.md` criado | git diff HEAD |
| 2 | Zero `src/` | git diff HEAD — sem arquivos em src/ |
| 3 | Zero `fact_*` novo | inspeção textual — nenhuma chave nova declarada |
| 4 | Zero `current_phase` novo | inspeção textual — nenhum valor novo |
| 5 | Zero migration Supabase | git diff HEAD — sem arquivos .sql |
| 6 | Zero `reply_text` produzido | inspeção — nenhum campo reply_text neste artefato |
| 7 | Zero canal real aberto | declaração §14 PROB-AD-14 + git diff |
| 8 | PR-T6.2 merged verificado | #127 merged 2026-04-28T19:19:31Z |
| 9 | §6: 35+ tipos documentais aceitos declarados | contagem de linhas §6.1–6.11 |
| 10 | §7: tipos rejeitados e não comprobatórios declarados | §7.1 + §7.2 |
| 11 | §8: 11 estados documentais + transições declarados | §8.1 + §8.2 |
| 12 | §9: associação P1/P2/P3 + multi-renda + estado civil | §9.1–9.4 |
| 13 | §10: 18 perfis/regimes com docs definidos | tabela §10 |
| 14 | §11: 14 finalidades documentais declaradas | tabela §11 |
| 15 | §12: regras de validade declarativa (prazo + legibilidade + completude) | §12.1–12.3 |
| 16 | §13: OCR e automação declarados como lacunas futuras | §13.1–13.3 |
| 17 | §14: 18 proibições absolutas PROB-AD-01..18 | §14 |
| 18 | §15: 10 riscos com mitigação declarados | §15 |
| 19 | §16: 20 critérios de aceite todos ✅ | §16 |
| 20 | A00-ADENDO-01 conforme | PROB-AD-01 + §3.1 |
| 21 | A00-ADENDO-02 conforme | PROB-AD-12 + §3 regra-mãe |
| 22 | A00-ADENDO-03 conforme | §19 Bloco E |
| 23 | RC-F5-38 (multi-renda/multi-regime) referenciada e aplicada | §9.3 + §10 |

---

*Artefato gerado em 2026-04-28 — PR-T6.3 — ENOVA 2 / LLM-FIRST*
*Conformidade: A00-ADENDO-01 ✅ A00-ADENDO-02 ✅ A00-ADENDO-03 ✅*
*Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`*
