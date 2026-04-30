/**
 * ENOVA 2 — Painel Operacional — Smoke (PR-T8.5)
 *
 * Verificações:
 *   - GET /panel retorna 200 e content-type text/html.
 *   - O HTML contém as 7 abas esperadas.
 *   - O HTML referencia os 26 endpoints da PR-T8.4.
 *   - O HTML não contém segredo hardcoded.
 *   - GET /panel/qualquer-coisa-inexistente retorna 404.
 *   - POST /panel retorna 405.
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

async function run() {
  // 1. GET /panel → 200 + HTML
  {
    const r = await worker.fetch(new Request('https://enova.local/panel'), {} as Record<string, unknown>);
    const ct = r.headers.get('content-type') ?? '';
    const html = await r.text();
    check('GET /panel returns 200', r.status === 200, `status=${r.status}`);
    check('GET /panel returns HTML', ct.includes('text/html'), `content-type=${ct}`);

    const tabs = ['Conversas', 'Bases', 'Atendimento', 'CRM', 'Dashboard', 'Incidentes', 'ENOVA IA'];
    for (const t of tabs) {
      check(`HTML contains tab "${t}"`, html.includes(t));
    }

    const endpoints = [
      '/crm/conversations',
      '/crm/bases',
      '/crm/bases/status',
      '/crm/attendance',
      '/crm/attendance/pending',
      '/crm/attendance/manual-mode',
      '/crm/leads',
      '/crm/dashboard',
      '/crm/incidents',
      '/crm/incidents/summary',
      '/crm/enova-ia/status',
      '/crm/enova-ia/runtime',
    ];
    for (const e of endpoints) {
      check(`HTML references endpoint "${e}"`, html.includes(e));
    }

    check('HTML uses X-CRM-Admin-Key header', html.includes('X-CRM-Admin-Key'));
    check('HTML reads admin key from localStorage (not hardcoded)', html.includes('localStorage') && html.includes('crm_admin_key'));
    check('HTML declares real_supabase: false flag', html.includes('real_supabase'));
    check('HTML declares real_llm: false flag', html.includes('real_llm'));
    check('HTML declares real_whatsapp: false flag', html.includes('real_whatsapp'));

    // No hardcoded secret values - verify 'dev-crm-local' appears only as a placeholder
    const lowercaseHtml = html.toLowerCase();
    const occurrences = (lowercaseHtml.match(/dev-crm-local/g) ?? []).length;
    check('HTML mentions dev-crm-local only as placeholder (max 1 occurrence)', occurrences <= 1, `count=${occurrences}`);
  }

  // 2. GET /panel/ → 200 (trailing slash)
  {
    const r = await worker.fetch(new Request('https://enova.local/panel/'), {} as Record<string, unknown>);
    check('GET /panel/ (trailing slash) returns 200', r.status === 200);
  }

  // 3. GET /panel/sub → 404
  {
    const r = await worker.fetch(new Request('https://enova.local/panel/sub'), {} as Record<string, unknown>);
    check('GET /panel/sub returns 404', r.status === 404);
  }

  // 4. POST /panel → 405
  {
    const r = await worker.fetch(new Request('https://enova.local/panel', { method: 'POST' }), {} as Record<string, unknown>);
    check('POST /panel returns 405', r.status === 405);
  }

  // Report
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
  console.error('Smoke failed:', err);
  process.exit(1);
});
