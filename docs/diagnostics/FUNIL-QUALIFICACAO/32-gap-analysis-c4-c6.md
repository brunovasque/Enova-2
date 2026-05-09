# GAP Analysis C4 e C6 — por que ainda falham após T9.27

**Data:** 2026-05-09
**Branch:** fix/t9.27-residuais-e2e
**Tipo:** PR-DIAG / read-only
**Arquivos lidos:** meio-a-gates.ts, topo-gates.ts, topo-rules.ts, topo-parser.ts, engine.ts, semantic-next-objective.ts, text-extractor.ts, canary-pipeline.ts, enova-e2e-test.ps1

---

## PASSO 1 — next_objective emitters relevantes

### `_next_objective` é armazenado como código OPACO

```
canary-pipeline.ts:330 → factsMap['_next_objective'] = coreDecision.next_objective;
```
O `toSemanticNextObjective()` é aplicado **apenas** ao `LlmContext.next_objective` (linha 416).
O extractor recebe o **código opaco** em `pendingObjective`.
As strings semânticas nos blocos do extractor são dead code — nunca casam em runtime.

---

### Quando `processo=composicao_familiar` e `composition_actor` presente

**Arquivo:** `src/core/meio-a-gates.ts` — Gate 3B (linhas 81-97)

```
Condição:
  composition_actor_detected
  && composition_actor_value !== 'conjuge'
  && !estado_civil_p3_detected
→ next_objective = 'coletar_estado_civil_p3'
```

- Armazenado em `_next_objective` como: `'coletar_estado_civil_p3'`
- Semântico (apenas para LLM): `'Perguntar qual é o estado civil do familiar ou pessoa que vai entrar na composição. Solteiro(a), casado(a) no civil, união estável ou divorciado(a).'`
- Stage onde dispara: `qualification_civil`
- Extrator chamado: `extractQualificationCivil`

---

### Quando `nacionalidade=estrangeiro` e `rnm_valido=null`

**Arquivo:** `src/core/topo-gates.ts`

| Gate | Condição | next_objective emitido |
|------|----------|------------------------|
| 4 | `estrangeiro && rnm_valido === null` | `'perguntar_rnm_e_validade'` |
| 4A | `estrangeiro && rnm_valido === false && alternativaRnm === null` | `'verificar_alternativa_rnm'` |
| 4B | `estrangeiro && rnm_valido === false && alternativaRnm === 'sem_alternativa'` | `'encerrar_sem_alternativa_rnm'` |

- `alternativaRnm` vem de `normalizeAlternativaRnm(merged['alternativa_rnm'])` em `topo-parser.ts`
- `rnm_valido === null` significa: `merged['rnm_valido']` está `undefined` ou não é boolean

---

### Todos os códigos relacionados a alternativa_rnm, RNM, P3

| Código opaco | Emitido por | Semântico (LLM) |
|---|---|---|
| `perguntar_rnm_e_validade` | topo-gates Gate 4 | `'Perguntar se o cliente possui RNM (Registro Nacional Migratório) por prazo indeterminado...'` |
| `verificar_alternativa_rnm` | topo-gates Gate 4A | `'Informar ao cliente que o RNM com data de validade não é aceito pelo programa MCMV...'` |
| `encerrar_sem_alternativa_rnm` | topo-gates Gate 4B | `'Informar com empatia que infelizmente sem RNM...'` |
| `coletar_estado_civil_p3` | meio-a-gates Gate 3B | `'Perguntar qual é o estado civil do familiar...'` |
| `validar_rnm` | meio-b-gates Elegibilidade | *(sem mapeamento — retorna código opaco ao LLM)* |

---

## PASSO 2 — O que o text-extractor cobre para estes objetivos

### `estado_civil_p3`

| Bloco | Stage | pendingObjective reconhecido |
|---|---|---|
| `extractDiscovery` (T9.27 FIX 2) | discovery | `'coletar_estado_civil_p3'` + semantic |
| `extractQualificationCivil` (T9.26 FIX 1) | qualification_civil | `'coletar_estado_civil_p3'` + semantic |

Ambos reconhecem o código opaco. OK.

### `rnm_valido`

| Bloco | Stage | pendingObjective reconhecido |
|---|---|---|
| Contextual 4 camadas (T9.27 FIX 3) | discovery | `'perguntar_rnm_e_validade'` + semantic |
| Keyword puro (linha 194-205) | discovery | *(sem pendingObjective — qualquer texto)* |

O bloco keyword cobre frases diretas como "nao tenho rnm" sem contexto.

### `alternativa_rnm`

| Bloco | Stage | pendingObjective reconhecido |
|---|---|---|
| Contextual (T9.27 FIX 4) | discovery | `'verificar_alternativa_rnm'` + semantic |
| Keyword puro (linha 238-244) | discovery | *(sem pendingObjective)* |

Valores agora emitidos: `sem_familiar_brasileiro`, `sem_conjuge_brasileiro`, `sem_alternativa`, `tem_conjuge_brasileiro`, `tem_familiar_brasileiro`.

---

## PASSO 3 — Gaps identificados

---

### GAP-C4 — Keyword `estado_civil` em extractQualificationCivil sem guard para P3

**Arquivo:** `src/core/text-extractor.ts`, linhas 342-361

```typescript
// estado_civil — keywords específicas (apenas quando contextual não resolveu)
if (facts['estado_civil'] === undefined) {        // ← SEM guard de pendingObjective
  if (contains(n, 'sou casado', 'sou casada', 'casado no civil', 'casada no civil',
    'casamento civil', 'tenho casamento civil'))
  ) {
    facts['estado_civil'] = 'casado_civil';       // ← DISPARA para qualquer texto
  }
  // ...
}
```

**Raiz da falha C4 (turno 7 — "Casada no civil"):**

```
pendingObjective = 'coletar_estado_civil_p3'
texto = "Casada no civil"  →  n = "casada no civil"

1. Contextual estado_civil (linhas 312-329):
   pendingObjective não é 'coletar_estado_civil' / 'avancar_para...' → NÃO dispara ✓

2. Keyword estado_civil (linhas 342-361):
   NÃO tem guard → dispara!
   contains(n, 'casada no civil') → TRUE
   → facts['estado_civil'] = 'casado_civil'  ← ERRADO (dado de P3, não do lead)

3. estado_civil_p3 (linhas 406-427):
   pendingObjective === 'coletar_estado_civil_p3' → dispara ✓
   → facts['estado_civil_p3'] = 'casado_civil'  ← correto
```

**Cascata:**
- `extractedFacts = {estado_civil: 'casado_civil', estado_civil_p3: 'casado_civil'}`
- Merge: `estado_civil='casado_civil'` sobrescreve `estado_civil='solteiro'` persistido
- Core MeioA Gate 2: `casado_civil + processo=composicao_familiar ≠ conjunto` → emite `corrigir_processo_para_conjunto`
- E2E falha: `estado_civil` esperado `'solteiro'`, recebeu `'casado_civil'`

**`estado_civil_p3` É capturado corretamente** — a falha é apenas na contaminação de `estado_civil`.

**Fix necessário:**
```typescript
// Adicionar guard ao bloco keyword estado_civil:
if (facts['estado_civil'] === undefined && pendingObjective !== 'coletar_estado_civil_p3') {
```

---

### GAP-C6A — Bloco `nacionalidade` em extractDiscovery sem guard de contexto

**Arquivo:** `src/core/text-extractor.ts`, linhas 155-165

```typescript
// nacionalidade no topo (rota canônica T9.15E: coletar antes de estado civil)
if (contains(n, 'brasileiro', 'brasileira', 'nasci no brasil', 'sou do brasil')) {
  facts['nacionalidade'] = 'brasileiro';   // ← SEM qualquer guard de pendingObjective
```

**Raiz da falha C6 (turno 6 — "Nao tenho familiar brasileiro"):**

```
pendingObjective = 'verificar_alternativa_rnm'
texto = "Nao tenho familiar brasileiro"  →  n = "nao tenho familiar brasileiro"

Bloco nacionalidade (sem guard):
  contains(n, 'brasileiro') → TRUE  ← 'brasileiro' está na frase, mas como qualificador de "familiar"
  → facts['nacionalidade'] = 'brasileiro'  ← ERRADO (lead é estrangeiro)
```

**Cascata:**
- `extractedFacts = {nacionalidade: 'brasileiro', alternativa_rnm: 'sem_familiar_brasileiro'}`
- Merge: `nacionalidade='brasileiro'` sobrescreve `nacionalidade='estrangeiro'` persistido
  (a chave `nationalidade` ESTÁ em `extractedFacts` → persisted não é injetado)
- Core topo-parser: `nacionalidade_value='brasileiro'`
- Gates 4/4A/4B: `estrangeiro && ...` → NÃO disparam (nationalidade é 'brasileiro')
- Topo avança para qualification_civil (incorretamente, lead é estrangeiro sem alternativa confirmada)
- E2E falha: `nacionalidade` esperado `'estrangeiro'`, recebeu `'brasileiro'`

**Fix necessário:**
```typescript
// Opção A: guard de pendingObjective
if (facts['nacionalidade'] === undefined && pendingObjective !== 'verificar_alternativa_rnm') {
  if (contains(n, 'brasileiro', 'brasileira', 'nasci no brasil', 'sou do brasil')) {
    facts['nacionalidade'] = 'brasileiro';
  }
  // ...
}

// Opção B (mais robusta): guard contextual com pendingObjective permitido
if (facts['nacionalidade'] === undefined) {
  if (
    pendingObjective === 'perguntar_nacionalidade' ||
    pendingObjective === 'Perguntar APENAS se o cliente é brasileiro(a) ou estrangeiro(a)...'
  ) {
    if (contains(n, 'brasileiro', 'brasileira', 'nasci no brasil', 'sou do brasil')) {
      facts['nacionalidade'] = 'brasileiro';
    }
    // ...
  }
  // fallback keyword conservador sem pendingObjective
  if (facts['nacionalidade'] === undefined) {
    if (contains(n, 'sou brasileiro', 'sou brasileira', 'nasci no brasil', 'sou do brasil')) {
      facts['nacionalidade'] = 'brasileiro';
    } else if (contains(n, 'sou estrangeiro', 'sou estrangeira', 'nao sou brasileiro', 'nao sou brasileira')) {
      facts['nacionalidade'] = 'estrangeiro';
    }
  }
}
```

**Opção B é mais segura** pois restringe `'brasileiro'` e `'estrangeiro'` ao contexto certo e usa frases mínimas para o fallback keyword.

---

### GAP-C6B — normalizeAlternativaRnm não reconhece os novos valores T9.27

**Arquivo:** `src/core/topo-parser.ts`, linhas 320-325

```typescript
function normalizeAlternativaRnm(raw: unknown): AlternativaRnm | null {
  if (raw === 'tem_conjuge_brasileiro') return 'tem_conjuge_brasileiro';
  if (raw === 'tem_familiar_brasileiro') return 'tem_familiar_brasileiro';
  if (raw === 'sem_alternativa') return 'sem_alternativa';
  return null;    // ← 'sem_familiar_brasileiro' e 'sem_conjuge_brasileiro' caem aqui
}
```

**T9.27 FIX 4 adicionou 5 valores ao extrator:**
`sem_familiar_brasileiro`, `sem_conjuge_brasileiro`, `sem_alternativa`, `tem_conjuge_brasileiro`, `tem_familiar_brasileiro`

**Mas topo-parser reconhece apenas 3:** os dois novos negativos retornam `null`.

**Consequência:**
```
alternativa_rnm = 'sem_familiar_brasileiro' (stored em Supabase)
normalizeAlternativaRnm('sem_familiar_brasileiro') → null

topo-gates Gate 4B: alternativaRnm === 'sem_alternativa' → NÃO dispara
topo-gates Gate 4A: alternativaRnm === null → DISPARA → emite 'verificar_alternativa_rnm' novamente
```

Loop: mesmo após cliente dizer "Nao tenho familiar brasileiro", sistema continua perguntando a alternativa.

Se GAP-C6A for corrigido (sem contaminação de nationalidade), este loop se manifesta plenamente.

**Fix necessário:**
```typescript
// topo-parser.ts — mapear os novos valores para 'sem_alternativa'
function normalizeAlternativaRnm(raw: unknown): AlternativaRnm | null {
  if (raw === 'tem_conjuge_brasileiro') return 'tem_conjuge_brasileiro';
  if (raw === 'tem_familiar_brasileiro') return 'tem_familiar_brasileiro';
  if (
    raw === 'sem_alternativa' ||
    raw === 'sem_familiar_brasileiro' ||
    raw === 'sem_conjuge_brasileiro'
  ) return 'sem_alternativa';
  return null;
}
```

---

## Resumo dos 3 gaps

| Gap | Arquivo | Linha | Efeito | Fix |
|-----|---------|-------|--------|-----|
| C4 | `text-extractor.ts` | 342-361 | Keyword `estado_civil` dispara em resposta de P3 → contamina lead | Guard `pendingObjective !== 'coletar_estado_civil_p3'` |
| C6A | `text-extractor.ts` | 155-165 | `'brasileiro'` em "Nao tenho familiar brasileiro" → `nationalidade='brasileiro'` | Guard pendingObjective + keyword conservador |
| C6B | `topo-parser.ts` | 320-325 | `sem_familiar_brasileiro` não reconhecido pelo Core → Gate 4A loop | Mapear para `'sem_alternativa'` |

---

## Diagrama de turno C4 (após T9.27)

```
Turno 7: "Casada no civil"
stage = qualification_civil
pendingObjective = 'coletar_estado_civil_p3'

extractQualificationCivil:
  ├─ Contextual estado_civil  → NÃO dispara (pendingObjective não casa) ✓
  ├─ KEYWORD estado_civil     → DISPARA (sem guard) ✗ → estado_civil = 'casado_civil'
  └─ estado_civil_p3          → DISPARA (pendingObjective casa) ✓ → estado_civil_p3 = 'casado_civil'

merge: estado_civil = 'casado_civil' (sobrescreve 'solteiro' persistido)

Core MeioA:
  estado_civil = 'casado_civil' + processo = 'composicao_familiar' ≠ 'conjunto'
  → Gate 2 → corrigir_processo_para_conjunto  ← ERRADO

E2E: estado_civil = 'casado_civil' (esperado 'solteiro') → FAIL
```

---

## Diagrama de turno C6 (após T9.27)

```
Turno 5: "Nao tenho RNM"
stage = discovery | pendingObjective = 'perguntar_rnm_e_validade'

extractDiscovery:
  ├─ nacionalidade: "nao tenho rnm" → 'brasileiro'? NÃO ✓
  ├─ rnm_valido contextual (4 camadas): pendingObjective casa ✓
  │    camada 2: 'nao tenho' → rnm_valido = false ✓
  └─ alternativa_rnm: pendingObjective ≠ 'verificar_alternativa_rnm' → skip ✓

Core: rnm_valido = false → Gate 4A → 'verificar_alternativa_rnm' ✓

---

Turno 6: "Nao tenho familiar brasileiro"
stage = discovery | pendingObjective = 'verificar_alternativa_rnm'

extractDiscovery:
  ├─ NACIONALIDADE (sem guard): 'brasileiro' em texto → nationalidade = 'brasileiro' ✗ [GAP-C6A]
  ├─ rnm_valido: pendingObjective ≠ 'perguntar_rnm_e_validade' → skip ✓
  └─ alternativa_rnm: pendingObjective casa ✓ → 'nao tenho familiar' → 'sem_familiar_brasileiro' ✓

merge: nationalidade = 'brasileiro' (sobrescreve 'estrangeiro' persistido)

Core:
  nationalidade = 'brasileiro' → Gate 4/4A/4B NÃO disparam
  → topo avança para qualification_civil (ERRADO — lead é estrangeiro)

E2E: nationalidade = 'brasileiro' (esperado 'estrangeiro') → FAIL
     [alternativa_rnm e rnm_valido ainda presentes no Supabase — passariam]

--- Se GAP-C6A fosse corrigido (sem contaminação): ---

Core:
  nationalidade = 'estrangeiro', rnm_valido = false
  alternativa_rnm = 'sem_familiar_brasileiro'
  normalizeAlternativaRnm('sem_familiar_brasileiro') → null  [GAP-C6B]
  → Gate 4A dispara novamente → 'verificar_alternativa_rnm' (loop)
  → sem turno 7 → loop silencioso
```

---

## Observações adicionais

**Semantic checks no extrator são dead code:**
As strings semânticas (e.g., `pendingObjective === 'Perguntar qual é o estado civil...'`) nunca casam em runtime porque `_next_objective` armazena sempre o código opaco. São inofensivas mas podem gerar confusão na manutenção.

**`validar_rnm` (meio-b-gates) sem mapeamento:**
`meio-b-gates.ts` emite `'validar_rnm'` no stage `qualification_eligibility`. Não há mapeamento semântico em `semantic-next-objective.ts` → LLM recebe o código opaco. Não afeta C4/C6 (stages diferentes), mas é uma lacuna a documentar.

**Estado inicial de `rnm_valido` no topo-parser:**
`resolveRnmValido(undefined, undefined) → null`. Gate 4 checa `=== null`, não `!= true`. Correto.
