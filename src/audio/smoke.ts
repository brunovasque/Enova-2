import { createInMemoryAdapterRuntime } from '../adapter/runtime.ts';
import { runMultimodalPipelineBase } from './pipeline.ts';

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

async function smokeScenario1_FluxoBaseUteisPersistidos(): Promise<AudioSmokeResult> {
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
  const assertions: Assertion[] = [
    assert('audio source_type = test_stub', 'test_stub', result.audio_entry.source_type),
    assert('semantic origin = audio', 'audio', result.semantic_package.origin),
    assert('extractor output role estrutural', 'structural_input_only', result.extracted_packet.role),
    assert('speech bridge não escreve texto', false, result.speech_bridge.may_write_customer_text),
    assert('pipeline não decide regra', false, result.boundaries.pipeline_decides_business_rule),
    assert('pipeline não escreve fala final', false, result.boundaries.pipeline_writes_customer_text),
    assert('turno persistido no adapter', 1, turns.records.length),
    assertTruthy('sinais persistidos no adapter', turnSignals.records.length >= 1),
    assert('snapshot de sinais persistidos consistente', turnSignals.records.length, result.adapter_snapshot.persisted_signals),
  ];

  return {
    scenario: 'Cenário 1 — fluxo base multimodal em stub persiste turno e sinais úteis',
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
  const assertions: Assertion[] = [
    assert('semantic evidence_status = requires_confirmation', 'requires_confirmation', result.semantic_package.evidence_status),
    assertTruthy('há sinais persistidos para confirmação', turnSignals.records.length >= 1),
    assert('todos os sinais ficam em requires_confirmation', true, allConfirmation),
    assert('bloqueio estrutural preservado', true, result.consolidation.block_advance),
    assert('speech bridge segue sem autoria de fala', false, result.speech_bridge.may_write_customer_text),
  ];

  return {
    scenario: 'Cenário 2 — baixa confiança mantém trilho de confirmação sem decisão mecânica',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

async function smokeScenario3_ConfiancaRejeitadaNaoViraSinal(): Promise<AudioSmokeResult> {
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
  const assertions: Assertion[] = [
    assert('semantic evidence_status = rejected', 'rejected', result.semantic_package.evidence_status),
    assert('turno ainda é persistido para rastreabilidade', 1, turns.records.length),
    assert('sinais não são persistidos quando rejeitado', 0, turnSignals.records.length),
    assert('snapshot também reporta 0 sinais persistidos', 0, result.adapter_snapshot.persisted_signals),
    assert('pipeline mantém extractor/core/adapter compartilhados', true, (
      result.boundaries.extractor_is_shared
      && result.boundaries.core_is_shared
      && result.boundaries.adapter_is_shared
    )),
  ];

  return {
    scenario: 'Cenário 3 — confiança rejeitada mantém evidência sem oficializar sinais',
    assertions,
    passed: assertions.every((item) => item.passed),
  };
}

export async function runAudioSmokeSuite() {
  const results = [
    await smokeScenario1_FluxoBaseUteisPersistidos(),
    await smokeScenario2_BaixaConfiancaExigeConfirmacao(),
    await smokeScenario3_ConfiancaRejeitadaNaoViraSinal(),
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
      console.log('ENOVA 2 — Frente 5 PR48 — Smoke pipeline multimodal base');
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
      console.error('Erro fatal no smoke de áudio da PR48:', error);
      process.exit(1);
    });
}
