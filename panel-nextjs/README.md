# panel-nextjs — Painel CRM Enova 2

Painel operacional CRM em **Next.js 14 (App Router)** — subprojeto isolado do repo `Enova-2`,
hospedado na Vercel. O Worker do Enova-2 permanece no Cloudflare.

## Arquitetura

```
Vercel (panel-nextjs/)  ←→  Cloudflare Worker (src/)  ←→  Supabase
```

- **Painel**: Next.js 14, React 18, TypeScript — `panel-nextjs/`
- **Worker**: Cloudflare Worker (runtime V8) — `src/`
- **Banco**: Supabase — compartilhado entre painel e Worker
- **Deploy recomendado**: Vercel (suporte nativo a Next.js 14 App Router + `node:crypto`)

## Pré-requisitos

- Node.js 18+
- npm 9+
- Acesso ao Supabase do Enova-2 (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE`)
- Worker publicado (`WORKER_BASE_URL`)
- Admin key configurada (`CRM_ADMIN_KEY` ou `ENOVA_ADMIN_KEY`)

## Instalação local

```bash
cd panel-nextjs
npm install
```

## Variáveis de ambiente

Crie `panel-nextjs/.env.local` baseado em `.env.example`:

```bash
cp .env.example .env.local
# edite .env.local com os valores reais — nunca commite este arquivo
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `SUPABASE_URL` | Sim | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE` | Sim | Service role key do Supabase |
| `CRM_ADMIN_KEY` | Preferencial | Chave canônica do Enova-2/Worker |
| `ENOVA_ADMIN_KEY` | Fallback | Compatibilidade legado (use se não tiver `CRM_ADMIN_KEY`) |
| `WORKER_BASE_URL` | Sim | URL base do Worker — ex: `https://nv-enova-2.brunovasque.workers.dev` |
| `OPENAI_API_KEY` | Não | Necessária apenas para o módulo ENOVA IA |

## Execução local

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run start
```

> **Nota T10.4**: build e deploy Vercel são validados na PR T10.5-RUN. Se houver erros de TypeScript
> ou dependências faltando, registre-os — não são bloqueantes para esta PR.

## Deploy — Vercel

1. Conecte o repo Enova-2 ao Vercel
2. Configure **Root Directory** como `panel-nextjs`
3. Configure as variáveis de ambiente no painel Vercel (nunca no código)
4. Deploy automático via push para `main`

O Worker continua no Cloudflare — nenhuma alteração necessária.

## Abas do painel

| Aba | Rota |
|-----|------|
| Conversas | `/conversations` |
| Bases | `/bases` |
| Atendimento | `/atendimento` |
| CRM | `/crm` |
| Dashboard | `/dashboard` |
| Incidentes | `/incidentes` |
| ENOVA IA | `/enova-ia` |

## Autenticação

- **Painel → Worker**: header `X-CRM-Admin-Key` com valor de `CRM_ADMIN_KEY` (ou fallback `ENOVA_ADMIN_KEY`)
- **Browser → Painel API**: header `x-enova-admin-key` (compatibilidade legado — T10.4)

## Status de migração

| Etapa | Status |
|-------|--------|
| T10.1-DIAG | ✅ Concluída |
| T10.2-CONTRACT | ✅ Concluída |
| T10.3-IMPORT | ✅ Concluída — 100 arquivos importados |
| T10.4-ADAPT | ✅ Concluída — envs, auth, WORKER_BASE_URL |
| T10.5-RUN | ⏳ Próxima — `npm install`, `next build`, preview Vercel, `/api/health` |
| T10.6-CRM-LINK | ⏳ Pendente |
| T10.7-READINESS | ⏳ Pendente |
