/**
 * ENOVA 2 — Supabase Adapter Base — Smoke Test (PR 42)
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seção 13 (PR 42, microetapa 5)
 *   FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 13 (smoke documental da PR 41)
 *
 * ESCOPO: smoke do adapter base — valida:
 *   1. Instância cria sem erro; role e constraints declarados corretamente
 *   2. Todas as operações de stub existem e retornam o shape esperado
 *   3. Boundaries de layer declarados corretamente (quem pode, quem não pode)
 *   4. 10 entidades cobertas por operações e por ADAPTER_WRITE_OWNERSHIP
 *
 * NOTA: este smoke NÃO conecta ao Supabase real — isso é para PR 44.
 * Smoke com dados reais persistidos = aceitação da PR 44.
 *
 * Para executar: npm run smoke:adapter
 */

import { SupabaseAdapterBase } from './index.ts';
import {
  ADAPTER_ALLOWED_CALLERS,
  ADAPTER_CANONICAL_CONSTRAINTS,
  ADAPTER_PROHIBITED_DIRECT_WRITERS,
  ADAPTER_ROLE,
  ADAPTER_WRITE_OWNERSHIP,
  CORE_SOVEREIGN_FIELDS,
} from './boundaries.ts';

// ---------------------------------------------------------------------------
// Tipos internos do smoke
// ---------------------------------------------------------------------------

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface AdapterSmokeResult {
  scenario: string;
  assertions: Assertion[];
  passed: boolean;
}

export interface AdapterSmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: AdapterSmokeResult[];
  executed_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assert(description: string, expected: unknown, actual: unknown): Assertion {
  return {
    description,
    expected,
    actual,
    passed: JSON.stringify(expected) === JSON.stringify(actual),
  };
}

function assertTruthy(description: string, value: unknown): Assertion {
  return {
    description,
    expected: true,
    actual: Boolean(value),
    passed: Boolean(value),
  };
}

// ---------------------------------------------------------------------------
// Cenário 1 — Instância e role do Adapter
// ---------------------------------------------------------------------------

async function smokeScenario1_InstanciaERolePersistenceOnly(): Promise<AdapterSmokeResult> {
  const adapter = new SupabaseAdapterBase();
  const assertions: Assertion[] = [];

  assertions.push(assert(
    'adapter.role = persistence_only',
    'persistence_only',
    adapter.role,
  ));

  assertions.push(assert(
    'ADAPTER_ROLE.may_write_customer_text = false',
    false,
    ADAPTER_ROLE.may_write_customer_text,
  ));

  assertions.push(assert(
    'ADAPTER_ROLE.may_decide_business_rule = false',
    false,
    ADAPTER_ROLE.may_decide_business_rule,
  ));

  assertions.push(assert(
    'ADAPTER_ROLE.may_define_stage = false',
    false,
    ADAPTER_ROLE.may_define_stage,
  ));

  assertions.push(assert(
    'ADAPTER_ROLE.may_define_next_objective = false',
    false,
    ADAPTER_ROLE.may_define_next_objective,
  ));

  assertions.push(assert(
    'constraints inclui adapter_nao_decide_regra_de_negocio',
    true,
    adapter.constraints.includes('adapter_nao_decide_regra_de_negocio'),
  ));

  assertions.push(assert(
    'constraints inclui adapter_nao_escreve_resposta_ao_cliente',
    true,
    adapter.constraints.includes('adapter_nao_escreve_resposta_ao_cliente'),
  ));

  assertions.push(assert(
    'constraints inclui speech_nao_escreve_direto_nas_tabelas',
    true,
    adapter.constraints.includes('speech_nao_escreve_direto_nas_tabelas'),
  ));

  assertions.push(assert(
    'constraints inclui context_extracao_nao_escreve_direto_nas_tabelas',
    true,
    adapter.constraints.includes('context_extracao_nao_escreve_direto_nas_tabelas'),
  ));

  assertions.push(assert(
    'constraints inclui escrita_centralizada_no_adapter',
    true,
    adapter.constraints.includes('escrita_centralizada_no_adapter'),
  ));

  assertions.push(assertTruthy(
    'adapter.writeOwnership existe e é objeto',
    typeof adapter.writeOwnership === 'object' && adapter.writeOwnership !== null,
  ));

  assertions.push(assert(
    'ADAPTER_CANONICAL_CONSTRAINTS tem 11 constraints',
    11,
    ADAPTER_CANONICAL_CONSTRAINTS.length,
  ));

  return {
    scenario: 'Cenario 1 — instancia, role e constraints canonicas',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 2 — Operações de stub (todas retornam not_implemented)
// ---------------------------------------------------------------------------

async function smokeScenario2_OperacoesStubNotImplemented(): Promise<AdapterSmokeResult> {
  const adapter = new SupabaseAdapterBase();
  const assertions: Assertion[] = [];
  const PLACEHOLDER_ERR = 'not_implemented — placeholder PR42: implementação runtime na PR44';

  // lead
  const upsertLeadResult = await adapter.upsertLead({ external_ref: 'test-ref' });
  assertions.push(assert('upsertLead: success = false', false, upsertLeadResult.success));
  assertions.push(assert('upsertLead: record = null', null, upsertLeadResult.record));
  assertions.push(assert('upsertLead: error = placeholder', PLACEHOLDER_ERR, upsertLeadResult.error));

  const getLeadResult = await adapter.getLead('lead-001');
  assertions.push(assert('getLead: found = false', false, getLeadResult.found));
  assertions.push(assert('getLead: record = null', null, getLeadResult.record));

  // lead_state
  const writeStateResult = await adapter.writeLeadState({
    lead_id: 'lead-001',
    source_turn_id: 'turn-001',
    stage_current: 'discovery',
    stage_after_last_decision: 'discovery',
    next_objective: 'coletar_customer_goal',
    block_advance: false,
    policy_flags_json: {},
    updated_by_layer: 'core',
  });
  assertions.push(assert('writeLeadState: success = false', false, writeStateResult.success));

  const getStateResult = await adapter.getCurrentLeadState('lead-001');
  assertions.push(assert('getCurrentLeadState: found = false', false, getStateResult.found));

  // turn_event
  const writeTurnResult = await adapter.writeTurnEvent({
    lead_id: 'lead-001',
    idempotency_key: 'lead-001:text:1745000000000',
    channel_type: 'text',
    normalized_input_json: { text: 'Quero comprar um apartamento' },
    semantic_package_json: {},
    core_decision_json: { stage_current: 'discovery', next_objective: 'coletar_customer_goal' },
    turn_sequence: 1,
  });
  assertions.push(assert('writeTurnEvent: success = false', false, writeTurnResult.success));

  const getTurnsResult = await adapter.getTurnEvents('lead-001');
  assertions.push(assert('getTurnEvents: records = []', [], getTurnsResult.records));
  assertions.push(assert('getTurnEvents: error = placeholder', PLACEHOLDER_ERR, getTurnsResult.error));

  const getTurnResult = await adapter.getTurnEvent('turn-001');
  assertions.push(assert('getTurnEvent: found = false', false, getTurnResult.found));

  // signals
  const writeSignalsResult = await adapter.writeSignals([{
    turn_id: 'turn-001',
    lead_id: 'lead-001',
    signal_type: 'fact',
    signal_key: 'monthly_income',
    signal_value_json: { value: 2500 },
    confidence_score: 0.9,
    status: 'pending',
  }]);
  assertions.push(assert('writeSignals: records = []', [], writeSignalsResult.records));

  const getSignalsByLeadResult = await adapter.getSignalsByLead('lead-001');
  assertions.push(assert('getSignalsByLead: records = []', [], getSignalsByLeadResult.records));

  // memory_runtime
  const upsertMemoryResult = await adapter.upsertMemoryRuntime({
    lead_id: 'lead-001',
    open_questions_json: {},
    open_objections_json: {},
    useful_context_json: {},
    next_turn_pending_json: {},
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  });
  assertions.push(assert('upsertMemoryRuntime: success = false', false, upsertMemoryResult.success));

  const getMemoryResult = await adapter.getActiveMemory('lead-001');
  assertions.push(assert('getActiveMemory: found = false', false, getMemoryResult.found));

  // document
  const upsertDocResult = await adapter.upsertDocument({
    lead_id: 'lead-001',
    doc_type: 'rg',
    doc_status: 'requested',
    source_turn_id: 'turn-001',
  });
  assertions.push(assert('upsertDocument: success = false', false, upsertDocResult.success));

  const getDocsResult = await adapter.getDocumentsByLead('lead-001');
  assertions.push(assert('getDocumentsByLead: records = []', [], getDocsResult.records));

  // dossier
  const upsertDossierResult = await adapter.upsertDossier({
    lead_id: 'lead-001',
    dossier_status: 'incomplete',
    dossier_summary_json: {},
    required_docs_json: {},
    ready_for_visit: false,
    ready_for_broker_handoff: false,
    compiled_at: new Date().toISOString(),
  });
  assertions.push(assert('upsertDossier: success = false', false, upsertDossierResult.success));

  const getDossierResult = await adapter.getDossier('lead-001');
  assertions.push(assert('getDossier: found = false', false, getDossierResult.found));

  // visit_schedule
  const writeVisitResult = await adapter.writeVisitSchedule({
    lead_id: 'lead-001',
    source_turn_id: 'turn-001',
    visit_status: 'pending',
    visit_interest_declared: true,
  });
  assertions.push(assert('writeVisitSchedule: success = false', false, writeVisitResult.success));

  const getVisitsResult = await adapter.getVisitSchedulesByLead('lead-001');
  assertions.push(assert('getVisitSchedulesByLead: records = []', [], getVisitsResult.records));

  // operational_history
  const appendHistoryResult = await adapter.appendHistoryEvent({
    lead_id: 'lead-001',
    turn_id: 'turn-001',
    event_type: 'turn_processed',
    actor_layer: 'adapter',
    event_payload_json: { turn_sequence: 1 },
    occurred_at: new Date().toISOString(),
  });
  assertions.push(assert('appendHistoryEvent: success = false', false, appendHistoryResult.success));

  const getHistoryResult = await adapter.getHistoryByLead('lead-001');
  assertions.push(assert('getHistoryByLead: records = []', [], getHistoryResult.records));

  // projection_bridge
  const upsertProjResult = await adapter.upsertProjection({
    lead_id: 'lead-001',
    target_system: 'enova1',
    projection_payload_json: {},
    projection_status: 'pending',
  });
  assertions.push(assert('upsertProjection: success = false', false, upsertProjResult.success));

  const getProjResult = await adapter.getProjection('lead-001', 'enova1');
  assertions.push(assert('getProjection: found = false', false, getProjResult.found));

  return {
    scenario: 'Cenario 2 — stubs retornam not_implemented para todas as 10 entidades',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 3 — Boundaries e ownership de layers
// ---------------------------------------------------------------------------

async function smokeScenario3_BoundariesEOwnership(): Promise<AdapterSmokeResult> {
  const assertions: Assertion[] = [];

  // context_extraction não pode escrever direto
  assertions.push(assert(
    'context_extraction proibida de escrita direta',
    true,
    (ADAPTER_PROHIBITED_DIRECT_WRITERS as readonly string[]).includes('context_extraction'),
  ));

  // speech_engine não pode escrever direto
  assertions.push(assert(
    'speech_engine proibida de escrita direta',
    true,
    (ADAPTER_PROHIBITED_DIRECT_WRITERS as readonly string[]).includes('speech_engine'),
  ));

  // llm_layer não pode escrever direto
  assertions.push(assert(
    'llm_layer proibida de escrita direta',
    true,
    (ADAPTER_PROHIBITED_DIRECT_WRITERS as readonly string[]).includes('llm_layer'),
  ));

  // worker pode chamar o adapter
  assertions.push(assert(
    'worker está na lista de callers autorizados',
    true,
    (ADAPTER_ALLOWED_CALLERS as readonly string[]).includes('worker'),
  ));

  // core_mechanical pode chamar o adapter
  assertions.push(assert(
    'core_mechanical está na lista de callers autorizados',
    true,
    (ADAPTER_ALLOWED_CALLERS as readonly string[]).includes('core_mechanical'),
  ));

  // Campos soberanos do Core
  const sovereignChecks: Array<[string, string]> = [
    ['stage_current', 'stage_current é campo soberano do Core'],
    ['next_objective', 'next_objective é campo soberano do Core'],
    ['block_advance', 'block_advance é campo soberano do Core'],
    ['policy_flags_json', 'policy_flags_json é campo soberano do Core'],
    ['ready_for_visit', 'ready_for_visit é campo soberano do Core'],
    ['ready_for_broker_handoff', 'ready_for_broker_handoff é campo soberano do Core'],
  ];

  for (const [field, description] of sovereignChecks) {
    assertions.push(assert(
      description,
      true,
      (CORE_SOVEREIGN_FIELDS as readonly string[]).includes(field),
    ));
  }

  // CORE_SOVEREIGN_FIELDS tem 6 campos
  assertions.push(assert(
    'CORE_SOVEREIGN_FIELDS tem 6 campos',
    6,
    CORE_SOVEREIGN_FIELDS.length,
  ));

  // enova2_lead_state_v2: data_originator = core_via_payload
  assertions.push(assert(
    'enova2_lead_state_v2: data_originator = core_via_payload',
    'core_via_payload',
    ADAPTER_WRITE_OWNERSHIP.enova2_lead_state_v2.data_originator,
  ));

  // enova2_projection_bridge_v2: target_restricted_to inclui enova1
  assertions.push(assert(
    'enova2_projection_bridge_v2: target_restricted_to inclui enova1',
    true,
    ADAPTER_WRITE_OWNERSHIP.enova2_projection_bridge_v2.target_restricted_to.includes('enova1'),
  ));

  // enova2_operational_history_v2: append_only = true
  assertions.push(assert(
    'enova2_operational_history_v2: append_only = true',
    true,
    ADAPTER_WRITE_OWNERSHIP.enova2_operational_history_v2.append_only,
  ));

  // enova2_turn_events_v2: append_only = true
  assertions.push(assert(
    'enova2_turn_events_v2: append_only = true',
    true,
    ADAPTER_WRITE_OWNERSHIP.enova2_turn_events_v2.append_only,
  ));

  return {
    scenario: 'Cenario 3 — boundaries, campos soberanos do Core e ownership por layer',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 4 — 10 entidades cobertas por operações e por ADAPTER_WRITE_OWNERSHIP
// ---------------------------------------------------------------------------

async function smokeScenario4_Cobertura10Entidades(): Promise<AdapterSmokeResult> {
  const adapter = new SupabaseAdapterBase();
  const assertions: Assertion[] = [];

  // Verificar que todos os métodos existem e são funções
  const requiredMethods = [
    'upsertLead', 'updateLead', 'getLead',
    'writeLeadState', 'getCurrentLeadState',
    'writeTurnEvent', 'getTurnEvents', 'getTurnEvent',
    'writeSignals', 'updateSignalStatus', 'getSignalsByLead', 'getSignalsByTurn',
    'upsertMemoryRuntime', 'getActiveMemory',
    'upsertDocument', 'updateDocumentStatus', 'getDocumentsByLead',
    'upsertDossier', 'getDossier',
    'writeVisitSchedule', 'updateVisitStatus', 'getVisitSchedulesByLead',
    'appendHistoryEvent', 'getHistoryByLead',
    'upsertProjection', 'getProjection',
  ] as const;

  for (const method of requiredMethods) {
    assertions.push(assert(
      `adapter.${method} existe e é função`,
      true,
      typeof (adapter as Record<string, unknown>)[method] === 'function',
    ));
  }

  // 10 entidades no ADAPTER_WRITE_OWNERSHIP
  const expectedEntities = [
    'enova2_lead',
    'enova2_lead_state_v2',
    'enova2_turn_events_v2',
    'enova2_signal_records_v2',
    'enova2_memory_runtime_v2',
    'enova2_document_records_v2',
    'enova2_dossier_v2',
    'enova2_visit_schedule_v2',
    'enova2_operational_history_v2',
    'enova2_projection_bridge_v2',
  ] as const;

  assertions.push(assert(
    'ADAPTER_WRITE_OWNERSHIP cobre exatamente 10 entidades',
    10,
    Object.keys(ADAPTER_WRITE_OWNERSHIP).length,
  ));

  for (const entity of expectedEntities) {
    assertions.push(assert(
      `${entity} coberta pelo ADAPTER_WRITE_OWNERSHIP`,
      true,
      entity in ADAPTER_WRITE_OWNERSHIP,
    ));

    assertions.push(assert(
      `${entity}: writer = 'adapter'`,
      'adapter',
      ADAPTER_WRITE_OWNERSHIP[entity].writer,
    ));
  }

  return {
    scenario: 'Cenario 4 — cobertura completa das 10 entidades (operacoes + ownership)',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

export async function runAdapterSmokeSuite(): Promise<AdapterSmokeSuiteResult> {
  const scenarios = [
    smokeScenario1_InstanciaERolePersistenceOnly,
    smokeScenario2_OperacoesStubNotImplemented,
    smokeScenario3_BoundariesEOwnership,
    smokeScenario4_Cobertura10Entidades,
  ];

  const results: AdapterSmokeResult[] = [];
  for (const scenarioFn of scenarios) {
    const r = await scenarioFn();
    results.push({ ...r, passed: r.assertions.every((a) => a.passed) });
  }

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
  runAdapterSmokeSuite()
    .then((suite) => {
      console.log('\n===========================================');
      console.log('ENOVA 2 — Supabase Adapter Base — Smoke (PR 42)');
      console.log('===========================================');
      console.log(`Âncora: FRENTE4_PERSISTABLE_DATA_CONTRACT (PR41) | Contrato da Frente 4 | PR42 microetapa 5`);
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

      console.log('ACCEPTANCE CRITERIA PR42:');
      console.log('  [x] casca tecnica minima do adapter criada em src/adapter/');
      console.log('  [x] interfaces de leitura/escrita declaradas (10 entidades)');
      console.log('  [x] ownership de cada write path declarado explicitamente');
      console.log('  [x] integracao centralizada sem espalhar chamada direta');
      console.log('  [x] sem canal externo, sem audio, sem Meta nesta PR');
      console.log('  [x] smoke do adapter base executado');
      console.log('  [x] Core entrega payload — Adapter projeta/persiste (nao decide)');
      console.log('  [x] Speech/Context nao escrevem direto (declarado em boundaries)');
      console.log('  [x] campos soberanos do Core declarados (nao calculados pelo Adapter)');
      console.log('  [ ] implementacao runtime real — PLACEHOLDER para PR44');
      console.log('  [ ] smoke persistente com dados reais — PR44\n');

      if (!suite.all_passed) process.exit(1);
    })
    .catch((err: unknown) => {
      console.error('Erro fatal no smoke do adapter:', err);
      process.exit(1);
    });
}
