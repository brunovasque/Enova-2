# T8 — Checklist de cutover: Enova 2 em produção WhatsApp

**Tipo:** PR-OPS / GO-LIVE CONTROLADO  
**Data:** 2026-05-01  
**Worker PROD:** `nv-enova-2`  
**Endpoint PROD:** `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`  
**Runbook completo:** `schema/operations/T8_CUTOVER_ENOVA2_PROD.md`

---

## ⚠️ Conceito obrigatório antes de começar

```
CUTOVER = trocar o destino do webhook Meta do número WhatsApp para a Enova 2.

ROLLBACK PREFERENCIAL = desligar flags na Enova 2:
  → ROLLBACK_FLAG=true        (bloqueia LLM + outbound em segundos)
  → MAINTENANCE_MODE=true     (bloqueia atendimento, mantém inbound)
  → LLM_REAL_ENABLED=false    (para geração)
  → OUTBOUND_CANARY_ENABLED=false  (para envio)

RETORNO À ENOVA 1 = emergência extrema, não caminho preferencial.
A Enova 1 não estava funcionalmente completa.
Use rollback por flags PRIMEIRO, sempre.
```

---

## Fase A — Pré-cutover (verificação antes de mexer no Meta)

### A1. Confirmar base do código

- [ ] `git pull origin main` executado — main atualizada
- [ ] Último commit relevante: PR #171 (be9ea9c) ou mais recente
- [ ] Branch `ops/t8-cutover-prod-enova2` criada a partir de main atualizada

### A2. Deploy PROD

- [ ] Comando executado: `npx wrangler deploy` (sem --env flag)
- [ ] Confirmação: `Deployed nv-enova-2` na saída do terminal
- [ ] Worker PROD ativo no dashboard Cloudflare

### A3. Secrets provisionados no Worker PROD (`nv-enova-2`)

- [ ] `META_VERIFY_TOKEN` setado via `wrangler secret put META_VERIFY_TOKEN`
- [ ] `META_APP_SECRET` setado
- [ ] `META_ACCESS_TOKEN` setado
- [ ] `META_PHONE_NUMBER_ID` setado
- [ ] `OPENAI_API_KEY` setado
- [ ] `CRM_ADMIN_KEY` setado
- [ ] `OUTBOUND_CANARY_WA_ID` setado (wa_id de Vasques para fase canary)

### A4. Variáveis de ambiente no Worker PROD

- [ ] `ENOVA2_ENABLED=true`
- [ ] `CHANNEL_ENABLED=true`
- [ ] `META_OUTBOUND_ENABLED=true`
- [ ] `LLM_REAL_ENABLED=true`
- [ ] `OUTBOUND_CANARY_ENABLED=true`
- [ ] `CLIENT_REAL_ENABLED=false` ← **não ampliar ainda**
- [ ] `ROLLBACK_FLAG=false` ← confirmar explicitamente
- [ ] `MAINTENANCE_MODE=false` ← confirmar explicitamente

### A5. Verificação de health pré-cutover

- [ ] `npx wrangler tail nv-enova-2` aberto em terminal separado
- [ ] GET `/__admin__/go-live/health` retorna 200 com `rollback_flag=false`
- [ ] Sem erros nos logs do tail em estado idle

---

## Fase B — Cutover (janela curta, Vasques presente)

**Vasques deve estar disponível com WhatsApp aberto no número canary.**

### B1. Trocar webhook no painel Meta

- [ ] Acessar: Meta Developers → App → WhatsApp → Configuration → Webhook
- [ ] URL atual registrada para referência: `https://nv-enova.brunovasque.workers.dev/webhook/meta`
- [ ] Nova URL inserida: `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`
- [ ] Verify Token: mesmo valor do secret `META_VERIFY_TOKEN` no PROD
- [ ] Clicado "Verify and Save"

### B2. Confirmar challenge aceito

- [ ] Log no `wrangler tail`: `meta.webhook.challenge.ok`
- [ ] Meta exibe "Webhook verified successfully" (ou equivalente)

### B3. Primeira mensagem de validação (Vasques envia)

- [ ] Vasques envia 1 mensagem real pelo WhatsApp para o número de teste
- [ ] Log: `meta.webhook.signature.ok` — assinatura aceita
- [ ] Log: `meta.webhook.inbound.accepted` — mensagem processada
- [ ] Log: `meta.pipeline.crm.lead_upserted` — lead criado/atualizado
- [ ] Log: `meta.pipeline.crm.turn_created` — turno registrado
- [ ] Log: `meta.pipeline.memory.recorded` — memória registrada
- [ ] Log: `meta.llm.invoked` — LLM chamado
- [ ] Log: `meta.outbound.canary.sent` — outbound enviado para canary

### B4. Confirmação no WhatsApp (Vasques)

- [ ] Vasques recebeu mensagem de resposta da Enova 2
- [ ] Texto está em português, humano, sem promessa de aprovação de financiamento
- [ ] Texto não tem erro óbvio de linguagem
- [ ] Nenhum outro número recebeu mensagem

### B5. Verificar ausência de erros críticos

- [ ] Nenhum `status 4xx` ou `5xx` nos logs
- [ ] Nenhum `meta.webhook.signature.fail`
- [ ] Nenhum outbound para WA diferente do canary
- [ ] Nenhum loop de resposta (Enova respondendo a próprias mensagens)
- [ ] Nenhum evento `status` (leitura/entregue) gerando resposta

---

## Fase C — Monitoramento (5–15 min)

- [ ] `wrangler tail nv-enova-2` mantido aberto
- [ ] Pelo menos 2–3 mensagens de teste enviadas e respondidas
- [ ] Cada mensagem → exatamente 1 resposta (sem duplicatas)
- [ ] CRM registrando leads e turnos corretamente
- [ ] LLM gerando respostas adequadas (tom MCMV, sem promessas)
- [ ] Sem degradação de latência anormal

### C1. Declaração de cutover concluído

- [ ] Todos os checks B e C marcados como concluídos
- [ ] Vasques declara cutover bem-sucedido
- [ ] Timestamp do cutover registrado: `___________`

---

## Rollback — Procedimento por nível

### Nível 1 — Preferencial (flags, segundos)

Se qualquer check B/C falhar:
- [ ] Acessar dashboard Cloudflare → `nv-enova-2` → Settings → Variables
- [ ] Setar `ROLLBACK_FLAG=true`
- [ ] Confirmar nos logs: LLM e outbound bloqueados
- [ ] Investigar root cause antes de nova tentativa

Alternativas mais granulares:
- [ ] `MAINTENANCE_MODE=true` — para atendimento, mantém inbound
- [ ] `LLM_REAL_ENABLED=false` — para geração
- [ ] `OUTBOUND_CANARY_ENABLED=false` — para envio

### Nível 2 — Rollback parcial

- [ ] Identificar qual componente falhou
- [ ] Desativar apenas a flag do componente problemático
- [ ] Manter restante funcionando

### Nível 3 — Emergência extrema (retorno à Enova 1)

**Usar SOMENTE se Níveis 1 e 2 falharem completamente.**

- [ ] Acessar Meta Developers → Webhook
- [ ] Alterar URL para: `https://nv-enova.brunovasque.workers.dev/webhook/meta`
- [ ] Verify and Save
- [ ] Aguardar ~30 segundos
- [ ] Confirmar Enova 1 recebendo mensagens novamente
- [ ] **Registrar o incidente — root cause obrigatório antes de re-cutover**

---

## Fase D — Ampliação (decisão pós-cutover estável)

**Não executar durante a virada. Decisão separada de Vasques.**

- [ ] Pelo menos 10–30 min estável em modo canary
- [ ] Vasques presente e decidindo ampliar
- [ ] `CLIENT_REAL_ENABLED=true` — ampliar atendimento a todos os números

---

## Fase E — Após cutover confirmado (closeout)

**Para execução na sessão seguinte, após evidência de atendimento real:**

- [ ] Documentar evidência: log + screenshot da mensagem recebida
- [ ] Re-executar `npm run prove:g8-readiness` — esperado: 7/7 PASS + G8 APROVADO
- [ ] Atualizar `src/golive/harness.ts` — remover `meta_ready = false` hardcoded
- [ ] Declarar T8.12B encerrada
- [ ] Declarar G8 aprovado operacionalmente
- [ ] Criar PR-T8.R.2 — Readiness/Closeout G8

---

## Resumo de flags e endpoints

| Item | Valor confirmado |
|---|---|
| Worker PROD | `nv-enova-2` (wrangler.toml linha 18) |
| Endpoint PROD webhook | `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook` |
| Endpoint TEST webhook | `https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook` |
| Endpoint Enova 1 (emergência) | `https://nv-enova.brunovasque.workers.dev/webhook/meta` |
| Deploy PROD | `npx wrangler deploy` (sem --env) |
| Tail PROD | `npx wrangler tail nv-enova-2` |
| CLIENT_REAL_ENABLED no cutover | `false` — ampliar depois |
| Rollback primário | `ROLLBACK_FLAG=true` (flags) |
| Rollback extremo | reverter URL webhook Meta para Enova 1 |

---

## Marcadores de governança

**T8.12B: NÃO ENCERRADA — este checklist não fecha T8.12B.** Fecha após cutover confirmado + Fase E executada.

**G8: NÃO FECHADO — este checklist não fecha G8.** Fecha na Fase E, após evidência real documentada.

**CLIENT_REAL_ENABLED=false — atendimento amplo não autorizado nesta fase.** Decisão separada de Vasques na Fase D.
