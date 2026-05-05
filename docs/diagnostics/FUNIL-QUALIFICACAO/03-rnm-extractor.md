# RNM — Extração, Parsing e Gate no Core Mecânico 2
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)

---

## 1. text-extractor.ts — Extração de rnm_valido da mensagem

**Comando:** `grep -n "rnm|RNM|rnm_valido|rnm_status" src/core/text-extractor.ts | head -30`

```
52:  'rnm', 'registro',
131:  // rnm_valido — negação primeiro para evitar falsos positivos ("Não tenho RNM" tem "tenho rnm")
133:    contains(n, 'sem rnm', 'nao tenho rnm', 'rnm invalido', 'rnm vencido', 'rnm expirado')
135:    facts['rnm_valido'] = false;
137:    contains(n, 'rnm valido', 'rnm ok', 'tenho rnm', 'meu rnm', 'registro valido', 'rnm em dia')
139:    facts['rnm_valido'] = true;
```

### Lógica completa (linhas 131–140)

```typescript
// rnm_valido — negação primeiro para evitar falsos positivos ("Não tenho RNM" tem "tenho rnm")
if (
  contains(n, 'sem rnm', 'nao tenho rnm', 'rnm invalido', 'rnm vencido', 'rnm expirado')
) {
  facts['rnm_valido'] = false;
} else if (
  contains(n, 'rnm valido', 'rnm ok', 'tenho rnm', 'meu rnm', 'registro valido', 'rnm em dia')
) {
  facts['rnm_valido'] = true;
}
```

### Observações críticas — text-extractor

| Ponto | Detalhe |
|-------|---------|
| Negação primeiro | "sem rnm" avaliado antes de "tenho rnm" — evita falso positivo em "Não tenho RNM" |
| Resultado quando ausente | fact `rnm_valido` não setado (undefined) — não é `false` |
| Keywords negativas | `sem rnm`, `nao tenho rnm`, `rnm invalido`, `rnm vencido`, `rnm expirado` |
| Keywords positivas | `rnm valido`, `rnm ok`, `tenho rnm`, `meu rnm`, `registro valido`, `rnm em dia` |
| `rnm` e `registro` em stopwords? | Linha 52 lista `'rnm', 'registro'` — contexto: provavelmente lista de keywords de domínio, não stopwords |

---

## 2. topo-parser.ts — Parsing e resolução de rnm_valido

**Comando:** `grep -n "rnm|RNM|rnm_valido" src/core/topo-parser.ts | head -20`

```
56:  * — PDF 6, pp. 3–4. Rota canônica topo ENOVA 2: customer_goal → nome_completo → nacionalidade → (rnm).
84:  /** RNM foi mencionado/verificado (relevante apenas para estrangeiros)? */
85:  rnm_detectado: boolean;
86:  /** RNM está válido? true=sim, false=inválido/ausente, null=não informado. */
87:  rnm_valido: boolean | null;
149: *        Rota canônica topo ENOVA 2: customer_goal → nome_completo → nacionalidade → (rnm).
165:    'rnm_valido',
166:    'rnm_status',
196:  // --- RNM (para estrangeiros) ---
197:  const rawRnmValido = merged['rnm_valido'];
198:  const rawRnmStatus = merged['rnm_status'];
199:  const rnmValidoResolved = resolveRnmValido(rawRnmValido, rawRnmStatus);
200:  const rnmDetectado = rawRnmValido !== undefined || rawRnmStatus !== undefined;
216:    rnm_detectado: rnmDetectado,
217:    rnm_valido: rnmValidoResolved,
290: * Resolve rnm_valido a partir de rnm_valido (boolean) ou rnm_status (string).
```

### TopoSignals — campos RNM (linhas 84–87)

```typescript
/** RNM foi mencionado/verificado (relevante apenas para estrangeiros)? */
rnm_detectado: boolean;
/** RNM está válido? true=sim, false=inválido/ausente, null=não informado. */
rnm_valido: boolean | null;
```

### Lógica de resolução (linhas 196–200 + função resolveRnmValido)

```typescript
// merge de facts persistidos + facts novos do turno
const rawRnmValido = merged['rnm_valido'];       // vem do text-extractor (boolean)
const rawRnmStatus = merged['rnm_status'];       // vem de fonte alternativa (string enum)
const rnmValidoResolved = resolveRnmValido(rawRnmValido, rawRnmStatus);
const rnmDetectado = rawRnmValido !== undefined || rawRnmStatus !== undefined;

// resolveRnmValido (linhas 290–299):
function resolveRnmValido(rawRnmValido: unknown, rawRnmStatus: unknown): boolean | null {
  if (rawRnmValido === true) return true;
  if (rawRnmValido === false) return false;
  if (rawRnmStatus === 'valido') return true;
  if (rawRnmStatus === 'invalido' || rawRnmStatus === 'expirado' || rawRnmStatus === 'ausente') return false;
  return null;   // não informado — gate não ativa bloqueio ainda
}
```

### Dois caminhos de entrada para rnm_valido

| Fonte | Tipo | Prioridade |
|-------|------|------------|
| `rnm_valido` (boolean) | text-extractor detecta keywords | 1ª (boolean direto) |
| `rnm_status` (string enum) | fonte alternativa: `valido` \| `invalido` \| `expirado` \| `ausente` | 2ª (fallback) |
| Nenhum dos dois | undefined | → `resolveRnmValido` retorna `null` |

### rnm_status enum canônico (inferido de resolveRnmValido)

```
'valido'    → rnm_valido = true
'invalido'  → rnm_valido = false
'expirado'  → rnm_valido = false
'ausente'   → rnm_valido = false
```

---

## 3. topo-gates.ts — Gate 4: estrangeiro sem RNM válido

**Comando:** `grep -n "rnm|RNM|rnm_valido" src/core/topo-gates.ts | head -20`

```
40:  * Rota canônica: customer_goal → nome_completo → nacionalidade → (rnm se estrangeiro).
100: *   4. estrangeiro sem RNM válido → bloqueia, perguntar RNM e validade
146:  // --- Gate 4: estrangeiro sem RNM válido ---
147:  if (signals.nacionalidade_value === 'estrangeiro' && !signals.rnm_valido) {
151:      criteria_code: TOPO_BLOCKING_CONDITIONS.ESTRANGEIRO_SEM_RNM_VALIDO,
152:      structural_reason: 'estrangeiro declarado; RNM válido ainda não confirmado.',
154:      missing_required_facts: ['rnm_valido'],
155:      next_objective: TOPO_NEXT_OBJECTIVES.PERGUNTAR_RNM,
193:  if (signals.nacionalidade_value === 'estrangeiro' && !signals.rnm_valido) return true;
```

### Gate 4 completo (linhas 146–157)

```typescript
// --- Gate 4: estrangeiro sem RNM válido ---
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
```

### Condição do Gate 4

```
nacionalidade_value === 'estrangeiro'  AND  !rnm_valido
```

`!rnm_valido` é `true` quando `rnm_valido` é:
- `false` (RNM explicitamente inválido)
- `null` (não informado ainda)
- `undefined` (não presente — edge case)

**Portanto:** estrangeiro sem nenhuma menção de RNM = bloqueio automático no Gate 4.

---

## 4. Fluxo completo do RNM — turno a turno

```
Mensagem do lead: "Sou estrangeiro, tenho rnm valido"
  ↓ text-extractor.ts
    nacionalidade → 'estrangeiro'
    rnm_valido   → true   (keyword "tenho rnm valido")
  ↓ topo-parser.ts
    rawRnmValido  = true
    rawRnmStatus  = undefined
    resolveRnmValido(true, undefined) → true
    rnmDetectado  = true
    TopoSignals.rnm_valido = true
  ↓ topo-gates.ts evaluateTopoCriteria
    Gate 4: estrangeiro && !true → false → Gate 4 NÃO bloqueia
    → topo mínimo completo → can_advance=true → qualification_civil
```

```
Mensagem do lead: "Sou estrangeiro"  (sem menção de RNM)
  ↓ text-extractor.ts
    nacionalidade → 'estrangeiro'
    rnm_valido   → undefined (nenhuma keyword encontrada)
  ↓ topo-parser.ts
    resolveRnmValido(undefined, undefined) → null
    TopoSignals.rnm_valido = null
  ↓ topo-gates.ts evaluateTopoCriteria
    Gate 4: estrangeiro && !null → true → BLOQUEIA
    next_objective: 'perguntar_rnm_e_validade'
    can_advance=false, authorized_next_step='discovery'
```

---

## 5. Lacuna identificada (LF-02 — T5_FATIA_TOPO_ABERTURA.md)

| ID | Lacuna |
|----|--------|
| LF-02 | RNM com **validade determinada** mas não expirada: contrato diz bloqueio; implementação atual em `resolveRnmValido` não distingue validade determinada vs. indeterminada — trata como binário `valido/invalido` |

**Impacto:** Lead estrangeiro com RNM de validade determinada (mesmo vigente) deveria ser bloqueado pelo contrato T5 (F1), mas o text-extractor pode classificá-lo como `rnm_valido=true` se ele disser "tenho rnm valido". A distinção validade determinada/indeterminada não está implementada no extractor.

---

## 6. Resumo

| Arquivo | Responsabilidade RNM |
|---------|----------------------|
| `text-extractor.ts` | Detecta keywords na mensagem → seta `facts['rnm_valido']` (boolean) |
| `topo-parser.ts` | Merge persistidos+novos → `resolveRnmValido` → `TopoSignals.rnm_valido` (boolean\|null) |
| `topo-gates.ts` | Gate 4: `estrangeiro && !rnm_valido` → bloqueia ou avança |
