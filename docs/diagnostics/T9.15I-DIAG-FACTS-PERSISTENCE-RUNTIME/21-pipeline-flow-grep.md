# Diagnóstico T9.15I — 21 — grep flow crítico em canary-pipeline.ts
# Snapshot read-only: 2026-05-04
# Branch: fix/t9.15h-facts-persistence-topo

---

## Comando executado

```bash
grep -n "facts_persistence\|writeLeadAccumulated\|upsertLeadState\|runCoreEngine\|return\|throw" \
  src/meta/canary-pipeline.ts | head -80
```

---

## Output completo (11 linhas — arquivo tem apenas 4 `return` no total)

```
35:import { runCoreEngine } from '../core/engine.ts';
37:import { getLeadState, getLeadFacts, upsertLeadState, writeLeadFact, getLeadTimeline } from '../crm/service.ts';
41:import { writeEnovaLog, readLeadAccumulatedFacts, writeLeadAccumulatedFacts } from '../supabase/crm-store.ts';
78:  return value === true || value === 'true' || value === '1';
84:  return text
98:  return typeof value === 'string' ? value.trim() : '';
299:      coreDecision = runCoreEngine({
305:      await upsertLeadState(coreBackend, crmResult.lead_id, coreDecision);
311:          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
312:          diagLog('facts_persistence.write', {
619:  return {
```

**Verificação:** `grep -c "return" src/meta/canary-pipeline.ts` → `4`. Output acima é completo e exato.

---

## Análise: o que este grep revela

### 1. Imports críticos (linhas 35, 37, 41)

```typescript
// L35 — Core Mecânico 2
import { runCoreEngine } from '../core/engine.ts';

// L37 — CRM service (operações no writeBuffer)
import { getLeadState, getLeadFacts, upsertLeadState, writeLeadFact, getLeadTimeline } from '../crm/service.ts';

// L41 — T9.15H: funções de persistência de facts acumulados
import { writeEnovaLog, readLeadAccumulatedFacts, writeLeadAccumulatedFacts } from '../supabase/crm-store.ts';
```

**Confirmado**: T9.15H está corretamente importado na linha 41 — as 3 funções coexistem no mesmo import de `crm-store.ts`.

### 2. Helpers com return (linhas 78, 84, 98)

```typescript
78:  return value === true || value === 'true' || value === '1';  // isTrue() helper
84:  return text  // normalizeText() helper
98:  return typeof value === 'string' ? value.trim() : '';  // getString() helper
```

São funções auxiliares pequenas no topo do arquivo — irrelevantes para o fluxo principal.

### 3. Sequência crítica do pipeline principal (linhas 299-312)

```typescript
299:      coreDecision = runCoreEngine({        // ← Core Mecânico 2 decide
...
305:      await upsertLeadState(coreBackend, crmResult.lead_id, coreDecision);  // ← persiste stage_after em enova_state.fase_conversa
...
311:          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);  // ← T9.15H: persiste factsMap em enova_state.last_context
312:          diagLog('facts_persistence.write', {   // ← diagLog de prova
```

**Ordem canônica confirmada:**
1. `runCoreEngine` (L299) → produz `coreDecision`
2. `upsertLeadState` (L305) → grava `fase_conversa` em `enova_state`
3. `writeLeadAccumulatedFacts` (L311) → grava `last_context` em `enova_state` (T9.15H)
4. `diagLog('facts_persistence.write', ...)` (L312) → log observável para wrangler tail

**Ambos os upserts em `enova_state` são seguros**: `upsertLeadState` envia `fase_conversa` (não toca `last_context`); `writeLeadAccumulatedFacts` envia `last_context` (não toca `fase_conversa`). Confirmado via `Prefer: resolution=merge-duplicates` em `supabaseUpsert` (diag-11).

### 4. Return único da função principal (linha 619)

```typescript
619:  return {
```

A função `runCanaryPipeline` tem **apenas 1 return** explícito (linha 619 — resultado final). Todo o pipeline é sequencial dentro de try/catch sem returns intermediários. Isso confirma:
- Não há short-circuit antes da linha 311 (writeLeadAccumulatedFacts) exceto via exceção capturada
- O log `facts_persistence.write` (L312) é chamado **apenas se `supabaseCfg !== null`** (guarda na L309)
- Se SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes → supabaseCfg=null → sem write → sem log → wrangler tail vazio para esta search key

---

## Mapa de posição das linhas críticas

| Linha | Operação | Tabela Supabase afetada | Tag diagLog |
|-------|----------|------------------------|-------------|
| 220 | `readLeadAccumulatedFacts` | `enova_state` (SELECT) | (nenhuma — try/catch silencioso) |
| 299 | `runCoreEngine` | — | — |
| 305 | `upsertLeadState` | `enova_state` (UPSERT `fase_conversa`) | — |
| 311 | `writeLeadAccumulatedFacts` | `enova_state` (UPSERT `last_context`) | `facts_persistence.write` |
| 312 | `diagLog('facts_persistence.write')` | — | observable via `wrangler tail --search "facts_persistence.write"` |

---

## Implicação para diagnóstico de wrangler tail (diag-20)

Se `wrangler tail --search "facts_persistence.write"` não retornar nada durante uma conversa real:

| Causa possível | Como verificar |
|----------------|----------------|
| `supabaseCfg === null` (SUPABASE_URL ou KEY ausentes) | `wrangler tail --search "runtime.guard.in_memory_fallback"` |
| `writeLeadAccumulatedFacts` lançou exceção (try/catch silencioso) | `wrangler tail --search "facts_persistence"` (sem `.write`) |
| Conversa não atingiu linha 311 (crmResult.ok=false) | `wrangler tail --search "meta.prod.pipeline.result"` |
| `diagLog` desabilitado por flag | verificar `ENOVA2_PROD_DIAG_ENABLED` em wrangler.toml / painel CF |
