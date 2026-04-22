/**
 * ENOVA 2 — Cloudflare Worker entrypoint
 *
 * Integração mínima do Core Mecânico 2 no Worker.
 *
 * Escopo desta PR:
 * - manter uma rota raiz simples
 * - expor POST /__core__/run para executar o Core real com input estrutural controlado
 * - devolver apenas saída estrutural JSON
 *
 * RESTRIÇÃO INVIOLÁVEL:
 * - o LLM é soberano da fala
 * - o mecânico não escreve resposta ao cliente
 * - speech_intent é apenas sinal estrutural
 */

import { runCoreEngine } from './core/engine.ts';
import type { CoreDecision, LeadState, StageId } from './core/types.ts';
import { handleMetaIngest } from './meta/ingest.ts';
import { applyRolloutGuard } from './rollout/controller.ts';
import { applyE1CoreHook } from './e1/memory.ts';
import {
  createExecutionId,
  createRequestTelemetryContext,
  emitHealthSignal,
  emitRequestLifecycleCompleted,
  emitRequestLifecycleReceived,
  emitRuntimeGuard,
  emitTelemetry,
  emitValidationFailure,
  statusToOutcome,
} from './telemetry/emit.ts';
import type { TelemetryRequestContext } from './telemetry/types.ts';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const STAGE_IDS: StageId[] = [
  'discovery',
  'qualification_civil',
  'qualification_renda',
  'qualification_eligibility',
  'qualification_special',
  'docs_prep',
  'docs_collection',
  'broker_handoff',
  'visit',
];

interface CoreRunPayload {
  lead_id?: unknown;
  current_stage?: unknown;
  facts?: unknown;
}

class WorkerInputError extends Error {}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseCoreRunPayload(payload: unknown): LeadState {
  if (!isRecord(payload)) {
    throw new WorkerInputError('Body JSON deve ser um objeto.');
  }

  const { lead_id, current_stage, facts } = payload as CoreRunPayload;

  if (typeof lead_id !== 'string' || lead_id.trim().length === 0) {
    throw new WorkerInputError('Campo "lead_id" deve ser string não vazia.');
  }

  if (typeof current_stage !== 'string' || !STAGE_IDS.includes(current_stage as StageId)) {
    throw new WorkerInputError(`Campo "current_stage" inválido. Valores aceitos: ${STAGE_IDS.join(', ')}.`);
  }

  if (!isRecord(facts)) {
    throw new WorkerInputError('Campo "facts" deve ser um objeto JSON.');
  }

  return {
    lead_id,
    current_stage: current_stage as StageId,
    facts,
  };
}

function toStructuralResponse(decision: CoreDecision) {
  return {
    stage_current: decision.stage_current,
    stage_after: decision.stage_after,
    next_objective: decision.next_objective,
    block_advance: decision.block_advance,
    gates_activated: decision.gates_activated,
    speech_intent: decision.speech_intent,
  };
}

async function handleCoreRun(request: Request, telemetryContext: TelemetryRequestContext): Promise<Response> {
  if (request.method !== 'POST') {
    emitRuntimeGuard(telemetryContext, 'src/worker.ts', 'worker', 'core_route_method_not_allowed', {
      route: '/__core__/run',
      method: request.method,
      allowed_method: 'POST',
    });

    return jsonResponse(
      {
        error: 'method_not_allowed',
        route: '/__core__/run',
        allowed_method: 'POST',
      },
      405,
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    emitValidationFailure(telemetryContext, 'src/worker.ts', 'worker', 'core_route_invalid_json', {
      route: '/__core__/run',
      method: request.method,
    });

    return jsonResponse(
      {
        error: 'invalid_json',
        route: '/__core__/run',
      },
      400,
    );
  }

  try {
    const state = parseCoreRunPayload(payload);
    const decision = runCoreEngine(state);
    const execution_id = createExecutionId();
    try {
      applyE1CoreHook({
        trace_id: telemetryContext.trace_id,
        correlation_id: telemetryContext.correlation_id,
        request_id: telemetryContext.request_id,
        lead_id: state.lead_id,
        current_stage: state.current_stage,
        facts: state.facts,
      });
    } catch (hookError) {
      emitTelemetry({
        layer: 'governance',
        category: 'contract_symptom',
        action: 'raised',
        source: 'src/worker.ts',
        severity: 'warn',
        outcome: 'observed',
        trace_id: telemetryContext.trace_id,
        correlation_id: telemetryContext.correlation_id,
        request_id: telemetryContext.request_id,
        lead_ref: state.lead_id,
        symptom_code: 'e1_core_hook_non_blocking_failure',
        details: {
          route: '/__core__/run',
          detail: hookError instanceof Error ? hookError.message : 'unknown_error',
        },
      });
    }

    emitTelemetry({
      layer: 'core',
      category: 'decision_transition',
      action: 'evaluated',
      source: 'src/worker.ts',
      severity: 'info',
      outcome: 'completed',
      trace_id: telemetryContext.trace_id,
      correlation_id: telemetryContext.correlation_id,
      request_id: telemetryContext.request_id,
      execution_id,
      lead_ref: state.lead_id,
      details: {
        route: '/__core__/run',
        stage_current: decision.stage_current,
        stage_after: decision.stage_after,
        block_advance: decision.block_advance,
      },
    });

    return jsonResponse(toStructuralResponse(decision), 200);
  } catch (error) {
    if (error instanceof WorkerInputError) {
      emitValidationFailure(telemetryContext, 'src/worker.ts', 'core', 'core_input_invalid', {
        route: '/__core__/run',
        detail: error.message,
      });

      return jsonResponse(
        {
          error: 'invalid_core_input',
          route: '/__core__/run',
          detail: error.message,
        },
        400,
      );
    }

    const detail = error instanceof Error ? error.message : 'Erro inesperado ao executar o Core.';

    emitTelemetry({
      layer: 'core',
      category: 'contract_symptom',
      action: 'raised',
      source: 'src/worker.ts',
      severity: 'error',
      outcome: 'failed',
      trace_id: telemetryContext.trace_id,
      correlation_id: telemetryContext.correlation_id,
      request_id: telemetryContext.request_id,
      symptom_code: 'core_execution_failed',
      details: {
        route: '/__core__/run',
        detail,
      },
    });

    return jsonResponse(
      {
        error: 'core_execution_failed',
        route: '/__core__/run',
        detail,
      },
      500,
    );
  }
}

function handleRoot(telemetryContext: TelemetryRequestContext): Response {
  emitHealthSignal(telemetryContext, 'src/worker.ts', 'healthy', {
    service: 'enova-2-worker',
    route: '/',
    surface: 'technical_only',
  });

  return jsonResponse({
    service: 'enova-2-worker',
    status: 'ok',
    routes: {
      health: 'GET /',
      core_run: 'POST /__core__/run',
      meta_ingest: 'POST /__meta__/ingest',
    },
    surface: 'technical_only',
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const telemetryContext = createRequestTelemetryContext(request, url.pathname);

    emitRequestLifecycleReceived(telemetryContext, 'src/worker.ts');
    applyRolloutGuard({
      trace_id: telemetryContext.trace_id,
      correlation_id: telemetryContext.correlation_id,
      request_id: telemetryContext.request_id,
      route: url.pathname,
      method: request.method,
    });

    let response: Response;
    if (url.pathname === '/') {
      response = handleRoot(telemetryContext);
      emitRequestLifecycleCompleted(telemetryContext, 'src/worker.ts', response.status);
      return response;
    }

    if (url.pathname === '/__core__/run') {
      response = await handleCoreRun(request, telemetryContext);
      emitRequestLifecycleCompleted(telemetryContext, 'src/worker.ts', response.status);
      return response;
    }

    if (url.pathname === '/__meta__/ingest') {
      response = await handleMetaIngest(request, telemetryContext);
      emitRequestLifecycleCompleted(telemetryContext, 'src/worker.ts', response.status);
      return response;
    }

    emitRuntimeGuard(telemetryContext, 'src/worker.ts', 'worker', 'route_not_found', {
      route: url.pathname,
      method: request.method,
    });

    response = jsonResponse(
      {
        error: 'not_found',
        route: url.pathname,
      },
      404,
    );

    emitTelemetry({
      layer: 'worker',
      category: 'health_signal',
      action: 'reported',
      source: 'src/worker.ts',
      severity: response.status >= 500 ? 'error' : 'info',
      outcome: statusToOutcome(response.status),
      trace_id: telemetryContext.trace_id,
      correlation_id: telemetryContext.correlation_id,
      request_id: telemetryContext.request_id,
      health_status: 'healthy',
      details: {
        route: url.pathname,
        status: response.status,
      },
    });
    emitRequestLifecycleCompleted(telemetryContext, 'src/worker.ts', response.status);
    return response;
  },
} satisfies ExportedHandler;
