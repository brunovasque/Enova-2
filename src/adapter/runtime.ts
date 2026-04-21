/**
 * ENOVA 2 — Supabase Adapter — Runtime Real Mínimo (PR 44)
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seção 13 (PR 44, microetapas 1-3)
 *   src/adapter/policy.ts (PR 43 — política canônica de consistência)
 *   src/adapter/types.ts (PR 42 — interface ISupabaseAdapter)
 *   src/adapter/boundaries.ts (PR 42 — ownership de layers)
 *   FRENTE4_PERSISTABLE_DATA_CONTRACT.md (PR 41 — shape autoritativo)
 *
 * ESCOPO DESTA PR (PR 44):
 *   Implementação runtime real e mínima do Supabase Adapter que respeita
 *   estritamente `policy.ts`. Substitui os stubs de PR 42 por lógica de
 *   persistência canônica — idempotente, monotônica e auditável.
 *
 * O QUE FOI IMPLEMENTADO DE RUNTIME REAL NESTA PR:
 *   - Backend abstrato de persistência (`PersistenceBackend`) — única porta
 *     técnica de leitura/escrita; toda escrita real passa por ele.
 *   - Backend in-process funcional (`InMemoryPersistenceBackend`) — armazena
 *     registros em Maps por tabela, persistente durante a vida do processo.
 *   - `SupabaseAdapterRuntime` implementando `ISupabaseAdapter` com:
 *       • upsert / append / insert_versioned / overwrite por entidade
 *         (estritamente conforme `ENTITY_CONSISTENCY_POLICY`)
 *       • idempotência por chave canônica de cada entidade
 *       • TTL da memória viva (`MEMORY_RUNTIME_TTL_POLICY`)
 *         — leitura expirada → { found: false, error: 'memory_expired' }
 *       • monotonicidade de status (`STATUS_MONOTONICITY`)
 *         — transições inválidas rejeitadas
 *       • projection_bridge: rejeição de campos proibidos
 *         (`PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS`)
 *       • projeção de campos soberanos do Core (nunca calculados pelo Adapter)
 *
 * O QUE AINDA NÃO FOI IMPLEMENTADO (FORA DO RECORTE DESTA PR):
 *   - Backend Supabase real conectado a `@supabase/supabase-js`
 *     (requer credenciais, env vars e migration SQL — fica para a etapa de
 *     deployment/rollout futura; ver `Próximo passo autorizado` no handoff).
 *     O `PersistenceBackend` é a porta de plugagem desse cliente.
 *   - Migration SQL real das tabelas `enova2_*`.
 *   - Hooks de telemetria (Frente 7 — fora do recorte).
 *
 * TABELAS / OPERAÇÕES JÁ COBERTAS PELO RUNTIME REAL:
 *   1.  enova2_lead                    — upsertLead, updateLead, getLead
 *   2.  enova2_lead_state_v2           — writeLeadState, getCurrentLeadState
 *   3.  enova2_turn_events_v2          — writeTurnEvent, getTurnEvents, getTurnEvent
 *   4.  enova2_signal_records_v2       — writeSignals, updateSignalStatus,
 *                                        getSignalsByLead, getSignalsByTurn
 *   5.  enova2_memory_runtime_v2       — upsertMemoryRuntime, getActiveMemory (com TTL)
 *   6.  enova2_document_records_v2     — upsertDocument, updateDocumentStatus,
 *                                        getDocumentsByLead
 *   7.  enova2_dossier_v2              — upsertDossier, getDossier
 *   8.  enova2_visit_schedule_v2       — writeVisitSchedule, updateVisitStatus,
 *                                        getVisitSchedulesByLead
 *   9.  enova2_operational_history_v2  — appendHistoryEvent, getHistoryByLead
 *   10. enova2_projection_bridge_v2    — upsertProjection (com pre_write_validation),
 *                                        getProjection
 *
 * RESTRIÇÕES INVIOLÁVEIS PRESERVADAS:
 *   - Adapter não escreve resposta ao cliente.
 *   - Adapter não decide regra de negócio, gate ou stage.
 *   - Adapter não calcula campos soberanos do Core (apenas projeta).
 *   - Speech/Context/LLM não têm acesso direto ao backend.
 *   - Toda escrita real passa pelo Adapter (boundary única).
 */

import {
  ADAPTER_CANONICAL_CONSTRAINTS,
  ADAPTER_ROLE,
  ADAPTER_WRITE_OWNERSHIP,
  CORE_SOVEREIGN_FIELDS,
} from './boundaries.ts';

import {
  MEMORY_RUNTIME_TTL_POLICY,
  PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS,
  STATUS_MONOTONICITY,
} from './policy.ts';

import type {
  AdapterDocumentRecord,
  AdapterDocumentStatusUpdateInput,
  AdapterDocumentWriteInput,
  AdapterDossierRecord,
  AdapterDossierWriteInput,
  AdapterLeadRecord,
  AdapterLeadStateRecord,
  AdapterLeadStateWriteInput,
  AdapterLeadUpdateInput,
  AdapterLeadWriteInput,
  AdapterListResult,
  AdapterMemoryRuntimeRecord,
  AdapterMemoryRuntimeWriteInput,
  AdapterOperationalHistoryAppendInput,
  AdapterOperationalHistoryRecord,
  AdapterProjectionBridgeRecord,
  AdapterProjectionBridgeWriteInput,
  AdapterReadResult,
  AdapterSignalRecord,
  AdapterSignalStatusUpdateInput,
  AdapterSignalWriteInput,
  AdapterTurnEventRecord,
  AdapterTurnEventWriteInput,
  AdapterVisitScheduleRecord,
  AdapterVisitScheduleWriteInput,
  AdapterVisitStatusUpdateInput,
  AdapterWriteResult,
  ISupabaseAdapter,
  ProjectionTargetSystem,
  SignalStatus,
} from './types.ts';

// ---------------------------------------------------------------------------
// Tabelas canônicas suportadas pelo backend de persistência
// ---------------------------------------------------------------------------

export type CanonicalTable =
  | 'enova2_lead'
  | 'enova2_lead_state_v2'
  | 'enova2_turn_events_v2'
  | 'enova2_signal_records_v2'
  | 'enova2_memory_runtime_v2'
  | 'enova2_document_records_v2'
  | 'enova2_dossier_v2'
  | 'enova2_visit_schedule_v2'
  | 'enova2_operational_history_v2'
  | 'enova2_projection_bridge_v2';

// ---------------------------------------------------------------------------
// Backend abstrato de persistência
// ---------------------------------------------------------------------------

/**
 * Porta técnica única de leitura/escrita das tabelas `enova2_*`.
 *
 * O runtime do Adapter delega aqui — sem nunca falar com banco diretamente.
 * Esta abstração permite que `InMemoryPersistenceBackend` (in-process, real)
 * seja trocado por um backend Supabase de verdade no futuro, sem alterar
 * uma única linha do runtime. Plugagem do cliente Supabase real é o próximo
 * passo de deployment, fora do recorte desta PR.
 */
export interface PersistenceBackend {
  /** Insere um registro novo. Não checa duplicidade — chamada de runtime. */
  insert<T>(table: CanonicalTable, row: T): Promise<T>;

  /** Substitui um registro existente identificado por uma chave única. */
  update<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
    patch: Partial<T>,
  ): Promise<T | null>;

  /** Encontra o primeiro registro que satisfaz um predicado. */
  findOne<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
  ): Promise<T | null>;

  /** Lista todos os registros que satisfazem um predicado. */
  findMany<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
  ): Promise<T[]>;

  /** Remove registros que satisfazem um predicado. Retorna a contagem. */
  remove<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
  ): Promise<number>;
}

// ---------------------------------------------------------------------------
// Backend in-process — implementação real e funcional para PR 44
// ---------------------------------------------------------------------------

/**
 * Backend in-process — armazena registros em `Map<table, row[]>`.
 *
 * Este backend é REAL: cada chamada de runtime persiste e lê de volta dados
 * verdadeiros, mantidos durante a vida do processo. É o que permite o smoke
 * persistente desta PR rodar sem credenciais externas, provando o contrato
 * em ambiente fechado e reprodutível.
 *
 * Não é um stub: as 10 tabelas têm armazenamento real, com inserções e
 * leituras observáveis. Idempotência, monotonicidade, TTL e validação de
 * projeção são impostos pelo runtime — não pelo backend.
 */
export class InMemoryPersistenceBackend implements PersistenceBackend {
  private readonly store: Map<CanonicalTable, unknown[]> = new Map();

  constructor() {
    const tables: CanonicalTable[] = [
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
    for (const t of tables) this.store.set(t, []);
  }

  async insert<T>(table: CanonicalTable, row: T): Promise<T> {
    const arr = this.store.get(table) as T[];
    arr.push(row);
    return row;
  }

  async update<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
    patch: Partial<T>,
  ): Promise<T | null> {
    const arr = this.store.get(table) as T[];
    const idx = arr.findIndex(matcher);
    if (idx < 0) return null;
    arr[idx] = { ...arr[idx], ...patch };
    return arr[idx];
  }

  async findOne<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
  ): Promise<T | null> {
    const arr = this.store.get(table) as T[];
    return arr.find(matcher) ?? null;
  }

  async findMany<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
  ): Promise<T[]> {
    const arr = this.store.get(table) as T[];
    return arr.filter(matcher);
  }

  async remove<T>(
    table: CanonicalTable,
    matcher: (row: T) => boolean,
  ): Promise<number> {
    const arr = this.store.get(table) as T[];
    let removed = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (matcher(arr[i])) {
        arr.splice(i, 1);
        removed++;
      }
    }
    return removed;
  }

  /** Helper interno (apenas para inspeção em testes/smoke). Não é parte da boundary. */
  _debugCount(table: CanonicalTable): number {
    return (this.store.get(table) ?? []).length;
  }
}

// ---------------------------------------------------------------------------
// Helpers internos do runtime
// ---------------------------------------------------------------------------

/** Geração de UUID v4 simples — suficiente para runtime interno. */
function uuid(): string {
  // Implementação determinística-aleatória sem depender de crypto global.
  const rnd = (n: number) =>
    Math.floor(Math.random() * 16 ** n)
      .toString(16)
      .padStart(n, '0');
  return `${rnd(8)}-${rnd(4)}-4${rnd(3)}-${((Math.floor(Math.random() * 4) + 8).toString(16))}${rnd(3)}-${rnd(12)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Tolerância de 1s usada na validação do limite máximo de TTL para absorver
 * a deriva entre o cálculo do `expires_at` no chamador e a checagem aqui.
 */
const TTL_VALIDATION_TOLERANCE_MS = 1000;

function ok<T>(record: T): AdapterWriteResult<T> {
  return { success: true, record, error: null };
}

function fail<T>(error: string): AdapterWriteResult<T> {
  return { success: false, record: null, error };
}

function found<T>(record: T): AdapterReadResult<T> {
  return { found: true, record, error: null };
}

function notFound<T>(error: string | null = null): AdapterReadResult<T> {
  return { found: false, record: null, error };
}

function listOk<T>(records: T[]): AdapterListResult<T> {
  return { records, error: null };
}

/**
 * Verifica se uma transição de status é válida segundo `STATUS_MONOTONICITY`.
 * Retorna `true` para transição válida, `false` para inválida/ignorável.
 * Se a entidade não está no mapa, considera válido (sem monotonicidade).
 */
function isValidStatusTransition(
  entity: keyof typeof STATUS_MONOTONICITY,
  from: string,
  to: string,
): boolean {
  if (from === to) return true;
  const policy = STATUS_MONOTONICITY[entity];
  if (!policy) return true;
  // Transição inválida explícita?
  for (const [a, b] of policy.invalid_transitions as readonly (readonly [string, string])[]) {
    if (a === from && b === to) return false;
  }
  // Transição válida explícita?
  for (const [a, b] of policy.valid_transitions as readonly (readonly [string, string])[]) {
    if (a === from && b === to) return true;
  }
  // Não declarada — recusar para entidades 'strict'; aceitar para outras.
  return policy.monotonicity !== 'strict';
}

// ---------------------------------------------------------------------------
// SupabaseAdapterRuntime — implementação real mínima da PR 44
// ---------------------------------------------------------------------------

/**
 * Implementação runtime real do `ISupabaseAdapter`.
 *
 * Toda a lógica de write/read passa por `PersistenceBackend`. O runtime
 * apenas faz cumprir a política declarada em `policy.ts` — sem decidir
 * regra de negócio, sem calcular campos soberanos do Core e sem escrever
 * resposta ao cliente.
 */
export class SupabaseAdapterRuntime implements ISupabaseAdapter {
  /** Papel canônico — somente persistência. */
  readonly role = ADAPTER_ROLE.sovereign_scope;

  /** Constraints canônicas declaradas explicitamente em cada instância. */
  readonly constraints = ADAPTER_CANONICAL_CONSTRAINTS;

  /** Campos soberanos do Core — projetados, nunca calculados. */
  readonly coreSovereignFields = CORE_SOVEREIGN_FIELDS;

  /** Mapa de ownership de escrita por entidade. */
  readonly writeOwnership = ADAPTER_WRITE_OWNERSHIP;

  constructor(private readonly backend: PersistenceBackend) {}

  // -------------------------------------------------------------------------
  // 1. enova2_lead — upsert por external_ref (idempotente)
  // -------------------------------------------------------------------------

  async upsertLead(
    input: AdapterLeadWriteInput,
  ): Promise<AdapterWriteResult<AdapterLeadRecord>> {
    if (input.external_ref) {
      const existing = await this.backend.findOne<AdapterLeadRecord>(
        'enova2_lead',
        (r) => r.external_ref === input.external_ref,
      );
      if (existing) {
        // POLICY_LEAD.reprocess_behavior = 'ignore' — retorna existente sem alterar.
        return ok(existing);
      }
    }
    const ts = nowIso();
    const row: AdapterLeadRecord = {
      lead_id: uuid(),
      external_ref: input.external_ref ?? null,
      customer_name: input.customer_name ?? null,
      phone_ref: input.phone_ref ?? null,
      status: input.status ?? 'active',
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterLeadRecord>('enova2_lead', row);
    return ok(row);
  }

  async updateLead(
    input: AdapterLeadUpdateInput,
  ): Promise<AdapterWriteResult<AdapterLeadRecord>> {
    const existing = await this.backend.findOne<AdapterLeadRecord>(
      'enova2_lead',
      (r) => r.lead_id === input.lead_id,
    );
    if (!existing) return fail('lead_not_found');
    // Monotonicidade de status (lead).
    if (input.status && !isValidStatusTransition('enova2_lead', existing.status, input.status)) {
      return fail(
        `invalid_status_transition: ${existing.status} -> ${input.status} (enova2_lead)`,
      );
    }
    const patch: Partial<AdapterLeadRecord> = {
      customer_name: input.customer_name ?? existing.customer_name,
      phone_ref: input.phone_ref ?? existing.phone_ref,
      status: input.status ?? existing.status,
      updated_at: nowIso(),
    };
    const updated = await this.backend.update<AdapterLeadRecord>(
      'enova2_lead',
      (r) => r.lead_id === input.lead_id,
      patch,
    );
    return updated ? ok(updated) : fail('lead_update_failed');
  }

  async getLead(lead_id: string): Promise<AdapterReadResult<AdapterLeadRecord>> {
    const row = await this.backend.findOne<AdapterLeadRecord>(
      'enova2_lead',
      (r) => r.lead_id === lead_id,
    );
    return row ? found(row) : notFound();
  }

  // -------------------------------------------------------------------------
  // 2. enova2_lead_state_v2 — insert_versioned, idempotente por (lead_id, source_turn_id)
  // -------------------------------------------------------------------------

  async writeLeadState(
    input: AdapterLeadStateWriteInput,
  ): Promise<AdapterWriteResult<AdapterLeadStateRecord>> {
    // Idempotência: se já existe state para este (lead_id, source_turn_id), ignora.
    const dup = await this.backend.findOne<AdapterLeadStateRecord>(
      'enova2_lead_state_v2',
      (r) => r.lead_id === input.lead_id && r.source_turn_id === input.source_turn_id,
    );
    if (dup) return ok(dup);

    // state_version = max + 1 do mesmo lead — monotônico.
    const states = await this.backend.findMany<AdapterLeadStateRecord>(
      'enova2_lead_state_v2',
      (r) => r.lead_id === input.lead_id,
    );
    const maxVersion = states.reduce((m, r) => (r.state_version > m ? r.state_version : m), 0);

    const ts = nowIso();
    const row: AdapterLeadStateRecord = {
      lead_state_id: uuid(),
      lead_id: input.lead_id,
      // SOBERANIA: campos abaixo vêm do Core. Adapter projeta — não calcula.
      stage_current: input.stage_current,
      stage_after_last_decision: input.stage_after_last_decision,
      next_objective: input.next_objective,
      block_advance: input.block_advance,
      policy_flags_json: input.policy_flags_json,
      risk_flags_json: input.risk_flags_json ?? null,
      state_version: maxVersion + 1,
      source_turn_id: input.source_turn_id,
      updated_by_layer: input.updated_by_layer,
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterLeadStateRecord>('enova2_lead_state_v2', row);
    return ok(row);
  }

  async getCurrentLeadState(
    lead_id: string,
  ): Promise<AdapterReadResult<AdapterLeadStateRecord>> {
    const states = await this.backend.findMany<AdapterLeadStateRecord>(
      'enova2_lead_state_v2',
      (r) => r.lead_id === lead_id,
    );
    if (states.length === 0) return notFound();
    const latest = states.reduce((acc, r) => (r.state_version > acc.state_version ? r : acc));
    return found(latest);
  }

  // -------------------------------------------------------------------------
  // 3. enova2_turn_events_v2 — append-only, idempotente por idempotency_key
  // -------------------------------------------------------------------------

  async writeTurnEvent(
    input: AdapterTurnEventWriteInput,
  ): Promise<AdapterWriteResult<AdapterTurnEventRecord>> {
    const existing = await this.backend.findOne<AdapterTurnEventRecord>(
      'enova2_turn_events_v2',
      (r) => r.idempotency_key === input.idempotency_key,
    );
    if (existing) return ok(existing);

    // turn_sequence: deve ser sempre crescente para o mesmo lead.
    const turns = await this.backend.findMany<AdapterTurnEventRecord>(
      'enova2_turn_events_v2',
      (r) => r.lead_id === input.lead_id,
    );
    const maxSeq = turns.reduce((m, r) => (r.turn_sequence > m ? r.turn_sequence : m), 0);
    if (input.turn_sequence <= maxSeq) {
      return fail(`invalid_turn_sequence: ${input.turn_sequence} <= ${maxSeq}`);
    }

    const row: AdapterTurnEventRecord = {
      turn_id: uuid(),
      lead_id: input.lead_id,
      idempotency_key: input.idempotency_key,
      channel_type: input.channel_type,
      raw_input_ref: input.raw_input_ref ?? null,
      normalized_input_json: input.normalized_input_json,
      semantic_package_json: input.semantic_package_json,
      core_decision_json: input.core_decision_json,
      speech_contract_json: input.speech_contract_json ?? null,
      turn_sequence: input.turn_sequence,
      created_at: nowIso(),
    };
    await this.backend.insert<AdapterTurnEventRecord>('enova2_turn_events_v2', row);
    return ok(row);
  }

  async getTurnEvents(
    lead_id: string,
  ): Promise<AdapterListResult<AdapterTurnEventRecord>> {
    const rows = await this.backend.findMany<AdapterTurnEventRecord>(
      'enova2_turn_events_v2',
      (r) => r.lead_id === lead_id,
    );
    return listOk([...rows].sort((a, b) => a.turn_sequence - b.turn_sequence));
  }

  async getTurnEvent(
    turn_id: string,
  ): Promise<AdapterReadResult<AdapterTurnEventRecord>> {
    const row = await this.backend.findOne<AdapterTurnEventRecord>(
      'enova2_turn_events_v2',
      (r) => r.turn_id === turn_id,
    );
    return row ? found(row) : notFound();
  }

  // -------------------------------------------------------------------------
  // 4. enova2_signal_records_v2 — upsert por (turn_id, signal_key)
  // -------------------------------------------------------------------------

  async writeSignals(
    inputs: AdapterSignalWriteInput[],
  ): Promise<AdapterListResult<AdapterSignalRecord>> {
    const out: AdapterSignalRecord[] = [];
    for (const input of inputs) {
      const existing = await this.backend.findOne<AdapterSignalRecord>(
        'enova2_signal_records_v2',
        (r) => r.turn_id === input.turn_id && r.signal_key === input.signal_key,
      );
      if (existing) {
        // POLICY_SIGNALS.reprocess_behavior = 'ignore' — valor é imutável.
        out.push(existing);
        continue;
      }
      const row: AdapterSignalRecord = {
        signal_id: uuid(),
        turn_id: input.turn_id,
        lead_id: input.lead_id,
        signal_type: input.signal_type,
        signal_key: input.signal_key,
        signal_value_json: input.signal_value_json,
        confidence_score: input.confidence_score,
        status: input.status,
        evidence_ref: input.evidence_ref ?? null,
        confirmed_at: input.status === 'accepted' ? nowIso() : null,
        rejected_at: input.status === 'rejected' ? nowIso() : null,
        created_at: nowIso(),
      };
      await this.backend.insert<AdapterSignalRecord>('enova2_signal_records_v2', row);
      out.push(row);
    }
    return listOk(out);
  }

  async updateSignalStatus(
    input: AdapterSignalStatusUpdateInput,
  ): Promise<AdapterWriteResult<AdapterSignalRecord>> {
    const existing = await this.backend.findOne<AdapterSignalRecord>(
      'enova2_signal_records_v2',
      (r) => r.signal_id === input.signal_id,
    );
    if (!existing) return fail('signal_not_found');
    if (
      !isValidStatusTransition(
        'enova2_signal_records_v2',
        existing.status,
        input.status,
      )
    ) {
      return fail(
        `invalid_status_transition: ${existing.status} -> ${input.status} (enova2_signal_records_v2)`,
      );
    }
    const patch: Partial<AdapterSignalRecord> = {
      status: input.status,
      confirmed_at:
        input.confirmed_at ??
        (input.status === 'accepted' ? nowIso() : existing.confirmed_at),
      rejected_at:
        input.rejected_at ??
        (input.status === 'rejected' ? nowIso() : existing.rejected_at),
    };
    const updated = await this.backend.update<AdapterSignalRecord>(
      'enova2_signal_records_v2',
      (r) => r.signal_id === input.signal_id,
      patch,
    );
    return updated ? ok(updated) : fail('signal_update_failed');
  }

  async getSignalsByLead(
    lead_id: string,
    status?: SignalStatus,
  ): Promise<AdapterListResult<AdapterSignalRecord>> {
    const rows = await this.backend.findMany<AdapterSignalRecord>(
      'enova2_signal_records_v2',
      (r) => r.lead_id === lead_id && (status === undefined || r.status === status),
    );
    return listOk(rows);
  }

  async getSignalsByTurn(
    turn_id: string,
  ): Promise<AdapterListResult<AdapterSignalRecord>> {
    const rows = await this.backend.findMany<AdapterSignalRecord>(
      'enova2_signal_records_v2',
      (r) => r.turn_id === turn_id,
    );
    return listOk(rows);
  }

  // -------------------------------------------------------------------------
  // 5. enova2_memory_runtime_v2 — overwrite com TTL
  // -------------------------------------------------------------------------

  async upsertMemoryRuntime(
    input: AdapterMemoryRuntimeWriteInput,
  ): Promise<AdapterWriteResult<AdapterMemoryRuntimeRecord>> {
    // Validação de TTL: expires_at não pode estar abaixo do mínimo nem acima do máximo.
    const expiresMs = new Date(input.expires_at).getTime();
    const nowMs = Date.now();
    const minMs = nowMs + MEMORY_RUNTIME_TTL_POLICY.TTL_MINIMUM_HOURS * 3600_000;
    const maxMs = nowMs + MEMORY_RUNTIME_TTL_POLICY.TTL_MAXIMUM_HOURS * 3600_000;
    if (Number.isNaN(expiresMs)) return fail('invalid_expires_at');
    if (expiresMs < minMs) return fail('expires_at_below_minimum_ttl');
    if (expiresMs > maxMs + TTL_VALIDATION_TOLERANCE_MS) return fail('expires_at_exceeds_maximum_ttl');

    const existing = await this.backend.findOne<AdapterMemoryRuntimeRecord>(
      'enova2_memory_runtime_v2',
      (r) => r.lead_id === input.lead_id,
    );
    const ts = nowIso();
    if (existing) {
      const patch: Partial<AdapterMemoryRuntimeRecord> = {
        memory_version: existing.memory_version + 1,
        open_questions_json: input.open_questions_json,
        open_objections_json: input.open_objections_json,
        useful_context_json: input.useful_context_json,
        next_turn_pending_json: input.next_turn_pending_json,
        conversation_constraints_json: input.conversation_constraints_json ?? null,
        expires_at: input.expires_at,
        updated_at: ts,
      };
      const updated = await this.backend.update<AdapterMemoryRuntimeRecord>(
        'enova2_memory_runtime_v2',
        (r) => r.lead_id === input.lead_id,
        patch,
      );
      return updated ? ok(updated) : fail('memory_update_failed');
    }
    const row: AdapterMemoryRuntimeRecord = {
      memory_id: uuid(),
      lead_id: input.lead_id,
      memory_version: 1,
      open_questions_json: input.open_questions_json,
      open_objections_json: input.open_objections_json,
      useful_context_json: input.useful_context_json,
      next_turn_pending_json: input.next_turn_pending_json,
      conversation_constraints_json: input.conversation_constraints_json ?? null,
      expires_at: input.expires_at,
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterMemoryRuntimeRecord>('enova2_memory_runtime_v2', row);
    return ok(row);
  }

  async getActiveMemory(
    lead_id: string,
  ): Promise<AdapterReadResult<AdapterMemoryRuntimeRecord>> {
    const row = await this.backend.findOne<AdapterMemoryRuntimeRecord>(
      'enova2_memory_runtime_v2',
      (r) => r.lead_id === lead_id,
    );
    if (!row) return notFound();
    // TTL: dado expirado não deve ser retornado como válido.
    const expiresMs = new Date(row.expires_at).getTime();
    if (Number.isFinite(expiresMs) && expiresMs < Date.now()) {
      return notFound('memory_expired');
    }
    return found(row);
  }

  // -------------------------------------------------------------------------
  // 6. enova2_document_records_v2 — upsert por (lead_id, doc_type), monotônico
  // -------------------------------------------------------------------------

  async upsertDocument(
    input: AdapterDocumentWriteInput,
  ): Promise<AdapterWriteResult<AdapterDocumentRecord>> {
    const existing = await this.backend.findOne<AdapterDocumentRecord>(
      'enova2_document_records_v2',
      (r) => r.lead_id === input.lead_id && r.doc_type === input.doc_type,
    );
    if (existing) {
      if (
        !isValidStatusTransition(
          'enova2_document_records_v2',
          existing.doc_status,
          input.doc_status,
        )
      ) {
        return fail(
          `invalid_status_transition: ${existing.doc_status} -> ${input.doc_status} (enova2_document_records_v2)`,
        );
      }
      const patch: Partial<AdapterDocumentRecord> = {
        doc_status: input.doc_status,
        storage_ref: input.storage_ref ?? existing.storage_ref,
        validation_notes_json:
          input.validation_notes_json ?? existing.validation_notes_json,
        source_turn_id: input.source_turn_id,
        requested_at: input.requested_at ?? existing.requested_at,
        received_at: input.received_at ?? existing.received_at,
        validated_at: input.validated_at ?? existing.validated_at,
        updated_at: nowIso(),
      };
      const updated = await this.backend.update<AdapterDocumentRecord>(
        'enova2_document_records_v2',
        (r) => r.lead_id === input.lead_id && r.doc_type === input.doc_type,
        patch,
      );
      return updated ? ok(updated) : fail('document_update_failed');
    }
    const ts = nowIso();
    const row: AdapterDocumentRecord = {
      document_id: uuid(),
      lead_id: input.lead_id,
      doc_type: input.doc_type,
      doc_status: input.doc_status,
      storage_ref: input.storage_ref ?? null,
      validation_notes_json: input.validation_notes_json ?? null,
      source_turn_id: input.source_turn_id,
      requested_at: input.requested_at ?? (input.doc_status === 'requested' ? ts : null),
      received_at: input.received_at ?? (input.doc_status === 'received' ? ts : null),
      validated_at: input.validated_at ?? (input.doc_status === 'validated' ? ts : null),
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterDocumentRecord>('enova2_document_records_v2', row);
    return ok(row);
  }

  async updateDocumentStatus(
    input: AdapterDocumentStatusUpdateInput,
  ): Promise<AdapterWriteResult<AdapterDocumentRecord>> {
    const existing = await this.backend.findOne<AdapterDocumentRecord>(
      'enova2_document_records_v2',
      (r) => r.lead_id === input.lead_id && r.doc_type === input.doc_type,
    );
    if (!existing) return fail('document_not_found');
    if (
      !isValidStatusTransition(
        'enova2_document_records_v2',
        existing.doc_status,
        input.doc_status,
      )
    ) {
      return fail(
        `invalid_status_transition: ${existing.doc_status} -> ${input.doc_status} (enova2_document_records_v2)`,
      );
    }
    const patch: Partial<AdapterDocumentRecord> = {
      doc_status: input.doc_status,
      storage_ref: input.storage_ref ?? existing.storage_ref,
      validation_notes_json:
        input.validation_notes_json ?? existing.validation_notes_json,
      received_at: input.received_at ?? existing.received_at,
      validated_at: input.validated_at ?? existing.validated_at,
      updated_at: nowIso(),
    };
    const updated = await this.backend.update<AdapterDocumentRecord>(
      'enova2_document_records_v2',
      (r) => r.lead_id === input.lead_id && r.doc_type === input.doc_type,
      patch,
    );
    return updated ? ok(updated) : fail('document_update_failed');
  }

  async getDocumentsByLead(
    lead_id: string,
  ): Promise<AdapterListResult<AdapterDocumentRecord>> {
    const rows = await this.backend.findMany<AdapterDocumentRecord>(
      'enova2_document_records_v2',
      (r) => r.lead_id === lead_id,
    );
    return listOk(rows);
  }

  // -------------------------------------------------------------------------
  // 7. enova2_dossier_v2 — overwrite por lead_id (1:1)
  // -------------------------------------------------------------------------

  async upsertDossier(
    input: AdapterDossierWriteInput,
  ): Promise<AdapterWriteResult<AdapterDossierRecord>> {
    const existing = await this.backend.findOne<AdapterDossierRecord>(
      'enova2_dossier_v2',
      (r) => r.lead_id === input.lead_id,
    );
    const ts = nowIso();
    if (existing) {
      const patch: Partial<AdapterDossierRecord> = {
        dossier_status: input.dossier_status,
        dossier_summary_json: input.dossier_summary_json,
        required_docs_json: input.required_docs_json,
        // SOBERANIA: ready_for_visit / ready_for_broker_handoff vêm do Core.
        ready_for_visit: input.ready_for_visit,
        ready_for_broker_handoff: input.ready_for_broker_handoff,
        compiled_at: input.compiled_at,
        updated_at: ts,
      };
      const updated = await this.backend.update<AdapterDossierRecord>(
        'enova2_dossier_v2',
        (r) => r.lead_id === input.lead_id,
        patch,
      );
      return updated ? ok(updated) : fail('dossier_update_failed');
    }
    const row: AdapterDossierRecord = {
      dossier_id: uuid(),
      lead_id: input.lead_id,
      dossier_status: input.dossier_status,
      dossier_summary_json: input.dossier_summary_json,
      required_docs_json: input.required_docs_json,
      ready_for_visit: input.ready_for_visit,
      ready_for_broker_handoff: input.ready_for_broker_handoff,
      compiled_at: input.compiled_at,
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterDossierRecord>('enova2_dossier_v2', row);
    return ok(row);
  }

  async getDossier(
    lead_id: string,
  ): Promise<AdapterReadResult<AdapterDossierRecord>> {
    const row = await this.backend.findOne<AdapterDossierRecord>(
      'enova2_dossier_v2',
      (r) => r.lead_id === lead_id,
    );
    return row ? found(row) : notFound();
  }

  // -------------------------------------------------------------------------
  // 8. enova2_visit_schedule_v2 — append + monotônico
  // -------------------------------------------------------------------------

  async writeVisitSchedule(
    input: AdapterVisitScheduleWriteInput,
  ): Promise<AdapterWriteResult<AdapterVisitScheduleRecord>> {
    // Idempotência: (lead_id, source_turn_id).
    const existing = await this.backend.findOne<AdapterVisitScheduleRecord>(
      'enova2_visit_schedule_v2',
      (r) => r.lead_id === input.lead_id && r.source_turn_id === input.source_turn_id,
    );
    if (existing) return ok(existing);

    const ts = nowIso();
    const row: AdapterVisitScheduleRecord = {
      visit_id: uuid(),
      lead_id: input.lead_id,
      source_turn_id: input.source_turn_id,
      visit_status: input.visit_status,
      visit_interest_declared: input.visit_interest_declared,
      scheduled_at: input.scheduled_at ?? null,
      location_ref: input.location_ref ?? null,
      confirmation_notes_json: input.confirmation_notes_json ?? null,
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterVisitScheduleRecord>('enova2_visit_schedule_v2', row);
    return ok(row);
  }

  async updateVisitStatus(
    input: AdapterVisitStatusUpdateInput,
  ): Promise<AdapterWriteResult<AdapterVisitScheduleRecord>> {
    const existing = await this.backend.findOne<AdapterVisitScheduleRecord>(
      'enova2_visit_schedule_v2',
      (r) => r.visit_id === input.visit_id,
    );
    if (!existing) return fail('visit_not_found');
    if (
      !isValidStatusTransition(
        'enova2_visit_schedule_v2',
        existing.visit_status,
        input.visit_status,
      )
    ) {
      return fail(
        `invalid_status_transition: ${existing.visit_status} -> ${input.visit_status} (enova2_visit_schedule_v2)`,
      );
    }
    const patch: Partial<AdapterVisitScheduleRecord> = {
      visit_status: input.visit_status,
      scheduled_at: input.scheduled_at ?? existing.scheduled_at,
      location_ref: input.location_ref ?? existing.location_ref,
      confirmation_notes_json:
        input.confirmation_notes_json ?? existing.confirmation_notes_json,
      updated_at: nowIso(),
    };
    const updated = await this.backend.update<AdapterVisitScheduleRecord>(
      'enova2_visit_schedule_v2',
      (r) => r.visit_id === input.visit_id,
      patch,
    );
    return updated ? ok(updated) : fail('visit_update_failed');
  }

  async getVisitSchedulesByLead(
    lead_id: string,
  ): Promise<AdapterListResult<AdapterVisitScheduleRecord>> {
    const rows = await this.backend.findMany<AdapterVisitScheduleRecord>(
      'enova2_visit_schedule_v2',
      (r) => r.lead_id === lead_id,
    );
    return listOk(rows);
  }

  // -------------------------------------------------------------------------
  // 9. enova2_operational_history_v2 — append-only, idempotente por (lead_id, turn_id, event_type)
  // -------------------------------------------------------------------------

  async appendHistoryEvent(
    input: AdapterOperationalHistoryAppendInput,
  ): Promise<AdapterWriteResult<AdapterOperationalHistoryRecord>> {
    const existing = await this.backend.findOne<AdapterOperationalHistoryRecord>(
      'enova2_operational_history_v2',
      (r) =>
        r.lead_id === input.lead_id &&
        r.turn_id === (input.turn_id ?? null) &&
        r.event_type === input.event_type,
    );
    if (existing) return ok(existing);

    const row: AdapterOperationalHistoryRecord = {
      history_id: uuid(),
      lead_id: input.lead_id,
      turn_id: input.turn_id ?? null,
      event_type: input.event_type,
      actor_layer: input.actor_layer,
      event_payload_json: input.event_payload_json,
      occurred_at: input.occurred_at,
      created_at: nowIso(),
    };
    await this.backend.insert<AdapterOperationalHistoryRecord>(
      'enova2_operational_history_v2',
      row,
    );
    return ok(row);
  }

  async getHistoryByLead(
    lead_id: string,
  ): Promise<AdapterListResult<AdapterOperationalHistoryRecord>> {
    const rows = await this.backend.findMany<AdapterOperationalHistoryRecord>(
      'enova2_operational_history_v2',
      (r) => r.lead_id === lead_id,
    );
    return listOk(
      [...rows].sort(
        (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // 10. enova2_projection_bridge_v2 — overwrite por (lead_id, target_system)
  //     com pre_write_validation contra campos proibidos
  // -------------------------------------------------------------------------

  async upsertProjection(
    input: AdapterProjectionBridgeWriteInput,
  ): Promise<AdapterWriteResult<AdapterProjectionBridgeRecord>> {
    // pre_write_validation: rejeitar campos proibidos em projection_payload_json.
    const prohibited: string[] = [];
    for (const key of Object.keys(input.projection_payload_json)) {
      if (
        (PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS as readonly string[]).includes(key)
      ) {
        prohibited.push(key);
      }
    }
    if (prohibited.length > 0) {
      // Registra a tentativa em operational_history (audit) — depois rejeita.
      await this.appendHistoryEvent({
        lead_id: input.lead_id,
        turn_id: null,
        event_type: 'projection_updated',
        actor_layer: 'adapter',
        event_payload_json: {
          rejected: true,
          rejected_fields: prohibited,
          reason: 'projection_payload_contains_prohibited_fields',
          target_system: input.target_system,
        },
        occurred_at: nowIso(),
      });
      return fail(
        `projection_payload_contains_prohibited_fields: ${prohibited.join(',')}`,
      );
    }

    const existing = await this.backend.findOne<AdapterProjectionBridgeRecord>(
      'enova2_projection_bridge_v2',
      (r) => r.lead_id === input.lead_id && r.target_system === input.target_system,
    );
    const ts = nowIso();
    if (existing) {
      const patch: Partial<AdapterProjectionBridgeRecord> = {
        projection_payload_json: input.projection_payload_json,
        projection_status: input.projection_status,
        last_projection_at: input.last_projection_at ?? ts,
        updated_at: ts,
      };
      const updated = await this.backend.update<AdapterProjectionBridgeRecord>(
        'enova2_projection_bridge_v2',
        (r) => r.lead_id === input.lead_id && r.target_system === input.target_system,
        patch,
      );
      return updated ? ok(updated) : fail('projection_update_failed');
    }
    const row: AdapterProjectionBridgeRecord = {
      projection_id: uuid(),
      lead_id: input.lead_id,
      target_system: input.target_system,
      projection_payload_json: input.projection_payload_json,
      projection_status: input.projection_status,
      last_projection_at: input.last_projection_at ?? ts,
      created_at: ts,
      updated_at: ts,
    };
    await this.backend.insert<AdapterProjectionBridgeRecord>(
      'enova2_projection_bridge_v2',
      row,
    );
    return ok(row);
  }

  async getProjection(
    lead_id: string,
    target_system: ProjectionTargetSystem,
  ): Promise<AdapterReadResult<AdapterProjectionBridgeRecord>> {
    const row = await this.backend.findOne<AdapterProjectionBridgeRecord>(
      'enova2_projection_bridge_v2',
      (r) => r.lead_id === lead_id && r.target_system === target_system,
    );
    return row ? found(row) : notFound();
  }
}

// ---------------------------------------------------------------------------
// Factory de conveniência
// ---------------------------------------------------------------------------

/**
 * Cria uma instância do runtime com backend in-process.
 *
 * Esta é a entrada padrão para o smoke persistente da PR 44 e para qualquer
 * uso interno de testes/debugging. Para produção, fornecer um backend que
 * implemente `PersistenceBackend` falando com o Supabase real (próximo passo
 * de deployment, fora do recorte desta PR).
 */
export function createInMemoryAdapterRuntime(): {
  adapter: SupabaseAdapterRuntime;
  backend: InMemoryPersistenceBackend;
} {
  const backend = new InMemoryPersistenceBackend();
  const adapter = new SupabaseAdapterRuntime(backend);
  return { adapter, backend };
}
