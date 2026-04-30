/**
 * ENOVA 2 — Painel Operacional — Prova E2E CRM (PR-T8.6)
 *
 * PR-PROVA: valida PR-T8.4 (backend 26 endpoints) + PR-T8.5 (painel /panel)
 * de forma integrada, exercitando o fluxo real ponta a ponta:
 *   criar lead → override → modo manual → atendimento → case-file → reset →
 *   auditoria preservada → trilha incidentes → abas do painel → flags real_*:false
 *
 * Categorias:
 *   C1 — Health e rotas de painel
 *   C2 — Auth (401 sem chave, token dev exige flag)
 *   C3 — Fluxo CRM completo (6 operações supervisionadas)
 *   C4 — 7 abas do painel (endpoints + HTML)
 *   C5 — Flags real_*:false declaradas em todos os endpoints relevantes
 *   C6 — Restrições invioláveis (reply_text ausente, stage não decidido, métodos)
 *
 * Resultado esperado: todos os checks PASS.
 */

import worker from '../worker.ts';

interface Check {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: Check[] = [];

function check(name: string, passed: boolean, detail?: string) {
  results.push({ name, passed, detail });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = 'https://enova.local';

async function get(
  path: string,
  env: Record<string, unknown> = {},
  headers: Record<string, string> = {},
): Promise<Response> {
  return worker.fetch(new Request(`${BASE}${path}`, { headers }), env);
}

async function post(
  path: string,
  body: unknown,
  env: Record<string, unknown> = {},
  headers: Record<string, string> = {},
): Promise<Response> {
  return worker.fetch(
    new Request(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
    env,
  );
}

async function put(
  path: string,
  body: unknown,
  env: Record<string, unknown> = {},
  headers: Record<string, string> = {},
): Promise<Response> {
  return worker.fetch(
    new Request(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
    env,
  );
}

async function json(r: Response): Promise<unknown> {
  try {
    return await r.json();
  } catch {
    return null;
  }
}

// Env com dev token habilitado (apenas para testes de auth e fluxo)
const DEV_ENV = { CRM_ALLOW_DEV_TOKEN: 'true' };
const DEV_KEY = { 'X-CRM-Admin-Key': 'dev-crm-local' };

// Env de produção simulado (chave real)
const PROD_ENV = { CRM_ADMIN_KEY: 'test-admin-key-prova-t8' };
const PROD_KEY = { 'X-CRM-Admin-Key': 'test-admin-key-prova-t8' };

// ---------------------------------------------------------------------------
// C1 — Health e rotas de painel
// ---------------------------------------------------------------------------

async function c1_health_and_panel(): Promise<void> {
  // GET /
  {
    const r = await get('/', {});
    check('C1-01: GET / retorna 200', r.status === 200, `status=${r.status}`);
  }

  // GET /crm/health (autenticado com chave de produção)
  {
    const r = await get('/crm/health', PROD_ENV, PROD_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    check('C1-02: GET /crm/health retorna 200', r.status === 200, `status=${r.status}`);
    check('C1-03: /crm/health ok:true', body?.ok === true, `ok=${body?.ok}`);
    check(
      'C1-04: /crm/health mode:in_process_backend',
      body?.mode === 'in_process_backend',
      `mode=${body?.mode}`,
    );
    check(
      'C1-05: /crm/health panel_tabs tem 7 abas',
      Array.isArray(body?.panel_tabs) && (body.panel_tabs as unknown[]).length === 7,
      `tabs=${JSON.stringify(body?.panel_tabs)}`,
    );
  }

  // GET /panel
  {
    const r = await get('/panel', {});
    const ct = r.headers.get('content-type') ?? '';
    check('C1-06: GET /panel retorna 200', r.status === 200, `status=${r.status}`);
    check('C1-07: GET /panel content-type text/html', ct.includes('text/html'), `ct=${ct}`);
  }

  // GET /panel/ (trailing slash)
  {
    const r = await get('/panel/', {});
    check('C1-08: GET /panel/ retorna 200', r.status === 200, `status=${r.status}`);
  }
}

// ---------------------------------------------------------------------------
// C2 — Auth
// ---------------------------------------------------------------------------

async function c2_auth(): Promise<void> {
  // Sem header → 401
  {
    const r = await get('/crm/health', {});
    check('C2-01: sem X-CRM-Admin-Key → 401', r.status === 401, `status=${r.status}`);
  }

  // dev-crm-local sem flag → 401
  {
    const r = await get('/crm/health', {}, { 'X-CRM-Admin-Key': 'dev-crm-local' });
    check(
      'C2-02: dev-crm-local sem CRM_ALLOW_DEV_TOKEN → 401',
      r.status === 401,
      `status=${r.status}`,
    );
  }

  // dev-crm-local com flag → 200
  {
    const r = await get('/crm/health', DEV_ENV, DEV_KEY);
    check(
      'C2-03: dev-crm-local com CRM_ALLOW_DEV_TOKEN=true → 200',
      r.status === 200,
      `status=${r.status}`,
    );
  }

  // Chave de produção correta → 200
  {
    const r = await get('/crm/health', PROD_ENV, PROD_KEY);
    check('C2-04: CRM_ADMIN_KEY correta → 200', r.status === 200, `status=${r.status}`);
  }

  // Chave errada → 401
  {
    const r = await get('/crm/health', PROD_ENV, { 'X-CRM-Admin-Key': 'chave-errada' });
    check('C2-05: chave incorreta → 401', r.status === 401, `status=${r.status}`);
  }
}

// ---------------------------------------------------------------------------
// C3 — Fluxo CRM completo
// ---------------------------------------------------------------------------

async function c3_crm_flow(): Promise<string> {
  let lead_id = '';

  // Criar lead
  {
    const r = await post(
      '/crm/leads',
      { customer_name: 'Prova E2E T8.6', external_ref: 'prova-e2e-001' },
      DEV_ENV,
      DEV_KEY,
    );
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    lead_id = (record?.lead_id as string) ?? '';
    check('C3-01: POST /crm/leads → 201', r.status === 201, `status=${r.status}`);
    check('C3-02: lead_id retornado não vazio', lead_id.length > 0, `lead_id=${lead_id}`);
    check('C3-03: lead status:active', record?.status === 'active', `status=${record?.status}`);
    check('C3-04: lead manual_mode:false', record?.manual_mode === false, `manual_mode=${record?.manual_mode}`);
  }

  if (!lead_id) {
    check('C3 ABORTADO: lead_id não obtido — checks C3-05..C3-20 pulados', false);
    return lead_id;
  }

  // Listar leads — deve conter o lead criado
  {
    const r = await get('/crm/leads', DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    const records = body?.records as unknown[] | undefined;
    check(
      'C3-05: GET /crm/leads inclui lead criado',
      Array.isArray(records) && records.some((l) => (l as Record<string, unknown>).lead_id === lead_id),
      `count=${records?.length}`,
    );
  }

  // Registrar override
  {
    const r = await post(
      `/crm/leads/${lead_id}/override`,
      {
        operator_id: 'op-prova-e2e',
        override_type: 'note',
        reason: 'Prova E2E T8.6 — registro de override inicial',
        target_field: 'status',
        old_value: 'active',
        new_value: 'active',
      },
      DEV_ENV,
      DEV_KEY,
    );
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    check('C3-06: POST /crm/leads/:id/override → 201', r.status === 201, `status=${r.status}`);
    check('C3-07: override_id retornado', typeof record?.override_id === 'string' && (record.override_id as string).length > 0);
    check('C3-08: override reason preservado', record?.reason === 'Prova E2E T8.6 — registro de override inicial');
  }

  // Ativar modo manual
  {
    const r = await post(
      `/crm/leads/${lead_id}/manual-mode`,
      { action: 'activate', operator_id: 'op-prova-e2e', reason: 'Ativando para prova E2E' },
      DEV_ENV,
      DEV_KEY,
    );
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    check('C3-09: POST /crm/leads/:id/manual-mode activate → 201', r.status === 201, `status=${r.status}`);
    check('C3-10: action:activate retornado', record?.action === 'activate', `action=${record?.action}`);
  }

  // Verificar atendimento — lead deve aparecer em manual-mode
  {
    const r = await get('/crm/attendance/manual-mode', DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    const records = body?.records as unknown[] | undefined;
    check(
      'C3-11: GET /crm/attendance/manual-mode inclui lead em modo manual',
      Array.isArray(records) && records.some((l) => (l as Record<string, unknown>).lead_id === lead_id),
      `count=${records?.length}`,
    );
  }

  // Case-file antes do reset — deve ter override_log
  {
    const r = await get(`/crm/leads/${lead_id}/case-file`, DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    const overrideLog = record?.override_log as unknown[] | undefined;
    check('C3-12: GET /crm/leads/:id/case-file → 200', r.status === 200, `status=${r.status}`);
    check(
      'C3-13: case-file override_log tem 1+ entrada',
      Array.isArray(overrideLog) && overrideLog.length >= 1,
      `override_log.length=${overrideLog?.length}`,
    );
    check(
      'C3-14: case-file lead manual_mode:true após ativação',
      (record?.lead as Record<string, unknown>)?.manual_mode === true,
    );
  }

  // Reset
  {
    const r = await post(
      `/crm/leads/${lead_id}/reset`,
      { operator_id: 'op-prova-e2e', reason: 'Reset de prova E2E T8.6' },
      DEV_ENV,
      DEV_KEY,
    );
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    check('C3-15: POST /crm/leads/:id/reset → 200', r.status === 200, `status=${r.status}`);
    check('C3-16: reset retorna override_id (entrada na trilha)', typeof record?.override_id === 'string');
    check('C3-17: override_type:status_change', record?.override_type === 'status_change');
  }

  // Case-file pós-reset — auditoria preservada
  {
    const r = await get(`/crm/leads/${lead_id}/case-file`, DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    const overrideLog = record?.override_log as unknown[] | undefined;
    const lead = record?.lead as Record<string, unknown> | undefined;
    check(
      'C3-18: pós-reset override_log tem 2+ entradas (auditoria preservada)',
      Array.isArray(overrideLog) && overrideLog.length >= 2,
      `override_log.length=${overrideLog?.length}`,
    );
    check(
      'C3-19: pós-reset manual_mode:false (reset desativou)',
      lead?.manual_mode === false,
      `manual_mode=${lead?.manual_mode}`,
    );
  }

  // Criar lead sem dados → 400
  {
    const r = await post('/crm/leads', {}, DEV_ENV, DEV_KEY);
    check('C3-20: POST /crm/leads sem dados → 400', r.status === 400, `status=${r.status}`);
  }

  return lead_id;
}

// ---------------------------------------------------------------------------
// C4 — 7 abas do painel
// ---------------------------------------------------------------------------

async function c4_panel_tabs(): Promise<void> {
  // HTML contém as 7 abas
  {
    const r = await get('/panel', {});
    const html = await r.text();
    const tabs = ['Conversas', 'Bases', 'Atendimento', 'CRM', 'Dashboard', 'Incidentes', 'ENOVA IA'];
    for (const tab of tabs) {
      check(`C4-01..07: painel HTML contém aba "${tab}"`, html.includes(tab));
    }
  }

  // Cada aba tem endpoint funcional
  const endpoints: [string, string][] = [
    ['C4-08', '/crm/conversations'],
    ['C4-09', '/crm/bases'],
    ['C4-10', '/crm/bases/status'],
    ['C4-11', '/crm/attendance'],
    ['C4-12', '/crm/attendance/pending'],
    ['C4-13', '/crm/attendance/manual-mode'],
    ['C4-14', '/crm/dashboard'],
    ['C4-15', '/crm/incidents'],
    ['C4-16', '/crm/incidents/summary'],
    ['C4-17', '/crm/enova-ia/status'],
    ['C4-18', '/crm/enova-ia/runtime'],
  ];

  for (const [id, path] of endpoints) {
    const r = await get(path, DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    check(`${id}: GET ${path} → ok:true`, body?.ok === true, `status=${r.status}`);
  }
}

// ---------------------------------------------------------------------------
// C5 — Flags real_*:false
// ---------------------------------------------------------------------------

async function c5_real_flags(): Promise<void> {
  // /crm/health
  {
    const r = await get('/crm/health', DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    check('C5-01: /crm/health real_supabase:false', body?.real_supabase === false);
    check('C5-02: /crm/health real_llm:false', body?.real_llm === false);
    check('C5-03: /crm/health real_whatsapp:false', body?.real_whatsapp === false);
  }

  // /crm/enova-ia/status (usa llm_real/supabase_real/whatsapp_real por convenção da aba ENOVA IA)
  {
    const r = await get('/crm/enova-ia/status', DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    check('C5-04: /crm/enova-ia/status llm_real:false', record?.llm_real === false);
    check('C5-05: /crm/enova-ia/status supabase_real:false', record?.supabase_real === false);
    check('C5-06: /crm/enova-ia/status whatsapp_real:false', record?.whatsapp_real === false);
  }

  // /crm/enova-ia/runtime
  {
    const r = await get('/crm/enova-ia/runtime', DEV_ENV, DEV_KEY);
    const body = (await json(r)) as Record<string, unknown>;
    const record = body?.record as Record<string, unknown> | undefined;
    check('C5-07: /crm/enova-ia/runtime real_llm:false', record?.real_llm === false);
    check('C5-08: /crm/enova-ia/runtime real_supabase:false', record?.real_supabase === false);
    check('C5-09: /crm/enova-ia/runtime real_whatsapp:false', record?.real_whatsapp === false);
  }

  // /panel HTML declara as flags
  {
    const r = await get('/panel', {});
    const html = await r.text();
    check('C5-10: painel HTML declara real_supabase', html.includes('real_supabase'));
    check('C5-11: painel HTML declara real_llm', html.includes('real_llm'));
    check('C5-12: painel HTML declara real_whatsapp', html.includes('real_whatsapp'));
  }
}

// ---------------------------------------------------------------------------
// C6 — Restrições invioláveis
// ---------------------------------------------------------------------------

async function c6_invariants(): Promise<void> {
  // reply_text ausente em todos os endpoints relevantes
  for (const [id, path] of [
    ['C6-01', '/crm/health'],
    ['C6-02', '/crm/leads'],
    ['C6-03', '/crm/conversations'],
    ['C6-04', '/crm/enova-ia/status'],
  ] as [string, string][]) {
    const r = await get(path, DEV_ENV, DEV_KEY);
    const text = await r.text();
    check(`${id}: ${path} não contém reply_text`, !text.includes('reply_text'), `path=${path}`);
  }

  // stage_current não é decidido pelo CRM (não aparece como chave de decisão)
  {
    const r = await get('/crm/enova-ia/status', DEV_ENV, DEV_KEY);
    const text = await r.text();
    // stage_current pode aparecer como documentação, mas não como campo de decision
    check(
      'C6-05: /crm/enova-ia/status não toma decisão de stage (sem decide_stage)',
      !text.includes('decide_stage'),
    );
  }

  // Métodos incorretos rejeitados
  {
    const r = await post('/panel', {}, {});
    check('C6-06: POST /panel → 405', r.status === 405, `status=${r.status}`);
  }

  {
    const r = await get('/panel/sub-rota-inexistente', {});
    check('C6-07: GET /panel/sub → 404', r.status === 404, `status=${r.status}`);
  }

  {
    const r = await put('/crm/leads', {}, DEV_ENV, DEV_KEY);
    check('C6-08: PUT /crm/leads → 405', r.status === 405, `status=${r.status}`);
  }

  {
    const r = await put('/crm/conversations', {}, DEV_ENV, DEV_KEY);
    check('C6-09: PUT /crm/conversations → 405', r.status === 405, `status=${r.status}`);
  }

  // Lead não encontrado → 404
  {
    const r = await get('/crm/leads/lead-inexistente-xyz/case-file', DEV_ENV, DEV_KEY);
    check('C6-10: case-file de lead inexistente → 404', r.status === 404, `status=${r.status}`);
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function run() {
  console.log('=== PR-T8.6 — Prova E2E CRM ponta a ponta ===');
  console.log('');

  console.log('--- C1: Health e rotas de painel ---');
  await c1_health_and_panel();

  console.log('--- C2: Auth ---');
  await c2_auth();

  console.log('--- C3: Fluxo CRM completo ---');
  await c3_crm_flow();

  console.log('--- C4: 7 abas do painel ---');
  await c4_panel_tabs();

  console.log('--- C5: Flags real_*:false ---');
  await c5_real_flags();

  console.log('--- C6: Restrições invioláveis ---');
  await c6_invariants();

  // Relatório
  console.log('');
  console.log('=== RESULTADO ===');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  for (const r of results) {
    const icon = r.passed ? 'PASS' : 'FAIL';
    const detail = r.detail ? ` (${r.detail})` : '';
    console.log(`[${icon}] ${r.name}${detail}`);
  }

  console.log('---');
  console.log(`${passed}/${results.length} checks passed; ${failed} failed.`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('E2E smoke failed:', err);
  process.exit(1);
});
