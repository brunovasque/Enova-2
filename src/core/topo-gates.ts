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
  TOPO_NEXT_OBJECTIVES,
} from './topo-rules.ts';

// ---------------------------------------------------------------------------
// Resultado da avaliação de critérios do topo (L06)
// ---------------------------------------------------------------------------

/**
 * Resultado estrutural da avaliação dos critérios/gates do topo.
 *
 * Fonte: E6.1 — PDF 4, p. 8:
 * "Critério de aceite: Topo natural sem perder captação do primeiro sinal útil."
 * Rota canônica: customer_goal → nome_completo → nacionalidade → (rnm se estrangeiro).
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

  /**
   * Objetivo estrutural para o próximo turno — instrui o LLM sobre o que fazer.
   * Não é fala ao cliente. Deriva de TOPO_NEXT_OBJECTIVES (L04).
   */
  next_objective: string;
}

// ---------------------------------------------------------------------------
// Avaliador principal dos critérios do topo (L06)
// ---------------------------------------------------------------------------

/**
 * Avalia os critérios mínimos de aceite e o next step estrutural do topo.
 *
 * Rota canônica obrigatória (T9.15E + T9.16B + T9.16B-v2):
 *   0. primeiro turno real (isFirstTurn=true, state.facts vazio) → apresentar Enova e verificar conhecimento
 *   1. customer_goal ausente (turno 2+) → pedir interesse
 *   2. nome_completo ausente → bloqueia, explicar programa e pedir nome
 *   3. nacionalidade ausente → bloqueia, perguntar se brasileiro ou estrangeiro
 *   4. estrangeiro com rnm_valido=null → bloqueia, perguntar RNM e validade
 *   4A. estrangeiro com rnm_valido=false + sem alternativa confirmada → verificar alternativa
 *   4B. estrangeiro com rnm_valido=false + sem_alternativa → encerrar com porta aberta
 *   5. topo mínimo completo → autoriza qualification_civil
 *
 * @param isFirstTurn true apenas quando state.facts está completamente vazio (primeiro turno real).
 *   Derivado em engine.ts: Object.keys(state.facts).length === 0.
 *   NÃO usar parse_status='empty' — esse status pode ocorrer em qualquer turno onde o
 *   extractor não reconhece a mensagem, causando greeting repetido.
 *
 * Fonte: E6.1 — PDF 4, p. 8; rota canônica topo ENOVA 2.
 * INVIOLÁVEL: NÃO pular direto para estado civil; NÃO mover nacionalidade para depois.
 */
export function evaluateTopoCriteria(signals: TopoSignals, isFirstTurn?: boolean): TopoCriteriaResult {
  // --- Gate 1: customer_goal ausente ---
  // isFirstTurn=true (state.facts vazio — primeiro turno) → saudar e verificar conhecimento do programa
  // isFirstTurn=false/undefined (turno 2+ — facts persistidos existem) → coletar customer_goal diretamente
  if (!signals.customer_goal_detected) {
    const nextObj = isFirstTurn === true
      ? TOPO_NEXT_OBJECTIVES.APRESENTAR_E_VERIFICAR_CONHECIMENTO
      : TOPO_NEXT_OBJECTIVES.COLETAR_CUSTOMER_GOAL;
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.CUSTOMER_GOAL_AUSENTE,
      structural_reason: 'customer_goal ausente — aguardando interesse do lead.',
      track_signal: TOPO_SIGNAL_POLICY.OFFTRACK_DETECTED,
      missing_required_facts: ['customer_goal'],
      next_objective: nextObj,
    };
  }

  // --- Gate 2: nome_completo ausente ---
  if (!signals.nome_completo_detected) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.NOME_COMPLETO_AUSENTE,
      structural_reason: `customer_goal='${signals.customer_goal_value}' coletado; nome_completo ausente.`,
      track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
      missing_required_facts: ['nome_completo'],
      next_objective: TOPO_NEXT_OBJECTIVES.EXPLICAR_MCMV_E_COLETAR_NOME,
    };
  }

  // --- Gate 3: nacionalidade ausente ---
  if (!signals.nacionalidade_detected) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.NACIONALIDADE_AUSENTE,
      structural_reason: `nome_completo='${signals.nome_completo_value}' coletado; nacionalidade ausente.`,
      track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
      missing_required_facts: ['nacionalidade'],
      next_objective: TOPO_NEXT_OBJECTIVES.PERGUNTAR_NACIONALIDADE,
    };
  }

  // --- Gate 4: estrangeiro — RNM não respondido ainda (null) → perguntar ---
  if (signals.nacionalidade_value === 'estrangeiro' && signals.rnm_valido === null) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.ESTRANGEIRO_SEM_RNM_VALIDO,
      structural_reason: 'estrangeiro declarado; RNM válido ainda não confirmado.',
      track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
      missing_required_facts: ['rnm_valido'],
      next_objective: TOPO_NEXT_OBJECTIVES.PERGUNTAR_RNM,
    };
  }

  // --- Gates 4A / 4B: estrangeiro com rnm_valido=false ---
  const alternativaRnm = signals.alternativa_rnm;
  if (signals.nacionalidade_value === 'estrangeiro' && signals.rnm_valido === false) {
    if (alternativaRnm === 'tem_conjuge_brasileiro' || alternativaRnm === 'tem_familiar_brasileiro') {
      // Alternativa confirmada → deixa passar para o avanço final (topo mínimo completo via alternativa)
    } else if (alternativaRnm === 'sem_alternativa') {
      // Gate 4B: sem alternativa → encerrar com porta aberta
      return {
        can_advance: false,
        authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
        criteria_code: TOPO_BLOCKING_CONDITIONS.SEM_ALTERNATIVA_RNM,
        structural_reason: 'sem alternativa de RNM ou familiar brasileiro; encerramento com porta aberta.',
        track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
        missing_required_facts: [],
        next_objective: TOPO_NEXT_OBJECTIVES.ENCERRAR_SEM_ALTERNATIVA_RNM,
      };
    } else {
      // Gate 4A: alternativa não informada ainda → verificar
      return {
        can_advance: false,
        authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
        criteria_code: TOPO_BLOCKING_CONDITIONS.RNM_INVALIDO_VERIFICAR_ALTERNATIVA,
        structural_reason: 'RNM inválido/determinado; verificando alternativa (cônjuge/familiar brasileiro).',
        track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
        missing_required_facts: ['alternativa_rnm'],
        next_objective: TOPO_NEXT_OBJECTIVES.VERIFICAR_ALTERNATIVA_RNM,
      };
    }
  }

  // --- Topo mínimo completo → avança para qualification_civil ---
  const trackSignal = signals.offtrack_detected
    ? TOPO_SIGNAL_POLICY.OFFTRACK_DETECTED
    : TOPO_SIGNAL_POLICY.ON_TRACK;

  const advanceStep = alternativaRnm === 'tem_conjuge_brasileiro' || alternativaRnm === 'tem_familiar_brasileiro'
    ? TOPO_NEXT_STEP.ADVANCE_TO_QUALIFICATION_VIA_ALTERNATIVA
    : TOPO_NEXT_STEP.ADVANCE_TO_QUALIFICATION;

  return {
    can_advance: true,
    authorized_next_step: advanceStep,
    criteria_code: TOPO_ADVANCE_CRITERIA.TOPO_MINIMO_COMPLETO,
    structural_reason:
      `topo mínimo completo: customer_goal='${signals.customer_goal_value}', ` +
      `nome_completo presente, nacionalidade='${signals.nacionalidade_value}'.`,
    track_signal: trackSignal,
    missing_required_facts: [],
    next_objective: TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL,
  };
}

// ---------------------------------------------------------------------------
// Avaliador de gate de fato crítico ausente — versão topo (L06 + L03)
// ---------------------------------------------------------------------------

/**
 * Verifica se o lead possui os facts mínimos do topo para ser considerado pronto.
 *
 * Retorna true se QUALQUER fact obrigatório da rota canônica estiver ausente.
 * Fonte: G_FATO_CRITICO_AUSENTE (L03 stage-map); TOPO_REQUIRED_FACTS (L04).
 *
 * @returns true se algum fact obrigatório do topo estiver ausente; false se estiver pronto.
 */
export function isTopoFactoCriticoAusente(signals: TopoSignals): boolean {
  if (!signals.customer_goal_detected) return true;
  if (!signals.nome_completo_detected) return true;
  if (!signals.nacionalidade_detected) return true;
  if (signals.nacionalidade_value === 'estrangeiro') {
    if (signals.rnm_valido === null) return true; // não perguntado ainda
    if (signals.rnm_valido === false) {
      const alt = signals.alternativa_rnm;
      // sem alternativa confirmada → ainda bloqueado
      if (alt !== 'tem_conjuge_brasileiro' && alt !== 'tem_familiar_brasileiro') return true;
    }
  }
  return false;
}
