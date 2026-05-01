# T8 — Runbook Operacional: Cutover Enova 2 em Produção WhatsApp

**Tipo:** PR-OPS / GO-LIVE CONTROLADO  
**Data:** 2026-05-01  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Base:** PR #170 (T8.17) + PR #171 (PROVA T8.17 — 54 PASS | 0 FAIL | 0 SKIP real positivo)

---

## AVISO OBRIGATÓRIO — Leia antes de qualquer ação

```
Cutover = trocar o destino do webhook Meta do número WhatsApp para a Enova 2.

Rollback preferencial = desligar flags na Enova 2:
  ROLLBACK_FLAG=true        → bloqueia LLM e outbound em segundos
  MAINTENANCE_MODE=true     → bloqueia atendimento, mantém inbound técnico
  LLM_REAL_ENABLED=false    → para geração de resposta
  OUTBOUND_CANARY_ENABLED=false → para envio de resposta

Voltar webhook para Enova 1 = emergência extrema.
Não é o caminho preferencial porque a Enova 1 não estava funcionalmente completa.
Use rollback por flags PRIMEIRO, sempre.
```

---

## 1. Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.18 |
| Tipo | PR-OPS / GO-LIVE CONTROLADO |
| Fase | T8 |
| Data | 2026-05-01 |
| Worker PROD | `nv-enova-2` (confirmado em `wrangler.toml` linha 18) |
| Worker TEST | `nv-enova-2-test` (confirmado em `wrangler.toml` `[env.test]`) |
| Endpoint PROD (destino do cutover) | `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook` |
| Endpoint Enova 1 (emergência extrema) | `https://nv-enova.brunovasque.workers.dev/webhook/meta` |
| T8.12B | NÃO ENCERRADA — esta PR não fecha |
| G8 | NÃO FECHADO — esta PR não fecha |

---

## 2. Endpoint PROD confirmado

**Confirmação via `wrangler.toml`:**

```toml
name = "nv-enova-2"          # linha 18 — Worker de produção
main = "src/worker.ts"
compatibility_date = "2026-04-20"

[env.test]
name = "nv-enova-2-test"     # Worker de teste
```

**Endpoint PROD do webhook:**
```
https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook
```

Confirmado em `src/meta/webhook.ts`:
```typescript
export const META_WEBHOOK_ROUTE = '/__meta__/webhook'
```

**Deploy PROD:**
```bash
npx wrangler deploy           # sem --env flag → aponta para nv-enova-2
```

**Deploy TEST:**
```bash
npx wrangler deploy --env test   # → aponta para nv-enova-2-test
```

---

## 3. Estado confirmado antes do cutover

| Item | Status |
|---|---|
| PR #168 (inbound → CRM + memória) | MERGEADA |
| PR #169 (PROVA T8.16 — positiva) | MERGEADA |
| PR #170 (LLM + outbound canary) | MERGEADA |
| PR #171 (PROVA T8.17) | MERGEADA |
| Prova real por Vasques | **54 PASS \| 0 FAIL \| 0 SKIP** |
| Enova 2 respondeu WhatsApp | CONFIRMADO |
| Mensagem chegou só no WA canary | CONFIRMADO |
| Nenhum outro WA recebeu | CONFIRMADO |
| CLIENT_REAL_ENABLED | false — preservado |
| Cutover | NÃO EXECUTADO — aguarda esta PR |

---

## 4. Flags recomendadas para início do cutover PROD

### Fase inicial — canary controlado (recomendado para a virada)

```
ENOVA2_ENABLED=true
CHANNEL_ENABLED=true
META_OUTBOUND_ENABLED=true
LLM_REAL_ENABLED=true
OUTBOUND_CANARY_ENABLED=true        ← começa em modo canary
OUTBOUND_CANARY_WA_ID=<wa_id_vasques>  ← apenas Vasques recebe
CLIENT_REAL_ENABLED=false           ← atendimento amplo: não ainda
ROLLBACK_FLAG=false
MAINTENANCE_MODE=false
```

### Secrets obrigatórios no Worker PROD

```
META_VERIFY_TOKEN=<token>
META_APP_SECRET=<secret>
META_ACCESS_TOKEN=<token>
META_PHONE_NUMBER_ID=<id>
OPENAI_API_KEY=<chave>
CRM_ADMIN_KEY=<chave>
OUTBOUND_CANARY_WA_ID=<wa_id_vasques>
```

Setar via wrangler:
```bash
npx wrangler secret put META_VERIFY_TOKEN
npx wrangler secret put META_APP_SECRET
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put META_PHONE_NUMBER_ID
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put CRM_ADMIN_KEY
npx wrangler secret put OUTBOUND_CANARY_WA_ID
```

Variáveis de ambiente (não-secrets, setar via dashboard ou wrangler.toml vars):
```bash
# via wrangler.toml [vars] ou dashboard Cloudflare
ENOVA2_ENABLED=true
CHANNEL_ENABLED=true
META_OUTBOUND_ENABLED=true
LLM_REAL_ENABLED=true
OUTBOUND_CANARY_ENABLED=true
CLIENT_REAL_ENABLED=false
ROLLBACK_FLAG=false
MAINTENANCE_MODE=false
```

---

## 5. Passo a passo do cutover

### FASE A — Preparação (antes de mexer no painel Meta)

**A1. Confirmar que main está atualizada**
```bash
git fetch origin
git checkout main
git pull origin main
# Verificar: último commit é PR #171 (be9ea9c) ou mais recente
```

**A2. Deploy PROD da Enova 2**
```bash
# No diretório D:\Enova-2
npx wrangler deploy

# Aguardar confirmação:
# "Deployed nv-enova-2 ... (PROD)"
```

**A3. Provisionar secrets no Worker PROD**
```bash
npx wrangler secret put META_VERIFY_TOKEN
npx wrangler secret put META_APP_SECRET
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put META_PHONE_NUMBER_ID
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put CRM_ADMIN_KEY
npx wrangler secret put OUTBOUND_CANARY_WA_ID
```

**A4. Confirmar health do Worker PROD**
```bash
# Verificar GET challenge (sem trocar webhook ainda)
# Abrir wrangler tail para monitoramento
npx wrangler tail nv-enova-2
```

**A5. Confirmar ROLLBACK_FLAG=false no PROD**
```bash
# Verificar via dashboard ou:
curl https://nv-enova-2.brunovasque.workers.dev/__admin__/go-live/health \
  -H "X-CRM-Admin-Key: <chave>"
# Esperar: rollback_flag=false, maintenance_mode=false
```

---

### FASE B — Cutover (janela curta, Vasques presente)

**B1. Trocar webhook no painel Meta Developers**

1. Acessar: Meta Developers → App → WhatsApp → Configuration → Webhook
2. URL de callback atual: `https://nv-enova.brunovasque.workers.dev/webhook/meta`
3. Alterar para: `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`
4. Verify Token: usar o mesmo valor configurado como `META_VERIFY_TOKEN` no PROD
5. Clicar "Verify and Save"
6. Meta fará GET de challenge → Enova 2 deve responder com `hub.challenge`

**B2. Confirmar que challenge foi aceito**

No `wrangler tail`:
```
[telemetria] meta.webhook.challenge.ok
```

**B3. Enviar mensagem de teste (Vasques, WA canary)**

Com `wrangler tail nv-enova-2` aberto:
1. Enviar 1 mensagem real pelo WhatsApp para o número de teste
2. Aguardar logs:
   ```
   meta.webhook.signature.ok
   meta.webhook.inbound.accepted
   meta.pipeline.crm.lead_upserted
   meta.pipeline.crm.turn_created
   meta.pipeline.memory.recorded
   meta.llm.invoked
   meta.outbound.canary.sent
   ```
3. Confirmar: mensagem recebida no WhatsApp pelo número canary (Vasques)

**B4. Verificar ausência de erros**

O que NÃO deve aparecer nos logs:
```
[NÃO] status 4xx ou 5xx no POST webhook
[NÃO] meta.webhook.signature.fail
[NÃO] meta.outbound.client_real (CLIENT_REAL_ENABLED=false)
[NÃO] loop de respostas (Worker respondendo a próprias mensagens)
[NÃO] outbound para WA diferente do canary
[NÃO] reply_text com promessa de aprovação
```

---

### FASE C — Monitoramento (5–15 minutos)

**C1. Monitorar logs continuamente**
```bash
npx wrangler tail nv-enova-2
```

**C2. Conferências obrigatórias**

- [ ] Cada mensagem real gera exatamente 1 resposta
- [ ] CRM registra lead + turno + memória
- [ ] LLM é invocado e gera resposta em PT-BR
- [ ] Resposta não promete aprovação de financiamento
- [ ] Eventos `status` (leitura, entregue) NÃO geram resposta
- [ ] Não há erro de token / acesso Meta
- [ ] Sem duplicidade de mensagens
- [ ] `canary_allowed=true` nos logs (quando modo canary)

**C3. Declarar cutover concluído**

Após 5–15 min de monitoramento sem incidentes, cutover pode ser declarado concluído.

---

## 6. Rollback — procedimento por severidade

### Nível 1 — Rollback por flags (preferencial, segundos)

```bash
# Via dashboard Cloudflare Workers → nv-enova-2 → Settings → Variables:
ROLLBACK_FLAG=true         # bloqueia LLM + outbound imediatamente
```

Ou, para apenas parar respostas sem bloquear inbound:
```bash
MAINTENANCE_MODE=true      # bloqueia atendimento, mantém inbound técnico
LLM_REAL_ENABLED=false     # para LLM
OUTBOUND_CANARY_ENABLED=false  # para outbound
```

**Efeito:** Worker continua recebendo inbound e retornando 200 para Meta, mas sem responder WhatsApp. Inbound fica acumulado e pode ser reprocessado.

### Nível 2 — Rollback parcial (redução de escopo)

Se o problema for específico (ex: LLM gerando texto inadequado):
```bash
LLM_REAL_ENABLED=false     # para LLM, mantém CRM/memória
```

Se o problema for de outbound:
```bash
OUTBOUND_CANARY_ENABLED=false   # para resposta, mantém tudo mais
```

### Nível 3 — Emergência extrema (reverter para Enova 1)

**Usar SOMENTE se os Níveis 1 e 2 falharem completamente.**

> ⚠️ A Enova 1 não estava funcionalmente completa. Voltar para ela é emergência, não solução.

```
1. No painel Meta Developers → Configuration → Webhook
2. Alterar URL de callback para:
   https://nv-enova.brunovasque.workers.dev/webhook/meta
3. Clicar Verify and Save
4. Enova 1 retoma em ~30 segundos
```

**Ação obrigatória após Nível 3:** investigar root cause no PROD e planejar re-cutover.

---

## 7. Ampliação do atendimento (pós-cutover estável)

Após confirmar cutover estável em modo canary:

```
Decisão de Vasques — quando pronto:
CLIENT_REAL_ENABLED=true   → ampliar atendimento para todos os números
```

**Não ativar CLIENT_REAL_ENABLED=true sem:**
- Pelo menos 10–30 min de monitoramento estável em modo canary
- Vasques presente e acompanhando
- Log limpo sem erros ou respostas inadequadas

---

## 8. Próximos passos após cutover bem-sucedido

1. Documentar evidência de atendimento real (log + screenshot)
2. Re-executar `npm run prove:g8-readiness` — resultado esperado: 7/7 PASS + G8 APROVADO
3. Atualizar `src/golive/harness.ts` — remover `meta_ready = false` hardcoded
4. Declarar T8.12B encerrada
5. Declarar G8 aprovado operacionalmente
6. Enova 2 oficialmente em produção

---

## 9. Restrições invioláveis

| Restrição | Status |
|---|---|
| Zero fechamento de G8 nesta PR | ✅ esta PR é PR-OPS, não fecha G8 |
| Zero fechamento de T8.12B nesta PR | ✅ T8.12B fecha após cutover confirmado |
| Zero ativação de CLIENT_REAL_ENABLED sem Vasques | ✅ decisão pós-cutover |
| Zero alteração de runtime/MCMV/funil | ✅ fora de escopo |
| Zero migrations | ✅ fora de escopo |
| Zero removal de flags de segurança | ✅ todas as flags preservadas |
| Rollback por flags documentado como via primária | ✅ Nível 1 sempre primeiro |
| Retorno à Enova 1 como emergência extrema | ✅ Nível 3 — explicitamente não preferencial |

---

## 10. Marcadores de governança

**T8.12B: NÃO ENCERRADA — esta PR não fecha T8.12B.** O fechamento ocorre após cutover confirmado + evidência de atendimento real bem-sucedido + G8 closeout.

**G8: NÃO FECHADO — esta PR não fecha G8.** G8 fecha na Etapa 7 do roadmap, após cutover PROD funcional documentado.

**Rollback preferencial = flags, não webhook.** Retorno à Enova 1 é contingência de última instância.
