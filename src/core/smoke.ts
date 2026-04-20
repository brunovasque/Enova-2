/**
 * ENOVA 2 — Core Mecânico 2 — Smoke Test Determinístico
 *
 * Âncora contratual (CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md):
 *   Cláusula-fonte:  L-01, A01-05
 *   Bloco legado:    L03 — Mapa Canônico do Funil
 *   Gate-fonte:      Gate 2 (A01: "sem smoke da frente, não promove")
 *   Evidência:       smoke mínimo de trilho / decisão / next step autorizado
 *   PDF-fonte:       PDF 8, seção 7 "Teste mínimo de aceite do Core"
 *
 * PDF-fonte literal (PDF 8, p. 3, seção 7):
 * "Textos longos com múltiplos sinais não podem quebrar o nextStage.
 *  O Core deve conseguir salvar o que já sabe e dizer o que ainda falta.
 *  Nenhuma decisão de negócio deve depender de frase pronta do Speech Engine."
 *
 * INVIOLÁVEL: nenhum cenário de smoke gera texto ao cliente.
 * Todos os cenários verificam apenas a decisão estrutural do Core.
 */

import { runCoreEngine } from './engine.ts';
import type { CoreEngineInput, TurnExtract } from './engine.ts';
import type { LeadState, CoreDecision } from './types.ts';

// ---------------------------------------------------------------------------
// Estado base para os cenários de smoke
// ---------------------------------------------------------------------------

function makeBaseState(overrides: Partial<LeadState> = {}): LeadState {
  return {
    lead_id: 'smoke-lead-001',
    current_stage: 'discovery',
    estado_civil: null,
    processo: null,
    composition_actor: null,
    regime_trabalho: null,
    autonomo_tem_ir: null,
    renda_principal: null,
    nacionalidade: null,
    rnm_status: null,
    ctps_36: null,
    credit_restriction: null,
    dependente_qtd: null,
    customer_goal: null,
    doc_identity_status: null,
    doc_income_status: null,
    doc_residence_status: null,
    facts_confirmados: {},
    facts_ambiguos: [],
    pendencias_obrigatorias: [],
    ...overrides,
  };
}

function makeTurnExtract(overrides: Partial<TurnExtract> = {}): TurnExtract {
  return {
    facts_extracted: {},
    facts_ambiguous: [],
    contradictions_detected: [],
    intent_signal: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Resultado do smoke test
// ---------------------------------------------------------------------------

export interface SmokeResult {
  scenario: string;
  anchor: string;
  passed: boolean;
  decision: CoreDecision;
  assertions: SmokeAssertion[];
}

interface SmokeAssertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

function assert(
  description: string,
  expected: unknown,
  actual: unknown,
): SmokeAssertion {
  const passed = JSON.stringify(expected) === JSON.stringify(actual) ||
    (typeof expected === 'boolean' && actual === expected) ||
    (typeof expected === 'string' && actual === expected);
  return { description, expected, actual, passed };
}

// ---------------------------------------------------------------------------
// Cenário 1: Discovery com facts ausentes — deve bloquear e pedir coleta
//
// PDF-fonte: PDF 8, p. 3 (R6: "fato crítico ausente → não avançar objetivo")
// Esperado: G_FATO_CRITICO_AUSENTE ativado, block_advance=true, stay em discovery
// ---------------------------------------------------------------------------
export function smokeScenario1_DiscoverySemFacts(): SmokeResult {
  const scenario = 'Cenário 1 — Discovery sem facts: deve bloquear e pedir coleta';
  const anchor = 'L03 | R6 (PDF 8, p. 3) | Gate 2 (A01)';

  const state = makeBaseState({ current_stage: 'discovery' });
  const turn = makeTurnExtract(); // nenhum fact extraído

  const input: CoreEngineInput = { state_snapshot: state, turn_extract: turn };
  const decision = runCoreEngine(input);

  const assertions = [
    assert('stage_current deve ser discovery', 'discovery', decision.stage_current),
    assert('block_advance deve ser true (R6 — fact ausente)', true, decision.block_advance),
    assert(
      'gates_activated deve conter G_FATO_CRITICO_AUSENTE',
      true,
      decision.gates_activated.includes('G_FATO_CRITICO_AUSENTE'),
    ),
    assert(
      'stage_after deve permanecer em discovery (bloqueado)',
      'discovery',
      decision.stage_after,
    ),
    assert(
      'next_objective deve ser coletar_customer_goal',
      'coletar_customer_goal',
      decision.next_objective,
    ),
    assert(
      'speech_intent deve ser coleta_dado (não é fala — é sinal estrutural)',
      'coleta_dado',
      decision.speech_intent,
    ),
  ];

  return {
    scenario,
    anchor,
    passed: assertions.every((a) => a.passed),
    decision,
    assertions,
  };
}

// ---------------------------------------------------------------------------
// Cenário 2: Casado civil com processo=solo — gate R1 deve forçar conjunto
//
// PDF-fonte: PDF 7, p. 3 ("Casado civil → forçar processo_conjunto")
//            PDF 8, p. 3 (R1: "estado_civil=casado_civil → forçar processo=conjunto")
// Esperado: G_CASADO_CONJUNTO ativado, persist_op forçando processo=conjunto
// ---------------------------------------------------------------------------
export function smokeScenario2_CasadoCivilSolo(): SmokeResult {
  const scenario = 'Cenário 2 — Casado civil com processo=solo: R1 deve forçar conjunto';
  const anchor = 'L03 | R1 (PDF 7, p. 3; PDF 8, p. 3) | Gate 2 (A01)';

  const state = makeBaseState({
    current_stage: 'qualification_civil',
    customer_goal: 'comprar_imovel',
    estado_civil: 'casado_civil',
    processo: 'solo', // incorreto — R1 deve corrigir para 'conjunto'
    nacionalidade: 'brasileiro',
  });

  const turn = makeTurnExtract({
    facts_extracted: {
      estado_civil: 'casado_civil',
      processo: 'solo',
    },
  });

  const input: CoreEngineInput = { state_snapshot: state, turn_extract: turn };
  const decision = runCoreEngine(input);

  const forcedConjunto = decision.persist_ops.some(
    (op) => op.target === 'processo' && op.value === 'conjunto',
  );

  const assertions = [
    assert('stage_current deve ser qualification_civil', 'qualification_civil', decision.stage_current),
    assert(
      'gates_activated deve conter G_CASADO_CONJUNTO',
      true,
      decision.gates_activated.includes('G_CASADO_CONJUNTO'),
    ),
    assert(
      'persist_ops deve forçar processo=conjunto (R1)',
      true,
      forcedConjunto,
    ),
    assert(
      'Core não emite texto — speech_intent é sinal estrutural (não é fala)',
      true,
      typeof decision.speech_intent === 'string',
    ),
  ];

  return {
    scenario,
    anchor,
    passed: assertions.every((a) => a.passed),
    decision,
    assertions,
  };
}

// ---------------------------------------------------------------------------
// Cenário 3: Estrangeiro sem RNM — gate R4 deve bloquear avanço (crítico)
//
// PDF-fonte: PDF 7, p. 3 ("Estrangeiro → validar RNM antes de avançar")
//            PDF 8, p. 3 (R4: "estrangeiro sem RNM válido → bloquear avanço")
// Esperado: G_ESTRANGEIRO_RNM ativado, block_advance=true, speech_intent=bloqueio
// ---------------------------------------------------------------------------
export function smokeScenario3_EstrangeiroSemRNM(): SmokeResult {
  const scenario = 'Cenário 3 — Estrangeiro sem RNM: R4 deve bloquear avanço (critical)';
  const anchor = 'L03 | R4 (PDF 7, p. 3; PDF 8, p. 3) | Gate 2 (A01)';

  const state = makeBaseState({
    current_stage: 'qualification_eligibility',
    customer_goal: 'comprar_imovel',
    estado_civil: 'solteiro',
    processo: 'solo',
    regime_trabalho: 'clt',
    renda_principal: 4000,
    nacionalidade: 'estrangeiro',
    rnm_status: 'ausente', // sem RNM — gate R4 deve bloquear
    credit_restriction: false,
  });

  const turn = makeTurnExtract({
    facts_extracted: {
      nacionalidade: 'estrangeiro',
      rnm_status: 'ausente',
    },
  });

  const input: CoreEngineInput = { state_snapshot: state, turn_extract: turn };
  const decision = runCoreEngine(input);

  const rnmGate = decision.gates_evaluated.find((g) => g.gate_id === 'G_ESTRANGEIRO_RNM');

  const assertions = [
    assert('block_advance deve ser true (R4 — RNM inválido)', true, decision.block_advance),
    assert(
      'gates_activated deve conter G_ESTRANGEIRO_RNM',
      true,
      decision.gates_activated.includes('G_ESTRANGEIRO_RNM'),
    ),
    assert('severity do gate deve ser critical', 'critical', rnmGate?.severity),
    assert(
      'stage_after deve permanecer em qualification_eligibility (bloqueado)',
      'qualification_eligibility',
      decision.stage_after,
    ),
    assert('speech_intent deve ser bloqueio', 'bloqueio', decision.speech_intent),
    assert(
      'Core não produz texto ao cliente — apenas sinal de bloqueio estrutural',
      true,
      decision.speech_intent_context['gate'] === 'G_ESTRANGEIRO_RNM',
    ),
  ];

  return {
    scenario,
    anchor,
    passed: assertions.every((a) => a.passed),
    decision,
    assertions,
  };
}

// ---------------------------------------------------------------------------
// Cenário 4: Autônomo sem IR declarado — gate R2 deve bloquear coleta
//
// PDF-fonte: PDF 7, p. 3 ("Autônomo → perguntar IR obrigatoriamente")
//            PDF 8, p. 3 (R2: "regime_trabalho=autonomo → perguntar IR se ainda ausente")
// Esperado: G_AUTONOMO_IR ativado, block_advance=true, pending=autonomo_tem_ir
// ---------------------------------------------------------------------------
export function smokeScenario4_AutonomoSemIR(): SmokeResult {
  const scenario = 'Cenário 4 — Autônomo sem IR declarado: R2 deve bloquear e pedir coleta';
  const anchor = 'L03 | R2 (PDF 7, p. 3; PDF 8, p. 3) | Gate 2 (A01)';

  const state = makeBaseState({
    current_stage: 'qualification_renda',
    customer_goal: 'comprar_imovel',
    estado_civil: 'solteiro',
    processo: 'solo',
    regime_trabalho: 'autonomo',
    autonomo_tem_ir: null, // não coletado — R2 deve bloquear
    renda_principal: 5000,
    nacionalidade: 'brasileiro',
  });

  const turn = makeTurnExtract({
    facts_extracted: {
      regime_trabalho: 'autonomo',
      renda_principal: 5000,
    },
  });

  const input: CoreEngineInput = { state_snapshot: state, turn_extract: turn };
  const decision = runCoreEngine(input);

  const assertions = [
    assert('block_advance deve ser true (R2 — IR ausente)', true, decision.block_advance),
    assert(
      'gates_activated deve conter G_AUTONOMO_IR',
      true,
      decision.gates_activated.includes('G_AUTONOMO_IR'),
    ),
    assert(
      'pending_slots deve conter autonomo_tem_ir',
      true,
      decision.pending_slots.includes('autonomo_tem_ir'),
    ),
    assert(
      'stage_after deve permanecer em qualification_renda (bloqueado)',
      'qualification_renda',
      decision.stage_after,
    ),
    assert(
      'next_objective deve ser coletar_autonomo_tem_ir',
      'coletar_autonomo_tem_ir',
      decision.next_objective,
    ),
  ];

  return {
    scenario,
    anchor,
    passed: assertions.every((a) => a.passed),
    decision,
    assertions,
  };
}

// ---------------------------------------------------------------------------
// Cenário 5: Trilho completo bem-sucedido — discovery → qualification_civil
//
// Verifica transição de stage autorizada quando todos os facts obrigatórios
// estão presentes e nenhum gate bloqueante ativado.
// PDF-fonte: PDF 7, p. 3 (fluxo de execução); PDF 8, seção 5 (política de decisão)
// ---------------------------------------------------------------------------
export function smokeScenario5_TransicaoAutorizada(): SmokeResult {
  const scenario = 'Cenário 5 — Trilho bem-sucedido: discovery → qualification_civil';
  const anchor = 'L03 | A01-05 (smoke de trilho) | Gate 2 (A01)';

  const state = makeBaseState({
    current_stage: 'discovery',
    customer_goal: 'comprar_imovel', // fact obrigatório de discovery satisfeito
  });

  const turn = makeTurnExtract({
    facts_extracted: {
      customer_goal: 'comprar_imovel',
    },
  });

  const input: CoreEngineInput = { state_snapshot: state, turn_extract: turn };
  const decision = runCoreEngine(input);

  const assertions = [
    assert('stage_current deve ser discovery', 'discovery', decision.stage_current),
    assert(
      'block_advance deve ser false (todos facts presentes)',
      false,
      decision.block_advance,
    ),
    assert(
      'stage_after deve ser qualification_civil (próximo canônico)',
      'qualification_civil',
      decision.stage_after,
    ),
    assert(
      'speech_intent deve ser transicao_stage (sinal estrutural)',
      'transicao_stage',
      decision.speech_intent,
    ),
    assert(
      'persist_ops deve conter set_stage para qualification_civil',
      true,
      decision.persist_ops.some(
        (op) => op.op === 'set_stage' && op.value === 'qualification_civil',
      ),
    ),
    assert(
      'Core não emite fala — apenas sinal de transição estrutural',
      true,
      decision.speech_intent_context['from'] === 'discovery' &&
        decision.speech_intent_context['to'] === 'qualification_civil',
    ),
  ];

  return {
    scenario,
    anchor,
    passed: assertions.every((a) => a.passed),
    decision,
    assertions,
  };
}

// ---------------------------------------------------------------------------
// Runner de smoke — executa todos os cenários e reporta resultado
// ---------------------------------------------------------------------------

export interface SmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: SmokeResult[];
  executed_at: string;
  source_refs: string[];
}

/**
 * Executa a suíte completa de smoke tests do Core Mecânico 2.
 *
 * Prova exigida (CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md, A01-05):
 * "Smoke de trilho e next step autorizado"
 *
 * PDF-fonte literal (PDF 8, p. 3, seção 7 "Teste mínimo de aceite do Core"):
 * "O Core deve conseguir salvar o que já sabe e dizer o que ainda falta.
 *  Nenhuma decisão de negócio deve depender de frase pronta do Speech Engine."
 */
export function runSmokeSuite(): SmokeSuiteResult {
  const results: SmokeResult[] = [
    smokeScenario1_DiscoverySemFacts(),
    smokeScenario2_CasadoCivilSolo(),
    smokeScenario3_EstrangeiroSemRNM(),
    smokeScenario4_AutonomoSemIR(),
    smokeScenario5_TransicaoAutorizada(),
  ];

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return {
    total: results.length,
    passed,
    failed,
    all_passed: failed === 0,
    results,
    executed_at: new Date().toISOString(),
    source_refs: [
      'L03 — Mapa Canônico do Funil',
      'PDF 6, seção 4.1',
      'PDF 7, p. 3 (tabela de regras de negócio)',
      'PDF 8, pp. 3–6 (regras R1–R6, teste mínimo de aceite)',
      'A01, seção 7 (smoke de trilho e next step autorizado)',
      'Gate 2 do A01',
    ],
  };
}

// ---------------------------------------------------------------------------
// Ponto de entrada para execução manual (diagnóstico)
// ---------------------------------------------------------------------------

/**
 * Executa o smoke e imprime resultado legível (para diagnóstico — não é produção).
 * Chamável via: `npx tsx src/core/smoke.ts`
 */
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('smoke.ts')) {
  const suite = runSmokeSuite();

  console.log('\n========================================');
  console.log('ENOVA 2 — Core Mecânico 2 — Smoke Suite');
  console.log('========================================');
  console.log(`Âncora: L03 | Gate 2 (A01) | PDF 8, p. 3`);
  console.log(`Executado em: ${suite.executed_at}`);
  console.log(`Total: ${suite.total} | Passou: ${suite.passed} | Falhou: ${suite.failed}`);
  console.log(`Resultado: ${suite.all_passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  for (const result of suite.results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.scenario}`);
    console.log(`   Âncora: ${result.anchor}`);

    for (const assertion of result.assertions) {
      const aIcon = assertion.passed ? '   ✓' : '   ✗';
      console.log(`${aIcon} ${assertion.description}`);
      if (!assertion.passed) {
        console.log(`      Esperado: ${JSON.stringify(assertion.expected)}`);
        console.log(`      Obtido:   ${JSON.stringify(assertion.actual)}`);
      }
    }

    // Exibir decisão estrutural (sem fala ao cliente)
    if (!result.passed) {
      console.log('   Decisão estrutural parcial:', JSON.stringify({
        stage_current: result.decision.stage_current,
        stage_after: result.decision.stage_after,
        next_objective: result.decision.next_objective,
        block_advance: result.decision.block_advance,
        gates_activated: result.decision.gates_activated,
        speech_intent: result.decision.speech_intent,
      }, null, 2));
    }

    console.log('');
  }

  if (!suite.all_passed) {
    process.exit(1);
  }
}
