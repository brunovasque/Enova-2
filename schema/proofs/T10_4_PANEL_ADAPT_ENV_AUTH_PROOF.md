# T10.4 — Prova de Adaptação Mínima de Envs e Auth do panel-nextjs/

**Tipo**: PR-IMPL — adaptação mínima
**Branch**: `feat/t10.4-panel-adapt-env-auth`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
**Data**: 2026-05-03
**Critérios que esta prova apoia**: CA-T10-03 (parcial — build fica para T10.5), CA-T10-08 (zero src/)

---

## 1. Arquivos revisados e auditados

| Arquivo | Tipo | Achado |
|---------|------|--------|
| `panel-nextjs/app/api/crm/route.ts` | Auth guard (incoming) | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` |
| `panel-nextjs/app/api/send/route.ts` | Outgoing Worker call | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` header |
| `panel-nextjs/app/api/health/route.ts` | Outgoing Worker call | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` header |
| `panel-nextjs/app/api/bases/_shared.ts` | Outgoing Worker call (2x) | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` header |
| `panel-nextjs/app/api/prefill/route.ts` | Auth guard (incoming) | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` |
| `panel-nextjs/app/api/client-profile/route.ts` | Auth guard (incoming) | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` |
| `panel-nextjs/app/api/case-files/diagnostic/route.ts` | Auth guard (incoming) | Usa `ENOVA_ADMIN_KEY` + `x-enova-admin-key` |
| `panel-nextjs/app/api/crm/_shared.ts` | Supabase backend | Sem auth de Worker — apenas Supabase |
| `panel-nextjs/app/components/PanelNav.tsx` | UI | Sem auth — componente de navegação |

---

## 2. Mapa de auth encontrado (pré-T10.4)

### Usos de `ENOVA_ADMIN_KEY`

| Arquivo | Tipo de uso |
|---------|------------|
| `app/api/crm/route.ts` | Auth guard: expected key |
| `app/api/send/route.ts` | Outgoing Worker: chave enviada + REQUIRED_ENVS |
| `app/api/health/route.ts` | Outgoing Worker: chave enviada + REQUIRED_ENVS |
| `app/api/bases/_shared.ts` | Outgoing Worker: CALL_NOW_ENVS + 2 chamadas |
| `app/api/prefill/route.ts` | Auth guard: expected key + AUTH_ENVS |
| `app/api/client-profile/route.ts` | Auth guard: expected key + AUTH_ENVS |
| `app/api/case-files/diagnostic/route.ts` | Auth guard: expected key + REQUIRED_ENVS |

### Usos de `x-enova-admin-key`

| Arquivo | Tipo de uso |
|---------|------------|
| `app/api/crm/route.ts` | **Incoming**: header lido do request |
| `app/api/send/route.ts` | **Outgoing**: header enviado ao Worker |
| `app/api/health/route.ts` | **Outgoing**: header enviado ao Worker |
| `app/api/bases/_shared.ts` | **Outgoing**: header enviado ao Worker (2x) |
| `app/api/prefill/route.ts` | **Incoming**: header lido do request |
| `app/api/client-profile/route.ts` | **Incoming**: header lido do request |
| `app/api/case-files/diagnostic/route.ts` | **Incoming**: header lido do request |

### Usos de `CRM_ADMIN_KEY` — pré-T10.4

Nenhum. Ausente em todo o `panel-nextjs/`.

### Usos de `X-CRM-Admin-Key` — pré-T10.4

Nenhum. Ausente em todo o `panel-nextjs/`.

---

## 3. Decisão de compatibilidade CRM_ADMIN_KEY / ENOVA_ADMIN_KEY

### Helper criado

`panel-nextjs/app/lib/get-admin-key.ts`:

```typescript
export function getAdminKey(env: Record<string, string | undefined> = process.env): string {
  return env.CRM_ADMIN_KEY ?? env.ENOVA_ADMIN_KEY ?? "";
}
```

### Política T10.4

| Aspecto | Decisão |
|---------|---------|
| Chave preferencial | `CRM_ADMIN_KEY` — canônica do Enova-2/Worker |
| Chave fallback | `ENOVA_ADMIN_KEY` — compatibilidade legado |
| Auth guard (incoming) | Lê chave via `getAdminKey()` — aceita `CRM_ADMIN_KEY` ou `ENOVA_ADMIN_KEY` |
| Headers outgoing ao Worker | `X-CRM-Admin-Key` (corrigido) com valor de `getAdminKey()` |
| REQUIRED_ENVS / AUTH_ENVS | Mantêm `"ENOVA_ADMIN_KEY"` para backward compat |
| Remoção de `ENOVA_ADMIN_KEY` | Não removida em T10.4 — deferred para T10.5/T10.6 |

### Arquivos alterados (incoming — key comparison)

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `crm/route.ts` | `process.env.ENOVA_ADMIN_KEY` | `getAdminKey()` |
| `prefill/route.ts` | `process.env.ENOVA_ADMIN_KEY` | `getAdminKey()` |
| `client-profile/route.ts` | `process.env.ENOVA_ADMIN_KEY` | `getAdminKey()` |
| `case-files/diagnostic/route.ts` | `process.env.ENOVA_ADMIN_KEY` | `getAdminKey()` |

### Arquivos alterados (outgoing — Worker header)

| Arquivo | Header antes | Header depois | Key antes | Key depois |
|---------|-------------|---------------|-----------|-----------|
| `send/route.ts` | `x-enova-admin-key` | `X-CRM-Admin-Key` | `ENOVA_ADMIN_KEY` | `getAdminKey()` |
| `health/route.ts` | `x-enova-admin-key` | `X-CRM-Admin-Key` | `ENOVA_ADMIN_KEY` | `getAdminKey()` |
| `bases/_shared.ts` (2x) | `x-enova-admin-key` | `X-CRM-Admin-Key` | `ENOVA_ADMIN_KEY` | `getAdminKey()` |

---

## 4. WORKER_BASE_URL — diagnóstico

| Arquivo | Uso de WORKER_BASE_URL |
|---------|----------------------|
| `app/api/send/route.ts` | `process.env.WORKER_BASE_URL` — correto |
| `app/api/health/route.ts` | `process.env.WORKER_BASE_URL` — correto |
| `app/api/bases/_shared.ts` | `envMap.WORKER_BASE_URL` — correto |

**Conclusão**: Nenhuma URL hardcoded encontrada. `WORKER_BASE_URL` já é lida de env em todos os usos.
Documentada em `.env.example` com comentário claro sobre URL PROD.

---

## 5. Envs documentadas em `.env.example`

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE=
CRM_ADMIN_KEY=
ENOVA_ADMIN_KEY=
WORKER_BASE_URL=
OPENAI_API_KEY=
```

Nenhum valor real commitado. Arquivo adicionado à exceção no `.gitignore`
(`!panel-nextjs/.env.example` após o `panel-nextjs/.env*`).

---

## 6. Validação de zero `src/`

```
git diff --name-only HEAD | grep "^src/" → nenhum resultado
```

Zero arquivos em `src/` alterados nesta PR. ✅

---

## 7. Validação de zero Supabase schema

- Zero migrations criadas
- Zero RLS alterado
- Zero tabelas criadas ou alteradas
- Zero arquivos em `D:\Enova` alterados

---

## 8. Validação de zero segredo commitado

- `.env.example` contém apenas nomes de variáveis, sem valores reais
- `.env.local` não existe em `panel-nextjs/` (nunca commitado — coberto pelo `.gitignore`)
- `git diff` não inclui nenhum arquivo `.env` com valores reais

---

## 9. README atualizado

`panel-nextjs/README.md` atualizado com:
- Caminho correto `panel-nextjs/` (era `/panel` legado)
- Setup local básico (`npm install`, `npm run dev`, `npm run build`)
- Tabela de envs necessárias com descrição e obrigatoriedade
- Deploy recomendado: Vercel
- Worker permanece Cloudflare
- Tabela de abas do painel
- Seção de status de migração T10.1-T10.7
- Nota explícita: build/prova real ficam para T10.5

---

## 10. Lacunas declaradas para T10.5 / T10.6

| Lacuna | PR que trata |
|--------|-------------|
| `next build` não executado — pode ter erros de TypeScript | T10.5-RUN |
| Preview Vercel não configurado | T10.5-RUN |
| `/api/health` não testado com Worker real | T10.5-RUN |
| `CALL_NOW_ENVS` e `AUTH_ENVS` ainda listam `ENOVA_ADMIN_KEY` (compatibilidade) | T10.5/T10.6 |
| `x-enova-admin-key` header (incoming) mantido para compat legado | T10.5/T10.6 |
| 26 arquivos `app/lib/` ENOVA IA — lógica Enova 1 não adaptada | T10.4/T10.5 |
| CRM real com Supabase não testado | T10.6-CRM-LINK |
| node_modules não instalado em `panel-nextjs/` | T10.5-RUN (npm install) |

---

## 11. Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_4_PANEL_ADAPT_ENV_AUTH_PROOF.md
Estado da evidência:                   completa — adaptação mínima de env/auth concluída
Há lacuna remanescente?:               sim — build/deploy/health são lacunas de T10.5 (não bloqueantes para T10.4)
Há item parcial/inconclusivo bloqueante?: não — T10.4 é PR-IMPL de env/auth; não exige build/deploy
Fechamento permitido nesta PR?:        sim — T10.4-ADAPT encerrada; T10.5-RUN desbloqueada
Estado permitido após esta PR:         T10.4 CONCLUÍDA; T10.5-RUN autorizada
Próxima PR autorizada:                 T10.5-RUN (PR-PROVA — npm install, next build, preview Vercel, /api/health)
```
