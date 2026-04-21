/**
 * ENOVA 2 — Core Mecânico 2 — Critérios e Gates do Final Operacional (L17)
 */

import type { FinalSignals } from './final-parser.ts';
import {
  FINAL_ADVANCE_CRITERIA,
  FINAL_BLOCKING_CONDITIONS,
  FINAL_NEXT_STEP,
  FINAL_SIGNAL_POLICY,
} from './final-rules.ts';

interface FinalBaseCriteriaResult {
  can_advance: boolean;
  authorized_next_step: string;
  next_objective: string;
  criteria_code: string;
  structural_reason: string;
  track_signal: string;
  missing_required_facts: string[];
}

export interface FinalCriteriaResult extends FinalBaseCriteriaResult {
  activated_gates: Array<'G_FATO_CRITICO_AUSENTE' | 'G_FINAL_OPERACIONAL'>;
}

export function evaluateDocsPrepCriteria(signals: FinalSignals): FinalCriteriaResult {
  if (!signals.docs_channel_choice_detected) {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_DOCS_PREP,
      next_objective: 'coletar_docs_channel_choice',
      criteria_code: FINAL_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason: 'docs_prep exige docs_channel_choice antes de seguir.',
      track_signal: FINAL_SIGNAL_POLICY.CANAL_DOCS_ESCOLHIDO,
      missing_required_facts: ['docs_channel_choice'],
      activated_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
    };
  }

  if (signals.docs_channel_choice_value === 'visita_presencial' && signals.visit_interest_value === 'nao') {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_DOCS_PREP,
      next_objective: 'confirmar_visit_interest',
      criteria_code: FINAL_BLOCKING_CONDITIONS.VISITA_NAO_CONFIRMADA,
      structural_reason:
        'recusa explícita de visita bloqueia a trilha presencial até a inconsistência estrutural ser resolvida.',
      track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
      missing_required_facts: [],
      activated_gates: ['G_FINAL_OPERACIONAL'],
    };
  }

  if (signals.visit_track_active) {
    return {
      can_advance: true,
      authorized_next_step: FINAL_NEXT_STEP.ADVANCE_TO_VISIT,
      next_objective: `avancar_para_${FINAL_NEXT_STEP.ADVANCE_TO_VISIT}`,
      criteria_code: FINAL_ADVANCE_CRITERIA.DOCS_CHANNEL_VALIDO,
      structural_reason:
        `docs_channel_choice='${signals.docs_channel_choice_value}' e/ou visit_interest='${signals.visit_interest_value}' ativam a trilha de visita.`,
      track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
      missing_required_facts: [],
      activated_gates: [],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: FINAL_NEXT_STEP.ADVANCE_TO_DOCS_COLLECTION,
    next_objective: `avancar_para_${FINAL_NEXT_STEP.ADVANCE_TO_DOCS_COLLECTION}`,
    criteria_code: FINAL_ADVANCE_CRITERIA.DOCS_CHANNEL_VALIDO,
    structural_reason:
      `docs_channel_choice='${signals.docs_channel_choice_value}' confirmado para entrada em docs_collection.`,
    track_signal: FINAL_SIGNAL_POLICY.CANAL_DOCS_ESCOLHIDO,
    missing_required_facts: [],
    activated_gates: [],
  };
}

export function evaluateDocsCollectionCriteria(signals: FinalSignals): FinalCriteriaResult {
  const missingRequiredFacts: string[] = [];

  if (!signals.doc_identity_status_detected) {
    missingRequiredFacts.push('doc_identity_status');
  }

  if (!signals.doc_income_status_detected) {
    missingRequiredFacts.push('doc_income_status');
  }

  if (!signals.doc_residence_status_detected) {
    missingRequiredFacts.push('doc_residence_status');
  }

  if (missingRequiredFacts.length > 0) {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_DOCS_COLLECTION,
      next_objective: `coletar_${missingRequiredFacts[0] ?? 'facto_critico'}`,
      criteria_code: FINAL_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason:
        `docs_collection exige status documentais mínimos: [${missingRequiredFacts.join(', ')}].`,
      track_signal: FINAL_SIGNAL_POLICY.DOCS_PARCIAIS,
      missing_required_facts: missingRequiredFacts,
      activated_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
    };
  }

  if (!signals.docs_complete) {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_DOCS_COLLECTION,
      next_objective: `regularizar_${signals.pending_doc_keys[0] ?? 'documentacao'}`,
      criteria_code: FINAL_BLOCKING_CONDITIONS.DOCUMENTO_PENDENTE,
      structural_reason:
        `docs_collection ainda possui pendência documental: [${signals.pending_doc_keys.join(', ')}].`,
      track_signal: FINAL_SIGNAL_POLICY.DOCS_PARCIAIS,
      missing_required_facts: [],
      activated_gates: ['G_FINAL_OPERACIONAL'],
    };
  }

  if (signals.docs_channel_choice_value === 'visita_presencial' && signals.visit_interest_value === 'nao') {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_DOCS_COLLECTION,
      next_objective: 'confirmar_visit_interest',
      criteria_code: FINAL_BLOCKING_CONDITIONS.VISITA_NAO_CONFIRMADA,
      structural_reason:
        'docs completos não autorizam handoff de visita quando há recusa explícita de visita.',
      track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
      missing_required_facts: [],
      activated_gates: ['G_FINAL_OPERACIONAL'],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: FINAL_NEXT_STEP.ADVANCE_TO_BROKER_HANDOFF,
    next_objective: signals.visit_track_active
      ? 'preparar_handoff_visita'
      : 'preparar_handoff_correspondente',
    criteria_code: FINAL_ADVANCE_CRITERIA.DOCS_COMPLETOS,
    structural_reason: buildDocsAdvanceReason(signals),
    track_signal: FINAL_SIGNAL_POLICY.DOCS_COMPLETOS,
    missing_required_facts: [],
    activated_gates: [],
  };
}

export function evaluateVisitCriteria(signals: FinalSignals): FinalCriteriaResult {
  if (!signals.visit_interest_detected && !signals.visit_track_active) {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_VISIT,
      next_objective: 'coletar_visit_interest',
      criteria_code: FINAL_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason: 'visit exige visit_interest quando não há canal presencial explícito.',
      track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
      missing_required_facts: ['visit_interest'],
      activated_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
    };
  }

  if (signals.visit_interest_value === 'talvez') {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_VISIT,
      next_objective: 'confirmar_visit_interest',
      criteria_code: FINAL_BLOCKING_CONDITIONS.VISITA_NAO_CONFIRMADA,
      structural_reason: 'visit_interest=talvez exige confirmação estrutural antes do handoff.',
      track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
      missing_required_facts: [],
      activated_gates: ['G_FINAL_OPERACIONAL'],
    };
  }

  if (signals.visit_interest_value === 'nao') {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_VISIT,
      next_objective: 'confirmar_visit_interest',
      criteria_code: FINAL_BLOCKING_CONDITIONS.VISITA_NAO_CONFIRMADA,
      structural_reason: 'visit só deve seguir quando a trilha de visita estiver confirmada.',
      track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
      missing_required_facts: [],
      activated_gates: ['G_FINAL_OPERACIONAL'],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: FINAL_NEXT_STEP.ADVANCE_TO_BROKER_HANDOFF,
    next_objective: 'preparar_handoff_visita',
    criteria_code: FINAL_ADVANCE_CRITERIA.VISITA_CONFIRMADA,
    structural_reason: 'visit confirmada para conversão e handoff estrutural.',
    track_signal: FINAL_SIGNAL_POLICY.VISITA_APLICAVEL,
    missing_required_facts: [],
    activated_gates: [],
  };
}

export function evaluateBrokerHandoffCriteria(signals: FinalSignals): FinalCriteriaResult {
  if (!signals.handoff_readiness_detected) {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_BROKER_HANDOFF,
      next_objective: 'coletar_handoff_readiness',
      criteria_code: FINAL_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason: 'broker_handoff exige handoff_readiness antes de concluir o recorte final.',
      track_signal: signals.visit_track_active
        ? FINAL_SIGNAL_POLICY.HANDOFF_PRONTO_VISITA
        : FINAL_SIGNAL_POLICY.HANDOFF_PRONTO_CORRESPONDENTE,
      missing_required_facts: ['handoff_readiness'],
      activated_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
    };
  }

  if (
    signals.handoff_readiness_value !== 'pronto_para_correspondente' &&
    signals.handoff_readiness_value !== 'pronto_para_visita'
  ) {
    return {
      can_advance: false,
      authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_BROKER_HANDOFF,
      next_objective: 'preparar_handoff_readiness',
      criteria_code: FINAL_BLOCKING_CONDITIONS.HANDOFF_NAO_PRONTO,
      structural_reason:
        `handoff_readiness='${signals.handoff_readiness_value}' ainda não autoriza handoff final.`,
      track_signal: signals.visit_track_active
        ? FINAL_SIGNAL_POLICY.HANDOFF_PRONTO_VISITA
        : FINAL_SIGNAL_POLICY.HANDOFF_PRONTO_CORRESPONDENTE,
      missing_required_facts: [],
      activated_gates: ['G_FINAL_OPERACIONAL'],
    };
  }

  return {
    can_advance: true,
    authorized_next_step: FINAL_NEXT_STEP.REMAIN_IN_BROKER_HANDOFF,
    next_objective: signals.handoff_readiness_value === 'pronto_para_visita'
      ? 'handoff_concluido_visita'
      : 'handoff_concluido_correspondente',
    criteria_code: FINAL_ADVANCE_CRITERIA.HANDOFF_CONCLUIDO,
    structural_reason:
      `broker_handoff concluído com handoff_readiness='${signals.handoff_readiness_value}'.`,
    track_signal: signals.handoff_readiness_value === 'pronto_para_visita'
      ? FINAL_SIGNAL_POLICY.HANDOFF_PRONTO_VISITA
      : FINAL_SIGNAL_POLICY.HANDOFF_PRONTO_CORRESPONDENTE,
    missing_required_facts: [],
    activated_gates: [],
  };
}

function buildDocsAdvanceReason(signals: FinalSignals): string {
  return (
    `Documentos mínimos consolidados com identidade='${signals.doc_identity_status_value}', ` +
    `renda='${signals.doc_income_status_value}' e residência='${signals.doc_residence_status_value}'.`
  );
}
