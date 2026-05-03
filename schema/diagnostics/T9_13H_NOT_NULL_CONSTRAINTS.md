# T9.13H — Diagnóstico de constraints NOT NULL em `crm_lead_meta`

**PR**: T9.13H-DIAG | **Tipo**: PR-DIAG | **Data**: 2026-05-03
**Branch**: `diag/t9.13h-not-null-constraints`
**Contexto**: Após PR #203 (T9.13G), prova real retornou 50 PASS | 6 FAIL | 0 SKIP.
P5 (`crm_lead_meta` upsert) falhou com Postgres code `23502` (NOT NULL violation).
Payload pós-T9.13G: `[wa_id, updated_at]`. P0 PASSOU (sem PGRST204).

---

## 1. Evidência do erro 23502

Log da prova real pós-T9.13G:
```
[DIAG WRITE P5] ... ok=false http_status=400
  error=http_400: {"code":"23502","details":"Failing row contains (...)", ...}
```

Postgres error `23502` = `not_null_violation`:
- Ocorre quando INSERT/UPSERT não fornece valor para coluna com NOT NULL sem DEFAULT.
- A coluna violada está no campo `message` do JSON de erro (não em `details`).
- `details` contém valores reais da linha → **NUNCA logar** (pode conter dados de cliente).

---

## 2. Melhorias implementadas em T9.13H-DIAG

### 2.1 `src/supabase/client.ts` — `parsePgError` + erro estruturado em `supabaseUpsert`

**Antes (T9.13G)**:
```
error=http_400: {"code":"23502","details":"Failing row contains (...)", ...}
```
`details` potencialmente exposto em log.

**Depois (T9.13H-DIAG)**:
```
error=http_400: pg_code=23502 pg_message=null value in column "X" of relation "crm_lead_meta" ...
```
- `code` e `message` expostos — são metadados de schema, não dados de usuário.
- `details` **OMITIDO** — contém valores reais da linha (dados de cliente).
- `hint` exposto apenas se presente.

### 2.2 `src/supabase/write-real-test-proof.ts` — P0.5, P0.6 e NOT_NULL INFERENCE

**P0.5**: Tenta acesso a `information_schema.columns` via PostgREST para listar colunas NOT NULL.
- Se acessível → `source=information_schema`, lista `columns_required`.
- Se bloqueado (esperado — PostgREST não expõe `information_schema` por padrão) → `source=blocked`.

**P0.6**: Documenta o mecanismo de inferência via `pg_message` do erro 23502 (T9.13H).

**`[NOT_NULL INFERENCE crm_lead_meta]`** (emitido apenas se P5 falhar com 23502):
- Extrai coluna violada de `pg_message` via regex `/null value in column "([^"]+)"/`.
- Emite `violated_column=X` para identificação sem re-execução.

---

## 3. Estado atual: coluna(s) NOT NULL em `crm_lead_meta`

### Coluna(s) identificadas como NOT NULL (schema real T9.13G P0)

A execução P0 real de T9.13G revelou o schema de `crm_lead_meta` (~120 colunas, subset):
`wa_id, lead_pool, lead_temp, lead_source, tags, obs_curta, import_ref, auto_outreach_enabled,
is_paused, created_at, updated_at, nome, telefone, ultima_acao, ultimo_contato_at,
status_operacional, analysis_x, approved_x, rejection_x, ...`

**Payload atual**: `[wa_id, updated_at]` — apenas 2 campos.

**23502 indica**: pelo menos uma dessas colunas é NOT NULL sem DEFAULT e não foi fornecida.

**Candidatos prováveis (análise de schema legado E1)**:
| coluna | razão |
|---|---|
| `nome` | campo obrigatório em sistemas MCMV legado; equivalente `customer_name` removido em T9.13E |
| `telefone` | campo obrigatório; equivalente `phone_ref` removido em T9.13G |
| `status_operacional` | campo de lifecycle; equivalente `status` removido em T9.13G |
| `is_paused` | BOOLEAN NOT NULL comum em schemas legado E1 |
| `auto_outreach_enabled` | BOOLEAN NOT NULL comum em schemas legado E1 |

**Confirmação pendente**: Vasques reexecuta prova com T9.13H-DIAG para revelar `violated_column` via `[NOT_NULL INFERENCE]`.

---

## 4. Próxima ação: T9.13H-FIX (bloqueada até prova)

### Critério de desbloqueio

1. Vasques reexecuta `npm run prove:t9.13-supabase-write-real-test` com credenciais reais.
2. P5 falha com `pg_code=23502`.
3. `[NOT_NULL INFERENCE crm_lead_meta]` emite `violated_column=X`.
4. Vasques confirma valor canônico para coluna `X` (ex: `nome` = `CrmLead.customer_name`).
5. PR-T9.13H-FIX adiciona `X` ao payload de `mapLeadToMeta` em `crm-store.ts`.
6. Se mais de uma coluna NOT NULL, repete ciclo até P5 PASS.

### Restrições de T9.13H-FIX (invioláveis)

- Não criar coluna no Supabase.
- Não alterar schema/RLS/bucket.
- Apenas adicionar ao payload fields que **existem** no schema real e têm equivalente canônico em `CrmLead`.
- Valor de prova deve ser claramente marcado (ex: `nome='T9.13 Prova Controlada'`).
- Sem dados de cliente real.

---

## 5. Bloqueios relacionados

| ID | Status | Descrição |
|---|---|---|
| BLK-T9.13-STATE-MAPPING | ATIVO | `enova_state` escrita permanece em writeBuffer até Vasques confirmar mapeamento canônico de `stage_current` |
| BLK-T9.13H-NOT-NULL | **ATIVO desde T9.13H-DIAG** | `crm_lead_meta` upsert falha com 23502; coluna NOT NULL não identificada; aguarda prova real T9.13H |

---

## 6. Resultado esperado pós-T9.13H-DIAG

Nova execução real deve produzir:
```
[NOT_NULL DIAG crm_lead_meta]
  source=information_schema|blocked
  columns_required=[...]
  payload_keys=[wa_id, updated_at]
  missing_required=[...]

[NOT_NULL INFERENCE crm_lead_meta]
  pg_code=23502
  pg_message=null value in column "X" of relation "crm_lead_meta" violates not-null constraint
  violated_column=X
  payload_keys=[wa_id, updated_at]
  AÇÃO T9.13H-FIX: adicionar campo "X" ao payload de mapLeadToMeta
```

Após identificação de `X`, criar **PR-T9.13H-FIX** com mapeamento confirmado por Vasques.
