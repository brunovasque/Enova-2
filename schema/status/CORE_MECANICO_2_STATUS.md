# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | L17 — Final operacional, docs, visita e handoff |
| Pendência contratual                       | nenhuma técnica; closeout formal do contrato ainda pendente |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — Core completo do topo ao handoff, com Worker técnico validado e reavaliação formal de encerramento pendente |
| Classe da última tarefa                    | contratual — L17 do Core Mecânico 2, com prova ponta a ponta no Worker |
| Última PR relevante                        | PR 23 — L17: Final operacional, docs, visita e handoff |
| Último commit                              | `18fef05f62a6ba9eec01cbef378607459dca4c1f` — `feat(core): integrar l17 final operacional` |
| Pendência remanescente herdada             | O recorte L17 era a única pendência contratual remanescente; também faltava a prova topo → final para encerrar o contrato com segurança |
| Próximo passo autorizado                   | reavaliar encerramento formal do contrato do Core Mecânico 2 |
| Legados aplicáveis                         | L03–L17 executados |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-20T21:34:11.7830094-03:00 |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

L17 — Final operacional, docs, visita e handoff:
- parser/extrator mínimo de `docs_channel_choice`, `visit_interest`, `doc_identity_status`, `doc_income_status`, `doc_residence_status`, `doc_ctps_status` e `handoff_readiness`
- critérios/gates mínimos de docs, visita e handoff
- integração real de `docs_prep`, `docs_collection`, `visit` e `broker_handoff` ao `engine.ts`
- smoke integrado do caminho real do Core e prova ponta a ponta no Worker

## 2c. Pendência contratual

nenhuma técnica — encerramento formal ainda não aplicado

## 2d. Contrato encerrado?

**não**

## 3. Item do A01

- **Fase**: Fase 2
- **Prioridade**: Prioridade 1
- **Item**: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala

## 4. Estado atual

**em execução**

O Core Mecânico 2 continua desacoplado da fala e agora cobre Topo, Meio A, Meio B, Especiais e Final:
- `docs_prep`, `docs_collection`, `visit` e `broker_handoff` agora têm decisão estrutural própria no `engine.ts`
- o Core trata docs, visita e handoff como estado/gate/next step, sem phrasing
- o Worker segue técnico e estrutural, agora com prova real do recorte final via `/__core__/run`

## 5. Classe da última tarefa

**contratual**

Recorte contratual L17 do Core Mecânico 2, sem abrir fala, Supabase, Meta/WhatsApp ou surface final.

## 6. Última PR relevante

PR 23 — L17: Final operacional, docs, visita e handoff.

## 7. Último commit

`18fef05f62a6ba9eec01cbef378607459dca4c1f` — `feat(core): integrar l17 final operacional`

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
- [x] L09 — composição familiar (parte 1)
- [x] L10 — composição familiar (parte 2)
- [x] L11 — regime e renda (parte 1)
- [x] L12 — regime e renda (parte 2)
- [x] L13 — CTPS e dependentes
- [x] L14 — gates e restrições de elegibilidade
- [x] L15 — trilhos especiais P3 / multi
- [x] L16 — variantes estruturais dos especiais
- [x] L17 — final operacional / docs / visita / handoff
- [x] Smoke de trilho completo topo → final

## 9. Pendências

nenhuma técnica — closeout formal ainda pendente

## 10. Pendência remanescente herdada

L17 era a última pendência contratual do Core. Também faltava a prova integrada topo → final para encerrar o contrato com segurança. Ambas foram fechadas nesta PR.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Reavaliar encerramento formal do contrato do Core Mecânico 2.**

O recorte técnico foi fechado; a decisão de closeout formal fica pendente após esta PR.

## 13. Legados aplicáveis

- **Executados**: L03–L17
- **Pendentes**: nenhum

## 14. Última atualização

2026-04-20T21:34:11.7830094-03:00

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

Fontes de verdade consultadas — última tarefa:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
  Clause map lido:             `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`
  Execution rules lidas:       `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`
  Status da frente lido:       `schema/status/CORE_MECANICO_2_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CORE_MECANICO_2_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03–L17 identificados estruturalmente
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — E7.3, F7, F8, handoff_readiness e 4.1 Fases macro consultados diretamente para L17
