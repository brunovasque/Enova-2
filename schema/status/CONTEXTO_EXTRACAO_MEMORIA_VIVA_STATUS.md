# STATUS VIVO — Contexto, Extração e Memória Viva — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Contexto, Extração e Memória Viva |
| Contrato ativo | Nenhum — contrato anterior encerrado em 2026-04-21 |
| Estado do contrato | encerrado |
| Última PR executou qual recorte | PR 39 — acceptance smoke + closeout da Frente 3 |
| Pendência contratual | nenhuma |
| Contrato encerrado? | sim — PR 39, contrato arquivado em `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md` |
| Item do A01 | Fase 3 — Prioridade 3: plugar extração multi-intenção e memória curta úteis; captar mais de um fato por turno sem perder trilho |
| Estado atual | concluída — acceptance smoke final passou e contrato encerrado formalmente |
| Classe da última tarefa | contratual |
| Última PR relevante | PR 39 — acceptance smoke + closeout da Frente 3 |
| Último commit funcional | `b2ddcec` — `test(context): adicionar acceptance smoke final` |
| Pendência remanescente herdada | nenhuma |
| Próximo passo autorizado | abrir o contrato da Frente 4 — Supabase Adapter e Persistência |
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

Contrato encerrado formalmente. A PR 36 entregou o schema base canônico, a PR 37 entregou consolidação mínima de múltiplos sinais no mesmo turno, a PR 38 entregou memória viva mínima útil e a PR 39 entregou o acceptance smoke final + closeout protocolar, sem abrir persistência, integração externa ou autoria de fala.

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
- PR 38 — memória viva mínima e útil:
  - artefato canônico criado em `src/context/living-memory.ts`
  - política explícita do que pode entrar em memória viva curta
  - rejeição explícita de transcript bruto, resposta anterior inteira, estado estrutural do Core, slot oficial e persistência de banco
  - consolidação derivada dos sinais da PR37 para próximo raciocínio, sem substituir Core, Speech ou Supabase Adapter
  - smoke específico ampliado em `src/context/smoke.ts`
- PR 39 — acceptance smoke + closeout:
  - acceptance smoke final integrado adicionado em `src/context/smoke.ts`
  - critérios C1-C7 verificados
  - readiness de closeout registrado em `schema/contracts/closeout/CONTEXTO_EXTRACAO_MEMORIA_VIVA_CLOSEOUT_READINESS.md`
  - contrato arquivado em `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
  - Frente 4 declarada como próxima frente autorizada, sem implementação

## 5. Pendências

nenhuma

## 6. Próximo passo autorizado

Abrir o contrato da Frente 4 — Supabase Adapter e Persistência.

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
  - PR38 era o próximo passo autorizado após a PR37; após a PR38, PR39 permanece pendente

## 6.3. Âncora e provas da PR 38

- Contrato ativo: `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
- A01: Fase 3 — Prioridade 3
- PDF mestre consultado: páginas 122-123, Contrato de Contexto, Extração de Slots e Memória Viva; páginas 7, 14 e 24 para base de estado/memória/resumo de contexto.
- Smoke específico: `npm run smoke:context`
- Prova de não drift:
  - memória viva é resumo operativo curto, não transcript bruto
  - memória viva preserva sinais úteis para próximo raciocínio
  - memória viva não substitui estado estrutural do Core
  - memória viva não escreve resposta final ao cliente
  - memória viva não decide regra de negócio
  - memória viva não avança stage
  - memória viva não persiste slot oficial
  - memória viva não assume persistência real da Frente 4
  - PR39 permanece pendente como acceptance smoke + closeout formal

## 6.4. Âncora e provas da PR 39

- Contrato encerrado: `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
- Closeout readiness: `schema/contracts/closeout/CONTEXTO_EXTRACAO_MEMORIA_VIVA_CLOSEOUT_READINESS.md`
- A01: Fase 3 — Prioridade 3 concluída
- PDF mestre consultado: páginas 122-123, Contrato de Contexto, Extração de Slots e Memória Viva; apoio nas páginas 7, 14 e 24.
- Acceptance smoke: `npm run smoke:context` — 11/11
- Smoke agregado: `npm run smoke:all`
- Critérios C1-C7:
  - C1 — Turno estruturado: cumprido
  - C2 — Sinais estruturados: cumprido
  - C3 — Multi-intenção real: cumprido
  - C4 — Governança preservada: cumprido
  - C5 — IA soberana na fala: cumprido
  - C6 — Memória viva mínima útil: cumprido
  - C7 — Smoke integrado final: cumprido
- Próxima frente autorizada: Frente 4 — Supabase Adapter e Persistência, apenas abertura contratual.

## 6.5. Encerramento de contrato

--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim — PRs 35-39 entregaram contexto estruturado, multi-sinal, memória viva mínima e acceptance smoke final
Critérios de aceite cumpridos?:         sim — C1, C2, C3, C4, C5, C6 e C7 cumpridos
Fora de escopo respeitado?:             sim
Pendências remanescentes:               nenhuma
Evidências / provas do encerramento:    PR 35-39, `npm run smoke:context`, `npm run smoke:all`, closeout readiness
Data de encerramento:                   2026-04-21
PR que encerrou:                        PR 39 — acceptance smoke + closeout da Frente 3
Destino do contrato encerrado:          archive — `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
Próximo contrato autorizado:            Frente 4 — Supabase Adapter e Persistência

## 7. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 8. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 9. Fontes consultadas — última tarefa

Fontes de verdade consultadas — última tarefa:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md` — lido antes do arquivamento; arquivado após closeout em `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
  Status da frente lido:       `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03, L05 e L19 identificados, não transcritos
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — páginas 122-123; apoio nas páginas 7, 14 e 24
