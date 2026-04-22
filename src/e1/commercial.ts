import type { RegraComercial } from './types.ts';
import { readCommercialRules } from './store.ts';

export interface CommercialRuleQuery {
  scope_hint?: string;
  tag?: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function readCommercialRulesForContext(query: CommercialRuleQuery = {}): RegraComercial[] {
  const active = readCommercialRules().filter((rule) => rule.status === 'ativa');

  return active.filter((rule) => {
    if (query.scope_hint && !normalize(rule.scope).includes(normalize(query.scope_hint))) {
      return false;
    }

    if (query.tag) {
      const tags = rule.tags ?? [];
      return tags.some((tag) => normalize(tag) === normalize(query.tag ?? ''));
    }

    return true;
  });
}

