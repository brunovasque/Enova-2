# T9.15B — Prova Real Canary: Descida de Funil Enova em WhatsApp PROD Controlado

**Tipo**: PR-PROVA / contratual — frente T9  
**Branch**: `prove/t9.15b-real-canary-funnel`  
**Contrato ativo**: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`  
**PR anterior**: T9.15-PROVA (PR #229) — write/read/restart lógico 44/44 PASS; G9-02/G9-04 provados logicamente  
**Data**: 2026-05-04  

---

## 1. Contexto herdado

### 1.1 O que T9.15-PROVA provou (lógico)

| Prova | Resultado |
|-------|-----------|
| Bloco A — write path (`mapStageCurrentToFaseConversa`) 12 checks | ✅ 12/12 PASS |
| Bloco B — read path (`mapFaseConversaToStageCurrent`) 11 checks | ✅ 11/11 PASS |
| Bloco C — round-trip bidirecional 9 checks | ✅ 9/9 PASS |
| Bloco D — restart lógico simulando rows `enova_state` 8 checks | ✅ 8/8 PASS |
| Bloco E — `SupabaseCrmBackend` local writeBuffer 4 checks | ✅ 4/4 PASS |
| Bloco F — Supabase real | ⚠️ SKIP controlado — exige envs reais |

### 1.2 O que T9.15-PROVA NÃO provou

| Item não provado | Motivo |
|-----------------|--------|
| WhatsApp real chega no Worker | Não há WhatsApp test fora de PROD |
| `runCoreEngine` roda no pipeline real de produção | Requer conversa real |
| LLM responde com contexto de stage | Requer conversa real |
| Output guard roda antes do outbound | Requer conversa real |
| Supabase registra estado útil em conversa real | Bloco F não executado |
| Stage avança em conversa real multi-turno (≥3 turnos) | Requer conversa real — G9-03 |
| Facts extraídos do texto WhatsApp real | Requer conversa real — G9-07 |
| Telemetria correlaciona wa_id/correlation_id/turn/stage | Requer conversa real — G9-09 |
| Vasques confirma conversa real ≥5 turnos | Requer ação Vasques — G9-10 |

### 1.3 Distinção T10 vs T9.15 vs T9.15B

| Frente/Prova | O que provou | O que NÃO prova |
|-------------|--------------|-----------------|
| T10 | Painel/CRM/enova_log/health/thread real | Descida de funil T9, stages MCMV, multi-turno |
| T9.15 | Write/read/restart lógico do mapper | WhatsApp real, conversa real multi-turno |
| **T9.15B** | **Roteiro canary para conversa real multi-turno** | G9 não é fechado automaticamente |

---

## 2. Objetivo desta PR

Criar o **roteiro operacional completo** para que Vasques execute a prova real canary da descida de funil Enova em WhatsApp PROD controlado — **sem liberar cliente real geral, sem alterar flags, sem automatizar envio WhatsApp**.

A execução real será feita por Vasques no WhatsApp canary. Esta PR prepara e documenta os critérios, o roteiro, os comandos seguros e o checklist de validação.

---

## 3. Pré-condições obrigatórias antes da execução

Vasques deve confirmar TODOS os itens abaixo antes de iniciar a conversa canary:

### 3.1 Flags de ambiente (Worker PROD `nv-enova-2`)

```
Obrigatório ON:
  LLM_REAL_ENABLED        = "true"     → LLM real ativo
  OUTBOUND_CANARY_ENABLED  = "true"     → outbound para canary wa_id
  OUTBOUND_CANARY_WA_ID    = "<seu wa_id>" → número canary autorizado
  SUPABASE_REAL_ENABLED    = "true"     → leitura Supabase real ativa
  SUPABASE_WRITE_ENABLED   = "true"     → escrita Supabase real ativa

Obrigatório OFF / não alterar:
  CLIENT_REAL_ENABLED      = "false"    → NÃO liberar para qualquer wa_id
  ROLLBACK_FLAG            = "false"    → NÃO ativar rollback
  MAINTENANCE_MODE         = "false"    → NÃO ativar manutenção
```

> **ATENÇÃO**: `CLIENT_REAL_ENABLED` deve permanecer `false`. Apenas `OUTBOUND_CANARY_WA_ID` recebe respostas.

### 3.2 Health check pré-prova

Vasques deve verificar:

```bash
# 1. Worker health (com SUPABASE_REAL_ENABLED=true esperado no retorno)
curl https://nv-enova-2.<worker-domain>.workers.dev/__admin__/go-live/health \
  -H "X-CRM-Admin-Key: <CRM_ADMIN_KEY>"

# Retorno esperado:
# { "worker_ready": true, "supabase_runtime_active": true, ... }

# 2. CRM persistence mode
curl https://nv-enova-2.<worker-domain>.workers.dev/crm/health \
  -H "X-CRM-Admin-Key: <CRM_ADMIN_KEY>"

# Retorno esperado:
# { "persistence_mode": "supabase_full", ... }
```

Se `persistence_mode` não for `"supabase_full"`, parar — Supabase não está ativo.

### 3.3 Wrangler tail ativo

```bash
# Terminal 1 — abrir ANTES de iniciar a conversa
wrangler tail nv-enova-2 --format=json | tee t9-15b-canary-$(date +%Y%m%d-%H%M%S).log
```

Manter este terminal aberto durante toda a conversa.

---

## 4. Roteiro mínimo da conversa real canary

### 4.1 Objetivo do roteiro

Provar que a descida de funil ocorre em produção real:
`discovery → qualification_civil → qualification_renda` em ≥3 turnos.

### 4.2 Turno 1 — Entrada (discovery)

**Vasques envia no WhatsApp canary:**
```
Olá! Tenho interesse em financiar um imóvel pelo Minha Casa Minha Vida.
```

**Evidências a registrar após Turno 1:**
- [ ] Enova respondeu via WhatsApp
- [ ] `wrangler tail` mostra `core.run` com `stage_current: "discovery"`
- [ ] `wrangler tail` mostra `llm.context.built` com `stage_current` presente
- [ ] `wrangler tail` mostra `llm.output_guard.result` com `allowed: true`
- [ ] `wrangler tail` mostra `outbound.sent` com `external_dispatch: true`
- [ ] `enova_log` no Supabase contém `meta_minimal` (inbound) + `DECISION_OUTPUT` + `SEND_OK`

### 4.3 Turno 2 — Dado civil (qualification_civil)

**Vasques envia:**
```
Sou solteiro e quero comprar sozinho.
```

**Evidências a registrar após Turno 2:**
- [ ] Enova respondeu — perguntou sobre renda ou informação financeira
- [ ] `wrangler tail` mostra `stage_current: "qualification_civil"` ou stage avançou para `qualification_renda`
- [ ] `wrangler tail` mostra `text_extractor.result` com `facts_extracted_count > 0`
- [ ] `enova_log` tem nova entrada com tag `SEND_OK` do Turno 2
- [ ] Supabase `enova_state` contém `fase_conversa` diferente de `"inicio"` OU `crm_lead_meta` tem o lead registrado

### 4.4 Turno 3 — Dado de renda (qualification_renda)

**Vasques envia:**
```
Trabalho com carteira assinada, ganho R$ 3.500 por mês.
```

**Evidências a registrar após Turno 3:**
- [ ] Enova respondeu — continuou o fluxo (elegibilidade, documentos, ou pergunta adicional)
- [ ] `wrangler tail` mostra `stage_after` diferente de `"discovery"` — funil avançou
- [ ] `wrangler tail` mostra `facts_extracted_count` com `regime_trabalho` e/ou `renda_principal` capturados
- [ ] Stage avançou: `qualification_civil → qualification_renda` OU `qualification_renda → qualification_eligibility`
- [ ] `enova_log` tem 6+ entradas (2 por turno: `DECISION_OUTPUT` + `SEND_OK`)

---

## 5. Comandos seguros para coleta de evidências pós-prova

### 5.1 Verificar enova_log no Supabase

```sql
-- Executar no SQL Editor do Supabase (não altera dados)
SELECT id, tag, wa_id, stage, meta_type, meta_text, created_at
FROM enova_log
WHERE wa_id = '<seu_wa_id>'
ORDER BY created_at DESC
LIMIT 20;
```

Resultado esperado: linhas com tags `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK` alternando por turno.

### 5.2 Verificar estado do lead em enova_state

```sql
-- Executar no SQL Editor do Supabase
SELECT es.lead_id, es.fase_conversa, es.updated_at,
       clm.wa_id, clm.lead_pool, clm.lead_temp
FROM enova_state es
JOIN crm_lead_meta clm ON es.lead_id::text = clm.wa_id
WHERE clm.wa_id = '<seu_wa_id>'
ORDER BY es.updated_at DESC
LIMIT 5;
```

Resultado esperado: `fase_conversa` com valor operacional (não `"inicio"`) após avançar stages pós-docs, OU `"inicio"` para stages pré-docs (comportamento correto conforme mapper conservador).

### 5.3 Verificar correlação no wrangler tail

```bash
# Nos logs salvos, buscar por wa_id e correlation_id
grep -E '"wa_id"|"correlation_id"|"stage_current"|"stage_after"|"facts_extracted"' \
  t9-15b-canary-*.log | head -60
```

### 5.4 Verificar painel /conversations

Acessar `https://enova-2.vercel.app/conversations` e confirmar:
- [ ] Thread do `wa_id` canary aparece na lista
- [ ] Mensagens dos 3+ turnos estão visíveis
- [ ] Stage/status atualizado (se visível)

---

## 6. Critérios de evidência — classificação obrigatória

Após a execução, Vasques deve classificar cada item:

| Item | Status esperado | Como provar |
|------|----------------|-------------|
| G9-01 — Worker chama `runCoreEngine` para cada inbound | **comprovado** | `diagLog core.decision` em `wrangler tail` |
| G9-02 — `stage_current` gravado em Supabase real | **comprovado indiretamente** — mapper conservador: pré-docs gravam `null` (OK), pós-docs gravam `fase_conversa` | Consulta SQL `enova_state` |
| G9-03 — Conversa real avança ≥3 turnos | **pendente Vasques** — prova via `wrangler tail` mostrando stage_after diferente por turno | `stage_after` progressivo no tail |
| G9-04 — Restart preserva stage | **pendente Vasques** — deploy/restart após prova + nova msg | Stage correto após restart |
| G9-05 — Output guard bloqueia aprovação | **comprovado** — `smoke:llm:output-guard` 48/48 PASS | Smoke local já provado |
| G9-06 — LLM recebe `LlmContext` estruturado | **comprovado** — `diagLog llm.context.built` em tail | `stage_current` presente em `llm.context.built` |
| G9-07 — Facts extraídos do texto real | **pendente Vasques** — `facts_extracted_count > 0` em tail | `diagLog text_extractor.result` |
| G9-08 — Supabase real ativo em PROD | **comprovado** — `/crm/health` retorna `persistence_mode: supabase_full` | Health check |
| G9-09 — Trace ponta-a-ponta com `correlation_id` | **pendente Vasques** — busca no tail com wa_id/stage/outbound_id | grep no log salvo |
| G9-10 — Vasques confirma ≥5 conversas reais | **pendente Vasques** — confirmação explícita após ≥5 turnos | Confirmação verbal + log |

### 6.1 Definições de classificação

| Classificação | Significado |
|--------------|-------------|
| **comprovado** | Evidência direta em log/Supabase/painel |
| **comprovado indiretamente** | Evidência inferida de comportamento observável |
| **não comprovado** | Sem evidência disponível nesta PR |
| **pendente Vasques** | Requer ação/confirmação explícita de Vasques |

---

## 7. Critérios de G9 nesta PR

### 7.1 O que pode ser marcado com base nesta prova

| Gate | Condição para aprovar | Quem aprova |
|------|----------------------|-------------|
| G9-03 | Conversa real ≥3 turnos mostrando `stage_after` progressivo em `wrangler tail` | Vasques — via confirmação explícita após execução do roteiro |
| G9-07 | `text_extractor.result` com `facts_extracted_count > 0` em pelo menos 1 turno real | Vasques — via log tail |
| G9-09 | `correlation_id` / `wa_id` / `stage_current` / `outbound_id` correlacionados em tail de 3 turnos | Vasques — via grep no log salvo |
| G9-10 | Vasques confirma explicitamente que a conversa real foi natural e funcional ≥5 turnos | **Somente Vasques** — confirmação verbal + log |

### 7.2 O que NÃO pode ser fechado automaticamente

- **G9 permanece aberto** nesta PR.
- Fechamento de G9 só ocorre via `T9.R-CLOSEOUT-G9` após confirmação de todos os 10 critérios.
- Esta PR cria o roteiro; a prova real é executada por Vasques.

---

## 8. Checklist de validação pós-execução

Vasques deve marcar cada item após executar o roteiro:

### 8.1 Pipeline real

- [ ] **PIPELINE-01** — WhatsApp real chegou no Worker (`wrangler tail` mostrou `meta.canary.started`)
- [ ] **PIPELINE-02** — `runCoreEngine` rodou para cada mensagem (`core.decision` em tail)
- [ ] **PIPELINE-03** — LLM respondeu com contexto de stage (`llm.context.built` com `stage_current`)
- [ ] **PIPELINE-04** — Output guard rodou antes do outbound (`llm.output_guard.result` em tail)
- [ ] **PIPELINE-05** — Outbound enviado com sucesso (`outbound.sent` com `external_dispatch: true`)

### 8.2 Persistência Supabase

- [ ] **SB-01** — `enova_log` tem entradas `meta_minimal` para cada inbound (≥3)
- [ ] **SB-02** — `enova_log` tem entradas `DECISION_OUTPUT` para cada outbound (≥3)
- [ ] **SB-03** — `enova_log` tem entradas `SEND_OK` para cada confirmação Meta API (≥3)
- [ ] **SB-04** — `crm_lead_meta` contém o lead canary com `wa_id` correto
- [ ] **SB-05** — `enova_state` contém estado atualizado (mesmo que `fase_conversa = null/inicio` para pré-docs — comportamento correto)

### 8.3 Descida de funil

- [ ] **FUNIL-01** — `stage_current` foi `"discovery"` no Turno 1
- [ ] **FUNIL-02** — `stage_after` mostrou avanço em pelo menos 1 turno (`!= stage_current`)
- [ ] **FUNIL-03** — `facts_extracted_count > 0` em pelo menos 1 turno
- [ ] **FUNIL-04** — Resposta da Enova foi contextual ao stage (não texto genérico)

### 8.4 Telemetria

- [ ] **TEL-01** — `correlation_id` presente em todos os logs de um turno
- [ ] **TEL-02** — `wa_id` mascarado em logs (nunca exposto completo)
- [ ] **TEL-03** — Nenhum segredo visível em stdout/logs do tail

### 8.5 Painel

- [ ] **PAINEL-01** — `/conversations` mostra thread do wa_id canary
- [ ] **PAINEL-02** — Mensagens dos turnos estão visíveis na thread

---

## 9. Plano de rollback

Se algo der errado durante a prova:

```bash
# Rollback imediato — ativa ROLLBACK_FLAG via dashboard Cloudflare
# (bloqueia LLM e outbound em segundos)

# Via wrangler (se disponível):
wrangler secret put ROLLBACK_FLAG
# Digite: true

# Verificar que o rollback ativou:
# wrangler tail mostrará: "llm.blocked" com reason: "rollback_active"
```

Flags a restaurar após rollback:
```
ROLLBACK_FLAG           = "false"
LLM_REAL_ENABLED        = "false"  (volta ao default seguro)
OUTBOUND_CANARY_ENABLED = "false"  (volta ao default seguro)
OUTBOUND_CANARY_WA_ID   = ""       (limpar)
```

Impacto do rollback: **zero**. Nenhuma dado real é excluído. `enova_log` e `crm_lead_meta` sobrevivem.

---

## 10. Análise de risco

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Resposta incoerente do LLM | BAIXA | Output guard bloqueia antes do outbound; fallback via `ROLLBACK_FLAG` |
| `CLIENT_REAL_ENABLED` acidentalmente ativo | ALTA | Verificar flags antes de iniciar; checklist pré-prova obrigatório |
| Stage não avança no funil | MÉDIA | Não é falha de pipeline — indica calibração de parsers; T9.15B registra; PR-FIX cirúrgica se necessário |
| Supabase write falha silenciosamente | MÉDIA | `diagLog` registra `used_fallback=true`; wrangler tail mostrará fallback |
| `enova_log` sem entradas | BAIXA | Verificar `SUPABASE_WRITE_ENABLED=true`; `/crm/health` confirma modo |
| Conversa natural comprometida | BAIXA | Soberania do LLM garante naturalidade; output guard preserva contexto |

---

## 11. O que acontece depois

### 11.1 Se a prova passar (todos os checklists ✅)

```
Próxima PR: T9.R-CLOSEOUT-G9
Tipo: PR-CLOSEOUT
Pré-requisito: todos os 10 critérios G9 confirmados por evidência real
Ação: Vasques confirma explicitamente + PR-CLOSEOUT encerra G9
```

### 11.2 Se algum item falhar

```
Próxima PR: PR-FIX cirúrgica (não closeout)
Escopo: somente o item que falhou
Exemplo: stage não avança → nova PR-DIAG dos parsers → PR-IMPL cirúrgica
```

### 11.3 Lacunas documentadas que não bloqueiam esta PR

| ID | Descrição | Bloqueante? |
|----|-----------|-------------|
| LAC-T9.15B-01 | Restart real pós-prova não executado — G9-04 pendente restart deliberado | Não — pendente Vasques fazer restart durante/após prova |
| LAC-T9.15B-02 | ≥5 conversas para G9-10 — mínimo 3 turnos suficientes para G9-03 | Não — Vasques pode estender a conversa |
| LAC-T9.15B-03 | `stage_current` para pré-docs não persiste em `enova_state.fase_conversa` (mapper conservador — comportamento correto) | Não — é comportamento esperado |

---

## 12. Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T9_15B_REAL_CANARY_FUNNEL_PROOF.md
Estado da evidência:                   parcial — roteiro criado; prova real pendente Vasques
Há lacuna remanescente?:               sim — prova real canary não executada ainda
Há item parcial/inconclusivo bloqueante?: não — para o escopo desta PR (criação do roteiro)
Fechamento permitido nesta PR?:        sim — para o roteiro e documentação da prova
                                       NÃO — para G9; G9 permanece aberto até execução real
Estado permitido após esta PR:         T9 em execução; G9 aberto; roteiro real pronto para Vasques
Próxima PR autorizada:                 T9.R-CLOSEOUT-G9 (somente após Vasques executar e confirmar)
                                       OU PR-FIX cirúrgica se algum item falhar
```

---

## 13. Estado dos critérios G9 após esta PR

| Critério | Status antes | Status após T9.15B |
|----------|-------------|---------------------|
| G9-01 — Worker chama `runCoreEngine` | ⚠️ provado logicamente (smoke) | ⚠️ roteiro pronto — pendente tail real |
| G9-02 — `stage_current` em Supabase real | ⚠️ provado logicamente (Bloco D T9.15) | ⚠️ roteiro pronto — pendente Bloco F T9.15 real |
| G9-03 — conversa real ≥3 turnos avança funil | ❌ NÃO PROVADO | ⚠️ ROTEIRO CRIADO — pendente execução Vasques |
| G9-04 — restart preserva stage | ⚠️ provado logicamente | ⚠️ roteiro pronto — pendente restart real deliberado |
| G9-05 — output guard bloqueia aprovação | ✅ PROVADO (smoke 48/48) | ✅ mantido |
| G9-06 — LLM recebe LlmContext estruturado | ✅ PROVADO (smoke) | ✅ mantido — pendente confirmação em tail real |
| G9-07 — facts extraídos em produção real | ❌ NÃO PROVADO | ⚠️ ROTEIRO CRIADO — pendente execução Vasques |
| G9-08 — Supabase real ativo em PROD | ✅ PROVADO (health check) | ✅ mantido |
| G9-09 — trace com correlation_id em tail | ❌ NÃO PROVADO | ⚠️ ROTEIRO CRIADO — pendente tail real Vasques |
| G9-10 — Vasques confirma ≥5 conversas | ❌ NÃO PROVADO | ⚠️ ROTEIRO CRIADO — pendente confirmação Vasques |

---

## 14. Referências

- Prova lógica anterior: `src/supabase/write-read-restart-proof.ts` (44/44 PASS)
- Contrato T9: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`
- Diagnóstico read path: `schema/diagnostics/T9_14_READ_PATH_STAGE_MAPPING_DIAG.md`
- Handoff atual: `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
- Soberania IA: `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
- Fechamento por prova: `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

*Roteiro criado em: 2026-05-04*  
*Classificação: PR-PROVA / contratual / frente T9*  
*Próxima ação: Vasques executa roteiro e preenche checklists das seções 4-8*
