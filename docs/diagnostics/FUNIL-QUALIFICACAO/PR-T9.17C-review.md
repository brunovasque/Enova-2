# PR-T9.17C-review — AVANCAR_PARA_CIVIL instrui processo, não re-pergunta estado_civil

**PR:** #247 — https://github.com/brunovasque/Enova-2/pull/247
**Branch:** `fix/t9.17c-avancar-civil-processo`
**Base:** `main` (commit `d54f413` — estado pós-PR #246)
**Commit:** `0a6278c`
**Data:** 2026-05-06
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 1 mapeamento

---

## Problema

`TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL` emite a string literal:

```
'Perguntar estado civil: solteiro, casado, união estável ou divorciado.'
```

O mapper (`semantic-next-objective.ts`) traduzia isso para:

```typescript
'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
  'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
```

Ambas as versões perguntam o **estado civil** — mas `AVANCAR_PARA_CIVIL` é emitido quando o topo avança para `qualification_civil`, momento em que o estado civil **já foi coletado**. O LLM recebia instrução de re-perguntar um dado já existente, causando loop ou confusão no cliente.

### Relação com PR #245

PR #245 corrigiu o mapeamento da chave snake_case `'avancar_para_qualification_civil'` → processo.
Porém o Core emite a string literal `'Perguntar estado civil...'` (sem sufixos `(a)`), não a chave snake_case.
Ambas as chaves coexistiam no mapper; cada uma apontava para um caminho diferente de entrada.
Este fix fecha a lacuna da chave literal.

---

## Correção

### `src/core/semantic-next-objective.ts`

```typescript
// ANTES:
  // Topo → civil: já semi-semântico na origem (TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL)
  // Mapper padroniza para versão canônica com "(a)".
  'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',

// DEPOIS:
  // Topo → civil: AVANCAR_PARA_CIVIL emitido quando estado_civil já foi coletado no topo.
  // Objetivo correto: perguntar processo (solo/conjunto), não re-perguntar estado civil.
  'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
    'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) '
    + 'ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).',
```

---

## Contexto: quando cada objective dispara

| Objective | Quando dispara | Instrução correta |
|---|---|---|
| `coletar_estado_civil` | Meio A — `estado_civil` ausente | Perguntar estado civil |
| `avancar_para_qualification_civil` *(snake_case)* | Transition — corrigido em PR #245 | Perguntar processo |
| `'Perguntar estado civil: solteiro...'` *(literal)* | `TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL` | **Este fix** → Perguntar processo |
| `coletar_processo` | Meio A — `processo` ausente | Perguntar processo |

---

## Fora de escopo (zero diff)

- Todos os outros arquivos — zero alteração

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **101/101 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Rollback

```bash
git revert 0a6278c
```

Seguro: 1 arquivo, 1 linha de mapeamento, zero schema, zero migration, zero flags.
