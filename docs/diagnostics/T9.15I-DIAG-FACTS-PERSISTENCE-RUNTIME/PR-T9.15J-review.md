# PR-T9.15J — Review Completo
# Gerado: 2026-05-05
# Branch: fix/t9.15j-facts-persistence-wa-id
# PR: #238 — https://github.com/brunovasque/Enova-2/pull/238
# Commit: 0e48df7

---

## Título

`fix(T9.15J): facts persistence — lead_id → wa_id em enova_state read/write`

---

## Body da PR (template completo)

### Mestre macro soberano
lido; conflito com documentos atuais resolvido pelo mestre

### Contrato ativo
T9 — Integração LLM ↔ Funil Mecânico ↔ Supabase Real ↔ Telemetria — aberto; G9 em aberto
`schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`

### Próximo passo autorizado
Repetir T9.15B-PROVA-REAL-CANARY com facts acumulados entre turnos (agora com read/write por wa_id — fix que torna T9.15H funcional em PROD)

### Objetivo
Corrigir o bug que impedia `readLeadAccumulatedFacts` e `writeLeadAccumulatedFacts` de funcionar em PROD. As duas funções filtravam/escreviam `enova_state` pela coluna `lead_id` (UUID), mas `crmResult.lead_id` em PROD é o wa_id ("554185260518"), não um UUID. O Postgres rejeitava com `pg_code=22P02`. O fix troca o campo de chave de `lead_id` para `wa_id` nas duas funções — coluna TEXT em `enova_state`, sem constraint de tipo UUID.

### Classificação da tarefa
contratual — PR-FIX cirúrgica / frente T9 / persistência facts cross-turn

### Última PR relevante
PR #237 — T9.15I-FACTS-PERSISTENCE-TELEMETRY (adicionou diagLogs que tornaram o bug visível via wrangler tail)

### Objetivo imutável do contrato
"Fazer a Enova 2 girar em sincronia completa: entender o lead, saber o stage, aplicar as regras MCMV, persistir em banco real, avançar stages de forma mecânica, responder humanamente via LLM e continuar do ponto certo depois de qualquer restart."

### Recorte executado nesta PR
T9.15J — fix da chave de acesso a `enova_state` em `readLeadAccumulatedFacts` / `writeLeadAccumulatedFacts`: substituição de `lead_id` (UUID, incompatível com wa_id em PROD) por `wa_id` (TEXT, compatível). Parte da frente de persistência T9.15H.

### O que esta PR fecha do contrato
- `writeLeadAccumulatedFacts` agora escreve em `enova_state` por `wa_id` (TEXT) sem erro UUID
- `readLeadAccumulatedFacts` agora lê de `enova_state` por `wa_id` (TEXT) sem erro UUID
- `facts_persistence.write: ok=true` em PROD (antes: `ok=false, pg_code=22P02` em 100% dos requests)
- `facts_persistence.read: persisted_count >= 1` no turno 2 (antes: sempre 0)
- T9.15H funcional em PROD pela primeira vez
- diagLog `facts_persistence.read` atualizado: `wa_id_present` em vez de `lead_id_present`

### O que esta PR NÃO fecha do contrato
- T9.15B-PROVA-REAL-CANARY (requer conversa real WhatsApp por Vasques — agora desbloqueada)
- G9 permanece aberto

### Houve desvio de contrato?
não

### Contrato encerrado nesta PR?
não

### Item do A01
T9 — frente persistência/facts (G9-05: facts acumulados cross-turn funcionam em PROD)

### Estado herdado
- Branch base: main (após merge PR #237 T9.15I)
- T9.15I implantada: telemetria facts_persistence completa via wrangler tail
- Bug descoberto via tail (file 23, 25): `facts_persistence.write: ok=false, error: "http_400: pg_code=22P02 pg_message=invalid input syntax for type uuid: \"554185260518\""`
- Causa raiz (files 26, 27, 28): `mapLeadFromMeta` (supabase/crm-store.ts:97) usa `wa_id` como `lead_id` interno; `enova_state.lead_id` é coluna UUID; wa_id ("554185260518") não é UUID válido
- `enova_state.wa_id` é coluna TEXT sem constraint UUID — campo correto para lookup por número de telefone
- T9.15H nunca persistiu facts em PROD desde sua implementação

### Escopo
**Dois arquivos modificados:**

`src/supabase/crm-store.ts` — 2 mudanças:
1. `readLeadAccumulatedFacts`: parâmetro `lead_id` → `wa_id`; filtro `{ lead_id: 'eq.${...}' }` → `{ wa_id: 'eq.${...}' }`
2. `writeLeadAccumulatedFacts`: parâmetro `lead_id` → `wa_id`; payload `{ lead_id, ... }` → `{ wa_id, ... }`; comentário atualizado

`src/meta/canary-pipeline.ts` — 3 mudanças:
3. read call: `readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id)` → `readLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '')`
4. diagLog read: `lead_id_present: !!crmResult.lead_id` → `wa_id_present: !!(event.wa_id)`
5. write call: `writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap)` → `writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap)`

Total: +8 linhas, -8 linhas (substituições puras, zero lógica nova)

### Fora de escopo
- `src/core/` — zero diff
- `src/llm/` — zero diff
- `src/crm/` — zero diff
- `src/meta/pipeline.ts` — zero diff
- `panel-nextjs/` — zero diff
- `wrangler.toml` — zero diff
- `schema/contracts/` — zero diff
- Qualquer outro arquivo

### Mudanças em dados persistidos (Supabase)
A chave de upsert em `enova_state` muda de `lead_id` (UUID — causava pg_code=22P02) para `wa_id` (TEXT — funciona). Dados previamente escritos em `enova_state.last_context` por `lead_id` (se existirem) não serão lidos — mas como T9.15H nunca funcionou em PROD, `last_context` é vazio para todos os leads. Sem perda real de dados. Sem migration, sem nova coluna, sem schema change.

### Permissões Cloudflare necessárias
Nenhuma adicional.

### O que esta PR fecha
- Bug T9.15J: `pg_code=22P02` em `facts_persistence.write` e `facts_persistence.read`
- T9.15H funcional em PROD: facts do turno 1 chegam ao Core no turno 2
- Desbloqueio de T9.15B-PROVA-REAL-CANARY

### O que esta PR NÃO fecha
- Prova real WhatsApp (T9.15B-PROVA-REAL-CANARY) — depende de Vasques

### Estado atual da frente
T9.15J concluída. T9.15H agora funcional em PROD. Frente T9 pronta para T9.15B-PROVA-REAL-CANARY.

### Arquivos vivos atualizados
`src/supabase/crm-store.ts` — parâmetro e filtro/payload de wa_id
`src/meta/canary-pipeline.ts` — chamadas com event.wa_id; diagLog wa_id_present

### Referência de precedência
`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` > A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis

### Adendo de soberania da IA (A00-ADENDO-01)
Adendo de soberania da IA lido: sim
Esta PR introduz fala mecânica, surface engessada ou fallback dominante?: não

### Testes / Validação

| Suite | Resultado |
|-------|-----------|
| `npm run smoke` (core) | **PASSOU** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run smoke:core:text-extractor` | **81/81 PASS** |
| `npm run smoke:core:semantic-objectives` | **19/19 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

### Plano de rollback
`git revert 0e48df7` — reverte as 5 substituições e restaura o comportamento com `crmResult.lead_id` (= wa_id, continua causando pg_code=22P02, mas idêntico ao estado pré-T9.15J). Zero impacto em lógica, dados ou outbound.

### Riscos
- **Risco principal:** `enova_state.wa_id` não indexado — SELECT por `wa_id` pode ser lento em tabelas grandes. Mitigação: `enova_state` tem poucos registros em PROD hoje; indexar `wa_id` se necessário via migration futura.
- **Risco residual:** se `enova_state.wa_id` não tiver UNIQUE constraint, `supabaseUpsert` pode inserir linha duplicada em vez de atualizar. Mitigação: verificar constraint via SQL antes do deploy. Se não tiver UNIQUE, o upsert cria nova linha e a leitura posterior pode não encontrar a mais recente sem ORDER BY.
- **Zero risco de secretos:** `wa_id` não é logado (apenas `wa_id_present: boolean`).

### Evidências
- Commit: `0e48df7`
- Branch: `fix/t9.15j-facts-persistence-wa-id`
- Diff: +8 linhas, -8 linhas, 2 arquivos
- Bug descoberto: `docs/diagnostics/T9.15I-DIAG-FACTS-PERSISTENCE-RUNTIME/23-tail-raw-completo.md`
- Confirmação cross-turn: `docs/diagnostics/T9.15I-DIAG-FACTS-PERSISTENCE-RUNTIME/25-tail-dois-turnos.md`
- Raiz em pipeline.ts: `docs/diagnostics/T9.15I-DIAG-FACTS-PERSISTENCE-RUNTIME/26-pipeline-lead-id.md`
- Raiz em crm-store.ts: `docs/diagnostics/T9.15I-DIAG-FACTS-PERSISTENCE-RUNTIME/27-lead-id-schema.md`
- Constraints analisadas: `docs/diagnostics/T9.15I-DIAG-FACTS-PERSISTENCE-RUNTIME/28-enova-state-constraints.md`

### Disciplina de request e modelo
Complexidade da tarefa: baixa
Modelo utilizado: Sonnet 4.6
Automação introduzida: nenhuma

---

## Diff completo

```diff
diff --git a/src/meta/canary-pipeline.ts b/src/meta/canary-pipeline.ts
index fb95f54..e80927a 100644
--- a/src/meta/canary-pipeline.ts
+++ b/src/meta/canary-pipeline.ts
@@ -219,7 +219,7 @@ export async function runCanaryPipeline(
       let persistedFacts: Record<string, unknown> = {};
       if (supabaseCfg) {
         try {
-          persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
+          persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '');
         } catch (e) {
           diagLog('facts_persistence.read.error', { error: String(e) });
         }
@@ -227,7 +227,7 @@ export async function runCanaryPipeline(
           ok: Object.keys(persistedFacts).length >= 0,
           persisted_count: Object.keys(persistedFacts).length,
           persisted_keys: Object.keys(persistedFacts),
-          lead_id_present: !!crmResult.lead_id,
+          wa_id_present: !!(event.wa_id),
         });
       }
 
@@ -322,7 +322,7 @@ export async function runCanaryPipeline(
       // factsMap inclui todos os facts (anteriores + atuais). Core já tomou decisão com eles.
       if (supabaseCfg) {
         try {
-          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
+          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap);
           diagLog('facts_persistence.write', {
             ok: factsWriteResult.ok,
             facts_count: Object.keys(factsMap).length,

diff --git a/src/supabase/crm-store.ts b/src/supabase/crm-store.ts
index a69062c..cc144dc 100644
--- a/src/supabase/crm-store.ts
+++ b/src/supabase/crm-store.ts
@@ -592,11 +592,11 @@ export class SupabaseCrmBackend implements CrmBackend {
  */
 export async function readLeadAccumulatedFacts(
   cfg: SupabaseConfig,
-  lead_id: string,
+  wa_id: string,
 ): Promise<Record<string, unknown>> {
   try {
     const result = await supabaseSelect<EnovaStateRow>(cfg, 'enova_state', {
-      filters: { lead_id: `eq.${lead_id}` },
+      filters: { wa_id: `eq.${wa_id}` },
       limit: 1,
     });
@@ -619,7 +619,7 @@ export async function readLeadAccumulatedFacts(
 
 /**
  * Persiste facts acumulados em enova_state.last_context como JSON serializado.
- * Upsert cirúrgico: lead_id + last_context + updated_at.
+ * Upsert cirúrgico: wa_id + last_context + updated_at.
  * Nunca lança exceção. Falha silenciosa — pipeline nunca bloqueia.
  *
  * Por que last_context: campo existente no schema real (T9.13G P0).
@@ -627,12 +627,12 @@ export async function readLeadAccumulatedFacts(
  */
 export async function writeLeadAccumulatedFacts(
   cfg: SupabaseConfig,
-  lead_id: string,
+  wa_id: string,
   facts: Record<string, unknown>,
 ): Promise<{ ok: boolean; error: string | null }> {
   try {
     const row: EnovaStateRow = {
-      lead_id,
+      wa_id,
       last_context: JSON.stringify(facts),
       updated_at: new Date().toISOString(),
     };
```

---

## Análise do diff

### Mudança 1 — readLeadAccumulatedFacts: parâmetro + filtro (crm-store.ts)

**Antes:**
```typescript
export async function readLeadAccumulatedFacts(cfg, lead_id: string) {
  filters: { lead_id: `eq.${lead_id}` }
}
```

**Depois:**
```typescript
export async function readLeadAccumulatedFacts(cfg, wa_id: string) {
  filters: { wa_id: `eq.${wa_id}` }
}
```

`enova_state.lead_id` é UUID — rejeita `"554185260518"` com pg_code=22P02.
`enova_state.wa_id` é TEXT — aceita número de telefone sem constraint de tipo.

### Mudança 2 — writeLeadAccumulatedFacts: parâmetro + payload (crm-store.ts)

**Antes:**
```typescript
export async function writeLeadAccumulatedFacts(cfg, lead_id: string, facts) {
  const row: EnovaStateRow = { lead_id, last_context, updated_at };
}
```

**Depois:**
```typescript
export async function writeLeadAccumulatedFacts(cfg, wa_id: string, facts) {
  const row: EnovaStateRow = { wa_id, last_context, updated_at };
}
```

O upsert agora vai para `enova_state.wa_id` (TEXT) em vez de `enova_state.lead_id` (UUID).

### Mudança 3 — read call (canary-pipeline.ts:222)

```typescript
// Antes:
persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
// Depois:
persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '');
```

`event.wa_id` é o número de telefone direto do evento WhatsApp. Disponível antes de qualquer CRM call.

### Mudança 4 — diagLog facts_persistence.read (canary-pipeline.ts:230)

```typescript
// Antes:
lead_id_present: !!crmResult.lead_id,
// Depois:
wa_id_present: !!(event.wa_id),
```

Campo renomeado no log para refletir que a chave usada é wa_id. Valor boolean — wa_id não é logado.

### Mudança 5 — write call (canary-pipeline.ts:325)

```typescript
// Antes:
const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
// Depois:
const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, event.wa_id ?? '', factsMap);
```

---

## Resultado esperado em PROD após merge

### Turno 1 — "Tenho interesse no MCMV"

```json
{"diag":"facts_persistence.write","ok":true,"facts_count":1,"fact_keys":["customer_goal"],"error":null}
```

(antes: `ok=false, error="http_400: pg_code=22P02..."`)

### Turno 2 — "Bruno Vasques"

```json
{"diag":"facts_persistence.read","ok":true,"persisted_count":1,"persisted_keys":["customer_goal"],"wa_id_present":true}
{"diag":"core.facts_received","facts_count":2,"fact_keys":["customer_goal","nome_completo"],"stage_current":"discovery"}
```

(antes: `persisted_count=0` e `facts_count=1` sem customer_goal)

T9.15B-PROVA-REAL-CANARY agora pode confirmar facts cross-turn funcionando.

---

## ⚠️ Risco residual — verificar antes de merge

```sql
-- Executar no Supabase para confirmar constraint em wa_id:
SELECT constraint_name, constraint_type, column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'enova_state';
```

Se `wa_id` não tiver UNIQUE constraint: `supabaseUpsert` pode criar duplicatas.
Nesse caso, adicionar UNIQUE via migration antes do merge ou usar SELECT→UPDATE alternativo.
