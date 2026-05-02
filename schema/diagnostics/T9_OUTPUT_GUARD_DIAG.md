# T9.9-DIAG — Diagnóstico Output Guard para respostas do LLM

**Tipo**: PR-DIAG | **Status**: CONCLUÍDA  
**Branch**: `diag/t9.9-output-guard`  
**Data**: 2026-05-02  
**Próxima PR autorizada após este DIAG**: T9.9 — IMPL Output Guard para respostas do LLM

---

## 1. Veredito executivo

**T9.9 pode ser implementada com patch cirúrgico. Nenhum bloqueio real.**

A inserção do Output Guard requer:
- Criar `src/llm/output-guard.ts` — módulo puro, determinístico, sem I/O
- Inserir **1 bloco** em `canary-pipeline.ts` entre L288 (`if (llmResult.ok && llmResult.reply_text)`) e L289 (`replyText = llmResult.reply_text`)
- Criar `src/llm/output-guard-smoke.ts`
- Adicionar `smoke:llm:output-guard` ao `package.json`
- Sem alteração em outbound, webhook, Core, parsers, CRM ou LLM prompt

O Output Guard não viola a soberania do LLM: o LLM continua sendo o único gerador de `reply_text`. O guard apenas valida se o texto gerado é seguro antes de deixar passar para o outbound.

---

## 2. Arquivos lidos

| Arquivo | Propósito |
|---|---|
| `src/llm/client.ts` | LLM call, LlmContext, buildDynamicSystemPrompt |
| `src/meta/canary-pipeline.ts` | Orquestrador: fluxo LLM → replyText → outbound |
| `src/meta/outbound.ts` | sendMetaOutbound, evaluateOutboundReadiness |
| `src/meta/webhook.ts` | Entrada do webhook (não alterado) |
| `src/meta/core-pipeline-smoke.ts` | Smoke Core ↔ pipeline (23 checks) |
| `src/meta/facts-stage-advance-proof.ts` | Prova end-to-end (44 checks) |
| `src/meta/stage-persistence-proof.ts` | Prova persistência de stage (58 checks) |
| `src/llm/context-smoke.ts` | Smoke LlmContext (30 checks) |
| `src/core/engine.ts` | runCoreEngine — CoreDecision |
| `src/core/types.ts` | LeadState, CoreDecision, StageId |
| `src/crm/service.ts` | getLeadState, getLeadFacts, upsertLeadState |
| `src/crm/types.ts` | CrmLeadState, CrmLeadFact |
| `package.json` | Scripts registrados |
| `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` | Contrato T9 ativo |

---

## 3. Estado atual do fluxo LLM → Outbound

### 3.1 Onde o LLM gera `reply_text`

`src/llm/client.ts` — função `callLlm(userMessage, env, context?)`:
- Chama OpenAI `gpt-4o-mini` (quando `OPENAI_API_KEY` presente)
- Retorna `LlmClientResult { ok, reply_text, llm_invoked, latency_ms, error }`
- `reply_text` = `choices[0].message.content.trim()` ou `undefined` em caso de erro

### 3.2 Onde `replyText` é atribuído

`src/meta/canary-pipeline.ts` — **L288–L289** (pós-T9.8):

```typescript
// L286: chamada ao LLM
const llmResult = await llmCaller(userText, env as Record<string, unknown>, llmContext);
llmInvoked = llmResult.llm_invoked;

// L288: guarda resultado
if (llmResult.ok && llmResult.reply_text) {
  replyText = llmResult.reply_text;  // ← L289: atribuição de replyText
  diagLog('meta.prod.llm.result', { success: true, ... });
  emitCanary(ctx, 'llm.completed', 'completed', ...);
}
```

### 3.3 Onde `replyText` é usado para outbound

`src/meta/canary-pipeline.ts` — Passo 3 (outbound gate):

```typescript
// Se replyText === undefined → canaryBlockReason = 'reply_text_missing'
} else if (!replyText) {
  canaryBlockReason = 'reply_text_missing';
} else {
  canaryAllowed = true;
}
```

Se `replyText` está definido e os gates de flag passam, o texto é passado a `sendMetaOutbound` via `intent.reply_text`.

### 3.4 Onde seria o ponto seguro do guard

**Entre L288 e L289**: após confirmar que `llmResult.ok && llmResult.reply_text` é verdadeiro, mas **antes** de atribuir `replyText`. Se o guard bloquear, `replyText` permanece `undefined`, o outbound gate detecta `'reply_text_missing'` e bloqueia automaticamente. Isso mantém o comportamento existente do pipeline sem adicionar novo path de bloqueio.

---

## 4. Ponto exato de integração futura

**Arquivo**: `src/meta/canary-pipeline.ts`  
**Posição**: entre L288 e L289

```typescript
if (llmResult.ok && llmResult.reply_text) {
  // ← INSERIR AQUI: Output Guard (T9.9)
  //
  // const guardResult = applyOutputGuard(llmResult.reply_text, coreDecision);
  // diagLog('llm.output_guard.result', { ... });
  //
  // if (guardResult.allowed) {
  //   replyText = guardResult.safe_reply_text ?? llmResult.reply_text;
  // } else {
  //   errors.push(`output_guard_blocked: ${guardResult.reason_codes.join(',')}`);
  //   emitCanary(ctx, 'llm.output_guard.blocked', 'blocked', { ... });
  //   // replyText permanece undefined → outbound não ocorre
  // }
  replyText = llmResult.reply_text;  // linha que passa a ser condicional
```

**Justificativa da escolha**:
- Inserir **antes da atribuição de `replyText`** (não antes do outbound gate) porque:
  1. `replyText` é a variável de controle natural — se undefined, o outbound para automaticamente
  2. Não requer nova variável de flag ou path adicional no pipeline
  3. O `diagLog` de sucesso do LLM (`meta.prod.llm.result`) pode continuar sendo emitido — o guard é camada separada
  4. Se o guard bloquear com fallback texto fixo, basta atribuir o fallback a `replyText`
  5. Preserva todos os logs de telemetria existentes

---

## 5. Riscos que o Output Guard deve cobrir

### 5.1 Catálogo completo de riscos

| # | Risco | Origem | Exemplo |
|---|---|---|---|
| R-01 | Promessa de aprovação | LLM hallucination | "Você foi aprovado para o MCMV!" |
| R-02 | Status de aprovação | LLM confusão de contexto | "Seu crédito foi aprovado." |
| R-03 | Garantia de financiamento | Instrução mal interpretada | "Garantimos seu financiamento." |
| R-04 | Decisão de stage explícita | Stage interno exposto | "Agora você está na etapa docs_prep." |
| R-05 | UUID/ID interno | Vazamento de dados | "Seu lead_id é abc-123-def..." |
| R-06 | CPF/RG explícito | Privacidade | "Seu CPF 000.000.000-00 foi..." |
| R-07 | Secret/token | Segurança | "Bearer sk-proj-..." |
| R-08 | Texto vazio | Falha de geração | `""` ou `"  "` |
| R-09 | Texto longo demais | UX WhatsApp | >1000 chars no WhatsApp |
| R-10 | Pedido de documento fora de hora | Stage incorreto | "Me envie o holerite" (discovery) |
| R-11 | Instrução fora do MCMV | Hallucination de domínio | "Você pode financiar via FGTS sem restrição" |
| R-12 | Menção a stage interno por nome | Exposição de arquitetura | "Você está em qualification_renda" |

---

## 6. Classificação dos bloqueios — Matriz block/warn/allow

| Padrão | Severidade | Ação | Motivo | Regex/lógica |
|---|---|---|---|---|
| `aprovo`, `aprovado(a)` como status do cliente | CRÍTICO | **block** | Regra soberana T9 cláusula 2 | `/\b(est[aá]s?\s+aprovad[oa]|foi\s+aprovad[oa]|foi\s+aprovad[oa]\s+para\s+o\s+mcmv)\b/i` |
| `seu crédito foi aprovado` | CRÍTICO | **block** | Promessa de crédito | `/seu\s+cr[eé]dito\s+(foi|est[aá])\s+aprovad/i` |
| `garantimos seu financiamento` | CRÍTICO | **block** | Garantia explícita | `/garantimos?\s+(seu|o)\s+financiamento/i` |
| `tenho certeza que vai ser aprovado` | CRÍTICO | **block** | Promessa implícita de resultado | `/certeza\s+que\s+(vai\s+ser|ser[aá])\s+aprovad/i` |
| UUID (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) | ALTO | **block** | Vazamento de ID interno | `/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i` |
| `sk-`, `Bearer `, token longo | ALTO | **block** | Segurança — secret exposto | `/\bsk-[A-Za-z0-9_\-]{10,}\b|Bearer\s+\S{15,}|OPENAI_API_KEY/i` |
| `qualification_`, `stage_`, `docs_prep`, etc. | ALTO | **block** | Stage interno exposto | `/\b(qualification_(civil|renda|eligibility|special)|docs_prep|docs_collection|broker_handoff|discovery)\b/i` |
| CPF pattern (000.000.000-00) | ALTO | **block** | Privacidade | `/\d{3}\.\d{3}\.\d{3}-\d{2}/` |
| Texto vazio/só espaços | ALTO | **block** | Falha de geração | `!text.trim()` |
| Texto > 1000 chars | MÉDIO | **warn** | UX WhatsApp limite prático | `text.length > 1000` |
| `lead_id`, `turn_id`, `wa_id` explícitos | ALTO | **block** | Exposição de IDs internos | `/\b(lead_id|turn_id|wa_id|decision_id)\b/i` |
| Pedido de documento em stages `discovery`/`qualification_civil` | BAIXO | **warn** | Stage não justifica pedido | Detectar patterns de doc + verificar `stage_current` |
| Palavra `aprovação` em contexto educativo | — | **allow** | Não é promessa | "Não é aprovação automática" — allow |
| `pode ser aprovado`/`pode ser elegível` | — | **allow** | Condicional, não promessa | Condicional + não afirmativo |

**Nota sobre ação warn**: warn não bloqueia outbound — emite `diagLog` com `allowed: true, warned: true, reason_codes: [...]` para monitoramento.

---

## 7. Resposta segura em caso de bloqueio

### Decisão: bloquear silenciosamente, sem fallback inventado

Quando o guard bloquear (`allowed: false`):
1. **`replyText` permanece `undefined`**
2. O outbound gate detecta `'reply_text_missing'` e bloqueia normalmente
3. **Nenhum fallback inventado pelo adapter** — regra soberana: o adapter nunca gera atendimento

**Justificativa**: o ADENDO_CANONICO_SOBERANIA_IA proíbe que o adapter invente fala. Um fallback fixo seria uma fala do adapter. A ausência de resposta é o comportamento mais seguro — melhor silêncio do que promessa errada.

**Exceção controlada**: se o contrato T9 autorizar explicitamente um texto fixo de fallback de guarda (ex: "Entendi! Pode me repetir essa informação?"), ele pode ser adicionado como constante explícita no guard. **Esta decisão pertence à T9.9 — não a este DIAG.**

---

## 8. Telemetria do Output Guard

### Evento recomendado

```typescript
diagLog('llm.output_guard.result', {
  allowed: boolean,
  blocked: boolean,
  warned: boolean,
  reason_codes: string[],        // ex: ['approval_promise', 'uuid_leak']
  reply_text_length: number,
  replacement_used: boolean,     // true se fallback fixo usado
  stage_current: string | undefined, // apenas o nome do stage, se disponível
});
```

### Regras do diagLog do guard

- **Nunca logar `reply_text` completo** — nem truncado
- **Nunca logar facts values** — apenas counts
- **Nunca logar secrets** — zero tokens, zero API keys
- `reason_codes` são strings enum — não valores dinâmicos do texto
- `stage_current` é seguro — é um dos 9 stages canônicos fixos

---

## 9. Shape recomendado do resultado do guard

```typescript
// src/llm/output-guard.ts — interface canônica

export interface LlmOutputGuardResult {
  allowed: boolean;
  blocked: boolean;
  warned: boolean;
  reason_codes: LlmGuardReasonCode[];
  safe_reply_text?: string;   // se allowed: o texto (possivelmente inalterado)
  replacement_used: boolean;  // true se fallback fixo substituiu o texto
}

export type LlmGuardReasonCode =
  | 'approval_promise'       // promessa de aprovação direta
  | 'credit_approved'        // "crédito aprovado"
  | 'financing_guarantee'    // "garantimos financiamento"
  | 'internal_stage_exposed' // nome de stage interno
  | 'internal_id_exposed'    // UUID ou ID interno
  | 'pii_cpf_exposed'        // CPF pattern
  | 'secret_token_exposed'   // Bearer/sk-/token
  | 'empty_text'             // texto vazio
  | 'text_too_long';         // >1000 chars (warn apenas)

export function applyOutputGuard(
  replyText: string,
  context?: { stage_current?: string },
): LlmOutputGuardResult;
```

---

## 10. Estratégia de implementação mínima

### Arquivos a criar em T9.9

| Arquivo | Ação |
|---|---|
| `src/llm/output-guard.ts` | CRIAR — módulo puro, sem I/O, zero deps externas |
| `src/llm/output-guard-smoke.ts` | CRIAR — smoke ≥20 checks |

### Arquivos a modificar em T9.9

| Arquivo | Mudança |
|---|---|
| `src/meta/canary-pipeline.ts` | Inserir 1 bloco guard entre L288 e L289 |
| `package.json` | Adicionar `"smoke:llm:output-guard": "tsx src/llm/output-guard-smoke.ts"` |

### Arquivos NÃO alterados em T9.9

- `src/llm/client.ts` — LLM inalterado
- `src/meta/outbound.ts` — outbound inalterado
- `src/meta/webhook.ts` — inalterado
- `src/core/**` — Core inalterado
- `src/crm/**` — CRM inalterado

---

## 11. Regras mínimas do guard — primeira versão determinística

As regras são avaliadas em ordem. Primeiro match block para a avaliação (sem acumular).

```typescript
// Bloco 1 — CRÍTICO: aprovação e garantia (block)
const BLOCK_PATTERNS: Array<{ code: LlmGuardReasonCode; pattern: RegExp }> = [
  {
    code: 'approval_promise',
    pattern: /\b(est[aá]s?\s+aprovad[oa]|foi\s+aprovad[oa]|foi\s+aprovad[oa]\s+para\s+o\s+mcmv|tenho\s+certeza\s+que\s+(vai\s+ser|ser[aá])\s+aprovad)\b/i,
  },
  {
    code: 'credit_approved',
    pattern: /seu\s+cr[eé]dito\s+(foi|est[aá])\s+aprovad/i,
  },
  {
    code: 'financing_guarantee',
    pattern: /garantimos?\s+(seu|o)\s+financiamento/i,
  },
  {
    code: 'internal_stage_exposed',
    pattern: /\b(qualification_(civil|renda|eligibility|special)|docs_prep|docs_collection|broker_handoff|discovery)\b/i,
  },
  {
    code: 'internal_id_exposed',
    pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  },
  {
    code: 'pii_cpf_exposed',
    pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/,
  },
  {
    code: 'secret_token_exposed',
    pattern: /\bsk-[A-Za-z0-9_\-]{10,}\b|Bearer\s+\S{15,}|OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY/i,
  },
  {
    code: 'internal_id_exposed',
    pattern: /\b(lead_id|turn_id|wa_id|decision_id)\s*[:=]/i,
  },
];

// Bloco 2 — ALTO: texto vazio (block)
if (!text.trim()) → code: 'empty_text', block

// Bloco 3 — MÉDIO: texto longo demais (warn, não block)
if (text.length > 1000) → code: 'text_too_long', warn (allowed = true)
```

---

## 12. Estratégia anti-falso-positivo

### 12.1 Princípio fundamental

O guard usa **intenção semântica**, não presença de palavra. A palavra "aprovação" não é proibida — a promessa direta é proibida.

### 12.2 Distinções implementadas

| Frase | Ação | Razão |
|---|---|---|
| `"Você foi aprovado!"` | **block** | Afirmação direta de resultado |
| `"Você está aprovado para o MCMV"` | **block** | Afirmação direta com produto |
| `"O processo de aprovação pode levar alguns dias"` | allow | Substantivo, não verbo de status |
| `"Não posso dizer se você será aprovado"` | allow | Negação, não promessa |
| `"Pode ser que você seja aprovado, dependendo da análise"` | allow | Condicional, não afirmativo |
| `"O banco é quem aprova, não eu"` | allow | Terceiro agente, não promessa |
| `"Aprovação de financiamento depende da CEF"` | allow | Genérico, sem atribuição ao cliente |
| `"discovery"` em contexto de texto natural | allow | Sem pattern UUID/slug |
| `"discovery"` como nome de stage (`/\bdiscovery\b/`) | **block** | Pattern do guard captura |

### 12.3 Implementação do anti-falso-positivo

Os patterns bloqueantes são escritos com regex específicos de contexto:
- Usar `\b` (word boundaries) para evitar matches parciais
- Verificar verbo + resultado: `foi aprovado`, `está aprovado`, `será aprovado` — não apenas "aprovado"
- Para `stage_current`, o pattern é `/\b(qualification_civil|...)\b/i` — não captura "civil" solto
- Para UUIDs, o pattern requer o formato completo `8-4-4-4-12`
- Para secrets, requer prefixo canônico (`sk-`, `Bearer `) — não qualquer string longa

### 12.4 reason_codes específicos

Usar `reason_codes` específicos (não genérico "blocked") permite:
- Monitorar quais regras disparam mais em PROD
- Ajustar thresholds sem mudar toda a lógica
- Distinguir falso-positivo de bloqueio legítimo em análise posterior

---

## 13. Relação com T9.8 LlmContext

### Como `LlmContext`/`coreDecision` deve informar o guard

O guard recebe `context?: { stage_current?: string }` para:
- **Regra de pedido de documento fora de hora** (warn): se `stage_current` é `discovery` ou `qualification_civil` e o texto menciona pedido de documento, emitir warn
- **Nunca usar `stage_current` para decidir stage** — o guard apenas observa, não decide
- **Nunca alterar `coreDecision`** — o guard é soberano apenas na validação do texto de saída

### Invariante preservada

```
Core decide stage     → coreDecision.stage_after
LLM decide fala       → llmResult.reply_text
Guard valida fala     → guardResult.allowed
Outbound envia fala   → replyText (se guard permitiu)
```

O guard não tem nenhum poder sobre o stage. Recebe `stage_current` somente como contexto de observação para a regra de pedido de documento.

---

## 14. Patch mínimo recomendado para T9.9

### Passo A — Criar `src/llm/output-guard.ts`

```typescript
// Módulo puro — sem I/O, sem deps externas, zero efeitos colaterais.
// Funções exportadas: applyOutputGuard(text, context?) → LlmOutputGuardResult

export type LlmGuardReasonCode = 'approval_promise' | 'credit_approved' | ...;
export interface LlmOutputGuardResult { ... }
export function applyOutputGuard(text: string, context?: { stage_current?: string }): LlmOutputGuardResult
```

### Passo B — Inserir 1 bloco em `canary-pipeline.ts` (L288→L289)

Importar `applyOutputGuard` de `../llm/output-guard.ts`.

Inserir entre `if (llmResult.ok && llmResult.reply_text)` e `replyText = llmResult.reply_text`:

```typescript
const guardResult = applyOutputGuard(
  llmResult.reply_text,
  coreDecision ? { stage_current: coreDecision.stage_current } : undefined,
);
diagLog('llm.output_guard.result', {
  allowed: guardResult.allowed,
  blocked: guardResult.blocked,
  warned: guardResult.warned,
  reason_codes: guardResult.reason_codes,
  reply_text_length: llmResult.reply_text.length,
  replacement_used: guardResult.replacement_used,
  stage_current: coreDecision?.stage_current ?? null,
});
if (!guardResult.allowed) {
  errors.push(`output_guard_blocked: ${guardResult.reason_codes.join(',')}`);
  emitCanary(ctx, 'llm.output_guard.blocked', 'blocked', {
    reason_codes: guardResult.reason_codes,
  });
  // replyText permanece undefined → outbound gate bloqueia via 'reply_text_missing'
} else {
  replyText = guardResult.safe_reply_text ?? llmResult.reply_text;
}
```

### Passo C — Criar `src/llm/output-guard-smoke.ts`

Smoke com ≥20 checks cobrindo:
- Bloco 1: textos bloqueantes confirmados como blocked
- Bloco 2: textos permitidos confirmados como allowed
- Bloco 3: anti-falso-positivo (allowed com palavra "aprovação" em contexto correto)
- Bloco 4: texto vazio → blocked
- Bloco 5: texto longo → warned mas allowed
- Bloco 6: segurança — nenhum secret no output do guard
- Bloco 7: shape do resultado (`allowed`, `blocked`, `reason_codes`, `replacement_used`)

### Passo D — Atualizar `package.json`

```json
"smoke:llm:output-guard": "tsx src/llm/output-guard-smoke.ts"
```

### Passo E — Atualizar arquivos vivos

- `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
- `schema/handoffs/T9_LLM_FUNIL_SUPABASE_HANDOFF.md`
- `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`

---

## 15. Smokes exigidos para T9.9

| Smoke | Mínimo esperado | Propósito |
|---|---|---|
| `smoke:llm:output-guard` | ≥20/20 PASS | Prova unitária do guard |
| `smoke:llm:context` | 30/30 PASS | Regressão LlmContext |
| `smoke:meta:canary` | 41/41 PASS | Regressão pipeline canary |
| `smoke:meta:core-pipeline` | 23/23 PASS | Regressão Core ↔ pipeline |
| `prove:t9.7-facts-stage-advance` | 44/44 PASS | Prova E2E facts → stage |
| `prove:t9.5-stage-persistence` | 58/58 PASS | Prova persistência stage |
| `smoke:core:text-extractor` | PASS | Regressão extrator |
| `smoke:runtime:env` | 53/53 PASS | Regressão runtime |
| `smoke:runtime:fallback-guard` | 41/41 PASS | Regressão fallback guard |
| `prove:g8-readiness` | G8 APROVADO | Invariante G8 preservada |

---

## 16. Fora de escopo confirmado

Esta PR-DIAG não altera nenhum arquivo funcional em `src/`.

| Item | Status |
|---|---|
| `src/llm/client.ts` | NÃO ALTERADO |
| `src/meta/canary-pipeline.ts` | NÃO ALTERADO |
| `src/meta/outbound.ts` | NÃO ALTERADO |
| `src/meta/webhook.ts` | NÃO ALTERADO |
| `src/core/*.ts` | NÃO ALTERADO |
| `src/crm/*.ts` | NÃO ALTERADO |
| `package.json` | NÃO ALTERADO |
| Supabase | NÃO ALTERADO |
| Deploy/workflow | NÃO ALTERADO |
| G9 | PERMANECE ABERTO |

---

## 17. Próxima PR autorizada

**T9.9 — IMPL Output Guard para respostas do LLM**

Tipo: PR-IMPL  
Precedida por: este T9.9-DIAG (PR-DIAG)  
Bloco de implementação: patch cirúrgico em 2 novos arquivos + 1 bloco em `canary-pipeline.ts`  
Regra soberana preservada: LLM continua único gerador de `reply_text`; guard não inventa fala

---

*Documento criado em 2026-05-02 — READ-ONLY — zero src/ alterado*
