import type { ItemNormativo } from './types.ts';
import { readNormativeItems } from './store.ts';

export interface NormativeConsultQuery {
  citation_ref?: string;
  tag?: string;
}

export interface NormativeConsultResult {
  source_kind: 'normativo';
  found: boolean;
  applicable: boolean;
  blocked_reason?: string;
  item: ItemNormativo | null;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function consultNormativeBase(query: NormativeConsultQuery = {}): NormativeConsultResult {
  const activeItems = readNormativeItems().filter((item) => item.status !== 'suspenso' && item.status !== 'arquivado');

  const item = activeItems.find((candidate) => {
    if (query.citation_ref && normalize(candidate.citation_ref) !== normalize(query.citation_ref)) {
      return false;
    }

    if (query.tag) {
      const tags = candidate.tags ?? [];
      return tags.some((tag) => normalize(tag) === normalize(query.tag ?? ''));
    }

    return true;
  }) ?? null;

  if (!item) {
    return {
      source_kind: 'normativo',
      found: false,
      applicable: false,
      blocked_reason: 'not_found',
      item: null,
    };
  }

  if (item.status === 'desatualizado') {
    return {
      source_kind: 'normativo',
      found: true,
      applicable: false,
      blocked_reason: 'norma_desatualizada',
      item,
    };
  }

  return {
    source_kind: 'normativo',
    found: true,
    applicable: true,
    item,
  };
}

