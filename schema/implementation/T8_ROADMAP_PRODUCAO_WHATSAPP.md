# T8 — Roadmap oficial: Enova 2 em produção respondendo WhatsApp

**Tipo:** PR-DOC / GOVERNANÇA  
**Data:** 2026-05-01  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Estado atual:** Enova 2 recebe inbound real, cria lead + turno + memória no Worker TEST — **ainda não responde WhatsApp**

---

## AVISOS OBRIGATÓRIOS

> **"1 número WhatsApp = 1 webhook ativo por vez."**  
> Enova 1 e Enova 2 não podem receber o mesmo webhook simultaneamente.  
> A Enova 1 precisa ser pausada/desligada/substituída no momento do cutover.  
> Rollback imediato é voltar o webhook para a Enova 1.  
> A próxima etapa autorizada é **PR-T8.16**.  
> Estado atual: Enova 2 recebeu inbound real, mas ainda **não responde WhatsApp**.  
> **Não pular direto para LLM/outbound.**

---

## Etapa 1 — PR-DIAG inbound/cutover

**Status: CONCLUÍDA — PR #166 mergeada**

Objetivo: diagnosticar o gap entre inbound recebido e resposta operacional.

Resultado: 10 lacunas mapeadas (LAC-IB-01..10). Inbound termina em `webhook.ts:259` sem chamar nada downstream. Zero CRM, zero memória, zero LLM, zero outbound.

Artefato: `schema/diagnostics/T8_META_INBOUND_CUTOVER_DIAGNOSTICO.md`

---

## Etapa 2 — PR-T8.16 — inbound → CRM + memória

**Status: CONCLUÍDA**

Implementar somente:

- WhatsApp recebido → cria/atualiza lead no CRM
- → registra conversa/evento
- → registra memória (`source: 'meta_webhook'`)

**Obrigatório:**

- Sem LLM
- Sem outbound
- Sem resposta WhatsApp
- `LLM_REAL_ENABLED=false`
- `CLIENT_REAL_ENABLED=false`

Arquivos esperados:

- `src/meta/pipeline.ts` (NOVO) — orchestrador inbound
- `src/crm/service.ts` — `upsertLeadByPhone(wa_id, phone_number_id)`
- `src/crm/routes.ts` — `POST /crm/conversations`
- `src/meta/webhook.ts` — chamar pipeline (gated por `ENOVA2_ENABLED`)

Gate de entrada: `ENOVA2_ENABLED=true` + `CHANNEL_ENABLED=true` (já ativos no TEST).

---

## Etapa 3 — PR-PROVA da T8.16

**Status: PRÓXIMA PR AUTORIZADA**

Provar:

- Mensagem real recebida no Worker TEST
- → lead criado/atualizado no CRM
- → conversa/evento salvo
- → memória registrada (`source: 'meta_webhook'`)
- → **nenhuma resposta enviada no WhatsApp** ← confirmar explicitamente

Prova deve rodar no Worker TEST (`nv-enova-2-test`) com webhook apontando para TEST.

---

## Etapa 4 — PR-T8.17 — LLM controlado

**Status: aguarda Etapa 3 concluída**

Conectar inbound ao LLM para gerar `reply_text`, gated por flags.

**Obrigatório:**

- `LLM_REAL_ENABLED=false` por padrão — só ativa com autorização Vasques
- `CLIENT_REAL_ENABLED=false`
- LLM é soberano da fala — o mecânico não compõe resposta (ver ADENDO_CANONICO_SOBERANIA_IA)
- `reply_text` gerado exclusivamente pelo LLM — nunca pelo adapter/webhook
- Sem resposta real ampla sem autorização explícita de Vasques

---

## Etapa 5 — PR-PROVA da T8.17 em TEST

**Status: aguarda Etapa 4 concluída + autorização Vasques**

Provar em janela curta e controlada:

- Mensagem real → LLM gera resposta → outbound responde no WhatsApp

**Somente com Vasques presente e autorizando `LLM_REAL_ENABLED=true` no TEST.**

Evidência obrigatória:
- Log Cloudflare de inbound recebido
- Log de chamada LLM com `reply_text` gerado
- Mensagem respondida no WhatsApp (screenshot)
- Nenhuma resposta indevida enviada

---

## Etapa 6 — Cutover Enova 1 → Enova 2 PROD

**Status: aguarda Etapa 5 concluída**

### Contexto de 1 número WhatsApp

Com apenas 1 número WhatsApp, apenas 1 webhook pode estar ativo no painel Meta por vez.

| Ambiente | URL |
|---|---|
| Enova 1 (atual) | `https://nv-enova.brunovasque.workers.dev/webhook/meta` |
| Enova 2 TEST | `https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook` |
| Enova 2 PROD (destino) | `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook` |

### Pré-condições do cutover

- Etapas 2–5 todas concluídas com prova
- Enova 2 PROD deployada (`wrangler deploy`, sem `--env test`)
- Secrets Meta provisionados no PROD Worker
- `ROLLBACK_FLAG=false` confirmado no PROD
- Vasques presente e com acesso ao painel Meta
- Rollback testado previamente (Vasques sabe como reverter)
- Janela de baixo tráfego escolhida

### Sequência de cutover (janela curta)

```
1. Verificar: ROLLBACK_FLAG=false no PROD Enova 2
2. Trocar webhook Meta → Enova 2 PROD URL
3. Confirmar: inbound chega no PROD (wrangler tail nv-enova-2)
4. Confirmar: primeira mensagem respondida corretamente
5. Monitorar 5–15 min
6. Declarar cutover concluído
```

### Rollback imediato (se falhar em qualquer passo)

```
→ Trocar webhook de volta para:
   https://nv-enova.brunovasque.workers.dev/webhook/meta
→ Enova 1 retoma em ~30 segundos
→ Não há outro rollback técnico necessário (Enova 1 não foi desligada)
```

**A Enova 1 não deve ser desligada antes de confirmar Enova 2 PROD funcional.**

---

## Etapa 7 — Closeout / G8 aprovado

**Status: aguarda Etapa 6 concluída**

Somente depois de prova real completa:

- Re-executar `npm run prove:g8-readiness` — resultado esperado: 7/7 PASS + G8 APROVADO
- Atualizar `src/golive/harness.ts` — remover `meta_ready = false` hardcoded
- Documentar evidência completa: lead real atendido, resposta real enviada, logs Cloudflare
- Declarar T8.12B encerrada
- Declarar G8 aprovado operacionalmente
- Enova 2 oficialmente em produção

---

## Resumo das flags por etapa

| Etapa | ENOVA2 | CHANNEL | META_OUT | LLM_REAL | CLIENT_REAL |
|---|---|---|---|---|---|
| 2 (CRM+memória) | true (TEST) | true (TEST) | true (TEST) | **false** | **false** |
| 3 (prova T8.16) | true (TEST) | true (TEST) | true (TEST) | **false** | **false** |
| 4 (LLM controlado) | true (TEST) | true (TEST) | true (TEST) | **true** (Vasques) | **false** |
| 5 (prova T8.17) | true (TEST) | true (TEST) | true (TEST) | true | **false** |
| 6 (cutover PROD) | true (PROD) | true (PROD) | true (PROD) | true | **true** (Vasques) |
| 7 (G8) | true | true | true | true | true |

---

## Estado atual consolidado

| Item | Estado |
|---|---|
| Worker TEST `nv-enova-2-test` | PUBLICADO |
| Secrets Meta TEST | PROVISIONADOS |
| Inbound real no Worker TEST | RECEBIDO (PR #165) |
| Diagnóstico do gap | CONCLUÍDO (PR #166) |
| Acoplamento inbound → CRM | **IMPLEMENTADO (PR-T8.16)** |
| Acoplamento inbound → memória | **IMPLEMENTADO (PR-T8.16)** |
| Chamada LLM a partir do inbound | **NÃO IMPLEMENTADO** |
| Outbound automático | **NÃO ATIVADO** |
| Resposta WhatsApp | **NÃO** |
| Cutover Enova 1 → Enova 2 | **NÃO EXECUTADO** |
| G8 | **NÃO FECHADO** |
