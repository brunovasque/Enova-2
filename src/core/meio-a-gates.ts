/**
 * ENOVA 2 — Core Mecânico 2 — Critérios e Gates do Meio A (L07 + L08)
 *
 * Avalia apenas estado civil, processo e composição mínima relevante.
 * Não abre renda, elegibilidade, docs ou fala.
 */

import type { MeioASignals } from './meio-a-parser.ts';
import {
  MEIO_A_ADVANCE_CRITERIA,
  MEIO_A_BLOCKING_CONDITIONS,
  MEIO_A_NEXT_STEP,
  MEIO_A_SIGNAL_POLICY,
} from './meio-a-rules.ts';

export interface MeioACriteriaResult {
  can_advance: boolean;
  authorized_next_step: string;
  next_objective: string;
  criteria_code: string;
  structural_reason: string;
  track_signal: string;
  missing_required_facts: string[];
  activated_gates: Array<'G_FATO_CRITICO_AUSENTE' | 'G_COMPOSICAO_FAMILIAR'>;
}

export function evaluateMeioACriteria(signals: MeioASignals): MeioACriteriaResult {
  const missingRequiredFacts: string[] = [];

  if (!signals.estado_civil_detected) {
    missingRequiredFacts.push('estado_civil');
  }

  if (!signals.processo_detected) {
    missingRequiredFacts.push('processo');
  }

  if (missingRequiredFacts.length > 0) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: `coletar_${missingRequiredFacts[0] ?? 'facto_critico'}`,
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason:
        `Facts críticos ausentes no Meio A: [${missingRequiredFacts.join(', ')}].`,
      track_signal: MEIO_A_SIGNAL_POLICY.TRILHO_VALIDO_SEM_COMPOSICAO,
      missing_required_facts: missingRequiredFacts,
      activated_gates: ['G_FATO_CRITICO_AUSENTE'],
    };
  }

  if (signals.estado_civil_value === 'casado_civil' && signals.processo_value !== 'conjunto') {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: 'corrigir_processo_para_conjunto',
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.PROCESSO_INVALIDO_PARA_ESTADO_CIVIL,
      structural_reason:
        `estado_civil='casado_civil' exige processo='conjunto'; ` +
        `processo atual='${signals.processo_value}'.`,
      track_signal: MEIO_A_SIGNAL_POLICY.CASADO_CIVIL_FORCA_CONJUNTO,
      missing_required_facts: [],
      activated_gates: ['G_COMPOSICAO_FAMILIAR'],
    };
  }

  if (signals.composition_required && !signals.composition_actor_detected) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: 'coletar_composition_actor',
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.COMPOSICAO_SEM_ATOR,
      structural_reason:
        `processo='composicao_familiar' exige composition_actor válido no Meio A.`,
      track_signal: MEIO_A_SIGNAL_POLICY.COMPOSICAO_RELEVANTE_DETECTADA,
      missing_required_facts: ['composition_actor'],
      activated_gates: ['G_COMPOSICAO_FAMILIAR'],
    };
  }

  if (signals.dependents_required && !signals.dependents_count_detected) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: 'coletar_dependents_count',
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.DEPENDENTE_SEM_QUANTIDADE,
      structural_reason:
        `dependents_applicable=true exige dependents_count antes de concluir a composição do Meio A.`,
      track_signal: MEIO_A_SIGNAL_POLICY.DEPENDENTE_APLICAVEL,
      missing_required_facts: ['dependents_count'],
      activated_gates: ['G_COMPOSICAO_FAMILIAR'],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: MEIO_A_NEXT_STEP.ADVANCE_TO_RENDA,
    next_objective: `avancar_para_${MEIO_A_NEXT_STEP.ADVANCE_TO_RENDA}`,
    criteria_code: MEIO_A_ADVANCE_CRITERIA.TRILHO_VALIDO_ESTRUTURAL,
    structural_reason: buildAdvanceReason(signals),
    track_signal: buildTrackSignal(signals),
    missing_required_facts: [],
    activated_gates: [],
  };
}

function buildAdvanceReason(signals: MeioASignals): string {
  const base =
    `Meio A validado com estado_civil='${signals.estado_civil_value}' ` +
    `e processo='${signals.processo_value}'.`;

  if (signals.composition_actor_detected) {
    return `${base} composition_actor='${signals.composition_actor_value}' confirmado.`;
  }

  return `${base} Nenhuma composição adicional crítica pendente neste recorte.`;
}

function buildTrackSignal(signals: MeioASignals): string {
  if (signals.dependents_required) {
    return MEIO_A_SIGNAL_POLICY.DEPENDENTE_APLICAVEL;
  }

  if (signals.p3_required_value === true) {
    return MEIO_A_SIGNAL_POLICY.COMPOSICAO_COMPLEXA_P3;
  }

  if (signals.composition_actor_detected) {
    return MEIO_A_SIGNAL_POLICY.COMPOSICAO_RELEVANTE_DETECTADA;
  }

  return MEIO_A_SIGNAL_POLICY.TRILHO_VALIDO_SEM_COMPOSICAO;
}
