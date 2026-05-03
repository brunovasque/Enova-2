# T9.13J-DIAG — CHECK Constraint probe `crm_lead_meta.lead_pool`

**PR**: T9.13J-DIAG | **Tipo**: PR-DIAG | **Data**: 2026-05-03
**Branch**: `diag/t9.13j-check-constraint-lead-pool`
**Contexto**: pós-PR #206 (T9.13I-DIAG), probe NOT NULL revelou 23514 para lead_pool.

---

## 1. Evidência que motivou T9.13J

Pós-PR #206 (resultado real):
```
[NOT_NULL FULL DIAG crm_lead_meta]
  source=incremental_probe
  required_columns=[lead_pool, lead_temp]
  probe_succeeded=false
  remaining_error=http_400: pg_code=23514 pg_message=new row for relation "crm_lead_meta"
                  violates check constraint "crm_lead_meta_lead_pool_check"
  iterations=N
```

O probe NOT NULL descobriu `[lead_pool, lead_temp]` mas parou quando `lead_pool='t9_13_test'`
disparou CHECK constraint `crm_lead_meta_lead_pool_check`. O valor `'t9_13_test'` satisfaz
NOT NULL mas viola a regra de domínio de `lead_pool`.

---

## 2. Estratégia de diagnóstico (sem alterar schema)

### Cascata de tentativas

| Tentativa | Método | Esperado |
|---|---|---|
| 1 | `information_schema.check_constraints` via PostgREST | `blocked` — não exposto |
| 2 | `pg_catalog.pg_constraint` via PostgREST | `blocked` — não exposto |
| 3 | `candidate_probe` | Descobre iterativamente via 23514 vs OK |

### Candidate probe (Tentativa 3)

```
payload = {
  wa_id: 't9_13_probe_pool_<ts>',
  lead_pool: candidate,
  lead_temp: 't9_13_test',   # NOT NULL sem CHECK próprio (confirmado T9.13I)
  updated_at: now
}

for candidate in LEAD_POOL_CANDIDATES:
  upsert(payload com lead_pool=candidate)
  if ok → accepted_value=candidate; stop
  if error.pg_code == '23514' → rejected_values.append(candidate); continue
  else → other_error_value=candidate; stop (erro inesperado)
```

### Candidatos testados (em ordem)

```
['fria', 'morna', 'quente',      # temperatura BR — mais provável em legado E1
 'nova', 'ativo', 'inativo',     # status genérico BR
 'cold', 'warm', 'hot',          # temperatura EN
 'novo', 'prospect', 'ativo',    # termos CRM genéricos
 'importado', 'manual', 'api',   # origem do lead
 'default', 'geral', 'teste']    # fallback genérico
```

**Garantias de segurança:**
- `wa_id` do probe é `t9_13_probe_pool_*` — isolado do wa_id do fluxo P5/P7
- Inclui `lead_temp='t9_13_test'` (NOT NULL confirmado T9.13I, sem CHECK próprio)
- Nunca loga `details` (dados reais da linha)
- Nunca loga payload completo
- Nunca loga serviceRoleKey
- `MAX_CANDIDATES = 20` — hard stop contra loop infinito

---

## 3. Módulo estendido: `src/supabase/not-null-probe.ts`

### Funções adicionadas (T9.13J)

```typescript
export type CheckProbeSource = 'information_schema' | 'pg_catalog' | 'candidate_probe' | 'blocked';

export interface CheckConstraintProbeResult {
  constraint_name: string;
  column: string;
  source: CheckProbeSource;
  check_clause: string | null;
  allowed_values: string[];
  accepted_value: string | null;
  rejected_values: string[];
  other_error_value: string | null;
  remaining_error: string | null;
  information_schema_error: string | null;
  pg_catalog_error: string | null;
  iterations: number;
}

export async function runCheckConstraintProbe(
  cfg: SupabaseConfig,
  probeWaId: string,
): Promise<CheckConstraintProbeResult>

export function printCheckConstraintDiag(result: CheckConstraintProbeResult): void
```

---

## 4. Integração no `write-real-test-proof.ts`

Import atualizado:
```typescript
import {
  runNotNullFullDiag, printNotNullFullDiag,
  runCheckConstraintProbe, printCheckConstraintDiag,
} from './not-null-probe.ts';
```

P0.7 adicionado após P0.6:
```
── P0.7: CHECK constraint probe crm_lead_meta.lead_pool (T9.13J) ──
  [INFO] probe wa_id (isolado): t9_13_probe_pool_<ts>
  [INFO] Tentando information_schema → pg_catalog → candidate_probe

[CHECK DIAG crm_lead_meta.lead_pool]
  constraint=crm_lead_meta_lead_pool_check
  source=candidate_probe
  information_schema_error=...
  pg_catalog_error=...
  allowed_values=[<valor aceito>]
  accepted_value=<valor aceito>
  rejected_values=[fria, morna, ...]
  remaining_error=none|...
  iterations=N
  ✓ P0.7: CHECK constraint probe executado
  ✓ P0.7a: candidatos testados ≥1
  ✓ P0.7b: probe sem loop infinito
```

---

## 5. O que esta PR NÃO faz

- **NÃO** aplica `accepted_value` em `mapLeadToMeta`.
- **NÃO** remove `'t9_13_test'` como valor atual de `lead_pool`.
- **NÃO** altera schema/RLS/bucket.
- **NÃO** cria coluna ou migration.
- **NÃO** desbloqueia BLK-T9.13-STATE-MAPPING.
- **NÃO** desbloqueia BLK-T9.13H-LEAD-POOL-VALUE.

---

## 6. Bloqueios ativos

| ID | Status | Descrição |
|---|---|---|
| BLK-T9.13-STATE-MAPPING | ATIVO | `enova_state` em writeBuffer — mapeamento pendente |
| BLK-T9.13H-LEAD-POOL-VALUE | ATIVO | Valor canônico de `lead_pool` pendente Vasques |
| BLK-T9.13I-NOT-NULL-FULL | ATIVO | `lead_temp` não aplicada em `mapLeadToMeta` ainda |
| BLK-T9.13J-CHECK-CONSTRAINT | **ATIVO** | CHECK constraint de `lead_pool` — T9.13J-FIX aplicará após confirmação Vasques |

---

## 7. Resultado esperado da próxima execução real

```
── P0.7: CHECK constraint probe crm_lead_meta.lead_pool (T9.13J) ──
  [INFO] probe wa_id (isolado): t9_13_probe_pool_<ts>
  [INFO] Tentando information_schema → pg_catalog → candidate_probe

[CHECK DIAG crm_lead_meta.lead_pool]
  constraint=crm_lead_meta_lead_pool_check
  source=candidate_probe
  information_schema_error=http_404: ...
  pg_catalog_error=http_404: ...
  allowed_values=[<valor>]
  accepted_value=<valor>
  rejected_values=[fria, morna, quente, ...]  (ou vazio se primeiro candidato aceito)
  remaining_error=none
  iterations=N
  RESULTADO: valor aceito encontrado = "<valor>"
  BLOQUEIO: BLK-T9.13H-LEAD-POOL-VALUE — confirmar valor canônico de produção com Vasques
  NÃO aplicar em mapLeadToMeta sem confirmação — esta PR é DIAG
  ✓ P0.7: CHECK constraint probe executado
  ✓ P0.7a: candidatos testados ≥1
  ✓ P0.7b: probe sem loop infinito
```

Após execução: Vasques confirma `accepted_value` como canônico → PR-T9.13J-FIX aplica
`lead_pool=<accepted_value>` e `lead_temp='t9_13_test'` (ou valor canônico se houver) em
`mapLeadToMeta`.
