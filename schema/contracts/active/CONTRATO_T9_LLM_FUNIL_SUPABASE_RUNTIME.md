# Contrato T9 — Integração LLM ↔ Funil Mecânico ↔ Supabase Real ↔ Telemetria

**Tipo:** PR-DOC / Contrato executivo  
**Data abertura:** 2026-05-01  
**Branch:** `docs/t9-contrato-llm-funil-supabase-runtime`  
**Base:** PR #177 (PR-DIAG LLM-FUNIL-SISTEMA-INTEIRO-READONLY, mergeada)  
**Contrato anterior:** T8 — frente WhatsApp PROD APROVADA (G8 APROVADO 2026-05-01)

---

## 1. Objetivo macro

Fazer a Enova 2 girar em **sincronia completa**: entender o lead, saber o stage, aplicar as regras MCMV, persistir em banco real, avançar stages de forma mecânica, responder humanamente via LLM e continuar do ponto certo depois de qualquer restart.

**Estado atual (problema):** WhatsApp PROD responde, mas o LLM e o funil mecânico são dois sistemas paralelos que nunca conversam em runtime. O LLM gera fala sem saber stage, facts ou histórico. O funil mecânico decide stages corretamente, mas só roda via rota técnica isolada. A persistência Supabase está silenciosamente desligada em PROD — tudo vai para in-memory e é perdido no restart.

**Estado alvo (solução):** Cada mensagem WhatsApp real percorre o pipeline completo:
1. `canary-pipeline.ts` chama `runCoreEngine` com estado atual do lead
2. Core mecânico extrai facts via parsers L04–L17 e decide `stage_after` + `next_objective`
3. LLM recebe `LlmContext` estruturado (stage, facts, histórico, regras MCMV)
4. Output guard valida reply antes do outbound
5. Estado é persistido em Supabase real (`enova_state`, `crm_lead_meta`)
6. Telemetria correlaciona wa_id → lead_id → core_decision_id → llm_call_id → outbound_id

---

## 2. Regra soberana (bloco inviolável)

As regras abaixo não podem ser alteradas por nenhuma PR deste contrato. Qualquer PR que viole qualquer uma é automaticamente vetada.

```
REGRA SOBERANA T9:

1. LLM não decide stage.         Mecânico decide. LLM recebe stage já resolvido.
2. LLM não aprova financiamento. Output guard bloqueia antes do outbound.
3. LLM não altera regra MCMV.   System prompt + guard impedem.
4. LLM não gera facts.           Facts vêm dos parsers L04-L17.
5. ROLLBACK_FLAG=true permanece soberano. Bloqueia tudo em segundos.
6. CLIENT_REAL_ENABLED=true continua exigido para outbound amplo.
7. Mecânico nunca gera fala.     Mecânico decide; LLM fala.
8. Secrets nunca em log/error/response.
9. META_APP_SECRET valida assinatura ANTES de qualquer parse.
10. Frente WhatsApp T8/G8 não pode ser revertida.
```

---

## 3. Arquitetura alvo

```
POST /__meta__/webhook
       │
       ↓
  webhook.ts (signature HMAC — inalterado)
       │
       ↓
  canary-pipeline.ts (orquestrador principal)
       │
       ├──→ pipeline.ts
       │     └─ upsertLeadByPhone(wa_id) → lead_id
       │     └─ createConversationTurn(lead_id, raw_text)
       │     └─ registerMemoryEvent(attendance_memory)
       │     └─ readLeadState(lead_id) → CrmLeadState
       │     └─ readRecentTurns(lead_id, n=5)
       │
       ├──→ src/core/engine.ts (runCoreEngine) [NOVO — T9.4]
       │     └─ extract*Signals(stage_current, raw_text) via L04-L17
       │     └─ evaluate*Criteria → CoreDecision
       │         (stage_after, next_objective, gates_activated, speech_intent)
       │     └─ persist CrmLeadState.stage_current → Supabase
       │
       ├──→ src/llm/client.ts (callLlm com LlmContext) [NOVO — T9.8]
       │     └─ LlmContext {
       │           stage: 'qualification_civil',
       │           next_objective: 'coletar_estado_civil',
       │           speech_intent: 'coleta_dado',
       │           recent_turns: Turn[],
       │           facts: Record<string,unknown>,
       │           rules: ['mcmv_no_promise','mcmv_no_approval']
       │        }
       │
       ├──→ src/llm/output-guard.ts [NOVO — T9.9]
       │     └─ validateReply(stage, decision, reply_text)
       │     └─ hard-fail: promessa de aprovação → fallback + alert
       │     └─ soft-fail: mudança de assunto → learning_candidate
       │
       └──→ outbound.ts (mantém gates atuais — inalterado)

Persistência real (após T9.11):
  ✅ Supabase crm_lead_meta, enova_state, crm_override_log
  ✅ SUPABASE_REAL_ENABLED=true + URL + SERVICE_ROLE_KEY

Telemetria (após T9.13):
  ✅ correlation_id em todo log
  ✅ wa_message_id → lead_id → core_decision_id → llm_call_id → outbound_id
```

---

## 4. Ordem de execução obrigatória

As PRs abaixo devem ser executadas na ordem declarada. Nenhuma PR-IMPL começa sem PR-DIAG da mesma frente. Nenhuma frente fecha sem PR-PROVA.

| Ordem | PR | Tipo | Frente | Depende de |
|---|---|---|---|---|
| 1 | **T9.0** — Este contrato | DOC | governança | — |
| 2 | **T9.1** — Supabase runtime/env readiness | IMPL | runtime | T9.0 |
| 3 | **T9.2** — Fallback guard com telemetria explícita | IMPL | runtime | T9.1 |
| 4 | **T9.3** — DIAG integração Core ↔ pipeline | DIAG | funil | T9.0 |
| 5 | **T9.4** — IMPL chamada runCoreEngine no canary-pipeline | IMPL | funil | T9.3 |
| 6 | **T9.5** — PROVA stage_current persiste entre turnos | PROVA | funil | T9.4 |
| 7 | **T9.6** — IMPL parsers L04–L17 chamados com texto real | IMPL | funil | T9.5 |
| 8 | **T9.7** — PROVA facts extraídos e stage avança | PROVA | funil | T9.6 |
| 9 | **T9.8** — IMPL LLM recebe LlmContext estruturado | IMPL | LLM | T9.7 |
| 10 | **T9.9** — IMPL output guard LLM | IMPL | LLM | T9.8 |
| 11 | **T9.10** — PROVA conversa real 5+ turnos com Vasques | PROVA | LLM/funil | T9.9 |
| 12 | **T9.11** — IMPL Supabase write real (CRM/memória/stage) | IMPL | persistência | T9.2, T9.5 |
| 13 | **T9.12** — PROVA persistência sobrevive restart | PROVA | persistência | T9.11 |
| 14 | **T9.13** — IMPL telemetria ponta-a-ponta (correlation_id) | IMPL | observabilidade | T9.10 |
| 15 | **T9.R** — Closeout G9 frente Funil-LLM-Persistência | CLOSEOUT | governança | T9.12, T9.13 |

---

## 5. Critérios de aceite G9

A frente Funil-LLM-Persistência só é encerrada quando todos os 10 critérios abaixo forem cumpridos com evidência real:

| # | Critério | Evidência exigida |
|---|---|---|
| G9-01 | PROD `nv-enova-2` chama `runCoreEngine` para cada inbound `message` | Log `wrangler tail` mostrando `core.run` |
| G9-02 | `CrmLeadState.stage_current` é gravado em Supabase real após cada turno | Leitura Supabase pós-turno retorna stage correto |
| G9-03 | Conversa real avança de `discovery` → `qualification_civil` → `qualification_renda` em ≥3 turnos com Vasques | Screenshot/log da conversa |
| G9-04 | Restart do Worker preserva stage e memória (sem perda) | Deploy → restart → nova msg → stage correto |
| G9-05 | Output guard bloqueia tentativa de promessa de aprovação em smoke controlado | `prove:output-guard` PASS |
| G9-06 | LLM recebe `LlmContext` estruturado (stage + facts + histórico) em todo outbound | Log `llm.context.sent` visível em `wrangler tail` |
| G9-07 | Parsers L04–L17 extraem facts do texto WhatsApp real | `enova_state.facts` não vazio após turno real |
| G9-08 | Supabase real ativo em PROD (`SUPABASE_REAL_ENABLED=true` + envs setadas) | `/crm/health` retorna `persistence_mode: 'supabase_full'` |
| G9-09 | Trace ponta-a-ponta visível com `correlation_id` único em `wrangler tail` | Log correlacionando wa_id → outbound_id |
| G9-10 | Vasques confirma fluxo natural em ≥5 conversas reais | Confirmação verbal + log de evidência |

---

## 6. Bloqueantes identificados (da PR-DIAG #177)

Estes 6 bloqueantes foram identificados no diagnóstico e devem ser resolvidos no T9:

| ID | Descrição | Resolvido por |
|---|---|---|
| BLK-01 | Pipeline WhatsApp não chama `runCoreEngine` | T9.4 |
| BLK-02 | `CrmLeadState.stage_current` nunca escrito em runtime real | T9.4 + T9.11 |
| BLK-03 | Parsers L04–L17 nunca recebem texto WhatsApp real | T9.6 |
| BLK-04 | LLM recebe apenas texto cru sem contexto estruturado | T9.8 |
| BLK-05 | Persistência Supabase silenciosamente desligada em PROD | T9.1 + T9.2 + T9.11 |
| BLK-06 | `wrangler.toml` sem bindings declarados | T9.1 |

---

## 7. Opcionais (não mexer agora)

Os itens abaixo **não são parte do T9**. São melhorias futuras. Nenhuma PR do T9 deve tocar nestes itens.

- **Memória em Supabase:** `MemoryStore` permanece in-memory FIFO 5000. Integração Supabase é PR futura.
- **Resumo automático de histórico:** LLM compactando histórico de turnos é PR futura.
- **KV distribuído para dedupe:** Dedupe in-memory (FIFO 1000) é aceitável por ora.
- **RLS e políticas de storage:** Fora do escopo T9.
- **Frontend painel (estágios, facts):** Visualização de stages no painel é PR futura.

---

## 8. Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Stage perdido no restart (antes de T9.11) | ALTA | Canary controlado; `OUTBOUND_CANARY_WA_ID` limita impacto |
| Lead duplicado entre instâncias paralelas do Worker | ALTA | `upsertLeadByPhone` idempotente; Supabase com constraint |
| Output guard hard-fail bloqueando conversa legítima | MÉDIA | Smoke controlado antes de ampliar; tuning iterativo |
| Supabase write introduzindo latência | MÉDIA | Escrita async com timeout; fallback in-memory se timeout |
| Parsers L04–L17 interpretando texto informal incorretamente | MÉDIA | Smoke com texto real; ajuste iterativo; não bloqueia LLM |
| `ROLLBACK_FLAG=true` necessário durante migração | BAIXA | Flag já operacional; rollback em segundos |

---

## 9. Regras de execução

1. **1 PR = 1 objetivo.** Nenhuma PR mistura IMPL de frentes diferentes.
2. **Toda PR precisa de smoke.** PR sem smoke não fecha.
3. **Toda PR-IMPL precisa de PR-DIAG anterior da mesma frente.** Sem diagnóstico, sem implementação.
4. **Toda frente precisa de PR-PROVA.** Sem prova, sem fechamento de frente.
5. **Frente WhatsApp T8/G8 APROVADA é intocável.** Nenhuma PR desfaz outbound real, HMAC, challenge, CLIENT_REAL_ENABLED gate.
6. **Smoke ponta-a-ponta com Vasques antes de fechar G9.** Critério G9-10.
7. **Supabase write real ativo ANTES de fechar G9.** Critério G9-08.
8. **Output guard LLM ativo ANTES de fechar G9.** Critério G9-05.
9. **PR-DIAG cria documentos; PR-IMPL cria código; PR-PROVA executa evidência.** Tipos não são intercambiáveis.
10. **STATUS e LATEST são atualizados em toda PR.** Sem atualização, a PR está incompleta.

---

## 10. Referências

- Diagnóstico principal: `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md`
- Mapa de conexões: `schema/diagnostics/LLM_FUNIL_MAPA_CONEXOES.md`
- Diagnóstico Supabase: `schema/diagnostics/SUPABASE_RUNTIME_READINESS.md`
- Handoff próximo contrato: `schema/handoffs/LLM_FUNIL_NEXT_CONTRACT_HANDOFF.md`
- Closeout T8: `schema/proofs/T8_G8_WHATSAPP_PROD_CLOSEOUT.md`
- Contrato T8 (arquivo): `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T8.md`
- Adendo soberania IA: `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
- Adendo soberania LLM MCMV: `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`

---

## Resumo em uma linha

**A Enova 2 responde WhatsApp, mas o LLM e o funil são dois sistemas paralelos que nunca conversam — T9 conecta eles, faz Supabase real funcionar de verdade e dá ao LLM o contexto completo para cada conversa.**
