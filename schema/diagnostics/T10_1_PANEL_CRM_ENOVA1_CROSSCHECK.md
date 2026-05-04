# T10.1 — Diagnóstico Crosscheck Panel CRM Enova 1 → Migração ao Enova-2

**Tipo**: PR-DIAG | **Branch**: `diag/t10.1-panel-crm-enova1-crosscheck`  
**Contrato ativo**: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` (T9 permanece aberto; esta PR é abertura diagnóstica da frente Panel/CRM — frente nova, fora do escopo T9)  
**Data**: 2026-05-03  
**Fonte legada lida**: `D:\Enova\panel` (READ-ONLY — nenhum arquivo alterado)

---

## 1. Objetivo

Inventariar e planejar a migração do painel CRM/panel do Enova 1 para o Enova-2.

O Enova-2 está focado em Worker/Cloudflare/runtime/Supabase, mas o CRM visual/panel completo
ainda não foi migrado. O Enova 1 tem o painel inteiro em `D:\Enova\panel`. Este diagnóstico
responde o que existe, o que falta, quais riscos há e qual a estratégia recomendada.

---

## 2. Estrutura real do painel no Enova 1

### 2.1 Tecnologia base

| Campo | Valor |
|-------|-------|
| Framework | **Next.js 14.2.5** (App Router) |
| React | 18.3.1 |
| TypeScript | 5.5.3 |
| Dependências principais | `next`, `react`, `react-dom`, `openai`, `pdfjs-dist` |
| Dev deps | `@types/node`, `@types/react`, `@types/react-dom`, `typescript` |
| Runtime | **Node.js** (não Cloudflare Worker) |
| Build | `next build` / `next dev` |
| Sem SDK Supabase | Usa fetch HTTP puro para REST API do Supabase |

Arquivo: `D:\Enova\panel\package.json`

### 2.2 Estrutura de diretórios

```
D:\Enova\panel/
├── package.json               ← dependências acima
├── next.config.js             ← webpack alias canvas=false (pdfjs-dist SSR fix)
├── next-env.d.ts
├── tsconfig.json
├── public/                    ← favicon.png, pdf.worker.min.mjs (copiado via postinstall)
└── app/
    ├── layout.tsx             ← PanelNav + globais
    ├── page.tsx               ← raiz
    ├── globals.css
    ├── components/
    │   └── PanelNav.tsx       ← navbar com 7 abas
    ├── lib/                   ← lógica ENOVA IA (26 arquivos TS)
    │   ├── enova-ia-openai.ts
    │   ├── enova-ia-chat.ts
    │   ├── enova-ia-leitura.ts
    │   ├── enova-ia-fila.ts
    │   ├── enova-ia-programas.ts
    │   ├── lead-autonomy.ts / lead-cognitive.ts / lead-docs.ts ...
    │   └── (+ outros 18 arquivos de domínio)
    ├── api/                   ← Server Actions / API Routes
    │   ├── atendimento/       ← lê enova_attendance_v1, escreve enova_attendance_meta
    │   ├── bases/             ← lê crm_lead_meta, bases_leads_v1
    │   ├── case-files/        ← dossiê
    │   ├── client-profile/    ← perfil do cliente
    │   ├── conversations/     ← lê enova_state, enova_log
    │   ├── crm/               ← lê crm_leads_v1, crm_lead_meta, crm_override_log
    │   ├── enova-ia-chat/     ← POST chat OpenAI (lê contexto, resposta estruturada)
    │   ├── health/            ← GET health (lê enova_state, chama Worker)
    │   ├── incidentes/        ← gestão de incidentes
    │   ├── manual-mode/       ← toggle enova_state.atendimento_manual
    │   ├── messages/          ← lê enova_log
    │   ├── prefill/           ← lê/escreve enova_prefill_meta
    │   └── send/              ← POST mensagem (chama Worker via WORKER_BASE_URL)
    ├── atendimento/           ← aba Atendimento (UI)
    ├── bases/                 ← aba Bases (UI)
    ├── conversations/         ← aba Conversas (UI) — inclui PdfThumbnail, SmartFilePreview
    ├── crm/                   ← aba CRM (UI)
    │   ├── CrmUI.tsx          ← componente principal (5 abas: PASTA/ANÁLISE/APROVADO/REPROVADO/VISITA)
    │   ├── AprovadoFichaView.tsx
    │   └── actions.ts         ← Server Actions
    ├── dashboard/             ← aba Dashboard (UI)
    ├── dossie/                ← aba Dossiê
    ├── enova-ia/              ← aba ENOVA IA (UI + chat)
    └── incidentes/            ← aba Incidentes (UI)
```

### 2.3 As 7 abas do painel

| Aba | Rota | Função principal |
|-----|------|-----------------|
| Conversas | `/conversations` | Lista conversas recentes; preview PDF; histórico de mensagens |
| Bases | `/bases` | Gestão de leads na base (COLD_POOL/WARM_POOL/HOT_POOL); edição de metadados |
| Atendimento | `/atendimento` | Perfil completo do lead em atendimento; toggle manual mode; prefill |
| CRM | `/crm` | 5 sub-abas CRM (PASTA/ANÁLISE/APROVADO/REPROVADO/VISITA); actions de análise, visita, reserva |
| Dashboard | `/dashboard` | Métricas e indicadores operacionais |
| Incidentes | `/incidentes` | Gestão de incidentes abertos |
| ENOVA IA | `/enova-ia` | Chat assistido com OpenAI; análise de leads; fila de prioridade; programas |

---

## 3. Framework e versão

- **Next.js 14.2.5** com App Router — versão estável madura.
- **Node.js runtime** (usa `node:crypto` para `timingSafeEqual` na auth).
- Sem `@supabase/supabase-js` — toda comunicação Supabase é via fetch HTTP puro ao REST API.
- Usa `openai` SDK v4 para ENOVA IA.
- Usa `pdfjs-dist` para renderizar PDFs inline.
- **Não usa** nenhuma dependência específica de Vercel (sem `@vercel/*`).

---

## 4. Rotas e APIs do painel

### 4.1 API Routes (Next.js server-side)

| Rota | Método | Tabelas/fontes | Propósito |
|------|--------|---------------|-----------|
| `/api/health` | GET | `enova_state`, Worker `/__admin__/health` | Health check duplo: DB + Worker |
| `/api/conversations` | GET | `enova_state`, `enova_log` | Lista conversas recentes |
| `/api/messages` | GET | `enova_log` | Mensagens por wa_id |
| `/api/crm` | GET/POST | `crm_leads_v1` (VIEW), `crm_lead_meta`, `crm_override_log` | Gestão CRM completa |
| `/api/bases` | GET/POST | `crm_lead_meta`, `bases_leads_v1` (VIEW) | Gestão base de leads |
| `/api/atendimento` | GET/POST | `enova_attendance_v1` (VIEW), `enova_attendance_meta` | Atendimento |
| `/api/case-files` | GET/POST | (dossiê — `enova_docs` ou similar) | Dossiê de documentos |
| `/api/client-profile` | GET/POST | `enova_state`, `crm_lead_meta` | Perfil completo do lead |
| `/api/manual-mode` | POST | `enova_state.atendimento_manual` | Toggle modo manual |
| `/api/prefill` | GET/POST | `enova_prefill_meta` | Pré-dados administrativos |
| `/api/send` | POST | Worker `/__meta__/send` ou equivalente | Envio de mensagem WhatsApp |
| `/api/enova-ia-chat` | POST | OpenAI API; lê contexto do lead | Chat assistido IA |

### 4.2 Arquivos CRM centrais

- `app/crm/CrmUI.tsx` — componente principal do CRM. Define 5 sub-abas:
  - `PASTA` → leads em `envio_docs` ou `status_analise=DOCS_PENDING`
  - `ANALISE` → leads em `aguardando_retorno_correspondente` ou `SENT/UNDER_ANALYSIS/ADJUSTMENT_REQUIRED`
  - `APROVADO` → `aprovado_funil=true` ou `status_analise=APPROVED_HIGH/APPROVED_LOW`
  - `REPROVADO` → `reprovado_funil=true` ou `status_analise=REJECTED_RECOVERABLE/REJECTED_HARD`
  - `VISITA` → leads em `agendamento_visita`, `visita_confirmada`, `finalizacao_processo`

- `app/api/crm/_shared.ts` — backend do CRM. Actions: `update_analysis`, `update_visit`,
  `update_reserve`, `update_approved`, `update_rejection`, `log_override`.

- `app/crm/actions.ts` — Server Actions que chamam `listCrmLeads` e `runCrmAction`.

- `app/lib/` — 26 arquivos de lógica para ENOVA IA (autonomy, cognitive, docs, followup,
  meta-ops, reclassification, visit-readiness, knowledge, programas etc.).

---

## 5. Tabelas e views Supabase lidas pelo painel

| Tabela/View | Tipo | Uso no painel | Já existe no Enova-2? |
|-------------|------|--------------|----------------------|
| `enova_state` | tabela | conversas, health, atendimento, manual-mode | **SIM** — lida em T9 |
| `enova_log` | tabela | conversas, mensagens | Provavelmente sim (T8 diagnóstico) |
| `crm_lead_meta` | tabela | CRM, bases, atendimento | **SIM** — usada desde T8.4 |
| `crm_leads_v1` | VIEW | CRM (listagem principal) | Declarada em T8.3; schema não confirmado no Enova-2 |
| `crm_override_log` | tabela | CRM (auditoria) | **SIM** — usada em T8.4 |
| `enova_attendance_v1` | VIEW | atendimento | NÃO confirmada no Enova-2 |
| `enova_attendance_meta` | tabela | atendimento (write) | NÃO confirmada no Enova-2 |
| `bases_leads_v1` | VIEW | bases (com incidentes) | NÃO confirmada no Enova-2 |
| `enova_prefill_meta` | tabela | prefill (pré-dados admin) | NÃO confirmada no Enova-2 |
| `enova_docs` ou similar | tabela | case-files / dossiê | Declarada em T8 (`enova_docs`); schema parcial |

**Conclusão:** O Enova-2 já provou leitura real de `crm_lead_meta`, `enova_state`, `crm_override_log`
(T8/T9). As views `crm_leads_v1`, `enova_attendance_v1`, `bases_leads_v1` e as tabelas
`enova_attendance_meta`, `enova_prefill_meta` precisam ser confirmadas no schema Supabase real.

---

## 6. Envs e admin keys necessárias

| Env | Onde é usada | Status no Enova-2 |
|-----|-------------|------------------|
| `SUPABASE_URL` | Todas as rotas API | **JÁ DECLARADA** — T9.1 |
| `SUPABASE_SERVICE_ROLE` | Todas as rotas API | **JÁ DECLARADA** — T9.1 |
| `ENOVA_ADMIN_KEY` | Auth painel → Worker (header `x-enova-admin-key`) | Diverge: Enova-2 usa `CRM_ADMIN_KEY` / `X-CRM-Admin-Key` |
| `WORKER_BASE_URL` | `/api/health`, `/api/send` — chama Worker Cloudflare | Não declarada no Enova-2 (o Worker é o próprio Enova-2) |
| `OPENAI_API_KEY` | ENOVA IA chat | Não declarada como env do painel Next.js no Enova-2 |

**Gap de auth crítico:**
- Enova 1 panel usa header `x-enova-admin-key` com env `ENOVA_ADMIN_KEY`
- Enova-2 Worker usa header `X-CRM-Admin-Key` com env `CRM_ADMIN_KEY`
- A migração precisa alinhar um dos dois ou manter os dois com mesmo valor

---

## 7. Dependência de Vercel

- O painel Enova 1 **não usa dependências Vercel específicas** (`@vercel/*`).
- É um Next.js padrão — pode ser deployado em Vercel, Railway, Render, ou auto-hospedado.
- O deploy atual do Enova 1 é presumivelmente Vercel (padrão para Next.js).
- Recomendação: manter deploy em **Vercel** para o painel migrado — é o caminho de menor resistência.
- Alternativa: **Cloudflare Pages** suporta Next.js 14 via `@cloudflare/next-on-pages`, mas tem limitações
  (módulos Node.js não disponíveis — `node:crypto` precisaria ser substituído por Web Crypto API).

---

## 8. O que falta no Enova-2 para hospedar o painel

| Item faltante | Impacto | Complexidade |
|---------------|---------|-------------|
| App Next.js no repositório | Painel inteiro precisa de subdiretório `/panel-nextjs` ou repo separado | Alta |
| `WORKER_BASE_URL` configurado | Painel aponta para o Worker Cloudflare — precisa de URL real | Baixa |
| Alinhamento de `ENOVA_ADMIN_KEY` vs `CRM_ADMIN_KEY` | Auth diverge entre painel e Worker | Média |
| Views Supabase não confirmadas | `crm_leads_v1`, `enova_attendance_v1`, `bases_leads_v1` | Média |
| Tabelas não confirmadas | `enova_attendance_meta`, `enova_prefill_meta` | Média |
| `OPENAI_API_KEY` no painel | ENOVA IA depende de acesso OpenAI server-side | Baixa |
| Env de deploy (Vercel) | `.env.local` com todas as vars acima | Baixa |

---

## 9. Vercel vs Cloudflare Pages

| Critério | Vercel | Cloudflare Pages |
|----------|--------|-----------------|
| Suporte Next.js 14 | **Nativo — zero configuração** | Via `@cloudflare/next-on-pages` (requer adaptações) |
| `node:crypto` (`timingSafeEqual`) | **Disponível** | Não disponível — precisa substituição por Web Crypto |
| Deploy simplificado | **Sim** — push → deploy automático | Sim — similar |
| Custo | Free tier generoso | Free tier similar |
| Risco de migração | **Baixo** — sem mudanças de código | Médio — incompatibilidades Node.js |
| Integração Supabase | Nativa | Nativa |
| Integração com Worker Cloudflare | Via `WORKER_BASE_URL` | Idem |

**Recomendação: Vercel.** O painel já usa `node:crypto` (`timingSafeEqual` em `app/api/crm/route.ts`).
Migrar para Cloudflare Pages exigiria substituir esse módulo por Web Crypto API — trabalho adicional
sem benefício técnico claro. Vercel é o caminho mais rápido e seguro.

---

## 10. Riscos ao copiar o painel inteiro

| Risco | Severidade | Descrição |
|-------|-----------|-----------|
| **Conflito de framework** | CRÍTICO | Enova-2 é Cloudflare Worker (sem Node.js). O painel Next.js não pode rodar dentro do Worker. |
| **`node:crypto` incompatível** | ALTO | `timingSafeEqual` de `node:crypto` não existe no Cloudflare Worker runtime. |
| **Schema Supabase divergente** | ALTO | Views (`crm_leads_v1`, etc.) podem não existir ou ter schema diferente do que o painel espera. |
| **Auth divergente** | MÉDIO | `ENOVA_ADMIN_KEY` vs `CRM_ADMIN_KEY`; headers diferentes entre painel e Worker. |
| **26 arquivos de lógica ENOVA IA** | MÉDIO | `app/lib/` tem 26 arquivos com lógica complexa — dependem de schema, prompts e contexto Enova 1. |
| **`WORKER_BASE_URL` não configurada** | MÉDIO | Painel chama Worker via URL — sem essa env, `/api/health` e `/api/send` falham. |
| **Views de atendimento não provadas** | MÉDIO | `enova_attendance_v1`, `bases_leads_v1` precisam existir no Supabase. |
| **`enova_prefill_meta` não provada** | MÉDIO | Tabela de pré-dados pode não existir no schema atual. |
| **CSS embutido nos módulos** | BAIXO | Cada aba tem `.module.css` próprio — compatível mas precisa de build Next.js. |
| **Divergência de `package.json`** | BAIXO | Enova-2 usa `tsx`/Worker; painel usa Next.js — são projetos distintos, sem conflito se separados. |

**Conclusão principal:** Copiar o painel inteiro **para dentro do repositório Cloudflare Worker é impossível
sem separação**. O painel DEVE ser mantido como projeto Next.js separado (subdiretório ou repo próprio),
apontando para o Worker Enova-2 via `WORKER_BASE_URL`.

---

## 11. Comparação Enova-2 atual vs Enova 1 panel

### 11.1 O Enova-2 já tem um mini-painel

`D:\Enova-2\src\panel\handler.ts` — HTML/CSS/JS embutidos em constante TS, servido em `/panel`.

| Aspecto | Mini-painel Enova-2 (T8.5) | Painel Enova 1 |
|---------|---------------------------|----------------|
| Framework | Nenhum (HTML/JS embutido) | Next.js 14.2.5 |
| Abas | 7 (Conversas, Bases, Atendimento, CRM, Dashboard, Incidentes, ENOVA IA) | 7 (mesmas) |
| Auth | `X-CRM-Admin-Key` via localStorage | `x-enova-admin-key` via localStorage |
| Backend | `/crm/*` do Worker Cloudflare | `/api/*` Server Actions + Worker via WORKER_BASE_URL |
| Supabase | Via Worker (indirect) | Direto (fetch HTTP Supabase REST API) |
| ENOVA IA | Stub (empty-state) | Completa (OpenAI + 26 lib files) |
| PDF | Não suportado | pdfjs-dist |
| Estado | `real_*: false` — empty-state declarado | Dados reais em PROD |
| Deploy | Dentro do Worker (sem build) | Separado (Next.js build) |

### 11.2 Conflitos identificados

1. **Framework**: Enova-2 Worker ≠ Next.js. Não há conflito de `package.json` se mantidos separados.
2. **Auth header**: `X-CRM-Admin-Key` (Enova-2) ≠ `x-enova-admin-key` (Enova 1). Precisam ser unificados.
3. **Endpoints do Worker**: Enova 1 chama `/__admin__/health` e não `/crm/*` para health. Compatível.
4. **`WORKER_BASE_URL`**: O painel Enova 1 precisa saber a URL do Worker Enova-2. Enova-2 Worker
   publicado em `https://nv-enova-2.brunovasque.workers.dev` — essa é a URL a configurar.
5. **Views Supabase**: `crm_leads_v1` usada pelo CRM do Enova 1 pode não refletir o schema atual do Enova-2.

### 11.3 O que importar o painel inteiro causaria

- Criar subdiretório `/panel-nextjs/` no Enova-2 com o app Next.js completo **não conflita** com Worker.
- O Worker continua em `/src/` compilado com Wrangler.
- O painel Next.js em `/panel-nextjs/` teria seu próprio `package.json`, `next.config.js`, etc.
- São dois projetos independentes compartilhando o mesmo repositório git.
- Deploy separado: Worker → Cloudflare, Painel → Vercel.

---

## 12. Plano de migração em etapas

### PR-T10.1-DIAG (esta PR)
**Tipo**: PR-DIAG  
**Objetivo**: Inventário completo do painel Enova 1. Nenhuma cópia, nenhuma alteração.  
**Entrega**: `schema/diagnostics/T10_1_PANEL_CRM_ENOVA1_CROSSCHECK.md`

### PR-T10.2-CONTRACT
**Tipo**: PR-DOC (Contrato)  
**Objetivo**: Criar contrato formal T10 para a frente Panel/CRM.  
**Conteúdo**: objetivo, escopo, fora de escopo, gates, critérios de aceite, sequência de PRs.  
**Pré-requisito**: esta PR mergeada; autorização de Vasques para abrir T10.

### PR-T10.3-IMPORT
**Tipo**: PR-IMPL  
**Objetivo**: Import bruto do `D:\Enova\panel` para `D:\Enova-2\panel-nextjs\` sem adaptação.  
**Escopo**: copiar diretório inteiro, ajustar `.gitignore`, confirmar build `next build` sem erros.  
**NÃO faz**: nenhuma adaptação de env, auth, endpoints ou schema.

### PR-T10.4-ADAPT
**Tipo**: PR-IMPL  
**Objetivo**: Adaptação mínima: envs, auth, WORKER_BASE_URL, alinhamento de headers.  
**Escopo**:
- `.env.example` com todas as vars necessárias
- Substituir `ENOVA_ADMIN_KEY` → `CRM_ADMIN_KEY` ou alinhar
- Configurar `WORKER_BASE_URL=https://nv-enova-2.brunovasque.workers.dev`
- Confirmar que `/api/health` passa com Worker real

### PR-T10.5-RUN
**Tipo**: PR-PROVA  
**Objetivo**: Build local + deploy preview Vercel.  
**Evidência exigida**: `next build` sem erros; preview Vercel funcionando; `/api/health` retorna `ok=true`.

### PR-T10.6-CRM-LINK
**Tipo**: PR-IMPL  
**Objetivo**: Ligar CRM real com Supabase atual.  
**Escopo**: confirmar `crm_leads_v1` existe e retorna dados; confirmar views de atendimento.  
**Evidência exigida**: CRM lista leads reais; sub-abas PASTA/ANALISE populadas.

### PR futura opcional
**Tipo**: PR-IMPL  
**Objetivo**: Aba Funil/Qualificação pré-docs no CRM (visualizar stages discovery/qualification).  
**Pré-requisito**: T9 completo (G9 aprovado); autorização Vasques.

---

## 13. Estado de T9 nesta abertura diagnóstica

| Aspecto | Estado |
|---------|--------|
| T9 contrato | **ABERTO** — G9 ainda não fechado |
| BLK-T9.13-STATE-MAPPING | **RESOLVIDO** (PR #212 — T9.13M-FIX) |
| Próxima PR autorizada T9 | T9.14-IMPL (ou T9.13N-PROVA com UUID real) |
| Esta PR-T10.1 | Abertura diagnóstica da **frente nova Panel/CRM** — não afeta T9 |
| Runtime, Worker, LLM, WhatsApp | **NÃO ALTERADOS** — zero src/ modificado |
| Supabase, RLS, migrations | **NÃO ALTERADOS** |
| D:\Enova (legado) | **NÃO ALTERADO** — apenas lido |

---

## 14. Declaração de fora de escopo

Esta PR **NÃO**:
- Copiou o painel do Enova 1.
- Alterou `src/` do Enova-2.
- Alterou Worker, LLM, WhatsApp, webhook, outbound.
- Alterou Supabase, schema, RLS, migrations.
- Alterou Cloudflare.
- Fechou G9 ou qualquer gate.
- Criou aba Funil/Qualificação.
- Modificou qualquer arquivo em `D:\Enova`.

---

## 15. Fontes consultadas (READ-ONLY)

| Arquivo Enova 1 | Propósito da leitura |
|-----------------|---------------------|
| `D:\Enova\panel\package.json` | Framework, versão, dependências |
| `D:\Enova\panel\next.config.js` | Configuração Next.js |
| `D:\Enova\panel\app\layout.tsx` | Estrutura global (PanelNav) |
| `D:\Enova\panel\app\components\PanelNav.tsx` | 7 abas e rotas |
| `D:\Enova\panel\app\crm\CrmUI.tsx` | Lógica das 5 sub-abas do CRM |
| `D:\Enova\panel\app\crm\actions.ts` | Server Actions CRM |
| `D:\Enova\panel\app\api\crm\_shared.ts` | Backend CRM (tabelas, tipos, envs) |
| `D:\Enova\panel\app\api\crm\route.ts` | Auth e roteamento CRM |
| `D:\Enova\panel\app\api\conversations\route.ts` | Conversas (tabelas enova_state, enova_log) |
| `D:\Enova\panel\app\api\atendimento\_shared.ts` | Atendimento (view enova_attendance_v1) |
| `D:\Enova\panel\app\api\bases\_shared.ts` | Bases (crm_lead_meta, lead_pool/temp) |
| `D:\Enova\panel\app\api\health\route.ts` | Health (envs WORKER_BASE_URL, ENOVA_ADMIN_KEY) |
| `D:\Enova\panel\app\api\send\route.ts` | Envio de mensagem via Worker |
| `D:\Enova\panel\app\api\enova-ia-chat\route.ts` | Chat IA (OpenAI API) |
| `D:\Enova\panel\app\lib\` (listado) | 26 arquivos de lógica ENOVA IA |
| `D:\Enova\wrangler.toml` | Config Worker Enova 1 (nome, vars, R2) |

Zero arquivos alterados em `D:\Enova`.

---

## 16. Resumo executivo

1. **O painel Enova 1 é um app Next.js 14 completo com 7 abas, 13 rotas API e 26 arquivos de lógica IA.**
2. **Não pode rodar dentro do Cloudflare Worker** — precisa ser um projeto separado (Vercel ou similar).
3. **O Enova-2 já tem um mini-painel** (`src/panel/handler.ts`) em HTML embutido com as mesmas 7 abas,
   mas em empty-state. O mini-painel pode coexistir com o painel Next.js completo (diferentes URLs).
4. **Tabelas Supabase**: a maioria já existe no schema real; views como `crm_leads_v1` e `enova_attendance_v1`
   precisam ser confirmadas.
5. **Envs**: `WORKER_BASE_URL` e `OPENAI_API_KEY` são as principais lacunas; `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE` já estão provadas no Enova-2.
6. **Auth**: header diverge (`X-CRM-Admin-Key` vs `x-enova-admin-key`) — unificação necessária em T10.4.
7. **Estratégia recomendada**: Vercel para o painel (menor risco), Worker Cloudflare para runtime.
8. **Próximo passo imediato**: criar contrato T10 (PR-T10.2-CONTRACT) antes de copiar qualquer arquivo.
