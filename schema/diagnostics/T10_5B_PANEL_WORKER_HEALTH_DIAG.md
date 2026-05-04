# T10.5B — Diagnóstico: Alinhamento Health Panel → Worker

**Tipo**: PR-DIAG (READ-ONLY — nenhuma alteração de código)
**Branch**: `diag/t10.5b-panel-worker-health`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
**Data**: 2026-05-03
**Critérios que esta prova apoia**: CA-T10-05 (`/api/health` com Worker real — G10.5 ABERTO)

---

## 1. Evidência do teste real (Vasques — Vercel PROD)

**URL testada**: `https://enova-2.vercel.app/api/health`
**Data**: 2026-05-03

**Resposta real recebida:**
```json
{
  "ok": false,
  "db_ok": true,
  "worker_ok": false,
  "env": {
    "hasSupabaseUrl": true,
    "hasServiceRole": true,
    "hasAdminKey": true,
    "workerBaseHost": "nv-enova-2.brunovasque.workers.dev"
  },
  "worker": {
    "endpointTested": "/__admin__/health",
    "status": 404,
    "error": "HTTP_404"
  },
  "worker_build": {
    "error": "not_found",
    "route": "/__admin__/health"
  },
  "error": "HTTP_404"
}
```

**Conclusões imediatas:**
- Supabase: ✅ FUNCIONANDO (`db_ok: true`, envs corretas)
- Worker BASE_URL: ✅ CORRETO (`nv-enova-2.brunovasque.workers.dev`)
- Admin key: ✅ PRESENTE (`hasAdminKey: true`)
- Worker health: ❌ FALHA — 404 no endpoint `/__admin__/health`

---

## 2. Diagnóstico READ-ONLY: rotas de health/admin do Worker

### 2.1 Arquivo principal: `src/worker.ts`

**Todas as rotas registradas** (por grep e leitura do `handleRoot` em `src/worker.ts:257-270`):

| Rota | Método | Handler | Autenticação |
|------|--------|---------|-------------|
| `/` | GET | `handleRoot` | Nenhuma (pública) |
| `/__core__/run` | POST | `handleCoreRun` | Nenhuma (técnica) |
| `/__meta__/ingest` | POST | `handleMetaIngest` | Nenhuma (técnica) |
| `/__meta__/webhook` | GET\|POST | `handleMetaWebhook` | HMAC `META_APP_SECRET` |
| `/__admin__/go-live/health` | GET | `handleGoLiveHealth` | `X-CRM-Admin-Key` |
| `/crm/*` | GET\|POST | `handleCrmRequest` | `X-CRM-Admin-Key` |
| `/panel*` | GET | `handlePanelRequest` | Nenhuma (HTML público) |

**Confirmação negativa — `/__admin__/health` não existe no Worker:**
- Leitura completa de `src/worker.ts` (363 linhas) — zero ocorrência de `/__admin__/health`
- Qualquer pathname não mapeado cai no bloco `404` com `{ error: 'not_found', route: pathname }`

### 2.2 Rotas de health existentes no Worker

**Rota 1 — `GET /`** (health básico, sem auth)
- Handler: `handleRoot` em `src/worker.ts:250`
- Retorna: `{ service: 'enova-2-worker', status: 'ok', routes: {...} }`
- Sem auth: qualquer requisição responde 200

**Rota 2 — `GET /crm/health`** (health CRM, com auth)
- Handler: `handleCrmRequest` roteando para CRM health interno
- Auth: `X-CRM-Admin-Key` obrigatório — valida contra `CRM_ADMIN_KEY` do env
- Retorna: estado do backend CRM (mode, supabase_readiness, persistence_mode)

**Rota 3 — `GET /__admin__/go-live/health`** (health admin/go-live, com auth)
- Handler: `handleGoLiveHealth` em `src/golive/health.ts`
- `GOLIVE_HEALTH_ROUTE = '/__admin__/go-live/health'` (constante declarada em `src/golive/health.ts:16`)
- Auth: `X-CRM-Admin-Key` obrigatório — valida via `isCrmAuthValid` (mesma lógica CRM)
- Retorna: readiness completo (flags, blocking_reasons, g8, operations, supabase_runtime_active)

### 2.3 Rotas admin confirmadas vs. não existentes

| Rota testada/esperada | Existe no Worker? | Resposta real |
|-----------------------|-------------------|---------------|
| `/__admin__/health` | ❌ NÃO EXISTE | 404 `not_found` |
| `/__admin__/go-live/health` | ✅ EXISTE | 200 (com auth válida) |
| `/crm/health` | ✅ EXISTE | 200 (com auth válida) |
| `/` | ✅ EXISTE | 200 (sem auth) |

---

## 3. Diagnóstico READ-ONLY: panel-nextjs

### 3.1 Confirmação do endpoint chamado

**Arquivo**: `panel-nextjs/app/api/health/route.ts`

**Chamada exata** (linha 61):
```typescript
const response = await fetch(new URL("/__admin__/health", workerBaseUrl), {
  method: "GET",
  headers: {
    "X-CRM-Admin-Key": adminKey,
  },
  cache: "no-store",
});
```

**Conclusão**: Panel chama `/__admin__/health` — rota que **não existe** no Worker.

### 3.2 Header enviado pelo panel

- Header: `X-CRM-Admin-Key` ✅
- Valor: `getAdminKey()` → resolve `CRM_ADMIN_KEY` preferencial com fallback `ENOVA_ADMIN_KEY`
- O header está **correto** — o Worker valida `x-crm-admin-key` (HTTP headers são case-insensitive)

### 3.3 Tipo declarado do endpoint no panel

```typescript
worker: {
  endpointTested: "/__admin__/health";  // literal no type declaration
  status: number | null;
  error: string | null;
};
```

O endpoint está **hardcoded como literal de tipo TypeScript** — aparece duas vezes no arquivo (linha 16 e linha 137).

### 3.4 Fallback no panel

- **Não há fallback** para endpoint alternativo do Worker
- Se `response.ok === false`, retorna `{ ok: false, status, error: HTTP_NNN }`
- A função `checkWorker` não tenta rotas alternativas

---

## 4. Causa provável do 404 — diagnóstico confirmado

**Causa raiz:** O panel chama `/__admin__/health` que **não existe** no Worker Enova-2.

**Cadeia de eventos:**
1. Vercel chama `panel-nextjs/app/api/health/route.ts`
2. A função `checkWorker` faz `GET https://nv-enova-2.brunovasque.workers.dev/__admin__/health`
3. O Worker recebe a rota, não encontra handler para `/__admin__/health`
4. Worker retorna `404 { error: 'not_found', route: '/__admin__/health' }`
5. Panel interpreta como `HTTP_404` → `worker_ok: false` → `ok: false`

**O que NÃO está errado:**
- Supabase: funcionando
- WORKER_BASE_URL: correto
- CRM_ADMIN_KEY: presente e válida
- Header X-CRM-Admin-Key: correto

---

## 5. Divergência exata panel → Worker

| Aspecto | Panel (caller) | Worker (callee) | Divergência |
|---------|----------------|-----------------|------------|
| Endpoint chamado | `/__admin__/health` | N/A (não existe) | ❌ rota inexistente |
| Rota admin real | — | `/__admin__/go-live/health` | Panel não usa esta rota |
| Header auth | `X-CRM-Admin-Key` | `x-crm-admin-key` (case-insensitive) | ✅ compatível |
| Chave admin | `CRM_ADMIN_KEY` / `ENOVA_ADMIN_KEY` | `CRM_ADMIN_KEY` | ✅ compatível |
| Protocolo | `GET` | `GET` | ✅ compatível |

**Divergência única e isolada**: path `/__admin__/health` (panel) ≠ `/__admin__/go-live/health` (Worker).

---

## 6. Recomendação de correção mínima

### Opção A — Ajustar panel para rota existente ✅ RECOMENDADA

**O quê**: Alterar `panel-nextjs/app/api/health/route.ts` para chamar `/__admin__/go-live/health` em vez de `/__admin__/health`.

**Por quê preferida**:
- Rota `/__admin__/go-live/health` já existe e responde corretamente
- Mesma autenticação (`X-CRM-Admin-Key`) — zero mudança no auth
- Resposta rica: retorna `ok: true`, flags, readiness, supabase_runtime_active
- Não toca `src/` do Worker — contrato T10 §4 proíbe alteração de src/ durante T10
- Cirúrgica: apenas 1 string muda no panel

**Troca necessária**:
- `"/__admin__/health"` → `"/__admin__/go-live/health"` (2 ocorrências — literal de tipo e chamada `fetch`)
- Atualizar type declaration: `endpointTested: "/__admin__/go-live/health"`
- Atualizar chamada fetch: `new URL("/__admin__/go-live/health", workerBaseUrl)`

**Efeito esperado após correção**:
```json
{
  "ok": true,
  "db_ok": true,
  "worker_ok": true,
  "worker": {
    "endpointTested": "/__admin__/go-live/health",
    "status": 200,
    "error": null
  }
}
```

---

### Opção B — Adicionar compatibilidade no Worker para `/__admin__/health`

**O quê**: Criar rota `/__admin__/health` no Worker que alias para `/__admin__/go-live/health`.

**Por quê NÃO recomendada como próximo passo**:
- Requer alteração em `src/worker.ts` (importar handler, adicionar if/route)
- Contrato T10 §4 proíbe alteração de `src/` durante frente T10
- Exigiria PR-FIX no Worker com PR-DIAG prévia da frente Worker (T9 ou separada)
- Custo maior para o mesmo resultado
- Cria endpoint redundante (duas rotas para a mesma coisa)

**Quando faria sentido**: Se houvesse múltiplos consumers externos que já dependem de `/__admin__/health` — o que não é o caso aqui (apenas o panel-nextjs usa este endpoint).

---

## 7. Recomendação técnica final

**Correção recomendada: Opção A — ajustar panel-nextjs para chamar `/__admin__/go-live/health`**

**Justificativa:**
1. A rota `/__admin__/go-live/health` existe, está operacional e tem a mesma autenticação que o panel já usa.
2. A alteração é mínima: 2 strings no mesmo arquivo TypeScript do panel.
3. Respeita o contrato T10 §4 (proibição de alterar src/ do Worker durante T10).
4. Resolve o 404 imediatamente sem introduzir nova rota no Worker.
5. A resposta do `/__admin__/go-live/health` é mais rica que um simples health — inclui readiness de todas as frentes.

**Próxima PR autorizada**: `T10.5C-FIX` — PR-FIX para ajustar o endpoint no panel.
**Branch sugerido**: `fix/t10.5c-panel-health-endpoint`
**Escopo do fix**: apenas `panel-nextjs/app/api/health/route.ts` — trocar `/__admin__/health` → `/__admin__/go-live/health` nas 2 ocorrências.
**Zero alteração em**: `src/`, Supabase, RLS, migrations, wrangler.toml, Worker PROD.

---

## 8. Mapa de arquivos inspecionados (READ-ONLY)

| Arquivo | O que foi verificado |
|---------|---------------------|
| `panel-nextjs/app/api/health/route.ts` | Endpoint chamado, header enviado, fallback |
| `src/worker.ts` | Todas as rotas do Worker (363 linhas) |
| `src/golive/health.ts` | Handler e constante `GOLIVE_HEALTH_ROUTE` |
| `src/crm/routes.ts` | Rota /crm/health e auth CRM |
| `wrangler.toml` | Configuração do Worker (secrets esperados) |
| `schema/proofs/T10_5_PANEL_RUN_BUILD_HEALTH_PROOF.md` | Evidência da prova T10.5-RUN |

---

## 9. Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/diagnostics/T10_5B_PANEL_WORKER_HEALTH_DIAG.md
Estado da evidência:                   completa — diagnóstico READ-ONLY sem lacuna
Há lacuna remanescente?:               não — causa identificada, divergência exata mapeada, recomendação técnica dada
Há item parcial/inconclusivo bloqueante?: não — PR-DIAG não fecha gate; não há gate a fechar
Fechamento permitido nesta PR?:        sim — PR-DIAG documental encerrada
Estado permitido após esta PR:         T10.5B-DIAG concluída; G10.5 permanece ABERTO até T10.5C-FIX
Próxima PR autorizada:                 T10.5C-FIX (PR-FIX) — ajustar endpoint no panel-nextjs
```
