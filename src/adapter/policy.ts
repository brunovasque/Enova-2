/**
 * ENOVA 2 — Supabase Adapter — Política Canônica de Consistência (PR 43)
 *
 * Âncora contratual:
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seção 13 (PR 43, microetapas 1-5)
 *   FRENTE4_PERSISTABLE_DATA_CONTRACT.md (PR 41 — shape autoritativo)
 *   boundaries.ts (PR 42 — ownership de layers)
 *
 * ESCOPO: política canônica de merge/update/overwrite por entidade, TTL da
 * memória viva e mapa de compatibilidade controlada para projection_bridge.
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo é DECLARATIVO.
 *   - Não contém lógica de negócio.
 *   - Não decide stage, gate ou next_objective.
 *   - Não escreve resposta ao cliente.
 *   - A PR 44 implementa o runtime que RESPEITA esta política.
 *
 * ÍNDICE DESTE ARQUIVO:
 *   Seção A — Tipos canônicos de política
 *   Seção B — Política por entidade (10 entidades)
 *   Seção C — TTL da memória viva (numérico e explícito)
 *   Seção D — Projection bridge: mapa de compatibilidade ENOVA 1
 *   Seção E — Monotonicidade de status por entidade
 *   Seção F — Tabela-resumo de comportamento por entidade
 */

// ===========================================================================
// SEÇÃO A — Tipos canônicos de política
// ===========================================================================

/**
 * Estratégia de escrita de uma entidade.
 *
 * append            — insert-only; nunca altera registro existente.
 * upsert            — cria se não existe; mescla campos mutáveis se existe.
 * overwrite         — cria se não existe; substitui completamente se existe (1:1 por lead).
 * insert_versioned  — sempre insere novo registro; versões anteriores não são alteradas.
 */
export type WriteStrategy =
  | 'append'
  | 'upsert'
  | 'overwrite'
  | 'insert_versioned';

/**
 * Comportamento ao reprocessar (turno ou evento já processado anteriormente).
 *
 * ignore  — reprocessamento não altera nada; registro existente é mantido intacto.
 * update  — reprocessamento atualiza apenas campos permitidos (nunca status nem campos imutáveis).
 * replace — reprocessamento substitui o registro completo (válido apenas para 1:1 por lead).
 * append  — reprocessamento não reprocessa registro existente; apenas adiciona novo se permitido.
 */
export type ReprocessBehavior = 'ignore' | 'update' | 'replace' | 'append';

/**
 * Nível de monotonicidade de status.
 *
 * strict          — status progride em sequência fixa e nunca regride.
 * terminal_states — status pode progredir livremente, mas estados terminais são irreversíveis.
 * none            — entidade não tem campo de status monótono.
 */
export type MonotonicityLevel = 'strict' | 'terminal_states' | 'none';

/** Política completa de consistência de uma entidade. */
export interface EntityConsistencyPolicy {
  /** Nome canônico da tabela. */
  entity: string;
  /** Estratégia de escrita. */
  write_strategy: WriteStrategy;
  /** Comportamento ao reprocessar o mesmo dado (mesmo turno, mesma chave). */
  reprocess_behavior: ReprocessBehavior;
  /** Chave de idempotência desta entidade. */
  idempotency_key: string;
  /** Campos imutáveis após insert — nunca podem ser alterados. */
  immutable_after_insert: readonly string[];
  /** Campos mutáveis — podem ser atualizados conforme política. */
  mutable_fields: readonly string[];
  /** Nível de monotonicidade de status. */
  monotonicity: MonotonicityLevel;
  /** Há TTL/expiração? */
  has_ttl: boolean;
  /** Notas de consistência relevantes. */
  consistency_notes: string;
}

// ===========================================================================
// SEÇÃO B — Política por entidade (10 entidades)
// ===========================================================================

/**
 * 1. enova2_lead — âncora raiz do lead/cliente.
 *
 * WRITE STRATEGY: upsert
 *   - Se external_ref não existe: INSERT (cria novo lead).
 *   - Se external_ref já existe: UPDATE apenas dos campos mutáveis permitidos.
 *   - lead_id e external_ref são imutáveis após insert.
 *
 * REPROCESS: ignore
 *   - Mesmo external_ref no reprocessamento: retorna registro existente sem alteração.
 *   - Dados não confirmados por sinal aceito do Core não sobrescrevem dados existentes.
 *
 * CONFLITO: sinal aceito pelo Core vence dados anteriores em campos mutáveis.
 *   Nunca sobrescrever com base em texto bruto ou sinal não aceito.
 */
export const POLICY_LEAD: EntityConsistencyPolicy = {
  entity: 'enova2_lead',
  write_strategy: 'upsert',
  reprocess_behavior: 'ignore',
  idempotency_key: 'external_ref',
  immutable_after_insert: ['lead_id', 'external_ref', 'created_at'],
  mutable_fields: ['customer_name', 'phone_ref', 'status', 'updated_at'],
  monotonicity: 'strict',
  has_ttl: false,
  consistency_notes:
    'Dados mutáveis (customer_name, phone_ref) só são atualizados via sinal ' +
    'aceito pelo Core. Nunca a partir de texto bruto ou sinal pendente/rejeitado. ' +
    'Status monotônico: active → inactive → archived. Archived é terminal.',
} as const;

/**
 * 2. enova2_lead_state_v2 — estado operacional versionado.
 *
 * WRITE STRATEGY: insert_versioned
 *   - Cada chamada a writeLeadState insere NOVO registro com state_version incremental.
 *   - Registros anteriores nunca são alterados.
 *   - Leitura de estado atual = registro com state_version máximo para o lead_id.
 *
 * REPROCESS: ignore
 *   - Mesma (lead_id, source_turn_id): se já existe registro para este turno, ignora.
 *   - Nunca cria dois registros de estado para o mesmo turno de origem.
 *
 * CAMPOS SOBERANOS DO CORE (projetados — nunca calculados pelo Adapter):
 *   stage_current, next_objective, block_advance, policy_flags_json
 *
 * MONOTONICIDADE: state_version nunca decresce. Adapter valida antes de inserir.
 */
export const POLICY_LEAD_STATE: EntityConsistencyPolicy = {
  entity: 'enova2_lead_state_v2',
  write_strategy: 'insert_versioned',
  reprocess_behavior: 'ignore',
  idempotency_key: '(lead_id, source_turn_id)',
  immutable_after_insert: [
    'lead_state_id',
    'lead_id',
    'stage_current',
    'next_objective',
    'block_advance',
    'policy_flags_json',
    'stage_after_last_decision',
    'state_version',
    'source_turn_id',
    'created_at',
  ],
  mutable_fields: [],
  monotonicity: 'strict',
  has_ttl: false,
  consistency_notes:
    'Insert-only. state_version é incremental — nunca decresce. ' +
    'Campos soberanos do Core são projetados do core_decision_json; ' +
    'o Adapter nunca os calcula ou infere. Nenhuma linha de state é alterada após insert.',
} as const;

/**
 * 3. enova2_turn_events_v2 — trilha de turnos (append-only, imutável).
 *
 * WRITE STRATEGY: append
 *   - Cada turno gera exatamente 1 registro.
 *   - Nunca update, nunca delete.
 *
 * REPROCESS: ignore
 *   - Mesma idempotency_key: se já existe, retorna registro existente sem criar duplicata.
 *   - turn_sequence nunca decresce para o mesmo lead.
 *
 * IMUTABILIDADE: todos os campos são imutáveis após insert.
 */
export const POLICY_TURN_EVENTS: EntityConsistencyPolicy = {
  entity: 'enova2_turn_events_v2',
  write_strategy: 'append',
  reprocess_behavior: 'ignore',
  idempotency_key: 'idempotency_key',
  immutable_after_insert: [
    'turn_id',
    'lead_id',
    'idempotency_key',
    'channel_type',
    'raw_input_ref',
    'normalized_input_json',
    'semantic_package_json',
    'core_decision_json',
    'speech_contract_json',
    'turn_sequence',
    'created_at',
  ],
  mutable_fields: [],
  monotonicity: 'none',
  has_ttl: false,
  consistency_notes:
    'Append-only. Nunca update, nunca delete. ' +
    'Se idempotency_key já existe, o Adapter retorna o registro existente sem inserir novamente. ' +
    'turn_sequence é sempre crescente por lead — nunca decresce.',
} as const;

/**
 * 4. enova2_signal_records_v2 — sinais extraídos e persistíveis.
 *
 * WRITE STRATEGY: upsert (insert por (turn_id, signal_key); update restrito a status)
 *   - INSERT ao receber sinal novo de um turno: status inicial = 'pending'.
 *   - UPDATE somente do campo status (e timestamps de confirmação/rejeição).
 *   - signal_value_json e confidence_score são imutáveis após insert.
 *
 * REPROCESS: ignore
 *   - Mesma (turn_id, signal_key): se já existe, retorna existente sem alterar valor.
 *   - Status só progride — nunca regride.
 *
 * ACEITE: o Core decide (via core_decision_json). Adapter projeta a decisão — nunca a calcula.
 * REGRESSÃO PROIBIDA: accepted → pending é inválido. rejected → accepted é inválido.
 */
export const POLICY_SIGNALS: EntityConsistencyPolicy = {
  entity: 'enova2_signal_records_v2',
  write_strategy: 'upsert',
  reprocess_behavior: 'ignore',
  idempotency_key: '(turn_id, signal_key)',
  immutable_after_insert: [
    'signal_id',
    'turn_id',
    'lead_id',
    'signal_type',
    'signal_key',
    'signal_value_json',
    'confidence_score',
    'evidence_ref',
    'created_at',
  ],
  mutable_fields: ['status', 'confirmed_at', 'rejected_at'],
  monotonicity: 'terminal_states',
  has_ttl: false,
  consistency_notes:
    'signal_value_json é imutável após insert — valor nunca muda, só o status evolui. ' +
    'Estados terminais: accepted, rejected. ' +
    'Transições inválidas: accepted→pending, rejected→accepted, rejected→pending. ' +
    'O Adapter projeta o aceite declarado pelo Core — nunca decide por conta própria.',
} as const;

/**
 * 5. enova2_memory_runtime_v2 — memória viva curta (1:1 por lead, com TTL).
 *
 * WRITE STRATEGY: overwrite
 *   - 1 registro ativo por lead_id.
 *   - Cada upsert substitui completamente o registro anterior.
 *   - expires_at é OBRIGATÓRIO — ver Seção C para valores exatos.
 *
 * REPROCESS: replace
 *   - Mesmo lead_id: sempre substitui. A memória viva representa o estado mais recente.
 *   - Cada novo turno estende o TTL via novo upsert.
 *
 * LEITURA SE EXPIRADA:
 *   - Se expires_at < now: retorna found: false.
 *   - Dado expirado nunca é retornado como válido.
 *   - Dado expirado pode ser descartado (delete ou soft-delete) — não é evidência permanente.
 *
 * REFRESH: novo upsert a cada turno com expires_at = now + TTL_DEFAULT.
 * DESCARTE: após expirar, o registro pode ser deletado — não é audit trail.
 */
export const POLICY_MEMORY_RUNTIME: EntityConsistencyPolicy = {
  entity: 'enova2_memory_runtime_v2',
  write_strategy: 'overwrite',
  reprocess_behavior: 'replace',
  idempotency_key: 'lead_id',
  immutable_after_insert: ['memory_id', 'lead_id', 'created_at'],
  mutable_fields: [
    'memory_version',
    'open_questions_json',
    'open_objections_json',
    'useful_context_json',
    'next_turn_pending_json',
    'conversation_constraints_json',
    'expires_at',
    'updated_at',
  ],
  monotonicity: 'none',
  has_ttl: true,
  consistency_notes:
    'Memória viva NÃO é evidência permanente. Não é audit trail. ' +
    'Substituição completa a cada turno. ' +
    'memory_version é incremental (mas não é controle de versão — é apenas counter de substituições). ' +
    'Se expires_at < now: dado é inválido e não deve ser retornado. ' +
    'Ver MEMORY_RUNTIME_TTL_POLICY (Seção C) para valores exatos de TTL.',
} as const;

/**
 * 6. enova2_document_records_v2 — rastreamento de documentos.
 *
 * WRITE STRATEGY: upsert
 *   - 1 registro por (lead_id, doc_type).
 *   - Upsert: cria se não existe; atualiza status e storage_ref se existe.
 *   - Status só progride — nunca regride.
 *
 * REPROCESS: update (apenas campos mutáveis; nunca status para trás)
 *   - Mesmo (lead_id, doc_type): atualiza apenas campos que avançaram.
 *   - validated não pode voltar para received; received não pode voltar para requested.
 *
 * MONOTONICIDADE ESTRITA: requested → received → validated | rejected.
 *   validated e rejected são terminais — nenhum pode virar outro.
 */
export const POLICY_DOCUMENTS: EntityConsistencyPolicy = {
  entity: 'enova2_document_records_v2',
  write_strategy: 'upsert',
  reprocess_behavior: 'update',
  idempotency_key: '(lead_id, doc_type)',
  immutable_after_insert: ['document_id', 'lead_id', 'doc_type', 'created_at'],
  mutable_fields: [
    'doc_status',
    'storage_ref',
    'validation_notes_json',
    'source_turn_id',
    'requested_at',
    'received_at',
    'validated_at',
    'updated_at',
  ],
  monotonicity: 'strict',
  has_ttl: false,
  consistency_notes:
    'Status monotônico: requested → received → (validated | rejected). ' +
    'validated e rejected são terminais e mutuamente exclusivos. ' +
    'O Adapter NUNCA regride status. Se status novo é menor que status atual, ignora. ' +
    'storage_ref = referência ao storage; nunca o conteúdo bruto do documento.',
} as const;

/**
 * 7. enova2_dossier_v2 — dossiê consolidado (1:1 por lead).
 *
 * WRITE STRATEGY: overwrite
 *   - 1 registro por lead_id.
 *   - Recompilação substitui completamente — compilação mais recente é a válida.
 *   - ready_for_visit e ready_for_broker_handoff: campos soberanos do Core.
 *
 * REPROCESS: replace
 *   - Mesmo lead_id: recompilação sempre substitui o dossiê anterior.
 *   - Adapter nunca calcula ready_for_visit ou ready_for_broker_handoff — projeta do Core.
 *
 * CONFLITO: compiled_at mais recente vence. Adapter não tem mecanismo de conflito além disso.
 */
export const POLICY_DOSSIER: EntityConsistencyPolicy = {
  entity: 'enova2_dossier_v2',
  write_strategy: 'overwrite',
  reprocess_behavior: 'replace',
  idempotency_key: 'lead_id',
  immutable_after_insert: ['dossier_id', 'lead_id', 'created_at'],
  mutable_fields: [
    'dossier_status',
    'dossier_summary_json',
    'required_docs_json',
    'ready_for_visit',
    'ready_for_broker_handoff',
    'compiled_at',
    'updated_at',
  ],
  monotonicity: 'none',
  has_ttl: false,
  consistency_notes:
    'Substituição completa a cada recompilação. ' +
    'ready_for_visit e ready_for_broker_handoff são soberanos do Core — ' +
    'o Adapter projeta do payload; nunca os calcula. ' +
    'dossier_status não é monotônico: pode regredir se recompilação indica regressão real ' +
    '(ex.: documento invalidado). A recompilação é sempre o estado mais recente e completo.',
} as const;

/**
 * 8. enova2_visit_schedule_v2 — agendamento/interesse de visita.
 *
 * WRITE STRATEGY: append
 *   - Cada nova declaração de interesse de visita gera um novo registro.
 *   - Um lead pode ter múltiplas visitas ao longo do tempo.
 *
 * REPROCESS: ignore
 *   - Mesmo (lead_id, source_turn_id): se já existe visita originada neste turno, ignora.
 *   - Status evolui via updateVisitStatus — não via novo insert.
 *
 * MONOTONICIDADE: pending → scheduled → confirmed | cancelled | completed.
 *   confirmed, cancelled e completed são terminais.
 *   cancelled não pode virar scheduled. confirmed não pode virar cancelled após confirmado.
 *
 * AUTORIZAÇÃO: Core autoriza via visit_interest no semantic_package ou core_decision_json.
 *   Adapter persiste — nunca decide o agendamento.
 */
export const POLICY_VISIT_SCHEDULE: EntityConsistencyPolicy = {
  entity: 'enova2_visit_schedule_v2',
  write_strategy: 'append',
  reprocess_behavior: 'ignore',
  idempotency_key: '(lead_id, source_turn_id)',
  immutable_after_insert: ['visit_id', 'lead_id', 'source_turn_id', 'created_at'],
  mutable_fields: [
    'visit_status',
    'scheduled_at',
    'location_ref',
    'confirmation_notes_json',
    'updated_at',
  ],
  monotonicity: 'terminal_states',
  has_ttl: false,
  consistency_notes:
    'Cada interesse de visita declarado num turno gera 1 registro. ' +
    'Estados terminais: confirmed, cancelled, completed. ' +
    'O Adapter nunca decide o agendamento — apenas persiste a autorização do Core. ' +
    'Mudança de status deve sempre gerar também um evento em enova2_operational_history_v2.',
} as const;

/**
 * 9. enova2_operational_history_v2 — histórico auditável (append-only permanente).
 *
 * WRITE STRATEGY: append
 *   - Nunca update, nunca delete.
 *   - Um evento por ação relevante de qualquer layer.
 *   - Sem TTL — é o audit trail permanente da frente.
 *
 * REPROCESS: ignore
 *   - Mesmo (lead_id, turn_id, event_type): se já existe, ignora (não duplica).
 *   - turn_id pode ser null para eventos de sistema sem turno associado.
 *
 * IMUTABILIDADE: todos os campos são imutáveis após insert.
 */
export const POLICY_OPERATIONAL_HISTORY: EntityConsistencyPolicy = {
  entity: 'enova2_operational_history_v2',
  write_strategy: 'append',
  reprocess_behavior: 'ignore',
  idempotency_key: '(lead_id, turn_id, event_type)',
  immutable_after_insert: [
    'history_id',
    'lead_id',
    'turn_id',
    'event_type',
    'actor_layer',
    'event_payload_json',
    'occurred_at',
    'created_at',
  ],
  mutable_fields: [],
  monotonicity: 'none',
  has_ttl: false,
  consistency_notes:
    'Audit trail permanente — nunca pode ser alterado nem deletado. ' +
    'event_payload_json contém apenas campos operacionais relevantes — ' +
    'não dumps textuais nem texto bruto. ' +
    'Usar para rastrear: transições de stage, sinais aceitos, documentos recebidos/validados, ' +
    'visitas agendadas, compilações de dossiê, atualizações de projeção.',
} as const;

/**
 * 10. enova2_projection_bridge_v2 — projeção de compatibilidade para ENOVA 1.
 *
 * WRITE STRATEGY: overwrite
 *   - 1 registro por (lead_id, target_system).
 *   - Cada projeção substitui a anterior — a mais recente é a válida.
 *   - target_system: apenas 'enova1' autorizado nesta PR.
 *
 * REPROCESS: replace
 *   - Mesmo (lead_id, target_system): nova projeção substitui completamente.
 *
 * MAPA DE CAMPOS: apenas campos do mapa de compatibilidade explícito (Seção D).
 *   Campos proibidos nunca entram em projection_payload_json.
 */
export const POLICY_PROJECTION_BRIDGE: EntityConsistencyPolicy = {
  entity: 'enova2_projection_bridge_v2',
  write_strategy: 'overwrite',
  reprocess_behavior: 'replace',
  idempotency_key: '(lead_id, target_system)',
  immutable_after_insert: ['projection_id', 'lead_id', 'target_system', 'created_at'],
  mutable_fields: [
    'projection_payload_json',
    'projection_status',
    'last_projection_at',
    'updated_at',
  ],
  monotonicity: 'none',
  has_ttl: false,
  consistency_notes:
    'Apenas campos explicitamente mapeados em PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS ' +
    'podem entrar em projection_payload_json. ' +
    'O Adapter nunca projeta campos livres, dumps ou campos não mapeados. ' +
    'Não alimenta raciocínio nem fala — serve exclusivamente para convivência com ENOVA 1.',
} as const;

/** Mapa consolidado: entidade → política. */
export const ENTITY_CONSISTENCY_POLICY: Record<string, EntityConsistencyPolicy> = {
  enova2_lead: POLICY_LEAD,
  enova2_lead_state_v2: POLICY_LEAD_STATE,
  enova2_turn_events_v2: POLICY_TURN_EVENTS,
  enova2_signal_records_v2: POLICY_SIGNALS,
  enova2_memory_runtime_v2: POLICY_MEMORY_RUNTIME,
  enova2_document_records_v2: POLICY_DOCUMENTS,
  enova2_dossier_v2: POLICY_DOSSIER,
  enova2_visit_schedule_v2: POLICY_VISIT_SCHEDULE,
  enova2_operational_history_v2: POLICY_OPERATIONAL_HISTORY,
  enova2_projection_bridge_v2: POLICY_PROJECTION_BRIDGE,
} as const;

// ===========================================================================
// SEÇÃO C — TTL da memória viva (numérico e explícito)
// ===========================================================================

/**
 * Política de TTL da memória viva (enova2_memory_runtime_v2).
 *
 * TTL_DEFAULT_HOURS: TTL padrão aplicado em todo upsert normal.
 * TTL_EXTENDED_HOURS: TTL estendido quando há pendências críticas abertas
 *   (ex.: open_questions_json ou next_turn_pending_json não vazios).
 * TTL_MINIMUM_HOURS: nunca definir expires_at abaixo deste valor.
 * TTL_MAXIMUM_HOURS: nunca exceder este valor, mesmo com extensão.
 *
 * REGRA DE LEITURA SE EXPIRADA:
 *   Se getActiveMemory retornar record com expires_at < now:
 *   → retornar { found: false, record: null, error: 'memory_expired' }
 *   → nunca usar dado expirado como contexto válido para o próximo turno.
 *
 * REGRA DE REFRESH:
 *   Cada chamada a upsertMemoryRuntime deve:
 *   → definir expires_at = now + TTL_DEFAULT_HOURS (padrão)
 *   → ou now + TTL_EXTENDED_HOURS se next_turn_pending_json ou open_questions_json não estiverem vazios.
 *
 * REGRA DE DESCARTE:
 *   Memória expirada pode ser deletada a qualquer momento.
 *   Não é evidência operacional permanente — não integra audit trail.
 *   Antes de descartar: verificar que nenhum signal_record dependente está em status 'pending'.
 */
export const MEMORY_RUNTIME_TTL_POLICY = {
  /**
   * TTL padrão: 48 horas.
   * Aplicado em todo upsert normal sem pendências críticas abertas.
   */
  TTL_DEFAULT_HOURS: 48,

  /**
   * TTL estendido: 72 horas.
   * Aplicado quando next_turn_pending_json ou open_questions_json não estão vazios.
   */
  TTL_EXTENDED_HOURS: 72,

  /**
   * TTL mínimo: 24 horas.
   * Nenhum expires_at pode ser definido abaixo de now + 24h.
   */
  TTL_MINIMUM_HOURS: 24,

  /**
   * TTL máximo absoluto: 72 horas.
   * Nenhuma extensão pode superar este valor a partir do momento de escrita.
   */
  TTL_MAXIMUM_HOURS: 72,

  /** Motivo: memória viva é contexto temporário — não evidência permanente. */
  rationale:
    'A memória viva existe para o próximo raciocínio do LLM, não para auditoria. ' +
    '48h é suficiente para a janela operacional normal de um lead. ' +
    '72h cobre casos com pendências críticas sem permitir acúmulo indefinido. ' +
    'Evidências permanentes ficam em enova2_signal_records_v2 (accepted) e ' +
    'enova2_operational_history_v2.',

  /** Regra de leitura expirada. */
  expired_read_rule:
    'Se expires_at < now: retornar found: false. Nunca usar dado expirado.',

  /** Regra de refresh. */
  refresh_rule:
    'Cada upsertMemoryRuntime define expires_at = now + TTL_DEFAULT_HOURS. ' +
    'Se next_turn_pending_json ou open_questions_json não estiverem vazios: ' +
    'expires_at = now + TTL_EXTENDED_HOURS (máximo TTL_MAXIMUM_HOURS).',

  /** Regra de descarte. */
  discard_rule:
    'Após expirar: registro pode ser deletado. ' +
    'Verificar antes: nenhum signal_record pendente depende desta memória. ' +
    'Não é audit trail — descarte não gera evento em operational_history.',
} as const;

// ===========================================================================
// SEÇÃO D — Projection bridge: mapa de compatibilidade ENOVA 1
// ===========================================================================

/**
 * Campos PERMITIDOS em projection_payload_json para target_system = 'enova1'.
 *
 * Regra: apenas sinais ACEITOS pelo Core podem alimentar a projeção.
 * Regra: campos soberanos do Core são projetados diretamente do state.
 * Regra: campos de memória viva NUNCA entram na projeção (são temporários).
 *
 * Fonte de cada campo:
 *   external_ref        — de enova2_lead (identificador do canal)
 *   stage_current       — de enova2_lead_state_v2 (soberano do Core)
 *   customer_name       — de enova2_lead (apenas se confirmado por sinal aceito)
 *   monthly_income_declared  — de enova2_signal_records_v2 (apenas signal aceito)
 *   marital_status_declared  — de enova2_signal_records_v2 (apenas signal aceito)
 *   ready_for_visit     — de enova2_dossier_v2 (soberano do Core)
 *   ready_for_broker_handoff — de enova2_dossier_v2 (soberano do Core)
 *   last_projected_at   — timestamp da última projeção bem-sucedida
 */
export const PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS = [
  'external_ref',
  'stage_current',
  'customer_name',
  'monthly_income_declared',
  'marital_status_declared',
  'ready_for_visit',
  'ready_for_broker_handoff',
  'last_projected_at',
] as const;

export type ProjectionBridgeEnova1AllowedField =
  typeof PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS[number];

/**
 * Campos PROIBIDOS em projection_payload_json — nunca podem entrar na projeção.
 *
 * Motivo: evitar vazar dados internos de raciocínio, contexto temporário,
 * dados não confirmados, ou payloads completos de layers internas.
 */
export const PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS = [
  'ai_response_text',         // texto final da IA — proibido em toda projeção
  'raw_input_ref',            // referência a input bruto
  'normalized_input_json',    // input normalizado — dado interno de processamento
  'semantic_package_json',    // pacote semântico completo — dado interno da Frente 3
  'core_decision_json',       // decisão completa do Core — dado interno
  'speech_contract_json',     // contrato de speech — dado interno da Frente 2
  'open_questions_json',      // memória viva — temporária, não é estado permanente
  'open_objections_json',     // memória viva — temporária
  'next_turn_pending_json',   // memória viva — temporária
  'conversation_constraints_json', // memória viva — temporária
  'policy_flags_json',        // flags internas de política — não devem vazar
  'risk_flags_json',          // flags de risco internas — não devem vazar
  'signal_value_json',        // valor bruto de sinal — não projeta campo raw, projeta campo semântico
  'evidence_ref',             // referência de evidência — dado interno
  'event_payload_json',       // payload de histórico — dado interno
  'pending_signals',          // sinais pendentes — não confirmados, não podem vazar
  'rejected_signals',         // sinais rejeitados — não devem alimentar ENOVA 1
] as const;

export type ProjectionBridgeEnova1ProhibitedField =
  typeof PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS[number];

/**
 * Política completa do projection_bridge para ENOVA 1.
 *
 * TARGET: apenas 'enova1' autorizado nesta PR.
 * WRITE: overwrite (ver POLICY_PROJECTION_BRIDGE)
 * CAMPOS: apenas PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS
 * FONTE: apenas sinais aceitos + campos soberanos do Core + identidade do lead
 * PROPÓSITO: convivência com ENOVA 1 — não alimenta raciocínio nem fala
 */
export const PROJECTION_BRIDGE_POLICY = {
  /** Único alvo de projeção autorizado nesta PR. */
  target_system: 'enova1' as const,

  /** Campos permitidos na projeção. */
  allowed_fields: PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS,

  /** Campos proibidos — nunca devem aparecer em projection_payload_json. */
  prohibited_fields: PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS,

  /**
   * Mapa mínimo de compatibilidade ENOVA 1 → ENOVA 2.
   * Define qual campo do ENOVA 2 alimenta qual campo esperado pelo ENOVA 1.
   */
  compatibility_map: {
    /** Identificador externo do lead — mesmo canal de entrada. */
    external_ref: {
      enova2_source: 'enova2_lead.external_ref',
      condition: 'always',
    },
    /** Stage atual do lead — soberano do Core. */
    stage_current: {
      enova2_source: 'enova2_lead_state_v2.stage_current (max state_version)',
      condition: 'always — reflete último estado do Core',
    },
    /** Nome do cliente — apenas se confirmado por sinal aceito. */
    customer_name: {
      enova2_source: 'enova2_lead.customer_name',
      condition: 'apenas se signal_key=customer_name com status=accepted existir',
    },
    /** Renda declarada — apenas sinal aceito. */
    monthly_income_declared: {
      enova2_source: "enova2_signal_records_v2 WHERE signal_key='monthly_income' AND status='accepted'",
      condition: 'apenas se sinal aceito existir — nunca de sinal pendente',
    },
    /** Estado civil — apenas sinal aceito. */
    marital_status_declared: {
      enova2_source: "enova2_signal_records_v2 WHERE signal_key='marital_status' AND status='accepted'",
      condition: 'apenas se sinal aceito existir — nunca de sinal pendente',
    },
    /** Flag de prontidão para visita — soberana do Core. */
    ready_for_visit: {
      enova2_source: 'enova2_dossier_v2.ready_for_visit',
      condition: 'apenas se dossiê compilado existir',
    },
    /** Flag de prontidão para handoff ao corretor — soberana do Core. */
    ready_for_broker_handoff: {
      enova2_source: 'enova2_dossier_v2.ready_for_broker_handoff',
      condition: 'apenas se dossiê compilado existir',
    },
    /** Timestamp da última projeção bem-sucedida. */
    last_projected_at: {
      enova2_source: 'timestamp do momento do upsert da projeção',
      condition: 'sempre preenchido quando projeção é executada',
    },
  } as const,

  /** Regra de segurança: validar before write. */
  pre_write_validation:
    'Antes de qualquer upsertProjection, o Adapter DEVE verificar que ' +
    'nenhum campo de projection_payload_json está em PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS. ' +
    'Se campo proibido detectado: rejeitar write, registrar em operational_history com ' +
    "event_type='projection_updated' e event_payload_json incluindo { rejected_field, reason }.",

  /** Propósito declarado — o que a projeção pode e não pode fazer. */
  purpose:
    'Convivência controlada com ENOVA 1. ' +
    'NÃO alimenta raciocínio nem fala da ENOVA 2. ' +
    'NÃO é fonte de verdade de nenhuma decisão. ' +
    'É uma projeção unidirecional: ENOVA 2 → ENOVA 1.',
} as const;

// ===========================================================================
// SEÇÃO E — Monotonicidade de status por entidade
// ===========================================================================

/**
 * Tabela de monotonicidade de status.
 *
 * Define quais transições são válidas e quais são inválidas.
 * O Adapter NUNCA realiza transições inválidas.
 * Se uma transição inválida for tentada: ignorar e registrar em operational_history.
 */
export const STATUS_MONOTONICITY = {
  enova2_lead: {
    field: 'status',
    monotonicity: 'strict' as const,
    valid_transitions: [
      ['active', 'inactive'],
      ['inactive', 'archived'],
      ['active', 'archived'],
    ],
    terminal_states: ['archived'],
    invalid_transitions: [
      ['archived', 'active'],
      ['archived', 'inactive'],
      ['inactive', 'active'],
    ],
    rule:
      'status só progride: active → inactive → archived. ' +
      'archived é terminal — nunca volta para active ou inactive.',
  },

  enova2_signal_records_v2: {
    field: 'status',
    monotonicity: 'terminal_states' as const,
    valid_transitions: [
      ['pending', 'requires_confirmation'],
      ['pending', 'slot_candidate'],
      ['pending', 'accepted'],
      ['pending', 'rejected'],
      ['requires_confirmation', 'accepted'],
      ['requires_confirmation', 'rejected'],
      ['slot_candidate', 'accepted'],
      ['slot_candidate', 'rejected'],
    ],
    terminal_states: ['accepted', 'rejected'],
    invalid_transitions: [
      ['accepted', 'pending'],
      ['accepted', 'requires_confirmation'],
      ['accepted', 'rejected'],
      ['rejected', 'pending'],
      ['rejected', 'accepted'],
    ],
    rule:
      'accepted e rejected são terminais. ' +
      'O Adapter nunca reverte um aceite ou uma rejeição. ' +
      'O aceite é soberano do Core — o Adapter projeta.',
  },

  enova2_document_records_v2: {
    field: 'doc_status',
    monotonicity: 'strict' as const,
    valid_transitions: [
      ['requested', 'received'],
      ['received', 'validated'],
      ['received', 'rejected'],
    ],
    terminal_states: ['validated', 'rejected'],
    invalid_transitions: [
      ['validated', 'received'],
      ['validated', 'requested'],
      ['validated', 'rejected'],
      ['rejected', 'validated'],
      ['rejected', 'received'],
      ['received', 'requested'],
    ],
    rule:
      'requested → received → (validated | rejected). ' +
      'validated e rejected são terminais mutuamente exclusivos. ' +
      'O Adapter nunca regride status de documento.',
  },

  enova2_visit_schedule_v2: {
    field: 'visit_status',
    monotonicity: 'terminal_states' as const,
    valid_transitions: [
      ['pending', 'scheduled'],
      ['pending', 'cancelled'],
      ['scheduled', 'confirmed'],
      ['scheduled', 'cancelled'],
      ['confirmed', 'completed'],
    ],
    terminal_states: ['confirmed', 'cancelled', 'completed'],
    invalid_transitions: [
      ['confirmed', 'cancelled'],
      ['cancelled', 'scheduled'],
      ['cancelled', 'confirmed'],
      ['completed', 'cancelled'],
      ['completed', 'confirmed'],
    ],
    rule:
      'pending → scheduled → (confirmed | cancelled). confirmed → completed. ' +
      'confirmed, cancelled e completed são terminais. ' +
      'O Adapter nunca decide o agendamento — apenas persiste a autorização do Core.',
  },
} as const;

// ===========================================================================
// SEÇÃO F — Tabela-resumo: comportamento por entidade
// ===========================================================================

/**
 * Tabela-resumo de comportamento por entidade.
 *
 * Esta tabela é a referência rápida para PR 44 implementar o runtime correto.
 * Cada linha responde:
 *   - Qual estratégia de escrita?
 *   - Append, merge, overwrite ou upsert?
 *   - O que acontece no reprocessamento?
 *   - Há status monotônico?
 *   - Há TTL?
 *   - O que nunca pode regredir?
 */
export const POLICY_SUMMARY = [
  {
    entity: 'enova2_lead',
    write_strategy: 'upsert' as WriteStrategy,
    reprocess: 'ignore' as ReprocessBehavior,
    append_only: false,
    monotonic_status: true,
    has_ttl: false,
    never_regresses: 'lead_id, external_ref, created_at, status (archived é terminal)',
    notes: 'Dados mutáveis só via sinal aceito do Core.',
  },
  {
    entity: 'enova2_lead_state_v2',
    write_strategy: 'insert_versioned' as WriteStrategy,
    reprocess: 'ignore' as ReprocessBehavior,
    append_only: true,
    monotonic_status: false,
    has_ttl: false,
    never_regresses: 'state_version (sempre cresce), campos soberanos do Core (imutáveis após insert)',
    notes: 'Insert sempre. state_version++ a cada novo estado. Campos soberanos projetados do Core.',
  },
  {
    entity: 'enova2_turn_events_v2',
    write_strategy: 'append' as WriteStrategy,
    reprocess: 'ignore' as ReprocessBehavior,
    append_only: true,
    monotonic_status: false,
    has_ttl: false,
    never_regresses: 'todos os campos (imutáveis após insert), turn_sequence (sempre cresce)',
    notes: 'Nunca update, nunca delete. Idempotente por idempotency_key.',
  },
  {
    entity: 'enova2_signal_records_v2',
    write_strategy: 'upsert' as WriteStrategy,
    reprocess: 'ignore' as ReprocessBehavior,
    append_only: false,
    monotonic_status: true,
    has_ttl: false,
    never_regresses: 'signal_value_json, confidence_score, evidence_ref (imutáveis), status accepted/rejected (terminal)',
    notes: 'Valor imutável. Status evolui. Aceite é soberano do Core.',
  },
  {
    entity: 'enova2_memory_runtime_v2',
    write_strategy: 'overwrite' as WriteStrategy,
    reprocess: 'replace' as ReprocessBehavior,
    append_only: false,
    monotonic_status: false,
    has_ttl: true,
    never_regresses: 'N/A — dado temporário sem garantia de permanência',
    notes: 'TTL: 48h padrão, 72h com pendências. Expirado → found: false.',
  },
  {
    entity: 'enova2_document_records_v2',
    write_strategy: 'upsert' as WriteStrategy,
    reprocess: 'update' as ReprocessBehavior,
    append_only: false,
    monotonic_status: true,
    has_ttl: false,
    never_regresses: 'doc_status (validated e rejected são terminais)',
    notes: 'Status nunca regride. storage_ref = referência, nunca conteúdo bruto.',
  },
  {
    entity: 'enova2_dossier_v2',
    write_strategy: 'overwrite' as WriteStrategy,
    reprocess: 'replace' as ReprocessBehavior,
    append_only: false,
    monotonic_status: false,
    has_ttl: false,
    never_regresses: 'campos soberanos do Core (ready_for_visit, ready_for_broker_handoff) são projetados, nunca calculados',
    notes: 'Recompilação substitui. compiled_at mais recente é a verdade.',
  },
  {
    entity: 'enova2_visit_schedule_v2',
    write_strategy: 'append' as WriteStrategy,
    reprocess: 'ignore' as ReprocessBehavior,
    append_only: true,
    monotonic_status: true,
    has_ttl: false,
    never_regresses: 'status (confirmed, cancelled, completed são terminais)',
    notes: 'Múltiplas visitas por lead são possíveis. Core autoriza — Adapter persiste.',
  },
  {
    entity: 'enova2_operational_history_v2',
    write_strategy: 'append' as WriteStrategy,
    reprocess: 'ignore' as ReprocessBehavior,
    append_only: true,
    monotonic_status: false,
    has_ttl: false,
    never_regresses: 'todos os campos (audit trail permanente, nunca update/delete)',
    notes: 'Audit trail absoluto. Nunca pode ser modificado ou deletado.',
  },
  {
    entity: 'enova2_projection_bridge_v2',
    write_strategy: 'overwrite' as WriteStrategy,
    reprocess: 'replace' as ReprocessBehavior,
    append_only: false,
    monotonic_status: false,
    has_ttl: false,
    never_regresses: 'campos proibidos nunca entram na projeção',
    notes: 'Apenas campos do mapa de compatibilidade. Só target enova1 autorizado.',
  },
] as const;

// ===========================================================================
// Exportação do módulo de política — objeto canônico unificado
// ===========================================================================

/**
 * Política completa do Adapter — PR 43.
 *
 * Único ponto de importação para PR 44 implementar o runtime correto.
 */
export const ADAPTER_CONSISTENCY_POLICY = {
  /** Política por entidade (10 entidades). */
  entities: ENTITY_CONSISTENCY_POLICY,

  /** TTL da memória viva. */
  memory_runtime_ttl: MEMORY_RUNTIME_TTL_POLICY,

  /** Política da projection_bridge para ENOVA 1. */
  projection_bridge: PROJECTION_BRIDGE_POLICY,

  /** Monotonicidade de status por entidade. */
  status_monotonicity: STATUS_MONOTONICITY,

  /** Tabela-resumo de comportamento. */
  summary: POLICY_SUMMARY,

  /** Metadados da política. */
  meta: {
    version: '1.0.0',
    pr: 'PR 43',
    frente: 'Frente 4 — Supabase Adapter e Persistência',
    descricao:
      'Política canônica de consistência do Adapter. ' +
      'Define append/merge/overwrite/upsert por entidade, TTL da memória viva ' +
      'e mapa de compatibilidade para projection_bridge.',
    created_at: '2026-04-21',
    anchor:
      'CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md seção 13 (PR 43) + ' +
      'FRENTE4_PERSISTABLE_DATA_CONTRACT.md (PR 41)',
    nota_implementacao:
      'PR 44 implementa o runtime que RESPEITA esta política. ' +
      'Este arquivo é declarativo — não contém lógica de negócio.',
  },
} as const;
