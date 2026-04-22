import { evaluateRolloutGuard } from './guards.ts';
import {
  FRONT8_ROLLOUT_CONTRACT_KEY,
  FRONT8_ROLLOUT_EVENT_VERSION,
  type RolloutEvidenceEvent,
  type RolloutRequestContext,
} from './types.ts';

const ROLLOUT_EVIDENCE_BUFFER_LIMIT = 500;
const rolloutEvidenceBuffer: RolloutEvidenceEvent[] = [];

function emitRolloutEvidence(event: Omit<RolloutEvidenceEvent, 'event_version' | 'contract_front' | 'timestamp'>): void {
  rolloutEvidenceBuffer.push({
    ...event,
    event_version: FRONT8_ROLLOUT_EVENT_VERSION,
    contract_front: FRONT8_ROLLOUT_CONTRACT_KEY,
    timestamp: new Date().toISOString(),
  });

  if (rolloutEvidenceBuffer.length > ROLLOUT_EVIDENCE_BUFFER_LIMIT) {
    rolloutEvidenceBuffer.shift();
  }
}

export function clearRolloutEvidenceBuffer(): void {
  rolloutEvidenceBuffer.length = 0;
}

export function readRolloutEvidenceBuffer(): RolloutEvidenceEvent[] {
  return rolloutEvidenceBuffer.map((event) => ({ ...event }));
}

export function applyRolloutGuard(context: RolloutRequestContext) {
  const evaluation = evaluateRolloutGuard({
    route: context.route,
    method: context.method,
  });

  const evidence_ref = `f8-rollout-${context.trace_id}`;

  emitRolloutEvidence({
    event_name: 'f8.rollout.gate_status.evaluated',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    route: context.route,
    method: context.method,
    stage: evaluation.stage,
    decision: evaluation.decision,
    gate_status: evaluation.gate_status,
    promotion_block: evaluation.promotion_block,
    rollback_ready: evaluation.rollback_ready,
    severity: evaluation.gate_status === 'blocked' ? 'warn' : 'info',
    outcome: 'evaluated',
    reason_codes: evaluation.reason_codes,
    details: {
      mode: evaluation.mode,
    },
  });

  emitRolloutEvidence({
    event_name: 'f8.rollout.promotion_block.evaluated',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    route: context.route,
    method: context.method,
    stage: evaluation.stage,
    decision: evaluation.decision,
    gate_status: evaluation.gate_status,
    promotion_block: evaluation.promotion_block,
    rollback_ready: evaluation.rollback_ready,
    severity: evaluation.promotion_block ? 'warn' : 'info',
    outcome: evaluation.promotion_block ? 'blocked' : 'evaluated',
    reason_codes: evaluation.reason_codes,
    details: {
      requires_pr4_closeout: true,
    },
  });

  emitRolloutEvidence({
    event_name: 'f8.rollout.rollback_ready.evaluated',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    route: context.route,
    method: context.method,
    stage: evaluation.stage,
    decision: evaluation.decision,
    gate_status: evaluation.gate_status,
    promotion_block: evaluation.promotion_block,
    rollback_ready: evaluation.rollback_ready,
    severity: 'info',
    outcome: 'observed',
    reason_codes: evaluation.reason_codes,
  });

  emitRolloutEvidence({
    event_name: 'f8.rollout.rollout_boundary_blocked.enforced',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    route: context.route,
    method: context.method,
    stage: evaluation.stage,
    decision: evaluation.decision,
    gate_status: evaluation.gate_status,
    promotion_block: evaluation.promotion_block,
    rollback_ready: evaluation.rollback_ready,
    severity: 'warn',
    outcome: 'blocked',
    reason_codes: evaluation.reason_codes,
    blocked_boundaries: evaluation.blocked_boundaries,
    boundary_ref: 'external_activation_blocked',
    details: {
      controls: evaluation.controls,
    },
  });

  emitRolloutEvidence({
    event_name: 'f8.rollout.smoke_evidence.recorded',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    route: context.route,
    method: context.method,
    stage: evaluation.stage,
    decision: evaluation.decision,
    gate_status: evaluation.gate_status,
    promotion_block: evaluation.promotion_block,
    rollback_ready: evaluation.rollback_ready,
    severity: 'info',
    outcome: 'observed',
    reason_codes: evaluation.reason_codes,
    evidence_ref,
  });

  return evaluation;
}
