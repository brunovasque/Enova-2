# PR-T9.18-review — SYSTEM_PROMPT_BASE completo com mapa cognitivo do funil MCMV

**PR:** #249 — https://github.com/brunovasque/Enova-2/pull/249
**Branch:** `fix/t9.18-system-prompt-funil-completo`
**Base:** `main` (commit `239e035` — estado pós-PR #248)
**Commit:** `6cb5a3c`
**Data:** 2026-05-07
**Tipo:** PR-IMPL — contratual — 1 arquivo

---

## Problema corrigido

### SYSTEM_PROMPT minimalista sem conhecimento do funil

O SYSTEM_PROMPT anterior tinha 7 linhas sem qualquer contexto sobre:
- Funil MCMV (sequência F1–F10)
- Regras de negócio (RNM, estado civil, composição, renda, dependentes, documentos, restrição)
- Tom e postura consultiva
- Comportamento em dúvidas fora de hora
- Regras de fechamento de conversa

O LLM recebia contexto dinâmico correto (stage, next_objective, facts) mas não tinha base normativa para saber O QUE fazer com cada dado ou como conduzir cada situação.

---

## Correções

### `src/llm/client.ts` — 5 mudanças

#### 1. `SYSTEM_PROMPT` → `SYSTEM_PROMPT_BASE` (renomeação)

Todas as referências no arquivo atualizadas.

#### 2. Conteúdo substituído — SYSTEM_PROMPT_BASE completo

Seções adicionadas:

```
MISSÃO — descrição do papel da Enova
EM CADA TURNO — 6 regras de comportamento por turno
REGRAS INVIOLÁVEIS — 9 restrições absolutas
TOM E POSTURA — linguagem WhatsApp, empatia, firmeza
FUNIL MCMV — SEQUÊNCIA MACRO — F1 a F10 resumidos
REGRAS DE NEGÓCIO — NACIONALIDADE/RNM — 5 regras
REGRAS DE NEGÓCIO — ESTADO CIVIL E COMPOSIÇÃO — 10 regras
REGRAS DE NEGÓCIO — RENDA — 11 regras
REGRAS DE NEGÓCIO — DEPENDENTES — 4 regras
REGRAS DE NEGÓCIO — CONTEXTO DE MORADIA, TRABALHO E COMPRA — 5 regras
REGRAS DE NEGÓCIO — CURSO SUPERIOR — 3 regras
REGRAS DE NEGÓCIO — ENTRADA, FGTS E PARCELA — 9 regras
REGRAS DE NEGÓCIO — RESTRIÇÃO — 6 regras
REGRAS DE NEGÓCIO — DIVORCIADO/VIÚVO — 3 regras
REGRAS DE NEGÓCIO — DOCUMENTOS — 12 regras por perfil
REGRAS DE NEGÓCIO — CORRESPONDENTE E APROVAÇÃO — 4 regras
REGRAS DE NEGÓCIO — VISITA AO PLANTÃO — 5 regras
DÚVIDAS FORA DE HORA — 7 situações cobertas
FECHAMENTO DE CONVERSA — 3 regras
```

#### 3. `buildDynamicSystemPrompt` atualizado

Diferenças do antes/depois:

```typescript
// ANTES:
lines.push(`Etapa atual do cliente: ${context.stage_current}.`);
lines.push(`Objetivo atual: ${context.next_objective}.`);
// facts sem filtro, até 8, 100 chars/turno, limite 4800 chars

// DEPOIS:
lines.push('--- CONTEXTO DO ATENDIMENTO ATUAL ---');
lines.push(`Etapa: ${context.stage_current}`);
// speech_intent traduzido para português (coleta_dado → "coletar informação" etc.)
// facts filtrados: .filter(([k]) => !k.startsWith('_')) — facts internos excluídos
// até 12 fatos (era 8)
// Turnos: "Cliente:" / "Enova:" (era "user:" / "assistant:")
// 150 chars/turno (era 100)
// OBJETIVO ATUAL com instrução explícita: "Uma pergunta só. Não antecipe próximas etapas."
// limite 8000 chars (era 4800)
```

#### 4. `callLlm` — referência atualizada

```typescript
// ANTES:
const systemPrompt = context ? buildDynamicSystemPrompt(context) : SYSTEM_PROMPT;

// DEPOIS:
const systemPrompt = context ? buildDynamicSystemPrompt(context) : SYSTEM_PROMPT_BASE;
```

#### 5. `LLM_MAX_TOKENS` 300 → 400

Prompt mais rico exige resposta com mais espaço para cobrir um objetivo completo.

---

## Invariantes preservados

- LLM permanece soberano da fala — SYSTEM_PROMPT_BASE é instrução, não script
- Core permanece soberano de stage, facts e gates — sem alteração em engine.ts
- `OPENAI_API_KEY` nunca em log/error/response
- Facts `_*` (internos) filtrados do prompt dinâmico
- Fallback seguro: `callLlm` sem context → usa `SYSTEM_PROMPT_BASE` diretamente
- Zero promessa de aprovação no prompt (regra explícita na seção REGRAS INVIOLÁVEIS)

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

- `src/core/engine.ts`, `topo-gates.ts`, `meio-a-gates.ts`, `meio-b-gates.ts`
- `src/supabase/`, `src/meta/canary-pipeline.ts`
- `panel-nextjs/`, `wrangler.toml`
- Zero migration, zero schema, zero flags

---

## Risco documentado

Prompt mais longo aumenta custo de tokens por chamada. Mitigado por:
- Limite de 8000 chars em `buildDynamicSystemPrompt`
- `LLM_MAX_TOKENS=400` — resposta não cresce proporcionalmente ao prompt base
- `gpt-4o-mini` tem custo reduzido por token

---

## Rollback

```bash
git revert 6cb5a3c
```

Seguro: 1 arquivo, funções puras, zero schema, zero migration, zero flags. Reverte para SYSTEM_PROMPT minimalista de 7 linhas.
