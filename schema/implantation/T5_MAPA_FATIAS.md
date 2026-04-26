# T5_MAPA_FATIAS — Mapa de Fatias do Funil Core e Ordem de Migração — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.1 |
| Branch | feat/t5-pr5-1-mapa-fatias |
| Status | entregue (v2 — corrigido) |
| Pré-requisito | PR-T5.0 — CONTRATO_IMPLANTACAO_MACRO_T5.md aprovado |
| Autoriza | PR-T5.2 (contrato fatia topo/abertura) |
| Data | 2026-04-26 |

## Finalidade

Este documento define o **mapa canônico de fatias** do funil core da ENOVA 2:

- Inventário completo dos **45 stages legados** com classificação por fatia T5
- Ordem de migração e dependências entre fatias
- Fatos mínimos (T2), políticas T3 e relação com pipeline T4 por fatia
- Critérios de entrada e saída de cada fatia
- Fase informativa/comercial (transversal — 9 campos)
- Correções de tipo semântico em relação ao legado
- Lacunas de schema futuras identificadas

**Princípio canônico:**

> Cada fatia é um **contrato de cobertura de casos** — não um roteiro de fala.
> O LLM decide como cobrir os casos dentro de cada fatia.
> Paridade funcional = mesmos casos cobertos, não mesma fala nem mesma sequência.
> Nenhuma fatia prescreve `reply_text`, pergunta fixa ou template de resposta.

**Fontes canônicas de fatos:**

- Todos os `fact_*` referenciados neste documento são chaves canônicas de
  `T2_DICIONARIO_FATOS.md` § 3 (Grupos I a X), conforme indexado em `T2_LEAD_STATE_V1.md` § 4.4.
- Todos os `derived_*` são chaves canônicas de `T2_LEAD_STATE_V1.md` § 5.3.
- Nenhuma chave foi inventada neste documento — chaves sem equivalente canônico são
  marcadas **lacuna de schema futura**.

**Documentos de base:**

- `T2_LEAD_STATE_V1.md` — grupos I–X (35 fact_*), 9 derived_*, 6 signal_*, `current_phase`
- `T3_CLASSES_POLITICA.md` — 5 classes canônicas
- `T3_ORDEM_AVALIACAO_COMPOSICAO.md` — pipeline de 6 estágios por turno
- `T4_PIPELINE_LLM.md` / `T4_ENTRADA_TURNO.md` — TurnoEntrada, reply_text imutável
- `CONTRATO_IMPLANTACAO_MACRO_T5.md` — §7 CA-01/CA-05/CA-08; §9 B-04/B-07

---

## §1 Visão geral das fatias

| # | Fatia | Nome | Stages legados | `current_phase`(s) | PR contrato | Depende de |
|---|---|---|---|---|---|---|
| F1 | Fatia 1 | Abertura / topo | 7 | `discovery` | PR-T5.2 | — |
| F2 | Fatia 2 | Qualificação inicial / composição familiar | 7 | `qualification` | PR-T5.3 | F1 concluída |
| F3 | Fatia 3 | Renda / regime / composição | 21 | `qualification`, `qualification_special` | PR-T5.4 | F2 concluída |
| F4 | Fatia 4 | Elegibilidade / restrição | 5 | `qualification`, `qualification_special` | PR-T5.5 | F3 concluída |
| F5 | Fatia 5 | Documentação / visita / handoff | 5 | `docs_prep` → `visit_conversion` | PR-T5.6 | F4 concluída |
| FI | Fase Inf. | Fase informativa / comercial (transversal) | — (9 campos) | `discovery`, `qualification` | — transversal | — |
| FP | Paridade | Matriz de paridade funcional | — | todos | PR-T5.7 | F1–F5 concluídas |
| FS | Shadow | Plano de shadow controlado / sandbox | — | todos | PR-T5.8 | FP concluída |

**Total stages legados mapeados:** 7 + 7 + 21 + 5 + 5 = **45**

---

## §2 Fase informativa / comercial (transversal)

A fase informativa/comercial é **transversal** — não é uma fatia sequencial, mas um conjunto de
campos informativos que o LLM pode coletar em qualquer momento conversacional adequado
(tipicamente durante `discovery` ou início de `qualification`).

Esses campos **não são critérios de saída de nenhuma fatia**, **não bloqueiam nenhum avanço de
`current_phase`** e **não geram pergunta fixa ou template**. São enriquecimento contextual que
ajuda a qualificar viabilidade comercial, orientar sobre imóvel/faixa e calibrar a conversa.

> **REGRA:** nenhum desses campos promete aprovação, parcela, subsídio ou financiamento.
> A coleta é informativa — não é gate duro nem sequência obrigatória.

### 2.1 Campos informativos — mapeamento T2

| Campo informativo | Tipo semântico | Chave T2 canônica | Status T2 |
|---|---|---|---|
| Preferência de localização da moradia | enum / text | — | **Lacuna informativa futura** — sem `fact_*` canônico; não aciona política T3 |
| Localização atual (bairro / cidade) | enum / text | — | **Lacuna informativa futura** — sem `fact_*` canônico |
| Localização do trabalho | enum / text | — | **Lacuna informativa futura** — sem `fact_*` canônico |
| FGTS — possui ou sabe se possui | boolean | `fact_has_fgts` (Group VII) | **Existe em T2** — persistir via T4.3 normalmente |
| FGTS — valor aproximado informado | number / text | — | **Lacuna informativa futura** — `fact_has_fgts` capta apenas a presença; valor específico sem `fact_*` canônico; útil para orientação de viabilidade mas não é gate |
| Curso superior (autônomo) | boolean / text | — | **Lacuna informativa futura** — sem `fact_*` canônico; relevante para autônomo |
| Profissão (autônomo) | enum / text | — | **Lacuna informativa futura** — sem `fact_*` canônico |
| Reserva / entrada — sinal | boolean / signal | `fact_entry_reserve_signal` (Group VII) | **Existe em T2** — persistir via T4.3 normalmente; captura sinal de existência de reserva |
| Reserva / entrada — valor aproximado informado | number / text | — | **Lacuna informativa futura** — `fact_entry_reserve_signal` capta apenas o sinal; valor específico sem `fact_*` canônico; útil para orientação comercial mas não é gate |

### 2.2 Observações sobre lacunas

Os campos marcados "Lacuna informativa futura" **não têm `fact_*` canônico em T2_DICIONARIO_FATOS**.
O LLM pode coletar e usar essas informações conversacionalmente, mas:

- Não podem ser persistidos como fatos canônicos T2 até que uma `fact_key` seja declarada
- Não podem acionar políticas T3 (nenhuma regra pode referenciar campo sem chave canônica)
- Não são critérios de entrada ou saída de nenhuma fatia
- Não geram pergunta fixa, template ou sequência obrigatória — o LLM decide se, quando e como abordar

---

## §3 Mapeamento completo: 45 stages legados → fatias T5

### 3.1 Tabela de mapeamento

> **Nota de chaves:** todas as colunas "Fatos T2" usam exclusivamente chaves canônicas de
> `T2_DICIONARIO_FATOS.md`. Quando não há equivalente canônico, a célula indica
> **[LSF]** = Lacuna de Schema Futura.

| Stage legado | Fatia | Objetivo operacional | Fatos T2 coletados / confirmados | Políticas T3 aplicáveis | PR | Tipo semântico correto | Observação |
|---|---|---|---|---|---|---|---|
| `inicio` | F1 | Identificar canal/intent e abrir atendimento | `fact_customer_goal`, `fact_lead_name` | sugestão_mandatória (engajamento); roteamento (→ `discovery`) | T5.2 | boolean / enum | Ponto de entrada; sem bloqueio hard |
| `inicio_decisao` | F1 | Confirmar decisão de compra MCMV | `fact_customer_goal` | confirmação (se `captured`); roteamento (confirmado → F2) | T5.2 | **boolean** | Legacy expected pode mostrar number — tipo correto: boolean; `fact_customer_goal` absorve intenção de compra e programa |
| `inicio_nome` | F1 | Capturar nome do lead | `fact_lead_name` | obrigação (`fact_lead_name` ausente) | T5.2 | text | |
| `inicio_programa` | F1 | Identificar programa de interesse (MCMV) | `fact_customer_goal` | obrigação (ausente); roteamento (MCMV vs outro) | T5.2 | **enum** | Legacy pode mostrar number — tipo correto: enum; objetivo e programa unificados em `fact_customer_goal` |
| `inicio_nacionalidade` | F1 | Capturar nacionalidade | `fact_nationality` | obrigação (ausente); confirmação (se `captured`) | T5.2 | enum | Group II; insumo crítico de `derived_rnm_required` e R_ESTRANGEIRO_SEM_RNM |
| `inicio_rnm` | F1 | Capturar status do RNM (estrangeiros) | `fact_rnm_status` | obrigação (ausente p/ estrangeiro); bloqueio (sem_rnm / vencido / inválido + `confirmed`) | T5.2 | enum | Group II; `derived_rnm_block` calculado a partir daqui |
| `inicio_tem_validade` | F1 | Verificar validade do RNM | `fact_rnm_status` | confirmação (validade); bloqueio (vencido) | T5.2 | date | Data exata de validade: **[LSF]**; `fact_rnm_status = "vencido"` captura o efeito relevante |
| `estado_civil` | F2 | Coletar estado civil | `fact_estado_civil` | obrigação (ausente); confirmação (se `captured`) | T5.3 | enum | Group III |
| `confirmar_casamento` | F2 | Confirmar status conjugal explicitamente | `fact_estado_civil`, `fact_composition_actor` | confirmação **hard** — base de `fact_process_mode` | T5.3 | boolean | Deve elevar `fact_estado_civil` para `confirmed` |
| `interpretar_composicao` | F2 | Determinar modo de processo (solo / duo / P3) | `fact_process_mode`, `derived_composition_needed` | roteamento (→ `qualification_special` se `fact_p3_required = true`) | T5.3 | enum | `fact_process_mode` Group III; `derived_composition_needed` avalia se composição é necessária |
| `confirmar_avo_familiar` | F2 | Confirmar composição familiar ampliada | `fact_composition_actor`, `fact_p3_required` | confirmação (se composição ambígua) | T5.3 | enum / text | Especialmente relevante para P3; `fact_p3_required` Group III |
| `dependente` | F2 | Verificar e coletar dependentes | `fact_dependente`, `fact_dependents_count` | obrigação (se ausente e relevante para faixa) | T5.3 | boolean + integer | `fact_dependente` (Group VIII) = tem dependente?; `fact_dependents_count` (Group VIII) = quantos |
| `financiamentos_conjunto` | F2 | Verificar financiamentos anteriores do grupo | **[LSF]** — sem `fact_*` canônico para financiamento anterior | obrigação (coleta necessária); **[LSF]** bloqueio depende de regra T5.3 com `fact_*` a ser declarado | T5.3 | boolean | **Lacuna de schema futura** — regra de bloqueio MCMV para financiamento anterior requer `fact_*` a ser declarado em PR futura |
| `quem_pode_somar` | F2 | Identificar membros que podem compor renda | `fact_composition_actor`, `fact_process_mode` | sugestão_mandatória (`derived_composition_needed` ativo); roteamento | T5.3 | enum / text | Insumo para F3 |
| `regime_trabalho` | F3 | Coletar regime de trabalho P1 | `fact_work_regime_p1` | obrigação (ausente); roteamento (CLT / autônomo / servidor) | T5.4 | **enum** | Group IV; legacy pode mostrar number — tipo correto: enum |
| `renda` | F3 | Coletar renda mensal P1 | `fact_monthly_income_p1` | obrigação (ausente); confirmação (se `captured`) | T5.4 | number (BRL) | Group IV; fato mais impactante para `derived_subsidy_band_hint` |
| `ctps_36` | F3 | Verificar 36 meses de CTPS P1 | `fact_ctps_36m_p1` | obrigação (ausente para CLT); confirmação; roteamento | T5.4 | **boolean** | Group IV; legacy pode mostrar number — tipo correto: boolean |
| `ir_declarado` | F3 | Verificar declaração de IR — P1 autônomo | `fact_autonomo_has_ir_p1` | confirmação (impacto autônomo); sugestão_mandatória | T5.4 | **boolean** | Group IV; específico para `fact_work_regime_p1 = autônomo`; legacy pode mostrar number |
| `possui_renda_extra` | F3 | Verificar múltiplas fontes de renda P1 | `fact_has_multi_income_p1` | obrigação (se autônomo com renda mista); sugestão_mandatória | T5.4 | boolean | Group IV |
| `inicio_multi_renda_pergunta` | F3 | Introduzir coleta de múltiplas rendas | — | sugestão_mandatória (`signal_multi_income_p1 = true` detectado) | T5.4 | — | Stage de transição; não persiste `fact_*` novo isoladamente |
| `inicio_multi_renda_coletar` | F3 | Coletar cada fonte de renda adicional | `fact_monthly_income_p1`, `fact_has_multi_income_p1` | obrigação (renda adicional pendente) | T5.4 | number | Group IV |
| `inicio_multi_regime_pergunta` | F3 | Introduzir coleta de múltiplos regimes | — | sugestão_mandatória | T5.4 | — | Stage de transição; não persiste `fact_*` novo isoladamente |
| `inicio_multi_regime_coletar` | F3 | Coletar cada regime de trabalho adicional | `fact_work_regime_p1` | obrigação (regime adicional pendente) | T5.4 | enum | Group IV |
| `renda_mista_detalhe` | F3 | Detalhar composição de renda mista P1 | `fact_work_regime_p1`, `fact_monthly_income_p1` | confirmação (renda mista ambígua); sugestão_mandatória | T5.4 | text / number | Group IV |
| `autonomo_compor_renda` | F3 | Verificar como autônomo P1 compõe renda | `fact_work_regime_p1`, `fact_autonomo_has_ir_p1` | obrigação (`fact_autonomo_has_ir_p1` ausente para autônomo); confirmação | T5.4 | enum / boolean | Group IV; específico para regime autônomo |
| `parceiro_tem_renda` | F3 | Verificar se P2 tem renda | `fact_work_regime_p2`, `fact_monthly_income_p2` | obrigação (se `fact_process_mode != "solo"`); roteamento | T5.4 | boolean | Group V; ativado quando `fact_process_mode = duo` ou conjunto |
| `regime_trabalho_parceiro` | F3 | Coletar regime de trabalho P2 | `fact_work_regime_p2` | obrigação (ausente para P2); roteamento | T5.4 | enum | Group V |
| `regime_trabalho_parceiro_familiar` | F3 | Coletar regime de membro familiar P3 | `fact_work_regime_p3` | obrigação (ausente para P3) | T5.4 | enum | Group VI; específico para composição ampliada P3 |
| `renda_parceiro` | F3 | Coletar renda P2 | `fact_monthly_income_p2` | obrigação (ausente para duo); confirmação | T5.4 | number (BRL) | Group V |
| `renda_parceiro_familiar` | F3 | Coletar renda de membro familiar P3 | `fact_monthly_income_p3` | obrigação (ausente para P3) | T5.4 | number (BRL) | Group VI |
| `renda_familiar_valor` | F3 | Consolidar renda do grupo para `derived_subsidy_band_hint` | `fact_monthly_income_p3`, `derived_subsidy_band_hint` | confirmação (valor consolidado) | T5.4 | number (BRL) | `derived_subsidy_band_hint` recalculado aqui; nunca promete aprovação ou subsídio exato |
| `somar_renda_familiar` | F3 | Confirmar composição de renda com membro familiar | `fact_composition_actor`, `fact_p3_required` | confirmação; sugestão_mandatória | T5.4 | boolean | Group III |
| `somar_renda_solteiro` | F3 | Tratar composição renda solteiro com familiar | `fact_estado_civil`, `fact_monthly_income_p3` | sugestão_mandatória (`derived_composition_needed` ativo) | T5.4 | boolean | Group III + VI |
| `sugerir_composicao_mista` | F3 | Sugerir composição mista ao lead | `derived_composition_needed` | sugestão_mandatória (`derived_composition_needed = true`) | T5.4 | — | `derived_composition_needed` calculado pelo mecânico; LLM decide a fala — não força composição |
| `ctps_36_parceiro` | F3 | Verificar CTPS 36 meses do P2 | `fact_ctps_36m_p2` | obrigação (ausente para CLT P2) | T5.4 | **boolean** | Group V; legacy pode mostrar number — tipo correto: boolean |
| `restricao` | F4 | Verificar restrição de crédito | `fact_credit_restriction` | obrigação (ausente); bloqueio (se restrição hard — regra T5.5); confirmação | T5.5 | **boolean** | Group VII; legacy pode mostrar number — tipo correto: boolean |
| `regularizacao_restricao` | F4 | Tratar possibilidade de regularização | `fact_restriction_regularization_status` | sugestão_mandatória (caminho de regularização); roteamento | T5.5 | enum | Group VII; só ativado se `fact_credit_restriction = true` |
| `fim_inelegivel` | F4 | Encerrar case por inelegibilidade | `derived_eligibility_probable` | bloqueio (terminal); roteamento (`ACAO_INELEGIBILIDADE`) | T5.5 | — | `ACAO_INELEGIBILIDADE` → `operational.elegibility_status = "ineligible"`; `current_phase` permanece em valor canônico (sem `current_phase = encerramento`) |
| `verificar_averbacao` | F4 | Verificar averbação de divórcio | **[LSF]** — sem `fact_*` canônico para status de averbação | obrigação (coleta necessária para divorciado); confirmação | T5.5 | enum | **Lacuna de schema futura** — ativado quando `fact_estado_civil = divorciado` |
| `verificar_inventario` | F4 | Verificar inventário / espólio (viúvo) | **[LSF]** — sem `fact_*` canônico para imóvel anterior / inventário | obrigação; confirmação | T5.5 | enum | **Lacuna de schema futura** — ativado quando `fact_estado_civil = viúvo` |
| `envio_docs` | F5 | Orientar envio de documentação | `fact_doc_identity_status`, `fact_doc_income_status`, `fact_doc_residence_status`, `fact_doc_ctps_status`, `fact_docs_channel_choice` | obrigação (docs ausentes / incompletos); sugestão_mandatória (`derived_doc_risk` alto) | T5.6 | boolean | Group IX; sem `fact_*` único "docs_ready" — mecânico avalia conjunto |
| `agendamento_visita` | F5 | Registrar interesse e agendamento de visita | `fact_visit_interest` | obrigação (ausente); confirmação | T5.6 | boolean | Group X; `fact_visit_interest` captura intenção e confirmação de visita |
| `aguardando_retorno_correspondente` | F5 | Registrar estado de espera do correspondente | **[LSF]** — sem `fact_*` canônico para atribuição de correspondente | roteamento (→ `awaiting_broker`); sugestão_mandatória | T5.6 | enum | **Lacuna de schema futura** — `current_phase = awaiting_broker` é canônico; atribuição de correspondente requer `fact_*` futuro |
| `finalizacao` | F5 | Confirmar encerramento positivo do funil | `derived_doc_risk`, `fact_visit_interest` | roteamento (`broker_handoff`); confirmação | T5.6 | — | `derived_doc_risk` indica completude; atribuição de correspondente: **[LSF]** |
| `finalizacao_processo` | F5 | Registrar encerramento do processo operacional | `fact_visit_interest` | roteamento (`visit_conversion`); sugestão_mandatória | T5.6 | — | `current_phase = visit_conversion` é canônico; atribuição broker: **[LSF]** |

**Contagem de stages por fatia:**

| Fatia | Stages | Total |
|---|---|---|
| F1 | inicio, inicio_decisao, inicio_nome, inicio_programa, inicio_nacionalidade, inicio_rnm, inicio_tem_validade | 7 |
| F2 | estado_civil, confirmar_casamento, interpretar_composicao, confirmar_avo_familiar, dependente, financiamentos_conjunto, quem_pode_somar | 7 |
| F3 | regime_trabalho, renda, ctps_36, ir_declarado, possui_renda_extra, inicio_multi_renda_pergunta, inicio_multi_renda_coletar, inicio_multi_regime_pergunta, inicio_multi_regime_coletar, renda_mista_detalhe, autonomo_compor_renda, parceiro_tem_renda, regime_trabalho_parceiro, regime_trabalho_parceiro_familiar, renda_parceiro, renda_parceiro_familiar, renda_familiar_valor, somar_renda_familiar, somar_renda_solteiro, sugerir_composicao_mista, ctps_36_parceiro | 21 |
| F4 | restricao, regularizacao_restricao, fim_inelegivel, verificar_averbacao, verificar_inventario | 5 |
| F5 | envio_docs, agendamento_visita, aguardando_retorno_correspondente, finalizacao, finalizacao_processo | 5 |
| **Total** | | **45** |

**Lacunas de schema futuras identificadas (LF):**

| LF | Dado | Stage(s) | Necessidade |
|---|---|---|---|
| LF-01 | Data de validade do RNM | `inicio_tem_validade` | `fact_rnm_status = "vencido"` captura o efeito; data exata requer `fact_*` futuro |
| LF-02 | Financiamento anterior | `financiamentos_conjunto` | Regra MCMV de bloqueio requer `fact_*` a ser declarado |
| LF-03 | Status de averbação (divórcio) | `verificar_averbacao` | Nenhum `fact_*` canônico cobre averbação |
| LF-04 | Imóvel anterior / inventário | `verificar_inventario` | Nenhum `fact_*` canônico cobre propriedade anterior ou espólio |
| LF-05 | Atribuição de correspondente | `aguardando_retorno_correspondente`, `finalizacao`, `finalizacao_processo` | Handoff operacional requer `fact_*` futuro |
| LF-06 | Valor específico do FGTS | FI | `fact_has_fgts` captura presença; valor aproximado requer `fact_*` futuro |
| LF-07 | Valor específico da entrada | FI | `fact_entry_reserve_signal` captura sinal; valor aproximado requer `fact_*` futuro |

---

## §4 Seções detalhadas por fatia

### F1 — Fatia 1: Abertura / topo

#### 4.1.1 Objetivo

Identificar, engajar e qualificar minimamente o lead no ponto de entrada — capturando os fatos de
identificação e elegibilidade documental crítica antes de avançar ao funil de qualificação.

#### 4.1.2 `current_phase` ativo

`discovery`

#### 4.1.3 Stages legados cobertos (7)

`inicio`, `inicio_decisao`, `inicio_nome`, `inicio_programa`, `inicio_nacionalidade`, `inicio_rnm`,
`inicio_tem_validade`

#### 4.1.4 Fatos mínimos (T2) — obrigatórios na saída de F1

| Fato | Grupo T2 | Status mínimo na saída | Observação |
|---|---|---|---|
| `fact_customer_goal` | Group I | `confirmed` | Objetivo de compra MCMV confirmado; absorve intenção e programa |
| `fact_lead_name` | Group I | `captured` | Nome capturado (confirmado, se possível) |
| `fact_nationality` | Group II | `confirmed` | Obrigatório para avaliar `derived_rnm_required` |
| `fact_rnm_status` | Group II | `confirmed` | **Somente se** `fact_nationality != "brasileiro"` |
| `derived_rnm_block` | derived | calculado | SE estrangeiro; deve ser `false` na saída (sem bloqueio ativo) |

#### 4.1.5 Políticas T3 aplicáveis em F1

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação de nome | obrigação | `fact_lead_name` ausente | `must_ask_now` ← `fact_lead_name` |
| Obrigação de objetivo | obrigação | `fact_customer_goal` ausente | `must_ask_now` ← `fact_customer_goal` |
| Confirmação de objetivo | confirmação | `fact_customer_goal` em `captured` | `needs_confirmation = true` |
| Confirmação de nacionalidade | confirmação | `fact_nationality` em `captured` | Eleva para `confirmed` antes de avaliar RNM |
| Bloqueio RNM | **bloqueio** | estrangeiro + `fact_rnm_status` ∈ {sem_rnm, vencido, inválido} + `confirmed` | `blocked_by` ← R_ESTRANGEIRO_SEM_RNM; `advance_allowed = false`; `derived_rnm_block = true` |
| Roteamento `discovery` → `qualification` | roteamento | F1 concluída (todos critérios de saída atendidos) | `current_phase = qualification` |

#### 4.1.6 Critérios de entrada

- `lead_state` inicializado (novo lead ou retomada)
- `operational.current_phase` nulo, `discovery` ou ausente

#### 4.1.7 Critérios de saída — pronto para F2

- `fact_customer_goal` confirmado (objetivo MCMV claro)
- `fact_nationality` confirmado
- SE estrangeiro: `fact_rnm_status` confirmado **e** `derived_rnm_block = false`
- `operational.blocked_by` vazio

#### 4.1.8 Relação com T4

- `TurnoEntrada.operational.current_phase = "discovery"`
- `TurnoEntrada.lead_state.facts` contém os fatos de F1 com seus status
- `derived_rnm_block = true` entra em `TurnoEntrada.policy_context.prior_decisions`
- `TurnoSaida.extracted_facts` alimenta T4.3 para persistência
- O LLM recebe esses insumos e decide a fala — sem template, sem script

---

### F2 — Fatia 2: Qualificação inicial / composição familiar

#### 4.2.1 Objetivo

Estabelecer a estrutura familiar e o modo de processo (solo P1 / duo P1+P2 / composto P3) para
direcionar corretamente a coleta de renda em F3.

#### 4.2.2 `current_phase` ativo

`qualification`

#### 4.2.3 Stages legados cobertos (7)

`estado_civil`, `confirmar_casamento`, `interpretar_composicao`, `confirmar_avo_familiar`,
`dependente`, `financiamentos_conjunto`, `quem_pode_somar`

#### 4.2.4 Fatos mínimos (T2) — obrigatórios na saída de F2

| Fato | Grupo T2 | Status mínimo na saída | Observação |
|---|---|---|---|
| `fact_estado_civil` | Group III | `confirmed` | Base do `fact_process_mode` |
| `fact_process_mode` | Group III | calculado / `confirmed` | Solo / duo / P3 determinado |
| `fact_composition_actor` | Group III | `captured` | SE `fact_process_mode != "solo"` |
| `fact_p3_required` | Group III | calculado | `true` se composição P3 necessária |
| `fact_dependente` | Group VIII | `captured` | Tem dependente? |
| `fact_dependents_count` | Group VIII | `captured` | SE `fact_dependente = true` |
| **[LF-02]** — financiamento anterior | — | — | **Lacuna de schema futura** — verificação necessária; regra de bloqueio aguarda `fact_*` declarado em PR-T5.3 |

#### 4.2.5 Políticas T3 aplicáveis em F2

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação estado civil | obrigação | `fact_estado_civil` ausente | `must_ask_now` ← `fact_estado_civil` |
| Confirmação estado civil | confirmação **hard** | `fact_estado_civil` em `captured` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR` |
| Roteamento P3 | roteamento (special) | `fact_p3_required = true` | `current_phase = qualification_special` |
| Sugestão composição | sugestão_mandatória | `derived_composition_needed = true` | Orientar LLM a apresentar opção de composição |
| Bloqueio financiamento anterior | **bloqueio** | **[LF-02]** — condição depende de `fact_*` a ser declarado | Regra definida em PR-T5.3 com `fact_*` futuro |

#### 4.2.6 Critérios de entrada

- F1 concluída: `fact_customer_goal` confirmado; `fact_nationality` confirmado; sem bloqueio ativo
- `operational.current_phase = qualification`

#### 4.2.7 Critérios de saída — pronto para F3

- `fact_estado_civil` confirmado
- `fact_process_mode` calculado
- `fact_p3_required` avaliado; se `true` → `current_phase = qualification_special` já disparado
- Verificação de financiamento anterior realizada (ou lacuna documentada em PR-T5.3)
- Sem bloqueio ativo

#### 4.2.8 Relação com T4

- `TurnoEntrada.operational.current_phase = "qualification"`
- Roteamento `qualification_special` disparado pelo mecânico via T4.3 se `fact_p3_required = true`
- O LLM recebe novo `current_phase` via `TurnoEntrada` e conduz transição com naturalidade
- `derived_composition_needed` disponível em `TurnoEntrada.lead_state.derived` para o LLM raciocinar

---

### F3 — Fatia 3: Renda / regime / composição

#### 4.3.1 Objetivo

Coletar e confirmar todas as rendas e regimes de trabalho relevantes (P1, P2, P3) para
calcular `derived_subsidy_band_hint` e determinar viabilidade de faixa.

#### 4.3.2 `current_phase` ativo

`qualification` ou `qualification_special` (se P3)

#### 4.3.3 Stages legados cobertos (21)

`regime_trabalho`, `renda`, `ctps_36`, `ir_declarado`, `possui_renda_extra`,
`inicio_multi_renda_pergunta`, `inicio_multi_renda_coletar`, `inicio_multi_regime_pergunta`,
`inicio_multi_regime_coletar`, `renda_mista_detalhe`, `autonomo_compor_renda`,
`parceiro_tem_renda`, `regime_trabalho_parceiro`, `regime_trabalho_parceiro_familiar`,
`renda_parceiro`, `renda_parceiro_familiar`, `renda_familiar_valor`, `somar_renda_familiar`,
`somar_renda_solteiro`, `sugerir_composicao_mista`, `ctps_36_parceiro`

#### 4.3.4 Fatos mínimos (T2) — obrigatórios na saída de F3

| Fato | Grupo T2 | Status mínimo na saída | Condição de aplicação |
|---|---|---|---|
| `fact_work_regime_p1` | Group IV | `confirmed` | Sempre |
| `fact_monthly_income_p1` | Group IV | `confirmed` | Sempre |
| `fact_ctps_36m_p1` | Group IV | `confirmed` | SE `fact_work_regime_p1 = CLT` |
| `fact_autonomo_has_ir_p1` | Group IV | `captured` | SE `fact_work_regime_p1 = autônomo` |
| `fact_has_multi_income_p1` | Group IV | `captured` | Se aplicável |
| `fact_work_regime_p2` | Group V | `confirmed` | SE `fact_process_mode != "solo"` |
| `fact_monthly_income_p2` | Group V | `confirmed` | SE `fact_process_mode != "solo"` |
| `fact_ctps_36m_p2` | Group V | `confirmed` | SE `fact_work_regime_p2 = CLT` |
| `fact_autonomo_has_ir_p2` | Group V | `captured` | SE `fact_work_regime_p2 = autônomo` |
| `fact_work_regime_p3` | Group VI | `confirmed` | SE `fact_p3_required = true` |
| `fact_monthly_income_p3` | Group VI | `confirmed` | SE `fact_p3_required = true` |
| `derived_subsidy_band_hint` | derived | calculado | Obrigatório na saída — nunca promete aprovação ou subsídio exato |

#### 4.3.5 Políticas T3 aplicáveis em F3

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação regime P1 | obrigação | `fact_work_regime_p1` ausente | `must_ask_now` ← `fact_work_regime_p1` |
| Obrigação renda P1 | obrigação | `fact_monthly_income_p1` ausente | `must_ask_now` ← `fact_monthly_income_p1` |
| Obrigação CTPS P1 (CLT) | obrigação | CLT + `fact_ctps_36m_p1` ausente | `must_ask_now` ← `fact_ctps_36m_p1` |
| Obrigação IR autônomo P1 | obrigação | autônomo + `fact_autonomo_has_ir_p1` ausente | `must_ask_now` ← `fact_autonomo_has_ir_p1` |
| Obrigação renda P2 | obrigação | duo + `fact_monthly_income_p2` ausente | `must_ask_now` ← `fact_monthly_income_p2` |
| Obrigação regime P2 | obrigação | duo + `fact_work_regime_p2` ausente | `must_ask_now` ← `fact_work_regime_p2` |
| Obrigação renda P3 | obrigação | P3 + `fact_monthly_income_p3` ausente | `must_ask_now` ← `fact_monthly_income_p3` |
| Confirmação renda P1 | confirmação | `fact_monthly_income_p1` em `captured` | `needs_confirmation = true` |
| Sugestão composição mista | sugestão_mandatória | `derived_composition_needed = true` | Orientar apresentação de opção mista |

#### 4.3.6 Critérios de entrada

- F2 concluída: `fact_estado_civil` + `fact_process_mode` calculados; sem bloqueio ativo
- `operational.current_phase = qualification` ou `qualification_special`

#### 4.3.7 Critérios de saída — pronto para F4

- `fact_work_regime_p1` + `fact_monthly_income_p1` confirmados
- SE CLT: `fact_ctps_36m_p1` confirmado
- SE duo: `fact_work_regime_p2` + `fact_monthly_income_p2` confirmados
- SE P3: `fact_work_regime_p3` + `fact_monthly_income_p3` confirmados
- `derived_subsidy_band_hint` calculado
- `operational.must_ask_now` vazio (sem obrigações de renda pendentes)

#### 4.3.8 Relação com T4

- `TurnoEntrada.operational.must_ask_now` contém obrigações de renda pendentes
- `TurnoEntrada.policy_context.prior_decisions` lista obrigações acumuladas (prioridade T3)
- `TurnoSaida.extracted_facts` alimenta cálculo de `derived_subsidy_band_hint` em T4.3
- `qualification_special` ativo via roteamento T3 — LLM recebe `current_phase = qualification_special`
  e conduz coleta ampliada sem roteirização

---

### F4 — Fatia 4: Elegibilidade / restrição

#### 4.4.1 Objetivo

Verificar condições de elegibilidade que podem bloquear o processo: restrição de crédito,
situações documentais especiais (divórcio, inventário) e calcular `derived_eligibility_probable`.

#### 4.4.2 `current_phase` ativo

`qualification` (final) ou `qualification_special`

#### 4.4.3 Stages legados cobertos (5)

`restricao`, `regularizacao_restricao`, `fim_inelegivel`, `verificar_averbacao`,
`verificar_inventario`

#### 4.4.4 Fatos mínimos (T2) — obrigatórios na saída de F4

| Fato | Grupo T2 | Status mínimo na saída | Condição |
|---|---|---|---|
| `fact_credit_restriction` | Group VII | `confirmed` | Sempre |
| `fact_restriction_regularization_status` | Group VII | `captured` | SE `fact_credit_restriction = true` |
| `derived_eligibility_probable` | derived | calculado | Obrigatório na saída |
| **[LF-03]** — status averbação | — | — | **Lacuna de schema futura** — SE `fact_estado_civil = divorciado` |
| **[LF-04]** — imóvel anterior / inventário | — | — | **Lacuna de schema futura** — SE `fact_estado_civil = viúvo` |

#### 4.4.5 Políticas T3 aplicáveis em F4

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação restrição | obrigação | `fact_credit_restriction` ausente | `must_ask_now` ← `fact_credit_restriction` |
| Bloqueio restrição hard | **bloqueio** | `fact_credit_restriction = true` + regra terminal (T5.5) | `blocked_by` ← R_RESTRICAO_HARD |
| Sugestão regularização | sugestão_mandatória | `fact_credit_restriction = true` + regra não-terminal | Orientar caminho via `fact_restriction_regularization_status` |
| Roteamento inelegibilidade | roteamento | `derived_eligibility_probable` indica inviabilidade | `ACAO_INELEGIBILIDADE` → `elegibility_status = "ineligible"`; `current_phase` permanece em valor canônico |
| Obrigação averbação | obrigação | divorciado + **[LF-03]** ausente | Coleta necessária; persistência aguarda `fact_*` futuro |
| Confirmação restrição | confirmação | `fact_credit_restriction` em `captured` | `needs_confirmation = true` |

> **Nota sobre `fim_inelegivel`:** a inelegibilidade é registrada em
> `operational.elegibility_status = "ineligible"` via `ACAO_INELEGIBILIDADE`.
> **Não existe `current_phase = "encerramento"`** — os valores canônicos de `current_phase`
> são os 8 listados em `T2_LEAD_STATE_V1.md §3.3`. O LLM conduz o encerramento com
> dignidade a partir do objetivo `OBJ_INELEGIVEL` — sem expor o mecanismo.

#### 4.4.6 Critérios de entrada

- F3 concluída: `derived_subsidy_band_hint` calculado
- `operational.must_ask_now` vazio

#### 4.4.7 Critérios de saída — pronto para F5

- `fact_credit_restriction` confirmado
- `derived_eligibility_probable` calculado e não indicando inviabilidade terminal
- SE divorciado: verificação de averbação realizada (ou lacuna LF-03 documentada em PR-T5.5)
- `operational.blocked_by` vazio

#### 4.4.8 Relação com T4

- `TurnoEntrada.operational.elegibility_status` reflete estado atual
- `ACAO_INELEGIBILIDADE` disparado pelo mecânico via T4.3 atualiza `elegibility_status = "ineligible"`
- O LLM recebe `current_objective = OBJ_INELEGIVEL` e conduz encerramento com dignidade
- Nenhum componente escreve texto de inelegibilidade — o LLM decide a fala

---

### F5 — Fatia 5: Documentação / visita / handoff

#### 4.5.1 Objetivo

Concluir o funil core: orientar envio de documentação, registrar interesse de visita e preparar
o handoff para o correspondente.

#### 4.5.2 `current_phase` ativo

`docs_prep` → `docs_collection` → `broker_handoff` → `awaiting_broker` → `visit_conversion`

#### 4.5.3 Stages legados cobertos (5)

`envio_docs`, `agendamento_visita`, `aguardando_retorno_correspondente`, `finalizacao`,
`finalizacao_processo`

#### 4.5.4 Fatos mínimos (T2) — obrigatórios na saída de F5

| Fato | Grupo T2 | Status mínimo na saída | Observação |
|---|---|---|---|
| `fact_doc_identity_status` | Group IX | `captured` / `confirmed` | Documento de identidade |
| `fact_doc_income_status` | Group IX | `captured` / `confirmed` | Comprovante de renda |
| `fact_doc_residence_status` | Group IX | `captured` / `confirmed` | Comprovante de residência |
| `fact_doc_ctps_status` | Group IX | `captured` / `confirmed` | SE CLT |
| `fact_docs_channel_choice` | Group IX | `captured` | Canal de envio de docs definido |
| `fact_visit_interest` | Group X | `captured` | Interesse / agendamento de visita registrado |
| `derived_doc_risk` | derived | calculado | Avalia completude e risco documental |
| **[LF-05]** — atribuição de correspondente | — | — | **Lacuna de schema futura** — handoff operacional requer `fact_*` futuro |

#### 4.5.5 Políticas T3 aplicáveis em F5

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação docs | obrigação | `fact_doc_identity_status` ou `fact_doc_income_status` ausentes / incompletos | `must_ask_now` ← orientação docs |
| Sugestão orientação docs | sugestão_mandatória | `derived_doc_risk` alto | Orientar quais docs faltam |
| Roteamento handoff | roteamento | docs adequados + LF-05 resolvida (futuro) | `current_phase = broker_handoff` |
| Roteamento await | roteamento | handoff feito + retorno pendente | `current_phase = awaiting_broker` |
| Roteamento visit | roteamento | `fact_visit_interest = true` + confirmado | `current_phase = visit_conversion` |
| Confirmação visita | confirmação | `fact_visit_interest` em `captured` | `needs_confirmation = true` |

#### 4.5.6 Critérios de entrada

- F4 concluída: `derived_eligibility_probable` calculado sem inviabilidade terminal
- `operational.blocked_by` vazio
- `operational.current_phase` avança para `docs_prep`

#### 4.5.7 Critérios de saída — funil core concluído

- `fact_doc_identity_status`, `fact_doc_income_status`, `fact_doc_residence_status` capturados
- `fact_docs_channel_choice` capturado
- `fact_visit_interest` capturado / confirmado
- `derived_doc_risk` calculado (abaixo do threshold de risco crítico — definido em PR-T5.6)
- LF-05 (atribuição de correspondente): a ser resolvida em PR-T5.6 com `fact_*` declarado

#### 4.5.8 Relação com T4

- Roteamentos sequenciais (`docs_prep` → `docs_collection` → `broker_handoff` → `awaiting_broker`
  → `visit_conversion`) todos mediados pelo mecânico via T4.3
- O LLM recebe cada novo `current_phase` via `TurnoEntrada` e conduz transições naturalmente
- `TurnoSaida.recommended_next_actions` inclui ações de docs/handoff mas nunca substitui a fala do LLM
- Imutabilidade de `reply_text` preservada em todas as transições de F5

---

## §5 Correções de tipo semântico em relação ao legado

O legado Enova 1 apresenta campos cujo tipo declarado no `expected` não reflete o significado
semântico correto. As correções abaixo são **canônicas para T5** — aplicam-se à persistência
em `lead_state` e ao contrato de cada fatia. O legado não é modificado.

| Stage legado | Campo legacy | Tipo legacy (`expected`) | Tipo semântico correto | Chave T2 canônica | Justificativa |
|---|---|---|---|---|---|
| `inicio_decisao` | decisao | number | **boolean** | `fact_customer_goal` | Decisão de compra é yes/no; number não tem semântica |
| `inicio_programa` | programa | number | **enum** | `fact_customer_goal` | MCMV é categórico (Faixa 1/2/3); number não representa categoria |
| `regime_trabalho` | regime | number | **enum** | `fact_work_regime_p1` | CLT / autônomo / servidor / MEI são categorias |
| `ctps_36` | ctps_meses | number | **boolean** | `fact_ctps_36m_p1` | Critério binário: tem ou não tem 36 meses contínuos |
| `ctps_36_parceiro` | ctps_meses_parceiro | number | **boolean** | `fact_ctps_36m_p2` | Mesmo critério para P2 |
| `ir_declarado` | ir | number | **boolean** | `fact_autonomo_has_ir_p1` | Declarou IR ou não: binário |
| `restricao` | tem_restricao | number | **boolean** | `fact_credit_restriction` | Restrição é yes/no |
| `dependente` | qtd_dependentes | number | integer (não-negativo) | `fact_dependents_count` | Contagem inteira — não cardinal contínuo |

---

## §6 Anti-padrões proibidos

| Código | Anti-padrão | Referência canônica |
|---|---|---|
| AP-01 | `reply_text`, `mensagem_usuario` ou texto ao cliente gerado fora do LLM | A00-ADENDO-01; `T4_PIPELINE_LLM.md` |
| AP-02 | If/else de fala — fatia define condição para falar de forma X, Y se Z | CA-01 do CONTRATO T5; B-04 |
| AP-03 | Template de pergunta fixo por stage — "Você tem CTPS? Sim/Não" | CA-01, CA-08 |
| AP-04 | Critério de saída definido como "LLM falou sobre X" | CA-05 — paridade funcional ≠ paridade textual |
| AP-05 | Roteamento disparado antes de bloqueio resolvido no mesmo turno | T3_ORDEM_AVALIACAO §2 — roteamento é Estágio 6 |
| AP-06 | Fato em `hypothesis` sustentando bloqueio | T3_CLASSES_POLITICA §2.2 (CP-09) |
| AP-07 | Persistência automática de fato sem coleta explícita no turno | `T4_VALIDACAO_PERSISTENCIA.md` |
| AP-08 | Uso de Meta / WhatsApp real em qualquer validação antes de G5 aprovado | B-07 do CONTRATO T5 |
| AP-09 | Lacuna informativa / lacuna de schema como critério de saída de fatia | §2.2 e §3.1 — lacunas não bloqueiam |
| AP-10 | `current_phase = "encerramento"` ou qualquer valor fora dos 8 canônicos | T2_LEAD_STATE_V1 §3.3 — fases canônicas invioláveis |
| AP-11 | `fact_*` inventado (não presente em T2_DICIONARIO_FATOS) em qualquer regra ou critério | T2_LEAD_STATE_V1 §4.5 — "Nenhum `fact_*` pode ser criado fora do dicionário canônico" |
| AP-12 | Múltiplos roteamentos simultâneos no mesmo turno | T3_CLASSES_POLITICA §7 — múltiplos roteamentos: proibido |

---

## §7 Validação cruzada T2 / T3 / T4

| Fato T2 (canônico) | Classe T3 principal | Etapa T4 afetada | Fatia | Observação |
|---|---|---|---|---|
| `fact_nationality` | confirmação → `derived_rnm_required` | T4.1 entrada; T4.3 persistência | F1 | Precede avaliação de RNM |
| `fact_rnm_status` | **bloqueio** (R_ESTRANGEIRO_SEM_RNM) → `derived_rnm_block` | T4.3 validação | F1 | Bloqueio mais crítico do funil core |
| `fact_customer_goal` | confirmação; roteamento (→ `qualification`) | T4.3 | F1 | Gate de saída de F1; absorve objetivo + programa |
| `fact_estado_civil` | confirmação **hard** | T4.3 | F2 | Base do `fact_process_mode` |
| `fact_process_mode` | roteamento (`qualification_special`) | T4.1 context; T4.3 | F2 | Group III; recalculado a cada turno |
| `fact_p3_required` | roteamento (`qualification_special`) | T4.3 | F2 | Group III; dispara trilha P3 |
| `fact_monthly_income_p1` | obrigação + confirmação | T4.3; T4.4 rastro | F3 | Fato mais impactante para `derived_subsidy_band_hint` |
| `fact_work_regime_p1` | obrigação | T4.3 | F3 | Group IV; determina sub-fluxo autônomo vs CLT |
| `fact_ctps_36m_p1` | obrigação (CLT) | T4.3 | F3 | Group IV |
| `fact_autonomo_has_ir_p1` | obrigação (autônomo) | T4.3 | F3 | Group IV; específico para regime autônomo |
| `fact_monthly_income_p3` | obrigação (P3) | T4.3 | F3 | Group VI; só se `fact_p3_required = true` |
| `derived_subsidy_band_hint` | — (derived, calculado em T4.3) | T4.3 | F3 | Critério de saída de F3; nunca promete aprovação |
| `fact_credit_restriction` | obrigação + bloqueio (potencial) | T4.3 | F4 | Group VII; regra de bloqueio hard definida em PR-T5.5 |
| `fact_restriction_regularization_status` | sugestão_mandatória | T4.3 | F4 | Group VII; só se `fact_credit_restriction = true` |
| `derived_eligibility_probable` | roteamento (`ACAO_INELEGIBILIDADE` se inviável) | T4.3; T4.4 | F4 | Critério de saída de F4 |
| `fact_doc_identity_status` | obrigação (docs) | T4.3; T4.4 | F5 | Group IX |
| `fact_doc_income_status` | obrigação (docs) | T4.3; T4.4 | F5 | Group IX |
| `derived_doc_risk` | sugestão_mandatória | T4.3; T4.4 | F5 | Avalia completude documental |
| `fact_visit_interest` | confirmação; roteamento (`visit_conversion`) | T4.3 | F5 | Group X |
| `fact_has_fgts` | sugestão_mandatória (informativa) | T4.3 | FI | Group VII; coletado na fase informativa; persiste normalmente |
| `fact_entry_reserve_signal` | sugestão_mandatória (informativa) | T4.3 | FI | Group VII; coletado na fase informativa; persiste normalmente |

---

## §8 Ordem de migração e dependências

```
PR-T5.2 (F1 — Abertura/topo)
     │
     └─→ PR-T5.3 (F2 — Qualificação/composição)     [desbloqueada após Bloco E de T5.2]
               │
               └─→ PR-T5.4 (F3 — Renda/regime)     [desbloqueada após Bloco E de T5.3]
                         │
                         └─→ PR-T5.5 (F4 — Elegibilidade/restrição)   [após Bloco E de T5.4]
                                   │
                                   └─→ PR-T5.6 (F5 — Docs/visita/handoff)   [após Bloco E de T5.5]
                                             │
                                             └─→ PR-T5.7 (Paridade)   [após Blocos E T5.2–T5.6]
                                                       │
                                                       └─→ PR-T5.8 (Shadow/Sandbox)   [após T5.7]
                                                                 │
                                                                 └─→ PR-T5.R (Readiness G5)   [após T5.8]
```

**Regras de dependência:**

| Condição | Bloqueio |
|---|---|
| PR-T5.3 não abre sem Bloco E de PR-T5.2 | F1 deve estar concluída (evidência) |
| PR-T5.4 não abre sem Bloco E de PR-T5.3 | F2 deve estar concluída (evidência) |
| PR-T5.5 não abre sem Bloco E de PR-T5.4 | F3 deve estar concluída (evidência) |
| PR-T5.6 não abre sem Bloco E de PR-T5.5 | F4 deve estar concluída (evidência) |
| PR-T5.7 não abre sem Blocos E de PR-T5.2–T5.6 | Todas as 5 fatias core concluídas |
| PR-T5.8 não abre sem PR-T5.7 aprovada | Matriz de paridade verificada |
| PR-T5.R não abre sem PR-T5.8 aprovada | Shadow/sandbox executado |

---

## Bloco E — PR-T5.1 (v2 — corrigido)

### Evidências de conclusão

| Item contratual | Status | Evidência / localização |
|---|---|---|
| 45 stages legados mapeados para fatias T5 | **CONCLUÍDO** | §3.1 — tabela completa (45 linhas, 5 fatias) |
| 8 fatias definidas (F1–F5, FI, FP, FS) | **CONCLUÍDO** | §1 — tabela de visão geral |
| Critérios de entrada e saída por fatia | **CONCLUÍDO** | §4.x.6 e §4.x.7 de cada fatia |
| Fase informativa — 9 campos vs. T2 | **CONCLUÍDO** | §2.1 — 2 fact_keys T2 confirmadas + 7 lacunas informativas futuras |
| Fatos mínimos T2 por fatia (chaves canônicas) | **CONCLUÍDO** | §4.x.4 — exclusivamente chaves de T2_DICIONARIO_FATOS |
| Lacunas de schema futuras identificadas | **CONCLUÍDO** | §3.1 marcações [LSF]; tabela LF-01..LF-07 |
| Políticas T3 por fatia (5 classes) | **CONCLUÍDO** | §4.x.5 de F1–F5 |
| Relação com pipeline T4 por fatia | **CONCLUÍDO** | §4.x.8 de F1–F5 |
| Correções de tipo semântico | **CONCLUÍDO** | §5 — 8 correções com chave T2 canônica |
| Anti-padrões proibidos | **CONCLUÍDO** | §6 — 12 anti-padrões (AP-01 a AP-12) |
| Validação cruzada T2/T3/T4 | **CONCLUÍDO** | §7 — 20 entradas com chaves canônicas |
| Ordem de migração e dependências | **CONCLUÍDO** | §8 — grafo + tabela de regras |
| `current_phase = encerramento` eliminado | **CORRIGIDO** | §4.4.5; §3.1 `fim_inelegivel`; AP-10 |
| Próximo artefato: `T5_FATIA_TOPO_ABERTURA.md` | **CORRIGIDO** | §8; Bloco E próxima PR |

### Status

**CONCLUÍDA** — PR-T5.1 v2 entregue; contrato T5 permanece `aberto`.

### Próxima PR autorizada

**PR-T5.2 — Contrato da fatia topo / abertura / primeira intenção**
Artefato: `schema/implantation/T5_FATIA_TOPO_ABERTURA.md`
7 stages: `inicio`, `inicio_decisao`, `inicio_nome`, `inicio_programa`, `inicio_nacionalidade`,
`inicio_rnm`, `inicio_tem_validade`
`current_phase: discovery`
