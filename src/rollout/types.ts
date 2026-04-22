export const FRONT8_ROLLOUT_EVENT_VERSION = 'front8.v1' as const;
export const FRONT8_ROLLOUT_CONTRACT_KEY = 'front8_rollout' as const;

export type RolloutStage = 'shadow' | 'canary' | 'cutover' | 'rollback';
export type RolloutDecision = 'hold' | 'promote' | 'abort' | 'rollback';
export type RolloutGateStatus = 'pass' | 'blocked';
export type RolloutSeverity = 'info' | 'warn' | 'error';
export type RolloutOutcome = 'evaluated' | 'blocked' | 'observed';

export interface RolloutControlFlags {
  allow_external_rollout_activation: false;
  allow_meta_real_activation: false;
  allow_supabase_real_new_activation: false;
  allow_external_dashboard: false;
  allow_external_mandatory_tool: false;
  allow_manual_external_deploy: false;
}

export interface RolloutGuardInput {
  route: string;
  method: string;
}

export interface RolloutGuardResult {
  gate_status: RolloutGateStatus;
  promotion_block: boolean;
  rollback_ready: boolean;
  stage: RolloutStage;
  decision: RolloutDecision;
  reason_codes: string[];
  blocked_boundaries: string[];
  controls: RolloutControlFlags;
  mode: 'technical_local_only';
}

export interface RolloutRequestContext {
  trace_id: string;
  correlation_id: string;
  request_id: string;
  route: string;
  method: string;
}

export interface RolloutEvidenceEvent {
  event_name: string;
  event_version: typeof FRONT8_ROLLOUT_EVENT_VERSION;
  contract_front: typeof FRONT8_ROLLOUT_CONTRACT_KEY;
  trace_id: string;
  correlation_id: string;
  request_id: string;
  route: string;
  method: string;
  timestamp: string;
  stage: RolloutStage;
  decision: RolloutDecision;
  gate_status: RolloutGateStatus;
  promotion_block: boolean;
  rollback_ready: boolean;
  severity: RolloutSeverity;
  outcome: RolloutOutcome;
  reason_codes?: string[];
  blocked_boundaries?: string[];
  boundary_ref?: string;
  evidence_ref?: string;
  details?: Record<string, unknown>;
}
