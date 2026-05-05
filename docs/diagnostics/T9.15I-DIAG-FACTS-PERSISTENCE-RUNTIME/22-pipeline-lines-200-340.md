# Diagnóstico T9.15I — 22 — src/meta/canary-pipeline.ts linhas 200-340
# Snapshot read-only: 2026-05-04
# Branch: fix/t9.15h-facts-persistence-topo

---

## Conteúdo completo linhas 200-340

```typescript
200
201      const stateResult = await getLeadState(coreBackend, crmResult.lead_id);
202      const currentStage = (
203        stateResult.found &&
204        stateResult.record?.stage_current &&
205        stateResult.record.stage_current !== 'unknown'
206          ? stateResult.record.stage_current
207          : 'discovery'
208      ) as LeadState['current_stage'];
209
210      // Bloco [B] — Extração de facts do texto WhatsApp real (T9.6 — BLK-03 fix)
211      // Função pura: sem I/O, nunca lança exceção.
212      // Texto completo do cliente nunca é logado.
213      const extractedFacts = extractFactsFromText(event.text_body ?? '', currentStage);
214      const extractedKeys = Object.keys(extractedFacts);
215
216      // T9.15H: Carregar facts acumulados de turnos anteriores (enova_state.last_context).
217      // crm_facts é writeBuffer-only — perde dados após restart de isolate Cloudflare Worker.
218      // last_context persiste o mapa de facts no Supabase real entre turnos/restarts.
219      let persistedFacts: Record<string, unknown> = {};
220      if (supabaseCfg) {
221        try {
222          persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
223        } catch { /* falha silenciosa — persisted facts = {} */ }
224      }
225
226      // Bloco [C] — Persistência de facts extraídos (status: 'pending')
227      // Facts ficam 'pending' até confirmação — LLM/operador promove para 'accepted'.
228      for (const [factKey, factValue] of Object.entries(extractedFacts)) {
229        await writeLeadFact(coreBackend, {
230          lead_id: crmResult.lead_id,
231          fact_key: factKey,
232          fact_value: factValue,
233          confidence: factKey === 'renda_principal' ? 0.9 : 0.7,
234          status: 'pending',
235          source_turn_id: crmResult.turn_id ?? null,
236        });
237      }
238
239      // T9.15H: Injetar facts de turnos anteriores no writeBuffer (se não sobrescritos pelo turno atual).
240      // Garante que getLeadFacts retorne o acumulado completo sem exigir tabela Supabase para crm_facts.
241      for (const [factKey, factValue] of Object.entries(persistedFacts)) {
242        if (!(factKey in extractedFacts)) {
243          await writeLeadFact(coreBackend, {
244            lead_id: crmResult.lead_id,
245            fact_key: factKey,
246            fact_value: factValue,
247            confidence: 0.8,
248            status: 'pending',
249            source_turn_id: null,
250          });
251        }
252      }
253
254      diagLog('text_extractor.result', {
255        stage_current: currentStage,
256        facts_extracted_count: extractedKeys.length,
257        fact_keys: extractedKeys,
258        persisted_facts_count: Object.keys(persistedFacts).length,
259        persisted_fact_keys: Object.keys(persistedFacts),
260      });
261
262      const factsResult = await getLeadFacts(coreBackend, crmResult.lead_id);
263      const factsMap: Record<string, unknown> = {};
264      for (const fact of factsResult.records) {
265        if (fact.status === 'accepted' || fact.status === 'pending') {
266          factsMap[fact.fact_key] = fact.fact_value;
267        }
268      }
269
270      cachedFacts = factsMap;
271
272      // Bloco [E] — Memória curta / histórico recente controlado (T9.10)
273      // Lê os últimos 3 turnos anteriores ao turno atual e sanitiza para o LLM.
274      // Nunca inclui turno atual (evita duplicação da mensagem do cliente).
275      // Apenas role: 'user' — CrmTurn não persiste reply_text da assistente.
276      // Texto completo do cliente nunca é logado.
277      try {
278        const timelineResult = await getLeadTimeline(coreBackend, crmResult.lead_id);
279        const currentTurnId = crmResult.turn_id ?? null;
280
281        recentHistory = timelineResult.records
282          .filter((turn) => turn.turn_id !== currentTurnId)
283          .slice(-3)
284          .map((turn) => ({
285            role: 'user' as const,
286            content: sanitizeRecentTurnText(turn.raw_input_summary, 100),
287          }))
288          .filter((turn) => turn.content.length > 0);
289
290        diagLog('short_memory.built', {
291          turns_total: timelineResult.records.length,
292          turns_included: recentHistory.length,
293        });
294      } catch (e) {
295        // Falha em memória curta nunca bloqueia LLM nem outbound.
296        diagLog('short_memory.built', { turns_total: 0, turns_included: 0, error: String(e) });
297      }
298
299      coreDecision = runCoreEngine({
300        lead_id: crmResult.lead_id,
301        current_stage: currentStage,
302        facts: factsMap,
303      });
304
305      await upsertLeadState(coreBackend, crmResult.lead_id, coreDecision);
306
307      // T9.15H: Persistir facts acumulados em enova_state.last_context para sobreviver restart do isolate.
308      // factsMap inclui todos os facts (anteriores + atuais). Core já tomou decisão com eles.
309      if (supabaseCfg) {
310        try {
311          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
312          diagLog('facts_persistence.write', {
313            ok: factsWriteResult.ok,
314            facts_count: Object.keys(factsMap).length,
315            fact_keys: Object.keys(factsMap),
316            error: factsWriteResult.ok ? null : factsWriteResult.error,
317          });
318        } catch { /* falha silenciosa — pipeline não bloqueia */ }
319      }
320
321      diagLog('core.decision', {
322        lead_id_present: true,
323        stage_current: coreDecision.stage_current,
324        stage_after: coreDecision.stage_after,
325        block_advance: coreDecision.block_advance,
326        decision_id: coreDecision.decision_id,
327      });
328
329      emitCanary(ctx, 'core.completed', 'completed', {
330        stage_current: coreDecision.stage_current,
331        stage_after: coreDecision.stage_after,
332      });
333    } catch (e) {
334      errors.push(`core_exception: ${String(e)}`);
335      diagLog('core.decision', {
336        error: String(e),
337        stage_current: 'unknown',
338        stage_after: 'discovery',
339      });
340      emitCanary(ctx, 'core.exception', 'failed', { error: String(e) });
```

---

## Análise estrutural do bloco Core (linhas 200-340)

### Estrutura de controle

```
try {                               ← abre em ~L198 (bloco Core completo)
  getLeadState (L201)
  extractFactsFromText (L213)       ← puro, sem I/O
  readLeadAccumulatedFacts (L222)   ← T9.15H read — dentro de try/catch inner
  writeLeadFact × N (L228-237)     ← extracted facts → writeBuffer
  writeLeadFact × M (L241-252)     ← persisted facts → writeBuffer (guarda !(key in extracted))
  diagLog text_extractor (L254)
  getLeadFacts (L262)               ← lê writeBuffer completo → factsMap
  cachedFacts = factsMap (L270)
  getLeadTimeline (L278)            ← dentro de try/catch inner
  runCoreEngine (L299)              ← Core Mecânico 2
  upsertLeadState (L305)            ← grava fase_conversa em enova_state
  writeLeadAccumulatedFacts (L311)  ← T9.15H write — dentro de try/catch inner
  diagLog core.decision (L321)
  emitCanary core.completed (L329)
} catch (e) {                       ← L333 — captura qualquer exceção do bloco Core
  errors.push(core_exception)       ← L334
  diagLog core.decision error (L335)
  emitCanary core.exception (L340)
}
```

### Pontos críticos identificados

#### 1. currentStage — fallback para 'discovery' (linhas 201-208)

```typescript
const currentStage = (
  stateResult.found &&
  stateResult.record?.stage_current &&
  stateResult.record.stage_current !== 'unknown'
    ? stateResult.record.stage_current
    : 'discovery'                       // ← fallback se não encontrado ou 'unknown'
) as LeadState['current_stage'];
```

Se `getLeadState` falhar ou retornar `stage_current='unknown'`, o Core recebe `discovery`. Isso é correto para a primeira conversa, mas incorreto se houver dado válido no Supabase que não foi lido.

#### 2. T9.15H read path — falha silenciosa (linhas 220-224)

```typescript
let persistedFacts: Record<string, unknown> = {};
if (supabaseCfg) {
  try {
    persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
  } catch { /* falha silenciosa — persisted facts = {} */ }
}
```

- Se `supabaseCfg === null` → `persistedFacts = {}` (sem leitura — T9.15H inativo)
- Se leitura falha → `persistedFacts = {}` (sem lançamento — pipeline nunca bloqueia)
- **Não há diagLog no read path** → falha silenciosa não é observável via `wrangler tail`

#### 3. Guarda de não-sobrescrita (linhas 241-252) — T9.15H

```typescript
for (const [factKey, factValue] of Object.entries(persistedFacts)) {
  if (!(factKey in extractedFacts)) {    // ← só injeta se NÃO existe no turno atual
    await writeLeadFact(coreBackend, {
      ...
      confidence: 0.8,
      source_turn_id: null,             // ← facts persisted não têm turn_id do turno atual
    });
  }
}
```

Facts do turno atual (L228-237) sempre prevalecem sobre persisted (L241-252) para a mesma key.

#### 4. diagLog observável — `text_extractor.result` (linhas 254-260)

```typescript
diagLog('text_extractor.result', {
  stage_current: currentStage,
  facts_extracted_count: extractedKeys.length,
  fact_keys: extractedKeys,
  persisted_facts_count: Object.keys(persistedFacts).length,   // ← conta persisted lidos
  persisted_fact_keys: Object.keys(persistedFacts),            // ← lista keys persisted
});
```

**Este é o diagLog mais rico para diagnóstico T9.15H**: mostra simultaneamente quantos facts foram extraídos do turno atual E quantos foram carregados do Supabase.

```bash
wrangler tail nv-enova-2 --format pretty --search "text_extractor.result"
```

#### 5. factsMap — construção e uso (linhas 262-270)

```typescript
const factsResult = await getLeadFacts(coreBackend, crmResult.lead_id);
const factsMap: Record<string, unknown> = {};
for (const fact of factsResult.records) {
  if (fact.status === 'accepted' || fact.status === 'pending') {
    factsMap[fact.fact_key] = fact.fact_value;   // ← last-write-wins para duplicatas
  }
}
cachedFacts = factsMap;    // ← usado posteriormente para LLM context
```

`factsMap` é o acumulado final que vai para `runCoreEngine` (L302) e para `writeLeadAccumulatedFacts` (L311). Inclui extracted + persisted.

#### 6. T9.15H write path — falha silenciosa com diagLog (linhas 309-318)

```typescript
if (supabaseCfg) {
  try {
    const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
    diagLog('facts_persistence.write', {
      ok: factsWriteResult.ok,
      facts_count: Object.keys(factsMap).length,
      fact_keys: Object.keys(factsMap),
      error: factsWriteResult.ok ? null : factsWriteResult.error,
    });
  } catch { /* falha silenciosa — pipeline não bloqueia */ }
}
```

- `diagLog('facts_persistence.write')` é chamado **somente se não lançar exceção** antes do diagLog
- Se `writeLeadAccumulatedFacts` retornar `ok: false` → log com `error` preenchido (observável)
- Se `writeLeadAccumulatedFacts` lançar exceção → catch silencioso, **sem log** (não observável)

#### 7. Catch externo (linhas 333-340) — captura todo o bloco Core

```typescript
} catch (e) {
  errors.push(`core_exception: ${String(e)}`);
  diagLog('core.decision', { error: String(e), ... });
  emitCanary(ctx, 'core.exception', 'failed', { error: String(e) });
```

Qualquer exceção não capturada nos try/catch internos (L220-224, L309-318, L277-297) cai aqui. Se `runCoreEngine` ou `upsertLeadState` lançarem → `diagLog('core.decision', { error })` é o sinal.

---

## Diagrama de sequência (linhas 201-340)

```
L201  getLeadState          → currentStage (ou 'discovery')
L213  extractFactsFromText  → extractedFacts (pure, no I/O)
L222  readLeadAccumulatedFacts  → persistedFacts (T9.15H, try/catch silent)
L228  writeLeadFact ×N      → writeBuffer [extracted]
L241  writeLeadFact ×M      → writeBuffer [persisted, guarda key]
L254  diagLog text_extractor.result   ← OBSERVABLE (persisted_facts_count)
L262  getLeadFacts          → factsResult (writeBuffer)
L263  build factsMap        → { ...persisted, ...extracted (current wins) }
L270  cachedFacts = factsMap
L278  getLeadTimeline       → recentHistory (try/catch inner)
L299  runCoreEngine         → coreDecision
L305  upsertLeadState       → enova_state.fase_conversa
L311  writeLeadAccumulatedFacts → enova_state.last_context (T9.15H)
L312  diagLog facts_persistence.write   ← OBSERVABLE (T9.15H write)
L321  diagLog core.decision            ← OBSERVABLE (stage_current/after)
L329  emitCanary core.completed
L333  } catch → diagLog core.decision error + emitCanary core.exception
```

---

## Tags observáveis via wrangler tail (por ordem de execução)

| Ordem | Tag diagLog | Linha | Conteúdo chave para T9.15H |
|-------|-------------|-------|---------------------------|
| 1 | `text_extractor.result` | 254 | `persisted_facts_count`, `persisted_fact_keys` |
| 2 | `short_memory.built` | 290 | `turns_total`, `turns_included` |
| 3 | `facts_persistence.write` | 312 | `ok`, `facts_count`, `fact_keys`, `error` |
| 4 | `core.decision` | 321 | `stage_current`, `stage_after`, `block_advance` |
