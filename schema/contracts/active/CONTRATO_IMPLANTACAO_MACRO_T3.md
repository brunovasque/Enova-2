# CONTRATO — T3 Policy Engine v1 e Guardrails Declarativos — ENOVA 2

| Campo                             | Valor                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Frente                            | T3 — Policy engine v1 e guardrails declarativos                                               |
| Fase do A01                       | T3 (Semanas 5–6 da implantação macro)                                                         |
| Prioridade do A01                 | 4                                                                                             |
| Dependências                      | G2 APROVADO (`schema/implantation/READINESS_G2.md`), contrato T2 encerrado (`schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`) |
| Legados aplicáveis                | L03 (obrigatório); L05, L07–L17, L19 (complementares por microetapa)                         |
| Referências obrigatórias          | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`, `schema/ADENDO_CANONICO_SOBERANIA_IA.md`, `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`, `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`, `schema/CONTRACT_SCHEMA.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`, `schema/legacy/INDEX_LEGADO_MESTRE.md`, `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção J |
| Blocos legados obrigatórios       | L03                                                                                           |
| Blocos legados complementares     | L05, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17, L19                             |
| Ordem mínima de leitura da frente | L03 → L07–L10 (estado civil / composição) → L11–L14 (regime / renda) → L19 (perfil MCMV)    |
| Status                            | **aberto** — PR-T3.0 executada em 2026-04-24                                                  |
| Última atualização                | 2026-04-24                                                                                    |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala; mecânico jamais com prioridade de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade MCMV; guia de leitura T3 com travas contra má interpretação.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Bloco E obrigatório em toda PR que feche etapa.

---

## §1 Objetivo

T3 entrega o **motor declarativo de políticas (policy engine v1)** da ENOVA 2: o mecanismo que, dado o `lead_state` atual, decide quais ações são obrigatórias, quais avanços devem ser bloqueados, quais confirmações devem ser solicitadas e quais riscos devem ser assinalados — sem jamais produzir `reply_text` diretamente.

Ao final de T3, o sistema possui:
1. Classes canônicas de política (obrigação, bloqueio, sugestão mandatória, confirmação, roteamento).
2. Regras críticas codificadas de forma declarativa (casado civil→conjunto; autônomo→IR; renda solo baixa→composição; estrangeiro sem RNM→não avançar).
3. Ordem estável de avaliação e política de composição quando múltiplas regras disparam.
4. Veto suave + validador pós-resposta/pré-persistência.
5. Suíte de testes que cobre positivo, negativo, ambíguo, colisões e regressão.

O policy engine **decide mas não fala**. Toda fala permanece sob soberania do LLM (A00-ADENDO-01).

---

## §2 Escopo

1. Definição e documentação das classes canônicas de política T3 (`T3_CLASSES_POLITICA.md`).
2. Codificação declarativa das quatro regras críticas obrigatórias (`T3_REGRAS_CRITICAS_DECLARATIVAS.md`).
3. Definição da ordem estável de avaliação para evitar colisão de regras e da política de composição quando múltiplas regras disparam simultaneamente (`T3_ORDEM_AVALIACAO_COMPOSICAO.md`).
4. Definição do mecanismo de veto suave e do validador pós-resposta/pré-persistência (`T3_VETO_SUAVE_VALIDADOR.md`).
5. Suíte mínima de testes declarativos de regras críticas — positivo, negativo, ambíguo, colisões e regressão (`T3_SUITE_TESTES_REGRAS.md`).
6. Readiness/Closeout de G3 (`READINESS_G3.md`) e autorização de T4.
7. Definição formal do que é "bloquear avanço", "desviar objetivo", "pedir confirmação" e "apenas orientar".
8. Atualização de `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`, `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` e `schema/contracts/_INDEX.md` a cada PR.

---

## §3 Fora de escopo

- Implementação de código TypeScript/JavaScript em `src/` — T3 é inteiramente documental/declarativo.
- Alterações em `package.json`, `wrangler.toml` ou qualquer arquivo de infraestrutura.
- Orquestrador de turno (T4) — proibido abrir antes de G3 aprovado.
- Integração real com Supabase ou runtime de produção.
- Coleta de dados de usuário real ou execução de funil com lead real.
- Criação de regras de negócio não previstas nas cinco microetapas do mestre T3.
- Snapshot, reconciliação ou memória viva (cobertos em T2).
- Pipeline LLM ou captura de `reply_text` (cobertos em T4).

---

## §4 Dependências

### Dependências de gate
- **G2 APROVADO** — `schema/implantation/READINESS_G2.md` — critério formal: 6 artefatos T2 smoke PASS, 8 dimensões de coerência verificadas, decisão G2 APROVADO registrada com data.
- **Contrato T2 encerrado** — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md` — encerramento formal via CONTRACT_CLOSEOUT_PROTOCOL.

### Dependências de artefato (entregues em T2)
- `schema/implantation/T2_DICIONARIO_FATOS.md` — vocabulário canônico de fatos; base de toda interpretação de `lead_state`.
- `schema/implantation/T2_LEAD_STATE_SCHEMA_V1.md` — schema dos 11 blocos canônicos; estrutura que o policy engine consome.
- `schema/implantation/T2_POLITICA_CONFIANCA_ORIGEM.md` — política de confiança por origem; determina quando um fato está apto a disparar uma regra.
- `schema/implantation/T2_RECONCILIACAO_CONFLITOS.md` — protocolo de reconciliação; resolve conflitos antes que o policy engine avalie.
- `schema/implantation/T2_RESUMO_PERSISTIDO.md` — camadas de memória, snapshot e regras anti-contaminação.
- `schema/implantation/T2_POLITICA_AUDITORIA_ORIGEM.md` — rastreabilidade de origem; auditoria de aplicação de regras.

### Dependências de frente
- T1 concluída (G1 APROVADO em 2026-04-23) — dicionário de fatos base disponível.
- T2 concluída (G2 APROVADO em 2026-04-24) — lead_state v1 + política de confiança disponíveis.

---

## §5 Entradas

Antes de iniciar qualquer PR de T3, devem existir e estar acessíveis:

| # | Artefato | Caminho | Condição de entrada |
|---|----------|---------|---------------------|
| E1 | Readiness G2 | `schema/implantation/READINESS_G2.md` | Status: G2 APROVADO, Bloco E presente |
| E2 | Contrato T2 arquivado | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md` | Status: ENCERRADO |
| E3 | Contrato T3 aberto | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` | Status: aberto (este documento) |
| E4 | Schema lead_state v1 | `schema/implantation/T2_LEAD_STATE_SCHEMA_V1.md` | 11 blocos canônicos definidos |
| E5 | Dicionário de fatos | `schema/implantation/T2_DICIONARIO_FATOS.md` | Vocabulário canônico disponível |
| E6 | Política de confiança | `schema/implantation/T2_POLITICA_CONFIANCA_ORIGEM.md` | Níveis de confiança por origem definidos |
| E7 | Bíblia Canônica §J | `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção J | PRs T3.0–T3.R mapeadas |
| E8 | Legado mestre T3 | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T3 | Microetapas do mestre acessíveis |

---

## §6 Saídas

Ao final de T3, os seguintes artefatos devem existir, ser coerentes entre si e com T2:

| # | Artefato | Caminho | PR que o cria | Conteúdo mínimo |
|---|----------|---------|---------------|-----------------|
| S1 | Classes canônicas de política | `schema/implantation/T3_CLASSES_POLITICA.md` | PR-T3.1 | 5 classes: obrigação, bloqueio, sugestão mandatória, confirmação, roteamento; definição de cada classe; payload mínimo; regra de prioridade entre classes |
| S2 | Regras críticas declarativas | `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` | PR-T3.2 | 4 regras codificadas: casado civil→conjunto, autônomo→IR, solo baixa→composição, estrangeiro sem RNM→bloqueio; formato declarativo; condição de disparo; classe resultante |
| S3 | Ordem de avaliação e composição | `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` | PR-T3.3 | Ordem estável numerada; política de composição quando N regras disparam; regra de desempate; proibição de colisão silenciosa |
| S4 | Veto suave e validador | `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` | PR-T3.4 | Definição de veto suave; condições de disparo; validador pós-resposta/pré-persistência; checklist mínimo do validador |
| S5 | Suíte de testes de regras | `schema/implantation/T3_SUITE_TESTES_REGRAS.md` | PR-T3.5 | Casos positivo, negativo, ambíguo por regra crítica; casos de colisão; casos de regressão; critério de aceite por caso |
| S6 | Readiness G3 | `schema/implantation/READINESS_G3.md` | PR-T3.R | Smoke documental S1–S5; dimensões de coerência; decisão formal G3 APROVADO ou REPROVADO; Bloco E; autorização T4 |

---

## §7 Critérios de aceite

| # | Critério | Verificação |
|---|----------|-------------|
| CA-01 | Policy engine **decide mas não fala** — nenhuma classe de política produz `reply_text` diretamente | Inspeção de S1–S5: ausência de campos `reply_text`, `mensagem_usuario` ou equivalentes em qualquer saída do engine |
| CA-02 | As quatro regras críticas do mestre estão codificadas de forma declarativa | S2 contém casado civil→conjunto, autônomo→IR, solo baixa→composição, estrangeiro sem RNM→bloqueio, cada uma com condição de disparo verificável |
| CA-03 | Ordem de avaliação é estável e sem colisão silenciosa | S3 define numeração explícita; nenhuma regra pode sobrescrever outra sem registro |
| CA-04 | Veto suave está definido e é distinto de bloqueio | S4 diferencia veto suave (orientar + registrar) de bloqueio (impedir avanço); condições de cada um são não-ambíguas |
| CA-05 | Validador pós-resposta/pré-persistência existe e tem checklist | S4 inclui checklist mínimo com ≥3 itens verificáveis antes de qualquer persistência |
| CA-06 | Suíte de testes cobre positivo, negativo, ambíguo, colisão e regressão | S5 tem ≥1 caso por categoria por regra crítica; total ≥20 casos |
| CA-07 | Todos os artefatos T3 são coerentes com lead_state v1 | Campos de condição de disparo em S2–S4 referenciam apenas chaves canônicas do T2_LEAD_STATE_SCHEMA_V1 |
| CA-08 | LLM-first preservado em todas as PRs | Nenhuma PR de T3 cria mecanismo que escreva fala autonomamente; policy engine emite apenas classes/payloads estruturados |
| CA-09 | Cinco microetapas do mestre T3 cobertas | S1 (microetapas 2), S2 (microetapa 1), S3 (microetapas 3 e 4), S4 (microetapa 5) — cada seção declara qual microetapa cobre |
| CA-10 | G3 decidido com Bloco E e evidência formal | READINESS_G3.md contém smoke de S1–S5, critérios CA-01–CA-09 verificados, decisão G3 APROVADO ou REPROVADO, Bloco E presente |

---

## §8 Provas obrigatórias

Cada PR de T3 deve apresentar:

| Prova | Descrição |
|-------|-----------|
| P-T3-01 | Diff do artefato criado — inspeção linha a linha que confirma ausência de `reply_text` ou `mensagem_usuario` em qualquer saída do engine |
| P-T3-02 | Referências cruzadas — cada campo de condição de disparo citado aponta a chave canônica existente em T2_LEAD_STATE_SCHEMA_V1 |
| P-T3-03 | Cobertura das microetapas — declaração explícita em cada PR de qual(is) microetapa(s) do mestre T3 é coberta |
| P-T3-04 | Contagem de casos de teste (PR-T3.5) — total ≥20; breakdown por categoria (positivo/negativo/ambíguo/colisão/regressão) |
| P-T3-05 | Smoke coerência (PR-T3.R) — checklist de 5 artefatos S1–S5 com status PASS/FAIL + justificativa por dimensão |

---

## §9 Bloqueios

| # | Bloqueio | Condição de desbloqueio |
|---|----------|------------------------|
| B-01 | **G2 não aprovado** — T3 não pode ser aberta sem G2 APROVADO documentado | `READINESS_G2.md` com decisão G2 APROVADO e data — **DESBLOQUEADO em 2026-04-24** |
| B-02 | **Contrato T2 não encerrado** — policy engine não pode ser declarado sem lead_state v1 formal | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md` presente — **DESBLOQUEADO em 2026-04-24** |
| B-03 | **PR fora de sequência** — nenhuma PR-T3.N pode iniciar sem a PR-T3.(N-1) concluída e merged | Branch principal atualizado; PR anterior com status `merged` no GitHub |
| B-04 | **Implementação em `src/`** — qualquer PR que toque código TypeScript viola este contrato | Bloqueio permanente; requer revisão contratual formal se escopo precisar ser expandido |
| B-05 | **Abertura de T4** — T4 não pode ser iniciado antes de G3 APROVADO | `READINESS_G3.md` com decisão G3 APROVADO — bloqueio ativo até PR-T3.R |

---

## §10 Próximo passo autorizado

**PR-T3.1 — Classes canônicas de política**

- Artefato: `schema/implantation/T3_CLASSES_POLITICA.md`
- Escopo: definir as 5 classes (obrigação, bloqueio, sugestão mandatória, confirmação, roteamento); payload mínimo de cada classe; regra de prioridade entre classes; definição formal de "bloquear avanço", "desviar objetivo", "pedir confirmação" e "apenas orientar"
- Referência: `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §J, PR-T3.1

---

## §11 Relação com o A01

| Campo A01 | Valor |
|-----------|-------|
| Fase      | T3 — Semanas 5–6 |
| Prioridade | 4 |
| Gate de entrada | G2 APROVADO |
| Gate de saída | G3 — policy engine funcional + validador + suite de testes passando |
| Épico do mestre | "Motor declarativo de políticas com classes e validador pós-resposta" |
| Posição na cadeia | T1 (dict) → T2 (lead_state) → **T3 (policy engine)** → T4 (orquestrador) |

---

## §12 Relação com legados aplicáveis

| Legado | Relevância para T3 | Uso por PR |
|--------|-------------------|------------|
| L03 — Mapa Canônico do Funil | **Obrigatório** — stages, gates e microregras do funil; base para definir quando uma regra "bloqueia avanço" vs "apenas orienta" | Todas as PRs T3.1–T3.R |
| L05 — Topo do Funil (Parser) | Complementar — critérios de extração que alimentam fatos; contexto de confiança para regras de topo | PR-T3.2 (regras sensíveis de topo) |
| L07–L08 — Estado Civil | Complementar — regras de estado civil (casado civil→conjunto); microregras de composição por estado civil | PR-T3.2 (regra casado civil→conjunto) |
| L09–L10 — Composição Familiar | Complementar — microregras de composição; elegibilidade por dependentes | PR-T3.2 (regra solo baixa→composição) |
| L11–L12 — Regime e Renda | Complementar — regras de renda, IR e regime de bens (autônomo→IR) | PR-T3.2 (regra autônomo→IR) |
| L13 — CTPS e Dependentes | Complementar — restrições de elegibilidade por CTPS | PR-T3.3 (composição de regras de renda) |
| L14 — Gates e Restrições | Complementar — gates de bloqueio do Meio B; padrão de bloqueio de avanço | PR-T3.1 (definição de bloqueio) + PR-T3.3 |
| L15–L16 — Especiais | Complementar — trilhos P3 e multi-proponente; variantes de elegibilidade | PR-T3.3 (composição em cenários especiais) |
| L17 — Final Operacional | Complementar — handoff e fase final; relevante para regras de veto tardio | PR-T3.4 (veto suave) |
| L19 — Memorial MCMV | Complementar — regras substantivas MCMV por perfil; incluindo estrangeiro sem RNM | PR-T3.2 (regra estrangeiro→bloqueio) |

---

## §13 Referências

| Documento | Finalidade |
|-----------|-----------|
| `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T3 | Fonte canônica das cinco microetapas obrigatórias de T3 |
| `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §J | Definição e sequência de PRs T3.0–T3.R |
| `schema/CONTRACT_SCHEMA.md` | Formato canônico obrigatório — estrutura seguida neste contrato |
| `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` | Regras de execução contratual — imutabilidade de escopo |
| `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` | Protocolo formal de encerramento — obrigatório em PR-T3.R |
| `schema/implantation/READINESS_G2.md` | Gate de entrada T3 — G2 APROVADO com Bloco E |
| `schema/implantation/T2_LEAD_STATE_SCHEMA_V1.md` | Entrada do policy engine — 11 blocos canônicos |
| `schema/implantation/T2_DICIONARIO_FATOS.md` | Vocabulário de fatos que o engine interpreta |
| `schema/implantation/T2_POLITICA_CONFIANCA_ORIGEM.md` | Confiança por origem — pré-condição para disparo de regras |
| `schema/implantation/T2_RECONCILIACAO_CONFLITOS.md` | Reconciliação antes do engine avaliar estado |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | A00-ADENDO-01 — LLM soberano na fala; engine não fala |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | A00-ADENDO-02 — identidade MCMV; travas de interpretação |
| `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` | A00-ADENDO-03 — Bloco E obrigatório em toda PR que fecha etapa |
| `schema/legacy/INDEX_LEGADO_MESTRE.md` | Índice de legados — amarração por frente |

---

## §14 Blocos legados aplicáveis

### Obrigatórios (devem ser lidos antes de qualquer execução T3)

| Código | Nome | Razão de obrigatoriedade |
|--------|------|--------------------------|
| L03 | Mapa Canônico do Funil | Define stages, gates e microregras — base para classificar o efeito de qualquer política (bloquear, orientar, confirmar) |

### Complementares (consultar conforme microetapa ativa)

| Código | Nome | Quando consultar |
|--------|------|-----------------|
| L05 | Topo do Funil — Parser | PR-T3.2: regras que disparam em fatos de topo |
| L07 | Meio A — Estado Civil (Parte 1) | PR-T3.2: casado civil → conjunto |
| L08 | Meio A — Estado Civil (Parte 2) | PR-T3.2: detalhes de composição por estado civil |
| L09 | Meio A — Composição Familiar (Parte 1) | PR-T3.2: solo baixa → composição |
| L10 | Meio A — Composição Familiar (Parte 2) | PR-T3.2: detalhes de composição familiar |
| L11 | Meio B — Regime e Renda (Parte 1) | PR-T3.2: autônomo → IR |
| L12 | Meio B — Regime e Renda (Parte 2) | PR-T3.2: detalhes de renda |
| L13 | Meio B — CTPS e Dependentes | PR-T3.3: composição de regras de renda |
| L14 | Meio B — Gates e Restrições | PR-T3.1 + T3.3: padrão de bloqueio de avanço |
| L15 | Especiais — Trilhos P3 / Multi | PR-T3.3: composição em cenários especiais |
| L16 | Especiais — Familiar e Variantes | PR-T3.3: variantes de elegibilidade |
| L17 | Final Operacional / Docs / Visita | PR-T3.4: veto suave na fase final |
| L19 | Memorial do Programa / Analista MCMV | PR-T3.2: estrangeiro sem RNM → bloqueio |

---

## §15 Ordem mínima de leitura da frente

Antes de executar qualquer PR de T3, ler nesta ordem:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T3 — microetapas canônicas
2. **L03** — Mapa Canônico do Funil (obrigatório, leitura completa)
3. `schema/implantation/T2_LEAD_STATE_SCHEMA_V1.md` — estrutura de entrada do engine
4. `schema/implantation/T2_POLITICA_CONFIANCA_ORIGEM.md` — confiança por origem
5. `schema/implantation/T2_RECONCILIACAO_CONFLITOS.md` — pré-condição de estado limpo
6. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §J — sequência de PRs

Para PR-T3.2 (regras críticas), adicionar à sequência:
- L07–L08 (estado civil) → L09–L10 (composição) → L11–L12 (renda) → L19 (MCMV)

Para PR-T3.3 (ordem e composição), adicionar:
- L13–L14 (gates Meio B) → L15–L16 (especiais)

Para PR-T3.4 (veto suave), adicionar:
- L17 (final operacional)

---

## §16 Quebra de PRs T3.0–T3.R

| PR | Título | Artefato principal | Dependência | Microetapa(s) do mestre |
|----|--------|--------------------|-------------|------------------------|
| PR-T3.0 | Abertura formal do contrato T3 | `CONTRATO_IMPLANTACAO_MACRO_T3.md` (este) | G2 APROVADO | — (contrato) |
| PR-T3.1 | Classes canônicas de política | `T3_CLASSES_POLITICA.md` | PR-T3.0 | Microetapa 2 — "bloquear", "desviar", "confirmar", "orientar" |
| PR-T3.2 | Regras críticas declarativas | `T3_REGRAS_CRITICAS_DECLARATIVAS.md` | PR-T3.1 | Microetapa 1 — regras mais sensíveis (casado→conjunto, autônomo→IR, solo→composição, estrangeiro→bloqueio) |
| PR-T3.3 | Ordem de avaliação e composição | `T3_ORDEM_AVALIACAO_COMPOSICAO.md` | PR-T3.2 | Microetapas 3 e 4 — ordem estável + composição simultânea |
| PR-T3.4 | Veto suave + validador | `T3_VETO_SUAVE_VALIDADOR.md` | PR-T3.3 | Microetapa 5 — veto suave + validador pós-resposta/pré-persistência |
| PR-T3.5 | Suíte de testes de regras críticas | `T3_SUITE_TESTES_REGRAS.md` | PR-T3.4 | Todas — cobertura positivo/negativo/ambíguo/colisão/regressão |
| PR-T3.R | Readiness/Closeout G3 | `READINESS_G3.md` | PR-T3.5 | — (validação e gate) |

**Regra de sequência:** cada PR só pode iniciar após a PR anterior estar merged em `main`. Nenhuma PR pode ser aberta fora de ordem.

**Proibido em qualquer PR T3:**
- Tocar `src/`, `package.json`, `wrangler.toml`
- Abrir T4 antes de G3 APROVADO
- Criar `reply_text` em qualquer saída do policy engine
- Referenciar chaves de fato não presentes em `T2_LEAD_STATE_SCHEMA_V1.md`

---

## §17 Gate G3

| Campo | Valor |
|-------|-------|
| Código | G3 |
| Nome | Policy engine funcional |
| Condição de aprovação | S1–S5 todos com smoke PASS; CA-01–CA-10 todos CUMPRIDOS; suíte de testes com ≥20 casos e 0 falhas; validador definido com checklist ≥3 itens; Bloco E presente em READINESS_G3.md |
| Condição de reprovação | Qualquer artefato S1–S5 ausente ou com seção faltante; qualquer CA marcado como NÃO CUMPRIDO; suíte com <20 casos ou falha em caso de regressão; policy engine com campo que produza `reply_text` |
| Consequência de aprovação | T4 autorizado — PR-T4.0 pode iniciar |
| Consequência de reprovação | T4 bloqueado; lista de lacunas bloqueantes publicada em READINESS_G3.md; não-bloqueantes documentadas mas não impedem G3 se CA estiverem todos CUMPRIDOS |
| Artefato de gate | `schema/implantation/READINESS_G3.md` criado por PR-T3.R |
| PR que executa o gate | PR-T3.R — Readiness/Closeout de G3 |

---

## Blocos E

### Bloco E — PR-T3.0

| Campo | Valor |
|-------|-------|
| PR | PR-T3.0 — Abertura formal do contrato T3 |
| Data | 2026-04-24 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (este documento) |
| Status | CONCLUÍDA |
| Evidência | Contrato T3 preenchido com §1–§17; skeleton substituído por corpo completo; §16 mapeia PRs T3.0–T3.R; §17 define G3 |
| Cobertura de microetapas | N/A (PR de contrato — não executa microetapa; autoriza sequência) |
| Conformidade A00-ADENDO-01 | Confirmada — nenhuma saída do engine produz `reply_text` (CA-01, CA-08) |
| Conformidade A00-ADENDO-02 | Confirmada — identidade MCMV preservada; L19 listado como complementar para regras de perfil |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente |
| Próxima PR autorizada | **PR-T3.1 — Classes canônicas de política** |
