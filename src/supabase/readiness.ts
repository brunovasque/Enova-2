/**
 * ENOVA 2 — Supabase operacional controlado (PR-T8.8)
 *
 * Readiness — avalia env vars e flag, sem tocar Supabase real.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Não imprimir SUPABASE_SERVICE_ROLE_KEY em log/response/error.
 *   - Não logar SUPABASE_URL completa em produção (usar versão truncada).
 *   - Sem fallback silencioso: flag ON sem env = readiness fail explícito.
 */

import type {
  SupabaseConfig,
  SupabaseEnv,
  SupabaseReadiness,
} from './types.ts';
import {
  SUPABASE_KNOWN_BUCKETS,
  SUPABASE_KNOWN_TABLES,
  SUPABASE_RLS_DISABLED_TABLES,
} from './types.ts';

/**
 * Mascara um SUPABASE_URL para logs/response. Mantém apenas o host base.
 * Nunca usar a versão crua em logs.
 */
export function maskSupabaseUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/**
 * Avalia readiness com base no env. Não faz nenhuma chamada HTTP.
 * Retorna estrutura segura — sem expor segredo, sem tocar Supabase real.
 */
export function getSupabaseReadiness(env: SupabaseEnv): SupabaseReadiness {
  const flag_enabled = env.SUPABASE_REAL_ENABLED === 'true';
  const env_url_present =
    typeof env.SUPABASE_URL === 'string' && (env.SUPABASE_URL as string).length > 0;
  const env_service_role_present =
    typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' &&
    (env.SUPABASE_SERVICE_ROLE_KEY as string).length > 0;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (flag_enabled && !env_url_present) {
    errors.push('SUPABASE_REAL_ENABLED=true mas SUPABASE_URL ausente.');
  }
  if (flag_enabled && !env_service_role_present) {
    errors.push('SUPABASE_REAL_ENABLED=true mas SUPABASE_SERVICE_ROLE_KEY ausente.');
  }

  const ready = flag_enabled && env_url_present && env_service_role_present;
  const mode = ready ? 'supabase_real' : 'in_process_backend';

  if (ready) {
    if (SUPABASE_RLS_DISABLED_TABLES.length > 0) {
      warnings.push(
        `RLS desativado em ${SUPABASE_RLS_DISABLED_TABLES.length} tabela(s) sensíveis. Correção em PR específica.`,
      );
    }
    const publicBuckets = SUPABASE_KNOWN_BUCKETS.filter((b) => b.public && b.object_count > 0);
    if (publicBuckets.length > 0) {
      warnings.push(
        `${publicBuckets.length} bucket(s) público(s) com objetos sensíveis. Política deve ser revisada.`,
      );
    }
    warnings.push('Escrita real desabilitada nesta PR (PR-T8.8). Apenas leitura controlada e auditoria append-only.');
  }

  return {
    mode,
    flag_enabled,
    env_url_present,
    env_service_role_present,
    ready,
    errors,
    warnings,
  };
}

/**
 * Extrai SupabaseConfig do env quando readiness está OK.
 * Lança se chamado sem readiness pronta — evita uso indevido.
 */
export function getSupabaseConfig(env: SupabaseEnv): SupabaseConfig | null {
  const r = getSupabaseReadiness(env);
  if (!r.ready) return null;
  return {
    url: env.SUPABASE_URL as string,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY as string,
  };
}

/**
 * Bloco de readiness exposto em /crm/health — versão pública SEM segredos.
 */
export function getSupabaseReadinessPublic(env: SupabaseEnv): {
  mode: SupabaseReadiness['mode'];
  flag_enabled: boolean;
  ready: boolean;
  url_masked: string | null;
  env_complete: boolean;
  errors: string[];
  warnings: string[];
  known_tables_count: number;
  known_buckets_count: number;
  rls_disabled_tables: readonly string[];
} {
  const r = getSupabaseReadiness(env);
  return {
    mode: r.mode,
    flag_enabled: r.flag_enabled,
    ready: r.ready,
    url_masked: maskSupabaseUrl(env.SUPABASE_URL),
    env_complete: r.env_url_present && r.env_service_role_present,
    errors: r.errors,
    warnings: r.warnings,
    known_tables_count: SUPABASE_KNOWN_TABLES.length,
    known_buckets_count: SUPABASE_KNOWN_BUCKETS.length,
    rls_disabled_tables: SUPABASE_RLS_DISABLED_TABLES,
  };
}
