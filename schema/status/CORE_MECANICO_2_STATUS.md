# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`                                    |
| Estado do contrato                         | em execução                                                                               |
| Última PR executou qual recorte            | L03 — esqueleto estrutural: stages, gates (slots), engine mínimo, smoke 3/3              |
| Pendência contratual                       | L04–L17 em aberto; regras e micro regras de negócio pendentes                            |
| Contrato encerrado?                        | não                                                                                       |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — esqueleto L03 entregue; smoke 3/3 passando                                  |
| Classe da última tarefa                    | contratual — recorte L03: esqueleto de stages/gates (simplificado — Caminho A)            |
| Última PR relevante                        | PR de execução L03 — esqueleto estrutural do Core Mecânico 2 (Caminho A)                 |
| Último commit                              | feat(core): simplificar L03 para esqueleto mínimo (Caminho A)                            |
| Pendência remanescente herdada             | Nenhuma — primeiro recorte contratual entregue como esqueleto mínimo                     |
| Próximo passo autorizado                   | Segunda PR contratual: L04 + L05 + L06 — topo do funil (regras, extração e gates)        |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03 (esqueleto executado), L04–L17 (pendentes)          |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare — última tarefa      | nenhuma adicional — scaffold sem deploy                                                   |
| Última atualização                         | 2026-04-20T20:30:00Z                                                                      |

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

