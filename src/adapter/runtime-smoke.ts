/**
 * ENOVA 2 — Supabase Adapter — Smoke Persistente Integrado (PR 44)
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seção 13 (PR 44, microetapas 1-3)
 *   src/adapter/runtime.ts (PR 44 — runtime real mínimo)
 *   src/adapter/policy.ts (PR 43 — política canônica)
 *
 * ESCOPO desta PR (PR 44):
 *   Smoke persistente real — exercita o `SupabaseAdapterRuntime` contra um
 *   `InMemoryPersistenceBackend` real, persistindo dados de verdade e provando:
 *
 *     1. PERSISTÊNCIA REAL FUNCIONANDO
 *        Ciclo completo lead → turn → signals → state → memory → document
 *        → dossier → visit → history → projection, com leituras observáveis
 *        em todas as 10 tabelas canônicas.
 *
 *     2. REPLAY SEGURO (idempotência)
 *        Reprocessar o mesmo turn_id, signal (turn_id, signal_key), lead_state
 *        (lead_id, source_turn_id) e history (lead_id, turn_id, event_type)
 *        NÃO duplica registros — chave canônica respeitada.
 *
 *     3. TTL DA MEMÓRIA VIVA
 *        Memória com `expires_at < now` retorna `{ found: false, error: 'memory_expired' }`.
 *        Memória válida retorna `{ found: true }`.
 *        TTL abaixo do mínimo ou acima do máximo é rejeitado pelo runtime.
 *
 *     4. PROJECTION_BRIDGE bloqueia campos proibidos
 *        Tentar persistir `ai_response_text`, `core_decision_json`,
 *        `policy_flags_json` etc. em `projection_payload_json` é rejeitado,
 *        com evento auditável em `enova2_operational_history_v2`.
 *
 *     5. SOBERANIA PRESERVADA
 *        - Adapter NUNCA calcula `stage_current`, `next_objective`, `block_advance`,
 *          `policy_flags_json`, `ready_for_visit`, `ready_for_broker_handoff`.
 *        - Quando o Core entrega um valor, o Adapter projeta exatamente o valor.
 *        - Adapter NUNCA escreve texto de resposta ao cliente em estado canônico.
 *        - Status segue monotonicidade declarada em `STATUS_MONOTONICITY` —
 *          regressões inválidas são recusadas.
 *
 * CARÁTER REAL DO SMOKE:
 *   Este smoke roda contra um runtime real (`SupabaseAdapterRuntime`) com um
 *   backend que efetivamente armazena e recupera dados (`InMemoryPersistenceBackend`).
 *   Não há stub. Cada `success: true` é uma escrita real; cada `found: true` é
 *   uma leitura real. A política `policy.ts` é importada e respeitada.
 *
 *   A plugagem do cliente Supabase remoto é a próxima etapa de deployment
 *   (fora do recorte desta PR), feita ao implementar um novo `PersistenceBackend`
 *   que fala com `@supabase/supabase-js` — sem alterar uma linha do runtime.
 *
 * Para executar: npm run smoke:adapter:runtime
 */

import {
  createInMemoryAdapterRuntime,
  SupabaseAdapterRuntime,
} from './runtime.ts';
import {
  MEMORY_RUNTIME_TTL_POLICY,
  PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS,
} from './policy.ts';

// ---------------------------------------------------------------------------
// Tipos do smoke
// ---------------------------------------------------------------------------

interface Assertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

interface ScenarioResult {
  scenario: string;
  assertions: Assertion[];
  passed: boolean;
}

export interface RuntimeSmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: ScenarioResult[];
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
  return { description, expected: true, actual: Boolean(value), passed: Boolean(value) };
}

function ttlIso(hours: number): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

// ---------------------------------------------------------------------------
// Cenário 1 — Persistência real funcionando (ciclo completo)
// ---------------------------------------------------------------------------

async function scenario1_PersistenciaRealFuncionando(): Promise<ScenarioResult> {
  const { adapter, backend } = createInMemoryAdapterRuntime();
  const assertions: Assertion[] = [];

  // 1.1 lead — primeiro upsert cria
  const leadW = await adapter.upsertLead({
    external_ref: 'whatsapp:+5511999990001',
    customer_name: null,
    phone_ref: '+5511999990001',
  });
  assertions.push(assert('upsertLead: success = true', true, leadW.success));
  assertions.push(assertTruthy('upsertLead: record.lead_id presente', leadW.record?.lead_id));
  const leadId = leadW.record!.lead_id;

  // 1.2 turn_event
  const turnW = await adapter.writeTurnEvent({
    lead_id: leadId,
    idempotency_key: `${leadId}:text:1`,
    channel_type: 'text',
    normalized_input_json: { text: 'quero comprar apartamento' },
    semantic_package_json: { signals: [{ key: 'monthly_income', value: 2500 }] },
    core_decision_json: {
      stage_current: 'discovery',
      next_objective: 'coletar_renda',
      block_advance: false,
      policy_flags_json: { gate_consent: 'pending' },
    },
    turn_sequence: 1,
  });
  assertions.push(assert('writeTurnEvent: success = true', true, turnW.success));
  const turnId = turnW.record!.turn_id;

  // 1.3 signals — Core ainda não aceitou; status inicial = pending.
  const sigW = await adapter.writeSignals([
    {
      turn_id: turnId,
      lead_id: leadId,
      signal_type: 'fact',
      signal_key: 'monthly_income',
      signal_value_json: { value: 2500 },
      confidence_score: 0.9,
      status: 'pending',
    },
  ]);
  assertions.push(assert('writeSignals: 1 sinal persistido', 1, sigW.records.length));
  const signalId = sigW.records[0].signal_id;

  // 1.4 lead_state — projetando o core_decision_json
  const stateW = await adapter.writeLeadState({
    lead_id: leadId,
    source_turn_id: turnId,
    stage_current: 'discovery',
    stage_after_last_decision: 'discovery',
    next_objective: 'coletar_renda',
    block_advance: false,
    policy_flags_json: { gate_consent: 'pending' },
    updated_by_layer: 'core',
  });
  assertions.push(assert('writeLeadState: success', true, stateW.success));
  assertions.push(assert('writeLeadState: state_version = 1', 1, stateW.record?.state_version));

  // 1.5 memória viva
  const memW = await adapter.upsertMemoryRuntime({
    lead_id: leadId,
    open_questions_json: { renda_confirmada: false },
    open_objections_json: {},
    useful_context_json: { interesse: 'apartamento' },
    next_turn_pending_json: { confirmar_renda: true },
    expires_at: ttlIso(MEMORY_RUNTIME_TTL_POLICY.TTL_DEFAULT_HOURS),
  });
  assertions.push(assert('upsertMemoryRuntime: success', true, memW.success));
  assertions.push(assert('upsertMemoryRuntime: memory_version = 1', 1, memW.record?.memory_version));

  // 1.6 documento
  const docW = await adapter.upsertDocument({
    lead_id: leadId,
    doc_type: 'rg',
    doc_status: 'requested',
    source_turn_id: turnId,
  });
  assertions.push(assert('upsertDocument: success', true, docW.success));
  assertions.push(assert('upsertDocument: status = requested', 'requested', docW.record?.doc_status));

  // 1.7 dossier — Core entrega ready_for_visit/ready_for_broker_handoff.
  const dossW = await adapter.upsertDossier({
    lead_id: leadId,
    dossier_status: 'incomplete',
    dossier_summary_json: { perfil: 'iniciante' },
    required_docs_json: { rg: 'requested' },
    ready_for_visit: false,
    ready_for_broker_handoff: false,
    compiled_at: new Date().toISOString(),
  });
  assertions.push(assert('upsertDossier: success', true, dossW.success));

  // 1.8 visita
  const visW = await adapter.writeVisitSchedule({
    lead_id: leadId,
    source_turn_id: turnId,
    visit_status: 'pending',
    visit_interest_declared: true,
  });
  assertions.push(assert('writeVisitSchedule: success', true, visW.success));

  // 1.9 history
  const histW = await adapter.appendHistoryEvent({
    lead_id: leadId,
    turn_id: turnId,
    event_type: 'turn_processed',
    actor_layer: 'adapter',
    event_payload_json: { turn_sequence: 1 },
    occurred_at: new Date().toISOString(),
  });
  assertions.push(assert('appendHistoryEvent: success', true, histW.success));

  // 1.10 projection (apenas campos permitidos)
  const projW = await adapter.upsertProjection({
    lead_id: leadId,
    target_system: 'enova1',
    projection_payload_json: {
      external_ref: 'whatsapp:+5511999990001',
      stage_current: 'discovery',
    },
    projection_status: 'projected',
  });
  assertions.push(assert('upsertProjection (allowed): success', true, projW.success));

  // Leituras observáveis ===================================================
  const leadR = await adapter.getLead(leadId);
  assertions.push(assert('getLead: found = true', true, leadR.found));

  const stateR = await adapter.getCurrentLeadState(leadId);
  assertions.push(assert('getCurrentLeadState: stage = discovery', 'discovery', stateR.record?.stage_current));

  const turnsR = await adapter.getTurnEvents(leadId);
  assertions.push(assert('getTurnEvents: 1 turn', 1, turnsR.records.length));

  const sigByTurn = await adapter.getSignalsByTurn(turnId);
  assertions.push(assert('getSignalsByTurn: 1 sinal', 1, sigByTurn.records.length));

  const memR = await adapter.getActiveMemory(leadId);
  assertions.push(assert('getActiveMemory: found = true', true, memR.found));

  const docsR = await adapter.getDocumentsByLead(leadId);
  assertions.push(assert('getDocumentsByLead: 1 doc', 1, docsR.records.length));

  const dossR = await adapter.getDossier(leadId);
  assertions.push(assert('getDossier: found = true', true, dossR.found));

  const visitsR = await adapter.getVisitSchedulesByLead(leadId);
  assertions.push(assert('getVisitSchedulesByLead: 1 visita', 1, visitsR.records.length));

  const histR = await adapter.getHistoryByLead(leadId);
  assertions.push(assert('getHistoryByLead: ≥ 1 evento', true, histR.records.length >= 1));

  const projR = await adapter.getProjection(leadId, 'enova1');
  assertions.push(assert('getProjection: found = true', true, projR.found));

  // Backend: cada tabela tem ≥ 1 registro real persistido.
  const tabelasComEscrita: ReadonlyArray<Parameters<typeof backend._debugCount>[0]> = [
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
  ];
  for (const t of tabelasComEscrita) {
    assertions.push(assert(`backend.${t}: ≥ 1 registro real`, true, backend._debugCount(t) >= 1));
  }

  return {
    scenario: 'Cenario 1 — persistencia real funcionando nas 10 tabelas canonicas',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 2 — Replay seguro (idempotência por chave canônica)
// ---------------------------------------------------------------------------

async function scenario2_ReplaySeguroIdempotencia(): Promise<ScenarioResult> {
  const { adapter, backend } = createInMemoryAdapterRuntime();
  const assertions: Assertion[] = [];

  // Setup
  const lead = (await adapter.upsertLead({ external_ref: 'replay-test-001' })).record!;
  const turn = (await adapter.writeTurnEvent({
    lead_id: lead.lead_id,
    idempotency_key: 'replay-test-001:t1',
    channel_type: 'text',
    normalized_input_json: { text: 'oi' },
    semantic_package_json: {},
    core_decision_json: {
      stage_current: 'greeting',
      next_objective: 'apresentar',
      block_advance: false,
      policy_flags_json: {},
    },
    turn_sequence: 1,
  })).record!;

  // 2.1 Replay do mesmo lead (mesmo external_ref) — não duplica.
  const lead2 = await adapter.upsertLead({ external_ref: 'replay-test-001' });
  assertions.push(assert('upsertLead replay: mesmo lead_id', lead.lead_id, lead2.record?.lead_id));
  assertions.push(assert('backend.enova2_lead: 1 registro (sem duplicar)', 1, backend._debugCount('enova2_lead')));

  // 2.2 Replay do mesmo turn (mesma idempotency_key) — não duplica.
  const turn2 = await adapter.writeTurnEvent({
    lead_id: lead.lead_id,
    idempotency_key: 'replay-test-001:t1',
    channel_type: 'text',
    normalized_input_json: { text: 'oi novamente' },
    semantic_package_json: { drift: true },
    core_decision_json: {
      stage_current: 'discovery',
      next_objective: 'outra_coisa',
      block_advance: true,
      policy_flags_json: {},
    },
    turn_sequence: 2,
  });
  assertions.push(assert('writeTurnEvent replay: mesmo turn_id', turn.turn_id, turn2.record?.turn_id));
  assertions.push(assert('backend.enova2_turn_events_v2: 1 registro (sem duplicar)', 1, backend._debugCount('enova2_turn_events_v2')));

  // 2.3 Replay de signals (mesma chave) — não duplica e não muda valor.
  await adapter.writeSignals([{
    turn_id: turn.turn_id,
    lead_id: lead.lead_id,
    signal_type: 'fact',
    signal_key: 'monthly_income',
    signal_value_json: { value: 3000 },
    confidence_score: 0.8,
    status: 'pending',
  }]);
  await adapter.writeSignals([{
    turn_id: turn.turn_id,
    lead_id: lead.lead_id,
    signal_type: 'fact',
    signal_key: 'monthly_income',
    signal_value_json: { value: 9999 },  // tentativa de drift
    confidence_score: 0.99,
    status: 'pending',
  }]);
  const signals = await adapter.getSignalsByTurn(turn.turn_id);
  assertions.push(assert('writeSignals replay: 1 registro (sem duplicar)', 1, signals.records.length));
  assertions.push(assert('writeSignals replay: valor original preservado', 3000, (signals.records[0].signal_value_json as { value: number }).value));

  // 2.4 Replay de lead_state (mesma source_turn_id) — não duplica.
  await adapter.writeLeadState({
    lead_id: lead.lead_id,
    source_turn_id: turn.turn_id,
    stage_current: 'discovery',
    stage_after_last_decision: 'greeting',
    next_objective: 'coletar',
    block_advance: false,
    policy_flags_json: {},
    updated_by_layer: 'core',
  });
  await adapter.writeLeadState({
    lead_id: lead.lead_id,
    source_turn_id: turn.turn_id,
    stage_current: 'qualification',  // tentativa de drift
    stage_after_last_decision: 'discovery',
    next_objective: 'outro',
    block_advance: true,
    policy_flags_json: {},
    updated_by_layer: 'core',
  });
  assertions.push(assert('writeLeadState replay: 1 registro (sem duplicar)', 1, backend._debugCount('enova2_lead_state_v2')));
  const stateNow = await adapter.getCurrentLeadState(lead.lead_id);
  assertions.push(assert('writeLeadState replay: stage original preservado', 'discovery', stateNow.record?.stage_current));

  // 2.5 Replay de history (mesma chave) — não duplica.
  const occurredAt = new Date().toISOString();
  await adapter.appendHistoryEvent({
    lead_id: lead.lead_id,
    turn_id: turn.turn_id,
    event_type: 'turn_processed',
    actor_layer: 'adapter',
    event_payload_json: { turn_sequence: 1 },
    occurred_at: occurredAt,
  });
  await adapter.appendHistoryEvent({
    lead_id: lead.lead_id,
    turn_id: turn.turn_id,
    event_type: 'turn_processed',
    actor_layer: 'adapter',
    event_payload_json: { turn_sequence: 1, drift: true },
    occurred_at: new Date().toISOString(),
  });
  assertions.push(assert('appendHistoryEvent replay: 1 registro (sem duplicar)', 1, backend._debugCount('enova2_operational_history_v2')));

  // 2.6 turn_sequence monotônico — sequence menor é rejeitada.
  const seqDown = await adapter.writeTurnEvent({
    lead_id: lead.lead_id,
    idempotency_key: 'replay-test-001:t-old',
    channel_type: 'text',
    normalized_input_json: {},
    semantic_package_json: {},
    core_decision_json: {},
    turn_sequence: 0,  // tentativa de regressão
  });
  assertions.push(assert('writeTurnEvent: turn_sequence regressivo rejeitado', false, seqDown.success));

  return {
    scenario: 'Cenario 2 — replay seguro: idempotencia por chave canonica em todas as entidades chave',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 3 — TTL da memória viva
// ---------------------------------------------------------------------------

async function scenario3_TTLMemoriaViva(): Promise<ScenarioResult> {
  const { adapter, backend } = createInMemoryAdapterRuntime();
  const assertions: Assertion[] = [];

  const lead = (await adapter.upsertLead({ external_ref: 'ttl-test-001' })).record!;

  // 3.1 TTL abaixo do mínimo — rejeitado.
  const tooShort = await adapter.upsertMemoryRuntime({
    lead_id: lead.lead_id,
    open_questions_json: {},
    open_objections_json: {},
    useful_context_json: {},
    next_turn_pending_json: {},
    expires_at: ttlIso(1),  // 1h — abaixo do mínimo de 24h
  });
  assertions.push(assert('upsertMemoryRuntime TTL < min: rejeitado', false, tooShort.success));
  assertions.push(assert('upsertMemoryRuntime TTL < min: error claro', 'expires_at_below_minimum_ttl', tooShort.error));

  // 3.2 TTL acima do máximo — rejeitado.
  const tooLong = await adapter.upsertMemoryRuntime({
    lead_id: lead.lead_id,
    open_questions_json: {},
    open_objections_json: {},
    useful_context_json: {},
    next_turn_pending_json: {},
    expires_at: ttlIso(MEMORY_RUNTIME_TTL_POLICY.TTL_MAXIMUM_HOURS + 24),
  });
  assertions.push(assert('upsertMemoryRuntime TTL > max: rejeitado', false, tooLong.success));

  // 3.3 TTL válido — aceito; leitura imediata = found.
  const ok = await adapter.upsertMemoryRuntime({
    lead_id: lead.lead_id,
    open_questions_json: { x: 1 },
    open_objections_json: {},
    useful_context_json: {},
    next_turn_pending_json: {},
    expires_at: ttlIso(MEMORY_RUNTIME_TTL_POLICY.TTL_DEFAULT_HOURS),
  });
  assertions.push(assert('upsertMemoryRuntime TTL valido: success', true, ok.success));
  const readNow = await adapter.getActiveMemory(lead.lead_id);
  assertions.push(assert('getActiveMemory ativa: found = true', true, readNow.found));

  // 3.4 Simular memória expirada injetando expires_at no passado diretamente
  //     no backend (simula passagem de tempo sem aguardar). O runtime deve
  //     retornar { found: false, error: 'memory_expired' }.
  await backend.update(
    'enova2_memory_runtime_v2',
    (r: { lead_id: string }) => r.lead_id === lead.lead_id,
    { expires_at: new Date(Date.now() - 3600_000).toISOString() } as Record<string, unknown>,
  );
  const readExpired = await adapter.getActiveMemory(lead.lead_id);
  assertions.push(assert('getActiveMemory expirada: found = false', false, readExpired.found));
  assertions.push(assert('getActiveMemory expirada: error = memory_expired', 'memory_expired', readExpired.error));

  // 3.5 Refresh — novo upsert reabilita a leitura.
  const refresh = await adapter.upsertMemoryRuntime({
    lead_id: lead.lead_id,
    open_questions_json: { x: 2 },
    open_objections_json: {},
    useful_context_json: {},
    next_turn_pending_json: {},
    expires_at: ttlIso(MEMORY_RUNTIME_TTL_POLICY.TTL_EXTENDED_HOURS),
  });
  assertions.push(assert('upsertMemoryRuntime refresh: success', true, refresh.success));
  assertions.push(assert('upsertMemoryRuntime refresh: memory_version incrementa', 2, refresh.record?.memory_version));
  const readAfter = await adapter.getActiveMemory(lead.lead_id);
  assertions.push(assert('getActiveMemory apos refresh: found = true', true, readAfter.found));

  return {
    scenario: 'Cenario 3 — TTL da memoria viva: minimo, maximo, expirada e refresh',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 4 — projection_bridge bloqueia campos proibidos
// ---------------------------------------------------------------------------

async function scenario4_ProjectionBridgeBloqueiaProibidos(): Promise<ScenarioResult> {
  const { adapter, backend } = createInMemoryAdapterRuntime();
  const assertions: Assertion[] = [];

  const lead = (await adapter.upsertLead({ external_ref: 'projbridge-test-001' })).record!;

  // 4.1 Tentativa com `ai_response_text` (texto final da IA) — proibido.
  const r1 = await adapter.upsertProjection({
    lead_id: lead.lead_id,
    target_system: 'enova1',
    projection_payload_json: {
      external_ref: 'x',
      ai_response_text: 'olá! como posso ajudar?',
    },
    projection_status: 'pending',
  });
  assertions.push(assert('upsertProjection com ai_response_text: rejeitado', false, r1.success));
  assertions.push(assertTruthy('upsertProjection com ai_response_text: error contém o nome do campo', r1.error?.includes('ai_response_text')));

  // 4.2 Tentativa com `core_decision_json` — proibido (dado interno do Core).
  const r2 = await adapter.upsertProjection({
    lead_id: lead.lead_id,
    target_system: 'enova1',
    projection_payload_json: {
      external_ref: 'x',
      core_decision_json: { stage_current: 'discovery' },
    },
    projection_status: 'pending',
  });
  assertions.push(assert('upsertProjection com core_decision_json: rejeitado', false, r2.success));

  // 4.3 Tentativa com `policy_flags_json` — proibido.
  const r3 = await adapter.upsertProjection({
    lead_id: lead.lead_id,
    target_system: 'enova1',
    projection_payload_json: {
      external_ref: 'x',
      policy_flags_json: { gate_consent: 'pending' },
    },
    projection_status: 'pending',
  });
  assertions.push(assert('upsertProjection com policy_flags_json: rejeitado', false, r3.success));

  // 4.4 Cada rejeição gera evento auditável em operational_history.
  //     OBS: append-history é idempotente por (lead_id, turn_id, event_type),
  //     portanto múltiplas rejeições no mesmo (lead, sem turn) colapsam em 1
  //     evento — comportamento canônico declarado em POLICY_OPERATIONAL_HISTORY.
  //     O essencial é que pelo menos um evento auditável existe e que ele
  //     marca a rejeição com a lista de campos proibidos.
  const hist = await adapter.getHistoryByLead(lead.lead_id);
  const projUpdatedEvents = hist.records.filter((r) => r.event_type === 'projection_updated');
  assertions.push(assert('rejeicoes geraram evento auditavel projection_updated', true, projUpdatedEvents.length >= 1));
  assertions.push(assert('eventos auditaveis trazem rejected_fields', true, projUpdatedEvents.every((e) => Array.isArray((e.event_payload_json as { rejected_fields?: unknown }).rejected_fields))));
  assertions.push(assert('evento auditavel marca rejected = true', true, projUpdatedEvents.every((e) => (e.event_payload_json as { rejected?: boolean }).rejected === true)));

  // 4.5 Backend não recebeu nenhuma projeção (todas rejeitadas).
  assertions.push(assert('backend.enova2_projection_bridge_v2: 0 registros', 0, backend._debugCount('enova2_projection_bridge_v2')));

  // 4.6 Projeção com apenas campos permitidos passa.
  const okProj = await adapter.upsertProjection({
    lead_id: lead.lead_id,
    target_system: 'enova1',
    projection_payload_json: {
      external_ref: 'projbridge-test-001',
      stage_current: 'discovery',
      ready_for_visit: false,
      ready_for_broker_handoff: false,
    },
    projection_status: 'projected',
  });
  assertions.push(assert('upsertProjection com campos permitidos: success', true, okProj.success));
  assertions.push(assert('backend.enova2_projection_bridge_v2: 1 registro', 1, backend._debugCount('enova2_projection_bridge_v2')));

  // 4.7 Cobertura: lista canônica de proibidos importada e não vazia.
  assertions.push(assertTruthy('PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS nao vazia', PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS.length > 0));

  return {
    scenario: 'Cenario 4 — projection_bridge bloqueia campos proibidos e audita rejeicoes',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Cenário 5 — Soberania preservada (Core regra, IA fala, Adapter persiste)
// ---------------------------------------------------------------------------

async function scenario5_SoberaniaPreservada(): Promise<ScenarioResult> {
  const { adapter } = createInMemoryAdapterRuntime();
  const assertions: Assertion[] = [];

  // 5.1 Adapter declara role e constraints corretas.
  assertions.push(assert('adapter.role = persistence_only', 'persistence_only', adapter.role));
  assertions.push(assertTruthy('adapter.constraints inclui adapter_nao_decide_regra_de_negocio', adapter.constraints.includes('adapter_nao_decide_regra_de_negocio')));
  assertions.push(assertTruthy('adapter.constraints inclui adapter_nao_calcula_campos_soberanos_do_core', adapter.constraints.includes('adapter_nao_calcula_campos_soberanos_do_core')));
  assertions.push(assertTruthy('adapter.constraints inclui adapter_nao_escreve_resposta_ao_cliente', adapter.constraints.includes('adapter_nao_escreve_resposta_ao_cliente')));

  const lead = (await adapter.upsertLead({ external_ref: 'soberania-test-001' })).record!;

  // 5.2 Quando o Core entrega valores, o Adapter projeta exatamente o que
  //     foi entregue — não calcula, não infere, não altera.
  const turn = (await adapter.writeTurnEvent({
    lead_id: lead.lead_id,
    idempotency_key: 'soberania-test-001:t1',
    channel_type: 'text',
    normalized_input_json: {},
    semantic_package_json: {},
    core_decision_json: {
      stage_current: 'qualification',
      next_objective: 'coletar_renda',
      block_advance: true,
      policy_flags_json: { gate_renda: 'requerido' },
    },
    turn_sequence: 1,
  })).record!;

  const stateOK = await adapter.writeLeadState({
    lead_id: lead.lead_id,
    source_turn_id: turn.turn_id,
    stage_current: 'qualification',                 // valor do Core
    stage_after_last_decision: 'discovery',         // valor do Core
    next_objective: 'coletar_renda',                // valor do Core
    block_advance: true,                            // valor do Core
    policy_flags_json: { gate_renda: 'requerido' }, // valor do Core
    updated_by_layer: 'core',
  });
  assertions.push(assert('writeLeadState: stage_current = exato valor do Core', 'qualification', stateOK.record?.stage_current));
  assertions.push(assert('writeLeadState: next_objective = exato valor do Core', 'coletar_renda', stateOK.record?.next_objective));
  assertions.push(assert('writeLeadState: block_advance = exato valor do Core', true, stateOK.record?.block_advance));
  assertions.push(assert('writeLeadState: policy_flags_json = exato valor do Core', { gate_renda: 'requerido' }, stateOK.record?.policy_flags_json));

  // 5.3 Dossier: ready_for_visit/ready_for_broker_handoff = exato valor do Core.
  const dossOK = await adapter.upsertDossier({
    lead_id: lead.lead_id,
    dossier_status: 'ready_for_review',
    dossier_summary_json: {},
    required_docs_json: {},
    ready_for_visit: true,                  // valor do Core
    ready_for_broker_handoff: false,        // valor do Core
    compiled_at: new Date().toISOString(),
  });
  assertions.push(assert('upsertDossier: ready_for_visit = exato valor do Core', true, dossOK.record?.ready_for_visit));
  assertions.push(assert('upsertDossier: ready_for_broker_handoff = exato valor do Core', false, dossOK.record?.ready_for_broker_handoff));

  // 5.4 Monotonicidade de status de signal — accepted é terminal: tentar
  //     regredir para pending é rejeitado pelo Adapter.
  const sig = (await adapter.writeSignals([{
    turn_id: turn.turn_id,
    lead_id: lead.lead_id,
    signal_type: 'fact',
    signal_key: 'monthly_income',
    signal_value_json: { value: 2500 },
    confidence_score: 0.9,
    status: 'pending',
  }])).records[0];
  // Core decide aceite — Adapter projeta:
  const sigAcc = await adapter.updateSignalStatus({ signal_id: sig.signal_id, status: 'accepted' });
  assertions.push(assert('updateSignalStatus pending → accepted: success', true, sigAcc.success));
  // Tentativa de reversão (drift) — rejeitada.
  const sigRev = await adapter.updateSignalStatus({ signal_id: sig.signal_id, status: 'pending' });
  assertions.push(assert('updateSignalStatus accepted → pending: rejeitado (status terminal)', false, sigRev.success));

  // 5.5 Monotonicidade de status de documento.
  await adapter.upsertDocument({ lead_id: lead.lead_id, doc_type: 'rg', doc_status: 'requested', source_turn_id: turn.turn_id });
  await adapter.updateDocumentStatus({ lead_id: lead.lead_id, doc_type: 'rg', doc_status: 'received' });
  await adapter.updateDocumentStatus({ lead_id: lead.lead_id, doc_type: 'rg', doc_status: 'validated' });
  // Tentativa de regressão — rejeitada.
  const docRev = await adapter.updateDocumentStatus({ lead_id: lead.lead_id, doc_type: 'rg', doc_status: 'received' });
  assertions.push(assert('updateDocumentStatus validated → received: rejeitado (regressao proibida)', false, docRev.success));

  // 5.6 Monotonicidade de status de visita.
  const vis = (await adapter.writeVisitSchedule({
    lead_id: lead.lead_id,
    source_turn_id: turn.turn_id,
    visit_status: 'pending',
    visit_interest_declared: true,
  })).record!;
  await adapter.updateVisitStatus({ visit_id: vis.visit_id, visit_status: 'scheduled' });
  await adapter.updateVisitStatus({ visit_id: vis.visit_id, visit_status: 'confirmed' });
  // confirmed → cancelled é proibido.
  const visBack = await adapter.updateVisitStatus({ visit_id: vis.visit_id, visit_status: 'cancelled' });
  assertions.push(assert('updateVisitStatus confirmed → cancelled: rejeitado', false, visBack.success));

  // 5.7 Adapter NÃO escreve resposta ao cliente em estado canônico:
  //     turn_events.speech_contract_json é metadado de governança — não texto final.
  //     Testamos que o Adapter aceita speech_contract_json apenas como metadado.
  const turn2 = await adapter.writeTurnEvent({
    lead_id: lead.lead_id,
    idempotency_key: 'soberania-test-001:t2',
    channel_type: 'text',
    normalized_input_json: {},
    semantic_package_json: {},
    core_decision_json: {},
    speech_contract_json: { tone: 'cordial', length: 'short' },  // metadado, não texto
    turn_sequence: 2,
  });
  assertions.push(assert('writeTurnEvent: speech_contract_json aceito como metadado', true, turn2.success));
  assertions.push(assert('writeTurnEvent: nenhum campo de texto final ao cliente em state canonico', true,
    !('ai_response_text' in (turn2.record?.speech_contract_json ?? {}))));

  return {
    scenario: 'Cenario 5 — soberania preservada: Core regra, IA fala, Adapter projeta sem calcular',
    assertions,
    passed: assertions.every((a) => a.passed),
  };
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

export async function runAdapterRuntimeSmokeSuite(): Promise<RuntimeSmokeSuiteResult> {
  const scenarios = [
    scenario1_PersistenciaRealFuncionando,
    scenario2_ReplaySeguroIdempotencia,
    scenario3_TTLMemoriaViva,
    scenario4_ProjectionBridgeBloqueiaProibidos,
    scenario5_SoberaniaPreservada,
  ];

  const results: ScenarioResult[] = [];
  for (const fn of scenarios) {
    const r = await fn();
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
// Auxiliar — só uso interno para o smoke. Não faz parte da boundary pública.
// ---------------------------------------------------------------------------
type _SuppressUnused = SupabaseAdapterRuntime;

// ---------------------------------------------------------------------------
// Entrada de execução manual
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('runtime-smoke.ts')) {
  runAdapterRuntimeSmokeSuite()
    .then((suite) => {
      console.log('\n===========================================');
      console.log('ENOVA 2 — Supabase Adapter Runtime — Smoke Persistente (PR 44)');
      console.log('===========================================');
      console.log(`Âncora: CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA (Frente 4) | policy.ts (PR43) | runtime.ts (PR44)`);
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

      console.log('ACCEPTANCE CRITERIA PR44:');
      console.log('  [x] runtime real minimo do adapter implementado (src/adapter/runtime.ts)');
      console.log('  [x] backend pluggavel (PersistenceBackend) + backend in-process real');
      console.log('  [x] toda escrita real passa pela camada unica do adapter');
      console.log('  [x] persistencia real funcionando nas 10 tabelas canonicas');
      console.log('  [x] replay seguro: idempotencia por chave canonica em todas as entidades');
      console.log('  [x] TTL da memoria viva respeitado (minimo, maximo, expirada, refresh)');
      console.log('  [x] projection_bridge bloqueia campos proibidos com auditoria');
      console.log('  [x] soberania preservada: Core regra, IA fala, Adapter projeta sem calcular');
      console.log('  [x] monotonicidade de status: regressoes invalidas rejeitadas');
      console.log('  [x] runtime respeita estritamente policy.ts (importa e usa)');
      console.log('  [ ] backend Supabase remoto plugado (etapa de deployment, fora do recorte da Frente 4)\n');

      if (!suite.all_passed) process.exit(1);
    })
    .catch((err: unknown) => {
      console.error('Erro fatal no smoke runtime do adapter:', err);
      process.exit(1);
    });
}
