/**
 * ENOVA 2 — PR-T8.11 — Handler do webhook Meta real (GET challenge + POST inbound).
 *
 * REGRAS INVIOLÁVEIS:
 *   - GET challenge: técnico apenas, nunca cria turno, nunca chama LLM.
 *   - POST inbound: validação de assinatura ANTES de qualquer parse.
 *   - Adapter NUNCA gera reply_text.
 *   - Adapter NUNCA decide stage / fact_* / fase do funil.
 *   - Adapter NUNCA chama LLM.
 *   - Adapter NUNCA envia outbound automaticamente nesta PR.
 *   - Segredos NUNCA aparecem em log/erro/response.
 *
 * Flags relevantes:
 *   - META_VERIFY_TOKEN (challenge)
 *   - META_APP_SECRET (assinatura HMAC)
 *   - CHANNEL_ENABLED + META_OUTBOUND_ENABLED (outbound futuro)
 */

import { emitTelemetry } from '../telemetry/emit.ts';
import type { TelemetryRequestContext } from '../telemetry/types.ts';
import { computeDedupeKey, parseMetaWebhookPayload, type NormalizedMetaEvent } from './parser.ts';
import { verifyMetaSignature } from './signature.ts';
import { getSharedDedupeStore, type DedupeStore } from './dedupe.ts';
import { readEnvString, type MetaWorkerEnv } from './webhook-env.ts';
import { runCanaryPipeline, type CanaryReport } from './canary-pipeline.ts';
import { readCanonicalFlags } from '../golive/flags.ts';
import { diagLog, maskId } from './prod-diag.ts';

export const META_WEBHOOK_ROUTE = '/__meta__/webhook' as const;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const TEXT_HEADERS = {
  'content-type': 'text/plain; charset=utf-8',
};

interface InboundEventReport {
  kind: NormalizedMetaEvent['kind'];
  message_type: string | null;
  status_value: string | null;
  duplicate: boolean;
  dedupe_key: string;
  has_text: boolean;
  has_media: boolean;
  has_wa_message_id: boolean;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: TEXT_HEADERS });
}

function safeContext(
  context: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'> | undefined,
) {
  return {
    trace_id: context?.trace_id ?? 'meta-webhook-trace-local',
    correlation_id: context?.correlation_id ?? 'meta-webhook-trace-local',
    request_id: context?.request_id ?? 'meta-webhook-request-local',
  };
}

function emitWebhookEvent(
  context: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
  action: string,
  outcome: 'accepted' | 'rejected' | 'blocked' | 'completed' | 'failed' | 'observed',
  severity: 'info' | 'warn' | 'error',
  details: Record<string, unknown>,
) {
  emitTelemetry({
    layer: 'channel',
    category: outcome === 'rejected' || outcome === 'blocked' ? 'external_boundary_blocked' : 'channel_signal',
    action,
    source: 'src/meta/webhook.ts',
    severity,
    outcome,
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    details,
  });
}

// ---------------------------------------------------------------------------
// GET — Webhook verification challenge
// ---------------------------------------------------------------------------

export function handleMetaWebhookChallenge(
  url: URL,
  env: MetaWorkerEnv,
  telemetryContext?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
): Response {
  const ctx = safeContext(telemetryContext);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = readEnvString(env, 'META_VERIFY_TOKEN');

  if (typeof expected !== 'string' || expected.length === 0) {
    emitWebhookEvent(ctx, 'meta.webhook.challenge.fail', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: 'verify_token_not_configured',
    });
    return jsonResponse({ error: 'forbidden', reason: 'verify_token_not_configured' }, 403);
  }

  if (mode !== 'subscribe') {
    emitWebhookEvent(ctx, 'meta.webhook.challenge.fail', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: 'mode_invalid',
    });
    return jsonResponse({ error: 'forbidden', reason: 'mode_invalid' }, 403);
  }

  if (typeof token !== 'string' || token !== expected) {
    emitWebhookEvent(ctx, 'meta.webhook.challenge.fail', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: 'token_mismatch',
    });
    return jsonResponse({ error: 'forbidden', reason: 'token_mismatch' }, 403);
  }

  if (typeof challenge !== 'string' || challenge.length === 0) {
    emitWebhookEvent(ctx, 'meta.webhook.challenge.fail', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: 'challenge_missing',
    });
    return jsonResponse({ error: 'bad_request', reason: 'challenge_missing' }, 400);
  }

  emitWebhookEvent(ctx, 'meta.webhook.challenge.ok', 'accepted', 'info', {
    route: META_WEBHOOK_ROUTE,
  });
  return textResponse(challenge, 200);
}

// ---------------------------------------------------------------------------
// POST — Webhook inbound real
// ---------------------------------------------------------------------------

export interface MetaWebhookPostResult {
  status: number;
  body: Record<string, unknown>;
}

export async function processMetaWebhookPost(input: {
  rawBody: string;
  signatureHeader: string | null;
  env: MetaWorkerEnv;
  telemetryContext?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>;
  dedupeStore?: DedupeStore;
}): Promise<MetaWebhookPostResult> {
  const t0 = Date.now();
  const ctx = safeContext(input.telemetryContext);
  const appSecret = readEnvString(input.env, 'META_APP_SECRET');

  // Log 1 — received
  diagLog('meta.prod.webhook.received', {
    method: 'POST',
    pathname: META_WEBHOOK_ROUTE,
    has_signature: input.signatureHeader !== null,
    body_size: input.rawBody.length,
    prod_marker: true,
  });

  const sig = await verifyMetaSignature(input.rawBody, input.signatureHeader, appSecret ?? null);

  // Log 2 — signature
  diagLog('meta.prod.webhook.signature', {
    ok: sig.ok,
    reason: sig.ok ? null : sig.reason,
  });

  if (!sig.ok) {
    emitWebhookEvent(ctx, 'meta.webhook.signature.fail', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: sig.reason,
    });
    const status = sig.reason === 'signature_missing' ? 401 : 403;
    return {
      status,
      body: {
        accepted: false,
        route: META_WEBHOOK_ROUTE,
        error: 'signature_invalid',
        reason: sig.reason,
      },
    };
  }

  emitWebhookEvent(ctx, 'meta.webhook.signature.ok', 'accepted', 'info', {
    route: META_WEBHOOK_ROUTE,
  });

  let payload: unknown;
  try {
    payload = JSON.parse(input.rawBody);
  } catch {
    emitWebhookEvent(ctx, 'meta.webhook.inbound.invalid', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: 'invalid_json',
    });
    return {
      status: 400,
      body: { accepted: false, route: META_WEBHOOK_ROUTE, error: 'invalid_json' },
    };
  }

  const parsed = parseMetaWebhookPayload(payload);
  const firstEv = parsed.ok && parsed.events.length > 0 ? parsed.events[0] : null;

  // Log 3 — parsed
  diagLog('meta.prod.webhook.parsed', {
    accepted: parsed.ok,
    reason: parsed.ok ? null : (parsed.reason ?? 'unknown'),
    events_count: parsed.ok ? parsed.events.length : 0,
    event_kind: firstEv?.kind ?? null,
    wa_id_masked: firstEv ? maskId(firstEv.wa_id) : null,
    phone_number_id_masked: firstEv ? maskId(firstEv.phone_number_id) : null,
    message_id_masked: firstEv ? maskId(firstEv.wa_message_id) : null,
    message_type: firstEv?.message_type ?? null,
    text_present: firstEv ? firstEv.text_body !== null : false,
  });

  if (!parsed.ok) {
    emitWebhookEvent(ctx, 'meta.webhook.inbound.invalid', 'rejected', 'warn', {
      route: META_WEBHOOK_ROUTE,
      reason: parsed.reason ?? 'unknown',
    });
    return {
      status: 400,
      body: { accepted: false, route: META_WEBHOOK_ROUTE, error: 'invalid_payload', reason: parsed.reason },
    };
  }

  const dedupeStore = input.dedupeStore ?? getSharedDedupeStore();
  const reports: InboundEventReport[] = [];
  const enova2Enabled = input.env.ENOVA2_ENABLED === 'true' || input.env.ENOVA2_ENABLED === true;
  const canaryResults: CanaryReport[] = [];

  // Log 5 — flags.snapshot (uma vez por request, antes do loop de eventos)
  const flags = readCanonicalFlags(input.env as unknown as Record<string, unknown>);
  diagLog('meta.prod.flags.snapshot', {
    ENOVA2_ENABLED: flags.enova2_enabled,
    CHANNEL_ENABLED: flags.channel_enabled,
    META_OUTBOUND_ENABLED: flags.meta_outbound_enabled,
    LLM_REAL_ENABLED: flags.llm_real_enabled,
    OUTBOUND_CANARY_ENABLED: flags.outbound_canary_enabled,
    CLIENT_REAL_ENABLED: flags.client_real_enabled,
    ROLLBACK_FLAG: flags.rollback_flag,
    MAINTENANCE_MODE: flags.maintenance_mode,
    OUTBOUND_CANARY_WA_ID_present: flags.outbound_canary_wa_id.length > 0,
    OUTBOUND_CANARY_WA_ID_masked: maskId(flags.outbound_canary_wa_id || null),
  });

  for (const event of parsed.events) {
    const dedupeKey = computeDedupeKey(event);
    const duplicate = dedupeStore.has(dedupeKey);

    // Log 4 — dedupe
    diagLog('meta.prod.dedupe', {
      duplicate,
      message_id_masked: maskId(event.wa_message_id),
    });

    if (duplicate) {
      emitWebhookEvent(ctx, 'meta.webhook.inbound.duplicate', 'observed', 'info', {
        route: META_WEBHOOK_ROUTE,
        kind: event.kind,
        message_type: event.message_type,
        status_value: event.status_value,
      });
    } else {
      dedupeStore.remember(dedupeKey);
      if (event.kind === 'message') {
        emitWebhookEvent(ctx, 'meta.webhook.inbound.accepted', 'accepted', 'info', {
          route: META_WEBHOOK_ROUTE,
          message_type: event.message_type,
          has_text: event.text_body !== null,
          has_media: event.media_id !== null,
        });
        if (event.media_id !== null) {
          emitWebhookEvent(ctx, 'meta.webhook.media.stub', 'observed', 'info', {
            route: META_WEBHOOK_ROUTE,
            media_mime: event.media_mime_type,
            message_type: event.message_type,
          });
        }

        // PR-T8.17 — canary pipeline: CRM + memória + LLM (gated) + outbound canary (gated)
        if (enova2Enabled) {
          const canaryResult = await runCanaryPipeline(
            event,
            input.env as MetaWorkerEnv & Record<string, unknown>,
            ctx,
          );
          canaryResults.push(canaryResult);
        }
      } else if (event.kind === 'status') {
        emitWebhookEvent(ctx, 'meta.webhook.status.received', 'observed', 'info', {
          route: META_WEBHOOK_ROUTE,
          status_value: event.status_value,
        });
      }
    }

    reports.push({
      kind: event.kind,
      message_type: event.message_type,
      status_value: event.status_value,
      duplicate,
      dedupe_key: dedupeKey,
      has_text: event.text_body !== null,
      has_media: event.media_id !== null,
      has_wa_message_id: event.wa_message_id !== null,
    });
  }

  const anyDispatch = canaryResults.some((r) => r.external_dispatch);
  const anyLlm = canaryResults.some((r) => r.llm_invoked);
  const anyOutbound = canaryResults.some((r) => r.outbound_attempted);
  const anyReplyText = canaryResults.some((r) => r.reply_text_present);
  const anyCanary = canaryResults.some((r) => r.canary_allowed);
  const modeValue = canaryResults.length > 0
    ? canaryResults[0].mode
    : (enova2Enabled ? 'crm_memory_only' : 'technical_only');

  if (!anyDispatch) {
    emitWebhookEvent(ctx, 'meta.outbound.blocked', 'blocked', 'info', {
      route: META_WEBHOOK_ROUTE,
      reason: anyOutbound ? 'outbound_attempted_but_failed' : 'no_outbound_this_request',
    });
  }

  // Log 11 — webhook.final
  diagLog('meta.prod.webhook.final', {
    http_status: 200,
    mode: modeValue,
    llm_invoked: anyLlm,
    reply_text_present: anyReplyText,
    outbound_attempted: anyOutbound,
    external_dispatch: anyDispatch,
    canary_block_reason: canaryResults.length > 0 ? (canaryResults[0].canary_block_reason ?? null) : 'no_pipeline_ran',
    client_block_reason: flags.client_real_enabled ? null : 'client_real_disabled',
    total_latency_ms: Date.now() - t0,
  });

  return {
    status: 200,
    body: {
      accepted: true,
      route: META_WEBHOOK_ROUTE,
      mode: modeValue,
      external_dispatch: anyDispatch,
      real_meta_integration: anyDispatch,
      llm_invoked: anyLlm,
      reply_text_present: anyReplyText,
      outbound_attempted: anyOutbound,
      canary_allowed: anyCanary,
      pipeline_enabled: enova2Enabled,
      events: reports,
      events_count: reports.length,
      duplicates_count: reports.filter((r) => r.duplicate).length,
      ...(canaryResults.length > 0 ? { pipeline: canaryResults } : {}),
    },
  };
}

export async function handleMetaWebhook(
  request: Request,
  url: URL,
  env: MetaWorkerEnv,
  telemetryContext?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
): Promise<Response> {
  const ctx = safeContext(telemetryContext);

  if (request.method === 'GET') {
    return handleMetaWebhookChallenge(url, env, ctx);
  }

  if (request.method === 'POST') {
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      emitWebhookEvent(ctx, 'meta.webhook.inbound.invalid', 'rejected', 'warn', {
        route: META_WEBHOOK_ROUTE,
        reason: 'body_read_failure',
      });
      return jsonResponse(
        { accepted: false, route: META_WEBHOOK_ROUTE, error: 'body_read_failure' },
        400,
      );
    }

    const signatureHeader = request.headers.get('x-hub-signature-256');
    const result = await processMetaWebhookPost({
      rawBody,
      signatureHeader,
      env,
      telemetryContext: ctx,
    });
    return jsonResponse(result.body, result.status);
  }

  emitWebhookEvent(ctx, 'meta.webhook.inbound.invalid', 'rejected', 'warn', {
    route: META_WEBHOOK_ROUTE,
    reason: 'method_not_allowed',
    method: request.method,
  });
  return jsonResponse(
    {
      accepted: false,
      route: META_WEBHOOK_ROUTE,
      error: 'method_not_allowed',
      allowed_methods: ['GET', 'POST'],
    },
    405,
  );
}
