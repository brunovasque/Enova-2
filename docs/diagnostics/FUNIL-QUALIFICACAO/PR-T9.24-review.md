# PR-T9.24-review — reativar captura estado_civil em discovery com pendingObjective novo (T9.21)

**PR:** #262 — https://github.com/brunovasque/Enova-2/pull/262
**Branch:** `fix/t9.24-estado-civil-discovery-novo`
**Base:** `main` (commit `ec9d515`)
**Commit:** `8451866`
**Data:** 2026-05-09
**Tipo:** PR-IMPL — correcao_incidental — 2 arquivos

---

## Problema

T9.23 removeu corretamente o bloco de `estado_civil` em `extractDiscovery` porque os
pendingObjectives usados eram anteriores a T9.21 e causavam loop:

- Antigo: check em `avancar_para_qualification_civil` → capturava `estado_civil` no stage de
  discovery mas o Core (ainda em discovery) não consumia o fact → ficava pedindo estado civil
  infinitamente

T9.21 mudou o semantic mapper de `avancar_para_qualification_civil`:

```
ANTES: 'Perguntar APENAS se o cliente pretende comprar sozinho(a) ou terá alguém junto...'
DEPOIS: 'Perguntar APENAS o estado civil do cliente: solteiro(a), casado(a) no civil,
         união estável ou divorciado(a)/viúvo(a). Uma pergunta só. Não perguntar mais nada.'
```

O problema é que o stage ainda é `discovery` quando o cliente responde ao estado civil
perguntado pelo LLM. O Core só avança o stage no turno seguinte. Precisamos capturar
`estado_civil` em discovery com os pendingObjectives corretos pós-T9.21.

---

## Mudança

### `src/core/text-extractor.ts`

Bloco inserido em `extractDiscovery` após o bloco de `processo` (linhas 218-240),
antes de `return facts;`:

```typescript
// estado_civil contextual em discovery (T9.24)
// Reativado após T9.21 ter mudado avancar_para_qualification_civil para perguntar
// estado civil (não processo). Stage só muda no próximo turno — precisamos capturar
// estado_civil em discovery quando o LLM já perguntou estado civil neste turno.
if (facts['estado_civil'] === undefined) {
  if (
    pendingObjective === 'Perguntar APENAS o estado civil do cliente: solteiro(a), casado(a) no civil, união estável ou divorciado(a)/viúvo(a). Uma pergunta só. Não perguntar mais nada.' ||
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'coletar_estado_civil'
  ) {
    if (contains(n, 'solteiro', 'solteira')) facts['estado_civil'] = 'solteiro';
    else if (contains(n, 'casado no civil', 'casada no civil', 'casamento civil')) facts['estado_civil'] = 'casado_civil';
    else if (contains(n, 'casado', 'casada')) facts['estado_civil'] = 'casado_civil';
    else if (contains(n, 'uniao estavel', 'união estável', 'amasiado', 'amasiada')) facts['estado_civil'] = 'uniao_estavel';
    else if (contains(n, 'divorciado', 'divorciada', 'separado', 'separada')) facts['estado_civil'] = 'divorciado';
    else if (contains(n, 'viuvo', 'viúva', 'viuva')) facts['estado_civil'] = 'viuvo';
  }
}
```

**Verificação do pendingObjective semântico** contra `semantic-next-objective.ts`:
```typescript
// linha 55-58 de semantic-next-objective.ts:
'avancar_para_qualification_civil':
  'Perguntar APENAS o estado civil do cliente: '
  + 'solteiro(a), casado(a) no civil, união estável ou divorciado(a)/viúvo(a). '
  + 'Uma pergunta só. Não perguntar mais nada.',
```
Strings idênticas — match confirmado.

**Por que `casado no civil` antes de `casado`:**
`'casado no civil'` é substring de `'casado'` (após normalização). Se `casado` fosse checado
primeiro, `'casado no civil'` retornaria `casado_civil` via o ramo errado. A ordem garante
especificidade maior primeiro.

**Por que o loop antigo não ocorre:**
- T9.21 muda o semantic de `avancar_para_qualification_civil` para perguntar estado civil
- O Core em discovery agora avança para `qualification_civil` quando `estado_civil` está presente
- Antes de T9.21, o Core não consumia `estado_civil` em discovery → loop
- Após T9.21, o Core consome → stage avança → sem loop

### `src/core/text-extractor-smoke.ts`

CTX24 adicionado após CTX23:

```typescript
eq('CTX24: "Solteiro" + pendingObjective=Perguntar APENAS o estado civil... + stage=discovery → estado_civil=solteiro',
  extractFactsFromText(
    'Solteiro',
    'discovery',
    'Perguntar APENAS o estado civil do cliente: solteiro(a), casado(a) no civil, união estável ou divorciado(a)/viúvo(a). Uma pergunta só. Não perguntar mais nada.',
  )['estado_civil'],
  'solteiro');
```

---

## Invariantes preservados

- `src/core/engine.ts` — sem alteração
- `src/core/semantic-next-objective.ts` — sem alteração
- `src/meta/canary-pipeline.ts` — sem alteração
- Extrator é função pura: zero I/O, zero side effects
- LLM soberano da fala; Core soberano de stage/facts/gates

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke:core:text-extractor` | **105/105 PASS** (CTX24 adicionado, era 104) |
| `npm run smoke` | **PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |

---

## Rollback

```bash
git revert 8451866
```

Seguro: 2 arquivos, função pura, zero schema, zero migration, zero flags.
