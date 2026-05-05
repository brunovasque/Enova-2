# src/core/engine.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: L03 + L04/L05/L06 + L07/L17 — Motor de Decisão Estrutural

---

## Cabeçalho e missão

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Motor de Decisão Estrutural (L03 + L04/L05/L06 + L07/L17)
 *
 * Âncoras: L-01 (L03), L-02 (L04), L-03 (L05), L-04 (L06)
 * Blocos legados: L03 — Mapa Canônico; L04-L06 — Topo; L07-L10 — Meio A;
 *                 L11-L14 — Meio B; L15-L16 — Especiais; L17 — Final
 *
 * MISSÃO: receber estado estrutural, avaliar gates, retornar decisão estrutural.
 *
 * RESTRIÇÃO INVIOLÁVEL: esta função não retorna texto ao cliente.
 * O LLM (Speech Engine) é soberano da fala.
 * `speech_intent` é apenas sinal estrutural — não é fala.
 */
```

---

## Imports — dependências do Core

```typescript
import type { LeadState, CoreDecision } from './types.ts';
import { STAGE_MAP, evaluateApplicableGates } from './stage-map.ts';

// Topo (L04/L05/L06)
import { extractTopoSignals } from './topo-parser.ts';
import { evaluateTopoCriteria } from './topo-gates.ts';

// Meio A (L07/L10)
import { extractMeioASignals } from './meio-a-parser.ts';
import { evaluateMeioACriteria } from './meio-a-gates.ts';

// Meio B (L11/L14)
import { extractMeioBSignals } from './meio-b-parser.ts';
import { evaluateMeioBElegibilidadeCriteria, evaluateMeioBRendaCriteria } from './meio-b-gates.ts';

// Especiais (L15/L16)
import { extractEspeciaisSignals } from './especiais-parser.ts';
import { evaluateEspeciaisCriteria } from './especiais-gates.ts';

// Final Operacional (L17)
import { extractFinalSignals } from './final-parser.ts';
import {
  evaluateBrokerHandoffCriteria,
  evaluateDocsCollectionCriteria,
  evaluateDocsPrepCriteria,
  evaluateVisitCriteria,
} from './final-gates.ts';
```

---

## runCoreEngine — Ponto de entrada (roteador por stage)

```typescript
export function runCoreEngine(state: LeadState): CoreDecision {
  const stageDef = STAGE_MAP[state.current_stage];

  if (!stageDef) {
    throw new Error(`Stage desconhecido: '${state.current_stage}'.`);
  }

  // Roteamento por stage:
  if (state.current_stage === 'discovery')               return runTopoDecision(state);
  if (state.current_stage === 'qualification_civil')     return runMeioADecision(state);
  if (state.current_stage === 'qualification_renda')     return runMeioBRendaDecision(state);
  if (state.current_stage === 'qualification_eligibility') return runMeioBElegibilidadeDecision(state);
  if (state.current_stage === 'qualification_special')   return runEspeciaisDecision(state);
  if (state.current_stage === 'docs_prep')               return runDocsPrepDecision(state);
  if (state.current_stage === 'docs_collection')         return runDocsCollectionDecision(state);
  if (state.current_stage === 'visit')                   return runVisitDecision(state);
  if (state.current_stage === 'broker_handoff')          return runBrokerHandoffDecision(state);

  // --- Caminho genérico (L03): demais stages ---
  const gateResults = evaluateApplicableGates(state, stageDef);
  const activatedGates = gateResults.filter((g) => g.activated);
  const blockAdvance = activatedGates.some((g) => g.block_advance);

  const stageAfter = blockAdvance
    ? state.current_stage
    : (stageDef.next_stages[0] ?? state.current_stage);

  const primaryBlock = activatedGates.find((g) => g.block_advance);
  const nextObjective = blockAdvance && primaryBlock?.missing_fact
    ? `coletar_${primaryBlock.missing_fact}`
    : blockAdvance
      ? `resolver_bloqueio_${primaryBlock?.gate_id ?? 'desconhecido'}`
      : `avancar_para_${stageAfter}`;

  const speechIntent = blockAdvance
    ? 'bloqueio'
    : stageAfter !== state.current_stage
      ? 'transicao_stage'
      : 'coleta_dado';

  return {
    stage_current: state.current_stage,
    stage_after: stageAfter as typeof state.current_stage,
    next_objective: nextObjective,
    block_advance: blockAdvance,
    gates_activated: activatedGates.map((g) => g.gate_id),
    speech_intent: speechIntent,
    decision_id: `core-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    evaluated_at: new Date().toISOString(),
  };
}
```

---

## runTopoDecision — Discovery (L04/L05/L06)

```typescript
function runTopoDecision(state: LeadState): CoreDecision {
  // L05: extrair e validar sinais do topo
  // facts_extracted vazio — Core consome diretamente state.facts
  const topoSignals = extractTopoSignals({
    facts_current: state.facts,
    facts_extracted: {},
  });

  // L06: avaliar critérios mínimos e next step estrutural
  const topoCriteria = evaluateTopoCriteria(topoSignals);

  const blockAdvance = !topoCriteria.can_advance;
  const stageAfter = topoCriteria.authorized_next_step as LeadState['current_stage'];
  const nextObjective = topoCriteria.next_objective;

  // speech_intent: sinal estrutural — não é fala
  const speechIntent: CoreDecision['speech_intent'] = blockAdvance ? 'bloqueio' : 'transicao_stage';

  return {
    stage_current: 'discovery',
    stage_after: stageAfter,
    next_objective: nextObjective,
    block_advance: blockAdvance,
    gates_activated: blockAdvance ? ['G_FATO_CRITICO_AUSENTE'] : [],
    speech_intent: speechIntent,
    decision_id: `core-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    evaluated_at: new Date().toISOString(),
  };
}
```

**Notas:**
- `facts_extracted: {}` — interface preparada para futura integração com LLM; por ora Core usa state.facts diretamente
- `gates_activated` sempre `['G_FATO_CRITICO_AUSENTE']` quando bloqueia (topo não tem gates nomeados específicos)
- `speech_intent` no topo é sempre `bloqueio` ou `transicao_stage` — nunca `coleta_dado`

---

## runMeioADecision — qualification_civil (L07/L10)

```typescript
function runMeioADecision(state: LeadState): CoreDecision {
  const meioASignals = extractMeioASignals({ facts_current: state.facts, facts_extracted: {} });
  const meioACriteria = evaluateMeioACriteria(meioASignals);
  const blockAdvance = !meioACriteria.can_advance;
  const stageAfter = meioACriteria.authorized_next_step as LeadState['current_stage'];

  return {
    stage_current: 'qualification_civil',
    stage_after: stageAfter,
    next_objective: meioACriteria.next_objective,
    block_advance: blockAdvance,
    gates_activated: meioACriteria.activated_gates,
    speech_intent: blockAdvance ? 'bloqueio' : stageAfter !== state.current_stage ? 'transicao_stage' : 'coleta_dado',
    decision_id: `core-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    evaluated_at: new Date().toISOString(),
  };
}
```

---

## runMeioBRendaDecision — qualification_renda (L11/L14)

```typescript
function runMeioBRendaDecision(state: LeadState): CoreDecision {
  const meioBSignals = extractMeioBSignals({ facts_current: state.facts, facts_extracted: {} });
  const meioBCriteria = evaluateMeioBRendaCriteria(meioBSignals);
  // ... padrão idêntico ao Meio A
}
```

---

## runMeioBElegibilidadeDecision — qualification_eligibility (L11/L14 + especiais)

```typescript
function runMeioBElegibilidadeDecision(state: LeadState): CoreDecision {
  const meioBSignals = extractMeioBSignals({ facts_current: state.facts, facts_extracted: {} });
  const meioBCriteria = evaluateMeioBElegibilidadeCriteria(meioBSignals);

  // Bifurcação: se pode avançar E trilho especial ativo → qualification_special
  if (meioBCriteria.can_advance) {
    const especiaisSignals = extractEspeciaisSignals({ facts_current: state.facts, facts_extracted: {} });

    if (especiaisSignals.active_track !== 'none') {
      return {
        stage_current: 'qualification_eligibility',
        stage_after: 'qualification_special',
        next_objective: especiaisSignals.active_track === 'p3'
          ? 'validar_trilho_p3'
          : 'validar_multi_proponente',
        block_advance: false,
        gates_activated: [],
        speech_intent: 'transicao_stage',
        ...
      };
    }
  }
  // Se não pode avançar ou sem trilho especial → critérios normais
  ...
}
```

**Lógica de bifurcação:**
- `can_advance = true` + `active_track ∈ {p3, multi}` → `qualification_special`
- `can_advance = true` + `active_track = none` → `docs_prep`
- `can_advance = false` → permanece em `qualification_eligibility`

---

## runEspeciaisDecision — qualification_special (L15/L16)

```typescript
function runEspeciaisDecision(state: LeadState): CoreDecision {
  const especiaisSignals = extractEspeciaisSignals({ facts_current: state.facts, facts_extracted: {} });
  const especiaisCriteria = evaluateEspeciaisCriteria(especiaisSignals);
  // ... padrão: blockAdvance, stageAfter, nextObjective
}
```

---

## runDocsPrepDecision, runDocsCollectionDecision, runVisitDecision, runBrokerHandoffDecision — Final (L17)

```typescript
// Todos usam extractFinalSignals + avaliador específico + buildFinalDecision
function buildFinalDecision(stageCurrent, currentStage, criteria): CoreDecision {
  const blockAdvance = !criteria.can_advance;
  const stageAfter = criteria.authorized_next_step;
  const handoffCompleted = !blockAdvance && stageCurrent === 'broker_handoff';

  return {
    stage_current: stageCurrent,
    stage_after: stageAfter,
    next_objective: criteria.next_objective,
    block_advance: blockAdvance,
    gates_activated: criteria.activated_gates,
    speech_intent: blockAdvance
      ? 'bloqueio'
      : handoffCompleted || stageAfter !== currentStage
        ? 'transicao_stage'
        : 'coleta_dado',
    ...
  };
}
```

**Nota `broker_handoff`:** único stage onde `handoffCompleted=true` pode forçar `transicao_stage` mesmo com `stageAfter === currentStage`.

---

## Mapa de roteamento completo do Core

| Stage | Função | Blocos legados |
|-------|---------|----------------|
| `discovery` | `runTopoDecision` | L04 + L05 + L06 |
| `qualification_civil` | `runMeioADecision` | L07 + L10 |
| `qualification_renda` | `runMeioBRendaDecision` | L11 + L14 |
| `qualification_eligibility` | `runMeioBElegibilidadeDecision` | L11 + L14 + L15/L16 |
| `qualification_special` | `runEspeciaisDecision` | L15 + L16 |
| `docs_prep` | `runDocsPrepDecision` | L17 |
| `docs_collection` | `runDocsCollectionDecision` | L17 |
| `visit` | `runVisitDecision` | L17 |
| `broker_handoff` | `runBrokerHandoffDecision` | L17 |
| Demais | caminho genérico L03 | L03 (G_FATO_CRITICO_AUSENTE) |

---

## CoreDecision — contrato de saída

```typescript
// De types.ts (inferido dos retornos):
interface CoreDecision {
  stage_current: StageId;       // stage de onde o Core avaliou
  stage_after: StageId;         // próximo stage (=atual se bloqueia)
  next_objective: string;       // instrução ao LLM (traduzida pelo mapper T9.15F)
  block_advance: boolean;       // true = gates bloquearam avanço
  gates_activated: GateId[];    // gates que dispararam
  speech_intent: 'coleta_dado' | 'transicao_stage' | 'bloqueio'; // sinal estrutural
  decision_id: string;          // UUID único por decisão
  evaluated_at: string;         // ISO timestamp
}
```

---

## speech_intent — lógica por cenário

| Cenário | speech_intent |
|---------|---------------|
| Gate ativo, lead bloqueado | `'bloqueio'` |
| Avançou para próximo stage | `'transicao_stage'` |
| Handoff completo (broker) | `'transicao_stage'` |
| Permanece no stage, coleta dado | `'coleta_dado'` |

**Invariante:** `speech_intent` é sinal estrutural para o Speech Engine — nunca é fala ao cliente.
