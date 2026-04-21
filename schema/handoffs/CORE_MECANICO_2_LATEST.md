# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-20T21:34:11.7830094-03:00 |
| Estado da frente                           | em execução — Core completo até o handoff final, com Worker estrutural e sem fala mecânica |
| Classificação da tarefa                    | contratual — L17 do Core Mecânico 2 |
| Última PR relevante                        | PR de execução L15 + L16 — Especiais integrados ao Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Recorte executado do contrato              | L17 — Final operacional, docs, visita e handoff |
| Pendência contratual remanescente          | nenhuma |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 1: Core Mecânico 2 desacoplado da fala, agora completo do topo ao handoff |
| Próximo passo autorizado                   | reavaliar encerramento formal do contrato do Core Mecânico 2 |
| Próximo passo foi alterado?                | sim |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 já tinha L03–L16 entregues, além de uma rota técnica mínima no Worker. O gap contratual final era ligar docs, visita e handoff ao motor real sem abrir fala, canal ou persistência.

Esta PR fecha exatamente L17 em recorte mínimo: parser final, gates de docs/visita/handoff, integração de `docs_prep`, `docs_collection`, `visit` e `broker_handoff` ao `engine.ts`, além da prova ponta a ponta no Worker. O recorte continua dentro do contrato ativo e sem drift porque não abre Supabase, canal, surface final ou fala mecânica. O Core continua devolvendo apenas estrutura.

Como L03–L17 ficaram cobertos e o smoke topo → final passou, o contrato agora pode ser reavaliado para encerramento com segurança, mas o closeout formal ainda não foi aplicado nesta PR.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR de execução L15 + L16 — Especiais integrados ao `engine.ts`.

## 4. O que a PR anterior fechou

- L03 — esqueleto estrutural
- L04 — regras do topo
- L05 — parser/extrator do topo
- L06 — critérios/gates do topo
- L09 — microregras de composição familiar
- L10 — continuação mínima de composição familiar
- `qualification_civil` com dependente aplicável e roteamento P3

## 5. O que a PR anterior NÃO fechou

- docs_prep, docs_collection, visit e broker_handoff ainda dependiam do caminho genérico de L03
- faltava tratar handoff e visita como estado estrutural real
- faltava prova topo → final para encerrar o contrato

## 6. Diagnóstico confirmado

- `schema/CODEX_WORKFLOW.md` lido e seguido
- contrato ativo, clause map, execution rules, status e handoff vivos lidos antes de editar
- A00, A01 e A02 confirmam que o Core continua sendo a frente ativa e que fala/surface seguem fora do escopo desta PR
- o PDF mestre foi consultado diretamente para as regras mínimas de L11 a L14
- `qualification_renda` e `qualification_eligibility` ainda estavam no caminho genérico de L03
- o recorte cabe no contrato sem drift porque implementa apenas o primeiro corte estrutural do Meio B

## 7. O que foi feito

- `src/core/final-rules.ts`
  - definiu facts, trilhos e políticas mínimas do recorte final
- `src/core/final-parser.ts`
  - normalizou canal de docs, visita, status documentais e handoff_readiness
- `src/core/final-gates.ts`
  - adicionou gates mínimos de docs, visita e handoff
- `src/core/engine.ts`
  - plugou `docs_prep`, `docs_collection`, `visit` e `broker_handoff` no caminho real do Core
  - preservou a saída estritamente estrutural
- `src/core/stage-map.ts`
  - adicionou slot de gate final para os stages operacionais
- `src/core/types.ts`
  - adicionou o gate estrutural do Final operacional
- `src/core/smoke.ts`
  - adicionou cenários integrados do final e a trilha completa topo → handoff
- `src/worker.ts`
  - passou a aceitar `qualification_special` na rota viva
- `src/worker-route-smoke.ts`
  - adicionou provas reais de L17 via `POST /__core__/run`

## 8. O que não foi feito

- não abriu Supabase
- não abriu Meta/WhatsApp
- não abriu surface final nem fala mecânica
- não adicionou fala mecânica
- não alterou o contrato ativo

## 9. O que esta PR fechou

- L17 — final operacional / docs / visita / handoff
- `docs_prep`, `docs_collection`, `visit` e `broker_handoff` passaram a rodar no caminho real do `engine.ts`
- smoke topo → final passou no Core
- Worker provou o recorte final via rota `/__core__/run`
- Worker permaneceu sem fala mecânica

## 10. O que continua pendente após esta PR

nenhuma

## 11. Esta tarefa foi fora de contrato?

**não**

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 11b. Recorte executado do contrato

L17 — Final operacional, docs, visita e handoff.

## 11c. Pendência contratual remanescente

nenhuma técnica.

## 11d. Houve desvio de contrato?

**não**

Esta PR continua dentro do contrato e sem drift porque:
- não muda o objetivo do contrato
- implementa exatamente o recorte final autorizado do contrato
- não abre Speech, Supabase, Áudio, Meta ou surface final
- mantém o Core devolvendo apenas estrutura e preserva a soberania do LLM sobre a fala

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `src/core/engine.ts`
- `src/core/final-rules.ts`
- `src/core/final-parser.ts`
- `src/core/final-gates.ts`
- `src/core/stage-map.ts`
- `src/core/types.ts`
- `src/core/smoke.ts`
- `src/worker.ts`
- `src/worker-route-smoke.ts`
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

**Reavaliar encerramento formal do contrato do Core Mecânico 2.**

O recorte técnico do Core foi fechado; o closeout formal depende de decisão explícita após esta PR.

## 16. Riscos

- o recorte final foi mantido no mínimo estrutural ancorado ao PDF
- qualquer expansão para Speech, Supabase, Meta, telemetria ou surface precisa de contrato próprio
- o contrato do Core ainda está ativo até a aplicação formal do closeout

## 17. Provas

- `npm run smoke` → 19/19 passando pelo `runCoreEngine()`
- `npm run smoke:all` → Core + Worker passando
- `npm run smoke:worker` → Worker passando com cenário L17 via rota viva
- commit técnico: `18fef05f62a6ba9eec01cbef378607459dca4c1f` — `feat(core): integrar l17 final operacional`
- cenário real de visita:
  - `docs_prep` com `{"docs_channel_choice":"visita presencial","visit_interest":"sim"}` -> `stage_after="visit"`
- cenário real de docs completos:
  - `docs_collection` com `{"doc_identity_status":"validado","doc_income_status":"recebido","doc_residence_status":"recebido"}` -> `stage_after="broker_handoff"`
- cenário real de handoff concluído:
  - `broker_handoff` com `{"handoff_readiness":"pronto para correspondente"}` -> `next_objective="handoff_concluido_correspondente"`

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — E7.3, F7, F8, handoff_readiness e 4.1 Fases macro consultados diretamente
