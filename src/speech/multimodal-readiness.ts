/**
 * ENOVA 2 — Atendente Especialista MCMV — Preparacao multimodal minima
 *
 * Este modulo nao executa audio, STT, TTS, canal ou multimodalidade real.
 * Ele declara a fronteira futura: modalidade e apresentacao nao viram novo
 * cerebro, nao mudam regra e nao ganham prioridade sobre a IA.
 */

import type { McmvCognitiveContract } from './cognitive.ts';
import type { SpeechPolicyEnvelope } from './policy.ts';

export type FutureModality = 'text' | 'audio' | 'image' | 'sticker' | 'document';
export type MultimodalReadinessStatus = 'preparatory_contract_only';
export type MultimodalAuthorityOwner = 'llm';
export type MultimodalPipelineRole = 'input_output_adapter_only';
export type MultimodalGovernanceRole = 'same_structural_governance_as_text';

export interface MultimodalReadinessInput {
  policy: SpeechPolicyEnvelope;
  cognitive_contract: McmvCognitiveContract;
  future_modalities: FutureModality[];
}

export interface MultimodalReadinessPolicyAlignment {
  next_objective: string;
  block_advance: boolean;
  stage_current: SpeechPolicyEnvelope['stage_current'];
  stage_after: SpeechPolicyEnvelope['stage_after'];
  speech_intent: SpeechPolicyEnvelope['speech_intent'];
  cognitive_owner: McmvCognitiveContract['cognitive_owner'];
}

export interface MultimodalRuntimeLocks {
  real_audio_enabled: false;
  stt_provider_enabled: false;
  tts_provider_enabled: false;
  external_channel_enabled: false;
  media_processing_enabled: false;
}

export interface MultimodalReadinessContract {
  contract_id: 'multimodal_readiness_minimal_v1';
  readiness_status: MultimodalReadinessStatus;
  authority_owner: MultimodalAuthorityOwner;
  final_surface_authority: 'llm';
  pipeline_role: MultimodalPipelineRole;
  governance_role: MultimodalGovernanceRole;
  modality_changes_decision_authority: false;
  modality_changes_speech_authority: false;
  future_modalities: FutureModality[];
  runtime_locks: MultimodalRuntimeLocks;
  policy_alignment: MultimodalReadinessPolicyAlignment;
  preparation_constraints: string[];
  forbidden_patterns: string[];
}

const PREPARATION_CONSTRAINTS = [
  'multimodalidade_futura_converge_para_mesma_governanca_do_texto',
  'audio_futuro_e_forma_de_entrada_ou_saida_nao_novo_cerebro',
  'ia_permanece_soberana_em_raciocinio_e_fala',
  'core_next_objective_e_bloqueios_permanecem_preservados',
  'promessa_de_aprovacao_permanece_proibida',
  'audio_com_baixa_confianca_exigira_confirmacao_futura',
] as const;

const FORBIDDEN_PATTERNS = [
  'pipeline_multimodal_real_nesta_pr',
  'stt_real_nesta_pr',
  'tts_real_nesta_pr',
  'canal_real_nesta_pr',
  'modalidade_como_novo_cerebro',
  'mecanico_com_prioridade_de_fala',
  'parser_mecanico_dominante',
  'fallback_dominante',
  'script_rigido',
] as const;

function uniqueModalities(modalities: FutureModality[]): FutureModality[] {
  return [...new Set(modalities)];
}

function buildPolicyAlignment(
  policy: SpeechPolicyEnvelope,
  cognitiveContract: McmvCognitiveContract,
): MultimodalReadinessPolicyAlignment {
  return {
    next_objective: policy.next_objective,
    block_advance: policy.block_advance,
    stage_current: policy.stage_current,
    stage_after: policy.stage_after,
    speech_intent: policy.speech_intent,
    cognitive_owner: cognitiveContract.cognitive_owner,
  };
}

export function buildMultimodalReadinessContract(
  input: MultimodalReadinessInput,
): MultimodalReadinessContract {
  return {
    contract_id: 'multimodal_readiness_minimal_v1',
    readiness_status: 'preparatory_contract_only',
    authority_owner: 'llm',
    final_surface_authority: 'llm',
    pipeline_role: 'input_output_adapter_only',
    governance_role: 'same_structural_governance_as_text',
    modality_changes_decision_authority: false,
    modality_changes_speech_authority: false,
    future_modalities: uniqueModalities(input.future_modalities),
    runtime_locks: {
      real_audio_enabled: false,
      stt_provider_enabled: false,
      tts_provider_enabled: false,
      external_channel_enabled: false,
      media_processing_enabled: false,
    },
    policy_alignment: buildPolicyAlignment(input.policy, input.cognitive_contract),
    preparation_constraints: [...PREPARATION_CONSTRAINTS],
    forbidden_patterns: [...FORBIDDEN_PATTERNS],
  };
}

export function assertMultimodalReadinessConformance(contract: MultimodalReadinessContract): string[] {
  const violations: string[] = [];

  if (contract.readiness_status !== 'preparatory_contract_only') {
    violations.push('multimodal_readiness_must_remain_preparatory_only');
  }

  if (contract.authority_owner !== 'llm') {
    violations.push('multimodal_authority_owner_must_be_llm');
  }

  if (contract.final_surface_authority !== 'llm') {
    violations.push('multimodal_surface_authority_must_be_llm');
  }

  if (contract.pipeline_role !== 'input_output_adapter_only') {
    violations.push('multimodal_pipeline_must_not_be_new_brain');
  }

  if (contract.modality_changes_decision_authority !== false) {
    violations.push('modality_must_not_change_decision_authority');
  }

  if (contract.modality_changes_speech_authority !== false) {
    violations.push('modality_must_not_change_speech_authority');
  }

  if (contract.future_modalities.length === 0) {
    violations.push('multimodal_readiness_requires_future_modality');
  }

  if (contract.runtime_locks.real_audio_enabled !== false) {
    violations.push('real_audio_must_remain_disabled');
  }

  if (contract.runtime_locks.stt_provider_enabled !== false) {
    violations.push('stt_provider_must_remain_disabled');
  }

  if (contract.runtime_locks.tts_provider_enabled !== false) {
    violations.push('tts_provider_must_remain_disabled');
  }

  if (contract.runtime_locks.external_channel_enabled !== false) {
    violations.push('external_channel_must_remain_disabled');
  }

  if (!contract.preparation_constraints.includes('audio_futuro_e_forma_de_entrada_ou_saida_nao_novo_cerebro')) {
    violations.push('missing_audio_as_adapter_constraint');
  }

  if (!contract.preparation_constraints.includes('promessa_de_aprovacao_permanece_proibida')) {
    violations.push('missing_no_approval_promise_constraint_for_multimodal');
  }

  if (!contract.forbidden_patterns.includes('mecanico_com_prioridade_de_fala')) {
    violations.push('missing_mechanical_speech_priority_prohibition_for_multimodal');
  }

  if (!contract.forbidden_patterns.includes('pipeline_multimodal_real_nesta_pr')) {
    violations.push('missing_real_multimodal_pipeline_prohibition');
  }

  return [...new Set(violations)];
}
