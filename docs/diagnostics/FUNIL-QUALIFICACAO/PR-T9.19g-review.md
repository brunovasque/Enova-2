# PR-T9.19g-review — max_tokens → max_completion_tokens no body fetch OpenAI

**PR:** #255 — https://github.com/brunovasque/Enova-2/pull/255
**Branch:** `fix/t9.19-max-completion-tokens`
**Base:** `main` (commit `8ebac05` — estado pós-PR #254)
**Commit:** `6293e4b`
**Data:** 2026-05-07
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 1 linha

---

## Mudança

### `src/llm/client.ts`

```typescript
// ANTES:
max_tokens: LLM_MAX_TOKENS,

// DEPOIS:
max_completion_tokens: LLM_MAX_TOKENS,
```

---

## Motivação

`max_tokens` é o campo legado da Chat Completions API. Modelos o1/o3/gpt-5.x usam a Responses API,
onde o campo correto é `max_completion_tokens`. Enviar `max_tokens` para modelos novos pode resultar
em aviso de deprecação ou no limite ser ignorado silenciosamente.

---

## Invariantes preservados

- `LLM_MAX_TOKENS = 400` inalterado — apenas o nome do campo na payload
- `LLM_MODEL = 'gpt-5.4-mini'` inalterado
- `LLM_TEMPERATURE` inalterado
- `SYSTEM_PROMPT_BASE` inalterado
- `buildDynamicSystemPrompt` inalterado
- `callLlm`, `LlmContext` inalterados
- Zero diff fora de `src/llm/client.ts`

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **103/103 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Rollback

```bash
git revert 6293e4b
```

Seguro: 1 arquivo, 1 linha, zero schema, zero migration, zero flags.
