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
  SupabaseQueryResult,
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
    // external_ref OMITIDA — coluna não existe no Supabase real (PGRST204 T9.13F).
    // customer_name OMITIDA — coluna não existe no Supabase real (PGRST204 T9.13E).
    // Ambas preservadas apenas no CRM canônico (CrmLead) e no writeBuffer.
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
    // next_objective OMITIDA — coluna não existe no Supabase real (PGRST204 T9.13F).
    // block_advance OMITIDA — coluna não existe no Supabase real (PGRST204 T9.13E).
    // Ambas preservadas apenas no CRM canônico (CrmLeadState) e no writeBuffer.
    state_version: state.state_version,
    updated_at: state.updated_at,
  };
}

// ---------------------------------------------------------------------------
// WriteDiagEntry — diagnóstico de escrita real (T9.13D-DIAG)
// ---------------------------------------------------------------------------

/**
 * Registro de diagnóstico gerado a cada tentativa de escrita real.
 * Acumulado em `SupabaseCrmBackend.writeLog` sem imprimir diretamente —
 * o consumidor (prova) decide quando e como exibir.
 */
export interface WriteDiagEntry {
  table: string;
  target_table: string;
  write_enabled: boolean;
  attempted_real_write: boolean;
  used_fallback: boolean;
  ok: boolean;
  http_status: number | null;
  rows: number;
  error: string | null;
  test_id: string;
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

  /**
   * Log de diagnóstico acumulado por cada tentativa de escrita real — T9.13D-DIAG.
   * Nunca impresso diretamente aqui; o consumidor (prova) lê e exibe.
   * Não contém secrets — apenas metadados de resultado e test_id seguro.
   */
  public readonly writeLog: WriteDiagEntry[] = [];

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
   * Retorna o resultado completo do PostgREST — sem lançar em erro de rede.
   * Caller é responsável por checar .ok e registrar no writeLog (T9.13D-DIAG).
   */
  private async supabaseWriteLead(lead: CrmLead): Promise<SupabaseQueryResult<CrmLeadMetaRow>> {
    const mapped = mapLeadToMeta(lead);
    return supabaseUpsert<CrmLeadMetaRow>(this.cfg, 'crm_lead_meta', mapped);
  }

  /**
   * Tenta upsert real em enova_state para um estado de lead.
   * Retorna o resultado completo do PostgREST — sem lançar em erro de rede.
   * Caller é responsável por checar .ok e registrar no writeLog (T9.13D-DIAG).
   */
  private async supabaseWriteLeadState(state: CrmLeadState): Promise<SupabaseQueryResult<EnovaStateRow>> {
    const mapped = mapLeadStateToEnovaState(state);
    return supabaseUpsert<EnovaStateRow>(this.cfg, 'enova_state', mapped);
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
   * - T9.13D-DIAG: resultado do upsert acumulado em writeLog para inspeção.
   */
  async insert<T>(table: CrmTable, row: T): Promise<T> {
    if (this.writeEnabled) {
      if (table === 'crm_leads') {
        const lead = row as unknown as CrmLead;
        const result = await this.supabaseWriteLead(lead);
        // test_id: wa_id prefixado com t9_13_ é marcador de prova; outros ficam como '(non-test)'
        const testId =
          typeof lead.external_ref === 'string' && lead.external_ref.startsWith('t9_13_')
            ? lead.external_ref
            : '(non-test)';
        this.writeLog.push({
          table,
          target_table: 'crm_lead_meta',
          write_enabled: true,
          attempted_real_write: true,
          used_fallback: !result.ok,
          ok: result.ok,
          http_status: result.http_status,
          rows: result.rows.length,
          error: result.error,
          test_id: testId,
        });
        if (result.ok) return row;
      } else if (table === 'crm_lead_state') {
        const state = row as unknown as CrmLeadState;
        const result = await this.supabaseWriteLeadState(state);
        const testId = typeof state.lead_id === 'string' ? state.lead_id : '(non-test)';
        this.writeLog.push({
          table,
          target_table: 'enova_state',
          write_enabled: true,
          attempted_real_write: true,
          used_fallback: !result.ok,
          ok: result.ok,
          http_status: result.http_status,
          rows: result.rows.length,
          error: result.error,
          test_id: testId,
        });
        if (result.ok) return row;
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
   * T9.13D-DIAG: resultado do upsert acumulado em writeLog para inspeção.
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
        if (table === 'crm_leads') {
          const lead = merged as unknown as CrmLead;
          const result = await this.supabaseWriteLead(lead);
          const testId =
            typeof lead.external_ref === 'string' && lead.external_ref.startsWith('t9_13_')
              ? lead.external_ref
              : '(non-test)';
          this.writeLog.push({
            table,
            target_table: 'crm_lead_meta',
            write_enabled: true,
            attempted_real_write: true,
            used_fallback: !result.ok,
            ok: result.ok,
            http_status: result.http_status,
            rows: result.rows.length,
            error: result.error,
            test_id: testId,
          });
          if (result.ok) return merged;
          // Supabase falhou → writeBuffer absorve o registro completo mesclado
          const bufferedLead = await this.writeBuffer.update<T>(table, matcher, patch);
          if (bufferedLead !== null) return bufferedLead;
          await this.writeBuffer.insert<T>(table, merged);
          return merged;
        } else {
          const state = merged as unknown as CrmLeadState;
          const result = await this.supabaseWriteLeadState(state);
          const testId = typeof state.lead_id === 'string' ? state.lead_id : '(non-test)';
          this.writeLog.push({
            table,
            target_table: 'enova_state',
            write_enabled: true,
            attempted_real_write: true,
            used_fallback: !result.ok,
            ok: result.ok,
            http_status: result.http_status,
            rows: result.rows.length,
            error: result.error,
            test_id: testId,
          });
          if (result.ok) return merged;
          // Supabase falhou → writeBuffer absorve o registro completo mesclado
          const bufferedState = await this.writeBuffer.update<T>(table, matcher, patch);
          if (bufferedState !== null) return bufferedState;
          await this.writeBuffer.insert<T>(table, merged);
          return merged;
        }
      }
      // Fallback: se não encontrou → writeBuffer
    }
    return this.writeBuffer.update<T>(table, matcher, patch);
  }
}
