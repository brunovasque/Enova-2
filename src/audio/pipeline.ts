import {
  createInMemoryAdapterRuntime,
  type SupabaseAdapterRuntime,
} from '../adapter/runtime.ts';
import type { AdapterSignalWriteInput, ISupabaseAdapter, SignalStatus } from '../adapter/types.ts';
import {
  buildSemanticPackageFromAudioEntry,
  runSharedExtractorFromSemanticPackage,
} from './semantic.ts';
import { buildAudioInputEntryStub } from './stub.ts';
import type { MultimodalPipelineResult } from './types.ts';

export interface RunMultimodalPipelineInput {
  session_id: string;
  turn_id: string;
  lead_external_ref: string;
  transcript_text: string;
  transcript_confidence?: number;
  source_ref?: string;
  current_objective: string;
  block_advance: boolean;
  gates_activated?: string[];
  turn_sequence: number;
}

export interface RunMultimodalPipelineDependencies {
  adapter?: ISupabaseAdapter;
  now?: () => string;
}

interface PipelinePersistenceContext {
  adapter: ISupabaseAdapter;
  lead_id: string;
  turn_id: string;
}

function nowIso(now?: () => string): string {
  return now?.() ?? new Date().toISOString();
}

function toSignalValueJson(value: unknown, reason: string): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return {
      ...value as Record<string, unknown>,
      reason,
      source_pipeline: 'audio_stub_pr48',
    };
  }

  return {
    value,
    reason,
    source_pipeline: 'audio_stub_pr48',
  };
}

function mapDispositionToStatus(disposition: 'accepted' | 'pending' | 'requires_confirmation'): SignalStatus {
  if (disposition === 'accepted') return 'slot_candidate';
  if (disposition === 'requires_confirmation') return 'requires_confirmation';
  return 'pending';
}

function buildAdapterSignalWrites(
  leadId: string,
  turnId: string,
  evidenceRef: string | undefined,
  consolidation: MultimodalPipelineResult['consolidation'],
  skipWrites: boolean,
): AdapterSignalWriteInput[] {
  if (skipWrites) return [];

  return consolidation.all_signals.map((signal) => ({
    turn_id: turnId,
    lead_id: leadId,
    signal_type: signal.kind,
    signal_key: `${signal.kind}:${signal.key}`,
    signal_value_json: toSignalValueJson(signal.value, signal.reason),
    confidence_score: signal.confidence,
    status: mapDispositionToStatus(signal.disposition),
    evidence_ref: evidenceRef ?? null,
  }));
}

async function persistTurnAndSignals(
  input: RunMultimodalPipelineInput,
  result: Omit<MultimodalPipelineResult, 'adapter_snapshot' | 'stub_matrix' | 'boundaries'>,
  deps: RunMultimodalPipelineDependencies,
): Promise<PipelinePersistenceContext & { persistedSignals: number }> {
  const adapter = deps.adapter ?? createInMemoryAdapterRuntime().adapter;
  const upsertLead = await adapter.upsertLead({
    external_ref: input.lead_external_ref,
    status: 'active',
  });
  if (!upsertLead.success || !upsertLead.record) {
    throw new Error(`adapter_upsert_lead_failed:${upsertLead.error ?? 'unknown'}`);
  }

  const leadId = upsertLead.record.lead_id;
  const turnWrite = await adapter.writeTurnEvent({
    lead_id: leadId,
    idempotency_key: `${input.lead_external_ref}:${input.turn_id}:audio_stub`,
    channel_type: 'audio',
    raw_input_ref: result.audio_entry.raw_audio_ref ?? result.audio_entry.source_ref,
    normalized_input_json: {
      source_type: result.audio_entry.source_type,
      normalized_text: result.audio_entry.normalized_text,
      transcript_confidence: result.audio_entry.transcript_confidence,
      evidence_status: result.audio_entry.evidence_status,
    },
    semantic_package_json: {
      package_id: result.semantic_package.package_id,
      origin: result.semantic_package.origin,
      confidence: result.semantic_package.confidence,
      evidence_status: result.semantic_package.evidence_status,
      segment_count: result.semantic_package.segments.length,
      extractor_packet_id: result.extracted_packet.packet_id,
    },
    core_decision_json: {
      source: 'core_shared_boundary_only',
      decision_owner: 'core_only',
      decision_not_executed_in_pr48: true,
      current_objective: input.current_objective,
      block_advance: input.block_advance,
      gates_activated: input.gates_activated ?? [],
    },
    speech_contract_json: {
      source: 'speech_shared_boundary_only',
      owner: 'llm',
      may_write_customer_text: false,
      speech_context_signal_ids: result.speech_bridge.context_signal_ids,
    },
    turn_sequence: input.turn_sequence,
  });
  if (!turnWrite.success || !turnWrite.record) {
    throw new Error(`adapter_write_turn_failed:${turnWrite.error ?? 'unknown'}`);
  }

  const signalWrites = buildAdapterSignalWrites(
    leadId,
    turnWrite.record.turn_id,
    result.audio_entry.evidence_ref,
    result.consolidation,
    result.semantic_package.evidence_status === 'rejected',
  );

  if (signalWrites.length > 0) {
    const writeSignals = await adapter.writeSignals(signalWrites);
    if (writeSignals.error) {
      throw new Error(`adapter_write_signals_failed:${writeSignals.error}`);
    }
  }

  await adapter.appendHistoryEvent({
    lead_id: leadId,
    turn_id: turnWrite.record.turn_id,
    event_type: 'turn_processed',
    actor_layer: 'worker',
    event_payload_json: {
      flow: 'audio_stub_to_semantic_to_extractor_to_adapter',
      evidence_status: result.semantic_package.evidence_status,
      persisted_signals: signalWrites.length,
      speech_bridge_signal_ids: result.speech_bridge.context_signal_ids,
    },
    occurred_at: nowIso(deps.now),
  });

  return {
    adapter,
    lead_id: leadId,
    turn_id: turnWrite.record.turn_id,
    persistedSignals: signalWrites.length,
  };
}

export async function runMultimodalPipelineBase(
  input: RunMultimodalPipelineInput,
  deps: RunMultimodalPipelineDependencies = {},
): Promise<MultimodalPipelineResult> {
  const audio_entry = buildAudioInputEntryStub({
    session_id: input.session_id,
    turn_id: input.turn_id,
    source_ref: input.source_ref,
    transcript_text: input.transcript_text,
    transcript_confidence: input.transcript_confidence,
    received_at: nowIso(deps.now),
  });

  const semantic_package = buildSemanticPackageFromAudioEntry(audio_entry);
  const extracted = runSharedExtractorFromSemanticPackage({
    semantic_package,
    lead_id: input.lead_external_ref,
    current_objective: input.current_objective,
    block_advance: input.block_advance,
    gates_activated: input.gates_activated,
  });

  const partialResult = {
    audio_entry,
    semantic_package,
    extracted_packet: extracted.packet,
    consolidation: extracted.consolidation,
    speech_bridge: extracted.consolidation.speech_input,
  };

  const persisted = await persistTurnAndSignals(input, partialResult, deps);

  return {
    ...partialResult,
    adapter_snapshot: {
      lead_id: persisted.lead_id,
      turn_id: persisted.turn_id,
      persisted_signals: persisted.persistedSignals,
    },
    stub_matrix: {
      stt_runtime: 'stub',
      tts_runtime: 'stub',
      external_channel: 'none',
      rollout_mode: 'none',
      telemetry_depth: 'minimal',
    },
    boundaries: {
      speech_authority_owner: 'llm',
      pipeline_writes_customer_text: false,
      pipeline_decides_business_rule: false,
      pipeline_advances_stage: false,
      extractor_is_shared: true,
      core_is_shared: true,
      adapter_is_shared: true,
    },
  };
}

export function createMultimodalPipelineWithInMemoryAdapter(): {
  adapter: SupabaseAdapterRuntime;
  run: (input: RunMultimodalPipelineInput) => Promise<MultimodalPipelineResult>;
} {
  const runtime = createInMemoryAdapterRuntime();
  return {
    adapter: runtime.adapter,
    run: (input) => runMultimodalPipelineBase(input, { adapter: runtime.adapter }),
  };
}
