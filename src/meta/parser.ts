/**
 * ENOVA 2 — PR-T8.11 — Parser de payload bruto Meta Cloud API.
 *
 * Normaliza o JSON bruto recebido no webhook Meta para um evento interno.
 * Não decide nada — apenas extrai campos técnicos.
 *
 * REGRAS:
 *   - Não gera reply_text.
 *   - Não decide stage.
 *   - Não cria fact_*.
 *   - Não interpreta aprovação/reprovação.
 *   - Apenas extrai identificadores e referências.
 *
 * Formato Meta esperado (resumido):
 *   {
 *     "object": "whatsapp_business_account",
 *     "entry": [{
 *       "id": "<waba_id>",
 *       "changes": [{
 *         "value": {
 *           "messaging_product": "whatsapp",
 *           "metadata": { "phone_number_id": "...", "display_phone_number": "..." },
 *           "messages": [{ "id": "wamid...", "from": "...", "timestamp": "...", "type": "text", "text": {"body": "..."} }],
 *           "statuses": [{ "id": "wamid...", "status": "delivered", "timestamp": "...", "recipient_id": "..." }]
 *         },
 *         "field": "messages"
 *       }]
 *     }]
 *   }
 */

export type NormalizedMetaEventKind = 'message' | 'status' | 'unknown';

export interface NormalizedMetaEvent {
  kind: NormalizedMetaEventKind;
  wa_message_id: string | null;
  wa_id: string | null;
  phone_number_id: string | null;
  timestamp: string | null;
  message_type: string | null;
  text_body: string | null;
  media_id: string | null;
  media_mime_type: string | null;
  media_filename: string | null;
  status_id: string | null;
  status_value: string | null;
  raw_ref: string;
}

export interface ParseMetaPayloadResult {
  ok: boolean;
  events: NormalizedMetaEvent[];
  reason?: 'invalid_shape' | 'unsupported_object' | 'no_entries';
}

const KNOWN_MEDIA_TYPES = ['image', 'document', 'audio', 'video', 'sticker'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNullableString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

export function parseMetaWebhookPayload(payload: unknown, rawRef = 'meta_payload'): ParseMetaPayloadResult {
  if (!isRecord(payload)) {
    return { ok: false, events: [], reason: 'invalid_shape' };
  }
  if (payload.object !== 'whatsapp_business_account') {
    return { ok: false, events: [], reason: 'unsupported_object' };
  }
  const entries = payload.entry;
  if (!Array.isArray(entries) || entries.length === 0) {
    return { ok: false, events: [], reason: 'no_entries' };
  }

  const events: NormalizedMetaEvent[] = [];

  for (const entry of entries) {
    if (!isRecord(entry)) continue;
    const changes = entry.changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      if (!isRecord(change)) continue;
      const value = change.value;
      if (!isRecord(value)) continue;
      const phoneNumberId = isRecord(value.metadata)
        ? asNullableString(value.metadata.phone_number_id)
        : null;

      if (Array.isArray(value.messages)) {
        for (const message of value.messages) {
          if (!isRecord(message)) continue;
          events.push(extractMessage(message, phoneNumberId, rawRef));
        }
      }

      if (Array.isArray(value.statuses)) {
        for (const status of value.statuses) {
          if (!isRecord(status)) continue;
          events.push(extractStatus(status, phoneNumberId, rawRef));
        }
      }
    }
  }

  return { ok: true, events };
}

function extractMessage(
  message: Record<string, unknown>,
  phoneNumberId: string | null,
  rawRef: string,
): NormalizedMetaEvent {
  const type = asNullableString(message.type);
  let textBody: string | null = null;
  let mediaId: string | null = null;
  let mediaMime: string | null = null;
  let mediaFilename: string | null = null;

  if (type === 'text' && isRecord(message.text)) {
    textBody = asNullableString(message.text.body);
  }
  if (type && (KNOWN_MEDIA_TYPES as readonly string[]).includes(type) && isRecord(message[type])) {
    const media = message[type] as Record<string, unknown>;
    mediaId = asNullableString(media.id);
    mediaMime = asNullableString(media.mime_type);
    if (type === 'document') {
      mediaFilename = asNullableString(media.filename);
    }
  }
  if (type === 'interactive' && isRecord(message.interactive)) {
    textBody = '[interactive_reply]';
  }

  return {
    kind: 'message',
    wa_message_id: asNullableString(message.id),
    wa_id: asNullableString(message.from),
    phone_number_id: phoneNumberId,
    timestamp: asNullableString(message.timestamp),
    message_type: type,
    text_body: textBody,
    media_id: mediaId,
    media_mime_type: mediaMime,
    media_filename: mediaFilename,
    status_id: null,
    status_value: null,
    raw_ref: rawRef,
  };
}

function extractStatus(
  status: Record<string, unknown>,
  phoneNumberId: string | null,
  rawRef: string,
): NormalizedMetaEvent {
  return {
    kind: 'status',
    wa_message_id: asNullableString(status.id),
    wa_id: asNullableString(status.recipient_id),
    phone_number_id: phoneNumberId,
    timestamp: asNullableString(status.timestamp),
    message_type: null,
    text_body: null,
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: asNullableString(status.id),
    status_value: asNullableString(status.status),
    raw_ref: rawRef,
  };
}

export function computeDedupeKey(event: NormalizedMetaEvent): string {
  if (event.wa_message_id) {
    return `${event.kind}:wamid:${event.wa_message_id}`;
  }
  const wa = event.wa_id ?? 'unknown';
  const ts = event.timestamp ?? '';
  const tag = event.message_type ?? event.status_value ?? 'unknown';
  return `${event.kind}:fallback:${wa}|${ts}|${tag}`;
}
