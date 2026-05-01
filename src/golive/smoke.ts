/**
 * ENOVA 2 — PR-T8.15 — Smoke operacional de go-live
 *
 * Cobre:
 *  1.  Default seguro bloqueia operação real
 *  2.  ROLLBACK_FLAG=true bloqueia tudo
 *  3.  MAINTENANCE_MODE=true bloqueia atendimento
 *  4.  ENOVA2_ENABLED=false bloqueia
 *  5.  CLIENT_REAL_ENABLED=false bloqueia cliente real
 *  6.  LLM_REAL_ENABLED=false bloqueia LLM real
 *  7.  CHANNEL_ENABLED=false bloqueia canal real
 *  8.  META_OUTBOUND_ENABLED=false bloqueia outbound
 *  9.  CANARY_PERCENT=0 bloqueia tráfego real acima de 0
 * 10.  Status informa Meta bloqueada (T8.12B)
 * 11.  G8 NÃO permitido enquanto Meta bloqueada
 * 12.  Sem secret no output de health
 * 13.  GET /__admin__/go-live/health retorna 200 com readiness
 * 14.  401 sem auth
 * 15.  405 com método errado
 * 16.  Flags totalmente ativas desbloqueiam (exceto Meta externa)
 * 17.  readCanonicalFlags parseia CANARY_PERCENT corretamente
 * 18.  isFullGoLiveAllowed retorna blocked por default
 */

import worker from '../worker.ts';
import { readCanonicalFlags } from './flags.ts';
import { isOperationallyAllowed, isFullGoLiveAllowed } from './rollback.ts';
import { evaluateGoLiveReadiness } from './harness.ts';

interface Assertion {
  label: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
}

interface ScenarioResult {
  id: string;
  name: string;
  passed: boolean;
  assertions: Assertion[];
}

function expect(label: string, expected: unknown, actual: unknown): Assertion {
  return { label, passed: JSON.stringify(expected) === JSON.stringify(actual), expected, actual };
}

function expectTrue(label: string, cond: boolean): Assertion {
  return { label, passed: cond === true, expected: true, actual: cond };
}

function expectContains(label: string, haystack: string[], needle: string): Assertion {
  const found = haystack.some((s) => s.includes(needle));
  return { label, passed: found, expected: `contains "${needle}"`, actual: found ? 'found' : 'not found' };
}

function expectNotContains(label: string, text: string, forbidden: string): Assertion {
  const found = text.includes(forbidden);
  return { label, passed: !found, expected: `no "${forbidden}"`, actual: found ? 'PRESENT' : 'absent' };
}

function run(id: string, name: string, build: () => Assertion[]): ScenarioResult {
  const assertions = build();
  return { id, name, passed: assertions.every((a) => a.passed), assertions };
}

async function runAsync(id: string, name: string, build: () => Promise<Assertion[]>): Promise<ScenarioResult> {
  const assertions = await build();
  return { id, name, passed: assertions.every((a) => a.passed), assertions };
}

const ADMIN_ENV = { CRM_ALLOW_DEV_TOKEN: 'true' };
const ADMIN_KEY = 'dev-crm-local';

async function callHealth(
  envExtra: Record<string, unknown> = {},
  withAuth = true,
  method = 'GET',
): Promise<{ status: number; body: unknown; text: string }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (withAuth) headers['x-crm-admin-key'] = ADMIN_KEY;
  const req = new Request('https://smoke.local/__admin__/go-live/health', { method, headers });
  const res = await worker.fetch(req, { ...ADMIN_ENV, ...envExtra });
  const text = await res.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, text };
}

async function main() {
  const results: ScenarioResult[] = [];

  // 1 — Default seguro
  results.push(run('1', 'Default seguro bloqueia operação real', () => {
    const dec = isOperationallyAllowed({}, {
      require_enova2: true,
      require_client_real: true,
      require_llm_real: true,
      require_channel: true,
      require_meta_outbound: true,
    });
    return [
      expect('allowed=false por default', false, dec.allowed),
      expectTrue('blocking_reasons não vazio', dec.blocking_reasons.length > 0),
      expect('rollback_active=false por default', false, dec.rollback_active),
      expect('maintenance_active=false por default', false, dec.maintenance_active),
    ];
  }));

  // 2 — ROLLBACK_FLAG
  results.push(run('2', 'ROLLBACK_FLAG=true bloqueia tudo', () => {
    const dec = isOperationallyAllowed({ ROLLBACK_FLAG: 'true' }, {});
    const full = isFullGoLiveAllowed({ ROLLBACK_FLAG: 'true', ENOVA2_ENABLED: 'true', CLIENT_REAL_ENABLED: 'true', LLM_REAL_ENABLED: 'true', CHANNEL_ENABLED: 'true', META_OUTBOUND_ENABLED: 'true', CANARY_PERCENT: '50' });
    return [
      expect('rollback_active=true', true, dec.rollback_active),
      expectTrue('reasons inclui ROLLBACK_FLAG', dec.blocking_reasons.some((r) => r.includes('ROLLBACK_FLAG'))),
      expect('isFullGoLiveAllowed blocked', false, full.allowed),
      expect('rollback_active em full=true', true, full.rollback_active),
    ];
  }));

  // 3 — MAINTENANCE_MODE
  results.push(run('3', 'MAINTENANCE_MODE=true bloqueia atendimento', () => {
    const dec = isOperationallyAllowed({ MAINTENANCE_MODE: 'true' }, {});
    return [
      expect('maintenance_active=true', true, dec.maintenance_active),
      expectTrue('reasons inclui MAINTENANCE_MODE', dec.blocking_reasons.some((r) => r.includes('MAINTENANCE_MODE'))),
    ];
  }));

  // 4 — ENOVA2_ENABLED=false
  results.push(run('4', 'ENOVA2_ENABLED=false bloqueia', () => {
    const dec = isOperationallyAllowed({ ENOVA2_ENABLED: 'false' }, { require_enova2: true });
    return [
      expect('allowed=false', false, dec.allowed),
      expectTrue('reasons inclui ENOVA2_ENABLED', dec.blocking_reasons.some((r) => r.includes('ENOVA2_ENABLED'))),
    ];
  }));

  // 5 — CLIENT_REAL_ENABLED=false
  results.push(run('5', 'CLIENT_REAL_ENABLED=false bloqueia cliente real', () => {
    const dec = isOperationallyAllowed({ ENOVA2_ENABLED: 'true' }, { require_enova2: true, require_client_real: true });
    return [
      expect('allowed=false', false, dec.allowed),
      expectTrue('reasons inclui CLIENT_REAL_ENABLED', dec.blocking_reasons.some((r) => r.includes('CLIENT_REAL_ENABLED'))),
    ];
  }));

  // 6 — LLM_REAL_ENABLED=false
  results.push(run('6', 'LLM_REAL_ENABLED=false bloqueia LLM real', () => {
    const dec = isOperationallyAllowed({ ENOVA2_ENABLED: 'true' }, { require_enova2: true, require_llm_real: true });
    return [
      expect('allowed=false', false, dec.allowed),
      expectTrue('reasons inclui LLM_REAL_ENABLED', dec.blocking_reasons.some((r) => r.includes('LLM_REAL_ENABLED'))),
    ];
  }));

  // 7 — CHANNEL_ENABLED=false
  results.push(run('7', 'CHANNEL_ENABLED=false bloqueia canal real', () => {
    const dec = isOperationallyAllowed({ ENOVA2_ENABLED: 'true' }, { require_enova2: true, require_channel: true });
    return [
      expect('allowed=false', false, dec.allowed),
      expectTrue('reasons inclui CHANNEL_ENABLED', dec.blocking_reasons.some((r) => r.includes('CHANNEL_ENABLED'))),
    ];
  }));

  // 8 — META_OUTBOUND_ENABLED=false
  results.push(run('8', 'META_OUTBOUND_ENABLED=false bloqueia outbound', () => {
    const dec = isOperationallyAllowed({ ENOVA2_ENABLED: 'true' }, { require_enova2: true, require_meta_outbound: true });
    return [
      expect('allowed=false', false, dec.allowed),
      expectTrue('reasons inclui META_OUTBOUND_ENABLED', dec.blocking_reasons.some((r) => r.includes('META_OUTBOUND_ENABLED'))),
    ];
  }));

  // 9 — CANARY_PERCENT=0
  results.push(run('9', 'CANARY_PERCENT=0 bloqueia tráfego real acima de 0', () => {
    const flags = readCanonicalFlags({ CANARY_PERCENT: '0' });
    const dec = isOperationallyAllowed({}, { require_canary_above: 10 });
    return [
      expect('canary_percent=0', 0, flags.canary_percent),
      expect('allowed=false', false, dec.allowed),
      expectTrue('reasons inclui CANARY_PERCENT', dec.blocking_reasons.some((r) => r.includes('CANARY_PERCENT'))),
    ];
  }));

  // 10 — Meta bloqueada no harness
  results.push(run('10', 'Status informa Meta bloqueada (T8.12B)', () => {
    const r = evaluateGoLiveReadiness({});
    return [
      expect('meta_ready=false', false, r.meta_ready),
      expectContains('blocking_reasons inclui Meta/WhatsApp', r.blocking_reasons, 'Meta/WhatsApp BLOQUEADA_AGUARDANDO_VASQUES'),
      expect('details.meta_status', 'BLOQUEADA_AGUARDANDO_VASQUES', r.details['meta_status']),
    ];
  }));

  // 11 — G8 bloqueado
  results.push(run('11', 'G8 NÃO permitido enquanto Meta bloqueada', () => {
    const r = evaluateGoLiveReadiness({});
    const fullEnv = {
      ENOVA2_ENABLED: 'true', CHANNEL_ENABLED: 'true', META_OUTBOUND_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true', CLIENT_REAL_ENABLED: 'true', CANARY_PERCENT: '50',
    };
    const rFull = evaluateGoLiveReadiness(fullEnv);
    return [
      expect('g8_allowed=false sem flags', false, r.g8_allowed),
      expect('g8_allowed=false mesmo com flags (Meta bloqueada)', false, rFull.g8_allowed),
      expectContains('G8 blocking reason presente', rFull.blocking_reasons, 'BLOQUEADA_AGUARDANDO_VASQUES'),
    ];
  }));

  // 12 — Sem secret no output
  results.push(await runAsync('12', 'Sem secret no output de health', async () => {
    const { text } = await callHealth({ META_APP_SECRET: 'top-secret', OPENAI_API_KEY: 'sk-real', SUPABASE_SERVICE_ROLE_KEY: 'sbp_secret' });
    return [
      expectNotContains('sem META_APP_SECRET', text, 'top-secret'),
      expectNotContains('sem OPENAI_API_KEY', text, 'sk-real'),
      expectNotContains('sem SUPABASE_SERVICE_ROLE_KEY', text, 'sbp_secret'),
      expectNotContains('sem Bearer', text, 'Bearer'),
    ];
  }));

  // 13 — GET health retorna 200
  results.push(await runAsync('13', 'GET /__admin__/go-live/health retorna 200 com readiness', async () => {
    const { status, body } = await callHealth();
    const b = body as any;
    return [
      expect('status 200', 200, status),
      expect('ok=true', true, b?.ok),
      expectTrue('readiness presente', typeof b?.readiness === 'object'),
      expectTrue('g8.allowed presente', 'allowed' in (b?.g8 ?? {})),
      expectTrue('blocking_reasons array', Array.isArray(b?.blocking_reasons)),
      expectTrue('flags presente', typeof b?.flags === 'object'),
      expectTrue('operations presente', typeof b?.operations === 'object'),
    ];
  }));

  // 14 — 401 sem auth
  results.push(await runAsync('14', '401 sem X-CRM-Admin-Key', async () => {
    const { status } = await callHealth({}, false);
    return [expect('status 401', 401, status)];
  }));

  // 15 — 405 método errado
  results.push(await runAsync('15', '405 com POST no health', async () => {
    const { status } = await callHealth({}, true, 'POST');
    return [expect('status 405', 405, status)];
  }));

  // 16 — Flags ativas desbloqueiam operações (exceto Meta externa)
  results.push(run('16', 'Flags ativas desbloqueiam operações internas', () => {
    const env = {
      ENOVA2_ENABLED: 'true',
      CHANNEL_ENABLED: 'true',
      META_OUTBOUND_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true',
      CLIENT_REAL_ENABLED: 'true',
      CANARY_PERCENT: '50',
    };
    const dec = isOperationallyAllowed(env, {
      require_enova2: true,
      require_channel: true,
      require_meta_outbound: true,
      require_llm_real: true,
      require_client_real: true,
      require_canary_above: 10,
    });
    return [
      expect('allowed=true com todas as flags', true, dec.allowed),
      expect('blocking_reasons vazio', 0, dec.blocking_reasons.length),
    ];
  }));

  // 17 — CANARY_PERCENT parsing
  results.push(run('17', 'readCanonicalFlags parseia CANARY_PERCENT corretamente', () => {
    const f0 = readCanonicalFlags({});
    const f50 = readCanonicalFlags({ CANARY_PERCENT: '50' });
    const fInvalid = readCanonicalFlags({ CANARY_PERCENT: 'abc' });
    const fOver = readCanonicalFlags({ CANARY_PERCENT: '200' });
    return [
      expect('ausente → 0', 0, f0.canary_percent),
      expect("'50' → 50", 50, f50.canary_percent),
      expect("'abc' → 0 (inválido)", 0, fInvalid.canary_percent),
      expect("'200' → 0 (fora de 0-100)", 0, fOver.canary_percent),
    ];
  }));

  // 18 — isFullGoLiveAllowed blocked by default
  results.push(run('18', 'isFullGoLiveAllowed retorna blocked por default', () => {
    const dec = isFullGoLiveAllowed({});
    return [
      expect('allowed=false', false, dec.allowed),
      expectTrue('blocking_reasons não vazio', dec.blocking_reasons.length > 0),
    ];
  }));

  // ---------------------------------------------------------------------------
  // Sumário
  // ---------------------------------------------------------------------------

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  for (const r of results) {
    const icon = r.passed ? '[PASS]' : '[FAIL]';
    console.log(`${icon} ${r.id}. ${r.name}`);
    for (const a of r.assertions) {
      const icon2 = a.passed ? '  ok' : '  FAIL';
      if (!a.passed) {
        console.log(`${icon2} ${a.label}: expected=${JSON.stringify(a.expected)} actual=${JSON.stringify(a.actual)}`);
      } else {
        console.log(`${icon2} ${a.label}`);
      }
    }
  }

  console.log('');
  console.log('========================================');
  console.log('PR-T8.15 Smoke go-live operacional');
  console.log(`PASS: ${passed} | FAIL: ${failed}`);
  console.log(`STATUS: ${failed === 0 ? 'PASSOU' : 'FALHOU'}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
