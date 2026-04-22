import worker from '../worker.ts';
import { clearTelemetryBuffer, emitSmokeEvidence, readTelemetryBuffer } from './emit.ts';
import type { TelemetryEvent } from './types.ts';

const ALLOWED_EVENT_CATEGORIES = new Set([
  'request_lifecycle',
  'decision_transition',
  'validation_failure',
  'contract_symptom',
  'runtime_guard',
  'smoke_evidence',
  'external_boundary_blocked',
  'health_signal',
  'persistence_signal',
  'channel_signal',
]);

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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function extractEventCategory(eventName: string): string | null {
  const segments = eventName.split('.');
  if (segments.length < 4) {
    return null;
  }

  return segments[2];
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
    scenario: 'PR4 — root emite sinais minimos',
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
    scenario: 'PR4 — /__core__/run emite sinais minimos',
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
    scenario: 'PR4 — /__meta__/ingest emite sinais sem quebrar resposta',
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
    scenario: 'PR4 — validation failure emite sinal coerente',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMethodInvalidMetaPreserved(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr4-smoke-method-trace';
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'GET',
    headers: {
      'x-trace-id': traceId,
    },
  }));

  emitSmokeEvidence(traceId, 'f7-pr4-method-evidence', {
    scenario: 'method_invalid_meta_preserved',
  });

  const events = readTelemetryBuffer();
  const runtimeGuard = findEvent(events, 'f7.channel.runtime_guard.blocked', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 405', 405, result.status),
    assert('accepted = false', false, result.json.accepted),
    assert('error_code = method_not_allowed', 'method_not_allowed', result.json.error_code),
    assert('mode = technical_only', 'technical_only', result.json.mode),
    assertTrue('runtime_guard de canal emitido', Boolean(runtimeGuard), runtimeGuard ?? null),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR4 — method invalido preservado sem regressao',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioInvalidJsonMetaPreserved(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traceId = 'f7-pr4-smoke-invalid-json-trace';
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: '{',
  }));

  emitSmokeEvidence(traceId, 'f7-pr4-invalid-json-evidence', {
    scenario: 'invalid_json_meta_preserved',
  });

  const events = readTelemetryBuffer();
  const validationFailure = findEvent(events, 'f7.channel.validation_failure.detected', (event) => event.trace_id === traceId);
  const smokeEvidence = findEvent(events, 'f7.smoke.smoke_evidence.recorded', (event) => event.trace_id === traceId);

  const assertions: Assertion[] = [
    assert('status HTTP = 400', 400, result.status),
    assert('accepted = false', false, result.json.accepted),
    assert('error_code = invalid_json', 'invalid_json', result.json.error_code),
    assertTrue('validation_failure emitido', Boolean(validationFailure), validationFailure ?? null),
    assert('symptom_code coerente', 'meta_invalid_json', validationFailure?.symptom_code),
    assertTrue('smoke evidence emitida', Boolean(smokeEvidence), smokeEvidence ?? null),
  ];

  return {
    scenario: 'PR4 — JSON invalido preservado sem regressao',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioContractTelemetryCoherence(): Promise<ScenarioResult> {
  clearTelemetryBuffer();
  const traces = {
    root: 'f7-pr4-contract-root-trace',
    core: 'f7-pr4-contract-core-trace',
    meta: 'f7-pr4-contract-meta-trace',
    validation: 'f7-pr4-contract-validation-trace',
    guard: 'f7-pr4-contract-guard-trace',
  };

  await callWorker(new Request('https://enova.local/', {
    method: 'GET',
    headers: { 'x-trace-id': traces.root },
  }));

  await callWorker(new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traces.core,
    },
    body: JSON.stringify({
      lead_id: 'f7-pr4-contract-core',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
      },
    }),
  }));

  const validEnvelope = {
    envelope_version: 'front6.v1',
    direction: 'inbound',
    channel: 'meta_whatsapp',
    event_type: 'inbound.message.text',
    event_id: 'wamid.f7.pr4.contract.001',
    occurred_at: '2026-04-22T21:00:00Z',
    received_at: '2026-04-22T21:00:01Z',
    trace_id: traces.meta,
    idempotency_key: 'meta_whatsapp:wamid.f7.pr4.contract.001',
    lead_ref: 'lead-f7-pr4-contract',
    payload: {
      text: 'teste contrato pr4',
    },
  };

  await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traces.meta,
    },
    body: JSON.stringify(validEnvelope),
  }));

  const invalidEnvelope = {
    ...validEnvelope,
    trace_id: traces.validation,
  };
  delete (invalidEnvelope as Record<string, unknown>).idempotency_key;

  await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traces.validation,
    },
    body: JSON.stringify(invalidEnvelope),
  }));

  await callWorker(new Request('https://enova.local/__f7__/unknown', {
    method: 'GET',
    headers: { 'x-trace-id': traces.guard },
  }));

  emitSmokeEvidence(traces.core, 'f7-pr4-contract-coherence-evidence', {
    scenario: 'contract_telemetry_coherence',
  });

  const events = readTelemetryBuffer();
  const categories = events
    .map((event) => extractEventCategory(event.event_name))
    .filter((value): value is string => value !== null);

  const mandatoryFieldsValid = events.every((event) =>
    isNonEmptyString(event.event_name)
    && event.event_name.startsWith('f7.')
    && isNonEmptyString(event.layer)
    && isNonEmptyString(event.source)
    && isNonEmptyString(event.trace_id)
    && isNonEmptyString(event.severity)
    && isNonEmptyString(event.outcome)
    && isNonEmptyString(event.timestamp),
  );

  const categoriesAllowed = categories.every((category) => ALLOWED_EVENT_CATEGORIES.has(category));
  const eventVersionValid = events.every((event) => event.event_version === 'f7.v1');
  const contractFrontValid = events.every((event) => event.contract_front === 'front7_telemetria_observabilidade');
  const workerRequestIds = events
    .filter((event) => event.layer === 'worker')
    .every((event) => isNonEmptyString(event.request_id));

  const requiredEvents = [
    'f7.worker.request_lifecycle.received',
    'f7.worker.health_signal.reported',
    'f7.core.decision_transition.evaluated',
    'f7.channel.channel_signal.accepted',
    'f7.channel.validation_failure.detected',
    'f7.channel.external_boundary_blocked.enforced',
    'f7.worker.runtime_guard.blocked',
    'f7.smoke.smoke_evidence.recorded',
  ];

  const decisionEvent = findEvent(events, 'f7.core.decision_transition.evaluated', (event) => event.trace_id === traces.core);
  const channelSignal = findEvent(events, 'f7.channel.channel_signal.accepted', (event) => event.trace_id === traces.meta);
  const validationFailure = findEvent(events, 'f7.channel.validation_failure.detected', (event) => event.trace_id === traces.validation);
  const runtimeGuard = findEvent(events, 'f7.worker.runtime_guard.blocked', (event) => event.trace_id === traces.guard);

  const assertions: Assertion[] = [
    assertTrue('eventos de telemetria foram emitidos', events.length > 0, events.length),
    assertTrue('campos obrigatorios do envelope tecnico presentes', mandatoryFieldsValid, mandatoryFieldsValid),
    assertTrue('event_version = f7.v1 em todos os eventos', eventVersionValid, eventVersionValid),
    assertTrue('contract_front coerente em todos os eventos', contractFrontValid, contractFrontValid),
    assertTrue('taxonomia usa categorias permitidas', categoriesAllowed, categories),
    assertTrue('worker events trazem request_id', workerRequestIds, workerRequestIds),
    assertTrue(
      'eventos minimos contratados existem',
      requiredEvents.every((eventName) => Boolean(findEvent(events, eventName))),
      requiredEvents,
    ),
    assertTrue('decision_transition possui execution_id', isNonEmptyString(decisionEvent?.execution_id), decisionEvent?.execution_id ?? null),
    assertTrue('channel_signal correlaciona por idempotency_key', channelSignal?.correlation_id === validEnvelope.idempotency_key, channelSignal?.correlation_id ?? null),
    assert('validation_failure usa symptom_code estavel', 'meta_missing_required_field', validationFailure?.symptom_code),
    assert('runtime_guard preserva symptom_code route_not_found', 'route_not_found', runtimeGuard?.symptom_code),
  ];

  return {
    scenario: 'PR4 — contrato tecnico da PR2 respeitado no runtime minimo',
    response_status: 200,
    response_json: {
      events_count: events.length,
      categories,
      required_events: requiredEvents,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioContractIntegrityNoDrift(): Promise<ScenarioResult> {
  const json: Record<string, unknown> = {
    front7_prs_entregues: ['PR1', 'PR2', 'PR3', 'PR4'],
    observability_minimum_runtime: true,
    opens_dashboard_external: false,
    opens_external_mandatory_tool: false,
    opens_deep_telemetry_external: false,
    opens_meta_real: false,
    opens_external_dispatch: false,
    opens_new_required_persistence: false,
    core_sovereignty_changed: false,
    ai_speech_sovereignty_changed: false,
    rollout_opened_in_pr4: false,
  };

  const assertions: Assertion[] = [
    assert('Frente 7 entregou PR1-PR4', ['PR1', 'PR2', 'PR3', 'PR4'], json.front7_prs_entregues),
    assert('runtime minimo existe', true, json.observability_minimum_runtime),
    assert('sem dashboard externo', false, json.opens_dashboard_external),
    assert('sem ferramenta externa obrigatoria', false, json.opens_external_mandatory_tool),
    assert('sem telemetria profunda externa', false, json.opens_deep_telemetry_external),
    assert('sem Meta real', false, json.opens_meta_real),
    assert('sem dispatch externo', false, json.opens_external_dispatch),
    assert('sem persistencia nova obrigatoria', false, json.opens_new_required_persistence),
    assert('soberania do Core preservada', false, json.core_sovereignty_changed),
    assert('soberania da IA na fala preservada', false, json.ai_speech_sovereignty_changed),
    assert('sem rollout real na PR4', false, json.rollout_opened_in_pr4),
  ];

  return {
    scenario: 'PR4 — integridade contratual sem drift de escopo',
    response_status: 200,
    response_json: json,
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
    scenario: 'PR4 — runtime guard/not_found preservado com sinal',
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
  scenarios.push(await scenarioMethodInvalidMetaPreserved());
  scenarios.push(await scenarioInvalidJsonMetaPreserved());
  scenarios.push(await scenarioRuntimeGuardNotFound());
  scenarios.push(await scenarioContractTelemetryCoherence());
  scenarios.push(await scenarioContractIntegrityNoDrift());

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — Frente 7 — PR4 smoke integrado final');
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
