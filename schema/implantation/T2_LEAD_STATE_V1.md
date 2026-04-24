# T2_LEAD_STATE_V1 — Schema `lead_state` v1 — ENOVA 2

## Finalidade

Este documento define o **schema canônico do `lead_state`** — estrutura persistida que representa
o estado completo de um lead em qualquer momento do atendimento ENOVA 2.

O `lead_state` é a fonte de verdade operacional do mecânico e o contexto estruturado que o LLM
recebe para raciocinar a cada turno. **Ele não fala com o cliente. Ele nunca produz `reply_text`.**

**Pré-requisito obrigatório:**
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — todas as chaves de `facts`, `derived`
  e `signals` usadas aqui são nomes canônicos deste dicionário. Nenhum sinônimo ou chave
  não-canônica é válido.

**Princípio canônico:**
> O `lead_state` organiza o que se sabe sobre o lead.
> O LLM lê o estado, raciocina e decide como falar.
> O mecânico persiste o estado.
> Nenhum bloco do `lead_state` pode produzir `reply_text` diretamente.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T2, PDF6 (state canônico, fact status,
  memory policy, 4 camadas de memória)
- `schema/implantation/T2_DICIONARIO_FATOS.md` — 50 chaves canônicas (35 fact_*, 9 derived_*,
  6 signal_*)
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` — OBJ_*, PEND_*, CONF_*, RISCO_*, ACAO_*
- `schema/implantation/T1_CONTRATO_SAIDA.md` — shape do TurnoSaida (interface que alimenta o estado)
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. Visão geral do shape

```
LeadState {
  meta:               CaseMeta          — obrigatório
  operational:        OperationalState  — obrigatório
  facts:              FactBlock         — pode ser parcialmente preenchido
  derived:            DerivedBlock      — pode ser parcialmente preenchido
  pending:            Pending[]         — pode ser vazio
  conflicts:          Conflict[]        — pode ser vazio
  signals:            SignalBlock       — pode ser parcialmente preenchido
  history:            HistorySummary    — pode ser vazio no primeiro turno
  vasques_notes:      VasquesNote[]     — pode ser vazio
  normative_context:  NormativeContext  — referência compartilhada; não por lead
}
```

---

## 2. Bloco META — Metadados do case

### 2.1 Definição

Identifica unicamente o lead e o case. Campos invariantes após criação.

### 2.2 Shape

```
CaseMeta {
  lead_id:        string     — ID único do lead (imutável após criação)
  case_id:        string     — ID único do case (imutável após abertura)
  created_at:     timestamp  — data/hora de abertura do case
  last_updated:   timestamp  — data/hora da última modificação do estado
  channel_origin: enum       — espelha fact_channel_origin
                               (redundância intencional para roteamento de sistema)
}
```

### 2.3 Regras

- `lead_id` e `case_id` são imutáveis após criação — nunca sobrescrever.
- `last_updated` é atualizado a cada turno que modifica qualquer bloco do estado.
- `channel_origin` em `meta` é para uso de infraestrutura (roteamento); o dado canônico
  de negócio é `facts.fact_channel_origin`.

---

## 3. Bloco OPERATIONAL — Estado operacional canônico

### 3.1 Definição

Estado macroscópico do case no funil: em qual fase está, qual é o objetivo corrente, qual é o
nível de risco, o que está bloqueado, o que foi decidido pela policy. Derivado do state canônico
do mestre (seção T2, PDF6).

### 3.2 Shape

```
OperationalState {
  current_phase:              enum       — ver §3.3
  current_objective:          Objective  — tipo OBJ_* (T1_TAXONOMIA_OFICIAL)
  progress_score:             integer    — 0..100 (percentual de slots obrigatórios
                                           preenchidos no stage atual)
  risk_level:                 enum       — "none" | "low" | "medium" | "high" | "blocking"
  must_ask_now:               string[]   — fact_keys declarados pelo mecânico como
                                           prioridade de coleta neste turno
  blocked_by:                 Block[]    — bloqueios ativos (razão + resolução exigida)
  recommended_next_actions:   Action[]   — ações ACAO_* sugeridas pelo mecânico
  open_contradictions:        Conflict[] — conflitos não resolvidos neste case
  last_policy_decision:       string     — última decisão de policy executada
                                           (ex.: "ACAO_FORCAR_CONJUNTO em turno 3")
  handoff_readiness:          enum       — "not_ready" | "partial" | "ready"
  needs_confirmation:         boolean    — true se há fato em status `contradicted`
                                           aguardando confirmação do lead
  elegibility_status:         enum       — "unknown" | "probable" | "ineligible"
                                           | "confirmed_eligible"
}
```

### 3.3 Valores canônicos de `current_phase`

| Valor | Descrição | Stage do funil |
|-------|-----------|----------------|
| `discovery` | Topo do funil — identificação de objetivo e perfil inicial | T1 do funil |
| `qualification` | Qualificação — coleta de renda, regime, composição | T2 do funil |
| `qualification_special` | Trilha especial — P3 ou composição familiar | Desvio de T2 |
| `docs_prep` | Preparação de documentação — orientação + canal | T3 do funil |
| `docs_collection` | Coleta ativa de documentos | T3 do funil |
| `broker_handoff` | Handoff ao correspondente — pacote completo enviado | T4 do funil |
| `awaiting_broker` | Aguardando retorno do correspondente | T4 do funil |
| `visit_conversion` | Conversão para visita presencial | Desvio operacional |

### 3.4 Regras

- `current_phase` só avança via `ACAO_AVANÇAR_STAGE` ou `ACAO_ROTEAR_*` — jamais por decisão
  direta do LLM.
- `progress_score` é calculado exclusivamente pelo mecânico.
- `blocked_by` vazio = nenhum bloqueio ativo = LLM pode conduzir normalmente para o objetivo.
- `needs_confirmation = true` ativa `OBJ_CONFIRMAR` automaticamente no próximo turno.
- `elegibility_status = "ineligible"` é resultado de `ACAO_INELEGIBILIDADE` — nunca inferência
  do LLM.
- `elegibility_status = "probable"` ≠ aprovação bancária real (M-03, A00-ADENDO-02).

---

## 4. Bloco FACTS — Fatos centrais coletáveis

### 4.1 Definição

Conjunto dos 35 fatos coletáveis (`fact_*`) definidos em `T2_DICIONARIO_FATOS.md` §3 (Grupos
I a X). Cada entrada inclui o valor coletado e os metadados de confiança do fato.

Fatos centrais são a matéria-prima das regras do mecânico e do raciocínio do LLM.

### 4.2 Shape de cada entrada de fato

```
FactEntry {
  value:       any      — valor coletado (tipo varia por fact_key — ver dicionário §3)
  status:      enum     — ver §4.3
  source:      enum     — "llm_collected" | "system" | "operator_override"
  confirmed:   boolean  — true somente após confirmação explícita do lead
  turn_set:    integer  — número do turno em que o valor foi definido ou atualizado
  confidence:  enum     — "high" | "medium" | "low"
}
```

### 4.3 Status canônicos de fato

| Status | Significado | Transições permitidas |
|--------|-------------|----------------------|
| `captured` | Coletado via conversa — não ainda confirmado explicitamente | → `confirmed`, `contradicted` |
| `confirmed` | Confirmado explicitamente pelo lead | → `contradicted` (via reconciliação) |
| `inferred` | Inferido automaticamente pelo mecânico a partir de outros fatos | → `confirmed`, `contradicted` |
| `contradicted` | Conflito ativo — aguardando resolução via confirmação do lead | → `confirmed` (após resolução) |
| `obsolete` | Substituído por dado mais recente via reconciliação formal | — (estado terminal) |

**Transições proibidas:**
- `confirmed` → qualquer outro status sem reconciliação explícita registrada (RC-02, M-07).
- `obsolete` → qualquer outro status (estado terminal).

### 4.4 Índice de facts centrais por grupo

| Grupo | Chaves canônicas | Stage de exigibilidade mínimo |
|-------|-----------------|-------------------------------|
| I — Identidade e contexto base | `fact_lead_name`, `fact_preferred_name`, `fact_channel_origin`, `fact_language_mode`, `fact_customer_goal` | `discovery` |
| II — Nacionalidade e doc. identidade | `fact_nationality`, `fact_rnm_status`, `fact_document_identity_type` | `discovery` / `qualification` |
| III — Composição e processo | `fact_estado_civil`, `fact_process_mode`, `fact_composition_actor`, `fact_p3_required` | `qualification` |
| IV — Renda e formalização P1 | `fact_work_regime_p1`, `fact_monthly_income_p1`, `fact_has_multi_income_p1`, `fact_autonomo_has_ir_p1`, `fact_ctps_36m_p1` | `qualification` |
| V — Co-participante P2 | `fact_work_regime_p2`, `fact_monthly_income_p2`, `fact_autonomo_has_ir_p2`, `fact_ctps_36m_p2` | `qualification` (processo conjunto) |
| VI — Terceiro participante P3 | `fact_work_regime_p3`, `fact_monthly_income_p3` | `qualification_special` |
| VII — Restrições e reservas | `fact_credit_restriction`, `fact_restriction_regularization_status`, `fact_has_fgts`, `fact_entry_reserve_signal`, `fact_benefits_signal` | `qualification` |
| VIII — Dependentes | `fact_dependente`, `fact_dependents_count` | `qualification` |
| IX — Documentação | `fact_doc_identity_status`, `fact_doc_income_status`, `fact_doc_residence_status`, `fact_doc_ctps_status`, `fact_docs_channel_choice` | `docs_prep` / `docs_collection` |
| X — Intenção operacional | `fact_current_intent`, `fact_visit_interest` | `discovery` |

### 4.5 Regras

- Nenhum `fact_*` pode ser criado fora do dicionário canônico (`T2_DICIONARIO_FATOS.md`).
- `confirmed = true` requer evidência de coleta direta ou confirmação explícita do lead.
- Facts de P2 só são exigíveis quando `fact_process_mode != "solo"`.
- Facts de P3 só são exigíveis quando `fact_p3_required = true`.
- Facts do Grupo IX só são exigíveis a partir de `docs_prep`.
- `fact_dependents_count` só é relevante quando `fact_dependente = true`.

---

## 5. Bloco DERIVED — Fatos derivados calculados

### 5.1 Definição

Conjunto dos 9 fatos derivados (`derived_*`) calculados automaticamente pelo mecânico a partir
de fatos confirmados. Não são coletados diretamente. Não apagam os `fact_*` de origem (LS-03).

### 5.2 Shape de cada entrada derivada

```
DerivedEntry {
  value:        any      — valor calculado
  derived_from: string[] — fact_keys que serviram de base para o cálculo
  computed_at:  integer  — turno em que foi computado
  stale:        boolean  — true se algum fact_key de base mudou após a computação
}
```

### 5.3 Índice de derived_* e condições de derivação

| Chave canônica | Derivado de | Condição de ativação |
|----------------|-------------|----------------------|
| `derived_rnm_required` | `fact_nationality` | `fact_nationality != "brasileiro"` |
| `derived_eligibility_probable` | renda, restrição, docs, composição | múltiplos facts qualificados em conjunto |
| `derived_composition_needed` | `fact_monthly_income_p1`, `fact_process_mode` | renda P1 < mínimo MCMV + processo solo |
| `derived_rnm_block` | `derived_rnm_required`, `fact_rnm_status` | RNM obrigatório + status `!= "válido"` |
| `derived_needs_confirmation` | conflitos ativos no estado | qualquer `CONF_*` não resolvido |
| `derived_doc_risk` | `fact_doc_*_status` | qualquer documento em status crítico ou incompleto |
| `derived_dossier_profile` | composição + regime + docs | conjunto de facts de perfil calculados |
| `derived_subsidy_band_hint` | renda total + composição | renda consolidada calculável |
| `derived_dependents_applicable` | `fact_process_mode` + perfil | contextual por configuração do case |

### 5.4 Regras

- `derived_*` são recalculados pelo mecânico quando qualquer `fact_key` de base muda.
- `stale = true` sinaliza que o valor precisa ser recalculado antes do próximo turno.
- `derived_eligibility_probable` nunca substitui decisão bancária real (LS-06, M-03).
- `derived_subsidy_band_hint` nunca promete valor garantido (LS-06, M-03).

---

## 6. Bloco PENDING — Pendências ativas

### 6.1 Definição

Lista de slots obrigatórios não preenchidos ou fatos em conflito aguardando confirmação.
Gerada pelo mecânico ao avaliar o estado atual contra as regras do stage corrente.

### 6.2 Shape

```
Pending {
  type:         enum    — PEND_* (T1_TAXONOMIA_OFICIAL §4)
  target:       string  — fact_key ou slot alvo da pendência
  stage:        enum    — stage do funil em que a pendência bloqueia avanço
  created_turn: integer — turno em que a pendência foi detectada
}
```

### 6.3 Tipos canônicos de pendência

| Tipo | Descrição | Fact_key alvo típico |
|------|-----------|---------------------|
| `PEND_SLOT_VAZIO` | Fact obrigatório para o stage atual não coletado | qualquer fact_* do grupo do stage |
| `PEND_CONFIRMACAO` | Fact coletado em status `contradicted` — aguardando confirmação | fact em conflito ativo |
| `PEND_DOCUMENTO` | Documento necessário não enviado ou não verificado | `fact_doc_*_status` |
| `PEND_P2_SLOT` | Fact de P2 obrigatório não coletado (processo conjunto) | `fact_work_regime_p2`, `fact_monthly_income_p2` |
| `PEND_P3_SLOT` | Fact de P3 obrigatório não coletado (trilho P3) | `fact_work_regime_p3`, `fact_monthly_income_p3` |
| `PEND_RNM` | RNM de estrangeiro não validado | `fact_rnm_status` |

### 6.4 Regras

- Pendência detectada pelo mecânico → gera `OBJ_COLETAR` ou `OBJ_CONFIRMAR` no
  `operational.current_objective`.
- O LLM decide como, quando e em que ordem abordar cada pendência na conversa — não
  de forma mecânica sequencial (T1_TAXONOMIA §4.4).
- Pendência resolvida quando o fact_key alvo passa de `captured`/`contradicted` para `confirmed`.

---

## 7. Bloco CONFLICTS — Conflitos ativos

### 7.1 Definição

Lista de contradições detectadas entre fatos incompatíveis. Conflito não resolvido ativa
`needs_confirmation = true` no `OperationalState` e bloqueia avanço de stage.

### 7.2 Shape

```
Conflict {
  type:           enum     — CONF_* (T1_TAXONOMIA_OFICIAL §5)
  facts_involved: string[] — fact_keys em contradição
  detected_turn:  integer  — turno em que o conflito foi detectado
  resolution:     string   — null se não resolvido; descrição da resolução se resolvido
  resolved:       boolean  — false enquanto ativo
}
```

### 7.3 Tipos canônicos de conflito

| Tipo | Descrição | Exemplo concreto |
|------|-----------|-----------------|
| `CONF_DADO_CONTRADITO` | Lead declarou dado incompatível com fact já confirmado | Lead diz "sou autônomo" mas `fact_work_regime_p1 = CLT` confirmado |
| `CONF_COMPOSICAO` | Dados de composição familiar incompatíveis | Lead casado civil declarou processo solo |
| `CONF_PROCESSO` | Processo incompatível com dados de P2 coletados | `fact_process_mode = solo` mas `fact_monthly_income_p2` já coletado |
| `CONF_RENDA` | Dados de renda internamente contraditórios | Renda P1 oral diferente da comprovação recebida |

### 7.4 Protocolo de resolução (resumo operacional)

1. Conflito detectado → mecânico sinaliza `CONF_*` + `needs_confirmation = true`.
2. Mecânico gera `OBJ_CONFIRMAR` para o LLM.
3. LLM conduz confirmação com naturalidade — sem expor mecânica de conflito ao lead.
4. Lead confirma qual dado é correto.
5. Mecânico persiste o dado confirmado; marca o dado conflitante como `obsolete`.
6. `needs_confirmation` retorna a `false`; conflito marcado `resolved = true`.

> Detalhamento completo da tipologia e dos mecanismos de reconciliação:
> `schema/implantation/T2_RECONCILIACAO.md` (PR-T2.4).

---

## 8. Bloco SIGNALS — Sinais cognitivos operacionais

### 8.1 Definição

Conjunto dos 6 sinais cognitivos (`signal_*`) que informam o LLM sobre o estado conversacional
e operacional do turno. **Não são fatos de negócio.** Não determinam elegibilidade, bloqueio
ou avanço de stage (LS-04, M-06).

### 8.2 Shape de cada sinal

```
SignalEntry {
  value:      any     — valor do sinal (enum, string ou boolean, por sinal)
  turn_set:   integer — turno em que foi observado
  confidence: enum    — "high" | "medium" | "low"
}
```

### 8.3 Índice de signal_*

| Chave canônica | Descrição | Valores típicos |
|----------------|-----------|----------------|
| `signal_confusion_level` | Nível de confusão do lead no turno | `"baixo"`, `"médio"`, `"alto"` |
| `signal_urgency` | Urgência percebida do lead | `"baixo"`, `"médio"`, `"alto"` |
| `signal_trust` | Nível de confiança/rapport percebido | `"baixo"`, `"médio"`, `"alto"` |
| `signal_offtrack_type` | Tipo de desvio identificado | `"curiosidade"`, `"objeção"`, `"desabafo"`, `"pergunta_lateral"` |
| `signal_stalled_reason` | Motivo de travamento do atendimento | `"tempo"`, `"medo"`, `"docs"`, `"curiosidade"`, etc. |
| `signal_multi_income_p1` | Sinal de múltiplas fontes de renda P1 — antes de confirmação | `true` / `false` |

### 8.4 Regras

- Sinais são observados pelo LLM durante o turno e persistidos pelo mecânico (M-09).
- Sinais não determinam decisão de negócio (LS-04, M-06).
- `signal_multi_income_p1 = true` **não equivale** a `facts.fact_has_multi_income_p1 = true` — o
  sinal perceptivo deve ser convertido em fato via confirmação explícita do lead antes de ser
  tratado como dado de negócio.
- Sinais são sobrescritíveis sem reconciliação formal (são operacionais, não factuais).

---

## 9. Bloco HISTORY — Histórico resumido

### 9.1 Definição

Resumo comprimido dos turnos anteriores do case, estruturado em 4 camadas de memória
(mestre seção T2, PDF6). Permite ao LLM raciocinar sobre cases longos sem precisar processar
o histórico bruto completo de mensagens.

### 9.2 Quatro camadas de memória

| Camada | Nome | Conteúdo | Limite operacional |
|--------|------|----------|--------------------|
| L1 | Curto prazo | Últimos 3–5 turnos completos (entrada + saída estruturada por turno) | 5 turnos máximo no contexto ativo |
| L2 | Factual estruturada | Todos os `fact_*` confirmados do case com status e proveniência | sem limite de chaves; ativo por default |
| L3 | Snapshot executivo | Último snapshot criado: perfil + pendências + riscos + próxima ação | 1 snapshot ativo por case; atualizado por milestone |
| L4 | Histórico frio | Turnos arquivados além do curto prazo | acesso sob demanda — não carregado automaticamente |

### 9.3 Shape do snapshot executivo (L3)

```
SnapshotExecutivo {
  created_turn:          integer  — turno em que o snapshot foi gerado
  profile_summary:       string   — resumo do perfil do lead
                                    (redigido pelo LLM; persistido pelo mecânico)
  confirmed_facts:       string[] — fact_keys com status `confirmed` no momento do snapshot
  pending_summary:       string[] — pendências ativas no momento (PEND_*)
  risk_summary:          string[] — riscos ativos no momento (RISCO_*)
  blockers:              string[] — bloqueios ativos no momento
  next_mandatory_action: string   — próxima ação operacional obrigatória
  last_policy_decision:  string   — última decisão de policy no momento
  approval_prohibited:   boolean  — invariante true — o snapshot nunca promete aprovação
}
```

### 9.4 Regras

- Snapshot é criado pelo mecânico em cada milestone relevante: avanço de stage, conflito
  resolvido, handoff, encerramento de sessão.
- `profile_summary` é redigido pelo LLM no turno de criação; o mecânico persiste o texto.
- `approval_prohibited = true` é invariante em todo snapshot — nunca pode ser false (LS-07).
- L4 (histórico frio) não é carregado automaticamente no contexto do turno — somente sob
  demanda operacional explícita.

---

## 10. Bloco VASQUES_NOTES — Memória manual do operador

### 10.1 Definição

Contexto, instruções, overrides ou dados inseridos manualmente pelo operador (Vasques) para
um case específico. Auditável por design — toda inserção manual deve ser rastreável.

### 10.2 Shape

```
VasquesNote {
  note_id:     string    — ID único da nota
  content:     string    — conteúdo da nota ou instrução
  note_type:   enum      — "context" | "override" | "conduct_instruction" | "priority_flag"
  author:      string    — identidade do operador (obrigatório — M-04)
  created_at:  timestamp — data/hora de criação (obrigatório — M-04)
  reason:      string    — motivo da inserção (obrigatório — M-04)
  applies_to:  string    — fact_key ou escopo de aplicação (null = case-level)
  supersedes:  string    — note_id da nota substituída (null se original)
}
```

### 10.3 Regras (M-04, §4.4 do dicionário)

- Toda nota exige `author`, `created_at` e `reason` — nota sem esses campos é inválida e
  não deve ser processada.
- Notas do tipo `override` têm prioridade sobre `derived_*` e `signal_*`, mas **não** sobre
  `fact_*` confirmados sem reconciliação explícita (LS-11).
- Notas não podem criar regra MCMV ausente na base normativa real (M-02).
- Notas não geram `reply_text` automaticamente — o LLM lê a nota e decide como incorporar
  na condução da conversa (M-01).

---

## 11. Bloco NORMATIVE_CONTEXT — Referência normativa/comercial

### 11.1 Definição

Referência ao contexto normativo e comercial ativo — regras MCMV, faixas de renda, exigências
de documentação, restrições legais. **Não é específico por lead.** É um recurso compartilhado
por todos os cases ativos e atualizado via change review formal quando a política muda.

### 11.2 Shape (referência — não dados por lead)

```
NormativeContext {
  policy_version:   string    — versão da política MCMV ativa (ex.: "2026-04-v1")
  normative_source: string[]  — legados e documentos de origem (ex.: ["L03", "L19",
                                "INVENTARIO_REGRAS_T0"])
  commercial_rules: string    — referência ao bloco de regras comerciais ativas
  last_reviewed:    timestamp — data da última revisão formal
}
```

### 11.3 Regras

- `NormativeContext` é referenciado por case, não persistido como dados do lead (LS-12).
- Mudanças em `NormativeContext` exigem change review formal e versionamento incremental.
- O LLM usa o contexto normativo para raciocinar sobre o caso — nunca para prometer aprovação,
  taxa, parcela ou imóvel específico (M-03, A00-ADENDO-02).

---

## 12. Limites e regras invioláveis do `lead_state`

| # | Regra | Referência |
|---|-------|-----------|
| LS-01 | Nenhum bloco do `lead_state` pode produzir `reply_text` diretamente. | A00-ADENDO-01, M-01 |
| LS-02 | `fact_*` confirmados (`confirmed = true`) são imutáveis sem reconciliação explícita registrada. | RC-02, M-07 |
| LS-03 | `derived_*` não apagam `fact_*` de origem — coexistem com proveniência. | M-08 |
| LS-04 | `signal_*` não determinam decisão de negócio (elegibilidade, bloqueio, avanço de stage). | M-06 |
| LS-05 | Toda nota Vasques exige `author`, `created_at` e `reason`. | M-04 |
| LS-06 | `derived_eligibility_probable` e `derived_subsidy_band_hint` nunca substituem decisão bancária nem prometem aprovação. | M-03, A00-ADENDO-02 |
| LS-07 | `approval_prohibited = true` no snapshot executivo é invariante — nunca pode ser false. | A00-ADENDO-02 |
| LS-08 | `current_phase` só avança via `ACAO_AVANÇAR_STAGE` ou `ACAO_ROTEAR_*` — jamais por decisão direta do LLM. | T1_TAXONOMIA §7.2, M-09 |
| LS-09 | O LLM não persiste dados diretamente — o mecânico registra; o LLM coleta via conversa. | M-09 |
| LS-10 | Todas as chaves de `facts` e `derived` devem ser nomes canônicos do `T2_DICIONARIO_FATOS.md` — nenhum sinônimo ou chave não-canônica é válido. | T2_DICIONARIO_FATOS §1 |
| LS-11 | `VasquesNote` do tipo `override` tem prioridade sobre `derived_*` e `signal_*`, mas não sobre `fact_*` confirmados sem reconciliação. | §10.3 |
| LS-12 | `NormativeContext` não é persistido por lead — é referência compartilhada, nunca espelho de dados do case. | §11 |

---

## 13. Mapeamento campo ↔ fato canônico ↔ regra (evidência de cobertura)

| Campo no schema | Chave canônica (T2_DICIONARIO_FATOS) | Regra T0 de origem | Tipo na taxonomia T1 |
|----------------|--------------------------------------|--------------------|----------------------|
| `facts.fact_lead_name` | `fact_lead_name` | RU-01 (identificação) | FACT F1 |
| `facts.fact_estado_civil` | `fact_estado_civil` | RN-01, RN-05, RE-03 | FACT F1 |
| `facts.fact_nationality` | `fact_nationality` | RN-04 | FACT F1 |
| `facts.fact_rnm_status` | `fact_rnm_status` | RN-04 | FACT F1 |
| `facts.fact_process_mode` | `fact_process_mode` | RN-01, RN-05, RN-10 | FACT F3 |
| `facts.fact_composition_actor` | `fact_composition_actor` | RN-01, RN-05 | FACT F3 |
| `facts.fact_p3_required` | `fact_p3_required` | RN-09, RR-03 | FACT F3 |
| `facts.fact_work_regime_p1` | `fact_work_regime_p1` | RN-02, RN-06 | FACT F2 |
| `facts.fact_monthly_income_p1` | `fact_monthly_income_p1` | RN-03 | FACT F2 |
| `facts.fact_has_multi_income_p1` | `fact_has_multi_income_p1` | RN-03 (multi-renda confirmado) | FACT F2 |
| `facts.fact_autonomo_has_ir_p1` | `fact_autonomo_has_ir_p1` | RN-02, RN-06 | FACT F2 |
| `facts.fact_ctps_36m_p1` | `fact_ctps_36m_p1` | RN-07 | FACT F2 |
| `facts.fact_work_regime_p2` | `fact_work_regime_p2` | RN-10, RN-11 | FACT F4 |
| `facts.fact_monthly_income_p2` | `fact_monthly_income_p2` | RN-10 | FACT F4 |
| `facts.fact_credit_restriction` | `fact_credit_restriction` | RN-12 | FACT F6 |
| `facts.fact_restriction_regularization_status` | `fact_restriction_regularization_status` | RN-12 | FACT F6 |
| `facts.fact_has_fgts` | `fact_has_fgts` | RN-03 (reserva) | FACT F6 |
| `facts.fact_dependente` | `fact_dependente` | RN-08 | FACT F1 |
| `facts.fact_doc_identity_status` | `fact_doc_identity_status` | RD-01, RD-02 | FACT F7 |
| `facts.fact_doc_income_status` | `fact_doc_income_status` | RD-01, RD-02 | FACT F7 |
| `facts.fact_doc_residence_status` | `fact_doc_residence_status` | RD-01, RD-02 | FACT F7 |
| `facts.fact_doc_ctps_status` | `fact_doc_ctps_status` | RD-01, RD-02 | FACT F7 |
| `facts.fact_docs_channel_choice` | `fact_docs_channel_choice` | RD-03 | FACT F7 |
| `facts.fact_visit_interest` | `fact_visit_interest` | RO-02 | FACT F8 |
| `derived.derived_rnm_required` | `derived_rnm_required` | RN-04 | FACT derivado |
| `derived.derived_eligibility_probable` | `derived_eligibility_probable` | RN-03, RN-12 | FACT derivado |
| `derived.derived_composition_needed` | `derived_composition_needed` | RN-03, RN-01 | FACT derivado |
| `derived.derived_rnm_block` | `derived_rnm_block` | RN-04 | RISCO (RISCO_INELEGIBILIDADE_RNM) |
| `derived.derived_needs_confirmation` | `derived_needs_confirmation` | RU-03, RE-03 | CONFLITO / PENDÊNCIA |
| `derived.derived_doc_risk` | `derived_doc_risk` | RD-01, RD-02 | RISCO |
| `pending[].type = PEND_SLOT_VAZIO` | — | RC-03, RN-01..12 | PENDÊNCIA |
| `pending[].type = PEND_CONFIRMACAO` | — | RU-03, RE-03 | PENDÊNCIA |
| `pending[].type = PEND_DOCUMENTO` | — | RD-01, RD-02 | PENDÊNCIA |
| `pending[].type = PEND_P2_SLOT` | — | RN-10, RN-11 | PENDÊNCIA |
| `pending[].type = PEND_P3_SLOT` | — | RN-09 | PENDÊNCIA |
| `pending[].type = PEND_RNM` | — | RN-04 | PENDÊNCIA |
| `conflicts[].type = CONF_DADO_CONTRADITO` | — | RC-02, RE-03 | CONFLITO |
| `conflicts[].type = CONF_COMPOSICAO` | — | RN-01, RE-03 | CONFLITO |
| `conflicts[].type = CONF_PROCESSO` | — | RN-05, RE-03 | CONFLITO |
| `conflicts[].type = CONF_RENDA` | — | RU-03 | CONFLITO |
| `operational.current_objective.type = OBJ_COLETAR` | — | todos RN/RD | OBJETIVO |
| `operational.current_objective.type = OBJ_CONFIRMAR` | — | RU-03, RE-03 | OBJETIVO |
| `operational.current_objective.type = OBJ_AVANÇAR_STAGE` | — | RR-01..RR-05 | OBJETIVO |
| `operational.current_objective.type = OBJ_HANDOFF` | — | RO-01, RR-05 | OBJETIVO |
| `signals.signal_multi_income_p1` | `signal_multi_income_p1` | RN-03 (perceptivo pré-confirmação) | SINAL |
| `signals.signal_confusion_level` | `signal_confusion_level` | RU-04 (condução) | SINAL |
| `history.snapshot.approval_prohibited` | — | A00-ADENDO-02 | INVARIANTE |

---

## 14. Compatibilidade transitória com legado E1

Registra os campos E1 e os respectivos campos E2 para suporte à migração (T5). A política
completa de compatibilidade e os mapeamentos detalhados são documentados em
`schema/implantation/T2_RESUMO_PERSISTIDO.md` (PR-T2.5).

| Campo E1 | Campo E2 correspondente | Ação em T5 |
|----------|------------------------|------------|
| `conversationId` | `meta.case_id` | mapear |
| `leadId` | `meta.lead_id` | mapear |
| `marital_status` | `facts.fact_estado_civil` | renomear |
| `process_mode` | `facts.fact_process_mode` | renomear com prefixo |
| `monthly_income_p1` | `facts.fact_monthly_income_p1` | renomear com prefixo |
| `has_multi_income_p1` | `signals.signal_multi_income_p1` + `facts.fact_has_multi_income_p1` | desdobrar em sinal (perceptivo) + fato (confirmado) |
| `stalled_reason` | `signals.signal_stalled_reason` | rebaixar a signal |
| `rnm_required` | `derived.derived_rnm_required` | rebaixar a derived |
| `dependents_applicable` | `derived.derived_dependents_applicable` | rebaixar a derived |
| `subsidy_band_hint` | `derived.derived_subsidy_band_hint` | rebaixar a derived |
| stages E1 | `operational.current_phase` | mapear por equivalência de stage |

Detalhamento completo da compatibilidade transitória: `T2_RESUMO_PERSISTIDO.md` (PR-T2.5).

---

## 15. Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_LEAD_STATE_V1.md (este documento)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — schema documental completo com 11 blocos:
                                       CaseMeta, OperationalState (11 campos do mestre PDF6),
                                       FactBlock (35 fact_* por grupo I–X com status canônicos),
                                       DerivedBlock (9 derived_* com condições de derivação),
                                       Pending (6 PEND_* tipos), Conflicts (4 CONF_* tipos
                                       + protocolo de resolução), SignalBlock (6 signal_*),
                                       HistorySummary (4 camadas + shape snapshot executivo),
                                       VasquesNotes (shape auditável + 4 regras),
                                       NormativeContext (referência compartilhada);
                                       12 regras invioláveis LS-01..LS-12;
                                       tabela de mapeamento campo ↔ fato canônico ↔ regra T0;
                                       tabela de compatibilidade transitória E1→E2;
                                       todas as chaves do T2_DICIONARIO_FATOS cobertas.
Há item parcial/inconclusivo bloqueante?: não — sem sobreposição com T2.3 (política de
                                       confiança por origem, delegada a PR-T2.3), T2.4
                                       (reconciliação formal detalhada, delegada a PR-T2.4),
                                       T2.5 (resumo persistido completo, delegada a PR-T2.5);
                                       escopo delimitado a schema estrutural v1.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.2 encerrada; T2_LEAD_STATE_V1.md publicado;
                                       PR-T2.3 desbloqueada
Próxima PR autorizada:                 PR-T2.3 — Política de confiança por origem do dado
```
