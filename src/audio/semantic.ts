import {
  buildMultiSignalTurnConsolidation,
  type BuildMultiSignalTurnConsolidationInput,
  type SignalDispositionOverride,
} from '../context/multi-signal.ts';
import {
  buildSemanticTurnPacket,
  type ExtractedSignal,
  type ExtractedTurnSignals,
  type SemanticTurnPacket,
  type TurnEvidence,
} from '../context/schema.ts';
import type { AudioInputEntry, SemanticEvidenceStatus, SemanticPackage, SemanticSegment } from './types.ts';

export interface SharedExtractorInput {
  semantic_package: SemanticPackage;
  lead_id: string;
  current_objective: string;
  block_advance: boolean;
  gates_activated?: string[];
}

export interface SharedExtractorOutput {
  packet: SemanticTurnPacket;
  consolidation: ReturnType<typeof buildMultiSignalTurnConsolidation>;
}

function nowIso(): string {
  return new Date().toISOString();
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(3));
}

function signalId(kind: ExtractedSignal['kind'], key: string): string {
  return `${kind}_${key}`.toLowerCase();
}

function makeSignal(
  kind: ExtractedSignal['kind'],
  key: string,
  value: unknown,
  confidence: number,
  evidenceIds: string[],
): ExtractedSignal {
  return {
    signal_id: signalId(kind, key),
    kind,
    key,
    value,
    confidence: clampConfidence(confidence),
    evidence_ids: evidenceIds,
    status: 'candidate',
  };
}

function detectIncome(text: string): number | null {
  const textHasRenda = /\brenda\b/i.test(text);
  if (!textHasRenda) return null;

  const directNumber = text.match(/(\d{3,5})/);
  if (directNumber) return Number(directNumber[1]);

  if (/tres mil|três mil/i.test(text)) return 3000;
  if (/quatro mil/i.test(text)) return 4000;
  if (/dois mil/i.test(text)) return 2000;
  return null;
}

function intentForSegment(segmentText: string): string {
  const lower = segmentText.toLowerCase();
  if (lower.includes('?') || /\b(como|quando|onde|qual)\b/i.test(segmentText)) return 'question';
  if (/\b(medo|receio|inseguro|duvida)\b/i.test(segmentText)) return 'objection_or_doubt';
  if (/\b(quero|preciso)\b/i.test(segmentText) && /\b(comprar|financiar)\b/i.test(segmentText)) return 'customer_goal';
  if (/\brenda\b/i.test(segmentText)) return 'income_information';
  if (/\b(solteir|casad|divorciad|viuv)\w*/i.test(segmentText)) return 'civil_status_information';
  return 'context_information';
}

function segmentConfirmationStatus(status: SemanticEvidenceStatus): SemanticSegment['confirmation_status'] {
  if (status === 'requires_confirmation') return 'pending';
  if (status === 'rejected') return 'rejected';
  return 'not_required';
}

function splitSegments(text: string): string[] {
  return text
    .split(/[;,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildSemanticSegments(
  text: string,
  confidence: number,
  evidenceStatus: SemanticEvidenceStatus,
): SemanticSegment[] {
  if (!text || evidenceStatus === 'rejected') return [];

  const segments = splitSegments(text);
  return segments.map((segment, index) => ({
    segment_id: `segment_${index + 1}`,
    intent: intentForSegment(segment),
    raw_text: segment,
    confidence_inherited: clampConfidence(confidence),
    confirmation_status: segmentConfirmationStatus(evidenceStatus),
  }));
}

function textConfidence(base: number, boost = 0): number {
  return clampConfidence(Math.max(0.45, base + boost));
}

function extractTurnSignalsFromText(
  text: string,
  confidence: number,
  evidenceStatus: SemanticEvidenceStatus,
  evidenceRef: string,
): ExtractedTurnSignals {
  const evidenceIds = [evidenceRef];
  const facts: ExtractedSignal[] = [];
  const intents: ExtractedSignal[] = [];
  const questions: ExtractedSignal[] = [];
  const objections: ExtractedSignal[] = [];
  const slotCandidates: ExtractedSignal[] = [];
  const pending: ExtractedSignal[] = [];
  const ambiguities: ExtractedSignal[] = [];

  const lower = text.toLowerCase();

  if (evidenceStatus === 'rejected') {
    pending.push(makeSignal(
      'pending',
      'audio_rejected_requires_reask',
      'transcricao_rejeitada_aguardando_reenvio',
      textConfidence(confidence, -0.2),
      evidenceIds,
    ));
  } else {
    if (/\b(quero|preciso)\b/i.test(text) && /\b(comprar|financiar)\b/i.test(text)) {
      intents.push(makeSignal('intent', 'customer_goal', 'comprar_imovel', textConfidence(confidence), evidenceIds));
      slotCandidates.push(makeSignal('slot_candidate', 'customer_goal', 'comprar_imovel', textConfidence(confidence), evidenceIds));
    }

    const civilStatusMatch = text.match(/\b(solteir[oa]|casad[oa]|divorciad[oa]|viuv[oa])\b/i);
    if (civilStatusMatch) {
      const civilStatus = civilStatusMatch[1].toLowerCase();
      facts.push(makeSignal('fact', 'civil_status', civilStatus, textConfidence(confidence, -0.02), evidenceIds));
      slotCandidates.push(makeSignal('slot_candidate', 'civil_status', civilStatus, textConfidence(confidence, -0.02), evidenceIds));
    }

    const incomeValue = detectIncome(text);
    if (incomeValue !== null) {
      slotCandidates.push(makeSignal('slot_candidate', 'monthly_income_hint', incomeValue, textConfidence(confidence, -0.05), evidenceIds));
    }

    if (lower.includes('?') || /\b(como|quando|onde|qual|pode)\b/i.test(text)) {
      questions.push(makeSignal('question', 'customer_question', 'duvida_cliente', textConfidence(confidence, -0.03), evidenceIds));
    }

    if (/\b(medo|receio|inseguro|duvida)\b/i.test(text)) {
      objections.push(makeSignal('objection', 'customer_objection_or_fear', 'objeção_ou_receio', textConfidence(confidence, -0.04), evidenceIds));
    }

    if (/\b(acho|talvez|mais ou menos)\b/i.test(text)) {
      ambiguities.push(makeSignal('ambiguity', 'needs_confirmation', 'informacao_imprecisa', textConfidence(confidence, -0.1), evidenceIds));
    }

    if (
      facts.length === 0
      && intents.length === 0
      && questions.length === 0
      && objections.length === 0
      && slotCandidates.length === 0
      && ambiguities.length === 0
    ) {
      pending.push(makeSignal('pending', 'context_capture', 'sem_sinal_forte_no_turno', textConfidence(confidence, -0.1), evidenceIds));
    }
  }

  const evidence: TurnEvidence[] = [
    {
      evidence_id: evidenceRef,
      kind: 'text_excerpt',
      source: 'customer_turn',
      value: text,
      confidence: clampConfidence(confidence),
    },
    {
      evidence_id: `${evidenceRef}_meta`,
      kind: 'source_metadata',
      source: 'customer_turn',
      value: JSON.stringify({
        origin: 'audio_stub',
        evidence_status: evidenceStatus,
      }),
      confidence: clampConfidence(confidence),
    },
  ];

  return {
    facts,
    intents,
    questions,
    objections,
    slot_candidates: slotCandidates,
    pending,
    ambiguities,
    evidence,
    confidence: {
      overall: clampConfidence(confidence),
      rationale: `audio_stub_${evidenceStatus}`,
    },
  };
}

function allSignalIds(packet: SemanticTurnPacket): string[] {
  return [
    ...packet.signals.facts,
    ...packet.signals.intents,
    ...packet.signals.questions,
    ...packet.signals.objections,
    ...packet.signals.slot_candidates,
    ...packet.signals.pending,
    ...packet.signals.ambiguities,
  ].map((signal) => signal.signal_id);
}

function confirmationOverrides(packet: SemanticTurnPacket): SignalDispositionOverride[] {
  return allSignalIds(packet).map((signalId) => ({
    signal_id: signalId,
    disposition: 'requires_confirmation',
    handling: 'inform_core_and_llm',
    reason: 'audio_low_confidence_requires_confirmation',
  }));
}

function rejectedOverrides(packet: SemanticTurnPacket): SignalDispositionOverride[] {
  return allSignalIds(packet).map((signalId) => ({
    signal_id: signalId,
    disposition: 'pending',
    handling: 'inform_core_and_llm',
    reason: 'audio_rejected_requires_new_turn',
  }));
}

export function buildSemanticPackageFromAudioEntry(entry: AudioInputEntry): SemanticPackage {
  const text = entry.normalized_text ?? entry.transcript_text.trim();
  const evidenceStatus = entry.evidence_status === 'pending' ? 'requires_confirmation' : entry.evidence_status;
  const semanticEvidenceStatus: SemanticEvidenceStatus = evidenceStatus === 'usable'
    ? 'usable'
    : evidenceStatus === 'rejected'
      ? 'rejected'
      : 'requires_confirmation';

  return {
    package_id: `semantic_${entry.entry_id}`,
    session_id: entry.session_id,
    turn_id: entry.turn_id,
    produced_at: nowIso(),
    text,
    origin: 'audio',
    confidence: clampConfidence(entry.transcript_confidence),
    evidence_status: semanticEvidenceStatus,
    segments: buildSemanticSegments(text, entry.transcript_confidence, semanticEvidenceStatus),
    entry_ref: entry.entry_id,
    confirmation_required: semanticEvidenceStatus === 'requires_confirmation',
    raw_source_ref: entry.source_ref,
  };
}

export function runSharedExtractorFromSemanticPackage(input: SharedExtractorInput): SharedExtractorOutput {
  const evidenceRef = input.semantic_package.entry_ref ?? `evidence_${input.semantic_package.turn_id}`;
  const packet = buildSemanticTurnPacket({
    packet_id: input.semantic_package.package_id,
    lead_id: input.lead_id,
    turn_id: input.semantic_package.turn_id,
    source: {
      channel: 'text',
      modality: 'text',
      raw_text: input.semantic_package.text,
    },
    signals: extractTurnSignalsFromText(
      input.semantic_package.text,
      input.semantic_package.confidence,
      input.semantic_package.evidence_status,
      evidenceRef,
    ),
  });

  const baseInput: BuildMultiSignalTurnConsolidationInput = {
    packet,
    context: {
      current_objective: input.current_objective,
      block_advance: input.block_advance,
      gates_activated: input.gates_activated,
    },
  };

  if (input.semantic_package.evidence_status === 'requires_confirmation') {
    baseInput.disposition_overrides = confirmationOverrides(packet);
  }
  if (input.semantic_package.evidence_status === 'rejected') {
    baseInput.disposition_overrides = rejectedOverrides(packet);
  }

  const consolidation = buildMultiSignalTurnConsolidation(baseInput);
  return { packet, consolidation };
}
