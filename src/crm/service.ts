/**
 * ENOVA 2 — CRM Operacional — Serviço (PR-T8.4)
 *
 * ESCOPO:
 *   Funções de negócio do CRM: leitura de leads, fatos, histórico, documentos,
 *   dossiê, eventos de policy, e operações supervisionadas (override, modo
 *   manual, reset consistente).
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nenhuma função produz ou altera reply_text.
 *   - Nenhuma função decide stage_current.
 *   - Reset preserva auditoria: override_log e policy_events nunca são apagados.
 *   - Modo manual não cria script de fala — é controle operacional.
 *   - Dossiê organiza informação, não decide aprovação do lead.
 *   - Override é registro auditável — não silencia a governança existente.
 */

import type { CrmBackend } from './types.ts';
import type {
  CrmDossier,
  CrmDossierStatus,
  CrmDocument,
  CrmFact,
  CrmFactWriteInput,
  CrmLead,
  CrmLeadFilter,
  CrmLeadState,
  CrmLeadStatus,
  CrmLeadWriteInput,
  CrmListResult,
  CrmManualModeInput,
  CrmManualModeLog,
  CrmOverrideInput,
  CrmOverrideLog,
  CrmPolicyEvent,
  CrmReadResult,
  CrmTurn,
  CrmWriteResult,
} from './types.ts';
import type { CoreDecision } from '../core/types.ts';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function uuid(): string {
  const rnd = (n: number) =>
    Math.floor(Math.random() * 16 ** n)
      .toString(16)
      .padStart(n, '0');
  return `${rnd(8)}-${rnd(4)}-4${rnd(3)}-${((Math.floor(Math.random() * 4) + 8).toString(16))}${rnd(3)}-${rnd(12)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function ok<T>(record: T): CrmWriteResult<T> {
  return { success: true, record, error: null };
}

function fail<T>(error: string): CrmWriteResult<T> {
  return { success: false, record: null, error };
}

function found<T>(record: T): CrmReadResult<T> {
  return { found: true, record, error: null };
}

function notFound<T>(msg: string | null = null): CrmReadResult<T> {
  return { found: false, record: null, error: msg };
}

function listOk<T>(records: T[]): CrmListResult<T> {
  return { records, total: records.length, error: null };
}

// ---------------------------------------------------------------------------
// 1. Leads
// ---------------------------------------------------------------------------

export async function createLead(
  backend: CrmBackend,
  input: CrmLeadWriteInput,
): Promise<CrmWriteResult<CrmLead>> {
  if (!input.external_ref && !input.customer_name) {
    return fail('external_ref ou customer_name é obrigatório.');
  }

  const lead: CrmLead = {
    lead_id: uuid(),
    external_ref: input.external_ref,
    customer_name: input.customer_name ?? null,
    phone_ref: null,
    status: 'active',
    manual_mode: false,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  await backend.insert('crm_leads', lead);
  return ok(lead);
}

export async function listLeads(
  backend: CrmBackend,
  filter?: CrmLeadFilter,
): Promise<CrmListResult<CrmLead>> {
  const all = await backend.findAll<CrmLead>('crm_leads');

  const filtered = all.filter((lead) => {
    if (filter?.status !== undefined && lead.status !== filter.status) return false;
    if (filter?.manual_mode !== undefined && lead.manual_mode !== filter.manual_mode) return false;
    return true;
  });

  return listOk(filtered);
}

export async function getLeadById(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmReadResult<CrmLead>> {
  const lead = await backend.findOne<CrmLead>('crm_leads', (r) => r.lead_id === lead_id);
  return lead ? found(lead) : notFound(`lead_id '${lead_id}' não encontrado.`);
}

// ---------------------------------------------------------------------------
// 2. Estado do lead
// ---------------------------------------------------------------------------

export async function getLeadState(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmReadResult<CrmLeadState>> {
  const state = await backend.findOne<CrmLeadState>(
    'crm_lead_state',
    (r) => r.lead_id === lead_id,
  );
  return state ? found(state) : notFound(`Estado não encontrado para lead '${lead_id}'.`);
}

// ---------------------------------------------------------------------------
// 3. Timeline (turnos)
// ---------------------------------------------------------------------------

export async function getLeadTimeline(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmListResult<CrmTurn>> {
  const turns = await backend.findMany<CrmTurn>('crm_turns', (r) => r.lead_id === lead_id);
  turns.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return listOk(turns);
}

// ---------------------------------------------------------------------------
// 4. Fatos
// ---------------------------------------------------------------------------

export async function getLeadFacts(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmListResult<CrmFact>> {
  const facts = await backend.findMany<CrmFact>('crm_facts', (r) => r.lead_id === lead_id);
  return listOk(facts);
}

export async function writeLeadFact(
  backend: CrmBackend,
  input: CrmFactWriteInput,
): Promise<CrmWriteResult<CrmFact>> {
  const fact: CrmFact = {
    fact_id: uuid(),
    lead_id: input.lead_id,
    fact_key: input.fact_key,
    fact_value: input.fact_value,
    confidence: input.confidence ?? null,
    status: input.status ?? 'pending',
    source_turn_id: input.source_turn_id ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  await backend.insert('crm_facts', fact);
  return ok(fact);
}

// ---------------------------------------------------------------------------
// 5. Documentos
// ---------------------------------------------------------------------------

export async function getLeadDocuments(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmListResult<CrmDocument>> {
  const docs = await backend.findMany<CrmDocument>(
    'crm_documents',
    (r) => r.lead_id === lead_id,
  );
  return listOk(docs);
}

// ---------------------------------------------------------------------------
// 6. Dossiê
// Dossiê organiza — não decide aprovação (T6_DOSSIE_OPERACIONAL.md §3).
// ---------------------------------------------------------------------------

export async function getLeadDossier(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmReadResult<CrmDossier>> {
  const dossier = await backend.findOne<CrmDossier>(
    'crm_dossier',
    (r) => r.lead_id === lead_id,
  );
  return dossier ? found(dossier) : notFound(null);
}

// ---------------------------------------------------------------------------
// 7. Eventos de policy / override
// ---------------------------------------------------------------------------

export async function getLeadPolicyEvents(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmListResult<CrmPolicyEvent>> {
  const events = await backend.findMany<CrmPolicyEvent>(
    'crm_policy_events',
    (r) => r.lead_id === lead_id,
  );
  events.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return listOk(events);
}

export async function getLeadOverrideLog(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmListResult<CrmOverrideLog>> {
  const overrides = await backend.findMany<CrmOverrideLog>(
    'crm_override_log',
    (r) => r.lead_id === lead_id,
  );
  overrides.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return listOk(overrides);
}

// ---------------------------------------------------------------------------
// 8. Operação supervisionada: override
// Registra intervenção manual com trilha completa.
// NUNCA deleta override_log (auditoria permanente).
// ---------------------------------------------------------------------------

export async function registerOverride(
  backend: CrmBackend,
  lead_id: string,
  input: CrmOverrideInput,
): Promise<CrmWriteResult<CrmOverrideLog>> {
  const leadResult = await getLeadById(backend, lead_id);
  if (!leadResult.found) return fail(leadResult.error ?? 'Lead não encontrado.');
  if (!input.reason?.trim()) return fail('Campo "reason" é obrigatório para override.');
  if (!input.operator_id?.trim()) return fail('Campo "operator_id" é obrigatório.');

  const entry: CrmOverrideLog = {
    override_id: uuid(),
    lead_id,
    operator_id: input.operator_id,
    override_type: input.override_type,
    target_field: input.target_field ?? null,
    old_value: input.old_value ?? null,
    new_value: input.new_value ?? null,
    reason: input.reason,
    created_at: nowIso(),
  };

  await backend.insert('crm_override_log', entry);
  return ok(entry);
}

// ---------------------------------------------------------------------------
// 9. Operação supervisionada: modo manual
// Ativa/desativa modo manual de um lead.
// Modo manual é controle operacional — não cria script de fala.
// ---------------------------------------------------------------------------

export async function toggleManualMode(
  backend: CrmBackend,
  lead_id: string,
  input: CrmManualModeInput,
): Promise<CrmWriteResult<CrmManualModeLog>> {
  const leadResult = await getLeadById(backend, lead_id);
  if (!leadResult.found) return fail(leadResult.error ?? 'Lead não encontrado.');
  if (!input.operator_id?.trim()) return fail('Campo "operator_id" é obrigatório.');

  const activating = input.action === 'activate';

  await backend.update<CrmLead>(
    'crm_leads',
    (r) => r.lead_id === lead_id,
    { manual_mode: activating, updated_at: nowIso() },
  );

  const log: CrmManualModeLog = {
    event_id: uuid(),
    lead_id,
    action: input.action,
    operator_id: input.operator_id,
    reason: input.reason ?? null,
    created_at: nowIso(),
  };

  await backend.insert('crm_manual_mode_log', log);
  return ok(log);
}

// ---------------------------------------------------------------------------
// 10. Operação supervisionada: reset consistente
//
// REGRA INVIOLÁVEL: reset não apaga auditoria.
//   - override_log: preservado integralmente.
//   - policy_events: preservados integralmente.
//   - Fatos: marcados como 'superseded' (não deletados).
//   - Estado: registrado como reset via override_log.
//   - Lead status: volta para 'active' se estava 'inactive'.
// ---------------------------------------------------------------------------

export async function resetLead(
  backend: CrmBackend,
  lead_id: string,
  operator_id: string,
  reason: string,
): Promise<CrmWriteResult<CrmOverrideLog>> {
  const leadResult = await getLeadById(backend, lead_id);
  if (!leadResult.found) return fail(leadResult.error ?? 'Lead não encontrado.');
  if (!operator_id?.trim()) return fail('Campo "operator_id" é obrigatório para reset.');
  if (!reason?.trim()) return fail('Campo "reason" é obrigatório para reset.');

  // 1. Marcar fatos ativos como superseded (não deletar).
  const facts = await backend.findMany<CrmFact>(
    'crm_facts',
    (r) => r.lead_id === lead_id && r.status !== 'superseded',
  );
  for (const fact of facts) {
    await backend.update<CrmFact>(
      'crm_facts',
      (r) => r.fact_id === fact.fact_id,
      { status: 'superseded', updated_at: nowIso() },
    );
  }

  // 2. Desativar modo manual se estiver ativo.
  const lead = leadResult.record!;
  if (lead.manual_mode) {
    await backend.update<CrmLead>(
      'crm_leads',
      (r) => r.lead_id === lead_id,
      { manual_mode: false, updated_at: nowIso() },
    );
    const modeLog: CrmManualModeLog = {
      event_id: uuid(),
      lead_id,
      action: 'deactivate',
      operator_id,
      reason: `Auto-desativado por reset: ${reason}`,
      created_at: nowIso(),
    };
    await backend.insert('crm_manual_mode_log', modeLog);
  }

  // 3. Registrar o reset no override_log (trilha de auditoria).
  const resetEntry: CrmOverrideLog = {
    override_id: uuid(),
    lead_id,
    operator_id,
    override_type: 'status_change',
    target_field: 'reset',
    old_value: { facts_count: facts.length, manual_mode: lead.manual_mode },
    new_value: { facts_superseded: facts.length, manual_mode: false },
    reason,
    created_at: nowIso(),
  };

  await backend.insert('crm_override_log', resetEntry);
  return ok(resetEntry);
}

// ---------------------------------------------------------------------------
// 11. Upsert por telefone (inbound Meta/WhatsApp — PR-T8.16)
// Cria ou atualiza lead pelo wa_id (external_ref) e phone_number_id (phone_ref).
// Nunca sobrescreve external_ref existente com valor diferente.
// ---------------------------------------------------------------------------

export async function upsertLeadByPhone(
  backend: CrmBackend,
  wa_id: string,
  phone_number_id?: string,
): Promise<CrmWriteResult<CrmLead>> {
  if (!wa_id?.trim()) {
    return fail('wa_id é obrigatório para upsertLeadByPhone.');
  }

  const existing = await backend.findOne<CrmLead>(
    'crm_leads',
    (r) => r.external_ref === wa_id,
  );

  if (existing) {
    if (phone_number_id && !existing.phone_ref) {
      const updated = await backend.update<CrmLead>(
        'crm_leads',
        (r) => r.lead_id === existing.lead_id,
        { phone_ref: phone_number_id, updated_at: nowIso() },
      );
      return ok(updated ?? existing);
    }
    return ok(existing);
  }

  const lead: CrmLead = {
    lead_id: uuid(),
    external_ref: wa_id,
    customer_name: null,
    phone_ref: phone_number_id ?? null,
    status: 'active',
    manual_mode: false,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  await backend.insert('crm_leads', lead);
  return ok(lead);
}

// ---------------------------------------------------------------------------
// 12. Registrar turno de conversa (inbound Meta/WhatsApp — PR-T8.16)
// ---------------------------------------------------------------------------

export async function createConversationTurn(
  backend: CrmBackend,
  lead_id: string,
  channel_type: string,
  raw_input_summary: string,
  stage_at_turn?: string,
): Promise<CrmWriteResult<CrmTurn>> {
  if (!lead_id?.trim()) return fail('lead_id é obrigatório para createConversationTurn.');

  const turn: CrmTurn = {
    turn_id: uuid(),
    lead_id,
    channel_type,
    raw_input_summary: raw_input_summary.slice(0, 500),
    stage_at_turn: stage_at_turn ?? 'unknown',
    model_name: null,
    latency_ms: null,
    created_at: nowIso(),
  };

  await backend.insert('crm_turns', turn);
  return ok(turn);
}

// ---------------------------------------------------------------------------
// 13. Upsert estado do lead a partir de decisão do Core (T9.4)
//
// Invariante: stage_current é projetado do Core — CRM nunca calcula diretamente.
// Apenas aplica decision.stage_after recebido de runCoreEngine.
// ---------------------------------------------------------------------------

export async function upsertLeadState(
  backend: CrmBackend,
  lead_id: string,
  decision: CoreDecision,
): Promise<CrmWriteResult<CrmLeadState>> {
  if (!lead_id?.trim()) return fail('lead_id é obrigatório para upsertLeadState.');

  const existing = await backend.findOne<CrmLeadState>(
    'crm_lead_state',
    (r) => r.lead_id === lead_id,
  );

  if (existing) {
    const patch = {
      stage_current: decision.stage_after,
      next_objective: decision.next_objective,
      block_advance: decision.block_advance,
      state_version: (existing.state_version ?? 0) + 1,
      updated_at: nowIso(),
    };
    const updated = await backend.update<CrmLeadState>(
      'crm_lead_state',
      (r) => r.lead_id === lead_id,
      patch,
    );
    return ok(updated ?? { ...existing, ...patch });
  }

  const stateRecord: CrmLeadState = {
    state_id: uuid(),
    lead_id,
    stage_current: decision.stage_after,
    next_objective: decision.next_objective,
    block_advance: decision.block_advance,
    policy_flags: {},
    risk_flags: null,
    state_version: 1,
    updated_at: nowIso(),
  };

  await backend.insert('crm_lead_state', stateRecord);
  return ok(stateRecord);
}

// ---------------------------------------------------------------------------
// 14. Case-file consolidado
// Agrega lead + state + facts + docs + dossier para visão completa do CRM.
// Não decide aprovação — apenas consolida informação.
// ---------------------------------------------------------------------------

export interface CrmCaseFile {
  lead: CrmLead | null;
  state: CrmLeadState | null;
  facts: CrmFact[];
  documents: CrmDocument[];
  dossier: CrmDossier | null;
  override_log: CrmOverrideLog[];
}

export async function getLeadCaseFile(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmReadResult<CrmCaseFile>> {
  const leadResult = await getLeadById(backend, lead_id);
  if (!leadResult.found) return notFound(leadResult.error);

  const [stateResult, factsResult, docsResult, dossierResult, overrideResult] =
    await Promise.all([
      getLeadState(backend, lead_id),
      getLeadFacts(backend, lead_id),
      getLeadDocuments(backend, lead_id),
      getLeadDossier(backend, lead_id),
      getLeadOverrideLog(backend, lead_id),
    ]);

  return found<CrmCaseFile>({
    lead: leadResult.record,
    state: stateResult.record,
    facts: factsResult.records,
    documents: docsResult.records,
    dossier: dossierResult.record,
    override_log: overrideResult.records,
  });
}
