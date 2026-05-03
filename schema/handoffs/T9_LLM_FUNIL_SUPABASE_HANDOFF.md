# Handoff T9 — LLM ↔ Funil ↔ Supabase ↔ Telemetria

**Tipo:** Handoff de sessão  
**Data:** 2026-05-03  
**Contrato:** `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`  
**Status contrato:** ABERTO — T9.1/T9.2/T9.3/T9.4/T9.5/T9.6-DIAG/T9.6-IMPL/T9.7/T9.8-DIAG/T9.8-IMPL/T9.9-DIAG/T9.9-IMPL/T9.10-DIAG/T9.10-IMPL/T9.11/T9.12-DIAG/T9.12-IMPL/T9.13-PROVA-PARCIAL CONCLUÍDAS; próxima: **T9.13B — Execução real da prova Supabase write em TEST por Vasques**

## T9.13-PROVA — Prova Supabase write real (state/leads) em TEST — PARCIAL (2026-05-03)

PR: `prove/t9.13-supabase-write-real-test` (PR #197 em aberto)

**Harness dual-mode instalado. Modo local 19/19 PASS. Modo TEST real SKIP — aguarda Vasques.**

**Arquivos:**
- `src/supabase/write-real-test-proof.ts` — script dual-mode P1–P9
- `package.json` — `prove:t9.13-supabase-write-real-test`
- `schema/proofs/T9_SUPABASE_WRITE_REAL_TEST_PROOF.md`

**Resultado:**
- Modo local: 19/19 PASS
- Modo TEST real: SKIP — `SUPABASE_WRITE_REAL_TEST_ENABLED` não setado

**Para Vasques executar a prova real:**
```
SUPABASE_WRITE_REAL_TEST_ENABLED=true
SUPABASE_REAL_ENABLED=true
SUPABASE_WRITE_ENABLED=true
SUPABASE_URL=<url>
SUPABASE_SERVICE_ROLE_KEY=<key>
npm run prove:t9.13-supabase-write-real-test
```

**Próxima:** T9.13B — Execução real da prova Supabase write em TEST por Vasques

---

## T9.12-IMPL — Supabase write real condicional (crm_leads/crm_lead_state) — CONCLUÍDA (2026-05-03)

PR: `feat/t9.12-supabase-write-real-state-leads` (#196)

**Escrita real habilitada somente para crm_leads→crm_lead_meta e crm_lead_state→enova_state. 39/39 PASS.**

**Arquivos alterados:**
- `src/supabase/client.ts` — `supabaseUpsert<T>()` adicionado; POST com `Prefer: resolution=merge-duplicates`; sem lançar em erro de rede; secrets nunca expostos
- `src/supabase/crm-store.ts` — `writeEnabled: boolean` (default `false`); `mapLeadToMeta`, `mapLeadStateToEnovaState`; `supabaseWriteLead/supabaseWriteLeadState`; `insert/update` condicional com fallback writeBuffer corrigido
- `src/crm/store.ts` — `getCrmBackend(env)` lê `SUPABASE_WRITE_ENABLED`; singleton invalidado se flag mudar
- `src/supabase/write-real-smoke.ts` — 11 seções (S1–S11), 39 checks

**Fallback do update() corrigido (T9.12-IMPL revisão):**
- Quando Supabase write falha e registro não existe no writeBuffer (veio só do Supabase real): `writeBuffer.insert(merged)` garante absorção do registro mesclado
- Lógica: tenta `writeBuffer.update` → se retornar null → `writeBuffer.insert(merged)` → retorna `merged`
- Seção S11 no smoke cobre o caminho de fallback completo (7 checks)

**Restrições preservadas:**
- Zero escrita para crm_turns, crm_facts (BLK-WRITE-02/04 — schema/destino não confirmados)
- Zero delete/reset
- Fallback garantido: writeBuffer absorve se Supabase falhar
- Secrets nunca em log/error/response

**Smokes:**
- smoke:supabase:write-real: 39/39 PASS
- smoke:supabase: 70/70 PASS
- smoke:runtime:env: 53/53 PASS
- smoke:runtime:fallback-guard: 41/41 PASS
- prove:g8-readiness: 7/7 PASS

**Próxima:** T9.13 — PROVA Supabase write real state/leads em TEST (Worker TEST com `SUPABASE_WRITE_ENABLED=true` + evidência de row em `crm_lead_meta` e `enova_state` no Supabase real)

---

## T9.12-DIAG — Diagnóstico Supabase write real — CONCLUÍDA (2026-05-02)

PR: `diag/t9.12-supabase-write-real` (#195)

**Diagnóstico completo da camada de escrita Supabase. 5 bloqueadores identificados (BLK-WRITE-01..05).**

**Bloqueadores:**
- BLK-WRITE-01: `SupabaseCrmBackend.insert/update` → writeBuffer, nunca Supabase (CRÍTICO)
- BLK-WRITE-02: `crm_turns`/`crm_facts` sem tabela Supabase mapeada (BLOQUEANTE PARCIAL)
- BLK-WRITE-03: `SUPABASE_WRITE_ENABLED` declarada mas desconectada do path de escrita (BLOQUEANTE)
- BLK-WRITE-04: sem migrations no repo — novas tabelas requerem DDL manual por Vasques (BLOQUEANTE PARCIAL)
- BLK-WRITE-05: `writeBuffer` volátil por-request — dados perdidos entre requests (CRÍTICO)

**Mapeamento pronto:** `crm_lead_state↔enova_state` e `crm_leads↔crm_lead_meta` (T8.9B)  
**Mecanismo disponível:** `supabaseInsert()` funcional em `src/supabase/client.ts`  
**Diferidos (aguardam Vasques):** `crm_turns→lead_timeline_events` (DDL), `crm_facts→?` (destino)

**Próxima:** T9.12 — IMPL Supabase write real (CRM/memória/stage)

---

## T9.11 — PROVA LLM usa contexto sem quebrar stage/guard — CONCLUÍDA (2026-05-02)

PR: `prove/t9.11-llm-context-guard`

**56/56 PASS. Frente LLM/funil (T9.8/T9.9/T9.10/T9.11) APROVADA.**

**Script:** `src/llm/context-guard-proof.ts` — 15 cenários (C1–C15)

**Soberania verificada:**
- Core decide stage (C2: stage_current ANTES de recent_turns; C13: stage inalterado pelo guard)
- Guard bloqueia aprovação/CPF/stage/secrets independente de recent_turns (C3/C5/C6/C7)
- Guard nunca inventa reply — replacement_used sempre false (C12)
- PII não chega ao prompt via sanitização prévia (C15)
- Retrocompatibilidade: sem recent_turns, sistema funciona igual (C9)

**Próxima:** T9.12 — IMPL Supabase write real (CRM/memória/stage)

---

## T9.10-IMPL — CONCLUÍDA (2026-05-02)

PR: `feat/t9.10-short-memory-context`

**Memória curta implementada e validada. 46/46 PASS. Soberania preservada.**

**Arquivos criados/alterados:**
- `src/meta/canary-pipeline.ts` — import `getLeadTimeline`, helper `sanitizeRecentTurnText`, `recentHistory` hoistado, Bloco [E], `recent_turns` no llmContext, `history_turns` no diagLog
- `src/llm/client.ts` — `buildDynamicSystemPrompt` renderiza `recent_turns` com rótulo auxiliar
- `src/llm/short-memory-context-smoke.ts` — smoke 46/46 PASS
- `package.json` — `"smoke:llm:short-memory-context"` adicionado

**Decisões técnicas:**
- Fonte: `getLeadTimeline` do CRM (não Memory Service, não Context Module)
- Janela: 3 turnos × 100 chars, excluir turno atual, role: 'user' only
- Sanitização: CPF → [cpf], email → [email], tel → [tel], links → [link], sk-/Bearer/sb- → [token]
- Exception em getLeadTimeline não bloqueia LLM nem outbound

---

## T9.10-DIAG — CONCLUÍDA (2026-05-02)

PR: `diag/t9.10-memoria-curta-contexto`

**Diagnóstico read-only confirmado. T9.10 viável com patch cirúrgico. Sem bloqueio real.**

**Achados principais:**
- `getLeadTimeline(backend, lead_id)` já existe em `src/crm/service.ts:147`
- `CrmTurn.raw_input_summary` = `text_body.slice(0, 200)` — primeira fatia do texto do usuário
- `LlmContext.recent_turns` já declarado em `client.ts:47` mas **nunca populado**
- `buildDynamicSystemPrompt` **não renderiza `recent_turns`** — precisa ser atualizado
- Ponto de integração: Bloco [E] no Passo 1.5 de `canary-pipeline.ts`, após `cachedFacts = factsMap`
- Fonte: CRM timeline (não Memory Service, não Context Module)
- Janela: 3 turnos × 100 chars, excluir turno atual, role: 'user' only
- Sanitização obrigatória: CPF, email, tel, links, tokens
- Context Module (`living-memory.ts`) existe mas não está conectado ao runtime — não usar em T9.10

**Documento criado:** `schema/diagnostics/T9_SHORT_MEMORY_CONTEXT_DIAG.md`

---

## T9.9-IMPL — CONCLUÍDA (2026-05-02)

PR: #191 — `feat/t9.9-output-guard`

**Output Guard implementado e validado. Soberania preservada — LLM gera a fala, Guard apenas valida segurança, Core decide stage, adapter nunca inventa resposta.**

**Arquivos criados/alterados:**
- `src/llm/output-guard.ts` — módulo puro, sem I/O, zero deps externas
- `src/llm/output-guard-smoke.ts` — smoke 48/48 PASS
- `src/meta/canary-pipeline.ts` — `applyOutputGuard` integrado antes de `replyText` virar outbound
- `package.json` — `"smoke:llm:output-guard"` adicionado

**Bloqueios críticos (BLOCK):**
- promessa de aprovação (ex: "você está aprovado", "crédito aprovado")
- garantia de financiamento
- stage interno exposto (ex: "stage 3", "estágio interno")
- IDs internos (leadId, whatsappId, UUIDs)
- CPF ou dados pessoais brutos
- secrets/tokens
- texto vazio ou apenas whitespace

**Avisos não bloqueantes (WARN):**
- texto longo (>800 chars) — warn `text_too_long`, outbound não bloqueado
- pedido de documento fora de stage — warn `document_request_out_of_stage`, outbound não bloqueado

**Comportamento de bloqueio:**
- Se o guard bloquear → `replyText` permanece `undefined` → outbound para via `reply_text_missing`
- `replacement_used` sempre `false` — adapter nunca inventa fallback
- Guard nunca gera resposta substituta

**Anti-falso-positivo:**
- Negação detectada em prefixo de 50 chars: "não posso dizer que você está aprovado" → allowed

**Resultados:**
| Smoke | Resultado |
|---|---|
| `smoke:llm:output-guard` | **48/48 PASS** |
| `smoke:llm:context` | 30/30 PASS |
| `smoke:meta:canary` | 41/41 PASS |
| `smoke:meta:core-pipeline` | 23/23 PASS |
| `prove:t9.7-facts-stage-advance` | 44/44 PASS |
| `prove:t9.5-stage-persistence` | 58/58 PASS |
| `smoke:runtime:env` | 53/53 PASS |
| `smoke:runtime:fallback-guard` | 41/41 PASS |
| `prove:g8-readiness` | G8 APROVADO |

**G9 permanece aberto** — T9.10 é o próximo passo.

**Próxima ação autorizada: T9.10 — Memória curta / contexto histórico controlado**

---

## T9.9-DIAG — CONCLUÍDA (2026-05-02)

Branch: `diag/t9.9-output-guard`

**Veredito:** T9.9 viável com patch cirúrgico. Ponto de integração exato: entre L288→L289 de `canary-pipeline.ts` (após `if (llmResult.ok && llmResult.reply_text)`, antes de `replyText = llmResult.reply_text`). Zero src/ alterado neste DIAG.

**Achados chave:**
- Ponto de bloqueio natural: `replyText` permanece `undefined` se guard bloquear → outbound para via `'reply_text_missing'` sem código adicional
- Módulo a criar: `src/llm/output-guard.ts` — puro, sem I/O, zero deps
- 12 riscos mapeados; 7 patterns BLOCK; 2 WARN (longo, doc fora de hora)
- Anti-falso-positivo: regex de intenção (verbo+resultado), não presença de palavra
- Shape definido: `LlmOutputGuardResult { allowed, blocked, warned, reason_codes, safe_reply_text?, replacement_used }`
- Telemetria: `diagLog('llm.output_guard.result', ...)` sem texto, sem facts, sem secrets
- Fallback: ausência de resposta (replyText=undefined) — adapter não inventa fala

**Documento:** `schema/diagnostics/T9_OUTPUT_GUARD_DIAG.md` (17 seções)

---

## T9.8-IMPL — CONCLUÍDA (2026-05-02)

PR: #189 — `feat/t9.8-llmcontext-estruturado`

**BLK-04 RESOLVIDO:** `factsMap` estava escoped dentro do try block de Passo 1.5 — inacessível em Passo 2 (LLM). Fix: hoist para escopo externo como `cachedFacts`.

**Alterações cirúrgicas:**
- `src/llm/client.ts` — exporta `LlmContext` + `buildDynamicSystemPrompt` + `callLlm(msg, env, context?)`
- `src/meta/canary-pipeline.ts` — `cachedFacts` hoistado; `llmContext` montado + sanitizado; `llmCaller` recebe 3 args; `diagLog('llm.context.built', ...)`
- `src/llm/context-smoke.ts` — smoke novo **30/30 PASS**
- `package.json` — `"smoke:llm:context"` adicionado

**Decisão de segurança — shape `facts_summary` sanitizado (T9.8):**
A implementação usou `facts_summary` sanitizado em vez de `facts` bruto, combinado com `facts_count`, para evitar envio de `renda_principal` e `cpf` (valores brutos sensíveis) ao LLM. `renda_principal` e `cpf` são substituídos por `'informado(a)'`. Esta é uma decisão de segurança deliberada da T9.8: o LLM recebe o contexto suficiente para gerar a fala adequada ao stage, sem processar dados financeiros ou pessoais do lead. `diagLog` emite apenas contagens — zero texto do cliente, zero valor de fact, zero secret.

**Soberania preservada:**
- Core decide stage; LLM recebe contexto apenas para decidir a **fala**
- Prompt truncado a 4800 chars (≤1200 tokens)
- Terceiro parâmetro opcional — todas chamadas `callLlm(msg, env)` existentes sem alteração (retrocompatível)

**Resultados:**
| Smoke | Resultado |
|---|---|
| `smoke:llm:context` | **30/30 PASS** |
| `smoke:meta:canary` | 41/41 PASS |
| `smoke:meta:core-pipeline` | 23/23 PASS |
| `prove:t9.7-facts-stage-advance` | 44/44 PASS |
| `prove:t9.5-stage-persistence` | 58/58 PASS |
| `smoke:core:text-extractor` | PASS |
| `smoke:runtime:env` | 53/53 PASS |
| `smoke:runtime:fallback-guard` | 41/41 PASS |
| `prove:g8-readiness` | G8 APROVADO |

**G9 permanece aberto** — T9.9 (Output Guard) é o próximo passo.

**Próxima ação autorizada: T9.9 — Output Guard para respostas do LLM**

---

## T9.8-DIAG — CONCLUÍDA (2026-05-02)

Diagnóstico READ-ONLY para T9.8. `schema/diagnostics/T9_LLM_CONTEXT_DIAG.md` criado.

**Veredito:** T9.8 viável com patch cirúrgico. Dois arquivos `src/` a alterar.

**Achados críticos:**
- BLK-04 identificado: `factsMap` declarado dentro do try block de Passo 1.5 — não acessível no Passo 2 (LLM). Hoist necessário.
- `coreDecision` já no escopo externo — pronto para uso.
- `callLlm` atual: `callLlm(userMessage, env)` — cego ao stage, facts, objetivo.
- Estratégia: terceiro parâmetro opcional `context?: LlmContext` — compatibilidade total com chamadas atuais.
- `LlmContext` shape mínimo: `{ stage_current, stage_after, next_objective, block_advance, speech_intent, facts?, recent_history? }`.
- Histórico: `getLeadTimeline` já existe; usar `raw_input_summary ≤ 100 chars`, máx 3 turnos.
- Segurança: `diagLog` registra apenas contagens — prompt completo nunca logado.

**Archivos do T9.8:**
- `src/llm/client.ts` — exportar `LlmContext` + `buildDynamicSystemPrompt` + `context?`
- `src/meta/canary-pipeline.ts` — hoist `cachedFacts`; bloco [D]; `llmCaller(text, env, llmContext)`
- `src/llm/context-smoke.ts` — `smoke:llm:context` (mín. 12 checks)
- `package.json` — `"smoke:llm:context"` adicionado

**Próxima ação autorizada: T9.8 — IMPL LlmContext estruturado**

---

## T9.7 — CONCLUÍDA (2026-05-02)

Prova end-to-end confirmada: texto WhatsApp real → fact extraído → fact persistido (pending) → Core lê → stage avança.

**Arquivos:**
- `src/meta/facts-stage-advance-proof.ts` — `prove:t9.7-facts-stage-advance` **44/44 PASS**
- `package.json` — `"prove:t9.7-facts-stage-advance"` adicionado

**Cenários provados:**
| Cenário | Texto | Facts | Stage antes | Stage depois |
|---|---|---|---|---|
| A | "Quero comprar um imóvel pelo Minha Casa Minha Vida" | `customer_goal: 'comprar_imovel'` | `discovery` | `qualification_civil` ✓ |
| B | "Sou solteiro e vou comprar sozinho" | `estado_civil: 'solteiro'`, `processo: 'solo'` | `qualification_civil` | `qualification_renda` ✓ |
| C | "Trabalho CLT e ganho R$ 3.500" | `regime_trabalho: 'clt'`, `renda_principal: 3500` | `qualification_renda` | `qualification_eligibility` ✓ |
| D | "tá bom entendi" | `{}` (vazio) | `qualification_civil` | `qualification_civil` (sem regressão) ✓ |
| E | (segurança) | — | — | nenhum secret no output ✓ |

**Regressões:** `smoke:core:text-extractor` 58/58, `smoke:meta:core-pipeline` 23/23, `prove:t9.5-stage-persistence` 34/34, `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:runtime:fallback-guard` 41/41, `smoke:runtime:env` 53/53, `prove:g8-readiness` 7/7 PASS.

**Próxima ação autorizada: T9.8 — IMPL LlmContext estruturado**

## T9.6-IMPL — CONCLUÍDA (2026-05-02)

BLK-03 RESOLVIDO. Pipeline agora extrai facts do texto WhatsApp, persiste como `'pending'` e o Core os vê no mesmo turno.

**Arquivos:**
- `src/core/text-extractor.ts` — `extractFactsFromText(text, stage)` função pura (6 stages, 58 patterns)
- `src/meta/canary-pipeline.ts` — blocos [B]+[C] no Passo 1.5
- `src/core/text-extractor-smoke.ts` — `smoke:core:text-extractor` **58/58 PASS**
- `package.json` — `"smoke:core:text-extractor"` adicionado

**Regressões:** `smoke:meta:core-pipeline` 23/23, `prove:t9.5-stage-persistence` 34/34, `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:runtime:fallback-guard` 41/41, `smoke:runtime:env` 53/53, `prove:g8-readiness` 7/7 PASS.

**Próxima ação autorizada: T9.7 — PROVA facts extraídos e stage avança**

### O que T9.7 deve fazer
1. Prova end-to-end: lead envia texto com facts → `extractFactsFromText` extrai → `writeLeadFact` persiste → Core lê → stage avança de `discovery` para `qualification_civil`
2. Verificar `state_version` incrementa corretamente após avanço
3. Verificar `stage_at_turn` reflete stage correto (já validado em T9.5 mas agora com facts reais)
4. Verificar facts `'pending'` aparecem em `getLeadFacts`
5. Regressões: `smoke:core:text-extractor` 58/58, `smoke:meta:core-pipeline` 23/23, `prove:t9.5-stage-persistence` 34/34

### O que T9.7 NÃO deve fazer
- NÃO alterar `callLlm` (T9.8)
- NÃO alterar `text-extractor.ts` (a não ser correção de bug comprovada por T9.7)
- NÃO ativar Supabase write real (T9.11)
- NÃO fechar G9

---

## T9.6-DIAG — CONCLUÍDA (2026-05-02)

DIAG READ-ONLY extração de facts do texto WhatsApp real. `schema/diagnostics/T9_FACTS_TEXTO_REAL_DIAG.md` criado (16 seções).

**Achados principais:**
- BLK-03 localizado: `facts_extracted: {}` em todos os 9 caminhos do Core (`engine.ts`)
- Mapa completo de 25 fact_keys canônicos por stage/parser (L04–L17) documentado
- `writeLeadFact` já existe em `service.ts` e está operacional
- Estratégia: extrator heurístico `extractFactsFromText(text, stage)` → `writeLeadFact` → `getLeadFacts` → `runCoreEngine` (mesmo turno)
- Ponto de inserção: Passo 1.5 em `canary-pipeline.ts`, blocos [B]+[C] entre leitura de estado e leitura de facts
- `callLlm` intocado (T9.8); `runCoreEngine` intocado; zero mudança de interface
- Complexidade baixa; veredito: VIÁVEL

**Próxima ação autorizada: T9.6 IMPL — extrator heurístico + persistência no Passo 1.5**

### O que T9.6 IMPL deve fazer
1. Criar `src/core/text-extractor.ts` — função pura `extractFactsFromText(text: string, stage: StageId): Record<string, unknown>`
2. Modificar `src/meta/canary-pipeline.ts` — adicionar blocos [B]+[C] no Passo 1.5 (dentro do try/catch existente)
3. Criar `src/core/text-extractor-smoke.ts` — `smoke:core:text-extractor` (mínimo 20 checks)
4. Atualizar `package.json` com `"smoke:core:text-extractor"`
5. Regressões: `smoke:meta:core-pipeline` 23/23, `smoke:meta:canary` 41/41, `prove:t9.5-stage-persistence` 34/34

### O que T9.6 IMPL NÃO deve fazer
- NÃO alterar `callLlm` (T9.8)
- NÃO alterar `runCoreEngine` ou assinaturas de parsers
- NÃO alterar `writeLeadFact` ou `getLeadFacts`
- NÃO ativar Supabase write real (T9.11)
- NÃO alterar outbound, webhook, HMAC
- NÃO fechar G9

---

## T9.5 — CONCLUÍDA (2026-05-02)

Prova `stage_current` persiste entre turnos: 5 cenários, **34/34 PASS**. Lead novo (C1–C2), lead com stage avançado (C3), resiliência a exceção (C4), sem secrets (C5). Zero bugs na T9.4. `prove:t9.5-stage-persistence` adicionado ao `package.json`.

**Próxima ação autorizada foi: T9.6-DIAG → T9.6 IMPL**

### O que T9.6 deve fazer
1. Conectar a extração de facts do texto WhatsApp real aos parsers L04–L17
2. `callLlm` deve retornar `facts_extracted` além de `reply_text` (ou pipeline extrai facts separadamente)
3. Facts extraídos devem ser persistidos via `writeLeadFact` no CRM
4. Core recebe `facts_current` atualizado com facts do turno anterior
5. Regressões: smoke:meta:core-pipeline 23/23, smoke:meta:canary 41/41, prove:t9.5-stage-persistence 34/34

### O que T9.6 NÃO deve fazer
- NÃO alterar LlmContext estruturado (T9.8)
- NÃO ativar Supabase write real (T9.11)
- NÃO alterar outbound/webhook/HMAC
- NÃO fechar G9

---

## T9.4 — CONCLUÍDA (2026-05-02)

Passo 1.5 adicionado ao `canary-pipeline.ts`: lê estado CRM → chama `runCoreEngine` → persiste `stage_after` via `upsertLeadState`. `stage_at_turn` em `createConversationTurn` corrigido (não mais `'unknown'`). `smoke:meta:core-pipeline` **23/23 PASS**. BLK-01 e BLK-02 RESOLVIDOS.

**Próxima ação autorizada: T9.5 — PROVA stage_current persiste entre turnos**

### O que T9.5 deve fazer
1. Criar smoke/prova que verifica: lead recebe 2+ mensagens → `stage_current` do CRM persiste entre turnos (não reseta para `'discovery'` em cada turno)
2. Verificar que `state_version` incrementa a cada turno
3. Verificar que `stage_at_turn` no turno reflete o stage no momento da mensagem
4. Regressões: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:meta:core-pipeline` 23/23, `prove:g8-readiness` 7/7

### O que T9.5 NÃO deve fazer
- NÃO alterar `callLlm` (T9.8)
- NÃO habilitar facts extraction de raw_text (T9.6)
- NÃO ativar Supabase write real (T9.11)
- NÃO alterar outbound/webhook

---

## T9.3 — CONCLUÍDA (2026-05-02)

Diagnóstico read-only `schema/diagnostics/T9_CORE_PIPELINE_INTEGRACAO_DIAG.md` criado.

**Veredito:** T9.4 viável com patch cirúrgico — sem bloqueio estrutural.

**Achados principais:**
- `runCoreEngine(state: LeadState): CoreDecision` — síncrono, sem I/O externo
- Input mínimo: `{ lead_id, current_stage: StageId, facts: Record<string, unknown> }`
- Output: `{ stage_after, next_objective, block_advance, speech_intent, decision_id, ... }`
- Parsers L04–L17 usam `facts_current` (já no CRM), **não raw_text** diretamente
- Ponto de integração: `canary-pipeline.ts` entre Passo 1 (CRM) e Passo 2 (LLM)
- `stage_at_turn: 'unknown'` — bug a corrigir em T9.4
- `upsertLeadState` não existe em `service.ts` — T9.4 precisa criar
- Default seguro: `stage_current = 'unknown'` → `'discovery'`

**Próxima ação autorizada: T9.4 — IMPL chamada runCoreEngine no canary-pipeline**

### O que T9.4 deve fazer
1. Criar `upsertLeadState(backend, lead_id, decision)` em `src/crm/service.ts`
2. Em `canary-pipeline.ts` Passo 1.5 (entre CRM e LLM): ler estado CRM → chamar `runCoreEngine` → persistir `stage_after`
3. Corrigir `stage_at_turn` em `createConversationTurn` para usar stage real (não `'unknown'`)
4. Criar `smoke:meta:core-pipeline` (8 checks mínimos documentados no DIAG)
5. Todas as regressões PASS: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `prove:g8-readiness` 7/7

### O que T9.4 NÃO deve fazer
- NÃO alterar `src/core/engine.ts` ou `src/core/types.ts`
- NÃO alterar `callLlm` (LlmContext é T9.8)
- NÃO habilitar facts extraction de raw_text (T9.6)
- NÃO ativar Supabase write real (T9.11)
- NÃO alterar outbound/webhook

---

## T9.2 — CONCLUÍDA (2026-05-02)

Fallback guard telemetria: `diagLog` com `reason: 'flag_off' | 'envs_missing'`; `/crm/health` expõe `persistence_mode`; `/__admin__/go-live/health` expõe `supabase_runtime_active`; `smoke:runtime:fallback-guard` **39/39 PASS**. BLK-05 RESOLVIDO.

---

## T9.1 — CONCLUÍDA (2026-05-02)

`wrangler.toml` declarou 12 vars com defaults seguros (`false`/`0`) + 8 secrets documentados em comentário.  
`src/runtime/env-validator.ts` — 20 envs canônicas, `validateEnvs()`, `getPersistenceMode()`, nunca vaza valores.  
`src/runtime/env-smoke.ts` + `smoke:runtime:env` — **53/53 PASS**.  
Regressões: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `prove:g8-readiness` 7/7 PASS.

**Próxima ação autorizada: T9.2 — Fallback guard com telemetria explícita**

### O que T9.2 deve fazer
1. Em `src/crm/store.ts` (`getCrmBackend`): emitir `diagLog` quando cai em `CrmInMemoryBackend` silenciosamente
2. Em `/crm/health`: expor `persistence_mode: 'in_memory' | 'supabase_read_only' | 'supabase_full'` (usar `getPersistenceMode` de `src/runtime/env-validator.ts`)
3. Em `/__admin__/go-live/health`: adicionar `supabase_runtime_active: boolean`
4. Mesmo padrão para `getMemoryStore(env)` quando `MEMORY_SUPABASE_ENABLED === false`
5. Smoke `smoke:runtime:fallback-guard` — verifica fallback emite telemetria e health reporta modo

### O que T9.2 NÃO deve fazer
- NÃO habilitar Supabase real
- NÃO alterar pipeline WhatsApp
- NÃO alterar Core/funil
- NÃO alterar LLM

---

## Estado atual (início de T9)

### O que está funcionando em PROD (não mexer)
- Webhook Meta + assinatura HMAC + parser + dedupe (`src/meta/webhook.ts`)
- Pipeline canary completo: CRM upsert + memória + LLM + outbound (`src/meta/canary-pipeline.ts`)
- Outbound real com `external_dispatch=true` via `CLIENT_REAL_ENABLED=true`
- LLM `gpt-4o-mini` respondendo humanamente
- `ROLLBACK_FLAG=true` soberano — bloqueia tudo em segundos
- Smokes: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `prove:g8-readiness` 7/7

### O que não está funcionando (a resolver em T9)
- LLM cego ao funil — recebe só `text_body`, sem stage/facts/históriço/regras
- `runCoreEngine` **não é chamado** pelo pipeline WhatsApp (BLK-01)
- `CrmLeadState.stage_current` nunca é escrito em runtime real — literal `'unknown'` (BLK-02)
- Parsers L04–L17 nunca recebem texto WhatsApp real (BLK-03)
- Supabase silenciosamente desligado em PROD — fallback in-memory sem log (BLK-05)
- `wrangler.toml` zero bindings declarados (BLK-06)
- Memória/CRM/override perdem tudo no restart

---

## Próxima ação autorizada

**T9.1 — Supabase runtime/env readiness**

Branch sugerido: `feat/t9.1-wrangler-env-bindings`

### O que T9.1 deve fazer
1. Adicionar bloco `[vars]` em `wrangler.toml` com placeholders (sem valores):
   ```toml
   [vars]
   SUPABASE_REAL_ENABLED = "false"
   LLM_REAL_ENABLED = "false"
   CLIENT_REAL_ENABLED = "false"
   ENOVA2_ENABLED = "false"
   MEMORY_SUPABASE_ENABLED = "false"
   ROLLBACK_FLAG = "false"
   MAINTENANCE_MODE = "false"
   GOLIVE_HARNESS_ENABLED = "false"
   OUTBOUND_CANARY_ENABLED = "false"
   OUTBOUND_CANARY_WA_ID = ""
   CANARY_PERCENT = "0"
   ```
2. Adicionar comentário documentando secrets (via `wrangler secret put`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `OPENAI_API_KEY`, `CRM_ADMIN_KEY`
3. Criar `src/runtime/env-validator.ts` — lista canônica de envs esperadas com defaults seguros
4. Criar `smoke:runtime:env` — verifica que envs conhecidas têm defaults ou são reportadas em health
5. Atualizar STATUS + LATEST

### O que T9.1 NÃO deve fazer
- NÃO alterar valores de secrets em PROD (apenas estrutura declarativa)
- NÃO habilitar Supabase real (isso vem em T9.11)
- NÃO mexer em pipeline, LLM, Core, outbound, webhook

---

## Sequência de frentes

```
T9.0 (contrato) ─→ T9.1 (wrangler) ─→ T9.2 (fallback guard)
                └─→ T9.3 (DIAG Core) ─→ T9.4 (plug Core) ─→ T9.5 (PROVA stage)
                                                            ─→ T9.6 (parsers) ─→ T9.7 (PROVA facts)
                                                                                ─→ T9.8 (LlmContext)
                                                                                   ─→ T9.9 (output guard)
                                                                                      ─→ T9.10 (PROVA 5 turnos)
                T9.2 + T9.5 ──────────────────────────────────────────────────────────→ T9.11 (Supabase write)
                                                                                           ─→ T9.12 (PROVA restart)
                T9.10 ──────────────────────────────────────────────────────────────────→ T9.13 (telemetria)
                T9.12 + T9.13 ──────────────────────────────────────────────────────────→ T9.R (G9)
```

---

## Arquivos-chave para T9.1–T9.4

| Arquivo | Relevância |
|---|---|
| `wrangler.toml` | Zero bindings hoje — T9.1 resolve |
| `src/crm/store.ts:113-130` | `getCrmBackend()` — fallback silencioso — T9.2 resolve |
| `src/meta/canary-pipeline.ts` | Pipeline WhatsApp — T9.4 plugará Core aqui |
| `src/core/engine.ts` | `runCoreEngine(state: LeadState): CoreDecision` — T9.3 mapeia; T9.4 conecta |
| `src/core/types.ts` | `StageId`, `CoreDecision`, `LeadState`, `GateId` — ler antes de T9.3 |
| `src/llm/client.ts` | `callLlm(string, env)` — T9.8 atualiza para `callLlm(LlmContext, env)` |
| `src/context/living-memory.ts` | Existe mas não é usado — candidato para T9.8 |

---

## Decisões pendentes para Vasques

### A. Persistência Supabase real é pré-condição de T9?
- **Opção 1** (mais seguro, mais lento): T9 inteira exige Supabase real ativo. Stage nunca efêmero.
- **Opção 2** (recomendada): T9 conecta LLM↔funil em in-memory primeiro. Supabase real vem em T9.11. Canary controlado para `OUTBOUND_CANARY_WA_ID` até lá.

### B. Output guard LLM: hard-fail ou soft-fail?
- **Hard-fail** (recomendado): promessa de aprovação MCMV → outbound bloqueado + alert para Vasques.
- **Soft-fail**: outbound envia, mas `learning_candidate` cria rascunho de objeção.

### C. Quanto contexto histórico passar ao LLM?
- **Recomendação**: 3 últimos turnos brutos + facts atuais + stage + `next_objective`. Ajustar com smoke real.

---

## Invariantes que nunca podem ser tocados

| Invariante | Onde |
|---|---|
| `ROLLBACK_FLAG=true` bloqueia tudo | `canary-pipeline.ts:158-162,229-231` |
| `CLIENT_REAL_ENABLED=true` exigido para outbound amplo | `canary-pipeline.ts:233-240` |
| LLM nunca decide stage | invariante doutrinária + output guard |
| Mecânico nunca gera fala | invariante doutrinária |
| Secrets nunca em log/error/response | `src/memory/sanitize.ts` |
| `META_APP_SECRET` valida assinatura ANTES de parse | `webhook.ts:174-201` |
| G8 frente WhatsApp APROVADO — intocável | `prove:g8-readiness` 7/7 |

---

## Critério final (G9)

G9 fecha quando os 10 critérios G9-01..G9-10 tiverem evidência real.
O mais difícil e mais importante: **G9-03** (conversa real 3+ stages) e **G9-10** (Vasques confirma 5 conversas reais).

Detalhamento completo: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` §5.
