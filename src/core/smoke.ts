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
import { extractTopoSignals } from './topo-parser.ts';
import { evaluateTopoCriteria } from './topo-gates.ts';
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
// Cenário 4: Parser do topo reconhece customer_goal → parse_status=ready
//
// Prova: L05 — topo-parser normaliza customer_goal e produz TopoSignals correto.
// Input: facts com customer_goal=comprar_imovel (valor canônico).
// Esperado: customer_goal_detected=true, parse_status='ready'.
// ---------------------------------------------------------------------------
export function smokeScenario4_ParserTopoReconheceCustomerGoal(): SmokeResult {
  const input = {
    facts_current: {},
    facts_extracted: { customer_goal: 'comprar_imovel' },
  };

  const signals = extractTopoSignals(input);

  // Provar que o parser detectou corretamente (não usa CoreDecision — é smoke do L05)
  const fakeDecision: CoreDecision = {
    stage_current: 'discovery',
    stage_after: 'discovery',
    next_objective: 'smoke_l05',
    block_advance: false,
    gates_activated: [],
    speech_intent: 'coleta_dado',
    decision_id: 'smoke-l05-004',
    evaluated_at: new Date().toISOString(),
  };

  return {
    scenario: 'Cenário 4 — Parser do topo reconhece customer_goal (L05)',
    passed: true,
    decision: fakeDecision,
    assertions: [
      assert('customer_goal_detected = true', true, signals.customer_goal_detected),
      assert('customer_goal_value = comprar_imovel', 'comprar_imovel', signals.customer_goal_value),
      assert('parse_status = ready', 'ready', signals.parse_status),
      assert('offtrack_detected = false (sem sinal de desvio)', false, signals.offtrack_detected),
      assert('Parser não produz texto — apenas sinais estruturais', true, typeof signals.customer_goal_value === 'string'),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 5: Critérios do topo com customer_goal → can_advance=true, next=qualification_civil
//
// Prova: L06 — topo-gates autoriza avanço quando customer_goal está presente.
// Input: TopoSignals com customer_goal_detected=true.
// Esperado: can_advance=true, authorized_next_step='qualification_civil'.
// ---------------------------------------------------------------------------
export function smokeScenario5_CriteriosTopoComanAdvance(): SmokeResult {
  const signals = extractTopoSignals({
    facts_current: {},
    facts_extracted: { customer_goal: 'comprar_imovel' },
  });

  const criteria = evaluateTopoCriteria(signals);

  const fakeDecision: CoreDecision = {
    stage_current: 'discovery',
    stage_after: 'qualification_civil',
    next_objective: 'avancar_para_qualification_civil',
    block_advance: false,
    gates_activated: [],
    speech_intent: 'transicao_stage',
    decision_id: 'smoke-l06-005',
    evaluated_at: new Date().toISOString(),
  };

  return {
    scenario: 'Cenário 5 — Critérios do topo: can_advance=true, next=qualification_civil (L06)',
    passed: true,
    decision: fakeDecision,
    assertions: [
      assert('can_advance = true (customer_goal presente)', true, criteria.can_advance),
      assert('authorized_next_step = qualification_civil', 'qualification_civil', criteria.authorized_next_step),
      assert('missing_required_facts vazia', 0, criteria.missing_required_facts.length),
      assert('criteria_code = topo.customer_goal_presente', 'topo.customer_goal_presente', criteria.criteria_code),
      assert('Core não produz texto — apenas next_step estrutural', true, typeof criteria.authorized_next_step === 'string'),
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
 * Cenários L04–L06 (2): parser do topo reconhece, critérios do topo autorizam.
 * Nenhum cenário gera fala ao cliente.
 */
export function runSmokeSuite(): SmokeSuiteResult {
  const scenarios = [
    smokeScenario1_BlockQuandoFactAusente,
    smokeScenario2_AvancaQuandoFactsPresentes,
    smokeScenario3_BloqueioFactParcial,
    smokeScenario4_ParserTopoReconheceCustomerGoal,
    smokeScenario5_CriteriosTopoComanAdvance,
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
