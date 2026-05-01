# PR-T8.15 — Feature flags, rollback técnico e harness de go-live

**Tipo:** PR-IMPL  
**Frente:** Controles finais de operação segura  
**Data:** 2026-04-30  
**Branch:** `feat/t8-pr-t8-15-flags-rollback-golive-harness`

---

## §1 — Meta

Esta PR-T8.15 implementa os controles finais de operação segura da Enova 2 antes da prova operacional real T8.R/G8:

- Feature flags canônicas com default seguro (`false`/`0`).
- Rollback técnico via `isOperationallyAllowed()`.
- Modo manutenção via `MAINTENANCE_MODE`.
- Health operacional via `GET /__admin__/go-live/health`.
- Harness de go-live que avalia readiness sem executar nada real.
- Smoke operacional 18/18 PASS.

Esta PR **prepara** a operação real. **NÃO executa go-live. NÃO fecha G8.**

---

## §2 — Objetivo

Garantir que a Enova 2 tenha controles explícitos e verificáveis para:
- Impedir acidentalmente cliente real, WhatsApp real, LLM real e outbound real sem autorização de Vasques.
- Permitir rollback técnico seguro em qualquer momento.
- Expor health operacional para observação.
- Documentar o estado atual de G8 (bloqueado — Meta aguardando Vasques).

---

## §3 — Estado herdado

| Frente | Estado |
|---|---|
| CRM backend/frontend | ✅ APROVADA (PR-T8.4/T8.5/T8.6) |
| Supabase leitura real | ✅ APROVADA (PR-T8.9B) |
| Meta/WhatsApp | ❌ BLOQUEADA_AGUARDANDO_VASQUES (PR-T8.12B) |
| Memória/telemetria | ✅ APROVADA_LOCAL_IN_MEMORY (PR-T8.14) |
| Feature flags/rollback | ⚠️ inexistente até esta PR |
| Go-live harness | ⚠️ inexistente até esta PR |
| G8 | 🔴 NÃO FECHADO |

---

## §4 — Flags implementadas

Módulo: `src/golive/flags.ts`

| Flag | Tipo | Default | Descrição |
|---|---|---|---|
| `ENOVA2_ENABLED` | bool | `false` | Sistema habilitado globalmente |
| `CHANNEL_ENABLED` | bool | `false` | Canal real de comunicação habilitado |
| `META_OUTBOUND_ENABLED` | bool | `false` | Outbound Meta/WhatsApp habilitado |
| `LLM_REAL_ENABLED` | bool | `false` | LLM real habilitado |
| `CLIENT_REAL_ENABLED` | bool | `false` | Atendimento de cliente real autorizado |
| `CANARY_PERCENT` | number | `0` | Percentual de tráfego real (0–100) |
| `ROLLBACK_FLAG` | bool | `false` | Rollback ativo — bloqueia tudo |
| `MAINTENANCE_MODE` | bool | `false` | Modo manutenção ativo |
| `GOLIVE_HARNESS_ENABLED` | bool | `false` | Harness de go-live habilitado |
| `MEMORY_SUPABASE_ENABLED` | bool | `false` | Persistência real de memória (PR futura) |

Regras de parsing:
- `CANARY_PERCENT` fora de `[0, 100]` → `0` (seguro).
- Valor não-numérico → `0`.
- Ausência de env → `false` / `0`.

---

## §5 — Rollback técnico

Módulo: `src/golive/rollback.ts`

### `isOperationallyAllowed(env, operation)`

Função central de decisão operacional. Recebe flags do ambiente e uma descrição da operação desejada. Retorna `{ allowed, rollback_active, maintenance_active, blocking_reasons, flags }`.

**Bloqueios aplicados por ordem:**

1. `ROLLBACK_FLAG=true` → bloqueia sempre, independente de outras flags.
2. `MAINTENANCE_MODE=true` → bloqueia atendimento.
3. `require_enova2` + `ENOVA2_ENABLED=false` → bloqueia.
4. `require_channel` + `CHANNEL_ENABLED=false` → bloqueia.
5. `require_meta_outbound` + `META_OUTBOUND_ENABLED=false` → bloqueia.
6. `require_llm_real` + `LLM_REAL_ENABLED=false` → bloqueia.
7. `require_client_real` + `CLIENT_REAL_ENABLED=false` → bloqueia.
8. `require_canary_above=N` + `CANARY_PERCENT < N` → bloqueia.

**Default seguro:** env vazio → todas as operações reais bloqueadas.

### `isFullGoLiveAllowed(env)`

Atalho que exige todas as flags reais ao mesmo tempo (enova2, channel, meta_outbound, llm_real, client_real, canary > 0). Retorna `blocked` por default.

---

## §6 — Maintenance mode

`MAINTENANCE_MODE=true` → `isOperationallyAllowed` adiciona `'MAINTENANCE_MODE=true ativo'` aos `blocking_reasons`. O harness reporta `flags_ready=false`. A rota de health informa `maintenance_active=true`.

Ativação: `wrangler secret put MAINTENANCE_MODE --env test` com valor `'true'`. Desativação: setar para `'false'` ou remover.

---

## §7 — Health operacional

Módulo: `src/golive/health.ts`  
Rota: `GET /__admin__/go-live/health`

Auth: `X-CRM-Admin-Key` (mesmo mecanismo das rotas `/crm/*`).

**Resposta (200):**

```json
{
  "ok": true,
  "route": "/__admin__/go-live/health",
  "timestamp": "<iso>",
  "status": "g8_blocked",
  "flags": { ... todos os 10 flags, sem secrets ... },
  "blocking_reasons": [ ... ],
  "readiness": {
    "crm_ready": true,
    "supabase_ready": true,
    "meta_ready": false,
    "memory_ready": true,
    "telemetry_ready": true,
    "rollback_ready": true,
    "flags_ready": true
  },
  "operations": {
    "client_real_allowed": false,
    "llm_real_allowed": false,
    "channel_real_allowed": false,
    "rollback_active": false,
    "maintenance_active": false
  },
  "g8": {
    "allowed": false,
    "blocking_reasons": [ ... ]
  },
  "details": { ... }
}
```

Sem auth → 401. Método não-GET → 405. Nenhum secret aparece no output.

---

## §8 — Harness de go-live

Módulo: `src/golive/harness.ts`

`evaluateGoLiveReadiness(env)` retorna `GoLiveReadiness` com:

| Campo | Tipo | Significado |
|---|---|---|
| `crm_ready` | bool | CRM aprovado (PR-T8.4/T8.5/T8.6) |
| `supabase_ready` | bool | Supabase leitura real aprovada (PR-T8.9B) |
| `meta_ready` | bool | **false** — aguarda Vasques |
| `memory_ready` | bool | Memória aprovada local/in-memory (PR-T8.14) |
| `telemetry_ready` | bool | Telemetria FRONT-7 operacional |
| `rollback_ready` | bool | Rollback técnico implementado (esta PR) |
| `flags_ready` | bool | Sem rollback_flag nem maintenance_mode |
| `client_real_allowed` | bool | Flag + enova2 habilitados |
| `llm_real_allowed` | bool | Flag + enova2 habilitados |
| `channel_real_allowed` | bool | Flag + enova2 habilitados |
| `g8_allowed` | bool | **false** — Meta bloqueada |
| `blocking_reasons` | string[] | Lista completa de razões |
| `details` | object | Metadados sem secrets |

**Estado atual nesta PR:**
- `meta_ready = false` → hardcoded enquanto PR-T8.12B não for concluída por Vasques.
- `g8_allowed = false` → consequência direta de `meta_ready = false`.

---

## §9 — Smoke operacional

Módulo: `src/golive/smoke.ts`  
Script: `npm run smoke:golive`  
Resultado: **18/18 PASS**

| Cenário | Resultado |
|---|---|
| 1. Default seguro bloqueia operação real | PASS |
| 2. ROLLBACK_FLAG=true bloqueia tudo | PASS |
| 3. MAINTENANCE_MODE=true bloqueia atendimento | PASS |
| 4. ENOVA2_ENABLED=false bloqueia | PASS |
| 5. CLIENT_REAL_ENABLED=false bloqueia cliente real | PASS |
| 6. LLM_REAL_ENABLED=false bloqueia LLM real | PASS |
| 7. CHANNEL_ENABLED=false bloqueia canal real | PASS |
| 8. META_OUTBOUND_ENABLED=false bloqueia outbound | PASS |
| 9. CANARY_PERCENT=0 bloqueia tráfego real | PASS |
| 10. Status informa Meta bloqueada (T8.12B) | PASS |
| 11. G8 NÃO permitido enquanto Meta bloqueada | PASS |
| 12. Sem secret no output de health | PASS |
| 13. GET /__admin__/go-live/health retorna 200 | PASS |
| 14. 401 sem auth | PASS |
| 15. 405 com método errado | PASS |
| 16. Flags ativas desbloqueiam operações internas | PASS |
| 17. CANARY_PERCENT parsing correto | PASS |
| 18. isFullGoLiveAllowed blocked por default | PASS |

---

## §10 — Segurança

| Item | Status |
|---|---|
| Nenhuma flag expõe secret | ✅ |
| Auth `X-CRM-Admin-Key` na rota de health | ✅ |
| `flagsPublicSummary` não inclui secrets | ✅ |
| `evaluateGoLiveReadiness` não acessa secrets | ✅ |
| Default `false`/`0` em toda flag | ✅ |
| Smoke verifica ausência de secrets no output | ✅ |

---

## §11 — Limitações

1. **Meta/WhatsApp bloqueada**: `meta_ready=false` é hardcoded até PR-T8.12B ser concluída por Vasques.
2. **G8 bloqueado**: consequência direta da limitação acima.
3. **Persistência real de memória**: ainda in-memory — integração Supabase real em PR futura.
4. **Supabase write real**: apenas leitura aprovada — escrita real em PR futura.
5. **LLM real**: não ativado — exige flag e autorização.
6. **Cliente real**: não autorizado — exige Vasques.

---

## §12 — Bloqueios remanescentes

| Bloqueio | Responsável | PR |
|---|---|---|
| Meta/WhatsApp prova real | Vasques (secrets + webhook + deploy) | PR-T8.12B |
| Go-live / G8 | Vasques (autorização explícita) | PR-T8.R |
| LLM real | Vasques | PR-T8.R |
| Cliente real | Vasques | PR-T8.R |
| Supabase write real | Vasques + PR futura | — |
| Memory Supabase real | PR futura (`MEMORY_SUPABASE_ENABLED`) | — |

---

## §13 — Resultado final

| Suite | Resultado |
|---|---|
| `npm run smoke:golive` | **18/18 PASS** |
| `npm run smoke:all` | **EXIT 0** |
| `npm run prove:memory-telemetry` | 9/9 PASS retrocompat |
| `npm run prove:crm-e2e` | 73/73 PASS retrocompat |
| `npm run prove:meta-controlada` | 25/0/6 retrocompat (Meta bloqueada — correto) |

---

## §14 — Próxima PR autorizada

**PR-T8.R — Readiness/Closeout G8** (somente com autorização explícita de Vasques).

Critérios:
- PR-T8.12B concluída por Vasques (Meta/WhatsApp prova real).
- Vasques autoriza go-live real.
- LLM real e cliente real habilitados por Vasques.
- Esta PR (PR-T8.15) está mergeada.

**Declarações explícitas:**
- Esta PR **não fecha G8**.
- Meta/WhatsApp **continua bloqueada** aguardando Vasques.
- Atendimento real **não foi executado**.
- Cliente real **não foi ativado**.
- LLM real **não foi ativado**.
- Go-live **só na PR-T8.R com autorização explícita de Vasques**.
