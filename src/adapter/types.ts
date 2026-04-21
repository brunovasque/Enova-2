/**
 * ENOVA 2 — Supabase Adapter — Tipos base canônicos (PR 42)
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md (Frente 4)
 *   FRENTE4_PERSISTABLE_DATA_CONTRACT.md (PR 41 — contrato autoritativo de dados)
 *
 * ESCOPO: interfaces e tipos estruturais das 10 entidades persistíveis
 * e de suas operações de leitura/escrita canônica.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - O Adapter projeta/persiste. Nunca decide regra de negócio.
 *   - O Adapter não escreve resposta ao cliente.
 *   - Speech Engine e Context (Frente 3) NÃO escrevem diretamente nas tabelas enova2_*.
 *   - Somente o Adapter escreve nas entidades enova2_*.
 *   - Campos soberanos do Core (stage, next_objective, block_advance, policy_flags)
 *     são projetados pelo Adapter a partir do payload do Core — nunca calculados aqui.
 *
 * Fonte do shape: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seções 6 e 8 (PR 41).
 */

// ---------------------------------------------------------------------------
// Tipos literais de status — alinhados ao contrato de dados (PR 41, seção 6)
// ---------------------------------------------------------------------------

export type LeadStatus = 'active' | 'inactive' | 'archived';

export type LeadStateUpdatedByLayer = 'core' | 'adapter';

export type TurnChannelType = 'text' | 'audio' | 'other';

export type SignalType =
  | 'fact'
  | 'intent'
  | 'question'
  | 'objection'
  | 'slot_candidate'
  | 'pending'
  | 'ambiguity';

export type SignalStatus =
  | 'accepted'
  | 'pending'
  | 'requires_confirmation'
  | 'slot_candidate'
  | 'rejected';

/** Tipo canônico de documento (ex.: 'rg', 'cpf', 'comprovante_renda'). */
export type DocumentType = string;

export type DocumentStatus = 'requested' | 'received' | 'validated' | 'rejected';

export type DossierStatus =
  | 'incomplete'
  | 'in_progress'
  | 'ready_for_review'
  | 'approved'
  | 'rejected';

export type VisitStatus =
  | 'pending'
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type OperationalEventType =
  | 'stage_transition'
  | 'signal_accepted'
  | 'document_received'
  | 'document_validated'
  | 'visit_scheduled'
  | 'dossier_compiled'
  | 'dossier_approved'
  | 'projection_updated'
  | 'turn_processed'
  | 'human_action';

export type OperationalActorLayer =
  | 'core'
  | 'adapter'
  | 'context_extraction'
  | 'speech_engine'
  | 'worker'
  | 'human_admin';

/** Único alvo de projeção autorizado nesta PR. */
export type ProjectionTargetSystem = 'enova1';

export type ProjectionStatus = 'pending' | 'projected' | 'failed' | 'stale';

// ---------------------------------------------------------------------------
// Entidade 1 — enova2_lead (âncora raiz)
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.1
// ---------------------------------------------------------------------------

/** Registro canônico do lead/cliente. Âncora de todas as outras entidades. */
export interface AdapterLeadRecord {
  /** UUID — chave primária. Gerado pelo Adapter no primeiro turno. */
  lead_id: string;
  /** Referência de canal externo (idempotency key). Nunca o conteúdo bruto. */
  external_ref: string | null;
  customer_name: string | null;
  phone_ref: string | null;
  status: LeadStatus;
  created_at: string; // ISO 8601 — imutável após insert
  updated_at: string; // ISO 8601
}

export interface AdapterLeadWriteInput {
  external_ref: string | null;
  customer_name?: string | null;
  phone_ref?: string | null;
  status?: LeadStatus;
}

export interface AdapterLeadUpdateInput {
  lead_id: string;
  /** Apenas via sinais aceitos do Core — nunca de texto bruto. */
  customer_name?: string | null;
  phone_ref?: string | null;
  status?: LeadStatus;
}

// ---------------------------------------------------------------------------
// Entidade 2 — enova2_lead_state_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.2
// ---------------------------------------------------------------------------

/**
 * Estado operacional resumido e governado do lead.
 * Reflexo auditável do que o Core decidiu por último.
 *
 * SOBERANIA: os campos abaixo são definidos pelo Core.
 * O Adapter projeta — NUNCA calcula:
 *   stage_current, next_objective, block_advance, policy_flags_json
 */
export interface AdapterLeadStateRecord {
  lead_state_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead
  /** Definido pelo Core — Adapter projeta, não calcula. */
  stage_current: string;
  /** Stage anterior — para auditoria de transição. */
  stage_after_last_decision: string;
  /** Objetivo autorizado pelo Core — Adapter projeta, não calcula. */
  next_objective: string;
  /** true = Core bloqueou avanço — Adapter projeta, não calcula. */
  block_advance: boolean;
  /** Flags de política aplicados pelo Core — Adapter projeta, não calcula. */
  policy_flags_json: Record<string, unknown>;
  risk_flags_json: Record<string, unknown> | null;
  /** Incremental — nunca decresce. */
  state_version: number;
  source_turn_id: string; // FK → enova2_turn_events_v2
  updated_by_layer: LeadStateUpdatedByLayer;
  created_at: string;
  updated_at: string;
}

/**
 * Input de escrita do estado.
 * Os campos soberanos do Core vêm do payload de decisão — Adapter projeta, nunca calcula.
 */
export interface AdapterLeadStateWriteInput {
  lead_id: string;
  source_turn_id: string;
  /** Soberano do Core — projetado do core_decision_json. */
  stage_current: string;
  /** Soberano do Core — stage anterior para auditoria. */
  stage_after_last_decision: string;
  /** Soberano do Core — projetado do core_decision_json. */
  next_objective: string;
  /** Soberano do Core — projetado do core_decision_json. */
  block_advance: boolean;
  /** Soberano do Core — projetado do core_decision_json. */
  policy_flags_json: Record<string, unknown>;
  risk_flags_json?: Record<string, unknown> | null;
  updated_by_layer: LeadStateUpdatedByLayer;
}

// ---------------------------------------------------------------------------
// Entidade 3 — enova2_turn_events_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.3
// ---------------------------------------------------------------------------

/**
 * Trilha completa de cada turno — append-only, imutável após inserção.
 *
 * Contém: input normalizado, pacote semântico (Frente 3),
 * decisão do Core e metadados de speech.
 *
 * O que NÃO vai aqui: texto final da IA, transcript bruto como campo primário.
 */
export interface AdapterTurnEventRecord {
  turn_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead
  idempotency_key: string; // chave única por turno
  channel_type: TurnChannelType;
  /** Referência ao input bruto — nunca o conteúdo bruto. */
  raw_input_ref: string | null;
  /** Input normalizado (texto limpo ou transcrição aceita). */
  normalized_input_json: Record<string, unknown>;
  /** Saída estruturada da Frente 3 — sinais, intenções, ambiguidades, pendências. */
  semantic_package_json: Record<string, unknown>;
  /** Payload completo de decisão do Core — stage, next_objective, slots aceitos, flags. */
  core_decision_json: Record<string, unknown>;
  /** Metadados de governança de resposta do Speech Engine — não o texto final. */
  speech_contract_json: Record<string, unknown> | null;
  turn_sequence: number;
  created_at: string; // imutável após insert
}

export interface AdapterTurnEventWriteInput {
  lead_id: string;
  idempotency_key: string;
  channel_type: TurnChannelType;
  raw_input_ref?: string | null;
  normalized_input_json: Record<string, unknown>;
  semantic_package_json: Record<string, unknown>;
  core_decision_json: Record<string, unknown>;
  speech_contract_json?: Record<string, unknown> | null;
  turn_sequence: number;
}

// ---------------------------------------------------------------------------
// Entidade 4 — enova2_signal_records_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.4
// ---------------------------------------------------------------------------

/**
 * Sinais extraídos e persistíveis — fatos, slots, intenções, objeções.
 *
 * Status evolui: pending → accepted | rejected.
 * Valor é imutável após inserção.
 * Aceite é decidido pelo Core — o Adapter projeta a decisão.
 */
export interface AdapterSignalRecord {
  signal_id: string; // UUID — PK
  turn_id: string; // FK → enova2_turn_events_v2
  lead_id: string; // FK → enova2_lead
  signal_type: SignalType;
  /** Nome canônico do sinal (ex.: 'monthly_income', 'marital_status'). */
  signal_key: string;
  signal_value_json: Record<string, unknown>;
  /** Score de confiança [0.000–1.000]. */
  confidence_score: number;
  status: SignalStatus;
  evidence_ref: string | null;
  confirmed_at: string | null;
  rejected_at: string | null;
  created_at: string;
}

export interface AdapterSignalWriteInput {
  turn_id: string;
  lead_id: string;
  signal_type: SignalType;
  signal_key: string;
  signal_value_json: Record<string, unknown>;
  confidence_score: number;
  status: SignalStatus;
  evidence_ref?: string | null;
}

export interface AdapterSignalStatusUpdateInput {
  signal_id: string;
  /** Status só evolui — não pode regredir. Aceite vem do Core. */
  status: SignalStatus;
  confirmed_at?: string | null;
  rejected_at?: string | null;
}

// ---------------------------------------------------------------------------
// Entidade 5 — enova2_memory_runtime_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.5
// ---------------------------------------------------------------------------

/**
 * Memória viva curta — contexto útil com TTL para o próximo raciocínio.
 *
 * NÃO é dado permanente. Tem expiração explícita (expires_at).
 * 1:1 por lead (upsert — registro mais recente substitui).
 * TTL padrão: 24h–72h — definido formalmente na PR 43.
 *
 * Diferença entre memória viva e sinal aceito:
 *   Sinal aceito: fato confirmado, permanente, rastreável, auditável.
 *   Memória viva: contexto útil temporário, sem confirmação, expirável.
 */
export interface AdapterMemoryRuntimeRecord {
  memory_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead (unicidade 1:1 ativo por lead)
  memory_version: number; // incremental
  open_questions_json: Record<string, unknown>;
  open_objections_json: Record<string, unknown>;
  useful_context_json: Record<string, unknown>;
  next_turn_pending_json: Record<string, unknown>;
  conversation_constraints_json: Record<string, unknown> | null;
  /** TTL explícito — após este momento, não deve ser lida. */
  expires_at: string; // ISO 8601
  created_at: string;
  updated_at: string;
}

export interface AdapterMemoryRuntimeWriteInput {
  lead_id: string;
  open_questions_json: Record<string, unknown>;
  open_objections_json: Record<string, unknown>;
  useful_context_json: Record<string, unknown>;
  next_turn_pending_json: Record<string, unknown>;
  conversation_constraints_json?: Record<string, unknown> | null;
  /** Obrigatório — política de TTL definida formalmente na PR 43. */
  expires_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 6 — enova2_document_records_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.6
// ---------------------------------------------------------------------------

/**
 * Rastreamento de documentos enviados, recebidos e validados.
 *
 * Status evolui: requested → received → validated | rejected.
 * storage_ref = referência ao storage — nunca o conteúdo bruto.
 */
export interface AdapterDocumentRecord {
  document_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead
  /** Tipo canônico (ex.: 'rg', 'cpf', 'comprovante_renda'). */
  doc_type: DocumentType;
  doc_status: DocumentStatus;
  /** Referência ao storage (URL, media_id) — nunca o conteúdo bruto. */
  storage_ref: string | null;
  validation_notes_json: Record<string, unknown> | null;
  source_turn_id: string; // FK → enova2_turn_events_v2
  requested_at: string | null;
  received_at: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdapterDocumentWriteInput {
  lead_id: string;
  doc_type: DocumentType;
  doc_status: DocumentStatus;
  source_turn_id: string;
  storage_ref?: string | null;
  validation_notes_json?: Record<string, unknown> | null;
  requested_at?: string | null;
  received_at?: string | null;
  validated_at?: string | null;
}

export interface AdapterDocumentStatusUpdateInput {
  lead_id: string;
  doc_type: DocumentType;
  /** Status só progride — nunca regride. */
  doc_status: DocumentStatus;
  storage_ref?: string | null;
  validation_notes_json?: Record<string, unknown> | null;
  received_at?: string | null;
  validated_at?: string | null;
}

// ---------------------------------------------------------------------------
// Entidade 7 — enova2_dossier_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.7
// ---------------------------------------------------------------------------

/**
 * Dossiê consolidado — visão operacional para handoff humano.
 *
 * 1:1 por lead (upsert — recompilação substitui).
 *
 * ready_for_visit e ready_for_broker_handoff são soberanos do Core:
 * o Adapter projeta estes valores do payload do Core — nunca os calcula.
 */
export interface AdapterDossierRecord {
  dossier_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead (1:1)
  dossier_status: DossierStatus;
  /** Resumo estruturado: slots aceitos, perfil, composição familiar. */
  dossier_summary_json: Record<string, unknown>;
  /** Lista de documentos exigidos com status de cada um. */
  required_docs_json: Record<string, unknown>;
  /** Soberano do Core — Adapter projeta, não calcula. */
  ready_for_visit: boolean;
  /** Soberano do Core — Adapter projeta, não calcula. */
  ready_for_broker_handoff: boolean;
  compiled_at: string;
  created_at: string;
  updated_at: string;
}

export interface AdapterDossierWriteInput {
  lead_id: string;
  dossier_status: DossierStatus;
  dossier_summary_json: Record<string, unknown>;
  required_docs_json: Record<string, unknown>;
  /** Soberano do Core — projetado do payload. Adapter não calcula. */
  ready_for_visit: boolean;
  /** Soberano do Core — projetado do payload. Adapter não calcula. */
  ready_for_broker_handoff: boolean;
  compiled_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 8 — enova2_visit_schedule_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.8
// ---------------------------------------------------------------------------

/** Rastreamento de interesse e agendamento de visita. Core autoriza — Adapter persiste. */
export interface AdapterVisitScheduleRecord {
  visit_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead
  source_turn_id: string; // FK → enova2_turn_events_v2
  visit_status: VisitStatus;
  visit_interest_declared: boolean;
  scheduled_at: string | null;
  location_ref: string | null;
  confirmation_notes_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AdapterVisitScheduleWriteInput {
  lead_id: string;
  source_turn_id: string;
  visit_status: VisitStatus;
  visit_interest_declared: boolean;
  scheduled_at?: string | null;
  location_ref?: string | null;
  confirmation_notes_json?: Record<string, unknown> | null;
}

export interface AdapterVisitStatusUpdateInput {
  visit_id: string;
  visit_status: VisitStatus;
  scheduled_at?: string | null;
  location_ref?: string | null;
  confirmation_notes_json?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Entidade 9 — enova2_operational_history_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.9
// ---------------------------------------------------------------------------

/**
 * Histórico operacional auditável — append-only.
 *
 * Nunca update ou delete. Um evento por ação relevante de qualquer layer.
 * Fonte de verdade para debugging e auditoria.
 */
export interface AdapterOperationalHistoryRecord {
  history_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead
  turn_id: string | null; // FK opcional → enova2_turn_events_v2
  event_type: OperationalEventType;
  actor_layer: OperationalActorLayer;
  /** Campos relevantes para auditoria — não dumps textuais. */
  event_payload_json: Record<string, unknown>;
  occurred_at: string; // ISO 8601
  created_at: string;
}

export interface AdapterOperationalHistoryAppendInput {
  lead_id: string;
  turn_id?: string | null;
  event_type: OperationalEventType;
  actor_layer: OperationalActorLayer;
  event_payload_json: Record<string, unknown>;
  occurred_at: string;
}

// ---------------------------------------------------------------------------
// Entidade 10 — enova2_projection_bridge_v2
// Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 6.10
// ---------------------------------------------------------------------------

/**
 * Projeção de compatibilidade controlada para sistemas legados (ENOVA 1).
 *
 * Apenas campos do mapa de compatibilidade explícito.
 * Não alimenta raciocínio nem fala — serve apenas para convivência com ENOVA 1.
 *
 * Regra de segurança: apenas campos explicitamente mapeados entram em
 * projection_payload_json. O Adapter não projeta campos livres nem dumps.
 */
export interface AdapterProjectionBridgeRecord {
  projection_id: string; // UUID — PK
  lead_id: string; // FK → enova2_lead
  target_system: ProjectionTargetSystem;
  /** Apenas campos do mapa de compatibilidade — sem campos livres. */
  projection_payload_json: Record<string, unknown>;
  projection_status: ProjectionStatus;
  last_projection_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdapterProjectionBridgeWriteInput {
  lead_id: string;
  target_system: ProjectionTargetSystem;
  /** Apenas campos do mapa de compatibilidade explícito. */
  projection_payload_json: Record<string, unknown>;
  projection_status: ProjectionStatus;
  last_projection_at?: string | null;
}

// ---------------------------------------------------------------------------
// Tipos de resultado canônicos das operações
// ---------------------------------------------------------------------------

/** Retorno padrão de operações de escrita/upsert. */
export interface AdapterWriteResult<T> {
  success: boolean;
  record: T | null;
  error: string | null;
}

/** Retorno padrão de operações de leitura por chave única. */
export interface AdapterReadResult<T> {
  found: boolean;
  record: T | null;
  error: string | null;
}

/** Retorno padrão de operações de listagem. */
export interface AdapterListResult<T> {
  records: T[];
  error: string | null;
}

// ---------------------------------------------------------------------------
// Interfaces de operações por entidade
// ---------------------------------------------------------------------------

export interface IAdapterLeadOps {
  /** Cria ou retorna lead existente pelo external_ref — idempotente. */
  upsertLead(input: AdapterLeadWriteInput): Promise<AdapterWriteResult<AdapterLeadRecord>>;
  /** Atualiza campos mutáveis do lead — apenas via sinais aceitos do Core. */
  updateLead(input: AdapterLeadUpdateInput): Promise<AdapterWriteResult<AdapterLeadRecord>>;
  /** Lê lead pelo lead_id. */
  getLead(lead_id: string): Promise<AdapterReadResult<AdapterLeadRecord>>;
}

export interface IAdapterLeadStateOps {
  /**
   * Persiste novo estado versionado projetado do payload do Core.
   * Campos soberanos (stage_current, next_objective, block_advance, policy_flags_json)
   * vêm do Core — Adapter projeta, nunca calcula.
   */
  writeLeadState(input: AdapterLeadStateWriteInput): Promise<AdapterWriteResult<AdapterLeadStateRecord>>;
  /** Lê estado atual do lead (state_version máximo). */
  getCurrentLeadState(lead_id: string): Promise<AdapterReadResult<AdapterLeadStateRecord>>;
}

export interface IAdapterTurnEventOps {
  /** Registra evento de turno — idempotente por idempotency_key. Append-only. */
  writeTurnEvent(input: AdapterTurnEventWriteInput): Promise<AdapterWriteResult<AdapterTurnEventRecord>>;
  /** Lista todos os turnos de um lead em ordem sequencial. */
  getTurnEvents(lead_id: string): Promise<AdapterListResult<AdapterTurnEventRecord>>;
  /** Lê turno pelo turn_id. */
  getTurnEvent(turn_id: string): Promise<AdapterReadResult<AdapterTurnEventRecord>>;
}

export interface IAdapterSignalOps {
  /** Insere sinais extraídos do turno com status inicial. Idempotente por (turn_id, signal_key). */
  writeSignals(inputs: AdapterSignalWriteInput[]): Promise<AdapterListResult<AdapterSignalRecord>>;
  /** Atualiza status de sinal — apenas evolução. Aceite é decidido pelo Core. */
  updateSignalStatus(input: AdapterSignalStatusUpdateInput): Promise<AdapterWriteResult<AdapterSignalRecord>>;
  /** Lista sinais de um lead com filtro opcional de status. */
  getSignalsByLead(lead_id: string, status?: SignalStatus): Promise<AdapterListResult<AdapterSignalRecord>>;
  /** Lista sinais de um turno. */
  getSignalsByTurn(turn_id: string): Promise<AdapterListResult<AdapterSignalRecord>>;
}

export interface IAdapterMemoryRuntimeOps {
  /**
   * Upsert da memória viva — a mais recente substitui (1:1 por lead).
   * expires_at obrigatório — política de TTL formal na PR 43.
   */
  upsertMemoryRuntime(input: AdapterMemoryRuntimeWriteInput): Promise<AdapterWriteResult<AdapterMemoryRuntimeRecord>>;
  /** Lê memória viva ativa — implementação real deve validar expires_at antes de retornar. */
  getActiveMemory(lead_id: string): Promise<AdapterReadResult<AdapterMemoryRuntimeRecord>>;
}

export interface IAdapterDocumentOps {
  /** Upsert de documento por (lead_id, doc_type) — status só progride, nunca regride. */
  upsertDocument(input: AdapterDocumentWriteInput): Promise<AdapterWriteResult<AdapterDocumentRecord>>;
  /** Atualiza status de documento (received, validated). */
  updateDocumentStatus(input: AdapterDocumentStatusUpdateInput): Promise<AdapterWriteResult<AdapterDocumentRecord>>;
  /** Lista documentos de um lead. */
  getDocumentsByLead(lead_id: string): Promise<AdapterListResult<AdapterDocumentRecord>>;
}

export interface IAdapterDossierOps {
  /**
   * Upsert do dossiê — recompilação substitui (1:1 por lead).
   * ready_for_visit e ready_for_broker_handoff vêm do Core — Adapter projeta.
   */
  upsertDossier(input: AdapterDossierWriteInput): Promise<AdapterWriteResult<AdapterDossierRecord>>;
  /** Lê dossiê do lead. */
  getDossier(lead_id: string): Promise<AdapterReadResult<AdapterDossierRecord>>;
}

export interface IAdapterVisitScheduleOps {
  /** Registra interesse/agendamento de visita. Core autoriza — Adapter persiste. */
  writeVisitSchedule(input: AdapterVisitScheduleWriteInput): Promise<AdapterWriteResult<AdapterVisitScheduleRecord>>;
  /** Atualiza status de visita. */
  updateVisitStatus(input: AdapterVisitStatusUpdateInput): Promise<AdapterWriteResult<AdapterVisitScheduleRecord>>;
  /** Lista visitas de um lead. */
  getVisitSchedulesByLead(lead_id: string): Promise<AdapterListResult<AdapterVisitScheduleRecord>>;
}

export interface IAdapterOperationalHistoryOps {
  /** Append-only — nunca update ou delete. */
  appendHistoryEvent(input: AdapterOperationalHistoryAppendInput): Promise<AdapterWriteResult<AdapterOperationalHistoryRecord>>;
  /** Lista histórico de um lead em ordem cronológica. */
  getHistoryByLead(lead_id: string): Promise<AdapterListResult<AdapterOperationalHistoryRecord>>;
}

export interface IAdapterProjectionBridgeOps {
  /** Upsert de projeção por (lead_id, target_system). Apenas campos do mapa de compat. */
  upsertProjection(input: AdapterProjectionBridgeWriteInput): Promise<AdapterWriteResult<AdapterProjectionBridgeRecord>>;
  /** Lê projeção de compatibilidade de um lead para um sistema alvo. */
  getProjection(lead_id: string, target_system: ProjectionTargetSystem): Promise<AdapterReadResult<AdapterProjectionBridgeRecord>>;
}

// ---------------------------------------------------------------------------
// Interface completa do Supabase Adapter
// ---------------------------------------------------------------------------

/**
 * Interface canônica do Supabase Adapter — cobre as 10 entidades persistíveis.
 *
 * Todo write/read das tabelas enova2_* DEVE passar por uma implementação desta interface.
 * Nenhuma outra layer escreve diretamente.
 *
 * Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seções 6, 7 e 8.
 */
export interface ISupabaseAdapter
  extends IAdapterLeadOps,
    IAdapterLeadStateOps,
    IAdapterTurnEventOps,
    IAdapterSignalOps,
    IAdapterMemoryRuntimeOps,
    IAdapterDocumentOps,
    IAdapterDossierOps,
    IAdapterVisitScheduleOps,
    IAdapterOperationalHistoryOps,
    IAdapterProjectionBridgeOps {}
