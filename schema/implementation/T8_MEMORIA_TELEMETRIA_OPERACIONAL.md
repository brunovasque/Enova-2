# PR-T8.13 — Memória evolutiva + telemetria operacional

**Tipo:** PR-IMPL  
**Frente:** Memória evolutiva + telemetria  
**Data:** 2026-04-30  
**Branch:** `feat/t8-pr-t8-13-memoria-telemetria-operacional`

---

## §1 — Meta

Esta PR-T8.13 implementa a base operacional da memória evolutiva da Enova 2 (estilo "Obsidian-plus" interno) e organiza a telemetria de atendimento usando o canal `emitTelemetry` existente. A PR não toca em Meta/WhatsApp real — a frente Meta permanece bloqueada aguardando Vasques (PR-T8.12B). Esta PR não fecha G8 e não prova atendimento real.

---

## §2 — Objetivo

- Registrar eventos de atendimento, aprendizado, performance, erro, comercial, produto e contrato.
- Permitir criação de aprendizados candidatos sem promovê-los automaticamente.
- Oferecer endpoints CRM seguros para consulta e decisão humana.
- Garantir invariantes de soberania: nada de `fact_*`, nada de `stage`, nada de promoção automática, nada de outbound, nada de LLM.
- Sanitizar 100% das entradas antes de qualquer escrita.

---

## §3 — Estado herdado

| Frente | Estado |
|---|---|
| Supabase real | ✅ provado em PR-T8.9B (leitura real) |
| CRM backend/frontend | ✅ operacional desde PR-T8.4/T8.5 (73/73 e2e PASS) |
| Meta/WhatsApp | ❌ bloqueado — PR-T8.12B aguardando secrets/deploy/webhook por Vasques |
| Telemetria FRONT-7 | ✅ existente em `src/telemetry/{emit,types}.ts` |
| Memória | ⚠️ inexistente até esta PR |
| LLM real | ❌ não habilitado (fora de escopo da T8.13) |
| Cliente real | ❌ não habilitado (fora de escopo da T8.13) |

---

## §4 — Arquitetura implementada

```
src/memory/
  types.ts        — tipos canônicos (MemoryRecord, LearningCandidateRecord, etc.)
  sanitize.ts     — redação de tokens/segredos antes de qualquer escrita
  store.ts        — MemoryStore in-memory + interface estável p/ Supabase futuro
  service.ts      — API funcional (registrar, criar candidato, decidir)
  routes.ts       — handler /crm/memory/*
  smoke.ts        — 17 cenários cobrindo invariantes, sanitização, fluxo, auth
```

Integração: `src/crm/routes.ts` ganha um único branch `if (resource === 'memory')` que delega para `handleMemoryRoute`. Auth `X-CRM-Admin-Key` aplicada uniformemente.

`src/worker.ts` — **não alterado**. `src/rollout/guards.ts` — **não alterado** (sub-rotas CRM não são roteadas individualmente).

---

## §5 — Tipos de memória

Conforme contrato T8 §4.2:

| Categoria | Uso |
|---|---|
| `attendance_memory` | histórico resumido por lead (etapa, decisão, objeção, resultado) |
| `learning_candidate` | lições candidatas (NUNCA viram regra sem aprovação humana) |
| `contract_memory` | referências T1–T8, critérios, bloqueios, regras soberanas |
| `performance_memory` | conversão, abandono, docs, aprovação, visita, perda |
| `error_memory` | falhas LLM, parser, estado, Meta, Supabase, dossiê, CRM |
| `commercial_memory` | objeções, abordagens, follow-ups |
| `product_memory` | gargalos, UX, melhorias |

Cada registro carrega: `id`, `version`, `category`, `event_type`, `source`, `lead_ref`, `summary`, `evidence_ref`, `risk_level`, `status` ∈ {`draft`, `validated`, `rejected`, `promoted`}, `details`, `created_at`, `updated_at`.

`LearningCandidateRecord` adiciona: `hypothesis`, `proposed_action`, `decision_operator_id`, `decision_reason`, `decision_at`.

---

## §6 — Ciclo de aprendizado

```
Atendimento → Evento → Classificação → Insight candidato → Validação humana → Memória → Uso futuro controlado
```

- Insight criado sempre como `draft`.
- `applyLearningDecision(id, { decision, operator_id, reason })` é a única forma de mudar status.
- `decision: 'promoted'` exige decisão explícita — não há gatilho automático, nenhuma heurística, nenhum cron, nenhum alvo.
- Decisão sem `operator_id` ou `reason` é rejeitada com erro específico.

---

## §7 — Backend / service

`src/memory/service.ts` expõe:

| Função | Função |
|---|---|
| `registerMemoryEvent(input, ctx?)` | registra qualquer categoria exceto `learning_candidate` |
| `createLearningCandidate(input, ctx?)` | cria candidato sempre `draft` |
| `applyLearningDecision(id, input, ctx?)` | aplica decisão humana com auditoria |
| `listMemoryByLead(lead_ref, ctx?)` | lista por lead |
| `listLearningCandidates(filterStatus?, ctx?)` | lista candidatos com filtro opcional |
| `getMemoryStatus(env, ctx?)` | retorna status + invariantes declaradas |
| `memoryInvariants()` | declaração explícita (smoke usa como evidência) |

Store atual: `createInMemoryMemoryStore` (FIFO, limite 5000). Interface `MemoryStore` é estável; integração Supabase real será feita em PR futura.

`isMemorySupabaseFlagEnabled(env)` lê `MEMORY_SUPABASE_ENABLED === 'true'`. Nesta PR a flag é exposta no status mas não habilita escrita real — quando `true`, status reporta a flag mas o `mode` permanece `in_memory` até a integração real existir.

---

## §8 — Telemetria operacional

Toda escrita de memória emite via `emitTelemetry({ layer: 'core', category: 'persistence_signal', action: 'memory.<sub>' })`. Eventos canônicos:

- `f7.core.persistence_signal.memory.event.recorded`
- `f7.core.persistence_signal.memory.candidate.created`
- `f7.core.persistence_signal.memory.candidate.validated`
- `f7.core.persistence_signal.memory.candidate.rejected`
- `f7.core.persistence_signal.memory.candidate.promoted`
- `f7.core.persistence_signal.memory.candidate.decision` (rejeições por input inválido)

Cobertura por categoria de atendimento (registrável via `event_type`):
- atendimento iniciado · mensagem recebida · etapa observada · objeção · documento citado · silêncio
- conversão · abandono · doc recebido · aprovação · visita
- erro LLM · erro parser · erro state · erro Meta · erro Supabase · erro CRM
- insight candidato criado/decidido
- ação manual de operador · override

Nenhum log expõe segredo, token, payload completo de Meta/Supabase. `details` passa por `sanitizeRecord` antes de persistir.

---

## §9 — CRM / painel

Rotas adicionadas em `src/crm/routes.ts` (delegadas a `handleMemoryRoute`):

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/crm/memory/status` | status + invariantes |
| `GET` | `/crm/memory/lead/:lead_ref` | memórias de um lead |
| `GET` | `/crm/memory/learning-candidates[?status=draft]` | lista candidatos |
| `POST` | `/crm/memory/event` | registra evento (categoria ≠ learning_candidate) |
| `POST` | `/crm/memory/learning-candidate` | cria candidato |
| `POST` | `/crm/memory/learning-candidates/:id/decision` | decisão humana |

Auth: header `X-CRM-Admin-Key` (mesma regra das demais rotas CRM — sem fallback universal). Frontend do painel **não alterado** nesta PR; integração visual fica para PR posterior se necessário.

---

## §10 — Segurança e privacidade

| Item | Status |
|---|---|
| Sanitização ativa em toda escrita | ✅ `src/memory/sanitize.ts` |
| Bloqueio de `META_*`, `SUPABASE_*`, `OPENAI_*`, `ANTHROPIC_*`, `CRM_ADMIN_KEY`, `CLOUDFLARE_API_TOKEN` | ✅ |
| Bloqueio de `Bearer …`, `eyJ…`, `sb-…`, `sk-…`, `ghp_…`, `ghs_…`, `sha256=…`, base64 ≥ 80 chars | ✅ |
| Bloqueio de `authorization`, `cookie`, `x-hub-signature*`, `password`, `secret`, `token` | ✅ |
| Truncamento de strings (`summary` 500c, `decision_reason` 500c, `operator_id` 100c) | ✅ |
| Redação aninhada (objetos/arrays) | ✅ |
| Auth CRM aplicada uniformemente | ✅ |

---

## §11 — Limitações

1. **Persistência real**: store é in-memory; reinício do Worker zera memória. Integração Supabase fica para PR futura sob `MEMORY_SUPABASE_ENABLED`.
2. **Sem dashboard visual**: painel não recebeu UI nesta PR; consumo é via API e/ou aba futura.
3. **Sem regressão automática T1–T7**: smoke valida invariantes locais (sem fact_*, sem stage); regressão completa é responsabilidade da PR-T8.14.
4. **Meta/WhatsApp bloqueada**: PR-T8.13 não emite memória de inbound real — depende de PR-T8.12B com secrets reais.
5. **Aprendizado não vira regra**: declaração explícita — promoção é status documental, não altera comportamento operacional.

---

## §12 — Testes

| Comando | Resultado |
|---|---|
| `npm run smoke:memory` | **17/17 PASS** (novo) |
| `npm run smoke:supabase` | 70/70 PASS (retrocompat) |
| `npm run smoke:meta:webhook` | 20/20 PASS (retrocompat) |
| `npm run smoke:meta` | 14/14 PASS (retrocompat) |
| `npm run prove:crm-e2e` | 73/73 PASS (retrocompat) |
| `npm run smoke:all` | **EXIT 0** (todas etapas) |
| `npm run prove:meta-controlada` | 25 PASS / 6 SKIP / 0 FAIL (retrocompat — frente Meta segue bloqueada) |

Cenários cobertos pelo `smoke:memory`:

1. `registerMemoryEvent → attendance_started` aceita e marca como `draft`
2. `createLearningCandidate` cria com status `draft` e campos de decisão nulos
3. Aprendizado NÃO vira regra automaticamente (count promoted = 0; invariantes declaradas)
4. Decisão exige `operator_id` E `reason` (validação trinca)
5. Decisão humana válida muda status para `validated`
6. `listMemoryByLead` filtra corretamente por `lead_ref`
7. Telemetria emite eventos `memory.event.recorded` / `candidate.created` / `candidate.validated`
8. Sanitização redige tokens, segredos, headers sensíveis e trunca strings longas
9–11. Invariantes: sem `fact_*`, sem `stage`, sem promoção/LLM/outbound/auto-decisão automáticos
12. Fallback in-memory funciona sem Supabase
13. `SUPABASE_REAL_ENABLED=false` não quebra
14. `category=learning_candidate` via `/event` é rejeitada (rota dedicada exigida)
15. `/crm/memory/*` exige `X-CRM-Admin-Key` (401 sem auth)
16. `POST /crm/memory/event` registra com sanitização e retorna 201
17. `GET /crm/memory/status` retorna invariantes
18. Fluxo `/crm/memory/learning-candidate` POST → `/decision` POST com `promoted` exige decisão humana
19. Rota Meta `/__meta__/webhook` continua íntegra (PR-T8.13 não tocou Meta)

---

## §13 — Rollback

Reverter os arquivos novos sob `src/memory/` e a única adição em `src/crm/routes.ts` desfaz todo o efeito desta PR. Nenhum estado externo (Supabase, Meta, Worker remoto) foi alterado. Em runtime, `resetSharedMemoryStore()` zera o store. Reverter o commit é suficiente — não há migração reversa, não há schema change, não há flag persistida.

---

## §14 — Próxima PR autorizada

**PR-T8.14 — Prova memória + telemetria + regressão contratual** (PR-PROVA).

Critérios para PR-T8.14:
- Reusar `smoke:memory` como base.
- Adicionar prova de regressão T1–T7 (rodar suite completa contra cenários canônicos).
- Provar que insight candidato não altera stage/fact em nenhuma rota.
- Provar que telemetria de memória aparece em consulta agregada.
- Documentar evidência em `schema/proofs/T8_MEMORIA_TELEMETRIA_PROVA.md`.

Pré-condição não bloqueante: PR-T8.14 não exige PR-T8.12B concluída — pode rodar com Meta bloqueada, desde que o documento declare que a regressão é local/in-memory.

---

## §15 — Regras importantes (declaração explícita)

- **Meta/WhatsApp continua bloqueado** aguardando Vasques (PR-T8.12B).
- **Esta PR não fecha G8.**
- **Esta PR não prova atendimento real.**
- **Esta PR prepara memória/telemetria para a prova da PR-T8.14.**
- **Aprendizado candidato não vira regra sozinho.**
- **Memória registra, classifica e sugere — não decide.**
