# T9.13H-FIX — `lead_pool` NOT NULL em `crm_lead_meta`

**PR**: T9.13H-FIX | **Tipo**: PR-FIX | **Data**: 2026-05-03
**Branch**: `fix/t9.13h-lead-pool-not-null`
**Fonte da evidência**: `[NOT_NULL INFERENCE crm_lead_meta]` pós-PR #204 (T9.13H-DIAG)

---

## 1. Evidência

Prova real pós-PR #204: **52 PASS | 6 FAIL | 0 SKIP**

P5 produziu:
```
[NOT_NULL INFERENCE crm_lead_meta]
  pg_code=23502
  pg_message=null value in column "lead_pool" of relation "crm_lead_meta" violates not-null constraint
  violated_column=lead_pool
  payload_keys=[wa_id, updated_at]
  AÇÃO T9.13H-FIX: adicionar campo "lead_pool" ao payload de mapLeadToMeta
```

---

## 2. Uso de `lead_pool` no repo (busca T9.13H-FIX)

Busca realizada em todo o repositório por: `lead_pool`, `pool`, `base fria`, `base morna`, `base quente`, `source_type`, `lead_temp`, `lead_source`.

**Resultado**: `lead_pool` aparece **somente** em:
- `schema/diagnostics/T9_13G_PAYLOAD_SCHEMA_MATRIX.md` — listado como coluna real do schema P0
- `schema/diagnostics/T9_13H_NOT_NULL_CONSTRAINTS.md` — listado como coluna real do schema P0
- `src/supabase/types.ts` — comentário JSDoc do schema real

**Nenhum código TypeScript no repo define ou usa valores de `lead_pool`.**
**Nenhum documento de schema ou legado E1 define os valores permitidos do campo.**

---

## 3. Decisão

### Valor de prova (T9.13H-FIX)
`lead_pool = 't9_13_test'` — marcador explícito de prova, sem significado de negócio.

### Valor de produção
**BLOQUEADO — BLK-T9.13H-LEAD-POOL-VALUE**

Vasques deve confirmar:
1. Quais valores são aceitos por `lead_pool` no Supabase real (ex: enum, texto livre, NULL permitido em produção)?
2. Como mapear o pool de origem de um lead CRM real (ex: campo em `CrmLead`? variável de ambiente? fixo por tenant?).

Sem confirmação, `mapLeadToMeta` envia `'t9_13_test'` — inadequado para leads reais.

---

## 4. Alterações aplicadas

### `src/supabase/types.ts`
```typescript
export interface CrmLeadMetaRow {
  wa_id?: string;
  lead_pool?: string | null;  // NOT NULL no Supabase real (23502 T9.13H). BLK-T9.13H-LEAD-POOL-VALUE.
  created_at?: string | null;
  updated_at?: string | null;
  [k: string]: unknown;
}
```

### `src/supabase/crm-store.ts` — `mapLeadToMeta`
```typescript
function mapLeadToMeta(lead: CrmLead): CrmLeadMetaRow {
  return {
    wa_id: lead.external_ref ?? lead.lead_id,
    lead_pool: 't9_13_test',  // BLK-T9.13H-LEAD-POOL-VALUE — valor de prova; produção bloqueada
    updated_at: lead.updated_at,
  };
}
```

### `src/supabase/write-real-test-proof.ts`
- `payloadKeysLead = ['wa_id', 'lead_pool', 'updated_at']`
- P5.8: `check('lead_pool gravado no Supabase', foundLead?.lead_pool === 't9_13_test')`
- P7.6: `check('lead_pool preservado após update', updatedRow?.lead_pool === 't9_13_test')`

---

## 5. Bloqueios

| ID | Status | Descrição |
|---|---|---|
| BLK-T9.13-STATE-MAPPING | ATIVO | `enova_state` escrita em writeBuffer; mapeamento `stage_current` pendente |
| BLK-T9.13H-LEAD-POOL-VALUE | **ATIVO** | `lead_pool='t9_13_test'` somente para prova; valor canônico de produção pendente Vasques |

---

## 6. Próxima ação após T9.13H-FIX

Vasques reexecuta `npm run prove:t9.13-supabase-write-real-test` com credenciais reais.

**Resultado esperado:**
- P0.3 PASS (payload `[wa_id, lead_pool, updated_at]` alinhado ao schema real)
- P5.7 PASS (wa_id correto no Supabase)
- P5.8 PASS (lead_pool='t9_13_test' gravado)
- P7.5/P7.6 PASS (update preserva wa_id e lead_pool)

**Se nova 23502 aparecer** → `[NOT_NULL INFERENCE]` revelará `violated_column` → PR-T9.13I-FIX.

**Se P5 PASS** → frente `crm_lead_meta` desbloqueada para produção condicional a:
1. Vasques confirmar valor canônico de `lead_pool` → remover BLK-T9.13H-LEAD-POOL-VALUE
2. Vasques confirmar mapeamento `stage_current` → remover BLK-T9.13-STATE-MAPPING
3. Gate G9 permanece aberto até ambos desbloqueados
