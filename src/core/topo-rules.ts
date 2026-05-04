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
 * Rota canônica MCMV:
 *   1. customer_goal — interesse detectado
 *   2. nome_completo — nome do lead coletado (após explicar programa)
 *   3. nacionalidade — brasileiro/estrangeiro/naturalizado
 *   (se estrangeiro: rnm_valido verificado antes de avançar — ver topo-gates.ts)
 * Fonte: F0 (customer_goal) — PDF 6, p. 3; rota canônica topo ENOVA 2.
 */
export const TOPO_REQUIRED_FACTS = ['customer_goal', 'nome_completo', 'nacionalidade'] as const;

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
 * Avaliadas em sequência canônica: customer_goal → nome_completo → nacionalidade → rnm.
 * Fonte: E6.1 — PDF 4, p. 8; F0 (customer_goal obrigatório); rota canônica topo ENOVA 2.
 */
export const TOPO_BLOCKING_CONDITIONS = {
  /** customer_goal ausente — interesse não detectado ainda. */
  CUSTOMER_GOAL_AUSENTE: 'topo.customer_goal_ausente',
  /** nome_completo ausente — programa explicado, aguardando nome do lead. */
  NOME_COMPLETO_AUSENTE: 'topo.nome_completo_ausente',
  /** nacionalidade ausente — nome coletado, aguardando brasileiro/estrangeiro. */
  NACIONALIDADE_AUSENTE: 'topo.nacionalidade_ausente',
  /** estrangeiro declarado, RNM válido ainda não confirmado. */
  ESTRANGEIRO_SEM_RNM_VALIDO: 'topo.estrangeiro_sem_rnm_valido',
} as const;

// ---------------------------------------------------------------------------
// Critérios mínimos para sair do topo (L04 — política)
// ---------------------------------------------------------------------------

/**
 * Critérios mínimos para que o stage de discovery possa avançar para qualification_civil.
 * Todos os três critérios abaixo devem ser satisfeitos (+ RNM se estrangeiro).
 * Fonte: E6.1 — PDF 4, p. 8; rota canônica topo ENOVA 2.
 */
export const TOPO_ADVANCE_CRITERIA = {
  CUSTOMER_GOAL_PRESENTE: 'topo.customer_goal_presente',
  NOME_COMPLETO_PRESENTE: 'topo.nome_completo_presente',
  NACIONALIDADE_PRESENTE: 'topo.nacionalidade_presente',
  /** Todos os facts mínimos do topo coletados — autoriza avanço para qualification_civil. */
  TOPO_MINIMO_COMPLETO: 'topo.topo_minimo_completo',
} as const;

// ---------------------------------------------------------------------------
// Objetivos estruturais do topo — next_objective canônico por step (L04)
// ---------------------------------------------------------------------------

/**
 * Objetivos estruturais que o Core emite para cada etapa da rota canônica do topo.
 * O LLM usa esses objetivos como instrução de condução — não como fala ao cliente.
 */
export const TOPO_NEXT_OBJECTIVES = {
  /** customer_goal ausente — detectar interesse do lead. */
  COLETAR_CUSTOMER_GOAL: 'coletar_customer_goal',
  /** customer_goal presente, nome ausente — explicar programa brevemente e pedir nome. */
  EXPLICAR_MCMV_E_COLETAR_NOME: 'explicar_mcmv_e_coletar_nome_completo',
  /** nome coletado, nacionalidade ausente — perguntar se brasileiro ou estrangeiro. */
  PERGUNTAR_NACIONALIDADE: 'perguntar_nacionalidade',
  /** estrangeiro detectado, RNM não confirmado — perguntar RNM e validade. */
  PERGUNTAR_RNM: 'perguntar_rnm_e_validade',
  /** topo completo — instruir LLM a perguntar estado civil. */
  AVANCAR_PARA_CIVIL: 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.',
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
