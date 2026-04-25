# T3_REGRAS_CRITICAS_DECLARATIVAS — Regras Críticas Declarativas — ENOVA 2

## Finalidade

Este documento codifica as **quatro regras críticas obrigatórias** do policy engine v1 da ENOVA 2
de forma declarativa — sem implementar motor de execução, runtime ou código.

Cada regra está expressa como: fatos de entrada → condição de disparo → classe emitida →
payload declarativo → efeito no `lead_state`.

**Princípios canônicos (A00-ADENDO-01 e A00-ADENDO-02):**
> O policy engine **decide**. O LLM **fala**.
> Nenhum payload desta especificação contém `reply_text`, `mensagem_usuario`,
> `texto_cliente`, frase pronta ou template de resposta.
> Qualquer regra que emita texto destinado ao cliente está não conforme.

**Pré-requisitos obrigatórios:**
- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — classes canônicas e payloads.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shapes e status canônicos.
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens e confiança.
- `schema/implantation/T2_RECONCILIACAO.md` (PR-T2.4) — protocolo de conflito.

**Microetapa do mestre coberta por este artefato:**
> **Microetapa 1 — T3:** "Transformar as regras mais sensíveis primeiro
> (casado civil → conjunto; autônomo → IR; renda solo baixa → composição;
> estrangeiro sem RNM → não avançar)."

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T3 microetapa 1;
  seção T2 (regras de negócio MCMV: estado civil, regime, composição, elegibilidade)
- Legados L07–L08 (estado civil), L09–L10 (composição), L11–L12 (renda/regime), L19 (MCMV)

---

## 1. Mapa geral das regras críticas

| Rule ID | Regra canônica | Fatos de entrada principais | Classe primária emitida | Severidade |
|---------|---------------|----------------------------|------------------------|------------|
| `R_CASADO_CIVIL_CONJUNTO` | Casado civil → conjunto | `fact_estado_civil`, `fact_process_mode` | obrigação | `warning` |
| `R_AUTONOMO_IR` | Autônomo → IR obrigatório | `fact_work_regime_p1`, `fact_autonomo_has_ir_p1` | obrigação / confirmação / sugestão_mandatória | `warning` / `critical` |
| `R_SOLO_BAIXA_COMPOSICAO` | Renda solo baixa → orientar composição | `fact_process_mode`, `fact_monthly_income_p1`, `derived_composition_needed` | sugestão_mandatória + obrigação | `info` / `warning` |
| `R_ESTRANGEIRO_SEM_RNM` | Estrangeiro sem RNM → bloqueio | `fact_nationality`, `fact_rnm_status`, `derived_rnm_required` | bloqueio | `blocking` |

**Regra transversal:**
> Fato em `hypothesis` nunca dispara regra crítica.
> Fato em `captured` ou `inferred` pode exigir `confirmação` antes de `bloqueio` terminal.
> Todo conflito ativo deve respeitar o protocolo de `T2_RECONCILIACAO.md`.

---

## 2. Regra R_CASADO_CIVIL_CONJUNTO

### 2.1 Identificação

| Campo | Valor |
|-------|-------|
| `rule_id` | `R_CASADO_CIVIL_CONJUNTO` |
| Objetivo | Garantir que lead casado no civil inclua cônjuge no processo MCMV |
| Legados de referência | L07, L08 (estado civil e composição) |
| Microetapa do mestre | Microetapa 1 — "casado civil → conjunto" |

### 2.2 Fatos de entrada

| Fato | Tipo | Grupo | Condição esperada |
|------|------|-------|-------------------|
| `fact_estado_civil` | `fact_*` | III | `"casado_civil"` |
| `fact_process_mode` | `fact_*` | III | qualquer valor (inclusive ausente) |
| `fact_composition_actor` | `fact_*` | III | ausente ou a confirmar |

### 2.3 Condição de disparo

```
DISPARA quando:
  fact_estado_civil = "casado_civil"
  AND (fact_process_mode = "solo" OR fact_process_mode ausente)

NÃO DISPARA quando:
  fact_process_mode = "conjunto"  (já está correto)
  OR fact_estado_civil != "casado_civil"
  OR fact_estado_civil.status = "hypothesis"  (não confirmado — não dispara)

EXIGE CONFIRMAÇÃO ANTES DE OBRIGAÇÃO quando:
  fact_estado_civil.status = "captured" com origem INDIRECT_TEXT ou AUDIO_TRANSCRIPT
  (confiança baixa — confirmar antes de impor modo de processo)
```

### 2.4 Fluxo de decisão

```
fact_estado_civil.status?
  ├── hypothesis           → NÃO DISPARA (regra CP-09 de T3_CLASSES_POLITICA)
  ├── captured (baixa conf.)→ emite CONFIRMAÇÃO (R_CASADO_CIVIL_CONJUNTO_CONFIRM)
  ├── captured / inferred  → emite OBRIGAÇÃO (process_mode = conjunto)
  └── confirmed            → emite OBRIGAÇÃO + ROTEAMENTO se aplicável
```

### 2.5 Decisões emitidas

#### Decisão A — Confirmação prévia (quando confiança baixa)

```
PolicyDecision {
  class:    "confirmação"
  rule_id:  "R_CASADO_CIVIL_CONJUNTO_CONFIRM"
  severity: "warning"
  target:   "fact_estado_civil"
  reason:   "fact_estado_civil = 'casado_civil' em status captured com origem de baixa confiança. Confirmação obrigatória antes de impor modo de processo conjunto."
  action: ConfirmacaoAction {
    type:               "confirmação"
    fact_to_confirm:    "fact_estado_civil"
    current_status:     "captured"
    current_value:      "casado_civil"
    confirmation_level: "hard"
    if_not_confirmed:   "fact_estado_civil permanece captured; regra R_CASADO_CIVIL_CONJUNTO suspensa até confirmação"
  }
}
```

#### Decisão B — Obrigação de modo conjunto (quando estado civil confirmado)

```
PolicyDecision {
  class:    "obrigação"
  rule_id:  "R_CASADO_CIVIL_CONJUNTO"
  severity: "warning"
  target:   "fact_process_mode"
  reason:   "fact_estado_civil = 'casado_civil' confirmado. Programa MCMV exige inclusão do cônjuge no processo. fact_process_mode deve ser 'conjunto'."
  action: ObrigacaoAction {
    type:           "obrigação"
    required_fact:  "fact_process_mode"
    reason_code:    "R_CASADO_CIVIL_CONJUNTO"
    priority:       1
    if_not_collected: "lead não pode seguir como processo solo; composição obrigatória por estado civil"
  }
}
```

### 2.6 Efeito esperado no lead_state

| Campo | Estado antes | Estado depois |
|-------|-------------|---------------|
| `operational.must_ask_now` | qualquer | inclui `"fact_process_mode"` |
| `operational.recommended_next_actions` | qualquer | inclui `ACAO_FORCAR_CONJUNTO` |
| `facts.fact_process_mode.value` | `"solo"` / ausente | a ser atualizado para `"conjunto"` após coleta |
| `operational.last_policy_decision` | qualquer | `"R_CASADO_CIVIL_CONJUNTO"` |

### 2.7 Condição de desbloqueio / resolução

A obrigação é resolvida quando:
- `fact_process_mode = "conjunto"` com status `confirmed`
- `fact_composition_actor` preenchido com cônjuge/parceiro

### 2.8 Exemplos

#### Positivo (regra dispara corretamente)

```
Entrada:
  fact_estado_civil = { value: "casado_civil", status: "confirmed", source: "EXPLICIT_TEXT" }
  fact_process_mode = { value: "solo", status: "captured" }

Saída esperada:
  PolicyDecision(class="obrigação", rule_id="R_CASADO_CIVIL_CONJUNTO")
  → operational.must_ask_now += ["fact_process_mode"]
  → operational.recommended_next_actions += [ACAO_FORCAR_CONJUNTO]
```

#### Negativo (regra não dispara)

```
Entrada:
  fact_estado_civil = { value: "casado_civil", status: "confirmed" }
  fact_process_mode = { value: "conjunto", status: "confirmed" }

Saída esperada:
  [] (nenhuma PolicyDecision — regra já satisfeita)
```

#### Ambíguo (confirmação antes de obrigar)

```
Entrada:
  fact_estado_civil = { value: "casado_civil", status: "captured",
                        source: "AUDIO_TRANSCRIPT", confidence: "low" }
  fact_process_mode = ausente

Saída esperada:
  PolicyDecision(class="confirmação", rule_id="R_CASADO_CIVIL_CONJUNTO_CONFIRM")
  → confirmar estado civil antes de emitir obrigação
```

---

## 3. Regra R_AUTONOMO_IR

### 3.1 Identificação

| Campo | Valor |
|-------|-------|
| `rule_id` | `R_AUTONOMO_IR` |
| Objetivo | Garantir coleta de declaração de IR para P1 autônomo; orientar riscos de ausência |
| Legados de referência | L11, L12 (regime e renda) |
| Microetapa do mestre | Microetapa 1 — "autônomo → IR" |

### 3.2 Fatos de entrada

| Fato | Tipo | Grupo | Condição |
|------|------|-------|---------|
| `fact_work_regime_p1` | `fact_*` | IV | `"autônomo"` |
| `fact_autonomo_has_ir_p1` | `fact_*` | IV | ausente / `"não"` / `"parcial"` / `"sim"` |
| `fact_monthly_income_p1` | `fact_*` | IV | qualquer (contexto de severidade) |

### 3.3 Condição de disparo

```
DISPARA quando:
  fact_work_regime_p1 = "autônomo"

NÃO DISPARA quando:
  fact_work_regime_p1 != "autônomo"
  OR fact_work_regime_p1.status = "hypothesis"
  OR fact_autonomo_has_ir_p1 = "sim" E status = "confirmed"  (já resolvido)

VARIANTE POR ESTADO DE fact_autonomo_has_ir_p1:
  ausente            → OBRIGAÇÃO (coletar)
  "não_informado"    → CONFIRMAÇÃO (esclarecer)
  "não"              → SUGESTÃO MANDATÓRIA (risco; não é bloqueio terminal)
  "parcial"          → CONFIRMAÇÃO (o que é "parcial"? escopo?)
  "sim"  confirmed   → NENHUMA (regra satisfeita)
```

**Cuidado crítico:** autônomo sem IR **não é inelegível automático**. A ausência de IR
impacta a comprovação de renda, mas existem alternativas documentais (extratos bancários,
declaração do contador, Simples Nacional). A regra orienta — não condena.

### 3.4 Fluxo de decisão

```
fact_work_regime_p1 = "autônomo"?
  ├── não / hypothesis → NÃO DISPARA
  └── sim (qualquer status ≥ captured)
        └── fact_autonomo_has_ir_p1?
              ├── ausente             → OBRIGAÇÃO (coletar IR)
              ├── "não_informado"     → CONFIRMAÇÃO (esclarecer situação)
              ├── "não"               → SUGESTÃO MANDATÓRIA (risco de comprovação)
              ├── "parcial"           → CONFIRMAÇÃO (detalhar o que existe)
              └── "sim" confirmed     → NENHUMA
```

### 3.5 Decisões emitidas

#### Decisão A — Obrigação de coleta (fact ausente)

```
PolicyDecision {
  class:    "obrigação"
  rule_id:  "R_AUTONOMO_IR_COLETAR"
  severity: "warning"
  target:   "fact_autonomo_has_ir_p1"
  reason:   "fact_work_regime_p1 = 'autônomo' confirmado. fact_autonomo_has_ir_p1 ausente. Coleta obrigatória para avaliação de comprovação de renda."
  action: ObrigacaoAction {
    type:           "obrigação"
    required_fact:  "fact_autonomo_has_ir_p1"
    reason_code:    "R_AUTONOMO_IR_COLETAR"
    priority:       2
    if_not_collected: "avaliação de elegibilidade de renda suspensa para P1 autônomo"
  }
}
```

#### Decisão B — Confirmação (situação ambígua)

```
PolicyDecision {
  class:    "confirmação"
  rule_id:  "R_AUTONOMO_IR_CONFIRMAR"
  severity: "warning"
  target:   "fact_autonomo_has_ir_p1"
  reason:   "fact_autonomo_has_ir_p1 = 'não_informado' ou 'parcial'. Confirmação necessária para entender o contexto real de comprovação."
  action: ConfirmacaoAction {
    type:               "confirmação"
    fact_to_confirm:    "fact_autonomo_has_ir_p1"
    current_status:     "captured"
    current_value:      "não_informado"
    confirmation_level: "hard"
    if_not_confirmed:   "risco de avaliação incompleta de renda para P1 autônomo"
  }
}
```

#### Decisão C — Sugestão mandatória (autônomo sem IR declarado)

```
PolicyDecision {
  class:    "sugestão_mandatória"
  rule_id:  "R_AUTONOMO_SEM_IR_RISCO"
  severity: "warning"
  target:   "fact_autonomo_has_ir_p1"
  reason:   "fact_autonomo_has_ir_p1 = 'não' confirmado. Comprovação de renda para autônomo sem IR exige documentação alternativa (extratos, contador, Simples Nacional)."
  action: SugestaoMandatoriaAction {
    type:          "sugestão_mandatória"
    guidance_code: "SGM_AUTONOMO_SEM_IR"
    context:       "P1 é autônomo sem declaração de IR. Risco de comprovação de renda insuficiente sem alternativas documentais. Não é inelegibilidade automática."
    recommended_behavior: "verificar existência de extratos bancários, declaração de contador ou Simples Nacional; coletar fact_doc_income_status; não concluir inelegibilidade sem esgotar alternativas"
    urgency:       "medium"
  }
}
```

### 3.6 Efeito esperado no lead_state

| Campo | Estado antes | Estado depois |
|-------|-------------|---------------|
| `operational.must_ask_now` | qualquer | inclui `"fact_autonomo_has_ir_p1"` (Decisão A) |
| `operational.risk_level` | `"none"` / `"low"` | `"medium"` quando Decisão C |
| `operational.last_policy_decision` | qualquer | `"R_AUTONOMO_IR_COLETAR"` / `"R_AUTONOMO_SEM_IR_RISCO"` |
| `facts.fact_autonomo_has_ir_p1` | ausente | a ser preenchido após coleta |

### 3.7 Condição de resolução

A regra é resolvida quando:
- `fact_autonomo_has_ir_p1 = "sim"` com status `confirmed`
- OU `fact_autonomo_has_ir_p1 = "não"` + sugestão registrada + `fact_doc_income_status` com
  alternativa documental sendo tratada

### 3.8 Exemplos

#### Positivo (coletar IR)

```
Entrada:
  fact_work_regime_p1 = { value: "autônomo", status: "confirmed" }
  fact_autonomo_has_ir_p1 = ausente

Saída esperada:
  PolicyDecision(class="obrigação", rule_id="R_AUTONOMO_IR_COLETAR")
  → must_ask_now += ["fact_autonomo_has_ir_p1"]
```

#### Negativo (autônomo com IR — regra não dispara)

```
Entrada:
  fact_work_regime_p1 = { value: "autônomo", status: "confirmed" }
  fact_autonomo_has_ir_p1 = { value: "sim", status: "confirmed" }

Saída esperada:
  [] (regra satisfeita — nenhuma decisão)
```

#### Ambíguo (autônomo sem IR — orientar, não bloquear)

```
Entrada:
  fact_work_regime_p1 = { value: "autônomo", status: "confirmed" }
  fact_autonomo_has_ir_p1 = { value: "não", status: "confirmed" }

Saída esperada:
  PolicyDecision(class="sugestão_mandatória", rule_id="R_AUTONOMO_SEM_IR_RISCO")
  → risk_level = "medium"
  → LLM verifica alternativas; NÃO declara inelegibilidade
```

---

## 4. Regra R_SOLO_BAIXA_COMPOSICAO

### 4.1 Identificação

| Campo | Valor |
|-------|-------|
| `rule_id` | `R_SOLO_BAIXA_COMPOSICAO` |
| Objetivo | Identificar quando renda solo é insuficiente e orientar composição familiar como alternativa |
| Legados de referência | L09, L10 (composição familiar), L11, L12 (renda) |
| Microetapa do mestre | Microetapa 1 — "renda solo baixa → composição" |

### 4.2 Fatos de entrada

| Fato | Tipo | Grupo | Condição |
|------|------|-------|---------|
| `fact_process_mode` | `fact_*` | III | `"solo"` |
| `fact_monthly_income_p1` | `fact_*` | IV | valor numérico |
| `derived_composition_needed` | `derived_*` | XI | calculado pelo mecânico |
| `fact_dependente` | `fact_*` | VIII | contexto familiar |
| `fact_estado_civil` | `fact_*` | III | contexto (solo ≠ solteiro obrigatório) |

### 4.3 Limiar de referência

O limiar de renda "baixa" para processo solo no MCMV corresponde ao **piso mínimo de
elegibilidade da Faixa 1** do programa vigente. O valor exato é definido pela política
normativa MCMV em vigor (não hardcoded neste documento — ver memória normativa do sistema).

Para efeito desta regra declarativa:
- **`derived_composition_needed = true`** sinaliza que o mecânico calculou que a renda
  P1 solo está abaixo do limiar de viabilidade para qualquer faixa do programa.
- O policy engine consome `derived_composition_needed`, não o valor bruto diretamente.

### 4.4 Condição de disparo

```
DISPARA quando:
  fact_process_mode = "solo"
  AND (
    derived_composition_needed = true
    OR fact_monthly_income_p1 confirmado + valor abaixo do limiar de Faixa 1
  )

NÃO DISPARA quando:
  fact_process_mode != "solo"
  OR fact_monthly_income_p1 ausente / hypothesis (aguardar coleta)
  OR derived_composition_needed = false (renda viável solo)

PRIORIDADE DE ORIENTAÇÃO (não de bloqueio):
  Esta regra NUNCA emite bloqueio.
  Ela emite sugestão_mandatória + obrigação de explorar alternativa.
  O encerramento por inviabilidade exige análise completa e decisão humana / confirmação.
```

### 4.5 Fluxo de decisão

```
fact_process_mode = "solo"?
  ├── não → NÃO DISPARA
  └── sim
        └── fact_monthly_income_p1 coletado?
              ├── não / hypothesis → OBRIGAÇÃO (coletar renda primeiro)
              └── sim (captured / confirmed)
                    └── derived_composition_needed?
                          ├── false → NÃO DISPARA (renda viável solo)
                          └── true
                                └── fact_dependente / composição familiar disponível?
                                      ├── sim → SUGESTÃO MANDATÓRIA (orientar composição)
                                      └── não → SUGESTÃO MANDATÓRIA + OBRIGAÇÃO (verificar viabilidade)
```

### 4.6 Decisões emitidas

#### Decisão A — Obrigação de coletar renda (pré-condição)

```
PolicyDecision {
  class:    "obrigação"
  rule_id:  "R_SOLO_BAIXA_COMPOSICAO_COLETAR_RENDA"
  severity: "warning"
  target:   "fact_monthly_income_p1"
  reason:   "fact_process_mode = 'solo'; fact_monthly_income_p1 ausente. Coleta obrigatória para avaliar viabilidade de renda solo."
  action: ObrigacaoAction {
    type:           "obrigação"
    required_fact:  "fact_monthly_income_p1"
    reason_code:    "R_SOLO_BAIXA_COMPOSICAO_COLETAR_RENDA"
    priority:       1
    if_not_collected: "impossível avaliar viabilidade de renda solo ou necessidade de composição"
  }
}
```

#### Decisão B — Sugestão mandatória (renda solo insuficiente detectada)

```
PolicyDecision {
  class:    "sugestão_mandatória"
  rule_id:  "R_SOLO_BAIXA_COMPOSICAO"
  severity: "warning"
  target:   "fact_process_mode"
  reason:   "derived_composition_needed = true. fact_process_mode = 'solo'. Renda P1 solo está abaixo do limiar de viabilidade para MCMV. Composição familiar pode viabilizar elegibilidade."
  action: SugestaoMandatoriaAction {
    type:          "sugestão_mandatória"
    guidance_code: "SGM_SOLO_BAIXA_COMPOSICAO"
    context:       "Renda solo confirmada abaixo do limiar mínimo para qualquer faixa MCMV. Composição com familiar (pai, mãe, irmão, cônjuge) pode somar renda e viabilizar o processo."
    recommended_behavior: "explorar possibilidade de composição familiar; verificar fact_dependente e contexto familiar; coletar fact_composition_actor se composição for viável; não encerrar case sem verificar alternativa de composição"
    urgency:       "medium"
  }
}
```

#### Decisão C — Obrigação de explorar composição (quando composição viável detectada)

```
PolicyDecision {
  class:    "obrigação"
  rule_id:  "R_SOLO_BAIXA_EXPLORAR_COMPOSICAO"
  severity: "warning"
  target:   "fact_composition_actor"
  reason:   "derived_composition_needed = true; familiar disponível sinalizado. Verificação de composição obrigatória antes de encerramento."
  action: ObrigacaoAction {
    type:           "obrigação"
    required_fact:  "fact_composition_actor"
    reason_code:    "R_SOLO_BAIXA_EXPLORAR_COMPOSICAO"
    priority:       2
    if_not_collected: "avaliação de viabilidade incompleta; não encerrar case sem verificar composição"
  }
}
```

### 4.7 Efeito esperado no lead_state

| Campo | Estado antes | Estado depois |
|-------|-------------|---------------|
| `operational.must_ask_now` | qualquer | inclui `"fact_monthly_income_p1"` (Decisão A) ou `"fact_composition_actor"` (Decisão C) |
| `operational.recommended_next_actions` | qualquer | inclui `ACAO_ORIENTAR_COMPOSICAO` |
| `derived.derived_composition_needed` | ausente / false | `true` (calculado pelo mecânico) |
| `operational.last_policy_decision` | qualquer | `"R_SOLO_BAIXA_COMPOSICAO"` |
| `operational.elegibility_status` | qualquer | **não muda** — esta regra não declara inelegibilidade |

**Invariante desta regra:**
> `R_SOLO_BAIXA_COMPOSICAO` **nunca** emite `bloqueio`.
> Ela nunca seta `elegibility_status = "ineligible"`.
> Inviabilidade por renda solo é declarada apenas após composição explorada e descartada,
> com evidência explícita. Essa decisão é terminal e exige análise completa.

### 4.8 Exemplos

#### Positivo (renda baixa, orientar composição)

```
Entrada:
  fact_process_mode = { value: "solo", status: "confirmed" }
  fact_monthly_income_p1 = { value: 1400.00, status: "confirmed" }
  derived_composition_needed = true

Saída esperada:
  PolicyDecision(class="sugestão_mandatória", rule_id="R_SOLO_BAIXA_COMPOSICAO")
  PolicyDecision(class="obrigação", rule_id="R_SOLO_BAIXA_EXPLORAR_COMPOSICAO")
  → LLM explora composição; NÃO encerra case
```

#### Negativo (renda solo viável)

```
Entrada:
  fact_process_mode = { value: "solo", status: "confirmed" }
  fact_monthly_income_p1 = { value: 3200.00, status: "confirmed" }
  derived_composition_needed = false

Saída esperada:
  [] (regra não dispara — renda viável)
```

#### Ambíguo (renda coletada mas não confirmada)

```
Entrada:
  fact_process_mode = { value: "solo", status: "confirmed" }
  fact_monthly_income_p1 = { value: 1500.00, status: "captured",
                              source: "INDIRECT_TEXT" }

Saída esperada:
  PolicyDecision(class="confirmação", rule_id baseada em T2_POLITICA_CONFIANCA — R_CONFIRMAR_RENDA_INDIRECT_TEXT)
  → confirmar renda antes de ativar R_SOLO_BAIXA_COMPOSICAO
  → R_SOLO_BAIXA_COMPOSICAO não dispara com renda captured de baixa confiança
```

---

## 5. Regra R_ESTRANGEIRO_SEM_RNM

### 5.1 Identificação

| Campo | Valor |
|-------|-------|
| `rule_id` | `R_ESTRANGEIRO_SEM_RNM` |
| Objetivo | Bloquear avanço de lead estrangeiro sem RNM válido; o programa MCMV exige documentação de residência regular para estrangeiros |
| Legados de referência | L19 (Memorial MCMV — exigências por perfil) |
| Microetapa do mestre | Microetapa 1 — "estrangeiro sem RNM → não avançar" |

### 5.2 Fatos de entrada

| Fato | Tipo | Grupo | Condição |
|------|------|-------|---------|
| `fact_nationality` | `fact_*` | II | `"estrangeiro"` |
| `fact_rnm_status` | `fact_*` | II | `!= "válido"` |
| `derived_rnm_required` | `derived_*` | XI | calculado de `fact_nationality != "brasileiro"` |
| `derived_rnm_block` | `derived_*` | XI | calculado de `derived_rnm_required = true` + `fact_rnm_status != "válido"` |

### 5.3 Condição de disparo

```
DISPARA bloqueio quando:
  fact_nationality = "estrangeiro"
  AND (
    fact_rnm_status = "ausente"
    OR fact_rnm_status = "vencido"
    OR fact_rnm_status ausente (null / não coletado)
  )
  AND fact_nationality.status IN ["confirmed", "captured"]  (não hypothesis)
  AND fact_rnm_status.status IN ["confirmed", "captured"]   (não hypothesis)

NÃO DISPARA bloqueio quando:
  fact_nationality = "brasileiro"
  OR fact_nationality = "naturalizado"  (documentação diferente — não bloqueia por RNM)
  OR fact_rnm_status = "válido"
  OR fact_nationality.status = "hypothesis"
  OR fact_rnm_status.status = "hypothesis"

EXIGE CONFIRMAÇÃO ANTES DE BLOQUEIO quando:
  fact_nationality.status = "captured" (não confirmed)
  — confirmar nacionalidade antes de bloquear definitivamente
```

### 5.4 Fluxo de decisão

```
fact_nationality coletado?
  ├── não / hypothesis → OBRIGAÇÃO (coletar nationalidade)
  └── sim (captured / confirmed)
        └── fact_nationality = "estrangeiro"?
              ├── não → NÃO DISPARA
              └── sim
                    └── fact_nationality.status = "confirmed"?
                          ├── não (captured) → CONFIRMAÇÃO antes de bloqueio
                          └── sim (confirmed)
                                └── fact_rnm_status?
                                      ├── ausente → OBRIGAÇÃO (coletar RNM)
                                      ├── "válido" → NÃO DISPARA
                                      └── "ausente" / "vencido" → BLOQUEIO
```

### 5.5 Decisões emitidas

#### Decisão A — Confirmação de nacionalidade (capturada, não confirmada)

```
PolicyDecision {
  class:    "confirmação"
  rule_id:  "R_ESTRANGEIRO_SEM_RNM_CONFIRM_NAC"
  severity: "critical"
  target:   "fact_nationality"
  reason:   "fact_nationality = 'estrangeiro' em status captured. Confirmação obrigatória antes de bloqueio — consequência é bloqueio de elegibilidade documental."
  action: ConfirmacaoAction {
    type:               "confirmação"
    fact_to_confirm:    "fact_nationality"
    current_status:     "captured"
    current_value:      "estrangeiro"
    confirmation_level: "hard"
    if_not_confirmed:   "bloqueio por RNM suspenso; lead tratado como indefinido até confirmação"
  }
}
```

#### Decisão B — Obrigação de coletar RNM (estrangeiro confirmado, RNM ausente)

```
PolicyDecision {
  class:    "obrigação"
  rule_id:  "R_ESTRANGEIRO_COLETAR_RNM"
  severity: "critical"
  target:   "fact_rnm_status"
  reason:   "fact_nationality = 'estrangeiro' confirmado. fact_rnm_status ausente. Coleta obrigatória para avaliação de elegibilidade documental MCMV."
  action: ObrigacaoAction {
    type:           "obrigação"
    required_fact:  "fact_rnm_status"
    reason_code:    "R_ESTRANGEIRO_COLETAR_RNM"
    priority:       1
    if_not_collected: "impossível avaliar elegibilidade documental de estrangeiro sem RNM"
  }
}
```

#### Decisão C — Bloqueio (estrangeiro confirmado, RNM inválido/ausente)

```
PolicyDecision {
  class:    "bloqueio"
  rule_id:  "R_ESTRANGEIRO_SEM_RNM"
  severity: "blocking"
  target:   "fact_rnm_status"
  reason:   "fact_nationality = 'estrangeiro' confirmado. fact_rnm_status = 'ausente'/'vencido'. Programa MCMV exige RNM válido para estrangeiros. Avanço de stage bloqueado."
  action: BloqueioAction {
    type:             "bloqueio"
    blocked_fact:     "fact_rnm_status"
    blocked_phase:    "qualification"
    resolution_required: "fact_rnm_status deve ser atualizado para 'válido' — lead precisa apresentar RNM vigente"
    severity:         "blocking"
    advance_allowed:  false
  }
}
```

### 5.6 Efeito esperado no lead_state

| Campo | Estado antes | Estado depois |
|-------|-------------|---------------|
| `operational.blocked_by` | vazio / outros | inclui `{ reason: "R_ESTRANGEIRO_SEM_RNM", resolution: "fact_rnm_status = 'válido'" }` |
| `operational.risk_level` | qualquer | `"blocking"` |
| `derived.derived_rnm_block` | false / ausente | `true` |
| `derived.derived_rnm_required` | false / ausente | `true` |
| `operational.last_policy_decision` | qualquer | `"R_ESTRANGEIRO_SEM_RNM"` |
| `operational.elegibility_status` | qualquer | pode ser `"ineligible"` se `fact_rnm_status = "ausente"` sem perspectiva de resolução — mas **apenas após confirmação explícita**, não por inferência |

### 5.7 Condição de desbloqueio

O bloqueio é resolvido quando:
- `fact_rnm_status = "válido"` com status `confirmed` e documentação recebida.
- Lead apresenta RNM válido ao longo do processo → `fact_doc_identity_status` atualizado.

Caso lead declare não ter RNM e não ter perspectiva de obter:
- Isso exige reconciliação explícita via protocolo `T2_RECONCILIACAO.md`.
- A declaração de inelegibilidade documental é terminal e requer confirmação do lead,
  não apenas inferência do mecânico.

### 5.8 Exemplos

#### Positivo (bloqueio correto)

```
Entrada:
  fact_nationality = { value: "estrangeiro", status: "confirmed" }
  fact_rnm_status = { value: "ausente", status: "confirmed" }

Saída esperada:
  PolicyDecision(class="bloqueio", rule_id="R_ESTRANGEIRO_SEM_RNM")
  → operational.blocked_by += R_ESTRANGEIRO_SEM_RNM
  → operational.risk_level = "blocking"
  → derived_rnm_block = true
```

#### Negativo (estrangeiro com RNM válido)

```
Entrada:
  fact_nationality = { value: "estrangeiro", status: "confirmed" }
  fact_rnm_status = { value: "válido", status: "confirmed" }

Saída esperada:
  [] (RNM válido — bloqueio não dispara)
```

#### Ambíguo (naturalizado — regra não se aplica)

```
Entrada:
  fact_nationality = { value: "naturalizado", status: "confirmed" }

Saída esperada:
  [] (naturalizado não é "estrangeiro" para esta regra;
      documentação diferente — exige análise própria, não bloqueio por RNM)
```

---

## 6. Tabela de validação cruzada — regra × fato × classe × efeito

| Rule ID | Fatos de entrada | Classe(s) emitida(s) | Efeito principal no lead_state | Bloqueio? |
|---------|-----------------|----------------------|-------------------------------|-----------|
| `R_CASADO_CIVIL_CONJUNTO` | `fact_estado_civil`, `fact_process_mode` | obrigação (+ confirmação prévia) | `must_ask_now += [fact_process_mode]` | não |
| `R_AUTONOMO_IR_COLETAR` | `fact_work_regime_p1` (autônomo), `fact_autonomo_has_ir_p1` ausente | obrigação | `must_ask_now += [fact_autonomo_has_ir_p1]` | não |
| `R_AUTONOMO_IR_CONFIRMAR` | `fact_autonomo_has_ir_p1` (não_informado/parcial) | confirmação | `needs_confirmation = true` | não |
| `R_AUTONOMO_SEM_IR_RISCO` | `fact_autonomo_has_ir_p1 = "não"` | sugestão_mandatória | `risk_level → medium` | **não** |
| `R_SOLO_BAIXA_COMPOSICAO_COLETAR_RENDA` | `fact_process_mode = "solo"`, `fact_monthly_income_p1` ausente | obrigação | `must_ask_now += [fact_monthly_income_p1]` | não |
| `R_SOLO_BAIXA_COMPOSICAO` | `derived_composition_needed = true` | sugestão_mandatória | `last_policy_decision` | **não** |
| `R_SOLO_BAIXA_EXPLORAR_COMPOSICAO` | composição viável sinalizada | obrigação | `must_ask_now += [fact_composition_actor]` | não |
| `R_ESTRANGEIRO_SEM_RNM_CONFIRM_NAC` | `fact_nationality = "estrangeiro"` captured | confirmação | `needs_confirmation = true` | não |
| `R_ESTRANGEIRO_COLETAR_RNM` | `fact_nationality = "estrangeiro"` confirmed, RNM ausente | obrigação | `must_ask_now += [fact_rnm_status]` | não |
| `R_ESTRANGEIRO_SEM_RNM` | `fact_nationality = "estrangeiro"` confirmed, `fact_rnm_status != "válido"` | **bloqueio** | `blocked_by` + `risk_level = "blocking"` | **SIM** |

---

## 7. Validação de chaves contra T2

Todas as `fact_key` e `derived_*` usadas neste documento existem nos seguintes artefatos:

| Chave | Artefato de origem | Grupo |
|-------|-------------------|-------|
| `fact_nationality` | T2_DICIONARIO_FATOS §3.2 | II |
| `fact_rnm_status` | T2_DICIONARIO_FATOS §3.2 | II |
| `fact_document_identity_type` | T2_DICIONARIO_FATOS §3.2 | II |
| `fact_estado_civil` | T2_DICIONARIO_FATOS §3.3 | III |
| `fact_process_mode` | T2_DICIONARIO_FATOS §3.3 | III |
| `fact_composition_actor` | T2_DICIONARIO_FATOS §3.3 | III |
| `fact_work_regime_p1` | T2_DICIONARIO_FATOS §3.4 | IV |
| `fact_monthly_income_p1` | T2_DICIONARIO_FATOS §3.4 | IV |
| `fact_autonomo_has_ir_p1` | T2_DICIONARIO_FATOS §3.4 | IV |
| `fact_dependente` | T2_DICIONARIO_FATOS §3.8 | VIII |
| `fact_doc_income_status` | T2_DICIONARIO_FATOS §3.9 | IX |
| `derived_rnm_required` | T2_DICIONARIO_FATOS §3.11 | XI |
| `derived_rnm_block` | T2_DICIONARIO_FATOS §3.11 | XI |
| `derived_composition_needed` | T2_DICIONARIO_FATOS §3.11 | XI |

**Classes usadas:** `bloqueio`, `obrigação`, `confirmação`, `sugestão_mandatória` — todas
definidas em `T3_CLASSES_POLITICA.md` §2–§5.

---

## 8. Anti-padrões proibidos

| Código | Anti-padrão | Por que é proibido |
|--------|-------------|-------------------|
| AP-RC-01 | `R_SOLO_BAIXA_COMPOSICAO` emite `bloqueio` | Renda solo baixa é orientação para composição, não bloqueio terminal — violaria CA-01 orientação |
| AP-RC-02 | `R_AUTONOMO_SEM_IR_RISCO` declara `elegibility_status = "ineligible"` | Autônomo sem IR não é inelegível automático — existem alternativas documentais |
| AP-RC-03 | `R_ESTRANGEIRO_SEM_RNM` dispara com `fact_nationality.status = "hypothesis"` | Hipótese não é evidência de negócio (CP-09 de T3_CLASSES_POLITICA) |
| AP-RC-04 | `R_CASADO_CIVIL_CONJUNTO` emite obrigação sem confirmar estado civil capturado com baixa confiança | Confirmação precede obrigação quando confiança é baixa (PC-INT-02) |
| AP-RC-05 | Qualquer `PolicyDecision.action` contém `reply_text`, `mensagem_usuario` ou texto ao cliente | Violação CP-01 e A00-ADENDO-01 |
| AP-RC-06 | `R_ESTRANGEIRO_SEM_RNM` dispara para `fact_nationality = "naturalizado"` | Naturalizado não é estrangeiro para fins desta regra — documentação diferente |
| AP-RC-07 | `R_AUTONOMO_IR_COLETAR` não dispara quando `fact_work_regime_p1 = "múltiplo"` com componente autônomo | Regime múltiplo com componente autônomo deve verificar IR para a parcela autônoma — a regra se aplica |
| AP-RC-08 | Regra emite simultaneamente `bloqueio` e `roteamento` para o mesmo `target_phase` | Contradição lógica (AP-CP-05 de T3_CLASSES_POLITICA) |
| AP-RC-09 | `R_CASADO_CIVIL_CONJUNTO` emite bloqueio em vez de obrigação | Casado civil → conjunto é obrigação de mudar modo, não bloqueio de avanço |
| AP-RC-10 | Bloqueio `R_ESTRANGEIRO_SEM_RNM` declara inelegibilidade sem reconciliação explícita | Inviabilidade terminal exige reconciliação via T2_RECONCILIACAO |

---

## 9. Regras invioláveis

| Código | Regra |
|--------|-------|
| RC-INV-01 | Nenhum payload das regras críticas contém `reply_text` ou equivalente — **invariante absoluta** |
| RC-INV-02 | Fato em `hypothesis` nunca dispara regra crítica — pré-captura não é evidência |
| RC-INV-03 | `R_AUTONOMO_SEM_IR_RISCO` nunca declara inelegibilidade — autônomo sem IR exige exploração de alternativas |
| RC-INV-04 | `R_SOLO_BAIXA_COMPOSICAO` nunca emite `bloqueio` — sempre orienta composição primeiro |
| RC-INV-05 | `R_ESTRANGEIRO_SEM_RNM` só dispara `bloqueio` quando `fact_nationality.status = "confirmed"` |
| RC-INV-06 | Todo conflito gerado por uma regra crítica segue o protocolo `T2_RECONCILIACAO.md` |
| RC-INV-07 | Toda regra crítica referencia apenas chaves canônicas de `T2_DICIONARIO_FATOS §3` |
| RC-INV-08 | Toda classe emitida existe em `T3_CLASSES_POLITICA.md` com payload conforme definido |
| RC-INV-09 | `derived_*` são calculados pelo mecânico — regras críticas os consomem, não os definem |
| RC-INV-10 | `elegibility_status = "ineligible"` exige reconciliação explícita e confirmação — nunca por inferência isolada de regra crítica |

---

## 10. Cobertura das microetapas do mestre T3

| Microetapa do mestre | Cobertura neste artefato |
|----------------------|--------------------------|
| **Microetapa 1** — Transformar regras mais sensíveis | **COBERTA — §2, §3, §4, §5 deste documento** |
| **Microetapa 2** — Definir os 4 efeitos operacionais | NÃO coberta aqui — coberta em T3_CLASSES_POLITICA (PR-T3.1) |
| **Microetapa 3** — Ordem estável de avaliação | NÃO coberta aqui — escopo PR-T3.3 |
| **Microetapa 4** — Política de composição | NÃO coberta aqui — escopo PR-T3.3 |
| **Microetapa 5** — Política de veto suave | NÃO coberta aqui — escopo PR-T3.4 |

---

## Bloco E — PR-T3.2

| Campo | Valor |
|-------|-------|
| PR | PR-T3.2 — Codificação declarativa das regras críticas |
| Data | 2026-04-25 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` (este documento) |
| Status | CONCLUÍDA |
| Evidência | 4 regras críticas declaradas com rule_id, objetivo, fatos de entrada, condição de disparo, fluxo de decisão, payloads declarativos, efeito no lead_state, exemplos positivo/negativo/ambíguo por regra; tabela de validação cruzada (§6); validação de chaves contra T2 (§7); 10 anti-padrões AP-RC-01..10; 10 regras invioláveis RC-INV-01..10; cobertura de microetapas (§10) |
| Prova P-T3-01 | Grep de `reply_text`, `mensagem_usuario`, `texto_cliente` em payloads de `action` — ausência confirmada em todos os BloqueioAction, ObrigacaoAction, ConfirmacaoAction, SugestaoMandatoriaAction |
| Prova P-T3-02 | Todas as fact_keys e derived_keys referenciadas verificadas contra T2_DICIONARIO_FATOS §3 e §3.11 — ver tabela §7 (14 chaves verificadas) |
| Prova P-T3-03 | Microetapa 1 do mestre T3 coberta em §2–§5; §10 declara cobertura explícita por microetapa |
| Conformidade CA-01 | Confirmada — nenhum payload de `action` produz `reply_text` |
| Conformidade CA-02 | Confirmada — 4 regras declaradas: R_CASADO_CIVIL_CONJUNTO, R_AUTONOMO_IR, R_SOLO_BAIXA_COMPOSICAO, R_ESTRANGEIRO_SEM_RNM |
| Conformidade CA-07 | Confirmada — todas as chaves em §7 existem em T2_DICIONARIO_FATOS e T2_LEAD_STATE_V1 |
| Conformidade CA-08 | Confirmada — engine emite PolicyDecision estruturado; LLM soberano na fala |
| Conformidade CA-09 | Confirmada — microetapa 1 coberta; 2 (T3.1), 3/4 (T3.3), 5 (T3.4) delegadas |
| Conformidade A00-ADENDO-01 | Confirmada — soberania do LLM na fala preservada |
| Conformidade A00-ADENDO-02 | Confirmada — identidade MCMV; regras refletem política MCMV sem engessar fala |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente; evidências explícitas por critério |
| Próxima PR autorizada | **PR-T3.3 — Ordem de avaliação e composição de políticas** |
