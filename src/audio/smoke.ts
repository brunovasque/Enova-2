import { createInMemoryAdapterRuntime } from '../adapter/runtime.ts';
import { runCoreEngine } from '../core/engine.ts';
import type { CoreDecision, LeadState } from '../core/types.ts';
import { buildSpeechPolicyEnvelope } from '../speech/policy.ts';
import { buildAiFinalSurface } from '../speech/surface.ts';
import { runMultimodalPipelineBase } from './pipeline.ts';
import { runSharedExtractorFromSemanticPackage } from './semantic.ts';
import type { MultimodalPipelineResult, SemanticPackage } from './types.ts';

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface AudioSmokeResult {
  scenario: string;
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

function assertTruthy(description: string, actual: unknown): Assertion {
  return {
    description,
    expected: true,
    actual: Boolean(actual),
    passed: Boolean(actual),
  };
}

function makeDiscoveryStateFromPipeline(result: MultimodalPipelineResult): LeadState {
  const accepted = result.consolidation.accepted;
  const customerGoal = accepted.find((signal) => signal.key === 'customer_goal');

  return {
    lead_id: result.adapter_snapshot.lead_id,
    current_stage: 'discovery',
    facts: customerGoal ? { customer_goal: customerGoal.value } : {},
  };
}

function runSharedCoreAndSpeech(result: MultimodalPipelineResult, llmFinalText: string): {
  core_decision: CoreDecision;
  surface: ReturnType<typeof buildAiFinalSurface>;
} {
  const coreDecision = runCoreEngine(makeDiscoveryStateFromPipeline(result));
  const policy = buildSpeechPolicyEnvelope({ core_decision: coreDecision });
  const surface = buildAiFinalSurface({
    policy,
    draft: {
      author: 'llm',
      text: llmFinalText,
    },
  });

  return {
    core_decision: coreDecision,
    surface,
  };
}

function structuralSignalFingerprint(signals: MultimodalPipelineResult['consolidation']['all_signals']): string[] {
  return signals
    .map((signal) => `${signal.kind}|${signal.key}|${JSON.stringify(signal.value)}|${signal.disposition}`)
    .sort();
}

async function smokeScenario1_AudioUtilFluxoIntegrado(): Promise<AudioSmokeResult> {
  const runtime = createInMemoryAdapterRuntime();
  const result = await runMultimodalPipelineBase({
    session_id: 'sess-audio-001',
    turn_id: 'turn-audio-001',
    lead_external_ref: 'lead-audio-001',
    transcript_text: 'Quero comprar um imóvel e minha renda é 3200',
    transcript_confidence: 0.93,
    current_objective: 'coletar_customer_goal',
    block_advance: false,
    gates_activated: [],
    turn_sequence: 1,
  }, {
    adapter: runtime.adapter,
  });

  const turns = await runtime.adapter.getTurnEvents(result.adapter_snapshot.lead_id);
  const turnSignals = await runtime.adapter.getSignalsByTurn(result.adapter_snapshot.turn_id);
  const integrated = runSharedCoreAndSpeech(result, 'Perfeito, já captei seu objetivo e seguimos para a próxima etapa.');

  const assertions: Assertion[] = [
    assert('audio source_type = test_stub', 'test_stub', result.audio_entry.source_type),
    assert('semantic evidence_status = usable', 'usable', result.semantic_package.evidence_status),
    assert('turno persistido no adapter', 1, turns.records.length),
    assertTruthy('sinais úteis persistidos no adapter', turnSignals.records.length >= 1),
    assert('snapshot de sinais persistidos consistente', turnSignals.records.length, result.adapter_snapshot.persisted_signals),
    assert('extractor compartilhado mantido', true, result.boundaries.extractor_is_shared),
    assert('core compartilhado mantido', true, result.boundaries.core_is_shared),
    assert('adapter compartilhado mantido', true, result.boundaries.adapter_is_shared),
    assert('decisão segue no Core (avança discovery)', 'qualification_civil', integrated.core_decision.stage_after),
    assert('surface final é aceita quando autorada pela IA', true, integrated.surface.accepted),
    assert('mecânico não escreve texto ao cliente', false, integrated.surface.mechanical_text_generated),
  ];

  return {
    scenario: 'Cenário 1 (a) — áudio útil percorre fluxo integrado e gera sinais aproveitáveis',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function smokeScenario2_BaixaConfiancaExigeConfirmacao(): Promise<AudioSmokeResult> {
  const runtime = createInMemoryAdapterRuntime();
  const result = await runMultimodalPipelineBase({
    session_id: 'sess-audio-002',
    turn_id: 'turn-audio-002',
    lead_external_ref: 'lead-audio-002',
    transcript_text: 'Acho que minha renda é mais ou menos 2800',
    transcript_confidence: 0.72,
    current_objective: 'coletar_renda',
    block_advance: true,
    gates_activated: ['G_FATO_CRITICO_AUSENTE'],
    turn_sequence: 1,
  }, {
    adapter: runtime.adapter,
  });

  const turnSignals = await runtime.adapter.getSignalsByTurn(result.adapter_snapshot.turn_id);
  const allConfirmation = turnSignals.records.every((signal) => signal.status === 'requires_confirmation');
  const integrated = runSharedCoreAndSpeech(result, 'Entendi, vou confirmar esse ponto para seguir com segurança.');

  const assertions: Assertion[] = [
    assert('semantic evidence_status = requires_confirmation', 'requires_confirmation', result.semantic_package.evidence_status),
    assertTruthy('há sinais persistidos para confirmação', turnSignals.records.length >= 1),
    assert('todos os sinais ficam em requires_confirmation', true, allConfirmation),
    assert('nenhum sinal foi oficializado como aceito', 0, result.consolidation.accepted.length),
    assert('core mantém bloqueio estrutural por falta de fato aceito', true, integrated.core_decision.block_advance),
    assert('surface final continua autorada pela IA', true, integrated.surface.accepted),
  ];

  return {
    scenario: 'Cenário 2 (b) — baixa confiança exige confirmação e não oficializa sinal',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function smokeScenario3_AudioRejeitadoNaoOficializaSinal(): Promise<AudioSmokeResult> {
  const runtime = createInMemoryAdapterRuntime();
  const result = await runMultimodalPipelineBase({
    session_id: 'sess-audio-003',
    turn_id: 'turn-audio-003',
    lead_external_ref: 'lead-audio-003',
    transcript_text: '[inaudível] ...',
    transcript_confidence: 0.3,
    current_objective: 'coletar_customer_goal',
    block_advance: true,
    gates_activated: ['G_AUDIO_REJEITADO'],
    turn_sequence: 1,
  }, {
    adapter: runtime.adapter,
  });

  const turns = await runtime.adapter.getTurnEvents(result.adapter_snapshot.lead_id);
  const turnSignals = await runtime.adapter.getSignalsByTurn(result.adapter_snapshot.turn_id);
  const integrated = runSharedCoreAndSpeech(result, 'Não consegui captar esse áudio com segurança, podemos confirmar?');

  const assertions: Assertion[] = [
    assert('semantic evidence_status = rejected', 'rejected', result.semantic_package.evidence_status),
    assert('turno persistido para rastreabilidade', 1, turns.records.length),
    assert('sinais não são persistidos quando rejeitado', 0, turnSignals.records.length),
    assert('snapshot também reporta 0 sinais persistidos', 0, result.adapter_snapshot.persisted_signals),
    assert('core permanece bloqueado sem fatos aceitos', true, integrated.core_decision.block_advance),
    assert('surface final continua sob IA (sem fala mecânica)', true, integrated.surface.accepted),
  ];

  return {
    scenario: 'Cenário 3 (c) — áudio rejeitado mantém evidência sem oficializar sinal',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function smokeScenario4_EquivalenciaEstruturalAudioTexto(): Promise<AudioSmokeResult> {
  const runtime = createInMemoryAdapterRuntime();
  const result = await runMultimodalPipelineBase({
    session_id: 'sess-audio-004',
    turn_id: 'turn-audio-004',
    lead_external_ref: 'lead-audio-004',
    transcript_text: 'Quero comprar um imóvel e minha renda é 3200',
    transcript_confidence: 0.94,
    current_objective: 'coletar_customer_goal',
    block_advance: false,
    gates_activated: [],
    turn_sequence: 1,
  }, {
    adapter: runtime.adapter,
  });

  const textSemanticPackage: SemanticPackage = {
    package_id: 'semantic_text_turn_audio_004_equiv',
    session_id: result.semantic_package.session_id,
    turn_id: 'turn-text-004-equivalence',
    produced_at: new Date().toISOString(),
    text: result.semantic_package.text,
    origin: 'text',
    confidence: 1,
    evidence_status: 'usable',
    segments: [],
  };

  const textExtraction = runSharedExtractorFromSemanticPackage({
    semantic_package: textSemanticPackage,
    lead_id: 'lead-text-004',
    current_objective: 'coletar_customer_goal',
    block_advance: false,
    gates_activated: [],
  });

  const audioFingerprint = structuralSignalFingerprint(result.consolidation.all_signals);
  const textFingerprint = structuralSignalFingerprint(textExtraction.consolidation.all_signals);

  const assertions: Assertion[] = [
    assert('texto convergido é idêntico no ponto semântico', textSemanticPackage.text, result.semantic_package.text),
    assert('origem do pacote de áudio = audio', 'audio', result.semantic_package.origin),
    assert('origem do pacote de texto = text', 'text', textSemanticPackage.origin),
    assert('fingerprint estrutural de sinais é equivalente', audioFingerprint, textFingerprint),
    assert('extractor único mantém role estrutural no áudio', 'structural_input_only', result.extracted_packet.role),
    assert('extractor único mantém role estrutural no texto', 'structural_input_only', textExtraction.packet.role),
  ];

  return {
    scenario: 'Cenário 4 (d) — áudio e texto convergem ao mesmo modelo estrutural',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function smokeScenario5_SoberaniaPreservada(): Promise<AudioSmokeResult> {
  const runtime = createInMemoryAdapterRuntime();
  const result = await runMultimodalPipelineBase({
    session_id: 'sess-audio-005',
    turn_id: 'turn-audio-005',
    lead_external_ref: 'lead-audio-005',
    transcript_text: 'Quero comprar um imóvel para minha família',
    transcript_confidence: 0.95,
    current_objective: 'coletar_customer_goal',
    block_advance: false,
    gates_activated: [],
    turn_sequence: 1,
  }, {
    adapter: runtime.adapter,
  });

  const integrated = runSharedCoreAndSpeech(result, 'Perfeito, seguimos com a próxima pergunta para qualificação.');

  const assertions: Assertion[] = [
    assert('pipeline não escreve resposta ao cliente', false, result.boundaries.pipeline_writes_customer_text),
    assert('pipeline não decide regra de negócio', false, result.boundaries.pipeline_decides_business_rule),
    assert('pipeline não avança stage por conta própria', false, result.boundaries.pipeline_advances_stage),
    assert('extractor não decide regra de negócio', false, result.extracted_packet.for_core.may_decide_business_rule),
    assert('extractor não avança stage', false, result.extracted_packet.for_core.may_advance_stage),
    assert('extractor não escreve texto ao cliente', false, result.extracted_packet.for_speech.may_write_customer_text),
    assert('decisão estrutural vem do Core (speech_intent estrutural)', true, typeof integrated.core_decision.speech_intent === 'string'),
    assert('surface final permanece com owner llm', 'llm', integrated.surface.surface_owner),
    assert('surface final aceita autoria llm', 'llm', integrated.surface.draft_author),
    assert('fallback segue não dominante', 'non_dominant_guardrail_only', integrated.surface.fallback_mode),
  ];

  return {
    scenario: 'Cenário 5 (e) — soberania preservada: Extractor/Core/IA sem trilho paralelo',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

export async function runAudioSmokeSuite() {
  const results = [
    await smokeScenario1_AudioUtilFluxoIntegrado(),
    await smokeScenario2_BaixaConfiancaExigeConfirmacao(),
    await smokeScenario3_AudioRejeitadoNaoOficializaSinal(),
    await smokeScenario4_EquivalenciaEstruturalAudioTexto(),
    await smokeScenario5_SoberaniaPreservada(),
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
  runAudioSmokeSuite()
    .then((suite) => {
      console.log('\n===========================================');
      console.log('ENOVA 2 — Frente 5 PR49 — Smoke integrado de áudio + closeout');
      console.log('===========================================');
      console.log(`Executado em: ${suite.executed_at}`);
      console.log(`Total: ${suite.total} | Passou: ${suite.passed} | Falhou: ${suite.failed}`);
      console.log(`Resultado: ${suite.all_passed ? 'PASSOU' : 'FALHOU'}\n`);

      for (const result of suite.results) {
        console.log(`${result.passed ? 'OK' : 'FAIL'} ${result.scenario}`);
        for (const assertion of result.assertions) {
          console.log(`  ${assertion.passed ? 'OK' : 'FAIL'} ${assertion.description}`);
          if (!assertion.passed) {
            console.log(`    Esperado: ${JSON.stringify(assertion.expected)}`);
            console.log(`    Obtido:   ${JSON.stringify(assertion.actual)}`);
          }
        }
        console.log('');
      }

      if (!suite.all_passed) process.exit(1);
    })
    .catch((error: unknown) => {
      console.error('Erro fatal no smoke integrado de áudio da PR49:', error);
      process.exit(1);
    });
}
