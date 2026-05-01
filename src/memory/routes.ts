/**
 * ENOVA 2 — PR-T8.13 — Routes /crm/memory/*
 *
 * Endpoints expostos pelo handler CRM principal.
 *
 * GET  /crm/memory/status                              — visão geral + invariantes
 * GET  /crm/memory/lead/:lead_ref                      — memórias de um lead
 * GET  /crm/memory/learning-candidates                 — lista de candidatos
 * POST /crm/memory/event                               — registra evento de memória
 * POST /crm/memory/learning-candidates/:id/decision    — decisão humana
 *
 * REGRA SOBERANA:
 *   - Endpoints só executam após auth CRM (handler principal valida).
 *   - Decisão humana exige operator_id + reason.
 *   - Promoção NUNCA é automática.
 *   - Body é sanitizado antes de qualquer escrita.
 */

import type { TelemetryRequestContext } from '../telemetry/types.ts';
import {
  applyLearningDecision,
  createLearningCandidate,
  getMemoryStatus,
  listLearningCandidates,
  listMemoryByLead,
  registerMemoryEvent,
} from './service.ts';
import type {
  CreateLearningCandidateInput,
  LearningDecisionInput,
  MemoryCategory,
  MemoryEventType,
  MemorySource,
  RegisterMemoryInput,
} from './types.ts';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), { status, headers: JSON_HEADERS });
}

function err(status: number, reason: string, extra?: Record<string, unknown>): Response {
  return jsonResponse({ ok: false, error: reason, ...extra }, status);
}

async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const VALID_CATEGORIES: ReadonlySet<MemoryCategory> = new Set([
  'attendance_memory',
  'contract_memory',
  'performance_memory',
  'error_memory',
  'commercial_memory',
  'product_memory',
  // 'learning_candidate' is intentionally NOT here — use /learning-candidates body instead
]);

const VALID_SOURCES: ReadonlySet<MemorySource> = new Set([
  'crm',
  'meta_webhook',
  'core_runtime',
  'panel_operator',
  'smoke',
  'system',
]);

const VALID_RISK = new Set(['low', 'medium', 'high', 'critical']);

/**
 * Encaminha o request quando pathname começa com `/crm/memory`.
 * Retorna `null` se a rota não corresponder a memory.
 *
 * `segment_a` e `segment_b` seguem o esquema do handler CRM principal:
 *   /crm/memory                           → resource=memory, segment_a=null
 *   /crm/memory/status                    → segment_a=status
 *   /crm/memory/lead/:lead_ref            → segment_a=lead, segment_b=:lead_ref
 *   /crm/memory/learning-candidates       → segment_a=learning-candidates
 *   /crm/memory/learning-candidates/:id   → segment_a=learning-candidates, segment_b=:id
 *   /crm/memory/learning-candidates/:id/decision → resolved by full pathname
 *   /crm/memory/event                     → segment_a=event
 */
export async function handleMemoryRoute(
  request: Request,
  url: URL,
  segment_a: string | null,
  segment_b: string | null,
  env: Record<string, unknown>,
  telemetryContext: TelemetryRequestContext,
): Promise<Response> {
  const method = request.method.toUpperCase();
  const ctx = { telemetry: telemetryContext };

  // GET /crm/memory ou /crm/memory/status
  if (!segment_a || segment_a === 'status') {
    if (method !== 'GET') return err(405, `Método não permitido em ${url.pathname}.`);
    return jsonResponse({ ok: true, record: getMemoryStatus(env, ctx) });
  }

  // GET /crm/memory/lead/:lead_ref
  if (segment_a === 'lead') {
    if (method !== 'GET') return err(405, 'Método não permitido em /crm/memory/lead.');
    if (!segment_b) return err(400, 'lead_ref obrigatório em /crm/memory/lead/:lead_ref.');
    const result = listMemoryByLead(segment_b, ctx);
    return jsonResponse({ ok: true, lead_ref: segment_b, ...result });
  }

  // /crm/memory/learning-candidates[/:id[/decision]]
  if (segment_a === 'learning-candidates') {
    if (!segment_b) {
      if (method !== 'GET') return err(405, 'Método não permitido em /crm/memory/learning-candidates.');
      const statusFilter = url.searchParams.get('status');
      if (statusFilter && !['draft', 'validated', 'rejected', 'promoted'].includes(statusFilter)) {
        return err(400, 'status filter inválido (valores: draft, validated, rejected, promoted).');
      }
      const result = listLearningCandidates(
        statusFilter as 'draft' | 'validated' | 'rejected' | 'promoted' | undefined,
        ctx,
      );
      return jsonResponse({ ok: true, ...result });
    }

    // /crm/memory/learning-candidates/:id/decision
    const trailing = url.pathname.split('/').filter(Boolean);
    const last = trailing[trailing.length - 1];
    const id = segment_b;

    if (last === 'decision') {
      if (method !== 'POST') return err(405, 'Decisão exige POST.');
      const body = await readBody(request);
      if (!isRecord(body)) return err(400, 'Body JSON inválido.');

      const input: LearningDecisionInput = {
        decision: body['decision'] as LearningDecisionInput['decision'],
        operator_id: typeof body['operator_id'] === 'string' ? body['operator_id'] : '',
        reason: typeof body['reason'] === 'string' ? body['reason'] : '',
      };
      const result = applyLearningDecision(id, input, ctx);
      if (!result.success) return err(400, result.error ?? 'decision_failed');
      return jsonResponse({ ok: true, record: result.record });
    }

    return err(404, `Sub-rota learning-candidates não reconhecida: ${url.pathname}`);
  }

  // POST /crm/memory/event
  if (segment_a === 'event') {
    if (method !== 'POST') return err(405, '/crm/memory/event exige POST.');
    const body = await readBody(request);
    if (!isRecord(body)) return err(400, 'Body JSON inválido.');

    const category = body['category'] as MemoryCategory;
    const event_type = body['event_type'] as MemoryEventType;
    const source = body['source'] as MemorySource;
    const summary = body['summary'];
    const risk_level = body['risk_level'];

    if (!category || !VALID_CATEGORIES.has(category)) {
      return err(400, 'category inválida ou não permitida em /event (use /learning-candidates para learning_candidate).');
    }
    if (!source || !VALID_SOURCES.has(source)) {
      return err(400, 'source inválida.');
    }
    if (typeof event_type !== 'string' || event_type.length === 0) {
      return err(400, 'event_type obrigatório.');
    }
    if (typeof summary !== 'string' || summary.trim().length === 0) {
      return err(400, 'summary obrigatório.');
    }
    if (risk_level && !VALID_RISK.has(risk_level as string)) {
      return err(400, 'risk_level inválido.');
    }

    const input: RegisterMemoryInput = {
      category,
      event_type,
      source,
      summary,
      lead_ref: typeof body['lead_ref'] === 'string' ? (body['lead_ref'] as string) : null,
      evidence_ref: typeof body['evidence_ref'] === 'string' ? (body['evidence_ref'] as string) : null,
      risk_level: (risk_level as 'low' | 'medium' | 'high' | 'critical' | undefined) ?? 'low',
      details: isRecord(body['details']) ? (body['details'] as Record<string, unknown>) : {},
    };

    const result = registerMemoryEvent(input, ctx);
    if (!result.success) return err(400, result.error ?? 'register_failed');
    return jsonResponse({ ok: true, record: result.record }, 201);
  }

  // POST /crm/memory/learning-candidates (criação direta) — alternativa para criar candidato
  if (segment_a === 'learning-candidate' && method === 'POST') {
    const body = await readBody(request);
    if (!isRecord(body)) return err(400, 'Body JSON inválido.');

    const source = body['source'] as MemorySource;
    if (!source || !VALID_SOURCES.has(source)) return err(400, 'source inválida.');
    if (typeof body['summary'] !== 'string' || body['summary'].trim().length === 0) {
      return err(400, 'summary obrigatório.');
    }
    if (typeof body['hypothesis'] !== 'string' || body['hypothesis'].trim().length === 0) {
      return err(400, 'hypothesis obrigatório.');
    }
    const risk_level = body['risk_level'];
    if (risk_level && !VALID_RISK.has(risk_level as string)) {
      return err(400, 'risk_level inválido.');
    }

    const input: CreateLearningCandidateInput = {
      source,
      summary: body['summary'] as string,
      hypothesis: body['hypothesis'] as string,
      lead_ref: typeof body['lead_ref'] === 'string' ? (body['lead_ref'] as string) : null,
      evidence_ref: typeof body['evidence_ref'] === 'string' ? (body['evidence_ref'] as string) : null,
      proposed_action: typeof body['proposed_action'] === 'string' ? (body['proposed_action'] as string) : null,
      risk_level: (risk_level as 'low' | 'medium' | 'high' | 'critical' | undefined) ?? 'medium',
      details: isRecord(body['details']) ? (body['details'] as Record<string, unknown>) : {},
    };

    const result = createLearningCandidate(input, ctx);
    if (!result.success) return err(400, result.error ?? 'create_failed');
    return jsonResponse({ ok: true, record: result.record }, 201);
  }

  return err(404, `Rota memory não reconhecida: ${url.pathname}`);
}

export const MEMORY_ROUTE_PREFIX = '/crm/memory' as const;
