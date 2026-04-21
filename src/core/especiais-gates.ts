/**
 * ENOVA 2 — Core Mecânico 2 — Critérios e Gates dos Especiais (L15 + L16)
 */

import type { EspeciaisSignals } from './especiais-parser.ts';
import {
  ESPECIAIS_ADVANCE_CRITERIA,
  ESPECIAIS_BLOCKING_CONDITIONS,
  ESPECIAIS_NEXT_STEP,
  ESPECIAIS_SIGNAL_POLICY,
} from './especiais-rules.ts';

export interface EspeciaisCriteriaResult {
  can_advance: boolean;
  authorized_next_step: string;
  next_objective: string;
  criteria_code: string;
  structural_reason: string;
  track_signal: string;
  missing_required_facts: string[];
  activated_gates: Array<'G_FATO_CRITICO_AUSENTE' | 'G_TRILHO_ESPECIAL'>;
}

export function evaluateEspeciaisCriteria(signals: EspeciaisSignals): EspeciaisCriteriaResult {
  if (signals.active_track === 'none') {
    return {
      can_advance: true,
      authorized_next_step: ESPECIAIS_NEXT_STEP.ADVANCE_TO_DOCS,
      next_objective: `avancar_para_${ESPECIAIS_NEXT_STEP.ADVANCE_TO_DOCS}`,
      criteria_code: ESPECIAIS_ADVANCE_CRITERIA.SEM_TRILHO_ESPECIAL,
      structural_reason: 'Nenhum trilho especial ativo; o fluxo pode seguir sem abrir L17.',
      track_signal: ESPECIAIS_SIGNAL_POLICY.SEM_TRILHO_ESPECIAL,
      missing_required_facts: [],
      activated_gates: [],
    };
  }

  if (signals.active_track === 'p3' && !signals.work_regime_p3_detected) {
    return {
      can_advance: false,
      authorized_next_step: ESPECIAIS_NEXT_STEP.REMAIN_IN_SPECIAL,
      next_objective: 'coletar_work_regime_p3',
      criteria_code: ESPECIAIS_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE_P3,
      structural_reason:
        `trilho P3 ativo exige work_regime_p3 antes de seguir para docs.`,
      track_signal: ESPECIAIS_SIGNAL_POLICY.TRILHO_P3,
      missing_required_facts: ['work_regime_p3'],
      activated_gates: ['G_FATO_CRITICO_AUSENTE', 'G_TRILHO_ESPECIAL'],
    };
  }

  if (signals.active_track === 'multi') {
    const missingRequiredFacts: string[] = [];

    if (!signals.work_regime_p2_detected) {
      missingRequiredFacts.push('work_regime_p2');
    }

    if (!signals.monthly_income_p2_detected) {
      missingRequiredFacts.push('monthly_income_p2');
    }

    if (missingRequiredFacts.length > 0) {
      return {
        can_advance: false,
        authorized_next_step: ESPECIAIS_NEXT_STEP.REMAIN_IN_SPECIAL,
        next_objective: `coletar_${missingRequiredFacts[0] ?? 'facto_critico'}`,
        criteria_code: ESPECIAIS_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE_MULTI,
        structural_reason:
          `trilho multi ativo exige facts mínimos de co-participante: [${missingRequiredFacts.join(', ')}].`,
        track_signal: ESPECIAIS_SIGNAL_POLICY.TRILHO_MULTI,
        missing_required_facts: missingRequiredFacts,
        activated_gates: ['G_FATO_CRITICO_AUSENTE', 'G_TRILHO_ESPECIAL'],
      };
    }

    if (
      signals.work_regime_p2_value === 'autonomo' &&
      !signals.autonomo_has_ir_p2_detected
    ) {
      return {
        can_advance: false,
        authorized_next_step: ESPECIAIS_NEXT_STEP.REMAIN_IN_SPECIAL,
        next_objective: 'coletar_autonomo_has_ir_p2',
        criteria_code: ESPECIAIS_BLOCKING_CONDITIONS.MULTI_AUTONOMO_SEM_IR,
        structural_reason:
          `co-participante autônomo exige confirmação estrutural de autonomo_has_ir_p2.`,
        track_signal: ESPECIAIS_SIGNAL_POLICY.TRILHO_MULTI_AUTONOMO,
        missing_required_facts: ['autonomo_has_ir_p2'],
        activated_gates: ['G_TRILHO_ESPECIAL'],
      };
    }
  }

  return {
    can_advance: true,
    authorized_next_step: ESPECIAIS_NEXT_STEP.ADVANCE_TO_DOCS,
    next_objective: `avancar_para_${ESPECIAIS_NEXT_STEP.ADVANCE_TO_DOCS}`,
    criteria_code: ESPECIAIS_ADVANCE_CRITERIA.TRILHO_ESPECIAL_VALIDO,
    structural_reason: buildAdvanceReason(signals),
    track_signal: signals.active_track === 'p3'
      ? ESPECIAIS_SIGNAL_POLICY.TRILHO_P3
      : ESPECIAIS_SIGNAL_POLICY.TRILHO_MULTI,
    missing_required_facts: [],
    activated_gates: [],
  };
}

function buildAdvanceReason(signals: EspeciaisSignals): string {
  if (signals.active_track === 'p3') {
    return `Trilho especial P3 validado com work_regime_p3='${signals.work_regime_p3_value}'.`;
  }

  return (
    `Trilho especial multi validado com work_regime_p2='${signals.work_regime_p2_value}' ` +
    `e monthly_income_p2='${signals.monthly_income_p2_value}'.`
  );
}
