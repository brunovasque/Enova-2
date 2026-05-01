/**
 * ENOVA 2 — PR-T8.15 — Feature flags canônicas
 *
 * Leitura centralizada e segura de todas as flags operacionais.
 *
 * REGRAS INVIOLÁVEIS:
 *   - Default seguro é SEMPRE false / 0.
 *   - Nenhuma flag expõe secret.
 *   - Ausência de env equivale a false.
 *   - ROLLBACK_FLAG=true sobrescreve tudo e bloqueia.
 *   - MAINTENANCE_MODE=true bloqueia atendimento.
 */

export interface CanonicalFlags {
  enova2_enabled: boolean;
  channel_enabled: boolean;
  meta_outbound_enabled: boolean;
  llm_real_enabled: boolean;
  client_real_enabled: boolean;
  canary_percent: number;
  rollback_flag: boolean;
  maintenance_mode: boolean;
  golive_harness_enabled: boolean;
  memory_supabase_enabled: boolean;
  // PR-T8.17
  outbound_canary_enabled: boolean;
  outbound_canary_wa_id: string;
}

function readBool(env: Record<string, unknown>, key: string): boolean {
  const v = env[key];
  if (typeof v === 'string') return v.trim().toLowerCase() === 'true';
  if (typeof v === 'boolean') return v;
  return false;
}

function readStr(env: Record<string, unknown>, key: string): string {
  const v = env[key];
  if (typeof v === 'string') return v.trim();
  return '';
}

function readPercent(env: Record<string, unknown>, key: string): number {
  const v = env[key];
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 0 && n <= 100) return n;
  }
  if (typeof v === 'number' && v >= 0 && v <= 100) return v;
  return 0;
}

export function readCanonicalFlags(env: Record<string, unknown> = {}): CanonicalFlags {
  return {
    enova2_enabled: readBool(env, 'ENOVA2_ENABLED'),
    channel_enabled: readBool(env, 'CHANNEL_ENABLED'),
    meta_outbound_enabled: readBool(env, 'META_OUTBOUND_ENABLED'),
    llm_real_enabled: readBool(env, 'LLM_REAL_ENABLED'),
    client_real_enabled: readBool(env, 'CLIENT_REAL_ENABLED'),
    canary_percent: readPercent(env, 'CANARY_PERCENT'),
    rollback_flag: readBool(env, 'ROLLBACK_FLAG'),
    maintenance_mode: readBool(env, 'MAINTENANCE_MODE'),
    golive_harness_enabled: readBool(env, 'GOLIVE_HARNESS_ENABLED'),
    memory_supabase_enabled: readBool(env, 'MEMORY_SUPABASE_ENABLED'),
    outbound_canary_enabled: readBool(env, 'OUTBOUND_CANARY_ENABLED'),
    outbound_canary_wa_id: readStr(env, 'OUTBOUND_CANARY_WA_ID'),
  };
}

export function flagsPublicSummary(flags: CanonicalFlags): Record<string, unknown> {
  return {
    enova2_enabled: flags.enova2_enabled,
    channel_enabled: flags.channel_enabled,
    meta_outbound_enabled: flags.meta_outbound_enabled,
    llm_real_enabled: flags.llm_real_enabled,
    client_real_enabled: flags.client_real_enabled,
    canary_percent: flags.canary_percent,
    rollback_flag: flags.rollback_flag,
    maintenance_mode: flags.maintenance_mode,
    golive_harness_enabled: flags.golive_harness_enabled,
    memory_supabase_enabled: flags.memory_supabase_enabled,
    outbound_canary_enabled: flags.outbound_canary_enabled,
    outbound_canary_wa_id_present: flags.outbound_canary_wa_id.length > 0,
  };
}
