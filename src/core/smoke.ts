/**
 * ENOVA 2 — Core Mecânico 2 — Smoke Mínimo (L03 + L04/L05/L06 + L07/L10)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01 (L03), L-02 (L04), L-03 (L05), L-04 (L06), L-05/L-08 (L07/L10)
 *   Bloco legado:    L03, L04, L05, L06, L07, L08, L09, L10
 *   Gate-fonte:      Gate 2 (A01: "sem smoke da frente, não promove")
 *
 * ESCOPO: provar que o esqueleto estrutural (L03), o topo do funil (L04–L06)
 * e o Meio A expandido (L07/L10) existem e não produzem fala.
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
// Cenário 3: Meio A com fact crítico ausente → deve bloquear no fact faltando
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
    scenario: 'Cenário 3 — Meio A: fact crítico ausente bloqueia',
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

// Cenário 4: Meio A com trilho válido mínimo → avança para renda
//
// Prova: o caminho real de qualification_civil no engine aceita trilho estrutural
// válido sem fala mecânica.
// ---------------------------------------------------------------------------
export function smokeScenario4_MeioAIntegrado_AvancoValido(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'composicao_familiar',
    composition_actor: 'mae',
    p3_required: false,
    dependents_applicable: false,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 4 — Meio A integrado: trilho válido avança',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = false (Meio A via engine)', false, decision.block_advance),
      assert('stage_after = qualification_renda', 'qualification_renda', decision.stage_after),
      assert('next_objective = avancar_para_qualification_renda', 'avancar_para_qualification_renda', decision.next_objective),
      assert('speech_intent = transicao_stage (sinal estrutural — não é fala)', 'transicao_stage', decision.speech_intent),
      assert('gates_activated vazio (Meio A avançou)', 0, decision.gates_activated.length),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 5: Meio A com composição que exige dependente → bloqueia em coleta específica
//
// Prova: L09/L10 aprofundam a composição sem abrir Meio B; quando dependente faz
// sentido, o next step muda para coleta de dependents_count.
// ---------------------------------------------------------------------------
export function smokeScenario5_MeioAIntegrado_DependentesAlteramNextStep(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'composicao_familiar',
    composition_actor: 'mae',
    p3_required: false,
    dependents_applicable: true,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 5 — Meio A integrado: dependentes alteram o next step estrutural',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = true (dependents_count ainda ausente)', true, decision.block_advance),
      assert('stage_after permanece em qualification_civil', 'qualification_civil', decision.stage_after),
      assert('next_objective = coletar_dependents_count', 'coletar_dependents_count', decision.next_objective),
      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
      assert('Core não produz texto — apenas estrutura de decisão', true, typeof decision.speech_intent === 'string'),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 6: Meio A com composição complexa P3 → muda o roteamento estrutural
//
// Prova: quando a composição exige terceiro participante, o Core segura o avanço
// no próprio qualification_civil e manda avaliar P3 antes de seguir.
// ---------------------------------------------------------------------------
export function smokeScenario6_MeioAIntegrado_P3MudaRoteamento(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'composicao_familiar',
    composition_actor: 'irmao',
    p3_required: true,
    dependents_applicable: false,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 6 — Meio A integrado: P3 altera o roteamento estrutural',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = true (P3 exige roteamento próprio)', true, decision.block_advance),
      assert('stage_after permanece em qualification_civil', 'qualification_civil', decision.stage_after),
      assert('next_objective = avaliar_p3', 'avaliar_p3', decision.next_objective),
      assert('gates_activated inclui G_COMPOSICAO_FAMILIAR', true, decision.gates_activated.includes('G_COMPOSICAO_FAMILIAR')),
      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
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
 * Cenários L03/L04-L10 integrados (6): topo segue válido e o Meio A passa por
 * ausência crítica, composição válida, dependente aplicável e roteamento P3.
 * Todos os cenários passam pelo `runCoreEngine()`. Nenhum usa decisão fake.
 * Nenhum cenário gera fala ao cliente.
 */
export function runSmokeSuite(): SmokeSuiteResult {
  const scenarios = [
    smokeScenario1_BlockQuandoFactAusente,
    smokeScenario2_AvancaQuandoFactsPresentes,
    smokeScenario3_BloqueioFactParcial,
    smokeScenario4_MeioAIntegrado_AvancoValido,
    smokeScenario5_MeioAIntegrado_DependentesAlteramNextStep,
    smokeScenario6_MeioAIntegrado_P3MudaRoteamento,
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
  console.log('ENOVA 2 — Core Mecânico 2 — Smoke (L03 + L04/L05/L06 + L07/L10)');
  console.log('===========================================');
  console.log(`Âncora: L03 + L04/L05/L06 + L07/L10 | Gate 2 (A01)`);
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
