/**
 * ENOVA 2 — PR-T8.11 — Tipo de env Meta/WhatsApp para o Worker.
 *
 * Valores nunca aparecem em código/log/documento. Apenas nomes.
 * Setados via `wrangler secret put` em ambiente real.
 */

export interface MetaWorkerEnv {
  META_VERIFY_TOKEN?: unknown;
  META_APP_SECRET?: unknown;
  META_ACCESS_TOKEN?: unknown;
  META_PHONE_NUMBER_ID?: unknown;
  META_GRAPH_VERSION?: unknown;
  CHANNEL_ENABLED?: unknown;
  META_OUTBOUND_ENABLED?: unknown;
  ENOVA2_ENABLED?: unknown;
  // PR-T8.17 — canary LLM + outbound controlado
  LLM_REAL_ENABLED?: unknown;
  OUTBOUND_CANARY_ENABLED?: unknown;
  OUTBOUND_CANARY_WA_ID?: unknown;
  OPENAI_API_KEY?: unknown;
  ROLLBACK_FLAG?: unknown;
  MAINTENANCE_MODE?: unknown;
}

export function readEnvString(env: MetaWorkerEnv, key: keyof MetaWorkerEnv): string | undefined {
  const value = env[key];
  if (typeof value !== 'string' || value.length === 0) return undefined;
  return value;
}
