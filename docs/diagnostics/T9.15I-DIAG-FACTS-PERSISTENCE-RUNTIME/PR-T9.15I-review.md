# PR-T9.15I — Review Completo
# Gerado: 2026-05-04
# Branch: fix/t9.15i-facts-persistence-telemetry
# PR: #237 — https://github.com/brunovasque/Enova-2/pull/237
# Commit: e68d035

---

## Título

`fix(T9.15I): telemetria facts_persistence — catches observáveis + diagLogs read/write/core`

---

## Body da PR (template completo)

### Mestre macro soberano
lido; conflito com documentos atuais resolvido pelo mestre

### Contrato ativo
T9 — Integração LLM ↔ Funil Mecânico ↔ Supabase Real ↔ Telemetria — aberto; G9 em aberto
`schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`

### Próximo passo autorizado
Repetir T9.15B-PROVA-REAL-CANARY com facts acumulados entre turnos (agora com telemetria completa observável)

### Objetivo
Tornar o bloco de facts persistence (T9.15H) completamente observável via `wrangler tail`. Dois catches silenciosos (`read` e `write`) que engoliam erros sem log foram tornados observáveis. Dois diagLogs novos foram adicionados: `facts_persistence.read` (confirma o que foi lido do Supabase) e `core.facts_received` (confirma o que o Core Mecânico recebeu). Nenhuma lógica alterada.

### Classificação da tarefa
contratual — PR-FIX cirúrgica / frente T9 / telemetria observabilidade

### Última PR relevante
PR #236 — T9.15H-FIX-FACTS-PERSISTENCE-TOPO (implementou readLeadAccumulatedFacts / writeLeadAccumulatedFacts; dois catches silenciosos não eram observáveis)

### Objetivo imutável do contrato
"Fazer a Enova 2 girar em sincronia completa: entender o lead, saber o stage, aplicar as regras MCMV, persistir em banco real, avançar stages de forma mecânica, responder humanamente via LLM e continuar do ponto certo depois de qualquer restart."

### Recorte executado nesta PR
T9.15I — telemetria do bloco facts_persistence: observabilidade do read path (anteriormente silencioso) e do write path (catch silencioso). Parte da frente de observabilidade/telemetria T9.13.

### O que esta PR fecha do contrato
- Bloco T9.15H completamente observável via `wrangler tail`
- Catches silenciosos tornados observáveis (sem alterar lógica de degradação graceful)
- diagLog `facts_persistence.read` → confirma se Supabase retornou facts persisted
- diagLog `facts_persistence.read.error` → captura erro do read path (antes invisível)
- diagLog `facts_persistence.write.error` → captura erro do write path (antes invisível)
- diagLog `core.facts_received` → confirma exatamente o que o Core Mecânico recebe

### O que esta PR NÃO fecha do contrato
- T9.15B-PROVA-REAL-CANARY (requer conversa real WhatsApp por Vasques)
- G9 permanece aberto

### Houve desvio de contrato?
não

### Contrato encerrado nesta PR?
não

### Item do A01
T9 — frente telemetria/observabilidade (G9-09: trace ponta-a-ponta visível via wrangler tail)

### Estado herdado
- Branch base: main (após merge PR #236 T9.15H)
- T9.15H implementado: readLeadAccumulatedFacts + writeLeadAccumulatedFacts em crm-store.ts + canary-pipeline.ts
- Dois catches silenciosos em canary-pipeline.ts engoliam erros sem log: impossível diagnosticar falha de persistência via wrangler tail
- diagLog `facts_persistence.read` ausente: impossível confirmar via tail se Supabase retornou facts persisted do turno anterior
- diagLog `core.facts_received` ausente: impossível confirmar via tail o que o Core Mecânico recebeu antes de decidir

### Escopo
**Único arquivo modificado:** `src/meta/canary-pipeline.ts`

4 mudanças cirúrgicas:
1. `catch { /* silencioso */ }` → `catch (e) { diagLog('facts_persistence.read.error', ...) }` (read path)
2. Após try/catch do read: `diagLog('facts_persistence.read', { ok, persisted_count, persisted_keys, lead_id_present })`
3. `catch { /* silencioso */ }` → `catch (e) { diagLog('facts_persistence.write.error', ...) }` (write path)
4. Antes de `runCoreEngine`: `diagLog('core.facts_received', { facts_count, fact_keys, stage_current })`

### Fora de escopo
- `src/core/` — zero diff
- `src/llm/` — zero diff
- `src/supabase/` — zero diff
- `src/crm/` — zero diff
- `panel-nextjs/` — zero diff
- `wrangler.toml` — zero diff
- `schema/contracts/` — zero diff
- Qualquer outro arquivo fora de `src/meta/canary-pipeline.ts`

### Mudanças em dados persistidos (Supabase)
Nenhuma — PR não altera lógica de persistência, apenas adiciona logs.

### Permissões Cloudflare necessárias
Nenhuma adicional.

### O que esta PR fecha
- Observabilidade completa do bloco T9.15H via `wrangler tail`
- 4 eventos agora observáveis: `facts_persistence.read`, `facts_persistence.read.error`, `facts_persistence.write.error`, `core.facts_received`
- Zero mudança de lógica — catches continuam não-bloqueantes, degradação graceful preservada

### O que esta PR NÃO fecha
- Prova real WhatsApp (T9.15B-PROVA-REAL-CANARY) — depende de Vasques

### Estado atual da frente
T9.15I concluída. Frente T9 pronta para Repetir T9.15B-PROVA-REAL-CANARY com telemetria completa.

### Arquivos vivos atualizados
`src/meta/canary-pipeline.ts` — único arquivo modificado (+18 linhas, -2 linhas)

### Referência de precedência
`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` > A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis

### Adendo de soberania da IA (A00-ADENDO-01)
Adendo de soberania da IA lido: sim
Esta PR introduz fala mecânica, surface engessada ou fallback dominante?: não

### Testes / Validação

| Suite | Resultado |
|-------|-----------|
| `npm run smoke` (core) | **24/24 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run smoke:core:text-extractor` | **OK PASS** |
| `npm run smoke:core:semantic-objectives` | **19/19 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

Confirmação visual no smoke:meta:canary:
```json
{"diag":"core.facts_received","facts_count":0,"fact_keys":[],"stage_current":"discovery"}
```

### Plano de rollback
`git revert e68d035` — reverte os 4 diagLogs e restaura os dois catches silenciosos. Zero impacto em lógica, dados ou outbound.

### Riscos
Nenhum — PR adiciona apenas logging. Catches continuam capturando exceções sem propagar. Nenhum texto do cliente é logado. Nenhum secret é logado.

### Evidências
- Commit: `e68d035`
- Branch: `fix/t9.15i-facts-persistence-telemetry`
- Diff: +18 linhas, -2 linhas, apenas `src/meta/canary-pipeline.ts`
- Diagnóstico T9.15I: `docs/diagnostics/T9.15I-DIAG-FACTS-PERSISTENCE-RUNTIME/` (22 arquivos)

### Disciplina de request e modelo
Complexidade da tarefa: baixa
Modelo utilizado: Sonnet 4.6
Automação introduzida: nenhuma

---

## Diff completo

```diff
diff --git a/src/meta/canary-pipeline.ts b/src/meta/canary-pipeline.ts
index 9e8b8da..fb95f54 100644
--- a/src/meta/canary-pipeline.ts
+++ b/src/meta/canary-pipeline.ts
@@ -220,7 +220,15 @@ export async function runCanaryPipeline(
       if (supabaseCfg) {
         try {
           persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
-        } catch { /* falha silenciosa — persisted facts = {} */ }
+        } catch (e) {
+          diagLog('facts_persistence.read.error', { error: String(e) });
+        }
+        diagLog('facts_persistence.read', {
+          ok: Object.keys(persistedFacts).length >= 0,
+          persisted_count: Object.keys(persistedFacts).length,
+          persisted_keys: Object.keys(persistedFacts),
+          lead_id_present: !!crmResult.lead_id,
+        });
       }
 
       // Bloco [C] — Persistência de facts extraídos (status: 'pending')
@@ -296,6 +304,12 @@ export async function runCanaryPipeline(
         diagLog('short_memory.built', { turns_total: 0, turns_included: 0, error: String(e) });
       }
 
+      diagLog('core.facts_received', {
+        facts_count: Object.keys(factsMap).length,
+        fact_keys: Object.keys(factsMap),
+        stage_current: currentStage,
+      });
+
       coreDecision = runCoreEngine({
         lead_id: crmResult.lead_id,
         current_stage: currentStage,
@@ -315,7 +329,9 @@ export async function runCanaryPipeline(
             fact_keys: Object.keys(factsMap),
             error: factsWriteResult.ok ? null : factsWriteResult.error,
           });
-        } catch { /* falha silenciosa — pipeline não bloqueia */ }
+        } catch (e) {
+          diagLog('facts_persistence.write.error', { error: String(e) });
+        }
       }
 
       diagLog('core.decision', {
```

---

## Análise do diff

### Mudança 1 — catch read tornando-se observável (L223)

**Antes:**
```typescript
} catch { /* falha silenciosa — persisted facts = {} */ }
```

**Depois:**
```typescript
} catch (e) {
  diagLog('facts_persistence.read.error', { error: String(e) });
}
```

Comportamento: idêntico — exceção capturada, pipeline não bloqueia, `persistedFacts` permanece `{}`. Diferença: agora a exceção é logada e visível via `wrangler tail --search "facts_persistence.read.error"`.

### Mudança 2 — diagLog do resultado do read (após L223)

```typescript
diagLog('facts_persistence.read', {
  ok: Object.keys(persistedFacts).length >= 0,  // sempre true — indica que o bloco executou
  persisted_count: Object.keys(persistedFacts).length,
  persisted_keys: Object.keys(persistedFacts),
  lead_id_present: !!crmResult.lead_id,
});
```

- `persisted_count: 0` + sem `facts_persistence.read.error` → Supabase retornou `{}` (lead novo ou last_context vazio)
- `persisted_count: N` → N facts carregados do Supabase para injeção no writeBuffer
- Observável via `wrangler tail --search "facts_persistence.read"`

### Mudança 3 — catch write tornando-se observável (L318)

**Antes:**
```typescript
} catch { /* falha silenciosa — pipeline não bloqueia */ }
```

**Depois:**
```typescript
} catch (e) {
  diagLog('facts_persistence.write.error', { error: String(e) });
}
```

Comportamento: idêntico. Diferença: agora a exceção é logada.

### Mudança 4 — diagLog antes do runCoreEngine (antes de L299)

```typescript
diagLog('core.facts_received', {
  facts_count: Object.keys(factsMap).length,
  fact_keys: Object.keys(factsMap),
  stage_current: currentStage,
});
```

- Confirma exatamente o que o Core Mecânico recebeu antes de decidir
- `facts_count: 2` + `fact_keys: ['customer_goal', 'nome_completo']` → T9.15H funcionou — facts de 2 turnos chegaram ao Core
- `facts_count: 0` → pipeline funcionou mas nenhum fact foi extraído nem persisted
- Observável via `wrangler tail --search "core.facts_received"`

---

## Sequência de tags observáveis após T9.15I (por ordem de execução)

```
wrangler tail nv-enova-2 --format pretty
```

| Ordem | Tag | Quando aparece |
|-------|-----|----------------|
| 1 | `meta.prod.pipeline.result` | sempre |
| 2 | `text_extractor.result` | sempre (com `persisted_facts_count`) |
| 3 | `facts_persistence.read.error` | apenas se readLeadAccumulatedFacts lançar exceção |
| 4 | `facts_persistence.read` | sempre que `supabaseCfg !== null` |
| 5 | `short_memory.built` | sempre |
| 6 | `core.facts_received` | sempre |
| 7 | `core.decision` | sempre |
| 8 | `facts_persistence.write` | sempre que `supabaseCfg !== null` e sem exceção |
| 9 | `facts_persistence.write.error` | apenas se writeLeadAccumulatedFacts lançar exceção |

### Para diagnosticar T9.15H em PROD via tail

```bash
# Confirmar se T9.15H está funcionando (facts persisted chegando ao Core):
wrangler tail nv-enova-2 --format pretty --search "core.facts_received"
# Esperar: facts_count >= 2 no turno 2 (interest + nome do turno 1)

# Confirmar leitura do Supabase:
wrangler tail nv-enova-2 --format pretty --search "facts_persistence.read"
# Esperar: persisted_count >= 1 no turno 2

# Detectar erro no read path:
wrangler tail nv-enova-2 --format pretty --search "facts_persistence.read.error"
# Esperar: nenhum evento (se aparecer, Supabase está com problema)

# Confirmar write path:
wrangler tail nv-enova-2 --format pretty --search "facts_persistence.write"
# Esperar: ok=true, facts_count >= 1
```
