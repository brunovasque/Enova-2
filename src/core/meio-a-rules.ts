/**
 * ENOVA 2 — Core Mecânico 2 — Regras e Política do Meio A (L07 + L08)
 *
 * --- ÂNCORA CONTRATUAL ---
 * Cláusula-fonte:    L-05 e L-06 (CLAUSE_MAP — estado civil e composição familiar)
 * Bloco legado:      L07 + L08 — Meio A: estado civil e composição familiar (parte 1)
 * Página-fonte:      PDF mestre, bloco L07/L08:
 *                    - taxonomia F2: estado civil, processo, composition_actor
 *                    - regra: casado civil implica processo conjunto
 *                    - regra: união estável pode seguir solo ou conjunto
 *                    - regra: solteiro pode seguir solo ou em composição
 * Gate-fonte:        Gate 2 (A01)
 * Evidência exigida: smoke integrado de avanço, bloqueio e composição mínima relevante
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo só define ESTRUTURA e POLÍTICA do Meio A.
 * Não há fala, phrasing ou resposta ao cliente.
 */

// ---------------------------------------------------------------------------
// Facts mínimos do Meio A (L07 + L08)
// ---------------------------------------------------------------------------

export const MEIO_A_REQUIRED_FACTS = ['estado_civil', 'processo'] as const;
export const MEIO_A_OPTIONAL_FACTS = ['composition_actor'] as const;

// ---------------------------------------------------------------------------
// Valores canônicos do Meio A — derivados do PDF legado consultado
// ---------------------------------------------------------------------------

export type EstadoCivil =
  | 'solteiro'
  | 'uniao_estavel'
  | 'casado_civil'
  | 'divorciado'
  | 'viuvo';

export type ProcessoMode =
  | 'solo'
  | 'conjunto'
  | 'composicao_familiar';

export type CompositionActor =
  | 'conjuge'
  | 'parceiro'
  | 'pai'
  | 'mae'
  | 'irmao'
  | 'outro';

export type MeioAParseStatus = 'ready' | 'partial' | 'empty';

// ---------------------------------------------------------------------------
// Critérios mínimos e bloqueios do Meio A
// ---------------------------------------------------------------------------

export const MEIO_A_BLOCKING_CONDITIONS = {
  FACTO_CRITICO_AUSENTE: 'meio_a.facto_critico_ausente',
  PROCESSO_INVALIDO_PARA_ESTADO_CIVIL: 'meio_a.processo_invalido_para_estado_civil',
  COMPOSICAO_SEM_ATOR: 'meio_a.composicao_sem_actor',
} as const;

export const MEIO_A_ADVANCE_CRITERIA = {
  TRILHO_VALIDO_ESTRUTURAL: 'meio_a.trilho_valido_estrutural',
} as const;

export const MEIO_A_NEXT_STEP = {
  ADVANCE_TO_RENDA: 'qualification_renda',
  REMAIN_IN_QUALIFICATION_CIVIL: 'qualification_civil',
} as const;

export const MEIO_A_SIGNAL_POLICY = {
  CASADO_CIVIL_FORCA_CONJUNTO: 'casado_civil_forca_conjunto',
  COMPOSICAO_RELEVANTE_DETECTADA: 'composicao_relevante_detectada',
  TRILHO_VALIDO_SEM_COMPOSICAO: 'trilho_valido_sem_composicao',
} as const;
