# 16 — State Check: branch fix/t9.16b-rnm-alternativa-greeting HEAD

**Data:** 2026-05-05
**Branch:** fix/t9.16b-rnm-alternativa-greeting
**Commit HEAD:** ed94226

---

## git log --oneline -5

```
ed94226 docs(T9.16B-v3): review do refinamento de instrução greeting
6113251 fix(T9.16B-v3): instrução greeting com coleta de nome_completo embutida
2d61841 docs(T9.16B-v2): review do fix isFirstTurn no Gate 1 do topo
b170acf fix(T9.16B-v2): isFirstTurn em vez de parse_status='empty' no Gate 1 do topo
7547cbd docs(T9.16B): review, STATUS e HANDOFFS atualizados
```

---

## git show HEAD:src/core/semantic-next-objective.ts | grep -A 5 "apresentar_e_verificar"

```
  'apresentar_e_verificar_conhecimento':
    'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar se o cliente '
    + 'já conhece o programa MCMV. '
    + 'Se já conhece: agradecer e pedir o nome completo para iniciar o atendimento. '
    + 'Se não conhece: explicar brevemente em 1-2 frases que o MCMV facilita a compra do '
    + 'imóvel com condições especiais dependendo do perfil, e já aproveitar o gancho para '
```

---

## git show HEAD:src/core/topo-gates.ts | grep -A 3 "isFirstTurn"

```
 *   0. primeiro turno real (isFirstTurn=true, state.facts vazio) → apresentar Enova e verificar conhecimento
 *   1. customer_goal ausente (turno 2+) → pedir interesse
 *   2. nome_completo ausente → bloqueia, explicar programa e pedir nome
 *   3. nacionalidade ausente → bloqueia, perguntar se brasileiro ou estrangeiro
--
 * @param isFirstTurn true apenas quando state.facts está completamente vazio (primeiro turno real).
 *   Derivado em engine.ts: Object.keys(state.facts).length === 0.
 *   NÃO usar parse_status='empty' — esse status pode ocorrer em qualquer turno onde o
 *   extractor não reconhece a mensagem, causando greeting repetido.
--
export function evaluateTopoCriteria(signals: TopoSignals, isFirstTurn?: boolean): TopoCriteriaResult {
  // --- Gate 1: customer_goal ausente ---
  // isFirstTurn=true (state.facts vazio — primeiro turno) → saudar e verificar conhecimento do programa
  // isFirstTurn=false/undefined (turno 2+ — facts persistidos existem) → coletar customer_goal diretamente
  if (!signals.customer_goal_detected) {
    const nextObj = isFirstTurn === true
      ? TOPO_NEXT_OBJECTIVES.APRESENTAR_E_VERIFICAR_CONHECIMENTO
      : TOPO_NEXT_OBJECTIVES.COLETAR_CUSTOMER_GOAL;
    return {
```
