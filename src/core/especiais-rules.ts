/**
 * ENOVA 2 — Core Mecânico 2 — Regras e Política dos Especiais (L15 + L16)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-13, L-14
 * Bloco legado:      L15 + L16 — trilhos especiais P3, multi e variantes mínimas
 * Página-fonte:      PDF mestre:
 *                    - E6.2: composição familiar e P3 entram em roteamento estruturado
 *                    - F2/F4: p3_required, work_regime_p2, monthly_income_p2,
 *                             autonomo_has_ir_p2, ctps_36m_p2, work_regime_p3
 * Gate-fonte:        Gate 2 (A01)
 * Evidência exigida: smoke integrado com ausência crítica, trilho válido e alteração de next step
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo só define ESTRUTURA e POLÍTICA.
 * Não há fala, surface ou resposta ao cliente.
 */

export const ESPECIAIS_MULTI_REQUIRED_FACTS = [
  'work_regime_p2',
  'monthly_income_p2',
] as const;

export const ESPECIAIS_P3_REQUIRED_FACTS = [
  'work_regime_p3',
] as const;

export const ESPECIAIS_OPTIONAL_FACTS = [
  'processo',
  'p3_required',
  'autonomo_has_ir_p2',
  'ctps_36m_p2',
] as const;

export type EspecialTrackKind =
  | 'none'
  | 'multi'
  | 'p3';

export type EspeciaisParseStatus = 'ready' | 'partial' | 'empty';

export const ESPECIAIS_BLOCKING_CONDITIONS = {
  FACTO_CRITICO_AUSENTE_MULTI: 'especiais.facto_critico_ausente_multi',
  FACTO_CRITICO_AUSENTE_P3: 'especiais.facto_critico_ausente_p3',
  MULTI_AUTONOMO_SEM_IR: 'especiais.multi_autonomo_sem_ir',
} as const;

export const ESPECIAIS_ADVANCE_CRITERIA = {
  SEM_TRILHO_ESPECIAL: 'especiais.sem_trilho_especial',
  TRILHO_ESPECIAL_VALIDO: 'especiais.trilho_especial_valido',
} as const;

export const ESPECIAIS_NEXT_STEP = {
  ROUTE_TO_SPECIAL: 'qualification_special',
  REMAIN_IN_SPECIAL: 'qualification_special',
  ADVANCE_TO_DOCS: 'docs_prep',
} as const;

export const ESPECIAIS_SIGNAL_POLICY = {
  TRILHO_P3: 'trilho_p3',
  TRILHO_MULTI: 'trilho_multi',
  TRILHO_MULTI_AUTONOMO: 'trilho_multi_autonomo',
  SEM_TRILHO_ESPECIAL: 'sem_trilho_especial',
} as const;
