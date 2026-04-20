/**
 * ENOVA 2 — Core Mecânico 2 — Motor de Decisão Estrutural (L03 — esqueleto)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01
 *   Bloco legado:    L03 — Mapa Canônico do Funil
 *
 * MISSÃO: receber estado estrutural, avaliar gates, retornar decisão estrutural.
 * ESCOPO L03: block / no-block baseado em facts obrigatórios presentes.
 * Regras de negócio detalhadas (composição, renda, elegibilidade) ficam para L04–L06+.
 *
 * RESTRIÇÃO INVIOLÁVEL: esta função não retorna texto ao cliente.
 * O LLM (Speech Engine) é soberano da fala.
 */

import type { LeadState, CoreDecision } from './types.ts';
import { STAGE_MAP, evaluateApplicableGates } from './stage-map.ts';

// ---------------------------------------------------------------------------
// Ponto de entrada do motor
// ---------------------------------------------------------------------------

/**
 * Executa o ciclo de decisão estrutural mínimo do Core.
 *
 * Fluxo L03:
 * 1. Carregar definição do stage atual
 * 2. Avaliar gates aplicáveis (ativamente: G_FATO_CRITICO_AUSENTE)
 * 3. Determinar block_advance e next_objective
 * 4. Calcular stage_after
 * 5. Emitir speech_intent (sinal estrutural — não é fala)
 *
 * Regras detalhadas de negócio (casado civil, autônomo/IR, renda, elegibilidade)
 * serão adicionadas ao engine em L04–L06+.
 */
export function runCoreEngine(state: LeadState): CoreDecision {
  const stageDef = STAGE_MAP[state.current_stage];

  if (!stageDef) {
    throw new Error(`Stage desconhecido: '${state.current_stage}'. Consultar L03 — Mapa Canônico do Funil.`);
  }

  // Avaliar gates do stage atual
  const gateResults = evaluateApplicableGates(state, stageDef);
  const activatedGates = gateResults.filter((g) => g.activated);
  const blockAdvance = activatedGates.some((g) => g.block_advance);

  // Calcular próximo stage e objetivo
  const stageAfter = blockAdvance
    ? state.current_stage
    : (stageDef.next_stages[0] ?? state.current_stage);

  const primaryBlock = activatedGates.find((g) => g.block_advance);
  const nextObjective = blockAdvance && primaryBlock?.missing_fact
    ? `coletar_${primaryBlock.missing_fact}`
    : blockAdvance
      ? `resolver_bloqueio_${primaryBlock?.gate_id ?? 'desconhecido'}`
      : `avancar_para_${stageAfter}`;

  // Derivar speech_intent — sinal estrutural para o Speech Engine (não é fala)
  const speechIntent = blockAdvance ? 'bloqueio' : stageAfter !== state.current_stage ? 'transicao_stage' : 'coleta_dado';

  return {
    stage_current: state.current_stage,
    stage_after: stageAfter as typeof state.current_stage,
    next_objective: nextObjective,
    block_advance: blockAdvance,
    gates_activated: activatedGates.map((g) => g.gate_id),
    speech_intent: speechIntent,
    decision_id: `core-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    evaluated_at: new Date().toISOString(),
  };
}
