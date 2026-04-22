/**
 * ENOVA 2 — Frente 6 — PR3 smoke do runtime minimo de canal.
 *
 * Prova:
 * - POST /__meta__/ingest existe como rota tecnica dedicada
 * - method, JSON e envelope inbound sao validados
 * - resposta aceita/rejeita de forma estavel
 * - nao ha conversa real, Meta real, outbound real ou fala mecanica
 */

import worker from '../worker.ts';

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

function validEnvelope(): Record<string, unknown> {
  return {
    envelope_version: 'front6.v1',
    direction: 'inbound',
    channel: 'meta_whatsapp',
    event_type: 'inbound.message.text',
    event_id: 'wamid.smoke-pr3-001',
    occurred_at: '2026-04-22T18:10:00Z',
    received_at: '2026-04-22T18:10:01Z',
    trace_id: 'front6-pr3-smoke-trace-001',
    idempotency_key: 'meta_whatsapp:wamid.smoke-pr3-001',
    lead_ref: 'lead-smoke-pr3',
    payload: {
      text: 'Quero simular minha renda',
      sender_ref: 'wa:+5511999999999',
    },
  };
}

async function callWorker(request: Request): Promise<Record<string, unknown>> {
  const response = await worker.fetch(request, {} as ExecutionContext);
  return {
    response_status: response.status,
    response_json: await response.json() as Record<string, unknown>,
  };
}

async function scenarioMethodInvalido(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', { method: 'GET' }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 405', 405, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = method_not_allowed', 'method_not_allowed', json.error_code),
    assert('mode = technical_only', 'technical_only', json.mode),
  ];

  return {
    scenario: 'PR3 — rejeita method invalido',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioJsonInvalido(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = invalid_json', 'invalid_json', json.error_code),
  ];

  return {
    scenario: 'PR3 — rejeita JSON invalido',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioEnvelopeSemCamposObrigatorios(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  delete envelope.idempotency_key;

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = missing_required_field', 'missing_required_field', json.error_code),
    assert('field = idempotency_key', 'idempotency_key', json.field),
  ];

  return {
    scenario: 'PR3 — rejeita envelope sem campos obrigatorios',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioEventoNaoSuportado(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  envelope.event_type = 'outbound.message.text';

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = unsupported_event_type', 'unsupported_event_type', json.error_code),
    assert('field = event_type', 'event_type', json.field),
  ];

  return {
    scenario: 'PR3 — rejeita evento fora da taxonomia inbound',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioEnvelopeValido(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 202', 202, result.response_status),
    assert('accepted = true', true, json.accepted),
    assert('route = /__meta__/ingest', '/__meta__/ingest', json.route),
    assert('event_type preservado', envelope.event_type, json.event_type),
    assert('trace_id preservado', envelope.trace_id, json.trace_id),
    assert('idempotency_key preservado', envelope.idempotency_key, json.idempotency_key),
  ];

  return {
    scenario: 'PR3 — aceita envelope valido',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioTecnicoNaoConversaReal(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('mode = technical_only', 'technical_only', json.mode),
    assert('external_dispatch = false', false, json.external_dispatch),
    assert('real_meta_integration = false', false, json.real_meta_integration),
    assert('nao expoe message', false, 'message' in json),
    assert('nao expoe text', false, 'text' in json),
    assert('nao expoe surface', false, 'surface' in json),
  ];

  return {
    scenario: 'PR3 — preserva carater tecnico e nao vira conversa real',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioRotaInexistentePreservada(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/__meta__/unknown', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validEnvelope()),
  }));
  const json = result.response_json as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 404', 404, result.response_status),
    assert('error = not_found', 'not_found', json.error),
    assert('route preserva path inexistente', '/__meta__/unknown', json.route),
  ];

  return {
    scenario: 'PR3 — preserva comportamento de rota inexistente',
    response_status: result.response_status as number,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios = await Promise.all([
    scenarioMethodInvalido(),
    scenarioJsonInvalido(),
    scenarioEnvelopeSemCamposObrigatorios(),
    scenarioEventoNaoSuportado(),
    scenarioEnvelopeValido(),
    scenarioTecnicoNaoConversaReal(),
    scenarioRotaInexistentePreservada(),
  ]);

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — Frente 6 — PR3 smoke /__meta__/ingest');
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
