# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | L15 + L16 — Especiais: trilhos P3 / multi e variantes |
| Pendência contratual                       | L17 em aberto; Final operacional permanece pendente |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — Especiais já rodam no Core principal, ainda sem fala mecânica e sem abrir L17 |
| Classe da última tarefa                    | contratual — L15 + L16 do Core Mecânico 2, sem abrir Final operacional |
| Última PR relevante                        | PR de execução L15 + L16 — Especiais integrados ao `engine.ts` |
| Último commit                              | `a3c27abec10af5222501e8dbcfae39705900af97` — `feat(core): integrar trilhos especiais no engine` |
| Pendência remanescente herdada             | O Meio B já estava fechado até L14, mas ainda faltavam os trilhos especiais P3 / multi e suas variantes mínimas |
| Próximo passo autorizado                   | Sétima PR contratual: L17 — Final operacional, docs, visita e handoff |
| Legados aplicáveis                         | L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16 executados; L17 pendente |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-20T20:58:44.4419816-03:00 |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

L15 + L16 — Especiais: trilhos P3 / multi e variantes:
- criação do stage estrutural `qualification_special`
- parser/extrator mínimo de `p3_required`, `work_regime_p2`, `monthly_income_p2`, `autonomo_has_ir_p2`, `ctps_36m_p2` e `work_regime_p3`
- critérios/gates mínimos de P3, multi-proponente e variante de co-participante autônomo
- integração real dos Especiais ao `engine.ts` e ao `stage-map.ts`
- smoke integrado do caminho real do Core

## 2c. Pendência contratual

- L17 — Final operacional / docs / visita

## 2d. Contrato encerrado?

**não**

## 3. Item do A01

- **Fase**: Fase 2
- **Prioridade**: Prioridade 1
- **Item**: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala

## 4. Estado atual

**em execução**

O Core Mecânico 2 continua desacoplado da fala e agora cobre Topo, Meio A, Meio B e Especiais:
- `qualification_special` agora existe no funil real entre elegibilidade e docs
- o Core roteia `p3_required` e multi-proponente sem abrir L17
- P3 deixou de travar no Meio A e passou a ser resolvido no stage especial contratado
- o Worker permanece apenas como entrada técnica estrutural, sem fala mecânica

## 5. Classe da última tarefa

**contratual**

Recorte contratual L15 + L16 do Core Mecânico 2, ainda sem abrir L17, fala, Supabase, Meta/WhatsApp ou surface final.

## 6. Última PR relevante

PR de execução L15 + L16 — Especiais integrados ao `engine.ts`.

## 7. Último commit

`a3c27abec10af5222501e8dbcfae39705900af97` — `feat(core): integrar trilhos especiais no engine`

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

## 9. Pendências

- [ ] L17 — Final operacional

## 10. Pendência remanescente herdada

O Meio B já estava fechado até L14, mas o Core ainda não tinha um stage próprio para P3 / multi nem roteamento estrutural dos casos especiais. Esta pendência foi fechada nesta PR sem abrir L17.

## 11. Bloqueios

Nenhum bloqueio ativo.

## 12. Próximo passo autorizado

**Sétima PR contratual: L17 — Final operacional, docs, visita e handoff.**

Este próximo passo segue a ordem contratual natural após o fechamento de L15 + L16.

## 13. Legados aplicáveis

- **Executados**: L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16
- **Pendentes**: L17

## 14. Última atualização

2026-04-20T20:58:44.4419816-03:00

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — E6.2, F2 e F4; p3_required, work_regime_p2, monthly_income_p2, autonomo_has_ir_p2, ctps_36m_p2 e work_regime_p3 consultados diretamente para L15 + L16
