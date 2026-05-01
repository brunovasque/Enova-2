# T8 — Runbook Operacional: Cutover Enova 2 em Produção WhatsApp

**Tipo:** PR-OPS / GO-LIVE CONTROLADO  
**Data:** 2026-05-01  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Base:** PR #170 (T8.17) + PR #171 (PROVA T8.17 — 54 PASS | 0 FAIL | 0 SKIP real positivo)

---

## CONCEITO OBRIGATÓRIO — Leia antes de qualquer ação

```
CUTOVER = trocar o destino do webhook Meta do número WhatsApp para a Enova 2.

ROLLBACK PREFERENCIAL = desligar flags na Enova 2:
  ROLLBACK_FLAG=true           → bloqueia LLM + outbound em segundos
  MAINTENANCE_MODE=true        → bloqueia atendimento, mantém inbound técnico
  LLM_REAL_ENABLED=false       → para geração de resposta
  OUTBOUND_CANARY_ENABLED=false → para envio de resposta

RETORNO À ENOVA 1 = emergência extrema, não caminho preferencial.
A Enova 1 não estava funcionalmente completa.
Use rollback por flags PRIMEIRO. Sempre.
```

---

## 1. Endpoint PROD confirmado via wrangler.toml

```toml
# wrangler.toml — linha 18
name = "nv-enova-2"
main = "src/worker.ts"
compatibility_date = "2026-04-20"

[env.test]
name = "nv-enova-2-test"
```

| Ambiente | Endpoint |
|---|---|
| **Enova 2 PROD (destino do cutover)** | `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook` |
| Enova 2 TEST | `https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook` |
| Enova 1 (emergência extrema) | `https://nv-enova.brunovasque.workers.dev/webhook/meta` |

**Deploy PROD:**
```bash
npx wrangler deploy          # sem --env — aponta para nv-enova-2
```

**Deploy TEST:**
```bash
npx wrangler deploy --env test   # aponta para nv-enova-2-test
```

**Tail PROD:**
```bash
npx wrangler tail nv-enova-2
```

A rota do webhook está definida em `src/meta/webhook.ts`:
```typescript
export const META_WEBHOOK_ROUTE = '/__meta__/webhook'
```

---

## 2. Estado confirmado antes do cutover

| Item | Status |
|---|---|
| PR #168 (inbound → CRM + memória) | MERGEADA |
| PR #169 (PROVA T8.16 — positiva) | MERGEADA |
| PR #170 (LLM + outbound canary) | MERGEADA |
| PR #171 (PROVA T8.17) | MERGEADA |
| Prova real por Vasques | **54 PASS \| 0 FAIL \| 0 SKIP** |
| Enova 2 respondeu WhatsApp | CONFIRMADO (Worker TEST) |
| Mensagem chegou só no WA canary | CONFIRMADO |
| Nenhum outro WA recebeu | CONFIRMADO |
| CLIENT_REAL_ENABLED | false — preservado |
| Cutover PROD | NÃO EXECUTADO — aguarda esta operação |

---

## 3. Flags recomendadas para início do cutover PROD

### Fase inicial — canary controlado

```
ENOVA2_ENABLED=true
CHANNEL_ENABLED=true
META_OUTBOUND_ENABLED=true
LLM_REAL_ENABLED=true
OUTBOUND_CANARY_ENABLED=true          ← começa em modo canary
OUTBOUND_CANARY_WA_ID=<wa_id_vasques> ← apenas Vasques recebe resposta
CLIENT_REAL_ENABLED=false             ← atendimento amplo: não ainda
ROLLBACK_FLAG=false
MAINTENANCE_MODE=false
```

### Secrets obrigatórios no Worker PROD

Provisionar via `wrangler secret put` (nunca em plain text ou log):

```bash
npx wrangler secret put META_VERIFY_TOKEN
npx wrangler secret put META_APP_SECRET
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put META_PHONE_NUMBER_ID
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put CRM_ADMIN_KEY
npx wrangler secret put OUTBOUND_CANARY_WA_ID
```

---

## 4. Passo a passo do cutover

### FASE A — Preparação (antes de mexer no painel Meta)

**A1. Confirmar main atualizada**
```bash
git fetch origin
git checkout main
git pull origin main
# Último commit relevante: PR #171 (be9ea9c) ou mais recente
```

**A2. Deploy PROD da Enova 2**
```bash
npx wrangler deploy
# Aguardar: "Deployed nv-enova-2 ... (PROD)"
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

**A4. Confirmar variáveis de ambiente no PROD**

Via dashboard Cloudflare Workers → `nv-enova-2` → Settings → Variables:
```
ENOVA2_ENABLED=true
CHANNEL_ENABLED=true
META_OUTBOUND_ENABLED=true
LLM_REAL_ENABLED=true
OUTBOUND_CANARY_ENABLED=true
CLIENT_REAL_ENABLED=false
ROLLBACK_FLAG=false
MAINTENANCE_MODE=false
```

**A5. Abrir monitoramento e verificar health**
```bash
# Terminal separado — manter aberto durante toda a operação
npx wrangler tail nv-enova-2

# Verificar readiness
curl https://nv-enova-2.brunovasque.workers.dev/__admin__/go-live/health \
  -H "X-CRM-Admin-Key: <chave>"
# Esperado: rollback_flag=false, maintenance_mode=false
```

---

### FASE B — Cutover (janela curta, Vasques presente e com WhatsApp aberto)

**B1. Trocar webhook no painel Meta Developers**

1. Acessar: Meta Developers → seu App → WhatsApp → Configuration → Webhook
2. **URL de callback atual** (registrar antes de trocar): `https://nv-enova.brunovasque.workers.dev/webhook/meta`
3. **Nova URL**: `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`
4. **Verify Token**: mesmo valor configurado como secret `META_VERIFY_TOKEN` no PROD
5. Clicar "Verify and Save"
6. Meta fará GET de challenge → Enova 2 responderá com `hub.challenge`
7. Não trocar o número de telefone. Não mexer em outras configurações do app.

**B2. Confirmar challenge aceito**

No `wrangler tail nv-enova-2`:
```
[telemetria] meta.webhook.challenge.ok
```

Se aparecer `meta.webhook.challenge.fail`: verificar `META_VERIFY_TOKEN` no PROD.

**B3. Primeira mensagem de validação — Vasques envia**

Vasques envia 1 mensagem real pelo WhatsApp para o número de teste.

Confirmar nos logs do tail:
```
meta.webhook.signature.ok        → assinatura aceita
meta.webhook.inbound.accepted    → mensagem processada
meta.pipeline.crm.lead_upserted  → lead criado/atualizado
meta.pipeline.crm.turn_created   → turno registrado
meta.pipeline.memory.recorded    → memória registrada
meta.llm.invoked                 → LLM chamado
meta.outbound.canary.sent        → outbound enviado para canary
```

Confirmar no WhatsApp de Vasques: mensagem recebida.

**B4. Verificar ausência de erros críticos**

NÃO deve aparecer nos logs:
```
[NÃO] status 4xx ou 5xx no POST webhook
[NÃO] meta.webhook.signature.fail
[NÃO] outbound para WA diferente do canary
[NÃO] meta.outbound.client_real (CLIENT_REAL_ENABLED=false)
[NÃO] loop de resposta (Enova respondendo a próprias mensagens de status)
```

---

### FASE C — Monitoramento (5–15 minutos)

Manter `wrangler tail nv-enova-2` aberto.

**C1. Conferências obrigatórias durante monitoramento**

- [ ] Cada mensagem real gera exatamente 1 resposta (sem duplicatas)
- [ ] CRM registra lead + turno + memória corretamente
- [ ] LLM invocado e resposta gerada em português
- [ ] Resposta não contém promessa de aprovação de financiamento
- [ ] Eventos de status (leitura, entregue) NÃO geram resposta
- [ ] Sem erro de token / acesso Meta
- [ ] `canary_allowed=true` para o WA canary nos logs
- [ ] Sem degradação anormal de latência

**C2. Declarar cutover concluído**

Após 5–15 min de monitoramento limpo:
- Vasques declara cutover bem-sucedido
- Registrar timestamp: `___________`

---

## 5. Rollback — procedimento por nível de severidade

### Nível 1 — Preferencial (flags, em segundos) ← USAR PRIMEIRO

```bash
# Via dashboard Cloudflare → nv-enova-2 → Settings → Variables:
ROLLBACK_FLAG=true    # bloqueia LLM + outbound imediatamente

# OU rollback mais granular:
MAINTENANCE_MODE=true          # para atendimento, mantém inbound técnico
LLM_REAL_ENABLED=false         # para geração de resposta
OUTBOUND_CANARY_ENABLED=false  # para envio de resposta
```

**Efeito:** Worker retorna 200 para Meta (sem loop de timeout), mas não responde WhatsApp.

### Nível 2 — Rollback parcial por componente

Desativar apenas a flag do componente problemático. Por exemplo:
- Texto inadequado do LLM → `LLM_REAL_ENABLED=false`
- Problema de outbound → `OUTBOUND_CANARY_ENABLED=false`
- Manter CRM/memória funcionando

### Nível 3 — Emergência extrema (retorno à Enova 1)

**Usar SOMENTE se Níveis 1 e 2 falharem completamente.**

> ⚠️ A Enova 1 não estava funcionalmente completa. Este é um rollback de contingência, não de solução.

```
1. Acessar Meta Developers → App → WhatsApp → Configuration → Webhook
2. Alterar URL para: https://nv-enova.brunovasque.workers.dev/webhook/meta
3. Verify Token: token original da Enova 1
4. Clicar Verify and Save
5. Enova 1 retoma em ~30 segundos
6. AÇÃO OBRIGATÓRIA: investigar root cause antes de qualquer re-cutover
```

---

## 6. Ampliação do atendimento (pós-cutover estável)

Não executar durante o cutover. Decisão separada de Vasques.

**Quando ampliar:**
- Pelo menos 10–30 min de operação estável em modo canary
- Vasques presente e confirmando
- Logs limpos, respostas adequadas

**Como ampliar:**
```bash
# Via dashboard → nv-enova-2 → Settings → Variables:
CLIENT_REAL_ENABLED=true    # ampliar atendimento a todos os números
```

---

## 7. Após cutover confirmado — closeout (Etapa 7 do roadmap)

Para execução em sessão posterior:

1. Documentar evidência: log + screenshot da mensagem respondida em PROD
2. Re-executar `npm run prove:g8-readiness` — esperado: 7/7 PASS + G8 APROVADO
3. Atualizar `src/golive/harness.ts` — remover `meta_ready = false` hardcoded
4. Declarar T8.12B encerrada
5. Declarar G8 aprovado operacionalmente
6. Criar PR-T8.R.2 — Readiness/Closeout G8

---

## 8. Restrições invioláveis

| Restrição | Status |
|---|---|
| T8.12B não encerrada nesta PR | ✅ esta é PR-OPS, não fecha T8.12B |
| G8 não fechado nesta PR | ✅ G8 fecha na Etapa 7 |
| CLIENT_REAL_ENABLED=false no cutover inicial | ✅ ampliar somente na Fase D |
| Zero alteração de runtime/MCMV/funil | ✅ fora de escopo |
| Zero migrations | ✅ fora de escopo |
| Rollback por flags como via primária | ✅ Nível 1 sempre primeiro |
| Retorno à Enova 1 como emergência extrema | ✅ Nível 3 explicitamente não preferencial |
| Secrets nunca em log/response | ✅ regra do LLM client e outbound preservada |

---

## 9. Marcadores de governança

**T8.12B: NÃO ENCERRADA — esta PR não fecha T8.12B.** Fecha após cutover confirmado + Fase E executada + evidência documentada.

**G8: NÃO FECHADO — esta PR não fecha G8.** Fecha na Etapa 7 do roadmap (`prove:g8-readiness` 7/7 PASS).

**Rollback preferencial = flags, não webhook.** Retorno à Enova 1 é contingência de última instância, não rollback padrão.

**CLIENT_REAL_ENABLED=false para cutover inicial.** Ampliação é decisão separada de Vasques na Fase D.
