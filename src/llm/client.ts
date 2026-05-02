/**
 * ENOVA 2 — PR-T8.17 — Cliente LLM mínimo para geração de reply_text
 *
 * REGRAS INVIOLÁVEIS (ADENDO_CANONICO_SOBERANIA_IA):
 *   - LLM é soberano da fala. Gera reply_text exclusivamente.
 *   - Não decide stage, fact_*, funil, aprovação.
 *   - OPENAI_API_KEY nunca aparece em log/error/response.
 *   - Gated por LLM_REAL_ENABLED=true.
 *   - Fallback seguro em erro: ok=false, sem reply_text.
 *   - Resposta curta, humana, sem promessas de aprovação.
 */

const LLM_API_URL = 'https://api.openai.com/v1/chat/completions';
const LLM_MODEL = 'gpt-4o-mini';
const LLM_MAX_TOKENS = 300;
const LLM_TEMPERATURE = 0.7;

const SYSTEM_PROMPT =
  'Você é a Enova, assistente de atendimento imobiliário MCMV.\n' +
  'Responda de forma curta, humana e útil.\n' +
  'Não invente dados.\n' +
  'Não aprove financiamento.\n' +
  'Não diga que o cliente está aprovado.\n' +
  'Não peça documentos ainda se o contexto não justificar.\n' +
  'Não tome decisões de etapa/funil.\n' +
  'Apenas responda a mensagem recebida de forma segura e natural.';

export interface LlmClientResult {
  ok: boolean;
  reply_text?: string;
  latency_ms?: number;
  error?: string;
  llm_invoked: boolean;
}

// Contexto estruturado que o Core passa ao LLM — soberania da fala.
// Core decide stage; LLM decide apenas o que dizer.
export interface LlmContext {
  stage_current: string;
  stage_after: string;
  next_objective: string;
  facts_count: number;
  // Valores sanitizados: sem CPF, sem renda_principal bruta, sem secrets.
  facts_summary: Record<string, string>;
  speech_intent?: string;
  // Histórico recente — máx 3 turnos, truncado a 100 chars/mensagem.
  recent_turns?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Constrói system prompt dinâmico a partir do LlmContext.
// Orçamento máximo: ≤1200 tokens (~4800 chars). Nunca imprime secrets ou renda bruta.
export function buildDynamicSystemPrompt(context: LlmContext): string {
  const lines: string[] = [SYSTEM_PROMPT, ''];

  lines.push(`Etapa atual do cliente: ${context.stage_current}.`);
  if (context.stage_after !== context.stage_current) {
    lines.push(`Próxima etapa prevista: ${context.stage_after}.`);
  }
  lines.push(`Objetivo atual: ${context.next_objective}.`);

  if (context.speech_intent) {
    lines.push(`Intenção de fala recomendada: ${context.speech_intent}.`);
  }

  const factEntries = Object.entries(context.facts_summary);
  if (factEntries.length > 0) {
    lines.push('\nInformações já coletadas:');
    for (const [k, v] of factEntries.slice(0, 8)) {
      lines.push(`  - ${k}: ${v}`);
    }
  }

  if (context.recent_turns && context.recent_turns.length > 0) {
    lines.push('');
    lines.push('Contexto recente da conversa (para continuidade natural, não para regras de etapa):');
    for (const turn of context.recent_turns.slice(0, 3)) {
      const content = turn.content.slice(0, 100);
      lines.push(`- ${turn.role}: ${content}`);
    }
  }

  const prompt = lines.join('\n');
  // Safety truncation: never exceed 4800 chars (~1200 tokens)
  return prompt.slice(0, 4800);
}

function readApiKey(env: Record<string, unknown>): string | null {
  const v = env.OPENAI_API_KEY;
  if (typeof v === 'string' && v.length > 0) return v;
  return null;
}

export async function callLlm(
  userMessage: string,
  env: Record<string, unknown>,
  context?: LlmContext,
): Promise<LlmClientResult> {
  const apiKey = readApiKey(env);
  if (!apiKey) {
    return { ok: false, error: 'openai_api_key_missing', llm_invoked: false };
  }
  const msg = typeof userMessage === 'string' ? userMessage.trim() : '';
  if (!msg) {
    return { ok: false, error: 'user_message_empty', llm_invoked: false };
  }

  const systemPrompt = context ? buildDynamicSystemPrompt(context) : SYSTEM_PROMPT;

  const t0 = Date.now();
  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: msg.slice(0, 2000) },
        ],
        max_tokens: LLM_MAX_TOKENS,
        temperature: LLM_TEMPERATURE,
      }),
    });

    const latency_ms = Date.now() - t0;

    if (!response.ok) {
      return { ok: false, error: `llm_api_error_${response.status}`, llm_invoked: true, latency_ms };
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply_text = json.choices?.[0]?.message?.content?.trim();

    if (!reply_text) {
      return { ok: false, error: 'llm_empty_response', llm_invoked: true, latency_ms };
    }

    return { ok: true, reply_text, llm_invoked: true, latency_ms };
  } catch (e) {
    return {
      ok: false,
      error: `llm_network_error`,
      llm_invoked: true,
      latency_ms: Date.now() - t0,
    };
  }
}
