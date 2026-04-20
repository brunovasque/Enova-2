# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`                                    |
| Estado do contrato                         | em execução                                                                               |
| Última PR executou qual recorte            | L04 + L05 + L06 — topo do funil: regras, parser/extrator e critérios/gates               |
| Pendência contratual                       | L07–L17 em aberto; Meio A (composição), Meio B (renda/elegibilidade) e demais pendentes  |
| Contrato encerrado?                        | não                                                                                       |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — topo do funil integrado ao Core principal (L04/L05/L06); smoke 5/5 via runCoreEngine() |
| Classe da última tarefa                    | contratual — recorte L04+L05+L06: topo integrado ao engine (regras, parser, critérios/gates)         |
| Última PR relevante                        | PR de execução L04+L05+L06 — topo do funil integrado ao Core Mecânico 2                             |
| Último commit                              | fix(core): integrar L04/L05/L06 ao engine.ts — runTopoDecision() no caminho central                  |
| Pendência remanescente herdada             | Nenhuma — segundo recorte contratual entregue (topo do funil)                            |
| Próximo passo autorizado                   | Terceira PR contratual: L07 + L08 — Meio A: estado civil e composição familiar           |
| Legados aplicáveis                         | L03 (executado), L04 (executado), L05 (executado), L06 (executado); L07–L17 (pendentes) |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare — última tarefa      | nenhuma adicional — topo estrutural sem deploy                                            |
| Última atualização                         | 2026-04-20T21:02:00Z                                                                      |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — aberto em 2026-04-20T17:47:00Z.

## 3. Item do A01

- **Fase**: Fase 2 — execução funcional do Core Mecânico 2.
- **Gate aplicável**: Gate 2 — sem smoke da frente, não promove. **SATISFEITO** no recorte L04+L05+L06 (smoke 5/5).

## 4. Estado atual

**em execução** — topo do funil L04+L05+L06 integrado ao Core principal

A PR de execução L04+L05+L06 entregou o topo integrado ao caminho central do Core:
- `src/core/engine.ts` — `runTopoDecision()` integra L05+L06 no caminho central: discovery → extractTopoSignals → evaluateTopoCriteria → CoreDecision
- `src/core/topo-rules.ts` — L04: política e regras do topo (TOPO_REQUIRED_FACTS, TOPO_BLOCKING_CONDITIONS, TOPO_ADVANCE_CRITERIA, CustomerGoal, CurrentIntent, OfftrackType)
- `src/core/topo-parser.ts` — L05: parser/extrator mínimo do topo (extractTopoSignals, TopoTurnExtract, TopoSignals)
- `src/core/topo-gates.ts` — L06: critérios/gates do topo (evaluateTopoCriteria, TopoCriteriaResult)
- `src/core/types.ts` — re-exports dos tipos de topo para o contrato público do Core
- `src/core/smoke.ts` — cenários 4 e 5 via runCoreEngine() (sem decisão fake); 5/5 passando

O que não foi embutido (vai para L07+):
- Regras de Meio A: casado civil, composição familiar, estado civil, P3 (L07–L10)
- Regras de Meio B: autônomo/IR, renda, CTPS, elegibilidade, RNM (L11–L14)

## 5. Classe da última tarefa

**contratual** — recorte L04+L05+L06 (topo integrado ao engine).
Escopo: L04 (regras), L05 (parser), L06 (critérios/gates) integrados ao `engine.ts`. Regras de Meio A/B ficam para L07+.

## 6. Última PR relevante

- PR de execução L04+L05+L06 — topo do funil integrado ao Core:
  - `src/core/engine.ts` — `runTopoDecision()` integra L05 (extractTopoSignals) + L06 (evaluateTopoCriteria) no caminho central para discovery
  - `src/core/topo-rules.ts` — L04: política do topo (TOPO_REQUIRED_FACTS, CustomerGoal, CurrentIntent, OfftrackType, TOPO_BLOCKING_CONDITIONS, TOPO_ADVANCE_CRITERIA, TOPO_SIGNAL_POLICY, TOPO_NEXT_STEP)
  - `src/core/topo-parser.ts` — L05: extrator de sinais do topo (TopoTurnExtract, TopoSignals, extractTopoSignals)
  - `src/core/topo-gates.ts` — L06: avaliador de critérios do topo (TopoCriteriaResult, evaluateTopoCriteria, isTopoFactoCriticoAusente)
  - `src/core/types.ts` — re-exports de tipos de topo
  - `src/core/smoke.ts` — cenários 4 e 5 via runCoreEngine() (5 total, 5/5 passando)

## 7. Último commit

fix(core): integrar L04/L05/L06 ao engine.ts — runTopoDecision() no caminho central

## 8. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW + TASK_CLASSIFICATION + README_EXECUCAO + AGENT_CONTRACT
- [x] PULL_REQUEST_TEMPLATE + CONTRACT_SCHEMA + STATUS_SCHEMA + HANDOFF_SCHEMA
- [x] Estrutura de status vivos e handoffs
- [x] Legado mestre unificado incorporado
- [x] DATA_CHANGE_PROTOCOL + CLOUDFLARE_PERMISSION_PROTOCOL
- [x] Bootstrap técnico Cloudflare Workers + pipeline de deploy GitHub Actions
- [x] PR Governance Gate + REQUEST_ECONOMY_PROTOCOL
- [x] Contrato ativo vinculante do Core Mecânico 2 — Gate 1 satisfeito
- [x] **L03 — Esqueleto estrutural de stages/gates (Caminho A)** — smoke 3/3; Gate 2 do A01 satisfeito no recorte L03
- [x] **L04 — Regras e política do topo do funil** — TOPO_REQUIRED_FACTS, CustomerGoal, CurrentIntent, OfftrackType, TOPO_BLOCKING_CONDITIONS, TOPO_ADVANCE_CRITERIA
- [x] **L05 — Parser/extrator mínimo do topo** — extractTopoSignals, TopoTurnExtract, TopoSignals
- [x] **L06 — Critérios/gates do topo** — evaluateTopoCriteria, TopoCriteriaResult — smoke 5/5 passando

## 9. Pendências

- [x] ~~Primeira PR contratual de execução do Core Mecânico 2~~ — **CONCLUÍDA** (L03 esqueleto)
- [x] ~~Segunda PR contratual: L04 + L05 + L06 — topo do funil~~ — **CONCLUÍDA** (esta PR)
- [ ] Terceira PR contratual: L07 + L08 — Meio A: estado civil e composição familiar (parte 1)
- [ ] Continuação Meio A: L09 + L10 — composição familiar (parte 2)
- [ ] Meio B: L11 + L12 + L13 + L14 — regime, renda, CTPS, elegibilidade
- [ ] Especiais: L15 + L16 — trilhos P3, multi-proponente
- [ ] Final: L17 — transição final, docs, handoff
- [ ] Verificar permissão do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real

## 10. Bloqueios

Nenhum bloqueio ativo.
Gate 2 do A01 satisfeito no recorte L04+L05+L06 (smoke 5/5).

## 11. Próximo passo autorizado

**Terceira PR contratual**: L07 + L08 — Meio A: regras de estado civil e composição familiar (parte 1).

- Classificação: `contratual`
- Blocos: L07, L08
- Consulta obrigatória ao PDF-fonte para cada bloco
- Pré-requisito: topo funcional (esta PR) — **SATISFEITO**

## 12. Legados aplicáveis

- **Blocos executados**: L03 (esqueleto), L04 (topo regras), L05 (topo parser), L06 (topo gates)
- **Blocos obrigatórios pendentes**: L07–L17 com regras e micro regras de negócio

## 13. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 14. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional


---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — aberto em 2026-04-20T17:47:00Z.

## 3. Item do A01

- **Fase**: Fase 2 — execução funcional do Core Mecânico 2.
- **Gate aplicável**: Gate 2 — sem smoke da frente, não promove. **SATISFEITO** no recorte L03 (smoke 3/3).

## 4. Estado atual

**em execução** — esqueleto estrutural L03 entregue (Caminho A: enxugado)

A PR de execução L03 foi simplificada para representar com honestidade o primeiro recorte contratual:
- esqueleto de stages (8 canônicos) e gates (slots estruturais por stage)
- gate ativo: `G_FATO_CRITICO_AUSENTE` (estrutural — são required_facts ausentes)
- gates reservados para L04–L06+: `G_COMPOSICAO_FAMILIAR`, `G_REGIME_RENDA`, `G_ELEGIBILIDADE`
- engine mínimo: block/no-block → next_stage → speech_intent (sinal estrutural, não é fala)
- smoke: 3 cenários (block por ausência, avanço por presença, block por fact parcial)
- Nenhuma regra ou micro regra de negócio detalhada embutida (casado civil, autônomo/IR, renda, RNM → L04+)

## 5. Classe da última tarefa

**contratual** — recorte L03 simplificado (Caminho A).
Escopo: esqueleto estrutural do funil. Regras de negócio ficam para L04–L06+.

## 6. Última PR relevante

- PR de abertura — Governança: contrato ativo vinculante do Core Mecânico 2.
- PR de execução L03 — Caminho A: esqueleto mínimo de stages/gates (esta PR):
  - `src/core/types.ts` — tipos mínimos: StageId, LeadState (facts simples), GateId (slots), CoreDecision
  - `src/core/stage-map.ts` — STAGE_MAP + CANONICAL_STAGE_ORDER + avaliador G_FATO_CRITICO_AUSENTE
  - `src/core/engine.ts` — motor mínimo: block/no-block → next_stage → speech_intent
  - `src/core/smoke.ts` — 3 cenários estruturais, todos passando

## 7. Último commit

feat(core): simplificar L03 para esqueleto mínimo (Caminho A)

## 8. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW + TASK_CLASSIFICATION + README_EXECUCAO + AGENT_CONTRACT
- [x] PULL_REQUEST_TEMPLATE + CONTRACT_SCHEMA + STATUS_SCHEMA + HANDOFF_SCHEMA
- [x] Estrutura de status vivos e handoffs
- [x] Legado mestre unificado incorporado
- [x] DATA_CHANGE_PROTOCOL + CLOUDFLARE_PERMISSION_PROTOCOL
- [x] Bootstrap técnico Cloudflare Workers + pipeline de deploy GitHub Actions
- [x] PR Governance Gate + REQUEST_ECONOMY_PROTOCOL
- [x] Contrato ativo vinculante do Core Mecânico 2 — Gate 1 satisfeito
- [x] **L03 — Esqueleto estrutural de stages/gates (Caminho A)** — smoke 3/3 passando; Gate 2 do A01 satisfeito no recorte L03

## 9. Pendências

- [x] ~~Primeira PR contratual de execução do Core Mecânico 2~~ — **CONCLUÍDA** (L03 esqueleto)
- [ ] Segunda PR contratual: L04 + L05 + L06 — regras de negócio do topo do funil
- [ ] Implementação do trilho completo (L04–L17) com regras e micro regras detalhadas
- [ ] Verificar permissão do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real

## 10. Bloqueios

Nenhum bloqueio ativo.
Gate 2 do A01 satisfeito no recorte L03 (smoke 3/3). Trilho completo pendente para Gate 2 definitivo.

## 11. Próximo passo autorizado

**Segunda PR contratual**: L04 + L05 + L06 — regras de negócio do topo do funil (casado civil, autônomo/IR, renda, elegibilidade inicial).

- Classificação: `contratual`
- Blocos: L04, L05, L06
- Consulta obrigatória ao PDF-fonte para cada bloco

## 12. Legados aplicáveis

- **Bloco executado**: L03 — esqueleto estrutural (esta PR)
- **Blocos obrigatórios pendentes**: L04–L17 com regras e micro regras de negócio

## 13. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 14. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

