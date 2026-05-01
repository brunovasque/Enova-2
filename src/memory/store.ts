/**
 * ENOVA 2 — PR-T8.13 — Memory store (in-memory, FIFO, isolado)
 *
 * REGRA SOBERANA:
 *   Store é puramente in-memory nesta PR. Persistência real (Supabase)
 *   fica para PR futura — quando habilitada, deve preservar a interface
 *   `MemoryStore` sem alterar consumidores.
 *
 *   Não há promoção automática, não há decisão automática, não há
 *   alteração de stage/fact aqui. Store apenas guarda, consulta e marca.
 */

import type {
  LearningCandidateRecord,
  MemoryCategory,
  MemoryRecord,
  MemoryStatus,
} from './types.ts';

export interface MemoryStore {
  insert(record: MemoryRecord): MemoryRecord;
  list(): MemoryRecord[];
  listByLead(lead_ref: string): MemoryRecord[];
  listLearningCandidates(filterStatus?: MemoryStatus): LearningCandidateRecord[];
  findById(id: string): MemoryRecord | null;
  updateStatus(id: string, next: MemoryStatus, patch: Partial<LearningCandidateRecord>): MemoryRecord | null;
  size(): number;
  clear(): void;
  countByCategory(): Record<MemoryCategory, number>;
}

const MEMORY_STORE_LIMIT = 5000;

export function createInMemoryMemoryStore(limit = MEMORY_STORE_LIMIT): MemoryStore {
  const records: MemoryRecord[] = [];
  const indexById = new Map<string, MemoryRecord>();

  function evictIfNeeded() {
    while (records.length > limit) {
      const removed = records.shift();
      if (removed) indexById.delete(removed.id);
    }
  }

  return {
    insert(record) {
      records.push(record);
      indexById.set(record.id, record);
      evictIfNeeded();
      return record;
    },

    list() {
      return records.map((r) => ({ ...r }));
    },

    listByLead(lead_ref) {
      return records
        .filter((r) => r.lead_ref === lead_ref)
        .map((r) => ({ ...r }));
    },

    listLearningCandidates(filterStatus) {
      const candidates = records.filter(
        (r): r is LearningCandidateRecord => r.category === 'learning_candidate',
      );
      if (filterStatus) {
        return candidates.filter((c) => c.status === filterStatus).map((c) => ({ ...c }));
      }
      return candidates.map((c) => ({ ...c }));
    },

    findById(id) {
      const found = indexById.get(id);
      return found ? { ...found } : null;
    },

    updateStatus(id, next, patch) {
      const found = indexById.get(id);
      if (!found) return null;
      const updated: MemoryRecord = {
        ...found,
        ...patch,
        status: next,
        updated_at: new Date().toISOString(),
      };
      const idx = records.findIndex((r) => r.id === id);
      if (idx >= 0) records[idx] = updated;
      indexById.set(id, updated);
      return { ...updated };
    },

    size() {
      return records.length;
    },

    clear() {
      records.length = 0;
      indexById.clear();
    },

    countByCategory() {
      const counts: Record<MemoryCategory, number> = {
        attendance_memory: 0,
        learning_candidate: 0,
        contract_memory: 0,
        performance_memory: 0,
        error_memory: 0,
        commercial_memory: 0,
        product_memory: 0,
      };
      for (const r of records) {
        counts[r.category] = (counts[r.category] ?? 0) + 1;
      }
      return counts;
    },
  };
}

let sharedStore: MemoryStore | null = null;

export function getSharedMemoryStore(): MemoryStore {
  if (!sharedStore) sharedStore = createInMemoryMemoryStore();
  return sharedStore;
}

export function resetSharedMemoryStore(): void {
  sharedStore = createInMemoryMemoryStore();
}

/**
 * Indica se o backend de memória deve operar em modo Supabase real.
 *
 * REGRA: Mesmo se SUPABASE_REAL_ENABLED estiver ativo, a flag dedicada
 * MEMORY_SUPABASE_ENABLED é necessária. Nesta PR a integração real
 * NÃO é implementada — apenas reportada via status.
 */
export function isMemorySupabaseFlagEnabled(env: Record<string, unknown> = {}): boolean {
  return env['MEMORY_SUPABASE_ENABLED'] === 'true';
}
