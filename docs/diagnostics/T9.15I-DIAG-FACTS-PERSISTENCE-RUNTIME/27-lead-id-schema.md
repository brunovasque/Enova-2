# Diagnóstico T9.15I — 27 — lead_id schema: raiz completa do bug T9.15J
# Data: 2026-05-04
# Branch: fix/t9.15i-facts-persistence-telemetry
# Arquivos analisados: src/crm/service.ts, src/crm/store.ts, src/supabase/crm-store.ts, src/supabase/types.ts
# Status: read-only — zero alterações

---

## Objetivo

Identificar a causa exata de `pg_code=22P02 invalid input syntax for type uuid: "554185260518"` em
`facts_persistence.write` e `facts_persistence.read` (bug T9.15J).

---

## grep 1 — schema/ enova_state e crm_lead

```
schema/diagnostics/T10_6A_CONVERSATIONS_STALE_DATA_DIAG.md:187:
  ROOT-04: enova_state usa lead_id (UUID) no Worker vs wa_id no panel

schema/diagnostics/T10_6A_CONVERSATIONS_STALE_DATA_DIAG.md:193:
  enova_state tem ambas as colunas (lead_id UUID + wa_id), mas o Worker escreve pelo lead_id (UUID interno do CRM)

schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md:2748:
  crm_lead_meta: PK real é wa_id (TEXT UNIQUE), NÃO lead_id (erro 42703)

schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md:2749:
  enova_state.lead_id: tipo UUID — prova usava string de texto (erro 22P02)

schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md:1984:
  enova_state.lead_id requer UUID de lead existente no banco — UUIDs aleatórios de teste não têm lead cadastrado.

schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md:2643:
  crm_lead_meta: [wa_id, phone_ref, status, manual_mode, updated_at]
  enova_state:   [lead_id, stage_current, state_version, updated_at]

schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md:1393:
  ROOT-04: Worker escreve enova_state por lead_id (UUID), panel lê por wa_id — possível mismatch para leads novos
```

---

## grep 2 — upsertLeadByPhone (src/crm/service.ts:391)

```
391:export async function upsertLeadByPhone(
397:    return fail('wa_id é obrigatório para upsertLeadByPhone.')
```

### Função completa (L391–430)

```typescript
export async function upsertLeadByPhone(
  backend: CrmBackend,
  wa_id: string,
  phone_number_id?: string,
): Promise<CrmWriteResult<CrmLead>> {
  if (!wa_id?.trim()) {
    return fail('wa_id é obrigatório para upsertLeadByPhone.');
  }

  const existing = await backend.findOne<CrmLead>(
    'crm_leads',
    (r) => r.external_ref === wa_id,
  );

  if (existing) {
    if (phone_number_id && !existing.phone_ref) {
      const updated = await backend.update<CrmLead>(
        'crm_leads',
        (r) => r.lead_id === existing.lead_id,
        { phone_ref: phone_number_id, updated_at: nowIso() },
      );
      return ok(updated ?? existing);
    }
    return ok(existing);
  }

  const lead: CrmLead = {
    lead_id: uuid(),          // ← UUID gerado aqui apenas no in-memory backend
    external_ref: wa_id,
    ...
  };

  await backend.insert('crm_leads', lead);
  return ok(lead);
}
```

---

## grep 3 — enova_state em schema/

```
schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md:22:
  Estado é persistido em Supabase real (enova_state, crm_lead_meta)

schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md:90:
  ✅ Supabase crm_lead_meta, enova_state, crm_override_log
```

---

## Análise — cadeia causal completa do bug T9.15J

### Passo 1 — mapLeadFromMeta: wa_id torna-se lead_id (src/supabase/crm-store.ts:94–107)

```typescript
function mapLeadFromMeta(row: CrmLeadMetaRow, fallbackId: number): CrmLead {
  // wa_id é a PK real de crm_lead_meta (T9.13C). Usamos como lead_id interno.
  const wa_id = asString(row.wa_id);
  const lead_id = wa_id || `crm_lead_meta:${fallbackId}`;   // ← AQUI: lead_id = wa_id
  return {
    lead_id,           // "554185260518" (número de telefone)
    external_ref: ...,
    ...
  };
}
```

**`crm_lead_meta` não tem coluna `lead_id` (UUID).** Sua PK real é `wa_id` (TEXT).
Quando `SupabaseCrmBackend` mapeia a linha para `CrmLead`, usa `wa_id` como `lead_id` interno.

### Passo 2 — upsertLeadByPhone devolve CrmLead com lead_id = wa_id

`SupabaseCrmBackend.findOne('crm_leads', matcher)` → busca em `crm_lead_meta` → mapeia com `mapLeadFromMeta` → retorna `CrmLead.lead_id = "554185260518"`.

### Passo 3 — pipeline.ts:105

```typescript
lead_id = result.record.lead_id;   // = "554185260518"
```

`PipelineReport.lead_id = "554185260518"` retornado.

### Passo 4 — canary-pipeline.ts

```typescript
crmResult.lead_id = "554185260518"
readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id)
writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap)
```

### Passo 5 — readLeadAccumulatedFacts / writeLeadAccumulatedFacts (supabase/crm-store.ts:593–644)

```typescript
// READ
const result = await supabaseSelect<EnovaStateRow>(cfg, 'enova_state', {
  filters: { lead_id: `eq.${lead_id}` },  // ← "eq.554185260518" em coluna UUID
  limit: 1,
});
// → Supabase: pg_code=22P02 "invalid input syntax for type uuid: 554185260518"
// → retorna {} (silencioso pré-T9.15I)

// WRITE
const row: EnovaStateRow = {
  lead_id,              // "554185260518" — não é UUID
  last_context: JSON.stringify(facts),
  updated_at: new Date().toISOString(),
};
const result = await supabaseUpsert<EnovaStateRow>(cfg, 'enova_state', row);
// → Supabase: http_400 pg_code=22P02 "invalid input syntax for type uuid: 554185260518"
```

---

## Prova definitiva — EnovaStateRow (src/supabase/types.ts:226)

```typescript
// Schema real (T9.13G P0): id, lead_id, wa_id, last_incoming_id, last_reply_id,
// last_intent, last_context, last_ts, controle, atendimento_manual, updated_at, ...
export interface EnovaStateRow {
  ...
  wa_id?: string | null;      // ← coluna wa_id EXISTE no schema real
  lead_id?: string | null;    // UUID — coluna com FK constraint (enova_state_lead_id_fkey)
  last_context?: unknown;     // coluna usada para facts persistence
  ...
}
```

**`enova_state` tem AMBAS as colunas:**
- `lead_id` (UUID, FK constraint `enova_state_lead_id_fkey`) — exige UUID real
- `wa_id` (string, phone number) — sem constraint de tipo UUID

---

## Fix autorizado para T9.15J

**Escopo cirúrgico:** `src/supabase/crm-store.ts` — apenas as duas funções de facts persistence.

### readLeadAccumulatedFacts

**Antes:**
```typescript
filters: { lead_id: `eq.${lead_id}` }
```

**Depois:**
```typescript
filters: { wa_id: `eq.${wa_id}` }
```

### writeLeadAccumulatedFacts

**Antes:**
```typescript
const row: EnovaStateRow = {
  lead_id,
  last_context: JSON.stringify(facts),
  updated_at: new Date().toISOString(),
};
```

**Depois:**
```typescript
const row: EnovaStateRow = {
  wa_id,
  last_context: JSON.stringify(facts),
  updated_at: new Date().toISOString(),
};
```

### Assinatura das funções

Renomear parâmetro de `lead_id` para `wa_id` (o valor que chega já é o wa_id).

Em `canary-pipeline.ts`, as chamadas permanecem inalteradas — `crmResult.lead_id` já é o wa_id:
```typescript
persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
// e
await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
```

### Pré-requisito: wa_id em enova_state tem UNIQUE constraint?

Para `supabaseUpsert` funcionar por `wa_id`, é necessário que `enova_state.wa_id` tenha constraint UNIQUE (PostgREST upsert via Prefer: resolution=merge-duplicates usa a PK ou UNIQUE).

**Se não tiver:** o upsert criará linhas duplicadas. Alternativa: SELECT + UPDATE cirúrgico.

Verificar em Supabase: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'enova_state'`.

---

## Resumo executivo

| Item | Valor |
|------|-------|
| Bug | `pg_code=22P02 invalid input syntax for type uuid: "554185260518"` |
| Função afetada | `readLeadAccumulatedFacts` + `writeLeadAccumulatedFacts` (supabase/crm-store.ts) |
| Causa raiz | `mapLeadFromMeta` usa `wa_id` como `lead_id` interno (sem UUID real) |
| Coluna errada | `enova_state.lead_id` (UUID, FK) — valor enviado é TEXT/phone |
| Coluna correta | `enova_state.wa_id` (TEXT, phone) — sem constraint de tipo |
| Fix | Trocar filtro/payload de `lead_id` para `wa_id` nas 2 funções |
| Pré-condição | Verificar se `enova_state.wa_id` tem UNIQUE constraint |
| Arquivos a alterar | `src/supabase/crm-store.ts` (apenas as 2 funções) |
| Arquivos NÃO alterar | `canary-pipeline.ts`, `pipeline.ts`, `service.ts`, `store.ts` |
