/**
 * ENOVA 2 — Supabase Adapter — Boundaries e Ownership de Escrita (PR 42)
 *
 * Âncora contratual:
 *   FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 8 (Ownership consolidado por camada)
 *   CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seção 6 (Princípios obrigatórios)
 *   A00 — seção 8.7 (Persistence Adapter)
 *
 * ESCOPO: declaração explícita de:
 *   - Qual é o papel soberano do Adapter na arquitetura
 *   - Quais layers podem chamar o Adapter
 *   - Quais layers NÃO podem escrever diretamente nas tabelas enova2_*
 *   - Quais campos são soberanos do Core (Adapter projeta, nunca calcula)
 *   - Ownership de escrita por entidade
 *   - Constraints canônicas declaradas em código
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo é documentação de contrato em código.
 * Nenhuma lógica de negócio aqui. Nenhuma decisão de stage ou gate.
 */

// ---------------------------------------------------------------------------
// Papel soberano do Adapter
// ---------------------------------------------------------------------------

/**
 * O Adapter é a única camada com permissão de escrever nas tabelas enova2_*.
 *
 * Funções do Adapter:
 *   - Traduzir payloads do Core em estado persistido
 *   - Traduzir pacotes semânticos da Frente 3 em sinais e memória viva
 *   - Manter trilha auditável de turnos e eventos
 *   - Projetar compatibilidade com ENOVA 1
 *
 * O Adapter NÃO:
 *   - Escreve resposta ao cliente
 *   - Decide regra de negócio, gate ou stage
 *   - Calcula campos soberanos do Core (stage, next_objective, block_advance, policy_flags)
 *   - Infere dados não confirmados pelo Core como estado canônico
 *
 * Fonte: A00 seção 8.7 + CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md seção 6
 */
export const ADAPTER_ROLE = {
  sovereign_scope: 'persistence_only',
  may_write_customer_text: false,
  may_decide_business_rule: false,
  may_define_stage: false,
  may_define_next_objective: false,
  may_define_gate: false,
} as const;

// ---------------------------------------------------------------------------
// Layers que PODEM chamar o Adapter
// ---------------------------------------------------------------------------

/**
 * Layers autorizados a chamar operações do Adapter.
 *
 * Regra: qualquer layer que produza um payload estruturado para persistência
 * pode chamar o Adapter — mas apenas o Adapter persiste.
 *
 * Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 8
 */
export const ADAPTER_ALLOWED_CALLERS = [
  'worker',          // Cloudflare Worker — orquestra o ciclo de turno
  'core_mechanical', // Core Mecânico — entrega payload de decisão para o Adapter projetar
  'async_worker',    // Worker assíncrono — para eventos fora do ciclo síncrono
  'human_admin',     // Interface admin — apenas doc_status, dossier_status, visit_status
] as const;

export type AdapterAllowedCaller = typeof ADAPTER_ALLOWED_CALLERS[number];

// ---------------------------------------------------------------------------
// Layers que NÃO PODEM escrever diretamente nas tabelas enova2_*
// ---------------------------------------------------------------------------

/**
 * Estas layers NÃO têm permissão de escrita direta nas tabelas enova2_*.
 * Se precisarem persistir algo, DEVEM passar pelo Adapter.
 *
 * Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 8
 */
export const ADAPTER_PROHIBITED_DIRECT_WRITERS = [
  'context_extraction', // Frente 3 — entrega semantic_package ao Worker/Adapter, não escreve direto
  'speech_engine',      // Frente 2 — entrega speech_contract ao Worker/Adapter, não escreve direto
  'llm_layer',          // LLM/IA — soberana na fala, não tem acesso a persistência
  'media_pipeline',     // Frente 5 — processa áudio/mídia, entrega ao Adapter (fora desta PR)
  'channel_adapter',    // Frente 6 — adapta canal, não persiste dado operacional direto
] as const;

export type AdapterProhibitedDirectWriter = typeof ADAPTER_PROHIBITED_DIRECT_WRITERS[number];

// ---------------------------------------------------------------------------
// Campos soberanos do Core — não calculados pelo Adapter
// ---------------------------------------------------------------------------

/**
 * O Adapter PROJETA estes campos a partir do payload do Core.
 * O Adapter NUNCA os calcula, infere ou sobrescreve por conta própria.
 *
 * Quando o Adapter recebe o core_decision_json de um turno, ele extrai
 * estes campos e os persiste em enova2_lead_state_v2 e enova2_dossier_v2.
 * O Adapter não toma nenhuma decisão sobre estes valores.
 *
 * Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 9.1
 */
export const CORE_SOVEREIGN_FIELDS = [
  'stage_current',
  'next_objective',
  'block_advance',
  'policy_flags_json',
  'ready_for_visit',
  'ready_for_broker_handoff',
] as const;

export type CoreSovereignField = typeof CORE_SOVEREIGN_FIELDS[number];

// ---------------------------------------------------------------------------
// Ownership de escrita por entidade
// ---------------------------------------------------------------------------

/**
 * Mapa de ownership de escrita por entidade persistível.
 * Única fonte de verdade sobre quem origina cada dado.
 *
 * Regra: writer = 'adapter' para todas as 10 entidades.
 * Nenhuma outra layer escreve diretamente.
 *
 * Fonte: FRENTE4_PERSISTABLE_DATA_CONTRACT.md — seção 8
 */
export const ADAPTER_WRITE_OWNERSHIP = {
  enova2_lead: {
    writer: 'adapter',
    data_originator: 'adapter_on_first_turn',
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_lead_state_v2: {
    writer: 'adapter',
    data_originator: 'core_via_payload',
    sovereign_fields_from_core: ['stage_current', 'next_objective', 'block_advance', 'policy_flags_json'],
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_turn_events_v2: {
    writer: 'adapter',
    data_originator: 'all_layers_via_adapter',
    append_only: true,
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_signal_records_v2: {
    writer: 'adapter',
    data_originator: 'context_extraction_via_semantic_package',
    status_decider: 'core_via_decision_payload',
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_memory_runtime_v2: {
    writer: 'adapter',
    data_originator: 'adapter_consolidates_per_turn',
    ttl_required: true,
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_document_records_v2: {
    writer: 'adapter',
    data_originator: 'core_signals_document_request',
    validator: 'human_or_core_rule',
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_dossier_v2: {
    writer: 'adapter',
    data_originator: 'adapter_compiles_from_accepted_signals',
    ready_flags_from_core: true,
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_visit_schedule_v2: {
    writer: 'adapter',
    data_originator: 'core_authorizes_visit_interest',
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_operational_history_v2: {
    writer: 'adapter',
    data_originator: 'all_layers_via_adapter',
    append_only: true,
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
  enova2_projection_bridge_v2: {
    writer: 'adapter',
    data_originator: 'adapter_maps_accepted_signals',
    target_restricted_to: ['enova1'] as const,
    forbidden_direct_writers: ADAPTER_PROHIBITED_DIRECT_WRITERS,
  },
} as const;

// ---------------------------------------------------------------------------
// Constraints canônicas do Adapter — declaradas em código
// ---------------------------------------------------------------------------

/**
 * Constraints canônicas do Adapter.
 * Declaradas explicitamente em cada instância de SupabaseAdapterBase.
 *
 * Fonte: CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md — seções 6, 16 e 22
 */
export const ADAPTER_CANONICAL_CONSTRAINTS = [
  'adapter_nao_escreve_resposta_ao_cliente',
  'adapter_nao_decide_regra_de_negocio',
  'adapter_nao_define_stage_ou_gate',
  'adapter_nao_calcula_campos_soberanos_do_core',
  'speech_nao_escreve_direto_nas_tabelas',
  'context_extracao_nao_escreve_direto_nas_tabelas',
  'llm_nao_tem_acesso_a_persistencia',
  'escrita_centralizada_no_adapter',
  'sem_canal_externo_nesta_pr',
  'sem_audio_nesta_pr',
  'sem_meta_whatsapp_nesta_pr',
] as const;

export type AdapterCanonicalConstraint = typeof ADAPTER_CANONICAL_CONSTRAINTS[number];
