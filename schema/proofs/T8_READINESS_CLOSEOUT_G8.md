# PR-T8.R — Readiness / Closeout G8 com bloqueio formal

**Tipo:** PR-PROVA / CLOSEOUT  
**Data:** 2026-04-30  
**Branch:** `feat/t8-pr-t8-r-readiness-closeout-g8`  
**Executado em:** Claude Code / Node.js / tsx

---

## §1 — Meta

Esta PR-T8.R é o diagnóstico executivo final da T8. Consolida o estado de todas as frentes implementadas e provadas, declara com precisão o que está aprovado e o que está bloqueado, e produz o veredito formal GO/NO-GO.

**Esta PR NÃO fecha G8. Contrato T8 permanece aberto.**

---

## §2 — Objetivo

Produzir o registro formal de:
- Frentes aprovadas com evidência.
- Frentes bloqueadas com motivo.
- Provas executadas e resultados.
- Condição exata para fechamento do G8.
- Próxima ação obrigatória.

---

## §3 — Fontes lidas

| # | Arquivo |
|---|---|
| 1 | `CLAUDE.md` |
| 2 | `schema/CODEX_WORKFLOW.md` |
| 3 | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` |
| 4 | `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` |
| 5 | `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` |
| 6 | `schema/implementation/T8_BACKEND_CRM_OPERACIONAL.md` |
| 7 | `schema/implementation/T8_FRONTEND_PAINEL_OPERACIONAL.md` |
| 8 | `schema/implementation/T8_SUPABASE_PROVA_REAL_EXECUTADA.md` |
| 9 | `schema/diagnostics/T8_META_WORKER_DIAGNOSTICO.md` |
| 10 | `schema/implementation/T8_META_WORKER_IMPL.md` |
| 11 | `schema/proofs/T8_META_WHATSAPP_PROVA_CONTROLADA.md` |
| 12 | `schema/proofs/T8_META_WHATSAPP_PROVA_REAL_EXECUTADA.md` |
| 13 | `schema/implementation/T8_MEMORIA_TELEMETRIA_OPERACIONAL.md` |
| 14 | `schema/proofs/T8_MEMORIA_TELEMETRIA_PROVA.md` |
| 15 | `schema/implementation/T8_FLAGS_ROLLBACK_GOLIVE_HARNESS.md` |
| 16 | `schema/ADENDO_CANONICO_SOBERANIA_IA.md` |
| 17 | `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` |
| 18 | `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` |

---

## §4 — Resumo executivo

| Frente | Estado | Prova |
|---|---|---|
| CRM backend/frontend | **APROVADA** | PR-T8.6 — 73/73 PASS |
| Supabase leitura real | **APROVADA** | PR-T8.9B — 8/8 PASS |
| Meta/WhatsApp implementação técnica | **APROVADA (técnica)** | PR-T8.12 — 20/20 PASS |
| Meta/WhatsApp prova real | **BLOQUEADA** | PR-T8.12B — aguarda Vasques |
| Memória/telemetria | **APROVADA (local/in-memory)** | PR-T8.14 — 9/9 PASS |
| Flags/rollback/go-live | **APROVADA** | PR-T8.15 — 18/18 PASS |
| Cliente real | **BLOQUEADO** | não autorizado |
| LLM real | **BLOQUEADO** | não ativado |
| Atendimento real | **BLOQUEADO** | depende de Meta + LLM + autorização |
| G8 | **NÃO FECHADO** | bloqueado por Meta |

---

## §5 — Resultado geral

| Suite | Resultado |
|---|---|
| `prove:g8-readiness` (novo — 7 provas) | **7/7 PASS** |
| `smoke:golive` | 18/18 PASS |
| `smoke:all` | EXIT 0 |
| `smoke:memory` | 17/17 PASS |
| `smoke:supabase` | 70/70 PASS |
| `smoke:meta:webhook` | 20/20 PASS |
| `smoke:meta` | 14/14 PASS |
| `prove:memory-telemetry` | 9/9 PASS |
| `prove:crm-e2e` | 73/73 PASS |
| `prove:meta-controlada` | 25/0/6 (BLOQUEIO CONTROLADO — correto) |

---

## §6 — Frente CRM

**Status: APROVADA**

| Critério | Evidência |
|---|---|
| Backend operacional | PR-T8.4 — 26 endpoints, 7 abas |
| Frontend/painel operacional | PR-T8.5 — HTML/CSS/JS, 7 abas |
| Prova E2E | PR-T8.6 — 73/73 PASS em 6 categorias |
| Auth segura | `X-CRM-Admin-Key`, sem fallback universal |
| Flags `real_*: false` | declaradas e verificadas |
| Sem `reply_text`, sem `decide_stage` | confirmado em R1 |
| Sem cliente real | ✅ confirmado |

---

## §7 — Frente Supabase

**Status: APROVADA (leitura real) — write real pendente**

| Critério | Evidência |
|---|---|
| Cliente HTTP sem `@supabase/supabase-js` | PR-T8.8 |
| Feature flag `SUPABASE_REAL_ENABLED` | implementada |
| Leitura real aprovada por Vasques | PR-T8.9B — 8/8 PASS |
| `crm_lead_meta`: 6 rows reais | ✅ |
| `enova_docs`: 20 rows reais | ✅ |
| `enova_state`: 10 rows reais | ✅ |
| `crm_override_log`: 0 rows | ✅ |
| Storage: 4 buckets reais | emailsnv, documentos-pre-analise, enavia-brain, enavia-brain-test |
| Write real amplo | NÃO executado — correto |
| RLS, storage policy | futuras |
| Zero migration | ✅ |

---

## §8 — Frente Meta/WhatsApp

**Status técnica: APROVADA | Prova real: BLOQUEADA_AGUARDANDO_VASQUES**

| Critério | Evidência |
|---|---|
| Implementação técnica | PR-T8.11 — webhook, assinatura HMAC-SHA256, parser, dedupe, outbound stub |
| Rota `GET|POST /__meta__/webhook` | operacional |
| GET challenge valida `hub.verify_token` + retorna `hub.challenge` | ✅ |
| POST valida `X-Hub-Signature-256` antes de parse | ✅ |
| Outbound bloqueado por default | ✅ |
| Harness local | PR-T8.12 — 20/20 PASS |
| Prova controlada | PR-T8.12 — 25/0/6 |
| Prova real P1 | ✅ 25 PASS local |
| Prova real P2–P7 | ❌ SKIPPED — secrets ausentes, Worker test não publicado, webhook não registrado |
| `META_VERIFY_TOKEN` | ausente no ambiente Claude Code |
| `META_APP_SECRET` | ausente no ambiente Claude Code |
| `META_ACCESS_TOKEN` | ausente no ambiente Claude Code |
| `META_PHONE_NUMBER_ID` | ausente no ambiente Claude Code |
| Worker test publicado | NÃO — Vasques não executou |
| Webhook Meta registrado | NÃO — Vasques não executou |

**Resultado esperado após ativação por Vasques:**
`27 PASS | 0 FAIL | 4 SKIP | PARCIAL_COM_PROVA_LOCAL_REAL`
(P4–P7 permanecem SKIP no script — evidência externa necessária: logs Cloudflare, painel Meta, mensagem real recebida)

---

## §9 — Frente memória/telemetria

**Status: APROVADA (local/in-memory)**

| Critério | Evidência |
|---|---|
| 7 categorias canônicas | PR-T8.13 |
| Ciclo `draft→validated/rejected/promoted` | implementado |
| Promoção NUNCA automática | `memoryInvariants()` declarado e verificado |
| Sanitização ativa | `sanitizeRecord()` em toda escrita |
| 6 endpoints `/crm/memory/*` | operacionais |
| Telemetria `f7.core.persistence_signal.memory.*` | 5 eventos emitidos |
| `smoke:memory` | 17/17 PASS |
| `prove:memory-telemetry` | 9/9 PASS |
| Persistência Supabase real | pendente — `MEMORY_SUPABASE_ENABLED` futura |

---

## §10 — Frente flags/rollback/go-live

**Status: APROVADA**

| Critério | Evidência |
|---|---|
| 10 flags canônicas com default seguro | PR-T8.15 |
| `ROLLBACK_FLAG=true` bloqueia tudo | ✅ |
| `MAINTENANCE_MODE=true` bloqueia atendimento | ✅ |
| `isOperationallyAllowed()` com 8 bloqueios | ✅ |
| `evaluateGoLiveReadiness()` sem execução real | ✅ |
| `GET /__admin__/go-live/health` | 200, auth, sem secrets |
| `g8_allowed=false` no harness | ✅ |
| `smoke:golive` | 18/18 PASS |

---

## §11 — Testes executados

### prove:g8-readiness (7/7 PASS)

| ID | Prova | Resultado |
|---|---|---|
| R1 | CRM backend/frontend operacional | PASS |
| R2 | Supabase leitura real aprovada (documental) | PASS |
| R3 | Meta/WhatsApp técnica OK + prova real BLOQUEADA | PASS |
| R4 | Memória/telemetria aprovada local/in-memory | PASS |
| R5 | Flags/rollback/go-live harness operacional | PASS |
| R6 | Segurança: sem secret, sem cliente real, sem LLM | PASS |
| R7 | G8 NÃO FECHADO — condições documentadas | PASS |

### Retrocompat (todos PASS)

| Suite | Resultado |
|---|---|
| `smoke:all` | EXIT 0 |
| `smoke:golive` | 18/18 PASS |
| `smoke:memory` | 17/17 PASS |
| `smoke:supabase` | 70/70 PASS |
| `smoke:meta:webhook` | 20/20 PASS |
| `smoke:meta` | 14/14 PASS |
| `prove:memory-telemetry` | 9/9 PASS |
| `prove:crm-e2e` | 73/73 PASS |
| `prove:meta-controlada` | 25/0/6 (bloqueio controlado — correto) |

---

## §12 — Segurança

| Verificação | Status |
|---|---|
| Zero secret no output de health | ✅ |
| Zero `reply_text` em rotas CRM | ✅ |
| Zero `decide_stage` em rotas CRM | ✅ |
| Zero `cliente_real` exposto | ✅ |
| Zero LLM real ativado | ✅ |
| Zero WhatsApp real amplo | ✅ |
| Zero outbound real automático | ✅ |
| Zero migration | ✅ |
| Zero RLS alterado | ✅ |
| Zero storage policy alterada | ✅ |
| Zero go-live | ✅ |
| Zero cliente real | ✅ |
| Zero atendimento real | ✅ |

---

## §13 — Bloqueios remanescentes

| Bloqueio | Responsável | Pré-condição |
|---|---|---|
| Meta/WhatsApp prova real | **Vasques** | `wrangler secret put META_*` + `wrangler deploy --env test` + webhook Meta registrado + challenge real + inbound real + logs Cloudflare |
| LLM real | **Vasques** | autorização explícita + `LLM_REAL_ENABLED=true` |
| Cliente real | **Vasques** | autorização explícita + `CLIENT_REAL_ENABLED=true` |
| Atendimento real | **Vasques** | Meta + LLM + cliente + canal habilitados |
| G8 | **Vasques** | todas as frentes acima concluídas |
| Supabase write real | PR futura | após RLS e schema confirmados |
| Memory Supabase real | PR futura | `MEMORY_SUPABASE_ENABLED=true` + integração real |

---

## §14 — Go/No-Go

```
GO/NO-GO: NO-GO CONTROLADO
G8:       NÃO FECHADO
Contrato: T8 ABERTO — não arquivado
```

**Motivo do NO-GO:**
Meta/WhatsApp prova real externa não concluída (PR-T8.12B). Secrets Meta ausentes, Worker test não publicado, webhook Meta não registrado. Esta é a única trava que impede G8.

**O que NÃO é motivo do NO-GO:**
- CRM ✅ aprovado
- Supabase leitura real ✅ aprovada
- Memória/telemetria ✅ aprovada
- Flags/rollback ✅ aprovado
- Rollback técnico ✅ implementado

---

## §15 — Condição para fechar G8

G8 pode ser fechado quando Vasques executar:

1. `wrangler secret put META_VERIFY_TOKEN --env test`
2. `wrangler secret put META_APP_SECRET --env test`
3. `wrangler secret put META_ACCESS_TOKEN --env test`
4. `wrangler secret put META_PHONE_NUMBER_ID --env test`
5. `wrangler deploy --env test`
6. Registrar webhook no painel Meta Developers com URL do Worker test
7. Executar `npm run prove:meta-controlada` com `META_REAL_ENABLED=true`
8. Confirmar resultado `≥27 PASS | 0 FAIL | ≤4 SKIP`
9. Documentar evidence externa: logs Cloudflare, painel Meta, mensagem real recebida

Após isso, Vasques autoriza `CLIENT_REAL_ENABLED=true`, `LLM_REAL_ENABLED=true`, `CHANNEL_ENABLED=true`, e a PR-T8.R pode ser re-executada com G8 APROVADO.

---

## §16 — Próxima ação obrigatória

**PR-T8.12B — Execução real Meta/WhatsApp controlada por Vasques**

Esta é a única trava. Não há nova frente a implementar.

Ações exclusivas de Vasques:
1. Provisionar os 4 secrets Meta no Worker test
2. Publicar o Worker test (`wrangler deploy --env test`)
3. Registrar o webhook no painel Meta Developers
4. Executar `npm run prove:meta-controlada` com `META_REAL_ENABLED=true`
5. Documentar evidência de challenge real, inbound real e logs Cloudflare
6. Autorizar go-live: `ENOVA2_ENABLED=true`, `CHANNEL_ENABLED=true`, `LLM_REAL_ENABLED=true`, `CLIENT_REAL_ENABLED=true`
7. Executar `prove:g8-readiness` novamente para confirmar G8 liberado
