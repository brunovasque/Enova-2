import type { MultiSignalTurnConsolidation } from '../context/multi-signal.ts';
import type { SemanticTurnPacket } from '../context/schema.ts';

export type AudioSourceType = 'whatsapp_voice' | 'api_upload' | 'test_stub';
export type TranscriptStatus = 'success' | 'low_confidence' | 'failed' | 'stub';
export type EvidenceStatus = 'pending' | 'usable' | 'requires_confirmation' | 'rejected';

export interface AudioInputEntry {
  entry_id: string;
  session_id: string;
  turn_id: string;
  received_at: string;
  source_type: AudioSourceType;
  source_ref: string;
  duration_ms: number;
  transcript_text: string;
  transcript_confidence: number;
  transcript_status: TranscriptStatus;
  evidence_status: EvidenceStatus;
  language?: string;
  codec?: string;
  mime_type?: string;
  transcript_engine?: string;
  transcribed_at?: string;
  raw_audio_ref?: string;
  normalization_applied?: string[];
  normalized_text?: string;
  evidence_ref?: string;
  evidence_payload?: Record<string, unknown>;
  owner?: string;
}

export type SemanticOrigin = 'text' | 'audio';
export type SemanticEvidenceStatus = 'usable' | 'requires_confirmation' | 'rejected';
export type SegmentConfirmationStatus = 'not_required' | 'pending' | 'confirmed' | 'rejected';

export interface SemanticSegment {
  segment_id: string;
  intent: string;
  raw_text: string;
  confidence_inherited: number;
  confirmation_status: SegmentConfirmationStatus;
}

export interface SemanticPackage {
  package_id: string;
  session_id: string;
  turn_id: string;
  produced_at: string;
  text: string;
  origin: SemanticOrigin;
  confidence: number;
  evidence_status: SemanticEvidenceStatus;
  segments: SemanticSegment[];
  entry_ref?: string;
  confirmation_required?: boolean;
  raw_source_ref?: string;
}

export interface PipelineStubMatrix {
  stt_runtime: 'stub';
  tts_runtime: 'stub';
  external_channel: 'none';
  rollout_mode: 'none';
  telemetry_depth: 'minimal';
}

export interface PipelineBoundaryReport {
  speech_authority_owner: 'llm';
  pipeline_writes_customer_text: false;
  pipeline_decides_business_rule: false;
  pipeline_advances_stage: false;
  extractor_is_shared: true;
  core_is_shared: true;
  adapter_is_shared: true;
}

export interface PipelineAdapterSnapshot {
  lead_id: string;
  turn_id: string;
  persisted_signals: number;
}

export interface MultimodalPipelineResult {
  audio_entry: AudioInputEntry;
  semantic_package: SemanticPackage;
  extracted_packet: SemanticTurnPacket;
  consolidation: MultiSignalTurnConsolidation;
  adapter_snapshot: PipelineAdapterSnapshot;
  speech_bridge: MultiSignalTurnConsolidation['speech_input'];
  stub_matrix: PipelineStubMatrix;
  boundaries: PipelineBoundaryReport;
}
