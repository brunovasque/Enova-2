# PR-T9.27-review — 4 fixes residuais E2E

**Data:** 2026-05-09
**Branch:** fix/t9.27-residuais-e2e
**Commit:** bd1b94d
**Tipo:** PR-IMPL / correcao_incidental

---

## Escopo

Apenas `src/core/text-extractor.ts` e `src/core/text-extractor-smoke.ts`.
Zero diff em engine.ts, canary-pipeline.ts, semantic-next-objective.ts, supabase/, llm/, panel-nextjs/.

---

## FIX 1 — parseRendaFlexivel

**Problema:** `extractRenda("2500")` retornava null. Cenarios C1, C3, C7, C8 do E2E enviavam renda como número puro.

**Fix:**
- Mapas `EXTENSOS_MIL` e `EXTENSOS_CENTENA` adicionados como constantes readonly
- `parseRendaFlexivel(original)` criada com 5 camadas:
  1. "X mil e Y" (extenso + centena) — "tres mil e quinhentos" → 3500
  2. "X mil" extenso — "tres mil" → 3000
  3. `extractRenda` existente (R$, "N mil" numerico, keyword-preceded)
  4. Numero puro — "2500" → 2500
  5. Notacao k — "3k" → 3000
- Range valido: 500-100000
- Call-sites: `extractQualificationRenda` + bloco cross-stage em `extractQualificationCivil`

---

## FIX 2 — estado_civil_p3 em extractDiscovery

**Problema:** Quando stage ainda era `discovery` e pendingObjective era `coletar_estado_civil_p3`, não havia bloco de captura → estado_civil_p3 = undefined.

**Fix:**
- Bloco adicionado em `extractDiscovery` após bloco `estado_civil`
- Guard `=== undefined` + 2 pendingObjectives (opaco + semântico)
- Mesmo conjunto de ramos que `extractQualificationCivil` (especificidade casado no civil → casado)
- Guard implícito preservado: bloco `estado_civil` requer pendingObjective != coletar_estado_civil_p3

---

## FIX 3 — rnm_valido 4 camadas

**Problema:** Ordenação plana permitia falso positivo em "Sim tenho mas tem validade" se "sim"/"tenho" fossem checados antes de "tem validade".

**Fix:** Bloco contextual em `extractDiscovery` reescrito com 4 camadas:
1. Específico negativo: `tem validade`, `com validade`, `vence`, `expira`, `prazo determinado` → false
2. Explícito negativo: `nao tenho`, `nao possuo` → false
3. Específico positivo: `prazo indeterminado`, `indeterminado`, `sem prazo`, `permanente` → true
4. Genérico: `sim`, `tenho`, `possuo` → true; `nao` → false

---

## FIX 4 — alternativa_rnm 5 valores

**Problema:** E2E C6 "Nao tenho familiar brasileiro" esperava `sem_familiar_brasileiro` mas código emitia `sem_alternativa`.

**Fix:** Bloco reescrito com:
- Guard `facts['alternativa_rnm'] === undefined`
- Semantic pendingObjective adicionado
- Ordem negações específicas → genérica → positivos:
  1. `nao tenho familiar`, `nao tenho parente` → `sem_familiar_brasileiro`
  2. `nao tenho conjuge/esposa/marido/companheiro/companheira` → `sem_conjuge_brasileiro`
  3. `nao tenho`, `nao tem`, `ninguem`, `sem alternativa`, `nenhum` → `sem_alternativa`
  4. `esposa`, `marido`, `conjuge`, `companheiro`, `companheira` → `tem_conjuge_brasileiro`
  5. `mae`, `pai`, `irmao`, `irma`, `filho`, `filha`, `familiar`, `parente` → `tem_familiar_brasileiro`
- Keywords diretas sem contexto atualizadas: esposa/marido brasileiro → `tem_conjuge_brasileiro`

---

## Testes

`smoke:core:text-extractor` **118/118 PASS** (era 111)

Novos: CTX31-CTX36 (+ CTX34b guard de vazamento)
