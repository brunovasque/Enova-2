# T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR — Contrato da Fatia F2: Qualificação Inicial / Composição Familiar — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.3 |
| Branch | feat/t5-pr5-3-fatia-composicao-familiar |
| Fatia | F2 — Qualificação inicial / composição familiar |
| `current_phase` | `qualification` |
| Status | entregue |
| Pré-requisito | PR-T5.2 + PR-T5.2-fix merged; `T5_FATIA_TOPO_ABERTURA.md` (v2) vigente |
| Autoriza | PR-T5.4 — Contrato da fatia renda/regime/composição |
| Legados aplicáveis | L03 (obrigatório — mapa do funil), L07 (obrigatório — Meio A estado civil Parte 1), L08 (obrigatório — Meio A estado civil Parte 2) |
| Data | 2026-04-26 |
| Nota de artefato | O contrato T5 §6 S3 referencia `T5_FATIA_QUALIFICACAO_INICIAL.md`; por instrução Vasques (PR-T5.3 brief), o artefato usa o nome expandido `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` para refletir a cobertura integral de composição familiar. Esta é a versão canônica desta PR. |

---

## Finalidade

Este documento é o **contrato declarativo da Fatia F2** — a segunda fatia do funil core da
ENOVA 2, correspondente à qualificação inicial e definição da composição familiar do processo.

Ele formaliza, sem prescrever fala:

- O objetivo operacional da fatia e os stages legados cobertos
- As regras comerciais validadas pelo Vasques para composição familiar
- Os fatos mínimos canônicos T2 que a fatia deve coletar e confirmar
- As políticas T3 aplicáveis (sem nenhuma delas produzir `reply_text`)
- Os critérios de entrada e de saída (pronto para F3)
- A conexão com o pipeline T4 (TurnoEntrada → LLM → T4.3)
- As classes de risco e anti-padrões que o LLM deve evitar nesta fatia
- Cenários sintéticos declarativos de cobertura

**Princípio canônico:**

> O LLM sempre manda na fala.
> Esta fatia declara objetivo, fatos, políticas, regras comerciais, bloqueios e critérios.
> Esta fatia não redige `reply_text`, não cria script de qualificação,
> não cria template de pergunta sobre estado civil, não cria if/else de composição.
> Qualquer texto ao cliente vem exclusivamente do LLM via T4/T1.

**Referências de base:**

- `T2_LEAD_STATE_V1.md` §4.4 — grupos III e VIII (fact_* da fatia F2)
- `T2_LEAD_STATE_V1.md` §5.3 — derived_composition_needed, derived_dependents_applicable
- `T3_CLASSES_POLITICA.md` — 5 classes canônicas (sem reply_text)
- `T3_VETO_SUAVE_VALIDADOR.md` — veto suave; validador pós-resposta/pré-persistência
- `T4_ENTRADA_TURNO.md` — TurnoEntrada (interface de entrada do turno)
- `T4_PIPELINE_LLM.md` — contrato único LLM; reply_text imutável
- `T4_VALIDACAO_PERSISTENCIA.md` — VC-01..VC-09; PersistDecision
- `T5_MAPA_FATIAS.md` §4.2 — especificação base desta fatia
- `T5_FATIA_TOPO_ABERTURA.md` — F1 (pré-requisito concluído)
- `CONTRATO_IMPLANTACAO_MACRO_T5.md` §6 S3; §7 CA-01..CA-08; §9 B-04/B-07/B-10
- `ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- L07, L08 (Meio A — Estado Civil — não transcritos; regras de negócio declaradas via Vasques nesta PR)

---

## §1 Objetivo operacional da fatia F2

**Enunciado:** Estabelecer a estrutura familiar e o modo de processo (solo P1 / duo P1+P2 /
composto P3) para direcionar corretamente a coleta de renda em F3. F2 não avalia renda —
F2 determina *quem* participa do processo.

**O que a fatia F2 entrega ao funil:**

1. `fact_estado_civil` — estado civil confirmado (base da determinação do processo)
2. `fact_process_mode` — modo de processo calculado: `"solo"` / `"duo"` / `"p3"`
3. `fact_composition_actor` — quem compõe o processo (se não solo)
4. `fact_p3_required` — flag de necessidade de trilha P3 calculado
5. `fact_dependente` — tem dependente? (conforme regras condicionais de F2 — ver §2.2)
6. `fact_dependents_count` — quantos dependentes (se `fact_dependente = true`)

**O que a fatia F2 NÃO faz:**

- Não coleta renda, regime de trabalho ou CTPS (escopo de F3)
- Não avalia restrição de crédito (escopo de F4)
- Não coleta documentos (escopo de F5)
- Não promete aprovação, subsídio, parcela ou financiamento
- Não equipara automaticamente união estável a casamento civil
- Não bloqueia solteiro que quer compor renda (abre rota de composição)
- Não define template de pergunta sobre estado civil
- Não cria if/else de atendimento por perfil familiar

---

## §2 Stages legados cobertos (7)

| # | Stage legado | Objetivo operacional | Fatos T2 afetados | Observação |
|---|---|---|---|---|
| 1 | `estado_civil` | Coletar e confirmar estado civil do lead | `fact_estado_civil` | Group III; base do `fact_process_mode`; confirmação hard obrigatória |
| 2 | `confirmar_casamento` | Confirmar status conjugal; identificar se há casamento civil | `fact_estado_civil`, `fact_composition_actor` | Se casado no civil → financiamento **obrigatoriamente em conjunto** (dois cônjuges entram no processo); ver §5.1 Regra 1 |
| 3 | `interpretar_composicao` | Determinar modo de processo (solo / duo / P3) | `fact_process_mode`, `derived_composition_needed` | Group III; roteamento `qualification_special` se `fact_p3_required = true` |
| 4 | `confirmar_avo_familiar` | Confirmar composição com familiar ampliado; identificar risco de idade CEF | `fact_composition_actor`, `fact_p3_required` | Especialmente relevante para P3; **avô/avó acima de 67 anos → alertar risco CEF** (ver §5.1 Regra 4); estado civil do familiar: LF-02 |
| 5 | `dependente` | Verificar dependentes com regras condicionais por processo e renda | `fact_dependente`, `fact_dependents_count` | **Regras obrigatórias** (ver §2.2): conjunto → pular; solo < R$4k → perguntar; solo > R$4k → pular |
| 6 | `financiamentos_conjunto` | Verificar se o lead quer financiar **em conjunto agora** | **[LF-01]** — sem `fact_*` canônico para esta verificação | **CRÍTICO:** este stage **NUNCA** significa financiamento anterior; significa sempre financiamento **em conjunto agora** (cônjuge / parceiro / familiar); lacuna de schema: LF-01 |
| 7 | `quem_pode_somar` | Identificar candidatos à composição de renda | `fact_composition_actor`, `fact_process_mode` | Insumo para F3; LLM identifica candidatos sem prometer aprovação; ver §5.1 Regra 7 |

### 2.1 Nota sobre `confirmar_casamento` — casamento civil obrigatório em conjunto

Quando o estado civil confirmado é **casado no civil**, o processo é **obrigatoriamente em conjunto**.
Os dois cônjuges entram no processo. Isso não exige que ambos tenham renda — pode haver
financiamento em conjunto com renda de apenas um dos cônjuges. A ausência de renda de um
cônjuge **não é impedimento automático** (renda é avaliada em F3).

**União estável** ≠ casamento civil. União estável não altera estado civil no fluxo:
- Lead em união estável que quer financiar **sozinho** → pode seguir solo
- Lead em união estável que quer **somar renda** com companheiro(a) → abrir rota de composição opcional, mas não obrigatória

### 2.2 Nota sobre `dependente` — regras de aplicação condicional

A pergunta sobre dependentes é **condicionada** e segue esta lógica:

| Condição | Ação |
|---|---|
| `fact_process_mode != "solo"` (financiamento em conjunto) | **DEVE ser pulada** — não perguntar |
| `fact_process_mode = "solo"` + renda formal < R$4.000 | Perguntar sobre dependente |
| `fact_process_mode = "solo"` + renda formal > R$4.000 | Pular pergunta de dependente |

**Nota de inter-fatia:** renda formal não é coletada em F2 (é F3). Quando o processo é solo
e a renda ainda não é conhecida no momento de F2, a aplicação da condição de renda cria uma
dependência com F3. O mecânico deve registrar `PEND_SLOT_VAZIO` para `fact_dependente` quando
solo sem renda conhecida — a decisão final de perguntar ou pular é tomada após renda ser
coletada em F3. **Dependente não deve virar pergunta robótica.**

### 2.3 Nota sobre `financiamentos_conjunto` — nunca financiamento anterior

Este stage verifica se o lead **quer financiar em conjunto agora**. Pode envolver:
cônjuge, parceiro(a), namorado(a), pai, mãe, avô, avó, irmão/irmã, familiar ou outra
pessoa potencialmente aceita pelo programa/banco.

**É interpretação proibida** associar este stage a "financiamento anterior" ou "já teve financiamento".
Essa confusão de semântica é uma classe de risco desta fatia (CR-F2-03).

### 2.4 Nota sobre `confirmar_avo_familiar` — P3 com familiar casado no civil

**Regra crítica:** quando o lead quiser incluir um **familiar** na composição, a Enova deve
identificar se esse familiar é **casado no civil**. Se for, o cônjuge desse familiar
**entra junto no processo** (P3 cascading).

Exemplos:
- Lead quer incluir o pai; pai é casado no civil com a mãe → mãe entra no processo
- Lead quer incluir o pai; pai separou e casou no civil com outra pessoa → nova cônjuge entra

Esta regra opera sobre o estado civil do familiar — dado não capturado no schema T2 atual:
→ Marcado como **LF-02** e **LF-03** (ver §4).
→ Esta PR **não cria** `fact_composition_actor_marital_status` nem equivalente.

---

## §3 Fatos mínimos T2 — obrigatórios na saída de F2

> Todas as chaves abaixo existem em `T2_LEAD_STATE_V1.md §4.4` (fact_*) ou `§5.3` (derived_*).
> Nenhuma chave foi inventada. Nenhuma nova `fact_*` é criada nesta PR.

| Fato / Derived | Grupo T2 | Tipo | Status mínimo na saída de F2 | Condição de aplicação |
|---|---|---|---|---|
| `fact_estado_civil` | Group III — Composição e processo | enum | `confirmed` | Sempre — gate de saída de F2 |
| `fact_process_mode` | Group III — Composição e processo | enum | `confirmed` ou calculado | Sempre — gate de saída de F2 |
| `fact_composition_actor` | Group III — Composição e processo | enum / text | `captured` mínimo | SE `fact_process_mode != "solo"` |
| `fact_p3_required` | Group III — Composição e processo | boolean | calculado | Calculado a partir de `fact_process_mode` + `fact_composition_actor` |
| `fact_dependente` | Group VIII — Dependentes | boolean | `captured` ou `skipped` | SE `fact_process_mode = "solo"` E condição de renda aplicável (§2.2) |
| `fact_dependents_count` | Group VIII — Dependentes | integer | `captured` | SE `fact_dependente = true` |
| `derived_composition_needed` | derived | boolean | calculado | Calculado de `fact_monthly_income_p1` + `fact_process_mode` — pode ser `stale` em F2 (renda só vem em F3) |
| `derived_dependents_applicable` | derived | boolean | calculado | Calculado de `fact_process_mode` + perfil |

### 3.1 Valores canônicos de `fact_estado_civil` (T2_DICIONARIO_FATOS)

| Valor | Impacto em F2 |
|---|---|
| `"solteiro"` | Solo por padrão; pode abrir composição voluntária |
| `"casado"` | **Casamento civil → obrigatoriamente em conjunto** (ver §2.1) |
| `"divorciado"` | Solo por padrão; verificação de averbação em F4 (LF-F4: fora do escopo de F2) |
| `"viúvo"` | Solo por padrão; verificação de inventário em F4 (fora do escopo de F2) |
| `"união_estável"` | **Não equipara automaticamente a casamento**; pode ser solo ou com composição voluntária (ver §2.1) |

### 3.2 Valores canônicos de `fact_process_mode` (T2_DICIONARIO_FATOS)

| Valor | Significado | Gatilho |
|---|---|---|
| `"solo"` | Apenas P1 no processo | Solteiro / divorciado / viúvo / união_estável que quer financiar sozinho |
| `"duo"` | P1 + P2 no processo | Casado no civil (obrigatório) ou lead que quer somar renda com parceiro |
| `"p3"` | P1 + P2 (ou ausente) + P3 no processo | `fact_p3_required = true`; composição ampliada com familiar ou terceiro |

---

## §4 Lacunas de schema futuras (F2)

> As lacunas abaixo não possuem `fact_*` canônico em `T2_DICIONARIO_FATOS`.
> As regras comerciais relevantes são documentadas nesta PR mas **não podem ser implementadas
> com plena fidelidade** até que as lacunas sejam resolvidas em PR futura de T2.
> **Nenhuma `fact_*` nova é criada nesta PR.**

| Código | Dado | Stage legado afetado | Situação | Regra comercial declarada | Ação T5.3 |
|---|---|---|---|---|---|
| LF-01 | Financiamento em conjunto atual / estrutura de cofinanciamento | `financiamentos_conjunto` | Sem `fact_*` canônico para capturar a verificação de financiamento em conjunto no schema T2 atual | O stage verifica se o lead quer financiar EM CONJUNTO AGORA — nunca significa financiamento anterior; informa `fact_process_mode` e `fact_composition_actor` | Regra comercial documentada; `fact_process_mode` captura o efeito relevante; declaração explícita de LF-01 em §2.3; PR futura declarará `fact_joint_financing_intent` ou equivalente |
| LF-02 | Estado civil do familiar que compõe (P3) | `confirmar_avo_familiar` | `fact_composition_actor` captura quem compõe mas não captura o estado civil desse familiar | Se familiar for casado no civil, cônjuge desse familiar entra no processo (P3 cascading); sem `fact_*` para estado civil de P3 | Regra documentada em §2.4 e §5.1 Regra 8; LLM deve obter essa informação conversacionalmente; PR futura adicionará `fact_composition_actor_marital_status` ou equivalente |
| LF-03 | Cônjuge do familiar que compõe (P3) | `confirmar_avo_familiar` | Se familiar é casado, o cônjuge entra no processo — mas não há `fact_*` para identificar o cônjuge de P3 | Cônjuge de P3 (ex: esposa do pai) entra como membro adicional do processo; impacto em renda e documentação | Regra documentada em §2.4; PR futura adicionará `fact_composition_p3_spouse` ou equivalente |
| LF-04 | Idade do familiar/avô/avó na composição | `confirmar_avo_familiar` | Sem `fact_*` canônico para capturar a idade de P3 ou familiar | Acima de 67 anos normalmente há limitação na CEF para liberar financiamento; não bloquear de forma seca — orientar risco e alternativas | Regra documentada em §5.1 Regra 4 e SGM-F2-03; LLM deve identificar e alertar; PR futura adicionará `fact_composition_actor_age` ou equivalente |
| LF-05 | Base normativa MCMV/CEF | Transversal | Não existe base normativa completa do programa MCMV/CEF no repo atual | Regras do programa (grau de parentesco aceito, limite de idade, condições de aceitação) não têm arquivo de referência no repo | Registrar como lacuna futura crítica; uma PR futura deverá organizar essa base; Enova consultará essa base quando houver dúvida de resposta comercial/regulatória; **esta PR não implementa a base normativa** |

---

## §5 Regras comerciais validadas (Vasques) — aplicáveis à fatia F2

> Esta seção documenta as **9 regras comerciais validadas pelo Vasques** para esta fatia.
> São regras de negócio, não de implementação. Nenhuma gera `reply_text`.
> O LLM lê essas regras como contexto operacional e decide como conduzir a conversa.

### Regra 1 — Estado civil x composição de renda

Estado civil não é automaticamente igual a composição de renda, **exceto quando houver casamento civil**.

| Situação | Regra |
|---|---|
| Casado no civil | Financiamento **obrigatoriamente em conjunto**; dois cônjuges entram no processo; não requer que ambos tenham renda; ausência de renda de um cônjuge não é impedimento automático |
| Demais estados civis | Composição é opcional; o lead decide se financia solo ou com composição |

### Regra 2 — União estável

União estável **não altera estado civil no fluxo** e **não obriga** financiamento em conjunto.

| Situação | Regra |
|---|---|
| União estável + quer financiar sozinho | Pode seguir solo |
| União estável + quer somar renda com companheiro(a) | Tratar como composição conjugal possível (opcional) |
| União estável | **Não equiparar automaticamente** a casamento civil obrigatório; **não obrigar** companheiro(a) a entrar se o cliente quer seguir sozinho |

### Regra 3 — Solteiro com composição

Solteiro continua solteiro. Composição é voluntária e operacional.

| Situação | Regra |
|---|---|
| Solteiro quer financiar sozinho | Solo — sem composição |
| Solteiro quer somar renda | Abrir rota de composição; **não reclassificar** como "casal" |
| Solteiro com composição | Composição pode ser com namorado(a), familiar ou outra pessoa aceita pelo programa/banco |

### Regra 4 — Avô/avó ou familiar idoso na composição

Quando o lead citar avô/avó para compor renda, a Enova deve **identificar risco de idade**.

| Situação | Regra |
|---|---|
| Avô/avó com **mais de 67 anos** | Normalmente há problema/limitação na CEF para liberar financiamento; **não bloquear de forma seca** — **orientar sobre o risco** |
| Alternativa | Sugerir outra pessoa possível para somar renda, se existir; sempre tentar construir alternativa viável |
| Regra normativa | Limite exato depende da normativa CEF (LF-05 — base normativa não disponível no repo) |

### Regra 5 — Dependente

| Condição | Ação |
|---|---|
| Financiamento em conjunto | **DEVE ser pulada** — não perguntar sobre dependente |
| Solo + renda formal < R$4.000 | Perguntar se tem dependente |
| Solo + renda formal > R$4.000 | Pular pergunta de dependente |
| Solo + renda desconhecida (em F2) | Registrar pendência inter-fatia; decidir após F3 |
| Dependente não deve virar pergunta robótica | LLM decide quando e como abordar se aplicável |

**Observação normativa:** "Morar no mesmo endereço" pode existir como referência de regra/programa
para definição formal de dependente, mas **não deve virar bloqueio duro nesta fatia**. Há formas
de beneficiar o cliente. Esta fatia trata dependente como fato informacional, não como gate de elegibilidade.

### Regra 6 — financiamentos_conjunto (NUNCA financiamento anterior)

`financiamentos_conjunto` **NUNCA significa financiamento anterior**.

Este stage significa sempre: **financiamento em conjunto agora**. Pode envolver:
cônjuge, parceiro(a), namorado(a), pai, mãe, avô, avó, irmão/irmã, familiar ou outra pessoa
potencialmente aceita pela regra do programa/banco.

**É proibido** associar este stage a "já teve financiamento anterior" ou perguntar sobre histórico de financiamento.

### Regra 7 — Quem pode somar renda

A Enova pode **identificar candidatos** à composição, mas **não pode prometer aprovação automática**.

Podem ser considerados: cônjuge, companheiro(a), namorado(a), pai, mãe, avô, avó, irmão/irmã,
outro familiar possível, outra pessoa se a regra permitir.

**Comportamento obrigatório:** não apenas bloquear; sempre orientar buscando alternativa viável;
explicar a regra do programa quando necessário, sem inventar e sem prometer aprovação.

### Regra 8 — P3: familiar casado no civil (cuidado)

Quando o lead quiser colocar um **familiar** na composição:
1. A Enova deve identificar se esse familiar é **casado no civil**
2. Se for casado no civil, o **cônjuge desse familiar entra junto** no processo
3. Orientar o cliente sobre o impacto; ajudar a escolher alternativa mais viável
4. Não tratar como impedimento automático — tratar como fator a considerar

**Lacuna:** estado civil do familiar não tem `fact_*` canônico → LF-02 e LF-03.

### Regra 9 — Base normativa MCMV/CEF (lacuna declarada)

Atualmente **não existe** no repo uma base normativa completa do MCMV/CEF para a Enova consultar.

| Implicação | Ação |
|---|---|
| Regras do programa | Não afirmar que a normativa já existe no repo |
| Respostas regulatórias | Quando houver dúvida sobre regra específica do programa, indicar limitação |
| PR futura | Uma PR futura deverá organizar a base normativa; Enova consultará essa base para respostas comerciais/regulatórias |
| Esta PR | Não implementa base normativa; lacuna registrada como LF-05 |

---

## §6 Políticas T3 aplicáveis em F2

> Todas as políticas abaixo são instâncias das 5 classes canônicas declaradas em
> `T3_CLASSES_POLITICA.md`. Nenhuma produz `reply_text`. Nenhuma substitui a soberania do LLM.

### 6.1 Obrigações — "exigir ação mandatória"

| Código | `fact_key` exigida | Condição de disparo | Efeito no `lead_state` | Consequência se não coletado |
|---|---|---|---|---|
| OBR-F2-01 | `fact_estado_civil` | `fact_estado_civil` totalmente ausente | `must_ask_now` ← `fact_estado_civil`; `recommended_next_actions` ← `ACAO_COLETAR_ESTADO_CIVIL` | F2 não pode avançar sem estado civil — base do `fact_process_mode` |
| OBR-F2-02 | `fact_composition_actor` | `fact_process_mode != "solo"` E `fact_composition_actor` ausente | `must_ask_now` ← `fact_composition_actor`; `recommended_next_actions` ← `ACAO_COLETAR_COMPOSICAO` | Sem identificar quem compõe, F3 não pode ser iniciada corretamente |
| OBR-F2-03 | `fact_dependente` | `fact_process_mode = "solo"` E condição de renda atendida (§2.2) E `fact_dependente` ausente | `must_ask_now` ← `fact_dependente`; `recommended_next_actions` ← `ACAO_COLETAR_DEPENDENTE` | Dependente pode impactar faixa MCMV — obrigação condicional |

### 6.2 Confirmações — "pedir confirmação de fato existente"

| Código | `fact_key` a confirmar | Condição de disparo | `confirmation_level` | Efeito no `lead_state` |
|---|---|---|---|---|
| CONF-F2-01 | `fact_estado_civil` | `fact_estado_civil` em `captured` | `hard` | `needs_confirmation = true`; confirmação obrigatória antes de determinar `fact_process_mode`; fato em `captured` não sustenta decisão de processo conjunto |
| CONF-F2-02 | `fact_composition_actor` | `fact_composition_actor` em `captured` com composição ampliada (P3) ou familiar | `hard` | `needs_confirmation = true`; P3 cascading (Regra 8) exige clareza sobre quem é o familiar e se é casado no civil |

### 6.3 Bloqueios — "bloquear avanço de `current_phase`"

> F2 não possui bloqueio hard autônomo com condição diretamente avaliável por schema T2 atual.
> O bloqueio de financiamento anterior (se aplicável) depende de LF-01 — regra documental
> declarada mas não implementável sem `fact_*` canônico.

**Nota LF-01 — bloqueio de financiamento:** a regra comercial do MCMV pode implicar bloqueio
para quem já possui financiamento MCMV ativo. Esta condição **não está capturada** no schema T2
atual. LF-01 registra essa lacuna. Até a resolução: (a) o LLM deve obter essa informação
conversacionalmente; (b) o mecânico não pode emitir bloqueio hard sem `fact_*` declarado;
(c) a regra permanece como **restrição operacional documentada**.

### 6.4 Sugestões mandatórias — "apenas orientar"

| Código | Gatilho | `guidance_code` | Conduta esperada do LLM |
|---|---|---|---|
| SGM-F2-01 | `fact_estado_civil = "casado"` confirmado + `fact_process_mode` não calculado como "duo" ainda | `SGM_CASAMENTO_CONJUNTO_OBRIGATORIO` | Orientar que financiamento em conjunto é obrigatório para casados no civil; ambos cônjuges entram; sem expor mecanismo de policy |
| SGM-F2-02 | `derived_composition_needed = true` + lead em processo solo | `SGM_COMPOSICAO_SUGERIDA` | Apresentar opção de composição para aumentar viabilidade; não forçar; lead decide |
| SGM-F2-03 | `fact_composition_actor` indica avô/avó + LF-04 (idade não confirmada) | `SGM_RISCO_IDADE_FAMILIAR` | Alertar sobre risco de limite de idade CEF (67 anos); sugerir alternativa viável; não bloquear de forma seca |
| SGM-F2-04 | `fact_composition_actor` indica familiar + LF-02 (estado civil do familiar não confirmado) | `SGM_FAMILIAR_CASADO_P3_CASCADING` | Identificar se o familiar é casado no civil; se for, orientar que cônjuge desse familiar entra no processo; ajudar a avaliar viabilidade |
| SGM-F2-05 | `fact_estado_civil = "união_estável"` + lead sinalizando composição com companheiro | `SGM_UNIAO_ESTAVEL_COMPOSICAO` | Esclarecer que união estável não é obrigatória como casamento civil; lead pode financiar solo ou com composição opcional; não equiparar automaticamente |

### 6.5 Roteamento — "desviar objetivo / avançar fase"

| Código | Condição | `target_phase` | `transition_type` | `requires_confirmation` |
|---|---|---|---|---|
| ROT-F2-01 | Todos os critérios de saída de F2 atendidos (ver §9) E `fact_p3_required = false` | `qualification` | `advance` (continua em qualification) | `false` |
| ROT-F2-02 | `fact_p3_required = true` E critérios de saída de F2 atendidos | `qualification_special` | `advance` | `false` |

> **Regra de precedência (T3_ORDEM_AVALIACAO §2):**
> ROT-F2-01 e ROT-F2-02 só são avaliados no Estágio 6 do pipeline T3 — após bloqueios, confirmações
> e obrigações terem sido processados nos estágios anteriores.

---

## §7 Veto suave aplicável em F2

O veto suave não impede avanço. É sinal estruturado de risco soft emitido em `soft_vetos[]`
dentro do `PolicyDecisionSet`. O LLM lê e decide como conduzir.

| Código | Condição | Severity | `guidance` ao LLM |
|---|---|---|---|
| VS-F2-01 | Lead declara `fact_estado_civil = "casado"` + menciona "só eu tenho renda" sem contexto | `"warning"` | Risco de lead não entender que cônjuge entra no processo mesmo sem renda; clarificar antes de avançar |
| VS-F2-02 | Lead menciona avô/avó para compor + nenhum sinal de idade fornecido | `"info"` | Identificar idade do familiar antes de avançar; risco de inviabilidade por limite CEF (LF-04) |
| VS-F2-03 | Lead em união estável + sinaliza que quer financiar sozinho mas menciona "meu companheiro(a) vai ajudar" | `"info"` | Ambiguidade: quer solo ou duo? Esclarecer antes de definir `fact_process_mode` |
| VS-F2-04 | Lead menciona familiar na composição + sem confirmação de estado civil desse familiar | `"info"` | Risco de P3 cascading não identificado; familiar casado no civil traz cônjuge junto (LF-02/03) |

---

## §8 Critérios de entrada de F2

A fatia F2 está apta a iniciar quando todas as condições abaixo forem verdadeiras:

| Condição | Verificação |
|---|---|
| F1 concluída | `fact_customer_goal.status = "captured"` mínimo; `fact_nationality.status = "confirmed"`; `derived_rnm_block = false`; `operational.blocked_by` vazio |
| `operational.current_phase = "qualification"` | Roteamento ROT-F1-01 executado — F1 avançou para `qualification` |
| T4 disponível como orquestrador | `TurnoEntrada` shape conforme `T4_ENTRADA_TURNO.md` |
| Sem bloqueio incompatível | `operational.blocked_by` vazio ou sem bloqueio ativo de F2 |

---

## §9 Critérios de saída — pronto para F3

F2 está **pronta** quando todas as condições abaixo forem verdadeiras simultaneamente:

| Critério | Chave | Condição exigida |
|---|---|---|
| Estado civil confirmado | `fact_estado_civil` | `status = "confirmed"` E `confirmed = true` |
| Modo de processo calculado | `fact_process_mode` | `status = "confirmed"` ou calculado pelo mecânico |
| Composição identificada (se não solo) | `fact_composition_actor` | SE `fact_process_mode != "solo"` → `status = "captured"` mínimo |
| P3 avaliado | `fact_p3_required` | Calculado; se `true` → ROT-F2-02 deve ter sido executado |
| Dependente tratado | `fact_dependente` | SE applicable: `captured` ou `skipped` documentado; SE processo conjunto: confirmado como `skipped` |
| Verificação de financiamento conjunto | LF-01 | Verificação realizada conversacionalmente; lacuna documentada |
| Sem bloqueio ativo | `operational.blocked_by` | vazio |
| Roteamento disponível | — | ROT-F2-01 ou ROT-F2-02 pode ser executado |

### 9.1 F2 NÃO está pronta se

- `fact_estado_civil` ausente ou em `captured` sem `confirmed`
- `fact_process_mode` não calculado
- `fact_process_mode != "solo"` E `fact_composition_actor` totalmente ausente
- `fact_p3_required = true` E ROT-F2-02 não executado (fase ainda em `qualification` sem transição)
- `operational.blocked_by` não vazio com bloqueio ativo de F2

---

## §10 Relação com pipeline T4

> Esta seção declara como F2 se integra ao pipeline T4 já aprovado.
> **Nenhuma alteração em artefatos T4_*.md** — o pipeline é consumido, não modificado.

### 10.1 `TurnoEntrada` em F2

Campos de `TurnoEntrada` relevantes para F2 (shape completo em `T4_ENTRADA_TURNO.md`):

| Campo | Valor esperado em F2 | Fonte |
|---|---|---|
| `operational.current_phase` | `"qualification"` | Persistido após ROT-F1-01 |
| `operational.must_ask_now` | `["fact_estado_civil"]` e/ou `["fact_composition_actor"]` e/ou `["fact_dependente"]` se aplicável | Policy engine T3 — estágio 4 |
| `operational.blocked_by` | `[]` (esperado na entrada de F2) | Policy engine T3 — estágio 2 |
| `lead_state.facts.fact_estado_civil` | `FactEntry` com `status` atual | Persistido em turno anterior |
| `lead_state.facts.fact_process_mode` | `FactEntry` com `status` atual | Calculado pelo mecânico |
| `lead_state.facts.fact_composition_actor` | `FactEntry` se coletado | Persistido em turno anterior |
| `lead_state.facts.fact_p3_required` | `FactEntry` com `value: true/false` | Calculado a partir de composição |
| `lead_state.facts.fact_dependente` | `FactEntry` se aplicável | Persistido se coletado |
| `lead_state.derived.derived_composition_needed` | `DerivedEntry` com `value: true/false` | Calculado pelo mecânico |
| `lead_state.derived.derived_dependents_applicable` | `DerivedEntry` com `value: true/false` | Calculado pelo mecânico |
| `policy_context.prior_decisions` | `PolicyDecisionSet` com obrigações/sugestões ativas | Policy engine T3 |
| `policy_context.soft_vetos` | `VetoSuaveRecord[]` se VS-F2-01..04 ativos | Policy engine T3 — veto suave |

### 10.2 `reply_text` — invariante T4

- `reply_text` vem **exclusivamente do LLM** via chamada única em T4.2
- `reply_text` é **imutável após captura** — nenhuma etapa pós-LLM reescreve, complementa ou substitui
- F2 **não produz** `reply_text`, sugestão de fala, script ou template em nenhuma circunstância
- Se `ValidationResult = REJECT` (T4.3), `reply_text` não é entregue ao canal; T4.5 aciona fallback

### 10.3 `TurnoSaida` e persistência pós-F2

Após o LLM gerar `reply_text` e o mecânico extrair `extracted_facts` (via `LLMResponseMeta`):

- T4.3 valida o `ProposedStateDelta` contra VC-01..VC-09
- Fatos de F2 persistidos: `fact_estado_civil`, `fact_process_mode`, `fact_composition_actor`,
  `fact_p3_required`, `fact_dependente`, `fact_dependents_count`
- `derived_composition_needed` e `derived_dependents_applicable` recalculados pelo mecânico
- Se `fact_p3_required = true`: mecânico dispara ROT-F2-02 via `ACAO_ROTEAR_QUALIFICATION_SPECIAL`
- `TurnoRastro` registra a decisão de persistência, as políticas aplicadas e o estado resultante

---

## §11 Classes de risco — comportamentos proibidos nesta fatia

> Estas são **classes de risco**, não frases proibidas. O LLM não pode incorrer nessas
> classes de comportamento em nenhuma fala produzida durante a fatia F2.

| Código | Classe de risco | Descrição | Por que é proibida |
|---|---|---|---|
| CR-F2-01 | Equiparar união estável a casamento civil obrigatório | Obrigar companheiro(a) de união estável a entrar no financiamento quando o lead quer financiar sozinho | Viola Regra 2; union estável não gera obrigatoriedade automática de processo conjunto |
| CR-F2-02 | Bloquear solteiro que quer compor renda | Negar composição voluntária por "solteiro não pode financiar com namorado(a)/familiar" sem base real | Viola Regra 3; solteiro pode abrir rota de composição; bloqueio sem base viola A00-ADENDO-02 |
| CR-F2-03 | Confundir `financiamentos_conjunto` com financiamento anterior | Perguntar "você já teve financiamento antes?" no stage `financiamentos_conjunto` | Stage significa financiamento EM CONJUNTO AGORA; associação a histórico é interpretação proibida |
| CR-F2-04 | Ignorar cônjuge quando lead é casado no civil | Avançar processo como "solo" quando `fact_estado_civil = "casado"` confirmado | Viola Regra 1; casado no civil → processo obrigatoriamente em conjunto |
| CR-F2-05 | Prometer viabilidade de composição com avô/avó sem alertar risco de idade | Dizer "pode incluir o avô" sem mencionar o risco de limitação CEF para maiores de 67 anos | Viola Regra 4; prometer viabilidade sem alertar risco é informação incompleta; viola M-03 |
| CR-F2-06 | Perguntar sobre dependente em processo conjunto | Fazer a pergunta de dependente quando `fact_process_mode = "duo"` ou `"p3"` | Viola Regra 5; em processo conjunto, pergunta DEVE ser pulada |
| CR-F2-07 | Perguntar sobre dependente quando renda > R$4.000 | Fazer a pergunta de dependente quando `fact_process_mode = "solo"` + renda formal acima de R$4.000 | Viola Regra 5; pergunta deve ser pulada para renda alta |
| CR-F2-08 | Criar if/else de fala por perfil familiar | "Se casado → dizer X; se solteiro → dizer Y" como output da fatia | Viola CA-01, B-04 permanentemente; qualquer if/else de fala é não-conformidade imediata |
| CR-F2-09 | Prometer aprovação bancária por composição declarada em F2 | "Com o seu marido você vai conseguir o financiamento" | F2 não tem dados de renda; qualquer promessa é falsa; viola A00-ADENDO-02 M-03 |
| CR-F2-10 | Ignorar P3 cascading (familiar casado no civil) | Incluir familiar na composição sem verificar se esse familiar é casado (cônjuge entra junto) | Viola Regra 8; P3 cascading pode gerar estado inconsistente; impacto em renda e documentação F3/F5 |

---

## §12 Anti-padrões proibidos em F2

| Código | Anti-padrão | Referência |
|---|---|---|
| AP-F2-01 | `reply_text` como output de qualquer componente de F2 | A00-ADENDO-01; T4_PIPELINE_LLM §1 |
| AP-F2-02 | Pergunta fixa de estado civil como sequência mecânica | CA-01; o LLM decide como obter o dado |
| AP-F2-03 | Roteamento ROT-F2-01 ou ROT-F2-02 com `blocked_by` ativo | T3_ORDEM_AVALIACAO §2.6 — roteamento só executa no Estágio 6, após bloqueios resolvidos |
| AP-F2-04 | `fact_estado_civil = "casado"` persistido como `confirmed` sem confirmação explícita do lead | T4_VALIDACAO_PERSISTENCIA VC-07 — estado civil tem impacto obrigatório em processo |
| AP-F2-05 | `fact_process_mode = "duo"` calculado para lead em união estável sem confirmar escolha do lead | Regra 2; union estável não obriga duo; lead decide |
| AP-F2-06 | `fact_dependente` perguntado em processo conjunto (duo/P3) | Regra 5; deve ser pulado |
| AP-F2-07 | Criação de `fact_composition_actor_marital_status`, `fact_composition_actor_age` ou qualquer `fact_*` fora de T2 | T2_LEAD_STATE_V1 §4.5; B-10 |
| AP-F2-08 | `current_phase` avançado para `qualification_special` sem `fact_p3_required = true` | ROT-F2-02 só executa com condição completa |
| AP-F2-09 | Uso de Meta / WhatsApp real para validação nesta fatia | B-07 — proibido antes de G5 |
| AP-F2-10 | Alteração de artefatos T1/T2/T3/T4 por necessidade desta fatia | B-06 — bloqueio ativo; lacunas devem ser documentadas, não resolvidas por alteração retroativa |

---

## §13 Cenários sintéticos declarativos

> Cenários são declarativos — descrevem o comportamento esperado do sistema (policy engine +
> mecânico + LLM) sem prescrever código ou implementação.

### Cenário SYN-F2-01 — Lead casado no civil → processo obrigatoriamente em conjunto

**Contexto:** lead chegou com F1 completa; estado civil informado como "casado".

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_customer_goal.status = "captured"
facts.fact_nationality.status = "confirmed"
facts.fact_estado_civil = ausente
operational.blocked_by = []
```

**Avaliação T3 esperada:**
- Estágio 4: OBR-F2-01 — `fact_estado_civil` ausente
- Após coleta: `fact_estado_civil.value = "casado"`, `status = "captured"` → CONF-F2-01 disparada
- Após confirmação: `fact_estado_civil.status = "confirmed"` → mecânico calcula `fact_process_mode = "duo"`
- SGM-F2-01 emitida — orientar sobre financiamento obrigatoriamente em conjunto
- Estágio 4: OBR-F2-02 — `fact_composition_actor` ausente + `process_mode = "duo"`

**Resultado esperado:** mecânico define `fact_process_mode = "duo"`; LLM orienta que ambos os cônjuges entram no processo; não menciona que um pode ficar sem renda como problema (renda é F3); sem script fixo.

**Critério de PASS:** `fact_process_mode = "duo"`; `fact_estado_civil = "confirmed"`; SGM-F2-01 emitida; zero `reply_text` da fatia; LLM soberano.

---

### Cenário SYN-F2-02 — Lead em união estável quer financiar sozinho → pode seguir solo

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_estado_civil.value = "união_estável"
facts.fact_estado_civil.status = "confirmed"
```

**Evento do turno:** lead diz "vivo junto com minha companheira mas quero fazer o financiamento só no meu nome".

**Avaliação T3 esperada:**
- `fact_process_mode` calculado como `"solo"` — união estável não obriga duo
- VS-F2-03 avaliado (sem ambiguidade aqui — lead foi explícito) → não disparado
- SGM-F2-05 não disparada (lead foi claro: quer solo)
- OBR-F2-01: já resolvida
- Estágio 6: ROT-F2-01 disponível quando demais critérios atendidos

**Resultado esperado:** mecânico aceita `fact_process_mode = "solo"`; LLM não impõe "mas sua companheira precisa entrar"; processo segue solo normalmente.

**Critério de PASS:** `fact_process_mode = "solo"`; sem forçar duo; VS-F2-03 não disparado erroneamente; zero `reply_text` da fatia.

---

### Cenário SYN-F2-03 — Lead solteiro quer somar renda com namorado(a)

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_estado_civil.value = "solteiro"
facts.fact_estado_civil.status = "confirmed"
```

**Evento do turno:** lead diz "sou solteiro mas minha namorada também trabalha, posso somar a renda dela?".

**Avaliação T3 esperada:**
- `fact_estado_civil = "solteiro"` confirmado — não reclassificar para casal
- `fact_process_mode` evolui para `"duo"` voluntariamente pelo lead
- OBR-F2-02 disparada — `fact_composition_actor` ausente (quem é a namorada?)
- SGM-F2-02 emitida — composição sugerida/aberta
- CONF-F2-02: após `fact_composition_actor` capturado

**Resultado esperado:** mecânico abre rota de composição; LLM orienta como incluir a namorada; não reclassifica como "casado"; `fact_estado_civil` permanece "solteiro"; `fact_process_mode = "duo"` pela escolha do lead.

**Critério de PASS:** `fact_estado_civil = "solteiro"` preservado; `fact_process_mode = "duo"` pela composição voluntária; OBR-F2-02 ativa; zero `reply_text` da fatia.

---

### Cenário SYN-F2-04 — Lead quer incluir avô (70 anos) na composição → alertar risco CEF

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_estado_civil.value = "solteiro"
facts.fact_estado_civil.status = "confirmed"
facts.fact_process_mode = ausente
```

**Evento do turno:** lead diz "queria colocar meu avô de 70 anos para ajudar com a renda".

**Avaliação T3 esperada:**
- OBR-F2-02: `fact_composition_actor` ausente + `process_mode` precisa ser definido como "p3"
- SGM-F2-03 disparada — avô identificado + LF-04 (idade > 67 anos)
- VS-F2-02 emitido — avô mencionado, idade informada (70 anos > 67)
- `fact_p3_required` avaliado como `true` se composição ampliada confirmada
- CONF-F2-02: `fact_composition_actor` capturado como avô → confirmação hard

**Resultado esperado:** LLM alerta sobre risco de limitação CEF (avô com 70 anos); sugere alternativa se existir; não bloqueia de forma seca; não promete que vai funcionar; conduz para entender melhor.

**Critério de PASS:** SGM-F2-03 emitida; VS-F2-02 emitido; LLM alertou risco; não bloqueou seco; não prometeu aprovação; zero `reply_text` da fatia.

---

### Cenário SYN-F2-05 — Lead sozinho, renda informal abaixo de R$4.000 → perguntar dependente

**Contexto:** lead é solo, renda ainda não coletada mas lead mencionou "ganho em torno de R$2.500".

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_estado_civil.status = "confirmed"
facts.fact_process_mode.value = "solo"
facts.fact_dependente = ausente
```

**Avaliação T3 esperada:**
- `fact_process_mode = "solo"` → pergunta de dependente é avaliável
- Sinal de renda < R$4.000 inferido da conversa (renda formal confirmada em F3)
- OBR-F2-03 disparada — `fact_dependente` ausente + processo solo
- Mecânico registra condição para coletar `fact_dependente`

**Resultado esperado:** mecânico emite OBR-F2-03; LLM obtém informação sobre dependente com naturalidade — **sem script fixo**, **sem "você tem dependentes? S/N"** como pergunta mecânica.

**Critério de PASS:** OBR-F2-03 emitida; LLM soberano na forma de perguntar; `fact_dependente` persistido quando coletado; zero `reply_text` da fatia.

---

### Cenário SYN-F2-06 — Lead em processo conjunto → pular dependente obrigatoriamente

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_estado_civil.value = "casado"
facts.fact_estado_civil.status = "confirmed"
facts.fact_process_mode.value = "duo"
facts.fact_dependente = ausente
```

**Avaliação T3 esperada:**
- `fact_process_mode = "duo"` → dependente **DEVE ser pulado** (Regra 5)
- OBR-F2-03 **NÃO disparada** — condição de duo elimina a obrigação
- `fact_dependente` marcado como não aplicável / pulado pelo mecânico
- ROT-F2-01 disponível quando demais critérios atendidos

**Resultado esperado:** mecânico registra `fact_dependente` como `skipped` para processo duo; LLM não pergunta sobre dependente neste contexto; fluxo avança para identificar `fact_composition_actor`.

**Critério de PASS:** OBR-F2-03 **não** emitida; `fact_dependente` pulado para duo; ROT-F2-01 elegível com critérios demais atendidos; zero `reply_text` da fatia.

---

### Cenário SYN-F2-07 — Lead quer incluir pai (casado no civil) → P3 cascading

**Contexto:** lead solteiro quer colocar o pai na composição; pai é casado no civil com a mãe do lead.

**Prior state:**
```
operational.current_phase = "qualification"
facts.fact_estado_civil.value = "solteiro"
facts.fact_estado_civil.status = "confirmed"
facts.fact_composition_actor = ausente
facts.fact_p3_required = ausente
```

**Evento do turno:** lead diz "posso colocar meu pai? Ele e minha mãe são casados".

**Avaliação T3 esperada:**
- OBR-F2-02: `fact_composition_actor` ausente
- Após captura de pai: `fact_composition_actor` captured
- CONF-F2-02 disparada — composição com familiar (P3 potencial)
- SGM-F2-04 disparada — familiar identificado; verificar se é casado no civil
- VS-F2-04 emitido — familiar mencionado sem confirmação de estado civil desse familiar
- Lead confirmou: pai casado no civil com mãe → **cônjuge (mãe) entra junto no processo**
- `fact_p3_required` calculado como `true` (pai + mãe = 2 adicionais = P3 ampliado)
- ROT-F2-02 disponível: `current_phase → qualification_special`

**Resultado esperado:** LLM identifica P3 cascading; orienta que mãe (cônjuge do pai) entra junto no processo; ajuda lead a avaliar se ainda quer essa composição ou prefere alternativa; não trata como impedimento automático.

**Critério de PASS:** `fact_p3_required = true`; ROT-F2-02 elegível; SGM-F2-04 emitida; LLM orientou sobre P3 cascading; VS-F2-04 emitido; zero `reply_text` da fatia.

---

## §14 Validação cruzada T2 / T3 / T4 / T5.1

| Dimensão | Verificação | Status |
|---|---|---|
| `fact_estado_civil` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group III` — `fact_estado_civil` listado | ✓ CONFIRMADO |
| `fact_process_mode` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group III` — `fact_process_mode` listado | ✓ CONFIRMADO |
| `fact_composition_actor` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group III` — `fact_composition_actor` listado | ✓ CONFIRMADO |
| `fact_p3_required` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group III` — `fact_p3_required` listado | ✓ CONFIRMADO |
| `fact_dependente` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group VIII` — `fact_dependente` listado | ✓ CONFIRMADO |
| `fact_dependents_count` existe em T2 | `T2_LEAD_STATE_V1 §4.4 Group VIII` — `fact_dependents_count` listado | ✓ CONFIRMADO |
| `derived_composition_needed` existe em T2 | `T2_LEAD_STATE_V1 §5.3` — `derived_composition_needed` listado | ✓ CONFIRMADO |
| `derived_dependents_applicable` existe em T2 | `T2_LEAD_STATE_V1 §5.3` — `derived_dependents_applicable` listado | ✓ CONFIRMADO |
| Roteamento `qualification_special` é canônico | `T2_LEAD_STATE_V1 §3.3` — `qualification_special` listado como valor canônico de `current_phase` | ✓ CONFIRMADO |
| Bloqueio com `hypothesis` proibido | `T3_CLASSES_POLITICA §2.2 CP-09` — fato em hypothesis nunca sustenta bloqueio | ✓ DECLARADO — CONF-F2-01 exige `confirmed` antes de determinar processo |
| Roteamento é Estágio 6 | `T3_ORDEM_AVALIACAO §2.6` — roteamento só executa após bloqueios/confirmações/obrigações | ✓ DECLARADO em ROT-F2-01/02 |
| `reply_text` exclusivo do LLM | `T4_PIPELINE_LLM §1` — contrato único; reply_text imutável | ✓ DECLARADO em §10.2 |
| T4_VALIDACAO: persistência requer coleta explícita | `T4_VALIDACAO_PERSISTENCIA VC-07` — `confirmed = true` sem coleta = REJECT | ✓ DECLARADO em AP-F2-04 |
| Veto suave em `soft_vetos[]` | `T3_VETO_SUAVE_VALIDADOR §1.1` — veto suave registrado em `soft_vetos[]` | ✓ DECLARADO em §7 |
| Fatia F2 mapeada em T5_MAPA_FATIAS | `T5_MAPA_FATIAS §4.2` — F2 com current_phase, fatos, políticas e critérios | ✓ CONFIRMADO |
| LF-01 (financiamento conjunto) herdada de T5_MAPA_FATIAS | `T5_MAPA_FATIAS §3.1 tabela LF (LF-02 global)` — lacuna de schema para `financiamentos_conjunto` | ✓ CONFIRMADO — não criado `fact_*` novo |
| Zero `fact_*` inventado | Cada chave verificada em `T2_LEAD_STATE_V1 §4.4`; LF-01..05 documentadas sem criar fact_* | ✓ CONFIRMADO |
| Zero alteração em T1/T2/T3/T4 | Diff desta PR: apenas `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` + rastreamento | ✓ CONFIRMADO |
| Regras comerciais Vasques documentadas | 9 regras declaradas em §5; nenhuma gera `reply_text`; nenhuma cria template | ✓ CONFIRMADO |
| Base normativa MCMV/CEF: lacuna declarada | LF-05 em §4; nenhuma afirmação de normativa disponível no repo | ✓ CONFIRMADO |

---

## Bloco E — PR-T5.3

### ESTADO HERDADO

```
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T5.2-fix (#116) — T5_FATIA_TOPO_ABERTURA.md v2; correções de premissas de topo e RNM; merged 2026-04-26T22:08:12Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md (aberto)
Objetivo imutável do contrato: migração declarativa do funil core por fatias — F1 concluída; F2 agora
Recorte a executar nesta PR: §6 S3 — Fatia qualificação inicial / composição familiar
Item do A01: T5 — semanas 10-12; prioridade 6; microetapa: migrar composição/estado civil
Estado atual da frente: contrato aberto — PR-T5.3 em execução
O que a última PR fechou: correções de premissas F1 (fact_customer_goal gate; RNM validade indeterminada)
O que a última PR NÃO fechou: PR-T5.3 a PR-T5.R (F2 a G5)
Por que esta tarefa existe: contrato T5 §16 define PR-T5.3 como próxima PR; Vasques autorizou
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: criar T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md com contrato declarativo de F2
Escopo: schema/implantation/ apenas; regras comerciais Vasques validadas; zero runtime
Fora de escopo: src/, T1/T2/T3/T4, Supabase, runtime, normativa real, PR-T5.4
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
  Status da frente/fase lido:  schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente/fase lido: schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    L07, L08 — Identificado estruturalmente — não transcrito; regras de negócio declaradas via Vasques
  PDF mestre consultado:       não consultado — regras comerciais validadas diretamente por Vasques no brief
```

### Evidências de conclusão

| Item contratual | Status | Evidência / localização |
|---|---|---|
| Fatia F2 formalizada (7 stages cobertos) | **CONCLUÍDO** | §2 — tabela de stages com objetivos operacionais |
| `current_phase = qualification` declarado | **CONCLUÍDO** | Meta + §1 + §8 |
| Fatos mínimos T2 canônicos (8 chaves) | **CONCLUÍDO** | §3 — todas as chaves verificadas em T2_LEAD_STATE_V1 |
| Nenhum `fact_*` inventado | **CONCLUÍDO** | §14 validação cruzada — zero chaves fora de T2; LF-01..05 sem criar fact_* |
| LF-01..05 declaradas (5 lacunas) | **CONCLUÍDO** | §4 — LF-01 (financiamento conjunto), LF-02 (estado civil familiar), LF-03 (cônjuge familiar), LF-04 (idade familiar), LF-05 (base normativa) |
| 9 regras comerciais Vasques documentadas | **CONCLUÍDO** | §5 — Regras 1-9 sem reply_text |
| Políticas T3 aplicáveis (5 classes) | **CONCLUÍDO** | §6 — OBR/CONF/BLQ-nota/SGM/ROT com payloads |
| Veto suave declarado | **CONCLUÍDO** | §7 — VS-F2-01..04 |
| Critérios de entrada | **CONCLUÍDO** | §8 |
| Critérios de saída / pronto para F3 | **CONCLUÍDO** | §9 — 8 critérios mensuráveis |
| Relação com pipeline T4 | **CONCLUÍDO** | §10 — TurnoEntrada, reply_text invariante, persistência |
| Classes de risco (10 classes) | **CONCLUÍDO** | §11 — CR-F2-01..CR-F2-10 |
| Anti-padrões proibidos (10) | **CONCLUÍDO** | §12 — AP-F2-01..AP-F2-10 |
| Cenários sintéticos declarativos (7) | **CONCLUÍDO** | §13 — SYN-F2-01..07 |
| Validação cruzada T2/T3/T4/T5.1 (21 itens) | **CONCLUÍDO** | §14 |
| Nenhum `reply_text` produzido pela fatia | **CONCLUÍDO** | §10.2; AP-F2-01; CA-08 |
| Nenhum script/template de fala | **CONCLUÍDO** | §11 CR-F2-08; AP-F2-02 |
| Conformidade A00-ADENDO-01/02/03 | **CONCLUÍDO** | Finalidade princípio canônico; §11; §12 |

### Provas (P-T5-01 a P-T5-03)

| Prova | Status | Evidência |
|---|---|---|
| P-T5-01 — Ausência de reply_text em outputs da fatia | PASS | Zero campos `reply_text`, `mensagem_usuario`, `texto_cliente` ou template em qualquer seção do documento |
| P-T5-02 — Referências cruzadas T2 | PASS | §14 confirma todas as 8 chaves fact_*/derived_* em T2_LEAD_STATE_V1; LF-01..05 sem criar fact_* |
| P-T5-03 — Referências cruzadas T3 | PASS | §6 e §14 confirmam todas as políticas em T3_CLASSES_POLITICA e T3_ORDEM_AVALIACAO |

### ESTADO ENTREGUE

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR:
- Criado T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md — contrato declarativo F2
- 7 stages legados cobertos (estado_civil..quem_pode_somar)
- 8 chaves T2 canônicas declaradas (fact_estado_civil, fact_process_mode, fact_composition_actor,
  fact_p3_required, fact_dependente, fact_dependents_count, derived_composition_needed,
  derived_dependents_applicable)
- 9 regras comerciais Vasques documentadas sem reply_text
- 5 lacunas de schema futuras declaradas (LF-01..05)
- 5 classes de política T3 (3 obrigações, 2 confirmações, nota LF-01 para bloqueio,
  5 sugestões mandatórias, 2 roteamentos)
- 4 vetos suaves (VS-F2-01..04)
- 8 critérios de saída mensuráveis
- 7 cenários sintéticos declarativos (SYN-F2-01..07)
- 21 itens de validação cruzada
- STATUS/LATEST/_INDEX atualizados

O que foi fechado nesta PR: PR-T5.3 — contrato F2 entregue; PR-T5.4 desbloqueada
O que continua pendente: PR-T5.4 a PR-T5.R
O que ainda não foi fechado do contrato ativo: S4-S9 (F3, F4, F5, paridade, shadow, readiness)
Recorte executado do contrato: §6 S3
Pendência contratual remanescente: S4-S9 + gate G5
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado? sim → PR-T5.4 (antes: PR-T5.3)
Esta tarefa foi fora de contrato? não
Arquivos vivos atualizados: T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md (criado),
  _INDEX.md, STATUS, LATEST
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```

### --- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---

```
Documento-base da evidência:           schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md
Estado da evidência:                   completa
Há lacuna remanescente?:               sim — LF-01..05 (declaradas, não bloqueantes; nenhuma impede fechamento de F2)
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada (PR-T5.3)
Próxima PR autorizada:                 PR-T5.4 — Contrato da fatia renda/regime/composição
```

### Status

**CONCLUÍDA** — PR-T5.3 entregue; contrato T5 permanece `aberto`; PR-T5.4 desbloqueada.

### Próxima PR autorizada

**PR-T5.4 — Contrato da fatia renda/regime/composição**
Artefato: `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md`
21 stages: `regime_trabalho`, `renda`, `ctps_36`, `ir_declarado`, `possui_renda_extra`,
`inicio_multi_renda_pergunta`, `inicio_multi_renda_coletar`, `inicio_multi_regime_pergunta`,
`inicio_multi_regime_coletar`, `renda_mista_detalhe`, `autonomo_compor_renda`,
`parceiro_tem_renda`, `regime_trabalho_parceiro`, `regime_trabalho_parceiro_familiar`,
`renda_parceiro`, `renda_parceiro_familiar`, `renda_familiar_valor`, `somar_renda_familiar`,
`somar_renda_solteiro`, `sugerir_composicao_mista`, `ctps_36_parceiro`
`current_phase: qualification` ou `qualification_special`
