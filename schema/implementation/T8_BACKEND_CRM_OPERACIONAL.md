# T8_BACKEND_CRM_OPERACIONAL — Documento de Implementação (PR-T8.4)

**Tipo:** PR-IMPL  
**Frente:** CRM Operacional  
**Contrato âncora:** CONTRATO_IMPLANTACAO_MACRO_T8.md §PR-T8.4  
**Diagnóstico precedente:** schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md (PR-T8.3)  
**Data:** 2026-04-29  
**Autor:** Claude Code (Anthropic) — sessão autorizada por Vasques

---

## 0. Escopo real desta PR

> **PR-T8.4 entrega o backend mínimo das 7 abas do painel operacional Enova 2**
> em modo in-process com schema estável e empty-state declarado. A persistência
> real, runtime de LLM, WhatsApp real e telemetria persistida ficam para PRs
> futuras:
> - **PR-T8.5** — Frontend do painel completo consumindo estes endpoints
> - **PR-T8.6** — Prova real CRM end-to-end
> - **PR-T8.8** — Supabase real (conector DB)
> - **PR-T8.9** — Prova Supabase/LLM
> - **PR-T8.12** — WhatsApp real
> - **PR-T8.14** — Telemetria/flags runtime

Esta PR **não implementa frontend**, **não conecta Supabase real**, **não ativa LLM real**, **não ativa WhatsApp real**, **não altera workflow/deploy**. Apenas fornece à PR-T8.5 contratos de API testáveis para todas as 7 abas.

---

## 1. Escopo implementado

Backend CRM operacional in-process integrado ao Cloudflare Worker Enova 2.  
Nenhuma linha de código produz `reply_text`, decide `stage`, ou aprova dossiê.

### Arquivos criados

| Arquivo | Papel |
|---|---|
| `src/crm/types.ts` | Tipos canônicos: 9 tabelas, 9 entidades, inputs/resultados/filtros, interface CrmBackend |
| `src/crm/store.ts` | `CrmInMemoryBackend` (implementa CrmBackend) + singleton `crmBackend` |
| `src/crm/service.ts` | 15 funções de negócio (aba CRM) — leitura, escrita, reset, override, modo manual, case-file |
| `src/crm/panel.ts` | Funções de painel para as outras 6 abas — agregações in-process, empty-state estável |
| `src/crm/routes.ts` | Handler HTTP `/crm/*` — 23 rotas, auth segura, path parsing genérico |

### Arquivo modificado

| Arquivo | Alteração |
|---|---|
| `src/worker.ts` | Import `handleCrmRequest`; `env` param; bloco CRM antes do 404; health atualizado |

---

## 2. Rotas implementadas (23 endpoints, 7 abas)

### Health
| Método | Rota | Função |
|---|---|---|
| GET | `/crm/health` | inline (lista as 7 abas) |

### Aba 1 — Conversas
| Método | Rota | Função | Fonte |
|---|---|---|---|
| GET | `/crm/conversations` | `panel.listConversations` | leads + último turno |
| GET | `/crm/conversations/:lead_id` | `panel.getConversation` | lead + turnos ordenados |
| GET | `/crm/conversations/:lead_id/messages` | `panel.getConversationMessages` | turnos (mensagens reais em PR-T8.12) |

### Aba 2 — Bases
| Método | Rota | Função | Fonte |
|---|---|---|---|
| GET | `/crm/bases` | `panel.listBases` | 9 bases canônicas hardcoded (status: documented_only) |
| GET | `/crm/bases/status` | `panel.listBasesStatus` | contagem por tipo + flags real_supabase/vector/memory |

### Aba 3 — Atendimento
| Método | Rota | Função | Fonte |
|---|---|---|---|
| GET | `/crm/attendance` | `panel.getAttendanceOverview` | leads ativos + manual + facts/docs pendentes + overrides recentes |
| GET | `/crm/attendance/pending` | `panel.getAttendancePending` | facts pending/requires_confirmation + docs requested |
| GET | `/crm/attendance/manual-mode` | `panel.getAttendanceManualMode` | leads com manual_mode=true |

### Aba 4 — CRM
| Método | Rota | Função |
|---|---|---|
| GET | `/crm/leads` | `svc.listLeads` (filtros: status, manual_mode) |
| POST | `/crm/leads` | `svc.createLead` |
| GET | `/crm/leads/:id` | `svc.getLeadById` |
| GET | `/crm/leads/:id/facts` | `svc.getLeadFacts` |
| GET | `/crm/leads/:id/timeline` | `svc.getLeadTimeline` |
| GET | `/crm/leads/:id/artifacts` | `svc.getLeadDocuments` |
| GET | `/crm/leads/:id/dossier` | `svc.getLeadDossier` |
| GET | `/crm/leads/:id/policy-events` | `svc.getLeadPolicyEvents` |
| GET | `/crm/leads/:id/case-file` | `svc.getLeadCaseFile` |
| POST | `/crm/leads/:id/override` | `svc.registerOverride` |
| POST | `/crm/leads/:id/manual-mode` | `svc.toggleManualMode` |
| POST | `/crm/leads/:id/reset` | `svc.resetLead` (preserva auditoria) |

### Aba 5 — Dashboard
| Método | Rota | Função | Fonte |
|---|---|---|---|
| GET | `/crm/dashboard` | `panel.getDashboardSummary` | metrics + warnings (real_supabase=false, empty_state) |
| GET | `/crm/dashboard/metrics` | `panel.getDashboardMetrics` | contagens in-process + flag real_supabase=false |

### Aba 6 — Incidentes
| Método | Rota | Função | Fonte |
|---|---|---|---|
| GET | `/crm/incidents` | `panel.listIncidents` | policy_events high/critical + override_log (50 últimos) |
| GET | `/crm/incidents/summary` | `panel.getIncidentsSummary` | contagem por severity + total overrides |

### Aba 7 — ENOVA IA
| Método | Rota | Função | Fonte |
|---|---|---|---|
| GET | `/crm/enova-ia/status` | `panel.getEnovaIaStatus` | flags llm_real/supabase_real/whatsapp_real + next_prs |
| GET | `/crm/enova-ia/runtime` | `panel.getEnovaIaRuntime` | runtime técnico (worker, core, e1, crm, rollout) |

---

## 3. Autenticação

Header obrigatório: `X-CRM-Admin-Key`

**Regra de validação (sem fallback universal):**
1. Se env var `CRM_ADMIN_KEY` existe e bate com o header → autorizado.
2. Se env var `CRM_ALLOW_DEV_TOKEN === "true"` **E** header `=== "dev-crm-local"` → autorizado (uso restrito a ambientes locais/dev).
3. Caso contrário → `401`.

**Sem `CRM_ADMIN_KEY` e sem flag dev declarada, todas as requisições são rejeitadas.** Não há fallback universal em produção. O token `dev-crm-local` só vale com flag explícita `CRM_ALLOW_DEV_TOKEN=true` declarada como secret/var no Worker.

Em produção (`nv-enova-2`), `CRM_ADMIN_KEY` deve ser declarado e `CRM_ALLOW_DEV_TOKEN` **não pode** estar setado como `"true"`.

---

## 4. Backend in-process

`CrmInMemoryBackend` armazena dados em `Map<CrmTable, unknown[]>` durante a vida do processo Worker.

**Tabelas inicializadas:**
```
crm_leads, crm_lead_state, crm_turns, crm_facts,
crm_documents, crm_dossier, crm_policy_events,
crm_override_log, crm_manual_mode_log
```

**Limitação explícita (documentada):**  
Este backend é ISOLADO do `InMemoryPersistenceBackend` do adapter core (`src/adapter/runtime.ts`).  
Dados escritos pelo Core (engine, adapter) não aparecem no CRM enquanto Supabase real não for conectado.  
Em PR-T8.8, ambos apontarão para o mesmo Supabase → compartilhamento automático.

---

## 5. Restrições invioláveis implementadas

| Restrição | Como implementada |
|---|---|
| CRM não escreve `reply_text` | Nenhuma função em service.ts ou routes.ts toca em `reply_text` |
| CRM não decide `stage` | `stage_current` é campo soberano do Core — CRM só lê (crm_lead_state) |
| Reset preserva auditoria | `resetLead` marca fatos como `superseded`; nunca deleta `override_log` ou `policy_events` |
| Override é registro permanente | `registerOverride` só insere em `crm_override_log` — sem update, sem delete |
| Modo manual não cria script | `toggleManualMode` atualiza flag + loga — zero geração de texto |
| Dossiê não decide aprovação | `getLeadDossier` apenas lê e retorna — sem lógica de decisão |

---

## 6. Telemetria

As operações de escrita supervisionada (`override`, `reset`) emitem `emitTelemetry` com:
- `layer: 'worker'`, `category: 'health_signal'`
- `lead_ref`, `trace_id`, `correlation_id`, `request_id`
- `details` com rota e parâmetros relevantes

Auth failure emite `emitRuntimeGuard` com `crm_unauthorized`.

---

## 7. Plug Supabase (PR-T8.8)

Para migrar para Supabase real:
1. Implementar `CrmBackend` com `@supabase/supabase-js`
2. Substituir exportação `crmBackend` em `src/crm/store.ts`
3. Nenhuma linha de `service.ts` ou `routes.ts` precisa mudar

---

## 8. Backend por aba do painel operacional

Esta PR entrega **endpoints reais e testáveis** para todas as 7 abas. Cada rota retorna schema estável e empty-state declarado quando não há dados — sem promessa falsa de runtime real.

### 8.1. Aba: Conversas

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dados retornados | Dependência futura |
|---|---|---|---|---|
| Listar conversas | `GET /crm/conversations` | ✅ in-process | leads + last_turn_at + turn_count | PR-T8.8 (cross-session) |
| Abrir conversa | `GET /crm/conversations/:lead_id` | ✅ in-process | lead + turnos ordenados | — |
| Listar mensagens/turnos | `GET /crm/conversations/:lead_id/messages` | ⚠️ parcial | turnos (placeholder); `real_messages: false` | PR-T8.12 (WhatsApp real) |
| Exibir stage/fase atual | (via `GET /crm/leads/:id`) | ⚠️ parcial | `stage_current` projetado quando Core escreve em `crm_lead_state` | PR-T8.8 |
| Exibir último resumo | — | ❌ | — | PR-T8.9 (LLM real) |
| Modo manual | `POST /crm/leads/:id/manual-mode` | ✅ in-process | log + flag atualizada | — |

**Status da aba:** ✅ ENDPOINTS REAIS in-process. Empty-state estável. Mensagens reais e resumo semântico em PRs futuras.

---

### 8.2. Aba: Bases

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dados retornados | Dependência futura |
|---|---|---|---|---|
| Listar bases/conhecimentos | `GET /crm/bases` | ✅ documented_only | 9 bases canônicas hardcoded | PR-T8.8 |
| Status de fontes | `GET /crm/bases/status` | ✅ documented_only | contagem por tipo + flags real_supabase/vector/memory_runtime | PR-T8.8 + PR-T8.14 |
| Base normativa (MCMV) | (via `/crm/bases`) | ✅ documented_only | `adendo_soberania_llm_mcmv` + contrato T8 listados | PR-T8.8 |
| Memória operacional | (via `/crm/bases/status`) | ⚠️ parcial | `memory_runtime: in_process` (E1 memory) | PR-T8.8 |
| Fonte de regras MCMV | (via `/crm/bases`) | ✅ documented_only | adendos canônicos listados | PR-T8.8 |

**Status da aba:** ✅ ENDPOINTS REAIS em modo documented_only. Frontend pode listar/inspecionar 9 bases canônicas; runtime de bases (Supabase/vector) entra em PR-T8.8.

---

### 8.3. Aba: Atendimento

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dados retornados | Dependência futura |
|---|---|---|---|---|
| Visão operacional | `GET /crm/attendance` | ✅ in-process | leads_total/active/manual + facts/docs pendentes + overrides recentes | PR-T8.8 (volume real) |
| Leads em andamento | (via `/crm/attendance` ou `/crm/leads?status=active`) | ✅ in-process | contagem + listagem | — |
| Pendências | `GET /crm/attendance/pending` | ✅ in-process | facts pending/requires_confirmation + docs requested | PR-T8.8 |
| Ações humanas | (via `/crm/attendance` campo `recent_overrides`) | ✅ in-process | últimos 10 overrides cross-lead | — |
| Modo manual | `GET /crm/attendance/manual-mode` | ✅ in-process | leads com manual_mode=true | — |
| Reset seguro | `POST /crm/leads/:id/reset` | ✅ in-process | preserva auditoria (fatos → superseded) | — |

**Status da aba:** ✅ ENDPOINTS REAIS in-process com agregação cross-lead já calculada. Volume real entra em PR-T8.8.

---

### 8.4. Aba: CRM

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dependência futura |
|---|---|---|---|
| Leads (lista + criar) | `GET/POST /crm/leads` | ✅ in-process | — |
| Detalhe do lead | `GET /crm/leads/:id` | ✅ in-process | — |
| Facts | `GET /crm/leads/:id/facts` | ✅ leitura in-process | PR-T8.8 (escrita via Core) |
| Documentos | `GET /crm/leads/:id/artifacts` | ✅ leitura in-process | PR-T8.8 (upload Storage) |
| Dossiê | `GET /crm/leads/:id/dossier` | ✅ leitura in-process | PR-T8.6 + PR-T8.9 |
| Policy events | `GET /crm/leads/:id/policy-events` | ✅ leitura in-process | — |
| Override | `POST /crm/leads/:id/override` | ✅ in-process | — |
| Manual mode | `POST /crm/leads/:id/manual-mode` | ✅ in-process | — |
| Reset | `POST /crm/leads/:id/reset` | ✅ in-process (preserva auditoria) | — |
| Case-file consolidado | `GET /crm/leads/:id/case-file` | ✅ in-process | — |

**Status da aba:** ✅ COBERTA. Operações supervisionadas funcionando in-process; persistência real em PR-T8.8.

---

### 8.5. Aba: Dashboard

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dados retornados | Dependência futura |
|---|---|---|---|---|
| Métricas operacionais | `GET /crm/dashboard` | ✅ in-process | metrics + warnings (real_supabase=false, empty_state) | PR-T8.14 |
| Volume de leads | `GET /crm/dashboard/metrics` | ✅ in-process | leads_total/active/manual_mode | PR-T8.8 (range/histórico) |
| Distribuição por fase | (via metrics) | ⚠️ parcial | depende de `crm_lead_state` populado pelo Core | PR-T8.8 |
| Pendências cross-lead | (via metrics) | ✅ in-process | facts_pending + documents_pending | — |
| Erros | (via metrics) | ⚠️ parcial | policy_events_total | PR-T8.14 (telemetria persistida) |
| Conversões futuras | — | ❌ | — | PR-T8.6 + PR-T8.9 |

**Status da aba:** ✅ ENDPOINTS REAIS in-process. Métricas voláteis (não persistidas); funil de conversão e histórico real em PRs futuras.

---

### 8.6. Aba: Incidentes

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dados retornados | Dependência futura |
|---|---|---|---|---|
| Logs de erro | `GET /crm/incidents` | ⚠️ parcial | `policy_events` high/critical + 50 últimos overrides | PR-T8.14 (auth failures persistidos) |
| Violações de policy | (via `/crm/incidents`) | ✅ in-process | `policy_events` high/critical cross-lead | — |
| Falhas de integração | — | ❌ | — | PR-T8.14 |
| Eventos críticos | (via `/crm/incidents/summary`) | ✅ in-process | contagem por severity (critical/high/medium/low) | — |
| Trilha de investigação | (via `/crm/incidents` `operator_actions`) | ✅ in-process | overrides cross-lead com trace de operador | PR-T8.14 (trace_id persistido) |

**Status da aba:** ✅ ENDPOINTS REAIS in-process. Auth failures e telemetria cognitiva persistida entram em PR-T8.14.

---

### 8.7. Aba: ENOVA IA

| Funcionalidade esperada | Endpoint nesta PR | Status real | Dados retornados | Dependência futura |
|---|---|---|---|---|
| Status do runtime | `GET /crm/enova-ia/status` | ✅ documented_only | flags + next_prs | PR-T8.14 |
| Status do LLM | (via status: `llm_real: false`) | ⚠️ declarado | flag explícita | PR-T8.9 |
| Memória | (via runtime: `e1_memory: in_process`) | ⚠️ declarado | flag explícita | PR-T8.8 |
| Prompt registry | (via status: `prompt_registry: documented_only`) | ⚠️ declarado | flag explícita | PR-T8.9 |
| Avaliações futuras | — | ❌ | — | PR-T8.9 |
| Telemetria cognitiva | (via runtime: `telemetry: emit_only`) | ⚠️ declarado | flag explícita | PR-T8.14 |
| Runtime técnico | `GET /crm/enova-ia/runtime` | ✅ in-process | service + core_engine + e1_memory + crm_backend + rollout_guard | — |

**Status da aba:** ✅ ENDPOINTS REAIS retornando estado técnico do runtime e flags explícitas para o frontend. Conexões reais (LLM, Supabase, WhatsApp) declaradas como `false` com PR responsável apontada.

---

### 8.8. Sumário consolidado das 7 abas

| Aba | Endpoints | Cobertura nesta PR | Empty-state estável |
|---|---|---|---|
| Conversas | 3 | ✅ ENDPOINTS REAIS in-process | sim |
| Bases | 2 | ✅ ENDPOINTS REAIS documented_only | sim |
| Atendimento | 3 | ✅ ENDPOINTS REAIS in-process | sim |
| CRM | 12 | ✅ COBERTA | sim |
| Dashboard | 2 | ✅ ENDPOINTS REAIS in-process | sim |
| Incidentes | 2 | ✅ ENDPOINTS REAIS in-process | sim |
| ENOVA IA | 2 | ✅ ENDPOINTS REAIS documented_only | sim |
| **Total** | **26** (incluindo `/crm/health`) | | |

**Conclusão:** PR-T8.4 entrega backend mínimo das 7 abas com endpoints reais, schema estável e empty-state declarado. PR-T8.5 tem base concreta para construir o painel completo consumindo contratos de API testáveis. Esta PR **não promete runtime real** — todas as flags `real_supabase`, `real_llm`, `real_whatsapp` e `real_persistence` estão declaradas como `false` com PR responsável apontada.

---

## 9. Próximos passos autorizados

| PR | Tipo | Frente | Abas do painel desbloqueadas |
|---|---|---|---|
| PR-T8.5 | PR-IMPL | Frontend CRM operacional | CRM (UI), Atendimento (UI parcial) |
| PR-T8.6 | PR-PROVA | Prova real CRM end-to-end | CRM (validação) |
| PR-T8.8 | PR-IMPL | Supabase real (conector DB) | Bases, Conversas, Dashboard, Atendimento (cross-lead) |
| PR-T8.9 | PR-PROVA | Prova Supabase/LLM | ENOVA IA (status LLM, prompt registry) |
| PR-T8.12 | PR-IMPL | WhatsApp real | Conversas (mensagens reais) |
| PR-T8.14 | PR-IMPL | Telemetria/flags runtime | Incidentes, Dashboard (métricas), ENOVA IA (telemetria cognitiva) |

## 10. Critério de aceite (PR-T8.4)

Esta PR só pode fechar se:

- [x] Auth seguro corrigido (sem fallback universal; flag `CRM_ALLOW_DEV_TOKEN` exigida)
- [x] Backend mínimo das 7 abas implementado (26 endpoints incluindo `/crm/health`)
- [x] Endpoints reais e testáveis (`node --check` OK em 6 arquivos: types, store, service, panel, routes, worker)
- [x] Frontend NÃO implementado
- [x] Supabase real NÃO conectado
- [x] WhatsApp real NÃO ativado
- [x] Workflow/deploy NÃO alterado
- [x] Documentação lista endpoints por aba (§2 e §8)
- [x] Matriz por aba documenta endpoint, status, dados, dependência futura
- [x] Empty-state declarado com schema estável (todos panel.* retornam estrutura previsível)
- [x] Flags `real_supabase`, `real_llm`, `real_whatsapp` declaradas explicitamente como `false`
- [x] PR-T8.5 tem base concreta para construir o painel completo

**Itens fora de escopo (não tocados):** frontend, workflow/deploy, contrato T8, cliente real, WhatsApp real, Supabase real, LLM real.
