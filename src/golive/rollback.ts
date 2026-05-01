/**
 * ENOVA 2 — PR-T8.15 — Rollback técnico e decisão operacional
 *
 * Função central de decisão operacional: isOperationallyAllowed().
 *
 * REGRAS INVIOLÁVEIS:
 *   - Default bloqueado (env vazio = operação real NÃO permitida).
 *   - ROLLBACK_FLAG=true bloqueia tudo.
 *   - MAINTENANCE_MODE=true bloqueia atendimento.
 *   - Cada operação real exige flag explícita separada.
 *   - Nenhuma combinação parcial desbloqueia operação real.
 */

import { readCanonicalFlags, type CanonicalFlags } from './flags.ts';

export interface OperationalDecision {
  allowed: boolean;
  rollback_active: boolean;
  maintenance_active: boolean;
  blocking_reasons: string[];
  flags: CanonicalFlags;
}

export interface OperationRequest {
  require_enova2?: boolean;
  require_channel?: boolean;
  require_meta_outbound?: boolean;
  require_llm_real?: boolean;
  require_client_real?: boolean;
  require_canary_above?: number;
}

export function isOperationallyAllowed(
  env: Record<string, unknown> = {},
  operation: OperationRequest = {},
): OperationalDecision {
  const flags = readCanonicalFlags(env);
  const reasons: string[] = [];

  if (flags.rollback_flag) {
    reasons.push('ROLLBACK_FLAG=true — todas as operações reais bloqueadas');
  }

  if (flags.maintenance_mode) {
    reasons.push('MAINTENANCE_MODE=true — atendimento bloqueado');
  }

  if (operation.require_enova2 && !flags.enova2_enabled) {
    reasons.push('ENOVA2_ENABLED=false — sistema não habilitado');
  }

  if (operation.require_channel && !flags.channel_enabled) {
    reasons.push('CHANNEL_ENABLED=false — canal real bloqueado');
  }

  if (operation.require_meta_outbound && !flags.meta_outbound_enabled) {
    reasons.push('META_OUTBOUND_ENABLED=false — outbound Meta bloqueado');
  }

  if (operation.require_llm_real && !flags.llm_real_enabled) {
    reasons.push('LLM_REAL_ENABLED=false — LLM real bloqueado');
  }

  if (operation.require_client_real && !flags.client_real_enabled) {
    reasons.push('CLIENT_REAL_ENABLED=false — cliente real bloqueado');
  }

  const minCanary = operation.require_canary_above ?? 0;
  if (minCanary > 0 && flags.canary_percent < minCanary) {
    reasons.push(`CANARY_PERCENT=${flags.canary_percent} < ${minCanary} — tráfego real insuficiente`);
  }

  const allowed = reasons.length === 0;

  return {
    allowed,
    rollback_active: flags.rollback_flag,
    maintenance_active: flags.maintenance_mode,
    blocking_reasons: reasons,
    flags,
  };
}

export function isFullGoLiveAllowed(env: Record<string, unknown> = {}): OperationalDecision {
  return isOperationallyAllowed(env, {
    require_enova2: true,
    require_channel: true,
    require_meta_outbound: true,
    require_llm_real: true,
    require_client_real: true,
    require_canary_above: 1,
  });
}
