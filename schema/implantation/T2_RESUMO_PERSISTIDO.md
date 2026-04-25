# T2_RESUMO_PERSISTIDO — Resumo Persistido e Compatibilidade Transitória E1 → E2 — ENOVA 2

## Finalidade

Este documento define o **mecanismo canônico de resumo persistido** para conversas longas na ENOVA 2
e o **mapa de compatibilidade transitória** entre campos e stages do legado E1 e o `lead_state` v1 da E2.

O resumo persistido permite ao LLM raciocinar sobre cases de múltiplos turnos e sessões sem precisar
processar o histórico bruto completo de mensagens. A compatibilidade E1→E2 é uma **ponte transitória**
que vigora até a migração completa (T5) — não é arquitetura final nem licença para manter vícios do
legado.

**Princípio canônico:**
> O resumo informa o LLM. O `lead_state` é a verdade do case.
> Quando divergem, o `lead_state` — especialmente fatos com status `confirmed` — vence sempre.
> O resumo nunca produz `reply_text`, nunca promete aprovação, nunca substitui reconciliação.

**Pré-requisitos obrigatórios:**
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shape de `HistorySummary` e `VasquesNotes`.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens e limites de confiança.
- `schema/implantation/T2_RECONCILIACAO.md` (PR-T2.4) — tipologia e protocolo de reconciliação.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T2, microetapas 4 e 5:
  "Desenhar o resumo persistido para turnos longos" e "Mapear quais fatos continuam vindo do legado".
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. As quatro camadas de memória

O `lead_state.history` (bloco `HistorySummary`) organiza a memória do case em quatro camadas
distintas com funções, limites e regras de acesso específicos.

### 1.1 Tabela canônica das camadas

| ID | Nome | Conteúdo canônico | Limite operacional | Acesso |
|----|------|-------------------|--------------------|--------|
| L1 | Curto prazo | Últimos 3–5 turnos completos (entrada do cliente + saída estruturada do turno) | 5 turnos máximo no contexto ativo | Sempre presente no contexto do turno |
| L2 | Factual estruturada | Todos os `fact_*` e `derived_*` confirmados do case com status, source e turn_set | Sem limite de chaves; todos os fatos ativos | Sempre presente; é o `lead_state.facts` + `derived` |
| L3 | Snapshot executivo | Último snapshot: perfil comprimido + pendências + riscos + próxima ação obrigatória + flag de aprovação proibida | 1 snapshot ativo por case; substituído a cada milestone | Presente no contexto do turno quando existe |
| L4 | Histórico frio | Turnos arquivados além do curto prazo | Ilimitado como registro auditável; fora do contexto ativo | Acesso sob demanda operacional explícita — nunca carregado automaticamente |

### 1.2 Definição detalhada das camadas

#### L1 — Curto prazo

**O que é:** Janela deslizante dos últimos 3–5 turnos, com entrada do lead e saída estruturada
(incluindo campos emitidos pelo mecânico naquele turno: objective, facts coletados, pending
gerados, signals observados).

**Função:** Dar ao LLM contexto imediato de continuidade — o que foi dito agora, o que está
sendo coletado, o que acabou de ser confirmado.

**Regras:**
- RP-L1-01: L1 contém no máximo 5 turnos. O turno mais antigo é arquivado para L4 quando o sexto entra.
- RP-L1-02: L1 inclui texto do cliente (input) e estrutura de saída do turno (output fields), nunca `reply_text` isolado como memória ativa.
- RP-L1-03: Informação de L1 que não virou `FactEntry` confirmada não persiste além dos 5 turnos — precisa ser coletada formalmente via `OBJ_COLETAR`.
- RP-L1-04: L1 não substitui L2. Fato já confirmado em L2 não é "descartado" quando some de L1.

#### L2 — Factual estruturada

**O que é:** A visão completa e atual de todos os fatos do case — equivale ao `lead_state.facts`
(35 `fact_*`) e `lead_state.derived` (9 `derived_*`) com seus status, source e confidence.

**Função:** Verdade canônica estruturada do case. L2 **é** o `lead_state`. Não é uma cópia —
é o próprio estado.

**Regras:**
- RP-L2-01: L2 é atualizada exclusivamente pelo protocolo de reconciliação (T2_RECONCILIACAO.md) e pela política de confiança (T2_POLITICA_CONFIANCA.md). Nunca por sobrescrita direta.
- RP-L2-02: Fato com status `confirmed` em L2 é imutável sem reconciliação formal.
- RP-L2-03: L2 não é comprimida. Todos os fatos ativos estão acessíveis diretamente.
- RP-L2-04: L2 é soberana sobre qualquer texto em L3 ou L4. Se L3 menciona renda "R$ 3.000" mas `fact_monthly_income_p1.status = confirmed, value = 2800`, vale L2.

#### L3 — Snapshot executivo

**O que é:** Compressão executiva do estado do case em um momento específico (milestone). É
redigido pelo LLM no turno de criação e persistido pelo mecânico. Existe **um único snapshot
ativo** por case — o anterior vai para L4 ao ser substituído.

**Função:** Permitir ao LLM reconstituir rapidamente o contexto de um case longo sem precisar
reprocessar L1 completo nem iterar sobre todas as chaves de L2.

**Regras:**
- RP-L3-01: `approval_prohibited = true` é invariante em todo snapshot. Nunca pode ser false.
- RP-L3-02: Snapshot não redige `reply_text` — é estado, não fala.
- RP-L3-03: Snapshot nunca sobrescreve `lead_state`. É leitura auxiliar, não escrita.
- RP-L3-04: Texto do `profile_summary` é redigido pelo LLM; o mecânico persiste o texto sem alteração. O LLM não pode acessar seu próprio snapshot como "prova" de um fato — só como contexto.
- RP-L3-05: `confirmed_facts[]` lista keys — não valores. O valor real deve ser lido de L2.
- RP-L3-06: Ao substituir snapshot, o anterior migra para L4 com timestamp de arquivamento.

**Shape completo do SnapshotExecutivo:**

```
SnapshotExecutivo {
  created_turn:          integer   — turno em que o snapshot foi gerado
  created_at:            datetime  — timestamp de criação
  milestone_trigger:     string    — evento que disparou o snapshot (stage_advance/conflict_resolved/session_end/handoff)
  profile_summary:       string    — resumo comprimido do perfil do lead (redigido pelo LLM)
  confirmed_facts:       string[]  — fact_keys com status `confirmed` no momento
  captured_facts:        string[]  — fact_keys com status `captured` (ainda não confirmados)
  pending_summary:       string[]  — PEND_* ativos no momento
  risk_summary:          string[]  — RISCO_* ativos no momento
  open_conflicts:        string[]  — CONF_* não resolvidos no momento
  blockers:              string[]  — bloqueios ativos no momento (campo `blocked_by`)
  next_mandatory_action: string    — próxima ação operacional obrigatória
  last_policy_decision:  string    — última decisão de policy no momento
  current_phase:         string    — fase do case no momento do snapshot
  approval_prohibited:   boolean   — INVARIANTE true — nunca pode ser false
}
```

#### L4 — Histórico frio

**O que é:** Arquivo permanente de turnos e snapshots que saíram do contexto ativo. Registro
auditável imutável da evolução do case.

**Função:** Auditoria, investigação de conflitos, suporte a revisão manual, rastreabilidade de
origem de fatos.

**Regras:**
- RP-L4-01: L4 não é carregado automaticamente no contexto do turno. Só é acessado sob demanda operacional explícita (ex.: resolução de conflito que exige rastreabilidade histórica).
- RP-L4-02: L4 é imutável. Nada é deletado de L4 — apenas arquivado.
- RP-L4-03: Fato em L4 que contradiz fato `confirmed` em L2 não abre novo conflito automaticamente — o fato confirmado em L2 é soberano. L4 pode ser consultado para entender a evolução, não para reverter decisões já confirmadas.
- RP-L4-04: L4 preserva snapshots anteriores com `milestone_trigger` para rastreabilidade.

---

## 2. Protocolo de snapshot (quando criar e atualizar)

### 2.1 Eventos que disparam criação de snapshot

| Evento | Trigger canônico | Obrigatório? |
|--------|-----------------|:------------:|
| Avanço de stage (`ACAO_AVANÇAR_STAGE`) | `current_phase` muda | sim |
| Conflito resolvido (último `Conflict.resolved = true` em lote) | `open_contradictions = 0` após reconciliação | sim |
| Handoff para correspondente (`ACAO_ROTEAR_CORRESPONDENTE`) | `current_phase = broker_handoff` | sim |
| Encerramento de sessão sem continuidade (lead desconecta / timeout) | operacional — sinal de encerramento de sessão | sim |
| Reabertura de case após pausa longa (≥ 24h) | timestamp da última interação | sim — no turno de retorno |
| Nota manual Vasques de alta prioridade inserida | `VasquesNote.note_type = override_priority` | recomendado |
| Milestone de elegibilidade derivada alterada | `derived_eligibility_probable` muda de `null` para valor | recomendado |

### 2.2 O que entra no snapshot

| Campo | Entra? | Nota |
|-------|:------:|------|
| `profile_summary` (texto do LLM) | sim | compressão do perfil; sem promessa de aprovação |
| `confirmed_facts[]` (keys apenas) | sim | valores são lidos de L2 |
| `captured_facts[]` (keys) | sim | fatos brutos ainda não confirmados |
| `pending_summary[]` (PEND_* ativos) | sim | pendências abertas no momento |
| `risk_summary[]` (RISCO_* ativos) | sim | riscos ativos no momento |
| `open_conflicts[]` (CONF_* não resolvidos) | sim | conflitos abertos |
| `blockers[]` | sim | bloqueios ativos (`blocked_by`) |
| `next_mandatory_action` | sim | próxima ação do mecânico/LLM |
| `last_policy_decision` | sim | última decisão de policy relevante |
| `current_phase` | sim | fase no momento do snapshot |
| `approval_prohibited = true` | sim — invariante | nunca omitir |
| Texto de turnos anteriores completos | **não** | fica em L4 |
| Valores de fatos (`fact_*.value`) | **não** | lidos de L2 diretamente |
| `reply_text` de turnos anteriores | **não** | jamais memorizar fala como dado |
| Inferências ou hipóteses não confirmadas | **não** | hypothesis não persiste; inferred só em `derived_*` |
| Promessa de valor de subsídio ou aprovação | **não — proibido** | RP-L3-01 e A00-ADENDO-02 |

### 2.3 O que não entra no snapshot

Lista canônica de exclusões:

- RP-SN-01: Texto literal de resposta do LLM (`reply_text`) não é memória — é fala consumida no turno.
- RP-SN-02: Valores de fatos (`fact_*.value`) não são copiados no snapshot — o snapshot aponta para a chave; o valor é lido de L2.
- RP-SN-03: Hipóteses cognitivas (`hypothesis`) não persistem em nenhuma camada como `FactEntry`. Se o LLM cogitou algo e o lead não confirmou, não fica no snapshot.
- RP-SN-04: Inferências LLM (`llm_inferred`) não entram no snapshot como `confirmed_facts[]`.
- RP-SN-05: Dados E1 não migrados formalmente (sem equivalente E2 mapeado) não entram no snapshot como fatos ativos.
- RP-SN-06: `derived_eligibility_probable` e `derived_subsidy_band_hint` não entram como garantias — só como sinais informativos.
- RP-SN-07: Nota Vasques `note_type = operational_note` entra no snapshot somente se `applies_to` for relevante ao stage atual.

---

## 3. Regras anti-contaminação de facts

A maior ameaça ao `lead_state` canônico é que informação de resumo (comprimida, contextual)
contamine os fatos estruturados (exatos, confirmados, auditáveis).

### 3.1 Invariantes de não-contaminação

| Regra | Enunciado |
|-------|-----------|
| RC-AN-01 | Texto do `profile_summary` nunca pode ser usado como evidência para confirmar um fato. Fato só é confirmado por coleta direta do lead via `EXPLICIT_TEXT`, documento ou reconciliação. |
| RC-AN-02 | Se `profile_summary` menciona "renda de R$3.000" mas `fact_monthly_income_p1.status = captured`, o fato ainda é `captured` — o resumo não promove status. |
| RC-AN-03 | `confirmed_facts[]` no snapshot é uma lista de referência para o LLM saber o que já está resolvido. Não é prova de confirmação. A prova está em L2 (`fact_*.confirmed = true`). |
| RC-AN-04 | L4 (histórico frio) não reabre conflitos fechados. Fato `obsolete` em L4 não ressuscita como `captured` por estar no histórico. |
| RC-AN-05 | Snapshot não substitui reconciliação. Se dados conflitantes aparecerem após snapshot, o protocolo de reconciliação (T2_RECONCILIACAO.md) é obrigatório — não basta "atualizar o snapshot". |
| RC-AN-06 | VasquesNotes de tipo `contextual_note` informam o LLM; não sobrescrevem fatos `confirmed`. Para sobrescrever fato confirmado, a nota deve ser `override_priority` E passar por reconciliação formal. |
| RC-AN-07 | Aprendizado agregado (padrões recorrentes de cases) é contexto de raciocínio do LLM — nunca vira fato específico do lead nem sobrescreve `lead_state`. |

### 3.2 Hierarquia de precedência na leitura

Quando LLM recebe contexto do mecânico, a ordem de precedência para interpretação é:

```
lead_state.facts (L2 — fatos confirmados) 
  > lead_state.operational (estado estruturado atual)
  > SnapshotExecutivo L3 (compressão contextual)
  > L1 (últimos 5 turnos)
  > VasquesNotes (contexto operacional auditável)
  > L4 (histórico frio — somente se chamado explicitamente)
```

Quando há divergência entre camadas, a camada de precedência maior vence. O LLM deve tratar
divergência como sinal de desatualização do resumo — não como conflito de fato.

---

## 4. Memória Vasques — limites e auditabilidade

### 4.1 Tipos canônicos de VasquesNote

Definidos em `T2_LEAD_STATE_V1.md §10`. Reproduzidos aqui para referência de limites:

| `note_type` | O que registra | Limite operacional |
|-------------|----------------|-------------------|
| `contextual_note` | Contexto operacional informal (lead preferiu horário, canal específico, sensibilidade) | Informa LLM; não sobrescreve fatos |
| `operational_note` | Decisão operacional do Vasques (priorizar atendimento, aguardar retorno) | Não cria fato; não muda status de fato |
| `override_priority` | Vasques override explícito de prioridade de atendimento | Exige `reason` + pode disparar novo snapshot |
| `correction_note` | Correção de informação que estava incorreta no case | Exige reconciliação formal — não sobrescreve `confirmed` diretamente |

### 4.2 Regras de limite para memória Vasques

| Regra | Enunciado |
|-------|-----------|
| RV-01 | Toda VasquesNote exige: `note_id`, `content`, `note_type`, `author = "vasques"`, `created_at`, `reason`. |
| RV-02 | VasquesNote não pode ter `note_type = correction_note` sem gerar `CONF_*` correspondente e reconciliação formal. |
| RV-03 | Nota Vasques de tipo `contextual_note` ou `operational_note` não eleva status de fato. Um fato `captured` não se torna `confirmed` por nota Vasques. |
| RV-04 | Nota `override_priority` altera prioridade operacional do atendimento; não altera `lead_state.facts` diretamente. |
| RV-05 | VasquesNotes são auditáveis e imutáveis como registros. Para corrigir, uma nova nota `supersedes` a anterior — não se deleta. |
| RV-06 | LLM usa VasquesNotes como contexto operacional; não as cita ao cliente como "dados do sistema". |
| RV-07 | Memória Vasques não pode conter promessa de aprovação, valor de subsídio garantido ou estimativa de prazo de liberação. |

---

## 5. Aprendizado por atendimento — padrão sem script

### 5.1 O que é aprendizado por atendimento

Padrões recorrentes observados em múltiplos cases que podem melhorar a qualidade do atendimento
futuro: perguntas que frequentemente causam confusão, sequências de coleta que reduzem pendências,
domínios onde leads tipicamente têm resistência ou mal-entendido.

Este conhecimento **não é memória de lead específico** — é aprendizado agregado do sistema de
atendimento.

### 5.2 Como pode existir

| Forma válida | Forma proibida |
|--------------|----------------|
| Padrão de confusão frequente → LLM reforça clareza naquele domínio | Padrão → script fixo de resposta |
| Sequência de coleta eficiente → LLM prioriza aquele caminho quando pertinente | Sequência → template de pergunta obrigatória com texto fixo |
| Resistência comum em domínio → LLM aborda com mais cautela | Resistência → evitar o domínio completamente |
| Sinal de incompreensão → LLM usa metáfora ou simplificação contextual | Incompreensão → resposta padrão memorizada |
| Taxa alta de `CONF_RENDA` em autônomos → LLM coleta renda autônomo com mais verificação | Taxa de conflito → inserir campo hardcoded de "comprovação extra" |

### 5.3 Regras de aprendizado

| Regra | Enunciado |
|-------|-----------|
| RA-01 | Aprendizado agregado é contexto de raciocínio — nunca vira fato do lead nem `reply_text` prescrito. |
| RA-02 | Padrão de atendimento melhora **como** o LLM conduz a conversa; não define **o que** o LLM diz palavra por palavra. |
| RA-03 | Aprendizado não cria campos no `lead_state` além dos canônicos do `T2_DICIONARIO_FATOS.md`. |
| RA-04 | Padrão recorrente não dispensa coleta formal de fato no case atual. Cada lead confirma seus próprios dados. |
| RA-05 | Aprendizado não reduz nível de exigência de confirmação para fatos críticos (PC-01..PC-12 do T2_POLITICA_CONFIANCA.md). |

---

## 6. Compatibilidade transitória E1 → E2

### 6.1 Princípios da ponte transitória

A compatibilidade E1→E2 existe para o período entre início da execução da E2 e a conclusão
da migração funcional completa (T5). Neste período, dados originados do legado E1 entram no
sistema E2 e precisam ser mapeados ao `lead_state` canônico.

**Esta ponte é temporária. Ao concluir T5, a fonte primária passa a ser exclusivamente E2.**

Regras da ponte:

| Regra | Enunciado |
|-------|-----------|
| RB-01 | Campo E1 mapeado para campo E2 canônico entra como `status = captured, source = "system"` — nunca como `confirmed` automaticamente. Confirmação exige coleta ou reconciliação. |
| RB-02 | Campo E1 sem equivalente direto em E2 **não é persistido** como `FactEntry` com chave não-canônica. Deve ser tratado como `PEND_SLOT_VAZIO` para a informação equivalente, ou descartado se não há equivalente relevante. |
| RB-03 | Campo E1 derivável (ex.: `rnm_required` derivado de `nationality`) não é importado como fato primário — entra como `derived_rnm_required` após derivação. |
| RB-04 | Vício do legado (campo E1 que misturava semânticas, ex.: `has_multi_income_p1` com ambiguidade perceptiva/confirmada) não é importado na forma original — é separado em `signal_multi_income_p1` + `fact_has_multi_income_p1`. |
| RB-05 | Stage E1 é mapeado para o `current_phase` E2 mais próximo semanticamente. Não é calculado automaticamente — requer verificação operacional. |
| RB-06 | Dados E1 que vieram de fonte desconhecida entram como `source = "system"` com `confidence = low`. |
| RB-07 | E1 é **fonte de evidência histórica** para o case, não destino. O `lead_state` E2 é a fonte de verdade a partir do momento de migração. |

### 6.2 Tabela de mapeamento: campos E1 → `lead_state` E2

Esta tabela expande e detalha a compatibilidade declarada no `T2_DICIONARIO_FATOS.md §5` com
informações de treatment (status de entrada, vício a evitar, ação de migração).

| Campo E1 | Nome canônico E2 | Bloco E2 | Status de entrada | Ação de migração |
|----------|-----------------|----------|:-----------------:|------------------|
| `lead_name` | `fact_lead_name` | `facts` | `captured` | Renomear; confirmar na primeira interação se possível |
| `preferred_name` | `fact_preferred_name` | `facts` | `captured` | Renomear; confirmar ou manter como captured |
| `nationality` | `fact_nationality` | `facts` | `captured` | Confirmar se crítico (lead estrangeiro) |
| `rnm_required` | **eliminado** → `derived_rnm_required` | `derived` | derivado | Não importar como fact primário — derivar de `fact_nationality` |
| `rnm_status` | `fact_rnm_status` | `facts` | `captured` | Confirmar se `fact_nationality != "brasileiro"` |
| `marital_status` | `fact_estado_civil` | `facts` | `captured` | Renomear; confirmar — é fato crítico (PC §5) |
| `process_mode` | `fact_process_mode` | `facts` | `captured` | Renomear; confirmar — é fato crítico |
| `composition_actor` | `fact_composition_actor` | `facts` | `captured` | Confirmar se `fact_process_mode != solo` |
| `p3_required` | `fact_p3_required` | `facts` | `captured` | Confirmar se trilho especial ativo |
| `work_regime_p1` | `fact_work_regime_p1` | `facts` | `captured` | Confirmar — é fato crítico |
| `monthly_income_p1` | `fact_monthly_income_p1` | `facts` | `captured` | Confirmar — é fato crítico |
| `has_multi_income_p1` (booleano único E1) | `signal_multi_income_p1` + `fact_has_multi_income_p1` | `signals` + `facts` | `captured` (fact) | Separar: sinal perceptivo vs. fato confirmado — não colapsar |
| `autonomo_has_ir_p1` | `fact_autonomo_has_ir_p1` | `facts` | `captured` | Confirmar se `fact_work_regime_p1 = autonomo` |
| `ctps_36m_p1` | `fact_ctps_36m_p1` | `facts` | `captured` | Confirmar se regime CLT |
| `work_regime_p2` | `fact_work_regime_p2` | `facts` | `captured` | Confirmar se composição ativa |
| `monthly_income_p2` | `fact_monthly_income_p2` | `facts` | `captured` | Confirmar se composição ativa — é fato crítico |
| `has_restriction` | `fact_has_restriction` | `facts` | `captured` | Confirmar — é fato crítico; ACAO_INELEGIBILIDADE só após confirmed |
| `has_fgts` | `fact_has_fgts` | `facts` | `captured` | Confirmar quando relevante ao stage |
| `entry_reserve_signal` | `fact_entry_reserve_signal` | `facts` | `captured` | Informacional; confirmar se stage avançado |
| `benefits_signal` | `fact_benefits_signal` | `facts` | `captured` | Informacional |
| `dependents_count` (E1) + `fact_dependente` (T1) | `fact_dependente` + `fact_dependents_count` | `facts` | `captured` | Separar: presença booleana e número — não colapsar |
| `dependents_applicable` | **eliminado** → `derived_dependents_applicable` | `derived` | derivado | Não importar como fact primário — derivar |
| `subsidy_band_hint` | **eliminado** → `derived_subsidy_band_hint` | `derived` | derivado | Não importar como fact primário — derivar de renda + composição |
| `current_intent` | `fact_current_intent` | `facts` | `captured` | Confirmar na reabertura |
| `location_state` | `fact_location_state` | `facts` | `captured` | Confirmar — relevante para teto MCMV |
| `location_city` | `fact_location_city` | `facts` | `captured` | Confirmar — relevante para teto |
| `property_type_preference` | `fact_property_type_preference` | `facts` | `captured` | Informacional |
| `docs_submitted` (lista) | documentado em `VasquesNote.contextual_note` ou `operational.blocked_by` | operacional | — | Não persistir como fact estruturado — é estado operacional |

**Campos E1 sem equivalente E2 (descartados):**

| Campo E1 | Motivo do descarte |
|----------|-------------------|
| `rnm_required` | Redundante — derivável de `fact_nationality` |
| `dependents_applicable` | Redundante — derivável de `fact_process_mode` + perfil |
| `subsidy_band_hint` | Era inferência, não fato coletado — tratado como `derived_*` |
| `offtrackGuard` (flag E1) | Mecânico de fala — proibido por A00-ADENDO-01/02; descartado |
| `isModoFamiliar` (flag E1) | Mecânico de fala — proibido; descartado |
| `fim_inelegivel` (alias E1) | Mecânico de decisão automática — descartado; E2 usa `ACAO_INELEGIBILIDADE` após `confirmed` |
| `keepStage` (flag E1) | Mecânico de controle de stage sem critério — descartado; E2 usa `current_phase` canônico |

### 6.3 Mapeamento de stages E1 → `current_phase` E2

| Stage E1 (nomenclatura legado) | `current_phase` E2 | Observação |
|-------------------------------|-------------------|------------|
| `initial` / `topo_funil` / primeiro contato | `discovery` | Lead ainda não qualificado |
| `topo_qualificacao` / coleta de dados básicos | `qualification` | Qualificação padrão em andamento |
| `meio_a` (estado civil/composição) | `qualification` | Subetapa de qualificação |
| `meio_b` (regime/renda/CTPS) | `qualification` | Subetapa de qualificação |
| `especial_p3` / `trilho_familiar` | `qualification_special` | Trilho especial ativo |
| `docs_orientacao` / pré-documentação | `docs_prep` | Lead orientado sobre documentação |
| `docs_coleta` / envio de documentação | `docs_collection` | Documentação em andamento |
| `entrega_correspondente` / pós-docs | `broker_handoff` | Entregue ao correspondente |
| `aguardando_feedback` / espera retorno | `awaiting_broker` | Aguardando análise bancária |
| `visita_agendada` / conversão | `visit_conversion` | Conversão por visita |
| `inelegivel` / encerrado negativo | N/A — case encerrado | `ACAO_INELEGIBILIDADE` registrada; case fechado |
| `desistencia` / abandono | N/A — case encerrado | Lead desistiu; `signal_dropout_risk` já observado |

**Regra de mapeamento de stage (RB-05):**
- Mapeamento é operacional — um humano ou operação verificada de migração define o `current_phase` E2.
- Não existe mapeamento automático de stage E1 → E2 sem validação. Stage incorreto em E2 gera tomadas de decisão erradas.
- Em caso de dúvida sobre stage, o lead é iniciado em `discovery` ou `qualification` com pendências de requalificação.

### 6.4 Como preservar histórico E1 sem manter vícios

**O vício do legado** é o padrão arquitetural da E1 onde:
- A máquina de estados controlava a fala ("casca mecânica de fala" — proibida por A00-ADENDO-01/02);
- Campos redundantes e deriváveis eram persistidos como fatos primários;
- A sequência de perguntas era um script fixo;
- `reply_text` era gerado por template mecânico.

**Como migrar sem manter o vício:**

| O que preservar de E1 | Como preservar | O que descartar |
|-----------------------|----------------|-----------------|
| Dados factuais do lead (renda, estado civil, etc.) | Importar como `captured` no `lead_state` E2 com source = "system" | Template de pergunta associado ao campo |
| Histórico de interações (caso necessário para auditoria) | L4 (histórico frio) — somente para auditoria | Lógica de controle de fluxo embutida |
| Decisão de elegibilidade anterior | `VasquesNote.contextual_note` com referência ao case E1 | Decisão automática hardcoded |
| Stage aproximado do funil | `current_phase` mapeado conforme §6.3 — com validação | Stage E1 como dado primário sem verificação |
| Sinais perceptivos E1 | `signal_*` correspondente, somente se ainda observável | Flag E1 booleano sem semântica clara |

---

## 7. Casos sintéticos

### Caso SP-01 — Conversa longa com muitos turnos e fatos confirmados

**Contexto:** Lead com 20+ turnos; renda, estado civil e composição familiar confirmados em turnos
anteriores. Nova sessão inicia.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Mecânico carrega L2 (todos os fatos com status) + L3 (último snapshot) + L1 (últimos 5 turnos). L4 não é carregado. |
| 2 | LLM recebe contexto: `confirmed_facts[]` inclui `fact_monthly_income_p1`, `fact_estado_civil`, `fact_process_mode`. |
| 3 | LLM não recoleta fatos já `confirmed`. Usa L3 para reconstruir contexto rapidamente: "Você já confirmou que é CLT com renda de R$3.200 e está em composição com cônjuge." |
| 4 | Sessão continua da pendência aberta, não do início. |
| **Resultado** | Continuidade sem retrabalho; fatos confirmados preservados; L3 funcionou como contexto eficiente. |

---

### Caso SP-02 — Lead volta após dias / semanas

**Contexto:** Lead havia chegado até `qualification` e parou. Retorna 2 semanas depois.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Mecânico detecta gap temporal ≥ 24h → dispara criação de snapshot de retorno. |
| 2 | L2 preservou todos os fatos confirmados. L3 anterior contém o estado na saída. |
| 3 | LLM recebe novo snapshot com `current_phase = qualification`, `pending_summary = [PEND_CONFIRMACAO: fact_work_regime_p1]`, `open_conflicts = []`. |
| 4 | LLM reconhece que o lead está retornando e inicia a sessão com contexto comprimido: sem repetir tudo do zero. |
| 5 | Fatos `captured` (não confirmados) permanecem `captured` — o tempo não os promove a `confirmed`. |
| **Resultado** | Retorno tratado com contexto intacto; nenhum dado perdido; nenhum dado "promovido" indevidamente. |

---

### Caso SP-03 — Snapshot antigo conflita com fato atual

**Contexto:** Snapshot antigo registrou `confirmed_facts = ["fact_monthly_income_p1"]` com nota
"R$3.000". Novo dado indica R$2.600. `fact_monthly_income_p1.status = confirmed, value = 3000`.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Novo dado chega como `EXPLICIT_TEXT`. |
| 2 | Protocolo de reconciliação (T2_RECONCILIACAO.md §2) é acionado: fato existe + incompatível com `confirmed`. |
| 3 | `CONF_RENDA` gerado em `conflicts[]`. `needs_confirmation = true`. |
| 4 | LLM conduz confirmação com OBJ_CONFIRMAR. O snapshot **não é atualizado** antes da resolução. |
| 5 | Lead confirma R$2.600. Mecânico: `fact_monthly_income_p1.value = 2600, status = confirmed`; antigo `confirmed` vira `obsolete` em L4. |
| 6 | Novo snapshot gerado após resolução com valor atualizado. |
| **Anti-padrão evitado** | O snapshot antigo não foi usado como "prova" de que a renda era R$3.000. A reconciliação foi obrigatória. |

---

### Caso SP-04 — E1 possui campo sem equivalente direto em E2

**Contexto:** Campo E1 `docs_submitted` (lista de documentos enviados) não tem equivalente
em `T2_DICIONARIO_FATOS.md` como `FactEntry` canônico.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Campo E1 `docs_submitted` identificado durante migração. |
| 2 | Verificar se há equivalente em `T2_DICIONARIO_FATOS.md` — não há. |
| 3 | Dado operacional (documentos enviados) é registrado como `VasquesNote.contextual_note` ou como referência em `operational.blocked_by` se relevante ao stage. |
| 4 | Não criar chave nova no `lead_state.facts` — isso violaria LS-10 (apenas chaves canônicas do dicionário). |
| 5 | Se o dado for crítico para o stage, criar `PEND_DOCUMENTO` correspondente para cada doc pendente. |
| **Resultado** | Dado preservado em formato auditável; dicionário canônico não violado. |

---

### Caso SP-05 — E1 possui campo duplicado / derivável

**Contexto:** Campo E1 `rnm_required` (booleano) presente no case importado.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Campo E1 `rnm_required` identificado. |
| 2 | `T2_DICIONARIO_FATOS.md §2` declara: `rnm_required` foi **eliminado** — é derivável de `fact_nationality`. |
| 3 | Não importar como `fact_rnm_required` no `lead_state.facts`. |
| 4 | Verificar `fact_nationality` do case. Se `fact_nationality != "brasileiro"`, `derived_rnm_required = true` é derivado automaticamente. |
| 5 | Se `fact_nationality` não está disponível, gerar `PEND_SLOT_VAZIO` para coletar nacionalidade. |
| **Anti-padrão evitado** | Campo derivável não foi persistido como fato primário — vício do legado eliminado. |

---

### Caso SP-06 — Histórico frio consultado para auditoria

**Contexto:** Lead alega que "nunca disse ter restrição". O case em L2 tem
`fact_has_restriction.status = confirmed, value = true`. Vasques precisa verificar.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Vasques aciona consulta explícita a L4 para o case. |
| 2 | L4 contém turnos arquivados com o momento em que `fact_has_restriction` foi coletado e confirmado, incluindo `source = "audio_good"` e `turn_set = 7`. |
| 3 | Evidência de L4 mostra que a confirmação ocorreu no turno 7, via áudio de boa qualidade. |
| 4 | L2 permanece inalterada — L4 foi consultado somente para auditoria, não para alterar estado. |
| 5 | Se a evidência de L4 indicar problema na confirmação original, abre-se reconciliação formal. |
| **Resultado** | L4 cumpriu sua função de auditoria; fato `confirmed` em L2 não foi alterado por alegação sem reconciliação. |

---

### Caso SP-07 — Nota Vasques altera prioridade de atendimento

**Contexto:** Vasques insere nota de `override_priority` para case de lead urgente (prazo de
lançamento iminente do programa).

| Passo | Ação canônica |
|-------|---------------|
| 1 | Vasques cria `VasquesNote { note_type: "override_priority", content: "Lead tem prazo de 3 dias para envio de docs antes do lançamento", reason: "prazo_lancamento_caixa", created_at: "...", applies_to: "docs_collection" }`. |
| 2 | Mecânico sinaliza `override_priority` ativo para o case. |
| 3 | LLM recebe VasquesNote como contexto — trata o case com urgência na condução. |
| 4 | Nenhum fato do `lead_state` é alterado pela nota. Stage permanece `docs_collection`. |
| 5 | Novo snapshot recomendado após inserção de nota `override_priority`. |
| **Resultado** | Prioridade alterada operacionalmente; `lead_state` estruturado intacto; LLM conduz com consciência do prazo sem script. |

---

### Caso SP-08 — Aprendizado agregado detecta padrão recorrente

**Contexto:** Em 70% dos leads autônomos, a pergunta sobre IR gera confusão na primeira abordagem.
Padrão foi detectado em múltiplos cases.

| Passo | Ação canônica |
|-------|---------------|
| 1 | Padrão agregado registrado no sistema de aprendizado (fora do `lead_state` de qualquer lead específico). |
| 2 | LLM recebe esse padrão como contexto de raciocínio: "autônomos frequentemente confundem IR com IRPF retido". |
| 3 | LLM ajusta **como** aborda a pergunta de IR para este lead autônomo — mais explicativo, sem assumir o lead sabe. |
| 4 | LLM **não** assume que este lead específico tem IR declarado baseado no padrão de outros leads. |
| 5 | LLM **não** usa um script fixo — a abordagem é contextual à conversa. |
| **Anti-padrão evitado** | Padrão agregado não virou template de resposta nem premissa de dado do lead. |

---

### Caso SP-09 — Resumo tenta sugerir aprovação ou valor garantido

**Contexto:** LLM gera `profile_summary` com texto "Lead com perfil forte para aprovação
na faixa 2, renda compatível com imóvel de R$280.000."

| Passo | Ação canônica |
|-------|---------------|
| 1 | Mecânico detecta que `profile_summary` contém linguagem de aprovação provável. |
| 2 | Regra RP-L3-01: `approval_prohibited = true` é invariante. `profile_summary` com promessa de aprovação viola A00-ADENDO-02. |
| 3 | Snapshot é rejeitado. LLM reescreve `profile_summary` sem linguagem de aprovação: "Lead autônomo, renda declarada R$3.200, estado civil solteiro, composição solo, documentação iniciada." |
| 4 | `derived_eligibility_probable` e `derived_subsidy_band_hint` podem existir como derived_*, mas nunca entram no `profile_summary` como garantias. |
| **Resultado** | Invariante de não-aprovação preservada; perfil descritivo sem promessa. |

---

### Caso SP-10 — Migração E1 → E2 preserva dado sem manter vício antigo

**Contexto:** Case E1 com `has_multi_income_p1 = true` (booleano único, ambíguo — podia ser
perceptivo ou confirmado).

| Passo | Ação canônica |
|-------|---------------|
| 1 | Campo E1 `has_multi_income_p1 = true` identificado durante importação. |
| 2 | `T2_DICIONARIO_FATOS.md §2` declara: E1 tinha campo único ambíguo; E2 separa em `signal_multi_income_p1` (perceptivo) e `fact_has_multi_income_p1` (confirmado). |
| 3 | Dado E1 entra como `signal_multi_income_p1 = true` (sinal perceptivo) + `fact_has_multi_income_p1.status = captured, value = true, source = "system"`. |
| 4 | `fact_has_multi_income_p1` permanece `captured` — o valor E1 não promove automaticamente para `confirmed`. |
| 5 | Na primeira interação relevante, LLM coleta explicitamente: "Você tem mais de uma fonte de renda?" Lead confirma → `status = confirmed`. |
| **Resultado** | Dado migrado sem perda; vício do campo ambíguo eliminado; confirmação explícita obrigatória preservada. |

---

## 8. Anti-padrões proibidos

| Código | Anti-padrão | Por que é proibido |
|--------|-------------|-------------------|
| AP-RP-01 | `profile_summary` mencionando valor de subsídio ou aprovação esperada | Viola RP-L3-01 e A00-ADENDO-02; `approval_prohibited = true` é invariante. |
| AP-RP-02 | Usar texto de L3 (snapshot) como evidência para confirmar fato | Snapshot é contexto comprimido; confirmação exige coleta direta (T2_POLITICA_CONFIANCA.md). |
| AP-RP-03 | Carregar L4 automaticamente no contexto do turno | L4 só é acessado sob demanda explícita; carregamento automático viola RP-L4-01 e sobrecarrega contexto desnecessariamente. |
| AP-RP-04 | Snapshots acumulados sem substituição (múltiplos snapshots "ativos") | L3 tem exatamente 1 snapshot ativo. Snapshot anterior vai para L4. |
| AP-RP-05 | `reply_text` de turno anterior reutilizado como memória | Fala consumida no turno não é dado persistido; reutilização cria memória de fala, não de fato. |
| AP-RP-06 | Campo E1 não-canônico criado como `FactEntry` em E2 | Viola LS-10; chaves devem ser do `T2_DICIONARIO_FATOS.md`. |
| AP-RP-07 | Campo E1 derivável importado como fato primário em E2 | Viola princípio de não-duplicidade do T2_DICIONARIO_FATOS.md §2. |
| AP-RP-08 | Stage E1 mapeado automaticamente para `current_phase` E2 sem verificação | Stage incorreto gera decisões de negócio incorretas; mapeamento exige validação operacional (RB-05). |
| AP-RP-09 | VasquesNote sobrescrevendo fato `confirmed` sem reconciliação | Viola RV-02; nota de correção exige `CONF_*` e reconciliação formal. |
| AP-RP-10 | Aprendizado agregado virando texto prescrito de `reply_text` | Viola RA-01; aprendizado é contexto de raciocínio, nunca script de fala. |
| AP-RP-11 | L4 consultado para reabrir conflito já resolvido | Viola RP-L4-03; fato `confirmed` em L2 é soberano; L4 é auditoria, não reversão. |
| AP-RP-12 | Resumo substituindo `lead_state` como fonte de verdade do case | L2 (`lead_state.facts`) é a verdade; resumo é compressão auxiliar — em divergência, L2 prevalece. |

---

## 9. Regras invioláveis

| Código | Regra | Base |
|--------|-------|------|
| RP-01 | `approval_prohibited = true` é invariante em todo SnapshotExecutivo. Nunca pode ser false ou omitido. | LS-07, A00-ADENDO-02 |
| RP-02 | Resumo textual (L3, L4, `profile_summary`) nunca sobrescreve `lead_state`. Em divergência, `lead_state` L2 prevalece. | RC-AN-02, RC-AN-04 |
| RP-03 | Fato `confirmed` em L2 não pode ser revertido por informação de L3 ou L4. Reversão exige reconciliação formal via T2_RECONCILIACAO.md §2. | RC-AN-05, RP-L2-02 |
| RP-04 | `reply_text` de turno anterior não é dado persistido. Fala não é memória. | A00-ADENDO-01, RP-SN-01 |
| RP-05 | L4 não é carregado automaticamente no contexto do turno. Acesso sob demanda explícita apenas. | RP-L4-01 |
| RP-06 | Chaves no `lead_state.facts` são exclusivamente as do `T2_DICIONARIO_FATOS.md`. Nenhuma chave E1 não-canônica pode ser persistida como `FactEntry`. | LS-10, RB-02 |
| RP-07 | Campo E1 derivável não é importado como fato primário em E2. É derivado via `derived_*`. | RB-03, T2_DICIONARIO_FATOS §2 |
| RP-08 | Toda VasquesNote de correção (`correction_note`) exige reconciliação formal — nunca sobrescreve `confirmed` diretamente. | RV-02, T2_RECONCILIACAO.md |
| RP-09 | Aprendizado por atendimento melhora a condução do LLM; nunca cria script, campo ou presunção de fato do lead. | RA-01..RA-05 |
| RP-10 | Compatibilidade E1→E2 é ponte transitória (vigora até T5). A fonte de verdade a partir da migração é exclusivamente E2. | RB-07 |

---

## 10. Amarração ao lead_state v1 e demais artefatos T2

| Elemento deste documento | Campo/artefato correspondente | Regra |
|--------------------------|-------------------------------|-------|
| L1 (curto prazo) | `history.short_term_turns[]` | RP-L1-01..04 |
| L2 (factual estruturada) | `lead_state.facts` + `lead_state.derived` | RP-L2-01..04 |
| L3 (snapshot executivo) | `history.snapshot` (SnapshotExecutivo) | RP-L3-01..06, LS-07 |
| L4 (histórico frio) | `history.cold_archive[]` | RP-L4-01..04 |
| Protocolo de snapshot | `ACAO_SNAPSHOT_EXECUTIVO` (T1_TAXONOMIA_OFICIAL §7.2 AÇÕES) | §2.1 eventos |
| Regras anti-contaminação | `lead_state.facts[*].status` imutável sem reconciliação | RC-AN-01..07 |
| Memória Vasques | `lead_state.vasques_notes[]` | RV-01..07 |
| Aprendizado agregado | Contexto LLM externo; não persiste em `lead_state` | RA-01..05 |
| Compatibilidade E1→E2 | `lead_state.facts[*].source = "system"` para dados migrados | RB-01..07 |
| Tabela E1→E2 campos | `T2_DICIONARIO_FATOS.md §5` (estendida aqui com treatment) | §6.2 |
| Tabela E1→E2 stages | `lead_state.operational.current_phase` | §6.3 |

---

## 11. Cobertura das microetapas do mestre (seção T2)

| Microetapa do mestre | Cobertura neste documento |
|---------------------|--------------------------|
| Definir nomes canônicos dos fatos | Delegada ao T2_DICIONARIO_FATOS.md (PR-T2.1); referenciada em §6.2 (tabela E1→E2) |
| Separar fato bruto/confirmado/inferência/hipótese/pendência | Delegada ao T2_RECONCILIACAO.md (PR-T2.4); camadas de memória em §1 ampliam o contexto |
| Política de confiança por origem | Delegada ao T2_POLITICA_CONFIANCA.md (PR-T2.3); integrada em §3.2 (hierarquia de precedência) |
| **Resumo persistido para turnos longos** | **COBERTA — §1 (camadas), §2 (protocolo snapshot), §3 (anti-contaminação)** |
| **Mapear fatos vindos do legado** | **COBERTA — §6 (compatibilidade E1→E2 completa)** |

---

## 12. Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_RESUMO_PERSISTIDO.md
PR que fecha:                          PR-T2.5
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 4 camadas de memória definidas (L1/L2/L3/L4);
                                       protocolo de snapshot com triggers, shape completo,
                                       o que entra e o que não entra; regras anti-contaminação
                                       (RC-AN-01..07); limites de memória Vasques (RV-01..07);
                                       regras de aprendizado sem script (RA-01..05);
                                       tabela de compatibilidade E1→E2 completa (27 campos +
                                       7 descartados + tabela de stages); 10 casos sintéticos
                                       SP-01..SP-10; 12 anti-padrões AP-RP-01..AP-RP-12;
                                       10 regras invioláveis RP-01..RP-10;
                                       cobertura das 5 microetapas do mestre verificada;
                                       soberania LLM-first verificada: nenhuma camada de memória
                                       produz reply_text; resumo informa, lead_state decide.
Há item parcial bloqueante?:           não — READINESS_G2.md (smoke de todos os 6 artefatos
                                       T2 e decisão formal G2) é escopo PR-T2.R, não lacuna
                                       desta PR.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.5 encerrada; T2_RESUMO_PERSISTIDO.md publicado;
                                       PR-T2.R desbloqueada
Próxima PR autorizada:                 PR-T2.R — Readiness/Closeout G2
```
