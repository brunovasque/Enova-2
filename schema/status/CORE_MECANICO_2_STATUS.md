# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`                                    |
| Estado do contrato                         | aberto                                                                                    |
| Última PR executou qual recorte            | N/A — contrato recém-aberto, nenhuma execução contratual ainda                            |
| Pendência contratual                       | Contrato inteiro em aberto — nenhum recorte executado                                     |
| Contrato encerrado?                        | não                                                                                       |
| Item do A01                                | Fase 0 → Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | contrato aberto (contrato ativo aberto, sem execução funcional)                           |
| Classe da última tarefa                    | governança (abertura de contrato ativo vinculante do Core Mecânico 2)                     |
| Última PR relevante                        | PR desta abertura — Governança: contrato ativo vinculante do Core Mecânico 2              |
| Último commit                              | Governança: contrato ativo do Core Mecânico 2 + CLAUSE_MAP + EXECUTION_RULES              |
| Pendência remanescente herdada             | Nenhuma — pendência de abertura de contrato (herdada da PR #2) foi resolvida por esta PR  |
| Próximo passo autorizado                   | Primeira PR contratual de execução do Core Mecânico 2 (alterado — contrato agora aberto)  |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03, L04–L17 (conforme INDEX_LEGADO_MESTRE.md)           |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare — infra herdada (PR #7) | Workers Scripts:Edit — obrigatório para deploy via wrangler (aviso preventivo ativo) |
| Permissões Cloudflare — última tarefa      | nenhuma adicional — tarefa de governança documental                                       |
| Fontes consultadas — última tarefa         | ver seção 17 abaixo                                                                       |
| Última atualização                         | 2026-04-20T17:47:00Z                                                                      |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — aberto em 2026-04-20T17:47:00Z.

O contrato ativo é uma camada operacional vinculada ao contrato macro (A00, A01, A02, PDF-fonte).
Ele não substitui o PDF-fonte. Ele organiza a execução por etapas com âncora contratual explícita.

Documentos complementares do contrato:
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` — mapa de cláusulas
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md` — regras de execução ancorada

## 3. Item do A01

- **Fase**: Fase 0 → Fase 2 — contrato do Core aberto, execução funcional autorizada como próximo passo.
- **Próxima fase**: Primeira PR contratual de execução do Core Mecânico 2.
- **Prioridade do backlog**: Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.
- **Gate aplicável**: Gate 1 — sem contrato da frente, não começa implementação. **SATISFEITO** por esta PR.
- **Gate seguinte**: Gate 2 — sem smoke da frente, não promove para a frente seguinte.

## 4. Estado atual

**contrato aberto** (contrato ativo aberto, sem execução funcional)

A frente Core Mecânico 2 possui contrato ativo aberto (`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`).
O scaffold técnico (wrangler.toml + entrypoint placeholder + pipeline de deploy) está pronto.
A governança completa está pronta. Nenhuma execução funcional foi iniciada.

## 5. Classe da última tarefa

**governança** — abertura de contrato ativo vinculante do Core Mecânico 2. Criação do contrato ativo (`CONTRATO_CORE_MECANICO_2.md`), mapa de cláusulas (`CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`), regras de execução ancorada (`CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`). Atualização de `_INDEX.md`, status e handoff. Nenhuma implementação funcional aberta. Próximo passo autorizado alterado de "Abrir contrato" para "Primeira PR contratual de execução".

## 6. Última PR relevante

PR #9 — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL.
PR #10 — Auto-fix controlado do PR Governance Gate + regra @copilot+modelo.
PR #12 — Organização documental do legado mestre.
PR #13 — Encontrabilidade contratual e rastreabilidade de fontes.
PR desta abertura — Governança: contrato ativo vinculante do Core Mecânico 2.
- Criou `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — contrato ativo vinculante
- Criou `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` — mapa de cláusulas
- Criou `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md` — regras de execução
- Atualizou `schema/contracts/_INDEX.md` — contrato ativo registrado
- Atualizou `schema/status/CORE_MECANICO_2_STATUS.md` — estado refletido
- Atualizou `schema/handoffs/CORE_MECANICO_2_LATEST.md` — handoff de continuidade

## 7. Último commit

Governança: contrato ativo vinculante do Core Mecânico 2 — CONTRATO_CORE_MECANICO_2.md + CLAUSE_MAP + EXECUTION_RULES + _INDEX + status + handoff.

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
- [x] **Contrato ativo vinculante do Core Mecânico 2** — `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` criado com todas as 16 seções do CONTRACT_SCHEMA + cláusula central de soberania + declaração de subordinação + regra de parada contratual. Mapa de cláusulas (`CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`) e regras de execução ancorada (`CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`) criados. `_INDEX.md` atualizado. Gate 1 do A01 satisfeito.

## 9. Pendências

- [ ] Primeira PR contratual de execução do Core Mecânico 2 (próximo passo autorizado — contrato agora aberto)
- [ ] Implementação funcional do modelo de objectives/stages (após primeira PR de execução)
- [ ] Smoke de trilho e next step autorizado (Gate 2 do A01)
- [ ] Verificar e ajustar escopo do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real (Workers Scripts:Edit obrigatório)

## 10. Pendência remanescente herdada

Da PR #2: abertura de contrato formal do Core Mecânico 2.
**RESOLVIDA** por esta PR — contrato ativo aberto em `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`.

## 11. Bloqueios

Nenhum bloqueio ativo.
Gate 1 do A01 satisfeito — contrato do Core aberto.
Gate 2 do A01 se aplica ao próximo marco: sem smoke da frente, não promove para a frente seguinte.

**Aviso preventivo de permissão Cloudflare:**
O token `CLOUDFLARE_API_TOKEN` deve ter permissão `Workers Scripts:Edit` para que o deploy funcione.
Verificar antes do primeiro deploy real. Ver `docs/BOOTSTRAP_CLOUDFLARE.md` e `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.

## 12. Próximo passo autorizado

**Primeira PR contratual de execução do Core Mecânico 2**, subordinada ao contrato ativo `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`, com:
- Classificação: `contratual`
- Vínculo contratual explícito com este contrato ativo
- Âncora contratual obrigatória (conforme `CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`)
- Recorte específico do mapa de cláusulas (`CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`)
- Consulta obrigatória ao PDF-fonte para blocos legados não transcritos
- Sugestão de primeiro recorte: mapa de stages e gates (L03)

**Próximo passo alterado** em relação à PR anterior: sim — de "Abrir contrato" para "Primeira PR contratual de execução".

## 13. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Blocos obrigatórios**: L03, L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 14. Última atualização

- **Data**: 2026-04-20T17:47:00Z
- **Responsável**: Copilot (PR desta abertura — contrato ativo vinculante do Core Mecânico 2)

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

```
Fontes de verdade consultadas — última tarefa (PR desta abertura):
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         Nenhum na entrada — criado nesta PR: schema/contracts/active/CONTRATO_CORE_MECANICO_2.md
  Status da frente lido:       schema/status/CORE_MECANICO_2_STATUS.md
  Handoff da frente lido:      schema/handoffs/CORE_MECANICO_2_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  N/A — tarefa de governança; blocos legados referenciados estruturalmente
  PDF mestre consultado:       não consultado diretamente — tarefa de abertura contratual (governança); execução futura deve consultar
```
