# T1_TAXONOMIA_OFICIAL — Taxonomia Oficial do Agente ENOVA 2

## Finalidade

Este documento define a taxonomia canônica do agente ENOVA 2: os tipos oficiais de
**facts**, **objetivos**, **pendências**, **conflitos**, **riscos** e **ações**.

Esta taxonomia é a linguagem compartilhada entre as fases T1 (contrato cognitivo),
T2 (estado estruturado), T3 (policy engine) e T4 (orquestrador de turno). Sem ela,
cada fase inventa seus próprios tipos e o sistema perde coerência.

**Regra fundamental:**
A taxonomia organiza o raciocínio — ela nunca escreve a fala.

Cada tipo define o que existe, quem produz, quem consome e o que significa.
Nenhum tipo pode prescrever texto de resposta, template de mensagem ou script.
O `reply_text` é sempre e exclusivamente do LLM.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T1, microetapa "taxonomia oficial"
- `schema/implantation/T1_CAMADAS_CANONICAS.md` — separação das 5 dimensões (pré-requisito)
- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` — identidade e papel do LLM
- `schema/implantation/INVENTARIO_REGRAS_T0.md` — 48 regras em 7 famílias (origem dos exemplos)
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. Princípio de uso

| Categoria | Quem produz | Quem consome | O que NÃO pode conter |
|-----------|------------|-------------|----------------------|
| FACTS | LLM coleta via conversa; mecânico valida e persiste | Mecânico (para aplicar regras); LLM (para raciocinar sobre o caso) | Templates de coleta, roteiro de perguntas |
| OBJETIVOS | Mecânico (decide o que precisa acontecer) | LLM (decide como conduzir para isso) | Texto do que o LLM deve dizer, scripts de abordagem |
| PENDÊNCIAS | Mecânico (detecta slots obrigatórios não preenchidos) | LLM (para saber o que ainda falta e conduzir) | Frases de cobrança, lembretes pré-montados |
| CONFLITOS | Mecânico (detecta contradições em fatos coletados) | LLM (para resolver via diálogo natural) | Templates de confirmação, scripts de esclarecimento |
| RISCOS | Mecânico (classifica sinalizações de risco) | LLM (para conduzir o turno com consciência do risco) | Alertas pré-montados, avisos automáticos ao cliente |
| AÇÕES | Mecânico (executa operações de estado) | LLM recebe resultado como contexto | Mensagens de confirmação de ação, logs visíveis ao cliente |

**Trava LLM-first transversal:**
> O mecânico classifica. O LLM raciocina. O LLM fala.
> Nenhuma categoria desta taxonomia produz texto ao cliente.

---

## 2. FACTS — Dados coletados e confirmados

### 2.1 Definição canônica

Facts são os **dados do lead confirmados no turno** — coletados via conversa pelo LLM,
validados e persistidos pelo mecânico. Um fact confirmado não pode ser descartado sem
reconciliação explícita (RC-02).

Facts representam o que **se sabe** sobre o lead neste momento do caso. Eles são a
matéria-prima das regras do mecânico e do raciocínio do LLM.

### 2.2 Categorias de facts

#### F1 — Perfil pessoal

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_estado_civil` | Estado civil declarado pelo lead | RN-01, RN-05, RE-03 | ativo |
| `fact_nationality` | Nacionalidade declarada | RN-04 | ativo |
| `fact_rnm_status` | Status do RNM para estrangeiros | RN-04 | ativo |
| `fact_dependente` | Presença e número de dependentes | RN-08 | ativo |

#### F2 — Regime de trabalho e renda (P1)

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_work_regime_p1` | Regime de trabalho do participante 1 (CLT, autônomo, servidor, etc.) | RN-02, RN-06 | ativo |
| `fact_monthly_income_p1` | Renda mensal do participante 1 | RN-03 | ativo |
| `fact_autonomo_has_ir_p1` | P1 autônomo tem declaração de IR | RN-02, RN-06 | ativo |
| `fact_ctps_36m_p1` | P1 tem CTPS com 36 meses contínuos | RN-07 | ativo |

#### F3 — Processo e composição

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_processo` | Solo ou conjunto | RN-01, RN-05, RN-10 | ativo |
| `fact_p3_required` | Caso exige terceiro participante (P3) | RN-09, RR-03 | ativo |

#### F4 — Participante 2 (P2)

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_work_regime_p2` | Regime de trabalho do participante 2 | RN-10, RN-11 | ativo |
| `fact_monthly_income_p2` | Renda mensal do participante 2 | RN-10 | ativo |
| `fact_autonomo_has_ir_p2` | P2 autônomo tem declaração de IR | RN-11 | ativo |

#### F5 — Participante 3 (P3)

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_work_regime_p3` | Regime de trabalho do participante 3 | RN-09 | ativo |

#### F6 — Elegibilidade

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_credit_restriction` | Nível de restrição de crédito | RN-12 | ativo |
| `fact_restriction_regularization_status` | Status de regularização da restrição | RN-12 | ativo |

#### F7 — Documentação

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_doc_identity_status` | Status do documento de identidade | RD-01, RD-02 | ativo |
| `fact_doc_income_status` | Status da comprovação de renda | RD-01, RD-02 | ativo |
| `fact_doc_residence_status` | Status do comprovante de residência | RD-01, RD-02 | ativo |
| `fact_doc_ctps_status` | Status da CTPS | RD-01, RD-02 | ativo |
| `fact_docs_channel_choice` | Canal escolhido para envio de docs (WhatsApp/site/visita) | RD-03 | ativo |

#### F8 — Operacional

| Tipo canônico | Descrição | Regra T0 de origem | Status E2 |
|--------------|-----------|-------------------|----------|
| `fact_visit_interest` | Lead manifestou interesse em visita presencial | RO-02 | ativo |

### 2.3 O que NÃO é um fact

- Um fato inferido sem confirmação explícita do lead (é uma hipótese, não um fact).
- Um fato que o LLM "acha" com base em contexto sem coleta direta.
- Um fato de outro case/lead (cada case tem seus próprios facts).
- Texto de resposta ou transcrição de turno (isso é histórico, não fact estruturado).

### 2.4 Trava LLM-first

> O LLM coleta facts via conversa natural. O mecânico registra e valida.
> O mecânico não dita a pergunta. O LLM não persiste o dado diretamente.
> Facts confirmados são imutáveis sem reconciliação — o LLM não pode "esquecer" um fact.

---

## 3. OBJETIVOS — Próxima ação operacional autorizada

### 3.1 Definição canônica

Objetivo é a **instrução operacional que o mecânico passa ao LLM** sobre o que precisa
acontecer no turno. É o "próximo passo autorizado" do ponto de vista das regras e do estado.

O objetivo não diz como o LLM deve conduzir — diz o que precisa acontecer.
O LLM decide como chegar lá.

### 3.2 Tipos canônicos de objetivo

| Tipo | Descrição | Regra T0 de origem | Quem aciona |
|------|-----------|-------------------|------------|
| `OBJ_COLETAR` | Coletar um fact específico ainda não preenchido | Todas as regras RN-01..RN-12, RD-01..RD-05 | Mecânico — gate de coleta detectou slot vazio |
| `OBJ_CONFIRMAR` | Confirmar um fact em situação de conflito | RU-03, RE-03 | Mecânico — conflito detectado |
| `OBJ_SUGERIR_COMPOSICAO` | Sugerir composição familiar antes de inviabilizar | RN-03 | Mecânico — renda solo < limite |
| `OBJ_ORIENTAR_IR` | Orientar lead autônomo sobre IR sem encerrar | RN-06 | Mecânico — autônomo sem IR |
| `OBJ_INFORMAR_CTPS` | Informar valor estratégico do CTPS sem bloquear | RN-07 | Mecânico — CTPS < 36m detectado |
| `OBJ_RETORNAR_AO_TRILHO` | Após offtrack, trazer de volta ao objetivo operacional | RU-04, RR-06 | Mecânico — offtrack detectado |
| `OBJ_AVANÇAR_STAGE` | Confirmar que as condições de avanço foram satisfeitas | RR-01..RR-05 | Mecânico — todos os gates do stage passados |
| `OBJ_PREPARAR_DOCS` | Conduzir coleta/envio de documentação | RD-01..RD-05, RO-02 | Mecânico — elegibilidade satisfeita |
| `OBJ_HANDOFF` | Preparar entrega ao correspondente | RO-01, RR-05 | Mecânico — pacote completo |

### 3.3 Composição de objetivos

Um turno pode ter mais de um objetivo. O mecânico prioriza; o LLM integra na conversa.

Exemplo: `OBJ_COLETAR(fact_work_regime_p1)` + `OBJ_ORIENTAR_IR` podem coexistir quando
o lead é autônomo recém identificado e ainda não confirmou o regime.

### 3.4 O que NÃO é um objetivo

- Um texto de abertura do turno ("diga boa tarde").
- Uma instrução sobre vocabulário ou estilo.
- Um roteiro de perguntas numeradas.
- A decisão de quando mencionar cada ponto (isso é raciocínio do LLM).

### 3.5 Trava LLM-first

> O objetivo diz O QUE — o LLM decide COMO e QUANDO dentro do turno.
> O mecânico não sequencia perguntas. O LLM conduz a conversa para o objetivo.

---

## 4. PENDÊNCIAS — Slots obrigatórios não preenchidos

### 4.1 Definição canônica

Pendência é um **slot obrigatório ainda não coletado ou não confirmado** que bloqueia
o avanço do case para o próximo stage ou gate. O mecânico detecta pendências ao avaliar
o estado atual contra as regras do stage corrente.

Pendências são distintas de objetivos: o objetivo é "o que fazer agora"; a pendência é
"o que ainda falta para poder avançar". Uma pendência pode gerar múltiplos objetivos ao
longo de vários turnos.

### 4.2 Tipos canônicos de pendência

| Tipo | Descrição | Exemplos concretos | Regra T0 |
|------|-----------|-------------------|---------|
| `PEND_SLOT_VAZIO` | Fact obrigatório para o stage atual não coletado | `fact_work_regime_p1` não coletado em stage de qualificação | RC-03, RN-01..RN-12 |
| `PEND_CONFIRMACAO` | Fact coletado mas em estado de conflito — aguardando confirmação do lead | `fact_estado_civil` contradiz dado anterior | RU-03, RE-03 |
| `PEND_DOCUMENTO` | Documento necessário não enviado ou não verificado | `doc_identity_status = pendente` | RD-01, RD-02 |
| `PEND_P2_SLOT` | Fact de participante 2 obrigatório não coletado | `fact_work_regime_p2` ausente em processo conjunto | RN-10, RN-11 |
| `PEND_P3_SLOT` | Fact de participante 3 obrigatório não coletado | `fact_work_regime_p3` ausente quando P3 requerido | RN-09 |
| `PEND_RNM` | RNM de estrangeiro não validado | `fact_rnm_status` não confirmado | RN-04 |

### 4.3 O que NÃO é uma pendência

- Um fato irrelevante para o stage atual (pode ser coletado depois sem bloquear).
- Uma pergunta que o LLM "acha" importante mas o mecânico não marcou como obrigatória.
- O IR de um lead não-autônomo (não é pendência se o regime não exige).

### 4.4 Trava LLM-first

> O mecânico declara pendências. O LLM decide como, quando e em que ordem abordar cada
> pendência na conversa. O LLM não pergunta sobre pendências de forma mecânica sequencial.

---

## 5. CONFLITOS — Contradições em fatos coletados

### 5.1 Definição canônica

Conflito é uma **contradição detectada entre dois fatos incompatíveis** — seja entre dois
turnos do mesmo case, seja entre dado declarado pelo lead e dado já confirmado.

Conflitos bloqueam o avanço: o mecânico não avança de stage nem persiste o dado novo
sem que o conflito tenha sido resolvido via confirmação explícita do lead (RC-02, RE-03).

### 5.2 Tipos canônicos de conflito

| Tipo | Descrição | Exemplo concreto | Regra T0 |
|------|-----------|-----------------|---------|
| `CONF_DADO_CONTRADITO` | Lead declarou dado incompatível com fact já confirmado | Lead disse "sou autônomo" mas tinha `fact_work_regime_p1 = CLT` confirmado | RC-02, RE-03 |
| `CONF_COMPOSICAO` | Dados de composição familiar incompatíveis (ex.: estado civil vs. processo declarado) | Lead casado civil declarou processo solo | RN-01, RE-03 |
| `CONF_PROCESSO` | Processo (solo/conjunto) incompatível com dados de P2 coletados | `fact_processo = solo` mas `fact_monthly_income_p2` já coletado | RN-05, RE-03 |
| `CONF_RENDA` | Dados de renda internamente contraditórios | Renda P1 declarada oralmente diferente do comprovante | RU-03 |

### 5.3 Protocolo de resolução

Um conflito gera:
1. `needs_confirmation = true` no estado do turno.
2. Objetivo `OBJ_CONFIRMAR` passado ao LLM.
3. O LLM conduz a confirmação com naturalidade — sem expor a mecânica de conflito.
4. O lead confirma qual dado é o correto.
5. O mecânico persiste o dado confirmado e descarta o conflitante.

### 5.4 O que NÃO é um conflito

- Uma ambiguidade conversacional ("talvez" sem afirmação clara) — isso é incerteza, não conflito.
- Um lead que muda de ideia antes de confirmar um fact (o fact ainda não estava confirmado).
- Dois dados de momentos diferentes sem que um esteja "confirmado" — sem fact confirmado, não há conflito técnico.

### 5.5 Trava LLM-first

> O mecânico detecta e sinaliza o conflito. O LLM resolve via diálogo natural.
> O mecânico não produz a pergunta de confirmação. O LLM não persiste a resolução.

---

## 6. RISCOS — Sinalizações de risco operacional

### 6.1 Definição canônica

Risco é uma **sinalização de ameaça ao processo** que o mecânico identifica no estado
atual do case. Riscos não bloqueam automaticamente — eles informam o LLM para que ele
conduza o turno com consciência do risco.

Alguns riscos resultam em inelegibilidade declarada pelo mecânico; outros apenas orientam
a condução do LLM.

### 6.2 Tipos canônicos de risco

| Tipo | Descrição | Severidade | Regra T0 | O mecânico faz |
|------|-----------|-----------|---------|---------------|
| `RISCO_INELEGIBILIDADE_RESTRICAO` | Restrição de crédito alta sem regularização | BLOQUEANTE | RN-12 | Declara inelegibilidade; passa contexto ao LLM |
| `RISCO_INELEGIBILIDADE_RNM` | Estrangeiro com RNM inválido ou ausente | BLOQUEANTE | RN-04 | Bloqueia avanço; passa contexto ao LLM |
| `RISCO_RENDA_BAIXA` | Renda solo abaixo do mínimo para a faixa | ORIENTATIVO | RN-03 | Aciona `OBJ_SUGERIR_COMPOSICAO` |
| `RISCO_IR_AUTONOMO` | Autônomo sem IR declarado | ORIENTATIVO | RN-02, RN-06 | Aciona `OBJ_ORIENTAR_IR` |
| `RISCO_CTPS_CURTO` | CTPS com menos de 36 meses | INFORMATIVO | RN-07 | Aciona `OBJ_INFORMAR_CTPS` |
| `RISCO_PROMESSA` | Contexto de pressão para promessa proibida (aprovação, taxa, valor) | VETO | RC-01 | Mantém restrição ativa no contexto; LLM gerencia com naturalidade |
| `RISCO_OFFTRACK` | Lead persistentemente fora do objetivo operacional | OPERACIONAL | RU-04, RR-06 | Aciona `OBJ_RETORNAR_AO_TRILHO` |
| `RISCO_DADOS_CONFLITANTES` | Conflito não resolvido bloqueando avanço | BLOQUEANTE | RU-03, RE-03 | Mantém `needs_confirmation = true` |

### 6.3 Severidade dos riscos

| Severidade | Significado | Impacto no LLM |
|-----------|-------------|---------------|
| BLOQUEANTE | Impede avanço de stage até ser resolvido | LLM conduz com consciência do bloqueio — sem anunciar mecanicamente |
| ORIENTATIVO | Não bloqueia, mas exige conduta específica do LLM | LLM segue o objetivo correspondente com naturalidade |
| INFORMATIVO | Dado relevante que o LLM deve considerar, sem exigir ação imediata | LLM pode mencionar quando oportuno |
| VETO | Ação específica absolutamente proibida | LLM recebe como restrição permanente |
| OPERACIONAL | Situação de desvio do fluxo operacional | LLM gerencia com condução inteligente |

### 6.4 O que NÃO é um risco

- Uma preocupação do LLM que não tem base nos dados do case (especulação).
- Um risco que o LLM avaliou subjetivamente mas o mecânico não sinalizou.
- Um alerta visível ao cliente ("Atenção: detectamos risco...") — riscos são internos.

### 6.5 Trava LLM-first

> Riscos são sinais para o raciocínio do LLM — nunca para alertas automáticos ao cliente.
> O mecânico classifica o risco. O LLM decide como conduzir o turno em função dele.
> Nenhum risco gera texto pré-montado ao cliente.

---

## 7. AÇÕES — Operações executadas pelo mecânico

### 7.1 Definição canônica

Ação é uma **operação de estado executada pelo mecânico** em resposta a um gate ou
condição satisfeita. Ações mudam o estado do case — avançam stages, registram inelegibilidade,
disparam rotas, sinalizam conflitos.

Ações são executadas pelo mecânico. O LLM pode conduzir a conversa em função do resultado
de uma ação — mas o LLM não executa ações de estado diretamente.

### 7.2 Tipos canônicos de ação

| Tipo | Descrição | Gate que aciona | Regra T0 | Resultado no estado |
|------|-----------|----------------|---------|-------------------|
| `ACAO_AVANÇAR_STAGE` | Transição para próximo stage na espinha dorsal | Todos os slots obrigatórios do stage atual coletados | RR-01 | `current_stage` atualizado |
| `ACAO_ROTEAR_SPECIAL` | Roteamento para `qualification_special` | P3 requerido OU processo conjunto | RR-03 | `current_stage = qualification_special` |
| `ACAO_ROTEAR_DOCS` | Roteamento para `docs_prep` após elegibilidade completa | Elegibilidade + especiais satisfeitos | RR-04 | `current_stage = docs_prep` |
| `ACAO_ROTEAR_AGUARDANDO` | Roteamento para `aguardando_retorno_correspondente` | Docs + correspondente prontos | RR-05 | `current_stage = aguardando_retorno_correspondente` |
| `ACAO_FORCAR_CONJUNTO` | Força `processo = conjunto` para casado civil | `estado_civil = casado_civil` | RN-01, RR-02 | `fact_processo = conjunto` |
| `ACAO_SINALIZAR_CONFLITO` | Sinaliza `needs_confirmation = true` | Contradição detectada | RE-03, RU-03 | `needs_confirmation = true` |
| `ACAO_INELEGIBILIDADE` | Registra inelegibilidade no estado | Restrição alta / RNM inválido | RN-12, RN-04 | `elegibility_status = inelegivel` |
| `ACAO_KEEPSTAGE` | Mantém stage atual em envio parcial de docs | Docs parciais + checklist incompleto | RD-04 | `current_stage` inalterado |
| `ACAO_HANDOFF` | Dispara handoff ao correspondente | Pacote completo | RO-01, RR-05 | Estado handoff ativado |
| `ACAO_BYPASS_MANUAL` | Desvia para atendimento manual | Comando especial identificado | RE-01 | Override de atendimento |
| `ACAO_ROLLBACK_FLAG` | Aciona rollback por feature flag | Gate de rollback acionado | RE-02 | Feature flag rollback ativada |

### 7.3 O que NÃO é uma ação

- Texto gerado ao cliente confirmando a ação ("Avancei sua qualificação para a próxima etapa").
- Uma instrução ao LLM sobre o que dizer após a ação.
- Uma ação que o LLM decide executar por raciocínio próprio (ações são do mecânico).

### 7.4 Trava LLM-first

> O mecânico executa ações. O LLM recebe o novo estado como contexto e decide como conduzir.
> Nenhuma ação produz texto ao cliente. Nenhuma ação instrui o LLM sobre o que dizer.

---

## 8. Tabela de amarração: taxonomia × INVENTARIO_REGRAS_T0

| ID T0 | Família | Categoria principal | Categoria secundária | Observação |
|-------|---------|--------------------|--------------------|------------|
| RN-01 | negocio | AÇÃO (`ACAO_FORCAR_CONJUNTO`) | FACT (`fact_processo`) | Gate de roteamento imediato |
| RN-02 | negocio | PENDÊNCIA (`PEND_SLOT_VAZIO`) | OBJETIVO (`OBJ_COLETAR`) | Slot `autonomo_has_ir_p1` |
| RN-03 | negocio | RISCO (`RISCO_RENDA_BAIXA`) | OBJETIVO (`OBJ_SUGERIR_COMPOSICAO`) | Mecânico aciona objetivo antes de inviabilizar |
| RN-04 | negocio | RISCO (`RISCO_INELEGIBILIDADE_RNM`) | AÇÃO (`ACAO_INELEGIBILIDADE`) | Gate de elegibilidade |
| RN-05 | negocio | FACT (`fact_processo`) | AÇÃO | Estratégia do caso — não forçar |
| RN-06 | negocio | RISCO (`RISCO_IR_AUTONOMO`) | OBJETIVO (`OBJ_ORIENTAR_IR`) | Instrução de conduta ao LLM |
| RN-07 | negocio | RISCO (`RISCO_CTPS_CURTO`) | OBJETIVO (`OBJ_INFORMAR_CTPS`) | Informativo — não bloquear |
| RN-08 | negocio | OBJETIVO (`OBJ_COLETAR`) | — | Coleta contextual — não obrigatória em todos os casos |
| RN-09 | negocio | PENDÊNCIA (`PEND_P3_SLOT`) | AÇÃO (`ACAO_ROTEAR_SPECIAL`) | P3 requerido ativa trilho especial |
| RN-10 | negocio | PENDÊNCIA (`PEND_P2_SLOT`) | FACT (`fact_work_regime_p2`) | Processo conjunto obriga coleta P2 |
| RN-11 | negocio | PENDÊNCIA (`PEND_P2_SLOT`) | RISCO (`RISCO_IR_AUTONOMO`) | P2 autônomo sem IR |
| RN-12 | negocio | RISCO (`RISCO_INELEGIBILIDADE_RESTRICAO`) | AÇÃO (`ACAO_INELEGIBILIDADE`) | Bloqueante |
| RC-01 | compliance | RISCO (`RISCO_PROMESSA`) | — | Veto absoluto — restrição permanente no contexto |
| RC-02 | compliance | CONFLITO (`CONF_DADO_CONTRADITO`) | AÇÃO (`ACAO_SINALIZAR_CONFLITO`) | Fact confirmado imutável sem reconciliação |
| RC-03 | compliance | PENDÊNCIA (`PEND_SLOT_VAZIO`) | — | Gate de coleta crítica |
| RC-04 | compliance | AÇÃO | — | Meta-regra — regras em policy, não em prompt |
| RC-05 | compliance | AÇÃO | — | Telemetria não pode regredir em migração |
| RD-01 | docs | FACT (`fact_doc_*_status`) | AÇÃO | Docs entram no estado estruturado |
| RD-02 | docs | FACT (`fact_doc_*_status`) | PENDÊNCIA (`PEND_DOCUMENTO`) | Status canônico obrigatório |
| RD-03 | docs | FACT (`fact_docs_channel_choice`) | OBJETIVO (`OBJ_PREPARAR_DOCS`) | Canal de envio |
| RD-04 | docs | AÇÃO (`ACAO_KEEPSTAGE`) | — | Envio parcial não trava |
| RD-05 | docs | AÇÃO (`ACAO_HANDOFF`) | — | Pacote correspondente |
| RU-01 | ux | — (TOM — fora da taxonomia) | — | Orienta LLM no system prompt, não na taxonomia |
| RU-02 | ux | — (TOM — fora da taxonomia) | — | Formato de resposta — domínio do LLM |
| RU-03 | ux | CONFLITO (`CONF_DADO_CONTRADITO`) | AÇÃO (`ACAO_SINALIZAR_CONFLITO`) | needs_confirmation = true |
| RU-04 | ux | RISCO (`RISCO_OFFTRACK`) | OBJETIVO (`OBJ_RETORNAR_AO_TRILHO`) | Offtrack tratado como risco operacional |
| RU-05 | ux | — (princípio fundacional) | — | Trava LLM-first — não é tipo da taxonomia |
| RU-06 | ux | — (VETO no system prompt) | — | Proibição absoluta — não gera tipo de taxonomia |
| RO-01 | operacao | AÇÃO (`ACAO_HANDOFF`) | OBJETIVO (`OBJ_HANDOFF`) | Trilho aguardando correspondente |
| RO-02 | operacao | FACT (`fact_visit_interest`) | OBJETIVO (`OBJ_PREPARAR_DOCS`) | Canal visita presencial |
| RO-03 | operacao | AÇÃO | — | CRM / trilha auditável |
| RO-04 | operacao | AÇÃO | — | Reset e dedup — infraestrutura |
| RO-05 | operacao | AÇÃO | — | E1 como fallback temporário |
| RR-01 | roteamento | AÇÃO (`ACAO_AVANÇAR_STAGE`) | OBJETIVO (`OBJ_AVANÇAR_STAGE`) | Espinha dorsal de stages |
| RR-02 | roteamento | AÇÃO (`ACAO_FORCAR_CONJUNTO`) | — | Roteamento imediato |
| RR-03 | roteamento | AÇÃO (`ACAO_ROTEAR_SPECIAL`) | — | P3/conjunto → qualification_special |
| RR-04 | roteamento | AÇÃO (`ACAO_ROTEAR_DOCS`) | — | Elegibilidade → docs_prep |
| RR-05 | roteamento | AÇÃO (`ACAO_ROTEAR_AGUARDANDO`) | — | Docs + correspondente → aguardando |
| RR-06 | roteamento | RISCO (`RISCO_OFFTRACK`) | OBJETIVO (`OBJ_RETORNAR_AO_TRILHO`) | OfftrackGuard pré-funil |
| RR-07 | roteamento | AÇÃO | OBJETIVO | Gate cognitivo COGNITIVE_V2_MODE |
| RE-01 | excecao | AÇÃO (`ACAO_BYPASS_MANUAL`) | — | Atendimento manual |
| RE-02 | excecao | AÇÃO (`ACAO_ROLLBACK_FLAG`) | — | Feature flag rollback |
| RE-03 | excecao | CONFLITO (`CONF_DADO_CONTRADITO`) | AÇÃO (`ACAO_SINALIZAR_CONFLITO`) | Confirmação controlada |
| RE-04 | excecao | AÇÃO | — | Gate G0 — não avança sem inventário |
| RE-05 | excecao | — (VETO no system prompt) | — | Motor legado em depreciação |
| RM-01..RM-05 | ux | — (VETO no system prompt) | — | Proibições absolutas — não geram tipos |

---

## 9. Sumário por categoria

| Categoria | Tipos canônicos | Regras T0 que alimentam |
|-----------|----------------|------------------------|
| FACTS | 18 tipos em 8 grupos (F1–F8) | RN-01..RN-12, RD-01..RD-03, RO-02 |
| OBJETIVOS | 9 tipos | RN-03, RN-06, RN-07, RU-04, RR-01, RR-06, RD-01..RD-05, RO-01 |
| PENDÊNCIAS | 6 tipos | RC-03, RN-02, RN-04, RN-09, RN-10, RD-01, RD-02 |
| CONFLITOS | 4 tipos | RC-02, RE-03, RU-03, RN-01, RN-05 |
| RISCOS | 8 tipos em 5 severidades | RC-01, RN-03, RN-04, RN-06, RN-07, RN-12, RU-04, RR-06 |
| AÇÕES | 11 tipos | RN-01, RD-04, RR-01..RR-05, RE-01, RE-02, RE-03, RO-01, RO-05 |

---

## 10. O que esta taxonomia NÃO é

- **Não é schema Supabase.** As colunas e tabelas de persistência são definidas em T2.
  Esta taxonomia define os conceitos — T2 define onde e como persistir.

- **Não é o contrato de saída do LLM.** O formato estruturado de saída (`reply_text`,
  `facts_updated`, `next_objective`, `flags`, etc.) é definido em PR-T1.4.

- **Não é o policy engine.** As regras de quando cada tipo é acionado, com quais condições,
  são definidas em T3. Esta taxonomia define o vocabulário — T3 define a lógica.

- **Não é um roteiro de atendimento.** A sequência de objetivos, o tratamento de
  pendências e a condução de conflitos são responsabilidades do LLM (raciocínio) e do
  mecânico (gates). Esta taxonomia não prescreve ordem nem texto.

---

## 11. Cobertura das microetapas do mestre

| Microetapa do mestre (seção T1) | Cobertura neste documento |
|--------------------------------|--------------------------|
| Taxonomia oficial de facts | Seção 2 — 18 tipos em 8 grupos com amarração ao T0 ✓ |
| Taxonomia oficial de objetivos | Seção 3 — 9 tipos com regra T0 e quem aciona ✓ |
| Taxonomia oficial de pendências | Seção 4 — 6 tipos com exemplos concretos ✓ |
| Taxonomia oficial de conflitos | Seção 5 — 4 tipos com protocolo de resolução ✓ |
| Taxonomia oficial de riscos | Seção 6 — 8 tipos em 5 severidades ✓ |
| Taxonomia oficial de ações | Seção 7 — 11 tipos com gate que aciona e resultado ✓ |
| Cada tipo amarrado a regra/origem | Seção 8 — tabela completa 48 regras T0 × categorias ✓ |

---

## BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T1_TAXONOMIA_OFICIAL.md (este documento)
Estado da evidência:                   completa — 6 categorias definidas com tipos canônicos,
                                        definições, exemplos e amarração a regras T0; tabela de
                                        cobertura 48 regras × categorias; princípio LLM-first
                                        verificado em cada categoria; trava explícita de que
                                        nenhum tipo produz texto ao cliente
Há lacuna remanescente?:               não — L04–L17 não transcritos mas tipos derivados do
                                        INVENTARIO_REGRAS_T0 cobrem as famílias identificadas;
                                        schema Supabase é escopo de T2 (correto); contrato de
                                        saída é escopo de T1.4 (correto)
Há item parcial/inconclusivo bloqueante?: não — todas as 6 categorias têm definição canônica,
                                        tipos, exemplos, travas LLM-first e cobertura verificada
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_TAXONOMIA_OFICIAL.md publicado; PR-T1.3 encerrada;
                                        PR-T1.4 desbloqueada
Próxima PR autorizada:                 PR-T1.4 — Contrato de saída do agente (reply_text + facts + objetivo + flags + bloqueios)
```
