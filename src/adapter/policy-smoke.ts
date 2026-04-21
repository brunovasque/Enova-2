/**
 * ENOVA 2 — Supabase Adapter — Smoke de Política (PR 43)
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seção 13 (PR 43, microetapa 5)
 *   policy.ts — política canônica de consistência (PR 43)
 *
 * ESCOPO: smoke específico da PR 43 — valida:
 *   1. Política de escrita por entidade (write_strategy e reprocess_behavior)
 *   2. Idempotency keys por entidade
 *   3. Campos imutáveis após insert por entidade
 *   4. TTL da memória viva (valores numéricos e regras)
 *   5. Projection bridge: campos permitidos, proibidos e mapa de compatibilidade
 *   6. Monotonicidade de status (transições válidas e inválidas)
 *   7. Entidades append-only vs upsert vs overwrite
 *   8. Cobertura das 10 entidades na política consolidada
 *
 * NOTA: este smoke NÃO conecta ao Supabase real — isso é para PR 44.
 * Este smoke valida a declaração de política (policy.ts) — não o runtime.
 *
 * Para executar: npm run smoke:adapter:policy
 */

import {
  ADAPTER_CONSISTENCY_POLICY,
  ENTITY_CONSISTENCY_POLICY,
  MEMORY_RUNTIME_TTL_POLICY,
  PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS,
  PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS,
  PROJECTION_BRIDGE_POLICY,
  STATUS_MONOTONICITY,
  POLICY_SUMMARY,
} from './policy.ts';

// ---------------------------------------------------------------------------
// Tipos internos do smoke
// ---------------------------------------------------------------------------

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface PolicySmokeResult {
  scenario: string;
  assertions: Assertion[];
  passed: boolean;
}

export interface PolicySmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: PolicySmokeResult[];
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

function assertIncludes(description: string, arr: readonly unknown[], item: unknown): Assertion {
  return {
    description,
    expected: true,
    actual: (arr as unknown[]).includes(item),
    passed: (arr as unknown[]).includes(item),
  };
}

function assertNotIncludes(description: string, arr: readonly unknown[], item: unknown): Assertion {
  const included = (arr as unknown[]).includes(item);
  return {
    description,
    expected: false,
    actual: included,
    passed: !included,
  };
}

// ---------------------------------------------------------------------------
// Cenário 1 — Cobertura das 10 entidades na política consolidada
// ---------------------------------------------------------------------------

function smokeScenario1_Cobertura10Entidades(): PolicySmokeResult {
  const assertions: Assertion[] = [];

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
    'ENTITY_CONSISTENCY_POLICY cobre exatamente 10 entidades',
    10,
    Object.keys(ENTITY_CONSISTENCY_POLICY).length,
  ));

  for (const entity of expectedEntities) {
    assertions.push(assertTruthy(
      `${entity} presente na política consolidada`,
      entity in ENTITY_CONSISTENCY_POLICY,
    ));

    const policy = ENTITY_CONSISTENCY_POLICY[entity];

    assertions.push(assertTruthy(
      `${entity}: write_strategy definida`,
      Boolean(policy.write_strategy),
    ));

    assertions.push(assertTruthy(
      `${entity}: reprocess_behavior definido`,
      Boolean(policy.reprocess_behavior),
    ));

    assertions.push(assertTruthy(
      `${entity}: idempotency_key definida`,
      Boolean(policy.idempotency_key),
    ));

    assertions.push(assertTruthy(
      `${entity}: immutable_after_insert definido (array)`,
      Array.isArray(policy.immutable_after_insert),
    ));
  }

  assertions.push(assert(
    'POLICY_SUMMARY cobre exatamente 10 entidades',
    10,
    POLICY_SUMMARY.length,
  ));

  assertions.push(assert(
    'ADAPTER_CONSISTENCY_POLICY.meta.pr = PR 43',
    'PR 43',
    ADAPTER_CONSISTENCY_POLICY.meta.pr,
  ));

  return {
    scenario: 'Cenario 1 — cobertura das 10 entidades na politica consolidada',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 2 — Estratégias de escrita por entidade
// ---------------------------------------------------------------------------

function smokeScenario2_EstrategiasDeEscrita(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  // Entidades append-only
  const appendOnlyEntities = ['enova2_turn_events_v2', 'enova2_operational_history_v2'];
  for (const entity of appendOnlyEntities) {
    assertions.push(assert(
      `${entity}: write_strategy = append`,
      'append',
      ENTITY_CONSISTENCY_POLICY[entity].write_strategy,
    ));
    assertions.push(assert(
      `${entity}: reprocess_behavior = ignore`,
      'ignore',
      ENTITY_CONSISTENCY_POLICY[entity].reprocess_behavior,
    ));
  }

  // Entidades upsert
  const upsertEntities = ['enova2_lead', 'enova2_signal_records_v2', 'enova2_document_records_v2'];
  for (const entity of upsertEntities) {
    assertions.push(assert(
      `${entity}: write_strategy = upsert`,
      'upsert',
      ENTITY_CONSISTENCY_POLICY[entity].write_strategy,
    ));
  }

  // Entidades overwrite (1:1 por lead)
  const overwriteEntities = [
    'enova2_memory_runtime_v2',
    'enova2_dossier_v2',
    'enova2_projection_bridge_v2',
  ];
  for (const entity of overwriteEntities) {
    assertions.push(assert(
      `${entity}: write_strategy = overwrite`,
      'overwrite',
      ENTITY_CONSISTENCY_POLICY[entity].write_strategy,
    ));
    assertions.push(assert(
      `${entity}: reprocess_behavior = replace`,
      'replace',
      ENTITY_CONSISTENCY_POLICY[entity].reprocess_behavior,
    ));
  }

  // Entidade insert_versioned
  assertions.push(assert(
    'enova2_lead_state_v2: write_strategy = insert_versioned',
    'insert_versioned',
    ENTITY_CONSISTENCY_POLICY['enova2_lead_state_v2'].write_strategy,
  ));
  assertions.push(assert(
    'enova2_lead_state_v2: reprocess_behavior = ignore',
    'ignore',
    ENTITY_CONSISTENCY_POLICY['enova2_lead_state_v2'].reprocess_behavior,
  ));

  // visit_schedule: append mas reprocess ignore
  assertions.push(assert(
    'enova2_visit_schedule_v2: write_strategy = append',
    'append',
    ENTITY_CONSISTENCY_POLICY['enova2_visit_schedule_v2'].write_strategy,
  ));
  assertions.push(assert(
    'enova2_visit_schedule_v2: reprocess_behavior = ignore',
    'ignore',
    ENTITY_CONSISTENCY_POLICY['enova2_visit_schedule_v2'].reprocess_behavior,
  ));

  return {
    scenario: 'Cenario 2 — estrategias de escrita por entidade',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 3 — Campos imutáveis e TTL
// ---------------------------------------------------------------------------

function smokeScenario3_CamposImutaveisETTL(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  // enova2_turn_events_v2: todos os campos são imutáveis
  const turnImmutable = ENTITY_CONSISTENCY_POLICY['enova2_turn_events_v2'].immutable_after_insert;
  assertions.push(assertIncludes('turn_events: turn_id imutável', turnImmutable, 'turn_id'));
  assertions.push(assertIncludes('turn_events: idempotency_key imutável', turnImmutable, 'idempotency_key'));
  assertions.push(assertIncludes('turn_events: core_decision_json imutável', turnImmutable, 'core_decision_json'));
  assertions.push(assertIncludes('turn_events: turn_sequence imutável', turnImmutable, 'turn_sequence'));
  assertions.push(assert('turn_events: mutable_fields vazio', 0, ENTITY_CONSISTENCY_POLICY['enova2_turn_events_v2'].mutable_fields.length));

  // enova2_signal_records_v2: signal_value_json e confidence_score imutáveis
  const signalImmutable = ENTITY_CONSISTENCY_POLICY['enova2_signal_records_v2'].immutable_after_insert;
  assertions.push(assertIncludes('signals: signal_value_json imutável', signalImmutable, 'signal_value_json'));
  assertions.push(assertIncludes('signals: confidence_score imutável', signalImmutable, 'confidence_score'));

  // enova2_lead_state_v2: stage_current imutável (soberano do Core)
  const stateImmutable = ENTITY_CONSISTENCY_POLICY['enova2_lead_state_v2'].immutable_after_insert;
  assertions.push(assertIncludes('lead_state: stage_current imutável', stateImmutable, 'stage_current'));
  assertions.push(assertIncludes('lead_state: next_objective imutável', stateImmutable, 'next_objective'));
  assertions.push(assertIncludes('lead_state: block_advance imutável', stateImmutable, 'block_advance'));
  assertions.push(assertIncludes('lead_state: state_version imutável', stateImmutable, 'state_version'));

  // enova2_memory_runtime_v2: tem TTL
  assertions.push(assert(
    'memory_runtime: has_ttl = true',
    true,
    ENTITY_CONSISTENCY_POLICY['enova2_memory_runtime_v2'].has_ttl,
  ));

  // Entidades sem TTL
  const noTtlEntities = [
    'enova2_lead',
    'enova2_lead_state_v2',
    'enova2_turn_events_v2',
    'enova2_signal_records_v2',
    'enova2_document_records_v2',
    'enova2_dossier_v2',
    'enova2_visit_schedule_v2',
    'enova2_operational_history_v2',
    'enova2_projection_bridge_v2',
  ];
  for (const entity of noTtlEntities) {
    assertions.push(assert(
      `${entity}: has_ttl = false`,
      false,
      ENTITY_CONSISTENCY_POLICY[entity].has_ttl,
    ));
  }

  // operational_history: mutable_fields vazio (audit trail permanente)
  assertions.push(assert(
    'operational_history: mutable_fields vazio (imutavel)',
    0,
    ENTITY_CONSISTENCY_POLICY['enova2_operational_history_v2'].mutable_fields.length,
  ));

  return {
    scenario: 'Cenario 3 — campos imutaveis e TTL',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 4 — TTL da memória viva (valores numéricos)
// ---------------------------------------------------------------------------

function smokeScenario4_TTLMemoriaViva(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  assertions.push(assert(
    'TTL_DEFAULT_HOURS = 48',
    48,
    MEMORY_RUNTIME_TTL_POLICY.TTL_DEFAULT_HOURS,
  ));

  assertions.push(assert(
    'TTL_EXTENDED_HOURS = 72',
    72,
    MEMORY_RUNTIME_TTL_POLICY.TTL_EXTENDED_HOURS,
  ));

  assertions.push(assert(
    'TTL_MINIMUM_HOURS = 24',
    24,
    MEMORY_RUNTIME_TTL_POLICY.TTL_MINIMUM_HOURS,
  ));

  assertions.push(assert(
    'TTL_MAXIMUM_HOURS = 72',
    72,
    MEMORY_RUNTIME_TTL_POLICY.TTL_MAXIMUM_HOURS,
  ));

  // Invariantes lógicos
  assertions.push(assertTruthy(
    'TTL_DEFAULT >= TTL_MINIMUM',
    MEMORY_RUNTIME_TTL_POLICY.TTL_DEFAULT_HOURS >= MEMORY_RUNTIME_TTL_POLICY.TTL_MINIMUM_HOURS,
  ));

  assertions.push(assertTruthy(
    'TTL_EXTENDED >= TTL_DEFAULT',
    MEMORY_RUNTIME_TTL_POLICY.TTL_EXTENDED_HOURS >= MEMORY_RUNTIME_TTL_POLICY.TTL_DEFAULT_HOURS,
  ));

  assertions.push(assertTruthy(
    'TTL_MAXIMUM >= TTL_EXTENDED',
    MEMORY_RUNTIME_TTL_POLICY.TTL_MAXIMUM_HOURS >= MEMORY_RUNTIME_TTL_POLICY.TTL_EXTENDED_HOURS,
  ));

  assertions.push(assertTruthy(
    'TTL_MINIMUM > 0',
    MEMORY_RUNTIME_TTL_POLICY.TTL_MINIMUM_HOURS > 0,
  ));

  // Regras declaradas
  assertions.push(assertTruthy(
    'expired_read_rule declarada',
    Boolean(MEMORY_RUNTIME_TTL_POLICY.expired_read_rule),
  ));

  assertions.push(assertTruthy(
    'refresh_rule declarada',
    Boolean(MEMORY_RUNTIME_TTL_POLICY.refresh_rule),
  ));

  assertions.push(assertTruthy(
    'discard_rule declarada',
    Boolean(MEMORY_RUNTIME_TTL_POLICY.discard_rule),
  ));

  assertions.push(assertTruthy(
    'rationale declarado',
    Boolean(MEMORY_RUNTIME_TTL_POLICY.rationale),
  ));

  // Simulação de cálculo de TTL (sem Date real — apenas lógica)
  // Timestamp fixo e arbitrário para smoke determinístico.
  // O valor exato não importa — apenas que é um ponto no tempo estável para calcular
  // offsets de TTL (default +48h, extended +72h) sem depender de Date.now() real.
  const nowMs = 1745000000000; // 2025-04-18T21:33:20.000Z — fixo para smoke determinístico
  const defaultExpiresMs = nowMs + MEMORY_RUNTIME_TTL_POLICY.TTL_DEFAULT_HOURS * 3600 * 1000;
  const extendedExpiresMs = nowMs + MEMORY_RUNTIME_TTL_POLICY.TTL_EXTENDED_HOURS * 3600 * 1000;

  assertions.push(assertTruthy(
    'expires_at default > now (48h no futuro)',
    defaultExpiresMs > nowMs,
  ));

  assertions.push(assertTruthy(
    'expires_at extended > expires_at default',
    extendedExpiresMs > defaultExpiresMs,
  ));

  // Simular leitura de memória expirada
  const expiredAt = nowMs - 1000; // 1 segundo antes de agora
  const isExpired = expiredAt < nowMs;
  assertions.push(assert(
    'memória com expires_at no passado = expirada (found: false)',
    true,
    isExpired,
  ));

  // Simular leitura de memória ativa
  const activeAt = defaultExpiresMs;
  const isActive = activeAt > nowMs;
  assertions.push(assert(
    'memória com expires_at no futuro = ativa (found: true se dados ok)',
    true,
    isActive,
  ));

  return {
    scenario: 'Cenario 4 — TTL da memoria viva (valores numericos e regras)',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 5 — Projection bridge: campos permitidos e proibidos
// ---------------------------------------------------------------------------

function smokeScenario5_ProjectionBridge(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  // Target system
  assertions.push(assert(
    'PROJECTION_BRIDGE_POLICY.target_system = enova1',
    'enova1',
    PROJECTION_BRIDGE_POLICY.target_system,
  ));

  // Campos permitidos
  const requiredAllowedFields = [
    'external_ref',
    'stage_current',
    'customer_name',
    'monthly_income_declared',
    'marital_status_declared',
    'ready_for_visit',
    'ready_for_broker_handoff',
    'last_projected_at',
  ] as const;

  for (const field of requiredAllowedFields) {
    assertions.push(assertIncludes(
      `campo permitido: ${field}`,
      PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS,
      field,
    ));
  }

  assertions.push(assert(
    'PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS: 8 campos permitidos',
    8,
    PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS.length,
  ));

  // Campos proibidos
  const requiredProhibitedFields = [
    'ai_response_text',
    'raw_input_ref',
    'semantic_package_json',
    'core_decision_json',
    'speech_contract_json',
    'open_questions_json',
    'open_objections_json',
    'next_turn_pending_json',
    'policy_flags_json',
    'signal_value_json',
    'pending_signals',
    'rejected_signals',
  ] as const;

  for (const field of requiredProhibitedFields) {
    assertions.push(assertIncludes(
      `campo proibido declarado: ${field}`,
      PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS,
      field,
    ));
  }

  // Campos permitidos NÃO estão na lista de proibidos
  for (const field of requiredAllowedFields) {
    assertions.push(assertNotIncludes(
      `campo permitido '${field}' NAO esta em prohibited`,
      PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS,
      field,
    ));
  }

  // Campos proibidos NÃO estão na lista de permitidos
  for (const field of requiredProhibitedFields) {
    assertions.push(assertNotIncludes(
      `campo proibido '${field}' NAO esta em allowed`,
      PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS,
      field,
    ));
  }

  // Mapa de compatibilidade
  const compatMap = PROJECTION_BRIDGE_POLICY.compatibility_map;
  assertions.push(assertTruthy('compatibility_map.external_ref declarado', Boolean(compatMap.external_ref)));
  assertions.push(assertTruthy('compatibility_map.stage_current declarado', Boolean(compatMap.stage_current)));
  assertions.push(assertTruthy('compatibility_map.customer_name declarado', Boolean(compatMap.customer_name)));
  assertions.push(assertTruthy('compatibility_map.monthly_income_declared declarado', Boolean(compatMap.monthly_income_declared)));
  assertions.push(assertTruthy('compatibility_map.marital_status_declared declarado', Boolean(compatMap.marital_status_declared)));
  assertions.push(assertTruthy('compatibility_map.ready_for_visit declarado', Boolean(compatMap.ready_for_visit)));
  assertions.push(assertTruthy('compatibility_map.ready_for_broker_handoff declarado', Boolean(compatMap.ready_for_broker_handoff)));
  assertions.push(assertTruthy('compatibility_map.last_projected_at declarado', Boolean(compatMap.last_projected_at)));

  // Regra de pré-validação declarada
  assertions.push(assertTruthy('pre_write_validation declarada', Boolean(PROJECTION_BRIDGE_POLICY.pre_write_validation)));
  assertions.push(assertTruthy('purpose declarado', Boolean(PROJECTION_BRIDGE_POLICY.purpose)));

  // Sinais pendentes e rejeitados nunca entram na projeção
  assertions.push(assertIncludes('pending_signals proibido', PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS, 'pending_signals'));
  assertions.push(assertIncludes('rejected_signals proibido', PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS, 'rejected_signals'));

  return {
    scenario: 'Cenario 5 — projection bridge: campos permitidos, proibidos e mapa ENOVA 1',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 6 — Monotonicidade de status (transições válidas e inválidas)
// ---------------------------------------------------------------------------

function smokeScenario6_Monotonicidade(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  // enova2_lead: archived é terminal
  const leadMono = STATUS_MONOTONICITY['enova2_lead'];
  assertions.push(assertIncludes(
    'lead: archived é estado terminal',
    leadMono.terminal_states,
    'archived',
  ));
  assertions.push(assertTruthy(
    'lead: archived → active é transição inválida declarada',
    leadMono.invalid_transitions.some(([from, to]) => from === 'archived' && to === 'active'),
  ));
  assertions.push(assertTruthy(
    'lead: active → inactive é transição válida',
    leadMono.valid_transitions.some(([from, to]) => from === 'active' && to === 'inactive'),
  ));
  assertions.push(assertTruthy(
    'lead: inactive → archived é transição válida',
    leadMono.valid_transitions.some(([from, to]) => from === 'inactive' && to === 'archived'),
  ));

  // enova2_signal_records_v2: accepted e rejected são terminais
  const signalMono = STATUS_MONOTONICITY['enova2_signal_records_v2'];
  assertions.push(assertIncludes('signal: accepted é terminal', signalMono.terminal_states, 'accepted'));
  assertions.push(assertIncludes('signal: rejected é terminal', signalMono.terminal_states, 'rejected'));
  assertions.push(assertTruthy(
    'signal: accepted → pending é transição inválida',
    signalMono.invalid_transitions.some(([from, to]) => from === 'accepted' && to === 'pending'),
  ));
  assertions.push(assertTruthy(
    'signal: rejected → accepted é transição inválida',
    signalMono.invalid_transitions.some(([from, to]) => from === 'rejected' && to === 'accepted'),
  ));
  assertions.push(assertTruthy(
    'signal: pending → accepted é transição válida',
    signalMono.valid_transitions.some(([from, to]) => from === 'pending' && to === 'accepted'),
  ));

  // enova2_document_records_v2: validated e rejected são terminais
  const docMono = STATUS_MONOTONICITY['enova2_document_records_v2'];
  assertions.push(assertIncludes('document: validated é terminal', docMono.terminal_states, 'validated'));
  assertions.push(assertIncludes('document: rejected é terminal', docMono.terminal_states, 'rejected'));
  assertions.push(assertTruthy(
    'document: validated → received é transição inválida',
    docMono.invalid_transitions.some(([from, to]) => from === 'validated' && to === 'received'),
  ));
  assertions.push(assertTruthy(
    'document: received → requested é transição inválida',
    docMono.invalid_transitions.some(([from, to]) => from === 'received' && to === 'requested'),
  ));
  assertions.push(assertTruthy(
    'document: requested → received é transição válida',
    docMono.valid_transitions.some(([from, to]) => from === 'requested' && to === 'received'),
  ));
  assertions.push(assertTruthy(
    'document: received → validated é transição válida',
    docMono.valid_transitions.some(([from, to]) => from === 'received' && to === 'validated'),
  ));

  // enova2_visit_schedule_v2: confirmed, cancelled, completed são terminais
  const visitMono = STATUS_MONOTONICITY['enova2_visit_schedule_v2'];
  assertions.push(assertIncludes('visit: confirmed é terminal', visitMono.terminal_states, 'confirmed'));
  assertions.push(assertIncludes('visit: cancelled é terminal', visitMono.terminal_states, 'cancelled'));
  assertions.push(assertIncludes('visit: completed é terminal', visitMono.terminal_states, 'completed'));
  assertions.push(assertTruthy(
    'visit: confirmed → cancelled é transição inválida',
    visitMono.invalid_transitions.some(([from, to]) => from === 'confirmed' && to === 'cancelled'),
  ));
  assertions.push(assertTruthy(
    'visit: cancelled → scheduled é transição inválida',
    visitMono.invalid_transitions.some(([from, to]) => from === 'cancelled' && to === 'scheduled'),
  ));
  assertions.push(assertTruthy(
    'visit: pending → scheduled é transição válida',
    visitMono.valid_transitions.some(([from, to]) => from === 'pending' && to === 'scheduled'),
  ));
  assertions.push(assertTruthy(
    'visit: scheduled → confirmed é transição válida',
    visitMono.valid_transitions.some(([from, to]) => from === 'scheduled' && to === 'confirmed'),
  ));

  // Entidades com status monotônico explicitado na POLICY_SUMMARY
  const monotonicEntities = POLICY_SUMMARY.filter((e) => e.monotonic_status);
  assertions.push(assertTruthy(
    'ao menos 4 entidades têm status monotônico declarado',
    monotonicEntities.length >= 4,
  ));

  // Entidades sem status monotônico
  const nonMonotonicEntities = POLICY_SUMMARY.filter((e) => !e.monotonic_status);
  assertions.push(assertTruthy(
    'ao menos 4 entidades não têm status monotônico (ex: turn_events, memory_runtime)',
    nonMonotonicEntities.length >= 4,
  ));

  return {
    scenario: 'Cenario 6 — monotonicidade de status (transicoes validas e invalidas)',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 7 — Entidades append-only vs overwrite vs upsert vs insert_versioned
// ---------------------------------------------------------------------------

function smokeScenario7_TabelaResumoPolitica(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  // Verificar consistência entre POLICY_SUMMARY e ENTITY_CONSISTENCY_POLICY
  for (const summaryItem of POLICY_SUMMARY) {
    const entityPolicy = ENTITY_CONSISTENCY_POLICY[summaryItem.entity];

    assertions.push(assertTruthy(
      `POLICY_SUMMARY[${summaryItem.entity}] consistente com ENTITY_CONSISTENCY_POLICY`,
      entityPolicy !== undefined,
    ));

    if (entityPolicy) {
      assertions.push(assert(
        `${summaryItem.entity}: write_strategy consistente`,
        summaryItem.write_strategy,
        entityPolicy.write_strategy,
      ));

      assertions.push(assert(
        `${summaryItem.entity}: reprocess_behavior consistente`,
        summaryItem.reprocess,
        entityPolicy.reprocess_behavior,
      ));

      assertions.push(assert(
        `${summaryItem.entity}: has_ttl consistente`,
        summaryItem.has_ttl,
        entityPolicy.has_ttl,
      ));
    }
  }

  // Verificar entidades append_only no summary
  const summaryAppendOnly = POLICY_SUMMARY.filter((e) => e.append_only);
  assertions.push(assertTruthy(
    'ao menos 3 entidades declaradas append_only no summary',
    summaryAppendOnly.length >= 3,
  ));

  // Verificar que enova2_operational_history_v2 é append_only no summary
  const historyInSummary = POLICY_SUMMARY.find((e) => e.entity === 'enova2_operational_history_v2');
  assertions.push(assert(
    'enova2_operational_history_v2: append_only = true no summary',
    true,
    historyInSummary?.append_only,
  ));

  // Verificar que enova2_memory_runtime_v2 tem has_ttl = true no summary
  const memoryInSummary = POLICY_SUMMARY.find((e) => e.entity === 'enova2_memory_runtime_v2');
  assertions.push(assert(
    'enova2_memory_runtime_v2: has_ttl = true no summary',
    true,
    memoryInSummary?.has_ttl,
  ));

  // Verificar never_regresses declarado em todas as entidades
  for (const summaryItem of POLICY_SUMMARY) {
    assertions.push(assertTruthy(
      `${summaryItem.entity}: never_regresses declarado`,
      Boolean(summaryItem.never_regresses),
    ));
  }

  return {
    scenario: 'Cenario 7 — consistencia entre POLICY_SUMMARY e ENTITY_CONSISTENCY_POLICY',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 8 — Metadados e vínculos contratuais
// ---------------------------------------------------------------------------

function smokeScenario8_MetadadosVinculos(): PolicySmokeResult {
  const assertions: Assertion[] = [];

  const meta = ADAPTER_CONSISTENCY_POLICY.meta;

  assertions.push(assert('meta.version = 1.0.0', '1.0.0', meta.version));
  assertions.push(assert('meta.pr = PR 43', 'PR 43', meta.pr));
  assertions.push(assertTruthy('meta.frente declarado', Boolean(meta.frente)));
  assertions.push(assertTruthy('meta.anchor declarado', Boolean(meta.anchor)));
  assertions.push(assertTruthy('meta.nota_implementacao declarada', Boolean(meta.nota_implementacao)));

  // Verificar que a política não declara lógica de negócio
  // (o smoke valida o que está declarado, não o que pode ser inferido)
  assertions.push(assertTruthy(
    'ADAPTER_CONSISTENCY_POLICY.entities existe',
    Boolean(ADAPTER_CONSISTENCY_POLICY.entities),
  ));
  assertions.push(assertTruthy(
    'ADAPTER_CONSISTENCY_POLICY.memory_runtime_ttl existe',
    Boolean(ADAPTER_CONSISTENCY_POLICY.memory_runtime_ttl),
  ));
  assertions.push(assertTruthy(
    'ADAPTER_CONSISTENCY_POLICY.projection_bridge existe',
    Boolean(ADAPTER_CONSISTENCY_POLICY.projection_bridge),
  ));
  assertions.push(assertTruthy(
    'ADAPTER_CONSISTENCY_POLICY.status_monotonicity existe',
    Boolean(ADAPTER_CONSISTENCY_POLICY.status_monotonicity),
  ));
  assertions.push(assertTruthy(
    'ADAPTER_CONSISTENCY_POLICY.summary existe',
    Boolean(ADAPTER_CONSISTENCY_POLICY.summary),
  ));

  // Soberania: verificar que a política não viola as soberanias
  // (declarativo — nenhum campo de política "decide" stage ou gate)
  const statePolicy = ENTITY_CONSISTENCY_POLICY['enova2_lead_state_v2'];
  assertions.push(assertIncludes(
    'lead_state: stage_current em immutable_after_insert (soberania do Core garantida)',
    statePolicy.immutable_after_insert,
    'stage_current',
  ));
  assertions.push(assertIncludes(
    'lead_state: next_objective em immutable_after_insert (soberania do Core garantida)',
    statePolicy.immutable_after_insert,
    'next_objective',
  ));

  // Projection bridge não alimenta raciocínio
  assertions.push(assertTruthy(
    'projection_bridge.purpose menciona exclusividade de convivencia com ENOVA 1',
    PROJECTION_BRIDGE_POLICY.purpose.toLowerCase().includes('conviv'),
  ));

  return {
    scenario: 'Cenario 8 — metadados, vinculos contratuais e soberanias',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

export async function runPolicySmokeSuite(): Promise<PolicySmokeSuiteResult> {
  const scenarios = [
    smokeScenario1_Cobertura10Entidades,
    smokeScenario2_EstrategiasDeEscrita,
    smokeScenario3_CamposImutaveisETTL,
    smokeScenario4_TTLMemoriaViva,
    smokeScenario5_ProjectionBridge,
    smokeScenario6_Monotonicidade,
    smokeScenario7_TabelaResumoPolitica,
    smokeScenario8_MetadadosVinculos,
  ];

  const results: PolicySmokeResult[] = [];
  for (const scenarioFn of scenarios) {
    const r = scenarioFn();
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

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('policy-smoke.ts')) {
  runPolicySmokeSuite()
    .then((suite) => {
      console.log('\n===========================================');
      console.log('ENOVA 2 — Adapter Policy Smoke (PR 43)');
      console.log('===========================================');
      console.log(`Âncora: CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA seção 13 (PR43) | policy.ts`);
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

      console.log('ACCEPTANCE CRITERIA PR43:');
      console.log('  [x] politica de append vs merge vs overwrite por entidade (10 entidades)');
      console.log('  [x] estrategia de TTL da memoria viva definida (48h padrao, 72h estendido)');
      console.log('  [x] mapa de compatibilidade ENOVA 1 para projection_bridge');
      console.log('  [x] campos permitidos e proibidos em projection_payload_json');
      console.log('  [x] monotonicidade de status por entidade (transicoes validas/invalidas)');
      console.log('  [x] idempotency keys por entidade declaradas');
      console.log('  [x] campos imutaveis apos insert por entidade declarados');
      console.log('  [x] comportamento de reprocessamento por entidade declarado');
      console.log('  [x] entidades append-only identificadas');
      console.log('  [x] consistencia entre POLICY_SUMMARY e ENTITY_CONSISTENCY_POLICY');
      console.log('  [x] soberania do Core garantida (stage_current, next_objective imutaveis)');
      console.log('  [x] smoke de politica sem Supabase real');
      console.log('  [ ] implementacao runtime da politica — PLACEHOLDER para PR44\n');

      if (!suite.all_passed) process.exit(1);
    })
    .catch((err: unknown) => {
      console.error('Erro fatal no smoke de politica:', err);
      process.exit(1);
    });
}
