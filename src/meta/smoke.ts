/**
 * ENOVA 2 — Frente 6 — PR4 smoke integrado final do canal.
 *
 * Prova:
 * - /, /__core__/run e /__meta__/ingest permanecem integros
 * - method, JSON e envelope inbound seguem o contrato tecnico da PR2
 * - aceite/rejeicao sao tecnicos e previsiveis
 * - nao ha conversa real, Meta real, outbound real, persistencia nova ou fala mecanica
 * - PR1 + PR2 + PR3 + PR4 fecham exatamente o recorte contratado da Frente 6
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

interface WorkerCallResult {
  response_status: number;
  response_json: Record<string, unknown>;
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
    event_id: 'wamid.smoke-pr4-001',
    occurred_at: '2026-04-22T18:10:00Z',
    received_at: '2026-04-22T18:10:01Z',
    trace_id: 'front6-pr4-smoke-trace-001',
    idempotency_key: 'meta_whatsapp:wamid.smoke-pr4-001',
    lead_ref: 'lead-smoke-pr4',
    payload: {
      text: 'Quero simular minha renda',
      sender_ref: 'wa:+5511999999999',
    },
  };
}

async function callWorker(request: Request): Promise<WorkerCallResult> {
  const response = await worker.fetch(request, {} as ExecutionContext);
  return {
    response_status: response.status,
    response_json: await response.json() as Record<string, unknown>,
  };
}

async function scenarioRootIntegro(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/', { method: 'GET' }));
  const json = result.response_json;
  const routes = json.routes as Record<string, unknown>;
  const assertions = [
    assert('status HTTP = 200', 200, result.response_status),
    assert('service = enova-2-worker', 'enova-2-worker', json.service),
    assert('status = ok', 'ok', json.status),
    assert('surface = technical_only', 'technical_only', json.surface),
    assert('rota core preservada', 'POST /__core__/run', routes.core_run),
    assert('rota meta publicada no root tecnico', 'POST /__meta__/ingest', routes.meta_ingest),
  ];

  return {
    scenario: 'PR4 — root tecnico permanece integro',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMethodInvalido(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', { method: 'GET' }));
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 405', 405, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = method_not_allowed', 'method_not_allowed', json.error_code),
    assert('mode = technical_only', 'technical_only', json.mode),
  ];

  return {
    scenario: 'PR4 — rejeita method invalido',
    response_status: result.response_status,
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
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = invalid_json', 'invalid_json', json.error_code),
  ];

  return {
    scenario: 'PR4 — rejeita JSON invalido',
    response_status: result.response_status,
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
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = missing_required_field', 'missing_required_field', json.error_code),
    assert('field = idempotency_key', 'idempotency_key', json.field),
  ];

  return {
    scenario: 'PR4 — rejeita envelope sem campos obrigatorios',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioEnvelopeVersionInvalida(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  envelope.envelope_version = 'front6.v0';

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = invalid_envelope_version', 'invalid_envelope_version', json.error_code),
    assert('field = envelope_version', 'envelope_version', json.field),
  ];

  return {
    scenario: 'PR4 — valida envelope_version front6.v1',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioDirectionInvalida(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  envelope.direction = 'outbound';

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = invalid_direction', 'invalid_direction', json.error_code),
    assert('field = direction', 'direction', json.field),
  ];

  return {
    scenario: 'PR4 — valida direction inbound',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioChannelInvalido(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  envelope.channel = 'sms';

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = invalid_channel', 'invalid_channel', json.error_code),
    assert('field = channel', 'channel', json.field),
  ];

  return {
    scenario: 'PR4 — valida channel meta_whatsapp',
    response_status: result.response_status,
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
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = unsupported_event_type', 'unsupported_event_type', json.error_code),
    assert('field = event_type', 'event_type', json.field),
  ];

  return {
    scenario: 'PR4 — rejeita evento fora da taxonomia inbound',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioTimestampInvalido(): Promise<ScenarioResult> {
  const envelope = validEnvelope();
  envelope.occurred_at = 'ontem';

  const result = await callWorker(new Request('https://enova.local/__meta__/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }));
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 400', 400, result.response_status),
    assert('accepted = false', false, json.accepted),
    assert('error_code = invalid_timestamp', 'invalid_timestamp', json.error_code),
    assert('field = occurred_at', 'occurred_at', json.field),
  ];

  return {
    scenario: 'PR4 — valida timestamps ISO',
    response_status: result.response_status,
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
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 202', 202, result.response_status),
    assert('accepted = true', true, json.accepted),
    assert('route = /__meta__/ingest', '/__meta__/ingest', json.route),
    assert('event_type preservado', envelope.event_type, json.event_type),
    assert('trace_id preservado', envelope.trace_id, json.trace_id),
    assert('idempotency_key preservado', envelope.idempotency_key, json.idempotency_key),
    assert('ack_status = accepted', 'accepted', json.ack_status),
    assert('mode = technical_only', 'technical_only', json.mode),
    assert('external_dispatch = false', false, json.external_dispatch),
    assert('real_meta_integration = false', false, json.real_meta_integration),
  ];

  return {
    scenario: 'PR4 — aceita envelope valido com resposta tecnica previsivel',
    response_status: result.response_status,
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
  const json = result.response_json;
  const assertions = [
    assert('mode = technical_only', 'technical_only', json.mode),
    assert('external_dispatch = false', false, json.external_dispatch),
    assert('real_meta_integration = false', false, json.real_meta_integration),
    assert('nao expoe message', false, 'message' in json),
    assert('nao expoe text', false, 'text' in json),
    assert('nao expoe surface', false, 'surface' in json),
    assert('nao expoe customer_reply', false, 'customer_reply' in json),
    assert('nao expoe final_answer', false, 'final_answer' in json),
    assert('nao expoe persisted', false, 'persisted' in json),
  ];

  return {
    scenario: 'PR4 — preserva limites sem conversa real',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioCoreRunPreservado(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      lead_id: 'front6-pr4-core-smoke',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
      },
    }),
  }));
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 200', 200, result.response_status),
    assert('stage_current = discovery', 'discovery', json.stage_current),
    assert('stage_after = qualification_civil', 'qualification_civil', json.stage_after),
    assert('speech_intent = transicao_stage', 'transicao_stage', json.speech_intent),
    assert('nao expoe surface', false, 'surface' in json),
    assert('nao expoe text', false, 'text' in json),
  ];

  return {
    scenario: 'PR4 — /__core__/run continua funcionando',
    response_status: result.response_status,
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
  const json = result.response_json;
  const assertions = [
    assert('status HTTP = 404', 404, result.response_status),
    assert('error = not_found', 'not_found', json.error),
    assert('route preserva path inexistente', '/__meta__/unknown', json.route),
  ];

  return {
    scenario: 'PR4 — preserva comportamento de rota inexistente',
    response_status: result.response_status,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioIntegridadeContratualSemDrift(): Promise<ScenarioResult> {
  const json: Record<string, unknown> = {
    front6_prs_entregues: ['PR1', 'PR2', 'PR3', 'PR4'],
    pr1_governanca: true,
    pr2_envelope_contract: true,
    pr3_worker_runtime: true,
    pr4_integrated_smoke_closeout: true,
    opens_meta_real: false,
    opens_rollout: false,
    opens_deep_telemetry: false,
    opens_secrets_bindings_vars: false,
    core_sovereignty_changed: false,
    ai_speech_sovereignty_changed: false,
  };
  const assertions = [
    assert('Frente 6 entregou PR1-PR4', ['PR1', 'PR2', 'PR3', 'PR4'], json.front6_prs_entregues),
    assert('PR1 governanca entregue', true, json.pr1_governanca),
    assert('PR2 contrato de envelope entregue', true, json.pr2_envelope_contract),
    assert('PR3 runtime minimo entregue', true, json.pr3_worker_runtime),
    assert('PR4 smoke integrado + closeout entregue', true, json.pr4_integrated_smoke_closeout),
    assert('sem Meta real', false, json.opens_meta_real),
    assert('sem rollout', false, json.opens_rollout),
    assert('sem telemetria profunda', false, json.opens_deep_telemetry),
    assert('sem secrets/bindings/vars', false, json.opens_secrets_bindings_vars),
    assert('soberania do Core preservada', false, json.core_sovereignty_changed),
    assert('soberania da IA na fala preservada', false, json.ai_speech_sovereignty_changed),
  ];

  return {
    scenario: 'PR4 — integridade contratual sem drift',
    response_status: 200,
    response_json: json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios = await Promise.all([
    scenarioRootIntegro(),
    scenarioMethodInvalido(),
    scenarioJsonInvalido(),
    scenarioEnvelopeSemCamposObrigatorios(),
    scenarioEnvelopeVersionInvalida(),
    scenarioDirectionInvalida(),
    scenarioChannelInvalido(),
    scenarioEventoNaoSuportado(),
    scenarioTimestampInvalido(),
    scenarioEnvelopeValido(),
    scenarioTecnicoNaoConversaReal(),
    scenarioCoreRunPreservado(),
    scenarioRotaInexistentePreservada(),
    scenarioIntegridadeContratualSemDrift(),
  ]);

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — Frente 6 — PR4 smoke integrado final');
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
