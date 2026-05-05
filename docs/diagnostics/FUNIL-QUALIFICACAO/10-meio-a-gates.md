# src/core/meio-a-gates.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: L07 + L08 — Critérios e Gates do Meio A

---

## Cabeçalho

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Critérios e Gates do Meio A (L07 + L08)
 *
 * Avalia apenas estado civil, processo e composição mínima relevante.
 * Não abre renda, elegibilidade, docs ou fala.
 */
```

---

## Interface de resultado: MeioACriteriaResult

```typescript
export interface MeioACriteriaResult {
  can_advance: boolean;
  authorized_next_step: string;       // 'qualification_renda' | 'qualification_civil'
  next_objective: string;             // instrução ao LLM (traduzida pelo mapper)
  criteria_code: string;              // código de MEIO_A_BLOCKING_CONDITIONS ou ADVANCE_CRITERIA
  structural_reason: string;          // razão interna — não é fala ao cliente
  track_signal: string;               // sinal de trilho (MEIO_A_SIGNAL_POLICY)
  missing_required_facts: string[];   // facts ausentes
  activated_gates: Array<'G_FATO_CRITICO_AUSENTE' | 'G_COMPOSICAO_FAMILIAR'>;
}
```

---

## evaluateMeioACriteria — Avaliação sequencial (4 gates)

```typescript
export function evaluateMeioACriteria(signals: MeioASignals): MeioACriteriaResult {
  const missingRequiredFacts: string[] = [];

  if (!signals.estado_civil_detected) missingRequiredFacts.push('estado_civil');
  if (!signals.processo_detected)     missingRequiredFacts.push('processo');

  // --- Gate 1: facts críticos ausentes ---
  if (missingRequiredFacts.length > 0) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: `coletar_${missingRequiredFacts[0] ?? 'facto_critico'}`,
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.FACTO_CRITICO_AUSENTE,
      structural_reason: `Facts críticos ausentes no Meio A: [${missingRequiredFacts.join(', ')}].`,
      track_signal: MEIO_A_SIGNAL_POLICY.TRILHO_VALIDO_SEM_COMPOSICAO,
      missing_required_facts: missingRequiredFacts,
      activated_gates: ['G_FATO_CRITICO_AUSENTE'],
    };
  }

  // --- Gate 2: casado civil exige processo conjunto (Regra Vasques R1) ---
  if (signals.estado_civil_value === 'casado_civil' && signals.processo_value !== 'conjunto') {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: 'corrigir_processo_para_conjunto',
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.PROCESSO_INVALIDO_PARA_ESTADO_CIVIL,
      structural_reason:
        `estado_civil='casado_civil' exige processo='conjunto'; ` +
        `processo atual='${signals.processo_value}'.`,
      track_signal: MEIO_A_SIGNAL_POLICY.CASADO_CIVIL_FORCA_CONJUNTO,
      missing_required_facts: [],
      activated_gates: ['G_COMPOSICAO_FAMILIAR'],
    };
  }

  // --- Gate 3: composição familiar exige composition_actor ---
  if (signals.composition_required && !signals.composition_actor_detected) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: 'coletar_composition_actor',
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.COMPOSICAO_SEM_ATOR,
      structural_reason: `processo='composicao_familiar' exige composition_actor válido no Meio A.`,
      track_signal: MEIO_A_SIGNAL_POLICY.COMPOSICAO_RELEVANTE_DETECTADA,
      missing_required_facts: ['composition_actor'],
      activated_gates: ['G_COMPOSICAO_FAMILIAR'],
    };
  }

  // --- Gate 4: dependents_required exige dependents_count ---
  if (signals.dependents_required && !signals.dependents_count_detected) {
    return {
      can_advance: false,
      authorized_next_step: MEIO_A_NEXT_STEP.REMAIN_IN_QUALIFICATION_CIVIL,
      next_objective: 'coletar_dependents_count',
      criteria_code: MEIO_A_BLOCKING_CONDITIONS.DEPENDENTE_SEM_QUANTIDADE,
      structural_reason:
        `dependents_applicable=true exige dependents_count antes de concluir a composição do Meio A.`,
      track_signal: MEIO_A_SIGNAL_POLICY.DEPENDENTE_APLICAVEL,
      missing_required_facts: ['dependents_count'],
      activated_gates: ['G_COMPOSICAO_FAMILIAR'],
    };
  }

  // --- Meio A completo → avança para qualification_renda ---
  return {
    can_advance: true,
    authorized_next_step: MEIO_A_NEXT_STEP.ADVANCE_TO_RENDA,
    next_objective: `avancar_para_${MEIO_A_NEXT_STEP.ADVANCE_TO_RENDA}`,
    criteria_code: MEIO_A_ADVANCE_CRITERIA.TRILHO_VALIDO_ESTRUTURAL,
    structural_reason: buildAdvanceReason(signals),
    track_signal: buildTrackSignal(signals),
    missing_required_facts: [],
    activated_gates: [],
  };
}
```

---

## Funções auxiliares

### buildAdvanceReason

```typescript
function buildAdvanceReason(signals: MeioASignals): string {
  const base =
    `Meio A validado com estado_civil='${signals.estado_civil_value}' ` +
    `e processo='${signals.processo_value}'.`;

  if (signals.composition_actor_detected) {
    return `${base} composition_actor='${signals.composition_actor_value}' confirmado.`;
  }

  return `${base} Nenhuma composição adicional crítica pendente neste recorte.`;
}
```

### buildTrackSignal

```typescript
function buildTrackSignal(signals: MeioASignals): string {
  if (signals.dependents_required)          return MEIO_A_SIGNAL_POLICY.DEPENDENTE_APLICAVEL;
  if (signals.p3_required_value === true)   return MEIO_A_SIGNAL_POLICY.COMPOSICAO_COMPLEXA_P3;
  if (signals.composition_actor_detected)   return MEIO_A_SIGNAL_POLICY.COMPOSICAO_RELEVANTE_DETECTADA;
  return MEIO_A_SIGNAL_POLICY.TRILHO_VALIDO_SEM_COMPOSICAO;
}
```

**Prioridade de track_signal no avanço:**
1. `dependente_aplicavel` (mais restritivo)
2. `composicao_complexa_p3`
3. `composicao_relevante_detectada`
4. `trilho_valido_sem_composicao` (default)

---

## Mapa completo dos 4 gates do Meio A

| Gate | Condição de bloqueio | next_objective | gate ativado |
|------|---------------------|----------------|--------------|
| G1 | `estado_civil` ou `processo` ausentes | `coletar_estado_civil` / `coletar_processo` | `G_FATO_CRITICO_AUSENTE` |
| G2 | `casado_civil` + `processo ≠ conjunto` | `corrigir_processo_para_conjunto` | `G_COMPOSICAO_FAMILIAR` |
| G3 | `processo=composicao_familiar` + sem `composition_actor` | `coletar_composition_actor` | `G_COMPOSICAO_FAMILIAR` |
| G4 | `dependents_required=true` + sem `dependents_count` | `coletar_dependents_count` | `G_COMPOSICAO_FAMILIAR` |
| — | Todos satisfeitos | `avancar_para_qualification_renda` | `[]` |

---

## Regras Vasques implementadas nos gates

| Regra Vasques | Implementação |
|---------------|---------------|
| R1: casado civil → processo obrigatoriamente conjunto | Gate 2: `casado_civil && processo ≠ conjunto` → bloqueia |
| R3: solteiro pode solo ou composição | Nenhum gate bloqueia `solteiro + solo` ou `solteiro + composicao_familiar` |
| R5: dependente condicional | Gate 4: `dependents_required && !dependents_count_detected` → bloqueia |

**Regras Vasques R2, R4, R6–R9: não implementadas nos gates atuais** — R4 (avô >67 alerta), R6 (financiamentos_conjunto), R7-R9 (cascading P3) ficam para extensões L09/L10.

---

## Condição dependents_required (derivada em meio-a-parser.ts)

```typescript
const dependentsRequired = processoValue !== 'conjunto' && dependentsApplicableValue === true;
```

**Lógica:** dependente só é obrigatório quando:
- processo ≠ `conjunto` (se conjunto, cônjuge já entra — dependente skip)
- `dependents_applicable = true` (explicitamente declarado pelo lead)
