// Validador canônico de envs do Worker — T9.1
// Não vaza valores de secrets. Retorna relatório seguro para smoke/health.

export type EnvVar = {
  name: string;
  kind: 'var' | 'secret';
  required: boolean;
  safeDefault?: string;
};

// Lista canônica de todas as envs esperadas pelo Worker.
// Vars: valores não sensíveis com defaults seguros declarados em wrangler.toml.
// Secrets: valores sensíveis provisionados via `wrangler secret put`.
export const CANONICAL_ENVS: EnvVar[] = [
  // --- Supabase ---
  { name: 'SUPABASE_REAL_ENABLED',   kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'SUPABASE_WRITE_ENABLED',  kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'MEMORY_SUPABASE_ENABLED', kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'SUPABASE_URL',            kind: 'secret', required: false },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', kind: 'secret', required: false },

  // --- LLM ---
  { name: 'LLM_REAL_ENABLED',        kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'OPENAI_API_KEY',          kind: 'secret', required: false },

  // --- WhatsApp / outbound ---
  { name: 'CLIENT_REAL_ENABLED',     kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'ENOVA2_ENABLED',          kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'OUTBOUND_CANARY_ENABLED', kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'OUTBOUND_CANARY_WA_ID',   kind: 'var',    required: false, safeDefault: '' },
  { name: 'CANARY_PERCENT',          kind: 'var',    required: false, safeDefault: '0' },
  { name: 'META_APP_SECRET',         kind: 'secret', required: true },
  { name: 'META_VERIFY_TOKEN',       kind: 'secret', required: true },
  { name: 'META_ACCESS_TOKEN',       kind: 'secret', required: false },
  { name: 'META_PHONE_NUMBER_ID',    kind: 'secret', required: false },

  // --- Operacional ---
  { name: 'ROLLBACK_FLAG',           kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'MAINTENANCE_MODE',        kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'GOLIVE_HARNESS_ENABLED',  kind: 'var',    required: false, safeDefault: 'false' },
  { name: 'CRM_ADMIN_KEY',           kind: 'secret', required: true },
];

export type EnvReport = {
  total: number;
  vars_present: string[];
  vars_missing: string[];
  secrets_present: string[];   // nomes apenas, nunca valores
  secrets_missing: string[];
  required_missing: string[];
  safe_defaults_applied: string[];
  has_blocking_gap: boolean;
};

// Valida presença de envs no objeto env do Worker.
// NUNCA inclui valores de secrets no relatório retornado.
export function validateEnvs(env: Record<string, unknown>): EnvReport {
  const vars_present: string[] = [];
  const vars_missing: string[] = [];
  const secrets_present: string[] = [];
  const secrets_missing: string[] = [];
  const required_missing: string[] = [];
  const safe_defaults_applied: string[] = [];

  for (const spec of CANONICAL_ENVS) {
    const value = env[spec.name];
    const present = value !== undefined && value !== null && value !== '';

    if (spec.kind === 'var') {
      if (present) {
        vars_present.push(spec.name);
      } else if (spec.safeDefault !== undefined && spec.safeDefault !== '') {
        // var ausente mas tem default seguro declarado no wrangler.toml
        safe_defaults_applied.push(spec.name);
        vars_present.push(spec.name);
      } else {
        vars_missing.push(spec.name);
        if (spec.required) required_missing.push(spec.name);
      }
    } else {
      // secret: registra apenas o nome, nunca o valor
      if (present) {
        secrets_present.push(spec.name);
      } else {
        secrets_missing.push(spec.name);
        if (spec.required) required_missing.push(spec.name);
      }
    }
  }

  return {
    total: CANONICAL_ENVS.length,
    vars_present,
    vars_missing,
    secrets_present,
    secrets_missing,
    required_missing,
    safe_defaults_applied,
    has_blocking_gap: required_missing.length > 0,
  };
}

// Retorna modo de persistência atual baseado nas flags.
// Seguro para expor em health endpoints.
export function getPersistenceMode(env: Record<string, unknown>): string {
  if (env['SUPABASE_REAL_ENABLED'] === 'true' && env['SUPABASE_WRITE_ENABLED'] === 'true') {
    return 'supabase_full';
  }
  if (env['SUPABASE_REAL_ENABLED'] === 'true') {
    return 'supabase_read_only';
  }
  return 'in_memory';
}
