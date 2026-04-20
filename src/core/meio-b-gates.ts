/**
 * ENOVA 2 — Core Mecânico 2 — Critérios e Gates do Meio B (L11 + L12 + L13 + L14)
 */

import type { MeioBSignals } from './meio-b-parser.ts';
import {
  MEIO_B_ADVANCE_CRITERIA,
  MEIO_B_BLOCKING_CONDITIONS,
  MEIO_B_NEXT_STEP,
  MEIO_B_SIGNAL_POLICY,
} from './meio-b-rules.ts';

interface MeioBBaseCriteriaResult {
  can_advance: boolean;
  authorized_next_step: string;
  next_objective: string;
  criteria_code: string;
  structural_reason: string;
  track_signal: string;
  missing_required_facts: string[];
}

export interface MeioBRendaCriteriaResult extends MeioBBaseCriteriaResult {
  activated_gates: Array<'G_FATO_CRITICO_AUSENTE' | 'G_REGIME_RENDA'>;
}

export interface MeioBElegibilidadeCriteriaResult extends MeioBBaseCriteriaResult {
  activated_gates: Array<'G_FATO_CRITICO_AUSENTE' | 'G_ELEGIBILIDADE'>;
}

export function evaluateMeioBRendaCriteria(signals: MeioBSignals): MeioBRendaCriteriaResult {
  const missingRequiredFacts: string[] = [];

  if (!signals.regime_trabalho_detected) {
    missingRequiredFacts.push('regime_trabalho');
  }

  if (!signals.renda_principal_detected) {
    missingRequiredFacts.push('renda_principal');
  }

  if (missingRequiredFacts.length > 0) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_B_NEXT_STEP.REMAIN_IN_RENDA,
      next_objective: `coletar_${missingRequiredFacts[0] ?? 'facto_critico'}`,
      criteria_code: MEIO_B_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason:
        `Facts críticos ausentes no Meio B: [${missingRequiredFacts.join(', ')}].`,
      track_signal: MEIO_B_SIGNAL_POLICY.TRILHO_VALIDO_MEIO_B,
      missing_required_facts: missingRequiredFacts,
      activated_gates: ['G_FATO_CRITICO_AUSENTE'],
    };
  }

  if (signals.autonomo_ir_required && !signals.autonomo_tem_ir_detected) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_B_NEXT_STEP.REMAIN_IN_RENDA,
      next_objective: 'coletar_autonomo_tem_ir',
      criteria_code: MEIO_B_BLOCKING_CONDITIONS.AUTONOMO_SEM_IR,
      structural_reason:
        `regime_trabalho='autonomo' exige confirmação estrutural de autonomo_tem_ir antes do avanço.`,
      track_signal: MEIO_B_SIGNAL_POLICY.AUTONOMO_EXIGE_IR,
      missing_required_facts: ['autonomo_tem_ir'],
      activated_gates: ['G_REGIME_RENDA'],
    };
  }

  if (signals.low_income_solo_signal) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_B_NEXT_STEP.REMAIN_IN_RENDA,
      next_objective: 'avaliar_composicao_renda',
      criteria_code: MEIO_B_BLOCKING_CONDITIONS.RENDA_SOLO_BAIXA,
      structural_reason:
        `processo='solo' com renda_principal abaixo do limite operacional exige avaliar composição antes do avanço.`,
      track_signal: MEIO_B_SIGNAL_POLICY.SUGERIR_COMPOSICAO_RENDA,
      missing_required_facts: [],
      activated_gates: ['G_REGIME_RENDA'],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: MEIO_B_NEXT_STEP.ADVANCE_TO_ELIGIBILITY,
    next_objective: `avancar_para_${MEIO_B_NEXT_STEP.ADVANCE_TO_ELIGIBILITY}`,
    criteria_code: MEIO_B_ADVANCE_CRITERIA.TRILHO_RENDA_VALIDO,
    structural_reason: buildRendaAdvanceReason(signals),
    track_signal: signals.ctps_36_detected
      ? MEIO_B_SIGNAL_POLICY.CTPS_ESTRATEGICA
      : MEIO_B_SIGNAL_POLICY.TRILHO_VALIDO_MEIO_B,
    missing_required_facts: [],
    activated_gates: [],
  };
}

export function evaluateMeioBElegibilidadeCriteria(
  signals: MeioBSignals,
): MeioBElegibilidadeCriteriaResult {
  if (!signals.nacionalidade_detected) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_B_NEXT_STEP.REMAIN_IN_ELIGIBILITY,
      next_objective: 'coletar_nacionalidade',
      criteria_code: MEIO_B_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason: `Fact crítico ausente em elegibilidade: nacionalidade.`,
      track_signal: MEIO_B_SIGNAL_POLICY.RNM_VALIDACAO_OBRIGATORIA,
      missing_required_facts: ['nacionalidade'],
      activated_gates: ['G_FATO_CRITICO_AUSENTE'],
    };
  }

  if (
    signals.nacionalidade_value === 'estrangeiro' &&
    signals.rnm_status_value !== 'valido'
  ) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_B_NEXT_STEP.REMAIN_IN_ELIGIBILITY,
      next_objective: 'validar_rnm',
      criteria_code: MEIO_B_BLOCKING_CONDITIONS.RNM_INVALIDO_OU_AUSENTE,
      structural_reason:
        `nacionalidade='estrangeiro' exige rnm_status='valido' antes de avançar.`,
      track_signal: MEIO_B_SIGNAL_POLICY.RNM_VALIDACAO_OBRIGATORIA,
      missing_required_facts: signals.rnm_status_detected ? [] : ['rnm_status'],
      activated_gates: ['G_ELEGIBILIDADE'],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: MEIO_B_NEXT_STEP.ADVANCE_TO_DOCS,
    next_objective: `avancar_para_${MEIO_B_NEXT_STEP.ADVANCE_TO_DOCS}`,
    criteria_code: MEIO_B_ADVANCE_CRITERIA.ELEGIBILIDADE_MINIMA_VALIDA,
    structural_reason: `Elegibilidade mínima validada com nacionalidade='${signals.nacionalidade_value}'.`,
    track_signal: MEIO_B_SIGNAL_POLICY.TRILHO_VALIDO_MEIO_B,
    missing_required_facts: [],
    activated_gates: [],
  };
}

function buildRendaAdvanceReason(signals: MeioBSignals): string {
  const base =
    `Meio B validado com regime_trabalho='${signals.regime_trabalho_value}' ` +
    `e renda_principal='${signals.renda_principal_value}'.`;

  if (!signals.ctps_36_detected) {
    return `${base} ctps_36 segue complementar e não trava o fluxo neste recorte.`;
  }

  return `${base} ctps_36='${signals.ctps_36_value}' registrado como sinal complementar.`;
}
