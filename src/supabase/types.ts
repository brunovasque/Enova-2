/**
 * ENOVA 2 — Supabase operacional controlado (PR-T8.8)
 *
 * Tipos canônicos da camada Supabase. Esta camada é READ-ORIENTED.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Service role só pode existir server-side (Worker).
 *   - Painel jamais acessa Supabase direto.
 *   - Sem alteração de schema, RLS, bucket ou policy.
 *   - Sem reset/delete real.
 *   - Escrita real protegida por flag e schema confirmado; quando schema
 *     real diverge do contrato CRM, escrita cai em in-memory (PR-T8.4).
 *
 * Âncora contratual:
 *   schema/diagnostics/T8_SUPABASE_DIAGNOSTICO.md (PR-T8.7)
 *   schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md §PR-T8.8
 */

export type SupabaseMode = 'in_process_backend' | 'supabase_real';

export interface SupabaseEnv {
  SUPABASE_REAL_ENABLED?: unknown;
  SUPABASE_URL?: unknown;
  SUPABASE_SERVICE_ROLE_KEY?: unknown;
}

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export interface SupabaseReadiness {
  mode: SupabaseMode;
  flag_enabled: boolean;
  env_url_present: boolean;
  env_service_role_present: boolean;
  ready: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Catálogo de tabelas reais conhecidas (declarado no DDL export do Vasques).
 * Usado para readiness/diagnóstico no painel — NUNCA para alterar schema.
 */
export const SUPABASE_KNOWN_TABLES = [
  'crm_lead_meta',
  'crm_override_log',
  'crm_stage_history',
  'enova_state',
  'enova_log',
  'enova_docs',
  'enova_document_files',
  'enova_document_events',
  'enova_docs_status',
  'enova_docs_pendencias',
  'enova_correspondente_packets',
  'enova_correspondente_queue',
  'enova_attendance_meta',
  'enova_prefill_meta',
  'enova_incidents',
  'enova_telemetry',
  'enova_kb',
  'enova_faqs',
  'enova_prompts',
  'enova_kv',
  'enavia_brain_modules',
  'lead_auditoria',
  'lead_timeline_events',
  'leads_unificados',
  'leads_funil',
  'atendimentos',
  'chat_history',
  'chat_history_whatsapp',
  'orchestrator_executions',
  'orchestrator_workflows',
] as const;

export type SupabaseKnownTable = (typeof SUPABASE_KNOWN_TABLES)[number];

/**
 * Tabelas com RLS desativado declarado por Vasques (DDL export).
 * Estas geram warning de readiness — nunca bloqueio.
 */
export const SUPABASE_RLS_DISABLED_TABLES: readonly string[] = [
  'crm_lead_meta',
  'crm_override_log',
  'crm_stage_history',
  'enova_docs',
  'enova_document_files',
  'enova_incidents',
  'enova_telemetry',
  'lead_auditoria',
  'lead_timeline_events',
];

/**
 * Buckets reais declarados por Vasques (export Storage).
 */
export interface SupabaseBucketRef {
  name: string;
  public: boolean;
  object_count: number;
  warning: string | null;
}

export const SUPABASE_KNOWN_BUCKETS: readonly SupabaseBucketRef[] = [
  {
    name: 'documentos-pre-analise',
    public: true,
    object_count: 141,
    warning: 'Bucket público com 141 objetos sensíveis. Política deve ser revisada em PR específica.',
  },
  {
    name: 'emailsnv',
    public: false,
    object_count: 0,
    warning: null,
  },
  {
    name: 'enavia-brain',
    public: true,
    object_count: 112,
    warning: 'Bucket público com 112 objetos. Política deve ser revisada em PR específica.',
  },
  {
    name: 'enavia-brain-test',
    public: false,
    object_count: 0,
    warning: null,
  },
];

/**
 * Resultado de uma chamada PostgREST.
 * `error` é string segura — nunca contém service role ou token bruto.
 */
export interface SupabaseQueryResult<T> {
  ok: boolean;
  rows: T[];
  total: number;
  error: string | null;
  http_status: number | null;
}

/**
 * Linha bruta de `crm_lead_meta` — schema real confirmado por SQL direto (T9.13J) e
 * execuções T9.13C/T9.13E/T9.13F/T9.13G/T9.13H/T9.13I.
 * PK real: wa_id (TEXT UNIQUE) = WhatsApp ID do cliente = CrmLead.external_ref.
 *
 * Histórico de PGRST204 confirmados (não existem no schema real — não criar):
 *   T9.13C: lead_id (PGRST 42703)
 *   T9.13E: customer_name (PGRST204)
 *   T9.13F: external_ref (PGRST204)
 *   T9.13G: phone_ref, status, manual_mode (PGRST204)
 *
 * NOT NULL sem DEFAULT confirmados por SQL direto (T9.13J) e por 23502 (T9.13H/T9.13I):
 *   wa_id       — NOT NULL sem DEFAULT (PK)
 *   lead_pool   — NOT NULL sem DEFAULT; canônico: 'COLD_POOL' (lead novo entra como base fria)
 *   lead_temp   — NOT NULL sem DEFAULT; canônico: 'COLD' (lead novo entra como frio)
 *
 * NOT NULL com DEFAULT (PostgREST preenche automaticamente — não enviar):
 *   tags                   — jsonb NOT NULL default '[]::jsonb'
 *   auto_outreach_enabled  — boolean NOT NULL default false
 *   is_paused              — boolean NOT NULL default false
 *   created_at             — timestamp NOT NULL default now()
 *   updated_at             — timestamp NOT NULL default now()
 *   is_archived            — boolean NOT NULL default false
 *
 * CHECK constraint confirmado por SQL direto (T9.13J):
 *   crm_lead_meta_lead_pool_check — aceita 'COLD_POOL', 'WARM_POOL', entre outros.
 *
 * Schema real (subset relevante, T9.13G P0): wa_id, created_at, updated_at, nome,
 * telefone, status_operacional, ultima_acao, ultimo_contato_at, lead_pool, lead_temp,
 * lead_source, tags, obs_curta, import_ref, auto_outreach_enabled, is_paused,
 * + dezenas de analysis_x/approved_x/rejection_x/visit_x/reserve_x/financial_x (legado E1).
 *
 * Equivalentes legado (não confirmados como destino canônico de escrita):
 *   customer_name → nome (legado E1)
 *   phone_ref → telefone (legado E1)
 *   status → status_operacional (semântica diferente)
 *   manual_mode → (sem equivalente direto)
 *
 * Campos preservados no CRM canônico (CrmLead) e writeBuffer mas NÃO escritos no Supabase real:
 *   external_ref, customer_name, phone_ref, status, manual_mode.
 */
export interface CrmLeadMetaRow {
  wa_id?: string;            // PK real — WhatsApp ID (ex: '5511999990001')
  lead_pool?: string | null; // NOT NULL sem DEFAULT. Canônico: 'COLD_POOL' (T9.13J).
  lead_temp?: string | null; // NOT NULL sem DEFAULT. Canônico: 'COLD' (T9.13J).
  created_at?: string | null;
  updated_at?: string | null;
  // external_ref/customer_name/phone_ref/status/manual_mode OMITIDAS — colunas não existem
  // no Supabase real (PGRST204 T9.13E/T9.13F/T9.13G).
  [k: string]: unknown;
}

/**
 * Linha bruta de `enova_state` — schema real confirmado por execuções T9.13C/T9.13E/T9.13F/T9.13G.
 * lead_id é UUID (PGRST 22P02 confirmado em T9.13C — usar randomUUID na prova).
 *
 * Histórico de PGRST204 confirmados (não existem no schema real — não criar):
 *   T9.13E: block_advance (PGRST204)
 *   T9.13F: next_objective (PGRST204)
 *   T9.13G: stage_current, state_version (PGRST204)
 *
 * Schema real (T9.13G P0): id, lead_id, wa_id, last_incoming_id, last_reply_id,
 * last_intent, last_context, last_ts, controle, atendimento_manual, updated_at,
 * fase_conversa, intro_etapa, funil_status, funil_opcao_docs, atualizado_em, nome,
 * last_processed_stage, last_user_stage + dezenas de campos legado E1 (estado_civil,
 * regime, renda_*, docs_*, dossie_*, pacote_*, visita_*, etc).
 *
 * Candidatos legado para stage_current (NÃO confirmados — múltiplos coexistem):
 *   fase_conversa, last_processed_stage, last_user_stage, intro_etapa.
 *   Sem prova documental do canônico → mapping BLOQUEADO (BLK-T9.13-STATE-MAPPING).
 *   crm_lead_state permanece em writeBuffer até confirmação explícita de Vasques.
 *
 * Campos preservados no CRM canônico (CrmLeadState) e writeBuffer mas NÃO escritos
 * no Supabase real: stage_current, next_objective, block_advance, state_version,
 * policy_flags, risk_flags.
 */
export interface EnovaStateRow {
  lead_id?: string;
  updated_at?: string | null;
  // stage_current/next_objective/block_advance/state_version OMITIDAS — colunas não existem
  // no Supabase real (PGRST204 T9.13E/T9.13F/T9.13G). Mapeamento bloqueado: BLK-T9.13-STATE-MAPPING.
  [k: string]: unknown;
}

/**
 * Linha bruta de `enova_docs`.
 */
export interface EnovaDocsRow {
  document_id?: string;
  lead_id?: string;
  document_type?: string | null;
  status?: string | null;
  storage_path?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [k: string]: unknown;
}

/**
 * Linha bruta de `crm_override_log`.
 */
export interface CrmOverrideLogRow {
  override_id?: string;
  lead_id?: string;
  operator_id?: string | null;
  override_type?: string | null;
  target_field?: string | null;
  old_value?: unknown;
  new_value?: unknown;
  reason?: string | null;
  created_at?: string | null;
  [k: string]: unknown;
}
