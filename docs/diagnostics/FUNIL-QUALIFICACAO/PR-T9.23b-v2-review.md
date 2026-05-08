# PR-T9.23b-v2-review — fix cirurgico: bypass condicionado a E2E_TEST_ENABLED=true

**PR:** #261 — https://github.com/brunovasque/Enova-2/pull/261
**Branch:** `fix/t9.23-e2e-script-fixes`
**Base:** `main` (commit `e5a9b97`)
**Commit v2:** `fb4ccb7`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo

---

## Problema

O bypass de assinatura E2E implementado em T9.23b usava `MAINTENANCE_MODE === 'false'`
como gate de seguranca. Isso e semanticamente errado:

- `MAINTENANCE_MODE` e uma flag operacional para colocar o sistema em manutencao
- Em prod sem `MAINTENANCE_MODE` configurado, `readEnvString` retorna `undefined` != `'false'` — bypass inativo (acidentalmente correto, mas por razao errada)
- Em prod com `MAINTENANCE_MODE=true`, bypass inativo — mas por acoplamento semantico incorreto
- Se no futuro `MAINTENANCE_MODE` for removido ou renomeado, o comportamento muda silenciosamente

O bypass deve ser controlado por uma flag dedicada e explicita: `E2E_TEST_ENABLED=true`.

---

## Mudanca

### `src/meta/webhook.ts`

```
ANTES:
  const testBypass =
    input.testBypassHeader === 'true' &&
    readEnvString(input.env, 'MAINTENANCE_MODE') === 'false';

DEPOIS:
  const testBypass =
    input.testBypassHeader === 'true' &&
    readEnvString(input.env, 'E2E_TEST_ENABLED') === 'true';
```

Flag de controle: `E2E_TEST_ENABLED=true` no ambiente do worker (wrangler secret ou var de ambiente).
Em prod sem a flag: bypass inativo por padrao seguro (`undefined !== 'true'`).
Em ambiente de teste: `E2E_TEST_ENABLED=true` habilita bypass de assinatura para scripts E2E.

---

## Seguranca apos o fix

| Cenario | testBypass ativo? |
|---|---|
| `E2E_TEST_ENABLED` nao definido (prod normal) | NAO |
| `E2E_TEST_ENABLED=false` | NAO |
| `E2E_TEST_ENABLED=true` + header ausente | NAO |
| `E2E_TEST_ENABLED=true` + `x-enova-test-bypass: true` | SIM |
| `MAINTENANCE_MODE=false` sem E2E_TEST_ENABLED | NAO |

---

## Invariantes preservados

- `src/core/engine.ts` — sem alteracao
- `src/meta/canary-pipeline.ts` — sem alteracao
- Core soberano de stage/facts/gates
- 41/41 PASS canary smoke apos o fix

---

## Resultado de teste

| Suite | Resultado |
|---|---|
| `npm run smoke:meta:canary` | **41/41 PASS** |

---

## Rollback

```bash
git revert fb4ccb7
```

1 arquivo, 1 linha alterada.
