# canary-pipeline.ts — next_objective, last_context, factsMap, cachedFacts
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Comando: grep -n "next_objective|last_context|factsMap|cachedFacts" src/meta/canary-pipeline.ts | head -40

---

## Resultado do grep

```
194:  let cachedFacts: Record<string, unknown> = {};
216:      // T9.15H: Carregar facts acumulados de turnos anteriores (enova_state.last_context).
218:      // last_context persiste o mapa de facts no Supabase real entre turnos/restarts.
271:      const factsMap: Record<string, unknown> = {};
274:          factsMap[fact.fact_key] = fact.fact_value;
278:      cachedFacts = factsMap;
308:        facts_count: Object.keys(factsMap).length,
309:        fact_keys: Object.keys(factsMap),
316:        facts: factsMap,
321:      // T9.15H: Persistir facts acumulados em enova_state.last_context para sobreviver restart do isolate.
322:      // factsMap inclui todos os facts (anteriores + atuais). Core já tomou decisão com eles.
325:          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap);
328:            facts_count: Object.keys(factsMap).length,
329:            fact_keys: Object.keys(factsMap),
397:          for (const [k, v] of Object.entries(cachedFacts)) {
404:            next_objective: toSemanticNextObjective(coreDecision.next_objective),
405:            facts_count: Object.keys(cachedFacts).length,
415:            next_objective_length: llmContext.next_objective.length,
```

---

## Análise linha a linha

### cachedFacts (linha 194)

```typescript
let cachedFacts: Record<string, unknown> = {};
```

- Variável de escopo do handler — acumula facts durante o turno
- Inicializada vazia; preenchida após leitura do Supabase (linha 278)
- Usada na montagem do `LlmContext` (linha 397) para injetar facts acumulados no prompt

---

### Leitura de last_context / facts persistidos (linhas 216–278)

```typescript
// T9.15H: Carregar facts acumulados de turnos anteriores (enova_state.last_context).
// last_context persiste o mapa de facts no Supabase real entre turnos/restarts.

// Montagem do factsMap a partir dos facts retornados pelo Supabase:
const factsMap: Record<string, unknown> = {};
// ... iteração sobre os facts retornados:
    factsMap[fact.fact_key] = fact.fact_value;

cachedFacts = factsMap;   // linha 278 — cachedFacts agora tem os facts persistidos
```

**Semântica:** `last_context` em `enova_state` é o JSON dos facts acumulados de todos os turnos anteriores. Lido via `readLeadAccumulatedFacts(supabaseCfg, event.wa_id)`.

---

### diagLog facts_persistence.read (linha 308–309)

```typescript
facts_count: Object.keys(factsMap).length,
fact_keys: Object.keys(factsMap),
```

Emitido no diagLog `facts_persistence.read` — rastreável via wrangler tail.

---

### Decisão do Core com factsMap (linha 316)

```typescript
facts: factsMap,   // factsMap injetado no input do Core
```

O Core recebe o `factsMap` completo (persistidos + extraídos do turno atual) para avaliar os gates.

---

### Persistência de facts após decisão do Core (linhas 321–329)

```typescript
// T9.15H: Persistir facts acumulados em enova_state.last_context para sobreviver restart do isolate.
// factsMap inclui todos os facts (anteriores + atuais). Core já tomou decisão com eles.
const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap);

// diagLog facts_persistence.write:
facts_count: Object.keys(factsMap).length,
fact_keys: Object.keys(factsMap),
```

**Fluxo T9.15H:** facts são persistidos **após** a decisão do Core, não antes. O Core decide com os facts do turno; a persistência garante que o próximo turno os veja.

---

### Montagem do LlmContext com cachedFacts (linha 397)

```typescript
for (const [k, v] of Object.entries(cachedFacts)) {
  // injeta facts acumulados no contexto do LLM
}
```

`cachedFacts` (= `factsMap` do Supabase) é injetado no `LlmContext` para que o LLM saiba o que já foi coletado.

---

### Aplicação do mapper semântico (linha 404)

```typescript
next_objective: toSemanticNextObjective(coreDecision.next_objective),
```

**Este é o ponto exato onde o mapper T9.15F é aplicado:**
- `coreDecision.next_objective` = código estrutural emitido pelo Core (ex.: `'coletar_customer_goal'`)
- `toSemanticNextObjective(...)` = instrução humana (ex.: `'Perguntar se o cliente tem interesse...'`)
- Resultado vai para `LlmContext.next_objective` → LLM recebe instrução direta

---

### diagLog LlmContext (linha 415)

```typescript
next_objective_length: llmContext.next_objective.length,
```

Emitido no diagLog para rastrear o tamanho da instrução semântica enviada ao LLM.

---

## Fluxo completo do turno — resumo dos 4 termos

```
Início do turno:
  cachedFacts = {}                          [L194 — inicialização]

Leitura Supabase:
  readLeadAccumulatedFacts(wa_id)           [L216]
    → retorna facts persistidos de last_context
  factsMap = { customer_goal: '...', ... }  [L271–274]
  cachedFacts = factsMap                    [L278]
  diagLog facts_persistence.read            [L308–309]

Decisão do Core:
  coreInput.facts = factsMap                [L316]
  coreDecision = engine(coreInput)

Persistência pós-Core:
  writeLeadAccumulatedFacts(wa_id, factsMap) [L325]  — T9.15H
  diagLog facts_persistence.write            [L328–329]

Montagem LlmContext:
  for ([k,v] of cachedFacts) { ... }        [L397] — injeta facts no prompt
  next_objective = toSemanticNextObjective(coreDecision.next_objective)  [L404]
  diagLog next_objective_length              [L415]

LLM recebe:
  - facts acumulados (cachedFacts)
  - next_objective como instrução semântica humana
  - LLM decide a fala — soberano
```

---

## Dependências críticas identificadas

| Dependência | Onde | Risco |
|---|---|---|
| `event.wa_id` disponível | L325, L404 | T9.15J: fix lead_id→wa_id; sem wa_id → write falha |
| `enova_state` row existe para wa_id | L216 | T9.15J-FIX2: SELECT→upsert por PK; sem row → write retorna `no_existing_row_for_wa_id` |
| `factsMap` não vazio | L316, L397 | Se Supabase falha no read, Core recebe facts vazios — topo reinicia do zero |
| `coreDecision.next_objective` mapeado | L404 | Se código sem mapeamento: toSemanticNextObjective retorna o próprio código (fallback seguro) |
