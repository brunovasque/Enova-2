# PR-T9.23b-review — fixes E2E script: timestamp UTC, bypass assinatura, validacao Supabase

**PR:** #261 — https://github.com/brunovasque/Enova-2/pull/261
**Branch:** `fix/t9.23-e2e-script-fixes`
**Base:** `main` (commit `e5a9b97`)
**Commit:** `f327a89`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 2 arquivos

---

## Problemas corrigidos

**Bug 1 — Timestamp incompativel com Windows:**
`Get-Date -UFormat %s` e um alias Unix que falha silenciosamente no PS5.1/Windows,
gerando timestamp 0 ou vazio nas mensagens enviadas ao worker. O worker Meta rejeita
mensagens com timestamp invalido.

**Bug 2 — Assinatura bloqueava scripts de teste:**
O worker valida `x-hub-signature-256` em `processMetaWebhookPost` ANTES de chegar ao
pipeline (linha 174 de `webhook.ts`). Scripts de teste nao tem `META_APP_SECRET` para
gerar a assinatura HMAC-SHA256 correta, resultando em HTTP 401/403 em toda chamada.
Nao havia mecanismo de bypass para testes E2E.

**Bug 3 — Sem validacao de env vars:**
O script chamava `Invoke-RestMethod` contra o Supabase sem verificar se `SUPABASE_URL`
e `SUPABASE_SERVICE_KEY` estavam definidos. Erros resultantes eram crипticos (timeout
ou 400 generico sem contexto).

---

## Mudancas

### `scripts/enova-e2e-test.ps1`

**Fix 1** — timestamp (linha 42):
```
ANTES:
  $ts = [int](Get-Date -UFormat %s)

DEPOIS:
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
```
Usa API .NET nativa, disponivel em PS5.1+ e PS7 no Windows sem dependencia de modulos externos.

**Fix 2** — header bypass (linhas 72-74):
```powershell
$headers = @{
  "x-enova-test-bypass" = "true"
}
```
Passado como `-Headers $headers` no `Invoke-RestMethod`. Ativa o bypass de assinatura
implementado em `webhook.ts` quando `MAINTENANCE_MODE=false`.

**Fix 3** — validacao Supabase (linhas 15-22):
```powershell
if (-not $SupabaseUrl) {
  Write-Host "[ERRO] SUPABASE_URL nao definido. ..." -ForegroundColor Red
  exit 1
}
if (-not $SupabaseKey) {
  Write-Host "[ERRO] SUPABASE_SERVICE_KEY nao definido. ..." -ForegroundColor Red
  exit 1
}
```
Falha rapida com mensagem clara antes de qualquer chamada de rede.

### `src/meta/webhook.ts`

**Add testBypassHeader** — campo opcional no input de `processMetaWebhookPost`:
```typescript
export async function processMetaWebhookPost(input: {
  rawBody: string;
  signatureHeader: string | null;
  env: MetaWorkerEnv;
  telemetryContext?: ...;
  dedupeStore?: DedupeStore;
  testBypassHeader?: string | null;   // NOVO
}): Promise<MetaWebhookPostResult>
```

**Logica de bypass** — antes da verificacao de assinatura:
```typescript
const testBypass =
  input.testBypassHeader === 'true' &&
  readEnvString(input.env, 'MAINTENANCE_MODE') === 'false';

if (!testBypass) {
  const sig = await verifyMetaSignature(...);
  // ... rejeicao 401/403 se invalido ...
}
```

**Caller** — `handleMetaWebhook` passa o header:
```typescript
const result = await processMetaWebhookPost({
  rawBody,
  signatureHeader,
  env,
  telemetryContext: ctx,
  testBypassHeader: request.headers.get('x-enova-test-bypass'),  // NOVO
});
```

---

## Seguranca do bypass

- Bypass so ativo quando `MAINTENANCE_MODE === 'false'` (string explicita)
- Em prod sem MAINTENANCE_MODE configurado (undefined), `readEnvString` retorna `undefined` != `'false'` — bypass inativo
- Em prod com `MAINTENANCE_MODE=true`, bypass inativo
- Bypass nao altera nenhuma logica de negocio downstream — apenas pula verificacao HMAC

---

## Invariantes preservados

- `src/core/engine.ts` — sem alteracao
- `src/core/text-extractor.ts` — sem alteracao
- `src/meta/canary-pipeline.ts` — sem alteracao
- Core soberano de stage/facts/gates
- LLM soberano da fala

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` | **PASS** |
| `npm run smoke:core:text-extractor` | **104/104 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run smoke:core:funil-static` | **29/29 PASS** |
| Sintaxe PS1 (`pwsh`) | **SEM ERROS** |

---

## Rollback

```bash
git revert f327a89
```

Seguro: 2 arquivos, sem schema, sem migration, sem flags novas.
