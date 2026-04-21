/**
 * ENOVA 2 — Speech Engine e Surface Única — Smoke textual mínimo
 *
 * Prova a política estrutural da PR 26 e a primeira surface final mínima
 * autorada pela IA, sem texto de cliente gerado pelo mecânico.
 */

import { runCoreEngine } from '../core/engine.ts';
import type { LeadState } from '../core/types.ts';
import {
  assertMcmvCognitiveContractConformance,
  buildMcmvCognitiveContract,
  type McmvCognitiveContract,
} from './cognitive.ts';
import { buildGovernedCompositeTurn, type GovernedCompositeTurnResult } from './composite-turn.ts';
import { buildGovernedFreeResponse, type GovernedFreeResponseResult } from './free-response.ts';
import {
  assertMultimodalReadinessConformance,
  buildMultimodalReadinessContract,
  type MultimodalReadinessContract,
} from './multimodal-readiness.ts';
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
  cognitive_contract?: McmvCognitiveContract;
  surface?: FinalSurfaceResult;
  free_response?: GovernedFreeResponseResult;
  composite_turn?: GovernedCompositeTurnResult;
  multimodal_readiness?: MultimodalReadinessContract;
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

function smokeScenario5_ContratoCognitivoMcmv(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const violations = assertMcmvCognitiveContractConformance(cognitiveContract);

  const assertions = [
    assert('dona do contrato cognitivo = llm', 'llm', cognitiveContract.cognitive_owner),
    assert('autoridade da surface final = llm', 'llm', cognitiveContract.final_surface_authority),
    assert('mecânico fica só em governança estrutural', 'structural_governance_only', cognitiveContract.mechanical_role),
    assert('postura consultiva humana presente', true, cognitiveContract.specialist_principles.includes('postura_consultiva_humana')),
    assert('qualificação inteligente presente', true, cognitiveContract.specialist_principles.includes('qualificacao_inteligente_de_perfil')),
    assert('não promete aprovação', true, cognitiveContract.knowledge_boundaries.includes('nao_prometer_aprovacao')),
    assert('não cria script rígido dominante', true, cognitiveContract.forbidden_behaviors.includes('script_rigido_dominante')),
    assert('sem violações cognitivas', [], violations),
  ];

  return {
    scenario: 'Cenário 5 — contrato cognitivo mínimo da atendente MCMV',
    envelope,
    cognitive_contract: cognitiveContract,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario6_ContratoCognitivoRespeitaSurfaceDaIa(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {}));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const surface = buildAiFinalSurface({
    policy: envelope,
    draft: {
      author: 'llm',
      text: 'Vou respeitar o próximo passo autorizado e seguir sem prometer aprovação.',
    },
  });

  const assertions = [
    assert('contrato cognitivo preserva next_objective', envelope.next_objective, cognitiveContract.policy_alignment.next_objective),
    assert('contrato cognitivo preserva bloqueio', envelope.block_advance, cognitiveContract.policy_alignment.block_advance),
    assert('surface final continua autorada pela IA', true, surface.accepted),
    assert('mecânico não gera texto na surface', false, surface.mechanical_text_generated),
    assert('cognitivo proíbe resposta engessada por stage', true, cognitiveContract.forbidden_behaviors.includes('resposta_engessada_por_stage')),
    assert('cognitivo proíbe fallback dominante', true, cognitiveContract.forbidden_behaviors.includes('fallback_dominante')),
  ];

  return {
    scenario: 'Cenário 6 — contrato cognitivo respeita policy e surface da IA',
    envelope,
    cognitive_contract: cognitiveContract,
    surface,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario7_RespostaLivreGovernada(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const llmFreeText = [
    'Posso te orientar por esse caminho com calma.',
    'Como seu objetivo é comprar, vou seguir pelo próximo ponto permitido da qualificação sem prometer aprovação antes das validações.',
  ].join(' ');
  const freeResponse = buildGovernedFreeResponse({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    draft: {
      author: 'llm',
      text: llmFreeText,
    },
  });

  const assertions = [
    assert('resposta livre aceita sob governança', true, freeResponse.accepted),
    assert('texto final preserva exatamente a autoria da IA', llmFreeText, freeResponse.final_text),
    assert('resposta livre permanece da IA', 'llm', freeResponse.model.response_owner),
    assert('governança não escreveu texto', false, freeResponse.governance_wrote_text),
    assert('modelo permite adaptar tom e profundidade', true, freeResponse.model.freedoms.includes('adaptar_tom_e_profundidade_ao_contexto')),
    assert('modelo preserva next_objective do Core', envelope.next_objective, freeResponse.model.policy_alignment.next_objective),
    assert('sem violações na resposta livre governada', [], freeResponse.violations),
  ];

  return {
    scenario: 'Cenário 7 — resposta livre da IA sob governança estrutural',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: freeResponse.surface,
    free_response: freeResponse,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario8_RespostaLivreRespeitaBloqueio(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {}));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const llmFreeText = 'Antes de avançar, preciso entender seu objetivo com o imóvel para seguir apenas pelo caminho permitido.';
  const freeResponse = buildGovernedFreeResponse({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    draft: {
      author: 'llm',
      text: llmFreeText,
    },
  });

  const assertions = [
    assert('resposta livre pode existir mesmo com bloqueio estrutural', true, freeResponse.accepted),
    assert('bloqueio estrutural permanece preservado', true, freeResponse.model.policy_alignment.block_advance),
    assert('next_objective bloqueado é preservado', 'coletar_customer_goal', freeResponse.model.policy_alignment.next_objective),
    assert('governança restringe mas não escreve', false, freeResponse.governance_wrote_text),
    assert('texto final segue exatamente o draft da IA', llmFreeText, freeResponse.final_text),
    assert('mecânico não gera texto na surface', false, freeResponse.surface.mechanical_text_generated),
  ];

  return {
    scenario: 'Cenário 8 — resposta livre respeita bloqueio e next_objective',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: freeResponse.surface,
    free_response: freeResponse,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario9_RespostaLivreNaoPrometeAprovacao(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const freeResponse = buildGovernedFreeResponse({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    draft: {
      author: 'llm',
      text: 'Seu financiamento aprovado está garantido antes das validações.',
    },
  });

  const assertions = [
    assert('promessa de aprovação é rejeitada', false, freeResponse.accepted),
    assert('texto com promessa não é publicado', null, freeResponse.final_text),
    assert('violação aponta promessa de aprovação', true, freeResponse.violations.includes('approval_promise_not_allowed')),
    assert('fallback não assume a resposta', 'non_dominant_guardrail_only', freeResponse.surface.fallback_mode),
    assert('governança não reescreve texto alternativo', false, freeResponse.governance_wrote_text),
  ];

  return {
    scenario: 'Cenário 9 — resposta livre rejeita promessa de aprovação',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: freeResponse.surface,
    free_response: freeResponse,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario10_TurnoCompostoMantemIaLivre(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const llmCompositeText = [
    'Você já trouxe mais de uma coisa útil: quer comprar, tem dúvida sobre o programa e prefere entender o próximo passo com calma.',
    'Eu vou aproveitar esse contexto sem pular a qualificação permitida agora.',
  ].join(' ');
  const compositeTurn = buildGovernedCompositeTurn({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    signals: [
      { kind: 'intent', key: 'customer_goal', value: 'comprar_imovel', handling: 'inform_llm' },
      { kind: 'question', key: 'mcmv_program_question', value: 'duvida_sobre_programa', handling: 'inform_llm' },
      { kind: 'preference', key: 'pace', value: 'com_calma', handling: 'inform_llm' },
    ],
    draft: {
      author: 'llm',
      text: llmCompositeText,
    },
  });

  const assertions = [
    assert('turno composto é aceito sob governança', true, compositeTurn.accepted),
    assert('IA segue dona da interpretação do turno composto', 'llm', compositeTurn.context.interpretation_owner),
    assert('parser mecânico dominante continua proibido', false, compositeTurn.mechanical_parser_dominant),
    assert('texto final preserva autoria livre da IA', llmCompositeText, compositeTurn.final_text),
    assert('múltiplos sinais são reconhecidos sem script rígido', 3, compositeTurn.context.signal_count),
    assert('next_objective do Core permanece preservado', envelope.next_objective, compositeTurn.context.next_objective),
    assert('governança não escreveu texto', false, compositeTurn.governance_wrote_text),
  ];

  return {
    scenario: 'Cenário 10 — turno composto mantém resposta livre da IA',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: compositeTurn.free_response.surface,
    free_response: compositeTurn.free_response,
    composite_turn: compositeTurn,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario11_TurnoCompostoRespeitaBloqueio(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {}));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const llmCompositeText = [
    'Você trouxe algumas informações juntas, mas antes de aproveitar tudo eu preciso confirmar o objetivo principal.',
    'Assim eu sigo o próximo passo permitido sem assumir dado que ainda não está validado.',
  ].join(' ');
  const compositeTurn = buildGovernedCompositeTurn({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    signals: [
      { kind: 'fact_candidate', key: 'income_hint', value: 'renda_mencionada', handling: 'defer_due_to_policy' },
      { kind: 'question', key: 'docs_question', value: 'pergunta_sobre_documentos', handling: 'defer_due_to_policy' },
    ],
    draft: {
      author: 'llm',
      text: llmCompositeText,
    },
  });

  const assertions = [
    assert('turno composto bloqueado ainda aceita fala livre governada', true, compositeTurn.accepted),
    assert('bloqueio estrutural permanece preservado', true, compositeTurn.context.block_advance),
    assert('next_objective bloqueado permanece preservado', 'coletar_customer_goal', compositeTurn.context.next_objective),
    assert('sinais extras não desbloqueiam o fluxo', false, compositeTurn.context.signals.some((signal) => signal.attempts_to_unblock)),
    assert('texto final continua da IA', llmCompositeText, compositeTurn.final_text),
    assert('governança não vira parser dominante', false, compositeTurn.mechanical_parser_dominant),
  ];

  return {
    scenario: 'Cenário 11 — turno composto respeita bloqueio estrutural',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: compositeTurn.free_response.surface,
    free_response: compositeTurn.free_response,
    composite_turn: compositeTurn,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario12_TurnoCompostoNaoSobrescreveCore(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {}));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const compositeTurn = buildGovernedCompositeTurn({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    signals: [
      {
        kind: 'fact_candidate',
        key: 'income_hint',
        value: 'renda_mencionada',
        handling: 'inform_llm',
        attempts_to_override_next_objective: 'avancar_para_qualification_renda',
      },
      {
        kind: 'intent',
        key: 'customer_goal',
        value: 'comprar_imovel',
        handling: 'inform_llm',
        attempts_to_unblock: true,
      },
    ],
    draft: {
      author: 'llm',
      text: 'Vou usar tudo que você trouxe para avançar direto.',
    },
  });

  const assertions = [
    assert('tentativa de sobrescrever Core é rejeitada', false, compositeTurn.accepted),
    assert('texto não é publicado quando sinal tenta sobrescrever Core', null, compositeTurn.final_text),
    assert('violação aponta next_objective preservado', true, compositeTurn.violations.includes('turn_signal_must_not_override_next_objective')),
    assert('violação aponta bloqueio preservado', true, compositeTurn.violations.includes('turn_signal_must_not_override_structural_block')),
    assert('governança não reescreve alternativa', false, compositeTurn.governance_wrote_text),
    assert('parser mecânico dominante continua falso', false, compositeTurn.mechanical_parser_dominant),
  ];

  return {
    scenario: 'Cenário 12 — turno composto não sobrescreve Core',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: compositeTurn.free_response.surface,
    free_response: compositeTurn.free_response,
    composite_turn: compositeTurn,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario13_TurnoCompostoNaoPrometeAprovacao(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const compositeTurn = buildGovernedCompositeTurn({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    signals: [
      { kind: 'intent', key: 'customer_goal', value: 'comprar_imovel', handling: 'inform_llm' },
      { kind: 'fact_candidate', key: 'income_hint', value: 'renda_mencionada', handling: 'requires_confirmation' },
    ],
    draft: {
      author: 'llm',
      text: 'Com essas informações, sua aprovação garantida já está encaminhada.',
    },
  });

  const assertions = [
    assert('turno composto com promessa de aprovação é rejeitado', false, compositeTurn.accepted),
    assert('texto com promessa não é publicado', null, compositeTurn.final_text),
    assert('violação de promessa permanece ativa', true, compositeTurn.violations.includes('approval_promise_not_allowed')),
    assert('fallback não assume o turno composto', 'non_dominant_guardrail_only', compositeTurn.free_response.surface.fallback_mode),
    assert('governança não escreve resposta substituta', false, compositeTurn.governance_wrote_text),
  ];

  return {
    scenario: 'Cenário 13 — turno composto mantém proibição de promessa de aprovação',
    envelope,
    cognitive_contract: cognitiveContract,
    surface: compositeTurn.free_response.surface,
    free_response: compositeTurn.free_response,
    composite_turn: compositeTurn,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario14_PreparacaoMultimodalSemAbrirAudioReal(): SpeechSmokeResult {
  const decision = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const envelope = buildSpeechPolicyEnvelope({ core_decision: decision });
  const cognitiveContract = buildMcmvCognitiveContract({ policy: envelope });
  const multimodalReadiness = buildMultimodalReadinessContract({
    policy: envelope,
    cognitive_contract: cognitiveContract,
    future_modalities: ['text', 'audio'],
  });
  const violations = assertMultimodalReadinessConformance(multimodalReadiness);

  const assertions = [
    assert('preparacao multimodal permanece apenas contratual', 'preparatory_contract_only', multimodalReadiness.readiness_status),
    assert('IA segue soberana na autoridade da fala', 'llm', multimodalReadiness.authority_owner),
    assert('audio futuro nao vira novo cerebro', 'input_output_adapter_only', multimodalReadiness.pipeline_role),
    assert('audio real continua desligado', false, multimodalReadiness.runtime_locks.real_audio_enabled),
    assert('STT real continua desligado', false, multimodalReadiness.runtime_locks.stt_provider_enabled),
    assert('TTS real continua desligado', false, multimodalReadiness.runtime_locks.tts_provider_enabled),
    assert('canal externo continua desligado', false, multimodalReadiness.runtime_locks.external_channel_enabled),
    assert('next_objective do Core permanece preservado', envelope.next_objective, multimodalReadiness.policy_alignment.next_objective),
    assert('promessa de aprovacao segue proibida', true, multimodalReadiness.preparation_constraints.includes('promessa_de_aprovacao_permanece_proibida')),
    assert('sem violacoes na preparacao multimodal', [], violations),
  ];

  return {
    scenario: 'Cenario 14 — preparacao multimodal sem abrir audio real',
    envelope,
    cognitive_contract: cognitiveContract,
    multimodal_readiness: multimodalReadiness,
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
    smokeScenario5_ContratoCognitivoMcmv(),
    smokeScenario6_ContratoCognitivoRespeitaSurfaceDaIa(),
    smokeScenario7_RespostaLivreGovernada(),
    smokeScenario8_RespostaLivreRespeitaBloqueio(),
    smokeScenario9_RespostaLivreNaoPrometeAprovacao(),
    smokeScenario10_TurnoCompostoMantemIaLivre(),
    smokeScenario11_TurnoCompostoRespeitaBloqueio(),
    smokeScenario12_TurnoCompostoNaoSobrescreveCore(),
    smokeScenario13_TurnoCompostoNaoPrometeAprovacao(),
    smokeScenario14_PreparacaoMultimodalSemAbrirAudioReal(),
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
