# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | Nenhum contrato ativo — aguardando abertura                                               |
| Item do A01                                | Fase 1 — scaffold técnico (pipeline de deploy Cloudflare concluído)                       |
| Estado atual                               | não iniciada (bootstrap infra + pipeline de deploy concluídos)                            |
| Classe da última tarefa                    | fora_de_contrato (infra — pipeline de deploy)                                             |
| Última PR relevante                        | PR #7 — Pipeline de deploy GitHub Actions (deploy.yml — test e prod)                     |
| Último commit                              | Infra: deploy automático em main + docs PowerShell/Windows/VSCode                        |
| Pendência remanescente herdada             | Abertura de contrato formal do Core Mecânico 2 (herdada da PR #2, preservada)            |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2 (preservado — não alterado por esta infra)             |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03, L04–L17 (conforme INDEX_LEGADO_MESTRE.md)           |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare necessárias          | sim — Workers Scripts:Edit (necessário para wrangler deploy — aviso preventivo ativo)     |
| Última atualização                         | 2026-04-20T02:46:46Z                                                                      |

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

**fora_de_contrato** — pipeline de deploy mínimo de infraestrutura. Sem contrato ativo do Core Mecânico 2, mas alinhado à Fase 1 do A01 (scaffold técnico). Nenhuma implementação funcional aberta. Próximo passo autorizado não alterado.

## 6. Última PR relevante

PR #6 — Protocolo obrigatório de permissões Cloudflare (governança).
PR #7 — Pipeline de deploy GitHub Actions (esta PR).
- Criou `.github/workflows/deploy.yml`: pipeline mínimo com disparo manual, suporte a test e prod, proteção de branch para prod, sem bindings fictícios.
- Atualizou `docs/BOOTSTRAP_CLOUDFLARE.md`: uso local via terminal/VSCode, permissões Cloudflare declaradas, aviso preventivo.
- Atualizou `README.md`: referência ao pipeline criado.
- Atualizou `schema/status/CORE_MECANICO_2_STATUS.md` (este arquivo).
- Atualizou `schema/handoffs/CORE_MECANICO_2_LATEST.md`.

## 7. Último commit

Pipeline de deploy: deploy automático em push/merge em `main` (prod) + deploy manual test/prod. Docs locais com PowerShell/Windows/VSCode.

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

## 9. Pendências

- [ ] Abrir contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado)
- [ ] Definir objetivos/stages do Core Mecânico 2 no contrato
- [ ] Implementação funcional do worker (após contrato aprovado)
- [ ] Verificar e ajustar escopo do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real (Workers Scripts:Edit obrigatório)

## 10. Pendência remanescente herdada

Da PR #2: abertura de contrato formal do Core Mecânico 2.
Esta pendência permanece em aberto — as PRs #3 a #7 não a afetaram.

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
- Dependências satisfeitas (trio-base + workflow endurecido + contexto vivo + classificação de tarefas + protocolo de dados + bootstrap Cloudflare + protocolo de permissões Cloudflare + pipeline de deploy)

**Próximo passo preservado** em relação à PR #6.

## 13. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Blocos obrigatórios**: L03, L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 14. Última atualização

- **Data**: 2026-04-20T02:46:46Z
- **Responsável**: Copilot (PR #7 — deploy automático em main + docs PowerShell/Windows/VSCode)
