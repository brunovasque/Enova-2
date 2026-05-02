# T9.10-DIAG — Diagnóstico memória curta / contexto histórico controlado

**Data:** 2026-05-02  
**Tipo:** PR-DIAG (read-only)  
**Branch:** `diag/t9.10-memoria-curta-contexto`  
**Precedida por:** PR-T9.9-IMPL — Output Guard para respostas do LLM (PR #191)  
**Próxima PR autorizada:** T9.10 — IMPL Memória curta / contexto histórico controlado  

---

## 1. Veredito executivo

**T9.10 pode ser implementada com patch cirúrgico. Sem bloqueio real.**

O ponto de integração está mapeado com precisão, a função de leitura de histórico já existe (`getLeadTimeline`), o campo `recent_turns` já está declarado em `LlmContext` mas nunca é populado, e `buildDynamicSystemPrompt` ainda não renderiza esse campo. O patch envolve: (1) ler a timeline no Passo 1.5 do `canary-pipeline.ts`, (2) sanitizar e truncar os turnos recentes, (3) montar o campo `recent_turns` no `llmContext`, e (4) atualizar `buildDynamicSystemPrompt` para renderizá-lo no system prompt. Nenhum novo módulo de infraestrutura é necessário.

**Risco principal:** `CrmTurn.raw_input_summary` contém os primeiros 200 chars do texto bruto do usuário — pode conter CPF, e-mail, telefone, ou links. Sanitização é obrigatória antes de enviar ao LLM.

**Limitação conhecida e aceita para T9.10:** `CrmTurn` não armazena a resposta do assistente (sem campo `reply_text` na tabela). Portanto `recent_turns` terá apenas turnos com `role: 'user'`. Adicionar armazenamento da resposta do assistente fica para PR futura.

---

## 2. Arquivos lidos

| Arquivo | Propósito |
|---|---|
| `src/meta/canary-pipeline.ts` | Orquestrador principal — ponto de integração |
| `src/meta/pipeline.ts` | Inbound pipeline — como o turno é criado |
| `src/llm/client.ts` | LlmContext shape atual + buildDynamicSystemPrompt |
| `src/llm/context-smoke.ts` | Smoke T9.8 — verifica o contexto atual |
| `src/llm/output-guard.ts` | Guard que protege a resposta final |
| `src/llm/output-guard-smoke.ts` | Smoke T9.9 — 48/48 PASS |
| `src/crm/service.ts` | `getLeadTimeline`, `createConversationTurn` — funções CRM |
| `src/crm/store.ts` | Factory `getCrmBackend` |
| `src/crm/types.ts` | `CrmTurn` — estrutura exata dos campos |
| `src/memory/service.ts` | API de memória evolutiva — descartada como fonte |
| `src/memory/store.ts` | Store in-memory da memória evolutiva |
| `src/memory/types.ts` | `MemoryRecord` — estrutura do serviço de memória |
| `src/context/schema.ts` | Semantic layer — descartada como fonte para T9.10 |
| `src/context/living-memory.ts` | Short-term context — não conectada ao runtime |
| `src/context/multi-signal.ts` | Signal routing — não conectada ao runtime |
| `src/meta/stage-persistence-proof.ts` | Prova T9.5 — stage persiste entre turnos |
| `src/meta/facts-stage-advance-proof.ts` | Prova T9.7 — facts → stage avança |
| `package.json` | Scripts disponíveis |
| `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` | Contrato ativo |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | Adendo soberania IA |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | Adendo LLM-first |
| `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` | Adendo fechamento por prova |

---

## 3. Estado atual do histórico/conversa

### Onde o turno é salvo

Em `src/meta/pipeline.ts`, Passo 2 (`createConversationTurn`):

```typescript
// pipeline.ts:129-132
const summary = event.text_body
  ? event.text_body.slice(0, 200)
  : `[${event.message_type ?? event.kind}]`;
const result = await createConversationTurn(backend, lead_id, 'whatsapp', summary, stageAtTurn);
```

Os turnos ficam na tabela `crm_turns` via `CrmInMemoryBackend` (in-memory em PROD atual) ou Supabase quando `SUPABASE_REAL_ENABLED=true`.

### Campos que guardam texto do usuário

Em `src/crm/types.ts`, `CrmTurn`:

```typescript
export interface CrmTurn {
  turn_id: string;
  lead_id: string;
  channel_type: string;        // 'whatsapp'
  raw_input_summary: string;   // text_body.slice(0, 200) — truncado em createConversationTurn para 500 chars
  stage_at_turn: string;       // stage ativo quando o turno foi criado
  model_name: string | null;   // null em PROD (não preenchido atualmente)
  latency_ms: number | null;   // null em PROD (não preenchido atualmente)
  created_at: string;
}
```

`raw_input_summary` recebe `event.text_body.slice(0, 200)` em `pipeline.ts`, e `createConversationTurn` trunca para 500 chars como salvaguarda adicional.

### Texto da resposta do assistente

**Não existe.** `CrmTurn` não tem campo `reply_text` ou equivalente. A resposta gerada pelo LLM em `canary-pipeline.ts` nunca é persistida. Este é um gap conhecido e aceito para T9.10 — adicionar persistência da resposta é escopo de PR futura.

### Resumo/truncamento já existente

Sim — `pipeline.ts` já trunca `text_body` para 200 chars antes de salvar em `raw_input_summary`. `createConversationTurn` aplica salvaguarda adicional de 500 chars. Não existe mecanismo de sumarização semântica — apenas corte bruto.

### Função de leitura de timeline

**`getLeadTimeline` existe** em `src/crm/service.ts:147`:

```typescript
export async function getLeadTimeline(
  backend: CrmBackend,
  lead_id: string,
): Promise<CrmListResult<CrmTurn>> {
  const turns = await backend.findMany<CrmTurn>('crm_turns', (r) => r.lead_id === lead_id);
  turns.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return listOk(turns);
}
```

Retorna todos os turnos do lead ordenados por `created_at` crescente (mais antigo primeiro).

---

## 4. Estado atual do LlmContext

Shape atual em `src/llm/client.ts:38-48`:

```typescript
export interface LlmContext {
  stage_current: string;
  stage_after: string;
  next_objective: string;
  facts_count: number;
  facts_summary: Record<string, string>;
  speech_intent?: string;
  // Histórico recente — máx 3 turnos, truncado a 100 chars/mensagem.
  recent_turns?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
```

**O campo `recent_turns` já está declarado.** Contudo:
1. Em `canary-pipeline.ts`, `llmContext` é montado SEM popular `recent_turns` — o campo fica `undefined`.
2. Em `buildDynamicSystemPrompt`, **`recent_turns` não é renderizado** — o campo é declarado mas a função não o lê.

T9.10 deve: (a) popular `recent_turns` em `canary-pipeline.ts`, e (b) renderizar no `buildDynamicSystemPrompt`.

---

## 5. Fonte recomendada da memória curta

**Fonte recomendada: CRM timeline via `getLeadTimeline`.**

### Por que não o Memory Service

`src/memory/service.ts` armazena `MemoryRecord` com `summary`, `category`, `event_type`, `risk_level` — é um registro de eventos de atendimento evolutivo, não um log de conversa. A estrutura não é adequada para reconstruir turnos recentes. Além disso, `summary` em `MemoryRecord` é uma frase descritiva como `"Mensagem WhatsApp recebida: ..."` — não o texto bruto do cliente.

### Por que não o Context Module

`src/context/living-memory.ts`, `schema.ts`, `multi-signal.ts` existem mas **não estão conectados ao runtime**. São uma camada de abstração semântica mais complexa (signals, dispositions, TTLs) que não tem acesso direto a `crm_turns`. Usá-los implicaria conectar todo o pipeline de contexto, o que está fora do escopo de T9.10.

### Por que CRM timeline

- `getLeadTimeline` já existe e retorna dados reais.
- `CrmTurn.raw_input_summary` tem os primeiros 200 chars do texto do usuário — suficiente para contexto curto.
- `stage_at_turn` permite filtrar ou etiquetar turnos por stage, evitando confusão histórica.
- Já é usado indiretamente em `canary-pipeline.ts` (o backend CRM já é obtido no Passo 1.5).
- Requer apenas sanitização adicional — não requer novo módulo.

---

## 6. Ponto exato de integração futura

**Ponto:** Dentro do bloco `try` do Passo 1.5 em `canary-pipeline.ts`, **após** `cachedFacts = factsMap` (linha ~197 do arquivo atual) e **antes** de `coreDecision = runCoreEngine(...)` ou alternativamente logo após o `coreDecision` e antes de `let llmContext: LlmContext | undefined`.

O ponto recomendado preciso é **após** a linha `cachedFacts = factsMap` e **antes** da montagem do `llmContext` no Passo 2. A estrutura atual:

```
// Passo 1.5 (canary-pipeline.ts)
  // Bloco [A] — leitura do state atual
  // Bloco [B] — extração de facts do texto
  // Bloco [C] — persistência de facts (writeLeadFact)
  // Bloco [D] — leitura de facts do CRM (getLeadFacts)
  // cachedFacts = factsMap                       ← após esta linha
  // [PONTO DE INSERÇÃO: Bloco [E] — ler timeline e montar recentHistory]
  // coreDecision = runCoreEngine(...)
  // await upsertLeadState(...)

// Passo 2 — LLM
  // llmContext = { ..., recent_turns: recentHistory }  ← popular aqui
```

**Alternativa válida:** Ler a timeline no início do Passo 1.5 (antes dos facts) para que o backend já esteja instanciado. O backend CRM já é obtido com `getCrmBackend` no início do bloco try — aproveitar a mesma instância.

**Variável hoistada:** `recentHistory` deve ser hoistada para o escopo externo (como `cachedFacts` foi hoistado em T9.8), para ser acessível no Passo 2 onde `llmContext` é montado.

---

## 7. Shape recomendado para recent_history

**O campo já existe em `LlmContext` como `recent_turns`.** T9.10 deve usar exatamente esse nome para manter consistência com o tipo já declarado.

```typescript
// Shape já declarado em src/llm/client.ts
recent_turns?: Array<{ role: 'user' | 'assistant'; content: string }>;
```

Para a variável interna no pipeline, nomear `recentHistory`:

```typescript
// Hoistado no escopo externo (como cachedFacts)
let recentHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
```

**Apenas `role: 'user'`** para T9.10, dado que a resposta do assistente não é persistida. Não forçar `role: 'assistant'` com texto inventado — isso viola a soberania da IA.

---

## 8. Janela de contexto

| Parâmetro | Valor recomendado | Justificativa |
|---|---|---|
| Máximo de turnos | **3** | Já declarado no comentário de `LlmContext` (`// máx 3 turnos`); evita prompt pesado; contexto imediato é suficiente para MCMV |
| Máximo de chars por turno | **100** | Já declarado no comentário de `LlmContext` (`// truncado a 100 chars/mensagem`); `raw_input_summary` tem 200 chars max — truncar à metade |
| Máximo total de chars | **300** | 3 turnos × 100 chars = 300 chars máx para o bloco de histórico; mantém budget de 4800 chars do system prompt |
| Mensagem atual incluída? | **Não** | A mensagem atual já entra como `role: 'user'` no payload do chat. Incluí-la em `recent_turns` duplicaria o conteúdo |
| Apenas mensagens do lead? | **Sim** | Somente `role: 'user'` porque `CrmTurn` não armazena reply do assistente |
| Ordenação | **Mais recente primeiro** | Inverter a lista retornada por `getLeadTimeline` (que retorna crescente) para os 3 mais recentes; depois reverter para ordem cronológica ao incluir no prompt |
| Turno atual excluído | **Sim** | Pegar os N turnos ANTES do turno atual (`turn_id` do `crmResult.turn_id`) |

**Algoritmo recomendado:**
```
1. Ler todos os turnos via getLeadTimeline (sorted crescente)
2. Filtrar fora o turn_id do turno atual (crmResult.turn_id)
3. Pegar os últimos 3 (tail)
4. Para cada turno: sanitize + truncate(raw_input_summary, 100)
5. Mapear para { role: 'user', content: sanitized }
6. O resultado fica em ordem cronológica (mais antigo → mais recente)
```

---

## 9. Sanitização obrigatória

`raw_input_summary` contém os primeiros 200 chars do texto bruto do usuário — pode incluir dados sensíveis. A sanitização deve ser aplicada **antes** de incluir no `recent_turns`.

### Regras de remoção obrigatórias

| Dado sensível | Pattern | Substituição |
|---|---|---|
| CPF | `/\d{3}\.\d{3}\.\d{3}-\d{2}/g` | `[cpf]` |
| RG | `/\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]/g` | `[rg]` |
| CNH | `/[A-Z]{2}\s*\d{9}/g` | `[cnh]` |
| E-mail | `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g` | `[email]` |
| Telefone | `/\(?\d{2}\)?\s*\d{4,5}-?\d{4}/g` | `[tel]` |
| URLs/links | `/https?:\/\/\S+/gi` | `[link]` |
| URLs Supabase | `/[a-z0-9]{20,}\.supabase\.co\S*/gi` | `[link]` |
| Tokens/secrets | `/\b(sk-\|Bearer\s+\|sb-)[A-Za-z0-9_\-]{10,}/gi` | `[token]` |
| Truncamento após sanitização | `slice(0, 100)` | — |

### O que NÃO sanitizar

- Valores financeiros genéricos (ex.: "3500", "R$ 3.500") — são importantes para o contexto e não são secretos per se.
- Nomes próprios simples — não há padrão seguro para removê-los sem perder contexto.
- Stage names no texto do usuário — não expõem arquitetura interna.

### Função sugerida para T9.10

```typescript
// Módulo puro, sem deps externas — pode ficar em canary-pipeline.ts ou em módulo auxiliar
function sanitizeTurnText(text: string, maxLen = 100): string {
  return text
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[cpf]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    .replace(/\(?\d{2}\)?\s*\d{4,5}-?\d{4}/g, '[tel]')
    .replace(/https?:\/\/\S+/gi, '[link]')
    .replace(/\bsk-[A-Za-z0-9_\-]{10,}/gi, '[token]')
    .replace(/Bearer\s+\S{10,}/gi, '[token]')
    .trim()
    .slice(0, maxLen);
}
```

---

## 10. Regras anti-confusão de stage

O histórico antigo pode mencionar stages, objetivos ou perguntas que já foram superados. Para evitar que o LLM responda fora do stage atual:

### Regras estruturais

1. **`stage_current` sempre tem prioridade.** O `llmContext.stage_current` é o único vetor de orientação de stage para o LLM. `recent_turns` é apenas contexto auxiliar de conversa.

2. **Histórico não avança stage.** Core é soberano do stage. O LLM não pode deduzir um avanço de stage a partir de turnos antigos. O Core já computou `coreDecision` antes do LLM ser chamado.

3. **Histórico não decide regra de negócio.** A janela de contexto é limitada a 3 turnos exatamente para evitar que o LLM "lembre" de discussões antigas de renda, documentos, ou status que foram superadas por stages mais recentes.

4. **`stage_at_turn` disponível mas não renderizado no prompt.** O campo `stage_at_turn` de cada `CrmTurn` não deve ser incluído no prompt — exporia nomes internos de stage. Apenas o `content` sanitizado deve ser renderizado.

5. **System prompt é o quadro normativo.** O bloco de turnos recentes deve ser apresentado como "contexto da conversa anterior" — nunca como "regras" ou "definições de etapa".

### Instrução sugerida no system prompt

```
Contexto recente da conversa (para continuidade natural, não para regras de etapa):
  [turno 1 sanitizado]
  [turno 2 sanitizado]
  [turno 3 sanitizado]
```

O rótulo deixa claro ao LLM que são dados auxiliares de contexto, não diretivas.

---

## 11. Regras anti-reabertura de conversa encerrada

### Estado atual

Não existe sinal explícito de "encerramento de conversa" em `CrmTurn`, `CrmLeadState` ou no pipeline. O stage `broker_handoff` e `docs_collection` são os stages mais avançados no Core, mas não existe flag `conversation_closed` ou equivalente.

### Regra mínima para T9.10

T9.10 **não deve inventar** um mecanismo de encerramento. A regra mínima é:

- O histórico de turnos é limitado a 3 turnos recentes. Conversa "encerrada" simplesmente não terá turnos recentes relevantes — o LLM responderá com base no `stage_current` e `next_objective` do Core.
- Se `stage_current` indica `broker_handoff` ou stage final, o Core já instrui o LLM via `next_objective` e `speech_intent`. O histórico não interfere.
- **Não adicionar lógica de "não responder se encerrado"** — isso é decisão do Core, não do módulo de memória curta.

---

## 12. Relação com Output Guard

O Output Guard (`src/llm/output-guard.ts`) é a última camada antes do outbound. T9.10 **não deve alterar o guard**.

O fluxo completo permanece:

```
LLM (gera reply_text com contexto enriquecido por recent_turns)
  → applyOutputGuard(reply_text, { stage_current })
  → se allowed: replyText = safe_reply_text
  → se blocked: replyText = undefined → outbound para via 'reply_text_missing'
```

`recent_turns` no prompt não cria novos riscos de guard porque:
- Os turnos são sanitizados antes de entrar no prompt.
- O guard valida a **saída** do LLM, não a entrada.
- O guard já bloqueia qualquer vazamento de CPF, secrets, aprovações — independentemente do que foi incluído no contexto.

---

## 13. Estratégia de implementação mínima

### Arquivos que devem mudar na T9.10

| Arquivo | Ação | Justificativa |
|---|---|---|
| `src/meta/canary-pipeline.ts` | MODIFICAR | Adicionar leitura de timeline (Bloco [E]), hoisting de `recentHistory`, popular `llmContext.recent_turns` |
| `src/llm/client.ts` | MODIFICAR | Atualizar `buildDynamicSystemPrompt` para renderizar `recent_turns` no system prompt |
| `src/llm/short-memory-context-smoke.ts` | CRIAR | Smoke novo — ≥20 checks |
| `package.json` | MODIFICAR | Adicionar `smoke:llm:short-memory-context` |
| `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | MODIFICAR | Atualizar gate + próxima PR |
| `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | MODIFICAR | Adicionar entrada T9.10 |
| `schema/handoffs/T9_LLM_FUNIL_SUPABASE_HANDOFF.md` | MODIFICAR | Atualizar com T9.10 |

### Arquivos que NÃO devem mudar

- `src/crm/service.ts` — `getLeadTimeline` já existe.
- `src/crm/types.ts` — `CrmTurn` já tem os campos necessários.
- `src/llm/output-guard.ts` — guard não muda.
- `src/meta/pipeline.ts` — pipeline de inbound não muda.
- Supabase, memory, context module — fora de escopo.

### Ordem de implementação recomendada

1. **Adicionar import de `getLeadTimeline`** em `canary-pipeline.ts` (já tem `getCrmBackend`, `getLeadState`, `getLeadFacts`).
2. **Hoist `recentHistory`** no escopo externo (como `cachedFacts`).
3. **Bloco [E]** dentro do try do Passo 1.5:
   ```typescript
   // Bloco [E] — Memória curta (T9.10)
   const timelineResult = await getLeadTimeline(coreBackend, crmResult.lead_id);
   const currentTurnId = crmResult.turn_id;
   recentHistory = timelineResult.records
     .filter((t) => t.turn_id !== currentTurnId)
     .slice(-3)
     .map((t) => ({
       role: 'user' as const,
       content: sanitizeTurnText(t.raw_input_summary),
     }));
   diagLog('short_memory.built', {
     turns_total: timelineResult.records.length,
     turns_included: recentHistory.length,
   });
   ```
4. **Incluir `recent_turns: recentHistory`** no `llmContext` em Passo 2.
5. **Atualizar `buildDynamicSystemPrompt`** para renderizar `recent_turns`:
   ```typescript
   if (context.recent_turns && context.recent_turns.length > 0) {
     lines.push('\nContexto recente da conversa (para continuidade natural, não para regras de etapa):');
     for (const turn of context.recent_turns) {
       lines.push(`  [${turn.role}]: ${turn.content}`);
     }
   }
   ```
6. **Criar smoke** `src/llm/short-memory-context-smoke.ts` — verifica: recent_turns no prompt, sanitização ativa, máx 3 turnos, sem turno atual duplicado, sem CPF/email/tel no output, `stage_current` tem prioridade, prompt ≤4800 chars.
7. **Adicionar script** em `package.json`.
8. **Atualizar live files** (STATUS, handoffs).

---

## 14. Smokes exigidos para T9.10

| Smoke | Motivo |
|---|---|
| `smoke:llm:short-memory-context` ≥20 PASS | Smoke novo — valida recent_turns, sanitização, janela, não-duplicação, budget |
| `smoke:llm:context` 30 PASS | Regressão — buildDynamicSystemPrompt não quebrou sem recent_turns |
| `smoke:llm:output-guard` 48 PASS | Regressão — guard não alterado |
| `smoke:meta:canary` 41 PASS | Regressão — canary-pipeline funciona com recent_turns |
| `smoke:meta:core-pipeline` 23 PASS | Regressão — Core + pipeline não afetados |
| `prove:t9.7-facts-stage-advance` 44 PASS | Regressão — facts e stage não afetados |
| `prove:t9.5-stage-persistence` 58 PASS | Regressão — stage persiste (não afetado) |
| `smoke:runtime:env` 53 PASS | Regressão — env validation inalterada |
| `smoke:runtime:fallback-guard` 41 PASS | Regressão — fallback guard inalterado |
| `prove:g8-readiness` APROVADO | Gate mínimo obrigatório |

---

## 15. Fora de escopo confirmado

Esta PR-DIAG **não altera nenhum arquivo** em `src/`.

Explicitamente fora do escopo de T9.10:

- Persistir a resposta do assistente em `CrmTurn` (novo campo `reply_text`).
- Conectar o Context Module (`living-memory.ts`, `multi-signal.ts`) ao runtime.
- Sumarização semântica dos turnos (NLP).
- Filtro por stage histórico (usar `stage_at_turn` para filtrar turnos de stages muito antigos).
- Integração com Memory Service.
- Encerramento explícito de conversa (flag `conversation_closed`).
- Alteração do Output Guard.
- Alteração do Core Engine.
- Alteração de facts extraction.
- Alteração de outbound.
- Alteração de webhook.
- Alteração de Supabase.
- Alteração de deploy/workflow.
- Fechamento de G9.

---

## 16. Patch mínimo recomendado para T9.10

### Funções a criar

```typescript
// Em canary-pipeline.ts (função local ou inline)
function sanitizeTurnText(text: string, maxLen = 100): string {
  return text
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[cpf]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    .replace(/\(?\d{2}\)?\s*\d{4,5}-?\d{4}/g, '[tel]')
    .replace(/https?:\/\/\S+/gi, '[link]')
    .replace(/\bsk-[A-Za-z0-9_\-]{10,}/gi, '[token]')
    .replace(/Bearer\s+\S{10,}/gi, '[token]')
    .trim()
    .slice(0, maxLen);
}
```

### Funções a alterar

Em `src/llm/client.ts`:
- `buildDynamicSystemPrompt`: adicionar renderização de `recent_turns` após o bloco de facts, com label explícito.

Em `src/meta/canary-pipeline.ts`:
- Hoist `let recentHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];` no escopo externo.
- Adicionar import de `getLeadTimeline`.
- Bloco [E] no Passo 1.5 (dentro do try, após `cachedFacts = factsMap`).
- Popular `llmContext.recent_turns = recentHistory` na montagem do contexto.
- Adicionar `diagLog('short_memory.built', { turns_total, turns_included })`.

### Como ler a timeline

```typescript
const timelineResult = await getLeadTimeline(coreBackend, crmResult.lead_id);
```

Usar o mesmo `coreBackend` já instanciado no Passo 1.5 — sem nova instância de backend.

### Como sanitizar e montar

```typescript
const currentTurnId = crmResult.turn_id;
recentHistory = timelineResult.records
  .filter((t) => t.turn_id !== currentTurnId)  // excluir turno atual
  .slice(-3)                                    // máx 3 mais recentes
  .map((t) => ({
    role: 'user' as const,
    content: sanitizeTurnText(t.raw_input_summary),
  }));
```

### Como renderizar no prompt

```typescript
if (context.recent_turns && context.recent_turns.length > 0) {
  lines.push('\nContexto recente da conversa (para continuidade natural, não para regras de etapa):');
  for (const turn of context.recent_turns) {
    lines.push(`  [${turn.role}]: ${turn.content}`);
  }
}
```

### Como testar

`smoke:llm:short-memory-context` deve cobrir:
1. `buildDynamicSystemPrompt` com `recent_turns` inclui os turnos no prompt.
2. Turnos sanitizados: CPF → `[cpf]`, email → `[email]`, tel → `[tel]`, links → `[link]`.
3. Máximo de 3 turnos respeitado.
4. Turno atual não duplicado (filtro por `turn_id`).
5. Prompt total ≤ 4800 chars mesmo com recent_turns.
6. Sem recent_turns → prompt válido (retrocompatibilidade).
7. recent_turns com apenas 1 turno → funciona.
8. `stage_current` presente mesmo com recent_turns.
9. Sanitização não quebra texto sem dados sensíveis.
10. `replacement_used` permanece false (guard não alterado).

---

## 17. Próxima PR autorizada

**T9.10 — IMPL Memória curta / contexto histórico controlado**

Esta PR-DIAG é exclusivamente preparatória. Ela documenta a análise e define a estratégia. A implementação real acontece na próxima PR autorizada: T9.10-IMPL.

G9 permanece **ABERTO**.
