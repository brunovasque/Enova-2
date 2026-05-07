# PR-T9.18-hotfix-review — OBJETIVO ATUAL antes do contexto em buildDynamicSystemPrompt

**PR:** #250 — https://github.com/brunovasque/Enova-2/pull/250
**Branch:** `fix/t9.18-objetivo-primeiro`
**Base:** `main` (commit `a98f0fd` — estado pós-PR #249)
**Commit:** `4d94ca5`
**Data:** 2026-05-07
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 4 linhas reordenadas

---

## Problema corrigido

O bloco `OBJETIVO ATUAL` ficava no final do prompt dinâmico gerado por `buildDynamicSystemPrompt`,
após o contexto, fatos e histórico. O LLM processava todo o contexto antes de receber o objetivo,
aumentando o risco de o contexto interferir na priorização da instrução de execução do turno.

---

## Correção

### `src/llm/client.ts` — `buildDynamicSystemPrompt`

**ANTES (ordem anterior):**
```
SYSTEM_PROMPT_BASE
--- CONTEXTO DO ATENDIMENTO ATUAL ---
Etapa: {stage_current}
Próxima etapa ao avançar: {stage_after}
Intenção: {speech_intent}

Dados já coletados:
  key: value ...

Últimas mensagens:
  Cliente: ...
  Enova: ...

OBJETIVO ATUAL — execute agora: {next_objective}    ← no final
REGRA: faça apenas esta ação. Uma pergunta só. Não antecipe próximas etapas.
```

**DEPOIS (nova ordem):**
```
SYSTEM_PROMPT_BASE

OBJETIVO ATUAL — execute agora: {next_objective}    ← imediatamente após o base
REGRA: faça apenas esta ação. Uma pergunta só. Não antecipe próximas etapas.

--- CONTEXTO DO ATENDIMENTO ATUAL ---
Etapa: {stage_current}
Próxima etapa ao avançar: {stage_after}
Intenção: {speech_intent}

Dados já coletados:
  key: value ...

Últimas mensagens:
  Cliente: ...
  Enova: ...
```

**Diff real (4 linhas movidas):**
```typescript
// REMOVIDO do final:
  lines.push(`\nOBJETIVO ATUAL — execute agora: ${context.next_objective}`);
  lines.push('REGRA: faça apenas esta ação. Uma pergunta só. Não antecipe próximas etapas.');

// ADICIONADO após SYSTEM_PROMPT_BASE (antes do CONTEXTO):
  lines.push(`OBJETIVO ATUAL — execute agora: ${context.next_objective}`);
  lines.push('REGRA: faça apenas esta ação. Uma pergunta só. Não antecipe próximas etapas.');
  lines.push('\n--- CONTEXTO DO ATENDIMENTO ATUAL ---');
```

---

## Invariantes preservados

- Conteúdo do `SYSTEM_PROMPT_BASE` inalterado
- Conteúdo de todos os blocos do prompt dinâmico inalterado — apenas ordem
- Limite de 8000 chars preservado
- Filtro de facts `_*` preservado
- `callLlm`, `LlmContext`, `LLM_MAX_TOKENS`, `LLM_MODEL` sem alteração

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

- `SYSTEM_PROMPT_BASE` — sem alteração de conteúdo
- `src/core/`, `src/supabase/`, `src/meta/`
- `panel-nextjs/`, `wrangler.toml`
- Zero migration, zero schema, zero flags

---

## Rollback

```bash
git revert 4d94ca5
```

Seguro: 1 arquivo, 4 linhas reordenadas, zero schema, zero migration, zero flags.
