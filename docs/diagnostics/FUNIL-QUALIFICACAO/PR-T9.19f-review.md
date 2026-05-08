# PR-T9.19f-review — captura body de erro OpenAI em respostas 4xx/5xx

**PR:** #254 — https://github.com/brunovasque/Enova-2/pull/254
**Branch:** `fix/t9.19-llm-error-detail`
**Base:** `main` (commit `4223d39` — estado pós-PR #253)
**Commit:** `b8e967c`
**Data:** 2026-05-07
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 7 linhas

---

## Problema corrigido

Quando a OpenAI retornava status 4xx/5xx (ex: modelo inválido, quota excedida), o body da resposta
era ignorado. Apenas o código HTTP chegava aos logs (`llm_api_error_400`). A mensagem real da API
(ex: `"The model gpt-5.4 does not exist..."`) era descartada silenciosamente.

Diagnosticado em: `docs/diagnostics/FUNIL-QUALIFICACAO/27-llm-error-handling.md`

---

## Mudança

### `src/llm/client.ts` — bloco `!response.ok` (linhas 289–296)

```typescript
// ANTES:
if (!response.ok) {
  return { ok: false, error: `llm_api_error_${response.status}`, llm_invoked: true, latency_ms };
}

// DEPOIS:
if (!response.ok) {
  let errorDetail = '';
  try {
    const errBody = await response.text();
    const errJson = JSON.parse(errBody);
    errorDetail = errJson?.error?.message ?? errBody.slice(0, 200);
  } catch { /* ignorar */ }
  return { ok: false, error: `llm_api_error_${response.status}: ${errorDetail}`, llm_invoked: true, latency_ms };
}
```

Exemplo de saída após fix:
```
llm_api_error_400: The model `gpt-5.4` does not exist or you do not have access to it.
```

---

## Invariantes preservados

- `LLM_MODEL = 'gpt-5.4-mini'` inalterado
- `LLM_MAX_TOKENS`, `LLM_TEMPERATURE` inalterados
- `SYSTEM_PROMPT_BASE` inalterado
- `buildDynamicSystemPrompt` inalterado
- Caminho happy-path (`response.ok === true`) inalterado
- `try/catch` garante que falha ao ler o body não quebra o retorno — `errorDetail` fica `''`
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
git revert b8e967c
```

Seguro: 1 arquivo, 7 linhas, zero schema, zero migration, zero flags.
