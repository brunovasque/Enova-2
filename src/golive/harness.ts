/**
 * ENOVA 2 — PR-T8.15 — Harness de go-live controlado
 *
 * Avalia readiness operacional SEM executar nada real.
 *
 * REGRAS INVIOLÁVEIS:
 *   - Não atende cliente.
 *   - Não manda mensagem.
 *   - Não chama LLM real.
 *   - Não grava produção real.
 *   - Produz apenas relatório de readiness.
 *   - Nenhum secret aparece no output.
 */

import { readCanonicalFlags } from './flags.ts';
import { isOperationallyAllowed } from './rollback.ts';

export interface GoLiveReadiness {
  crm_ready: boolean;
  supabase_ready: boolean;
  meta_ready: boolean;
  memory_ready: boolean;
  telemetry_ready: boolean;
  rollback_ready: boolean;
  flags_ready: boolean;
  client_real_allowed: boolean;
  llm_real_allowed: boolean;
  channel_real_allowed: boolean;
  g8_allowed: boolean;
  blocking_reasons: string[];
  details: Record<string, unknown>;
}

export function evaluateGoLiveReadiness(env: Record<string, unknown> = {}): GoLiveReadiness {
  const flags = readCanonicalFlags(env);
  const blocking_reasons: string[] = [];

  // CRM: operacional desde PR-T8.4/T8.5/T8.6
  const crm_ready = true;

  // Supabase: leitura real aprovada em PR-T8.9B; escrita real pendente
  const supabase_ready = true;

  // Meta/WhatsApp: implementado em PR-T8.11, harness em PR-T8.12B
  // mas prova real BLOQUEADA_AGUARDANDO_VASQUES
  const meta_ready = false;
  blocking_reasons.push('Meta/WhatsApp BLOQUEADA_AGUARDANDO_VASQUES — secrets, Worker test e webhook Meta não provisionados por Vasques (PR-T8.12B)');

  // Memória/telemetria: aprovada local/in-memory em PR-T8.14
  const memory_ready = true;

  // Telemetria: operacional desde FRONT-7
  const telemetry_ready = true;

  // Rollback técnico: implementado nesta PR
  const rollback_ready = true;

  // Flags
  const flags_ready = !flags.rollback_flag && !flags.maintenance_mode;
  if (flags.rollback_flag) {
    blocking_reasons.push('ROLLBACK_FLAG=true ativo');
  }
  if (flags.maintenance_mode) {
    blocking_reasons.push('MAINTENANCE_MODE=true ativo');
  }

  // Operações reais
  const client_decision = isOperationallyAllowed(env, { require_enova2: true, require_client_real: true });
  const client_real_allowed = client_decision.allowed;
  if (!client_real_allowed) {
    for (const r of client_decision.blocking_reasons) {
      if (!blocking_reasons.includes(r)) blocking_reasons.push(r);
    }
  }

  const llm_decision = isOperationallyAllowed(env, { require_enova2: true, require_llm_real: true });
  const llm_real_allowed = llm_decision.allowed;
  if (!llm_real_allowed) {
    for (const r of llm_decision.blocking_reasons) {
      if (!blocking_reasons.includes(r)) blocking_reasons.push(r);
    }
  }

  const channel_decision = isOperationallyAllowed(env, { require_enova2: true, require_channel: true });
  const channel_real_allowed = channel_decision.allowed;
  if (!channel_real_allowed) {
    for (const r of channel_decision.blocking_reasons) {
      if (!blocking_reasons.includes(r)) blocking_reasons.push(r);
    }
  }

  // G8 só pode ser fechado se todas as frentes críticas estiverem prontas
  const g8_allowed =
    crm_ready &&
    supabase_ready &&
    meta_ready &&
    memory_ready &&
    telemetry_ready &&
    rollback_ready &&
    client_real_allowed &&
    llm_real_allowed &&
    channel_real_allowed;

  if (!g8_allowed && !blocking_reasons.some((r) => r.includes('G8'))) {
    blocking_reasons.push('G8 NÃO PERMITIDO — critérios acima não satisfeitos');
  }

  return {
    crm_ready,
    supabase_ready,
    meta_ready,
    memory_ready,
    telemetry_ready,
    rollback_ready,
    flags_ready,
    client_real_allowed,
    llm_real_allowed,
    channel_real_allowed,
    g8_allowed,
    blocking_reasons,
    details: {
      meta_status: 'BLOQUEADA_AGUARDANDO_VASQUES',
      supabase_write_real: 'pending_pr_future',
      memory_persistence: 'in_memory_only',
      llm_real_status: 'not_activated',
      client_real_status: 'not_authorized',
      g8_status: g8_allowed ? 'PERMITIDO' : 'BLOQUEADO',
    },
  };
}
