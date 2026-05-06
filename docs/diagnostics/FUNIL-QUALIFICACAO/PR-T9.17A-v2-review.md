# PR-T9.17A-v2 — Gate 3B: exclusão de cônjuge + Cenário 31

**PR:** #244 — https://github.com/brunovasque/Enova-2/pull/244
**Branch:** `fix/t9.17a-f2-composicao-dependentes`
**Commit:** `8674655` (sobre `dfb2d0f` — T9.17A original)
**Data:** 2026-05-06
**Tipo:** fix incremental na mesma PR

---

## Problema identificado

Gate 3B original disparava para **todos** os `composition_actor`, incluindo `'conjuge'`.

O cônjuge já tem tratamento próprio e exclusivo no Gate 2:

```
Gate 2: estado_civil=casado_civil + processo != conjunto → corrigir_processo_para_conjunto
```

Quando `estado_civil=casado_civil` e `processo=conjunto`, `composition_actor=conjuge` é o estado esperado — o cônjuge é co-titular obrigatório. Nesse caso, não faz sentido pedir `estado_civil_p3` do cônjuge separadamente: o estado civil já é conhecido (casado_civil via Gate 2). Gate 3B disparar nesse caso criaria um loop desnecessário.

---

## Correção aplicada

### `src/core/meio-a-gates.ts`

```typescript
// ANTES (T9.17A original):
if (signals.composition_actor_detected && !signals.estado_civil_p3_detected) {

// DEPOIS (T9.17A-v2):
if (
  signals.composition_actor_detected &&
  signals.composition_actor_value !== 'conjuge' &&
  !signals.estado_civil_p3_detected
) {
```

Gate 3B agora dispara apenas para atores familiares que NÃO são cônjuge:
- `mae` → Gate 3B dispara (estado_civil_p3 necessário)
- `pai` → Gate 3B dispara
- `irmao` → Gate 3B dispara
- `outro` → Gate 3B dispara
- `parceiro` → Gate 3B dispara (namorado/noivo também tem estado civil relevante)
- `conjuge` → Gate 3B **NÃO** dispara (já tratado no Gate 2)

---

## Sequência de gates Meio A — pós T9.17A-v2

```
Gate 1: estado_civil ou processo ausente
         → coletar_{primeiro ausente}

Gate 2: estado_civil=casado_civil + processo != conjunto
         → corrigir_processo_para_conjunto

Gate 3: processo=composicao_familiar + composition_actor ausente
         → coletar_composition_actor

Gate 3B: composition_actor detectado
         E composition_actor != 'conjuge'
         E estado_civil_p3 ausente
         → coletar_estado_civil_p3

Gate 4: dependents_applicable=true + dependents_count ausente
         → coletar_dependents_count

Advance → avancar_para_qualification_renda
```

---

## Smoke atualizado

### `src/core/smoke.ts`

**Cenário 29 — atualizado:**
- Texto explica que o teste usa `composition_actor=mae` (não cônjuge)
- Prova que Gate 3B ainda bloqueia corretamente para atores familiares

**Cenário 31 — novo:**

```typescript
// qualification_civil com:
// estado_civil: 'casado_civil', processo: 'conjunto', composition_actor: 'conjuge'
// estado_civil_p3: ausente

// Esperado: Gate 3B NÃO dispara
// → block_advance = false
// → stage_after = qualification_renda
// → next_objective != 'coletar_estado_civil_p3'
```

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **31/31 PASS** (era 30 — +Cenário 31) |
| `npm run smoke:core:text-extractor` | **101/101 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Fora de escopo (zero diff além dos 2 arquivos)

- zero `src/core/text-extractor.ts`
- zero `src/core/meio-a-parser.ts`
- zero `src/core/semantic-next-objective.ts`
- zero `src/core/engine.ts`
- zero `src/llm/`
- zero `src/supabase/`

---

## Rollback

```bash
git revert 8674655
```

Reverte apenas a correção de exclusão de cônjuge. A implementação T9.17A original (`dfb2d0f`) permanece intacta. Para reverter tudo: `git revert dfb2d0f`.
