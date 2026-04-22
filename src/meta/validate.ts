import {
  META_CHANNEL,
  META_DIRECTION_INBOUND,
  META_ENVELOPE_VERSION,
  META_INBOUND_EVENT_TYPES,
  type MetaInboundEnvelope,
  type MetaValidationError,
} from './types.ts';

const REQUIRED_STRING_FIELDS = [
  'event_id',
  'occurred_at',
  'received_at',
  'trace_id',
  'idempotency_key',
  'lead_ref',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function validationError(error_code: string, error_message: string, field?: string): MetaValidationError {
  return { error_code, error_message, field };
}

export function validateMetaInboundEnvelope(payload: unknown): {
  ok: true;
  envelope: MetaInboundEnvelope;
} | {
  ok: false;
  error: MetaValidationError;
} {
  if (!isRecord(payload)) {
    return {
      ok: false,
      error: validationError('invalid_envelope_shape', 'Body JSON deve ser um objeto.', 'body'),
    };
  }

  if (payload.envelope_version !== META_ENVELOPE_VERSION) {
    return {
      ok: false,
      error: validationError('invalid_envelope_version', 'Campo envelope_version deve ser front6.v1.', 'envelope_version'),
    };
  }

  if (payload.direction !== META_DIRECTION_INBOUND) {
    return {
      ok: false,
      error: validationError('invalid_direction', 'Campo direction deve ser inbound nesta rota tecnica.', 'direction'),
    };
  }

  if (payload.channel !== META_CHANNEL) {
    return {
      ok: false,
      error: validationError('invalid_channel', 'Campo channel deve ser meta_whatsapp.', 'channel'),
    };
  }

  if (!isNonEmptyString(payload.event_type) || !META_INBOUND_EVENT_TYPES.includes(payload.event_type as MetaInboundEnvelope['event_type'])) {
    return {
      ok: false,
      error: validationError('unsupported_event_type', 'Campo event_type deve ser um evento inbound aceito pelo contrato da PR2.', 'event_type'),
    };
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!isNonEmptyString(payload[field])) {
      return {
        ok: false,
        error: validationError('missing_required_field', `Campo ${field} deve ser string nao vazia.`, field),
      };
    }
  }

  if (!isIsoDateString(payload.occurred_at as string)) {
    return {
      ok: false,
      error: validationError('invalid_timestamp', 'Campo occurred_at deve ser timestamp ISO 8601 valido.', 'occurred_at'),
    };
  }

  if (!isIsoDateString(payload.received_at as string)) {
    return {
      ok: false,
      error: validationError('invalid_timestamp', 'Campo received_at deve ser timestamp ISO 8601 valido.', 'received_at'),
    };
  }

  if (!isRecord(payload.payload)) {
    return {
      ok: false,
      error: validationError('invalid_payload', 'Campo payload deve ser objeto JSON.', 'payload'),
    };
  }

  return {
    ok: true,
    envelope: payload as unknown as MetaInboundEnvelope,
  };
}
