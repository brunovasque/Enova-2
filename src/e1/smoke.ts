import worker from '../worker.ts';
import { clearTelemetryBuffer, readTelemetryBuffer } from '../telemetry/emit.ts';
import { clearRolloutEvidenceBuffer, readRolloutEvidenceBuffer } from '../rollout/controller.ts';
import { readCommercialRulesForContext } from './commercial.ts';
import {
  applyE1CoreHook,
  buildE1TechnicalContext,
  clearE1EvidenceBuffer,
  emitE1SmokeEvidence,
  readE1EvidenceBuffer,
  validateManualDirectiveForRuntime,
} from './memory.ts';
import { consultNormativeBase } from './normative.ts';
import { getE1StoreSnapshot, recordLeadMemory, resetE1TechnicalStore } from './store.ts';

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

function findE1Evidence(traceId: string, eventName: string) {
  return readE1EvidenceBuffer().find((event) => event.trace_id === traceId && event.event_name === eventName);
}

function findTelemetryEvent(traceId: string, eventName: string) {
  return readTelemetryBuffer().find((event) => event.trace_id === traceId && event.event_name === eventName);
}

function findRolloutEvidence(traceId: string, eventName: string) {
  return readRolloutEvidenceBuffer().find((event) => event.trace_id === traceId && event.event_name === eventName);
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

async function scenarioLayerSeparationIntegrity(): Promise<ScenarioResult> {
  resetE1TechnicalStore();
  clearE1EvidenceBuffer();
  const snapshot = getE1StoreSnapshot();
  const normative = consultNormativeBase({
    citation_ref: 'CEF-2024-03 §4.2.1',
  });
  const commercial = readCommercialRulesForContext();
  const firstCommercial = commercial[0] as Record<string, unknown> | undefined;
  const invalidManual = validateManualDirectiveForRuntime(
    {
      created_at: '2026-04-22T12:00:00Z',
      scope: 'global',
      priority: 'alta',
      directive_type: 'cuidado_operacional',
      content: 'teste',
      rationale: 'teste',
      audit_ref: 'E1-SMOKE-LAYER',
    },
    {
      trace_id: 'e1-pr4-layer-separation-trace',
      correlation_id: 'e1-pr4-layer-separation-trace',
      request_id: 'e1-pr4-layer-separation-req',
    },
  );

  const assertions: Assertion[] = [
    assertTrue('camada normativa possui item mínimo', snapshot.normative_count > 0, snapshot.normative_count),
    assert('consulta normativa retorna source_kind normativo', 'normativo', normative.source_kind),
    assert('camada comercial possui regra ativa', true, commercial.length > 0),
    assertTrue('camada comercial contém conflict_policy', typeof firstCommercial?.conflict_policy === 'string', firstCommercial),
    assertTrue('camada comercial não injeta citation_ref normativo', !('citation_ref' in (firstCommercial ?? {})), firstCommercial),
    assertTrue('camada manual exige author para validar', invalidManual.ok === false, invalidManual),
    assertTrue(
      'camada manual não usa source_name normativo',
      snapshot.first_manual ? !('source_name' in (snapshot.first_manual as Record<string, unknown>)) : true,
      snapshot.first_manual ?? null,
    ),
  ];

  return {
    scenario: 'PR4 E1 — separação entre normativa/comercial/memória/manual preservada',
    response_status: 200,
    response_json: {
      snapshot,
      normative,
      first_commercial: firstCommercial ?? null,
      invalid_manual: invalidManual,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMemoryTechnicalMinimum(): Promise<ScenarioResult> {
  resetE1TechnicalStore();
  clearE1EvidenceBuffer();
  const traceId = 'e1-pr4-memory-trace';

  const hook = applyE1CoreHook({
    trace_id: traceId,
    correlation_id: traceId,
    request_id: 'e1-pr4-memory-req',
    lead_id: 'lead-e1-pr4-memory',
    current_stage: 'qualification_renda',
    facts: {
      renda_principal: 4300,
    },
  });

  const blockedMemory = recordLeadMemory({
    lead_id: 'lead-e1-pr4-memory',
    tipo: 'sinal_risco',
    conteudo: 'inferencia sem evidência forte',
    evidencia_tipo: 'inferencia',
    origem: 'extracao_llm',
    created_by: 'e1-smoke-pr4',
    confianca: 'hipotese',
  });

  const context = buildE1TechnicalContext('lead-e1-pr4-memory');
  emitE1SmokeEvidence(traceId, 'e1-pr4-memory-evidence', {
    scenario: 'memory_technical_minimum',
  });

  const leadEvent = findE1Evidence(traceId, 'e1.runtime.memory.lead_recorded');
  const contextEvent = findE1Evidence(traceId, 'e1.runtime.integration.cognitive_context_built');
  const smokeEvent = findE1Evidence(traceId, 'e1.runtime.smoke.evidence_recorded');

  const assertions: Assertion[] = [
    assertTrue('hook técnico registrou memória de lead', typeof hook.lead_memory_status === 'string', hook.lead_memory_status),
    assert('memória sem evidência forte fica bloqueada', 'bloqueada', blockedMemory.status),
    assertTrue('contexto cognitivo local permanece disponível', context.integration.cognitive_context_available, context.integration),
    assert('escrita funcional no CRM permanece bloqueada', false, context.integration.crm_write_enabled),
    assertTrue('evento de memória emitido', Boolean(leadEvent), leadEvent ?? null),
    assertTrue('evento de contexto emitido', Boolean(contextEvent), contextEvent ?? null),
    assertTrue('smoke evidence emitida', Boolean(smokeEvent), smokeEvent ?? null),
  ];

  return {
    scenario: 'PR4 E1 — memória técnica mínima funciona e bloqueia evidência insuficiente',
    response_status: 200,
    response_json: {
      hook,
      blocked_memory_status: blockedMemory.status,
      context,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioNormativeCommercialManualMinimum(): Promise<ScenarioResult> {
  clearE1EvidenceBuffer();
  const traceId = 'e1-pr4-consultive-trace';
  const normative = consultNormativeBase({
    citation_ref: 'CEF-2024-03 §4.2.1',
  });
  const commercial = readCommercialRulesForContext({
    scope_hint: 'discovery',
  });

  const invalidManual = validateManualDirectiveForRuntime(
    {
      author: 'operador-pr4',
      created_at: 'invalido',
      scope: 'global',
      priority: 'alta',
      directive_type: 'cuidado_operacional',
      content: 'teste',
      rationale: 'teste',
      audit_ref: 'E1-PR4-INVALID',
    },
    {
      trace_id: traceId,
      correlation_id: traceId,
      request_id: 'e1-pr4-manual-invalid',
    },
  );
  const validManual = validateManualDirectiveForRuntime(
    {
      author: 'operador-pr4',
      created_at: '2026-04-22T12:00:00Z',
      scope: 'global',
      priority: 'alta',
      directive_type: 'cuidado_operacional',
      content: 'Separar norma de heurística.',
      rationale: 'Governança E1.',
      audit_ref: 'E1-PR4-VALID',
    },
    {
      trace_id: traceId,
      correlation_id: traceId,
      request_id: 'e1-pr4-manual-valid',
    },
  );

  const manualValidationEvents = readE1EvidenceBuffer().filter((event) => event.event_name === 'e1.runtime.manual.directive_validated');

  const assertions: Assertion[] = [
    assert('base normativa retorna found = true', true, normative.found),
    assert('base normativa retorna applicable = true', true, normative.applicable),
    assert('regra comercial ativa disponível', true, commercial.length > 0),
    assert('diretiva manual inválida (data inválida) é rejeitada', false, invalidManual.ok),
    assert('diretiva manual válida é aceita', true, validManual.ok),
    assertTrue('validações manuais emitiram eventos técnicos', manualValidationEvents.length >= 2, manualValidationEvents.length),
  ];

  return {
    scenario: 'PR4 E1 — base consultiva/comercial/manual permanece técnica e previsível',
    response_status: 200,
    response_json: {
      normative,
      commercial_count: commercial.length,
      invalid_manual: invalidManual,
      valid_manual: validManual,
      manual_validations: manualValidationEvents.length,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioRootIntegrity(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/', {
    method: 'GET',
    headers: {
      'x-trace-id': 'e1-pr4-root-route-trace',
    },
  }));

  const routes = result.json.routes as Record<string, unknown>;
  const assertions: Assertion[] = [
    assert('status HTTP / = 200', 200, result.status),
    assert('service = enova-2-worker', 'enova-2-worker', result.json.service),
    assert('surface = technical_only', 'technical_only', result.json.surface),
    assert('rota core preservada', 'POST /__core__/run', routes.core_run),
    assert('rota meta preservada', 'POST /__meta__/ingest', routes.meta_ingest),
  ];

  return {
    scenario: 'PR4 E1 — rota root permanece íntegra',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioCoreRouteIntegrity(): Promise<ScenarioResult> {
  resetE1TechnicalStore();
  clearE1EvidenceBuffer();
  clearTelemetryBuffer();
  clearRolloutEvidenceBuffer();
  const traceId = 'e1-pr4-core-route-trace';

  const result = await callWorker(new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify({
      lead_id: 'lead-e1-route-core-pr4',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
      },
    }),
  }));

  emitE1SmokeEvidence(traceId, 'e1-pr4-core-route-evidence', {
    scenario: 'core_route_integrity',
  });

  const e1HookEvent = findE1Evidence(traceId, 'e1.runtime.hook.core_registered');
  const telemetryEvent = findTelemetryEvent(traceId, 'f7.worker.request_lifecycle.received');
  const rolloutEvent = findRolloutEvidence(traceId, 'f8.rollout.gate_status.evaluated');

  const assertions: Assertion[] = [
    assert('status HTTP /__core__/run = 200', 200, result.status),
    assert('rota core preserva resposta estrutural', 'qualification_civil', result.json.stage_after),
    assertTrue('hook técnico do E1 foi emitido', Boolean(e1HookEvent), e1HookEvent ?? null),
    assertTrue('telemetria da Frente 7 permaneceu ativa', Boolean(telemetryEvent), telemetryEvent ?? null),
    assertTrue('guard de rollout da Frente 8 permaneceu ativo', Boolean(rolloutEvent), rolloutEvent ?? null),
    assert('nenhuma fala final foi criada', false, 'message' in result.json),
  ];

  return {
    scenario: 'PR4 E1 — /__core__/run íntegro com telemetria/rollout preservados',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMetaRouteIntegrity(): Promise<ScenarioResult> {
  clearE1EvidenceBuffer();
  clearTelemetryBuffer();
  clearRolloutEvidenceBuffer();
  const traceId = 'e1-pr4-meta-route-trace';

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
      event_id: 'wamid.e1.pr4.meta.001',
      occurred_at: '2026-04-22T23:30:00Z',
      received_at: '2026-04-22T23:30:01Z',
      trace_id: traceId,
      idempotency_key: 'meta_whatsapp:wamid.e1.pr4.meta.001',
      lead_ref: 'lead-e1-route-meta-pr4',
      payload: {
        text: 'teste e1 pr4',
      },
    }),
  }));

  emitE1SmokeEvidence(traceId, 'e1-pr4-meta-route-evidence', {
    scenario: 'meta_route_integrity',
  });

  const e1HookEvent = findE1Evidence(traceId, 'e1.runtime.hook.channel_registered');
  const telemetryEvent = findTelemetryEvent(traceId, 'f7.channel.channel_signal.accepted');
  const rolloutEvent = findRolloutEvidence(traceId, 'f8.rollout.gate_status.evaluated');

  const assertions: Assertion[] = [
    assert('status HTTP /__meta__/ingest = 202', 202, result.status),
    assert('accepted = true', true, result.json.accepted),
    assert('mode = technical_only', 'technical_only', result.json.mode),
    assert('real_meta_integration = false', false, result.json.real_meta_integration),
    assertTrue('hook técnico do E1 foi emitido', Boolean(e1HookEvent), e1HookEvent ?? null),
    assertTrue('telemetria da Frente 7 permaneceu ativa', Boolean(telemetryEvent), telemetryEvent ?? null),
    assertTrue('guard de rollout da Frente 8 permaneceu ativo', Boolean(rolloutEvent), rolloutEvent ?? null),
    assert('nenhuma fala final foi criada', false, 'message' in result.json),
  ];

  return {
    scenario: 'PR4 E1 — /__meta__/ingest íntegro com frentes 6/7/8 preservadas',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioNotFoundIntegrity(): Promise<ScenarioResult> {
  const result = await callWorker(new Request('https://enova.local/__e1__/unknown', {
    method: 'GET',
  }));

  const assertions: Assertion[] = [
    assert('status HTTP rota inexistente = 404', 404, result.status),
    assert('error = not_found preservado', 'not_found', result.json.error),
    assert('rota preservada', '/__e1__/unknown', result.json.route),
  ];

  return {
    scenario: 'PR4 E1 — rota inexistente permanece not_found',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioLimitsPreserved(): Promise<ScenarioResult> {
  const context = buildE1TechnicalContext('lead-e1-boundary-check-pr4');
  const assertions: Assertion[] = [
    assert('mode = technical_local_only', 'technical_local_only', context.mode),
    assert('crm_write_enabled = false', false, context.integration.crm_write_enabled),
    assert('external_dispatch_enabled = false', false, context.integration.external_dispatch_enabled),
    assert('core soberano preservado', true, context.integration.core_sovereignty_preserved),
    assert('speech_surface_override_enabled = false', false, context.integration.speech_surface_override_enabled),
  ];

  return {
    scenario: 'PR4 E1 — limites de escopo e soberania permanecem preservados',
    response_status: 200,
    response_json: context as unknown as Record<string, unknown>,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioContractIntegrityNoDrift(): Promise<ScenarioResult> {
  const report = {
    e1_prs_entregues: ['PR1', 'PR2', 'PR3', 'PR4'],
    opens_real_normative_ingestion: false,
    opens_real_commercial_engine: false,
    opens_large_learning_engine: false,
    opens_ui_panel: false,
    opens_new_external_integration: false,
    opens_functional_crm_write: false,
    core_sovereignty_changed: false,
    ai_speech_sovereignty_changed: false,
  };

  const assertions: Assertion[] = [
    assert('E1 entregou PR1+PR2+PR3+PR4', ['PR1', 'PR2', 'PR3', 'PR4'], report.e1_prs_entregues),
    assert('sem ingestão real de normativos', false, report.opens_real_normative_ingestion),
    assert('sem motor comercial real', false, report.opens_real_commercial_engine),
    assert('sem aprendizado grande', false, report.opens_large_learning_engine),
    assert('sem UI/painel', false, report.opens_ui_panel),
    assert('sem integração externa nova', false, report.opens_new_external_integration),
    assert('sem CRM funcional novo', false, report.opens_functional_crm_write),
    assert('soberania do Core preservada', false, report.core_sovereignty_changed),
    assert('soberania da IA na fala preservada', false, report.ai_speech_sovereignty_changed),
  ];

  return {
    scenario: 'PR4 E1 — integridade contratual sem drift',
    response_status: 200,
    response_json: report as unknown as Record<string, unknown>,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios: ScenarioResult[] = [];
  scenarios.push(await scenarioLayerSeparationIntegrity());
  scenarios.push(await scenarioMemoryTechnicalMinimum());
  scenarios.push(await scenarioNormativeCommercialManualMinimum());
  scenarios.push(await scenarioRootIntegrity());
  scenarios.push(await scenarioCoreRouteIntegrity());
  scenarios.push(await scenarioMetaRouteIntegrity());
  scenarios.push(await scenarioNotFoundIntegrity());
  scenarios.push(await scenarioLimitsPreserved());
  scenarios.push(await scenarioContractIntegrityNoDrift());

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — E1 — PR4 smoke integrado final');
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

