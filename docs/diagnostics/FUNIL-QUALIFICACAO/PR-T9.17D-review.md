# PR-T9.17D-review — captura processo em discovery + reforço de foco nas perguntas do LLM

**PR:** #248 — https://github.com/brunovasque/Enova-2/pull/248
**Branch:** `fix/t9.17d-processo-discovery`
**Base:** `main` (commit `aec49b5` — estado pós-PR #247)
**Commit:** `3907d64`
**Data:** 2026-05-06
**Tipo:** PR-IMPL — correcao_incidental — 3 arquivos

---

## Problemas corrigidos

### Problema 1: `processo` perdido quando cliente responde em stage=discovery

Ao avançar do topo para `qualification_civil`, o Core emite `AVANCAR_PARA_CIVIL` mas o stage registrado ainda é `discovery` no turno em que o cliente responde. O router de `extractFactsFromText` direcionava para `extractDiscovery`, que não tinha bloco de captura para `processo` via `pendingObjective`. O fact era perdido e o Meio A ficava sem `processo` no próximo turno.

### Problema 2: LLM fazia 2 perguntas por turno

Os objectives `perguntar_nacionalidade`, `Perguntar estado civil...` (literal) e `avancar_para_qualification_civil` não tinham instrução explícita de "uma pergunta só". O LLM respondia à pergunta atual e já antecipava a próxima do funil.

---

## Correções

### `src/core/text-extractor.ts` — `extractDiscovery`

2 blocos novos adicionados após bloco `alternativa_rnm`:

```typescript
// processo — captura contextual quando sistema aguardava resposta sobre processo (T9.17D)
if (facts['processo'] === undefined) {
  if (
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.' ||
    pendingObjective === 'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).'
  ) {
    if (contains(n, 'sozinho', 'sozinha', 'so eu', 'apenas eu', 'eu so', 'individual')) {
      facts['processo'] = 'solo';
    } else if (contains(n, 'junto', 'conjuge', 'esposa', 'marido', ...)) {
      facts['processo'] = 'conjunto';
    } else if (contains(n, 'mae', 'pai', 'irma', 'irmao', ...)) {
      facts['processo'] = 'composicao_familiar';
    }
  }
}

// estado_civil — captura contextual em discovery via pendingObjective (T9.17D)
if (facts['estado_civil'] === undefined) {
  if (
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.'
  ) {
    if (contains(n, 'solteiro', 'solteira')) facts['estado_civil'] = 'solteiro';
    else if (contains(n, 'casado', 'casada')) facts['estado_civil'] = 'casado_civil';
    // ...
  }
}
```

Invariantes: guard `=== undefined` em ambos; funções puras; sem I/O; sem exceções.

### `src/core/semantic-next-objective.ts` — 3 mapeamentos

```typescript
// ANTES:
'perguntar_nacionalidade':
  'Perguntar se o cliente é brasileiro(a) ou estrangeiro(a).',

// DEPOIS:
'perguntar_nacionalidade':
  'Perguntar APENAS se o cliente é brasileiro(a) ou estrangeiro(a). '
  + 'Não fazer mais nenhuma pergunta neste turno.',

// ANTES (literal):
'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
  'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) '
  + 'ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).',

// DEPOIS (literal):
'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
  'Perguntar APENAS se o cliente pretende comprar sozinho(a) ou terá alguém junto '
  + 'no processo — cônjuge, familiar ou parceiro(a). Uma pergunta só. Não perguntar mais nada.',

// ANTES (snake_case):
'avancar_para_qualification_civil':
  'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) '
  + 'ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).',

// DEPOIS (snake_case):
'avancar_para_qualification_civil':
  'Perguntar APENAS se o cliente pretende comprar sozinho(a) ou terá alguém junto '
  + 'no processo — cônjuge, familiar ou parceiro(a). Uma pergunta só. Não perguntar mais nada.',
```

---

## Novos testes

### `src/core/text-extractor-smoke.ts`

- **CTX21:** `"sozinho"` + `pendingObjective='Estado civil coletado...'` + `stage=discovery` → `processo=solo`
- **CTX22:** `"com minha esposa"` + `pendingObjective='Estado civil coletado...'` + `stage=discovery` → `processo=conjunto`

---

## Fora de escopo (zero diff)

- `src/core/engine.ts`, `topo-gates.ts`, `meio-a-gates.ts`
- `src/llm/client.ts`, `src/supabase/`, `src/meta/canary-pipeline.ts`
- `panel-nextjs/`, `wrangler.toml`
- Zero migration, zero schema, zero flags

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **103/103 PASS** (+2 em relação a 101) |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Risco documentado

O bloco de `processo` em discovery usa o mapeamento semântico traduzido como chave de `pendingObjective`. Se o mapper alterar o texto de saída, a chave de lookup fica desatualizada. Acoplamento intencional — alternativa seria passar o código opaco junto ao mapeamento, o que implicaria mudança de arquitetura maior.

---

## Rollback

```bash
git revert 3907d64
```

Seguro: 3 arquivos, funções puras, zero schema, zero migration, zero flags.
