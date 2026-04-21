import type { ConsolidatedSignal, MultiSignalTurnConsolidation } from './multi-signal.ts';

export type LivingMemoryItemKind =
  | 'open_question'
  | 'open_objection'
  | 'useful_context'
  | 'next_turn_pending'
  | 'conversation_preference'
  | 'conversation_constraint';

export type LivingMemoryForbiddenKind =
  | 'raw_transcript'
  | 'full_previous_answer'
  | 'core_structural_state'
  | 'official_slot'
  | 'database_persistence';

export type LivingMemoryCandidateKind = LivingMemoryItemKind | LivingMemoryForbiddenKind;
export type LivingMemoryTtl = 'next_turn' | 'while_relevant';

export interface LivingMemoryPolicy {
  allowed_kinds: LivingMemoryItemKind[];
  forbidden_kinds: LivingMemoryForbiddenKind[];
  max_items: number;
  max_value_length: number;
  constraints: Array<
    | 'memoria_viva_curta_e_operativa'
    | 'sem_transcript_bruto'
    | 'sem_prompt_inflado'
    | 'sem_substituir_estado_do_core'
    | 'sem_persistencia_final_da_frente_4'
  >;
}

export interface LivingMemoryCandidate {
  candidate_id: string;
  kind: LivingMemoryCandidateKind;
  key: string;
  value: unknown;
  source_signal_id?: string;
  evidence_ids?: string[];
  confidence?: number;
  reason: string;
}

export interface LivingMemoryItem {
  memory_id: string;
  kind: LivingMemoryItemKind;
  key: string;
  value: unknown;
  source_signal_id?: string;
  evidence_ids: string[];
  confidence: number;
  reason: string;
  ttl: LivingMemoryTtl;
  official_slot: false;
  writes_customer_text: false;
  decides_business_rule: false;
  advances_stage: false;
  persists_to_database: false;
}

export interface LivingMemoryRejectedItem {
  candidate_id: string;
  kind: LivingMemoryCandidateKind;
  key: string;
  reason: string;
}

export interface LivingMemorySnapshot {
  snapshot_id: string;
  lead_id: string;
  turn_id: string;
  memory_owner: 'context_extraction';
  role: 'structural_context_only';
  speech_authority: 'none';
  decision_authority: 'none';
  persistence_authority: 'none';
  current_objective: string;
  block_advance: boolean;
  gates_activated: string[];
  items: LivingMemoryItem[];
  rejected_items: LivingMemoryRejectedItem[];
  policy: LivingMemoryPolicy;
  for_core: {
    may_inform_core: true;
    may_replace_core_state: false;
    may_decide_business_rule: false;
    may_advance_stage: false;
    may_persist_official_slot: false;
    current_objective: string;
    block_advance: boolean;
  };
  for_speech: {
    may_inform_llm: true;
    may_write_customer_text: false;
    may_override_surface: false;
    memory_item_ids: string[];
  };
  for_persistence: {
    requires_supabase: false;
    may_write_database: false;
    final_persistence_owner: 'future_supabase_adapter';
  };
  constraints: Array<
    | 'memoria_viva_informa_sem_decidir'
    | 'memoria_viva_nao_escreve_fala'
    | 'memoria_viva_nao_oficializa_slot'
    | 'memoria_viva_nao_persiste_banco'
    | 'memoria_viva_nao_replaya_historico_bruto'
  >;
}

export interface BuildLivingMemorySnapshotInput {
  consolidation: MultiSignalTurnConsolidation;
  candidates?: LivingMemoryCandidate[];
  max_items?: number;
  max_value_length?: number;
}

const allowedKinds: LivingMemoryItemKind[] = [
  'open_question',
  'open_objection',
  'useful_context',
  'next_turn_pending',
  'conversation_preference',
  'conversation_constraint',
];

const forbiddenKinds: LivingMemoryForbiddenKind[] = [
  'raw_transcript',
  'full_previous_answer',
  'core_structural_state',
  'official_slot',
  'database_persistence',
];

const DEFAULT_MAX_ITEMS = 8;
const DEFAULT_MAX_VALUE_LENGTH = 180;

function policy(maxItems: number, maxValueLength: number): LivingMemoryPolicy {
  return {
    allowed_kinds: allowedKinds,
    forbidden_kinds: forbiddenKinds,
    max_items: maxItems,
    max_value_length: maxValueLength,
    constraints: [
      'memoria_viva_curta_e_operativa',
      'sem_transcript_bruto',
      'sem_prompt_inflado',
      'sem_substituir_estado_do_core',
      'sem_persistencia_final_da_frente_4',
    ],
  };
}

function isForbiddenKind(kind: LivingMemoryCandidateKind): kind is LivingMemoryForbiddenKind {
  return forbiddenKinds.includes(kind as LivingMemoryForbiddenKind);
}

function isAllowedKind(kind: LivingMemoryCandidateKind): kind is LivingMemoryItemKind {
  return allowedKinds.includes(kind as LivingMemoryItemKind);
}

function memoryKindFor(signal: ConsolidatedSignal): LivingMemoryItemKind {
  if (signal.kind === 'question') return 'open_question';
  if (signal.kind === 'objection') return 'open_objection';
  if (signal.kind === 'pending' || signal.disposition === 'requires_confirmation') return 'next_turn_pending';
  return 'useful_context';
}

function ttlFor(kind: LivingMemoryItemKind): LivingMemoryTtl {
  return kind === 'next_turn_pending' || kind === 'open_question' ? 'next_turn' : 'while_relevant';
}

function valueLength(value: unknown): number {
  if (typeof value === 'string') return value.length;
  return JSON.stringify(value)?.length ?? 0;
}

function itemFromSignal(signal: ConsolidatedSignal): LivingMemoryItem {
  const kind = memoryKindFor(signal);

  return {
    memory_id: `mem_${signal.signal_id}`,
    kind,
    key: signal.key,
    value: signal.value,
    source_signal_id: signal.signal_id,
    evidence_ids: signal.evidence_ids,
    confidence: signal.confidence,
    reason: `consolidado_da_pr37:${signal.disposition}:${signal.reason}`,
    ttl: ttlFor(kind),
    official_slot: false,
    writes_customer_text: false,
    decides_business_rule: false,
    advances_stage: false,
    persists_to_database: false,
  };
}

function itemFromCandidate(candidate: LivingMemoryCandidate): LivingMemoryItem {
  if (!isAllowedKind(candidate.kind)) {
    throw new Error(`candidate_kind_not_allowed:${candidate.kind}`);
  }

  return {
    memory_id: `mem_${candidate.candidate_id}`,
    kind: candidate.kind,
    key: candidate.key,
    value: candidate.value,
    source_signal_id: candidate.source_signal_id,
    evidence_ids: candidate.evidence_ids ?? [],
    confidence: candidate.confidence ?? 0.7,
    reason: candidate.reason,
    ttl: ttlFor(candidate.kind),
    official_slot: false,
    writes_customer_text: false,
    decides_business_rule: false,
    advances_stage: false,
    persists_to_database: false,
  };
}

function compactItems(items: LivingMemoryItem[], maxItems: number, maxValueLength: number): LivingMemoryItem[] {
  const seen = new Set<string>();
  const compacted: LivingMemoryItem[] = [];

  for (const item of items) {
    const identity = `${item.kind}:${item.key}:${item.source_signal_id ?? item.memory_id}`;
    if (seen.has(identity)) continue;
    if (valueLength(item.value) > maxValueLength) continue;

    seen.add(identity);
    compacted.push(item);
    if (compacted.length >= maxItems) break;
  }

  return compacted;
}

export function buildLivingMemorySnapshot(input: BuildLivingMemorySnapshotInput): LivingMemorySnapshot {
  const maxItems = input.max_items ?? DEFAULT_MAX_ITEMS;
  const maxValueLength = input.max_value_length ?? DEFAULT_MAX_VALUE_LENGTH;
  const rejectedItems: LivingMemoryRejectedItem[] = [];
  const candidateItems: LivingMemoryItem[] = [];

  for (const candidate of input.candidates ?? []) {
    if (isForbiddenKind(candidate.kind)) {
      rejectedItems.push({
        candidate_id: candidate.candidate_id,
        kind: candidate.kind,
        key: candidate.key,
        reason: 'tipo_proibido_para_memoria_viva',
      });
      continue;
    }

    if (!isAllowedKind(candidate.kind)) {
      rejectedItems.push({
        candidate_id: candidate.candidate_id,
        kind: candidate.kind,
        key: candidate.key,
        reason: 'tipo_desconhecido_para_memoria_viva',
      });
      continue;
    }

    if (valueLength(candidate.value) > maxValueLength) {
      rejectedItems.push({
        candidate_id: candidate.candidate_id,
        kind: candidate.kind,
        key: candidate.key,
        reason: 'valor_longo_demais_para_memoria_viva_curta',
      });
      continue;
    }

    candidateItems.push(itemFromCandidate(candidate));
  }

  const signalItems = input.consolidation.all_signals.map(itemFromSignal);
  const items = compactItems([...signalItems, ...candidateItems], maxItems, maxValueLength);

  return {
    snapshot_id: `living_memory_${input.consolidation.turn_id}`,
    lead_id: input.consolidation.lead_id,
    turn_id: input.consolidation.turn_id,
    memory_owner: 'context_extraction',
    role: 'structural_context_only',
    speech_authority: 'none',
    decision_authority: 'none',
    persistence_authority: 'none',
    current_objective: input.consolidation.current_objective,
    block_advance: input.consolidation.block_advance,
    gates_activated: input.consolidation.gates_activated,
    items,
    rejected_items: rejectedItems,
    policy: policy(maxItems, maxValueLength),
    for_core: {
      may_inform_core: true,
      may_replace_core_state: false,
      may_decide_business_rule: false,
      may_advance_stage: false,
      may_persist_official_slot: false,
      current_objective: input.consolidation.current_objective,
      block_advance: input.consolidation.block_advance,
    },
    for_speech: {
      may_inform_llm: true,
      may_write_customer_text: false,
      may_override_surface: false,
      memory_item_ids: items.map((item) => item.memory_id),
    },
    for_persistence: {
      requires_supabase: false,
      may_write_database: false,
      final_persistence_owner: 'future_supabase_adapter',
    },
    constraints: [
      'memoria_viva_informa_sem_decidir',
      'memoria_viva_nao_escreve_fala',
      'memoria_viva_nao_oficializa_slot',
      'memoria_viva_nao_persiste_banco',
      'memoria_viva_nao_replaya_historico_bruto',
    ],
  };
}

export function assertLivingMemoryConformance(snapshot: LivingMemorySnapshot): string[] {
  const violations: string[] = [];

  if (snapshot.role !== 'structural_context_only') violations.push('living_memory_must_be_structural_context_only');
  if (snapshot.speech_authority !== 'none') violations.push('living_memory_must_not_have_speech_authority');
  if (snapshot.decision_authority !== 'none') violations.push('living_memory_must_not_have_decision_authority');
  if (snapshot.persistence_authority !== 'none') violations.push('living_memory_must_not_have_persistence_authority');

  if (snapshot.items.length > snapshot.policy.max_items) violations.push('living_memory_must_remain_compact');
  if (snapshot.for_core.may_replace_core_state) violations.push('living_memory_must_not_replace_core_state');
  if (snapshot.for_core.may_decide_business_rule) violations.push('living_memory_must_not_decide_business_rule');
  if (snapshot.for_core.may_advance_stage) violations.push('living_memory_must_not_advance_stage');
  if (snapshot.for_core.may_persist_official_slot) violations.push('living_memory_must_not_persist_official_slot');
  if (snapshot.for_speech.may_write_customer_text) violations.push('living_memory_must_not_write_customer_text');
  if (snapshot.for_speech.may_override_surface) violations.push('living_memory_must_not_override_surface');
  if (snapshot.for_persistence.requires_supabase) violations.push('living_memory_must_not_require_supabase');
  if (snapshot.for_persistence.may_write_database) violations.push('living_memory_must_not_write_database');

  for (const item of snapshot.items) {
    if (!isAllowedKind(item.kind)) violations.push(`memory_${item.memory_id}_kind_not_allowed`);
    if (item.official_slot) violations.push(`memory_${item.memory_id}_must_not_be_official_slot`);
    if (item.writes_customer_text) violations.push(`memory_${item.memory_id}_must_not_write_customer_text`);
    if (item.decides_business_rule) violations.push(`memory_${item.memory_id}_must_not_decide_business_rule`);
    if (item.advances_stage) violations.push(`memory_${item.memory_id}_must_not_advance_stage`);
    if (item.persists_to_database) violations.push(`memory_${item.memory_id}_must_not_persist_to_database`);
    if (valueLength(item.value) > snapshot.policy.max_value_length) {
      violations.push(`memory_${item.memory_id}_must_not_be_prompt_bloat`);
    }
  }

  for (const rejected of snapshot.rejected_items) {
    if (!isForbiddenKind(rejected.kind) && !isAllowedKind(rejected.kind)) {
      violations.push(`memory_rejection_${rejected.candidate_id}_kind_unknown`);
    }
  }

  return violations;
}
