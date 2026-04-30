/**
 * ENOVA 2 — CRM Operacional — Route handler (PR-T8.4)
 *
 * ESCOPO:
 *   Handler HTTP do módulo CRM. Recebe requests com prefixo `/crm/`,
 *   faz roteamento interno por pathname, chama `service.ts` e retorna
 *   resposta JSON. Integra com o sistema de telemetria existente.
 *
 * ROTAS IMPLEMENTADAS:
 *   GET  /crm/health
 *   GET  /crm/leads
 *   POST /crm/leads
 *   GET  /crm/leads/:lead_id
 *   GET  /crm/leads/:lead_id/facts
 *   GET  /crm/leads/:lead_id/timeline
 *   GET  /crm/leads/:lead_id/artifacts
 *   GET  /crm/leads/:lead_id/dossier
 *   GET  /crm/leads/:lead_id/policy-events
 *   POST /crm/leads/:lead_id/override
 *   POST /crm/leads/:lead_id/manual-mode
 *   POST /crm/leads/:lead_id/reset
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
 *   Quando Supabase real for conectado (PR-T8.8), autenticação pode ser
 *   aprimorada sem alterar este handler.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nenhuma rota produz ou altera reply_text.
 *   - Nenhuma rota decide stage.
 *   - Modo manual é operacional — não cria script de fala.
 *   - Dossiê retorna informação consolidada — não decide aprovação.
 */

import type { TelemetryRequestContext } from '../telemetry/types.ts';
import { emitRuntimeGuard, emitTelemetry } from '../telemetry/emit.ts';
import { crmBackend } from './store.ts';
import * as svc from './service.ts';
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

/**
 * Extrai lead_id e sub-recurso do pathname.
 * Exemplo: /crm/leads/abc-123/facts → { lead_id: 'abc-123', sub: 'facts' }
 */
function parseCrmPath(pathname: string): {
  resource: string;
  lead_id: string | null;
  sub: string | null;
} {
  // /crm/health
  if (pathname === '/crm/health') return { resource: 'health', lead_id: null, sub: null };

  // /crm/leads[/:lead_id[/:sub]]
  const parts = pathname.replace(/^\/crm\//, '').split('/');
  if (parts[0] !== 'leads') return { resource: parts[0] ?? '', lead_id: null, sub: null };

  return {
    resource: 'leads',
    lead_id: parts[1] ?? null,
    sub: parts[2] ?? null,
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

  // Token dev SÓ vale com flag explícita. Sem a flag, retorna 401 mesmo se o
  // header bater com `dev-crm-local`. Isso impede fallback universal em produção.
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

  // Auth
  if (!isCrmAuthorized(request, env)) {
    emitRuntimeGuard(telemetryContext, 'src/crm/routes.ts', 'crm', 'crm_unauthorized', {
      route: url.pathname,
    });
    return crmError(401, 'X-CRM-Admin-Key inválida ou ausente.');
  }

  const { resource, lead_id, sub } = parseCrmPath(url.pathname);
  const method = request.method.toUpperCase();

  // -------------------------------------------------------------------------
  // GET /crm/health
  // -------------------------------------------------------------------------
  if (resource === 'health') {
    return jsonResponse({
      ok: true,
      service: 'enova-2-crm',
      status: 'operational',
      mode: 'in_process_backend',
      real_supabase: false,
      note: 'Backend in-process isolado do adapter core. Supabase real em PR-T8.8.',
    });
  }

  // -------------------------------------------------------------------------
  // /crm/leads (sem lead_id)
  // -------------------------------------------------------------------------
  if (resource === 'leads' && !lead_id) {
    if (method === 'GET') {
      const params = url.searchParams;
      const filter: CrmLeadFilter = {};
      const statusParam = params.get('status') as CrmLeadStatus | null;
      if (statusParam) filter.status = statusParam;
      const manualParam = params.get('manual_mode');
      if (manualParam !== null) filter.manual_mode = manualParam === 'true';

      const result = await svc.listLeads(crmBackend, filter);
      return jsonResponse({ ok: true, ...result });
    }

    if (method === 'POST') {
      const body = await parseBody(request);
      if (!isRecord(body)) return crmError(400, 'Body JSON inválido.');
      const result = await svc.createLead(crmBackend, {
        external_ref: (body.external_ref as string) ?? null,
        customer_name: (body.customer_name as string) ?? null,
      });
      if (!result.success) return crmError(400, result.error ?? 'Erro ao criar lead.');
      return jsonResponse({ ok: true, record: result.record }, 201);
    }

    return crmError(405, 'Método não permitido em /crm/leads.');
  }

  // -------------------------------------------------------------------------
  // /crm/leads/:lead_id[/:sub]
  // -------------------------------------------------------------------------
  if (resource === 'leads' && lead_id) {
    // GET /crm/leads/:lead_id
    if (!sub && method === 'GET') {
      const result = await svc.getLeadById(crmBackend, lead_id);
      if (!result.found) return crmError(404, result.error ?? 'Lead não encontrado.');
      return jsonResponse({ ok: true, record: result.record });
    }

    // GET /crm/leads/:lead_id/facts
    if (sub === 'facts' && method === 'GET') {
      const result = await svc.getLeadFacts(crmBackend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/timeline
    if (sub === 'timeline' && method === 'GET') {
      const result = await svc.getLeadTimeline(crmBackend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/artifacts
    if (sub === 'artifacts' && method === 'GET') {
      const result = await svc.getLeadDocuments(crmBackend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/dossier
    if (sub === 'dossier' && method === 'GET') {
      const result = await svc.getLeadDossier(crmBackend, lead_id);
      if (!result.found) {
        return jsonResponse({ ok: true, record: null, note: 'Dossiê ainda não criado para este lead.' });
      }
      return jsonResponse({ ok: true, record: result.record });
    }

    // GET /crm/leads/:lead_id/policy-events
    if (sub === 'policy-events' && method === 'GET') {
      const result = await svc.getLeadPolicyEvents(crmBackend, lead_id);
      return jsonResponse({ ok: true, ...result });
    }

    // GET /crm/leads/:lead_id/case-file
    if (sub === 'case-file' && method === 'GET') {
      const result = await svc.getLeadCaseFile(crmBackend, lead_id);
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

      const result = await svc.registerOverride(crmBackend, lead_id, input);
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

      const result = await svc.toggleManualMode(crmBackend, lead_id, input);
      if (!result.success) return crmError(400, result.error ?? 'Erro ao alterar modo manual.');

      return jsonResponse({ ok: true, record: result.record }, 201);
    }

    // POST /crm/leads/:lead_id/reset
    if (sub === 'reset' && method === 'POST') {
      const body = await parseBody(request);
      if (!isRecord(body)) return crmError(400, 'Body JSON inválido.');

      const operator_id = (body.operator_id as string) ?? '';
      const reason = (body.reason as string) ?? '';

      const result = await svc.resetLead(crmBackend, lead_id, operator_id, reason);
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
