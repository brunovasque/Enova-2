# T10.6C — Diagnóstico: Mensagens WhatsApp Atuais no Panel-NextJS

> **Tipo**: PR-DIAG — READ-ONLY — nenhuma alteração de código
> **Branch**: `diagfix/t10.6c-current-whatsapp-messages`
> **Data**: 2026-05-04
> **Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
> **Frente**: T10 — Migração Panel/CRM
> **Classificação**: `diagnostico`

---

## §1. Contexto e motivação

Após a T10.6B-FIX (PR #221), a lista de conversas foi melhorada:
- Badges E1 obsoletos (`clt_renda_perfil_informativo`, `quem_pode_somar`, etc.) sumiram
- Badges E2 (`lead_pool`, `lead_temp`, `status_operacional`) foram adicionados

Mas a validação real Vasques revelou que a **thread de mensagens** ainda mostra histórico velho de 19/04. O WhatsApp real tem mensagens novas de ontem/hoje — mas elas não aparecem no painel.

**Objetivo deste diagnóstico**: descobrir se o Worker Enova-2 grava mensagens atuais em alguma tabela/tag/campo do Supabase, e se é possível corrigir o painel sem alterar Worker/src/ nem schema Supabase.

---

## §2. Fluxo inbound WhatsApp — mapeamento completo

```
Meta Cloud API → POST /__meta__/webhook
  │
  ├─ src/meta/webhook.ts: handleMetaWebhookPost()
  │    → verifyMetaSignature() (HMAC-SHA256)
  │    → parseMetaWebhookPayload() → NormalizedMetaEvent {
  │         wa_id, wa_message_id, phone_number_id,
  │         timestamp, kind, message_type,
  │         text_body, media_id, media_mime_type
  │       }
  │    → dedupeStore.remember(dedupeKey) [in-memory FIFO 1000]
  │
  └─ Se ENOVA2_ENABLED=true:
       src/meta/canary-pipeline.ts: runCanaryPipeline()
         │
         ├─ Passo 1 — runInboundPipeline() (src/meta/pipeline.ts)
         │    → getCrmBackend(env) → SupabaseCrmBackend ou CrmInMemoryBackend
         │    → upsertLeadByPhone(backend, wa_id, phone_number_id)
         │         → backend.insert('crm_leads', {...})
         │         → SUPABASE REAL: crm_lead_meta (wa_id, lead_pool, lead_temp, updated_at)
         │         → sem text_body, sem direção, sem timestamp de mensagem
         │    → createConversationTurn(backend, lead_id, 'whatsapp', text_body.slice(0,200))
         │         → backend.insert('crm_turns', {raw_input_summary, ...})
         │         → SEMPRE writeBuffer (in-memory) — nunca Supabase real
         │         → ver: src/supabase/crm-store.ts linha 401-452
         │    → registerMemoryEvent(...)
         │         → backend.insert('crm_memory', {...}) → writeBuffer in-memory
         │
         ├─ Passo 1.5 — Core mecânico (src/core/engine.ts)
         │    → extractFactsFromText(text_body, stage) → facts
         │    → writeLeadFact(backend, fact) → backend.insert('crm_facts', {...})
         │         → SEMPRE writeBuffer (in-memory)
         │    → upsertLeadState(backend, lead_id, coreDecision)
         │         → backend.update('crm_lead_state', ...)
         │         → SUPABASE REAL: enova_state (lead_id, updated_at, fase_conversa condicional)
         │         → sem text_body, sem direção, sem timestamp de mensagem
         │
         └─ Passo 2 — LLM + outbound (gated)
              → sendMetaOutbound(intent, env)
              → CanaryReport técnico: reply_text_present, external_dispatch
              → NÃO persiste reply_text em nenhuma tabela Supabase real
```

---

## §3. Fluxo outbound — mapeamento completo

```
canary-pipeline.ts: replyText (string gerado pelo LLM)
  │
  └─ sendMetaOutbound({ wa_id, phone_number_id, reply_text }, env)
       → src/meta/outbound.ts
       → Chamada HTTP para Meta API (api.facebook.com/v18.0/.../messages)
       → Retorna OutboundResult { ok, message_id, error_body_sanitized }
       → CanaryReport registra: outbound_attempted, external_dispatch, outbound_message_id
       → NÃO persiste texto enviado em nenhuma tabela Supabase real
       → NÃO escreve em enova_log com nenhum tag
```

---

## §4. O que o Worker E2 escreve no Supabase — inventário completo

| Tabela | Escrita real? | Campos escritos | Contém texto? | Contém direção? |
|--------|--------------|-----------------|--------------|----------------|
| `crm_lead_meta` | **SIM** (Supabase real) | `wa_id`, `lead_pool`, `lead_temp`, `updated_at` | Não | Não |
| `enova_state` | **SIM** (Supabase real) | `lead_id`, `updated_at`, `fase_conversa` (condicional) | Não | Não |
| `crm_turns` | **NÃO** (writeBuffer in-memory) | `turn_id`, `lead_id`, `channel_type`, `raw_input_summary`, `stage_at_turn`, `created_at` | Sim (`raw_input_summary`) | Não (sempre `in`) |
| `crm_facts` | **NÃO** (writeBuffer in-memory) | `fact_id`, `lead_id`, `fact_key`, `fact_value`, `confidence`, `status` | Não | Não |
| `enova_log` | **NUNCA** | — | — | — |

**Evidência definitiva de que `enova_log` não é escrito pelo Worker E2**:
- `src/meta/ingest.ts` — zero ocorrências de `enova_log`, `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK`
- `src/meta/webhook.ts` — zero ocorrências
- `src/meta/canary-pipeline.ts` — zero ocorrências
- `src/meta/pipeline.ts` — zero ocorrências
- `src/meta/outbound.ts` — zero ocorrências
- O único escrito em `enova_log` no repositório é `panel-nextjs/app/api/bases/_shared.ts` (tags de ações do painel: `bases_add_lead_manual`, `bases_import`, etc.)

**Evidência definitiva de que `crm_turns` vai apenas para writeBuffer**:
- `src/supabase/crm-store.ts` linhas 401-452: comentário explícito "crm_turns, crm_facts e demais: fallthrough para writeBuffer"
- A lógica de write real só existe para `crm_leads` (→ `crm_lead_meta`) e `crm_lead_state` (→ `enova_state`)

---

## §5. Mapeamento do painel atual — `/api/messages`

```
GET /api/messages?wa_id=<wa_id>
  │
  └─ panel-nextjs/app/api/messages/route.ts (257 linhas)
       → SELECT id,wa_id,tag,meta_type,meta_text,details,created_at FROM enova_log
            WHERE wa_id = eq.<wa_id>
              AND tag IN ('meta_minimal','DECISION_OUTPUT','SEND_OK')
            ORDER BY created_at.desc LIMIT 200
       → Monta Message[] com direction in/out por tag
```

**Formato esperado pelo ConversationUI.tsx**:
```typescript
type Message = {
  id: string | null;
  wa_id: string;
  direction: "in" | "out";
  text: string | null;
  source: string | null;
  created_at: string | null;
};
```

---

## §6. Causa raiz confirmada

**ROOT-T10.6C-01 (Principal e definitivo)**: O Worker Enova-2 **não persiste mensagens no Supabase real** com nenhum tag ou campo acessível ao painel. Especificamente:

1. O Worker não escreve em `enova_log` com nenhum tag
2. O Worker escreve `crm_turns` apenas in-memory (writeBuffer) — perde tudo no restart do Worker
3. O Worker não persiste `reply_text` (texto enviado ao cliente) em nenhum lugar
4. O painel busca tags `meta_minimal`/`DECISION_OUTPUT`/`SEND_OK` em `enova_log` → encontra apenas dados antigos do Enova-1

**Por que as mensagens aparecem até 19/04**: Eram mensagens do fluxo Enova-1, que escrevia esses tags em `enova_log`. Após a migração para o Worker E2, nenhum novo registro foi escrito com esses tags.

---

## §7. Avaliação das condições de fix condicional (contrato T10.6C)

O fix só poderia ser implementado se TODAS as condições fossem verdadeiras:

| Condição | Status |
|----------|--------|
| Já existe fonte atual de mensagens no Supabase | **FALSO** — `crm_turns` é in-memory only |
| A fonte contém `wa_id`, texto, direção ou tag inferível, `created_at` | **FALSO** — não há tabela com esses campos persistida |
| Não exige migration | **Inviável** — qualquer nova fonte exigiria migration |
| Não exige mudar Worker | **FALSO** — Worker precisaria escrever `crm_turns` no Supabase real |
| Não exige mudar schema | **FALSO** — sem tabela adequada no schema atual |
| Mudança restrita a `panel-nextjs/app/api/messages/route.ts` | **INVIÁVEL** — não há fonte de dados no Supabase para apontar |

**Veredito**: Fix NÃO autorizado. Nenhuma das condições de escrita no Supabase real está satisfeita.

---

## §8. Hipóteses descartadas

| Hipótese | Descartada por |
|----------|----------------|
| Worker E2 escreve em `enova_log` com outros tags | Grep zero em todo `src/` — Worker não usa `enova_log` |
| `crm_turns` vai para Supabase real com SUPABASE_REAL_ENABLED=true | `crm-store.ts` L401: "crm_turns, crm_facts e demais: fallthrough para writeBuffer" — explícito |
| Existe tabela `enova_message_log` ou equivalente | Grep em `src/**/*.ts` e types.ts: tabelas registradas são `crm_lead_meta`, `enova_state`, `crm_leads_v1`, `crm_override_log`, `enova_attendance_v1`, `enova_attendance_meta`, `bases_leads_v1`, `enova_prefill_meta`, `enova_log`, `enova_docs`, `enova_document_files`, `enova_document_events` — nenhuma persiste mensagens E2 |
| `enova_attendance_meta` guarda mensagens | NÃO — guarda dados de atendimento operacional (status, nome, notas) |
| Outbound reply_text é persistido | Grep em `canary-pipeline.ts` e `outbound.ts`: `replyText` vai direto para Meta API, nunca para Supabase |

---

## §9. O que é necessário para ter thread atual

Para que o painel exiba mensagens atuais do Worker E2, **uma** das seguintes opções seria necessária:

### Opção A — Persistir `crm_turns` no Supabase real (mínima e preferida)
**Custo**: PR Worker específica (fora de escopo T10)

1. Adicionar campo `crm_turns` à lógica de escrita real em `src/supabase/crm-store.ts`
2. Confirmar schema da tabela de destino no Supabase (nova tabela ou mapeamento de `enova_log`)
3. Escrever: `wa_id`, `raw_input_summary` (texto inbound truncado), `direction: 'in'`, `created_at`, `message_id` (dedupe key)
4. Adaptar `/api/messages` para ler dessa tabela

**Arquivos que precisariam mudar**: `src/supabase/crm-store.ts`, `src/supabase/types.ts`

### Opção B — Gravar em `enova_log` com tags E2 (compatível com painel atual)
**Custo**: PR Worker + PR Panel específicas (fora de escopo T10)

1. Worker passa a escrever `enova_log` com tag `wa_inbound` (inbound) e `wa_outbound` (outbound)
2. Painel adapta `/api/messages` para incluir esses tags no filtro
3. Backward-compatible: mantém tags E1 como fallback

**Arquivos que precisariam mudar**: `src/supabase/crm-store.ts` ou `src/meta/canary-pipeline.ts`, `panel-nextjs/app/api/messages/route.ts`

### Opção C — Criar nova tabela de mensagens
**Custo**: Migration + PR Worker + PR Panel (mais custosa, fora de escopo T10)

1. Nova migration no Supabase: tabela `enova_message_events` ou similar
2. Worker persiste lá após cada mensagem
3. Painel lê dessa tabela

---

## §10. Recomendação: PR Worker mínima

**PR Worker autorizada após T9.14-IMPL (ou paralela com autorização Vasques)**:

Tipo: PR-IMPL
Escopo mínimo: persistir `crm_turns` (inbound) no Supabase real

Arquivos a alterar:
- `src/supabase/crm-store.ts`: adicionar case `crm_turns` na lógica de write real, análogo ao `crm_leads`
- `src/supabase/types.ts`: declarar `CrmTurnsRow` com `turn_id`, `lead_id`, `wa_id`, `raw_input_summary`, `direction`, `stage_at_turn`, `created_at`
- `panel-nextjs/app/api/messages/route.ts`: adicionar query em `crm_turns` como fonte primária (antes do fallback `enova_log`)

Pré-requisitos:
- Confirmar schema real da tabela no Supabase (ou criar nova tabela com migration autorizada)
- BLK-T9-TURNS-SCHEMA: verificar se `crm_turns` existe no banco ou precisa ser criada

---

## §11. Arquivos inspecionados (READ-ONLY neste diagnóstico)

| Arquivo | Achado relevante |
|---------|-----------------|
| `src/meta/webhook.ts` | NÃO escreve em `enova_log`; chama `runCanaryPipeline` |
| `src/meta/canary-pipeline.ts` | NÃO escreve texto de mensagem no Supabase real; `crm_turns` vai para writeBuffer |
| `src/meta/pipeline.ts` | `createConversationTurn` → `backend.insert('crm_turns', ...)` → writeBuffer |
| `src/meta/ingest.ts` | Rota técnica antiga, não usada no fluxo real — zero `enova_log` |
| `src/supabase/crm-store.ts` L401 | "crm_turns, crm_facts e demais: fallthrough para writeBuffer" — explícito |
| `src/crm/types.ts` | `CrmTurn` definida com `raw_input_summary` mas nunca vai ao Supabase |
| `src/crm/service.ts` | `createConversationTurn` usa `backend.insert('crm_turns', ...)` → writeBuffer |
| `panel-nextjs/app/api/messages/route.ts` | Lê `enova_log` com tags E1 — tags nunca escritos pelo Worker E2 |
| `panel-nextjs/app/conversations/ConversationUI.tsx` | Chama `/api/messages` com polling 1s |
| `schema/diagnostics/T10_6A_CONVERSATIONS_STALE_DATA_DIAG.md` | Confirmado: ROOT-02 do diagnóstico anterior permanece válido e se aprofunda |

---

## §12. Arquivos NÃO alterados neste diagnóstico

- `panel-nextjs/**` — nenhuma alteração
- `src/` (Worker) — nenhuma alteração
- Supabase — nenhuma migration, view, RLS ou índice
- Nenhum arquivo funcional alterado

---

## §13. Estado dos gates T10 após este diagnóstico

| Gate | Status |
|------|--------|
| G10.1 (contrato) | APROVADO |
| G10.2 (import) | APROVADO |
| G10.3 (build local) | APROVADO |
| G10.4 (preview Vercel) | ABERTO — requer Vasques |
| G10.5 (/api/health real) | APROVADO — Vasques confirmou `ok=true` |
| G10.6 (CRM real) | ABERTO — T10.6-CRM-LINK |
| G10.7 (readiness) | ABERTO — T10.7-READINESS |

---

## §14. Lacunas remanescentes

| ID | Lacuna | Impacto | Resolução |
|----|--------|---------|-----------|
| LAC-T10.6C-01 | `crm_turns` nunca persiste no Supabase real — mensagens E2 não aparecem na thread | Thread vazia para leads E2 puros | PR Worker futura (ver §10) |
| LAC-T10.6C-02 | `reply_text` (resposta do bot) nunca é persistida em nenhum lugar | Thread mostra apenas histórico E1 inbound, sem respostas E2 | Junto com LAC-T10.6C-01 |
| LAC-T10.6B-01 | Thread usa `enova_log` E1 como única fonte (herdada de T10.6B) | Confirmada como consequência de LAC-T10.6C-01 | Idem |

---

## §15. Próximo passo autorizado

**T10.6-CRM-LINK** — PR-IMPL — ligar CRM real com Supabase; validar views
- Esta frente (mensagens na thread) requer PR Worker separada, não T10
- T10.6-CRM-LINK pode avançar em paralelo (usa `enova_attendance_v1`, não `enova_log`)

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/diagnostics/T10_6C_CURRENT_WHATSAPP_MESSAGES_DIAG.md
Estado da evidência:                   completa — diagnóstico READ-ONLY, causa raiz identificada,
                                        fix NÃO autorizado (condições não atendidas)
Há lacuna remanescente?:               sim — LAC-T10.6C-01: crm_turns in-memory only, sem fonte
                                        Supabase real de mensagens E2 (não bloqueante para T10.6-CRM-LINK)
Há item parcial/inconclusivo bloqueante?: não — diagnóstico completo; ausência de fonte confirmada;
                                           decisão de não-fix fundamentada em evidência de código
Fechamento permitido nesta PR?:        sim — PR-DIAG encerrada; G10.6 permanece ABERTO
Estado permitido após esta PR:         T10.6C-DIAG concluída; LAC-T10.6C-01 registrada;
                                        G10.6 ABERTO aguarda T10.6-CRM-LINK
Próxima PR autorizada:                 T10.6-CRM-LINK (ligar CRM real com Supabase; validar views)
```
