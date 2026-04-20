# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-20T20:06:02.8627195-03:00 |
| Estado da frente                           | em execução — Meio A completo até L10 no Core principal, com Worker ainda estrutural e sem fala mecânica |
| Classificação da tarefa                    | contratual — L09 + L10 do Core Mecânico 2 |
| Última PR relevante                        | PR de execução L07 + L08 — Meio A inicial integrado ao Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Recorte executado do contrato              | L09 + L10 — Meio A: composição familiar (parte 2) |
| Pendência contratual remanescente          | L11–L17 em aberto; Meio B, Especiais e Final pendentes |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 1: Core Mecânico 2 desacoplado da fala, agora com Meio A fechado até L10 no motor real |
| Próximo passo autorizado                   | Quinta PR contratual: L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade |
| Próximo passo foi alterado?                | não |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 já tinha L03, L04, L05, L06, L07 e L08 entregues, além de uma rota técnica mínima no Worker. O gap contratual seguinte era aprofundar a composição familiar dentro do próprio `qualification_civil`, sem abrir Meio B.

Esta PR fecha exatamente L09 + L10 em recorte mínimo: dependente aplicável, quantidade de dependentes e roteamento estrutural de P3. O recorte continua dentro do contrato ativo e sem drift porque não abre renda, elegibilidade, docs, surface final ou fala mecânica. O Core continua devolvendo apenas estrutura.

O próximo passo autorizado muda de forma natural para L11 + L14, entrada no Meio B.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR de execução L07 + L08 — Meio A inicial integrado ao `engine.ts`.

## 4. O que a PR anterior fechou

- L03 — esqueleto estrutural
- L04 — regras do topo
- L05 — parser/extrator do topo
- L06 — critérios/gates do topo
- integração mínima do Core ao Worker
- L07 — estado civil estrutural
- L08 — composição familiar inicial

## 5. O que a PR anterior NÃO fechou

- microregras adicionais de composição familiar
- distinção estrutural de dependente aplicável
- roteamento estrutural de P3
- L09–L17

## 6. Diagnóstico confirmado

- `schema/CODEX_WORKFLOW.md` lido e seguido
- contrato ativo, clause map, execution rules, status e handoff vivos lidos antes de editar
- A00, A01 e A02 confirmam que o Core continua sendo a frente ativa e que fala/surface seguem fora do escopo desta PR
- o PDF mestre foi consultado diretamente para as regras mínimas de L09 e L10
- `qualification_civil` já estava integrado ao `engine.ts`, mas ainda sem dependente aplicável e P3
- o recorte cabe no contrato sem drift porque implementa apenas o próximo corte estrutural da composição familiar

## 7. O que foi feito

- `src/core/meio-a-rules.ts`
  - expandiu os facts opcionais do Meio A com `p3_required`, `dependents_applicable` e `dependents_count`
  - adicionou bloqueios estruturais de dependente e P3
- `src/core/meio-a-parser.ts`
  - normalizou os novos sinais estruturais de composição familiar
- `src/core/meio-a-gates.ts`
  - adicionou gate para `dependents_applicable=true` sem `dependents_count`
  - adicionou roteamento estrutural quando `p3_required=true`
- `src/core/engine.ts`
  - passou a respeitar `next_objective` específico devolvido pelos critérios do Meio A
  - preservou a saída estritamente estrutural
- `src/core/smoke.ts`
  - adicionou cenários integrados de dependente aplicável e P3

## 8. O que não foi feito

- não abriu Meio B
- não abriu renda, elegibilidade, docs ou final operacional
- não adicionou fala mecânica
- não integrou Supabase
- não integrou Meta/WhatsApp
- não alterou o contrato ativo

## 9. O que esta PR fechou

- L09 — microregras de composição familiar
- L10 — continuação mínima de composição familiar
- `qualification_civil` passou a distinguir composição válida, dependente aplicável e P3
- smoke integrado do Core passou com cenários de ausência crítica, composição válida, dependente e P3
- Worker permaneceu sem fala mecânica

## 10. O que continua pendente após esta PR

- L11 + L12 + L13 + L14 — Meio B
- L15 + L16 — Especiais
- L17 — Final operacional

## 11. Esta tarefa foi fora de contrato?

**não**

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 11b. Recorte executado do contrato

L09 + L10 — Meio A: composição familiar (parte 2).

## 11c. Pendência contratual remanescente

L11–L17 permanecem em aberto.

## 11d. Houve desvio de contrato?

**não**

Esta PR continua dentro do contrato e sem drift porque:
- não muda o objetivo do contrato
- implementa exatamente o próximo recorte autorizado do Meio A
- não abre Speech, Supabase, Áudio, Meta ou surface final
- mantém o Core devolvendo apenas estrutura e preserva a soberania do LLM sobre a fala

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `src/core/meio-a-rules.ts`
- `src/core/meio-a-parser.ts`
- `src/core/meio-a-gates.ts`
- `src/core/engine.ts`
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

**Quinta PR contratual: L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade.**

Próximo passo **atualizado** pela sequência natural do contrato após o fechamento de L09 + L10.

## 16. Riscos

- o recorte de composição foi mantido mínimo de propósito; o restante do funil continua fechado
- qualquer expansão para renda, elegibilidade, canal ou fala precisa de PR própria
- os blocos L11–L17 continuam dependentes de execução contratual futura

## 17. Provas

- `npm run smoke` → 6/6 passando pelo `runCoreEngine()`
- commit técnico: `e5c335ad62bc7e2b72471385b8a39a13436a0340` — `feat(core): expandir composicao familiar do meio a`
- cenário real de bloqueio crítico:
  - `qualification_civil` com `{"estado_civil":"solteiro"}` -> `block_advance=true`, `next_objective="coletar_processo"`
- cenário real de composição válida:
  - `qualification_civil` com `{"estado_civil":"solteiro","processo":"composicao_familiar","composition_actor":"mae","p3_required":false,"dependents_applicable":false}` -> `stage_after="qualification_renda"`
- cenário real de composição relevante que altera next step:
  - `qualification_civil` com `{"estado_civil":"solteiro","processo":"composicao_familiar","composition_actor":"irmao","p3_required":true}` -> `stage_after="qualification_civil"`, `next_objective="avaliar_p3"`

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — taxonomia F2, F6 e regras mínimas de L09/L10 consultadas diretamente
