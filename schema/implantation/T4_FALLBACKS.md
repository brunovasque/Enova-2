# T4_FALLBACKS — Fallbacks de Segurança do Orquestrador de Turno — ENOVA 2

## Finalidade

Este documento define os **fallbacks de segurança do pipeline de turno T4** da ENOVA 2:
as condições que ativam o caminho alternativo (T4.5), os 4 cenários obrigatórios de falha,
os shapes canônicos (`FallbackContext`, `FallbackDecision`, `FallbackTrace`), as regras
de resposta segura, as restrições absolutas (nenhum dado inventado, nenhuma promessa,
nenhum avanço de stage, nenhum uso de `reply_text` rejeitado) e o rastro de falha.

**Princípios canônicos:**

> Fallback é segurança — não novo funil.
> T4.5 não substitui o LLM-first: é a rede de proteção quando ele não pode executar.
> T4.5 nunca usa `reply_text` do turno falho como base ou sugestão de resposta.
> T4.5 nunca promete aprovação, nunca reprova o cliente, nunca avança stage.
> T4.5 nunca persiste fato novo como `confirmed`.
> T4.5 nunca mascara erro como resposta normal.
> FallbackTrace deve ser criado em todo acionamento — sem exceção.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T4_PIPELINE_LLM.md` (PR-T4.2) — `LLMResult`, `ParseError`, condição
  de fallback imediato em saída malformada, `reply_text` imutável após captura.
- `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` (PR-T4.3) — `ValidationResult = REJECT`,
  `reply_routing = "T4.5"`, `PersistDecision`, `lead_state_action = "revert"`.
- `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` (PR-T4.4) — condição de entrega
  de `reply_text` e acionamento de T4.5 quando `reply_routing = "T4.5"`.
- `schema/implantation/T4_ENTRADA_TURNO.md` (PR-T4.1) — `TurnoEntrada.turn_id`, `case_id`.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (PR-T3.4) — `ValidationResult` shape,
  checklist VC-01..VC-09, `blocking_items`.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — `lead_state`, `prior_lead_state`.
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — soberania LLM; T4.5 não é
  casca mecânica dominante.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade MCMV;
  fallback mínimo e humano.

**Microetapa do mestre coberta por este artefato:**

> **Microetapa 5 — T4:** "Fallbacks para erro de modelo, formato inválido, omissão de
> campos, contradição séria."

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T4 (microetapa 5)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — §2.7, §6 S5, §7 CA-08
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
  │         LLMResponseMeta, metrics}                                          │
  │      ↦  [FALHA] erro_modelo / formato_invalido / omissao_campos            │
  │         → Aciona T4.5 DIRETAMENTE (sem passar por T4.3 ou T4.4)            │
  │ Etapa 4 — Validação + Reconciliação + Persistência (T4_VALIDACAO_PERSISTENCIA)│
  │      ↓  Produz: PersistDecision {ValidationResult, reply_routing}          │
  │      ↦  [FALHA] ValidationResult = REJECT → reply_routing = "T4.5"         │
  │         → T4.4 recebe e encaminha para T4.5 (contradicao_seria e outros)   │
  │ Etapa 5 — Resposta final + Rastro + Métricas (T4_RESPOSTA_RASTRO_METRICAS) │
  │      ↦  reply_routing = "T4.5" → NÃO entrega reply_text; aciona T4.5      │
  │                                                                             │
  │ Etapa 6 — FALLBACKS DE SEGURANÇA (este artefato — T4.5)                    │
  │   6a. Receber FallbackContext                                               │
  │   6b. Identificar cenário (trigger)                                         │
  │   6c. Determinar FallbackDecision (ação + estratégia de resposta)           │
  │   6d. Executar resposta segura ao canal (§5)                                │
  │   6e. Registrar FallbackTrace (§6)                                          │
  │   6f. Preservar lead_state (nunca persiste)                                 │
  └────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
  CANAL / LEAD — resposta segura mínima de T4.5
  (NÃO é o reply_text do turno falho)
```

**Caminhos de acionamento de T4.5:**

| Caminho | Origem | Cenário |
|---------|--------|---------|
| **Direto — T4.2 → T4.5** | LLM indisponível / timeout | `erro_modelo` |
| **Direto — T4.2 → T4.5** | `LLMResult` malformado / `ParseError` | `formato_invalido` |
| **Direto — T4.2 → T4.5** | Campo obrigatório ausente em `TurnoSaida` | `omissao_campos` |
| **Via T4.3/T4.4 → T4.5** | `ValidationResult = REJECT` + `reply_routing = "T4.5"` | `contradicao_seria` / `validation_reject` |

---

## §2 Condições de acionamento

### 2.1 Quando T4.5 é acionado

T4.5 deve ser acionado em **todas** as seguintes condições:

| Condição | Cenário | Origem |
|----------|---------|--------|
| LLM indisponível / timeout / erro de API | `erro_modelo` | T4.2 |
| `LLMResult` malformado (`ParseError`) | `formato_invalido` | T4.2 |
| Campo obrigatório ausente em `TurnoSaida` | `omissao_campos` | T4.2 |
| `ValidationResult = REJECT` + `reply_routing = "T4.5"` | `contradicao_seria` (ou outro REJECT) | T4.3 via T4.4 |

### 2.2 Quando T4.5 NÃO é acionado

T4.5 não é o destino de:

| Resultado | Destino correto |
|-----------|----------------|
| `ValidationResult = APPROVE` | T4.4 entrega `reply_text` ao canal |
| `ValidationResult = REQUIRE_REVISION` | T4.4 entrega `reply_text` ao canal |
| `ValidationResult = PREVENT_PERSISTENCE` | T4.4 entrega `reply_text` ao canal; campos bloqueados |
| Veto suave reconhecido (advisory) | T4.3 registra; T4.4 entrega `reply_text` |

### 2.3 Precondição de `reply_text` para T4.5

Quando T4.5 é acionado por `reply_routing = "T4.5"` (via T4.3/T4.4), existe um `reply_text`
capturado e imutável no `LLMResult` do turno. Este `reply_text`:

- **Não é entregue ao canal** (RR-INV-02/03 de T4_RESPOSTA_RASTRO_METRICAS)
- **Não é base nem sugestão** para a resposta de T4.5 (FB-INV-01 deste documento)
- **Permanece referenciável** via `turn_id` em auditoria fria (L4) — nunca em campo operacional
- T4.4 fornece a T4.5 apenas: `turn_id`, `case_id`, `blocking_items`, `conflicts_generated` — **nunca** o texto de `reply_text`

Quando T4.5 é acionado diretamente por T4.2 (erro_modelo, formato_invalido, omissao_campos),
não há `reply_text` completo capturado (a chamada falhou antes ou produziu saída inválida).

---

## §3 Shapes

### 3.1 `FallbackTrigger` (enum)

```
FallbackTrigger:
  "erro_modelo"       — LLM indisponível / timeout / erro de API antes da captura
  "formato_invalido"  — LLMResult malformado / ParseError / saída fora do contrato
  "omissao_campos"    — campo obrigatório ausente em TurnoSaida estruturada
  "contradicao_seria" — ValidationResult = REJECT por colisão / contradição severa (VC-04 etc.)
```

### 3.2 `FallbackAction` (enum)

```
FallbackAction:
  "request_reformulation"  — pedir ao lead que reformule / reenvie a mensagem
  "retry_llm_safe"         — tentar UMA chamada LLM simplificada de segurança (§5.3)
  "hold_for_next_turn"     — reconhecer recebimento; aguardar próximo turno sem processar
  "escalate_to_operator"   — sinalizar necessidade de revisão humana (Vasques / operador)
```

### 3.3 `FallbackContext`

`FallbackContext` é o objeto que T4.5 recebe ao ser acionado. Contém metadados suficientes
para determinar a ação segura — **nunca contém `reply_text` como campo operacional**.

```
FallbackContext {
  // Identificação
  turn_id:                string          — obrigatório; de TurnoEntrada
  case_id:                string          — obrigatório; de TurnoEntrada
  channel:                ChannelEnum     — obrigatório

  // Trigger e detalhamento do erro
  trigger:                FallbackTrigger — qual condição acionou T4.5
  error_detail:           ErrorDetail     — estruturado (§3.5); nunca exposto ao cliente

  // Contexto de validação (apenas quando trigger = "contradicao_seria")
  blocking_items:         string[]        — IDs dos itens críticos de VC que falharam
  conflicts_generated:    ConflictRef[]   — conflitos do turno se aplicável

  // Estado preservado
  prior_lead_state_ref:   string          — turn_id ou snapshot reference do estado antes do turno
                                           (referência — não o objeto completo)

  // Referência de auditoria (NUNCA o texto — ver FB-INV-01)
  attempted_reply_ref:    string?         — turn_id para auditoria fria SOMENTE
                                           (ausente quando trigger = "erro_modelo" ou "formato_invalido")

  // Métricas disponíveis
  partial_latency_ms:     integer?        — latência até o ponto de falha (se mensurável)
  turn_start_timestamp:   datetime
}
```

### 3.4 `FallbackDecision`

`FallbackDecision` é o resultado da avaliação de T4.5:

```
FallbackDecision {
  trigger:              FallbackTrigger   — trigger que gerou esta decisão
  action:               FallbackAction    — ação a executar
  response_strategy:    ResponseStrategy  — como estruturar a resposta (§3.6)
  lead_state_change:    "none"            — INVARIANTE: T4.5 nunca altera lead_state
  facts_persisted:      []                — INVARIANTE: sempre vazio em T4.5
  facts_blocked:        []                — não aplicável; T4.5 não processa fatos
  stage_change:         "none"            — INVARIANTE: T4.5 nunca avança stage
  trace_required:       true              — INVARIANTE: sempre true
}
```

### 3.5 `ErrorDetail`

```
ErrorDetail {
  error_type:   enum      — "llm_timeout" | "llm_unavailable" | "llm_api_error"
                           | "parse_error" | "missing_field" | "validation_reject"
                           | "silent_collision" | "serious_contradiction"
  error_code:   string?   — código técnico se disponível (ex.: HTTP 503, ParseError.MISSING_JSON)
  field_name:   string?   — campo ausente, se trigger = "omissao_campos"
  vc_failed:    string?   — código VC-* que causou REJECT, se trigger = "contradicao_seria"
  description:  string    — descrição interna para log/rastro — nunca exposta ao cliente
}
```

### 3.6 `ResponseStrategy`

```
ResponseStrategy {
  intent:   enum    — "acknowledge_and_wait" | "request_rephrase" | "signal_retry"
                     | "escalate"
  minimal:  true    — INVARIANTE: resposta é sempre mínima; não é pitch de vendas
  approval_free: true  — INVARIANTE: nenhuma promessa de aprovação
  stage_advance_free: true  — INVARIANTE: nenhum avanço de stage
}
```

### 3.7 `FallbackTrace`

`FallbackTrace` é o registro auditável do evento de fallback. É distinto do `TurnoRastro`
(que cobre o turno normal). Quando T4.5 é acionado via T4.4, o `TurnoRastro` já foi criado
por T4.4 com `reply_routing = "T4.5"` — `FallbackTrace` é o registro específico do fallback.

```
FallbackTrace {
  // Identificação
  turn_id:              string
  case_id:              string
  channel:              ChannelEnum

  // Evento de fallback
  trigger:              FallbackTrigger
  action:               FallbackAction
  error_detail:         ErrorDetail

  // Estado resultante
  lead_state_preserved: boolean           — INVARIANTE: sempre true
  facts_persisted:      []                — INVARIANTE: sempre vazio
  stage_advanced:       false             — INVARIANTE: sempre false

  // Resposta entregue
  response_delivered:   boolean           — se alguma resposta chegou ao canal
  response_strategy:    ResponseStrategy

  // Métricas
  latency_ms:           integer           — do início do turno até resposta de T4.5
  partial_latency_ms:   integer?          — latência até o ponto de falha
  timestamp:            datetime          — timestamp de encerramento de T4.5

  // Referência de auditoria
  attempted_reply_ref:  string?           — turn_id de referência auditoria SOMENTE
}
```

**FB-TRACE-01:** `FallbackTrace` nunca contém `reply_text` do turno falho como campo
operacional. Referência de auditoria é `attempted_reply_ref: turn_id` — nunca o texto.

---

## §4 Cenários obrigatórios

### 4.1 Cenário `erro_modelo` — LLM indisponível / timeout / erro de API

**Definição:** O LLM não respondeu (timeout), retornou erro de infraestrutura (HTTP 5xx)
ou ficou indisponível antes de completar a geração. Não há `LLMResult` capturável.

**Trigger:** T4.2 detecta a falha antes da captura de `reply_text`. Aciona T4.5 diretamente.

**Lead_state:** Preservado integralmente como estava antes do turno. Nenhuma modificação.

**Regras:**

| Regra | Descrição |
|-------|-----------|
| **FB-EM-01** | `erro_modelo` não significa que o lead é inelegível. Erro técnico não implica decisão de negócio. |
| **FB-EM-02** | T4.5 pode tentar UMA chamada LLM segura de retry (§5.3) com prompt simplificado. Se o retry também falhar → `request_reformulation` ou `hold_for_next_turn`. |
| **FB-EM-03** | A resposta ao lead é mínima: reconhecimento de que houve um problema técnico e pedido de reenvio/aguardo. Sem explicação técnica (não expor código de erro ao cliente). |
| **FB-EM-04** | `FallbackTrace.trigger = "erro_modelo"`, `error_detail.error_type = "llm_timeout" | "llm_unavailable" | "llm_api_error"`. |

**Fluxo:**

```
T4.2 detecta: LLM timeout / HTTP 503 / API error
  ↓
FallbackContext {
  trigger: "erro_modelo",
  error_detail: { error_type: "llm_timeout", error_code: "TIMEOUT_30S" },
  attempted_reply_ref: null   // nenhum reply_text capturado
}
  ↓
FallbackDecision {
  action: "retry_llm_safe"    // tenta 1x com prompt simplificado
}
  ↓
  SE retry OK → T4.2 reprocesa com novo LLMResult → pipeline normal retoma
  SE retry falha também →
    action: "request_reformulation"
    resposta mínima ao lead (§5.1)
  ↓
FallbackTrace registrado
lead_state preservado
```

---

### 4.2 Cenário `formato_invalido` — LLMResult malformado / ParseError

**Definição:** O LLM respondeu, mas a saída estruturada (`TurnoSaida`) não pôde ser
interpretada: JSON inválido, campos fora do schema canônico, `ParseError` em T4.2.

**Trigger:** T4.2 detecta `ParseError` após captura parcial. Aciona T4.5 **diretamente**
— **sem retry** (conforme LLP-INV de `T4_PIPELINE_LLM.md`: malformado → fallback imediato).

**Lead_state:** Preservado. Nenhuma tentativa de aplicar dados parciais.

**Regras:**

| Regra | Descrição |
|-------|-----------|
| **FB-FI-01** | Formato inválido não aciona retry automático de LLM (LLP-INV). T4.5 vai direto para resposta segura. |
| **FB-FI-02** | Dados parciais da saída malformada **não são usados**. Não há extração de fatos de saída inválida. |
| **FB-FI-03** | `reply_text` parcial (se capturado antes do ParseError) **não é entregue ao canal** e **não é sugestão** para T4.5. |
| **FB-FI-04** | A resposta ao lead é pedido de reformulação simples. O lead não sabe que houve ParseError — vê pedido natural de reenvio. |
| **FB-FI-05** | `FallbackTrace.trigger = "formato_invalido"`, `error_detail.error_type = "parse_error"`. |

**Fluxo:**

```
T4.2 detecta: ParseError — TurnoSaida malformada
  ↓
FallbackContext {
  trigger: "formato_invalido",
  error_detail: { error_type: "parse_error", error_code: "MISSING_JSON_CLOSE" },
  attempted_reply_ref: null  // reply_text parcial não é referenciado operacionalmente
}
  ↓
FallbackDecision {
  action: "request_reformulation",  // sem retry
  response_strategy: { intent: "request_rephrase" }
}
  ↓
resposta mínima ao lead (§5.1)
FallbackTrace registrado
lead_state preservado
```

---

### 4.3 Cenário `omissao_campos` — Campo obrigatório ausente em `TurnoSaida`

**Definição:** O LLM respondeu com JSON válido, mas `TurnoSaida` está incompleta:
campo obrigatório ausente ou nulo (ex.: `current_objective` ausente, `confidence` nulo).

**Trigger:** T4.2 valida shape de `TurnoSaida` e detecta campo obrigatório faltante.
Aciona T4.5 diretamente — sem tentar processar com shape incompleta.

**Lead_state:** Preservado. Campo ausente não implica dado coletado.

**Regras:**

| Regra | Descrição |
|-------|-----------|
| **FB-OC-01** | Campo ausente não é tratado como "não informado pelo lead" — é falha de estrutura do LLM. |
| **FB-OC-02** | T4.5 não tenta inferir o campo ausente nem preencher com default silencioso. |
| **FB-OC-03** | `ErrorDetail.field_name` registra qual campo estava ausente — para diagnóstico interno, nunca exposto ao cliente. |
| **FB-OC-04** | A resposta ao lead é pedido de reformulação. Se o campo ausente era objetivo de roteamento, o lead pode tentar reenviar sem saber do erro técnico. |
| **FB-OC-05** | `FallbackTrace.trigger = "omissao_campos"`, `error_detail.field_name = "<campo>"`. |

**Fluxo:**

```
T4.2 detecta: TurnoSaida.current_objective ausente
  ↓
FallbackContext {
  trigger: "omissao_campos",
  error_detail: { error_type: "missing_field", field_name: "current_objective" }
}
  ↓
FallbackDecision {
  action: "request_reformulation",
  response_strategy: { intent: "request_rephrase" }
}
  ↓
resposta mínima ao lead (§5.1)
FallbackTrace registrado
lead_state preservado
```

---

### 4.4 Cenário `contradicao_seria` — ValidationResult = REJECT / colisão severa

**Definição:** T4.3 executou o validador e retornou `ValidationResult = REJECT`, o que
determina `reply_routing = "T4.5"`. O motivo é uma contradição severa ou colisão silenciosa
não registrada (VC-04 ou bloqueio crítico equivalente) que invalida todo o turno.

**Trigger:** T4.4 recebe `reply_routing = "T4.5"` de T4.3 e aciona T4.5 com metadados
de contexto. T4.4 NÃO entrega `reply_text` do LLM ao canal.

**Lead_state:** Revertido ao `prior_lead_state` por T4.3 (`lead_state_action = "revert"`).
T4.5 confirma que nada foi persistido.

**Regras:**

| Regra | Descrição |
|-------|-----------|
| **FB-CS-01** | T4.5 recebe `blocking_items[]` de T4.4 como metadados — **nunca** expõe esses IDs ao cliente. |
| **FB-CS-02** | `reply_text` do LLM (REJECT) **não é entregue, não é base, não é sugestão** para a resposta de T4.5. A decisão de REJECT é do validador — não do lead nem do LLM. |
| **FB-CS-03** | REJECT não é reprovação do cliente. T4.5 não diz "você foi reprovado". T4.5 pede reformulação ou pausa o turno. |
| **FB-CS-04** | REJECT não avança stage nem retroage stage além do `prior_lead_state` já preservado por T4.3. |
| **FB-CS-05** | Conflitos gerados neste turno estão em `ConflictRecord[]` em `lead_state.conflicts[]` (registrados por T4.3). T4.5 não resolve conflitos — apenas registra o fallback. |
| **FB-CS-06** | `FallbackTrace.trigger = "contradicao_seria"`, `error_detail.vc_failed = "<VC-código>"`. |

**Fluxo:**

```
T4.3 retorna: ValidationResult = REJECT + reply_routing = "T4.5"
T4.4 aciona T4.5 com:
  { turn_id, case_id, blocking_items: ["VC-04"], conflicts_generated: [...] }
  (sem reply_text — nunca)
  ↓
FallbackContext {
  trigger: "contradicao_seria",
  blocking_items: ["VC-04"],
  conflicts_generated: [{ conflict_id: "...", fact_key: "..." }],
  attempted_reply_ref: "<turn_id>"   // referência apenas — nunca o texto
}
  ↓
FallbackDecision {
  action: "request_reformulation",    // ou "hold_for_next_turn" se conflito precisa resolução
  response_strategy: { intent: "request_rephrase" }
}
  ↓
resposta mínima ao lead (§5.1)
FallbackTrace registrado
lead_state: prior_lead_state já restaurado por T4.3 — T4.5 confirma sem alterar
```

---

## §5 Regras de resposta segura

### 5.1 Princípios da resposta de T4.5

A resposta que T4.5 entrega ao canal é uma **rede de proteção mínima** — não um novo pitch
de qualificação, não um template dominante, não uma decisão de negócio.

**O que a resposta de T4.5 PODE fazer:**

| Ação | Condição |
|------|----------|
| Reconhecer que houve uma dificuldade técnica | sempre disponível, sem detalhar o erro |
| Pedir ao lead que reenvie a mensagem ou aguarde | request_reformulation / hold_for_next_turn |
| Informar que o atendimento continua disponível | sempre disponível |
| Sinalizar para operador humano (Vasques) | escalate_to_operator quando necessário |

**O que a resposta de T4.5 NUNCA pode fazer:**

| Proibição | Regra |
|-----------|-------|
| Prometer ou sugerir aprovação | FB-INV-02; A00-ADENDO-01 |
| Reprovar o cliente definitivamente | FB-INV-11 |
| Revelar detalhes técnicos internos (VC-*, ParseError, blocking_items) | FB-INV-12 |
| Usar `reply_text` do turno falho como base | FB-INV-01 |
| Avançar stage | FB-INV-03 |
| Confirmar fato novo | FB-INV-04 |
| Ser um template rígido dominante | A00-ADENDO-01; A00-ADENDO-02 |
| Inventar dado sobre o caso | FB-INV-06 |

### 5.2 Estratégias de resposta por cenário

| Trigger | Estratégia preferida | Estratégia alternativa |
|---------|---------------------|----------------------|
| `erro_modelo` | `retry_llm_safe` → se retry OK, pipeline retoma; se falha → `request_reformulation` | `hold_for_next_turn` |
| `formato_invalido` | `request_reformulation` | `hold_for_next_turn` |
| `omissao_campos` | `request_reformulation` | `hold_for_next_turn` |
| `contradicao_seria` | `request_reformulation` | `hold_for_next_turn` se conflito precisa resolução humana |

### 5.3 Retry LLM seguro (apenas `erro_modelo`)

Quando `trigger = "erro_modelo"` e é o **primeiro** fallback neste turno:

- T4.5 pode tentar **uma única chamada LLM** com prompt simplificado.
- Prompt simplificado: apenas §SYS (identidade) + mensagem do lead + pedido de resposta
  mínima segura. Sem §CTX completo, sem §POL.
- Se a chamada simplificada retornar `reply_text` válido mínimo → entregar ao canal. ✓
- Se também falhar → `request_reformulation` imediato, sem segundo retry.

**FB-RETRY-01:** Retry LLM seguro é uma **única** tentativa, apenas para `erro_modelo`.
Não há retry para `formato_invalido`, `omissao_campos` ou `contradicao_seria`.

**FB-RETRY-02:** Resultado do retry seguro (se bem-sucedido) é um novo `LLMResult`
independente — **não é o `reply_text` rejeitado reprocessado**.

**FB-RETRY-03:** O retry seguro não processa fatos, não executa policy engine, não persiste.
É exclusivamente um `reply_text` mínimo para responder ao canal neste turno.

### 5.4 Escalação para operador

Quando `action = "escalate_to_operator"`:

- T4.5 entrega ao canal uma mensagem mínima de que o atendimento será retomado em breve.
- Sinaliza internamente para Vasques / operador responsável com: `turn_id`, `case_id`,
  `trigger`, `error_detail.description`.
- Nunca expõe detalhes técnicos ao canal.
- `FallbackTrace.action = "escalate_to_operator"`.

---

## §6 Regras de rastro e métricas do fallback

### 6.1 `FallbackTrace` obrigatório em todo acionamento

**FB-INV-07:** `FallbackTrace` deve ser criado em todo acionamento de T4.5,
independente do trigger ou da ação executada.

### 6.2 Campos obrigatórios de `FallbackTrace`

Os seguintes campos são obrigatórios em todo `FallbackTrace`:

| Campo | Regra |
|-------|-------|
| `turn_id` | Sempre — rastreabilidade |
| `case_id` | Sempre — rastreabilidade |
| `trigger` | Sempre — qual cenário ocorreu |
| `action` | Sempre — qual ação foi executada |
| `lead_state_preserved: true` | Sempre — confirmação de que nada foi alterado |
| `facts_persisted: []` | Sempre — confirmação de que nenhum fato foi persistido |
| `stage_advanced: false` | Sempre — confirmação de que stage não avançou |
| `timestamp` | Sempre — datetime de encerramento de T4.5 |

### 6.3 Métricas mínimas do fallback

| Métrica | Campo em `FallbackTrace` | Descrição |
|---------|--------------------------|-----------|
| Latência total do fallback | `latency_ms` | Do início do turno até resposta de T4.5 |
| Latência até a falha | `partial_latency_ms?` | Do início até o ponto de falha detectado |
| Trigger | `trigger` | Tipo do cenário |
| Ação executada | `action` | O que T4.5 fez |
| Resposta entregue | `response_delivered: boolean` | Se chegou ao canal |

### 6.4 Relação entre `TurnoRastro` e `FallbackTrace`

| Cenário | `TurnoRastro` criado? | `FallbackTrace` criado? |
|---------|-----------------------|------------------------|
| Acionamento via T4.4 (REJECT) | Sim — por T4.4 com `reply_routing="T4.5"` | Sim — por T4.5 |
| Acionamento direto de T4.2 | Parcial ou ausente (pipeline não chegou a T4.4) | Sim — por T4.5 (substitui) |

**FB-RAST-01:** Quando T4.5 é acionado diretamente de T4.2 (erro_modelo, formato_invalido,
omissao_campos), `TurnoRastro` pode não existir (T4.4 nunca foi chamado). Neste caso,
`FallbackTrace` é o único registro auditável do turno. Deve conter pelo menos:
`turn_id`, `case_id`, `trigger`, `action`, `lead_state_preserved: true`, `timestamp`.

---

## §7 Regra de não uso de `reply_text` rejeitado

### 7.1 Invariante absoluto

**FB-INV-01:** T4.5 **nunca** usa `reply_text` do turno falho como:
- Base para a resposta de T4.5
- Sugestão a ser editada / ajustada
- Contexto de fala a ser expandido
- Template a ser preenchido
- Inspiração de conteúdo

### 7.2 Por que esta regra existe

| Risco | Consequência |
|-------|-------------|
| `reply_text` foi rejeitado por contradição severa (VC-04) | Usar o texto contamina a resposta com dado inválido |
| `reply_text` pode conter promessa implícita de aprovação | Violar CA-08 e A00-ADENDO-01 |
| `reply_text` reflete estado que foi revertido (`revert`) | Dado inconsistente com `prior_lead_state` restaurado |
| Usar `reply_text` viola soberania LLM | Mecânico editando fala do LLM = A00-ADENDO-01 violado |

### 7.3 O que T4.5 recebe de T4.4 (quando via T4.3/T4.4)

T4.4 fornece a T4.5 exclusivamente:

```
{
  turn_id:            "<id>"            // identificação
  case_id:            "<id>"            // identificação
  blocking_items:     ["VC-04"]         // metadados internos
  conflicts_generated: [...]            // metadados internos
  // NÃO inclui: reply_text, resumo de reply_text, trecho de reply_text
}
```

### 7.4 Referência de auditoria

`FallbackContext.attempted_reply_ref` e `FallbackTrace.attempted_reply_ref` contêm
apenas o `turn_id` — para que, em auditoria fria via L4, seja possível recuperar o
`reply_text` original se necessário. **Nunca contém o texto em si.**

---

## §8 Regras invioláveis (FB-INV-01..12)

| Código | Regra |
|--------|-------|
| **FB-INV-01** | T4.5 nunca usa `reply_text` do turno falho como base, sugestão, template ou inspiração de conteúdo para sua resposta. |
| **FB-INV-02** | T4.5 nunca promete aprovação, nunca sinaliza elegibilidade positiva ou negativa. Fallback é neutro quanto a decisão de negócio. |
| **FB-INV-03** | T4.5 nunca avança `current_phase` nem executa `ACAO_AVANÇAR_STAGE`. |
| **FB-INV-04** | T4.5 nunca persiste fato novo como `confirmed`. Nenhum `FactEntry` é atualizado por T4.5. |
| **FB-INV-05** | T4.5 nunca mascara erro como resposta normal. O lead pode não receber detalhes técnicos, mas T4.5 não simula sucesso quando houve falha. |
| **FB-INV-06** | T4.5 nunca inventa dado. A resposta não contém informação sobre o caso que não estava no `prior_lead_state` antes do turno. |
| **FB-INV-07** | `FallbackTrace` é criado em todo acionamento de T4.5, independente do trigger ou resultado. |
| **FB-INV-08** | `lead_state` ao final de T4.5 é idêntico ao `prior_lead_state` anterior ao turno falho. T4.5 nunca altera estado. |
| **FB-INV-09** | A resposta de T4.5 é mínima e segura. Não é pitch de qualificação, não é continuação do funil, não é engajamento de vendas. |
| **FB-INV-10** | `FallbackContext.attempted_reply_ref` e `FallbackTrace.attempted_reply_ref` contêm apenas `turn_id` — nunca o texto de `reply_text`. |
| **FB-INV-11** | T4.5 nunca reprova o cliente definitivamente. Fallback não é decisão de inelegibilidade. |
| **FB-INV-12** | T4.5 nunca expõe ao canal detalhes técnicos internos: VC-codes, ParseError, blocking_items, conflict_ids, turn_id interno. |

---

## §9 Anti-padrões proibidos

| Código | Anti-padrão | Violação |
|--------|-------------|---------|
| **AP-FB-01** | T4.5 usar `reply_text` do turno REJECT como base ou sugestão para sua resposta | FB-INV-01; A00-ADENDO-01 |
| **AP-FB-02** | T4.5 incluir na resposta ao lead frases como "você tem boas chances de aprovação" ou "sua renda está adequada" | FB-INV-02; CA-08 |
| **AP-FB-03** | T4.5 executar `ACAO_AVANÇAR_STAGE` ou mudar `current_phase` | FB-INV-03; VP-INV-08 (T4.3) |
| **AP-FB-04** | T4.5 atualizar `lead_state.facts` com qualquer `FactEntry` como `confirmed` | FB-INV-04; LS-07 (T2_LEAD_STATE_V1) |
| **AP-FB-05** | T4.5 enviar ao canal uma resposta que parece uma resposta normal do atendimento quando na verdade houve REJECT | FB-INV-05; A00-ADENDO-02 |
| **AP-FB-06** | T4.5 produzir um template rígido dominante que substitui a identidade da atendente MCMV | A00-ADENDO-01; A00-ADENDO-02 (fallback dominante proibido) |
| **AP-FB-07** | T4.5 dizer ao lead "infelizmente não podemos prosseguir com sua análise" ou equivalente de reprovação | FB-INV-11 |
| **AP-FB-08** | T4.5 inventar fatos não existentes no `prior_lead_state` para completar uma resposta | FB-INV-06 |
| **AP-FB-09** | T4.5 não criar `FallbackTrace` quando acionado | FB-INV-07 |
| **AP-FB-10** | T4.5 tentar retry automático de LLM para `formato_invalido`, `omissao_campos` ou `contradicao_seria` | FB-RETRY-01; LLP-INV de T4_PIPELINE_LLM |
| **AP-FB-11** | T4.5 tentar "corrigir" o `reply_text` rejeitado editando-o para remover a contradição | FB-INV-01; LLP-INV-05 (T4_PIPELINE_LLM) |
| **AP-FB-12** | T4.5 expor ao canal `blocking_items`, código VC-*, conflict_id ou turn_id técnico | FB-INV-12 |
| **AP-FB-13** | T4.5 persistir `prior_lead_state` ao invés de simplesmente confirmá-lo como preservado | FB-INV-08; T4.3 já fez o revert |

---

## §10 Exemplos sintéticos

### FB-E1 — `erro_modelo`: LLM timeout, retry seguro bem-sucedido

**Situação:** Lead enviou mensagem sobre renda. T4.2 tentou chamar o LLM e recebeu
timeout após 30s. Primeira ocorrência de fallback neste turno.

**FallbackContext:**
```
{
  trigger: "erro_modelo",
  error_detail: { error_type: "llm_timeout", error_code: "TIMEOUT_30S" },
  attempted_reply_ref: null
}
```

**FallbackDecision:**
```
{
  action: "retry_llm_safe",
  response_strategy: { intent: "signal_retry" }
}
```

**T4.5 executa:**
1. Tenta chamada LLM simplificada (§SYS + mensagem do lead + instrução mínima).
2. LLM responde com `reply_text` mínimo válido → entrega ao canal. ✓
3. Registra `FallbackTrace` com `trigger: "erro_modelo"`, `action: "retry_llm_safe"`,
   `response_delivered: true`, `lead_state_preserved: true`.

**Resultado:** Lead recebe resposta natural. Nenhum dado foi perdido. Lead_state inalterado.

---

### FB-E2 — `formato_invalido`: ParseError, request_reformulation

**Situação:** Lead enviou mensagem longa com múltiplas informações. LLM respondeu mas
`TurnoSaida` não fechou o JSON corretamente. T4.2 detectou `ParseError`.

**FallbackContext:**
```
{
  trigger: "formato_invalido",
  error_detail: { error_type: "parse_error", error_code: "UNCLOSED_JSON_OBJECT" }
}
```

**FallbackDecision:**
```
{
  action: "request_reformulation",
  response_strategy: { intent: "request_rephrase" }
}
```

**T4.5 executa:**
1. Sem retry (FB-RETRY-01) — saída malformada descartada imediatamente; nenhum reprocessamento.
2. `reply_text` parcial (se capturado antes do ParseError) descartado — não entregue ao canal,
   não consultado (FB-FI-03; FB-INV-01).
3. `FallbackDecision.action = "request_reformulation"` → entregar resposta segura mínima ao lead.
4. Registra `FallbackTrace` com `trigger: "formato_invalido"`, `lead_state_preserved: true`.

**Resultado:** Lead recebe pedido simples de reenvio. Lead_state preservado. Nenhum dado parcial capturado.

---

### FB-E3 — `omissao_campos`: `current_objective` ausente

**Situação:** Lead enviou mensagem ambígua. LLM retornou `TurnoSaida` com JSON válido
mas sem `current_objective`. T4.2 detectou campo obrigatório ausente.

**FallbackContext:**
```
{
  trigger: "omissao_campos",
  error_detail: { error_type: "missing_field", field_name: "current_objective" }
}
```

**FallbackDecision:**
```
{
  action: "request_reformulation",
  response_strategy: { intent: "request_rephrase" }
}
```

**T4.5 executa:**
1. Sem retry de LLM.
2. Resposta mínima ao lead pedindo reformulação (sem revelar que é `current_objective` ausente).
3. Registra `FallbackTrace` com `error_detail.field_name: "current_objective"`, `lead_state_preserved: true`.

**Resultado:** Lead recebe pedido natural de reformulação. Lead_state preservado.
O próximo turno poderá coletar o objetivo corretamente.

---

### FB-E4 — `contradicao_seria`: REJECT por VC-04, reply_text não entregue

**Situação:** LLM propôs duas ações de roteamento contraditórias no mesmo turno.
VC-04 (colisão silenciosa) foi disparado. T4.3 retornou `ValidationResult = REJECT`.
T4.4 acionou T4.5 sem entregar `reply_text` ao canal.

**FallbackContext** (recebido de T4.4):
```
{
  trigger: "contradicao_seria",
  blocking_items: ["VC-04"],
  conflicts_generated: [{ conflict_id: "CONF-routing-turn_0088", fact_key: "routing" }],
  attempted_reply_ref: "turn_0088"  // turn_id — NUNCA o texto
}
```

**FallbackDecision:**
```
{
  action: "hold_for_next_turn",   // aguarda próxima mensagem do lead para reiniciar
  response_strategy: { intent: "acknowledge_and_wait" }
}
```

**T4.5 executa:**
1. `reply_text` do LLM (REJECT) **nunca consultado** — FB-INV-01. ✓
2. Resposta mínima ao lead: reconhece recebimento, pede paciência / reenvio.
   Sem revelar VC-04, sem revelar conflito, sem prometer aprovação.
3. `lead_state`: já revertido ao `prior_lead_state` por T4.3. T4.5 confirma sem alterar.
4. Registra `FallbackTrace`:
```
FallbackTrace {
  turn_id: "turn_0088", case_id: "case_2201",
  trigger: "contradicao_seria",
  action: "hold_for_next_turn",
  error_detail: { error_type: "silent_collision", vc_failed: "VC-04" },
  lead_state_preserved: true,
  facts_persisted: [],
  stage_advanced: false,
  response_delivered: true,
  attempted_reply_ref: "turn_0088"
}
```
5. `TurnoRastro` já foi criado por T4.4 com `reply_routing: "T4.5"`.

**Resultado:** Lead recebe mensagem segura de pausa. Lead_state preservado (prior).
`reply_text` REJECT nunca chegou ao canal. Conflito registrado em `lead_state.conflicts[]`.

---

### FB-E5 — `contradicao_seria`: REJECT por proposta de status `confirmed` sem confirmação explícita

**Situação:** LLM propôs `fact_estado_civil = "casado_civil"` com `status: "confirmed"`
sem que o lead tivesse confirmado explicitamente. VC-07 (PREVENT_PERSISTENCE) foi disparado
para o campo, mas VC-04 colateral causou REJECT. `reply_routing = "T4.5"`.

**T4.5 executa:**
1. FallbackContext com `blocking_items: ["VC-07", "VC-04"]`.
2. `reply_text` do LLM: não consultado, não usado. ✓
3. `FallbackDecision.action = "request_reformulation"`.
4. Resposta ao lead pede que reenvie a informação com mais clareza.
5. `lead_state.facts.fact_estado_civil`: revertido a `status: "hypothesis"` (prior).
6. FallbackTrace registrado.

**Resultado:** Lead pode reenviar com informação clara para próximo turno.
Estado civil não confirmado erroneamente. LLM-first preservado no próximo turno.

---

## §11 Validação cruzada com T1/T2/T3/T4.1/T4.2/T4.3/T4.4

| Referência cruzada | Campo/ponto verificado | Status |
|-------------------|----------------------|--------|
| `T4_PIPELINE_LLM.md LLP-INV (malformado → fallback imediato)` | Confirma que `formato_invalido` não tem retry | **PASS** — FB-RETRY-01; AP-FB-10 |
| `T4_PIPELINE_LLM.md §3.3` | `ParseError` ativa fallback direto de T4.2 → T4.5 | **PASS** — §2.1, caminho direto declarado |
| `T4_VALIDACAO_PERSISTENCIA.md VP-INV-09` | REJECT → `reply_routing = "T4.5"` exclusivo | **PASS** — §4.4 trigger `contradicao_seria` |
| `T4_VALIDACAO_PERSISTENCIA.md VP-INV-08` | REJECT → `lead_state` revertido ao `prior` por T4.3 | **PASS** — FB-INV-08; §4.4 confirma |
| `T4_RESPOSTA_RASTRO_METRICAS.md RR-INV-03` | T4.4 não entrega `reply_text` quando `reply_routing = "T4.5"` | **PASS** — §2.3; FB-INV-01 |
| `T4_RESPOSTA_RASTRO_METRICAS.md RR-ROUT-02` | T4.4 não fornece `reply_text` para T4.5 como sugestão | **PASS** — §7.3: T4.4 envia apenas metadados |
| `T3_VETO_SUAVE_VALIDADOR.md VC-04` | Colisão silenciosa → REJECT | **PASS** — FB-E4 cobre VC-04; §4.4 |
| `T2_LEAD_STATE_V1.md LS-07` | Fato só persiste via protocolo formal | **PASS** — FB-INV-04; AP-FB-04 |
| `T2_RECONCILIACAO.md RC-01..10` | Reconciliação é pré-persistência; T4.5 não persiste | **PASS** — FB-INV-04/08 |
| `T1_CONTRATO_SAIDA.md §3.1` | `reply_text` soberano do LLM; nunca redigido por mecânico | **PASS** — FB-INV-01; AP-FB-11 |
| `A00-ADENDO-01` | LLM soberano na fala; fallback não é casca dominante | **PASS** — FB-INV-01; AP-FB-06 |
| `A00-ADENDO-02` | Identidade MCMV; fallback mínimo e humano | **PASS** — §5.1; AP-FB-06; FB-INV-09 |
| `CONTRATO T4 CA-08` | 4 cenários: erro_modelo, formato_invalido, omissao_campos, contradicao_seria | **PASS** — §4.1–4.4 (4 cenários completos) |
| `CONTRATO T4 §3 (fora de escopo)` | Sem runtime em `src/`; sem integração Meta/WhatsApp | **PASS** — zero runtime neste artefato |

---

## §12 Cobertura das microetapas do mestre

| Microetapa do mestre (T4) | Cobertura neste documento |
|--------------------------|--------------------------|
| Microetapa 1 — Padronizar entrada | Escopo T4_ENTRADA_TURNO.md (PR-T4.1) — não coberta aqui |
| Microetapa 2 — Pipeline LLM | Escopo T4_PIPELINE_LLM.md (PR-T4.2) — não coberta aqui |
| Microetapa 3 — Policy engine + reconciliação | Escopo T4_VALIDACAO_PERSISTENCIA.md (PR-T4.3) — não coberta aqui |
| Microetapa 4 — Resposta final + rastro + métricas | Escopo T4_RESPOSTA_RASTRO_METRICAS.md (PR-T4.4) — não coberta aqui |
| **Microetapa 5 — Fallbacks de segurança** | **Cobertura completa:** §2 (condições), §3 (shapes), §4 (4 cenários obrigatórios), §5 (resposta segura), §6 (rastro e métricas), §7 (não uso de reply_text rejeitado), §8 (invariantes), §9 (anti-padrões), §10 (5 exemplos), §11 (cross-ref) ✓ |
| Microetapa 6 — Bateria E2E | Escopo T4_BATERIA_E2E.md (PR-T4.6) — não coberta aqui |

---

## Bloco E — PR-T4.5

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_FALLBACKS.md
PR que fecha:                          PR-T4.5 (Fallbacks de segurança)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Estado da evidência:                   completa (inclui correção de FB-E2)
Há lacuna remanescente?:               não —
                                       4 cenários obrigatórios cobertos:
                                         erro_modelo (§4.1): com retry seguro único (LLM);
                                         formato_invalido (§4.2): sem retry, request_reformulation;
                                         omissao_campos (§4.3): sem retry, request_reformulation;
                                         contradicao_seria (§4.4): via T4.3/T4.4 REJECT;
                                       FallbackContext com attempted_reply_ref como
                                         turn_id apenas — nunca reply_text (§3.3);
                                       FallbackDecision com lead_state_change: "none"
                                         invariante (§3.4);
                                       FallbackTrace com lead_state_preserved: true
                                         invariante (§3.7);
                                       regra de não uso de reply_text rejeitado:
                                         FB-INV-01 + AP-FB-01 + §7 inteiro;
                                       fallback nunca promete aprovação: FB-INV-02;
                                       fallback nunca avança stage: FB-INV-03;
                                       fallback nunca persiste fato confirmed: FB-INV-04;
                                       fallback não é template rígido dominante:
                                         AP-FB-06 + §5.1 + A00-ADENDO-01/02;
                                       rastro FallbackTrace obrigatório: FB-INV-07;
                                       métricas mínimas declaradas (§6.3);
                                       5 exemplos sintéticos FB-E1..FB-E5;
                                       cross-ref T1/T2/T3/T4.1/T4.2/T4.3/T4.4 em 14 dimensões;
                                       microetapa 5 coberta;
                                       zero runtime/código; zero alteração em src/.
                                       Bateria E2E (T4.6), Readiness G4 (T4.R):
                                       escopos de PRs subsequentes — não são lacunas.
Há item parcial/inconclusivo bloqueante?: não —
                                       FB-E2 corrigido: formato_invalido sem retry —
                                         contradição com FB-RETRY-01 removida (revisão);
                                       fallback não usa reply_text rejeitado: CONFIRMADO;
                                       fallback não promete aprovação: CONFIRMADO;
                                       fallback não avança stage: CONFIRMADO;
                                       fallback não persiste fato confirmed: CONFIRMADO;
                                       fallback não é template rígido dominante: CONFIRMADO;
                                       FallbackTrace obrigatório: CONFIRMADO;
                                       4 cenários obrigatórios presentes: CONFIRMADO;
                                       zero runtime/código: CONFIRMADO.
Fechamento permitido nesta PR?:        sim —
                                       T4.5 não usa reply_text rejeitado: CONFIRMADO (§7 + FB-INV-01);
                                       T4.5 não promete aprovação: CONFIRMADO (FB-INV-02 + AP-FB-02);
                                       T4.5 não avança stage: CONFIRMADO (FB-INV-03);
                                       T4.5 não persiste fato confirmed: CONFIRMADO (FB-INV-04);
                                       T4.5 não é template rígido: CONFIRMADO (AP-FB-06 + §5.1);
                                       4 cenários obrigatórios declarados: CONFIRMADO (§4.1–4.4);
                                       FallbackTrace em todo acionamento: CONFIRMADO (FB-INV-07);
                                       sem runtime/código.
Estado permitido após esta PR:         PR-T4.5 CONCLUÍDA; T4_FALLBACKS.md publicado;
                                       PR-T4.6 desbloqueada.
Próximo passo autorizado:              PR-T4.6 — Bateria E2E sandbox + latência/custo
                                       (T4_BATERIA_E2E.md)
```
