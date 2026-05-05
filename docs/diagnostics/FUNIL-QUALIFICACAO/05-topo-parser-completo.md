# src/core/topo-parser.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: L05 — Parser/Extrator do Topo do Funil

---

## Cabeçalho e âncora contratual

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator do Topo do Funil (L05)
 *
 * Cláusula-fonte: L-03 (Interface Core ↔ Extractor)
 * Bloco legado:   L05 — Topo do Funil — Parser
 * Página-fonte:   PDF 6, pp. 3–4 (F0: customer_goal; F7: current_intent; F9: offtrack_type)
 *                 E6.1 — PDF 4, p. 8: "Topo natural sem perder captação do primeiro sinal útil."
 *
 * RESTRIÇÃO INVIOLÁVEL: este parser NÃO gera fala ao cliente.
 * Ele valida e normaliza sinais estruturais extraídos pelo LLM.
 * O LLM é soberano da fala — este módulo é soberano da validação estrutural.
 *
 * ESCOPO: interface Core ↔ Extractor para o stage de discovery/topo apenas.
 * Facts de Meio A (L07+) e Meio B (L11+) não estão aqui.
 */
```

---

## Interface de entrada: TopoTurnExtract

```typescript
export interface TopoTurnExtract {
  /** Facts já persistidos do lead (estado atual em enova_state). */
  facts_current: Record<string, unknown>;
  /** Facts recém-extraídos pelo LLM neste turno (não validados). */
  facts_extracted: Record<string, unknown>;
}
```

**Nota de merge:** `facts_extracted` sobrescreve `facts_current` para o mesmo key. Facts do turno atual têm prioridade sobre o estado persistido.

---

## Interface de saída: TopoSignals

```typescript
export interface TopoSignals {
  // F0: customer_goal
  customer_goal_detected: boolean;
  customer_goal_value: CustomerGoal | null;

  // F7: current_intent
  current_intent_detected: boolean;
  current_intent_value: CurrentIntent | null;

  // F9: offtrack_type
  offtrack_detected: boolean;
  offtrack_type_value: OfftrackType | null;

  // nome_completo (rota canônica Gate 2)
  nome_completo_detected: boolean;
  nome_completo_value: string | null;

  // nacionalidade (rota canônica Gate 3)
  nacionalidade_detected: boolean;
  nacionalidade_value: 'brasileiro' | 'estrangeiro' | 'naturalizado' | null;

  // RNM (rota canônica Gate 4 — apenas para estrangeiros)
  rnm_detectado: boolean;
  rnm_valido: boolean | null;   // null = não informado

  // Status da extração
  parse_status: 'ready' | 'partial' | 'empty';
  //   'ready'   → customer_goal presente e válido
  //   'partial' → algum sinal mas customer_goal ausente
  //   'empty'   → nenhum sinal detectado

  // Rastreabilidade
  keys_checked: string[];
}
```

---

## Valores canônicos validados

```typescript
const VALID_CUSTOMER_GOALS = new Set([
  'comprar_imovel', 'entender_programa', 'enviar_docs', 'visitar_imovel', 'outro',
]);

const VALID_CURRENT_INTENTS = new Set([
  'entender_programa', 'seguir_analise', 'enviar_docs', 'visita',
]);

const VALID_OFFTRACK_TYPES = new Set([
  'curiosidade', 'objecao', 'desabafo', 'pergunta_lateral',
]);

const VALID_NACIONALIDADES = new Set([
  'brasileiro', 'estrangeiro', 'naturalizado',
]);
```

**Valores fora dos sets → normalizador retorna `null` → campo `_detected = false`.**

---

## Extrator principal: extractTopoSignals

```typescript
export function extractTopoSignals(input: TopoTurnExtract): TopoSignals {
  // 1. Merge: extracted override current
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const keysChecked = [
    ...TOPO_REQUIRED_FACTS,   // ['customer_goal', 'nome_completo', 'nacionalidade']
    ...TOPO_OPTIONAL_FACTS,   // ['channel_origin', 'current_intent']
    TOPO_OFFTRACK_FACT_KEY,   // 'offtrack_type'
    'nome_completo',
    'nacionalidade',
    'rnm_valido',
    'rnm_status',
  ];

  // 2. F0: customer_goal
  const rawCustomerGoal = merged['customer_goal'];
  const customerGoalValue = normalizeCustomerGoal(rawCustomerGoal);
  const customerGoalDetected = customerGoalValue !== null;

  // 3. F7: current_intent
  const rawCurrentIntent = merged['current_intent'];
  const currentIntentValue = normalizeCurrentIntent(rawCurrentIntent);
  const currentIntentDetected = currentIntentValue !== null;

  // 4. F9: offtrack_type
  const rawOfftrackType = merged[TOPO_OFFTRACK_FACT_KEY];
  const offtrackTypeValue = normalizeOfftrackType(rawOfftrackType);
  const offtrackDetected = offtrackTypeValue !== null;

  // 5. nome_completo
  const rawNome = merged['nome_completo'];
  const nomeCompletoValue = (rawNome != null && typeof rawNome === 'string' && rawNome.trim().length > 0)
    ? rawNome.trim()
    : null;
  const nomeCompletoDetected = nomeCompletoValue !== null;

  // 6. nacionalidade
  const rawNacionalidade = merged['nacionalidade'];
  const nacionalidadeValue = normalizeNacionalidade(rawNacionalidade);
  const nacionalidadeDetected = nacionalidadeValue !== null;

  // 7. RNM — dois caminhos de entrada
  const rawRnmValido = merged['rnm_valido'];
  const rawRnmStatus = merged['rnm_status'];
  const rnmValidoResolved = resolveRnmValido(rawRnmValido, rawRnmStatus);
  const rnmDetectado = rawRnmValido !== undefined || rawRnmStatus !== undefined;

  // 8. parse_status
  const parseStatus = computeParseStatus(customerGoalDetected, currentIntentDetected);

  return { ... };
}
```

---

## Normalizadores internos

### normalizeCustomerGoal
```typescript
function normalizeCustomerGoal(raw: unknown): CustomerGoal | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (VALID_CUSTOMER_GOALS.has(value)) return value as CustomerGoal;
  return null;
}
```

### normalizeNacionalidade
```typescript
function normalizeNacionalidade(raw: unknown): NacionalidadeValue | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase() as NacionalidadeValue;
  if (VALID_NACIONALIDADES.has(value)) return value;
  return null;
}
```

### resolveRnmValido
```typescript
function resolveRnmValido(rawRnmValido: unknown, rawRnmStatus: unknown): boolean | null {
  if (rawRnmValido === true) return true;
  if (rawRnmValido === false) return false;
  if (rawRnmStatus === 'valido') return true;
  if (rawRnmStatus === 'invalido' || rawRnmStatus === 'expirado' || rawRnmStatus === 'ausente') return false;
  return null;   // não informado
}
```

### computeParseStatus
```typescript
function computeParseStatus(
  customerGoalDetected: boolean,
  currentIntentDetected: boolean,
): TopoSignals['parse_status'] {
  if (customerGoalDetected) return 'ready';
  if (currentIntentDetected) return 'partial';
  return 'empty';
}
```

---

## Fluxo de dados por campo

| Campo | Fonte bruta | Normalizador | Saída |
|-------|-------------|--------------|-------|
| `customer_goal` | `merged['customer_goal']` | `normalizeCustomerGoal` | `CustomerGoal \| null` |
| `current_intent` | `merged['current_intent']` | `normalizeCurrentIntent` | `CurrentIntent \| null` |
| `offtrack_type` | `merged['offtrack_type']` | `normalizeOfftrackType` | `OfftrackType \| null` |
| `nome_completo` | `merged['nome_completo']` | string trim | `string \| null` |
| `nacionalidade` | `merged['nacionalidade']` | `normalizeNacionalidade` | `NacionalidadeValue \| null` |
| `rnm_valido` | `merged['rnm_valido']` + `merged['rnm_status']` | `resolveRnmValido` | `boolean \| null` |

---

## Diferença entre text-extractor e topo-parser

| | text-extractor.ts | topo-parser.ts |
|--|---|---|
| Entrada | Texto livre WhatsApp | Facts já extraídos (Record) |
| Saída | `Record<string, unknown>` (facts brutos) | `TopoSignals` (sinais validados) |
| Operação | Keyword matching + regex | Normalização + validação de enum |
| Escopo | Todos os stages (switch) | Somente topo/discovery (L05) |
| Merge | Não faz merge | Faz merge `facts_current` + `facts_extracted` |
| Lança exceção | Nunca (try/catch → {}) | Não (valores inválidos → null) |
