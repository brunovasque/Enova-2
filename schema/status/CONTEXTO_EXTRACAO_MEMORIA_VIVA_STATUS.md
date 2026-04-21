# STATUS VIVO — Contexto, Extração e Memória Viva — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Contexto, Extração e Memória Viva |
| Contrato ativo | `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md` |
| Estado do contrato | em execução |
| Última PR executou qual recorte | PR 36 — schema base de contexto e extração estruturada |
| Pendência contratual | executar PRs 37, 38 e 39 conforme contrato ativo |
| Contrato encerrado? | não |
| Item do A01 | Fase 3 — Prioridade 3: definir schema de extração estruturada do turno: slots, sinais, contexto, objeções, pendências e evidências |
| Estado atual | PR 36 entregue — schema base canônico criado; frente segue ativa para execução sequencial |
| Classe da última tarefa | contratual |
| Última PR relevante | PR 36 — schema base de contexto e extração estruturada |
| Último commit funcional | `7cb1fac` — `feat(context): criar schema base do turno` |
| Pendência remanescente herdada | executar PR 37 multi-informação; PR 38 memória viva mínima; PR 39 acceptance smoke + closeout |
| Próximo passo autorizado | PR 37 — múltiplas informações no mesmo turno |
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

Contrato em execução. A PR 36 entregou o schema base canônico da camada de Contexto + Extração Estruturada sem abrir memória viva funcional, persistência ou integração externa.

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

## 5. Pendências

- PR 37 — múltiplas informações no mesmo turno
- PR 38 — memória viva mínima e útil
- PR 39 — acceptance smoke + closeout formal

## 6. Próximo passo autorizado

PR 37 — múltiplas informações no mesmo turno.

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
  - PR37/PR38/PR39 permanecem pendentes

## 7. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 8. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional
