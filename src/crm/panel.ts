/**
 * ENOVA 2 — CRM Operacional — Funções de painel (PR-T8.4 expandido)
 *
 * ESCOPO:
 *   Agregações backend para as 7 abas do painel operacional Enova 2:
 *   Conversas, Bases, Atendimento, CRM (em service.ts), Dashboard,
 *   Incidentes, ENOVA IA.
 *
 *   Todas as funções operam sobre o backend in-process (`CrmBackend`).
 *   Quando dados não existem, retornam empty-state com schema estável
 *   para que o frontend (PR-T8.5) tenha contratos previsíveis.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nenhuma função produz reply_text.
 *   - Nenhuma função decide stage.
 *   - Nenhuma função ativa LLM real, Supabase real ou WhatsApp real.
 *   - Empty-state é declarado explicitamente — não há promessa falsa.
 */

import type {
  CrmBackend,
  CrmDocument,
  CrmFact,
  CrmLead,
  CrmOverrideLog,
  CrmPolicyEvent,
  CrmTurn,
} from './types.ts';

// ---------------------------------------------------------------------------
// 1. Conversas
// ---------------------------------------------------------------------------

export interface CrmConversationSummary {
  lead_id: string;
  customer_name: string | null;
  external_ref: string | null;
  status: string;
  manual_mode: boolean;
  last_turn_at: string | null;
  turn_count: number;
}

export interface CrmConversationDetail {
  lead: CrmLead;
  turns: CrmTurn[];
  turn_count: number;
}

export async function listConversations(
  backend: CrmBackend,
): Promise<{ records: CrmConversationSummary[]; total: number; real_runtime: boolean }> {
  const leads = await backend.findAll<CrmLead>('crm_leads');
  const records: CrmConversationSummary[] = [];
  for (const lead of leads) {
    const turns = await backend.findMany<CrmTurn>(
      'crm_turns',
      (r) => r.lead_id === lead.lead_id,
    );
    turns.sort((a, b) => b.created_at.localeCompare(a.created_at));
    records.push({
      lead_id: lead.lead_id,
      customer_name: lead.customer_name,
      external_ref: lead.external_ref,
      status: lead.status,
      manual_mode: lead.manual_mode,
      last_turn_at: turns[0]?.created_at ?? null,
      turn_count: turns.length,
    });
  }
  return { records, total: records.length, real_runtime: false };
}

export async function getConversation(
  backend: CrmBackend,
  lead_id: string,
): Promise<{ found: boolean; record: CrmConversationDetail | null }> {
  const lead = await backend.findOne<CrmLead>('crm_leads', (r) => r.lead_id === lead_id);
  if (!lead) return { found: false, record: null };

  const turns = await backend.findMany<CrmTurn>('crm_turns', (r) => r.lead_id === lead_id);
  turns.sort((a, b) => a.created_at.localeCompare(b.created_at));

  return { found: true, record: { lead, turns, turn_count: turns.length } };
}

export async function getConversationMessages(
  backend: CrmBackend,
  lead_id: string,
): Promise<{ records: CrmTurn[]; total: number; real_messages: boolean }> {
  const turns = await backend.findMany<CrmTurn>('crm_turns', (r) => r.lead_id === lead_id);
  turns.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return { records: turns, total: turns.length, real_messages: false };
}

// ---------------------------------------------------------------------------
// 2. Bases
// ---------------------------------------------------------------------------

export interface CrmBaseRef {
  base_id: string;
  name: string;
  path: string;
  type: 'contract' | 'source' | 'implantation' | 'addendum' | 'diagnostic';
  status: 'documented_only' | 'runtime' | 'persisted';
  description: string;
}

const CANONICAL_BASES: CrmBaseRef[] = [
  {
    base_id: 'legado_mestre',
    name: 'Legado Mestre Enova 1 -> Enova 2',
    path: 'schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md',
    type: 'source',
    status: 'documented_only',
    description: 'Mapa canônico do legado e diretrizes de migração.',
  },
  {
    base_id: 't0_pr1_reaproveitamento',
    name: 'T0/PR1 Reaproveitamento Canônico',
    path: 'schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md',
    type: 'implantation',
    status: 'documented_only',
    description: 'Inventário canônico de reaproveitamento Enova 1.',
  },
  {
    base_id: 'contrato_t8_ativo',
    name: 'Contrato Implantação Macro T8 (ativo)',
    path: 'schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md',
    type: 'contract',
    status: 'documented_only',
    description: 'Contrato vigente da fase T8.',
  },
  {
    base_id: 'adendo_soberania_ia',
    name: 'Adendo Canônico Soberania IA',
    path: 'schema/ADENDO_CANONICO_SOBERANIA_IA.md',
    type: 'addendum',
    status: 'documented_only',
    description: 'LLM soberano da fala — sem fallback mecânico.',
  },
  {
    base_id: 'adendo_soberania_llm_mcmv',
    name: 'Adendo Canônico Soberania LLM MCMV',
    path: 'schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md',
    type: 'addendum',
    status: 'documented_only',
    description: 'Soberania do LLM nas decisões MCMV.',
  },
  {
    base_id: 'adendo_fechamento_por_prova',
    name: 'Adendo Canônico Fechamento por Prova',
    path: 'schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md',
    type: 'addendum',
    status: 'documented_only',
    description: 'Fases só fecham com prova real.',
  },
  {
    base_id: 't8_diag_inventario',
    name: 'T8 Inventário Técnico Repo2',
    path: 'schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md',
    type: 'diagnostic',
    status: 'documented_only',
    description: 'Diagnóstico do inventário técnico do Repo2 (PR-T8.1).',
  },
  {
    base_id: 't8_diag_matriz',
    name: 'T8 Matriz Aderência Contrato × Código',
    path: 'schema/diagnostics/T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md',
    type: 'diagnostic',
    status: 'documented_only',
    description: 'Aderência contrato × código real (PR-T8.2).',
  },
  {
    base_id: 't8_diag_crm',
    name: 'T8 Diagnóstico CRM/Infra Enova 1',
    path: 'schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md',
    type: 'diagnostic',
    status: 'documented_only',
    description: 'Diagnóstico CRM/infra reaproveitável (PR-T8.3).',
  },
];

export function listBases(): { records: CrmBaseRef[]; total: number; real_runtime: boolean } {
  return {
    records: CANONICAL_BASES,
    total: CANONICAL_BASES.length,
    real_runtime: false,
  };
}

export function listBasesStatus(): {
  bases_count: number;
  by_type: Record<string, number>;
  real_supabase: boolean;
  real_vector_store: boolean;
  real_memory_runtime: boolean;
  note: string;
} {
  const by_type: Record<string, number> = {};
  for (const b of CANONICAL_BASES) {
    by_type[b.type] = (by_type[b.type] ?? 0) + 1;
  }
  return {
    bases_count: CANONICAL_BASES.length,
    by_type,
    real_supabase: false,
    real_vector_store: false,
    real_memory_runtime: false,
    note: 'Bases servidas em modo documented_only. Runtime de bases (Supabase/vector) entra em PR-T8.8.',
  };
}

// ---------------------------------------------------------------------------
// 3. Atendimento
// ---------------------------------------------------------------------------

export interface CrmAttendanceOverview {
  leads_total: number;
  leads_active: number;
  leads_manual_mode: number;
  facts_pending: number;
  documents_pending: number;
  recent_overrides: CrmOverrideLog[];
  real_runtime: boolean;
  note: string;
}

export async function getAttendanceOverview(
  backend: CrmBackend,
): Promise<CrmAttendanceOverview> {
  const leads = await backend.findAll<CrmLead>('crm_leads');
  const facts = await backend.findAll<CrmFact>('crm_facts');
  const docs = await backend.findAll<CrmDocument>('crm_documents');
  const overrides = await backend.findAll<CrmOverrideLog>('crm_override_log');

  overrides.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    leads_total: leads.length,
    leads_active: leads.filter((l) => l.status === 'active').length,
    leads_manual_mode: leads.filter((l) => l.manual_mode).length,
    facts_pending: facts.filter(
      (f) => f.status === 'pending' || f.status === 'requires_confirmation',
    ).length,
    documents_pending: docs.filter((d) => d.status === 'requested').length,
    recent_overrides: overrides.slice(0, 10),
    real_runtime: false,
    note: 'Agregação calculada in-process. Cross-lead persistido depende de PR-T8.8.',
  };
}

export async function getAttendancePending(
  backend: CrmBackend,
): Promise<{
  facts_pending: CrmFact[];
  documents_pending: CrmDocument[];
  total_pending: number;
  real_runtime: boolean;
}> {
  const facts = await backend.findAll<CrmFact>('crm_facts');
  const docs = await backend.findAll<CrmDocument>('crm_documents');
  const fp = facts.filter(
    (f) => f.status === 'pending' || f.status === 'requires_confirmation',
  );
  const dp = docs.filter((d) => d.status === 'requested');
  return {
    facts_pending: fp,
    documents_pending: dp,
    total_pending: fp.length + dp.length,
    real_runtime: false,
  };
}

export async function getAttendanceManualMode(
  backend: CrmBackend,
): Promise<{ records: CrmLead[]; total: number; real_runtime: boolean }> {
  const leads = await backend.findAll<CrmLead>('crm_leads');
  const manual = leads.filter((l) => l.manual_mode);
  return { records: manual, total: manual.length, real_runtime: false };
}

// ---------------------------------------------------------------------------
// 4. Dashboard
// ---------------------------------------------------------------------------

export interface CrmDashboardMetrics {
  leads_total: number;
  leads_active: number;
  leads_manual_mode: number;
  facts_total: number;
  facts_pending: number;
  documents_total: number;
  documents_pending: number;
  policy_events_total: number;
  overrides_total: number;
  real_supabase: boolean;
  note: string;
}

export async function getDashboardMetrics(
  backend: CrmBackend,
): Promise<CrmDashboardMetrics> {
  const leads = await backend.findAll<CrmLead>('crm_leads');
  const facts = await backend.findAll<CrmFact>('crm_facts');
  const docs = await backend.findAll<CrmDocument>('crm_documents');
  const events = await backend.findAll<CrmPolicyEvent>('crm_policy_events');
  const overrides = await backend.findAll<CrmOverrideLog>('crm_override_log');

  return {
    leads_total: leads.length,
    leads_active: leads.filter((l) => l.status === 'active').length,
    leads_manual_mode: leads.filter((l) => l.manual_mode).length,
    facts_total: facts.length,
    facts_pending: facts.filter(
      (f) => f.status === 'pending' || f.status === 'requires_confirmation',
    ).length,
    documents_total: docs.length,
    documents_pending: docs.filter((d) => d.status === 'requested').length,
    policy_events_total: events.length,
    overrides_total: overrides.length,
    real_supabase: false,
    note: 'Métricas calculadas in-process. Persistência real depende de PR-T8.8. Conversões/funil em PR-T8.6.',
  };
}

export async function getDashboardSummary(
  backend: CrmBackend,
): Promise<{ metrics: CrmDashboardMetrics; warnings: string[] }> {
  const metrics = await getDashboardMetrics(backend);
  const warnings: string[] = [];
  if (!metrics.real_supabase) warnings.push('real_supabase: false — métricas voláteis.');
  if (metrics.leads_total === 0) warnings.push('empty_state: nenhum lead registrado ainda.');
  return { metrics, warnings };
}

// ---------------------------------------------------------------------------
// 5. Incidentes
// ---------------------------------------------------------------------------

export interface CrmIncidentsBundle {
  critical_policy_events: CrmPolicyEvent[];
  operator_actions: CrmOverrideLog[];
  real_persistence: boolean;
  note: string;
}

export async function listIncidents(backend: CrmBackend): Promise<CrmIncidentsBundle> {
  const events = await backend.findAll<CrmPolicyEvent>('crm_policy_events');
  const overrides = await backend.findAll<CrmOverrideLog>('crm_override_log');

  const critical = events.filter((e) => e.severity === 'high' || e.severity === 'critical');
  critical.sort((a, b) => b.created_at.localeCompare(a.created_at));

  overrides.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    critical_policy_events: critical,
    operator_actions: overrides.slice(0, 50),
    real_persistence: false,
    note: 'Trilha de incidentes em backend in-process. Auth failures e telemetria persistida entram em PR-T8.14.',
  };
}

export async function getIncidentsSummary(backend: CrmBackend): Promise<{
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  total_policy_events: number;
  total_overrides: number;
  real_persistence: boolean;
  note: string;
}> {
  const events = await backend.findAll<CrmPolicyEvent>('crm_policy_events');
  const overrides = await backend.findAll<CrmOverrideLog>('crm_override_log');

  return {
    critical_count: events.filter((e) => e.severity === 'critical').length,
    high_count: events.filter((e) => e.severity === 'high').length,
    medium_count: events.filter((e) => e.severity === 'medium').length,
    low_count: events.filter((e) => e.severity === 'low').length,
    total_policy_events: events.length,
    total_overrides: overrides.length,
    real_persistence: false,
    note: 'Sumário calculado in-process. Telemetria cognitiva real entra em PR-T8.14.',
  };
}

// ---------------------------------------------------------------------------
// 6. ENOVA IA
// ---------------------------------------------------------------------------

export function getEnovaIaStatus(): {
  runtime: string;
  llm_real: boolean;
  supabase_real: boolean;
  whatsapp_real: boolean;
  memory_runtime: string;
  prompt_registry: string;
  next_prs: Record<string, string>;
  note: string;
} {
  return {
    runtime: 'in_process',
    llm_real: false,
    supabase_real: false,
    whatsapp_real: false,
    memory_runtime: 'in_process',
    prompt_registry: 'documented_only',
    next_prs: {
      llm_real: 'PR-T8.9',
      supabase_real: 'PR-T8.8',
      whatsapp_real: 'PR-T8.12',
      telemetry_runtime: 'PR-T8.14',
    },
    note: 'Status técnico do runtime. Conexões reais em PRs futuras.',
  };
}

export function getEnovaIaRuntime(): {
  service: string;
  runtime: string;
  core_engine: string;
  e1_memory: string;
  crm_backend: string;
  rollout_guard: string;
  telemetry: string;
  real_supabase: boolean;
  real_llm: boolean;
  real_whatsapp: boolean;
  next_prs: Record<string, string>;
} {
  return {
    service: 'enova-2-worker',
    runtime: 'cloudflare_worker',
    core_engine: 'in_process',
    e1_memory: 'in_process',
    crm_backend: 'in_process',
    rollout_guard: 'active',
    telemetry: 'emit_only',
    real_supabase: false,
    real_llm: false,
    real_whatsapp: false,
    next_prs: {
      runtime_real: 'PR-T8.14',
      llm_real: 'PR-T8.9',
      whatsapp_real: 'PR-T8.12',
    },
  };
}
