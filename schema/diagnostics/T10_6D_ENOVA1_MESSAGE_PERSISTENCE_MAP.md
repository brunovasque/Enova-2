# T10.6D — Diagnóstico: Mapa de Persistência de Mensagens do Enova 1

> **Tipo**: PR-DIAG — READ-ONLY — nenhuma alteração de código funcional
> **Branch**: `diag/t10.6d-enova1-message-persistence-map`
> **Data**: 2026-05-04
> **Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
> **Frente**: T10 — Migração Panel/CRM
> **Classificação**: `diagnostico`
> **Fonte legada**: `D:\Enova` (READ-ONLY — nenhum arquivo alterado)

---

## §1. Contexto e motivação

A PR #222 (T10.6C) confirmou definitivamente que o Worker Enova-2 **não persiste mensagens atuais do WhatsApp em Supabase real**. A thread do painel mostra apenas histórico do Enova 1 (até 19/04) porque `/api/messages` lê `enova_log` com tags E1 (`meta_minimal`, `DECISION_OUTPUT`, `SEND_OK`) — tags que o Worker E2 nunca escreve.

**Objetivo deste diagnóstico**: ler o repo legado `D:\Enova` para mapear exatamente como o Enova 1 persistia mensagens entre Meta, Worker e Supabase — e definir o menor patch possível para trazer esse comportamento para o Enova-2.

---

## §2. Mapa completo Enova 1: Meta → Worker → Supabase → Painel

### §2.1 Entrada Meta/WhatsApp (Webhook)

| Campo | Valor |
|-------|-------|
| **Arquivo** | `D:\Enova\Enova worker.js` |
| **Rota GET** | `GET /webhook/meta` — handshake de verificação Meta |
| **Rota POST** | `POST /webhook/meta` — recepção de mensagens reais |
| **Função principal** | `handleMetaWebhook(request, env, ctx)` (linha ~9052) |

**Extração do payload (linhas ~9267-9382):**

```javascript
const entry     = body?.entry?.[0];
const change    = entry?.changes?.[0];
const value     = change?.value;
const msg       = value?.messages?.[0];
const contacts  = value?.contacts || [];

wa_id           = msg.from || contacts[0]?.wa_id;
message_id      = msg.id;                    // wamid da Meta
type            = msg.type;                  // "text", "image", "audio", etc
text            = msg.text?.body;            // texto do cliente
timestamp       = msg.timestamp;             // unix timestamp
profileName     = contacts[0]?.profile?.name;
```

**Campos extraídos por mensagem:**

| Campo extraído | Origem no payload Meta | Tipo |
|----------------|------------------------|------|
| `wa_id` | `msg.from` ou `contacts[0].wa_id` | string |
| `message_id` | `msg.id` | string (wamid) |
| `type` | `msg.type` | "text", "image", "audio", "video", "document" |
| `text` | `msg.text.body` | string (só para type="text") |
| `timestamp` | `msg.timestamp` | unix (convertido para ISO) |
| `profileName` | `contacts[0].profile.name` | string (opcional) |

---

### §2.2 Persistência Inbound (mensagem recebida do cliente)

**Função de persistência** (`logger`, linha ~903-914):

```javascript
async function logger(env, data) {
  await sbFetch(env, "/rest/v1/enova_log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
```

**Chamada após recebimento** (linhas ~9460-9467):

```javascript
await logger(env, {
  tag:              "meta_minimal",
  wa_id:            waId,
  meta_type:        metaType,         // msg.type
  meta_text:        metaText,         // msg.text.body
  meta_message_id:  metaMessageId,    // msg.id (wamid)
  meta_status:      metaStatus,       // status de delivery (se presente)
});
```

**Tabela Supabase**: `enova_log`

**Campos gravados (inbound):**

| Campo | Valor | Observação |
|-------|-------|-----------|
| `tag` | `"meta_minimal"` | Identificador canônico de mensagem inbound |
| `wa_id` | `msg.from` | Identifica o cliente (chave de filtro) |
| `meta_type` | `msg.type` | Tipo de mensagem ("text", "image", etc) |
| `meta_text` | `msg.text.body` | **Texto real enviado pelo cliente** |
| `meta_message_id` | `msg.id` | wamid da Meta (idempotência) |
| `meta_status` | status de delivery | "delivered", "read", "failed" (se presente) |
| `created_at` | auto | Supabase injeta ISO 8601 automaticamente |

**Efeito secundário**: se `wa_id` não tem estado, cria linha em `enova_state`:
```javascript
upsertState(env, waId, { fase_conversa: "inicio", funil_status: null, nome: profileName });
```

---

### §2.3 Persistência Outbound (resposta do bot)

O Enova 1 persiste a resposta do bot em **duas etapas consecutivas**:

#### Etapa 1 — Tag `DECISION_OUTPUT` (antes de enviar para Meta)

```javascript
await logger(env, {
  tag:        "DECISION_OUTPUT",
  wa_id:      st.wa_id,
  meta_type:  "text",
  meta_text:  msg,            // ← TEXTO REAL DA RESPOSTA DO BOT
  details: {
    stage:      st.fase_conversa || null,
    next_stage: nextStage || null,
  },
});
```

#### Etapa 2 — Tag `SEND_OK` (após confirmação da Meta API)

```javascript
await logger(env, {
  tag:    "SEND_OK",
  wa_id:  waId,
  details: {
    stage:               "sendMessage",
    status:              res.status,              // HTTP status da Meta API
    payload_enviado:     payload,                 // {messaging_product, to, type, text.body}
    provider_response:   providerResponse,        // resposta JSON da Meta
    provider_message_id: providerMessageId,       // wamid de saída
  },
});
```

**Tabela Supabase**: `enova_log` (mesma tabela para inbound e outbound)

**Campos gravados (outbound):**

| Tag | Campo `meta_text` | Campo `details` | Conteúdo real da mensagem |
|-----|-------------------|-----------------|--------------------------|
| `DECISION_OUTPUT` | Texto da resposta do bot | `{stage, next_stage}` | **Sim — em `meta_text`** |
| `SEND_OK` | Vazio | `{payload_enviado.text.body, provider_message_id}` | Sim — em `details.payload_enviado.text.body` |

**Envio para Meta API** (dentro de `sendMessage`):
```javascript
await fetch(`${META_API_URL}/messages`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${env.META_ACCESS_TOKEN}` },
  body: JSON.stringify({
    messaging_product: "whatsapp",
    to: wa_id,
    type: "text",
    text: { body: text }
  })
});
```

---

### §2.4 Leitura no painel Enova 1

**Arquivo**: `D:\Enova\panel\app\api\messages\route.ts`

**Rota**: `GET /api/messages?wa_id=<wa_id>&limit=200`

**Query ao Supabase** (linhas ~166-175):

```javascript
SELECT id, wa_id, tag, meta_type, meta_text, details, created_at
FROM enova_log
WHERE wa_id = '<wa_id>'
  AND tag IN ('meta_minimal', 'DECISION_OUTPUT', 'SEND_OK')
ORDER BY created_at DESC
LIMIT 200
```

**Como monta a thread:**

| Tag | `direction` | `source` | `text` extraído de |
|-----|-------------|----------|--------------------|
| `meta_minimal` | `"in"` | `"user"` | `row.meta_text` |
| `DECISION_OUTPUT` | `"out"` | `"DECISION_OUTPUT"` | `row.meta_text` → fallback `details.reply/bot_text/answer` |
| `SEND_OK` | `"out"` | `"SEND_OK"` | `details.payload_enviado.text.body` → fallback `details.reply/bot_text` |

**Deduplicação**: se dois registros consecutivos `out` têm o mesmo texto em janela de 5 segundos (um `DECISION_OUTPUT` + um `SEND_OK`), o segundo é descartado para evitar duplicata visual.

**Estrutura retornada:**
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

## §3. Fluxo completo E1: Diagrama consolidado

```
Meta Cloud API
  │
  └─ POST /webhook/meta
       │
       └─ handleMetaWebhook()
            │
            ├─ 1. Extraí payload: wa_id, message_id, type, text, timestamp
            │
            ├─ 2. GRAVA em enova_log (INBOUND):
            │       tag: "meta_minimal"
            │       wa_id, meta_type, meta_text (texto do cliente), meta_message_id
            │
            ├─ 3. getState(wa_id) → estado do cliente
            │    Se novo: upsertState → enova_state {fase_conversa: "inicio"}
            │
            ├─ 4. Processa resposta (lógica do bot + stage)
            │
            ├─ 5. GRAVA em enova_log (OUTBOUND DECISION):
            │       tag: "DECISION_OUTPUT"
            │       wa_id, meta_text (resposta gerada), details: {stage, next_stage}
            │
            ├─ 6. sendMessage() → POST Meta API
            │       Payload: {to: wa_id, type: "text", text: {body: replyText}}
            │
            └─ 7. GRAVA em enova_log (OUTBOUND CONFIRMATION):
                    tag: "SEND_OK"
                    wa_id, details: {status, payload_enviado, provider_message_id}
                    
Painel (enova_log leitura):
  GET /api/messages?wa_id=<wa_id>
    → SELECT FROM enova_log WHERE wa_id=? AND tag IN (meta_minimal, DECISION_OUTPUT, SEND_OK)
    → direction: meta_minimal=in, DECISION_OUTPUT/SEND_OK=out
    → deduplicação DECISION_OUTPUT+SEND_OK mesmo texto <5s
```

---

## §4. Inventário de arquivos/funções/tabelas/tags do Enova 1

| Componente | Arquivo | Linha aprox. | Função |
|------------|---------|--------------|--------|
| Webhook GET | `Enova worker.js` | 8817-8851 | Handshake verificação Meta |
| Webhook POST | `Enova worker.js` | 8856-8861 | Recepção mensagens reais |
| Processamento principal | `Enova worker.js` | 9052+ | `handleMetaWebhook()` |
| Extração payload | `Enova worker.js` | 9267-9382 | Extraí wa_id, message_id, text, type |
| Logger (persist) | `Enova worker.js` | 903-914 | `logger()` → POST `enova_log` |
| Persistência inbound | `Enova worker.js` | 9460-9467 | `logger({tag:"meta_minimal",...})` |
| Persistência outbound decision | `Enova worker.js` | 553-562 | `logger({tag:"DECISION_OUTPUT",...})` |
| Envio Meta API | `Enova worker.js` | 765-841 | `sendMessage()` |
| Persistência outbound ACK | `Enova worker.js` | 843-853 | `logger({tag:"SEND_OK",...})` |
| Leitura painel (messages) | `D:\Enova\panel\app\api\messages\route.ts` | 166-175 | `GET /api/messages` |
| Leitura painel (conversations) | `D:\Enova\panel\app\api\conversations\route.ts` | 144-191 | `GET /api/conversations` |
| Tabela mensagens | Supabase | — | `enova_log` |
| Tabela estado cliente | Supabase | — | `enova_state` |

**Tags canônicas Enova 1 em `enova_log`:**

| Tag | Momento | direction | Campo com texto real |
|-----|---------|-----------|---------------------|
| `meta_minimal` | Inbound (mensagem do cliente) | `"in"` | `meta_text` |
| `DECISION_OUTPUT` | Outbound (decisão do bot antes de enviar) | `"out"` | `meta_text` |
| `SEND_OK` | Outbound (confirmação da Meta API) | `"out"` | `details.payload_enviado.text.body` |

---

## §5. Campos persistidos em `enova_log` — inventário completo

| Campo | Tipo | Inbound (`meta_minimal`) | Outbound (`DECISION_OUTPUT`) | Outbound (`SEND_OK`) |
|-------|------|--------------------------|------------------------------|----------------------|
| `tag` | text | `"meta_minimal"` | `"DECISION_OUTPUT"` | `"SEND_OK"` |
| `wa_id` | text | wa_id do cliente | wa_id do cliente | wa_id do cliente |
| `meta_type` | text | tipo Meta ("text", "image") | `"text"` | vazio/null |
| `meta_text` | text | **texto enviado pelo cliente** | **texto da resposta do bot** | vazio/null |
| `meta_message_id` | text | wamid da Meta (inbound) | null | null |
| `meta_status` | text | "delivered"/"read"/"failed" | null | null |
| `details` | jsonb | null | `{stage, next_stage}` | `{status, payload_enviado, provider_response, provider_message_id}` |
| `created_at` | timestamptz | auto Supabase | auto Supabase | auto Supabase |

---

## §6. Comparação E1 vs E2

### §6.1 Tabela comparativa: onde hoje o E2 perde a mensagem

| Etapa | Enova 1 | Enova-2 | Gap |
|-------|---------|---------|-----|
| Webhook inbound | POST `/webhook/meta` → `handleMetaWebhook()` | POST `/__meta__/webhook` → `handleMetaWebhookPost()` | Rota diferente mas funcional |
| Extração payload | `msg.from`, `msg.text.body`, `msg.id` | `NormalizedMetaEvent` com campos equivalentes | **Equivalente** — E2 já extrai wa_id, text, message_id |
| Persistência inbound texto | `logger({tag:"meta_minimal", wa_id, meta_text})` → `enova_log` | `createConversationTurn()` → **writeBuffer** (in-memory) | **GAP CRÍTICO** — texto inbound nunca chega ao Supabase |
| Persistência outbound texto | `logger({tag:"DECISION_OUTPUT", meta_text})` + `logger({tag:"SEND_OK"})` → `enova_log` | `replyText` vai diretamente para Meta API — **zero persistência** | **GAP CRÍTICO** — resposta do bot nunca persistida |
| Leitura no painel | `GET enova_log WHERE tag IN (meta_minimal, DECISION_OUTPUT, SEND_OK)` | **Idêntico ao E1** (`/api/messages/route.ts` — já lê os mesmos 3 tags) | **Zero gap no painel** |
| State do cliente | `upsertState()` → `enova_state` | `upsertLeadState()` → `enova_state` (via Supabase real) | **Equivalente** — E2 já escreve `enova_state` |

### §6.2 O que o E2 já escreve no Supabase real

| Tabela | Campos escritos | Contém texto? | Contém direction? |
|--------|-----------------|---------------|-------------------|
| `crm_lead_meta` | `wa_id`, `lead_pool`, `lead_temp`, `updated_at` | Não | Não |
| `enova_state` | `lead_id`, `updated_at`, `fase_conversa` (condicional) | Não | Não |

### §6.3 O que o E2 tem mas não persiste

| Dado | Onde existe no E2 | Por que não persiste |
|------|-------------------|---------------------|
| Texto inbound (mensagem do cliente) | `text_body` em `canary-pipeline.ts` | `crm_turns` vai para writeBuffer |
| `raw_input_summary` (texto truncado) | `crm_turns.raw_input_summary` | writeBuffer — nunca Supabase |
| `wa_message_id` (dedupe key) | `NormalizedMetaEvent.wa_message_id` | Só usado para dedupe in-memory |
| `replyText` (resposta do bot) | `replyText` em `canary-pipeline.ts` | Vai direto para Meta API |
| `outbound_message_id` | `CanaryReport.outbound_message_id` | Só no CanaryReport (log técnico) |

---

## §7. Arquivos equivalentes E1 → E2

| Componente E1 | Arquivo E1 | Arquivo E2 equivalente |
|---------------|-----------|------------------------|
| Webhook POST | `Enova worker.js:9052` | `src/meta/webhook.ts:handleMetaWebhookPost()` |
| Extração payload | `Enova worker.js:9267-9382` | `src/meta/webhook.ts:parseMetaWebhookPayload()` |
| Logger (persist) | `Enova worker.js:903-914` | **Não existe** — precisa ser criado |
| Pipeline inbound | `Enova worker.js:handleMetaWebhook()` | `src/meta/canary-pipeline.ts:runCanaryPipeline()` |
| CRM state | `Enova worker.js:upsertState()` | `src/supabase/crm-store.ts:SupabaseCrmBackend` |
| Leitura messages | `D:\Enova\panel\app\api\messages\route.ts` | `panel-nextjs/app/api/messages/route.ts` (**idêntico**) |

---

## §8. Recomendação técnica final para PR futura

### §8.1 Opção recomendada: Gravar em `enova_log` com tags E1 (Opção B do T10.6C)

**Justificativa**: O painel E2 (`panel-nextjs/app/api/messages/route.ts`) **já lê** `enova_log` com os 3 tags E1 — o código do painel é idêntico ao E1. Portanto, se o Worker E2 passar a gravar em `enova_log` com as mesmas tags, **zero mudança no painel é necessária**.

**Arquivos a alterar no Worker E2** (src/ — fora de escopo T10):

1. **`src/supabase/crm-store.ts`** — adicionar função `writeEnovaLog()`:
   ```typescript
   async writeEnovaLog(entry: {
     tag: "meta_minimal" | "DECISION_OUTPUT" | "SEND_OK";
     wa_id: string;
     meta_type?: string;
     meta_text?: string;
     meta_message_id?: string;
     details?: Record<string, unknown>;
   }): Promise<void>
   ```
   Implementação: POST em `/rest/v1/enova_log` com service role key.

2. **`src/meta/canary-pipeline.ts`** — 3 chamadas:
   - Após receber inbound: `writeEnovaLog({tag: "meta_minimal", wa_id, meta_text: text_body, meta_type: "text", meta_message_id})`
   - Antes de `sendMetaOutbound`: `writeEnovaLog({tag: "DECISION_OUTPUT", wa_id, meta_text: replyText, details: {stage: currentStage}})`
   - Após `sendMetaOutbound` com sucesso: `writeEnovaLog({tag: "SEND_OK", wa_id, details: {provider_message_id, status: 200}})`

**Painel**: **zero mudança** — `panel-nextjs/app/api/messages/route.ts` já lê esses 3 tags.

### §8.2 Plano mínimo de implementação (PR Worker futura)

```
PR-IMPL Worker (branch: fix/worker-enova-log-persistence)
  Arquivos alterados:
    - src/supabase/crm-store.ts      (+writeEnovaLog)
    - src/supabase/types.ts          (+EnovaLogRow interface)
    - src/meta/canary-pipeline.ts    (+3 chamadas writeEnovaLog)

  NÃO alterar:
    - panel-nextjs/**
    - src/core/**
    - src/llm/**
    - src/memory/**
    - Supabase schema / RLS / migrations
    - wrangler.toml
    - .github/**

  Pré-requisitos:
    - Confirmar schema de `enova_log` no Supabase (ver §9.1)
    - Confirmar que service role key pode escrever em `enova_log` (ver §9.2)
    - Confirmar que coluna `meta_message_id` existe (ou é nullable) em `enova_log`
```

---

## §9. Riscos identificados

### §9.1 Risco: schema de `enova_log` pode ter colunas NOT NULL não mapeadas

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| `enova_log` pode ter colunas NOT NULL além das 7 mapeadas | MÉDIO | Fazer SELECT limit=1 em `enova_log` antes de qualquer INSERT para descobrir colunas reais |
| Coluna `meta_message_id` pode não existir | MÉDIO | Confirmar via SQL direto no Supabase SQL Editor antes da PR-IMPL |
| CHECK constraint pode rejeitar tags E2 novas | BAIXO | E1 já usa `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK` — mesmas tags propostas |

**Ação pré-PR**: Vasques executa `SELECT * FROM enova_log LIMIT 1` + `SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='enova_log'` para mapear o schema real.

### §9.2 Risco: RLS em `enova_log` pode bloquear escrita do Worker

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| RLS com USING/CHECK que restringe escrita por service role | MÉDIO | Worker usa service role key — normalmente bypassa RLS; verificar policy `FOR INSERT` |
| `enova_log` em modo read-only para Worker E2 | BAIXO | Verificar que `SUPABASE_SERVICE_ROLE_KEY` tem permissão de INSERT |

**Ação pré-PR**: Vasques verifica RLS da tabela `enova_log` no Supabase Dashboard.

### §9.3 Risco de reutilizar `enova_log` (backward compatibility)

| Aspecto | Análise |
|---------|---------|
| Dados E1 existentes | Permanecem intactos — E2 apenas adiciona novos registros |
| Deduplicação E1+E2 | Sem conflito — wa_ids de clientes reais são únicos; datas separam os dados |
| Painel mostrará misto (E1+E2) | Correto e esperado — thread contínua por cliente |
| Rollback | DROP das escritas E2: `DELETE FROM enova_log WHERE created_at > '<data_deploy>'` (reversível) |

### §9.4 Risco de criar nova tabela (alternativa descartada)

| Aspecto | Por que NÃO recomendado |
|---------|------------------------|
| Migration necessária | Exige PR-DIAG + PR-MIGRATION separadas + autorização Vasques |
| Painel precisaria mudar | `/api/messages/route.ts` precisaria de nova query |
| Mais PRs, mais risco | 2-3 PRs vs 1 PR na Opção A |
| `enova_log` já existe | Tabela confirmada em T10.1; usar é mais seguro |

---

## §10. O que NÃO deve ser mexido

| Item | Motivo |
|------|--------|
| `D:\Enova` (qualquer arquivo) | Somente leitura — fonte histórica |
| `panel-nextjs/**` | Não necessário — painel já lê os tags E1 corretos |
| `Supabase schema` (migrations) | Não necessário — `enova_log` já existe |
| `RLS` (sem diagnóstico próprio) | Só verificar, não alterar nesta PR |
| `src/core/**` | Fora de escopo — Core já funciona |
| `src/llm/**` | Fora de escopo |
| `src/memory/**` | Fora de escopo |
| `wrangler.toml` | Não necessário — SUPABASE_URL/SERVICE_ROLE já configurados |
| Lógica de autenticação do Worker | Fora de escopo |
| Aba Funil/Qualificação | Não autorizada nesta fase |

---

## §11. Arquivos inspecionados (READ-ONLY neste diagnóstico)

### Enova 1 (D:\Enova — READ-ONLY)

| Arquivo | Achado relevante |
|---------|-----------------|
| `D:\Enova\Enova worker.js` (linha ~903) | `logger()` → POST `enova_log` via `sbFetch` |
| `D:\Enova\Enova worker.js` (linha ~9052) | `handleMetaWebhook()` — processamento completo |
| `D:\Enova\Enova worker.js` (linha ~9267-9382) | Extração de `wa_id`, `message_id`, `text`, `type`, `timestamp` |
| `D:\Enova\Enova worker.js` (linha ~9460-9467) | `logger({tag:"meta_minimal",...})` — inbound persistence |
| `D:\Enova\Enova worker.js` (linha ~553-562) | `logger({tag:"DECISION_OUTPUT",...})` — outbound antes de enviar |
| `D:\Enova\Enova worker.js` (linha ~765-841) | `sendMessage()` — envio para Meta API |
| `D:\Enova\Enova worker.js` (linha ~843-853) | `logger({tag:"SEND_OK",...})` — confirmação da Meta |
| `D:\Enova\panel\app\api\messages\route.ts` (linha ~166-175) | Query `enova_log` com 3 tags; lógica direction=in/out |
| `D:\Enova\panel\app\api\conversations\route.ts` (linha ~144-191) | Lista conversas via `enova_state` + última mensagem de `enova_log` |

### Enova-2 (D:\Enova-2 — comparativo)

| Arquivo | Achado relevante |
|---------|-----------------|
| `src/meta/webhook.ts` | Recebe webhook, extrai NormalizedMetaEvent (wa_id, text, message_id) — equivalente ao E1 |
| `src/meta/canary-pipeline.ts` | Pipeline completo — nunca chama logger para `enova_log` |
| `src/supabase/crm-store.ts` (linha 401) | "crm_turns, crm_facts e demais: fallthrough para writeBuffer" — explícito |
| `panel-nextjs/app/api/messages/route.ts` | Código idêntico ao E1 — lê mesmos 3 tags de `enova_log` |
| `schema/diagnostics/T10_6C_CURRENT_WHATSAPP_MESSAGES_DIAG.md` | Confirmou root cause e descartou fix sem Worker change |

---

## §12. Arquivos NÃO alterados neste diagnóstico

- `D:\Enova/**` — nenhuma alteração (READ-ONLY)
- `panel-nextjs/**` — nenhuma alteração
- `src/` (Worker E2) — nenhuma alteração
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
| G10.6 (CRM real) | APROVÁVEL — aguarda validação Vasques dos modais |
| G10.7 (readiness) | ABERTO — T10.7-READINESS |

---

## §14. Próximo passo autorizado

**PR Worker futura (fora de escopo T10)**:
- Tipo: PR-IMPL Worker
- Escopo mínimo: `writeEnovaLog()` em `crm-store.ts` + 3 chamadas em `canary-pipeline.ts`
- Pré-requisitos:
  1. Vasques confirma schema de `enova_log` (`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='enova_log'`)
  2. Vasques confirma RLS/INSERT permission com service role
  3. Autorização Vasques para a PR Worker (fora do escopo T10)
- Pode ser executada em paralelo com T10.7-READINESS ou após G9 aprovado

**Próxima PR autorizada T10**: T10.7-READINESS

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/diagnostics/T10_6D_ENOVA1_MESSAGE_PERSISTENCE_MAP.md
Estado da evidência:                   completa — diagnóstico READ-ONLY, mapa E1 completo,
                                        comparação E1 vs E2 documentada, recomendação técnica definida
Há lacuna remanescente?:               sim — LAC-T10.6D-01: schema real de enova_log não confirmado
                                        por SQL direto (requer ação Vasques pré-PR-IMPL);
                                        LAC-T10.6D-02: RLS/INSERT permission do service role não
                                        verificada (requer ação Vasques)
                                        Ambas não bloqueantes para este PR-DIAG
Há item parcial/inconclusivo bloqueante?: não — diagnóstico completo; mapa E1 total; plano mínimo
                                           documentado; lacunas são pré-requisitos da PR-IMPL futura
Fechamento permitido nesta PR?:        sim — PR-DIAG encerrada; G10.7 permanece ABERTO;
                                        mapa E1 disponível para orientar PR Worker futura
Estado permitido após esta PR:         T10.6D-DIAG concluída; mapa E1 disponível;
                                        próxima T10: T10.7-READINESS;
                                        próxima Worker: PR-IMPL escritura em enova_log
Próxima PR autorizada:                 T10.7-READINESS (readiness/closeout formal T10) e/ou
                                        PR Worker (gravar enova_log — requer autorização Vasques)
```
