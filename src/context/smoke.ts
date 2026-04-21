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
import {
  assertLivingMemoryConformance,
  buildLivingMemorySnapshot,
  type LivingMemorySnapshot,
} from './living-memory.ts';
import { buildMcmvCognitiveContract } from '../speech/cognitive.ts';
import { buildGovernedCompositeTurn } from '../speech/composite-turn.ts';
import { buildSpeechPolicyEnvelope } from '../speech/policy.ts';

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
  living_memory?: LivingMemorySnapshot;
  acceptance?: {
    criteria_covered: string[];
    final_text_owner: 'llm';
    context_wrote_customer_text: false;
    context_decided_business_rule: false;
    context_advanced_stage: false;
    context_persisted_official_slot: false;
  };
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

function smokeScenario8_MemoriaVivaConsolidaSinaisUteis(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-008',
    lead_id: 'lead-008',
    turn_id: 'turn-008',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Moro com minha mae, tenho medo de mandar documento e queria saber se da para visitar. Prefiro continuar por texto.',
    },
    signals: {
      facts: [signal('fact', 'household_hint', 'mora_com_mae', 0.89)],
      questions: [signal('question', 'visit_question', 'duvida_sobre_visita', 0.86)],
      objections: [signal('objection', 'docs_channel_resistance', 'medo_docs_celular', 0.84)],
      pending: [signal('pending', 'conversation_preference', 'prefere_texto', 0.78)],
      evidence: [evidence('Moro com minha mae, tenho medo de mandar documento e queria saber se da para visitar.')],
      confidence: {
        overall: 0.84,
        rationale: 'contexto_util_objecao_duvida_e_preferencia_no_mesmo_turno',
      },
    },
  });
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'docs_prep',
      current_objective: 'preparar_docs',
      block_advance: false,
    },
  });
  const livingMemory = buildLivingMemorySnapshot({ consolidation: multiSignal });
  const violations = assertLivingMemoryConformance(livingMemory);
  const assertions = [
    assert(
      'memoria viva guarda categorias uteis sem texto bruto',
      ['useful_context', 'open_question', 'open_objection', 'next_turn_pending'],
      livingMemory.items.map((item) => item.kind),
    ),
    assert('memoria preserva objetivo atual', 'preparar_docs', livingMemory.current_objective),
    assert('memoria nao escreve fala ao cliente', false, livingMemory.for_speech.may_write_customer_text),
    assert('memoria nao decide regra de negocio', false, livingMemory.for_core.may_decide_business_rule),
    assert('memoria nao persiste em banco', false, livingMemory.for_persistence.may_write_database),
    assert('sem violacoes de memoria viva', [], violations),
  ];

  return {
    scenario: 'Cenario 8 — memoria viva consolida sinais uteis para o proximo turno',
    packet,
    multi_signal: multiSignal,
    living_memory: livingMemory,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario9_MemoriaVivaRejeitaHistoricoBruto(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-009',
    lead_id: 'lead-009',
    turn_id: 'turn-009',
    source: {
      channel: 'text',
      modality: 'text',
    },
    signals: {
      facts: [signal('fact', 'work_regime', 'clt', 0.9)],
      questions: [signal('question', 'docs_question', 'duvida_documentos', 0.82)],
      evidence: [evidence('Sou CLT e queria entender os documentos.')],
      confidence: {
        overall: 0.86,
        rationale: 'fato_e_duvida_para_memoria_curta',
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
  const livingMemory = buildLivingMemorySnapshot({
    consolidation: multiSignal,
    candidates: [
      {
        candidate_id: 'candidate_raw_transcript',
        kind: 'raw_transcript',
        key: 'turno_completo',
        value: 'transcript bruto completo do atendimento anterior',
        reason: 'nao_pode_entrar_como_memoria_viva',
      },
      {
        candidate_id: 'candidate_previous_answer',
        kind: 'full_previous_answer',
        key: 'resposta_anterior',
        value: 'resposta final inteira anterior',
        reason: 'nao_pode_virar_dependencia_de_prompt',
      },
      {
        candidate_id: 'candidate_core_state',
        kind: 'core_structural_state',
        key: 'stage_current',
        value: 'qualification_renda',
        reason: 'estado_do_core_nao_e_memoria_viva',
      },
      {
        candidate_id: 'candidate_db_write',
        kind: 'database_persistence',
        key: 'supabase_write',
        value: 'memory_runtime_v2',
        reason: 'persistencia_real_e_frente_futura',
      },
    ],
  });
  const violations = assertLivingMemoryConformance(livingMemory);
  const assertions = [
    assert(
      'memoria rejeita itens proibidos',
      ['raw_transcript', 'full_previous_answer', 'core_structural_state', 'database_persistence'],
      livingMemory.rejected_items.map((item) => item.kind),
    ),
    assert('nenhum item proibido entra na memoria viva', false, livingMemory.items.some((item) => (
      item.key === 'turno_completo' || item.key === 'resposta_anterior' || item.key === 'stage_current' || item.key === 'supabase_write'
    ))),
    assert('memoria segue informativa para LLM', true, livingMemory.for_speech.may_inform_llm),
    assert('memoria nao sobrescreve surface', false, livingMemory.for_speech.may_override_surface),
    assert('sem violacoes de memoria viva', [], violations),
  ];

  return {
    scenario: 'Cenario 9 — memoria viva rejeita historico bruto, prompt inflado e persistencia',
    packet,
    multi_signal: multiSignal,
    living_memory: livingMemory,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario10_MemoriaVivaNaoSubstituiCoreNemSupabase(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-010',
    lead_id: 'lead-010',
    turn_id: 'turn-010',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Minha renda mudou para 3400, mas nao tenho certeza se conto o extra.',
    },
    signals: {
      slot_candidates: [signal('slot_candidate', 'monthly_income_hint', 3400, 0.76)],
      ambiguities: [signal('ambiguity', 'extra_income_scope', 'duvida_sobre_extra', 0.58)],
      evidence: [evidence('Minha renda mudou para 3400, mas nao tenho certeza se conto o extra.')],
      confidence: {
        overall: 0.72,
        rationale: 'mudanca_de_renda_com_ambiguidade_nao_oficializa_estado',
      },
    },
  });
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'qualification_renda',
      current_objective: 'confirmar_renda',
      block_advance: true,
      gates_activated: ['G_CONFIRMAR_RENDA'],
    },
    disposition_overrides: [
      {
        signal_id: 'slot_candidate_monthly_income_hint',
        disposition: 'requires_confirmation',
        reason: 'renda_informada_com_ambiguidade_exige_confirmacao',
      },
    ],
  });
  const livingMemory = buildLivingMemorySnapshot({ consolidation: multiSignal });
  const violations = assertLivingMemoryConformance(livingMemory);
  const assertions = [
    assert('memoria preserva bloqueio estrutural', true, livingMemory.for_core.block_advance),
    assert('memoria preserva objetivo atual do Core', 'confirmar_renda', livingMemory.for_core.current_objective),
    assert('memoria nao substitui estado do Core', false, livingMemory.for_core.may_replace_core_state),
    assert('memoria nao oficializa slot', false, livingMemory.for_core.may_persist_official_slot),
    assert('memoria nao exige Supabase', false, livingMemory.for_persistence.requires_supabase),
    assert('sinais que exigem confirmacao viram pendencia curta', ['next_turn_pending', 'next_turn_pending'], livingMemory.items.map((item) => item.kind)),
    assert('sem violacoes de memoria viva', [], violations),
  ];

  return {
    scenario: 'Cenario 10 — memoria viva informa sem substituir Core nem Supabase',
    packet,
    multi_signal: multiSignal,
    living_memory: livingMemory,
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

function smokeScenario11_AcceptanceFinalIntegradoFrente3(): ContextSmokeResult {
  const packet = buildSemanticTurnPacket({
    packet_id: 'ctx-packet-011',
    lead_id: 'lead-011',
    turn_id: 'turn-011',
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: 'Sou CLT, moro com minha mae, tenho medo de mandar documento por celular e queria saber se ainda posso visitar.',
    },
    signals: {
      facts: [
        signal('fact', 'work_regime', 'clt', 0.92),
        signal('fact', 'household_hint', 'mora_com_mae', 0.87),
      ],
      questions: [signal('question', 'visit_question', 'duvida_sobre_visita', 0.85)],
      objections: [signal('objection', 'docs_channel_resistance', 'medo_docs_celular', 0.86)],
      slot_candidates: [signal('slot_candidate', 'family_composition_hint', 'mae_no_contexto', 0.79)],
      pending: [signal('pending', 'docs_channel_preference', 'evitar_envio_celular', 0.78)],
      evidence: [evidence('Sou CLT, moro com minha mae, tenho medo de mandar documento por celular e queria saber se ainda posso visitar.')],
      confidence: {
        overall: 0.85,
        rationale: 'acceptance_final_com_contexto_multi_sinal_memoria_e_soberania_da_ia',
      },
    },
  });
  const packetViolations = assertSemanticTurnPacketConformance(packet);
  const multiSignal = buildMultiSignalTurnConsolidation({
    packet,
    context: {
      stage_current: 'docs_prep',
      current_objective: 'preparar_docs',
      block_advance: true,
      gates_activated: ['G_FINAL_OPERACIONAL'],
    },
    disposition_overrides: [
      {
        signal_id: 'slot_candidate_family_composition_hint',
        disposition: 'requires_confirmation',
        reason: 'composicao_familiar_informada_fora_do_objetivo_atual_exige_confirmacao_posterior',
      },
    ],
  });
  const multiSignalViolations = assertMultiSignalTurnConformance(multiSignal);
  const livingMemory = buildLivingMemorySnapshot({ consolidation: multiSignal });
  const livingMemoryViolations = assertLivingMemoryConformance(livingMemory);
  const policy = buildSpeechPolicyEnvelope({
    core_decision: {
      stage_current: 'docs_prep',
      stage_after: 'docs_prep',
      next_objective: 'preparar_docs',
      block_advance: true,
      gates_activated: ['G_FINAL_OPERACIONAL'],
      speech_intent: 'bloqueio',
    },
  });
  const cognitive = buildMcmvCognitiveContract({ policy });
  const compositeTurn = buildGovernedCompositeTurn({
    policy,
    cognitive_contract: cognitive,
    signals: [
      {
        kind: 'fact_candidate',
        key: 'work_regime',
        value: 'clt',
        handling: 'inform_llm',
      },
      {
        kind: 'objection',
        key: 'docs_channel_resistance',
        value: 'medo_docs_celular',
        handling: 'inform_llm',
      },
      {
        kind: 'question',
        key: 'visit_question',
        value: 'duvida_sobre_visita',
        handling: 'inform_llm',
      },
    ],
    draft: {
      author: 'llm',
      text: 'Entendi: voce trabalha CLT, mora com sua mae e prefere cuidado com documentos pelo celular. Vou manter esse ponto no contexto e seguir respeitando o objetivo atual antes de qualquer proxima etapa.',
    },
  });
  const acceptance = {
    criteria_covered: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'],
    final_text_owner: 'llm' as const,
    context_wrote_customer_text: false as const,
    context_decided_business_rule: false as const,
    context_advanced_stage: false as const,
    context_persisted_official_slot: false as const,
  };
  const assertions = [
    assert('C1 turno estruturado conforme', [], packetViolations),
    assert('C2 categorias canonicas presentes', true, (
      packet.signals.facts.length > 0
      && packet.signals.questions.length > 0
      && packet.signals.objections.length > 0
      && packet.signals.slot_candidates.length > 0
      && packet.signals.pending.length > 0
      && packet.signals.evidence.length > 0
      && packet.signals.confidence.overall > 0
    )),
    assert('C3 multi-intencao real consolidada', true, multiSignal.all_signals.length >= 5),
    assert('C3 aceito pendente e confirmacao separados', true, (
      multiSignal.accepted.length > 0
      && multiSignal.pending.length > 0
      && multiSignal.requires_confirmation.length > 0
    )),
    assert('C4 multi-sinal nao decide regra nem avanca stage', [], multiSignalViolations),
    assert('C4 objetivo e bloqueio preservados', ['preparar_docs', true], [multiSignal.current_objective, multiSignal.block_advance]),
    assert('C5 IA permanece dona da fala final', true, compositeTurn.accepted),
    assert('C5 texto final veio da IA', 'llm', compositeTurn.free_response.surface.draft_author),
    assert('C5 contexto nao escreveu resposta', false, multiSignal.speech_input.may_write_customer_text),
    assert('C5 mecanico sem prioridade de fala', false, compositeTurn.mechanical_parser_dominant),
    assert('C6 memoria viva minima conforme', [], livingMemoryViolations),
    assert('C6 memoria nao assume persistencia', false, livingMemory.for_persistence.may_write_database),
    assert('C7 acceptance cobre criterios C1-C7', ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'], acceptance.criteria_covered),
    assert('C7 acceptance sem violacoes integradas', [], [
      ...packetViolations,
      ...multiSignalViolations,
      ...livingMemoryViolations,
      ...compositeTurn.violations,
    ]),
  ];

  return {
    scenario: 'Cenario 11 — acceptance final integrado da Frente 3',
    packet,
    multi_signal: multiSignal,
    living_memory: livingMemory,
    acceptance,
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
    smokeScenario8_MemoriaVivaConsolidaSinaisUteis(),
    smokeScenario9_MemoriaVivaRejeitaHistoricoBruto(),
    smokeScenario10_MemoriaVivaNaoSubstituiCoreNemSupabase(),
    smokeScenario11_AcceptanceFinalIntegradoFrente3(),
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
  console.log('ENOVA 2 — Contexto + Extracao — Smoke schema base + multi-sinal + memoria viva + acceptance (PR 36/37/38/39)');
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
