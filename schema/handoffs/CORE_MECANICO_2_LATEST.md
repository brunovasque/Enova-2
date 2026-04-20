# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-20T19:04:45.2886583-03:00 |
| Estado da frente                           | em execução — Core exposto no Worker por rota estrutural mínima, sem fala mecânica |
| Classificação da tarefa                    | contratual — integração mínima do Core atual ao Worker |
| Última PR relevante                        | PR de execução L04+L05+L06 — topo do funil integrado ao Core Mecânico 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` |
| Recorte executado do contrato              | Integração mínima do Core no Worker com rota `POST /__core__/run` e smoke real da rota |
| Pendência contratual remanescente          | L07–L17 em aberto; Meio A, Meio B, Especiais e Final pendentes |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 1: Core Mecânico 2 desacoplado da fala, agora com entrada técnica viva no Worker |
| Próximo passo autorizado                   | Terceira PR contratual: L07 + L08 — Meio A: estado civil e composição familiar |
| Próximo passo foi alterado?                | não |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 já existia no repositório com L03 entregue e com L04+L05+L06 integrados ao `engine.ts`, mas o `src/worker.ts` ainda era placeholder puro. Esta PR fecha exatamente essa lacuna: o Worker agora expõe uma rota técnica mínima que chama o Core real e devolve somente saída estrutural.

O recorte continua dentro do contrato ativo e sem drift. Nenhuma regra nova de negócio foi criada, nenhum texto de atendimento foi aberto, nenhum surface final foi introduzido e nenhuma outra frente foi puxada junto. A mudança só torna vivo, no Worker, o Core já existente.

O próximo passo autorizado de negócio permanece o mesmo: L07 + L08. Esta PR não reordena o contrato; ela fecha a integração mínima que faltava para o Core deixar de ser apenas interno.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR de execução L04+L05+L06 — topo do funil integrado ao Core Mecânico 2.

## 4. O que a PR anterior fechou

- L04 — regras do topo
- L05 — parser/extrator do topo
- L06 — critérios/gates do topo
- integração do topo ao `runCoreEngine()`
- smoke do Core 5/5 passando

## 5. O que a PR anterior NÃO fechou

- exposição do Core pelo Worker
- rota técnica viva para executar o Core fora do smoke interno
- prova de rota real no Worker
- L07–L17

## 6. Diagnóstico confirmado

- `schema/CODEX_WORKFLOW.md` lido e seguido
- contrato ativo, clause map, execution rules, status e handoff vivos lidos antes de editar
- A00, A01 e A02 confirmam que o Core continua sendo a frente ativa e que fala/surface seguem fora do escopo desta PR
- `src/core/engine.ts` já executava o Core real
- `src/worker.ts` ainda respondia apenas com placeholder
- o recorte cabe no contrato sem drift porque apenas pluga o Core existente numa entrada técnica mínima e continua sem fala mecânica

## 7. O que foi feito

- `src/worker.ts`
  - removeu o placeholder puro
  - manteve `GET /` como rota técnica simples
  - adicionou `POST /__core__/run`
  - validou input estrutural controlado (`lead_id`, `current_stage`, `facts`)
  - chamou `runCoreEngine()` real
  - devolveu apenas `stage_current`, `stage_after`, `next_objective`, `block_advance`, `gates_activated` e `speech_intent`
- `src/worker-route-smoke.ts`
  - criou smoke real da rota passando pelo `fetch` do Worker
  - validou cenário de avanço e cenário de bloqueio
  - provou shape estrutural exato e ausência de campos não pedidos
- `package.json`
  - adicionou `smoke:worker`
  - adicionou `smoke:all`
- `docs/BOOTSTRAP_CLOUDFLARE.md` e `README.md`
  - removeram a afirmação de que `src/worker.ts` ainda era placeholder puro
  - documentaram a entrada técnica mínima real

## 8. O que não foi feito

- não abriu Meio A, Meio B, Especiais ou Final
- não adicionou fala mecânica
- não criou builder de resposta ou surface final
- não integrou Supabase
- não integrou Meta/WhatsApp
- não adicionou bindings ou permissões Cloudflare novas
- não alterou o contrato ativo

## 9. O que esta PR fechou

- `src/worker.ts` deixou de ser placeholder puro
- o Worker passou a expor uma rota mínima real do Core
- a rota executa o Core real, não mock
- a saída permanece estrutural e sem fala mecânica
- a prova real da rota passou

## 10. O que continua pendente após esta PR

- L07 + L08 — Meio A
- L09 + L10 — continuação do Meio A
- L11 + L12 + L13 + L14 — Meio B
- L15 + L16 — Especiais
- L17 — Final operacional

## 11. Esta tarefa foi fora de contrato?

**não**

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`

## 11b. Recorte executado do contrato

Integração mínima do Core atual ao Worker para criar uma entrada técnica viva sem abrir fala mecânica.

## 11c. Pendência contratual remanescente

L07–L17 permanecem em aberto.

## 11d. Houve desvio de contrato?

**não**

Esta PR continua dentro do contrato e sem drift porque:
- não muda o objetivo do contrato
- não cria regra nova de negócio
- não abre Speech, Supabase, Áudio, Meta ou surface final
- apenas expõe tecnicamente, no Worker, o Core já contratado e já implementado

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `src/worker.ts`
- `src/worker-route-smoke.ts`
- `package.json`
- `docs/BOOTSTRAP_CLOUDFLARE.md`
- `README.md`
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

**Terceira PR contratual: L07 + L08 — Meio A: estado civil e composição familiar.**

Próximo passo **preservado**. Esta PR fecha uma integração técnica mínima do Worker e não muda a ordem do contrato.

## 16. Riscos

- o Worker já tem entrada técnica viva, mas ainda não é a surface final do produto
- a rota é deliberadamente mínima; qualquer expansão para fala, canal ou persistência precisa de PR própria
- os blocos L07–L17 continuam dependentes de execução contratual futura

## 17. Provas

- commit técnico: `01da787578d2f2e22fb81bee854d87103ef819d8` — `feat(worker): expor rota minima do core`
- `npm run smoke` → 5/5 passando
- `npm run smoke:worker` → 2 cenários passando via `fetch` do Worker
- request real de avanço:
  - `POST /__core__/run`
  - body: `{"lead_id":"worker-smoke-001","current_stage":"discovery","facts":{"customer_goal":"comprar_imovel","offtrack_type":"curiosidade"}}`
- response real de avanço:
  - `{"stage_current":"discovery","stage_after":"qualification_civil","next_objective":"avancar_para_qualification_civil","block_advance":false,"gates_activated":[],"speech_intent":"transicao_stage"}`
- request real de bloqueio:
  - `POST /__core__/run`
  - body: `{"lead_id":"worker-smoke-002","current_stage":"discovery","facts":{}}`
- response real de bloqueio:
  - `{"stage_current":"discovery","stage_after":"discovery","next_objective":"coletar_customer_goal","block_advance":true,"gates_activated":["G_FATO_CRITICO_AUSENTE"],"speech_intent":"bloqueio"}`

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
  Status da frente lido:       `schema/status/CORE_MECANICO_2_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CORE_MECANICO_2_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03–L17 identificados estruturalmente
  PDF mestre consultado:       não consultado — esta PR não implementa nova regra de negócio; consome o Core já executado em L03/L04/L05/L06
