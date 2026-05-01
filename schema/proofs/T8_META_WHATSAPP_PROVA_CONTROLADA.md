# PR-T8.12 — Harness de Prova Meta/WhatsApp Controlada

**Tipo:** PR-PROVA (harness instalado — prova real pendente)  
**Frente:** Meta/WhatsApp Canal  
**Data de instalação do harness:** 2026-04-30  
**Executor:** Claude Code (claude-sonnet-4-6)  
**Branch:** feat/t8-pr-t8-12-prova-meta-whatsapp-controlada  

---

## §1 — Estado da prova

**Harness de prova Meta/WhatsApp controlada instalado.**

A prova real (P2–P7) **não foi executada** nesta PR por ausência de secrets Cloudflare, deploy Worker test e registro de webhook Meta.

**BLOQUEIO FORMAL:**
```
BLOQUEIO: secrets Meta ausentes no ambiente. PR-T8.12 instalou o harness
de prova, mas NÃO concluiu a prova real Meta/WhatsApp.
Prova real pendente de: secrets Cloudflare provisionados, deploy Worker
em ambiente test, e registro de webhook no painel Meta Developers.
```

**Frente Meta/WhatsApp permanece aberta até execução real positiva.**

**Próxima obrigatória: PR-T8.12B — Execução real Meta/WhatsApp controlada.**

---

## §2 — Pré-requisitos cumpridos

| Item | Status |
|---|---|
| PR-T8.10 (diagnóstico) merged | ✅ |
| PR-T8.11 (implementação) merged | ✅ |
| `smoke:meta:webhook` 20/20 PASS | ✅ |
| `smoke:meta` 14/14 PASS | ✅ |
| `smoke:all` EXIT 0 | ✅ |
| Script `prove:meta-controlada` criado | ✅ |
| Script exit 0 em modo skip | ✅ |
| Prova real P2–P7 executada | ❌ |
| Challenge real verificado no painel Meta | ❌ |
| Webhook registrado e verificado | ❌ |
| Inbound real recebido | ❌ |
| Deploy Worker em ambiente test | ❌ |

---

## §3 — Resultados P1 — Smokes unitários (sempre executam)

Executados em 2026-04-30 sem qualquer secret real.

```
--- P1 — Smokes unitários (signature, parser, dedupe, outbound) ---
[PASS] P1.1: computeMetaSignatureHex retorna hex de 64 chars (len)
[PASS] P1.1: computeMetaSignatureHex retorna hex de 64 chars (hex chars)
[PASS] P1.2: verifyMetaSignature aceita assinatura correta
[PASS] P1.3: verifyMetaSignature rejeita assinatura errada
[PASS] P1.4: parser → kind=message para texto (kind)
[PASS] P1.4: parser → kind=message para texto (wamid)
[PASS] P1.4: parser → kind=message para texto (text)
[PASS] P1.4: parser → kind=message para texto (estrutura)
[PASS] P1.5: parser → kind=status para status update (kind)
[PASS] P1.5: parser → kind=status para status update (estrutura)
[PASS] P1.6: DedupeStore bloqueia mensagem duplicada (has=false antes)
[PASS] P1.6: DedupeStore bloqueia mensagem duplicada (has=true depois)
[PASS] P1.6: DedupeStore bloqueia mensagem duplicada (size)
[PASS] P1.7: outbound bloqueado com CHANNEL_ENABLED=false
[PASS] P1.8: challenge GET com token correto → 200 (status)
[PASS] P1.8: challenge GET com token correto → 200 (body)
[PASS] P1.9: challenge GET com token errado → 403
[PASS] P1.10: POST com assinatura válida → processado (accepted)
[PASS] P1.10: POST com assinatura válida → processado (events)
```

**Total P1:** 19 cenários PASS | 0 FAIL

---

## §4 — Resultados P2–P7 — Provas reais (SKIPPED — não executadas)

```
[SKIP] P2: Assinatura HMAC com APP_SECRET real — META_REAL_ENABLED não definido
[SKIP] P3: processMetaWebhookPost com secrets reais — META_REAL_ENABLED não definido
[SKIP] P4: Webhook inbound real via Cloudflare — META_REAL_ENABLED não definido
[SKIP] P5: Outbound real via Graph API — META_REAL_ENABLED não definido
[SKIP] P6: Dedupe real (mesmo wamid duas vezes) — META_REAL_ENABLED não definido
[SKIP] P7: Telemetria real — eventos no Supabase — META_REAL_ENABLED não definido
```

**Total P2–P7:** 0 PASS | 0 FAIL | 6 SKIP  
**Interpretação: P2–P7 NÃO foram provadas. Frente permanece aberta.**

---

## §5 — Resultados P8 — Invariantes de soberania (sempre executam)

```
--- P8 — Invariantes de soberania IA/Canal ---
[PASS] P8.1: parser nunca produz reply_text / stage / speech_intent (sem reply_text)
[PASS] P8.1: parser nunca produz reply_text / stage / speech_intent (sem stage)
[PASS] P8.1: parser nunca produz reply_text / stage / speech_intent (sem speech_intent)
[PASS] P8.1: parser nunca produz reply_text / stage / speech_intent (invariante ok)
[PASS] P8.2: CHANNEL_ENABLED=false → outbound bloqueado mesmo com ACCESS_TOKEN
[PASS] P8.3: META_OUTBOUND_ENABLED=false → outbound bloqueado
```

**Total P8:** 6 cenários PASS | 0 FAIL

---

## §6 — Resultado final do script

```
========================================
PR-T8.12 Prova Meta/WhatsApp controlada
PASS: 25 | FAIL: 0 | SKIP: 6
STATUS: PARCIAL — smokes PASS, provas reais SKIPPED (bloqueio controlado)
Exit code: 0
```

**Interpretação correta:** harness instalado e funcionando. Prova real pendente em PR-T8.12B.

---

## §7 — O que PR-T8.12B deve provar (obrigatório)

Para que a frente Meta/WhatsApp seja considerada encerrada, PR-T8.12B deve executar com resultado PASS real:

| Prova | Descrição | Critério de aceite |
|---|---|---|
| P2 | HMAC com APP_SECRET real → verificação local | PASS com secret real |
| P3 | processMetaWebhookPost com secrets reais | accepted=true com secret real |
| P4 | Webhook inbound real via Worker publicado | `meta.webhook.inbound.accepted` nos logs |
| P5 | Outbound real controlado via Graph API | resposta 200 da API Meta (autorização Vasques) |
| P6 | Dedupe real: mesmo wamid duas vezes | segundo request retorna `duplicate: true` |
| P7 | Telemetria real no Supabase | evento persistido no Supabase |

---

## §8 — Instruções para Vasques — ativação da prova real (PR-T8.12B)

### 8.1 — Provisionar secrets no Cloudflare Worker

```bash
wrangler secret put META_VERIFY_TOKEN
# (digitar o token configurado no painel Meta Developers)

wrangler secret put META_APP_SECRET
# (App Secret da aplicação Meta — aba "App Secret" em Basic Settings)

wrangler secret put META_ACCESS_TOKEN
# (System User Token ou Page Access Token com whatsapp_business_messaging)

wrangler secret put META_PHONE_NUMBER_ID
# (ID do número de telefone no painel Meta WhatsApp)
```

### 8.2 — Deploy Worker em ambiente test

```bash
wrangler deploy --env test
```

### 8.3 — Registrar webhook no painel Meta Developers

1. Acessar Meta Developers → App → WhatsApp → Configuration
2. Webhook URL: `https://<worker>.workers.dev/__meta__/webhook`
3. Verify Token: o mesmo valor de `META_VERIFY_TOKEN`
4. Assinar nos campos: `messages`, `message_deliveries`, `message_reads`
5. Verificar que o GET challenge retorna 200 no painel — **este é P4 parcial**

### 8.4 — Executar prova real

```bash
META_REAL_ENABLED=true \
META_VERIFY_TOKEN=<token> \
META_APP_SECRET=<secret> \
META_ACCESS_TOKEN=<access_token> \
META_PHONE_NUMBER_ID=<phone_number_id> \
npx tsx src/meta/proof-controlled.ts
```

### 8.5 — Resultado esperado (modo real)

```
PASS: 27+ | FAIL: 0 | SKIP: 0–4 (P4–P7 requerem deployment real + webhook registrado)
STATUS: PASSOU ou PARCIAL com PASS reais em P2/P3
```

---

## §9 — Arquivos entregues por PR-T8.12

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/meta/proof-controlled.ts` | novo | Script dual-mode — skip sem env / prova com env |
| `schema/proofs/T8_META_WHATSAPP_PROVA_CONTROLADA.md` | novo | Este documento de prova |
| `package.json` | modificado | `prove:meta-controlada` adicionado |
| `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | atualizado | PR-T8.12 registrada |
| `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | atualizado | Handoff PR-T8.12 |

---

## §10 — Invariantes preservadas

- ✅ Nenhum secret real foi impresso em stdout/stderr
- ✅ Script não falha CI quando env ausente (exit 0)
- ✅ Parser nunca produz `reply_text`, `stage`, `speech_intent`
- ✅ Outbound bloqueado por default (`CHANNEL_ENABLED=false`)
- ✅ Nenhum cliente real, nenhum WhatsApp real ativado
- ✅ Soberania IA preservada — canal não toma decisões

---

## §11 — Limitações desta PR

1. **P2/P3 — Assinatura/POST com secrets reais**: requer secrets Meta reais. Não executável em Claude Code.
2. **P4 — Inbound real**: requer webhook registrado e deployment Worker. Fora do escopo desta PR.
3. **P5 — Outbound real**: requer `META_OUTBOUND_ENABLED=true` (autorização de Vasques) + deployment.
4. **P6 — Dedupe real**: requer dois POSTs reais via Meta Cloud API ao Worker publicado.
5. **P7 — Telemetria real**: requer Supabase + Worker deployment + evento real inbound.

**Nenhuma limitação é do código — o código está pronto para uso real quando os pré-requisitos externos forem atendidos.**

---

## §12 — Estado da frente

**Frente Meta/WhatsApp — Estado:** `HARNESS_INSTALADO_PROVA_REAL_PENDENTE`  
**Bloqueio:** secrets Cloudflare não provisionados + Worker não publicado em test + webhook Meta não registrado  
**Próxima obrigatória:** PR-T8.12B — Execução real Meta/WhatsApp controlada  
**Frente permanece aberta até PR-T8.12B executar P2–P7 com resultado PASS real.**
