# 24 — Conteúdo completo: src/core/especiais-parser.ts

**Data:** 2026-05-06
**Fonte:** `git show HEAD:src/core/especiais-parser.ts`

---

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator dos Especiais (L15 + L16)
 *
 * Normaliza apenas os sinais estruturais dos trilhos P3, multi e variantes mínimas.
 */

import type {
  EspecialTrackKind,
  EspeciaisParseStatus,
} from './especiais-rules.ts';
import {
  ESPECIAIS_MULTI_REQUIRED_FACTS,
  ESPECIAIS_OPTIONAL_FACTS,
  ESPECIAIS_P3_REQUIRED_FACTS,
} from './especiais-rules.ts';
import type { ProcessoMode } from './meio-a-rules.ts';
import type { RegimeTrabalho } from './meio-b-rules.ts';

export interface EspeciaisTurnExtract {
  facts_current: Record<string, unknown>;
  facts_extracted: Record<string, unknown>;
}

export interface EspeciaisSignals {
  processo_detected: boolean;
  processo_value: ProcessoMode | null;
  p3_required_detected: boolean;
  p3_required_value: boolean | null;
  work_regime_p2_detected: boolean;
  work_regime_p2_value: RegimeTrabalho | null;
  monthly_income_p2_detected: boolean;
  monthly_income_p2_value: number | null;
  autonomo_has_ir_p2_detected: boolean;
  autonomo_has_ir_p2_value: boolean | null;
  ctps_36m_p2_detected: boolean;
  ctps_36m_p2_value: boolean | null;
  work_regime_p3_detected: boolean;
  work_regime_p3_value: RegimeTrabalho | null;
  multi_track_active: boolean;
  p3_track_active: boolean;
  active_track: EspecialTrackKind;
  parse_status: EspeciaisParseStatus;
  keys_checked: string[];
}

const VALID_PROCESSO = new Set<string>([
  'solo',
  'conjunto',
  'composicao_familiar',
]);

const VALID_REGIMES = new Set<string>([
  'clt',
  'autonomo',
  'aposentado',
  'servidor',
  'informal',
  'multiplo',
]);

export function extractEspeciaisSignals(input: EspeciaisTurnExtract): EspeciaisSignals {
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const processoValue = normalizeProcesso(merged['processo']);
  const p3RequiredValue = normalizeBoolean(merged['p3_required']);
  const workRegimeP2Value = normalizeRegime(merged['work_regime_p2']);
  const monthlyIncomeP2Value = normalizeNumber(merged['monthly_income_p2']);
  const autonomoHasIrP2Value = normalizeBoolean(merged['autonomo_has_ir_p2']);
  const ctps36mP2Value = normalizeBoolean(merged['ctps_36m_p2']);
  const workRegimeP3Value = normalizeRegime(merged['work_regime_p3']);

  const multiTrackActive =
    processoValue === 'conjunto' ||
    workRegimeP2Value !== null ||
    monthlyIncomeP2Value !== null ||
    autonomoHasIrP2Value !== null ||
    ctps36mP2Value !== null;
  const p3TrackActive = p3RequiredValue === true || workRegimeP3Value !== null;

  return {
    processo_detected: processoValue !== null,
    processo_value: processoValue,
    p3_required_detected: p3RequiredValue !== null,
    p3_required_value: p3RequiredValue,
    work_regime_p2_detected: workRegimeP2Value !== null,
    work_regime_p2_value: workRegimeP2Value,
    monthly_income_p2_detected: monthlyIncomeP2Value !== null,
    monthly_income_p2_value: monthlyIncomeP2Value,
    autonomo_has_ir_p2_detected: autonomoHasIrP2Value !== null,
    autonomo_has_ir_p2_value: autonomoHasIrP2Value,
    ctps_36m_p2_detected: ctps36mP2Value !== null,
    ctps_36m_p2_value: ctps36mP2Value,
    work_regime_p3_detected: workRegimeP3Value !== null,
    work_regime_p3_value: workRegimeP3Value,
    multi_track_active: multiTrackActive,
    p3_track_active: p3TrackActive,
    active_track: resolveEspecialTrack(p3TrackActive, multiTrackActive),
    parse_status: computeParseStatus(...),
    keys_checked: [
      ...ESPECIAIS_MULTI_REQUIRED_FACTS,
      ...ESPECIAIS_P3_REQUIRED_FACTS,
      ...ESPECIAIS_OPTIONAL_FACTS,
    ],
  };
}

export function resolveEspecialTrack(
  p3TrackActive: boolean,
  multiTrackActive: boolean,
): EspecialTrackKind {
  if (p3TrackActive) return 'p3';
  if (multiTrackActive) return 'multi';
  return 'none';
}
```

---

## Análise estrutural

### Interface `EspeciaisSignals` — 19 campos

| Campo | Tipo | Fonte |
|---|---|---|
| `processo_detected` | boolean | `merged['processo']` |
| `processo_value` | `ProcessoMode\|null` | normalizeProcesso |
| `p3_required_detected` | boolean | `merged['p3_required']` |
| `p3_required_value` | `boolean\|null` | normalizeBoolean |
| `work_regime_p2_detected` | boolean | `merged['work_regime_p2']` |
| `work_regime_p2_value` | `RegimeTrabalho\|null` | normalizeRegime |
| `monthly_income_p2_detected` | boolean | `merged['monthly_income_p2']` |
| `monthly_income_p2_value` | `number\|null` | normalizeNumber |
| `autonomo_has_ir_p2_detected` | boolean | `merged['autonomo_has_ir_p2']` |
| `autonomo_has_ir_p2_value` | `boolean\|null` | normalizeBoolean |
| `ctps_36m_p2_detected` | boolean | `merged['ctps_36m_p2']` |
| `ctps_36m_p2_value` | `boolean\|null` | normalizeBoolean |
| `work_regime_p3_detected` | boolean | `merged['work_regime_p3']` |
| `work_regime_p3_value` | `RegimeTrabalho\|null` | normalizeRegime |
| `multi_track_active` | boolean | derivado |
| `p3_track_active` | boolean | derivado |
| `active_track` | `EspecialTrackKind` | `resolveEspecialTrack` |
| `parse_status` | `EspeciaisParseStatus` | `computeParseStatus` |
| `keys_checked` | string[] | constantes |

### Lógica de ativação de trilho

```
multiTrackActive = true se qualquer um:
  - processo === 'conjunto'
  - work_regime_p2 !== null
  - monthly_income_p2 !== null
  - autonomo_has_ir_p2 !== null
  - ctps_36m_p2 !== null

p3TrackActive = true se qualquer um:
  - p3_required === true
  - work_regime_p3 !== null

resolveEspecialTrack: P3 tem prioridade sobre multi
  p3TrackActive → 'p3'
  multiTrackActive → 'multi'
  else → 'none'
```

### Dependência cross-stage crítica

`processo` é extraído no Meio A / qualification_civil. O parser de Especiais lê `merged['processo']` dos `facts_current`.
Se `processo='conjunto'` não estiver persistido em `state.facts`, `multiTrackActive` nunca ativa via `processo` — mas ainda pode ativar via `work_regime_p2` (se esse fact chegar por outro meio).

### Facts que o parser lê mas não têm extractor de texto (gap herdado do doc 21)

| Fact lido pelo parser | Extractor em text-extractor.ts | Semantic-map |
|---|---|---|
| `work_regime_p2` | ✗ ausente | ✗ ausente |
| `monthly_income_p2` | ✗ ausente | ✗ ausente |
| `autonomo_has_ir_p2` | ✗ ausente | ✗ ausente |
| `ctps_36m_p2` | ✗ ausente | ✗ ausente |
| `work_regime_p3` | ✗ ausente | ✗ ausente |
| `p3_required` | ✗ ausente | ✗ ausente |

`processo` e `p3_required` são os únicos sinais que podem ativar o trilho multi/p3 via persistência do Meio A — mas apenas se os stages anteriores já os capturaram corretamente.

### `computeParseStatus`

- `'ready'`: `trackDetected = p3TrackActive || multiTrackActive`
- `'partial'`: qualquer fact detectado individualmente
- `'empty'`: nenhum fact
