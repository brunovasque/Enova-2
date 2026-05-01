/**
 * ENOVA 2 — PR-T8.15 — Health operacional de go-live
 *
 * Handler para GET /__admin__/go-live/health
 *
 * Retorna status geral, flags públicas, bloqueios ativos e readiness de cada frente.
 * Requer X-CRM-Admin-Key (mesma regra CRM).
 * NUNCA expõe secrets.
 */

import { flagsPublicSummary, readCanonicalFlags } from './flags.ts';
import { evaluateGoLiveReadiness } from './harness.ts';
import { isOperationallyAllowed } from './rollback.ts';

export const GOLIVE_HEALTH_ROUTE = '/__admin__/go-live/health' as const;

function isCrmAuthValid(request: Request, env: Record<string, unknown>): boolean {
  const key = request.headers.get('x-crm-admin-key');
  if (!key) return false;
  const expected = typeof env['CRM_ADMIN_KEY'] === 'string' ? env['CRM_ADMIN_KEY'] : null;
  if (expected && key === expected) return true;
  if (env['CRM_ALLOW_DEV_TOKEN'] === 'true' && key === 'dev-crm-local') return true;
  return false;
}

export async function handleGoLiveHealth(
  request: Request,
  env: Record<string, unknown> = {},
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!isCrmAuthValid(request, env)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const flags = readCanonicalFlags(env);
  const readiness = evaluateGoLiveReadiness(env);
  const opDecision = isOperationallyAllowed(env);

  const payload = {
    ok: true,
    route: GOLIVE_HEALTH_ROUTE,
    timestamp: new Date().toISOString(),
    status: readiness.g8_allowed ? 'g8_ready' : 'g8_blocked',
    flags: flagsPublicSummary(flags),
    blocking_reasons: readiness.blocking_reasons,
    readiness: {
      crm_ready: readiness.crm_ready,
      supabase_ready: readiness.supabase_ready,
      meta_ready: readiness.meta_ready,
      memory_ready: readiness.memory_ready,
      telemetry_ready: readiness.telemetry_ready,
      rollback_ready: readiness.rollback_ready,
      flags_ready: readiness.flags_ready,
    },
    operations: {
      client_real_allowed: readiness.client_real_allowed,
      llm_real_allowed: readiness.llm_real_allowed,
      channel_real_allowed: readiness.channel_real_allowed,
      rollback_active: opDecision.rollback_active,
      maintenance_active: opDecision.maintenance_active,
    },
    g8: {
      allowed: readiness.g8_allowed,
      blocking_reasons: readiness.blocking_reasons,
    },
    details: readiness.details,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
