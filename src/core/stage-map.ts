/**
 * ENOVA 2 — Core Mecânico 2 — Mapa de Stages e Gates (L03 — esqueleto)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01
 *   Bloco legado:    L03 — Mapa Canônico do Funil
 *
 * ESCOPO: esqueleto estrutural do funil — stages, ordem e slots de gate.
 * Regras de negócio detalhadas (composição, renda, elegibilidade) ficam para L04–L06+.
 *
 * RESTRIÇÃO INVIOLÁVEL: nenhum código aqui gera fala ou resposta ao cliente.
 */

import type { StageId, StageDefinition, GateId, GateResult, LeadState } from './types.ts';

// ---------------------------------------------------------------------------
// Mapa canônico de stages — esqueleto L03
// ---------------------------------------------------------------------------

/**
 * Definições estruturais dos stages do funil ENOVA 2.
 *
 * Cada stage declara:
 * - required_facts: chaves mínimas que devem estar em LeadState.facts para avançar
 * - next_stages: próximas transições autorizadas
 * - applicable_gates: slots de gate por stage (avaliação ativa em L03: G_FATO_CRITICO_AUSENTE)
 *
 * Regras detalhadas por stage ficam para L04–L06+.
 */
export const STAGE_MAP: Record<StageId, StageDefinition> = {
  discovery: {
    id: 'discovery',
    name: 'Topo — Discovery',
    required_facts: ['customer_goal'],
    next_stages: ['qualification_civil'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
  },

  qualification_civil: {
    id: 'qualification_civil',
    name: 'Meio A — Qualificação Civil',
    required_facts: ['estado_civil', 'processo'],
    next_stages: ['qualification_renda'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_COMPOSICAO_FAMILIAR'],
  },

  qualification_renda: {
    id: 'qualification_renda',
    name: 'Meio B — Qualificação de Renda',
    required_facts: ['regime_trabalho', 'renda_principal'],
    next_stages: ['qualification_eligibility'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_REGIME_RENDA'],
  },

  qualification_eligibility: {
    id: 'qualification_eligibility',
    name: 'Meio B — Gates de Elegibilidade',
    required_facts: ['nacionalidade'],
    next_stages: ['qualification_special', 'docs_prep'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_ELEGIBILIDADE'],
  },

  qualification_special: {
    id: 'qualification_special',
    name: 'Especiais — Trilhos P3 e Multi',
    required_facts: [],
    next_stages: ['docs_prep'],
    applicable_gates: ['G_TRILHO_ESPECIAL'],
  },

  docs_prep: {
    id: 'docs_prep',
    name: 'Docs Prep — Preparação Documental',
    required_facts: ['docs_channel_choice'],
    next_stages: ['docs_collection', 'visit'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
  },

  docs_collection: {
    id: 'docs_collection',
    name: 'Docs Collection — Coleta Documental',
    required_facts: ['doc_identity_status', 'doc_income_status', 'doc_residence_status'],
    next_stages: ['broker_handoff'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
  },

  broker_handoff: {
    id: 'broker_handoff',
    name: 'Broker Handoff — Handoff ao Correspondente',
    required_facts: [],
    next_stages: [],
    applicable_gates: [],
  },

  visit: {
    id: 'visit',
    name: 'Visit — Agendamento de Visita',
    required_facts: ['visit_interest'],
    next_stages: ['broker_handoff'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
  },
};

// ---------------------------------------------------------------------------
// Ordem canônica de stages
// ---------------------------------------------------------------------------

/**
 * Sequência canônica principal do funil (caminho padrão, sem ramificações).
 * Fonte: L03 — Mapa Canônico do Funil.
 */
export const CANONICAL_STAGE_ORDER: StageId[] = [
  'discovery',
  'qualification_civil',
  'qualification_renda',
  'qualification_eligibility',
  'qualification_special',
  'docs_prep',
  'docs_collection',
  'broker_handoff',
];

// ---------------------------------------------------------------------------
// Avaliador de gate ativo em L03: G_FATO_CRITICO_AUSENTE
// ---------------------------------------------------------------------------

/**
 * Verifica se algum fact obrigatório do stage atual está ausente.
 *
 * Este é o único gate avaliado ativamente em L03.
 * Gates de regras de negócio (G_COMPOSICAO_FAMILIAR, G_REGIME_RENDA, G_ELEGIBILIDADE)
 * são slots estruturais reservados para L04–L06+.
 */
export function evaluateGateFatoCriticoAusente(
  state: LeadState,
  stageDef: StageDefinition,
): GateResult {
  const missingFacts = stageDef.required_facts.filter(
    (key) => state.facts[key] === null || state.facts[key] === undefined,
  );

  const activated = missingFacts.length > 0;
  return {
    gate_id: 'G_FATO_CRITICO_AUSENTE',
    activated,
    block_advance: activated,
    missing_fact: activated ? (missingFacts[0] ?? null) : null,
    reason: activated
      ? `Facts obrigatórios ausentes no stage '${stageDef.id}': [${missingFacts.join(', ')}].`
      : `Todos os facts obrigatórios do stage '${stageDef.id}' estão presentes.`,
  };
}

/**
 * Avalia todos os gates aplicáveis ao stage atual.
 * Em L03 apenas G_FATO_CRITICO_AUSENTE é avaliado ativamente.
 * Os demais slots (G_COMPOSICAO_FAMILIAR, G_REGIME_RENDA, G_ELEGIBILIDADE)
 * retornam não-ativados e serão implementados em L04–L06+.
 */
export function evaluateApplicableGates(
  state: LeadState,
  stageDef: StageDefinition,
): GateResult[] {
  const results: GateResult[] = [];

  for (const gateId of stageDef.applicable_gates) {
    if (gateId === 'G_FATO_CRITICO_AUSENTE') {
      results.push(evaluateGateFatoCriticoAusente(state, stageDef));
    } else {
      // Slots reservados para L04–L06+ — não ativos em L03
      results.push({
        gate_id: gateId as GateId,
        activated: false,
        block_advance: false,
        missing_fact: null,
        reason: `Gate '${gateId}' reservado para implementação em L04–L06+.`,
      });
    }
  }

  return results;
}
