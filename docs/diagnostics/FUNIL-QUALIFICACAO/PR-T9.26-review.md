# PR-T9.26-review — Captura cross-stage regime_trabalho/renda_principal + rnm negativas-primeiro + estado_civil_p3 semantic

**PR:** #263
**Branch:** `fix/t9.26-captura-cross-stage`
**Base:** `main` (commit `ec9d515`)
**Commit:** `08c2bec`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 2 arquivos

---

## Problemas e Fixes

### FIX 4 — rnm_valido: negativas primeiro (bug crítico)

**Bug:** Bloco contextual em `extractDiscovery` (linhas 167-180) checava positivos antes de negativos:
```typescript
if (contains(n, 'sim', 'tenho', 'possuo', ...)) { facts['rnm_valido'] = true; }
else if (contains(n, 'nao', 'nao tenho', ...)) { facts['rnm_valido'] = false; }
```
"Nao tenho RNM" após normalização = "nao tenho rnm" → contém "tenho" → `rnm_valido = true` (errado).

**Fix:** Negativas primeiro + guard `=== undefined` + semantic alternative:
```typescript
if (facts['rnm_valido'] === undefined) {
  if (
    pendingObjective === 'perguntar_rnm_e_validade' ||
    pendingObjective === 'Perguntar se o cliente possui RNM...'
  ) {
    if (contains(n, 'nao tenho', 'nao possuo', 'nao', 'tem validade', ...)) {
      facts['rnm_valido'] = false;
    } else if (contains(n, 'sim', 'tenho', 'possuo', 'prazo indeterminado', ...)) {
      facts['rnm_valido'] = true;
    }
  }
}
```

**Por que "prazo determinado" não dispara negativos para "prazo indeterminado":**
`'prazo indeterminado'` NÃO contém `'prazo determinado'` como substring — o prefixo `in` impede o match.

### FIX 1 — estado_civil_p3: casado_civil em ordem + semantic + uniao_estavel limpo

**Problemas:**
1. Apenas pendingObjective opaco `coletar_estado_civil_p3` — sem semantic fallback
2. `casado` vinha antes de `casado no civil` (sem impacto de valor, mas semanticamente incorreto)
3. `junto`, `junta`, `namorado`, `namorada` na uniao_estavel — falso positivo potencial ("vou junto", "meu namorado")

**Fix:**
```typescript
if (
  pendingObjective === 'coletar_estado_civil_p3' ||
  pendingObjective === 'Perguntar qual é o estado civil do familiar ou pessoa que vai entrar na composição. Solteiro(a), casado(a) no civil, união estável ou divorciado(a).'
) {
  // casado no civil → casado (especificidade maior primeiro)
  else if (contains(n, 'casado no civil', 'casada no civil', 'casamento civil')) { ... }
  else if (contains(n, 'casado', 'casada')) { ... }
  // uniao_estavel: removidos junto/junta/namorado/namorada
  else if (contains(n, 'uniao estavel', 'uniao', 'amasiado', 'amasiada')) { ... }
}
```

### FIX 2 — regime_trabalho cross-stage em extractQualificationCivil

**Problema:** Cliente responde regime de trabalho quando LLM já perguntou no turno em que ainda está em `qualification_civil`. Stage avança no próximo turno — fact se perdia.

**Fix:** Bloco cross-stage antes de `return facts;` em `extractQualificationCivil`:
```typescript
if (facts['regime_trabalho'] === undefined) {
  if (
    pendingObjective === 'avancar_para_qualification_renda' ||
    pendingObjective === 'coletar_regime_trabalho' ||
    pendingObjective === 'Perguntar regime de trabalho e renda mensal.' ||
    pendingObjective === 'Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime.'
  ) {
    // mesmos ramos de extractQualificationRenda
  }
}
```

### FIX 3 — renda_principal cross-stage em extractQualificationCivil

Idem FIX 2, para renda. Usa `extractRenda(original)` — exige texto original com `R$`.

**Mudança de assinatura necessária:** `extractQualificationCivil` não recebia `original`. Adicionado:
```typescript
// antes:
function extractQualificationCivil(n: string, pendingObjective?: string)
// depois:
function extractQualificationCivil(n: string, original: string, pendingObjective?: string)
```
Call site (`extractFactsFromText`) atualizado: `extractQualificationCivil(n, text, pendingObjective)`.

---

## Smoke tests adicionados (CTX25-CTX30)

| # | Descrição | Resultado esperado |
|---|-----------|-------------------|
| CTX25 | "Nao tenho" + perguntar_rnm_e_validade + discovery | rnm_valido=false |
| CTX26 | "Tenho prazo indeterminado" + perguntar_rnm_e_validade + discovery | rnm_valido=true |
| CTX27 | "casado no civil" + coletar_estado_civil_p3 + qualification_civil | estado_civil_p3=casado_civil |
| CTX28 | "Estamos em uniao estavel" + coletar_estado_civil_p3 + qualification_civil | estado_civil_p3=uniao_estavel |
| CTX29 | "carteira assinada" + coletar_regime_trabalho + qualification_civil | regime_trabalho=clt |
| CTX30 | "Ganho R$ 2.000 por mes" + avancar_para_qualification_renda + qualification_civil | renda_principal=2000 |

---

## Invariantes preservados

- `src/core/engine.ts` — sem alteração
- `src/core/semantic-next-objective.ts` — sem alteração
- `src/meta/canary-pipeline.ts` — sem alteração
- Extrator é função pura: zero I/O, zero side effects
- LLM soberano da fala; Core soberano de stage/facts/gates

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke:core:text-extractor` | **111/111 PASS** (CTX25-CTX30 adicionados, era 105) |
| `npm run smoke` | **PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |

---

## Rollback

```bash
git revert 08c2bec
```

Seguro: 2 arquivos, função pura, zero schema, zero migration, zero flags.
