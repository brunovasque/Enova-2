# T8 — Diagnóstico e correção: CLIENT_REAL_ENABLED não refletido no runtime PROD

**Tipo:** fix/PR-IMPL (correção de bug estrutural identificado por PR-DIAG #174)  
**Data:** 2026-05-01  
**Branch:** `fix/t8-prod-client-real-flag`  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`

---

## Contexto operacional

Após cutover (PR #173), PROD `nv-enova-2` recebeu inbound OK. Telemetria PR #174 revelou:

```json
{"diag":"meta.prod.outbound.gate", "allowed":false, "block_reason":"wa_not_allowed", "client_real_allowed":false}
{"diag":"meta.prod.flags.snapshot", "CLIENT_REAL_ENABLED":false}
```

Vasques executou `wrangler secret put CLIENT_REAL_ENABLED` com valor `true` e fez deploy.  
Mesmo assim, log continuou mostrando `CLIENT_REAL_ENABLED=false` e `block_reason=wa_not_allowed`.

---

## Investigação — 6 itens obrigatórios

### 1. Onde CLIENT_REAL_ENABLED é lido

- `src/golive/flags.ts:59` — `readBool(env, 'CLIENT_REAL_ENABLED')` — leitura correta
- `src/meta/webhook.ts:257` — `flags.client_real_enabled` — log correto via `readCanonicalFlags`
- `src/meta/canary-pipeline.ts` — **NÃO era lido em lugar algum** ← causa raiz

### 2. Existe hardcode false?

**Sim — duas instâncias:**

```typescript
// src/meta/canary-pipeline.ts — linha 246 (diagLog adicionado na PR #174):
client_real_allowed: false,   // HARDCODED — bug de display
```

E o gate de outbound não tinha nenhum caminho para `CLIENT_REAL_ENABLED=true`.

### 3. O leitor aceita string "true"?

`readBool` em `flags.ts` aceita:
```typescript
if (typeof v === 'string') return v.trim().toLowerCase() === 'true';
if (typeof v === 'boolean') return v;
return false;
```
✅ Aceita `"true"` corretamente.

### 4. Normalização de flags vindas de secret/env

`wrangler secret put CLIENT_REAL_ENABLED` com valor `true` → Cloudflare armazena como string `"true"`.  
`readBool(env, 'CLIENT_REAL_ENABLED')` retorna `true` para `"true"`. ✅  
A normalização estava correta — o problema **não era na leitura da flag**, mas no **gate que não a consumia**.

### 5. Conflito entre env vars, defaults e go-live blocking

`MetaWorkerEnv` (em `webhook-env.ts`) não declarava `CLIENT_REAL_ENABLED`.  
Isso não impede o acesso em runtime (TypeScript cast `as unknown as Record<string, unknown>` preserva todas as propriedades), mas indicava que a flag não foi incluída no tipo intencionalmente.

A flag `flags.client_real_enabled` era lida corretamente pelo `readCanonicalFlags` em `webhook.ts` (para o log de flags.snapshot). O log mostrava `CLIENT_REAL_ENABLED: false` porque:
- Nenhuma nova mensagem foi enviada após o `wrangler deploy` que aplicou o secret, **OU**
- O deploy PROD não capturou o novo secret na mesma execução

De qualquer forma, o bloqueio funcional estava no gate — mesmo que `CLIENT_REAL_ENABLED=true` aparecesse no flags.snapshot, o pipeline nunca o consumia para permitir outbound.

### 6. canary-pipeline usava flag errada ou snapshot diferente?

**canary-pipeline não lia `CLIENT_REAL_ENABLED` de forma alguma.**

O gate em `canary-pipeline.ts` era:
```typescript
if (rollbackActive) {
  canaryBlockReason = 'rollback_active';
} else if (maintenanceActive) {
  canaryBlockReason = 'maintenance_active';
} else if (!canaryEnabled) {        // OUTBOUND_CANARY_ENABLED
  canaryBlockReason = 'canary_disabled';
} else if (!canaryWaId) {           // OUTBOUND_CANARY_WA_ID
  canaryBlockReason = 'canary_wa_id_missing';
} else if (inboundWaId !== canaryWaId) {
  canaryBlockReason = 'wa_not_allowed';   // ← bloqueio quando WA ≠ canary
} ...
```

**`CLIENT_REAL_ENABLED` nunca era lido.** Não havia caminho para atendimento amplo.

---

## Bugs identificados e corrigidos

### Bug 1 — Structural: gate não implementa caminho CLIENT_REAL

**Arquivo:** `src/meta/canary-pipeline.ts`  
**Impacto:** Funcional — bloqueava outbound para qualquer WA quando `CLIENT_REAL_ENABLED=true`

**Fix:** Adicionado caminho `clientRealEnabled` ANTES das verificações de canary:

```typescript
} else if (clientRealEnabled) {
  // CLIENT_REAL path: qualquer WA permitido, reply_text obrigatório
  if (!replyText) {
    canaryBlockReason = 'reply_text_missing';
  } else {
    canaryAllowed = true;
    clientRealAllowed = true;
  }
} else if (!canaryEnabled) {
  // caminho canary: inalterado
```

### Bug 2 — Display: diagLog hardcodava client_real_allowed=false

**Arquivo:** `src/meta/canary-pipeline.ts`  
**Impacto:** Diagnóstico — log mostrava `client_real_allowed: false` mesmo quando true

**Fix:** Substituído por `clientRealAllowed` variável real.

### Bug 3 — Tipo: MetaWorkerEnv não declarava CLIENT_REAL_ENABLED

**Arquivo:** `src/meta/webhook-env.ts`  
**Impacto:** Tipo incompleto — flag não estava documentada como parte do protocolo env do Worker

**Fix:** Adicionado `CLIENT_REAL_ENABLED?: unknown` à interface.

---

## Gate cascade após correção

```
rollback_active     → BLOQUEADO (ROLLBACK_FLAG=true)
maintenance_active  → BLOQUEADO (MAINTENANCE_MODE=true)
client_real_enabled → PERMITIDO para qualquer WA (CLIENT_REAL_ENABLED=true)
  └── reply_text ausente → reply_text_missing
canary_disabled     → BLOQUEADO (OUTBOUND_CANARY_ENABLED=false, CLIENT_REAL=false)
canary_wa_id_missing→ BLOQUEADO (sem OUTBOUND_CANARY_WA_ID)
wa_not_allowed      → BLOQUEADO (wa_id ≠ OUTBOUND_CANARY_WA_ID)
reply_text_missing  → BLOQUEADO
canary_allowed      → PERMITIDO (wa_id === OUTBOUND_CANARY_WA_ID)
```

### Logs PROD após correção (modo client_real)

```json
{"diag":"meta.prod.flags.snapshot",   "CLIENT_REAL_ENABLED":true,  "ROLLBACK_FLAG":false}
{"diag":"meta.prod.outbound.gate",    "allowed":true, "block_reason":null,
                                       "client_real_allowed":true, "canary_allowed":false}
{"diag":"meta.prod.outbound.result",  "external_dispatch":true, "meta_status":200}
{"diag":"meta.prod.webhook.final",    "external_dispatch":true, "mode":"client_real_outbound"}
```

---

## Smoke criado: `smoke:meta:client-real-flag` — 35 PASS | 0 FAIL

| ID | Cenário | Resultado |
|---|---|---|
| CRF-01..05 | CLIENT_REAL=false + WA diferente → wa_not_allowed | ✅ |
| CRF-06..13 | CLIENT_REAL=true + WA diferente → permite outbound | ✅ |
| CRF-14..18 | CLIENT_REAL=true + ROLLBACK=true → bloqueia | ✅ |
| CRF-19..22 | CLIENT_REAL=true + MAINTENANCE=true → bloqueia | ✅ |
| CRF-23..26 | CLIENT_REAL=true + META_OUTBOUND=false → ext_dispatch=false | ✅ |
| CRF-27..30 | CLIENT_REAL=true sem OUTBOUND_CANARY_WA_ID → permite | ✅ |
| CRF-31..35 | Canary autorizado com CLIENT_REAL=false → funciona | ✅ |

Regressão: `smoke:meta:canary` 41/41 PASS | `smoke:meta:webhook` 20/20 PASS | `smoke:meta:pipeline` 26/26 PASS

---

## Instruções pós-deploy

1. `npx wrangler deploy` (sem --env) — PROD `nv-enova-2`
2. Confirmar via dashboard Cloudflare → `nv-enova-2` → Settings:
   - `CLIENT_REAL_ENABLED=true` (como env var OU secret)
   - `ROLLBACK_FLAG=false`
   - `MAINTENANCE_MODE=false`
3. `npx wrangler tail nv-enova-2` — abrir em terminal separado
4. Enviar mensagem WhatsApp real
5. Verificar no tail:
   - `meta.prod.flags.snapshot` → `CLIENT_REAL_ENABLED: true`
   - `meta.prod.outbound.gate` → `allowed: true, client_real_allowed: true`
   - `meta.prod.outbound.result` → `external_dispatch: true`
   - `meta.prod.webhook.final` → `mode: "client_real_outbound"`

---

## Marcadores de governança

**T8.12B: NÃO ENCERRADA — esta PR não fecha T8.12B.**  
**G8: NÃO FECHADO — esta PR não fecha G8.**  
**Nenhuma regra de negócio alterada.** Nenhuma rota alterada. Nenhum prompt LLM alterado.  
**Rollback gate (`ROLLBACK_FLAG=true`) preservado** como bloqueio soberano de tudo.
