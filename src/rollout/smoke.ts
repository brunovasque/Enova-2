import worker from '../worker.ts';
import { applyRolloutGuard, clearRolloutEvidenceBuffer, readRolloutEvidenceBuffer } from './controller.ts';
import { evaluateRolloutGuard } from './guards.ts';
import type { RolloutEvidenceEvent } from './types.ts';

interface Assertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

interface ScenarioResult {
  scenario: string;
  response_status: number;
  response_json: Record<string, unknown>;
  assertions: Assertion[];
  passed: boolean;
}

function assert(description: string, expected: unknown, actual: unknown): Assertion {
  return {
    description,
    expected,
    actual,
    passed: JSON.stringify(expected) === JSON.stringify(actual),
  };
}

function assertTrue(description: string, condition: boolean, detail: unknown): Assertion {
  return {
    description,
    expected: true,
    actual: detail,
    passed: condition,
  };
}

function findEvidence(events: RolloutEvidenceEvent[], eventName: string, traceId: string): RolloutEvidenceEvent | undefined {
  return events.find((event) => event.event_name === eventName && event.trace_id === traceId);
}

async function callWorker(request: Request): Promise<{
  status: number;
  json: Record<string, unknown>;
}> {
  const response = await worker.fetch(request, {} as ExecutionContext);
  return {
    status: response.status,
    json: await response.json() as Record<string, unknown>,
  };
}

async function scenarioGuardsExistAndEmitEvidence(): Promise<ScenarioResult> {
  clearRolloutEvidenceBuffer();
  const traceId = 'f8-pr3-rollout-root-trace';

  const result = await callWorker(new Request('https://enova.local/', {
    method: 'GET',
    headers: { 'x-trace-id': traceId },
  }));

  const events = readRolloutEvidenceBuffer();
  const gateStatus = findEvidence(events, 'f8.rollout.gate_status.evaluated', traceId);
  const promotionBlock = findEvidence(events, 'f8.rollout.promotion_block.evaluated', traceId);
  const rollbackReady = findEvidence(events, 'f8.rollout.rollback_ready.evaluated', traceId);
  const boundaryBlocked = findEvidence(events, 'f8.rollout.rollout_boundary_blocked.enforced', traceId);
  const smokeEvidence = findEvidence(events, 'f8.rollout.smoke_evidence.recorded', traceId);

  const assertions: Assertion[] = [
    assert('status HTTP root = 200', 200, result.status),
    assert('surface root = technical_only', 'technical_only', result.json.surface),
    assertTrue('gate_status emitido', Boolean(gateStatus), gateStatus ?? null),
    assert('gate_status = pass', 'pass', gateStatus?.gate_status),
    assertTrue('promotion_block emitido', Boolean(promotionBlock), promotionBlock ?? null),
    assert('promotion_block = true', true, promotionBlock?.promotion_block),
    assertTrue('rollback_ready emitido', Boolean(rollbackReady), rollbackReady ?? null),
    assert('rollback_ready = true', true, rollbackReady?.rollback_ready),
    assertTrue('rollout_boundary_blocked emitido', Boolean(boundaryBlocked), boundaryBlocked ?? null),
    assertTrue('smoke_evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR3 — guards mínimos existem e emitem evidência técnica local',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioPromotionAndBlockEvaluation(): Promise<ScenarioResult> {
  const allowDecision = evaluateRolloutGuard({
    route: '/__core__/run',
    method: 'POST',
  });
  const blockedDecision = evaluateRolloutGuard({
    route: '/__rollout__/unknown',
    method: 'GET',
  });

  const assertions: Assertion[] = [
    assert('rota valida mantém gate_status pass', 'pass', allowDecision.gate_status),
    assert('rota valida mantém promotion_block true', true, allowDecision.promotion_block),
    assert('rota valida mantém decision hold', 'hold', allowDecision.decision),
    assert('rota fora de escopo bloqueia', 'blocked', blockedDecision.gate_status),
    assert('rota fora de escopo entra em abort', 'abort', blockedDecision.decision),
    assertTrue(
      'motivo de bloqueio inclui route_out_of_rollout_scope',
      blockedDecision.reason_codes.includes('route_out_of_rollout_scope'),
      blockedDecision.reason_codes,
    ),
  ];

  return {
    scenario: 'PR3 — critérios de promoção/bloqueio podem ser avaliados tecnicamente',
    response_status: 200,
    response_json: {
      allow_decision: allowDecision,
      blocked_decision: blockedDecision,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioRollbackReadyEvaluation(): Promise<ScenarioResult> {
  const decision = evaluateRolloutGuard({
    route: '/__meta__/ingest',
    method: 'POST',
  });

  const assertions: Assertion[] = [
    assert('rollback_ready = true', true, decision.rollback_ready),
    assert('stage tecnico = shadow', 'shadow', decision.stage),
    assert('mode tecnico local', 'technical_local_only', decision.mode),
  ];

  return {
    scenario: 'PR3 — rollback_ready pode ser avaliado tecnicamente',
    response_status: 200,
    response_json: {
      decision,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioCoreRouteIntegrity(): Promise<ScenarioResult> {
  const traceId = 'f8-pr3-rollout-core-trace';
  const result = await callWorker(new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify({
      lead_id: 'front8-pr3-core-smoke',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
      },
    }),
  }));

  const assertions: Assertion[] = [
    assert('status HTTP /__core__/run = 200', 200, result.status),
    assert('stage_after esperado', 'qualification_civil', result.json.stage_after),
    assert('nao expõe surface', false, 'surface' in result.json),
    assert('nao expõe message', false, 'message' in result.json),
  ];

  return {
    scenario: 'PR3 — /__core__/run continua íntegro',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMetaRouteIntegrity(): Promise<ScenarioResult> {
  const traceId = 'f8-pr3-rollout-meta-trace';
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify({
      envelope_version: 'front6.v1',
      direction: 'inbound',
      channel: 'meta_whatsapp',
      event_type: 'inbound.message.text',
      event_id: 'wamid.f8.pr3.meta.001',
      occurred_at: '2026-04-22T22:00:00Z',
      received_at: '2026-04-22T22:00:01Z',
      trace_id: traceId,
      idempotency_key: 'meta_whatsapp:wamid.f8.pr3.meta.001',
      lead_ref: 'lead-f8-pr3-smoke',
      payload: {
        text: 'smoke runtime minimo rollout',
      },
    }),
  }));

  const assertions: Assertion[] = [
    assert('status HTTP /__meta__/ingest = 202', 202, result.status),
    assert('accepted = true', true, result.json.accepted),
    assert('mode = technical_only', 'technical_only', result.json.mode),
    assert('real_meta_integration = false', false, result.json.real_meta_integration),
    assert('nao expõe message', false, 'message' in result.json),
  ];

  return {
    scenario: 'PR3 — /__meta__/ingest continua íntegro',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioNotFoundAndBlockedGate(): Promise<ScenarioResult> {
  clearRolloutEvidenceBuffer();
  const traceId = 'f8-pr3-rollout-not-found-trace';
  const result = await callWorker(new Request('https://enova.local/__rollout__/unknown', {
    method: 'GET',
    headers: { 'x-trace-id': traceId },
  }));

  const events = readRolloutEvidenceBuffer();
  const gateStatus = findEvidence(events, 'f8.rollout.gate_status.evaluated', traceId);

  const assertions: Assertion[] = [
    assert('status HTTP not_found = 404', 404, result.status),
    assert('error = not_found', 'not_found', result.json.error),
    assert('route preservada', '/__rollout__/unknown', result.json.route),
    assert('gate_status para rota fora de escopo = blocked', 'blocked', gateStatus?.gate_status),
    assertTrue(
      'motivo route_out_of_rollout_scope presente',
      (gateStatus?.reason_codes ?? []).includes('route_out_of_rollout_scope'),
      gateStatus?.reason_codes ?? null,
    ),
  ];

  return {
    scenario: 'PR3 — runtime guard/not_found preservado com gate bloqueado',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioBoundariesRemainBlocked(): Promise<ScenarioResult> {
  const decision = evaluateRolloutGuard({
    route: '/',
    method: 'GET',
  });

  const requiredBoundaries = [
    'rollout_real_activation',
    'meta_real_activation',
    'supabase_real_new_activation',
    'external_dashboard_activation',
    'external_mandatory_tool_activation',
    'manual_external_deploy',
  ];

  const assertions: Assertion[] = [
    assertTrue(
      'todas as fronteiras externas permanecem bloqueadas',
      requiredBoundaries.every((boundary) => decision.blocked_boundaries.includes(boundary)),
      decision.blocked_boundaries,
    ),
    assert('controle Meta real continua false', false, decision.controls.allow_meta_real_activation),
    assert('controle Supabase real novo continua false', false, decision.controls.allow_supabase_real_new_activation),
    assert('controle deploy externo/manual continua false', false, decision.controls.allow_manual_external_deploy),
  ];

  return {
    scenario: 'PR3 — fronteiras externas continuam bloqueadas',
    response_status: 200,
    response_json: {
      decision,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios: ScenarioResult[] = [];
  scenarios.push(await scenarioGuardsExistAndEmitEvidence());
  scenarios.push(await scenarioPromotionAndBlockEvaluation());
  scenarios.push(await scenarioRollbackReadyEvaluation());
  scenarios.push(await scenarioCoreRouteIntegrity());
  scenarios.push(await scenarioMetaRouteIntegrity());
  scenarios.push(await scenarioNotFoundAndBlockedGate());
  scenarios.push(await scenarioBoundariesRemainBlocked());

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — Frente 8 — PR3 smoke runtime mínimo de rollout');
  console.log('===========================================');

  for (const scenario of scenarios) {
    console.log(`\n${scenario.passed ? 'PASSOU' : 'FALHOU'} ${scenario.scenario}`);
    console.log('Response:');
    console.log(JSON.stringify(scenario.response_json, null, 2));

    for (const item of scenario.assertions) {
      console.log(`  ${item.passed ? 'ok' : 'erro'} ${item.description}`);
      if (!item.passed) {
        console.log(`    Esperado: ${JSON.stringify(item.expected)}`);
        console.log(`    Obtido:   ${JSON.stringify(item.actual)}`);
      }
    }
  }

  console.log(`\nResultado final: ${allPassed ? 'PASSOU' : 'FALHOU'}`);

  if (!allPassed) {
    process.exit(1);
  }
}

void main();
