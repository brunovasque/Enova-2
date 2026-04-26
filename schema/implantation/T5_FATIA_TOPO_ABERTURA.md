# T5_FATIA_TOPO_ABERTURA — Contrato da Fatia F1: Topo / Abertura / Primeira Intenção — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.2 |
| Branch | feat/t5-pr5-2-fatia-topo-abertura |
| Fatia | F1 — Topo / Abertura / Primeira Intenção |
| `current_phase` | `discovery` |
| Status | entregue |
| Pré-requisito | PR-T5.1 — `T5_MAPA_FATIAS.md` merged |
| Autoriza | PR-T5.3 — Contrato da fatia qualificação inicial |
| Legados aplicáveis | L03 (obrigatório), L04, L05, L06 (obrigatórios — topo do funil), L19 (complementar — MCMV) |
| Data | 2026-04-26 |

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

**Enunciado:** Identificar quem é o lead, qual é a sua intenção principal (objetivo MCMV), e
verificar a elegibilidade documental básica de acesso ao programa — sem avançar para qualificação
até que todos os critérios mínimos estejam atendidos.

**O que a fatia F1 entrega ao funil:**

1. `fact_lead_name` — identidade mínima do lead no atendimento
2. `fact_customer_goal` — intenção de compra e interesse MCMV confirmados
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
| 2 | `inicio_decisao` | Confirmar decisão / intenção de compra | `fact_customer_goal` | Objetivo de compra MCMV — intenção e programa absorvidos em `fact_customer_goal` |
| 3 | `inicio_nome` | Capturar nome do lead | `fact_lead_name` | Se nome ausente: obrigação T3 ativa |
| 4 | `inicio_programa` | Identificar programa de interesse (MCMV) | `fact_customer_goal` | MCMV categórico — objetivo e programa unificados em `fact_customer_goal` |
| 5 | `inicio_nacionalidade` | Capturar e confirmar nacionalidade | `fact_nationality`, `derived_rnm_required` | Insumo crítico: `derived_rnm_required` calculado a partir daqui |
| 6 | `inicio_rnm` | Capturar status do RNM para estrangeiros | `fact_rnm_status`, `derived_rnm_block` | Só ativado se `derived_rnm_required = true`; bloqueio hard possível |
| 7 | `inicio_tem_validade` | Verificar se o RNM ainda está válido | `fact_rnm_status` | Efeito operacional: `fact_rnm_status = "vencido"` se expirado → `derived_rnm_block = true`; **data exata de validade: LF-01 (lacuna de schema futura)** — não criar `fact_*` novo |

### 2.1 Nota sobre `inicio_decisao` e `inicio_programa`

O legado Enova 1 trata esses dois stages como etapas distintas de coleta. Na ENOVA 2, a intenção
de compra e o interesse no programa MCMV são aspectos complementares do mesmo fato canônico:
`fact_customer_goal` (Group I — `T2_LEAD_STATE_V1.md §4.4`). Ambos os stages alimentam esse único
fato. O LLM decide como coletar e confirmar esses dados na conversa — não há sequência obrigatória.

### 2.2 Nota sobre `inicio_tem_validade`

Este stage verifica se o RNM do lead estrangeiro ainda está dentro da validade. O efeito
operacional relevante para T5 é: se o RNM estiver vencido, `fact_rnm_status` deve ser atualizado
para `"vencido"`, o que activa `derived_rnm_block = true` e bloqueia o avanço.

A data exata de validade do RNM **não possui `fact_*` canônico em T2_DICIONARIO_FATOS**:
→ Marcada como **LF-01** (ver §4 — Lacunas de schema futuras).
→ Esta PR **não cria** `fact_rnm_expiry_date` nem qualquer `fact_*` equivalente.

---

## §3 Fatos mínimos T2 — obrigatórios na saída de F1

> Todas as chaves abaixo existem em `T2_LEAD_STATE_V1.md §4.4` (fact_*) ou `§5.3` (derived_*).
> Nenhuma chave foi inventada. Nenhuma nova `fact_*` é criada nesta PR.

| Fato / Derived | Grupo T2 | Tipo | Status mínimo na saída de F1 | Condição de aplicação |
|---|---|---|---|---|
| `fact_lead_name` | Group I — Identidade e contexto base | text | `captured` mínimo; `confirmed` ideal | Sempre |
| `fact_customer_goal` | Group I — Identidade e contexto base | enum / text | `confirmed` | Sempre — gate de saída de F1 |
| `fact_nationality` | Group II — Nacionalidade e doc. identidade | enum | `confirmed` | Sempre — gate de saída de F1 |
| `fact_rnm_status` | Group II — Nacionalidade e doc. identidade | enum | `confirmed` | **Somente se** `derived_rnm_required = true` |
| `derived_rnm_required` | derived | boolean | calculado | Calculado a partir de `fact_nationality` |
| `derived_rnm_block` | derived | boolean | `false` | Deve ser `false` na saída; se `true` → F1 não está pronta |

### 3.1 Valores canônicos de `fact_rnm_status` (T2_DICIONARIO_FATOS)

| Valor | Significado | Efeito em `derived_rnm_block` |
|---|---|---|
| `"válido"` | RNM presente e dentro da validade | `derived_rnm_block = false` |
| `"vencido"` | RNM presente mas com validade expirada | `derived_rnm_block = true` → bloqueio |
| `"sem_rnm"` | Estrangeiro sem RNM | `derived_rnm_block = true` → bloqueio |
| `"inválido"` | RNM com irregularidade (status não reconhecido) | `derived_rnm_block = true` → bloqueio |
| `"não_aplicável"` | Reservado para lead não-estrangeiro | `derived_rnm_block = false` |

### 3.2 Fatos do Grupo I adicionalmente observáveis em F1 (não obrigatórios para saída)

Os seguintes fatos de Group I podem ser capturados durante F1, mas **não são gates de saída**:

| Fato | Grupo T2 | Observação |
|---|---|---|
| `fact_channel_origin` | Group I | Canal de origem — capturado via metadado do gateway, não via conversa |
| `fact_language_mode` | Group I | Modo de linguagem detectado — capturado pelo LLM; não é pergunta obrigatória |
| `fact_current_intent` | Group X — Intenção operacional | Sinal de intenção operacional — observado pelo LLM; não é gate |

---

## §4 Lacunas de schema futuras (F1)

| Código | Dado | Stage legado afetado | Situação | Ação T5.2 |
|---|---|---|---|---|
| LF-01 | Data exata de validade do RNM | `inicio_tem_validade` | Sem `fact_*` canônico em `T2_DICIONARIO_FATOS` | O efeito relevante é capturado via `fact_rnm_status = "vencido"`; data exata requer declaração de `fact_*` em PR futura; esta PR NÃO cria `fact_rnm_expiry_date` |

---

## §5 Políticas T3 aplicáveis em F1

> Todas as políticas abaixo são instâncias das 5 classes canônicas declaradas em
> `T3_CLASSES_POLITICA.md`. Nenhuma produz `reply_text`. Nenhuma substitui a soberania do LLM.

### 5.1 Obrigações — "exigir ação mandatória"

| Código | `fact_key` exigida | Condição de disparo | Efeito no `lead_state` | Consequência se não coletado |
|---|---|---|---|---|
| OBR-F1-01 | `fact_lead_name` | `fact_lead_name` ausente ou `hypothesis` | `must_ask_now` ← `fact_lead_name`; `recommended_next_actions` ← `ACAO_COLETAR_NOME` | F1 não pode avançar sem identidade mínima |
| OBR-F1-02 | `fact_customer_goal` | `fact_customer_goal` ausente ou `hypothesis` | `must_ask_now` ← `fact_customer_goal`; `recommended_next_actions` ← `ACAO_COLETAR_OBJETIVO` | F1 não pode avançar sem objetivo de compra declarado |
| OBR-F1-03 | `fact_nationality` | `fact_nationality` ausente ou `hypothesis` | `must_ask_now` ← `fact_nationality` | Sem nacionalidade, `derived_rnm_required` não pode ser calculado |
| OBR-F1-04 | `fact_rnm_status` | `derived_rnm_required = true` E `fact_rnm_status` ausente ou `hypothesis` | `must_ask_now` ← `fact_rnm_status`; `recommended_next_actions` ← `ACAO_COLETAR_RNM` | Estrangeiro sem RNM verificado não pode avançar |

### 5.2 Confirmações — "pedir confirmação de fato existente"

| Código | `fact_key` a confirmar | Condição de disparo | `confirmation_level` | Efeito no `lead_state` |
|---|---|---|---|---|
| CONF-F1-01 | `fact_customer_goal` | `fact_customer_goal` em `captured` | `hard` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR`; gate de saída de F1 requer `confirmed` |
| CONF-F1-02 | `fact_nationality` | `fact_nationality` em `captured` | `hard` | `needs_confirmation = true`; confirmação obrigatória antes de avaliar RNM; fato em `captured` não sustenta avaliação de `derived_rnm_required` com confiança suficiente |
| CONF-F1-03 | `fact_rnm_status` | `fact_rnm_status` em `captured` com `derived_rnm_required = true` | `hard` | `needs_confirmation = true`; status RNM deve ser `confirmed` antes de liberar avanço |

### 5.3 Bloqueios — "bloquear avanço de `current_phase`"

| Código | Regra | Condição estrita | Efeito no `lead_state` | Resolução exigida |
|---|---|---|---|---|
| BLQ-F1-01 | R_ESTRANGEIRO_SEM_RNM | `fact_nationality.value != "brasileiro"` E `fact_nationality.status = "confirmed"` E `fact_rnm_status.value` ∈ {`"sem_rnm"`, `"vencido"`, `"inválido"`} E `fact_rnm_status.status = "confirmed"` | `blocked_by` ← {`reason: "R_ESTRANGEIRO_SEM_RNM"`, `resolution: "fact_rnm_status deve ser 'válido'"`}; `advance_allowed = false`; `derived_rnm_block = true`; `elegibility_status` pode evoluir para `"ineligible"` se terminal | Lead deve obter/regularizar RNM válido; até lá, `current_phase` permanece `discovery` |

> **Invariantes de bloqueio (CP-09 de T3_CLASSES_POLITICA):**
> - `fact_nationality` em `hypothesis` **nunca** sustenta BLQ-F1-01
> - `fact_nationality` em `captured` **não** sustenta BLQ-F1-01 diretamente — gera CONF-F1-02
> - `fact_rnm_status` em `inferred` **nunca** sustenta bloqueio terminal — gera CONF-F1-03

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
| VS-F1-02 | `fact_customer_goal` em `captured` com múltiplos objetivos possíveis detectados | `"info"` | Objetivo ambíguo — aprofundar antes de persistir como `confirmed`; risco de qualificação errada |
| VS-F1-03 | Lead diz "quero simular" sem mencionar compra ou programa | `"info"` | Intenção pode ser informacional — não persistir objetivo de compra sem confirmação explícita |

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
| Objetivo de compra confirmado | `fact_customer_goal` | `status = "confirmed"` E `confirmed = true` |
| Nacionalidade confirmada | `fact_nationality` | `status = "confirmed"` E `confirmed = true` |
| RNM verificado (se aplicável) | `fact_rnm_status` | SE `derived_rnm_required = true` → `status = "confirmed"` E `value = "válido"` |
| Bloqueio RNM ausente | `derived_rnm_block` | `value = false` |
| Sem bloqueio ativo | `operational.blocked_by` | vazio |
| Roteamento disponível | — | ROT-F1-01 pode ser executado |

### 8.1 F1 NÃO está pronta se

- `fact_customer_goal` em `captured` sem `confirmed`
- `fact_nationality` em `captured` sem `confirmed`
- `derived_rnm_required = true` e `fact_rnm_status` ausente, `hypothesis` ou `captured`
- `derived_rnm_block = true` (bloqueio ativo)
- `operational.blocked_by` não vazio com BLQ-F1-01

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
| CR-F1-06 | Inventar ou assumir objetivo do lead | Persistir `fact_customer_goal = "MCMV"` sem declaração ou confirmação explícita do lead | Viola VC-07 (T4_VALIDACAO_PERSISTENCIA): `confirmed = true` sem evidência de confirmação |
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
| AP-F1-06 | Persistência automática de `fact_customer_goal = confirmed` sem coleta explícita | T4_VALIDACAO_PERSISTENCIA VC-07 |
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

### Cenário SYN-F1-03 — Lead estrangeiro com RNM válido → pode avançar

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name.status = "captured"
facts.fact_customer_goal.status = "confirmed"
facts.fact_nationality.value = "estrangeiro"
facts.fact_nationality.status = "confirmed"
facts.fact_rnm_status.value = "válido"
facts.fact_rnm_status.status = "confirmed"
derived.derived_rnm_required.value = true
derived.derived_rnm_block.value = false
operational.blocked_by = []
```

**Avaliação T3 esperada:**
- Estágio 2: R_ESTRANGEIRO_SEM_RNM — condição não satisfeita (`fact_rnm_status = "válido"`); zero bloqueios
- Estágio 4: zero obrigações — todos os fatos mínimos presentes e confirmados
- Estágio 6: ROT-F1-01 elegível

**Resultado esperado:** estrangeiro com RNM válido avança normalmente para `qualification`. Sem tratamento diferenciado de fala — o LLM não menciona "você é estrangeiro" como fato mecânico.

**Critério de PASS:** `derived_rnm_block = false`; ROT-F1-01 elegível; sem bloqueio ativo.

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

### Cenário SYN-F1-05 — Lead com objetivo ambíguo → confirmação obrigatória

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name.status = "captured"
facts.fact_customer_goal.value = "interesse_geral"
facts.fact_customer_goal.status = "captured"
facts.fact_customer_goal.confirmed = false
facts.fact_nationality = ausente
```

**Avaliação T3 esperada:**
- Estágio 3: CONF-F1-01 disparada — `fact_customer_goal` em `captured` sem `confirmed`
- `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR`
- Estágio 4: OBR-F1-03 — `fact_nationality` ausente
- VS-F1-02 emitido (objetivo ambíguo)

**Resultado esperado:** LLM recebe confirmação obrigatória + veto suave de ambiguidade; conduz a conversa para esclarecer intenção com naturalidade — sem presumir que o lead quer MCMV e sem inventar programa; coleta também `fact_nationality` no mesmo turno ou em turnos adjacentes.

**Critério de PASS:** CONF-F1-01 emitida; `needs_confirmation = true`; LLM soberano; sem `fact_customer_goal = confirmed` sem declaração explícita do lead.

---

### Cenário SYN-F1-06 — Lead diz "quero simular" sem mencionar programa

**Prior state:**
```
operational.current_phase = "discovery"
facts.fact_lead_name = ausente
facts.fact_customer_goal = ausente
operational.must_ask_now = []
signals.signal_confusion_level.value = "médio"
```

**Evento do turno:** lead envia "quero simular o valor de uma casa".

**Avaliação T3 esperada:**
- Estágio 4: OBR-F1-01 (nome ausente) + OBR-F1-02 (objetivo ausente) + OBR-F1-03 (nacionalidade ausente)
- VS-F1-03 emitido (`soft_veto` — intenção pode ser informacional)
- `must_ask_now = ["fact_lead_name", "fact_customer_goal", "fact_nationality"]`

**Resultado esperado:** mecânico sinaliza que `fact_customer_goal` não pode ser persistido como `"MCMV_compra"` sem declaração explícita; LLM conduz para entender se lead quer comprar, simular, conhecer o programa ou outro objetivo — **sem persistir objetivo** baseado em "quero simular".

**Critério de PASS:** `fact_customer_goal` NÃO persistido como `confirmed` com base em "quero simular" apenas; VS-F1-03 emitido; obrigações OBR-F1-01/02/03 ativas.

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
| `fact_customer_goal` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group I` — `fact_customer_goal` listado | ✓ CONFIRMADO |
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
| Zero `fact_*` inventado | Cada chave verificada em `T2_LEAD_STATE_V1 §4.4` e `§5.3` | ✓ CONFIRMADO |
| Zero alteração em T1/T2/T3/T4 | Diff desta PR: apenas schema/implantation/T5_FATIA_TOPO_ABERTURA.md + rastreamento | ✓ CONFIRMADO |

---

## Bloco E — PR-T5.2

### Evidências de conclusão

| Item contratual | Status | Evidência / localização |
|---|---|---|
| Fatia F1 formalizada (7 stages cobertos) | **CONCLUÍDO** | §2 — tabela de stages com objetivos operacionais |
| `current_phase = discovery` declarado | **CONCLUÍDO** | Meta + §1 + §7 |
| Fatos mínimos T2 canônicos (6 chaves) | **CONCLUÍDO** | §3 — todas as chaves verificadas em T2_LEAD_STATE_V1 |
| Nenhum `fact_*` inventado | **CONCLUÍDO** | §13 validação cruzada — zero chaves fora de T2 |
| LF-01 declarada (data validade RNM) | **CONCLUÍDO** | §4 — LF-01; §2.2 nota |
| Políticas T3 aplicáveis (5 classes) | **CONCLUÍDO** | §5 — OBR/CONF/BLQ/SGM/ROT com payloads |
| Veto suave declarado | **CONCLUÍDO** | §6 — VS-F1-01..03 |
| Critérios de entrada | **CONCLUÍDO** | §7 |
| Critérios de saída / pronto para F2 | **CONCLUÍDO** | §8 — 6 critérios mensuráveis |
| Relação com pipeline T4 | **CONCLUÍDO** | §9 — TurnoEntrada, reply_text invariante, persistência |
| Classes de risco (10 classes) | **CONCLUÍDO** | §10 — CR-F1-01..CR-F1-10 |
| Anti-padrões proibidos (10) | **CONCLUÍDO** | §11 — AP-F1-01..AP-F1-10 |
| Cenários sintéticos declarativos (7) | **CONCLUÍDO** | §12 — SYN-F1-01..07 |
| Validação cruzada T2/T3/T4/T5.1 (18 itens) | **CONCLUÍDO** | §13 |
| Nenhum `reply_text` produzido pela fatia | **CONCLUÍDO** | §9.2; AP-F1-01; CA-08 |
| Nenhum script/template de fala | **CONCLUÍDO** | §10 CR-F1-07/CR-F1-08; AP-F1-02/AP-F1-03 |
| Conformidade A00-ADENDO-01/02/03 | **CONCLUÍDO** | §1 princípio canônico; §10; §11 |

### Provas (P-T5-01 a P-T5-03)

| Prova | Status | Evidência |
|---|---|---|
| P-T5-01 — Ausência de reply_text em outputs da fatia | PASS | Zero campos `reply_text`, `mensagem_usuario`, `texto_cliente` ou template em qualquer seção do documento |
| P-T5-02 — Referências cruzadas T2 | PASS | §13 confirma todas as 6 chaves fact_* / derived_* em T2_LEAD_STATE_V1 |
| P-T5-03 — Referências cruzadas T3 | PASS | §5 e §13 confirmam todas as políticas em T3_CLASSES_POLITICA e T3_ORDEM_AVALIACAO |

### Status

**CONCLUÍDA** — PR-T5.2 entregue; contrato T5 permanece `aberto`; PR-T5.3 desbloqueada.

### Próxima PR autorizada

**PR-T5.3 — Contrato da fatia qualificação inicial**
Artefato: `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL.md`
7 stages: `estado_civil`, `confirmar_casamento`, `interpretar_composicao`, `confirmar_avo_familiar`,
`dependente`, `financiamentos_conjunto`, `quem_pode_somar`
`current_phase: qualification`
