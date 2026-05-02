# DIAG T9.6 — Extração de Facts do Texto WhatsApp Real

**Tipo:** PR-DIAG  
**Data:** 2026-05-02  
**Branch:** `diag/t9.6-facts-text-mapping`  
**Contrato:** `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`  
**Status:** DIAG CONCLUÍDO — T9.6 IMPL autorizada  
**Restrição:** ZERO alterações em `src/` — apenas diagnóstico

---

## §1 — Contexto e Objetivo

T9.4 resolveu BLK-01 (Core nunca chamado) e BLK-02 (stage nunca persistido).  
O Passo 1.5 em `canary-pipeline.ts` chama `runCoreEngine` a cada mensagem WhatsApp e persiste `stage_after` via `upsertLeadState`.

**BLK-03 permanece:** os parsers L04–L17 recebem `facts_extracted: {}` em todos os caminhos de decisão do Core. O Core nunca enxerga nenhum dado extraído do texto WhatsApp do turno corrente.

**Objetivo deste DIAG:** mapear exatamente como conectar a extração de facts do `text_body` WhatsApp aos parsers L04–L17, onde persistir, e como o Core receberá os facts no turno seguinte.

---

## §2 — Estado Atual do BLK-03

**Localização do gap:** `src/core/engine.ts`, em todos os 9 caminhos de decisão.

Cada caminho chama seu parser com `facts_extracted: {}` fixo:

```typescript
// engine.ts — runTopoDecision (e todos os outros caminhos)
const topoSignals = extractTopoSignals({
  facts_current: state.facts,   // ← lê CRM (turno anterior)
  facts_extracted: {},           // ← SEMPRE VAZIO — BLK-03
});
```

A `LeadState` recebida pelo Core vem do Passo 1.5 em `canary-pipeline.ts`:

```typescript
// canary-pipeline.ts — Passo 1.5
const factsResult = await getLeadFacts(coreBackend, crmResult.lead_id);
const factsMap: Record<string, unknown> = {};
for (const fact of factsResult.records) {
  if (fact.status === 'accepted' || fact.status === 'pending') {
    factsMap[fact.fact_key] = fact.fact_value;
  }
}
coreDecision = runCoreEngine({
  lead_id: crmResult.lead_id,
  current_stage: currentStage,
  facts: factsMap,   // ← só facts do CRM, turno anterior
});
```

**Consequência:** lead envia `"Sou solteiro, renda de R$ 4.000"` — Core não vê nada disso. Stage nunca avança porque facts críticos nunca chegam ao motor. O LLM responde humanamente, mas o funil fica parado em `discovery` indefinidamente.

---

## §3 — Interface dos Parsers (L04–L17)

Todos os parsers usam a mesma interface de entrada:

```typescript
interface TurnExtract {
  facts_current: Record<string, unknown>;   // facts já no CRM
  facts_extracted: Record<string, unknown>; // facts extraídos no turno
}
```

Os parsers fazem merge implícito: `{ ...facts_current, ...facts_extracted }`. Facts extraídos têm precedência sobre os persistidos se a chave for igual. Essa interface já está preparada para receber a extração — só falta populá-la.

---

## §4 — Mapa Canônico de Fact_Keys por Stage e Parser

### Stage `discovery` — Parser: `topo-parser.ts` (`extractTopoSignals`)

| Fact Key | Tipo | Obrigatório | Valores válidos |
|---|---|---|---|
| `customer_goal` | string | **SIM** | `'comprar_imovel' \| 'entender_programa' \| 'enviar_docs' \| 'visitar_imovel' \| 'outro'` |
| `current_intent` | string | não | `'entender_programa' \| 'seguir_analise' \| 'enviar_docs' \| 'visita'` |
| `offtrack_type` | string | não | `'curiosidade' \| 'objecao' \| 'desabafo' \| 'pergunta_lateral'` |
| `channel_origin` | string | não | qualquer string |

**Gate de avanço:** `customer_goal` presente e válido → avança para `qualification_civil`.

### Stage `qualification_civil` — Parser: `meio-a-parser.ts` (`extractMeioASignals`)

| Fact Key | Tipo | Obrigatório | Valores válidos |
|---|---|---|---|
| `estado_civil` | string | **SIM** | `'solteiro' \| 'uniao_estavel' \| 'casado_civil' \| 'divorciado' \| 'viuvo'` |
| `processo` | string | **SIM** | `'solo' \| 'conjunto' \| 'composicao_familiar'` |
| `composition_actor` | string | não | valor livre |
| `p3_required` | boolean | não | `true \| false` |
| `dependents_applicable` | boolean | não | `true \| false` |
| `dependents_count` | number | não | inteiro ≥ 0 |

**Gate de avanço:** `estado_civil` + `processo` presentes e válidos → avança para `qualification_renda`.

### Stages `qualification_renda` + `qualification_eligibility` — Parser: `meio-b-parser.ts` (`extractMeioBSignals`)

| Fact Key | Tipo | Obrigatório | Valores válidos |
|---|---|---|---|
| `regime_trabalho` | string | **SIM (renda)** | `'clt' \| 'autonomo' \| 'aposentado' \| 'servidor' \| 'informal' \| 'multiplo'` |
| `renda_principal` | number | **SIM (renda)** | número positivo |
| `nacionalidade` | string | **SIM (eligib.)** | `'brasileiro' \| 'estrangeiro' \| 'naturalizado'` |
| `autonomo_tem_ir` | boolean | não | `true \| false` |
| `ctps_36` | boolean | não | `true \| false` |
| `rnm_status` | string | não | `'valido' \| 'vencido' \| 'ausente' \| 'indeterminado'` |
| `processo` | string | contexto | herdado de Meio A |

**Gate de avanço renda:** `regime_trabalho` + `renda_principal`.  
**Gate de avanço eligib.:** `nacionalidade`. Se `estrangeiro` e `rnm_status != 'valido'` → bloqueio.

### Stage `qualification_special` — Parser: `especiais-parser.ts` (`extractEspeciaisSignals`)

| Fact Key | Tipo | Obrigatório | Valores válidos |
|---|---|---|---|
| `processo` | string | **SIM (multi)** | `'conjunto' \| 'composicao_familiar'` |
| `work_regime_p2` | string | **SIM (multi)** | mesmos valores de `regime_trabalho` |
| `monthly_income_p2` | number | **SIM (multi)** | número positivo |
| `p3_required` | boolean | **SIM (P3)** | `true` |
| `work_regime_p3` | string | **SIM (P3)** | mesmos valores de `regime_trabalho` |
| `autonomo_has_ir_p2` | boolean | não | `true \| false` |
| `ctps_36m_p2` | boolean | não | `true \| false` |

### Stages finais — Parser: `final-parser.ts` (`extractFinalSignals`)

| Fact Key | Stage | Obrigatório | Valores válidos |
|---|---|---|---|
| `docs_channel_choice` | `docs_prep` | **SIM** | `'whatsapp' \| 'site' \| 'visita_presencial'` |
| `doc_identity_status` | `docs_collection` | **SIM** | livre |
| `doc_income_status` | `docs_collection` | **SIM** | livre |
| `doc_residence_status` | `docs_collection` | **SIM** | livre |
| `visit_interest` | `visit` | **SIM** | `'sim' \| 'nao' \| 'talvez'` |
| `doc_ctps_status` | qualquer | não | livre |
| `handoff_readiness` | `broker_handoff` | não | livre |

---

## §5 — Interface Atual de `callLlm`

**Arquivo:** `src/llm/client.ts`

```typescript
export async function callLlm(
  userMessage: string,
  env: Record<string, unknown>,
): Promise<LlmClientResult>

export interface LlmClientResult {
  ok: boolean;
  reply_text?: string;
  llm_invoked: boolean;
  latency_ms?: number;
  error?: string;
}
```

**Observações críticas:**
- Recebe apenas `userMessage: string` — sem stage, sem facts, sem next_objective
- Retorna apenas `reply_text` — sem `facts_extracted`
- System prompt genérico hardcoded — LLM cego ao funil
- Alterar `callLlm` é escopo de T9.8 (LlmContext estruturado), **não de T9.6**

---

## §6 — Interface Atual de `writeLeadFact`

**Arquivo:** `src/crm/service.ts:167`

```typescript
export async function writeLeadFact(
  backend: CrmBackend,
  input: CrmFactWriteInput,
): Promise<CrmWriteResult<CrmFact>>

export interface CrmFactWriteInput {
  lead_id: string;
  fact_key: string;
  fact_value: unknown;
  confidence?: number | null;
  status?: CrmFactStatus;     // 'accepted' | 'pending' | 'requires_confirmation' | 'rejected' | 'superseded'
  source_turn_id?: string | null;
}
```

A função já existe, já está testada, e é o canal canônico de persistência de facts. T9.6 deve chamá-la diretamente — sem alterar sua assinatura.

---

## §7 — Como o Passo 1.5 Lê Facts do CRM

O Passo 1.5 (`canary-pipeline.ts:142-198`) lê facts com status `'accepted'` ou `'pending'`:

```typescript
const factsResult = await getLeadFacts(coreBackend, crmResult.lead_id);
const factsMap: Record<string, unknown> = {};
for (const fact of factsResult.records) {
  if (fact.status === 'accepted' || fact.status === 'pending') {
    factsMap[fact.fact_key] = fact.fact_value;
  }
}
```

**Implicação para T9.6:** se facts extraídos do turno T forem persistidos via `writeLeadFact` **antes** de `runCoreEngine` ser chamado, o Core os verá como `facts_current` no **mesmo turno**. Esta é a estratégia recomendada.

---

## §8 — Gap de Extração: De Onde Vem `facts_extracted`?

**Pergunta central de T9.6:** como transformar `text_body = "Sou solteiro, moro em SP, CLT, renda de R$ 3.500"` em `{ estado_civil: 'solteiro', regime_trabalho: 'clt', renda_principal: 3500 }`?

### Opções avaliadas

**Opção A — LLM retorna `facts_extracted` (JSON estruturado)**
- LLM recebe o texto + lista de fact_keys esperados → retorna JSON com facts + reply_text
- Pro: extração semântica de alta qualidade
- Con: requer mudar `callLlm` — escopo de T9.8, não T9.6
- Con: latência extra (parsing JSON), custo, failure mode novo
- **Descartada para T9.6**

**Opção B — Extrator heurístico/regex simples (Extrator de Texto)**
- Função pura `extractFactsFromText(text: string, stage: StageId): Record<string, unknown>`
- Aplica regex + normalização para os fact_keys do stage atual
- Pro: zero dependências externas, zero latência adicional, testável de forma determinística
- Con: qualidade de extração limitada (sem semântica), erros em linguagem ambígua
- **Recomendada para T9.6 — alinha com "parsers chamados com texto real"**

**Opção C — Two-step: extração num turno, Core usa no próximo**
- Turno T: extrai → persiste → Core vê no turno T+1
- Mais simples de implementar (extração pode ser assíncrona)
- Con: lead precisa de 2 turnos para um fato óbvio avançar
- **Aceitável como fallback, mas Opção B é preferível**

---

## §9 — Estratégia Recomendada para T9.6

**Estratégia: Extrator de Texto Heurístico + Same-Turn Persistence**

```
text_body (WhatsApp)
       ↓
extractFactsFromText(text, current_stage)   ← NOVO em T9.6
       ↓
{ estado_civil: 'solteiro', ... }
       ↓
writeLeadFact × N  (para cada fact extraído)  ← já existe
       ↓
getLeadFacts (reler CRM atualizado)
       ↓
runCoreEngine({ facts: factsAtualizado })  ← Core vê facts do turno corrente
```

**Posição no Passo 1.5 de `canary-pipeline.ts`:**

```typescript
// Entre "lê estado CRM" e "lê facts do CRM":

// 1. Extrair facts do texto (NOVO)
const extractedFacts = extractFactsFromText(event.text_body ?? '', currentStage);

// 2. Persistir facts extraídos (NOVO)
for (const [key, value] of Object.entries(extractedFacts)) {
  await writeLeadFact(coreBackend, {
    lead_id: crmResult.lead_id,
    fact_key: key,
    fact_value: value,
    status: 'pending',
    source_turn_id: crmResult.turn_id ?? null,
  });
}

// 3. Reler facts do CRM (já inclui os extraídos) — lógica já existente
const factsResult = await getLeadFacts(coreBackend, crmResult.lead_id);
```

**Status dos facts extraídos:** `'pending'` (não `'accepted'`). O Passo 1.5 já inclui `'pending'` na leitura. Facts ficam `'pending'` até confirmação humana/LLM — nunca `'accepted'` de forma automática.

**Confiança:** `confidence: 0.7` para heurísticas regex; `confidence: 0.9` para valores numéricos explícitos.

---

## §10 — Módulo Extrator de Texto

**Arquivo a criar:** `src/core/text-extractor.ts`

**Assinatura canônica:**

```typescript
export function extractFactsFromText(
  text: string,
  stage: StageId,
): Record<string, unknown>
```

**Contrato:**
- Função pura — sem I/O, sem side effects
- Retorna `{}` se nada for encontrado (nunca lança exceção)
- Extrai apenas facts relevantes ao `stage` atual
- Normaliza valores para os enums canônicos dos parsers
- Não sobrescreve facts existentes — a lógica de merge está no Passo 1.5

**Heurísticas mínimas por stage (exemplos):**

```
discovery:
  "quero comprar" / "comprar imóvel" → customer_goal: 'comprar_imovel'
  "quero entender" / "como funciona" → customer_goal: 'entender_programa'

qualification_civil:
  "sou solteiro/a" → estado_civil: 'solteiro'
  "sou casado/a" → estado_civil: 'casado_civil'
  "sozinho" / "só eu" → processo: 'solo'
  "eu e minha esposa/marido" → processo: 'conjunto'

qualification_renda:
  "CLT" / "carteira assinada" → regime_trabalho: 'clt'
  "autônomo" / "freelancer" → regime_trabalho: 'autonomo'
  "R$ 3.500" / "3500" → renda_principal: 3500
  "aposentado" → regime_trabalho: 'aposentado'
```

---

## §11 — Propagação dos Facts para o Core

### Mesmo turno (estratégia T9.6)

```
Turno T:
  text_body recebido
  extractFactsFromText → { estado_civil: 'solteiro' }
  writeLeadFact (status: 'pending')
  getLeadFacts → factsMap inclui 'estado_civil'
  runCoreEngine({ facts: factsMap }) → Core vê 'estado_civil' no mesmo turno
  stage_after atualizado se gate satisfeito
```

**Vantagem:** um único turno pode avançar o stage se o lead fornecer todos os facts necessários.

### Entre turnos (fallback automático)

Se um turno não tiver extração (texto curto, saudação, etc.), os facts persistidos em turnos anteriores continuam disponíveis via `getLeadFacts` nos turnos seguintes. O Core sempre constrói `factsMap` completo do CRM.

---

## §12 — Localização Precisa do Ponto de Extração no Pipeline

**Arquivo:** `src/meta/canary-pipeline.ts`  
**Posição:** Passo 1.5, entre `stateResult.found` (L156) e `getLeadFacts` (L160)

```
Passo 1   — CRM upsert lead + turno (pipeline.ts)
Passo 1.5 —
  [A] ler stage do CRM                  ← já existe (L142–158)
  [B] extrair facts do text_body        ← NOVO (T9.6)
  [C] persistir facts extraídos         ← NOVO (T9.6)
  [D] reler facts do CRM (completo)     ← já existe (L160–167)
  [E] runCoreEngine                     ← já existe (L168–173)
  [F] upsertLeadState                   ← já existe (L174)
Passo 2   — LLM (callLlm)               ← não mudar em T9.6
Passo 3   — Outbound canary             ← não mudar
```

**Constraint crítico:** [B] e [C] devem estar dentro do `try/catch` existente do Passo 1.5. Exception na extração nunca bloqueia LLM ou outbound.

---

## §13 — Regressões a Preservar

| Smoke / Prova | Checks | Risco |
|---|---|---|
| `smoke:meta:canary` | 41/41 | Médio — Passo 1.5 é modificado |
| `smoke:meta:core-pipeline` | 23/23 | Alto — testa Core diretamente |
| `prove:t9.5-stage-persistence` | 34/34 | Alto — testa persistência stage |
| `smoke:meta:pipeline` | 26/26 | Baixo — pipeline.ts intocado |
| `smoke:meta:webhook` | 20/20 | Nenhum — webhook intocado |
| `smoke:runtime:env` | 53/53 | Nenhum |
| `smoke:runtime:fallback-guard` | 39/39 | Nenhum |
| `prove:g8-readiness` | 7/7 | Nenhum |

**Risco principal:** `extractFactsFromText` com texto vazio ou nulo deve retornar `{}` sem lançar exceção — caso contrário, quebrará `smoke:meta:canary` (muitos testes com textos mock curtos).

**Garantia de regressão:** `writeLeadFact` com `status: 'pending'` é idempotente em termos funcionais — se facts idênticos forem escritos múltiplas vezes, o Passo 1.5 os lerá todos mas o `factsMap` usará o mais recente da chave. O `smoke:meta:core-pipeline` deve passar sem alteração.

---

## §14 — O Que T9.6 IMPL Deve Fazer

1. **Criar** `src/core/text-extractor.ts` — função pura `extractFactsFromText(text, stage)`
2. **Modificar** `src/meta/canary-pipeline.ts` — adicionar [B] + [C] no Passo 1.5
3. **Criar** `src/core/text-extractor-smoke.ts` — `smoke:core:text-extractor` com mínimo 20 checks
4. **Atualizar** `package.json` — adicionar `"smoke:core:text-extractor"`
5. **Atualizar** STATUS e LATEST

### O Que T9.6 NÃO Deve Fazer

- NÃO alterar `callLlm` (T9.8)
- NÃO alterar `LlmClientResult` para incluir `facts_extracted` (T9.8)
- NÃO alterar a assinatura de `runCoreEngine` ou `extractParser`
- NÃO alterar `writeLeadFact` ou `getLeadFacts`
- NÃO ativar Supabase write real (T9.11)
- NÃO alterar outbound, webhook, HMAC
- NÃO fechar G9

---

## §15 — Achados Adicionais

### A. `createConversationTurn` ainda hardcoda `stage_at_turn: 'unknown'`

**Arquivo:** `src/crm/service.ts:446`  
**Observação:** a correção de T9.4 foi feita em `pipeline.ts` (lê estado CRM antes de chamar `createConversationTurn`), não em `service.ts`. O valor `'unknown'` no body de `createConversationTurn` é imediatamente sobrescrito pelo `pipeline.ts`. Não é um bug em runtime.

### B. `callLlm` envia `userText` bruto, sem stage ou facts

**Arquivo:** `src/meta/canary-pipeline.ts:147`  
```typescript
const llmResult = await llmCaller(userText, env as Record<string, unknown>);
```
O LLM não sabe em que stage o lead está, quais facts já foram coletados, nem qual é o `next_objective`. Isso é BLK-04, alvo de T9.8.

### C. `facts_extracted: {}` em todos os 9 caminhos do Core

**Arquivo:** `src/core/engine.ts`  
Confirmado em todos os `run*Decision` functions (topo, meioA, meioB, especiais, finalOps). Todos passam `facts_extracted: {}` diretamente. A estratégia T9.6 não precisa alterar o Core — basta persistir antes de `runCoreEngine`.

### D. Status `'pending'` vs `'accepted'` para facts extraídos

**Decisão:** T9.6 deve usar `status: 'pending'`. O Passo 1.5 já inclui `'pending'` na leitura (`fact.status === 'accepted' || fact.status === 'pending'`). Isso permite que facts extraídos entrem no ciclo de decisão imediatamente, enquanto aguardam confirmação do operador/LLM para passar a `'accepted'`.

---

## §16 — Veredito e Próxima Ação Autorizada

**Veredito:** T9.6 IMPL é **viável** com as seguintes premissas confirmadas:

| Premissa | Verificada |
|---|---|
| `writeLeadFact` já existe e funciona | ✓ |
| Passo 1.5 já lê `'pending'` em `getLeadFacts` | ✓ |
| Interface dos parsers aceita `facts_extracted` (mesmo que vazio) | ✓ |
| `try/catch` no Passo 1.5 já protege contra exceções | ✓ |
| `text_body` está disponível em `event.text_body` no Passo 1.5 | ✓ |
| `crmResult.turn_id` disponível para `source_turn_id` | ✓ |
| Todos os fact_keys e enums canônicos mapeados | ✓ |

**Complexidade:** baixa. Nenhuma mudança de interface. Nenhum novo tipo de dado. Apenas:
- 1 função pura nova (`text-extractor.ts`)
- 2 novos blocos no Passo 1.5 (~20 linhas)
- 1 smoke novo

**Ponto de atenção:** a qualidade da extração heurística é limitada. O objetivo de T9.6 é provar o caminho técnico (texto → fact → CRM → Core), não substituir o LLM como extrator semântico. Extração semântica de alta fidelidade vem via LlmContext (T9.8).

**Próxima ação autorizada: T9.6 — IMPL `extractFactsFromText` + persistência no Passo 1.5**

---

*Diagnóstico executado em modo READ-ONLY. Zero alterações em `src/`.*
