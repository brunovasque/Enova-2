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
        lead_id = result.record.lead_id;
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

      // Ler stage atual para registrar stage_at_turn corretamente (BLK-02 fix)
      let stageAtTurn = 'discovery';
      const stateRes = await getLeadState(backend, lead_id);
      if (stateRes.found && stateRes.record?.stage_current && stateRes.record.stage_current !== 'unknown') {
        stageAtTurn = stateRes.record.stage_current;
      }

      const summary = event.text_body
        ? event.text_body.slice(0, 200)
        : `[${event.message_type ?? event.kind}]`;
      const result = await createConversationTurn(backend, lead_id, 'whatsapp', summary, stageAtTurn);
      if (result.success && result.record) {
        turn_id = result.record.turn_id;
        emitPipeline(ctx, 'crm.turn_created', 'completed', { lead_id, turn_id });
      } else {
        errors.push(`crm_turn_failed: ${result.error ?? 'unknown'}`);
        emitPipeline(ctx, 'crm.turn_failed', 'failed', { lead_id, error: result.error });
      }
    } catch (e) {
      errors.push(`crm_turn_exception: ${String(e)}`);
      emitPipeline(ctx, 'crm.turn_exception', 'failed', { lead_id, error: String(e) });
    }
  }

  // Passo 3 — Registrar memória (source: meta_webhook)
  try {
    const summary = event.text_body
      ? `Mensagem WhatsApp recebida: ${event.text_body.slice(0, 100)}`
      : `Evento WhatsApp recebido: ${event.kind} / ${event.message_type ?? 'sem tipo'}`;

    const memResult = registerMemoryEvent({
      category: 'attendance_memory',
      event_type: 'attendance_message_received',
      source: 'meta_webhook',
      lead_ref: lead_id ?? event.wa_id ?? 'unknown',
      summary,
      evidence_ref: event.wa_message_id ?? undefined,
      risk_level: 'low',
      details: {
        wa_id: event.wa_id,
        phone_number_id: event.phone_number_id,
        message_type: event.message_type,
        has_text: event.text_body !== null,
        has_media: event.media_id !== null,
        lead_id: lead_id ?? null,
        turn_id: turn_id ?? null,
      },
    });

    if (memResult.success && memResult.record) {
      memory_event_id = memResult.record.id;
      emitPipeline(ctx, 'memory.recorded', 'completed', {
        memory_event_id,
        lead_ref: lead_id ?? event.wa_id,
      });
    } else {
      errors.push(`memory_failed: ${memResult.error ?? 'unknown'}`);
      emitPipeline(ctx, 'memory.failed', 'failed', { error: memResult.error });
    }
  } catch (e) {
    errors.push(`memory_exception: ${String(e)}`);
    emitPipeline(ctx, 'memory.exception', 'failed', { error: String(e) });
  }

  const ok = errors.length === 0;
  emitPipeline(ctx, ok ? 'completed' : 'partial', ok ? 'completed' : 'observed', {
    lead_id,
    turn_id,
    memory_event_id,
    errors_count: errors.length,
  });

  return {
    ok,
    mode: 'crm_memory_only',
    ...(lead_id !== undefined ? { lead_id } : {}),
    ...(turn_id !== undefined ? { turn_id } : {}),
    ...(memory_event_id !== undefined ? { memory_event_id } : {}),
    llm_invoked: false,
    external_dispatch: false,
    outbound_attempted: false,
    ...(errors.length > 0 ? { errors } : {}),
  };
}
