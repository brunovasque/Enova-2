# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-20T20:58:44.4419816-03:00 |
| Estado da frente                           | em execução — Especiais integrados ao Core principal, com Worker ainda estrutural e sem fala mecânica |
| Classificação da tarefa                    | contratual — L15 + L16 do Core Mecânico 2 |
| Última PR relevante                        | PR de execução L11 + L12 + L13 + L14 — Meio B inicial integrado ao Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Recorte executado do contrato              | L15 + L16 — Especiais: trilhos P3 / multi e variantes |
| Pendência contratual remanescente          | L17 em aberto; Final pendente |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 1: Core Mecânico 2 desacoplado da fala, agora com Especiais plugados ao motor real |
| Próximo passo autorizado                   | Sétima PR contratual: L17 — Final operacional, docs, visita e handoff |
| Próximo passo foi alterado?                | não |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 já tinha L03–L14 entregues, além de uma rota técnica mínima no Worker. O gap contratual seguinte era abrir os trilhos especiais P3 / multi sem misturar docs/final.

Esta PR fecha exatamente L15 + L16 em recorte mínimo: stage `qualification_special`, parser de P3 / multi, gates mínimos de ausência crítica e IR do co-participante autônomo, além do roteamento real a partir da elegibilidade. O recorte continua dentro do contrato ativo e sem drift porque não abre L17, docs, surface final ou fala mecânica. O Core continua devolvendo apenas estrutura.

O próximo passo autorizado muda de forma natural para L17, entrada na fase final operacional.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR de execução L11 + L12 + L13 + L14 — Meio B inicial integrado ao `engine.ts`.

## 4. O que a PR anterior fechou

- L03 — esqueleto estrutural
- L04 — regras do topo
- L05 — parser/extrator do topo
- L06 — critérios/gates do topo
- L09 — microregras de composição familiar
- L10 — continuação mínima de composição familiar
- `qualification_civil` com dependente aplicável e roteamento P3

## 5. O que a PR anterior NÃO fechou

- trilho próprio de especiais
- roteamento real de P3 / multi
- stage contratado entre elegibilidade e docs
- L15–L17

## 6. Diagnóstico confirmado

- `schema/CODEX_WORKFLOW.md` lido e seguido
- contrato ativo, clause map, execution rules, status e handoff vivos lidos antes de editar
- A00, A01 e A02 confirmam que o Core continua sendo a frente ativa e que fala/surface seguem fora do escopo desta PR
- o PDF mestre foi consultado diretamente para as regras mínimas de L11 a L14
- `qualification_renda` e `qualification_eligibility` ainda estavam no caminho genérico de L03
- o recorte cabe no contrato sem drift porque implementa apenas o primeiro corte estrutural do Meio B

## 7. O que foi feito

- `src/core/especiais-rules.ts`
  - definiu facts, trilhos e políticas mínimas dos Especiais
- `src/core/especiais-parser.ts`
  - normalizou sinais de P3, multi-proponente e variante do co-participante
- `src/core/especiais-gates.ts`
  - adicionou gate de ausência crítica para P3 e multi
  - adicionou gate para co-participante autônomo sem IR confirmado
- `src/core/engine.ts`
  - plugou `qualification_special` no caminho real do Core
  - fez `qualification_eligibility` rotear para o stage especial quando houver P3 ou multi
  - preservou a saída estritamente estrutural
- `src/core/stage-map.ts`
  - adicionou `qualification_special` entre elegibilidade e docs
- `src/core/types.ts`
  - adicionou o stage e gate estruturais dos Especiais
- `src/core/meio-a-gates.ts`
  - deixou o sinal de P3 seguir até o stage especial contratado
- `src/core/smoke.ts`
  - adicionou cenários integrados de roteamento P3, bloqueio crítico e trilho multi válido

## 8. O que não foi feito

- não abriu L17
- não abriu docs, visita ou final operacional
- não adicionou fala mecânica
- não integrou Supabase
- não integrou Meta/WhatsApp
- não alterou o contrato ativo

## 9. O que esta PR fechou

- L15 — trilhos especiais P3 / multi
- L16 — variantes estruturais mínimas dos especiais
- `qualification_special` passou a rodar no caminho real do `engine.ts`
- `qualification_eligibility` agora decide entre `docs_prep` e `qualification_special`
- smoke integrado do Core passou com cenários de P3, ausência crítica, multi válido e co-participante autônomo
- Worker permaneceu sem fala mecânica

## 10. O que continua pendente após esta PR

- L17 — Final operacional

## 11. Esta tarefa foi fora de contrato?

**não**

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 11b. Recorte executado do contrato

L15 + L16 — Especiais: trilhos P3 / multi e variantes.

## 11c. Pendência contratual remanescente

L17 permanece em aberto.

## 11d. Houve desvio de contrato?

**não**

Esta PR continua dentro do contrato e sem drift porque:
- não muda o objetivo do contrato
- implementa exatamente o próximo recorte autorizado dos Especiais
- não abre Speech, Supabase, Áudio, Meta ou surface final
- mantém o Core devolvendo apenas estrutura e preserva a soberania do LLM sobre a fala

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `src/core/meio-a-rules.ts`
- `src/core/meio-a-parser.ts`
- `src/core/meio-a-gates.ts`
- `src/core/engine.ts`
- `src/core/especiais-rules.ts`
- `src/core/especiais-parser.ts`
- `src/core/especiais-gates.ts`
- `src/core/stage-map.ts`
- `src/core/types.ts`
- `src/core/smoke.ts`
- `schema/status/CORE_MECANICO_2_STATUS.md`
- `schema/handoffs/CORE_MECANICO_2_LATEST.md`
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`
- `schema/contracts/_INDEX.md`

## 13. Item do A01 atendido

- **Fase 2**
- **Prioridade 1**
- **Item**: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

**Sétima PR contratual: L17 — Final operacional, docs, visita e handoff.**

Próximo passo **atualizado** pela sequência natural do contrato após o fechamento de L15 + L16.

## 16. Riscos

- o recorte de Especiais foi mantido mínimo de propósito; L17 continua fechado
- qualquer expansão para renda, elegibilidade, canal ou fala precisa de PR própria
- o bloco L17 continua dependente de execução contratual futura

## 17. Provas

- `npm run smoke` → 14/14 passando pelo `runCoreEngine()`
- `npm run smoke:all` → Core + Worker passando
- commit técnico: `a3c27abec10af5222501e8dbcfae39705900af97` — `feat(core): integrar trilhos especiais no engine`
- cenário real de roteamento P3:
  - `qualification_eligibility` com `{"nacionalidade":"brasileiro","processo":"composicao_familiar","p3_required":true}` -> `stage_after="qualification_special"`, `next_objective="validar_trilho_p3"`
- cenário real de bloqueio crítico:
  - `qualification_special` com `{"processo":"composicao_familiar","p3_required":true}` -> `block_advance=true`, `next_objective="coletar_work_regime_p3"`
- cenário real de trilho especial válido:
  - `qualification_special` com `{"processo":"conjunto","work_regime_p2":"clt","monthly_income_p2":3600,"ctps_36m_p2":true}` -> `stage_after="docs_prep"`

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
  Clause map lido:             `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`
  Execution rules lidas:       `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`
  Status da frente lido:       `schema/status/CORE_MECANICO_2_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CORE_MECANICO_2_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03–L17 identificados estruturalmente
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — E6.2, F2 e F4; p3_required, work_regime_p2, monthly_income_p2, autonomo_has_ir_p2, ctps_36m_p2 e work_regime_p3 consultados diretamente
