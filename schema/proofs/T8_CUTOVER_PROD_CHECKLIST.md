# T8 — Checklist operacional: Cutover Enova 2 PROD WhatsApp

**Tipo:** PR-OPS / GO-LIVE CONTROLADO  
**Data:** 2026-05-01  
**Worker PROD:** `nv-enova-2` (confirmado em `wrangler.toml`)  
**Endpoint PROD:** `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`  
**Runbook completo:** `schema/operations/T8_CUTOVER_ENOVA2_PROD.md`

---

## ⚠️ Leia antes de começar

```
CUTOVER = trocar o destino do webhook Meta do número WhatsApp para a Enova 2 PROD.

ROLLBACK PREFERENCIAL = flags (não webhook):
  ROLLBACK_FLAG=true           → bloqueia LLM + outbound em segundos
  MAINTENANCE_MODE=true        → bloqueia atendimento, mantém inbound
  LLM_REAL_ENABLED=false       → para geração
  OUTBOUND_CANARY_ENABLED=false → para envio

RETORNO À ENOVA 1 = emergência extrema, não caminho preferencial.
A Enova 1 não estava funcionalmente completa.
```

---

## FASE A — Pré-cutover

> Executar antes de mexer no painel Meta. Vasques deve ter WhatsApp aberto.

### A1. Confirmar código atualizado

- [ ] `git fetch origin && git checkout main && git pull origin main` executado
- [ ] Último commit: PR #171 (`be9ea9c`) ou mais recente

### A2. Deploy PROD da Enova 2

- [ ] Comando executado: `npx wrangler deploy` (sem `--env`)
- [ ] Saída confirma: `Deployed nv-enova-2`
- [ ] Worker ativo no dashboard Cloudflare

### A3. Secrets provisionados no Worker PROD (`nv-enova-2`)

- [ ] `META_VERIFY_TOKEN` → `npx wrangler secret put META_VERIFY_TOKEN`
- [ ] `META_APP_SECRET` → `npx wrangler secret put META_APP_SECRET`
- [ ] `META_ACCESS_TOKEN` → `npx wrangler secret put META_ACCESS_TOKEN`
- [ ] `META_PHONE_NUMBER_ID` → `npx wrangler secret put META_PHONE_NUMBER_ID`
- [ ] `OPENAI_API_KEY` → `npx wrangler secret put OPENAI_API_KEY`
- [ ] `CRM_ADMIN_KEY` → `npx wrangler secret put CRM_ADMIN_KEY`
- [ ] `OUTBOUND_CANARY_WA_ID` → `npx wrangler secret put OUTBOUND_CANARY_WA_ID`

### A4. Variáveis de ambiente no Worker PROD

> Dashboard Cloudflare → `nv-enova-2` → Settings → Variables

- [ ] `ENOVA2_ENABLED=true`
- [ ] `CHANNEL_ENABLED=true`
- [ ] `META_OUTBOUND_ENABLED=true`
- [ ] `LLM_REAL_ENABLED=true`
- [ ] `OUTBOUND_CANARY_ENABLED=true`
- [ ] `CLIENT_REAL_ENABLED=false` ← **não ampliar ainda**
- [ ] `ROLLBACK_FLAG=false` ← confirmar explicitamente
- [ ] `MAINTENANCE_MODE=false` ← confirmar explicitamente

### A5. Monitoramento e health

- [ ] `npx wrangler tail nv-enova-2` aberto em terminal separado
- [ ] GET `/__admin__/go-live/health` retorna 200 com `rollback_flag=false`
- [ ] Sem erros nos logs do tail em idle

---

## FASE B — Cutover (Vasques presente, WhatsApp aberto)

### B1. Trocar webhook no painel Meta Developers

- [ ] Acessar: Meta Developers → App → WhatsApp → Configuration → Webhook
- [ ] **URL atual registrada antes de trocar:** `https://nv-enova.brunovasque.workers.dev/webhook/meta`
- [ ] **Nova URL inserida:** `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`
- [ ] Verify Token: valor exato do secret `META_VERIFY_TOKEN` do PROD
- [ ] Clicado "Verify and Save"
- [ ] Número de telefone NÃO alterado
- [ ] Nenhuma outra configuração do app alterada

### B2. Challenge aceito

- [ ] Log no `wrangler tail`: `meta.webhook.challenge.ok`
- [ ] Meta exibe: verificação bem-sucedida

### B3. Primeira mensagem de validação (Vasques)

- [ ] Vasques enviou 1 mensagem real pelo WhatsApp
- [ ] Log: `meta.webhook.signature.ok`
- [ ] Log: `meta.webhook.inbound.accepted`
- [ ] Log: `meta.pipeline.crm.lead_upserted`
- [ ] Log: `meta.pipeline.crm.turn_created`
- [ ] Log: `meta.pipeline.memory.recorded`
- [ ] Log: `meta.llm.invoked`
- [ ] Log: `meta.outbound.canary.sent`

### B4. Confirmação no WhatsApp (Vasques)

- [ ] Vasques recebeu mensagem de resposta
- [ ] Texto em português, humano, sem promessa de aprovação de financiamento
- [ ] Texto não tem erro óbvio de linguagem ou conteúdo inadequado
- [ ] Nenhum outro número recebeu mensagem

### B5. Verificar ausência de erros

- [ ] Sem status 4xx ou 5xx nos logs
- [ ] Sem `meta.webhook.signature.fail`
- [ ] Sem outbound para WA diferente do canary
- [ ] Sem loop de resposta (Enova não responde a eventos de status)
- [ ] Sem erro de token ou acesso à API Meta

---

## FASE C — Monitoramento (5–15 min)

- [ ] `wrangler tail nv-enova-2` mantido aberto
- [ ] 2–3 mensagens enviadas e respondidas com sucesso
- [ ] Cada mensagem → exatamente 1 resposta (sem duplicatas)
- [ ] CRM, LLM e outbound operando sem erro
- [ ] Texto das respostas adequado (tom MCMV, sem promessas)
- [ ] Latência dentro do esperado

### C1. Declaração de cutover concluído

- [ ] Todos os checks B e C concluídos
- [ ] Vasques declara cutover bem-sucedido
- [ ] Timestamp do cutover: `___________`
- [ ] Screenshot de evidência salvo

---

## ROLLBACK — Se qualquer check B ou C falhar

### Nível 1 — Preferencial (flags, segundos)

```bash
# Dashboard → nv-enova-2 → Settings → Variables:
ROLLBACK_FLAG=true        # para tudo imediatamente
```

- [ ] `ROLLBACK_FLAG=true` setado
- [ ] Logs confirmam LLM e outbound bloqueados
- [ ] Root cause identificado antes de nova tentativa

Alternativas granulares:
- [ ] `MAINTENANCE_MODE=true` — para atendimento, mantém inbound
- [ ] `LLM_REAL_ENABLED=false` — para geração
- [ ] `OUTBOUND_CANARY_ENABLED=false` — para envio

### Nível 2 — Rollback parcial

- [ ] Componente problemático identificado
- [ ] Flag do componente desativada
- [ ] Restante do sistema mantido

### Nível 3 — Emergência extrema (retorno à Enova 1)

> **Usar SOMENTE se Níveis 1 e 2 falharem completamente.**  
> A Enova 1 não estava funcionalmente completa. Isso é contingência, não solução.

- [ ] Meta Developers → Webhook → URL alterada para: `https://nv-enova.brunovasque.workers.dev/webhook/meta`
- [ ] Verify Token: token original da Enova 1
- [ ] Verify and Save
- [ ] Aguardar ~30 segundos
- [ ] Enova 1 retomando mensagens confirmado
- [ ] Incidente registrado para análise de root cause

---

## FASE D — Ampliação (decisão separada de Vasques)

> **Não executar durante a virada. Somente após estabilidade confirmada.**

- [ ] Pelo menos 10–30 min estável em modo canary
- [ ] Vasques presente e decidindo ampliar
- [ ] `CLIENT_REAL_ENABLED=true` — atendimento para todos os números

---

## FASE E — Closeout (sessão posterior)

> **Executar somente após cutover PROD confirmado e estável.**

- [ ] Evidência documentada: log + screenshot da mensagem em PROD
- [ ] `npm run prove:g8-readiness` — resultado: 7/7 PASS + G8 APROVADO
- [ ] `src/golive/harness.ts` — `meta_ready = false` removido
- [ ] T8.12B declarada encerrada
- [ ] G8 declarado aprovado operacionalmente
- [ ] PR-T8.R.2 — Readiness/Closeout G8 criada

---

## Referência rápida

| Item | Valor |
|---|---|
| Worker PROD | `nv-enova-2` |
| Endpoint PROD webhook | `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook` |
| Endpoint TEST webhook | `https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook` |
| Enova 1 (Nível 3 emergência) | `https://nv-enova.brunovasque.workers.dev/webhook/meta` |
| Deploy PROD | `npx wrangler deploy` (sem --env) |
| Tail PROD | `npx wrangler tail nv-enova-2` |
| CLIENT_REAL_ENABLED no cutover | `false` — ampliar na Fase D |
| Rollback primário | `ROLLBACK_FLAG=true` (flags) |
| Rollback de emergência | reverter URL webhook → Enova 1 (Nível 3) |

---

## Governança

**T8.12B: NÃO ENCERRADA — este checklist não fecha T8.12B.** Fecha após Fase E completa.

**G8: NÃO FECHADO — este checklist não fecha G8.** Fecha na Fase E + `prove:g8-readiness`.

**CLIENT_REAL_ENABLED=false.** Atendimento amplo não autorizado no cutover inicial.
