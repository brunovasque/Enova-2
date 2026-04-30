# T8_FRONTEND_PAINEL_OPERACIONAL — Documento de Implementação (PR-T8.5)

**Tipo:** PR-IMPL
**Frente:** Frontend do painel operacional Enova 2
**Contrato âncora:** CONTRATO_IMPLANTACAO_MACRO_T8.md §PR-T8.5
**PR precedente:** PR-T8.4 (backend mínimo das 7 abas) — merged como [#149](https://github.com/brunovasque/Enova-2/pull/149)
**Data:** 2026-04-29
**Autor:** Claude (Anthropic) — sessão autorizada por Vasques

---

## 0. Escopo real desta PR

PR-T8.5 entrega o **painel operacional frontend** consumindo os 26 endpoints da PR-T8.4. As 7 abas estão implementadas com empty-state estável e exibem flags `real_*: false` quando aplicável.

**Abordagem técnica:** painel estático servido pelo próprio Cloudflare Worker em `/panel`. HTML/CSS/JS embutidos em uma constante TypeScript — sem framework, sem build step, sem dependência adicional. Mantém o paradigma do projeto (Worker-only, sem tooling de frontend).

**Não tocado nesta PR:** workflow/deploy, contrato T8, cliente real, WhatsApp real, Supabase real, LLM real, autenticação complexa, redesign visual definitivo, envio ao correspondente.

---

## 1. Arquivos criados / modificados

| Arquivo | Tipo | Papel |
|---|---|---|
| `src/panel/handler.ts` | NOVO | Serve `/panel` com HTML/CSS/JS embutidos. ~750 linhas (HTML inclusive). |
| `src/panel/smoke.ts` | NOVO | Smoke test com 30 verificações: status HTTP, content-type, presença das 7 abas, referências aos 26 endpoints, header `X-CRM-Admin-Key`, flags `real_*: false`, sem segredo hardcoded. |
| `src/worker.ts` | MOD | Import `handlePanelRequest` + roteamento `/panel` e `/panel/`. |
| `package.json` | MOD | Script `smoke:panel` adicionado a `smoke:all`. |

---

## 2. Rotas/telas criadas

### 2.1. Frontend (1 rota Worker → 7 abas frontend)

| Rota Worker | Resposta | Conteúdo |
|---|---|---|
| `GET /panel` | 200 + HTML | Painel completo (7 abas) |
| `GET /panel/` | 200 + HTML | Painel completo (7 abas) |
| `GET /panel/*` | 404 | Sub-rotas não suportadas |
| `POST /panel` | 405 | Método não permitido |

### 2.2. Abas implementadas no frontend (7)

1. **Conversas** — lista de conversas, detalhe da conversa, mensagens/turnos.
2. **Bases** — bases canônicas com tipo/path/status, flags de runtime.
3. **Atendimento** — visão operacional, leads ativos, pendências, modo manual, overrides recentes.
4. **CRM** — lista de leads, criação, detalhe completo (state, facts, documentos, dossiê, policy events, override log), ações (override, modo manual, reset seguro).
5. **Dashboard** — métricas operacionais (total leads, ativos, manual, facts, docs, policy events, overrides) + warnings.
6. **Incidentes** — sumário por severidade (critical/high/medium/low), eventos críticos, ações de operador.
7. **ENOVA IA** — status do runtime, flags `llm_real`/`supabase_real`/`whatsapp_real`, memória, prompt registry, próximas PRs, runtime técnico.

---

## 3. Endpoints consumidos por aba

| Aba | Endpoints consumidos |
|---|---|
| **Conversas** | `GET /crm/conversations`, `GET /crm/conversations/:lead_id/messages` |
| **Bases** | `GET /crm/bases`, `GET /crm/bases/status` |
| **Atendimento** | `GET /crm/attendance`, `GET /crm/attendance/pending`, `GET /crm/attendance/manual-mode` |
| **CRM** | `GET /crm/leads` (com filtros), `POST /crm/leads`, `GET /crm/leads/:id/case-file`, `GET /crm/leads/:id/policy-events`, `POST /crm/leads/:id/override`, `POST /crm/leads/:id/manual-mode`, `POST /crm/leads/:id/reset` |
| **Dashboard** | `GET /crm/dashboard` |
| **Incidentes** | `GET /crm/incidents`, `GET /crm/incidents/summary` |
| **ENOVA IA** | `GET /crm/enova-ia/status`, `GET /crm/enova-ia/runtime` |

**Total:** 14 endpoints distintos consumidos diretamente; os demais 12 endpoints da PR-T8.4 (`leads/:id/facts`, `timeline`, `artifacts`, `dossier`, etc.) ficam acessíveis via `case-file` consolidado e podem ser consumidos individualmente em iterações futuras.

---

## 4. Limitações documentadas

### 4.1. Limitações herdadas do backend (PR-T8.4)

- Backend `CrmInMemoryBackend` é **isolado** do adapter core — dados gravados pelo Core não aparecem aqui até PR-T8.8 (Supabase real).
- Mensagens reais (WhatsApp inbound/outbound) ficam para PR-T8.12.
- Resumo semântico via LLM fica para PR-T8.9.
- Telemetria persistida (auth failures, trace_id cross-request) fica para PR-T8.14.

### 4.2. Limitações próprias do painel

- **Sem framework**: HTML/CSS/JS vanilla embutidos; suficiente para inspeção operacional, mas redesign visual definitivo fica para iteração futura.
- **Sem build step**: o painel é servido como string TS — não há minificação ou bundling.
- **Visualização sem polling**: cada aba carrega dados ao ser ativada e ao clicar "Recarregar"; não há auto-refresh.
- **Empty-state declarado**: cada aba mostra "empty-state" quando não há dados; flags `real_*: false` aparecem como avisos amarelos.
- **Sem dados falsos**: nenhuma aba inventa dados quando o backend retorna vazio.

### 4.3. Avisos visuais explícitos

| Aba | Aviso |
|---|---|
| Conversas | "Endpoints in-process. Mensagens reais (WhatsApp) entram em PR-T8.12." |
| Bases | "Bases servidas em modo `documented_only`. Runtime real (Supabase/vector) entra em PR-T8.8." |
| Atendimento | "Agregação cross-lead in-process. Volume real depende de PR-T8.8." |
| CRM | "Backend in-process. Persistência real em PR-T8.8." |
| Dashboard | warnings dinâmicos (`real_supabase: false`, `empty_state`) |
| Incidentes | "Trilha in-process. Telemetria persistida e auth failures entram em PR-T8.14." |
| ENOVA IA | "Runtime parcial. LLM real (PR-T8.9), Supabase real (PR-T8.8), WhatsApp real (PR-T8.12), telemetria runtime (PR-T8.14)." |

Header global mostra: `runtime: in_process`, `real_supabase: false`, `real_llm: false`, `real_whatsapp: false`.

---

## 5. Como configurar a admin key

### 5.1. Modelo de auth

O painel **não armazena segredo no código**. A chave é fornecida pelo operador no primeiro acesso e armazenada em `localStorage` do navegador (`crm_admin_key`).

### 5.2. Fluxo

1. Acesse `https://<worker-url>/panel`.
2. Modal aparece automaticamente solicitando a chave.
3. Informe um dos seguintes:
   - O valor de `CRM_ADMIN_KEY` (Cloudflare Worker secret) configurado no ambiente.
   - O token `dev-crm-local` (apenas se `CRM_ALLOW_DEV_TOKEN === "true"` estiver declarado no ambiente).
4. Clique "Salvar". A chave é gravada em `localStorage`.
5. Todas as chamadas `/crm/*` enviam automaticamente o header `X-CRM-Admin-Key`.

### 5.3. Reconfiguração e limpeza

- Botão "configurar" no header reabre o modal.
- Botão "Limpar" remove a chave do `localStorage`.
- Status da chave aparece no header (`chave: ***last4` ou `sem chave`).

### 5.4. Configuração de produção (Cloudflare Worker)

```toml
# wrangler.toml
[vars]
# CRM_ALLOW_DEV_TOKEN = "false"   # NUNCA setar como "true" em produção

# Secret (configurado via wrangler secret put):
# CRM_ADMIN_KEY = "<segredo-gerado>"
```

### 5.5. Configuração de desenvolvimento

```toml
[vars]
CRM_ALLOW_DEV_TOKEN = "true"  # apenas em ambiente local
```

Token aceito no painel: `dev-crm-local` (somente com a flag acima).

---

## 6. Como validar localmente

### 6.1. Smoke test do painel

```bash
npm run smoke:panel
```

Verifica:
- `GET /panel` retorna 200 + content-type HTML.
- HTML contém as 7 abas esperadas.
- HTML referencia 12 endpoints da PR-T8.4.
- HTML usa `X-CRM-Admin-Key` e lê de `localStorage` (não hardcode).
- HTML declara flags `real_supabase`/`real_llm`/`real_whatsapp`.
- `dev-crm-local` aparece no máximo 1× (apenas como placeholder).
- `GET /panel/` (trailing slash) retorna 200.
- `GET /panel/sub` retorna 404.
- `POST /panel` retorna 405.

**Resultado esperado:** `30/30 checks passed; 0 failed.`

### 6.2. Smoke test consolidado

```bash
npm run smoke:all
```

Inclui `smoke:panel` no encadeamento.

### 6.3. Validação manual (via wrangler dev)

```bash
npx wrangler dev
# Abrir http://localhost:8787/panel
# Inserir admin key no modal
# Navegar pelas 7 abas
```

Esperado em ambiente vazio: empty-states em todas as abas, métricas zeradas, flags `real_*: false`.

---

## 7. Restrições invioláveis cumpridas

- ✅ Frontend não escreve `reply_text`.
- ✅ Frontend não decide stage.
- ✅ Frontend não ativa cliente real, WhatsApp real, Supabase real ou LLM real.
- ✅ Frontend respeita empty-state dos endpoints (renderiza "empty-state" estável).
- ✅ Frontend mostra quando dados são `in_process`, `documented_only` ou `real_*: false` (header global + avisos por aba).
- ✅ Não cria dados falsos como se fossem reais.
- ✅ Não esconde limitações.
- ✅ Não mexe em workflow/deploy (`.github/workflows/deploy.yml` intocado).
- ✅ Sem segredo hardcoded — chave fica em `localStorage` do navegador.

---

## 8. Próxima PR autorizada

**PR-T8.6 — PR-PROVA — Prova real CRM end-to-end**

Escopo esperado:
- Roteiro de prova end-to-end exercitando os 26 endpoints da PR-T8.4 via `/panel`.
- Validação do fluxo completo: criar lead → adicionar facts → registrar override → ativar manual mode → reset preservando auditoria → consolidar case-file.
- Evidência de empty-state, transições de status e preservação de auditoria.
- Documentação de PROVA: `schema/implementation/T8_PROVA_CRM_END_TO_END.md`.
