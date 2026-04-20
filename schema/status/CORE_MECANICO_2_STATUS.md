# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | Integração mínima do Core atual ao Worker — rota técnica `POST /__core__/run` + smoke real da rota |
| Pendência contratual                       | L07–L17 em aberto; Meio A, Meio B, Especiais e Final permanecem pendentes |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — Core já roda no Worker via rota estrutural isolada, sem fala mecânica |
| Classe da última tarefa                    | contratual — integração mínima do Core no Worker, sem abrir nova frente |
| Última PR relevante                        | PR de integração mínima do Worker — Core exposto via `/__core__/run` |
| Último commit                              | `01da787578d2f2e22fb81bee854d87103ef819d8` — `feat(worker): expor rota minima do core` |
| Pendência remanescente herdada             | O topo já estava integrado ao `engine.ts`; faltava expor o Core pelo Worker com uma entrada técnica viva e provar a rota real |
| Próximo passo autorizado                   | Terceira PR contratual: L07 + L08 — Meio A: estado civil e composição familiar (preservado) |
| Legados aplicáveis                         | L03, L04, L05, L06 executados; L07–L17 pendentes |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-20T19:04:45.2886583-03:00 |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

Integração mínima do Core atual ao Worker:
- `src/worker.ts` deixou de ser placeholder puro
- rota técnica isolada `POST /__core__/run`
- execução do `runCoreEngine()` real com input estrutural controlado
- saída JSON estritamente estrutural
- smoke real da rota passando pelo `fetch` do Worker

## 2c. Pendência contratual

- L07 + L08 — Meio A: estado civil e composição familiar (parte 1)
- L09 + L10 — Meio A: composição familiar (parte 2)
- L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade
- L15 + L16 — Especiais
- L17 — Final operacional / docs / visita

## 2d. Contrato encerrado?

**não**

## 3. Item do A01

- **Fase**: Fase 2
- **Prioridade**: Prioridade 1
- **Item**: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala

## 4. Estado atual

**em execução**

O Core Mecânico 2 continua desacoplado da fala e agora possui uma entrada técnica viva no Worker:
- `GET /` responde com status técnico simples
- `POST /__core__/run` aceita `lead_id`, `current_stage` e `facts`
- o Worker chama o Core real (`runCoreEngine()`)
- a resposta inclui apenas `stage_current`, `stage_after`, `next_objective`, `block_advance`, `gates_activated` e `speech_intent`

## 5. Classe da última tarefa

**contratual**

Recorte contratual de integração mínima do Core no Worker, ainda dentro da frente Core Mecânico 2 e sem abrir fala, Supabase, Meta/WhatsApp ou surface final.

## 6. Última PR relevante

PR de integração mínima do Worker — Core exposto via `/__core__/run`.

## 7. Último commit

`01da787578d2f2e22fb81bee854d87103ef819d8` — `feat(worker): expor rota minima do core`

## 8. Entregas concluídas

- [x] L03 — esqueleto estrutural de stages/gates
- [x] L04 — regras do topo
- [x] L05 — parser/extrator do topo
- [x] L06 — critérios/gates do topo
- [x] Integração mínima do Core atual ao Worker
- [x] Rota técnica `POST /__core__/run`
- [x] Smoke real da rota do Worker

## 9. Pendências

- [ ] L07 + L08 — Meio A: estado civil e composição familiar (parte 1)
- [ ] L09 + L10 — Meio A: composição familiar (parte 2)
- [ ] L11 + L12 + L13 + L14 — Meio B
- [ ] L15 + L16 — Especiais
- [ ] L17 — Final operacional

## 10. Pendência remanescente herdada

O Core já existia internamente no repositório, mas ainda não estava exposto pelo Worker. Esta pendência técnica foi fechada nesta PR sem alterar o próximo passo de negócio da frente.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Terceira PR contratual: L07 + L08 — Meio A: estado civil e composição familiar (parte 1).**

Este próximo passo foi **preservado**. A integração mínima do Worker não altera a ordem contratual de evolução das regras de negócio.

## 13. Legados aplicáveis

- **Executados**: L03, L04, L05, L06
- **Pendentes**: L07–L17

## 14. Última atualização

2026-04-20T19:04:45.2886583-03:00

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

Fontes de verdade consultadas — última tarefa:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
  Status da frente lido:       `schema/status/CORE_MECANICO_2_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CORE_MECANICO_2_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03–L17 identificados estruturalmente
  PDF mestre consultado:       não consultado — esta PR não implementa nova regra de negócio; consome o Core já executado em L03/L04/L05/L06
