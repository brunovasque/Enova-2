import worker from '../worker.ts';
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

function findEvidence(traceId: string, eventName: string) {
  return readE1EvidenceBuffer().find((event) => event.trace_id === traceId && event.event_name === eventName);
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

async function scenarioLayerStructuresExist(): Promise<ScenarioResult> {
  resetE1TechnicalStore();
  clearE1EvidenceBuffer();
  const snapshot = getE1StoreSnapshot();

  const assertions: Assertion[] = [
    assertTrue('camada A (normativa) possui estrutura mínima', snapshot.normative_count > 0, snapshot.normative_count),
    assertTrue('camada B (comercial) possui estrutura mínima', snapshot.commercial_count > 0, snapshot.commercial_count),
    assertTrue('camada C (memória técnica) inicia sem lixo operacional', snapshot.lead_memory_count === 0, snapshot.lead_memory_count),
    assertTrue('camada D (manual) possui estrutura mínima', snapshot.manual_count > 0, snapshot.manual_count),
    assertTrue(
      'item normativo contém citation_ref',
      typeof snapshot.first_normative?.citation_ref === 'string' && snapshot.first_normative.citation_ref.length > 0,
      snapshot.first_normative,
    ),
    assertTrue(
      'regra comercial contém guidance e restrictions',
      typeof snapshot.first_commercial?.guidance === 'string'
        && Array.isArray(snapshot.first_commercial?.restrictions)
        && (snapshot.first_commercial?.restrictions.length ?? 0) > 0,
      snapshot.first_commercial,
    ),
    assertTrue(
      'diretiva manual contém author/scope/priority',
      typeof snapshot.first_manual?.author === 'string'
        && typeof snapshot.first_manual?.scope === 'string'
        && typeof snapshot.first_manual?.priority === 'string',
      snapshot.first_manual,
    ),
  ];

  return {
    scenario: 'PR3 E1 — estruturas mínimas das 4 camadas existem',
    response_status: 200,
    response_json: snapshot as unknown as Record<string, unknown>,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMemoryTechnicalMinimum(): Promise<ScenarioResult> {
  resetE1TechnicalStore();
  clearE1EvidenceBuffer();
  const traceId = 'e1-pr3-memory-trace';

  const hook = applyE1CoreHook({
    trace_id: traceId,
    correlation_id: traceId,
    request_id: 'e1-pr3-memory-req',
    lead_id: 'lead-e1-smoke-memory',
    current_stage: 'qualification_renda',
    facts: {
      renda_principal: 4300,
    },
  });

  const blockedMemory = recordLeadMemory({
    lead_id: 'lead-e1-smoke-memory',
    tipo: 'sinal_risco',
    conteudo: 'inferencia sem evidência forte',
    evidencia_tipo: 'inferencia',
    origem: 'extracao_llm',
    created_by: 'e1-smoke',
    confianca: 'hipotese',
  });

  const context = buildE1TechnicalContext('lead-e1-smoke-memory');
  emitE1SmokeEvidence(traceId, 'e1-pr3-memory-evidence', {
    scenario: 'memory_technical_minimum',
  });

  const leadEvent = findEvidence(traceId, 'e1.runtime.memory.lead_recorded');
  const contextEvent = findEvidence(traceId, 'e1.runtime.integration.cognitive_context_built');
  const smokeEvent = findEvidence(traceId, 'e1.runtime.smoke.evidence_recorded');

  const assertions: Assertion[] = [
    assertTrue('hook técnico registrou memória de lead', typeof hook.lead_memory_status === 'string', hook.lead_memory_status),
    assert('memória sem evidência forte fica bloqueada', 'bloqueada', blockedMemory.status),
    assertTrue('contexto cognitivo local está disponível', context.integration.cognitive_context_available, context.integration),
    assert('escrita funcional no CRM continua bloqueada', false, context.integration.crm_write_enabled),
    assertTrue('evento de memória foi emitido', Boolean(leadEvent), leadEvent ?? null),
    assertTrue('evento de contexto cognitivo foi emitido', Boolean(contextEvent), contextEvent ?? null),
    assertTrue('smoke evidence foi emitida', Boolean(smokeEvent), smokeEvent ?? null),
  ];

  return {
    scenario: 'PR3 E1 — memória técnica mínima funciona e bloqueia inferência fraca',
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

async function scenarioNormativeConsultiveBase(): Promise<ScenarioResult> {
  const result = consultNormativeBase({
    citation_ref: 'CEF-2024-03 §4.2.1',
  });

  const assertions: Assertion[] = [
    assert('consulta encontrou item normativo', true, result.found),
    assert('resultado é marcado como source_kind normativo', 'normativo', result.source_kind),
    assert('item ativo é aplicável', true, result.applicable),
    assertTrue('citation_ref permanece explícita', typeof result.item?.citation_ref === 'string', result.item ?? null),
  ];

  return {
    scenario: 'PR3 E1 — base normativa mínima é consultável localmente',
    response_status: 200,
    response_json: result as unknown as Record<string, unknown>,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioCommercialRulesReadable(): Promise<ScenarioResult> {
  const rules = readCommercialRulesForContext({
    scope_hint: 'discovery',
  });

  const first = rules[0];
  const assertions: Assertion[] = [
    assertTrue('há pelo menos uma regra comercial ativa', rules.length > 0, rules.length),
    assert('status da regra permanece ativa', 'ativa', first?.status),
    assertTrue(
      'regra mantém restrições explícitas',
      Array.isArray(first?.restrictions) && (first?.restrictions.length ?? 0) > 0,
      first?.restrictions ?? null,
    ),
    assertTrue('regra mantém guidance técnico', typeof first?.guidance === 'string' && first.guidance.length > 0, first?.guidance ?? null),
  ];

  return {
    scenario: 'PR3 E1 — regras comerciais mínimas são lidas tecnicamente',
    response_status: 200,
    response_json: {
      count: rules.length,
      first_rule: first ?? null,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioManualDirectiveValidation(): Promise<ScenarioResult> {
  clearE1EvidenceBuffer();
  const traceId = 'e1-pr3-manual-trace';

  const invalid = validateManualDirectiveForRuntime(
    {
      created_at: '2026-04-22T12:00:00Z',
      scope: 'global',
      priority: 'alta',
      directive_type: 'cuidado_operacional',
      content: 'Teste sem author',
      rationale: 'Teste de validação',
      audit_ref: 'E1-SMOKE-INVALID',
    },
    {
      trace_id: traceId,
      correlation_id: traceId,
      request_id: 'e1-pr3-manual-invalid',
      lead_id: 'lead-e1-smoke-manual',
    },
  );

  const valid = validateManualDirectiveForRuntime(
    {
      author: 'operador-smoke',
      created_at: '2026-04-22T12:00:00Z',
      scope: 'global',
      priority: 'alta',
      directive_type: 'cuidado_operacional',
      content: 'Priorizar separação entre norma e heurística.',
      rationale: 'Garantir consistência técnica.',
      audit_ref: 'E1-SMOKE-VALID',
    },
    {
      trace_id: traceId,
      correlation_id: traceId,
      request_id: 'e1-pr3-manual-valid',
      lead_id: 'lead-e1-smoke-manual',
    },
  );

  const validationEvents = readE1EvidenceBuffer().filter((event) => event.event_name === 'e1.runtime.manual.directive_validated');

  const assertions: Assertion[] = [
    assert('diretiva sem author é rejeitada', false, invalid.ok),
    assert('diretiva válida é aceita', true, valid.ok),
    assertTrue('eventos técnicos de validação foram emitidos', validationEvents.length >= 2, validationEvents.length),
  ];

  return {
    scenario: 'PR3 E1 — diretiva manual mínima valida author/data/escopo/prioridade',
    response_status: 200,
    response_json: {
      invalid,
      valid,
      validations_emitted: validationEvents.length,
    },
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioCoreRouteIntegrity(): Promise<ScenarioResult> {
  resetE1TechnicalStore();
  clearE1EvidenceBuffer();
  const traceId = 'e1-pr3-core-route-trace';

  const result = await callWorker(new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trace-id': traceId,
    },
    body: JSON.stringify({
      lead_id: 'lead-e1-route-core',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
      },
    }),
  }));

  emitE1SmokeEvidence(traceId, 'e1-pr3-core-route-evidence', {
    scenario: 'core_route_integrity',
  });

  const hookEvent = findEvidence(traceId, 'e1.runtime.hook.core_registered');

  const assertions: Assertion[] = [
    assert('status HTTP /__core__/run = 200', 200, result.status),
    assert('rota core preserva resposta estrutural', 'qualification_civil', result.json.stage_after),
    assertTrue('hook técnico do E1 foi emitido no core', Boolean(hookEvent), hookEvent ?? null),
    assert('nenhuma surface final foi criada', false, 'surface' in result.json),
    assert('nenhuma fala final foi criada', false, 'message' in result.json),
  ];

  return {
    scenario: 'PR3 E1 — /__core__/run permanece íntegro com hook mínimo',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioMetaRouteIntegrity(): Promise<ScenarioResult> {
  clearE1EvidenceBuffer();
  const traceId = 'e1-pr3-meta-route-trace';

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
      event_id: 'wamid.e1.pr3.meta.001',
      occurred_at: '2026-04-22T23:00:00Z',
      received_at: '2026-04-22T23:00:01Z',
      trace_id: traceId,
      idempotency_key: 'meta_whatsapp:wamid.e1.pr3.meta.001',
      lead_ref: 'lead-e1-route-meta',
      payload: {
        text: 'teste e1 pr3',
      },
    }),
  }));

  emitE1SmokeEvidence(traceId, 'e1-pr3-meta-route-evidence', {
    scenario: 'meta_route_integrity',
  });

  const hookEvent = findEvidence(traceId, 'e1.runtime.hook.channel_registered');

  const assertions: Assertion[] = [
    assert('status HTTP /__meta__/ingest = 202', 202, result.status),
    assert('accepted = true', true, result.json.accepted),
    assert('mode = technical_only', 'technical_only', result.json.mode),
    assertTrue('hook técnico do E1 foi emitido no canal', Boolean(hookEvent), hookEvent ?? null),
    assert('nenhuma fala final foi criada', false, 'message' in result.json),
  ];

  return {
    scenario: 'PR3 E1 — /__meta__/ingest permanece íntegro com hook mínimo',
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
    scenario: 'PR3 E1 — rota inexistente permanece not_found',
    response_status: result.status,
    response_json: result.json,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function scenarioExternalBoundariesPreserved(): Promise<ScenarioResult> {
  const context = buildE1TechnicalContext('lead-e1-boundary-check');

  const assertions: Assertion[] = [
    assert('modo permanece technical_local_only', 'technical_local_only', context.mode),
    assert('crm_write_enabled = false', false, context.integration.crm_write_enabled),
    assert('external_dispatch_enabled = false', false, context.integration.external_dispatch_enabled),
    assert('core soberano preservado', true, context.integration.core_sovereignty_preserved),
    assert('speech surface override continua desabilitado', false, context.integration.speech_surface_override_enabled),
  ];

  return {
    scenario: 'PR3 E1 — fronteiras externas permanecem bloqueadas',
    response_status: 200,
    response_json: context as unknown as Record<string, unknown>,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios: ScenarioResult[] = [];
  scenarios.push(await scenarioLayerStructuresExist());
  scenarios.push(await scenarioMemoryTechnicalMinimum());
  scenarios.push(await scenarioNormativeConsultiveBase());
  scenarios.push(await scenarioCommercialRulesReadable());
  scenarios.push(await scenarioManualDirectiveValidation());
  scenarios.push(await scenarioCoreRouteIntegrity());
  scenarios.push(await scenarioMetaRouteIntegrity());
  scenarios.push(await scenarioNotFoundIntegrity());
  scenarios.push(await scenarioExternalBoundariesPreserved());

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — E1 — PR3 smoke mínimo de runtime');
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

