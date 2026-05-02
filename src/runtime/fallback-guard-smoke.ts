// smoke:runtime:fallback-guard — T9.2
// Valida que o fallback in-memory emite telemetria explícita,
// que /crm/health expõe persistence_mode e que go-live health expõe
// supabase_runtime_active. Roda sem credenciais reais. Exit 0 = PASS.

import { getPersistenceMode, validateEnvs } from './env-validator.ts';
import { diagLog } from '../meta/prod-diag.ts';
import { handleCrmRequest } from '../crm/routes.ts';
import { handleGoLiveHealth } from '../golive/health.ts';
import type { TelemetryRequestContext } from '../telemetry/types.ts';

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

async function main(): Promise<void> {
  console.log('\n=== smoke:runtime:fallback-guard — T9.2 ===\n');

  // --- C1: getPersistenceMode com todas as combinações ---
  console.log('C1: getPersistenceMode combinações');
  check('flag ausente → in_memory', getPersistenceMode({}) === 'in_memory');
  check('SUPABASE_REAL_ENABLED=false → in_memory',
    getPersistenceMode({ SUPABASE_REAL_ENABLED: 'false' }) === 'in_memory');
  check('REAL=true, WRITE=false → supabase_read_only',
    getPersistenceMode({ SUPABASE_REAL_ENABLED: 'true' }) === 'supabase_read_only');
  check('REAL=true + WRITE=true → supabase_full',
    getPersistenceMode({ SUPABASE_REAL_ENABLED: 'true', SUPABASE_WRITE_ENABLED: 'true' }) === 'supabase_full');
  check('REAL=false + WRITE=true → in_memory (REAL é gate)',
    getPersistenceMode({ SUPABASE_REAL_ENABLED: 'false', SUPABASE_WRITE_ENABLED: 'true' }) === 'in_memory');

  // --- C2: diagLog não vaza secrets ---
  console.log('\nC2: diagLog não vaza secrets');
  const loggedLines: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    const line = args.map(String).join(' ');
    loggedLines.push(line);
    origLog(...args);
  };

  diagLog('runtime.guard.in_memory_fallback', {
    module: 'crm',
    reason: 'flag_off',
    persistence_mode: 'in_memory',
  });
  diagLog('runtime.guard.in_memory_fallback', {
    module: 'crm',
    reason: 'envs_missing',
    persistence_mode: 'in_memory',
    url_present: false,
    key_present: false,
  });

  console.log = origLog;
  const logsJoined = loggedLines.join('\n');

  check('log flag_off contém "flag_off"', logsJoined.includes('flag_off'));
  check('log envs_missing contém "envs_missing"', logsJoined.includes('envs_missing'));
  check('log contém "in_memory"', logsJoined.includes('in_memory'));
  check('log contém "crm"', logsJoined.includes('"crm"'));
  check('log NÃO contém serviceRoleKey', !logsJoined.includes('serviceRoleKey'));
  check('log NÃO contém SUPABASE_SERVICE_ROLE_KEY', !logsJoined.includes('SUPABASE_SERVICE_ROLE_KEY'));
  check('log NÃO contém OPENAI_API_KEY', !logsJoined.includes('OPENAI_API_KEY'));

  // --- C3: /crm/health contém persistence_mode ---
  console.log('\nC3: /crm/health — campo persistence_mode presente');
  const envOff: Record<string, unknown> = {
    SUPABASE_REAL_ENABLED: 'false',
    CRM_ALLOW_DEV_TOKEN: 'true',
  };
  const healthReqOff = new Request('http://localhost/crm/health', {
    method: 'GET',
    headers: { 'x-crm-admin-key': 'dev-crm-local' },
  });
  const healthUrl = new URL(healthReqOff.url);
  const smokeTelCtx: TelemetryRequestContext = {
    trace_id: 'smoke-t9.2',
    correlation_id: 'smoke-t9.2',
    request_id: 'smoke-t9.2-req',
    route: '/crm/health',
    method: 'GET',
  };
  const healthResOff = await handleCrmRequest(healthReqOff, healthUrl, smokeTelCtx, envOff);
  check('/crm/health retorna 200', healthResOff.status === 200);

  const healthBodyOff = await healthResOff.json() as Record<string, unknown>;
  check('health tem campo persistence_mode', 'persistence_mode' in healthBodyOff);
  check('persistence_mode = "in_memory" quando flag off',
    healthBodyOff['persistence_mode'] === 'in_memory');
  check('health preserva campo real_supabase', 'real_supabase' in healthBodyOff);
  check('health preserva campo mode', 'mode' in healthBodyOff);
  check('health preserva campo ok = true', healthBodyOff['ok'] === true);

  // supabase_full → persistence_mode = supabase_full (via getPersistenceMode direto)
  const envFull: Record<string, unknown> = {
    SUPABASE_REAL_ENABLED: 'true',
    SUPABASE_WRITE_ENABLED: 'true',
  };
  check('getPersistenceMode(envFull) = supabase_full',
    getPersistenceMode(envFull) === 'supabase_full');

  // --- C4: go-live health expõe supabase_runtime_active ---
  console.log('\nC4: /__admin__/go-live/health — campo supabase_runtime_active');
  const goLiveEnvOff: Record<string, unknown> = {
    SUPABASE_REAL_ENABLED: 'false',
    CRM_ALLOW_DEV_TOKEN: 'true',
    CRM_ADMIN_KEY: 'dev-crm-local',
  };
  const goLiveReq = new Request('http://localhost/__admin__/go-live/health', {
    method: 'GET',
    headers: { 'x-crm-admin-key': 'dev-crm-local' },
  });
  const goLiveRes = await handleGoLiveHealth(goLiveReq, goLiveEnvOff);
  check('go-live health retorna 200', goLiveRes.status === 200);

  const goLiveBody = await goLiveRes.json() as Record<string, unknown>;
  check('go-live health tem supabase_runtime_active', 'supabase_runtime_active' in goLiveBody);
  check('supabase_runtime_active = false quando flag off',
    goLiveBody['supabase_runtime_active'] === false);
  check('go-live health preserva campo ok', goLiveBody['ok'] === true);
  check('go-live health preserva campo readiness', 'readiness' in goLiveBody);
  check('go-live health preserva campo flags', 'flags' in goLiveBody);

  // go-live com supabase_full
  const goLiveEnvFull: Record<string, unknown> = {
    SUPABASE_REAL_ENABLED: 'true',
    SUPABASE_WRITE_ENABLED: 'true',
    CRM_ALLOW_DEV_TOKEN: 'true',
    CRM_ADMIN_KEY: 'dev-crm-local',
  };
  const goLiveReqFull = new Request('http://localhost/__admin__/go-live/health', {
    method: 'GET',
    headers: { 'x-crm-admin-key': 'dev-crm-local' },
  });
  const goLiveResFull = await handleGoLiveHealth(goLiveReqFull, goLiveEnvFull);
  const goLiveBodyFull = await goLiveResFull.json() as Record<string, unknown>;
  check('supabase_runtime_active = true quando supabase_full',
    goLiveBodyFull['supabase_runtime_active'] === true);

  // --- C5: secrets não aparecem nos campos expostos ---
  console.log('\nC5: Secrets não vazam em health responses');
  const healthBodyStr = JSON.stringify(healthBodyOff);
  check('health NÃO contém serviceRoleKey', !healthBodyStr.includes('serviceRoleKey'));
  check('health NÃO contém OPENAI_API_KEY', !healthBodyStr.includes('OPENAI_API_KEY'));
  const goLiveBodyStr = JSON.stringify(goLiveBody);
  check('go-live NÃO contém serviceRoleKey', !goLiveBodyStr.includes('serviceRoleKey'));
  check('go-live NÃO contém OPENAI_API_KEY', !goLiveBodyStr.includes('OPENAI_API_KEY'));

  // --- C6: validateEnvs relatório seguro ---
  console.log('\nC6: validateEnvs — relatório seguro sem vazar valores');
  const rep = validateEnvs({
    SUPABASE_REAL_ENABLED: 'false',
    META_APP_SECRET: 'super-secret-abc123',
    META_VERIFY_TOKEN: 'very-secret-token',
    CRM_ADMIN_KEY: 'admin-key-secret',
  });
  const repStr = JSON.stringify(rep);
  check('relatório não contém "super-secret-abc123"', !repStr.includes('super-secret-abc123'));
  check('relatório não contém "very-secret-token"', !repStr.includes('very-secret-token'));
  check('relatório não contém "admin-key-secret"', !repStr.includes('admin-key-secret'));

  // --- C7: retrocompatibilidade shape /crm/health ---
  console.log('\nC7: Retrocompatibilidade shape /crm/health');
  check('health tem service = enova-2-crm', healthBodyOff['service'] === 'enova-2-crm');
  check('health tem status = operational', healthBodyOff['status'] === 'operational');
  check('health tem real_llm = false', healthBodyOff['real_llm'] === false);
  check('health tem real_whatsapp = false', healthBodyOff['real_whatsapp'] === false);
  check('health tem supabase_readiness', 'supabase_readiness' in healthBodyOff);
  check('health tem panel_tabs', Array.isArray(healthBodyOff['panel_tabs']));

  // --- Resultado ---
  console.log(`\n=== Resultado: ${pass} PASS | ${fail} FAIL ===\n`);

  if (fail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nErro inesperado:', err);
  process.exit(1);
});
