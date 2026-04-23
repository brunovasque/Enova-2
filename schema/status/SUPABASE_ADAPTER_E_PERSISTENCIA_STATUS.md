# STATUS VIVO — Supabase Adapter e Persistencia — ENOVA 2

## Aviso de rebase canonico — 2026-04-22

Este arquivo preserva o historico tecnico/local do recorte anterior. Apos o rebase canonico, ele nao deve ser lido como prova de implantacao macro concluida. A base macro soberana passou a ser `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`; a fase real atual e T0/G0, conforme `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.


| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Contrato ativo | Nenhum — contrato anterior encerrado em 2026-04-21 |
| Estado do contrato | encerrado |
| Ultima PR executou qual recorte | PR 44 — runtime real mínimo + smoke persistente integrado + closeout formal da Frente 4 |
| Pendencia contratual | nenhuma |
| Contrato encerrado? | sim |
| Item do A01 | Prioridade 4 — criar Supabase Adapter com namespace novo, persistencia explicavel e trilho de compatibilidade com ENOVA 1 |
| Estado atual | encerrada |
| Classe da ultima tarefa | contratual + closeout |
| Ultima PR relevante | PR 44 — runtime real mínimo + smoke persistente integrado + closeout formal da Frente 4 |
| Ultimo commit funcional | (commit final desta PR — runtime + smoke persistente + closeout) |
| Pendencia remanescente herdada | nenhuma — Frente 4 encerrada |
| Proximo passo autorizado | abrir Contrato da Frente 5 — Áudio e Multimodalidade (sem execução nesta PR) |
| Legados aplicaveis | L03 e L18 obrigatorios (cumpridos); L19 complementar |
| Mudancas em dados persistidos (Supabase) | nenhuma — runtime opera contra `InMemoryPersistenceBackend`; backend Supabase remoto é etapa de deployment futura |
| Permissoes Cloudflare necessarias | nenhuma adicional |
| Ultima atualizacao | 2026-04-21 |

---

## 1. Nome da frente

Supabase Adapter e Persistencia.

## 2. Contrato ativo

Nenhum. O contrato foi encerrado formalmente em 2026-04-21 pela PR 44 e arquivado em `schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md`.

## 3. Estado atual

**Encerrada.** A PR 44 entregou o runtime real mínimo do Supabase Adapter (`src/adapter/runtime.ts`), o smoke persistente integrado (`src/adapter/runtime-smoke.ts`) e executou o `CONTRACT_CLOSEOUT_PROTOCOL.md`. Todos os critérios C1–C8 do contrato foram cumpridos e provados. O contrato foi movido para `archive/`.

## 4. Entregas concluidas

- contrato ativo da Frente 4 criado (PR 40)
- indice de contratos atualizado com a Frente 4 ativa (PR 40)
- status vivo da Frente 4 criado (PR 40)
- handoff vivo da Frente 4 criado (PR 40)
- documento canonico de dados/persistencia criado em `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md` (PR 40)
- quebra oficial definida em PR40, PR41, PR42, PR43 e PR44 (PR 40)
- contrato de dados persistíveis completo em `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md` (PR 41)
- entidades, campos, ownership, idempotência, versionamento e políticas de retenção definidos por entidade (PR 41)
- quatro zonas de soberania de dados declaradas explicitamente (PR 41)
- casca técnica mínima do Supabase Adapter em `src/adapter/` (PR 42)
- interfaces de leitura/escrita das 10 entidades em `src/adapter/types.ts` (PR 42)
- boundaries e ownership de layers em `src/adapter/boundaries.ts` (PR 42)
- SupabaseAdapterBase (stubs) em `src/adapter/index.ts` (PR 42)
- smoke do adapter base em `src/adapter/smoke.ts` — 4 cenários, 68 assertions, ✅ (PR 42)
- política canônica de consistência em `src/adapter/policy.ts` (PR 43)
- smoke de política em `src/adapter/policy-smoke.ts` — 8 cenários, ✅ (PR 43)
- **runtime real mínimo do Adapter em `src/adapter/runtime.ts` (PR 44):**
  - `PersistenceBackend` (porta única de leitura/escrita)
  - `InMemoryPersistenceBackend` (backend in-process funcional real)
  - `SupabaseAdapterRuntime` implementando `ISupabaseAdapter` com:
    - upsert / append / insert_versioned / overwrite por entidade conforme `ENTITY_CONSISTENCY_POLICY`
    - idempotência por chave canônica (replay seguro)
    - TTL da memória viva conforme `MEMORY_RUNTIME_TTL_POLICY` — leitura expirada → `found:false`
    - monotonicidade de status conforme `STATUS_MONOTONICITY` — transições inválidas rejeitadas
    - projection_bridge: rejeição de campos proibidos com auditoria em `enova2_operational_history_v2`
    - projeção de campos soberanos do Core (nunca calculados pelo Adapter)
- **`src/adapter/index.ts` ligado ao runtime real (re-export) (PR 44)**
- **smoke persistente integrado em `src/adapter/runtime-smoke.ts` — 5 cenários, todos ✅ (PR 44):**
  - Cenário 1 — persistência real funcionando nas 10 tabelas canônicas
  - Cenário 2 — replay seguro: idempotência por chave canônica
  - Cenário 3 — TTL da memória viva (mínimo, máximo, expirada, refresh)
  - Cenário 4 — projection_bridge bloqueia campos proibidos com auditoria
  - Cenário 5 — soberania preservada (Core regra, IA fala, Adapter projeta sem calcular)
- **`package.json` atualizado com `smoke:adapter:runtime` e incluído em `smoke:all` (PR 44)**
- **`CONTRACT_CLOSEOUT_PROTOCOL.md` executado integralmente (PR 44)**
- **contrato movido para `schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md` (PR 44)**
- **`schema/contracts/_INDEX.md` atualizado: Frente 4 = arquivado; Frente 5 autorizada a abrir (PR 44)**

## 5. Pendencias

Nenhuma. A frente está encerrada.

Nota técnica honesta sobre o que NÃO foi implementado nesta frente (e por que não pertence ao recorte arquitetural da Frente 4):
- backend Supabase remoto plugado a `@supabase/supabase-js` com credenciais reais
- migration SQL aplicada nas tabelas `enova2_*`
- estes itens são etapa de **deployment** (Frente 8 — Rollout) e foram deixados como porta pluggável (`PersistenceBackend`) para serem implementados sem alterar o runtime canônico.

## 6. Bloqueios

Nenhum.

## 7. Proximo passo autorizado

Abrir o **Contrato da Frente 5 — Áudio e Multimodalidade**. Nenhuma execução de Frente 5 deve ser iniciada antes da abertura formal do contrato. A Frente 5 está autorizada nos vivos, mas não foi aberta nesta PR.

## 8. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma — o runtime opera contra `InMemoryPersistenceBackend` (in-process, real); o backend Supabase remoto é a etapa de deployment futura.

## 9. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional.

## 10. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` (movido para archive nesta PR)
  Protocolo de closeout lido:  `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
  Contrato de dados lido:      `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Adapter base lido:           `src/adapter/types.ts`, `src/adapter/boundaries.ts`, `src/adapter/index.ts`, `src/adapter/smoke.ts`
  Política lida:               `src/adapter/policy.ts`, `src/adapter/policy-smoke.ts`
  Runtime lido:                `src/adapter/runtime.ts`, `src/adapter/runtime-smoke.ts`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
