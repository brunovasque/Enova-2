export type ContextLayerRole = 'structural_input_only';
export type ContextSpeechAuthority = 'none';
export type ContextDecisionAuthority = 'none';

export type TurnSignalKind =
  | 'fact'
  | 'intent'
  | 'question'
  | 'objection'
  | 'slot_candidate'
  | 'pending'
  | 'ambiguity';

export type TurnEvidenceKind = 'text_excerpt' | 'normalized_signal' | 'source_metadata';
export type TurnSourceChannel = 'text';
export type TurnSourceModality = 'text';

export interface TurnEvidence {
  evidence_id: string;
  kind: TurnEvidenceKind;
  source: 'customer_turn';
  value: string;
  confidence: number;
}

export interface ExtractedSignal {
  signal_id: string;
  kind: TurnSignalKind;
  key: string;
  value: unknown;
  evidence_ids: string[];
  confidence: number;
  status: 'candidate';
}

export interface ExtractedTurnSignals {
  facts: ExtractedSignal[];
  intents: ExtractedSignal[];
  questions: ExtractedSignal[];
  objections: ExtractedSignal[];
  slot_candidates: ExtractedSignal[];
  pending: ExtractedSignal[];
  ambiguities: ExtractedSignal[];
  evidence: TurnEvidence[];
  confidence: {
    overall: number;
    rationale: string;
  };
}

export interface SemanticTurnPacket {
  packet_id: string;
  lead_id: string;
  turn_id: string;
  source: {
    channel: TurnSourceChannel;
    modality: TurnSourceModality;
    raw_text?: string;
  };
  semantic_package_owner: 'context_extraction';
  role: ContextLayerRole;
  speech_authority: ContextSpeechAuthority;
  decision_authority: ContextDecisionAuthority;
  signals: ExtractedTurnSignals;
  for_core: {
    may_inform_core: true;
    may_decide_business_rule: false;
    may_advance_stage: false;
    may_persist_official_slot: false;
  };
  for_speech: {
    may_inform_llm: true;
    may_write_customer_text: false;
    may_override_surface: false;
  };
  constraints: Array<
    | 'extractor_nao_oficializa_slot'
    | 'core_oficializa_regras_e_avanco'
    | 'speech_ou_llm_autora_fala_final'
    | 'sem_decisao_de_negocio_no_contexto'
  >;
}

export interface BuildSemanticTurnPacketInput {
  packet_id: string;
  lead_id: string;
  turn_id: string;
  source: SemanticTurnPacket['source'];
  signals?: Partial<ExtractedTurnSignals>;
}

const emptySignals = (): ExtractedTurnSignals => ({
  facts: [],
  intents: [],
  questions: [],
  objections: [],
  slot_candidates: [],
  pending: [],
  ambiguities: [],
  evidence: [],
  confidence: {
    overall: 0,
    rationale: 'sem_sinais_extraidos',
  },
});

export function buildSemanticTurnPacket(input: BuildSemanticTurnPacketInput): SemanticTurnPacket {
  const baseSignals = emptySignals();
  const signals = input.signals ?? {};

  return {
    packet_id: input.packet_id,
    lead_id: input.lead_id,
    turn_id: input.turn_id,
    source: input.source,
    semantic_package_owner: 'context_extraction',
    role: 'structural_input_only',
    speech_authority: 'none',
    decision_authority: 'none',
    signals: {
      facts: signals.facts ?? baseSignals.facts,
      intents: signals.intents ?? baseSignals.intents,
      questions: signals.questions ?? baseSignals.questions,
      objections: signals.objections ?? baseSignals.objections,
      slot_candidates: signals.slot_candidates ?? baseSignals.slot_candidates,
      pending: signals.pending ?? baseSignals.pending,
      ambiguities: signals.ambiguities ?? baseSignals.ambiguities,
      evidence: signals.evidence ?? baseSignals.evidence,
      confidence: signals.confidence ?? baseSignals.confidence,
    },
    for_core: {
      may_inform_core: true,
      may_decide_business_rule: false,
      may_advance_stage: false,
      may_persist_official_slot: false,
    },
    for_speech: {
      may_inform_llm: true,
      may_write_customer_text: false,
      may_override_surface: false,
    },
    constraints: [
      'extractor_nao_oficializa_slot',
      'core_oficializa_regras_e_avanco',
      'speech_ou_llm_autora_fala_final',
      'sem_decisao_de_negocio_no_contexto',
    ],
  };
}

const signalCategories: Array<keyof Pick<
  ExtractedTurnSignals,
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

function isConfidenceValid(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function assertSemanticTurnPacketConformance(packet: SemanticTurnPacket): string[] {
  const violations: string[] = [];

  if (packet.role !== 'structural_input_only') violations.push('context_must_be_structural_input_only');
  if (packet.speech_authority !== 'none') violations.push('context_must_not_have_speech_authority');
  if (packet.decision_authority !== 'none') violations.push('context_must_not_have_decision_authority');

  if (packet.for_core.may_decide_business_rule) violations.push('context_must_not_decide_business_rule');
  if (packet.for_core.may_advance_stage) violations.push('context_must_not_advance_stage');
  if (packet.for_core.may_persist_official_slot) violations.push('context_must_not_persist_official_slot');

  if (packet.for_speech.may_write_customer_text) violations.push('context_must_not_write_customer_text');
  if (packet.for_speech.may_override_surface) violations.push('context_must_not_override_surface');

  for (const category of signalCategories) {
    const categorySignals = packet.signals[category];
    if (!Array.isArray(categorySignals)) {
      violations.push(`missing_signal_category_${category}`);
      continue;
    }

    for (const signal of categorySignals) {
      if (signal.status !== 'candidate') violations.push(`signal_${signal.signal_id}_must_remain_candidate`);
      if (!isConfidenceValid(signal.confidence)) violations.push(`signal_${signal.signal_id}_confidence_invalid`);
    }
  }

  if (!Array.isArray(packet.signals.evidence)) violations.push('missing_signal_category_evidence');
  for (const evidence of packet.signals.evidence ?? []) {
    if (!isConfidenceValid(evidence.confidence)) violations.push(`evidence_${evidence.evidence_id}_confidence_invalid`);
  }

  if (!isConfidenceValid(packet.signals.confidence.overall)) violations.push('overall_confidence_invalid');

  return violations;
}
