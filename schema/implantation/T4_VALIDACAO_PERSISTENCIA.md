# T4_VALIDACAO_PERSISTENCIA — Validação, Reconciliação e Decisão de Persistência — ENOVA 2

## Finalidade

Este documento define a **Etapa 4 do pipeline de turno LLM-first** da ENOVA 2: como os
candidatos de estado produzidos pelo LLM (`LLMResult.facts_updated_candidates`) passam pelo
reconciliador (T2), pelo validador pós-resposta/pré-persistência (T3.4) e pela decisão formal
de persistência antes de qualquer atualização do `lead_state`.

**Princípio canônico:**

> T4.3 decide sobre o estado — nunca sobre a fala.
> `reply_text` é imutável e não é reescrito por T4.3.
> T4.3 não entrega resposta ao canal.
> Nenhum fato vira `confirmed` sem evidência de origem auditável.
> Nenhuma colisão é silenciosa.
> `REJECT` descarta o delta completo — `reply_text` não é enviado ao canal (T4.5 responde).
> `PREVENT_PERSISTENCE` bloqueia campos específicos — `reply_text` pode ir ao canal via T4.4.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T4_PIPELINE_LLM.md` (PR-T4.2) — `LLMResult`, `LLMResponseMeta`,
  `facts_updated_candidates`, roteamento de componentes.
- `schema/implantation/T4_ENTRADA_TURNO.md` (PR-T4.1) — `ContextoTurno`, `prior_decisions`,
  `soft_vetos_ctx`, `prior_lead_state` implícito.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (PR-T3.4) — `ValidationContext`,
  `LLMResponseMeta`, `ValidationResult`, checklist VC-01..VC-09, `VetoSuaveRecord`.
- `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (PR-T3.3) — `PolicyDecisionSet`,
  pipeline 6 estágios, `CollisionRecord`.
- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — 5 classes canônicas.
- `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` (PR-T3.2) — 4 regras críticas.
- `schema/implantation/T2_RECONCILIACAO.md` (PR-T2.4) — protocolo de reconciliação 7 etapas,
  7 estados de fato, política de resolução de conflito.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens, níveis e condições
  de elevação de status.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shapes de `LeadState`, `FactEntry`,
  `ConflictRecord`, `validation_log`.

**Microetapa do mestre coberta por este artefato:**

> **Microetapa 3 — T4:** "Integrar policy engine (T3) e reconciliador (T2) antes de persistir:
> validar delta de estado, decidir sobre persistência, registrar conflitos e colisões."

**Princípios canônicos (A00-ADENDO-01, A00-ADENDO-02 e A00-ADENDO-03):**

> 1. T4.3 não produz `reply_text`, não reescreve `reply_text` e não entrega resposta ao canal.
> 2. O validador decide sobre persistência de estado — nunca sobre conteúdo de fala.
> 3. `LLMResponseMeta` pode ser usado pelo validador; `reply_text` bruto nunca é exposto a T4.3.
> 4. Toda decisão do validador deve ser registrada; decisão silenciosa é violação contratual.
> 5. Nenhum fato em `facts_updated_candidates` é persistido como `confirmed` sem política de
>    confiança (T2.3) e reconciliação (T2.4) aplicadas.

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T4 (microetapa 3)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — §2.4/§2.5, §7 CA-04/CA-05/CA-06
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## §1 Posição no pipeline do orquestrador

```
GATEWAY / CANAL
      │
      │  TurnoEntrada
      ▼
ORQUESTRADOR T4
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ Etapa 1 — Validação de entrada (T4_ENTRADA_TURNO §5)                       │
  │ Etapa 2 — Montagem de ContextoTurno (T4_ENTRADA_TURNO §6)                  │
  │      ↓  ContextoTurno inclui: prior_lead_state, PolicyDecisionSet,         │
  │         soft_vetos, history, current_objective                              │
  │ Etapa 3 — Pipeline LLM (T4_PIPELINE_LLM)                                   │
  │      ↓  Produz: LLMResult {reply_text (IMUTÁVEL), facts_updated_candidates,│
  │         confidence, next_objective_candidate, LLMResponseMeta}             │
  │                                                                             │
  │ Etapa 4 — VALIDAÇÃO + RECONCILIAÇÃO + DECISÃO DE PERSISTÊNCIA (este artefato) │
  │   4a. Construir ProposedStateDelta a partir de facts_updated_candidates     │
  │   4b. Executar reconciliação (T2.4) — detectar e registrar conflitos        │
  │   4c. Montar ValidationContext                                              │
  │   4d. Executar validador VC-01..VC-09 (T3.4)                               │
  │   4e. Emitir PersistDecision (ValidationResult)                            │
  │   4f. Aplicar PersistDecision → atualizar ou não o lead_state              │
  │   4g. Registrar ValidationResult no validation_log                         │
  │                                                                             │
  │ Etapa 5 — Resposta final + rastro + métricas (T4.4)                        │
  └────────────────────────────────────────────────────────────────────────────┘
```

**Entradas da Etapa 4:**

| Origem | Campo | Tipo |
|--------|-------|------|
| T4.2 (LLMResult) | `facts_updated_candidates` | `FactsUpdated` — candidatos LLM |
| T4.2 (LLMResult) | `LLMResponseMeta` | `LLMResponseMeta` — sinais estruturados |
| T4.2 (LLMResult) | `confidence` | `Confidence` — auto-avaliação LLM |
| T4.2 (LLMResult) | `next_objective_candidate` | `Objective?` — sugestão LLM |
| T4.1 (ContextoTurno) | `prior_lead_state` | `LeadState` — estado snapshot pré-turno |
| T4.1 (ContextoTurno) | `PolicyDecisionSet` | `PolicyDecisionSet` — engine pré-LLM |
| T4.1 (ContextoTurno) | `soft_vetos` | `VetoSuaveRecord[]` |
| T4.1 (ContextoTurno) | `current_objective` | `Objective` |

**Saídas da Etapa 4:**

| Campo | Destino |
|-------|---------|
| `lead_state_updated` (ou inalterado) | T4.4 → TurnoRastro + entrega de contexto |
| `ValidationResult` | T4.4 → TurnoRastro + rota de reply_text |
| `conflicts_registered` | T4.4 → TurnoRastro + próximo turno |
| `next_objective_resolved` | T4.4 → lead_state.operational.current_objective |

---

## §2 Construção do `ProposedStateDelta`

### 2.1 Definição

`ProposedStateDelta` é o conjunto de mudanças propostas ao `lead_state` para este turno.
É construído pelo mecânico a partir de `LLMResult` — **nunca** a partir de `reply_text` bruto.

```
ProposedStateDelta {
  // Fatos candidatos para persistência
  facts_delta:          FactDeltaEntry[]     — candidatos de fato declarados pelo LLM
  next_objective:       Objective?           — objetivo proposto (validado do candidato LLM)
  operational_updates:  OperationalUpdate?   — atualizações operacionais derivadas

  // Metadados do delta
  turn_id:              string
  case_id:              string
  derived_from:         "llm_collected"      — origem invariante neste ponto
  confidence_aggregate: "high" | "medium" | "low"  — de LLMResult.confidence
}

FactDeltaEntry {
  fact_key:       string       — chave canônica (fact_* ou derived_*)
  proposed_value: any          — valor proposto pelo LLM
  proposed_status: string      — "captured" inicialmente (NUNCA "confirmed" neste ponto)
  source:          string      — "llm_collected" (invariante — de facts_updated_candidates)
  confirmed:       boolean     — false (invariante — de facts_updated_candidates)
  prior_value?:    any         — valor anterior se existia no lead_state
  prior_status?:   string      — status anterior se existia no lead_state
  conflict_risk:   boolean     — true se contradiz prior com prior_status >= "captured"
}
```

### 2.2 Regras de construção do `ProposedStateDelta`

**VP-DELTA-01:** Todo `FactDeltaEntry` nasce com `proposed_status = "captured"` e
`confirmed = false`. Nenhum fato candidato do LLM é persistido diretamente como `confirmed`.

**VP-DELTA-02:** Apenas chaves canônicas do `T2_DICIONARIO_FATOS` são aceitas. Chave
desconhecida → `ParseError UNKNOWN_FACT_KEY` (já descartado em T4.2) — nunca chega aqui.

**VP-DELTA-03:** `next_objective_candidate` do LLM é aceito como `next_objective` no delta
somente se o tipo `OBJ_*` for canônico. Tipo inválido → campo omitido; mecânico decide.

**VP-DELTA-04:** `operational_updates` são derivações do mecânico (ex.: se LLM coletou
`fact_work_regime_p1 = "autonomo"` → derivar `derived_regime_autonomo = true`).
Derivações seguem regras de `T2_RECONCILIACAO §1.3` (RC-I1..RC-I4).

**VP-DELTA-05:** `ProposedStateDelta` nunca contém `reply_text`, `mensagem_usuario` ou
qualquer campo de fala. Violação → VC-01 FAIL → `REJECT` imediato.

---

## §3 Reconciliação antes de persistir (T2.4 integration)

### 3.1 Finalidade da reconciliação em T4.3

Antes de enviar `ProposedStateDelta` ao validador, o mecânico executa o protocolo canônico
de reconciliação (T2_RECONCILIACAO §2) para cada `FactDeltaEntry` que contradiga um fato
existente no `prior_lead_state`.

**Reconciliação responde:** "Este novo dado pode coexistir com o existente, substituí-lo
ou exige resolução explícita do lead?"

### 3.2 Protocolo de reconciliação em T4.3

Para cada `FactDeltaEntry` em `ProposedStateDelta.facts_delta`:

```
[RC-STEP-1] Verificar se fact_key existe no prior_lead_state
   │
   ├── Não existe → Novo fato → FactDeltaEntry permanece como "captured"
   │                             sem conflito; prossegue para validador.
   │
   └── Existe → Comparar proposed_value × prior_value
         │
         ├── Iguais → Sem mudança efetiva; atualizar turno de coleta se necessário.
         │
         ├── Diferentes + prior_status < "confirmed"
         │     → RC-C3 (T2_RECONCILIACAO): aceitar novo valor; prior → "obsolete";
         │       registrar turno de substituição.
         │
         └── Diferentes + prior_status = "confirmed"
               → CONFLITO FORMAL: criar ConflictRecord; definir conflict_risk = true;
                 registrar ambos os valores; fato proposto NÃO avança para "confirmed".
```

### 3.3 Shape `ConflictRecord` (conforme T2_LEAD_STATE_V1 §5.4)

```
ConflictRecord {
  conflict_id:       string        — "CONF-<fact_key>-<turn_id>"
  conflict_type:     enum          — "CONF_DADO_CONTRADITO" | "CONF_FATO_MUDOU" |
                                     "CONF_RENDA_DIFF" | "CONF_REGIME_DIFF"
  fact_key:          string        — chave afetada
  value_a:           any           — valor prior (confirmed)
  value_b:           any           — valor proposto (llm_collected)
  source_a:          string        — origem do prior
  source_b:          string        — "llm_collected"
  turn_id:           string        — turno em que o conflito surgiu
  status:            enum          — "open" | "resolved" | "acknowledged"
  resolution?:       string        — preenchido quando status = "resolved"
}
```

**VP-CONFL-01:** Todo conflito com `prior_status = "confirmed"` deve gerar `ConflictRecord`
e ser registrado em `lead_state.conflicts[]`. Conflito silencioso é violação contratual.

**VP-CONFL-02:** Campo afetado por conflito ativo → `blocked_fields` no `ValidationResult`.
O fato não é persistido como `confirmed` enquanto o conflito estiver `open`.

**VP-CONFL-03:** A resolução do conflito é escopo do turno seguinte (LLM conduz confirmação
via `OBJ_CONFIRMAR` + `R_CASADO_CIVIL_CONJUNTO` ou equivalente). T4.3 não resolve conflito —
apenas o registra e bloqueia a persistência do campo afetado.

---

## §4 Montagem do `ValidationContext`

### 4.1 Quando montar

Após reconciliação (§3), o mecânico monta o `ValidationContext` e o passa ao validador.

### 4.2 Shape (canônico — definido em T3_VETO_SUAVE_VALIDADOR §2.3)

```
ValidationContext {
  proposed_state_delta:  Partial<LeadState>   — ProposedStateDelta convertido para shape LeadState
  llm_response_meta:     LLMResponseMeta      — sinais estruturados de T4.2 §5.4
                                               (nunca inclui reply_text diretamente)
  policy_decision_set:   PolicyDecisionSet    — resultado do engine do pré-LLM (ContextoTurno)
  prior_lead_state:      LeadState            — snapshot completo antes do turno
  current_turn:          integer              — número do turno ativo
}
```

### 4.3 Regras de montagem

**VP-VC-01:** `proposed_state_delta` recebe o `ProposedStateDelta` reconciliado — nunca o
`LLMResult` diretamente.

**VP-VC-02:** `llm_response_meta` vem de T4.2 (extraído pelo mecânico de `reply_text` sem
expor o texto bruto). Contém: `contains_approval_promise`, `contains_ineligibility_claim`,
`contains_mechanical_template`, `objective_referenced`, `vetos_acknowledged`.

**VP-VC-03:** `policy_decision_set` vem de `ContextoTurno.prior_decisions` (pré-computado
antes do LLM). T4.3 usa esses resultados — **não re-executa o pipeline T3** de 6 estágios.

**VP-VC-04:** `prior_lead_state` é o snapshot do estado imediatamente antes deste turno.
Imutável durante T4.3.

**VP-VC-05:** `ValidationContext` nunca contém `reply_text` em nenhum campo. Se um campo
equivalente a `reply_text` aparecer em `proposed_state_delta` → VC-01 FAIL → `REJECT`.

---

## §5 Execução do validador VC-01..VC-09

### 5.1 Referência canônica

O checklist completo dos 9 itens está definido em `T3_VETO_SUAVE_VALIDADOR.md §2.4`.
T4.3 os executa conforme a especificação de T3.4. Esta seção documenta a integração.

### 5.2 Resumo do checklist (para referência cruzada)

| Item | Severidade | Condição de PASS | FAIL → |
|------|-----------|-----------------|--------|
| **VC-01** Soberania do LLM | critical | `proposed_state_delta` sem campos de fala | `REJECT` |
| **VC-02** Sem promessa prematura | advisory | `contains_approval_promise = false` ou fato `confirmed` sustenta | `REQUIRE_REVISION` |
| **VC-03** Sem avanço de fase com bloqueio | critical | fase não avança se `blocked_by` não vazio | `PREVENT_PERSISTENCE` de `current_phase` |
| **VC-04** Toda colisão registrada | critical | `collisions[]` cobre toda colisão detectável | `REJECT` |
| **VC-05** Confiança mínima para persistência | critical | transições de status compatíveis com origem | `PREVENT_PERSISTENCE` do(s) fato(s) |
| **VC-06** Veto suave warning reconhecido | advisory | todos os `warning` em `vetos_acknowledged[]` | `REQUIRE_REVISION` |
| **VC-07** `captured→confirmed` só por coleta explícita | critical | transição `→confirmed` com coleta explícita | `PREVENT_PERSISTENCE` do(s) fato(s) |
| **VC-08** Objetivo consistente com stage | advisory | `current_objective` coerente com `current_phase` e `decisions[]` | `REQUIRE_REVISION` |
| **VC-09** Resposta sem template rígido | advisory | `contains_mechanical_template = false` | `REQUIRE_REVISION` |

### 5.3 Ordem de execução

O validador executa os 9 itens em sequência (VC-01 → VC-09). Não há pulo de item.
Falha em item critical não interrompe os demais — todos os itens são avaliados para
rastreabilidade completa. A decisão final é calculada após todos os 9 itens.

### 5.4 Lógica de decisão agregada (T3_VETO_SUAVE_VALIDADOR §2.5)

```
se VC-01 FAIL (critical → REJECT)
   → ValidationResult.decision = "REJECT"
     (todo ProposedStateDelta descartado)

senão se VC-04 FAIL (critical → REJECT)
   → ValidationResult.decision = "REJECT"
     (colisão silenciosa detectada — integridade comprometida)

senão se algum item critical falhou com PREVENT_PERSISTENCE (VC-03, VC-05, VC-07)
   → ValidationResult.decision = "PREVENT_PERSISTENCE"
     (apenas campos em blocked_fields impedidos; safe_fields persistem)

senão se algum item advisory falhou (VC-02, VC-06, VC-08, VC-09)
   → ValidationResult.decision = "REQUIRE_REVISION"
     (safe_fields persistem; blocked_fields marcados para revisão)

senão
   → ValidationResult.decision = "APPROVE"
```

**Prioridade:** `REJECT` > `PREVENT_PERSISTENCE` > `REQUIRE_REVISION` > `APPROVE`

---

## §6 Shape `PersistDecision` e `ValidationResult`

### 6.1 `ValidationResult` — shape canônico (T3_VETO_SUAVE_VALIDADOR §2.6)

```
ValidationResult {
  decision:          enum       — "APPROVE" | "REJECT" | "REQUIRE_REVISION" | "PREVENT_PERSISTENCE"
  checklist_results: ChecklistItemResult[]
  blocking_items:    string[]   — IDs dos itens critical que falharam
  advisory_items:    string[]   — IDs dos itens advisory que falharam
  reason:            string     — justificativa legível consolidada
  safe_fields:       string[]   — caminhos de campo seguros para persistência
  blocked_fields:    string[]   — caminhos de campo bloqueados
  validation_turn:   integer
  timestamp:         datetime
}
```

### 6.2 Shape `PersistDecision` — extensão operacional de T4.3

`PersistDecision` encapsula `ValidationResult` com contexto operacional de T4.3:

```
PersistDecision {
  validation_result:    ValidationResult        — resultado completo do validador
  lead_state_action:    enum                    — "apply_full" | "apply_partial" |
                                                   "block_all" | "revert"
  fields_to_apply:      string[]               — campos aprovados para persistência
  fields_to_block:      string[]               — campos bloqueados desta persistência
  conflicts_generated:  ConflictRecord[]        — novos conflitos criados neste turno
  reply_routing:        enum                    — "T4.4" | "T4.5"
                                                  (APPROVE/REQUIRE_REVISION/PREVENT_PERSISTENCE → T4.4)
                                                  (REJECT → T4.5)
  next_objective:       Objective?              — objetivo resolvido para este turno
  turn_id:              string
  case_id:              string
  timestamp:            datetime
}
```

### 6.3 Mapeamento `ValidationResult → lead_state_action`

| `ValidationResult.decision` | `lead_state_action` | Persistência | `reply_routing` |
|-----------------------------|---------------------|--------------|-----------------|
| `APPROVE` | `apply_full` | `ProposedStateDelta` integralmente | `T4.4` |
| `REQUIRE_REVISION` | `apply_partial` | Apenas `safe_fields`; `blocked_fields` descartados | `T4.4` |
| `PREVENT_PERSISTENCE` | `block_all` ou `apply_partial` | Campos em `blocked_fields` não persistidos; `safe_fields` aplicados | `T4.4` |
| `REJECT` | `revert` | Delta descartado; `lead_state` revertido ao `prior_lead_state` | `T4.5` |

---

## §7 Regras de `safe_fields` e `blocked_fields`

### 7.1 Determinação de `safe_fields`

Um campo de `ProposedStateDelta` entra em `safe_fields` quando **todas** as condições:

1. Não houve falha de item critical no validador para este campo especificamente.
2. A transição de status é compatível com a política de confiança (T2_POLITICA_CONFIANCA §3):
   - `source = "llm_collected"` → `proposed_status = "captured"` (nunca `"confirmed"`)
   - `source = "EXPLICIT_TEXT"` verificado no histórico → pode atingir `"confirmed"` (VC-07)
3. Nenhum conflito `open` está ativo para este `fact_key`.
4. A chave é canônica (T2_DICIONARIO_FATOS).

### 7.2 Determinação de `blocked_fields`

Um campo entra em `blocked_fields` quando qualquer das condições:

| Condição | Item que bloqueia |
|----------|------------------|
| Transição `→confirmed` sem coleta explícita | VC-07 |
| Confiança abaixo do limiar para o nível proposto | VC-05 |
| Conflito `open` ativo para o `fact_key` | VP-CONFL-02 |
| Avanço de fase com `blocked_by` não vazio | VC-03 |
| `proposed_state_delta` contém campo de fala | VC-01 → campo e `REJECT` total |

### 7.3 Elevação de status — regra canônica

```
facts_updated_candidates (source="llm_collected")
       │
       ▼ Reconciliação (§3)
       │
       ▼ Sem conflito + sem VC-05/VC-07 FAIL?
       │
       └── sim → persiste como "captured" (VP-DELTA-01)
       └── não → blocked_field; permanece em prior_status ou gera conflito

Para atingir "confirmed" em turno futuro:
  - Lead deve confirmar explicitamente via OBJ_CONFIRMAR
  - Origem deve ser EXPLICIT_TEXT ou DOCUMENT_VERIFIED
  - VC-07 PASS exigido
```

**VP-STATUS-01:** `source = "llm_collected"` nunca resulta diretamente em `status = "confirmed"`.
O mecânico persiste como `"captured"` — confirmação é escopo de turno subsequente.

**VP-STATUS-02:** Tentativa de elevar `inferred → confirmed` sem coleta explícita → VC-07
FAIL → `PREVENT_PERSISTENCE` do campo afetado.

---

## §8 Tratamento de conflitos e colisões em T4.3

### 8.1 Conflitos de fato

Conflitos surgem quando `ProposedStateDelta` contradiz um fato `confirmed` no `prior_lead_state`.

**Processo em T4.3:**

```
[1] Conflito detectado na reconciliação (§3.2)
[2] ConflictRecord criado com conflict_id, tipo, valores A e B, origens, turno
[3] ConflictRecord adicionado a lead_state.conflicts[] SE ValidationResult ≠ REJECT
    (REJECT descarta o delta — conflito registrado apenas em TurnoRastro)
[4] fact_key afetada → blocked_fields (VC-07 acionado)
[5] ValidationResult.blocked_fields inclui o campo
[6] Próximo turno: OBJ_CONFIRMAR gerado pelo mecânico para resolução
```

**VP-CONFL-04:** Se `ValidationResult = REJECT`, os `ConflictRecord` não são persistidos
no `lead_state` (delta descartado). São registrados no `TurnoRastro` para auditoria.

### 8.2 Colisões de política

Colisões são conflitos entre `PolicyDecision` do `policy_decision_set` (T3.3 §5).

**Integração em T4.3:**

- Colisões já foram detectadas pelo policy engine no pré-LLM (T3_ORDEM_AVALIACAO §5).
- VC-04 verifica que `policy_decision_set.collisions[]` cobre toda colisão detectável no delta.
- Se T4.3 detecta colisão não registrada → VC-04 FAIL → `REJECT`.

**VP-COL-01:** Toda colisão detectável pelo validador no `proposed_state_delta` deve estar
em `policy_decision_set.collisions[]`. Ausência → `REJECT` imediato.

**VP-COL-02:** Colisão silenciosa (detectada mas não registrada) é violação de RC-INV-03
(T3_ORDEM_AVALIACAO_COMPOSICAO). T4.3 herda e aplica este invariante.

---

## §9 Aplicação da `PersistDecision` ao `lead_state`

### 9.1 Etapa 4f — Execução da decisão de persistência

Após emissão de `ValidationResult` e construção de `PersistDecision`:

**Caso `APPROVE` (`apply_full`):**
```
Para cada FactDeltaEntry em ProposedStateDelta.facts_delta:
  lead_state.facts[fact_key] = {
    value:     proposed_value,
    status:    "captured",           // VP-STATUS-01: LLM-collected nunca vira confirmed
    confirmed: false,
    source:    "llm_collected",
    turn:      current_turn
  }
Para next_objective (se presente e canônico):
  lead_state.operational.current_objective = next_objective
ValidationResult registrado em lead_state.validation_log
```

**Caso `REQUIRE_REVISION` (`apply_partial`):**
```
Para cada campo em safe_fields:
  aplicar campo ao lead_state conforme acima
Para cada campo em blocked_fields:
  NOT persistido — campo permanece no prior_lead_state
  (se era novo: não inserido; se existia: valor prior mantido)
ValidationResult registrado em lead_state.validation_log com advisory_items
```

**Caso `PREVENT_PERSISTENCE` (`block_all` ou `apply_partial`):**
```
Campos específicos em blocked_fields: NOT persistidos
safe_fields (se houver): aplicados
Se todos os campos estão em blocked_fields → lead_state inalterado
ValidationResult registrado em lead_state.validation_log com blocking_items
```

**Caso `REJECT` (`revert`):**
```
lead_state ← prior_lead_state  (snapshot pré-turno — rollback completo)
ProposedStateDelta descartado integralmente
ConflictRecord(s) NÃO inseridos em lead_state (descarte total do delta)
ValidationResult registrado em lead_state.validation_log com blocking_items
reply_routing = "T4.5" → pipeline aciona fallback T4.5 sem reescrever reply_text
```

### 9.2 Registro no `validation_log`

`validation_log` (campo de `lead_state`) recebe entrada para cada turno com ValidationResult:

```
ValidationLogEntry {
  turn_id:          string
  decision:         enum          — "APPROVE" | "REJECT" | "REQUIRE_REVISION" | "PREVENT_PERSISTENCE"
  blocking_items:   string[]
  advisory_items:   string[]
  safe_fields:      string[]
  blocked_fields:   string[]
  reason:           string
  timestamp:        datetime
}
```

`validation_log` é somente para rastreabilidade — não afeta a lógica do engine em rodadas futuras.

---

## §10 `reply_text` não reescrito — T4.3 não entrega ao canal

### 10.1 Declaração formal

> **T4.3 não lê, não reescreve e não entrega `reply_text`.**
> `reply_text` capturado em T4.2 é imutável. T4.3 decide apenas sobre estado.

### 10.2 Separação formal

| Componente de T4.3 | Acessa `reply_text` bruto? | Modifica `reply_text`? | Entrega ao canal? |
|-------------------|---------------------------|----------------------|-------------------|
| Reconciliador (§3) | **Não** | **Não** | **Não** |
| Montagem de `ValidationContext` (§4) | **Não** | **Não** | **Não** |
| Validador VC-01..VC-09 (§5) | **Não** — usa `LLMResponseMeta` | **Não** | **Não** |
| Aplicação de `PersistDecision` (§9) | **Não** | **Não** | **Não** |
| `validation_log` (§9.2) | **Não** | **Não** | **Não** |

### 10.3 Rota de `reply_text` após T4.3

A rota de `reply_text` é determinada por `PersistDecision.reply_routing`:

- `APPROVE` / `REQUIRE_REVISION` / `PREVENT_PERSISTENCE` → `reply_routing = "T4.4"` → T4.4 entrega ao canal.
- `REJECT` → `reply_routing = "T4.5"` → T4.5 aciona fallback → `reply_text` não é enviado.

Em nenhum caso T4.3 produz texto de resposta. T4.3 produz apenas `PersistDecision`.

---

## §11 Quando `lead_state` pode ser atualizado

### 11.1 Condições suficientes para atualização

`lead_state` pode ser atualizado (total ou parcialmente) quando:

1. `ValidationResult.decision = "APPROVE"` → atualização completa.
2. `ValidationResult.decision = "REQUIRE_REVISION"` → apenas `safe_fields`.
3. `ValidationResult.decision = "PREVENT_PERSISTENCE"` → apenas `safe_fields` (se houver).

### 11.2 Condições em que `lead_state` permanece intacto

`lead_state` **não é atualizado** (revertido ao `prior_lead_state`) quando:

1. `ValidationResult.decision = "REJECT"` → rollback completo.
2. Todos os campos do delta estão em `blocked_fields` com `PREVENT_PERSISTENCE` → nenhuma atualização.

### 11.3 Invariante de nenhum fato `confirmed` de origem LLM

**VP-INV-01:** Nenhum fato com `source = "llm_collected"` pode ser persistido com
`status = "confirmed"` ou `confirmed = true` em T4.3. A elevação para `confirmed` requer:
- Turno de confirmação explícita (OBJ_CONFIRMAR);
- Origem ≥ EXPLICIT_TEXT;
- VC-07 PASS no turno de confirmação.

---

## §12 Regras invioláveis (VP-INV-01..VP-INV-12)

| Código | Regra |
|--------|-------|
| **VP-INV-01** | Nenhum `FactDeltaEntry` com `source = "llm_collected"` é persistido como `confirmed`. Status máximo em T4.3: `"captured"`. |
| **VP-INV-02** | T4.3 não produz, não lê e não reescreve `reply_text`. Toda menção a `reply_text` em `ProposedStateDelta` → VC-01 FAIL → `REJECT`. |
| **VP-INV-03** | T4.3 não entrega resposta ao canal. Entrega é exclusiva de T4.4 (ou T4.5 em REJECT). |
| **VP-INV-04** | Toda colisão detectável no delta deve estar em `policy_decision_set.collisions[]`. Colisão silenciosa → VC-04 FAIL → `REJECT`. |
| **VP-INV-05** | Todo conflito de fato `confirmed` detectado na reconciliação gera `ConflictRecord` e bloqueia o campo afetado. Conflito silencioso é violação contratual. |
| **VP-INV-06** | `ValidationContext` nunca contém `reply_text` bruto. Apenas `LLMResponseMeta` carrega sinais derivados da resposta. |
| **VP-INV-07** | O validador VC-01..VC-09 é executado em sua totalidade. Pular item é não conformidade. |
| **VP-INV-08** | `REJECT` descarta o `ProposedStateDelta` integralmente e reverte `lead_state` ao `prior_lead_state`. Descarte parcial em REJECT é proibido. |
| **VP-INV-09** | `PersistDecision.reply_routing = "T4.5"` é exclusivo de `REJECT`. Para os demais resultados, `reply_routing = "T4.4"`. |
| **VP-INV-10** | T4.3 não re-executa o pipeline de 6 estágios do policy engine (T3.3). Usa o `PolicyDecisionSet` pré-computado do `ContextoTurno`. |
| **VP-INV-11** | Toda decisão do validador é registrada em `validation_log`. Decisão sem registro é violação contratual. |
| **VP-INV-12** | `next_objective` proposto pelo LLM (`next_objective_candidate`) só entra no `lead_state` se VC-08 PASS e tipo `OBJ_*` for canônico. |

---

## §13 Anti-padrões proibidos

| Código | Anti-padrão | Violação |
|--------|-------------|---------|
| **AP-VP-01** | Persistir `facts_updated_candidates` diretamente no `lead_state` sem passar por reconciliação (§3) e validador (§5) | VP-INV-01; T2_RECONCILIACAO §2 |
| **AP-VP-02** | Elevar `status = "confirmed"` para fato com `source = "llm_collected"` | VP-INV-01; VC-07; T2_POLITICA_CONFIANCA §3 |
| **AP-VP-03** | Expor `reply_text` bruto ao validador VC-01..VC-09 | VP-INV-06; LLP-INV-11 (T4.2) |
| **AP-VP-04** | Reescrever ou substituir `reply_text` em T4.3 baseado em resultado de validação | VP-INV-02; LLP-INV-05 (T4.2); A00-ADENDO-01 |
| **AP-VP-05** | Assumir que `PREVENT_PERSISTENCE` e `REJECT` têm o mesmo comportamento para `reply_text` | VP-INV-09; §10.3 |
| **AP-VP-06** | Ignorar colisão em `policy_decision_set.collisions[]` sem registrar em VC-04 | VP-INV-04; T3_ORDEM_AVALIACAO §5 RC-INV-03 |
| **AP-VP-07** | Re-executar o pipeline T3 de 6 estágios em T4.3 para re-avaliar decisões pós-LLM | VP-INV-10; escopo T3 encerrado |
| **AP-VP-08** | Permitir conflito silencioso (fato `confirmed` contradito sem gerar `ConflictRecord`) | VP-INV-05; T2_RECONCILIACAO §2 |
| **AP-VP-09** | Pular validador VC-01..VC-09 quando `ValidationContext` está "obviamente correto" | VP-INV-07; A00-ADENDO-03 |
| **AP-VP-10** | Adicionar `reply_text` a `validation_log` como evidência de validação | VP-INV-06; A00-ADENDO-01 |
| **AP-VP-11** | Aceitar `next_objective_candidate` do LLM sem verificar canonicidade de `OBJ_*` | VP-INV-12; T1_TAXONOMIA_OFICIAL |
| **AP-VP-12** | Entregar `reply_text` ao canal quando `ValidationResult = REJECT` | VP-INV-09; T4_PIPELINE_LLM §10.3 |

---

## §14 Exemplos sintéticos

### E1 — APPROVE completo: lead CLT, renda coletada, sem conflito

**Situação:** Lead confirmou renda `3200` neste turno (EXPLICIT_TEXT, turno de confirmação).

**ProposedStateDelta:**
```
facts_delta: [
  { fact_key: "fact_monthly_income_p1", proposed_value: 3200,
    proposed_status: "captured", source: "llm_collected", confirmed: false }
]
next_objective: { type: "OBJ_CONFIRMAR", target: "fact_monthly_income_p1" }
```

**Reconciliação:** `fact_monthly_income_p1` ausente em `prior_lead_state` → novo fato, sem conflito.

**ValidationContext:**
```
proposed_state_delta: { facts.fact_monthly_income_p1: { value: 3200, status: "captured" } }
llm_response_meta: { contains_approval_promise: false, contains_ineligibility_claim: false,
                     contains_mechanical_template: false, objective_referenced: "OBJ_CONFIRMAR" }
policy_decision_set: { decisions: [{ class: "obrigação", rule: "R_RENDA_COLETA", ... }] }
```

**Validador:** VC-01 PASS / VC-02 PASS / VC-03 PASS / VC-04 PASS / VC-05 PASS (captured, não confirmed) / VC-06 PASS / VC-07 PASS / VC-08 PASS / VC-09 PASS

**PersistDecision:** `APPROVE` → `apply_full` → `reply_routing = "T4.4"`.

**Resultado:** `lead_state.facts.fact_monthly_income_p1 = { value: 3200, status: "captured" }`.
`reply_text` vai para T4.4 e é entregue ao canal.

---

### E2 — REQUIRE_REVISION: veto suave não reconhecido (VC-06 advisory FAIL)

**Situação:** Lead autônomo sem IR. `soft_vetos` inclui VS-R_AUTONOMO_IR com severity="warning".
LLM não reconheceu o veto (`vetos_acknowledged = []`).

**ValidationContext:**
```
llm_response_meta: { vetos_acknowledged: [] }
policy_decision_set: { soft_vetos: [{ veto_id: "VS-R_AUTONOMO_IR-05", severity: "warning" }] }
```

**Validador:** VC-06 FAIL (advisory) → `REQUIRE_REVISION`.

**PersistDecision:**
```
decision: REQUIRE_REVISION
safe_fields: ["facts.fact_monthly_income_p1", "facts.fact_work_regime_p1"]
blocked_fields: []  // VC-06 advisory não bloqueia campos específicos
advisory_items: ["VC-06"]
reply_routing: "T4.4"
```

**Resultado:** `safe_fields` aplicados ao `lead_state`. `reply_text` entregue ao canal via T4.4.
`validation_log` registra REQUIRE_REVISION com advisory_items = ["VC-06"]. Veto persiste para próximo turno.

---

### E3 — PREVENT_PERSISTENCE: tentativa de `captured→confirmed` indevida (VC-07 critical FAIL)

**Situação:** LLM propôs `fact_estado_civil = "casado_civil"` com `status: "confirmed"` diretamente
(não houve OBJ_CONFIRMAR explícito neste turno).

**Reconciliação:** `fact_estado_civil` existia como `"solteiro"` (status: "captured"). Proposta diferente
de prior → conflito detectado; `conflict_risk = true`.

**ValidationContext:**
```
proposed_state_delta: { facts.fact_estado_civil: { value: "casado_civil", status: "confirmed" } }
// (status "confirmed" indevido — VP-STATUS-01 seria violado)
```

**Validador:** VC-07 FAIL (critical → `PREVENT_PERSISTENCE` de `fact_estado_civil`).

**PersistDecision:**
```
decision: PREVENT_PERSISTENCE
safe_fields: [outros campos sem conflito]
blocked_fields: ["facts.fact_estado_civil"]
blocking_items: ["VC-07"]
conflicts_generated: [ConflictRecord { fact_key: "fact_estado_civil", value_a: "solteiro", value_b: "casado_civil" }]
reply_routing: "T4.4"
```

**Resultado:** `fact_estado_civil` NÃO atualizado. `ConflictRecord` inserido em `lead_state.conflicts[]`.
`reply_text` entregue ao canal via T4.4. Próximo turno: `OBJ_CONFIRMAR` para `fact_estado_civil`.

---

### E4 — REJECT: colisão silenciosa detectada pelo VC-04

**Situação:** LLM propôs dois objetivos de roteamento contraditórios. `policy_decision_set.collisions[]`
está vazio (policy engine não registrou a colisão).

**Validador:** VC-04 FAIL (critical → `REJECT`).

**PersistDecision:**
```
decision: REJECT
lead_state_action: revert
blocking_items: ["VC-04"]
reply_routing: "T4.5"
```

**Resultado:**
- `lead_state` revertido ao `prior_lead_state`.
- `ProposedStateDelta` descartado integralmente.
- `reply_text` capturado em T4.2 **não entregue ao canal** — permanece imutável no TurnoRastro.
- Pipeline aciona T4.5 para produção de resposta de fallback.

---

### E5 — APPROVE parcial: fato com confiança baixa bloqueado, outro aprovado (VC-05)

**Situação:** LLM coletou dois fatos. `fact_monthly_income_p1` via INDIRECT_TEXT (confiança baixa);
`fact_customer_goal` via EXPLICIT_TEXT (confiança alta). LLM propôs ambos como "captured".

**Validador:** VC-05 verifica confiança mínima para persistência.
- `fact_monthly_income_p1`: INDIRECT_TEXT → `captured` OK (não está tentando ir para `confirmed`).
- Porém, `confidence_aggregate = "low"` combinado com fato crítico de renda → VC-05 aplica limiar mínimo.
- `fact_customer_goal`: EXPLICIT_TEXT → PASS sem restrição.

*(Nota: VC-05 FAIL por confiança abaixo do limiar → PREVENT_PERSISTENCE do campo afetado, não REJECT)*

**PersistDecision:**
```
decision: PREVENT_PERSISTENCE
safe_fields: ["facts.fact_customer_goal"]
blocked_fields: ["facts.fact_monthly_income_p1"]
blocking_items: ["VC-05"]
reply_routing: "T4.4"
```

**Resultado:** `fact_customer_goal` aplicado. `fact_monthly_income_p1` não persistido neste turno.
`reply_text` entregue via T4.4. Próximo turno: recoleta confirmada de `fact_monthly_income_p1`.

---

## §15 Cobertura das microetapas do mestre

| Microetapa do mestre (T4) | Cobertura neste documento |
|--------------------------|--------------------------|
| Microetapa 1 — Padronizar entrada | Escopo T4_ENTRADA_TURNO.md (PR-T4.1) — não coberta aqui |
| Microetapa 2 — Pipeline LLM | Escopo T4_PIPELINE_LLM.md (PR-T4.2) — não coberta aqui |
| **Microetapa 3 — Integrar policy engine + reconciliador antes de persistir** | **Cobertura completa:** §2 (ProposedStateDelta), §3 (reconciliação T2.4), §4 (ValidationContext), §5 (validador VC-01..09), §6 (PersistDecision), §7 (safe_fields/blocked_fields), §8 (conflitos/colisões), §9 (aplicação), §10 (reply_text não reescrito), §11 (quando atualizar) ✓ |
| Microetapa 4 — Resposta + rastro | Escopo T4_RESPOSTA_RASTRO_METRICAS.md (PR-T4.4) — não coberta aqui |
| Microetapa 5 — Fallbacks | Escopo T4_FALLBACKS.md (PR-T4.5) — não coberta aqui |

---

## §16 Validação cruzada com T2/T3/T4.1/T4.2

| Referência cruzada | Campo/ponto verificado | Status |
|-------------------|----------------------|--------|
| `T2_LEAD_STATE_V1.md §4.3` | `FactEntry` shape; status canônicos; `confirmed = false` para `llm_collected` | **PASS** — VP-DELTA-01, VP-STATUS-01 |
| `T2_POLITICA_CONFIANCA.md §3` | Origens e status máximo atingível; INDIRECT_TEXT → `captured`; `llm_collected` → `captured` | **PASS** — §7.1, VP-STATUS-01/02 |
| `T2_RECONCILIACAO.md §2` | Protocolo de reconciliação 7 etapas; RC-C3 (captura posterior); tipologia de conflito | **PASS** — §3.2 integra protocolo |
| `T2_RECONCILIACAO.md §4.4` | Fato `confirmed` contradito → `ConflictRecord`; sem sobrescrita silenciosa | **PASS** — VP-CONFL-01/02/03 |
| `T3_CLASSES_POLITICA.md §7` | Prioridade entre classes; bloqueio impede avanço de fase | **PASS** — VC-03 via §5.2 |
| `T3_ORDEM_AVALIACAO_COMPOSICAO.md §5` | RC-INV-03: colisão nunca silenciosa; `collisions[]` obrigatório | **PASS** — VP-INV-04, VP-COL-01/02 |
| `T3_ORDEM_AVALIACAO_COMPOSICAO.md §6` | `PolicyDecisionSet` shape com `decisions[]`, `collisions[]`, `soft_vetos[]` | **PASS** — §4.3, VP-VC-03 |
| `T3_VETO_SUAVE_VALIDADOR.md §2.3` | `ValidationContext` e `LLMResponseMeta` shapes canônicos | **PASS** — §4.2 integra shapes |
| `T3_VETO_SUAVE_VALIDADOR.md §2.4` | VC-01..VC-09 completos com severidade e ação de FAIL | **PASS** — §5.2 tabela resumo |
| `T3_VETO_SUAVE_VALIDADOR.md §2.5` | Lógica de decisão agregada REJECT > PREVENT > REVISION | **PASS** — §5.4 integra lógica |
| `T3_VETO_SUAVE_VALIDADOR.md §2.6` | `ValidationResult` shape canônico | **PASS** — §6.1 integra shape |
| `T3_VETO_SUAVE_VALIDADOR.md §2.7` | Efeitos em `lead_state` por decisão | **PASS** — §9.1 integra efeitos |
| `T4_ENTRADA_TURNO.md §6.4` | `ContextoTurno` contém `prior_decisions` + `soft_vetos` + `prior_lead_state` implícito | **PASS** — §1 tabela entradas |
| `T4_PIPELINE_LLM.md §5.4` | `LLMResponseMeta` extraído pelo mecânico; nunca expõe `reply_text` bruto | **PASS** — VP-VC-02, VP-INV-06 |
| `T4_PIPELINE_LLM.md §10.3` | REJECT → `reply_text` não entregue ao canal → T4.5 | **PASS** — VP-INV-09, §10.3 |
| `T4_PIPELINE_LLM.md LLP-INV-11` | Validador nunca recebe `reply_text` bruto | **PASS** — §10.2, VP-INV-06 |
| `A00-ADENDO-01` | LLM soberano na fala; T4.3 não reescreve nem entrega reply_text | **PASS** — VP-INV-02/03; §10.1 |
| `A00-ADENDO-02` | Orquestrador como coordenador; T4.3 conecta, não invade papéis de T2/T3 | **PASS** — VP-INV-10; §5.3 |

---

## Bloco E — PR-T4.3

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_VALIDACAO_PERSISTENCIA.md
PR que fecha:                          PR-T4.3 (Validação policy engine + reconciliação antes de persistir)
Estado da evidência:                   completa
Há lacuna remanescente?:               não —
                                       ProposedStateDelta com regras de construção (§2);
                                       reconciliação T2.4 integrada (§3) com ConflictRecord;
                                       ValidationContext montagem (§4) com LLMResponseMeta;
                                       validador VC-01..09 executado em totalidade (§5);
                                       PersistDecision + ValidationResult shapes (§6);
                                       safe_fields / blocked_fields regras (§7);
                                       conflitos (§8.1) e colisões (§8.2) não silenciosos;
                                       aplicação por decisão APPROVE/REQUIRE_REVISION/
                                       PREVENT_PERSISTENCE/REJECT (§9);
                                       reply_text não reescrito + T4.3 não entrega ao canal (§10);
                                       quando lead_state atualizado (§11);
                                       VP-INV-01..12; 12 anti-padrões AP-VP;
                                       5 exemplos sintéticos E1–E5;
                                       microetapa 3 coberta; cross-ref T2/T3/T4.1/T4.2 em 18
                                       dimensões. Resposta/rastro (T4.4) e fallbacks (T4.5)
                                       são escopos de PRs subsequentes — não são lacunas.
Há item parcial/inconclusivo bloqueante?: não —
                                       T4.3 não reescreve reply_text (VP-INV-02);
                                       colisão nunca silenciosa (VP-INV-04);
                                       fato confirmed jamais de source llm_collected (VP-INV-01);
                                       REJECT descarta delta e aciona T4.5 (VP-INV-08/09);
                                       zero runtime implementado; zero alteração em src/.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.3 CONCLUÍDA; T4_VALIDACAO_PERSISTENCIA.md publicado;
                                       PR-T4.4 desbloqueada.
Próxima PR autorizada:                 PR-T4.4 — Resposta final + rastro + métricas
```
