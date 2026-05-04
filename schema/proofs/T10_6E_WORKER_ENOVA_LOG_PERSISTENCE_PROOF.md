# T10.6E — Prova: Worker Persistência em enova_log

> **Tipo**: PR-IMPL
> **Branch**: `fix/t10.6e-worker-enova-log-persistence`
> **Data**: 2026-05-04
> **Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
> **Frente**: T10 — Migração Panel/CRM + Worker enova_log
> **Classificação**: `contratual` (escopo T10.6 Worker)
> **Diagnósticos base**: `T10_6C_CURRENT_WHATSAPP_MESSAGES_DIAG.md` + `T10_6D_ENOVA1_MESSAGE_PERSISTENCE_MAP.md`

---

## §1. Arquivos alterados

| Arquivo | Tipo | O que mudou |
|---------|------|-------------|
| `src/supabase/types.ts` | MODIFICADO | Interface `EnovaLogEntry` adicionada (payload de insert em `enova_log`) |
| `src/supabase/crm-store.ts` | MODIFICADO | Função `writeEnovaLog()` adicionada; imports `supabaseInsert` + `EnovaLogEntry` |
| `src/meta/canary-pipeline.ts` | MODIFICADO | Imports + `supabaseCfg` + 3 chamadas `writeEnovaLog` |

**Zero alterações em:**
- `panel-nextjs/**` — confirmado por `git diff --stat`
- `src/core/**`, `src/llm/**`, `src/memory/**` — fora de escopo
- Supabase schema/migrations/RLS
- `wrangler.toml`

---

## §2. Função writer criada

**Localização**: `src/supabase/crm-store.ts` (linhas 564–577)

```typescript
export async function writeEnovaLog(
  cfg: SupabaseConfig | null,
  entry: EnovaLogEntry,
): Promise<{ ok: boolean; skip: boolean; error: string | null }> {
  if (!cfg?.url || !cfg?.serviceRoleKey) {
    return { ok: false, skip: true, error: null };
  }
  try {
    const result = await supabaseInsert<EnovaLogEntry>(cfg, 'enova_log', entry);
    return { ok: result.ok, skip: false, error: result.error };
  } catch (e) {
    return { ok: false, skip: false, error: String(e) };
  }
}
```

**Propriedades de segurança:**
- `cfg === null` → skip silencioso (`skip: true`) — nunca quebra pipeline
- Falha de rede/HTTP → capturada, retorna `ok: false` — nunca lança exceção
- Service role key nunca logada (herdado de `supabaseInsert` + `safeErrorMessage`)
- Caller em `canary-pipeline.ts` envolve todas as chamadas em `try/catch` próprio

---

## §3. Onde grava meta_minimal

**Arquivo**: `src/meta/canary-pipeline.ts` (linhas 168–185)

**Momento**: após `runInboundPipeline` + `diagLog pipeline.result`, antes de Passo 1.5

**Condição**: `event.kind === 'message' && event.wa_id`

**Payload gravado:**
```json
{
  "tag": "meta_minimal",
  "wa_id": "<wa_id do cliente>",
  "meta_type": "<event.message_type: 'text'|'image'|...>",
  "meta_text": "<event.text_body: texto enviado pelo cliente>",
  "meta_message_id": "<event.wa_message_id: wamid inbound>",
  "details": {
    "source": "enova2",
    "direction": "in",
    "phone_number_id": "<event.phone_number_id>"
  }
}
```

---

## §4. Onde grava DECISION_OUTPUT

**Arquivo**: `src/meta/canary-pipeline.ts` (linhas 484–501)

**Momento**: após gate `canaryAllowed=true`, antes de `outboundAttempted = true`

**Condição**: `inboundWaId` não vazio (garantido pelo gate `canaryAllowed`)

**Payload gravado:**
```json
{
  "tag": "DECISION_OUTPUT",
  "wa_id": "<inboundWaId>",
  "meta_type": "text",
  "meta_text": "<replyText: resposta do LLM — imutável>",
  "stage": "<coreDecision.stage_current>",
  "details": {
    "source": "enova2",
    "direction": "out",
    "stage": "<coreDecision.stage_current>",
    "next_stage": "<coreDecision.stage_after>"
  }
}
```

---

## §5. Onde grava SEND_OK

**Arquivo**: `src/meta/canary-pipeline.ts` (linhas 532–548)

**Momento**: após `outboundSender` retornar com `external_dispatch=true` (caminho `else` do if-blocked)

**Condição**: `inboundWaId` não vazio + outbound bem-sucedido

**Payload gravado:**
```json
{
  "tag": "SEND_OK",
  "wa_id": "<inboundWaId>",
  "meta_status": "sent",
  "stage": "<coreDecision.stage_current>",
  "details": {
    "source": "enova2",
    "payload_enviado": { "text": { "body": "<replyText>" } },
    "provider_message_id": "<outboundResult.outbound_message_id>",
    "status": "<outboundResult.http_status>"
  }
}
```

---

## §6. Compatibilidade com o painel

**Painel lê** (`panel-nextjs/app/api/messages/route.ts`):
```sql
SELECT id, wa_id, tag, meta_type, meta_text, details, created_at
FROM enova_log
WHERE wa_id = '<wa_id>'
  AND tag IN ('meta_minimal', 'DECISION_OUTPUT', 'SEND_OK')
ORDER BY created_at DESC LIMIT 200
```

| Tag | Painel lê de | E2 grava em |
|-----|-------------|-------------|
| `meta_minimal` | `row.meta_text` | `meta_text: event.text_body` ✅ |
| `DECISION_OUTPUT` | `row.meta_text` | `meta_text: replyText` ✅ |
| `SEND_OK` | `details.payload_enviado.text.body` | `details.payload_enviado.text.body: replyText` ✅ |

**Confirmação zero alteração painel:**
```
$ git diff --stat HEAD | grep panel-nextjs
(nenhuma linha — zero diff)
```

---

## §7. Confirmação zero migration/schema

- Tabela `enova_log` já existe (confirmado por Vasques — pré-flight T10.6E)
- Zero arquivo de migration criado
- Zero RLS alterado
- Zero DDL executado
- Schema Supabase inalterado

```
$ git diff --stat HEAD | grep -i migration
(nenhuma linha)
```

---

## §8. Testes rodados

| Teste | Resultado |
|-------|-----------|
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npx wrangler deploy --dry-run` | **PASS** — build 294.20 KiB |
| `git diff --stat HEAD` | 3 arquivos `src/` — zero panel-nextjs |
| grep zero panel-nextjs diff | CONFIRMADO |
| grep zero migration | CONFIRMADO |
| grep tags na canary-pipeline | `meta_minimal` + `DECISION_OUTPUT` + `SEND_OK` presentes |

---

## §9. Lacunas declaradas

| ID | Lacuna | Severidade | Resolução |
|----|--------|-----------|-----------|
| LAC-T10.6E-01 | Validação real depende de deploy do Worker + envio de WhatsApp real | ABERTA — pós-deploy | Vasques envia mensagem real e verifica painel |
| LAC-T10.6E-02 | Sem unique constraint em `meta_message_id` em `enova_log` — retry Meta pode gerar duplicata | ABERTA — não bloqueante | meta_message_id pode ser usado para dedupe manual; não há garantia de idempotência sem constraint |
| LAC-T10.6D-01 | RLS/INSERT permission do service role em `enova_log` não verificada antes desta PR | ABERTA — pré-deploy | Vasques verifica no Supabase Dashboard; se bloqueado, Writer retorna ok=false e pipeline continua |
| LAC-T10.6D-02 | Schema real de `enova_log` validado apenas por preflight de Vasques — sem SQL direto | ACEITA — preflight suficiente | Vasques confirmou schema com colunas exatas antes desta PR |

---

## §10. Comportamento quando Supabase não configurado

Se `SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` ausentes no env do Worker:
- `supabaseCfg = null`
- `writeEnovaLog(null, ...)` → `{ ok: false, skip: true, error: null }`
- Pipeline continua normalmente — zero impacto no atendimento ao cliente

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_6E_WORKER_ENOVA_LOG_PERSISTENCE_PROOF.md
Estado da evidência:                   completa — writer implementado; 3 chamadas no pipeline;
                                        smoke 41/41 PASS; build dry-run PASS; zero regressão
Há lacuna remanescente?:               sim — LAC-T10.6E-01: validação real pós-deploy (não bloqueante);
                                        LAC-T10.6E-02: sem unique constraint em meta_message_id
                                        Ambas não bloqueantes para esta PR-IMPL
Há item parcial/inconclusivo bloqueante?: não — implementação completa; smoke pass; zero panel-nextjs;
                                           zero migration; tags corretos E1 preservados
Fechamento permitido nesta PR?:        sim — PR-IMPL encerrada; lacunas documentadas e aceitas
Estado permitido após esta PR:         T10.6E-IMPL concluída; Writer ativo; painel compatível
Próxima PR autorizada:                 T10.7-READINESS (readiness/closeout formal T10)
```
