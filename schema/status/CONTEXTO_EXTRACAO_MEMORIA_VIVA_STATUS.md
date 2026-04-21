# STATUS VIVO — Contexto, Extração e Memória Viva — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Contexto, Extração e Memória Viva |
| Contrato ativo | `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md` |
| Estado do contrato | em execução |
| Última PR executou qual recorte | PR 37 — múltiplas informações no mesmo turno |
| Pendência contratual | executar PRs 38 e 39 conforme contrato ativo |
| Contrato encerrado? | não |
| Item do A01 | Fase 3 — Prioridade 3: plugar extração multi-intenção e memória curta úteis; captar mais de um fato por turno sem perder trilho |
| Estado atual | PR 37 entregue — multi-sinal mínimo consolidado; frente segue ativa para execução sequencial |
| Classe da última tarefa | contratual |
| Última PR relevante | PR 37 — múltiplas informações no mesmo turno |
| Último commit funcional | `8c6f9c6` — `feat(context): consolidar multiplos sinais do turno` |
| Pendência remanescente herdada | executar PR 38 memória viva mínima; PR 39 acceptance smoke + closeout |
| Próximo passo autorizado | PR 38 — memória viva mínima e útil |
| Legados aplicáveis | L03 e L05 como base estrutural; L19 como frente canônica de Contexto e Memória Viva |
| Mudanças em dados persistidos (Supabase) | nenhuma |
| Permissões Cloudflare necessárias | nenhuma adicional |
| Última atualização | 2026-04-21 |

---

## 1. Nome da frente

Contexto, Extração Estruturada e Memória Viva.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`

## 3. Estado atual

Contrato em execução. A PR 36 entregou o schema base canônico e a PR 37 entregou consolidação mínima de múltiplos sinais no mesmo turno, sem abrir memória viva funcional, persistência ou integração externa.

## 4. Entregas concluídas

- Contrato da Frente 3 aberto.
- Índice de contratos atualizado.
- Status vivo criado.
- Handoff vivo criado.
- PR 36 — schema base de contexto e extração estruturada:
  - pacote semântico único por turno criado em `src/context/schema.ts`
  - shape de sinais separado em facts, intents, questions, objections, slot_candidates, pending, ambiguities, evidence e confidence
  - guardrails explícitos para impedir autoria de fala, decisão de regra de negócio, avanço de stage e persistência oficial de slot pela camada de contexto
  - smoke mínimo criado em `src/context/smoke.ts`
  - script `npm run smoke:context` adicionado e incluído em `npm run smoke:all`
- PR 37 — múltiplas informações no mesmo turno:
  - consolidador multi-sinal criado em `src/context/multi-signal.ts`
  - sinais consolidados sem colapsar em string solta
  - distinção explícita entre `accepted`, `pending` e `requires_confirmation`
  - preservação de `current_objective`, `block_advance` e `gates_activated`
  - saída estrutural para Core e IA sem decisão autônoma e sem surface mecânica
  - smoke específico ampliado em `src/context/smoke.ts`

## 5. Pendências

- PR 38 — memória viva mínima e útil
- PR 39 — acceptance smoke + closeout formal

## 6. Próximo passo autorizado

PR 38 — memória viva mínima e útil.

## 6.1. Âncora e provas da PR 36

- Contrato ativo: `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
- A01: Fase 3 — Prioridade 3
- PDF mestre consultado: páginas 122-123, Contrato de Contexto, Extração de Slots e Memória Viva
- Smoke específico: `npm run smoke:context`
- Prova de não drift:
  - contexto informa Core/Speech, mas não escreve resposta ao cliente
  - contexto não decide regra de negócio
  - contexto não avança stage
  - contexto não persiste slot oficial
  - PR37 era o próximo passo autorizado após a PR36

## 6.2. Âncora e provas da PR 37

- Contrato ativo: `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
- A01: Fase 3 — Prioridade 3
- PDF mestre consultado: páginas 118-119 e 122-123
- Smoke específico: `npm run smoke:context`
- Smoke agregado: `npm run smoke:all`
- Prova de não drift:
  - múltiplos sinais entram como estrutura, não string solta
  - aceito/pendente/exige confirmação ficam separados
  - objetivo atual e bloqueios são preservados
  - contexto não escreve resposta final
  - contexto não decide regra de negócio
  - contexto não avança stage
  - contexto não persiste slot oficial
  - PR38/PR39 permanecem pendentes

## 7. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 8. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional
