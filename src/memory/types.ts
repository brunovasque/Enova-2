/**
 * ENOVA 2 — PR-T8.13 — Memória evolutiva + telemetria operacional
 *
 * TIPOS CANÔNICOS DA MEMÓRIA (contrato T8 §4.2):
 *   - attendance_memory   : memória de atendimento por lead
 *   - learning_candidate  : aprendizado candidato (NÃO promove sozinho)
 *   - contract_memory     : referência contratual/governança
 *   - performance_memory  : conversão, abandono, docs, aprovação, visita
 *   - error_memory        : falha de LLM, parser, estado, Meta, Supabase, CRM
 *   - commercial_memory   : objeções, abordagens, follow-ups
 *   - product_memory      : gargalos, UX, melhorias
 *
 * REGRA SOBERANA:
 *   Memória registra, classifica e sugere. NÃO decide.
 *   Nenhum tipo pode alterar regra MCMV, criar fact_*, mudar stage,
 *   promover aprendizado para regra sem aprovação humana.
 */

export const MEMORY_VERSION = 'mem.v1' as const;

export type MemoryCategory =
  | 'attendance_memory'
  | 'learning_candidate'
  | 'contract_memory'
  | 'performance_memory'
  | 'error_memory'
  | 'commercial_memory'
  | 'product_memory';

export type MemorySource =
  | 'crm'
  | 'meta_webhook'
  | 'core_runtime'
  | 'panel_operator'
  | 'smoke'
  | 'system';

export type MemoryStatus = 'draft' | 'validated' | 'rejected' | 'promoted';

export type MemoryRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type MemoryEventType =
  // attendance
  | 'attendance_started'
  | 'attendance_message_received'
  | 'attendance_stage_observed'
  | 'attendance_objection_detected'
  | 'attendance_document_cited'
  | 'attendance_silence_detected'
  // performance
  | 'performance_conversion'
  | 'performance_abandonment'
  | 'performance_doc_received'
  | 'performance_approval'
  | 'performance_visit'
  // errors
  | 'error_llm'
  | 'error_parser'
  | 'error_state'
  | 'error_meta'
  | 'error_supabase'
  | 'error_crm'
  // learning
  | 'learning_insight_candidate'
  | 'learning_decision_validated'
  | 'learning_decision_rejected'
  | 'learning_decision_promoted'
  // operator
  | 'operator_manual_action'
  | 'operator_override'
  // contract
  | 'contract_reference'
  // product/commercial
  | 'commercial_objection'
  | 'commercial_followup'
  | 'product_friction';

export interface MemoryRecord {
  id: string;
  version: typeof MEMORY_VERSION;
  category: MemoryCategory;
  event_type: MemoryEventType;
  source: MemorySource;
  lead_ref: string | null;
  summary: string;
  evidence_ref: string | null;
  risk_level: MemoryRiskLevel;
  status: MemoryStatus;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LearningCandidateRecord extends MemoryRecord {
  category: 'learning_candidate';
  hypothesis: string;
  proposed_action: string | null;
  decision_operator_id: string | null;
  decision_reason: string | null;
  decision_at: string | null;
}

export interface RegisterMemoryInput {
  category: MemoryCategory;
  event_type: MemoryEventType;
  source: MemorySource;
  lead_ref?: string | null;
  summary: string;
  evidence_ref?: string | null;
  risk_level?: MemoryRiskLevel;
  details?: Record<string, unknown>;
}

export interface CreateLearningCandidateInput {
  source: MemorySource;
  lead_ref?: string | null;
  summary: string;
  hypothesis: string;
  proposed_action?: string | null;
  evidence_ref?: string | null;
  risk_level?: MemoryRiskLevel;
  details?: Record<string, unknown>;
}

export type LearningDecision = 'validated' | 'rejected' | 'promoted';

export interface LearningDecisionInput {
  decision: LearningDecision;
  operator_id: string;
  reason: string;
}

export interface MemoryListResult {
  count: number;
  records: MemoryRecord[];
}

export interface LearningCandidateListResult {
  count: number;
  records: LearningCandidateRecord[];
}

export interface MemoryStatusReport {
  mode: 'in_memory' | 'supabase_real';
  flag_supabase_memory: boolean;
  total_records: number;
  by_category: Record<MemoryCategory, number>;
  learning_candidates: {
    draft: number;
    validated: number;
    rejected: number;
    promoted: number;
  };
  invariants: {
    auto_promotion_disabled: true;
    auto_stage_change_disabled: true;
    auto_fact_creation_disabled: true;
    sanitization_active: true;
  };
}
