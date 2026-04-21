import type { ExtractedSignal, SemanticTurnPacket } from './schema.ts';

export type ConsolidatedSignalDisposition = 'accepted' | 'pending' | 'requires_confirmation';
export type ConsolidatedSignalHandling =
  | 'inform_core_and_llm'
  | 'inform_core'
  | 'inform_llm'
  | 'defer_until_core_policy';

export interface MultiSignalTurnContext {
  stage_current?: string;
  stage_after?: string;
  current_objective: string;
  block_advance: boolean;
  gates_activated?: string[];
}

export interface SignalDispositionOverride {
  signal_id: string;
  disposition: ConsolidatedSignalDisposition;
  reason: string;
  handling?: ConsolidatedSignalHandling;
}

export interface ConsolidatedSignal {
  signal_id: string;
  kind: ExtractedSignal['kind'];
  key: string;
  value: unknown;
  evidence_ids: string[];
  confidence: number;
  disposition: ConsolidatedSignalDisposition;
  handling: ConsolidatedSignalHandling;
  reason: string;
  official_slot: false;
}

export interface MultiSignalTurnConsolidation {
  packet_id: string;
  lead_id: string;
  turn_id: string;
  consolidation_owner: 'context_extraction';
  role: 'structural_input_only';
  speech_authority: 'none';
  decision_authority: 'none';
  source_packet_role: SemanticTurnPacket['role'];
  current_objective: string;
  block_advance: boolean;
  gates_activated: string[];
  accepted: ConsolidatedSignal[];
  pending: ConsolidatedSignal[];
  requires_confirmation: ConsolidatedSignal[];
  all_signals: ConsolidatedSignal[];
  core_input: {
    may_inform_core: true;
    may_decide_business_rule: false;
    may_advance_stage: false;
    may_persist_official_slot: false;
    current_objective: string;
    block_advance: boolean;
    accepted_signal_ids: string[];
    pending_signal_ids: string[];
    confirmation_signal_ids: string[];
  };
  speech_input: {
    may_inform_llm: true;
    may_write_customer_text: false;
    may_override_surface: false;
    context_signal_ids: string[];
    question_signal_ids: string[];
    objection_signal_ids: string[];
    ambiguity_signal_ids: string[];
  };
  constraints: Array<
    | 'multi_signal_nao_colapsa_em_string'
    | 'contexto_preserva_objetivo_atual'
    | 'contexto_preserva_bloqueios'
    | 'core_oficializa_slots_e_regras'
    | 'llm_autora_surface_final'
  >;
}

export interface BuildMultiSignalTurnConsolidationInput {
  packet: SemanticTurnPacket;
  context: MultiSignalTurnContext;
  disposition_overrides?: SignalDispositionOverride[];
  acceptance_threshold?: number;
  confirmation_threshold?: number;
}

const signalBuckets: Array<keyof Pick<
  SemanticTurnPacket['signals'],
  'facts' | 'intents' | 'questions' | 'objections' | 'slot_candidates' | 'pending' | 'ambiguities'
>> = [
  'facts',
  'intents',
  'questions',
  'objections',
  'slot_candidates',
  'pending',
  'ambiguities',
];

function flattenSignals(packet: SemanticTurnPacket): ExtractedSignal[] {
  return signalBuckets.flatMap((bucket) => packet.signals[bucket]);
}

function defaultDisposition(
  signal: ExtractedSignal,
  acceptanceThreshold: number,
  confirmationThreshold: number,
): Pick<ConsolidatedSignal, 'disposition' | 'handling' | 'reason'> {
  if (signal.kind === 'ambiguity' || signal.confidence < confirmationThreshold) {
    return {
      disposition: 'requires_confirmation',
      handling: 'inform_core_and_llm',
      reason: 'ambiguidade_ou_confianca_baixa_exige_confirmacao',
    };
  }

  if (signal.kind === 'question' || signal.kind === 'objection' || signal.kind === 'pending') {
    return {
      disposition: 'pending',
      handling: signal.kind === 'pending' ? 'inform_core_and_llm' : 'inform_llm',
      reason: 'sinal_util_pendente_sem_oficializacao_de_slot',
    };
  }

  if (signal.confidence >= acceptanceThreshold) {
    return {
      disposition: 'accepted',
      handling: 'inform_core_and_llm',
      reason: 'sinal_estrutural_suficiente_para_informar_sem_oficializar',
    };
  }

  return {
    disposition: 'requires_confirmation',
    handling: 'inform_core_and_llm',
    reason: 'confianca_intermediaria_exige_confirmacao',
  };
}

function overrideFor(signal: ExtractedSignal, overrides: SignalDispositionOverride[]): SignalDispositionOverride | undefined {
  return overrides.find((override) => override.signal_id === signal.signal_id);
}

function consolidateSignal(
  signal: ExtractedSignal,
  overrides: SignalDispositionOverride[],
  acceptanceThreshold: number,
  confirmationThreshold: number,
): ConsolidatedSignal {
  const override = overrideFor(signal, overrides);
  const derived = override ?? defaultDisposition(signal, acceptanceThreshold, confirmationThreshold);

  return {
    signal_id: signal.signal_id,
    kind: signal.kind,
    key: signal.key,
    value: signal.value,
    evidence_ids: signal.evidence_ids,
    confidence: signal.confidence,
    disposition: derived.disposition,
    handling: derived.handling ?? 'inform_core_and_llm',
    reason: derived.reason,
    official_slot: false,
  };
}

export function buildMultiSignalTurnConsolidation(input: BuildMultiSignalTurnConsolidationInput): MultiSignalTurnConsolidation {
  const acceptanceThreshold = input.acceptance_threshold ?? 0.8;
  const confirmationThreshold = input.confirmation_threshold ?? 0.65;
  const allSignals = flattenSignals(input.packet).map((signal) => consolidateSignal(
    signal,
    input.disposition_overrides ?? [],
    acceptanceThreshold,
    confirmationThreshold,
  ));
  const accepted = allSignals.filter((signal) => signal.disposition === 'accepted');
  const pending = allSignals.filter((signal) => signal.disposition === 'pending');
  const requiresConfirmation = allSignals.filter((signal) => signal.disposition === 'requires_confirmation');

  return {
    packet_id: input.packet.packet_id,
    lead_id: input.packet.lead_id,
    turn_id: input.packet.turn_id,
    consolidation_owner: 'context_extraction',
    role: 'structural_input_only',
    speech_authority: 'none',
    decision_authority: 'none',
    source_packet_role: input.packet.role,
    current_objective: input.context.current_objective,
    block_advance: input.context.block_advance,
    gates_activated: input.context.gates_activated ?? [],
    accepted,
    pending,
    requires_confirmation: requiresConfirmation,
    all_signals: allSignals,
    core_input: {
      may_inform_core: true,
      may_decide_business_rule: false,
      may_advance_stage: false,
      may_persist_official_slot: false,
      current_objective: input.context.current_objective,
      block_advance: input.context.block_advance,
      accepted_signal_ids: accepted.map((signal) => signal.signal_id),
      pending_signal_ids: pending.map((signal) => signal.signal_id),
      confirmation_signal_ids: requiresConfirmation.map((signal) => signal.signal_id),
    },
    speech_input: {
      may_inform_llm: true,
      may_write_customer_text: false,
      may_override_surface: false,
      context_signal_ids: allSignals.map((signal) => signal.signal_id),
      question_signal_ids: allSignals.filter((signal) => signal.kind === 'question').map((signal) => signal.signal_id),
      objection_signal_ids: allSignals.filter((signal) => signal.kind === 'objection').map((signal) => signal.signal_id),
      ambiguity_signal_ids: allSignals.filter((signal) => signal.kind === 'ambiguity').map((signal) => signal.signal_id),
    },
    constraints: [
      'multi_signal_nao_colapsa_em_string',
      'contexto_preserva_objetivo_atual',
      'contexto_preserva_bloqueios',
      'core_oficializa_slots_e_regras',
      'llm_autora_surface_final',
    ],
  };
}

export function assertMultiSignalTurnConformance(consolidation: MultiSignalTurnConsolidation): string[] {
  const violations: string[] = [];

  if (consolidation.role !== 'structural_input_only') violations.push('multi_signal_must_be_structural_input_only');
  if (consolidation.speech_authority !== 'none') violations.push('multi_signal_must_not_have_speech_authority');
  if (consolidation.decision_authority !== 'none') violations.push('multi_signal_must_not_have_decision_authority');
  if (consolidation.all_signals.length < 2) violations.push('multi_signal_turn_requires_more_than_one_signal');

  if (consolidation.core_input.current_objective !== consolidation.current_objective) {
    violations.push('multi_signal_must_preserve_current_objective');
  }
  if (consolidation.core_input.block_advance !== consolidation.block_advance) {
    violations.push('multi_signal_must_preserve_structural_block');
  }
  if (consolidation.core_input.may_decide_business_rule) violations.push('multi_signal_must_not_decide_business_rule');
  if (consolidation.core_input.may_advance_stage) violations.push('multi_signal_must_not_advance_stage');
  if (consolidation.core_input.may_persist_official_slot) violations.push('multi_signal_must_not_persist_official_slot');
  if (consolidation.speech_input.may_write_customer_text) violations.push('multi_signal_must_not_write_customer_text');
  if (consolidation.speech_input.may_override_surface) violations.push('multi_signal_must_not_override_surface');

  const bucketTotal = (
    consolidation.accepted.length
    + consolidation.pending.length
    + consolidation.requires_confirmation.length
  );
  if (bucketTotal !== consolidation.all_signals.length) violations.push('multi_signal_buckets_must_cover_all_signals');

  for (const signal of consolidation.all_signals) {
    if (signal.official_slot) violations.push(`signal_${signal.signal_id}_must_not_be_official_slot`);
  }

  return violations;
}
