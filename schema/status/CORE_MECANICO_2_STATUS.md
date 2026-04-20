# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade |
| Pendência contratual                       | L15–L17 em aberto; Especiais e Final permanecem pendentes |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — Meio B inicial já roda no Core principal, ainda sem fala mecânica |
| Classe da última tarefa                    | contratual — L11 + L12 + L13 + L14 do Core Mecânico 2, sem abrir Especiais ou Final |
| Última PR relevante                        | PR de execução L11 + L12 + L13 + L14 — Meio B integrado ao `engine.ts` |
| Último commit                              | `c587aa15540860dbc525e8f3fa92bcb7066d1c64` — `feat(core): integrar meio b inicial no engine` |
| Pendência remanescente herdada             | O Meio A já estava fechado até L10, mas ainda faltava entrar em regime, renda, CTPS e elegibilidade mínima |
| Próximo passo autorizado                   | Sexta PR contratual: L15 + L16 — Especiais: trilhos P3 / multi e variantes |
| Legados aplicáveis                         | L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14 executados; L15–L17 pendentes |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-20T20:23:46.0353332-03:00 |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade:
- parser/extrator mínimo de `regime_trabalho`, `renda_principal`, `autonomo_tem_ir`, `ctps_36`, `nacionalidade` e `rnm_status`
- critérios/gates mínimos de renda e elegibilidade
- integração real de `qualification_renda` e `qualification_eligibility` ao `engine.ts`
- smoke integrado do caminho real do Core

## 2c. Pendência contratual

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

O Core Mecânico 2 continua desacoplado da fala e agora já cobre Meio A e Meio B iniciais:
- `qualification_renda` e `qualification_eligibility` agora têm trilho próprio no `engine.ts`
- o parser do Meio B lê regime, renda, IR, CTPS, nacionalidade e RNM
- o Core diferencia ausência crítica, autônomo sem IR, trilho válido e bloqueio por RNM
- o Worker permanece apenas como entrada técnica estrutural, sem fala mecânica

## 5. Classe da última tarefa

**contratual**

Recorte contratual L11 + L12 + L13 + L14 do Core Mecânico 2, ainda sem abrir Especiais, Final, fala, Supabase, Meta/WhatsApp ou surface final.

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
- [x] L11 — regime e renda (parte 1)
- [x] L12 — regime e renda (parte 2)
- [x] L13 — CTPS e dependentes
- [x] L14 — gates e restrições de elegibilidade

## 9. Pendências

- [ ] L15 + L16 — Especiais
- [ ] L17 — Final operacional

## 10. Pendência remanescente herdada

O Meio A já estava fechado até L10, mas `qualification_renda` e `qualification_eligibility` ainda dependiam apenas do caminho genérico de L03. Esta pendência foi fechada nesta PR sem abrir Especiais ou Final.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Sexta PR contratual: L15 + L16 — Especiais: trilhos P3 / multi e variantes.**

Este próximo passo segue a ordem contratual natural após o fechamento de L11 + L12 + L13 + L14.

## 13. Legados aplicáveis

- **Executados**: L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14
- **Pendentes**: L15–L17

## 14. Última atualização

2026-04-20T20:23:46.0353332-03:00

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — taxonomias F1/F3/F4 e regras mínimas de IR, renda, CTPS e RNM consultadas diretamente para L11 + L12 + L13 + L14
