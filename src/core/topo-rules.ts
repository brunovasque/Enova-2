/**
 * ENOVA 2 — Core Mecânico 2 — Regras e Política do Topo do Funil (L04)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-02 (CLAUSE_MAP — "Define regras operacionais do stage de topo.")
 * Bloco legado:      L04 — Topo do Funil — Contrato
 * Página-fonte:      PDF 6, pp. 3–4 (F0: customer_goal, channel_origin; F7: current_intent;
 *                    F9: offtrack_type); PDF 2, pp. 2–3 (não-negociáveis); PDF 4 (E6.1, p. 8)
 * Gate-fonte:        Gate 2 (A01: "sem smoke da frente, não promove")
 * Evidência exigida: smoke cenário 4 e 5 passando
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo define somente ESTRUTURA e POLÍTICA do topo.
 * Nenhuma fala, surface ou resposta ao cliente é produzida aqui.
 * O LLM é soberano da fala.
 *
 * ESCOPO: somente L04 — topo do funil. Regras de Meio A (L07–L10) e Meio B (L11–L14) ficam
 * para PRs futuras.
 */

// ---------------------------------------------------------------------------
// Facts obrigatórios do topo (F0 — PDF 6, p. 3)
// ---------------------------------------------------------------------------

/**
 * Facts obrigatórios que o stage de discovery/topo precisa coletar.
 * Fonte: F0 (customer_goal) — PDF 6, p. 3.
 * "customer_goal: Comprar imóvel, entender programa, enviar docs, visitar etc."
 */
export const TOPO_REQUIRED_FACTS = ['customer_goal'] as const;

/**
 * Facts complementares do topo — úteis mas não obrigatórios para avançar.
 * Fonte: F0 (channel_origin); F7 (current_intent) — PDF 6, pp. 3–4.
 */
export const TOPO_OPTIONAL_FACTS = ['channel_origin', 'current_intent'] as const;

/**
 * Sinais de desvio do topo — indicam que o lead está fora do trilho principal.
 * Fonte: F9 (offtrack_type) — PDF 6, p. 4.
 * "curiosidade, objeção, desabafo, pergunta lateral"
 */
export const TOPO_OFFTRACK_FACT_KEY = 'offtrack_type' as const;

// ---------------------------------------------------------------------------
// Valores canônicos do topo — derivados da taxonomia oficial (PDF 6)
// ---------------------------------------------------------------------------

/**
 * Valores canônicos para customer_goal (F0 — PDF 6, p. 3).
 * Fonte literal: "Comprar imóvel, entender programa, enviar docs, visitar etc."
 */
export type CustomerGoal =
  | 'comprar_imovel'
  | 'entender_programa'
  | 'enviar_docs'
  | 'visitar_imovel'
  | 'outro';

/**
 * Valores canônicos para current_intent (F7 — PDF 6, p. 4).
 * Fonte literal: "entender programa, seguir análise, enviar docs, visita"
 */
export type CurrentIntent =
  | 'entender_programa'
  | 'seguir_analise'
  | 'enviar_docs'
  | 'visita';

/**
 * Valores canônicos para offtrack_type (F9 — PDF 6, p. 4).
 * Fonte literal: "curiosidade, objeção, desabafo, pergunta lateral"
 */
export type OfftrackType =
  | 'curiosidade'
  | 'objecao'
  | 'desabafo'
  | 'pergunta_lateral';

// ---------------------------------------------------------------------------
// Condições de bloqueio do topo (L04 — política)
// ---------------------------------------------------------------------------

/**
 * Condições que impedem avanço no topo do funil.
 * Fonte: E6.1 — PDF 4, p. 8 ("Não iniciar se: não houver política clara de retorno ao
 * objetivo."); F0 (customer_goal obrigatório).
 */
export const TOPO_BLOCKING_CONDITIONS = {
  /**
   * customer_goal ausente — fact obrigatório do topo não coletado.
   * O lead não pode avançar sem que o objetivo principal seja identificado.
   * Fonte: F0 (customer_goal) — PDF 6, p. 3.
   */
  CUSTOMER_GOAL_AUSENTE: 'topo.customer_goal_ausente',
} as const;

// ---------------------------------------------------------------------------
// Critérios mínimos para sair do topo (L04 — política)
// ---------------------------------------------------------------------------

/**
 * Critérios mínimos para que o stage de discovery possa avançar para qualification_civil.
 * Fonte: E6.1 — PDF 4, p. 8 ("Topo natural sem perder captação do primeiro sinal útil."
 * "Critério de aceite: Topo natural sem perder captação do primeiro sinal útil.")
 */
export const TOPO_ADVANCE_CRITERIA = {
  /**
   * customer_goal coletado — o lead declarou ou sinalizou seu objetivo no programa.
   * Este é o único critério obrigatório para sair do topo (L04).
   * Fonte: F0 (customer_goal) — PDF 6, p. 3.
   */
  CUSTOMER_GOAL_PRESENTE: 'topo.customer_goal_presente',
} as const;

// ---------------------------------------------------------------------------
// Sinais que permitem continuar vs. que bloqueiam no topo (L04 — política)
// ---------------------------------------------------------------------------

/**
 * Regras de sinalização do topo.
 *
 * Fonte: E6.1 — PDF 4, p. 8:
 * "Evidência mínima: Casos de curiosidade, desvio e abertura aprovados."
 * "Não iniciar se: não houver política clara de retorno ao objetivo."
 *
 * Sinais que PERMITEM continuar (não bloqueiam obrigatoriamente):
 *   - offtrack_type detectado: o lead pode estar desviando, mas o Core não encerra —
 *     apenas sinaliza para o LLM retornar ao objetivo. O Lead continua no stage de discovery.
 *
 * Sinais que BLOQUEIAM continuidade no topo:
 *   - customer_goal ausente: o lead não pode avançar para qualification_civil.
 */
export const TOPO_SIGNAL_POLICY = {
  /**
   * Sinal de desvio detectado — não bloqueia avanço, mas o topo não avança sem
   * customer_goal. O LLM deve retornar o lead ao objetivo principal.
   * Fonte: E6.1 "política clara de retorno ao objetivo".
   */
  OFFTRACK_DETECTED: 'sinal_de_desvio_detectado',

  /**
   * Lead no trilho principal — customer_goal coletado, pode avançar.
   */
  ON_TRACK: 'lead_no_trilho_principal',
} as const;

// ---------------------------------------------------------------------------
// Next step estrutural do topo (L04 — política de transição)
// ---------------------------------------------------------------------------

/**
 * Transições autorizadas a partir do stage de discovery (topo).
 * Fonte: L03 STAGE_MAP (qualification_civil como próximo stage canônico após discovery).
 */
export const TOPO_NEXT_STEP = {
  /** Lead avança para o Meio A — qualificação civil (estado civil, composição). */
  ADVANCE_TO_QUALIFICATION: 'qualification_civil',
  /** Lead permanece no topo — facts mínimos ainda ausentes. */
  REMAIN_IN_DISCOVERY: 'discovery',
} as const;
