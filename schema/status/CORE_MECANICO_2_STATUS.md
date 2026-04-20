# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | Nenhum contrato ativo — aguardando abertura                                               |
| Estado do contrato                         | aguardando abertura                                                                       |
| Última PR executou qual recorte            | N/A — nenhum contrato ativo                                                               |
| Pendência contratual                       | N/A — aguardando abertura do contrato                                                     |
| Contrato encerrado?                        | não                                                                                       |
| Item do A01                                | Fase 1 — scaffold técnico (pipeline de deploy Cloudflare concluído)                       |
| Estado atual                               | não iniciada (bootstrap infra + pipeline de deploy concluídos)                            |
| Classe da última tarefa                    | governança (PR governance gate + REQUEST_ECONOMY_PROTOCOL)                                |
| Última PR relevante                        | PR #9 — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL                                     |
| Último commit                              | Governança: camada de execução contratual + protocolos + workflow 16 etapas               |
| Pendência remanescente herdada             | Abertura de contrato formal do Core Mecânico 2 (herdada da PR #2, preservada)            |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2 (preservado — não alterado por esta infra)             |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03, L04–L17 (conforme INDEX_LEGADO_MESTRE.md)           |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare — infra herdada (PR #7) | Workers Scripts:Edit — obrigatório para deploy via wrangler (aviso preventivo ativo) |
| Permissões Cloudflare — última tarefa (PR #8) | nenhuma adicional — tarefa de governança documental                                  |
| Última atualização                         | 2026-04-20T04:00:00Z                                                                      |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

Nenhum contrato ativo — aguardando abertura.
A frente depende da conclusão da fundação documental (Fase 0) e da organização do contexto vivo do repositório para que o contrato possa ser aberto com segurança.

## 3. Item do A01

- **Fase**: Fase 1 — scaffold técnico: wrangler.toml + pipeline de deploy concluídos.
- **Próxima fase**: Abertura do contrato formal do Core Mecânico 2.
- **Prioridade do backlog**: Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.
- **Gate aplicável**: Gate 1 — sem contrato da frente, não começa implementação.

## 4. Estado atual

**não iniciada** (bootstrap infra + pipeline de deploy concluídos)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio.
O scaffold técnico (wrangler.toml + entrypoint placeholder + pipeline de deploy) está pronto.
A governança completa está pronta (trio-base, workflow, protocolos de dados e permissões Cloudflare).

## 5. Classe da última tarefa

**governança** — camada formal de execução contratual. Criação do índice de contratos, protocolo de execução contratual, protocolo de encerramento de contrato. Atualização do CODEX_WORKFLOW para 16 etapas com vínculo contratual obrigatório. Nenhuma implementação funcional aberta. Próximo passo autorizado não alterado.

## 6. Última PR relevante

PR #8 — Camada formal de execução contratual.
PR #9 — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL (esta PR).
- Criou `.github/workflows/pr-governance-check.yml` — gate de validação determinística
- Criou `scripts/validate_pr_governance.js` — script de validação (sem LLM, sem dependências externas)
- Criou `schema/REQUEST_ECONOMY_PROTOCOL.md` — protocolo de economia de request e modelo
- Atualizou CODEX_WORKFLOW com seção 16 (economia de request) e referência ao novo protocolo
- Atualizou PULL_REQUEST_TEMPLATE com campo de disciplina de request e modelo
- Atualizou AGENT_CONTRACT com regras 20-25 de economia de request
- Atualizou README_EXECUCAO com seção de economia de request
- Atualizou README com referências ao gate e ao protocolo

## 7. Último commit

Governança: PR Governance Gate + REQUEST_ECONOMY_PROTOCOL — workflow, script de validação, protocolo de economia de request, atualização de docs canônicos.

## 8. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW com protocolo obrigatório de execução (11 etapas)
- [x] TASK_CLASSIFICATION com 6 classes canônicas de tarefas
- [x] README_EXECUCAO com ordem de leitura e regras de continuidade
- [x] AGENT_CONTRACT com mandato, classificação obrigatória e regra de continuidade entre PRs
- [x] PULL_REQUEST_TEMPLATE com estado herdado, classificação, o que fecha/não fecha
- [x] CONTRACT_SCHEMA — formato obrigatório de contrato novo
- [x] STATUS_SCHEMA — formato com classe da última tarefa e pendência remanescente herdada
- [x] HANDOFF_SCHEMA — formato com classificação, PR anterior, o que fechou/não fechou
- [x] Estrutura de status vivos e handoffs
- [x] Incorporação dos legados em legado mestre unificado
- [x] DATA_CHANGE_PROTOCOL — protocolo obrigatório de mudanças em dados persistidos do Supabase
- [x] Rastreabilidade total de dados: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template
- [x] Bootstrap técnico Cloudflare Workers: `wrangler.toml` com ambientes canônicos `nv-enova-2` (prod) e `nv-enova-2-test` (test)
- [x] Entrypoint placeholder mínimo `src/worker.ts` (sem lógica de produto)
- [x] `docs/BOOTSTRAP_CLOUDFLARE.md` — documentação do bootstrap e uso local via terminal/VSCode
- [x] CLOUDFLARE_PERMISSION_PROTOCOL — protocolo obrigatório de permissões Cloudflare
- [x] Rastreabilidade total de permissões Cloudflare: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template
- [x] **Pipeline de deploy GitHub Actions** — `.github/workflows/deploy.yml`: disparo manual, test e prod, proteção de branch para prod
- [x] **Camada formal de execução contratual** — `schema/contracts/`: índice, protocolo de execução, protocolo de closeout, diretórios active/archive. CODEX_WORKFLOW 16 etapas. PR template com vínculo contratual. Agent contract com regras anti-desvio.
- [x] **PR Governance Gate** — `.github/workflows/pr-governance-check.yml` + `scripts/validate_pr_governance.js`. Validação determinística de PR sem LLM, sem custo extra. Gate valida campos obrigatórios: vínculo contratual, Supabase, Cloudflare, arquivos vivos, próximo passo.
- [x] **REQUEST_ECONOMY_PROTOCOL** — `schema/REQUEST_ECONOMY_PROTOCOL.md`. Protocolo de economia de request e preferência por modelo barato. Incorporado no CODEX_WORKFLOW (seção 16), AGENT_CONTRACT (regras 20-25), PR template, README e README_EXECUCAO.

## 9. Pendências

- [ ] Abrir contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado)
- [ ] Definir objetivos/stages do Core Mecânico 2 no contrato
- [ ] Implementação funcional do worker (após contrato aprovado)
- [ ] Verificar e ajustar escopo do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real (Workers Scripts:Edit obrigatório)

## 10. Pendência remanescente herdada

Da PR #2: abertura de contrato formal do Core Mecânico 2.
Esta pendência permanece em aberto — as PRs #3 a #8 não a afetaram.
A camada de execução contratual está pronta para receber o primeiro contrato ativo.

## 11. Bloqueios

Nenhum bloqueio ativo.
Gate 1 do A01 se aplica: sem contrato da frente, não começa implementação.

**Aviso preventivo de permissão Cloudflare:**
O token `CLOUDFLARE_API_TOKEN` deve ter permissão `Workers Scripts:Edit` para que o deploy funcione.
Verificar antes do primeiro deploy real. Ver `docs/BOOTSTRAP_CLOUDFLARE.md` e `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.

## 12. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo o formato definido em `schema/CONTRACT_SCHEMA.md`, com:
- Escopo alinhado ao A01 (Prioridade 1)
- Legados aplicáveis conforme A02 e INDEX_LEGADO_MESTRE.md (blocos L03 + L04-L17)
- Dependências satisfeitas (trio-base + workflow endurecido + contexto vivo + classificação de tarefas + protocolo de dados + bootstrap Cloudflare + protocolo de permissões Cloudflare + pipeline de deploy + camada de execução contratual)
- Contrato ativo deve ser colocado em `schema/contracts/active/`
- `schema/contracts/_INDEX.md` deve ser atualizado ao abrir o contrato

**Próximo passo preservado** em relação à PR #7.

## 13. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Blocos obrigatórios**: L03, L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 14. Última atualização

- **Data**: 2026-04-20T03:37:47Z
- **Responsável**: Copilot (PR #8 — correções de consistência documental)
