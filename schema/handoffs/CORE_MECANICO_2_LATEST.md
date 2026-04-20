# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-20T20:23:46.0353332-03:00 |
| Estado da frente                           | em execução — Meio B inicial integrado ao Core principal, com Worker ainda estrutural e sem fala mecânica |
| Classificação da tarefa                    | contratual — L11 + L12 + L13 + L14 do Core Mecânico 2 |
| Última PR relevante                        | PR de execução L09 + L10 — Meio A expandido integrado ao Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Recorte executado do contrato              | L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade |
| Pendência contratual remanescente          | L15–L17 em aberto; Especiais e Final pendentes |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 1: Core Mecânico 2 desacoplado da fala, agora com Meio B inicial plugado ao motor real |
| Próximo passo autorizado                   | Sexta PR contratual: L15 + L16 — Especiais: trilhos P3 / multi e variantes |
| Próximo passo foi alterado?                | não |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 já tinha L03, L04, L05, L06, L07, L08, L09 e L10 entregues, além de uma rota técnica mínima no Worker. O gap contratual seguinte era entrar no Meio B com regime, renda, CTPS e elegibilidade mínima sem abrir docs/final.

Esta PR fecha exatamente L11 + L12 + L13 + L14 em recorte mínimo: parser de renda/elegibilidade, regra de autônomo com IR obrigatório, sugestão estrutural por renda solo baixa, CTPS como sinal complementar e bloqueio por RNM. O recorte continua dentro do contrato ativo e sem drift porque não abre Especiais, docs, surface final ou fala mecânica. O Core continua devolvendo apenas estrutura.

O próximo passo autorizado muda de forma natural para L15 + L16, entrada nos trilhos especiais.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR de execução L09 + L10 — Meio A expandido integrado ao `engine.ts`.

## 4. O que a PR anterior fechou

- L03 — esqueleto estrutural
- L04 — regras do topo
- L05 — parser/extrator do topo
- L06 — critérios/gates do topo
- L09 — microregras de composição familiar
- L10 — continuação mínima de composição familiar
- `qualification_civil` com dependente aplicável e roteamento P3

## 5. O que a PR anterior NÃO fechou

- trilho próprio de regime e renda
- regras mínimas de IR, CTPS e elegibilidade
- bloqueio estrutural por RNM
- L11–L17

## 6. Diagnóstico confirmado

- `schema/CODEX_WORKFLOW.md` lido e seguido
- contrato ativo, clause map, execution rules, status e handoff vivos lidos antes de editar
- A00, A01 e A02 confirmam que o Core continua sendo a frente ativa e que fala/surface seguem fora do escopo desta PR
- o PDF mestre foi consultado diretamente para as regras mínimas de L11 a L14
- `qualification_renda` e `qualification_eligibility` ainda estavam no caminho genérico de L03
- o recorte cabe no contrato sem drift porque implementa apenas o primeiro corte estrutural do Meio B

## 7. O que foi feito

- `src/core/meio-b-rules.ts`
  - definiu facts, valores canônicos e políticas mínimas do Meio B
- `src/core/meio-b-parser.ts`
  - normalizou regime, renda, IR, CTPS, nacionalidade e RNM
- `src/core/meio-b-gates.ts`
  - adicionou gate para autônomo sem IR confirmado
  - adicionou gate para renda solo baixa antes de avançar
  - adicionou gate de elegibilidade para estrangeiro sem RNM válido
- `src/core/engine.ts`
  - plugou `qualification_renda` e `qualification_eligibility` no caminho real do Core
  - preservou a saída estritamente estrutural
- `src/core/smoke.ts`
  - adicionou cenários integrados de ausência crítica, trilho válido, autônomo sem IR e elegibilidade

## 8. O que não foi feito

- não abriu Especiais
- não abriu Final operacional, docs ou visita
- não adicionou fala mecânica
- não integrou Supabase
- não integrou Meta/WhatsApp
- não alterou o contrato ativo

## 9. O que esta PR fechou

- L11 — regime e renda
- L12 — continuação mínima de regime/renda
- L13 — CTPS e dependentes do recorte mínimo
- L14 — gates e restrições de elegibilidade do Meio B
- `qualification_renda` e `qualification_eligibility` passaram a rodar no caminho real do `engine.ts`
- smoke integrado do Core passou com cenários de ausência crítica, trilho válido, autônomo sem IR e RNM
- Worker permaneceu sem fala mecânica

## 10. O que continua pendente após esta PR

- L15 + L16 — Especiais
- L17 — Final operacional

## 11. Esta tarefa foi fora de contrato?

**não**

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 11b. Recorte executado do contrato

L11 + L12 + L13 + L14 — Meio B: regime, renda, CTPS e elegibilidade.

## 11c. Pendência contratual remanescente

L15–L17 permanecem em aberto.

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
- `src/core/meio-b-rules.ts`
- `src/core/meio-b-parser.ts`
- `src/core/meio-b-gates.ts`
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

**Sexta PR contratual: L15 + L16 — Especiais: trilhos P3 / multi e variantes.**

Próximo passo **atualizado** pela sequência natural do contrato após o fechamento de L11 + L12 + L13 + L14.

## 16. Riscos

- o recorte de Meio B foi mantido mínimo de propósito; Especiais e Final continuam fechados
- qualquer expansão para renda, elegibilidade, canal ou fala precisa de PR própria
- os blocos L15–L17 continuam dependentes de execução contratual futura

## 17. Provas

- `npm run smoke` → 10/10 passando pelo `runCoreEngine()`
- `npm run smoke:all` → Core + Worker passando
- commit técnico: `c587aa15540860dbc525e8f3fa92bcb7066d1c64` — `feat(core): integrar meio b inicial no engine`
- cenário real de bloqueio crítico:
  - `qualification_renda` com `{"renda_principal":3200}` -> `block_advance=true`, `next_objective="coletar_regime_trabalho"`
- cenário real de trilho válido do Meio B:
  - `qualification_renda` com `{"processo":"conjunto","regime_trabalho":"clt","renda_principal":4200,"ctps_36":false}` -> `stage_after="qualification_eligibility"`
- cenário real em que a elegibilidade altera o next step:
  - `qualification_eligibility` com `{"nacionalidade":"estrangeiro","rnm_status":"ausente"}` -> `stage_after="qualification_eligibility"`, `next_objective="validar_rnm"`

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — taxonomias F1/F3/F4 e regras mínimas de L11/L14 consultadas diretamente
