/**
 * ENOVA 2 — Speech Engine e Surface Única — Política textual mínima (PR1)
 *
 * Este módulo NÃO escreve resposta ao cliente.
 * Ele entrega apenas um envelope estrutural para orientar a IA soberana.
 */

import type { CoreDecision, GateId, StageId } from '../core/types.ts';

export type SurfaceOwner = 'llm';
export type MechanicalSpeechPriority = 'forbidden';
export type FallbackMode = 'non_dominant_guardrail_only';
export type SpeechPolicyIntent = CoreDecision['speech_intent'];

export interface SpeechPolicyInput {
  core_decision: Pick<
    CoreDecision,
    'stage_current' | 'stage_after' | 'next_objective' | 'block_advance' | 'gates_activated' | 'speech_intent'
  >;
}

export interface SpeechPolicyEnvelope {
  surface_owner: SurfaceOwner;
  mechanical_speech_priority: MechanicalSpeechPriority;
  fallback_mode: FallbackMode;
  llm_must_write_final_answer: true;
  mechanical_may_write_customer_text: false;
  speech_intent: SpeechPolicyIntent;
  stage_current: StageId;
  stage_after: StageId;
  next_objective: string;
  block_advance: boolean;
  gates_activated: GateId[];
  governance_constraints: string[];
  forbidden_patterns: string[];
}

const GOVERNANCE_CONSTRAINTS = [
  'respeitar_stage_e_next_objective_do_core',
  'nao_avancar_contra_bloqueio_estrutural',
  'manter_atendimento_especialista_mcmv',
  'usar_governanca_como_restricao_invisivel',
] as const;

const FORBIDDEN_PATTERNS = [
  'mecanico_redige_resposta_final',
  'fallback_dominante',
  'script_textual_duro',
  'surface_engessada_como_motor_principal',
  'camada_abaixo_do_llm_sobrescreve_fala',
] as const;

export function buildSpeechPolicyEnvelope(input: SpeechPolicyInput): SpeechPolicyEnvelope {
  const decision = input.core_decision;

  return {
    surface_owner: 'llm',
    mechanical_speech_priority: 'forbidden',
    fallback_mode: 'non_dominant_guardrail_only',
    llm_must_write_final_answer: true,
    mechanical_may_write_customer_text: false,
    speech_intent: decision.speech_intent,
    stage_current: decision.stage_current,
    stage_after: decision.stage_after,
    next_objective: decision.next_objective,
    block_advance: decision.block_advance,
    gates_activated: [...decision.gates_activated],
    governance_constraints: [...GOVERNANCE_CONSTRAINTS],
    forbidden_patterns: [...FORBIDDEN_PATTERNS],
  };
}

export function assertSpeechPolicyConformance(envelope: SpeechPolicyEnvelope): string[] {
  const violations: string[] = [];

  if (envelope.surface_owner !== 'llm') {
    violations.push('surface_owner_must_be_llm');
  }

  if (envelope.mechanical_speech_priority !== 'forbidden') {
    violations.push('mechanical_speech_priority_must_be_forbidden');
  }

  if (envelope.mechanical_may_write_customer_text !== false) {
    violations.push('mechanical_customer_text_must_be_forbidden');
  }

  if (envelope.fallback_mode !== 'non_dominant_guardrail_only') {
    violations.push('fallback_must_not_be_dominant');
  }

  return violations;
}
