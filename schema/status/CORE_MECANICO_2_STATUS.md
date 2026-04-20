# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | Nenhum contrato ativo — aguardando abertura                                               |
| Estado do contrato                         | aguardando abertura                                                                       |
| Última PR executou qual recorte            | N/A — nenhum contrato ativo                                                               |
| Pendência contratual                       | N/A — aguardando abertura do contrato                                                     |
| Contrato encerrado?                        | não                                                                                       |
| Item do A01                                | Fase 0 — fundação documental: encontrabilidade contratual endurecida                      |
| Estado atual                               | não iniciada (base documental + encontrabilidade contratual prontas para abertura de contrato) |
| Classe da última tarefa                    | governança (encontrabilidade contratual + rastreabilidade de fontes)                      |
| Última PR relevante                        | PR #13 — Governança: encontrabilidade contratual e rastreabilidade de fontes              |
| Último commit                              | Governança: CONTRACT_SOURCE_MAP, CODEX_WORKFLOW seção 19, ESTADO HERDADO + fontes        |
| Pendência remanescente herdada             | Abertura de contrato formal do Core Mecânico 2 (herdada da PR #2, preservada)            |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2 (encontrabilidade contratual agora explícita e operacional) |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03, L04–L17 (conforme INDEX_LEGADO_MESTRE.md)           |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare — infra herdada (PR #7) | Workers Scripts:Edit — obrigatório para deploy via wrangler (aviso preventivo ativo) |
| Permissões Cloudflare — última tarefa (PR #13) | nenhuma adicional — tarefa de governança documental                                |
| Fontes consultadas — última tarefa         | ver seção 17 abaixo                                                                       |
| Última atualização                         | 2026-04-20T17:08:00Z                                                                      |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

Nenhum contrato ativo — aguardando abertura.
A frente depende da conclusão da fundação documental (Fase 0) e da organização do contexto vivo do repositório para que o contrato possa ser aberto com segurança.

## 3. Item do A01

- **Fase**: Fase 0 — fundação documental: encontrabilidade contratual endurecida.
- **Próxima fase**: Abertura do contrato formal do Core Mecânico 2.
- **Prioridade do backlog**: Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.
- **Gate aplicável**: Gate 1 — sem contrato da frente, não começa implementação.

## 4. Estado atual

**não iniciada** (bootstrap infra + pipeline de deploy + encontrabilidade contratual concluídos)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio.
O scaffold técnico (wrangler.toml + entrypoint placeholder + pipeline de deploy) está pronto.
A governança completa está pronta (trio-base, workflow, protocolos de dados e permissões Cloudflare, gate de PR, auto-fix controlado, encontrabilidade contratual e rastreabilidade de fontes).

## 5. Classe da última tarefa

**governança** — encontrabilidade contratual e rastreabilidade de fontes. Criação do `CONTRACT_SOURCE_MAP.md` (ponte documental operacional). Adição da seção 19 ao CODEX_WORKFLOW (protocolo de descoberta contratual). Expansão do ESTADO HERDADO com bloco "Fontes de verdade consultadas". Adição de seções às schemas (HANDOFF_SCHEMA seção 20, STATUS_SCHEMA seção 17). Atualização do AGENT_CONTRACT com regras 20–23 e referência ao CONTRACT_SOURCE_MAP. Nenhuma implementação funcional aberta. Próximo passo autorizado não alterado.

## 6. Última PR relevante

PR #9 — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL.
PR #10 — Auto-fix controlado do PR Governance Gate + regra @copilot+modelo.
PR #12 — Organização documental do legado mestre.
PR #13 — Encontrabilidade contratual e rastreabilidade de fontes (esta PR).
- Criou `schema/CONTRACT_SOURCE_MAP.md` — ponte documental operacional
- Adicionou seção 19 ao `schema/CODEX_WORKFLOW.md` — protocolo de descoberta contratual
- Expandiu ESTADO HERDADO com bloco "Fontes de verdade consultadas"
- Adicionou seção 20 ao `schema/HANDOFF_SCHEMA.md` — fontes consultadas
- Adicionou seção 17 ao `schema/STATUS_SCHEMA.md` — fontes consultadas
- Atualizou `.github/AGENT_CONTRACT.md` com regras 20–23 + referência ao CONTRACT_SOURCE_MAP

## 7. Último commit

Governança: encontrabilidade contratual — CONTRACT_SOURCE_MAP, CODEX_WORKFLOW seção 19, ESTADO HERDADO expandido, schemas atualizados, AGENT_CONTRACT com regras de rastreabilidade de fontes.

## 8. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW com protocolo obrigatório de execução (16 etapas + 19 seções)
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
- [x] **Auto-fix controlado do PR Governance Gate** — `.github/workflows/pr-governance-autofix.yml` + `scripts/autofix_pr_governance.js`. Auto-fix determinístico: max 3 tentativas, apenas erros triviais, sem LLM. Para obrigatoriamente em erros estruturais.
- [x] **Regra de menção obrigatória ao agente/modelo** — `@copilot+modelo` obrigatório em toda instrução operacional. Documentado em AGENT_CONTRACT (regra 26), CODEX_WORKFLOW (seção 18), README_EXECUCAO e README.
- [x] **Organização documental do legado mestre** — `schema/source/README.md` corrigido, `LEGADO_MESTRE_ENOVA1_ENOVA2.md` reorganizado com honestidade documental, `INDEX_LEGADO_MESTRE.md` transformado em índice operacional real com ordem de leitura + status granular, `CONTRACT_SCHEMA.md` expandido com campos obrigatórios de referências e blocos legados.
- [x] **Encontrabilidade contratual e rastreabilidade de fontes** — `schema/CONTRACT_SOURCE_MAP.md` criado (ponte documental operacional); CODEX_WORKFLOW seção 19 (protocolo de descoberta contratual); ESTADO HERDADO expandido com bloco de fontes; HANDOFF_SCHEMA seção 20 + STATUS_SCHEMA seção 17; AGENT_CONTRACT regras 20–23 + referência ao mapa de fontes.

## 9. Pendências

- [ ] Abrir contrato formal do Core Mecânico 2 (próximo passo autorizado — base documental + encontrabilidade contratual prontas)
- [ ] Definir objetivos/stages do Core Mecânico 2 no contrato
- [ ] Implementação funcional do worker (após contrato aprovado)
- [ ] Verificar e ajustar escopo do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real (Workers Scripts:Edit obrigatório)

## 10. Pendência remanescente herdada

Da PR #2: abertura de contrato formal do Core Mecânico 2.
Esta pendência permanece em aberto — as PRs #3 a #13 não a afetaram.
A camada de execução contratual está pronta. A base documental do legado mestre está organizada. A encontrabilidade contratual e a rastreabilidade de fontes estão agora explícitas e operacionais. O sistema está pronto para a abertura do primeiro contrato ativo.

## 11. Bloqueios

Nenhum bloqueio ativo.
Gate 1 do A01 se aplica: sem contrato da frente, não começa implementação.

**Aviso preventivo de permissão Cloudflare:**
O token `CLOUDFLARE_API_TOKEN` deve ter permissão `Workers Scripts:Edit` para que o deploy funcione.
Verificar antes do primeiro deploy real. Ver `docs/BOOTSTRAP_CLOUDFLARE.md` e `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.

## 12. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo o formato definido em `schema/CONTRACT_SCHEMA.md`, com:
- Escopo alinhado ao A01 (Prioridade 1)
- Referências obrigatórias: A00, A01, A02, CONTRACT_EXECUTION_PROTOCOL, LEGADO_MESTRE_ENOVA1_ENOVA2.md, INDEX_LEGADO_MESTRE.md, CONTRACT_SOURCE_MAP.md
- Blocos legados obrigatórios: L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17
- Blocos legados complementares: L01, L02, L18, L19, C*
- Ordem mínima de leitura: L03 → L04→L06 → L07→L10 → L11→L14 → L15→L16 → L17
- Dependências satisfeitas (trio-base + workflow + contexto vivo + protocolo de dados + bootstrap Cloudflare + protocolo de permissões + pipeline de deploy + camada contratual + gate de PR + auto-fix + base documental legado mestre + encontrabilidade contratual)
- Contrato ativo deve ser colocado em `schema/contracts/active/`
- `schema/contracts/_INDEX.md` deve ser atualizado ao abrir o contrato

**Próximo passo preservado** em relação às PRs anteriores.

## 13. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Blocos obrigatórios**: L03, L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 14. Última atualização

- **Data**: 2026-04-20T17:08:00Z
- **Responsável**: Copilot (PR #13 — encontrabilidade contratual e rastreabilidade de fontes)

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

```
Fontes de verdade consultadas — última tarefa (PR #13):
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         Nenhum — ausência é condição de parada para execução contratual
  Status da frente lido:       schema/status/CORE_MECANICO_2_STATUS.md
  Handoff da frente lido:      schema/handoffs/CORE_MECANICO_2_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  N/A — tarefa de governança pura sem consumo de regras de negócio
  PDF mestre consultado:       não consultado — tarefa de governança pura
```
