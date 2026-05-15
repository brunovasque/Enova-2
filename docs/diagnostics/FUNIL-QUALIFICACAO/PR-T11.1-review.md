# PR-T11.1-review — Telemetria Estrutural Completa

**Data:** 2026-05-09
**Branch:** feat/t11.1-telemetria-estrutural
**Commit:** 3c5c2a7
**Contrato:** schema/contracts/active/CONTRATO_MESTRE_T11.md — §5 (T11.1)
**Tipo:** PR-DIAG / telemetria / Fase A

---

## Ramos instrumentados do extractor

| Identificador canônico | Extractor | Tipo | Fact capturado |
|---|---|---|---|
| `discovery.greeting` | extractDiscovery | contextual | customer_goal / conhece_mcmv |
| `discovery.customer_goal_kw` | extractDiscovery | keyword | customer_goal |
| `discovery.nome_ctx` | extractDiscovery | contextual | nome_completo |
| `discovery.nome_heuristica` | extractDiscovery | heurística | nome_completo |
| `discovery.nacionalidade_ctx` | extractDiscovery | contextual (perguntar_nacionalidade) | nacionalidade |
| `discovery.nacionalidade_kw` | extractDiscovery | keyword conservador | nacionalidade |
| `discovery.rnm_valido_ctx` | extractDiscovery | contextual (perguntar_rnm_e_validade) | rnm_valido |
| `discovery.rnm_valido_kw` | extractDiscovery | keyword | rnm_valido |
| `discovery.alternativa_rnm_ctx` | extractDiscovery | contextual (verificar_alternativa_rnm) | alternativa_rnm |
| `discovery.alternativa_rnm_kw` | extractDiscovery | keyword direto | alternativa_rnm |
| `discovery.processo_ctx` | extractDiscovery | contextual (avancar_para_qualification_civil) | processo |
| `discovery.estado_civil_ctx` | extractDiscovery | contextual (coletar_estado_civil) | estado_civil |
| `discovery.estado_civil_p3_ctx` | extractDiscovery | contextual (coletar_estado_civil_p3) | estado_civil_p3 |
| `qual_civil.estado_civil_ctx` | extractQualificationCivil | contextual | estado_civil |
| `qual_civil.processo_ctx` | extractQualificationCivil | contextual (coletar_processo) | processo |
| `qual_civil.estado_civil_kw` | extractQualificationCivil | keyword | estado_civil |
| `qual_civil.processo_kw` | extractQualificationCivil | keyword | processo |
| `qual_civil.composition_actor` | extractQualificationCivil | contextual + keyword | composition_actor |
| `qual_civil.estado_civil_p3` | extractQualificationCivil | contextual (coletar_estado_civil_p3) | estado_civil_p3 |
| `qual_civil.regime_cross` | extractQualificationCivil | cross-stage | regime_trabalho |
| `qual_civil.renda_cross` | extractQualificationCivil | cross-stage | renda_principal |
| `qual_civil.dependents_applicable` | extractQualificationCivil | contextual | dependents_applicable |
| `qual_civil.dependents_count` | extractQualificationCivil | contextual | dependents_count |
| `qual_renda.regime_kw` | extractQualificationRenda | keyword | regime_trabalho |
| `qual_renda.renda_principal` | extractQualificationRenda | parseRendaFlexivel | renda_principal |
| `qual_renda.autonomo_tem_ir` | extractQualificationRenda | contextual | autonomo_tem_ir |
| `qual_renda.ctps_36` | extractQualificationRenda | contextual | ctps_36 |
| `qual_eligibility.nacionalidade` | extractQualificationEligibility | keyword | nacionalidade |
| `docs_prep.docs_channel` | extractDocsPrep | keyword | docs_channel_choice |
| `visit.visit_interest` | extractVisit | keyword | visit_interest |

**Semântica:** `branch` = primeiro ramo a entrar no guard externo (first-set-wins). Null se nenhum bloco disparou.

**Skipped registrado:** `qual_civil.estado_civil_kw:p3_guard` — quando `pendingObjective === 'coletar_estado_civil_p3'` bloqueia o bloco keyword de `estado_civil` em `extractQualificationCivil`.

**Keywords registradas:** `rnm:tem_validade`, `rnm:sem_rnm`, `alt:sem_familiar` (nos blocos de RNM e alternativa_rnm contextual).

---

## Snippet: classifyNextObjectiveFormat (canary-pipeline.ts)

```typescript
function classifyNextObjectiveFormat(value: string | undefined): 'code' | 'pt_string' | 'null' {
  if (value === undefined || value === null || value === '') return 'null';
  if (value.length >= 40 && value.includes(' ')) return 'pt_string';
  return 'code';
}
```

---

## Snippet: log text_extractor.result estendido

```typescript
diagLog('text_extractor.result', {
  stage_current: currentStage,
  facts_extracted_count: extractedKeys.length,
  fact_keys: extractedKeys,
  persisted_facts_count: Object.keys(persistedFacts).length,
  persisted_fact_keys: Object.keys(persistedFacts),
  pending_objective: pendingObjective ?? null,
  pending_objective_length: pendingObjective?.length ?? 0,
  pending_objective_format: classifyNextObjectiveFormat(pendingObjective),  // NOVO T11.1
  extractor_branch_taken: extractionDiag.branch,                            // NOVO T11.1
  extractor_branches_skipped: extractionDiag.skipped,                       // NOVO T11.1
  input_text_normalized: extractionDiag.normalized,                         // NOVO T11.1
  keyword_matches: extractionDiag.keywords,                                 // NOVO T11.1
});
```

---

## Snippet: log core.decision estendido + pipeline.invariant_check

```typescript
const nextObjFormat = classifyNextObjectiveFormat(coreDecision.next_objective);
diagLog('core.decision', {
  lead_id_present: true,
  stage_current: coreDecision.stage_current,
  stage_after: coreDecision.stage_after,
  block_advance: coreDecision.block_advance,
  decision_id: coreDecision.decision_id,
  next_objective_emitted: coreDecision.next_objective,   // NOVO T11.1
  next_objective_format: nextObjFormat,                  // NOVO T11.1
  gate_id_active: coreDecision.gates_activated[0] ?? null, // NOVO T11.1
  gates_activated_list: coreDecision.gates_activated,    // NOVO T11.1
});
diagLog('pipeline.invariant_check', {
  invariant: 'next_objective_must_be_code',
  next_objective_format: nextObjFormat,
  invariant_violation: nextObjFormat === 'pt_string',
  next_objective_value: nextObjFormat === 'pt_string'
    ? coreDecision.next_objective.slice(0, 80)
    : coreDecision.next_objective,
});
```

---

## Confirmação de smokes

```
smoke:core:text-extractor → 124/124 PASS
smoke:meta:canary         → 41/41  PASS
```

---

## Confirmação zero mudança comportamental

- Nenhum `if`/`else if` de extração foi alterado
- Nenhuma condição de guard foi modificada
- Nenhum retorno de fact foi alterado
- `_diag.branch`, `_diag.skipped`, `_diag.keywords`, `_diag.normalized` são write-only do extractor e read-only do pipeline
- `getLastExtractionDiagnostics()` retorna cópia (spread) — imutável após leitura

---

## Bloco E — Score E2E (preencher após merge + E2E)

```
PR: T11.1
Status: aberta — aguardando merge
Score E2E antes: 29/45 PASS
Score E2E depois: [a preencher após E2E pós-merge]
Smokes: 124/124 PASS + 41/41 PASS
Telemetria nova adicionada: extractor_branch_taken, extractor_branches_skipped, input_text_normalized, keyword_matches, pending_objective_format, next_objective_emitted, next_objective_format, gate_id_active, gates_activated_list, pipeline.invariant_check
Telemetria nova consumida: [a preencher após E2E — verificar invariant_violation]
Próxima PR autorizada: T11.2 (unificação AVANCAR_PARA_CIVIL para código curto)
```

---

## Fix aplicado (2026-05-15) — PII leak prevention

**Bug identificado:** `_diag` (singleton de módulo) era resetado APÓS early returns em `extractFactsFromText`, causando vazamento cross-lead de `input_text_normalized` em telemetria.

Quando `text_body = ""` acionava early return na linha 880, `_diag` carregava dados do lead anterior. `getLastExtractionDiagnostics()` retornava esses dados stale, logando `input_text_normalized` de Lead A no contexto do Lead B.

**Fix:** reset defensivo no INÍCIO da função (Opção 1 da investigação), antes de qualquer early return. Coberto pelo comentário inline com referência ao relatório de investigação.

**Smoke regressivo:** `S-DIAG-REGRESSION` adicionado em `text-extractor-smoke.ts` — 5 checks (S-DIAG-1 a S-DIAG-5) validam que `getLastExtractionDiagnostics()` retorna estado limpo após `extractFactsFromText('')`.

**Resultado pós-fix:**
- `smoke:core:text-extractor`: 129/129 PASS (124 anteriores + 5 novos S-DIAG)
- `smoke:meta:canary`: 41/41 PASS (sem regressão)

**Severidade real:** alta tecnicamente, mas SEM impacto operacional (Enova-2 sem tráfego de cliente em prod até esta data).

**Identificado por:** ChatGPT Codex Connector na PR #1 do staging. Investigado e fixado via agente-nexus.
