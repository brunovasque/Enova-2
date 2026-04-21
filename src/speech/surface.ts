/**
 * ENOVA 2 — Speech Engine e Surface Única — Surface final mínima
 *
 * Este módulo não monta phrasing. Ele publica apenas texto final recebido
 * como saída autorada pela IA e o prende ao envelope estrutural da PR 26.
 */

import type { GateId, StageId } from '../core/types.ts';
import {
  assertSpeechPolicyConformance,
  type FallbackMode,
  type SpeechPolicyEnvelope,
  type SurfaceOwner,
} from './policy.ts';

export type SurfaceDraftAuthor = 'llm' | 'mechanical' | 'fallback';

export interface FinalSurfaceDraft {
  author: SurfaceDraftAuthor;
  text: string;
}

export interface FinalSurfaceGovernanceSnapshot {
  stage_current: StageId;
  stage_after: StageId;
  next_objective: string;
  block_advance: boolean;
  gates_activated: GateId[];
  speech_intent: SpeechPolicyEnvelope['speech_intent'];
  governance_constraints: string[];
  forbidden_patterns: string[];
}

export interface FinalSurfaceInput {
  policy: SpeechPolicyEnvelope;
  draft: FinalSurfaceDraft;
}

export interface FinalSurfaceResult {
  surface_owner: SurfaceOwner;
  draft_author: SurfaceDraftAuthor;
  accepted: boolean;
  final_text: string | null;
  mechanical_text_generated: false;
  fallback_mode: FallbackMode;
  governance_snapshot: FinalSurfaceGovernanceSnapshot;
  violations: string[];
}

function normalizeDraftText(text: string): string {
  return text.trim();
}

function buildGovernanceSnapshot(policy: SpeechPolicyEnvelope): FinalSurfaceGovernanceSnapshot {
  return {
    stage_current: policy.stage_current,
    stage_after: policy.stage_after,
    next_objective: policy.next_objective,
    block_advance: policy.block_advance,
    gates_activated: [...policy.gates_activated],
    speech_intent: policy.speech_intent,
    governance_constraints: [...policy.governance_constraints],
    forbidden_patterns: [...policy.forbidden_patterns],
  };
}

export function buildAiFinalSurface(input: FinalSurfaceInput): FinalSurfaceResult {
  const policy = input.policy;
  const finalText = normalizeDraftText(input.draft.text);
  const violations = [...assertSpeechPolicyConformance(policy)];

  if (input.draft.author !== 'llm') {
    violations.push('final_surface_author_must_be_llm');
  }

  if (!finalText) {
    violations.push('llm_final_text_must_be_non_empty');
  }

  const accepted = violations.length === 0;

  return {
    surface_owner: 'llm',
    draft_author: input.draft.author,
    accepted,
    final_text: accepted ? finalText : null,
    mechanical_text_generated: false,
    fallback_mode: policy.fallback_mode,
    governance_snapshot: buildGovernanceSnapshot(policy),
    violations,
  };
}
