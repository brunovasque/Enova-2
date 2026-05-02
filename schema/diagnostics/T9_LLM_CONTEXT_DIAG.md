# T9.8-DIAG — Diagnóstico LlmContext estruturado

**Data:** 2026-05-02  
**Tipo:** PR-DIAG (read-only)  
**Contrato:** CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md  
**PR anterior confirmada:** T9.7 — PROVA facts extraídos e stage avança (44/44 PASS)  
**Próxima PR autorizada:** T9.8 — IMPL LlmContext estruturado

---

## 1. Veredito executivo

**T9.8 pode ser implementada com patch cirúrgico. Não há bloqueio real.**

Dois arquivos precisam de alteração mínima:
1. `src/llm/client.ts` — adicionar `LlmContext` interface + terceiro parâmetro opcional `context?` a `callLlm`
2. `src/meta/canary-pipeline.ts` — hoist de `factsMap` para escopo externo + passagem de `LlmContext` ao chamar `llmCaller`

Todas as chamadas existentes (`callLlm(msg, env)` sem contexto) continuam funcionando sem alteração.  
O risco principal é de prompt inflado — mitigado por limites explícitos definidos neste diagnóstico.

---

## 2. Arquivos lidos

| Arquivo | Propósito |
|---|---|
| `src/llm/client.ts` | Assinatura atual de `callLlm`, SYSTEM_PROMPT, LlmClientResult |
| `src/meta/canary-pipeline.ts` | Orquestrador; ponto de chamada de `callLlm`; dados disponíveis antes do LLM |
| `src/meta/pipeline.ts` | runInboundPipeline; CrmTurn com `raw_input_summary` |
| `src/core/types.ts` | LeadState, CoreDecision, StageId |
| `src/core/engine.ts` | runCoreEngine; como coreDecision é construído |
| `src/crm/service.ts` | getLeadTimeline, getLeadFacts, upsertLeadState |
| `src/crm/types.ts` | CrmTurn (raw_input_summary, stage_at_turn), CrmFact, CrmLeadState |
| `src/memory/service.ts` | registerMemoryEvent (attendance_memory) |
| `src/memory/store.ts` | Store in-memory para memória evolutiva |
| `src/context/schema.ts` | SemanticTurnPacket, ExtractedSignal (módulo context — não integrado ao pipeline atual) |
| `src/context/living-memory.ts` | LivingMemorySnapshot (módulo context — não integrado ao pipeline atual) |
| `src/context/multi-signal.ts` | MultiSignalTurnConsolidation (módulo context — não integrado ao pipeline atual) |
| `src/meta/core-pipeline-smoke.ts` | Smokes atuais do Core+pipeline |
| `src/meta/facts-stage-advance-proof.ts` | Prova T9.7 — base de referência |
| `src/meta/stage-persistence-proof.ts` | Prova T9.5 |
| `package.json` | Scripts atuais |

---

## 3. Estado atual do LLM

### Assinatura de `callLlm`

```typescript
// src/llm/client.ts
export async function callLlm(
  userMessage: string,
  env: Record<string, unknown>,
): Promise<LlmClientResult>
```

### SYSTEM_PROMPT atual (hardcoded)

```
Você é a Enova, assistente de atendimento imobiliário MCMV.
Responda de forma curta, humana e útil.
Não invente dados.
Não aprove financiamento.
Não diga que o cliente está aprovado.
Não peça documentos ainda se o contexto não justificar.
Não tome decisões de etapa/funil.
Apenas responda a mensagem recebida de forma segura e natural.
```

### Limitações atuais

1. **LLM é cego ao stage** — recebe apenas `userMessage` (texto bruto do cliente). Não sabe em qual etapa do funil está.
2. **LLM não conhece o objetivo atual** — não sabe o que o Core quer coletar (`next_objective`).
3. **LLM não conhece facts** — não sabe o que o lead já disse antes (sem memória conversacional estruturada).
4. **LLM não conhece decisão do Core** — não sabe se o stage avançou (`transicao_stage`) ou se está coletando dados (`coleta_dado`).
5. **Prompt estático** — mesma mensagem de sistema para qualquer lead em qualquer stage.

### `LlmClientResult` atual

```typescript
export interface LlmClientResult {
  ok: boolean;
  reply_text?: string;
  latency_ms?: number;
  error?: string;
  llm_invoked: boolean;
}
```

Não precisa ser alterado na T9.8.

---

## 4. Estado atual do pipeline

### Fluxo em `canary-pipeline.ts`

```
Passo 1:  runInboundPipeline → crmResult { lead_id, turn_id, memory_event_id }
Passo 1.5: getCrmBackend + getLeadState → currentStage
            extractFactsFromText → extractedFacts
            writeLeadFact (persist pending)
            getLeadFacts → factsMap  ← declarado DENTRO do try block
            runCoreEngine → coreDecision  ← declarado NO ESCOPO EXTERNO (let)
            upsertLeadState
Passo 2:  callLlm(userText, env)  ← chama sem contexto; coreDecision acessível,
                                      factsMap NÃO acessível (scoped no try block)
Passo 3:  outbound gates
```

### Dado disponível × acessível em Passo 2

| Dado | Disponível? | Acessível em Passo 2? | Ação necessária |
|---|---|---|---|
| `crmResult.lead_id` | ✓ | ✓ | Nenhuma |
| `crmResult.turn_id` | ✓ | ✓ | Nenhuma |
| `coreDecision` | ✓ | ✓ (`let` no escopo externo, L147) | Nenhuma |
| `coreDecision.stage_current` | ✓ | ✓ | Nenhuma |
| `coreDecision.stage_after` | ✓ | ✓ | Nenhuma |
| `coreDecision.next_objective` | ✓ | ✓ | Nenhuma |
| `coreDecision.block_advance` | ✓ | ✓ | Nenhuma |
| `coreDecision.speech_intent` | ✓ | ✓ | Nenhuma |
| `factsMap` | ✓ (em try block) | ✗ (scoped L187) | **Hoist para `let factsMap` no escopo externo** |
| `event.text_body` | ✓ | ✓ | Nenhuma |
| Histórico de turnos | Requer `getLeadTimeline` | ✗ (não chamado) | T9.8: opcional — ver §8 |

---

## 5. Dados disponíveis para contexto

### Dados prontos (zero custo adicional em T9.8)

| Campo | Origem | Valor exemplo |
|---|---|---|
| `lead_id` | `crmResult.lead_id` | `"uuid-xxx"` |
| `turn_id` | `crmResult.turn_id` | `"uuid-yyy"` |
| `stage_current` | `coreDecision.stage_current` | `"qualification_civil"` |
| `stage_after` | `coreDecision.stage_after` | `"qualification_renda"` |
| `next_objective` | `coreDecision.next_objective` | `"coletar_estado_civil"` |
| `block_advance` | `coreDecision.block_advance` | `false` |
| `speech_intent` | `coreDecision.speech_intent` | `"coleta_dado"` |
| `facts` | `factsMap` (após hoist) | `{ customer_goal: 'comprar_imovel' }` |

### Dados que requerem I/O adicional

| Campo | Custo | Recomendação |
|---|---|---|
| Histórico de turnos | `getLeadTimeline` (1 leitura) | Incluir em T9.8: últimos 3 turnos, `raw_input_summary` ≤ 100 chars cada |
| Memória evolutiva | `getMemoryItems` | **Deixar para T9.10** — mais complexo e ainda in-memory |
| `customer_name` | `getLead` (outra leitura) | Não incluir em T9.8 — sem necessidade imediata |

### Dados que NUNCA devem entrar no prompt

| Dado | Por quê |
|---|---|
| CPF, RG, documentos | Dados sensíveis — risco de vazar em log/erro |
| Senha, token, secret | Óbvio |
| `OPENAI_API_KEY` | Nunca em prompt |
| Texto bruto completo do lead (>200 chars) | Truncado em `raw_input_summary` |
| `wa_id` | Identificador externo — desnecessário no prompt do LLM |
| `renda_principal` (valor exato) | Dado financeiro — pode entrar como range, não como valor exato |

---

## 6. Shape mínimo recomendado de LlmContext

```typescript
// src/llm/client.ts — exportar junto com LlmClientResult

/**
 * Contexto estruturado fornecido ao LLM pelo Core.
 *
 * SOBERANIA:
 *   - Core decide stage. LlmContext informa; LLM não altera stage.
 *   - LLM decide fala. LlmContext orienta o tom e objetivo.
 *   - LLM não grava facts. LLM não cria decisão de negócio.
 *   - Secrets nunca aparecem aqui.
 *
 * RESTRIÇÃO DE TAMANHO:
 *   - facts: máximo 8 chaves, valores primitivos only.
 *   - recent_history: máximo 3 turnos, 100 chars cada.
 *   - Prompt serializado não deve ultrapassar ~1200 tokens.
 */
export interface LlmContext {
  stage_current: string;           // 'discovery' | 'qualification_civil' | ...
  stage_after: string;             // próximo stage autorizado pelo Core
  next_objective: string;          // 'coletar_estado_civil' | 'avancar_para_renda' | ...
  block_advance: boolean;          // true = Core ainda coletando dados
  speech_intent: string;           // 'coleta_dado' | 'transicao_stage' | 'bloqueio'
  facts?: Record<string, unknown>; // facts conhecidos (pending/accepted); sem dados sensíveis
  recent_history?: Array<{         // últimos N turnos para manter coerência
    role: 'user';                  // apenas turnos do cliente (input)
    text: string;                  // raw_input_summary truncado ≤ 100 chars
  }>;
}
```

**Notas sobre o shape:**
- `recent_history` inclui apenas turnos `role: 'user'` (mensagens do cliente), não replies do LLM. Isso evita o LLM replicar falas anteriores e mantém o histórico pequeno.
- `facts` usa `Record<string, unknown>` mas o builder deve filtrar valores não-primitivos e remover campos financeiros explicitamente, se houver política de privacidade mais restrita.
- Nenhum campo `lead_id` ou `turn_id` entra no contexto do LLM — são identificadores internos desnecessários no prompt.

---

## 7. O que entra no contexto da T9.8

| Campo | Justificativa |
|---|---|
| `stage_current` | LLM sabe em que etapa está; adapta tom e perguntas |
| `stage_after` | LLM sabe para onde vai (ou que está bloqueado) |
| `next_objective` | LLM sabe exatamente o que o Core quer coletar agora |
| `block_advance` | LLM sabe se precisa coletar mais (true) ou pode confirmar transição (false) |
| `speech_intent` | `'coleta_dado'` → pergunta. `'transicao_stage'` → confirma/parabéns. `'bloqueio'` → explica restrição |
| `facts` | LLM não repete perguntas já respondidas; adapta abordagem aos facts conhecidos |
| `recent_history` | LLM mantém coerência conversacional sem recriar o histórico inteiro (máx 3 turnos) |

---

## 8. O que NÃO entra no contexto da T9.8

| Dado | Razão | Para quando |
|---|---|---|
| Output guard / validação de reply | Não existe ainda | T9.9 |
| Memória evolutiva (`learning_candidate`) | Complexidade adicional; ainda in-memory | T9.10 |
| Contexto semântico (`SemanticTurnPacket`) | `src/context/` não integrado ao pipeline | T9.12 |
| `LivingMemorySnapshot` | Idem | T9.12 |
| Supabase persistência real | Ainda in-memory | T9.11 |
| Histórico completo de todos os turnos | Prompt gigante → risco de latência e custo | Nunca (só últimos N) |
| CPF, renda exata, documentos | Dados sensíveis | Nunca no prompt |
| `customer_name` | Sem urgência | Opcional em T9.8 ou T9.12 |
| Regras MCMV detalhadas (elegibilidade, faixas) | O SYSTEM_PROMPT já tem o essencial; versão completa vem com output guard | T9.9 |

---

## 9. Estratégia de compatibilidade

### Assinatura proposta

```typescript
export async function callLlm(
  userMessage: string,
  env: Record<string, unknown>,
  context?: LlmContext,         // ← terceiro parâmetro opcional
): Promise<LlmClientResult>
```

**Regra:**
- Sem `context` → usa `SYSTEM_PROMPT` atual (comportamento idêntico ao atual).
- Com `context` → monta `buildDynamicSystemPrompt(context)` e substitui SYSTEM_PROMPT.

**Compatibilidade garantida:**
- Todos os smokes existentes chamam `callLlm(msg, env)` sem terceiro parâmetro → continuam funcionando.
- `LlmCaller` type em `canary-pipeline.ts` precisa ser atualizado para aceitar o parâmetro opcional:
  ```typescript
  // Antes (T9.7):
  type LlmCaller = (msg: string, env: Record<string, unknown>) => Promise<LlmClientResult>;
  // Depois (T9.8):
  type LlmCaller = (msg: string, env: Record<string, unknown>, ctx?: LlmContext) => Promise<LlmClientResult>;
  ```

---

## 10. Estratégia de prompt

### Função `buildDynamicSystemPrompt(context: LlmContext): string`

```typescript
// Exemplo de saída para stage='qualification_civil', next_objective='coletar_estado_civil'

`Você é a Enova, assistente de atendimento imobiliário MCMV.

ETAPA ATUAL: Qualificação Civil
OBJETIVO: Coletar estado civil do lead
SITUAÇÃO: Coletando dados necessários para avançar

REGRAS INVIOLÁVEIS:
- Não decida etapa ou funil. O sistema decide.
- Não aprove financiamento nem diga que o cliente está aprovado.
- Não invente dados nem prometa nada sobre MCMV.
- Responda de forma curta, humana e natural.
- Pergunte apenas o que o objetivo atual exige.

DADOS JÁ COLETADOS:
- customer_goal: comprar_imovel

Responda a mensagem recebida guiando naturalmente para o objetivo da etapa.`
```

### Regras de construção do prompt

| Elemento | Regra |
|---|---|
| Stage label | Tradução simples: `'qualification_civil'` → `'Qualificação Civil'` |
| Next objective | Tradução simples: `'coletar_estado_civil'` → `'Coletar estado civil do lead'` |
| Speech intent | `'coleta_dado'` → "Coletando dados", `'transicao_stage'` → "Confirmando avanço", `'bloqueio'` → "Aguardando dado obrigatório" |
| Facts incluídos | Apenas chaves simples. `renda_principal` → redact ou range. Máx 8 chaves. |
| Histórico | `"Mensagens anteriores (resumo):\n- lead: [text truncado 100c]\n..."` |
| Tamanho total | Budget máximo: ~1200 tokens para system + 300 para user → total <1500 tokens |

### Mapa de stage → label humano

```typescript
const STAGE_LABEL: Record<string, string> = {
  discovery:               'Apresentação inicial',
  qualification_civil:     'Qualificação Civil',
  qualification_renda:     'Qualificação de Renda',
  qualification_eligibility: 'Verificação de Elegibilidade',
  qualification_special:   'Qualificação Especial',
  docs_prep:               'Preparação de Documentos',
  docs_collection:         'Coleta de Documentos',
  visit:                   'Agendamento de Visita',
  broker_handoff:          'Passagem ao Correspondente',
};
```

---

## 11. Soberania Core × LLM

```
Core → CoreDecision (stage_after, next_objective, block_advance, speech_intent)
     ↓
LlmContext (empacota CoreDecision + factsMap + histórico curto)
     ↓
callLlm → reply_text (APENAS texto ao cliente)
     ↓
[T9.9] Output Guard valida reply_text antes do outbound

INVARIANTES:
  ✓ Core decide stage. LLM recebe stage já resolvido.
  ✓ LLM decide fala. Nunca decide stage, fact, aprovação.
  ✓ LLM não grava facts. writeLeadFact é chamado pelo pipeline, não pelo LLM.
  ✓ LLM não altera stage. upsertLeadState é chamado depois do Core, não depois do LLM.
  ✓ LlmContext é somente leitura. Não tem `may_advance_stage`, `may_persist_slot`.
  ✓ Secrets nunca aparecem em LlmContext.
```

---

## 12. Segurança e privacidade

### Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `facts` contém dado sensível (ex: renda_principal) | Em `buildLlmContext()`: omitir chaves com dados financeiros explícitos ou converter para range (`'renda_principal'` → `'renda_declarada: informada'`) |
| `raw_input_summary` vaza informação sensível | Truncado a 100 chars; `pipeline.ts` já usa `slice(0, 200)`; T9.8 usa `slice(0, 100)` |
| Prompt gigante → latência + custo | Budget explícito: ≤1200 tokens system; ≤3 turnos histórico; ≤8 facts |
| `OPENAI_API_KEY` em log | Já mitigado: `readApiKey` nunca loga; a chave só aparece no header HTTP |
| Output do LLM contém dados internos | Output Guard (T9.9) detecta padrões proibidos (stage, IDs, promises) |
| Prompt do LLM logado por `diagLog` | `diagLog('llm.context.built', { stage, objective, facts_count })` — nunca logar o prompt completo |

### O que `diagLog` deve emitir em T9.8

```typescript
diagLog('llm.context.built', {
  stage_current: context.stage_current,
  stage_after: context.stage_after,
  next_objective: context.next_objective,
  speech_intent: context.speech_intent,
  facts_count: Object.keys(context.facts ?? {}).length,
  history_turns: context.recent_history?.length ?? 0,
  // NUNCA: facts values, history texts, prompt completo
});
```

---

## 13. Patch mínimo recomendado para T9.8

### Arquivos a alterar

| Arquivo | Tipo de alteração |
|---|---|
| `src/llm/client.ts` | Adicionar `LlmContext` interface + `buildDynamicSystemPrompt` + parâmetro opcional |
| `src/meta/canary-pipeline.ts` | Hoist `factsMap`; importar `LlmContext`; montar contexto; passar a `llmCaller` |

### Nenhum outro arquivo deve mudar.

### Ordem de implementação

**Passo A — `src/llm/client.ts`:**
1. Exportar interface `LlmContext`
2. Criar função `buildDynamicSystemPrompt(context: LlmContext): string` (privada)
3. Adicionar `context?: LlmContext` como terceiro parâmetro de `callLlm`
4. No corpo: `const systemPrompt = context ? buildDynamicSystemPrompt(context) : SYSTEM_PROMPT;`
5. Usar `systemPrompt` no `messages[0].content`
6. `LlmClientResult` inalterado

**Passo B — `src/meta/canary-pipeline.ts`:**
1. Importar `LlmContext` de `'../llm/client.ts'`
2. Atualizar tipo `LlmCaller`: adicionar `ctx?: LlmContext` como terceiro param
3. Hoist `let factsMap: Record<string, unknown> = {};` para junto de `let coreDecision`
4. No bloco [B]+[C] (try de Passo 1.5): manter `const factsMap = {}` local para leitura, mas atribuir ao hoisted
   Alternativa mais limpa: declarar `let cachedFacts: Record<string, unknown> = {};` no outer scope; dentro do try: `cachedFacts = factsMap;`
5. Antes de chamar `llmCaller` em Passo 2:
   ```typescript
   const llmContext: LlmContext | undefined = coreDecision
     ? {
         stage_current: coreDecision.stage_current,
         stage_after: coreDecision.stage_after,
         next_objective: coreDecision.next_objective,
         block_advance: coreDecision.block_advance,
         speech_intent: coreDecision.speech_intent,
         facts: cachedFacts,
       }
     : undefined;
   ```
6. Chamar: `llmCaller(userText, env, llmContext)`
7. Adicionar `diagLog('llm.context.built', {...})` com contagens (nunca com valores)

### Ponto exato de inserção no pipeline

```
canary-pipeline.ts:
  Passo 1.5 (Core) — já existe
  ↓
  [NOVO - T9.8] Bloco [D] — montar LlmContext com dados do Core
  ↓
  Passo 2 — LLM agora recebe LlmContext
```

### Fallback seguro

Se `coreDecision` for `undefined` (ex: Core lançou exception capturada):
- `llmContext` fica `undefined`
- `callLlm(userText, env, undefined)` → usa SYSTEM_PROMPT estático
- Comportamento idêntico ao atual
- Nenhuma regressão possível

---

## 14. Smokes exigidos para T9.8

### Novo smoke a criar

**`src/llm/context-smoke.ts`** — `smoke:llm:context`

Checks mínimos obrigatórios:
- `LlmContext` interface existe e é importável
- `callLlm` aceita terceiro parâmetro sem quebrar
- `callLlm(msg, env)` sem context → retorna `ok: false` sem API key (comportamento atual preservado)
- `callLlm(msg, env, context)` com context → mesmo comportamento (sem API key → `ok: false`)
- `buildDynamicSystemPrompt` (se exportada) inclui stage, objective, speech_intent no output
- `buildDynamicSystemPrompt` NÃO inclui valores de `renda_principal` raw
- `buildDynamicSystemPrompt` NÃO inclui `OPENAI_API_KEY`, `Bearer`, `sk-`, `sb-`
- Prompt gerado ≤ 3000 chars (budget de segurança)
- context sem facts → prompt não quebra
- context com facts vazio → prompt não quebra
- context com historical 3 turnos → prompt inclui histórico truncado
- `LlmCaller` type aceitável com ou sem context

### Regressões obrigatórias (já existem)

| Smoke | Resultado esperado |
|---|---|
| `smoke:llm:context` | **PASS (novo)** |
| `smoke:meta:canary` | 41/41 PASS |
| `smoke:meta:core-pipeline` | 23/23 PASS |
| `prove:t9.7-facts-stage-advance` | 44/44 PASS |
| `prove:t9.5-stage-persistence` | 34/34 PASS |
| `smoke:runtime:env` | 53/53 PASS |
| `smoke:runtime:fallback-guard` | 41/41 PASS |
| `prove:g8-readiness` | 7/7 PASS |
| `smoke:core:text-extractor` | 58/58 PASS |

---

## 15. Fora de escopo confirmado

Esta PR-DIAG não altera nenhum arquivo `src/`.

Confirmação explícita do que fica para PRs futuras:

| Escopo | PR |
|---|---|
| Output Guard: validação de reply_text antes do outbound | T9.9 |
| Memória evolutiva no contexto LLM | T9.10 |
| Supabase write real para `enova_state` e `crm_lead_meta` | T9.11 |
| `SemanticTurnPacket` / `LivingMemorySnapshot` integrados ao pipeline | T9.12 |
| Telemetria com `correlation_id` wa→lead→core→llm→outbound | T9.13 |
| Output Guard MCMV detalhado (faixas de renda, elegibilidade) | T9.9 |
| `customer_name` no contexto | Opcional T9.8 ou T9.12 |
| Histórico LLM replies (assistente) no prompt | Nunca / T9.12 se necessário |

---

## 16. Próxima PR autorizada

**T9.8 — IMPL LlmContext estruturado**

Scope exato da T9.8 (derivado deste diagnóstico):
1. `src/llm/client.ts` — exportar `LlmContext` + `buildDynamicSystemPrompt` + parâmetro opcional
2. `src/meta/canary-pipeline.ts` — hoist `cachedFacts`; montar `llmContext`; passar a `llmCaller`
3. `src/llm/context-smoke.ts` — `smoke:llm:context` (mínimo 12 checks)
4. `package.json` — `"smoke:llm:context"` adicionado
5. Arquivos vivos (STATUS, HANDOFF, LATEST) — atualizados
6. Regressões: todos os 9 smokes acima passando

G9 permanece aberto após T9.8.
