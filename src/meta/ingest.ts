import { validateMetaInboundEnvelope } from './validate.ts';
import { META_INGEST_ROUTE, type MetaInboundEnvelope, type MetaValidationError } from './types.ts';
import { emitRuntimeGuard, emitTelemetry, emitValidationFailure } from '../telemetry/emit.ts';
import { applyE1ChannelHook } from '../e1/memory.ts';
import type { TelemetryRequestContext } from '../telemetry/types.ts';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function technicalError(status: number, error: MetaValidationError, extra: Record<string, unknown> = {}): Response {
  return jsonResponse(
    {
      accepted: false,
      route: META_INGEST_ROUTE,
      mode: 'technical_only',
      ...error,
      ...extra,
    },
    status,
  );
}

function acceptedResponse(envelope: MetaInboundEnvelope): Response {
  return jsonResponse(
    {
      accepted: true,
      ack_status: 'accepted',
      route: META_INGEST_ROUTE,
      event_type: envelope.event_type,
      trace_id: envelope.trace_id,
      idempotency_key: envelope.idempotency_key,
      event_id: envelope.event_id,
      lead_ref: envelope.lead_ref,
      mode: 'technical_only',
      next_step_hint: 'pr4_integrated_smoke_and_closeout',
      external_dispatch: false,
      real_meta_integration: false,
    },
    202,
  );
}

export async function handleMetaIngest(
  request: Request,
  telemetryContext?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
): Promise<Response> {
  const context = telemetryContext ?? {
    trace_id: 'meta-ingest-trace-local',
    correlation_id: 'meta-ingest-trace-local',
    request_id: 'meta-ingest-request-local',
  };

  if (request.method !== 'POST') {
    emitRuntimeGuard(context, 'src/meta/ingest.ts', 'channel', 'meta_method_not_allowed', {
      route: META_INGEST_ROUTE,
      method: request.method,
      allowed_method: 'POST',
    });

    return technicalError(
      405,
      {
        error_code: 'method_not_allowed',
        error_message: 'Rota tecnica aceita apenas POST.',
      },
      { allowed_method: 'POST' },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    emitValidationFailure(context, 'src/meta/ingest.ts', 'channel', 'meta_invalid_json', {
      route: META_INGEST_ROUTE,
      method: request.method,
    });

    return technicalError(400, {
      error_code: 'invalid_json',
      error_message: 'Body deve ser JSON valido.',
    });
  }

  const validation = validateMetaInboundEnvelope(payload);

  if (!validation.ok) {
    emitValidationFailure(context, 'src/meta/ingest.ts', 'channel', `meta_${validation.error.error_code}`, {
      route: META_INGEST_ROUTE,
      field: validation.error.field ?? null,
    });

    return technicalError(400, validation.error);
  }
  try {
    applyE1ChannelHook({
      trace_id: validation.envelope.trace_id,
      correlation_id: validation.envelope.idempotency_key,
      request_id: context.request_id,
      lead_ref: validation.envelope.lead_ref,
      event_id: validation.envelope.event_id,
      event_type: validation.envelope.event_type,
    });
  } catch (hookError) {
    emitTelemetry({
      layer: 'governance',
      category: 'contract_symptom',
      action: 'raised',
      source: 'src/meta/ingest.ts',
      severity: 'warn',
      outcome: 'observed',
      trace_id: validation.envelope.trace_id,
      correlation_id: validation.envelope.idempotency_key,
      request_id: context.request_id,
      lead_ref: validation.envelope.lead_ref,
      symptom_code: 'e1_channel_hook_non_blocking_failure',
      details: {
        route: META_INGEST_ROUTE,
        detail: hookError instanceof Error ? hookError.message : 'unknown_error',
      },
    });
  }

  emitTelemetry({
    layer: 'channel',
    category: 'channel_signal',
    action: 'accepted',
    source: 'src/meta/ingest.ts',
    severity: 'info',
    outcome: 'accepted',
    trace_id: validation.envelope.trace_id,
    correlation_id: validation.envelope.idempotency_key,
    request_id: context.request_id,
    lead_ref: validation.envelope.lead_ref,
    details: {
      route: META_INGEST_ROUTE,
      event_type: validation.envelope.event_type,
      event_id: validation.envelope.event_id,
    },
  });

  emitTelemetry({
    layer: 'channel',
    category: 'external_boundary_blocked',
    action: 'enforced',
    source: 'src/meta/ingest.ts',
    severity: 'warn',
    outcome: 'blocked',
    trace_id: validation.envelope.trace_id,
    correlation_id: validation.envelope.idempotency_key,
    request_id: context.request_id,
    boundary_ref: 'meta_real',
    details: {
      route: META_INGEST_ROUTE,
      real_meta_integration: false,
      external_dispatch: false,
    },
  });

  return acceptedResponse(validation.envelope);
}
