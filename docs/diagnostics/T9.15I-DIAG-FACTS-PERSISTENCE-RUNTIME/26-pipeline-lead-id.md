# Diagnóstico T9.15I — 26 — pipeline.ts: origem do lead_id (raiz bug T9.15J)
# Data: 2026-05-04
# Branch: fix/t9.15i-facts-persistence-telemetry
# Arquivo analisado: src/meta/pipeline.ts (read-only)

---

## Objetivo

Identificar de onde vem `crmResult.lead_id` que chega ao canary-pipeline.ts.
Em PROD esse valor é `"554185260518"` (wa_id / número de telefone), não um UUID.
Isso causa `pg_code=22P02` em `writeLeadAccumulatedFacts`.

---

## grep -n "lead_id\|wa_id\|upsertLeadByPhone\|createLead" src/meta/pipeline.ts | head -60

```
21:import { upsertLeadByPhone, createConversationTurn, getLeadState } from '../crm/service.ts';
28:  lead_id?: string;
84:    has_wa_id: event.wa_id !== null,
88:  let lead_id: string | undefined;
95:    const waId = event.wa_id ?? '';
97:      errors.push('crm_upsert_skipped: wa_id ausente');
99:      const result = await upsertLeadByPhone(
105:        lead_id = result.record.lead_id;
106:        emitPipeline(ctx, 'crm.lead_upserted', 'completed', { lead_id });
118:  if (lead_id) {
124:      const stateRes = await getLeadState(backend, lead_id);
132:      const result = await createConversationTurn(backend, lead_id, 'whatsapp', summary, stageAtTurn);
135:        emitPipeline(ctx, 'crm.turn_created', 'completed', { lead_id, turn_id });
138:        emitPipeline(ctx, 'crm.turn_failed', 'failed', { lead_id, error: result.error });
142:      emitPipeline(ctx, 'crm.turn_exception', 'failed', { lead_id, error: String(e) });
156:      lead_ref: lead_id ?? event.wa_id ?? 'unknown',
161:        wa_id: event.wa_id,
166:        lead_id: lead_id ?? null,
175:        lead_ref: lead_id ?? event.wa_id,
188:    lead_id,
197:    ...(lead_id !== undefined ? { lead_id } : {}),
```

---

## Linhas 1-80 completas

```typescript
/**
 * ENOVA 2 — PR-T8.16 — Orquestrador inbound Meta → CRM + memória
 *
 * RESPONSABILIDADE:
 *   Evento Meta normalizado → upsert lead CRM → registrar turno CRM
 *   → registrar memória (source: meta_webhook) → retornar relatório técnico.
 *
 * RESTRIÇÕES INVIOLÁVEIS (contrato T8.16):
 *   - Nunca chama LLM.
 *   - Nunca envia outbound.
 *   - Nunca responde WhatsApp.
 *   - Nunca gera reply_text.
 *   - Nunca lança exceção para fora — captura internamente, retorna errors[].
 *   - Gate obrigatório: ENOVA2_ENABLED=true.
 */

import type { NormalizedMetaEvent } from './parser.ts';
import type { MetaWorkerEnv } from './webhook-env.ts';
import type { TelemetryRequestContext } from '../telemetry/types.ts';
import { getCrmBackend } from '../crm/store.ts';
import { upsertLeadByPhone, createConversationTurn, getLeadState } from '../crm/service.ts';
import { registerMemoryEvent } from '../memory/service.ts';
import { emitTelemetry } from '../telemetry/emit.ts';

export interface PipelineReport {
  ok: boolean;
  mode: 'crm_memory_only';
  lead_id?: string;
  turn_id?: string;
  memory_event_id?: string;
  llm_invoked: false;
  external_dispatch: false;
  outbound_attempted: false;
  errors?: string[];
}

function emitPipeline(
  ctx: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
  action: string,
  outcome: 'completed' | 'rejected' | 'observed' | 'failed',
  details: Record<string, unknown>,
) {
  emitTelemetry({
    layer: 'core',
    category: outcome === 'failed' || outcome === 'rejected' ? 'persistence_signal' : 'channel_signal',
    action: `meta.pipeline.${action}`,
    source: 'src/meta/pipeline.ts',
    severity: outcome === 'failed' || outcome === 'rejected' ? 'warn' : 'info',
    outcome,
    trace_id: ctx.trace_id,
    correlation_id: ctx.correlation_id,
    request_id: ctx.request_id,
    details,
  });
}

export async function runInboundPipeline(
  event: NormalizedMetaEvent,
  env: MetaWorkerEnv,
  telemetryContext?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
): Promise<PipelineReport> {
  const ctx = {
    trace_id: telemetryContext?.trace_id ?? 'pipeline-trace-local',
    correlation_id: telemetryContext?.correlation_id ?? 'pipeline-trace-local',
    request_id: telemetryContext?.request_id ?? 'pipeline-request-local',
  };

  // Gate: ENOVA2_ENABLED deve estar ativo
  if (env.ENOVA2_ENABLED !== 'true' && env.ENOVA2_ENABLED !== true) {
    emitPipeline(ctx, 'blocked', 'rejected', { reason: 'enova2_disabled' });
    return {
      ok: false,
      mode: 'crm_memory_only',
      llm_invoked: false,
      external_dispatch: false,
      outbound_attempted: false,
      errors: ['blocked_enova2_disabled'],
    };
  }
```

---

## Linhas 81-200 — fluxo completo do lead_id

```typescript
  emitPipeline(ctx, 'started', 'observed', {
    kind: event.kind,
    message_type: event.message_type,
    has_wa_id: event.wa_id !== null,
  });

  const errors: string[] = [];
  let lead_id: string | undefined;
  let turn_id: string | undefined;
  let memory_event_id: string | undefined;

  // Passo 1 — Upsert lead CRM
  try {
    const backend = await getCrmBackend(env as Record<string, unknown>);
    const waId = event.wa_id ?? '';
    if (!waId) {
      errors.push('crm_upsert_skipped: wa_id ausente');
    } else {
      const result = await upsertLeadByPhone(
        backend,
        waId,
        event.phone_number_id ?? undefined,
      );
      if (result.success && result.record) {
        lead_id = result.record.lead_id;            // ← ORIGEM DO PROBLEMA
        emitPipeline(ctx, 'crm.lead_upserted', 'completed', { lead_id });
      } else {
        errors.push(`crm_upsert_failed: ${result.error ?? 'unknown'}`);
        emitPipeline(ctx, 'crm.lead_upsert_failed', 'failed', { error: result.error });
      }
    }
  } catch (e) {
    errors.push(`crm_upsert_exception: ${String(e)}`);
    emitPipeline(ctx, 'crm.lead_exception', 'failed', { error: String(e) });
  }

  // Passo 2 — Registrar turno de conversa CRM
  if (lead_id) {
    try {
      const backend = await getCrmBackend(env as Record<string, unknown>);
      let stageAtTurn = 'discovery';
      const stateRes = await getLeadState(backend, lead_id);
      ...
      const result = await createConversationTurn(backend, lead_id, 'whatsapp', summary, stageAtTurn);
      ...
    }
  }

  return {
    ok,
    mode: 'crm_memory_only',
    ...(lead_id !== undefined ? { lead_id } : {}),   // ← lead_id retornado para canary-pipeline.ts
    ...
  };
```

---

## Análise — cadeia causal do bug T9.15J

### Fluxo de dados (pipeline.ts → canary-pipeline.ts)

```
event.wa_id = "554185260518"
    ↓
upsertLeadByPhone(backend, waId, ...)    [src/crm/service.ts]
    ↓
result.record.lead_id                    [o que upsertLeadByPhone retorna como lead_id]
    ↓
lead_id = result.record.lead_id          [pipeline.ts:105]
    ↓
PipelineReport.lead_id                   [pipeline.ts:197]
    ↓
crmResult.lead_id em canary-pipeline.ts
    ↓
readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id)   → pg_code=22P02
writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id)  → pg_code=22P02
```

### Hipótese principal

`upsertLeadByPhone` retorna como `record.lead_id` o próprio wa_id (`"554185260518"`).

Isso é confirmado pelos tails (files 23 e 25):
```json
{"diag":"facts_persistence.write","ok":false,"error":"http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""}
```

O valor `"554185260518"` é `event.wa_id` — número de telefone, não UUID.

### O que precisa ser investigado a seguir

**`src/crm/service.ts` — função `upsertLeadByPhone`:**
- O que ela faz com `waId`?
- O que ela retorna como `record.lead_id`?
- Existe um UUID gerado pelo Supabase que poderia ser retornado em vez do wa_id?

**`src/crm/crm-store.ts` — schema da tabela CRM:**
- Existe uma coluna `id` (UUID primária) separada de `lead_id` (wa_id)?
- `enova_state.lead_id` referencia qual das duas colunas?

### Opções de fix para T9.15J

**Opção A — Fix em `upsertLeadByPhone` (service.ts):**
- Retornar o UUID gerado pelo Supabase como `record.lead_id` em vez do wa_id
- Requer: verificar o schema da tabela CRM e o que Supabase retorna

**Opção B — Fix em `readLeadAccumulatedFacts` / `writeLeadAccumulatedFacts` (crm-store.ts):**
- Usar `wa_id` (phone) como chave de lookup em `enova_state` em vez de `lead_id`
- Requer: verificar se `enova_state` tem coluna `wa_id` / `phone`

**Opção C — Fix em `canary-pipeline.ts`:**
- Usar `event.wa_id` direto (disponível via `crmResult`) como chave alternativa
- Menos cirúrgico — propaga workaround para camada errada

**Próxima PR:** T9.15J — investigar `src/crm/service.ts:upsertLeadByPhone` e schema CRM.
