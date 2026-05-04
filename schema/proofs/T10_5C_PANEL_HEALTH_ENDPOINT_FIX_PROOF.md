# T10.5C — Prova de Fix: Endpoint Health Panel → Worker

**Tipo**: PR-FIX — T10.5C-FIX
**Branch**: `fix/t10.5c-panel-health-endpoint`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
**Data**: 2026-05-03
**Critérios que esta prova apoia**: CA-T10-05 (/api/health com Worker real — G10.5 desbloqueado para validação Vercel)
**Diagnóstico base**: `schema/diagnostics/T10_5B_PANEL_WORKER_HEALTH_DIAG.md`

---

## 1. Endpoint antigo (antes do fix)

| Aspecto | Valor anterior |
|---------|---------------|
| Type literal (linha 15) | `endpointTested: "/__admin__/health"` |
| Chamada fetch (linha 61) | `new URL("/__admin__/health", workerBaseUrl)` |
| Respostas JSON (linhas 137, 155, 186, 203) | `endpointTested: "/__admin__/health"` |
| Status no Worker | **NÃO EXISTE** — retornava 404 `not_found` |

---

## 2. Endpoint novo (após o fix)

| Aspecto | Valor novo |
|---------|-----------|
| Type literal (linha 15) | `endpointTested: "/__admin__/go-live/health"` |
| Chamada fetch (linha 61) | `new URL("/__admin__/go-live/health", workerBaseUrl)` |
| Respostas JSON (linhas 137, 155, 186, 203) | `endpointTested: "/__admin__/go-live/health"` |
| Status no Worker | **EXISTE** — `handleGoLiveHealth` em `src/golive/health.ts` (confirmado T10.5B-DIAG) |

---

## 3. Arquivo alterado

| Arquivo | Tipo de alteração |
|---------|------------------|
| `panel-nextjs/app/api/health/route.ts` | Substituição de string — 6 ocorrências de `/__admin__/health` → `/__admin__/go-live/health` |

---

## 4. Detalhamento das ocorrências substituídas

| Linha | Contexto | Antes | Depois |
|-------|----------|-------|--------|
| 15 | TypeScript type literal | `"/__admin__/health"` | `"/__admin__/go-live/health"` |
| 61 | `new URL(...)` — chamada fetch real | `"/__admin__/health"` | `"/__admin__/go-live/health"` |
| 137 | JSON response — missing env error | `"/__admin__/health"` | `"/__admin__/go-live/health"` |
| 155 | JSON response — missing admin key error | `"/__admin__/health"` | `"/__admin__/go-live/health"` |
| 186 | JSON response — sucesso/falha Worker | `"/__admin__/health"` | `"/__admin__/go-live/health"` |
| 203 | JSON response — catch error | `"/__admin__/health"` | `"/__admin__/go-live/health"` |

**Total**: 6 ocorrências substituídas — todas as ocorrências no arquivo.

---

## 5. Comando de build e resultado

**Comando:**
```
cd panel-nextjs && npm run build
```

**Resultado:**
```
> enova-panel@0.1.0 build
> next build

  ▲ Next.js 14.2.5

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/25) ...
   Generating static pages (6/25)
   Generating static pages (12/25)
   Generating static pages (18/25)
 ✓ Generating static pages (25/25)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
...
├ ƒ /api/health                          0 B                0 B
...

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Veredito**: PASS — `✓ Compiled successfully` — zero erros TypeScript — zero erros de lint — 25 rotas geradas incluindo `/api/health` (Dynamic).

---

## 6. Confirmação de zero src/

- **Zero alteração em `src/`** — nenhum arquivo em `src/` do Worker foi tocado neste fix.
- Fix cirúrgico exclusivamente em `panel-nextjs/app/api/health/route.ts`.
- Confirmado: `git diff` não inclui nenhum arquivo `src/`.

---

## 7. Confirmação de zero Supabase

- **Zero alteração em Supabase** — nenhuma migration, nenhuma alteração de schema, nenhuma alteração de RLS, nenhum bucket alterado.
- Fix apenas no panel — Supabase não é afetado.

---

## 8. Confirmação de zero segredo

- **Zero segredo commitado** — nenhum arquivo `.env.local`, nenhum token, nenhuma key vazada.
- O fix altera apenas um path de URL (string estática).

---

## 9. Lacuna remanescente controlada

| ID | Lacuna | Status | Próxima ação |
|----|--------|--------|-------------|
| LAC-T10.5C-01 | Validação real `/api/health` em `https://enova-2.vercel.app/api/health` após merge e auto-deploy Vercel | ABERTA — depende de merge + Vercel auto-deploy | Vasques testa /api/health real pós-merge; se `ok: true` → G10.5 APROVADO |

**O fix está correto e compilando. A validação real em PROD depende do Vercel auto-deploy após merge desta PR.**

---

## 10. Efeito esperado após merge e deploy Vercel

```json
{
  "ok": true,
  "db_ok": true,
  "worker_ok": true,
  "env": {
    "hasSupabaseUrl": true,
    "hasServiceRole": true,
    "hasAdminKey": true,
    "workerBaseHost": "nv-enova-2.brunovasque.workers.dev"
  },
  "worker": {
    "endpointTested": "/__admin__/go-live/health",
    "status": 200,
    "error": null
  }
}
```

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_5C_PANEL_HEALTH_ENDPOINT_FIX_PROOF.md
Estado da evidência:                   parcial — fix implementado e build PASS; validação real em Vercel ABERTA
Há lacuna remanescente?:               sim — LAC-T10.5C-01: validação real /api/health após deploy Vercel (depende de Vasques)
Há item parcial/inconclusivo bloqueante?: não — o fix está correto; a lacuna é de validação externa, não de implementação
Fechamento permitido nesta PR?:        não — G10.5 permanece ABERTO até validação real de Vasques em Vercel PROD
Estado permitido após esta PR:         T10.5C-FIX implementada; build PASS; G10.5 aguarda validação real Vercel
Próxima PR autorizada:                 validação real Vasques (não é PR): testar /api/health em https://enova-2.vercel.app/api/health após merge+deploy
                                       Se ok: true → G10.5 APROVADO → T10.6-CRM-LINK autorizada
                                       Se ainda falhar → abrir diagnóstico baseado no retorno real
```
