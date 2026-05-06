# PR-T9.16B — RNM Alternativa + Greeting

**PR:** #241  
**Branch:** `fix/t9.16b-rnm-alternativa-greeting`  
**Commit principal:** `9dc5585`  
**Data:** 2026-05-06  
**Tipo:** PR-IMPL contratual — frente T9

---

## Problema resolvido

**Antes:** Estrangeiro com RNM com prazo determinado (inválido) ficava preso em loop. Gate 4 original (`!signals.rnm_valido`) disparava para AMBOS `null` e `false` — mas `rnm_valido=false` não tinha rota de saída. Lead não avançava e não era encerrado.

**Agora:** 
- `rnm_valido=null` → Gate 4 (original) → `PERGUNTAR_RNM` (comportamento preservado)  
- `rnm_valido=false` → Gate 4A → `VERIFICAR_ALTERNATIVA_RNM` (tem cônjuge/familiar brasileiro?)  
- `rnm_valido=false` + `alternativa_rnm='sem_alternativa'` → Gate 4B → `ENCERRAR_SEM_ALTERNATIVA_RNM`  
- `rnm_valido=false` + alternativa confirmada → avança para `qualification_civil`

**Bônus:** Lead novo com topo vazio (`parse_status='empty'`) recebe greeting estruturado (`APRESENTAR_E_VERIFICAR_CONHECIMENTO`) em vez de "Tem interesse em comprar?".

---

## Arquivos modificados (6)

### 1. `src/core/topo-rules.ts`

**TOPO_BLOCKING_CONDITIONS** — 2 novos:
```typescript
RNM_INVALIDO_VERIFICAR_ALTERNATIVA: 'topo.rnm_invalido_verificar_alternativa',
SEM_ALTERNATIVA_RNM: 'topo.sem_alternativa_rnm',
```

**TOPO_NEXT_OBJECTIVES** — 3 novos:
```typescript
APRESENTAR_E_VERIFICAR_CONHECIMENTO: 'apresentar_e_verificar_conhecimento',
VERIFICAR_ALTERNATIVA_RNM: 'verificar_alternativa_rnm',
ENCERRAR_SEM_ALTERNATIVA_RNM: 'encerrar_sem_alternativa_rnm',
```

**TOPO_NEXT_STEP** — 1 novo (mesmo valor de `ADVANCE_TO_QUALIFICATION`):
```typescript
ADVANCE_TO_QUALIFICATION_VIA_ALTERNATIVA: 'qualification_civil',
```

### 2. `src/core/topo-parser.ts`

Tipo local adicionado:
```typescript
type AlternativaRnm = 'tem_conjuge_brasileiro' | 'tem_familiar_brasileiro' | 'sem_alternativa';
```

Campo adicionado a `TopoSignals`:
```typescript
alternativa_rnm: AlternativaRnm | null;
```

Extração em `extractTopoSignals`:
```typescript
const alternativaRnm = normalizeAlternativaRnm(merged['alternativa_rnm']);
```

Normalizador adicionado:
```typescript
function normalizeAlternativaRnm(raw: unknown): AlternativaRnm | null {
  if (raw === 'tem_conjuge_brasileiro') return 'tem_conjuge_brasileiro';
  if (raw === 'tem_familiar_brasileiro') return 'tem_familiar_brasileiro';
  if (raw === 'sem_alternativa') return 'sem_alternativa';
  return null;
}
```

### 3. `src/core/topo-gates.ts`

**Gate 1 atualizado** — greeting para topo vazio:
```typescript
if (!signals.customer_goal_detected) {
  const nextObj = signals.parse_status === 'empty'
    ? TOPO_NEXT_OBJECTIVES.APRESENTAR_E_VERIFICAR_CONHECIMENTO
    : TOPO_NEXT_OBJECTIVES.COLETAR_CUSTOMER_GOAL;
  return { ..., next_objective: nextObj };
}
```

**Gate 4 (original) — agora verifica `=== null`:**
```typescript
if (signals.nacionalidade_value === 'estrangeiro' && signals.rnm_valido === null) {
  return { ..., next_objective: TOPO_NEXT_OBJECTIVES.PERGUNTAR_RNM };
}
```

**Gates 4A/4B — nova lógica para `rnm_valido=false`:**
```typescript
const alternativaRnm = signals.alternativa_rnm;
if (signals.nacionalidade_value === 'estrangeiro' && signals.rnm_valido === false) {
  if (alternativaRnm === 'tem_conjuge_brasileiro' || alternativaRnm === 'tem_familiar_brasileiro') {
    // passa para avanço final
  } else if (alternativaRnm === 'sem_alternativa') {
    return { ..., next_objective: TOPO_NEXT_OBJECTIVES.ENCERRAR_SEM_ALTERNATIVA_RNM }; // 4B
  } else {
    return { ..., next_objective: TOPO_NEXT_OBJECTIVES.VERIFICAR_ALTERNATIVA_RNM };    // 4A
  }
}
```

**`isTopoFactoCriticoAusente` atualizado:**
```typescript
if (signals.nacionalidade_value === 'estrangeiro') {
  if (signals.rnm_valido === null) return true;
  if (signals.rnm_valido === false) {
    const alt = signals.alternativa_rnm;
    if (alt !== 'tem_conjuge_brasileiro' && alt !== 'tem_familiar_brasileiro') return true;
  }
}
```

### 4. `src/core/text-extractor.ts`

Extração de `alternativa_rnm` em `extractDiscovery` após o bloco `rnm_valido`:

```typescript
// Contextual: quando sistema perguntou alternativa RNM
if (pendingObjective === 'verificar_alternativa_rnm') {
  if (contains(n, 'nao tenho', 'nao tem', 'ninguem', 'sem alternativa', 'nenhum')) {
    facts['alternativa_rnm'] = 'sem_alternativa';
  } else if (contains(n, 'esposa', 'marido', 'conjuge', 'companheiro', 'companheira',
      'mae', 'ma', 'pai', 'irmao', 'irma', 'familiar', 'parente', 'brasileiro')) {
    facts['alternativa_rnm'] = 'tem_familiar_brasileiro';
  }
}
// Keywords diretas (frases específicas para evitar falsos positivos)
if (facts['alternativa_rnm'] === undefined) {
  if (contains(n, 'minha esposa e brasileira', 'meu marido e brasileiro',
      'conjuge brasileiro', 'familiar brasileiro', 'parente brasileiro')) {
    facts['alternativa_rnm'] = 'tem_familiar_brasileiro';
  }
}
```

### 5. `src/core/semantic-next-objective.ts`

3 novos mapeamentos:
```typescript
'apresentar_e_verificar_conhecimento':
  'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar de forma '
  + 'natural se o cliente já conhece o programa ou se gostaria de entender como funciona. '
  + 'Tom: acolhedor, sem pressão.',

'verificar_alternativa_rnm':
  'Informar ao cliente que o RNM com data de validade não é aceito pelo programa MCMV '
  + '(financiamento de até 35 anos requer prazo indeterminado). Perguntar se possui cônjuge '
  + 'ou familiar brasileiro que possa fazer o financiamento, pois nesse caso é possível '
  + 'seguir o processo no nome dessa pessoa.',

'encerrar_sem_alternativa_rnm':
  'Informar com empatia que infelizmente sem RNM por prazo indeterminado e sem cônjuge ou '
  + 'familiar brasileiro, não é possível seguir com o financiamento pelo MCMV no momento. '
  + 'Orientar que assim que regularizar o RNM (obter prazo indeterminado), pode retornar '
  + 'que a Enova estará aqui para ajudar. Encerrar deixando a porta aberta.',
```

### 6. `src/core/smoke.ts`

**Cenário 1 atualizado:** `next_objective` agora espera `apresentar_e_verificar_conhecimento` (topo vazio → greeting).

**4 novos cenários:**

| Cenário | Input | next_objective esperado |
|---|---|---|
| 25 | estrangeiro + rnm_valido=false + sem alternativa | `verificar_alternativa_rnm` |
| 26 | estrangeiro + rnm_valido=false + alternativa=sem_alternativa | `encerrar_sem_alternativa_rnm` |
| 27 | estrangeiro + rnm_valido=false + alternativa=tem_familiar | avança → qualification_civil |
| 28 | facts={} | `apresentar_e_verificar_conhecimento` |

---

## Resultados de teste

| Suite | Antes | Depois |
|---|---|---|
| `smoke` (core) | 24/24 | **28/28** |
| `smoke:core:text-extractor` | 89/89 | 89/89 |
| `smoke:meta:canary` | 41/41 | 41/41 |
| `prove:t9.15h-facts-persistence` | 34/34 | 34/34 |
| `prove:t9.14-reverse-mapper` | 19/19 | 19/19 |

---

## Mapa de rota do estrangeiro (pós-T9.16B)

```
estrangeiro declarado
    │
    ├─ rnm_valido=null   → Gate 4 → PERGUNTAR_RNM
    │                       (pendingObjective → T9.16A extrai resposta)
    │
    ├─ rnm_valido=true   → avança para qualification_civil
    │
    └─ rnm_valido=false
           │
           ├─ alternativa=null          → Gate 4A → VERIFICAR_ALTERNATIVA_RNM
           │                               (pendingObjective → T9.16A extrai resposta)
           │
           ├─ alternativa=tem_familiar  → avança para qualification_civil (via familiar)
           ├─ alternativa=tem_conjuge   → avança para qualification_civil (via cônjuge)
           │
           └─ alternativa=sem_alternativa → Gate 4B → ENCERRAR_SEM_ALTERNATIVA_RNM
```

---

## Rollback

```bash
git revert 9dc5585
```

Seguro: sem migration, sem schema, sem flags. `alternativa_rnm=null` → Gate 4A bloqueia (comportamento correto como estado intermediário).

---

## Próxima ação

Vasques merge PR #241 → repetir T9.15B-PROVA-REAL-CANARY com topo completo.
