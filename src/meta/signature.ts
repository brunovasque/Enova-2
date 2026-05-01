/**
 * ENOVA 2 — PR-T8.11 — Validação de assinatura Meta (X-Hub-Signature-256).
 *
 * Implementa HMAC-SHA256 sobre o payload bruto usando o `META_APP_SECRET`,
 * com comparação timing-safe. O segredo nunca é incluído em logs/erros.
 *
 * REGRA DE OURO:
 *   - Toda request POST inbound da Meta deve ter `X-Hub-Signature-256` válido.
 *   - Assinatura ausente → reason: 'signature_missing' (HTTP 401 no handler).
 *   - Assinatura inválida → reason: 'signature_invalid' (HTTP 403 no handler).
 *   - Esta camada nunca propaga o segredo em mensagens.
 */

export type SignatureFailReason =
  | 'signature_missing'
  | 'signature_format'
  | 'app_secret_missing'
  | 'signature_invalid';

export interface SignatureCheckResult {
  ok: boolean;
  reason?: SignatureFailReason;
}

const SIGNATURE_PREFIX = 'sha256=';

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const hi = parseInt(hex[i * 2], 16);
    const lo = parseInt(hex[i * 2 + 1], 16);
    if (Number.isNaN(hi) || Number.isNaN(lo)) return null;
    bytes[i] = (hi << 4) | lo;
  }
  return bytes;
}

function bytesToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function computeMetaSignatureHex(rawBody: string, appSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  return bytesToHex(sig);
}

export async function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string | undefined | null,
): Promise<SignatureCheckResult> {
  if (typeof signatureHeader !== 'string' || signatureHeader.length === 0) {
    return { ok: false, reason: 'signature_missing' };
  }
  if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) {
    return { ok: false, reason: 'signature_format' };
  }
  if (typeof appSecret !== 'string' || appSecret.length === 0) {
    return { ok: false, reason: 'app_secret_missing' };
  }

  const expectedHex = signatureHeader.slice(SIGNATURE_PREFIX.length).toLowerCase();
  if (hexToBytes(expectedHex) === null) {
    return { ok: false, reason: 'signature_format' };
  }

  const computedHex = await computeMetaSignatureHex(rawBody, appSecret);
  return timingSafeEqualHex(expectedHex, computedHex)
    ? { ok: true }
    : { ok: false, reason: 'signature_invalid' };
}
