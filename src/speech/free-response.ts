/**
 * ENOVA 2 — Atendente Especialista MCMV — Resposta livre governada
 *
 * Este módulo não escreve resposta final. Ele valida uma resposta livre
 * autorada pela IA contra policy, contrato cognitivo e limites MCMV/CEF.
 */

import {
  assertMcmvCognitiveContractConformance,
  type McmvCognitiveContract,
} from './cognitive.ts';
import {
  assertSpeechPolicyConformance,
  type SpeechPolicyEnvelope,
} from './policy.ts';
import {
  buildAiFinalSurface,
  type FinalSurfaceDraft,
  type FinalSurfaceResult,
} from './surface.ts';

export type FreeResponseOwner = 'llm';
export type FreeResponseMode = 'free_under_structural_governance';
export type FreeResponseGovernanceRole = 'restricts_validates_informs_only';

export interface FreeResponsePolicyAlignment {
  next_objective: string;
  block_advance: boolean;
  stage_current: SpeechPolicyEnvelope['stage_current'];
  stage_after: SpeechPolicyEnvelope['stage_after'];
  cognitive_mode: McmvCognitiveContract['mode'];
}

export interface FreeResponseModel {
  response_owner: FreeResponseOwner;
  response_mode: FreeResponseMode;
  governance_role: FreeResponseGovernanceRole;
  final_surface_authority: 'llm';
  mechanical_may_write_customer_text: false;
  policy_alignment: FreeResponsePolicyAlignment;
  freedoms: string[];
  structural_constraints: string[];
  forbidden_patterns: string[];
}

export interface GovernedFreeResponseInput {
  policy: SpeechPolicyEnvelope;
  cognitive_contract: McmvCognitiveContract;
  draft: FinalSurfaceDraft;
}

export interface GovernedFreeResponseResult {
  model: FreeResponseModel;
  surface: FinalSurfaceResult;
  accepted: boolean;
  final_text: string | null;
  free_response_preserved: true;
  governance_wrote_text: false;
  violations: string[];
}

const FREEDOMS = [
  'responder_livremente',
  'adaptar_tom_e_profundidade_ao_contexto',
  'conduzir_com_naturalidade',
  'explorar_possibilidades_reais_sem_prometer_resultado',
] as const;

const STRUCTURAL_CONSTRAINTS = [
  'respeitar_next_objective',
  'respeitar_bloqueios_estruturais',
  'nao_contrariar_core',
  'nao_prometer_aprovacao',
  'usar_conhecimento_mcmv_cef_com_limites',
  'governanca_restringe_mas_nao_escreve',
] as const;

const FORBIDDEN_PATTERNS = [
  'fala_mecanica',
  'script_rigido_dominante',
  'fallback_dominante',
  'resposta_mecanica_por_stage',
  'mecanico_redige_resposta_final',
  'promessa_de_aprovacao',
] as const;

const APPROVAL_PROMISE_PATTERNS = [
  'aprovacao garantida',
  'aprovado garantido',
  'voce esta aprovado',
  'financiamento aprovado',
  'credito aprovado',
] as const;

function normalizeForGuardrail(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildPolicyAlignment(
  policy: SpeechPolicyEnvelope,
  cognitiveContract: McmvCognitiveContract,
): FreeResponsePolicyAlignment {
  return {
    next_objective: policy.next_objective,
    block_advance: policy.block_advance,
    stage_current: policy.stage_current,
    stage_after: policy.stage_after,
    cognitive_mode: cognitiveContract.mode,
  };
}

function findApprovalPromiseViolations(draft: FinalSurfaceDraft): string[] {
  const normalized = normalizeForGuardrail(draft.text);

  if (APPROVAL_PROMISE_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return ['approval_promise_not_allowed'];
  }

  return [];
}

export function buildFreeResponseModel(
  policy: SpeechPolicyEnvelope,
  cognitiveContract: McmvCognitiveContract,
): FreeResponseModel {
  return {
    response_owner: 'llm',
    response_mode: 'free_under_structural_governance',
    governance_role: 'restricts_validates_informs_only',
    final_surface_authority: 'llm',
    mechanical_may_write_customer_text: false,
    policy_alignment: buildPolicyAlignment(policy, cognitiveContract),
    freedoms: [...FREEDOMS],
    structural_constraints: [...STRUCTURAL_CONSTRAINTS],
    forbidden_patterns: [...FORBIDDEN_PATTERNS],
  };
}

export function assertFreeResponseModelConformance(model: FreeResponseModel): string[] {
  const violations: string[] = [];

  if (model.response_owner !== 'llm') {
    violations.push('free_response_owner_must_be_llm');
  }

  if (model.response_mode !== 'free_under_structural_governance') {
    violations.push('free_response_mode_must_be_governed');
  }

  if (model.governance_role !== 'restricts_validates_informs_only') {
    violations.push('governance_must_not_write_response');
  }

  if (model.mechanical_may_write_customer_text !== false) {
    violations.push('mechanical_customer_text_must_remain_forbidden');
  }

  if (!model.freedoms.includes('adaptar_tom_e_profundidade_ao_contexto')) {
    violations.push('missing_free_tone_and_depth_adaptation');
  }

  if (!model.structural_constraints.includes('respeitar_next_objective')) {
    violations.push('missing_next_objective_constraint');
  }

  if (!model.structural_constraints.includes('respeitar_bloqueios_estruturais')) {
    violations.push('missing_structural_block_constraint');
  }

  if (!model.structural_constraints.includes('nao_prometer_aprovacao')) {
    violations.push('missing_no_approval_promise_constraint');
  }

  if (!model.forbidden_patterns.includes('script_rigido_dominante')) {
    violations.push('missing_rigid_script_prohibition');
  }

  if (!model.forbidden_patterns.includes('fallback_dominante')) {
    violations.push('missing_dominant_fallback_prohibition');
  }

  if (!model.forbidden_patterns.includes('fala_mecanica')) {
    violations.push('missing_mechanical_speech_prohibition');
  }

  return violations;
}

export function buildGovernedFreeResponse(input: GovernedFreeResponseInput): GovernedFreeResponseResult {
  const model = buildFreeResponseModel(input.policy, input.cognitive_contract);
  const surface = buildAiFinalSurface({
    policy: input.policy,
    draft: input.draft,
  });
  const violations = [
    ...assertSpeechPolicyConformance(input.policy),
    ...assertMcmvCognitiveContractConformance(input.cognitive_contract),
    ...assertFreeResponseModelConformance(model),
    ...surface.violations,
    ...findApprovalPromiseViolations(input.draft),
  ];
  const uniqueViolations = [...new Set(violations)];
  const accepted = surface.accepted && uniqueViolations.length === 0;

  return {
    model,
    surface,
    accepted,
    final_text: accepted ? surface.final_text : null,
    free_response_preserved: true,
    governance_wrote_text: false,
    violations: uniqueViolations,
  };
}
