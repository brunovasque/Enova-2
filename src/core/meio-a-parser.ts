/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator do Meio A (L07 + L10)
 *
 * O LLM extrai facts; este módulo apenas valida e normaliza sinais estruturais
 * de estado civil, processo e composição familiar mínima.
 */

import type {
  CompositionActor,
  EstadoCivil,
  MeioAParseStatus,
  ProcessoMode,
} from './meio-a-rules.ts';
import {
  MEIO_A_OPTIONAL_FACTS,
  MEIO_A_REQUIRED_FACTS,
} from './meio-a-rules.ts';

export interface MeioATurnExtract {
  facts_current: Record<string, unknown>;
  facts_extracted: Record<string, unknown>;
}

export interface MeioASignals {
  estado_civil_detected: boolean;
  estado_civil_value: EstadoCivil | null;
  processo_detected: boolean;
  processo_value: ProcessoMode | null;
  composition_actor_detected: boolean;
  composition_actor_value: CompositionActor | null;
  p3_required_detected: boolean;
  p3_required_value: boolean | null;
  dependents_applicable_detected: boolean;
  dependents_applicable_value: boolean | null;
  dependents_count_detected: boolean;
  dependents_count_value: number | null;
  composition_required: boolean;
  dependents_required: boolean;
  parse_status: MeioAParseStatus;
  keys_checked: string[];
}

const VALID_ESTADO_CIVIL = new Set<string>([
  'solteiro',
  'uniao_estavel',
  'casado_civil',
  'divorciado',
  'viuvo',
]);

const VALID_PROCESSO = new Set<string>([
  'solo',
  'conjunto',
  'composicao_familiar',
]);

const VALID_COMPOSITION_ACTOR = new Set<string>([
  'conjuge',
  'parceiro',
  'pai',
  'mae',
  'irmao',
  'outro',
]);

export function extractMeioASignals(input: MeioATurnExtract): MeioASignals {
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const estadoCivilValue = normalizeEstadoCivil(merged['estado_civil']);
  const processoValue = normalizeProcesso(merged['processo']);
  const compositionActorValue = normalizeCompositionActor(merged['composition_actor']);
  const p3RequiredValue = normalizeBoolean(merged['p3_required']);
  const dependentsApplicableValue = normalizeBoolean(merged['dependents_applicable']);
  const dependentsCountValue = normalizeDependentsCount(merged['dependents_count']);

  const estadoCivilDetected = estadoCivilValue !== null;
  const processoDetected = processoValue !== null;
  const compositionActorDetected = compositionActorValue !== null;
  const p3RequiredDetected = p3RequiredValue !== null;
  const dependentsApplicableDetected = dependentsApplicableValue !== null;
  const dependentsCountDetected = dependentsCountValue !== null;
  const compositionRequired = processoValue === 'composicao_familiar';
  const dependentsRequired =
    processoValue !== 'conjunto' && dependentsApplicableValue === true;

  return {
    estado_civil_detected: estadoCivilDetected,
    estado_civil_value: estadoCivilValue,
    processo_detected: processoDetected,
    processo_value: processoValue,
    composition_actor_detected: compositionActorDetected,
    composition_actor_value: compositionActorValue,
    p3_required_detected: p3RequiredDetected,
    p3_required_value: p3RequiredValue,
    dependents_applicable_detected: dependentsApplicableDetected,
    dependents_applicable_value: dependentsApplicableValue,
    dependents_count_detected: dependentsCountDetected,
    dependents_count_value: dependentsCountValue,
    composition_required: compositionRequired,
    dependents_required: dependentsRequired,
    parse_status: computeParseStatus(
      estadoCivilDetected,
      processoDetected,
      compositionActorDetected,
      p3RequiredDetected,
      dependentsApplicableDetected,
      dependentsCountDetected,
    ),
    keys_checked: [
      ...MEIO_A_REQUIRED_FACTS,
      ...MEIO_A_OPTIONAL_FACTS,
    ],
  };
}

function normalizeEstadoCivil(raw: unknown): EstadoCivil | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_ESTADO_CIVIL.has(value)) return value as EstadoCivil;
  return null;
}

function normalizeProcesso(raw: unknown): ProcessoMode | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_PROCESSO.has(value)) return value as ProcessoMode;
  return null;
}

function normalizeCompositionActor(raw: unknown): CompositionActor | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_COMPOSITION_ACTOR.has(value)) return value as CompositionActor;
  return null;
}

function normalizeBoolean(raw: unknown): boolean | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'boolean') return raw;

  const value = String(raw).trim().toLowerCase();
  if (['sim', 'true', '1'].includes(value)) return true;
  if (['nao', 'não', 'false', '0'].includes(value)) return false;
  return null;
}

function normalizeDependentsCount(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return null;
  return value;
}

function computeParseStatus(
  estadoCivilDetected: boolean,
  processoDetected: boolean,
  compositionActorDetected: boolean,
  p3RequiredDetected: boolean,
  dependentsApplicableDetected: boolean,
  dependentsCountDetected: boolean,
): MeioAParseStatus {
  if (estadoCivilDetected && processoDetected) return 'ready';
  if (
    estadoCivilDetected ||
    processoDetected ||
    compositionActorDetected ||
    p3RequiredDetected ||
    dependentsApplicableDetected ||
    dependentsCountDetected
  ) {
    return 'partial';
  }
  return 'empty';
}
