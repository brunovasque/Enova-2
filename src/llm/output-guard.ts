/**
 * ENOVA 2 — PR-T9.9 — Output Guard para respostas do LLM
 *
 * Módulo puro — sem I/O, sem deps externas, zero efeitos colaterais.
 * Valida reply_text gerado pelo LLM antes de chegar ao outbound.
 *
 * REGRAS SOBERANAS (ADENDO_CANONICO_SOBERANIA_IA + contrato T9):
 *   - LLM é soberano da fala. Guard apenas valida segurança — não gera reply.
 *   - Adapter NUNCA inventa atendimento. Guard nunca substitui reply_text.
 *   - Se blocked → replyText permanece undefined → outbound para via 'reply_text_missing'.
 *   - Guard não decide stage. Core decide. Guard só lê stage_current para contexto.
 */

export type LlmGuardReasonCode =
  | 'approval_promise'
  | 'credit_approved'
  | 'financing_guarantee'
  | 'internal_stage_exposed'
  | 'internal_id_exposed'
  | 'pii_cpf_exposed'
  | 'secret_token_exposed'
  | 'empty_text'
  | 'text_too_long'
  | 'document_request_out_of_stage';

export interface LlmOutputGuardResult {
  allowed: boolean;
  blocked: boolean;
  warned: boolean;
  reason_codes: LlmGuardReasonCode[];
  safe_reply_text?: string;
  replacement_used: boolean;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

// Stages onde pedido de documento é prematuro (warn).
const EARLY_STAGES = new Set(['discovery', 'qualification_civil']);

// Palavras de negação que, se presentes antes da match de aprovação (≤50 chars),
// indicam que a frase não é promessa direta.
const NEGATION_WORDS = ['não', 'nao', 'nunca', 'jamais', 'impossível', 'impossivel'];

// Patterns determinísticos de pedido de documento no contexto MCMV.
const DOC_REQUEST_PATTERN =
  /\b(me\s+envi[ae]|envie|mande|me\s+mand[ae]|traga|anexe|encaminhe|preciso\s+d[eo]|me\s+passa)\b.{0,30}\b(holerite|contracheque|comprovante\s+de\s+renda|cnh|rg\b|cpf\b|carteira|certid[aã]o|passaporte|extrato\s+banc|declara[cç][aã]o\s+de\s+ir|imposto\s+de\s+renda)/i;

// ---------------------------------------------------------------------------
// Regras de bloqueio simples — sem necessidade de contexto de negação
// ---------------------------------------------------------------------------
interface BlockRule {
  code: LlmGuardReasonCode;
  pattern: RegExp;
}

const SIMPLE_BLOCK_RULES: BlockRule[] = [
  // Segurança: secrets e tokens — verificados antes de tudo
  {
    code: 'secret_token_exposed',
    pattern:
      /\bsk-[A-Za-z0-9_\-]{10,}|Bearer\s+\S{15,}|OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|META_APP_SECRET|META_ACCESS_TOKEN/i,
  },

  // Privacidade: CPF (000.000.000-00)
  {
    code: 'pii_cpf_exposed',
    pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/,
  },

  // Vazamento: UUIDs internos completos
  {
    code: 'internal_id_exposed',
    pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  },

  // Vazamento: campos internos explicitamente nomeados com atribuição
  {
    code: 'internal_id_exposed',
    pattern: /\b(lead_id|turn_id|wa_id|decision_id)\s*[:=]/i,
  },

  // Arquitetura: nomes de stage interno
  {
    code: 'internal_stage_exposed',
    pattern:
      /\b(qualification_civil|qualification_renda|qualification_eligibility|qualification_special|docs_prep|docs_collection|broker_handoff)\b/i,
  },

  // Aprovação: crédito aprovado (específico — sem ambiguidade de negação)
  {
    code: 'credit_approved',
    pattern: /seu\s+cr[eé]dito\s+(foi|est[aá])\s+aprovad/i,
  },

  // Aprovação: garantia de financiamento
  {
    code: 'financing_guarantee',
    pattern: /garantimos?\s+(o\s+seu|seu|o)\s+financiamento/i,
  },
];

// ---------------------------------------------------------------------------
// Verificação especial: promessa de aprovação (com detecção de negação)
// ---------------------------------------------------------------------------

// Pattern de promessa direta de aprovação.
// Captura: "você foi aprovado", "você está aprovada", "tenho certeza que vai ser aprovado",
//          "foi aprovado para o MCMV", etc.
const APPROVAL_PROMISE_PATTERN =
  /\bvoc[eê]\s+(foi|est[aá])\s+aprovad[oa]\b|\btenho\s+certeza\s+que\s+(vai\s+ser|ser[aá])\s+aprovad[oa]\b|\bfoi\s+aprovad[oa]\s+para\s+o\s+mcmv\b/i;

/**
 * Verifica se o texto contém promessa direta de aprovação.
 * Considera negação contextual: "não posso dizer que você está aprovado" → não bloqueia.
 */
function checkApprovalPromise(text: string): boolean {
  const match = APPROVAL_PROMISE_PATTERN.exec(text);
  if (!match) return false;

  // Verificar negação nos 50 chars antes do match
  const matchStart = match.index;
  const prefix = text.slice(Math.max(0, matchStart - 50), matchStart).toLowerCase();
  const isNegated = NEGATION_WORDS.some((w) => prefix.includes(w));

  return !isNegated;
}

// ---------------------------------------------------------------------------
// Função principal — exportada
// ---------------------------------------------------------------------------

/**
 * Aplica o Output Guard ao reply_text gerado pelo LLM.
 *
 * Ordem de avaliação:
 *   1. Texto vazio → blocked (empty_text)
 *   2. SIMPLE_BLOCK_RULES → blocked (reason específico)
 *   3. Promessa de aprovação (com detecção de negação) → blocked (approval_promise)
 *   4. Avisos (text_too_long, document_request_out_of_stage) → warned, allowed
 *   5. Tudo ok → allowed
 *
 * Nunca modifica reply_text. safe_reply_text === replyText quando allowed.
 * replacement_used sempre false — guard nunca inventa resposta.
 */
export function applyOutputGuard(
  replyText: string,
  context?: { stage_current?: string },
): LlmOutputGuardResult {
  // Guarda 1 — texto vazio
  if (!replyText.trim()) {
    return {
      allowed: false,
      blocked: true,
      warned: false,
      reason_codes: ['empty_text'],
      safe_reply_text: undefined,
      replacement_used: false,
    };
  }

  // Guarda 2 — regras simples de bloqueio
  for (const rule of SIMPLE_BLOCK_RULES) {
    if (rule.pattern.test(replyText)) {
      return {
        allowed: false,
        blocked: true,
        warned: false,
        reason_codes: [rule.code],
        safe_reply_text: undefined,
        replacement_used: false,
      };
    }
  }

  // Guarda 3 — promessa de aprovação (com detecção de negação contextual)
  if (checkApprovalPromise(replyText)) {
    return {
      allowed: false,
      blocked: true,
      warned: false,
      reason_codes: ['approval_promise'],
      safe_reply_text: undefined,
      replacement_used: false,
    };
  }

  // Guarda 4 — avisos (não bloqueiam outbound)
  const warnCodes: LlmGuardReasonCode[] = [];

  if (replyText.length > 1000) {
    warnCodes.push('text_too_long');
  }

  const stageIsEarly = context?.stage_current
    ? EARLY_STAGES.has(context.stage_current)
    : false;

  if (stageIsEarly && DOC_REQUEST_PATTERN.test(replyText)) {
    warnCodes.push('document_request_out_of_stage');
  }

  const warned = warnCodes.length > 0;

  return {
    allowed: true,
    blocked: false,
    warned,
    reason_codes: warnCodes,
    safe_reply_text: replyText,
    replacement_used: false,
  };
}
