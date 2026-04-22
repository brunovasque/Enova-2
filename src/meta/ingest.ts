import { validateMetaInboundEnvelope } from './validate.ts';
import { META_INGEST_ROUTE, type MetaInboundEnvelope, type MetaValidationError } from './types.ts';

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

export async function handleMetaIngest(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
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
    return technicalError(400, {
      error_code: 'invalid_json',
      error_message: 'Body deve ser JSON valido.',
    });
  }

  const validation = validateMetaInboundEnvelope(payload);

  if (!validation.ok) {
    return technicalError(400, validation.error);
  }

  return acceptedResponse(validation.envelope);
}
