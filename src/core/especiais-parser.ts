/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator dos Especiais (L15 + L16)
 *
 * Normaliza apenas os sinais estruturais dos trilhos P3, multi e variantes mínimas.
 */

import type {
  EspecialTrackKind,
  EspeciaisParseStatus,
} from './especiais-rules.ts';
import {
  ESPECIAIS_MULTI_REQUIRED_FACTS,
  ESPECIAIS_OPTIONAL_FACTS,
  ESPECIAIS_P3_REQUIRED_FACTS,
} from './especiais-rules.ts';
import type { ProcessoMode } from './meio-a-rules.ts';
import type { RegimeTrabalho } from './meio-b-rules.ts';

export interface EspeciaisTurnExtract {
  facts_current: Record<string, unknown>;
  facts_extracted: Record<string, unknown>;
}

export interface EspeciaisSignals {
  processo_detected: boolean;
  processo_value: ProcessoMode | null;
  p3_required_detected: boolean;
  p3_required_value: boolean | null;
  work_regime_p2_detected: boolean;
  work_regime_p2_value: RegimeTrabalho | null;
  monthly_income_p2_detected: boolean;
  monthly_income_p2_value: number | null;
  autonomo_has_ir_p2_detected: boolean;
  autonomo_has_ir_p2_value: boolean | null;
  ctps_36m_p2_detected: boolean;
  ctps_36m_p2_value: boolean | null;
  work_regime_p3_detected: boolean;
  work_regime_p3_value: RegimeTrabalho | null;
  multi_track_active: boolean;
  p3_track_active: boolean;
  active_track: EspecialTrackKind;
  parse_status: EspeciaisParseStatus;
  keys_checked: string[];
}

const VALID_PROCESSO = new Set<string>([
  'solo',
  'conjunto',
  'composicao_familiar',
]);

const VALID_REGIMES = new Set<string>([
  'clt',
  'autonomo',
  'aposentado',
  'servidor',
  'informal',
  'multiplo',
]);

export function extractEspeciaisSignals(input: EspeciaisTurnExtract): EspeciaisSignals {
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const processoValue = normalizeProcesso(merged['processo']);
  const p3RequiredValue = normalizeBoolean(merged['p3_required']);
  const workRegimeP2Value = normalizeRegime(merged['work_regime_p2']);
  const monthlyIncomeP2Value = normalizeNumber(merged['monthly_income_p2']);
  const autonomoHasIrP2Value = normalizeBoolean(merged['autonomo_has_ir_p2']);
  const ctps36mP2Value = normalizeBoolean(merged['ctps_36m_p2']);
  const workRegimeP3Value = normalizeRegime(merged['work_regime_p3']);

  const multiTrackActive =
    processoValue === 'conjunto' ||
    workRegimeP2Value !== null ||
    monthlyIncomeP2Value !== null ||
    autonomoHasIrP2Value !== null ||
    ctps36mP2Value !== null;
  const p3TrackActive = p3RequiredValue === true || workRegimeP3Value !== null;

  return {
    processo_detected: processoValue !== null,
    processo_value: processoValue,
    p3_required_detected: p3RequiredValue !== null,
    p3_required_value: p3RequiredValue,
    work_regime_p2_detected: workRegimeP2Value !== null,
    work_regime_p2_value: workRegimeP2Value,
    monthly_income_p2_detected: monthlyIncomeP2Value !== null,
    monthly_income_p2_value: monthlyIncomeP2Value,
    autonomo_has_ir_p2_detected: autonomoHasIrP2Value !== null,
    autonomo_has_ir_p2_value: autonomoHasIrP2Value,
    ctps_36m_p2_detected: ctps36mP2Value !== null,
    ctps_36m_p2_value: ctps36mP2Value,
    work_regime_p3_detected: workRegimeP3Value !== null,
    work_regime_p3_value: workRegimeP3Value,
    multi_track_active: multiTrackActive,
    p3_track_active: p3TrackActive,
    active_track: resolveEspecialTrack(p3TrackActive, multiTrackActive),
    parse_status: computeParseStatus(
      processoValue !== null,
      p3RequiredValue !== null,
      workRegimeP2Value !== null,
      monthlyIncomeP2Value !== null,
      autonomoHasIrP2Value !== null,
      ctps36mP2Value !== null,
      workRegimeP3Value !== null,
      p3TrackActive || multiTrackActive,
    ),
    keys_checked: [
      ...ESPECIAIS_MULTI_REQUIRED_FACTS,
      ...ESPECIAIS_P3_REQUIRED_FACTS,
      ...ESPECIAIS_OPTIONAL_FACTS,
    ],
  };
}

export function resolveEspecialTrack(
  p3TrackActive: boolean,
  multiTrackActive: boolean,
): EspecialTrackKind {
  if (p3TrackActive) return 'p3';
  if (multiTrackActive) return 'multi';
  return 'none';
}

function normalizeProcesso(raw: unknown): ProcessoMode | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (!VALID_PROCESSO.has(value)) return null;
  return value as ProcessoMode;
}

function normalizeRegime(raw: unknown): RegimeTrabalho | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (!VALID_REGIMES.has(value)) return null;
  return value as RegimeTrabalho;
}

function normalizeBoolean(raw: unknown): boolean | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'boolean') return raw;
  const value = String(raw).trim().toLowerCase();
  if (['sim', 'true', '1'].includes(value)) return true;
  if (['nao', 'não', 'false', '0'].includes(value)) return false;
  return null;
}

function normalizeNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function computeParseStatus(
  processoDetected: boolean,
  p3RequiredDetected: boolean,
  workRegimeP2Detected: boolean,
  monthlyIncomeP2Detected: boolean,
  autonomoHasIrP2Detected: boolean,
  ctps36mP2Detected: boolean,
  workRegimeP3Detected: boolean,
  trackDetected: boolean,
): EspeciaisParseStatus {
  if (trackDetected) return 'ready';
  if (
    processoDetected ||
    p3RequiredDetected ||
    workRegimeP2Detected ||
    monthlyIncomeP2Detected ||
    autonomoHasIrP2Detected ||
    ctps36mP2Detected ||
    workRegimeP3Detected
  ) {
    return 'partial';
  }
  return 'empty';
}
