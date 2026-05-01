# T8 — Meta/WhatsApp — Prova real parcial executada

**Data:** 2026-05-01  
**Tipo:** PR-PROVA / evidência operacional parcial  
**Ambiente:** Cloudflare Worker TEST  
**Worker:** `nv-enova-2-test`  
**URL:** `https://nv-enova-2-test.brunovasque.workers.dev`  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Relação:** PR-T8.12B / INFRA-META-01  

---

## 1. Veredito

A prova Meta/WhatsApp avançou de `BLOQUEADA_AGUARDANDO_VASQUES` para **PROVA REAL PARCIAL EXECUTADA**.

O Worker TEST foi publicado, os secrets Meta foram provisionados, o health autenticado foi validado, o challenge local/simulado funcionou, assinatura inválida foi bloqueada corretamente, a prova controlada local com secrets reais passou, e um inbound real chegou ao Worker TEST via webhook Meta.

**G8 ainda NÃO deve ser fechado nesta PR.**  
**T8.12B ainda NÃO deve ser encerrada como completa.**

Motivo: a prova confirmou recebimento real do inbound, mas o canal ainda não foi acoplado a LLM/outbound automático, e o cenário foi executado com troca temporária do webhook real por causa de existir apenas um número WhatsApp disponível.

---

## 2. Evidências executadas por Vasques

### 2.1 Worker TEST publicado

Comando executado:

```powershell
npx wrangler deploy --env test
```

Resultado observado:

```text
Deployed nv-enova-2-test triggers
https://nv-enova-2-test.brunovasque.workers.dev
```

### 2.2 Health sem autenticação protegido

Comando executado:

```powershell
Invoke-WebRequest "$base/__admin__/go-live/health" -UseBasicParsing
```

Resultado observado:

```text
401
```

Interpretação: endpoint existe e está protegido.

### 2.3 Health autenticado OK

Comando executado:

```powershell
Invoke-RestMethod "$base/__admin__/go-live/health" -Headers @{ "X-CRM-Admin-Key" = $key }
```

Resultado observado:

```text
ok: True
route: /__admin__/go-live/health
status: g8_blocked
crm_ready=True
supabase_ready=True
memory_ready=True
telemetry_ready=True
rollback_ready=True
flags_ready=True
```

### 2.4 Secrets Meta provisionados no Worker TEST

Secrets provisionados via Wrangler:

```text
META_VERIFY_TOKEN
META_APP_SECRET
META_ACCESS_TOKEN
META_PHONE_NUMBER_ID
ENOVA2_ENABLED=true
CHANNEL_ENABLED=true
META_OUTBOUND_ENABLED=true
```

Nenhum valor real foi registrado neste documento.

### 2.5 Challenge local/simulado OK

Comando executado:

```powershell
Invoke-WebRequest "$base/__meta__/webhook?hub.mode=subscribe&hub.verify_token=$token&hub.challenge=teste123" -UseBasicParsing
```

Resultado observado:

```text
StatusCode: 200
Content: teste123
```

Interpretação: endpoint `GET /__meta__/webhook` responde ao formato esperado pela Meta.

### 2.6 POST com assinatura inválida bloqueado

Comando executado:

```powershell
Invoke-WebRequest "$base/__meta__/webhook" -Method POST -Body $body -ContentType "application/json" -Headers @{ "X-Hub-Signature-256" = "sha256=assinatura_errada" } -UseBasicParsing
```

Resultado observado:

```text
403
```

Interpretação: assinatura inválida é bloqueada corretamente.

### 2.7 Prova controlada local com secrets reais

Comando executado:

```powershell
npm run prove:meta-controlada
```

Resultado observado:

```text
PASS: 29 | FAIL: 0 | SKIP: 4
STATUS: PARCIAL — smokes PASS, provas reais SKIPPED (bloqueio controlado)
```

Pontos comprovados:

- HMAC com `META_APP_SECRET` real OK.
- POST simulado com `APP_SECRET` real aceito.
- Parser, dedupe e outbound gate funcionando.
- Outbound permanece bloqueado quando as condições não são satisfeitas.

### 2.8 Inbound real recebido no Worker TEST

Com `wrangler tail nv-enova-2-test` aberto, Vasques enviou mensagens reais para o número WhatsApp.

Resultado observado no tail:

```text
POST https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook - Ok
POST https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook - Ok
```

Interpretação: o webhook Meta entregou inbound real ao Worker TEST.

---

## 3. Restrição operacional importante

O ambiente possui apenas **um número WhatsApp**. Portanto, o painel Meta só consegue apontar o webhook do app para um endpoint por vez.

Durante a prova, a troca para o endpoint TEST deve ser tratada como janela curta e reversível:

```text
Produção anterior: https://nv-enova.brunovasque.workers.dev/webhook/meta
Teste Enova 2:    https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook
```

Essa restrição impede manter produção antiga e teste novo recebendo inbound simultaneamente pelo mesmo número sem estratégia adicional.

---

## 4. O que NÃO foi provado

Ainda não foi provado nesta etapa:

- resposta automática no WhatsApp;
- chamada LLM real;
- outbound real acoplado ao inbound;
- atendimento real completo ponta a ponta;
- persistência Supabase real do evento inbound;
- atualização de CRM/conversa a partir do inbound real;
- fechamento de G8;
- go-live.

---

## 5. Estado correto após esta prova

| Item | Estado |
|---|---|
| Worker TEST | PUBLICADO |
| Secrets Meta TEST | PROVISIONADOS |
| Health auth | OK |
| Challenge local/simulado | OK |
| Assinatura inválida | BLOQUEADA 403 |
| Prova controlada com secrets | 29 PASS / 0 FAIL / 4 SKIP |
| Inbound real no Worker TEST | OK |
| Outbound automático | NÃO ATIVADO |
| LLM real | NÃO ATIVADO |
| Cliente real amplo | NÃO AUTORIZADO |
| G8 | NÃO FECHADO |

---

## 6. Próximo passo autorizado

Abrir uma PR seguinte, separada e cirúrgica, para decidir o caminho técnico do acoplamento pós-inbound:

1. Diagnosticar exatamente o que falta entre `POST /__meta__/webhook` e resposta operacional.
2. Confirmar se o inbound deve alimentar CRM/eventos/memória antes de chamar LLM.
3. Definir como ativar LLM/outbound com segurança usando feature flags.
4. Considerar a restrição de um único número WhatsApp e risco de interromper produção antiga.

Nenhuma ativação ampla deve ocorrer sem PR específica, prova e autorização do Vasques.

---

## 7. Rollback operacional

Se necessário, voltar o webhook Meta para a URL anterior de produção:

```text
https://nv-enova.brunovasque.workers.dev/webhook/meta
```

E manter flags reais desligadas no Worker TEST:

```text
CLIENT_REAL_ENABLED=false
LLM_REAL_ENABLED=false
```

---

## 8. Fechamento

Esta prova reduz o bloqueio da frente Meta/WhatsApp, mas não encerra T8.12B nem G8.

**Classificação final:** prova real parcial positiva, com bloqueio remanescente no acoplamento inbound → LLM/outbound/CRM/persistência.
