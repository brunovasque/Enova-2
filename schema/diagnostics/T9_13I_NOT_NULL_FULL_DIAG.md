# T9.13I-DIAG — NOT NULL FULL DIAG `crm_lead_meta` (probe incremental automático)

**PR**: T9.13I-DIAG | **Tipo**: PR-DIAG | **Data**: 2026-05-03
**Branch**: `diag/t9.13i-not-null-full-diag`
**Contexto**: pós-PR #205 (T9.13H-FIX), prova real confirmou `lead_temp` como próxima NOT NULL.
Problema: descoberta coluna-por-coluna consome um request por NOT NULL. Solução: probe incremental.

---

## 1. Evidência que motivou T9.13I

Pós-PR #205:
```
violated_column=lead_temp
pg_message=null value in column "lead_temp" of relation "crm_lead_meta" violates not-null constraint
```
Payload atual `[wa_id, lead_pool, updated_at]` omite `lead_temp` (e possivelmente outras NOT NULL).

---

## 2. Estratégia de diagnóstico (sem alterar schema)

### Cascata de tentativas

| Tentativa | Método | Esperado |
|---|---|---|
| 1 | `information_schema.columns` via PostgREST | `blocked` — PostgREST não expõe por default |
| 2 | `pg_catalog.pg_attribute` via PostgREST | `blocked` — PostgREST não expõe por default |
| 3 | `incremental_probe` | Descobre iterativamente via 23502 |

### Incremental probe (Tentativa 3)

```
payload = { wa_id: 't9_13_probe_<ts>', lead_pool: 't9_13_test', updated_at: now }
loop (MAX=20):
  upsert(payload)
  if ok → probe_succeeded=true; stop
  if error.pg_code != '23502' → stop (outro constraint)
  violatedCol = extract from pg_message
  payload[violatedCol] = 't9_13_test'   # valor de prova seguro
  required_columns.append(violatedCol)
```

**Garantias de segurança:**
- `wa_id` do probe é `t9_13_probe_*` — **isolado** do wa_id do fluxo P5/P7
- Nunca loga `details` (dados reais da linha)
- Nunca loga payload completo
- Nunca loga serviceRoleKey
- `MAX_ITERATIONS = 20` — hard stop contra loop infinito
- Se coluna não extraível ou já no payload (guard loop), para imediatamente

---

## 3. Módulo criado: `src/supabase/not-null-probe.ts`

```typescript
export async function runNotNullFullDiag(
  cfg: SupabaseConfig,
  probeWaId: string,
): Promise<NotNullProbeResult>

export function printNotNullFullDiag(result: NotNullProbeResult): void
```

**`NotNullProbeResult`:**
```typescript
{
  source: 'information_schema' | 'pg_catalog' | 'incremental_probe' | 'blocked',
  required_columns: string[],
  values_suggested: Record<string, string>,
  probe_succeeded: boolean,
  remaining_error: string | null,
  iterations: number,
  information_schema_error: string | null,
  pg_catalog_error: string | null,
}
```

---

## 4. Integração no `write-real-test-proof.ts`

P0.5 substituído pelo full probe (T9.13I-DIAG). Emite:
```
[NOT_NULL FULL DIAG crm_lead_meta]
  source=incremental_probe
  information_schema_error=...
  pg_catalog_error=...
  required_columns=[lead_pool, lead_temp, ...]
  values_suggested={
    lead_pool: "t9_13_test",
    lead_temp: "t9_13_test",
    ...
  }
  probe_succeeded=true|false
  remaining_error=none|...
  iterations=N
```

P0.6 mantido (inferência via `pg_message` no P5 do fluxo principal).
`[NOT_NULL INFERENCE crm_lead_meta]` mantido no P5.

**Checks adicionados:**
- `P0.5`: NOT NULL FULL DIAG executado (sempre PASS — informacional)
- `P0.5a`: required_columns ≥ 1
- `P0.5b`: iterations < 20 (sem loop infinito)
- `P0.5c`: probe_succeeded OU remaining_error documentado

---

## 5. Colunas NOT NULL já confirmadas

| coluna | confirmação | valor de prova | valor canônico produção |
|---|---|---|---|
| `lead_pool` | T9.13H real-run | `'t9_13_test'` | **PENDENTE Vasques** (BLK-T9.13H-LEAD-POOL-VALUE) |
| `lead_temp` | T9.13I real-run (evidência acima) | `'t9_13_test'` | **PENDENTE Vasques** |

**Colunas adicionais a descobrir:** o probe revelará todas na próxima execução real.

---

## 6. O que esta PR NÃO faz

- **NÃO** aplica `lead_temp` (ou outras colunas descobertas) em `mapLeadToMeta`.
- **NÃO** altera schema/RLS/bucket.
- **NÃO** cria coluna ou migration.
- **NÃO** desbloqueaEia BLK-T9.13-STATE-MAPPING.
- **NÃO** desbloqueaEia BLK-T9.13H-LEAD-POOL-VALUE.

---

## 7. Bloqueios ativos

| ID | Status | Descrição |
|---|---|---|
| BLK-T9.13-STATE-MAPPING | ATIVO | `enova_state` em writeBuffer — mapeamento pendente |
| BLK-T9.13H-LEAD-POOL-VALUE | ATIVO | `lead_pool='t9_13_test'`; produção bloqueada |
| BLK-T9.13I-NOT-NULL-FULL | **ATIVO** | Colunas NOT NULL a descobrir via probe — T9.13I-FIX aplicará após confirmação Vasques |

---

## 8. Resultado esperado da próxima execução real

```
── P0.5: NOT NULL FULL DIAG (probe incremental automático — T9.13I) ──
  [INFO] probe wa_id (isolado de P5): t9_13_probe_<ts>
  [INFO] Tentando information_schema → pg_catalog → incremental_probe

[NOT_NULL FULL DIAG crm_lead_meta]
  source=incremental_probe
  information_schema_error=http_404: ...
  pg_catalog_error=http_404: ...
  required_columns=[lead_pool, lead_temp, ...]
  values_suggested={
    lead_pool: "t9_13_test",
    lead_temp: "t9_13_test",
    ...
  }
  probe_succeeded=true|false
  remaining_error=none|...
  iterations=N
  ✓ P0.5: NOT NULL FULL DIAG executado
  ✓ P0.5a: required_columns descobertos (≥1)
  ✓ P0.5b: probe não entrou em loop infinito
  ✓ P0.5c: ...
```

Após execução: Vasques confirma valores canônicos de produção para cada coluna → PR-T9.13I-FIX aplica todas de uma vez.
