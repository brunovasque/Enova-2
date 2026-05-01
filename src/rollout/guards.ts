import type { RolloutControlFlags, RolloutGuardInput, RolloutGuardResult } from './types.ts';

const ROUTE_METHODS: Record<string, readonly string[]> = {
  '/': ['GET'],
  '/__core__/run': ['POST'],
  '/__meta__/ingest': ['POST'],
  '/__meta__/webhook': ['GET', 'POST'],
};

const BLOCKED_BOUNDARIES = [
  'rollout_real_activation',
  'meta_real_activation',
  'supabase_real_new_activation',
  'external_dashboard_activation',
  'external_mandatory_tool_activation',
  'manual_external_deploy',
] as const;

const TECHNICAL_LOCAL_CONTROLS: RolloutControlFlags = {
  allow_external_rollout_activation: false,
  allow_meta_real_activation: false,
  allow_supabase_real_new_activation: false,
  allow_external_dashboard: false,
  allow_external_mandatory_tool: false,
  allow_manual_external_deploy: false,
};

export function isRouteKnownForRollout(route: string): boolean {
  return route in ROUTE_METHODS;
}

export function evaluateRolloutGuard(input: RolloutGuardInput): RolloutGuardResult {
  const reason_codes: string[] = [];
  let gate_status: RolloutGuardResult['gate_status'] = 'pass';
  let decision: RolloutGuardResult['decision'] = 'hold';

  if (!isRouteKnownForRollout(input.route)) {
    gate_status = 'blocked';
    decision = 'abort';
    reason_codes.push('route_out_of_rollout_scope');
  } else {
    const allowedMethods = ROUTE_METHODS[input.route];
    if (!allowedMethods.includes(input.method)) {
      gate_status = 'blocked';
      decision = 'abort';
      reason_codes.push('method_not_allowed_for_route');
    }
  }

  // PR3 ainda não autoriza promoção real: só representação técnica local.
  const promotion_block = true;
  reason_codes.push('promotion_blocked_until_pr4_closeout');

  // Ready técnico mínimo para fallback local do recorte (sem deploy externo).
  const rollback_ready = true;
  reason_codes.push('rollback_local_guard_ready');

  return {
    gate_status,
    promotion_block,
    rollback_ready,
    stage: 'shadow',
    decision,
    reason_codes,
    blocked_boundaries: [...BLOCKED_BOUNDARIES],
    controls: { ...TECHNICAL_LOCAL_CONTROLS },
    mode: 'technical_local_only',
  };
}
