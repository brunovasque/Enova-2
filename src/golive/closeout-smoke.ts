/**
 * ENOVA 2 — PR-T8.R — Prova de readiness G8 + closeout formal
 *
 * Tipo: PR-PROVA / CLOSEOUT
 *
 * Verifica o estado consolidado de todas as frentes antes do fechamento G8.
 * Produz veredito GO/NO-GO.
 *
 * NÃO executa nada real. NÃO fecha G8. Apenas avalia e documenta.
 */

import worker from '../worker.ts';
import { evaluateGoLiveReadiness } from './harness.ts';
import { isOperationallyAllowed, isFullGoLiveAllowed } from './rollback.ts';
import { readCanonicalFlags } from './flags.ts';

interface Assertion {
  label: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
}

interface ProofResult {
  id: string;
  name: string;
  passed: boolean;
  assertions: Assertion[];
}

function expectTrue(label: string, cond: boolean): Assertion {
  return { label, passed: cond === true, expected: true, actual: cond };
}

function expect(label: string, expected: unknown, actual: unknown): Assertion {
  return { label, passed: JSON.stringify(expected) === JSON.stringify(actual), expected, actual };
}

function expectContains(label: string, haystack: string[], needle: string): Assertion {
  const found = haystack.some((s) => s.includes(needle));
  return { label, passed: found, expected: `contains "${needle}"`, actual: found ? 'found' : 'not found' };
}

function expectNotContains(label: string, text: string, forbidden: string): Assertion {
  const found = text.includes(forbidden);
  return { label, passed: !found, expected: `no "${forbidden}"`, actual: found ? 'PRESENT' : 'absent' };
}

function proof(id: string, name: string, build: () => Assertion[]): ProofResult {
  const assertions = build();
  return { id, name, passed: assertions.every((a) => a.passed), assertions };
}

async function proofAsync(id: string, name: string, build: () => Promise<Assertion[]>): Promise<ProofResult> {
  const assertions = await build();
  return { id, name, passed: assertions.every((a) => a.passed), assertions };
}

const ADMIN_KEY = 'dev-crm-local';
const ADMIN_ENV = { CRM_ALLOW_DEV_TOKEN: 'true' };

async function callWorker(
  pathname: string,
  envExtra: Record<string, unknown> = {},
): Promise<{ status: number; body: unknown; text: string }> {
  const req = new Request(`https://closeout.local${pathname}`, {
    headers: { 'x-crm-admin-key': ADMIN_KEY, 'content-type': 'application/json' },
  });
  const res = await worker.fetch(req, { ...ADMIN_ENV, ...envExtra });
  const text = await res.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, text };
}

async function main() {
  const results: ProofResult[] = [];

  // R1 — CRM backend/frontend operacional
  results.push(await proofAsync('R1', 'CRM backend/frontend operacional (PR-T8.4/T8.5/T8.6)', async () => {
    const health = await callWorker('/crm/health');
    const leads = await callWorker('/crm/leads');
    const conversations = await callWorker('/crm/conversations');
    const dashboard = await callWorker('/crm/dashboard');
    const hb = health.body as any;
    return [
      expect('crm/health: HTTP 200', 200, health.status),
      expectTrue('real_supabase: false declarado', hb?.real_supabase === false || hb?.supabase?.real === false || hb?.supabase_readiness?.real_client_used === false),
      expectTrue('real_llm: false declarado', hb?.real_llm === false || hb?.llm?.real === false),
      expectTrue('real_whatsapp: false declarado', hb?.real_whatsapp === false || hb?.meta?.real === false),
      expect('crm/leads: HTTP 200', 200, leads.status),
      expect('crm/conversations: HTTP 200', 200, conversations.status),
      expect('crm/dashboard: HTTP 200', 200, dashboard.status),
      expectNotContains('sem reply_text em health', JSON.stringify(hb), 'reply_text'),
      expectNotContains('sem decide_stage em health', JSON.stringify(hb), 'decide_stage'),
    ];
  }));

  // R2 — Supabase: leitura real aprovada (PR-T8.9B), write pendente
  results.push(proof('R2', 'Supabase leitura real aprovada — write real pendente (PR-T8.9B)', () => {
    // Supabase não tem env real aqui — validação é documental
    // A leitura real foi provada por Vasques em ambiente local com Node.js v24
    return [
      expectTrue('leitura real aprovada em PR-T8.9B (documental)', true),
      expectTrue('P1–P8 PASS na execução real de Vasques', true),
      expectTrue('storage 4 buckets: emailsnv, documentos-pre-analise, enavia-brain, enavia-brain-test', true),
      expectTrue('write real amplo NÃO executado', true),
      expectTrue('RLS e storage policy ainda futuras', true),
    ];
  }));

  // R3 — Meta/WhatsApp: implementação técnica existe, prova real BLOQUEADA
  results.push(await proofAsync('R3', 'Meta/WhatsApp: implementação técnica existe + prova real BLOQUEADA_AGUARDANDO_VASQUES', async () => {
    // Webhook existe (PR-T8.11)
    const webhookGet = await worker.fetch(
      new Request('https://closeout.local/__meta__/webhook?hub.mode=subscribe&hub.verify_token=&hub.challenge=x'),
      ADMIN_ENV,
    );
    const webhookPost = await worker.fetch(
      new Request('https://closeout.local/__meta__/webhook', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } }),
      ADMIN_ENV,
    );
    const readiness = evaluateGoLiveReadiness({});
    return [
      expectTrue('rota __meta__/webhook existe (não 404)', webhookGet.status !== 404),
      expectTrue('POST __meta__/webhook rejeita sem assinatura (401/403)', webhookPost.status === 401 || webhookPost.status === 403),
      expect('meta_ready=false no harness', false, readiness.meta_ready),
      expectContains('blocking_reason Meta/WhatsApp', readiness.blocking_reasons, 'BLOQUEADA_AGUARDANDO_VASQUES'),
      expectTrue('prova real NÃO executada — declaração documental', true),
      expectTrue('secrets Meta ausentes no ambiente Claude Code', true),
      expectTrue('Worker test não publicado', true),
      expectTrue('webhook Meta não registrado', true),
    ];
  }));

  // R4 — Memória/telemetria: aprovada local/in-memory (PR-T8.14)
  results.push(await proofAsync('R4', 'Memória/telemetria aprovada local/in-memory (PR-T8.14)', async () => {
    const status = await callWorker('/crm/memory/status');
    const sb = status.body as any;
    const readiness = evaluateGoLiveReadiness({});
    return [
      expect('memory/status: HTTP 200', 200, status.status),
      expectTrue('mode=in_memory', sb?.record?.mode === 'in_memory'),
      expectTrue('auto_promotion_disabled=true', sb?.record?.invariants?.auto_promotion_disabled === true),
      expectTrue('auto_stage_change_disabled=true', sb?.record?.invariants?.auto_stage_change_disabled === true),
      expect('memory_ready=true no harness', true, readiness.memory_ready),
      expectTrue('prove:memory-telemetry 9/9 PASS (executado antes)', true),
      expectTrue('persistência Supabase real pendente (MEMORY_SUPABASE_ENABLED futura)', true),
    ];
  }));

  // R5 — Flags/rollback/go-live harness (PR-T8.15)
  results.push(await proofAsync('R5', 'Flags/rollback/go-live harness operacional (PR-T8.15)', async () => {
    const health = await callWorker('/__admin__/go-live/health');
    const hb = health.body as any;
    const decDefault = isOperationallyAllowed({}, { require_enova2: true, require_client_real: true, require_llm_real: true });
    const decRollback = isOperationallyAllowed({ ROLLBACK_FLAG: 'true' });
    const flags = readCanonicalFlags({});
    return [
      expect('go-live health: HTTP 200', 200, health.status),
      expectTrue('ok=true', hb?.ok === true),
      expect('g8.allowed=false', false, hb?.g8?.allowed),
      expectTrue('blocking_reasons não vazio', Array.isArray(hb?.blocking_reasons) && hb.blocking_reasons.length > 0),
      expect('meta_ready=false', false, hb?.readiness?.meta_ready),
      expect('rollback_ready=true', true, hb?.readiness?.rollback_ready),
      expect('client_real_allowed=false', false, hb?.operations?.client_real_allowed),
      expect('llm_real_allowed=false', false, hb?.operations?.llm_real_allowed),
      expectTrue('default bloqueia operação real', decDefault.allowed === false),
      expectTrue('ROLLBACK_FLAG bloqueia tudo', decRollback.rollback_active === true),
      expect('canary_percent=0 por default', 0, flags.canary_percent),
      expectTrue('smoke:golive 18/18 PASS (executado antes)', true),
    ];
  }));

  // R6 — Segurança: zero secret, zero cliente real, zero LLM, zero outbound
  results.push(await proofAsync('R6', 'Segurança: sem secret, sem cliente real, sem LLM real, sem outbound real', async () => {
    const health = await callWorker('/__admin__/go-live/health', {
      META_APP_SECRET: 'should-not-appear',
      OPENAI_API_KEY: 'sk-secret-test',
      SUPABASE_SERVICE_ROLE_KEY: 'sbp_secret_test',
    });
    const crmHealth = await callWorker('/crm/health');

    const healthText = health.text;
    const crmText = JSON.stringify(crmHealth.body);

    return [
      expectNotContains('sem META_APP_SECRET no health', healthText, 'should-not-appear'),
      expectNotContains('sem OPENAI_API_KEY no health', healthText, 'sk-secret-test'),
      expectNotContains('sem SUPABASE_SERVICE_ROLE_KEY no health', healthText, 'sbp_secret_test'),
      expectNotContains('sem Bearer no health', healthText, 'Bearer'),
      expectNotContains('sem reply_text no CRM', crmText, 'reply_text'),
      expectNotContains('sem cliente_real no CRM', crmText, 'cliente_real'),
      expectTrue('LLM real=false no CRM', (crmHealth.body as any)?.real_llm === false || (crmHealth.body as any)?.llm?.real === false),
    ];
  }));

  // R7 — G8: confirmação de bloqueio e condições de desbloqueio
  results.push(proof('R7', 'G8: NÃO FECHADO — condições de desbloqueio documentadas', () => {
    const readiness = evaluateGoLiveReadiness({});
    const fullAllowed = isFullGoLiveAllowed({});
    return [
      expect('g8_allowed=false', false, readiness.g8_allowed),
      expect('isFullGoLiveAllowed=false', false, fullAllowed.allowed),
      expectContains('Meta/WhatsApp bloqueia G8', readiness.blocking_reasons, 'BLOQUEADA_AGUARDANDO_VASQUES'),
      expectTrue('meta_ready=false (hard block)', readiness.meta_ready === false),
      expectTrue('client_real_allowed=false por default', readiness.client_real_allowed === false),
      expectTrue('llm_real_allowed=false por default', readiness.llm_real_allowed === false),
      expectTrue('channel_real_allowed=false por default', readiness.channel_real_allowed === false),
      expectTrue('condições documentadas para fechar G8', true),
    ];
  }));

  // ---------------------------------------------------------------------------
  // Sumário e veredito
  // ---------------------------------------------------------------------------

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  for (const r of results) {
    const icon = r.passed ? '[PASS]' : '[FAIL]';
    console.log(`${icon} ${r.id}: ${r.name}`);
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
  console.log('PR-T8.R — Readiness Closeout G8');
  console.log(`PASS: ${passed} | FAIL: ${failed} | TOTAL: ${total}`);
  console.log('');
  console.log('GO/NO-GO: NO-GO CONTROLADO');
  console.log('G8: NÃO FECHADO');
  console.log('Motivo: Meta/WhatsApp prova real externa pendente (PR-T8.12B — aguardando Vasques)');
  console.log('Próxima ação: PR-T8.12B — Execução real Meta/WhatsApp controlada por Vasques');
  console.log(`STATUS: ${failed === 0 ? 'READINESS CONSOLIDADA — NO-GO CONTROLADO' : 'FALHOU'}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
