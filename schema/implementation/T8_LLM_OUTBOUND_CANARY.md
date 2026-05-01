# T8 — PR-T8.17 — LLM + outbound canary controlado

---

## 1. Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.17 |
| Tipo | PR-IMPL acelerada/controlada |
| Fase | T8 |
| Data | 2026-05-01 |
| Base | PR #168 (T8.16 inbound→CRM+memória) + PR #169 (PROVA T8.16 positiva) |
| Branch | `feat/t8-pr-t8-17-llm-outbound-canary` |
| Próxima etapa | PR-PROVA T8.17 — prova real canary com Vasques |

---

## 2. Objetivo

Conectar o pipeline inbound ao LLM para geração de `reply_text` e ao outbound Meta para envio controlado somente para o número canary autorizado (`OUTBOUND_CANARY_WA_ID`), sem abrir atendimento amplo.

A Enova 2 passa de "recebe inbound + registra CRM/memória" para "recebe inbound → CRM/memória → LLM responde → WhatsApp responde (somente canary)".

---

## 3. Fluxo implementado

```
POST /__meta__/webhook
  ↓ validação de assinatura HMAC-SHA256
  ↓ parser de payload Meta
  ↓ deduplificação por wa_message_id
  ↓ runCanaryPipeline(event, env)
      ↓ runInboundPipeline → upsertLeadByPhone + createConversationTurn + registerMemoryEvent
      ↓ [GATE LLM_REAL_ENABLED + !ROLLBACK + !MAINTENANCE] callLlm(text_body, env) → reply_text
      ↓ [GATE OUTBOUND_CANARY_ENABLED + wa_id === OUTBOUND_CANARY_WA_ID + reply_text presente]
        → sendMetaOutbound(intent, env)
  ↓ CanaryReport técnico + 200 para Meta
```

---

## 4. Flags

| Flag | Tipo | Comportamento |
|---|---|---|
| `LLM_REAL_ENABLED` | bool | `true` → chama LLM; `false` → sem LLM (default safe) |
| `OUTBOUND_CANARY_ENABLED` | bool | `true` → habilita gate canary; `false` → sem outbound |
| `OUTBOUND_CANARY_WA_ID` | string | wa_id único autorizado a receber resposta |
| `CLIENT_REAL_ENABLED` | bool | permanece `false`; canary funciona independentemente |
| `ROLLBACK_FLAG` | bool | `true` → bloqueia LLM e outbound (precedência máxima) |
| `MAINTENANCE_MODE` | bool | `true` → bloqueia LLM e outbound |
| `OPENAI_API_KEY` | secret | chave da API OpenAI; nunca em log/response |

### Gates em cascata

```
se ROLLBACK_FLAG=true → bloqueia LLM e outbound (canary_block_reason: rollback_active)
se MAINTENANCE_MODE=true → bloqueia LLM e outbound (maintenance_active)
se LLM_REAL_ENABLED=false → não chama LLM (llm_disabled)
se OUTBOUND_CANARY_ENABLED=false → não envia outbound (canary_disabled)
se OUTBOUND_CANARY_WA_ID ausente → não envia outbound (canary_wa_id_missing)
se wa_id !== OUTBOUND_CANARY_WA_ID → não envia outbound (wa_not_allowed)
se reply_text ausente → não envia outbound (reply_text_missing)
```

---

## 5. Comportamento por caso

### Caso 1 — flags desligadas (default)
```
inbound recebido → CRM/memória registra → LLM não chama → outbound não envia → 200 Meta
llm_invoked=false | reply_text_present=false | outbound_attempted=false
```

### Caso 2 — LLM ligado, canary desligado
```
inbound → CRM/memória → LLM gera reply_text → outbound NÃO envia
llm_invoked=true | reply_text_present=true | outbound_attempted=false | canary_block_reason=canary_disabled
```

### Caso 3 — LLM ligado, canary ligado, WA autorizado
```
inbound → CRM/memória → LLM gera reply_text → outbound envia para OUTBOUND_CANARY_WA_ID
llm_invoked=true | reply_text_present=true | outbound_attempted=true | external_dispatch=true | canary_allowed=true
```

### Caso 4 — LLM ligado, canary ligado, WA não autorizado
```
inbound → CRM/memória → LLM pode gerar reply_text → outbound NÃO envia
canary_allowed=false | canary_block_reason=wa_not_allowed
```

---

## 6. Arquivos criados/modificados

### Criados
| Arquivo | Papel |
|---|---|
| `src/llm/client.ts` | Cliente LLM mínimo (OpenAI API, fetch puro, sem SDK) |
| `src/meta/canary-pipeline.ts` | Orquestrador canary: CRM+memória → LLM → outbound controlado |
| `src/meta/canary-smoke.ts` | Smoke 41 checks — sem LLM real, sem outbound real |
| `schema/implementation/T8_LLM_OUTBOUND_CANARY.md` | Este documento |

### Modificados
| Arquivo | O que mudou |
|---|---|
| `src/meta/webhook-env.ts` | +6 vars: `LLM_REAL_ENABLED`, `OUTBOUND_CANARY_ENABLED`, `OUTBOUND_CANARY_WA_ID`, `OPENAI_API_KEY`, `ROLLBACK_FLAG`, `MAINTENANCE_MODE` |
| `src/golive/flags.ts` | +2 flags: `outbound_canary_enabled`, `outbound_canary_wa_id`; +helper `readStr` |
| `src/meta/webhook.ts` | Substitui `runInboundPipeline` por `runCanaryPipeline`; response body com campos canary |
| `package.json` | `smoke:meta:canary` adicionado; incluído em `smoke:all` |

---

## 7. Segurança e restrições

| Restrição | Status |
|---|---|
| Zero cliente amplo | ✅ `CLIENT_REAL_ENABLED=false` — canary funciona independentemente |
| Zero cutover | ✅ sem alteração de webhook PROD |
| Zero produção ampla | ✅ apenas Worker TEST autorizado |
| Zero resposta para WA não autorizado | ✅ gate `wa_id === OUTBOUND_CANARY_WA_ID` obrigatório |
| Rollback preservado | ✅ `ROLLBACK_FLAG=true` bloqueia LLM e outbound com precedência máxima |
| Secret nunca em log | ✅ `OPENAI_API_KEY` nunca em stdout/response/error |
| LLM soberano da fala | ✅ `reply_text` gerado exclusivamente pelo LLM; adapter não compõe fala |
| T8.12B não encerrada | ✅ estado esperado nesta etapa |
| G8 não fechado | ✅ estado esperado nesta etapa |

---

## 8. Smokes

| Suite | Resultado |
|---|---|
| `smoke:meta:canary` | **41/41 PASS** |
| `smoke:meta:webhook` | **20/20 PASS** (retrocompatível) |
| `smoke:meta:pipeline` | **26/26 PASS** (retrocompatível) |
| `smoke:golive` | **18/18 PASS** (retrocompatível) |
| `smoke:all` | **73/73 PASS** — exit 0 |

---

## 9. LLM — detalhes de implementação

- API: OpenAI Chat Completions (`https://api.openai.com/v1/chat/completions`)
- Modelo: `gpt-4o-mini`
- Max tokens: 300
- Temperature: 0.7
- System prompt: define Enova como atendente MCMV, proíbe aprovação de financiamento, proíbe decisão de etapa/funil
- Sem SDK — fetch puro (consistente com padrão do repo)
- Chave via `OPENAI_API_KEY` (secret Worker, nunca no código)

---

## 10. Próxima etapa autorizada

**PR-PROVA T8.17 — prova real canary com Vasques:**

1. Vasques seta `LLM_REAL_ENABLED=true`, `OUTBOUND_CANARY_ENABLED=true`, `OUTBOUND_CANARY_WA_ID=<wa_id_vasques>`, `OPENAI_API_KEY=<chave>` no Worker TEST
2. Vasques envia mensagem real pelo WhatsApp
3. Validar: LLM gerou `reply_text` → outbound respondeu somente para o WA autorizado
4. Validar: tom adequado, CRM lead atualizado, memória registrada, logs Cloudflare limpos
5. Confirmar: nenhuma resposta indevida enviada para WA não autorizado

**T8.12B: NÃO ENCERRADA — esperado nesta etapa.**
**G8: NÃO FECHADO — esperado nesta etapa.**
