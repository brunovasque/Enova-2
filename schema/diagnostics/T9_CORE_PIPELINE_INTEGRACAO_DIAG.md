# T9.3 — Diagnóstico Integração Core ↔ Pipeline WhatsApp

**Tipo:** PR-DIAG — Read-only  
**Data:** 2026-05-02  
**Contrato:** `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`  
**Diagnóstico base:** T9.2 CONCLUÍDA (BLK-05 resolvido); T9.3 é pré-condição de T9.4  
**PR:** `diag/t9.3-core-pipeline-integracao`

---

## 1. Veredito executivo

**T9.4 pode ser implementada com patch cirúrgico. Não há bloqueio estrutural.**

`runCoreEngine` tem assinatura clara (`LeadState → CoreDecision`), tipos estáveis e sem dependência de runtime externo. O ponto de integração em `canary-pipeline.ts` está identificado (entre Passo 1 e Passo 2). A função `getLeadState` já existe em `service.ts`. Os parsers L04–L17 trabalham com `facts_current` já disponíveis no CRM — não precisam de raw_text para o patch mínimo.

Há **4 lacunas operacionais** a resolver na T9.4:
1. Nenhuma chamada a `runCoreEngine` no pipeline (BLK-01)
2. `stage_at_turn` sempre `'unknown'`; `CrmLeadState.stage_current` nunca atualizado (BLK-02)
3. Não existe função `upsertLeadState` em `service.ts` — T9.4 precisa criar
4. `stage_current = 'unknown'` para leads novos — Core lançaria exceção; patch precisa fazer default para `'discovery'`

Lacunas que **não bloqueiam T9.4** (resolvidas em PRs futuras):
- BLK-03: parsers com `facts_extracted: {}` vazio — funcional, apenas sem facts do turno
- BLK-04: LLM sem `LlmContext` estruturado — resolvido em T9.8

---

## 2. Arquivos lidos

| Arquivo | Relevância |
|---|---|
| `src/core/engine.ts` | Ponto de entrada `runCoreEngine`, 9 caminhos de decisão por stage |
| `src/core/types.ts` | `LeadState`, `CoreDecision`, `StageId`, `GateId`, `GateResult` |
| `src/meta/canary-pipeline.ts` | Orquestrador principal — 3 passos: CRM → LLM → outbound |
| `src/meta/pipeline.ts` | `runInboundPipeline` — CRM upsert + turn + memória |
| `src/crm/service.ts` | `getLeadState`, `getLeadFacts`, `upsertLeadByPhone`, `createConversationTurn` |
| `src/crm/types.ts` | `CrmLeadState`, `CrmFact`, `CrmTurn` |
| `src/llm/client.ts` | `callLlm(userMessage, env)` — assinatura atual |
| `src/core/topo-parser.ts` | Interface do parser: `TopoTurnExtract { facts_current, facts_extracted }` |
| `src/runtime/env-validator.ts` | `getPersistenceMode`, `validateEnvs` |
| `src/meta/canary-smoke.ts` | Smoke atual: 41/41 PASS — sem Core |
| `src/meta/pipeline-smoke.ts` | Smoke atual: 26/26 PASS — sem Core |
| `package.json` | Scripts de smoke disponíveis |

---

## 3. Estado atual do pipeline WhatsApp

### Fluxo real em `canary-pipeline.ts`

```
POST /__meta__/webhook
  → webhook.ts (HMAC signature — inalterado)
  → runCanaryPipeline(event, env, ctx)
       │
       ├─ Passo 1: runInboundPipeline(event, env, ctx)
       │     ├─ getCrmBackend(env)
       │     ├─ upsertLeadByPhone(backend, wa_id)     → lead_id
       │     ├─ createConversationTurn(backend, lead_id, 'whatsapp', summary)
       │     │     └─ stage_at_turn: 'unknown'  ← BLK-02
       │     └─ registerMemoryEvent(...)          → memory_event_id
       │
       ├─ Passo 2: callLlm(event.text_body, env)      ← BLK-04 (sem contexto)
       │     └─ system_prompt genérico + texto cru
       │     └─ retorna reply_text
       │
       └─ Passo 3: sendMetaOutbound(intent, env)
             └─ gated por CLIENT_REAL_ENABLED/ROLLBACK_FLAG
```

### O que NÃO acontece hoje

- `runCoreEngine` **nunca é chamado** — BLK-01
- `getLeadState` **nunca é chamado** no pipeline — stage é ignorado
- `stage_current` nunca é lido antes do LLM
- `stage_after` nunca é persistido depois da decisão
- `facts` do lead **nunca alimentam** os parsers via pipeline

---

## 4. Estado atual do Core mecânico

### Assinatura canônica

```typescript
// src/core/engine.ts:57
export function runCoreEngine(state: LeadState): CoreDecision
```

`runCoreEngine` é **síncrono** — sem Promises, sem I/O, sem dependências externas de runtime. Isso facilita o patch: pode ser chamado diretamente no pipeline sem `await`.

### Caminhos de decisão por stage

| Stage | Parser chamado | Gates |
|---|---|---|
| `discovery` | `extractTopoSignals` (L05) + `evaluateTopoCriteria` (L06) | `G_FATO_CRITICO_AUSENTE` |
| `qualification_civil` | `extractMeioASignals` (L07–L10) + `evaluateMeioACriteria` | gates Meio A |
| `qualification_renda` | `extractMeioBSignals` (L11–L14) + `evaluateMeioBRendaCriteria` | gates Meio B renda |
| `qualification_eligibility` | `extractMeioBSignals` + `evaluateMeioBElegibilidadeCriteria` | gates elegibilidade |
| `qualification_special` | `extractEspeciaisSignals` (L15–L16) + `evaluateEspeciaisCriteria` | trilhos P3/multi |
| `docs_prep` | `extractFinalSignals` (L17) + `evaluateDocsPrepCriteria` | L17 |
| `docs_collection` | `extractFinalSignals` + `evaluateDocsCollectionCriteria` | L17 |
| `visit` | `extractFinalSignals` + `evaluateVisitCriteria` | L17 |
| `broker_handoff` | `extractFinalSignals` + `evaluateBrokerHandoffCriteria` | L17 |
| stage desconhecido | — | `throw new Error(...)` ← **risco em T9.4** |

### Dependências internas do Core

Todos os imports do Core são **locais** (`./topo-parser.ts`, `./meio-a-parser.ts`, etc.) — nenhuma chamada a Supabase, LLM, HTTP ou serviço externo. Seguro para chamar em todo request.

---

## 5. Shape exato de input do Core

```typescript
// src/core/types.ts:85-89
export interface LeadState {
  lead_id: string;           // OBRIGATÓRIO — ID do lead no CRM
  current_stage: StageId;    // OBRIGATÓRIO — stage atual canônico
  facts: Record<string, unknown>; // facts coletados até o momento
}

// StageId (src/core/types.ts:65-74)
type StageId =
  | 'discovery'
  | 'qualification_civil'
  | 'qualification_renda'
  | 'qualification_eligibility'
  | 'qualification_special'
  | 'docs_prep'
  | 'docs_collection'
  | 'broker_handoff'
  | 'visit';
```

**Regra crítica:** `current_stage` DEVE ser um `StageId` canônico. Valor `'unknown'` (que é o que existe hoje em `CrmLeadState.stage_current` para novos leads) lança `throw new Error(...)` no Core.

**Default seguro para T9.4:** se `stage_current` for `'unknown'` ou ausente → usar `'discovery'`.

---

## 6. Shape exato de output do Core

```typescript
// src/core/types.ts:132-141
export interface CoreDecision {
  stage_current: StageId;    // stage que foi avaliado (mesma entrada)
  stage_after: StageId;      // próximo stage autorizado (ou mesmo se bloqueado)
  next_objective: string;    // ex: 'coletar_customer_goal', 'avancar_para_qualification_civil'
  block_advance: boolean;    // true = algum gate impediu transição de stage
  gates_activated: GateId[]; // gates que ativaram neste ciclo
  speech_intent: 'coleta_dado' | 'transicao_stage' | 'bloqueio'; // sinal para LLM
  decision_id: string;       // ex: 'core-1714613200000-ab3f7'
  evaluated_at: string;      // ISO 8601
}
```

**Campos relevantes para T9.4 (patch mínimo):**

| Campo | Uso em T9.4 |
|---|---|
| `stage_after` | Persistir em `CrmLeadState.stage_current` após decisão |
| `next_objective` | Persistir em `CrmLeadState.next_objective` |
| `block_advance` | Persistir em `CrmLeadState.block_advance` |
| `decision_id` | Log de telemetria `core.decision` |
| `speech_intent` | Passado para LLM em T9.8 (não em T9.4) |

**Campos para PRs futuras (T9.8):**

| Campo | Uso futuro |
|---|---|
| `speech_intent` | LLM recebe `'coleta_dado' | 'transicao_stage' | 'bloqueio'` → adapta tom |
| `next_objective` | LLM recebe para saber o que perguntar a seguir |
| `gates_activated` | Telemetria ponta-a-ponta T9.13 |

---

## 7. Mapeamento CRM → Core

**Como construir `LeadState` a partir do CRM para chamar `runCoreEngine`:**

```typescript
// Passo A — ler estado atual do lead
const stateResult = await getLeadState(backend, lead_id);
const currentStage: StageId = (
  stateResult.found &&
  stateResult.record?.stage_current &&
  stateResult.record.stage_current !== 'unknown'
    ? stateResult.record.stage_current
    : 'discovery'                           // default seguro para lead novo
) as StageId;

// Passo B — ler facts do lead
const factsResult = await getLeadFacts(backend, lead_id);
const factsMap: Record<string, unknown> = {};
for (const fact of factsResult.records) {
  // apenas facts aceitos ou confirmados
  if (fact.status === 'accepted' || fact.status === 'pending') {
    factsMap[fact.fact_key] = fact.fact_value;
  }
}

// Passo C — montar LeadState e chamar Core
const coreInput: LeadState = {
  lead_id,
  current_stage: currentStage,
  facts: factsMap,
};
const decision = runCoreEngine(coreInput); // síncrono
```

---

## 8. Mapeamento Core → CRM

**Como persistir `stage_after`, `next_objective` e `block_advance` após decisão do Core:**

Atualmente **não existe** função `upsertLeadState` em `src/crm/service.ts`. T9.4 precisa criar uma.

**Assinatura proposta para T9.4:**

```typescript
// Nova função a criar em src/crm/service.ts
export async function upsertLeadState(
  backend: CrmBackend,
  lead_id: string,
  decision: CoreDecision,
): Promise<CrmWriteResult<CrmLeadState>>;
```

**Lógica interna:** usar `backend.update('crm_lead_state', ...)` se estado existe, ou `backend.insert('crm_lead_state', ...)` se não existe.

**Shape do registro persistido:**

```typescript
const stateRecord: CrmLeadState = {
  state_id: existing?.state_id ?? uuid(),
  lead_id,
  stage_current: decision.stage_after,     // ← campo principal
  next_objective: decision.next_objective,  // ← objetivo do próximo turno
  block_advance: decision.block_advance,    // ← sinal para o operador
  policy_flags: {},                         // expandir em T9.6
  risk_flags: null,
  state_version: (existing?.state_version ?? 0) + 1,
  updated_at: nowIso(),
};
```

**Invariante preservada:** `CrmLeadState.stage_current` é **projetado do Core** — nunca calculado diretamente pelo CRM. O comentário `/* Projetado do Core — CRM nunca escreve diretamente. */` em `types.ts:81` confirma essa semântica. A função `upsertLeadState` aplica a decisão do Core, não cria lógica de stage própria.

---

## 9. Parsers L04–L17

### Interface universal dos parsers

Todos os parsers do Core seguem a mesma interface de entrada:

```typescript
// Exemplo do topo (topo-parser.ts:39-44)
interface TopoTurnExtract {
  facts_current: Record<string, unknown>;   // facts já persistidos do lead
  facts_extracted: Record<string, unknown>; // facts recém-extraídos pelo LLM neste turno
}
```

**Conclusão crítica:** os parsers L04–L17 **não recebem `raw_text` diretamente**. Eles recebem facts já estruturados:
- `facts_current` = facts do CRM (já existe via `getLeadFacts`)
- `facts_extracted` = facts que o LLM extraiu do texto deste turno (não existe ainda — BLK-03)

### Dependência de `raw_text` dos parsers

| Parser | Usa `raw_text` diretamente? | O que usa |
|---|---|---|
| `topo-parser.ts` (L05) | **NÃO** | `facts_current.customer_goal`, `facts_current.channel_origin`, `facts_current.current_intent` |
| `meio-a-parser.ts` (L07–L10) | **NÃO** | `facts_current.estado_civil`, `facts_current.composicao`, etc. |
| `meio-b-parser.ts` (L11–L14) | **NÃO** | `facts_current.renda_bruta`, `facts_current.regime_trabalho`, etc. |
| `especiais-parser.ts` (L15–L16) | **NÃO** | `facts_current.active_track`, `facts_current.p3_*` |
| `final-parser.ts` (L17) | **NÃO** | `facts_current.docs_channel_choice`, `facts_current.visit_interest`, etc. |

**O que os parsers precisam não é o texto WhatsApp — é o texto já transformado em facts estruturados pelo LLM.**

### Fluxo completo de facts (a implementar em T9.6/T9.8):

```
raw_text (WhatsApp) → callLlm(raw_text, LlmContext) → { reply_text, facts_extracted }
                                                              ↓
                                                    extractTopoSignals({
                                                      facts_current: existing_facts,
                                                      facts_extracted: facts_this_turn
                                                    })
                                                              ↓
                                                    writeLeadFact(backend, fact)  ← para cada fact
```

### Para T9.4 (patch mínimo):

Em T9.4, os parsers serão chamados com `facts_extracted: {}` (vazio), funcionando apenas com `facts_current`. Isso é **funcional e seguro** — o Core simplesmente detectará facts ausentes e manterá `stage_current = 'discovery'` até que facts sejam coletados. Não quebra o fluxo atual.

---

## 10. Ponto exato de integração futura em `canary-pipeline.ts`

O Core deve ser inserido **entre o Passo 1 (CRM) e o Passo 2 (LLM)**, após confirmar `crmResult.ok && crmResult.lead_id`.

```typescript
// canary-pipeline.ts — posição do novo bloco (T9.4)
//
// ANTES (hoje):
//   Passo 1: runInboundPipeline → lead_id ✓
//   Passo 2: callLlm(userText) ← texto cru sem contexto
//
// DEPOIS (T9.4):
//   Passo 1:   runInboundPipeline → lead_id ✓
//   Passo 1.5: [NOVO] runCoreEngine → decision { stage_after, next_objective }
//                     upsertLeadState(backend, lead_id, decision)
//                     diagLog('core.decision', {...})
//   Passo 2:   callLlm(userText) ← ainda sem LlmContext completo (T9.8 resolve)
//   Passo 3:   sendMetaOutbound (inalterado)
```

**Localização exata no arquivo** (`src/meta/canary-pipeline.ts`):

```typescript
// Após linha ~136 (após o bloco de log 6 — pipeline.result)
// Antes da linha ~139 (início do bloco Passo 2 — LLM)

// --- Passo 1.5 — Core mecânico [NOVO em T9.4] ---
if (crmResult.ok && crmResult.lead_id) {
  // ... (ver seção 11)
}
```

**Critério de falha do Core:** se `runCoreEngine` lançar exceção (stage desconhecido), o erro deve ser capturado, logado com `diagLog` e o pipeline continua normalmente com `stage = 'discovery'` — nunca bloqueia o outbound.

---

## 11. Patch mínimo recomendado para T9.4

**Objetivo do patch:** chamar `runCoreEngine` a partir do pipeline WhatsApp, persistir `stage_after` no CRM e emitir telemetria. Não alterar LLM, não alterar outbound, não habilitar facts extraction.

### Arquivos a criar/alterar em T9.4

| Arquivo | Tipo | O que muda |
|---|---|---|
| `src/crm/service.ts` | ALTER | Adicionar `upsertLeadState(backend, lead_id, decision)` |
| `src/meta/canary-pipeline.ts` | ALTER | Adicionar Passo 1.5 entre CRM e LLM |
| `src/meta/pipeline.ts` | ALTER | `stage_at_turn` passa a usar stage lido do CRM em vez de `'unknown'` |
| `src/meta/core-pipeline-smoke.ts` | CREATE | Smoke mínimo `smoke:meta:core-pipeline` |
| `package.json` | ALTER | Adicionar `smoke:meta:core-pipeline` |

### Arquivos que NÃO devem mudar em T9.4

| Arquivo | Razão |
|---|---|
| `src/core/engine.ts` | Engine já está pronto — read-only |
| `src/core/types.ts` | Tipos já corretos — read-only |
| `src/llm/client.ts` | Context enriquecido é T9.8 — não agora |
| `src/meta/outbound.ts` | Gates atuais preservados |
| `src/meta/webhook.ts` | HMAC/challenge — intocável |
| `wrangler.toml`, secrets | Envs já declaradas em T9.1 |

### Pseudocódigo do patch em `canary-pipeline.ts`

```typescript
// imports a adicionar no topo:
import { runCoreEngine } from '../core/engine.ts';
import type { LeadState } from '../core/types.ts';
import { getLeadState, getLeadFacts, upsertLeadState } from '../crm/service.ts';

// Passo 1.5 — Core mecânico (inserir após Passo 1 e seu diagLog)
let coreDecision: CoreDecision | undefined;
if (crmResult.ok && crmResult.lead_id) {
  try {
    const backend = await getCrmBackend(env as Record<string, unknown>);

    // Ler estado atual do lead
    const stateResult = await getLeadState(backend, crmResult.lead_id);
    const currentStage = (
      stateResult.found &&
      stateResult.record?.stage_current &&
      stateResult.record.stage_current !== 'unknown'
        ? stateResult.record.stage_current
        : 'discovery'
    ) as LeadState['current_stage'];

    // Ler facts persistidos
    const factsResult = await getLeadFacts(backend, crmResult.lead_id);
    const factsMap: Record<string, unknown> = {};
    for (const fact of factsResult.records) {
      if (fact.status === 'accepted' || fact.status === 'pending') {
        factsMap[fact.fact_key] = fact.fact_value;
      }
    }

    // Chamar Core (síncrono)
    coreDecision = runCoreEngine({
      lead_id: crmResult.lead_id,
      current_stage: currentStage,
      facts: factsMap,
    });

    // Persistir stage_after
    await upsertLeadState(backend, crmResult.lead_id, coreDecision);

    diagLog('core.decision', {
      lead_id_present: true,
      stage_current: coreDecision.stage_current,
      stage_after: coreDecision.stage_after,
      block_advance: coreDecision.block_advance,
      decision_id: coreDecision.decision_id,
    });

    emitCanary(ctx, 'core.completed', 'completed', {
      stage_current: coreDecision.stage_current,
      stage_after: coreDecision.stage_after,
    });
  } catch (e) {
    errors.push(`core_exception: ${String(e)}`);
    diagLog('core.decision', { error: String(e), stage_current: 'unknown', stage_after: 'discovery' });
    emitCanary(ctx, 'core.exception', 'failed', { error: String(e) });
    // Pipeline continua — Core exception não bloqueia outbound
  }
}
```

---

## 12. Riscos e mitigação

| Risco | Severidade | Mitigação |
|---|---|---|
| `stage_current = 'unknown'` para leads novos — Core lança `throw` | ALTA | Default para `'discovery'` antes de chamar Core; envolver em try/catch |
| `upsertLeadState` não existe em `service.ts` — T9.4 cria sem prova | MÉDIA | Criar + smoke que valida `stage_after` persistido |
| Core exception bloqueia outbound WhatsApp | ALTA | `try/catch` no bloco Passo 1.5; erro capturado em `errors[]`, pipeline continua |
| Facts vazios em todos os parsers (BLK-03) — Core nunca avança stage | BAIXA | Funcional — Core mantém `discovery` até facts chegarem; não quebra LLM/outbound |
| `callLlm` continua recebendo só texto cru (BLK-04) | BAIXA | Aceitável em T9.4 — LLM responde como hoje; contexto enriquecido em T9.8 |
| `getCrmBackend` chamado duas vezes (pipeline + Core) | BAIXA | Singleton em store.ts; segunda chamada retorna mesmo backend sem I/O extra |
| `stage_at_turn` em `createConversationTurn` ainda `'unknown'` | BAIXA | Corrigir na mesma T9.4 usando stage lido antes de criar o turno |
| Regressão em `smoke:meta:canary` (41/41) | ALTA | Smoke existente deve passar intacto — Core não toca gates LLM/outbound |
| Stage não sobrevive restart (sem Supabase real) | MÉDIA | In-memory até T9.11 — aceitável por ora; usuário perde stage no restart |

---

## 13. Smokes exigidos para T9.4

### Novo smoke obrigatório

**`smoke:meta:core-pipeline`** (arquivo: `src/meta/core-pipeline-smoke.ts`)

Deve cobrir no mínimo:

| Check | Descrição |
|---|---|
| C1 | `runCoreEngine` chamado com `current_stage: 'discovery'` → `decision.stage_after` definido |
| C2 | `stage_current = 'unknown'` → default para `'discovery'` sem lançar exceção |
| C3 | Stage persistido via `upsertLeadState` — `getLeadState` retorna `stage_after` correto |
| C4 | Core exception capturada — pipeline retorna sem quebrar outbound |
| C5 | `decision_id` presente e não vazio |
| C6 | `diagLog('core.decision', ...)` não vaza secrets |
| C7 | `stage_at_turn` no turn registra stage correto (não `'unknown'`) |
| C8 | `canaryReport.ok === true` mesmo quando stage mudou |

### Regressões obrigatórias após T9.4

| Smoke | Resultado esperado |
|---|---|
| `smoke:meta:canary` | 41/41 PASS |
| `smoke:meta:webhook` | 20/20 PASS |
| `smoke:meta:pipeline` | 26/26 PASS |
| `smoke:runtime:fallback-guard` | 39/39 PASS |
| `smoke:runtime:env` | 53/53 PASS |
| `prove:g8-readiness` | 7/7 PASS |

---

## 14. Fora de escopo confirmado

Esta PR T9.3 é **read-only**. Nenhum arquivo funcional foi alterado.

| Fora de escopo | Razão |
|---|---|
| `src/core/engine.ts` | Não alterado — apenas lido |
| `src/core/types.ts` | Não alterado — apenas lido |
| `src/meta/canary-pipeline.ts` | Não alterado — patch é T9.4 |
| `src/meta/pipeline.ts` | Não alterado — patch é T9.4 |
| `src/crm/service.ts` | Não alterado — `upsertLeadState` é T9.4 |
| `src/llm/client.ts` | Não alterado — `LlmContext` é T9.8 |
| `src/runtime/env-validator.ts` | Não alterado — T9.1 estável |
| `package.json` | Não alterado — script de smoke é T9.4 |
| Supabase write real | T9.11 |
| Output guard LLM | T9.9 |
| `LlmContext` estruturado | T9.8 |
| Facts extraction do texto WhatsApp | T9.6 |
| G9 fechado | T9.R |

---

## 15. Próxima PR autorizada

**T9.4 — IMPL chamada `runCoreEngine` no `canary-pipeline`**

| Campo | Valor |
|---|---|
| Tipo | PR-IMPL |
| Frente | Funil |
| Depende de | T9.3 (esta PR — DIAG) |
| Branch sugerido | `feat/t9.4-runcore-canary-pipeline` |
| Arquivos principais a alterar | `src/meta/canary-pipeline.ts`, `src/crm/service.ts`, `src/meta/pipeline.ts` |
| Smoke obrigatório | `smoke:meta:core-pipeline` (novo) |
| Regressões obrigatórias | `smoke:meta:canary`, `smoke:meta:webhook`, `smoke:meta:pipeline`, `prove:g8-readiness` |
| BLK resolvido | BLK-01 (Core nunca chamado) + BLK-02 (stage nunca persistido) |
| Não fazer em T9.4 | Não alterar `callLlm`, não alterar outbound, não habilitar facts extraction |

---

*Diagnóstico criado em: 2026-05-02*  
*Próxima PR autorizada: T9.4 — IMPL chamada runCoreEngine no canary-pipeline*  
*G9: aberto — aguarda T9.4 até T9.R*
