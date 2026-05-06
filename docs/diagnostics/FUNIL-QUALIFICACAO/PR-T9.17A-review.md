# PR-T9.17A — F2 completo: extrator composição/dependentes + Gate 3B + semantic-map

**PR:** #244 — https://github.com/brunovasque/Enova-2/pull/244
**Branch:** `fix/t9.17a-f2-composicao-dependentes`
**Base:** `main` (commit `c408074` — merge PR #243)
**Commit:** `dfb2d0f`
**Data:** 2026-05-06
**Tipo:** PR-IMPL contratual — frente T9

---

## Problema resolvido

Facts críticos dos gates F2 não tinham extrator de texto nem mapeamento semântico:

| Fact | Stage | Gap |
|---|---|---|
| `composition_actor` | qualification_civil | sem extrator, sem semantic-map |
| `estado_civil_p3` | qualification_civil | sem extrator, sem semantic-map, sem gate |
| `dependents_applicable` | qualification_civil | sem extrator, sem semantic-map |
| `dependents_count` | qualification_civil | sem extrator |
| `autonomo_tem_ir` | qualification_renda | sem extrator, sem semantic-map |
| `ctps_36` | qualification_renda | sem extrator, sem semantic-map |

Consequência: gates `G_COMPOSICAO_FAMILIAR` e `G_REGIME_RENDA` emitiam `next_objective` codes que o LLM recebia opacos, e as respostas do cliente nunca eram capturadas — loop de bloqueio permanente.

---

## Arquivos modificados (6)

### 1. `src/core/text-extractor.ts`

**`extractQualificationCivil` — 4 novos blocos:**

```typescript
// composition_actor (contextual + keywords)
if (facts['composition_actor'] === undefined) {
  if (pendingObjective === 'coletar_composition_actor' ||
      contains(n, 'minha mae', 'meu pai', 'minha irma', ...)) {
    if (contains(n, 'mae')) facts['composition_actor'] = 'mae';
    else if (contains(n, 'pai')) facts['composition_actor'] = 'pai';
    // ...
  }
  if (contains(n, 'namorada', 'namorado', 'noiva', 'noivo'))
    facts['composition_actor'] = 'parceiro';
  if (contains(n, 'esposa', 'marido', 'conjuge', ...))
    facts['composition_actor'] = 'conjuge';
}

// estado_civil_p3 (apenas contextual — não sobrescreve estado_civil do lead)
if (facts['estado_civil_p3'] === undefined) {
  if (pendingObjective === 'coletar_estado_civil_p3') {
    // solteiro / casado_civil / uniao_estavel / divorciado / viuvo
  }
}

// dependents_applicable (contextual + keywords diretas)
// dependents_count (contextual com regex numérico)
```

**`extractQualificationRenda` — nova assinatura + 2 blocos:**

```typescript
// Antes: function extractQualificationRenda(n: string, original: string)
// Depois: function extractQualificationRenda(n: string, original: string, pendingObjective?: string)

// autonomo_tem_ir (contextual + keywords: 'declaro ir', 'declaro imposto', ...)
// ctps_36 (apenas contextual — pendingObjective=coletar_ctps_36)
```

**Switch-case atualizado:** `qualification_renda` passa `pendingObjective`.

**Invariantes:**
- Todos os blocos com guard `facts[x] === undefined` — nunca sobrescreve
- `estado_civil_p3` nunca sobrescreve `estado_civil` (chaves diferentes)
- Função pura — zero I/O, nunca lança exceção

### 2. `src/core/meio-a-parser.ts`

**3 novos campos em `MeioASignals`:**

```typescript
estado_civil_p3_detected: boolean;
estado_civil_p3_value: EstadoCivil | null;
p3_required_auto: boolean; // true quando estado_civil_p3=casado_civil
```

**Em `extractMeioASignals`:**

```typescript
const estadoCivilP3Value = normalizeEstadoCivil(merged['estado_civil_p3']);
const estadoCivilP3Detected = estadoCivilP3Value !== null;
const p3RequiredAuto = estadoCivilP3Value === 'casado_civil';
```

### 3. `src/core/meio-a-gates.ts`

**Gate 3B** — inserido entre Gate 3 (composicao_sem_actor) e Gate 4 (dependente_sem_quantidade):

```typescript
// Gate 3B: composition_actor detectado mas estado_civil_p3 ausente
if (signals.composition_actor_detected && !signals.estado_civil_p3_detected) {
  return {
    can_advance: false,
    next_objective: 'coletar_estado_civil_p3',
    criteria_code: 'meio_a.estado_civil_p3_ausente',
    structural_reason: `composition_actor='${signals.composition_actor_value}' identificado; estado_civil_p3 ausente.`,
    activated_gates: ['G_COMPOSICAO_FAMILIAR'],
  };
}
```

**Sequência de gates Meio A após T9.17A:**

```
Gate 1: estado_civil ou processo ausente → coletar_{primeiro ausente}
Gate 2: casado_civil + processo != conjunto → corrigir_processo_para_conjunto
Gate 3: composicao_familiar + composition_actor ausente → coletar_composition_actor
Gate 3B: composition_actor detectado + estado_civil_p3 ausente → coletar_estado_civil_p3 [NOVO]
Gate 4: dependents_applicable=true + dependents_count ausente → coletar_dependents_count
Advance → avancar_para_qualification_renda
```

### 4. `src/core/semantic-next-objective.ts`

**8 novos mapeamentos:**

| Código | Instrução |
|---|---|
| `coletar_composition_actor` | Perguntar quem é a pessoa que vai comprar junto |
| `coletar_estado_civil_p3` | Perguntar estado civil do familiar/parceiro |
| `coletar_dependents_applicable` | Perguntar se possui dependente menor 18 anos ou parente 3º grau |
| `coletar_dependents_count` | Perguntar quantos dependentes |
| `corrigir_processo_para_conjunto` | Explicar que casado civil exige cônjuge obrigatório |
| `avaliar_composicao_renda` | Perguntar se possui familiar para compor renda |
| `coletar_autonomo_tem_ir` | Perguntar se declarou IR nos últimos 2 anos |
| `coletar_ctps_36` | Perguntar há quanto tempo tem carteira assinada ativa |

### 5. `src/core/smoke.ts`

**Cenários novos (29–30):**
- Cenário 29: `composition_actor=mae` + sem `estado_civil_p3` → Gate 3B bloqueia
- Cenário 30: `composition_actor=mae` + `estado_civil_p3=casado_civil` → Gate 3B libera, avança

**Cenários atualizados (4/5/6):**
- Adicionado `estado_civil_p3` nos facts — Gate 3B é novo invariante obrigatório

### 6. `src/core/text-extractor-smoke.ts`

**6 novos casos (CTX15–CTX20):**

| Caso | Input | pendingObjective | Esperado |
|---|---|---|---|
| CTX15 | "com minha mãe" | — | `composition_actor='mae'` |
| CTX16 | "minha namorada" | — | `composition_actor='parceiro'` |
| CTX17 | "ela é casada no civil" | `coletar_estado_civil_p3` | `estado_civil_p3='casado_civil'` |
| CTX18 | "sim tenho 2 filhos" | `coletar_dependents_applicable` | `dependents_applicable=true` |
| CTX19 | "dois" | `coletar_dependents_count` | `dependents_count=2` |
| CTX20 | "declaro ir" | — | `autonomo_tem_ir=true` |

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **30/30 PASS** (era 28 — +Cenários 29 e 30) |
| `npm run smoke:core:text-extractor` | **101/101 PASS** (era 95 — +CTX15-CTX20) |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Fora de escopo (zero diff)

- zero `src/core/engine.ts`
- zero `src/core/topo-gates.ts` / `topo-rules.ts`
- zero `src/llm/`
- zero `src/supabase/`
- zero `src/meta/canary-pipeline.ts`
- zero `panel-nextjs/`
- zero `wrangler.toml`
- zero Supabase schema/RLS/migrations
- zero flags
- zero trilho Especiais

---

## Rollback

```bash
git revert dfb2d0f
```

Seguro: sem migration, sem schema, sem flags. `pendingObjective` em `extractQualificationRenda` é opcional — revert restaura comportamento anterior sem side effects.

---

## Observação: Gate 3B — escopo de disparo

Gate 3B dispara para **todos** os casos onde `composition_actor` é detectado (incluindo `processo='conjunto'`). Isso é intencional: uma vez que sabemos quem é o co-participante, precisamos saber o estado civil dele para determinar se P3 será necessário (`p3_required_auto`).

Para leads com cônjuge detectado (`composition_actor=conjuge`), o gate 3B pede `estado_civil_p3` antes de avançar — comportamento correto pois o estado civil do cônjuge afeta a estrutura do financiamento.

---

## Próxima ação

Vasques merge PR #244 → T9.17B (trilho Especiais: extratores para work_regime_p2/p3, monthly_income_p2) ou PROVA-REAL-CANARY conforme prioridade.
