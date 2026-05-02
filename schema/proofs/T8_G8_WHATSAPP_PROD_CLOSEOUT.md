# T8 — G8 APROVADO: WhatsApp PROD + LLM + Outbound — Closeout Formal

**Tipo:** PR-T8.R / CLOSEOUT  
**Data:** 2026-05-01  
**Branch:** `closeout/t8-g8-whatsapp-prod-llm-outbound`  
**Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`  
**Executor da prova real:** Vasques (2026-05-01)

---

## Veredito

**G8 APROVADO — FRENTE WHATSAPP PROD + LLM + OUTBOUND**

A Enova 2 está em produção respondendo WhatsApp com LLM desde 2026-05-01.

**Ressalva obrigatória:** Este G8 aprova exclusivamente a frente WhatsApp PROD + LLM + outbound.  
Não aprova a Enova como funil completo de vendas.  
A próxima frente obrigatória é: **integração LLM ↔ funil mecânico / stages / regras MCMV**.

---

## Evidências registradas por Vasques (2026-05-01)

### Evidência 1 — Logs PROD confirmados

```json
{"diag":"meta.prod.flags.snapshot",   "CLIENT_REAL_ENABLED": true,  "ROLLBACK_FLAG": false}
{"diag":"meta.prod.outbound.gate",    "allowed": true, "block_reason": null,
                                       "client_real_allowed": true, "canary_allowed": false}
{"diag":"meta.prod.outbound.result",  "external_dispatch": true, "meta_status": 200}
{"diag":"meta.prod.webhook.final",    "external_dispatch": true, "mode": "client_real_outbound"}
```

### Evidência 2 — Comportamento PROD confirmado

- Worker PROD `nv-enova-2` recebeu inbound WhatsApp real
- Pipeline completo: inbound → CRM + memória → LLM → outbound
- `external_dispatch=true` com `meta_status=200`
- `mode=client_real_outbound` ativo
- `CLIENT_REAL_ENABLED=true` refletido corretamente em runtime após fix

### Evidência 3 — WhatsApp respondendo naturalmente

- Vasques enviou mensagem sobre MCMV no WhatsApp real
- Enova 2 PROD respondeu em português, com conteúdo gerado pelo LLM
- Resposta sobre MCMV coerente e humana
- Nenhuma resposta indevida para outros números
- Conversa natural confirmada

### Evidência 4 — Gates soberanos preservados

- `ROLLBACK_FLAG=false` confirmado — gate de rollback soberano ativo
- `MAINTENANCE_MODE=false` confirmado — sem modo manutenção
- ROLLBACK_FLAG=true bloqueia LLM + outbound em qualquer cenário (invariante preservada)
- Smoke `smoke:meta:client-real-flag` 35/35 PASS — CLIENT_REAL gate validado
- Smoke `smoke:meta:canary` 41/41 PASS — gate canary inalterado
- Smoke `smoke:meta:webhook` 20/20 PASS — rota webhook inalterada
- Smoke `smoke:meta:pipeline` 26/26 PASS — pipeline CRM+memória inalterado

---

## PRs desta frente (ordem cronológica)

| PR | Tipo | Descrição | Status |
|---|---|---|---|
| PR-T8.11 | IMPL | Meta/WhatsApp Worker inbound/outbound | Mergeada |
| PR-T8.12B | PROVA | Harness Meta real + bloqueio formal | Mergeada |
| PR-T8.16 | IMPL | Inbound → CRM + memória | Mergeada |
| PR-PROVA T8.16 | PROVA | Prova inbound real Worker TEST | Mergeada |
| PR-T8.17 | IMPL | LLM + outbound canary controlado | Mergeada |
| PR-PROVA T8.17 | PROVA | Harness canary real (modo local 31/31) | Mergeada |
| PR-DIAG T8 (#174) | DIAG | 11 logs prod diagnóstico webhook silence | Mergeada |
| fix/t8-prod-client-real-flag (#175) | IMPL | Gate CLIENT_REAL_ENABLED no pipeline | Mergeada |
| PR-T8.R (esta) | CLOSEOUT | Encerramento formal G8 frente WhatsApp | Em execução |

---

## Diagnóstico que levou ao fix final

### Problema identificado (PR-DIAG #174)

Após cutover, telemetria mostrou:
```json
{"diag":"meta.prod.outbound.gate", "allowed":false, "block_reason":"wa_not_allowed", "client_real_allowed":false}
{"diag":"meta.prod.flags.snapshot", "CLIENT_REAL_ENABLED":false}
```

`canary-pipeline.ts` nunca lia `CLIENT_REAL_ENABLED` — a flag estava setada via `wrangler secret put` mas o pipeline não tinha caminho para ela.

### Correção aplicada (fix/t8-prod-client-real-flag #175)

Gate cascade corrigido:
```
rollback_active     → BLOQUEADO (soberano)
maintenance_active  → BLOQUEADO
client_real_enabled → PERMITIDO para qualquer WA (caminho novo)
canary_enabled      → verificado somente se CLIENT_REAL=false
wa_not_allowed      → somente no caminho canary
```

`MetaWorkerEnv` atualizado para incluir `CLIENT_REAL_ENABLED`.  
`diagLog` corrigido (hardcode `client_real_allowed:false` → variável real).  
Smoke `smoke:meta:client-real-flag` criado — 35/35 PASS.

---

## Estado das frentes T8

| Frente | Estado |
|---|---|
| CRM backend/frontend | APROVADO — PR-T8.4/T8.5/T8.6 |
| Supabase leitura real | APROVADO — PR-T8.9B (8/8 PASS) |
| Memória + telemetria | APROVADO — PR-T8.13/T8.14 |
| Flags + rollback + harness | APROVADO — PR-T8.15 |
| **WhatsApp PROD + LLM + outbound** | **APROVADO — ESTA PR** |
| Supabase escrita real | Pendente (futura) |
| Funil completo (stages/MCMV) | Pendente (próxima frente) |

---

## Regras de negócio preservadas

- LLM é soberano da fala — Adapter nunca gera reply_text por conta própria
- WA não autorizado nunca recebe resposta (rollback/maintenance gate)
- Secrets nunca aparecem em log/error/response
- ROLLBACK_FLAG=true bloqueia tudo em segundos (soberania absoluta)
- CLIENT_REAL_ENABLED gate não bypassa rollback/maintenance

---

## Próxima frente autorizada

**Integração LLM ↔ funil mecânico / stages / regras MCMV**

Escopo: conectar respostas LLM ao funil de vendas — estágios de qualificação, regras MCMV, handoff para atendimento humano quando necessário.

Pré-condição: esta PR mergeada + G8 frente WhatsApp declarado.
