# T10.5 — Prova de Build e Health do panel-nextjs/

**Tipo**: PR-PROVA — T10.5-RUN
**Branch**: `prove/t10.5-panel-run-build-health`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
**Data**: 2026-05-03
**Critérios que esta prova apoia**: CA-T10-03 (build PASS), CA-T10-08 (zero src/), CA-T10-09 (zero migration)
**Critérios com lacuna controlada**: CA-T10-04 (preview Vercel — Vasques), CA-T10-05 (/api/health com Worker real — Vasques)

---

## 1. Ambiente

| Item | Valor |
|------|-------|
| Node.js | v24.14.1 |
| npm | 11.11.0 |
| Next.js | 14.2.5 |
| Diretório | `panel-nextjs/` no repo `D:\Enova-2` |
| Branch | `prove/t10.5-panel-run-build-health` |

---

## 2. npm install — resultado

**Comando:** `cd panel-nextjs && npm install`

**Resultado:** PASS — 67 pacotes instalados, 68 auditados

```
added 67 packages, and audited 68 packages in 33s
11 packages are looking for funding

2 vulnerabilities (1 moderate, 1 critical)
```

**postinstall script executado:**
```
> enova-panel@0.1.0 postinstall
> cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

**Observação:** 2 vulnerabilidades referem-se ao Next.js 14.2.5 (versão legada). Não é bloqueante para o build e está registrado como lacuna não bloqueante (próxima atualização do Next.js pode resolver, mas está fora de escopo T10.5).

---

## 3. npm run build — resultado

**Comando:** `cd panel-nextjs && npm run build`

**Resultado:** PASS — zero erros TypeScript, zero erros de lint, 25 páginas geradas

```
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
```

**Tabela de rotas geradas:**

| Rota | Tipo | Gerada |
|------|------|--------|
| / | Static | ✅ |
| /_not-found | Static | ✅ |
| /api/bases | Dynamic | ✅ |
| /api/case-files | Dynamic | ✅ |
| /api/case-files/diagnostic | Dynamic | ✅ |
| /api/case-files/open | Dynamic | ✅ |
| /api/client-profile | Dynamic | ✅ |
| /api/conversations | Dynamic | ✅ |
| /api/crm | Dynamic | ✅ |
| /api/enova-ia-chat | Dynamic | ✅ |
| **/api/health** | **Dynamic** | **✅** |
| /api/manual-mode | Dynamic | ✅ |
| /api/messages | Dynamic | ✅ |
| /api/prefill | Dynamic | ✅ |
| /api/send | Dynamic | ✅ |
| /atendimento | Static | ✅ |
| /atendimento/[wa_id] | Dynamic | ✅ |
| /bases | Static | ✅ |
| /conversations | Static | ✅ |
| /crm | Static | ✅ |
| /dashboard | Dynamic | ✅ |
| /dossie | Static | ✅ |
| /enova-ia | Static | ✅ |
| /incidentes | Static | ✅ |

**Total: 25 rotas — ZERO erros**

---

## 4. Erros encontrados e correções aplicadas

**Nenhum erro encontrado. Nenhuma correção necessária.**

O build passou na primeira execução sem nenhuma alteração de código adicional além das já feitas em T10.4-ADAPT.

---

## 5. Status de /api/health

**Sem envs reais — lacuna controlada.**

A rota `/api/health` foi compilada com sucesso (Dynamic — gerada no build). Em tempo de execução, sem envs reais, o comportamento esperado é:

```json
{
  "ok": false,
  "db_ok": false,
  "worker_ok": false,
  "env": {
    "hasSupabaseUrl": false,
    "hasServiceRole": false,
    "hasAdminKey": false,
    "workerBaseHost": null
  },
  "worker": {
    "endpointTested": "/__admin__/health",
    "status": null,
    "error": null
  },
  "error": "missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE, WORKER_BASE_URL"
}
```

**Status 500** — comportamento correto e esperado quando envs de infra ausentes.

Para validar `ok: true`, é necessário:
1. Deploy em Vercel com envs configuradas (Vasques): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `WORKER_BASE_URL`, `CRM_ADMIN_KEY`
2. Worker Enova-2 publicado e acessível em `WORKER_BASE_URL`

Esta lacuna é **controlada e não bloqueante para T10.6-CRM-LINK**.

---

## 6. Lacunas restantes

| ID | Lacuna | Status | Gate |
|----|--------|--------|------|
| LAC-T10.5-01 | Preview Vercel (painel carrega no browser) | ABERTA — requer deploy Vasques | G10.4 |
| LAC-T10.5-02 | `/api/health` com Worker real (`ok: true`) | ABERTA — requer envs reais + deploy | G10.5 |
| LAC-T10.5-03 | Next.js 14.2.5 tem 2 vulns (1 moderate, 1 critical) | REGISTRADA — não bloqueante, fora de escopo T10 | N/A |

---

## 7. Confirmação de zero src/

**Confirmado:** `git diff --name-only origin/main...HEAD` — zero arquivos em `src/` modificados.

`git status` confirma: apenas arquivos não rastreados pré-existentes (logs de teste T9).

---

## 8. Confirmação de zero Supabase schema

**Confirmado:** nenhuma migration criada, nenhuma alteração de RLS, nenhuma alteração de tabela/view.

---

## 9. Confirmação de zero segredo commitado

**Confirmado:**

| Verificação | Status |
|-------------|--------|
| `.env.local` existe no panel-nextjs? | NÃO — apenas `.env.example` com valores vazios |
| `.env.example` contém valor real? | NÃO — todas as vars estão vazias (`=`) |
| `git status` inclui `.env.local`? | NÃO |
| Segredo hardcoded em algum arquivo? | NÃO — `getAdminKey()` lê de `process.env` |

---

## 10. Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_5_PANEL_RUN_BUILD_HEALTH_PROOF.md
Estado da evidência:                   parcial
Há lacuna remanescente?:               sim — LAC-T10.5-01 (preview Vercel) e LAC-T10.5-02 (/api/health real)
Há item parcial/inconclusivo bloqueante?: não — build local PASS (G10.3 APROVADO); lacunas requerem ação Vasques
Fechamento permitido nesta PR?:        NÃO — G10.4 e G10.5 permanecem abertos
Estado permitido após esta PR:         T10.5 parcialmente executada — G10.3 APROVADO; G10.4/G10.5 ABERTOS
Próxima PR autorizada:                 T10.6-CRM-LINK (conforme instrução Vasques — build local validado)
```

**Nota de decisão:** Vasques autorizou T10.6-CRM-LINK como próximo passo quando o build local passa, mesmo com lacunas de Vercel/health real. As lacunas G10.4 e G10.5 serão validadas concurrentemente com ou após T10.6.
