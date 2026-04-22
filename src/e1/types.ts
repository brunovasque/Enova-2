export const E1_EVENT_VERSION = 'e1.v1' as const;
export const E1_CONTRACT_KEY = 'extra_e1_memoria_base_normativa_regras_comerciais_aprendizado_operacional' as const;

export type ItemNormativoSourceType =
  | 'cef_normativo'
  | 'mcmv_regulamento'
  | 'politica_credito'
  | 'documento_produto'
  | 'playbook_operacional'
  | 'regra_elegibilidade'
  | 'manual_atendimento'
  | 'outro_oficial';

export type ItemNormativoConfidence = 'alta' | 'media' | 'baixa' | 'expirada';
export type ItemNormativoStatus = 'ativo' | 'desatualizado' | 'suspenso' | 'arquivado';

export interface ItemNormativo {
  id: string;
  source_type: ItemNormativoSourceType;
  source_name: string;
  title: string;
  excerpt: string;
  effective_date: string;
  scope: string;
  confidence: ItemNormativoConfidence;
  citation_ref: string;
  status: ItemNormativoStatus;
  tags?: string[];
  expiry_date?: string;
  superseded_by?: string;
  conflict_ids?: string[];
  notes?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
}

export type RegraComercialOrigin = 'playbook_comercial' | 'diretoria_operacional' | 'treinamento' | 'analise_outcomes';
export type RegraComercialPriority = 'alta' | 'media' | 'baixa';
export type RegraComercialType =
  | 'abordagem_inicial'
  | 'tratamento_objecao'
  | 'conducao_visita'
  | 'coleta_documental'
  | 'fechamento'
  | 'pos_venda'
  | 'outro';
export type RegraComercialConflictPolicy = 'norma_prevalece' | 'suspender_regra' | 'escalar_operador';
export type RegraComercialStatus = 'ativa' | 'suspensa' | 'arquivada';

export interface RegraComercial {
  id: string;
  origin: RegraComercialOrigin;
  scope: string;
  priority: RegraComercialPriority;
  rule_type: RegraComercialType;
  activation_context: string;
  guidance: string;
  restrictions: string[];
  conflict_policy: RegraComercialConflictPolicy;
  status: RegraComercialStatus;
  updated_at: string;
  version?: number;
  previous_version_id?: string;
  supersedes?: string;
  tags?: string[];
  examples?: string[];
  normativo_conflict_ids?: string[];
  notes?: string;
  created_at: string;
  created_by: string;
  updated_by?: string;
}

export type MemoriaStatus = 'ativa' | 'expirada' | 'bloqueada' | 'arquivada';
export type MemoriaConfianca = 'alta_evidencia' | 'evidencia_limitada' | 'inferencia' | 'hipotese';
export type EvidenciaTipo = 'real_crm' | 'real_atendimento' | 'inferencia' | 'operador_validado' | 'diretiva_manual';
export type MemoriaOrigem = 'crm' | 'atendimento_log' | 'extracao_llm' | 'operador_manual' | 'sistema_automatico';

export type MemoriaPorLeadTipo =
  | 'preferencia_declarada'
  | 'historico_objecao'
  | 'dado_financeiro_extra'
  | 'contexto_familiar'
  | 'historico_visitas'
  | 'sinal_risco'
  | 'nota_operacional'
  | 'outro';

export interface MemoriaPorLead {
  id: string;
  lead_id: string;
  tipo: MemoriaPorLeadTipo;
  conteudo: string;
  evidencia_tipo: EvidenciaTipo;
  origem: MemoriaOrigem;
  status: MemoriaStatus;
  created_at: string;
  created_by: string;
  atendimento_id?: string;
  confianca?: MemoriaConfianca;
  validade_ate?: string;
  tags?: string[];
  notas?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface MemoriaPorAtendimento {
  id: string;
  atendimento_id: string;
  lead_id: string;
  abordagens_usadas: string[];
  objecoes_encontradas: string[];
  sinais_emitidos: string[];
  decisoes_tomadas: string[];
  outcome_id?: string;
  evidencia_tipo: EvidenciaTipo;
  status: MemoriaStatus;
  created_at: string;
  created_by: string;
  duracao_minutos?: number;
  canal?: string;
  fase_funil?: string;
  notas?: string;
  tags?: string[];
}

export type DiretivaManualScope = 'global' | 'por_perfil' | 'por_stage' | 'por_frente';
export type DiretivaManualPriority = 'alta' | 'media' | 'baixa';
export type DiretivaManualType =
  | 'ajuste_abordagem'
  | 'excecao_operacional'
  | 'observacao_estrategica'
  | 'cuidado_operacional'
  | 'restricao_temporaria'
  | 'lembrete_sistema';
export type DiretivaManualStatus = 'ativa' | 'suspensa' | 'arquivada';

export interface DiretivaManual {
  id: string;
  author: string;
  created_at: string;
  scope: DiretivaManualScope;
  priority: DiretivaManualPriority;
  directive_type: DiretivaManualType;
  content: string;
  rationale: string;
  status: DiretivaManualStatus;
  audit_ref: string;
  version: number;
  supersedes?: string;
  previous_version_id?: string;
  expiry_date?: string;
  escopo_perfil?: string;
  escopo_stage?: string;
  normativo_conflict_check: boolean;
  conflict_ids?: string[];
  tags?: string[];
  notas?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface E1HookContext {
  trace_id: string;
  correlation_id: string;
  request_id: string;
}

export interface E1CoreHookInput extends E1HookContext {
  lead_id: string;
  current_stage: string;
  facts: Record<string, unknown>;
}

export interface E1ChannelHookInput extends E1HookContext {
  lead_ref: string;
  event_id: string;
  event_type: string;
}

export interface E1IntegrationSnapshot {
  crm_write_enabled: false;
  external_dispatch_enabled: false;
  core_sovereignty_preserved: true;
  cognitive_context_available: boolean;
  speech_surface_override_enabled: false;
}

export interface E1TechnicalContext {
  mode: 'technical_local_only';
  lead_id: string;
  crm_lead_known: boolean;
  normative_refs: Array<Pick<ItemNormativo, 'id' | 'source_name' | 'citation_ref' | 'status'>>;
  commercial_rules: Array<Pick<RegraComercial, 'id' | 'priority' | 'rule_type' | 'guidance'>>;
  manual_directives: Array<Pick<DiretivaManual, 'id' | 'priority' | 'directive_type'>>;
  memory_counts: {
    total: number;
    active: number;
    blocked: number;
  };
  integration: E1IntegrationSnapshot;
}

export type E1EvidenceLayer = 'normative' | 'commercial' | 'memory' | 'manual' | 'integration' | 'smoke';
export type E1EvidenceSeverity = 'info' | 'warn' | 'error';
export type E1EvidenceOutcome = 'observed' | 'accepted' | 'blocked' | 'completed' | 'failed';

export interface E1RuntimeEvidenceEvent {
  event_name: string;
  event_version: typeof E1_EVENT_VERSION;
  contract_front: typeof E1_CONTRACT_KEY;
  layer: E1EvidenceLayer;
  trace_id: string;
  correlation_id: string;
  request_id?: string;
  timestamp: string;
  severity: E1EvidenceSeverity;
  outcome: E1EvidenceOutcome;
  lead_id?: string;
  symptom_code?: string;
  evidence_ref?: string;
  details?: Record<string, unknown>;
}

