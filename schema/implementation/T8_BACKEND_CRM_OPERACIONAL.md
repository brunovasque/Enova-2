# T8_BACKEND_CRM_OPERACIONAL — Documento de Implementação (PR-T8.4)

**Tipo:** PR-IMPL  
**Frente:** CRM Operacional  
**Contrato âncora:** CONTRATO_IMPLANTACAO_MACRO_T8.md §PR-T8.4  
**Diagnóstico precedente:** schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md (PR-T8.3)  
**Data:** 2026-04-29  
**Autor:** Claude Code (Anthropic) — sessão autorizada por Vasques

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
- Produção: env var `CRM_ADMIN_KEY` (Cloudflare Worker secret)  
- Desenvolvimento local: token fixo `dev-crm-local`  
- Sem configuração de Supabase real: auth permanece neste padrão mínimo

Todas as rotas retornam `401` se o header estiver ausente ou inválido.

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

## 8. Próximos passos autorizados

| PR | Tipo | Frente |
|---|---|---|
| PR-T8.5 | PR-IMPL | Frontend CRM operacional |
| PR-T8.6 | PR-PROVA | Prova real CRM end-to-end |
| PR-T8.8 | PR-IMPL | Supabase real (conector DB) |
