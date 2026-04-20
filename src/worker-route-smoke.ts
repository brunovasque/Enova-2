/**
 * ENOVA 2 — Worker smoke da rota mínima do Core
 *
 * Prova mínima exigida nesta PR:
 * - o Worker expõe POST /__core__/run
 * - a rota chama o Core real
 * - a saída segue estrutural
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
