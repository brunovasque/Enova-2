/**
 * ENOVA 2 — Core Mecânico 2 — Regras e Política do Meio B (L11 + L12 + L13 + L14)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-09, L-10, L-11, L-12
 * Bloco legado:      L11 + L12 + L13 + L14 — Meio B
 * Página-fonte:      PDF mestre:
 *                    - F1/F3: nacionalidade, RNM, regime, renda, IR, CTPS
 *                    - regra: autônomo exige pergunta obrigatória sobre IR
 *                    - regra: renda solo baixa sugere composição antes de inviabilizar
 *                    - regra: estrangeiro exige RNM válido
 *                    - regra: CTPS 36 meses melhora condição, mas não trava o fluxo
 * Gate-fonte:        Gate 2 (A01)
 * Evidência exigida: smoke integrado com ausência crítica, trilho válido e elegibilidade alterando next step
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo define apenas ESTRUTURA e POLÍTICA do Meio B.
 * Nenhuma fala ou resposta ao cliente é produzida aqui.
 */

export const MEIO_B_RENDA_REQUIRED_FACTS = ['regime_trabalho', 'renda_principal'] as const;
export const MEIO_B_ELIGIBILITY_REQUIRED_FACTS = ['nacionalidade'] as const;
export const MEIO_B_OPTIONAL_FACTS = ['autonomo_tem_ir', 'ctps_36', 'rnm_status'] as const;

export type RegimeTrabalho =
  | 'clt'
  | 'autonomo'
  | 'aposentado'
  | 'servidor'
  | 'informal'
  | 'multiplo';

export type Nacionalidade =
  | 'brasileiro'
  | 'estrangeiro'
  | 'naturalizado';

export type RnmStatus =
  | 'valido'
  | 'vencido'
  | 'ausente'
  | 'indeterminado';

export type MeioBParseStatus = 'ready' | 'partial' | 'empty';

export const MEIO_B_BLOCKING_CONDITIONS = {
  FACTO_CRITICO_AUSENTE: 'meio_b.facto_critico_ausente',
  AUTONOMO_SEM_IR: 'meio_b.autonomo_sem_ir',
  RENDA_SOLO_BAIXA: 'meio_b.renda_solo_baixa',
  RNM_INVALIDO_OU_AUSENTE: 'meio_b.rnm_invalido_ou_ausente',
} as const;

export const MEIO_B_ADVANCE_CRITERIA = {
  TRILHO_RENDA_VALIDO: 'meio_b.trilho_renda_valido',
  ELEGIBILIDADE_MINIMA_VALIDA: 'meio_b.elegibilidade_minima_valida',
} as const;

export const MEIO_B_NEXT_STEP = {
  ADVANCE_TO_ELIGIBILITY: 'qualification_eligibility',
  ADVANCE_TO_DOCS: 'docs_prep',
  REMAIN_IN_RENDA: 'qualification_renda',
  REMAIN_IN_ELIGIBILITY: 'qualification_eligibility',
} as const;

export const MEIO_B_SIGNAL_POLICY = {
  AUTONOMO_EXIGE_IR: 'autonomo_exige_ir',
  SUGERIR_COMPOSICAO_RENDA: 'sugerir_composicao_renda',
  CTPS_ESTRATEGICA: 'ctps_estrategica_sem_bloqueio',
  RNM_VALIDACAO_OBRIGATORIA: 'rnm_validacao_obrigatoria',
  TRILHO_VALIDO_MEIO_B: 'trilho_valido_meio_b',
} as const;
