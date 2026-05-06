# PR-T9.16C — Fix greeting: captura contextual de conhecimento MCMV + instrução clara

**PR:** #243 — https://github.com/brunovasque/Enova-2/pull/243
**Branch:** `fix/t9.16c-greeting-contextual`
**Base:** `main` (commit `2a125f2` — merge PR #242)
**Commit:** `1a5ac80`
**Data:** 2026-05-06
**Tipo:** PR-IMPL contratual — frente T9

---

## Problema resolvido

**Dois problemas no greeting de topo:**

1. **Captura de `customer_goal` ausente:** Quando o LLM perguntava "Você já conhece o MCMV?" e o cliente respondia "sim" ou "não", o extractor não capturava nada — `customer_goal` permanecia `null` e o Core bloqueava no Gate 1 indefinidamente, fazendo o LLM repetir o greeting.

2. **Instrução ambígua para o LLM:** A instrução anterior não deixava claro que "não" significava desconhecimento do programa (não falta de interesse). O LLM podia interpretar "não" como rejeição e encerrar prematuramente.

---

## Arquivos modificados (3)

### 1. `src/core/text-extractor.ts`

**Novo bloco contextual PRIMEIRO em `extractDiscovery`:**

```typescript
// Confirmação contextual de greeting — T9.16C
// Negação PRIMEIRO — "não conheço" contém "conheco" como substring; negativo tem prioridade
if (facts['customer_goal'] === undefined && pendingObjective === 'apresentar_e_verificar_conhecimento') {
  if (
    contains(n, 'nao', 'nao conheco', 'nao sei', 'nunca ouvi', 'primeira vez',
      'desconheco', 'nao ouvi', 'nao tenho', 'nenhuma')
  ) {
    facts['customer_goal'] = 'entender_programa';
    facts['conhece_mcmv'] = false;
  } else if (
    contains(n, 'sim', 'ja conheco', 'conheco', 'sei', 'claro', 'ja sei')
  ) {
    facts['customer_goal'] = 'comprar_imovel';
    facts['conhece_mcmv'] = true;
  }
}
```

**Bug corrigido durante implementação:** A ordem original (positivo antes de negativo) causava falso positivo em "não conheço" → `'conheco'` é substring de `'nao conheco'` → positivo disparava erroneamente. Negativo colocado primeiro resolve.

**Bloco keyword existente guardado:**
```typescript
if (facts['customer_goal'] === undefined) {
  // ... bloco keyword existente (inalterado)
}
```

**Invariantes respeitados:**
- Guard `facts['customer_goal'] === undefined` — nunca sobrescreve customer_goal existente
- `conhece_mcmv` é fact auxiliar — não é obrigatório, não bloqueia nenhum gate
- Nunca lança exceção (função pura, bloco em try/catch externo)
- Backward compatible — `pendingObjective` é opcional; sem pendingObjective, bloco não executa

### 2. `src/core/semantic-next-objective.ts`

**Instrução `apresentar_e_verificar_conhecimento` atualizada (v4):**

```typescript
// ANTES (v3):
'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar se o cliente '
+ 'já conhece o programa MCMV. '
+ 'Se já conhece: agradecer e pedir o nome completo para iniciar o atendimento. '
+ 'Se não conhece: explicar brevemente em 1-2 frases que o MCMV facilita a compra do '
+ 'imóvel com condições especiais dependendo do perfil, e já aproveitar o gancho para '
+ 'pedir o nome completo para orientar melhor. '
+ 'Objetivo: sair dessa mensagem com o nome do cliente coletado ou a pergunta feita.',

// DEPOIS (v4):
'Se apresentar como Enova, especialista em Minha Casa Minha Vida. '
+ 'Fazer UMA pergunta simples: o cliente já conhece o programa Minha Casa Minha Vida? '
+ 'IMPORTANTE: "sim" ou "não" aqui se refere a conhecer o programa — NÃO a ter interesse. '
+ 'Se responder que conhece: dizer "Ótimo!" e perguntar o nome completo para iniciar. '
+ 'Se responder que não conhece: explicar em 1 frase curta que o MCMV oferece condições '
+ 'especiais para compra do primeiro imóvel, e já pedir o nome completo para orientar melhor. '
+ 'Em qualquer caso: encerrar a mensagem pedindo o nome completo. '
+ 'NUNCA interpretar "não" como falta de interesse — apenas como desconhecimento do programa.',
```

### 3. `src/core/text-extractor-smoke.ts`

6 novos casos (CTX9–CTX14):

| Caso | Input | pendingObjective | Resultado esperado |
|---|---|---|---|
| CTX9 | "sim" | `apresentar_e_verificar_conhecimento` | `customer_goal='comprar_imovel'` |
| CTX10 | "já conheço" | `apresentar_e_verificar_conhecimento` | `customer_goal='comprar_imovel'` |
| CTX11 | "não" | `apresentar_e_verificar_conhecimento` | `customer_goal='entender_programa'` |
| CTX12 | "não conheço" | `apresentar_e_verificar_conhecimento` | `customer_goal='entender_programa'` |
| CTX13 | "sim" | `undefined` | `customer_goal=undefined` (sem contexto) |
| CTX14 | "sim" | `apresentar_e_verificar_conhecimento` | `rnm_valido=undefined` (sem interferência) |

---

## Fluxo completo do greeting pós-T9.16C

```
Turno 1 (isFirstTurn=true → Gate 1 → APRESENTAR_E_VERIFICAR_CONHECIMENTO)
  LLM: "Olá! Sou a Enova... Você já conhece o programa Minha Casa Minha Vida?"
  _next_objective = 'apresentar_e_verificar_conhecimento' → persiste em last_context

Turno 2 (pendingObjective='apresentar_e_verificar_conhecimento')
  Cliente: "sim" → customer_goal='comprar_imovel', conhece_mcmv=true
  Cliente: "não" → customer_goal='entender_programa', conhece_mcmv=false
  → customer_goal extraído → Gate 1 liberado → Gate 2 (nome_completo)
```

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `smoke` (core) | **28/28 PASS** |
| `smoke:core:text-extractor` | **95/95 PASS** (era 89) |
| `smoke:meta:canary` | 41/41 PASS |
| `prove:t9.15h-facts-persistence` | 34/34 PASS |
| `prove:t9.14-reverse-mapper` | 19/19 PASS |

---

## Fora de escopo (zero diff)

- zero `src/core/topo-gates.ts`
- zero `src/core/topo-rules.ts`
- zero `src/core/engine.ts`
- zero `src/llm/`
- zero `src/supabase/`
- zero `src/meta/canary-pipeline.ts`
- zero `panel-nextjs/`
- zero `wrangler.toml`
- zero Supabase schema/RLS/migrations
- zero flags

---

## Rollback

```bash
git revert 1a5ac80
```

Seguro: nenhum schema, nenhuma migration, nenhum flag. `pendingObjective` é opcional — revert restaura comportamento anterior sem side effects.

---

## Próxima ação

Vasques merge PR → Repetir T9.15B-PROVA-REAL-CANARY com greeting completo (captura contextual + instrução clara).
