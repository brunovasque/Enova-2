/**
 * ENOVA 2 — Supabase operacional controlado (PR-T8.8)
 *
 * Smoke test do módulo Supabase. NÃO toca Supabase real por padrão.
 *
 * Cobre:
 *   1. Readiness com flag desligada
 *   2. Readiness com flag ligada e envs ausentes
 *   3. Readiness com flag ligada e envs presentes
 *   4. maskSupabaseUrl em URLs válidas e inválidas
 *   5. getSupabaseConfig retorna null quando readiness não pronta
 *   6. getCrmBackend retorna in-memory quando flag desligada
 *   7. getCrmBackend retorna SupabaseCrmBackend quando flag ligada (sem HTTP)
 *   8. SupabaseCrmBackend.insert redireciona para writeBuffer (não toca DB)
 *   9. SupabaseCrmBackend.findAll de tabela sem mapeamento usa writeBuffer
 *  10. Erros NÃO vazam SUPABASE_SERVICE_ROLE_KEY
 *  11. Worker /crm/health expõe readiness em modo in-memory
 *  12. Worker /crm/* retorna 503 quando flag ligada sem envs
 *  13. supabase_readiness no health não contém serviceRoleKey
 *  14. e2e-smoke continua passando — confirmação por re-execução
 *
 * Uso:
 *   npm run smoke:supabase
 */

import {
  getSupabaseReadiness,
  getSupabaseConfig,
  getSupabaseReadinessPublic,
  maskSupabaseUrl,
} from './readiness.ts';
import { getCrmBackend } from '../crm/store.ts';
import { SupabaseCrmBackend } from './crm-store.ts';
import worker from '../worker.ts';
import type { CrmLead } from '../crm/types.ts';

const BASE = 'https://test.local';
const FAKE_KEY = 'fake-service-role-key-do-not-use-in-prod-1234567890';
const FAKE_URL = 'https://fake-project.supabase.co';
const ADMIN_KEY = 'test-admin-supabase';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(label: string, cond: boolean): void {
  if (cond) {
    pass++;
    // eslint-disable-next-line no-console
    console.log(`  PASS ${label}`);
  } else {
    fail++;
    failures.push(label);
    // eslint-disable-next-line no-console
    console.error(`  FAIL ${label}`);
  }
}

async function run(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('# smoke:supabase — PR-T8.8');

  // -------------------------------------------------------------------------
  // C1 — Readiness com flag desligada
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C1 — readiness flag OFF');
  {
    const r = getSupabaseReadiness({});
    check('C1-01 flag_enabled false', r.flag_enabled === false);
    check('C1-02 ready false', r.ready === false);
    check('C1-03 mode in_process_backend', r.mode === 'in_process_backend');
    check('C1-04 errors vazio', r.errors.length === 0);
    check('C1-05 env_url_present false', r.env_url_present === false);
    check('C1-06 env_service_role_present false', r.env_service_role_present === false);
  }

  // -------------------------------------------------------------------------
  // C2 — Readiness com flag ligada e envs ausentes
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C2 — readiness flag ON sem envs');
  {
    const r = getSupabaseReadiness({ SUPABASE_REAL_ENABLED: 'true' });
    check('C2-01 flag_enabled true', r.flag_enabled === true);
    check('C2-02 ready false (envs ausentes)', r.ready === false);
    check('C2-03 mode in_process_backend', r.mode === 'in_process_backend');
    check('C2-04 errors apontam URL ausente', r.errors.some((e) => e.includes('SUPABASE_URL')));
    check(
      'C2-05 errors apontam SERVICE_ROLE_KEY ausente',
      r.errors.some((e) => e.includes('SUPABASE_SERVICE_ROLE_KEY')),
    );
  }

  // -------------------------------------------------------------------------
  // C3 — Readiness com flag ligada e envs presentes
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C3 — readiness flag ON com envs');
  {
    const env = {
      SUPABASE_REAL_ENABLED: 'true',
      SUPABASE_URL: FAKE_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_KEY,
    };
    const r = getSupabaseReadiness(env);
    check('C3-01 flag_enabled true', r.flag_enabled === true);
    check('C3-02 ready true', r.ready === true);
    check('C3-03 mode supabase_real', r.mode === 'supabase_real');
    check('C3-04 errors vazio', r.errors.length === 0);
    check('C3-05 warnings inclui escrita_real_off', r.warnings.some((w) => w.includes('Escrita real desabilitada')));
    check('C3-06 warnings menciona RLS', r.warnings.some((w) => w.includes('RLS')));
  }

  // -------------------------------------------------------------------------
  // C4 — maskSupabaseUrl
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C4 — maskSupabaseUrl');
  {
    check('C4-01 mask URL válida retorna host', maskSupabaseUrl(FAKE_URL) === 'https://fake-project.supabase.co');
    check('C4-02 mask URL inválida retorna null', maskSupabaseUrl('not-a-url') === null);
    check('C4-03 mask undefined retorna null', maskSupabaseUrl(undefined) === null);
    check('C4-04 mask empty string retorna null', maskSupabaseUrl('') === null);
  }

  // -------------------------------------------------------------------------
  // C5 — getSupabaseConfig
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C5 — getSupabaseConfig');
  {
    check('C5-01 config null quando flag off', getSupabaseConfig({}) === null);
    check(
      'C5-02 config null quando flag on sem envs',
      getSupabaseConfig({ SUPABASE_REAL_ENABLED: 'true' }) === null,
    );
    const cfg = getSupabaseConfig({
      SUPABASE_REAL_ENABLED: 'true',
      SUPABASE_URL: FAKE_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_KEY,
    });
    check('C5-03 config preenchido com flag+envs', cfg?.url === FAKE_URL && cfg?.serviceRoleKey === FAKE_KEY);
  }

  // -------------------------------------------------------------------------
  // C6 — getCrmBackend factory
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C6 — getCrmBackend factory');
  {
    const b1 = await getCrmBackend({});
    check('C6-01 backend in-memory quando flag off', b1.constructor.name === 'CrmInMemoryBackend');

    const b2 = await getCrmBackend({ SUPABASE_REAL_ENABLED: 'true' });
    check('C6-02 backend in-memory quando flag on sem envs', b2.constructor.name === 'CrmInMemoryBackend');

    const b3 = await getCrmBackend({
      SUPABASE_REAL_ENABLED: 'true',
      SUPABASE_URL: FAKE_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_KEY,
    });
    check('C6-03 backend Supabase quando flag on com envs', b3.constructor.name === 'SupabaseCrmBackend');
  }

  // -------------------------------------------------------------------------
  // C7 — SupabaseCrmBackend.insert NÃO toca DB real (writeBuffer)
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C7 — SupabaseCrmBackend escrita');
  {
    const sb = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_KEY });
    const fakeLead: CrmLead = {
      lead_id: 'sb-smoke-001',
      external_ref: 'wa:111',
      customer_name: 'Smoke Tester',
      phone_ref: null,
      status: 'active',
      manual_mode: false,
      created_at: '2026-04-29T00:00:00.000Z',
      updated_at: '2026-04-29T00:00:00.000Z',
    };
    // Esta inserção NÃO faz HTTP — vai pro writeBuffer interno.
    const inserted = await sb.insert<CrmLead>('crm_leads', fakeLead);
    check('C7-01 insert retorna a row', inserted.lead_id === 'sb-smoke-001');

    // findOne deveria encontrar o que foi inserido (writeBuffer), mesmo sem HTTP.
    // OBS: findOne dispara HTTP em crm_leads — em ambiente sem rede, o
    // SupabaseClient retorna ok:false e o backend retorna apenas o writeBuffer.
    const found = await sb.findOne<CrmLead>('crm_leads', (r) => r.lead_id === 'sb-smoke-001');
    check('C7-02 findOne encontra item do writeBuffer', found?.lead_id === 'sb-smoke-001');
  }

  // -------------------------------------------------------------------------
  // C8 — SupabaseCrmBackend.findAll de tabela sem mapeamento
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C8 — findAll tabelas sem mapeamento');
  {
    const sb = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_KEY });
    const turns = await sb.findAll('crm_turns');
    const facts = await sb.findAll('crm_facts');
    const dossier = await sb.findAll('crm_dossier');
    check('C8-01 crm_turns vazio (sem mapeamento)', Array.isArray(turns) && turns.length === 0);
    check('C8-02 crm_facts vazio (sem mapeamento)', Array.isArray(facts) && facts.length === 0);
    check('C8-03 crm_dossier vazio (sem mapeamento)', Array.isArray(dossier) && dossier.length === 0);
  }

  // -------------------------------------------------------------------------
  // C9 — Worker /crm/health expõe readiness em modo in-memory
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C9 — Worker /crm/health (modo in-memory)');
  {
    const env = { CRM_ADMIN_KEY: ADMIN_KEY };
    const res = await worker.fetch(
      new Request(`${BASE}/crm/health`, { headers: { 'x-crm-admin-key': ADMIN_KEY } }),
      env,
    );
    check('C9-01 status 200', res.status === 200);
    const body = (await res.json()) as Record<string, unknown>;
    check('C9-02 ok true', body.ok === true);
    check('C9-03 mode in_process_backend', body.mode === 'in_process_backend');
    check('C9-04 real_supabase false', body.real_supabase === false);
    check('C9-05 supabase_readiness presente', !!body.supabase_readiness);
    const r = body.supabase_readiness as Record<string, unknown>;
    check('C9-06 readiness.flag_enabled false', r.flag_enabled === false);
    check('C9-07 readiness.ready false', r.ready === false);
    check('C9-08 readiness.url_masked null', r.url_masked === null);
  }

  // -------------------------------------------------------------------------
  // C10 — Worker /crm/health com flag ON e envs (sem HTTP real)
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C10 — Worker /crm/health (flag ON + envs)');
  {
    const env = {
      CRM_ADMIN_KEY: ADMIN_KEY,
      SUPABASE_REAL_ENABLED: 'true',
      SUPABASE_URL: FAKE_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_KEY,
    };
    const res = await worker.fetch(
      new Request(`${BASE}/crm/health`, { headers: { 'x-crm-admin-key': ADMIN_KEY } }),
      env,
    );
    check('C10-01 status 200', res.status === 200);
    const text = await res.text();
    check('C10-02 service role NUNCA aparece no body', !text.includes(FAKE_KEY));
    const body = JSON.parse(text) as Record<string, unknown>;
    check('C10-03 mode supabase_real', body.mode === 'supabase_real');
    check('C10-04 real_supabase true', body.real_supabase === true);
    const r = body.supabase_readiness as Record<string, unknown>;
    check('C10-05 readiness.url_masked == host', r.url_masked === 'https://fake-project.supabase.co');
    check('C10-06 readiness.ready true', r.ready === true);
    check('C10-07 warnings inclui RLS', Array.isArray(r.warnings) && (r.warnings as string[]).some((w) => w.includes('RLS')));
  }

  // -------------------------------------------------------------------------
  // C11 — Worker /crm/* retorna 503 quando flag ON sem envs
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C11 — Worker /crm/leads (flag ON sem envs) → 503');
  {
    const env = {
      CRM_ADMIN_KEY: ADMIN_KEY,
      SUPABASE_REAL_ENABLED: 'true',
    };
    const res = await worker.fetch(
      new Request(`${BASE}/crm/leads`, { headers: { 'x-crm-admin-key': ADMIN_KEY } }),
      env,
    );
    check('C11-01 status 503', res.status === 503);
    const body = (await res.json()) as Record<string, unknown>;
    check('C11-02 ok false', body.ok === false);
    check('C11-03 error fala de envs ausentes', typeof body.error === 'string' && (body.error as string).includes('envs ausentes'));
    check('C11-04 supabase_readiness presente', !!body.supabase_readiness);
  }

  // -------------------------------------------------------------------------
  // C12 — /crm/health NÃO autenticado retorna 401
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C12 — auth ainda barra requests sem chave');
  {
    const env = { CRM_ADMIN_KEY: ADMIN_KEY };
    const res = await worker.fetch(new Request(`${BASE}/crm/health`), env);
    check('C12-01 status 401', res.status === 401);
  }

  // -------------------------------------------------------------------------
  // C13 — /crm/bases/status reflete catálogo Supabase quando flag ON
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C13 — bases/status reflete catálogo real');
  {
    const env = {
      CRM_ADMIN_KEY: ADMIN_KEY,
      SUPABASE_REAL_ENABLED: 'true',
      SUPABASE_URL: FAKE_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_KEY,
    };
    const res = await worker.fetch(
      new Request(`${BASE}/crm/bases/status`, { headers: { 'x-crm-admin-key': ADMIN_KEY } }),
      env,
    );
    const text = await res.text();
    check('C13-01 service role não aparece', !text.includes(FAKE_KEY));
    const body = JSON.parse(text) as Record<string, unknown>;
    check('C13-02 ok true', body.ok === true);
    check('C13-03 real_supabase true', body.real_supabase === true);
    check('C13-04 known_tables_count > 0', typeof body.known_tables_count === 'number' && (body.known_tables_count as number) > 0);
    check('C13-05 known_buckets_count > 0', typeof body.known_buckets_count === 'number' && (body.known_buckets_count as number) > 0);
    check('C13-06 rls_disabled_tables array', Array.isArray(body.rls_disabled_tables));
  }

  // -------------------------------------------------------------------------
  // C14 — /crm/enova-ia/status reflete supabase_real quando flag ON
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C14 — enova-ia/status reflete flag');
  {
    const env = {
      CRM_ADMIN_KEY: ADMIN_KEY,
      SUPABASE_REAL_ENABLED: 'true',
      SUPABASE_URL: FAKE_URL,
      SUPABASE_SERVICE_ROLE_KEY: FAKE_KEY,
    };
    const res = await worker.fetch(
      new Request(`${BASE}/crm/enova-ia/status`, { headers: { 'x-crm-admin-key': ADMIN_KEY } }),
      env,
    );
    const body = (await res.json()) as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    check('C14-01 supabase_real true (flag ON+envs)', record.supabase_real === true);
    check('C14-02 llm_real false', record.llm_real === false);
    check('C14-03 whatsapp_real false', record.whatsapp_real === false);
  }

  // -------------------------------------------------------------------------
  // C15 — Sem flag, comportamento PR-T8.6 idêntico
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C15 — sem flag = comportamento PR-T8.6');
  {
    const env = { CRM_ADMIN_KEY: ADMIN_KEY };
    const res = await worker.fetch(
      new Request(`${BASE}/crm/enova-ia/status`, { headers: { 'x-crm-admin-key': ADMIN_KEY } }),
      env,
    );
    const body = (await res.json()) as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    check('C15-01 supabase_real false', record.supabase_real === false);
    check('C15-02 llm_real false', record.llm_real === false);
    check('C15-03 whatsapp_real false', record.whatsapp_real === false);
  }

  // -------------------------------------------------------------------------
  // C16 — readiness público — formato esperado
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log('C16 — readiness público');
  {
    const r = getSupabaseReadinessPublic({});
    check('C16-01 mode presente', typeof r.mode === 'string');
    check('C16-02 known_tables_count number', typeof r.known_tables_count === 'number');
    check('C16-03 known_buckets_count number', typeof r.known_buckets_count === 'number');
    check('C16-04 rls_disabled_tables array', Array.isArray(r.rls_disabled_tables));
    check('C16-05 errors array', Array.isArray(r.errors));
    check('C16-06 warnings array', Array.isArray(r.warnings));
  }

  // -------------------------------------------------------------------------
  // Final
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-console
  console.log(`\n${pass}/${pass + fail} checks passed; ${fail} failed.`);
  if (fail > 0) {
    // eslint-disable-next-line no-console
    console.error('\nFailures:');
    for (const f of failures) {
      // eslint-disable-next-line no-console
      console.error(`  - ${f}`);
    }
    process.exit(1);
  }
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
