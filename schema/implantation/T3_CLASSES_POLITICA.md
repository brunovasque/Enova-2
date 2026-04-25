# T3_CLASSES_POLITICA — Classes Canônicas de Política — ENOVA 2

## Finalidade

Este documento define as **cinco classes canônicas de política** do motor declarativo de políticas
(policy engine v1) da ENOVA 2.

Uma **classe de política** é o tipo estruturado de instrução que o policy engine emite após avaliar
o `lead_state`. A classe determina o *efeito operacional* sobre o turno atual — mas **não redige,
não sugere e não determina o texto final que o cliente recebe**.

O policy engine **decide**. O LLM **fala**. Essas responsabilidades nunca se invertem.

**Pré-requisitos obrigatórios:**
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shapes de `OperationalState`,
  `FactEntry`, `Block`, `Action`; base de toda referência de chave e status.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens e níveis de confiança;
  determina quando um fato está apto a disparar uma regra.
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.

**Princípios canônicos (A00-ADENDO-01 e A00-ADENDO-02):**
> O policy engine é soberano na **decisão de negócio**.
> O LLM é soberano na **fala ao cliente**.
> Nenhuma classe de política pode produzir `reply_text`, template de mensagem ou
> texto destinado diretamente ao cliente.

**Microetapa do mestre coberta por este artefato:**
> **Microetapa 2 — T3:** "Definir o que é 'bloquear avanço', 'desviar objetivo',
> 'pedir confirmação' e 'apenas orientar'."

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T3 (microetapa 2)
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` §1, §7 CA-01, CA-08, CA-09

---

## 1. Visão geral do modelo de política

O policy engine recebe o `lead_state` completo e emite zero ou mais `PolicyDecision` estruturadas.
Cada `PolicyDecision` pertence a exatamente uma das cinco classes canônicas.

```
PolicyDecision {
  class:       PolicyClass   — obrigação | bloqueio | sugestão_mandatória |
                               confirmação | roteamento
  rule_id:     string        — identificador da regra que gerou esta decisão
                               (ex.: "R_CASADO_CIVIL_CONJUNTO")
  severity:    enum          — "info" | "warning" | "critical" | "blocking"
  target:      string        — fact_key ou bloco do lead_state afetado
  reason:      string        — justificativa legível por humano (para auditoria)
  action:      PolicyAction  — instrução estruturada para o mecânico / LLM
                               (ver §2–§6 para payload por classe)
  meta:        PolicyMeta    — rastreabilidade (turn, timestamp, rule_version)
}

PolicyClass    = "obrigação" | "bloqueio" | "sugestão_mandatória" |
                 "confirmação" | "roteamento"

PolicyMeta {
  evaluated_at_turn: integer
  rule_version:      string
  lead_state_hash:   string   — hash do lead_state usado na avaliação
}
```

**Invariante global:**

> `PolicyDecision.action` jamais contém campos `reply_text`, `mensagem_usuario`,
> `texto_cliente`, `resposta`, `frase` ou qualquer equivalente de texto final ao cliente.
> Se contiver, a implementação está não conforme (CA-01, P2 de A00-ADENDO-01).

---

## 2. Classe BLOQUEIO

### 2.1 Definição formal — "bloquear avanço"

**Bloquear avanço** significa: impedir que o `current_phase` do `lead_state` avance para o
próximo stage enquanto uma condição crítica de negócio não for resolvida.

- O engine emite `bloqueio` quando um fato crítico está ausente, inconfirmado ou contradito
  de forma que impede avaliação de elegibilidade no stage atual ou seguinte.
- O `blocked_by` do `OperationalState` é atualizado com o bloqueio.
- O LLM lê o `blocked_by` e decide como conduzir o turno — **nunca o engine dita essa fala**.
- Bloqueio não é punição. Bloqueio não é bronca. Bloqueio é limite operacional de negócio.

### 2.2 Quando emitir

| Condição de disparo | Exemplo |
|---------------------|---------|
| Fato crítico ausente para stage atual | `fact_nationality` ausente em `qualification` |
| Fato crítico em `contradicted` sem resolução | `fact_work_regime_p1` em conflito ativo |
| Elegibilidade formalmente inviável por regra de negócio | `fact_rnm_status = "sem_rnm"` + estrangeiro |
| Restrição não regularizada bloqueante | `fact_credit_restriction = true` + `fact_restriction_regularization_status = "não_iniciada"` |

### 2.3 Payload mínimo

```
BloqueioAction {
  type:           "bloqueio"
  blocked_fact:   string       — fact_key que origina o bloqueio
                                 (deve existir em T2_DICIONARIO_FATOS §3)
  blocked_phase:  string       — current_phase bloqueado (valor de T2_LEAD_STATE_V1 §3.3)
  resolution_required: string  — o que precisa mudar para desbloqueio
                                 (ex.: "fact_rnm_status deve ser 'com_rnm'")
  severity:       "critical" | "blocking"
  advance_allowed: false       — invariante: bloqueio sempre false
}
```

### 2.4 Efeito no lead_state

Após emissão de `bloqueio`:
- `operational.blocked_by` recebe entrada `{ reason: <rule_id>, resolution: <resolution_required> }`.
- `operational.elegibility_status` pode ser atualizado para `"ineligible"` se a regra for terminal.
- `operational.risk_level` sobe para `"blocking"` se ainda não estiver.

### 2.5 Distinção de veto suave

| | BLOQUEIO | VETO SUAVE (T3.4) |
|---|---|---|
| Impede avanço de phase? | **sim** | não |
| Origem | Regra de negócio hard | Sinal de risco ou inconsistência soft |
| Reversão | Resolução do fato crítico | Confirmação ou reconhecimento do risco |
| Severity | `blocking` / `critical` | `warning` / `info` |

---

## 3. Classe OBRIGAÇÃO

### 3.1 Definição formal — "exigir ação"

**Obrigação** significa: declarar que uma ação específica é **mandatória** para o case progredir,
sem bloquear o stage atual imediatamente. O LLM é orientado a priorizar a coleta/confirmação
declarada — mas decide como fazê-lo na fala.

- Diferença crítica de bloqueio: a obrigação não atualiza `blocked_by`. Ela atualiza
  `must_ask_now` e `recommended_next_actions`.
- O LLM recebe a prioridade e age com autonomia na conversa.

### 3.2 Quando emitir

| Condição de disparo | Exemplo |
|---------------------|---------|
| Fato obrigatório para stage atual não coletado | `fact_work_regime_p1` ausente em `qualification` |
| Confirmação pendente de fato em `captured` crítico | `fact_monthly_income_p1` em `captured` sem `confirmed` |
| Ação ACAO_* de T1 requerida pelo stage | `ACAO_COLETAR_RENDA` no início de qualification |

### 3.3 Payload mínimo

```
ObrigacaoAction {
  type:              "obrigação"
  required_fact:     string        — fact_key ou ação ACAO_* exigida
  reason_code:       string        — código da regra (ex.: "R_COLETA_RENDA_QUALIFICATION")
  priority:          integer       — ordem relativa entre obrigações simultâneas (1 = maior)
  if_not_collected:  string        — o que acontece se não coletado
                                     (ex.: "bloqueio em qualification")
}
```

### 3.4 Efeito no lead_state

Após emissão de `obrigação`:
- `operational.must_ask_now` recebe `fact_key` declarada.
- `operational.recommended_next_actions` recebe `ACAO_*` correspondente.
- `operational.blocked_by` **não é modificado** (diferença formal de bloqueio).

---

## 4. Classe CONFIRMAÇÃO

### 4.1 Definição formal — "pedir confirmação"

**Pedir confirmação** significa: sinalizar ao LLM que um fato específico precisa ser
**confirmado explicitamente pelo lead** antes de ser tratado como `confirmed` no `lead_state`.

- A confirmação **não persiste o dado automaticamente**. Ela apenas orienta o LLM a buscar
  a confirmação — e o mecânico persiste após coleta explícita.
- Confirmação não é um interrogatório nem um questionário. É uma instrução ao LLM sobre
  qual fato precisa de maior certeza neste turno.

### 4.2 Quando emitir

| Condição de disparo | Exemplo |
|---------------------|---------|
| Fato crítico em `captured` (não `confirmed`) com risco de decisão incorreta | `fact_estado_civil` em `captured` quando `process_mode` ainda não definido |
| Fato em `contradicted` aguardando resolução explícita | `fact_work_regime_p1` em conflito |
| `operational.needs_confirmation = true` ativo | Transição automática de `OBJ_CONFIRMAR` |
| Fato com fonte `INDIRECT_TEXT` ou `AUDIO_TRANSCRIPT` em dado crítico | `fact_monthly_income_p1` via áudio ruim |

### 4.3 Payload mínimo

```
ConfirmacaoAction {
  type:              "confirmação"
  fact_to_confirm:   string    — fact_key que precisa de confirmação explícita
                                 (deve existir em T2_DICIONARIO_FATOS §3)
  current_status:    enum      — status atual do fato ("captured" | "contradicted" |
                                 "inferred")
  current_value:     any       — valor atual para o LLM referenciar
  confirmation_level: enum     — "soft" (sugerida) | "hard" (obrigatória para avançar)
  if_not_confirmed:  string    — consequência se não confirmado
                                 (ex.: "fato permanece captured; avaliação com risco")
}
```

### 4.4 Efeito no lead_state

Após emissão de `confirmação`:
- `operational.needs_confirmation` é setado para `true` se ainda não estiver.
- `operational.current_objective` pode ser atualizado para `OBJ_CONFIRMAR` (se `confirmation_level = "hard"`).
- O mecânico **não persiste o fato como `confirmed`** até coleta explícita no turno.

### 4.5 Distinção de obrigação

| | CONFIRMAÇÃO | OBRIGAÇÃO |
|---|---|---|
| Fato já existe? | sim (em `captured` / `contradicted`) | pode estar ausente |
| Objetivo | elevar de `captured` → `confirmed` | coletar ou executar ação |
| Afeta `blocked_by`? | não diretamente | não |
| Afeta `needs_confirmation`? | **sim** | não |

---

## 5. Classe SUGESTÃO MANDATÓRIA

### 5.1 Definição formal — "apenas orientar"

**Sugestão mandatória** significa: o engine orienta o LLM sobre uma conduta recomendada
para o turno atual sem impor bloqueio, obrigação ou confirmação específica. O LLM **deve**
considerar a orientação — mas tem autonomia para expressá-la com naturalidade na fala.

- "Mandatória" porque o LLM não pode ignorar a orientação — mas "sugestão" porque não determina
  como a orientação é expressada.
- Não há ação específica de negócio exigida. Há uma conduta conversacional recomendada.

### 5.2 Quando emitir

| Condição de disparo | Exemplo |
|---------------------|---------|
| Risco detectado que não bloqueia mas merece atenção | `risk_level = "medium"` por renda limítrofe |
| Oportunidade de coleta proativa não-crítica | `fact_has_fgts` ausente mas útil para orientação |
| Contexto de composição complexo que justifica condução especial | P3 detectado mas não confirmado |
| Sinal de intenção que sugere desvio de condução | `fact_current_intent` indica dúvida sobre objetivo |

### 5.3 Payload mínimo

```
SugestaoMandatoriaAction {
  type:           "sugestão_mandatória"
  guidance_code:  string   — código da orientação (ex.: "SGM_RISCO_RENDA_LIMITE")
  context:        string   — resumo do contexto detectado (para o LLM raciocinar)
                             (não é texto ao cliente — é insumo de raciocínio)
  recommended_behavior: string  — descrição da conduta esperada do LLM
                                   (ex.: "aprofundar verificação de renda sem
                                   pressionar o lead; checar composição familiar")
  urgency:        enum     — "low" | "medium"
}
```

### 5.4 Efeito no lead_state

Após emissão de `sugestão_mandatória`:
- `operational.last_policy_decision` é atualizado com o `guidance_code`.
- Nenhum outro bloco do `lead_state` é modificado diretamente.
- O LLM lê o guidance e adapta sua conduta sem roteirização.

### 5.5 Distinção de obrigação

| | SUGESTÃO MANDATÓRIA | OBRIGAÇÃO |
|---|---|---|
| Ação específica exigida? | não — conduta recomendada | sim — fato ou ação concreta |
| Afeta `must_ask_now`? | não | **sim** |
| Urgência típica | baixa / média | alta |
| Consequência de não-seguimento | risco não mitigado | bloqueio futuro possível |

---

## 6. Classe ROTEAMENTO

### 6.1 Definição formal — "desviar objetivo"

**Desviar objetivo** significa: o engine instrui o mecânico a alterar o `current_objective`
e/ou `current_phase` do case — mudando o trilho operacional da conversa.

- O roteamento muda o **destino operacional**, não a fala.
- O LLM recebe o novo objetivo e conduz a transição com naturalidade.
- Roteamento não escreve a conversa de transição.

### 6.2 Quando emitir

| Condição de disparo | Exemplo |
|---------------------|---------|
| Stage atual concluído e critérios de avanço atendidos | todos os fatos obrigatórios de `qualification` coletados e confirmados |
| Detecção de trilha especial obrigatória | `fact_p3_required = true` → rotear para `qualification_special` |
| Inviabilidade detectada — encerrar case | estrangeiro sem RNM + regra terminal → `ACAO_INELEGIBILIDADE` |
| Lead solicita informação fora do stage atual | `fact_current_intent` indica mudança de objetivo |

### 6.3 Payload mínimo

```
RoteamentoAction {
  type:              "roteamento"
  target_phase:      string    — novo current_phase (valor de T2_LEAD_STATE_V1 §3.3)
                                 ou "encerramento" para inviabilidade
  target_objective:  string    — novo OBJ_* (de T1_TAXONOMIA_OFICIAL)
  reason_code:       string    — código da regra de roteamento
                                 (ex.: "R_ADVANCE_DISCOVERY_TO_QUALIFICATION")
  transition_type:   enum      — "advance" | "special" | "abort" | "lateral"
  requires_confirmation: boolean — true se roteamento exige confirmação do lead antes
}
```

### 6.4 Efeito no lead_state

Após emissão de `roteamento`:
- `operational.current_phase` é atualizado pelo mecânico para `target_phase`.
- `operational.current_objective` é atualizado para `target_objective`.
- `operational.must_ask_now` é resetado conforme novo stage.
- `operational.last_policy_decision` é atualizado com `reason_code`.

---

## 7. Prioridade entre classes

Quando múltiplas `PolicyDecision` são emitidas no mesmo turno, a ordem de precedência
operacional é:

| Prioridade | Classe | Justificativa |
|------------|--------|---------------|
| 1 (máxima) | **bloqueio** | Impede avanço — deve ser processado antes de qualquer outra instrução |
| 2 | **obrigação** | Ação mandatória — deve ser priorizada na condução do turno |
| 3 | **confirmação** | Fato crítico aguardando certeza — afeta decisões subsequentes |
| 4 | **sugestão_mandatória** | Orientação de conduta — considerada após obrigações resolvidas |
| 5 (mínima) | **roteamento** | Só executado após bloqueios resolvidos e obrigações atendidas |

**Regras de composição quando há múltiplas decisões da mesma classe:**
- Múltiplos `bloqueios`: todos são emitidos; o `blocked_by` recebe todos.
- Múltiplas `obrigações`: ordenadas por `priority` (1 = maior); o `must_ask_now` recebe
  os `required_fact` nessa ordem.
- Múltiplas `confirmações`: ordenadas por `confirmation_level` (`hard` antes de `soft`).
- Múltiplas `sugestões_mandatórias`: ordenadas por `urgency` (`medium` antes de `low`).
- Múltiplos `roteamentos`: **proibido** — colisão de roteamento é erro de regra
  (ver T3_ORDEM_AVALIACAO_COMPOSICAO.md, PR-T3.3).

**Regra de descarte:**
- `roteamento` não é executado se há `bloqueio` ativo no mesmo turno.
- `confirmação` não eleva fato para `confirmed` automaticamente — exige turno de coleta.

---

## 8. Definições formais dos quatro efeitos operacionais

Esta seção cumpre a **microetapa 2 do mestre T3**: definir formalmente os quatro efeitos
operacionais que uma política pode ter sobre o turno.

### 8.1 Bloquear avanço

**Definição:** Impedir que `operational.current_phase` avance para o próximo valor enquanto
uma condição crítica de negócio não for satisfeita.

- **Classe responsável:** `bloqueio`
- **Efeito no estado:** `operational.blocked_by` não vazio; `advance_allowed = false`
- **O que o LLM faz:** lê `blocked_by`, entende a restrição, conduz o turno para resolução
  da condição — sem expor o mecanismo como "sistema bloqueou"
- **O que o LLM NÃO faz:** gera mensagem de erro, bronca, aviso mecânico ou template

### 8.2 Desviar objetivo

**Definição:** Alterar `operational.current_objective` e/ou `operational.current_phase`
para um novo destino operacional autorizado por regra de negócio.

- **Classe responsável:** `roteamento`
- **Efeito no estado:** `current_phase` e `current_objective` atualizados
- **O que o LLM faz:** recebe novo objetivo, faz a transição conversacional com naturalidade
- **O que o LLM NÃO faz:** usa script de transição, revela mudança de stage ao cliente

### 8.3 Pedir confirmação

**Definição:** Sinalizar ao LLM que um fato específico em `captured`, `inferred` ou
`contradicted` precisa ser elevado para `confirmed` via declaração explícita do lead neste
ou no próximo turno.

- **Classe responsável:** `confirmação`
- **Efeito no estado:** `operational.needs_confirmation = true`; objetivo pode mudar para
  `OBJ_CONFIRMAR`
- **O que o LLM faz:** naturalmente retoma o fato em questão, busca confirmação sem
  parecer robótico
- **O que o LLM NÃO faz:** persiste dado automaticamente, diz "preciso confirmar seu dado"
  como aviso de sistema

### 8.4 Apenas orientar

**Definição:** Informar o LLM sobre um risco, oportunidade ou contexto relevante que deve
influenciar sua conduta conversacional sem impor ação mandatória específica.

- **Classe responsável:** `sugestão_mandatória`
- **Efeito no estado:** `operational.last_policy_decision` atualizado; nenhum bloco crítico
  modificado
- **O que o LLM faz:** absorve o contexto, adapta tom/profundidade/direção da conversa
- **O que o LLM NÃO faz:** ignora a orientação, usa o `guidance_code` como texto ao cliente

---

## 9. Integração com lead_state v1

As classes de política integram exclusivamente com os seguintes campos de `T2_LEAD_STATE_V1`:

| Campo do lead_state | Modificado por | Classe(s) |
|---------------------|----------------|-----------|
| `operational.blocked_by` | bloqueio | `bloqueio` |
| `operational.must_ask_now` | obrigação | `obrigação` |
| `operational.recommended_next_actions` | obrigação | `obrigação` |
| `operational.needs_confirmation` | confirmação | `confirmação` |
| `operational.current_objective` | roteamento, confirmação | `roteamento`, `confirmação` (hard) |
| `operational.current_phase` | roteamento | `roteamento` |
| `operational.last_policy_decision` | todas as classes | todas |
| `operational.risk_level` | bloqueio | `bloqueio` (elevação) |
| `operational.elegibility_status` | roteamento (abort) | `roteamento` (transition_type=abort) |
| `facts.<fact_key>.status` | confirmação (via coleta) | `confirmação` — não direto; via turno |

**Regra de imutabilidade:**
- Nenhuma classe modifica `meta.lead_id`, `meta.case_id`, `meta.created_at`.
- `facts.<fact_key>.status` só é modificado pelo mecânico após coleta real — nunca pela
  emissão de `PolicyDecision` isolada.

---

## 10. Integração com política de confiança (T2_POLITICA_CONFIANCA)

A política de confiança é **pré-condição** para o disparo de regras de política:

| Regra de integração | Descrição |
|--------------------|-----------|
| PC-INT-01 | Fato em `hypothesis` nunca dispara `bloqueio` — status pré-captura não é evidência |
| PC-INT-02 | Fato em `captured` com origem `INDIRECT_TEXT` ou `AUDIO_TRANSCRIPT` (ruim) dispara `confirmação` antes de `bloqueio` |
| PC-INT-03 | Fato em `inferred` pode disparar `obrigação` mas nunca `bloqueio` diretamente — inferência ≠ evidência confirmada |
| PC-INT-04 | Fato em `confirmed` com auditabilidade documentada é base válida para qualquer classe |
| PC-INT-05 | `operator_override` (nota Vasques) tem precedência sobre `captured` mas não substitui `confirmed` para regras terminais |

---

## 11. Anti-padrões proibidos

| Código | Anti-padrão | Por que é proibido |
|--------|-------------|-------------------|
| AP-CP-01 | `PolicyDecision.action` contém campo `reply_text`, `mensagem`, `texto_cliente` ou similar | Violação CA-01 e A00-ADENDO-01 P2 — policy não fala |
| AP-CP-02 | `bloqueio` modifica `facts.<fact_key>.status` diretamente | Fato é modificado por coleta + mecânico, nunca por decisão de policy isolada |
| AP-CP-03 | `confirmação` seta `facts.<fact_key>.status = "confirmed"` no payload | Confirmação orienta coleta — não persiste automaticamente |
| AP-CP-04 | `sugestão_mandatória` contém `recommended_behavior` com frase pronta ao cliente | `recommended_behavior` é insumo de raciocínio do LLM, não script |
| AP-CP-05 | `roteamento` e `bloqueio` emitidos simultaneamente para o mesmo `target_phase` | Contradição lógica — bloqueio impede o avanço que roteamento autorizaria |
| AP-CP-06 | `obrigação` e `bloqueio` para o mesmo `fact_key` no mesmo turno | Um fato não pode ser obrigatório-mas-não-bloqueante e bloqueante simultaneamente |
| AP-CP-07 | `PolicyDecision.reason` contém texto de resposta ao cliente disfarçado | `reason` é log de auditoria, não fala |
| AP-CP-08 | Emitir `roteamento` sem verificar se todos os `bloqueio` ativos foram resolvidos | Roteamento ignorando bloqueio causa inconsistência de estado |
| AP-CP-09 | Emitir `confirmação` para fato já em `confirmed` | Redundante e potencialmente confuso para o LLM |
| AP-CP-10 | `sugestão_mandatória` com `urgency = "high"` ou `severity = "blocking"` | Alta urgência é escopo de `obrigação` ou `bloqueio`; sugestão é soft |

---

## 12. Exemplos sintéticos de PolicyDecision por classe

### 12.1 Exemplo — BLOQUEIO (estrangeiro sem RNM)

```
PolicyDecision {
  class:    "bloqueio"
  rule_id:  "R_ESTRANGEIRO_SEM_RNM"
  severity: "blocking"
  target:   "fact_rnm_status"
  reason:   "Lead declarou ser estrangeiro (fact_nationality ≠ 'brasileiro'); fact_rnm_status = 'sem_rnm'. Programa MCMV exige RNM válido para estrangeiros. Elegibilidade bloqueada."
  action: BloqueioAction {
    type:             "bloqueio"
    blocked_fact:     "fact_rnm_status"
    blocked_phase:    "qualification"
    resolution_required: "fact_rnm_status deve ser 'com_rnm' — lead precisa apresentar RNM válido"
    severity:         "blocking"
    advance_allowed:  false
  }
  meta: { evaluated_at_turn: 4, rule_version: "1.0.0" }
}
```

### 12.2 Exemplo — OBRIGAÇÃO (coleta de renda em qualification)

```
PolicyDecision {
  class:    "obrigação"
  rule_id:  "R_COLETA_RENDA_P1_QUALIFICATION"
  severity: "warning"
  target:   "fact_monthly_income_p1"
  reason:   "Stage qualification ativo; fact_monthly_income_p1 ausente. Coleta obrigatória para avaliar elegibilidade por faixa de renda."
  action: ObrigacaoAction {
    type:           "obrigação"
    required_fact:  "fact_monthly_income_p1"
    reason_code:    "R_COLETA_RENDA_P1_QUALIFICATION"
    priority:       1
    if_not_collected: "bloqueio em qualification; score de progresso estagnado"
  }
  meta: { evaluated_at_turn: 2, rule_version: "1.0.0" }
}
```

### 12.3 Exemplo — CONFIRMAÇÃO (renda via texto indireto)

```
PolicyDecision {
  class:    "confirmação"
  rule_id:  "R_CONFIRMAR_RENDA_INDIRECT_TEXT"
  severity: "warning"
  target:   "fact_monthly_income_p1"
  reason:   "fact_monthly_income_p1 coletado via INDIRECT_TEXT (turno 2). Origem com confiança baixa. Confirmação obrigatória antes de qualquer decisão de elegibilidade por faixa."
  action: ConfirmacaoAction {
    type:               "confirmação"
    fact_to_confirm:    "fact_monthly_income_p1"
    current_status:     "captured"
    current_value:      2800
    confirmation_level: "hard"
    if_not_confirmed:   "fact permanece captured; avaliação de elegibilidade suspensa"
  }
  meta: { evaluated_at_turn: 3, rule_version: "1.0.0" }
}
```

### 12.4 Exemplo — SUGESTÃO MANDATÓRIA (renda limítrofe de faixa)

```
PolicyDecision {
  class:    "sugestão_mandatória"
  rule_id:  "SGM_RENDA_LIMITE_FAIXA_2"
  severity: "info"
  target:   "fact_monthly_income_p1"
  reason:   "fact_monthly_income_p1 = 2800 confirmado. Valor próximo ao limite superior da Faixa 2 (R$ 2.850). Risco de classificação incorreta de faixa se renda variar."
  action: SugestaoMandatoriaAction {
    type:          "sugestão_mandatória"
    guidance_code: "SGM_RENDA_LIMITE_FAIXA_2"
    context:       "Renda confirmada de R$ 2.800 próxima ao teto de Faixa 2. Risco de migração para Faixa 3 se houver variação ou renda adicional não declarada."
    recommended_behavior: "verificar se há outras fontes de renda; checar fact_has_multi_income_p1; não concluir faixa definitivamente sem esgotar verificação"
    urgency:       "medium"
  }
  meta: { evaluated_at_turn: 3, rule_version: "1.0.0" }
}
```

### 12.5 Exemplo — ROTEAMENTO (avanço para qualification_special)

```
PolicyDecision {
  class:    "roteamento"
  rule_id:  "R_ROTEAR_P3_REQUIRED"
  severity: "info"
  target:   "current_phase"
  reason:   "fact_p3_required = true confirmado (turno 5). Trilha qualification_special obrigatória para composição familiar com terceiro participante."
  action: RoteamentoAction {
    type:                 "roteamento"
    target_phase:         "qualification_special"
    target_objective:     "OBJ_QUALIFICACAO_ESPECIAL"
    reason_code:          "R_ROTEAR_P3_REQUIRED"
    transition_type:      "special"
    requires_confirmation: false
  }
  meta: { evaluated_at_turn: 5, rule_version: "1.0.0" }
}
```

---

## 13. Cobertura das microetapas do mestre T3

| Microetapa do mestre | Cobertura neste artefato |
|----------------------|--------------------------|
| **Microetapa 1** — Transformar regras mais sensíveis | NÃO coberta aqui — escopo PR-T3.2 |
| **Microetapa 2** — Definir "bloquear avanço", "desviar objetivo", "pedir confirmação", "apenas orientar" | **COBERTA — §8 deste documento** |
| **Microetapa 3** — Ordem estável de avaliação | NÃO coberta aqui — escopo PR-T3.3 |
| **Microetapa 4** — Política de composição | NÃO coberta aqui — escopo PR-T3.3 |
| **Microetapa 5** — Política de veto suave | NÃO coberta aqui — escopo PR-T3.4 |

---

## 14. Regras invioláveis

| Código | Regra |
|--------|-------|
| CP-01 | Nenhuma `PolicyDecision.action` contém `reply_text` ou equivalente — **invariante absoluta** |
| CP-02 | Toda `PolicyDecision` referencia apenas `fact_key` existente em `T2_DICIONARIO_FATOS` |
| CP-03 | Toda `PolicyDecision` referencia apenas `current_phase` existente em `T2_LEAD_STATE_V1 §3.3` |
| CP-04 | `bloqueio` e `roteamento` para o mesmo `target` no mesmo turno são mutuamente exclusivos |
| CP-05 | `confirmação` não persiste dado — ela sinaliza necessidade de coleta |
| CP-06 | `sugestão_mandatória` nunca tem `severity = "blocking"` ou `"critical"` |
| CP-07 | `roteamento` só é executado se não há `bloqueio` ativo com `advance_allowed = false` |
| CP-08 | `obrigação` nunca modifica `blocked_by` — distinção formal de bloqueio |
| CP-09 | Fato em `hypothesis` nunca dispara `bloqueio` — pré-captura não é evidência de negócio |
| CP-10 | `PolicyMeta.lead_state_hash` deve ser registrado para auditabilidade de toda decisão |

---

## Bloco E — PR-T3.1

| Campo | Valor |
|-------|-------|
| PR | PR-T3.1 — Classes canônicas de política |
| Data | 2026-04-25 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/implantation/T3_CLASSES_POLITICA.md` (este documento) |
| Status | CONCLUÍDA |
| Evidência | 5 classes definidas (bloqueio, obrigação, confirmação, sugestão_mandatória, roteamento); payload mínimo por classe; prioridade entre classes (§7); 4 efeitos operacionais formalmente definidos (§8); 5 exemplos sintéticos (§12); 10 anti-padrões (§11); 10 regras invioláveis (§14); integração com lead_state v1 (§9) e política de confiança (§10) |
| Prova P-T3-01 | Grep de `reply_text`, `mensagem_usuario`, `texto_cliente`, `resposta`, `frase` no documento: ausência confirmada em todos os payloads de `action` |
| Prova P-T3-02 | Todas as `fact_key` referenciadas (`fact_rnm_status`, `fact_monthly_income_p1`, `fact_nationality`, `fact_work_regime_p1`, `fact_estado_civil`, `fact_process_mode`, `fact_p3_required`, `fact_has_multi_income_p1`, `fact_current_intent`, `fact_channel_origin`) existem em `T2_DICIONARIO_FATOS §3` |
| Prova P-T3-03 | Microetapa 2 do mestre T3 coberta em §8 (definições formais dos 4 efeitos operacionais); §13 declara cobertura explícita por microetapa |
| Conformidade CA-01 | Confirmada — nenhum campo de `action` produz `reply_text` |
| Conformidade CA-07 | Confirmada — todas as fact_keys referenciam T2_LEAD_STATE_V1 e T2_DICIONARIO_FATOS |
| Conformidade CA-08 | Confirmada — engine emite apenas `PolicyDecision` estruturadas; LLM permanece soberano na fala |
| Conformidade CA-09 | Confirmada — microetapa 2 coberta; microetapas 1/3/4/5 declaradas como escopo de PRs subsequentes |
| Conformidade A00-ADENDO-01 | Confirmada — soberania do LLM na fala preservada; mecânico não redige resposta |
| Conformidade A00-ADENDO-02 | Confirmada — identidade MCMV preservada; engine orienta sem engessar fala |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente; evidências explícitas por critério |
| Próxima PR autorizada | **PR-T3.2 — Codificação declarativa das regras críticas** |
