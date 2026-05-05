# CORE MECÂNICO 2 — Topo Rules & Gates
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)

---

## 1. Arquivos src/core/ com lógica de funil

| Arquivo | Descrição |
|---------|-----------|
| `src/core/engine.ts` | Orquestrador principal do Core Mecânico 2 |
| `src/core/stage-map.ts` | Mapa canônico de stages (L03) e avaliador G_FATO_CRITICO_AUSENTE |
| `src/core/topo-rules.ts` | Estrutura e política do topo (L04) |
| `src/core/topo-gates.ts` | Critérios e gates de aceite do topo (L06) |
| `src/core/topo-parser.ts` | Parser de sinais do topo a partir dos facts |
| `src/core/meio-a-rules.ts` | Regras de composição familiar (Meio A) |
| `src/core/meio-b-rules.ts` | Regras de renda e regime (Meio B) |
| `src/core/semantic-next-objective.ts` | Mapper semântico de next_objective para o LLM |
| `src/core/semantic-next-objective-smoke.ts` | Testes smoke do mapper semântico |
| `src/core/smoke.ts` | Suite de smoke tests do Core |
| `src/core/text-extractor.ts` | Extrator de facts estruturados da mensagem do lead |
| `src/core/text-extractor-smoke.ts` | Testes smoke do text-extractor |
| `src/core/types.ts` | Tipos TypeScript do Core (StageId, GateId, LeadState, etc.) |

---

## 2. stage-map.ts — Mapa L03 e Gates Estruturais

### Mapa canônico de stages (STAGE_MAP)

```typescript
export const STAGE_MAP: Record<StageId, StageDefinition> = {
  discovery: {
    required_facts: ['customer_goal'],
    next_stages: ['qualification_civil'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
  },
  qualification_civil: {
    required_facts: ['estado_civil', 'processo'],
    next_stages: ['qualification_renda'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_COMPOSICAO_FAMILIAR'],
  },
  qualification_renda: {
    required_facts: ['regime_trabalho', 'renda_principal'],
    next_stages: ['qualification_eligibility'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_REGIME_RENDA'],
  },
  qualification_eligibility: {
    required_facts: ['nacionalidade'],
    next_stages: ['qualification_special', 'docs_prep'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_ELEGIBILIDADE'],
  },
  qualification_special: {
    required_facts: [],
    next_stages: ['docs_prep'],
    applicable_gates: ['G_TRILHO_ESPECIAL'],
  },
  docs_prep: {
    required_facts: ['docs_channel_choice'],
    next_stages: ['docs_collection', 'visit'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
  },
  docs_collection: {
    required_facts: ['doc_identity_status', 'doc_income_status', 'doc_residence_status'],
    next_stages: ['broker_handoff'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
  },
  broker_handoff: {
    required_facts: [],
    next_stages: [],
    applicable_gates: ['G_FINAL_OPERACIONAL'],
  },
  visit: {
    required_facts: ['visit_interest'],
    next_stages: ['broker_handoff'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE', 'G_FINAL_OPERACIONAL'],
  },
};
```

### Sequência canônica principal

```typescript
export const CANONICAL_STAGE_ORDER: StageId[] = [
  'discovery',
  'qualification_civil',
  'qualification_renda',
  'qualification_eligibility',
  'qualification_special',
  'docs_prep',
  'docs_collection',
  'broker_handoff',
];
```

### Gate G_FATO_CRITICO_AUSENTE (único gate ativo em L03)

```typescript
export function evaluateGateFatoCriticoAusente(state, stageDef): GateResult {
  const missingFacts = stageDef.required_facts.filter(
    (key) => state.facts[key] === null || state.facts[key] === undefined,
  );
  const activated = missingFacts.length > 0;
  return { gate_id: 'G_FATO_CRITICO_AUSENTE', activated, block_advance: activated, ... };
}
```

**Nota:** Gates `G_COMPOSICAO_FAMILIAR`, `G_REGIME_RENDA`, `G_ELEGIBILIDADE`, `G_FINAL_OPERACIONAL`, `G_TRILHO_ESPECIAL` são **slots reservados** para L04–L17. Em L03 retornam não-ativados.

---

## 3. topo-rules.ts — Estrutura e Política do Topo (L04)

**Âncora contratual:** L-02; Bloco legado L04; PDF 6 pp. 3–4; PDF 4 p. 8 (E6.1)

### Facts obrigatórios e opcionais

```typescript
export const TOPO_REQUIRED_FACTS = ['customer_goal', 'nome_completo', 'nacionalidade'] as const;
export const TOPO_OPTIONAL_FACTS = ['channel_origin', 'current_intent'] as const;
export const TOPO_OFFTRACK_FACT_KEY = 'offtrack_type' as const;
```

### Tipos canônicos

```typescript
export type CustomerGoal =
  | 'comprar_imovel'
  | 'entender_programa'
  | 'enviar_docs'
  | 'visitar_imovel'
  | 'outro';

export type CurrentIntent =
  | 'entender_programa'
  | 'seguir_analise'
  | 'enviar_docs'
  | 'visita';

export type OfftrackType =
  | 'curiosidade'
  | 'objecao'
  | 'desabafo'
  | 'pergunta_lateral';
```

### Condições de bloqueio

```typescript
export const TOPO_BLOCKING_CONDITIONS = {
  CUSTOMER_GOAL_AUSENTE: 'topo.customer_goal_ausente',
  NOME_COMPLETO_AUSENTE: 'topo.nome_completo_ausente',
  NACIONALIDADE_AUSENTE: 'topo.nacionalidade_ausente',
  ESTRANGEIRO_SEM_RNM_VALIDO: 'topo.estrangeiro_sem_rnm_valido',
} as const;
```

### Critérios de avanço

```typescript
export const TOPO_ADVANCE_CRITERIA = {
  CUSTOMER_GOAL_PRESENTE: 'topo.customer_goal_presente',
  NOME_COMPLETO_PRESENTE: 'topo.nome_completo_presente',
  NACIONALIDADE_PRESENTE: 'topo.nacionalidade_presente',
  TOPO_MINIMO_COMPLETO: 'topo.topo_minimo_completo',
} as const;
```

### Objetivos estruturais (next_objective — instrução ao LLM, não fala ao cliente)

```typescript
export const TOPO_NEXT_OBJECTIVES = {
  COLETAR_CUSTOMER_GOAL: 'coletar_customer_goal',
  EXPLICAR_MCMV_E_COLETAR_NOME: 'explicar_mcmv_e_coletar_nome_completo',
  PERGUNTAR_NACIONALIDADE: 'perguntar_nacionalidade',
  PERGUNTAR_RNM: 'perguntar_rnm_e_validade',
  AVANCAR_PARA_CIVIL: 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.',
} as const;
```

**Nota:** `AVANCAR_PARA_CIVIL` é instrução humana direta ao LLM (T9.15F), não código opaco.

### Política de sinal de trilho

```typescript
export const TOPO_SIGNAL_POLICY = {
  OFFTRACK_DETECTED: 'sinal_de_desvio_detectado',  // não bloqueia — LLM retorna ao objetivo
  ON_TRACK: 'lead_no_trilho_principal',
} as const;
```

### Transições autorizadas

```typescript
export const TOPO_NEXT_STEP = {
  ADVANCE_TO_QUALIFICATION: 'qualification_civil',
  REMAIN_IN_DISCOVERY: 'discovery',
} as const;
```

---

## 4. topo-gates.ts — Critérios e Gates do Topo (L06)

**Âncora contratual:** L-04; Bloco legado L06; PDF 4 p. 8 (E6.1); Gate 2 (A01)

### Interface de resultado

```typescript
export interface TopoCriteriaResult {
  can_advance: boolean;           // true = qualification_civil autorizado
  authorized_next_step: string;   // 'qualification_civil' | 'discovery'
  criteria_code: string;          // código de TOPO_BLOCKING_CONDITIONS ou TOPO_ADVANCE_CRITERIA
  structural_reason: string;      // razão interna (logs/telemetria — não é fala ao cliente)
  track_signal: string;           // OFFTRACK_DETECTED | ON_TRACK
  missing_required_facts: string[]; // lista de facts ausentes
  next_objective: string;         // instrução ao LLM para o próximo turno
}
```

### evaluateTopoCriteria — Avaliação sequencial dos 4 gates

```typescript
export function evaluateTopoCriteria(signals: TopoSignals): TopoCriteriaResult {

  // Gate 1: customer_goal ausente
  if (!signals.customer_goal_detected) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.CUSTOMER_GOAL_AUSENTE,
      structural_reason: 'customer_goal ausente — aguardando interesse do lead.',
      track_signal: TOPO_SIGNAL_POLICY.OFFTRACK_DETECTED,
      missing_required_facts: ['customer_goal'],
      next_objective: TOPO_NEXT_OBJECTIVES.COLETAR_CUSTOMER_GOAL,
    };
  }

  // Gate 2: nome_completo ausente
  if (!signals.nome_completo_detected) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.NOME_COMPLETO_AUSENTE,
      structural_reason: `customer_goal='${signals.customer_goal_value}' coletado; nome_completo ausente.`,
      track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
      missing_required_facts: ['nome_completo'],
      next_objective: TOPO_NEXT_OBJECTIVES.EXPLICAR_MCMV_E_COLETAR_NOME,
    };
  }

  // Gate 3: nacionalidade ausente
  if (!signals.nacionalidade_detected) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.NACIONALIDADE_AUSENTE,
      structural_reason: `nome_completo='${signals.nome_completo_value}' coletado; nacionalidade ausente.`,
      track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
      missing_required_facts: ['nacionalidade'],
      next_objective: TOPO_NEXT_OBJECTIVES.PERGUNTAR_NACIONALIDADE,
    };
  }

  // Gate 4: estrangeiro sem RNM válido
  if (signals.nacionalidade_value === 'estrangeiro' && !signals.rnm_valido) {
    return {
      can_advance: false,
      authorized_next_step: TOPO_NEXT_STEP.REMAIN_IN_DISCOVERY,
      criteria_code: TOPO_BLOCKING_CONDITIONS.ESTRANGEIRO_SEM_RNM_VALIDO,
      structural_reason: 'estrangeiro declarado; RNM válido ainda não confirmado.',
      track_signal: TOPO_SIGNAL_POLICY.ON_TRACK,
      missing_required_facts: ['rnm_valido'],
      next_objective: TOPO_NEXT_OBJECTIVES.PERGUNTAR_RNM,
    };
  }

  // Topo mínimo completo → avança para qualification_civil
  const trackSignal = signals.offtrack_detected
    ? TOPO_SIGNAL_POLICY.OFFTRACK_DETECTED
    : TOPO_SIGNAL_POLICY.ON_TRACK;

  return {
    can_advance: true,
    authorized_next_step: TOPO_NEXT_STEP.ADVANCE_TO_QUALIFICATION,
    criteria_code: TOPO_ADVANCE_CRITERIA.TOPO_MINIMO_COMPLETO,
    structural_reason:
      `topo mínimo completo: customer_goal='${signals.customer_goal_value}', ` +
      `nome_completo presente, nacionalidade='${signals.nacionalidade_value}'.`,
    track_signal: trackSignal,
    missing_required_facts: [],
    next_objective: TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL,
  };
}
```

### isTopoFactoCriticoAusente — Verificação rápida de facts obrigatórios

```typescript
export function isTopoFactoCriticoAusente(signals: TopoSignals): boolean {
  if (!signals.customer_goal_detected) return true;
  if (!signals.nome_completo_detected) return true;
  if (!signals.nacionalidade_detected) return true;
  if (signals.nacionalidade_value === 'estrangeiro' && !signals.rnm_valido) return true;
  return false;
}
```

---

## 5. Análise: Invariáveis do Core Mecânico 2 (Topo)

### Rota canônica INVIOLÁVEL (T9.15E — não pode ser reordenada)

```
customer_goal → nome_completo → nacionalidade → (rnm se estrangeiro) → qualification_civil
```

### Princípios arquiteturais

| Princípio | Implementação |
|-----------|---------------|
| LLM soberano da fala | Core emite só `next_objective` (instrução), nunca `reply_text` |
| Gates sequenciais | `evaluateTopoCriteria` avalia em ordem fixa — Gate 1 antes de Gate 2, etc. |
| Degradação graceful | Todo gate retorna `TopoCriteriaResult` com razão estrutural — nunca throws |
| `offtrack_type` não bloqueia | Sinaliza desvio mas não impede avanço se facts mínimos presentes |
| `customer_goal` captured = suficiente | Curiosidade é entrada válida — não bloqueia no Gate 1 |
| Telemetria integrada | `diagLog` emitido em cada turno (T9.15I — canary-pipeline.ts) |

### TopoSignals — Entradas do avaliador (topo-parser.ts)

```typescript
// Interface inferida de topo-gates.ts (fonte: topo-parser.ts)
interface TopoSignals {
  customer_goal_detected: boolean;
  customer_goal_value?: CustomerGoal;
  nome_completo_detected: boolean;
  nome_completo_value?: string;
  nacionalidade_detected: boolean;
  nacionalidade_value?: 'brasileiro' | 'estrangeiro' | 'naturalizado';
  rnm_valido: boolean;
  offtrack_detected: boolean;
}
```

---

## 6. Fluxo completo: Turno → Core → LLM

```
WhatsApp message
  ↓ Meta webhook → canary-pipeline.ts
  ↓ text-extractor.ts → facts extraídos da mensagem
  ↓ readLeadAccumulatedFacts → facts persistidos (enova_state)
  ↓ merge(persistedFacts + newFacts) → factsMap completo
  ↓ topo-parser.ts → TopoSignals
  ↓ evaluateTopoCriteria(signals) → TopoCriteriaResult
  ↓ semantic-next-objective.ts → next_objective (instrução humana)
  ↓ engine.ts → CoreDecision { stage_after, next_objective, can_advance }
  ↓ LLM recebe CoreDecision → gera fala ao cliente (soberano)
  ↓ writeLeadAccumulatedFacts → persiste facts atualizados
  ↓ diagLog(facts_persistence.write) → telemetria (T9.15I)
```
