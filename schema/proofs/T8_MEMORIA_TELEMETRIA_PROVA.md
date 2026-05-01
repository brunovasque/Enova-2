# PR-T8.14 — Prova memória + telemetria + regressão contratual

**Tipo:** PR-PROVA  
**Frente:** Memória evolutiva + telemetria  
**Data:** 2026-04-30  
**Branch:** `feat/t8-pr-t8-14-prova-memoria-telemetria-regressao`  
**Executado em:** Claude Code / Node.js / tsx

---

## §1 — Meta

Esta PR-T8.14 é a prova formal da frente memória/telemetria implementada em PR-T8.13. Não implementa nada novo. Executa e documenta os 9 critérios de prova definidos no contrato T8 §4.2 e no handoff, com resultado 9/9 PASS + regressão completa PASS.

Após esta PR: frente memória/telemetria declarada **APROVADA_LOCAL_IN_MEMORY**. Persistência Supabase real fica para PR futura sob `MEMORY_SUPABASE_ENABLED`. Meta/WhatsApp continua bloqueada aguardando Vasques (PR-T8.12B).

---

## §2 — Pré-condições verificadas

| Pré-condição | Status |
|---|---|
| PR-T8.13 concluída (smoke:memory 17/17 PASS) | ✅ |
| Frente Supabase encerrada (PR-T8.9B) | ✅ |
| Frente CRM operacional (PR-T8.6, 73/73 PASS) | ✅ |
| Meta/WhatsApp harness instalado (PR-T8.12B) | ✅ (frente bloqueada aguardando Vasques) |
| Esta PR não exige Meta real para executar | ✅ declarado |

---

## §3 — Escopo e limites

**Esta PR:**
- Prova o que existe em `src/memory/` (6 arquivos criados em PR-T8.13)
- Cria `src/memory/proof.ts` — script de prova com 9 cenários programáticos
- Cria `prove:memory-telemetry` no `package.json`
- Documenta evidências em `schema/proofs/T8_MEMORIA_TELEMETRIA_PROVA.md`
- Atualiza STATUS e LATEST

**Esta PR NÃO:**
- Implementa nova funcionalidade de memória
- Conecta Supabase real para persistência
- Ativa Meta/WhatsApp real
- Fecha G8
- Prova atendimento real

---

## §4 — Script de prova

```
src/memory/proof.ts     — 9 provas programáticas cobrindo P1–P9
npm run prove:memory-telemetry
```

Execução local:
```
npm run prove:memory-telemetry
PASS: 9 | FAIL: 0
STATUS: PASSOU
```

---

## §5 — Resultado P1: Evento de atendimento salvo

**Prova:** `registerMemoryEvent` com `attendance_memory`/`attendance_started` persiste no store com `status=draft` e retorna `lead_ref` preservado.

| Assertion | Resultado |
|---|---|
| `registerMemoryEvent` retorna `success=true` | PASS |
| `category = attendance_memory` | PASS |
| `event_type = attendance_started` | PASS |
| `status inicial = draft` | PASS |
| `lead_ref` preservado | PASS |
| `id` não vazio | PASS |
| `listByLead` retorna >= 1 | PASS |
| Registro aparece na consulta por lead | PASS |

**Evidência:** evento salvo em store in-memory; consultável via `listMemoryByLead`.

---

## §6 — Resultado P2: Insight candidato criado como draft

**Prova:** `createLearningCandidate` sempre cria com `status=draft` e todos os campos de decisão nulos.

| Assertion | Resultado |
|---|---|
| `success = true` | PASS |
| `category = learning_candidate` | PASS |
| `status = draft` | PASS |
| `decision_at = null` | PASS |
| `decision_operator_id = null` | PASS |
| `decision_reason = null` | PASS |
| `hypothesis` preservada | PASS |

**Evidência:** nenhuma decisão automática é possível por construção — `applyLearningDecision` é a única rota de mudança de status.

---

## §7 — Resultado P3: Candidato NÃO promovido automaticamente

**Prova:** após P1+P2, `listLearningCandidates('promoted').count === 0`; invariantes declarativas ativas.

| Assertion | Resultado |
|---|---|
| `promoted count = 0` | PASS |
| `can_create_fact = false` | PASS |
| `can_change_stage = false` | PASS |
| `can_promote_automatically = false` | PASS |
| `can_call_llm = false` | PASS |
| `can_send_outbound = false` | PASS |
| `sanitization_required = true` | PASS |
| `status.auto_promotion_disabled = true` | PASS |
| `status.auto_stage_change_disabled = true` | PASS |
| `status.auto_fact_creation_disabled = true` | PASS |

**Evidência:** `memoryInvariants()` retorna estrutura soberana; `getMemoryStatus().invariants` reflete o mesmo. Nenhuma função pública do módulo expõe API para promoção sem decisão humana.

---

## §8 — Resultado P4: Decisão humana exige operator_id + reason

**Prova:** `applyLearningDecision` rejeita chamadas sem `operator_id`, sem `reason` ou com `decision` inválida; aceita e aplica `validated`/`rejected`/`promoted` corretamente.

| Assertion | Resultado |
|---|---|
| Rejeita sem `operator_id` | PASS |
| Rejeita sem `reason` | PASS |
| Rejeita `decision` inválida | PASS |
| `validated`: `success=true`, `status=validated` | PASS |
| `validated`: `operator_id` registrado | PASS |
| `validated`: `decision_at` preenchido | PASS |
| `rejected`: `success=true`, `status=rejected` | PASS |
| `promoted`: `success=true`, `status=promoted` | PASS |

**Evidência:** decisão humana é a única rota para mudança de status; campos `operator_id` e `reason` não podem ser omitidos.

---

## §9 — Resultado P5: Telemetria emite eventos canônicos

**Prova:** buffer de telemetria contém eventos `f7.core.persistence_signal.memory.*` após operações P1–P4.

| Evento | Resultado |
|---|---|
| `f7.core.persistence_signal.memory.event.recorded` | PASS |
| `f7.core.persistence_signal.memory.candidate.created` | PASS |
| `f7.core.persistence_signal.memory.candidate.validated` | PASS |
| `f7.core.persistence_signal.memory.candidate.rejected` | PASS |
| `f7.core.persistence_signal.memory.candidate.promoted` | PASS |
| `layer=core` em todos | PASS |
| `persistence_signal` no `event_name` de todos | PASS |

**Evidência:** `readTelemetryBuffer()` retorna >= 1 evento de memória com padrão canônico `f7.core.persistence_signal.memory.*`.

---

## §10 — Resultado P6: Sanitização redige segredos

**Prova:** `sanitizeRecord` com payload contendo campos sensíveis: `authorization`, `META_APP_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `sha256=...`, Bearer token — todos redigidos para `[REDACTED]`. Campos neutros preservados.

| Assertion | Resultado |
|---|---|
| `authorization` → `[REDACTED]` | PASS |
| `META_APP_SECRET` → `[REDACTED]` | PASS |
| `payload` neutro preservado | PASS |
| `nested.SUPABASE_SERVICE_ROLE_KEY` → `[REDACTED]` | PASS |
| `nested.clean` preservado | PASS |
| `isFieldNameSensitive('authorization')` | PASS |
| `isFieldNameSensitive('META_VERIFY_TOKEN')` | PASS |
| `redactStringValue('Bearer sk-abc')` | PASS |
| `sanitizeText` trunca além do limite | PASS |

**Evidência:** sanitização cobre padrões de token, chaves de env e nomes de campo via listas declaradas em `src/memory/sanitize.ts`.

---

## §11 — Resultado P7: Rotas CRM memory via Worker

**Prova:** endpoints `/crm/memory/*` operacionais via `worker.fetch` com `X-CRM-Admin-Key`.

| Rota + método | Status HTTP | Assertion | Resultado |
|---|---|---|---|
| `GET /crm/memory/status` | 200 | `mode=in_memory`, invariantes presentes | PASS |
| `POST /crm/memory/event` | 201 | `ok=true`, `authorization` redigido, `clean_field` preservado | PASS |
| `POST /crm/memory/learning-candidate` | 201 | `status=draft` | PASS |
| `POST /crm/memory/learning-candidates/:id/decision` | 200 | `status=validated` | PASS |
| `GET /crm/memory/lead/:ref` | 200 | `count >= 1` | PASS |
| `GET /crm/memory/learning-candidates` | 200 | `count >= 1` | PASS |
| `GET /crm/memory/status` sem auth | 401 | bloqueio correto | PASS |

**Evidência:** 14 assertions PASS via worker.fetch — roteamento, auth, sanitização e persistência funcionam end-to-end.

---

## §12 — Resultado P8: Regressão soberana

**Prova:** rotas CRM existentes não expõem `reply_text`, `decide_stage` ou `fact_*` após PR-T8.13.

| Rota | reply_text | decide_stage | fact_ | Resultado |
|---|---|---|---|---|
| `/crm/health` | ausente | ausente | ausente | PASS |
| `/crm/leads` | ausente | ausente | ausente | PASS |
| `/crm/conversations` | ausente | ausente | ausente | PASS |
| `/crm/enova-ia/status` | ausente | ausente | ausente | PASS |
| `/crm/memory/status` | ausente | — | — | PASS |

**Evidência:** 13 assertions PASS — nenhuma rota CRM introduz dados proibidos.

---

## §13 — Resultado P9: Invariantes soberanas

**Prova:** `memoryInvariants()` e `getMemoryStatus()` confirmam invariantes; nenhum registro no store contém chaves `fact_*` ou `stage` em `details`.

| Invariante | Valor | Resultado |
|---|---|---|
| `can_create_fact` | `false` | PASS |
| `can_change_stage` | `false` | PASS |
| `can_promote_automatically` | `false` | PASS |
| `can_call_llm` | `false` | PASS |
| `can_send_outbound` | `false` | PASS |
| `sanitization_required` | `true` | PASS |
| `auto_promotion_disabled` | `true` | PASS |
| `auto_stage_change_disabled` | `true` | PASS |
| `auto_fact_creation_disabled` | `true` | PASS |
| Nenhum registro com `fact_*` | confirmado | PASS |
| Nenhum registro com `stage` | confirmado | PASS |
| `mode = in_memory` | confirmado | PASS |

---

## §14 — Regressão completa (suíte existente)

| Suite | Resultado |
|---|---|
| `npm run smoke:memory` | **17/17 PASS** |
| `npm run smoke:supabase` | 70/70 PASS |
| `npm run smoke:meta:webhook` | 20/20 PASS |
| `npm run smoke:meta` | 14/14 PASS |
| `npm run prove:crm-e2e` | 73/73 PASS |
| `npm run prove:meta-controlada` | 25 PASS / 0 FAIL / 6 SKIP (Meta bloqueada — correto) |
| `npm run smoke:all` | **EXIT 0** |
| `npm run prove:memory-telemetry` | **9/9 PASS** |

Todas as suítes retrocompatíveis. Nenhuma regressão introduzida por PR-T8.13 ou PR-T8.14.

---

## §15 — Limitações declaradas

1. **Persistência real**: store in-memory; reinício do Worker zera memória. Integração Supabase real fica para PR futura sob `MEMORY_SUPABASE_ENABLED`.
2. **Meta/WhatsApp bloqueada**: PR-T8.12B aguardando Vasques — secrets, deploy e webhook não provisionados.
3. **Regressão local**: testes executados em modo local/smoke sem Worker publicado; regressão de runtime real fica para PR-T8.15 (go-live).
4. **G8 não fechado**: esta PR não encerra T8. Próxima: PR-T8.15 (preparação final de flags/rollback/go-live).
5. **Aprendizado promovido não altera comportamento**: `promoted` é um status documental — não injeta regras em nenhum componente operacional.

---

## §16 — Veredito

| Critério | Resultado |
|---|---|
| P1–P9 provas | **9/9 PASS** |
| Regressão smoke:all | **EXIT 0** |
| Invariantes soberanas | **CONFIRMADAS** |
| Frente memória/telemetria | **APROVADA_LOCAL_IN_MEMORY** |
| G8 | **NÃO FECHADO** |
| Próxima PR | **PR-T8.15 — Preparação final flags/rollback/go-live** |
