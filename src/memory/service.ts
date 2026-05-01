/**
 * ENOVA 2 — PR-T8.13 — Memory service
 *
 * API funcional da memória evolutiva.
 *
 * REGRAS INVIOLÁVEIS:
 *   - Aprendizado começa SEMPRE como `draft`.
 *   - `validated` / `rejected` / `promoted` exigem decisão humana com
 *     `operator_id` E `reason` não vazios.
 *   - Promoção NUNCA acontece sem decisão explícita `decision: 'promoted'`.
 *   - Service NUNCA cria fact_*, NUNCA muda stage, NUNCA chama LLM,
 *     NUNCA dispara outbound.
 *   - Toda escrita passa por sanitização.
 */

import { emitTelemetry } from '../telemetry/emit.ts';
import type { TelemetryRequestContext } from '../telemetry/types.ts';
import { sanitizeRecord, sanitizeText } from './sanitize.ts';
import {
  getSharedMemoryStore,
  isMemorySupabaseFlagEnabled,
  type MemoryStore,
} from './store.ts';
import type {
  CreateLearningCandidateInput,
  LearningCandidateRecord,
  LearningDecisionInput,
  LearningCandidateListResult,
  MemoryCategory,
  MemoryListResult,
  MemoryRecord,
  MemoryStatusReport,
  RegisterMemoryInput,
} from './types.ts';
import { MEMORY_VERSION } from './types.ts';

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface MemoryServiceContext {
  store?: MemoryStore;
  telemetry?: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>;
}

function resolveStore(ctx?: MemoryServiceContext): MemoryStore {
  return ctx?.store ?? getSharedMemoryStore();
}

function emitMemoryEvent(
  ctx: MemoryServiceContext | undefined,
  action: string,
  outcome: 'completed' | 'rejected' | 'observed',
  details: Record<string, unknown>,
  lead_ref?: string | null,
) {
  emitTelemetry({
    layer: 'core',
    category: 'persistence_signal',
    action: `memory.${action}`,
    source: 'src/memory/service.ts',
    severity: outcome === 'rejected' ? 'warn' : 'info',
    outcome,
    trace_id: ctx?.telemetry?.trace_id,
    correlation_id: ctx?.telemetry?.correlation_id,
    request_id: ctx?.telemetry?.request_id,
    lead_ref: lead_ref ?? undefined,
    details,
  });
}

// ---------------------------------------------------------------------------
// Registrar evento de memória (categoria livre, exceto learning_candidate)
// ---------------------------------------------------------------------------

export interface RegisterMemoryResult {
  success: boolean;
  record?: MemoryRecord;
  error?: string;
}

export function registerMemoryEvent(
  input: RegisterMemoryInput,
  ctx?: MemoryServiceContext,
): RegisterMemoryResult {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'input_invalid' };
  }

  if (input.category === 'learning_candidate') {
    return {
      success: false,
      error: 'use_create_learning_candidate_for_learning_records',
    };
  }

  if (typeof input.summary !== 'string' || input.summary.trim().length === 0) {
    return { success: false, error: 'summary_required' };
  }

  const store = resolveStore(ctx);
  const sanitizedSummary = sanitizeText(input.summary, 500);
  const sanitizedDetails = input.details ? sanitizeRecord(input.details) : {};

  const record: MemoryRecord = {
    id: generateId('mem'),
    version: MEMORY_VERSION,
    category: input.category,
    event_type: input.event_type,
    source: input.source,
    lead_ref: input.lead_ref ?? null,
    summary: sanitizedSummary,
    evidence_ref: input.evidence_ref ?? null,
    risk_level: input.risk_level ?? 'low',
    status: 'draft',
    details: sanitizedDetails,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  store.insert(record);

  emitMemoryEvent(
    ctx,
    'event.recorded',
    'completed',
    {
      memory_id: record.id,
      category: record.category,
      event_type: record.event_type,
      source: record.source,
      risk_level: record.risk_level,
    },
    record.lead_ref,
  );

  return { success: true, record };
}

// ---------------------------------------------------------------------------
// Criar aprendizado candidato (sempre draft)
// ---------------------------------------------------------------------------

export interface CreateLearningCandidateResult {
  success: boolean;
  record?: LearningCandidateRecord;
  error?: string;
}

export function createLearningCandidate(
  input: CreateLearningCandidateInput,
  ctx?: MemoryServiceContext,
): CreateLearningCandidateResult {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'input_invalid' };
  }
  if (typeof input.summary !== 'string' || input.summary.trim().length === 0) {
    return { success: false, error: 'summary_required' };
  }
  if (typeof input.hypothesis !== 'string' || input.hypothesis.trim().length === 0) {
    return { success: false, error: 'hypothesis_required' };
  }

  const store = resolveStore(ctx);
  const record: LearningCandidateRecord = {
    id: generateId('learn'),
    version: MEMORY_VERSION,
    category: 'learning_candidate',
    event_type: 'learning_insight_candidate',
    source: input.source,
    lead_ref: input.lead_ref ?? null,
    summary: sanitizeText(input.summary, 500),
    evidence_ref: input.evidence_ref ?? null,
    risk_level: input.risk_level ?? 'medium',
    status: 'draft',
    details: input.details ? sanitizeRecord(input.details) : {},
    created_at: nowIso(),
    updated_at: nowIso(),
    hypothesis: sanitizeText(input.hypothesis, 500),
    proposed_action: input.proposed_action ? sanitizeText(input.proposed_action, 500) : null,
    decision_operator_id: null,
    decision_reason: null,
    decision_at: null,
  };

  store.insert(record);

  emitMemoryEvent(
    ctx,
    'candidate.created',
    'completed',
    {
      candidate_id: record.id,
      risk_level: record.risk_level,
      source: record.source,
    },
    record.lead_ref,
  );

  return { success: true, record };
}

// ---------------------------------------------------------------------------
// Decisão sobre aprendizado candidato (humana, exigida explicitamente)
// ---------------------------------------------------------------------------

export interface LearningDecisionResult {
  success: boolean;
  record?: LearningCandidateRecord;
  error?: string;
}

const VALID_DECISIONS = new Set(['validated', 'rejected', 'promoted'] as const);

export function applyLearningDecision(
  candidate_id: string,
  input: LearningDecisionInput,
  ctx?: MemoryServiceContext,
): LearningDecisionResult {
  if (!candidate_id || typeof candidate_id !== 'string') {
    return { success: false, error: 'candidate_id_required' };
  }
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'input_invalid' };
  }
  if (!VALID_DECISIONS.has(input.decision)) {
    return { success: false, error: 'decision_invalid' };
  }
  if (typeof input.operator_id !== 'string' || input.operator_id.trim().length === 0) {
    return { success: false, error: 'operator_id_required' };
  }
  if (typeof input.reason !== 'string' || input.reason.trim().length === 0) {
    return { success: false, error: 'reason_required' };
  }

  const store = resolveStore(ctx);
  const existing = store.findById(candidate_id);

  if (!existing) {
    emitMemoryEvent(ctx, 'candidate.decision', 'rejected', {
      candidate_id,
      reason: 'not_found',
    });
    return { success: false, error: 'not_found' };
  }
  if (existing.category !== 'learning_candidate') {
    emitMemoryEvent(ctx, 'candidate.decision', 'rejected', {
      candidate_id,
      reason: 'not_a_learning_candidate',
    });
    return { success: false, error: 'not_a_learning_candidate' };
  }

  const updated = store.updateStatus(candidate_id, input.decision, {
    decision_operator_id: sanitizeText(input.operator_id, 100),
    decision_reason: sanitizeText(input.reason, 500),
    decision_at: nowIso(),
  } as Partial<LearningCandidateRecord>) as LearningCandidateRecord | null;

  if (!updated) {
    return { success: false, error: 'update_failed' };
  }

  emitMemoryEvent(
    ctx,
    `candidate.${input.decision}`,
    'completed',
    {
      candidate_id,
      operator_id: sanitizeText(input.operator_id, 100),
    },
    updated.lead_ref,
  );

  return { success: true, record: updated };
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

export function listMemoryByLead(lead_ref: string, ctx?: MemoryServiceContext): MemoryListResult {
  const store = resolveStore(ctx);
  const records = store.listByLead(lead_ref);
  return { count: records.length, records };
}

export function listLearningCandidates(
  filterStatus?: 'draft' | 'validated' | 'rejected' | 'promoted',
  ctx?: MemoryServiceContext,
): LearningCandidateListResult {
  const store = resolveStore(ctx);
  const records = store.listLearningCandidates(filterStatus);
  return { count: records.length, records };
}

export function getMemoryStatus(
  env: Record<string, unknown> = {},
  ctx?: MemoryServiceContext,
): MemoryStatusReport {
  const store = resolveStore(ctx);
  const candidates = store.listLearningCandidates();
  const draft = candidates.filter((c) => c.status === 'draft').length;
  const validated = candidates.filter((c) => c.status === 'validated').length;
  const rejected = candidates.filter((c) => c.status === 'rejected').length;
  const promoted = candidates.filter((c) => c.status === 'promoted').length;

  const flag_supabase_memory = isMemorySupabaseFlagEnabled(env);

  return {
    mode: 'in_memory',
    flag_supabase_memory,
    total_records: store.size(),
    by_category: store.countByCategory() as Record<MemoryCategory, number>,
    learning_candidates: { draft, validated, rejected, promoted },
    invariants: {
      auto_promotion_disabled: true,
      auto_stage_change_disabled: true,
      auto_fact_creation_disabled: true,
      sanitization_active: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Soberania — guards de invariantes (usado por smoke)
// ---------------------------------------------------------------------------

/**
 * Confirma a invariante: nenhuma função pública deste módulo expõe API
 * para criar `fact_*` ou alterar stage. Esta função existe para ser
 * inspecionada pelo smoke como evidência declarativa.
 */
export function memoryInvariants() {
  return {
    can_create_fact: false,
    can_change_stage: false,
    can_promote_automatically: false,
    can_call_llm: false,
    can_send_outbound: false,
    sanitization_required: true,
  } as const;
}
