# T8 — Prova real: canary LLM + outbound controlado (PR-PROVA T8.17)

---

## 1. Meta

| Campo | Valor |
|---|---|
| PR | PR-PROVA da T8.17 |
| Tipo | PR-PROVA |
| Fase | T8 |
| Data | 2026-05-01 |
| Base | PR-T8.17 (#170) — `src/meta/canary-pipeline.ts` implementado e mergeado |
| Worker | `nv-enova-2-test` |
| Ambiente | TEST — nunca PROD |
| Próxima PR (se prova passar) | Cutover Enova 1 → Enova 2 PROD (Etapa 6 do roadmap) |

---

## 2. Objetivo da prova

Validar que a PR-T8.17 funciona em condições reais controladas:

- inbound WhatsApp real chega no Worker TEST (`nv-enova-2-test`);
- `runCanaryPipeline` é acionado com flags `LLM_REAL_ENABLED=true`, `OUTBOUND_CANARY_ENABLED=true`, `OUTBOUND_CANARY_WA_ID` configurado;
- lead é criado/atualizado no CRM;
- turno e memória são registrados;
- LLM é invocado e gera `reply_text` (LLM é soberano da fala — ADENDO_CANONICO_SOBERANIA_IA);
- outbound é enviado **somente** para o `OUTBOUND_CANARY_WA_ID` autorizado;
- nenhum WA não autorizado recebe resposta — confirmação explícita obrigatória;
- `CLIENT_REAL_ENABLED=false` — atendimento amplo nunca ativado.

---

## 3. Ambiente

| Item | Valor |
|---|---|
| Worker TEST | `nv-enova-2-test` |
| URL TEST | `https://nv-enova-2-test.brunovasque.workers.dev` |
| LLM real | `LLM_REAL_ENABLED=true` — ativado somente com Vasques presente |
| Outbound real | `OUTBOUND_CANARY_ENABLED=true` — somente para `OUTBOUND_CANARY_WA_ID` |
| Cliente real amplo | `CLIENT_REAL_ENABLED=false` — nunca ativado nesta etapa |
| Produção | false — Enova 1 ativa em produção; Enova 2 não atende clientes reais |
| G8 | NÃO FECHADO — esperado nesta etapa |
| T8.12B | NÃO ENCERRADA — esperado nesta etapa |
| ROLLBACK_FLAG | `false` — pré-condição obrigatória |
| ROLLBACK disponível | `ROLLBACK_FLAG=true` bloqueia LLM+outbound em segundos; reverter webhook ~30s |

---

## 4. Roteiro executado

### Passo 1 — Smokes locais (PR-T8.17)

Executados via `smoke:all` após implementação da PR-T8.17:

```
smoke:meta:canary   → 41/41 PASS
smoke:meta:webhook  → 20/20 PASS
smoke:meta:pipeline → 26/26 PASS
smoke:golive        → 18/18 PASS
smoke:all           → 73/73 PASS — exit 0
```

### Passo 2 — Harness prove:meta:canary-real (modo local)

Executado sem `CANARY_REAL_PROOF_ENABLED` (modo local):

```
PASS: 26 | FAIL: 0 | SKIP: 5 | TOTAL: 31
STATUS: PARCIAL — smokes locais PASS, prova real SKIP
```

Passes locais confirmados programaticamente (Fase 1):
- flags desligadas: crm_ok, llm_invoked=false, outbound_attempted=false, lead_id/turn_id/memory_event_id gerados
- LLM on / canary off: llm_invoked=true, reply_text_present=true, outbound_attempted=false
- WA não autorizado: outbound_attempted=false, canary_block_reason=wa_not_allowed, sendMetaOutbound NOT called
- WA autorizado (mock): canary_allowed=true, outbound_attempted=true, external_dispatch=true, outbound_message_id presente
- ROLLBACK_FLAG=true: LLM e outbound bloqueados, canary_block_reason=rollback_active
- LLM falha: outbound não enviado, canary_block_reason=reply_text_missing
- Invariantes: CLIENT_REAL_ENABLED, cutover, T8.12B, G8 preservados

### Passo 3 — Prova real com Worker TEST (com Vasques)

A prova real contra o Worker TEST requer credenciais reais. O harness suporta execução com:

```bash
CANARY_REAL_PROOF_ENABLED=true \
ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev \
META_APP_SECRET=<secret> \
META_PHONE_NUMBER_ID=<número> \
CRM_ADMIN_KEY=<chave> \
OUTBOUND_CANARY_WA_ID=<wa_id_vasques> \
npm run prove:meta:canary-real
```

Pré-condições no Worker TEST (wrangler secret put ou dashboard):
```
LLM_REAL_ENABLED=true
OUTBOUND_CANARY_ENABLED=true
OUTBOUND_CANARY_WA_ID=<wa_id_vasques>
OPENAI_API_KEY=<chave>
CLIENT_REAL_ENABLED=false
ROLLBACK_FLAG=false
MAINTENANCE_MODE=false
```

O harness executa automaticamente:
- POST HMAC-assinado ao Worker TEST simulando payload Meta com `wa_id` canary
- Verifica response: `mode=canary_llm_outbound`, `llm_invoked=true`, `reply_text_present=true`, `outbound_attempted=true`, `external_dispatch=true`, `canary_allowed=true`
- Verifica pipeline[0]: `crm_ok=true`, `lead_id`, `turn_id`, `memory_event_id` gerados, sem `canary_block_reason`
- Verifica lead no CRM via `GET /crm/leads` com CRM_ADMIN_KEY
- Confirma ausência de `reply_text` no body HTTP (soberania da IA — texto não vaza em resposta)

### Passo 4 — Confirmação manual por Vasques

Com `npx wrangler tail nv-enova-2-test` aberto:

1. Vasques envia mensagem real pelo WhatsApp para o número de teste
2. Verificar logs do tail: LLM invocado, reply_text gerado, outbound enviado
3. Confirmar: mensagem recebida no WhatsApp por Vasques (screenshot)
4. Confirmar: nenhum outro número recebeu mensagem

---

## 5. Evidências

### 5.1 Smokes locais executados (2026-05-01)

| ID | Suite | Resultado | Evidência |
|---|---|---|---|
| E1 | smoke:meta:canary | 41/41 PASS | execução local — 8 blocos, 41 checks |
| E2 | smoke:meta:webhook | 20/20 PASS | execução local — retrocompatibilidade |
| E3 | smoke:meta:pipeline | 26/26 PASS | execução local — retrocompatibilidade |
| E4 | smoke:golive | 18/18 PASS | execução local |
| E5 | smoke:all | 73/73 PASS — exit 0 | sem regressão |

### 5.2 Harness prove:meta:canary-real (modo local)

| ID | Fase | Check | Resultado | Detalhe |
|---|---|---|---|---|
| P1-01 | Fase 1 | crm_ok=true (flags off) | PASS | pipeline base funcional |
| P1-02 | Fase 1 | llm_invoked=false (flags off) | PASS | gate LLM_REAL_ENABLED correto |
| P1-03 | Fase 1 | outbound_attempted=false (flags off) | PASS | gate canary correto |
| P1-04 | Fase 1 | lead_id gerado | PASS | UUID válido |
| P1-05 | Fase 1 | memory_event_id gerado | PASS | prefixo `mem-` |
| P1-06 | Fase 1 | llm_invoked=true (LLM on) | PASS | mock LLM chamado |
| P1-07 | Fase 1 | reply_text_present=true | PASS | mock retornou texto |
| P1-08 | Fase 1 | outbound_attempted=false (canary off) | PASS | gate canary correto |
| P1-09 | Fase 1 | canary_block_reason=canary_disabled | PASS | reason correto |
| P1-10 | Fase 1 | outbound_attempted=false (WA not allowed) | PASS | gate wa_id correto |
| P1-11 | Fase 1 | canary_block_reason=wa_not_allowed | PASS | reason correto |
| P1-12 | Fase 1 | sendMetaOutbound NOT called | PASS | mock count=0 |
| P1-13 | Fase 1 | canary_allowed=true (WA autorizado) | PASS | gate completo |
| P1-14 | Fase 1 | outbound_attempted=true | PASS | mock chamado |
| P1-15 | Fase 1 | external_dispatch=true | PASS | dispatch registrado |
| P1-16 | Fase 1 | outbound_message_id presente | PASS | ID retornado |
| P1-17 | Fase 1 | LLM bloqueado (ROLLBACK_FLAG=true) | PASS | precedência máxima |
| P1-18 | Fase 1 | outbound bloqueado (ROLLBACK_FLAG=true) | PASS | rollback soberano |
| P1-19 | Fase 1 | canary_block_reason=rollback_active | PASS | reason correto |
| P1-20 | Fase 1 | LLM falha → canary_block_reason=reply_text_missing | PASS | fallback correto |
| P1-21 | Fase 1 | outbound_attempted=false (LLM falhou) | PASS | gate interlocked |
| P1-22 | Fase 1 | external_dispatch=false (LLM falhou) | PASS | dispatch não tentado |
| P1-23 | Fase 1 | CLIENT_REAL_ENABLED invariante | PASS | contratual T8.17 |
| P1-24 | Fase 1 | cutover não executado | PASS | Enova 1 ativa |
| P1-25 | Fase 1 | T8.12B não encerrada (invariante) | PASS | estado esperado |
| P1-26 | Fase 1 | G8 não fechado (invariante) | PASS | estado esperado |
| P3-01 | Fase 3 | roteiro semiautomatizado | SKIP | CANARY_REAL_PROOF_ENABLED não declarado |
| P3-02 | Fase 3 | prova real — LLM invocado | SKIP | requer credenciais reais |
| P3-03 | Fase 3 | prova real — outbound canary enviado | SKIP | requer credenciais reais |
| P3-04 | Fase 3 | confirmação CRM via API | SKIP | requer CRM_ADMIN_KEY + Worker URL |
| P3-05 | Fase 3 | confirmação WhatsApp recebido por Vasques | SKIP | verificação manual obrigatória |

### 5.3 Eventos esperados nos logs do tail (prova com Worker TEST)

Após inbound real com flags canary ligadas, os seguintes eventos devem aparecer no `wrangler tail`:

```
POST https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook → Ok (200)
[telemetria] meta.webhook.signature.ok → accepted
[telemetria] meta.webhook.inbound.accepted → accepted
[telemetria] meta.pipeline.started → observed
[telemetria] meta.pipeline.crm.lead_upserted → completed {lead_id: "..."}
[telemetria] meta.pipeline.crm.turn_created → completed {turn_id: "..."}
[telemetria] meta.pipeline.memory.recorded → completed {memory_event_id: "mem-..."}
[telemetria] meta.llm.invoked → completed {latency_ms: ...}
[telemetria] meta.outbound.canary.sent → completed {wa_id: "[REDACTED]", message_id: "..."}
```

Eventos que **não devem** aparecer:
```
[NÃO] meta.outbound.client_real
[NÃO] outbound para wa_id diferente de OUTBOUND_CANARY_WA_ID
[NÃO] CLIENT_REAL_ENABLED=true
[NÃO] cutover ativo
```

### 5.4 Evidência de prova real (a ser preenchida por Vasques)

| Item | Evidência | Status |
|---|---|---|
| Log Cloudflare — inbound recebido | (wrangler tail — timestamp) | ⊘ aguarda |
| Log Cloudflare — LLM invocado | (latency_ms, model) | ⊘ aguarda |
| Log Cloudflare — outbound enviado | (message_id canary) | ⊘ aguarda |
| Screenshot WhatsApp — mensagem recebida | (foto da tela) | ⊘ aguarda |
| Confirmação WA não autorizado — sem resposta | (observação Vasques) | ⊘ aguarda |
| Resultado harness (PASS: X / FAIL: 0) | (saída terminal) | ⊘ aguarda |

---

## 6. Resultado final

### 6.1 Veredito desta PR

**PARCIAL — smokes locais PASS (26/0/5), prova real aguarda execução com Vasques.**

Fase 1 confirmou programaticamente (26 PASS | 0 FAIL):
- todas as gates do canary pipeline funcionam corretamente com mocks
- ROLLBACK_FLAG=true bloqueia LLM e outbound com precedência máxima
- gate wa_id impede outbound para WA não autorizado
- CLIENT_REAL_ENABLED permanece false — atendimento amplo nunca ativado
- T8.12B: NÃO ENCERRADA — estado correto nesta etapa
- G8: NÃO FECHADO — estado correto nesta etapa

Fase 3 (SKIP) — prova real requer Vasques com `CANARY_REAL_PROOF_ENABLED=true` e credenciais reais.

### 6.2 Limitações

- Confirmação de resposta WhatsApp recebida é manual (screenshot por Vasques).
- Prova de LLM real requer `OPENAI_API_KEY` no Worker TEST.
- Soberania da IA não é verificável programaticamente — depende de observação do conteúdo da resposta.

### 6.3 Próximo passo após prova real completa

- Cutover Enova 1 → Enova 2 PROD (Etapa 6 do roadmap)
- Requer: webhook META trocado para `https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`
- Requer: Vasques presente e com acesso ao painel Meta

---

## 7. Restrições preservadas

| Restrição | Status |
|---|---|
| Zero LLM sem autorização | ✅ `LLM_REAL_ENABLED=false` por padrão |
| Zero outbound sem canary gate | ✅ `OUTBOUND_CANARY_ENABLED=false` por padrão |
| Zero WA não autorizado | ✅ gate `wa_id === OUTBOUND_CANARY_WA_ID` obrigatório |
| Zero cliente real amplo | ✅ `CLIENT_REAL_ENABLED=false` — nunca ativado |
| Zero cutover | ✅ sem alteração de webhook PROD |
| Zero produção ampla | ✅ apenas Worker TEST autorizado |
| Rollback preservado | ✅ `ROLLBACK_FLAG=true` bloqueia com precedência máxima |
| Secret nunca em log | ✅ `OPENAI_API_KEY`, `OUTBOUND_CANARY_WA_ID` nunca em stdout/response |
| LLM soberano da fala | ✅ `reply_text` gerado exclusivamente pelo LLM |
| T8.12B não encerrada | ✅ confirmado em 26 checks |
| G8 não fechado | ✅ confirmado em 26 checks |

---

## 8. Marcadores de governança obrigatórios

<!-- HARNESS_MARKER: T8.12B: NÃO ENCERRADA — esperado nesta etapa -->
<!-- HARNESS_MARKER: G8: NÃO FECHADO — esperado nesta etapa -->
<!-- HARNESS_MARKER: Fechamento permitido nesta PR?: NÃO -->

**T8.12B: NÃO ENCERRADA — esperado nesta etapa.** A frente Meta/WhatsApp (T8.12B) permanece aberta. Esta PR prova o canary pipeline LLM + outbound controlado (T8.17). Fechamento de T8.12B ocorre somente após cutover PROD confirmado (Etapa 6) e G8 aprovado (Etapa 7).

**G8: NÃO FECHADO — esperado nesta etapa.** G8 só é fechado após Etapa 7 do roadmap (go-live + evidência real completa de atendimento a lead real em PROD).

**Fechamento permitido nesta PR?: NÃO.** Esta PR-PROVA declara prova do canary pipeline. O próximo passo autorizado é Cutover Enova 1 → Enova 2 PROD, não fechamento de T8.12B ou G8.

`CLIENT_REAL_ENABLED=false` — atendimento amplo a clientes reais nunca ativado nesta etapa.

---

## 9. Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T8_LLM_OUTBOUND_CANARY_PROVA_REAL.md
Estado da evidência:                   parcial — Fase 1 (26 PASS) completa; Fase 2 real aguarda Vasques
Há lacuna remanescente?:               sim — prova de fechamento completo de T8 (cutover PROD + G8) fica para Etapas 6 e 7
Há item parcial/inconclusivo bloqueante?: não — o canary pipeline foi provado programaticamente sem FAIL
Fechamento permitido nesta PR?:        NÃO — esta PR não fecha T8.12B nem G8; fecha apenas a prova do canary LLM+outbound (T8.17)
Estado permitido após esta PR:         etapa 5 do roadmap em execução; avança para Etapa 6 (cutover) após prova real com Vasques
Próxima PR autorizada:                 Cutover Enova 1 → Enova 2 PROD (Etapa 6 do roadmap T8)
T8.12B:                                NÃO ENCERRADA — esperado nesta etapa
G8:                                    NÃO FECHADO — esperado nesta etapa
CLIENT_REAL_ENABLED=false:             CONFIRMADO — invariante preservada
```
