import worker from '../worker.ts';
import { clearTelemetryBuffer, emitSmokeEvidence, readTelemetryBuffer } from './emit.ts';
import type { TelemetryEvent } from './types.ts';

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

function findEvent(
  events: TelemetryEvent[],
  eventName: string,
  predicate?: (event: TelemetryEvent) => boolean,
): TelemetryEvent | undefined {
  return events.find((event) => event.event_name === eventName && (predicate ? predicate(event) : true));
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

async function scenarioRootEmitsMinimalSignals(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr3-smoke-root-trace';
  const result = await callWorker(new Request('https://enova.local/', {
    method: 'GET',
    headers: {
      'x-trace-id': traceId,
    },
  }));

  emitSmokeEvidence(traceId, 'f7-pr3-root-evidence', {
    scenario: 'root_emits_minimal_signals',
  });

  const events = readTelemetryBuffer();
  const received = findEvent(events, 'f7.worker.request_lifecycle.received', (event) => event.trace_id === traceId);
  const completed = findEvent(events, 'f7.worker.request_lifecycle.completed', (event) => event.trace_id === traceId);
  const health = findEvent(events, 'f7.worker.health_signal.reported', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 200', 200, result.status),
    assert('surface root = technical_only', 'technical_only', result.json.surface),
    assertTrue('request lifecycle received emitido', Boolean(received), received ?? null),
    assertTrue('request lifecycle completed emitido', Boolean(completed), completed ?? null),
    assertTrue('health_signal emitido', Boolean(health), health ?? null),
    assertTrue('request_id presente no evento recebido', typeof received?.request_id === 'string' && received.request_id.length > 0, received?.request_id ?? null),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR3 — root emite sinais minimos',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioCoreRunEmitsSignals(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr3-smoke-core-trace';
  const result = await callWorker(new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify({
      lead_id: 'front7-pr3-core-smoke',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
      },
    }),
  }));

  emitSmokeEvidence(traceId, 'f7-pr3-core-evidence', {
    scenario: 'core_run_emits_signals',
  });

  const events = readTelemetryBuffer();
  const decision = findEvent(events, 'f7.core.decision_transition.evaluated', (event) => event.trace_id === traceId);
  const completed = findEvent(events, 'f7.worker.request_lifecycle.completed', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 200', 200, result.status),
    assert('stage_after esperado', 'qualification_civil', result.json.stage_after),
    assertTrue('decision_transition emitido', Boolean(decision), decision ?? null),
    assertTrue('execution_id presente no decision_transition', typeof decision?.execution_id === 'string' && decision.execution_id.length > 0, decision?.execution_id ?? null),
    assert('request lifecycle completed com status 200', 200, completed?.details?.status),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR3 — /__core__/run emite sinais minimos',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMetaIngestEmitsSignals(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr3-smoke-meta-trace';
  const envelope = {
    envelope_version: 'front6.v1',
    direction: 'inbound',
    channel: 'meta_whatsapp',
    event_type: 'inbound.message.text',
    event_id: 'wamid.f7.pr3.meta.001',
    occurred_at: '2026-04-22T20:20:00Z',
    received_at: '2026-04-22T20:20:01Z',
    trace_id: traceId,
    idempotency_key: 'meta_whatsapp:wamid.f7.pr3.meta.001',
    lead_ref: 'lead-f7-pr3-smoke',
    payload: {
      text: 'teste tecnico frente 7 pr3',
      sender_ref: 'wa:+5511999999999',
    },
  };

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify(envelope),
  }));

  emitSmokeEvidence(traceId, 'f7-pr3-meta-evidence', {
    scenario: 'meta_ingest_emits_signals',
  });

  const events = readTelemetryBuffer();
  const channelSignal = findEvent(events, 'f7.channel.channel_signal.accepted', (event) => event.trace_id === traceId);
  const boundaryBlocked = findEvent(events, 'f7.channel.external_boundary_blocked.enforced', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 202', 202, result.status),
    assert('accepted = true', true, result.json.accepted),
    assert('mode = technical_only', 'technical_only', result.json.mode),
    assert('real_meta_integration = false', false, result.json.real_meta_integration),
    assertTrue('channel_signal emitido', Boolean(channelSignal), channelSignal ?? null),
    assert('channel_signal correlation_id = idempotency_key', envelope.idempotency_key, channelSignal?.correlation_id),
    assertTrue('external_boundary_blocked emitido', Boolean(boundaryBlocked), boundaryBlocked ?? null),
    assert('boundary_ref = meta_real', 'meta_real', boundaryBlocked?.boundary_ref),
    assertTrue('nao expõe message', !('message' in result.json), result.json),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR3 — /__meta__/ingest emite sinais sem quebrar resposta',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioValidationFailureEmitsSignal(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr3-smoke-validation-trace';
  const envelopeWithoutRequiredField = {
    envelope_version: 'front6.v1',
    direction: 'inbound',
    channel: 'meta_whatsapp',
    event_type: 'inbound.message.text',
    event_id: 'wamid.f7.pr3.meta.002',
    occurred_at: '2026-04-22T20:21:00Z',
    received_at: '2026-04-22T20:21:01Z',
    trace_id: traceId,
    lead_ref: 'lead-f7-pr3-smoke',
    payload: {
      text: 'payload sem idempotency',
    },
  };

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify(envelopeWithoutRequiredField),
  }));

  emitSmokeEvidence(traceId, 'f7-pr3-validation-evidence', {
    scenario: 'validation_failure_emits_signal',
  });

  const events = readTelemetryBuffer();
  const validationFailure = findEvent(events, 'f7.channel.validation_failure.detected', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 400', 400, result.status),
    assert('accepted = false', false, result.json.accepted),
    assert('error_code = missing_required_field', 'missing_required_field', result.json.error_code),
    assertTrue('validation_failure emitido', Boolean(validationFailure), validationFailure ?? null),
    assert('symptom_code coerente', 'meta_missing_required_field', validationFailure?.symptom_code),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR3 — validation failure emite sinal coerente',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioRuntimeGuardNotFound(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr3-smoke-guard-trace';
  const result = await callWorker(new Request('https://enova.local/__telemetry__/unknown', {
    method: 'GET',
    headers: {
      'x-trace-id': traceId,
    },
  }));

  emitSmokeEvidence(traceId, 'f7-pr3-guard-evidence', {
    scenario: 'runtime_guard_not_found',
  });

  const events = readTelemetryBuffer();
  const runtimeGuard = findEvent(events, 'f7.worker.runtime_guard.blocked', (event) => event.trace_id === traceId);
  const completed = findEvent(events, 'f7.worker.request_lifecycle.completed', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 404', 404, result.status),
    assert('error = not_found', 'not_found', result.json.error),
    assert('route preservada', '/__telemetry__/unknown', result.json.route),
    assertTrue('runtime_guard emitido', Boolean(runtimeGuard), runtimeGuard ?? null),
    assert('runtime_guard symptom_code', 'route_not_found', runtimeGuard?.symptom_code),
    assert('request lifecycle completed com status 404', 404, completed?.details?.status),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR3 — runtime guard/not_found preservado com sinal',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios: ScenarioResult[] = [];
  scenarios.push(await scenarioRootEmitsMinimalSignals());
  scenarios.push(await scenarioCoreRunEmitsSignals());
  scenarios.push(await scenarioMetaIngestEmitsSignals());
  scenarios.push(await scenarioValidationFailureEmitsSignal());
  scenarios.push(await scenarioRuntimeGuardNotFound());

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — Frente 7 — PR3 smoke minimo');
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
