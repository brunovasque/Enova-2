/**
 * ENOVA 2 — Core Mecânico 2 — Motor de Decisão Estrutural (L03 + L04/L05/L06)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01 (L03), L-02 (L04), L-03 (L05), L-04 (L06)
 *   Bloco legado:    L03 — Mapa Canônico do Funil; L04, L05, L06 — Topo do Funil
 *
 * MISSÃO: receber estado estrutural, avaliar gates, retornar decisão estrutural.
 *
 * CAMINHOS DE DECISÃO:
 *   - Stage 'discovery' (topo): usa L04/L05/L06 — extractTopoSignals + evaluateTopoCriteria
 *   - Stage 'qualification_civil' (Meio A): usa L07/L08 — extractMeioASignals + evaluateMeioACriteria
 *   - Demais stages: usa caminho genérico L03 — G_FATO_CRITICO_AUSENTE
 *
 * RESTRIÇÃO INVIOLÁVEL: esta função não retorna texto ao cliente.
 * O LLM (Speech Engine) é soberano da fala.
 * `speech_intent` é apenas sinal estrutural — não é fala.
 */

import type { LeadState, CoreDecision } from './types.ts';
import { STAGE_MAP, evaluateApplicableGates } from './stage-map.ts';
import { extractTopoSignals } from './topo-parser.ts';
import { evaluateTopoCriteria } from './topo-gates.ts';
import { extractMeioASignals } from './meio-a-parser.ts';
import { evaluateMeioACriteria } from './meio-a-gates.ts';

// ---------------------------------------------------------------------------
// Ponto de entrada do motor
// ---------------------------------------------------------------------------

/**
 * Executa o ciclo de decisão estrutural do Core.
 *
 * Fluxo por stage:
 *   'discovery' → runTopoDecision() — usa L05 (parser) + L06 (gates) do topo
 *   outros      → avaliação genérica L03 (G_FATO_CRITICO_AUSENTE)
 *
 * INVIOLÁVEL: nenhum retorno contém texto ao cliente.
 */
export function runCoreEngine(state: LeadState): CoreDecision {
  const stageDef = STAGE_MAP[state.current_stage];

  if (!stageDef) {
    throw new Error(`Stage desconhecido: '${state.current_stage}'. Consultar L03 — Mapa Canônico do Funil.`);
  }

  // --- Caminho do topo (L04/L05/L06): stage discovery ---
  // O stage de discovery usa avaliação específica do topo que integra:
  //   L05 (topo-parser): extração e normalização de sinais do topo
  //   L06 (topo-gates):  critérios de aceite e next step estrutural do topo
  if (state.current_stage === 'discovery') {
    return runTopoDecision(state);
  }

  if (state.current_stage === 'qualification_civil') {
    return runMeioADecision(state);
  }

  // --- Caminho genérico (L03): demais stages ---
  const gateResults = evaluateApplicableGates(state, stageDef);
  const activatedGates = gateResults.filter((g) => g.activated);
  const blockAdvance = activatedGates.some((g) => g.block_advance);

  const stageAfter = blockAdvance
    ? state.current_stage
    : (stageDef.next_stages[0] ?? state.current_stage);

  const primaryBlock = activatedGates.find((g) => g.block_advance);
  const nextObjective = blockAdvance && primaryBlock?.missing_fact
    ? `coletar_${primaryBlock.missing_fact}`
    : blockAdvance
      ? `resolver_bloqueio_${primaryBlock?.gate_id ?? 'desconhecido'}`
      : `avancar_para_${stageAfter}`;

  // speech_intent: sinal estrutural para o Speech Engine — não é fala
  const speechIntent = blockAdvance
    ? 'bloqueio'
    : stageAfter !== state.current_stage
      ? 'transicao_stage'
      : 'coleta_dado';

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

// ---------------------------------------------------------------------------
// Caminho de decisão do Meio A — integra L07/L08 no Core principal
// ---------------------------------------------------------------------------

function runMeioADecision(state: LeadState): CoreDecision {
  const meioASignals = extractMeioASignals({
    facts_current: state.facts,
    facts_extracted: {},
  });

  const meioACriteria = evaluateMeioACriteria(meioASignals);
  const blockAdvance = !meioACriteria.can_advance;
  const stageAfter = meioACriteria.authorized_next_step as LeadState['current_stage'];

  const nextObjective = blockAdvance
    ? `coletar_${meioACriteria.missing_required_facts[0] ?? 'ajuste_meio_a'}`
    : `avancar_para_${stageAfter}`;

  return {
    stage_current: 'qualification_civil',
    stage_after: stageAfter,
    next_objective: nextObjective,
    block_advance: blockAdvance,
    gates_activated: meioACriteria.activated_gates,
    speech_intent: blockAdvance ? 'bloqueio' : 'transicao_stage',
    decision_id: `core-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    evaluated_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Caminho de decisão do topo — integra L04/L05/L06 no Core principal
// ---------------------------------------------------------------------------

/**
 * Executa o ciclo de decisão estrutural para o stage de discovery (topo do funil).
 *
 * Integra obrigatoriamente:
 *   L05 (topo-parser): extractTopoSignals — valida e normaliza sinais do topo
 *   L06 (topo-gates):  evaluateTopoCriteria — decide can_advance + authorized_next_step
 *
 * A decisão final (CoreDecision) é derivada diretamente de TopoCriteriaResult.
 * O Core não gera fala — apenas estrutura de decisão.
 *
 * Fonte: L-02 (L04), L-03 (L05), L-04 (L06) — CLAUSE_MAP.
 */
function runTopoDecision(state: LeadState): CoreDecision {
  // L05: extrair e validar sinais do topo a partir dos facts do lead
  // Nota: facts_extracted vazio — em L04–L06, todos os facts estão em state.facts.
  // A separação facts_current / facts_extracted é a interface Core ↔ LLM para futura
  // integração; por enquanto o Core consome diretamente state.facts.
  const topoSignals = extractTopoSignals({
    facts_current: state.facts,
    facts_extracted: {},
  });

  // L06: avaliar critérios mínimos do topo e determinar next step estrutural
  const topoCriteria = evaluateTopoCriteria(topoSignals);

  // Derivar CoreDecision a partir de TopoCriteriaResult (L06)
  const blockAdvance = !topoCriteria.can_advance;
  const stageAfter = topoCriteria.authorized_next_step as LeadState['current_stage'];

  const nextObjective = blockAdvance
    ? `coletar_${topoCriteria.missing_required_facts[0] ?? 'customer_goal'}`
    : `avancar_para_${stageAfter}`;

  // speech_intent: sinal estrutural para o Speech Engine — não é fala
  const speechIntent: CoreDecision['speech_intent'] = blockAdvance ? 'bloqueio' : 'transicao_stage';

  return {
    stage_current: 'discovery',
    stage_after: stageAfter,
    next_objective: nextObjective,
    block_advance: blockAdvance,
    gates_activated: blockAdvance ? ['G_FATO_CRITICO_AUSENTE'] : [],
    speech_intent: speechIntent,
    decision_id: `core-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    evaluated_at: new Date().toISOString(),
  };
}

