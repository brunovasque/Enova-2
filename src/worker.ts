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

async function handleCoreRun(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
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

    return jsonResponse(toStructuralResponse(decision), 200);
  } catch (error) {
    if (error instanceof WorkerInputError) {
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

function handleRoot(): Response {
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

    if (url.pathname === '/') {
      return handleRoot();
    }

    if (url.pathname === '/__core__/run') {
      return handleCoreRun(request);
    }

    if (url.pathname === '/__meta__/ingest') {
      return handleMetaIngest(request);
    }

    return jsonResponse(
      {
        error: 'not_found',
        route: url.pathname,
      },
      404,
    );
  },
} satisfies ExportedHandler;
