# T5_FATIA_RENDA_REGIME_COMPOSICAO — Contrato da Fatia F3: Renda / Regime / Composição — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.4 |
| Branch | feat/t5-pr5-4-fatia-renda-regime-composicao |
| Fatia | F3 — Renda / regime / composição |
| `current_phase` | `qualification` ou `qualification_special` |
| Status | entregue |
| Pré-requisito | PR-T5.3 merged; `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` vigente |
| Autoriza | PR-T5.5 — Contrato da fatia elegibilidade / restrição |
| Legados aplicáveis | L04 (obrigatório — mapa renda/regime Meio A), L05 (obrigatório — composição P2/P3 Meio A), L06 (obrigatório — multi-renda e IRPF) |
| Data | 2026-04-26 |
| Nota de artefato | O contrato T5 §6 S4 referencia `T5_FATIA_RENDA_REGIME.md`; por instrução Vasques (PR-T5.4 brief), o artefato usa o nome expandido `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` para refletir a cobertura integral de composição. Esta é a versão canônica desta PR. |

---

## Finalidade

Este documento é o **contrato declarativo da Fatia F3** — a terceira fatia do funil core da
ENOVA 2, correspondente à coleta e análise de renda, regime de trabalho e composição de renda
do processo de financiamento MCMV.

Ele formaliza, sem prescrever fala:

- O objetivo operacional da fatia e os 21 stages legados cobertos
- As regras comerciais validadas pelo Vasques para renda, regime e composição
- Os fatos mínimos canônicos T2 que a fatia deve coletar e confirmar
- As políticas T3 aplicáveis (sem nenhuma delas produzir `reply_text`)
- As lacunas de schema futuras (sem inventar `fact_*`)
- Os critérios de saída, anti-padrões e cenários sintéticos

**Princípio canônico desta fatia:**

> Toda renda precisa ter: dono, regime/tipo, valor aproximado, forma provável de comprovação
> e relação com o processo (P1, P2 ou P3). Nunca somar em número único sem origem.
> O LLM decide como cobrir cada caso — sem roteiro fixo, sem pergunta obrigatória de ordem.

---

## §1 Enunciado operacional

### 1.1 Objetivo da F3

Coletar e confirmar todos os dados de renda e regime de trabalho de cada pessoa do processo
(P1, P2, P3), alimentar o hint interno de faixa de subsídio (`derived_subsidy_band_hint` — hint interno, sem promessa e sem simulação) e determinar a viabilidade de composição,
deixando F4 com informação suficiente para avaliar elegibilidade e restrição.

F3 cobre:
- Regime(s) de trabalho de P1, P2 (se duo) e P3 (se P3)
- Renda de cada participante do processo
- IRPF de autônomos (P1 e P2; P3 via LF-02)
- CTPS 36 meses na ordem correta: P1 → P2 → P3 (P3 via LF-03)
- Identificação de múltiplas fontes de renda e renda mista
- Benefícios sociais não financiáveis para renda de financiamento
- Sugestão de composição quando renda é insuficiente
- Resolução da pendência de `fact_dependente` herdada de F2, quando renda aparece
- Sinal/faixa interna derivada de subsídio (`derived_subsidy_band_hint` — hint interno, não calcula aprovação, não calcula crédito, não calcula subsídio final)

### 1.2 `current_phase` ativo

`qualification` — para processos sem P3 ou quando P3 ainda não foi detectado
`qualification_special` — para processos com `fact_p3_required = true` (herdado de F2)

Ambos os valores são canônicos em `T2_LEAD_STATE_V1.md`. Nenhum valor novo de
`current_phase` pode ser criado nesta fatia.

### 1.3 Stages legados cobertos (21)

`regime_trabalho`, `renda`, `ctps_36`, `ir_declarado`, `possui_renda_extra`,
`inicio_multi_renda_pergunta`, `inicio_multi_renda_coletar`,
`inicio_multi_regime_pergunta`, `inicio_multi_regime_coletar`,
`renda_mista_detalhe`, `autonomo_compor_renda`,
`parceiro_tem_renda`, `regime_trabalho_parceiro`, `regime_trabalho_parceiro_familiar`,
`renda_parceiro`, `renda_parceiro_familiar`, `renda_familiar_valor`,
`somar_renda_familiar`, `somar_renda_solteiro`, `sugerir_composicao_mista`,
`ctps_36_parceiro`

---

## §2 Stages cobertos — objetivos e fatos

### 2.1 `regime_trabalho`

**Objetivo:** Identificar o regime de trabalho do P1 (titular do processo).

**Fatos envolvidos:** `fact_work_regime_p1` (Group IV)

**Valores canônicos de `fact_work_regime_p1`:** `CLT`, `autônomo`, `servidor`, `aposentado`,
`informal`, `múltiplo`

**Nota operacional:**
- "Desempregado" não tem valor canônico neste enum — ver LF-09
- Lead que recebe apenas Bolsa Família ou BPC sem trabalho formal → registrar
  `fact_benefits_signal` (Group VII) como ancora; regime permanece ausente ou
  `informal` provisoriamente; LF-05 declarada para classificação de benefício social não financiável
- `fact_work_regime_p1 = "múltiplo"` indica mais de um regime; `fact_has_multi_income_p1`
  deve ser confirmado em sequência
- Aposentado entra normalmente; pensionista requer distinção de tipo → LF-04

### 2.2 `renda`

**Objetivo:** Capturar o valor de renda mensal do P1.

**Fatos envolvidos:** `fact_monthly_income_p1` (Group IV)

**Nota operacional:**
- `fact_monthly_income_p1` representa a renda principal/total declarada do P1
- Para renda variável (autônomo com IRPF): usar renda declarada no IRPF
- Para autônomo sem IRPF: usar média estimada dos últimos meses — ver LF-07
- Para CLT com variação de holerite: usar média dos últimos 3 meses como estimativa
- Para renda mista (formal + informal): `fact_monthly_income_p1` captura o total
  declarado; detalhamento por parte → LF-01
- Nunca prometer aprovação com base na renda declarada aqui

### 2.3 `ctps_36`

**Objetivo:** Verificar se P1 possui 36 meses de registro em carteira (CTPS acumulados
de todos os empregos desde o primeiro).

**Fatos envolvidos:** `fact_ctps_36m_p1` (Group IV)

**Condição de ativação:** Sempre para P1 — independente de ser CLT, autônomo ou outro regime.

**Nota operacional:**
- Não é impeditivo se não tiver — ajuda na taxa de juros (taxa menor = melhor financiamento)
- Se P1 tem 36 meses: não precisa perguntar para P2/P3
- Se P1 não tem: perguntar para P2 (`ctps_36_parceiro`) → se P2 não tem: perguntar P3 (via LF-03)
- Basta uma pessoa do processo ter 36 meses para o benefício ser válido

### 2.4 `ir_declarado`

**Objetivo:** Verificar se P1 autônomo declarou Imposto de Renda de Pessoa Física no
último ano.

**Fatos envolvidos:** `fact_autonomo_has_ir_p1` (Group IV)

**Condição de ativação:** Somente SE `fact_work_regime_p1 = "autônomo"` (ou inclui autônomo
em regime múltiplo).

**Nota operacional:**
- Se declarou IRPF: renda autônoma fica formalizada; usar renda declarada; seguir processo
- Se não declarou IRPF e está sozinho: cenário difícil; sugerir composição (SGM-F3-02)
- Se não declarou IRPF em conjunto: não é impeditivo automático; pode agregar ao processo
- Se empresário: pró-labore pode justificar renda → LF-06
- CNPJ sozinho não serve para MCMV → LF-08

### 2.5 `possui_renda_extra`

**Objetivo:** Identificar se P1 tem mais de uma fonte de renda.

**Fatos envolvidos:** `fact_has_multi_income_p1` (Group IV), `signal_multi_income_p1` (signal)

**Nota operacional — REGRA CANÔNICA:**
> Nunca perguntar diretamente "você tem renda extra?" como pergunta principal — isso
> confunde com hora extra ou adicional. O correto é entender se o cliente tem mais de
> uma fonte de renda a partir do contexto da conversa.

- `signal_multi_income_p1` = sinal perceptivo detectado no turno (antes de confirmação)
- `fact_has_multi_income_p1` = fato confirmado diretamente pelo lead
- Se o lead já se declarou informal, não perguntar "renda extra" — ele já está
  declarando renda informal; seguir análise da composição/regime informal
- Exemplos de multi-renda: CLT + bico; CLT + outro CLT; aposentado + CLT;
  aposentado + informal; servidor + CLT; servidor + renda informal; MEI + CLT;
  autônomo + outra fonte

### 2.6 `inicio_multi_renda_pergunta`

**Objetivo:** Stage de transição para introduzir o entendimento de múltiplas rendas.

**Fatos envolvidos:** nenhum `fact_*` persistido isoladamente neste stage de transição

**Condição de ativação:** `signal_multi_income_p1 = true` detectado em turno anterior

**Nota:** Stage de navegação operacional; não persiste `fact_*` independentemente;
dispara coleta detalhada em `inicio_multi_renda_coletar`.

### 2.7 `inicio_multi_renda_coletar`

**Objetivo:** Coletar valor e fonte de cada renda adicional de P1.

**Fatos envolvidos:** `fact_monthly_income_p1` (atualizado/refinado), `fact_has_multi_income_p1`

**Nota:** O valor total de renda (incluindo fontes adicionais) consolida em
`fact_monthly_income_p1`; separação por fonte → LF-01.

### 2.8 `inicio_multi_regime_pergunta`

**Objetivo:** Stage de transição para introduzir o entendimento de múltiplos regimes.

**Fatos envolvidos:** nenhum `fact_*` persistido isoladamente

**Condição de ativação:** lead indica mais de um regime de trabalho

### 2.9 `inicio_multi_regime_coletar`

**Objetivo:** Coletar cada regime de trabalho adicional de P1 quando há múltiplos.

**Fatos envolvidos:** `fact_work_regime_p1` (atualizado para `múltiplo`)

### 2.10 `renda_mista_detalhe`

**Objetivo:** Detalhar composição de renda quando P1 tem renda mista (formal + informal).

**Fatos envolvidos:** `fact_work_regime_p1`, `fact_monthly_income_p1`

**Nota operacional:**
- Renda mista = pessoa tem renda formal baixa e também faz renda por fora
- Não chamar renda informal de "frágil" como classificação canônica
- Tratar como "renda por fora" / "renda informal não formalizada"
- Para renda formal abaixo de ~R$2.550 com apoio informal: banco tende a limitar;
  LLM deve orientar a realidade sem prometer resultado → LF-01 para separação de partes

### 2.11 `autonomo_compor_renda`

**Objetivo:** Verificar como P1 autônomo compõe e formaliza sua renda.

**Fatos envolvidos:** `fact_work_regime_p1`, `fact_autonomo_has_ir_p1`

**Condição de ativação:** `fact_work_regime_p1 = "autônomo"` (ou inclui autônomo)

**Nota:** Continuação do fluxo de `ir_declarado`; foca na viabilidade de composição
quando autônomo não tem IRPF.

### 2.12 `parceiro_tem_renda`

**Objetivo:** Verificar se P2 (parceiro/cônjuge) tem renda e qual.

**Fatos envolvidos:** `fact_work_regime_p2` (Group V), `fact_monthly_income_p2` (Group V)

**Condição de ativação:** `fact_process_mode != "solo"` (duo ou P3)

**Nota:** Se casado civil → P2 obrigatório (herdado de F2); não é impeditivo se apenas
um dos cônjuges tiver renda.

### 2.13 `regime_trabalho_parceiro`

**Objetivo:** Coletar regime de trabalho de P2.

**Fatos envolvidos:** `fact_work_regime_p2` (Group V)

**Condição de ativação:** `fact_process_mode != "solo"`

### 2.14 `regime_trabalho_parceiro_familiar`

**Objetivo:** Coletar regime de trabalho do membro familiar P3.

**Fatos envolvidos:** `fact_work_regime_p3` (Group VI)

**Condição de ativação:** `fact_p3_required = true` (herdado de F2)

### 2.15 `renda_parceiro`

**Objetivo:** Coletar valor de renda de P2.

**Fatos envolvidos:** `fact_monthly_income_p2` (Group V)

**Condição de ativação:** `fact_process_mode != "solo"`

**Nota:** Se P2 autônomo: verificar `fact_autonomo_has_ir_p2` para formalização.

### 2.16 `renda_parceiro_familiar`

**Objetivo:** Coletar valor de renda do membro familiar P3.

**Fatos envolvidos:** `fact_monthly_income_p3` (Group VI)

**Condição de ativação:** `fact_p3_required = true`

### 2.17 `renda_familiar_valor`

**Objetivo:** Consolidar o valor de renda do grupo para sinalização da faixa interna de subsídio (`derived_subsidy_band_hint` — hint interno, não calcula aprovação, não calcula crédito, não calcula subsídio final).

**Fatos envolvidos:** `fact_monthly_income_p3`, `derived_subsidy_band_hint`

**Nota:** `derived_subsidy_band_hint` é o sinal/faixa interna derivada de subsídio atualizado aqui com a renda total do processo.
Hint interno — não calcula aprovação, não calcula crédito, não calcula subsídio final.

### 2.18 `somar_renda_familiar`

**Objetivo:** Confirmar composição de renda com membro familiar (P3).

**Fatos envolvidos:** `fact_composition_actor` (Group III), `fact_p3_required` (Group III)

**Nota:** Confirmação de que P3 está efetivamente entrando no processo.

### 2.19 `somar_renda_solteiro`

**Objetivo:** Tratar composição de renda para lead solteiro que deseja compor com familiar.

**Fatos envolvidos:** `fact_estado_civil` (Group III), `fact_monthly_income_p3` (Group VI)

**Condição de ativação:** `fact_estado_civil = "solteiro"` + `derived_composition_needed = true`

**Nota:** Solteiro pode compor com familiar voluntariamente; não é obrigatório.

### 2.20 `sugerir_composicao_mista`

**Objetivo:** Sugerir ao lead a estratégia de composição de renda quando necessário.

**Fatos envolvidos:** `derived_composition_needed`

**Condição de ativação:** `derived_composition_needed = true`

**Nota canônica:** `derived_composition_needed` é calculado pelo mecânico; o LLM
recebe o sinal e decide como apresentar a opção de composição — nunca forçar,
nunca encerrar o sonho do cliente; sempre buscar alternativa viável.

### 2.21 `ctps_36_parceiro`

**Objetivo:** Verificar se P2 possui 36 meses de CTPS (somente se P1 não tem).

**Fatos envolvidos:** `fact_ctps_36m_p2` (Group V)

**Condição de ativação:** `fact_ctps_36m_p1 = false` (ou não confirmado)
  E `fact_process_mode != "solo"`

**Nota:** Basta uma pessoa do processo ter 36 meses; não perguntar para P2 se P1 já tem.
Se P2 também não tem e há P3: perguntar P3 via LF-03.

---

## §3 Fatos mínimos T2

Todos os `fact_*` abaixo são chaves canônicas de `T2_DICIONARIO_FATOS.md §3`.
Nenhuma chave foi inventada neste documento. Chaves sem equivalente canônico são
declaradas como **lacuna de schema futura** em §4.

### 3.1 Fatos de saída obrigatórios na conclusão de F3

| Chave canônica | Grupo T2 | Tipo | Status mínimo saída | Condição de aplicação |
|---|---|---|---|---|
| `fact_work_regime_p1` | Group IV | enum | `confirmed` | Sempre — gate |
| `fact_monthly_income_p1` | Group IV | decimal | `confirmed` | Sempre — gate |
| `fact_ctps_36m_p1` | Group IV | enum | `confirmed` | Sempre (incl. não-CLT) |
| `fact_autonomo_has_ir_p1` | Group IV | enum | `captured` | SE `work_regime_p1` inclui autônomo |
| `fact_has_multi_income_p1` | Group IV | boolean | `captured` | Se detectado multi-renda |
| `fact_work_regime_p2` | Group V | enum | `confirmed` | SE `process_mode != solo` |
| `fact_monthly_income_p2` | Group V | decimal | `confirmed` | SE `process_mode != solo` |
| `fact_ctps_36m_p2` | Group V | enum | `confirmed` | SE P2 CLT E `fact_ctps_36m_p1 = false` |
| `fact_autonomo_has_ir_p2` | Group V | enum | `captured` | SE P2 autônomo |
| `fact_work_regime_p3` | Group VI | enum | `confirmed` | SE `p3_required = true` |
| `fact_monthly_income_p3` | Group VI | decimal | `confirmed` | SE `p3_required = true` |
| `fact_benefits_signal` | Group VII | string | `captured` | SE benefício social declarado |
| `fact_has_fgts` | Group VII | boolean | `captured` | SE desempregado ou renda baixa (âncora de composição) |
| `fact_entry_reserve_signal` | Group VII | enum | `captured` | SE desempregado ou sem renda válida |
| `derived_subsidy_band_hint` | derived | calculado | `calculated` | Obrigatório na saída — nunca promete resultado |
| `derived_composition_needed` | derived | calculado | `calculated` | Sempre — pode mudar em F3 quando renda aparece |

### 3.2 Fatos herdados de F2 que podem ser resolvidos em F3

| Chave canônica | Grupo T2 | Motivo da pendência | Resolução em F3 |
|---|---|---|---|
| `fact_dependente` | Group VIII | Solo em F2 sem renda confirmada | SE `fact_monthly_income_p1 < ~R$4.000` confirmado E solo: perguntar dependente agora |
| `fact_dependents_count` | Group VIII | Pendente se `fact_dependente = true` | Coletar SE `fact_dependente = true` confirmado |

**Regra de cross-fatia (herdada de F2, regra 17 Vasques):**
- processo conjunto → `fact_dependente` skip obrigatório (não perguntar)
- processo solo + renda confirmada < ~R$4.000 → perguntar `fact_dependente` aqui
- processo solo + renda confirmada ≥ ~R$4.000 → `fact_dependente` skip

---

## §4 Lacunas de schema futuras

Estas lacunas foram identificadas durante a elaboração deste contrato. Nenhuma gera `fact_*`
novo nesta PR. São registradas para resolução futura.

| # | LF | Dado ausente | Stage(s) afetados | Impacto operacional |
|---|---|---|---|---|
| 1 | LF-01 | Valor separado de cada fonte de renda P1 (secundária/informal) | `renda`, `inicio_multi_renda_coletar`, `renda_mista_detalhe` | `fact_monthly_income_p1` captura total; detalhe por fonte requer `fact_*` futuro |
| 2 | LF-02 | `fact_autonomo_has_ir_p3` — IRPF do P3 autônomo | `regime_trabalho_parceiro_familiar` | Sem `fact_*` canônico para IRPF de P3; regra de autônomo sem IR aplica-se a P3 mas não pode ser persistida |
| 3 | LF-03 | `fact_ctps_36m_p3` — CTPS 36 meses do P3 | `ctps_36_parceiro` (extensão P3) | Se P1 e P2 não têm 36 meses, P3 deveria ser perguntado; sem `fact_*` canônico para P3 |
| 4 | LF-04 | Tipo de pensão recebida (por morte vs alimentícia) | `regime_trabalho`, `renda` | `fact_benefits_signal` é genérico; pensão alimentícia NÃO entra como renda para MCMV; distinção de tipo requer `fact_*` futuro |
| 5 | LF-05 | Classificação de benefício social não financiável / benefício assistencial declarado | `regime_trabalho`, `renda` | `fact_benefits_signal` existe mas não classifica Bolsa Família/BPC/benefício assistencial como não financiável para Caixa; classificação requer `fact_*` futuro — **nenhum benefício social assistencial é financiável para MCMV** |
| 6 | LF-06 | `fact_prolabore_signal` — pró-labore de empresário/CNPJ para MCMV | `ir_declarado`, `autonomo_compor_renda` | Empresário com CNPJ pode justificar renda via pró-labore (pessoa física); sem `fact_*` canônico para esse sinal |
| 7 | LF-07 | `fact_income_average_p1` — média de renda variável calculada P1 | `renda`, `renda_mista_detalhe` | Autônomo sem IRPF ou CLT com variação usa média estimada; sem `fact_*` para armazenar valor calculado |
| 8 | LF-08 | `fact_cnpj_only_signal` — lead declara renda exclusivamente de CNPJ/PJ | `ir_declarado`, `regime_trabalho` | CNPJ sozinho não serve para MCMV (PF); flag de "apenas PJ" requer `fact_*` futuro para acionar orientação correta |
| 9 | LF-09 | Enum gap em `fact_work_regime_p1` para "desempregado" / "sem_renda_atual" | `regime_trabalho`, `parceiro_tem_renda` | Lead desempregado sem nenhum regime atual não tem valor canônico no enum; operacionalmente tratado via ausência + `fact_monthly_income_p1 = 0` ou ausente + SGM-F3-03 |

---

## §5 Regras comerciais validadas pelo Vasques

> **Nota de soberania:** nenhuma das regras abaixo pode produzir `reply_text`, template de
> fala, pergunta fixa ou roteiro. São regras de negócio que informam o mecânico (estado,
> políticas T3) e servem de contexto para o LLM raciocinar — nunca de script para o LLM
> repetir.

### RC-F3-01 — Regra-mãe da renda

Toda renda precisa ter:
- Dono (P1, P2 ou P3)
- Regime / tipo (CLT, autônomo, servidor, aposentado, informal, múltiplo)
- Valor aproximado
- Forma provável de comprovação
- Relação com o processo (titular, cônjuge, parceiro, familiar ou P3)

Nunca somar tudo em número único sem origem. `fact_monthly_income_p1` é a renda de P1,
não a renda total do processo.

### RC-F3-02 — Não perguntar "renda extra" como pergunta principal

Evitar perguntar "você tem renda extra?" diretamente — confunde com hora extra ou adicional.

O correto é entender se o lead tem mais de uma fonte de renda, a partir do contexto.
Exemplos de multi-renda que a Enova deve conseguir identificar:
CLT + bico; CLT + outro CLT; aposentado + CLT; aposentado + informal; servidor + CLT;
servidor + renda informal; MEI + CLT; autônomo + outra fonte.

Se o lead já se declarou informal, não perguntar sobre "renda extra" — ele já está
declarando renda informal. Seguir análise da renda informal e composição.

### RC-F3-03 — Autônomo com IRPF

Sempre que o lead disser que é autônomo: verificar se declarou IRPF no último ano.
- Se declarou IRPF: renda autônoma formalizada; usar renda declarada no IRPF; seguir processo
- Não prometer aprovação com base na declaração de IRPF

### RC-F3-04 — Autônomo sem IRPF sozinho

Se autônomo sem IRPF e processo solo:
- Cenário difícil; banco tende a limitar muito a renda sem formalização
- Sugerir composição com alguém que tenha renda comprovável (SGM-F3-02)
- Se não houver composição: verificar entrada / FGTS / reserva
- Se não houver composição nem entrada/FGTS: orientar limitação com cuidado — não encerrar
  de forma seca, sempre buscar alternativa viável

### RC-F3-05 — Autônomo sem IRPF em conjunto

Se autônomo sem IRPF entra em conjunto com alguém:
- Não é impeditivo automático
- Segue o processo
- Pode agregar ao processo de forma limitada
- Se dois autônomos sem IRPF: segue normalmente; buscar composição se viabilidade estiver baixa
- Não tratar como bloqueio automático

### RC-F3-06 — MEI / empresário / CNPJ

CNPJ sozinho não serve para MCMV. Processo MCMV é por pessoa física.
- Declaração apenas da PJ não formaliza renda para MCMV
- MEI precisa de IRPF para formalizar renda como pessoa física
- Empresário pode justificar renda via pró-labore (PF) → LF-06
- Se lead declarar que só tem renda de CNPJ: registrar LF-08 e orientar sobre limitação
  para MCMV sem encerrar o processo

### RC-F3-07 — Aposentado e pensionista

Aposentado entra normalmente como renda comprovável.

Pensionista — distinção obrigatória (LF-04):
- Pensão por morte: pode entrar como renda para MCMV
- Pensão alimentícia: NÃO entra para somar renda de financiamento
- Se lead disser "pensionista" sem especificar: entender qual tipo
- Não tratar toda pensão como renda válida automaticamente

### RC-F3-08 — Benefícios sociais do governo (regra nova obrigatória)

Bolsa Família, BPC (Benefício de Prestação Continuada) e benefícios assistenciais
**NÃO somam como renda para financiamento Caixa/MCMV**.

- Não considerar Bolsa Família, BPC ou benefício assistencial como renda válida para
  financiamento
- Se a pessoa tem apenas esse benefício como renda: tratar como se não tivesse renda
  financiável (SGM-F3-04)
- Buscar composição com alguém que tenha renda válida
- Compositor deve ser maior de 18 anos e idealmente abaixo de 67 anos (risco Caixa)
- Não prometer aprovação; não encerrar de forma seca

### RC-F3-09 — Desempregado

Se a pessoa está desempregada e sem renda:
- Caixa não aprova sem renda sozinha
- Buscar composição (SGM-F3-03)
- Se não houver composição: verificar entrada / FGTS / reserva
- Não criar expectativa falsa; não encerrar de forma seca
- `fact_work_regime_p1` enum gap para desempregado → LF-09

### RC-F3-10 — Renda mista e limite prático de ~R$2.550

Renda mista = pessoa tem renda formal baixa + renda por fora (informal).

- Se renda por fora não formalizada via IRPF: Caixa tende a limitar renda considerada
- Para renda formal abaixo de ~R$2.550: renda por fora pode ajudar como apoio, mas
  tende a travar nesse limite aproximado
- Quando cliente tem renda formal baixa + renda informal: sugerir composição (SGM-F3-05)
- Não chamar renda informal de "frágil" como classificação canônica
- Tratar como "renda por fora" / "renda informal não formalizada"

### RC-F3-11 — Solteiro sozinho com renda baixa

- Solteiro sozinho com renda formal abaixo de ~R$3.000 dificilmente compra hoje
- Perfil mais viável: renda comprovável próxima de R$4.000
- Abaixo de ~R$3.000: sugerir composição (SGM-F3-01)
- Não descartar; não encerrar o sonho; sempre buscar saída

### RC-F3-12 — CTPS 36 meses

Perguntar sempre para P1, independente do regime.
- Se P1 tem 36 meses: não perguntar para P2 nem P3
- Se P1 não tem: perguntar para P2 (`ctps_36_parceiro`)
- Se P1 e P2 não têm e há P3: perguntar para P3 → LF-03
- Basta uma pessoa do processo ter 36 meses
- Não é impeditivo — melhora a taxa de juros

### RC-F3-13 — Casado civil e renda

- Ambos os cônjuges entram no processo (herdado de F2)
- Os dois podem ter renda; se um não tiver renda, não é impeditivo
- Nunca impedir processo porque apenas um dos cônjuges tem renda

### RC-F3-14 — Renda variável

- Autônomo com IRPF: usar renda declarada no IRPF
- Autônomo sem IRPF: usar média dos últimos meses de movimentação bancária quando
  possível analisar → LF-07
- CLT com variação no holerite: usar média dos últimos 3 meses como estimativa
- Renda por fora: separar da renda formal; entender média aproximada → LF-01

### RC-F3-15 — Parceiro/familiar autônomo

Se P2 ou P3 for autônomo:
- Perguntar se declarou IRPF (P2: `fact_autonomo_has_ir_p2`; P3: LF-02)
- Se declarou: usar renda formalizada
- Se não declarou: não é impeditivo quando compondo com alguém
- Pode agregar ao processo de forma limitada
- Não bloquear automaticamente

### RC-F3-16 — Parceiro/familiar CLT e CTPS 36

- Se P1 já tem 36 meses: não perguntar para P2/P3
- Se P1 não tem: perguntar P2 (`ctps_36_parceiro`)
- Se P2 também não tem: perguntar P3 → LF-03
- Basta uma pessoa do processo ter 36 meses

### RC-F3-17 — Dependente conversa com renda (cross-fatia F2 → F3)

Regra herdada de F2 que pode ser resolvida aqui quando a renda de P1 é confirmada:
- Processo conjunto → `fact_dependente` skip obrigatório
- Solo + renda formal confirmada < ~R$4.000 → perguntar `fact_dependente` agora
- Solo + renda formal confirmada ≥ ~R$4.000 → `fact_dependente` skip

F2 pode ter deixado esta decisão pendente por ainda não ter renda confirmada.
F3 resolve quando `fact_monthly_income_p1` for confirmado.

### RC-F3-18 — Composição

F3 deve sugerir composição quando qualquer das seguintes condições se aplica:
- Renda formal é baixa (solo < ~R$3.000)
- Autônomo sem IRPF está sozinho
- Pessoa só recebe benefício social não financiável
- Desempregado sem renda comprovável
- Somente seguro-desemprego como renda declarada
- Trabalho temporário como única fonte de renda sem outra renda comprovável
- Renda por fora não formalizada não resolve sozinha
- Renda formal abaixo de ~R$2.550 com apoio informal insuficiente
- Cenário indica que processo solo ficará muito limitado

Sempre sugerir alternativa viável antes de tratar como inviável.
Compositor deve ser maior de 18 anos; idealmente abaixo de 67 anos (risco etário Caixa,
herdado de F2 — avô/avó com mais de 67 anos: alertar risco, não bloquear diretamente).

### RC-F3-19 — Seguro-desemprego e trabalho temporário (regra obrigatória)

Seguro-desemprego e trabalho temporário **NÃO entram como renda válida para financiamento Caixa/MCMV**.

- **Seguro-desemprego:** renda temporária governamental; não é renda estável comprovável para o banco;
  tratar como sem renda financiável (SGM-F3-03)
- **Trabalho temporário:** vínculo precário e não permanente; Caixa tende a não aceitar como renda
  comprovável estável para MCMV; não prometer aprovação
- Se a pessoa tem apenas seguro-desemprego: tratar como sem renda financiável; buscar composição
  com alguém que tenha renda válida (SGM-F3-03)
- Se a pessoa tem apenas trabalho temporário: não prometer aprovação; verificar se há outra renda;
  sugerir composição se for o único fonte de renda (SGM-F3-01 ou SGM-F3-03)
- Se houver outra renda válida junto: separar cada fonte por dono, tipo e valor (RC-F3-01);
  registrar a fonte não financiável como sinal apenas — não somar ao total financiável

**Distinção obrigatória de fontes não financiáveis:**
| Fonte | Válida para MCMV? | Nota |
|---|---|---|
| Bolsa Família / BPC / benefício assistencial | ❌ Não | RC-F3-08 |
| Seguro-desemprego | ❌ Não | RC-F3-19 |
| Trabalho temporário | ❌ Não | RC-F3-19 |
| Pensão alimentícia | ❌ Não | RC-F3-07 |
| Pensão por morte | ✅ Sim | RC-F3-07 |
| CLT / servidor / autônomo com IRPF / aposentadoria | ✅ Sim (condições normais) | RC-F3-03 a RC-F3-06 |

---

## §6 Políticas T3

> **Regra canônica:** nenhuma política T3 pode produzir `reply_text`. O LLM é soberano
> na fala. Políticas apenas modificam o `lead_state` (obrigações, confirmações, bloqueios,
> sugestões, roteamentos).

### 6.1 Obrigações (OBR)

| ID | Condição de disparo | Fato obrigatório | Efeito em `lead_state` |
|---|---|---|---|
| OBR-F3-01 | `fact_work_regime_p1` ausente | `fact_work_regime_p1` | `must_ask_now ← fact_work_regime_p1` |
| OBR-F3-02 | `fact_monthly_income_p1` ausente | `fact_monthly_income_p1` | `must_ask_now ← fact_monthly_income_p1` |
| OBR-F3-03 | `fact_ctps_36m_p1` ausente (qualquer regime) | `fact_ctps_36m_p1` | `must_ask_now ← fact_ctps_36m_p1` |
| OBR-F3-04 | `fact_work_regime_p1` inclui autônomo E `fact_autonomo_has_ir_p1` ausente | `fact_autonomo_has_ir_p1` | `must_ask_now ← fact_autonomo_has_ir_p1` |
| OBR-F3-05 | `fact_process_mode != "solo"` E `fact_work_regime_p2` ausente | `fact_work_regime_p2` | `must_ask_now ← fact_work_regime_p2` |
| OBR-F3-06 | `fact_process_mode != "solo"` E `fact_monthly_income_p2` ausente | `fact_monthly_income_p2` | `must_ask_now ← fact_monthly_income_p2` |
| OBR-F3-07 | `fact_p3_required = true` E `fact_work_regime_p3` ausente | `fact_work_regime_p3` | `must_ask_now ← fact_work_regime_p3` |
| OBR-F3-08 | `fact_p3_required = true` E `fact_monthly_income_p3` ausente | `fact_monthly_income_p3` | `must_ask_now ← fact_monthly_income_p3` |
| OBR-F3-09 | `fact_dependente` ausente E `fact_process_mode = "solo"` E `fact_monthly_income_p1 < ~4000` E `fact_monthly_income_p1` confirmed | `fact_dependente` | `must_ask_now ← fact_dependente` (resolução cross-fatia de F2) |

### 6.2 Confirmações (CONF)

| ID | Condição de disparo | Dureza | Efeito em `lead_state` |
|---|---|---|---|
| CONF-F3-01 | `fact_work_regime_p1` em `captured` | `hard` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR` |
| CONF-F3-02 | `fact_monthly_income_p1` em `captured` | `hard` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR` |
| CONF-F3-03 | `fact_work_regime_p2` em `captured` (SE duo) | `hard` | `needs_confirmation = true` |
| CONF-F3-04 | `fact_monthly_income_p2` em `captured` (SE duo) | `hard` | `needs_confirmation = true` |
| CONF-F3-05 | `fact_autonomo_has_ir_p1` em `captured` | `hard` | `needs_confirmation = true` — impacto na viabilidade |

### 6.3 Notas sobre lacunas e bloqueios

**Nota LF-05 — benefício social não financiável:**
Bolsa Família, BPC (Benefício de Prestação Continuada) e benefícios assistenciais semelhantes **não somam como renda para financiamento Caixa/MCMV** — nenhum benefício social assistencial é financiável para MCMV.
Não existe `fact_*` canônico para persistir essa classificação de não financiável.
Enquanto LF-05 não for resolvida, o LLM deve raciocinar a partir de:
- `fact_benefits_signal` (Group VII) captura o sinal genérico
- `fact_work_regime_p1` absente ou `= informal` + `fact_monthly_income_p1` muito baixo
- Regra RC-F3-08 como contexto de negócio
Se a pessoa tem apenas Bolsa Família/BPC, tratar como sem renda financiável e acionar SGM-F3-04 para buscar composição com pessoa maior de 18 anos, idealmente abaixo de 67 anos.
Não criar bloqueio hard por `fact_benefits_signal` sem `fact_*` futuro de classificação.

**Nota LF-09 — desempregado / seguro-desemprego:**
Não existe enum `desempregado` em `fact_work_regime_p1`. Operacionalmente tratado via
ausência de regime + `fact_monthly_income_p1` = 0 ou ausente + SGM-F3-03 disparada.
Seguro-desemprego não cria enum diferente — também opera via `fact_monthly_income_p1` ausente
ou zero (renda não financiável); RC-F3-19 aplicada; SGM-F3-03 disparada.

### 6.4 Sugestões mandatórias (SGM)

| ID | Condição de disparo | Objetivo da sugestão |
|---|---|---|
| SGM-F3-01 | `derived_composition_needed = true` | Apresentar opção de composição de renda |
| SGM-F3-02 | `fact_work_regime_p1` = autônomo E `fact_autonomo_has_ir_p1 = false` E `fact_process_mode = solo` | Sugerir composição + verificar entrada/FGTS |
| SGM-F3-03 | `fact_monthly_income_p1` ausente ou zero E `fact_process_mode = solo` | Buscar composição + verificar FGTS/reserva |
| SGM-F3-04 | `fact_benefits_signal` indica benefício assistencial E sem renda formal detectada | Buscar composição com alguém que tenha renda válida |
| SGM-F3-05 | renda formal baixa (< ~R$2.550) E sinal de renda informal confirmado | Sugerir composição; orientar sobre limitação do banco sem prometer resultado |
| SGM-F3-06 | `fact_ctps_36m_p1 = false` E `fact_process_mode != solo` | Perguntar CTPS do P2/P3 na ordem correta |
| SGM-F3-07 | `fact_autonomo_has_ir_p2 = false` (SE P2 autônomo) | Orientar sobre limitação de renda de P2 sem IRPF; não bloquear automaticamente |

### 6.5 Roteamentos (ROT)

| ID | Condição de disparo | Efeito |
|---|---|---|
| ROT-F3-01 | F3 completa (todos critérios de saída §7 atendidos) E `fact_p3_required = false` | Manter `current_phase = qualification`; avançar para F4 |
| ROT-F3-02 | F3 completa E `fact_p3_required = true` | Manter `current_phase = qualification_special`; avançar para F4 |
| ROT-F3-03 | `derived_composition_needed = true` E `fact_process_mode = solo` E composição ainda não definida | Pode transitar para `qualification_special` SE P3 for introduzido aqui |

---

## §7 Vetos suaves (VS)

> Veto suave = o LLM deve evitar raciocínio incorreto, mas o mecânico não bloqueia hard.

| ID | Situação | Veto |
|---|---|---|
| VS-F3-01 | Lead menciona renda de Bolsa Família como renda principal | Não tratar como renda válida para financiamento; orientar RC-F3-08 |
| VS-F3-02 | Lead menciona "CNPJ" como renda para MCMV | Não aceitar como renda de PF; orientar RC-F3-06 |
| VS-F3-03 | Lead pergunta se vai ser aprovado com base na renda declarada aqui | Nunca prometer aprovação; `derived_subsidy_band_hint` é hint interno, sem promessa e sem simulação — não calcula aprovação, não calcula crédito, não calcula subsídio final |
| VS-F3-04 | Lead diz que o bico/informal "conta também" | Não tratar renda informal não formalizada como renda formal; registrar e orientar RC-F3-10 |
| VS-F3-05 | Consultor pergunta "você tem renda extra?" diretamente | Violação de RC-F3-02; o LLM deve abordar via contexto de "múltiplas fontes de renda" |
| VS-F3-06 | Lead menciona pensão sem especificar tipo | Não assumir que qualquer pensão é válida; entender tipo (por morte vs alimentícia → RC-F3-07) |
| VS-F3-07 | Lead menciona seguro-desemprego como renda principal | Não tratar como renda válida para financiamento; orientar RC-F3-19; acionar SGM-F3-03 |
| VS-F3-08 | Lead menciona trabalho temporário como única fonte de renda | Não prometer aprovação; não tratar como renda estável para Caixa/MCMV; orientar RC-F3-19; verificar composição |

---

## §8 Critérios de saída de F3

F3 está concluída — pronta para F4 — quando todos os itens obrigatórios abaixo estiverem
atendidos, sem `must_ask_now` de renda pendente e sem bloqueio ativo.

| # | Critério | Fato / derivado | Condição mínima |
|---|---|---|---|
| 1 | Regime P1 confirmado | `fact_work_regime_p1` | `confirmed` |
| 2 | Renda P1 confirmada | `fact_monthly_income_p1` | `confirmed` |
| 3 | CTPS P1 verificado | `fact_ctps_36m_p1` | `confirmed` (qualquer resultado) |
| 4 | IRPF autônomo P1 verificado | `fact_autonomo_has_ir_p1` | `captured` — SE autônomo |
| 5 | Regime P2 confirmado | `fact_work_regime_p2` | `confirmed` — SE duo |
| 6 | Renda P2 confirmada | `fact_monthly_income_p2` | `confirmed` — SE duo |
| 7 | Regime P3 confirmado | `fact_work_regime_p3` | `confirmed` — SE P3 |
| 8 | Renda P3 confirmada | `fact_monthly_income_p3` | `confirmed` — SE P3 |
| 9 | Sinal/faixa interna de subsídio derivado | `derived_subsidy_band_hint` | `calculated` — hint interno, não cálculo final |
| 10 | Multi-renda verificada | `fact_has_multi_income_p1` | `captured` ou descartada |
| 11 | Benefício social verificado | `fact_benefits_signal` | `captured` SE declarado |
| 12 | Dependente resolvido (se aplicável) | `fact_dependente` | `captured` ou skip justificado |
| 13 | Nenhuma obrigação de renda pendente | `operational.must_ask_now` | vazio |
| 14 | Sem bloqueio ativo | `operational.blocked_by` | vazio |

---

## §9 Critérios de não saída de F3

F3 NÃO está concluída se qualquer um dos bloqueios abaixo persistir:

| Condição de bloqueio | Motivo |
|---|---|
| `fact_work_regime_p1` ausente ou `hypothesis` | Regime de P1 obrigatório — gate |
| `fact_monthly_income_p1` ausente ou `hypothesis` | Renda de P1 obrigatória — gate |
| `fact_work_regime_p2` ausente E `process_mode != solo` | P2 presente sem regime declarado |
| `fact_monthly_income_p2` ausente E `process_mode != solo` | P2 presente sem renda declarada |
| `fact_work_regime_p3` ausente E `p3_required = true` | P3 presente sem regime declarado |
| `fact_monthly_income_p3` ausente E `p3_required = true` | P3 presente sem renda declarada |
| `derived_subsidy_band_hint` não sinalizado | Saída obrigatória de F3 — hint interno necessário |
| `fact_dependente` ausente E solo E renda < ~R$4.000 confirmada | Cross-fatia F2 não resolvida |

**Nota CP-09 (invariante herdada):** `hypothesis` nunca sustenta bloqueio hard; bloqueio
só ativa com status `confirmed` do fato bloqueante.

---

## §10 Anti-padrões proibidos (AP)

| ID | Anti-padrão | Categoria de violação |
|---|---|---|
| AP-F3-01 | Somar toda a renda do processo em número único sem identificar dono de cada parte | Viola RC-F3-01 — renda sem origem |
| AP-F3-02 | Perguntar "você tem renda extra?" como primeira ou principal pergunta sobre multi-renda | Viola RC-F3-02 |
| AP-F3-03 | Tratar Bolsa Família ou BPC como renda válida para financiamento Caixa | Viola RC-F3-08 |
| AP-F3-04 | Tratar pensão alimentícia como renda válida para MCMV | Viola RC-F3-07 |
| AP-F3-05 | Aceitar CNPJ/PJ como renda válida para MCMV sem declaração de pessoa física | Viola RC-F3-06 |
| AP-F3-06 | Chamar renda informal de "frágil" como classificação canônica | Viola RC-F3-10 |
| AP-F3-07 | Prometer aprovação ou prever resultado do banco com base na renda declarada | Viola toda a fatia — `derived_subsidy_band_hint` é hint interno, não calcula aprovação, não calcula crédito, não calcula subsídio final |
| AP-F3-08 | Bloquear processo quando autônomo sem IRPF entra em conjunto com outra pessoa | Viola RC-F3-05 — não é impeditivo automático |
| AP-F3-09 | Perguntar CTPS de P2 quando P1 já tem 36 meses confirmados | Viola RC-F3-12 — basta uma pessoa |
| AP-F3-10 | Criar `reply_text` mecânico em qualquer política T3 desta fatia | Viola soberania LLM (A00-ADENDO-01) |
| AP-F3-11 | Tratar seguro-desemprego ou trabalho temporário como renda válida para financiamento Caixa/MCMV | Viola RC-F3-19 |

---

## §11 Classes de risco

| Classe | Condição | Ação do mecânico |
|---|---|---|
| RISCO-F3-01 (alto) | `fact_monthly_income_p1` ausente + F3 em andamento | OBR-F3-02 ativada; `must_ask_now` priorizado |
| RISCO-F3-02 (alto) | Autônomo sem IRPF + solo | SGM-F3-02; `derived_composition_needed` atualizado |
| RISCO-F3-03 (alto) | Apenas benefício social detectado + sem renda formal | SGM-F3-04; `derived_composition_needed = true` |
| RISCO-F3-04 (alto) | Desempregado + solo | SGM-F3-03; verificar FGTS/reserva |
| RISCO-F3-05 (médio) | Renda formal < ~R$2.550 + renda informal não formalizada | SGM-F3-05; RC-F3-10 aplicada |
| RISCO-F3-06 (médio) | Solo + renda formal < ~R$3.000 | SGM-F3-01; `derived_composition_needed = true` |
| RISCO-F3-07 (médio) | P2/P3 autônomo sem IRPF | SGM-F3-07; não bloquear; orientar |
| RISCO-F3-08 (médio) | `fact_ctps_36m_p1 = false` + ninguém no processo verificado ainda | SGM-F3-06; perguntar P2 na sequência |
| RISCO-F3-09 (baixo) | Pensão declarada sem tipo | VS-F3-06; entender tipo antes de registrar |
| RISCO-F3-10 (baixo) | `fact_has_multi_income_p1` detectado como sinal mas não confirmado | `signal_multi_income_p1` ativo; OBR de multi-renda latente |
| RISCO-F3-11 (alto) | Apenas seguro-desemprego detectado + sem renda formal | SGM-F3-03; RC-F3-19 aplicada; `derived_composition_needed = true` |
| RISCO-F3-12 (médio) | Trabalho temporário como única fonte de renda | VS-F3-08; RC-F3-19 aplicada; verificar outra renda ou composição |

---

## §12 Relação com pipeline T4

| Componente T4 | Interação com F3 |
|---|---|
| `TurnoEntrada.operational.current_phase` | `qualification` ou `qualification_special` — herdado de F2 |
| `TurnoEntrada.operational.must_ask_now` | Obrigações OBR-F3-01..09 preenchidas pelo mecânico antes de entregar ao LLM |
| `TurnoEntrada.policy_context.prior_decisions` | Inclui decisões de F2 (process_mode, p3_required) + decisões acumuladas de F3 |
| `TurnoEntrada.lead_state.derived.composition_needed` | Calculado pelo mecânico a partir de renda + process_mode; LLM recebe como insumo |
| `TurnoEntrada.lead_state.derived.subsidy_band_hint` | Sinal/faixa interna derivada de subsídio atualizado em `renda_familiar_valor`; hint interno — LLM recebe como orientação de faixa, nunca como promessa; não calcula aprovação, não calcula crédito, não calcula subsídio final |
| `TurnoSaida.extracted_facts` | Alimenta T4.3 para persistência de fact_work_regime_p*, fact_monthly_income_p*, fact_ctps_*, fact_autonomo_* |
| `TurnoSaida.reply_text` | Exclusivamente do LLM — nenhuma política T3 produz texto; LLM raciocina com os insumos |
| `signal_multi_income_p1` | Sinal perceptivo detectado em turno; alimenta `inicio_multi_renda_pergunta` |

---

## §13 Cenários sintéticos (SYN)

> Cenários para validação operacional da cobertura de casos. O LLM decide a fala em cada
> cenário — nenhum cenário prescreve roteiro.

### SYN-F3-01 — CLT com bico

Lead CLT + faz trabalhos informais esporádicos.
- `fact_work_regime_p1 = múltiplo` ou `CLT` com sinal de informal
- `fact_has_multi_income_p1 = true` confirmado
- `fact_monthly_income_p1` captura total estimado
- LF-01: separação de parte formal vs informal não persistida
- SGM-F3-05 se renda formal < ~R$2.550

### SYN-F3-02 — Autônomo sem IRPF solo

Lead autônomo, não declarou IRPF, processo solo.
- `fact_work_regime_p1 = autônomo`
- `fact_autonomo_has_ir_p1 = false` (ou não_informado)
- `derived_composition_needed = true`
- SGM-F3-02 ativada: sugerir composição + verificar FGTS/reserva
- Não encerrar de forma seca; não bloquear automaticamente

### SYN-F3-03 — Dois autônomos sem IRPF em conjunto

Casal; ambos autônomos sem IRPF.
- `fact_work_regime_p1 = autônomo` + `fact_work_regime_p2 = autônomo`
- `fact_autonomo_has_ir_p1 = false` + `fact_autonomo_has_ir_p2 = false`
- Não é bloqueio automático (RC-F3-05)
- Segue processo; `derived_subsidy_band_hint` sinalizado com limitações — hint interno, não cálculo final
- SGM-F3-07 para P2; SGM-F3-02 pode estar ativa para P1

### SYN-F3-04 — Aposentado querendo compor com filho

Lead aposentado (P1); filho quer entrar como P2.
- `fact_work_regime_p1 = aposentado`
- F2 já determinou `fact_process_mode = duo` ou P3
- `fact_work_regime_p2` = regime do filho
- `fact_monthly_income_p2` = renda do filho
- CTPS 36 meses: perguntar P1 (aposentado pode ter histórico); se não: P2

### SYN-F3-05 — Pensionista sem especificar tipo

Lead diz "sou pensionista".
- VS-F3-06 ativa: não assumir tipo
- Entender qual tipo: por morte (pode entrar) vs alimentícia (não entra)
- LF-04 declarada: sem `fact_pension_type` canônico
- `fact_benefits_signal` captura o sinal; tipo não persistível sem LF-04 resolvida

### SYN-F3-06 — Lead com apenas Bolsa Família

Lead tem apenas Bolsa Família como "renda".
- RC-F3-08 aplicada: BF não é renda válida para financiamento
- `fact_benefits_signal` captura BF
- SGM-F3-04 ativada: buscar composição com alguém com renda válida
- Se não houver composição: verificar FGTS/reserva
- Não encerrar de forma seca; não encerrar o sonho

### SYN-F3-07 — Solteiro R$1.800 CLT

Lead solteiro, CLT, R$1.800/mês.
- `fact_work_regime_p1 = CLT`; `fact_monthly_income_p1 = 1800`
- `derived_composition_needed = true` (< ~R$3.000)
- SGM-F3-01 ativada: sugerir composição
- `fact_dependente`: perguntar (solo + renda < ~R$4.000)
- Não descartar; buscar composição familiar

### SYN-F3-08 — MEI + CLT em conjunto

Lead com CNPJ (MEI) + cônjuge CLT.
- `fact_work_regime_p1 = autônomo` ou `múltiplo` (MEI tem IRPF → renda formalizada)
- RC-F3-03: se declarou IRPF como MEI/autônomo → renda formalizada
- RC-F3-06: CNPJ sozinho não serve; IRPF como PF necessário
- P2 (cônjuge) CLT: `fact_work_regime_p2 = CLT`; `fact_monthly_income_p2` coletado
- LF-06 se pró-labore relevante

### SYN-F3-09 — Casado, só um cônjuge tem renda

Casado civil; P1 não tem renda; P2 (cônjuge) CLT com renda boa.
- Herdado de F2: ambos entram obrigatoriamente
- `fact_monthly_income_p1` ausente → OBR-F3-02 (será que realmente não tem renda?)
- Se confirmado sem renda: `fact_monthly_income_p1 = 0` ou capturar status
- Não é impeditivo (RC-F3-13); processo segue com renda de P2
- CTPS: verificar P1 e P2

### SYN-F3-10 — P3 com avô autônomo 70 anos

Lead com avô (P3) que é autônomo, 70 anos.
- Herdado de F2: alerta de risco etário Caixa (>67 anos)
- `fact_work_regime_p3 = autônomo`
- LF-02: verificar IRPF de P3 (sem fact_* canônico)
- LF-03: CTPS de P3 se precisar verificar
- Risco etário: não bloquear hard, mas alertar via sinal herdado de F2

---

## §14 Validação cruzada T2 / T3 / T4

| # | Artefato referenciado | Ponto de validação | Status |
|---|---|---|---|
| 1 | `T2_DICIONARIO_FATOS.md §3.4` | `fact_work_regime_p1` — Group IV — enum confirmado | ✅ existe |
| 2 | `T2_DICIONARIO_FATOS.md §3.4` | `fact_monthly_income_p1` — Group IV — decimal | ✅ existe |
| 3 | `T2_DICIONARIO_FATOS.md §3.4` | `fact_has_multi_income_p1` — Group IV — boolean | ✅ existe |
| 4 | `T2_DICIONARIO_FATOS.md §3.4` | `fact_autonomo_has_ir_p1` — Group IV — enum | ✅ existe |
| 5 | `T2_DICIONARIO_FATOS.md §3.4` | `fact_ctps_36m_p1` — Group IV — enum | ✅ existe |
| 6 | `T2_DICIONARIO_FATOS.md §3.5` | `fact_work_regime_p2` — Group V | ✅ existe |
| 7 | `T2_DICIONARIO_FATOS.md §3.5` | `fact_monthly_income_p2` — Group V | ✅ existe |
| 8 | `T2_DICIONARIO_FATOS.md §3.5` | `fact_autonomo_has_ir_p2` — Group V | ✅ existe |
| 9 | `T2_DICIONARIO_FATOS.md §3.5` | `fact_ctps_36m_p2` — Group V | ✅ existe |
| 10 | `T2_DICIONARIO_FATOS.md §3.6` | `fact_work_regime_p3` — Group VI | ✅ existe |
| 11 | `T2_DICIONARIO_FATOS.md §3.6` | `fact_monthly_income_p3` — Group VI | ✅ existe |
| 12 | `T2_DICIONARIO_FATOS.md §3.7` | `fact_benefits_signal` — Group VII — string | ✅ existe |
| 13 | `T2_DICIONARIO_FATOS.md §3.7` | `fact_has_fgts` — Group VII | ✅ existe |
| 14 | `T2_DICIONARIO_FATOS.md §3.7` | `fact_entry_reserve_signal` — Group VII | ✅ existe |
| 15 | `T2_DICIONARIO_FATOS.md §3.11` | `derived_subsidy_band_hint` — derived | ✅ existe |
| 16 | `T2_DICIONARIO_FATOS.md §3.11` | `derived_composition_needed` — derived | ✅ existe |
| 17 | `T2_DICIONARIO_FATOS.md §3.11` | `signal_multi_income_p1` — signal | ✅ existe (namespace signal_) |
| 18 | `T3_CLASSES_POLITICA.md` | 5 classes usadas: OBR, CONF, SGM, ROT, VS — nenhuma produz reply_text | ✅ conforme |
| 19 | `T3_ORDEM_AVALIACAO_COMPOSICAO.md` | Pipeline 6 estágios; stage 6 = roteamento | ✅ conforme |
| 20 | `T4_PIPELINE_LLM.md` | reply_text exclusivo do LLM; derived_subsidy_band_hint entregue como insumo | ✅ conforme |
| 21 | `ADENDO_CANONICO_SOBERANIA_IA.md` | Zero reply_text mecânico em qualquer política desta fatia | ✅ auditável |
| 22 | `T5_MAPA_FATIAS.md §3.1` | 21 stages F3 mapeados: todos cobertos neste artefato | ✅ cobertos |
| 23 | `T5_MAPA_FATIAS.md §4.3.4` | Fatos mínimos de saída de F3: todos declarados em §3.1 | ✅ alinhado |
| 24 | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | Herança de F2: process_mode, p3_required, estado_civil, dependente pendente | ✅ cross-fatia documentada |
| 25 | `T2_LEAD_STATE_V1.md §4.4` | `current_phase` canônico: qualification, qualification_special — ambos existem | ✅ canônico |
| 26 | LF-01..LF-09 | 9 lacunas declaradas; zero `fact_*` novo criado fora dos 35 canônicos | ✅ sem invenção |

---

## §15 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T5.3 (#117) — merged 2026-04-27T00:18:40Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
Objetivo imutável do contrato: Migração declarativa do funil core por fatias sem if/else de fala; LLM soberano na fala
Recorte a executar nesta PR: F3 — Renda / regime / composição (21 stages, PR-T5.4)
Item do A01: T5 — PR-T5.4 — F3 contrato declarativo
Estado atual da frente: contrato aberto (T5 em execução por fatias)
O que a última PR fechou: F2 coberta (composição familiar); PR-T5.3 merged
O que a última PR NÃO fechou: F3, F4, F5; G5; runtime
Por que esta tarefa existe: F2 determinou quem participa; F3 determina a renda e viabilidade de cada participante
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar contrato declarativo completo da F3 com 21 stages, 19 regras Vasques, facts T2, lacunas e políticas T3
Escopo: schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md + live files
Fora de escopo: src/, runtime, Supabase, migrations, T1/T2/T3/T4 aprovados, cálculo real, normativa MCMV além do validado
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md (via T5_MAPA_FATIAS.md)
  Legado markdown auxiliar:    T5_MAPA_FATIAS.md §4.3, T2_DICIONARIO_FATOS.md §3
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | 21 stages F3 cobertos, todos com objetivo e fatos mapeados | §2 deste artefato |
| 2 | Todos os 16 fatos/derived de saída de F3 declarados com condição | §3.1 |
| 3 | Cross-fatia F2 → F3 documentada: dependente + process_mode + p3_required | §3.2 |
| 4 | 9 lacunas de schema (LF-01..LF-09) declaradas sem criar fact_* | §4 |
| 5 | 19 regras comerciais Vasques documentadas (RC-F3-01..19) | §5 |
| 6 | Regra-mãe da renda: toda renda tem dono, regime, valor, comprovação, relação | RC-F3-01 |
| 7 | "Renda extra" proibida como pergunta principal; multi-renda por contexto | RC-F3-02, AP-F3-02 |
| 8 | Bolsa Família / BPC não é renda válida para MCMV | RC-F3-08, AP-F3-03 |
| 8.1 | Seguro-desemprego não é renda válida para financiamento Caixa/MCMV | RC-F3-19, AP-F3-11 |
| 8.2 | Trabalho temporário não é renda válida/estável para financiamento Caixa/MCMV | RC-F3-19, AP-F3-11 |
| 9 | Pensão alimentícia não entra para MCMV; pensão por morte entra | RC-F3-07, AP-F3-04 |
| 10 | CNPJ/PJ sozinho não serve para MCMV | RC-F3-06, AP-F3-05 |
| 11 | Autônomo sem IRPF em conjunto: não é bloqueio automático | RC-F3-05, AP-F3-08 |
| 12 | CTPS 36: ordem P1→P2→P3; basta uma pessoa; não é impeditivo | RC-F3-12, AP-F3-09 |
| 13 | Dependente cross-fatia: resolvido quando renda P1 confirmada | §3.2, RC-F3-17, OBR-F3-09 |
| 14 | 9 OBR, 5 CONF, 7 SGM, 3 ROT, 8 VS declarados — zero reply_text | §6, §7 |
| 15 | 14 critérios de saída mensuráveis | §8 |
| 16 | 8 critérios de não saída | §9 |
| 17 | 11 anti-padrões (AP-F3-01..11) | §10 |
| 18 | 12 classes de risco com condição e ação | §11 |
| 19 | 26 itens de validação cruzada T2/T3/T4 | §14 |
| 20 | 10 cenários sintéticos cobrindo todos os casos críticos | §13 |
| 21 | Zero reply_text mecânico em qualquer política — soberania LLM intacta | §6, AP-F3-10 |
| 22 | `derived_subsidy_band_hint` como sinal/faixa interna derivada de subsídio — hint interno, sem promessa e sem simulação; não calcula aprovação, não calcula crédito, não calcula subsídio final | §2.17, VS-F3-03 |
| 23 | LF-01 cobre renda adicional; LF-05 cobre classificação de benefício social não financiável / assistencial; LF-09 cobre desempregado e seguro-desemprego | §4, §6.3 |

### Provas

- **P-T5.4-01:** arquivo `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` criado; `git diff --stat` confirma novo artefato
- **P-T5.4-02:** 16 fatos canônicos T2 (Groups IV–VIII) verificados em `T2_DICIONARIO_FATOS.md §3`; zero fact_* inventado; 9 lacunas declaradas em §4
- **P-T5.4-03:** zero reply_text em qualquer seção §6 (OBR/CONF/SGM/ROT/VS); soberania LLM auditável no artefato

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T5_FATIA_RENDA_REGIME_COMPOSICAO.md — contrato declarativo completo da F3
O que foi fechado nesta PR: F3 coberta com 21 stages, 19 regras, 9 lacunas, policies T3 completas
O que continua pendente: F4, F5, FP, FS; G5; runtime; merge autorizado apenas pelo Vasques
O que ainda não foi fechado do contrato ativo: PR-T5.5..PR-T5.8, PR-T5.R, G5
Recorte executado do contrato: T5 §6 S4 — contrato declarativo F3
Pendência contratual remanescente: F4 (elegibilidade/restrição), F5 (docs/handoff), paridade, shadow, readiness
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado? sim — PR-T5.5 autorizada após merge desta PR
Esta tarefa foi fora de contrato? não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```

### BLOCO E A00-ADENDO-03

**Esta PR está apta a fechar a etapa F3?** ✅ **SIM**

| Critério A00-ADENDO-03 | Status |
|---|---|
| Evidência real de conclusão presente | ✅ 23 evidências documentadas acima |
| Prova parcial/inconclusiva/lacunosa bloqueia? | ✅ 9 lacunas declaradas explicitamente — não são prova parcial de cobertura; são gaps de schema intencionais documentados |
| Nenhuma etapa fechada sem evidência | ✅ artefato criado antes do Bloco E |
| Bloco E completo | ✅ ESTADO HERDADO + ESTADO ENTREGUE + provas |
| Soberania LLM intacta | ✅ zero reply_text mecânico auditável |
| Nenhum `fact_*` inventado | ✅ todos os 16 fatos são canônicos T2; 9 lacunas declaradas |
| PR-T5.5 autorizada após merge | ✅ ROT-F3-01/02 e §Meta declarados |
