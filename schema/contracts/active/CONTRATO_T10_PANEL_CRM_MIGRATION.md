# CONTRATO — Migração Panel/CRM Enova 1 → Enova-2 — ENOVA 2

> **Identificador canônico:** T10 — PANEL/CRM MIGRATION
> **Status:** aberto — PR-T10.2 executada em 2026-05-03
> **Gate de entrada:** G10.1 — contrato aprovado (esta PR)
> **Gate de saída:** G10.7 — readiness final Panel/CRM
> **Precedência:** subordinado ao mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` e à cadeia canônica de precedência
> **Conformidade A00-ADENDO-01:** sim — IA soberana; painel não altera lógica de fala
> **Conformidade A00-ADENDO-02:** sim — identidade Enova 2 como atendente MCMV preservada
> **Conformidade A00-ADENDO-03:** sim — "Evidência manda no estado"; Bloco E obrigatório em toda PR que tente fechar gate

---

## §1. Objetivo

Migrar o painel CRM/operacional do Enova 1 (`D:\Enova\panel`) para o Enova-2 como
projeto Next.js separado hospedado na Vercel, preservando todas as 7 abas funcionais,
conectando ao Worker Cloudflare do Enova-2 via `WORKER_BASE_URL` e ao Supabase existente
como fonte de dados.

O painel migrado deve:
- Funcionar como interface operacional real para gestão de leads e CRM
- Conectar ao Worker Enova-2 para ações de atendimento e envio de mensagens
- Ler e gravar no Supabase real do Enova-2
- Ter autenticação admin alinhada com o Worker (sem quebrar nenhum dos dois)

Este contrato **não** autoriza criação de nova aba Funil/Qualificação — isso é T10.X futuro opcional.

---

## §2. Contexto e motivação

### 2.1 Por que o painel deve ser um projeto Next.js separado

O painel Enova 1 (`D:\Enova\panel`) é um app **Next.js 14.2.5 com App Router**. Ele usa:
- `node:crypto` (`timingSafeEqual` na autenticação)
- `pdfjs-dist` (renderização de PDF)
- `openai` SDK v4 (ENOVA IA chat)
- Build `next build` / runtime Node.js

O Enova-2 é um **Cloudflare Worker** (runtime V8 isolate, sem Node.js). Portanto:
- Next.js não pode rodar dentro do Worker
- `node:crypto` não existe no Worker runtime
- `next build` gera um app Node.js — incompatível com Wrangler
- Os dois **devem ser projetos separados** que se comunicam via HTTP

### 2.2 Por que Vercel (não Cloudflare Pages)

| Critério | Vercel | Cloudflare Pages |
|----------|--------|-----------------|
| Next.js 14 App Router | Nativo — zero configuração | Via `@cloudflare/next-on-pages` (adaptações) |
| `node:crypto` | Disponível | Não disponível — requer substituição |
| Risco de migração | **Baixo** | Médio |
| Complexidade | Mínima | Média (incompatibilidades Node.js) |

**Decisão:** Vercel é o deploy inicial recomendado. O painel não usa `@vercel/*` —
é Next.js padrão portável, mas Vercel oferece o menor risco imediato.

### 2.3 Diagnóstico de base

O diagnóstico T10.1 (PR #213) confirmou:
- Painel: Next.js 14.2.5, React 18, TypeScript, 7 abas, 13 rotas API, 26 arquivos lógica IA
- Tabelas/views Supabase usadas: `enova_state`, `enova_log`, `crm_lead_meta`, `crm_leads_v1` (VIEW),
  `crm_override_log`, `enova_attendance_v1` (VIEW), `enova_attendance_meta`, `bases_leads_v1` (VIEW),
  `enova_prefill_meta`
- Envs necessárias: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `ENOVA_ADMIN_KEY`, `WORKER_BASE_URL`, `OPENAI_API_KEY`
- **Gap de auth:** header `x-enova-admin-key` (Enova 1) ≠ `X-CRM-Admin-Key` (Enova-2 Worker)
- Estratégia: subdiretório `panel-nextjs/` no repo Enova-2 + deploy Vercel separado

---

## §3. Escopo

1. **T10.2-CONTRACT** — este contrato formal (PR-DOC)
2. **T10.3-IMPORT** — cópia bruta de `D:\Enova\panel` → `panel-nextjs/` sem adaptação funcional
3. **T10.4-ADAPT** — adaptação mínima: envs, auth (alinhamento admin key/header), `WORKER_BASE_URL`
4. **T10.5-RUN** — prova local (`next build`) + preview Vercel + `/api/health` OK
5. **T10.6-CRM-LINK** — ligar CRM real com Supabase atual; validar views/tabelas reais
6. **T10.7-READINESS** — readiness/closeout formal da frente Panel/CRM
7. **Destino canônico do painel:** `panel-nextjs/` no repo Enova-2
8. **Deploy inicial:** Vercel (projeto separado, não o mesmo deploy do Worker)
9. **Worker:** permanece 100% no Cloudflare — nenhuma alteração nesta frente
10. **Supabase:** permanece como fonte de dados — sem migrations nesta frente (salvo diagnóstico próprio em T10.6)
11. **Auth/admin key:** alinhar `ENOVA_ADMIN_KEY` / `x-enova-admin-key` do painel com `CRM_ADMIN_KEY` / `X-CRM-Admin-Key` do Worker sem quebrar nenhum dos dois

---

## §4. Fora de escopo

1. Não criar `panel-nextjs/` antes de T10.3
2. Não copiar arquivos do painel antes de T10.3
3. Não alterar `src/` do Worker durante nenhuma PR da frente T10
4. Não alterar schema Supabase sem diagnóstico próprio e autorização (T10.6 pode identificar views faltantes — PR específica será necessária)
5. Não criar migrations sem autorização explícita de Vasques
6. Não mudar autenticação do Worker sem PR própria e dedicada
7. Não misturar Worker + Panel na mesma PR
8. Não adaptar visual/UX durante import bruto (T10.3)
9. **Não criar aba Funil/Qualificação** antes do CRM legado estar rodando (T10.X futuro opcional)
10. Não fechar G9/T9 dentro da T10
11. Não mexer no repo legado `D:\Enova` — é fonte READ-ONLY
12. Não alterar LLM, WhatsApp, webhook, outbound
13. Não alterar RLS sem diagnóstico próprio
14. Não alterar variáveis de ambiente do Worker sem PR própria
15. Não usar `@cloudflare/next-on-pages` ou adaptar o painel para Cloudflare Pages (risco médio, sem benefício claro)

---

## §5. Dependências

1. **T10.1-DIAG concluída** — PR #213 mergeada ✅
2. **T9 aberto e separado** — T9/G9 continua sua trilha independente
3. **`D:\Enova\panel` acessível** como READ-ONLY durante T10.3
4. **Supabase do Enova-2 operacional** — confirmado T8.9B (leitura real provada)
5. **Worker Cloudflare publicado** (`nv-enova-2.brunovasque.workers.dev`) — confirmado G8

---

## §6. Entradas

1. `schema/diagnostics/T10_1_PANEL_CRM_ENOVA1_CROSSCHECK.md` — inventário técnico completo
2. `D:\Enova\panel` — código-fonte do painel Enova 1 (READ-ONLY)
3. Worker Enova-2 publicado em `https://nv-enova-2.brunovasque.workers.dev`
4. Supabase real com tabelas `enova_state`, `crm_lead_meta`, `crm_override_log` confirmadas (T8.9B)
5. `CRM_ADMIN_KEY` configurada no Worker como env/secret

---

## §7. Saídas

| PR | Saída concreta |
|----|---------------|
| T10.2-CONTRACT | `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md` (este arquivo) |
| T10.3-IMPORT | `panel-nextjs/` — cópia bruta do painel Enova 1 no repo Enova-2 |
| T10.4-ADAPT | `.env.example` com todas vars; auth alinhada; `WORKER_BASE_URL` configurado |
| T10.5-RUN | `next build` PASS local + URL de preview Vercel funcional + `/api/health` OK |
| T10.6-CRM-LINK | CRM lista leads reais; sub-abas PASTA/ANALISE/VISITA populadas com dados reais |
| T10.7-READINESS | `schema/proofs/T10_READINESS_CLOSEOUT_G10.md` — G10 declarado + Bloco E completo |

---

## §8. Critérios de aceite

| ID | Critério | Gate | Verificável como |
|----|----------|------|-----------------|
| CA-T10-01 | Contrato T10 criado e aprovado | G10.1 | Este arquivo presente e índice atualizado |
| CA-T10-02 | `panel-nextjs/` criado com todos os arquivos do painel Enova 1 | G10.2 | `diff` de contagem de arquivos: Enova 1 = Enova-2 |
| CA-T10-03 | `next build` PASS sem erros em `panel-nextjs/` | G10.3 | Output do build sem erros |
| CA-T10-04 | Preview Vercel funcional — painel carrega no browser | G10.4 | URL de preview acessível |
| CA-T10-05 | `/api/health` retorna `ok=true` conectando ao Worker real | G10.5 | Resposta JSON com `ok: true` |
| CA-T10-06 | CRM lista leads reais do Supabase sem quebrar abas existentes | G10.6 | Aba CRM populada + abas Conversas/Bases/Atendimento funcionando |
| CA-T10-07 | Handoff/readiness final documentado com Bloco E completo | G10.7 | `schema/proofs/T10_READINESS_CLOSEOUT_G10.md` presente |
| CA-T10-08 | Zero alteração em `src/` Worker durante toda a frente T10 | Transversal | `git diff --name-only main...` não inclui `src/` |
| CA-T10-09 | Zero migration Supabase sem diagnóstico próprio e autorização | Transversal | Zero arquivos de migration criados sem PR-DIAG anterior |
| CA-T10-10 | T9/G9 não afetados pela frente T10 | Transversal | Status T9 inalterado; gate G9 permanece conforme estado anterior |

---

## §9. Provas obrigatórias

| ID | Prova | PR que produz | Tipo |
|----|-------|---------------|------|
| P-T10-01 | Contagem de arquivos `panel-nextjs/` == contagem `D:\Enova\panel` | T10.3 | inspeção/diff |
| P-T10-02 | Output `next build` sem erros em `panel-nextjs/` | T10.5 | log de build |
| P-T10-03 | URL de preview Vercel acessível e painel carrega | T10.5 | screenshot/URL |
| P-T10-04 | `/api/health` responde `ok: true` com Worker real | T10.5 | resposta JSON |
| P-T10-05 | CRM exibe leads reais — PASTA ou ANALISE não vazia | T10.6 | screenshot/log |
| P-T10-06 | Zero diff em `src/` durante toda a frente | T10.7 | `git diff --name-only main...` |
| P-T10-07 | Bloco E completo no readiness — sem lacunas remanescentes | T10.7 | `T10_READINESS_CLOSEOUT_G10.md` |

---

## §10. Bloqueios

| ID | Bloqueio | Resolução necessária |
|----|----------|---------------------|
| BLK-T10-01 | Views Supabase não confirmadas (`crm_leads_v1`, `enova_attendance_v1`, `bases_leads_v1`) | T10.6 diagnostica e confirma; se ausentes → PR-DIAG específica antes de criar |
| BLK-T10-02 | Gap de auth (header divergente painel vs Worker) | T10.4 alinha sem quebrar Worker; mudança de auth do Worker exige PR separada |
| BLK-T10-03 | `WORKER_BASE_URL` não configurada no painel | T10.4 cria `.env.example` com URL do Worker PROD |
| BLK-T10-04 | `OPENAI_API_KEY` ausente no painel | T10.4 cria `.env.example`; ENOVA IA fica opcional se key ausente |
| BLK-T10-05 | 26 arquivos `app/lib/` de lógica IA dependem de contexto Enova 1 | T10.3 importa sem alterar; T10.4 não adapta — ENOVA IA pode não funcionar inicialmente |

---

## §11. Sequência oficial de PRs T10

```
T10.1-DIAG       — concluída ✅ (PR #213) — diagnóstico READ-ONLY
T10.2-CONTRACT   — esta PR (PR-DOC) — contrato formal
T10.3-IMPORT     — próxima autorizada — PR-IMPL — import bruto para panel-nextjs/
T10.4-ADAPT      — PR-IMPL — adaptação mínima (envs, auth, WORKER_BASE_URL, build)
T10.5-RUN        — PR-PROVA — build local + preview Vercel + /api/health
T10.6-CRM-LINK   — PR-IMPL — ligar CRM real com Supabase; validar views
T10.7-READINESS  — PR-PROVA/CLOSEOUT — readiness + Bloco E + G10 declarado

T10.X (futuro opcional) — Aba Funil/Qualificação pré-docs no CRM
  Pré-requisito: T9 completo (G9 aprovado) + autorização Vasques
  Não autorizada nesta fase
```

---

## §12. Gates T10

| Gate | Critério de pronto | PR que fecha |
|------|-------------------|-------------|
| G10.1 | Contrato aprovado (CA-T10-01) | T10.2-CONTRACT |
| G10.2 | Import sem perda de arquivos (CA-T10-02) | T10.3-IMPORT |
| G10.3 | Build local Next.js passa (CA-T10-03) | T10.5-RUN |
| G10.4 | Preview Vercel funcional (CA-T10-04) | T10.5-RUN |
| G10.5 | `/api/health` OK com Worker real (CA-T10-05) | T10.5-RUN |
| G10.6 | CRM lista leads reais sem quebrar abas (CA-T10-06) | T10.6-CRM-LINK |
| G10.7 | Handoff/readiness final com Bloco E (CA-T10-07) | T10.7-READINESS |

---

## §13. Regras duras

1. **Não mexer em `src/` do Worker** durante nenhuma PR da frente T10.
2. **Não alterar schema Supabase** sem diagnóstico próprio (PR-DIAG dedicada).
3. **Não criar migrations** sem autorização explícita de Vasques.
4. **Não mudar autenticação do Worker** sem PR própria e separada da frente T10.
5. **Não misturar Worker + Panel na mesma PR** — são projetos independentes.
6. **Não adaptar visual/UX** durante import bruto (T10.3 é cópia exata).
7. **Não criar aba Funil/Qualificação** antes do CRM legado estar rodando e G9 aprovado.
8. **Não fechar G9/T9** dentro da T10 — frentes completamente separadas.
9. **Não mexer no repo legado `D:\Enova`** — é fonte READ-ONLY durante toda a frente.
10. **Não usar `@cloudflare/next-on-pages`** — Vercel é o deploy autorizado.
11. **Não iniciar T10.3** sem G10.1 aprovado (este contrato mergeado).
12. **Não iniciar T10.4** sem T10.3 mergeada (import bruto completo).
13. **Não declarar frente encerrada** sem Bloco E completo em T10.7.

---

## §14. Riscos mapeados

| ID | Risco | Severidade | Mitigação |
|----|-------|-----------|-----------|
| RISK-T10-01 | `node:crypto` incompatível com Cloudflare Pages | CRÍTICO | Deploy em Vercel (mitigado por decisão de arquitetura) |
| RISK-T10-02 | Views Supabase (`crm_leads_v1`, etc.) ausentes ou com schema divergente | ALTO | T10.6-CRM-LINK diagnostica antes de ligar |
| RISK-T10-03 | Divergência de admin key/header (painel vs Worker) | MÉDIO | T10.4 alinha — se necessitar mudança no Worker, PR separada |
| RISK-T10-04 | 26 arquivos `app/lib/` ENOVA IA com lógica dependente de Enova 1 | MÉDIO | T10.3 importa tudo; ENOVA IA pode não funcionar inicialmente — não é bloqueante para CRM |
| RISK-T10-05 | `enova_prefill_meta`, `enova_attendance_meta` ausentes no schema real | MÉDIO | T10.6 confirma; abas dependentes ficam em empty-state até confirmação |
| RISK-T10-06 | Importar tudo e adaptar junto gera drift | MÉDIO | T10.3 = import puro; T10.4 = adaptação mínima; escopo separado por PR |
| RISK-T10-07 | `WORKER_BASE_URL` aponta para URL errada ou PROD quando deveria ser TEST | BAIXO | T10.4 documenta explicitamente qual URL usar em cada ambiente |

---

## §15. Relação com contratos ativos

| Contrato | Relação |
|----------|---------|
| `CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` | **Paralelo e independente** — T10 não interfere em T9; T9/G9 continua sua trilha |
| Contratos T0-T8 | Encerrados — fonte histórica de referência |
| T10.X futuro | Depende de T9 completo (G9 aprovado) + autorização Vasques |

---

## §16. Próximo passo autorizado após esta PR

**T10.3-IMPORT** — tipo PR-IMPL — cópia bruta de `D:\Enova\panel` para `panel-nextjs/`
- Branch sugerido: `feat/t10.3-panel-import-bruto`
- Pré-requisito: este contrato mergeado (G10.1)
- Escopo: copiar todos os arquivos, ajustar `.gitignore`, confirmar estrutura
- NÃO FAZ: adaptação de env, auth, endpoints, schema, visual/UX

---

## §17. Relação com o A01

Esta frente não está na sequência original T0-T7 do A01. É uma **frente derivada autorizada**:
- Autorizada pelo diagnóstico T10.1 (PR #213) e confirmação de Vasques
- Paralela ao T9 (não bloqueante, não bloqueada por T9)
- Necessária para operacionalizar o painel CRM como ferramenta real do Enova-2
- Não conflita com a ordem macro T0-T7 já executada

---

## §18. Relação com legados aplicáveis

| Legado | Uso nesta frente |
|--------|-----------------|
| `D:\Enova\panel` | Fonte READ-ONLY — código do painel a ser importado |
| `schema/diagnostics/T10_1_PANEL_CRM_ENOVA1_CROSSCHECK.md` | Diagnóstico técnico base — inventário completo |
| `schema/implantation/T8_SUPABASE_OPERACIONAL.md` | Referência de como Supabase é conectado no Enova-2 |
| `schema/implementation/T8_BACKEND_CRM_OPERACIONAL.md` | Referência das rotas CRM atuais do Worker |

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md
Estado da evidência:                   completa (contrato criado — G10.1)
Há lacuna remanescente?:               não — contrato define escopo, gates, critérios, regras duras
Há item parcial/inconclusivo bloqueante?: não — T10.2 é PR-DOC, não requer smoke técnico
Fechamento permitido nesta PR?:        sim — G10.1 (contrato aprovado) é fechado por esta PR
Estado permitido após esta PR:         G10.1 APROVADO; T10.3-IMPORT desbloqueada; T10 em execução
Próxima PR autorizada:                 T10.3-IMPORT (PR-IMPL — import bruto para panel-nextjs/)
```

---

## Histórico de versões

| Data | Versão | Evento |
|------|--------|--------|
| 2026-05-03 | v1.0 | Contrato criado via PR-T10.2-CONTRACT (branch `docs/t10.2-panel-crm-migration-contract`) |
