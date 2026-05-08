# 27 — LLM Error Handling — `src/llm/client.ts`

**Data:** 2026-05-07
**Branch:** `fix/t9.19-modelo-gpt54mini`
**Tipo:** Read-only diagnostic

---

## Grep executado

```
grep -n "response.ok|bodyText|parsePg|error_type|llm_api_error|status|json()|text()" src/llm/client.ts
```

## Resultado

```
289:    if (!response.ok) {
290:      return { ok: false, error: `llm_api_error_${response.status}`, llm_invoked: true, latency_ms };
293:    const json = (await response.json()) as {
```

---

## Contexto completo (linhas 287–300)

```typescript
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
```

---

## Achado

Quando `response.ok === false` (status 4xx ou 5xx):

- O código retorna **imediatamente** com `error: llm_api_error_${response.status}`
- O **body da resposta NÃO é lido** — `response.text()` e `response.json()` nunca são chamados
- A mensagem de erro da OpenAI (ex: `"model not found"`, `"invalid model"`) é **descartada silenciosamente**

Para um modelo inválido (ex: `gpt-5.4`), a OpenAI retorna HTTP 400 com body:
```json
{ "error": { "message": "The model `gpt-5.4` does not exist...", "type": "invalid_request_error", ... } }
```

Esse body nunca chega aos logs — só `llm_api_error_400` é registrado.

---

## Gap identificado

| Situação | O que é capturado | O que é perdido |
|---|---|---|
| `response.ok === false` | `llm_api_error_${status}` | Mensagem de erro da API (model not found, quota, etc.) |
| `response.ok === true` + choices vazio | `llm_empty_response` | — |
| `response.ok === true` + reply presente | `reply_text` completo | — |

---

## Referência

- Arquivo: `src/llm/client.ts`, linhas 289–291
- Fix possível (fora deste escopo): ler `await response.text()` antes do `return` no bloco `!response.ok`, logar ou incluir no campo `error`
