# 21 — F2: Gaps críticos no text-extractor e semantic-next-objective

**Data:** 2026-05-06
**Branch:** fix/t9.16c-greeting-contextual
**Comandos executados:**
- `grep -n "composition_actor|dependents|dependents_count|dependents_applicable|p3_required" src/core/text-extractor.ts`
- `grep -n "corrigir_processo|coletar_composition|coletar_dependents|coletar_autonomo" src/core/semantic-next-objective.ts`
- `src/core/text-extractor.ts` linhas 200–280

---

## 1. Grep: composition_actor / dependents / p3_required em text-extractor.ts

**Resultado:** *(sem saída — zero matches)*

Nenhuma linha em `src/core/text-extractor.ts` contém:
- `composition_actor`
- `dependents`
- `dependents_count`
- `dependents_applicable`
- `p3_required`

---

## 2. Grep: objectives de coleta em semantic-next-objective.ts

**Resultado:** *(sem saída — zero matches)*

Nenhuma linha em `src/core/semantic-next-objective.ts` contém:
- `corrigir_processo`
- `coletar_composition`
- `coletar_dependents`
- `coletar_autonomo`

---

## 3. Linhas 200–280 de src/core/text-extractor.ts — função extractQualificationCivil

```typescript
// L200–202: final do bloco extractVisit (alternativa_rnm)
facts['alternativa_rnm'] = 'tem_familiar_brasileiro';
// ...
return facts;

// L207–279: função extractQualificationCivil
function extractQualificationCivil(n: string, pendingObjective?: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // Contextual: estado_civil (pendingObjective = coletar_estado_civil / avancar_para_qualification_civil)
  if (
    pendingObjective === 'coletar_estado_civil' ||
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'Perguntar estado civil: solteiro(a), casado(a), ...'
  ) {
    // solteiro / casado_civil / uniao_estavel / divorciado / viuvo
  }

  // Contextual: processo (pendingObjective = coletar_processo)
  if (pendingObjective === 'coletar_processo') {
    // solo / conjunto
    // NOTA: composicao_familiar NÃO está no bloco contextual
  }

  // Keywords: estado_civil (fallback quando contextual não resolveu)
  if (facts['estado_civil'] === undefined) {
    // sou solteiro/casado no civil/uniao estavel/divorciado/viuvo
  }

  // Keywords: processo (fallback quando contextual não resolveu)
  if (facts['processo'] === undefined) {
    // sozinho → solo
    // eu e minha esposa/meu marido → conjunto
    // com minha mãe/familiar/irmã/filho → composicao_familiar
  }

  return facts;
}
```

---

## 4. Análise consolidada de gaps

### Facts com extractor — qualification_civil

| Fact | Contextual | Keywords | Valores cobertos |
|---|---|---|---|
| `estado_civil` | ✓ (`coletar_estado_civil`, `avancar_para_qualification_civil`) | ✓ | `solteiro`, `casado_civil`, `uniao_estavel`, `divorciado`, `viuvo` |
| `processo` | ✓ (`coletar_processo`) mas **sem** `composicao_familiar` | ✓ (inclui `composicao_familiar`) | `solo`, `conjunto`, `composicao_familiar` |

**Lacuna processo contextual:** O bloco contextual de `coletar_processo` cobre apenas `solo` e `conjunto`. O valor `composicao_familiar` só é capturado pelo bloco keyword — se o cliente usar palavras-chave de conjuge/cônjuge no contexto `coletar_processo`, pode ser classificado erroneamente como `conjunto`.

### Facts SEM extractor — qualification_civil

| Fact | Stage | Extrator texto | Objective semântico |
|---|---|---|---|
| `composition_actor` | qualification_civil | ✗ ausente | ✗ ausente |
| `p3_required` | qualification_civil | ✗ ausente | ✗ ausente |
| `dependents_applicable` | qualification_civil | ✗ ausente | ✗ ausente |
| `dependents_count` | qualification_civil | ✗ ausente | ✗ ausente |

### Facts SEM extractor — qualification_renda

| Fact | Stage | Extrator texto | Objective semântico |
|---|---|---|---|
| `autonomo_tem_ir` | qualification_renda | ✗ ausente | ✗ ausente (`coletar_autonomo_tem_ir` não mapeado) |
| `ctps_36` | qualification_renda | ✗ ausente | ✗ ausente |

---

## 5. Impacto no Core

### Meio B — gates travados por ausência de extractor

| Gate | Condição | Fact necessário | Extractor? |
|---|---|---|---|
| `G_REGIME_RENDA` (autonomo) | `autonomo_ir_required && !autonomo_tem_ir_detected` | `autonomo_tem_ir` | ✗ |
| `G_REGIME_RENDA` (solo baixa) | `low_income_solo_signal` | `processo` (Meio A) | ✓ (via Meio A) |

`coletar_autonomo_tem_ir` é o `next_objective` gerado por `evaluateMeioBRendaCriteria` quando `regime=autonomo`.
Sem mapeamento em `semantic-next-objective.ts` → LLM recebe código opaco.
Sem bloco em `text-extractor.ts` → resposta do cliente não é capturada → gate travado permanentemente.

### qualification_civil — facts de composição/dependentes

`composition_actor`, `p3_required`, `dependents_applicable`, `dependents_count` — nenhum deles tem:
1. Extractor de texto
2. Objective semântico mapeado

Se qualquer gate downstream depender desses facts, o fluxo trava sem recuperação mecânica.

---

## 6. Próximas PRs indicadas

| PR | Escopo | Tipo |
|---|---|---|
| T9.17A | DIAG: mapear quais gates usam composition_actor / dependents | PR-DIAG |
| T9.17B | IMPL: extractor + semantic-map para `autonomo_tem_ir` e `ctps_36` | PR-IMPL |
| T9.17C | IMPL: extractor + semantic-map para `composition_actor` / dependentes (se gates ativos) | PR-IMPL |
