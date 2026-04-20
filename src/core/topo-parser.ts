/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator do Topo do Funil (L05)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-03 (CLAUSE_MAP — "Define critérios de extração de sinais do topo.
 *                    Interface Core ↔ Extractor.")
 * Bloco legado:      L05 — Topo do Funil — Parser
 * Página-fonte:      PDF 6, pp. 3–4 (taxonomia de facts F0: customer_goal, channel_origin;
 *                    F7: current_intent; F9: offtrack_type)
 *                    E6.1 — PDF 4, p. 8: "Topo natural sem perder captação do primeiro sinal útil."
 * Gate-fonte:        Gate 2 (A01)
 * Evidência exigida: smoke cenário 4 passando (parser reconhece customer_goal)
 *
 * RESTRIÇÃO INVIOLÁVEL: este parser NÃO gera fala ao cliente.
 * Ele apenas valida e normaliza sinais estruturais extraídos pelo LLM.
 * O LLM é soberano da fala — este módulo é soberano da validação estrutural.
 *
 * ESCOPO: interface Core ↔ Extractor para o stage de discovery/topo apenas.
 * Facts de Meio A e Meio B ficam para L07+ e L11+.
 */

import type { CustomerGoal, CurrentIntent, OfftrackType } from './topo-rules.ts';
import { TOPO_REQUIRED_FACTS, TOPO_OPTIONAL_FACTS, TOPO_OFFTRACK_FACT_KEY } from './topo-rules.ts';

// ---------------------------------------------------------------------------
// Tipos de entrada e saída do extrator do topo
// ---------------------------------------------------------------------------

/**
 * Input do extrator do topo.
 *
 * Representa os facts que o LLM extraiu do turno e os facts já coletados do lead.
 * O extrator valida e normaliza esses sinais antes de entregá-los ao Core.
 *
 * Fonte: PDF 6, p. 7 (contrato de saída do LLM):
 * "facts_extracted: facts capturados neste turno"
 * "facts_updated: facts confirmados/alterados"
 */
export interface TopoTurnExtract {
  /** Facts já persistidos do lead (estado atual). */
  facts_current: Record<string, unknown>;
  /** Facts recém-extraídos pelo LLM neste turno (não validados). */
  facts_extracted: Record<string, unknown>;
}

/**
 * Sinais estruturais do topo — saída do extrator.
 *
 * Este é o contrato de saída do L05 para o Core.
 * Todos os campos são estruturais — nenhum é fala ao cliente.
 *
 * Fonte: F0 (customer_goal, channel_origin), F7 (current_intent), F9 (offtrack_type)
 * — PDF 6, pp. 3–4.
 */
export interface TopoSignals {
  /** F0: customer_goal está presente e é válido? */
  customer_goal_detected: boolean;
  /** F0: valor normalizado de customer_goal, ou null se ausente. */
  customer_goal_value: CustomerGoal | null;

  /** F7: current_intent está presente e é válido? */
  current_intent_detected: boolean;
  /** F7: valor normalizado de current_intent, ou null se ausente. */
  current_intent_value: CurrentIntent | null;

  /** F9: sinal de desvio detectado? */
  offtrack_detected: boolean;
  /** F9: tipo de desvio, ou null se on-track. */
  offtrack_type_value: OfftrackType | null;

  /**
   * Status da extração do topo.
   * - 'ready': customer_goal presente e válido — topo pode avançar para critérios L06.
   * - 'partial': algum sinal detectado mas customer_goal ainda ausente ou inválido.
   * - 'empty': nenhum sinal do topo detectado.
   */
  parse_status: 'ready' | 'partial' | 'empty';

  /**
   * Registra quais keys foram verificadas nesta extração.
   * Para rastreabilidade da interface Core ↔ Extractor.
   */
  keys_checked: string[];
}

// ---------------------------------------------------------------------------
// Valores canônicos para validação (derivados do L04 topo-rules)
// ---------------------------------------------------------------------------

const VALID_CUSTOMER_GOALS = new Set<string>([
  'comprar_imovel',
  'entender_programa',
  'enviar_docs',
  'visitar_imovel',
  'outro',
]);

const VALID_CURRENT_INTENTS = new Set<string>([
  'entender_programa',
  'seguir_analise',
  'enviar_docs',
  'visita',
]);

const VALID_OFFTRACK_TYPES = new Set<string>([
  'curiosidade',
  'objecao',
  'desabafo',
  'pergunta_lateral',
]);

// ---------------------------------------------------------------------------
// Extrator principal do topo (L05)
// ---------------------------------------------------------------------------

/**
 * Extrai e valida os sinais estruturais do topo a partir dos facts do lead.
 *
 * Esta função representa a Interface Core ↔ Extractor para o stage de discovery.
 * Ela NÃO interpreta texto livre — recebe facts já extraídos pelo LLM e os normaliza.
 *
 * Fonte: F0 (customer_goal, channel_origin) — PDF 6, p. 3.
 *        F7 (current_intent) — PDF 6, p. 4.
 *        F9 (offtrack_type) — PDF 6, p. 4.
 * E6.1: "Captação do primeiro sinal útil" — PDF 4, p. 8.
 */
export function extractTopoSignals(input: TopoTurnExtract): TopoSignals {
  // Merge: extracted facts override current facts for this evaluation
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const keysChecked = [
    ...TOPO_REQUIRED_FACTS,
    ...TOPO_OPTIONAL_FACTS,
    TOPO_OFFTRACK_FACT_KEY,
  ];

  // --- F0: customer_goal ---
  const rawCustomerGoal = merged['customer_goal'];
  const customerGoalValue = normalizeCustomerGoal(rawCustomerGoal);
  const customerGoalDetected = customerGoalValue !== null;

  // --- F7: current_intent ---
  const rawCurrentIntent = merged['current_intent'];
  const currentIntentValue = normalizeCurrentIntent(rawCurrentIntent);
  const currentIntentDetected = currentIntentValue !== null;

  // --- F9: offtrack_type ---
  const rawOfftrackType = merged[TOPO_OFFTRACK_FACT_KEY];
  const offtrackTypeValue = normalizeOfftrackType(rawOfftrackType);
  const offtrackDetected = offtrackTypeValue !== null;

  // --- parse_status ---
  const parseStatus = computeParseStatus(customerGoalDetected, currentIntentDetected);

  return {
    customer_goal_detected: customerGoalDetected,
    customer_goal_value: customerGoalValue,
    current_intent_detected: currentIntentDetected,
    current_intent_value: currentIntentValue,
    offtrack_detected: offtrackDetected,
    offtrack_type_value: offtrackTypeValue,
    parse_status: parseStatus,
    keys_checked: keysChecked,
  };
}

// ---------------------------------------------------------------------------
// Normalizadores internos — validação canônica dos valores
// ---------------------------------------------------------------------------

/**
 * Normaliza o valor bruto de customer_goal para o tipo canônico.
 * Retorna null se ausente ou inválido.
 * Fonte: F0 — PDF 6, p. 3.
 */
function normalizeCustomerGoal(raw: unknown): CustomerGoal | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_CUSTOMER_GOALS.has(value)) return value as CustomerGoal;
  return null;
}

/**
 * Normaliza o valor bruto de current_intent para o tipo canônico.
 * Retorna null se ausente ou inválido.
 * Fonte: F7 — PDF 6, p. 4.
 */
function normalizeCurrentIntent(raw: unknown): CurrentIntent | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_CURRENT_INTENTS.has(value)) return value as CurrentIntent;
  return null;
}

/**
 * Normaliza o valor bruto de offtrack_type para o tipo canônico.
 * Retorna null se ausente ou inválido.
 * Fonte: F9 — PDF 6, p. 4.
 */
function normalizeOfftrackType(raw: unknown): OfftrackType | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_OFFTRACK_TYPES.has(value)) return value as OfftrackType;
  return null;
}

/**
 * Determina o parse_status a partir dos sinais detectados.
 * - 'ready': customer_goal presente (critério mínimo do topo — L04).
 * - 'partial': algum sinal detectado mas customer_goal ausente.
 * - 'empty': nenhum sinal detectado.
 */
function computeParseStatus(
  customerGoalDetected: boolean,
  currentIntentDetected: boolean,
): TopoSignals['parse_status'] {
  if (customerGoalDetected) return 'ready';
  if (currentIntentDetected) return 'partial';
  return 'empty';
}
