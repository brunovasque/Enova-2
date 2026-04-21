# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | Nenhum — contrato anterior encerrado em 2026-04-21 |
| Estado do contrato                         | encerrado |
| Última PR executou qual recorte            | PR 23 — L17 — Final operacional, docs, visita e handoff |
| Pendência contratual                       | nenhuma |
| Contrato encerrado?                        | sim |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | concluída — contrato do Core encerrado formalmente; frente técnica fechada do topo ao handoff |
| Classe da última tarefa                    | governança — closeout formal do contrato do Core Mecânico 2 + endurecimento do PR Governance Gate |
| Última PR relevante                        | PR 23 — L17: Final operacional, docs, visita e handoff |
| Último commit                              | direto em `main` — closeout formal + endurecimento do workflow de governança |
| Pendência remanescente herdada             | nenhuma técnica; faltava apenas o closeout formal do contrato |
| Próximo passo autorizado                   | abrir o Contrato do Speech Engine e Surface Única |
| Legados aplicáveis                         | L03–L17 executados |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | contrato ativo, status, handoff, CONTRACT_CLOSEOUT_PROTOCOL, CODEX_WORKFLOW, PRs 17–23 |
| Última atualização                         | 2026-04-21T01:10:53Z |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

Nenhum — contrato anterior encerrado em 2026-04-21

## 2a. Estado do contrato

**encerrado**

## 2b. Última PR executou qual recorte do contrato

PR 23 — L17 — Final operacional, docs, visita e handoff:
- parser/extrator mínimo do recorte final
- gates mínimos de docs, visita e handoff
- integração real de `docs_prep`, `docs_collection`, `visit` e `broker_handoff` ao `engine.ts`
- prova ponta a ponta via Worker
- correção do P1 de recusa explícita de visita

## 2c. Pendência contratual

nenhuma

## 2d. Contrato encerrado?

**sim**

## 3. Item do A01

- **Fase**: Fase 2
- **Prioridade**: Prioridade 1
- **Item**: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala

## 4. Estado atual

**concluída**

O Core Mecânico 2 foi fechado formalmente com:
- L03–L17 executados
- smoke topo → final comprovado no Core e no Worker
- desacoplamento da fala preservado
- contrato arquivado conforme `CONTRACT_CLOSEOUT_PROTOCOL.md`

## 5. Classe da última tarefa

**governança**

Fechamento formal do contrato do Core Mecânico 2 e endurecimento do PR Governance Gate para impedir PR com body incompleto/solto.

## 6. Última PR relevante

PR 23 — L17: Final operacional, docs, visita e handoff.

## 7. Último commit

Direto em `main` — closeout formal do contrato do Core + endurecimento do workflow de governança.

## 8. Entregas concluídas

- [x] L03 — esqueleto estrutural de stages/gates
- [x] L04 — regras do topo
- [x] L05 — parser/extrator do topo
- [x] L06 — critérios/gates do topo
- [x] Integração mínima do Core atual ao Worker
- [x] Rota técnica `POST /__core__/run`
- [x] Smoke real da rota do Worker
- [x] L07 — estado civil
- [x] L08 — composição familiar (parte 1)
- [x] L09 — composição familiar (parte 2)
- [x] L10 — composição familiar (parte 2)
- [x] L11 — regime e renda (parte 1)
- [x] L12 — regime e renda (parte 2)
- [x] L13 — CTPS e dependentes
- [x] L14 — gates e restrições de elegibilidade
- [x] L15 — trilhos especiais P3 / multi
- [x] L16 — variantes estruturais dos especiais
- [x] L17 — final operacional / docs / visita / handoff
- [x] Smoke de trilho completo topo → final
- [x] Encerramento formal do contrato
- [x] Workflow de governança endurecido para body de PR

## 9. Pendências

nenhuma

## 10. Pendência remanescente herdada

O recorte técnico estava fechado após a PR 23. Restava apenas formalizar o encerramento do contrato e amarrar melhor a governança do body da PR no workflow.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Abrir o Contrato do Speech Engine e Surface Única.**

## 13. Legados aplicáveis

- **Executados**: L03–L17
- **Pendentes**: nenhum

## 14. Última atualização

2026-04-21T01:10:53Z

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

Fontes de verdade consultadas — última tarefa:
- `schema/contracts/_INDEX.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_2026-04-21.md`
- `schema/status/CORE_MECANICO_2_STATUS.md`
- `schema/handoffs/CORE_MECANICO_2_LATEST.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/pr-governance-check.yml`
- `scripts/validate_pr_governance.js`
- PRs 17, 18, 19, 20, 21, 22 e 23
