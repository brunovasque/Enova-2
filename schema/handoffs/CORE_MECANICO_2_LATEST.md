# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                             |
|--------------------------------------------|-----------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                   |
| Data                                       | 2026-04-20T17:47:00Z                                                              |
| Estado da frente                           | contrato aberto (contrato ativo vinculante criado, sem execução funcional)        |
| Classificação da tarefa                    | governança (abertura de contrato ativo vinculante do Core Mecânico 2)             |
| Última PR relevante                        | PR desta abertura — Governança: contrato ativo vinculante do Core Mecânico 2      |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`                            |
| Recorte executado do contrato              | N/A — contrato recém-aberto, nenhuma execução contratual ainda                    |
| Pendência contratual remanescente          | Contrato inteiro em aberto — nenhum recorte executado                             |
| Houve desvio de contrato?                  | não                                                                               |
| Contrato encerrado nesta PR?               | não                                                                               |
| Item do A01 atendido                       | Fase 0 → Fase 2 — Gate 1 satisfeito, contrato do Core aberto                     |
| Próximo passo autorizado                   | Primeira PR contratual de execução do Core Mecânico 2                             |
| Próximo passo foi alterado?                | sim — de "Abrir contrato" para "Primeira PR contratual de execução"               |
| Tarefa fora de contrato?                   | não — tarefa de governança                                                        |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                           |
| Permissões Cloudflare necessárias          | nenhuma adicional                                                                 |
| Fontes de verdade consultadas              | ver seção 20 abaixo                                                               |

---

## 1. Contexto curto

O repositório da ENOVA 2 chegou à PR #13 com toda a governança documental pronta: trio-base, CODEX_WORKFLOW com 16+ etapas, camada contratual (INDEX, EXECUTION, CLOSEOUT), schemas, protocolos, bootstrap Cloudflare, pipeline de deploy, gate de PR, auto-fix, base documental do legado mestre organizada, encontrabilidade contratual e rastreabilidade de fontes operacionais.

Esta PR abre formalmente o contrato ativo do Core Mecânico 2. O contrato é uma camada operacional **vinculada** ao contrato macro (A00, A01, A02, PDF-fonte) — ele NÃO substitui, NÃO resume livremente e NÃO reinterpreta o contrato macro. O contrato trava a cláusula central de soberania conversacional (LLM soberano da fala, mecânico apenas valida estrutura/gates/facts mínimos), cria mapa de cláusulas para execução futura por etapas com âncora ao PDF-fonte, e trava regras de parada por falta de âncora contratual.

O Gate 1 do A01 ("sem contrato da frente, não começa implementação") fica satisfeito. O próximo passo autorizado passa a ser a primeira PR contratual de execução do Core.

## 2. Classificação da tarefa

**governança**

Abertura de contrato ativo vinculante do Core Mecânico 2. Nenhuma implementação funcional. Nenhum código de negócio. Criação de contrato, mapa de cláusulas e regras de execução ancorada. Atualização de _INDEX, status e handoff.

## 3. Última PR relevante

**PR #13** — Governança: encontrabilidade contratual e rastreabilidade de fontes.

## 4. O que a PR #13 fechou

- Criou `schema/CONTRACT_SOURCE_MAP.md` — ponte documental operacional.
- Adicionou seção 19 ao `schema/CODEX_WORKFLOW.md` — protocolo de descoberta contratual.
- Expandiu ESTADO HERDADO com bloco "Fontes de verdade consultadas".
- Adicionou seção 20 ao `schema/HANDOFF_SCHEMA.md`.
- Adicionou seção 17 ao `schema/STATUS_SCHEMA.md`.
- Atualizou `.github/AGENT_CONTRACT.md` com regras 20–23.

## 5. O que a PR #13 NÃO fechou

- Contrato formal do Core Mecânico 2 (fechado por esta PR).
- Transcrição do conteúdo dos legados L01–L19 (deliberadamente fora de escopo).
- Confirmação dos blocos C01–C09 (pendente — depende de leitura direta do PDF).

## 6. Diagnóstico confirmado

- `schema/contracts/_INDEX.md` mostrava Core Mecânico 2 com status "aguardando abertura" — confirmado.
- `schema/status/CORE_MECANICO_2_STATUS.md` indicava próximo passo "Abrir contrato do Core Mecânico 2" — confirmado.
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` indicava o mesmo próximo passo — confirmado.
- Todas as dependências para abertura do contrato estavam satisfeitas (trio-base, workflow, camada contratual, encontrabilidade, etc.).
- Gate 1 do A01 exigia contrato aberto antes de implementação — confirmado.
- A00, A01 e A02 foram lidos integralmente para ancorar o contrato ativo.
- CONTRACT_SCHEMA, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL foram lidos para formato e regras.
- CONTRACT_SOURCE_MAP, INDEX_LEGADO_MESTRE e source/README foram lidos para rastreabilidade de fontes.

## 7. O que foi feito (esta PR)

- Criado `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — contrato ativo vinculante com:
  - Todas as 16 seções obrigatórias do CONTRACT_SCHEMA
  - Declaração de subordinação e não-substituição do PDF-fonte
  - Precedência documental oficial com PDF-fonte como árbitro
  - Cláusula central de soberania conversacional travada (com âncoras ao A00)
  - Regra de parada contratual
  - Registro formal de abertura
- Criado `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` — mapa de cláusulas com:
  - Cláusulas do A00 aplicáveis (8 entradas)
  - Cláusulas do A01 aplicáveis (9 entradas)
  - Cláusulas dos blocos legados L03–L17 (15 entradas)
  - Ordem sugerida de execução das PRs
  - Todas as entradas com referência explícita à fonte
- Criado `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md` — regras de execução com:
  - Regra de âncora contratual obrigatória (com bloco declarativo)
  - Regra de consulta obrigatória ao PDF-fonte
  - Regra de parada por dúvida interpretativa
  - Regra de parada por expansão de escopo
  - Regra de fidelidade ao texto-fonte
  - Checklist obrigatório de toda PR de execução
  - Resumo de condições de parada (9 condições)
- Atualizado `schema/contracts/_INDEX.md` — contrato ativo registrado, status "aberto".
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md` — reflete contrato aberto, Gate 1 satisfeito, próximo passo alterado.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` — este arquivo.

## 8. O que não foi feito

- **Transcrição do conteúdo dos legados** — deliberadamente fora de escopo. O PDF existe; a transcrição bloco a bloco é tarefa separada.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.
- **Execução de recorte do contrato** — nenhuma. O contrato foi aberto, não executado.
- **Abertura de escopo funcional** — nenhuma. Esta PR é exclusivamente de governança.

## 9. O que esta PR fechou

- Contrato ativo do Core Mecânico 2 aberto em `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`.
- Mapa de cláusulas criado em `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`.
- Regras de execução ancorada criadas em `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`.
- `schema/contracts/_INDEX.md` atualizado — Core Mecânico 2 com contrato ativo.
- Gate 1 do A01 satisfeito.
- Pendência remanescente herdada da PR #2 (abertura de contrato) — **resolvida**.

## 10. O que continua pendente após esta PR

- Primeira PR contratual de execução do Core Mecânico 2 (próximo passo autorizado).
- Transcrição do conteúdo dos blocos L01–L19 do PDF para o markdown (tarefa separada).
- Confirmação de títulos, funções e frentes dos blocos C01–C09 via leitura direta do PDF.
- Implementação funcional do modelo de objectives/stages (depende de execução contratual).
- Smoke de trilho e next step autorizado (Gate 2 do A01).
- Verificação do escopo do token `CLOUDFLARE_API_TOKEN` antes do primeiro deploy real.

## 11. Esta tarefa foi fora de contrato?

**não** — classificada como `governança`.

Não havia contrato ativo do Core Mecânico 2 no momento de entrada. Esta tarefa abre o contrato. Governança documental pura, alinhada à Fase 0 → Fase 2 do A01.

Impacto no próximo passo autorizado: **alterou** — de "Abrir contrato do Core Mecânico 2" para "Primeira PR contratual de execução do Core Mecânico 2".

### 11a. Contrato ativo
`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — aberto nesta PR.

### 11b. Recorte executado do contrato
N/A — contrato recém-aberto, nenhuma execução contratual.

### 11c. Pendência contratual remanescente
Contrato inteiro em aberto — nenhum recorte executado.

### 11d. Houve desvio de contrato?
não

### 11e. Contrato encerrado nesta PR?
não

## 12. Arquivos relevantes

- `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` *(criado — contrato ativo vinculante)*
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` *(criado — mapa de cláusulas)*
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md` *(criado — regras de execução ancorada)*
- `schema/contracts/_INDEX.md` *(atualizado — contrato ativo registrado)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado — contrato aberto, Gate 1 satisfeito)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 0 → Fase 2** — o contrato do Core Mecânico 2 foi aberto. Gate 1 do A01 ("sem contrato da frente, não começa implementação") está satisfeito. A frente está autorizada a iniciar execução contratual.
- **Prioridade 1** — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.

## 14. Estado atual da frente

**contrato aberto** (contrato ativo aberto, sem execução funcional)

A frente Core Mecânico 2 possui contrato ativo vinculante aberto. Nenhuma execução funcional foi iniciada. O scaffold técnico está pronto. A governança está completa. O próximo marco é a primeira PR contratual de execução, subordinada ao contrato ativo.

## 15. Próximo passo autorizado

**Primeira PR contratual de execução do Core Mecânico 2**, subordinada ao contrato ativo, com:
- Classificação: `contratual`
- Vínculo contratual com `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
- Âncora contratual obrigatória conforme `CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`
- Recorte do `CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`
- Consulta obrigatória ao PDF-fonte para blocos legados não transcritos
- Sugestão de primeiro recorte: mapa de stages e gates (L03)

**Próximo passo alterado** — sim: de "Abrir contrato" para "Primeira PR contratual de execução".

## 16. Riscos

- **Conteúdo dos legados não transcrito** — todos os blocos L03–L17 estão "Identificado estruturalmente — não transcrito". A execução contratual depende de consulta direta ao PDF-fonte para cada bloco necessário.
- **Blocos C não confirmados** — títulos e funções dos blocos C01–C09 pendentes de confirmação via PDF.
- **Permissão do token Cloudflare** — verificar antes do primeiro deploy real.
- **Risco de drift contratual** — mitigado por: regras de execução ancorada, mapa de cláusulas, checklist obrigatório e regras de parada.

## 17. Provas

- Contrato ativo criado: `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
- Mapa de cláusulas criado: `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`
- Regras de execução criadas: `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`
- `_INDEX.md` atualizado: Core Mecânico 2 com status "aberto"
- Status atualizado: estado "contrato aberto", Gate 1 satisfeito
- Handoff atualizado: este arquivo
- Nenhuma implementação funcional aberta
- Nenhum código de negócio criado

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de governança documental. Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.

## 19. Permissões Cloudflare necessárias

```
Permissões Cloudflare necessárias: nenhuma adicional
```

Esta PR é de governança documental e não exige nova permissão operacional.

## 20. Fontes consultadas como fonte de verdade

```
Fontes de verdade consultadas (PR desta abertura):
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         Nenhum na entrada — criado nesta PR: schema/contracts/active/CONTRATO_CORE_MECANICO_2.md
  Status da frente lido:       schema/status/CORE_MECANICO_2_STATUS.md
  Handoff da frente lido:      schema/handoffs/CORE_MECANICO_2_LATEST.md (PR #13)
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  N/A — tarefa de governança; blocos legados referenciados estruturalmente
  PDF mestre consultado:       não consultado diretamente — tarefa de abertura contratual (governança)
```

---

*(Handoff histórico PR #13 e anteriores preservados abaixo para rastreabilidade)*

O repositório chegou à PR #13 com a organização documental do legado mestre concluída. A PR #13 entregou encontrabilidade contratual e rastreabilidade de fontes: CONTRACT_SOURCE_MAP.md, CODEX_WORKFLOW seção 19, ESTADO HERDADO expandido, schemas atualizados, AGENT_CONTRACT com regras de rastreabilidade.

| Campo                                      | Valor                                                                        |
|--------------------------------------------|------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                              |
| Data                                       | 2026-04-20T04:35:00Z                                                        |
| Estado da frente                           | não iniciada (gate refatorado: live files como fonte real, body como checklist) |
| Classificação da tarefa                    | governança (refactor: filosofia gate — body mínimo + live files obrigatórios)  |
| Última PR relevante                        | PR #9 — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL                        |
| Contrato ativo                             | Nenhum contrato ativo — aguardando abertura                                  |
| Recorte executado do contrato              | N/A — nenhum contrato ativo                                                  |
| Pendência contratual remanescente          | N/A — aguardando abertura do contrato                                        |
| Houve desvio de contrato?                  | não                                                                          |
| Contrato encerrado nesta PR?               | não                                                                          |
| Item do A01 atendido                       | Fase 0 — fundação documental: governança contratual formalizada              |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2                                            |
| Próximo passo foi alterado?                | não                                                                          |
| Tarefa fora de contrato?                   | não — tarefa de governança                                                   |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                      |
| Permissões Cloudflare necessárias          | nenhuma adicional                                                            |

---

## 1. Contexto curto

O repositório da ENOVA 2 chegou à PR #9 com governança documental e contratual completa (trio-base, CODEX_WORKFLOW 16 etapas, protocolos de dados, permissões Cloudflare, camada contratual). Esta PR #9 cria o gate automatizado de validação de PR e o protocolo de economia de request.

A PR #9 entrega: workflow determinístico de validação de PR (`.github/workflows/pr-governance-check.yml`), script de validação sem LLM (`scripts/validate_pr_governance.js`), e protocolo formal de economia de request (`schema/REQUEST_ECONOMY_PROTOCOL.md`). O CODEX_WORKFLOW recebe a seção 16 (economia de request). O AGENT_CONTRACT recebe regras 20-25 (economia de request). PR template, README e README_EXECUCAO recebem referências ao protocolo.

Nenhuma implementação funcional foi aberta. O próximo passo autorizado não foi alterado.

## 2. Classificação da tarefa

**governança**

Não há contrato ativo do Core Mecânico 2. Esta tarefa cria gate automatizado de validação + protocolo de economia de request. Nenhuma implementação funcional aberta. Próximo passo autorizado não alterado.

## 3. Última PR relevante

**PR #8** — Camada formal de execução contratual.

## 4. O que a PR #8 fechou

- Índice canônico de contratos ativos por frente (`schema/contracts/_INDEX.md`).
- Protocolo de execução contratual por PR (`CONTRACT_EXECUTION_PROTOCOL.md`).
- Protocolo obrigatório de encerramento de contrato (`CONTRACT_CLOSEOUT_PROTOCOL.md`).
- Workflow atualizado para 16 etapas com vínculo contratual obrigatório.
- PR template com campos de contrato, desvio e closeout.
- Agent contract com regras anti-desvio e governança contratual.

## 5. O que a PR #8 NÃO fechou

- Gate automatizado de validação de PR (entregue nesta PR #9).
- Protocolo de economia de request (entregue nesta PR #9).
- Contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).

## 6. Diagnóstico confirmado

- Não existia gate automatizado de validação de PR (sem LLM, sem custo extra).
- Não existia protocolo formal de economia de request e preferência por modelo barato.
- As regras de custo/request não estavam documentadas nem operacionalizadas.
- O CODEX_WORKFLOW não mencionava preferência por modelo barato nem proibição de automação cara.

## 7. O que foi feito (PR #9)

- Criado `.github/workflows/pr-governance-check.yml`: gate de validação determinística de PR. Executa em toda PR. Sem LLM. Sem dependências externas. Custo: zero além do GitHub Actions.
- Criado `scripts/validate_pr_governance.js`: script Node.js de validação. Sem framework. Sem dependências externas. Valida presença de campos obrigatórios (vínculo contratual, Supabase, Cloudflare, arquivos vivos, próximo passo) + gate de arquivos vivos.
- Criado `schema/REQUEST_ECONOMY_PROTOCOL.md`: princípio de escopo fechado, preferência por modelo barato, proibição de automação cara, prompts fechados, gate determinístico.
- Atualizado `schema/CODEX_WORKFLOW.md`: seção 16 (economia de request), referência ao REQUEST_ECONOMY_PROTOCOL, tabela de modelo por complexidade.
- Atualizado `.github/PULL_REQUEST_TEMPLATE.md`: campo "Disciplina de request e modelo".
- Atualizado `.github/AGENT_CONTRACT.md`: regras 20-25 de economia de request, gate automatizado.
- Atualizado `schema/README_EXECUCAO.md`: seção de economia de request.
- Atualizado `README.md`: referência ao REQUEST_ECONOMY_PROTOCOL, seção "PR Governance Gate".
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` (este arquivo).

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.

## 9. O que esta PR fechou

- Gate automatizado de validação de PR (`.github/workflows/pr-governance-check.yml`).
- Script de validação determinística sem LLM (`scripts/validate_pr_governance.js`).
- Protocolo de economia de request (`schema/REQUEST_ECONOMY_PROTOCOL.md`).
- CODEX_WORKFLOW seção 16 (economia de request, preferência por modelo barato).
- AGENT_CONTRACT regras 20-25 (economia de request, prompts fechados, gate determinístico).
- PR template: campo "Disciplina de request e modelo".
- README e README_EXECUCAO: referências ao REQUEST_ECONOMY_PROTOCOL e ao gate.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Implementação funcional do worker (após contrato aprovado).
- Verificação do escopo do token `CLOUDFLARE_API_TOKEN` antes do primeiro deploy real.

## 11. Esta tarefa foi fora de contrato?

**não** — classificada como `governança`.

Não há contrato ativo do Core Mecânico 2. Esta tarefa cria gate automatizado e protocolo de economia de request. Governança documental pura, alinhada à Fase 0 do A01.

Impacto no próximo passo autorizado: **não alterou** — próximo passo continua sendo abertura do contrato do Core Mecânico 2.

### 11a. Contrato ativo
Nenhum contrato ativo — aguardando abertura.

### 11b. Recorte executado do contrato
N/A — nenhum contrato ativo.

### 11c. Pendência contratual remanescente
N/A — aguardando abertura do contrato.

### 11d. Houve desvio de contrato?
não

### 11e. Contrato encerrado nesta PR?
não

## 12. Arquivos relevantes

- `.github/workflows/pr-governance-check.yml` *(criado — gate de validação de PR)*
- `scripts/validate_pr_governance.js` *(criado — script determinístico de validação)*
- `schema/REQUEST_ECONOMY_PROTOCOL.md` *(criado — protocolo de economia de request)*
- `schema/CODEX_WORKFLOW.md` *(atualizado — seção 16 + referência ao protocolo)*
- `.github/PULL_REQUEST_TEMPLATE.md` *(atualizado — campo de disciplina de request)*
- `.github/AGENT_CONTRACT.md` *(atualizado — regras 20-25 de economia de request)*
- `schema/README_EXECUCAO.md` *(atualizado — seção de economia de request)*
- `README.md` *(atualizado — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 0** — fundação documental: gate de validação + economia de request formalizados. O repo está preparado para bloquear drift contratual e documental de forma automática e barata.

## 14. Estado atual da frente

**não iniciada** (governance gate + economia de request concluídos)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. Toda a governança está pronta: trio-base, workflow 16 etapas, protocolos (dados, permissões, execução contratual, closeout, economia de request), schemas, bootstrap Cloudflare, pipeline de deploy, gate de PR.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Contrato ativo: colocar em `schema/contracts/active/`
- Atualizar `schema/contracts/_INDEX.md` ao abrir
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅, bootstrap Cloudflare ✅, protocolo de permissões Cloudflare ✅, pipeline de deploy ✅, camada de execução contratual ✅

**Próximo passo preservado** — igual ao definido na PR #7.

## 16. Riscos

- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado antes da abertura do contrato do Core.
- **Permissão do token Cloudflare** — Verificar antes do primeiro deploy real.

## 17. Provas

- PR #8 criada com escopo exclusivo de governança contratual.
- `schema/contracts/` criado com índice, protocolos, diretórios active/archive.
- CODEX_WORKFLOW atualizado de 11 para 16 etapas com vínculo contratual obrigatório.
- PR template atualizado com campos de contrato, desvio e closeout.
- AGENT_CONTRACT atualizado com regras anti-desvio e governança contratual.
- Schemas (HANDOFF, STATUS, CONTRACT) atualizados com campos contratuais.
- Nenhuma implementação funcional aberta.
- Nenhum contrato ativo criado — pasta active/ vazia propositalmente.
- Status e handoff atualizados.

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de governança documental. Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.

## 19. Permissões Cloudflare necessárias

```
Permissões Cloudflare necessárias: nenhuma adicional
```

Esta PR é de governança documental e não exige nova permissão operacional além das já documentadas.

---

*(Handoff histórico PR #6 preservado abaixo para rastreabilidade)*

O repositório fundador da ENOVA 2 está com governança endurecida em duas camadas: protocolo de dados persistidos do Supabase (PR #4) e bootstrap técnico mínimo de Cloudflare Workers (PR #5). Esta PR #6 adiciona a terceira camada de governança: protocolo obrigatório de permissões Cloudflare, garantindo que qualquer futura PR que passe a usar ou alterar recursos Cloudflare (Workers, KV, R2, D1, Queues, Service Bindings, Routes, Secrets, Vars, Observability) seja obrigada a declarar explicitamente se as permissões atuais bastam ou não.

A tarefa foi classificada como `governança` porque cria novo protocolo de governança operacional sem abrir implementação funcional. O próximo passo autorizado não foi alterado.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica de negócio. O próximo passo autorizado continua sendo a abertura formal do contrato.

## 2. Classificação da tarefa

**governança**

Não há contrato ativo do Core Mecânico 2. Esta tarefa cria novo protocolo de governança de permissões Cloudflare — nenhuma implementação funcional aberta, nenhum recurso real criado, nenhum token alterado. O próximo passo autorizado não foi alterado.

## 3. Última PR relevante

**PR #5** — bootstrap técnico mínimo Cloudflare Workers (wrangler.toml).

## 4. O que a PR #5 fechou

- Bootstrap técnico mínimo de Cloudflare Workers: `wrangler.toml` com ambientes canônicos.
- Preparação do repo para deploy futuro sem abrir implementação funcional.
- Documentação técnica do bootstrap (`docs/BOOTSTRAP_CLOUDFLARE.md`).
- Entrypoint placeholder mínimo (`src/worker.ts`) — honesto e explicitamente documentado.

## 5. O que a PR #5 NÃO fechou

- Protocolo de permissões Cloudflare (entregue nesta PR #6).
- Contrato formal do Core Mecânico 2 (deliberadamente fora de escopo, preservado).

## 6. Diagnóstico confirmado

- O repo tinha governança de Supabase (DATA_CHANGE_PROTOCOL) mas não tinha governança equivalente para permissões Cloudflare.
- A presença do `wrangler.toml` e do entrypoint placeholder tornava visível a necessidade: qualquer futura PR que adicione bindings, secrets, KV, R2, D1 ou outros recursos Cloudflare poderia ter a necessidade de permissão implícita.
- O risco de falha silenciosa em deploy por token insuficiente é real e previsível — deve ser documentado preventivamente.
- A criação do CLOUDFLARE_PERMISSION_PROTOCOL cobre essa lacuna no mesmo nível de clareza que o DATA_CHANGE_PROTOCOL cobre dados do Supabase.

## 7. O que foi feito (PR #6)

- Criado `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`: finalidade, precedência, escopo (Workers, KV, R2, D1, Queues, Service Bindings, Routes, Secrets, Vars, Observability), campos obrigatórios de declaração, regra de parada, regra de escopo mínimo do token, regra de não ampliar sem necessidade real, regra de aviso preventivo, exemplos, integração com CODEX_WORKFLOW.
- Atualizado `schema/CODEX_WORKFLOW.md`: ordem de leitura (item 11 = CLOUDFLARE_PERMISSION_PROTOCOL), bloco ESTADO HERDADO com campo `Permissões Cloudflare necessárias`, bloco ESTADO ENTREGUE com campo `Permissões Cloudflare necessárias`, regra de parada para necessidade não declarada, seção 11 (schemas) com novo protocolo, seção 15 (protocolo Cloudflare).
- Atualizado `.github/PULL_REQUEST_TEMPLATE.md`: seção explícita de permissões Cloudflare com campos (recurso, ação, permissões suficientes, permissões adicionais, motivo, impacto, onde ajustar).
- Atualizado `.github/AGENT_CONTRACT.md`: ESTADO HERDADO com campo Cloudflare, regras 16–19 (declaração obrigatória, proibição de permissão implícita, aviso preventivo, parada imediata), seção de schemas com novo protocolo, seção de protocolo Cloudflare.
- Atualizado `schema/HANDOFF_SCHEMA.md`: seção 19 obrigatória de permissões Cloudflare, campo no cabeçalho mínimo.
- Atualizado `schema/STATUS_SCHEMA.md`: seção 16 de permissões Cloudflare, campo no cabeçalho mínimo.
- Atualizado `schema/README_EXECUCAO.md`: seção de protocolo de permissões Cloudflare com escopo e aviso preventivo.
- Atualizado `README.md`: `CLOUDFLARE_PERMISSION_PROTOCOL.md` como documento canônico e schema de governança.
- Atualizado `schema/TASK_CLASSIFICATION.md`: obrigação universal de declaração de permissões Cloudflare em todas as classes.
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`: PR #6, classe governança, entregas atualizadas, campo Cloudflare.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` (este arquivo).

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.
- **Criação de token real** — nenhuma. Protocolo é de governança, não de execução.
- **Criação de secrets reais** — nenhuma.
- **Bindings reais (KV, R2, D1, Queues)** — nenhum.
- **Pipeline de deploy** — não aberto.
- **Alteração de token existente** — nenhuma.

## 9. O que esta PR fechou

- Protocolo obrigatório de permissões Cloudflare (`CLOUDFLARE_PERMISSION_PROTOCOL.md`).
- Rastreabilidade total de permissões: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template.
- Alinhamento da governança Cloudflare ao mesmo nível de clareza da governança Supabase.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Implementação funcional do worker (após contrato aprovado).
- Pipeline de CI/CD para deploy automatizado (após contrato aprovado).

## 11. Esta tarefa foi fora de contrato?

**não** — classificada como `governança`.

Não há contrato ativo do Core Mecânico 2, mas tarefas de governança não precisam de contrato para serem executadas. Esta tarefa não altera o próximo passo autorizado.

Impacto no próximo passo autorizado: **não alterou** — próximo passo continua sendo abertura do contrato do Core Mecânico 2.

## 12. Arquivos relevantes

- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` *(criado)*
- `schema/CODEX_WORKFLOW.md` *(atualizado — ordem de leitura, ESTADO HERDADO/ENTREGUE, regra de parada, seções 11 e 15)*
- `.github/PULL_REQUEST_TEMPLATE.md` *(atualizado — seção de permissões Cloudflare)*
- `.github/AGENT_CONTRACT.md` *(atualizado — ESTADO HERDADO, regras 16–19, seções de schemas e protocolo)*
- `schema/HANDOFF_SCHEMA.md` *(atualizado — seção 19 e cabeçalho)*
- `schema/STATUS_SCHEMA.md` *(atualizado — seção 16 e cabeçalho)*
- `schema/README_EXECUCAO.md` *(atualizado — seção de protocolo Cloudflare)*
- `README.md` *(atualizado — documento canônico e schema de governança)*
- `schema/TASK_CLASSIFICATION.md` *(atualizado — obrigação universal de declaração Cloudflare)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Governança** — endurecimento de workflow: protocolo obrigatório de permissões Cloudflare, equivalente ao DATA_CHANGE_PROTOCOL para Supabase.
- **Fase 0** — fundação documental: governança de permissões Cloudflare completa.

## 14. Estado atual da frente

**não iniciada** (bootstrap infra concluído, governança de permissões Cloudflare completa)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. O repo agora tem a infra de Cloudflare pronta e a governança de permissões Cloudflare estabelecida.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅, bootstrap Cloudflare ✅, protocolo de permissões Cloudflare ✅

**Próximo passo preservado** — igual ao definido na PR #5.

## 16. Riscos

- **Entrypoint placeholder** — `src/worker.ts` é um placeholder sem lógica. Se alguém fizer deploy antes da implementação real, o worker responderá com uma mensagem de bootstrap. Isso é intencional e documentado.
- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado antes da abertura do contrato do Core.
- **Permissões do token Cloudflare** — O token atual não foi verificado para todos os recursos que serão necessários após o contrato. Isso é esperado e intencional nesta PR de governança documental: a verificação e eventual ampliação do token só ocorrerão quando uma PR futura declarar necessidade concreta de recurso Cloudflare, seguindo o `CLOUDFLARE_PERMISSION_PROTOCOL.md`. Não há ação imediata necessária — é um risco futuro documentado preventivamente.

## 17. Provas

- PR #6 criada com escopo exclusivamente de governança de permissões Cloudflare.
- Nenhum arquivo funcional criado ou alterado.
- Nenhum token, secret ou recurso Cloudflare real criado.
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` criado com estrutura equivalente ao `DATA_CHANGE_PROTOCOL.md`.
- Todos os artefatos de governança atualizados para exigir declaração obrigatória de permissões Cloudflare.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #6.
- Mudanças em dados persistidos (Supabase): **nenhuma**.
- Permissões Cloudflare necessárias: **nenhuma adicional** (esta PR é de governança documental).

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de governança documental. Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.

## 19. Permissões Cloudflare necessárias

```
Permissões Cloudflare necessárias: nenhuma adicional
```

Esta PR é de governança documental. Nenhum recurso Cloudflare real (Workers Script, KV, R2, D1, Queues, Routes, Secrets, Vars, Bindings) foi criado, alterado ou configurado. O protocolo criado não requer permissão adicional para existir — apenas para ser aplicado em PRs futuras.

---

## 1. Contexto curto

O repositório fundador da ENOVA 2 está pronto com governança de dados persistidos endurecida (PR #4) e agora com bootstrap técnico mínimo de Cloudflare Workers (PR #5). O `wrangler.toml` foi criado com os ambientes canônicos `nv-enova-2` (produção) e `nv-enova-2-test` (teste), alinhados à Fase 1 do A01 (scaffold técnico). Um entrypoint placeholder mínimo (`src/worker.ts`) foi criado apenas para satisfazer o campo `main` do `wrangler.toml` — sem lógica de produto, sem bindings, sem arquitetura prematura.

A tarefa foi classificada como `fora_de_contrato` porque não há contrato ativo do Core Mecânico 2, mas o scaffold técnico é necessidade operacional alinhada com a Fase 1 do A01 e não altera o próximo passo autorizado.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica de negócio. O próximo passo autorizado é a abertura formal do contrato.

## 2. Classificação da tarefa

**fora_de_contrato**

Justificativa: scaffold técnico de Cloudflare Workers alinhado à Fase 1 do A01 ("abrir repo novo, scaffold técnico e shape macro do sistema"), executado antes do contrato do Core para preparar a infra de deploy sem abrir implementação funcional. O próximo passo autorizado não foi alterado.

Impacto no próximo passo autorizado: **não alterou** — o próximo passo continua sendo a abertura do contrato do Core Mecânico 2.

## 3. Última PR relevante

**PR #4** — Endurecimento de governança com protocolo obrigatório de dados persistidos (Supabase).

## 4. O que a PR #4 fechou

- DATA_CHANGE_PROTOCOL.md criado com 13 tipos canônicos, campos obrigatórios, regras de parada/rollback/compatibilidade
- CODEX_WORKFLOW.md endurecido com bloco de dados em ESTADO HERDADO e ESTADO ENTREGUE, seção 14
- Todos os artefatos de governança atualizados para exigir declaração obrigatória de dados persistidos

## 5. O que a PR #4 NÃO fechou

- Bootstrap técnico Cloudflare Workers (entregue nesta PR #5)
- Contrato formal do Core Mecânico 2 (deliberadamente fora de escopo, preservado)

## 6. Diagnóstico confirmado

- O repo estava pronto para governança mas sem nenhum arquivo de infra/deploy.
- A Fase 1 do A01 prevê scaffold técnico antes da implementação funcional.
- `wrangler.toml` é o entregável mínimo necessário para preparar o repo para Cloudflare Workers.
- Nenhuma implementação funcional, binding ou lógica de negócio foi necessária nesta etapa.

## 7. O que foi feito (PR #5)

- Criado `wrangler.toml`: `name = "nv-enova-2"`, `main = "src/worker.ts"`, `compatibility_date = "2026-04-20"`, bloco `[env.test]` com `name = "nv-enova-2-test"`. Comentários explicando prod/test, regra de main branch, ausência de bindings fictícios, e que o bootstrap não cria pipeline de deploy.
- Criado `src/worker.ts`: entrypoint placeholder mínimo. Sem lógica de produto, sem bindings, sem arquitetura prematura. Existe apenas para satisfazer o campo `main` do `wrangler.toml`. Comentários explícitos no arquivo documentando seu propósito temporário.
- Criado `docs/BOOTSTRAP_CLOUDFLARE.md`: documentação técnica curta do bootstrap — ambientes canônicos, regra de produção (main = prod), comandos futuros de deploy, o que ainda não existe, referências.
- Atualizado `README.md`: seção de bootstrap Cloudflare Workers com link para os artefatos e regra de produção.
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`: nova PR #5, classe fora_de_contrato, entregas atualizadas, pendências atualizadas.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` (este arquivo).

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.
- **Bindings, secrets, KV, R2, D1, queues, vars** — nenhum fictício adicionado.
- **Routes customizadas** — nenhuma.
- **Observability config** — nenhuma.
- **GitHub Actions / pipeline de deploy** — não aberto.
- **Integração com Supabase** — nenhuma.
- **Schema SQL real** — nenhuma tabela, coluna ou migration real criada.

## 9. O que esta PR fechou

- Bootstrap técnico mínimo de Cloudflare Workers: `wrangler.toml` com ambientes canônicos.
- Preparação do repo para deploy futuro sem abrir implementação funcional.
- Documentação técnica do bootstrap (`docs/BOOTSTRAP_CLOUDFLARE.md`).
- Entrypoint placeholder mínimo (`src/worker.ts`) — honesto e explicitamente documentado.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Implementação funcional do worker (após contrato aprovado).
- Pipeline de CI/CD para deploy automatizado (após contrato aprovado).

## 11. Esta tarefa foi fora de contrato?

**sim** — classificada como `fora_de_contrato`.

Justificativa: não há contrato ativo do Core Mecânico 2. O scaffold técnico é necessidade operacional alinhada à Fase 1 do A01, controlada e sem drift. Não abre implementação funcional, não mexe em bindings reais, não cria lógica de negócio.

Impacto no próximo passo autorizado: **não alterou** — próximo passo continua sendo abertura do contrato do Core Mecânico 2.

## 12. Arquivos relevantes

- `wrangler.toml` *(criado)*
- `src/worker.ts` *(criado — placeholder mínimo)*
- `docs/BOOTSTRAP_CLOUDFLARE.md` *(criado)*
- `README.md` *(atualizado — seção Cloudflare Workers)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 1** — Scaffold técnico: bootstrap mínimo de Cloudflare Workers. O repo está preparado para deploy com os ambientes canônicos corretos.
- **Prioridade 0 do backlog**: scaffold técnico, variáveis de ambiente e convenções de deploy avançados parcialmente.

## 14. Estado atual da frente

**não iniciada** (bootstrap infra concluído)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. O repo agora tem a infra de Cloudflare pronta para o momento em que a implementação começar.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅, bootstrap Cloudflare ✅

**Próximo passo preservado** — igual ao definido na PR #4.

## 16. Riscos

- **Entrypoint placeholder** — `src/worker.ts` é um placeholder sem lógica. Se alguém fizer deploy antes da implementação real, o worker responderá com uma mensagem de bootstrap. Isso é intencional e documentado.
- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado antes da abertura do contrato do Core.

## 17. Provas

- PR #5 criada com escopo exclusivamente de bootstrap técnico de infra.
- `wrangler.toml` com nomes canônicos `nv-enova-2` e `nv-enova-2-test`, sem bindings fictícios.
- `src/worker.ts` com stub mínimo e comentários explícitos de placeholder.
- `docs/BOOTSTRAP_CLOUDFLARE.md` documenta o que existe e o que ainda não existe.
- Nenhum arquivo de negócio, integração real, schema SQL ou pipeline foi criado.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #5.
- Mudanças em dados persistidos (Supabase): **nenhuma**.

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de scaffold técnico de infra (Cloudflare Workers). Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.
