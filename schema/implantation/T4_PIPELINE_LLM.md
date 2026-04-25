# T4_PIPELINE_LLM — Pipeline LLM com Contrato Único — ENOVA 2

## Finalidade

Este documento define o **pipeline LLM com contrato único** do orquestrador de turno
LLM-first da ENOVA 2: como o `ContextoTurno` (produzido em T4.1) vira o prompt do LLM,
como a chamada é realizada, como a resposta é capturada e como os componentes são
separados para as etapas seguintes do pipeline.

**Princípio canônico:**

> Uma única chamada LLM por turno.
> O LLM é a única origem de `reply_text`.
> `reply_text` nunca é sobrescrito depois do LLM.
> O orquestrador monta o contexto — o LLM decide o que dizer.
> Policy engine e reconciliador operam sobre estado — nunca sobre `reply_text` bruto.
> O validador T4.3 recebe `LLMResponseMeta` (sinais estruturados extraídos pelo mecânico),
> nunca o texto bruto de `reply_text`.
> Imutabilidade ≠ entrega garantida: se `ValidationResult = REJECT`, `reply_text` não é
> enviado ao canal — o pipeline aciona T4.5 sem reescrever o texto capturado.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T4_ENTRADA_TURNO.md` (PR-T4.1) — `ContextoTurno` shape; Etapas 1–2
  do pipeline; base para montagem do prompt.
- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` (PR-T1.2) — system prompt v1; identidade
  e papel do LLM; base da seção §SYS do prompt.
- `schema/implantation/T1_CONTRATO_SAIDA.md` (PR-T1.4) — `TurnoSaida` com 13 campos; base do
  output esperado do LLM; fonte de verdade do shape de saída.
- `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` (PR-T1.5) — 15 comportamentos
  obrigatórios; 13 proibições absolutas; travas comportamentais que orientam o prompt.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shapes dos campos de estado; origem
  dos dados que entram no bloco §CTX.
- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — `PolicyDecision` shapes;
  `PolicyDecisionSet`; dados de `prior_decisions` que entram no bloco §POL.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (PR-T3.4) — `VetoSuaveRecord` shapes;
  dados de `soft_vetos` que entram no bloco §POL.

**Microetapa do mestre coberta por este artefato:**

> **Microetapa 2 — T4:** "Executar o LLM com contrato único e capturar tanto o texto
> quanto a estrutura."

**Princípios canônicos (A00-ADENDO-01 e A00-ADENDO-02):**

> 1. O LLM é soberano na fala — `reply_text` vem exclusivamente do LLM.
> 2. O orquestrador monta o contexto — nunca redige nem sugere resposta.
> 3. Policy engine e reconciliador operam sobre estado — nunca sobre `reply_text` bruto.
>    O validador T4.3 recebe `LLMResponseMeta` (sinais estruturados extraídos pelo mecânico
>    a partir de `reply_text`) — nunca o texto bruto da resposta.
> 4. `reply_text` capturado é imutável — nenhuma etapa pós-LLM pode alterá-lo,
>    complementá-lo ou substituí-lo. Imutabilidade não equivale a entrega garantida:
>    se `ValidationResult = REJECT`, `reply_text` não é enviado ao canal — o pipeline
>    aciona fallback T4.5 sem reescrever o texto capturado.

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T4 (microetapa 2)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — §6 S2, §7 CA-01/CA-03
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
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │ Etapa 1 — Validação de entrada (T4_ENTRADA_TURNO §5)                             │
  │ Etapa 2 — Montagem de ContextoTurno (T4_ENTRADA_TURNO §6)                        │
  │                     ↓                                                            │
  │ Etapa 3 — PIPELINE LLM (este artefato)                                           │
  │   3a. Montar PipelinePrompt a partir de ContextoTurno                            │
  │   3b. Chamar LLM — UMA chamada (contrato único)                                  │
  │   3c. Capturar LLMOutputRaw                                                      │
  │   3d. Parsear resposta → LLMResult (reply_text + extração estruturada)           │
  │   3e. Resposta malformada → registrar erro → fallback (T4.5)                     │
  │                     ↓                                                            │
  │ Etapa 4 — Validação policy + reconciliação + persistência (T4.3)                 │
  │ Etapa 5 — Resposta final + rastro + métricas (T4.4)                              │
  └──────────────────────────────────────────────────────────────────────────────────┘
```

A Etapa 3 recebe `ContextoTurno` e produz `LLMResult`.
`LLMResult.reply_text` é a resposta final ao canal — **imutável a partir deste ponto**.

---

## §2 Shape do `PipelinePrompt`

### 2.1 Visão geral

O prompt enviado ao LLM é composto por blocos nomeados em ordem fixa.
Cada bloco tem uma finalidade declarada. Nenhum bloco contém texto pré-redigido ao cliente.

```
PipelinePrompt {
  system:   SystemBlock        — §SYS: identidade, papel, limites, conhecimento (T1)
  context:  ContextBlock       — §CTX: estado do case, fatos, objetivo, histórico
  policy:   PolicyBlock        — §POL: decisions pré-calculadas, soft vetos (quando presentes)
  output:   OutputSchemaBlock  — §OUT: instrução de formato de saída (invariante por turno)
}
```

### 2.2 Ordem de montagem — invariante

```
1. §SYS  — System prompt canônico v1 (T1_SYSTEM_PROMPT_CANONICO §3)
2. §CTX  — Contexto do turno (extraído de ContextoTurno)
3. §POL  — Política e vetos (extraído de ContextoTurno.prior_decisions + soft_vetos)
4. §OUT  — Instrução de output (formato esperado da resposta estruturada)
```

**A ordem é fixa e inviolável** — qualquer variação de ordem é não conformidade (LLP-INV-01).

### 2.3 Blocos que NUNCA aparecem no prompt

| Bloco proibido | Motivo |
|----------------|--------|
| Texto pré-redigido ao cliente | Violação de soberania LLM (A00-ADENDO-01) |
| Script por stage ou por event | Violação de soberania LLM; anti-padrão AP-LLP-04 |
| Template de resposta | Violação de soberania LLM; anti-padrão AP-LLP-05 |
| Texto de fallback fixo | Fallback é escopo T4.5; AP-LLP-06 |
| Resultado de `ValidationResult` | Não existe neste ponto do pipeline |
| `reply_text` de turno anterior como "exemplo" | AP-LLP-07 — uso de reply_text como exemplo viola soberania |
| Instruções de vocabulário ou tom por evento | Violação de soberania LLM (A00-ADENDO-01) |
| Identificadores internos expostos | `fact_*`, `OBJ_*`, `PEND_*`, `COL-*` nunca nomeados diretamente no texto do prompt — apenas no bloco §OUT de schema |

---

## §3 Definição de cada bloco do prompt

### 3.1 Bloco §SYS — System Prompt

| Aspecto | Definição |
|---------|-----------|
| Conteúdo | `T1_SYSTEM_PROMPT_CANONICO.md §3` — texto completo da versão ativa (v1 ou superior) |
| Origem | Estático — carregado do artefato canônico; não gerado por turno |
| Mutação por turno | Proibida — §SYS é imutável dentro de um turno; qualquer override viola LLP-INV-02 |
| Contém resposta ao cliente? | Não — orienta identidade, papel, limites e conhecimento |
| Referência | `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md §3` |

### 3.2 Bloco §CTX — Contexto do turno

| Aspecto | Definição |
|---------|-----------|
| Conteúdo | Representação textual do `ContextoTurno` gerado na Etapa 2 |
| Origem | Dinâmico — gerado a cada turno a partir de `ContextoTurno` |
| Estrutura do bloco | Ver §3.2.1 abaixo |

#### 3.2.1 Subseções do §CTX em ordem obrigatória

```
[CTX — MENSAGEM DO LEAD]
  Texto recebido neste turno: "<message_text>"
  Canal: <channel>

[CTX — OBJETIVO DO TURNO]
  Objetivo atual: <current_objective.type>
  Alvo: <current_objective.target> (quando presente)
  Nível de risco atual: <operational_ctx.risk_level>
  Status de elegibilidade: <operational_ctx.elegibility_status>

[CTX — ESTADO OPERACIONAL]
  Fase: <operational_ctx.current_phase>
  Bloqueios ativos: <operational_ctx.blocked_by[]> (ou "nenhum")
  Prioridades de coleta neste turno: <operational_ctx.must_ask_now[]> (ou "nenhuma")
  Confirmação pendente: <operational_ctx.needs_confirmation>
  Contradições abertas: <operational_ctx.open_contradictions[]> (ou "nenhuma")

[CTX — FATOS COLETADOS]
  <fact_key>: <value> [status: <status>, confirmado: <confirmed>]
  (todos os facts_ctx e derived_ctx não-obsoletos)

[CTX — PENDÊNCIAS]
  <type>: <target> (para cada pending_ctx)
  (ou "nenhuma pendência ativa")

[CTX — HISTÓRICO RECENTE]
  <resumo dos últimos 3–5 turnos em L1 — entrada do lead + campos coletados>
  <snapshot executivo L3 quando existente>

[CTX — NOTAS DE QUALIFICAÇÃO]
  <vasques_notes resumidas> (apenas quando não vazio)
```

**Regras de montagem do §CTX:**

- Todos os valores são copiados de `ContextoTurno` — **sem edição, sem interpretação**.
- Fatos com `status = "obsolete"` são excluídos.
- `reply_text` de turnos anteriores (de L1) não aparece neste bloco — apenas entrada do lead e campos coletados.
- Se `message_text` for vazio (turno com apenas `attachments`), o bloco [CTX — MENSAGEM DO LEAD] deve indicar `"[turno sem texto — ver anexos]"`.

### 3.3 Bloco §POL — Política e vetos ativos

| Aspecto | Definição |
|---------|-----------|
| Conteúdo | Decisions pré-calculadas + soft vetos ativos |
| Origem | `ContextoTurno.prior_decisions` (se presente) + `ContextoTurno.soft_vetos` (se presente) |
| Obrigatório | Não — bloco §POL só é incluído quando há pelo menos uma `PolicyDecision` ou `VetoSuaveRecord` |
| Contém resposta ao cliente? | Não — são instruções estruturadas para raciocínio do LLM |

#### 3.3.1 Subseções do §POL quando presente

```
[POL — DECISÕES DE POLÍTICA ATIVAS]
  <para cada PolicyDecision em prior_decisions.decisions[]>:
    Classe: <class>
    Regra: <rule_id>
    Alvo: <target>
    Motivo: <reason> (legível por humano — para raciocínio do LLM)
    (não incluir action payload — apenas semântica para raciocínio)

[POL — RISCOS SOFT ATIVOS]
  <para cada VetoSuaveRecord em soft_vetos[]>:
    Risco: <risk_type>
    Descrição: <description>
    (acknowledged: <acknowledged>)
```

**Regra crítica do §POL:** O bloco apresenta as decisões de política como **orientação de raciocínio** — não como texto ao cliente. O LLM usa o contexto de política para entender o estado do caso e raciocinar com consciência das restrições ativas.

### 3.4 Bloco §OUT — Instrução de formato de saída

| Aspecto | Definição |
|---------|-----------|
| Conteúdo | Instrução ao LLM sobre o formato estruturado da resposta esperada |
| Origem | Estático — mesmo formato em todos os turnos |
| Obrigatório | Sim — sempre o último bloco |

#### 3.4.1 Conteúdo do §OUT

```
[OUT — FORMATO DE RESPOSTA ESPERADO]

Responda com um objeto JSON com a seguinte estrutura:

{
  "reply_text": "<texto natural dirigido ao lead — sua fala>",
  "facts_updated": {
    "<fact_key canônico>": {
      "value": <valor coletado>,
      "source": "llm_collected",
      "confirmed": false
    }
    // inclua apenas fatos explicitamente mencionados ou coletados NESTE turno
    // use chaves canônicas do dicionário de fatos (fact_*, derived_*)
    // nunca invente chave fora do dicionário canônico
  },
  "confidence": {
    "score": "high" | "medium" | "low",
    "reason": "<motivo opcional — uso interno>"
  },
  "next_objective_candidate": {
    "type": "<OBJ_* canônico>",
    "target": "<fact_key ou contexto alvo, quando aplicável>"
  }
  // next_objective_candidate é uma sugestão — o mecânico valida e pode substituir
}

Regras de preenchimento:
1. reply_text: texto natural ao lead; obrigatório; não use linguagem de sistema.
2. facts_updated: apenas fatos NOVOS ou ATUALIZADOS neste turno; pode ser {}.
3. confidence: sua auto-avaliação da qualidade dos dados coletados neste turno.
4. next_objective_candidate: o que você sugere como próximo passo; pode ser omitido
   se o turno não torna claro qual é o próximo objetivo.
```

**Invariante do §OUT:** A instrução de formato **nunca prescreve conteúdo** de `reply_text`. Ela define estrutura, não texto.

---

## §4 Contrato de chamada única ao LLM

### 4.1 Princípio de unicidade

> **Uma e somente uma chamada ao LLM por turno.**
> Nenhuma lógica, condição ou branch do orquestrador pode resultar em segunda chamada
> ao LLM dentro do mesmo turno. Isso inclui tentativas de re-tentativa por saída
> malformada — saída malformada vai para fallback (§8), não para nova chamada.

### 4.2 Shape do contrato de chamada

```
LLMCallContract {
  // — ENTRADA —
  prompt:           PipelinePrompt  — montado nas Etapas 3a (§2–§3)
  model_id:         string          — identificador do modelo ativo (ex.: "claude-opus-4-5")
  max_tokens:       integer         — limite máximo de tokens de saída (configurável; default: 2048)
  temperature:      float           — 0.0..1.0; default: 0.7 para turnos normais
  turn_id:          string          — de TurnoEntrada.turn_id (para rastreabilidade)
  case_id:          string          — de TurnoEntrada.case_id

  // — SAÍDA —
  raw_response:     string          — texto bruto retornado pelo LLM (antes de parse)
  latency_ms:       integer         — tempo de resposta da chamada em milissegundos
  tokens_used:      TokenCount      — tokens de entrada e saída consumidos
  call_timestamp:   datetime        — momento da chamada (UTC)
  error?:           LLMCallError    — presente apenas quando a chamada falhou
}

TokenCount {
  input_tokens:   integer
  output_tokens:  integer
  total_tokens:   integer
}

LLMCallError {
  type:    enum     — "timeout" | "model_unavailable" | "rate_limit" | "network_error" | "unknown"
  message: string
  retryable: boolean
}
```

### 4.3 Condições de chamada única

| Situação | Ação correta |
|----------|-------------|
| Saída do LLM bem formada | Prosseguir com parse (§6–§9) |
| Saída do LLM malformada (parse error) | Registrar erro; fallback `formato_invalido` (T4.5); **sem segunda chamada** |
| Campo obrigatório ausente na saída | Registrar erro; fallback `omissao_campos` (T4.5); **sem segunda chamada** |
| `reply_text` vazio ou nulo | Registrar erro; fallback `omissao_campos` (T4.5); **sem segunda chamada** |
| Timeout / model_unavailable | Registrar erro; fallback `erro_modelo` (T4.5); **sem segunda chamada** |
| Rate limit | Registrar erro; fallback `erro_modelo` (T4.5); **sem segunda chamada** |

**LLP-INV-03:** Qualquer exceção na chamada ao LLM resulta em **fallback imediato** — nunca em re-tentativa dentro do mesmo turno.

---

## §5 Shape da resposta esperada do LLM — `LLMOutputRaw` e `LLMResult`

### 5.1 `LLMOutputRaw` — texto bruto antes do parse

```
LLMOutputRaw {
  text:         string    — texto bruto retornado pelo modelo (pode conter markdown, JSON, etc.)
  latency_ms:   integer   — de LLMCallContract.latency_ms
  tokens_used:  TokenCount — de LLMCallContract.tokens_used
  call_timestamp: datetime
  turn_id:      string
  case_id:      string
}
```

### 5.2 `LLMResult` — após parse bem-sucedido

O parse da resposta bruta produz `LLMResult`:

```
LLMResult {
  // — CAMPOS EXTRAÍDOS (obrigatórios após parse) —
  reply_text:               string          — texto natural ao cliente (IMUTÁVEL após captura)
  facts_updated_candidates: FactsUpdated    — fatos candidatos declarados pelo LLM neste turno
  confidence:               Confidence      — auto-avaliação do LLM

  // — CAMPO EXTRAÍDO (opcional após parse) —
  next_objective_candidate: Objective?      — sugestão de próximo objetivo do LLM; pode ser nulo

  // — METADADOS DO PIPELINE —
  turn_id:          string
  case_id:          string
  parse_successful: boolean  — true = parse OK; false = falha de parse (→ fallback)
  parse_errors:     ParseError[]  — erros encontrados no parse; vazio se parse_successful
  latency_ms:       integer
  tokens_used:      TokenCount
  call_timestamp:   datetime
}

ParseError {
  code:        string  — "MISSING_REPLY_TEXT" | "INVALID_JSON" | "UNKNOWN_FACT_KEY" |
                         "INVALID_OBJ_TYPE" | "INVALID_CONFIDENCE_SCORE" | "EXTRA_FIELDS"
  field:       string  — campo onde o erro foi encontrado
  description: string  — descrição legível do erro
  fatal:       boolean — true = fallback obrigatório; false = campo ignorado com aviso
}
```

### 5.3 Campos extraídos vs. campos gerados pelo mecânico

`LLMResult` é uma saída **parcial** do turno. Os demais campos do `TurnoSaida` canônico
(T1_CONTRATO_SAIDA §2.1) são gerados pelo mecânico nas etapas posteriores (T4.3):

| Campo `TurnoSaida` | Origem | Etapa |
|-------------------|--------|-------|
| `reply_text` | **LLM** — via `LLMResult.reply_text` | Etapa 3 (este artefato) |
| `facts_updated` | LLM candidatos → mecânico valida e estrutura | Etapa 3 (candidatos) + Etapa 4 (validação) |
| `confidence` | **LLM** — via `LLMResult.confidence` | Etapa 3 (este artefato) |
| `next_objective` | LLM sugere → mecânico valida e pode substituir | Etapa 3 (candidato) + Etapa 4 |
| `turn_id` | Mecânico (de TurnoEntrada) | Etapa 1 |
| `case_id` | Mecânico (de TurnoEntrada) | Etapa 1 |
| `pending` | **Mecânico** — avalia slots obrigatórios | Etapa 4 |
| `conflicts` | **Mecânico** — detecta contradições | Etapa 4 |
| `risks` | **Mecânico** — classifica riscos | Etapa 4 |
| `actions_executed` | **Mecânico** — executa ações de gate | Etapa 4 |
| `blocks` | **Mecânico** — declara bloqueios | Etapa 4 |
| `needs_confirmation` | **Mecânico** — avalia conflitos | Etapa 4 |
| `flags` | **Mecânico** — roteamento e telemetria | Etapa 4 |

### 5.4 `LLMResponseMeta` — sinais estruturados extraídos de `reply_text`

Antes de enviar `LLMResult` para T4.3, o mecânico extrai `LLMResponseMeta` a partir de
`reply_text`. **`LLMResponseMeta` nunca expõe o texto bruto de `reply_text`** ao validador
ou a qualquer outro componente mecânico downstream.

Shape canônico (definido em `T3_VETO_SUAVE_VALIDADOR.md §2.3`):

```
LLMResponseMeta {
  contains_approval_promise:    boolean  — mecânico detectou linguagem de promessa de aprovação
  contains_ineligibility_claim: boolean  — mecânico detectou afirmação de inelegibilidade
  contains_mechanical_template: boolean  — mecânico detectou estrutura rígida/template na resposta
                                           (ex.: lista numerada de perguntas, linguagem formatada
                                           fixa, ausência de adaptação ao contexto do lead)
  objective_referenced:         string?  — objetivo referenciado na resposta (se detectável)
  vetos_acknowledged:           string[] — IDs de VetoSuaveRecord que o LLM reconheceu
}
```

`LLMResponseMeta` é o **único canal** pelo qual informações derivadas de `reply_text`
chegam ao validador T4.3. O validador VC-01..VC-09 usa esses sinais — nunca o texto bruto.

A extração é executada pelo mecânico (análise estrutural/lexical simples) **após** a
captura de `reply_text` e **antes** da chamada ao validador. Não é uma nova chamada ao LLM.

---

## §6 Captura de `reply_text`

### 6.1 Processo de captura

```
LLMOutputRaw.text
      │
      ▼
[PARSE] Extrair JSON do texto bruto
      │ falha → ParseError { code: "INVALID_JSON", fatal: true }
      ▼
[EXTRACT] Ler campo "reply_text"
      │ ausente ou nulo → ParseError { code: "MISSING_REPLY_TEXT", fatal: true }
      │ string vazia  → ParseError { code: "MISSING_REPLY_TEXT", fatal: true }
      ▼
[LOCK] reply_text capturado e imutável
      LLMResult.reply_text = <valor capturado>
      LLMResult.parse_successful = true (se sem outros erros fatais)
```

### 6.2 Invariante de imutabilidade

Após a captura em `LLMResult.reply_text`:

1. **Nenhuma etapa downstream pode alterar `reply_text`.**
2. T4.3 (policy + reconciliação + persistência) opera sobre `facts_updated_candidates` e
   `lead_state_delta` — nunca sobre `reply_text` bruto.
3. T4.3 (validador VC-01..VC-09) **não lê `reply_text` bruto**. O mecânico extrai
   `LLMResponseMeta` (sinais estruturados — §5.4) a partir de `reply_text` antes da
   validação. O validador usa esses sinais para verificar conformidade — sem acesso ao texto.
4. T4.4 (resposta + rastro) entrega `reply_text` ao canal **somente quando `ValidationResult`
   permite envio seguro** (`APPROVE`, `REQUIRE_REVISION`, `PREVENT_PERSISTENCE`).
   Se `ValidationResult = REJECT`, `reply_text` **não** é enviado — o pipeline aciona T4.5.
5. T4.5 (fallbacks) é acionado em dois casos distintos:
   - **(a)** `reply_text` não foi capturado (erro fatal de parse/chamada LLM);
   - **(b)** `ValidationResult = REJECT` — nesse caso T4.5 produz resposta segura *nova*,
     sem reescrever `reply_text` capturado (que permanece imutável no registro do TurnoRastro).

### 6.3 Casos onde `reply_text` não é capturado

| Situação | Ação | Fallback T4.5 |
|----------|------|--------------|
| Parse falhou (JSON inválido) | `parse_successful = false`; `ParseError INVALID_JSON` | `formato_invalido` |
| `reply_text` ausente na estrutura JSON | `parse_successful = false`; `ParseError MISSING_REPLY_TEXT` | `omissao_campos` |
| `reply_text` é string vazia | `parse_successful = false`; `ParseError MISSING_REPLY_TEXT` | `omissao_campos` |
| Chamada LLM falhou (timeout etc.) | `LLMCallError` registrado | `erro_modelo` |
| `reply_text` presente mas contém referência interna (fact_key nomeada) | `ParseError INVALID_REPLY_TEXT_CONTENT` (não fatal por default — aviso) | Sem fallback; aviso no rastro |

---

## §7 Captura de `TurnoSaida` parcial (extração estruturada)

### 7.1 Campos extraídos do JSON do LLM

Após captura de `reply_text`, o parser extrai os demais campos do JSON:

```
[EXTRACT facts_updated_candidates]
  Para cada chave em "facts_updated":
    - verificar se a chave existe em T2_DICIONARIO_FATOS (fact_* ou derived_*)
    - se desconhecida: ParseError { code: "UNKNOWN_FACT_KEY", fatal: false }
                       (campo ignorado com aviso — não é fatal; raciocínio prossegue)
    - se conhecida: incluir em LLMResult.facts_updated_candidates

[EXTRACT confidence]
  Verificar se "score" é "high" | "medium" | "low"
    - inválido: ParseError { code: "INVALID_CONFIDENCE_SCORE", fatal: false }
                (default aplicado: score = "low"; aviso registrado)

[EXTRACT next_objective_candidate]
  Se presente:
    - verificar se "type" é OBJ_* canônico (T1_TAXONOMIA_OFICIAL §3)
    - inválido: ParseError { code: "INVALID_OBJ_TYPE", fatal: false }
               (campo ignorado com aviso; mecânico determinará objetivo)
  Se ausente: LLMResult.next_objective_candidate = null
```

### 7.2 Campos de `TurnoSaida` que o LLM nunca produz diretamente

O LLM **não** é solicitado a produzir (e o parser **ignora** se presentes):

| Campo | Razão de exclusão |
|-------|------------------|
| `pending` | Mecânico avalia slots obrigatórios — não o LLM |
| `conflicts` | Mecânico detecta contradições via reconciliação (T4.3) |
| `risks` | Mecânico classifica riscos com base em regras T3 |
| `actions_executed` | Mecânico executa ações de gate — LLM não executa ações |
| `blocks` | Mecânico declara bloqueios de policy |
| `needs_confirmation` | Mecânico sinaliza após detectar conflito |
| `flags` | Mecânico define flags de roteamento e telemetria |
| `turn_id`, `case_id` | Vêm de TurnoEntrada — não do LLM |

Se o LLM incluir qualquer desses campos no JSON retornado:
- Registrar `ParseError { code: "EXTRA_FIELDS", fatal: false }` para cada campo extra.
- Ignorar os valores — o campo é determinado pelo mecânico independentemente.
- Continuar o parse dos demais campos.

---

## §8 Tratamento de saída malformada

### 8.1 Definição de saída malformada

Saída malformada é qualquer condição em que `reply_text` não pode ser capturado com segurança
ou a estrutura JSON não pode ser parseada minimamente.

| Condição | Código | Fatal? | Fallback T4.5 |
|----------|--------|--------|--------------|
| JSON inválido (parse error) | `INVALID_JSON` | Sim | `formato_invalido` |
| `reply_text` ausente | `MISSING_REPLY_TEXT` | Sim | `omissao_campos` |
| `reply_text` vazio | `MISSING_REPLY_TEXT` | Sim | `omissao_campos` |
| Timeout da chamada LLM | `LLM_TIMEOUT` | Sim | `erro_modelo` |
| Modelo indisponível | `LLM_UNAVAILABLE` | Sim | `erro_modelo` |
| Rate limit excedido | `LLM_RATE_LIMIT` | Sim | `erro_modelo` |
| `reply_text` com referência interna explícita | `INVALID_REPLY_TEXT_CONTENT` | Não | Aviso; sem fallback |
| Chave de fato desconhecida | `UNKNOWN_FACT_KEY` | Não | Ignorar campo; aviso |
| Score de confiança inválido | `INVALID_CONFIDENCE_SCORE` | Não | Default `"low"` |
| Tipo de objetivo inválido | `INVALID_OBJ_TYPE` | Não | Ignorar; null |
| Campo extra indesejado | `EXTRA_FIELDS` | Não | Ignorar campo |

### 8.2 Fluxo de tratamento de saída malformada (erro fatal)

```
Erro fatal detectado
       │
       ▼
[1] LLMResult.parse_successful = false
[2] Registrar ParseError[] com código e descrição
[3] Registrar no TurnoRastro: { error_type, parse_errors, turn_id, case_id }
[4] NÃO tentar nova chamada ao LLM
[5] NÃO tentar "corrigir" a saída manualmente
[6] Encaminhar para fallback T4.5 com código de erro adequado:
    - INVALID_JSON → fallback "formato_invalido"
    - MISSING_REPLY_TEXT → fallback "omissao_campos"
    - LLM_TIMEOUT/UNAVAILABLE/RATE_LIMIT → fallback "erro_modelo"
[7] Pipeline deste turno encerrado após fallback
```

### 8.3 Princípio de não-improvisação

O orquestrador **nunca** tenta:
- Corrigir JSON malformado extraindo `reply_text` por heurística.
- Gerar `reply_text` substituto quando o LLM não o produziu.
- Tentar segunda chamada ao LLM para obter saída bem formada.
- Passar para T4.3 com `reply_text` ausente ou inválido.

**LLP-INV-04:** Saída malformada → fallback imediato. Nunca improviso.

---

## §9 Separação de componentes da saída

Após parse bem-sucedido, `LLMResult` é decomposto em streams separados para os consumidores
downstream:

```
LLMResult
    │
    ├── reply_text ──────────────────────────────────────────────────→ [IMUTÁVEL — texto bruto]
    │       │                                                           Nunca lido por T4.3 diretamente.
    │       │                                                           Entrega condicional ao ValidationResult:
    │       │                                                             APPROVE/REQUIRE_REVISION/PREVENT_PERSISTENCE
    │       │                                                               → T4.4 (entrega ao canal)
    │       │                                                             REJECT
    │       │                                                               → T4.5 (fallback/revisão)
    │       │
    │       └── [mecânico extrai] LLMResponseMeta ────────────────→ T4.3 (validador VC-01..VC-09)
    │                              (sinais estruturados;               [texto bruto nunca exposto
    │                               nunca o texto bruto)               ao validador]
    │
    ├── facts_updated_candidates ─────────────────────────────────→ T4.3 (validação + reconciliação)
    │                                                                  [T4.3 valida, confirma, reconcilia]
    │
    ├── confidence ──────────────────────────────────────────────→ T4.4 (rastro) + T4.3 (contexto)
    │
    ├── next_objective_candidate ─────────────────────────────────→ T4.3 (mecânico valida ou substitui)
    │
    ├── parse_errors (não-fatais) ─────────────────────────────→ T4.4 (rastro — validation_warnings)
    │
    └── latency_ms, tokens_used, call_timestamp ──────────────→ T4.4 (métricas do TurnoRastro)
```

### 9.1 Rota de `reply_text`

`reply_text` é **imutável** após captura — mas não circula por T4.3 como texto bruto.
A separação é em dois níveis:

**Nível 1 — `reply_text` bruto vs. `LLMResponseMeta`:**

- `reply_text` bruto: **não entra em T4.3** — não é lido pelo validador, policy engine nem
  reconciliador. Fica registrado em `LLMResult` e no `TurnoRastro`.
- `LLMResponseMeta` (§5.4): sinais estruturados extraídos pelo mecânico a partir de
  `reply_text`. É o único canal pelo qual o validador VC-01..VC-09 acessa informações
  derivadas da resposta do LLM — nunca o texto livre.

**Por que `reply_text` bruto não transita por T4.3:**
- Expor texto livre ao validador (componente mecânico) criaria risco de o validador se tornar
  árbitro de conteúdo de fala — violação de A00-ADENDO-01.
- A informação que interessa ao validador é estrutural: "a resposta contém promessa de
  aprovação?" ou "é um template rígido?" — não o texto livre em si.
- `LLMResponseMeta` captura exatamente esses sinais sem violar a soberania do LLM.

**Nível 2 — Entrega de `reply_text` ao canal é condicional ao `ValidationResult`:**

| `ValidationResult` | Persistência | `reply_text` entregue ao canal? | Rota |
|--------------------|-------------|--------------------------------|------|
| `APPROVE` | Delta aplicado integralmente | **Sim** | T4.4 → canal |
| `REQUIRE_REVISION` | Apenas `safe_fields` aplicados | **Sim** — persistência parcial; fala não afetada | T4.4 → canal |
| `PREVENT_PERSISTENCE` | Nenhuma persistência | **Sim** — estado não avança; lead recebe resposta | T4.4 → canal |
| `REJECT` | Delta descartado; `lead_state` revertido | **Não** — reply_text não enviado | T4.5 fallback |

### 9.2 Rota de `facts_updated_candidates`

`facts_updated_candidates` são **candidatos** — não fatos confirmados.

Em T4.3:
1. Política de confiança (T2.3) é aplicada: cada candidato recebe `status = "captured"` (não `"confirmed"`).
2. Reconciliação (T2.4) verifica contradições com estado existente.
3. Validador (T3.4) aprova ou bloqueia a persistência dos candidatos.
4. Apenas após `ValidationResult = APPROVE` ou `REQUIRE_REVISION + advisory`, os candidatos
   transitam para fatos no `lead_state` atualizado.

---

## §10 Invariante de não-sobrescrita de `reply_text`

### 10.1 Declaração formal

> **`reply_text` capturado em `LLMResult` é o texto final entregue ao canal.**
> Nenhum componente posterior ao LLM pode alterar, complementar, prefixar, sufixar
> ou substituir esse texto.

### 10.2 Tabela de conformidade por componente

| Componente | Pode ler `reply_text` bruto? | Pode alterar `reply_text`? | Violação se alterar |
|------------|------------------------------|--------------------------|---------------------|
| Orquestrador (Etapa 3) | Sim — para capturar e extrair `LLMResponseMeta` | **Não** após captura | LLP-INV-05 |
| Policy engine T3 (via T4.3) | **Não** | **Não** | LLP-INV-05 / LLP-INV-11 |
| Reconciliador T2 (via T4.3) | **Não** | **Não** | LLP-INV-05 / LLP-INV-11 |
| Validador VC-01..09 (via T4.3) | **Não** — recebe `LLMResponseMeta` (sinais estruturados), nunca o texto bruto | **Não** | LLP-INV-05 / LLP-INV-11 |
| Etapa T4.4 (resposta + rastro) | Sim — **somente quando** `ValidationResult` permite envio seguro | **Não** | LLP-INV-05 |
| Etapa T4.5 (fallbacks) | Não (registrado no TurnoRastro, mas T4.5 não o reutiliza) | **Não** — produz resposta de fallback *nova*, separada | LLP-INV-05 se tentar reescrever |
| Canal (gateway) | Sim — para exibir (quando entregue por T4.4) | **Não** | Fora do escopo T4 |

### 10.3 Comportamento de `reply_text` por resultado de validação (T4.3)

`reply_text` é **imutável em todos os casos** — nunca reescrito. O que varia é a rota de
entrega ao canal.

| `ValidationResult` | Persistência | `reply_text` enviado ao canal? | Rota de entrega |
|--------------------|-------------|-------------------------------|-----------------|
| `APPROVE` | Delta aplicado integralmente | **Sim** | T4.4 → canal |
| `REQUIRE_REVISION` | Apenas `safe_fields` aplicados; `blocked_fields` descartados | **Sim** — persistência é parcial; a fala não é afetada | T4.4 → canal |
| `PREVENT_PERSISTENCE` | Nenhuma persistência; `lead_state` inalterado | **Sim** — o lead recebe a resposta; apenas o estado não avança | T4.4 → canal |
| `REJECT` | Delta descartado; `lead_state` revertido ao `prior_lead_state` | **Não** — `reply_text` não é enviado | T4.5 fallback/revisão |

**Distinção canônica entre `PREVENT_PERSISTENCE` e `REJECT`:**

- **`PREVENT_PERSISTENCE`**: a resposta do LLM é segura para o cliente — apenas dados
  específicos são inseguros para persistir (ex.: fato com `confidence = low` abaixo do
  limiar VC-05). O lead recebe a fala. Estado não avança nos campos bloqueados.
- **`REJECT`**: a resposta do LLM é inaceitável como um todo — ex.: `proposed_state_delta`
  contém campo com semântica de `reply_text` (VC-01 critical), colisão não registrada
  (VC-04 critical). O lead não recebe essa fala. T4.5 produz resposta segura *nova*.

**`reply_text` permanece imutável em ambos os casos.** T4.5 produz uma resposta de fallback
independente — não uma versão editada de `reply_text` capturado.

---

## §11 Regras invioláveis (LLP-INV-01..LLP-INV-10)

| Código | Regra |
|--------|-------|
| **LLP-INV-01** | A ordem dos blocos do prompt é fixa: §SYS → §CTX → §POL → §OUT. Variações são não conformidade. |
| **LLP-INV-02** | §SYS (system prompt) é imutável dentro de um turno; nenhum campo de TurnoEntrada ou ContextoTurno pode alterar o conteúdo de §SYS. |
| **LLP-INV-03** | Exatamente uma chamada LLM por turno. Saída malformada → fallback imediato, nunca segunda chamada. |
| **LLP-INV-04** | Saída malformada com erro fatal → fallback imediato (T4.5). Nunca improviso, nunca correção heurística. |
| **LLP-INV-05** | `reply_text` capturado em `LLMResult` é imutável. Nenhum componente downstream pode alterá-lo. Imutabilidade não equivale a entrega garantida: se `ValidationResult = REJECT`, `reply_text` não é enviado ao canal — T4.5 produz resposta de fallback nova sem reescrevê-lo. |
| **LLP-INV-06** | O prompt (§CTX, §POL, §OUT) nunca contém texto pré-redigido dirigido ao cliente. |
| **LLP-INV-07** | `reply_text` de turnos anteriores nunca aparece no prompt como "exemplo" ou "modelo de resposta". |
| **LLP-INV-08** | Campos declarados pelo LLM em `facts_updated` são sempre candidatos com `source: "llm_collected"` e `confirmed: false` até validação em T4.3. |
| **LLP-INV-09** | `LLMResult.facts_updated_candidates` com chave desconhecida é descartado com aviso — nunca persistido. |
| **LLP-INV-10** | O bloco §OUT instrui formato — nunca conteúdo. Nenhuma frase de exemplo para `reply_text` pode aparecer em §OUT. |
| **LLP-INV-11** | O validador T4.3 nunca recebe `reply_text` bruto. O mecânico extrai `LLMResponseMeta` (sinais estruturados) a partir de `reply_text` antes da validação. `reply_text` bruto nunca transita por componentes mecânicos de T4.3. |

---

## §12 Anti-padrões proibidos

| Código | Anti-padrão | Violação |
|--------|-------------|---------|
| AP-LLP-01 | Incluir no prompt §CTX o `reply_text` de turnos anteriores como "contexto do diálogo" | LLP-INV-07; AP-LLP-07 do T4.1 |
| AP-LLP-02 | Modificar `reply_text` após captura para "completar" ou "corrigir" a resposta do LLM | LLP-INV-05; A00-ADENDO-01 |
| AP-LLP-03 | Fazer segunda chamada ao LLM quando a primeira retornou saída malformada | LLP-INV-03; LLP-INV-04 |
| AP-LLP-04 | Incluir no prompt §CTX scripts por stage ("quando em qualification, peça primeiro...") | A00-ADENDO-01; T1_SYSTEM_PROMPT_CANONICO §5 anti-padrão |
| AP-LLP-05 | Incluir no prompt §OUT exemplos de `reply_text` por cenário ("se o lead for autônomo, diga...") | LLP-INV-10; A00-ADENDO-01 |
| AP-LLP-06 | Gerar texto de fallback dentro do pipeline LLM para saída malformada | LLP-INV-04; fallback é escopo T4.5 |
| AP-LLP-07 | Aceitar `reply_text` vazio do LLM como "resposta válida silenciosa" | LLP-INV-05; fallback `omissao_campos` obrigatório |
| AP-LLP-08 | Persistir `facts_updated_candidates` sem passar por validação T4.3 | LLP-INV-08; violação de T2_RECONCILIACAO |
| AP-LLP-09 | Usar `next_objective_candidate` do LLM diretamente no `lead_state` sem validação mecânica | LLP-INV-08; mecânico é soberano na regra |
| AP-LLP-10 | Incluir identificadores internos legíveis no texto do prompt dirigido ao cliente (`fact_*`, `OBJ_*`, `COL-*`, etc.) | T1_SYSTEM_PROMPT_CANONICO §3 proibição 5 |
| AP-LLP-11 | Construir o prompt com dados fora do `ContextoTurno` (ex.: dados de outro case, dados de cache não reconciliado) | LLP-INV-02; integridade do ContextoTurno |
| AP-LLP-12 | Omitir o bloco §SYS para "economizar tokens" | LLP-INV-01; LLP-INV-02; A00-ADENDO-01 |
| AP-LLP-13 | Expor `reply_text` bruto ao validador T4.3 diretamente (sem extração de `LLMResponseMeta`), tornando o validador árbitro de conteúdo de fala | LLP-INV-11; A00-ADENDO-01; separa mecânico/LLM |
| AP-LLP-14 | Assumir que `reply_text` é sempre entregue ao canal independente do `ValidationResult` — ignorar o caso `REJECT` | LLP-INV-05; §10.3 |

---

## §13 Exemplos sintéticos

### E1 — Prompt montado para lead CLT, objetivo de coleta de renda

**Situação:** Lead confirmou regime CLT, renda pendente, turno 3.

```
=== PipelinePrompt (representação esquemática) ===

[§SYS]
  === SYSTEM PROMPT — ENOVA 2 — v1 ===
  ... (conteúdo completo de T1_SYSTEM_PROMPT_CANONICO §3) ...

[§CTX — MENSAGEM DO LEAD]
  Texto recebido: "Trabalho com carteira assinada, ganho mais ou menos 3.200"
  Canal: whatsapp

[§CTX — OBJETIVO DO TURNO]
  Objetivo atual: OBJ_COLETAR
  Alvo: fact_monthly_income_p1
  Nível de risco: low
  Status de elegibilidade: unknown

[§CTX — ESTADO OPERACIONAL]
  Fase: qualification
  Bloqueios ativos: nenhum
  Prioridades de coleta: fact_monthly_income_p1
  Confirmação pendente: false
  Contradições abertas: nenhuma

[§CTX — FATOS COLETADOS]
  fact_work_regime_p1: CLT [status: confirmed, confirmado: true]
  fact_estado_civil: solteiro [status: captured, confirmado: false]

[§CTX — PENDÊNCIAS]
  PEND_SLOT_VAZIO: fact_monthly_income_p1

[§CTX — HISTÓRICO RECENTE]
  Turno 1: Lead perguntou sobre MCMV. Coletado: fact_customer_goal = compra_proprio.
  Turno 2: Lead confirmou CLT e estado civil. fact_work_regime_p1 = confirmed.

[§POL]
  (bloco omitido — nenhuma decision pré-calculada, nenhum veto ativo)

[§OUT — FORMATO DE RESPOSTA ESPERADO]
  ... (instrução de JSON — §3.4.1) ...
```

**Saída esperada do LLM:**
```json
{
  "reply_text": "Ótimo! Com carteira assinada, fica mais simples de verificar seu enquadramento. Você mencionou que ganha em torno de R$ 3.200 — esse valor é a sua renda mensal líquida, já descontado o INSS e o IR? Só preciso confirmar para ter certeza na análise.",
  "facts_updated": {
    "fact_monthly_income_p1": {
      "value": 3200,
      "source": "llm_collected",
      "confirmed": false
    }
  },
  "confidence": {
    "score": "medium",
    "reason": "valor mencionado mas não confirmado formalmente"
  },
  "next_objective_candidate": {
    "type": "OBJ_CONFIRMAR",
    "target": "fact_monthly_income_p1"
  }
}
```

**LLMResult após parse:**
- `parse_successful = true`
- `reply_text` capturado e imutável
- `facts_updated_candidates = { fact_monthly_income_p1: { value: 3200, source: "llm_collected", confirmed: false } }`
- `confidence = { score: "medium" }`
- `next_objective_candidate = { type: "OBJ_CONFIRMAR", target: "fact_monthly_income_p1" }`

---

### E2 — Saída malformada: `reply_text` ausente

**Situação:** LLM retornou JSON sem o campo `reply_text`.

```json
// Saída do LLM (JSON malformado — falta reply_text):
{
  "facts_updated": {
    "fact_work_regime_p1": { "value": "autonomo", "source": "llm_collected", "confirmed": false }
  },
  "confidence": { "score": "low" }
}
```

**Processamento:**
- Parse JSON: OK
- `reply_text` ausente → `ParseError { code: "MISSING_REPLY_TEXT", fatal: true }`
- `LLMResult.parse_successful = false`
- Fallback `omissao_campos` acionado (T4.5)
- Pipeline encerrado; nenhum `reply_text` entregue ao canal até que T4.5 produza resposta segura

---

### E3 — Saída com campo extra ignorado

**Situação:** LLM incluiu campo `pending` (gerado pelo mecânico — não pelo LLM).

```json
{
  "reply_text": "Entendido! Posso saber também se você tem declaração de IR?",
  "facts_updated": {},
  "confidence": { "score": "high" },
  "pending": [{ "type": "PEND_SLOT_VAZIO", "target": "fact_autonomo_has_ir_p1" }]
}
```

**Processamento:**
- `reply_text` capturado: "Entendido! Posso saber também se você tem declaração de IR?"
- `pending` detectado → `ParseError { code: "EXTRA_FIELDS", field: "pending", fatal: false }`
- Campo `pending` ignorado; mecânico determinará em T4.3
- `LLMResult.parse_successful = true` (erro não-fatal não invalida o parse)
- Aviso registrado no `TurnoRastro`

---

### E4 — Prompt com veto suave ativo

**Situação:** Lead autônomo; turno anterior emitiu veto suave de IR não declarado.

```
[§POL — DECISÕES DE POLÍTICA ATIVAS]
  Classe: confirmação
  Regra: R_AUTONOMO_IR
  Alvo: fact_autonomo_has_ir_p1
  Motivo: "Autônomo identificado — IR pendente de coleta"

[§POL — RISCOS SOFT ATIVOS]
  Risco: RISCO_IR_AUTONOMO
  Descrição: "Autônomo sem IR confirmado — risco de comprovação de renda reduzido"
  acknowledged: false
```

**Efeito esperado:** O LLM usa o contexto de política para raciocinar com consciência do
risco de IR — sem que o prompt prescreva o que dizer. A resposta natural será conduzida
pelo LLM com base em sua expertise (T1_SYSTEM_PROMPT_CANONICO §4 — QUANDO autônomo sem IR).

---

### E5a — `reply_text` capturado; `REQUIRE_REVISION` — reply_text entregue

**Situação:** LLM coletou `fact_estado_civil = "casado_civil"` contradizendo fato anterior
`"solteiro"` confirmado.

**LLMResult:**
```
reply_text: "Ah, casado no civil — então precisaremos incluir o seu cônjuge no processo também. Tudo bem começarmos com as informações do cônjuge?"
facts_updated_candidates: { fact_estado_civil: { value: "casado_civil", source: "llm_collected", confirmed: false } }
```

**`LLMResponseMeta` extraído pelo mecânico:**
```
LLMResponseMeta {
  contains_approval_promise:    false
  contains_ineligibility_claim: false
  contains_mechanical_template: false
  objective_referenced:         "OBJ_COLETAR"
  vetos_acknowledged:           []
}
```

**Em T4.3:**
- Reconciliação detecta contradição: `fact_estado_civil` era `"solteiro"` (confirmed)
- Validador VC-07 FAIL (advisory) — fato não transitou; conflito registrado
- `ValidationResult = REQUIRE_REVISION`; `facts_updated_candidates` bloqueados

**Rota de `reply_text`:**
- `ValidationResult = REQUIRE_REVISION` → `reply_text` **entregue ao canal** (T4.4)
- O estado não é atualizado até confirmação do conflito
- `TurnoRastro` registra `validation_result = REQUIRE_REVISION`

---

### E5b — `reply_text` capturado; `REJECT` — reply_text NOT entregue

**Situação:** Lead com colisão detectável (dois roteamentos contraditórios), mas
`proposed_state_delta` não registrou a colisão — VC-04 critical FAIL.

**LLMResult:**
```
reply_text: "Ótimo, vou te encaminhar para nosso especialista de financiamento simultaneamente ao processo de documentação."
facts_updated_candidates: {}
```

**`LLMResponseMeta` extraído pelo mecânico:**
```
LLMResponseMeta {
  contains_approval_promise:    false
  contains_ineligibility_claim: false
  contains_mechanical_template: false
  objective_referenced:         "OBJ_ROTEAR"
  vetos_acknowledged:           []
}
```

**Em T4.3:**
- Validador detecta colisão `COL-ROUTING-MULTI` não registrada em `collisions[]`
- VC-04 FAIL (critical) → `ValidationResult = REJECT`
- `proposed_state_delta` descartado; `lead_state` revertido ao `prior_lead_state`

**Rota de `reply_text`:**
- `ValidationResult = REJECT` → `reply_text` **não é enviado ao canal**
- Pipeline aciona **T4.5** — que produz resposta de fallback *nova*, segura
- `reply_text` original permanece **imutável** no `TurnoRastro` (registro auditável)
- `TurnoRastro` registra `validation_result = REJECT`, `blocking_items = ["VC-04"]`

---

## §14 Cobertura das microetapas do mestre

| Microetapa do mestre (T4) | Cobertura neste documento |
|--------------------------|--------------------------|
| Microetapa 1 — Padronizar a entrada | Declarada como escopo de T4_ENTRADA_TURNO.md (PR-T4.1) — não coberta aqui |
| **Microetapa 2 — Executar o LLM com contrato único e capturar tanto o texto quanto a estrutura** | **Cobertura completa:** §2 (shape do prompt), §3 (montagem), §4 (contrato único), §5 (shapes de saída), §6 (captura de reply_text), §7 (captura estruturada), §8 (malformado), §9 (separação), §10 (imutabilidade) ✓ |
| Microetapa 3 — Policy engine + reconciliação antes de persistir | Declarada como escopo de T4_VALIDACAO_PERSISTENCIA.md (PR-T4.3) — não coberta aqui |
| Microetapas 4 e 5 | Escopos de PRs T4.4 e T4.5 |

---

## §15 Validação cruzada com T1/T2/T3/T4.1

| Referência cruzada | Campo/ponto verificado | Status |
|-------------------|----------------------|--------|
| `T1_SYSTEM_PROMPT_CANONICO.md §3` | §SYS usa texto completo do system prompt canônico v1 | **PASS** — §3.1 |
| `T1_SYSTEM_PROMPT_CANONICO.md §5` | Prompt não contém anti-padrões proibidos (scripts, templates, linguagem de sistema) | **PASS** — LLP-INV-06/07/10; AP-LLP-04/05/10/12 |
| `T1_CONTRATO_SAIDA.md §2.1` | `LLMResult` produz `reply_text`, `facts_updated` (candidatos), `confidence` — campos LLM de TurnoSaida | **PASS** — §5.3 |
| `T1_CONTRATO_SAIDA.md §1` | Mecânico produz campos restantes (pending, conflicts, risks, etc.) em T4.3 | **PASS** — §5.3 tabela |
| `T1_CONTRATO_SAIDA.md §3.1` | `reply_text` nunca pré-montado pelo mecânico; capturado e imutável | **PASS** — §6, §10, LLP-INV-05 |
| `T1_COMPORTAMENTOS_E_PROIBICOES.md §2` | Comportamentos obrigatórios do LLM são orientados via §SYS + §CTX, não prescritos | **PASS** — §3.1 + §3.2 |
| `T2_LEAD_STATE_V1.md §4.2` | `facts_updated_candidates` preservam shape `FactEntry` com `source`, `confirmed`, `status` | **PASS** — §7.1 |
| `T2_LEAD_STATE_V1.md §4.3` | Candidatos recebem `status = "captured"` em T4.3, não neste estágio | **PASS** — §9.2 |
| `T2_RESUMO_PERSISTIDO.md §1.1` | L1 aparece no §CTX apenas como entrada do lead + campos coletados — nunca reply_text de turnos anteriores | **PASS** — §3.2.1; LLP-INV-07 |
| `T3_CLASSES_POLITICA.md §1` | `prior_decisions` em §POL apresentados como orientação de raciocínio — sem reply_text em action | **PASS** — §3.3 |
| `T3_VETO_SUAVE_VALIDADOR.md §2` | `soft_vetos` em §POL como orientação de risco — sem prescrição de fala | **PASS** — §3.3.1 |
| `T3_VETO_SUAVE_VALIDADOR.md §2.3` | `LLMResponseMeta` shape canônico: `contains_approval_promise`, `contains_ineligibility_claim`, `contains_mechanical_template`, `objective_referenced`, `vetos_acknowledged`; validador nunca expõe `reply_text` bruto | **PASS** — §5.4, §9.1, LLP-INV-11, AP-LLP-13 |
| `T3_VETO_SUAVE_VALIDADOR.md §2.5` | `REJECT` resulta em descarte de delta + lead_state revertido — `reply_text` não entregue ao canal nesse caso | **PASS** — §10.3, LLP-INV-05, AP-LLP-14 |
| `T4_ENTRADA_TURNO.md §6.4` | `ContextoTurno` é a base de todos os blocos do prompt; campos mapeados fielmente | **PASS** — §3.2.1 |
| `T4_ENTRADA_TURNO.md §6.3` | reply_text de turnos anteriores proibido no contexto — reafirmado aqui | **PASS** — LLP-INV-07; AP-LLP-01 |
| `T4_CONTRATO.md §7 CA-01` | Orquestrador não produz reply_text; LLM é única origem | **PASS** — §6, §10, LLP-INV-05 |
| `T4_CONTRATO.md §7 CA-03` | Uma única chamada LLM por turno; reply_text nunca sobrescrito | **PASS** — §4, LLP-INV-03/05 |
| `A00-ADENDO-01` | LLM soberano na fala; mecânico nunca redige reply_text | **PASS** — §1, §10, todos os LLP-INV |
| `A00-ADENDO-02` | Orquestrador como coordenador; contexto informa — não domina o LLM | **PASS** — §3.2.1; AP-LLP-04/05 |

---

## Bloco E — PR-T4.2

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_PIPELINE_LLM.md (este documento)
PR que fecha:                          PR-T4.2 (Pipeline LLM com contrato único — corrigido)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — shape PipelinePrompt com 4 blocos; montagem §CTX
                                       com 7 subseções; contrato de chamada única §4; shapes
                                       LLMCallContract + LLMOutputRaw + LLMResult; LLMResponseMeta
                                       (§5.4) com sinais canônicos de T3.4; captura de reply_text
                                       §6 com invariante de imutabilidade §10; entrega condicional
                                       por ValidationResult (APPROVE/REQUIRE_REVISION/
                                       PREVENT_PERSISTENCE → T4.4; REJECT → T4.5); separação
                                       de componentes §9; LLP-INV-01..11; 14 anti-padrões AP-LLP;
                                       6 exemplos (E1–E4, E5a, E5b); microetapa 2 coberta;
                                       cross-ref T1/T2/T3/T4.1 em 19 dimensões.
                                       Policy + reconciliação + persistência (T4.3) são escopos
                                       de PR-T4.3 — não são lacunas.
Há item parcial/inconclusivo bloqueante?: não — todos os shapes têm definição completa;
                                       invariante de unicidade de chamada LLM declarada;
                                       reply_text imutável e entrega condicional declaradas;
                                       LLMResponseMeta conforme T3.4; saída malformada com
                                       tratamento declarativo; zero runtime implementado.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.2 CONCLUÍDA; T4_PIPELINE_LLM.md publicado
                                       e corrigido (LLMResponseMeta + entrega condicional);
                                       PR-T4.3 desbloqueada.
Próxima PR autorizada:                 PR-T4.3 — Validação policy engine + reconciliação antes de persistir
```
