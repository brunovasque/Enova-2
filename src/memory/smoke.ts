/**
 * ENOVA 2 — PR-T8.13 — Smoke da memória evolutiva
 *
 * COBERTURA:
 *   1. Registra evento de atendimento (attendance_memory)
 *   2. Cria aprendizado candidato (learning_candidate)
 *   3. Aprendizado começa como `draft` (não promovido automaticamente)
 *   4. Decisão `validated` exige operator_id + reason
 *   5. Decisão `promoted` exige decisão humana explícita
 *   6. Memória por lead lista corretamente
 *   7. Telemetria registra evento de memória
 *   8. Sanitização remove tokens, segredos e campos sensíveis
 *   9. Service NUNCA cria fact_*
 *  10. Service NUNCA muda stage
 *  11. Status report mostra invariantes
 *  12. Fallback in-memory funciona sem Supabase
 *  13. SUPABASE_REAL_ENABLED off → não quebra
 *  14. Categoria learning_candidate via /event é rejeitada (rota dedicada)
 *  15. /crm/memory/* exige X-CRM-Admin-Key (auth) — via worker
 *  16. POST /crm/memory/event registra com sanitização
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

interface Assertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}
interface ScenarioResult {
  scenario: string;
  passed: boolean;
  assertions: Assertion[];
}

function assert(description: string, expected: unknown, actual: unknown): Assertion {
  return {
    description,
    expected,
    actual,
    passed: JSON.stringify(expected) === JSON.stringify(actual),
  };
}
function assertTrue(description: string, condition: boolean): Assertion {
  return { description, expected: true, actual: condition, passed: condition === true };
}

function runScenario(name: string, build: () => Assertion[]): ScenarioResult {
  const assertions = build();
  const passed = assertions.every((a) => a.passed);
  return { scenario: name, passed, assertions };
}

async function runAsyncScenario(name: string, build: () => Promise<Assertion[]>): Promise<ScenarioResult> {
  const assertions = await build();
  const passed = assertions.every((a) => a.passed);
  return { scenario: name, passed, assertions };
}

// ---------------------------------------------------------------------------
// Helper para chamar o worker como /crm/memory/*
// ---------------------------------------------------------------------------

const ADMIN_KEY = 'dev-crm-local';
const ADMIN_ENV = { CRM_ALLOW_DEV_TOKEN: 'true' };

async function callMemoryRoute(
  pathname: string,
  init?: RequestInit,
  envExtra: Record<string, unknown> = {},
): Promise<{ status: number; body: any }> {
  const url = `https://smoke.local${pathname}`;
  const request = new Request(url, {
    ...init,
    headers: {
      'x-crm-admin-key': ADMIN_KEY,
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const response = await worker.fetch(request, { ...ADMIN_ENV, ...envExtra });
  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: response.status, body: parsed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  resetSharedMemoryStore();
  clearTelemetryBuffer();

  const results: ScenarioResult[] = [];

  // 1
  results.push(runScenario('1. registerMemoryEvent → attendance_started', () => {
    const r = registerMemoryEvent({
      category: 'attendance_memory',
      event_type: 'attendance_started',
      source: 'crm',
      lead_ref: 'lead-001',
      summary: 'lead iniciou atendimento via canal CRM',
    });
    return [
      assertTrue('success=true', r.success),
      assert('category', 'attendance_memory', r.record?.category),
      assert('event_type', 'attendance_started', r.record?.event_type),
      assert('status inicial', 'draft', r.record?.status),
      assert('lead_ref preservado', 'lead-001', r.record?.lead_ref),
      assertTrue('id presente', typeof r.record?.id === 'string' && r.record!.id.length > 0),
    ];
  }));

  // 2
  results.push(runScenario('2. createLearningCandidate cria registro draft', () => {
    const r = createLearningCandidate({
      source: 'core_runtime',
      lead_ref: 'lead-001',
      summary: 'leads que mencionam parcela inicial mais alta convertem mais',
      hypothesis: 'incluir simulação de parcela já no primeiro turno aumenta conversão',
      proposed_action: 'avaliar se IA pode oferecer simulação inicial — mas SEM virar regra automaticamente',
      risk_level: 'medium',
    });
    return [
      assertTrue('success=true', r.success),
      assert('category', 'learning_candidate', r.record?.category),
      assert('status inicial = draft', 'draft', r.record?.status),
      assert('decision_at é null', null, r.record?.decision_at),
      assert('decision_operator_id é null', null, r.record?.decision_operator_id),
    ];
  }));

  // 3
  results.push(runScenario('3. learning_candidate NÃO vira regra automaticamente', () => {
    const list = listLearningCandidates('promoted');
    const status = getMemoryStatus();
    return [
      assert('promoted count = 0', 0, list.count),
      assertTrue('auto_promotion_disabled', status.invariants.auto_promotion_disabled === true),
      assertTrue('auto_stage_change_disabled', status.invariants.auto_stage_change_disabled === true),
      assertTrue('auto_fact_creation_disabled', status.invariants.auto_fact_creation_disabled === true),
    ];
  }));

  // 4
  results.push(runScenario('4. decisão exige operator_id + reason', () => {
    // pega o candidato criado em (2)
    const candidates = listLearningCandidates('draft');
    const candidate_id = candidates.records[0]?.id ?? '';

    const noOperator = applyLearningDecision(candidate_id, {
      decision: 'validated',
      operator_id: '',
      reason: 'tentando sem operator',
    });
    const noReason = applyLearningDecision(candidate_id, {
      decision: 'validated',
      operator_id: 'op-007',
      reason: '',
    });
    const invalidDecision = applyLearningDecision(candidate_id, {
      decision: 'unknown' as any,
      operator_id: 'op-007',
      reason: 'qualquer',
    });
    return [
      assertTrue('rejeita sem operator_id', noOperator.success === false),
      assertTrue('rejeita sem reason', noReason.success === false),
      assertTrue('rejeita decision inválida', invalidDecision.success === false),
    ];
  }));

  // 5
  results.push(runScenario('5. decisão humana válida (validated)', () => {
    const candidates = listLearningCandidates('draft');
    const candidate_id = candidates.records[0]?.id ?? '';
    const r = applyLearningDecision(candidate_id, {
      decision: 'validated',
      operator_id: 'op-007',
      reason: 'evidência suficiente em 12 atendimentos',
    });
    return [
      assertTrue('success=true', r.success),
      assert('status', 'validated', r.record?.status),
      assert('operator_id registrado', 'op-007', r.record?.decision_operator_id),
      assertTrue('decision_at preenchido', typeof r.record?.decision_at === 'string'),
    ];
  }));

  // 6
  results.push(runScenario('6. listMemoryByLead retorna apenas o lead alvo', () => {
    registerMemoryEvent({
      category: 'attendance_memory',
      event_type: 'attendance_message_received',
      source: 'crm',
      lead_ref: 'lead-002',
      summary: 'mensagem recebida de outro lead',
    });
    const r = listMemoryByLead('lead-001');
    const allOwned = r.records.every((rec) => rec.lead_ref === 'lead-001');
    return [
      assertTrue('count > 0', r.count > 0),
      assertTrue('todos do lead-001', allOwned),
    ];
  }));

  // 7
  results.push(runScenario('7. telemetria registrou eventos de memória', () => {
    const buf = readTelemetryBuffer();
    const memEvents = buf.filter((e) => e.event_name.startsWith('f7.core.persistence_signal.memory.'));
    const hasRecorded = memEvents.some((e) => e.event_name === 'f7.core.persistence_signal.memory.event.recorded');
    const hasCandidate = memEvents.some((e) => e.event_name === 'f7.core.persistence_signal.memory.candidate.created');
    const hasDecision = memEvents.some((e) => e.event_name === 'f7.core.persistence_signal.memory.candidate.validated');
    return [
      assertTrue('event.recorded emitido', hasRecorded),
      assertTrue('candidate.created emitido', hasCandidate),
      assertTrue('candidate.validated emitido', hasDecision),
      assertTrue('mais de 1 evento de memória', memEvents.length > 1),
    ];
  }));

  // 8
  results.push(runScenario('8. sanitização remove segredos e tokens', () => {
    const sample = {
      ok: 'campo público',
      authorization: 'Bearer abcdef1234567890XYZ',
      META_APP_SECRET: 'top-secret-real',
      payload: 'JWT eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwibmFtZSI6IkphbmUgRG9lIn0.AbcDeFGhiJKLmnopqrstuvwxYZ012345',
      nested: { token: 'sb-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
      texto: 'esse texto contém sha256=' + 'a'.repeat(64),
    };
    const out = sanitizeRecord(sample);
    return [
      assert('campo neutro preservado', 'campo público', out['ok']),
      assertTrue('authorization redacted', out['authorization'] === '[REDACTED]'),
      assertTrue('META_APP_SECRET redacted', out['META_APP_SECRET'] === '[REDACTED]'),
      assertTrue('Bearer no payload redigido', !String(out['payload']).includes('abcdef1234567890XYZ')),
      assertTrue(
        'token aninhado redacted',
        (out['nested'] as Record<string, unknown>)['token'] === '[REDACTED]',
      ),
      assertTrue('sha256 hex redigido', !String(out['texto']).includes('a'.repeat(64))),
      assertTrue('isFieldNameSensitive(authorization)', isFieldNameSensitive('authorization')),
      assertTrue('isFieldNameSensitive(META_VERIFY_TOKEN)', isFieldNameSensitive('META_VERIFY_TOKEN')),
      assertTrue('redactStringValue("Bearer xyz")', redactStringValue('Bearer abcdef1234567890XYZ') === '[REDACTED]'),
      assertTrue(
        'sanitizeText trunca além do limite',
        sanitizeText('texto longo neutro '.repeat(200), 100).endsWith('…[truncated]'),
      ),
    ];
  }));

  // 9 + 10 + 11
  results.push(runScenario('9-10-11. Soberania: sem fact_*, sem stage, invariantes ativas', () => {
    const inv = memoryInvariants();
    const status = getMemoryStatus();
    // qualquer registro do store: nenhuma chave começa com fact_ ou stage
    const all = listLearningCandidates();
    const noFact = all.records.every((r) => !Object.keys(r.details ?? {}).some((k) => k.startsWith('fact_')));
    const noStage = all.records.every((r) => !('stage' in (r.details ?? {})));
    return [
      assertTrue('can_create_fact = false', inv.can_create_fact === false),
      assertTrue('can_change_stage = false', inv.can_change_stage === false),
      assertTrue('can_promote_automatically = false', inv.can_promote_automatically === false),
      assertTrue('can_call_llm = false', inv.can_call_llm === false),
      assertTrue('can_send_outbound = false', inv.can_send_outbound === false),
      assertTrue('sanitization_required = true', inv.sanitization_required === true),
      assertTrue('nenhum registro com fact_*', noFact),
      assertTrue('nenhum registro com stage', noStage),
      assertTrue('status.mode = in_memory', status.mode === 'in_memory'),
    ];
  }));

  // 12
  results.push(runScenario('12. fallback in-memory funciona sem Supabase', () => {
    const status = getMemoryStatus({});
    return [
      assert('mode = in_memory', 'in_memory', status.mode),
      assertTrue('total_records >= 0', typeof status.total_records === 'number'),
    ];
  }));

  // 13
  results.push(runScenario('13. SUPABASE_REAL_ENABLED off → memória não quebra', () => {
    const status = getMemoryStatus({ SUPABASE_REAL_ENABLED: 'false' });
    return [
      assert('mode = in_memory', 'in_memory', status.mode),
      assertTrue('flag_supabase_memory false', status.flag_supabase_memory === false),
    ];
  }));

  // 14
  results.push(runScenario('14. category=learning_candidate via /event é rejeitada', () => {
    const r = registerMemoryEvent({
      category: 'learning_candidate' as any,
      event_type: 'learning_insight_candidate',
      source: 'core_runtime',
      summary: 'tentativa de bypass',
    });
    return [
      assertTrue('rejeitado', r.success === false),
      assert('error correto', 'use_create_learning_candidate_for_learning_records', r.error),
    ];
  }));

  // 15
  results.push(await runAsyncScenario('15. /crm/memory/* exige X-CRM-Admin-Key (401 sem auth)', async () => {
    const url = 'https://smoke.local/crm/memory/status';
    const request = new Request(url);
    const response = await worker.fetch(request, ADMIN_ENV);
    return [
      assert('status 401', 401, response.status),
    ];
  }));

  // 16
  results.push(await runAsyncScenario('16. POST /crm/memory/event registra com sanitização', async () => {
    const r = await callMemoryRoute('/crm/memory/event', {
      method: 'POST',
      body: JSON.stringify({
        category: 'commercial_memory',
        event_type: 'commercial_objection',
        source: 'panel_operator',
        lead_ref: 'lead-003',
        summary: 'lead questionou taxa Bearer abcdefghij1234567890',
        risk_level: 'medium',
        details: {
          authorization: 'Bearer 1234567890abcdef1234567890',
          observation: 'objeção legítima sobre custo',
        },
      }),
    });
    const summary = r.body?.record?.summary ?? '';
    const detailsAuth = r.body?.record?.details?.authorization;
    return [
      assert('status 201', 201, r.status),
      assert('ok=true', true, r.body?.ok),
      assertTrue('summary sanitizado', !summary.includes('Bearer abcdefghij1234567890')),
      assertTrue('details.authorization redacted', detailsAuth === '[REDACTED]'),
      assert('lead_ref preservado', 'lead-003', r.body?.record?.lead_ref),
    ];
  }));

  // 17
  results.push(await runAsyncScenario('17. GET /crm/memory/status retorna invariantes', async () => {
    const r = await callMemoryRoute('/crm/memory/status');
    return [
      assert('status 200', 200, r.status),
      assertTrue('record presente', r.body?.record != null),
      assert('mode = in_memory', 'in_memory', r.body?.record?.mode),
      assertTrue('auto_promotion_disabled', r.body?.record?.invariants?.auto_promotion_disabled === true),
    ];
  }));

  // 18
  results.push(await runAsyncScenario('18. POST /crm/memory/learning-candidate via API + decisão promoted', async () => {
    const created = await callMemoryRoute('/crm/memory/learning-candidate', {
      method: 'POST',
      body: JSON.stringify({
        source: 'panel_operator',
        lead_ref: 'lead-004',
        summary: 'aprendizado via API',
        hypothesis: 'hipótese válida',
        proposed_action: 'sugerir variação X',
        risk_level: 'low',
      }),
    });
    const id = created.body?.record?.id;
    const decision = await callMemoryRoute(`/crm/memory/learning-candidates/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision: 'promoted',
        operator_id: 'vasques',
        reason: 'aprovado após revisão manual conforme contrato',
      }),
    });
    return [
      assert('criado 201', 201, created.status),
      assert('status inicial draft', 'draft', created.body?.record?.status),
      assert('decisão 200', 200, decision.status),
      assert('status promoted após decisão', 'promoted', decision.body?.record?.status),
      assert('operator_id registrado', 'vasques', decision.body?.record?.decision_operator_id),
    ];
  }));

  // 19 — confirma que Meta não foi tocada
  results.push(await runAsyncScenario('19. PR-T8.13 não toca Meta — webhook continua íntegro', async () => {
    const url = 'https://smoke.local/__meta__/webhook?hub.mode=subscribe&hub.verify_token=any&hub.challenge=ping';
    const response = await worker.fetch(new Request(url), { ...ADMIN_ENV });
    // Sem META_VERIFY_TOKEN no env, deve retornar 403 controlado (rota viva)
    return [
      assertTrue('rota meta responde (não 404)', response.status !== 404),
      assertTrue('rota meta não foi alterada', response.status === 403),
    ];
  }));

  // ---------------------------------------------------------------------------
  // Resultado final
  // ---------------------------------------------------------------------------
  let totalPassed = 0;
  let totalFailed = 0;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${r.scenario}`);
    for (const a of r.assertions) {
      const tag = a.passed ? '  ok' : '  FAIL';
      console.log(`${tag} ${a.description}`);
      if (!a.passed) {
        console.log(`    expected: ${JSON.stringify(a.expected)}`);
        console.log(`    actual:   ${JSON.stringify(a.actual)}`);
      }
    }
    if (r.passed) totalPassed++;
    else totalFailed++;
  }
  console.log('');
  console.log(`Total: ${results.length} cenários | PASS: ${totalPassed} | FAIL: ${totalFailed}`);
  console.log(`Resultado final: ${totalFailed === 0 ? 'PASSOU' : 'FALHOU'}`);
  if (totalFailed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('[ERRO FATAL]', e);
  process.exit(1);
});
