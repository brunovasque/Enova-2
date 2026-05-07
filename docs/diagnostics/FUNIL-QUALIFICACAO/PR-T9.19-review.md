# PR-T9.19-review — trocar modelo LLM de gpt-4o-mini para gpt-5.4

**PR:** #251 — https://github.com/brunovasque/Enova-2/pull/251
**Branch:** `fix/t9.19-modelo-gpt54`
**Base:** `main` (commit `6e5e958` — estado pós-PR #250)
**Commit:** `ca0cd68`
**Data:** 2026-05-07
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 1 linha

---

## Mudança

### `src/llm/client.ts`

```typescript
// ANTES:
const LLM_MODEL = 'gpt-4o-mini';

// DEPOIS:
const LLM_MODEL = 'gpt-5.4';
```

---

## Invariantes preservados

- `SYSTEM_PROMPT_BASE` inalterado
- `buildDynamicSystemPrompt` inalterado
- `callLlm` inalterado
- `LlmContext` inalterado
- `LLM_MAX_TOKENS`, `LLM_TEMPERATURE` inalterados
- Zero diff fora de `src/llm/client.ts`

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **31/31 PASS** |
| `npm run smoke:core:text-extractor` | **103/103 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Fora de escopo (zero diff)

- `src/core/`, `src/supabase/`, `src/meta/`
- `panel-nextjs/`, `wrangler.toml`
- Zero migration, zero schema, zero flags

---

## Riscos

- `gpt-5.4` tem custo por token maior que `gpt-4o-mini`. Mitigado por `LLM_MAX_TOKENS=400` e limite de 8000 chars no prompt dinâmico.
- Disponibilidade do modelo depende do tier da conta OpenAI. Se o modelo não estiver disponível, a API retorna `llm_api_error_404` e o fallback seguro de `callLlm` é ativado (`ok=false`, sem `reply_text`).

---

## Rollback

```bash
git revert ca0cd68
```

Seguro: 1 arquivo, 1 linha, zero schema, zero migration, zero flags.
