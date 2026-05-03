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
    // lead_pool: NOT NULL no Supabase real (23502 confirmado em T9.13H).
    // Valor canônico de produção NÃO definido no repo — sem uso existente encontrado (T9.13H-FIX).
    // BLK-T9.13H-LEAD-POOL-VALUE: valor de prova 't9_13_test'; produção bloqueada.
    // Vasques deve confirmar o valor canônico antes de go-live real.
    lead_pool: 't9_13_test',
    updated_at: lead.updated_at,
    // PGRST204 confirmados em T9.13E/T9.13F/T9.13G — colunas não existem no Supabase real:
    //   external_ref, customer_name, phone_ref, status, manual_mode.
    // Todos os 5 campos preservados no CRM canônico (CrmLead) e writeBuffer.
  };
}

/**
 * BLOQUEADO — BLK-T9.13-STATE-MAPPING (T9.13G).
 *
 * Esta função NÃO deve ser chamada pelo runtime. enova_state real não tem schema
 * compatível com CrmLeadState canônico:
 *   - PGRST204 T9.13E: block_advance não existe
 *   - PGRST204 T9.13F: next_objective não existe
 *   - PGRST204 T9.13G: stage_current, state_version não existem
 *
 * Candidatos legado (sem prova canônica): fase_conversa, last_processed_stage,
 * last_user_stage, intro_etapa. Múltiplos coexistem; sem confirmação de Vasques
 * sobre qual é o destino correto, escrita real fica bloqueada.
 *
 * Mantida no código apenas para retrocompatibilidade do tipo. Toda escrita de
 * crm_lead_state vai para writeBuffer (ver SupabaseCrmBackend.insert/update).
 */
function mapLeadStateToEnovaState(state: CrmLeadState): EnovaStateRow {
  return {
    lead_id: state.lead_id,
    updated_at: state.updated_at,
    // BLK-T9.13-STATE-MAPPING — demais campos omitidos por ausência no schema real.
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
   * Insert com escrita real condicional (T9.12 + T9.13G).
   *
   * - crm_leads + writeEnabled=true  → upsert Supabase crm_lead_meta;
   *   payload reduzido a colunas reais confirmadas: wa_id, updated_at (T9.13G);
   *   fallback writeBuffer se falhar.
   * - crm_lead_state → SEMPRE writeBuffer (BLK-T9.13-STATE-MAPPING).
   *   enova_state real não tem schema compatível com CrmLeadState canônico
   *   (PGRST204: stage_current/state_version/next_objective/block_advance ausentes).
   *   Múltiplos candidatos legado coexistem (fase_conversa, last_processed_stage,
   *   last_user_stage, intro_etapa) sem prova canônica de qual é o destino correto.
   *   writeLog registra o bloqueio explicitamente (used_fallback=true,
   *   attempted_real_write=false, error='BLK-T9.13-STATE-MAPPING').
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
        // BLK-T9.13-STATE-MAPPING — escrita real bloqueada; vai direto para writeBuffer.
        const state = row as unknown as CrmLeadState;
        const testId = typeof state.lead_id === 'string' ? state.lead_id : '(non-test)';
        this.writeLog.push({
          table,
          target_table: 'enova_state',
          write_enabled: true,
          attempted_real_write: false,
          used_fallback: true,
          ok: false,
          http_status: null,
          rows: 0,
          error: 'BLK-T9.13-STATE-MAPPING: enova_state schema incompatível com CrmLeadState canônico',
          test_id: testId,
        });
      }
      // crm_turns, crm_facts e demais: fallthrough para writeBuffer
    }
    return this.writeBuffer.insert<T>(table, row);
  }

  /**
   * Update com escrita real condicional (T9.12 + T9.13G).
   *
   * Para crm_leads com writeEnabled=true:
   *   1. Busca o registro completo atual (Supabase + writeBuffer via findOne).
   *   2. Mescla o patch.
   *   3. Faz upsert real no Supabase (apenas wa_id + updated_at — T9.13G).
   *   4. Em falha Supabase → fallback writeBuffer.
   *
   * Para crm_lead_state → SEMPRE writeBuffer (BLK-T9.13-STATE-MAPPING).
   *   Mesma razão do insert: enova_state schema incompatível com CrmLeadState canônico.
   *   writeLog registra o bloqueio explicitamente.
   *
   * Para demais tabelas ou writeEnabled=false → writeBuffer.
   * T9.13D-DIAG: resultado do upsert acumulado em writeLog para inspeção.
   */
  async update<T>(
    table: CrmTable,
    matcher: (row: T) => boolean,
    patch: Partial<T>,
  ): Promise<T | null> {
    if (this.writeEnabled && table === 'crm_leads') {
      const existing = await this.findOne<T>(table, matcher);
      if (existing) {
        // Object.assign garante que o patch é aplicado ao objeto retornado,
        // sem depender do retorno do PostgREST. T9.13B-FIX.
        const merged: T = Object.assign({}, existing, patch);
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
      }
      // Fallback: se não encontrou → writeBuffer
    } else if (this.writeEnabled && table === 'crm_lead_state') {
      // BLK-T9.13-STATE-MAPPING — escrita real bloqueada; sempre writeBuffer.
      const existing = await this.findOne<T>(table, matcher);
      const stateForId = (existing ?? patch) as unknown as Partial<CrmLeadState>;
      const testId = typeof stateForId.lead_id === 'string' ? stateForId.lead_id : '(non-test)';
      this.writeLog.push({
        table,
        target_table: 'enova_state',
        write_enabled: true,
        attempted_real_write: false,
        used_fallback: true,
        ok: false,
        http_status: null,
        rows: 0,
        error: 'BLK-T9.13-STATE-MAPPING: enova_state schema incompatível com CrmLeadState canônico',
        test_id: testId,
      });
    }
    return this.writeBuffer.update<T>(table, matcher, patch);
  }
}
