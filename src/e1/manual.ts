import type {
  DiretivaManual,
  DiretivaManualPriority,
  DiretivaManualScope,
  DiretivaManualType,
} from './types.ts';
import { readManualDirectives } from './store.ts';

const VALID_SCOPES: ReadonlySet<DiretivaManualScope> = new Set(['global', 'por_perfil', 'por_stage', 'por_frente']);
const VALID_PRIORITIES: ReadonlySet<DiretivaManualPriority> = new Set(['alta', 'media', 'baixa']);
const VALID_TYPES: ReadonlySet<DiretivaManualType> = new Set([
  'ajuste_abordagem',
  'excecao_operacional',
  'observacao_estrategica',
  'cuidado_operacional',
  'restricao_temporaria',
  'lembrete_sistema',
]);

export interface ManualDirectiveDraft {
  author?: unknown;
  created_at?: unknown;
  scope?: unknown;
  priority?: unknown;
  directive_type?: unknown;
  content?: unknown;
  rationale?: unknown;
  audit_ref?: unknown;
}

export type ManualDirectiveValidationResult =
  | { ok: true }
  | { ok: false; error_code: string; field: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function listActiveManualDirectives(): DiretivaManual[] {
  return readManualDirectives().filter((directive) => directive.status === 'ativa');
}

export function validateManualDirectiveDraft(draft: ManualDirectiveDraft): ManualDirectiveValidationResult {
  if (!isNonEmptyString(draft.author)) {
    return { ok: false, error_code: 'manual_missing_author', field: 'author' };
  }

  if (!isIsoString(draft.created_at)) {
    return { ok: false, error_code: 'manual_invalid_created_at', field: 'created_at' };
  }

  if (!isNonEmptyString(draft.scope) || !VALID_SCOPES.has(draft.scope as DiretivaManualScope)) {
    return { ok: false, error_code: 'manual_invalid_scope', field: 'scope' };
  }

  if (!isNonEmptyString(draft.priority) || !VALID_PRIORITIES.has(draft.priority as DiretivaManualPriority)) {
    return { ok: false, error_code: 'manual_invalid_priority', field: 'priority' };
  }

  if (!isNonEmptyString(draft.directive_type) || !VALID_TYPES.has(draft.directive_type as DiretivaManualType)) {
    return { ok: false, error_code: 'manual_invalid_directive_type', field: 'directive_type' };
  }

  if (!isNonEmptyString(draft.content)) {
    return { ok: false, error_code: 'manual_missing_content', field: 'content' };
  }

  if (!isNonEmptyString(draft.rationale)) {
    return { ok: false, error_code: 'manual_missing_rationale', field: 'rationale' };
  }

  if (!isNonEmptyString(draft.audit_ref)) {
    return { ok: false, error_code: 'manual_missing_audit_ref', field: 'audit_ref' };
  }

  return { ok: true };
}

