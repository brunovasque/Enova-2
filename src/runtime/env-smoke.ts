// smoke:runtime:env — T9.1
// Valida lista canônica de envs, defaults seguros e que secrets não vazam.
// Roda sem credenciais reais. Deve sair PASS (exit 0).

import { validateEnvs, getPersistenceMode, CANONICAL_ENVS } from './env-validator';

let pass = 0;
let fail = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    pass++;
  } else {
    console.error(`  ✗ ${label}`);
    fail++;
  }
}

console.log('\n=== smoke:runtime:env — T9.1 ===\n');

// --- C1: lista canônica tem todas as envs esperadas ---
console.log('C1: Lista canônica de envs');
const names = CANONICAL_ENVS.map((e) => e.name);
check('SUPABASE_REAL_ENABLED declarada', names.includes('SUPABASE_REAL_ENABLED'));
check('SUPABASE_WRITE_ENABLED declarada', names.includes('SUPABASE_WRITE_ENABLED'));
check('MEMORY_SUPABASE_ENABLED declarada', names.includes('MEMORY_SUPABASE_ENABLED'));
check('SUPABASE_URL declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'SUPABASE_URL')?.kind === 'secret');
check('SUPABASE_SERVICE_ROLE_KEY declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'SUPABASE_SERVICE_ROLE_KEY')?.kind === 'secret');
check('LLM_REAL_ENABLED declarada', names.includes('LLM_REAL_ENABLED'));
check('OPENAI_API_KEY declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'OPENAI_API_KEY')?.kind === 'secret');
check('CLIENT_REAL_ENABLED declarada', names.includes('CLIENT_REAL_ENABLED'));
check('ENOVA2_ENABLED declarada', names.includes('ENOVA2_ENABLED'));
check('ROLLBACK_FLAG declarada', names.includes('ROLLBACK_FLAG'));
check('MAINTENANCE_MODE declarada', names.includes('MAINTENANCE_MODE'));
check('META_APP_SECRET declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'META_APP_SECRET')?.kind === 'secret');
check('META_VERIFY_TOKEN declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'META_VERIFY_TOKEN')?.kind === 'secret');
check('META_ACCESS_TOKEN declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'META_ACCESS_TOKEN')?.kind === 'secret');
check('META_PHONE_NUMBER_ID declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'META_PHONE_NUMBER_ID')?.kind === 'secret');
check('CRM_ADMIN_KEY declarada como secret', CANONICAL_ENVS.find((e) => e.name === 'CRM_ADMIN_KEY')?.kind === 'secret');
check('OUTBOUND_CANARY_ENABLED declarada', names.includes('OUTBOUND_CANARY_ENABLED'));
check('CANARY_PERCENT declarada', names.includes('CANARY_PERCENT'));
check('Total >= 18 envs declaradas', CANONICAL_ENVS.length >= 18);

// --- C2: defaults seguros ---
console.log('\nC2: Defaults seguros (vars)');
const safeFlags = ['SUPABASE_REAL_ENABLED','SUPABASE_WRITE_ENABLED','MEMORY_SUPABASE_ENABLED',
                   'LLM_REAL_ENABLED','CLIENT_REAL_ENABLED','ENOVA2_ENABLED',
                   'ROLLBACK_FLAG','MAINTENANCE_MODE','GOLIVE_HARNESS_ENABLED',
                   'OUTBOUND_CANARY_ENABLED'];
for (const flag of safeFlags) {
  const spec = CANONICAL_ENVS.find((e) => e.name === flag);
  check(`${flag} default = "false"`, spec?.safeDefault === 'false');
}
check('CANARY_PERCENT default = "0"', CANONICAL_ENVS.find((e) => e.name === 'CANARY_PERCENT')?.safeDefault === '0');

// --- C3: validateEnvs com env vazio ---
console.log('\nC3: validateEnvs com env vazio (sem credenciais)');
const emptyReport = validateEnvs({});
check('report.total >= 18', emptyReport.total >= 18);
check('report.has_blocking_gap = true (secrets required ausentes)', emptyReport.has_blocking_gap === true);
check('required_missing inclui META_APP_SECRET', emptyReport.required_missing.includes('META_APP_SECRET'));
check('required_missing inclui META_VERIFY_TOKEN', emptyReport.required_missing.includes('META_VERIFY_TOKEN'));
check('required_missing inclui CRM_ADMIN_KEY', emptyReport.required_missing.includes('CRM_ADMIN_KEY'));
check('secrets_present está vazio (sem credenciais)', emptyReport.secrets_present.length === 0);

// --- C4: validateEnvs com vars seguras declaradas ---
console.log('\nC4: validateEnvs com vars seguras + secrets simulados');
const safeEnv: Record<string, unknown> = {
  SUPABASE_REAL_ENABLED: 'false',
  SUPABASE_WRITE_ENABLED: 'false',
  MEMORY_SUPABASE_ENABLED: 'false',
  LLM_REAL_ENABLED: 'false',
  CLIENT_REAL_ENABLED: 'false',
  ENOVA2_ENABLED: 'false',
  ROLLBACK_FLAG: 'false',
  MAINTENANCE_MODE: 'false',
  GOLIVE_HARNESS_ENABLED: 'false',
  OUTBOUND_CANARY_ENABLED: 'false',
  OUTBOUND_CANARY_WA_ID: '',
  CANARY_PERCENT: '0',
  // secrets simulados (valores fictícios para smoke — nunca reais)
  META_APP_SECRET: 'smoke-fake-secret',
  META_VERIFY_TOKEN: 'smoke-fake-token',
  CRM_ADMIN_KEY: 'smoke-fake-key',
};
const safeReport = validateEnvs(safeEnv);
check('vars_present inclui SUPABASE_REAL_ENABLED', safeReport.vars_present.includes('SUPABASE_REAL_ENABLED'));
check('vars_present inclui ROLLBACK_FLAG', safeReport.vars_present.includes('ROLLBACK_FLAG'));
check('secrets_present inclui META_APP_SECRET (nome apenas)', safeReport.secrets_present.includes('META_APP_SECRET'));
check('secrets_present inclui META_VERIFY_TOKEN (nome apenas)', safeReport.secrets_present.includes('META_VERIFY_TOKEN'));
check('secrets_present inclui CRM_ADMIN_KEY (nome apenas)', safeReport.secrets_present.includes('CRM_ADMIN_KEY'));
check('required_missing vazio com secrets obrigatórios presentes', safeReport.required_missing.length === 0);
check('has_blocking_gap = false', safeReport.has_blocking_gap === false);

// --- C5: getPersistenceMode com flags off ---
console.log('\nC5: getPersistenceMode');
check('in_memory quando flags off', getPersistenceMode({}) === 'in_memory');
check('supabase_read_only quando SUPABASE_REAL_ENABLED=true, WRITE=false',
  getPersistenceMode({ SUPABASE_REAL_ENABLED: 'true' }) === 'supabase_read_only');
check('supabase_full quando REAL=true + WRITE=true',
  getPersistenceMode({ SUPABASE_REAL_ENABLED: 'true', SUPABASE_WRITE_ENABLED: 'true' }) === 'supabase_full');

// --- C6: secrets nunca vazam no relatório ---
console.log('\nC6: Secrets não vazam valores no relatório');
const leakEnv: Record<string, unknown> = {
  META_APP_SECRET: 'super-secret-value-12345',
  META_VERIFY_TOKEN: 'another-secret-value',
  CRM_ADMIN_KEY: 'admin-secret',
};
const leakReport = validateEnvs(leakEnv);
const reportStr = JSON.stringify(leakReport);
check('valor "super-secret-value-12345" não aparece no relatório', !reportStr.includes('super-secret-value-12345'));
check('valor "another-secret-value" não aparece no relatório', !reportStr.includes('another-secret-value'));
check('valor "admin-secret" não aparece no relatório', !reportStr.includes('admin-secret'));
check('secrets_present contém apenas nomes', leakReport.secrets_present.every((s) => typeof s === 'string' && s.length < 50));

// --- C7: invariantes soberania ---
console.log('\nC7: Invariantes soberania');
check('ROLLBACK_FLAG é var (não secret) — soberania operacional',
  CANONICAL_ENVS.find((e) => e.name === 'ROLLBACK_FLAG')?.kind === 'var');
check('CLIENT_REAL_ENABLED é var — gate de outbound',
  CANONICAL_ENVS.find((e) => e.name === 'CLIENT_REAL_ENABLED')?.kind === 'var');
check('SUPABASE_SERVICE_ROLE_KEY é secret — nunca em var',
  CANONICAL_ENVS.find((e) => e.name === 'SUPABASE_SERVICE_ROLE_KEY')?.kind === 'secret');

// --- Resultado ---
console.log(`\n=== Resultado: ${pass} PASS | ${fail} FAIL ===\n`);

if (fail > 0) {
  process.exit(1);
}
