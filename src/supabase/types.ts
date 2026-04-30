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
 * Linha bruta de `crm_lead_meta` — schema mínimo confirmado por Vasques.
 * Não declarar campos não confirmados — usar `Record<string, unknown>` para o resto.
 */
export interface CrmLeadMetaRow {
  lead_id?: string;
  external_ref?: string | null;
  customer_name?: string | null;
  phone_ref?: string | null;
  status?: string | null;
  manual_mode?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  [k: string]: unknown;
}

/**
 * Linha bruta de `enova_state`.
 */
export interface EnovaStateRow {
  lead_id?: string;
  stage_current?: string | null;
  next_objective?: string | null;
  block_advance?: boolean | null;
  state_version?: number | null;
  updated_at?: string | null;
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
