/**
 * ENOVA 2 — CRM Operacional — Tipos canônicos (PR-T8.4)
 *
 * Âncora contratual:
 *   schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md (PR-T8.3)
 *   schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md §5.2
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - CRM não escreve reply_text.
 *   - CRM não decide stage.
 *   - CRM não substitui LLM.
 *   - Reset preserva enova2_operational_history (auditoria não é apagada).
 *   - Modo manual é controle operacional, não script de fala.
 *   - Dossiê organiza informação, não decide aprovação.
 *
 * LIMITAÇÃO DESTA PR:
 *   O backend CRM usa armazenamento in-process isolado do adapter core.
 *   Quando Supabase real for conectado (PR-T8.8), ambos apontarão para o
 *   mesmo banco e os dados serão compartilhados. Ver schema/implementation/
 *   T8_BACKEND_CRM_OPERACIONAL.md §6 (Limitações).
 */

// ---------------------------------------------------------------------------
// Nomes de tabela CRM
// ---------------------------------------------------------------------------

export type CrmTable =
  | 'crm_leads'
  | 'crm_lead_state'
  | 'crm_turns'
  | 'crm_facts'
  | 'crm_documents'
  | 'crm_dossier'
  | 'crm_policy_events'
  | 'crm_override_log'
  | 'crm_manual_mode_log';

// ---------------------------------------------------------------------------
// Status canônicos
// ---------------------------------------------------------------------------

export type CrmLeadStatus = 'active' | 'inactive' | 'archived';
export type CrmDocumentStatus = 'requested' | 'received' | 'validated' | 'rejected';
export type CrmDossierStatus = 'incomplete' | 'in_progress' | 'ready_for_review' | 'approved' | 'rejected';
export type CrmPersonRole = 'P1' | 'P2' | 'P3';
export type CrmManualModeAction = 'activate' | 'deactivate';

// ---------------------------------------------------------------------------
// Entidade 1 — crm_leads
// Âncora raiz. Mapeada a enova2_lead (Legado Mestre §5.1: enova_leads).
// ---------------------------------------------------------------------------

export interface CrmLead {
  lead_id: string;
  /** Referência de canal externo (wa_id ou equivalente). */
  external_ref: string | null;
  customer_name: string | null;
  phone_ref: string | null;
  status: CrmLeadStatus;
  /** true quando operador ativou modo manual. */
  manual_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmLeadWriteInput {
  external_ref: string | null;
  customer_name?: string | null;
  phone_ref?: string | null;
}

// ---------------------------------------------------------------------------
// Entidade 2 — crm_lead_state
// Estado operacional atual. Mapeada a enova2_lead_state_v2.
// Campos soberanos do Core são projetados — CRM nunca os calcula.
// ---------------------------------------------------------------------------

export interface CrmLeadState {
  state_id: string;
  lead_id: string;
  /** Projetado do Core — CRM nunca escreve diretamente. */
  stage_current: string;
  next_objective: string;
  block_advance: boolean;
  policy_flags: Record<string, unknown>;
  risk_flags: Record<string, unknown> | null;
  state_version: number;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 3 — crm_turns
// Log de turnos. Mapeada a enova2_turn_events_v2.
// ---------------------------------------------------------------------------

export interface CrmTurn {
  turn_id: string;
  lead_id: string;
  channel_type: string;
  /** Resumo não-sensível da entrada bruta. */
  raw_input_summary: string;
  /** Stage ativo no momento do turno. */
  stage_at_turn: string;
  model_name: string | null;
  latency_ms: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 4 — crm_facts
// Fatos atômicos. Mapeada a enova2_signal_records_v2.
// ---------------------------------------------------------------------------

export type CrmFactStatus = 'accepted' | 'pending' | 'requires_confirmation' | 'rejected' | 'superseded';

export interface CrmFact {
  fact_id: string;
  lead_id: string;
  fact_key: string;
  fact_value: unknown;
  confidence: number | null;
  status: CrmFactStatus;
  source_turn_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmFactWriteInput {
  lead_id: string;
  fact_key: string;
  fact_value: unknown;
  confidence?: number | null;
  status?: CrmFactStatus;
  source_turn_id?: string | null;
}

// ---------------------------------------------------------------------------
// Entidade 5 — crm_documents
// Documentos/artefatos. Mapeada a enova2_document_records_v2.
// ---------------------------------------------------------------------------

export interface CrmDocument {
  document_id: string;
  lead_id: string;
  document_type: string;
  person_role: CrmPersonRole | null;
  status: CrmDocumentStatus;
  storage_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 6 — crm_dossier
// Dossiê operacional. Mapeada a enova2_dossier_v2.
// Dossiê organiza — não decide aprovação (T6_DOSSIE_OPERACIONAL.md §3).
// ---------------------------------------------------------------------------

export interface CrmDossier {
  dossier_id: string;
  lead_id: string;
  status: CrmDossierStatus;
  /** Metadados do correspondente (referência, retorno). */
  correspondent_ref: string | null;
  correspondent_status: 'pending' | 'sent' | 'approved' | 'rejected' | 'needs_complement' | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 7 — crm_policy_events
// Eventos de policy. Mapeada a enova2_operational_history_v2 (event_type: policy).
// ---------------------------------------------------------------------------

export interface CrmPolicyEvent {
  event_id: string;
  lead_id: string;
  rule_code: string;
  action_type: string;
  outcome: string;
  reason: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_turn_id: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 8 — crm_override_log
// Registro de intervenções manuais do operador.
// Preservado para sempre — nunca apagado (cláusula de auditoria T8).
// ---------------------------------------------------------------------------

export interface CrmOverrideLog {
  override_id: string;
  lead_id: string;
  operator_id: string;
  override_type: 'stage_override' | 'fact_correction' | 'status_change' | 'note';
  target_field: string | null;
  old_value: unknown;
  new_value: unknown;
  reason: string;
  created_at: string;
}

export interface CrmOverrideInput {
  operator_id: string;
  override_type: CrmOverrideLog['override_type'];
  target_field?: string | null;
  old_value?: unknown;
  new_value?: unknown;
  reason: string;
}

// ---------------------------------------------------------------------------
// Entidade 9 — crm_manual_mode_log
// Eventos de ativação/desativação de modo manual.
// ---------------------------------------------------------------------------

export interface CrmManualModeLog {
  event_id: string;
  lead_id: string;
  action: CrmManualModeAction;
  operator_id: string;
  reason: string | null;
  created_at: string;
}

export interface CrmManualModeInput {
  action: CrmManualModeAction;
  operator_id: string;
  reason?: string | null;
}

// ---------------------------------------------------------------------------
// Resultados de leitura/escrita
// ---------------------------------------------------------------------------

export interface CrmReadResult<T> {
  found: boolean;
  record: T | null;
  error: string | null;
}

export interface CrmListResult<T> {
  records: T[];
  total: number;
  error: string | null;
}

export interface CrmWriteResult<T> {
  success: boolean;
  record: T | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Filtros de listagem
// ---------------------------------------------------------------------------

export interface CrmLeadFilter {
  status?: CrmLeadStatus;
  manual_mode?: boolean;
  stage_current?: string;
}

// ---------------------------------------------------------------------------
// Interface de backend CRM
// Plug única para leitura/escrita — substituível por Supabase real em PR-T8.8.
// ---------------------------------------------------------------------------

export interface CrmBackend {
  insert<T>(table: CrmTable, row: T): Promise<T>;
  update<T>(table: CrmTable, matcher: (row: T) => boolean, patch: Partial<T>): Promise<T | null>;
  findOne<T>(table: CrmTable, matcher: (row: T) => boolean): Promise<T | null>;
  findMany<T>(table: CrmTable, matcher: (row: T) => boolean): Promise<T[]>;
  findAll<T>(table: CrmTable): Promise<T[]>;
}
