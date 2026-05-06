# PR-T9.16B-v3 — Instrução de greeting com coleta de nome_completo embutida

**PR:** #241 (atualização de branch)
**Branch:** `fix/t9.16b-rnm-alternativa-greeting`
**Commit v3:** `6113251`
**Commits anteriores:** `9dc5585` (T9.16B base), `b170acf` (T9.16B-v2 isFirstTurn fix)
**Data:** 2026-05-05
**Tipo:** PR-FIX (refinamento de instrução semântica)

---

## Problema corrigido

**Antes:** A instrução `apresentar_e_verificar_conhecimento` apenas apresentava a Enova e perguntava se o cliente conhecia o programa. O LLM precisava de um turno adicional para pedir o `nome_completo` antes de continuar o funil.

**Consequência:** 2 turnos desperdiçados antes de coletar o primeiro fact obrigatório do funil (`nome_completo`), atrasando o avanço da rota canônica.

---

## Mudança (1 arquivo)

### `src/core/semantic-next-objective.ts`

```typescript
// ANTES:
'apresentar_e_verificar_conhecimento':
  'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar de forma '
  + 'natural se o cliente já conhece o programa ou se gostaria de entender como funciona. '
  + 'Tom: acolhedor, sem pressão.',

// DEPOIS:
'apresentar_e_verificar_conhecimento':
  'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar se o cliente '
  + 'já conhece o programa MCMV. '
  + 'Se já conhece: agradecer e pedir o nome completo para iniciar o atendimento. '
  + 'Se não conhece: explicar brevemente em 1-2 frases que o MCMV facilita a compra do '
  + 'imóvel com condições especiais dependendo do perfil, e já aproveitar o gancho para '
  + 'pedir o nome completo para orientar melhor. '
  + 'Objetivo: sair dessa mensagem com o nome do cliente coletado ou a pergunta feita.',
```

**Objetivo da instrução:** LLM apresenta a Enova, verifica conhecimento do MCMV e já coleta (ou encaminha para coleta de) `nome_completo` — tudo em um único turno.

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
git revert 6113251
```

Seguro: apenas string no SEMANTIC_MAP — sem alteração de lógica, gates, schema ou flags.

---

## Próxima ação

Vasques merge PR #241 → repetir T9.15B-PROVA-REAL-CANARY com greeting otimizado.
