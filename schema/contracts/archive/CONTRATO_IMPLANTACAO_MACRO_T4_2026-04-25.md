# CONTRATO — T4 Orquestrador de Turno LLM-first — ENOVA 2

| Campo                             | Valor                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Frente                            | T4 — Orquestrador de turno LLM-first                                                         |
| Fase do A01                       | T4 (semanas 7–8 da implantação macro)                                                        |
| Prioridade do A01                 | 5                                                                                             |
| Dependências                      | G3 APROVADO (`schema/implantation/READINESS_G3.md`), T3 encerrado, T2 encerrado, T1 encerrado |
| Legados aplicáveis                | L03 (obrigatório); L17, L18, L19 (complementares)                                            |
| Referências obrigatórias          | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`, `schema/ADENDO_CANONICO_SOBERANIA_IA.md`, `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`, `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`, `schema/CONTRACT_SCHEMA.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`, `schema/legacy/INDEX_LEGADO_MESTRE.md`, `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção K |
| Blocos legados obrigatórios       | L03                                                                                           |
| Blocos legados complementares     | L17, L18, L19                                                                                 |
| Ordem mínima de leitura da frente | L03 → L17 (fase final/handoff) → L18 (QA/telemetria) → L19 (perfil MCMV)                    |
| Status                            | **encerrado** — G4 APROVADO em 2026-04-25 por PR-T4.R; arquivado neste arquivo              |
| Última atualização                | 2026-04-25 — encerrado por PR-T4.R                                                           |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala; mecânico jamais com prioridade de fala. O orquestrador coordena — nunca dita `reply_text`.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade MCMV; guia de leitura T4 com travas contra má interpretação: orquestrador como coordenador, nunca como casca dominante.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Bloco E obrigatório em toda PR que feche etapa.

---

## §1 Objetivo

T4 entrega o **orquestrador de turno LLM-first** da ENOVA 2: o componente que, para cada turno de atendimento, executa o pipeline completo de entrada → contexto → LLM → validação → persistência → resposta, integrando todos os artefatos declarativos de T1, T2 e T3 em um fluxo real e confiável.

O orquestrador coordena. O LLM decide e fala. O policy engine decide as ações. O reconciliador resolve o estado. O validador aprova a persistência. O orquestrador não invade nenhum desses papéis — ele conecta.

Ao final de T4, o sistema possui:
1. Padronização formal da entrada do turno (mensagem, canal, contexto, estado, políticas, objetivo).
2. Pipeline LLM com contrato único: prompt montado, LLM chamado, texto e estrutura capturados.
3. Integração policy engine + reconciliador antes de persistir: decisões de T3 aplicadas, estado reconciliado.
4. Validador pós-resposta/pré-persistência: checklist VC-01..VC-09 executado, persistência condicionada.
5. Resposta final entregue ao canal, rastro do turno registrado, métricas mínimas publicadas.
6. Fallbacks seguros: erro de modelo, formato inválido, omissão de campos, contradição séria.
7. Bateria E2E em sandbox: pipeline completo demonstrado sem lead real.
8. Readiness/Closeout G4 com smoke documental de S1–S6 e decisão formal.

O orquestrador **coordena mas não fala**. `reply_text` é sempre e exclusivamente do LLM (A00-ADENDO-01).

---

## §2 Escopo

1. Definição e documentação do schema de entrada canônico do turno (`TurnoEntrada`) com todos os campos obrigatórios e opcionais — artefato `T4_ENTRADA_TURNO.md` (PR-T4.1).
2. Definição da montagem de contexto mínimo: como o orquestrador monta o prompt a partir de `lead_state`, `policy_decisions`, `soft_vetos`, `history` e `objective` — artefato `T4_PIPELINE_LLM.md` (PR-T4.2).
3. Definição do pipeline LLM: contrato único de chamada, captura de `reply_text` e captura de `TurnoSaida` estruturada — artefato `T4_PIPELINE_LLM.md` (PR-T4.2).
4. Definição da integração pós-LLM: como `TurnoSaida` passa pelo policy engine (T3) e pelo reconciliador (T2) antes de persistir — artefato `T4_VALIDACAO_PERSISTENCIA.md` (PR-T4.3).
5. Definição da passagem pelo validador pós-resposta/pré-persistência (T3.4): como `ValidationContext` é montado, como `ValidationResult` decide sobre persistência — artefato `T4_VALIDACAO_PERSISTENCIA.md` (PR-T4.3).
6. Definição da resposta final: como `reply_text` é entregue ao canal após validação; como o rastro do turno é registrado; quais métricas mínimas são publicadas — artefato `T4_RESPOSTA_RASTRO_METRICAS.md` (PR-T4.4).
7. Definição dos fallbacks de segurança: 4 cenários de falha (erro de modelo, formato inválido, omissão de campos, contradição séria) com resposta e rastro adequados — artefato `T4_FALLBACKS.md` (PR-T4.5).
8. Bateria E2E em sandbox: mínimo 10 cenários declarativos cobrindo pipeline completo, edge cases e fallbacks — artefato `T4_BATERIA_E2E.md` (PR-T4.6).
9. Readiness/Closeout G4: smoke documental S1–S6, CA-01..CA-10 verificados, decisão G4 APROVADO ou REPROVADO — artefato `READINESS_G4.md` (PR-T4.R).
10. Atualização de `schema/status/`, `schema/handoffs/` e `schema/contracts/_INDEX.md` a cada PR.

---

## §3 Fora de escopo

- Implementação de código TypeScript/JavaScript em `src/` nas PRs T4.1–T4.5 — T4.1 a T4.5 são documentais/declarativas; T4.6 pode incluir scaffold mínimo de sandbox se necessário, dentro de escopo contratual explícito.
- Alterações em `package.json`, `wrangler.toml` ou qualquer arquivo de infraestrutura fora do escopo de sandbox declarado.
- Integração real com canal Meta/WhatsApp (T5) — proibido antes de G4.
- Migration ou alteração de schema Supabase real (requer escopo contratual próprio).
- Coleta de dados de usuário real ou execução de funil com lead real antes de G4.
- Alteração de artefatos T1, T2 ou T3 já aprovados — qualquer necessidade de ajuste deve ser tratada como revisão contratual formal.
- Criação de regras de negócio novas (escopo T3 encerrado).
- Shadow mode, canary, cutover ou rollout (escopo T5+).
- Avaliação de qualidade de LLM ou fine-tuning.
- Pipeline LLM multi-turn sem separação clara de soberania.

---

## §4 Dependências

### Dependências de gate

- **G3 APROVADO** — `schema/implantation/READINESS_G3.md` — smoke 5/5 PASS, CA-01..CA-10 CUMPRIDOS, decisão G3 APROVADO — **SATISFEITA em 2026-04-25**.
- **Contrato T3 encerrado** — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md` — **SATISFEITA em 2026-04-25**.

### Dependências de artefato (T3 — policy engine)

- `schema/implantation/T3_CLASSES_POLITICA.md` — 5 classes canônicas e shape `PolicyDecision` — **base do policy engine que T4 integra**.
- `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` — 4 regras e payloads — **regras que T4 aplica via engine**.
- `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` — pipeline 6 estágios, shape `PolicyDecisionSet` — **contrato de integração entre T4 e T3**.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` — VetoSuaveRecord, ValidationContext, checklist VC-01..VC-09 — **validador que T4 aciona pós-resposta/pré-persistência**.

### Dependências de artefato (T2 — estado e reconciliação)

- `schema/implantation/T2_LEAD_STATE_V1.md` — 11 blocos canônicos — **estado que T4 lê e atualiza**.
- `schema/implantation/T2_RECONCILIACAO.md` — 7 etapas, protocolo de resolução — **reconciliador que T4 aciona antes de persistir**.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` — origens e confiança — **pré-condição de disparo de regras**.
- `schema/implantation/T2_RESUMO_PERSISTIDO.md` — camadas L1/L2/L3/L4, snapshot — **memória que T4 alimenta**.

### Dependências de artefato (T1 — contrato cognitivo)

- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` — identidade e papel — **base do prompt que T4 monta**.
- `schema/implantation/T1_CONTRATO_SAIDA.md` — `TurnoSaida` shape — **contrato de saída do turno que T4 produz**.
- `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` — comportamentos obrigatórios — **travas que T4 preserva**.

### Dependências de frente

- T1 concluída (G1 APROVADO em 2026-04-23).
- T2 concluída (G2 APROVADO em 2026-04-24).
- T3 concluída (G3 APROVADO em 2026-04-25).

---

## §5 Entradas

Antes de iniciar qualquer PR de T4, devem existir e estar acessíveis:

| # | Artefato | Caminho | Condição de entrada |
|---|----------|---------|---------------------|
| E1 | Readiness G3 | `schema/implantation/READINESS_G3.md` | G3 APROVADO, Bloco E presente |
| E2 | Contrato T3 arquivado | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md` | ENCERRADO |
| E3 | Contrato T4 aberto | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` | ABERTO (este documento) |
| E4 | Classes de política | `schema/implantation/T3_CLASSES_POLITICA.md` | 5 classes declaradas; invariante sem reply_text |
| E5 | Ordem de avaliação | `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` | Pipeline 6 estágios; shape PolicyDecisionSet |
| E6 | Validador | `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` | VC-01..VC-09; ValidationContext; ValidationResult |
| E7 | Lead state v1 | `schema/implantation/T2_LEAD_STATE_V1.md` | 11 blocos canônicos; shape FactEntry |
| E8 | Reconciliação | `schema/implantation/T2_RECONCILIACAO.md` | 7 estados; protocolo 7 etapas |
| E9 | Contrato de saída T1 | `schema/implantation/T1_CONTRATO_SAIDA.md` | TurnoSaida shape; reply_text exclusivo do LLM |
| E10 | Bíblia Canônica §K | `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção K | PRs T4.0–T4.R mapeadas |
| E11 | Legado mestre T4 | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T4 | Microetapas do mestre acessíveis |

---

## §6 Saídas

Ao final de T4, os seguintes artefatos devem existir, ser coerentes entre si e com T1/T2/T3:

| # | Artefato | Caminho | PR que o cria | Conteúdo mínimo |
|---|----------|---------|---------------|-----------------|
| S1 | Entrada do turno | `schema/implantation/T4_ENTRADA_TURNO.md` | PR-T4.1 | Shape `TurnoEntrada` com campos canônicos; montagem de contexto mínimo; travas LLM-first na entrada |
| S2 | Pipeline LLM | `schema/implantation/T4_PIPELINE_LLM.md` | PR-T4.2 | Contrato único de chamada LLM; shape do prompt; captura de `reply_text` e `TurnoSaida` estruturada; invariante soberania LLM |
| S3 | Validação e persistência | `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` | PR-T4.3 | Montagem de `ValidationContext`; execução do validador T3.4 (VC-01..VC-09); integração policy engine T3; reconciliação T2 antes de persistir; decisão APPROVE/REJECT/PREVENT_PERSISTENCE/REQUIRE_REVISION |
| S4 | Resposta, rastro e métricas | `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` | PR-T4.4 | Entrega de `reply_text` ao canal; shape do rastro do turno (`TurnoRastro`); métricas mínimas (latência, custo_tokens, resultado_validação) |
| S5 | Fallbacks | `schema/implantation/T4_FALLBACKS.md` | PR-T4.5 | 4 cenários de falha (erro_modelo, formato_invalido, omissao_campos, contradicao_seria); resposta segura por cenário; sem reply_text mecânico dominante; rastro de falha |
| S6 | Bateria E2E sandbox | `schema/implantation/T4_BATERIA_E2E.md` | PR-T4.6 | ≥10 cenários declarativos: pipeline completo, fallbacks, borda; métricas de latência/custo declaradas; zero reply_text mecânico em nenhum resultado |
| S7 | Readiness G4 | `schema/implantation/READINESS_G4.md` | PR-T4.R | Smoke S1–S6; CA-01..CA-10 verificados; decisão G4 APROVADO ou REPROVADO; Bloco E |

---

## §7 Critérios de aceite

| # | Critério | Verificação |
|---|----------|-------------|
| CA-01 | **Orquestrador coordena, nunca fala** — `reply_text` é exclusivamente do LLM; nenhum componente do orquestrador produz ou substitui `reply_text` | Inspeção de S1–S6: ausência de campos `reply_text`, `mensagem_usuario`, `texto_cliente` ou equivalentes em qualquer output do orquestrador, policy engine, reconciliador ou validador |
| CA-02 | **Entrada do turno padronizada** — `TurnoEntrada` tem schema definido com todos os campos obrigatórios | S1 define shape `TurnoEntrada` com pelo menos: `message_text`, `channel`, `lead_state`, `turn_id`, `case_id`, `current_objective`; campos opcionais documentados |
| CA-03 | **Pipeline LLM com contrato único** — uma única chamada LLM por turno; captura de `reply_text` e `TurnoSaida` estruturada | S2 define exatamente 1 ponto de chamada LLM por turno; shape do prompt padronizado; `reply_text` nunca sobrescrito pós-LLM |
| CA-04 | **Policy engine integrado antes de persistir** — `PolicyDecisionSet` aplicado ao estado antes de qualquer persistência | S3 declara que policy engine (T3) é executado; decisões em `decisions[]` são aplicadas; `soft_vetos[]` são passados como contexto ao LLM |
| CA-05 | **Validador executado pós-resposta/pré-persistência** — VC-01..VC-09 verificados; apenas APPROVE ou REQUIRE_REVISION com advisory permitem persistência normal | S3 declara que validador T3.4 é executado com `ValidationContext` completo; REJECT e PREVENT_PERSISTENCE bloqueiam persistência; decisão registrada em `validation_log` |
| CA-06 | **Reconciliação executada antes de persistir** — estado reconciliado segundo T2_RECONCILIACAO antes de atualizar `lead_state` | S3 declara que reconciliador T2 é acionado; conflitos resolvidos antes da persistência; nenhum fact persiste como `confirmed` sem reconciliação explícita |
| CA-07 | **Rastro do turno registrado** — `TurnoRastro` com campos mínimos para auditabilidade e telemetria | S4 define shape `TurnoRastro` com: `turn_id`, `case_id`, `channel`, `policy_decisions_applied`, `validation_result`, `facts_persisted`, `latency_ms`, `tokens_used`, `timestamp` |
| CA-08 | **Fallbacks seguros cobertos** — 4 cenários de falha declarados com resposta adequada | S5 cobre: erro_modelo (timeout/indisponibilidade), formato_invalido (TurnoSaida malformada), omissao_campos (campo obrigatório ausente), contradicao_seria (fato contradiz estado confirmado); nenhum fallback produz reply_text mecânico dominante |
| CA-09 | **Bateria E2E declarativa com ≥10 cenários** | S6 contém ≥10 cenários declarativos com TurnoEntrada, resultado esperado, validação do rastro, métrica de latência/custo declarada |
| CA-10 | **G4 decidido com Bloco E e evidência formal** | READINESS_G4.md contém smoke S1–S6, CA-01..CA-09 verificados, decisão G4 APROVADO ou REPROVADO, Bloco E presente |

---

## §8 Provas obrigatórias

Cada PR de T4 deve apresentar:

| Prova | Descrição |
|-------|-----------|
| P-T4-01 | Diff do artefato criado — inspeção linha a linha que confirma ausência de `reply_text` em qualquer output do orquestrador; `reply_text` apenas como campo recebido do LLM |
| P-T4-02 | Referências cruzadas — cada campo de `TurnoEntrada` e `ValidationContext` aponta para campo canônico existente em `T2_LEAD_STATE_V1.md` ou `T1_CONTRATO_SAIDA.md` |
| P-T4-03 | Cobertura do pipeline — declaração explícita em cada PR de qual(is) microetapa(s) do mestre T4 é coberta |
| P-T4-04 | Contagem de cenários E2E (PR-T4.6) — total ≥10; breakdown por tipo (pipeline_completo / fallback / borda) |
| P-T4-05 | Smoke coerência (PR-T4.R) — checklist de 6 artefatos S1–S6 com status PASS/FAIL + justificativa por dimensão |

---

## §9 Bloqueios

| # | Bloqueio | Condição de desbloqueio |
|---|----------|------------------------|
| B-01 | **G3 não aprovado** — T4 não pode ser aberta sem G3 APROVADO | `READINESS_G3.md` com decisão G3 APROVADO — **DESBLOQUEADO em 2026-04-25** |
| B-02 | **Contrato T3 não encerrado** — orquestrador não pode integrar policy engine sem artefatos T3 formais | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md` presente — **DESBLOQUEADO em 2026-04-25** |
| B-03 | **PR fora de sequência** — nenhuma PR-T4.N pode iniciar sem a PR-T4.(N-1) concluída e merged | Branch principal atualizado; PR anterior com status `merged` |
| B-04 | **Implementação em `src/` sem escopo declarado** — qualquer código funcional em `src/` fora do escopo de sandbox declarado em PR-T4.6 viola este contrato | Bloqueio ativo; requer revisão contratual formal se escopo precisar ser expandido |
| B-05 | **Abertura de T5** — T5 não pode ser iniciado antes de G4 APROVADO | `READINESS_G4.md` com decisão G4 APROVADO — bloqueio ativo até PR-T4.R |
| B-06 | **LLM-first violado** — nenhuma PR pode criar mecanismo que escreva `reply_text` fora do LLM | Bloqueio permanente; qualquer PR que violate A00-ADENDO-01 é não conforme |

---

## §10 Sequência T4 — ENCERRADA

**Todas as PRs da frente T4 foram concluídas e G4 foi aprovado.**

| PR | Status | Artefato |
|----|--------|----------|
| PR-T4.0 (#105) | MERGED | `CONTRATO_IMPLANTACAO_MACRO_T4.md` |
| PR-T4.1 (#106) | MERGED | `T4_ENTRADA_TURNO.md` |
| PR-T4.2 (#107) | MERGED | `T4_PIPELINE_LLM.md` |
| PR-T4.3 (#108) | MERGED | `T4_VALIDACAO_PERSISTENCIA.md` |
| PR-T4.4 (#109) | MERGED | `T4_RESPOSTA_RASTRO_METRICAS.md` |
| PR-T4.5 (#110) | MERGED | `T4_FALLBACKS.md` |
| PR-T4.6 (#111) | MERGED | `T4_BATERIA_E2E.md` |
| PR-T4.R (#112) | MERGED | `READINESS_G4.md` |

**Próximo contrato autorizado: PR-T5.0 — Abertura formal do contrato T5**
- Skeleton: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md`
- Referência: `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §L

---

## §11 Relação com o A01

| Campo A01 | Valor |
|-----------|-------|
| Fase      | T4 — Semanas 7–8 |
| Prioridade | 5 |
| Gate de entrada | G3 APROVADO |
| Gate de saída | G4 — orquestrador funcional + pipeline completo + fallbacks + E2E sandbox |
| Épico do mestre | "Orquestrador de turno LLM-first: padronizar entrada, executar LLM, validar, persistir, registrar" |
| Posição na cadeia | T1 (cognitivo) → T2 (estado) → T3 (políticas) → **T4 (orquestrador)** → T5 (migração funil) |

---

## §12 Relação com legados aplicáveis

| Legado | Relevância para T4 | Uso por PR |
|--------|-------------------|------------|
| L03 — Mapa Canônico do Funil | **Obrigatório** — stages, gates e transições do funil; base para entender o que é "um turno" no contexto do fluxo real | Todas as PRs T4.1–T4.R |
| L17 — Final Operacional / Docs / Visita | Complementar — fase final do funil; handoff; contexto de persistência segura; rastro antes do handoff | PR-T4.4 (rastro + resposta) e PR-T4.3 (persistência) |
| L18 — Runner / QA / Telemetria | Complementar — matriz de teste, critérios de aceite, observabilidade; base para bateria E2E e métricas | PR-T4.6 (bateria E2E) e PR-T4.R |
| L19 — Memorial MCMV | Complementar — regras substantivas MCMV por perfil; relevante para fallback quando LLM produz resposta inconsistente com o programa | PR-T4.5 (fallbacks) |

---

## §13 Referências

| Documento | Finalidade |
|-----------|-----------|
| `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T4 | Fonte canônica das microetapas obrigatórias de T4 |
| `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §K | Definição e sequência de PRs T4.0–T4.R |
| `schema/CONTRACT_SCHEMA.md` | Formato canônico — estrutura seguida neste contrato |
| `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` | Regras de execução contratual — imutabilidade de escopo |
| `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` | Protocolo formal de encerramento — obrigatório em PR-T4.R |
| `schema/implantation/READINESS_G3.md` | Gate de entrada T4 — G3 APROVADO com Bloco E |
| `schema/implantation/T3_CLASSES_POLITICA.md` | Classes de política que T4 integra |
| `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` | Pipeline e PolicyDecisionSet que T4 consome |
| `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` | Validador que T4 aciona; ValidationContext; VC-01..VC-09 |
| `schema/implantation/T2_LEAD_STATE_V1.md` | Estado que T4 lê, alimenta e persiste |
| `schema/implantation/T2_RECONCILIACAO.md` | Reconciliador que T4 aciona pré-persistência |
| `schema/implantation/T2_RESUMO_PERSISTIDO.md` | Camadas de memória que T4 alimenta pós-persistência |
| `schema/implantation/T1_CONTRATO_SAIDA.md` | Shape `TurnoSaida` produzido por T4 |
| `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` | Base do prompt que T4 monta para o LLM |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | A00-ADENDO-01 — LLM soberano; orquestrador nunca fala |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | A00-ADENDO-02 — identidade MCMV; orquestrador como coordenador, não casca |
| `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` | A00-ADENDO-03 — Bloco E obrigatório em toda PR que fecha etapa |

---

## §14 Blocos legados aplicáveis

### Obrigatórios (devem ser lidos antes de qualquer execução T4)

| Código | Nome | Razão de obrigatoriedade |
|--------|------|--------------------------|
| L03 | Mapa Canônico do Funil | Define stages, gates e transições — base para entender o que um turno representa no fluxo real do funil MCMV; sem L03 não há contexto de "quando persistir" e "quando bloquear" |

### Complementares (consultar conforme microetapa ativa)

| Código | Nome | Quando consultar |
|--------|------|-----------------|
| L17 | Final Operacional / Docs / Visita | PR-T4.3 (persistência) e PR-T4.4 (rastro + resposta): entender handoff de fase final |
| L18 | Runner / QA / Telemetria | PR-T4.6 (bateria E2E): critérios de aceite de QA, matriz de observabilidade |
| L19 | Memorial do Programa / Analista MCMV | PR-T4.5 (fallbacks): casos onde resposta do LLM pode ser inconsistente com regras do programa |

---

## §15 Ordem mínima de leitura da frente

Antes de executar qualquer PR de T4, ler nesta ordem:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T4 — microetapas canônicas
2. **L03** — Mapa Canônico do Funil (obrigatório, leitura completa)
3. `schema/implantation/READINESS_G3.md` — gate de entrada e estado aprovado de T3
4. `schema/implantation/T3_CLASSES_POLITICA.md` + `T3_ORDEM_AVALIACAO_COMPOSICAO.md` + `T3_VETO_SUAVE_VALIDADOR.md` — artefatos T3 que T4 integra
5. `schema/implantation/T2_LEAD_STATE_V1.md` + `T2_RECONCILIACAO.md` — estado e reconciliação que T4 consome
6. `schema/implantation/T1_CONTRATO_SAIDA.md` + `T1_SYSTEM_PROMPT_CANONICO.md` — contrato de saída e prompt base
7. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §K — sequência de PRs

Para PR-T4.4 (resposta, rastro, métricas), adicionar:
- L17 (Final Operacional)

Para PR-T4.5 (fallbacks), adicionar:
- L19 (Memorial MCMV — casos limite)

Para PR-T4.6 (bateria E2E), adicionar:
- L18 (Runner / QA / Telemetria)

---

## §16 Quebra de PRs T4.0–T4.R

| PR | Título | Artefato principal | Dependência | Microetapa(s) do mestre |
|----|--------|--------------------|-------------|------------------------|
| PR-T4.0 | Abertura formal do contrato T4 | `CONTRATO_IMPLANTACAO_MACRO_T4.md` (este) | G3 APROVADO | — (contrato) |
| PR-T4.1 | Padronização da entrada do turno | `T4_ENTRADA_TURNO.md` | PR-T4.0 | Microetapa 1 — "Padronizar a entrada (mensagem, anexos, canal, contexto resumido, estado, políticas, objetivo)" |
| PR-T4.2 | Pipeline LLM com contrato único | `T4_PIPELINE_LLM.md` | PR-T4.1 | Microetapa 2 — "Executar LLM com contrato único e capturar tanto o texto quanto a estrutura" |
| PR-T4.3 | Validação policy + reconciliação antes de persistir | `T4_VALIDACAO_PERSISTENCIA.md` | PR-T4.2 | Microetapa 3 — "Passar a saída pelo policy engine e pelo reconciliador de estado antes de persistir" |
| PR-T4.4 | Resposta final + rastro + métricas mínimas | `T4_RESPOSTA_RASTRO_METRICAS.md` | PR-T4.3 | Microetapa 4 — "Gerar resposta final, registrar rastro e publicar métricas mínimas" |
| PR-T4.5 | Fallbacks de segurança | `T4_FALLBACKS.md` | PR-T4.4 | Microetapa 5 — "Fallbacks para erro de modelo, formato inválido, omissão de campos, contradição séria" |
| PR-T4.6 | Bateria E2E sandbox + latência/custo | `T4_BATERIA_E2E.md` | PR-T4.5 | Todas — cobertura E2E do pipeline completo + métricas |
| PR-T4.R | Readiness/Closeout G4 | `READINESS_G4.md` | PR-T4.6 | — (validação e gate) |

**Regra de sequência:** cada PR só pode iniciar após a PR anterior estar merged em `main`.

**Proibido em qualquer PR T4:**
- Criar `reply_text` em qualquer output do orquestrador, policy engine, reconciliador ou validador
- Abrir T5 antes de G4 APROVADO
- Referenciar chaves de fato não presentes em `T2_LEAD_STATE_V1.md`
- Alterar artefatos T1, T2 ou T3 já aprovados

---

## §17 Gate G4

| Campo | Valor |
|-------|-------|
| Código | G4 |
| Nome | Orquestrador de turno funcional |
| Condição de aprovação | S1–S6 todos com smoke PASS; CA-01..CA-10 todos CUMPRIDOS; bateria E2E com ≥10 cenários declarativos; pipeline completo de turno demonstrado; fallbacks cobertos; Bloco E presente em READINESS_G4.md |
| Condição de reprovação | Qualquer artefato S1–S6 ausente ou com seção faltante; qualquer CA marcado como NÃO CUMPRIDO; orquestrador com campo que produza `reply_text`; fallback que retorna texto mecânico dominante; bateria com <10 cenários |
| Consequência de aprovação | T5 autorizado — PR-T5.0 pode iniciar |
| Consequência de reprovação | T5 bloqueado; lista de lacunas bloqueantes publicada em READINESS_G4.md; não-bloqueantes documentadas |
| Artefato de gate | `schema/implantation/READINESS_G4.md` criado por PR-T4.R |
| PR que executa o gate | PR-T4.R — Readiness/Closeout de G4 |

---

## Bloco E — PR-T4.0

| Campo | Valor |
|-------|-------|
| PR | PR-T4.0 — Abertura formal do contrato T4 |
| Data | 2026-04-25 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (este documento) |
| Status | CONCLUÍDA |
| Evidência | Contrato T4 preenchido com §1–§17 + Bloco E; skeleton substituído por corpo completo; §16 mapeia PRs T4.0–T4.R; §17 define G4 com condições de aprovação/reprovação; todas as dependências T1/T2/T3 declaradas |
| Cobertura de microetapas | N/A (PR de contrato — não executa microetapa; autoriza sequência PR-T4.1–T4.R) |
| Conformidade A00-ADENDO-01 | Confirmada — CA-01 e CA-03 garantem que nenhum output do orquestrador produz `reply_text`; LLM soberano na fala |
| Conformidade A00-ADENDO-02 | Confirmada — orquestrador posicionado como coordenador, não casca dominante; identidade MCMV preservada; B-06 proíbe violação de soberania |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente |
| Próxima PR autorizada | **PR-T4.1 — Padronização da entrada do turno** |

---

## Bloco E — PR-T4.R (Encerramento)

| Campo | Valor |
|-------|-------|
| PR | PR-T4.R — Readiness/Closeout G4 (PR #112) |
| Data | 2026-04-25 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/implantation/READINESS_G4.md`; `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` (skeleton); este arquivo (arquivo histórico de T4) |
| Status | CONCLUÍDA — contrato T4 ENCERRADO |
| Evidência | Smoke S1–S6 PASS (6/6); CA-01..CA-10 CUMPRIDOS (10/10); 0 lacunas bloqueantes; 5 LNB documentadas; G4 APROVADO; contrato arquivado em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md` |
| Cobertura de microetapas | N/A (PR de readiness/closeout — valida e encerra frente T4) |
| Conformidade A00-ADENDO-01 | Confirmada — zero reply_text mecânico em todos os artefatos T4 verificados |
| Conformidade A00-ADENDO-02 | Confirmada — orquestrador posicionado como coordenador em todos os artefatos S1–S6 |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente em READINESS_G4.md e neste encerramento |
| Próxima PR autorizada | **PR-T5.0 — Abertura formal do contrato T5** |
