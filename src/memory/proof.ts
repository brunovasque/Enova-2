/**
 * ENOVA 2 — PR-T8.14 — Prova memória + telemetria + regressão contratual
 *
 * Tipo: PR-PROVA
 * Esta prova executa e verifica todos os critérios de fechamento da frente
 * memória/telemetria conforme contrato T8 §4.2 e PR-T8.14.
 *
 * NÃO implementa nada novo. Apenas prova o que existe em src/memory/.
 */

import worker from '../worker.ts';
import {
  applyLearningDecision,
  createLearningCandidate,
  getMemoryStatus,
  listLearningCandidates,
  listMemoryByLead,
  memoryInvariants,
  registerMemoryEvent,
} from './service.ts';
import { resetSharedMemoryStore } from './store.ts';
import { isFieldNameSensitive, redactStringValue, sanitizeRecord, sanitizeText } from './sanitize.ts';
import { clearTelemetryBuffer, readTelemetryBuffer } from '../telemetry/emit.ts';

// ---------------------------------------------------------------------------
// Scaffolding de prova
// ---------------------------------------------------------------------------

interface ProofAssertion {
  label: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
}

interface ProofResult {
  id: string;
  name: string;
  passed: boolean;
  assertions: ProofAssertion[];
}

function expect(label: string, expected: unknown, actual: unknown): ProofAssertion {
  const passed = JSON.stringify(expected) === JSON.stringify(actual);
  return { label, passed, expected, actual };
}

function expectTrue(label: string, condition: boolean): ProofAssertion {
  return { label, passed: condition === true, expected: true, actual: condition };
}

function proof(id: string, name: string, build: () => ProofAssertion[]): ProofResult {
  const assertions = build();
  return { id, name, passed: assertions.every((a) => a.passed), assertions };
}

async function proofAsync(id: string, name: string, build: () => Promise<ProofAssertion[]>): Promise<ProofResult> {
  const assertions = await build();
  return { id, name, passed: assertions.every((a) => a.passed), assertions };
}

const ADMIN_KEY = 'dev-crm-local';
const ADMIN_ENV = { CRM_ALLOW_DEV_TOKEN: 'true' };

async function callMemory(
  pathname: string,
  init?: RequestInit,
  envExtra: Record<string, unknown> = {},
): Promise<{ status: number; body: unknown }> {
  const url = `https://proof.local${pathname}`;
  const req = new Request(url, {
    ...init,
    headers: {
      'x-crm-admin-key': ADMIN_KEY,
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const res = await worker.fetch(req, { ...ADMIN_ENV, ...envExtra });
  let body: unknown;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { status: res.status, body };
}

// ---------------------------------------------------------------------------
// Provas
// ---------------------------------------------------------------------------

async function main() {
  resetSharedMemoryStore();
  clearTelemetryBuffer();

  const results: ProofResult[] = [];

  // P1 — Evento de atendimento registrado e persistido
  results.push(proof('P1', 'Evento de atendimento salvo com categoria e status corretos', () => {
    const r = registerMemoryEvent({
      category: 'attendance_memory',
      event_type: 'attendance_started',
      source: 'crm',
      lead_ref: 'lead-proof-001',
      summary: 'atendimento iniciado pelo lead para prova P1',
      risk_level: 'low',
    });
    const byLead = listMemoryByLead('lead-proof-001');
    return [
      expectTrue('registerMemoryEvent retorna success', r.success === true),
      expect('category', 'attendance_memory', r.record?.category),
      expect('event_type', 'attendance_started', r.record?.event_type),
      expect('status inicial = draft', 'draft', r.record?.status),
      expect('lead_ref preservado', 'lead-proof-001', r.record?.lead_ref),
      expectTrue('id não vazio', typeof r.record?.id === 'string' && r.record.id.length > 0),
      expectTrue('listByLead retorna >= 1', byLead.count >= 1),
      expectTrue('registro aparece no lead', byLead.records.some((rec) => rec.id === r.record?.id)),
    ];
  }));

  // P2 — Insight candidato criado sempre como draft
  let candidateId = '';
  results.push(proof('P2', 'Insight candidato criado como draft — decisão nula', () => {
    const r = createLearningCandidate({
      source: 'core_runtime',
      lead_ref: 'lead-proof-001',
      summary: 'leads com objeção de parcela convertem 18% mais quando recebem simulação',
      hypothesis: 'oferecer simulação de parcela no primeiro turno melhora conversão',
      proposed_action: 'avaliar — NÃO ativar automaticamente',
      risk_level: 'medium',
    });
    candidateId = r.record?.id ?? '';
    return [
      expectTrue('success', r.success === true),
      expect('category', 'learning_candidate', r.record?.category),
      expect('status = draft', 'draft', r.record?.status),
      expect('decision_at = null', null, r.record?.decision_at),
      expect('decision_operator_id = null', null, r.record?.decision_operator_id),
      expect('decision_reason = null', null, r.record?.decision_reason),
      expectTrue('hypothesis preservada', typeof r.record?.hypothesis === 'string' && r.record.hypothesis.length > 0),
    ];
  }));

  // P3 — Candidato NÃO vira regra automaticamente
  results.push(proof('P3', 'Candidato NÃO promovido automaticamente — invariantes soberanas ativas', () => {
    const promoted = listLearningCandidates('promoted');
    const status = getMemoryStatus();
    const inv = memoryInvariants();
    return [
      expect('promoted count = 0', 0, promoted.count),
      expect('can_create_fact = false', false, inv.can_create_fact),
      expect('can_change_stage = false', false, inv.can_change_stage),
      expect('can_promote_automatically = false', false, inv.can_promote_automatically),
      expect('can_call_llm = false', false, inv.can_call_llm),
      expect('can_send_outbound = false', false, inv.can_send_outbound),
      expect('sanitization_required = true', true, inv.sanitization_required),
      expectTrue('status.auto_promotion_disabled', status.invariants.auto_promotion_disabled === true),
      expectTrue('status.auto_stage_change_disabled', status.invariants.auto_stage_change_disabled === true),
      expectTrue('status.auto_fact_creation_disabled', status.invariants.auto_fact_creation_disabled === true),
    ];
  }));

  // P4 — Decisão humana: validated, rejected, promoted
  results.push(proof('P4', 'Decisão humana exige operator_id + reason; muda status corretamente', () => {
    // criar 3 candidatos para testar validated / rejected / promoted
    const c1 = createLearningCandidate({
      source: 'crm', summary: 'candidato para validated', hypothesis: 'h1',
    });
    const c2 = createLearningCandidate({
      source: 'crm', summary: 'candidato para rejected', hypothesis: 'h2',
    });
    const c3 = createLearningCandidate({
      source: 'crm', summary: 'candidato para promoted', hypothesis: 'h3',
    });

    // falhas esperadas
    const noOp = applyLearningDecision(c1.record!.id, { decision: 'validated', operator_id: '', reason: 'r' });
    const noReason = applyLearningDecision(c1.record!.id, { decision: 'validated', operator_id: 'op-1', reason: '' });
    const badDecision = applyLearningDecision(c1.record!.id, { decision: 'unknown' as any, operator_id: 'op-1', reason: 'r' });

    // decisões válidas
    const dv = applyLearningDecision(c1.record!.id, { decision: 'validated', operator_id: 'operador-prova', reason: 'validado em prova T8.14' });
    const dr = applyLearningDecision(c2.record!.id, { decision: 'rejected', operator_id: 'operador-prova', reason: 'rejeitado em prova T8.14' });
    const dp = applyLearningDecision(c3.record!.id, { decision: 'promoted', operator_id: 'operador-prova', reason: 'promovido em prova T8.14' });

    return [
      expect('rejeita sem operator_id', false, noOp.success),
      expect('rejeita sem reason', false, noReason.success),
      expect('rejeita decision inválida', false, badDecision.success),
      expect('validated: success', true, dv.success),
      expect('validated: status', 'validated', dv.record?.status),
      expectTrue('validated: operator_id registrado', dv.record?.decision_operator_id === 'operador-prova'),
      expectTrue('validated: decision_at preenchido', typeof dv.record?.decision_at === 'string'),
      expect('rejected: success', true, dr.success),
      expect('rejected: status', 'rejected', dr.record?.status),
      expect('promoted: success', true, dp.success),
      expect('promoted: status', 'promoted', dp.record?.status),
    ];
  }));

  // P5 — Telemetria emite eventos de memória
  // event_name = `f7.${layer}.${category}.${action}` — prefixo canônico
  results.push(proof('P5', 'Telemetria emite eventos canônicos de memória', () => {
    const buf = readTelemetryBuffer();
    const PREFIX = 'f7.core.persistence_signal.memory.';
    const memEvents = buf.filter((e) => typeof e.event_name === 'string' && e.event_name.startsWith(PREFIX));
    const hasRecorded = memEvents.some((e) => e.event_name === `${PREFIX}event.recorded`);
    const hasCreated = memEvents.some((e) => e.event_name === `${PREFIX}candidate.created`);
    const hasValidated = memEvents.some((e) => e.event_name === `${PREFIX}candidate.validated`);
    const hasRejected = memEvents.some((e) => e.event_name === `${PREFIX}candidate.rejected`);
    const hasPromoted = memEvents.some((e) => e.event_name === `${PREFIX}candidate.promoted`);
    return [
      expectTrue('pelo menos 1 evento de memória', memEvents.length >= 1),
      expectTrue('memory.event.recorded emitido', hasRecorded),
      expectTrue('memory.candidate.created emitido', hasCreated),
      expectTrue('memory.candidate.validated emitido', hasValidated),
      expectTrue('memory.candidate.rejected emitido', hasRejected),
      expectTrue('memory.candidate.promoted emitido', hasPromoted),
      expectTrue('layer=core em todos', memEvents.every((e) => e.layer === 'core')),
      expectTrue('category persistence_signal no event_name', memEvents.every((e) => e.event_name.includes('persistence_signal'))),
    ];
  }));

  // P6 — Sanitização redige segredos em todos os campos
  results.push(proof('P6', 'Sanitização redige tokens, segredos e campos sensíveis', () => {
    const dirty = {
      authorization: 'Bearer eyJabc123.payload.sig',
      META_APP_SECRET: 'segredo-real-meta',
      payload: 'ok',
      nested: {
        SUPABASE_SERVICE_ROLE_KEY: 'sbp_abc123def456',
        clean: 'valor-limpo',
        sha256_sig: 'sha256=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      },
    };
    const clean = sanitizeRecord(dirty);

    const longNeutral = 'texto longo neutro '.repeat(200);
    const truncated = sanitizeText(longNeutral, 100);

    return [
      expectTrue('authorization redacted', (clean as any).authorization === '[REDACTED]'),
      expectTrue('META_APP_SECRET redacted', (clean as any).META_APP_SECRET === '[REDACTED]'),
      expectTrue('payload neutro preservado', (clean as any).payload === 'ok'),
      expectTrue('nested.SUPABASE_SERVICE_ROLE_KEY redacted', (clean as any).nested?.SUPABASE_SERVICE_ROLE_KEY === '[REDACTED]'),
      expectTrue('nested.clean preservado', (clean as any).nested?.clean === 'valor-limpo'),
      expectTrue('isFieldNameSensitive(authorization)', isFieldNameSensitive('authorization') === true),
      expectTrue('isFieldNameSensitive(META_VERIFY_TOKEN)', isFieldNameSensitive('META_VERIFY_TOKEN') === true),
      expectTrue('redactStringValue Bearer', redactStringValue('Bearer sk-abc123').includes('[REDACTED]')),
      expectTrue('sanitizeText trunca além do limite', truncated.endsWith('…[truncated]')),
    ];
  }));

  // P7 — Rotas CRM /crm/memory/* via Worker
  results.push(await proofAsync('P7', 'Rotas CRM memory operacionais via Worker', async () => {
    resetSharedMemoryStore();

    // GET /crm/memory/status
    const st = await callMemory('/crm/memory/status');
    const stBody = st.body as any;

    // POST /crm/memory/event
    const ev = await callMemory('/crm/memory/event', {
      method: 'POST',
      body: JSON.stringify({
        category: 'attendance_memory',
        event_type: 'attendance_started',
        source: 'crm',
        lead_ref: 'lead-crm-route',
        summary: 'prova de rota crm memory',
        details: { authorization: 'Bearer route-token', clean_field: 'ok' },
      }),
    });
    const evBody = ev.body as any;

    // POST /crm/memory/learning-candidate
    const lc = await callMemory('/crm/memory/learning-candidate', {
      method: 'POST',
      body: JSON.stringify({
        source: 'crm',
        lead_ref: 'lead-crm-route',
        summary: 'candidato criado via rota CRM',
        hypothesis: 'hipótese de prova rota',
      }),
    });
    const lcBody = lc.body as any;

    // POST decision
    const lcId = lcBody?.record?.id ?? '';
    const dec = await callMemory(`/crm/memory/learning-candidates/${lcId}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision: 'validated',
        operator_id: 'op-rota',
        reason: 'validado via rota de prova',
      }),
    });
    const decBody = dec.body as any;

    // GET /crm/memory/lead/:lead_ref
    const ld = await callMemory('/crm/memory/lead/lead-crm-route');
    const ldBody = ld.body as any;

    // GET /crm/memory/learning-candidates
    const lcs = await callMemory('/crm/memory/learning-candidates');
    const lcsBody = lcs.body as any;

    // 401 sem auth
    const noAuth = await worker.fetch(
      new Request('https://proof.local/crm/memory/status'),
      { CRM_ALLOW_DEV_TOKEN: 'true' },
    );

    return [
      expect('status: HTTP 200', 200, st.status),
      expectTrue('status: mode=in_memory', stBody?.record?.mode === 'in_memory'),
      expectTrue('status: invariantes presentes', stBody?.record?.invariants?.auto_promotion_disabled === true),
      expect('event: HTTP 201', 201, ev.status),
      expectTrue('event: ok=true', evBody?.ok === true),
      expectTrue('event: authorization redigido', evBody?.record?.details?.authorization === '[REDACTED]'),
      expect('event: clean_field preservado', 'ok', evBody?.record?.details?.clean_field),
      expect('learning-candidate: HTTP 201', 201, lc.status),
      expectTrue('learning-candidate: status draft', lcBody?.record?.status === 'draft'),
      expectTrue('decision: HTTP 200', dec.status === 200),
      expectTrue('decision: status validated', decBody?.record?.status === 'validated'),
      expectTrue('lead: registros >= 1', typeof ldBody?.count === 'number' && ldBody.count >= 1),
      expectTrue('candidates: count >= 1', typeof lcsBody?.count === 'number' && lcsBody.count >= 1),
      expect('noAuth: HTTP 401', 401, noAuth.status),
    ];
  }));

  // P8 — Regressão: nenhuma rota CRM expõe reply_text ou decide stage
  results.push(await proofAsync('P8', 'Regressão soberana: sem reply_text, sem stage, sem fact_* em rotas CRM', async () => {
    const routes = ['/crm/health', '/crm/leads', '/crm/conversations', '/crm/enova-ia/status'];
    const findings: ProofAssertion[] = [];

    for (const r of routes) {
      const res = await callMemory(r);
      const text = JSON.stringify(res.body);
      findings.push(expectTrue(`${r} sem reply_text`, !text.includes('reply_text')));
      findings.push(expectTrue(`${r} sem decide_stage`, !text.includes('decide_stage')));
      findings.push(expectTrue(`${r} sem fact_`, !text.includes('fact_')));
    }

    // memory/status também não expõe dados reais de clientes
    const ms = await callMemory('/crm/memory/status');
    const msText = JSON.stringify(ms.body);
    findings.push(expectTrue('memory/status sem reply_text', !msText.includes('reply_text')));

    return findings;
  }));

  // P9 — Invariantes soberanas (declarativas + checagem de API pública)
  results.push(proof('P9', 'Invariantes soberanas: service não expõe fact_*, stage, LLM, outbound', () => {
    const inv = memoryInvariants();
    const status = getMemoryStatus();
    const all = listMemoryByLead('__all__');
    const noFactRecords = all.records.every((r) => !Object.keys(r.details ?? {}).some((k) => k.startsWith('fact_')));
    const noStageRecords = all.records.every((r) => !Object.keys(r.details ?? {}).some((k) => k === 'stage'));

    return [
      expect('can_create_fact = false', false, inv.can_create_fact),
      expect('can_change_stage = false', false, inv.can_change_stage),
      expect('can_promote_automatically = false', false, inv.can_promote_automatically),
      expect('can_call_llm = false', false, inv.can_call_llm),
      expect('can_send_outbound = false', false, inv.can_send_outbound),
      expect('sanitization_required = true', true, inv.sanitization_required),
      expectTrue('status.auto_promotion_disabled', status.invariants.auto_promotion_disabled),
      expectTrue('status.auto_stage_change_disabled', status.invariants.auto_stage_change_disabled),
      expectTrue('status.auto_fact_creation_disabled', status.invariants.auto_fact_creation_disabled),
      expectTrue('nenhum registro com fact_*', noFactRecords),
      expectTrue('nenhum registro com stage', noStageRecords),
      expectTrue('mode = in_memory', status.mode === 'in_memory'),
    ];
  }));

  // ---------------------------------------------------------------------------
  // Sumário
  // ---------------------------------------------------------------------------

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

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
  console.log(`========================================`);
  console.log(`PR-T8.14 Prova memória + telemetria + regressão`);
  console.log(`PASS: ${passed} | FAIL: ${failed}`);
  console.log(`STATUS: ${failed === 0 ? 'PASSOU' : 'FALHOU'}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
