# T9.11 — Prova: LLM usa contexto sem quebrar stage/guard

**Tipo:** PR-PROVA  
**Data:** 2026-05-02  
**Branch:** `prove/t9.11-llm-context-guard`  
**Depende de:** T9.10-IMPL (memória curta), T9.9-IMPL (output guard), T9.8-IMPL (LlmContext)  
**Script:** `src/llm/context-guard-proof.ts`  
**Resultado:** 56/56 PASS | 0 FAIL — EXIT 0

---

## Objetivo

Provar programaticamente que:

1. O LLM recebe `recent_turns` integrados ao `LlmContext` estruturado (contexto completo).
2. `stage_current` — decidido pelo Core — permanece soberano no prompt, aparecendo antes dos turnos recentes.
3. O Output Guard bloqueia conteúdo perigoso **independente da presença de `recent_turns`**.
4. O Output Guard **nunca inventa reply** (`replacement_used` sempre `false`).
5. Sanitização prévia (feita no pipeline) impede PII/secrets de chegarem ao prompt.
6. Retrocompatibilidade: sem `recent_turns`, tudo continua funcionando.

---

## Cenários de prova

### C1 — stage_current + recent_turns renderizados no prompt (8 checks)

Constrói `LlmContext` com `stage_current = 'discovery'`, `next_objective`, `speech_intent` e 3 turnos recentes. Verifica que todos os campos estão presentes no prompt gerado por `buildDynamicSystemPrompt` e que o prompt está dentro do budget de 4800 chars.

**Resultado:** 8/8 PASS

### C2 — stage_current tem prioridade sobre recent_turns (4 checks)

Verifica que `stage_current` (`indexOf`) aparece **antes** do bloco "Contexto recente" no prompt. Garante que o label "não para regras de etapa" está presente — deixando claro ao LLM que o histórico é auxiliar.

**Resultado:** 4/4 PASS

### C3 — Guard bloqueia promessa de aprovação com recent_turns (5 checks)

Aplica guard a `"Você foi aprovado para o MCMV com base no seu perfil."` com `stage_current = 'discovery'`. Verifica: `blocked=true`, `reason_codes=['approval_promise']`, `safe_reply_text=undefined`, `replacement_used=false`, `allowed=false`.

**Resultado:** 5/5 PASS

### C4 — Guard passa reply seguro com recent_turns (4 checks)

Aplica guard a resposta neutra de coleta de informação. Verifica: `allowed=true`, `blocked=false`, `safe_reply_text` presente, `replacement_used=false`.

**Resultado:** 4/4 PASS

### C5 — Guard bloqueia CPF exposto (3 checks)

Aplica guard a texto contendo CPF no formato `000.000.000-00`. Verifica: `blocked=true`, `reason='pii_cpf_exposed'`, `safe_reply_text=undefined`.

**Resultado:** 3/3 PASS

### C6 — Guard bloqueia stage interno exposto (3 checks)

Aplica guard a texto que menciona `qualification_civil` explicitamente. Verifica: `blocked=true`, `reason='internal_stage_exposed'`, `safe_reply_text=undefined`.

**Resultado:** 3/3 PASS

### C7 — Guard bloqueia secrets (3 checks)

Aplica guard a texto com prefixo `sk-`. Verifica: `blocked=true`, `reason='secret_token_exposed'`, `safe_reply_text=undefined`.

**Resultado:** 3/3 PASS

### C8 — Negação contextual: guard permite reply com "não aprovado" (3 checks)

Aplica guard a `"Não posso dizer que você está aprovado agora — precisamos concluir a análise."`. Verifica que a detecção de negação funciona: `allowed=true`, `blocked=false`, `safe_reply_text` presente.

**Resultado:** 3/3 PASS

### C9 — Retrocompatibilidade: sem recent_turns (5 checks)

Constrói `LlmContext` sem `recent_turns`. Verifica: prompt válido, sem bloco "Contexto recente", `stage_current` presente, guard funciona, budget respeitado.

**Resultado:** 5/5 PASS

### C10 — Janela máxima 3 turnos (2 checks)

Passa 5 turnos em `recent_turns`. Verifica que no máximo 3 são renderizados no prompt.

**Resultado:** 2/2 PASS

### C11 — Truncamento de turno a 100 chars (2 checks)

Passa turno com 250 chars. Verifica que 150 chars consecutivos não aparecem no prompt.

**Resultado:** 2/2 PASS

### C12 — replacement_used sempre false — guard nunca inventa reply (2 checks)

Itera sobre 5 textos bloqueantes distintos + 1 reply permitido. Verifica `replacement_used=false` em todos os casos.

**Resultado:** 2/2 PASS

### C13 — stage_current inalterado pelo guard — Core soberano (4 checks)

Registra `stage_current` antes e depois de chamar `applyOutputGuard` (allowed e blocked). Verifica que o valor não muda. Constrói também prompt com `qualification_renda` + `recent_turns` e verifica coexistência correta.

**Resultado:** 4/4 PASS

### C14 — text_too_long → warn, não block (4 checks)

Aplica guard a texto de 1200 chars. Verifica: `allowed=true`, `warned=true`, `reason='text_too_long'`, `blocked=false`.

**Resultado:** 4/4 PASS

### C15 — recent_turns sanitizados → sem secrets/PII no prompt (4 checks)

Constrói `LlmContext` com `recent_turns` já sanitizados (como faz `canary-pipeline.ts`). Verifica que o prompt não contém padrões de `sk-`, `Bearer`, CPF bruto.

**Resultado:** 4/4 PASS

---

## Soberania verificada

| Invariante | Verificado em |
|---|---|
| LLM não decide stage — Core decide | C2, C13 |
| Output Guard bloqueia aprovação independente de contexto | C3 |
| Output Guard nunca inventa reply | C12 |
| PII/secrets não chegam ao prompt (sanitização prévia) | C15 |
| Retrocompatibilidade sem recent_turns | C9 |
| Histórico é contexto auxiliar — não substitui stage | C2 (label "não para regras de etapa") |

---

## Regressões executadas

| Smoke | Resultado |
|---|---|
| `smoke:llm:short-memory-context` | 46/46 PASS |
| `smoke:llm:output-guard` | 48/48 PASS |
| `smoke:llm:context` | 30/30 PASS |
| `smoke:meta:canary` | 41/41 PASS |
| `smoke:meta:core-pipeline` | 23/23 PASS |
| `prove:t9.7-facts-stage-advance` | 44/44 PASS |
| `prove:t9.5-stage-persistence` | PASS |
| `smoke:runtime:env` | 53/53 PASS |
| `smoke:runtime:fallback-guard` | 41/41 PASS |
| `prove:g8-readiness` | G8 APROVADO |

---

## Resultado final

**56/56 PASS | 0 FAIL — EXIT 0**

`prove:t9.11-context-guard OK — LLM usa contexto sem quebrar stage/guard.`

**Frente LLM/funil (T9.8/T9.9/T9.10/T9.11) — APROVADA.**

---

## Próxima PR autorizada

**T9.12 — IMPL Supabase write real (CRM/memória/stage)**

Depende de T9.2, T9.5. Resolve BLK-02 e BLK-05 definitivamente em escrita real.
