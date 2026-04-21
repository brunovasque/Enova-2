/**
 * ENOVA 2 — Worker smoke da rota mínima do Core
 *
 * Prova mínima exigida nesta PR:
 * - o Worker expõe POST /__core__/run
 * - a rota chama o Core real
 * - a saída segue estrutural, inclusive no recorte final L17
 * - nenhuma fala mecânica é produzida
 */

import worker from './worker.ts';

interface Assertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

interface RouteScenarioResult {
  scenario: string;
  request: Record<string, unknown>;
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

async function runScenario(
  scenario: string,
  requestBody: Record<string, unknown>,
): Promise<RouteScenarioResult> {
  const request = new Request('https://enova.local/__core__/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const response = await worker.fetch(request, {} as ExecutionContext);
  const responseJson = await response.json() as Record<string, unknown>;
  const responseKeys = Object.keys(responseJson).sort();
  const expectedKeys = [
    'block_advance',
    'gates_activated',
    'next_objective',
    'speech_intent',
    'stage_after',
    'stage_current',
  ].sort();

  const assertions: Assertion[] = [
    assert('status HTTP = 200', 200, response.status),
    assert('shape estrutural exato', expectedKeys, responseKeys),
    assert('não expõe decision_id', false, 'decision_id' in responseJson),
    assert('não expõe evaluated_at', false, 'evaluated_at' in responseJson),
  ];

  return {
    scenario,
    request: requestBody,
    response_status: response.status,
    response_json: responseJson,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function main() {
  const scenarios = await Promise.all([
    runScenario('Cenário A — avanço estrutural do topo', {
      lead_id: 'worker-smoke-001',
      current_stage: 'discovery',
      facts: {
        customer_goal: 'comprar_imovel',
        offtrack_type: 'curiosidade',
      },
    }),
    runScenario('Cenário B — bloqueio estrutural por ausência de fact crítico', {
      lead_id: 'worker-smoke-002',
      current_stage: 'discovery',
      facts: {},
    }),
    runScenario('Cenário C — entrada válida em qualification_special avança para docs', {
      lead_id: 'worker-smoke-003',
      current_stage: 'qualification_special',
      facts: {
        processo: 'conjunto',
        work_regime_p2: 'clt',
        monthly_income_p2: 3600,
      },
    }),
    runScenario('Cenário D — docs completos chegam ao broker_handoff pelo Worker', {
      lead_id: 'worker-smoke-004',
      current_stage: 'docs_collection',
      facts: {
        doc_identity_status: 'validado',
        doc_income_status: 'recebido',
        doc_residence_status: 'recebido',
      },
    }),
    runScenario('Cenário E — recusa explícita de visita bloqueia o trilho presencial', {
      lead_id: 'worker-smoke-005',
      current_stage: 'docs_collection',
      facts: {
        docs_channel_choice: 'visita presencial',
        visit_interest: 'nao',
        doc_identity_status: 'validado',
        doc_income_status: 'recebido',
        doc_residence_status: 'recebido',
      },
    }),
  ]);

  const scenarioA = scenarios[0];
  scenarioA.assertions.push(
    assert('stage_after = qualification_civil', 'qualification_civil', scenarioA.response_json.stage_after),
    assert('block_advance = false', false, scenarioA.response_json.block_advance),
    assert('speech_intent = transicao_stage', 'transicao_stage', scenarioA.response_json.speech_intent),
  );
  scenarioA.passed = scenarioA.assertions.every((item) => item.passed);

  const scenarioB = scenarios[1];
  scenarioB.assertions.push(
    assert('stage_after = discovery', 'discovery', scenarioB.response_json.stage_after),
    assert('block_advance = true', true, scenarioB.response_json.block_advance),
    assert('gates_activated = [G_FATO_CRITICO_AUSENTE]', ['G_FATO_CRITICO_AUSENTE'], scenarioB.response_json.gates_activated),
    assert('speech_intent = bloqueio', 'bloqueio', scenarioB.response_json.speech_intent),
  );
  scenarioB.passed = scenarioB.assertions.every((item) => item.passed);

  const scenarioC = scenarios[2];
  scenarioC.assertions.push(
    assert('stage_after = docs_prep', 'docs_prep', scenarioC.response_json.stage_after),
    assert('block_advance = false', false, scenarioC.response_json.block_advance),
    assert('speech_intent = transicao_stage', 'transicao_stage', scenarioC.response_json.speech_intent),
  );
  scenarioC.passed = scenarioC.assertions.every((item) => item.passed);

  const scenarioD = scenarios[3];
  scenarioD.assertions.push(
    assert('stage_after = broker_handoff', 'broker_handoff', scenarioD.response_json.stage_after),
    assert('block_advance = false', false, scenarioD.response_json.block_advance),
    assert('next_objective = preparar_handoff_correspondente', 'preparar_handoff_correspondente', scenarioD.response_json.next_objective),
    assert('speech_intent = transicao_stage', 'transicao_stage', scenarioD.response_json.speech_intent),
  );
  scenarioD.passed = scenarioD.assertions.every((item) => item.passed);

  const scenarioE = scenarios[4];
  scenarioE.assertions.push(
    assert('stage_after permanece em docs_collection', 'docs_collection', scenarioE.response_json.stage_after),
    assert('block_advance = true', true, scenarioE.response_json.block_advance),
    assert('next_objective = confirmar_visit_interest', 'confirmar_visit_interest', scenarioE.response_json.next_objective),
    assert('gates_activated = [G_FINAL_OPERACIONAL]', ['G_FINAL_OPERACIONAL'], scenarioE.response_json.gates_activated),
    assert('speech_intent = bloqueio', 'bloqueio', scenarioE.response_json.speech_intent),
  );
  scenarioE.passed = scenarioE.assertions.every((item) => item.passed);

  const allPassed = scenarios.every((scenario) => scenario.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — Worker smoke da rota /__core__/run');
  console.log('===========================================');

  for (const scenario of scenarios) {
    console.log(`\n${scenario.passed ? '✅' : '❌'} ${scenario.scenario}`);
    console.log('Request:');
    console.log(JSON.stringify(scenario.request, null, 2));
    console.log('Response:');
    console.log(JSON.stringify(scenario.response_json, null, 2));

    for (const item of scenario.assertions) {
      console.log(`  ${item.passed ? '✓' : '✗'} ${item.description}`);
      if (!item.passed) {
        console.log(`    Esperado: ${JSON.stringify(item.expected)}`);
        console.log(`    Obtido:   ${JSON.stringify(item.actual)}`);
      }
    }
  }

  console.log(`\nResultado final: ${allPassed ? '✅ PASSOU' : '❌ FALHOU'}`);

  if (!allPassed) {
    process.exit(1);
  }
}

void main();
