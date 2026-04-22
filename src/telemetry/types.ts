export const FRONT7_EVENT_VERSION = 'f7.v1' as const;
export const FRONT7_CONTRACT_KEY = 'front7_telemetria_observabilidade' as const;

export type TelemetryLayer =
  | 'worker'
  | 'core'
  | 'speech'
  | 'context'
  | 'adapter'
  | 'channel'
  | 'smoke'
  | 'governance';

export type TelemetryCategory =
  | 'request_lifecycle'
  | 'decision_transition'
  | 'validation_failure'
  | 'contract_symptom'
  | 'runtime_guard'
  | 'smoke_evidence'
  | 'external_boundary_blocked'
  | 'health_signal'
  | 'persistence_signal'
  | 'channel_signal';

export type TelemetrySeverity = 'info' | 'warn' | 'error' | 'critical';

export type TelemetryOutcome = 'accepted' | 'rejected' | 'blocked' | 'completed' | 'failed' | 'observed';

export type TelemetryHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface TelemetryEvent {
  event_name: string;
  event_version: typeof FRONT7_EVENT_VERSION;
  layer: TelemetryLayer;
  source: string;
  contract_front: typeof FRONT7_CONTRACT_KEY;
  trace_id: string;
  severity: TelemetrySeverity;
  outcome: TelemetryOutcome;
  timestamp: string;
  correlation_id?: string;
  request_id?: string;
  execution_id?: string;
  lead_ref?: string;
  symptom_code?: string;
  evidence_ref?: string;
  health_status?: TelemetryHealthStatus;
  boundary_ref?: string;
  details?: Record<string, unknown>;
  component?: string;
  evidence_type?: string;
  retry_count?: number;
}

export interface TelemetryRequestContext {
  trace_id: string;
  correlation_id: string;
  request_id: string;
  route: string;
  method: string;
}

export interface EmitTelemetryInput {
  layer: TelemetryLayer;
  category: TelemetryCategory;
  action: string;
  source: string;
  severity: TelemetrySeverity;
  outcome: TelemetryOutcome;
  trace_id?: string;
  correlation_id?: string;
  request_id?: string;
  execution_id?: string;
  lead_ref?: string;
  symptom_code?: string;
  evidence_ref?: string;
  health_status?: TelemetryHealthStatus;
  boundary_ref?: string;
  details?: Record<string, unknown>;
  component?: string;
  evidence_type?: string;
  retry_count?: number;
}
