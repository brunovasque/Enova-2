# T9.13G — Matriz payload × schema real Supabase

**PR**: T9.13G-DIAG/FIX | **Tipo**: PR-DIAG (anexo de PR-FIX) | **Data**: 2026-05-03
**Branch**: `fix/t9.13g-failfast-state-mapping`
**Fonte da verdade**: P0 schema discovery executado por Vasques (T9.13F real-run, log `t9-13-proof-real-6.log`)

---

## 1. Princípio

Esta matriz documenta, para cada coluna que o código tentava enviar ao Supabase real,
se a coluna **realmente existe** no schema (confirmado por `SELECT * limit=1 → Object.keys(row)`),
qual a **decisão T9.13G**, e o **motivo**.

**Regra invioláveis aplicadas:**
- Não criar coluna no Supabase.
- Não criar migration.
- Não alterar schema/RLS/bucket.
- O código se adapta ao schema real existente.
- Sem prova canônica de mapeamento → bloqueio formal (BLK).

---

## 2. Tabela: `crm_lead_meta`

**PK real**: `wa_id` (TEXT UNIQUE) — confirmado em T9.13C
**Schema real (T9.13G P0, subset relevante)**:
`wa_id, lead_pool, lead_temp, lead_source, tags, obs_curta, import_ref, auto_outreach_enabled, is_paused, created_at, updated_at, nome, telefone, ultima_acao, ultimo_contato_at, status_operacional, analysis_*, approved_*, rejection_*, recovery_*, visit_*, reserve_*, vgv_*, commission_*, financial_*, archive_*` (~120 colunas legado E1).

| payload_key | real_column_exists | decisão T9.13G | motivo |
|---|---|---|---|
| `wa_id` | **SIM** (PK) | **MANTIDO** no payload | PK real confirmada por execução T9.13C; única chave de upsert |
| `external_ref` | NÃO | REMOVIDO em T9.13F | PGRST204 confirmado T9.13F; mapeado para `wa_id` via mapper |
| `customer_name` | NÃO | REMOVIDO em T9.13E | PGRST204 confirmado T9.13E; equivalente legado: `nome` (não confirmado como destino canônico) |
| `phone_ref` | NÃO | **REMOVIDO em T9.13G** | PGRST204 confirmado T9.13F real-run; equivalente legado: `telefone` (não confirmado como destino canônico) |
| `status` | NÃO | **REMOVIDO em T9.13G** | PGRST204 confirmado T9.13F real-run; equivalente legado: `status_operacional` (semântica diferente — operacional vs lifecycle) |
| `manual_mode` | NÃO | **REMOVIDO em T9.13G** | PGRST204 confirmado T9.13F real-run; sem equivalente direto no schema legado |
| `lead_pool` | **SIM** | **ADICIONADO em T9.13H-FIX** | NOT NULL sem DEFAULT — 23502 confirmado em T9.13H real-run. Sem valor canônico no repo. Valor de prova: `'t9_13_test'`. BLK-T9.13H-LEAD-POOL-VALUE. |
| `created_at` | SIM | NÃO no payload de write | Timestamp de criação preservado; gerenciado pelo Supabase |
| `updated_at` | SIM | **MANTIDO** no payload | Confirmado pelo P0 real; permite upsert determinístico com timestamp de cliente |

**Payload final T9.13G**: `[wa_id, updated_at]`
**Payload final T9.13H-FIX**: `[wa_id, lead_pool, updated_at]`

**Campos preservados no CRM canônico (`CrmLead`) e writeBuffer** (não escritos no Supabase real):
`external_ref`, `customer_name`, `phone_ref`, `status`, `manual_mode`.

---

## 3. Tabela: `enova_state`

**PK real**: `id` (não usada no upsert) + `lead_id` UUID (FK lógica) — confirmado em T9.13C
**Schema real (T9.13G P0, subset relevante)**:
`id, lead_id, wa_id, last_incoming_id, last_reply_id, last_intent, last_context, last_ts, controle, atendimento_manual, updated_at, fase_conversa, intro_etapa, funil_status, funil_opcao_docs, atualizado_em, nome, last_processed_stage, last_user_stage, ` + dezenas de campos legado E1 (`estado_civil, regime, renda_*, docs_*, dossie_*, pacote_*, visita_*, p1_*, p2_*, p3_*`, etc).

| payload_key | real_column_exists | decisão T9.13G | motivo |
|---|---|---|---|
| `lead_id` | SIM (UUID) | MANTIDO no payload (apenas para id) | Confirmado em T9.13C — UUID válido obrigatório |
| `stage_current` | NÃO | **BLOQUEADO — BLK-T9.13-STATE-MAPPING** | PGRST204 confirmado T9.13F real-run. Múltiplos candidatos legado coexistem (`fase_conversa`, `last_processed_stage`, `last_user_stage`, `intro_etapa`). Sem prova canônica de qual usar — escrita real de `crm_lead_state` permanece em writeBuffer |
| `next_objective` | NÃO | REMOVIDO em T9.13F + BLK | PGRST204 confirmado T9.13F. Equivalente legado: `intro_etapa` (não confirmado como destino canônico) |
| `block_advance` | NÃO | REMOVIDO em T9.13E + BLK | PGRST204 confirmado T9.13E. Sem equivalente direto |
| `state_version` | NÃO | **BLOQUEADO — BLK-T9.13-STATE-MAPPING** | PGRST204 confirmado T9.13F real-run. Sem equivalente direto no schema legado |
| `updated_at` | SIM | MANTIDO no payload | Confirmado pelo P0 real |

**Payload técnico T9.13G**: `[lead_id, updated_at]` — mas escrita real BLOQUEADA.
A função `mapLeadStateToEnovaState` permanece no código apenas como contrato de tipo;
nenhuma chamada de `supabaseUpsert` é feita para `enova_state`.

### Candidatos legado encontrados pelo P0 (sem confirmação canônica)

| canônico CRM | candidato legado | confirmação? | observação |
|---|---|---|---|
| `stage_current` | `fase_conversa` | parcial — documentada em legado T0_PR1 (E1→E2 mapping para `current_phase` que não existe em real) | múltiplos coexistem |
| `stage_current` | `last_processed_stage` | não confirmada | semântica diferente — último stage processado (estado intermediário) |
| `stage_current` | `last_user_stage` | não confirmada | semântica diferente — stage do user (não do funil) |
| `next_objective` | `intro_etapa` | não confirmada | nome sugestivo mas sem prova |
| `state_version` | (nenhum) | — | sem candidato no schema legado |
| `block_advance` | (nenhum) | — | sem candidato no schema legado |

**Decisão T9.13G**: sem prova suficiente → **BLK-T9.13-STATE-MAPPING**.
`crm_lead_state` permanece em writeBuffer; `SupabaseCrmBackend.insert/update` registra
writeLog com `attempted_real_write=false`, `used_fallback=true`, `error='BLK-T9.13-STATE-MAPPING'`.

**Campos preservados no CRM canônico (`CrmLeadState`) e writeBuffer** (não escritos no Supabase real):
`stage_current`, `next_objective`, `block_advance`, `state_version`, `policy_flags`, `risk_flags`.

---

## 4. Bloqueios formais

### BLK-T9.13-STATE-MAPPING

**Status**: ATIVO desde T9.13G (2026-05-03)
**Tabela afetada**: `enova_state`
**Caminho de runtime afetado**: `SupabaseCrmBackend.insert/update` para `table === 'crm_lead_state'`
**Comportamento**: sempre writeBuffer; nenhum upsert real disparado

**Causa**: schema real de `enova_state` tem múltiplos candidatos legado para os campos canônicos
(`stage_current`, `next_objective`, `state_version`, `block_advance`) sem prova documental
de qual é o destino canônico de escrita. Exemplos: `fase_conversa`, `last_processed_stage`,
`last_user_stage`, `intro_etapa`. Não inventar mapeamento.

**Critério de desbloqueio**: confirmação explícita de Vasques sobre:
1. Qual coluna real recebe `stage_current` (ex: `fase_conversa`)
2. Qual coluna real recebe `next_objective` (ex: `intro_etapa`) — ou se omitir
3. Como representar `state_version` (coluna nova exigiria migration; ou pode ser implícito por `updated_at`)
4. Como representar `block_advance` (idem)

Após confirmação, criar PR-T9.13H com mapper revisado e remoção do BLK.

---

## 5. Telemetria preservada

| Output | Quando | Conteúdo |
|---|---|---|
| `[SCHEMA DIAG crm_lead_meta]` | sempre na P0 | real_columns, payload_keys, missing_from_real, kept |
| `[SCHEMA DIAG enova_state]` | sempre na P0 | idem |
| `[STATE_MAPPING_STATUS]` | sempre na P0 | declaração explícita do BLK-T9.13-STATE-MAPPING + candidatos |
| `[FAIL-FAST DIAG <tabela>]` | quando P0.3/P0.4 falha | real_columns, payload_keys, missing_from_real, kept, próxima ação |
| `[DIAG WRITE P5/P6/P7/P8]` | apenas se P0 permitir upsert | table, target_table, write_enabled, attempted_real_write, used_fallback, ok, http_status, rows, error sanitizado, test_id |
| `[DIAG P5/P6/P7/P8]` | apenas se P0 permitir upsert | leitura SELECT pós-upsert |

**Restrições mantidas**: nunca loga secrets, headers, payload completo ou dados reais de cliente.

---

## 6. Próxima ação obrigatória

Vasques reexecuta `npm run prove:t9.13-supabase-write-real-test` com credenciais reais.

**Resultado esperado:**
- P0.1/P0.2 PASS — schema discovery OK
- P0.3 PASS — `crm_lead_meta` payload (`wa_id, updated_at`) sem coluna ausente
- P0.4 PASS — `enova_state` payload (`lead_id, updated_at`) sem coluna ausente
- P5/P7 PASS — upsert real `crm_lead_meta` (apenas wa_id + updated_at) sem PGRST204
- P6.BLK.1/2/3 + P8.BLK.1/2 PASS — writeLog confirma BLK-T9.13-STATE-MAPPING
- P6.BUF.1/2/3 PASS — writeBuffer absorve `crm_lead_state` corretamente

**Se P0.3 ou P0.4 falhar** → fail-fast emite `[FAIL-FAST DIAG]` e prova encerra antes de P5–P8,
indicando exatamente qual coluna remover do payload sem precisar tentar upsert real.
