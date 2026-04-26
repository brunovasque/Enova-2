# T4_BATERIA_E2E — Bateria E2E Declarativa em Sandbox — ENOVA 2

## Finalidade

Este documento define a **bateria E2E declarativa em sandbox** do pipeline de turno T4 da
ENOVA 2. Cada cenário especifica, de forma declarativa e sem execução real, o conjunto
completo de entradas, transformações esperadas e saídas verificáveis de um turno — cobrindo
pipeline completo, fallbacks obrigatórios e casos de borda/regressão.

**Princípios canônicos:**

> Esta bateria é declarativa — nenhum LLM real, nenhum Supabase real, nenhuma chamada
> de canal real é executada nesta PR.
> Cada cenário é uma especificação verificável do comportamento esperado do pipeline.
> Todo `fact_key` deve existir em `T2_LEAD_STATE_V1.md`.
> Todo `PolicyDecision` deve respeitar `T3_CLASSES_POLITICA.md` e `T3_ORDEM_AVALIACAO_COMPOSICAO.md`.
> Todo `ValidationResult` deve respeitar `T3_VETO_SUAVE_VALIDADOR.md` (VC-01..VC-09).
> Nenhum cenário trata `reply_text` como fonte de estado.
> Nenhum fallback promete aprovação, reprova cliente ou avança stage.
> Métricas de latência/custo são declarativas — não medições reais.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T4_ENTRADA_TURNO.md` (PR-T4.1)
- `schema/implantation/T4_PIPELINE_LLM.md` (PR-T4.2)
- `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` (PR-T4.3)
- `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` (PR-T4.4)
- `schema/implantation/T4_FALLBACKS.md` (PR-T4.5)
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` — VC-01..VC-09
- `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` — PolicyDecisionSet
- `schema/implantation/T3_CLASSES_POLITICA.md` — 5 classes
- `schema/implantation/T2_LEAD_STATE_V1.md` — fact_keys canônicos
- `schema/implantation/T1_CONTRATO_SAIDA.md` — TurnoSaida shape

**Microetapa do mestre coberta:**

> **Microetapa 6 — T4 (bateria):** "Pacote mínimo de testes — pipeline completo demonstrado,
> fallbacks cobertos, borda declarada, latência/custo medidos."

**Base soberana:**

- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — §2.8, §6 S6, §7 CA-09
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## §1 Tabela geral dos cenários

| Código | Tipo | Título resumido | ValidationResult | Rota | PASS |
|--------|------|----------------|-----------------|------|------|
| **E2E-PC-01** | `pipeline_completo` | Lead CLT, renda coletada — APPROVE | APPROVE | T4.4 | §4.1 |
| **E2E-PC-02** | `pipeline_completo` | Lead autônomo, veto IR não reconhecido — REQUIRE_REVISION | REQUIRE_REVISION | T4.4 | §4.2 |
| **E2E-PC-03** | `pipeline_completo` | Confirmed indevido (VC-07) — PREVENT_PERSISTENCE | PREVENT_PERSISTENCE | T4.4 | §4.3 |
| **E2E-PC-04** | `pipeline_completo` | Colisão silenciosa (VC-04) — REJECT | REJECT | T4.5 | §4.4 |
| **E2E-FB-01** | `fallback` | erro_modelo — timeout, retry seguro | N/A (fallback direto) | T4.5 | §5.1 |
| **E2E-FB-02** | `fallback` | formato_invalido — ParseError, sem retry | N/A (fallback direto) | T4.5 | §5.2 |
| **E2E-FB-03** | `fallback` | omissao_campos — current_objective ausente | N/A (fallback direto) | T4.5 | §5.3 |
| **E2E-FB-04** | `fallback` | contradicao_seria — REJECT via T4.3 → T4.5 | REJECT | T4.5 | §5.4 |
| **E2E-BD-01** | `borda` | Avanço de stage + snapshot L3 | APPROVE | T4.4 | §6.1 |
| **E2E-BD-02** | `regressao` | LLM-first violado — VC-01 REJECT imediato | REJECT | T4.5 | §6.2 |

**Total:** 10 cenários — 4 pipeline_completo + 4 fallback + 1 borda + 1 regressão.
Mínimo contratual CA-09 (≥10) **CUMPRIDO**.

---

## §2 Convenções da bateria

### 2.1 Métricas declarativas

Todos os valores de latência/tokens são **declarativos** — representam faixas esperadas
para fins de especificação, não medições reais.

| Métrica | Valor declarativo típico | Faixas aceitáveis |
|---------|--------------------------|-------------------|
| `latency_ms` (total do turno) | 2.000–4.000 ms | < 8.000 ms = aceitável |
| `latency_llm_ms` | 1.000–2.500 ms | < 6.000 ms = aceitável |
| `tokens_input` | 600–1.200 | declarativo — não limitado nesta PR |
| `tokens_output` | 60–180 | declarativo |
| `tokens_total` | 700–1.400 | declarativo |

### 2.2 `prior_lead_state` simplificado

Para concisão, os cenários declaram apenas os campos relevantes do `lead_state`.
O estado completo (11 blocos de `T2_LEAD_STATE_V1.md`) existe implicitamente.

### 2.3 Critérios globais PASS/FAIL

Um cenário está em PASS quando **todos** os seguintes critérios são verdadeiros:

| # | Critério |
|---|---------|
| G-01 | `ValidationResult.decision` corresponde ao valor esperado |
| G-02 | `PersistDecision.lead_state_action` corresponde ao valor esperado |
| G-03 | `PersistDecision.reply_routing` corresponde ao valor esperado |
| G-04 | Nenhum campo `reply_text` gerado pelo orquestrador, reconciliador, validador ou policy engine |
| G-05 | Todos os `fact_key` usados existem em `T2_LEAD_STATE_V1.md` |
| G-06 | Todos os `PolicyDecision` respeitam `T3_CLASSES_POLITICA.md` e `T3_ORDEM_AVALIACAO_COMPOSICAO.md` |
| G-07 | `TurnoRastro` ou `FallbackTrace` criado com campos mínimos |
| G-08 | Métricas declarativas presentes: `latency_ms`, `latency_llm_ms`, `tokens_input`, `tokens_output`, `tokens_total` |

---

## §3 Estrutura de cada cenário

```
Código         — identificador único
Tipo           — pipeline_completo | fallback | borda | regressao
Título         — descrição curta
Prior state    — estado do lead antes do turno (campos relevantes)
TurnoEntrada   — campos canônicos de entrada
LLMResult      — saída simulada do LLM (reply_text + TurnoSaida)
LLMResponseMeta — metadados estruturados do LLM
ProposedStateDelta — delta proposto de estado
PolicyDecisionSet — decisões esperadas do policy engine (T3)
ValidationResult — resultado esperado do validador (T3.4)
PersistDecision — decisão de persistência esperada
Rota           — "T4.4" | "T4.5"
TurnoRastro    — rastro esperado (se rota T4.4)
FallbackTrace  — rastro de fallback esperado (se rota T4.5 ou fallback direto)
Métricas       — latency_ms, latency_llm_ms, tokens_*
Critérios PASS — condições específicas do cenário
```

---

## §4 Cenários de pipeline completo

### §4.1 E2E-PC-01 — Lead CLT, renda coletada — APPROVE

**Tipo:** `pipeline_completo`

**Título:** Lead CLT declara renda. LLM extrai corretamente. Todos os VC passam. APPROVE.

**Prior state:**
```
lead_state.facts = {
  fact_work_regime_p1: { value: null, status: "hypothesis" }  // ainda não confirmado
  fact_monthly_income_p1: { value: null, status: "empty" }
  fact_estado_civil: { value: null, status: "empty" }
}
lead_state.operational.current_phase = "qualification_core"
lead_state.conflicts = []
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:           "turn_E2E_PC01",
  case_id:           "case_E2E_001",
  channel:           "whatsapp",
  message_text:      "Trabalho com carteira assinada e ganho R$ 3.500 por mês",
  lead_state:        <prior state acima>,
  current_objective: { type: "OBJ_COLETAR_RENDA", target_field: "fact_monthly_income_p1" }
}
```

**LLMResult (simulado):**
```
LLMResult {
  reply_text: "Anotei sua renda de R$ 3.500,00 como trabalhador CLT. Vou registrar isso
               para avançarmos. Você tem dependentes que vão compor o financiamento?",
  TurnoSaida: {
    reply_text:           "<acima>",
    current_objective:    { type: "OBJ_COLETAR_COMPOSICAO", target_field: "fact_dependente" },
    facts_updated_candidates: [
      { fact_key: "fact_work_regime_p1",  value: "clt",  status: "captured",  source: "llm_collected", confirmed: false },
      { fact_key: "fact_monthly_income_p1", value: 3500, status: "captured",  source: "llm_collected", confirmed: false }
    ],
    actions_requested: [],
    confidence: 0.92
  }
}
```

**LLMResponseMeta:**
```
LLMResponseMeta {
  facts_updated_count: 2,
  objectives_changed:  true,
  actions_requested:   [],
  confidence:          0.92,
  approval_signals:    false,
  stage_advance_signal: false
}
```

**ProposedStateDelta:**
```
ProposedStateDelta {
  fact_entries: [
    { fact_key: "fact_work_regime_p1",   value: "clt",  status: "captured", source: "llm_collected" },
    { fact_key: "fact_monthly_income_p1", value: 3500,  status: "captured", source: "llm_collected" }
  ]
}
```

**PolicyDecisionSet esperado (T3):**
```
PolicyDecisionSet {
  decisions: [
    { rule_id: "R_AUTONOMO_IR",           class: "OBRIGAÇÃO",   triggered: false  },  // CLT — não dispara
    { rule_id: "R_CASADO_CIVIL_CONJUNTO", class: "OBRIGAÇÃO",   triggered: false  },  // estado_civil vazio
    { rule_id: "R_ESTRANGEIRO_SEM_RNM",   class: "BLOQUEIO",    triggered: false  }   // sem dado de nacionalidade
  ],
  collisions: [],
  soft_vetos: []
}
```

**ValidationResult esperado:**
```
ValidationResult {
  decision:          "APPROVE",
  checklist_results: [
    { vc: "VC-01", passed: true  },  // reply_text soberano do LLM
    { vc: "VC-02", passed: true  },  // sem promessa de elegibilidade
    { vc: "VC-03", passed: true  },  // sem avanço de phase com bloqueio
    { vc: "VC-04", passed: true  },  // sem colisão silenciosa
    { vc: "VC-05", passed: true  },  // confiança 0.92 ≥ limiar
    { vc: "VC-06", passed: true  },  // sem soft_veto warning
    { vc: "VC-07", passed: true  },  // facts como "captured" não como "confirmed"
    { vc: "VC-08", passed: true  },  // OBJ_COLETAR_RENDA compatível com qualification_core
    { vc: "VC-09", passed: true  }   // resposta natural, não mecânica
  ],
  blocking_items: [],
  advisory_items: [],
  safe_fields:    ["fact_work_regime_p1", "fact_monthly_income_p1"],
  blocked_fields: []
}
```

**PersistDecision esperado:**
```
PersistDecision {
  validation_result: <acima>,
  lead_state_action: "apply_full",
  fields_to_apply:   ["fact_work_regime_p1", "fact_monthly_income_p1"],
  fields_to_block:   [],
  conflicts_generated: [],
  reply_routing:     "T4.4"
}
```

**Rota:** `T4.4` — `reply_text` entregue ao canal.

**TurnoRastro esperado:**
```
TurnoRastro {
  turn_id: "turn_E2E_PC01", case_id: "case_E2E_001",
  validation_result:  { decision: "APPROVE", blocking_items: [], advisory_items: [] },
  persist_decision:   { lead_state_action: "apply_full", facts_persisted_count: 2,
                        facts_blocked_count: 0, reply_routing: "T4.4" },
  facts_persisted:    ["fact_work_regime_p1", "fact_monthly_income_p1"],
  facts_blocked:      [],
  conflicts_registered: [],
  reply_routing:      "T4.4",
  channel_delivery_status: "delivered"
}
```

**Métricas declarativas:**
```
latency_ms:      2.180   tokens_input:  840
latency_llm_ms:  1.240   tokens_output:  96
                          tokens_total:  936
```

**Critérios PASS:**
- G-01..G-08 todos verdadeiros
- `ValidationResult.decision = "APPROVE"` ✓
- `PersistDecision.lead_state_action = "apply_full"` ✓
- `facts_persisted` inclui `fact_work_regime_p1` e `fact_monthly_income_p1` ✓
- `reply_routing = "T4.4"` ✓
- Nenhum `reply_text` gerado pelo mecânico ✓

---

### §4.2 E2E-PC-02 — Lead autônomo, veto IR não reconhecido — REQUIRE_REVISION

**Tipo:** `pipeline_completo`

**Título:** Lead autônomo declara renda. LLM não reconhece explicitamente o veto suave
sobre IR. Resultado: REQUIRE_REVISION (VC-06 advisory).

**Prior state:**
```
lead_state.facts = {
  fact_work_regime_p1:  { value: "autonomo", status: "captured" },
  fact_monthly_income_p1: { value: null, status: "empty" }
}
lead_state.operational.current_phase = "qualification_core"
lead_state.soft_vetos = [
  { veto_id: "VETO_IR_AUTONOMO", risk_type: "risco_documental",
    resolution: "pending", acknowledgment_required: true }
]
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:           "turn_E2E_PC02",
  case_id:           "case_E2E_002",
  message_text:      "Recebo R$ 4.200 por mês fazendo serviços",
  lead_state:        <prior state>,
  current_objective: { type: "OBJ_COLETAR_RENDA", target_field: "fact_monthly_income_p1" },
  soft_vetos_ctx:    ["VETO_IR_AUTONOMO"]
}
```

**LLMResult (simulado):**
```
LLMResult {
  reply_text: "Anotei sua renda de R$ 4.200. Para avançar, preciso entender mais
               sobre sua documentação de renda como autônomo.",
  TurnoSaida: {
    facts_updated_candidates: [
      { fact_key: "fact_monthly_income_p1", value: 4200, status: "captured",
        source: "llm_collected", confirmed: false }
    ],
    soft_veto_acknowledgments: [],  // LLM não explicitou acknowledgment do VETO_IR_AUTONOMO
    confidence: 0.85
  }
}
```

**LLMResponseMeta:**
```
LLMResponseMeta {
  facts_updated_count: 1,
  soft_veto_acknowledgments: [],  // ausente — disparará VC-06
  confidence: 0.85
}
```

**PolicyDecisionSet esperado:**
```
PolicyDecisionSet {
  decisions: [
    { rule_id: "R_AUTONOMO_IR", class: "OBRIGAÇÃO", triggered: true,
      payload: { require_field: "fact_autonomo_has_ir_p1" } }
  ],
  soft_vetos: [
    { veto_id: "VETO_IR_AUTONOMO", risk_type: "risco_documental",
      acknowledgment_required: true, acknowledged: false }
  ]
}
```

**ValidationResult esperado:**
```
ValidationResult {
  decision: "REQUIRE_REVISION",
  checklist_results: [
    { vc: "VC-06", passed: false, severity: "advisory",
      reason: "VETO_IR_AUTONOMO warning não reconhecido na resposta do LLM" }
    // VC-01..05, 07..09: todos passed
  ],
  blocking_items: [],
  advisory_items: ["VC-06"],
  safe_fields:    ["fact_monthly_income_p1"],
  blocked_fields: []
}
```

**PersistDecision esperado:**
```
PersistDecision {
  lead_state_action: "apply_partial",
  fields_to_apply:   ["fact_monthly_income_p1"],
  fields_to_block:   [],
  reply_routing:     "T4.4"
}
```

**Rota:** `T4.4` — `reply_text` entregue mesmo com REQUIRE_REVISION.

**TurnoRastro esperado:**
```
TurnoRastro {
  validation_result: { decision: "REQUIRE_REVISION", advisory_items: ["VC-06"] },
  persist_decision:  { lead_state_action: "apply_partial", facts_persisted_count: 1,
                       reply_routing: "T4.4" },
  facts_persisted:   ["fact_monthly_income_p1"],
  reply_routing:     "T4.4",
  channel_delivery_status: "delivered"
}
```

**Métricas declarativas:**
```
latency_ms:     2.350   tokens_input:  920
latency_llm_ms: 1.380   tokens_output: 105
                         tokens_total: 1.025
```

**Critérios PASS:**
- G-01..G-08 todos verdadeiros
- `ValidationResult.decision = "REQUIRE_REVISION"` ✓
- `advisory_items` contém `"VC-06"` ✓
- `reply_routing = "T4.4"` — REQUIRE_REVISION não bloqueia entrega ✓
- `fact_monthly_income_p1` persistido mesmo com advisory ✓
- Veto IR permanece ativo para próximo turno ✓

---

### §4.3 E2E-PC-03 — Confirmed indevido (VC-07) — PREVENT_PERSISTENCE

**Tipo:** `pipeline_completo`

**Título:** LLM propõe `fact_estado_civil` como `confirmed` sem coleta explícita.
VC-07 bloqueia o campo. Outros campos persistem. `reply_text` entregue.

**Prior state:**
```
lead_state.facts = {
  fact_estado_civil:     { value: null, status: "empty" },
  fact_monthly_income_p1: { value: 3200, status: "captured" }
}
lead_state.operational.current_phase = "qualification_core"
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:           "turn_E2E_PC03",
  case_id:           "case_E2E_003",
  message_text:      "Sou casado e tenho renda de R$ 3.200",
  current_objective: { type: "OBJ_COLETAR_COMPOSICAO", target_field: "fact_estado_civil" }
}
```

**LLMResult (simulado):**
```
LLMResult {
  reply_text: "Entendi que você mencionou ser casado — mas preciso confirmar
               esse dado antes de prosseguir. Pode me confirmar seu estado civil?",
  // Fala segura: reconhece a informação sem afirmar registro;
  // não avança para pergunta dependente (renda do cônjuge);
  // aguarda confirmação explícita antes de persistir.
  TurnoSaida: {
    facts_updated_candidates: [
      { fact_key: "fact_estado_civil",      value: "casado_civil", status: "confirmed",
        source: "llm_collected", confirmed: true  },  // ← PROBLEMA detectado pelo VC-07: confirmed sem coleta explícita
      { fact_key: "fact_monthly_income_p1", value: 3200, status: "captured",
        source: "llm_collected", confirmed: false }
    ]
  }
}
```

**ProposedStateDelta:**
```
ProposedStateDelta {
  fact_entries: [
    { fact_key: "fact_estado_civil",       status: "confirmed", source: "llm_collected" },
    { fact_key: "fact_monthly_income_p1",  status: "captured",  source: "llm_collected" }
  ]
}
```

**PolicyDecisionSet esperado:**
```
PolicyDecisionSet {
  decisions: [
    { rule_id: "R_CASADO_CIVIL_CONJUNTO", class: "OBRIGAÇÃO", triggered: true,
      payload: { require_field: "fact_process_mode", expected_value: "conjunto" } }
  ],
  collisions: []
}
```

**ValidationResult esperado:**
```
ValidationResult {
  decision: "PREVENT_PERSISTENCE",
  checklist_results: [
    { vc: "VC-07", passed: false, severity: "critical",
      reason: "fact_estado_civil status 'confirmed' sem coleta explícita — OBJ_CONFIRMAR não ativo" }
    // VC-01..06, 08..09: todos passed
  ],
  blocking_items:  ["VC-07"],
  safe_fields:     ["fact_monthly_income_p1"],
  blocked_fields:  ["fact_estado_civil"]
}
```

**PersistDecision esperado:**
```
PersistDecision {
  lead_state_action: "apply_partial",
  fields_to_apply:   ["fact_monthly_income_p1"],
  fields_to_block:   ["fact_estado_civil"],
  conflicts_generated: [
    { conflict_id: "CONF-fact_estado_civil-turn_E2E_PC03",
      fact_key: "fact_estado_civil", conflict_type: "CONF_DADO_CONTRADITO", status: "open" }
  ],
  reply_routing: "T4.4"  // PREVENT_PERSISTENCE → T4.4 (não REJECT)
}
```

**Rota:** `T4.4` — `reply_text` entregue. `fact_estado_civil` bloqueado.

**TurnoRastro esperado:**
```
TurnoRastro {
  validation_result: { decision: "PREVENT_PERSISTENCE", blocking_items: ["VC-07"] },
  persist_decision:  { lead_state_action: "apply_partial",
                       facts_persisted_count: 1, facts_blocked_count: 1, reply_routing: "T4.4" },
  facts_persisted:   ["fact_monthly_income_p1"],
  facts_blocked:     ["fact_estado_civil"],
  conflicts_registered: [{ conflict_id: "CONF-fact_estado_civil-turn_E2E_PC03",
                           fact_key: "fact_estado_civil", status: "open" }],
  reply_routing:     "T4.4",
  channel_delivery_status: "delivered"
}
```

**Métricas declarativas:**
```
latency_ms:     2.520   tokens_input:  890
latency_llm_ms: 1.460   tokens_output: 112
                         tokens_total: 1.002
```

**Critérios PASS:**
- `ValidationResult.decision = "PREVENT_PERSISTENCE"` ✓
- `blocking_items` contém `"VC-07"` ✓
- `reply_routing = "T4.4"` — PREVENT_PERSISTENCE não impede entrega ✓
- `fact_estado_civil` em `facts_blocked` ✓
- `fact_monthly_income_p1` em `facts_persisted` ✓
- `ConflictRecord` criado para `fact_estado_civil` ✓

---

### §4.4 E2E-PC-04 — Colisão silenciosa (VC-04) — REJECT

**Tipo:** `pipeline_completo`

**Título:** LLM propõe dois objetivos de roteamento contraditórios sem registrar colisão.
VC-04 detecta colisão silenciosa. REJECT. `reply_text` não entregue. T4.5 acionado.

**Prior state:**
```
lead_state.facts = { fact_work_regime_p1: { value: "clt", status: "captured" } }
lead_state.operational.current_phase = "qualification_core"
lead_state.conflicts = []
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:           "turn_E2E_PC04",
  case_id:           "case_E2E_004",
  message_text:      "Tenho carteira assinada mas também faço uns bicos",
  current_objective: { type: "OBJ_COLETAR_RENDA" }
}
```

**LLMResult (simulado):**
```
LLMResult {
  reply_text: "...",  // capturado mas NÃO entregue (REJECT)
  TurnoSaida: {
    actions_requested: [
      { type: "ACAO_MUDAR_FASE",   payload: { target_phase: "qualification_special" } },
      { type: "ACAO_MANTER_ETAPA", payload: { reason: "renda_multi_pendente" } }
      // COLISÃO: avançar fase E manter etapa ao mesmo tempo — contradição não registrada
    ],
    facts_updated_candidates: [
      { fact_key: "fact_work_regime_p1",  value: "multi_regime", status: "captured",
        source: "llm_collected" }
    ]
  }
}
```

**ProposedStateDelta:**
```
ProposedStateDelta {
  fact_entries: [{ fact_key: "fact_work_regime_p1", value: "multi_regime", status: "captured" }],
  actions_requested: [
    { type: "ACAO_MUDAR_FASE",   payload: { target_phase: "qualification_special" } },
    { type: "ACAO_MANTER_ETAPA", payload: {} }
  ]
}
```

**PolicyDecisionSet esperado (com colisão detectada pelo engine T3):**
```
PolicyDecisionSet {
  decisions: [
    { rule_id: "R_ROTEAMENTO_FASE", class: "ROTEAMENTO", triggered: true }
  ],
  collisions: [
    { collision_id: "COL-ROUTE-turn_E2E_PC04",
      type: "COL-BLOCK-ROUTE",
      parties: ["ACAO_MUDAR_FASE", "ACAO_MANTER_ETAPA"],
      registered: false  // ← colisão presente mas NÃO registrada → VC-04 FAIL
    }
  ]
}
```

**ValidationResult esperado:**
```
ValidationResult {
  decision: "REJECT",
  checklist_results: [
    { vc: "VC-04", passed: false, severity: "critical",
      reason: "Colisão entre ACAO_MUDAR_FASE e ACAO_MANTER_ETAPA não registrada como ConflictRecord" }
  ],
  blocking_items: ["VC-04"],
  safe_fields:    [],
  blocked_fields: ["fact_work_regime_p1"]
}
```

**PersistDecision esperado:**
```
PersistDecision {
  lead_state_action: "revert",
  fields_to_apply:   [],
  conflicts_generated: [],  // revert descarta tudo
  reply_routing:     "T4.5"
}
```

**Rota:** `T4.5` — `reply_text` NÃO entregue. T4.5 acionado via T4.4.

**FallbackTrace esperado:**
```
FallbackTrace {
  turn_id: "turn_E2E_PC04", case_id: "case_E2E_004",
  trigger: "contradicao_seria",
  action:  "hold_for_next_turn",
  error_detail: { error_type: "silent_collision", vc_failed: "VC-04" },
  lead_state_preserved: true,
  facts_persisted: [],
  stage_advanced: false,
  response_delivered: true,    // fallback response entregue ao canal (não o reply_text rejeitado)
  attempted_reply_ref: "turn_E2E_PC04"  // turn_id apenas — NUNCA o texto
}
```

**Métricas declarativas:**
```
latency_ms:     2.890   tokens_input:  850
latency_llm_ms: 1.510   tokens_output:  98
                         tokens_total:  948
```

**Critérios PASS:**
- `ValidationResult.decision = "REJECT"` ✓
- `blocking_items` contém `"VC-04"` ✓
- `reply_routing = "T4.5"` ✓
- `reply_text` NÃO entregue ao canal ✓
- `FallbackTrace.attempted_reply_ref = "turn_E2E_PC04"` (turn_id, nunca o texto) ✓
- `lead_state_preserved = true` ✓
- `stage_advanced = false` ✓
- `facts_persisted = []` ✓

---

## §5 Cenários de fallback

### §5.1 E2E-FB-01 — `erro_modelo`: timeout, retry seguro bem-sucedido

**Tipo:** `fallback`

**Trigger:** `erro_modelo` — T4.2 detecta timeout na chamada LLM.

**Prior state:**
```
lead_state.facts = { fact_monthly_income_p1: { value: null, status: "empty" } }
lead_state.operational.current_phase = "qualification_core"
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:      "turn_E2E_FB01",
  case_id:      "case_E2E_005",
  message_text: "Ganho R$ 2.800 por mês",
  current_objective: { type: "OBJ_COLETAR_RENDA" }
}
```

**Evento de falha (T4.2):**
```
LLMCall.status = "timeout"    — resposta não chegou em 30s
ErrorDetail = { error_type: "llm_timeout", error_code: "TIMEOUT_30S" }
```

**FallbackContext:**
```
FallbackContext {
  trigger:             "erro_modelo",
  error_detail:        { error_type: "llm_timeout", error_code: "TIMEOUT_30S" },
  attempted_reply_ref: null,
  turn_start_timestamp: "2026-04-26T10:00:00Z"
}
```

**FallbackDecision:**
```
FallbackDecision {
  trigger: "erro_modelo",
  action:  "retry_llm_safe",      // 1ª ocorrência → tenta retry (FB-RETRY-01)
  lead_state_change: "none",
  facts_persisted:   []
}
```

**Retry LLM simplificado (simulado como bem-sucedido):**
```
LLMRetryResult {
  status:    "success",
  reply_text: "Recebi sua mensagem! Em um momento retomo o atendimento.",
  // resposta mínima — sem extração de fatos, sem persistência
}
```

**Resultado:**
- `FallbackDecision.action = "retry_llm_safe"` — retry respondeu
- `reply_text` mínimo do retry entregue ao canal
- `lead_state` preservado (nenhum fato coletado neste turno)
- Próximo turno reiniciará coleta de renda

**FallbackTrace esperado:**
```
FallbackTrace {
  turn_id:              "turn_E2E_FB01",
  trigger:              "erro_modelo",
  action:               "retry_llm_safe",
  error_detail:         { error_type: "llm_timeout", error_code: "TIMEOUT_30S" },
  lead_state_preserved: true,
  facts_persisted:      [],
  stage_advanced:       false,
  response_delivered:   true,
  attempted_reply_ref:  null,
  latency_ms:           33.800,  // timeout (30.000ms) + retry bem-sucedido (~3.800ms)
  partial_latency_ms:   30.000   // latência até a falha (timeout)
}
```

**Métricas declarativas:**
```
latency_ms:          33.800   // timeout (30.000ms) + retry bem-sucedido (~3.800ms)
partial_latency_ms:  30.000   // até a falha (timeout LLM original)
tokens_input:          200    // prompt simplificado do retry
tokens_output:          28
tokens_total:          228
```

**Critérios PASS:**
- `FallbackTrace.trigger = "erro_modelo"` ✓
- `FallbackTrace.action = "retry_llm_safe"` ✓
- `lead_state_preserved = true` ✓
- `facts_persisted = []` ✓
- `stage_advanced = false` ✓
- `response_delivered = true` (retry bem-sucedido) ✓
- `attempted_reply_ref = null` (sem reply_text do turno original) ✓

---

### §5.2 E2E-FB-02 — `formato_invalido`: ParseError, sem retry

**Tipo:** `fallback`

**Trigger:** `formato_invalido` — T4.2 detecta JSON malformado em `TurnoSaida`.

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:      "turn_E2E_FB02",
  case_id:      "case_E2E_006",
  message_text: "Sou casado, trabalho como autônomo, ganho uns 3 mil e tenho FGTS"
}
```

**Evento de falha (T4.2):**
```
ParseError = { type: "UNCLOSED_JSON_OBJECT", detail: "TurnoSaida.facts_updated_candidates truncated" }
// JSON inválido — TurnoSaida parcial e não utilizável
```

**FallbackContext:**
```
FallbackContext {
  trigger:             "formato_invalido",
  error_detail:        { error_type: "parse_error", error_code: "UNCLOSED_JSON_OBJECT" },
  attempted_reply_ref: null   // reply_text parcial descartado (FB-FI-03)
}
```

**FallbackDecision:**
```
FallbackDecision {
  trigger: "formato_invalido",
  action:  "request_reformulation",  // sem retry (FB-RETRY-01)
  lead_state_change: "none",
  facts_persisted:   []
}
```

**T4.5 executa:**
- Saída malformada descartada imediatamente — sem retry (FB-RETRY-01; FB-FI-01)
- `reply_text` parcial descartado — não entregue, não consultado (FB-FI-03; FB-INV-01)
- `request_reformulation`: resposta mínima ao lead

**FallbackTrace esperado:**
```
FallbackTrace {
  turn_id:              "turn_E2E_FB02",
  trigger:              "formato_invalido",
  action:               "request_reformulation",
  error_detail:         { error_type: "parse_error", error_code: "UNCLOSED_JSON_OBJECT" },
  lead_state_preserved: true,
  facts_persisted:      [],
  stage_advanced:       false,
  response_delivered:   true,
  attempted_reply_ref:  null
}
```

**Métricas declarativas:**
```
latency_ms:         1.820   // falha rápida antes de parsing completo
partial_latency_ms: 1.600   // até detecção do ParseError
tokens_input:         880   // prompt enviado (mesmo com falha)
tokens_output:        140   // output parcial antes da falha
tokens_total:       1.020
```

**Critérios PASS:**
- `FallbackTrace.trigger = "formato_invalido"` ✓
- `FallbackTrace.action = "request_reformulation"` (sem retry) ✓
- Nenhum dado parcial extraído ✓
- `attempted_reply_ref = null` (reply_text parcial descartado) ✓
- `lead_state_preserved = true` ✓

---

### §5.3 E2E-FB-03 — `omissao_campos`: `current_objective` ausente

**Tipo:** `fallback`

**Trigger:** `omissao_campos` — T4.2 detecta `current_objective = null` em `TurnoSaida`.

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:      "turn_E2E_FB03",
  case_id:      "case_E2E_007",
  message_text: "Ok, pode continuar"
}
```

**LLMResult (simulado — TurnoSaida com campo ausente):**
```
LLMResult {
  reply_text: "Ótimo! Vamos continuar.",
  TurnoSaida: {
    reply_text:           "Ótimo! Vamos continuar.",
    current_objective:    null,          // ← CAMPO OBRIGATÓRIO AUSENTE
    facts_updated_candidates: [],
    confidence: 0.70
  }
}
```

**FallbackContext:**
```
FallbackContext {
  trigger:      "omissao_campos",
  error_detail: { error_type: "missing_field", field_name: "current_objective" },
  attempted_reply_ref: null   // reply_text não utilizado (FB-OC-01; FB-INV-01)
}
```

**FallbackDecision:**
```
FallbackDecision {
  trigger: "omissao_campos",
  action:  "request_reformulation",
  lead_state_change: "none",
  facts_persisted: []
}
```

**FallbackTrace esperado:**
```
FallbackTrace {
  turn_id:              "turn_E2E_FB03",
  trigger:              "omissao_campos",
  action:               "request_reformulation",
  error_detail:         { error_type: "missing_field", field_name: "current_objective" },
  lead_state_preserved: true,
  facts_persisted:      [],
  stage_advanced:       false,
  response_delivered:   true
}
```

**Métricas declarativas:**
```
latency_ms:         1.650   tokens_input:  720
latency_llm_ms:     1.120   tokens_output:   8   // resposta curtíssima sem estrutura
                             tokens_total:  728
```

**Critérios PASS:**
- `FallbackTrace.trigger = "omissao_campos"` ✓
- `error_detail.field_name = "current_objective"` ✓
- `FallbackTrace.action = "request_reformulation"` ✓
- `lead_state_preserved = true` ✓
- `reply_text` do LLM ("Ótimo! Vamos continuar.") não entregue ao canal (campo ausente invalida turno) ✓
- `attempted_reply_ref = null` — sem referência ao reply_text parcial ✓

---

### §5.4 E2E-FB-04 — `contradicao_seria`: REJECT via T4.3 → T4.4 → T4.5

**Tipo:** `fallback`

**Trigger:** `contradicao_seria` — T4.3 retorna `ValidationResult = REJECT` (VC-04).
T4.4 recebe `reply_routing = "T4.5"`. T4.5 acionado com metadados (sem `reply_text`).

**Prior state:**
```
lead_state.facts = {
  fact_work_regime_p1: { value: "clt", status: "captured" }
}
lead_state.operational.current_phase = "qualification_core"
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:      "turn_E2E_FB04",
  case_id:      "case_E2E_008",
  message_text: "Na verdade, sou autônomo — nunca fui CLT"
}
```

**LLMResult (simulado — propostas contraditórias):**
```
LLMResult {
  reply_text: "Tudo bem, vou atualizar sua situação...",  // capturado; NÃO entregue
  TurnoSaida: {
    facts_updated_candidates: [
      { fact_key: "fact_work_regime_p1", value: "autonomo", status: "confirmed",
        source: "llm_collected" }    // contradiz o "clt" captured — colisão
    ],
    actions_requested: [
      { type: "ACAO_MUDAR_FASE",   payload: {} },  // colisão silenciosa — não registrada
      { type: "ACAO_COLETAR_DADO", payload: {} }
    ]
  }
}
```

**PolicyDecisionSet + T4.3 ValidationResult:**
```
ValidationResult = REJECT (VC-04 — colisão silenciosa entre ACAO_MUDAR_FASE e ACAO_COLETAR_DADO)
PersistDecision.reply_routing = "T4.5"
PersistDecision.lead_state_action = "revert"
```

**O que T4.4 envia para T4.5 (metadados apenas):**
```
{
  turn_id:             "turn_E2E_FB04",
  case_id:             "case_E2E_008",
  blocking_items:      ["VC-04"],
  conflicts_generated: [],
  // NÃO INCLUI reply_text — FB-INV-01; RR-ROUT-02
}
```

**FallbackContext:**
```
FallbackContext {
  trigger:              "contradicao_seria",
  blocking_items:       ["VC-04"],
  conflicts_generated:  [],
  attempted_reply_ref:  "turn_E2E_FB04"  // turn_id para auditoria — nunca o texto
}
```

**FallbackDecision:**
```
FallbackDecision {
  trigger:           "contradicao_seria",
  action:            "hold_for_next_turn",
  lead_state_change: "none",   // prior_lead_state já restaurado por T4.3
  facts_persisted:   []
}
```

**FallbackTrace esperado:**
```
FallbackTrace {
  turn_id:              "turn_E2E_FB04",
  trigger:              "contradicao_seria",
  action:               "hold_for_next_turn",
  error_detail:         { error_type: "silent_collision", vc_failed: "VC-04" },
  lead_state_preserved: true,   // prior_lead_state restaurado por T4.3
  facts_persisted:      [],
  stage_advanced:       false,
  response_delivered:   true,   // fallback response entregue (não o reply_text REJECT)
  attempted_reply_ref:  "turn_E2E_FB04"   // turn_id apenas
}
```

**Métricas declarativas:**
```
latency_ms:     2.750   tokens_input:  870
latency_llm_ms: 1.480   tokens_output:  88
                         tokens_total:  958
```

**Critérios PASS:**
- `FallbackTrace.trigger = "contradicao_seria"` ✓
- `FallbackTrace.action = "hold_for_next_turn"` ✓
- `reply_text` REJECT nunca entregue ao canal ✓
- `attempted_reply_ref = "turn_E2E_FB04"` (turn_id — nunca o texto) ✓
- `lead_state_preserved = true` ✓
- `stage_advanced = false` ✓
- Nenhuma promessa de aprovação na resposta de fallback ✓

---

## §6 Cenários de borda e regressão

### §6.1 E2E-BD-01 — Avanço de stage + criação de snapshot L3

**Tipo:** `borda`

**Título:** APPROVE com `ACAO_AVANÇAR_STAGE`. `current_phase` avança.
Snapshot L3 criado com `profile_summary` de campo estruturado (não de `reply_text`).

**Prior state:**
```
lead_state.facts = {
  fact_work_regime_p1:  { value: "clt",   status: "captured" },
  fact_monthly_income_p1: { value: 4200, status: "captured" },
  fact_estado_civil:    { value: "solteiro", status: "captured" },
  fact_nationality:     { value: "brasileiro", status: "captured" }
}
lead_state.operational.current_phase  = "qualification_core"
lead_state.operational.blocking_flags = []   // nenhum bloqueio ativo
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:           "turn_E2E_BD01",
  case_id:           "case_E2E_009",
  message_text:      "Ok, o que falta agora?",
  current_objective: { type: "OBJ_AVANCAR_ETAPA" }
}
```

**LLMResult (simulado):**
```
LLMResult {
  reply_text: "Você já forneceu as informações básicas de qualificação. Agora precisamos
               verificar sua documentação e renda detalhada.",
  TurnoSaida: {
    actions_requested: [
      { type: "ACAO_AVANÇAR_STAGE",
        payload: { from: "qualification_core", to: "qualification_special" } }
    ],
    snapshot_candidate: {
      profile_summary: "Lead solteiro CLT, renda R$4.200, brasileiro. Avança para qualification_special."
      // ↑ campo estruturado — NÃO derivado de reply_text (RR-L3-03 de T4_RESPOSTA_RASTRO_METRICAS)
    },
    facts_updated_candidates: [],
    confidence: 0.91
  }
}
```

**ValidationResult esperado:**
```
ValidationResult {
  decision: "APPROVE",
  checklist_results: [
    { vc: "VC-03", passed: true  },  // sem bloqueio ativo → stage advance permitido
    // todos os outros: passed
  ],
  blocking_items: [],
  safe_fields:    []
}
```

**PersistDecision esperado:**
```
PersistDecision {
  lead_state_action: "apply_full",
  actions_executed:  [{ type: "ACAO_AVANÇAR_STAGE", result: "current_phase = qualification_special" }],
  reply_routing:     "T4.4"
}
```

**TurnoRastro esperado:**
```
TurnoRastro {
  validation_result: { decision: "APPROVE" },
  persist_decision:  { lead_state_action: "apply_full", reply_routing: "T4.4" },
  reply_routing:     "T4.4",
  channel_delivery_status: "delivered"
}
```

**Snapshot L3 criado:**
```
SnapshotExecutivo {
  milestone_trigger:   "stage_advance",
  profile_summary:     "Lead solteiro CLT, renda R$4.200, brasileiro. Avança para qualification_special."
                        // ← de TurnoSaida.snapshot_candidate — NUNCA de reply_text
  confirmed_facts:     ["fact_work_regime_p1", "fact_monthly_income_p1",
                         "fact_estado_civil", "fact_nationality"],
  current_phase:       "qualification_special",
  approval_prohibited: true    // INVARIANTE
}
```

**Métricas declarativas:**
```
latency_ms:     2.320   tokens_input:  960
latency_llm_ms: 1.350   tokens_output: 108
                         tokens_total: 1.068
```

**Critérios PASS:**
- `ValidationResult.decision = "APPROVE"` ✓
- `current_phase` avançado para `qualification_special` ✓
- Snapshot L3 criado com `milestone_trigger = "stage_advance"` ✓
- `profile_summary` de `snapshot_candidate` (não de `reply_text`) ✓
- `approval_prohibited = true` no snapshot ✓
- `reply_routing = "T4.4"` ✓

---

### §6.2 E2E-BD-02 — Regressão LLM-first: VC-01 REJECT imediato

**Tipo:** `regressao`

**Título:** Teste de regressão — detecta se algum componente do orquestrador gerou
`reply_text` mecanicamente. VC-01 deve capturar e emitir REJECT imediato.

**Descrição:** Em uma implementação incorreta, o orquestrador ou o policy engine poderia
gerar `reply_text` diretamente (violação de CA-01 / A00-ADENDO-01). Este cenário verifica
que VC-01 detecta e bloqueia esse anti-padrão.

**Prior state:**
```
lead_state.operational.current_phase = "qualification_core"
```

**TurnoEntrada:**
```
TurnoEntrada {
  turn_id:      "turn_E2E_BD02",
  case_id:      "case_E2E_010",
  message_text: "Qual é o valor máximo que posso financiar?"
}
```

**LLMResult (simulado — simula produção mecânica de reply_text por mecânico como BUG):**
```
LLMResult {
  reply_text:  null,  // LLM não produziu reply_text (ou falhou)
  TurnoSaida: {
    reply_text: "O valor máximo de financiamento pelo MCMV é R$ 350.000.",
    // ↑ Este campo foi gerado pelo ORQUESTRADOR MECANICAMENTE — VIOLAÇÃO VC-01
    // (na vida real: o orquestrador nunca gera este campo — este é um cenário de regressão)
    current_objective: { type: "OBJ_INFORMAR_PRODUTO" },
    confidence: 0.88
  }
}
```

**ValidationResult esperado:**
```
ValidationResult {
  decision: "REJECT",
  checklist_results: [
    { vc: "VC-01", passed: false, severity: "critical",
      reason: "reply_text presente em output do mecânico — violação de CA-01 / A00-ADENDO-01" }
  ],
  blocking_items: ["VC-01"],
  safe_fields:    [],
  blocked_fields: []
}
```

**PersistDecision esperado:**
```
PersistDecision {
  lead_state_action: "revert",
  reply_routing:     "T4.5"
}
```

**FallbackTrace esperado:**
```
FallbackTrace {
  turn_id:              "turn_E2E_BD02",
  trigger:              "contradicao_seria",    // REJECT via VC-01
  action:               "request_reformulation",
  error_detail:         { error_type: "validation_reject", vc_failed: "VC-01" },
  lead_state_preserved: true,
  facts_persisted:      [],
  stage_advanced:       false,
  response_delivered:   true   // fallback mínimo entregue (não o reply_text mecânico)
}
```

**Métricas declarativas:**
```
latency_ms:     1.980   tokens_input:  800
latency_llm_ms:   800   tokens_output:  72
                         tokens_total:  872
```

**Critérios PASS (regressão):**
- `ValidationResult.decision = "REJECT"` ✓
- `blocking_items` contém `"VC-01"` ✓
- `reply_routing = "T4.5"` ✓
- `reply_text` mecânico **não** entregue ao canal ✓
- T4.5 entrega resposta mínima SEM usar o reply_text mecânico gerado ✓
- `lead_state_preserved = true` ✓
- **Prova de regressão:** Se VC-01 não estivesse implementado, o reply_text mecânico
  chegaria ao canal — violação de A00-ADENDO-01 detectada. ✓

---

## §7 Matriz de cobertura por artefato T4

| Artefato | Cenários que cobrem | Aspectos verificados |
|----------|---------------------|---------------------|
| **T4.1 — Entrada do turno** | PC-01..04, FB-01..04, BD-01..02 (todos) | `TurnoEntrada` shape, campos obrigatórios, `current_objective` |
| **T4.2 — Pipeline LLM** | PC-01..04, FB-01..04, BD-01..02 (todos) | `LLMResult`, `LLMResponseMeta`, `ParseError` (FB-02), campo ausente (FB-03), timeout (FB-01) |
| **T4.3 — Validação/persistência** | PC-01..04, FB-04, BD-01..02 | `ProposedStateDelta`, `PolicyDecisionSet`, VC-01..09, `PersistDecision`, `reply_routing` |
| **T4.4 — Resposta/rastro/métricas** | PC-01..03, BD-01 (T4.4); PC-04, FB-04, BD-02 (T4.5 via T4.4) | `TurnoRastro`, entrega de `reply_text`, `channel_delivery_status`, L3 snapshot |
| **T4.5 — Fallbacks** | FB-01..04, PC-04, BD-02 | `FallbackContext`, `FallbackDecision`, `FallbackTrace`, todos os 4 triggers obrigatórios |

---

## §8 Matriz de cobertura por critério CA-01..CA-09

| Critério | Descrição | Cenários PASS | Cenário de prova crítica |
|----------|-----------|---------------|--------------------------|
| **CA-01** | Orquestrador nunca gera `reply_text` | BD-02 (regressão VC-01) | BD-02: `reply_text` mecânico → REJECT |
| **CA-02** | `TurnoEntrada` com schema definido | todos os 10 cenários | PC-01: campos obrigatórios verificados |
| **CA-03** | Pipeline LLM com contrato único (1 chamada) | PC-01..04, BD-01..02 | PC-01: única chamada, `reply_text` imutável |
| **CA-04** | Policy engine integrado antes de persistir | PC-01..04, BD-01 | PC-02: R_AUTONOMO_IR dispara |
| **CA-05** | Validador executado pós-resposta/pré-persistência | PC-01..04, BD-01..02 | PC-03: VC-07 bloqueia campo |
| **CA-06** | Reconciliação executada antes de persistir | PC-01..04, BD-01 | PC-03: `ProposedStateDelta` reconciliado |
| **CA-07** | `TurnoRastro` com campos mínimos | PC-01..04, BD-01 | PC-01: TurnoRastro com 9 campos canônicos |
| **CA-08** | Fallbacks cobertos (4 cenários) | FB-01..FB-04 | FB-01 (erro_modelo), FB-02 (formato_invalido), FB-03 (omissao_campos), FB-04 (contradicao_seria) |
| **CA-09** | Bateria E2E com ≥10 cenários | **10 cenários** | §1 tabela completa |

---

## §9 Matriz de fallbacks 4/4

| # | Cenário obrigatório | Código | Trigger | Ação | Retry? | PASS |
|---|---------------------|--------|---------|------|--------|------|
| 1 | `erro_modelo` | E2E-FB-01 | LLM timeout | `retry_llm_safe` | Sim (1x) | §5.1 |
| 2 | `formato_invalido` | E2E-FB-02 | ParseError | `request_reformulation` | **Não** (FB-RETRY-01) | §5.2 |
| 3 | `omissao_campos` | E2E-FB-03 | campo ausente | `request_reformulation` | **Não** (FB-RETRY-01) | §5.3 |
| 4 | `contradicao_seria` | E2E-FB-04 | REJECT VC-04 via T4.4 | `hold_for_next_turn` | **Não** (FB-RETRY-01) | §5.4 |

**Todos os 4 cenários obrigatórios (CA-08) cobertos.** ✓

---

## §10 Métricas declarativas consolidadas

| Código | latency_ms | latency_llm_ms | tokens_input | tokens_output | tokens_total |
|--------|-----------|----------------|--------------|---------------|--------------|
| E2E-PC-01 | 2.180 | 1.240 | 840 | 96 | 936 |
| E2E-PC-02 | 2.350 | 1.380 | 920 | 105 | 1.025 |
| E2E-PC-03 | 2.520 | 1.460 | 890 | 112 | 1.002 |
| E2E-PC-04 | 2.890 | 1.510 | 850 | 98 | 948 |
| E2E-FB-01 | 33.800 | — (timeout+retry) | 200 (retry) | 28 | 228 |
| E2E-FB-02 | 1.820 | 1.600 | 880 | 140 | 1.020 |
| E2E-FB-03 | 1.650 | 1.120 | 720 | 8 | 728 |
| E2E-FB-04 | 2.750 | 1.480 | 870 | 88 | 958 |
| E2E-BD-01 | 2.320 | 1.350 | 960 | 108 | 1.068 |
| E2E-BD-02 | 1.980 | 800 | 800 | 72 | 872 |

**Nota:** Todos os valores acima são **declarativos** — representam faixas esperadas para
fins de especificação. Medição real ocorre na implementação runtime (fora do escopo desta PR).

---

## §11 Anti-padrões verificados pela bateria

| Anti-padrão | Cenário que detecta | Consequência se ocorrer |
|-------------|---------------------|------------------------|
| Orquestrador gera `reply_text` (CA-01) | E2E-BD-02 (regressão) | VC-01 → REJECT imediato |
| Promessa de aprovação em fallback | E2E-FB-01..04 | FB-INV-02 — violação |
| Avanço de stage em fallback | E2E-FB-04, PC-04 | FB-INV-03 — violação |
| Fato `confirmed` sem coleta explícita | E2E-PC-03 | VC-07 → PREVENT_PERSISTENCE |
| Colisão silenciosa não registrada | E2E-PC-04, BD-02 | VC-04 → REJECT |
| `reply_text` rejeitado usado em T4.5 | E2E-FB-04, PC-04 | FB-INV-01 — violação |
| `profile_summary` derivado de `reply_text` | E2E-BD-01 | RR-L3-03 — violação |
| Retry de fallback para `formato_invalido` | E2E-FB-02 | FB-RETRY-01 — violação |

---

## §12 Validação cruzada com T1/T2/T3/T4.1..T4.5

| Referência | Aspecto verificado | Cenários | Status |
|-----------|-------------------|----------|--------|
| `T1_CONTRATO_SAIDA §3.1` | `reply_text` soberano do LLM | PC-01..04, BD-02 | **PASS** |
| `T2_LEAD_STATE_V1 — fact_keys` | Todos os `fact_key` existem no dicionário | todos | **PASS** |
| `T2_RECONCILIACAO §5` | `ProposedStateDelta` reconciliado pré-persistência | PC-01..04 | **PASS** |
| `T2_RESUMO_PERSISTIDO §2` | L3 snapshot de `snapshot_candidate`, não de `reply_text` | BD-01 | **PASS** — RR-L3-03 |
| `T3_CLASSES_POLITICA — 5 classes` | PolicyDecision usa classes canônicas | PC-01..04, BD-01 | **PASS** |
| `T3_ORDEM §3 — pipeline 6 estágios` | PolicyDecisionSet respeita ordem de avaliação | PC-02 (R_AUTONOMO_IR) | **PASS** |
| `T3_VETO_SUAVE_VALIDADOR VC-01` | Soberania LLM — mecânico não gera `reply_text` | BD-02 | **PASS** |
| `T3_VETO_SUAVE_VALIDADOR VC-04` | Colisão silenciosa → REJECT | PC-04, FB-04 | **PASS** |
| `T3_VETO_SUAVE_VALIDADOR VC-06` | Veto suave warning sem acknowledgment → REQUIRE_REVISION | PC-02 | **PASS** |
| `T3_VETO_SUAVE_VALIDADOR VC-07` | `confirmed` sem coleta explícita → PREVENT_PERSISTENCE | PC-03 | **PASS** |
| `T4_ENTRADA_TURNO §5` | Sequência de validação V1–V6 respeitada | todos | **PASS** |
| `T4_PIPELINE_LLM LLP-INV` | `malformed → fallback imediato, nunca retry` | FB-02 | **PASS** |
| `T4_VALIDACAO_PERSISTENCIA VP-INV-09` | REJECT → `reply_routing = "T4.5"` exclusivo | PC-04, FB-04, BD-02 | **PASS** |
| `T4_RESPOSTA_RASTRO_METRICAS RR-INV-02` | `reply_text` entregue somente se `reply_routing = "T4.4"` | todos | **PASS** |
| `T4_RESPOSTA_RASTRO_METRICAS RR-L3-03` | `profile_summary` nunca de `reply_text` | BD-01 | **PASS** |
| `T4_FALLBACKS FB-INV-01` | T4.5 nunca usa `reply_text` rejeitado | PC-04, FB-01..04, BD-02 | **PASS** |
| `T4_FALLBACKS FB-INV-02` | Fallback nunca promete aprovação | FB-01..04 | **PASS** |
| `T4_FALLBACKS FB-RETRY-01` | Retry somente para `erro_modelo` | FB-01 (sim), FB-02..04 (não) | **PASS** |
| `A00-ADENDO-01` | LLM soberano; mecânico não fala | BD-02 (regressão) + todos | **PASS** |
| `A00-ADENDO-02` | Identidade MCMV; fallback mínimo | FB-01..04 | **PASS** |

---

## §13 Cobertura das microetapas do mestre

| Microetapa do mestre (T4) | Cobertura neste documento |
|--------------------------|--------------------------|
| Microetapa 1 — Entrada | Todos os cenários declaram `TurnoEntrada` completa ✓ |
| Microetapa 2 — Pipeline LLM | Todos os cenários declaram `LLMResult` e `LLMResponseMeta` ✓ |
| Microetapa 3 — Validação/persistência | Todos os cenários pipeline declaram `PolicyDecisionSet` + `ValidationResult` + `PersistDecision` ✓ |
| Microetapa 4 — Resposta/rastro | Todos os cenários pipeline declaram `TurnoRastro` ou `FallbackTrace` ✓ |
| Microetapa 5 — Fallbacks | 4 cenários FB-01..04 + PC-04 + BD-02 cobrem todos os triggers de T4.5 ✓ |
| **Microetapa 6 — Bateria E2E** | **Cobertura completa:** 10 cenários, 4 tipos, todas as microetapas, CA-01..09, métricas ✓ |

---

## Bloco E — PR-T4.6

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_BATERIA_E2E.md
PR que fecha:                          PR-T4.6 (Bateria E2E sandbox + latência/custo)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não —
                                       10 cenários declarativos (CA-09 ≥10 CUMPRIDO):
                                         4 pipeline_completo (PC-01..04);
                                         4 fallback (FB-01..04) — 1 por trigger obrigatório;
                                         1 borda (BD-01: stage advance + L3 snapshot);
                                         1 regressão (BD-02: VC-01 LLM-first);
                                       E2E-PC-03: reply_text corrigido — fala segura sem
                                         afirmar registro de campo bloqueado (VC-07);
                                         não avança para pergunta dependente do cônjuge;
                                       E2E-FB-01: latência corrigida — latency_ms=33.800ms
                                         (timeout 30.000ms + retry ~3.800ms) ≥ partial (30s);
                                       matriz de cobertura T4.1..T4.5 (§7) — 5/5 artefatos;
                                       matriz CA-01..09 — 9/9 critérios cobertos (§8);
                                       matriz de fallbacks 4/4 (§9);
                                       métricas declarativas por cenário (§10);
                                       anti-padrões verificados (§11);
                                       cross-ref T1/T2/T3/T4.1..T4.5 em 20 dimensões (§12);
                                       zero reply_text mecânico em nenhum resultado;
                                       zero fallback usando reply_text rejeitado;
                                       zero runtime/código; zero alteração em src/.
                                       Readiness G4 (T4.R): escopo de PR subsequente.
Há item parcial/inconclusivo bloqueante?: não —
                                       ≥10 cenários: CONFIRMADO (10);
                                       4 fallbacks obrigatórios: CONFIRMADO (4/4);
                                       E2E-PC-03 reply_text coerente com PREVENT_PERSISTENCE: CONFIRMADO;
                                       E2E-FB-01 latency_ms ≥ partial_latency_ms: CONFIRMADO (33.800 ≥ 30.000);
                                       zero reply_text mecânico: CONFIRMADO;
                                       zero fallback usando reply_text rejeitado: CONFIRMADO;
                                       zero runtime/integração real: CONFIRMADO;
                                       métricas declarativas presentes: CONFIRMADO.
Fechamento permitido nesta PR?:        sim —
                                       CA-09 cumprido (≥10 cenários): CONFIRMADO;
                                       CA-08 coberto (4 fallbacks): CONFIRMADO;
                                       CA-01 verificado (regressão BD-02): CONFIRMADO;
                                       E2E-PC-03 reply_text coerente: CONFIRMADO;
                                       E2E-FB-01 latência coerente: CONFIRMADO;
                                       zero reply_text mecânico: CONFIRMADO;
                                       zero runtime: CONFIRMADO.
Estado permitido após esta PR:         PR-T4.6 CONCLUÍDA; T4_BATERIA_E2E.md publicado;
                                       PR-T4.R desbloqueada.
Próximo passo autorizado:              PR-T4.R — Readiness/Closeout G4 (READINESS_G4.md)
```
