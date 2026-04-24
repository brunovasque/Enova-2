# T1_CONTRATO_SAIDA — Contrato de Saída do Agente ENOVA 2

## Finalidade

Este documento define o **contrato canônico de saída estruturada do agente ENOVA 2** por turno de
atendimento.

O contrato de saída especifica os campos esperados, a semântica de cada campo, quem é responsável
por cada campo e os limites invioláveis de cada um.

Este documento é uma **interface conceitual** — não é schema de banco de dados (T2), não é
policy engine (T3), não é parser de runtime (T4). É a definição do que um turno completo
produz, independente de canal.

**Princípio canônico:**

> O `reply_text` é sempre e exclusivamente do LLM.
> Todos os demais campos são estruturais — organizam estado e decisão, nunca falam com o cliente.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T1, microetapa "contrato de saída"
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` — tipos canônicos de todos os campos
- `schema/implantation/T1_CAMADAS_CANONICAS.md` — separação das 5 dimensões
- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` — identidade e papel do LLM
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. Princípio de soberania

O contrato de saída respeita rigorosamente a separação de soberania estabelecida em
T1_CAMADAS_CANONICAS:

| Campo | Soberano | Trava canônica |
|-------|----------|----------------|
| `reply_text` | **LLM** | Nunca mecânico. Jamais pré-montado. Proibido template. |
| `facts_updated` | **Mecânico** persiste; **LLM** coleta via conversa | O mecânico não dita o que coletar — recebe e valida |
| `next_objective` | **Mecânico** declara | O LLM decide como conduzir para o objetivo |
| `pending` | **Mecânico** detecta | O LLM decide como abordar cada pendência |
| `conflicts` | **Mecânico** sinaliza | O LLM resolve via diálogo natural |
| `risks` | **Mecânico** classifica | O LLM decide como conduzir com consciência do risco |
| `actions_executed` | **Mecânico** executa | O LLM recebe resultado como contexto — nunca anuncia ação |
| `blocks` | **Mecânico** declara | O LLM comunica com naturalidade — sem expor mecânica |
| `needs_confirmation` | **Mecânico** sinaliza | O LLM conduz a confirmação naturalmente |
| `confidence` | **LLM** sinaliza | Indicador de qualidade — não bloqueia automaticamente |
| `flags` | **Mecânico** emite | O LLM pode receber como contexto — nunca expõe ao cliente |

---

## 2. Schema de saída — campos canônicos

### 2.1 Visão geral do shape descritivo

```
TurnoSaida {
  reply_text:          string          — obrigatório
  turn_id:             string          — obrigatório
  case_id:             string          — obrigatório
  facts_updated:       FactsUpdated    — pode ser vazio
  next_objective:      Objective       — pode ser null
  pending:             Pending[]       — pode ser vazio
  conflicts:           Conflict[]      — pode ser vazio
  risks:               Risk[]          — pode ser vazio
  actions_executed:    Action[]        — pode ser vazio
  blocks:              Block[]         — pode ser vazio
  needs_confirmation:  boolean         — obrigatório
  confidence:          Confidence      — obrigatório
  flags:               Flags           — pode ser vazio
}
```

### 2.2 Shape expandido por campo

```
FactsUpdated {
  <fact_key>: {
    value:     any      — valor coletado ou atualizado
    source:    enum     — "llm_collected" | "confirmed" | "inferred"
    confirmed: boolean  — true somente após confirmação explícita do lead
  }
}

Objective {
  type:   enum    — OBJ_* da T1_TAXONOMIA_OFICIAL
  target: string  — fact ou contexto alvo (opcional)
}

Pending {
  type:   enum    — PEND_* da T1_TAXONOMIA_OFICIAL
  target: string  — fact ou slot obrigatório ausente
}

Conflict {
  type:           enum     — CONF_* da T1_TAXONOMIA_OFICIAL
  facts_involved: string[] — lista de fact_keys em contradição
}

Risk {
  type:     enum   — RISCO_* da T1_TAXONOMIA_OFICIAL
  severity: enum   — BLOQUEANTE | ORIENTATIVO | INFORMATIVO | VETO | OPERACIONAL
}

Action {
  type:   enum   — ACAO_* da T1_TAXONOMIA_OFICIAL
  result: string — novo estado resultante da ação executada
}

Block {
  reason:     string — motivo do bloqueio (semântico — não expor ao cliente)
  resolution: string — o que precisa acontecer para desbloquear
}

Confidence {
  score:  enum   — "high" | "medium" | "low"
  reason: string — motivo (opcional — para uso interno/telemetria)
}

Flags {
  bypass_manual:  boolean
  rollback_flag:  boolean
  offtrack:       boolean
  <flag_extra>:   boolean — flags operacionais adicionais conforme contexto
}
```

---

## 3. Semântica de cada campo

### 3.1 `reply_text` — Resposta ao cliente

| Aspecto | Definição |
|---------|-----------|
| Tipo | `string` |
| Obrigatório | Sim — toda saída de turno tem reply_text |
| Responsável | **LLM soberano** |
| O que contém | Texto em linguagem natural dirigido ao cliente — o que a Enova diz no turno |
| O que NÃO pode conter | Referências internas ("seu processo está em stage X"), anúncios de ação mecânica, templates pré-montados |
| Trava crítica | Nenhum outro campo, flag, regra ou mecânico pode redigir este campo. O mecânico pode restringir o que o LLM pode dizer (VETO), mas nunca pode escrever o que o LLM diz. |
| Relação com camadas | Camada TOM: soberano. Camada VETO: pode restringir conteúdo via contexto. Camadas REGRA/SUGESTÃO MANDATÓRIA: instruem o objetivo, não o texto. |

### 3.2 `turn_id` — Identificador do turno

| Aspecto | Definição |
|---------|-----------|
| Tipo | `string` |
| Obrigatório | Sim |
| Responsável | Mecânico (gerado antes do turno) |
| Semântica | Identificador único por turno de atendimento — para rastreabilidade e telemetria |
| O que NÃO pode conter | Dados do lead, identificadores legíveis pelo cliente |

### 3.3 `case_id` — Identificador do case

| Aspecto | Definição |
|---------|-----------|
| Tipo | `string` |
| Obrigatório | Sim |
| Responsável | Mecânico (existente no início do atendimento) |
| Semântica | Identificador do lead/case sendo atendido — âncora de persistência futura (T2) |

### 3.4 `facts_updated` — Facts atualizados no turno

| Aspecto | Definição |
|---------|-----------|
| Tipo | `FactsUpdated` (mapa chave→valor estruturado) |
| Obrigatório | Não — pode ser vazio se o turno não coletou nenhum fact novo |
| Responsável | LLM coleta via conversa; mecânico valida e estrutura para persistência |
| Semântica | Conjunto de facts que foram coletados, atualizados ou confirmados neste turno |
| Chaves | Nomes canônicos da taxonomia: `fact_work_regime_p1`, `fact_estado_civil`, etc. |
| Campo `source` | `"llm_collected"` = LLM declarou coleta; `"confirmed"` = lead confirmou; `"inferred"` = derivado com baixa certeza |
| Campo `confirmed` | `true` somente quando o lead confirmou explicitamente — fatos não confirmados são hipóteses |
| O que NÃO pode conter | Textos de resposta, histórico de conversa, dados não declarados pelo lead |
| Amarração à taxonomia | Tipos F1–F8 de `T1_TAXONOMIA_OFICIAL.md` |

### 3.5 `next_objective` — Próximo objetivo do turno

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Objective` ou `null` |
| Obrigatório | Não — pode ser null se o turno não define próximo passo |
| Responsável | Mecânico (declara depois de avaliar o estado pós-turno) |
| Semântica | O próximo objetivo operacional que o mecânico instrui para o próximo turno |
| Campo `type` | OBJ_* canônico da taxonomia |
| Campo `target` | fact_key ou contexto alvo, quando aplicável (ex.: `OBJ_COLETAR` aponta qual fact) |
| O que NÃO pode conter | Texto de script, instruções de vocabulário, o que o LLM deve dizer |
| Relação com camadas | Camada REGRA: o mecânico instrui o objetivo. Camada TOM: o LLM decide como conduzir. |
| Amarração à taxonomia | Tipos OBJ_* de `T1_TAXONOMIA_OFICIAL.md` §3 |

### 3.6 `pending` — Pendências detectadas

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Pending[]` |
| Obrigatório | Não — pode ser vazio |
| Responsável | Mecânico (avalia estado contra gates obrigatórios do stage) |
| Semântica | Slots obrigatórios para o stage atual ainda não preenchidos ou confirmados |
| Campo `type` | PEND_* canônico da taxonomia |
| Campo `target` | fact_key ou contexto que está pendente |
| O que NÃO pode conter | Frases de cobrança ao cliente, lembretes pré-montados |
| Amarração à taxonomia | Tipos PEND_* de `T1_TAXONOMIA_OFICIAL.md` §4 |

### 3.7 `conflicts` — Conflitos de dados detectados

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Conflict[]` |
| Obrigatório | Não — pode ser vazio |
| Responsável | Mecânico (detecta contradições entre facts) |
| Semântica | Contradições entre dados coletados que impedem persistência sem confirmação |
| Campo `type` | CONF_* canônico da taxonomia |
| Campo `facts_involved` | Lista de fact_keys em contradição |
| Efeito automático | Um conflict ativo implica `needs_confirmation = true` |
| O que NÃO pode conter | Scripts de confirmação, frases de esclarecimento, templates de diálogo |
| Amarração à taxonomia | Tipos CONF_* de `T1_TAXONOMIA_OFICIAL.md` §5 |

### 3.8 `risks` — Riscos sinalizados

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Risk[]` |
| Obrigatório | Não — pode ser vazio |
| Responsável | Mecânico (classifica riscos no estado atual) |
| Semântica | Ameaças ao processo identificadas pelo mecânico — informam o raciocínio do LLM |
| Campo `type` | RISCO_* canônico da taxonomia |
| Campo `severity` | Severidade canônica: BLOQUEANTE / ORIENTATIVO / INFORMATIVO / VETO / OPERACIONAL |
| O que NÃO pode conter | Alertas visíveis ao cliente, avisos automáticos, textos de advertência |
| Relação com blocks | Riscos BLOQUEANTE com condição não resolvida geram um `block` correspondente |
| Amarração à taxonomia | Tipos RISCO_* de `T1_TAXONOMIA_OFICIAL.md` §6 |

### 3.9 `actions_executed` — Ações executadas no turno

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Action[]` |
| Obrigatório | Não — pode ser vazio |
| Responsável | Mecânico (executa ações de estado em resposta a gates satisfeitos) |
| Semântica | Operações de estado que o mecânico executou neste turno (antes ou após o reply_text) |
| Campo `type` | ACAO_* canônico da taxonomia |
| Campo `result` | Descrição do novo estado resultante (ex.: `current_stage = qualification_special`) |
| O que NÃO pode conter | Mensagens de confirmação ao cliente, logs visíveis, anúncios de ação |
| Relação com reply_text | O LLM pode conduzir em função do resultado de uma ação — mas nunca anuncia a ação |
| Amarração à taxonomia | Tipos ACAO_* de `T1_TAXONOMIA_OFICIAL.md` §7 |

### 3.10 `blocks` — Bloqueios ativos

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Block[]` |
| Obrigatório | Não — pode ser vazio |
| Responsável | Mecânico (declara bloqueios que impedem avanço) |
| Semântica | Condições que impedem a progressão do case no estado atual |
| Campo `reason` | Motivo semântico do bloqueio — uso interno |
| Campo `resolution` | O que precisa acontecer para remover o bloqueio |
| O que NÃO pode conter | Texto comunicado ao cliente, mensagens automáticas, anúncios de bloqueio |
| Relação com risks | Todo risco BLOQUEANTE não resolvido deve ter um block correspondente |
| Relação com reply_text | O LLM comunica o bloqueio com naturalidade, sem expor a mecânica interna |

### 3.11 `needs_confirmation` — Flag de confirmação pendente

| Aspecto | Definição |
|---------|-----------|
| Tipo | `boolean` |
| Obrigatório | Sim |
| Responsável | Mecânico (sinaliza após detectar conflito ou incerteza crítica) |
| Semântica | `true` indica que existe dado em estado de conflito ou incerteza que precisa de confirmação explícita do lead antes de avançar |
| Efeito no mecânico | Bloqueia persistência de facts conflitantes; aciona `OBJ_CONFIRMAR` |
| Efeito no LLM | O LLM recebe como contexto e conduz confirmação com naturalidade |
| O que NÃO pode conter | Texto pré-montado de confirmação |

### 3.12 `confidence` — Sinal de confiança do LLM

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Confidence` |
| Obrigatório | Sim |
| Responsável | **LLM** (único campo de meta-avaliação do LLM) |
| Semântica | Avaliação do LLM sobre a qualidade e completude dos dados coletados neste turno |
| Campo `score` | `"high"` — dados claros e confirmados; `"medium"` — dados coletados mas com ambiguidade; `"low"` — dados incertos, lead evasivo ou turno inconclusivo |
| Campo `reason` | Texto interno opcional explicando a avaliação — não dirigido ao cliente |
| O que NÃO pode conter | Texto ao cliente, alertas, diagnósticos automáticos |
| Uso | Telemetria e raciocínio — o mecânico pode usar para acionar revisão ou fluxo de reforço |

### 3.13 `flags` — Flags operacionais

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Flags` |
| Obrigatório | Não — pode ser vazio / todos false |
| Responsável | Mecânico |
| Semântica | Sinais operacionais que afetam roteamento, tratamento e telemetria do turno |
| `bypass_manual` | `true` se o case foi desviado para atendimento manual neste turno |
| `rollback_flag` | `true` se o gate de rollback foi acionado |
| `offtrack` | `true` se o lead estava persistentemente fora do objetivo operacional no turno |
| Flags adicionais | Podem ser adicionadas pelo mecânico para necessidades operacionais específicas |
| O que NÃO pode conter | Textos ao cliente, instruções ao LLM sobre o que dizer |

---

## 4. Tabela resumo: campos × responsável × trava LLM-first

| Campo | Produzido por | Consumido por | Proibição absoluta |
|-------|-------------|--------------|-------------------|
| `reply_text` | **LLM** | Canal / cliente | Mecânico nunca escreve; template nunca substitui |
| `turn_id` | Mecânico | Telemetria / persistência | Não pode ser derivado de dado pessoal do lead |
| `case_id` | Mecânico | Persistência (T2) | Não pode ser exposto ao cliente |
| `facts_updated` | LLM coleta → Mecânico estrutura | Mecânico (persistência T2); LLM (raciocínio próximo turno) | Fact não confirmado não pode ser `confirmed: true` |
| `next_objective` | Mecânico | LLM (próximo turno) | Não pode conter texto ao cliente; não sequencia perguntas |
| `pending` | Mecânico | LLM (contexto do turno) | Não pode conter frases de cobrança ou lembrete |
| `conflicts` | Mecânico | LLM (contexto); necessita `needs_confirmation = true` | Não pode conter script de confirmação |
| `risks` | Mecânico | LLM (contexto) | Não pode conter alertas ao cliente |
| `actions_executed` | Mecânico | LLM (contexto); telemetria | Não pode conter mensagem de confirmação ao cliente |
| `blocks` | Mecânico | LLM (contexto); mecânico (gate) | Não pode ser anunciado automaticamente ao cliente |
| `needs_confirmation` | Mecânico | LLM (contexto); mecânico (gate) | Não pode conter texto pré-montado |
| `confidence` | **LLM** | Telemetria; mecânico (revisão) | `reason` não pode ser texto ao cliente |
| `flags` | Mecânico | Mecânico (roteamento); telemetria | Não pode ser exposto ao cliente |

---

## 5. Amarração à taxonomia T1.3

Todos os tipos dos campos estruturais são os tipos canônicos definidos em
`schema/implantation/T1_TAXONOMIA_OFICIAL.md`:

| Campo | Tipos permitidos | Seção da taxonomia |
|-------|----------------|-------------------|
| `facts_updated` (chaves) | `fact_*` — 18 tipos canônicos F1–F8 | §2 |
| `next_objective.type` | `OBJ_*` — 9 tipos canônicos | §3 |
| `pending[].type` | `PEND_*` — 6 tipos canônicos | §4 |
| `conflicts[].type` | `CONF_*` — 4 tipos canônicos | §5 |
| `risks[].type` | `RISCO_*` — 8 tipos canônicos | §6 |
| `actions_executed[].type` | `ACAO_*` — 11 tipos canônicos | §7 |

**Trava:** Nenhum tipo fora da taxonomia pode aparecer nesses campos sem passar por atualização
formal da taxonomia (PR específica). O contrato de saída não inventa tipos — ele usa os tipos
que a taxonomia define.

---

## 6. Regras de consistência interna

As seguintes invariantes devem ser respeitadas em qualquer saída válida:

| # | Invariante |
|---|-----------|
| I-01 | Se `conflicts` não está vazio, então `needs_confirmation = true` |
| I-02 | Se `needs_confirmation = true`, então `next_objective` deve ser `OBJ_CONFIRMAR` ou incluir esse objetivo como prioritário |
| I-03 | Se `risks` contém `severity: BLOQUEANTE`, então `blocks` deve conter o block correspondente |
| I-04 | Se `actions_executed` contém `ACAO_INELEGIBILIDADE`, então `blocks` deve declarar o bloqueio de inelegibilidade |
| I-05 | `reply_text` nunca pode fazer referência a nenhum campo estrutural pelo nome técnico (`fact_*`, `OBJ_*`, etc.) |
| I-06 | `facts_updated.confirmed = true` somente quando o lead confirmou explicitamente no turno atual ou em turno anterior registrado |
| I-07 | `confidence.score = "low"` implica que o mecânico deve considerar reforço de coleta no próximo turno |
| I-08 | `flags.bypass_manual = true` implica que `actions_executed` contém `ACAO_BYPASS_MANUAL` |

---

## 7. Cenários sintéticos de validação

Os cenários abaixo demonstram o contrato em uso — **sem execução de LLM real, sem código**.
Cada saída é hipotética e serve como referência de conformidade.

### Cenário 1 — Coleta básica: lead CLT, renda dentro da faixa

**Contexto:** Lead em `qualification_core`, regime CLT confirmado, renda dentro da faixa,
sem composição familiar, sem restrição.

```
reply_text:         "Obrigado! Com sua renda e seu regime de trabalho, já temos o
                     suficiente para verificar sua elegibilidade. Antes de avançar,
                     preciso confirmar alguns dados sobre seus documentos — você
                     já tem CPF e RG em mãos?"
turn_id:            "turn_0042"
case_id:            "case_1234"
facts_updated: {
  fact_work_regime_p1: { value: "CLT", source: "confirmed", confirmed: true },
  fact_monthly_income_p1: { value: 3200, source: "confirmed", confirmed: true }
}
next_objective: { type: "OBJ_COLETAR", target: "fact_doc_identity_status" }
pending: [
  { type: "PEND_SLOT_VAZIO", target: "fact_doc_identity_status" }
]
conflicts:          []
risks:              []
actions_executed:   []
blocks:             []
needs_confirmation: false
confidence:         { score: "high", reason: "regime e renda confirmados sem ambiguidade" }
flags:              {}
```

**Verificação de invariantes:** I-01 ✓ (sem conflicts → needs_confirmation=false), I-05 ✓
(reply_text sem termos técnicos), I-06 ✓ (confirmed=true após confirmação explícita).

---

### Cenário 2 — Risco orientativo: autônomo sem IR declarado

**Contexto:** Lead em `qualification_core`, declarou ser autônomo, não confirmou IR,
renda abaixo do mínimo solo.

```
reply_text:         "Entendi, você trabalha por conta própria. Para que possamos
                     verificar sua situação com o programa, é importante saber se
                     você tem declaração de Imposto de Renda — isso ajuda bastante
                     na comprovação. Você costuma declarar o IR anualmente?"
turn_id:            "turn_0055"
case_id:            "case_1235"
facts_updated: {
  fact_work_regime_p1: { value: "autonomo", source: "llm_collected", confirmed: false },
  fact_monthly_income_p1: { value: 1800, source: "llm_collected", confirmed: false }
}
next_objective: { type: "OBJ_ORIENTAR_IR", target: "fact_autonomo_has_ir_p1" }
pending: [
  { type: "PEND_SLOT_VAZIO", target: "fact_autonomo_has_ir_p1" }
]
conflicts:          []
risks: [
  { type: "RISCO_IR_AUTONOMO", severity: "ORIENTATIVO" },
  { type: "RISCO_RENDA_BAIXA", severity: "ORIENTATIVO" }
]
actions_executed:   []
blocks:             []
needs_confirmation: false
confidence:         { score: "medium", reason: "regime declarado mas não confirmado; IR pendente" }
flags:              {}
```

**Verificação:** I-01 ✓, I-03 ✓ (riscos ORIENTATIVO não exigem block), I-05 ✓.

---

### Cenário 3 — Ação automática: casado civil força processo conjunto

**Contexto:** Lead confirmou estado civil casado civil. Mecânico executa
`ACAO_FORCAR_CONJUNTO` antes do turno.

```
reply_text:         "Como você é casado no civil, o programa prevê que o processo
                     seja feito em conjunto com seu cônjuge. Isso é padrão no
                     Minha Casa Minha Vida para esse tipo de união. Para continuar,
                     vou precisar de algumas informações sobre o seu cônjuge também —
                     tudo bem?"
turn_id:            "turn_0061"
case_id:            "case_1236"
facts_updated: {
  fact_estado_civil: { value: "casado_civil", source: "confirmed", confirmed: true },
  fact_processo:     { value: "conjunto",     source: "confirmed", confirmed: true }
}
next_objective: { type: "OBJ_COLETAR", target: "fact_work_regime_p2" }
pending: [
  { type: "PEND_P2_SLOT", target: "fact_work_regime_p2" },
  { type: "PEND_P2_SLOT", target: "fact_monthly_income_p2" }
]
conflicts:          []
risks:              []
actions_executed: [
  { type: "ACAO_FORCAR_CONJUNTO", result: "fact_processo = conjunto; stage mantido" }
]
blocks:             []
needs_confirmation: false
confidence:         { score: "high" }
flags:              {}
```

**Verificação:** I-01 ✓, I-05 ✓ (reply_text menciona cônjuge naturalmente — sem
nomear `fact_processo` ou `ACAO_FORCAR_CONJUNTO`).

---

### Cenário 4 — Inelegibilidade: restrição de crédito bloqueante

**Contexto:** Lead confirmou restrição de crédito alta sem regularização em curso.

```
reply_text:         "Entendo, e obrigada pela honestidade. A situação de crédito
                     que você descreveu pode ser um impedimento para o programa
                     neste momento. O Minha Casa Minha Vida exige que essa restrição
                     esteja regularizada antes de avançar com o processo. Se você
                     resolver essa situação, pode retornar e retomarmos de onde
                     paramos. Posso ajudar com mais alguma dúvida?"
turn_id:            "turn_0078"
case_id:            "case_1237"
facts_updated: {
  fact_credit_restriction:              { value: "alta", source: "confirmed", confirmed: true },
  fact_restriction_regularization_status: { value: "nao_em_regularizacao", source: "confirmed", confirmed: true }
}
next_objective:     null
pending:            []
conflicts:          []
risks: [
  { type: "RISCO_INELEGIBILIDADE_RESTRICAO", severity: "BLOQUEANTE" }
]
actions_executed: [
  { type: "ACAO_INELEGIBILIDADE", result: "elegibility_status = inelegivel" }
]
blocks: [
  {
    reason: "Restrição de crédito alta sem regularização — inelegibilidade declarada",
    resolution: "Lead deve regularizar restrição e retornar"
  }
]
needs_confirmation: false
confidence:         { score: "high" }
flags:              {}
```

**Verificação:** I-03 ✓ (BLOQUEANTE → block correspondente), I-04 ✓
(ACAO_INELEGIBILIDADE → block declarado), I-05 ✓.

---

### Cenário 5 — Conflito de dado: regime de trabalho contradito

**Contexto:** Lead havia confirmado `fact_work_regime_p1 = CLT` em turno anterior.
No turno atual declara ser autônomo. Mecânico detecta `CONF_DADO_CONTRADITO`.

```
reply_text:         "Quero entender melhor — antes você havia mencionado que
                     trabalhava com carteira assinada, e agora você me disse que
                     trabalha por conta própria. Qual é a situação atual? Isso
                     faz diferença para a análise do programa."
turn_id:            "turn_0093"
case_id:            "case_1238"
facts_updated:      {}
next_objective: { type: "OBJ_CONFIRMAR", target: "fact_work_regime_p1" }
pending: [
  { type: "PEND_CONFIRMACAO", target: "fact_work_regime_p1" }
]
conflicts: [
  {
    type: "CONF_DADO_CONTRADITO",
    facts_involved: ["fact_work_regime_p1"]
  }
]
risks:              []
actions_executed: [
  { type: "ACAO_SINALIZAR_CONFLITO", result: "needs_confirmation = true" }
]
blocks: []
needs_confirmation: true
confidence:         { score: "low", reason: "dado central em conflito — turno inconclusivo até confirmação" }
flags:              {}
```

**Verificação:** I-01 ✓ (conflicts não vazio → needs_confirmation=true), I-02 ✓
(next_objective = OBJ_CONFIRMAR), I-05 ✓ (reply_text conduz confirmação naturalmente).

---

### Cenário 6 — Lead offtrack: fora do objetivo operacional

**Contexto:** Lead abandona a qualificação e começa a perguntar sobre valores de
imóveis em bairros específicos. Mecânico aciona `RISCO_OFFTRACK`.

```
reply_text:         "Entendo a curiosidade sobre os valores — isso é muito natural
                     quando a gente está pensando em comprar um imóvel. Mas para
                     que eu possa te ajudar da forma certa, preciso primeiro entender
                     melhor o seu perfil. Assim consigo te orientar sobre as faixas
                     que se aplicam ao seu caso. Você me disse que trabalha com
                     carteira assinada — qual é mais ou menos sua renda mensal?"
turn_id:            "turn_0101"
case_id:            "case_1239"
facts_updated:      {}
next_objective: { type: "OBJ_RETORNAR_AO_TRILHO", target: "fact_monthly_income_p1" }
pending: [
  { type: "PEND_SLOT_VAZIO", target: "fact_monthly_income_p1" }
]
conflicts:          []
risks: [
  { type: "RISCO_OFFTRACK", severity: "OPERACIONAL" }
]
actions_executed:   []
blocks:             []
needs_confirmation: false
confidence:         { score: "medium", reason: "turno offtrack — retorno conduzido, dado ainda não coletado" }
flags: { offtrack: true }
```

**Verificação:** I-05 ✓ (reply_text retorna ao trilho naturalmente), I-08 verificado
(bypass_manual=false — flag offtrack não implica bypass).

---

## 8. Ciclo de vida do contrato de saída por turno

```
[Turno anterior encerrado]
        ↓
[Mecânico: prepara contexto do próximo turno]
  - Lê estado do case (facts, stage, pending, flags)
  - Declara next_objective, pending, conflicts, risks ativos
  - Executa ações de gate satisfeitas (actions_executed)
        ↓
[LLM: recebe contexto estruturado]
  - Lê next_objective, pending, conflicts, risks, blocks
  - NÃO lê campos como scripts — raciocina sobre o estado
  - Gera reply_text com naturalidade
  - Sinaliza confidence
        ↓
[Mecânico: estrutura saída]
  - Recebe reply_text do LLM
  - Valida facts_updated declarados pelo LLM
  - Monta estrutura TurnoSaida completa
  - Persiste via T2 (escopo futuro)
        ↓
[Canal: entrega reply_text ao cliente]
  - Somente reply_text é visível ao cliente
  - Todos os demais campos são internos
```

---

## 9. O que este contrato NÃO é

- **Não é schema Supabase.** As tabelas, colunas e tipos de persistência são definidos em T2.
  Este contrato define o shape conceitual — T2 define onde e como persistir cada campo.

- **Não é a interface de runtime.** A serialização, deserialização e validação de schema são
  responsabilidade do orquestrador de turno em T4. Este contrato é documental.

- **Não é o policy engine.** Quando e como cada campo é populado, quais condições acionam
  `ACAO_INELEGIBILIDADE` vs. `RISCO_INELEGIBILIDADE_RESTRICAO`, são definidos em T3.
  Este contrato define os campos — T3 define a lógica de preenchimento.

- **Não é um template de resposta.** Nenhum campo deste contrato contém texto dirigido ao
  cliente. `reply_text` é sempre gerado pelo LLM. Os demais campos são estruturais.

- **Não é o system prompt.** O system prompt (T1.2) orienta identidade, limites e raciocínio.
  O contrato de saída define a interface estruturada que complementa o texto do LLM.

---

## 10. Cobertura das microetapas do mestre

| Microetapa do mestre (seção T1) | Cobertura neste documento |
|--------------------------------|--------------------------|
| Contrato de saída do agente | Seção 2 — shape completo com 13 campos ✓ |
| `reply_text` soberano do LLM | Seção 3.1 + Tabela §4 — trava explícita ✓ |
| Facts extraídos e atualizados | Seção 3.4 — `facts_updated` com source + confirmed ✓ |
| Objetivo atual | Seção 3.5 — `next_objective` tipo+target ✓ |
| `needs_confirmation` | Seção 3.11 — flag obrigatório + invariante I-01 ✓ |
| Flags e bloqueios | Seções 3.10 + 3.13 — `blocks` + `flags` ✓ |
| Formato para qualquer canal | Seção 8 — ciclo de vida canal-agnóstico ✓ |
| Pelo menos 5 cenários distintos | Seção 7 — 6 cenários cobertos ✓ |

---

## BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T1_CONTRATO_SAIDA.md (este documento)
Estado da evidência:                   completa — 13 campos canônicos definidos com semântica,
                                        responsável e limites; shape descritivo completo;
                                        invariantes de consistência declaradas; 6 cenários
                                        sintéticos de validação cobrindo coleta básica, risco
                                        orientativo, ação automática, inelegibilidade, conflito
                                        e offtrack; amarração completa à T1_TAXONOMIA_OFICIAL;
                                        trava LLM-first verificada em cada campo
Há lacuna remanescente?:               não — schema Supabase é escopo de T2 (correto); policy
                                        engine é escopo de T3 (correto); serialização runtime
                                        é escopo de T4 (correto); todos os campos exigidos pelo
                                        mestre e pela tarefa cobertos
Há item parcial/inconclusivo bloqueante?: não — todos os 13 campos têm definição canônica
                                        completa; cenários validam invariantes; nenhum tipo
                                        fora da taxonomia T1.3
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_CONTRATO_SAIDA.md publicado; PR-T1.4 encerrada;
                                        PR-T1.5 desbloqueada
Próxima PR autorizada:                 PR-T1.5 — Comportamentos canônicos e proibições
```
