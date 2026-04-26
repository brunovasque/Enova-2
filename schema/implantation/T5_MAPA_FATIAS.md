# T5_MAPA_FATIAS — Mapa de Fatias do Funil Core e Ordem de Migração — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.1 |
| Branch | feat/t5-pr5-1-mapa-fatias |
| Status | entregue |
| Pré-requisito | PR-T5.0 — CONTRATO_IMPLANTACAO_MACRO_T5.md aprovado |
| Autoriza | PR-T5.2 (contrato F1: Abertura/topo) |
| Data | 2026-04-26 |

## Finalidade

Este documento define o **mapa canônico de fatias** do funil core da ENOVA 2:

- Inventário completo dos **45 stages legados** com classificação por fatia T5
- Ordem de migração e dependências entre fatias
- Fatos mínimos (T2), políticas T3 e relação com pipeline T4 por fatia
- Critérios de entrada e saída de cada fatia
- Fase informativa/comercial (transversal — 7 campos)
- Correções de tipo semântico em relação ao legado

**Princípio canônico:**

> Cada fatia é um **contrato de cobertura de casos** — não um roteiro de fala.
> O LLM decide como cobrir os casos dentro de cada fatia.
> Paridade funcional = mesmos casos cobertos, não mesma fala nem mesma sequência.
> Nenhuma fatia prescreve `reply_text`, pergunta fixa ou template de resposta.

**Documentos de base:**

- `T2_LEAD_STATE_V1.md` — 35 fact_*, 9 derived_*, 6 signal_*, current_phase values
- `T3_CLASSES_POLITICA.md` — 5 classes canônicas: bloqueio, obrigação, confirmação, sugestão_mandatória, roteamento
- `T3_ORDEM_AVALIACAO_COMPOSICAO.md` — pipeline de 6 estágios por turno
- `T4_ENTRADA_TURNO.md` / `T4_PIPELINE_LLM.md` — TurnoEntrada, contrato único LLM, reply_text imutável
- `CONTRATO_IMPLANTACAO_MACRO_T5.md` — §7 CA-01/CA-05/CA-08; §9 B-04/B-07

---

## §1 Visão geral das fatias

| # | Fatia | Nome | Stages legados | current_phase(s) | PR contrato | Depende de |
|---|---|---|---|---|---|---|
| F1 | Fatia 1 | Abertura / topo | 7 | `discovery` | PR-T5.2 | — |
| F2 | Fatia 2 | Qualificação inicial / composição familiar | 7 | `qualification` | PR-T5.3 | F1 concluída |
| F3 | Fatia 3 | Renda / regime / composição | 21 | `qualification`, `qualification_special` | PR-T5.4 | F2 concluída |
| F4 | Fatia 4 | Elegibilidade / restrição | 5 | `qualification`, `qualification_special` | PR-T5.5 | F3 concluída |
| F5 | Fatia 5 | Documentação / visita / handoff | 5 | `docs_prep` → `visit_conversion` | PR-T5.6 | F4 concluída |
| FI | Fase Inf. | Fase informativa / comercial (transversal) | — (7 campos) | `discovery`, `qualification` | — transversal | — |
| FP | Paridade | Matriz de paridade funcional | — | todos | PR-T5.7 | F1–F5 concluídas |
| FS | Shadow | Plano de shadow controlado / sandbox | — | todos | PR-T5.8 | FP concluída |

**Total stages legados mapeados:** 7 + 7 + 21 + 5 + 5 = **45**

---

## §2 Fase informativa / comercial (transversal)

A fase informativa/comercial é **transversal** — não é uma fatia sequencial, mas um conjunto de
campos informativos que o LLM pode coletar em qualquer momento conversacional adequado
(tipicamente durante `discovery` ou início de `qualification`).

Esses campos **não são critérios de saída de nenhuma fatia** e **não bloqueiam nenhum avanço de
`current_phase`**. São enriquecimento contextual que melhora a qualidade da orientação.

### 2.1 Campos informativos — mapeamento T2

| Campo informativo | Tipo semântico | Chave T2 canônica | Status T2 |
|---|---|---|---|
| Preferência de localização da moradia | enum / text | — | **Lacuna informativa futura** — sem fact_key canônica em T2; não aciona política T3 |
| Localização atual (bairro / cidade) | enum / text | — | **Lacuna informativa futura** — sem fact_key canônica em T2 |
| Localização do trabalho | enum / text | — | **Lacuna informativa futura** — sem fact_key canônica em T2 |
| FGTS (tem ou não tem) | boolean | `fact_has_fgts` (Group VII) | **Existe em T2** — persistir via T4.3 normalmente |
| Curso superior (autônomo) | boolean / text | — | **Lacuna informativa futura** — sem fact_key canônica em T2; relevante para autônomo |
| Profissão (autônomo) | enum / text | — | **Lacuna informativa futura** — sem fact_key canônica em T2 |
| Valor de entrada disponível | number / signal | `fact_entry_reserve_signal` (Group VII) | **Existe em T2** — persistir via T4.3 normalmente |

### 2.2 Observações sobre lacunas

Os campos marcados "Lacuna informativa futura" **não têm fact_key canônica em T2_DICIONARIO_FATOS**.
O LLM pode coletar e usar essas informações conversacionalmente, mas:

- Não podem ser persistidos como fatos canônicos T2 até que uma fact_key seja declarada em PR futura
- Não podem acionar políticas T3 (nenhuma regra pode referenciar campo sem chave canônica)
- Não são critérios de entrada ou saída de nenhuma fatia
- O LLM não é impedido de abordar esses temas — é impedido de tratar a ausência como bloqueio

---

## §3 Mapeamento completo: 45 stages legados → fatias T5

### 3.1 Tabela de mapeamento

| Stage legado | Fatia | Objetivo operacional | Fatos T2 coletados / confirmados | Políticas T3 aplicáveis | PR | Tipo semântico correto | Observação |
|---|---|---|---|---|---|---|---|
| `inicio` | F1 | Identificar canal / intent e abrir atendimento | `fact_is_buyer_confirmed`, `fact_program_intent` | sugestão_mandatória (engajamento); roteamento (→ discovery) | T5.2 | boolean / enum | Ponto de entrada; sem bloqueio hard |
| `inicio_decisao` | F1 | Confirmar intenção de compra | `fact_is_buyer_confirmed` | confirmação (se captured); roteamento (confirmado → F2) | T5.2 | **boolean** | Legacy expected pode mostrar number — tipo correto: boolean |
| `inicio_nome` | F1 | Capturar nome do lead | `fact_whatsapp_name` | obrigação (nome ausente) | T5.2 | text | |
| `inicio_programa` | F1 | Identificar programa de interesse | `fact_program_intent` | obrigação (ausente); roteamento (MCMV vs outro) | T5.2 | **enum** | Legacy pode mostrar number — tipo correto: enum (Faixa 1/2/3) |
| `inicio_nacionalidade` | F1 | Capturar nacionalidade | `fact_nationality` | obrigação (ausente); confirmação (se captured) | T5.2 | enum | Insumo crítico de R_ESTRANGEIRO_SEM_RNM |
| `inicio_rnm` | F1 | Capturar status do RNM (estrangeiros) | `fact_rnm_status` | obrigação (ausente p/ estrangeiro); bloqueio (sem_rnm / vencido / inválido + confirmed) | T5.2 | enum | Aciona bloqueio hard se estrangeiro sem RNM válido |
| `inicio_tem_validade` | F1 | Verificar validade do RNM | `fact_rnm_expiry_date` | confirmação (validade); bloqueio (vencido) | T5.2 | date | Só ativado se `fact_nationality = estrangeiro` |
| `estado_civil` | F2 | Coletar estado civil | `fact_marital_status` | obrigação (ausente); confirmação (se captured) | T5.3 | enum | |
| `confirmar_casamento` | F2 | Confirmar status conjugal explicitamente | `fact_marital_status`, `fact_spouse_present` | confirmação **hard** — base de process_mode | T5.3 | boolean | Deve elevar `fact_marital_status` para `confirmed` |
| `interpretar_composicao` | F2 | Determinar modo de processo (solo / duo / P3) | `fact_process_mode` (derived) | roteamento (→ qualification_special se P3 detectado) | T5.3 | enum | `derived_process_mode_recommended` alimenta decisão |
| `confirmar_avo_familiar` | F2 | Confirmar composição familiar ampliada | `fact_family_composition` | confirmação (se composição ambígua) | T5.3 | enum / text | Especialmente relevante para P3 |
| `dependente` | F2 | Capturar número de dependentes | `fact_dependent_count` | obrigação (se ausente e relevante para bracket) | T5.3 | **integer** | Contagem inteira não-negativa |
| `financiamentos_conjunto` | F2 | Verificar financiamentos anteriores do grupo | `fact_has_prior_financing` | obrigação (ausente); bloqueio (se prior_financing hard — regra T5.3) | T5.3 | boolean | |
| `quem_pode_somar` | F2 | Identificar membros que podem compor renda | `fact_family_composition`, `fact_process_mode` | sugestão_mandatória (composição sugerida); roteamento | T5.3 | enum / text | Insumo para F3 |
| `regime_trabalho` | F3 | Coletar regime de trabalho P1 | `fact_work_regime_p1` | obrigação (ausente); roteamento (CLT / autônomo / servidor) | T5.4 | **enum** | Legacy pode mostrar number — tipo correto: enum |
| `renda` | F3 | Coletar renda mensal P1 | `fact_monthly_income_p1` | obrigação (ausente); confirmação (se captured) | T5.4 | number (BRL) | Tipo correto: number — fato mais impactante para bracket |
| `ctps_36` | F3 | Verificar 36 meses de CTPS P1 | `fact_ctps_36_months_p1` | obrigação (ausente para CLT); confirmação; roteamento | T5.4 | **boolean** | Legacy pode mostrar number — tipo correto: boolean |
| `ir_declarado` | F3 | Verificar declaração de IR — P1 | `fact_income_tax_declared` | confirmação (impacto autônomo); sugestão_mandatória | T5.4 | **boolean** | Legacy pode mostrar number — tipo correto: boolean |
| `possui_renda_extra` | F3 | Verificar renda extra / complementar P1 | `fact_has_extra_income` | obrigação (se autônomo com renda mista); sugestão_mandatória | T5.4 | boolean | |
| `inicio_multi_renda_pergunta` | F3 | Introduzir coleta de múltiplas rendas | — | sugestão_mandatória (composição complexa detectada) | T5.4 | — | Stage de transição; não persiste fato novo isoladamente |
| `inicio_multi_renda_coletar` | F3 | Coletar cada renda adicional | `fact_has_extra_income`, `fact_monthly_income_p1` | obrigação (renda adicional pendente) | T5.4 | number | |
| `inicio_multi_regime_pergunta` | F3 | Introduzir coleta de múltiplos regimes | — | sugestão_mandatória | T5.4 | — | Stage de transição; não persiste fato novo isoladamente |
| `inicio_multi_regime_coletar` | F3 | Coletar cada regime adicional | `fact_work_regime_p1` | obrigação (regime adicional pendente) | T5.4 | enum | |
| `renda_mista_detalhe` | F3 | Detalhar composição de renda mista P1 | `fact_work_regime_p1`, `fact_monthly_income_p1` | confirmação (renda mista ambígua); sugestão_mandatória | T5.4 | text / number | |
| `autonomo_compor_renda` | F3 | Verificar como autônomo compõe renda | `fact_work_regime_p1`, `fact_income_tax_declared` | obrigação (IR ausente para autônomo); confirmação | T5.4 | enum / boolean | Específico para regime autônomo |
| `parceiro_tem_renda` | F3 | Verificar se parceiro P2 tem renda | `fact_work_regime_p2`, `fact_monthly_income_p2` | obrigação (se process_mode = duo); roteamento | T5.4 | boolean | Ativado quando `fact_process_mode = duo` |
| `regime_trabalho_parceiro` | F3 | Coletar regime de trabalho P2 | `fact_work_regime_p2` | obrigação (ausente para P2); roteamento | T5.4 | enum | |
| `regime_trabalho_parceiro_familiar` | F3 | Coletar regime de membro familiar que compõe | `fact_work_regime_p2` | obrigação (ausente para P3) | T5.4 | enum | Específico para composição ampliada P3 |
| `renda_parceiro` | F3 | Coletar renda P2 | `fact_monthly_income_p2` | obrigação (ausente para duo); confirmação | T5.4 | number (BRL) | |
| `renda_parceiro_familiar` | F3 | Coletar renda de membro familiar | `fact_family_income` | obrigação (ausente para P3) | T5.4 | number (BRL) | |
| `renda_familiar_valor` | F3 | Consolidar renda familiar total | `fact_family_income`, `derived_total_household_income` | confirmação (valor consolidado) | T5.4 | number (BRL) | `derived_total_household_income` calculado aqui |
| `somar_renda_familiar` | F3 | Confirmar composição de renda com familiar | `fact_family_composition` | confirmação; sugestão_mandatória | T5.4 | boolean | |
| `somar_renda_solteiro` | F3 | Tratar composição solteiro com familiar | `fact_marital_status`, `fact_family_income` | sugestão_mandatória (composição mista solteiro) | T5.4 | boolean | |
| `sugerir_composicao_mista` | F3 | Sugerir composição mista ao lead | `derived_composicao_sugerida` | sugestão_mandatória (`derived_composicao_sugerida` ativo) | T5.4 | — | Sugestão — não força composição; LLM decide a fala |
| `ctps_36_parceiro` | F3 | Verificar CTPS 36 meses do parceiro P2 | `fact_ctps_36_months_p2` | obrigação (ausente para CLT P2) | T5.4 | **boolean** | Legacy pode mostrar number — tipo correto: boolean |
| `restricao` | F4 | Verificar restrição financeira (CPF / SERASA) | `fact_has_restriction` | obrigação (ausente); bloqueio (se restrição hard — regra T5.5); confirmação | T5.5 | **boolean** | Legacy pode mostrar number — tipo correto: boolean |
| `regularizacao_restricao` | F4 | Tratar possibilidade de regularização | `fact_has_restriction` | sugestão_mandatória (caminho de regularização); roteamento | T5.5 | enum / boolean | Só ativado se `fact_has_restriction = true` |
| `fim_inelegivel` | F4 | Encerrar case por inelegibilidade | `derived_eligibility_flag` | bloqueio (terminal); roteamento (abort) | T5.5 | — | Roteamento tipo `abort`; encerra o case com dignidade |
| `verificar_averbacao` | F4 | Verificar averbação de divórcio | `fact_averbation_status` | obrigação (ausente para divorciado); confirmação | T5.5 | enum | Ativado quando `fact_marital_status = divorciado` |
| `verificar_inventario` | F4 | Verificar inventário / espólio (viúvo) | `fact_has_prior_property`, `fact_averbation_status` | obrigação; confirmação (status inventário) | T5.5 | enum | Ativado quando `fact_marital_status = viúvo` |
| `envio_docs` | F5 | Orientar envio de documentação | `fact_docs_ready` | obrigação (docs ausentes); sugestão_mandatória (orientação de docs) | T5.6 | boolean | Inicia `docs_prep` |
| `agendamento_visita` | F5 | Agendar visita ao imóvel / correspondente | `fact_visit_scheduled` | obrigação (agendamento pendente); confirmação | T5.6 | boolean | |
| `aguardando_retorno_correspondente` | F5 | Registrar estado de espera / correspondente | `fact_broker_assigned` | roteamento (→ `awaiting_broker`); sugestão_mandatória | T5.6 | enum | `current_phase = awaiting_broker` |
| `finalizacao` | F5 | Confirmar encerramento positivo do funil | `derived_docs_completeness`, `fact_broker_assigned` | roteamento (`broker_handoff`); confirmação | T5.6 | — | Produto final do funil core |
| `finalizacao_processo` | F5 | Registrar encerramento do processo | `fact_broker_assigned`, `fact_visit_scheduled` | roteamento (`visit_conversion`); sugestão_mandatória | T5.6 | — | `current_phase = visit_conversion` |

**Contagem de stages por fatia:**

| Fatia | Stages | Total |
|---|---|---|
| F1 | inicio, inicio_decisao, inicio_nome, inicio_programa, inicio_nacionalidade, inicio_rnm, inicio_tem_validade | 7 |
| F2 | estado_civil, confirmar_casamento, interpretar_composicao, confirmar_avo_familiar, dependente, financiamentos_conjunto, quem_pode_somar | 7 |
| F3 | regime_trabalho, renda, ctps_36, ir_declarado, possui_renda_extra, inicio_multi_renda_pergunta, inicio_multi_renda_coletar, inicio_multi_regime_pergunta, inicio_multi_regime_coletar, renda_mista_detalhe, autonomo_compor_renda, parceiro_tem_renda, regime_trabalho_parceiro, regime_trabalho_parceiro_familiar, renda_parceiro, renda_parceiro_familiar, renda_familiar_valor, somar_renda_familiar, somar_renda_solteiro, sugerir_composicao_mista, ctps_36_parceiro | 21 |
| F4 | restricao, regularizacao_restricao, fim_inelegivel, verificar_averbacao, verificar_inventario | 5 |
| F5 | envio_docs, agendamento_visita, aguardando_retorno_correspondente, finalizacao, finalizacao_processo | 5 |
| **Total** | | **45** |

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
| `fact_is_buyer_confirmed` | Group I | `confirmed` | Intenção de compra confirmada |
| `fact_whatsapp_name` | Group I | `captured` | Nome capturado (confirmado, se possível) |
| `fact_program_intent` | Group I | `confirmed` | MCMV confirmado |
| `fact_nationality` | Group II | `confirmed` | Obrigatório para avaliar RNM |
| `fact_rnm_status` | Group II | `confirmed` | **Somente se** `fact_nationality = estrangeiro` |
| `fact_rnm_expiry_date` | Group II | `confirmed` | **Somente se** `fact_nationality = estrangeiro` E RNM com validade |

#### 4.1.5 Políticas T3 aplicáveis em F1

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação de nome | obrigação | `fact_whatsapp_name` ausente | `must_ask_now` ← `fact_whatsapp_name` |
| Obrigação de programa | obrigação | `fact_program_intent` ausente | `must_ask_now` ← `fact_program_intent` |
| Confirmação de intenção | confirmação | `fact_is_buyer_confirmed` em `captured` | `needs_confirmation = true` |
| Confirmação de nacionalidade | confirmação | `fact_nationality` em `captured` | Eleva para `confirmed` antes de avaliar RNM |
| Bloqueio RNM | **bloqueio** | estrangeiro + `fact_rnm_status` ∈ {sem_rnm, vencido, inválido} + `confirmed` | `blocked_by` ← R_ESTRANGEIRO_SEM_RNM; `advance_allowed = false` |
| Roteamento discovery → qualification | roteamento | F1 concluída (todos critérios de saída atendidos) | `current_phase = qualification` |

#### 4.1.6 Critérios de entrada

- `lead_state` inicializado (novo lead ou retomada)
- `operational.current_phase` nulo, `discovery`, ou ausente

#### 4.1.7 Critérios de saída — pronto para F2

- `fact_is_buyer_confirmed = true` e `confirmed`
- `fact_nationality` confirmado
- SE estrangeiro: `fact_rnm_status` confirmado **e** sem bloqueio ativo de R_ESTRANGEIRO_SEM_RNM
- `fact_program_intent` confirmado (MCMV)
- `operational.blocked_by` vazio

#### 4.1.8 Relação com T4

- `TurnoEntrada.operational.current_phase = "discovery"`
- `TurnoEntrada.lead_state.facts` contém os fatos de F1 com seus status
- Bloqueio RNM ativo entra em `TurnoEntrada.policy_context.prior_decisions`
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
| `fact_marital_status` | Group III | `confirmed` | Base do `process_mode` |
| `fact_process_mode` | Group III (derived) | calculado | Solo / duo / P3 — via `derived_process_mode_recommended` |
| `fact_spouse_present` | Group III | `confirmed` | **Somente se** `process_mode = duo` |
| `fact_family_composition` | Group IV | `captured` mínimo | Dependentes e familiares identificados |
| `fact_dependent_count` | Group IV | `captured` | Contagem de dependentes |
| `fact_has_prior_financing` | Group VIII | `confirmed` | Verificação MCMV obrigatória |

#### 4.2.5 Políticas T3 aplicáveis em F2

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação estado civil | obrigação | `fact_marital_status` ausente | `must_ask_now` ← `fact_marital_status` |
| Confirmação casamento | confirmação **hard** | `fact_marital_status` em `captured` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR` |
| Roteamento P3 | roteamento (special) | `derived_p3_required = true` | `current_phase = qualification_special` |
| Sugestão composição | sugestão_mandatória | `derived_composicao_sugerida` ativo | Orientar LLM a apresentar opção de composição |
| Bloqueio financiamento | **bloqueio** | `fact_has_prior_financing = true` + regra terminal (T5.3) | `blocked_by` ← R_PRIOR_FINANCING (regra definida em PR-T5.3) |

#### 4.2.6 Critérios de entrada

- F1 concluída: `fact_is_buyer_confirmed = true` + `confirmed`; `fact_nationality` confirmado; sem bloqueio ativo
- `operational.current_phase = qualification`

#### 4.2.7 Critérios de saída — pronto para F3

- `fact_marital_status` confirmado
- `fact_process_mode` calculado (derived)
- `fact_has_prior_financing` confirmado
- SE duo: `fact_spouse_present` confirmado
- Sem bloqueio ativo de financiamento anterior
- `derived_p3_required` avaliado; se `true` → `current_phase = qualification_special` já disparado

#### 4.2.8 Relação com T4

- `TurnoEntrada.operational.current_phase = "qualification"`
- Roteamento `qualification_special` disparado pelo mecânico via T4.3 se `derived_p3_required = true`
- O LLM recebe novo `current_phase` via `TurnoEntrada` e conduz transição com naturalidade
- `derived_process_mode_recommended` disponível em `TurnoEntrada.lead_state.derived` para o LLM raciocinar

---

### F3 — Fatia 3: Renda / regime / composição

#### 4.3.1 Objetivo

Coletar e confirmar todas as rendas e regimes de trabalho relevantes (P1, P2, familiar) para
calcular `derived_total_household_income` e determinar `derived_program_bracket`.

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
| `fact_work_regime_p1` | Group V | `confirmed` | Sempre |
| `fact_monthly_income_p1` | Group V | `confirmed` | Sempre |
| `fact_ctps_36_months_p1` | Group V | `confirmed` | SE `work_regime_p1 = CLT` |
| `fact_income_tax_declared` | Group V | `captured` | SE `work_regime_p1 = autônomo` |
| `fact_has_extra_income` | Group V | `captured` | Se aplicável |
| `fact_work_regime_p2` | Group VI | `confirmed` | SE `process_mode = duo` |
| `fact_monthly_income_p2` | Group VI | `confirmed` | SE `process_mode = duo` |
| `fact_ctps_36_months_p2` | Group VI | `confirmed` | SE `work_regime_p2 = CLT` |
| `fact_family_income` | Group IV | `captured` | SE P3 / composição ampliada |
| `derived_total_household_income` | derived | calculado | Obrigatório na saída — independente de composição |
| `derived_program_bracket` | derived | calculado | Obrigatório na saída |

#### 4.3.5 Políticas T3 aplicáveis em F3

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação regime P1 | obrigação | `fact_work_regime_p1` ausente | `must_ask_now` ← `fact_work_regime_p1` |
| Obrigação renda P1 | obrigação | `fact_monthly_income_p1` ausente | `must_ask_now` ← `fact_monthly_income_p1` |
| Obrigação CTPS P1 (CLT) | obrigação | CLT + `fact_ctps_36_months_p1` ausente | `must_ask_now` ← `fact_ctps_36_months_p1` |
| Obrigação IR (autônomo) | obrigação | autônomo + `fact_income_tax_declared` ausente | `must_ask_now` ← `fact_income_tax_declared` |
| Obrigação renda P2 | obrigação | duo + `fact_monthly_income_p2` ausente | `must_ask_now` ← `fact_monthly_income_p2` |
| Obrigação regime P2 | obrigação | duo + `fact_work_regime_p2` ausente | `must_ask_now` ← `fact_work_regime_p2` |
| Confirmação renda P1 | confirmação | `fact_monthly_income_p1` em `captured` | `needs_confirmation = true` |
| Confirmação renda familiar | confirmação | `fact_family_income` em `captured` (P3) | Confirmar antes de calcular derived |
| Sugestão composição mista | sugestão_mandatória | `derived_composicao_sugerida` ativo | Orientar apresentação de opção mista |

#### 4.3.6 Critérios de entrada

- F2 concluída: `fact_marital_status` + `fact_process_mode` confirmados; `fact_has_prior_financing` confirmado
- `operational.current_phase = qualification` ou `qualification_special`
- Sem bloqueio ativo de F2

#### 4.3.7 Critérios de saída — pronto para F4

- `fact_work_regime_p1` + `fact_monthly_income_p1` confirmados
- SE CLT: `fact_ctps_36_months_p1` confirmado
- SE duo: `fact_work_regime_p2` + `fact_monthly_income_p2` confirmados
- `derived_total_household_income` calculado
- `derived_program_bracket` calculado
- `operational.must_ask_now` vazio (sem obrigações de renda pendentes)

#### 4.3.8 Relação com T4

- `TurnoEntrada.operational.must_ask_now` contém obrigações de renda pendentes
- `TurnoEntrada.policy_context.prior_decisions` lista obrigações acumuladas (prioridade ordenada T3)
- `TurnoSaida.extracted_facts` alimenta cálculo de `derived_total_household_income` em T4.3
- `qualification_special` ativo via roteamento T3 — LLM recebe `current_phase = qualification_special`
  e conduz coleta ampliada sem roteirização

---

### F4 — Fatia 4: Elegibilidade / restrição

#### 4.4.1 Objetivo

Verificar condições de elegibilidade que podem bloquear o processo: restrições financeiras,
imóvel anterior, financiamentos e situações documentais especiais (divórcio sem averbação,
inventário). Calcular `derived_eligibility_flag` definitivo.

#### 4.4.2 `current_phase` ativo

`qualification` (final) ou `qualification_special`

#### 4.4.3 Stages legados cobertos (5)

`restricao`, `regularizacao_restricao`, `fim_inelegivel`, `verificar_averbacao`,
`verificar_inventario`

#### 4.4.4 Fatos mínimos (T2) — obrigatórios na saída de F4

| Fato | Grupo T2 | Status mínimo na saída | Condição |
|---|---|---|---|
| `fact_has_restriction` | Group VIII | `confirmed` | Sempre |
| `fact_has_prior_property` | Group VIII | `confirmed` | Sempre |
| `fact_has_prior_financing` | Group VIII | `confirmed` | Já coletado em F2; confirmar se apenas `captured` |
| `fact_averbation_status` | Group VIII | `confirmed` | SE `fact_marital_status = divorciado` |
| `derived_eligibility_flag` | derived | calculado | Obrigatório na saída |

#### 4.4.5 Políticas T3 aplicáveis em F4

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação restrição | obrigação | `fact_has_restriction` ausente | `must_ask_now` ← `fact_has_restriction` |
| Bloqueio restrição hard | **bloqueio** | `fact_has_restriction = true` + regra terminal (T5.5) | `blocked_by` ← R_RESTRICAO_HARD |
| Sugestão regularização | sugestão_mandatória | `fact_has_restriction = true` + regra não-terminal | Orientar caminho de regularização |
| Roteamento inelegibilidade | roteamento (abort) | `derived_eligibility_flag = ineligible` | `current_phase = encerramento`; `current_objective = OBJ_INELEGIVEL` |
| Obrigação averbação | obrigação | divorciado + `fact_averbation_status` ausente | `must_ask_now` ← `fact_averbation_status` |
| Confirmação propriedade anterior | confirmação | `fact_has_prior_property` em `captured` | `needs_confirmation = true` |

#### 4.4.6 Critérios de entrada

- F3 concluída: `derived_total_household_income` calculado; `derived_program_bracket` definido
- `operational.must_ask_now` vazio (obrigações de renda resolvidas)

#### 4.4.7 Critérios de saída — pronto para F5

- `fact_has_restriction` confirmado
- `fact_has_prior_property` confirmado
- SE divorciado: `fact_averbation_status` confirmado
- `derived_eligibility_flag = eligible` ou `conditional`
- `operational.blocked_by` vazio

#### 4.4.8 Relação com T4

- `TurnoEntrada.operational.elegibility_status` reflete estado atual (`eligible` / `conditional` / `ineligible`)
- Roteamento abort disparado pelo mecânico via T4.3 atualiza `current_phase = encerramento`
- O LLM recebe `current_objective = OBJ_INELEGIVEL` e conduz encerramento com dignidade
- Nenhum componente escreve texto de inelegibilidade — o LLM decide a fala

---

### F5 — Fatia 5: Documentação / visita / handoff

#### 4.5.1 Objetivo

Concluir o funil core: orientar envio de documentação, agendar visita e realizar o handoff para
o correspondente / corretor.

#### 4.5.2 `current_phase` ativo

`docs_prep` → `docs_collection` → `broker_handoff` → `awaiting_broker` → `visit_conversion`

#### 4.5.3 Stages legados cobertos (5)

`envio_docs`, `agendamento_visita`, `aguardando_retorno_correspondente`, `finalizacao`,
`finalizacao_processo`

#### 4.5.4 Fatos mínimos (T2) — obrigatórios na saída de F5

| Fato | Grupo T2 | Status mínimo na saída | Observação |
|---|---|---|---|
| `fact_docs_ready` | Group IX | `confirmed` | Docs enviados e confirmados |
| `fact_visit_scheduled` | Group IX | `confirmed` | Visita agendada |
| `fact_broker_assigned` | Group IX | `confirmed` | Correspondente designado |
| `derived_docs_completeness` | derived | calculado | Grau de completude da documentação |

#### 4.5.5 Políticas T3 aplicáveis em F5

| Política | Classe | Condição de disparo | Efeito no `lead_state` |
|---|---|---|---|
| Obrigação docs | obrigação | `fact_docs_ready = false` ou ausente | `must_ask_now` ← orientação docs |
| Sugestão orientação docs | sugestão_mandatória | `derived_docs_completeness` abaixo de threshold | Orientar quais docs faltam |
| Roteamento handoff | roteamento | `fact_docs_ready = true` + `fact_broker_assigned` | `current_phase = broker_handoff` |
| Roteamento await | roteamento | handoff feito + retorno pendente | `current_phase = awaiting_broker` |
| Roteamento visit | roteamento | `fact_visit_scheduled = true` | `current_phase = visit_conversion` |
| Confirmação visita | confirmação | `fact_visit_scheduled` em `captured` | `needs_confirmation = true` |

#### 4.5.6 Critérios de entrada

- F4 concluída: `derived_eligibility_flag = eligible` ou `conditional`; sem bloqueios ativos
- `operational.current_phase` avança para `docs_prep`

#### 4.5.7 Critérios de saída — funil core concluído

- `fact_docs_ready = true` + `confirmed`
- `fact_broker_assigned` confirmado
- `fact_visit_scheduled` confirmado OU `current_phase = awaiting_broker` registrado
- `derived_docs_completeness` ≥ threshold de handoff (definido em PR-T5.6)

#### 4.5.8 Relação com T4

- Roteamentos sequenciais (`docs_prep` → `docs_collection` → `broker_handoff` → `awaiting_broker`
  → `visit_conversion`) todos mediados pelo mecânico via T4.3
- O LLM recebe cada novo `current_phase` via `TurnoEntrada` e conduz transições naturalmente
- `TurnoSaida.recommended_next_actions` inclui ações de handoff mas nunca substitui a fala do LLM
- Imutabilidade de `reply_text` preservada em todas as transições de F5

---

## §5 Correções de tipo semântico em relação ao legado

O legado Enova 1 apresenta campos cujo tipo declarado no `expected` não reflete o significado
semântico correto. As correções abaixo são **canônicas para T5** — aplicam-se à persistência
em `lead_state` e ao contrato de cada fatia. O legado não é modificado.

| Stage legado | Campo legacy | Tipo legacy (`expected`) | Tipo semântico correto | Justificativa |
|---|---|---|---|---|
| `inicio_decisao` | decisao | number | **boolean** | Intenção de compra é yes/no; number não tem semântica aqui |
| `inicio_programa` | programa | number | **enum** | MCMV é categórico (Faixa 1/2/3); number não representa categoria |
| `regime_trabalho` | regime | number | **enum** | CLT / autônomo / servidor / MEI são categorias; number não captura distinção |
| `ctps_36` | ctps_meses | number | **boolean** | Critério binário: tem ou não tem 36 meses contínuos; o número bruto vai para T2 se relevante |
| `ctps_36_parceiro` | ctps_meses_parceiro | number | **boolean** | Mesmo critério para P2 |
| `ir_declarado` | ir | number | **boolean** | Declarou IR ou não: binário; não cardinal |
| `restricao` | tem_restricao | number | **boolean** | Restrição é yes/no; number não tem semântica aqui |
| `dependente` | qtd_dependentes | number | integer (não-negativo) | Correto como número, mas semanticamente é contagem inteira — não cardinal contínuo |

---

## §6 Anti-padrões proibidos

Os seguintes anti-padrões são **proibidos** em qualquer fatia T5, em qualquer PR T5.2–T5.R:

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
| AP-09 | Lacuna informativa (localização, profissão autônomo) como critério de saída de fatia | §2.2 — sem fact_key T2 canônica |
| AP-10 | Múltiplos roteamentos simultâneos no mesmo turno | T3_CLASSES_POLITICA §7 — múltiplos roteamentos: proibido |

---

## §7 Validação cruzada T2 / T3 / T4

| Fato T2 | Classe T3 principal | Etapa T4 afetada | Fatia | Observação |
|---|---|---|---|---|
| `fact_nationality` | confirmação → bloqueio (se estrangeiro) | T4.1 entrada; T4.3 persistência | F1 | Precede avaliação de RNM |
| `fact_rnm_status` | bloqueio (R_ESTRANGEIRO_SEM_RNM) | T4.3 validação | F1 | Bloqueio mais crítico do funil core |
| `fact_is_buyer_confirmed` | confirmação; roteamento (→ qualification) | T4.3 | F1 | Gate de saída de F1 |
| `fact_marital_status` | confirmação **hard** | T4.3 | F2 | Base do `process_mode` |
| `fact_process_mode` | roteamento (`qualification_special`) | T4.1 context; T4.3 | F2 | Derived — recalculado a cada turno |
| `fact_has_prior_financing` | obrigação; bloqueio (potencial) | T4.3 | F2 | Regra de bloqueio definida em PR-T5.3 |
| `fact_monthly_income_p1` | obrigação + confirmação | T4.3; T4.4 rastro | F3 | Fato mais impactante para `derived_program_bracket` |
| `fact_work_regime_p1` | obrigação | T4.3 | F3 | Determina sub-fluxo autônomo vs CLT |
| `derived_total_household_income` | — (derived, calculado em T4.3) | T4.3 | F3 | Critério de saída de F3 |
| `fact_has_restriction` | obrigação + bloqueio (potencial) | T4.3 | F4 | Regra de bloqueio hard definida em PR-T5.5 |
| `derived_eligibility_flag` | roteamento (abort se `ineligible`) | T4.3; T4.4 | F4 | Derived — determina continuidade ou encerramento |
| `fact_docs_ready` | obrigação | T4.3; T4.4 | F5 | Gatilho principal de handoff |
| `fact_broker_assigned` | roteamento (`broker_handoff`) | T4.3; T4.4 | F5 | Atribuído pelo mecânico pós-handoff |
| `fact_has_fgts` | sugestão_mandatória (informativa) | T4.3 | FI | Coletado na fase informativa; persiste normalmente |
| `fact_entry_reserve_signal` | sugestão_mandatória (informativa) | T4.3 | FI | Coletado na fase informativa; persiste normalmente |

---

## §8 Ordem de migração e dependências

```
PR-T5.2 (F1)
     │
     └─→ PR-T5.3 (F2)     [desbloqueada após Bloco E de T5.2]
               │
               └─→ PR-T5.4 (F3)   [desbloqueada após Bloco E de T5.3]
                         │
                         └─→ PR-T5.5 (F4)   [desbloqueada após Bloco E de T5.4]
                                   │
                                   └─→ PR-T5.6 (F5)   [desbloqueada após Bloco E de T5.5]
                                             │
                                             └─→ PR-T5.7 (Paridade)   [desbloqueada após Blocos E T5.2–T5.6]
                                                       │
                                                       └─→ PR-T5.8 (Shadow/Sandbox)   [desbloqueada após T5.7]
                                                                 │
                                                                 └─→ PR-T5.R (Readiness G5)   [desbloqueada após T5.8]
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

## Bloco E — PR-T5.1

### Evidências de conclusão

| Item contratual | Status | Evidência / localização |
|---|---|---|
| 45 stages legados mapeados para fatias T5 | **CONCLUÍDO** | §3.1 — tabela completa (45 linhas, 5 fatias) |
| 8 fatias definidas (F1–F5, FI, FP, FS) | **CONCLUÍDO** | §1 — tabela de visão geral |
| Critérios de entrada e saída por fatia | **CONCLUÍDO** | §4.x.6 e §4.x.7 de cada fatia |
| Fase informativa / comercial — 7 campos vs. T2 | **CONCLUÍDO** | §2.1 — lacunas identificadas; 2 fact_keys confirmadas |
| Fatos mínimos T2 por fatia | **CONCLUÍDO** | §4.x.4 de F1–F5 |
| Políticas T3 por fatia (5 classes) | **CONCLUÍDO** | §4.x.5 de F1–F5 |
| Relação com pipeline T4 por fatia | **CONCLUÍDO** | §4.x.8 de F1–F5 |
| Correções de tipo semântico | **CONCLUÍDO** | §5 — 8 correções declaradas |
| Anti-padrões proibidos | **CONCLUÍDO** | §6 — 10 anti-padrões (AP-01 a AP-10) |
| Validação cruzada T2/T3/T4 | **CONCLUÍDO** | §7 — 15 entradas cruzadas |
| Ordem de migração e dependências | **CONCLUÍDO** | §8 — grafo de dependências + tabela de regras |

### Status

**CONCLUÍDA** — PR-T5.1 entregue; contrato T5 permanece `aberto`.

### Próxima PR autorizada

**PR-T5.2** — Contrato de fatia F1: Abertura / topo
(7 stages: `inicio`, `inicio_decisao`, `inicio_nome`, `inicio_programa`, `inicio_nacionalidade`,
`inicio_rnm`, `inicio_tem_validade`)
