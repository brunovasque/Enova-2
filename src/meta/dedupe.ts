/**
 * ENOVA 2 — PR-T8.11 — Dedupe in-memory para eventos Meta.
 *
 * LIMITAÇÃO DECLARADA: este storage é in-memory por instância do Worker.
 * Em ambiente Cloudflare Workers, instâncias podem ser efêmeras e replicadas.
 * Persistência real (KV / Durable Object / Supabase) fica para PR posterior.
 *
 * Esta camada serve como interface estável: a próxima PR pluga um backend
 * persistente sem mudar o consumidor (`handleMetaWebhook`).
 *
 * REGRAS:
 *   - Evento duplicado → consumer responde 200 sem novo turno (Meta exige 200).
 *   - Buffer com limite (FIFO) para evitar crescimento indefinido.
 *   - Apenas chaves de dedupe, nunca payload sensível.
 */

const DEFAULT_LIMIT = 1000;

export interface DedupeStore {
  has(key: string): boolean;
  remember(key: string): void;
  size(): number;
  clear(): void;
}

export function createInMemoryDedupeStore(limit = DEFAULT_LIMIT): DedupeStore {
  const seen = new Set<string>();
  const order: string[] = [];

  return {
    has(key: string): boolean {
      return seen.has(key);
    },
    remember(key: string): void {
      if (seen.has(key)) return;
      seen.add(key);
      order.push(key);
      while (order.length > limit) {
        const removed = order.shift();
        if (removed !== undefined) {
          seen.delete(removed);
        }
      }
    },
    size(): number {
      return seen.size;
    },
    clear(): void {
      seen.clear();
      order.length = 0;
    },
  };
}

const SHARED_DEDUPE = createInMemoryDedupeStore();

export function getSharedDedupeStore(): DedupeStore {
  return SHARED_DEDUPE;
}

export function resetSharedDedupeStore(): void {
  SHARED_DEDUPE.clear();
}
