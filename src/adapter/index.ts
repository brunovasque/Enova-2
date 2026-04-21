/**
 * ENOVA 2 — Supabase Adapter — Entrada Canônica Centralizada
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md (Frente 4)
 *   FRENTE4_PERSISTABLE_DATA_CONTRACT.md (PR 41 — shape autoritativo)
 *   src/adapter/policy.ts (PR 43 — política canônica de consistência)
 *   src/adapter/runtime.ts (PR 44 — runtime real mínimo)
 *
 * ESCOPO ATUAL (após PR 44):
 *   - `SupabaseAdapterBase` — classe-base histórica com stubs (PR 42).
 *     Mantida para compatibilidade documental com a casca canônica original.
 *   - `SupabaseAdapterRuntime` (re-export de `./runtime.ts`, PR 44) — runtime
 *     real mínimo com backend pluggável. Esta é a entrada de uso real do
 *     Adapter daqui em diante.
 *   - `createInMemoryAdapterRuntime` — factory para o smoke persistente da PR 44
 *     e para uso interno de testes; a porta `PersistenceBackend` permite plugar
 *     um cliente Supabase de verdade em deployment futuro sem alterar o runtime.
 *
 * RESTRIÇÕES INVIOLÁVEIS (idênticas para base e runtime):
 *   - Toda escrita nas tabelas enova2_* DEVE passar por uma implementação de
 *     `ISupabaseAdapter` desta camada.
 *   - Context/Frente 3 não escreve direto.
 *   - Speech Engine não escreve direto.
 *   - O Adapter não decide regra de negócio, gate ou stage.
 *   - O Adapter não escreve resposta ao cliente.
 *   - Campos soberanos do Core são projetados — nunca calculados pelo Adapter.
 */

// Re-export do runtime real mínimo da PR 44 — entrada operacional do Adapter.
export {
  type CanonicalTable,
  type PersistenceBackend,
  InMemoryPersistenceBackend,
  SupabaseAdapterRuntime,
  createInMemoryAdapterRuntime,
} from './runtime.ts';

import {
  ADAPTER_CANONICAL_CONSTRAINTS,
  ADAPTER_ROLE,
  ADAPTER_WRITE_OWNERSHIP,
  CORE_SOVEREIGN_FIELDS,
} from './boundaries.ts';

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
// Helpers de stub — PLACEHOLDER PR42
// ---------------------------------------------------------------------------

/** Mensagem canônica de stub para PR 42. */
const NOT_IMPLEMENTED = 'not_implemented — placeholder PR42: implementação runtime na PR44';

function stubWrite<T>(): AdapterWriteResult<T> {
  return { success: false, record: null, error: NOT_IMPLEMENTED };
}

function stubRead<T>(): AdapterReadResult<T> {
  return { found: false, record: null, error: NOT_IMPLEMENTED };
}

function stubList<T>(): AdapterListResult<T> {
  return { records: [], error: NOT_IMPLEMENTED };
}

// ---------------------------------------------------------------------------
// SupabaseAdapterBase — casca canônica centralizada
// ---------------------------------------------------------------------------

/**
 * Casca técnica mínima do Supabase Adapter (PR 42).
 *
 * Esta classe é a única porta de entrada para leitura/escrita nas tabelas enova2_*.
 * Todas as operações são stubs documentados — implementação real na PR 44.
 *
 * Boundaries declarados em `./boundaries.ts`.
 * Tipos declarados em `./types.ts`.
 *
 * DIAGRAMA DE DEPENDÊNCIA:
 *
 *   Core Mecânico ──────────────────────────────────────────► SupabaseAdapterBase
 *   (entrega core_decision_json)                              (projeta e persiste)
 *
 *   Contexto/Frente3 ──[semantic_package_json]──► Worker ──► SupabaseAdapterBase
 *   (não escreve direto)                                      (único escritor)
 *
 *   Speech Engine ──[speech_contract_json]──────► Worker ──► SupabaseAdapterBase
 *   (não escreve direto)                                      (único escritor)
 *
 * IMPLEMENTAÇÃO REAL:
 *   PR 44 substituirá os stubs por chamadas ao cliente Supabase.
 *   A interface ISupabaseAdapter não muda — apenas a implementação interna.
 */
export class SupabaseAdapterBase implements ISupabaseAdapter {
  /**
   * Papel canônico desta instância — somente persistência.
   * Ver `ADAPTER_ROLE` em boundaries.ts.
   */
  readonly role = ADAPTER_ROLE.sovereign_scope;

  /**
   * Constraints canônicas declaradas explicitamente em cada instância.
   * Ver `ADAPTER_CANONICAL_CONSTRAINTS` em boundaries.ts.
   */
  readonly constraints = ADAPTER_CANONICAL_CONSTRAINTS;

  /**
   * Campos soberanos do Core — projetados pelo Adapter, nunca calculados.
   * Ver `CORE_SOVEREIGN_FIELDS` em boundaries.ts.
   */
  readonly coreSovereignFields = CORE_SOVEREIGN_FIELDS;

  /**
   * Mapa de ownership de escrita por entidade.
   * Ver `ADAPTER_WRITE_OWNERSHIP` em boundaries.ts.
   */
  readonly writeOwnership = ADAPTER_WRITE_OWNERSHIP;

  // -------------------------------------------------------------------------
  // 1. enova2_lead — lead/cliente (âncora raiz)
  // -------------------------------------------------------------------------

  /**
   * Cria ou retorna lead existente pelo external_ref (idempotente).
   * No primeiro turno de um canal desconhecido, cria o lead com external_ref.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async upsertLead(_input: AdapterLeadWriteInput): Promise<AdapterWriteResult<AdapterLeadRecord>> {
    return stubWrite<AdapterLeadRecord>();
  }

  /**
   * Atualiza campos mutáveis do lead.
   * Apenas via sinais aceitos do Core — nunca a partir de texto bruto.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async updateLead(_input: AdapterLeadUpdateInput): Promise<AdapterWriteResult<AdapterLeadRecord>> {
    return stubWrite<AdapterLeadRecord>();
  }

  /**
   * Lê lead pelo lead_id.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getLead(_lead_id: string): Promise<AdapterReadResult<AdapterLeadRecord>> {
    return stubRead<AdapterLeadRecord>();
  }

  // -------------------------------------------------------------------------
  // 2. enova2_lead_state_v2 — estado operacional versionado
  // -------------------------------------------------------------------------

  /**
   * Persiste novo estado versionado projetado do payload do Core.
   *
   * SOBERANIA: stage_current, next_objective, block_advance e policy_flags_json
   * vêm do Core. O Adapter extrai do core_decision_json e projeta — NUNCA calcula.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async writeLeadState(_input: AdapterLeadStateWriteInput): Promise<AdapterWriteResult<AdapterLeadStateRecord>> {
    return stubWrite<AdapterLeadStateRecord>();
  }

  /**
   * Lê estado atual do lead (registro com state_version máximo).
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getCurrentLeadState(_lead_id: string): Promise<AdapterReadResult<AdapterLeadStateRecord>> {
    return stubRead<AdapterLeadStateRecord>();
  }

  // -------------------------------------------------------------------------
  // 3. enova2_turn_events_v2 — trilha de turnos (append-only)
  // -------------------------------------------------------------------------

  /**
   * Registra evento de turno completo — idempotente por idempotency_key.
   * Append-only — nunca altera um turno já registrado.
   *
   * Contém: normalized_input_json (Frente 3), semantic_package_json (Frente 3),
   * core_decision_json (Core), speech_contract_json (Speech — metadados, não texto final).
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async writeTurnEvent(_input: AdapterTurnEventWriteInput): Promise<AdapterWriteResult<AdapterTurnEventRecord>> {
    return stubWrite<AdapterTurnEventRecord>();
  }

  /**
   * Lista todos os turnos de um lead em ordem sequencial (turn_sequence).
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getTurnEvents(_lead_id: string): Promise<AdapterListResult<AdapterTurnEventRecord>> {
    return stubList<AdapterTurnEventRecord>();
  }

  /**
   * Lê turno pelo turn_id.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getTurnEvent(_turn_id: string): Promise<AdapterReadResult<AdapterTurnEventRecord>> {
    return stubRead<AdapterTurnEventRecord>();
  }

  // -------------------------------------------------------------------------
  // 4. enova2_signal_records_v2 — sinais extraídos e persistíveis
  // -------------------------------------------------------------------------

  /**
   * Insere sinais extraídos do turno com status inicial.
   * Idempotente por (turn_id, signal_key).
   * Sinais vêm do semantic_package_json (Frente 3) — Adapter insere com status 'pending'.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async writeSignals(_inputs: AdapterSignalWriteInput[]): Promise<AdapterListResult<AdapterSignalRecord>> {
    return stubList<AdapterSignalRecord>();
  }

  /**
   * Atualiza status de sinal — apenas evolução (pending → accepted/rejected).
   * O aceite é decidido pelo Core (core_decision_json). Adapter projeta a decisão.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async updateSignalStatus(_input: AdapterSignalStatusUpdateInput): Promise<AdapterWriteResult<AdapterSignalRecord>> {
    return stubWrite<AdapterSignalRecord>();
  }

  /**
   * Lista sinais de um lead com filtro opcional de status.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getSignalsByLead(_lead_id: string, _status?: SignalStatus): Promise<AdapterListResult<AdapterSignalRecord>> {
    return stubList<AdapterSignalRecord>();
  }

  /**
   * Lista sinais de um turno.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getSignalsByTurn(_turn_id: string): Promise<AdapterListResult<AdapterSignalRecord>> {
    return stubList<AdapterSignalRecord>();
  }

  // -------------------------------------------------------------------------
  // 5. enova2_memory_runtime_v2 — memória viva (TTL — temporária)
  // -------------------------------------------------------------------------

  /**
   * Upsert da memória viva — a mais recente substitui (1:1 por lead).
   * expires_at é obrigatório — TTL definido formalmente na PR 43.
   * Implementação real deve validar expires_at na leitura.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async upsertMemoryRuntime(_input: AdapterMemoryRuntimeWriteInput): Promise<AdapterWriteResult<AdapterMemoryRuntimeRecord>> {
    return stubWrite<AdapterMemoryRuntimeRecord>();
  }

  /**
   * Lê memória viva ativa do lead.
   * Implementação real DEVE verificar expires_at antes de retornar.
   * Se expirada, retorna found: false.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getActiveMemory(_lead_id: string): Promise<AdapterReadResult<AdapterMemoryRuntimeRecord>> {
    return stubRead<AdapterMemoryRuntimeRecord>();
  }

  // -------------------------------------------------------------------------
  // 6. enova2_document_records_v2 — rastreamento de documentos
  // -------------------------------------------------------------------------

  /**
   * Upsert de documento por (lead_id, doc_type) — status só progride, nunca regride.
   * storage_ref = referência ao storage — nunca o conteúdo bruto.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async upsertDocument(_input: AdapterDocumentWriteInput): Promise<AdapterWriteResult<AdapterDocumentRecord>> {
    return stubWrite<AdapterDocumentRecord>();
  }

  /**
   * Atualiza status de documento (received, validated).
   * Status só progride: requested → received → validated | rejected.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async updateDocumentStatus(_input: AdapterDocumentStatusUpdateInput): Promise<AdapterWriteResult<AdapterDocumentRecord>> {
    return stubWrite<AdapterDocumentRecord>();
  }

  /**
   * Lista documentos de um lead.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getDocumentsByLead(_lead_id: string): Promise<AdapterListResult<AdapterDocumentRecord>> {
    return stubList<AdapterDocumentRecord>();
  }

  // -------------------------------------------------------------------------
  // 7. enova2_dossier_v2 — dossiê consolidado
  // -------------------------------------------------------------------------

  /**
   * Upsert do dossiê — recompilação substitui (1:1 por lead).
   *
   * SOBERANIA: ready_for_visit e ready_for_broker_handoff são soberanos do Core.
   * O Adapter projeta estes valores do payload — nunca os calcula por conta própria.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async upsertDossier(_input: AdapterDossierWriteInput): Promise<AdapterWriteResult<AdapterDossierRecord>> {
    return stubWrite<AdapterDossierRecord>();
  }

  /**
   * Lê dossiê do lead.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getDossier(_lead_id: string): Promise<AdapterReadResult<AdapterDossierRecord>> {
    return stubRead<AdapterDossierRecord>();
  }

  // -------------------------------------------------------------------------
  // 8. enova2_visit_schedule_v2 — agendamento de visita
  // -------------------------------------------------------------------------

  /**
   * Registra interesse/agendamento de visita.
   * Core autoriza (via visit_interest no semantic_package ou core_decision_json).
   * Adapter persiste — nunca decide o agendamento.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async writeVisitSchedule(_input: AdapterVisitScheduleWriteInput): Promise<AdapterWriteResult<AdapterVisitScheduleRecord>> {
    return stubWrite<AdapterVisitScheduleRecord>();
  }

  /**
   * Atualiza status de visita (pending → scheduled → confirmed).
   * Cada mudança também deve ser registrada em enova2_operational_history_v2.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async updateVisitStatus(_input: AdapterVisitStatusUpdateInput): Promise<AdapterWriteResult<AdapterVisitScheduleRecord>> {
    return stubWrite<AdapterVisitScheduleRecord>();
  }

  /**
   * Lista visitas de um lead.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getVisitSchedulesByLead(_lead_id: string): Promise<AdapterListResult<AdapterVisitScheduleRecord>> {
    return stubList<AdapterVisitScheduleRecord>();
  }

  // -------------------------------------------------------------------------
  // 9. enova2_operational_history_v2 — histórico auditável (append-only)
  // -------------------------------------------------------------------------

  /**
   * Append-only — nunca update ou delete.
   * Um evento por ação relevante de qualquer layer.
   * actor_layer identifica quem originou o evento.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async appendHistoryEvent(_input: AdapterOperationalHistoryAppendInput): Promise<AdapterWriteResult<AdapterOperationalHistoryRecord>> {
    return stubWrite<AdapterOperationalHistoryRecord>();
  }

  /**
   * Lista histórico de um lead em ordem cronológica (occurred_at ASC).
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getHistoryByLead(_lead_id: string): Promise<AdapterListResult<AdapterOperationalHistoryRecord>> {
    return stubList<AdapterOperationalHistoryRecord>();
  }

  // -------------------------------------------------------------------------
  // 10. enova2_projection_bridge_v2 — projeção de compatibilidade (ENOVA 1)
  // -------------------------------------------------------------------------

  /**
   * Upsert de projeção por (lead_id, target_system).
   *
   * RESTRIÇÃO: apenas campos do mapa de compatibilidade explícito podem entrar em
   * projection_payload_json. O Adapter não projeta campos livres nem dumps.
   * Não alimenta raciocínio nem fala — serve apenas para convivência com ENOVA 1.
   *
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async upsertProjection(_input: AdapterProjectionBridgeWriteInput): Promise<AdapterWriteResult<AdapterProjectionBridgeRecord>> {
    return stubWrite<AdapterProjectionBridgeRecord>();
  }

  /**
   * Lê projeção de compatibilidade de um lead para um sistema alvo.
   * PLACEHOLDER — implementação runtime na PR 44.
   */
  async getProjection(_lead_id: string, _target_system: ProjectionTargetSystem): Promise<AdapterReadResult<AdapterProjectionBridgeRecord>> {
    return stubRead<AdapterProjectionBridgeRecord>();
  }
}
