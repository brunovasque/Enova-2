# PR-T9.16A — Confirmações Contextuais no text-extractor

**PR:** #240  
**Branch:** `fix/t9.16a-contextual-confirmation`  
**Commit principal:** `f839d38`  
**Data:** 2026-05-05  
**Tipo:** PR-IMPL contratual — frente T9

---

## Escopo

Implementação de confirmações contextuais no `text-extractor.ts` usando `pendingObjective`
derivado de `_next_objective` persistido entre turnos no Supabase (`enova_state.last_context`).

**Problema resolvido:** Quando o cliente responde "sim" após o LLM perguntar sobre RNM (ou estado civil,
ou processo), o extractor não sabia qual fact estava sendo confirmado — interpretava "sim" como
ambíguo, nunca extraía `rnm_valido=true`. Com `pendingObjective`, o extractor sabe o contexto da
pergunta anterior e interpreta a confirmação corretamente.

---

## Arquivos modificados (4)

### 1. `src/core/text-extractor.ts` (+134 linhas net)

**`extractFactsFromText(text, stage, pendingObjective?)`**
- Novo parâmetro opcional `pendingObjective?: string`
- Passado para `extractDiscovery` e `extractQualificationCivil` via switch

**`extractDiscovery(text, pendingObjective?)`**
- Bloco contextual RNM inserido ANTES do bloco keyword-only existente:
  ```typescript
  if (pendingObjective === 'perguntar_rnm_e_validade') {
    if (contains(n, 'sim', 'tenho', 'possuo', 'prazo indeterminado', 'indeterminado',
        'sem prazo', 'permanente', 'por tempo indeterminado')) { facts['rnm_valido'] = true; }
    else if (contains(n, 'nao', 'nao tenho', 'nao possuo', 'validade', 'prazo determinado',
        'vencido', 'temporario', 'renovavel', 'com data')) { facts['rnm_valido'] = false; }
  }
  if (facts['rnm_valido'] === undefined) { /* bloco original */ }
  ```
- Guard `facts['rnm_valido'] === undefined` impede sobrescrita pelo bloco keyword-only

**`extractQualificationCivil(text, pendingObjective?)`**
- Bloco contextual `estado_civil` antes da cadeia existente:
  ```typescript
  if (pendingObjective === 'coletar_estado_civil') {
    if (contains(n, 'solteiro')) facts['estado_civil'] = 'solteiro';
    else if (contains(n, 'casado')) facts['estado_civil'] = 'casado';
    else if (contains(n, 'uniao', 'companheiro')) facts['estado_civil'] = 'uniao_estavel';
    else if (contains(n, 'divorciado', 'separado')) facts['estado_civil'] = 'divorciado';
  }
  if (facts['estado_civil'] === undefined) { /* cadeia original intacta */ }
  ```
- Bloco contextual `processo` antes da cadeia existente:
  ```typescript
  if (pendingObjective === 'coletar_processo') {
    if (contains(n, 'sozinho', 'sozinha', 'so eu', 'individual')) facts['processo'] = 'solo';
    else if (contains(n, 'com', 'junto', 'conjunta', 'dois')) facts['processo'] = 'conjunto';
  }
  if (facts['processo'] === undefined) { /* cadeia original intacta */ }
  ```

### 2. `src/core/semantic-next-objective.ts` (1 linha alterada)

`perguntar_rnm_e_validade` atualizado com regra explícita sobre prazo:

```typescript
'perguntar_rnm_e_validade':
  'Perguntar se o cliente possui RNM (Registro Nacional Migratório) por prazo indeterminado. '
  + 'Deixar claro que apenas RNM por prazo indeterminado é aceito pelo programa MCMV — '
  + 'RNM com data de validade não é permitido, independente de estar vigente.',
```

### 3. `src/meta/canary-pipeline.ts` (+24 linhas net)

**Ordem de extração corrigida:** `extractFactsFromText` movida para DEPOIS do bloco de
`persistedFacts` (era ANTES — tornava `pendingObjective` impossível de derivar).

**Extração do `pendingObjective`:**
```typescript
const pendingObjective = typeof persistedFacts['_next_objective'] === 'string'
  ? persistedFacts['_next_objective']
  : undefined;
const extractedFacts = extractFactsFromText(event.text_body ?? '', currentStage, pendingObjective);
```

**Persistência do `_next_objective`:**
```typescript
if (coreDecision.next_objective) {
  factsMap['_next_objective'] = coreDecision.next_objective;
}
```
Gravado em `factsMap` antes do `writeLeadAccumulatedFacts` → sobrevive ao restart do Worker.

### 4. `src/core/text-extractor-smoke.ts` (+35 linhas)

8 novos casos de teste na seção `── T9.16A: confirmações contextuais ──`:

| ID   | Stage             | pendingObjective           | Input                    | Fact esperado              |
|------|-------------------|----------------------------|--------------------------|----------------------------|
| CTX1 | discovery         | perguntar_rnm_e_validade   | "sim, tenho"             | rnm_valido=true            |
| CTX2 | discovery         | perguntar_rnm_e_validade   | "sim"                    | rnm_valido=true            |
| CTX3 | discovery         | perguntar_rnm_e_validade   | "não tenho validade"     | rnm_valido=false           |
| CTX4 | discovery         | perguntar_rnm_e_validade   | "sim, tenho rnm valido"  | rnm_valido=true (guard OK) |
| CTX5 | qualification_civil | coletar_estado_civil     | "solteiro"               | estado_civil=solteiro      |
| CTX6 | qualification_civil | coletar_estado_civil     | "casado"                 | estado_civil=casado        |
| CTX7 | qualification_civil | coletar_processo         | "sozinho"                | processo=solo              |
| CTX8 | qualification_civil | coletar_processo         | "vou comprar junto"      | processo=conjunto          |

---

## Resultados de teste

| Suite                         | Antes   | Depois  |
|-------------------------------|---------|---------|
| smoke:core:text-extractor     | 81/81   | **89/89** |
| smoke (core)                  | 24/24   | 24/24   |
| smoke:meta:canary             | 41/41   | 41/41   |
| prove:t9.15h-facts-persistence| 34/34   | 34/34   |
| prove:t9.14-reverse-mapper    | 19/19   | 19/19   |

---

## Rollback

```bash
git revert f839d38
```

Rollback seguro: sem migration, sem schema, sem flags novas. `pendingObjective` é `undefined`
por default — comportamento idêntico ao estado pré-T9.16A quando ausente.

---

## Estado esperado em PROD após merge

Turno N: Core emite `next_objective='perguntar_rnm_e_validade'`
→ pipeline persiste `_next_objective='perguntar_rnm_e_validade'` em `last_context`

Turno N+1: Cliente responde "sim, tenho por prazo indeterminado"
→ `pendingObjective='perguntar_rnm_e_validade'` derivado de `last_context`
→ `extractFactsFromText` extrai `rnm_valido=true` (bloco contextual)
→ Core recebe `rnm_valido=true` → avança para `qualification_civil`

---

## Lacunas controladas

- **LC-T9.16A-01**: Apenas 3 `pendingObjective` mapeados (`perguntar_rnm_e_validade`, `coletar_estado_civil`, `coletar_processo`). Outros objetivos sem bloco contextual retornam extração padrão (comportamento correto).
- **LC-T9.16A-02**: `_next_objective` não é limpo quando Core não emite `next_objective` — pode carregar objetivo anterior. Risco baixo: bloco contextual só age se `pendingObjective` bate exatamente com o código esperado.

---

## Critérios de aceite pós-merge

- [ ] Cliente responde "sim" após pergunta RNM → `rnm_valido=true` persistido
- [ ] `_next_objective` aparece em `diagLog facts_persistence.write` (fact_keys inclui `_next_objective`)
- [ ] Smoke:core:text-extractor 89/89 PASS no CI
- [ ] Nenhuma regressão nos outros smokes

---

## Próxima ação

Vasques merge PR #240 → repetir T9.15B-PROVA-REAL-CANARY com confirmações contextuais ativas.
