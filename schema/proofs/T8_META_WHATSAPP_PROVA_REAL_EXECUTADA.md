# PR-T8.12B — Execução Real Meta/WhatsApp Controlada

**Tipo:** PR-PROVA  
**Frente:** Meta/WhatsApp Canal  
**Data de execução:** 2026-04-30  
**Executor:** Claude Code (claude-sonnet-4-6)  
**Branch:** feat/t8-pr-t8-12b-execucao-real-meta-whatsapp  

---

## §1 — Meta

Esta PR-T8.12B é a execução real da prova pendente da PR-T8.12. O harness `prove:meta-controlada` foi instalado na PR-T8.12; esta PR deve executar P2–P7 com secrets reais, Worker publicado e webhook Meta registrado.

---

## §2 — Ambiente de execução

| Item | Status | Detalhe |
|---|---|---|
| Ambiente de execução | Claude Code (worktree) | Windows 10 / Node.js v24.14.1 |
| Worker prod configurado | ✅ | `nv-enova-2` (wrangler.toml) |
| Worker test configurado | ✅ | `nv-enova-2-test` ([env.test] em wrangler.toml) |
| Worker test publicado | ❌ BLOQUEIO | Não confirmado — requer `wrangler deploy --env test` por Vasques |
| Webhook Meta registrado | ❌ BLOQUEIO | Não confirmado — requer registro no painel Meta Developers por Vasques |
| Deploy automático (main) | ✅ | `.github/workflows/deploy.yml` — deploy prod automático em merge na main |

---

## §3 — Secrets presentes/ausentes (sem valores)

Verificado em 2026-04-30 no ambiente Claude Code:

| Secret | Status |
|---|---|
| `META_VERIFY_TOKEN` | ❌ AUSENTE |
| `META_APP_SECRET` | ❌ AUSENTE |
| `META_ACCESS_TOKEN` | ❌ AUSENTE |
| `META_PHONE_NUMBER_ID` | ❌ AUSENTE |

**BLOQUEIO FORMAL:**
```
BLOQUEIO: secrets Meta ausentes no ambiente Claude Code.
PR-T8.12B não pode executar P2–P7 sem provisionamento dos secrets
Cloudflare e deploy do Worker em ambiente test.
```

Nenhum valor de secret foi exposto ou impresso.

---

## §4 — Deploy test

| Item | Status |
|---|---|
| `[env.test]` declarado em `wrangler.toml` | ✅ (`name = "nv-enova-2-test"`) |
| Worker test publicado via `wrangler deploy --env test` | ❌ BLOQUEIO — não confirmado |
| URL test disponível | ❌ BLOQUEIO — não confirmada |

**BLOQUEIO:** Worker test não publicado. Não é possível validar challenge real, inbound real ou telemetria real.

---

## §5 — Resultado P1 — Smokes locais (executados)

Executados com sucesso em 2026-04-30 sem secrets reais.

```
npm run smoke:meta:webhook  → 20/20 PASS
npm run smoke:meta          → PASSOU (14 cenários)
npm run smoke:all           → 73/73 PASS — EXIT 0
npm run prove:meta-controlada → 25 PASS | 0 FAIL | 6 SKIP — EXIT 0
```

**P1 PASSOU. Baseline local confirmado.**

---

## §6 — Resultado P2 — Secrets reais

**P2: BLOQUEIO**

```
[ABSENT] META_VERIFY_TOKEN
[ABSENT] META_APP_SECRET
[ABSENT] META_ACCESS_TOKEN
[ABSENT] META_PHONE_NUMBER_ID
STATUS: SECRETS_MISSING
```

P2 não pode ser executada. Secrets devem ser provisionados por Vasques via `wrangler secret put`.

---

## §7 — Resultado P3 — Deploy test

**P3: BLOQUEIO**

Worker test (`nv-enova-2-test`) está declarado no `wrangler.toml` mas não há confirmação de deploy publicado. P3 não pode ser executada sem:

```bash
wrangler deploy --env test
```

---

## §8 — Resultado P4 — Challenge real

**P4: BLOQUEIO — dependente de P3 (deploy test)**

Sem Worker test publicado e sem `META_VERIFY_TOKEN`, não é possível:
- confirmar que GET `/__meta__/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...` retorna 200 do Worker real;
- confirmar que token inválido retorna 403 do Worker real.

---

## §9 — Resultado P5 — Assinatura real

**P5: BLOQUEIO — dependente de P2 (secrets) + P3 (deploy test)**

Sem `META_APP_SECRET` provisionado no Worker test, não é possível:
- confirmar que POST sem assinatura retorna 401 real;
- confirmar que POST com assinatura inválida retorna 403 real;
- confirmar que POST com assinatura HMAC-SHA256 válida retorna 200 real.

---

## §10 — Resultado P6 — Inbound real/controlado

**P6: BLOQUEIO — dependente de P2 + P3 + webhook Meta registrado**

Sem webhook Meta registrado no painel Meta Developers apontando para o Worker test, não é possível:
- enviar payload controlado de texto real;
- validar normalização pelo parser real;
- validar status sem turno conversacional real;
- validar mídia como stub real;
- validar dedupe com mesmo `wa_message_id` real;
- confirmar `llm_invoked: false` real;
- confirmar ausência de `reply_text`/`stage`/`fact_*` real.

---

## §11 — Resultado P7 — Outbound

**P7 — Outbound bloqueado por default: CONFIRMADO LOCALMENTE**

Os smokes unitários (P1) provaram:
- `CHANNEL_ENABLED=false` → outbound bloqueado ✅
- `META_OUTBOUND_ENABLED=false` → outbound bloqueado ✅
- `evaluateOutboundReadiness` retorna `sent: false` em ambos os casos ✅
- inbound não chama outbound automaticamente (processMetaWebhookPost: `external_dispatch: false`) ✅

**P7 — Outbound real: OUTBOUND_REAL_SKIPPED_BY_POLICY**

Sem autorização explícita de Vasques e sem Worker test publicado, outbound real não é executado.

---

## §12 — Segurança / Invariantes

| Invariante | Status |
|---|---|
| Zero secret exposto em stdout/stderr | ✅ |
| Zero cliente real amplo | ✅ |
| Zero LLM real | ✅ |
| Zero go-live | ✅ |
| Zero migration | ✅ |
| Zero workflow/deploy alterado | ✅ |
| Parser nunca produz `reply_text`/`stage`/`fact_*` | ✅ (comprovado por P1 + smokes) |
| Adapter não decide stage/fact | ✅ |
| `smoke:all` EXIT 0 | ✅ |

---

## §13 — Resultado final

| Prova | Status | Motivo |
|---|---|---|
| P1 — Smokes locais | ✅ PASS | 25 PASS / 0 FAIL / 6 SKIP |
| P2 — Secrets reais | ❌ BLOQUEIO | Secrets ausentes no ambiente |
| P3 — Deploy test | ❌ BLOQUEIO | Worker test não publicado |
| P4 — Challenge real | ❌ BLOQUEIO | Depende de P2 + P3 |
| P5 — Assinatura real | ❌ BLOQUEIO | Depende de P2 + P3 |
| P6 — Inbound real | ❌ BLOQUEIO | Depende de P2 + P3 + webhook |
| P7 — Outbound bloqueado (local) | ✅ PASS | Comprovado nos smokes unitários |
| P7 — Outbound real | ⏭ SKIPPED | OUTBOUND_REAL_SKIPPED_BY_POLICY |
| P8 — Invariantes | ✅ PASS | Todos os 6 invariantes confirmados |

**STATUS GLOBAL: BLOQUEADO — frente Meta/WhatsApp permanece aberta.**

---

## §14 — Próxima PR autorizada

**Frente Meta/WhatsApp NÃO encerrada.**

A PR-T8.12B registra o bloqueio formal e documenta exatamente o que Vasques deve executar para que a prova real seja concluída.

### Passo a passo para Vasques executar P2–P7

**1. Provisionar secrets no Worker test:**
```bash
wrangler secret put META_VERIFY_TOKEN --env test
wrangler secret put META_APP_SECRET --env test
wrangler secret put META_ACCESS_TOKEN --env test
wrangler secret put META_PHONE_NUMBER_ID --env test
```

**2. Publicar Worker test:**
```bash
wrangler deploy --env test
# URL resultante: https://nv-enova-2-test.<account>.workers.dev
```

**3. Registrar webhook no painel Meta Developers:**
1. Meta Developers → App → WhatsApp → Configuration
2. Webhook URL: `https://nv-enova-2-test.<account>.workers.dev/__meta__/webhook`
3. Verify Token: valor de `META_VERIFY_TOKEN`
4. Campos: `messages`, `message_deliveries`, `message_reads`
5. Confirmar que GET challenge retorna 200 ← **este é P4**

**4. Executar prova real com secrets:**
```bash
META_REAL_ENABLED=true \
META_VERIFY_TOKEN=<token> \
META_APP_SECRET=<secret> \
META_ACCESS_TOKEN=<access_token> \
META_PHONE_NUMBER_ID=<phone_number_id> \
npx tsx src/meta/proof-controlled.ts
```

**Resultado esperado após ativação:**
```
PASS: 27+ | FAIL: 0 | SKIP: 0-2
STATUS: PASSOU (ou PARCIAL com P4-P6 em modo deploy real)
```

**5. Para P6 (inbound real):**
- Enviar mensagem WhatsApp real ao número test
- Verificar nos logs do Worker: `meta.webhook.inbound.accepted`

**6. Para P7 outbound real (requer autorização explícita de Vasques):**
```bash
wrangler secret put CHANNEL_ENABLED --env test
# valor: true (SOMENTE com autorização de Vasques)
wrangler secret put META_OUTBOUND_ENABLED --env test
# valor: true (SOMENTE com autorização de Vasques)
```

**Quando P2–P7 passarem com resultado real positivo:**  
→ Declarar frente Meta/WhatsApp aprovada/controlada  
→ Próxima PR autorizada: PR-T8.13 — Memória evolutiva + telemetria operacional
