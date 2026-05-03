/**
 * ENOVA 2 — Supabase operacional controlado (PR-T8.8 + T9.12)
 *
 * SupabaseCrmBackend — implementação de `CrmBackend` que LÊ do Supabase real
 * mapeando para o schema canônico CRM (`crm_*`) declarado em `src/crm/types.ts`.
 *
 * REGRA DE OURO T9.12:
 *   - Leitura: real, com mapeamento mínimo, limite de 100 linhas por padrão.
 *   - Escrita real: habilitada via `SUPABASE_WRITE_ENABLED=true` SOMENTE para:
 *       crm_leads    → crm_lead_meta
 *       crm_lead_state → enova_state
 *   - Escrita diferida (writeBuffer): crm_turns, crm_facts e demais tabelas.
 *     Aguardam confirmação de schema/destino Supabase por Vasques.
 *   - Fallback garantido: se escrita real falhar, writeBuffer absorve.
 *   - Reset/delete: PROIBIDOS.
 *
 * Por que crm_turns e crm_facts ficam no writeBuffer:
 *   Schema de lead_timeline_events e destino de crm_facts não confirmados
 *   por Vasques (T9.12-DIAG §9, §10, BLK-WRITE-02, BLK-WRITE-04).
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Sem reply_text.
 *   - Sem decisão de stage.
 *   - Sem alteração de schema/RLS/bucket.
 *   - Sem delete real.
 *   - Secrets nunca em log/error/response.
 *   - Amplificação de carga proibida (limites baixos por padrão).
 */

import type {
  CrmBackend,
  CrmDocument,
  CrmDocumentStatus,
  CrmLead,
  CrmLeadState,
  CrmLeadStatus,
  CrmOverrideLog,
  CrmTable,
} from '../crm/types.ts';
import { CrmInMemoryBackend } from '../crm/store.ts';
import {
  supabaseSelect,
  supabaseUpsert,
} from './client.ts';
import type {
  CrmLeadMetaRow,
  CrmOverrideLogRow,
  EnovaDocsRow,
  EnovaStateRow,
  SupabaseConfig,
} from './types.ts';

// ---------------------------------------------------------------------------
// Mapeadores: linha real do Supabase → registro canônico CRM
// ---------------------------------------------------------------------------

function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function asNullableString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return null;
  return null;
}

function asBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true';
  return false;
}

function nowIso(): string {
  return new Date().toISOString();
}

function mapLeadStatus(raw: unknown): CrmLeadStatus {
  const s = typeof raw === 'string' ? raw.toLowerCase() : '';
  if (s === 'inactive' || s === 'archived') return s;
  return 'active';
}

function mapDocumentStatus(raw: unknown): CrmDocumentStatus {
  const s = typeof raw === 'string' ? raw.toLowerCase() : '';
  if (s === 'received' || s === 'validated' || s === 'rejected' || s === 'requested') return s;
  return 'requested';
}

function mapLeadFromMeta(row: CrmLeadMetaRow, fallbackId: number): CrmLead {
  // wa_id é a PK real de crm_lead_meta (T9.13C). Usamos como lead_id interno.
  const wa_id = asString(row.wa_id);
  const lead_id = wa_id || `crm_lead_meta:${fallbackId}`;
  return {
    lead_id,
    external_ref: asNullableString(row.external_ref) ?? (wa_id || null),
    customer_name: asNullableString(row.customer_name),
    phone_ref: asNullableString(row.phone_ref),
    status: mapLeadStatus(row.status),
    manual_mode: asBool(row.manual_mode),
    created_at: asString(row.created_at) || nowIso(),
    updated_at: asString(row.updated_at) || nowIso(),
  };
}

function mapLeadStateFromEnovaState(row: EnovaStateRow, fallbackId: number): CrmLeadState {
  return {
    state_id: `enova_state:${asString(row.lead_id) || fallbackId}`,
    lead_id: asString(row.lead_id) || `enova_state:${fallbackId}`,
    stage_current: asString(row.stage_current) || 'discovery',
    next_objective: asString(row.next_objective) || '',
    block_advance: asBool(row.block_advance),
    policy_flags: {},
    risk_flags: null,
    state_version: typeof row.state_version === 'number' ? row.state_version : 0,
    updated_at: asString(row.updated_at) || nowIso(),
  };
}

function mapDocumentFromEnovaDocs(row: EnovaDocsRow, fallbackId: number): CrmDocument {
  return {
    document_id: asString(row.document_id) || `enova_docs:${fallbackId}`,
    lead_id: asString(row.lead_id) || '',
    document_type: asString(row.document_type) || 'unknown',
    person_role: null,
    status: mapDocumentStatus(row.status),
    storage_path: asNullableString(row.storage_path),
    notes: asNullableString(row.notes),
    created_at: asString(row.created_at) || nowIso(),
    updated_at: asString(row.updated_at) || nowIso(),
  };
}

function mapOverrideFromCrmOverrideLog(row: CrmOverrideLogRow, fallbackId: number): CrmOverrideLog {
  const ot = typeof row.override_type === 'string' ? row.override_type : 'note';
  const safeType: CrmOverrideLog['override_type'] =
    ot === 'stage_override' || ot === 'fact_correction' || ot === 'status_change' || ot === 'note'
      ? (ot as CrmOverrideLog['override_type'])
      : 'note';
  return {
    override_id: asString(row.override_id) || `crm_override_log:${fallbackId}`,
    lead_id: asString(row.lead_id) || '',
    operator_id: asString(row.operator_id) || 'unknown',
    override_type: safeType,
    target_field: asNullableString(row.target_field),
    old_value: row.old_value,
    new_value: row.new_value,
    reason: asString(row.reason) || '',
    created_at: asString(row.created_at) || nowIso(),
  };
}

// ---------------------------------------------------------------------------
// Mapeadores reversos: registro canônico CRM → linha Supabase (T9.12)
// Usados apenas para escrita real nas tabelas mapeadas.
// ---------------------------------------------------------------------------

function mapLeadToMeta(lead: CrmLead): CrmLeadMetaRow {
  return {
    // wa_id é a PK real de crm_lead_meta; external_ref é o wa_id no CRM (T9.13C).
    wa_id: lead.external_ref ?? lead.lead_id,
    external_ref: lead.external_ref,
    customer_name: lead.customer_name,
    phone_ref: lead.phone_ref,
    status: lead.status,
    manual_mode: lead.manual_mode,
    updated_at: lead.updated_at,
  };
}

function mapLeadStateToEnovaState(state: CrmLeadState): EnovaStateRow {
  return {
    lead_id: state.lead_id,
    stage_current: state.stage_current,
    next_objective: state.next_objective,
    block_advance: state.block_advance,
    state_version: state.state_version,
    updated_at: state.updated_at,
  };
}

// ---------------------------------------------------------------------------
// SupabaseCrmBackend — implementa CrmBackend
// ---------------------------------------------------------------------------

export class SupabaseCrmBackend implements CrmBackend {
  private readonly cfg: SupabaseConfig;
  /**
   * Indica se escrita real está habilitada (SUPABASE_WRITE_ENABLED=true).
   * Quando true, insert/update de tabelas mapeadas vai para Supabase real.
   * Quando false, comportamento idêntico a PR-T8.8 (writeBuffer).
   */
  private readonly writeEnabled: boolean;
  /**
   * Buffer in-memory para escritas. Usado como fallback quando:
   *   - writeEnabled=false (comportamento PR-T8.8)
   *   - writeEnabled=true mas tabela não tem mapeamento confirmado
   *   - writeEnabled=true mas escrita Supabase falhou
   */
  private readonly writeBuffer: CrmInMemoryBackend = new CrmInMemoryBackend();

  constructor(cfg: SupabaseConfig, writeEnabled = false) {
    this.cfg = cfg;
    this.writeEnabled = writeEnabled;
  }

  // -------------------------------------------------------------------------
  // Leituras reais — fetch + mapeamento + merge com writeBuffer
  // -------------------------------------------------------------------------

  private async readLeads(): Promise<CrmLead[]> {
    const result = await supabaseSelect<CrmLeadMetaRow>(this.cfg, 'crm_lead_meta', {
      limit: 100,
      order: 'created_at.desc',
    });
    if (!result.ok) return [];
    return result.rows.map((r, i) => mapLeadFromMeta(r, i));
  }

  private async readLeadStates(): Promise<CrmLeadState[]> {
    const result = await supabaseSelect<EnovaStateRow>(this.cfg, 'enova_state', {
      limit: 100,
      order: 'updated_at.desc',
    });
    if (!result.ok) return [];
    return result.rows.map((r, i) => mapLeadStateFromEnovaState(r, i));
  }

  private async readDocuments(): Promise<CrmDocument[]> {
    // enova_docs não tem coluna updated_at (confirmado em execução real PR-T8.9B).
    const result = await supabaseSelect<EnovaDocsRow>(this.cfg, 'enova_docs', {
      limit: 100,
      order: 'created_at.desc',
    });
    if (!result.ok) return [];
    return result.rows.map((r, i) => mapDocumentFromEnovaDocs(r, i));
  }

  private async readOverrides(): Promise<CrmOverrideLog[]> {
    const result = await supabaseSelect<CrmOverrideLogRow>(this.cfg, 'crm_override_log', {
      limit: 100,
      order: 'created_at.desc',
    });
    if (!result.ok) return [];
    return result.rows.map((r, i) => mapOverrideFromCrmOverrideLog(r, i));
  }

  /**
   * Lê do Supabase real (quando há mapeamento) e mescla com o writeBuffer.
   * Para tabelas sem mapeamento confirmado, retorna apenas o writeBuffer.
   */
  async findAll<T>(table: CrmTable): Promise<T[]> {
    const buffered = await this.writeBuffer.findAll<T>(table);

    if (table === 'crm_leads') {
      const real = (await this.readLeads()) as unknown as T[];
      return [...real, ...buffered];
    }
    if (table === 'crm_lead_state') {
      const real = (await this.readLeadStates()) as unknown as T[];
      return [...real, ...buffered];
    }
    if (table === 'crm_documents') {
      const real = (await this.readDocuments()) as unknown as T[];
      return [...real, ...buffered];
    }
    if (table === 'crm_override_log') {
      const real = (await this.readOverrides()) as unknown as T[];
      return [...real, ...buffered];
    }

    // Tabelas sem mapeamento confirmado (turns, facts, dossier,
    // policy_events, manual_mode_log) — retornam apenas writeBuffer.
    return buffered;
  }

  async findOne<T>(table: CrmTable, matcher: (row: T) => boolean): Promise<T | null> {
    const all = await this.findAll<T>(table);
    return all.find(matcher) ?? null;
  }

  async findMany<T>(table: CrmTable, matcher: (row: T) => boolean): Promise<T[]> {
    const all = await this.findAll<T>(table);
    return all.filter(matcher);
  }

  // -------------------------------------------------------------------------
  // Escritas — reais para tabelas mapeadas quando writeEnabled=true
  // -------------------------------------------------------------------------

  /**
   * Tenta upsert real em crm_lead_meta para um lead.
   * Retorna true em sucesso, false em falha (sem lançar).
   */
  private async supabaseWriteLead(lead: CrmLead): Promise<boolean> {
    const mapped = mapLeadToMeta(lead);
    const result = await supabaseUpsert<CrmLeadMetaRow>(this.cfg, 'crm_lead_meta', mapped);
    return result.ok;
  }

  /**
   * Tenta upsert real em enova_state para um estado de lead.
   * Retorna true em sucesso, false em falha (sem lançar).
   */
  private async supabaseWriteLeadState(state: CrmLeadState): Promise<boolean> {
    const mapped = mapLeadStateToEnovaState(state);
    const result = await supabaseUpsert<EnovaStateRow>(this.cfg, 'enova_state', mapped);
    return result.ok;
  }

  /**
   * Insert com escrita real condicional (T9.12).
   *
   * - crm_leads + writeEnabled=true  → upsert Supabase crm_lead_meta;
   *   fallback writeBuffer se falhar.
   * - crm_lead_state + writeEnabled=true → upsert Supabase enova_state;
   *   fallback writeBuffer se falhar.
   * - Demais tabelas (crm_turns, crm_facts, etc.) → sempre writeBuffer
   *   (schema/destino Supabase não confirmados — T9.12-DIAG BLK-WRITE-02).
   * - writeEnabled=false → writeBuffer em todos os casos (comportamento T8.8).
   */
  async insert<T>(table: CrmTable, row: T): Promise<T> {
    if (this.writeEnabled) {
      if (table === 'crm_leads') {
        const ok = await this.supabaseWriteLead(row as unknown as CrmLead);
        if (ok) return row;
      } else if (table === 'crm_lead_state') {
        const ok = await this.supabaseWriteLeadState(row as unknown as CrmLeadState);
        if (ok) return row;
      }
      // crm_turns, crm_facts e demais: fallthrough para writeBuffer
    }
    return this.writeBuffer.insert<T>(table, row);
  }

  /**
   * Update com escrita real condicional (T9.12).
   *
   * Para crm_leads e crm_lead_state com writeEnabled=true:
   *   1. Busca o registro completo atual (Supabase + writeBuffer via findOne).
   *   2. Mescla o patch.
   *   3. Faz upsert real no Supabase.
   *   4. Em falha Supabase → fallback writeBuffer.
   *
   * Para demais tabelas ou writeEnabled=false → writeBuffer.
   */
  async update<T>(
    table: CrmTable,
    matcher: (row: T) => boolean,
    patch: Partial<T>,
  ): Promise<T | null> {
    if (this.writeEnabled && (table === 'crm_leads' || table === 'crm_lead_state')) {
      const existing = await this.findOne<T>(table, matcher);
      if (existing) {
        // Object.assign garante que o patch é aplicado ao objeto retornado,
        // sem depender do retorno do PostgREST. T9.13B-FIX.
        const merged: T = Object.assign({}, existing, patch);
        let ok = false;
        if (table === 'crm_leads') {
          ok = await this.supabaseWriteLead(merged as unknown as CrmLead);
        } else {
          ok = await this.supabaseWriteLeadState(merged as unknown as CrmLeadState);
        }
        if (ok) return merged;
        // Supabase falhou → writeBuffer absorve o registro completo mesclado
        const buffered = await this.writeBuffer.update<T>(table, matcher, patch);
        if (buffered !== null) return buffered;
        // Registro não existe no writeBuffer (veio só do Supabase real) → insere mesclado
        await this.writeBuffer.insert<T>(table, merged);
        return merged;
      }
      // Fallback: se não encontrou → writeBuffer
    }
    return this.writeBuffer.update<T>(table, matcher, patch);
  }
}
