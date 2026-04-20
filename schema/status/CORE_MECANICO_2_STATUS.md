# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | L07 + L08 — Meio A: estado civil e composição familiar (parte 1) |
| Pendência contratual                       | L09–L17 em aberto; continuação do Meio A, Meio B, Especiais e Final permanecem pendentes |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — Meio A inicial já roda no Core principal, sem fala mecânica e sem abrir novas frentes |
| Classe da última tarefa                    | contratual — L07 + L08 do Core Mecânico 2, mantendo Worker sem fala |
| Última PR relevante                        | PR de execução L07 + L08 — Meio A integrado ao `engine.ts` |
| Último commit                              | `cc1e98aae76fc6ca7c3c224ce134eed89dc44948` — `feat(core): integrar meio a inicial no engine` |
| Pendência remanescente herdada             | O Core já estava vivo no Worker; faltava entrar no primeiro recorte de Meio A com estado civil e composição familiar mínima |
| Próximo passo autorizado                   | Quarta PR contratual: L09 + L10 — Meio A: composição familiar (parte 2) |
| Legados aplicáveis                         | L03, L04, L05, L06, L07, L08 executados; L09–L17 pendentes |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-20T19:41:16.3186022-03:00 |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

L07 + L08 — Meio A: estado civil e composição familiar (parte 1):
- parser/extrator mínimo de `estado_civil`, `processo` e `composition_actor`
- critérios/gates mínimos do Meio A
- integração real de `qualification_civil` ao `engine.ts`
- smoke integrado do caminho real do Core

## 2c. Pendência contratual

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

O Core Mecânico 2 continua desacoplado da fala e agora já executa o primeiro recorte real do Meio A:
- `qualification_civil` deixou de depender apenas do gate genérico de L03
- `engine.ts` chama parser e criteria próprios do Meio A
- o Core decide estruturalmente entre bloquear ou avançar para `qualification_renda`
- o Worker permanece apenas como entrada técnica estrutural, sem fala mecânica

## 5. Classe da última tarefa

**contratual**

Recorte contratual L07 + L08 do Core Mecânico 2, ainda sem abrir renda, elegibilidade, fala, Supabase, Meta/WhatsApp ou surface final.

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
- [x] L07 — estado civil
- [x] L08 — composição familiar (parte 1)

## 9. Pendências

- [ ] L09 + L10 — Meio A: composição familiar (parte 2)
- [ ] L11 + L12 + L13 + L14 — Meio B
- [ ] L15 + L16 — Especiais
- [ ] L17 — Final operacional

## 10. Pendência remanescente herdada

O Core já estava exposto minimamente pelo Worker, mas `qualification_civil` ainda não tinha trilho próprio de Meio A no motor principal. Esta pendência foi fechada nesta PR sem abrir o restante do funil.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Quarta PR contratual: L09 + L10 — Meio A: composição familiar (parte 2).**

Este próximo passo segue a ordem contratual natural após o fechamento de L07 + L08.

## 13. Legados aplicáveis

- **Executados**: L03, L04, L05, L06, L07, L08
- **Pendentes**: L09–L17

## 14. Última atualização

2026-04-20T19:41:16.3186022-03:00

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — taxonomia F2 e regras mínimas de estado civil/processo/composição consultadas diretamente para L07 + L08
