# PR-T9.17A-hotfix — avancar_para_qualification_civil: instrui processo, não estado_civil

**PR:** #245 — https://github.com/brunovasque/Enova-2/pull/245
**Branch:** `fix/t9.17a-next-objective-processo`
**Base:** `main` (commit `f13a8db` — merge PR #244)
**Commit:** `62954d5`
**Data:** 2026-05-06
**Tipo:** correcao_incidental — 1 arquivo, 1 linha

---

## Problema

O mapeamento de `avancar_para_qualification_civil` em `semantic-next-objective.ts` instruía o LLM a perguntar o estado civil:

```typescript
'avancar_para_qualification_civil':
  'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
```

Esse código é emitido pelo Core quando o lead **avança do discovery para qualification_civil** — ou seja, o estado civil **já foi coletado** no topo do funil. A instrução correta é perguntar o **processo** (solo/conjunto/composição familiar).

---

## Correção

### `src/core/semantic-next-objective.ts`

```typescript
// ANTES:
'avancar_para_qualification_civil':
  'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',

// DEPOIS:
'avancar_para_qualification_civil':
  'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) '
  + 'ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).',
```

---

## Contexto: quando cada objective dispara

| Objective | Quando dispara | Instrução correta |
|---|---|---|
| `coletar_estado_civil` | Meio A — estado_civil ausente | Perguntar estado civil |
| `avancar_para_qualification_civil` | Topo → civil — transition | Perguntar processo |
| `coletar_processo` | Meio A — processo ausente | Perguntar processo |

`avancar_para_qualification_civil` é o next_objective emitido quando o topo (discovery) libera o avanço. Nesse momento o lead já tem `customer_goal`, `nome_completo`, `nacionalidade` e `estado_civil` (coletado no topo via TOPO_NEXT_OBJECTIVES). O Core avança para qualification_civil e o LLM deve perguntar o próximo fact obrigatório do Meio A: `processo`.

---

## Fora de escopo (zero diff)

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
git revert 62954d5
```

Seguro: 1 arquivo, 1 linha, zero schema, zero migration, zero flags.
