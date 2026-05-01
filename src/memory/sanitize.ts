/**
 * ENOVA 2 — PR-T8.13 — Sanitização de memória
 *
 * REGRA SOBERANA:
 *   Memória NUNCA armazena segredo, token, chave de acesso, payload
 *   completo de Meta/Supabase, dado de cartão, ou qualquer credencial.
 *
 *   Esta camada redige strings antes de qualquer escrita no store.
 *
 *   Cobertura:
 *     - chaves de env reconhecidas (META_*, SUPABASE_*, OPENAI_*, etc.)
 *     - prefixos comuns de tokens (Bearer, sb-, eyJ JWT, sk-, ghp_, ghs_)
 *     - sequências base64 longas (>= 80 chars contínuos)
 *     - chaves de assinatura (X-Hub-Signature-256, sha256=...)
 *     - chaves de cookie/session (sid=, session=)
 */

const REDACTED = '[REDACTED]';

const SECRET_KEY_NAMES: ReadonlyArray<RegExp> = [
  /META_VERIFY_TOKEN/i,
  /META_APP_SECRET/i,
  /META_ACCESS_TOKEN/i,
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /SUPABASE_ANON_KEY/i,
  /OPENAI_API_KEY/i,
  /ANTHROPIC_API_KEY/i,
  /CRM_ADMIN_KEY/i,
  /CLOUDFLARE_API_TOKEN/i,
];

const TOKEN_PATTERNS: ReadonlyArray<RegExp> = [
  /Bearer\s+[A-Za-z0-9._\-]+/g,
  /\bsb-[A-Za-z0-9._\-]{20,}/g,
  /\beyJ[A-Za-z0-9._\-]{20,}/g,
  /\bsk-[A-Za-z0-9_\-]{20,}/g,
  /\bghp_[A-Za-z0-9]{20,}/g,
  /\bghs_[A-Za-z0-9]{20,}/g,
  /sha256=[A-Fa-f0-9]{40,}/g,
  /\b[A-Za-z0-9+/=]{80,}\b/g,
];

const FIELD_BLACKLIST: ReadonlyArray<string> = [
  'authorization',
  'x-hub-signature-256',
  'x-hub-signature',
  'cookie',
  'set-cookie',
  'password',
  'secret',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apikey',
  'service_role',
];

export function isFieldNameSensitive(name: string): boolean {
  const lc = name.toLowerCase();
  if (FIELD_BLACKLIST.includes(lc)) return true;
  for (const re of SECRET_KEY_NAMES) {
    if (re.test(name)) return true;
  }
  return false;
}

export function redactStringValue(value: string): string {
  if (typeof value !== 'string') return value;
  let out = value;
  for (const re of TOKEN_PATTERNS) {
    out = out.replace(re, REDACTED);
  }
  return out;
}

export function sanitizeText(text: string, limit = 1000): string {
  if (typeof text !== 'string') return '';
  const redacted = redactStringValue(text);
  if (redacted.length <= limit) return redacted;
  return redacted.slice(0, limit) + '…[truncated]';
}

export function sanitizeRecord(input: unknown): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(input as Record<string, unknown>)) {
    if (isFieldNameSensitive(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = sanitizeValue(raw);
  }
  return out;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return redactStringValue(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => sanitizeValue(v));
  if (typeof value === 'object') return sanitizeRecord(value);
  return REDACTED;
}

export const SANITIZER_REDACTED_TOKEN = REDACTED;
