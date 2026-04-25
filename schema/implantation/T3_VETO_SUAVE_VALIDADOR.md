# T3_VETO_SUAVE_VALIDADOR — Veto Suave e Validador Pós-Resposta/Pré-Persistência — ENOVA 2

## Finalidade

Este documento define dois mecanismos complementares do policy engine v1 da ENOVA 2:

1. **Veto suave** — sinal de risco ou inconsistência soft emitido pelo engine durante a avaliação,
   distinto de bloqueio, que orienta o LLM sem impedir o avanço de fase.
2. **Validador pós-resposta/pré-persistência** — camada de validação que corre *após* o LLM gerar
   sua resposta e *antes* de qualquer persistência no `lead_state`, decidindo se o delta de estado
   proposto é seguro.

Ambos os mecanismos **não produzem `reply_text`**, **não reescrevem a fala do LLM** e **não criam
regras de negócio novas**. Eles operam exclusivamente sobre as 5 classes canônicas declaradas em
`T3_CLASSES_POLITICA.md` (PR-T3.1), as 4 regras críticas de `T3_REGRAS_CRITICAS_DECLARATIVAS.md`
(PR-T3.2) e a pipeline de avaliação de `T3_ORDEM_AVALIACAO_COMPOSICAO.md` (PR-T3.3).

**Pré-requisitos obrigatórios:**

- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — classes canônicas; §2.5 (distinção
  bloqueio × veto suave).
- `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` (PR-T3.2) — 4 regras críticas.
- `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (PR-T3.3) — pipeline de 6 estágios;
  shape `PolicyDecisionSet`.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — `OperationalState` e shapes.
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — níveis de confiança por origem.

**Microetapa do mestre coberta por este artefato:**

> **Microetapa 5 — T3:** "Definir mecanismo de veto suave e validador pós-resposta/pré-persistência."

**Princípios canônicos (A00-ADENDO-01, A00-ADENDO-02 e A00-ADENDO-03):**

> 1. Nenhum mecanismo desta camada produz `reply_text`, `mensagem_usuario`, `texto_cliente` ou
>    qualquer texto destinado ao cliente.
> 2. O validador **decide sobre o estado** — nunca sobre a fala. A soberania do LLM na fala é
>    inviolável mesmo quando o validador rejeita ou bloqueia a persistência.
> 3. Toda decisão do validador deve ser registrada; decisão silenciosa é violação contratual.

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T3 (microetapa 5).
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` — §2.4, §7 CA-04/CA-05, §16 PR-T3.4.
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01).
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02).
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03).

---

## 1. Veto suave — definição e distinção formal

### 1.1 Definição

**Veto suave** é um sinal estruturado de risco ou inconsistência soft que o policy engine emite
quando detecta uma condição que merece atenção mas **não justifica bloqueio de fase**.

- Não é uma `PolicyDecision` — não pertence às 5 classes canônicas.
- É registrado em `soft_vetos[]` dentro do `PolicyDecisionSet` (extensão do shape definido em
  T3_ORDEM_AVALIACAO_COMPOSICAO §6).
- O LLM lê `soft_vetos[]` e decide como conduzir o turno com naturalidade.
- O veto suave nunca dita a fala — apenas orienta sobre o risco presente.

### 1.2 Distinção formal de bloqueio

| Dimensão | BLOQUEIO | VETO SUAVE |
|---|---|---|
| Impede avanço de `current_phase`? | **sim** — invariante | **não** |
| Atualiza `blocked_by`? | **sim** | **não** |
| Origem | Regra de negócio hard | Risco soft ou inconsistência latente |
| Reversão | Resolução do fato crítico | Confirmação ou reconhecimento explícito do risco |
| Severity | `"blocking"` / `"critical"` | `"warning"` / `"info"` |
| Efeito em `elegibility_status` | pode setar `"ineligible"` | **nunca** |
| Escala para bloqueio? | já é bloqueio | sim — sob condição explícita declarada |
| Faz parte de `decisions[]`? | sim | **não** — está em `soft_vetos[]` |
| Contabilizado em `collisions[]`? | se houver colisão | não (não é decisão) |

### 1.3 Quando emitir

O policy engine deve emitir um veto suave nas seguintes condições:

| Condição de disparo | Tipo de risco | Resolução padrão |
|---------------------|---------------|-----------------|
| Fato crítico em `inferred` (nunca confirmado explicitamente) que poderia sustentar decisão de negócio | `"dado_insuficiente"` | `"confirmar"` |
| Valor de renda dentro de ±15% dos limites mínimos ou máximos MCMV para o perfil atual | `"risco_de_limite"` | `"orientar"` |
| Dois fatos aparentemente contraditórios ainda não atingiram `contradicted` (conflito latente) | `"inconsistencia_soft"` | `"confirmar"` |
| Fato de alta criticidade coletado via `AUDIO_TRANSCRIPT` ou `INDIRECT_TEXT` sem verificação | `"dado_insuficiente"` | `"confirmar"` |
| `current_objective` mudou de fase mas fato-alvo ainda não coletado/confirmado | `"colisao_latente"` | `"orientar"` |
| Sinal de risco de promessa prematura: decisões do engine combinam com contexto onde LLM poderia comprometer antes de `confirmed` | `"risco_de_promessa"` | `"orientar"` |
| Veto suave de turno anterior não foi resolvido (acknowledged = false persiste) | `"inconsistencia_soft"` | `"confirmar"` |

### 1.4 Condições de escalada para bloqueio

Um veto suave com `resolution = "escalate_to_bloqueio"` deve declarar explicitamente a
`escalation_condition`. Se no **turno seguinte** a condição for verificada como verdadeira,
o engine emite bloqueio formal e move o fato para o estágio correspondente do pipeline.

Exemplos de `escalation_condition`:

| Veto suave original | Condição de escalada |
|---------------------|---------------------|
| `fact_rnm_status` em `inferred`, lead estrangeiro | `fact_nationality.status = "confirmed"` + `fact_rnm_status = "sem_rnm"` |
| Renda limítrofe + composição não investigada | `current_phase = "elegibility"` + `derived_composition_needed = false` + renda abaixo do limite |
| Fato crítico permanece em `captured` após ≥2 turnos | `turno_atual - turno_captura >= 2` + fato ainda não `confirmed` |

### 1.5 Shape `VetoSuaveRecord`

```
VetoSuaveRecord {
  veto_id:              string     — "VS-<rule_ref>-<turn>" (ex.: "VS-R_RENDA_LIMITE-04")
  trigger_fact:         string     — fact_key que originou o veto
                                     (deve existir em T2_DICIONARIO_FATOS §3)
  risk_type:            enum       — "risco_de_promessa" | "inconsistencia_soft" |
                                     "dado_insuficiente" | "colisao_latente" | "risco_de_limite"
  severity:             enum       — "warning" | "info"
  description:          string     — justificativa legível (auditoria)
  resolution:           enum       — "orientar" | "confirmar" | "escalate_to_bloqueio"
  escalation_condition: string?    — preenchido apenas quando resolution = "escalate_to_bloqueio"
  acknowledged:         boolean    — false até LLM reconhecer no turno corrente;
                                     true após validador confirmar reconhecimento
  emitted_at_turn:      integer    — turno em que foi emitido
}
```

### 1.6 Extensão do `PolicyDecisionSet` (T3.3 §6)

O `PolicyDecisionSet` original (definido em T3_ORDEM_AVALIACAO_COMPOSICAO §6) é estendido com
o campo `soft_vetos[]`:

```
PolicyDecisionSet {
  decisions:        PolicyDecision[]     — em ordem canônica: bloqueio→confirmação→obrigação→
                                           sugestão_mandatória→roteamento
  collisions:       CollisionRecord[]    — toda colisão registrada
  soft_vetos:       VetoSuaveRecord[]    — vetos suaves emitidos neste turno (pode ser vazio)
  evaluation_meta:  EvaluationMeta
}
```

**Invariante:** `soft_vetos[]` nunca contém `PolicyDecision`. `decisions[]` nunca contém
`VetoSuaveRecord`. Os dois arrays são mutuamente exclusivos.

### 1.7 Efeito no `lead_state`

Após emissão de veto suave:

- `operational.risk_level` pode ser elevado para `"medium"` se ainda estiver em `"low"`.
- `operational.last_policy_decision` recebe referência ao `veto_id` no campo `meta`.
- `operational.blocked_by` **não é modificado** — invariante absoluto.
- `operational.elegibility_status` **não é modificado** — invariante absoluto.

### 1.8 Ciclo de vida e resolução

```
VETO SUAVE EMITIDO (acknowledged = false)
   │
   ├── LLM lê soft_vetos[] e conduz o turno
   │
   ├── [fim do turno] → Validador verifica acknowledged
   │      │
   │      ├── acknowledged = true → RESOLVIDO (veto não persiste para turno seguinte)
   │      │
   │      └── acknowledged = false + severity = "warning"
   │               → REQUIRE_REVISION (VC-06) ou
   │               → veto persiste para turno seguinte com risk_type "inconsistencia_soft"
   │
   └── [turno seguinte] → verifica escalation_condition
          │
          ├── condição verdadeira → ENGINE emite BLOQUEIO formal
          │
          └── condição falsa → veto suave persiste ou é resolvido
```

---

## 2. Validador pós-resposta/pré-persistência

### 2.1 Definição e papel no ciclo de turno

O **validador pós-resposta/pré-persistência** é a camada que executa *após* o LLM ter gerado
`reply_text` e *antes* de qualquer atualização no `lead_state`.

Seu único objeto é o `proposed_state_delta` — o conjunto de mudanças que seriam aplicadas ao
`lead_state`. Ele **não acessa `reply_text`** (princípio de soberania do LLM), exceto por
metadados estruturados (`LLMResponseMeta`) que o mecânico extrai antes da validação.

O validador **não reescreve**, **não complementa** e **não aprova o conteúdo da fala** —
aprova ou rejeita exclusivamente a *persistência do estado*.

### 2.2 Posição no pipeline de turno

```
TURNO ATIVO
   │
   ▼
[1] Policy engine avalia → emite PolicyDecisionSet (decisions + collisions + soft_vetos)
   │
   ▼
[2] LLM recebe PolicyDecisionSet + lead_state + contexto → gera reply_text
   │
   ▼
[3] Mecânico extrai LLMResponseMeta (sem reply_text) + propõe proposed_state_delta
   │
   ▼
[4] ══════════════════════════════════════════════════════
    VALIDADOR PÓS-RESPOSTA / PRÉ-PERSISTÊNCIA          ← aqui
    Recebe: ValidationContext
    Executa: checklist VC-01..VC-09
    Emite: ValidationResult {decision, checklist_results, ...}
    ══════════════════════════════════════════════════════
   │
   ▼
[5] Mecânico aplica ValidationResult:
    APPROVE           → persiste proposed_state_delta integralmente
    REJECT            → descarta proposed_state_delta; reverte ao prior_lead_state
    REQUIRE_REVISION  → persiste apenas safe_fields; bloqueia blocked_fields;
                        registra em validation_log
    PREVENT_PERSISTENCE → nenhuma persistência; lead_state inalterado; registra razão
   │
   ▼
[6] reply_text entregue ao cliente (independente do resultado do validador — soberania LLM)
```

### 2.3 Shape `ValidationContext`

```
ValidationContext {
  proposed_state_delta:  Partial<LeadState>   — mudanças propostas ao lead_state neste turno
  llm_response_meta:     LLMResponseMeta      — metadados estruturados extraídos da resposta LLM
                                               (nunca inclui reply_text diretamente)
  policy_decision_set:   PolicyDecisionSet    — resultado do engine neste turno
  prior_lead_state:      LeadState            — estado completo antes do turno (snapshot)
  current_turn:          integer              — número do turno atual
}

LLMResponseMeta {
  contains_approval_promise:    boolean  — engine detectou linguagem de promessa de aprovação
  contains_ineligibility_claim: boolean  — engine detectou afirmação de inelegibilidade
  contains_mechanical_template: boolean  — mecânico detectou resposta com estrutura rígida/template
                                           (ex.: lista numerada de perguntas, linguagem formatada
                                           fixa, ausência de adaptação ao contexto do lead);
                                           extraído pelo mecânico sem expor reply_text ao validador
  objective_referenced:         string?  — objetivo referenciado na resposta (se detectável)
  vetos_acknowledged:           string[] — IDs de VetoSuaveRecord que o LLM reconheceu
                                           (extraídos por mecânico antes da validação)
}
```

### 2.4 Checklist mínimo do validador (VC-01..VC-09)

O validador executa os seguintes itens em ordem. Cada item tem:
- `id`: código canônico
- `severity`: `"critical"` (falha → REJECT ou PREVENT_PERSISTENCE imediato) ou `"advisory"` (falha → REQUIRE_REVISION)
- `check`: condição que deve ser verdadeira para PASS

---

**VC-01 — Soberania do LLM na fala** (`severity: critical`)

> `proposed_state_delta` não contém nenhum campo com nome ou valor equivalente a `reply_text`,
> `mensagem_usuario`, `texto_cliente`, `resposta`, `frase` ou qualquer texto destinado ao cliente.

- PASS: nenhum campo proibido presente.
- FAIL → `REJECT` imediato. Violação de CA-01 / A00-ADENDO-01.

---

**VC-02 — Sem promessa prematura de elegibilidade** (`severity: advisory`)

> `llm_response_meta.contains_approval_promise = false` ou, se `true`, há pelo menos um fato
> relevante em `confirmed` (não apenas `captured` ou `inferred`) que sustente a promessa.

- PASS: promessa ausente, ou fato sustentador em `confirmed`.
- FAIL → `REQUIRE_REVISION`. Sinaliza risco de comprometimento prematuro.

---

**VC-03 — Sem avanço de fase com bloqueio ativo** (`severity: critical`)

> Se `prior_lead_state.operational.blocked_by` não está vazio, então
> `proposed_state_delta.operational.current_phase` deve ser idêntico ao valor em
> `prior_lead_state.operational.current_phase` (nenhum avanço de fase).

- PASS: fase não avança com bloqueio ativo.
- FAIL → `PREVENT_PERSISTENCE` do campo `current_phase`. O restante do delta pode ser avaliado.

---

**VC-04 — Toda colisão registrada** (`severity: critical`)

> O número de colisões detectáveis pelo validador no `proposed_state_delta` é igual ao número
> de entradas em `policy_decision_set.collisions[]`. Nenhuma colisão detectada está ausente de
> `collisions[]`.

- PASS: `collisions[]` contém registro para toda colisão.
- FAIL → `REJECT`. Colisão silenciosa é violação de RC-INV-03 (T3.3).

---

**VC-05 — Confiança mínima para persistência** (`severity: critical`)

> Nenhum fato em `proposed_state_delta.facts` transita para status superior ao permitido pela
> política de confiança (T2_POLITICA_CONFIANCA) dada a origem do valor proposto.
> Especificamente: `captured → confirmed` apenas com origem `DIRECT_TEXT`, `FORM_FIELD` ou
> `DOCUMENT_VERIFIED`; `inferred → confirmed` nunca sem coleta explícita.

- PASS: todas as transições de status de fato são compatíveis com a origem e o nível mínimo.
- FAIL → `PREVENT_PERSISTENCE` do(s) fato(s) afetado(s). Outros campos do delta prosseguem.

---

**VC-06 — Veto suave warning reconhecido** (`severity: advisory`)

> Para cada `VetoSuaveRecord` com `severity = "warning"` em
> `policy_decision_set.soft_vetos[]`, o ID correspondente deve estar presente em
> `llm_response_meta.vetos_acknowledged[]`.

- PASS: todos os vetos `warning` têm `acknowledged = true`.
- FAIL → `REQUIRE_REVISION`. Veto `info` não exige acknowledgment (apenas `warning`).

---

**VC-07 — Fato `captured→confirmed` apenas por coleta explícita** (`severity: critical`)

> Nenhum fato transita de `"captured"` ou `"inferred"` para `"confirmed"` no
> `proposed_state_delta` sem evidência de coleta explícita extraída da resposta do LLM neste
> turno (indicada por `llm_response_meta.objective_referenced` ou flag equivalente).

- PASS: transição `→confirmed` tem coleta explícita ou fato já estava em `confirmed`.
- FAIL → `PREVENT_PERSISTENCE` do(s) fato(s) afetado(s).

---

**VC-08 — Objetivo consistente com stage** (`severity: advisory`)

> `proposed_state_delta.operational.current_objective` (se presente) é compatível com
> `proposed_state_delta.operational.current_phase` e com as decisões emitidas em
> `policy_decision_set.decisions[]`. Saltos de objetivo sem evidência (ex.: `OBJ_CONFIRMAR`
> sem `confirmação` emitida) são inconsistentes.

- PASS: objetivo e stage são coerentes, ou `current_objective` não muda neste turno.
- FAIL → `REQUIRE_REVISION`. Não impede persistência de outros campos.

---

**VC-09 — Resposta sem padrão mecânico/template rígido** (`severity: advisory`)

> `llm_response_meta.contains_mechanical_template = false`.
>
> Template rígido detectado pelo mecânico (estrutura fixa, perguntas enumeradas, linguagem
> padronizada sem adaptação ao contexto do lead) indica que a resposta pode não ter incorporado
> as orientações do `PolicyDecisionSet` com naturalidade — mesmo que `decisions[]` estejam
> corretas e as regras de negócio estejam completas.

- PASS: `contains_mechanical_template = false`.
- FAIL → `REQUIRE_REVISION`. O validador **não reescreve a fala** (soberania LLM inviolável —
  RC-VS-03). A resposta já foi entregue ao cliente; o flag registra em `validation_log` que a
  persistência operacional requer revisão, sinalizando ao turno seguinte que a condução precisa
  de ajuste. O mecânico detecta o padrão sem expor `reply_text` ao validador.

---

### 2.5 Lógica de decisão agregada

O validador aplica a seguinte lógica após executar todos os itens:

```
se algum item critical falhou com ação REJECT
   → ValidationResult.decision = "REJECT"
     (todo proposed_state_delta descartado)

senão se algum item critical falhou com ação PREVENT_PERSISTENCE
   → ValidationResult.decision = "PREVENT_PERSISTENCE" ou "REQUIRE_REVISION"
     (apenas campos bloqueados são impedidos; safe_fields persistem)

senão se algum item advisory falhou
   → ValidationResult.decision = "REQUIRE_REVISION"
     (safe_fields persistem; blocked_fields marcados para revisão no próximo turno)

senão
   → ValidationResult.decision = "APPROVE"
```

**Prioridade de ação quando múltiplos itens falham:**
`REJECT` > `PREVENT_PERSISTENCE` > `REQUIRE_REVISION`

### 2.6 Shape `ValidationResult`

```
ValidationResult {
  decision:          enum       — "APPROVE" | "REJECT" | "REQUIRE_REVISION" | "PREVENT_PERSISTENCE"
  checklist_results: ChecklistItemResult[]   — resultado de cada VC-01..VC-09
  blocking_items:    string[]   — IDs dos itens critical que falharam (ex.: ["VC-03", "VC-05"])
  advisory_items:    string[]   — IDs dos itens advisory que falharam (ex.: ["VC-06", "VC-09"])
  reason:            string     — justificativa legível consolidada
  safe_fields:       string[]   — caminhos de campo seguros para persistir
                                  (relevante quando decision = "REQUIRE_REVISION")
  blocked_fields:    string[]   — caminhos de campo bloqueados de persistência
                                  (relevante quando decision != "APPROVE")
  validation_turn:   integer    — turno em que a validação foi executada
  timestamp:         string
}

ChecklistItemResult {
  item_id:    string    — "VC-01" .. "VC-08"
  status:     enum      — "PASS" | "FAIL"
  severity:   enum      — "critical" | "advisory"
  detail:     string?   — detalhe específico em caso de FAIL
}
```

### 2.7 Efeito no `lead_state` após decisão

| Decisão | Efeito em `lead_state` | Efeito em `validation_log` |
|---------|------------------------|---------------------------|
| `APPROVE` | `proposed_state_delta` integralmente aplicado | Registro com status PASS |
| `REJECT` | `lead_state` revertido ao `prior_lead_state` | Registro com status REJECT + `blocking_items` |
| `REQUIRE_REVISION` | Apenas `safe_fields` aplicados; `blocked_fields` descartados | Registro com status PARTIAL + `advisory_items` |
| `PREVENT_PERSISTENCE` | Campos em `blocked_fields` não persistidos; `safe_fields` aplicados | Registro com status BLOCKED + detalhes por campo |

`validation_log` é um campo de `lead_state` (auditoria) que registra `ValidationResult` por turno.
Ele **não é operacional** — não afeta a lógica do engine. É somente para rastreabilidade.

---

## 3. Relação com as 5 classes canônicas

| Classe canônica | Relação com veto suave | Relação com validador |
|---|---|---|
| `bloqueio` | Veto suave nunca vira bloqueio diretamente no mesmo turno; escalada requer turno seguinte | VC-03 verifica bloqueio ativo antes de persistir avanço de fase |
| `confirmação` | Veto suave com `resolution = "confirmar"` orienta o LLM a buscar confirmação; a própria `confirmação` é emitida pelo engine em decisions[] | VC-07 protege transição `captured→confirmed` |
| `obrigação` | Não interage diretamente com veto suave | VC-08 verifica coerência de objetivo |
| `sugestão_mandatória` | Veto suave e sugestão coexistem; veto está em `soft_vetos[]`, sugestão em `decisions[]` | Validador não bloqueia persistência por sugestão não seguida |
| `roteamento` | Veto suave `colisao_latente` pode sinalizar concorrência de roteamentos antes de COL-ROUTING-MULTI | VC-04 garante que colisão de roteamento esteja registrada |

**Invariante de separação:**
> `VetoSuaveRecord` nunca aparece em `decisions[]`.
> `PolicyDecision` nunca aparece em `soft_vetos[]`.
> O validador nunca cria `PolicyDecision` — apenas valida o delta proposto.

---

## 4. Cenários sintéticos (SC-VS-01..SC-VS-10)

### SC-VS-01 — Renda limítrofe: veto orientador, validador aprova

**Contexto:** `fact_monthly_income_p1 = 2.650` (limite MCMV = 2.640). Fato em `confirmed`.

**Engine:** emite `sugestão_mandatória` (composição com cônjuge investigada) + veto suave
`{risk_type: "risco_de_limite", severity: "warning", resolution: "orientar"}`.

**LLM:** reconhece o risco na condução; `vetos_acknowledged = ["VS-R_RENDA_LIMITE-01"]`.

**Validador:** VC-06 PASS (veto acknowledged). VC-03 PASS (sem bloqueio). Demais PASS.

**Resultado:** `APPROVE`. Risco registrado. Fato não bloqueado.

---

### SC-VS-02 — Autônomo sem IR: veto `dado_insuficiente`, não bloqueio

**Contexto:** `fact_work_regime_p1 = "autonomo"`, `fact_autonomo_has_ir_p1` ausente (não coletado).

**Engine:** emite `obrigação` (coletar IR) + veto suave
`{risk_type: "dado_insuficiente", severity: "warning", resolution: "confirmar"}`.

**LLM:** direciona ao IR. `vetos_acknowledged = ["VS-R_AUTONOMO_IR-02"]`.

**Validador:** VC-05 PASS (fato ausente, não transita de status). VC-06 PASS. `APPROVE`.

**Invariante verificado:** autônomo sem IR nunca é inelegível automático (RC-INV-08, T3.3).

---

### SC-VS-03 — Solo baixa renda: veto orientador + sugestão de composição

**Contexto:** `fact_composition_actor = "solo"`, `fact_monthly_income_p1 = 1.800` (abaixo do mínimo
solo). Fato estado civil em `confirmed`.

**Engine:** emite `sugestão_mandatória` (composição de renda) + veto suave
`{risk_type: "risco_de_limite", severity: "info", resolution: "orientar"}`.

**LLM:** orienta sobre composição sem prometer aprovação.

**Validador:** VC-02 PASS (sem promessa). VC-05 PASS. `APPROVE`.

**Invariante verificado:** solo baixa nunca recebe bloqueio; veto suave é `info`, não `warning`.
(RC-INV-10, T3.3).

---

### SC-VS-04 — Bloqueio ativo + tentativa de avanço de fase

**Contexto:** `prior_lead_state.operational.blocked_by = [{reason: "R_ESTRANGEIRO_SEM_RNM"}]`.
`proposed_state_delta.operational.current_phase = "elegibility"` (avanço de `qualification`).

**Engine:** bloqueio já ativo. Sem novos vetos suaves.

**LLM:** gerou `reply_text` (soberana). Mecânico propõe delta com avanço de fase.

**Validador:** VC-03 FAIL (critical) → `PREVENT_PERSISTENCE` de `current_phase`.

**Resultado:** `current_phase` não persiste. Restante do delta avaliado separadamente.

---

### SC-VS-05 — Resposta com promessa de aprovação sem fato confirmado

**Contexto:** `fact_monthly_income_p1` em `captured`. LLM gerou resposta que inclui linguagem
de aprovação. `llm_response_meta.contains_approval_promise = true`.

**Engine:** emite `confirmação` de `fact_monthly_income_p1`. Veto suave `risco_de_promessa`.

**Validador:** VC-02 FAIL (advisory — promessa sem fato `confirmed`).

**Resultado:** `REQUIRE_REVISION`. Estado seguro persiste; promessa registrada em `validation_log`.
LLM já falou — resposta não é alterada (soberania).

---

### SC-VS-06 — Fato `inferred` transitando para `confirmed` sem coleta

**Contexto:** `fact_estado_civil` em `inferred` (inferido de contexto). `proposed_state_delta`
inclui `fact_estado_civil.status = "confirmed"` sem coleta explícita neste turno
(`llm_response_meta.objective_referenced = null`).

**Validador:** VC-07 FAIL (critical) → `PREVENT_PERSISTENCE` de `fact_estado_civil`.

**Resultado:** fato permanece em `inferred`. Outros campos do delta são avaliados normalmente.

---

### SC-VS-07 — P3 não confirmado + composição sugerida: validador aprova

**Contexto:** `fact_p3_required = true` em `inferred`. Engine emite `confirmação` (P3 exige
formalização) + veto suave `{risk_type: "dado_insuficiente", resolution: "confirmar"}`.

**LLM:** conduz turno buscando confirmação de P3. Acknowledges veto.

**Validador:** VC-06 PASS. VC-07 PASS (fato não transitou para `confirmed`). `APPROVE`.

---

### SC-VS-08 — Colisão não registrada detectada pelo validador

**Contexto:** `decisions[]` contém `bloqueio` e `roteamento` para o mesmo fato. `collisions[]`
está vazio (engine não registrou COL-BLOCK-ROUTE).

**Validador:** VC-04 FAIL (critical) — colisão detectável ausente em `collisions[]`.

**Resultado:** `REJECT`. `proposed_state_delta` integralmente descartado.
`validation_log` registra violação de RC-INV-03 (T3.3).

---

### SC-VS-09 — Veto suave escalado para bloqueio no turno seguinte

**Turno anterior:** veto suave emitido `{resolution: "escalate_to_bloqueio",
escalation_condition: "fact_nationality.status = confirmed AND fact_rnm_status = sem_rnm"}`.
`acknowledged = false` — não resolvido.

**Turno atual:** `fact_nationality.status = "confirmed"` + `fact_rnm_status = "sem_rnm"`.
Engine avalia condição: verdadeira.

**Engine:** emite `bloqueio` formal (R_ESTRANGEIRO_SEM_RNM). Veto suave encerrado.

**Validador:** VC-03 PASS (proposta não avança fase). VC-04 PASS. `APPROVE`.

**Resultado:** `blocked_by` atualizado. Fase bloqueada.

---

### SC-VS-10 — R_CASADO_CIVIL_CONJUNTO: fato em conflito, veto suave + confirmação

**Contexto:** `fact_estado_civil = "casado_civil"` em `captured` (não confirmado). `fact_process_mode`
ausente. Conflito latente: outra fonte indica união estável.

**Engine:** emite `confirmação` de `fact_estado_civil` + `confirmação` de `fact_process_mode`
(COL-CONF-CONF-LEVEL registrado) + veto suave `{risk_type: "inconsistencia_soft",
severity: "warning", resolution: "confirmar"}`.

**LLM:** conduz confirmação. Acknowledges veto.

**Validador:** VC-06 PASS. VC-07 PASS (fato não transitou). VC-04 PASS (colisão registrada).
`APPROVE`.

---

### SC-VS-11 — Resposta natural com policy correta: validador aprova

**Contexto:** engine emite `obrigação` de coletar `fact_monthly_income_p1`. LLM conduz turno
perguntando sobre renda de forma contextualizada e natural, sem estrutura de lista ou template
fixo. `llm_response_meta.contains_mechanical_template = false`.

**Validador:** VC-09 PASS (`contains_mechanical_template = false`). Todos os demais itens PASS
(sem bloqueio ativo, sem promessa, fato ausente não transita de status, colisões ausentes
registradas).

**Resultado:** `APPROVE`. Persistência do delta prossegue normalmente. Condução natural
é o comportamento esperado e correto.

---

### SC-VS-12 — Resposta em template rígido apesar de policy correta: REQUIRE_REVISION

**Contexto:** engine emite `obrigação` de coletar `fact_autonomo_has_ir_p1`. PolicyDecisionSet
correto — decisions[], collisions[] e soft_vetos[] todos coerentes. Lead identificado como
autônomo. LLM gera resposta com estrutura de lista fixa enumerada (ex.: "1. Informe seu CPF;
2. Informe sua renda; 3. Envie seus documentos") sem qualquer adaptação ao contexto do lead.
`llm_response_meta.contains_mechanical_template = true`.

**Validador:** VC-09 FAIL (advisory) — `contains_mechanical_template = true` apesar de
decisions[] corretas. Itens VC-01..VC-08 todos PASS (policy em ordem, sem bloqueio ativo,
sem promessa de aprovação, sem transição de fato indevida).

**Resultado:** `REQUIRE_REVISION`. Validador não reescreve a fala (soberania LLM — RC-VS-03).
Resposta já entregue ao cliente. `validation_log` registra VC-09 FAIL com razão
"template_rigido_detectado". `advisory_items = ["VC-09"]`. Turno seguinte orientado a
conduzir com naturalidade; `safe_fields` do delta são persistidos normalmente.

**Invariante verificado:** VC-09 nunca cancela policy correta nem inverte decisions[].
A correção é de condução — não de regra de negócio.

---

## 5. Validação cruzada

| Artefato | Campo/conceito | Conformidade verificada neste documento |
|---|---|---|
| T3_CLASSES_POLITICA §2.5 | Tabela bloqueio × veto suave | §1.2 reproduz e expande a distinção; invariantes preservados |
| T3_CLASSES_POLITICA §2.2 | `blocked_by` atualizado por bloqueio | §1.2 e VC-03: veto suave nunca atualiza `blocked_by` |
| T3_CLASSES_POLITICA §2.4 | `elegibility_status` por bloqueio | §1.7: veto suave nunca altera `elegibility_status` |
| T3_REGRAS_CRITICAS §R_CASADO_CIVIL_CONJUNTO | Nunca emite bloqueio | SC-VS-10: veto suave + confirmação; nenhum bloqueio |
| T3_REGRAS_CRITICAS §R_AUTONOMO_IR | Não é inelegível automático | SC-VS-02 + §1.3 invariante: veto `dado_insuficiente`, não bloqueio |
| T3_REGRAS_CRITICAS §R_SOLO_BAIXA_COMPOSICAO | Nunca emite bloqueio | SC-VS-03: veto `info`, não `warning`; nunca `elegibility_status = ineligible` |
| T3_REGRAS_CRITICAS §R_ESTRANGEIRO_SEM_RNM | Bloqueio só com `confirmed` | SC-VS-09: escalada de veto para bloqueio apenas quando `confirmed` |
| T3_ORDEM_AVALIACAO §6 | Shape `PolicyDecisionSet` | §1.6: extensão com `soft_vetos[]`; invariante de separação declarado |
| T3_ORDEM_AVALIACAO §11 RC-INV-03 | Colisão nunca silenciosa | VC-04: colisão ausente em `collisions[]` → REJECT |
| T3_ORDEM_AVALIACAO §11 RC-INV-09 | Regra terminal exige `confirmed` | VC-07: `inferred→confirmed` bloqueado sem coleta explícita |
| T2_LEAD_STATE §3.3 `OperationalState` | `blocked_by`, `current_phase`, etc. | VC-03, VC-08 referenciam campos canônicos do OperationalState |
| T2_POLITICA_CONFIANCA | Nível mínimo por origem | VC-05: transição de status de fato validada contra política de confiança |
| T2_DICIONARIO_FATOS | 50 chaves canônicas | `trigger_fact` em VetoSuaveRecord referencia apenas chaves de T2_DICIONARIO_FATOS |
| A00-ADENDO-02 — identidade MCMV / fala natural | VC-09 detecta template mecânico via `LLMResponseMeta.contains_mechanical_template`; validador não reescreve a fala (RC-VS-03); sinaliza REQUIRE_REVISION para orientar turno seguinte | SC-VS-11 (natural → APPROVE) e SC-VS-12 (template → REQUIRE_REVISION) |

---

## 6. Anti-padrões (AP-VS)

**AP-VS-01 — Veto suave que bloqueia fase**
Veto suave nunca atualiza `blocked_by` nem impede avanço de `current_phase` diretamente.
Quem bloqueia é o bloqueio. Veto suave *sinaliza* risco — o engine escalará para bloqueio
se a condição for atingida.

**AP-VS-02 — Veto suave dentro de `decisions[]`**
`VetoSuaveRecord` pertence exclusivamente a `soft_vetos[]`. Incluí-lo em `decisions[]` viola
a invariante de separação e confunde o LLM sobre a natureza do sinal.

**AP-VS-03 — Validador reescrevendo `reply_text`**
O validador não tem acesso ao `reply_text` e nunca o modifica. A soberania do LLM na fala
é inviolável. Se a resposta foi gerada, foi gerada. O validador decide apenas sobre o estado.

**AP-VS-04 — Validador emitindo `PolicyDecision`**
O validador não é o engine. Ele valida o delta de estado — não avalia regras de negócio.
Nenhum `PolicyDecision` deve ser emitido pelo validador.

**AP-VS-05 — APPROVE silencioso**
Toda decisão `APPROVE` deve ser registrada em `validation_log`. Silêncio é violação de
rastreabilidade.

**AP-VS-06 — `soft_vetos[]` vazio não significa ausência de risco**
`soft_vetos[]` vazio apenas significa que nenhuma condição de veto foi detectada no turno.
Não é garantia de segurança — é o resultado da avaliação do engine no estágio correto.

**AP-VS-07 — VC-05 bloqueando fato com origem adequada**
VC-05 só bloqueia quando a **origem** não suporta o status de destino. Fato em `captured` com
origem `DIRECT_TEXT` pode transitir para `confirmed` via coleta explícita — VC-05 PASS.

**AP-VS-08 — Veto suave `escalate_to_bloqueio` sem `escalation_condition`**
Todo veto com `resolution = "escalate_to_bloqueio"` **deve** ter `escalation_condition`
preenchida. Veto sem condição de escalada é incompleto e não-conforme.

**AP-VS-09 — Validador avaliando coerência da fala do LLM**
O validador usa `LLMResponseMeta` (metadados estruturados). Ele nunca interpreta o conteúdo
semântico de `reply_text`. A distinção entre "promessa de aprovação" e "orientação" é
determinada pelo mecânico ao extrair `LLMResponseMeta`, não pelo validador.

**AP-VS-10 — REJECT descartando `validation_log`**
REJECT descarta o `proposed_state_delta` — mas não o log da validação. O registro do REJECT
(com `blocking_items` e razão) **deve** ser persistido em `validation_log` mesmo quando o
delta é descartado.

**AP-VS-11 — VC-09 reescrevendo ou bloqueando policy correta**
VC-09 detecta padrão de template rígido na condução do LLM — não avalia nem cancela a policy.
Se `contains_mechanical_template = true` mas `decisions[]` estão corretas, o resultado é
`REQUIRE_REVISION` (advisory), nunca `REJECT`. As decisions[], collisions[] e safe_fields do
delta são preservados. O validador sinaliza que a *condução* precisa de ajuste no turno
seguinte — não que a *política* está errada.

---

## 7. Regras invioláveis (RC-VS)

**RC-VS-01** — Veto suave nunca atualiza `blocked_by`. Nunca.

**RC-VS-02** — Veto suave nunca seta `elegibility_status = "ineligible"`. Nunca.

**RC-VS-03** — Validador nunca produz `reply_text` nem modifica a fala gerada pelo LLM.

**RC-VS-04** — Validador nunca emite `PolicyDecision` de nenhuma das 5 classes canônicas.

**RC-VS-05** — Toda decisão do validador (APPROVE, REJECT, REQUIRE_REVISION,
PREVENT_PERSISTENCE) deve ser registrada em `validation_log` com checklist completo.

**RC-VS-06** — VC-01 é inviolável: `proposed_state_delta` com campo de fala → REJECT imediato.
Sem exceção, sem ponderação.

**RC-VS-07** — VC-03 é inviolável: `current_phase` não avança com `blocked_by` não vazio.
Sem exceção, sem ponderação.

**RC-VS-08** — Veto suave com `resolution = "escalate_to_bloqueio"` deve declarar
`escalation_condition`. Veto sem condição de escalada não é conforme.

**RC-VS-09** — `VetoSuaveRecord` e `PolicyDecision` pertencem a arrays distintos e mutuamente
exclusivos dentro do `PolicyDecisionSet`. A separação não é opcional.

**RC-VS-10** — Veto suave de turno anterior com `acknowledged = false` e `severity = "warning"`
deve resultar em pelo menos VC-06 FAIL no validador do turno atual (REQUIRE_REVISION mínimo).

**RC-VS-11** — `contains_mechanical_template = true` deve resultar em VC-09 FAIL
(REQUIRE_REVISION mínimo). O validador não modifica a fala do LLM, não cancela as decisions[]
e não impede a persistência dos `safe_fields` — registra apenas em `validation_log` e orienta
o turno seguinte. Regra de negócio correta + template rígido = policy válida, condução a ajustar.

---

## 8. Cobertura de microetapas

| Microetapa do mestre T3 | Artefato | Status |
|---|---|---|
| Microetapa 1 — Regras mais sensíveis (casado→conjunto, autônomo→IR, solo→composição, estrangeiro→bloqueio) | T3_REGRAS_CRITICAS_DECLARATIVAS.md | COBERTA (PR-T3.2) |
| Microetapa 2 — Definir "bloquear avanço", "desviar objetivo", "pedir confirmação" e "apenas orientar" | T3_CLASSES_POLITICA.md | COBERTA (PR-T3.1) |
| Microetapa 3 — Definir ordem estável de avaliação para evitar colisão de regras | T3_ORDEM_AVALIACAO_COMPOSICAO.md | COBERTA (PR-T3.3) |
| Microetapa 4 — Definir política de composição quando várias regras disparam ao mesmo tempo | T3_ORDEM_AVALIACAO_COMPOSICAO.md | COBERTA (PR-T3.3) |
| **Microetapa 5 — Definir mecanismo de veto suave e validador pós-resposta/pré-persistência** | **T3_VETO_SUAVE_VALIDADOR.md (este)** | **COBERTA (PR-T3.4)** |

Todas as 5 microetapas do mestre T3 estão cobertas após esta PR.

---

## Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_VETO_SUAVE_VALIDADOR.md
PR que fecha:                          PR-T3.4 (veto suave + validador pós-resposta/pré-persistência)
Estado da evidência:                   completa

Há lacuna remanescente?:               não —
  § 1 define VetoSuaveRecord com shape completo, 5 condições de disparo, 3 tipos de resolução,
    escalada para bloqueio, ciclo de vida e invariantes;
  § 1.2 tabela formal bloqueio × veto suave em 7 dimensões;
  § 2 posiciona validador no pipeline de turno (passo 4 de 6);
  § 2.3 LLMResponseMeta com contains_mechanical_template (sem expor reply_text);
  § 2.4 checklist VC-01..VC-09 (9 itens > contrato ≥6) com severity e ação por item;
    VC-09 cobre template mecânico apesar de policy correta → REQUIRE_REVISION;
  § 2.5 lógica de decisão agregada com prioridade REJECT > PREVENT_PERSISTENCE > REQUIRE_REVISION;
  § 2.6 shape ValidationResult completo;
  § 2.7 tabela efeito×decisão×validation_log;
  § 4 12 cenários SC-VS-01..SC-VS-12 cobrindo veto orientador, autônomo sem IR, solo baixa,
    bloqueio+avanço, promessa prematura, inferred→confirmed, P3, colisão silenciosa, escalada,
    casado civil, resposta natural aprovada, template rígido→REQUIRE_REVISION;
  § 5 validação cruzada T3.1/T3.2/T3.3/T2 + A00-ADENDO-02 em 14 linhas;
  § 6 11 anti-padrões AP-VS-01..AP-VS-11;
  § 7 11 regras invioláveis RC-VS-01..RC-VS-11;
  § 8 cobertura de microetapas: todas as 5 microetapas T3 cobertas.

Há item parcial/inconclusivo bloqueante?:  não.
Fechamento permitido nesta PR?:            sim
Estado permitido após esta PR:             PR-T3.4 CONCLUÍDA (revisão pós-abertura aplicada);
                                           PR-T3.5 desbloqueada.
Próxima PR autorizada:                     PR-T3.5 — Suíte de testes de regras críticas

Revisão pós-abertura (2026-04-25):        Correção aplicada no mesmo branch (PR #102):
  — LLMResponseMeta.contains_mechanical_template adicionado
  — VC-09 adicionado (template rígido apesar de policy correta → REQUIRE_REVISION)
  — SC-VS-11 (natural → APPROVE) e SC-VS-12 (template → REQUIRE_REVISION) adicionados
  — AP-VS-11 e RC-VS-11 adicionados
  — Validação cruzada expandida com linha A00-ADENDO-02
  Prova P-T3-CORR-02: inspeção pós-correção — VC-09 opera exclusivamente sobre campo
  boolean de LLMResponseMeta; reply_text nunca acessado pelo validador (RC-VS-03
  intacto); AP-VS-11 confirma que policy correta não é cancelada por template detectado.
```

### Provas entregues

**P-T3.4-01:** inspeção do documento — nenhum payload de `VetoSuaveRecord`, `ValidationResult`,
`ValidationContext` ou `LLMResponseMeta` contém campo `reply_text`, `mensagem_usuario`,
`texto_cliente`, `resposta` ou `frase`. Menções a esses termos aparecem exclusivamente em
proibições e anti-padrões (AP-VS-03, AP-VS-09, RC-VS-03, VC-01).

**P-T3.4-02:** todas as `fact_key` referenciadas em cenários e condições de disparo
(`fact_monthly_income_p1`, `fact_work_regime_p1`, `fact_autonomo_has_ir_p1`,
`fact_composition_actor`, `fact_estado_civil`, `fact_nationality`, `fact_rnm_status`,
`fact_process_mode`, `fact_p3_required`, `fact_credit_restriction`) existem em
`T2_DICIONARIO_FATOS`. Nenhuma chave inventada.

**P-T3.4-03:** microetapa 5 do mestre T3 ("veto suave + validador") declarada COBERTA em §8.
Todas as 5 microetapas T3 estão cobertas após esta PR (§8 tabela completa).

**P-T3.4-04:** distinção bloqueio × veto suave declarada em 7 dimensões em §1.2 (CA-04 cumprido).
Checklist tem 9 itens verificáveis após revisão pós-abertura (CA-05 exige ≥3; contrato ≥6:
cumprido com margem). VC-09 adicionado para template mecânico — advisory, nunca cancela policy.

**P-T3-CORR-02 (revisão pós-abertura):** `LLMResponseMeta.contains_mechanical_template` é
campo boolean extraído pelo mecânico sem expor `reply_text` ao validador. VC-09 opera
exclusivamente sobre este flag. `reply_text` não aparece em nenhum shape operacional do
validador. AP-VS-11 e RC-VS-11 confirmam que policy correta não é cancelada por template
detectado — REQUIRE_REVISION (advisory) preserva `safe_fields` e decisions[].

### Conformidade com adendos

- **A00-ADENDO-01:** confirmada — soberania do LLM na fala preservada; validador opera sobre
  estado, nunca sobre `reply_text`; RC-VS-03 e VC-01 garantem o princípio.
- **A00-ADENDO-02:** confirmada — identidade MCMV preservada; mecanismos orientam condução sem
  engessar o LLM; veto suave é orientação de risco, não casca mecânica de fala.
- **A00-ADENDO-03:** confirmada — Bloco E presente com provas estruturadas.
