# src/core/meio-a-parser.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: L07 + L10 — Parser/Extrator do Meio A

---

## Cabeçalho

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator do Meio A (L07 + L10)
 *
 * O LLM extrai facts; este módulo apenas valida e normaliza sinais estruturais
 * de estado civil, processo e composição familiar mínima.
 */
```

---

## Interface de entrada: MeioATurnExtract

```typescript
export interface MeioATurnExtract {
  facts_current: Record<string, unknown>;   // facts persistidos do lead
  facts_extracted: Record<string, unknown>; // facts do turno atual (override)
}
```

---

## Interface de saída: MeioASignals

```typescript
export interface MeioASignals {
  // --- Facts obrigatórios ---
  estado_civil_detected: boolean;
  estado_civil_value: EstadoCivil | null;
  // 'solteiro' | 'uniao_estavel' | 'casado_civil' | 'divorciado' | 'viuvo'

  processo_detected: boolean;
  processo_value: ProcessoMode | null;
  // 'solo' | 'conjunto' | 'composicao_familiar'

  // --- Facts opcionais de composição ---
  composition_actor_detected: boolean;
  composition_actor_value: CompositionActor | null;
  // 'conjuge' | 'parceiro' | 'pai' | 'mae' | 'irmao' | 'outro'

  p3_required_detected: boolean;
  p3_required_value: boolean | null;           // terceiro participante necessário?

  dependents_applicable_detected: boolean;
  dependents_applicable_value: boolean | null; // dependentes se aplicam?

  dependents_count_detected: boolean;
  dependents_count_value: number | null;       // quantidade de dependentes (inteiro ≥ 0)

  // --- Derivados (calculados no parser) ---
  composition_required: boolean;    // true quando processo='composicao_familiar'
  dependents_required: boolean;     // true quando processo≠conjunto E dependents_applicable=true

  parse_status: MeioAParseStatus;   // 'ready' | 'partial' | 'empty'
  keys_checked: string[];
}
```

---

## Sets de valores canônicos

```typescript
const VALID_ESTADO_CIVIL = new Set([
  'solteiro', 'uniao_estavel', 'casado_civil', 'divorciado', 'viuvo',
]);

const VALID_PROCESSO = new Set([
  'solo', 'conjunto', 'composicao_familiar',
]);

const VALID_COMPOSITION_ACTOR = new Set([
  'conjuge', 'parceiro', 'pai', 'mae', 'irmao', 'outro',
]);
```

---

## extractMeioASignals — Extrator principal

```typescript
export function extractMeioASignals(input: MeioATurnExtract): MeioASignals {
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,   // extracted override current
  };

  // Normalização de cada campo
  const estadoCivilValue  = normalizeEstadoCivil(merged['estado_civil']);
  const processoValue     = normalizeProcesso(merged['processo']);
  const compositionActorValue = normalizeCompositionActor(merged['composition_actor']);
  const p3RequiredValue   = normalizeBoolean(merged['p3_required']);
  const dependentsApplicableValue = normalizeBoolean(merged['dependents_applicable']);
  const dependentsCountValue = normalizeDependentsCount(merged['dependents_count']);

  // Detecção
  const estadoCivilDetected  = estadoCivilValue !== null;
  const processoDetected     = processoValue !== null;
  const compositionActorDetected = compositionActorValue !== null;
  const p3RequiredDetected   = p3RequiredValue !== null;
  const dependentsApplicableDetected = dependentsApplicableValue !== null;
  const dependentsCountDetected = dependentsCountValue !== null;

  // Derivados
  const compositionRequired = processoValue === 'composicao_familiar';
  const dependentsRequired  = processoValue !== 'conjunto' && dependentsApplicableValue === true;

  return { ..., parse_status: computeParseStatus(...), keys_checked: [...MEIO_A_REQUIRED_FACTS, ...MEIO_A_OPTIONAL_FACTS] };
}
```

---

## Normalizadores

### normalizeEstadoCivil
```typescript
function normalizeEstadoCivil(raw: unknown): EstadoCivil | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_ESTADO_CIVIL.has(value)) return value as EstadoCivil;
  return null;
}
```

### normalizeProcesso
```typescript
function normalizeProcesso(raw: unknown): ProcessoMode | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_PROCESSO.has(value)) return value as ProcessoMode;
  return null;
}
```

### normalizeCompositionActor
```typescript
function normalizeCompositionActor(raw: unknown): CompositionActor | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_COMPOSITION_ACTOR.has(value)) return value as CompositionActor;
  return null;
}
```

### normalizeBoolean
```typescript
function normalizeBoolean(raw: unknown): boolean | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'boolean') return raw;
  const value = String(raw).trim().toLowerCase();
  if (['sim', 'true', '1'].includes(value))   return true;
  if (['nao', 'não', 'false', '0'].includes(value)) return false;
  return null;
}
```

**Aceita:** boolean nativo, strings `sim/nao/não`, `true/false`, `1/0`.

### normalizeDependentsCount
```typescript
function normalizeDependentsCount(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return null;
  return value;   // inteiro ≥ 0
}
```

### computeParseStatus
```typescript
function computeParseStatus(...): MeioAParseStatus {
  if (estadoCivilDetected && processoDetected) return 'ready';
  if (estadoCivilDetected || processoDetected || compositionActorDetected ||
      p3RequiredDetected || dependentsApplicableDetected || dependentsCountDetected) {
    return 'partial';
  }
  return 'empty';
}
```

**`ready`:** ambos os facts obrigatórios presentes (`estado_civil` + `processo`).
**`partial`:** qualquer sinal detectado mas faltando algum obrigatório.
**`empty`:** nenhum sinal.

---

## Derivados calculados no parser

| Derivado | Fórmula | Semântica |
|----------|---------|-----------|
| `composition_required` | `processo === 'composicao_familiar'` | Gates devem exigir `composition_actor` |
| `dependents_required` | `processo !== 'conjunto' && dependents_applicable === true` | Gates devem exigir `dependents_count` |

**Por que `processo !== 'conjunto'` para dependents_required?**
Regra Vasques R5: se processo é conjunto, o cônjuge/parceiro já entra — dependentes são pulados automaticamente.

---

## Tabela completa de facts do Meio A

| Fact | Tipo | Required | Origem |
|------|------|----------|--------|
| `estado_civil` | `EstadoCivil` (enum) | **sim** | text-extractor (qualification_civil) |
| `processo` | `ProcessoMode` (enum) | **sim** | text-extractor (qualification_civil) |
| `composition_actor` | `CompositionActor` (enum) | condicional | quando `processo=composicao_familiar` |
| `p3_required` | boolean | opcional | sinaliza trilho P3 |
| `dependents_applicable` | boolean | opcional | lead declarou ter dependentes |
| `dependents_count` | integer ≥ 0 | condicional | quando `dependents_required=true` |

---

## Diferença Meio A vs. Topo (topo-parser.ts)

| Aspecto | Topo (L05) | Meio A (L07/L10) |
|---------|-----------|-----------------|
| Facts obrigatórios | `customer_goal`, `nome_completo`, `nacionalidade` | `estado_civil`, `processo` |
| Facts condicionais | `rnm_valido` (se estrangeiro) | `composition_actor` (se composição), `dependents_count` (se aplicável) |
| Derivados | `rnm_detectado` | `composition_required`, `dependents_required` |
| `parse_status ready` | `customer_goal_detected` | `estado_civil_detected && processo_detected` |
| Próximo stage ao avançar | `qualification_civil` | `qualification_renda` |
