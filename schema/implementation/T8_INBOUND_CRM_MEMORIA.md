# T8.16 — Acoplamento inbound Meta → CRM + memória

**Tipo:** PR-IMPL  
**Data:** 2026-05-01  
**PR:** PR-T8.16  
**Contrato:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Diagnóstico anterior:** `schema/diagnostics/T8_META_INBOUND_CUTOVER_DIAGNOSTICO.md`  

---

## Objetivo

Implementar o menor patch seguro para que o inbound real recebido em `POST /__meta__/webhook` passe a:

1. Criar/atualizar lead no CRM por `wa_id` (external_ref)
2. Registrar turno de conversa no CRM
3. Registrar evento de memória (`source: 'meta_webhook'`, `category: 'attendance_memory'`)
4. Retornar relatório técnico no response do webhook

**Esta PR não ativa LLM. Não envia outbound. Não responde WhatsApp.**

---

## Restrições invioláveis

- `LLM_REAL_ENABLED=false` — nunca chamado nesta PR
- `CLIENT_REAL_ENABLED=false` — sem outbound real
- `ENOVA2_ENABLED=true` — gate obrigatório para ativar o pipeline
- `reply_text` — nunca gerado pelo adapter/pipeline (soberania da IA)
- Nenhuma resposta enviada ao WhatsApp

---

## Arquivos modificados/criados

### Novos

| Arquivo | Papel |
|---|---|
| `src/meta/pipeline.ts` | Orquestrador: evento normalizado → CRM + memória |
| `src/meta/pipeline-smoke.ts` | Smoke test do pipeline (26 checks) |
| `schema/implementation/T8_INBOUND_CRM_MEMORIA.md` | Este documento |

### Modificados

| Arquivo | Mudança |
|---|---|
| `src/meta/webhook-env.ts` | Adiciona `ENOVA2_ENABLED` ao `MetaWorkerEnv` |
| `src/meta/webhook.ts` | Importa e chama `runInboundPipeline` quando `ENOVA2_ENABLED=true` |
| `src/crm/service.ts` | Adiciona `upsertLeadByPhone` e `createConversationTurn` |
| `src/crm/routes.ts` | Adiciona `POST /crm/conversations` |
| `package.json` | Adiciona `smoke:meta:pipeline` ao scripts e `smoke:all` |

---

## Pipeline — `src/meta/pipeline.ts`

### Fluxo

```
runInboundPipeline(event, env, ctx)
  ├── Gate: ENOVA2_ENABLED=true ou retorna blocked
  ├── Passo 1: getCrmBackend(env) → upsertLeadByPhone(backend, wa_id, phone_number_id)
  │   └── findOne(external_ref === wa_id) → se existe: ok (update phone_ref se ausente)
  │                                        → se não: insert novo lead
  ├── Passo 2: createConversationTurn(backend, lead_id, 'whatsapp', raw_input_summary)
  │   └── insert crm_turns com stage_at_turn='unknown', model_name=null, latency_ms=null
  ├── Passo 3: registerMemoryEvent({ source: 'meta_webhook', category: 'attendance_memory', ... })
  └── Retorna: { ok, mode: 'crm_memory_only', lead_id, turn_id, memory_event_id, llm_invoked: false, ... }
```

### Invariantes do pipeline

- Nunca lança exceção — captura internamente, registra em `errors[]`
- Nunca chama LLM
- Nunca envia outbound
- `reply_text` ausente no resultado (verificado por smoke)
- Idempotente por `wa_id`: mesmo lead reutilizado em chamadas repetidas

---

## CRM — funções adicionadas em `src/crm/service.ts`

### `upsertLeadByPhone(backend, wa_id, phone_number_id?)`

- Busca por `external_ref === wa_id`
- Se encontrado: atualiza `phone_ref` se ausente, retorna lead existente
- Se não encontrado: cria lead com `status: 'active'`, `manual_mode: false`
- Falha controlada se `wa_id` vazio

### `createConversationTurn(backend, lead_id, channel_type, raw_input_summary)`

- Cria registro em `crm_turns`
- `stage_at_turn: 'unknown'` — LLM nunca consultado
- `model_name: null`, `latency_ms: null`
- `raw_input_summary` truncado a 500 chars

---

## CRM — rota adicionada em `src/crm/routes.ts`

### `POST /crm/conversations`

Body: `{ lead_id: string, channel_type?: string, raw_input_summary: string }`

- Requer `X-CRM-Admin-Key` (autenticação padrão CRM)
- Chama `createConversationTurn` diretamente
- Retorna 201 + registro criado

---

## Webhook — mudança em `src/meta/webhook.ts`

### Antes (PR-T8.11)

```
processMetaWebhookPost → ... → emitWebhookEvent('meta.outbound.blocked') → return 200
```

### Depois (PR-T8.16)

```
processMetaWebhookPost → ... →
  SE ENOVA2_ENABLED=true E event.kind === 'message' E não duplicate:
    → await runInboundPipeline(event, env, ctx)
    → pipelineResults.push(result)
  → emitWebhookEvent('meta.outbound.blocked') → return 200
```

O campo `meta.outbound.blocked` com `pr_t811_no_auto_outbound` é preservado integralmente.

O response agora inclui:
- `mode: 'crm_memory_only'` (quando ENOVA2_ENABLED=true) ou `'technical_only'`
- `pipeline_enabled: true/false`
- `pipeline: [PipelineReport]` (quando pipeline executado)

---

## Smoke results

```
smoke:meta:pipeline   → PASS: 26 | FAIL: 0 | TOTAL: 26
smoke:all             → todos os suites PASS (sem regressão)
```

---

## Flags por estado

| Flag | Valor nesta PR |
|---|---|
| ENOVA2_ENABLED | true (TEST) — gate do pipeline |
| CHANNEL_ENABLED | true (TEST) |
| META_OUTBOUND_ENABLED | true (TEST) |
| LLM_REAL_ENABLED | **false** — nunca ativado |
| CLIENT_REAL_ENABLED | **false** — sem outbound real |

---

## Próximo passo autorizado

PR-PROVA da T8.16 — confirmar com mensagem real recebida no Worker TEST:
- lead criado/atualizado no CRM
- turno de conversa registrado
- evento de memória registrado (`source: 'meta_webhook'`)
- **nenhuma resposta enviada no WhatsApp** (confirmação explícita)
