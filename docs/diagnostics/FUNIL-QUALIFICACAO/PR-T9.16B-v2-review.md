# PR-T9.16B-v2 — Fix: isFirstTurn em vez de parse_status='empty' no Gate 1

**PR:** #241 (atualização de branch)
**Branch:** `fix/t9.16b-rnm-alternativa-greeting`
**Commit v2:** `b170acf`
**Commit base (T9.16B):** `9dc5585`
**Data:** 2026-05-05
**Tipo:** PR-FIX (correção de bug introduzido em T9.16B)

---

## Problema corrigido

**Bug introduzido em T9.16B:** Gate 1 de `evaluateTopoCriteria` usava `signals.parse_status === 'empty'` para disparar o greeting estruturado (`APRESENTAR_E_VERIFICAR_CONHECIMENTO`).

**Por que isso está errado:** `parse_status='empty'` é calculado por `computeParseStatus` em `topo-parser.ts` e retorna `'empty'` quando `customer_goal_detected=false` E `current_intent_detected=false`. Isso pode ocorrer em **qualquer turno** — não apenas no primeiro — quando o text-extractor não reconhece a mensagem do cliente (ex: "ok", "entendi", "👍").

**Consequência:** Lead que já tinha recebido o greeting no turno 1 e enviou "ok" no turno 2 recebia o greeting novamente, causando apresentação repetida da Enova.

### Exemplo do bug

```
Turno 1: lead envia "oi"
  → state.facts = {}
  → parse_status = 'empty' (nada extraído)
  → Gate 1: greeting ✓ CORRETO

Turno 2: lead envia "ok"
  → state.facts = { _next_objective: 'apresentar_e_verificar_conhecimento' }
  → parse_status = 'empty' (nada extraído — "ok" não é customer_goal nem current_intent)
  → Gate 1 (bug): greeting ✗ ERRADO — apresentação repetida
```

---

## Solução implementada

**Critério correto:** O greeting deve disparar apenas no **primeiro turno real** — ou seja, quando `state.facts` está completamente vazio (nenhum fact persistido ainda, incluindo `_next_objective`).

### Fluxo de dados

```
canary-pipeline.ts
  → readLeadAccumulatedFacts() → persistedFacts (vazio no turno 1)
  → extractFactsFromText()     → extractedFacts
  → factsMap = { ...persistedFacts, ...extractedFacts }
  → [após core decision] factsMap['_next_objective'] = coreDecision.next_objective
  → writeLeadAccumulatedFacts(factsMap) → persiste em enova_state.last_context

runCoreEngine(state)  [state.facts = factsMap ANTES de escrever _next_objective]
  → runTopoDecision(state)
     isFirstTurn = Object.keys(state.facts).length === 0
     → true apenas quando factsMap é completamente vazio
     → false a partir do turno 2 (tem pelo menos _next_objective)
```

---

## Arquivos modificados (3)

### 1. `src/core/topo-gates.ts`

**Assinatura de `evaluateTopoCriteria` atualizada:**
```typescript
// ANTES:
export function evaluateTopoCriteria(signals: TopoSignals): TopoCriteriaResult

// DEPOIS:
export function evaluateTopoCriteria(signals: TopoSignals, isFirstTurn?: boolean): TopoCriteriaResult
```

**Gate 1 atualizado:**
```typescript
// ANTES (bug):
const nextObj = signals.parse_status === 'empty'
  ? TOPO_NEXT_OBJECTIVES.APRESENTAR_E_VERIFICAR_CONHECIMENTO
  : TOPO_NEXT_OBJECTIVES.COLETAR_CUSTOMER_GOAL;

// DEPOIS (fix):
const nextObj = isFirstTurn === true
  ? TOPO_NEXT_OBJECTIVES.APRESENTAR_E_VERIFICAR_CONHECIMENTO
  : TOPO_NEXT_OBJECTIVES.COLETAR_CUSTOMER_GOAL;
```

Parâmetro opcional com `=== true` — se `isFirstTurn` for `undefined` (chamadas legadas sem o argumento), comportamento seguro: usa `COLETAR_CUSTOMER_GOAL`.

### 2. `src/core/engine.ts`

**`runTopoDecision` atualizado:**
```typescript
// Novo bloco adicionado após extractTopoSignals:
const isFirstTurn = Object.keys(state.facts).length === 0;

// Chamada atualizada:
const topoCriteria = evaluateTopoCriteria(topoSignals, isFirstTurn);
```

### 3. `src/core/smoke.ts`

**Cenário 1 — comentário atualizado:** `parse_status='empty'` → `isFirstTurn=true`.

**Cenário 28 — substituído por prova de regressão:**

| | Antes (T9.16B) | Depois (T9.16B-v2) |
|---|---|---|
| Input | `facts={}` | `facts={ _next_objective: 'apresentar_e_verificar_conhecimento' }` |
| Esperado | `apresentar_e_verificar_conhecimento` | `coletar_customer_goal` |
| O que prova | greeting para topo vazio (duplicata do Cenário 1) | NÃO repete greeting no turno 2 |

O cenário 1 já cobre o caso `facts={}` → greeting. O cenário 28 agora prova a regressão que o fix resolve.

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `smoke` (core) | **28/28 PASS** |
| `smoke:core:text-extractor` | 89/89 PASS |
| `smoke:meta:canary` | 41/41 PASS |
| `prove:t9.15h-facts-persistence` | 34/34 PASS |
| `prove:t9.14-reverse-mapper` | 19/19 PASS |

---

## Comportamento final (Gate 1 pós-T9.16B-v2)

```
Gate 1: customer_goal ausente
    │
    ├─ isFirstTurn=true  (state.facts={} — primeiro turno)
    │     → APRESENTAR_E_VERIFICAR_CONHECIMENTO
    │        (greeting estruturado — apresenta Enova, verifica conhecimento MCMV)
    │
    └─ isFirstTurn=false (state.facts tem ao menos _next_objective — turno 2+)
          → COLETAR_CUSTOMER_GOAL
             (pergunta direta sobre interesse em comprar imóvel)
```

---

## Rollback

```bash
git revert b170acf  # reverte apenas o fix v2
git revert 9dc5585  # reverte a PR T9.16B completa (Gates 4A/4B + greeting)
```

O parâmetro `isFirstTurn` é opcional (`isFirstTurn?: boolean`) — revert de `b170acf` sozinho restaura comportamento T9.16B com o bug de greeting repetido.

---

## Próxima ação

Vasques merge PR #241 → repetir T9.15B-PROVA-REAL-CANARY com topo completo e greeting corrigido.
