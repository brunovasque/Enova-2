import {
  FRONT7_CONTRACT_KEY,
  FRONT7_EVENT_VERSION,
  type EmitTelemetryInput,
  type TelemetryEvent,
  type TelemetryHealthStatus,
  type TelemetryOutcome,
  type TelemetryRequestContext,
} from './types.ts';

const TELEMETRY_BUFFER_LIMIT = 500;
const telemetryBuffer: TelemetryEvent[] = [];

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readHeader(request: Request, name: string): string | undefined {
  const value = request.headers.get(name);
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function createTraceId(): string {
  return generateId('trace');
}

export function createExecutionId(): string {
  return generateId('exec');
}

export function createRequestTelemetryContext(request: Request, route: string): TelemetryRequestContext {
  const trace_id = readHeader(request, 'x-trace-id') ?? createTraceId();
  const correlation_id = readHeader(request, 'x-correlation-id') ?? trace_id;
  const request_id = readHeader(request, 'x-request-id') ?? generateId('req');

  return {
    trace_id,
    correlation_id,
    request_id,
    route,
    method: request.method,
  };
}

export function clearTelemetryBuffer(): void {
  telemetryBuffer.length = 0;
}

export function readTelemetryBuffer(): TelemetryEvent[] {
  return telemetryBuffer.map((item) => ({ ...item }));
}

export function statusToOutcome(status: number): TelemetryOutcome {
  if (status >= 500) {
    return 'failed';
  }

  if (status >= 400) {
    return 'rejected';
  }

  if (status >= 200) {
    return 'completed';
  }

  return 'observed';
}

export function emitTelemetry(input: EmitTelemetryInput): TelemetryEvent {
  const trace_id = input.trace_id ?? createTraceId();
  const event: TelemetryEvent = {
    event_name: `f7.${input.layer}.${input.category}.${input.action}`,
    event_version: FRONT7_EVENT_VERSION,
    layer: input.layer,
    source: input.source,
    contract_front: FRONT7_CONTRACT_KEY,
    trace_id,
    severity: input.severity,
    outcome: input.outcome,
    timestamp: new Date().toISOString(),
    correlation_id: input.correlation_id ?? trace_id,
    request_id: input.request_id,
    execution_id: input.execution_id,
    lead_ref: input.lead_ref,
    symptom_code: input.symptom_code,
    evidence_ref: input.evidence_ref,
    health_status: input.health_status,
    boundary_ref: input.boundary_ref,
    details: input.details,
    component: input.component,
    evidence_type: input.evidence_type,
    retry_count: input.retry_count,
  };

  telemetryBuffer.push(event);

  if (telemetryBuffer.length > TELEMETRY_BUFFER_LIMIT) {
    telemetryBuffer.shift();
  }

  return event;
}

export function emitRequestLifecycleReceived(context: TelemetryRequestContext, source: string): TelemetryEvent {
  return emitTelemetry({
    layer: 'worker',
    category: 'request_lifecycle',
    action: 'received',
    source,
    severity: 'info',
    outcome: 'observed',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    details: {
      route: context.route,
      method: context.method,
    },
  });
}

export function emitRequestLifecycleCompleted(
  context: TelemetryRequestContext,
  source: string,
  status: number,
): TelemetryEvent {
  return emitTelemetry({
    layer: 'worker',
    category: 'request_lifecycle',
    action: 'completed',
    source,
    severity: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    outcome: statusToOutcome(status),
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    details: {
      route: context.route,
      method: context.method,
      status,
    },
  });
}

export function emitHealthSignal(
  context: TelemetryRequestContext,
  source: string,
  health_status: TelemetryHealthStatus,
  details: Record<string, unknown>,
): TelemetryEvent {
  return emitTelemetry({
    layer: 'worker',
    category: 'health_signal',
    action: 'reported',
    source,
    severity: 'info',
    outcome: 'observed',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    health_status,
    details,
  });
}

export function emitValidationFailure(
  context: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
  source: string,
  layer: 'worker' | 'core' | 'channel' | 'governance',
  symptom_code: string,
  details: Record<string, unknown>,
): TelemetryEvent {
  return emitTelemetry({
    layer,
    category: 'validation_failure',
    action: 'detected',
    source,
    severity: 'warn',
    outcome: 'rejected',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    symptom_code,
    details,
  });
}

export function emitRuntimeGuard(
  context: Pick<TelemetryRequestContext, 'trace_id' | 'correlation_id' | 'request_id'>,
  source: string,
  layer: 'worker' | 'channel',
  symptom_code: string,
  details: Record<string, unknown>,
): TelemetryEvent {
  return emitTelemetry({
    layer,
    category: 'runtime_guard',
    action: 'blocked',
    source,
    severity: 'warn',
    outcome: 'blocked',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    symptom_code,
    details,
  });
}

export function emitSmokeEvidence(
  trace_id: string,
  evidence_ref: string,
  details: Record<string, unknown>,
): TelemetryEvent {
  return emitTelemetry({
    layer: 'smoke',
    category: 'smoke_evidence',
    action: 'recorded',
    source: 'src/telemetry/smoke.ts',
    severity: 'info',
    outcome: 'completed',
    trace_id,
    correlation_id: trace_id,
    evidence_ref,
    evidence_type: 'smoke_log',
    details,
  });
}
