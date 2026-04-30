/**
 * ENOVA 2 — Supabase operacional controlado (PR-T8.8)
 *
 * SupabaseCrmBackend — implementação de `CrmBackend` que LÊ do Supabase real
 * mapeando para o schema canônico CRM (`crm_*`) declarado em `src/crm/types.ts`.
 *
 * REGRA DE OURO desta PR:
 *   - Leitura: real, com mapeamento mínimo, limite de 100 linhas por padrão.
 *   - Escrita: NÃO toca o banco real. Escrita real fica em PR-T8.9+ quando
 *     schema, RLS e bucket policies forem confirmados.
 *   - Reset/delete: PROIBIDOS nesta PR.
 *
 * Por que escrita não vai pro Supabase real aqui:
 *   1. Schema real (`crm_lead_meta`, `enova_state`, `enova_docs` etc) é
 *      diferente do schema canônico CRM (`crm_leads`, `crm_lead_state`,
 *      `crm_documents` etc). Diagnóstico em PR-T8.7 confirmou nomenclatura
 *      tripla não consolidada.
 *   2. Várias tabelas alvo têm RLS desativado (lead_auditoria,
 *      lead_timeline_events, crm_override_log, enova_docs etc). Escrita
 *      sem policy correta é risco operacional.
 *   3. Tabelas têm dados reais/legados (enova_log: 50k linhas, enova_state:
 *      20 linhas). Append acidental polui histórico.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Sem reply_text.
 *   - Sem decisão de stage.
 *   - Sem alteração de schema/RLS/bucket.
 *   - Sem delete real.
 *   - Sem amplificação de carga (limites baixos por padrão).
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
  const lead_id = asString(row.lead_id) || `crm_lead_meta:${fallbackId}`;
  return {
    lead_id,
    external_ref: asNullableString(row.external_ref),
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
// SupabaseCrmBackend — implementa CrmBackend
// ---------------------------------------------------------------------------

export class SupabaseCrmBackend implements CrmBackend {
  private readonly cfg: SupabaseConfig;
  /**
   * Buffer in-memory para escritas. Nesta PR, escrita REAL no Supabase é
   * proibida (PR-T8.8 §regras de escrita). Toda mutação fica em buffer
   * volátil — o operador pode validar via /crm/case-file mesmo no modo real.
   */
  private readonly writeBuffer: CrmInMemoryBackend = new CrmInMemoryBackend();

  constructor(cfg: SupabaseConfig) {
    this.cfg = cfg;
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

    // Tabelas sem mapeamento confirmado nesta PR (turns, facts, dossier,
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
  // Escritas — APENAS in-memory nesta PR
  // -------------------------------------------------------------------------

  /**
   * Escrita NÃO toca Supabase real nesta PR. Vai para o writeBuffer interno.
   * Justificativa em §6 de T8_SUPABASE_OPERACIONAL.md.
   */
  async insert<T>(table: CrmTable, row: T): Promise<T> {
    return this.writeBuffer.insert<T>(table, row);
  }

  async update<T>(
    table: CrmTable,
    matcher: (row: T) => boolean,
    patch: Partial<T>,
  ): Promise<T | null> {
    return this.writeBuffer.update<T>(table, matcher, patch);
  }
}
