/**
 * ENOVA 2 — Speech Engine e Surface Única — Smoke textual mínimo (PR1)
 *
 * Prova que a primeira camada da frente entrega política estrutural para a IA
 * soberana, sem redigir fala final e sem fallback dominante.
 */

import { runCoreEngine } from '../core/engine.ts';
import type { LeadState } from '../core/types.ts';
import {
  assertSpeechPolicyConformance,
  buildSpeechPolicyEnvelope,
  type SpeechPolicyEnvelope,
} from './policy.ts';

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface SpeechSmokeResult {
  scenario: string;
  envelope: SpeechPolicyEnvelope;
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

export function runSpeechSmokeSuite() {
  const results = [
    smokeScenario1_BlockPreservaSoberaniaDaIa(),
    smokeScenario2_TransicaoPreservaIaSoberana(),
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
