# INFRA-META-01 — Preparação do ambiente TEST Cloudflare para PR-T8.12B

**Tipo:** INFRA / GOVERNANÇA  
**Data:** 2026-04-30  
**Branch:** `feat/infra-meta-01-ambiente-test-cloudflare`  
**Executado em:** Claude Code  
**Dependência:** PR-T8.12B — Prova real Meta/WhatsApp (desbloqueada após estas instruções)

---

## §1 — Objetivo

Documentar com precisão o caminho seguro e completo para Vasques ativar o ambiente TEST Cloudflare (Worker `nv-enova-2-test`) e executar a prova real Meta/WhatsApp controlada que desbloqueia PR-T8.12B e, consequentemente, o fechamento do G8.

**Esta PR não altera `src/`, não altera `wrangler.toml`, não registra webhook, não expõe nenhum secret.**  
É inteiramente documental e preparatória.

---

## §2 — Estado herdado (ESTADO HERDADO)

| Item | Estado |
|---|---|
| `smoke:meta:webhook` | 20/20 PASS |
| `smoke:golive` | 18/18 PASS |
| `prove:meta-controlada` (sem META_REAL_ENABLED) | 25/0/6 EXIT 0 |
| `smoke:all` | EXIT 0 |
| Worker prod `nv-enova-2` | declarado em `wrangler.toml` |
| Worker test `nv-enova-2-test` | declarado em `wrangler.toml` `[env.test]` |
| Frente Meta/WhatsApp | BLOQUEADA_AGUARDANDO_VASQUES |
| G8 | NÃO FECHADO |

---

## §3 — O que existe no repo

### Worker test

```toml
# wrangler.toml
name = "nv-enova-2"
main = "src/worker.ts"
compatibility_date = "2026-04-20"

[env.test]
name = "nv-enova-2-test"
```

### Secrets necessários (MetaWorkerEnv)

Definidos em `src/meta/webhook-env.ts`:

| Env var | Obrigatório | Onde obter |
|---|---|---|
| `META_VERIFY_TOKEN` | **SIM** | Token arbitrário que você define e registra no painel Meta |
| `META_APP_SECRET` | **SIM** | Painel Meta → App → Configurações → Segredo do aplicativo |
| `META_ACCESS_TOKEN` | **SIM** | Painel Meta → WhatsApp → API → Token de acesso permanente |
| `META_PHONE_NUMBER_ID` | **SIM** | Painel Meta → WhatsApp → API → ID do número de telefone |
| `META_GRAPH_VERSION` | NÃO | Default: `v20.0` (não precisa provisionar) |

### Script de prova (dual-mode)

`src/meta/proof-controlled.ts` — ativado com:
```bash
META_REAL_ENABLED=true npm run prove:meta-controlada
```

Resultado esperado após ativação completa: `≥27 PASS | 0 FAIL | ≤4 SKIP`

---

## §4 — Passo a passo obrigatório (exclusivo de Vasques)

### Fase 1 — Provisionar secrets no Worker test

Execute em sequência no terminal, dentro do repositório `Enova-2`:

```bash
# Secret 1: Verify Token (você define este valor)
wrangler secret put META_VERIFY_TOKEN --env test

# Secret 2: App Secret do painel Meta
wrangler secret put META_APP_SECRET --env test

# Secret 3: Access Token permanente do painel Meta
wrangler secret put META_ACCESS_TOKEN --env test

# Secret 4: Phone Number ID do painel Meta
wrangler secret put META_PHONE_NUMBER_ID --env test
```

> Cada comando abre prompt interativo — cole o valor e pressione Enter.  
> Os secrets ficam armazenados no Cloudflare, **nunca no repo**.

### Fase 2 — Publicar o Worker test

```bash
wrangler deploy --env test
```

Resultado esperado:
```
✓ Deploying to Cloudflare Workers...
✓ Deployed to nv-enova-2-test.<sua-conta>.workers.dev
```

### Fase 3 — Obter a URL do webhook

A URL de webhook do Worker test tem o formato:

```
https://nv-enova-2-test.<sua-conta>.workers.dev/__meta__/webhook
```

Substitua `<sua-conta>` pelo subdomain da sua conta Cloudflare Workers.

Para confirmar a URL: abra o dashboard Cloudflare → Workers → `nv-enova-2-test` → URL do Worker.

### Fase 4 — Registrar o webhook no painel Meta Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Selecione seu App Meta
3. Navegue para **WhatsApp → Configuração**
4. Em **Webhooks**, clique em **Editar**
5. Preencha:
   - **URL de retorno de chamada**: `https://nv-enova-2-test.<sua-conta>.workers.dev/__meta__/webhook`
   - **Token de verificação**: o mesmo valor que você usou em `META_VERIFY_TOKEN`
6. Clique em **Verificar e salvar**

O painel Meta enviará um GET de challenge para o Worker. O Worker responderá com o `hub.challenge`. Se a configuração estiver correta, o painel exibirá "Verificado".

### Fase 5 — Confirmar challenge real (evidência P2)

Após o registro do webhook, o painel Meta deverá exibir status "Verificado". Capture:
- Screenshot do painel Meta com status de verificação
- Logs do Cloudflare Workers em `nv-enova-2-test` mostrando o GET de challenge

Para ver logs em tempo real:
```bash
wrangler tail nv-enova-2-test
```

### Fase 6 — Executar prova real controlada (P1–P7)

No terminal, com os secrets já na env local (ou via arquivo `.env` não commitado):

```bash
META_REAL_ENABLED=true \
META_VERIFY_TOKEN=<seu-token> \
META_APP_SECRET=<seu-secret> \
META_ACCESS_TOKEN=<seu-access-token> \
META_PHONE_NUMBER_ID=<seu-phone-id> \
npm run prove:meta-controlada
```

**Resultado esperado:**

```
========================================
PR-T8.12 Prova Meta/WhatsApp controlada
PASS: 27 | FAIL: 0 | SKIP: 4
STATUS: PARCIAL_COM_PROVA_LOCAL_REAL
```

> P2 (challenge local) e P3 (outbound bloqueado confirmado) devem PASS.  
> P4–P7 permanecem SKIP no script — evidência externa necessária (logs Cloudflare, painel Meta, mensagem real recebida).

### Fase 7 — Documentar evidência de inbound real (evidência P5)

Para provar inbound real, envie uma mensagem de WhatsApp para o número de teste configurado no painel Meta. Capture:
- Log do Cloudflare Workers (`wrangler tail nv-enova-2-test`) mostrando POST processado
- Evento `meta.webhook.inbound.accepted` no log de telemetria
- Screenshot da mensagem enviada vs. log recebido

### Fase 8 — Autorizar go-live (após evidências coletadas)

Após evidências de P2–P7 coletadas e documentadas, autorize:

```
CLIENT_REAL_ENABLED=true
LLM_REAL_ENABLED=true
CHANNEL_ENABLED=true
META_OUTBOUND_ENABLED=true
ENOVA2_ENABLED=true
```

> Estas flags **não** estão no `wrangler.toml`. São configuradas como secrets/vars Cloudflare ou env local conforme processo de go-live.

### Fase 9 — Re-executar prove:g8-readiness

```bash
npm run prove:g8-readiness
```

Resultado esperado após liberação: `7/7 PASS` com G8 APROVADO (não NO-GO CONTROLADO).

---

## §5 — Verificações de segurança obrigatórias

Antes de cada passo, confirme:

| Verificação | Comando |
|---|---|
| Nenhum valor real de secret no repo | ver comando abaixo |
| Worker test declarado | `grep -A2 '\[env.test\]' wrangler.toml` |
| Script dual-mode seguro | `npm run prove:meta-controlada` (sem META_REAL_ENABLED — deve PASS 25/0/6) |
| Rollback ativo se necessário | `ROLLBACK_FLAG=true npm run smoke:golive` |

**Verificação de secrets reais no repo:**

```bash
git grep -nE "(EAA|EAAG|ghp_|ghs_|sk-|sb-|Bearer )[A-Za-z0-9_./+=:-]{20,}" -- . ':!node_modules' ':!dist' ':!.wrangler'
```

> **Importante:** nomes de variáveis como `META_APP_SECRET`, `META_ACCESS_TOKEN`, etc., **podem e devem** existir no código-fonte — eles são referências legítimas às variáveis de ambiente. O que **não pode** existir no repo é o *valor real* de um secret ou token (ex.: uma string iniciando com `EAAGm...`, `ghp_...`, `sk-...`). O comando acima detecta padrões de valores reais de tokens/secrets; se retornar zero linhas, o repo está limpo.

---

## §6 — Estrutura do webhook no Worker

O Worker `nv-enova-2-test` expõe:

```
GET  /__meta__/webhook?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<challenge>
   → 200 text/plain: <challenge>       (quando META_VERIFY_TOKEN coincide)
   → 403                               (quando token difere)

POST /__meta__/webhook
   Header: X-Hub-Signature-256: sha256=<hmac-do-body>
   Body:   payload JSON do Meta
   → 200 { ok: true }                 (assinatura válida)
   → 401                              (sem assinatura)
   → 403                              (assinatura inválida)
```

---

## §7 — Bloqueios de segurança no outbound

O outbound WhatsApp está **bloqueado por default** em `src/meta/outbound.ts`. Para desbloquear, são necessárias simultaneamente:

1. `CHANNEL_ENABLED=true`
2. `META_OUTBOUND_ENABLED=true`
3. `META_ACCESS_TOKEN` não vazio
4. `phone_number_id` não vazio
5. `wa_id` não vazio
6. `reply_text` não vazio

Nenhuma mensagem real é enviada automaticamente pelo inbound nesta implementação.

---

## §8 — Versão da Graph API

O Worker usa `META_GRAPH_VERSION` com fallback para `v20.0` (definido em `src/meta/outbound.ts`). Não é necessário provisionar este secret.

---

## §9 — Checklist de evidências para PR-T8.12B

Para fechar PR-T8.12B, Vasques precisa documentar:

- [ ] `wrangler secret put META_VERIFY_TOKEN --env test` — executado
- [ ] `wrangler secret put META_APP_SECRET --env test` — executado
- [ ] `wrangler secret put META_ACCESS_TOKEN --env test` — executado
- [ ] `wrangler secret put META_PHONE_NUMBER_ID --env test` — executado
- [ ] `wrangler deploy --env test` — URL do Worker test confirmada
- [ ] Webhook registrado no painel Meta — status "Verificado" (screenshot)
- [ ] Challenge real: log Cloudflare do GET de challenge (screenshot/log)
- [ ] `prove:meta-controlada` com `META_REAL_ENABLED=true` — resultado `≥27/0/≤4`
- [ ] Inbound real: log Cloudflare de POST processado (evento `inbound.accepted`)
- [ ] Evidência externa coletada e documentada em `schema/proofs/T8_META_WHATSAPP_PROVA_REAL_EXECUTADA.md`

---

## §10 — Regressão executada nesta PR

| Suite | Resultado |
|---|---|
| `smoke:meta:webhook` | 20/20 PASS |
| `smoke:golive` | 18/18 PASS |
| `prove:meta-controlada` (sem META_REAL_ENABLED) | 25/0/6 EXIT 0 |
| `smoke:all` | EXIT 0 |

---

## §11 — Estado entregue (ESTADO ENTREGUE)

| Item | Estado |
|---|---|
| Documento de instruções | `schema/implementation/INFRA_META_01_AMBIENTE_TEST_CLOUDFLARE.md` — CRIADO |
| Checklist para Vasques | 10 itens — documentado em §9 |
| Passo a passo de 9 fases | documentado em §4 |
| `src/` alterado | NÃO |
| `wrangler.toml` alterado | NÃO |
| Secret exposto | NÃO |
| Webhook real registrado | NÃO — exclusivo de Vasques |
| G8 fechado | NÃO — aguarda PR-T8.12B |
| Frente Meta/WhatsApp | BLOQUEADA_AGUARDANDO_VASQUES (inalterada) |

---

## §12 — Bloco E (fora de contrato)

Esta PR é classificada como **`governança`** — infraestrutura de suporte ao desbloqueio contratual de PR-T8.12B.

Não está prevista explicitamente no contrato T8, mas é necessária para habilitar Vasques a executar a única ação que desbloqueia G8.

**Esta PR NÃO fecha T8.12B. NÃO fecha G8. NÃO altera o estado contratual.**  
Serve exclusivamente como guia operacional seguro para a execução humana por Vasques.

---

## §13 — Próxima ação obrigatória

**Vasques executa as 9 fases documentadas em §4.**

Após execução completa e evidências coletadas:
1. Atualizar `schema/proofs/T8_META_WHATSAPP_PROVA_REAL_EXECUTADA.md` com evidências reais
2. Re-executar `npm run prove:g8-readiness` — resultado esperado: 7/7 PASS + G8 APROVADO
3. Autorizar `CLIENT_REAL_ENABLED=true` + `LLM_REAL_ENABLED=true` + `META_OUTBOUND_ENABLED=true` + go-live
