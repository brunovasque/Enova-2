# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-20T19:41:16.3186022-03:00 |
| Estado da frente                           | em execução — Meio A inicial integrado ao Core principal, com Worker ainda estrutural e sem fala mecânica |
| Classificação da tarefa                    | contratual — L07 + L08 do Core Mecânico 2 |
| Última PR relevante                        | PR de execução L04+L05+L06 — topo do funil integrado ao Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Recorte executado do contrato              | L07 + L08 — Meio A: estado civil e composição familiar (parte 1) |
| Pendência contratual remanescente          | L09–L17 em aberto; continuação do Meio A, Meio B, Especiais e Final pendentes |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 1: Core Mecânico 2 desacoplado da fala, agora com Meio A inicial plugado ao motor real |
| Próximo passo autorizado                   | Quarta PR contratual: L09 + L10 — Meio A: composição familiar (parte 2) |
| Próximo passo foi alterado?                | não |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 já tinha L03, L04, L05 e L06 entregues, além de uma rota técnica mínima no Worker. O gap contratual seguinte era fazer `qualification_civil` deixar de ser apenas slot estrutural e passar a rodar um recorte real de Meio A no `engine.ts`.

Esta PR fecha exatamente L07 + L08 em recorte mínimo: estado civil, processo e composição familiar inicial. O recorte continua dentro do contrato ativo e sem drift porque não abre renda, elegibilidade, docs, surface final ou fala mecânica. O Core continua devolvendo apenas estrutura.

O próximo passo autorizado muda de forma natural para L09 + L10, continuação do Meio A.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR de integração mínima do Worker — Core exposto via `/__core__/run`.

## 4. O que a PR anterior fechou

- L03 — esqueleto estrutural
- L04 — regras do topo
- L05 — parser/extrator do topo
- L06 — critérios/gates do topo
- integração mínima do Core ao Worker

## 5. O que a PR anterior NÃO fechou

- trilho próprio de Meio A no `engine.ts`
- parser/extrator mínimo de estado civil e composição familiar
- critérios/gates reais de `qualification_civil`
- L07–L17

## 6. Diagnóstico confirmado

- `schema/CODEX_WORKFLOW.md` lido e seguido
- contrato ativo, clause map, execution rules, status e handoff vivos lidos antes de editar
- A00, A01 e A02 confirmam que o Core continua sendo a frente ativa e que fala/surface seguem fora do escopo desta PR
- o PDF mestre foi consultado diretamente para as regras mínimas de L07 e L08
- `src/core/engine.ts` ainda tratava `qualification_civil` pelo caminho genérico de L03
- o recorte cabe no contrato sem drift porque implementa apenas o primeiro corte estrutural do Meio A

## 7. O que foi feito

- `src/core/meio-a-rules.ts`
  - definiu facts mínimos, valores canônicos e política estrutural de L07 + L08
- `src/core/meio-a-parser.ts`
  - normalizou `estado_civil`, `processo` e `composition_actor`
- `src/core/meio-a-gates.ts`
  - aplicou bloqueio por fact crítico ausente
  - aplicou regra de `casado_civil -> processo=conjunto`
  - aplicou bloqueio de composição sem ator quando `processo=composicao_familiar`
- `src/core/engine.ts`
  - plugou `qualification_civil` no caminho real do Core
- `src/core/smoke.ts`
  - adicionou cenários integrados de bloqueio, avanço e composição mínima relevante
- `src/core/types.ts`
  - exportou os tipos do Meio A

## 8. O que não foi feito

- não abriu Meio B
- não abriu renda, elegibilidade, docs ou final operacional
- não adicionou fala mecânica
- não integrou Supabase
- não integrou Meta/WhatsApp
- não alterou o contrato ativo

## 9. O que esta PR fechou

- L07 — estado civil estrutural
- L08 — composição familiar mínima estrutural
- `qualification_civil` passou a rodar no caminho real do `engine.ts`
- smoke integrado do Core passou com cenários de bloqueio, avanço e composição mínima relevante
- Worker permaneceu sem fala mecânica

## 10. O que continua pendente após esta PR

- L09 + L10 — continuação do Meio A
- L11 + L12 + L13 + L14 — Meio B
- L15 + L16 — Especiais
- L17 — Final operacional

## 11. Esta tarefa foi fora de contrato?

**não**

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 11b. Recorte executado do contrato

L07 + L08 — Meio A: estado civil e composição familiar (parte 1).

## 11c. Pendência contratual remanescente

L09–L17 permanecem em aberto.

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
- `src/core/types.ts`
- `schema/status/CORE_MECANICO_2_STATUS.md`
- `schema/handoffs/CORE_MECANICO_2_LATEST.md`
- `schema/contracts/_INDEX.md`

## 13. Item do A01 atendido

- **Fase 2**
- **Prioridade 1**
- **Item**: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

**Quarta PR contratual: L09 + L10 — Meio A: composição familiar (parte 2).**

Próximo passo **atualizado** pela sequência natural do contrato após o fechamento de L07 + L08.

## 16. Riscos

- o recorte de composição foi mantido mínimo de propósito; micro regras adicionais ficam para L09 + L10
- qualquer expansão para renda, elegibilidade, canal ou fala precisa de PR própria
- os blocos L09–L17 continuam dependentes de execução contratual futura

## 17. Provas

- `npm run smoke` → 5/5 passando pelo `runCoreEngine()`
- `npm run smoke:all` → Core + Worker passando
- commit técnico: `cc1e98aae76fc6ca7c3c224ce134eed89dc44948` — `feat(core): integrar meio a inicial no engine`
- cenário real de bloqueio do Meio A:
  - `qualification_civil` com `{"estado_civil":"solteiro"}` -> `block_advance=true`, `next_objective="coletar_processo"`
- cenário real de avanço do Meio A:
  - `qualification_civil` com `{"estado_civil":"uniao_estavel","processo":"conjunto"}` -> `stage_after="qualification_renda"`
- cenário real de composição mínima relevante:
  - `qualification_civil` com `{"estado_civil":"solteiro","processo":"composicao_familiar","composition_actor":"mae"}` -> `stage_after="qualification_renda"`

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — taxonomia F2 e regras mínimas de L07/L08 consultadas diretamente
