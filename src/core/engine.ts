/**
 * ENOVA 2 — Core Mecânico 2 — Motor de Decisão Estrutural
 *
 * Âncora contratual (CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md):
 *   Cláusula-fonte:  L-01, A00-02, A00-06
 *   Bloco legado:    L03 — Mapa Canônico do Funil
 *   Gate-fonte:      Gate 2 (A01)
 *   PDF-fonte:       PDF 8, pp. 1–6 (Core Mecânico — missão, entrada, saída, política)
 *                    PDF 7, pp. 2–4 (fluxo de execução)
 *                    PDF 6, pp. 7–8 (fases macro)
 *
 * MISSÃO DO CORE (PDF 8, p. 1, seção 1):
 * "O Core Mecânico é a autoridade única sobre decisão operacional. Ele recebe sinais
 *  estruturados do turno, valida o que é confiável, aplica microregras do MCMV, decide
 *  o que foi coletado, o que ainda falta e qual é o próximo objetivo do fluxo."
 *
 * RESTRIÇÃO INVIOLÁVEL (PDF 8, p. 1, seção 3 "O que o Core Mecânico não pode fazer"):
 * "Não escreve a fala final ao cliente. Não produz resposta natural longa."
 * (A00 seção 4.2–4.3; CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md seção 4.3)
 */

import type { LeadState, CoreDecision, GateResult, GateId, PersistOp, SpeechIntent } from './types.ts';
import {
  STAGE_MAP,
  evaluateApplicableGates,
  evaluateGateCasadoConjunto,
} from './stage-map.ts';

// ---------------------------------------------------------------------------
// Entrada do motor de decisão
// PDF-fonte: PDF 8, p. 2 (seção 4 "Contrato de entrada")
// ---------------------------------------------------------------------------

/**
 * Entrada estruturada para o motor de decisão do Core.
 *
 * PDF-fonte literal (PDF 8, p. 2):
 * "state_snapshot: estado consolidado do lead antes do turno
 *  turn_extract: extração estruturada do texto/áudio/imagem
 *  policy_context: regras ativas, limites, travas e memorandos do programa"
 */
export interface CoreEngineInput {
  state_snapshot: LeadState;
  turn_extract: TurnExtract;
  policy_context?: PolicyContext;
}

/**
 * Extração estruturada do turno atual (vinda do Extractor — frente separada).
 * O Core recebe slots candidatos — não texto bruto.
 * PDF-fonte: PDF 8, p. 2 ("turn_extract: extração estruturada")
 */
export interface TurnExtract {
  facts_extracted: Partial<Record<keyof LeadState, unknown>>;
  facts_ambiguous: string[];         // facts que precisam de confirmação
  contradictions_detected: string[]; // facts com contradição vs estado atual
  intent_signal: string | null;      // sinal de intenção do cliente (não é fala)
}

/**
 * Contexto de política ativa.
 * PDF-fonte: PDF 8, p. 2 ("policy_context")
 */
export interface PolicyContext {
  active_rules: string[];
  overrides: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Motor de decisão estrutural
// PDF-fonte: PDF 8, seção 5 (Política de decisão), seção 6.1 (função principal)
// ---------------------------------------------------------------------------

/**
 * Executa o ciclo de decisão estrutural do Core Mecânico.
 *
 * Fluxo (PDF 7, p. 3 — seção 5 "Fluxo de execução no Worker"):
 * 1. Carregar estado atual do lead
 * 2. Aplicar facts extraídos do turno (sem sobrescrever confirmados com conflito)
 * 3. Avaliar gates aplicáveis ao stage atual
 * 4. Determinar bloqueios e pendências
 * 5. Calcular next_stage e next_objective
 * 6. Emitir speech_intent estrutural (NÃO é fala — é sinal para Speech Engine)
 * 7. Declarar persist_ops autorizadas
 *
 * INVIOLÁVEL: esta função não retorna texto ao cliente. Retorna CoreDecision.
 */
export function runCoreEngine(input: CoreEngineInput): CoreDecision {
  const { state_snapshot, turn_extract } = input;
  const stageDef = STAGE_MAP[state_snapshot.current_stage];

  if (!stageDef) {
    throw new Error(
      `Stage desconhecido: '${state_snapshot.current_stage}'. Consultar L03 — Mapa Canônico do Funil.`,
    );
  }

  // -------------------------------------------------------------------------
  // Etapa 1: Mesclar facts do turno no estado (sem sobrescrever confirmados
  // com contradições)
  // PDF-fonte: PDF 8, p. 3 (R5: contradição fatual → não aceitar)
  // PDF 8, seção 5 "Política de decisão"
  // -------------------------------------------------------------------------
  const mergedState = mergeFactsFromTurn(state_snapshot, turn_extract);

  // -------------------------------------------------------------------------
  // Etapa 2: Verificar contradições
  // PDF-fonte: PDF 8, p. 4 (hasCriticalContradiction — seção 6.2)
  // -------------------------------------------------------------------------
  const hasContradiction =
    turn_extract.contradictions_detected.length > 0;

  // -------------------------------------------------------------------------
  // Etapa 3: Avaliar todos os gates aplicáveis ao stage atual
  // PDF-fonte: PDF 8, seção 4 "Regras mínimas obrigatórias" (R1–R6)
  // -------------------------------------------------------------------------
  const gateResults = evaluateApplicableGates(mergedState, stageDef);

  // Gate de contradição (R5) — avaliado com contexto do turno
  if (hasContradiction) {
    gateResults.push({
      gate_id: 'G_CONTRADICAO_FATUAL',
      activated: true,
      severity: 'high',
      block_advance: true,
      requires_collection: null,
      reason: `Contradição detectada em: [${turn_extract.contradictions_detected.join(', ')}]. Exige confirmação. (R5 — PDF 8, p. 3)`,
      source_ref: 'PDF 8, p. 3 (R5); PDF 8, seção 6.2',
    });
  }

  // -------------------------------------------------------------------------
  // Etapa 4: Determinar bloqueios
  // -------------------------------------------------------------------------
  const activatedGates = gateResults.filter((g) => g.activated);
  const blockingGates = activatedGates.filter((g) => g.block_advance);
  const blockAdvance = blockingGates.length > 0;

  // -------------------------------------------------------------------------
  // Etapa 5: Calcular confirmed_slots, pending_slots e rejected_slots
  // PDF-fonte: PDF 8, p. 2 (saída mínima do Core)
  // -------------------------------------------------------------------------
  const { confirmed, rejected, pending } = classifySlots(
    state_snapshot,
    turn_extract,
    gateResults,
  );

  // -------------------------------------------------------------------------
  // Etapa 6: Determinar next_stage e next_objective
  // PDF-fonte: PDF 8, seção 5 "Política de decisão"
  // -------------------------------------------------------------------------
  const { stageAfter, nextObjective } = computeNextStep(
    mergedState,
    stageDef,
    blockAdvance,
    blockingGates,
  );

  // -------------------------------------------------------------------------
  // Etapa 7: Determinar required_confirmation
  // -------------------------------------------------------------------------
  const requiredConfirmation = hasContradiction || turn_extract.facts_ambiguous.length > 0;
  const confirmationTarget = requiredConfirmation
    ? (turn_extract.contradictions_detected[0] ?? turn_extract.facts_ambiguous[0] ?? null)
    : null;

  // -------------------------------------------------------------------------
  // Etapa 8: Determinar speech_intent (sinal estrutural — NÃO é fala)
  // PDF-fonte: PDF 8, p. 2 ("speech_intent" como campo de saída do Core)
  // -------------------------------------------------------------------------
  const { speechIntent, speechIntentContext } = deriveSpeechIntent(
    blockAdvance,
    blockingGates,
    requiredConfirmation,
    activatedGates,
    stageAfter,
    state_snapshot.current_stage,
    pending,
  );

  // -------------------------------------------------------------------------
  // Etapa 9: Declarar persist_ops
  // PDF-fonte: PDF 8, p. 2 ("persist_ops" como campo de saída do Core)
  // -------------------------------------------------------------------------
  const persistOps = buildPersistOps(
    mergedState,
    confirmed,
    stageAfter,
    state_snapshot.current_stage,
    blockingGates,
  );

  // -------------------------------------------------------------------------
  // Retorno: CoreDecision — estrutural, sem fala ao cliente
  // -------------------------------------------------------------------------
  return {
    stage_current: state_snapshot.current_stage,
    stage_after: stageAfter,
    next_objective: nextObjective,

    confirmed_slots: confirmed,
    rejected_slots: rejected,
    pending_slots: pending,

    required_confirmation: requiredConfirmation,
    confirmation_target: confirmationTarget,

    gates_evaluated: gateResults,
    gates_activated: activatedGates.map((g) => g.gate_id),
    block_advance: blockAdvance,

    speech_intent: speechIntent,
    speech_intent_context: speechIntentContext,

    persist_ops: persistOps,

    decision_id: generateDecisionId(),
    evaluated_at: new Date().toISOString(),
    source_refs: [
      'L03 — Mapa Canônico do Funil',
      'PDF 6, seção 4.1',
      'PDF 7, p. 3',
      'PDF 8, pp. 1–6',
    ],
  };
}

// ---------------------------------------------------------------------------
// Funções auxiliares do motor
// ---------------------------------------------------------------------------

/**
 * Mescla facts extraídos do turno no estado, respeitando a política de contradições.
 *
 * PDF-fonte literal (PDF 8, seção 5):
 * "Se houver conflito entre regras, prevalece a regra mais restritiva até confirmação."
 * "Se a informação pertence a stage futuro, ela pode ser registrada como sinal ou pré-slot,
 *  mas só vira slot oficial quando a regra permitir."
 */
function mergeFactsFromTurn(state: LeadState, turn: TurnExtract): LeadState {
  const merged = { ...state };
  const criticalKeys: Array<keyof LeadState> = [
    'estado_civil',
    'processo',
    'nacionalidade',
    'rnm_status',
    'regime_trabalho',
    'autonomo_tem_ir',
  ];

  for (const [key, value] of Object.entries(turn.facts_extracted)) {
    if (value === null || value === undefined) continue;

    const typedKey = key as keyof LeadState;
    const existingValue = state[typedKey];
    const isCritical = criticalKeys.includes(typedKey);
    const hasContradiction = turn.contradictions_detected.includes(key);

    // Não sobrescrever fact crítico confirmado com contradição
    if (isCritical && existingValue !== null && hasContradiction) {
      continue; // mantém valor confirmado; contradição é tratada pelo gate R5
    }

    // Aceitar fact novo ou atualização sem contradição
    if (existingValue === null || !hasContradiction) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

/**
 * Classifica slots em: confirmados, rejeitados, pendentes.
 * PDF-fonte: PDF 8, p. 2 (saída mínima: confirmed_slots, rejected_slots, pending_slots)
 */
function classifySlots(
  originalState: LeadState,
  turn: TurnExtract,
  gateResults: GateResult[],
): {
  confirmed: Record<string, unknown>;
  rejected: Record<string, unknown>;
  pending: string[];
} {
  const confirmed: Record<string, unknown> = {};
  const rejected: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(turn.facts_extracted)) {
    if (value === null || value === undefined) continue;

    const isContradicted = turn.contradictions_detected.includes(key);
    const isAmbiguous = turn.facts_ambiguous.includes(key);

    if (isContradicted) {
      rejected[key] = { extracted: value, existing: (originalState as Record<string, unknown>)[key] };
    } else if (!isAmbiguous) {
      confirmed[key] = value;
    }
  }

  // Slots pendentes = facts obrigatórios que gates indicaram como ausentes ou a coletar
  const pendingFromGates = gateResults
    .filter((g) => g.activated && g.requires_collection !== null)
    .map((g) => g.requires_collection as string);

  const pending = [...new Set([...turn.facts_ambiguous, ...pendingFromGates])];

  return { confirmed, rejected, pending };
}

/**
 * Calcula o próximo stage e próximo objetivo operacional.
 *
 * PDF-fonte literal (PDF 8, seção 5):
 * "Se o cliente entregar múltiplas informações no mesmo turno, o Core tenta capturar
 *  tudo o que for validável, sem perder o objetivo do stage atual."
 */
function computeNextStep(
  state: LeadState,
  stageDef: { id: string; next_stages: string[] },
  blockAdvance: boolean,
  blockingGates: GateResult[],
): { stageAfter: string; nextObjective: string } {
  if (blockAdvance) {
    // Permanece no stage atual por bloqueio
    const primaryBlock = blockingGates[0];
    const objective = primaryBlock?.requires_collection
      ? `coletar_${primaryBlock.requires_collection}`
      : `confirmar_bloqueio_${primaryBlock?.gate_id ?? 'desconhecido'}`;

    return {
      stageAfter: state.current_stage,
      nextObjective: objective,
    };
  }

  // Avança para próximo stage canônico
  const nextStage = stageDef.next_stages[0] ?? state.current_stage;
  const nextStageDef = STAGE_MAP[nextStage as keyof typeof STAGE_MAP];
  const firstRequired = nextStageDef?.required_facts[0] ?? 'completar_stage';
  const nextObjective = `coletar_${firstRequired}`;

  return {
    stageAfter: nextStage as string,
    nextObjective,
  };
}

/**
 * Deriva o speech_intent estrutural — sinal para o Speech Engine, NÃO é fala.
 *
 * PDF-fonte literal (PDF 8, p. 2):
 * "speech_intent" — campo de saída do Core, recebido pelo Speech Engine.
 * O Speech Engine é soberano para converter este intent em fala. (A00 seção 4.2)
 */
function deriveSpeechIntent(
  blockAdvance: boolean,
  blockingGates: GateResult[],
  requiredConfirmation: boolean,
  activatedGates: GateResult[],
  stageAfter: string,
  stageCurrent: string,
  pending: string[],
): { speechIntent: SpeechIntent; speechIntentContext: Record<string, unknown> } {
  if (blockAdvance) {
    const primaryBlock = blockingGates[0];

    if (primaryBlock?.gate_id === 'G_ESTRANGEIRO_RNM') {
      return {
        speechIntent: 'bloqueio',
        speechIntentContext: {
          gate: 'G_ESTRANGEIRO_RNM',
          requires: 'rnm_status',
          severity: 'critical',
        },
      };
    }

    if (primaryBlock?.gate_id === 'G_CONTRADICAO_FATUAL' || requiredConfirmation) {
      return {
        speechIntent: 'confirmacao',
        speechIntentContext: {
          gate: primaryBlock?.gate_id,
          confirmation_target: primaryBlock?.requires_collection,
        },
      };
    }

    if (primaryBlock?.requires_collection) {
      return {
        speechIntent: 'coleta_dado',
        speechIntentContext: {
          gate: primaryBlock.gate_id,
          fact_to_collect: primaryBlock.requires_collection,
        },
      };
    }

    return {
      speechIntent: 'coleta_dado',
      speechIntentContext: { pending_facts: pending },
    };
  }

  // Gate de renda baixa ativado (não bloqueante — sugestão estrutural)
  const rendaBaixaGate = activatedGates.find((g) => g.gate_id === 'G_RENDA_SOLO_BAIXA');
  if (rendaBaixaGate?.activated) {
    return {
      speechIntent: 'sugestao_composicao',
      speechIntentContext: { gate: 'G_RENDA_SOLO_BAIXA' },
    };
  }

  // Transição de stage ou handoff
  if (stageAfter === 'broker_handoff') {
    return {
      speechIntent: 'handoff',
      speechIntentContext: { target: 'broker_handoff' },
    };
  }

  if (stageAfter !== stageCurrent) {
    return {
      speechIntent: 'transicao_stage',
      speechIntentContext: { from: stageCurrent, to: stageAfter },
    };
  }

  return {
    speechIntent: 'coleta_dado',
    speechIntentContext: { pending_facts: pending },
  };
}

/**
 * Constrói a lista de persist_ops autorizadas pelo Core.
 * PDF-fonte: PDF 8, p. 2 ("persist_ops" como campo de saída)
 */
function buildPersistOps(
  state: LeadState,
  confirmed: Record<string, unknown>,
  stageAfter: string,
  stageCurrent: string,
  blockingGates: GateResult[],
): PersistOp[] {
  const ops: PersistOp[] = [];

  // Persistir facts confirmados
  for (const [key, value] of Object.entries(confirmed)) {
    ops.push({
      op: 'upsert_fact',
      target: key,
      value,
      reason: `Fact '${key}' confirmado no turno atual.`,
    });
  }

  // Forçar atualização de processo se casado_civil (gate G_CASADO_CONJUNTO — R1)
  // PDF 8, p. 3 (R1: "forçar processo = conjunto")
  const casadoGate = evaluateGateCasadoConjunto(state);
  if (casadoGate.activated) {
    ops.push({
      op: 'upsert_fact',
      target: 'processo',
      value: 'conjunto',
      reason: 'Casado civil exige processo=conjunto. Forçado pelo Core. (R1 — PDF 8, p. 3)',
    });
  }

  // Atualizar stage se houve transição
  if (stageAfter !== stageCurrent) {
    ops.push({
      op: 'set_stage',
      target: 'current_stage',
      value: stageAfter,
      reason: `Transição autorizada de '${stageCurrent}' para '${stageAfter}'.`,
    });
  }

  // Registrar bloqueios como flags
  for (const gate of blockingGates) {
    ops.push({
      op: 'flag_block',
      target: `block_${gate.gate_id}`,
      value: { gate_id: gate.gate_id, severity: gate.severity, reason: gate.reason },
      reason: `Gate bloqueante ativado: ${gate.gate_id}.`,
    });
  }

  return ops;
}

/**
 * Gera ID único para rastreabilidade da decisão.
 */
function generateDecisionId(): string {
  return `core-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
