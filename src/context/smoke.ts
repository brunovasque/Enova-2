import {
  assertSemanticTurnPacketConformance,
  buildSemanticTurnPacket,
  type ExtractedSignal,
  type SemanticTurnPacket,
  type TurnEvidence,
} from './schema.ts';

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface ContextSmokeResult {
  scenario: string;
  packet: SemanticTurnPacket;
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

export function runContextSmokeSuite() {
  const results = [
    smokeScenario1_ShapeCanonicoDoTurno(),
    smokeScenario2_ContextoNaoEscreveFalaNemDecide(),
    smokeScenario3_GuardrailContraAutoridadeIndevida(),
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
  console.log('ENOVA 2 — Contexto + Extracao — Smoke schema base (PR 36)');
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
