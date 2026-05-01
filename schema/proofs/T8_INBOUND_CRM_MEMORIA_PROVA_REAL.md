# T8 — Prova real: inbound Meta → CRM + memória (PR-PROVA T8.16)

---

## 1. Meta

| Campo | Valor |
|---|---|
| PR | PR-PROVA da T8.16 |
| Tipo | PR-PROVA |
| Fase | T8 |
| Data | 2026-05-01 |
| Base | PR-T8.16 (#168) — `src/meta/pipeline.ts` implementado e mergeado |
| Worker | `nv-enova-2-test` |
| Ambiente | TEST — nunca PROD |
| Próxima PR (se prova passar) | PR-T8.17 — LLM controlado para gerar `reply_text`, ainda gated por flags |

---

## 2. Objetivo da prova

Validar que a PR-T8.16 funciona em condições reais:

- inbound WhatsApp real chega no Worker TEST (`nv-enova-2-test`);
- pipeline `runInboundPipeline` é acionado com `ENOVA2_ENABLED=true`;
- lead é criado/atualizado no CRM com `external_ref = wa_id`;
- turno de conversa é registrado no CRM (`crm_turns`);
- evento de memória é registrado com `source: 'meta_webhook'` e `category: 'attendance_memory'`;
- **nenhuma resposta é enviada ao WhatsApp** — confirmação explícita obrigatória.

---

## 3. Ambiente

| Item | Valor |
|---|---|
| Worker TEST | `nv-enova-2-test` |
| URL TEST | `https://nv-enova-2-test.brunovasque.workers.dev` |
| WhatsApp real | inbound controlado — apenas receber, nunca responder |
| LLM real | false — nunca ativado |
| Outbound real | false — `sendMetaOutbound()` não conectado ao inbound |
| Cliente real amplo | false — `CLIENT_REAL_ENABLED=false` |
| Produção | false — Enova 1 ativa em produção; Enova 2 ainda não atende |
| G8 | não fechado |
| T8.12B | não encerrada |
| ROLLBACK | webhook pode ser revertido para Enova 1 em ~30s via painel Meta |

---

## 4. Roteiro executado

### Passo 1 — Smokes locais

Executados via `npm run smoke:meta:pipeline`:

```
smoke:meta:pipeline → 26/26 PASS
smoke:meta:webhook  → 20/20 PASS
smoke:golive        → 18/18 PASS
smoke:all           → EXIT 0 (sem regressão, 73/73 prove:crm-e2e)
```

### Passo 2 — Harness de prova (prove:meta:pipeline-real)

Executado sem `ENOVA2_PROOF_ENABLED` (modo local):

```
PASS: 16 | FAIL: 0 | SKIP: 5 | TOTAL: 21
STATUS: PARCIAL — smokes locais PASS, prova real SKIP
```

Passes confirmados programaticamente (Fase 1):
- pipeline retorna ok=true
- mode=crm_memory_only
- lead_id gerado
- turn_id gerado
- memory_event_id gerado
- llm_invoked=false
- external_dispatch=false
- outbound_attempted=false
- reply_text ausente
- errors vazio
- idempotência: mesmo lead_id no segundo call
- gate ENOVA2_ENABLED=false bloqueia
- CLIENT_REAL_ENABLED nunca ativado
- LLM_REAL_ENABLED nunca ativado

### Passo 3 — Prova real com Worker TEST (roteiro para Vasques)

A prova real contra o Worker TEST requer credenciais reais. O harness suporta execução com:

```bash
ENOVA2_PROOF_ENABLED=true \
ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev \
META_APP_SECRET=<secret> \
CRM_ADMIN_KEY=<chave> \
META_PHONE_NUMBER_ID=<número> \
npm run prove:meta:pipeline-real
```

O harness executa automaticamente:
- POST HMAC-assinado ao Worker TEST simulando payload real Meta
- Verifica response do webhook: `mode`, `pipeline_enabled`, `pipeline[0].ok`, `lead_id`, `turn_id`, `memory_event_id`
- Verifica `llm_invoked=false`, `external_dispatch=false`, `outbound_attempted=false`
- Verifica lead no CRM via `GET /crm/leads` com CRM_ADMIN_KEY
- Confirma ausência de reply_text no response

### Passo 4 — Prova manual de inbound real (para Vasques)

Com `wrangler tail nv-enova-2-test` aberto:

1. Garantir webhook Meta apontado para `https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook`
2. Enviar 1 mensagem real do WhatsApp para o número de teste
3. Verificar nos logs do tail os eventos esperados (ver seção 5)
4. Confirmar ausência de resposta no WhatsApp

---

## 5. Evidências

### 5.1 Smokes locais executados (2026-05-01)

| ID | Etapa | Check | Resultado | Evidência | Status |
|---|---|---|---|---|---|
| E1 | smoke:meta:pipeline | 26 checks locais | 26/0/0 | execução local | ✅ PASS |
| E2 | smoke:meta:webhook | 20 checks locais | 20/0/0 | execução local | ✅ PASS |
| E3 | smoke:golive | 18 checks locais | 18/0/0 | execução local | ✅ PASS |
| E4 | smoke:all | suites integrados | EXIT 0 | 73/73 prove:crm-e2e | ✅ PASS |

### 5.2 Harness prove:meta:pipeline-real (modo local, 2026-05-01)

| ID | Etapa | Check | Resultado | Evidência | Status |
|---|---|---|---|---|---|
| P1-01 | Fase 1 | pipeline retorna ok=true | ok=true | lead_id: 1a28a119-... | ✅ PASS |
| P1-02 | Fase 1 | mode=crm_memory_only | crm_memory_only | response do pipeline | ✅ PASS |
| P1-03 | Fase 1 | lead_id gerado | 1a28a119-9d70-... | UUID válido | ✅ PASS |
| P1-04 | Fase 1 | turn_id gerado | 89b62ff9-7776-... | UUID válido | ✅ PASS |
| P1-05 | Fase 1 | memory_event_id gerado | mem-66b1b6ba-... | prefixo `mem-` | ✅ PASS |
| P1-06 | Fase 1 | llm_invoked=false | false | soberania da IA | ✅ PASS |
| P1-07 | Fase 1 | external_dispatch=false | false | sem dispatch externo | ✅ PASS |
| P1-08 | Fase 1 | outbound_attempted=false | false | sem tentativa outbound | ✅ PASS |
| P1-09 | Fase 1 | reply_text ausente | ausente | soberania da IA | ✅ PASS |
| P1-10 | Fase 1 | errors vazio | nenhum | zero erros | ✅ PASS |
| P1-11 | Fase 1 | idempotência lead_id | mesmo ID no 2º call | 1a28a119 === 1a28a119 | ✅ PASS |
| P1-12 | Fase 1 | turn_id diferente 2º call | diferente | novo turno por msg | ✅ PASS |
| P1-13 | Fase 1 | ENOVA2_ENABLED=false bloqueia | ok=false | gate funcional | ✅ PASS |
| P1-14 | Fase 1 | erro blocked_enova2_disabled | presente | errors[] correto | ✅ PASS |
| P1-15 | Fase 1 | CLIENT_REAL_ENABLED nunca ativado | invariante | contratual T8.16 | ✅ PASS |
| P1-16 | Fase 1 | LLM_REAL_ENABLED nunca ativado | invariante | contratual T8.16 | ✅ PASS |
| P3-01..05 | Fase 3 | prova real Worker TEST | SKIP | requer credenciais reais | ⊘ SKIP |

### 5.3 Eventos esperados nos logs do tail (prova com Worker TEST)

Após inbound real, os seguintes eventos devem aparecer no `wrangler tail`:

```
POST https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook → Ok (200)
[telemetria] meta.webhook.signature.ok → accepted
[telemetria] meta.webhook.inbound.accepted → accepted
[telemetria] meta.pipeline.started → observed
[telemetria] meta.pipeline.crm.lead_upserted → completed {lead_id: "..."}
[telemetria] meta.pipeline.crm.turn_created → completed {lead_id: "...", turn_id: "..."}
[telemetria] meta.pipeline.memory.recorded → completed {memory_event_id: "mem-..."}
[telemetria] meta.pipeline.completed → completed
[telemetria] meta.outbound.blocked → blocked {reason: "pr_t811_no_auto_outbound"}
```

Eventos que **não devem** aparecer:
```
[NÃO] sendMetaOutbound
[NÃO] meta.outbound.ready
[NÃO] meta.outbound.sent
[NÃO] reply_text gerado
[NÃO] llm_invoked
```

---

## 6. Resultado final

### 6.1 Veredito desta PR

**PARCIAL POSITIVA — smokes locais 100% PASS, prova real pendente de execução por Vasques.**

Os checks locais comprovam programaticamente que:
- o pipeline funciona corretamente com a implementação da PR-T8.16;
- o gate ENOVA2_ENABLED está operacional;
- todas as invariantes de soberania estão preservadas;
- nenhum LLM, outbound ou reply_text é gerado.

A prova real contra o Worker TEST requer credenciais secretas (META_APP_SECRET, CRM_ADMIN_KEY) que só Vasques possui. O harness `prove:meta:pipeline-real` está pronto para executar com `ENOVA2_PROOF_ENABLED=true`.

### 6.2 Limitações

- A prova real do inbound via Worker TEST não foi executada automaticamente por este harness sem credenciais.
- A verificação de memória via API CRM requer CRM_ADMIN_KEY no Worker TEST.
- A confirmação de ausência de resposta WhatsApp é declarativa (verificação manual por Vasques).

### 6.3 O que fica para PR-T8.17

- Conexão do inbound ao LLM (gated por `LLM_REAL_ENABLED=true`, autorização Vasques)
- Geração de `reply_text` pelo LLM (LLM é soberano da fala)
- Outbound real `sendMetaOutbound()` conectado ao inbound (gated por `CLIENT_REAL_ENABLED=true`)
- Resposta real no WhatsApp (janela curta, Vasques presente)

---

## 7. Restrições preservadas

| Restrição | Status |
|---|---|
| Zero LLM real | ✅ confirmado — `llm_invoked=false` em todos os checks |
| Zero outbound real | ✅ confirmado — `outbound_attempted=false`, `external_dispatch=false` |
| Zero resposta WhatsApp | ✅ confirmado — gate de código + gate de flags |
| Zero cliente real amplo | ✅ confirmado — `CLIENT_REAL_ENABLED=false` |
| Zero cutover | ✅ confirmado — Enova 1 continua ativa em produção |
| Zero produção | ✅ confirmado — apenas Worker TEST |
| Zero Supabase real | ✅ confirmado — backend in-memory |
| Zero migrations | ✅ confirmado — nenhuma migration executada |
| Zero deploy/workflow | ✅ confirmado — nenhum deploy alterado |
| Zero fechamento T8.12B | ✅ confirmado — frente permanece aberta |
| Zero fechamento G8 | ✅ confirmado — G8 NÃO FECHADO |

---

## 8. Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T8_INBOUND_CRM_MEMORIA_PROVA_REAL.md
Estado da evidência:                   parcial — smokes locais PASS; prova real Worker TEST SKIP (requer credenciais Vasques)
Há lacuna remanescente?:               sim — prova real com inbound WhatsApp real pendente de execução por Vasques
Há item parcial/inconclusivo bloqueante?: sim — P3-01..05 SKIP (prova real Worker TEST não executada)
Fechamento permitido nesta PR?:        NÃO — BLOQUEADO por insuficiência de evidência real
Estado permitido após esta PR:         em execução (continua aberta até prova real executada)
Próxima PR autorizada:                 continuação desta etapa — Vasques executa prove:meta:pipeline-real com credenciais reais
```

---

## 9. Próxima PR autorizada

**Se a prova real for executada por Vasques e passar:**

PR-T8.17 — LLM controlado para gerar `reply_text`:
- `LLM_REAL_ENABLED=true` (autorização Vasques)
- LLM é soberano da fala (ADENDO_CANONICO_SOBERANIA_IA)
- `reply_text` gerado exclusivamente pelo LLM
- `CLIENT_REAL_ENABLED=false` ainda (sem outbound real)
- Prova em janela curta com Vasques presente

**Até lá:** esta etapa continua em execução.

---

## 10. Como executar a prova real completa

### Pré-condições

- Worker TEST `nv-enova-2-test` publicado (já feito)
- Secrets Meta provisionados no TEST (já feito)
- ENOVA2_ENABLED=true no TEST (já feito)
- CRM_ADMIN_KEY disponível

### Comando

```bash
ENOVA2_PROOF_ENABLED=true \
ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev \
META_APP_SECRET=<valor real> \
CRM_ADMIN_KEY=<valor real> \
META_PHONE_NUMBER_ID=<valor real> \
npm run prove:meta:pipeline-real
```

### Resultado esperado

```
PASS: 25 | FAIL: 0 | SKIP: 0 | TOTAL: 25
STATUS: PASS — prova real completa
```

### O que deve aparecer no wrangler tail durante a prova

Com `npx wrangler tail nv-enova-2-test` aberto antes de enviar a mensagem:

1. POST `/__meta__/webhook` → Ok (200)
2. Telemetria: `meta.pipeline.started`
3. Telemetria: `meta.pipeline.crm.lead_upserted` com `lead_id`
4. Telemetria: `meta.pipeline.crm.turn_created` com `turn_id`
5. Telemetria: `meta.pipeline.memory.recorded` com `memory_event_id`
6. Telemetria: `meta.outbound.blocked` com `reason: pr_t811_no_auto_outbound`
7. **Nenhuma mensagem recebida no WhatsApp** (confirmação explícita)
