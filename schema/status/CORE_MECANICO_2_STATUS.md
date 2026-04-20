# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | L09 + L10 — Meio A: composição familiar (parte 2) |
| Pendência contratual                       | L11–L17 em aberto; Meio B, Especiais e Final permanecem pendentes |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — Meio A ficou estruturalmente mais completo no Core principal, ainda sem fala mecânica |
| Classe da última tarefa                    | contratual — L09 + L10 do Core Mecânico 2, sem abrir Meio B |
| Última PR relevante                        | PR de execução L09 + L10 — composição familiar expandida no `engine.ts` |
| Último commit                              | `e5c335ad62bc7e2b72471385b8a39a13436a0340` — `feat(core): expandir composicao familiar do meio a` |
| Pendência remanescente herdada             | O Meio A inicial já existia, mas ainda faltavam as microregras adicionais de composição familiar, dependente e P3 |
| Próximo passo autorizado                   | Quinta PR contratual: L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade |
| Legados aplicáveis                         | L03, L04, L05, L06, L07, L08, L09, L10 executados; L11–L17 pendentes |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-20T20:06:02.8627195-03:00 |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

L09 + L10 — Meio A: composição familiar (parte 2):
- expansão do parser do Meio A para `p3_required`, `dependents_applicable` e `dependents_count`
- expansão dos critérios/gates de composição familiar
- roteamento estrutural adicional de dependente e P3 no `qualification_civil`
- smoke integrado do caminho real do Core

## 2c. Pendência contratual

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

O Core Mecânico 2 continua desacoplado da fala e agora já cobre L07–L10 do Meio A:
- `qualification_civil` continua plugado ao `engine.ts`
- o parser do Meio A agora lê `p3_required`, `dependents_applicable` e `dependents_count`
- o Core diferencia composição válida, dependente aplicável e composição que exige P3
- o Worker permanece apenas como entrada técnica estrutural, sem fala mecânica

## 5. Classe da última tarefa

**contratual**

Recorte contratual L09 + L10 do Core Mecânico 2, ainda sem abrir Meio B, fala, Supabase, Meta/WhatsApp ou surface final.

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
- [x] L09 — composição familiar (parte 1)
- [x] L10 — composição familiar (parte 2)

## 9. Pendências

- [ ] L11 + L12 + L13 + L14 — Meio B
- [ ] L15 + L16 — Especiais
- [ ] L17 — Final operacional

## 10. Pendência remanescente herdada

O Meio A inicial já estava integrado ao motor principal, mas ainda faltava aprofundar a composição familiar com dependente aplicável e roteamento P3. Esta pendência foi fechada nesta PR sem abrir o restante do funil.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Quinta PR contratual: L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade.**

Este próximo passo segue a ordem contratual natural após o fechamento de L09 + L10.

## 13. Legados aplicáveis

- **Executados**: L03, L04, L05, L06, L07, L08, L09, L10
- **Pendentes**: L11–L17

## 14. Última atualização

2026-04-20T20:06:02.8627195-03:00

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — taxonomia F2, F6 e regras mínimas de composição, dependente e P3 consultadas diretamente para L09 + L10
