/**
 * ENOVA 2 — PR-T8.17 — Orquestrador canary: LLM + outbound controlado
 *
 * FLUXO:
 *   NormalizedMetaEvent
 *   → runInboundPipeline (CRM + memória)
 *   → LLM gera reply_text (gated LLM_REAL_ENABLED + !ROLLBACK_FLAG + !MAINTENANCE_MODE)
 *   → outbound envia resposta (gated OUTBOUND_CANARY_ENABLED + wa_id autorizado)
 *   → CanaryReport técnico completo
 *
 * GATES OBRIGATÓRIOS:
 *   - LLM_REAL_ENABLED=true → chama LLM
 *   - OUTBOUND_CANARY_ENABLED=true + wa_id === OUTBOUND_CANARY_WA_ID → envia outbound
 *   - ROLLBACK_FLAG=true → bloqueia LLM e outbound
 *   - MAINTENANCE_MODE=true → bloqueia LLM e outbound
 *   - CLIENT_REAL_ENABLED pode permanecer false — canary autorizado independentemente
 *
 * REGRAS INVIOLÁVEIS:
 *   - LLM é soberano da fala. Adapter NUNCA gera reply_text por conta própria.
 *   - WA não autorizado NUNCA recebe resposta.
 *   - Secrets nunca aparecem em log/error/response.
 *   - Nunca lança exceção para fora — captura internamente, retorna errors[].
 */

import type { NormalizedMetaEvent } from './parser.ts';
import type { MetaWorkerEnv } from './webhook-env.ts';
import type { TelemetryRequestContext } from '../telemetry/types.ts';
import type { OutboundResult } from './outbound.ts';
import type { LlmClientResult } from '../llm/client.ts';
import { runInboundPipeline } from './pipeline.ts';
import { sendMetaOutbound } from './outbound.ts';
import { callLlm } from '../llm/client.ts';
import { emitTelemetry } from '../telemetry/emit.ts';
import { diagLog, maskId } from './prod-diag.ts';

export type CanaryBlockReason =
  | 'rollback_active'
  | 'maintenance_active'
  | 'llm_disabled'
  | 'llm_no_text'
  | 'llm_failed'
  | 'canary_disabled'
  | 'canary_wa_id_missing'
  | 'wa_not_allowed'
  | 'reply_text_missing';

export interface CanaryReport {
  ok: boolean;
  mode: 'canary_llm_outbound';
  lead_id?: string;
  turn_id?: string;
  memory_event_id?: string;
  crm_ok: boolean;
  llm_invoked: boolean;
  reply_text_present: boolean;
  outbound_attempted: boolean;
  external_dispatch: boolean;
  canary_allowed: boolean;
  canary_block_reason?: CanaryBlockReason;
  outbound_message_id?: string;
  errors?: string[];
}

type LlmCaller = (msg: string, env: Record<string, unknown>) => Promise<LlmClientResult>;
type OutboundSender = (intent: Parameters<typeof sendMetaOutbound>[0], env: MetaWorkerEnv) => Promise<OutboundResult>;

function isFlagOn(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

function readStr(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function emitCanary(
  ctx: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
  action: string,
  outcome: 'completed' | 'blocked' | 'observed' | 'failed',
  details: Record<string, unknown>,
): void {
  emitTelemetry({
    layer: 'core',
    category: outcome === 'blocked' || outcome === 'failed' ? 'external_boundary_blocked' : 'channel_signal',
    action: `meta.canary.${action}`,
    source: 'src/meta/canary-pipeline.ts',
    severity: outcome === 'failed' ? 'warn' : 'info',
    outcome,
    trace_id: ctx.trace_id,
    correlation_id: ctx.correlation_id,
    request_id: ctx.request_id,
    details,
  });
}

export async function runCanaryPipeline(
  event: NormalizedMetaEvent,
  env: MetaWorkerEnv & Record<string, unknown>,
  telemetryContext?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
  _options?: {
    _testLlmCaller?: LlmCaller;
    _testOutboundSender?: OutboundSender;
  },
): Promise<CanaryReport> {
  const ctx = {
    trace_id: telemetryContext?.trace_id ?? 'canary-trace-local',
    correlation_id: telemetryContext?.correlation_id ?? 'canary-trace-local',
    request_id: telemetryContext?.request_id ?? 'canary-request-local',
  };

  const errors: string[] = [];
  const llmCaller = _options?._testLlmCaller ?? callLlm;
  const outboundSender = _options?._testOutboundSender ?? sendMetaOutbound;

  emitCanary(ctx, 'started', 'observed', { kind: event.kind, wa_id: event.wa_id ?? null });

  // Passo 1 — CRM + memória (pipeline existente)
  const crmResult = await runInboundPipeline(event, env, ctx);
  if (!crmResult.ok) {
    errors.push(...(crmResult.errors ?? ['crm_pipeline_failed']));
  }

  emitCanary(ctx, 'crm_done', 'completed', {
    crm_ok: crmResult.ok,
    lead_id: crmResult.lead_id ?? null,
    turn_id: crmResult.turn_id ?? null,
  });

  // Log 6 — pipeline.result
  diagLog('meta.prod.pipeline.result', {
    crm_ok: crmResult.ok,
    lead_id_present: !!crmResult.lead_id,
    turn_id_present: !!crmResult.turn_id,
    memory_event_id_present: !!crmResult.memory_event_id,
    errors_count: (crmResult.errors ?? []).length,
  });

  // Passo 2 — LLM (soberania da IA)
  const rollbackActive = isFlagOn(env.ROLLBACK_FLAG);
  const maintenanceActive = isFlagOn(env.MAINTENANCE_MODE);
  const llmEnabled = isFlagOn(env.LLM_REAL_ENABLED);

  let llmInvoked = false;
  let replyText: string | undefined;

  // Log 7 — llm.gate (computed antes de qualquer branch)
  const llmGateBlockReason = rollbackActive ? 'rollback_active'
    : maintenanceActive ? 'maintenance_active'
    : !llmEnabled ? 'llm_disabled'
    : !event.text_body?.trim() ? 'llm_no_text'
    : null;
  diagLog('meta.prod.llm.gate', {
    allowed: llmGateBlockReason === null,
    block_reason: llmGateBlockReason,
    llm_invoked: llmGateBlockReason === null,
  });

  if (rollbackActive) {
    emitCanary(ctx, 'llm.blocked', 'blocked', { reason: 'rollback_active' });
  } else if (maintenanceActive) {
    emitCanary(ctx, 'llm.blocked', 'blocked', { reason: 'maintenance_active' });
  } else if (!llmEnabled) {
    emitCanary(ctx, 'llm.blocked', 'blocked', { reason: 'llm_disabled' });
  } else {
    const userText = event.text_body?.trim();
    if (!userText) {
      emitCanary(ctx, 'llm.blocked', 'blocked', { reason: 'llm_no_text' });
    } else {
      try {
        const llmResult = await llmCaller(userText, env as Record<string, unknown>);
        llmInvoked = llmResult.llm_invoked;
        if (llmResult.ok && llmResult.reply_text) {
          replyText = llmResult.reply_text;
          // Log 8 — llm.result (success)
          diagLog('meta.prod.llm.result', {
            success: true,
            reply_text_present: true,
            reply_text_length: replyText.length,
            latency_ms: llmResult.latency_ms ?? null,
            error_type: null,
          });
          emitCanary(ctx, 'llm.completed', 'completed', {
            llm_invoked: true,
            reply_text_length: replyText.length,
          });
        } else {
          // Log 8 — llm.result (failure)
          diagLog('meta.prod.llm.result', {
            success: false,
            reply_text_present: false,
            reply_text_length: 0,
            latency_ms: llmResult.latency_ms ?? null,
            error_type: llmResult.error ?? 'unknown',
          });
          errors.push(`llm_error: ${llmResult.error ?? 'unknown'}`);
          emitCanary(ctx, 'llm.failed', 'failed', { error: llmResult.error });
        }
      } catch (e) {
        // Log 8 — llm.result (exception)
        diagLog('meta.prod.llm.result', {
          success: false,
          reply_text_present: false,
          reply_text_length: 0,
          latency_ms: null,
          error_type: 'llm_exception',
        });
        errors.push(`llm_exception: ${String(e)}`);
        emitCanary(ctx, 'llm.exception', 'failed', { error: String(e) });
      }
    }
  }

  // Passo 3 — Outbound canary controlado
  const canaryEnabled = isFlagOn(env.OUTBOUND_CANARY_ENABLED);
  const canaryWaId = readStr(env.OUTBOUND_CANARY_WA_ID);
  const inboundWaId = event.wa_id ?? '';

  let outboundAttempted = false;
  let externalDispatch = false;
  let canaryAllowed = false;
  let canaryBlockReason: CanaryBlockReason | undefined;
  let outboundMessageId: string | undefined;

  // Validação em cascata dos gates canary
  if (rollbackActive) {
    canaryBlockReason = 'rollback_active';
  } else if (maintenanceActive) {
    canaryBlockReason = 'maintenance_active';
  } else if (!canaryEnabled) {
    canaryBlockReason = 'canary_disabled';
  } else if (!canaryWaId) {
    canaryBlockReason = 'canary_wa_id_missing';
  } else if (inboundWaId !== canaryWaId) {
    canaryBlockReason = 'wa_not_allowed';
  } else if (!replyText) {
    canaryBlockReason = 'reply_text_missing';
  } else {
    canaryAllowed = true;
  }

  // Log 9 — outbound.gate
  diagLog('meta.prod.outbound.gate', {
    allowed: canaryAllowed,
    block_reason: canaryBlockReason ?? null,
    wa_id_masked: maskId(inboundWaId || null),
    canary_allowed: canaryAllowed,
    client_real_allowed: false,
    wa_matches_canary: canaryWaId.length > 0 && inboundWaId === canaryWaId,
    outbound_attempted: canaryAllowed,
  });

  if (canaryBlockReason) {
    emitCanary(ctx, 'outbound.blocked', 'blocked', {
      reason: canaryBlockReason,
      wa_id: inboundWaId || null,
    });
  } else if (canaryAllowed) {
    outboundAttempted = true;
    try {
      const intent = {
        wa_id: inboundWaId,
        phone_number_id: event.phone_number_id ?? '',
        reply_text: replyText!,
      };
      const outboundResult = await outboundSender(intent, env);
      externalDispatch = outboundResult.external_dispatch;
      if (outboundResult.outbound_message_id) {
        outboundMessageId = outboundResult.outbound_message_id;
      }
      // Log 10 — outbound.result
      diagLog('meta.prod.outbound.result', {
        attempted: true,
        external_dispatch: externalDispatch,
        meta_status: outboundResult.http_status ?? null,
        message_id_present: !!outboundResult.outbound_message_id,
        error_type: externalDispatch ? null : (outboundResult.blocked_reason ?? 'unknown'),
        error_body_sanitized: outboundResult.error_body_sanitized ?? null,
      });
      if (!outboundResult.external_dispatch && outboundResult.blocked_reason) {
        errors.push(`outbound_blocked: ${outboundResult.blocked_reason}`);
        emitCanary(ctx, 'outbound.failed', 'failed', { reason: outboundResult.blocked_reason });
      } else {
        emitCanary(ctx, 'outbound.sent', 'completed', {
          wa_id: inboundWaId,
          external_dispatch: externalDispatch,
          outbound_message_id: outboundMessageId ?? null,
        });
      }
    } catch (e) {
      // Log 10 — outbound.result (exception)
      diagLog('meta.prod.outbound.result', {
        attempted: true,
        external_dispatch: false,
        meta_status: null,
        message_id_present: false,
        error_type: 'outbound_exception',
        error_body_sanitized: null,
      });
      errors.push(`outbound_exception: ${String(e)}`);
      emitCanary(ctx, 'outbound.exception', 'failed', { error: String(e) });
    }
  }

  const ok = errors.length === 0 && crmResult.ok;
  emitCanary(ctx, 'completed', 'completed', {
    ok,
    crm_ok: crmResult.ok,
    llm_invoked: llmInvoked,
    reply_text_present: replyText !== undefined,
    outbound_attempted: outboundAttempted,
    external_dispatch: externalDispatch,
    canary_allowed: canaryAllowed,
  });

  return {
    ok,
    mode: 'canary_llm_outbound',
    ...(crmResult.lead_id ? { lead_id: crmResult.lead_id } : {}),
    ...(crmResult.turn_id ? { turn_id: crmResult.turn_id } : {}),
    ...(crmResult.memory_event_id ? { memory_event_id: crmResult.memory_event_id } : {}),
    crm_ok: crmResult.ok,
    llm_invoked: llmInvoked,
    reply_text_present: replyText !== undefined,
    outbound_attempted: outboundAttempted,
    external_dispatch: externalDispatch,
    canary_allowed: canaryAllowed,
    ...(canaryBlockReason ? { canary_block_reason: canaryBlockReason } : {}),
    ...(outboundMessageId ? { outbound_message_id: outboundMessageId } : {}),
    ...(errors.length > 0 ? { errors } : {}),
  };
}
