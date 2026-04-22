import type {
  DiretivaManual,
  EvidenciaTipo,
  ItemNormativo,
  MemoriaPorAtendimento,
  MemoriaPorLead,
  MemoriaStatus,
  RegraComercial,
} from './types.ts';

const STRONG_EVIDENCE_TYPES: ReadonlySet<EvidenciaTipo> = new Set([
  'real_crm',
  'real_atendimento',
  'operador_validado',
  'diretiva_manual',
]);

const BASE_NORMATIVE_ITEMS: ItemNormativo[] = [
  {
    id: 'norma-e1-001',
    source_type: 'cef_normativo',
    source_name: 'Normativo CEF 2024-03',
    title: 'Elegibilidade MCMV por comprovação de renda',
    excerpt: 'A comprovação de renda deve manter consistência documental para análise.',
    effective_date: '2024-03-01',
    scope: 'MCMV - elegibilidade inicial',
    confidence: 'alta',
    citation_ref: 'CEF-2024-03 §4.2.1',
    status: 'ativo',
    tags: ['mcmv', 'renda', 'elegibilidade'],
    created_at: '2026-04-22T00:00:00Z',
    created_by: 'e1-runtime-seed',
  },
];

const BASE_COMMERCIAL_RULES: RegraComercial[] = [
  {
    id: 'regra-e1-001',
    origin: 'playbook_comercial',
    scope: 'leads em discovery com objetivo de compra',
    priority: 'media',
    rule_type: 'abordagem_inicial',
    activation_context: 'lead pede valor antes de qualificação mínima',
    guidance: 'Conduzir com diagnóstico curto antes de detalhar simulação.',
    restrictions: [
      'nao_prometer_aprovacao',
      'nao_pular_coleta_critica',
      'nao_contradizer_norma',
    ],
    conflict_policy: 'norma_prevalece',
    status: 'ativa',
    created_at: '2026-04-22T00:00:00Z',
    created_by: 'e1-runtime-seed',
    updated_at: '2026-04-22T00:00:00Z',
    updated_by: 'e1-runtime-seed',
    version: 1,
    tags: ['discovery', 'abordagem'],
  },
];

const BASE_MANUAL_DIRECTIVES: DiretivaManual[] = [
  {
    id: 'diretiva-e1-001',
    author: 'operador_e1_seed',
    created_at: '2026-04-22T00:00:00Z',
    scope: 'global',
    priority: 'media',
    directive_type: 'cuidado_operacional',
    content: 'Quando houver conflito entre memória e norma, exigir revisão humana antes de aplicar sugestão.',
    rationale: 'Preservar separação entre norma e heurística operacional.',
    status: 'ativa',
    audit_ref: 'E1-SEED-001',
    version: 1,
    normativo_conflict_check: true,
  },
];

const technicalCrmLeadRefs = new Set<string>();
const leadMemories: MemoriaPorLead[] = [];
const atendimentoMemories: MemoriaPorAtendimento[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneList<T>(items: T[]): T[] {
  return items.map((item) => ({ ...item }));
}

export function resetE1TechnicalStore(): void {
  technicalCrmLeadRefs.clear();
  leadMemories.length = 0;
  atendimentoMemories.length = 0;
}

export function registerTechnicalCrmLeadRef(leadId: string): void {
  technicalCrmLeadRefs.add(leadId);
}

export function isTechnicalCrmLeadKnown(leadId: string): boolean {
  return technicalCrmLeadRefs.has(leadId);
}

export function readNormativeItems(): ItemNormativo[] {
  return cloneList(BASE_NORMATIVE_ITEMS);
}

export function readCommercialRules(): RegraComercial[] {
  return cloneList(BASE_COMMERCIAL_RULES);
}

export function readManualDirectives(): DiretivaManual[] {
  return cloneList(BASE_MANUAL_DIRECTIVES);
}

export function readLeadMemoriesByLead(leadId: string, includeBlocked = true): MemoriaPorLead[] {
  return leadMemories
    .filter((item) => item.lead_id === leadId && (includeBlocked || item.status !== 'bloqueada'))
    .map((item) => ({ ...item }));
}

export function readAtendimentoMemoriesByLead(leadId: string): MemoriaPorAtendimento[] {
  return atendimentoMemories
    .filter((item) => item.lead_id === leadId)
    .map((item) => ({ ...item }));
}

export function appendAtendimentoMemory(
  input: Omit<MemoriaPorAtendimento, 'id' | 'created_at' | 'status'> & {
    id?: string;
    created_at?: string;
    status?: MemoriaStatus;
  },
): MemoriaPorAtendimento {
  const entry: MemoriaPorAtendimento = {
    ...input,
    id: input.id ?? createId('atdmem'),
    created_at: input.created_at ?? nowIso(),
    status: input.status ?? 'ativa',
  };

  atendimentoMemories.push(entry);
  return { ...entry };
}

export function recordLeadMemory(
  input: Omit<MemoriaPorLead, 'id' | 'created_at' | 'status'> & {
    id?: string;
    created_at?: string;
    status?: MemoriaStatus;
  },
): MemoriaPorLead {
  const hasStrongEvidence = STRONG_EVIDENCE_TYPES.has(input.evidencia_tipo);
  const entry: MemoriaPorLead = {
    ...input,
    id: input.id ?? createId('leadmem'),
    created_at: input.created_at ?? nowIso(),
    status: hasStrongEvidence ? (input.status ?? 'ativa') : 'bloqueada',
  };

  leadMemories.push(entry);
  return { ...entry };
}

export function getE1StoreSnapshot(): {
  normative_count: number;
  commercial_count: number;
  manual_count: number;
  known_technical_crm_leads: number;
  lead_memory_count: number;
  atendimento_memory_count: number;
  first_normative: ItemNormativo | null;
  first_commercial: RegraComercial | null;
  first_manual: DiretivaManual | null;
} {
  return {
    normative_count: BASE_NORMATIVE_ITEMS.length,
    commercial_count: BASE_COMMERCIAL_RULES.length,
    manual_count: BASE_MANUAL_DIRECTIVES.length,
    known_technical_crm_leads: technicalCrmLeadRefs.size,
    lead_memory_count: leadMemories.length,
    atendimento_memory_count: atendimentoMemories.length,
    first_normative: BASE_NORMATIVE_ITEMS[0] ? { ...BASE_NORMATIVE_ITEMS[0] } : null,
    first_commercial: BASE_COMMERCIAL_RULES[0] ? { ...BASE_COMMERCIAL_RULES[0] } : null,
    first_manual: BASE_MANUAL_DIRECTIVES[0] ? { ...BASE_MANUAL_DIRECTIVES[0] } : null,
  };
}

