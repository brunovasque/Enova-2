# IMPLANTACAO_MACRO_LLM_FIRST_STATUS

## Estado atual

Fase macro ativa: T1 — Constituição do agente e contrato cognitivo canônico.

Gate anterior: G0 — APROVADO em 2026-04-23 via PR-T0.R.

Gate aberto: G1 — contrato cognitivo aprovado.

Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (aberto — PR-T1.4 desbloqueada).

Base soberana: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## Ultima tarefa relevante

`PR-T1.3` — taxonomia oficial: `schema/implantation/T1_TAXONOMIA_OFICIAL.md` criado com 6 categorias
canônicas (FACTS 18 tipos em 8 grupos, OBJETIVOS 9, PENDÊNCIAS 6, CONFLITOS 4, RISCOS 8 em 5
severidades, AÇÕES 11). Todas as 48 regras T0 mapeadas. Trava LLM-first verificada: nenhum tipo
de taxonomia redige fala do cliente. Cobertura das 7 microetapas do mestre verificada. PR-T1.4 desbloqueada.

## O que a PR-T1.3 fechou

- Criou `schema/implantation/T1_TAXONOMIA_OFICIAL.md` com:
  - FACTS (18 tipos em 8 grupos): perfil pessoal, regime/renda P1, processo/composição, P2, P3,
    elegibilidade, documentação, operacional;
  - OBJETIVOS (9): coletar, confirmar, sugerir composição, orientar IR, informar CTPS, retornar ao
    trilho, avançar stage, preparar docs, handoff;
  - PENDÊNCIAS (6): slot vazio, confirmação, documento, P2 slot, P3 slot, RNM;
  - CONFLITOS (4): dado contradito, composição, processo, renda;
  - RISCOS (8 em 5 severidades): inelegibilidade restrição/RNM, renda baixa, IR autônomo, CTPS curto,
    promessa, offtrack, dados conflitantes;
  - AÇÕES (11): avançar stage, rotear special/docs/aguardando, forçar conjunto, sinalizar conflito,
    inelegibilidade, keepstage, handoff, bypass manual, rollback flag;
  - Tabela completa de mapeamento das 48 regras T0 → categorias de taxonomia;
  - Princípio canônico: "A taxonomia organiza o raciocínio — ela nunca escreve a fala";
  - Trava LLM-first: `reply_text` sempre soberano do LLM; nenhum campo de taxonomia contém texto
    dirigido ao cliente;
  - Cobertura das 7 microetapas do mestre verificada;
  - Bloco E com fechamento permitido e PR-T1.4 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.3 concluída; PR-T1.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.4 como PR atual e próximo passo.

## O que a PR-T1.3 nao fechou

- Nao criou contrato de saída do agente (PR-T1.4).
- Nao criou policy de comportamentos (PR-T1.5).
- Nao implementou LLM real.
- Nao carregou taxonomia em runtime (correto — escopo T3/T4).
- Nao alterou `src/`, `package.json`, `wrangler.toml`.

## Proximo passo autorizado

PR-T1.4 — Contrato de saída do agente (reply_text + facts + objetivo + flags + bloqueios).

Leituras obrigatórias para PR-T1.4:
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.4)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md`
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (base desta PR)
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- PR-T1.4 desbloqueada. Demais PRs T1.5–T1.R ainda bloqueadas.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## O que a PR-T1.2 fechou (historico)

- Criou `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com:
  - §1 Identidade (TOM): Enova — analista especialista Minha Casa Minha Vida, fala humana, nunca sistema;
  - §2 Papel operacional (REGRA): como o LLM recebe e usa contexto do mecânico sem expô-lo ao cliente;
  - §3 Proibições absolutas (VETO): 5 proibições declarativas sem templates de recusa;
  - §4 Condução em contextos específicos (SUGESTÃO MANDATÓRIA): 7 orientações de conduta sem scripts;
  - §5 Conhecimento especialista (REPERTÓRIO): substrato Minha Casa Minha Vida sem template de uso;
  - §6 Objetivo final: qualificar com inteligência, honestidade e naturalidade;
  - Tabela de conformidade seção × camada;
  - 7 anti-padrões explicitamente proibidos;
  - 6 cenários adversariais documentados sem execução de LLM real;
  - Cobertura de microetapas do mestre verificada;
  - Bloco E com fechamento permitido e PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.2 concluída; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.3 como próximo passo.

## O que a PR-T1.1 fechou (historico)

- Criou `schema/implantation/T1_CAMADAS_CANONICAS.md` com:
  - fundamento normativo canônico (soberania LLM na fala; soberania mecânico na regra);
  - mapa de responsabilidades por camada (proprietário, competência, proibição);
  - definição completa de cada camada: TOM (LLM soberano), REGRA (mecânico soberano),
    VETO (mecânico emite flag, LLM comunica), SUGESTÃO MANDATÓRIA (mecânico instrui→LLM executa),
    REPERTÓRIO (substrato de contexto passivo do LLM);
  - anti-padrões e travas LLM-first por camada;
  - modelo de interação ASCII (mecânico→contexto→LLM→reply_text→canal);
  - classificação completa das 48 regras T0 com camada primária e secundária;
  - sumário: TOM 3, REGRA 28, VETO 8, SUGESTÃO MANDATÓRIA 8, REPERTÓRIO L19+L03;
  - cobertura das microetapas do LEGADO_MESTRE verificada;
  - Bloco E com fechamento permitido e PR-T1.2 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.1 concluída; PR-T1.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.2 como próximo passo.

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- PR-T1.2 desbloqueada. Demais PRs T1.3–T1.R ainda bloqueadas.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## O que a PR-T1.0 fechou (historico)

- Preencheu corpo formal de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - objetivo, escopo, fora de escopo, dependências, entradas, saídas;
  - critérios de aceite (sistema LLM-first, bateria adversarial, soberania de fala);
  - provas obrigatórias;
  - bloqueios;
  - quebra de PRs T1.0–T1.R com artefatos definidos;
  - gate G1 com condições de aprovação e regra de rollback;
  - legados aplicáveis (L03/L19 obrigatórios; L04–L18 complementares);
  - referências obrigatórias (20 documentos);
  - ordem mínima de leitura: L19 → L03.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto formalmente; PR-T1.1 desbloqueada.

## O que a PR-T0.R fechou (historico)

- Criou `schema/implantation/READINESS_G0.md` com:
  - smoke documental de PR-T0.1 a PR-T0.6: todos encerrados com Bloco E;
  - 6/6 criterios de aceite T0 cumpridos;
  - analise dos 7 bloqueantes G0: RZ-TM-01 e RZ-ES-04 satisfeitos; RZ-EL-01, RZ-EL-04,
    RZ-DC-02, RZ-TE-02, RZ-TE-03 declarados com escopo T1+;
  - verificacao de coerencia entre todos os inventarios;
  - 5 limitacoes residuais estruturais declaradas;
  - decisao formal G0 APROVADO COM LIMITACOES RESIDUAIS FORMALMENTE DECLARADAS;
  - encerramento de contrato conforme CONTRACT_CLOSEOUT_PROTOCOL.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - status `encerrado`; PR-T0.R marcada como concluida; T1 autorizada.
- Copiou contrato T0 para `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (skeleton — sem corpo).
- Atualizou `schema/contracts/_INDEX.md`:
  - T0 encerrado/arquivado; T1 skeleton como proximo contrato ativo.

## O que a PR-T0.6 fechou (historico)

- Criou `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` com:
  - 39 itens em 5 classificacoes: 7 DI (desligar imediato pre-T1), 5 RO (redesenho obrigatorio),
    6 CT (convivencia temporaria shadow/canary), 14 MD (migrar e desligar), 7 RC (reaproveitamento);
  - 7 criterios de desligamento canonicos (CDC-01 a CDC-07);
  - mapa de dependencias de fallback (EP/CT-01 → SF-02 → SF-01 → PH-F03);
  - referencia cruzada com MATRIZ_RISCO (PR-T0.5) por item onde aplicavel;
  - soberania LLM-first verificada: DS-DI-01 a DS-DI-07 classificados como imediatos/proibidos;
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.6).
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.6 marcada como concluida; PR-T0.R desbloqueada.

## O que a PR-T1.0 nao fechou

- Nao escreveu prompt, taxonomia, comportamentos ou politicas (T1.1+).
- Nao implementou LLM real.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).

## Proximo passo autorizado

PR-T1.1 — Separação canônica: tom × regra × veto × sugestão × repertório.

Leituras obrigatorias para PR-T1.1:
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T1.1)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/INVENTARIO_REGRAS_T0.md`
7. `schema/implantation/READINESS_G0.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- T1 skeleton aberto. Execucao de T1 bloqueada ate PR-T1.0 preencher o corpo do contrato.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## Atualizacao 2026-04-23 — Abertura formal do contrato T1 (PR-T1.0)

Ultima tarefa relevante:
- `PR-T1.0` — contrato T1 preenchido conforme CONTRACT_SCHEMA.md; PR-T1.1 desbloqueada.

O que esta PR fechou:
- Preencheu corpo de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto.

O que esta PR nao fechou:
- Nenhum entregavel tecnico de T1 (T1.1+). Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.R (readiness e closeout do gate G0)

Ultima tarefa relevante:
- `PR-T0.R` — smoke documental de PR-T0.1 a PR-T0.6; G0 APROVADO; contrato T0 encerrado; T1 skeleton criado.

O que esta PR fechou:
- Criou `schema/implantation/READINESS_G0.md`.
- Encerrou contrato T0; arquivou em `archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou skeleton `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`.
- Atualizou `schema/contracts/_INDEX.md`: T0 encerrado, T1 skeleton ativo.

O que esta PR nao fechou:
- Nao abriu T1 com corpo. Nao implementou desligamento. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T1.0 — Abertura formal da fase T1.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.2 (inventario de regras por familia)

Ultima tarefa relevante:
- `PR-T0.2` — inventario de regras do legado em 7 familias canonicas; 48 regras com bloco legado e status.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_REGRAS_T0.md`.
- Atualizou contrato: PR-T0.2 concluida; PR-T0.3 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.4 — Inventario de canais, superficies e telemetria.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.6 (inventario de desligamento futuro e convivencia)

Ultima tarefa relevante:
- `PR-T0.6` — 39 itens em 5 classificacoes; mapa de dependencias de fallback; 7 CDC canonicos.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`.
- Atualizou contrato: PR-T0.6 concluida; PR-T0.R desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao implementou desligamento. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.R — Readiness e closeout do gate G0.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.5 (matriz de risco operacional do legado vivo)

Ultima tarefa relevante:
- `PR-T0.5` — 26 riscos em 5 categorias; 7 bloqueantes para G0; referencia cruzada PR-T0.1 a PR-T0.4.

O que esta PR fechou:
- Criou `schema/implantation/MATRIZ_RISCO_T0.md`.
- Atualizou contrato: PR-T0.5 concluida; PR-T0.6 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao implementou mitigacao. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.6 — Inventario de desligamento futuro e convivencia.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.4 (inventario de canais, superficies e telemetria)

Ultima tarefa relevante:
- `PR-T0.4` — 28 itens catalogados em 4 tipos (canal, superficie, endpoint, telemetria); bifurcacao
  E1/E2 aplicada; SF-03 fala mecanica classificada morta; fluxo de dados por canal consolidado.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`.
- Atualizou contrato: PR-T0.4 concluida; PR-T0.5 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.5 — Matriz de risco operacional do legado vivo.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.3 (inventario de parsers, heuristicas e branches de stage)

Ultima tarefa relevante:
- `PR-T0.3` — 27 pontos de decisao mecanica catalogados em 5 tipos; bloco legado e regra associada por item.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`.
- Atualizou contrato: PR-T0.3 concluida; PR-T0.4 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.4 — Inventario de canais, superficies e telemetria.

---

## Atualizacao 2026-04-23 — Adendo canônico A00-ADENDO-02 publicado

Ultima tarefa relevante:
- Governança macro — criar adendo canônico forte de soberania LLM-MCMV, amarrar à Bíblia, ao workflow e aos documentos vivos.

O que esta PR fechou:
- Criou `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): identidade da Enova 2 como atendente especialista MCMV, visão LLM-first, divisão canônica LLM × mecânico, guia de leitura T1/T3/T4/T5/T6, proibições formais, reaproveitamento correto da E1.
- Inseriu o A00-ADENDO-02 na cadeia de precedência documental do `schema/CODEX_WORKFLOW.md`.
- Inseriu leituras obrigatórias A00-ADENDO-01 e A00-ADENDO-02 no `schema/CODEX_WORKFLOW.md` e na Bíblia.
- Criou seção S0 na Bíblia com travas LLM-first explícitas para T1, T3, T4, T5 e T6.
- Atualizou `schema/contracts/_INDEX.md`, `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` e `README.md`.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2 / PR-T0.1).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- `PR-T0.1` — inventario legado vivo e mapa de aproveitamento do repo contra o mestre.
- **A PR-T0.1 deve ler obrigatoriamente o A00-ADENDO-02 antes de executar.**

---

## Historico — Atualizacao 2026-04-23 — Workflow macro amarrado operacionalmente (PR anterior)

Ultima tarefa relevante (PR anterior):
- Governanca macro — amarrar operacionalmente no `schema/CODEX_WORKFLOW.md` a Biblia de PRs, templates obrigatorios, gates T0-T7/G0-G7 e regra de excecao contratual.

O que esta PR fechou:
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de leitura previa da PR macro.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de abertura de PR via `schema/execution/PR_EXECUTION_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de fechamento com handoff via `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava formal de excecao contratual com autorizacao manual exclusiva do Vasques.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava explicita de nao pular gates T0-T7/G0-G7.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava de nao misturar escopos e a checagem final obrigatoria de coerencia Biblia + contrato ativo + handoff vivo.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo contra o mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

---

## Atualizacao 2026-04-23 — Internalizacao canonica do reaproveitamento ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no proprio repo a classificacao executiva da base da ENOVA 1 para orientar reaproveitamento sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` com consolidacao canônica interna de:
  - cognitivo util reaproveitavel;
  - mecanico estrutural util reaproveitavel;
  - mecanico de fala explicitamente proibido;
  - riscos de copia sem filtro;
  - blocos prioritarios da ENOVA 1 para absorcao futura.
- Atualizou referencia de evidencia em:
  - `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`;
  - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (PR-T0.1).
- Reforcou diretriz de uso da E1 como materia-prima futura, sem refatoracao funcional agora.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional nem migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo).

---

## Atualizacao 2026-04-23 — Internalizacao canonica do inventario do legado vivo real da ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no repositorio ENOVA 2 o inventario do legado vivo real da ENOVA 1, sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - objetivo e criterio de evidencia do inventario;
  - fluxos vivos reais;
  - stages/estados vivos reais;
  - gates vivos reais;
  - transicoes reais e ativas;
  - blocos inconclusivos;
  - blocos com padrao de residuo/stub/legado morto;
  - divergencias entre documentacao e runtime;
  - implicacoes para T0.1 e conclusao objetiva.
- Reforcou no recorte T0.1 que a internalizacao anterior de reaproveitamento e o novo inventario vivo real sao complementares.
- Atualizou referencias minimas em contrato ativo e Biblia para consolidacao de evidencia T0.1.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional ou migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0 automaticamente.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo), com foco na preparacao de readiness de G0 sem abrir escopo funcional.

---

## Atualizacao 2026-04-23 — Inventario operacional auditavel de T0.1 (continuidade documental)

Ultima tarefa relevante:
- T0 (continuidade documental de `PR-T0.1`) — consolidar matriz de rastreabilidade de fluxos/estados e declarar lacuna remanescente sem fechamento indevido de gate.

O que esta PR fechou:
- Atualizou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - matriz de rastreabilidade operacional (fluxos topo->pos-envio_docs -> bloco legado correspondente);
  - inventario de estados/campos usados com classificacao de prova;
  - checklist de cobertura de `PR-T0.1` e decisao explicita de nao fechamento automatico.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para refletir:
  - `T0-PR1` concluida;
  - `T0-PR2` em execucao (continuidade de `PR-T0.1`);
  - lacuna remanescente documentada para readiness de G0.

O que esta PR nao fechou:
- Nao encerrou `PR-T0.1`.
- Nao fechou G0.
- Nao abriu T1.
- Nao implementou alteracao funcional em runtime.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` ate eliminar a lacuna remanescente de prova para fechamento formal da etapa.
