# PR-T9.19c-review — trocar modelo LLM de gpt-5.4 para gpt-5.2

**PR:** #252 — https://github.com/brunovasque/Enova-2/pull/252
**Branch:** `fix/t9.19-modelo-gpt52`
**Base:** `main` (commit `7122f6f` — estado pós-PR #251)
**Commit:** `ed9ced2`
**Data:** 2026-05-07
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 1 linha

---

## Mudança

### `src/llm/client.ts`

```typescript
// ANTES:
const LLM_MODEL = 'gpt-5.4';

// DEPOIS:
const LLM_MODEL = 'gpt-5.2';
```

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

## Rollback

```bash
git revert ed9ced2
```

Seguro: 1 arquivo, 1 linha, zero schema, zero migration, zero flags.
