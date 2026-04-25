# T3_SUITE_TESTES_REGRAS — Suíte de Testes Declarativos de Regras Críticas — ENOVA 2

## Finalidade

Este documento define a **suíte documental de testes declarativos** para o policy engine v1 da
ENOVA 2, cobrindo as 4 regras críticas de T3, a ordem/composição de T3.3 e o validador de T3.4.

Os casos aqui são **testes declarativos** — definem o comportamento esperado em forma de contrato
verificável. Eles não implementam código, não executam motor real e não produzem `reply_text`.
Cada caso é uma asserção: dado este `lead_state`, o engine deve emitir exatamente este output.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — 5 classes canônicas.
- `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` (PR-T3.2) — 4 regras críticas.
- `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (PR-T3.3) — pipeline e composição.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (PR-T3.4) — veto suave e validador.
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shapes e OperationalState.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens e níveis.
- `schema/implantation/T2_RECONCILIACAO.md` (PR-T2.4) — 7 status canônicos de fato.

**Microetapa do mestre coberta:**

> **Todas as 5 microetapas T3** — esta suíte valida cruzadamente as 5 microetapas:
> micro 1 (T3.2), micro 2 (T3.1), micro 3 (T3.3 ordem), micro 4 (T3.3 composição), micro 5 (T3.4).

**Princípios canônicos obrigatórios (A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03):**

> 1. Nenhum caso de teste pode esperar `reply_text`, `mensagem_usuario`, `texto_cliente` ou
>    qualquer texto destinado ao cliente como output do engine.
> 2. Teste não inventa regra nova — prova exclusivamente regras já documentadas nos artefatos T3.
> 3. Toda chave de fato usada deve existir em `T2_DICIONARIO_FATOS §3`.

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T3 (todas microetapas).
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` — §7 CA-06/CA-10, §16 PR-T3.5.
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01).
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02).
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03).

---

## 1. Estrutura geral da suíte

### 1.1 Categorias cobertas

| Categoria | Código | Contagem | Descrição |
|-----------|--------|----------|-----------|
| Positivo | TC-POS | 4 | Regra dispara corretamente com condições plenas |
| Negativo | TC-NEG | 4 | Regra não dispara quando condições não são atendidas |
| Ambíguo | TC-AMB | 4 | Dado incerto → confirmação obrigatória, nunca decisão final |
| Colisão | TC-COL | 4 | Múltiplas regras disparam → colisão registrada em `collisions[]` |
| Regressão | TC-REG | 4 | Invariante crítico não quebrado em nenhum cenário |
| Ordem/Composição | TC-ORD | 2 | Pipeline T3.3 executado em ordem canônica |
| Validador | TC-VAL | 2 | Checklist T3.4 VC-01..VC-09 aplicado corretamente |
| **TOTAL** | | **24** | Mínimo contratual: 20 (CA-06) |

### 1.2 Regras críticas cobertas

| Regra | TC-POS | TC-NEG | TC-AMB | TC-COL | TC-REG |
|-------|--------|--------|--------|--------|--------|
| R_CASADO_CIVIL_CONJUNTO | TC-POS-01 | TC-NEG-01 | TC-AMB-01 | TC-COL-01, TC-COL-03 | TC-REG-04 |
| R_AUTONOMO_IR | TC-POS-02 | TC-NEG-02 | TC-AMB-02 | TC-COL-02 | TC-REG-01, TC-REG-04 |
| R_SOLO_BAIXA_COMPOSICAO | TC-POS-03 | TC-NEG-03 | TC-AMB-03 | TC-COL-02 | TC-REG-02, TC-REG-04 |
| R_ESTRANGEIRO_SEM_RNM | TC-POS-04 | TC-NEG-04 | TC-AMB-04 | TC-COL-01, TC-COL-04 | TC-REG-03, TC-REG-04 |

### 1.3 Formato padrão de caso

Cada caso especifica:

```
test_id:              — código único (TC-<CATEGORIA>-<NN>)
regra_alvo:           — regra crítica sendo testada (ou componente T3.3/T3.4)
objetivo:             — o que o caso prova
lead_state_entrada:   — campos relevantes do lead_state (snapshot simplificado)
facts_relevantes:     — fact_keys que disparam a regra + seus status e origens
policy_esperada:      — PolicyDecision[] esperado (class, rule_id, severity, action resumida)
soft_veto_esperado:   — VetoSuaveRecord esperado (se houver), ou "nenhum"
validacao_esperada:   — resultado do checklist VC-01..VC-09 (apenas itens relevantes)
resultado_esperado:   — ValidationResult.decision esperado
criterios_aceite:     — lista de asserções PASS/FAIL verificáveis
```

---

## 2. Tabela geral de cobertura

| test_id | categoria | regra | output esperado | invariante verificado |
|---------|-----------|-------|-----------------|----------------------|
| TC-POS-01 | positivo | R_CASADO_CIVIL_CONJUNTO | obrigação conjunto | nenhum bloqueio; fact confirmed |
| TC-POS-02 | positivo | R_AUTONOMO_IR | obrigação coletar IR | nunca inelegível automático |
| TC-POS-03 | positivo | R_SOLO_BAIXA_COMPOSICAO | sugestão composição | nunca bloqueio |
| TC-POS-04 | positivo | R_ESTRANGEIRO_SEM_RNM | bloqueio hard | só com nationality confirmed |
| TC-NEG-01 | negativo | R_CASADO_CIVIL_CONJUNTO | sem decisão / zero policies | mode já conjunto |
| TC-NEG-02 | negativo | R_AUTONOMO_IR | sem decisão para IR | regime não autônomo |
| TC-NEG-03 | negativo | R_SOLO_BAIXA_COMPOSICAO | sem sugestão composição | renda acima do limiar |
| TC-NEG-04 | negativo | R_ESTRANGEIRO_SEM_RNM | sem bloqueio | nacionalidade brasileira |
| TC-AMB-01 | ambíguo | R_CASADO_CIVIL_CONJUNTO | confirmação (não obrigação) | fato em captured/audio |
| TC-AMB-02 | ambíguo | R_AUTONOMO_IR | confirmação (não inelegível) | IR não_informado |
| TC-AMB-03 | ambíguo | R_SOLO_BAIXA_COMPOSICAO | sugestão + confirmação | renda limítrofe |
| TC-AMB-04 | ambíguo | R_ESTRANGEIRO_SEM_RNM | confirmação (não bloqueio) | nationality captured |
| TC-COL-01 | colisão | R_CASADO_CIVIL + R_ESTRANGEIRO | bloqueio + obrigação → COL-BLOCK-OBLIG | colisão em collisions[] |
| TC-COL-02 | colisão | R_AUTONOMO_IR + R_SOLO_BAIXA | obrigação + sugestão coexistem | sem colisão silenciosa |
| TC-COL-03 | colisão | R_CASADO_CIVIL + R_ESTRANGEIRO | 2 confirmações → COL-CONF-CONF-LEVEL | colisão registrada |
| TC-COL-04 | colisão | R_ESTRANGEIRO + roteamento | bloqueio + roteamento → COL-BLOCK-ROUTE | bloqueio vence |
| TC-REG-01 | regressão | R_AUTONOMO_IR | sugestão_mandatória; elegibility intacto | RC-INV-03: sem inelegível auto |
| TC-REG-02 | regressão | R_SOLO_BAIXA_COMPOSICAO | sugestão; zero bloqueio | RC-INV-04: nunca bloqueio |
| TC-REG-03 | regressão | R_ESTRANGEIRO_SEM_RNM | confirmação; zero bloqueio | RC-INV-05: bloqueio só com confirmed |
| TC-REG-04 | regressão | todas as 4 regras | zero reply_text em qualquer payload | RC-INV-01: soberania LLM |
| TC-ORD-01 | ordem | pipeline T3.3 | bloqueio avaliado antes de confirmação | RC-INV estágio 2 antes estágio 3 |
| TC-ORD-02 | composição | pipeline T3.3 | confirmação antes de obrigação no PolicyDecisionSet | ordem canônica 1→5 |
| TC-VAL-01 | validador | VC-09 T3.4 | REQUIRE_REVISION — template rígido | RC-VS-11; policy não cancelada |
| TC-VAL-02 | validador | VC-03 T3.4 | PREVENT_PERSISTENCE — fase não avança com bloqueio | RC-VS-07 inviolável |

---

## 3. Casos de teste — Positivos (TC-POS)

### TC-POS-01 — Casado civil em modo solo: obrigação de conjunto

```
test_id:           TC-POS-01
regra_alvo:        R_CASADO_CIVIL_CONJUNTO
objetivo:          Verificar que lead casado_civil com mode=solo recebe obrigação de migrar para conjunto
                   e NÃO recebe bloqueio.

lead_state_entrada:
  operational:
    current_phase: "qualification"
    blocked_by: []
    elegibility_status: "unknown"
  facts:
    fact_estado_civil:
      value: "casado_civil"
      status: "confirmed"
      origin: "DIRECT_TEXT"
    fact_process_mode:
      value: "solo"
      status: "captured"
      origin: "DIRECT_TEXT"

facts_relevantes:
  - fact_estado_civil = "casado_civil" / status: confirmed
  - fact_process_mode = "solo" / status: captured

policy_esperada:
  decisions:
    - class: "obrigação"
      rule_id: "R_CASADO_CIVIL_CONJUNTO"
      severity: "warning"
      action:
        type: "obrigação"
        required_fact: "fact_process_mode"
        reason_code: "R_CASADO_CIVIL_CONJUNTO"
        priority: 1
        if_not_collected: "processo permanece solo; análise de composição incompleta"
  # NÃO deve conter: bloqueio de nenhuma espécie

soft_veto_esperado: nenhum

validacao_esperada:
  VC-01: PASS — nenhum campo reply_text no delta proposto
  VC-03: PASS — blocked_by vazio; fase não avança com bloqueio
  VC-05: PASS — nenhuma transição de status imprópria

resultado_esperado: APPROVE

criterios_aceite:
  PASS-01: decisions[] contém exatamente 1 PolicyDecision com class="obrigação"
  PASS-02: decisions[] NÃO contém nenhum item com class="bloqueio"
  PASS-03: operational.blocked_by permanece vazio após execução
  PASS-04: operational.elegibility_status NÃO muda para "ineligible"
  PASS-05: action.type = "obrigação"; required_fact = "fact_process_mode"
  PASS-06: nenhum campo reply_text/mensagem_usuario em nenhum payload
  FAIL se: bloqueio emitido, elegibility = ineligible, reply_text presente
```

---

### TC-POS-02 — Autônomo sem IR declarado: obrigação de coleta

```
test_id:           TC-POS-02
regra_alvo:        R_AUTONOMO_IR
objetivo:          Verificar que autônomo com IR ausente recebe obrigação de coletar IR
                   e NÃO é marcado como inelegível automático.

lead_state_entrada:
  operational:
    current_phase: "qualification"
    blocked_by: []
    elegibility_status: "unknown"
  facts:
    fact_work_regime_p1:
      value: "autonomo"
      status: "confirmed"
      origin: "DIRECT_TEXT"
    fact_autonomo_has_ir_p1:
      value: null
      status: "hypothesis"    ← ausente/não coletado

facts_relevantes:
  - fact_work_regime_p1 = "autonomo" / status: confirmed
  - fact_autonomo_has_ir_p1 ausente (status: hypothesis)

policy_esperada:
  decisions:
    - class: "obrigação"
      rule_id: "R_AUTONOMO_IR_COLETAR"
      severity: "warning"
      action:
        type: "obrigação"
        required_fact: "fact_autonomo_has_ir_p1"
        reason_code: "R_AUTONOMO_IR_COLETAR"
        priority: 2
        if_not_collected: "avaliação de risco fiscal incompleta; bloqueio possível em elegibility"

soft_veto_esperado:
  - veto_id: "VS-R_AUTONOMO_IR-<turn>"
    trigger_fact: "fact_autonomo_has_ir_p1"
    risk_type: "dado_insuficiente"
    severity: "warning"
    resolution: "confirmar"

validacao_esperada:
  VC-01: PASS
  VC-03: PASS
  VC-06: advisory — veto warning; LLM deve acknowledger

resultado_esperado: APPROVE (ou REQUIRE_REVISION se VC-06 fail por veto não acknowledged)

criterios_aceite:
  PASS-01: decisions[] contém class="obrigação"; required_fact="fact_autonomo_has_ir_p1"
  PASS-02: operational.elegibility_status NÃO muda para "ineligible"
  PASS-03: operational.blocked_by permanece vazio
  PASS-04: nenhum payload contém reply_text
  PASS-05: soft_vetos[] contém VetoSuaveRecord com risk_type="dado_insuficiente"
  FAIL se: elegibility_status = "ineligible", bloqueio emitido, reply_text presente
```

---

### TC-POS-03 — Solo com renda abaixo do limiar: sugestão de composição

```
test_id:           TC-POS-03
regra_alvo:        R_SOLO_BAIXA_COMPOSICAO
objetivo:          Verificar que solo com renda insuficiente recebe sugestão de composição
                   e NÃO recebe bloqueio nem inelegibilidade.

lead_state_entrada:
  operational:
    current_phase: "qualification"
    blocked_by: []
    elegibility_status: "unknown"
  facts:
    fact_process_mode:
      value: "solo"
      status: "confirmed"
      origin: "DIRECT_TEXT"
    fact_monthly_income_p1:
      value: 1750.00     ← abaixo do limiar mínimo MCMV solo
      status: "confirmed"
      origin: "DOCUMENT_VERIFIED"
  derived:
    derived_composition_needed: true

facts_relevantes:
  - fact_process_mode = "solo" / status: confirmed
  - fact_monthly_income_p1 = 1750.00 / status: confirmed
  - derived_composition_needed = true

policy_esperada:
  decisions:
    - class: "sugestão_mandatória"
      rule_id: "R_SOLO_BAIXA_COMPOSICAO"
      severity: "warning"
      action:
        type: "sugestão_mandatória"
        guidance_code: "SGM_SOLO_BAIXA_COMPOSICAO"
        recommended_behavior: "orientar sobre composição de renda; explorar fact_composition_actor"
        urgency: "medium"

soft_veto_esperado:
  - veto_id: "VS-R_RENDA_LIMITE-<turn>"
    trigger_fact: "fact_monthly_income_p1"
    risk_type: "risco_de_limite"
    severity: "info"
    resolution: "orientar"

validacao_esperada:
  VC-01: PASS
  VC-02: PASS — sem promessa de aprovação
  VC-03: PASS — blocked_by vazio

resultado_esperado: APPROVE

criterios_aceite:
  PASS-01: decisions[] contém class="sugestão_mandatória"
  PASS-02: decisions[] NÃO contém class="bloqueio"
  PASS-03: operational.blocked_by permanece vazio
  PASS-04: operational.elegibility_status NÃO muda para "ineligible"
  PASS-05: soft_vetos[] contém VetoSuaveRecord com risk_type="risco_de_limite", severity="info"
  PASS-06: nenhum payload contém reply_text
  FAIL se: bloqueio emitido, elegibility = ineligible, severity do veto = "warning" em vez de "info"
```

---

### TC-POS-04 — Estrangeiro sem RNM com nationality confirmada: bloqueio hard

```
test_id:           TC-POS-04
regra_alvo:        R_ESTRANGEIRO_SEM_RNM
objetivo:          Verificar que estrangeiro confirmado sem RNM válido recebe bloqueio formal.

lead_state_entrada:
  operational:
    current_phase: "qualification"
    blocked_by: []
    elegibility_status: "unknown"
    risk_level: "medium"
  facts:
    fact_nationality:
      value: "estrangeiro"
      status: "confirmed"       ← OBRIGATÓRIO para disparar bloqueio
      origin: "DOCUMENT_VERIFIED"
    fact_rnm_status:
      value: "ausente"
      status: "confirmed"
      origin: "DOCUMENT_VERIFIED"
  derived:
    derived_rnm_required: true
    derived_rnm_block: true

facts_relevantes:
  - fact_nationality = "estrangeiro" / status: confirmed
  - fact_rnm_status = "ausente" / status: confirmed
  - derived_rnm_required = true

policy_esperada:
  decisions:
    - class: "bloqueio"
      rule_id: "R_ESTRANGEIRO_SEM_RNM"
      severity: "blocking"
      action:
        type: "bloqueio"
        blocked_fact: "fact_rnm_status"
        blocked_phase: "qualification"
        resolution_required: "fact_rnm_status deve ser 'valido'"
        severity: "blocking"
        advance_allowed: false

soft_veto_esperado: nenhum
  # Bloqueio emitido — não há veto suave quando bloqueio formal é disparado

validacao_esperada:
  VC-01: PASS
  VC-03: PASS — blocked_by agora populado; fase não avança
  VC-04: PASS — sem colisão não registrada

resultado_esperado: APPROVE (estado com bloqueio persistido)

criterios_aceite:
  PASS-01: decisions[] contém class="bloqueio"; rule_id="R_ESTRANGEIRO_SEM_RNM"
  PASS-02: advance_allowed = false — invariante absoluta
  PASS-03: operational.blocked_by populado com { reason: "R_ESTRANGEIRO_SEM_RNM" }
  PASS-04: operational.risk_level = "blocking"
  PASS-05: nenhum payload contém reply_text
  FAIL se: advance_allowed = true, blocked_by vazio, reply_text presente,
           bloqueio emitido sem nationality.status = "confirmed"
```

---

## 4. Casos de teste — Negativos (TC-NEG)

### TC-NEG-01 — Casado civil com mode já conjunto: sem obrigação

```
test_id:           TC-NEG-01
regra_alvo:        R_CASADO_CIVIL_CONJUNTO
objetivo:          Verificar que rule NÃO dispara quando lead casado_civil já tem mode=conjunto.

lead_state_entrada:
  facts:
    fact_estado_civil:
      value: "casado_civil"
      status: "confirmed"
    fact_process_mode:
      value: "conjunto"
      status: "confirmed"    ← condição já satisfeita

policy_esperada:
  decisions: []    ← zero decisões da R_CASADO_CIVIL_CONJUNTO

soft_veto_esperado: nenhum

resultado_esperado: APPROVE (delta vazio ou sem mudança relevante)

criterios_aceite:
  PASS-01: decisions[] NÃO contém class="obrigação" com rule_id="R_CASADO_CIVIL_CONJUNTO"
  PASS-02: decisions[] NÃO contém nenhum bloqueio originado desta regra
  FAIL se: obrigação para conjunto emitida apesar de mode já = "conjunto"
```

---

### TC-NEG-02 — Lead empregado: sem verificação de IR

```
test_id:           TC-NEG-02
regra_alvo:        R_AUTONOMO_IR
objetivo:          Verificar que regra de IR NÃO dispara para lead com regime empregado.

lead_state_entrada:
  facts:
    fact_work_regime_p1:
      value: "empregado"
      status: "confirmed"
      origin: "DOCUMENT_VERIFIED"

policy_esperada:
  decisions: []    ← sem decisão de IR

soft_veto_esperado: nenhum

resultado_esperado: APPROVE

criterios_aceite:
  PASS-01: decisions[] NÃO contém rule_id contendo "R_AUTONOMO_IR"
  PASS-02: nenhuma obrigação para fact_autonomo_has_ir_p1
  FAIL se: obrigação de IR emitida para lead empregado
```

---

### TC-NEG-03 — Solo com renda suficiente: sem sugestão de composição

```
test_id:           TC-NEG-03
regra_alvo:        R_SOLO_BAIXA_COMPOSICAO
objetivo:          Verificar que regra NÃO dispara quando renda solo é suficiente.

lead_state_entrada:
  facts:
    fact_process_mode:
      value: "solo"
      status: "confirmed"
    fact_monthly_income_p1:
      value: 4200.00     ← acima do limiar máximo MCMV; renda suficiente
      status: "confirmed"
      origin: "DOCUMENT_VERIFIED"
  derived:
    derived_composition_needed: false

policy_esperada:
  decisions: []    ← sem sugestão de composição

soft_veto_esperado: nenhum

resultado_esperado: APPROVE

criterios_aceite:
  PASS-01: decisions[] NÃO contém rule_id contendo "R_SOLO_BAIXA"
  PASS-02: operational.blocked_by permanece vazio
  PASS-03: soft_vetos[] NÃO contém VetoSuaveRecord para composição
  FAIL se: sugestão de composição emitida com renda acima do limiar
```

---

### TC-NEG-04 — Lead brasileiro: sem bloqueio de RNM

```
test_id:           TC-NEG-04
regra_alvo:        R_ESTRANGEIRO_SEM_RNM
objetivo:          Verificar que bloqueio de RNM NÃO é emitido para lead brasileiro.

lead_state_entrada:
  facts:
    fact_nationality:
      value: "brasileiro"
      status: "confirmed"
      origin: "DOCUMENT_VERIFIED"

policy_esperada:
  decisions: []    ← sem bloqueio de RNM

soft_veto_esperado: nenhum

resultado_esperado: APPROVE

criterios_aceite:
  PASS-01: decisions[] NÃO contém class="bloqueio" com rule_id="R_ESTRANGEIRO_SEM_RNM"
  PASS-02: operational.blocked_by permanece vazio
  PASS-03: derived_rnm_required = false (calculado pelo mecânico)
  FAIL se: bloqueio de RNM emitido para lead com nationality = "brasileiro"
```

---

## 5. Casos de teste — Ambíguos (TC-AMB)

### TC-AMB-01 — Casado civil via áudio ruim: confirmação (não obrigação direta)

```
test_id:           TC-AMB-01
regra_alvo:        R_CASADO_CIVIL_CONJUNTO
objetivo:          Verificar que fato em captured via AUDIO_TRANSCRIPT gera confirmação,
                   NÃO obrigação direta de conjunto.

lead_state_entrada:
  facts:
    fact_estado_civil:
      value: "casado_civil"
      status: "captured"          ← NÃO confirmado
      origin: "AUDIO_TRANSCRIPT"  ← origem de confiança baixa
    fact_process_mode:
      value: "solo"
      status: "captured"

facts_relevantes:
  - fact_estado_civil = "casado_civil" / status: captured / origin: AUDIO_TRANSCRIPT

policy_esperada:
  decisions:
    - class: "confirmação"
      rule_id: "R_CASADO_CIVIL_CONJUNTO_CONFIRM"
      severity: "warning"
      action:
        type: "confirmação"
        fact_to_confirm: "fact_estado_civil"
        current_status: "captured"
        current_value: "casado_civil"
        confirmation_level: "hard"
        if_not_confirmed: "fato permanece captured; obrigação de conjunto suspensa"
  # NÃO deve conter: obrigação de conjunto (exige estado civil confirmado)

soft_veto_esperado:
  - risk_type: "dado_insuficiente"
    trigger_fact: "fact_estado_civil"
    severity: "warning"
    resolution: "confirmar"

validacao_esperada:
  VC-05: PASS — nenhuma transição captured→confirmed automática
  VC-06: advisory — veto deve ser acknowledged
  VC-07: PASS — fato não transita para confirmed sem coleta explícita

resultado_esperado: REQUIRE_REVISION (se veto não acknowledged) ou APPROVE (se acknowledged)

criterios_aceite:
  PASS-01: decisions[] contém class="confirmação"; fact_to_confirm="fact_estado_civil"
  PASS-02: decisions[] NÃO contém class="obrigação" para conjunto com fact em captured
  PASS-03: confirmation_level = "hard"
  PASS-04: nenhuma transição de fact_estado_civil para "confirmed" sem coleta explícita
  FAIL se: obrigação de conjunto emitida com estado civil em captured, fact transitou para
           confirmed sem coleta, reply_text presente
```

---

### TC-AMB-02 — Autônomo com IR "não_informado": confirmação (não inelegível)

```
test_id:           TC-AMB-02
regra_alvo:        R_AUTONOMO_IR
objetivo:          Verificar que IR em estado "não_informado" gera confirmação/clarificação
                   e NÃO inelegibilidade automática.

lead_state_entrada:
  facts:
    fact_work_regime_p1:
      value: "autonomo"
      status: "confirmed"
    fact_autonomo_has_ir_p1:
      value: "nao_informado"   ← ambíguo: lead disse "não sei" / "nunca fiz"
      status: "captured"
      origin: "INDIRECT_TEXT"

policy_esperada:
  decisions:
    - class: "confirmação"
      rule_id: "R_AUTONOMO_IR_CONFIRM"
      action:
        type: "confirmação"
        fact_to_confirm: "fact_autonomo_has_ir_p1"
        current_status: "captured"
        current_value: "nao_informado"
        confirmation_level: "hard"
        if_not_confirmed: "dado permanece captured; orientação de risco suspensa"
  # NÃO deve conter: elegibility_status = "ineligible"

soft_veto_esperado:
  - risk_type: "dado_insuficiente"
    severity: "warning"
    resolution: "confirmar"

resultado_esperado: REQUIRE_REVISION (veto não acknowledged) ou APPROVE

criterios_aceite:
  PASS-01: decisions[] contém class="confirmação"; fact_to_confirm="fact_autonomo_has_ir_p1"
  PASS-02: operational.elegibility_status NÃO muda para "ineligible"
  PASS-03: nenhum payload declara inelegibilidade
  PASS-04: nenhum reply_text no delta
  FAIL se: elegibility_status = "ineligible", sugestão_mandatória emitida declarando inelegível,
           reply_text presente
```

---

### TC-AMB-03 — Solo com renda limítrofe: sugestão + veto orientador

```
test_id:           TC-AMB-03
regra_alvo:        R_SOLO_BAIXA_COMPOSICAO
objetivo:          Verificar que renda limítrofe (±15% do limiar) gera sugestão de composição
                   + veto suave orientador de risco, sem bloqueio.

lead_state_entrada:
  facts:
    fact_process_mode:
      value: "solo"
      status: "confirmed"
    fact_monthly_income_p1:
      value: 2.280.00    ← 15% abaixo do limiar mínimo solo (exemplo: 2.680)
      status: "confirmed"
      origin: "AUDIO_TRANSCRIPT"   ← origem de confiança média
  derived:
    derived_composition_needed: true

policy_esperada:
  decisions:
    - class: "sugestão_mandatória"
      rule_id: "R_SOLO_BAIXA_COMPOSICAO"
      action:
        type: "sugestão_mandatória"
        guidance_code: "SGM_SOLO_BAIXA_COMPOSICAO"
        urgency: "medium"

soft_veto_esperado:
  - risk_type: "risco_de_limite"
    trigger_fact: "fact_monthly_income_p1"
    severity: "info"
    resolution: "orientar"

resultado_esperado: APPROVE

criterios_aceite:
  PASS-01: decisions[] contém class="sugestão_mandatória"
  PASS-02: decisions[] NÃO contém class="bloqueio"
  PASS-03: soft_vetos[] contém VetoSuaveRecord com risk_type="risco_de_limite"
  PASS-04: veto severity = "info" (não "warning" — renda limítrofe não é risco crítico)
  PASS-05: operational.elegibility_status inalterado
  FAIL se: bloqueio emitido, elegibility = ineligible, severity do veto = "warning"
```

---

### TC-AMB-04 — Estrangeiro com nationality em captured: confirmação, NÃO bloqueio

```
test_id:           TC-AMB-04
regra_alvo:        R_ESTRANGEIRO_SEM_RNM
objetivo:          Verificar que estrangeiro com nationality ainda em captured NÃO recebe bloqueio
                   — apenas confirmação de nationality.

lead_state_entrada:
  facts:
    fact_nationality:
      value: "estrangeiro"
      status: "captured"        ← NÃO confirmado — condição de disparo NÃO atendida
      origin: "INDIRECT_TEXT"
    fact_rnm_status:
      value: "ausente"
      status: "captured"

policy_esperada:
  decisions:
    - class: "confirmação"
      rule_id: "R_ESTRANGEIRO_SEM_RNM_CONFIRM_NAC"
      severity: "critical"
      action:
        type: "confirmação"
        fact_to_confirm: "fact_nationality"
        current_status: "captured"
        current_value: "estrangeiro"
        confirmation_level: "hard"
        if_not_confirmed: "bloqueio não pode ser emitido; fato permanece captured"
  # NÃO deve conter: class="bloqueio" — nationality não está confirmed

soft_veto_esperado:
  - risk_type: "dado_insuficiente"
    trigger_fact: "fact_nationality"
    severity: "warning"
    resolution: "escalate_to_bloqueio"
    escalation_condition: "fact_nationality.status = confirmed AND fact_rnm_status = ausente"

validacao_esperada:
  VC-05: PASS — nenhuma transição captured→confirmed automática
  VC-07: PASS — fact_nationality não transita sem coleta

resultado_esperado: REQUIRE_REVISION (veto warning não acknowledged) ou APPROVE

criterios_aceite:
  PASS-01: decisions[] contém class="confirmação"; fact_to_confirm="fact_nationality"
  PASS-02: decisions[] NÃO contém class="bloqueio" — invariante RC-INV-05
  PASS-03: operational.blocked_by permanece vazio
  PASS-04: soft_vetos[] contém veto com resolution="escalate_to_bloqueio" e
           escalation_condition preenchida
  PASS-05: nenhum payload contém reply_text
  FAIL se: bloqueio emitido com nationality em captured, blocked_by populado prematuramente,
           escalation_condition ausente no veto de escalada
```

---

## 6. Casos de teste — Colisões (TC-COL)

### TC-COL-01 — Casado civil + estrangeiro sem RNM: bloqueio + obrigação → COL-BLOCK-OBLIG

```
test_id:           TC-COL-01
regras_alvo:       R_CASADO_CIVIL_CONJUNTO + R_ESTRANGEIRO_SEM_RNM
objetivo:          Verificar que colisão entre bloqueio e obrigação é registrada em collisions[]
                   e NOT silenciosa. Bloqueio permanece; obrigação em standby.

lead_state_entrada:
  facts:
    fact_estado_civil:
      value: "casado_civil"
      status: "confirmed"
    fact_process_mode:
      value: "solo"
      status: "captured"
    fact_nationality:
      value: "estrangeiro"
      status: "confirmed"
    fact_rnm_status:
      value: "ausente"
      status: "confirmed"

policy_esperada:
  decisions:
    - class: "bloqueio"
      rule_id: "R_ESTRANGEIRO_SEM_RNM"
      severity: "blocking"
    - class: "obrigação"
      rule_id: "R_CASADO_CIVIL_CONJUNTO"
      severity: "warning"
  collisions:
    - code: "COL-BLOCK-OBLIG"
      blocking_rule: "R_ESTRANGEIRO_SEM_RNM"
      competing_rule: "R_CASADO_CIVIL_CONJUNTO"
      resolution: "bloqueio_prevalece"
      obrigacao_status: "standby_pending_resolution"
  # collisions[] NÃO pode estar vazio

soft_veto_esperado: nenhum

validacao_esperada:
  VC-04: PASS — COL-BLOCK-OBLIG registrada em collisions[]
  VC-03: PASS — blocked_by populado; fase não avança

resultado_esperado: APPROVE (estado com bloqueio e colisão registrada)

criterios_aceite:
  PASS-01: decisions[] contém bloqueio + obrigação
  PASS-02: collisions[] contém entrada com code="COL-BLOCK-OBLIG"
  PASS-03: CollisionRecord declara resolution="bloqueio_prevalece"
  PASS-04: operational.blocked_by populado com R_ESTRANGEIRO_SEM_RNM
  PASS-05: colisão NÃO é silenciosa
  FAIL se: collisions[] vazio, obrigação ignorada sem registro de colisão, reply_text presente
```

---

### TC-COL-02 — Autônomo sem IR + solo baixa renda: obrigação + sugestão coexistem

```
test_id:           TC-COL-02
regras_alvo:       R_AUTONOMO_IR + R_SOLO_BAIXA_COMPOSICAO
objetivo:          Verificar que obrigação e sugestão_mandatória coexistem corretamente
                   sem colisão destrutiva (fatos distintos, sem conflito de classe).

lead_state_entrada:
  facts:
    fact_work_regime_p1:
      value: "autonomo"
      status: "confirmed"
    fact_autonomo_has_ir_p1:
      value: null
      status: "hypothesis"
    fact_process_mode:
      value: "solo"
      status: "confirmed"
    fact_monthly_income_p1:
      value: 1850.00
      status: "confirmed"
  derived:
    derived_composition_needed: true

policy_esperada:
  decisions:
    - class: "obrigação"
      rule_id: "R_AUTONOMO_IR_COLETAR"
      action.required_fact: "fact_autonomo_has_ir_p1"
    - class: "sugestão_mandatória"
      rule_id: "R_SOLO_BAIXA_COMPOSICAO"
  collisions: []    ← sem colisão: fatos distintos, classes compatíveis
  # obrigação aparece antes de sugestão_mandatória na ordem canônica

soft_veto_esperado:
  - risk_type: "dado_insuficiente" (R_AUTONOMO_IR)
  - risk_type: "risco_de_limite"   (R_SOLO_BAIXA)

validacao_esperada:
  VC-04: PASS — collisions[] corretamente vazio (sem colisão detectável)

resultado_esperado: APPROVE (ou REQUIRE_REVISION por veto não acknowledged)

criterios_aceite:
  PASS-01: decisions[] contém obrigação + sugestão_mandatória nesta ordem
  PASS-02: collisions[] NÃO contém entrada (coexistência válida)
  PASS-03: ordem canônica respeitada: obrigação (3) antes de sugestão_mandatória (4)
  PASS-04: soft_vetos[] contém 2 VetoSuaveRecord
  FAIL se: colisão registrada onde não há conflito real, ordem invertida (sugestão antes de obrigação)
```

---

### TC-COL-03 — Duas confirmações simultâneas: COL-CONF-CONF-LEVEL

```
test_id:           TC-COL-03
regras_alvo:       R_CASADO_CIVIL_CONJUNTO + R_ESTRANGEIRO_SEM_RNM (ambos em captured)
objetivo:          Verificar que duas confirmações simultâneas para fatos distintos
                   geram COL-CONF-CONF-LEVEL em collisions[].

lead_state_entrada:
  facts:
    fact_estado_civil:
      value: "casado_civil"
      status: "captured"
      origin: "INDIRECT_TEXT"
    fact_nationality:
      value: "estrangeiro"
      status: "captured"
      origin: "AUDIO_TRANSCRIPT"

policy_esperada:
  decisions:
    - class: "confirmação"
      rule_id: "R_CASADO_CIVIL_CONJUNTO_CONFIRM"
      action.confirmation_level: "hard"
    - class: "confirmação"
      rule_id: "R_ESTRANGEIRO_SEM_RNM_CONFIRM_NAC"
      action.confirmation_level: "hard"
  collisions:
    - code: "COL-CONF-CONF-LEVEL"
      rules: ["R_CASADO_CIVIL_CONJUNTO_CONFIRM", "R_ESTRANGEIRO_SEM_RNM_CONFIRM_NAC"]
      resolution: "ambas_emitidas_em_ordem"

resultado_esperado: APPROVE (ou REQUIRE_REVISION por vetos não acknowledged)

criterios_aceite:
  PASS-01: decisions[] contém 2 confirmações
  PASS-02: collisions[] contém COL-CONF-CONF-LEVEL
  PASS-03: ambas as confirmações emitidas (não suprimida nenhuma)
  PASS-04: resolução = "ambas_emitidas_em_ordem"
  FAIL se: uma confirmação suprimida sem registro, collisions[] vazio
```

---

### TC-COL-04 — Estrangeiro sem RNM + roteamento de fase: COL-BLOCK-ROUTE

```
test_id:           TC-COL-04
regras_alvo:       R_ESTRANGEIRO_SEM_RNM + roteamento de avanço de fase
objetivo:          Verificar que bloqueio vence roteamento: colisão COL-BLOCK-ROUTE registrada,
                   roteamento suprimido, bloqueio prevalece.

lead_state_entrada:
  facts:
    fact_nationality:
      value: "estrangeiro"
      status: "confirmed"
    fact_rnm_status:
      value: "ausente"
      status: "confirmed"
  operational:
    current_phase: "qualification"
    # engine também avaliaria roteamento para "elegibility" mas bloqueio prevalece

policy_esperada:
  decisions:
    - class: "bloqueio"
      rule_id: "R_ESTRANGEIRO_SEM_RNM"
      severity: "blocking"
    - class: "roteamento"
      rule_id: "<regra_de_avanco>"
      # roteamento emitido mas suprimido pela composição
  collisions:
    - code: "COL-BLOCK-ROUTE"
      blocking_rule: "R_ESTRANGEIRO_SEM_RNM"
      suppressed_rule: "<regra_de_avanco>"
      resolution: "bloqueio_prevalece_roteamento_suprimido"

validacao_esperada:
  VC-03: PASS — fase não avança (blocked_by populado)
  VC-04: PASS — COL-BLOCK-ROUTE em collisions[]

resultado_esperado: APPROVE (bloqueio persistido; roteamento descartado)

criterios_aceite:
  PASS-01: collisions[] contém code="COL-BLOCK-ROUTE"
  PASS-02: roteamento NÃO persiste avanço de fase
  PASS-03: blocked_by populado; current_phase inalterado
  PASS-04: colisão NÃO é silenciosa
  FAIL se: fase avança apesar de bloqueio, collisions[] vazio, roteamento aplicado sem resolução
```

---

## 7. Casos de teste — Regressões (TC-REG)

### TC-REG-01 — Autônomo sem IR: elegibility_status nunca vira ineligible automaticamente

```
test_id:           TC-REG-01
regra_alvo:        R_AUTONOMO_IR (invariante RC-INV-03)
objetivo:          Garantir que em NENHUMA variante de R_AUTONOMO_IR o engine
                   seta elegibility_status = "ineligible" automaticamente.

lead_state_entrada:
  # Pior caso: autônomo + IR explicitamente "nao"
  facts:
    fact_work_regime_p1:
      value: "autonomo"
      status: "confirmed"
    fact_autonomo_has_ir_p1:
      value: "nao"
      status: "confirmed"    ← pior caso possível

policy_esperada:
  decisions:
    - class: "sugestão_mandatória"
      rule_id: "R_AUTONOMO_SEM_IR_RISCO"
      action:
        guidance_code: "SGM_AUTONOMO_SEM_IR"
        # sem declaração de inelegibilidade
  # operational.elegibility_status NUNCA = "ineligible" por esta regra

criterios_aceite:
  PASS-01: operational.elegibility_status NÃO muda para "ineligible"
  PASS-02: decisions[] NÃO contém bloqueio relacionado a IR
  PASS-03: sugestão_mandatória emitida (orientação, não veto)
  PASS-04: nenhum payload declara inelegibilidade direta ou indiretamente
  FAIL se: qualquer output desta regra seta elegibility_status = "ineligible" — RC-INV-03 quebrado
```

---

### TC-REG-02 — Solo baixa renda: nunca emite bloqueio (RC-INV-04)

```
test_id:           TC-REG-02
regra_alvo:        R_SOLO_BAIXA_COMPOSICAO (invariante RC-INV-04)
objetivo:          Garantir que R_SOLO_BAIXA_COMPOSICAO NUNCA emite bloqueio em nenhum cenário.

lead_state_entrada:
  # Caso extremo: renda zero, sem composição, sem IR — pior configuração possível
  facts:
    fact_process_mode:
      value: "solo"
      status: "confirmed"
    fact_monthly_income_p1:
      value: 0.00         ← renda zero — pior caso
      status: "confirmed"
    fact_composition_actor:
      value: null
      status: "hypothesis"
  derived:
    derived_composition_needed: true

policy_esperada:
  decisions:
    # Máximo: sugestão_mandatória + obrigação de coletar renda/composição
    # NUNCA: bloqueio de nenhum tipo

criterios_aceite:
  PASS-01: decisions[] NÃO contém class="bloqueio" com origem em R_SOLO_BAIXA_COMPOSICAO
  PASS-02: operational.blocked_by NÃO é populado por esta regra
  PASS-03: operational.elegibility_status NÃO muda para "ineligible" por esta regra
  FAIL se: qualquer variant desta regra emite bloqueio — RC-INV-04 quebrado (invariante absoluto)
```

---

### TC-REG-03 — Estrangeiro sem nationality confirmed: bloqueio NÃO emitido (RC-INV-05)

```
test_id:           TC-REG-03
regra_alvo:        R_ESTRANGEIRO_SEM_RNM (invariante RC-INV-05)
objetivo:          Garantir que bloqueio de RNM NUNCA é emitido enquanto
                   fact_nationality.status != "confirmed".

lead_state_entrada:
  # Testar todos os status menores que confirmed
  facts:
    fact_nationality:
      value: "estrangeiro"
      status: "inferred"    ← não confirmado — bloqueio proibido
    fact_rnm_status:
      value: "ausente"
      status: "captured"

policy_esperada:
  decisions:
    - class: "confirmação"    ← confirmação é o máximo quando nationality != confirmed
      rule_id: "R_ESTRANGEIRO_SEM_RNM_CONFIRM_NAC"
  # NÃO deve conter: class="bloqueio"

criterios_aceite:
  PASS-01: decisions[] NÃO contém class="bloqueio" quando nationality.status != "confirmed"
  PASS-02: mesmo com fact_rnm_status="ausente", bloqueio só é emitido após nationality confirmada
  PASS-03: veto suave com resolution="escalate_to_bloqueio" pode estar presente (correto)
  FAIL se: bloqueio emitido com nationality em status hypothesis/captured/inferred — RC-INV-05 quebrado
```

---

### TC-REG-04 — Cross-rule: nenhum payload contém reply_text (RC-INV-01)

```
test_id:           TC-REG-04
regras_alvo:       todas as 4 regras críticas
objetivo:          Garantir que NENHUMA decisão emitida por nenhuma regra contém
                   campos reply_text, mensagem_usuario, texto_cliente, resposta ou frase.

lead_state_entrada:
  # Ativar todas as 4 regras simultaneamente — cenário de estresse máximo
  facts:
    fact_estado_civil:       { value: "casado_civil", status: "confirmed" }
    fact_process_mode:       { value: "solo", status: "captured" }
    fact_work_regime_p1:     { value: "autonomo", status: "confirmed" }
    fact_autonomo_has_ir_p1: { value: null, status: "hypothesis" }
    fact_monthly_income_p1:  { value: 1600.00, status: "confirmed" }
    fact_nationality:        { value: "estrangeiro", status: "confirmed" }
    fact_rnm_status:         { value: "ausente", status: "confirmed" }
    fact_composition_actor:  { value: null, status: "hypothesis" }
  derived:
    derived_composition_needed: true

policy_esperada:
  # qualquer conjunto de decisions[] e soft_vetos[] — o que importa é a ausência de reply_text

criterios_aceite:
  PASS-01: NENHUM campo em decisions[*].action contém reply_text
  PASS-02: NENHUM campo em soft_vetos[*] contém reply_text
  PASS-03: NENHUM campo em collisions[*] contém reply_text
  PASS-04: NENHUM campo em evaluation_meta contém reply_text
  PASS-05: idem para mensagem_usuario, texto_cliente, resposta, frase
  FAIL se: qualquer campo de qualquer output do engine contém texto destinado ao cliente
           — RC-INV-01 quebrado; violação de CA-01 e A00-ADENDO-01
```

---

## 8. Casos de teste — Ordem/Composição T3.3 (TC-ORD)

### TC-ORD-01 — Pipeline executado em ordem: bloqueio avaliado antes de confirmação

```
test_id:           TC-ORD-01
componente:        T3_ORDEM_AVALIACAO_COMPOSICAO — pipeline de 6 estágios
objetivo:          Verificar que o engine avalia bloqueios (Estágio 2) ANTES de confirmações
                   (Estágio 3) — nunca pula estágio nem inverte.

lead_state_entrada:
  facts:
    fact_nationality:
      value: "estrangeiro"
      status: "confirmed"
    fact_rnm_status:
      value: "ausente"
      status: "confirmed"
    fact_estado_civil:
      value: "casado_civil"
      status: "captured"   ← geraria confirmação no Estágio 3

pipeline_esperado:
  Estágio 1: reconciliação prévia — sem conflito; lead_state consistente
  Estágio 2: bloqueio R_ESTRANGEIRO_SEM_RNM EMITIDO
  Estágio 3: confirmação de fact_estado_civil avaliada (mas subordinada ao bloqueio)
  Estágio 4: obrigações — nenhuma nova (bloqueio ativo)
  Estágio 5: sugestões — nenhuma (bloqueio impede)
  Estágio 6: roteamentos — suprimidos (COL-BLOCK-ROUTE se roteamento tentado)

criterios_aceite:
  PASS-01: evaluation_meta registra os 6 estágios na ordem 1→2→3→4→5→6
  PASS-02: decisions[] lista bloqueio ANTES de confirmação (ordem canônica)
  PASS-03: nenhum estágio pulado sem RC-INV-01 registrado
  PASS-04: blocked_by populado antes de qualquer avaliação de roteamento
  FAIL se: confirmação precede bloqueio na saída; estágio pulado; ordem invertida
```

---

### TC-ORD-02 — Composição: confirmação precede obrigação para o mesmo fato

```
test_id:           TC-ORD-02
componente:        T3_ORDEM_AVALIACAO_COMPOSICAO — §3.3 e §4.4
objetivo:          Verificar que quando confirmação e obrigação coexistem para o mesmo fato,
                   confirmação aparece primeiro no PolicyDecisionSet e obrigação fica em standby.

lead_state_entrada:
  facts:
    fact_process_mode:
      value: "solo"
      status: "captured"   ← confirmação AND obrigação poderiam disparar
    fact_estado_civil:
      value: "casado_civil"
      status: "confirmed"

policy_esperada:
  decisions:
    - class: "confirmação"    ← aparece ANTES na saída
      rule_id: "R_CASADO_CIVIL_CONJUNTO_CONFIRM"
      target: "fact_process_mode"
    - class: "obrigação"      ← em standby até confirmação resolvida
      rule_id: "R_CASADO_CIVIL_CONJUNTO"
      target: "fact_process_mode"
  collisions:
    - code: "COL-CONF-OBLIG"
      resolution: "confirmacao_precede_obrigacao_standby"

criterios_aceite:
  PASS-01: na ordem canônica, confirmação (posição 2) precede obrigação (posição 3)
  PASS-02: collisions[] contém COL-CONF-OBLIG com resolução correta
  PASS-03: obrigação está em standby — não executada até confirmação
  PASS-04: PolicyDecisionSet.decisions ordenado: [confirmação, obrigação]
  FAIL se: obrigação precede confirmação no mesmo fato, colisão silenciosa
```

---

## 9. Casos de teste — Validador T3.4 (TC-VAL)

### TC-VAL-01 — VC-09: template mecânico com policy correta → REQUIRE_REVISION

```
test_id:           TC-VAL-01
componente:        T3_VETO_SUAVE_VALIDADOR — VC-09
objetivo:          Verificar que template mecânico detectado gera REQUIRE_REVISION
                   sem cancelar decisions[] corretas e sem acessar reply_text.

validation_context:
  proposed_state_delta:
    facts:
      fact_autonomo_has_ir_p1: { status: "captured", value: "nao_informado" }
    operational:
      must_ask_now: ["fact_autonomo_has_ir_p1"]
  llm_response_meta:
    contains_approval_promise: false
    contains_ineligibility_claim: false
    contains_mechanical_template: true    ← mecânico detectou template rígido
    vetos_acknowledged: ["VS-R_AUTONOMO_IR-<turn>"]
  policy_decision_set:
    decisions: [obrigação R_AUTONOMO_IR_COLETAR]
    collisions: []
    soft_vetos: [VetoSuaveRecord para dado_insuficiente]

checklist_esperado:
  VC-01: PASS — sem reply_text no delta
  VC-02: PASS — sem promessa de aprovação
  VC-03: PASS — sem bloqueio ativo; fase não avança
  VC-04: PASS — collisions[] corretamente vazio
  VC-05: PASS — nenhuma transição de status imprópria
  VC-06: PASS — veto acknowledged
  VC-07: PASS — nenhuma transição captured→confirmed
  VC-08: PASS — objetivo coerente
  VC-09: FAIL — contains_mechanical_template = true (advisory)

validation_result_esperado:
  decision: "REQUIRE_REVISION"
  blocking_items: []
  advisory_items: ["VC-09"]
  safe_fields: ["facts.fact_autonomo_has_ir_p1", "operational.must_ask_now"]
  blocked_fields: []    ← nenhum campo bloqueado; apenas revisão sinalizada

criterios_aceite:
  PASS-01: ValidationResult.decision = "REQUIRE_REVISION"
  PASS-02: advisory_items contém "VC-09"
  PASS-03: blocking_items está vazio (VC-09 é advisory, não critical)
  PASS-04: safe_fields contém os campos do delta (policy não cancelada)
  PASS-05: decisions[] da policy_decision_set NÃO são alterados pelo validador
  PASS-06: reply_text NÃO é acessado pelo validador em nenhum momento
  FAIL se: decision = "REJECT" (VC-09 não é critical), decisions[] canceladas,
           reply_text acessado ou modificado pelo validador
```

---

### TC-VAL-02 — VC-03: fase não avança com bloqueio ativo → PREVENT_PERSISTENCE

```
test_id:           TC-VAL-02
componente:        T3_VETO_SUAVE_VALIDADOR — VC-03
objetivo:          Verificar que tentativa de avançar current_phase com blocked_by ≠ vazio
                   gera PREVENT_PERSISTENCE do campo current_phase.

validation_context:
  prior_lead_state:
    operational:
      current_phase: "qualification"
      blocked_by: [{ reason: "R_ESTRANGEIRO_SEM_RNM", resolution: "fact_rnm_status = valido" }]
  proposed_state_delta:
    operational:
      current_phase: "elegibility"    ← tentativa de avanço com bloqueio ativo
  llm_response_meta:
    contains_approval_promise: false
    contains_mechanical_template: false

checklist_esperado:
  VC-01: PASS
  VC-02: PASS
  VC-03: FAIL — blocked_by ≠ vazio; current_phase tentando avançar (critical)
  VC-04..VC-09: PASS (assumindo delta limpo)

validation_result_esperado:
  decision: "PREVENT_PERSISTENCE"
  blocking_items: ["VC-03"]
  blocked_fields: ["operational.current_phase"]
  safe_fields: []    ← ou outros campos que não avançam a fase

criterios_aceite:
  PASS-01: ValidationResult.decision = "PREVENT_PERSISTENCE"
  PASS-02: blocking_items contém "VC-03"
  PASS-03: blocked_fields contém "operational.current_phase"
  PASS-04: operational.current_phase permanece "qualification" após validação
  PASS-05: validation_log registra VC-03 FAIL com detalhe do bloqueio
  FAIL se: current_phase avança apesar de blocked_by ≠ vazio — RC-VS-07 quebrado;
           decision = "APPROVE" neste cenário
```

---

## 10. Critérios PASS/FAIL globais

### 10.1 Critérios de PASS universal (aplicáveis a todos os casos)

| Critério | Regra de negócio | Invariante |
|----------|-----------------|------------|
| P-GLOBAL-01 | Nenhum payload contém `reply_text`, `mensagem_usuario` ou equivalente | RC-INV-01 / CA-01 |
| P-GLOBAL-02 | Toda `fact_key` referenciada existe em `T2_DICIONARIO_FATOS §3` | RC-INV-07 |
| P-GLOBAL-03 | Toda classe emitida pertence às 5 canônicas (`bloqueio`, `obrigação`, `confirmação`, `sugestão_mandatória`, `roteamento`) | RC-INV-08 |
| P-GLOBAL-04 | Fato em `hypothesis` nunca dispara regra crítica | RC-INV-02 |
| P-GLOBAL-05 | `derived_*` são consumidos pelas regras; nunca definidos por elas | RC-INV-09 |
| P-GLOBAL-06 | `elegibility_status = "ineligible"` exige reconciliação explícita + confirmação | RC-INV-10 |
| P-GLOBAL-07 | `advance_allowed = false` em todo `BloqueioAction` | T3.1 §2.3 invariante |
| P-GLOBAL-08 | Toda colisão aparece em `collisions[]`; zero colisões silenciosas | RC-INV-03 (T3.3) |
| P-GLOBAL-09 | Veto suave nunca atualiza `blocked_by` | RC-VS-01 |
| P-GLOBAL-10 | Validador nunca emite `PolicyDecision` | RC-VS-04 |
| P-GLOBAL-11 | Toda decisão do validador registrada em `validation_log` | RC-VS-05 |

### 10.2 Critérios de FAIL imediato (qualquer um torna o caso FAILED)

| Falha crítica | Regra violada |
|--------------|---------------|
| reply_text em qualquer payload | RC-INV-01 / CA-01 / A00-ADENDO-01 |
| Bloqueio emitido por R_SOLO_BAIXA_COMPOSICAO | RC-INV-04 (invariante absoluto) |
| elegibility = "ineligible" por R_AUTONOMO_IR sem reconciliação | RC-INV-03 |
| Bloqueio R_ESTRANGEIRO com nationality != confirmed | RC-INV-05 |
| Colisão silenciosa (collisions[] vazio quando deveria ter entrada) | RC-INV-03 (T3.3) |
| Fase avança com blocked_by ≠ vazio | RC-VS-07 / VC-03 |
| Fato hypothesis dispara regra | RC-INV-02 |
| fact_key não canônica referenciada | RC-INV-07 |
| Classe fora das 5 canônicas emitida | RC-INV-08 |

---

## 11. Validação cruzada T3.1 / T3.2 / T3.3 / T3.4 / T2

| Artefato | Campo/conceito | Casos que verificam |
|---|---|---|
| T3.1 §2 — classe bloqueio | `advance_allowed = false`; `blocked_by` atualizado | TC-POS-04, TC-COL-01, TC-COL-04, TC-VAL-02 |
| T3.1 §3 — classe obrigação | `must_ask_now` atualizado; `blocked_by` não | TC-POS-01, TC-POS-02, TC-COL-01, TC-COL-02 |
| T3.1 §4 — classe confirmação | `needs_confirmation = true`; fato não persiste como confirmed | TC-AMB-01..04, TC-COL-03, TC-ORD-02 |
| T3.1 §5 — sugestão_mandatória | sem ação específica obrigatória; não cancela outras | TC-POS-03, TC-AMB-03, TC-COL-02, TC-REG-01 |
| T3.1 §2.5 — bloqueio ≠ veto suave | bloqueio em decisions[]; veto em soft_vetos[] | TC-AMB-04, TC-COL-01 |
| T3.2 R_CASADO_CIVIL | nunca bloqueio; obrigação + confirmação | TC-POS-01, TC-NEG-01, TC-AMB-01, TC-COL-01 |
| T3.2 R_AUTONOMO_IR | nunca inelegível auto; variantes obr/conf/sugestão | TC-POS-02, TC-NEG-02, TC-AMB-02, TC-REG-01 |
| T3.2 R_SOLO_BAIXA | nunca bloqueio; nunca ineligible | TC-POS-03, TC-NEG-03, TC-AMB-03, TC-REG-02 |
| T3.2 R_ESTRANGEIRO | bloqueio só com confirmed | TC-POS-04, TC-NEG-04, TC-AMB-04, TC-REG-03 |
| T3.3 §1 pipeline 6 estágios | ordem 1→2→3→4→5→6 | TC-ORD-01 |
| T3.3 §3.3 + §4.4 — confirmação > obrigação | mesmo fato: confirmação precede obrigação | TC-ORD-02 |
| T3.3 §5 — 10 códigos de colisão | COL-BLOCK-OBLIG, COL-BLOCK-ROUTE, COL-CONF-CONF-LEVEL, COL-CONF-OBLIG | TC-COL-01..04 |
| T3.3 RC-INV-03 — sem colisão silenciosa | collisions[] populado | TC-COL-01..04, TC-REG-04 |
| T3.4 VC-01..VC-09 checklist | 9 itens; ações corretas por severity | TC-VAL-01, TC-VAL-02 |
| T3.4 RC-VS-07 — fase não avança com bloqueio | PREVENT_PERSISTENCE campo current_phase | TC-VAL-02 |
| T3.4 RC-VS-11 — template mecânico | REQUIRE_REVISION; policy preservada | TC-VAL-01 |
| T2.1 — fact_keys canônicas | toda chave existe em dicionário | TC-REG-04 (cross-rule) |
| T2.3 — política de confiança | AUDIO_TRANSCRIPT < DIRECT_TEXT < DOCUMENT_VERIFIED | TC-AMB-01, TC-AMB-04 |
| T2.4 — 7 status canônicos | hypothesis/captured/inferred/confirmed/contradicted/pending/obsolete | TC-AMB-01..04, TC-REG-03 |

---

## 12. Anti-padrões de teste (AP-ST)

**AP-ST-01 — Caso espera reply_text**
Nenhum caso de teste pode ter `resultado_esperado` incluindo texto ao cliente. Se um caso espera
`reply_text` no output, o caso está errado — não a regra.

**AP-ST-02 — Caso inventa chave de fato**
Todos os `facts_relevantes` devem usar chaves existentes em `T2_DICIONARIO_FATOS §3`.
Chave inventada invalida o caso.

**AP-ST-03 — Caso declara inelegibilidade automática por R_AUTONOMO_IR**
Qualquer caso que espere `elegibility_status = "ineligible"` como resultado de R_AUTONOMO_IR
sem fato `confirmed` e reconciliação explícita é um caso inválido.

**AP-ST-04 — Caso espera bloqueio por R_SOLO_BAIXA_COMPOSICAO**
Nenhum caso pode esperar `bloqueio` originado por R_SOLO_BAIXA_COMPOSICAO. Se o caso foi
escrito assim, está errado — invariante RC-INV-04 é absoluto.

**AP-ST-05 — Caso espera bloqueio R_ESTRANGEIRO sem nationality confirmed**
Caso que espera `bloqueio` com `fact_nationality.status != "confirmed"` é inválido —
RC-INV-05.

**AP-ST-06 — Caso não declara `criterios_aceite`**
Todo caso deve ter pelo menos 4 asserções verificáveis com "FAIL se:".
Casos sem critérios formais não são testes — são narrativas.

**AP-ST-07 — Caso testa implementação (não comportamento declarativo)**
Esta suíte é declarativa. Casos não devem referenciar funções, chamadas de API, linhas de
código ou runtime. Testam shapes e invariantes — não execução técnica.

**AP-ST-08 — Caso cria regra nova via lead_state artificial**
`lead_state_entrada` não pode conter combinação de fatos que nunca ocorreria no fluxo real
para "forçar" um output que nenhuma regra documentada produziria.

---

## 13. Cobertura de microetapas

| Microetapa do mestre T3 | Artefato | Casos da suíte |
|---|---|---|
| Microetapa 1 — 4 regras críticas | T3_REGRAS_CRITICAS_DECLARATIVAS.md | TC-POS-01..04, TC-NEG-01..04, TC-AMB-01..04, TC-COL-01..04, TC-REG-01..04 |
| Microetapa 2 — 5 classes canônicas | T3_CLASSES_POLITICA.md | todos os 24 casos (cada caso verifica class) |
| Microetapa 3 — ordem de avaliação | T3_ORDEM_AVALIACAO_COMPOSICAO.md | TC-ORD-01, TC-COL-01..04 |
| Microetapa 4 — composição simultânea | T3_ORDEM_AVALIACAO_COMPOSICAO.md | TC-ORD-02, TC-COL-01..04 |
| Microetapa 5 — veto suave + validador | T3_VETO_SUAVE_VALIDADOR.md | TC-VAL-01..02, TC-AMB-01..04, TC-POS-02..03 |

---

## Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_SUITE_TESTES_REGRAS.md
PR que fecha:                          PR-T3.5 (suíte de testes de regras críticas)
Estado da evidência:                   completa

Há lacuna remanescente?:               não —
  24 casos totais (mínimo contratual: 20 — CA-06 cumprido com margem de 4);
  4 positivos (TC-POS-01..04): uma regra crítica cada;
  4 negativos (TC-NEG-01..04): uma regra crítica cada;
  4 ambíguos (TC-AMB-01..04): dado incerto → confirmação, nunca decisão final;
  4 colisões (TC-COL-01..04): COL-BLOCK-OBLIG, COL-CONF-CONF-LEVEL,
    coexistência válida, COL-BLOCK-ROUTE;
  4 regressões (TC-REG-01..04): RC-INV-03/04/05/01 verificados;
  2 casos de ordem/composição T3.3 (TC-ORD-01..02);
  2 casos de validador T3.4 (TC-VAL-01..02);
  tabela geral de cobertura (§2);
  critérios PASS/FAIL globais (§10): 11 critérios universais + 9 falhas críticas;
  validação cruzada T3.1/T3.2/T3.3/T3.4/T2 em 18 linhas (§11);
  8 anti-padrões de teste AP-ST-01..08;
  cobertura das 5 microetapas T3 (§13).

Há item parcial/inconclusivo bloqueante?:  não.
Fechamento permitido nesta PR?:            sim
Estado permitido após esta PR:             PR-T3.5 CONCLUÍDA; PR-T3.R desbloqueada.
Próxima PR autorizada:                     PR-T3.R — Readiness/Closeout G3
```

### Provas entregues

**P-T3.5-01:** 24 casos declarados > 20 mínimo contratual (CA-06 cumprido). Todas as 5
categorias obrigatórias cobertas: positivo (4), negativo (4), ambíguo (4), colisão (4),
regressão (4). Ordem/composição (2) e validador (2) adicionais.

**P-T3.5-02:** nenhum caso espera `reply_text`, `mensagem_usuario` ou equivalente em nenhum
`policy_esperada`, `soft_veto_esperado`, `validacao_esperada` ou `resultado_esperado`.
P-GLOBAL-01 cumprido em todos os 24 casos.

**P-T3.5-03:** todas as `fact_key` referenciadas nos casos (`fact_estado_civil`, `fact_process_mode`,
`fact_work_regime_p1`, `fact_autonomo_has_ir_p1`, `fact_monthly_income_p1`, `fact_nationality`,
`fact_rnm_status`, `fact_composition_actor`, `derived_rnm_required`, `derived_rnm_block`,
`derived_composition_needed`) existem em `T2_DICIONARIO_FATOS §3`. Nenhuma chave inventada.

**P-T3.5-04:** TC-REG-01 prova que R_AUTONOMO_IR nunca seta ineligible (RC-INV-03). TC-REG-02
prova que R_SOLO_BAIXA_COMPOSICAO nunca emite bloqueio (RC-INV-04). TC-REG-03 prova que
R_ESTRANGEIRO_SEM_RNM só bloqueia com nationality=confirmed (RC-INV-05). TC-REG-04 prova que
nenhum payload contém reply_text (RC-INV-01). Todas as 4 regressões críticas formalmente declaradas.

**P-T3.5-05:** §13 declara cobertura das 5 microetapas T3 com casos específicos. CA-09 cumprido.

### Conformidade com adendos

- **A00-ADENDO-01:** confirmada — nenhum caso espera `reply_text`; P-GLOBAL-01 aplica-se a
  todos os 24 casos; policy engine decide mas não fala em nenhum output esperado.
- **A00-ADENDO-02:** confirmada — identidade MCMV preservada; suíte prova que mecanismos
  orientam sem engessar o LLM; R_SOLO_BAIXA nunca bloqueia; R_AUTONOMO nunca declara inelegível.
- **A00-ADENDO-03:** confirmada — Bloco E presente com 5 provas estruturadas.
