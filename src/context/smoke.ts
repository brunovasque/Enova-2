import {
  assertSemanticTurnPacketConformance,
  buildSemanticTurnPacket,
  type ExtractedSignal,
  type SemanticTurnPacket,
  type TurnEvidence,
} from './schema.ts';
import {
  assertMultiSignalTurnConformance,
  buildMultiSignalTurnConsolidation,
  type MultiSignalTurnConsolidation,
} from './multi-signal.ts';

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface ContextSmokeResult {
  scenario: string;
  packet: SemanticTurnPacket;
  multi_signal?: MultiSignalTurnConsolidation;
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

function signal(kind: ExtractedSignal['kind'], key: string, value: unknown, confidence: number): ExtractedSignal {
  return {
    signal_id: `${kind}_${key}`,
    kind,
    key,
    value,
    evidence_ids: ['ev_turn_001'],
    confidence,
    status: 'candidate',
  };
}

function evidence(value: string, confidence = 0.9): TurnEvidence {
  return {
    evidence_id: 'ev_turn_001',
    kind: 'text_excerpt',
    source: 'customer_turn',
    value,
    confidence,
  };
}

function smokeScenario1_ShapeCanonicoDoTurno(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-001',
    lead_id: 'lead-001',
    turn_id: 'turn-001',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Sou solteiro, quero comprar, tenho duvida dos documentos e nao quero mandar tudo por celular.',
    },
    signals: {
      facts: [signal('fact', 'estado_civil', 'solteiro', 0.92)],
      intents: [signal('intent', 'customer_goal', 'comprar_imovel', 0.9)],
      questions: [signal('question', 'docs_question', 'duvida_documentos', 0.78)],
      objections: [signal('objection', 'docs_channel_resistance', 'nao_quer_mandar_docs_celular', 0.82)],
      slot_candidates: [signal('slot_candidate', 'civil_status', 'solteiro', 0.92)],
      pending: [signal('pending', 'composition_confirmation', 'confirmar_composicao_familiar', 0.7)],
      ambiguities: [signal('ambiguity', 'docs_channel', 'canal_docs_indefinido', 0.62)],
      evidence: [evidence('Sou solteiro, quero comprar, tenho duvida dos documentos...')],
      confidence: {
        overall: 0.82,
        rationale: 'sinais_textuais_explicitos_com_uma_ambiguidade_de_canal',
      },
    },
  });

  const violations = assertSemanticTurnPacketConformance(packet);
  const assertions = [
    assert('pacote semanticamente estrutural', 'structural_input_only', packet.role),
    assert('facts presentes', 1, packet.signals.facts.length),
    assert('intents presentes', 1, packet.signals.intents.length),
    assert('questions presentes', 1, packet.signals.questions.length),
    assert('objections presentes', 1, packet.signals.objections.length),
    assert('slot_candidates presentes', 1, packet.signals.slot_candidates.length),
    assert('pending presentes', 1, packet.signals.pending.length),
    assert('ambiguities presentes', 1, packet.signals.ambiguities.length),
    assert('evidence presente', 1, packet.signals.evidence.length),
    assert('confidence preservada', 0.82, packet.signals.confidence.overall),
    assert('sem violacoes de conformidade', [], violations),
  ];

  return {
    scenario: 'Cenario 1 — shape canonico do pacote semantico do turno',
    packet,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario2_ContextoNaoEscreveFalaNemDecide(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-002',
    lead_id: 'lead-002',
    turn_id: 'turn-002',
    source: {
      channel: 'text',
      modality: 'text',
    },
  });

  const violations = assertSemanticTurnPacketConformance(packet);
  const assertions = [
    assert('speech_authority = none', 'none', packet.speech_authority),
    assert('decision_authority = none', 'none', packet.decision_authority),
    assert('pode informar Core', true, packet.for_core.may_inform_core),
    assert('nao decide regra de negocio', false, packet.for_core.may_decide_business_rule),
    assert('nao avanca stage', false, packet.for_core.may_advance_stage),
    assert('nao persiste slot oficial', false, packet.for_core.may_persist_official_slot),
    assert('pode informar LLM', true, packet.for_speech.may_inform_llm),
    assert('nao escreve texto ao cliente', false, packet.for_speech.may_write_customer_text),
    assert('nao sobrescreve surface', false, packet.for_speech.may_override_surface),
    assert('sem violacoes de conformidade', [], violations),
  ];

  return {
    scenario: 'Cenario 2 — contexto informa Core/Speech sem fala mecanica nem decisao',
    packet,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario3_GuardrailContraAutoridadeIndevida(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-003',
    lead_id: 'lead-003',
    turn_id: 'turn-003',
    source: {
      channel: 'text',
      modality: 'text',
    },
  }) as unknown as SemanticTurnPacket & {
    for_core: {
      may_inform_core: true;
      may_decide_business_rule: true;
      may_advance_stage: true;
      may_persist_official_slot: true;
    };
    for_speech: {
      may_inform_llm: true;
      may_write_customer_text: true;
      may_override_surface: true;
    };
  };

  packet.for_core.may_decide_business_rule = true;
  packet.for_core.may_advance_stage = true;
  packet.for_core.may_persist_official_slot = true;
  packet.for_speech.may_write_customer_text = true;
  packet.for_speech.may_override_surface = true;

  const violations = assertSemanticTurnPacketConformance(packet);
  const assertions = [
    assert('detecta decisao de regra de negocio indevida', true, violations.includes('context_must_not_decide_business_rule')),
    assert('detecta avanco de stage indevido', true, violations.includes('context_must_not_advance_stage')),
    assert('detecta persistencia oficial indevida', true, violations.includes('context_must_not_persist_official_slot')),
    assert('detecta escrita de texto ao cliente indevida', true, violations.includes('context_must_not_write_customer_text')),
    assert('detecta override de surface indevido', true, violations.includes('context_must_not_override_surface')),
  ];

  return {
    scenario: 'Cenario 3 — guardrail rejeita autoridade indevida do contexto',
    packet,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario4_RespostaAtualMaisDuvida(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-004',
    lead_id: 'lead-004',
    turn_id: 'turn-004',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Quero comprar sim, mas queria entender se posso usar FGTS depois.',
    },
    signals: {
      intents: [signal('intent', 'customer_goal', 'comprar_imovel', 0.93)],
      questions: [signal('question', 'fgts_future_question', 'duvida_sobre_fgts', 0.84)],
      evidence: [evidence('Quero comprar sim, mas queria entender se posso usar FGTS depois.')],
      confidence: {
        overall: 0.88,
        rationale: 'resposta_do_objetivo_atual_e_duvida_no_mesmo_turno',
      },
    },
  });
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'discovery',
      current_objective: 'coletar_customer_goal',
      block_advance: false,
    },
  });
  const violations = assertMultiSignalTurnConformance(multiSignal);
  const assertions = [
    assert('captura mais de um sinal', 2, multiSignal.all_signals.length),
    assert('resposta atual fica aceita como sinal estrutural', ['intent_customer_goal'], multiSignal.core_input.accepted_signal_ids),
    assert('duvida fica pendente, sem virar decisao', ['question_fgts_future_question'], multiSignal.core_input.pending_signal_ids),
    assert('objetivo atual preservado', 'coletar_customer_goal', multiSignal.current_objective),
    assert('nao escreve texto ao cliente', false, multiSignal.speech_input.may_write_customer_text),
    assert('sem violacoes de multi-sinal', [], violations),
  ];

  return {
    scenario: 'Cenario 4 — cliente responde pergunta atual e faz uma duvida junto',
    packet,
    multi_signal: multiSignal,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario5_DoisDadosDePerfilNoMesmoTurno(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-005',
    lead_id: 'lead-005',
    turn_id: 'turn-005',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Sou solteiro e moro com minha mae.',
    },
    signals: {
      facts: [
        signal('fact', 'estado_civil', 'solteiro', 0.94),
        signal('fact', 'household_hint', 'mora_com_mae', 0.88),
      ],
      slot_candidates: [
        signal('slot_candidate', 'civil_status', 'solteiro', 0.94),
        signal('slot_candidate', 'family_composition_hint', 'mae_no_contexto', 0.86),
      ],
      evidence: [evidence('Sou solteiro e moro com minha mae.')],
      confidence: {
        overall: 0.9,
        rationale: 'dois_dados_de_perfil_explicitados_no_mesmo_turno',
      },
    },
  });
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'qualification_civil',
      current_objective: 'coletar_processo',
      block_advance: true,
      gates_activated: ['G_FATO_CRITICO_AUSENTE'],
    },
  });
  const violations = assertMultiSignalTurnConformance(multiSignal);
  const assertions = [
    assert('quatro sinais estruturais preservados em array', 4, multiSignal.all_signals.length),
    assert('sinais aceitos como candidatos estruturais', 4, multiSignal.accepted.length),
    assert('bloqueio estrutural preservado', true, multiSignal.core_input.block_advance),
    assert('next objective atual preservado', 'coletar_processo', multiSignal.core_input.current_objective),
    assert('nenhum slot vira oficial no contexto', false, multiSignal.all_signals.some((item) => item.official_slot)),
    assert('sem violacoes de multi-sinal', [], violations),
  ];

  return {
    scenario: 'Cenario 5 — cliente informa dois dados de perfil no mesmo turno',
    packet,
    multi_signal: multiSignal,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario6_ObjectionMaisRenda(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-006',
    lead_id: 'lead-006',
    turn_id: 'turn-006',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Tenho receio de mandar documentos pelo celular, e minha renda e mais ou menos 3200.',
    },
    signals: {
      objections: [signal('objection', 'docs_channel_resistance', 'medo_docs_celular', 0.88)],
      slot_candidates: [signal('slot_candidate', 'monthly_income_hint', 3200, 0.74)],
      evidence: [evidence('Tenho receio de mandar documentos pelo celular, e minha renda e mais ou menos 3200.')],
      confidence: {
        overall: 0.81,
        rationale: 'objecao_clara_e_renda_aproximada_exige_confirmacao',
      },
    },
  });
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'qualification_renda',
      current_objective: 'coletar_regime_trabalho',
      block_advance: true,
      gates_activated: ['G_FATO_CRITICO_AUSENTE'],
    },
    disposition_overrides: [
      {
        signal_id: 'slot_candidate_monthly_income_hint',
        disposition: 'requires_confirmation',
        reason: 'renda_aproximada_nao_oficializa_sem_confirmacao',
      },
    ],
  });
  const violations = assertMultiSignalTurnConformance(multiSignal);
  const assertions = [
    assert('objecao fica pendente para informar IA', ['objection_docs_channel_resistance'], multiSignal.core_input.pending_signal_ids),
    assert('renda aproximada exige confirmacao', ['slot_candidate_monthly_income_hint'], multiSignal.core_input.confirmation_signal_ids),
    assert('bloqueio do objetivo atual preservado', true, multiSignal.block_advance),
    assert('contexto nao avanca stage', false, multiSignal.core_input.may_advance_stage),
    assert('contexto nao decide regra de renda', false, multiSignal.core_input.may_decide_business_rule),
    assert('sem violacoes de multi-sinal', [], violations),
  ];

  return {
    scenario: 'Cenario 6 — cliente traz objecao e dado de renda',
    packet,
    multi_signal: multiSignal,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario7_RespostaMedoPerguntaNoMesmoTexto(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-007',
    lead_id: 'lead-007',
    turn_id: 'turn-007',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Sou CLT, fico com medo de nao aprovarem e queria saber se precisa visita.',
    },
    signals: {
      facts: [signal('fact', 'work_regime', 'clt', 0.91)],
      objections: [signal('objection', 'approval_fear', 'medo_de_nao_aprovar', 0.82)],
      questions: [signal('question', 'visit_question', 'duvida_sobre_visita', 0.86)],
      evidence: [evidence('Sou CLT, fico com medo de nao aprovarem e queria saber se precisa visita.')],
      confidence: {
        overall: 0.86,
        rationale: 'resposta_factual_medo_e_pergunta_no_mesmo_turno',
      },
    },
  });
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'qualification_renda',
      current_objective: 'coletar_regime_trabalho',
      block_advance: false,
    },
  });
  const violations = assertMultiSignalTurnConformance(multiSignal);
  const assertions = [
    assert('fato de regime aceito estruturalmente', ['fact_work_regime'], multiSignal.core_input.accepted_signal_ids),
    assert('pergunta e medo ficam pendentes em ordem canonica', ['question_visit_question', 'objection_approval_fear'], multiSignal.core_input.pending_signal_ids),
    assert('speech recebe ids contextuais sem surface mecanica', 3, multiSignal.speech_input.context_signal_ids.length),
    assert('IA pode ser informada sem texto final do extractor', false, multiSignal.speech_input.may_write_customer_text),
    assert('objetivo do fluxo preservado', 'coletar_regime_trabalho', multiSignal.current_objective),
    assert('sem violacoes de multi-sinal', [], violations),
  ];

  return {
    scenario: 'Cenario 7 — cliente mistura resposta, medo e pergunta no mesmo texto',
    packet,
    multi_signal: multiSignal,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

export function runContextSmokeSuite() {
  const results = [
    smokeScenario1_ShapeCanonicoDoTurno(),
    smokeScenario2_ContextoNaoEscreveFalaNemDecide(),
    smokeScenario3_GuardrailContraAutoridadeIndevida(),
    smokeScenario4_RespostaAtualMaisDuvida(),
    smokeScenario5_DoisDadosDePerfilNoMesmoTurno(),
    smokeScenario6_ObjectionMaisRenda(),
    smokeScenario7_RespostaMedoPerguntaNoMesmoTexto(),
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
  const suite = runContextSmokeSuite();

  console.log('\n===========================================');
  console.log('ENOVA 2 — Contexto + Extracao — Smoke schema base + multi-sinal (PR 36/37)');
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
