/**
 * ENOVA 2 — CRM Operacional — Backend in-process (PR-T8.4)
 *
 * ESCOPO:
 *   Backend in-process para o CRM. Armazena dados em Maps durante a vida
 *   do processo Worker. Esta implementação é idêntica em padrão ao
 *   `InMemoryPersistenceBackend` do adapter (`src/adapter/runtime.ts`).
 *
 * LIMITAÇÃO EXPLÍCITA:
 *   Este backend é ISOLADO do backend in-process do adapter core.
 *   Os dados escritos pelo Core (engine, adapter) não aparecem neste CRM
 *   enquanto Supabase real não for conectado. Em PR-T8.8, ambos apontarão
 *   para o mesmo Supabase → dados serão compartilhados automaticamente.
 *
 * PLUG SUPABASE:
 *   Para conectar Supabase real, basta implementar `CrmBackend` com o
 *   cliente `@supabase/supabase-js` e substituir a exportação `crmBackend`.
 *   Nenhuma linha de `service.ts` ou `routes.ts` precisará mudar.
 *
 * RESTRIÇÃO INVIOLÁVEL:
 *   Este módulo não escreve reply_text, não decide stage, não decide
 *   aprovação de lead ou dossiê.
 */

import type { CrmBackend, CrmTable } from './types.ts';
import { diagLog } from '../meta/prod-diag.ts';

// ---------------------------------------------------------------------------
// Backend in-process — implementação real para PR-T8.4
// ---------------------------------------------------------------------------

export class CrmInMemoryBackend implements CrmBackend {
  private readonly store: Map<CrmTable, unknown[]> = new Map();

  constructor() {
    const tables: CrmTable[] = [
      'crm_leads',
      'crm_lead_state',
      'crm_turns',
      'crm_facts',
      'crm_documents',
      'crm_dossier',
      'crm_policy_events',
      'crm_override_log',
      'crm_manual_mode_log',
    ];
    for (const t of tables) this.store.set(t, []);
  }

  async insert<T>(table: CrmTable, row: T): Promise<T> {
    const arr = this.store.get(table) as T[];
    arr.push(row);
    return row;
  }

  async update<T>(
    table: CrmTable,
    matcher: (row: T) => boolean,
    patch: Partial<T>,
  ): Promise<T | null> {
    const arr = this.store.get(table) as T[];
    const idx = arr.findIndex(matcher);
    if (idx < 0) return null;
    arr[idx] = { ...arr[idx], ...patch };
    return arr[idx];
  }

  async findOne<T>(
    table: CrmTable,
    matcher: (row: T) => boolean,
  ): Promise<T | null> {
    const arr = this.store.get(table) as T[];
    return arr.find(matcher) ?? null;
  }

  async findMany<T>(
    table: CrmTable,
    matcher: (row: T) => boolean,
  ): Promise<T[]> {
    const arr = this.store.get(table) as T[];
    return arr.filter(matcher);
  }

  async findAll<T>(table: CrmTable): Promise<T[]> {
    return (this.store.get(table) as T[]) ?? [];
  }
}

// ---------------------------------------------------------------------------
// Singleton module-level — compartilhado por todas as requests do Worker
// (modo in-memory padrão; mantido para retrocompatibilidade com PR-T8.4..T8.6)
// ---------------------------------------------------------------------------

export const crmBackend: CrmBackend = new CrmInMemoryBackend();

// ---------------------------------------------------------------------------
// Factory de backend — PR-T8.8
// Resolve o backend conforme o env (SUPABASE_REAL_ENABLED + envs).
// Quando flag desligada ou envs ausentes, devolve o singleton in-memory
// (comportamento idêntico a PR-T8.4..T8.6).
// ---------------------------------------------------------------------------

let supabaseBackendSingleton: CrmBackend | null = null;
let supabaseBackendWriteEnabled = false;

/**
 * Resolve o backend CRM ativo para o request corrente.
 * - Se `SUPABASE_REAL_ENABLED === "true"` e envs estiverem presentes →
 *   `SupabaseCrmBackend` (leitura real; escrita real se `SUPABASE_WRITE_ENABLED === "true"`
 *   apenas para crm_leads → crm_lead_meta e crm_lead_state → enova_state).
 * - Caso contrário → `crmBackend` (in-memory, comportamento PR-T8.6).
 *
 * Singleton é invalidado se `SUPABASE_WRITE_ENABLED` mudar entre requests.
 */
export async function getCrmBackend(env: Record<string, unknown>): Promise<CrmBackend> {
  const flag = env?.SUPABASE_REAL_ENABLED === 'true';
  const url = typeof env?.SUPABASE_URL === 'string' ? (env.SUPABASE_URL as string) : '';
  const key =
    typeof env?.SUPABASE_SERVICE_ROLE_KEY === 'string'
      ? (env.SUPABASE_SERVICE_ROLE_KEY as string)
      : '';

  if (!flag) {
    diagLog('runtime.guard.in_memory_fallback', {
      module: 'crm',
      reason: 'flag_off',
      persistence_mode: 'in_memory',
    });
    return crmBackend;
  }

  if (!url || !key) {
    diagLog('runtime.guard.in_memory_fallback', {
      module: 'crm',
      reason: 'envs_missing',
      persistence_mode: 'in_memory',
      url_present: !!url,
      key_present: !!key,
    });
    return crmBackend;
  }

  const writeEnabled = env?.SUPABASE_WRITE_ENABLED === 'true';

  if (!supabaseBackendSingleton || supabaseBackendWriteEnabled !== writeEnabled) {
    const mod = await import('../supabase/crm-store.ts');
    supabaseBackendSingleton = new mod.SupabaseCrmBackend({ url, serviceRoleKey: key }, writeEnabled);
    supabaseBackendWriteEnabled = writeEnabled;
  }
  return supabaseBackendSingleton;
}
