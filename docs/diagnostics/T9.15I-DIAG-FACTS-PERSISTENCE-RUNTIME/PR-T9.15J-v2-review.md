# PR-T9.15J — Review v2 (FIX2: SELECT→upsert por PK)
# Gerado: 2026-05-05
# Branch: fix/t9.15j-facts-persistence-wa-id
# PR: #238 — https://github.com/brunovasque/Enova-2/pull/238
# Commits: 0e48df7 (fix1: lead_id→wa_id) + 69f3bf3 (fix2: SELECT→upsert por id PK)

---

## Por que FIX2

`supabaseUpsert` usa `Prefer: resolution=merge-duplicates` sem `on_conflict` explícito.
PostgREST determina o conflict target pelos UNIQUE constraints do schema.
`enova_state.wa_id` não tem UNIQUE constraint documentada (file 28, 29).
Sem UNIQUE em `wa_id`, o upsert por `{ wa_id, last_context, updated_at }` sempre INSERT nova linha — cada turno criaria duplicata em `enova_state`.

**Fix:** SELECT por `wa_id` → obtém `id` (PK) da row existente → upsert por `id` (conflict target garantido).

---

## Título

`fix(T9.15J): facts persistence — lead_id → wa_id em enova_state read/write`

---

## Commits desta PR

| Commit | Descrição |
|--------|-----------|
| `0e48df7` | fix(T9.15J): parâmetro/filtro lead_id→wa_id em read/write + canary-pipeline.ts |
| `69f3bf3` | fix(T9.15J-FIX2): writeLeadAccumulatedFacts — SELECT by wa_id → upsert by id (PK) |
| `978d93d` | docs: PR-T9.15J-review.md (review v1) |
| `adb4166` | diag: 29-upsert-conflict-key.md |

---

## Diff acumulado (estado final dos 2 arquivos modificados)

### src/supabase/crm-store.ts

```diff
@@ readLeadAccumulatedFacts @@
-export async function readLeadAccumulatedFacts(cfg, lead_id: string) {
-  filters: { lead_id: `eq.${lead_id}` }
+export async function readLeadAccumulatedFacts(cfg, wa_id: string) {
+  filters: { wa_id: `eq.${wa_id}` }
 }

@@ writeLeadAccumulatedFacts — comentário @@
- * Upsert cirúrgico: wa_id + last_context + updated_at.
+ * SELECT por wa_id → upsert por id (PK) — evita duplicatas sem depender de UNIQUE em wa_id.

@@ writeLeadAccumulatedFacts — corpo @@
-export async function writeLeadAccumulatedFacts(cfg, lead_id: string, facts) {
-  try {
-    const row: EnovaStateRow = {
-      lead_id,
-      last_context: JSON.stringify(facts),
-      updated_at: new Date().toISOString(),
-    };
-    const result = await supabaseUpsert<EnovaStateRow>(cfg, 'enova_state', row);
-    return { ok: result.ok, error: result.error };
-  } catch (e) {
-    return { ok: false, error: String(e) };
-  }
-}
+export async function writeLeadAccumulatedFacts(cfg, wa_id: string, facts) {
+  try {
+    // 1. Buscar row existente por wa_id para obter o id (PK)
+    const existing = await supabaseSelect<EnovaStateRow>(cfg, 'enova_state', {
+      filters: { wa_id: `eq.${wa_id}` },
+      limit: 1,
+    });
+    if (!existing.ok || existing.rows.length === 0) {
+      return { ok: false, error: 'no_existing_row_for_wa_id' };
+    }
+    const rowId = existing.rows[0].id;
+    if (!rowId) {
+      return { ok: false, error: 'existing_row_has_no_id' };
+    }
+    // 2. Upsert por id (PK) — conflict target garantido
+    const row: EnovaStateRow = {
+      id: rowId,
+      last_context: JSON.stringify(facts),
+      updated_at: new Date().toISOString(),
+    };
+    const result = await supabaseUpsert<EnovaStateRow>(cfg, 'enova_state', row);
+    return { ok: result.ok, error: result.error };
+  } catch (e) {
+    return { ok: false, error: String(e) };
+  }
+}
```

### src/meta/canary-pipeline.ts

```diff
-  persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
+  persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '');

-  lead_id_present: !!crmResult.lead_id,
+  wa_id_present: !!(event.wa_id),

-  const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
+  const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap);
```

---

## Fluxo de dados completo (estado final)

### read path (turno 2+)

```
event.wa_id = "554185260518"
  → readLeadAccumulatedFacts(supabaseCfg, "554185260518")
  → supabaseSelect('enova_state', { wa_id: 'eq.554185260518' })
  → retorna row com last_context = '{"customer_goal":"comprar_imovel"}'
  → parse JSON → persistedFacts = { customer_goal: "comprar_imovel" }
```

diagLog esperado:
```json
{"diag":"facts_persistence.read","ok":true,"persisted_count":1,"persisted_keys":["customer_goal"],"wa_id_present":true}
```

### write path (após Core decision)

```
event.wa_id = "554185260518"
factsMap = { customer_goal: "comprar_imovel", nome_completo: "Bruno Vasques" }

  → writeLeadAccumulatedFacts(supabaseCfg, "554185260518", factsMap)
  → supabaseSelect('enova_state', { wa_id: 'eq.554185260518' }) → id = "uuid-real-da-row"
  → supabaseUpsert('enova_state', { id: "uuid-real-da-row", last_context: '{"customer_goal":...}', updated_at: ... })
  → ON CONFLICT (id) DO UPDATE SET last_context=..., updated_at=...
  → ok=true
```

diagLog esperado:
```json
{"diag":"facts_persistence.write","ok":true,"facts_count":2,"fact_keys":["customer_goal","nome_completo"],"error":null}
```

---

## Comportamento de degradação graceful

| Cenário | Comportamento |
|---------|---------------|
| `enova_state` sem row para wa_id | `ok=false, error='no_existing_row_for_wa_id'` — sem crash, sem duplicata |
| row existe mas `id` ausente | `ok=false, error='existing_row_has_no_id'` — sem crash |
| Supabase indisponível | exceção capturada → `ok=false, error=String(e)` |
| diagLog facts_persistence.write | `ok=false` visível via wrangler tail (T9.15I) |

---

## Testes / Validação

| Suite | Resultado |
|-------|-----------|
| `npm run smoke` (core) | **PASSOU** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run smoke:core:text-extractor` | **81/81 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Plano de rollback

```bash
git revert 69f3bf3   # reverte FIX2 (SELECT→upsert por PK)
git revert 0e48df7   # reverte FIX1 (lead_id→wa_id)
```

Restaura comportamento com `crmResult.lead_id` (continua causando pg_code=22P02, idêntico ao pré-T9.15J). Zero impacto em lógica, dados ou outbound.

---

## Estado esperado em PROD após merge

T9.15B-PROVA-REAL-CANARY com 3 turnos deve mostrar:

```
Turno 1: facts_persistence.write: ok=true, facts_count=1 (customer_goal)
Turno 2: facts_persistence.read: persisted_count=1 (customer_goal do turno 1)
         core.facts_received: facts_count=2 (customer_goal + nome_completo)
         facts_persistence.write: ok=true, facts_count=2
Turno 3: facts_persistence.read: persisted_count=2
         core.facts_received: facts_count=3
         → stage_after=qualification_civil (gate 1 atendido)
```
