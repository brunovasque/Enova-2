# Handoff T9 — LLM ↔ Funil ↔ Supabase ↔ Telemetria

**Tipo:** Handoff de sessão  
**Data:** 2026-05-01  
**Contrato:** `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`  
**Status contrato:** ABERTO — aguardando execução T9.1

---

## Estado atual (início de T9)

### O que está funcionando em PROD (não mexer)
- Webhook Meta + assinatura HMAC + parser + dedupe (`src/meta/webhook.ts`)
- Pipeline canary completo: CRM upsert + memória + LLM + outbound (`src/meta/canary-pipeline.ts`)
- Outbound real com `external_dispatch=true` via `CLIENT_REAL_ENABLED=true`
- LLM `gpt-4o-mini` respondendo humanamente
- `ROLLBACK_FLAG=true` soberano — bloqueia tudo em segundos
- Smokes: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `prove:g8-readiness` 7/7

### O que não está funcionando (a resolver em T9)
- LLM cego ao funil — recebe só `text_body`, sem stage/facts/históriço/regras
- `runCoreEngine` **não é chamado** pelo pipeline WhatsApp (BLK-01)
- `CrmLeadState.stage_current` nunca é escrito em runtime real — literal `'unknown'` (BLK-02)
- Parsers L04–L17 nunca recebem texto WhatsApp real (BLK-03)
- Supabase silenciosamente desligado em PROD — fallback in-memory sem log (BLK-05)
- `wrangler.toml` zero bindings declarados (BLK-06)
- Memória/CRM/override perdem tudo no restart

---

## Próxima ação autorizada

**T9.1 — Supabase runtime/env readiness**

Branch sugerido: `feat/t9.1-wrangler-env-bindings`

### O que T9.1 deve fazer
1. Adicionar bloco `[vars]` em `wrangler.toml` com placeholders (sem valores):
   ```toml
   [vars]
   SUPABASE_REAL_ENABLED = "false"
   LLM_REAL_ENABLED = "false"
   CLIENT_REAL_ENABLED = "false"
   ENOVA2_ENABLED = "false"
   MEMORY_SUPABASE_ENABLED = "false"
   ROLLBACK_FLAG = "false"
   MAINTENANCE_MODE = "false"
   GOLIVE_HARNESS_ENABLED = "false"
   OUTBOUND_CANARY_ENABLED = "false"
   OUTBOUND_CANARY_WA_ID = ""
   CANARY_PERCENT = "0"
   ```
2. Adicionar comentário documentando secrets (via `wrangler secret put`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `OPENAI_API_KEY`, `CRM_ADMIN_KEY`
3. Criar `src/runtime/env-validator.ts` — lista canônica de envs esperadas com defaults seguros
4. Criar `smoke:runtime:env` — verifica que envs conhecidas têm defaults ou são reportadas em health
5. Atualizar STATUS + LATEST

### O que T9.1 NÃO deve fazer
- NÃO alterar valores de secrets em PROD (apenas estrutura declarativa)
- NÃO habilitar Supabase real (isso vem em T9.11)
- NÃO mexer em pipeline, LLM, Core, outbound, webhook

---

## Sequência de frentes

```
T9.0 (contrato) ─→ T9.1 (wrangler) ─→ T9.2 (fallback guard)
                └─→ T9.3 (DIAG Core) ─→ T9.4 (plug Core) ─→ T9.5 (PROVA stage)
                                                            ─→ T9.6 (parsers) ─→ T9.7 (PROVA facts)
                                                                                ─→ T9.8 (LlmContext)
                                                                                   ─→ T9.9 (output guard)
                                                                                      ─→ T9.10 (PROVA 5 turnos)
                T9.2 + T9.5 ──────────────────────────────────────────────────────────→ T9.11 (Supabase write)
                                                                                           ─→ T9.12 (PROVA restart)
                T9.10 ──────────────────────────────────────────────────────────────────→ T9.13 (telemetria)
                T9.12 + T9.13 ──────────────────────────────────────────────────────────→ T9.R (G9)
```

---

## Arquivos-chave para T9.1–T9.4

| Arquivo | Relevância |
|---|---|
| `wrangler.toml` | Zero bindings hoje — T9.1 resolve |
| `src/crm/store.ts:113-130` | `getCrmBackend()` — fallback silencioso — T9.2 resolve |
| `src/meta/canary-pipeline.ts` | Pipeline WhatsApp — T9.4 plugará Core aqui |
| `src/core/engine.ts` | `runCoreEngine(state: LeadState): CoreDecision` — T9.3 mapeia; T9.4 conecta |
| `src/core/types.ts` | `StageId`, `CoreDecision`, `LeadState`, `GateId` — ler antes de T9.3 |
| `src/llm/client.ts` | `callLlm(string, env)` — T9.8 atualiza para `callLlm(LlmContext, env)` |
| `src/context/living-memory.ts` | Existe mas não é usado — candidato para T9.8 |

---

## Decisões pendentes para Vasques

### A. Persistência Supabase real é pré-condição de T9?
- **Opção 1** (mais seguro, mais lento): T9 inteira exige Supabase real ativo. Stage nunca efêmero.
- **Opção 2** (recomendada): T9 conecta LLM↔funil em in-memory primeiro. Supabase real vem em T9.11. Canary controlado para `OUTBOUND_CANARY_WA_ID` até lá.

### B. Output guard LLM: hard-fail ou soft-fail?
- **Hard-fail** (recomendado): promessa de aprovação MCMV → outbound bloqueado + alert para Vasques.
- **Soft-fail**: outbound envia, mas `learning_candidate` cria rascunho de objeção.

### C. Quanto contexto histórico passar ao LLM?
- **Recomendação**: 3 últimos turnos brutos + facts atuais + stage + `next_objective`. Ajustar com smoke real.

---

## Invariantes que nunca podem ser tocados

| Invariante | Onde |
|---|---|
| `ROLLBACK_FLAG=true` bloqueia tudo | `canary-pipeline.ts:158-162,229-231` |
| `CLIENT_REAL_ENABLED=true` exigido para outbound amplo | `canary-pipeline.ts:233-240` |
| LLM nunca decide stage | invariante doutrinária + output guard |
| Mecânico nunca gera fala | invariante doutrinária |
| Secrets nunca em log/error/response | `src/memory/sanitize.ts` |
| `META_APP_SECRET` valida assinatura ANTES de parse | `webhook.ts:174-201` |
| G8 frente WhatsApp APROVADO — intocável | `prove:g8-readiness` 7/7 |

---

## Critério final (G9)

G9 fecha quando os 10 critérios G9-01..G9-10 tiverem evidência real.
O mais difícil e mais importante: **G9-03** (conversa real 3+ stages) e **G9-10** (Vasques confirma 5 conversas reais).

Detalhamento completo: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` §5.
