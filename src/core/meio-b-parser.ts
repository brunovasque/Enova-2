/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator do Meio B (L11 + L14)
 *
 * O LLM extrai facts; este módulo apenas valida e normaliza sinais estruturais
 * de regime, renda, IR, CTPS e elegibilidade mínima.
 */

import type {
  MeioBParseStatus,
  Nacionalidade,
  RegimeTrabalho,
  RnmStatus,
} from './meio-b-rules.ts';
import {
  MEIO_B_ELIGIBILITY_REQUIRED_FACTS,
  MEIO_B_OPTIONAL_FACTS,
  MEIO_B_RENDA_REQUIRED_FACTS,
} from './meio-b-rules.ts';

export interface MeioBTurnExtract {
  facts_current: Record<string, unknown>;
  facts_extracted: Record<string, unknown>;
}

export interface MeioBSignals {
  regime_trabalho_detected: boolean;
  regime_trabalho_value: RegimeTrabalho | null;
  renda_principal_detected: boolean;
  renda_principal_value: number | null;
  autonomo_tem_ir_detected: boolean;
  autonomo_tem_ir_value: boolean | null;
  ctps_36_detected: boolean;
  ctps_36_value: boolean | null;
  nacionalidade_detected: boolean;
  nacionalidade_value: Nacionalidade | null;
  rnm_status_detected: boolean;
  rnm_status_value: RnmStatus | null;
  autonomo_ir_required: boolean;
  low_income_solo_signal: boolean;
  parse_status: MeioBParseStatus;
  keys_checked: string[];
}

const VALID_REGIMES = new Set<string>([
  'clt',
  'autonomo',
  'aposentado',
  'servidor',
  'informal',
  'multiplo',
]);

const VALID_NACIONALIDADES = new Set<string>([
  'brasileiro',
  'estrangeiro',
  'naturalizado',
]);

const VALID_RNM_STATUS = new Set<string>([
  'valido',
  'vencido',
  'ausente',
  'indeterminado',
]);

export function extractMeioBSignals(input: MeioBTurnExtract): MeioBSignals {
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const regimeValue = normalizeRegime(merged['regime_trabalho']);
  const rendaValue = normalizeRenda(merged['renda_principal']);
  const autonomoIrValue = normalizeBoolean(merged['autonomo_tem_ir']);
  const ctpsValue = normalizeBoolean(merged['ctps_36']);
  const nacionalidadeValue = normalizeNacionalidade(merged['nacionalidade']);
  const rnmStatusValue = normalizeRnmStatus(merged['rnm_status']);
  const processoValue = normalizeString(merged['processo']);

  const autonomoIrRequired = regimeValue === 'autonomo';
  const lowIncomeSoloSignal =
    processoValue === 'solo' &&
    typeof rendaValue === 'number' &&
    rendaValue < 3000;

  return {
    regime_trabalho_detected: regimeValue !== null,
    regime_trabalho_value: regimeValue,
    renda_principal_detected: rendaValue !== null,
    renda_principal_value: rendaValue,
    autonomo_tem_ir_detected: autonomoIrValue !== null,
    autonomo_tem_ir_value: autonomoIrValue,
    ctps_36_detected: ctpsValue !== null,
    ctps_36_value: ctpsValue,
    nacionalidade_detected: nacionalidadeValue !== null,
    nacionalidade_value: nacionalidadeValue,
    rnm_status_detected: rnmStatusValue !== null,
    rnm_status_value: rnmStatusValue,
    autonomo_ir_required: autonomoIrRequired,
    low_income_solo_signal: lowIncomeSoloSignal,
    parse_status: computeParseStatus(
      regimeValue !== null,
      rendaValue !== null,
      autonomoIrValue !== null,
      ctpsValue !== null,
      nacionalidadeValue !== null,
      rnmStatusValue !== null,
    ),
    keys_checked: [
      ...MEIO_B_RENDA_REQUIRED_FACTS,
      ...MEIO_B_ELIGIBILITY_REQUIRED_FACTS,
      ...MEIO_B_OPTIONAL_FACTS,
    ],
  };
}

function normalizeRegime(raw: unknown): RegimeTrabalho | null {
  const value = normalizeString(raw);
  if (!value || !VALID_REGIMES.has(value)) return null;
  return value as RegimeTrabalho;
}

function normalizeNacionalidade(raw: unknown): Nacionalidade | null {
  const value = normalizeString(raw);
  if (!value || !VALID_NACIONALIDADES.has(value)) return null;
  return value as Nacionalidade;
}

function normalizeRnmStatus(raw: unknown): RnmStatus | null {
  const value = normalizeString(raw);
  if (!value || !VALID_RNM_STATUS.has(value)) return null;
  return value as RnmStatus;
}

function normalizeRenda(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function normalizeBoolean(raw: unknown): boolean | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'boolean') return raw;
  const value = String(raw).trim().toLowerCase();
  if (['sim', 'true', '1'].includes(value)) return true;
  if (['nao', 'não', 'false', '0'].includes(value)) return false;
  return null;
}

function normalizeString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  return String(raw).trim().toLowerCase();
}

function computeParseStatus(
  regimeDetected: boolean,
  rendaDetected: boolean,
  autonomoIrDetected: boolean,
  ctpsDetected: boolean,
  nacionalidadeDetected: boolean,
  rnmDetected: boolean,
): MeioBParseStatus {
  if (regimeDetected && rendaDetected) return 'ready';
  if (
    regimeDetected ||
    rendaDetected ||
    autonomoIrDetected ||
    ctpsDetected ||
    nacionalidadeDetected ||
    rnmDetected
  ) {
    return 'partial';
  }
  return 'empty';
}
