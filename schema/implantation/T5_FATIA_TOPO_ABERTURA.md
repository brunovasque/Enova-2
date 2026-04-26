# T5_FATIA_TOPO_ABERTURA — Contrato da Fatia F1: Topo / Abertura / Primeira Intenção — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.2-fix (corretiva) |
| Branch | feat/t5-fix-t52-premissas-rnm |
| Fatia | F1 — Topo / Abertura / Primeira Intenção |
| `current_phase` | `discovery` |
| Status | entregue — v2 (corrigida) |
| Pré-requisito | PR-T5.2 merged (#115) |
| Autoriza | PR-T5.3 — Contrato da fatia qualificação inicial |
| Legados aplicáveis | L03 (obrigatório), L04, L05, L06 (obrigatórios — topo do funil), L19 (complementar — MCMV) |
| Data | 2026-04-26 — v2 |

---

## Finalidade

Este documento é o **contrato declarativo da Fatia F1** — a primeira fatia do funil core da
ENOVA 2, correspondente ao topo/abertura/primeira intenção do atendimento.

Ele formaliza, sem prescrever fala:

- O objetivo operacional da fatia e os stages legados cobertos
- Os fatos mínimos canônicos T2 que a fatia deve coletar e confirmar
- As políticas T3 aplicáveis (sem nenhuma delas produzir `reply_text`)
- Os critérios de entrada e de saída (pronto para F2)
- A conexão com o pipeline T4 (TurnoEntrada → LLM → T4.3)
- As classes de risco que o LLM deve evitar nesta fatia
- Cenários sintéticos declarativos de cobertura

**Princípio canônico:**

> O LLM sempre manda na fala.
> Esta fatia declara objetivo, fatos, políticas, bloqueios e critérios.
> Esta fatia não redige `reply_text`, não cria script de saudação,
> não cria template de pergunta, não cria if/else de atendimento.
> Qualquer texto ao cliente vem exclusivamente do LLM via T4/T1.

**Referências de base:**

- `T2_LEAD_STATE_V1.md` §4.4 — grupos I e II (fact_* da fatia F1)
- `T2_LEAD_STATE_V1.md` §5.3 — derived_rnm_required, derived_rnm_block
- `T3_CLASSES_POLITICA.md` — 5 classes canônicas (sem reply_text)
- `T3_VETO_SUAVE_VALIDADOR.md` — veto suave; validador pós-resposta/pré-persistência
- `T4_ENTRADA_TURNO.md` — TurnoEntrada (interface de entrada do turno)
- `T4_PIPELINE_LLM.md` — contrato único LLM; reply_text imutável
- `T4_VALIDACAO_PERSISTENCIA.md` — VC-01..VC-09; PersistDecision
- `T5_MAPA_FATIAS.md` §4.1 — especificação base desta fatia
- `CONTRATO_IMPLANTACAO_MACRO_T5.md` §6 S2; §7 CA-01..CA-08; §9 B-04/B-07/B-10
- `ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## §1 Objetivo operacional da fatia F1

**Enunciado:** Identificar quem é o lead e qual o contexto inicial de interesse — curiosidade,
simulação, dúvida, pergunta sobre imóvel, aprovação ou programa MCMV são **todos entradas válidas**
— e verificar a elegibilidade documental básica de acesso ao programa. A Enova transforma curiosidade
em oportunidade de venda; F1 identifica **contexto inicial suficiente**, não "intenção de compra confirmada".

**O que a fatia F1 entrega ao funil:**

1. `fact_lead_name` — identidade mínima do lead no atendimento
2. `fact_customer_goal` — contexto inicial de interesse capturado (compra, simulação, curiosidade ou dúvida — todas as entradas são válidas; não requer "intenção de compra confirmada")
3. `fact_nationality` — nacionalidade confirmada (gate de elegibilidade RNM)
4. `fact_rnm_status` (se estrangeiro) — status do RNM verificado
5. `derived_rnm_required` — flag de obrigatoriedade de RNM calculado
6. `derived_rnm_block` — flag de bloqueio RNM calculado (deve ser `false` na saída)

**O que a fatia F1 NÃO faz:**

- Não coleta renda, regime, estado civil ou composição familiar
- Não avalia elegibilidade de renda (escopo de F3)
- Não persiste restrições de crédito (escopo de F4)
- Não gera script de saudação nem texto de abertura
- Não define template de pergunta de abertura
- Não promete aprovação, subsídio, parcela ou financiamento

---

## §2 Stages legados cobertos (7)

| # | Stage legado | Objetivo operacional | Fatos T2 afetados | Observação |
|---|---|---|---|---|
| 1 | `inicio` | Identificar presença, canal e intenção inicial | `fact_customer_goal`, `fact_lead_name` | Ponto de entrada; sem bloqueio hard possível aqui |
| 2 | `inicio_decisao` | Identificar contexto inicial de interesse — compra, simulação, dúvida ou curiosidade sobre MCMV | `fact_customer_goal` | Qualquer interesse é entrada válida; `fact_customer_goal` captura o contexto inicial, **não exige "intenção de compra" confirmada** |
| 3 | `inicio_nome` | Capturar nome do lead | `fact_lead_name` | Se nome ausente: obrigação T3 ativa |
| 4 | `inicio_programa` | Identificar programa de interesse (MCMV) | `fact_customer_goal` | MCMV categórico — objetivo e programa unificados em `fact_customer_goal` |
| 5 | `inicio_nacionalidade` | Capturar e confirmar nacionalidade | `fact_nationality`, `derived_rnm_required` | Insumo crítico: `derived_rnm_required` calculado a partir daqui |
| 6 | `inicio_rnm` | Capturar status do RNM para estrangeiros | `fact_rnm_status`, `derived_rnm_block` | Só ativado se `derived_rnm_required = true`; bloqueio hard possível |
| 7 | `inicio_tem_validade` | Verificar se o RNM tem **validade indeterminada** | `fact_rnm_status` | **Regra comercial:** apenas RNM com validade indeterminada (sem data de vencimento) é aceito para financiamento; RNM com validade determinada (com data de vencimento, mesmo que não expirado) = pendência/bloqueio; `fact_rnm_status = "vencido"` captura o caso já expirado; distinção determinada/indeterminada = **LF-02** (lacuna de schema futura) — não criar `fact_*` novo |

### 2.1 Nota sobre `inicio_decisao` e `inicio_programa`

O legado Enova 1 trata esses dois stages como etapas distintas de coleta. Na ENOVA 2, o contexto
inicial de interesse — compra, simulação, dúvida, curiosidade sobre imóvel ou programa — é capturado
em `fact_customer_goal` (Group I — `T2_LEAD_STATE_V1.md §4.4`). Ambos os stages alimentam esse único
fato. O LLM decide como obter esse contexto na conversa — não há sequência obrigatória.

**Regra operacional:** todo lead que entrou em contato já é oportunidade. F1 **não pergunta
"você quer comprar?"**. Curiosidade, simulação, dúvida, pergunta sobre imóvel, aprovação ou
programa já são entradas válidas. A Enova transforma curiosidade em oportunidade de venda.
F1 identifica **contexto inicial suficiente**, não "intenção de compra confirmada".

### 2.2 Nota sobre `inicio_tem_validade` — regra de validade indeterminada

Para financiamento MCMV, o RNM aceito é exclusivamente de **validade indeterminada** (sem data
de vencimento). RNM com validade determinada (com data de vencimento, mesmo que ainda não expirado)
**não é válido para financiamento** — representa pendência/bloqueio.

- Estrangeiro sem RNM → pendência/bloqueio
- Estrangeiro com RNM de validade determinada (com data) → pendência/bloqueio
- Estrangeiro com RNM de validade indeterminada (sem data) → pode seguir
- Brasileiro → RNM não se aplica

O efeito de expiração (`fact_rnm_status = "vencido"`) já está capturado. A distinção entre
validade determinada e indeterminada **não possui `fact_*` canônico em T2_DICIONARIO_FATOS**:
→ Marcada como **LF-02** (ver §4 — Lacunas de schema futuras).
→ Esta PR **não cria** `fact_rnm_validity_type`, `fact_rnm_expiry_date` nem qualquer `fact_*` equivalente.

---

## §3 Fatos mínimos T2 — obrigatórios na saída de F1

> Todas as chaves abaixo existem em `T2_LEAD_STATE_V1.md §4.4` (fact_*) ou `§5.3` (derived_*).
> Nenhuma chave foi inventada. Nenhuma nova `fact_*` é criada nesta PR.

| Fato / Derived | Grupo T2 | Tipo | Status mínimo na saída de F1 | Condição de aplicação |
|---|---|---|---|---|
| `fact_lead_name` | Group I — Identidade e contexto base | text | `captured` mínimo; `confirmed` ideal | Sempre |
| `fact_customer_goal` | Group I — Identidade e contexto base | enum / text | `captured` mínimo | Contexto inicial de interesse — qualquer entrada é válida; **não é gate de saída hard** |
| `fact_nationality` | Group II — Nacionalidade e doc. identidade | enum | `confirmed` | Sempre — gate de saída de F1 |
| `fact_rnm_status` | Group II — Nacionalidade e doc. identidade | enum | `confirmed` | **Somente se** `derived_rnm_required = true` |
| `derived_rnm_required` | derived | boolean | calculado | Calculado a partir de `fact_nationality` |
| `derived_rnm_block` | derived | boolean | `false` | Deve ser `false` na saída; se `true` → F1 não está pronta |

### 3.1 Valores canônicos de `fact_rnm_status` (T2_DICIONARIO_FATOS)

| Valor | Significado | Efeito em `derived_rnm_block` | Observação |
|---|---|---|---|
| `"válido"` | RNM presente — T2 **não distingue** validade determinada de indeterminada | Depende de LF-02 | **Regra comercial:** apenas validade **indeterminada** (sem data de vencimento) permite financiamento. "Válido com data de vencimento" = pendência/bloqueio mesmo que não expirado. Esta distinção não está capturada no schema T2 atual → **LF-02**. Implementação não pode inferir `derived_rnm_block = false` apenas por `"válido"` sem confirmar o tipo de validade. |
| `"vencido"` | RNM presente mas com validade expirada | `derived_rnm_block = true` → bloqueio | Captura validade determinada já expirada |
| `"sem_rnm"` | Estrangeiro sem RNM | `derived_rnm_block = true` → bloqueio | — |
| `"inválido"` | RNM com irregularidade (status não reconhecido) | `derived_rnm_block = true` → bloqueio | — |
| `"não_aplicável"` | Reservado para lead não-estrangeiro | `derived_rnm_block = false` | — |

### 3.2 Fatos do Grupo I adicionalmente observáveis em F1 (não obrigatórios para saída)

Os seguintes fatos de Group I podem ser capturados durante F1, mas **não são gates de saída**:

| Fato | Grupo T2 | Observação |
|---|---|---|
| `fact_channel_origin` | Group I | Canal de origem — capturado via metadado do gateway, não via conversa |
| `fact_language_mode` | Group I | Modo de linguagem detectado — capturado pelo LLM; não é pergunta obrigatória |
| `fact_current_intent` | Group X — Intenção operacional | Sinal de intenção operacional — observado pelo LLM; não é gate |

---

## §4 Lacunas de schema futuras (F1)

| Código | Dado | Stage legado afetado | Situação | Ação T5.2-fix |
|---|---|---|---|---|
| LF-01 | Data exata de validade do RNM | `inicio_tem_validade` | Sem `fact_*` canônico em `T2_DICIONARIO_FATOS` | O efeito de expiração é capturado via `fact_rnm_status = "vencido"`; data exata requer declaração de `fact_*` em PR futura; esta PR NÃO cria `fact_rnm_expiry_date` |
| LF-02 | Tipo de validade do RNM (indeterminada vs determinada) | `inicio_tem_validade` | `fact_rnm_status = "válido"` em T2 não distingue entre RNM com data de vencimento e RNM sem data de vencimento | **Regra comercial:** apenas RNM com validade **indeterminada** (sem data de vencimento) é aceito para financiamento; RNM com validade **determinada** (com data), mesmo não expirado, não é aceito → pendência/bloqueio; T2 não captura essa distinção atualmente; resolução requer schema evolution (nova PR T2 futura); esta PR NÃO cria `fact_rnm_validity_type` nem equivalente |

---

## §5 Políticas T3 aplicáveis em F1

> Todas as políticas abaixo são instâncias das 5 classes canônicas declaradas em
> `T3_CLASSES_POLITICA.md`. Nenhuma produz `reply_text`. Nenhuma substitui a soberania do LLM.

### 5.1 Obrigações — "exigir ação mandatória"

| Código | `fact_key` exigida | Condição de disparo | Efeito no `lead_state` | Consequência se não coletado |
|---|---|---|---|---|
| OBR-F1-01 | `fact_lead_name` | `fact_lead_name` ausente ou `hypothesis` | `must_ask_now` ← `fact_lead_name`; `recommended_next_actions` ← `ACAO_COLETAR_NOME` | F1 não pode avançar sem identidade mínima |
| OBR-F1-02 | `fact_customer_goal` | `fact_customer_goal` totalmente ausente (sem nenhum sinal de contexto inicial) | `must_ask_now` ← `fact_customer_goal`; `recommended_next_actions` ← `ACAO_COLETAR_CONTEXTO_INICIAL` | F1 precisa de algum contexto inicial de interesse — compra, simulação, curiosidade ou dúvida são igualmente válidos; obrigação **não exige "intenção de compra declarada"**; `fact_customer_goal` em `hypothesis` não dispara OBR-F1-02 |
| OBR-F1-03 | `fact_nationality` | `fact_nationality` ausente ou `hypothesis` | `must_ask_now` ← `fact_nationality` | Sem nacionalidade, `derived_rnm_required` não pode ser calculado |
| OBR-F1-04 | `fact_rnm_status` | `derived_rnm_required = true` E `fact_rnm_status` ausente ou `hypothesis` | `must_ask_now` ← `fact_rnm_status`; `recommended_next_actions` ← `ACAO_COLETAR_RNM` | Estrangeiro sem RNM verificado não pode avançar |

### 5.2 Confirmações — "pedir confirmação de fato existente"

| Código | `fact_key` a confirmar | Condição de disparo | `confirmation_level` | Efeito no `lead_state` |
|---|---|---|---|---|
| CONF-F1-01 | `fact_customer_goal` | `fact_customer_goal` em `captured` com conteúdo ambíguo que possa afetar roteamento posterior | `soft` | Sinal orientativo ao LLM para aprofundar entendimento se necessário; `needs_confirmation = false` (não bloqueia F1); **não é gate de saída de F1** — contexto inicial capturado é suficiente para avançar |
| CONF-F1-02 | `fact_nationality` | `fact_nationality` em `captured` | `hard` | `needs_confirmation = true`; confirmação obrigatória antes de avaliar RNM; fato em `captured` não sustenta avaliação de `derived_rnm_required` com confiança suficiente |
| CONF-F1-03 | `fact_rnm_status` | `fact_rnm_status` em `captured` com `derived_rnm_required = true` | `hard` | `needs_confirmation = true`; status RNM deve ser `confirmed` antes de liberar avanço |

### 5.3 Bloqueios — "bloquear avanço de `current_phase`"

| Código | Regra | Condição estrita | Efeito no `lead_state` | Resolução exigida |
|---|---|---|---|---|
| BLQ-F1-01 | R_ESTRANGEIRO_SEM_RNM | `fact_nationality.value != "brasileiro"` E `fact_nationality.status = "confirmed"` E `fact_rnm_status.value` ∈ {`"sem_rnm"`, `"vencido"`, `"inválido"`} E `fact_rnm_status.status = "confirmed"` | `blocked_by` ← {`reason: "R_ESTRANGEIRO_SEM_RNM"`, `resolution: "RNM com validade indeterminada exigido para financiamento"`}; `advance_allowed = false`; `derived_rnm_block = true`; `elegibility_status` pode evoluir para `"ineligible"` se terminal | Lead deve obter RNM com **validade indeterminada**; RNM com validade determinada (mesmo não vencido) não é aceito para financiamento — pendência/bloqueio (ver LF-02); `current_phase` permanece `discovery` |

> **Invariantes de bloqueio (CP-09 de T3_CLASSES_POLITICA):**
> - `fact_nationality` em `hypothesis` **nunca** sustenta BLQ-F1-01
> - `fact_nationality` em `captured` **não** sustenta BLQ-F1-01 diretamente — gera CONF-F1-02
> - `fact_rnm_status` em `inferred` **nunca** sustenta bloqueio terminal — gera CONF-F1-03
>
> **Nota LF-02 — validade determinada:**
> Pela regra comercial, estrangeiro com RNM de validade determinada (com data de vencimento,
> mesmo que não expirado) também não pode avançar para financiamento. Esta condição **não está
> capturada** em `fact_rnm_status = "válido"` do schema T2 atual. A resolução de LF-02 adicionará
> a distinção ao schema. Até lá: (a) BLQ-F1-01 cobre os casos {sem_rnm, vencido, inválido};
> (b) a regra de validade determinada fica como **restrição operacional documentada** — o LLM
> deve obter essa informação do lead e tratar `fact_rnm_status` com cautela se souber que a
> validade é determinada; (c) implementação não pode inferir `derived_rnm_block = false` apenas
> por `fact_rnm_status = "válido"` sem confirmar o tipo de validade (indeterminada).

### 5.4 Sugestões mandatórias — "apenas orientar"

| Código | Gatilho | `guidance_code` | Conduta esperada do LLM |
|---|---|---|---|
| SGM-F1-01 | `signal_urgency = "alto"` + F1 incompleta + lead tentando avançar para renda/imóvel | `SGM_URGENCIA_F1_INCOMPLETA` | Reconhecer a urgência e conduzir naturalmente o preenchimento dos fatos mínimos de F1 — sem travar nem apressar; sem expor o mecanismo de stages |
| SGM-F1-02 | `fact_customer_goal` em `captured` com ambiguidade detectada (`signal_confusion_level = "alto"`) | `SGM_OBJETIVO_AMBIGUO` | Aprofundar a compreensão do objetivo com naturalidade; não presumir MCMV sem confirmação explícita |
| SGM-F1-03 | Lead estrangeiro com `derived_rnm_required = true` mas sem adversidade detectada | `SGM_ESTRANGEIRO_SEM_BLOQUEIO` | Conduzir coleta de `fact_rnm_status` com fluidez; não tratar como gate adverso se RNM válido provável |

### 5.5 Roteamento — "desviar objetivo / avançar fase"

| Código | Condição | `target_phase` | `transition_type` | `requires_confirmation` |
|---|---|---|---|---|
| ROT-F1-01 | Todos os critérios de saída de F1 atendidos (ver §7) | `qualification` | `advance` | `false` |

> **Regra de precedência (T3_ORDEM_AVALIACAO §2):**
> ROT-F1-01 só é avaliado no Estágio 6 do pipeline T3 — após bloqueios, confirmações e obrigações
> terem sido processados nos estágios anteriores. Roteamento nunca ocorre com `blocked_by` ativo.

---

## §6 Veto suave aplicável em F1

O veto suave não impede avanço. É sinal estruturado de risco soft emitido em `soft_vetos[]`
dentro do `PolicyDecisionSet`. O LLM lê e decide como conduzir.

| Código | Condição | Severity | `guidance` ao LLM |
|---|---|---|---|
| VS-F1-01 | `fact_nationality` em `captured` sem `confirmed` + lead sinalizando pressa para avançar | `"warning"` | Risco de decisão sobre RNM baseada em dado não confirmado; aguardar confirmação antes de avaliação RNM |
| VS-F1-02 | `fact_customer_goal` em `captured` com múltiplos objetivos possíveis detectados | `"info"` | Contexto inicial pode ser aprofundado se relevante para roteamento — **não bloqueia F1**; simulação, curiosidade e dúvida são entradas válidas; veto orientativo para capturar contexto mais preciso se necessário |
| VS-F1-03 | Lead expressa curiosidade ou intenção de simulação sem mencionar compra explícita | `"info"` | Curiosidade e simulação são entradas válidas para F1 — **não exigem "intenção de compra"** para avançar; `fact_customer_goal` pode ser capturado como interesse informacional; veto apenas orienta o LLM a não persistir "MCMV_compra_confirmada" se o contexto não suportar essa leitura |

---

## §7 Critérios de entrada de F1

A fatia F1 está apta a iniciar quando todas as condições abaixo forem verdadeiras:

| Condição | Verificação |
|---|---|
| `lead_state` inicializado | `meta.lead_id` e `meta.case_id` presentes |
| `operational.current_phase` ∈ {`null`, `"discovery"`} | Novo lead ou retomada em `discovery` |
| T4 disponível como orquestrador | `TurnoEntrada` shape conforme `T4_ENTRADA_TURNO.md` |
| Sem bloqueio prévio incompatível | `operational.blocked_by` vazio ou sem bloqueio ativo de F1 |

---

## §8 Critérios de saída — pronto para F2

F1 está **pronta** quando todas as condições abaixo forem verdadeiras simultaneamente:

| Critério | Chave | Condição exigida |
|---|---|---|
| Contexto inicial de interesse presente | `fact_customer_goal` | `status = "captured"` mínimo — qualquer interesse em MCMV, imóvel, financiamento, simulação ou programa; **não requer `confirmed = true`** |
| Identidade mínima presente | `fact_lead_name` | `status = "captured"` mínimo |
| Nacionalidade confirmada | `fact_nationality` | `status = "confirmed"` E `confirmed = true` |
| RNM verificado (se aplicável) | `fact_rnm_status` | SE `derived_rnm_required = true` → `status = "confirmed"` E `value = "válido"` (validade indeterminada — LF-02) |
| Bloqueio RNM ausente | `derived_rnm_block` | `value = false` |
| Sem bloqueio ativo | `operational.blocked_by` | vazio |
| Roteamento disponível | — | ROT-F1-01 pode ser executado |

### 8.1 F1 NÃO está pronta se

- `fact_customer_goal` **ausente** (nenhum contexto inicial de interesse identificado)
- `fact_nationality` em `captured` sem `confirmed` (fato capturado mas não confirmado)
- `derived_rnm_required = true` e `fact_rnm_status` ausente, `hypothesis` ou `captured`
- `derived_rnm_block = true` (bloqueio ativo)
- `operational.blocked_by` não vazio com BLQ-F1-01

> **Nota:** `fact_customer_goal` em `captured` (mesmo sem `confirmed`) **NÃO impede** o avanço de F1.
> Curiosidade, simulação e dúvida são entradas válidas. F1 não exige "intenção de compra confirmada".

---

## §9 Relação com pipeline T4

> Esta seção declara como F1 se integra ao pipeline T4 já aprovado.
> **Nenhuma alteração em artefatos T4_*.md** — o pipeline é consumido, não modificado.

### 9.1 `TurnoEntrada` em F1

Campos de `TurnoEntrada` relevantes para F1 (shape completo em `T4_ENTRADA_TURNO.md`):

| Campo | Valor esperado em F1 | Fonte |
|---|---|---|
| `operational.current_phase` | `"discovery"` | `lead_state` persistido |
| `operational.must_ask_now` | `["fact_lead_name"]` e/ou `["fact_customer_goal"]` e/ou `["fact_nationality"]` se ausentes | Policy engine T3 — estágio 4 |
| `operational.blocked_by` | `[]` (esperado na entrada); `[{R_ESTRANGEIRO_SEM_RNM, ...}]` se bloqueio ativo | Policy engine T3 — estágio 2 |
| `lead_state.facts.fact_customer_goal` | `FactEntry` com `status` atual | Persistido em turno anterior |
| `lead_state.facts.fact_nationality` | `FactEntry` com `status` atual | Persistido em turno anterior |
| `lead_state.facts.fact_rnm_status` | `FactEntry` se coletado | Persistido em turno anterior |
| `lead_state.derived.derived_rnm_required` | `DerivedEntry` com `value: true/false` | Calculado pelo mecânico |
| `lead_state.derived.derived_rnm_block` | `DerivedEntry` com `value: true/false` | Calculado pelo mecânico |
| `policy_context.prior_decisions` | `PolicyDecisionSet` com obrigações/bloqueios ativos | Policy engine T3 |
| `policy_context.soft_vetos` | `VetoSuaveRecord[]` se VS-F1-01..03 ativos | Policy engine T3 — veto suave |

### 9.2 `reply_text` — invariante T4

- `reply_text` vem **exclusivamente do LLM** via chamada única em T4.2
- `reply_text` é **imutável após captura** — nenhuma etapa pós-LLM reescreve, complementa ou substitui
- F1 **não produz** `reply_text`, sugestão de fala, script ou template em nenhuma circunstância
- Se `ValidationResult = REJECT` (T4.3), `reply_text` não é entregue ao canal; T4.5 aciona fallback — sem reescrever o texto

### 9.3 `TurnoSaida` e persistência pós-F1

Após o LLM gerar `reply_text` e o mecânico extrair `extracted_facts` (via `LLMResponseMeta`):

- T4.3 valida o `ProposedStateDelta` contra VC-01..VC-09
- Se `ValidationResult = APPROVE` ou `REQUIRE_REVISION`, fatos de F1 são persistidos em `lead_state`
- `derived_rnm_required` e `derived_rnm_block` são recalculados pelo mecânico após cada persistência
- `TurnoRastro` registra a decisão de persistência, as políticas aplicadas e o estado resultante

---

## §10 Classes de risco — comportamentos proibidos nesta fatia

> Estas são **classes de risco**, não frases proibidas. O LLM não pode incorrer nessas
> classes de comportamento em nenhuma fala produzida durante a fatia F1.
> O objetivo é declarar os limites operacionais — não roteirizar como o LLM deve falar.

| Código | Classe de risco | Descrição | Por que é proibida |
|---|---|---|---|
| CR-F1-01 | Prometer aprovação ou pré-aprovação | Dizer ou sugerir que o lead "está aprovado", "se enquadra" ou "vai conseguir" baseado em dados de F1 | F1 não tem dados de renda nem elegibilidade real; qualquer promessa é falsa e viola A00-ADENDO-02 M-03 |
| CR-F1-02 | Garantir financiamento ou subsídio | Qualquer declaração de valor de subsídio, parcela ou financiamento baseada em F1 | Dados insuficientes; viria sem `derived_subsidy_band_hint` calculado; proibido por M-03 |
| CR-F1-03 | Tratar estrangeiro sem RNM válido como elegível | Avançar para qualificação, sugerir programas ou coletar renda de lead com `derived_rnm_block = true` | Viola R_ESTRANGEIRO_SEM_RNM; bloqueio hard ativo |
| CR-F1-04 | Ignorar ou minimizar a verificação de nacionalidade | Não verificar `fact_nationality` ou tratar ausência de RNM como detalhe menor | `derived_rnm_required` depende de `fact_nationality`; omissão compromete todo o funil |
| CR-F1-05 | Avançar para qualificação com F1 incompleta | Coletar renda, regime ou estado civil antes de F1 pronta (critérios §8 não atendidos) | Viola sequência declarada; fatos de F3 sem fatos de F1 = estado inconsistente |
| CR-F1-06 | Inventar ou forçar "intenção de compra confirmada" sem base | Persistir `fact_customer_goal` como "intenção de compra confirmada" sem nenhum sinal do lead; tratar simulação, curiosidade ou dúvida como se fossem "intenção de compra declarada" | Simulação, curiosidade e dúvida são contextos válidos distintos de "intenção de compra confirmada"; viola VC-07 (T4_VALIDACAO_PERSISTENCIA) ao persistir estado de compra sem evidência explícita |
| CR-F1-07 | Usar template rígido de saudação ou abertura | Abrir com frase pronta como "Olá! Sou o assistente MCMV. Como posso ajudar?" de forma idêntica em todos os leads | Viola CA-01, B-04, A00-ADENDO-01; o LLM decide a abertura com autonomia |
| CR-F1-08 | If/else explícito de fala por perfil | "Se lead é brasileiro → dizer X; se estrangeiro → dizer Y" como regra de saída da fatia | Viola CA-01, B-04 permanentemente; qualquer if/else de fala é não-conformidade imediata |
| CR-F1-09 | Expor mecanismo de bloqueio ao lead | Frases como "o sistema bloqueou porque você não tem RNM" ou "o processo foi interrompido por regra" | LLM conduz com naturalidade a partir do objetivo; nunca expõe mecânica de estados |
| CR-F1-10 | Persistir fato inventado sem base em T2 | Criar `fact_rnm_expiry_date`, `fact_is_buyer_confirmed` ou qualquer chave fora de `T2_DICIONARIO_FATOS` | Viola B-10 (bloqueio ativo); LF-01 é lacuna conhecida — não se cria `fact_*` para cobrir |

---

## §11 Anti-padrões proibidos em F1

| Código | Anti-padrão | Referência |
|---|---|---|
| AP-F1-01 | `reply_text` como output de qualquer componente de F1 | A00-ADENDO-01; T4_PIPELINE_LLM §1 |
| AP-F1-02 | Script de saudação ou abertura pré-definido | CA-01, B-04 |
| AP-F1-03 | Pergunta fixa de abertura ("qual o seu nome?", "você é brasileiro?") como obrigação mecânica | CA-01; o LLM decide como obter o dado |
| AP-F1-04 | Roteamento ROT-F1-01 com `blocked_by` ativo | T3_ORDEM_AVALIACAO §2.6 — roteamento só executa no Estágio 6, após bloqueios resolvidos |
| AP-F1-05 | Avaliação de `derived_rnm_block` com `fact_nationality` em `hypothesis` | T3_CLASSES_POLITICA §2.2 CP-09 — `hypothesis` nunca sustenta bloqueio |
| AP-F1-06 | Tratar simulação ou curiosidade como "intenção de compra confirmada" e persistir nesse estado | Simulação, curiosidade e dúvida são contextos válidos distintos — não são "intenção de compra"; T4_VALIDACAO_PERSISTENCIA VC-07 |
| AP-F1-07 | Criação de `fact_rnm_expiry_date` ou qualquer `fact_*` fora de T2 | T2_LEAD_STATE_V1 §4.5; B-10 |
| AP-F1-08 | `current_phase` avançado para `qualification` sem todos os critérios §8 | ROT-F1-01 só executa com critérios completos |
| AP-F1-09 | Uso de Meta / WhatsApp real para validação nesta fatia | B-07 — proibido antes de G5 |
| AP-F1-10 | Alteração de artefatos T1/T2/T3/T4 por necessidade desta fatia | B-06 — bloqueio ativo; lacunas devem ser documentadas, não resolvidas por alteração retroativa |

---

## §12 Cenários sintéticos declarativos

> Cenários são declarativos — descrevem o comportamento esperado do sistema (policy engine +
> mecânico + LLM) sem prescrever código ou implementação. Cada cenário tem: prior state,
> evento do turno, saída esperada do policy engine, resultado esperado, critério de PASS.

### Cenário SYN-F1-01 — Lead brasileiro, objetivo claro, nome informado → F1 pronta

**Contexto:** lead novo, primeiro turno do atendimento.

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name.status = "captured"
facts.fact_lead_name.confirmed = false
facts.fact_customer_goal.value = "MCMV_compra"
facts.fact_customer_goal.status = "confirmed"
facts.fact_nationality.value = "brasileiro"
facts.fact_nationality.status = "confirmed"
derived.derived_rnm_required.value = false
derived.derived_rnm_block.value = false
operational.blocked_by = []
```

**Avaliação T3 esperada:**
- Estágio 2: zero bloqueios — `derived_rnm_block = false`
- Estágio 3: CONF-F1-01 já resolvida (`fact_customer_goal = confirmed`)
- Estágio 4: zero obrigações — todos os fatos mínimos presentes e confirmados (exceto nome que pode ser só `captured`)
- Estágio 6: ROT-F1-01 disponível para execução

**Resultado esperado:** `PolicyDecisionSet` vazio de bloqueios; ROT-F1-01 autorizado; mecânico pode avançar `current_phase → "qualification"` no turno seguinte ao receber `ACAO_AVANÇAR_STAGE`.

**Critério de PASS:** `derived_rnm_block = false`; `operational.blocked_by = []`; critérios §8 todos verdadeiros; ROT-F1-01 elegível.

---

### Cenário SYN-F1-02 — Lead sem nome informado → obrigação ativa, sem fala mecânica

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name = ausente
facts.fact_customer_goal.status = "captured"
facts.fact_nationality = ausente
operational.must_ask_now = []
```

**Avaliação T3 esperada:**
- Estágio 4: OBR-F1-01 (fact_lead_name ausente) + OBR-F1-02 (fact_customer_goal apenas captured) + OBR-F1-03 (fact_nationality ausente)
- `must_ask_now = ["fact_lead_name", "fact_customer_goal", "fact_nationality"]` (na ordem de prioridade T3)
- `recommended_next_actions = ["ACAO_COLETAR_NOME", "ACAO_COLETAR_OBJETIVO"]`

**Resultado esperado:** LLM recebe `must_ask_now` e obrigações; conduz conversa para obter nome, objetivo e nacionalidade com naturalidade — **sem script fixo**, **sem pergunta mecânica**, **sem "por favor informe seu nome"** como template.

**Critério de PASS:** zero `reply_text` produzido pela fatia; mecânico emite obrigações corretas; LLM soberano na fala.

---

### Cenário SYN-F1-03 — Lead estrangeiro com RNM de validade indeterminada → pode avançar

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name.status = "captured"
facts.fact_customer_goal.status = "captured"
facts.fact_nationality.value = "estrangeiro"
facts.fact_nationality.status = "confirmed"
facts.fact_rnm_status.value = "válido"
facts.fact_rnm_status.status = "confirmed"
derived.derived_rnm_required.value = true
derived.derived_rnm_block.value = false
operational.blocked_by = []
```

**Observação:** `fact_rnm_status = "válido"` indica RNM presente. Pela regra comercial (LF-02), o sistema deve confirmar que a validade é **indeterminada** (sem data de vencimento). O schema T2 atual não captura essa distinção — LF-02 registra essa lacuna.

**Avaliação T3 esperada:**
- Estágio 2: R_ESTRANGEIRO_SEM_RNM — condição não satisfeita (`fact_rnm_status = "válido"`); zero bloqueios pelo schema atual
- Estágio 4: zero obrigações — fatos mínimos presentes
- Estágio 6: ROT-F1-01 elegível

**Resultado esperado:** estrangeiro com RNM válido (validade indeterminada) avança normalmente para `qualification`. LLM não menciona "você é estrangeiro" como fato mecânico. Nota: se o LLM souber que a validade é determinada (com data), deve tratar como pendência mesmo sem bloqueio automático no schema atual (LF-02 pendente).

**Critério de PASS:** `derived_rnm_block = false`; ROT-F1-01 elegível; sem bloqueio ativo; nota LF-02 aplicável.

---

### Cenário SYN-F1-04 — Lead estrangeiro sem RNM válido → bloqueio hard

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_customer_goal.status = "confirmed"
facts.fact_nationality.value = "estrangeiro"
facts.fact_nationality.status = "confirmed"
facts.fact_rnm_status.value = "sem_rnm"
facts.fact_rnm_status.status = "confirmed"
derived.derived_rnm_required.value = true
derived.derived_rnm_block.value = true
```

**Avaliação T3 esperada:**
- Estágio 2: BLQ-F1-01 disparado — R_ESTRANGEIRO_SEM_RNM
- `blocked_by = [{reason: "R_ESTRANGEIRO_SEM_RNM", resolution: "fact_rnm_status deve ser 'válido'"}]`
- `advance_allowed = false`
- Estágio 6: ROT-F1-01 **não executado** (bloqueio ativo)

**Resultado esperado:** `current_phase` permanece `"discovery"`; LLM recebe `blocked_by` e conduz a situação com dignidade — explicando o que é necessário para o lead regularizar sua situação — sem expor mecanismo de bloqueio ("o sistema bloqueou..."); sem prometer que o problema será resolvido; sem avançar para qualificação.

**Variantes cobertas:** `fact_rnm_status = "vencido"` (via `inicio_tem_validade`) e `"inválido"` produzem o mesmo resultado operacional.

**Critério de PASS:** BLQ-F1-01 emitido; `advance_allowed = false`; ROT-F1-01 bloqueado; zero `reply_text` da fatia.

---

### Cenário SYN-F1-05 — Lead com objetivo apenas capturado → pode avançar sem confirmação hard

**Contexto:** lead informa "tenho interesse em saber sobre o Minha Casa" — contexto inicial capturado, sem declaração explícita de intenção de compra.

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name.status = "captured"
facts.fact_customer_goal.value = "interesse_mcmv_informacional"
facts.fact_customer_goal.status = "captured"
facts.fact_customer_goal.confirmed = false
facts.fact_nationality = ausente
```

**Avaliação T3 esperada:**
- Estágio 3: CONF-F1-01 — `fact_customer_goal` em `captured` com possível ambiguidade; dispara como `soft` (orientativo, não bloqueia)
- `needs_confirmation = false` — não é gate de saída
- Estágio 4: OBR-F1-03 — `fact_nationality` ausente (obrigação ativa)
- VS-F1-02 pode ser emitido se LLM detectar múltiplos objetivos possíveis

**Resultado esperado:** F1 **não bloqueia** por `fact_customer_goal` apenas `captured`; mecânico emite OBR-F1-03 para coletar `fact_nationality`; LLM conduz naturalmente; contexto inicial capturado é suficiente — `fact_customer_goal` pode evoluir para `confirmed` em turnos futuros sem ser gate agora.

**Critério de PASS:** F1 **não trancada** por `fact_customer_goal` sem `confirmed`; OBR-F1-03 emitida; CONF-F1-01 apenas orientativa (soft); zero `reply_text` da fatia; LLM soberano.

---

### Cenário SYN-F1-06 — Lead diz "quero simular" → entrada válida, F1 procede

**Contexto:** Lead entra com "quero simular o valor de uma casa". Esta é uma entrada válida — curiosidade e simulação são oportunidades de venda para a Enova.

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name = ausente
facts.fact_customer_goal = ausente
operational.must_ask_now = []
```

**Evento do turno:** lead envia "quero simular o valor de uma casa".

**Avaliação T3 esperada:**
- Estágio 4: OBR-F1-01 (nome ausente) + OBR-F1-03 (nacionalidade ausente)
- OBR-F1-02 **não disparada** — "quero simular" é sinal suficiente de contexto inicial; `fact_customer_goal` pode ser capturado como `"interesse_simulacao"` ou contexto equivalente
- VS-F1-03 pode ser emitido como orientação ao LLM: não persistir "MCMV_compra_confirmada" com base apenas em "quero simular"
- `must_ask_now = ["fact_lead_name", "fact_nationality"]`

**Resultado esperado:** "quero simular" é **entrada válida para F1**; mecânico registra `fact_customer_goal` como capturado (interesse de simulação); LLM conduz para obter nome e nacionalidade — sem perguntar "você quer mesmo comprar?" nem travar por falta de "intenção de compra declarada"; `fact_customer_goal` **não é** persistido como "intenção de compra confirmada" sem base, mas o lead avança normalmente.

**Critério de PASS:** F1 **não bloqueada** por "quero simular" sem "quero comprar"; `fact_customer_goal` capturado como contexto de simulação/interesse; OBR-F1-01/03 ativas; VS-F1-03 orientativo; zero `reply_text` da fatia.

---

### Cenário SYN-F1-07 — Lead tenta pular para renda antes de F1 pronta

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name.status = "captured"
facts.fact_customer_goal.status = "captured"
facts.fact_customer_goal.confirmed = false
facts.fact_nationality = ausente
derived.derived_rnm_block.value = false
```

**Evento do turno:** lead diz "minha renda é 2.500, quanto consigo de financiamento?".

**Avaliação T3 esperada:**
- Estágio 3: CONF-F1-01 ativa (`fact_customer_goal` sem `confirmed`)
- Estágio 4: OBR-F1-02/03 ativas
- Estágio 6: ROT-F1-01 **não elegível** — critérios §8 não atendidos
- `current_phase` permanece `"discovery"`

**Resultado esperado:** mecânico não avança para `qualification`; LLM não coleta renda neste turno (renda é escopo de F3); LLM responde a pergunta de financiamento **sem prometer valor** (CR-F1-02) e conduz o retorno ao fluxo de F1 com naturalidade — sem expor que o lead "pulou uma etapa".

**Critério de PASS:** `current_phase` permanece `"discovery"`; renda NÃO persistida; `fact_monthly_income_p1` NÃO criado neste turno; CR-F1-02 não violada.

---

## §13 Validação cruzada T2 / T3 / T4 / T5.1

| Dimensão | Verificação | Status |
|---|---|---|
| `fact_lead_name` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group I` — `fact_lead_name` listado | ✓ CONFIRMADO |
| `fact_customer_goal` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group I` — `fact_customer_goal` listado; status mínimo exigido em saída: `captured` (não `confirmed` — v2) | ✓ CONFIRMADO |
| `fact_nationality` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group II` — `fact_nationality` listado | ✓ CONFIRMADO |
| `fact_rnm_status` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group II` — `fact_rnm_status` listado | ✓ CONFIRMADO |
| `derived_rnm_required` existe em T2 | `T2_LEAD_STATE_V1 §5.3` — `derived_rnm_required` listado; `derived_from: fact_nationality` | ✓ CONFIRMADO |
| `derived_rnm_block` existe em T2 | `T2_LEAD_STATE_V1 §5.3` — `derived_rnm_block` listado; `derived_from: derived_rnm_required + fact_rnm_status` | ✓ CONFIRMADO |
| BLQ-F1-01 referencia R_ESTRANGEIRO_SEM_RNM | `T3_ORDEM_AVALIACAO §2.2` — R_ESTRANGEIRO_SEM_RNM listado como regra crítica de Estágio 2 | ✓ CONFIRMADO |
| Bloqueio com `hypothesis` proibido | `T3_CLASSES_POLITICA §2.2 CP-09` — fato em hypothesis nunca sustenta bloqueio | ✓ DECLARADO em BLQ-F1-01 invariantes |
| Roteamento é Estágio 6 | `T3_ORDEM_AVALIACAO §2.6` — roteamento só executa após bloqueios/confirmações/obrigações | ✓ DECLARADO em ROT-F1-01 |
| `reply_text` exclusivo do LLM | `T4_PIPELINE_LLM §1` — contrato único; reply_text imutável | ✓ DECLARADO em §9.2 |
| `TurnoEntrada` não produz reply_text | `T4_ENTRADA_TURNO §1` — TurnoEntrada carrega contexto; nunca produz resposta | ✓ DECLARADO em §9.1 |
| T4_VALIDACAO: persistência requer coleta explícita | `T4_VALIDACAO_PERSISTENCIA VC-07` — `confirmed = true` sem coleta = REJECT | ✓ DECLARADO em AP-F1-06 |
| Veto suave em `soft_vetos[]` | `T3_VETO_SUAVE_VALIDADOR §1.1` — veto suave registrado em `soft_vetos[]`, não em `decisions[]` | ✓ DECLARADO em §6 |
| Fatia F1 mapeada em T5_MAPA_FATIAS | `T5_MAPA_FATIAS §4.1` — F1 com current_phase, fatos, políticas e critérios | ✓ CONFIRMADO |
| LF-01 herdada de T5_MAPA_FATIAS | `T5_MAPA_FATIAS §3.1 (inicio_tem_validade)` e tabela LF | ✓ CONFIRMADO — não criado `fact_*` novo |
| LF-02 nova — tipo de validade RNM | Distinção validade determinada/indeterminada não capturada em T2; regra comercial documentada; não criado `fact_rnm_validity_type` | ✓ DECLARADO — §4 + §3.1 + §5.3 |
| Regra RNM: validade indeterminada exigida | Regra comercial: RNM com data de vencimento (mesmo não expirado) = bloqueio; validade indeterminada = pode seguir | ✓ DECLARADO — §2.2 + §3.1 + BLQ-F1-01 nota LF-02 |
| `fact_customer_goal` não exige `confirmed` como gate | F1 identifica contexto inicial suficiente — `captured` é suficiente; `confirmed` não é gate de saída (v2) | ✓ DECLARADO — §8 + §8.1 + §2.1 |
| Zero `fact_*` inventado | Cada chave verificada em `T2_LEAD_STATE_V1 §4.4` e `§5.3`; LF-02 documentada sem criar `fact_*` | ✓ CONFIRMADO |
| Zero alteração em T1/T2/T3/T4 | Diff desta PR: apenas schema/implantation/T5_FATIA_TOPO_ABERTURA.md + rastreamento | ✓ CONFIRMADO |

---

## Bloco E — PR-T5.2-fix (v2 — corretiva)

### Evidências de conclusão

| Item contratual | Status | Evidência / localização |
|---|---|---|
| Fatia F1 formalizada (7 stages cobertos) | **CONCLUÍDO** | §2 — tabela de stages com objetivos operacionais |
| `current_phase = discovery` declarado | **CONCLUÍDO** | Meta + §1 + §7 |
| Fatos mínimos T2 canônicos (6 chaves) | **CONCLUÍDO** | §3 — todas as chaves verificadas em T2_LEAD_STATE_V1 |
| Nenhum `fact_*` inventado | **CONCLUÍDO** | §13 validação cruzada — zero chaves fora de T2; LF-02 documentada sem criar fact_* |
| LF-01 declarada (data validade RNM) | **CONCLUÍDO** | §4 — LF-01 |
| **LF-02 declarada (tipo de validade RNM — v2)** | **CONCLUÍDO** | §4 — LF-02; §2.2; §3.1; §5.3 nota; BLQ-F1-01 nota |
| **Premissa de "confirmar intenção de compra" removida (v2)** | **CONCLUÍDO** | §1; §2.1; §3 (fact_customer_goal status = captured); §8; §8.1; CONF-F1-01 soft; SYN-F1-05/06 |
| **Regra RNM corrigida: validade indeterminada exigida (v2)** | **CONCLUÍDO** | §2.2; §3.1 tabela RNM; §4 LF-02; BLQ-F1-01 nota LF-02; SYN-F1-03/04 |
| Políticas T3 aplicáveis (5 classes) | **CONCLUÍDO** | §5 — OBR/CONF/BLQ/SGM/ROT com payloads |
| Veto suave declarado | **CONCLUÍDO** | §6 — VS-F1-01..03 (v2: VS-F1-02/03 corrigidos) |
| Critérios de entrada | **CONCLUÍDO** | §7 |
| Critérios de saída / pronto para F2 | **CONCLUÍDO** | §8 — 7 critérios (v2: fact_customer_goal capturado é suficiente) |
| Relação com pipeline T4 | **CONCLUÍDO** | §9 — TurnoEntrada, reply_text invariante, persistência |
| Classes de risco (10 classes) | **CONCLUÍDO** | §10 — CR-F1-01..CR-F1-10 (v2: CR-F1-06 corrigida) |
| Anti-padrões proibidos (10) | **CONCLUÍDO** | §11 — AP-F1-01..AP-F1-10 (v2: AP-F1-06 corrigida) |
| Cenários sintéticos declarativos (7) | **CONCLUÍDO** | §12 — SYN-F1-01..07 (v2: SYN-F1-03/05/06 corrigidos) |
| Validação cruzada T2/T3/T4/T5.1 | **CONCLUÍDO** | §13 (v2: 3 novos itens adicionados) |
| Nenhum `reply_text` produzido pela fatia | **CONCLUÍDO** | §9.2; AP-F1-01; CA-08 |
| Nenhum script/template de fala | **CONCLUÍDO** | §10 CR-F1-07/CR-F1-08; AP-F1-02/AP-F1-03 |
| Conformidade A00-ADENDO-01/02/03 | **CONCLUÍDO** | §1 princípio canônico; §10; §11 |

### Provas (P-T5-01 a P-T5-05)

| Prova | Status | Evidência |
|---|---|---|
| P-T5-01 — Ausência de reply_text em outputs da fatia | PASS | Zero campos `reply_text`, `mensagem_usuario`, `texto_cliente` ou template em qualquer seção do documento |
| P-T5-02 — Referências cruzadas T2 | PASS | §13 confirma todas as 6 chaves fact_* / derived_* em T2_LEAD_STATE_V1; LF-02 sem criar fact_* |
| P-T5-03 — Referências cruzadas T3 | PASS | §5 e §13 confirmam todas as políticas em T3_CLASSES_POLITICA e T3_ORDEM_AVALIACAO |
| P-T5-04 — Ausência de "intenção de compra confirmada" como gate | PASS | fact_customer_goal status mínimo = captured; CONF-F1-01 soft; §8 critério corrigido; §8.1 nota explícita |
| P-T5-05 — Regra RNM correta (validade indeterminada exigida) | PASS | §2.2 regra explícita; §3.1 nota "válido" LF-02; §4 LF-02 declarada; BLQ-F1-01 nota LF-02; SYN-F1-03/04 corrigidos |

### Status

**CONCLUÍDA — v2 (corretiva)** — PR-T5.2-fix entregue; contrato T5 permanece `aberto`; PR-T5.3 desbloqueada após merge desta PR corretiva.

### Próxima PR autorizada

**PR-T5.3 — Contrato da fatia qualificação inicial**
Artefato: `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL.md`
7 stages: `estado_civil`, `confirmar_casamento`, `interpretar_composicao`, `confirmar_avo_familiar`,
`dependente`, `financiamentos_conjunto`, `quem_pode_somar`
`current_phase: qualification`
