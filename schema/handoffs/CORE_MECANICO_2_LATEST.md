# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                        |
|--------------------------------------------|------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                              |
| Data                                       | 2026-04-20T14:03:00Z                                                        |
| Estado da frente                           | não iniciada (base documental organizada — pronta para abertura de contrato)|
| Classificação da tarefa                    | governança (organização documental — legado mestre + schema de contrato)    |
| Última PR relevante                        | PR #12 — Organização documental do legado mestre para contrato do Core      |
| Contrato ativo                             | Nenhum contrato ativo — aguardando abertura                                  |
| Recorte executado do contrato              | N/A — nenhum contrato ativo                                                  |
| Pendência contratual remanescente          | N/A — aguardando abertura do contrato                                        |
| Houve desvio de contrato?                  | não                                                                          |
| Contrato encerrado nesta PR?               | não                                                                          |
| Item do A01 atendido                       | Fase 0 — fundação documental: legado mestre organizado corretamente         |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2                                            |
| Próximo passo foi alterado?                | não                                                                          |
| Tarefa fora de contrato?                   | não — tarefa de governança                                                   |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                      |
| Permissões Cloudflare necessárias          | nenhuma adicional                                                            |

---

## 1. Contexto curto

O repositório da ENOVA 2 chegou à PR #10 com governança completa (gate de PR + auto-fix controlado + regra de menção obrigatória ao agente/modelo). Esta PR #12 corrige a organização documental do legado mestre, que estava desalinhada: o PDF real já existia no repo mas o source README ainda dizia "PENDENTE DE UPLOAD", o legado mestre markdown estava em estado genérico/enganoso, e o INDEX não tinha estrutura operacional real.

A PR #12 entrega: `schema/source/README.md` corrigido para refletir que o PDF existe; `LEGADO_MESTRE_ENOVA1_ENOVA2.md` reorganizado com honestidade documental (identificado estruturalmente, não transcrito); `INDEX_LEGADO_MESTRE.md` transformado em índice operacional real com colunas de ordem de leitura, status granular e observações; `CONTRACT_SCHEMA.md` expandido com três novos campos obrigatórios (seções 14, 15, 16).

Nenhuma implementação funcional foi aberta. O próximo passo autorizado não foi alterado.

## 2. Classificação da tarefa

**governança**

Não há contrato ativo do Core Mecânico 2. Esta tarefa organiza corretamente a base documental do legado mestre (source README, legado markdown, índice operacional e schema de contrato). Nenhuma implementação funcional aberta. Próximo passo autorizado não alterado.

## 3. Última PR relevante

**PR #10** — Auto-fix controlado do PR Governance Gate + regra @copilot+modelo.

## 4. O que a PR #10 fechou

- Auto-fix controlado do PR Governance Gate (`.github/workflows/pr-governance-autofix.yml`).
- Script determinístico de auto-fix (`scripts/autofix_pr_governance.js`).
- Regra de menção obrigatória ao agente/modelo (`@copilot+modelo`).
- CODEX_WORKFLOW seções 17 e 18.
- AGENT_CONTRACT regra 26.

## 5. O que a PR #10 NÃO fechou

- Organização correta da base documental do legado mestre (entregue nesta PR #12).
- Contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).

## 6. Diagnóstico confirmado

- `schema/source/README.md` ainda dizia "PENDENTE DE UPLOAD" mesmo com o PDF presente.
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` estava em estado genérico/enganoso: todos os 28 blocos com placeholder idêntico sem distinguir estrutura identificada de conteúdo não transcrito.
- `schema/legacy/INDEX_LEGADO_MESTRE.md` não tinha coluna de ordem de leitura, status granular nem observações operacionais reais.
- `schema/CONTRACT_SCHEMA.md` não exigia campos de referências obrigatórias, blocos legados aplicáveis nem ordem mínima de leitura da frente.

## 7. O que foi feito (PR #12)

- Corrigido `schema/source/README.md`: reflete que PDF existe, é fonte bruta canônica, alimenta legado operacional e contratos futuros.
- Reorganizado `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`: estado honesto — blocos L01–L19 "identificados estruturalmente, não transcritos"; blocos C01–C09 "estrutura reservada, não confirmados". Instrução para referenciar PDF diretamente quando bloco não transcrito.
- Transformado `schema/legacy/INDEX_LEGADO_MESTRE.md` em índice operacional real: adicionadas colunas de ordem de leitura na frente, status granular (4 níveis), observações por bloco; tabela de amarração expandida com coluna de ordem mínima de leitura por frente; regra de consulta atualizada para declarar blocos no contrato.
- Atualizado `schema/CONTRACT_SCHEMA.md`: seção 14 (Referências obrigatórias), seção 15 (Blocos legados aplicáveis — obrigatórios e complementares), seção 16 (Ordem mínima de leitura da frente); exemplo de cabeçalho mínimo expandido com os novos campos obrigatórios.

## 8. O que não foi feito

- **Transcrição do conteúdo dos legados** — deliberadamente fora de escopo. O PDF existe; a transcrição bloco a bloco é uma tarefa separada.
- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.

## 9. O que esta PR fechou

- `schema/source/README.md` corrigido — reflete existência real do PDF.
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` reorganizado com honestidade documental.
- `schema/legacy/INDEX_LEGADO_MESTRE.md` transformado em índice operacional real.
- `schema/CONTRACT_SCHEMA.md` expandido com seções 14–16 e cabeçalho mínimo atualizado.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição do conteúdo dos blocos L01–L19 do PDF para o markdown (bloco a bloco, fidelidade obrigatória).
- Confirmação de títulos, funções e frentes dos blocos C01–C09 via leitura direta do PDF.
- Implementação funcional do worker (após contrato aprovado).
- Verificação do escopo do token `CLOUDFLARE_API_TOKEN` antes do primeiro deploy real.

## 11. Esta tarefa foi fora de contrato?

**não** — classificada como `governança`.

Não há contrato ativo do Core Mecânico 2. Esta tarefa organiza corretamente a base documental do legado mestre. Governança documental pura, alinhada à Fase 0 do A01.

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

- `schema/source/README.md` *(corrigido — reflete existência real do PDF)*
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` *(reorganizado — honestidade documental)*
- `schema/legacy/INDEX_LEGADO_MESTRE.md` *(transformado em índice operacional real)*
- `schema/CONTRACT_SCHEMA.md` *(expandido — seções 14-16 + cabeçalho mínimo atualizado)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 0** — fundação documental: legado mestre organizado corretamente para abertura do primeiro contrato ativo do Core Mecânico 2.

## 14. Estado atual da frente

**não iniciada** (base documental organizada — pronta para abertura de contrato)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. Toda a governança está pronta: trio-base, workflow 16+ etapas, protocolos (dados, permissões, execução contratual, closeout, economia de request), schemas, bootstrap Cloudflare, pipeline de deploy, gate de PR, auto-fix controlado, regra de menção ao agente. **A base documental do legado mestre agora está corretamente organizada para abertura do contrato.**

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md` (seções 1–16 obrigatórias)
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Referências obrigatórias (seção 14): A00, A01, A02, CONTRACT_EXECUTION_PROTOCOL, LEGADO_MESTRE_ENOVA1_ENOVA2.md, INDEX_LEGADO_MESTRE.md
- Blocos legados obrigatórios (seção 15): L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17
- Blocos legados complementares (seção 15): L01, L02, L18, L19, C*
- Ordem mínima de leitura (seção 16): L03 → L04→L06 → L07→L10 → L11→L14 → L15→L16 → L17
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Contrato ativo: colocar em `schema/contracts/active/`
- Atualizar `schema/contracts/_INDEX.md` ao abrir
- Dependências: trio-base ✅, workflow ✅, contexto vivo ✅, protocolo de dados ✅, bootstrap Cloudflare ✅, protocolo de permissões ✅, pipeline de deploy ✅, camada contratual ✅, gate de PR ✅, auto-fix controlado ✅, base documental legado mestre ✅

**Próximo passo preservado** — não alterado por esta PR.

## 16. Riscos

- **Conteúdo dos legados não transcrito** — os blocos L01–L19 estão identificados estruturalmente mas não transcritos. A referência ao PDF é suficiente para abertura do contrato; transcrição completa é desejável mas não é pré-requisito do contrato.
- **Blocos C não confirmados** — títulos e funções dos blocos C01–C09 dependem de leitura direta do PDF; não incluir nos campos obrigatórios do contrato até confirmação.
- **Permissão do token Cloudflare** — verificar antes do primeiro deploy real.

## 17. Provas

- PR #12 criada com escopo exclusivo de organização documental.
- `schema/source/README.md` corrigido — "PENDENTE DE UPLOAD" removido, PDF declarado como presente.
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — todos os 28 blocos atualizados com honestidade documental.
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — colunas de ordem de leitura, status granular e observações adicionadas.
- `schema/CONTRACT_SCHEMA.md` — seções 14, 15, 16 e cabeçalho mínimo expandido adicionados.
- Nenhuma implementação funcional aberta.
- Nenhum contrato ativo criado.
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

*(Handoff histórico PR #9 preservado abaixo para rastreabilidade)*

O repositório chegou à PR #9 com gate de PR automatizado e REQUEST_ECONOMY_PROTOCOL. A PR #9 entregou: workflow determinístico de validação de PR, script de validação sem LLM, e protocolo formal de economia de request. O CODEX_WORKFLOW recebeu a seção 16 (economia de request). O AGENT_CONTRACT recebeu regras 20-25 (economia de request). PR template, README e README_EXECUCAO foram atualizados.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica de negócio. O próximo passo autorizado continua sendo a abertura formal do contrato.

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
