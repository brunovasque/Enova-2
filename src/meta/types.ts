export const META_INGEST_ROUTE = '/__meta__/ingest' as const;
export const META_ENVELOPE_VERSION = 'front6.v1' as const;
export const META_CHANNEL = 'meta_whatsapp' as const;
export const META_DIRECTION_INBOUND = 'inbound' as const;

export const META_INBOUND_EVENT_TYPES = [
  'inbound.message.text',
  'inbound.message.audio_stub',
  'inbound.message.media_stub',
  'inbound.delivery.status',
  'inbound.system.ping',
] as const;

export type MetaInboundEventType = (typeof META_INBOUND_EVENT_TYPES)[number];

export interface MetaInboundEnvelope {
  envelope_version: typeof META_ENVELOPE_VERSION;
  direction: typeof META_DIRECTION_INBOUND;
  channel: typeof META_CHANNEL;
  event_type: MetaInboundEventType;
  event_id: string;
  occurred_at: string;
  received_at: string;
  trace_id: string;
  idempotency_key: string;
  lead_ref: string;
  payload: Record<string, unknown>;
}

export interface MetaValidationError {
  error_code: string;
  error_message: string;
  field?: string;
}
