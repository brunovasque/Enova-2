/**
 * ENOVA 2 — Core Mecânico 2 — Critérios e Gates do Topo do Funil (L06)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-04 (CLAUSE_MAP — "Define gates de validação e aceite no topo.")
 * Bloco legado:      L06 — Topo do Funil — Critérios
 * Página-fonte:      PDF 4, p. 8 (E6.1: critérios de aceite e evidência mínima do topo);
 *                    PDF 6, p. 3 (F0: customer_goal como gate de avanço);
 *                    PDF 2, p. 2 (não-negociáveis de implantação — escopo do topo)
 * Gate-fonte:        Gate 2 (A01: "sem smoke da frente, não promove")
 * Evidência exigida: smoke cenário 5 passando (critério de avanço do topo)
 *
 * RESTRIÇÃO INVIOLÁVEL: este módulo NÃO gera fala ao cliente.
 * Ele emite apenas decisão estrutural de avanço/bloqueio.
 * O LLM é soberano da fala.
 *
 * ESCOPO: somente o gate de critérios de aceite e next step do topo (L06).
 * Gates de Meio A (composição familiar) ficam para L07+.
 * Gates de Meio B (regime/renda) ficam para L11+.
 */

import type { TopoSignals } from './topo-parser.ts';
import {
  TOPO_BLOCKING_CONDITIONS,
  TOPO_ADVANCE_CRITERIA,
  TOPO_SIGNAL_POLICY,
  TOPO_NEXT_STEP,
} from './topo-rules.ts';

// ---------------------------------------------------------------------------
// Resultado da avaliação de critérios do topo (L06)
// ---------------------------------------------------------------------------

/**
 * Resultado estrutural da avaliação dos critérios/gates do topo.
 *
 * Fonte: E6.1 — PDF 4, p. 8:
 * "Critério de aceite: Topo natural sem perder captação do primeiro sinal útil."
 * "Evidência mínima: Casos de curiosidade, desvio e abertura aprovados."
 */
export interface TopoCriteriaResult {
  /**
   * O topo pode avançar para o próximo stage?
   * true = todos os critérios mínimos satisfeitos.
   * false = algum critério bloqueante ainda pendente.
   */
  can_advance: boolean;

  /**
   * Próximo step estrutural autorizado.
   * Se can_advance=true → 'qualification_civil'.
   * Se can_advance=false → 'discovery' (permanece no topo).
   * Fonte: TOPO_NEXT_STEP (L04 topo-rules).
   */
  authorized_next_step: string;

  /**
   * Código do critério satisfeito ou do bloqueio ativo.
   * Usa os códigos de TOPO_ADVANCE_CRITERIA ou TOPO_BLOCKING_CONDITIONS (L04).
   */
  criteria_code: string;

  /**
   * Razão estrutural do resultado — não é fala ao cliente.
   * Uso interno: logs, telemetria, debugging.
   */
  structural_reason: string;

  /**
   * Sinal de trilho do lead.
   * Fonte: TOPO_SIGNAL_POLICY (L04).
   */
  track_signal: string;

  /**
   * Lista de facts mínimos ausentes no topo.
   * Referencia os keys de TOPO_REQUIRED_FACTS (L04).
   */
  missing_required_facts: string[];
}

// ---------------------------------------------------------------------------
// Avaliador principal dos critérios do topo (L06)
// ---------------------------------------------------------------------------

/**
 * Avalia os critérios mínimos de aceite e o next step estrutural do topo.
 *
 * Recebe os sinais já extraídos e validados pelo L05 (topo-parser)
 * e decide se o stage de discovery pode avançar.
 *
 * Fonte: E6.1 — PDF 4, p. 8:
 * "Critério de aceite: Topo natural sem perder captação do primeiro sinal útil."
 * Fonte: F0 (customer_goal) — PDF 6, p. 3.
 *
 * REGRA CENTRAL: o único critério obrigatório para sair do topo é customer_goal coletado.
 * offtrack_type detectado não bloqueia por si só — sinaliza retorno ao objetivo.
 */
export function evaluateTopoCriteria(signals: TopoSignals): TopoCriteriaResult {
  const missingRequiredFacts: string[] = [];

  // --- Gate: customer_goal ausente ---
  // Fonte: TOPO_REQUIRED_FACTS (L04), F0 — PDF 6, p. 3
  if (!signals.customer_goal_detected) {
    missingRequiredFacts.push('customer_goal');
  }

  // --- Decisão de avanço ---
  const canAdvance = missingRequiredFacts.length === 0;

  if (canAdvance) {
    // Critério satisfeito: customer_goal presente
    const trackSignal = signals.offtrack_detected
      ? TOPO_SIGNAL_POLICY.OFFTRACK_DETECTED
      : TOPO_SIGNAL_POLICY.ON_TRACK;

    return {
      can_advance: true,
      authorized_next_step: TOPO_NEXT_STEP.ADVANCE_TO_QUALIFICATION,
      criteria_code: TOPO_ADVANCE_CRITERIA.CUSTOMER_GOAL_PRESENTE,
      structural_reason:
        `customer_goal='${signals.customer_goal_value}' coletado — ` +
        `topo autorizado a avançar para qualification_civil.`,
      track_signal: trackSignal,
      missing_required_facts: [],
    };
  }

  // Bloqueio: customer_goal ausente
  return {
    can_advance: false,
    authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
    criteria_code: TOPO_BLOCKING_CONDITIONS.CUSTOMER_GOAL_AUSENTE,
    structural_reason:
      `customer_goal ausente — topo bloqueado. ` +
      `Facts obrigatórios pendentes: [${missingRequiredFacts.join(', ')}].`,
    track_signal: TOPO_SIGNAL_POLICY.OFFTRACK_DETECTED,
    missing_required_facts: missingRequiredFacts,
  };
}

// ---------------------------------------------------------------------------
// Avaliador de gate de fato crítico ausente — versão topo (L06 + L03)
// ---------------------------------------------------------------------------

/**
 * Verifica se o lead possui os facts mínimos do topo para ser considerado pronto.
 *
 * Este avaliador é complementar ao G_FATO_CRITICO_AUSENTE do L03, com semântica
 * específica para o stage de discovery.
 *
 * Fonte: G_FATO_CRITICO_AUSENTE (L03 stage-map); TOPO_REQUIRED_FACTS (L04).
 *
 * @returns true se algum fact obrigatório do topo estiver ausente; false se estiver pronto.
 */
export function isTopoFactoCriticoAusente(signals: TopoSignals): boolean {
  return !signals.customer_goal_detected;
}
