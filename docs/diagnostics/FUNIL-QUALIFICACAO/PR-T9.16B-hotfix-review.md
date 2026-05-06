# PR-T9.16B-hotfix — Instrução greeting v3 ausente do main

**PR:** #242 — https://github.com/brunovasque/Enova-2/pull/242
**Branch:** `fix/t9.16b-greeting-fix`
**Base:** `main` (commit `e993dfc` — merge PR #241)
**Commit cherry-picked:** `6113251` → `112b527` (cherry-pick sha)
**Data:** 2026-05-05
**Tipo:** PR-FIX (hotfix pós-merge de #241)

---

## Contexto

A PR #241 foi mergeada incluindo commits até `2d61841` (docs v2). O commit `6113251`
(v3 — refinamento da instrução `apresentar_e_verificar_conhecimento`) ficou fora do merge
por ter sido adicionado à branch após o merge acontecer.

**Commit `b170acf` (isFirstTurn fix):** já estava em main via PR #241 — cherry-pick resultou
em diff vazio e foi pulado (`--skip`) corretamente.

**Commit `6113251` (instrução greeting v3):** ausente do main — cherry-pick aplicado limpo.

---

## Mudança (1 arquivo)

### `src/core/semantic-next-objective.ts`

```typescript
// ANTES (em main após PR #241):
'apresentar_e_verificar_conhecimento':
  'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar de forma '
  + 'natural se o cliente já conhece o programa ou se gostaria de entender como funciona. '
  + 'Tom: acolhedor, sem pressão.',

// DEPOIS (esta PR):
'apresentar_e_verificar_conhecimento':
  'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar se o cliente '
  + 'já conhece o programa MCMV. '
  + 'Se já conhece: agradecer e pedir o nome completo para iniciar o atendimento. '
  + 'Se não conhece: explicar brevemente em 1-2 frases que o MCMV facilita a compra do '
  + 'imóvel com condições especiais dependendo do perfil, e já aproveitar o gancho para '
  + 'pedir o nome completo para orientar melhor. '
  + 'Objetivo: sair dessa mensagem com o nome do cliente coletado ou a pergunta feita.',
```

**Objetivo:** LLM apresenta Enova, verifica conhecimento MCMV e já coleta (ou encaminha para
coleta de) `nome_completo` em um único turno — eliminando um turno intermediário antes de
avançar a rota canônica.

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `smoke` (core) | **28/28 PASS** |
| `smoke:core:text-extractor` | 89/89 PASS |
| `smoke:meta:canary` | 41/41 PASS |
| `prove:t9.15h-facts-persistence` | 34/34 PASS |
| `prove:t9.14-reverse-mapper` | 19/19 PASS |

---

## Rollback

```bash
git revert 112b527
```

Seguro: apenas string no SEMANTIC_MAP — sem alteração de lógica, gates, schema ou flags.

---

## Próxima ação

Vasques merge esta PR → repetir T9.15B-PROVA-REAL-CANARY com greeting otimizado.
