# T4_RESPOSTA_RASTRO_METRICAS — Resposta Final, Rastro do Turno e Métricas Mínimas — ENOVA 2

## Finalidade

Este documento define a **Etapa 5 (final) do pipeline de turno LLM-first** da ENOVA 2:
como `reply_text` é entregue ao canal após a decisão de persistência (`PersistDecision`),
como o rastro do turno (`TurnoRastro`) é registrado, quais métricas mínimas são publicadas
e como as camadas de memória/resumo são atualizadas ao final do turno.

**Princípios canônicos:**

> T4.4 entrega fala — nunca a cria.
> `reply_text` é imutável desde T4.2. T4.4 não o escreve, não o edita, não o complementa,
> não o prefixa, não o sufixa e não o substitui.
> Se `PersistDecision.reply_routing = "T4.5"`, T4.4 NÃO envia `reply_text` ao canal.
> `TurnoRastro` é auditoria — nunca fonte mecânica de fala futura.
> Métricas são declarativas nesta PR — sem runtime real.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T4_PIPELINE_LLM.md` (PR-T4.2) — `LLMResult`, `reply_text` capturado
  e imutável, `LLMCallContract` com métricas de latência e tokens.
- `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` (PR-T4.3) — `PersistDecision`,
  `ValidationResult`, `reply_routing`, `conflicts_registered`, `safe_fields`, `blocked_fields`.
- `schema/implantation/T4_ENTRADA_TURNO.md` (PR-T4.1) — `TurnoEntrada.turn_id`,
  `case_id`, `channel`.
- `schema/implantation/T1_CONTRATO_SAIDA.md` (PR-T1.4) — `TurnoSaida` shape canônico
  com 13 campos; `reply_text` soberano do LLM.
- `schema/implantation/T2_RESUMO_PERSISTIDO.md` (PR-T2.5) — camadas L1/L2/L3/L4;
  protocolo de snapshot; regras de atualização pós-turno.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — `lead_state` atualizado em T4.3.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (PR-T3.4) — `ValidationResult` shape.

**Microetapa do mestre coberta por este artefato:**

> **Microetapa 4 — T4:** "Gerar resposta final, registrar rastro e publicar métricas mínimas."

**Princípios canônicos (A00-ADENDO-01, A00-ADENDO-02 e A00-ADENDO-03):**

> 1. T4.4 não produz nem reescreve conteúdo de fala; apenas entrega o `reply_text` capturado
>    pelo LLM quando `reply_routing = "T4.4"`.
> 2. A entrega de `reply_text` é condicional ao `PersistDecision.reply_routing`.
> 3. `TurnoRastro` registra metadados de auditoria — nunca armazena `reply_text`
>    como base de decisão mecânica nem como template de fala futura.
> 4. Toda entrega ou não-entrega de `reply_text` é registrada em `TurnoRastro`.
> 5. Canal Meta/WhatsApp real é fora de escopo nesta PR — tratamento de erro de canal
>    é declarativo/documental.

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T4 (microetapa 4)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — §2.6, §6 S4, §7 CA-07
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
  │ Etapa 3 — Pipeline LLM (T4_PIPELINE_LLM)                                   │
  │      ↓  Produz: LLMResult {reply_text (IMUTÁVEL), facts_updated_candidates,│
  │         LLMResponseMeta, confidence, metrics}                              │
  │ Etapa 4 — Validação + Reconciliação + Persistência (T4_VALIDACAO_PERSISTENCIA)│
  │      ↓  Produz: PersistDecision {ValidationResult, lead_state_action,      │
  │         safe_fields, blocked_fields, conflicts_registered, reply_routing}  │
  │                                                                             │
  │ Etapa 5 — RESPOSTA FINAL + RASTRO + MÉTRICAS (este artefato)               │
  │   5a. Receber PersistDecision (T4.3) + reply_text (T4.2)                   │
  │   5b. Avaliar reply_routing                                                 │
  │       → "T4.4" → entregar reply_text ao canal (§2)                         │
  │       → "T4.5" → NÃO entregar; encaminhar para fallback T4.5 (§2.4)        │
  │   5c. Montar e persistir TurnoRastro (§3)                                  │
  │   5d. Publicar métricas mínimas (§4)                                       │
  │   5e. Atualizar camadas de memória/resumo pós-turno (§5)                   │
  └────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
  CANAL / LEAD (apenas reply_text — se reply_routing = "T4.4")
  ou
  T4.5 FALLBACK (se reply_routing = "T4.5")
```

**Entradas da Etapa 5:**

| Origem | Campo | Tipo |
|--------|-------|------|
| T4.2 (LLMResult) | `reply_text` | `string` — IMUTÁVEL; entregue apenas se `reply_routing="T4.4"` |
| T4.2 (LLMCallContract) | `latency_ms` | `integer` — latência da chamada LLM |
| T4.2 (LLMCallContract) | `tokens_used` | `TokensUsed` — input/output/total |
| T4.2 (LLMCallContract) | `call_timestamp` | `datetime` |
| T4.3 (PersistDecision) | `validation_result` | `ValidationResult` |
| T4.3 (PersistDecision) | `lead_state_action` | enum — `apply_full / apply_partial / block_all / revert` |
| T4.3 (PersistDecision) | `fields_to_apply` | `string[]` — campos persistidos |
| T4.3 (PersistDecision) | `fields_to_block` | `string[]` — campos bloqueados |
| T4.3 (PersistDecision) | `conflicts_generated` | `ConflictRecord[]` |
| T4.3 (PersistDecision) | `reply_routing` | enum — `"T4.4"` ou `"T4.5"` |
| T4.3 (PersistDecision) | `next_objective` | `Objective?` |
| T4.1 (TurnoEntrada) | `turn_id` | `string` |
| T4.1 (TurnoEntrada) | `case_id` | `string` |
| T4.1 (TurnoEntrada) | `channel` | `ChannelEnum` |
| Orquestrador | `turn_start_timestamp` | `datetime` — início da Etapa 1 |

**Saídas da Etapa 5:**

| Campo | Destino |
|-------|---------|
| `reply_text` entregue ao canal | Lead (via canal) — somente se `reply_routing = "T4.4"` |
| `TurnoRastro` persistido | `lead_state.history.L4` / telemetria / auditoria |
| Métricas mínimas publicadas | Telemetria / observabilidade |
| Camadas L1/L2/L3 atualizadas | `lead_state.history` — próximo turno |
| Trigger para T4.5 | Fallback pipeline — somente se `reply_routing = "T4.5"` |

---

## §2 Regras de entrega de `reply_text`

### 2.1 Princípio de entrega condicional

`reply_text` só é entregue ao canal quando `PersistDecision.reply_routing = "T4.4"`.
Esta é a única condição. T4.4 não avalia o conteúdo de `reply_text` para decidir entregar —
avalia apenas `reply_routing`.

```
Fluxo de decisão de entrega:

PersistDecision.reply_routing
       │
       ├── "T4.4"
       │     │
       │     ├── ValidationResult = APPROVE             → entregar reply_text ao canal ✓
       │     ├── ValidationResult = REQUIRE_REVISION    → entregar reply_text ao canal ✓
       │     └── ValidationResult = PREVENT_PERSISTENCE → entregar reply_text ao canal ✓
       │          (dados bloqueados; fala é entregue — não reescrita)
       │
       └── "T4.5"
             │
             └── ValidationResult = REJECT              → NÃO entregar reply_text ✗
                   → acionar T4.5 para resposta de fallback
                   → registrar reply_text em TurnoRastro apenas para auditoria
```

### 2.2 T4.4 não escreve, não edita, não substitui `reply_text`

**Invariante absoluto:** T4.4 recebe `reply_text` como campo de `LLMResult` (imutável desde T4.2)
e o repassa ao canal sem nenhuma modificação.

| Operação proibida | Razão |
|-------------------|-------|
| Escrever `reply_text` | `reply_text` é soberano do LLM (A00-ADENDO-01; LLP-INV-05) |
| Editar `reply_text` | Imutabilidade pós-captura (LLP-INV-05 T4.2) |
| Complementar `reply_text` com texto mecânico | Violação de soberania LLM |
| Prefixa / sufixar `reply_text` com template | Violação A00-ADENDO-01 |
| Substituir `reply_text` por template de fallback | Violação — fallback é escopo T4.5 |
| Truncar ou resumir `reply_text` | Violação de imutabilidade |
| Condicionar conteúdo de `reply_text` ao `ValidationResult` | T4.3 decide estado; T4.4 entrega fala — nunca reescreve com base na decisão |

### 2.3 Comportamento por `ValidationResult`

| `ValidationResult.decision` | `reply_routing` | Ação de T4.4 |
|-----------------------------|-----------------|--------------|
| `APPROVE` | `"T4.4"` | Entregar `reply_text` ao canal; montar TurnoRastro com `APPROVE` |
| `REQUIRE_REVISION` | `"T4.4"` | Entregar `reply_text` ao canal; montar TurnoRastro com `REQUIRE_REVISION` e `advisory_items` |
| `PREVENT_PERSISTENCE` | `"T4.4"` | Entregar `reply_text` ao canal; montar TurnoRastro com `PREVENT_PERSISTENCE` e `blocked_fields` |
| `REJECT` | `"T4.5"` | **NÃO entregar `reply_text`**; acionar T4.5; montar TurnoRastro com `REJECT`; `reply_text` registrado em TurnoRastro como campo de auditoria (nunca operacional) |

### 2.4 Roteamento para T4.5

Quando `reply_routing = "T4.5"`, T4.4:

1. **Não envia** `reply_text` ao canal.
2. **Não reescreve** `reply_text` — ele permanece imutável no TurnoRastro para auditoria.
3. **Aciona** T4.5 (Fallbacks) com os dados de contexto necessários.
4. **Registra** em `TurnoRastro.reply_routing = "T4.5"` e `TurnoRastro.validation_result = REJECT`.
5. A resposta que o lead recebe neste turno é produzida exclusivamente por T4.5.

**RR-ROUT-01:** T4.4 nunca produz resposta própria quando `reply_routing = "T4.5"`.
O canal recebe resposta de T4.5, não de T4.4.

**RR-ROUT-02:** T4.4 não pode acionar T4.5 com `reply_text` como "sugestão" de resposta.
T4.5 opera autonomamente — T4.4 fornece apenas metadados de contexto (turn_id, case_id,
`ValidationResult.blocking_items`, `conflicts_generated`).

### 2.5 Tratamento declarativo de erro de canal

Nesta PR, o tratamento de erro de canal é **declarativo/documental** — sem retry real.

| Cenário de erro | Comportamento declarado |
|-----------------|------------------------|
| Canal indisponível no momento de entrega | Registrar `TurnoRastro.channel_delivery_status = "failed"` + `channel_error_code`; sem retry automático nesta PR |
| Timeout de confirmação de entrega | Registrar `channel_delivery_status = "timeout"`; sem retry |
| Canal rejeita mensagem por tamanho | Registrar `channel_delivery_status = "rejected"` + motivo; sem truncamento de `reply_text` |

**RR-CANAL-01:** Erro de canal não altera `reply_text`, não aciona reescrita e não retorna
para T4.3 para nova validação. O turno está encerrado — o erro é registrado no `TurnoRastro`.

**RR-CANAL-02:** Retry real de entrega de canal é escopo de T5 (integração real Meta/WhatsApp).
T4.4 apenas documenta a tentativa e o resultado.

---

## §3 Shape `TurnoRastro`

### 3.1 Definição

`TurnoRastro` é o **registro auditável completo** de um turno encerrado. É produzido por T4.4
ao final de cada turno e persistido para telemetria, auditoria e observabilidade.

**Invariante:** `TurnoRastro` é auditoria pura — nunca é usado como fonte de decisão mecânica
sobre estado ou fala em turnos futuros.

### 3.2 Shape canônico

```
TurnoRastro {
  // Identificação
  turn_id:                    string          — obrigatório; de TurnoEntrada
  case_id:                    string          — obrigatório; de TurnoEntrada
  channel:                    ChannelEnum     — obrigatório; de TurnoEntrada

  // Resultado de validação e persistência (de PersistDecision — T4.3)
  validation_result:          ValidationResultSummary   — obrigatório (§3.3)
  persist_decision:           PersistDecisionSummary    — obrigatório (§3.4)

  // Decisões de política aplicadas (de PolicyDecisionSet pós-LLM — T4.3 §3.5)
  policy_decisions_applied:   PolicyDecisionRef[]       — pode ser vazio

  // Estado resultante
  facts_persisted:            string[]        — fact_keys persistidos neste turno
  facts_blocked:              string[]        — fact_keys bloqueados neste turno
  conflicts_registered:       ConflictRef[]   — conflitos criados neste turno (§3.5)

  // Roteamento de resposta
  reply_routing:              enum            — "T4.4" | "T4.5"; de PersistDecision
  channel_delivery_status:    enum?           — "delivered" | "failed" | "timeout" | "rejected"
                                               (apenas quando reply_routing = "T4.4")
  channel_error_code:         string?         — código de erro se channel_delivery_status ≠ "delivered"

  // Métricas de turno
  latency_ms:                 integer         — latência total do turno (ms) — Etapa 1 até fim Etapa 5
  latency_llm_ms:             integer         — latência da chamada LLM (de LLMCallContract)
  tokens_input:               integer         — tokens de entrada da chamada LLM
  tokens_output:              integer         — tokens de saída da chamada LLM
  tokens_total:               integer         — tokens_input + tokens_output

  // Timestamps
  timestamp:                  datetime        — timestamp de encerramento do turno (Etapa 5 concluída)
  turn_start_timestamp:       datetime?       — timestamp de início do turno (Etapa 1) se disponível
}
```

### 3.3 Shape `ValidationResultSummary` (para TurnoRastro)

```
ValidationResultSummary {
  decision:         enum       — "APPROVE" | "REJECT" | "REQUIRE_REVISION" | "PREVENT_PERSISTENCE"
  blocking_items:   string[]   — IDs dos itens critical que falharam (VC-01..VC-09)
  advisory_items:   string[]   — IDs dos itens advisory que falharam
  reason:           string     — justificativa consolidada do validador
}
```

**Nota:** `ValidationResultSummary` é uma projeção de `ValidationResult` para fins de rastro.
O `ValidationResult` completo (com `safe_fields`, `blocked_fields`, `checklist_results`) está em
`PersistDecision` e no `lead_state.validation_log`. Em `TurnoRastro` persiste apenas o resumo
para telemetria — sem reexpor dados de decisão que poderiam ser usados como fala mecânica.

### 3.4 Shape `PersistDecisionSummary` (para TurnoRastro)

```
PersistDecisionSummary {
  lead_state_action:    enum     — "apply_full" | "apply_partial" | "block_all" | "revert"
  facts_persisted_count: integer — quantidade de campos aplicados ao lead_state
  facts_blocked_count:   integer — quantidade de campos bloqueados
  conflicts_count:       integer — quantidade de ConflictRecord gerados neste turno
  reply_routing:         enum    — "T4.4" | "T4.5"
}
```

### 3.5 Shape `ConflictRef` (para TurnoRastro)

```
ConflictRef {
  conflict_id:   string   — de ConflictRecord.conflict_id
  fact_key:      string   — chave afetada
  conflict_type: enum     — tipo canônico (CONF_DADO_CONTRADITO etc.)
  status:        enum     — "open" | "resolved"
}
```

**Nota:** `TurnoRastro` não replica o `ConflictRecord` inteiro — apenas referencia
`conflict_id` e chave afetada. Os valores completos do conflito estão em
`lead_state.conflicts[]`.

### 3.6 Shape `PolicyDecisionRef` (para TurnoRastro)

```
PolicyDecisionRef {
  rule_id:    string   — identificador da regra (R_CASADO_CIVIL_CONJUNTO etc.)
  class:      enum     — BLOQUEIO | OBRIGAÇÃO | CONFIRMAÇÃO | SUGESTÃO | ROTEAMENTO
  applied:    boolean  — se a decisão foi efetivamente aplicada neste turno
}
```

### 3.7 `reply_text` em `TurnoRastro`

`TurnoRastro` **não armazena `reply_text`** como campo operacional.

| Cenário | Comportamento |
|---------|---------------|
| `reply_routing = "T4.4"` | `reply_text` entregue ao canal; não armazenado em `TurnoRastro`; disponível em L4 (histórico frio) via turnos arquivados |
| `reply_routing = "T4.5"` | `reply_text` capturado e imutável permanece no `LLMResult` do turno; pode ser consultado em auditoria via `turn_id`; não exposto em campos operacionais de `TurnoRastro` |

**RR-RAST-01:** `TurnoRastro` nunca contém `reply_text` como campo nomeado. A fala não é memória
mecânica — é fala consumida. Guardar `reply_text` no rastro como campo operacional criaria
risco de reutilização mecânica de fala em turnos futuros (violação A00-ADENDO-01).

**RR-RAST-02:** Para fins de auditoria de dispute (ex.: "o que a Enova disse no turno X?"),
`reply_text` pode ser recuperado via `turn_id` em L4 se o armazenamento de L4 implementar
esse campo. Mas não é campo operacional de `TurnoRastro` — é artifact de auditoria fria.

---

## §4 Métricas mínimas

### 4.1 Definição de métricas mínimas por turno

As métricas abaixo são declaradas por turno e registradas em `TurnoRastro`. São documentais
nesta PR — o mecanismo real de coleta e agregação é escopo de T4.6 (bateria E2E) e além.

| Métrica | Campo em `TurnoRastro` | Origem | Descrição |
|---------|------------------------|--------|-----------|
| Latência total do turno | `latency_ms` | Orquestrador | Tempo total da Etapa 1 ao encerramento da Etapa 5 (ms) |
| Latência da chamada LLM | `latency_llm_ms` | `LLMCallContract.latency_ms` (T4.2) | Tempo exclusivo da chamada LLM (ms) |
| Tokens de entrada | `tokens_input` | `LLMCallContract.tokens_used.input` (T4.2) | Tokens do prompt enviado ao LLM |
| Tokens de saída | `tokens_output` | `LLMCallContract.tokens_used.output` (T4.2) | Tokens da resposta do LLM |
| Tokens totais | `tokens_total` | `tokens_input + tokens_output` | Total de tokens do turno |
| Resultado de validação | `validation_result.decision` | `PersistDecision.validation_result` (T4.3) | APPROVE / REJECT / REQUIRE_REVISION / PREVENT_PERSISTENCE |
| Decisão de persistência | `persist_decision.lead_state_action` | `PersistDecision` (T4.3) | apply_full / apply_partial / block_all / revert |
| Quantidade de fatos persistidos | `persist_decision.facts_persisted_count` | `PersistDecision.fields_to_apply.length` (T4.3) | Número de campos efetivamente aplicados ao lead_state |
| Quantidade de campos bloqueados | `persist_decision.facts_blocked_count` | `PersistDecision.fields_to_block.length` (T4.3) | Número de campos bloqueados neste turno |
| Rota de resposta | `reply_routing` | `PersistDecision.reply_routing` (T4.3) | "T4.4" (entregue) ou "T4.5" (fallback) |

### 4.2 Cálculo de `latency_ms` (latência total)

```
latency_ms = timestamp_etapa5_encerramento - timestamp_etapa1_inicio

Decomposto:
  latency_entrada_ms  = tempo Etapa 1 (validação TurnoEntrada) + Etapa 2 (ContextoTurno)
  latency_llm_ms      = tempo Etapa 3 (chamada LLM — de LLMCallContract)
  latency_validacao_ms = tempo Etapa 4 (reconciliação + policy engine + validador + persistência)
  latency_rastro_ms   = tempo Etapa 5 (este artefato)

  latency_ms = latency_entrada_ms + latency_llm_ms + latency_validacao_ms + latency_rastro_ms
```

**RR-MET-01:** `latency_ms` é sempre o tempo total de ponta a ponta do turno. Nunca apenas
a latência LLM isolada, que é `latency_llm_ms`.

**RR-MET-02:** Se `latency_ms` não puder ser calculado (ex.: erro fatal na Etapa 1),
o `TurnoRastro` pode registrar `latency_ms = -1` indicando indisponibilidade da métrica.

### 4.3 Shape `TokensUsed` (de LLMCallContract — T4.2)

```
TokensUsed {
  input:  integer   — tokens do prompt (system + ctx + pol + out)
  output: integer   — tokens da resposta do LLM
  total:  integer   — input + output
}
```

### 4.4 Uso das métricas

Nesta PR, as métricas são documentais. Uso previsto em fases futuras:

| Métrica | Uso futuro declarado |
|---------|---------------------|
| `latency_ms` | SLA de tempo de resposta; detecção de degradação |
| `latency_llm_ms` | Fração de latência imputável ao LLM; comparação entre modelos |
| `tokens_total` | Estimativa de custo por turno; controle de orçamento |
| `validation_result.decision` | Taxa de REJECT/PREVENT_PERSISTENCE; saúde do validador |
| `persist_decision.facts_persisted_count` | Produtividade de coleta; qualidade de turno |
| `reply_routing` | Taxa de fallback (T4.5); detecção de regressão de qualidade LLM |

---

## §5 Atualização das camadas de memória/resumo pós-turno

### 5.1 Visão geral das camadas (T2_RESUMO_PERSISTIDO §1)

Ao final de T4.4, o mecânico atualiza as camadas de memória do `lead_state.history`
conforme as regras canônicas de `T2_RESUMO_PERSISTIDO`. A atualização ocorre **após** a
entrega de `reply_text` e **após** o registro de `TurnoRastro`.

| Camada | Nome | Atualização pós-turno |
|--------|------|-----------------------|
| **L1** | Curto prazo | **Sempre** — turno encerrado é adicionado à janela deslizante |
| **L2** | Factual estruturada | **Condicionada** — apenas se `lead_state_action ≠ "revert"` e existem `fields_to_apply` |
| **L3** | Snapshot executivo | **Condicionada** — apenas se evento de snapshot ocorreu neste turno |
| **L4** | Histórico frio | **Arquivamento automático** — turno que sai de L1 vai para L4 |

### 5.2 L1 — Curto prazo: atualização obrigatória

**Regra:** L1 é atualizada em todo turno, independente do `ValidationResult`.

```
Atualização L1 (RP-L1-01..RP-L1-04):
  1. Adicionar turno encerrado à janela L1 com:
     - entrada do lead (message_text de TurnoEntrada)
     - saída estruturada do turno (campos TurnoSaida — exceto reply_text)
     - turn_id, timestamp
  2. Se L1 já contém 5 turnos:
     - turno mais antigo → arquivado para L4 (RP-L1-01)
     - novo turno inserido
  3. reply_text não é adicionado a L1 como memória isolada (RP-L1-02)
```

**RR-L1-01:** L1 registra a estrutura do turno — não o texto de resposta isolado.
`reply_text` em L1 seria risco de reutilização mecânica de fala (A00-ADENDO-01).

### 5.3 L2 — Factual estruturada: atualização condicional

**Regra:** L2 é atualizada **apenas se** `PersistDecision.lead_state_action ≠ "revert"` E
existem campos em `fields_to_apply`.

```
Condição de atualização L2:
  SE lead_state_action = "apply_full"
    → todos os FactDeltaEntry aprovados → atualizados em lead_state.facts
    → L2 reflete o estado completo atualizado

  SE lead_state_action = "apply_partial"
    → apenas safe_fields → atualizados em lead_state.facts
    → blocked_fields não entram em L2 neste turno

  SE lead_state_action = "block_all"
    → nenhum fato atualizado; lead_state.facts inalterado
    → L2 sem mudança neste turno

  SE lead_state_action = "revert"
    → lead_state revertido ao prior_lead_state (T4.3 §9.1)
    → L2 restaurada ao estado pré-turno
    → NENHUMA coleta deste turno persiste em L2
```

**RR-L2-01:** L2 é a verdade canônica do case (RP-L2-04). Qualquer atualização passa
obrigatoriamente pelo protocolo de reconciliação T2.4 executado em T4.3 — T4.4 apenas
confirma o que T4.3 decidiu persistir.

**RR-L2-02:** T4.4 não atualiza L2 diretamente. T4.3 executa a atualização via
`PersistDecision`. T4.4 confirma e registra no `TurnoRastro` o que foi persistido.

### 5.4 L3 — Snapshot executivo: atualização condicional por evento

**Regra:** L3 é atualizada **apenas** quando um evento de snapshot ocorreu neste turno
(T2_RESUMO_PERSISTIDO §2.1).

**Eventos de snapshot que podem ocorrer em T4.4:**

| Evento | Trigger em T4.4 | Snapshot obrigatório? |
|--------|-----------------|:---------------------:|
| Avanço de stage (`ACAO_AVANÇAR_STAGE`) | `lead_state.operational.current_phase` mudou após `PersistDecision` | sim |
| Conflito resolvido | Último `ConflictRecord.status = "resolved"` — `open_conflicts = 0` após reconciliação | sim |
| Handoff para correspondente | `lead_state.operational.current_phase = broker_handoff` | sim |
| Encerramento de sessão | Sinal de encerramento recebido | sim |
| Reabertura de case ≥ 24h | Timestamp da última interação indica pausa longa | sim |

**Quando não há evento de snapshot:** L3 permanece inalterado. O snapshot anterior continua ativo.

**Quem redige o `profile_summary` do snapshot:**

> O LLM produz o `profile_summary` via campo estruturado próprio
> (`snapshot_candidate.profile_summary` ou equivalente definido no contrato aplicável) —
> **nunca** extraído ou derivado de `reply_text`.
> O mecânico persiste o campo estruturado sem alterar. Se o campo estruturado não estiver
> disponível no contrato desta fase, `profile_summary` fica pendente para a etapa/fase que
> definir snapshot estruturado. T4.4 não deriva snapshot de `reply_text`.

**RR-L3-01:** `approval_prohibited = true` é invariante em todo snapshot (RP-L3-01).
T4.4 não pode criar snapshot com `approval_prohibited = false` — violação contratual.

**RR-L3-02:** Snapshot não armazena `reply_text` nem valores de fatos (RP-SN-01/02).
T4.4 confirma que o mecânico não inclui esses campos ao criar o snapshot.

**RR-L3-03:** `profile_summary` do snapshot nunca é derivado de `reply_text`. Deve vir de
campo estruturado próprio definido no contrato aplicável (ex.: `snapshot_candidate.profile_summary`).
Se ausente, `profile_summary` fica pendente para a fase/etapa que definir o campo estruturado
— não é substituído por extração de fala ao cliente.

### 5.5 L4 — Histórico frio: arquivamento automático

**Regra:** L4 recebe automaticamente:
1. Turno que sai de L1 (6º turno que entra → mais antigo vai para L4).
2. Snapshot anterior quando um novo snapshot é criado (RP-L3-06).

**RR-L4-01:** L4 é imutável após arquivamento (RP-L4-02). T4.4 não altera entradas de L4
— apenas adiciona novos registros.

**RR-L4-02:** L4 não é carregado automaticamente no contexto do próximo turno (RP-L4-01).
É arquivo de auditoria, não contexto ativo.

### 5.6 Ordem das operações pós-turno em T4.4

```
[1] Entregar reply_text ao canal (se reply_routing = "T4.4")
    OU acionar T4.5 (se reply_routing = "T4.5")
[2] Montar TurnoRastro (§3)
[3] Publicar métricas mínimas (§4)
[4] Atualizar L1 (sempre)
[5] Atualizar L2 (se lead_state_action ≠ "revert" e existe fields_to_apply)
[6] Verificar se evento de snapshot ocorreu
    → sim → criar/atualizar L3 (snapshot executivo)
    → não → L3 inalterado
[7] Arquivar para L4 se necessário (turno de L1 que excede janela)
[8] Encerrar turno; próximo turno pode ser iniciado
```

---

## §6 Conformidade com `TurnoSaida` canônico (T1_CONTRATO_SAIDA)

`TurnoRastro` não é `TurnoSaida`. São dois artefatos distintos:

| Aspecto | `TurnoSaida` (T1) | `TurnoRastro` (T4.4) |
|---------|-------------------|-----------------------|
| Finalidade | Contrato de saída estruturada do agente por turno | Registro de auditoria/telemetria do turno |
| Destinatário | Canal / lead (via reply_text) + Mecânico (via campos estruturais) | Telemetria / auditoria / observabilidade |
| Contém `reply_text`? | Sim — campo obrigatório do LLM | Não — nunca armazenado como campo operacional |
| Contém métricas? | Não | Sim — latência, tokens, resultado validação |
| Consumido no próximo turno? | Sim (campos estruturais informam contexto) | Não operacionalmente — apenas auditoria |
| Produzido por | LLM (reply_text) + Mecânico (campos estruturais) | Mecânico (T4.4) |

**Relação:** `TurnoRastro` captura o resultado de processar `TurnoSaida` — não o substitui.
Os campos de `TurnoSaida` que se tornaram fatos persistidos aparecem em `TurnoRastro.facts_persisted`.

---

## §7 Regras invioláveis (RR-INV-01..RR-INV-12)

| Código | Regra |
|--------|-------|
| **RR-INV-01** | T4.4 não escreve, não edita, não complementa, não prefixa, não sufixa e não substitui `reply_text`. `reply_text` é imutável desde T4.2 (LLP-INV-05). |
| **RR-INV-02** | `reply_text` só é entregue ao canal quando `PersistDecision.reply_routing = "T4.4"`. A única condição de entrega é `reply_routing` — não o conteúdo de `reply_text`. |
| **RR-INV-03** | Quando `reply_routing = "T4.5"`, T4.4 **não envia** `reply_text` ao canal e **não produz** texto alternativo. T4.5 é o único responsável pela resposta neste caso. |
| **RR-INV-04** | `TurnoRastro` nunca contém `reply_text` como campo operacional nomeado. `reply_text` não é memória mecânica — é fala consumida no turno. |
| **RR-INV-05** | `TurnoRastro` não é fonte de decisão mecânica sobre estado ou fala em turnos futuros. É auditoria pura. |
| **RR-INV-06** | `validation_result` em `TurnoRastro` é registrado para telemetria — nunca usado como gatilho de reescrita de `reply_text`. |
| **RR-INV-07** | L1 é atualizada em todo turno. L2 é atualizada somente se `lead_state_action ≠ "revert"` e existem `fields_to_apply`. |
| **RR-INV-08** | Snapshot L3 (`approval_prohibited = true`) é invariante — T4.4 nunca cria snapshot com `approval_prohibited = false`. |
| **RR-INV-09** | Erro de canal não aciona reescrita ou substituição de `reply_text`. O erro é registrado em `TurnoRastro.channel_delivery_status`. |
| **RR-INV-10** | `latency_ms` em `TurnoRastro` é a latência total do turno (Etapa 1 até Etapa 5). `latency_llm_ms` é a fração exclusiva da chamada LLM. |
| **RR-INV-11** | Quando `reply_routing = "T4.5"`, T4.4 não fornece `reply_text` para T4.5 como "sugestão". T4.5 opera autonomamente com metadados de contexto. |
| **RR-INV-12** | `TurnoRastro` deve ser criado em todo turno — com `reply_routing = "T4.4"` ou `"T4.5"`. Turno sem rastro é violação contratual. |

---

## §8 Anti-padrões proibidos

| Código | Anti-padrão | Violação |
|--------|-------------|---------|
| **AP-RR-01** | T4.4 adicionar prefixo, sufixo ou texto mecânico ao `reply_text` antes de enviar ao canal | RR-INV-01; LLP-INV-05 (T4.2); A00-ADENDO-01 |
| **AP-RR-02** | Substituir `reply_text` por template de fallback quando `ValidationResult = REJECT` — T4.4 produzir resposta própria | RR-INV-03; VP-INV-09 (T4.3); escopo T4.5 |
| **AP-RR-03** | Armazenar `reply_text` em `TurnoRastro` como campo operacional nomeado | RR-INV-04; A00-ADENDO-01 |
| **AP-RR-04** | Usar `TurnoRastro.validation_result` como gatilho de reescrita ou condicionamento de `reply_text` em turno atual ou futuro | RR-INV-05; RR-INV-06; A00-ADENDO-01 |
| **AP-RR-05** | Enviar `reply_text` ao canal quando `reply_routing = "T4.5"` | RR-INV-02; RR-INV-03; VP-INV-09 (T4.3) |
| **AP-RR-06** | Fornecer `reply_text` para T4.5 como "base" ou "sugestão" de resposta de fallback | RR-INV-11; A00-ADENDO-01 |
| **AP-RR-07** | Criar snapshot L3 com `approval_prohibited = false` | RR-INV-08; RP-L3-01 (T2_RESUMO_PERSISTIDO) |
| **AP-RR-08** | Armazenar `reply_text` em L1 como memória isolada de fala | RR-INV-04; RP-L1-02 (T2_RESUMO_PERSISTIDO) |
| **AP-RR-09** | Tentar retry de entrega de canal com `reply_text` modificado para "caber" | RR-INV-01; RR-CANAL-01 |
| **AP-RR-10** | Omitir `TurnoRastro` quando `ValidationResult = REJECT` | RR-INV-12; VP-INV-11 (T4.3) |
| **AP-RR-11** | Atualizar L2 quando `lead_state_action = "revert"` | RR-INV-07; VP-INV-08 (T4.3) |
| **AP-RR-12** | Usar `TurnoRastro` de turno anterior como contexto de fala para o LLM no próximo turno | RR-INV-05; A00-ADENDO-02 |
| **AP-RR-13** | Derivar `profile_summary` do snapshot L3 de `reply_text` — usar fala ao cliente como fonte de memória executiva/snapshot | RR-L3-03; RR-INV-04; A00-ADENDO-01 |

---

## §9 Exemplos sintéticos

### E1 — APPROVE: renda coletada, `reply_text` entregue, L1/L2 atualizados

**Situação:** Lead CLT declarou renda `3200`. T4.3 retornou `APPROVE` (`apply_full`).
`reply_text` do LLM: "Ótimo! Vou registrar sua renda de R$ 3.200,00. Você tem documentos de
comprovação de renda em mãos?"

**Entradas de T4.4:**
```
reply_routing:      "T4.4"
validation_result:  { decision: "APPROVE", blocking_items: [], advisory_items: [] }
lead_state_action:  "apply_full"
fields_to_apply:    ["facts.fact_monthly_income_p1"]
fields_to_block:    []
conflicts_generated: []
latency_llm_ms:     1240
tokens_used:        { input: 820, output: 95, total: 915 }
```

**Ação T4.4:**
1. `reply_routing = "T4.4"` → entregar `reply_text` ao canal. ✓
2. Montar `TurnoRastro`:
```
TurnoRastro {
  turn_id: "turn_0042", case_id: "case_1234", channel: "whatsapp",
  validation_result: { decision: "APPROVE", blocking_items: [], advisory_items: [] },
  persist_decision: { lead_state_action: "apply_full", facts_persisted_count: 1,
                      facts_blocked_count: 0, conflicts_count: 0, reply_routing: "T4.4" },
  policy_decisions_applied: [{ rule_id: "R_RENDA_COLETA", class: "OBRIGAÇÃO", applied: true }],
  facts_persisted: ["facts.fact_monthly_income_p1"],
  facts_blocked: [],
  conflicts_registered: [],
  reply_routing: "T4.4",
  channel_delivery_status: "delivered",
  latency_ms: 2180, latency_llm_ms: 1240,
  tokens_input: 820, tokens_output: 95, tokens_total: 915,
  timestamp: "2026-04-26T00:45:00Z"
}
```
3. Atualizar L1 com turno encerrado. ✓
4. Atualizar L2 com `fact_monthly_income_p1 = { value: 3200, status: "captured" }`. ✓
5. Sem evento de snapshot → L3 inalterado.

**Resultado:** Lead recebe resposta natural. Lead_state atualizado com renda capturada.

---

### E2 — REQUIRE_REVISION: veto suave não reconhecido, `reply_text` entregue, L2 parcial

**Situação:** Lead autônomo. LLM não reconheceu veto IR_AUTONOMO. T4.3 retornou
`REQUIRE_REVISION` (`apply_partial`) com `advisory_items = ["VC-06"]`.
`safe_fields = ["facts.fact_work_regime_p1"]`. `blocked_fields = []` (advisory não bloqueia campos).

**Entradas de T4.4:**
```
reply_routing:     "T4.4"
validation_result: { decision: "REQUIRE_REVISION", advisory_items: ["VC-06"] }
lead_state_action: "apply_partial"
fields_to_apply:   ["facts.fact_work_regime_p1"]
fields_to_block:   []
```

**Ação T4.4:**
1. `reply_routing = "T4.4"` → entregar `reply_text` ao canal. ✓
2. Registrar em `TurnoRastro.validation_result.decision = "REQUIRE_REVISION"` + `advisory_items = ["VC-06"]`.
3. Atualizar L1. Atualizar L2 com `fact_work_regime_p1 = "autonomo"` (captured). ✓
4. Veto persiste para próximo turno — mecânico re-incluirá em `soft_vetos` do próximo contexto.

**Resultado:** Lead recebe resposta. Regime de trabalho capturado. Veto IR não reconhecido — será tratado no próximo turno.

---

### E3 — PREVENT_PERSISTENCE: tentativa de confirmed indevida, `reply_text` entregue, campo bloqueado

**Situação:** LLM propôs `fact_estado_civil = "casado_civil"` com `status: "confirmed"` sem
OBJ_CONFIRMAR explícito. T4.3 retornou `PREVENT_PERSISTENCE` (`apply_partial`) com
`blocked_fields = ["facts.fact_estado_civil"]` e `ConflictRecord` criado.

**Entradas de T4.4:**
```
reply_routing:      "T4.4"
validation_result:  { decision: "PREVENT_PERSISTENCE", blocking_items: ["VC-07"] }
lead_state_action:  "apply_partial"
fields_to_apply:    ["facts.fact_monthly_income_p1"]   // outro campo sem conflito
fields_to_block:    ["facts.fact_estado_civil"]
conflicts_generated: [{ conflict_id: "CONF-fact_estado_civil-turn_0055", fact_key: "fact_estado_civil" }]
```

**Ação T4.4:**
1. `reply_routing = "T4.4"` → entregar `reply_text` ao canal. ✓
2. Montar `TurnoRastro` com `conflicts_registered: [{ conflict_id: ..., fact_key: "fact_estado_civil", status: "open" }]`.
3. `facts_blocked: ["facts.fact_estado_civil"]`.
4. Atualizar L1. Atualizar L2 apenas com `fact_monthly_income_p1` (campo aprovado).
5. `fact_estado_civil` **não** atualizado em L2. ConflictRecord em `lead_state.conflicts[]`.

**Resultado:** Lead recebe resposta. Renda atualizada. Estado civil **não** persistido — conflito registrado para resolução no próximo turno.

---

### E4 — REJECT: colisão silenciosa detectada, `reply_text` NÃO entregue, T4.5 acionado

**Situação:** LLM propôs dois objetivos de roteamento contraditórios. VC-04 detectou colisão
não registrada. T4.3 retornou `REJECT` (`revert`).

**Entradas de T4.4:**
```
reply_routing:     "T4.5"
validation_result: { decision: "REJECT", blocking_items: ["VC-04"] }
lead_state_action: "revert"
```

**Ação T4.4:**
1. `reply_routing = "T4.5"` → **NÃO entregar `reply_text` ao canal**. ✗
2. Acionar T4.5 com metadados: `{ turn_id, case_id, blocking_items: ["VC-04"], context: "vc04_silent_collision" }`.
3. `reply_text` permanece imutável no `LLMResult` — auditoria via `turn_id`.
4. Montar `TurnoRastro`:
```
TurnoRastro {
  validation_result: { decision: "REJECT", blocking_items: ["VC-04"] },
  persist_decision:  { lead_state_action: "revert", facts_persisted_count: 0,
                       facts_blocked_count: 0, reply_routing: "T4.5" },
  facts_persisted:   [],
  facts_blocked:     [],
  reply_routing:     "T4.5",
  channel_delivery_status: null   // não aplicável — T4.5 entregará
}
```
5. Atualizar L1 (turno registrado mesmo com REJECT).
6. L2 inalterada (revert — prior_lead_state restaurado por T4.3).

**Resultado:** Lead recebe resposta de fallback produzida por T4.5. `reply_text` do LLM **nunca** chegou ao canal. Rastro completo do incidente registrado.

---

### E5 — APPROVE com evento de snapshot: stage avançado, L3 atualizado

**Situação:** Turno com `APPROVE` em que mecânico executou `ACAO_AVANÇAR_STAGE`
(`qualification_core → qualification_special`). Evento de snapshot disparado.

**Entradas de T4.4:**
```
reply_routing:     "T4.4"
validation_result: { decision: "APPROVE" }
lead_state_action: "apply_full"
actions_executed:  [{ type: "ACAO_AVANÇAR_STAGE", result: "current_phase = qualification_special" }]
```

**Ação T4.4:**
1. `reply_routing = "T4.4"` → entregar `reply_text` ao canal. ✓
2. Montar e persistir `TurnoRastro`. ✓
3. Atualizar L1. Atualizar L2 (`apply_full` → todos os campos aprovados). ✓
4. Detectar evento de snapshot: `ACAO_AVANÇAR_STAGE` → `current_phase` mudou.
5. `profile_summary` do snapshot: obtido de campo estruturado candidato
   (`snapshot_candidate.profile_summary`, se disponível no contrato aplicável).
   **T4.4 não deriva `profile_summary` de `reply_text`.**
   Se o campo estruturado não estiver disponível nesta fase, `profile_summary`
   fica pendente para a etapa/fase que definir snapshot estruturado (RR-L3-03).
6. Criar novo `SnapshotExecutivo` (L3):
```
SnapshotExecutivo {
  milestone_trigger:     "stage_advance",
  profile_summary:       "..." (de snapshot_candidate.profile_summary — não derivado de reply_text),
  confirmed_facts:       ["fact_estado_civil", "fact_work_regime_p1", ...],
  current_phase:         "qualification_special",
  approval_prohibited:   true    // INVARIANTE — sempre true
}
```
7. Snapshot anterior → arquivado para L4 (RP-L3-06). ✓

**Resultado:** Lead avançou de stage. L3 atualizado com novo snapshot. L1/L2 atualizados. L4 com snapshot anterior arquivado.

---

## §10 Cobertura das microetapas do mestre

| Microetapa do mestre (T4) | Cobertura neste documento |
|--------------------------|--------------------------|
| Microetapa 1 — Padronizar entrada | Escopo T4_ENTRADA_TURNO.md (PR-T4.1) — não coberta aqui |
| Microetapa 2 — Pipeline LLM | Escopo T4_PIPELINE_LLM.md (PR-T4.2) — não coberta aqui |
| Microetapa 3 — Policy engine + reconciliação antes de persistir | Escopo T4_VALIDACAO_PERSISTENCIA.md (PR-T4.3) — não coberta aqui |
| **Microetapa 4 — Gerar resposta final, registrar rastro, publicar métricas** | **Cobertura completa:** §2 (entrega condicional reply_text), §3 (TurnoRastro shape), §4 (métricas mínimas), §5 (camadas L1/L2/L3/L4), §6 (conformidade TurnoSaida), §7 (invariantes), §8 (anti-padrões), §9 (exemplos) ✓ |
| Microetapa 5 — Fallbacks | Escopo T4_FALLBACKS.md (PR-T4.5) — não coberta aqui |

---

## §11 Validação cruzada com T1/T2/T3/T4.1/T4.2/T4.3

| Referência cruzada | Campo/ponto verificado | Status |
|-------------------|----------------------|--------|
| `T1_CONTRATO_SAIDA.md §3.1` | `reply_text` soberano do LLM; nunca redigido por mecânico | **PASS** — RR-INV-01; §2.2 trava absoluta |
| `T1_CONTRATO_SAIDA.md §2.1` | Shape `TurnoSaida` com 13 campos; `reply_text` obrigatório | **PASS** — §6 distingue TurnoSaida de TurnoRastro |
| `T2_RESUMO_PERSISTIDO.md §1` | Camadas L1/L2/L3/L4 com regras de atualização | **PASS** — §5 integra protocolo completo |
| `T2_RESUMO_PERSISTIDO.md §2.2` | `reply_text` não entra em snapshot (RP-SN-01) | **PASS** — RR-INV-04; RR-L3-02; RR-L3-03; AP-RR-13 |
| `T2_RESUMO_PERSISTIDO.md §1.3` | `approval_prohibited = true` invariante em snapshot | **PASS** — RR-INV-08; RR-L3-01 |
| `T2_LEAD_STATE_V1.md §9` | `validation_log` registro auditável de decisões | **PASS** — §3.3 TurnoRastro complementa sem substituir |
| `T3_VETO_SUAVE_VALIDADOR.md §2.6` | `ValidationResult` shape canônico | **PASS** — §3.3 ValidationResultSummary é projeção |
| `T4_ENTRADA_TURNO.md §1` | `turn_id`, `case_id`, `channel` de TurnoEntrada | **PASS** — §3.2 campos obrigatórios de TurnoRastro |
| `T4_PIPELINE_LLM.md §5.4` | `LLMResponseMeta` — mecânico nunca expõe `reply_text` bruto | **PASS** — §2.2: T4.4 não avalia conteúdo de reply_text |
| `T4_PIPELINE_LLM.md LLP-INV-05` | `reply_text` imutável após captura em T4.2 | **PASS** — RR-INV-01 estende a imutabilidade até T4.4 |
| `T4_PIPELINE_LLM.md §4` | `LLMCallContract.latency_ms` e `tokens_used` | **PASS** — §3.2 e §4.1 consomem essas métricas |
| `T4_VALIDACAO_PERSISTENCIA.md §6.2` | `PersistDecision.reply_routing` determina rota de reply_text | **PASS** — §2.1 flowchart explícito por reply_routing |
| `T4_VALIDACAO_PERSISTENCIA.md VP-INV-09` | `reply_routing = "T4.5"` exclusivo de REJECT | **PASS** — §2.1, §2.4, RR-INV-03 |
| `T4_VALIDACAO_PERSISTENCIA.md VP-INV-08` | REJECT → lead_state revertido ao prior | **PASS** — §5.3: L2 não atualizada se lead_state_action = "revert" |
| `T4_VALIDACAO_PERSISTENCIA.md VP-INV-11` | Toda decisão do validador registrada em validation_log | **PASS** — §3.3 TurnoRastro registra ValidationResultSummary |
| `A00-ADENDO-01` | LLM soberano na fala; T4.4 não reescreve nem entrega em REJECT | **PASS** — RR-INV-01..03; §2.2 trava absoluta; AP-RR-01..03 |
| `A00-ADENDO-02` | Orquestrador como coordenador; rastro não vira casca dominante | **PASS** — RR-INV-04..06; AP-RR-04; AP-RR-12 |
| `A00-ADENDO-03` | Bloco E presente; evidência completa | **PASS** — Bloco E no final deste documento |

---

## Bloco E — PR-T4.4

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md
PR que fecha:                          PR-T4.4 (Resposta final + rastro + métricas mínimas)
Estado da evidência:                   completa (inclui correções da revisão)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Há lacuna remanescente?:               não —
                                       regras de entrega condicional de reply_text (§2):
                                         APPROVE/REQUIRE_REVISION/PREVENT_PERSISTENCE → T4.4
                                         (T4.4 não produz nem reescreve; apenas entrega);
                                         REJECT → T4.5 (reply_text NÃO enviado ao canal);
                                       T4.4 não escreve/edita/substitui reply_text (§2.2 + RR-INV-01);
                                       shape TurnoRastro completo com 15 campos (§3.2);
                                       métricas mínimas declarativas: latência total/LLM,
                                         tokens input/output/total, validation_result,
                                         persist_decision, facts_persisted, facts_blocked,
                                         reply_routing (§4.1);
                                       atualização camadas L1 (sempre), L2 (condicional),
                                         L3 (snapshot por evento), L4 (arquivamento) (§5);
                                       profile_summary do snapshot vem de campo estruturado
                                         (snapshot_candidate) — nunca derivado de reply_text
                                         (RR-L3-03; AP-RR-13; E5 corrigido);
                                       TurnoRastro como auditoria pura — não fonte de fala (RR-INV-04..06);
                                       tratamento declarativo de erro de canal (§2.5);
                                       RR-INV-01..12; RR-L3-03; 13 anti-padrões AP-RR (01..13);
                                       5 exemplos sintéticos E1–E5 (E5 corrigido);
                                       microetapa 4 coberta; cross-ref T1/T2/T3/T4.1/T4.2/T4.3
                                       em 18 dimensões.
                                       Fallbacks (T4.5), E2E (T4.6), G4 (T4.R) são escopos
                                       de PRs subsequentes — não são lacunas.
Há item parcial/inconclusivo bloqueante?: não —
                                       T4.4 entrega reply_text (não "não entrega"); princípio
                                         corrigido: "não produz nem reescreve; apenas entrega
                                         quando reply_routing=T4.4" (§ princípios + RR-INV-01);
                                       profile_summary não derivado de reply_text (RR-L3-03);
                                       REJECT não envia reply_text ao canal (RR-INV-03);
                                       TurnoRastro não vira fonte de fala futura (RR-INV-04..05);
                                       approval_prohibited invariante no snapshot (RR-INV-08);
                                       zero runtime implementado; zero alteração em src/.
Fechamento permitido nesta PR?:        sim —
                                       T4.4 não escreve/reescreve reply_text: CONFIRMADO (§2.2 + RR-INV-01);
                                       T4.4 entrega reply_text quando reply_routing="T4.4": CONFIRMADO (§2.1);
                                       REJECT não envia reply_text: CONFIRMADO (§2.4 + RR-INV-03);
                                       profile_summary não derivado de reply_text: CONFIRMADO (RR-L3-03 + AP-RR-13);
                                       TurnoRastro não é fonte mecânica de fala: CONFIRMADO (RR-INV-04..06);
                                       métricas mínimas todas declaradas (§4.1 — 10 métricas);
                                       sem runtime/código.
Estado permitido após esta PR:         PR-T4.4 CONCLUÍDA; T4_RESPOSTA_RASTRO_METRICAS.md
                                       publicado; PR-T4.5 desbloqueada.
Próximo passo autorizado:              PR-T4.5 — Fallbacks de segurança (T4_FALLBACKS.md)
```
