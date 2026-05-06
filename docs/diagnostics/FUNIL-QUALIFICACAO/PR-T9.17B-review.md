# PR-T9.17B-review — SYSTEM_PROMPT: LLM orientado a executar next_objective

**PR:** #246 — https://github.com/brunovasque/Enova-2/pull/246
**Branch:** `fix/t9.17b-system-prompt-objective`
**Base:** `main` (commit `977a958` — merge PR #245)
**Commit:** `574ca6f`
**Data:** 2026-05-06
**Tipo:** PR-IMPL — 1 arquivo, 1 constante

---

## Problema

O `SYSTEM_PROMPT` base de `src/llm/client.ts` instruía o LLM a responder passivamente à mensagem recebida:

```typescript
// ANTES:
const SYSTEM_PROMPT =
  'Você é a Enova, assistente de atendimento imobiliário MCMV.\n' +
  'Responda de forma curta, humana e útil.\n' +
  'Não invente dados.\n' +
  'Não aprove financiamento.\n' +
  'Não diga que o cliente está aprovado.\n' +
  'Não peça documentos ainda se o contexto não justificar.\n' +
  'Não tome decisões de etapa/funil.\n' +
  'Apenas responda a mensagem recebida de forma segura e natural.';
```

Com esse prompt, o LLM prioriza reconhecer a mensagem do cliente mas não necessariamente executa o `Objetivo atual` enviado no system prompt dinâmico (`buildDynamicSystemPrompt`). Resultado: o funil avança no Core (next_objective definido), mas o LLM responde de forma genérica sem fazer a pergunta correta.

---

## Correção

### `src/llm/client.ts` — constante `SYSTEM_PROMPT`

```typescript
// DEPOIS:
const SYSTEM_PROMPT =
  'Você é a Enova, especialista em Minha Casa Minha Vida.\n' +
  'Sua missão em CADA mensagem: executar o "Objetivo atual" informado abaixo.\n' +
  'O Objetivo atual define EXATAMENTE o que você deve fazer neste turno.\n' +
  'Após reconhecer o que o cliente disse, SEMPRE execute o Objetivo atual.\n' +
  'Nunca encerre a conversa sem executar o Objetivo atual.\n' +
  'Nunca invente dados ou aprove financiamento.\n' +
  'Nunca tome decisões de etapa ou funil — apenas execute o objetivo.\n' +
  'Seja humana, natural e direta. Respostas curtas.';
```

---

## Raciocínio da mudança

| Aspecto | Antes | Depois |
|---|---|---|
| Missão principal | "Responda a mensagem" | "Execute o Objetivo atual" |
| Postura | Passiva (reativa) | Ativa (executora) |
| Risco de ignorar next_objective | Alto | Baixo |
| Soberania do Core | Mantida | Mantida |
| Soberania da fala do LLM | Mantida | Mantida |

O `next_objective` chega via `buildDynamicSystemPrompt` como `"Objetivo atual: {instrução semântica}"`. O SYSTEM_PROMPT base precisa deixar claro que esse objetivo é **obrigatório** em cada turno — não opcional.

---

## Fora de escopo (zero diff)

- `buildDynamicSystemPrompt` — zero alteração
- `LlmContext` — zero alteração
- `callLlm` — zero alteração
- Todos os outros arquivos — zero alteração

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **31/31 PASS** |
| `npm run smoke:core:text-extractor` | **101/101 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Rollback

```bash
git revert 574ca6f
```

Seguro: 1 arquivo, 1 constante, zero schema, zero migration, zero flags.
