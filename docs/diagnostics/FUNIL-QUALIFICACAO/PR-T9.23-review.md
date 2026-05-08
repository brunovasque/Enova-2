# PR-T9.23-review — Remover captura de estado_civil em discovery + script E2E PowerShell

**PR:** #260 — https://github.com/brunovasque/Enova-2/pull/260
**Branch:** `fix/t9.23-estado-civil-discovery`
**Base:** `main`
**Commit:** `8200678`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 2 arquivos (1 modificado + 1 novo)

---

## Problemas corrigidos

### Bug — Loop de confirmação de estado_civil em discovery

**Causa raiz:** o bloco de captura de `estado_civil` em `extractDiscovery` (adicionado em T9.17D como workaround) continua capturando `estado_civil` mesmo quando o stage é `'discovery'`. O Core em stage `discovery` não processa `estado_civil` — o topo usa `extractTopoSignals` + `evaluateTopoCriteria`, que ignoram `estado_civil`. Resultado: `estado_civil` era gravado nos facts mas o Core emitia o mesmo `next_objective` indefinidamente, causando loop de confirmação.

**Sequência do bug:**
1. Lead responde "Solteiro" quando `pendingObjective='avancar_para_qualification_civil'`
2. `extractDiscovery` captura `estado_civil='solteiro'` e persiste
3. Core em stage `discovery` avalia topo — vê que topo está completo, emite `AVANCAR_PARA_CIVIL`
4. Mas `_next_objective` persiste como `'Perguntar estado civil...'`
5. Próximo turno: `extractDiscovery` continua tentando capturar `estado_civil`
6. Core continua emitindo `next_objective` de estado civil — loop

**Fix:** remover completamente o bloco de `estado_civil` de `extractDiscovery`. `estado_civil` é responsabilidade exclusiva de `extractQualificationCivil`.

---

## Mudanças

### `src/core/text-extractor.ts`

**Removido** (13 linhas — bloco completo):

```typescript
// estado_civil — captura contextual em discovery quando sistema aguardava estado civil (T9.17D)
if (facts['estado_civil'] === undefined) {
  if (
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.'
  ) {
    if (contains(n, 'solteiro', 'solteira')) facts['estado_civil'] = 'solteiro';
    else if (contains(n, 'casado', 'casada')) facts['estado_civil'] = 'casado_civil';
    else if (contains(n, 'uniao', 'amasiado')) facts['estado_civil'] = 'uniao_estavel';
    else if (contains(n, 'divorciado', 'divorciada', 'separado')) facts['estado_civil'] = 'divorciado';
    else if (contains(n, 'viuvo', 'viuva')) facts['estado_civil'] = 'viuvo';
  }
}
```

**Preservado intacto** — bloco `processo` em `extractDiscovery`:

```typescript
// processo — captura contextual quando sistema aguardava resposta sobre processo (T9.17D)
if (facts['processo'] === undefined) {
  if (
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.' ||
    pendingObjective === 'Estado civil coletado. Agora perguntar...'
  ) {
    // solo / conjunto / composicao_familiar
  }
}
```

**Preservado intacto** — `extractQualificationCivil` continua capturando `estado_civil`:

```typescript
function extractQualificationCivil(n: string, pendingObjective?: string): Record<string, unknown> {
  // estado_civil contextual (pendingObjective = 'coletar_estado_civil' | ...)
  // estado_civil keywords específicas
  // estado_civil_p3
  // processo, composition_actor, dependents_*
}
```

### `scripts/enova-e2e-test.ps1` (novo arquivo)

Script PowerShell de teste E2E real contra Worker PROD. 2 cenários:

| Cenário | Turnos | Validações |
|---|---|---|
| C1 — Brasileiro solteiro solo CLT | 8 | nome_completo, nacionalidade, estado_civil, processo, regime_trabalho |
| C2 — Casado civil | 5 | estado_civil=casado_civil |

**Uso:**
```powershell
$env:SUPABASE_URL = "https://xxx.supabase.co"
$env:SUPABASE_SERVICE_KEY = "eyJ..."
.\scripts\enova-e2e-test.ps1
```

Parâmetros configuráveis: `-WorkerUrl`, `-WaId`, `-PhoneNumberId`, `-TurnDelay`.

---

## Invariantes preservados

- `extractDiscovery` continua capturando: `customer_goal`, `conhece_mcmv`, `nome_completo`, `nacionalidade`, `rnm_valido`, `alternativa_rnm`, `processo`, `composition_actor`
- `estado_civil` capturado APENAS em `extractQualificationCivil`
- Função pura — zero I/O, zero side effects
- `src/core/engine.ts` — sem alteração
- `src/core/meio-a-gates.ts` — sem alteração
- `src/core/topo-gates.ts` — sem alteração
- `src/llm/client.ts` — sem alteração
- `src/supabase/` — sem alteração
- `src/meta/canary-pipeline.ts` — sem alteração

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **104/104 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

Nenhum smoke existente testava `estado_civil` em `stage='discovery'` — zero caso de teste quebrado.

---

## Rollback

```bash
git revert 8200678
```

Seguro: 1 arquivo de código (13 linhas removidas) + 1 script novo. Zero schema, zero migration, zero flags.
