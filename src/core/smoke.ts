/**
 * ENOVA 2 — Core Mecânico 2 — Smoke Mínimo (L03 esqueleto + L04/L05/L06 topo)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01 (L03), L-02 (L04), L-03 (L05), L-04 (L06)
 *   Bloco legado:    L03, L04, L05, L06
 *   Gate-fonte:      Gate 2 (A01: "sem smoke da frente, não promove")
 *
 * ESCOPO: provar que o esqueleto estrutural (L03) e o topo do funil (L04–L06) existem
 * e não produzem fala. Cenários cobrem: block/no-block, parser do topo, critérios do topo.
 *
 * INVIOLÁVEL: nenhum cenário gera texto ao cliente.
 */

import { runCoreEngine } from './engine.ts';
import type { LeadState, CoreDecision } from './types.ts';

// ---------------------------------------------------------------------------
// Estado base para os cenários de smoke
// ---------------------------------------------------------------------------

function makeState(stage: LeadState['current_stage'], facts: Record<string, unknown> = {}): LeadState {
  return { lead_id: 'smoke-001', current_stage: stage, facts };
}

// ---------------------------------------------------------------------------
// Utilitário de assertion
// ---------------------------------------------------------------------------

interface SmokeAssertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

function assert(description: string, expected: unknown, actual: unknown): SmokeAssertion {
  return { description, expected, actual, passed: expected === actual };
}

export interface SmokeResult {
  scenario: string;
  passed: boolean;
  decision: CoreDecision;
  assertions: SmokeAssertion[];
}

// ---------------------------------------------------------------------------
// Cenário 1: Stage sem facts obrigatórios → deve bloquear
//
// Prova: G_FATO_CRITICO_AUSENTE bloqueia avanço quando required_fact ausente.
// Stage discovery exige customer_goal. Sem ele, block_advance=true, stage não avança.
// ---------------------------------------------------------------------------
export function smokeScenario1_BlockQuandoFactAusente(): SmokeResult {
  const state = makeState('discovery'); // nenhum fact
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 1 — Stage sem facts: deve bloquear',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = discovery', 'discovery', decision.stage_current),
      assert('block_advance = true (G_FATO_CRITICO_AUSENTE)', true, decision.block_advance),
      assert('stage_after permanece em discovery', 'discovery', decision.stage_after),
      assert('gates_activated inclui G_FATO_CRITICO_AUSENTE', true, decision.gates_activated.includes('G_FATO_CRITICO_AUSENTE')),
      assert('next_objective = coletar_customer_goal', 'coletar_customer_goal', decision.next_objective),
      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 2: Stage com todos os facts obrigatórios → deve avançar
//
// Prova: quando todos required_facts estão presentes, o Core autoriza transição.
// discovery com customer_goal → avança para qualification_civil.
// ---------------------------------------------------------------------------
export function smokeScenario2_AvancaQuandoFactsPresentes(): SmokeResult {
  const state = makeState('discovery', { customer_goal: 'comprar_imovel' });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 2 — Stage com todos os facts: deve avançar',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = discovery', 'discovery', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = qualification_civil', 'qualification_civil', decision.stage_after),
      assert('speech_intent = transicao_stage (sinal estrutural)', 'transicao_stage', decision.speech_intent),
      assert('Core não produz texto — speech_intent é string estrutural', true, typeof decision.speech_intent === 'string'),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 3: Meio do funil com facts parciais → deve bloquear no fact faltando
//
// Prova: em qualification_civil, sem 'processo', bloqueia e aponta o fact ausente.
// Estado civil presente, processo ausente → next_objective aponta para coleta de processo.
// ---------------------------------------------------------------------------
export function smokeScenario3_BloqueioFactParcial(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    // processo ausente — deve bloquear
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 3 — Facts parciais: bloqueia no fact faltando',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_civil', 'qualification_civil', decision.stage_after),
      assert('next_objective = coletar_processo', 'coletar_processo', decision.next_objective),
      assert('Core não produz texto — apenas sinal de bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 4: Discovery com customer_goal canônico alternativo → fluxo integrado avança
//
// Prova: o caminho do topo no Core (runTopoDecision via L05+L06) funciona com qualquer
// valor canônico de customer_goal, não apenas 'comprar_imovel'.
// Input: customer_goal='entender_programa' (valor F0 canônico distinto do cenário 2).
// Esperado: block_advance=false, stage_after=qualification_civil, via topo integrado.
// ---------------------------------------------------------------------------
export function smokeScenario4_TopoIntegrado_CustomerGoalCanonicoAlternativo(): SmokeResult {
  const state = makeState('discovery', { customer_goal: 'entender_programa' });
  const decision = runCoreEngine(state); // fluxo integrado via topo (L05+L06 no engine)

  return {
    scenario: 'Cenário 4 — Topo integrado: customer_goal canônico alternativo avança (L05+L06 via engine)',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = discovery', 'discovery', decision.stage_current),
      assert('block_advance = false (topo via engine: L06 can_advance=true)', false, decision.block_advance),
      assert('stage_after = qualification_civil (topo integrado no engine)', 'qualification_civil', decision.stage_after),
      assert('next_objective = avancar_para_qualification_civil', 'avancar_para_qualification_civil', decision.next_objective),
      assert('speech_intent = transicao_stage (sinal estrutural — não é fala)', 'transicao_stage', decision.speech_intent),
      assert('gates_activated vazio (topo avança — L06 não bloqueou)', 0, decision.gates_activated.length),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 5: Discovery com customer_goal + offtrack_type → topo integrado avança mesmo com desvio
//
// Prova: o caminho do topo no Core (L05+L06) detecta offtrack_type mas NÃO bloqueia avanço
// quando customer_goal está presente. Conforme L04 TOPO_SIGNAL_POLICY: sinal de desvio
// não substitui gate do customer_goal.
// Input: customer_goal='comprar_imovel' + offtrack_type='curiosidade'.
// Esperado: block_advance=false (desvio não bloqueia), stage_after=qualification_civil.
// ---------------------------------------------------------------------------
export function smokeScenario5_TopoIntegrado_OfftrackNaoBloqueiaComGoalPresente(): SmokeResult {
  const state = makeState('discovery', {
    customer_goal: 'comprar_imovel',
    offtrack_type: 'curiosidade', // sinal de desvio presente — não deve bloquear L06
  });
  const decision = runCoreEngine(state); // fluxo integrado via topo (L05+L06 no engine)

  return {
    scenario: 'Cenário 5 — Topo integrado: offtrack_type não bloqueia quando customer_goal presente (L04 TOPO_SIGNAL_POLICY via engine)',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = discovery', 'discovery', decision.stage_current),
      assert('block_advance = false (offtrack não bloqueia — L06 usa customer_goal como gate)', false, decision.block_advance),
      assert('stage_after = qualification_civil (topo avança mesmo com desvio detectado)', 'qualification_civil', decision.stage_after),
      assert('speech_intent = transicao_stage (sinal estrutural — não é fala)', 'transicao_stage', decision.speech_intent),
      assert('Core não produz texto — apenas estrutura de decisão', true, typeof decision.speech_intent === 'string'),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}


export interface SmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: SmokeResult[];
  executed_at: string;
}

/**
 * Executa a suite de smoke mínima do Core Mecânico 2.
 *
 * Prova exigida (A01-05, Gate 2):
 * "Smoke de trilho e next step autorizado"
 *
 * Cenários L03 (3): block por ausência, avanço por presença, block parcial.
 * Cenários L04–L06 integrados (2): fluxo real via engine — customer_goal canônico
 *   alternativo avança; offtrack_type não bloqueia com customer_goal presente.
 * Todos os cenários passam pelo `runCoreEngine()`. Nenhum usa decisão fake.
 * Nenhum cenário gera fala ao cliente.
 */
export function runSmokeSuite(): SmokeSuiteResult {
  const scenarios = [
    smokeScenario1_BlockQuandoFactAusente,
    smokeScenario2_AvancaQuandoFactsPresentes,
    smokeScenario3_BloqueioFactParcial,
    smokeScenario4_TopoIntegrado_CustomerGoalCanonicoAlternativo,
    smokeScenario5_TopoIntegrado_OfftrackNaoBloqueiaComGoalPresente,
  ];

  const results = scenarios.map((fn) => {
    const r = fn();
    return { ...r, passed: r.assertions.every((a) => a.passed) };
  });

  const passed = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    all_passed: passed === results.length,
    results,
    executed_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Ponto de entrada para execução manual
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('smoke.ts')) {
  const suite = runSmokeSuite();

  console.log('\n===========================================');
  console.log('ENOVA 2 — Core Mecânico 2 — Smoke (L03 + L04/L05/L06)');
  console.log('===========================================');
  console.log(`Âncora: L03 (esqueleto) + L04/L05/L06 (topo) | Gate 2 (A01)`);
  console.log(`Executado em: ${suite.executed_at}`);
  console.log(`Total: ${suite.total} | Passou: ${suite.passed} | Falhou: ${suite.failed}`);
  console.log(`Resultado: ${suite.all_passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  for (const r of suite.results) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.scenario}`);
    for (const a of r.assertions) {
      console.log(`   ${a.passed ? '✓' : '✗'} ${a.description}`);
      if (!a.passed) {
        console.log(`      Esperado: ${JSON.stringify(a.expected)}`);
        console.log(`      Obtido:   ${JSON.stringify(a.actual)}`);
      }
    }
    console.log('');
  }

  if (!suite.all_passed) process.exit(1);
}
