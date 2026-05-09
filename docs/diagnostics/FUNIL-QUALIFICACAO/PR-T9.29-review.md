# PR-T9.29-review — diagnóstico runtime pendingObjective no log text_extractor.result

**Data:** 2026-05-09
**Branch:** fix/t9.29-diag-pending-objective
**Tipo:** PR-DIAG / telemetria não comportamental

---

## Arquivo e linha modificados

`src/meta/canary-pipeline.ts` — linha 268 (diagLog `text_extractor.result`)

## Snippet adicionado

```typescript
diagLog('text_extractor.result', {
  stage_current: currentStage,
  facts_extracted_count: extractedKeys.length,
  fact_keys: extractedKeys,
  persisted_facts_count: Object.keys(persistedFacts).length,
  persisted_fact_keys: Object.keys(persistedFacts),
  pending_objective: pendingObjective ?? null,         // NOVO T9.29
  pending_objective_length: pendingObjective?.length ?? 0, // NOVO T9.29
});
```

`pendingObjective` já estava em escopo (`canary-pipeline.ts:230`) derivado de `persistedFacts['_next_objective']`. Os 2 campos são adicionados ao objeto de log existente sem nenhuma nova variável ou lógica.

## Motivo da mudança de arquivo

O log `text_extractor.result` existe em `canary-pipeline.ts:268`, não em `text-extractor.ts`. O contrato T9.29 original assumia o log em `text-extractor.ts` — após diagnóstico, a restrição "NÃO mexer em canary-pipeline.ts" foi revogada **apenas para este log específico**.

## Confirmação de smokes

```
smoke:core:text-extractor  → 124/124 PASS
smoke:meta:canary          → 41/41 PASS
```

## Mudanças comportamentais

Nenhuma. Zero alteração em lógica de extração, gates, parsers ou pipeline. Apenas 2 campos adicionais ao payload de log existente.

## Como ler no wrangler tail

```json
{
  "diag": "text_extractor.result",
  "stage_current": "discovery",
  "facts_extracted_count": 1,
  "fact_keys": ["customer_goal"],
  "persisted_facts_count": 3,
  "persisted_fact_keys": ["_next_objective", "nacionalidade", "customer_goal"],
  "pending_objective": "perguntar_rnm_e_validade",
  "pending_objective_length": 24
}
```

`pending_objective: null` indica que não havia `_next_objective` persistido (primeiro turno ou turno sem objective pendente).
`pending_objective_length: 0` idem.
