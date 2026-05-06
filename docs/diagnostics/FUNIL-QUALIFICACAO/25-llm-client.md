# 25 — Conteúdo completo: src/llm/client.ts

**Data:** 2026-05-06
**Fonte:** `git show HEAD:src/llm/client.ts`

---

```typescript
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
```

---

## Análise estrutural

### Constantes

| Constante | Valor |
|---|---|
| `LLM_API_URL` | `https://api.openai.com/v1/chat/completions` |
| `LLM_MODEL` | `gpt-4o-mini` |
| `LLM_MAX_TOKENS` | `300` |
| `LLM_TEMPERATURE` | `0.7` |

### `LlmClientResult` — campos

| Campo | Tipo | Significado |
|---|---|---|
| `ok` | boolean | chamada bem-sucedida |
| `reply_text` | string? | resposta do LLM (somente quando ok=true) |
| `latency_ms` | number? | latência da chamada HTTP |
| `error` | string? | código de erro estrutural |
| `llm_invoked` | boolean | indica se a chamada HTTP foi feita |

### `LlmContext` — campos

| Campo | Tipo | Origem |
|---|---|---|
| `stage_current` | string | `CoreDecision.stage_current` |
| `stage_after` | string | `CoreDecision.stage_after` |
| `next_objective` | string | `CoreDecision.next_objective` (já mapeado por `toSemanticNextObjective`) |
| `facts_count` | number | contagem de facts do lead |
| `facts_summary` | Record<string,string> | facts sanitizados (sem CPF, sem renda bruta) |
| `speech_intent` | string? | `CoreDecision.speech_intent` |
| `recent_turns` | Array? | últimos 3 turnos, truncados a 100 chars |

### `buildDynamicSystemPrompt` — estrutura do prompt

```
[SYSTEM_PROMPT base — 8 regras de soberania]

Etapa atual do cliente: {stage_current}.
[Próxima etapa prevista: {stage_after}.] ← apenas se stage_after != stage_current
Objetivo atual: {next_objective}.
[Intenção de fala recomendada: {speech_intent}.]

Informações já coletadas:
  - {k}: {v}  ← máx 8 facts

Contexto recente da conversa:
- user: {content[:100]}
- assistant: {content[:100]}  ← máx 3 turnos
```

Truncado em 4800 chars (~1200 tokens) por safety.

### Fluxo de `callLlm`

```
1. Valida OPENAI_API_KEY → erro estrutural se ausente (sem HTTP)
2. Valida userMessage não vazio
3. Monta systemPrompt (dinâmico se context presente, base caso contrário)
4. POST para OpenAI com model=gpt-4o-mini
5. Retorna reply_text ou error estrutural
6. Catch: llm_network_error (sem rethrow — fallback seguro)
```

### Lacunas para diagnóstico

| Item | Estado |
|---|---|
| `next_objective` no prompt | chega como código semântico (já mapeado por canary-pipeline) |
| Sanitização de `facts_summary` | feita pelo caller (canary-pipeline), não aqui |
| Gate `LLM_REAL_ENABLED` | verificado no canary-pipeline antes de chamar `callLlm` |
| Modelo | `gpt-4o-mini` — não `claude-*`; sem flag de modelo configurável |
| `recent_turns` truncado a 100 chars | pode cortar contexto relevante em mensagens longas |
