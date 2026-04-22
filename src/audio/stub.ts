import type { AudioInputEntry, EvidenceStatus, TranscriptStatus } from './types.ts';

export interface BuildStubAudioInput {
  entry_id?: string;
  session_id: string;
  turn_id: string;
  source_ref?: string;
  transcript_text: string;
  transcript_confidence?: number;
  received_at?: string;
  language?: string;
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

function normalizeTranscriptText(text: string): { normalized: string; applied: string[] } {
  let normalized = text;
  const applied: string[] = [];

  const trimmed = normalized.trim();
  if (trimmed !== normalized) {
    normalized = trimmed;
    applied.push('N1');
  }

  const withoutMarkers = normalized
    .replace(/\[(inaudivel|inaudível|ruido|ruído)\]/gi, '')
    .replace(/\.\.\.+/g, '')
    .trim();
  if (withoutMarkers !== normalized) {
    normalized = withoutMarkers;
    applied.push('N2');
  }

  const compacted = normalized.replace(/\s+/g, ' ');
  if (compacted !== normalized) {
    normalized = compacted;
    applied.push('N3');
  }

  if (normalized.length === 0) {
    applied.push('N4');
  }

  return { normalized, applied };
}

function estimateDurationMs(normalizedText: string): number {
  const words = normalizedText.split(' ').filter(Boolean).length;
  return Math.max(1000, words * 220);
}

function transcriptStatusFor(normalizedText: string, confidence: number): TranscriptStatus {
  if (!normalizedText) return 'failed';
  if (confidence < 0.85) return 'low_confidence';
  return 'stub';
}

function evidenceStatusFor(normalizedText: string, confidence: number): EvidenceStatus {
  if (!normalizedText) return 'rejected';
  if (confidence < 0.5) return 'rejected';
  if (confidence < 0.85) return 'requires_confirmation';
  return 'usable';
}

export function buildAudioInputEntryStub(input: BuildStubAudioInput): AudioInputEntry {
  const confidence = clampConfidence(input.transcript_confidence ?? 0.92);
  const normalized = normalizeTranscriptText(input.transcript_text);
  const transcript_status = transcriptStatusFor(normalized.normalized, confidence);
  const evidence_status = evidenceStatusFor(normalized.normalized, confidence);
  const received_at = input.received_at ?? nowIso();

  return {
    entry_id: input.entry_id ?? `audio_entry_${input.turn_id}`,
    session_id: input.session_id,
    turn_id: input.turn_id,
    received_at,
    source_type: 'test_stub',
    source_ref: input.source_ref ?? `audio_stub://${input.session_id}/${input.turn_id}`,
    duration_ms: estimateDurationMs(normalized.normalized),
    transcript_text: input.transcript_text,
    transcript_confidence: confidence,
    transcript_status,
    evidence_status,
    language: input.language ?? 'pt-BR',
    codec: 'stub',
    mime_type: 'audio/stub',
    transcript_engine: 'stub_pipeline_pr48',
    transcribed_at: received_at,
    raw_audio_ref: `raw_audio_stub://${input.session_id}/${input.turn_id}`,
    normalization_applied: normalized.applied,
    normalized_text: normalized.normalized,
    evidence_ref: `audio_evidence_${input.turn_id}`,
    evidence_payload: {
      source_type: 'test_stub',
      transcript_confidence: confidence,
      transcript_status,
      evidence_status,
    },
    owner: 'media_pipeline_stub',
  };
}
