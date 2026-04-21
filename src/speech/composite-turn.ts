/**
 * ENOVA 2 — Atendente Especialista MCMV — Turno composto governado
 *
 * Este módulo não parseia texto cru e não escreve resposta final.
 * Ele organiza múltiplos sinais já interpretados como contexto para a IA,
 * preservando policy, contrato cognitivo e resposta livre governada.
 */

import type { McmvCognitiveContract } from './cognitive.ts';
import {
  buildGovernedFreeResponse,
  type GovernedFreeResponseResult,
} from './free-response.ts';
import type { SpeechPolicyEnvelope } from './policy.ts';
import type { FinalSurfaceDraft } from './surface.ts';

export type CompositeTurnInterpretationOwner = 'llm';
export type CompositeTurnGovernanceRole = 'contextualizes_validates_informs_only';
export type CompositeTurnSignalKind = 'fact_candidate' | 'intent' | 'question' | 'objection' | 'preference';
export type CompositeTurnSignalHandling = 'inform_llm' | 'requires_confirmation' | 'defer_due_to_policy';

export interface CompositeTurnSignal {
  kind: CompositeTurnSignalKind;
  key: string;
  value?: string;
  handling: CompositeTurnSignalHandling;
  attempts_to_override_next_objective?: string;
  attempts_to_unblock?: boolean;
}

export interface CompositeTurnInput {
  policy: SpeechPolicyEnvelope;
  cognitive_contract: McmvCognitiveContract;
  signals: CompositeTurnSignal[];
  draft: FinalSurfaceDraft;
}

export interface CompositeTurnContext {
  interpretation_owner: CompositeTurnInterpretationOwner;
  mechanical_parser_priority: 'forbidden';
  governance_role: CompositeTurnGovernanceRole;
  multiple_information_supported: true;
  signal_count: number;
  signals: CompositeTurnSignal[];
  next_objective: string;
  block_advance: boolean;
  constraints: string[];
  forbidden_patterns: string[];
}

export interface GovernedCompositeTurnResult {
  context: CompositeTurnContext;
  free_response: GovernedFreeResponseResult;
  accepted: boolean;
  final_text: string | null;
  governance_wrote_text: false;
  mechanical_parser_dominant: false;
  violations: string[];
}

const COMPOSITE_TURN_CONSTRAINTS = [
  'muitos_sinais_informam_a_ia_sem_reordenar_o_core',
  'respeitar_next_objective_ativo',
  'respeitar_bloqueios_estruturais',
  'confirmar_ambiguidades_sem_avancar_por_conta_propria',
  'governanca_nao_escreve_resposta',
] as const;

const COMPOSITE_TURN_FORBIDDEN_PATTERNS = [
  'parser_mecanico_dominante',
  'resposta_mecanica_por_sinal',
  'script_rigido_para_resposta_composta',
  'fallback_dominante',
  'ignorar_next_objective_por_sinal_extra',
  'desbloquear_fluxo_por_inferencia_conversacional',
] as const;

function buildCompositeTurnContext(input: CompositeTurnInput): CompositeTurnContext {
  return {
    interpretation_owner: 'llm',
    mechanical_parser_priority: 'forbidden',
    governance_role: 'contextualizes_validates_informs_only',
    multiple_information_supported: true,
    signal_count: input.signals.length,
    signals: input.signals.map((signal) => ({ ...signal })),
    next_objective: input.policy.next_objective,
    block_advance: input.policy.block_advance,
    constraints: [...COMPOSITE_TURN_CONSTRAINTS],
    forbidden_patterns: [...COMPOSITE_TURN_FORBIDDEN_PATTERNS],
  };
}

export function assertCompositeTurnConformance(context: CompositeTurnContext): string[] {
  const violations: string[] = [];

  if (context.interpretation_owner !== 'llm') {
    violations.push('composite_turn_interpretation_owner_must_be_llm');
  }

  if (context.mechanical_parser_priority !== 'forbidden') {
    violations.push('mechanical_parser_priority_must_be_forbidden');
  }

  if (context.governance_role !== 'contextualizes_validates_informs_only') {
    violations.push('composite_turn_governance_must_not_write_response');
  }

  if (context.signal_count < 2) {
    violations.push('composite_turn_requires_multiple_signals');
  }

  if (!context.constraints.includes('respeitar_next_objective_ativo')) {
    violations.push('missing_next_objective_constraint_for_composite_turn');
  }

  if (!context.constraints.includes('respeitar_bloqueios_estruturais')) {
    violations.push('missing_structural_block_constraint_for_composite_turn');
  }

  if (!context.forbidden_patterns.includes('parser_mecanico_dominante')) {
    violations.push('missing_dominant_mechanical_parser_prohibition');
  }

  if (!context.forbidden_patterns.includes('script_rigido_para_resposta_composta')) {
    violations.push('missing_composite_rigid_script_prohibition');
  }

  for (const signal of context.signals) {
    if (signal.attempts_to_override_next_objective && signal.attempts_to_override_next_objective !== context.next_objective) {
      violations.push('turn_signal_must_not_override_next_objective');
    }

    if (context.block_advance && signal.attempts_to_unblock === true) {
      violations.push('turn_signal_must_not_override_structural_block');
    }
  }

  return [...new Set(violations)];
}

export function buildGovernedCompositeTurn(input: CompositeTurnInput): GovernedCompositeTurnResult {
  const context = buildCompositeTurnContext(input);
  const freeResponse = buildGovernedFreeResponse({
    policy: input.policy,
    cognitive_contract: input.cognitive_contract,
    draft: input.draft,
  });
  const violations = [
    ...assertCompositeTurnConformance(context),
    ...freeResponse.violations,
  ];
  const uniqueViolations = [...new Set(violations)];
  const accepted = freeResponse.accepted && uniqueViolations.length === 0;

  return {
    context,
    free_response: freeResponse,
    accepted,
    final_text: accepted ? freeResponse.final_text : null,
    governance_wrote_text: false,
    mechanical_parser_dominant: false,
    violations: uniqueViolations,
  };
}
