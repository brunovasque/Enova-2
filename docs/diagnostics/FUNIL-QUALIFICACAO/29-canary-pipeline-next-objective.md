# 29 — canary-pipeline.ts — next_objective: montagem, persistência e leitura entre turnos

**Data:** 2026-05-08
**Tipo:** Read-only — diagnóstico estático
**Arquivo-alvo:** `src/meta/canary-pipeline.ts`
**Comando executado:**

```
grep -n "next_objective\|LlmContext\|buildDynamic\|_next_objective" src/meta/canary-pipeline.ts
```

---

## Output bruto do grep

```
29:import type { LlmClientResult, LlmContext } from '../llm/client.ts';
74:type LlmCaller = (msg: string, env: Record<string, unknown>, context?: LlmContext) => Promise<LlmClientResult>;
228:      // T9.16A: Recuperar next_objective do turno anterior para contextualizar extração.
230:      const pendingObjective = typeof persistedFacts['_next_objective'] === 'string'
231:        ? persistedFacts['_next_objective']
327:      // T9.16A: Persistir next_objective atual para contextualizar extração no próximo turno.
328:      // _next_objective é chave interna — não é fact de negócio, nunca exposto ao lead.
329:      if (coreDecision.next_objective) {
330:        factsMap['_next_objective'] = coreDecision.next_objective;
404:        // Constrói LlmContext a partir do coreDecision e facts hoistados (BLK-04 fix — T9.8).
406:        let llmContext: LlmContext | undefined;
416:            next_objective: toSemanticNextObjective(coreDecision.next_objective),
427:            next_objective_length: llmContext.next_objective.length,
```

---

## 1. Como o `LlmContext` é montado — origem do `next_objective`

**Linhas 404–430 de `canary-pipeline.ts`:**

```typescript
// Constrói LlmContext a partir do coreDecision e facts hoistados (BLK-04 fix — T9.8).
// Core decide stage; LLM recebe contexto para decidir apenas a fala.
let llmContext: LlmContext | undefined;
if (coreDecision) {
  const factsSummary: Record<string, string> = {};
  for (const [k, v] of Object.entries(cachedFacts)) {
    // Sanitiza valores sensíveis — nunca expõe renda bruta ou CPF ao LLM.
    factsSummary[k] = (k === 'renda_principal' || k === 'cpf') ? 'informado(a)' : String(v).slice(0, 50);
  }
  llmContext = {
    stage_current: coreDecision.stage_current,
    stage_after:   coreDecision.stage_after,
    next_objective: toSemanticNextObjective(coreDecision.next_objective),   // ← ponto de transformação
    facts_count:   Object.keys(cachedFacts).length,
    facts_summary: factsSummary,
    speech_intent: coreDecision.speech_intent,
    ...(recentHistory.length > 0 ? { recent_turns: recentHistory } : {}),
  };
}
```

### Cadeia completa de origem de `next_objective`

```
runCoreEngine(LeadState)
  └─► CoreDecision.next_objective       ← código opaco (ex: 'perguntar_nacionalidade')
        │
        ▼
  toSemanticNextObjective(code)         ← mapper em src/core/semantic-next-objective.ts (L43)
        │
        ▼
  LlmContext.next_objective             ← instrução semântica em português
        │
        ▼
  buildDynamicSystemPrompt(LlmContext)  ← montado em src/llm/client.ts
        │
        ▼
  LLM recebe instrução no system prompt (sandwich pattern — T9.20b)
```

**Import do mapper (linha 43):**

```typescript
import { toSemanticNextObjective } from '../core/semantic-next-objective.ts';
```

O mapper é aplicado **uma única vez**, na linha 416, ao montar o `LlmContext`.
O Core nunca recebe a versão semântica — apenas o código opaco interno.

---

## 2. Como `_next_objective` é persistido e lido entre turnos

### LEITURA — no início do turno (linhas 228–232)

```typescript
// T9.16A: Recuperar next_objective do turno anterior para contextualizar extração.
// Permite que respostas curtas ("sim", "solteiro") sejam interpretadas no contexto certo.
const pendingObjective = typeof persistedFacts['_next_objective'] === 'string'
  ? persistedFacts['_next_objective']
  : undefined;
```

`persistedFacts` vem de `readLeadAccumulatedFacts(supabaseCfg, wa_id)` — os facts acumulados
gravados em `enova_state.last_context` no Supabase (fix T9.15H).

`pendingObjective` é então passado para o extrator de texto:

```typescript
// linha 237
const extractedFacts = extractFactsFromText(event.text_body ?? '', currentStage, pendingObjective);
```

Isso permite que `extractFactsFromText` interprete respostas ambíguas no contexto correto:
ex: "Solteiro" → `estado_civil = 'solteiro'` (porque `pendingObjective = 'coletar_estado_civil'`).

---

### ESCRITA — após decisão do Core (linhas 327–331)

```typescript
// T9.16A: Persistir next_objective atual para contextualizar extração no próximo turno.
// _next_objective é chave interna — não é fact de negócio, nunca exposto ao lead.
if (coreDecision.next_objective) {
  factsMap['_next_objective'] = coreDecision.next_objective;
}
```

`factsMap` é depois gravado no Supabase em `enova_state.last_context` (linhas 333–347):

```typescript
// T9.15H: Persistir facts acumulados em enova_state.last_context para sobreviver restart do isolate.
const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap);
```

O valor persistido é o **código opaco interno** (`coreDecision.next_objective`), não a versão semântica.
A versão semântica só existe em memória durante a montagem do `LlmContext`.

---

## 3. Diagrama de fluxo — ciclo completo por turno

```
TURNO N:
  1. readLeadAccumulatedFacts(supabase, wa_id)
     └─► persistedFacts = { customer_goal, nome_completo, ..., _next_objective: 'perguntar_nacionalidade' }

  2. pendingObjective = persistedFacts['_next_objective']
     └─► 'perguntar_nacionalidade'

  3. extractFactsFromText(text, stage, pendingObjective)
     └─► extractedFacts = { nacionalidade: 'brasileiro' }

  4. factsMap = merge(persistedFacts, extractedFacts)
     └─► { customer_goal, nome_completo, nacionalidade, ... }

  5. runCoreEngine({ stage, facts: factsMap })
     └─► coreDecision = { next_objective: 'Perguntar estado civil: ...', stage_after: 'qualification_civil' }

  6. factsMap['_next_objective'] = coreDecision.next_objective
     └─► 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.'

  7. writeLeadAccumulatedFacts(supabase, wa_id, factsMap)
     └─► last_context = { ..., _next_objective: 'Perguntar estado civil: ...' }

  8. LlmContext.next_objective = toSemanticNextObjective(coreDecision.next_objective)
     └─► 'Perguntar APENAS o estado civil do cliente: solteiro(a), casado(a)...'

  9. buildDynamicSystemPrompt(llmContext) → LLM responde com instrução semântica
```

---

## 4. Invariantes verificados

| Invariante | Status |
|---|---|
| `_next_objective` é chave interna — nunca exposta ao lead | ✓ Comentário explícito linha 328 |
| O mapper semântico é aplicado somente ao montar `LlmContext` | ✓ Linha 416 — única ocorrência |
| O Core recebe apenas o código opaco, nunca a instrução semântica | ✓ `runCoreEngine` não usa `toSemanticNextObjective` |
| `_next_objective` persistido = código opaco (não semântico) | ✓ Linha 330: `factsMap['_next_objective'] = coreDecision.next_objective` |
| `pendingObjective` passado ao extrator = código opaco ou semântico | ⚠️ Ver nota abaixo |

**⚠️ Nota sobre `pendingObjective`:**
O valor persistido em `_next_objective` pode ser o código opaco (`'perguntar_nacionalidade'`) ou
a instrução semântica completa (ex: `'Perguntar APENAS o estado civil...'`), dependendo da
versão do next_objective emitido pelo Core. O `extractFactsFromText` e o `text-extractor.ts`
tratam ambas as formas via matching por `pendingObjective` (ver `text-extractor-smoke.ts` CTX23).

---

## 5. Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `src/meta/canary-pipeline.ts` | Pipeline principal — lê/escreve `_next_objective`, monta `LlmContext` |
| `src/core/semantic-next-objective.ts` | Mapper código opaco → instrução semântica |
| `src/core/text-extractor.ts` | Extrator — usa `pendingObjective` para contextualizar extração |
| `src/llm/client.ts` | `buildDynamicSystemPrompt` — recebe `LlmContext.next_objective` já semântico |
| `src/supabase/crm-store.ts` | `readLeadAccumulatedFacts` / `writeLeadAccumulatedFacts` — I/O last_context |
