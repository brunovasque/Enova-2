# T6_SUITE_TESTES_MULTICANAL — Suite Declarativa de Testes/Sandbox Multicanal — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.9 |
| Branch | feat/t6-pr-t6-9-suite-testes-sandbox |
| Artefato | Suite declarativa de testes/sandbox multicanal T6.2–T6.8 |
| Status | entregue |
| Pré-requisito | PR-T6.8 merged (#133 — 2026-04-28T22:52:48Z); T6_DOSSIE_OPERACIONAL.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.R — Readiness/Closeout G6 |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Esta suite declarativa valida, por cenário, que toda a governança multicanal da T6 (T6.2–T6.8)
se comporta em conformidade com os princípios LLM-first da ENOVA 2.

**48 cenários declarativos** organizados em 8 grupos (A–H) cobrem:
texto puro, imagem/PDF/documento, áudio, sticker/mídia inútil, adapter Meta/WhatsApp,
dossiê/correspondente, aprovação→visita e reprovação→orientação, e regressão T1–T5.

Esta suite **não executa runtime**. Não abre WhatsApp real. Não cria sandbox real.
É uma matriz declarativa de validação para preparar o caminho para PR-T6.R / G6.

---

## §2 Finalidade da suite

A suite serve para:

1. **Confirmar cobertura** — que nenhum artefato T6.2–T6.8 tem lacuna de governança não testada.
2. **Definir critérios verificáveis** — cada cenário tem `resultado_esperado` e `falha_se`.
3. **Bloquear PR-T6.R** se qualquer bloqueante declarado nesta suite não estiver satisfeito.
4. **Registrar invariantes** — as regras de soberania da IA que nunca podem ser violadas.
5. **Preparar o revisor** — quem revisar PR-T6.R tem uma lista de o que verificar.

---

## §3 Princípio central

> **Teste valida governança — não cria runtime.**

- Esta suite é declarativa: descreve o que deve acontecer, não executa o que deve acontecer.
- Nenhum cenário desta suite cria `reply_text`, `fact_*`, `current_phase`, stage ou decisão.
- Nenhum cenário abre canal real, sandbox real ou runtime real.
- O sistema real que implementar T6 deve passar por todos os cenários desta suite como
  condição de aceite antes de PR-T6.R.

---

## §4 Relação com T6.2–T6.8

| Artefato | O que a suite valida |
|---|---|
| T6.2 — Surface única de canal | `SurfaceEventNormalizado` correto por tipo de entrada; canal nunca escreve `reply_text` |
| T6.3 — Contrato de anexos | Documento sempre associado a pessoa (P1/P2/P3); estado documental correto |
| T6.4 — Pipeline imagem/PDF | Classificação hipotética; OCR como lacuna; ilegível/corrompido tratado |
| T6.5 — Áudio conversacional | STT como lacuna T6-LA-01; confiança declarada; fato crítico pede confirmação |
| T6.6 — Sticker/mídia inútil | Sujeira não quebra funil; canal não confirma dado por emoji/sticker |
| T6.7 — Adapter Meta/WhatsApp | Idempotência; dedupe; retry sem duplicar; assinatura inválida rejeitada |
| T6.8 — Dossiê operacional | Estado correto; pendência bloqueia envio; condicionado → cliente vê "aprovado" |

---

## §5 Relação com T4/T3/T2/T5

| Componente | Invariante verificada pela suite |
|---|---|
| T4 — Entrada/Pipeline/Validação/Resposta | Toda entrada de canal passa pelo T4; resposta só vem do LLM |
| T3 — Policy engine / veto | Veto suave aplicado; nenhuma superfície de canal bypassa T3 |
| T2 — lead_state / confiança | Estado do lead só muda via T2; canal não muda `lead_state` diretamente |
| T5 — Funil/docs/visita/handoff | Visita via T5; dossiê completo segue T5; handoff de leads segue T5 |

---

## §6 Matriz de cobertura

| # | Artefato / Componente | Grupos cobrindo | Cenários mínimos | Status |
|---|---|---|---|---|
| 1 | T6.2 Surface única | A, D, E | 5 | declarado |
| 2 | T6.3 Contrato de anexos | B, F | 8 | declarado |
| 3 | T6.4 Pipeline imagem/PDF | B | 8 | declarado |
| 4 | T6.5 Áudio | C | 6 | declarado |
| 5 | T6.6 Sticker/mídia inútil | D | 6 | declarado |
| 6 | T6.7 Adapter Meta/WhatsApp | E | 6 | declarado |
| 7 | T6.8 Dossiê operacional | F, G | 8 | declarado |
| 8 | T4 Entrada/Pipeline/Resposta | H | 2 | declarado |
| 9 | T3 Policy/veto | H | 1 | declarado |
| 10 | T2 lead_state/confiança | H | 1 | declarado |
| 11 | T5 docs/visita/handoff | G, H | 4 | declarado |
| **TOTAL** | | **A–H** | **≥ 48** | **declarado** |

---

## §7 Critérios globais de PASS/FAIL

### Um cenário PASSA somente se:

- PF-01: não cria `reply_text` fora do LLM;
- PF-02: não cria `fact_*` novo;
- PF-03: não cria `current_phase` novo;
- PF-04: não decide stage no canal;
- PF-05: não cria runtime;
- PF-06: não altera T1/T2/T3/T4/T5 diretamente;
- PF-07: respeita governança T6.2–T6.8;
- PF-08: respeita T5 para docs/visita/handoff;
- PF-09: mantém dossiê/correspondente como organização, não decisão;
- PF-10: registra pendência quando não há segurança para avançar.

### Um cenário FALHA se:

- FL-01: mídia avança stage sozinha;
- FL-02: documento vira verdade absoluta sem validação T4;
- FL-03: áudio confirma fato crítico sem validação T4/T3/T2;
- FL-04: sticker ou emoji confirma dado crítico;
- FL-05: adapter cria `reply_text` ou fala ao cliente;
- FL-06: dossiê incompleto é enviado ao correspondente;
- FL-07: aprovado condicionado é exposto ao cliente como "condicionado";
- FL-08: valor de restrição (SCR/SPC/Serasa) é exposto ao cliente;
- FL-09: parcela estimada é apresentada como simulação oficial;
- FL-10: benefício não financiável (Bolsa Família, BPC/LOAS etc.) vira renda financiável;
- FL-11: CNPJ isolado vira renda financiável;
- FL-12: qualquer artefato T6 cria `reply_text` diretamente.

---

## §8 Invariantes obrigatórias

As invariantes abaixo devem ser verificadas em **todos os grupos**:

| ID | Invariante | Fonte |
|---|---|---|
| INV-01 | `reply_text` só é produzido pelo LLM (T4) | A00-ADENDO-01 |
| INV-02 | Canal não decide stage do lead | A00-ADENDO-02 |
| INV-03 | Mídia não avança funil sozinha | T6.2 §invariantes |
| INV-04 | Adapter não cria turno conversacional | T6.7 INV-AD-01 |
| INV-05 | Documento é hipótese até validação T4 | T6.4 §3 |
| INV-06 | Áudio ruim não bloqueia o sistema — registra fallback | T6.5 §7 |
| INV-07 | Sticker/emoji nunca confirma dado crítico | T6.6 §3 |
| INV-08 | Dossiê incompleto nunca enviado | T6.8 ENV-01 |
| INV-09 | Aprovado condicionado → cliente vê apenas "aprovado" | T6.8 RET-03 |
| INV-10 | Benefício assistencial nunca classificado como financiável | T6.8 §10 |
| INV-11 | Retry da Meta não cria novo turno | T6.7 IDP-01 |
| INV-12 | Assinatura inválida nunca entra no pipeline | T6.7 SIG-01 |
| INV-13 | Restrição (valor) nunca exposta ao cliente | T6.8 REP-02 |

---

## §9 Formato de cenário declarativo

Cada cenário tem o seguinte shape:

```
scenario_id      — identificador único (ex.: A-01)
grupo            — letra do grupo (A–H)
nome             — título descritivo
entrada          — o que chega ao sistema
precondicoes     — estado do lead/dossiê antes da entrada
artefatos_cobertos — quais artefatos T6/T4/T3/T2/T5 são exercitados
resultado_esperado — o que o sistema DEVE fazer (declarativo)
invariantes_verificadas — quais INV-0X são exercitadas
deve_passar      — sim | não (cenário de falha esperada)
falha_se         — condição FL-XX que tornaria o cenário inválido
observacoes      — contexto adicional
```

---

## §10 Grupo A — Texto puro (5 cenários)

### A-01 — Resposta direta ao stage atual

| Campo | Valor |
|---|---|
| scenario_id | A-01 |
| grupo | A |
| nome | Resposta direta ao stage atual |
| entrada | Mensagem de texto: "Minha renda é R$ 3.200 por mês, sou CLT" |
| precondicoes | Lead ativo; stage = coleta_renda; turno aberto no T4 |
| artefatos_cobertos | T6.2 (surface), T4 (pipeline), T3 (policy), T2 (lead_state) |
| resultado_esperado | T6.2 normaliza como `input_type=text`; T4 processa; LLM extrai candidato a renda; T3/T2 validam antes de persistir; `reply_text` vem exclusivamente do LLM |
| invariantes_verificadas | INV-01, INV-02, INV-03 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-12 |
| observacoes | Texto direto e no contexto — caminho feliz do funil |

### A-02 — Dúvida no meio do funil

| Campo | Valor |
|---|---|
| scenario_id | A-02 |
| grupo | A |
| nome | Dúvida no meio do funil |
| entrada | Mensagem de texto: "Mas eu preciso ter conta na Caixa?" |
| precondicoes | Lead ativo; stage = coleta_documentos; turno aberto |
| artefatos_cobertos | T6.2, T4, T3, T2 |
| resultado_esperado | Surface normaliza como texto; T4 identifica como dúvida (não resposta ao stage); LLM responde a dúvida sem avançar stage; stage permanece inalterado; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-02 |
| deve_passar | sim |
| falha_se | FL-01, FL-04 |
| observacoes | Dúvida lateral não deve avançar stage — teste de estabilidade do funil |

### A-03 — Objeção comercial

| Campo | Valor |
|---|---|
| scenario_id | A-03 |
| grupo | A |
| nome | Objeção comercial |
| entrada | Mensagem de texto: "Achei a parcela muito alta, não quero mais" |
| precondicoes | Lead ativo; stage = proposta_apresentada; turno aberto |
| artefatos_cobertos | T6.2, T4, T3 (veto suave), T2 |
| resultado_esperado | Surface normaliza como texto; T4 identifica objeção; T3 avalia conduta (não forçar avanço); LLM responde acolhendo objeção; stage não regride mecanicamente; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-02 |
| deve_passar | sim |
| falha_se | FL-01, FL-04, FL-09 |
| observacoes | Objeção não pode gerar parcela como simulação oficial |

### A-04 — Correção de informação anterior

| Campo | Valor |
|---|---|
| scenario_id | A-04 |
| grupo | A |
| nome | Correção de informação anterior |
| entrada | Mensagem de texto: "Errei antes — minha renda é R$ 2.800, não R$ 3.200" |
| precondicoes | Lead ativo; renda anterior já capturada como candidato; stage = revisao_dados |
| artefatos_cobertos | T6.2, T4, T2 (reconciliação) |
| resultado_esperado | Surface normaliza como texto; T4 identifica correção; T2 registra conflito/revisão; LLM pede confirmação antes de atualizar; `reply_text` vem do LLM; valor anterior não é sobrescrito mecanicamente |
| invariantes_verificadas | INV-01, INV-02 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-04 |
| observacoes | Correção precisa de confirmação — não pode atualizar `fact_*` diretamente |

### A-05 — Mensagem fora de contexto

| Campo | Valor |
|---|---|
| scenario_id | A-05 |
| grupo | A |
| nome | Mensagem fora de contexto |
| entrada | Mensagem de texto: "Boa tarde! Tudo bem?" |
| precondicoes | Lead ativo; stage = coleta_documentos |
| artefatos_cobertos | T6.2, T4, T3, T2 |
| resultado_esperado | Surface normaliza como texto; T4 identifica mensagem como fora do stage atual; LLM responde cordialmente e redireciona para o contexto do funil; stage inalterado; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-02, INV-03 |
| deve_passar | sim |
| falha_se | FL-01, FL-04 |
| observacoes | Mensagem social não avança nem recua funil |

---

## §11 Grupo B — Imagem/PDF/documento (8 cenários)

### B-01 — RG/CNH legível

| Campo | Valor |
|---|---|
| scenario_id | B-01 |
| grupo | B |
| nome | RG/CNH legível enviado |
| entrada | Imagem de documento de identificação (RG ou CNH, legível) |
| precondicoes | Lead ativo; stage = coleta_documentos; P1 definido |
| artefatos_cobertos | T6.2, T6.3, T6.4, T4 |
| resultado_esperado | T6.2 normaliza como `input_type=image`; T6.4 classifica como identificação hipotética (aguarda OCR como T6-LA-01); T6.3 associa a P1; estado documental = `received → classified_hypothesis`; `reply_text` vem do LLM confirmando recebimento |
| invariantes_verificadas | INV-01, INV-02, INV-03, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-04 |
| observacoes | OCR é lacuna T6-LA-01 — classificação é hipotética, não definitiva |

### B-02 — Comprovante de residência

| Campo | Valor |
|---|---|
| scenario_id | B-02 |
| grupo | B |
| nome | Comprovante de residência enviado |
| entrada | PDF de conta de luz (formato legível) |
| precondicoes | Lead ativo; stage = coleta_documentos; P1 definido |
| artefatos_cobertos | T6.2, T6.3, T6.4, T4 |
| resultado_esperado | T6.2 normaliza como `input_type=document/pdf`; T6.4 classifica como comprovante hipotético; T6.3 associa a P1; estado = `classified_hypothesis`; LLM confirma recebimento e informa próxima pendência |
| invariantes_verificadas | INV-01, INV-02, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Validade declarativa verificada (prazo de emissão como hipótese) |

### B-03 — Holerite válido

| Campo | Valor |
|---|---|
| scenario_id | B-03 |
| grupo | B |
| nome | Holerite válido enviado |
| entrada | Imagem de holerite do mês atual, legível |
| precondicoes | Lead CLT; stage = coleta_documentos; P1 definido; renda informada como texto |
| artefatos_cobertos | T6.2, T6.3, T6.4, T4 |
| resultado_esperado | Normalizado como imagem; classificado como renda hipotética; associado a P1; estado = `classified_hypothesis`; LLM solicita confirmação de valor se divergir da renda informada |
| invariantes_verificadas | INV-01, INV-02, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-12 |
| observacoes | Holerite é hipótese — não confirma renda automaticamente |

### B-04 — Holerite antigo (vencido)

| Campo | Valor |
|---|---|
| scenario_id | B-04 |
| grupo | B |
| nome | Holerite antigo enviado |
| entrada | Imagem de holerite com mais de 3 meses |
| precondicoes | Lead CLT; stage = coleta_documentos; P1 definido |
| artefatos_cobertos | T6.2, T6.3, T6.4, T4 |
| resultado_esperado | Classificado como hipotético com flag `validade_duvidosa`; estado = `expired_or_outdated` (hipótese); LLM informa que precisa de documento mais recente; stage não avança |
| invariantes_verificadas | INV-01, INV-02, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Vencido é pendência — não bloqueia sistema, bloqueia o dossiê |

### B-05 — PDF protegido por senha

| Campo | Valor |
|---|---|
| scenario_id | B-05 |
| grupo | B |
| nome | PDF protegido por senha |
| entrada | PDF com senha (não abre) |
| precondicoes | Lead ativo; stage = coleta_documentos |
| artefatos_cobertos | T6.2, T6.4, T4 |
| resultado_esperado | T6.4 detecta PDF protegido (caso problemático PP-07); flag `pdf_protegido=true`; estado = `rejected_unreadable` (hipótese); LLM informa que não conseguiu ler e pede versão sem senha; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-05, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Documento inválido não bloqueia sistema — gera pendência |

### B-06 — Imagem ilegível

| Campo | Valor |
|---|---|
| scenario_id | B-06 |
| grupo | B |
| nome | Imagem ilegível (fotografia tremida/escura) |
| entrada | Imagem desfocada de documento, conteúdo não identificável |
| precondicoes | Lead ativo; stage = coleta_documentos |
| artefatos_cobertos | T6.2, T6.4, T6.6, T4 |
| resultado_esperado | T6.4 detecta ilegibilidade; estado = `rejected_unreadable`; LLM pede reenvio com foto melhor; `reply_text` vem do LLM; sistema não trava |
| invariantes_verificadas | INV-01, INV-05, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Ilegibilidade não deve travar o funil — apenas registrar pendência |

### B-07 — Documento sem dono claro

| Campo | Valor |
|---|---|
| scenario_id | B-07 |
| grupo | B |
| nome | Documento enviado sem pessoa associada clara |
| entrada | Imagem de holerite de nome diferente do lead principal |
| precondicoes | Lead ativo; composição = casal (P1 + P2); P2 ainda não declarado |
| artefatos_cobertos | T6.2, T6.3, T6.4, T4 |
| resultado_esperado | T6.3 detecta estado `needs_owner`; T6.4 não associa automaticamente a P1; LLM pergunta de quem é o documento; stage não avança até dono definido |
| invariantes_verificadas | INV-01, INV-02, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-04 |
| observacoes | Documento sem dono é bloqueante para o dossiê — não para o sistema |

### B-08 — Documento duplicado

| Campo | Valor |
|---|---|
| scenario_id | B-08 |
| grupo | B |
| nome | Documento duplicado enviado |
| entrada | Segunda imagem do mesmo RG já recebido |
| precondicoes | Lead ativo; RG de P1 já no estado `accepted_for_dossier` |
| artefatos_cobertos | T6.2, T6.3, T6.4, T4 |
| resultado_esperado | T6.3 detecta duplicidade; estado = `duplicate`; não substitui o original; LLM informa recebimento mas confirma que já tem o documento; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Duplicata não deve criar confusão no dossiê |

---

## §12 Grupo C — Áudio (6 cenários)

### C-01 — Áudio claro respondendo stage atual

| Campo | Valor |
|---|---|
| scenario_id | C-01 |
| grupo | C |
| nome | Áudio claro respondendo stage |
| entrada | Mensagem de voz com qualidade boa, conteúdo: "Sou servidor público federal, minha renda é R$ 4.500" |
| precondicoes | Lead ativo; stage = coleta_renda; STT como lacuna T6-LA-01 |
| artefatos_cobertos | T6.2, T6.5, T4, T3, T2 |
| resultado_esperado | T6.2 normaliza como `input_type=audio`; T6.5 declara `transcript_text=null` (lacuna T6-LA-01); LLM recebe referência e solicita confirmação textual da informação; stage não avança sem confirmação; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-02, INV-03, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-03, FL-04 |
| observacoes | STT é lacuna — sistema continua sem transcrição automática |

### C-02 — Áudio com informação de renda e regime críticos

| Campo | Valor |
|---|---|
| scenario_id | C-02 |
| grupo | C |
| nome | Áudio com informação crítica de renda/regime |
| entrada | Áudio: "Tenho CNPJ mas minha renda principal é como autônomo" |
| precondicoes | Lead ativo; regime não definido ainda |
| artefatos_cobertos | T6.2, T6.5, T4, T3 |
| resultado_esperado | T6.5 trata como informação crítica (regime/renda — lista de 14 críticos); LLM não confirma regime com base apenas em áudio; pede confirmação textual explícita; stage inalterado até confirmação |
| invariantes_verificadas | INV-01, INV-02, INV-03, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-03, FL-04 |
| observacoes | Regime/renda são informações críticas que exigem confirmação dupla |

### C-03 — Áudio ruim/inaudível

| Campo | Valor |
|---|---|
| scenario_id | C-03 |
| grupo | C |
| nome | Áudio ruim ou inaudível |
| entrada | Mensagem de voz com ruído extremo, ininteligível |
| precondicoes | Lead ativo; stage = coleta_renda |
| artefatos_cobertos | T6.2, T6.5, T4 |
| resultado_esperado | T6.5 classifica confiança como `audio_poor` ou `audio_unavailable`; `transcript_text=null`; sistema não trava; LLM pede reenvio ou resposta por texto; stage inalterado |
| invariantes_verificadas | INV-01, INV-02, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-03, FL-04 |
| observacoes | Áudio ruim nunca bloqueia o sistema — registra fallback |

### C-04 — Áudio com múltiplas informações

| Campo | Valor |
|---|---|
| scenario_id | C-04 |
| grupo | C |
| nome | Áudio com múltiplas informações simultâneas |
| entrada | Áudio longo: "Tenho dois empregos, sou CLT e autônomo, renda total é R$ 7.000, moro em São Paulo, sou casado" |
| precondicoes | Lead ativo; stage = coleta_renda |
| artefatos_cobertos | T6.2, T6.5, T4, T3, T2 |
| resultado_esperado | T6.5 registra como multi-informação em áudio; `transcript_text=null` (lacuna STT); LLM solicita confirmação de cada informação separadamente em texto; nenhuma informação vira `fact_*` antes de confirmação |
| invariantes_verificadas | INV-01, INV-02, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-03 |
| observacoes | Multi-renda exige tratamento RC-F5-38 — mas não confirma por áudio |

### C-05 — Áudio contraditório com dado anterior

| Campo | Valor |
|---|---|
| scenario_id | C-05 |
| grupo | C |
| nome | Áudio contraditório com texto anterior |
| entrada | Áudio: "Na verdade sou autônomo, não sou CLT" (regime anterior = CLT por texto) |
| precondicoes | Lead com regime CLT registrado como candidato; stage = revisao_dados |
| artefatos_cobertos | T6.2, T6.5, T4, T2 |
| resultado_esperado | T6.5 flag `conflicting` na confiança; T2 registra conflito; LLM solicita confirmação textual antes de qualquer alteração; regime anterior não é sobrescrito por áudio |
| invariantes_verificadas | INV-01, INV-02, INV-03, INV-06 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-03 |
| observacoes | Conflito áudio vs. texto sempre pede confirmação textual |

### C-06 — Áudio de terceiro (não é o lead)

| Campo | Valor |
|---|---|
| scenario_id | C-06 |
| grupo | C |
| nome | Áudio de terceiro (cônjuge ou familiar fala pelo lead) |
| entrada | Áudio: "Oi, sou a esposa, o meu marido tem renda de R$ 5.000" |
| precondicoes | Lead ativo; composição = individual (P1 apenas) |
| artefatos_cobertos | T6.2, T6.5, T4, T3 |
| resultado_esperado | T6.5 registra `audio_warnings` com indício de terceiro; LLM não aceita informação de renda de terceiro sem confirmação do lead; `reply_text` solicita confirmação direta do titular |
| invariantes_verificadas | INV-01, INV-02, INV-03 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-03 |
| observacoes | Dados fornecidos por terceiro não podem ser aceitos sem confirmação do titular |

---

## §13 Grupo D — Sticker/mídia inútil (6 cenários)

### D-01 — Sticker isolado

| Campo | Valor |
|---|---|
| scenario_id | D-01 |
| grupo | D |
| nome | Sticker isolado enviado no contexto do funil |
| entrada | Sticker animado (sem texto, sem contexto) |
| precondicoes | Lead ativo; stage = coleta_documentos |
| artefatos_cobertos | T6.2, T6.6, T4 |
| resultado_esperado | T6.6 classifica `utility_classification=inútil`; nenhum risco_flag crítico ativo; LLM pode responder com leveza e redirecionar; stage inalterado; sticker nunca confirma nada |
| invariantes_verificadas | INV-01, INV-02, INV-07 |
| deve_passar | sim |
| falha_se | FL-01, FL-04, FL-12 |
| observacoes | Sticker = sujeira de canal; nunca avança funil |

### D-02 — Emoji isolado como resposta a pergunta binária

| Campo | Valor |
|---|---|
| scenario_id | D-02 |
| grupo | D |
| nome | Emoji isolado como suposta confirmação |
| entrada | "👍" enviado após LLM perguntar "Você confirma que sua renda é R$ 3.200?" |
| precondicoes | LLM aguardando confirmação textual de dado crítico |
| artefatos_cobertos | T6.2, T6.6, T4, T3 |
| resultado_esperado | T6.6 classifica como `ambígua` com `risk_flags=[RISCO-01: confirmação fraca]`; LLM não aceita emoji como confirmação de dado crítico; solicita confirmação textual explícita; dado não persiste |
| invariantes_verificadas | INV-01, INV-02, INV-07 |
| deve_passar | sim |
| falha_se | FL-01, FL-04, FL-12 |
| observacoes | Emoji 👍 não pode confirmar renda, regime, estado civil ou CPF |

### D-03 — Reação a mensagem do atendente

| Campo | Valor |
|---|---|
| scenario_id | D-03 |
| grupo | D |
| nome | Reação emoji a mensagem anterior |
| entrada | Evento de reação (❤️ ou 😂) na mensagem do atendente |
| precondicoes | Lead ativo; stage = coleta_renda |
| artefatos_cobertos | T6.2, T6.6, T4 |
| resultado_esperado | T6.2 normaliza como `input_type=system_event` (evento de reação); T6.6 classifica como `inútil`; nenhum turno criado; stage inalterado; sistema não responde nem avança |
| invariantes_verificadas | INV-01, INV-02, INV-04, INV-07 |
| deve_passar | sim |
| falha_se | FL-01, FL-04, FL-12 |
| observacoes | Reação é evento técnico de canal — não é mensagem conversacional |

### D-04 — Mensagem vazia ou apenas espaço

| Campo | Valor |
|---|---|
| scenario_id | D-04 |
| grupo | D |
| nome | Mensagem vazia enviada |
| entrada | Mensagem com apenas espaço ou string vazia |
| precondicoes | Lead ativo; stage = coleta_documentos |
| artefatos_cobertos | T6.2, T6.6, T4 |
| resultado_esperado | T6.6 classifica como `inválida`; `utility_classification=inválida`; LLM pode ignorar ou pedir nova mensagem; stage inalterado |
| invariantes_verificadas | INV-01, INV-02, INV-07 |
| deve_passar | sim |
| falha_se | FL-01, FL-04 |
| observacoes | Mensagem vazia não trava sistema — registra e aguarda |

### D-05 — Print confuso (tela de aplicativo, screenshot de conversa)

| Campo | Valor |
|---|---|
| scenario_id | D-05 |
| grupo | D |
| nome | Print de tela confuso enviado |
| entrada | Screenshot de conversa de WhatsApp ou tela de aplicativo bancário |
| precondicoes | Lead ativo; stage = coleta_documentos |
| artefatos_cobertos | T6.2, T6.4, T6.6, T4 |
| resultado_esperado | T6.6 classifica como imagem sem documento (`utility_classification=ambígua`, `risk_flags=[RISCO-02: confusão documental]`); LLM informa que não conseguiu identificar documento e pede o documento original; stage inalterado |
| invariantes_verificadas | INV-01, INV-02, INV-05, INV-07 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-04 |
| observacoes | Print confuso não vira documento — sempre registra incerteza |

### D-06 — Mídia repetida (mesmo arquivo duas vezes)

| Campo | Valor |
|---|---|
| scenario_id | D-06 |
| grupo | D |
| nome | Mesma mídia enviada duas vezes em sequência |
| entrada | Segundo envio do mesmo sticker ou imagem já recebida |
| precondicoes | Lead ativo; arquivo já registrado |
| artefatos_cobertos | T6.2, T6.6, T6.7, T4 |
| resultado_esperado | T6.6 classifica como `repetida`; T6.7 dedupe_key detecta duplicidade (se mesmo wa_message_id ou payload_hash); segunda entrada descartada; nenhum novo turno criado |
| invariantes_verificadas | INV-01, INV-04, INV-11 |
| deve_passar | sim |
| falha_se | FL-01, FL-04, FL-12 |
| observacoes | Mídia repetida não cria estado novo |

---

## §14 Grupo E — Adapter Meta/WhatsApp (6 cenários)

### E-01 — Webhook inbound válido

| Campo | Valor |
|---|---|
| scenario_id | E-01 |
| grupo | E |
| nome | Mensagem inbound válida com assinatura correta |
| entrada | POST do Meta com X-Hub-Signature-256 válida e payload de mensagem de texto |
| precondicoes | Adapter ativo; META_APP_SECRET conceitual definido; SIG válida |
| artefatos_cobertos | T6.7, T6.2, T4 |
| resultado_esperado | SIG validada (SIG-01); `AdapterEventoBruto` criado; dedupe_key definida; `SurfaceEventNormalizado` emitido para T4; HTTP 200 retornado imediatamente ao Meta |
| invariantes_verificadas | INV-01, INV-04, INV-12 |
| deve_passar | sim |
| falha_se | FL-01, FL-05, FL-12 |
| observacoes | Caminho feliz do adapter — valida fluxo nominal |

### E-02 — Webhook duplicado (Meta retry)

| Campo | Valor |
|---|---|
| scenario_id | E-02 |
| grupo | E |
| nome | Meta envia mesmo evento duas vezes (retry) |
| entrada | POST duplicado com mesmo `wa_message_id` |
| precondicoes | Primeiro POST já processado; `dedupe_key` registrada |
| artefatos_cobertos | T6.7 (IDP-01..10, DD-01..08), T4 |
| resultado_esperado | Segunda entrada detectada como duplicata via `dedupe_key`; descartada antes de T4; HTTP 200 retornado; nenhum novo turno criado; idempotência preservada |
| invariantes_verificadas | INV-04, INV-11 |
| deve_passar | sim |
| falha_se | FL-01, FL-05 |
| observacoes | Retry da Meta nunca pode criar duplicidade de turno |

### E-03 — Assinatura inválida

| Campo | Valor |
|---|---|
| scenario_id | E-03 |
| grupo | E |
| nome | POST com X-Hub-Signature-256 inválida ou ausente |
| entrada | POST sem header de assinatura ou com hash incorreto |
| precondicoes | Adapter ativo |
| artefatos_cobertos | T6.7 (SIG-01..09) |
| resultado_esperado | SIG inválida → rejeição imediata; payload nunca entra no pipeline; HTTP 401/403 retornado; nenhum `AdapterEventoBruto` criado; nenhum turno criado; log de segurança registrado |
| invariantes_verificadas | INV-04, INV-12 |
| deve_passar | sim |
| falha_se | FL-01, FL-05, FL-12 |
| observacoes | Assinatura inválida é condição absoluta de rejeição — INV-12 |

### E-04 — Status delivered/read (evento de status)

| Campo | Valor |
|---|---|
| scenario_id | E-04 |
| grupo | E |
| nome | Meta envia evento de status delivered ou read |
| entrada | POST com evento `statuses` (delivered/read) referenciando mensagem anterior |
| precondicoes | Mensagem anterior enviada com sucesso |
| artefatos_cobertos | T6.7 (ST-01..08), T4 |
| resultado_esperado | T6.7 classifica como `system_event`; nenhum turno conversacional criado; status registrado conceitualmente; `reply_text` não gerado; lead_state não alterado |
| invariantes_verificadas | INV-01, INV-04 |
| deve_passar | sim |
| falha_se | FL-01, FL-04, FL-05 |
| observacoes | delivered/read são eventos técnicos — nunca conversacionais |

### E-05 — Falha outbound

| Campo | Valor |
|---|---|
| scenario_id | E-05 |
| grupo | E |
| nome | Falha no envio outbound para o Meta |
| entrada | `IntencaoEnvioOutbound` com `reply_text` válido do LLM; Meta retorna erro 500 |
| precondicoes | Turno aprovado; `reply_text` produzido pelo LLM |
| artefatos_cobertos | T6.7 (RTO-01..09, ERR-AD-01..14) |
| resultado_esperado | Retry outbound ≤ 3 tentativas com backoff exponencial (RTO); após esgotamento, falha registrada como rastro técnico; nenhuma fala mecânica de erro enviada ao cliente; `reply_text` original preservado para reenvio |
| invariantes_verificadas | INV-01, INV-04 |
| deve_passar | sim |
| falha_se | FL-01, FL-05 |
| observacoes | Falha de envio não pode gerar fala mecânica automática |

### E-06 — Retry outbound sem duplicar turno

| Campo | Valor |
|---|---|
| scenario_id | E-06 |
| grupo | E |
| nome | Retry outbound não cria duplicidade de mensagem |
| entrada | Retry de `IntencaoEnvioOutbound` após primeira tentativa falhar (timeout) |
| precondicoes | Primeira tentativa registrada como pendente; `turn_id` preservado |
| artefatos_cobertos | T6.7 (IDP, RTO), T4 |
| resultado_esperado | Retry usa mesmo `turn_id`; Meta recebe `context_message_id` para deduplicação; se Meta já recebeu, descarta silenciosamente; cliente não recebe mensagem duplicada |
| invariantes_verificadas | INV-01, INV-04, INV-11 |
| deve_passar | sim |
| falha_se | FL-01, FL-05 |
| observacoes | Idempotência de envio outbound é tão crítica quanto inbound |

---

## §15 Grupo F — Dossiê/correspondente (8 cenários)

### F-01 — Dossiê com docs mínimos completos

| Campo | Valor |
|---|---|
| scenario_id | F-01 |
| grupo | F |
| nome | Dossiê com documentação mínima CLT completa |
| entrada | Todos os documentos mínimos CLT recebidos e em estado `accepted_for_dossier` |
| precondicoes | Lead CLT; P1 definido; todos os docs de identidade, residência e renda válidos |
| artefatos_cobertos | T6.3, T6.8, T4 |
| resultado_esperado | Dossiê avança para `ready_for_review`; checklist ENV-01..08 satisfeito; link_correspondente pode ser gerado; LLM notifica lead sobre completude |
| invariantes_verificadas | INV-01, INV-08 |
| deve_passar | sim |
| falha_se | FL-01, FL-06 |
| observacoes | Caminho feliz do dossiê — valida que a completude é detectada corretamente |

### F-02 — Dossiê com pendência bloqueante

| Campo | Valor |
|---|---|
| scenario_id | F-02 |
| grupo | F |
| nome | Dossiê com holerite pendente |
| entrada | Lead CLT; RG e residência aceitos; holerite ausente |
| precondicoes | Lead CLT; P1 definido; holerite em `documentos_pendentes` |
| artefatos_cobertos | T6.3, T6.8, T4 |
| resultado_esperado | Dossiê permanece em `partial_documents`; `ready_to_send` bloqueado (ENV-01); link ao correspondente não gerado; LLM informa pendência específica |
| invariantes_verificadas | INV-01, INV-08 |
| deve_passar | sim |
| falha_se | FL-01, FL-06 |
| observacoes | Pendência bloqueia envio — não bloqueia continuidade do atendimento |

### F-03 — Documento informativo não financiável

| Campo | Valor |
|---|---|
| scenario_id | F-03 |
| grupo | F |
| nome | Bolsa Família declarada como renda |
| entrada | Lead informa: "Recebo Bolsa Família de R$ 600" |
| precondicoes | Lead ativo; stage = coleta_renda |
| artefatos_cobertos | T6.3, T6.8, T4, T3 |
| resultado_esperado | T6.3/T6.8 classificam como `nao_financiavel`; dossiê registra como `documentos_informativos`; LLM informa que Bolsa Família não compõe renda MCMV; renda financiável não aumenta |
| invariantes_verificadas | INV-01, INV-10 |
| deve_passar | sim |
| falha_se | FL-01, FL-10 |
| observacoes | Bolsa Família, BPC/LOAS, assistencial, seguro-desemprego → sempre `nao_financiavel` |

### F-04 — Autônomo sem IRPF com extratos

| Campo | Valor |
|---|---|
| scenario_id | F-04 |
| grupo | F |
| nome | Autônomo sem IRPF envia 3 extratos bancários |
| entrada | 3 imagens de extrato bancário (últimos 3 meses) |
| precondicoes | Lead autônomo sem IRPF; stage = coleta_documentos |
| artefatos_cobertos | T6.3, T6.4, T6.8, T4 |
| resultado_esperado | T6.3 classifica como extratos informativos/complementares; T6.8 registra como renda informativa (não financiável diretamente); estado = `informational_only`; LLM confirma recebimento e explica como a renda será tratada |
| invariantes_verificadas | INV-01, INV-05, INV-08 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Autônomo sem IRPF — extratos são informativos conforme legado mestre |

### F-05 — P2/P3 com documento sem dono declarado

| Campo | Valor |
|---|---|
| scenario_id | F-05 |
| grupo | F |
| nome | Composição casal; documento enviado sem especificar de quem é |
| entrada | Holerite enviado; lead não especificou se é de P1 ou P2 |
| precondicoes | Lead com composição casal; P2 declarado mas sem documentos |
| artefatos_cobertos | T6.3, T6.4, T6.8, T4 |
| resultado_esperado | T6.3 estado = `needs_owner`; T6.8 registra pendência de associação; LLM pergunta especificamente "Este holerite é seu (titular) ou do cônjuge?"; dossiê não avança até dono definido |
| invariantes_verificadas | INV-01, INV-05, INV-08 |
| deve_passar | sim |
| falha_se | FL-01, FL-02, FL-06 |
| observacoes | Multi-proponente exige associação explícita de documentos |

### F-06 — Link conceitual gerado após completude

| Campo | Valor |
|---|---|
| scenario_id | F-06 |
| grupo | F |
| nome | Link do correspondente gerado após dossiê completo |
| entrada | Dossiê atinge `ready_to_send`; link_correspondente solicitado |
| precondicoes | Todos os docs mínimos aceitos; ENV-01..08 satisfeitos |
| artefatos_cobertos | T6.8 (§15, SL-01..10), T4 |
| resultado_esperado | `link_ref = "dossier/{pre_cadastro_id}/{dossier_id}"` gerado conceitualmente; SL-01..10 verificados; link nunca é URL real nesta PR; dossiê avança para `sent_to_correspondent`; LLM informa lead |
| invariantes_verificadas | INV-01, INV-08 |
| deve_passar | sim |
| falha_se | FL-01, FL-06 |
| observacoes | Link é conceitual — nunca é URL de produção nesta PR |

### F-07 — Correspondente retorna aprovado

| Campo | Valor |
|---|---|
| scenario_id | F-07 |
| grupo | F |
| nome | Correspondente retorna aprovação simples |
| entrada | Retorno do correspondente com status `approved` (sem condicionantes) |
| precondicoes | Dossiê em `correspondent_reviewing`; todos os documentos aceitos |
| artefatos_cobertos | T6.8 (RET-01..08), T4, T5 |
| resultado_esperado | Dossiê avança para `approved`; `visit_status` inicia como `pending`; LLM comunica aprovação ao lead; agenda visita via T5; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-09 |
| deve_passar | sim |
| falha_se | FL-01, FL-07 |
| observacoes | Aprovação simples → visita; detalhes de condicionantes nunca expostos |

### F-08 — Correspondente retorna reprovado ou pendência grave

| Campo | Valor |
|---|---|
| scenario_id | F-08 |
| grupo | F |
| nome | Correspondente retorna reprovação por restrição SCR |
| entrada | Retorno do correspondente com status `rejected`; motivo: restrição no SCR/Bacen |
| precondicoes | Dossiê em `correspondent_reviewing` |
| artefatos_cobertos | T6.8 (RET-01..08, REP-01..08), T4 |
| resultado_esperado | Dossiê avança para `rejected`; LLM orienta lead sobre Registrato sem expor valor da restrição; nunca gera fala mecânica autônoma; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-13 |
| deve_passar | sim |
| falha_se | FL-01, FL-08, FL-12 |
| observacoes | Valor de restrição jamais exposto — apenas orientação de regularização |

---

## §16 Grupo G — Aprovação/reprovação/visita (4 cenários)

### G-01 — Aprovado simples → visita

| Campo | Valor |
|---|---|
| scenario_id | G-01 |
| grupo | G |
| nome | Aprovação simples → agendamento de visita |
| entrada | Status `approved` do correspondente; sem condicionantes |
| precondicoes | Dossiê `approved`; visita ainda não agendada |
| artefatos_cobertos | T6.8 (VIS-01..08), T5, T4 |
| resultado_esperado | `visit_status = pending`; dossiê avança para `visit_required`; LLM oferece 2 slots de horário ao lead; Vasques notificado (conceitual); confirmação D-1 + dia planejadas; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-09 |
| deve_passar | sim |
| falha_se | FL-01, FL-07 |
| observacoes | Visita nunca agendada sem aprovação registrada |

### G-02 — Aprovado condicionado → cliente vê apenas "aprovado"

| Campo | Valor |
|---|---|
| scenario_id | G-02 |
| grupo | G |
| nome | Aprovado condicionado — cliente NÃO vê "condicionado" |
| entrada | Retorno do correspondente: `approved` com nota interna "condicionado à documentação complementar" |
| precondicoes | Dossiê em `correspondent_reviewing` |
| artefatos_cobertos | T6.8 (RET-03), T4 |
| resultado_esperado | Dossiê registra aprovação internamente; LLM comunica apenas "aprovado" ao lead (nunca "condicionado"); pendência complementar tratada internamente; `reply_text` vem do LLM sem expor condicionante |
| invariantes_verificadas | INV-01, INV-09 |
| deve_passar | sim |
| falha_se | FL-01, FL-07 |
| observacoes | RET-03 é invariante absoluta — "condicionado" nunca chega ao cliente |

### G-03 — Reprovado por SCR/Bacen → orientação Registrato

| Campo | Valor |
|---|---|
| scenario_id | G-03 |
| grupo | G |
| nome | Reprovação por restrição SCR/Bacen |
| entrada | `rejected` por SCR/Bacen |
| precondicoes | Dossiê em `rejected` |
| artefatos_cobertos | T6.8 (REP-01..08), T4 |
| resultado_esperado | LLM orienta lead a consultar Registrato; valor da restrição nunca exposto; mensagem de orientação gerada pelo LLM (não template mecânico); dossiê permanece em `rejected` até regularização |
| invariantes_verificadas | INV-01, INV-13 |
| deve_passar | sim |
| falha_se | FL-01, FL-08, FL-12 |
| observacoes | Orientação é do LLM — nunca template fixo |

### G-04 — Receita Federal pendente → orientação regularização

| Campo | Valor |
|---|---|
| scenario_id | G-04 |
| grupo | G |
| nome | Reprovação por pendência na Receita Federal (CPF irregular) |
| entrada | `rejected` com motivo CPF com pendência RF |
| precondicoes | Dossiê em `rejected` |
| artefatos_cobertos | T6.8 (REP-01..08), T4 |
| resultado_esperado | LLM orienta regularização do CPF na Receita Federal; nunca expõe detalhes do CPF ou valor de pendência; lead informado sobre próximo passo; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-13 |
| deve_passar | sim |
| falha_se | FL-01, FL-08 |
| observacoes | Pendência RF → regularização CPF; nenhuma informação fiscal exposta |

---

## §17 Grupo H — Regressão T1–T5 (5 cenários)

### H-01 — `reply_text` só vem do LLM

| Campo | Valor |
|---|---|
| scenario_id | H-01 |
| grupo | H |
| nome | Nenhum componente T6 produz reply_text |
| entrada | Qualquer entrada multicanal (texto, imagem, áudio, sticker) |
| precondicoes | Sistema T6 operando normalmente |
| artefatos_cobertos | T6.2, T6.3, T6.4, T6.5, T6.6, T6.7, T6.8, T4, A00-ADENDO-01 |
| resultado_esperado | `reply_text` exclusivamente produzido pelo LLM via T4; nenhum artefato T6 escreve `reply_text` diretamente; adapter nunca produz resposta; surface nunca produz resposta |
| invariantes_verificadas | INV-01, INV-04 |
| deve_passar | sim |
| falha_se | FL-01, FL-05, FL-12 |
| observacoes | Invariante máxima de soberania da IA — transversal a todos os artefatos T6 |

### H-02 — Nenhum canal decide stage

| Campo | Valor |
|---|---|
| scenario_id | H-02 |
| grupo | H |
| nome | Nenhum artefato T6 decide stage do lead |
| entrada | Documento aceito com sucesso |
| precondicoes | Lead em coleta_documentos; documento entra e é classificado |
| artefatos_cobertos | T6.2, T6.3, T6.4, T6.8, T4, T3, T2 |
| resultado_esperado | Documento aceito atualiza o dossiê; stage só muda via T4 → T3 → T2 com validação do LLM; nenhum artefato T6 altera `lead_state` ou `current_phase` diretamente |
| invariantes_verificadas | INV-02, INV-03, INV-05 |
| deve_passar | sim |
| falha_se | FL-02, FL-04 |
| observacoes | Governança de stage é exclusiva de T4/T3/T2 — canal é apenas entrada |

### H-03 — Nenhum documento cria fact_* automaticamente

| Campo | Valor |
|---|---|
| scenario_id | H-03 |
| grupo | H |
| nome | Documento recebido não cria fact_* sem validação |
| entrada | Holerite recebido e classificado como renda hipotética |
| precondicoes | Lead CLT; holerite classificado como `classified_hypothesis` |
| artefatos_cobertos | T6.3, T6.4, T4, T2 |
| resultado_esperado | Renda do holerite não vira `fact_renda` automaticamente; permanece como candidato até validação T4/LLM; confirmação textual do lead obrigatória para persistir |
| invariantes_verificadas | INV-02, INV-05 |
| deve_passar | sim |
| falha_se | FL-02, FL-04 |
| observacoes | `fact_*` só é criado via pipeline T4 com confirmação — nunca por inferência de documento |

### H-04 — Nenhum áudio confirma fato crítico sozinho

| Campo | Valor |
|---|---|
| scenario_id | H-04 |
| grupo | H |
| nome | Áudio não confirma informação crítica sem validação |
| entrada | Áudio com renda e regime (mesmo que STT estivesse disponível) |
| precondicoes | Lead ativo; informação crítica ainda não confirmada |
| artefatos_cobertos | T6.5, T4, T3 |
| resultado_esperado | Nenhuma informação crítica de áudio vira `fact_*` sem confirmação textual explícita do lead; T6.5 registra como candidato com confiança declarada; LLM solicita confirmação |
| invariantes_verificadas | INV-01, INV-06 |
| deve_passar | sim |
| falha_se | FL-03, FL-04 |
| observacoes | 14 informações críticas definidas em T6.5 — todas requerem confirmação |

### H-05 — Dossiê incompleto nunca enviado ao correspondente

| Campo | Valor |
|---|---|
| scenario_id | H-05 |
| grupo | H |
| nome | Dossiê com pendências não pode ser enviado |
| entrada | Tentativa de envio ao correspondente com dossiê em `partial_documents` |
| precondicoes | Lead ativo; dossiê com pelo menos um documento pendente |
| artefatos_cobertos | T6.8 (ENV-01..08), T4 |
| resultado_esperado | ENV-01 bloqueia envio; dossiê permanece em estado pré-envio; `correspondente_status` não avança; LLM informa lead sobre pendência específica; `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-08 |
| deve_passar | sim |
| falha_se | FL-06 |
| observacoes | ENV-01 é bloqueante absoluto — jamais contornável |

---

## §18 Cenários adicionais — Grupo I: Cliente some / reenvio / follow-up declarativo (5 cenários)

> Grupo extra além dos 8 obrigatórios. Total de cenários: 53.

### I-01 — Cliente some após etapa crítica

| Campo | Valor |
|---|---|
| scenario_id | I-01 |
| grupo | I |
| nome | Lead para de responder após LLM solicitar documento |
| entrada | Ausência de resposta por período declarativo |
| precondicoes | Lead ativo; LLM aguardando documento; stage = coleta_documentos |
| artefatos_cobertos | T6.8, T4, T5 |
| resultado_esperado | Dossiê permanece no estado atual; nenhum avanço automático; follow-up via T5 declarativamente planejado; `reply_text` de follow-up gerado pelo LLM quando acionado |
| invariantes_verificadas | INV-01, INV-02 |
| deve_passar | sim |
| falha_se | FL-01, FL-04 |
| observacoes | Silêncio do lead não avança nem recua stage mecanicamente |

### I-02 — Reenvio de documento anteriormente rejeitado

| Campo | Valor |
|---|---|
| scenario_id | I-02 |
| grupo | I |
| nome | Lead reenvio documento corrigido após rejeição |
| entrada | Nova imagem de RG (substituindo versão ilegível) |
| precondicoes | RG anterior em `rejected_unreadable` |
| artefatos_cobertos | T6.3, T6.4, T6.8, T4 |
| resultado_esperado | Nova imagem recebida; T6.3 trata como `pending_replacement`; se legível, estado avança para `classified_hypothesis`; dossiê atualizado; LLM confirma recebimento da nova versão |
| invariantes_verificadas | INV-01, INV-05 |
| deve_passar | sim |
| falha_se | FL-01, FL-02 |
| observacoes | Reenvio corretivo não cria novo documento — substitui o anterior na pendência |

### I-03 — Follow-up declarativo após aprovação

| Campo | Valor |
|---|---|
| scenario_id | I-03 |
| grupo | I |
| nome | Follow-up de visita não confirmada pelo lead |
| entrada | Lead não confirmou horário da visita após 2 slots oferecidos |
| precondicoes | Dossiê `approved`; visita `pending`; 2 slots oferecidos pelo LLM |
| artefatos_cobertos | T6.8 (VIS-01..08), T5, T4 |
| resultado_esperado | Follow-up de confirmação acionado via T5/T4; LLM reenvia os slots; visita não é agendada sem confirmação do lead |
| invariantes_verificadas | INV-01, INV-09 |
| deve_passar | sim |
| falha_se | FL-01, FL-07 |
| observacoes | Visita exige confirmação explícita do lead — não é automática |

### I-04 — Pending_regularization: lead envia comprovante de regularização SPC

| Campo | Valor |
|---|---|
| scenario_id | I-04 |
| grupo | I |
| nome | Lead envia comprovante de quitação SPC/Serasa após orientação |
| entrada | Imagem de comprovante de baixa do SPC |
| precondicoes | Dossiê em `pending_regularization`; lead orientado a regularizar SPC |
| artefatos_cobertos | T6.3, T6.4, T6.8 (RET-07), T4 |
| resultado_esperado | Comprovante recebido; T6.3 classifica como informativo; dossiê atualiza `retorno_correspondente` com comprovante; LLM informa lead sobre próximo passo (reenvio ao correspondente); `reply_text` vem do LLM |
| invariantes_verificadas | INV-01, INV-13 |
| deve_passar | sim |
| falha_se | FL-01, FL-08 |
| observacoes | Comprovante de regularização reabre caminho para o correspondente |

### I-05 — CNPJ isolado não vira renda financiável

| Campo | Valor |
|---|---|
| scenario_id | I-05 |
| grupo | I |
| nome | Lead com CNPJ ativo mas financiamento é como PF |
| entrada | Lead informa: "Tenho empresa mas quero financiar como pessoa física" |
| precondicoes | Lead ativo; CNPJ declarado |
| artefatos_cobertos | T6.3, T6.8, T4, T3 |
| resultado_esperado | CNPJ classificado como `nao_financiavel` ou `informativa`; financiamento declarado como PF; renda de empresa não compõe renda MCMV diretamente; LLM esclarece separação PF/PJ |
| invariantes_verificadas | INV-01, INV-10 |
| deve_passar | sim |
| falha_se | FL-01, FL-11 |
| observacoes | CNPJ isolado → renda de PJ; financiamento MCMV é da PF conforme T6.8 §10 |

---

## §19 Bloqueantes para PR-T6.R / G6

Os seguintes itens impedem a abertura de PR-T6.R:

| ID | Bloqueante |
|---|---|
| BLQ-01 | Menos de 48 cenários declarativos nesta suite |
| BLQ-02 | Ausência de cobertura de qualquer artefato T6.2–T6.8 |
| BLQ-03 | Ausência de cobertura de adapter idempotente (E-02, E-06) |
| BLQ-04 | Ausência de cobertura de áudio ruim (C-03) |
| BLQ-05 | Ausência de cobertura de mídia inválida/ilegível (B-06, D-04) |
| BLQ-06 | Ausência de cobertura de dossiê incompleto (F-02, H-05) |
| BLQ-07 | Ausência de cobertura de aprovação→visita (G-01, G-02) |
| BLQ-08 | Ausência de cobertura de reprovação→orientação (G-03, G-04) |
| BLQ-09 | Ausência de cobertura de regressão T1–T5 (Grupo H) |
| BLQ-10 | Qualquer cenário esperado que permita `reply_text` fora do LLM |
| BLQ-11 | Qualquer cenário esperado que permita canal decidir stage |
| BLQ-12 | Aprovado condicionado exposto como "condicionado" (viola RET-03) |
| BLQ-13 | Assinatura inválida aceita no pipeline (viola INV-12) |
| BLQ-14 | Benefício não financiável classificado como financiável (viola INV-10) |
| BLQ-15 | Sticker/emoji confirmando dado crítico (viola INV-07) |

**Esta suite atende: BLQ-01 (53 cenários), BLQ-02 (todos T6.2–T6.8 cobertos), BLQ-03 a BLQ-15 (todos os cenários relevantes declarados).**

---

## §20 Proibições absolutas (PROB-T69-01..20)

| ID | Proibição |
|---|---|
| PROB-T69-01 | Nenhum cenário desta suite cria `reply_text` |
| PROB-T69-02 | Nenhum cenário cria `fact_*` novo |
| PROB-T69-03 | Nenhum cenário cria `current_phase` |
| PROB-T69-04 | Nenhum cenário altera stage no canal |
| PROB-T69-05 | Nenhum cenário cria runtime |
| PROB-T69-06 | Nenhum cenário toca `src/` |
| PROB-T69-07 | Nenhum cenário abre sandbox real |
| PROB-T69-08 | Nenhum cenário abre WhatsApp/Meta real |
| PROB-T69-09 | Nenhum cenário cria env/secret real |
| PROB-T69-10 | Nenhum cenário cria migration |
| PROB-T69-11 | Nenhum cenário altera T1/T2/T3/T4/T5 |
| PROB-T69-12 | Nenhum cenário cria pergunta fixa ou template de fala |
| PROB-T69-13 | Nenhum cenário cria regra comercial nova |
| PROB-T69-14 | Nenhum cenário fecha G6 |
| PROB-T69-15 | Nenhum cenário cria `READINESS_G6.md` |
| PROB-T69-16 | Nenhum cenário avança para T7 |
| PROB-T69-17 | Nenhum cenário executa deploy |
| PROB-T69-18 | Nenhum teste executável é criado |
| PROB-T69-19 | Nenhuma simulação financeira oficial é gerada |
| PROB-T69-20 | Nenhum cenário abre canal real |

---

## §21 Riscos e mitigação

| ID | Risco | Mitigação declarada |
|---|---|---|
| R-T69-01 | Cenário interpretado como runtime real | Cada cenário explicita que é declarativo — nenhum executa |
| R-T69-02 | Cobertura incompleta passa para T6.R | Checklist de BLQ-01..15 bloqueia explicitamente |
| R-T69-03 | Novo artefato T6 sem cobertura | Bloqueante BLQ-02 exige cobertura de todos T6.2–T6.8 |
| R-T69-04 | Cenário de falha esperada mal interpretado | Todos os cenários têm `deve_passar=sim` exceto os explicitamente documentados como cenário de falha |
| R-T69-05 | Invariantes não verificadas na implementação | INV-01..13 declaradas e referenciadas em cada cenário |
| R-T69-06 | T7 aberto antes do G6 | G6 só abre via PR-T6.R; esta PR não encerra G6 |
| R-T69-07 | Aprovado condicionado exposto ao cliente | INV-09 e RET-03 declarados em G-02 |
| R-T69-08 | Benefício não financiável aceito como renda | INV-10 declarado em F-03, I-05 |

---

## §22 Critérios de aceite da PR-T6.9 (CA-T6.9-01..13)

| ID | Critério |
|---|---|
| CA-T6.9-01 | `T6_SUITE_TESTES_MULTICANAL.md` existe e está bem-formado |
| CA-T6.9-02 | Matriz de cobertura T6.2–T6.8 declarada (§6) |
| CA-T6.9-03 | ≥ 48 cenários declarativos criados |
| CA-T6.9-04 | Grupos A–H cobertos (mínimos: A=5, B=8, C=6, D=6, E=6, F=8, G=4, H=5) |
| CA-T6.9-05 | Cada cenário tem `resultado_esperado` e `falha_se` |
| CA-T6.9-06 | Critérios globais de PASS/FAIL declarados (PF-01..10, FL-01..12) |
| CA-T6.9-07 | Bloqueantes para T6.R declarados (BLQ-01..15) |
| CA-T6.9-08 | INV-01..13 declaradas e referenciadas nos cenários |
| CA-T6.9-09 | Dossiê/correspondente coberto (F-01..08) |
| CA-T6.9-10 | Aprovação→visita coberta (G-01, G-02) |
| CA-T6.9-11 | Reprovação→orientação coberta (G-03, G-04) |
| CA-T6.9-12 | Zero src/ tocado; zero runtime; zero sandbox real |
| CA-T6.9-13 | Próxima PR autorizada declarada como PR-T6.R |

---

## §23 Próxima PR autorizada

**PR-T6.R** — Readiness/Closeout G6.

**Condição de entrada:** todos os BLQ-01..15 satisfeitos; esta suite completa e merged.

**Escopo de PR-T6.R:** smoke T6.1–T6.9; verificação CA-T6-01..CA-T6-10; decisão G6 APROVADO ou REPROVADO com evidência de todos os artefatos T6.2–T6.9; aplicar `CONTRACT_CLOSEOUT_PROTOCOL.md`.

**Restrição:** PR-T6.R não abre T7 — apenas fecha G6 com evidência.

---

## §24 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T6_SUITE_TESTES_MULTICANAL.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T6.9 encerrada; PR-T6.R desbloqueada
Próxima PR autorizada:                 PR-T6.R — Readiness/Closeout G6
```

---

## §25 ESTADO HERDADO

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T6.8 (#133) — Dossiê operacional e link do correspondente — merged 2026-04-28T22:52:48Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Objetivo imutável do contrato: T6 entrega a camada de docs, multimodalidade e superfícies de canal da ENOVA 2
Recorte a executar nesta PR: PR-T6.9 — Suite declarativa de testes/sandbox multicanal
Item do A01: T6 — Docs, multimodalidade e superfícies de canal — item 9 (suite de testes/sandbox)
Estado atual da frente: em execução
O que a última PR fechou: dossiê operacional, link do correspondente, estados do dossiê, docs mínimos por perfil, retorno correspondente, aprovação→visita, reprovação→orientação, trilha de auditoria
O que a última PR NÃO fechou: suite de testes (PR-T6.9), readiness G6 (PR-T6.R)
Por que esta tarefa existe: T6.2–T6.8 entregues; necessário consolidar validação declarativa antes do G6
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: criar suite declarativa de 48+ cenários cobrindo toda a governança multicanal T6.2–T6.8
Escopo: T6_SUITE_TESTES_MULTICANAL.md; atualização dos 4 arquivos vivos
Fora de escopo: runtime, sandbox real, src/, T7, READINESS_G6
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Rebase canonico lido:        schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md — N/A (contexto de sessão)
  Plano T0-T7 lido:            schema/implantation/PLANO_EXECUTIVO_T0_T7.md — N/A (contexto de sessão)
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

---

## §26 ESTADO ENTREGUE

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR:
  - Criado T6_SUITE_TESTES_MULTICANAL.md com 53 cenários declarativos (grupos A–H + I)
  - Grupos A (5), B (8), C (6), D (6), E (6), F (8), G (4), H (5), I (5) cobertos
  - Matriz de cobertura T6.2–T6.8 + T4/T3/T2/T5 declarada
  - 13 invariantes INV-01..13 declaradas e referenciadas
  - 15 bloqueantes BLQ-01..15 declarados
  - 20 proibições PROB-T69-01..20 declaradas
  - 8 riscos com mitigação R-T69-01..08 declarados
  - 13 critérios CA-T6.9-01..13 declarados
  - Bloco E §24 completo
  - 4 arquivos vivos atualizados

O que foi fechado nesta PR: PR-T6.9 — Suite declarativa de testes/sandbox multicanal
O que continua pendente: PR-T6.R — Readiness/Closeout G6
O que ainda não foi fechado do contrato ativo: PR-T6.R (readiness/closeout G6)
Recorte executado do contrato: item 9 — suite de testes/sandbox multicanal
Pendência contratual remanescente: PR-T6.R
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — de PR-T6.9 para PR-T6.R
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados:
  - schema/implantation/T6_SUITE_TESTES_MULTICANAL.md (criado)
  - schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md (status atualizado)
  - schema/contracts/_INDEX.md (PR atual atualizado)
  - schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md (ultima tarefa atualizada)
  - schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md (seção PR-T6.9 adicionada)
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
