# T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5 — Matriz de Paridade Funcional das Fatias F1–F5 — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.7 |
| Branch | feat/t5-pr5-7-matriz-paridade-funcional |
| Artefato | Matriz de validação declarativa cruzada F1–F5 |
| Status | entregue |
| Pré-requisito | PR-T5.6-fix (#121) merged — todos os contratos de fatia vigentes |
| Autoriza | PR-T5.8 ou PR-T5.R conforme contrato T5 (se veredito = pode seguir) |
| Data | 2026-04-27 |

---

## §1 Resumo executivo

Esta matriz cruza as cinco fatias declarativas do funil core da ENOVA 2 (F1 a F5, incluindo a
correção civil F5-fix) e valida se o contrato documental declarativo está coerente ponta a ponta.

**Veredito:**

> **PODE SEGUIR COM ATENÇÃO**

Nenhum bloqueante foi encontrado. O funil F1–F5 está coberto de forma coerente. Foram identificadas
**4 atenções** que não impedem avanço mas devem virar PR-fix antes de PR-T5.R ou antes do runtime.
Lacunas futuras aceitas (LFs declaradas nas fatias) são intencionais e estão corretamente sinalizadas.

| Categoria | Quantidade |
|---|---|
| Bloqueantes | 0 |
| Atenções / PR-fix recomendadas | 4 |
| Lacunas futuras aceitas (LFs) | 35+ (distribuídas F1–F5) |
| Stages verificados | 43 (F1:7, F2:7, F3:21, F4:3, F5:5) |
| `current_phase` values usados | 8 de 8 canônicos |
| Fatos T2 canônicos usados | 35 (sem nenhum inventado) |

---

## §2 Escopo da matriz

**Período coberto:** PR-T5.2-fix (F1 v2) até PR-T5.6-fix (F5 correção civis).

**Fatias validadas:**
- F1 — Topo / Abertura / Primeira Intenção (`T5_FATIA_TOPO_ABERTURA.md` v2)
- F2 — Qualificação Inicial / Composição Familiar (`T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md`)
- F3 — Renda / Regime / Composição (`T5_FATIA_RENDA_REGIME_COMPOSICAO.md`)
- F4 — Elegibilidade / Restrição (`T5_FATIA_ELEGIBILIDADE_RESTRICAO.md`)
- F5 — Documentação / Dossiê / Correspondente / Visita / Handoff (`T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md`, incluindo correção civis PR-T5.6-fix)

**O que esta matriz NÃO faz:**
- Não cria regras comerciais novas
- Não corrige fatias existentes
- Não implementa runtime
- Não cria `fact_*` ou `current_phase` novos
- Não resolve lacunas futuras declaradas (LFs)

---

## §3 Fontes cruzadas

| Arquivo | Fatia / Fase | PR que criou |
|---|---|---|
| `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` | F1 | PR-T5.2 + PR-T5.2-fix (#115, #116) |
| `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | F2 | PR-T5.3 (#117) |
| `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | F3 | PR-T5.4 (#118) |
| `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | F4 | PR-T5.5 (#119) |
| `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` | F5 | PR-T5.6 (#120) + PR-T5.6-fix (#121) |
| `schema/implantation/T5_MAPA_FATIAS.md` | Referência macro | PR-T5.1 |
| `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` | Contrato T5 | PR-T5.R (aberto) |
| `T2_DICIONARIO_FATOS.md`, `T2_LEAD_STATE_V1.md` | Facts canônicos | T2 encerrado |
| `T3_CLASSES_POLITICA.md` | Políticas T3 | T3 encerrado |
| `T4_PIPELINE_LLM.md` | Pipeline | T4 encerrado |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | Soberania LLM | A00-ADENDO-01 |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | Soberania MCMV | A00-ADENDO-02 |

---

## §4 Mapa F1–F5 — continuidade do funil

### 4.1 Sequência de `current_phase`

Todos os 8 valores canônicos de `T2_LEAD_STATE_V1.md §3.3` estão cobertos:

| # | `current_phase` | Fatia | Ativação |
|---|---|---|---|
| 1 | `discovery` | F1 | Entrada no funil — identificação inicial |
| 2 | `qualification` | F2/F3 | Estado civil + renda sem P3 |
| 3 | `qualification_special` | F2/F3 | `fact_p3_required = true` (composição P3) |
| 4 | `docs_prep` | F4→F5 | ROT-F4-01: F4 positiva → docs_prep |
| 5 | `docs_collection` | F5 | Docs sendo coletados (ao menos 1 iniciado) |
| 6 | `broker_handoff` | F5 | Dossiê mínimo montado + enviado |
| 7 | `awaiting_broker` | F5 | Aguardando retorno do correspondente |
| 8 | `visit_conversion` | F5 | `fact_visit_interest = true` confirmado |

**Status: ✅ 8/8 valores canônicos cobertos.**

### 4.2 Fluxo de fatos entre fatias

```
F1 → F2 → F3 → F4 → F5
fact_lead_name          ─────────────────────────────→ dossiê (identidade)
fact_customer_goal      ─────────────────────────────→ contexto
fact_nationality        ─────────────────────────────→ elegibilidade
fact_estado_civil       ──────────────────────────────────────────→ docs civis (F5)
fact_process_mode       ───────────────────────────────────→ docs P2/P3
fact_composition_actor  ───────────────────────────────────→ docs P3
fact_work_regime_p1/p2/p3 ─────────────────────────────────→ docs por regime (F5)
fact_monthly_income_p1/p2/p3 ──────────────────────────────→ dossiê renda
fact_ctps_36m_p1/p2     ───────────────────────────────────→ CTPS completa (F5)
fact_autonomo_has_ir_p1/p2 ────────────────────────────────→ docs autônomo (F5)
fact_has_fgts           ───────────────────────────────────→ dossiê FGTS
fact_entry_reserve_signal ─────────────────────────────────→ dossiê entrada
fact_benefits_signal    ─────────────────────────────────→ observação dossiê
fact_dependente         ─────────────────────────────────→ faixa subsídio MCMV
fact_credit_restriction ──────────────────────────────────→ obs. dossiê + F5 orientação
derived_eligibility_probable ────────────────────────────→ gate F4→F5
```

**Status: ✅ Fluxo de fatos inter-fatia coerente e documentado.**

---

## §5 Matriz por stage

### F1 — Topo / Abertura (7 stages)

| Stage | Cobertura | Status | Observação |
|---|---|---|---|
| `inicio` | `fact_customer_goal`, `fact_lead_name` | ✅ OK | Ponto de entrada; curiosidade = entrada válida |
| `inicio_decisao` | `fact_customer_goal` | ✅ OK | Contexto inicial — qualquer interesse válido; não exige "intenção de compra" |
| `inicio_nome` | `fact_lead_name` | ✅ OK | OBR-F1-01 ativa; `hypothesis` não passa |
| `inicio_programa` | `fact_customer_goal` | ✅ OK | MCMV identificado; unificado com goal |
| `inicio_nacionalidade` | `fact_nationality`, `derived_rnm_required` | ✅ OK | CONF-F1-02 hard; gate de saída |
| `inicio_rnm` | `fact_rnm_status`, `derived_rnm_block` | ✅ OK | BLQ-F1-01; somente para estrangeiros |
| `inicio_tem_validade` | `fact_rnm_status`, LF-02 | ✅ OK c/ LF | RNM validade indeterminada = regra canônica; LF-02 declarada para distinção determinada/indeterminada |

**F1 status: ✅ 7/7 stages cobertos. 1 lacuna futura aceita (LF-02).**

### F2 — Qualificação / Composição Familiar (7 stages)

| Stage | Cobertura | Status | Observação |
|---|---|---|---|
| `estado_civil` | `fact_estado_civil` | ✅ OK | 5 valores canônicos; CONF-F2-01 hard |
| `confirmar_casamento` | `fact_estado_civil`, `fact_composition_actor` | ✅ OK | Casado = obrigatoriamente em conjunto |
| `interpretar_composicao` | `fact_process_mode`, `derived_composition_needed` | ✅ OK | solo/duo/p3; ROT para qualification_special |
| `confirmar_avo_familiar` | `fact_composition_actor`, `fact_p3_required` | ✅ OK c/ LF | Risco etário 67 anos; LF-02/03/04 declaradas |
| `dependente` | `fact_dependente`, `fact_dependents_count` | ✅ OK c/ LF | Regra condicional: pular se conjunto; solo<R$4k: perguntar; renda desconhecida em F2 → PEND_SLOT |
| `financiamentos_conjunto` | LF-01 | ✅ OK c/ LF | SEMPRE financiamento em conjunto agora — nunca histórico anterior; LF-01 declarada |
| `quem_pode_somar` | `fact_composition_actor`, `fact_process_mode` | ✅ OK | Identificar candidatos sem prometer aprovação |

**F2 status: ✅ 7/7 stages cobertos. 5 lacunas futuras aceitas (LF-01..05). 1 atenção (ver §14).**

### F3 — Renda / Regime / Composição (21 stages)

| Stage | Cobertura | Status | Observação |
|---|---|---|---|
| `regime_trabalho` | `fact_work_regime_p1` | ✅ OK c/ LF | Enum: CLT/autônomo/servidor/aposentado/informal/múltiplo; desempregado → LF-09 |
| `renda` | `fact_monthly_income_p1` | ✅ OK c/ LF | Renda principal P1; separação por fonte → LF-01 |
| `ctps_36` | `fact_ctps_36m_p1` | ✅ OK | Sempre para P1; não impeditivo; benefício juros |
| `ir_declarado` | `fact_autonomo_has_ir_p1` | ✅ OK | Só se autônomo; IRPF = formalização |
| `possui_renda_extra` | `fact_has_multi_income_p1`, `signal_multi_income_p1` | ✅ OK | Nunca perguntar "renda extra" direto; detectar por contexto |
| `inicio_multi_renda_pergunta` | — (transição) | ✅ OK | Stage de navegação; não persiste fact isolado |
| `inicio_multi_renda_coletar` | `fact_monthly_income_p1`, `fact_has_multi_income_p1` | ✅ OK c/ LF | Consolida multi-renda; separação por fonte → LF-01 |
| `inicio_multi_regime_pergunta` | — (transição) | ✅ OK | Stage de navegação |
| `inicio_multi_regime_coletar` | `fact_work_regime_p1` (múltiplo) | ✅ OK | Cobre regime múltiplo; docs implícitos por cada regime → ver Atenção AT-04 |
| `renda_mista_detalhe` | `fact_work_regime_p1`, `fact_monthly_income_p1` | ✅ OK c/ LF | Renda formal + informal; ~R$2.550 banco tende a limitar; LF-01 |
| `autonomo_compor_renda` | `fact_work_regime_p1`, `fact_autonomo_has_ir_p1` | ✅ OK | Viabilidade composição sem IRPF |
| `parceiro_tem_renda` | `fact_work_regime_p2`, `fact_monthly_income_p2` | ✅ OK | Somente se duo/P3; casado = P2 obrigatório |
| `regime_trabalho_parceiro` | `fact_work_regime_p2` | ✅ OK | Somente se duo/P3 |
| `regime_trabalho_parceiro_familiar` | `fact_work_regime_p3` | ✅ OK | Somente se P3 |
| `renda_parceiro` | `fact_monthly_income_p2` | ✅ OK | P2; se autônomo → fact_autonomo_has_ir_p2 |
| `renda_parceiro_familiar` | `fact_monthly_income_p3` | ✅ OK | P3 |
| `renda_familiar_valor` | `fact_monthly_income_p3`, `derived_subsidy_band_hint` | ✅ OK | hint interno — não calcula aprovação/crédito/subsídio final |
| `somar_renda_familiar` | `fact_composition_actor`, `fact_p3_required` | ✅ OK | Confirmação de P3 no processo |
| `somar_renda_solteiro` | `fact_estado_civil`, `fact_monthly_income_p3` | ✅ OK | Solteiro + composição voluntária com familiar |
| `sugerir_composicao_mista` | `derived_composition_needed` | ✅ OK | Renda insuficiente → sugerir composição |
| `ctps_36_parceiro` | `fact_ctps_36m_p2` | ✅ OK | Se P1 não tem 36m → perguntar P2; basta 1 do processo |

**F3 status: ✅ 21/21 stages cobertos. 9 lacunas futuras aceitas (LF-01..09).**

### F4 — Elegibilidade / Restrição (3 stages ativos)

| Stage | Cobertura | Status | Observação |
|---|---|---|---|
| `restricao` | `fact_credit_restriction` | ✅ OK | Sinal informativo; nunca bloqueio automático; RC-F4-01 supersede mapa legado |
| `regularizacao_restricao` | `fact_restriction_regularization_status` | ✅ OK | Regularização recomendada, não pré-condição |
| `fim_inelegivel` | `derived_eligibility_probable`, ACAO_INELEGIBILIDADE | ✅ OK | Temporário — nunca descarte definitivo; caminho de retorno obrigatório |

**Stages fora do recorte ativo (documentados como opcionais/futuros):**
| Stage | Status | Observação |
|---|---|---|
| `verificar_averbacao` | Fora do recorte | F2 aponta para F4; F4 declara fora do escopo; averbação coberta em F5 (RC-F5-36) → ver Atenção AT-01 |
| `verificar_inventario` | Fora do recorte | F2 aponta para F4; F4 e F5 declaram fora do escopo → **fora de escopo deliberado / não aplicável nesta T5** |

**F4 status: ✅ 3/3 stages ativos cobertos. 8 lacunas futuras aceitas (LF-01..08). 1 atenção (AT-01).**

### F5 — Documentação / Dossiê / Correspondente / Visita / Handoff (5 stages)

| Stage | Cobertura | Status | Observação |
|---|---|---|---|
| `envio_docs` | fact_doc_*_status, fact_docs_channel_choice, derived_doc_risk, derived_dossier_profile | ✅ OK | Coleta ativa; 3 follow-ups; docs por regime/perfil/pessoa; OBR-F5-01..05 |
| `agendamento_visita` | `fact_visit_interest`, `fact_current_intent` | ✅ OK | Toda aprovação vira agendamento; 2 slots + sábado; D-1 + D0 2h; notificação Vasques (LF-26) |
| `aguardando_retorno_correspondente` | `fact_current_intent`, LF-07/10/11/12 | ✅ OK c/ LF | Não inventar resultado; aprovado condicionado = interno; SCR/BACEN/Registrato/SPC/Serasa/Receita com fluxo |
| `finalizacao` | `fact_current_intent`, `derived_doc_risk` | ✅ OK | Fecha etapa, não processo; próximo passo claro |
| `finalizacao_processo` | `fact_current_intent` | ✅ OK | Critério rigoroso; resposta curta NUNCA encerra automaticamente |

**F5 status: ✅ 5/5 stages cobertos. 35 lacunas futuras aceitas (LF-01..35). 1 atenção (AT-04).**

---

## §6 Matriz por tipo de cliente / perfil

| Perfil | F2 cobre | F3 cobre | F5 docs | Status |
|---|---|---|---|---|
| Solo P1 | ✅ `fact_process_mode = "solo"` | ✅ `fact_work_regime_p1`, `fact_monthly_income_p1` | ✅ Docs P1 por regime | ✅ OK |
| Duo P1+P2 (casado civil) | ✅ `fact_process_mode = "duo"` obrigatório | ✅ `fact_work_regime_p2`, `fact_monthly_income_p2` | ✅ Docs P1+P2; certidão casamento (RC-F5-16) | ✅ OK |
| Duo P1+P2 (voluntário) | ✅ Composição opcional para não-casado | ✅ Renda P2 coletada | ✅ Docs P1+P2 | ✅ OK |
| P3 (familiar) | ✅ `fact_p3_required = true`; P3 cascading; LF-02/03 | ✅ `fact_work_regime_p3`, `fact_monthly_income_p3`; LF-03 | ✅ RC-F5-17; cônjuge de P3 casado civil | ✅ OK c/ LF |
| P3 familiar casado civil | ✅ SGM-F2-04; Regra 8 | ✅ Renda P3 + cônjuge de P3 | ✅ RC-F5-17: cônjuge de P3 obrigatório | ✅ OK |
| Solo solteiro com composição | ✅ Solteiro ≠ reclassificado; composição voluntária | ✅ `somar_renda_solteiro` | ✅ Docs por perfil | ✅ OK |

---

## §7 Matriz por estado civil

| Estado civil | F2 cobre | F5 docs civis | Composição | Status |
|---|---|---|---|---|
| Solteiro | ✅ `fact_estado_civil = "solteiro"` | — (sem doc civil adicional) | Voluntária; solteiro não se torna "casal" | ✅ OK |
| Casado civil | ✅ Obrigatoriamente em conjunto; dois cônjuges entram | ✅ RC-F5-16: certidão de casamento + docs cônjuge | Obrigatória | ✅ OK |
| União estável | ✅ Não equipara a casamento; não obriga conjunto; pode ser solo ou composição voluntária | — (sem doc civil específico de UE em F5) | Opcional | ✅ OK |
| Divorciado(a) | ✅ Solo por padrão; F2 aponta averbação para "F4" (texto desatualizado) | ✅ RC-F5-36: certidão com averbação quando aplicável | Solo ou voluntária | ✅ OK c/ AT-01 |
| Viúvo(a) | ✅ Solo por padrão; F2 aponta inventário para "F4" (texto desatualizado) | ✅ RC-F5-35: certidão de óbito obrigatória; inventário fora do escopo deliberado | Solo ou voluntária | ✅ OK |
| Separado(a) sem averbação | ⚠️ Não tem valor específico no enum; tratado como `"casado"` → duo obrigatório (LF-34) | ✅ RC-F5-37: dois caminhos — regularizar ou seguir com cônjuge | Obrigatória (enquanto legalmente casado) | ✅ OK c/ AT-03 |
| Familiar/P3 casado civil | ✅ SGM-F2-04; cônjuge de P3 entra (P3 cascading) | ✅ RC-F5-17 + RC-F5-16 | Cônjuge de P3 obrigatório | ✅ OK |

---

## §8 Matriz por regime / renda

| Regime / Tipo | F3 cobre | F5 docs | Benefício não financiável | Status |
|---|---|---|---|---|
| CLT | ✅ `fact_work_regime_p1 = "CLT"`; holerite; variação; CTPS | ✅ RC-F5-06: holerite; CTPS | — | ✅ OK |
| Servidor público / estatutário | ✅ `"servidor"` | ✅ RC-F5-07: folha/contracheque | — | ✅ OK |
| Aposentado | ✅ `"aposentado"` | ✅ RC-F5-08: extrato aposentadoria | — | ✅ OK |
| Pensionista | ✅ Distinção pensão por morte vs pensão alimentícia | ✅ RC-F5-09: pensão por morte = renda; alimentícia = não entra | Pensão alimentícia não entra | ✅ OK |
| Autônomo com IRPF | ✅ `"autônomo"` + `fact_autonomo_has_ir_p1 = true` | ✅ RC-F5-10: IRPF + recibo entrega | — | ✅ OK |
| Autônomo sem IRPF | ✅ `"autônomo"` + `fact_autonomo_has_ir_p1 = false`; cenário difícil solo; composição | ✅ RC-F5-11: 3 extratos; limitação marcada | — | ✅ OK |
| MEI | ✅ Tratado como autônomo para MCMV; CNPJ isolado não serve | ✅ RC-F5-12: com ou sem IRPF; CNPJ só contextualiza | — | ✅ OK |
| Empresário | ✅ Pró-labore se existir; CNPJ contextualiza; IRPF pessoa física | ✅ RC-F5-13: IRPF + pró-labore | — | ✅ OK |
| Informal / bico | ✅ Autônomo sem IRPF; renda por fora + CLT = renda mista | ✅ RC-F5-14: misto ou só informal | — | ✅ OK |
| Multi-renda | ✅ `fact_has_multi_income_p1`; stages multi-renda | ✅ Docs por cada regime aplicável (implícito) | — | ✅ OK c/ AT-04 |
| Renda mista (formal baixa + informal) | ✅ `renda_mista_detalhe`; ~R$2.550 banco limita | ✅ RC-F5-14 | — | ✅ OK c/ LF |
| Bolsa Família / BPC | ✅ `fact_benefits_signal`; não entra como renda | ✅ RC-F5-15: não entra no dossiê como renda | ✅ Não financiável | ✅ OK |
| Seguro-desemprego | ✅ RC-F3-07: não é renda financiável | ✅ RC-F5-15: não entra | ✅ Não financiável | ✅ OK |
| Trabalho temporário | ✅ RC-F3 cobre | ✅ RC-F5-15: não entra | ✅ Não financiável | ✅ OK |
| Pensão alimentícia | ✅ Distinção em F3 | ✅ RC-F5-09: não entra como renda | ✅ Não financiável | ✅ OK |
| Desempregado | ⚠️ LF-09: sem enum canônico para "desempregado" em `fact_work_regime_p1` | LF-09 se aplica | — | ✅ OK c/ LF-09 |

### 8.1 CTPS / FGTS / Entrada

| Item | F3 cobre | F5 cobre | Status |
|---|---|---|---|
| CTPS 36 meses — P1 | ✅ `fact_ctps_36m_p1`; perguntado sempre para P1 | ✅ RC-F5-05: CTPS completa quando applicable | ✅ OK |
| CTPS 36 meses — P2 | ✅ `fact_ctps_36m_p2`; perguntado se P1 não tem | ✅ RC-F5-05 + RC-F5-16 | ✅ OK |
| CTPS 36 meses — P3 | ✅ LF-03 declarada (sem `fact_ctps_36m_p3` canônico) | ✅ LF-03 referenciada | ✅ OK c/ LF |
| Basta 1 pessoa ter 36m | ✅ F3 §2.3: se P1 tem, para aí | — | ✅ OK |
| FGTS | ✅ `fact_has_fgts`; sinal de presença | ✅ RC-F5-06: extrato só se for usar | ✅ OK |
| FGTS disponível para uso + valor | ✅ `fact_has_fgts` (presença); valor → LF-20 | ✅ RC-F5-19/20: FGTS disponível + valor no dossiê; se não souber: informativo | ✅ OK c/ LF |
| Valor de entrada | ✅ `fact_entry_reserve_signal`; valor → LF-19 | ✅ RC-F5-19/20: entrada + valor no dossiê | ✅ OK c/ LF |

### 8.2 Parcela mensal pretendida / máxima confortável

| Item | Cobertura | Status |
|---|---|---|
| Parcela pretendida (LF-29) | ✅ RC-F5-34: dado informativo/comercial | ✅ OK |
| Parcela máxima confortável (LF-30) | ✅ RC-F5-34: informativo; define limite atendimento | ✅ OK |
| Não é simulação | ✅ RC-F5-34: "não é simulação, não é aprovação, não é promessa de parcela final" | ✅ OK |
| Não substitui análise banco | ✅ RC-F5-34 + AP-F5-07 | ✅ OK |

---

## §9 Matriz por documentação / dossiê

### 9.1 Docs por regime — F3→F5 coerência

| Regime | F3 fato | F5 docs | Coerência |
|---|---|---|---|
| CLT | `fact_work_regime_p1 = "CLT"` | RC-F5-06 | ✅ OK |
| Servidor | `"servidor"` | RC-F5-07 | ✅ OK |
| Aposentado | `"aposentado"` | RC-F5-08 | ✅ OK |
| Autônomo + IRPF | `"autônomo"` + `fact_autonomo_has_ir_p1 = true` | RC-F5-10 | ✅ OK |
| Autônomo - IRPF | `"autônomo"` + `fact_autonomo_has_ir_p1 = false` | RC-F5-11 | ✅ OK |
| MEI | `"autônomo"` (tratado como) | RC-F5-12 | ✅ OK |
| Empresário | regime empresário | RC-F5-13 | ✅ OK |
| Informal | `"informal"` ou misto | RC-F5-14 | ✅ OK |
| Múltiplo | `fact_work_regime_p1 = "múltiplo"` | Implícito: aplicar RC do(s) regime(s) componente(s) | ✅ OK c/ AT-04 |

### 9.2 Dossiê completo — checklist

| Item do dossiê | Fonte de fato | Status |
|---|---|---|
| Dados do pré-cadastro (nome, contato) | F1: `fact_lead_name` | ✅ OK |
| P1 — docs por regime | F3 → F5 regime | ✅ OK |
| P2 — docs por regime | F2/F3 → F5 | ✅ OK |
| P3 — docs por regime | F2/F3 → F5 RC-F5-17 | ✅ OK |
| Cônjuge de P3 casado civil | F2 Regra 8 → F5 RC-F5-17 | ✅ OK |
| Viúvo(a): certidão de óbito | F5 RC-F5-35 (fix) | ✅ OK |
| Divorciado(a): certidão com averbação | F5 RC-F5-36 (fix) | ✅ OK |
| Separado sem averbação: dois caminhos | F5 RC-F5-37 (fix) | ✅ OK |
| Idade de todos os participantes | LF-21 (F5) | ✅ OK c/ LF |
| Bairro mora / trabalha / pretende comprar | LF-16/17/18 (F5) | ✅ OK c/ LF |
| Regime e renda válida de cada pessoa | F3 fatos → F5 dossiê | ✅ OK |
| Renda não financiável como observação | F3 `fact_benefits_signal` → F5 RC-F5-15 | ✅ OK |
| Profissão do autônomo | LF-03 (F5) | ✅ OK c/ LF |
| Curso superior do autônomo | LF-04 (F5) | ✅ OK c/ LF |
| Documentos recebidos / pendentes | F5 `fact_doc_*_status` | ✅ OK |
| Composição do processo | F2 `fact_process_mode` → dossiê | ✅ OK |
| Restrição informada (observação) | F4 `fact_credit_restriction` → F5 RC-F5-20 | ✅ OK |
| Se possui entrada + valor | F3 `fact_entry_reserve_signal` + LF-19 | ✅ OK c/ LF |
| Se possui FGTS + valor disponível | F3 `fact_has_fgts` + LF-20 | ✅ OK c/ LF |
| Parcela mensal pretendida / máxima confortável | F5 RC-F5-34 + LF-29/30 | ✅ OK |
| Observações comerciais | F5 RC-F5-19 | ✅ OK |
| Inventário | **Fora de escopo deliberado** (F4 §1.4 + F5 RC-F5-35) — não aplicável nesta T5 | ✅ OK |

---

## §10 Matriz por correspondente / retorno

| Ponto de validação | Cobertura | Status |
|---|---|---|
| Dossiê enviado por link | F5 RC-F5-21; LF-05/06 | ✅ OK c/ LF |
| Aprovado condicionado fica interno | F5 RC-F5-22 | ✅ OK |
| Cliente só vê aprovado / reprovado | F5 RC-F5-22/23 | ✅ OK |
| Não informar valor de restrição | F5 RC-F5-23; VS-F5-05 | ✅ OK |
| Não informar parcela possível ao cliente | F5 RC-F5-23; VS-F5-04 | ✅ OK |
| SCR / BACEN / Registrato — fluxo | F5 RC-F5-24; §2.3 | ✅ OK c/ LF-13/14 |
| SPC / Serasa — orientação | F5 RC-F5-25 | ✅ OK |
| Receita Federal — orientação | F5 RC-F5-26 | ✅ OK |
| Não inventar retorno | F5 RC-F5-23; AP-F5-06 | ✅ OK |
| Cliente aprovado deve virar agendamento / visita | F5 RC-F5-27; SGM-F5-05 | ✅ OK |

---

## §11 Matriz por visita / agendamento

| Ponto de validação | Cobertura | Status |
|---|---|---|
| Visita ≠ "conhecer imóvel" antes da aprovação | F5 RC-F5-27; VS-F5-07 | ✅ OK |
| Visita serve para docs / simulação presencial | F5 §2.2; RC-F5-02 | ✅ OK |
| Cliente aprovado → agendamento obrigatório | F5 RC-F5-27: "toda aprovação deve virar agendamento" | ✅ OK |
| Enova oferece 2 opções conforme slots | F5 RC-F5-27; LF-23 | ✅ OK c/ LF |
| Se não houver slot: oferecer sábado | F5 RC-F5-27 | ✅ OK |
| Confirmar 1 dia antes | F5 RC-F5-28; LF-24 | ✅ OK c/ LF |
| Confirmar 2h antes | F5 RC-F5-28; LF-25 | ✅ OK c/ LF |
| Notificar Vasques | F5 RC-F5-28; LF-26 | ✅ OK c/ LF |

---

## §12 Matriz por finalização

| Ponto de validação | Cobertura | Status |
|---|---|---|
| `finalizacao` fecha etapa, não processo | F5 RC-F5-31; §2.4 | ✅ OK |
| `finalizacao_processo` fecha ciclo real | F5 RC-F5-32; §2.5 | ✅ OK |
| Critério rigoroso: só quando tudo concluído | F5 RC-F5-32: sem doc pendente + sem visita aberta + sem retorno pendente | ✅ OK |
| Resposta curta não encerra se há pendência | F5 RC-F5-32; AP-F5-10; VS-F5-08 | ✅ OK |
| Depois do fechamento real: respostas curtas não reabrem | F5 §2.5; RC-F5-33 | ✅ OK |
| Só nova intenção real reabre conversa | F5 RC-F5-33; LF-28 | ✅ OK |

---

## §13 Lacunas futuras aceitas

> Todas as lacunas abaixo foram declaradas explicitamente nas fatias correspondentes.
> Nenhuma impede o avanço declarativo do funil. São gaps de schema/runtime para PRs futuras.

### F1 (2 LFs)

| LF | Dado ausente | Impacto | Aceito? |
|---|---|---|---|
| F1-LF-01 | Data exata de validade do RNM | `fact_rnm_expiry_date` não existe | ✅ Aceito |
| F1-LF-02 | Tipo de validade RNM (determinada vs indeterminada) | Regra comercial declarada; schema não distingue | ✅ Aceito |

### F2 (5 LFs)

| LF | Dado ausente | Impacto | Aceito? |
|---|---|---|---|
| F2-LF-01 | Estrutura de cofinanciamento atual | Efeito capturado em `fact_process_mode` | ✅ Aceito |
| F2-LF-02 | Estado civil do familiar P3 | P3 cascading documentado em regra; sem `fact_*` | ✅ Aceito |
| F2-LF-03 | Cônjuge do familiar P3 | Regra documentada; sem `fact_*` para cônjuge de P3 | ✅ Aceito |
| F2-LF-04 | Idade do familiar / avô / avó | Alerta 67 anos documentado; sem `fact_age_composition_actor` | ✅ Aceito |
| F2-LF-05 | Base normativa MCMV/CEF | Sem arquivo de normativa completa no repo | ✅ Aceito (lacuna crítica — PR futura de base normativa) |

### F3 (9 LFs)

| LF | Dado ausente | Impacto | Aceito? |
|---|---|---|---|
| F3-LF-01 | Separação por fonte de renda | Total consolidado em `fact_monthly_income_p1` | ✅ Aceito |
| F3-LF-02 | `fact_autonomo_has_ir_p3` | Autônomo P3 sem IRPF; documentado | ✅ Aceito |
| F3-LF-03 | `fact_ctps_36m_p3` | CTPS P3; documentado | ✅ Aceito |
| F3-LF-04 | Tipo de pensão (por morte vs alimentícia) | Distinção documentada em regra | ✅ Aceito |
| F3-LF-05 | Benefício não financiável — classificação canônica | `fact_benefits_signal` captura presença | ✅ Aceito |
| F3-LF-06 | Pró-labore do empresário | Informativo; documentado | ✅ Aceito |
| F3-LF-07 | Média de renda variável | Estimativa usada; sem `fact_*` para média calculada | ✅ Aceito |
| F3-LF-08 | CNPJ-only signal | CNPJ isolado não é renda válida; documentado | ✅ Aceito |
| F3-LF-09 | Enum "desempregado" ausente em `fact_work_regime_p1` | Caso coberto por workaround (`fact_benefits_signal`); gap de enum | ✅ Aceito (gap de schema) |

### F4 (8 LFs)

| LF | Dado ausente | Impacto | Aceito? |
|---|---|---|---|
| F4-LF-01 | Origem da dívida | Informativo; sem `fact_*` | ✅ Aceito |
| F4-LF-02 | Valor da dívida | Informativo; sem `fact_*` | ✅ Aceito |
| F4-LF-03 | Incerteza sobre constar ("não sei se tenho restrição") | Nuance de captura; `fact_credit_restriction` cobre o caso | ✅ Aceito |
| F4-LF-04 | Status pós-banco (se restrição apareceu ou não) | Confirmado pelo correspondente; sem `fact_*` de retorno | ✅ Aceito |
| F4-LF-05 | Impacto real confirmado da restrição | Correspondente confirma; não há `fact_*` pré-análise | ✅ Aceito |
| F4-LF-06 | Condição de retorno (quando o lead pode voltar) | Orientação declarada; sem schema de data/condição | ✅ Aceito |
| F4-LF-07 | Motivo de inelegibilidade | Usado pelo LLM via contexto; sem `fact_*` canônico | ✅ Aceito |
| F4-LF-08 | Prazo de reabordagem | Registrado operacionalmente; sem `fact_*` canônico | ✅ Aceito |

### F5 (35 LFs — resumo das principais)

> Declaradas em §4 do artefato F5. Todas aceitas como gaps intencionais.
> Ver `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md §4` para lista completa (LF-01..35).

| Grupo | LFs | Descrição |
|---|---|---|
| Documentação | LF-01..04 | Listas dinâmicas, docs P2/P3, profissão, curso autônomo |
| Canal / envio | LF-05/06 | Site/link de envio; flag "dossiê enviado" |
| Correspondente | LF-07/10..15 | Responsável; resultado análise; aprovado condicionado; motivo; Registrato; extrato; comprovante |
| Follow-up | LF-08/09 | Contagem follow-ups; silêncio |
| Localização | LF-16..18 | Bairros mora/trabalha/comprar |
| Financeiro | LF-19..21 | Entrada; FGTS disponível; idade participantes |
| Visita | LF-22..26 | Agendado; slots; D-1; D0; notificação Vasques |
| Finalização | LF-27/28 | Distinção etapa/processo; nova intenção |
| Comercial | LF-29..31 | Parcela pretendida; máxima; limite negociação |
| Civil (fix) | LF-32..35 | Certidão de óbito; certidão com averbação; separado sem averbação; regularização pendente |

---

## §14 Atenções / PR-fix recomendadas

> Nenhum dos itens abaixo é bloqueante para PR-T5.7 ou PR-T5.8.
> Todos devem ser resolvidos **antes de PR-T5.R** ou antes da implementação de runtime das fatias afetadas.

### AT-01 — Referência de averbação desatualizada em F2

**Artefato afetado:** `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md §3.1`

**Descrição:**
A tabela de valores canônicos de `fact_estado_civil` em F2 lista:
> `"divorciado"` → "Solo por padrão; verificação de averbação em F4 (LF-F4: fora do escopo de F2)"

Porém F4 (`T5_FATIA_ELEGIBILIDADE_RESTRICAO.md §1.4`) declara explicitamente que `verificar_averbacao`
**está fora do recorte ativo**. A cobertura real de averbação foi implementada em F5 (RC-F5-36, PR-T5.6-fix).

**Impacto:** Inconsistência de ponteiro no texto (F2 aponta F4; realidade é F5). Sem impacto em regra operacional — a regra está correta em F5. Risco: confusão na leitura do contrato F2.

**Ação recomendada:** PR-fix cirúrgica em `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` para
corrigir a nota de "divorciado" de "F4" para "F5" (RC-F5-36). Não bloqueia T5.R se o time souber da inconsistência.

---

### Nota: Inventário — Fora de escopo deliberado / não aplicável nesta T5

**Artefatos consultados:** `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md §3.1`,
`T5_FATIA_ELEGIBILIDADE_RESTRICAO.md §1.4`,
`T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md RC-F5-35`

Inventário de bens está **fora de escopo deliberado** nesta T5. F4 e F5 excluem inventário
explicitamente do recorte ativo. Esta decisão foi validada pelo Vasques nas PRs anteriores.
Não constitui lacuna a corrigir nem requer PR-fix nesta T5.

O ponteiro textual de F2 ("inventário → F4") está desatualizado, mas esse problema de texto
é coberto pelo AT-01 (averbação) — a mesma tabela também aponta para F4 incorretamente.
Ambos os ponteiros podem ser corrigidos em conjunto pela PR-fix-AT-01 se o time assim preferir.

---

### AT-03 — Gap de timing na descoberta de "separado sem averbação"

**Artefatos afetados:** `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md §3.1`,
`T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md RC-F5-37`, `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md §4 LF-34`

**Descrição:**
O enum de `fact_estado_civil` em T2 não inclui `"separado_sem_averbaçao"`. Quando o lead
está separado mas sem averbação de divórcio, é legalmente casado. F2 capturará
`fact_estado_civil = "casado"`, determinando `fact_process_mode = "duo"` (obrigatório).

O lead pode não mencionar que é "separado" até chegar na coleta de documentos (F5). Nesse ponto,
RC-F5-37 apresenta os dois caminhos corretamente. Porém o `fact_process_mode` já foi definido
em F2 como "duo" — o que é tecnicamente correto (legalmente ainda são casados), mas o lead
pode se surpreender.

**Impacto:** Não há contradição — o comportamento é tecnicamente correto. O risco é de
atrito na experiência: lead que se considera "separado" descobre em F5 que legalmente ainda
é casado e que o cônjuge precisa entrar. LF-34 já declara esta lacuna.

**Ação recomendada:** PR-fix em F2 para adicionar nota explícita na regra de casado civil:
"Se o lead mencionar que é separado mas sem averbação, tratar como casado civil (ainda legalmente
casado) e orientar sobre os dois caminhos disponíveis em F5 (RC-F5-37). Não esperar F5 para
essa orientação." Melhora a experiência, não corrige contradição.

---

### AT-04 — Regime "múltiplo" — docs F5 implícitos, não explícitos

**Artefato afetado:** `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md §5`

**Descrição:**
F3 declara `fact_work_regime_p1 = "múltiplo"` para leads com mais de um regime de trabalho
(ex: CLT + autônomo; servidor + CLT; aposentado + informal).

F5 tem regras documentais separadas por regime (RC-F5-06..14) mas não tem uma regra explícita
para `"regime múltiplo"`. A expectativa implícita é que as regras do(s) regime(s) componente(s)
se apliquem cumulativamente (ex: CLT + autônomo → docs de CLT + docs de autônomo).

**Impacto:** Sem ambiguidade de regra — a lógica implícita é clara. Porém sem documentação
explícita, o LLM pode não solicitar todos os docs necessários ou pode solicitar em excesso.

**Ação recomendada:** PR-fix em F5 para adicionar RC-F5-X explícita sobre regime múltiplo:
"Quando `fact_work_regime_p1 = 'múltiplo'`, aplicar as regras documentais de cada regime
componente (RC-F5-06..14) de forma cumulativa." Pequena clarificação sem nova regra.

---

### AT-05 — Base normativa MCMV/CEF ausente (F2-LF-05)

**Artefato afetado:** `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md §4 LF-05`

**Descrição:**
Não existe no repo uma base normativa completa do programa MCMV/CEF. Regras sobre grau de
parentesco aceito para composição, limite de idade preciso da Caixa, condições especiais de
aceitação de P3, faixas de renda e subsídio atualizadas — dependem de conhecimento externo
não formalizado.

**Impacto (médio):** O LLM deve responder questões regulatórias específicas sem arquivo de
referência. Pode haver imprecisão ou desatualização para casos-limite.

**Ação recomendada:** PR futura dedicada à base normativa MCMV/CEF — compilar regras do
programa (faixas, parentesco, idades, condições), deixar disponível no repo para consulta.
Não bloqueia T5.R mas aumenta o risco de respostas imprecisas sobre casos normativos específicos.

---

## §15 Bloqueantes

> **Nenhum bloqueante encontrado.**

Não foi identificada nenhuma contradição de regra, passagem de fase quebrada, stage sem cobertura
essencial, documento obrigatório faltando, restrição virando bloqueio indevido, aprovado não
virando agendamento, ou finalização prematura possível pelo contrato declarativo.

---

## §16 Veredito final

**PODE SEGUIR COM ATENÇÃO**

| Critério | Status |
|---|---|
| F1–F5 stages cobertos | ✅ 43/43 stages verificados |
| `current_phase` 8 valores canônicos | ✅ 8/8 cobertos |
| Continuidade F1→F2→F3→F4→F5 | ✅ ROT policies de cada fatia encadeiam corretamente |
| Fatos T2 sem invenção | ✅ 35 fatos canônicos; zero inventado; 54+ lacunas declaradas |
| Soberania LLM intacta | ✅ Zero reply_text em qualquer política T3 de qualquer fatia |
| Regra de restrição (F4→F5) | ✅ Informativa; não bloqueia docs; correspondente confirma |
| Toda aprovação vira agendamento | ✅ RC-F5-27 + SGM-F5-05 |
| Finalização com critério rigoroso | ✅ RC-F5-32; AP-F5-10; resposta curta não encerra |
| Docs por regime F3→F5 coerentes | ✅ 9 regimes mapeados; múltiplo implícito (AT-04) |
| Estado civil completo | ✅ 6 casos cobertos; separado sem averbação com dois caminhos (RC-F5-37) |
| Inventário | ✅ Fora de escopo deliberado — decisão de negócio validada; certidão de óbito cobre estado civil |
| Benefícios não financiáveis | ✅ BF, BPC, seguro-desemprego, trabalho temporário, pensão alimentícia — todos declarados |
| CTPS/FGTS/Entrada | ✅ F3 captura; F5 usa; FGTS só se for usar |
| Parcela mensal confortável | ✅ RC-F5-34: informativa; não é simulação/aprovação/promessa |
| Bloqueantes | ✅ 0 encontrados |
| Atenções antes de T5.R | ⚠️ 4 atenções (AT-01, AT-03..05) — não bloqueiam T5.8 |

### Pré-condições para avançar além de T5.R

Antes de abrir PR-T5.R (readiness / closeout G5), as atenções AT-01, AT-03 e AT-04 devem ser
resolvidas em PRs-fix cirúrgicas, ou o time deve documentar formalmente a aceitação do risco.
AT-05 (base normativa) pode seguir como lacuna aceita para T5.R se o time aceitar o risco
de respostas sobre casos normativos específicos.

---

## §17 Próxima PR autorizada

**PR-T5.8 — Plano de shadow controlado / sandbox** (se o contrato T5 exigir antes de T5.R)

**OU**

**PR-T5.R — Readiness / Closeout G5** (conforme contrato `CONTRATO_IMPLANTACAO_MACRO_T5.md`)

Com recomendação de abrir as 4 PR-fixes de atenção antes de PR-T5.R:
- **PR-fix-AT-01:** Corrigir ponteiro "averbação → F4" para "averbação → F5 RC-F5-36" em F2
- **PR-fix-AT-03:** Adicionar nota em F2 sobre "separado sem averbação → orientar caminhos F5 RC-F5-37"
- **PR-fix-AT-04:** Adicionar regra explícita em F5 sobre docs para regime múltiplo
- **PR-fix-AT-05:** PR futura de base normativa MCMV/CEF (ou aceitar lacuna formalmente)

---

## §18 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: validação/matriz — não cria regras, não altera fatias
Última PR relevante: PR-T5.6-fix (#121) — merged 2026-04-28T01:33:38Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
Objetivo imutável do contrato: Migração declarativa do funil core por fatias; LLM soberano na fala
Recorte a executar nesta PR: PR-T5.7 — Matriz de paridade funcional F1-F5
Item do A01: T5 — PR-T5.7 — Validação cruzada declarativa F1-F5
Estado atual da frente: T5 aberto; F1-F5 todos entregues com contratos declarativos vigentes
O que a última PR fechou: F5 correção civis (viúvo/divorciado/separado sem averbação)
O que a última PR NÃO fechou: paridade validada formalmente; T5.8; T5.R; G5
Por que esta tarefa existe: F1-F5 entregues; validar coerência ponta a ponta antes de T5.R
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md com cruzamento completo F1-F5
Escopo: schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md + live files
Fora de escopo: src/, runtime, T1/T2/T3/T4 aprovados, criação de regras, criação de fact_*
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  F1 lido:                     schema/implantation/T5_FATIA_TOPO_ABERTURA.md
  F2 lido:                     schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md
  F3 lido:                     schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md
  F4 lido:                     schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md
  F5 lido:                     schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md (incl. fix civis)
  Mapa de fatias consultado:   schema/implantation/T5_MAPA_FATIAS.md
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | 43 stages verificados (F1:7, F2:7, F3:21, F4:3, F5:5) | §5 |
| 2 | 8/8 `current_phase` canônicos cobertos e mapeados | §4.1 |
| 3 | Fluxo de fatos inter-fatia documentado | §4.2 |
| 4 | Matriz por estado civil: 6 casos cobertos | §7 |
| 5 | Matriz por regime: 14 regimes + benefícios verificados | §8 |
| 6 | Checklist de dossiê: 21 itens verificados | §9.2 |
| 7 | Correspondente / retorno: 10 pontos verificados | §10 |
| 8 | Visita / agendamento: 8 pontos verificados | §11 |
| 9 | Finalização: 6 pontos verificados | §12 |
| 10 | Lacunas futuras aceitas: 54+ LFs catalogadas (F1:2, F2:5, F3:9, F4:8, F5:35) | §13 |
| 11 | 4 atenções identificadas com artefato afetado e ação recomendada | §14 |
| 12 | 0 bloqueantes | §15 |
| 13 | Veredito explícito: PODE SEGUIR COM ATENÇÃO | §16 |
| 14 | Próxima PR autorizada declarada | §17 |
| 15 | Zero regra comercial criada | auditável em §5-§12 |
| 16 | Zero `fact_*` criado | auditável — apenas referências a fatos existentes |
| 17 | Zero `current_phase` criado | §4.1: 8 valores canônicos confirmados, zero novos |
| 18 | Zero `reply_text` | auditável — nenhuma seção desta matriz contém text de fala |

### Provas

- **P-T5.7-01:** arquivo `schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` criado; `git diff --stat` confirma novo artefato
- **P-T5.7-02:** Cruzamento de 43 stages declarados vs. artefatos F1-F5 lidos integralmente; nenhum stage sem cobertura encontrado
- **P-T5.7-03:** Veredito fundamentado em auditoria de 5 fatias + 35 fatos T2 canônicos + 8 current_phase values + 54+ lacunas aceitas; 0 bloqueantes; 4 atenções documentadas com artefato, impacto e ação

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md — matriz declarativa cruzada de 43 stages, 6 estados civis, 14 regimes, dossiê, correspondente, visita, finalização; 4 atenções identificadas; 0 bloqueantes; veredito: PODE SEGUIR COM ATENÇÃO
O que foi fechado nesta PR: Paridade funcional declarativa F1-F5 validada; PR-T5.8 ou PR-T5.R autorizada conforme contrato
O que continua pendente: 4 PR-fixes de atenção (AT-01, AT-03..05); T5.8 / T5.R; G5; runtime
O que ainda não foi fechado do contrato ativo: PR-T5.8 / PR-T5.R; G5; shadow; readiness
Recorte executado do contrato: T5 — PR-T5.7 — Validação declarativa F1-F5
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — PR-T5.8 ou PR-T5.R conforme contrato T5
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
