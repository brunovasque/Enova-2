/**
 * ENOVA 2 — CRM Operacional — Route handler (PR-T8.4 expandido)
 *
 * ESCOPO:
 *   Handler HTTP do módulo CRM. Recebe requests com prefixo `/crm/`,
 *   faz roteamento interno por pathname e cobre as 7 abas do painel
 *   operacional Enova 2.
 *
 * ABAS DO PAINEL E ROTAS:
 *   1. Conversas
 *      GET  /crm/conversations
 *      GET  /crm/conversations/:lead_id
 *      GET  /crm/conversations/:lead_id/messages
 *   2. Bases
 *      GET  /crm/bases
 *      GET  /crm/bases/status
 *   3. Atendimento
 *      GET  /crm/attendance
 *      GET  /crm/attendance/pending
 *      GET  /crm/attendance/manual-mode
 *   4. CRM
 *      GET  /crm/leads
 *      POST /crm/leads
 *      GET  /crm/leads/:lead_id
 *      GET  /crm/leads/:lead_id/facts
 *      GET  /crm/leads/:lead_id/timeline
 *      GET  /crm/leads/:lead_id/artifacts
 *      GET  /crm/leads/:lead_id/dossier
 *      GET  /crm/leads/:lead_id/policy-events
 *      GET  /crm/leads/:lead_id/case-file
 *      POST /crm/leads/:lead_id/override
 *      POST /crm/leads/:lead_id/manual-mode
 *      POST /crm/leads/:lead_id/reset
 *   5. Dashboard
 *      GET  /crm/dashboard
 *      GET  /crm/dashboard/metrics
 *   6. Incidentes
 *      GET  /crm/incidents
 *      GET  /crm/incidents/summary
 *   7. ENOVA IA
 *      GET  /crm/enova-ia/status
 *      GET  /crm/enova-ia/runtime
 *
 *   GET  /crm/health  (health-check técnico)
 *
 * SEGURANÇA:
 *   Todas as rotas CRM exigem header `X-CRM-Admin-Key`.
 *   Validação:
 *     1. Se env var `CRM_ADMIN_KEY` existe e bate com o header → autorizado.
 *     2. Se env var `CRM_ALLOW_DEV_TOKEN === "true"` E header === "dev-crm-local"
 *        → autorizado (uso restrito a ambientes locais/dev).
 *     3. Caso contrário → 401.
 *   Sem `CRM_ADMIN_KEY` e sem flag dev declarada, todas as requisições são
 *   rejeitadas — não há fallback universal em produção.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nenhuma rota produz ou altera reply_text.
 *   - Nenhuma rota decide stage.
 *   - Nenhuma rota ativa LLM, Supabase ou WhatsApp reais.
 *   - Empty-state é declarado explicitamente.
 *   - Modo manual é operacional — não cria script de fala.
 *   - Dossiê retorna informação consolidada — não decide aprovação.
 */

import type { TelemetryRequestContext } from '../telemetry/types.ts';
import { emitRuntimeGuard, emitTelemetry } from '../telemetry/emit.ts';
import { getCrmBackend } from './store.ts';
import { getSupabaseReadiness, getSupabaseReadinessPublic } from '../supabase/readiness.ts';
import * as svc from './service.ts';
import * as panel from './panel.ts';
import type {
  CrmLeadFilter,
  CrmLeadStatus,
  CrmManualModeInput,
  CrmOverrideInput,
} from './types.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), { status, headers: JSON_HEADERS });
}

function crmError(status: number, reason: string, extra?: Record<string, unknown>): Response {
  return jsonResponse({ ok: false, error: reason, ...extra }, status);
}

interface CrmPathParts {
  resource: string;
  segment_a: string | null;
  segment_b: string | null;
}

/**
 * Decompõe o pathname em (resource, segment_a, segment_b).
 * Exemplos:
 *   /crm/health                            → { resource: 'health' }
 *   /crm/leads                             → { resource: 'leads' }
 *   /crm/leads/abc-123/facts               → { resource: 'leads', segment_a: 'abc-123', segment_b: 'facts' }
 *   /crm/conversations/abc-123/messages    → { resource: 'conversations', segment_a: 'abc-123', segment_b: 'messages' }
 *   /crm/bases/status                      → { resource: 'bases', segment_a: 'status' }
 *   /crm/enova-ia/runtime                  → { resource: 'enova-ia', segment_a: 'runtime' }
 */
function parseCrmPath(pathname: string): CrmPathParts {
  const parts = pathname.replace(/^\/crm\/?/, '').split('/').filter((s) => s.length > 0);
  return {
    resource: parts[0] ?? '',
    segment_a: parts[1] ?? null,
    segment_b: parts[2] ?? null,
  };
}

/**
 * Verifica autenticação mínima do CRM.
 * Aceita `CRM_ADMIN_KEY` do env. O token de dev `dev-crm-local` SOMENTE é aceito
 * quando a flag `CRM_ALLOW_DEV_TOKEN === "true"` estiver explicitamente declarada
 * no env. Sem `CRM_ADMIN_KEY` e sem flag dev → 401 sempre.
 *
 * REGRA DE SEGURANÇA: nenhum fallback universal. Em produção, ausência de
 * `CRM_ADMIN_KEY` resulta em rejeição total das requisições CRM.
 */
function isCrmAuthorized(request: Request, env: Record<string, unknown>): boolean {
  const header = request.headers.get('x-crm-admin-key') ?? '';
  const envKey = typeof env?.CRM_ADMIN_KEY === 'string' ? env.CRM_ADMIN_KEY : '';
  if (envKey && header === envKey) return true;

  const allowDevToken = env?.CRM_ALLOW_DEV_TOKEN === 'true';
  if (allowDevToken && header === 'dev-crm-local') return true;

  return false;
}

async function parseBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

export async function handleCrmRequest(
  request: Request,
  url: URL,
  telemetryContext: TelemetryRequestContext,
  env: Record<string, unknown> = {},
): Promise<Response> {

  // Auth (vale para TODAS as rotas /crm/*)
  if (!isCrmAuthorized(request, env)) {
    emitRuntimeGuard(telemetryContext, 'src/crm/routes.ts', 'crm', 'crm_unauthorized', {
      route: url.pathname,
    });
    return crmError(401, 'X-CRM-Admin-Key inválida ou ausente.');
  }

  const { resource, segment_a, segment_b } = parseCrmPath(url.pathname);
  const method = request.method.toUpperCase();

  // PR-T8.8 — readiness Supabase (sem segredos)
  const supabaseReadiness = getSupabaseReadiness(env);
  const supabaseReadinessPublic = getSupabaseReadinessPublic(env);

  // -------------------------------------------------------------------------
  // GET /crm/health
  // -------------------------------------------------------------------------
  if (resource === 'health') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/health.');
    return jsonResponse({
      ok: true,
      service: 'enova-2-crm',
      status: 'operational',
      mode: supabaseReadiness.mode,
      real_supabase: supabaseReadiness.ready,
      real_llm: false,
      real_whatsapp: false,
      panel_tabs: [
        'conversations',
        'bases',
        'attendance',
        'leads',
        'dashboard',
        'incidents',
        'enova-ia',
      ],
      supabase_readiness: supabaseReadinessPublic,
      note:
        supabaseReadiness.mode === 'supabase_real'
          ? 'Modo Supabase real ATIVO — leitura controlada. Escrita real desabilitada nesta PR (PR-T8.8).'
          : 'Backend in-process isolado. Supabase real condicionado a SUPABASE_REAL_ENABLED=true + envs.',
    });
  }

  // PR-T8.8 — falha rápida e segura quando flag está ON sem envs
  if (supabaseReadiness.flag_enabled && !supabaseReadiness.ready) {
    emitRuntimeGuard(telemetryContext, 'src/crm/routes.ts', 'crm', 'crm_supabase_misconfigured', {
      route: url.pathname,
      errors: supabaseReadiness.errors,
    });
    return crmError(503, 'Supabase real habilitado, mas envs ausentes.', {
      supabase_readiness: supabaseReadinessPublic,
    });
  }

  const backend = await getCrmBackend(env);

  // -------------------------------------------------------------------------
  // ABA 1 — Conversas
  // -------------------------------------------------------------------------
  if (resource === 'conversations') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/conversations.');

    if (!segment_a) {
      const result = await panel.listConversations(backend);
      return jsonResponse({ ok: true, ...result });
    }

    const lead_id = segment_a;

    if (!segment_b) {
      const result = await panel.getConversation(backend, lead_id);
      if (!result.found) return crmError(404, `Conversa do lead '${lead_id}' não encontrada.`);
      return jsonResponse({ ok: true, record: result.record });
    }

    if (segment_b === 'messages') {
      const result = await panel.getConversationMessages(backend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    return crmError(404, `Sub-rota de conversas não reconhecida: ${segment_b}`);
  }

  // -------------------------------------------------------------------------
  // ABA 2 — Bases
  // -------------------------------------------------------------------------
  if (resource === 'bases') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/bases.');

    if (!segment_a) {
      return jsonResponse({ ok: true, ...panel.listBases() });
    }

    if (segment_a === 'status') {
      return jsonResponse({
        ok: true,
        ...panel.listBasesStatus({
          real_supabase: supabaseReadiness.ready,
          known_tables_count: supabaseReadinessPublic.known_tables_count,
          known_buckets_count: supabaseReadinessPublic.known_buckets_count,
          rls_disabled_tables: supabaseReadinessPublic.rls_disabled_tables,
        }),
      });
    }

    return crmError(404, `Sub-rota de bases não reconhecida: ${segment_a}`);
  }

  // -------------------------------------------------------------------------
  // ABA 3 — Atendimento
  // -------------------------------------------------------------------------
  if (resource === 'attendance') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/attendance.');

    if (!segment_a) {
      const result = await panel.getAttendanceOverview(backend);
      return jsonResponse({ ok: true, record: result });
    }

    if (segment_a === 'pending') {
      const result = await panel.getAttendancePending(backend);
      return jsonResponse({ ok: true, ...result });
    }

    if (segment_a === 'manual-mode') {
      const result = await panel.getAttendanceManualMode(backend);
      return jsonResponse({ ok: true, ...result });
    }

    return crmError(404, `Sub-rota de atendimento não reconhecida: ${segment_a}`);
  }

  // -------------------------------------------------------------------------
  // ABA 5 — Dashboard
  // -------------------------------------------------------------------------
  if (resource === 'dashboard') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/dashboard.');

    if (!segment_a) {
      const result = await panel.getDashboardSummary(backend);
      return jsonResponse({ ok: true, ...result });
    }

    if (segment_a === 'metrics') {
      const result = await panel.getDashboardMetrics(backend);
      return jsonResponse({ ok: true, record: result });
    }

    return crmError(404, `Sub-rota de dashboard não reconhecida: ${segment_a}`);
  }

  // -------------------------------------------------------------------------
  // ABA 6 — Incidentes
  // -------------------------------------------------------------------------
  if (resource === 'incidents') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/incidents.');

    if (!segment_a) {
      const result = await panel.listIncidents(backend);
      return jsonResponse({ ok: true, ...result });
    }

    if (segment_a === 'summary') {
      const result = await panel.getIncidentsSummary(backend);
      return jsonResponse({ ok: true, record: result });
    }

    return crmError(404, `Sub-rota de incidentes não reconhecida: ${segment_a}`);
  }

  // -------------------------------------------------------------------------
  // ABA 7 — ENOVA IA
  // -------------------------------------------------------------------------
  if (resource === 'enova-ia') {
    if (method !== 'GET') return crmError(405, 'Método não permitido em /crm/enova-ia.');

    if (segment_a === 'status') {
      return jsonResponse({
        ok: true,
        record: panel.getEnovaIaStatus({ real_supabase: supabaseReadiness.ready }),
      });
    }

    if (segment_a === 'runtime') {
      return jsonResponse({
        ok: true,
        record: panel.getEnovaIaRuntime({ real_supabase: supabaseReadiness.ready }),
      });
    }

    return crmError(404, `Sub-rota de enova-ia não reconhecida: ${segment_a ?? '(vazia)'}`);
  }

  // -------------------------------------------------------------------------
  // ABA 4 — CRM (/crm/leads sem lead_id)
  // -------------------------------------------------------------------------
  if (resource === 'leads' && !segment_a) {
    if (method === 'GET') {
      const params = url.searchParams;
      const filter: CrmLeadFilter = {};
      const statusParam = params.get('status') as CrmLeadStatus | null;
      if (statusParam) filter.status = statusParam;
      const manualParam = params.get('manual_mode');
      if (manualParam !== null) filter.manual_mode = manualParam === 'true';

      const result = await svc.listLeads(backend, filter);
      return jsonResponse({ ok: true, ...result });
    }

    if (method === 'POST') {
      const body = await parseBody(request);
      if (!isRecord(body)) return crmError(400, 'Body JSON inválido.');
      const result = await svc.createLead(backend, {
        external_ref: (body.external_ref as string) ?? null,
        customer_name: (body.customer_name as string) ?? null,
      });
      if (!result.success) return crmError(400, result.error ?? 'Erro ao criar lead.');
      return jsonResponse({ ok: true, record: result.record }, 201);
    }

    return crmError(405, 'Método não permitido em /crm/leads.');
  }

  // -------------------------------------------------------------------------
  // ABA 4 — CRM (/crm/leads/:lead_id[/:sub])
  // -------------------------------------------------------------------------
  if (resource === 'leads' && segment_a) {
    const lead_id = segment_a;
    const sub = segment_b;

    // GET /crm/leads/:lead_id
    if (!sub && method === 'GET') {
      const result = await svc.getLeadById(backend, lead_id);
      if (!result.found) return crmError(404, result.error ?? 'Lead não encontrado.');
      return jsonResponse({ ok: true, record: result.record });
    }

    // GET /crm/leads/:lead_id/facts
    if (sub === 'facts' && method === 'GET') {
      const result = await svc.getLeadFacts(backend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/timeline
    if (sub === 'timeline' && method === 'GET') {
      const result = await svc.getLeadTimeline(backend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/artifacts
    if (sub === 'artifacts' && method === 'GET') {
      const result = await svc.getLeadDocuments(backend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/dossier
    if (sub === 'dossier' && method === 'GET') {
      const result = await svc.getLeadDossier(backend, lead_id);
      if (!result.found) {
        return jsonResponse({ ok: true, record: null, note: 'Dossiê ainda não criado para este lead.' });
      }
      return jsonResponse({ ok: true, record: result.record });
    }

    // GET /crm/leads/:lead_id/policy-events
    if (sub === 'policy-events' && method === 'GET') {
      const result = await svc.getLeadPolicyEvents(backend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/case-file
    if (sub === 'case-file' && method === 'GET') {
      const result = await svc.getLeadCaseFile(backend, lead_id);
      if (!result.found) return crmError(404, result.error ?? 'Lead não encontrado.');
      return jsonResponse({ ok: true, record: result.record });
    }

    // POST /crm/leads/:lead_id/override
    if (sub === 'override' && method === 'POST') {
      const body = await parseBody(request);
      if (!isRecord(body)) return crmError(400, 'Body JSON inválido.');

      const input: CrmOverrideInput = {
        operator_id: (body.operator_id as string) ?? '',
        override_type: (body.override_type as CrmOverrideInput['override_type']) ?? 'note',
        target_field: (body.target_field as string) ?? null,
        old_value: body.old_value,
        new_value: body.new_value,
        reason: (body.reason as string) ?? '',
      };

      const result = await svc.registerOverride(backend, lead_id, input);
      if (!result.success) return crmError(400, result.error ?? 'Erro ao registrar override.');

      emitTelemetry({
        layer: 'worker',
        category: 'health_signal',
        action: 'reported',
        source: 'src/crm/routes.ts',
        severity: 'info',
        outcome: 'completed',
        trace_id: telemetryContext.trace_id,
        correlation_id: telemetryContext.correlation_id,
        request_id: telemetryContext.request_id,
        lead_ref: lead_id,
        details: { route: url.pathname, override_type: input.override_type },
      });

      return jsonResponse({ ok: true, record: result.record }, 201);
    }

    // POST /crm/leads/:lead_id/manual-mode
    if (sub === 'manual-mode' && method === 'POST') {
      const body = await parseBody(request);
      if (!isRecord(body)) return crmError(400, 'Body JSON inválido.');

      const input: CrmManualModeInput = {
        action: (body.action as 'activate' | 'deactivate') ?? 'activate',
        operator_id: (body.operator_id as string) ?? '',
        reason: (body.reason as string) ?? null,
      };

      if (input.action !== 'activate' && input.action !== 'deactivate') {
        return crmError(400, 'Campo "action" deve ser "activate" ou "deactivate".');
      }

      const result = await svc.toggleManualMode(backend, lead_id, input);
      if (!result.success) return crmError(400, result.error ?? 'Erro ao alterar modo manual.');

      return jsonResponse({ ok: true, record: result.record }, 201);
    }

    // POST /crm/leads/:lead_id/reset
    if (sub === 'reset' && method === 'POST') {
      const body = await parseBody(request);
      if (!isRecord(body)) return crmError(400, 'Body JSON inválido.');

      const operator_id = (body.operator_id as string) ?? '';
      const reason = (body.reason as string) ?? '';

      const result = await svc.resetLead(backend, lead_id, operator_id, reason);
      if (!result.success) return crmError(400, result.error ?? 'Erro ao resetar lead.');

      emitTelemetry({
        layer: 'worker',
        category: 'health_signal',
        action: 'reported',
        source: 'src/crm/routes.ts',
        severity: 'info',
        outcome: 'completed',
        trace_id: telemetryContext.trace_id,
        correlation_id: telemetryContext.correlation_id,
        request_id: telemetryContext.request_id,
        lead_ref: lead_id,
        details: { route: url.pathname, reset_by: operator_id },
      });

      return jsonResponse({ ok: true, record: result.record }, 200);
    }

    return crmError(404, `Rota CRM não reconhecida: ${method} ${url.pathname}`);
  }

  return crmError(404, `Rota CRM não reconhecida: ${url.pathname}`);
}
