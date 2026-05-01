/**
 * ENOVA 2 — PR-T8.11 — Outbound Meta/WhatsApp controlado por flags.
 *
 * REGRAS INVIOLÁVEIS:
 *   - O adapter NUNCA cria reply_text. Recebe de fora (camada superior).
 *   - O adapter NUNCA decide stage, fact_*, fase do funil.
 *   - O adapter copia o reply_text literalmente, sem modificar.
 *   - Sem flags ON, o outbound é sempre bloqueado.
 *   - Sem token/phone_number_id, o outbound é bloqueado.
 *   - Esta função NÃO é chamada automaticamente pelo inbound nesta PR.
 *
 * FLAGS:
 *   - CHANNEL_ENABLED=true E META_OUTBOUND_ENABLED=true → outbound permitido.
 *   - Qualquer outra combinação → external_dispatch: false.
 *
 * PR-T8.12 fará prova controlada deste outbound em ambiente seguro.
 */

import type { MetaWorkerEnv } from './webhook-env.ts';

export interface OutboundIntent {
  wa_id: string;
  phone_number_id: string;
  reply_text: string;
}

export type OutboundBlockedReason =
  | 'flag_off_channel'
  | 'flag_off_outbound'
  | 'access_token_missing'
  | 'phone_number_id_missing'
  | 'wa_id_missing'
  | 'reply_text_missing'
  | 'graph_api_error'
  | 'network_error';

export interface OutboundResult {
  external_dispatch: boolean;
  blocked_reason?: OutboundBlockedReason;
  http_status?: number;
  outbound_message_id?: string;
}

const DEFAULT_GRAPH_VERSION = 'v20.0';

function isFlagOn(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

export function evaluateOutboundReadiness(env: MetaWorkerEnv, intent: OutboundIntent): OutboundResult | null {
  if (!isFlagOn(env.CHANNEL_ENABLED)) {
    return { external_dispatch: false, blocked_reason: 'flag_off_channel' };
  }
  if (!isFlagOn(env.META_OUTBOUND_ENABLED)) {
    return { external_dispatch: false, blocked_reason: 'flag_off_outbound' };
  }
  if (typeof env.META_ACCESS_TOKEN !== 'string' || env.META_ACCESS_TOKEN.length === 0) {
    return { external_dispatch: false, blocked_reason: 'access_token_missing' };
  }
  if (!intent.phone_number_id) {
    return { external_dispatch: false, blocked_reason: 'phone_number_id_missing' };
  }
  if (!intent.wa_id) {
    return { external_dispatch: false, blocked_reason: 'wa_id_missing' };
  }
  if (typeof intent.reply_text !== 'string' || intent.reply_text.length === 0) {
    return { external_dispatch: false, blocked_reason: 'reply_text_missing' };
  }
  return null;
}

export function buildMetaOutboundPayload(intent: OutboundIntent): {
  url: (graphVersion: string) => string;
  body: string;
} {
  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: intent.wa_id,
    type: 'text',
    text: { body: intent.reply_text },
  });
  return {
    url: (graphVersion: string) =>
      `https://graph.facebook.com/${graphVersion}/${intent.phone_number_id}/messages`,
    body,
  };
}

export async function sendMetaOutbound(intent: OutboundIntent, env: MetaWorkerEnv): Promise<OutboundResult> {
  const blocked = evaluateOutboundReadiness(env, intent);
  if (blocked !== null) return blocked;

  const graphVersion =
    typeof env.META_GRAPH_VERSION === 'string' && env.META_GRAPH_VERSION.length > 0
      ? env.META_GRAPH_VERSION
      : DEFAULT_GRAPH_VERSION;

  const { url, body } = buildMetaOutboundPayload(intent);

  try {
    const response = await fetch(url(graphVersion), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        'content-type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      return {
        external_dispatch: false,
        blocked_reason: 'graph_api_error',
        http_status: response.status,
      };
    }

    let outboundId: string | undefined;
    try {
      const json = (await response.json()) as { messages?: Array<{ id?: string }> };
      outboundId = json.messages?.[0]?.id;
    } catch {
      outboundId = undefined;
    }

    return {
      external_dispatch: true,
      http_status: response.status,
      outbound_message_id: outboundId,
    };
  } catch {
    return {
      external_dispatch: false,
      blocked_reason: 'network_error',
    };
  }
}
