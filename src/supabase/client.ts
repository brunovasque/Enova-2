/**
 * ENOVA 2 — Supabase operacional controlado (PR-T8.8)
 *
 * Cliente HTTP minimalista para PostgREST do Supabase.
 *
 * MOTIVAÇÃO PARA NÃO USAR @supabase/supabase-js NESTA PR:
 *   - PR-T8.8 deve ser cirúrgica e sem dependências novas a menos que
 *     estritamente necessário.
 *   - O escopo desta PR é leitura controlada com mapeamento mínimo —
 *     fetch nativo do Worker é suficiente (compatibilidade Cloudflare
 *     Workers nativa, sem polyfill).
 *   - Adicionar `@supabase/supabase-js` (auth, realtime, storage SDK)
 *     aumentaria superfície de ataque para uma PR de leitura mínima.
 *   - Quando T8.9+ exigir Storage SDK, RLS auth real ou Realtime,
 *     o pacote pode ser adicionado em PR específica.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Service role só pode existir server-side (Worker).
 *   - Cliente nunca expõe `serviceRoleKey` em mensagem de erro.
 *   - Sem retry agressivo — falha rápido, sem amplificar carga.
 *   - Sem cache silencioso — toda chamada é explícita.
 */

import type { SupabaseConfig, SupabaseQueryResult } from './types.ts';

const PG_HEADERS_BASE = {
  'content-type': 'application/json',
  accept: 'application/json',
  prefer: 'return=representation',
} as const;

export interface SupabaseQueryOptions {
  /** Lista de colunas em SELECT. Default: '*'. */
  select?: string;
  /** Filtros PostgREST (ex: { lead_id: 'eq.abc-123' }). */
  filters?: Record<string, string>;
  /** ORDER BY (ex: 'created_at.desc'). */
  order?: string;
  /** Limite de linhas. Default: 100 — proteção contra `enova_log` (50k+). */
  limit?: number;
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

/**
 * Extrai metadados de um erro PostgreSQL retornado pelo PostgREST.
 *
 * T9.13H-DIAG: superficializa pg_code e pg_message (nome da coluna) em erros 23502.
 * `details` é INTENCIONALMENTE OMITIDO — contém valores reais da linha (dados do cliente).
 * Apenas code/message/hint são expostos — são metadados de schema, não dados de usuário.
 */
interface PgErrorMeta {
  code: string;
  message: string;
  hint: string | null;
  // details: OMITIDO — contém valores reais da linha
}

function parsePgError(bodyText: string): PgErrorMeta | null {
  try {
    const parsed = JSON.parse(bodyText);
    if (typeof parsed === 'object' && parsed !== null && 'code' in parsed) {
      return {
        code: String((parsed as Record<string, unknown>).code ?? ''),
        message: String((parsed as Record<string, unknown>).message ?? ''),
        hint: (parsed as Record<string, unknown>).hint != null
          ? String((parsed as Record<string, unknown>).hint)
          : null,
        // details: OMITIDO — contém valores reais da linha inserida
      };
    }
  } catch {
    // bodyText não é JSON válido — retorna null
  }
  return null;
}

/**
 * Sanitiza mensagem de erro para nunca incluir o service role.
 * Remove qualquer ocorrência (defensivo) e tronca tokens longos.
 */
function safeErrorMessage(raw: string, secret: string): string {
  if (!raw) return 'unknown_supabase_error';
  let cleaned = raw;
  if (secret) {
    cleaned = cleaned.split(secret).join('***');
  }
  // Defensivo: remove headers Authorization caso vazem
  cleaned = cleaned.replace(/(?:bearer|apikey)\s+[a-z0-9._-]{20,}/gi, '$&'.replace(/[a-z0-9._-]{20,}/gi, '***'));
  if (cleaned.length > 500) cleaned = `${cleaned.slice(0, 500)}…`;
  return cleaned;
}

function buildHeaders(cfg: SupabaseConfig): Record<string, string> {
  return {
    ...PG_HEADERS_BASE,
    apikey: cfg.serviceRoleKey,
    authorization: `Bearer ${cfg.serviceRoleKey}`,
  };
}

function buildQueryUrl(
  cfg: SupabaseConfig,
  table: string,
  opts: SupabaseQueryOptions,
): string {
  const safeTable = encodeURIComponent(table);
  const u = new URL(`${cfg.url.replace(/\/$/, '')}/rest/v1/${safeTable}`);
  u.searchParams.set('select', opts.select ?? '*');
  if (opts.order) u.searchParams.set('order', opts.order);
  const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  u.searchParams.set('limit', String(limit));
  if (opts.filters) {
    for (const [k, v] of Object.entries(opts.filters)) {
      u.searchParams.append(k, v);
    }
  }
  return u.toString();
}

/**
 * Executa SELECT em uma tabela do Supabase via PostgREST.
 * Retorna SupabaseQueryResult — nunca lança em erro de rede; encapsula em result.
 */
export async function supabaseSelect<T>(
  cfg: SupabaseConfig,
  table: string,
  opts: SupabaseQueryOptions = {},
): Promise<SupabaseQueryResult<T>> {
  const url = buildQueryUrl(cfg, table, opts);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(cfg),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'fetch_failed';
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`network_error: ${detail}`, cfg.serviceRoleKey),
      http_status: null,
    };
  }

  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'body_read_failed';
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`body_error: ${detail}`, cfg.serviceRoleKey),
      http_status: response.status,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`http_${response.status}: ${bodyText}`, cfg.serviceRoleKey),
      http_status: response.status,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'json_parse_failed';
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`parse_error: ${detail}`, cfg.serviceRoleKey),
      http_status: response.status,
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      ok: false,
      rows: [],
      total: 0,
      error: 'unexpected_response_shape: expected array',
      http_status: response.status,
    };
  }

  const rows = parsed as T[];
  return {
    ok: true,
    rows,
    total: rows.length,
    error: null,
    http_status: response.status,
  };
}

/**
 * Append-only insert. Nesta PR, somente usado em cenários explicitamente
 * autorizados (ex: registrar audit log). Não usado para escrita CRM
 * geral — escrita CRM permanece in-memory na PR-T8.8.
 *
 * Retorna SupabaseQueryResult — nunca lança em erro de rede.
 */
export async function supabaseInsert<T>(
  cfg: SupabaseConfig,
  table: string,
  row: T,
): Promise<SupabaseQueryResult<T>> {
  const url = `${cfg.url.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(table)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(cfg),
      body: JSON.stringify(row),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'fetch_failed';
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`network_error: ${detail}`, cfg.serviceRoleKey),
      http_status: null,
    };
  }

  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    bodyText = '';
  }

  if (!response.ok) {
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`http_${response.status}: ${bodyText}`, cfg.serviceRoleKey),
      http_status: response.status,
    };
  }

  let parsed: unknown = [];
  if (bodyText.length > 0) {
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      parsed = [];
    }
  }
  const rows = Array.isArray(parsed) ? (parsed as T[]) : [];

  return {
    ok: true,
    rows,
    total: rows.length,
    error: null,
    http_status: response.status,
  };
}

/**
 * Upsert (insert-or-update) via PostgREST resolution=merge-duplicates.
 * Usado em T9.12 para escrita real de crm_lead_meta e enova_state.
 * Nunca lança em erro de rede — encapsula em result.ok=false.
 * Nunca expõe serviceRoleKey em mensagem de erro.
 */
export async function supabaseUpsert<T>(
  cfg: SupabaseConfig,
  table: string,
  row: T,
): Promise<SupabaseQueryResult<T>> {
  const url = `${cfg.url.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(table)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        prefer: 'resolution=merge-duplicates,return=representation',
        apikey: cfg.serviceRoleKey,
        authorization: `Bearer ${cfg.serviceRoleKey}`,
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'fetch_failed';
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(`network_error: ${detail}`, cfg.serviceRoleKey),
      http_status: null,
    };
  }

  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    bodyText = '';
  }

  if (!response.ok) {
    // T9.13H-DIAG: parse pg error para superficializar code/message (nome de coluna em 23502).
    // details é OMITIDO — contém valores reais da linha.
    const pgErr = parsePgError(bodyText);
    let errMsg: string;
    if (pgErr) {
      errMsg = `http_${response.status}: pg_code=${pgErr.code} pg_message=${pgErr.message}`;
      if (pgErr.hint) errMsg += ` pg_hint=${pgErr.hint}`;
    } else {
      errMsg = `http_${response.status}: ${bodyText}`;
    }
    return {
      ok: false,
      rows: [],
      total: 0,
      error: safeErrorMessage(errMsg, cfg.serviceRoleKey),
      http_status: response.status,
    };
  }

  let parsed: unknown = [];
  if (bodyText.length > 0) {
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      parsed = [];
    }
  }
  const upsertedRows = Array.isArray(parsed) ? (parsed as T[]) : [];

  return {
    ok: true,
    rows: upsertedRows,
    total: upsertedRows.length,
    error: null,
    http_status: response.status,
  };
}
