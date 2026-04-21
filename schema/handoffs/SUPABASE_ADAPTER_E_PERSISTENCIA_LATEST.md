# HANDOFF — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Data | 2026-04-21 |
| Estado da frente | encerrada |
| Classificacao da tarefa | contratual + closeout |
| Ultima PR relevante | PR 44 — runtime real mínimo + smoke persistente integrado + closeout formal da Frente 4 |
| Contrato ativo | Nenhum — encerrado em 2026-04-21 (`schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md`) |
| Recorte executado do contrato | PR 44 — runtime real mínimo + smoke persistente integrado + closeout formal |
| Pendencia contratual remanescente | nenhuma |
| Houve desvio de contrato? | nao |
| Contrato encerrado nesta PR? | sim |
| Item do A01 atendido | Prioridade 4 — concluída: persistência canônica, idempotente, auditável, com replay seguro e closeout formal |
| Proximo passo autorizado | abrir Contrato da Frente 5 — Áudio e Multimodalidade (sem execução nesta PR) |
| Proximo passo foi alterado? | nao — segue exatamente o que o contrato encerrado previa em "Próxima frente após closeout esperado" |
| Tarefa fora de contrato? | nao (recorte contratual da PR 44 + closeout) |
| Mudancas em dados persistidos (Supabase) | nenhuma — runtime opera contra `InMemoryPersistenceBackend`; backend Supabase remoto é etapa de deployment futura |
| Permissoes Cloudflare necessarias | nenhuma adicional |

---

## 1. Contexto curto

A PR 43 entregou a política canônica de consistência (`policy.ts`).
Nesta **PR 44**, entregamos:

1. **Runtime real mínimo** do Supabase Adapter em `src/adapter/runtime.ts`, respeitando estritamente a política de PR 43.
2. **Smoke persistente integrado** em `src/adapter/runtime-smoke.ts`, exercitando o runtime contra um backend in-process real e provando todas as garantias contratuais com dados verdadeiros.
3. **Closeout formal da Frente 4** via `CONTRACT_CLOSEOUT_PROTOCOL.md` — contrato arquivado, vivos atualizados, próxima frente autorizada.

A Frente 4 está formalmente encerrada.

## 2. Classificacao da tarefa

contratual + closeout

## 3. Ultima PR relevante

PR 43 — política de merge/update/consistência e estratégia de TTL (todas as 5 microetapas concluídas).

## 4. O que a PR anterior fechou

- política completa de consistência (`policy.ts`)
- TTL da memória viva (valores numéricos e regras)
- mapa de compatibilidade ENOVA 1 (allowed/prohibited fields)
- monotonicidade de status declarada por entidade
- POLICY_SUMMARY consolidado
- smoke de política aprovado (8 cenários)

## 5. O que a PR anterior NAO fechou

- runtime real (deixado para PR 44)
- smoke persistente com dados reais (deixado para PR 44)
- closeout formal da frente (deixado para PR 44)

## 6. Diagnostico confirmado

- `schema/contracts/_INDEX.md` confirmou Frente 4 ativa com PR 44 como próximo passo autorizado
- status e handoff da PR 43 confirmaram: `Próximo passo autorizado: PR 44 — smoke persistente + closeout formal da Frente 4`
- `policy.ts` lido como contrato declarativo a ser respeitado pelo runtime
- `types.ts` lido como interface autoritativa a ser implementada
- `boundaries.ts` lido como ownership autoritativo
- contrato ativo confirmou: PR 44 é recorte contratual + closeout autorizado com microetapas 1-5

## 7. O que foi feito

### 7.1. Runtime real mínimo — `src/adapter/runtime.ts` (PR 44)

- **`PersistenceBackend`** — porta única abstrata de leitura/escrita. Toda escrita real passa por aqui — nenhum acesso direto a banco.
- **`InMemoryPersistenceBackend`** — implementação in-process funcional real. Armazena registros em `Map<table, row[]>` por tabela canônica. Não é stub: cada `insert`/`update`/`findOne`/`findMany`/`remove` é real, observável e reproduzível.
- **`SupabaseAdapterRuntime`** — implementa `ISupabaseAdapter` com lógica real para todas as 10 entidades:
  - `enova2_lead` — upsert por `external_ref` (idempotente)
  - `enova2_lead_state_v2` — `insert_versioned`, idempotente por `(lead_id, source_turn_id)`, `state_version` monotônico
  - `enova2_turn_events_v2` — append-only, idempotente por `idempotency_key`, `turn_sequence` monotônico
  - `enova2_signal_records_v2` — upsert por `(turn_id, signal_key)`, valor imutável após insert
  - `enova2_memory_runtime_v2` — overwrite com TTL (`MEMORY_RUNTIME_TTL_POLICY`); leitura expirada → `{found:false, error:'memory_expired'}`
  - `enova2_document_records_v2` — upsert por `(lead_id, doc_type)`, monotonicidade de `doc_status`
  - `enova2_dossier_v2` — overwrite por `lead_id` (1:1)
  - `enova2_visit_schedule_v2` — append + monotonicidade de `visit_status`
  - `enova2_operational_history_v2` — append-only, idempotente por `(lead_id, turn_id, event_type)`
  - `enova2_projection_bridge_v2` — overwrite por `(lead_id, target_system)` com `pre_write_validation` que rejeita campos proibidos e gera evento auditável em `operational_history`
- **Soberania preservada em código:** o runtime apenas projeta os campos do Core (`stage_current`, `next_objective`, `block_advance`, `policy_flags_json`, `ready_for_visit`, `ready_for_broker_handoff`) — nunca calcula. Não escreve resposta ao cliente. Não decide regra de negócio.
- **Política respeitada:** importa `STATUS_MONOTONICITY`, `MEMORY_RUNTIME_TTL_POLICY`, `PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS` de `policy.ts` e usa diretamente.
- **Factory de conveniência:** `createInMemoryAdapterRuntime()` retorna `{adapter, backend}` para testes/smoke.

### 7.2. `src/adapter/index.ts` ligado ao runtime (PR 44)

- Re-exports do runtime adicionados: `CanonicalTable`, `PersistenceBackend`, `InMemoryPersistenceBackend`, `SupabaseAdapterRuntime`, `createInMemoryAdapterRuntime`.
- `SupabaseAdapterBase` mantido para compatibilidade documental com a casca canônica original (PR 42).

### 7.3. Smoke persistente integrado — `src/adapter/runtime-smoke.ts` (PR 44)

5 cenários, todos ✅:

- **Cenário 1** — persistência real funcionando nas 10 tabelas canônicas: ciclo completo lead → turn → signals → state → memory → document → dossier → visit → history → projection, com leituras observáveis e contagem real de registros no backend.
- **Cenário 2** — replay seguro: idempotência por chave canônica em `lead`, `turn_events`, `signals`, `lead_state`, `operational_history`. `turn_sequence` regressivo rejeitado.
- **Cenário 3** — TTL da memória viva: TTL abaixo do mínimo rejeitado, acima do máximo rejeitado, leitura de memória expirada → `{found:false, error:'memory_expired'}`, refresh estende TTL e incrementa `memory_version`.
- **Cenário 4** — projection_bridge bloqueia campos proibidos (`ai_response_text`, `core_decision_json`, `policy_flags_json`), com evento auditável em `operational_history`. Projeção com apenas campos permitidos passa.
- **Cenário 5** — soberania preservada: Adapter projeta exatamente os valores do Core (sem calcular), monotonicidade de status rejeita regressões inválidas (signal `accepted → pending`, document `validated → received`, visit `confirmed → cancelled`), `speech_contract_json` aceito apenas como metadado (sem `ai_response_text` em estado canônico).

### 7.4. `package.json` (PR 44)

- adicionado `smoke:adapter:runtime`
- incluído em `smoke:all`

### 7.5. Closeout formal — `CONTRACT_CLOSEOUT_PROTOCOL.md` executado (PR 44)

- contrato movido de `active/` para `archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md`
- bloco de encerramento (seção 4 do protocolo) anexado ao contrato arquivado, com:
  - critérios C1–C8 com status individual (todos cumpridos)
  - lista de PRs com referência (PR 40, 41, 42, 43, 44)
  - evidências (smoke tests, diffs, commits)
  - declaração explícita: pendências = nenhuma; nota técnica honesta sobre backend Supabase remoto = etapa de deployment futura
  - próximo contrato autorizado: Frente 5 — Áudio e Multimodalidade
- `_INDEX.md` atualizado: Frente 4 = arquivado; Frente 5 = aguardando abertura (autorizada após closeout)
- status vivo atualizado para `encerrada`
- handoff vivo (este arquivo) registra o encerramento

## 8. O que nao foi feito

Honestamente declarado:

- **NÃO** foi plugado o backend Supabase remoto (`@supabase/supabase-js` com credenciais e migration SQL aplicada). Isso é etapa de **deployment** (Frente 8 — Rollout) e foi deixado como porta `PersistenceBackend` exatamente para permitir essa plugagem sem alterar o runtime.
- **NÃO** foi criada migration SQL real.
- **NÃO** houve mudança em áudio, Meta/WhatsApp, telemetria ou rollout.
- **NÃO** foi aberta a Frente 5 — apenas autorizada nos vivos.

## 9. O que esta PR fechou

- microetapa 1 da PR 44: acceptance smoke de persistência ✅ (Cenário 1)
- microetapa 2 da PR 44: prova de consistência por replay seguro ✅ (Cenário 2)
- microetapa 3 da PR 44: prova de soberania preservada ✅ (Cenário 5)
- microetapa 4 da PR 44: `CONTRACT_CLOSEOUT_PROTOCOL.md` executado ✅
- microetapa 5 da PR 44: contrato arquivado e vivos atualizados ✅
- **C1–C8 do contrato cumpridos** ✅
- **Frente 4 encerrada formalmente** ✅

## 10. O que continua pendente apos esta PR

Nenhuma pendência da Frente 4.

Próxima atividade autorizada: **abertura formal do Contrato da Frente 5 — Áudio e Multimodalidade** (PR de governança separada; nenhuma execução nesta PR).

## 11. Esta tarefa foi fora de contrato?

Nao.

## 11a. Contrato ativo

Nenhum — contrato anterior arquivado em `schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md`.

## 11b. Recorte executado do contrato

PR 44 — runtime real mínimo + smoke persistente integrado + closeout formal da Frente 4 — todas as 5 microetapas concluídas.

## 11c. Pendencia contratual remanescente

Nenhuma.

## 11d. Houve desvio de contrato?

Nao.

## 11e. Contrato encerrado nesta PR?

Sim.

## 12. Arquivos relevantes

- `src/adapter/runtime.ts` ← **criado nesta PR 44**
- `src/adapter/runtime-smoke.ts` ← **criado nesta PR 44**
- `src/adapter/index.ts` ← atualizado nesta PR 44 (re-exports do runtime)
- `package.json` ← atualizado nesta PR 44 (`smoke:adapter:runtime` + `smoke:all`)
- `schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md` ← **movido + bloco de encerramento anexado**
- `schema/contracts/_INDEX.md` ← atualizado: Frente 4 = arquivado; Frente 5 autorizada
- `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md` ← **encerrada**
- `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md` ← este arquivo
- `src/adapter/policy.ts` (PR 43 — respeitado fielmente pelo runtime)
- `src/adapter/types.ts` (PR 42 — interface implementada pelo runtime)
- `src/adapter/boundaries.ts` (PR 42 — ownership respeitado)
- `src/adapter/smoke.ts` (PR 42 — continua passando)
- `src/adapter/policy-smoke.ts` (PR 43 — continua passando)
- `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md` (PR 41 — shape autoritativo)

## 13. Item do A01 atendido

Prioridade 4 — Supabase Adapter com namespace novo, persistência explicável, idempotente e auditável; trilho de compatibilidade com ENOVA 1 (projection_bridge); replay seguro provado; closeout formal concluído. **Item do A01 totalmente atendido.**

## 14. Estado atual da frente

**encerrada**

## 15. Proximo passo autorizado

Abrir o **Contrato da Frente 5 — Áudio e Multimodalidade**.

- Nenhuma execução de Frente 5 deve começar antes da abertura formal do contrato.
- Esta PR apenas **autoriza** a abertura — não inicia.
- A abertura segue o `CONTRACT_SCHEMA.md`.

## 16. Riscos

Sem riscos abertos para a Frente 4 (encerrada).

Riscos conhecidos para o futuro deployment (fora desta frente):
- ao plugar backend Supabase remoto, garantir que a porta `PersistenceBackend` é implementada fielmente (mesmo contrato semântico de `insert/update/findOne/findMany/remove`).
- garantir que migration SQL aplicada reflete o shape declarado em `FRENTE4_PERSISTABLE_DATA_CONTRACT.md`.

## 17. Provas

- `src/adapter/runtime.ts` criado — runtime real mínimo com 10 entidades, política respeitada, soberania preservada.
- `src/adapter/runtime-smoke.ts` criado e executado: 5/5 cenários passaram, exit 0.
- `npm run smoke:all` ✅ — todos os smokes da casa rodam (`smoke + smoke:worker + smoke:speech + smoke:context + smoke:adapter + smoke:adapter:policy + smoke:adapter:runtime`).
- smoke do adapter base (PR 42) continua passando: 4/4 cenários, exit 0.
- smoke de política (PR 43) continua passando: 8/8 cenários, exit 0.
- contrato movido para `archive/` com bloco de encerramento completo.
- `_INDEX.md` atualizado: Frente 4 = arquivado; Frente 5 autorizada.
- status e handoff (este arquivo) refletem o encerramento.

## 18. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma — o runtime opera contra `InMemoryPersistenceBackend` (in-process, real); o backend Supabase remoto é a etapa de deployment futura.

## 19. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional.

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` (movido para archive nesta PR)
  Protocolo de execucao lido:  `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
  Protocolo de closeout lido:  `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
  Workflow lido:               `schema/CODEX_WORKFLOW.md`
  Contrato de dados lido:      `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Adapter base lido:           `src/adapter/types.ts`, `src/adapter/boundaries.ts`, `src/adapter/index.ts`, `src/adapter/smoke.ts`
  Política lida:               `src/adapter/policy.ts`, `src/adapter/policy-smoke.ts`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`

---

## ESTADO HERDADO (declarado no início desta PR 44)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual + closeout
Última PR relevante: PR 43 — política de merge/update/consistência e estratégia de TTL
Contrato ativo: schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md
Objetivo imutável do contrato: persistência canônica idempotente e auditável com separação de soberanias (Core regra, IA fala, Adapter persiste)
Recorte a executar na PR 44: runtime real mínimo + smoke persistente integrado + closeout formal da Frente 4
Item do A01: Prioridade 4
Estado atual da frente (no início): em execução
O que a PR 43 fechou: política de consistência completa, TTL da memória viva, mapa de compatibilidade ENOVA 1, smoke de política aprovado
O que a PR 43 NAO fechou: runtime real, smoke persistente com dados reais, closeout
Por que a PR 44 existe: implementar o runtime real que respeita policy.ts, provar com smoke persistente e encerrar a frente
Esta tarefa está dentro do contrato ativo: dentro
Objetivo da PR 44: runtime real mínimo + smoke persistente integrado + closeout formal
Escopo: runtime real, smoke com dados reais, replay seguro, soberania preservada, TTL real, projection_bridge bloqueando proibidos, closeout protocolar
Fora de escopo: áudio, Meta/WhatsApp, telemetria, rollout, surface/fala, decisão de negócio pelo adapter, abertura da Frente 5
Houve desvio de contrato?: nao
Mudanças em dados persistidos (Supabase): nenhuma — runtime contra InMemoryPersistenceBackend; backend Supabase remoto é deployment futuro
Permissões Cloudflare necessárias: nenhuma adicional
```

---

## ESTADO ENTREGUE

```
--- ESTADO ENTREGUE ---
Frente: encerrada
Contrato: arquivado em schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md
Critérios C1–C8: todos cumpridos
Runtime real mínimo: src/adapter/runtime.ts (10 entidades, policy.ts respeitada)
Smoke persistente integrado: src/adapter/runtime-smoke.ts (5/5 cenários ✅)
Smoke suite global: npm run smoke:all ✅
Soberania preservada: sim — Core regra, IA fala, Adapter projeta sem calcular
Replay seguro: provado em todas as entidades chave
TTL da memória viva: provado (mínimo, máximo, expirada, refresh)
projection_bridge: provado (3 campos proibidos rejeitados, evento auditável, projeção válida aceita)
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Próximo passo autorizado: abrir Contrato da Frente 5 — Áudio e Multimodalidade (sem execução nesta PR)
Pendências: nenhuma para a Frente 4
```
