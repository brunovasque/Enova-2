/**
 * ENOVA 2 — Atendente Especialista MCMV — Contrato cognitivo mínimo
 *
 * Este módulo orienta COMO a IA deve conduzir a conversa.
 * Ele não escreve resposta final, não monta script e não substitui a surface.
 */

import type { GateId, StageId } from '../core/types.ts';
import type { SpeechPolicyEnvelope } from './policy.ts';

export type CognitiveOwner = 'llm';
export type CognitiveMode = 'mcmv_specialist_consultative';
export type MechanicalCognitiveRole = 'structural_governance_only';

export interface McmvCognitiveContractInput {
  policy: SpeechPolicyEnvelope;
}

export interface CognitivePolicyAlignment {
  stage_current: StageId;
  stage_after: StageId;
  next_objective: string;
  block_advance: boolean;
  gates_activated: GateId[];
  speech_intent: SpeechPolicyEnvelope['speech_intent'];
}

export interface McmvCognitiveContract {
  contract_id: 'mcmv_cognitive_minimal_v1';
  cognitive_owner: CognitiveOwner;
  final_surface_authority: 'llm';
  mode: CognitiveMode;
  mechanical_role: MechanicalCognitiveRole;
  policy_alignment: CognitivePolicyAlignment;
  specialist_principles: string[];
  required_behaviors: string[];
  knowledge_boundaries: string[];
  forbidden_behaviors: string[];
}

const SPECIALIST_PRINCIPLES = [
  'postura_consultiva_humana',
  'qualificacao_inteligente_de_perfil',
  'uso_de_conhecimento_mcmv_cef_com_responsabilidade',
  'explorar_possibilidades_reais_de_conversao',
  'governanca_estrutural_invisivel',
] as const;

const REQUIRED_BEHAVIORS = [
  'respeitar_next_objective_do_core',
  'respeitar_bloqueios_estruturais',
  'conduzir_com_naturalidade_sem_trilho_duro',
  'adaptar_profundidade_ao_contexto_do_cliente',
  'explicar_possibilidades_sem_prometer_resultado',
] as const;

const KNOWLEDGE_BOUNDARIES = [
  'pode_usar_conhecimento_mcmv_cef_para_orientar',
  'nao_prometer_aprovacao',
  'nao_prometer_valor_de_entrada_parcela_ou_imovel',
  'nao_contradizer_restricao_estrutural_do_core',
  'nao_transformar_duvida_em_elegibilidade_sem_validacao',
] as const;

const FORBIDDEN_BEHAVIORS = [
  'fala_mecanica',
  'script_rigido_dominante',
  'fallback_dominante',
  'resposta_engessada_por_stage',
  'mecanico_com_prioridade_de_fala',
  'mecanico_redige_resposta_final',
  'ignorar_next_objective',
  'avancar_contra_bloqueio_estrutural',
] as const;

function buildPolicyAlignment(policy: SpeechPolicyEnvelope): CognitivePolicyAlignment {
  return {
    stage_current: policy.stage_current,
    stage_after: policy.stage_after,
    next_objective: policy.next_objective,
    block_advance: policy.block_advance,
    gates_activated: [...policy.gates_activated],
    speech_intent: policy.speech_intent,
  };
}

export function buildMcmvCognitiveContract(input: McmvCognitiveContractInput): McmvCognitiveContract {
  return {
    contract_id: 'mcmv_cognitive_minimal_v1',
    cognitive_owner: 'llm',
    final_surface_authority: 'llm',
    mode: 'mcmv_specialist_consultative',
    mechanical_role: 'structural_governance_only',
    policy_alignment: buildPolicyAlignment(input.policy),
    specialist_principles: [...SPECIALIST_PRINCIPLES],
    required_behaviors: [...REQUIRED_BEHAVIORS],
    knowledge_boundaries: [...KNOWLEDGE_BOUNDARIES],
    forbidden_behaviors: [...FORBIDDEN_BEHAVIORS],
  };
}

export function assertMcmvCognitiveContractConformance(contract: McmvCognitiveContract): string[] {
  const violations: string[] = [];

  if (contract.cognitive_owner !== 'llm') {
    violations.push('cognitive_owner_must_be_llm');
  }

  if (contract.final_surface_authority !== 'llm') {
    violations.push('final_surface_authority_must_be_llm');
  }

  if (contract.mechanical_role !== 'structural_governance_only') {
    violations.push('mechanical_role_must_be_structural_only');
  }

  if (!contract.specialist_principles.includes('postura_consultiva_humana')) {
    violations.push('missing_consultative_human_posture');
  }

  if (!contract.required_behaviors.includes('respeitar_next_objective_do_core')) {
    violations.push('missing_next_objective_respect');
  }

  if (!contract.required_behaviors.includes('respeitar_bloqueios_estruturais')) {
    violations.push('missing_structural_block_respect');
  }

  if (!contract.knowledge_boundaries.includes('nao_prometer_aprovacao')) {
    violations.push('missing_no_approval_promise_boundary');
  }

  if (!contract.forbidden_behaviors.includes('script_rigido_dominante')) {
    violations.push('missing_rigid_script_prohibition');
  }

  if (!contract.forbidden_behaviors.includes('fallback_dominante')) {
    violations.push('missing_dominant_fallback_prohibition');
  }

  if (!contract.forbidden_behaviors.includes('mecanico_com_prioridade_de_fala')) {
    violations.push('missing_mechanical_speech_priority_prohibition');
  }

  return violations;
}
