/**
 * ENOVA 2 — Core Mecânico 2 — Regras e Política do Final Operacional (L17)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-15
 * Bloco legado:      L17 — Final operacional / docs / visita / handoff
 * Página-fonte:      PDF mestre:
 *                    - E7.3: dossiê, recebimento, status e handoff no mesmo estado estruturado
 *                    - F7/F8: docs_channel_choice, visit_interest e status documentais
 *                    - 4.1 Fases macro: docs_prep, docs_collection, broker_handoff, visit_conversion
 *                    - handoff_readiness: none, parcial, pronto para docs, correspondente, visita
 * Gate-fonte:        Gate 2 (A01)
 * Evidência exigida: smoke real do recorte final + atualização dos arquivos vivos
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo define apenas estrutura e política.
 * Não há fala, phrasing ou resposta ao cliente.
 */

export const FINAL_DOCS_PREP_REQUIRED_FACTS = ['docs_channel_choice'] as const;
export const FINAL_DOCS_COLLECTION_REQUIRED_FACTS = [
  'doc_identity_status',
  'doc_income_status',
  'doc_residence_status',
] as const;
export const FINAL_VISIT_REQUIRED_FACTS = ['visit_interest'] as const;
export const FINAL_OPTIONAL_FACTS = [
  'doc_ctps_status',
  'handoff_readiness',
] as const;

export type DocsChannelChoice =
  | 'whatsapp'
  | 'site'
  | 'visita_presencial';

export type VisitInterest =
  | 'sim'
  | 'nao'
  | 'talvez';

export type DocStatus =
  | 'faltando'
  | 'parcial'
  | 'recebido'
  | 'validado';

export type HandoffReadiness =
  | 'none'
  | 'parcial'
  | 'pronto_para_docs'
  | 'pronto_para_correspondente'
  | 'pronto_para_visita';

export type FinalParseStatus = 'ready' | 'partial' | 'empty';

export const FINAL_BLOCKING_CONDITIONS = {
  FACTO_CRITICO_AUSENTE: 'final.facto_critico_ausente',
  DOCUMENTO_PENDENTE: 'final.documento_pendente',
  VISITA_NAO_CONFIRMADA: 'final.visita_nao_confirmada',
  HANDOFF_NAO_PRONTO: 'final.handoff_nao_pronto',
} as const;

export const FINAL_ADVANCE_CRITERIA = {
  DOCS_CHANNEL_VALIDO: 'final.docs_channel_valido',
  DOCS_COMPLETOS: 'final.docs_completos',
  VISITA_CONFIRMADA: 'final.visita_confirmada',
  HANDOFF_CONCLUIDO: 'final.handoff_concluido',
} as const;

export const FINAL_NEXT_STEP = {
  REMAIN_IN_DOCS_PREP: 'docs_prep',
  REMAIN_IN_DOCS_COLLECTION: 'docs_collection',
  REMAIN_IN_VISIT: 'visit',
  REMAIN_IN_BROKER_HANDOFF: 'broker_handoff',
  ADVANCE_TO_DOCS_COLLECTION: 'docs_collection',
  ADVANCE_TO_VISIT: 'visit',
  ADVANCE_TO_BROKER_HANDOFF: 'broker_handoff',
} as const;

export const FINAL_SIGNAL_POLICY = {
  CANAL_DOCS_ESCOLHIDO: 'canal_docs_escolhido',
  VISITA_APLICAVEL: 'visita_aplicavel',
  DOCS_PARCIAIS: 'docs_parciais',
  DOCS_COMPLETOS: 'docs_completos',
  HANDOFF_PRONTO_CORRESPONDENTE: 'handoff_pronto_correspondente',
  HANDOFF_PRONTO_VISITA: 'handoff_pronto_visita',
} as const;

export const FINAL_COMPLETE_DOC_STATUSES = new Set<DocStatus>(['recebido', 'validado']);
