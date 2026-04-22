import { consultNormativeBase } from './normative.ts';
import { readCommercialRulesForContext } from './commercial.ts';
import { listActiveManualDirectives, type ManualDirectiveDraft, validateManualDirectiveDraft } from './manual.ts';
import {
  appendAtendimentoMemory,
  isTechnicalCrmLeadKnown,
  readLeadMemoriesByLead,
  recordLeadMemory,
  registerTechnicalCrmLeadRef,
} from './store.ts';
import {
  E1_CONTRACT_KEY,
  E1_EVENT_VERSION,
  type E1ChannelHookInput,
  type E1CoreHookInput,
  type E1RuntimeEvidenceEvent,
  type E1TechnicalContext,
} from './types.ts';

const E1_EVIDENCE_BUFFER_LIMIT = 500;
const e1EvidenceBuffer: E1RuntimeEvidenceEvent[] = [];

function emitE1Evidence(
  event: Omit<E1RuntimeEvidenceEvent, 'event_version' | 'contract_front' | 'timestamp'>,
): E1RuntimeEvidenceEvent {
  const entry: E1RuntimeEvidenceEvent = {
    ...event,
    event_version: E1_EVENT_VERSION,
    contract_front: E1_CONTRACT_KEY,
    timestamp: new Date().toISOString(),
  };

  e1EvidenceBuffer.push(entry);
  if (e1EvidenceBuffer.length > E1_EVIDENCE_BUFFER_LIMIT) {
    e1EvidenceBuffer.shift();
  }

  return entry;
}

function countMemoryState(leadId: string): E1TechnicalContext['memory_counts'] {
  const memories = readLeadMemoriesByLead(leadId, true);
  const active = memories.filter((item) => item.status === 'ativa').length;
  const blocked = memories.filter((item) => item.status === 'bloqueada').length;

  return {
    total: memories.length,
    active,
    blocked,
  };
}

export function clearE1EvidenceBuffer(): void {
  e1EvidenceBuffer.length = 0;
}

export function readE1EvidenceBuffer(): E1RuntimeEvidenceEvent[] {
  return e1EvidenceBuffer.map((item) => ({ ...item }));
}

export function buildE1TechnicalContext(leadId: string): E1TechnicalContext {
  if (!isTechnicalCrmLeadKnown(leadId)) {
    registerTechnicalCrmLeadRef(leadId);
  }

  const normativeResult = consultNormativeBase();
  const commercialRules = readCommercialRulesForContext();
  const directives = listActiveManualDirectives();
  const memoryCounts = countMemoryState(leadId);

  const context: E1TechnicalContext = {
    mode: 'technical_local_only',
    lead_id: leadId,
    crm_lead_known: isTechnicalCrmLeadKnown(leadId),
    normative_refs: normativeResult.item ? [
      {
        id: normativeResult.item.id,
        source_name: normativeResult.item.source_name,
        citation_ref: normativeResult.item.citation_ref,
        status: normativeResult.item.status,
      },
    ] : [],
    commercial_rules: commercialRules.map((item) => ({
      id: item.id,
      priority: item.priority,
      rule_type: item.rule_type,
      guidance: item.guidance,
    })),
    manual_directives: directives.map((item) => ({
      id: item.id,
      priority: item.priority,
      directive_type: item.directive_type,
    })),
    memory_counts: memoryCounts,
    integration: {
      crm_write_enabled: false,
      external_dispatch_enabled: false,
      core_sovereignty_preserved: true,
      cognitive_context_available: true,
      speech_surface_override_enabled: false,
    },
  };

  return context;
}

export function applyE1CoreHook(input: E1CoreHookInput): {
  lead_memory_status: string;
  atendimento_id: string;
  context: E1TechnicalContext;
} {
  registerTechnicalCrmLeadRef(input.lead_id);

  const hasStructuredFacts = Object.keys(input.facts).length > 0;
  const leadMemory = recordLeadMemory({
    lead_id: input.lead_id,
    tipo: 'nota_operacional',
    conteudo: `core_stage:${input.current_stage}`,
    evidencia_tipo: hasStructuredFacts ? 'real_atendimento' : 'inferencia',
    origem: hasStructuredFacts ? 'atendimento_log' : 'extracao_llm',
    created_by: 'e1_core_hook',
    atendimento_id: `core:${input.request_id}`,
    confianca: hasStructuredFacts ? 'evidencia_limitada' : 'hipotese',
    notas: 'Registro tecnico local da PR3 do E1.',
  });

  const atendimento = appendAtendimentoMemory({
    atendimento_id: `core:${input.request_id}`,
    lead_id: input.lead_id,
    abordagens_usadas: ['core_runtime_hook'],
    objecoes_encontradas: [],
    sinais_emitidos: [],
    decisoes_tomadas: [`stage:${input.current_stage}`],
    evidencia_tipo: 'real_atendimento',
    created_by: 'e1_core_hook',
    canal: 'worker_core',
    fase_funil: input.current_stage,
  });

  const context = buildE1TechnicalContext(input.lead_id);

  emitE1Evidence({
    event_name: 'e1.runtime.hook.core_registered',
    layer: 'integration',
    trace_id: input.trace_id,
    correlation_id: input.correlation_id,
    request_id: input.request_id,
    lead_id: input.lead_id,
    severity: 'info',
    outcome: 'accepted',
    details: {
      stage: input.current_stage,
      atendimento_id: atendimento.atendimento_id,
    },
  });

  emitE1Evidence({
    event_name: 'e1.runtime.memory.lead_recorded',
    layer: 'memory',
    trace_id: input.trace_id,
    correlation_id: input.correlation_id,
    request_id: input.request_id,
    lead_id: input.lead_id,
    severity: leadMemory.status === 'bloqueada' ? 'warn' : 'info',
    outcome: leadMemory.status === 'bloqueada' ? 'blocked' : 'accepted',
    details: {
      memory_id: leadMemory.id,
      status: leadMemory.status,
      evidence_type: leadMemory.evidencia_tipo,
    },
  });

  emitE1Evidence({
    event_name: 'e1.runtime.memory.atendimento_appended',
    layer: 'memory',
    trace_id: input.trace_id,
    correlation_id: input.correlation_id,
    request_id: input.request_id,
    lead_id: input.lead_id,
    severity: 'info',
    outcome: 'completed',
    details: {
      atendimento_id: atendimento.atendimento_id,
      append_only: true,
    },
  });

  emitE1Evidence({
    event_name: 'e1.runtime.integration.cognitive_context_built',
    layer: 'integration',
    trace_id: input.trace_id,
    correlation_id: input.correlation_id,
    request_id: input.request_id,
    lead_id: input.lead_id,
    severity: 'info',
    outcome: 'observed',
    details: {
      mode: context.mode,
      normative_count: context.normative_refs.length,
      commercial_count: context.commercial_rules.length,
      manual_count: context.manual_directives.length,
      memory_counts: context.memory_counts,
      crm_write_enabled: context.integration.crm_write_enabled,
      external_dispatch_enabled: context.integration.external_dispatch_enabled,
    },
  });

  return {
    lead_memory_status: leadMemory.status,
    atendimento_id: atendimento.atendimento_id,
    context,
  };
}

export function applyE1ChannelHook(input: E1ChannelHookInput): {
  atendimento_id: string;
  context: E1TechnicalContext;
} {
  registerTechnicalCrmLeadRef(input.lead_ref);

  const leadMemory = recordLeadMemory({
    lead_id: input.lead_ref,
    tipo: 'historico_objecao',
    conteudo: `evento_canal:${input.event_type}`,
    evidencia_tipo: 'real_atendimento',
    origem: 'atendimento_log',
    created_by: 'e1_channel_hook',
    atendimento_id: input.event_id,
    confianca: 'evidencia_limitada',
  });

  const atendimento = appendAtendimentoMemory({
    atendimento_id: input.event_id,
    lead_id: input.lead_ref,
    abordagens_usadas: ['channel_ingest_hook'],
    objecoes_encontradas: [],
    sinais_emitidos: [input.event_type],
    decisoes_tomadas: ['canal_inbound_recebido'],
    evidencia_tipo: 'real_atendimento',
    created_by: 'e1_channel_hook',
    canal: 'meta_whatsapp_stub',
  });

  const context = buildE1TechnicalContext(input.lead_ref);

  emitE1Evidence({
    event_name: 'e1.runtime.hook.channel_registered',
    layer: 'integration',
    trace_id: input.trace_id,
    correlation_id: input.correlation_id,
    request_id: input.request_id,
    lead_id: input.lead_ref,
    severity: 'info',
    outcome: 'accepted',
    details: {
      event_id: input.event_id,
      event_type: input.event_type,
    },
  });

  emitE1Evidence({
    event_name: 'e1.runtime.memory.channel_lead_recorded',
    layer: 'memory',
    trace_id: input.trace_id,
    correlation_id: input.correlation_id,
    request_id: input.request_id,
    lead_id: input.lead_ref,
    severity: leadMemory.status === 'bloqueada' ? 'warn' : 'info',
    outcome: leadMemory.status === 'bloqueada' ? 'blocked' : 'accepted',
    details: {
      memory_id: leadMemory.id,
      atendimento_id: atendimento.atendimento_id,
    },
  });

  return {
    atendimento_id: atendimento.atendimento_id,
    context,
  };
}

export function validateManualDirectiveForRuntime(
  draft: ManualDirectiveDraft,
  context: { trace_id: string; correlation_id: string; request_id?: string; lead_id?: string },
) {
  const validation = validateManualDirectiveDraft(draft);

  emitE1Evidence({
    event_name: 'e1.runtime.manual.directive_validated',
    layer: 'manual',
    trace_id: context.trace_id,
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    lead_id: context.lead_id,
    severity: validation.ok ? 'info' : 'warn',
    outcome: validation.ok ? 'accepted' : 'blocked',
    symptom_code: validation.ok ? undefined : validation.error_code,
    details: validation.ok ? {
      validation: 'ok',
    } : {
      validation: 'rejected',
      field: validation.field,
      error_code: validation.error_code,
    },
  });

  return validation;
}

export function emitE1SmokeEvidence(traceId: string, evidenceRef: string, details: Record<string, unknown>): void {
  emitE1Evidence({
    event_name: 'e1.runtime.smoke.evidence_recorded',
    layer: 'smoke',
    trace_id: traceId,
    correlation_id: traceId,
    severity: 'info',
    outcome: 'completed',
    evidence_ref: evidenceRef,
    details,
  });
}

