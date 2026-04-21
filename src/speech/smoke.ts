/**
 * ENOVA 2 — Speech Engine e Surface Única — Smoke textual mínimo
 *
 * Prova a política estrutural da PR 26 e a primeira surface final mínima
 * autorada pela IA, sem texto de cliente gerado pelo mecânico.
 */

import { runCoreEngine } from '../core/engine.ts';
import type { LeadState } from '../core/types.ts';
import {
  assertSpeechPolicyConformance,
  buildSpeechPolicyEnvelope,
  type SpeechPolicyEnvelope,
} from './policy.ts';
import { buildAiFinalSurface, type FinalSurfaceResult } from './surface.ts';

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface SpeechSmokeResult {
  scenario: string;
  envelope: SpeechPolicyEnvelope;
  surface?: FinalSurfaceResult;
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

function makeState(current_stage: LeadState['current_stage'], facts: Record<string, unknown>): LeadState {
  return {
    lead_id: 'speech-smoke-001',
    current_stage,
    facts,
  };
}

function smokeScenario1_BlockPreservaSoberaniaDaIa(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {}));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const violations = assertSpeechPolicyConformance(envelope);

  const assertions = [
    assert('surface_owner = llm', 'llm', envelope.surface_owner),
    assert('mechanical_speech_priority = forbidden', 'forbidden', envelope.mechanical_speech_priority),
    assert('mechanical_may_write_customer_text = false', false, envelope.mechanical_may_write_customer_text),
    assert('fallback não é dominante', 'non_dominant_guardrail_only', envelope.fallback_mode),
    assert('block_advance preservado do Core', true, envelope.block_advance),
    assert('next_objective preservado sem phrasing', 'coletar_customer_goal', envelope.next_objective),
    assert('sem violações de política', [], violations),
  ];

  return {
    scenario: 'Cenário 1 — bloqueio estrutural vira guardrail, não fala mecânica',
    envelope,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario2_TransicaoPreservaIaSoberana(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const violations = assertSpeechPolicyConformance(envelope);

  const assertions = [
    assert('surface_owner = llm', 'llm', envelope.surface_owner),
    assert('llm_must_write_final_answer = true', true, envelope.llm_must_write_final_answer),
    assert('speech_intent é sinal estrutural', 'transicao_stage', envelope.speech_intent),
    assert('stage_after preservado', 'qualification_civil', envelope.stage_after),
    assert('fallback dominante está formalmente proibido', true, envelope.forbidden_patterns.includes('fallback_dominante')),
    assert('sem violações de política', [], violations),
  ];

  return {
    scenario: 'Cenário 2 — transição autoriza IA a falar, sem mecânico escrever',
    envelope,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario3_SurfaceFinalDaIa(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const llmAuthoredFinalText = [
    'Entendi que seu objetivo é comprar um imóvel pelo Minha Casa Minha Vida.',
    'Vou seguir pela qualificação inicial e considerar apenas o próximo passo permitido para este momento.',
  ].join(' ');
  const surface = buildAiFinalSurface({
    policy: envelope,
    draft: {
      author: 'llm',
      text: llmAuthoredFinalText,
    },
  });

  const assertions = [
    assert('surface final aceita apenas autoria llm', true, surface.accepted),
    assert('texto final é exatamente a saída da IA', llmAuthoredFinalText, surface.final_text),
    assert('mecânico não gerou texto ao cliente', false, surface.mechanical_text_generated),
    assert('surface preserva owner llm', 'llm', surface.surface_owner),
    assert('governança preserva next_objective', envelope.next_objective, surface.governance_snapshot.next_objective),
    assert('fallback segue não dominante', 'non_dominant_guardrail_only', surface.fallback_mode),
    assert('sem violações na surface final da IA', [], surface.violations),
  ];

  return {
    scenario: 'Cenário 3 — primeira surface final real é autorada pela IA',
    envelope,
    surface,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario4_MecanicoNaoPublicaSurfaceFinal(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const surface = buildAiFinalSurface({
    policy: envelope,
    draft: {
      author: 'mechanical',
      text: 'texto mecanico rejeitado pelo smoke',
    },
  });

  const assertions = [
    assert('surface mecanica é rejeitada', false, surface.accepted),
    assert('texto mecanico não é publicado', null, surface.final_text),
    assert('violação aponta autoria obrigatória da IA', true, surface.violations.includes('final_surface_author_must_be_llm')),
    assert('mecânico segue sem gerar texto ao cliente', false, surface.mechanical_text_generated),
    assert('fallback não assume a fala', 'non_dominant_guardrail_only', surface.fallback_mode),
  ];

  return {
    scenario: 'Cenário 4 — mecânico não pode publicar surface final',
    envelope,
    surface,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

export function runSpeechSmokeSuite() {
  const results = [
    smokeScenario1_BlockPreservaSoberaniaDaIa(),
    smokeScenario2_TransicaoPreservaIaSoberana(),
    smokeScenario3_SurfaceFinalDaIa(),
    smokeScenario4_MecanicoNaoPublicaSurfaceFinal(),
  ];
  const passed = results.filter((item) => item.passed).length;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    all_passed: passed === results.length,
    results,
    executed_at: new Date().toISOString(),
  };
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('smoke.ts')) {
  const suite = runSpeechSmokeSuite();

  console.log('\n===========================================');
  console.log('ENOVA 2 — Speech Engine — Smoke textual mínimo');
  console.log('===========================================');
  console.log(`Executado em: ${suite.executed_at}`);
  console.log(`Total: ${suite.total} | Passou: ${suite.passed} | Falhou: ${suite.failed}`);
  console.log(`Resultado: ${suite.all_passed ? 'PASSOU' : 'FALHOU'}\n`);

  for (const result of suite.results) {
    console.log(`${result.passed ? 'OK' : 'FAIL'} ${result.scenario}`);
    for (const item of result.assertions) {
      console.log(`  ${item.passed ? 'OK' : 'FAIL'} ${item.description}`);
      if (!item.passed) {
        console.log(`    Esperado: ${JSON.stringify(item.expected)}`);
        console.log(`    Obtido:   ${JSON.stringify(item.actual)}`);
      }
    }
    console.log('');
  }

  if (!suite.all_passed) process.exit(1);
}
