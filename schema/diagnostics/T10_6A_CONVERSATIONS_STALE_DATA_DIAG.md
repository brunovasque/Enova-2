# T10.6A — Diagnóstico: Conversas Desatualizadas no Panel-NextJS

> **Tipo**: PR-DIAG — READ-ONLY — nenhuma alteração de código  
> **Branch**: `diag/t10.6a-conversations-stale-data`  
> **Data**: 2026-05-03  
> **Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`  
> **Frente**: T10 — Migração Panel/CRM  
> **Classificação**: `diagnostico`  

---

## §1. Evidências reais de Vasques (entrada do diagnóstico)

| Aba | Status | Evidência |
|-----|--------|-----------|
| `/api/health` | OK | `ok=true`, `db_ok=true`, `worker_ok=true`, `endpointTested="/__admin__/go-live/health"`, `status=200` |
| `/bases` | OK com dados reais | Base Fria: 5 / Base Morna: 1 / Base Quente: 1 / Arquivados: 1 / Total: 7 leads |
| `/crm` | OK com dados reais | Pasta incompleta: 1 / Total: 1 lead |
| `/conversations` | STALE | Carrega mas mostra conversas desatualizadas: etapas antigas (`clt_renda_perfil_informativo`, `inicio`, `quem_pode_somar`); mensagens antigas |

---

## §2. Mapa de fluxo: `/conversations` UI → API → Supabase

```
ConversationUI.tsx (client)
  │  poll a cada 1000ms
  ▼
GET /api/conversations?ts=1
  │  (panel-nextjs/app/api/conversations/route.ts)
  │
  ├─ SELECT * FROM enova_state
  │    ORDER BY updated_at.desc LIMIT 200
  │    → retorna: wa_id, nome, fase_conversa, funil_status,
  │               atendimento_manual, last_incoming_text,
  │               last_user_msg, last_bot_msg, updated_at
  │
  └─ SELECT wa_id,tag,meta_text,details,created_at FROM enova_log
       WHERE wa_id IN (<lista>)
         AND tag IN ('meta_minimal','DECISION_OUTPUT','SEND_OK')
       ORDER BY created_at.desc LIMIT 3000
       → retorna: snippet da última mensagem por wa_id

  Monta resposta final:
    last_message_text = latestLog.text
                     ?? enova_state.last_incoming_text
                     ?? enova_state.last_user_msg
                     ?? enova_state.last_bot_msg
    fase_conversa    = enova_state.fase_conversa
    funil_status     = enova_state.funil_status
    last_message_at  = latestLog.createdAt
                     ?? enova_state.last_incoming_at
                     ?? enova_state.updated_at
```

**Arquivo**: `panel-nextjs/app/api/conversations/route.ts` (241 linhas)  
**Tabelas consultadas**: `enova_state` (primária) + `enova_log` (enriquecimento de snippet)

---

## §3. Mapa de fluxo: `/atendimento/[wa_id]` UI → API → Supabase

```
AtendimentoDetalhePage (server component)
  │
  ├─ fetchAttendanceDetailAction(wa_id)
  │    → GET /rest/v1/enova_attendance_v1?select=*&wa_id=eq.<wa_id>&limit=1
  │    → GET /rest/v1/crm_lead_meta?select=lead_pool&wa_id=eq.<wa_id>&limit=1
  │    Fonte: enova_attendance_v1 VIEW (≠ enova_state)
  │
  └─ fetchClientProfileAction(wa_id)
       → tabela separada (crm_lead_meta / client-profile)

ConversationUI thread (client)
  │  poll a cada 1000ms
  ▼
GET /api/messages?wa_id=<wa_id>&limit=200
  │  (panel-nextjs/app/api/messages/route.ts)
  │
  └─ SELECT id,wa_id,tag,meta_type,meta_text,details,created_at FROM enova_log
       WHERE wa_id = eq.<wa_id>
         AND tag IN ('meta_minimal','DECISION_OUTPUT','SEND_OK')
       ORDER BY created_at.desc LIMIT 200

  Monta mensagens:
    meta_minimal    → direction: "in"  (mensagem do usuário)
    DECISION_OUTPUT → direction: "out" (resposta do bot)
    SEND_OK         → direction: "out" (ACK de envio)
```

**Arquivo**: `panel-nextjs/app/api/messages/route.ts` (257 linhas)  
**Tabela consultada**: `enova_log` (tags específicos do Enova-1)

---

## §4. Mapa de fluxo: `/bases` e `/crm` (abas que funcionam)

```
/bases UI
  ▼
GET /api/bases
  │  (panel-nextjs/app/api/bases/route.ts → _shared.ts)
  │
  └─ GET /rest/v1/bases_leads_v1   ← VIEW: crm_lead_meta LEFT JOIN enova_attendance_meta
       WHERE is_archived=false
       ORDER BY updated_at.desc LIMIT 50

/crm UI
  ▼
GET /api/crm
  │  (panel-nextjs/app/api/crm/route.ts → _shared.ts)
  │
  └─ GET /rest/v1/enova_attendance_v1   ← VIEW: enova_attendance_meta (JOIN crm_lead_meta)
       ORDER BY atualizado_em.desc.nullsfirst LIMIT 50
```

**Por que funcionam**: Leem `crm_lead_meta` e `enova_attendance_meta` — tabelas gerenciadas
pelo próprio painel via ações de Bases/CRM (add_lead_manual, import_base, archive, etc.).

---

## §5. Campos e tabelas usadas — comparação cruzada

| Aba | Tabela/View | Quem escreve | Campo de stage | Campo de snippet |
|-----|-------------|--------------|----------------|-----------------|
| `/bases` | `bases_leads_v1` (VIEW → `crm_lead_meta`) | Panel (Bases actions) | `lead_pool`, `lead_temp` | `obs_curta`, `status_operacional` |
| `/crm` | `enova_attendance_v1` (VIEW → `enova_attendance_meta`) | Panel (CRM actions) | N/A (por tab) | N/A |
| `/conversations` (lista) | `enova_state` | Enova-1 (legado) / Worker parcial | `fase_conversa`, `funil_status` | `last_incoming_text`, `last_user_msg`, `last_bot_msg` |
| `/conversations` (thread) | `enova_log` | Enova-1 (legado) | N/A | `meta_text`, `details` |

---

## §6. Causa raiz identificada

### ROOT-01 (Principal): `enova_state.fase_conversa` contém valores do Enova-1 não atualizados

**Evidência direta**:
- `enova_state.fase_conversa` tem default `'inicio'` (text nullable, default 'inicio')
- Vasques confirmou no T9.13K §16 que a distribuição real de `fase_conversa` inclui:
  `inicio`, `inicio_nome`, `inicio_programa`, `docs_opcao`, `confirmar_interesse`,
  `primeiro`, `proxy_teste_5`, **`clt_renda_perfil_informativo`**, **`quem_pode_somar`**, `system_counter`
- Esses valores são stage names do Enova-1 — nunca usados pelo Enova-2

**Por que ocorre**:
- O Worker Enova-2 (`src/supabase/crm-store.ts`) usa `mapStageCurrentToFaseConversa()`:
  - `docs_prep` → `'envio_docs'`
  - `analysis_waiting` → `'aguardando_retorno_correspondente'`
  - `visit_scheduling` → `'agendamento_visita'`
  - `visit_confirmed` → `'visita_confirmada'`
  - `finalization` → `'finalizacao_processo'`
  - **`discovery`**, `qualification_civil`, `qualification_renda`, `qualification_eligibility` → `null` (não atualiza)
- Para stages pré-docs (discovery/qualification_*), `fase_conversa` **nunca é atualizado** pelo Worker Enova-2
- O banco preserva o valor anterior (que pode ser um stage name do Enova-1, ex: `clt_renda_perfil_informativo`)
- Para leads novos criados pelo Enova-2, o valor default `'inicio'` é preservado

**Arquivo relevante**: `src/supabase/crm-store.ts:190-206` (`mapStageCurrentToFaseConversa`)

---

### ROOT-02 (Principal): Tags `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK` em `enova_log` são dados do Enova-1

**Evidência direta**:
- Grep em `src/meta/ingest.ts` → **zero ocorrências** de `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK`
- Grep em `src/meta/webhook.ts` → **zero ocorrências** desses tags
- Grep em `src/**/*.ts` → **zero ocorrências** de escrita desses tags ao Supabase
- O único local que escreve em `enova_log` no Enova-2 é `panel-nextjs/app/api/bases/_shared.ts`:
  - Tags escritos: `bases_add_lead_manual`, `bases_import`, `bases_move`, `bases_pause`, `bases_resume`,
    `bases_call_now`, `bases_warmup`, `bases_warmup_dispatch`, `bases_update_obs`, `bases_archive`, `bases_unarchive`
  - **Nenhum** desses tags é lido pela API `/conversations` ou `/messages`

**Por que ocorre**:
- O Enova-2 WhatsApp Worker não registra mensagens inbound/outbound com esses tags
- A API `/messages` busca exclusivamente esses tags → encontra apenas dados antigos do Enova-1
- As mensagens exibidas na thread são mensagens históricas do Enova-1, não interações do Enova-2

---

### ROOT-03 (Derivado): Campos de fallback em `enova_state` também não são atualizados pelo Enova-2

**Evidência direta**:
- `src/supabase/types.ts:226-234` → `EnovaStateRow` interface expõe apenas: `lead_id`, `updated_at`, `fase_conversa`
- O Worker nunca escreve `last_incoming_text`, `last_user_msg`, `last_bot_msg`, `last_incoming_at`, `nome`
- O fallback em `conversations/route.ts:207-211` recorre a esses campos → retorna `null` para leads do Enova-2

---

### ROOT-04 (Estrutural): `enova_state` usa `lead_id` (UUID) no Worker vs `wa_id` no panel

**Evidência direta**:
- `src/supabase/crm-store.ts:108-120` → `mapLeadStateFromEnovaState` usa `lead_id`
- `src/supabase/crm-store.ts:220-229` → `mapLeadStateToEnovaState` escreve `lead_id`
- `panel-nextjs/app/api/conversations/route.ts:111-113` → lê `enova_state` por `wa_id`
- `enova_state` tem ambas as colunas (`lead_id` UUID + `wa_id`), mas o Worker escreve pelo `lead_id` (UUID interno do CRM)
- Leads novos criados via Worker podem ter row com `lead_id` correto mas `wa_id` nulo/incorreto

---

## §7. Hipótese principal

**As conversas aparecem desatualizadas porque o painel lê dados de `enova_state` e `enova_log` que foram
escritos pelo Enova-1 e nunca receberam atualização adequada do Enova-2.**

O Enova-2 Worker:
- Atualiza `enova_state` apenas com `lead_id` + `updated_at` + `fase_conversa` (só pós-docs)
- Não escreve tags `meta_minimal`/`DECISION_OUTPUT`/`SEND_OK` em `enova_log`
- Não atualiza `last_incoming_text`, `last_user_msg`, `last_bot_msg`

O painel Enova-1 lia exatamente esses campos/tags. O painel Enova-2 (importado do Enova-1) continua
buscando os mesmos campos/tags → encontra apenas dados antigos do Enova-1.

---

## §8. Hipóteses descartadas

| Hipótese | Descartada por |
|----------|----------------|
| Cache de browser / CDN | `Cache-Control: no-store` em todas as rotas; fetch com `cache: "no-store"` |
| Ordenação errada | `updated_at.desc` em `enova_state` e `created_at.desc` em `enova_log` são corretos |
| SUPABASE_URL/SERVICE_ROLE incorretos | `/bases` e `/crm` funcionam com os mesmos envs → envs corretos |
| View `enova_state` não existe | Bases e CRM fazem upsert em `enova_state` via bases/_shared.ts → existe |
| Dados reais estão velhos mesmo | Não: o Worker processou leads reais (7 leads existem, CRM tem 1 lead ativo) |
| Falta RLS | ServiceRole bypassa RLS; `/bases` e `/crm` funcionam → RLS não é bloqueante aqui |

---

## §9. Por que `/bases` e `/crm` refletem dados reais enquanto `/conversations` não

| Aspecto | `/bases` e `/crm` | `/conversations` |
|---------|-------------------|------------------|
| Tabela fonte | `crm_lead_meta` + `enova_attendance_meta` | `enova_state` + `enova_log` |
| Quem escreve | Panel (Bases/CRM actions) | Enova-1 (legado) |
| Frequência de atualização | A cada ação no painel (add_lead, archive, etc.) | Enova-1 não mais ativo; Enova-2 atualiza parcialmente |
| Campo de stage | `lead_pool`, `lead_temp` (gerenciados pelo painel) | `fase_conversa` (herança E1, parcialmente atualizado) |
| Snippet de mensagem | N/A | Tags E1 não escritos pelo E2 |

---

## §10. Recomendação de PR-FIX mínima (T10.6B-FIX)

### Problema A: `fase_conversa`/`funil_status` exibem valores do Enova-1

**Opção A1 — Remover display de fase/funil (mínima, zero risco)**:
- Remover os badges `fase_conversa` e `funil_status` da lista de conversas
- Ou exibi-los apenas quando o valor for um dos mapeados pelo Enova-2 (`envio_docs`, `aguardando_retorno_correspondente`, etc.)
- Zero alteração em `src/`, zero alteração em Supabase

**Opção A2 — Cruzar com `crm_lead_meta` para stage real**:
- JOIN com `crm_lead_meta` por `wa_id` para obter `lead_pool`/`lead_temp` como indicador de progresso
- Requer identificar se `crm_lead_meta.wa_id` está populado para todos os leads

### Problema B: Thread mostra mensagens antigas do Enova-1

**Opção B1 — Mapear para `enova_log` com tags do Enova-2 (quando disponíveis)**:
- Verificar quais tags o Worker Enova-2 efetivamente escreve em `enova_log` (necessita diagnóstico adicional)
- Adicionar esses tags ao filtro da API `/messages`

**Opção B2 — Exibir estado da conversa em vez de thread de mensagens**:
- A thread pode mostrar apenas o estado atual do `enova_state` (nome, atendimento_manual, etc.)
- Simplifica sem depender de dados históricos

**Recomendação**: Opção A1 + diagnóstico adicional sobre quais tags o Worker escreve (B1 depende de investigação de runtime em PROD).

---

## §11. Riscos de mexer em `/conversations`

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Quebrar o modo manual (atendimento_manual vem de `enova_state`) | ALTO | `atendimento_manual` vem de `enova_state` e é escrito pelo endpoint `/api/manual-mode` → verificar se esse endpoint atualiza `enova_state` corretamente |
| Quebrar envio manual (`/api/send`) | MÉDIO | `send/route.ts` chama o Worker — independente da query de conversations |
| Quebrar `/api/case-files` | BAIXO | Rota independente |
| Perder visibilidade de conversas Enova-2 | MÉDIO | Enquanto Worker não escreve tags E1, a thread estará vazia para leads novos — isso já é o estado atual |

---

## §12. O que NÃO deve ser alterado nesta PR-DIAG

- `panel-nextjs/**` — nenhum arquivo alterado
- `src/` (Worker) — nenhum arquivo alterado
- Supabase — nenhuma migration, view, RLS ou índice
- `enova_state` — nenhuma alteração de schema
- `enova_log` — nenhuma alteração de schema
- `crm_lead_meta` — nenhuma alteração
- `enova_attendance_meta` — nenhuma alteração
- WhatsApp webhook / outbound — fora de escopo
- LLM pipeline — fora de escopo
- Vercel config / env — fora de escopo

---

## §13. Arquivos inspecionados (READ-ONLY)

| Arquivo | Propósito |
|---------|-----------|
| `panel-nextjs/app/conversations/page.tsx` | Entry point da aba Conversas |
| `panel-nextjs/app/conversations/ConversationUI.tsx` | Componente cliente — polling, chamadas API |
| `panel-nextjs/app/api/conversations/route.ts` | API lista de conversas — lê `enova_state` + `enova_log` |
| `panel-nextjs/app/api/messages/route.ts` | API thread de mensagens — lê `enova_log` |
| `panel-nextjs/app/atendimento/[wa_id]/page.tsx` | Tela de atendimento individual |
| `panel-nextjs/app/atendimento/actions.ts` | Server actions — usa `enova_attendance_v1` |
| `panel-nextjs/app/api/atendimento/_shared.ts` | Query `enova_attendance_v1` e `crm_lead_meta` |
| `panel-nextjs/app/api/bases/route.ts` | API bases — usa `bases_leads_v1` |
| `panel-nextjs/app/api/bases/_shared.ts` | Query `bases_leads_v1`, write `crm_lead_meta` + `enova_log` |
| `panel-nextjs/app/api/crm/route.ts` | API CRM — usa `enova_attendance_v1` |
| `src/worker.ts` | Entrypoint Worker Enova-2 |
| `src/meta/ingest.ts` | Ingest MetaAPI — NÃO escreve em `enova_log` |
| `src/supabase/crm-store.ts` | Mapper de stages; `mapStageCurrentToFaseConversa()` |
| `src/supabase/types.ts` | Schema `EnovaStateRow` — apenas `lead_id`, `updated_at`, `fase_conversa` |
| `src/e1/memory.ts` | E1 hook — in-memory, não escreve Supabase |

---

## §14. Próximo passo autorizado

**T10.6B-FIX** — PR-FIX — corrigir aba Conversas para não exibir dados obsoletos do Enova-1

Pré-requisitos antes do T10.6B-FIX:
1. Vasques confirma quais tags o Worker escreve em `enova_log` (ou confirma que não escreve nada)
2. Vasques decide: remover badges `fase_conversa`/`funil_status` da lista, ou manter apenas valores E2-conhecidos
3. Vasques decide: thread de mensagens fica vazia para leads E2 (OK temporário) ou mapear nova fonte

Alternativa: T10.6-CRM-LINK pode iniciar antes de T10.6B-FIX (são frentes paralelas — CRM usa `enova_attendance_v1`, não `enova_state`)

---

## §15. Estado dos gates T10

| Gate | Status |
|------|--------|
| G10.1 (contrato) | APROVADO |
| G10.2 (import) | APROVADO |
| G10.3 (build local) | APROVADO |
| G10.4 (preview Vercel) | ABERTO — requer Vasques |
| G10.5 (/api/health real) | APROVADO — validado por Vasques (ok=true confirmado) |
| G10.6 (CRM real) | ABERTO — T10.6-CRM-LINK |
| G10.7 (readiness) | ABERTO — T10.7-READINESS |

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/diagnostics/T10_6A_CONVERSATIONS_STALE_DATA_DIAG.md
Estado da evidência:                   completa — diagnóstico READ-ONLY, causa raiz identificada
Há lacuna remanescente?:               sim — LAC-T10.6A-01: quais tags o Worker E2 escreve em
                                        enova_log em PROD (necessário para B1 do T10.6B-FIX)
Há item parcial/inconclusivo bloqueante?: não — causa raiz identificada; LAC-T10.6A-01 é
                                          contexto para T10.6B-FIX, não bloqueia o diagnóstico
Fechamento permitido nesta PR?:        sim — PR-DIAG encerrada; G10.6 permanece ABERTO
Estado permitido após esta PR:         T10.6A-DIAG concluída; G10.5 APROVADO Vasques;
                                        G10.6 ABERTO aguarda T10.6B-FIX ou T10.6-CRM-LINK
Próxima PR autorizada:                 T10.6B-FIX (corrigir conversations) ou
                                        T10.6-CRM-LINK (ligar CRM real) — paralelas
```
