# T8_BACKEND_CRM_OPERACIONAL — Documento de Implementação (PR-T8.4)

**Tipo:** PR-IMPL  
**Frente:** CRM Operacional  
**Contrato âncora:** CONTRATO_IMPLANTACAO_MACRO_T8.md §PR-T8.4  
**Diagnóstico precedente:** schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md (PR-T8.3)  
**Data:** 2026-04-29  
**Autor:** Claude Code (Anthropic) — sessão autorizada por Vasques

---

## 0. Escopo real desta PR

> **PR-T8.4 implementa a fundação backend CRM e a matriz backend por aba.**
> A cobertura completa das abas do painel operacional Enova 2 depende de:
> - **PR-T8.5** — Frontend CRM operacional
> - **PR-T8.6** — Prova real CRM end-to-end
> - **PR-T8.8** — Supabase real (conector DB)
> - **PR-T8.9** — Prova Supabase/LLM
> - **PR-T8.12** — WhatsApp real
> - **PR-T8.14** — Telemetria/flags runtime

Esta PR **não promete painel completo**. Cobre apenas a fatia da aba "CRM" do painel operacional, deixando todas as demais abas explicitamente declaradas como AUSENTES com PR responsável apontada.

---

## 1. Escopo implementado

Backend CRM operacional in-process integrado ao Cloudflare Worker Enova 2.  
Nenhuma linha de código produz `reply_text`, decide `stage`, ou aprova dossiê.

### Arquivos criados

| Arquivo | Papel |
|---|---|
| `src/crm/types.ts` | Tipos canônicos: 9 tabelas, 9 entidades, inputs/resultados/filtros, interface CrmBackend |
| `src/crm/store.ts` | `CrmInMemoryBackend` (implementa CrmBackend) + singleton `crmBackend` |
| `src/crm/service.ts` | 15 funções de negócio — leitura, escrita, reset, override, modo manual, case-file |
| `src/crm/routes.ts` | Handler HTTP `/crm/*` — 13 rotas, auth, path parsing |

### Arquivo modificado

| Arquivo | Alteração |
|---|---|
| `src/worker.ts` | Import `handleCrmRequest`; `env` param; bloco CRM antes do 404; health atualizado |

---

## 2. Rotas implementadas

| Método | Rota | Função de serviço |
|---|---|---|
| GET | `/crm/health` | — (inline) |
| GET | `/crm/leads` | `listLeads` |
| POST | `/crm/leads` | `createLead` |
| GET | `/crm/leads/:id` | `getLeadById` |
| GET | `/crm/leads/:id/facts` | `getLeadFacts` |
| GET | `/crm/leads/:id/timeline` | `getLeadTimeline` |
| GET | `/crm/leads/:id/artifacts` | `getLeadDocuments` |
| GET | `/crm/leads/:id/dossier` | `getLeadDossier` |
| GET | `/crm/leads/:id/policy-events` | `getLeadPolicyEvents` |
| GET | `/crm/leads/:id/case-file` | `getLeadCaseFile` |
| POST | `/crm/leads/:id/override` | `registerOverride` |
| POST | `/crm/leads/:id/manual-mode` | `toggleManualMode` |
| POST | `/crm/leads/:id/reset` | `resetLead` |

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

O painel operacional Enova 2 possui, no mínimo, **7 abas/frentes**: Conversas, Bases, Atendimento, CRM, Dashboard, Incidentes, ENOVA IA. Esta seção mapeia, para cada aba, o backend exigido vs. o que esta PR entrega.

### 8.1. Aba: Conversas

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Listar conversas (por lead) | ❌ | Endpoint `GET /conversations` agregando turnos por lead | PR-T8.8 (Supabase) |
| Abrir conversa (detalhe) | ⚠️ Parcial — `GET /crm/leads/:id/timeline` retorna turnos | Mensagens reais (inbound + outbound) | PR-T8.12 (WhatsApp real) |
| Listar mensagens/turnos | ⚠️ Parcial — `crm_turns` (placeholder) | Mensagens com payload real, anexos, áudio | PR-T8.12 |
| Exibir stage/fase atual | ❌ | `GET /crm/leads/:id` projeta `stage_current` do Core; tabela `crm_lead_state` ainda vazia | PR-T8.8 (projeção real do Core) |
| Exibir último resumo | ❌ | Resumo semântico produzido pelo LLM | PR-T8.9 (LLM real) |
| Suporte a modo manual | ✅ | — | Esta PR (`POST /crm/leads/:id/manual-mode`) |

**Status da aba:** AUSENTE em runtime real — fundação parcial nesta PR. Frontend depende de PR-T8.5; mensagens reais dependem de PR-T8.12.

---

### 8.2. Aba: Bases

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Listar bases/conhecimentos | ❌ | Endpoint `GET /bases` | PR-T8.8 + PR-T8.14 |
| Status de fontes | ❌ | Endpoint `GET /bases/:id/status` | PR-T8.14 (telemetria) |
| Base normativa (MCMV) | ❌ | Tabela canônica `enova2_normative_base` + endpoint | PR-T8.8 |
| Memória operacional | ⚠️ Parcial — E1 memory existe em `src/e1/memory.ts` | Endpoint de leitura `GET /memory/:lead_id` | PR-T8.8 |
| Fonte de regras MCMV | ❌ | Endpoint `GET /rules/mcmv` lendo do contrato canônico | PR-T8.8 |

**Status da aba:** AUSENTE — esta PR não toca em bases. Razão: Supabase real ainda não conectado; bases vivem em arquivos `schema/source/` e migrações futuras.

---

### 8.3. Aba: Atendimento

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Visão operacional do atendimento | ⚠️ Parcial — `GET /crm/leads?status=active` | Agregação multi-lead com priorização | PR-T8.8 |
| Leads em andamento | ✅ | — | Esta PR (`GET /crm/leads?status=active`) |
| Pendências | ❌ | Endpoint `GET /pending` agregando facts pendentes + docs solicitados | PR-T8.8 |
| Ações humanas | ✅ Parcial — `POST /crm/leads/:id/override` | Listagem cross-lead de overrides | PR-T8.5 (frontend) + PR-T8.8 |
| Modo manual | ✅ | — | Esta PR |
| Reset seguro | ✅ | — | Esta PR (`POST /crm/leads/:id/reset` — preserva auditoria) |

**Status da aba:** PARCIAL — operações por-lead funcionando; visão agregada cross-lead ainda ausente.

---

### 8.4. Aba: CRM

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Leads (lista + criar) | ✅ | — | Esta PR (`GET/POST /crm/leads`) |
| Detalhe do lead | ✅ | — | Esta PR (`GET /crm/leads/:id`) |
| Facts | ✅ leitura | Escrita via API (apenas pelo Core hoje) | PR-T8.8 |
| Documentos | ✅ leitura | Upload via Storage | PR-T8.8 (Supabase Storage) |
| Dossiê | ✅ leitura | Geração/edição do dossiê | PR-T8.6 (prova) + PR-T8.9 |
| Policy events | ✅ leitura | — | Esta PR |
| Override | ✅ | — | Esta PR |
| Case-file consolidado | ✅ | — | Esta PR (`GET /crm/leads/:id/case-file`) |

**Status da aba:** ✅ COBERTA NESTA PR para leitura/operação supervisionada. Escrita de facts/docs/dossiê depende de PR-T8.8 + PR-T8.9.

---

### 8.5. Aba: Dashboard

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Métricas operacionais | ❌ | Endpoint `GET /dashboard/metrics` agregando telemetria | PR-T8.14 |
| Volume de leads | ❌ | Endpoint `GET /dashboard/volume?range=...` | PR-T8.8 |
| Distribuição por fase | ❌ | Endpoint `GET /dashboard/stages` | PR-T8.8 |
| Pendências (cross-lead) | ❌ | Endpoint `GET /dashboard/pending` | PR-T8.8 |
| Erros | ❌ | Agregação de telemetria de erro | PR-T8.14 |
| Conversões futuras | ❌ | Funil completo lead → visita → contrato | PR-T8.6 (prova) + PR-T8.9 |

**Status da aba:** AUSENTE — esta PR não implementa dashboard. Razão: depende de telemetria real (PR-T8.14) e Supabase (PR-T8.8) para agregações.

---

### 8.6. Aba: Incidentes

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Logs de erro | ❌ | Endpoint `GET /incidents` agregando telemetria de erro | PR-T8.14 |
| Violações de policy | ⚠️ Parcial — `GET /crm/leads/:id/policy-events` (por lead) | Listagem cross-lead | PR-T8.8 + PR-T8.14 |
| Falhas de integração | ❌ | Endpoint `GET /incidents/integrations` | PR-T8.14 |
| Eventos críticos | ❌ | Filtro por `severity=critical` | PR-T8.14 |
| Trilha de investigação | ⚠️ Parcial — `crm_override_log` por lead | Trilha cross-lead com `trace_id` | PR-T8.14 |

**Status da aba:** AUSENTE — fundação por-lead existe; visão cross-lead/cross-trace depende de PR-T8.14 (telemetria real persistida).

---

### 8.7. Aba: ENOVA IA

| Funcionalidade esperada | Backend nesta PR | Backend ausente | PR responsável |
|---|---|---|---|
| Status do runtime | ⚠️ Parcial — `GET /` (root) e `GET /crm/health` | Endpoint dedicado `GET /ia/runtime` | PR-T8.14 |
| Status do LLM | ❌ | Endpoint `GET /ia/llm` (modelo, latência, fallback) | PR-T8.9 (LLM real) |
| Memória | ⚠️ Parcial — E1 memory existe | Endpoint de leitura/inspeção | PR-T8.8 |
| Prompt registry | ❌ | Endpoint `GET /ia/prompts` lendo registry canônico | PR-T8.9 |
| Avaliações futuras | ❌ | Endpoint `GET /ia/evals` | PR-T8.9 |
| Telemetria cognitiva | ❌ | Endpoint agregando decisões do Core + LLM | PR-T8.14 |

**Status da aba:** AUSENTE — esta PR não toca em runtime IA. Razão: LLM real (PR-T8.9) e telemetria real (PR-T8.14) ainda não conectados.

---

### 8.8. Sumário consolidado das 7 abas

| Aba | Cobertura nesta PR |
|---|---|
| Conversas | AUSENTE (fundação parcial via `crm_turns`) |
| Bases | AUSENTE |
| Atendimento | PARCIAL |
| **CRM** | ✅ **COBERTA** |
| Dashboard | AUSENTE |
| Incidentes | AUSENTE (fundação parcial por-lead) |
| ENOVA IA | AUSENTE |

**Conclusão:** PR-T8.4 cobre apenas a aba **CRM** do painel operacional. As demais 6 abas estão explicitamente declaradas como AUSENTES, com PR futura responsável apontada. Esta PR **não promete painel completo**.

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

- [x] Auth seguro (sem fallback universal — flag `CRM_ALLOW_DEV_TOKEN` exigida)
- [x] Backend atual funcional (`node --check` OK em 5 arquivos)
- [x] Matriz por aba documentada (§8.1 a §8.7)
- [x] Lacunas por aba explícitas com PR responsável (§8.8)
- [x] Próxima PR-T8.5 sabe quais telas/funcionalidades consumir
- [x] Sem promessa falsa de painel completo

**Itens fora de escopo desta PR (não tocados):** frontend, workflow/deploy, cliente real, WhatsApp real, contrato T8.
