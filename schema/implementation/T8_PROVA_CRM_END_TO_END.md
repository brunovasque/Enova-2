# T8_PROVA_CRM_END_TO_END — Prova real CRM ponta a ponta (PR-T8.6)

**Tipo:** PR-PROVA
**Frente:** CRM operacional — backend (PR-T8.4) + frontend (PR-T8.5)
**Contrato âncora:** CONTRATO_IMPLANTACAO_MACRO_T8.md §PR-T8.6
**PRs provadas:** PR-T8.4 (backend 26 endpoints) e PR-T8.5 (painel /panel)
**Data:** 2026-04-29
**Autor:** Claude (Anthropic) — sessão autorizada por Vasques

---

## 0. Objetivo desta prova

PR-T8.6 é uma **PR-PROVA** — não entrega código de produto, entrega evidência automatizada de que PR-T8.4 e PR-T8.5 funcionam de forma integrada ponta a ponta. O fluxo CRM completo é exercitado via testes automatizados chamando o Worker diretamente (sem servidor HTTP, sem browser), cobrindo 6 categorias com 73 checks.

**Veredicto:** `73/73 checks PASS` — PR-T8.4 e PR-T8.5 provadas.

---

## 1. Arquivos criados / modificados

| Arquivo | Tipo | Papel |
|---|---|---|
| `src/panel/e2e-smoke.ts` | NOVO | Prova automatizada: 73 checks em 6 categorias. |
| `package.json` | MOD | Script `prove:crm-e2e` adicionado ao `smoke:all`. |

---

## 2. Categorias e checks

### C1 — Health e rotas de painel (8 checks)

| Check | Rota | Critério | Resultado |
|---|---|---|---|
| C1-01 | `GET /` | status 200 | PASS |
| C1-02 | `GET /crm/health` | status 200 | PASS |
| C1-03 | `GET /crm/health` | `ok: true` | PASS |
| C1-04 | `GET /crm/health` | `mode: in_process_backend` | PASS |
| C1-05 | `GET /crm/health` | `panel_tabs` tem 7 abas | PASS |
| C1-06 | `GET /panel` | status 200 | PASS |
| C1-07 | `GET /panel` | content-type text/html | PASS |
| C1-08 | `GET /panel/` | status 200 (trailing slash) | PASS |

### C2 — Auth (5 checks)

| Check | Cenário | Critério | Resultado |
|---|---|---|---|
| C2-01 | Sem header | 401 | PASS |
| C2-02 | `dev-crm-local` sem flag `CRM_ALLOW_DEV_TOKEN` | 401 | PASS |
| C2-03 | `dev-crm-local` com `CRM_ALLOW_DEV_TOKEN=true` | 200 | PASS |
| C2-04 | `CRM_ADMIN_KEY` correta | 200 | PASS |
| C2-05 | Chave incorreta | 401 | PASS |

### C3 — Fluxo CRM completo (20 checks)

Sequência executada em um único backend in-process, com o mesmo `lead_id` entre operações:

| Check | Operação | Critério | Resultado |
|---|---|---|---|
| C3-01 | `POST /crm/leads` | 201 | PASS |
| C3-02 | `POST /crm/leads` | `lead_id` retornado não vazio | PASS |
| C3-03 | `POST /crm/leads` | `status: active` | PASS |
| C3-04 | `POST /crm/leads` | `manual_mode: false` | PASS |
| C3-05 | `GET /crm/leads` | inclui lead criado | PASS |
| C3-06 | `POST /crm/leads/:id/override` | 201 | PASS |
| C3-07 | `POST /crm/leads/:id/override` | `override_id` retornado | PASS |
| C3-08 | `POST /crm/leads/:id/override` | `reason` preservado | PASS |
| C3-09 | `POST /crm/leads/:id/manual-mode` activate | 201 | PASS |
| C3-10 | `POST /crm/leads/:id/manual-mode` activate | `action: activate` retornado | PASS |
| C3-11 | `GET /crm/attendance/manual-mode` | inclui lead em modo manual | PASS |
| C3-12 | `GET /crm/leads/:id/case-file` | 200 | PASS |
| C3-13 | `GET /crm/leads/:id/case-file` | `override_log` ≥ 1 entrada | PASS |
| C3-14 | `GET /crm/leads/:id/case-file` | `lead.manual_mode: true` após ativação | PASS |
| C3-15 | `POST /crm/leads/:id/reset` | 200 | PASS |
| C3-16 | `POST /crm/leads/:id/reset` | retorna `override_id` (trilha de auditoria) | PASS |
| C3-17 | `POST /crm/leads/:id/reset` | `override_type: status_change` | PASS |
| C3-18 | `GET /crm/leads/:id/case-file` pós-reset | `override_log` ≥ 2 entradas (auditoria preservada) | PASS |
| C3-19 | `GET /crm/leads/:id/case-file` pós-reset | `lead.manual_mode: false` (reset desativou) | PASS |
| C3-20 | `POST /crm/leads` sem dados | 400 | PASS |

**Invariante comprovada (C3-18):** após reset, `override_log` tem 2 entradas — a do override inicial e a entrada do reset. Auditoria nunca apagada.

### C4 — 7 abas do painel (18 checks)

| Check | Critério | Resultado |
|---|---|---|
| C4-01..07 | HTML de `/panel` contém os 7 nomes de aba (Conversas, Bases, Atendimento, CRM, Dashboard, Incidentes, ENOVA IA) | 7× PASS |
| C4-08 | `GET /crm/conversations` → `ok: true` | PASS |
| C4-09 | `GET /crm/bases` → `ok: true` | PASS |
| C4-10 | `GET /crm/bases/status` → `ok: true` | PASS |
| C4-11 | `GET /crm/attendance` → `ok: true` | PASS |
| C4-12 | `GET /crm/attendance/pending` → `ok: true` | PASS |
| C4-13 | `GET /crm/attendance/manual-mode` → `ok: true` | PASS |
| C4-14 | `GET /crm/dashboard` → `ok: true` | PASS |
| C4-15 | `GET /crm/incidents` → `ok: true` | PASS |
| C4-16 | `GET /crm/incidents/summary` → `ok: true` | PASS |
| C4-17 | `GET /crm/enova-ia/status` → `ok: true` | PASS |
| C4-18 | `GET /crm/enova-ia/runtime` → `ok: true` | PASS |

### C5 — Flags `real_*: false` (12 checks)

| Check | Endpoint | Campo | Resultado |
|---|---|---|---|
| C5-01 | `/crm/health` | `real_supabase: false` | PASS |
| C5-02 | `/crm/health` | `real_llm: false` | PASS |
| C5-03 | `/crm/health` | `real_whatsapp: false` | PASS |
| C5-04 | `/crm/enova-ia/status` | `llm_real: false` | PASS |
| C5-05 | `/crm/enova-ia/status` | `supabase_real: false` | PASS |
| C5-06 | `/crm/enova-ia/status` | `whatsapp_real: false` | PASS |
| C5-07 | `/crm/enova-ia/runtime` | `real_llm: false` | PASS |
| C5-08 | `/crm/enova-ia/runtime` | `real_supabase: false` | PASS |
| C5-09 | `/crm/enova-ia/runtime` | `real_whatsapp: false` | PASS |
| C5-10 | `/panel` HTML | declara `real_supabase` | PASS |
| C5-11 | `/panel` HTML | declara `real_llm` | PASS |
| C5-12 | `/panel` HTML | declara `real_whatsapp` | PASS |

### C6 — Restrições invioláveis (10 checks)

| Check | Critério | Resultado |
|---|---|---|
| C6-01 | `/crm/health` não contém `reply_text` | PASS |
| C6-02 | `/crm/leads` não contém `reply_text` | PASS |
| C6-03 | `/crm/conversations` não contém `reply_text` | PASS |
| C6-04 | `/crm/enova-ia/status` não contém `reply_text` | PASS |
| C6-05 | `/crm/enova-ia/status` não contém `decide_stage` | PASS |
| C6-06 | `POST /panel` → 405 | PASS |
| C6-07 | `GET /panel/sub` → 404 | PASS |
| C6-08 | `PUT /crm/leads` → 405 | PASS |
| C6-09 | `PUT /crm/conversations` → 405 | PASS |
| C6-10 | Case-file de lead inexistente → 404 | PASS |

---

## 3. Como executar a prova

```bash
npm run prove:crm-e2e
```

Resultado esperado: `73/73 checks passed; 0 failed.`

### Incluída no smoke:all

```bash
npm run smoke:all
```

O script `prove:crm-e2e` é o último passo do `smoke:all`, após `smoke:panel`.

---

## 4. Limitações da prova (herdadas de PR-T8.4)

- Backend `CrmInMemoryBackend` é isolado do adapter core. Dados gravados pelo Core (`InMemoryPersistenceBackend`) não aparecem no CRM até PR-T8.8 (Supabase real compartilhado).
- Sem mensagens reais WhatsApp — PR-T8.12.
- Sem resumo semântico via LLM — PR-T8.9.
- Sem persistência entre reinicializações do Worker.
- `dev-crm-local` funciona apenas com `CRM_ALLOW_DEV_TOKEN=true` no ambiente — nunca em produção.

---

## 5. Restrições invioláveis confirmadas pela prova

- ✅ Nenhum endpoint produziu ou alterou `reply_text`.
- ✅ Nenhum endpoint decidiu `stage_current`.
- ✅ Nenhum endpoint ativou LLM, Supabase ou WhatsApp reais.
- ✅ Reset preservou auditoria: `override_log` tem 2 entradas após reset (C3-18).
- ✅ Flags `real_*: false` declaradas em todos os endpoints e no HTML (C5-01..C5-12).
- ✅ Token `dev-crm-local` rejeitado sem flag `CRM_ALLOW_DEV_TOKEN` (C2-02).
- ✅ Sem segredo hardcoded — localStorage e env var.

---

## 6. Próxima PR autorizada

**PR-T8.7 — (a ser definida pelo contrato T8)**

A frente CRM/painel está comprovada como backend mínimo funcional. Próximas frentes no contrato T8 continuam com PRs posteriores (T8.7+) conforme sequência definida em `CONTRATO_IMPLANTACAO_MACRO_T8.md`.
