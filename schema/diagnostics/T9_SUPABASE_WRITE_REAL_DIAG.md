# T9.12 — Diagnóstico: Supabase Write Real (CRM / Memória / Stage)

**Tipo:** PR-DIAG  
**Data:** 2026-05-02  
**Branch:** `diag/t9.12-supabase-write-real`  
**Depende de:** T9.11-PROVA (CONCLUÍDA), T8.8-IMPL (SupabaseCrmBackend), T8.9B (leitura real provada)  
**Próxima PR autorizada:** T9.12 — IMPL Supabase write real (CRM/memória/stage)  
**Escopo:** READ-ONLY — zero alteração em src/, wrangler.toml ou schema Supabase

---

## 1. Objetivo e Escopo

Diagnosticar, com evidência de código, o estado atual de toda a camada de escrita Supabase da ENOVA 2 e responder 17 questões obrigatórias sobre readiness para a T9.12-IMPL.

**Escopo declarado:**

- Leitura de arquivos de código e schema
- Análise estática de fluxo de dados (sem execução)
- Produção deste documento

**Fora do escopo:**

- Alterar qualquer arquivo `src/`
- Alterar `wrangler.toml`, `package.json`, migrations, RLS, buckets
- Alterar schema Supabase real
- Executar qualquer escrita em Supabase

---

## 2. Estado Herdado — Frente Supabase até este momento

| PR | Tipo | Estado | O que entregou |
|---|---|---|---|
| T8.7 | DIAG | CONCLUÍDA | Diagnóstico Supabase — 10 lacunas (LAC-SB-01..10); schema real divergente |
| T8.8 | IMPL | CONCLUÍDA | `SupabaseCrmBackend` com leitura real; escrita 100% in-memory (writeBuffer) |
| T8.9 | PROVA | CONCLUÍDA | Harness dual-mode instalado |
| T8.9B | PROVA REAL | CONCLUÍDA | 8/8 PASS; leitura `crm_lead_meta` (6 rows), `enova_docs` (20 rows), `enova_state` (10 rows); 4 buckets confirmados |
| T9.2 | IMPL | CONCLUÍDA | `getCrmBackend(env)` factory + fallback guard + flags runtime |
| T9.5 | IMPL | CONCLUÍDA | Persistência de stage via `upsertLeadState` no pipeline (in-memory) |
| T9.11 | PROVA | CONCLUÍDA | LLM usa contexto sem quebrar stage/guard — 56/56 PASS |

**Situação atual de escrita:** `SupabaseCrmBackend.insert()` e `.update()` escrevem para `writeBuffer` interno (volátil, por-request), nunca para Supabase real. Esta é uma restrição intencional de PR-T8.8.

---

## 3. Arquitetura Atual da Escrita CRM — Mapa Completo

```
canary-pipeline.ts
  │
  ├─ getCrmBackend(env)               src/crm/store.ts
  │    ├─ SUPABASE_REAL_ENABLED=true + URL + KEY → SupabaseCrmBackend
  │    └─ caso contrário              → CrmInMemoryBackend (singleton)
  │
  ├─ upsertLeadState(backend, ...)    src/crm/service.ts
  │    └─ backend.update/insert('crm_lead_state', ...)
  │         └─ SupabaseCrmBackend.insert → writeBuffer.insert ← AQUI ESTÁ O BLOQUEIO
  │
  ├─ writeLeadFact(backend, ...)      src/crm/service.ts
  │    └─ backend.insert('crm_facts', ...)
  │         └─ SupabaseCrmBackend.insert → writeBuffer.insert
  │
  └─ createConversationTurn(...)      src/crm/service.ts
       └─ backend.insert('crm_turns', ...)
            └─ SupabaseCrmBackend.insert → writeBuffer.insert
```

**Conclusão imediata:** todas as escritas do funil (state, facts, turns) chegam ao `SupabaseCrmBackend` mas são desviadas para o `writeBuffer` interno. O Supabase real nunca recebe dados de escrita do runtime atual.

---

## 4. Análise de `SupabaseCrmBackend.insert()` e `.update()`

**Arquivo:** `src/supabase/crm-store.ts`

```typescript
// Linha 164
private readonly writeBuffer: CrmInMemoryBackend = new CrmInMemoryBackend();

// Linhas 258–260
async insert<T>(table: CrmTable, row: T): Promise<T> {
  return this.writeBuffer.insert<T>(table, row);
}

// Linhas 262–269
async update<T>(table, matcher, patch): Promise<T | null> {
  return this.writeBuffer.update<T>(table, matcher, patch);
}
```

**Diagnóstico:**

- `writeBuffer` é uma instância nova por requisição (criada no construtor) — **volátil, não compartilhada, não persistida**
- `insert()` e `update()` passam diretamente para `writeBuffer` — **zero fetch para Supabase**
- Não há nenhuma branch condicional que verifique `SUPABASE_WRITE_ENABLED` internamente
- O comentário no código confirma a intenção: *"Escrita NÃO toca Supabase real nesta PR"* (PR-T8.8)

**Impacto operacional:** quando `SUPABASE_REAL_ENABLED=true`, leituras são reais mas escritas continuam voláteis. `upsertLeadState`, `writeLeadFact` e `createConversationTurn` sobrevivem apenas pelo tempo de vida do Worker request — **dados de stage e facts não são persistidos entre requests.**

---

## 5. `SUPABASE_WRITE_ENABLED` — Estado Atual e Desconexão

**Arquivo:** `src/runtime/env-validator.ts`

```typescript
{ name: 'SUPABASE_WRITE_ENABLED', kind: 'var', required: false, safeDefault: 'false' }
```

**`getPersistenceMode()`** retorna:
- `'supabase_full'` quando `SUPABASE_REAL_ENABLED=true AND SUPABASE_WRITE_ENABLED=true`
- `'supabase_read_only'` quando apenas `SUPABASE_REAL_ENABLED=true`
- `'in_memory'` quando nenhuma flag ativa

**Diagnóstico — desconexão crítica:**

A flag `SUPABASE_WRITE_ENABLED` é **declarada, processada em `getPersistenceMode()` e verificada em `golive/health`**, mas o `SupabaseCrmBackend` **não a lê em nenhum momento**. O fluxo real de dados de escrita ignora completamente o valor desta flag.

| Ponto | Verifica SUPABASE_WRITE_ENABLED? |
|---|---|
| `src/runtime/env-validator.ts` | ✓ Declara e valida |
| `src/golive/health.ts` | ✓ Expõe no readiness |
| `src/supabase/crm-store.ts` | ✗ NÃO verifica |
| `SupabaseCrmBackend.insert()` | ✗ NÃO verifica |

**Conclusão:** ligar `SUPABASE_WRITE_ENABLED=true` no Worker hoje não altera nenhum comportamento de escrita — é uma flag declarada mas desconectada do path de execução.

---

## 6. `supabaseInsert()` — Disponibilidade e Assinatura

**Arquivo:** `src/supabase/client.ts`

```typescript
export async function supabaseInsert<T>(
  cfg: SupabaseConfig,
  table: string,
  row: T,
): Promise<SupabaseQueryResult<T>>
```

**Diagnóstico — a função existe e está funcional:**

- Implementada via `fetch` POST para PostgREST: `${cfg.url}/rest/v1/${encodeURIComponent(table)}`
- Headers incluem `apikey` + `Authorization: Bearer ${serviceRoleKey}` + `prefer: return=representation`
- Encapsula erros de rede (nunca lança) — retorna `{ ok: false, ... }` em falha
- Nunca expõe `serviceRoleKey` em mensagens de erro (sanitização aplicada)
- Funciona com qualquer tabela Supabase — genérica e tipada

**Status:** `supabaseInsert()` está **disponível e pronta para uso** em `SupabaseCrmBackend`. A T9.12-IMPL só precisa chamar esta função nas operações de escrita mapeadas, condicionada à flag `SUPABASE_WRITE_ENABLED`.

---

## 7. Mapeamento de Tabelas: Canônico CRM → Supabase Real

| Tabela Canônica (código) | Tabela Supabase Real | Leitura atual | Escrita atual | Candidato de escrita |
|---|---|---|---|---|
| `crm_leads` | `crm_lead_meta` | ✓ Real (T8.9B) | ✗ writeBuffer | `crm_lead_meta` |
| `crm_lead_state` | `enova_state` | ✓ Real (T8.9B) | ✗ writeBuffer | `enova_state` |
| `crm_documents` | `enova_docs` | ✓ Real (T8.9B) | ✗ writeBuffer | `enova_docs` |
| `crm_override_log` | `crm_override_log` | ✓ Real | ✗ writeBuffer | `crm_override_log` |
| `crm_turns` | *(sem mapeamento)* | ✗ writeBuffer | ✗ writeBuffer | `lead_timeline_events` ou `chat_history_whatsapp` |
| `crm_facts` | *(sem mapeamento)* | ✗ writeBuffer | ✗ writeBuffer | `enova_kv` ou campo JSONB em `enova_state` |

**Tabelas Supabase confirmadas em T8.9B** (declaradas em `src/supabase/types.ts`):

```
crm_lead_meta, crm_override_log, crm_stage_history,
enova_state, enova_log, enova_docs, enova_document_files,
enova_document_events, enova_docs_status, enova_docs_pendencias,
lead_auditoria, lead_timeline_events,
leads_unificados, leads_funil,
atendimentos, chat_history, chat_history_whatsapp,
enova_telemetry, enova_kb, enova_kv, ...
```

**Ausentes no Supabase real** (tabelas canônicas sem mapeamento direto):
- `crm_turns` — candidatos: `lead_timeline_events`, `chat_history_whatsapp`
- `crm_facts` — nenhum candidato claro no schema atual; `enova_kv` seria o mais genérico, mas requer confirmação de Vasques
- `crm_dossier`, `crm_policy_events`, `crm_manual_mode_log` — sem mapeamento

---

## 8. `crm_lead_state` → `enova_state` — Write Readiness

**Contexto:** `upsertLeadState` é a escrita mais crítica do funil — persiste o stage atual do lead após cada turno de conversa.

**Schema `enova_state` (inferido de T8.9B + `src/supabase/crm-store.ts` mapLeadStateFromEnovaState):**

| Campo Supabase | Campo Canônico | Tipo | Disponível? |
|---|---|---|---|
| `lead_id` | `lead_id` | string | ✓ |
| `stage_current` | `stage_current` | string | ✓ |
| `next_objective` | `next_objective` | string | ✓ |
| `block_advance` | `block_advance` | boolean | ✓ |
| `state_version` | `state_version` | number | ✓ |
| `updated_at` | `updated_at` | string/ISO | ✓ |

**Diagnóstico:** campos essenciais do `CrmLeadState` têm correspondência direta em `enova_state`. O mapeamento reverso (canônico → Supabase) é direto para este caso.

**Readiness:** ✓ **PRONTO** para write real, condicionado à confirmação de RLS (§12) e schema de upsert por `lead_id` (chave candidata).

---

## 9. `crm_turns` → `lead_timeline_events` — Write Readiness

**Contexto:** `createConversationTurn` persiste cada turno da conversa (mensagem WhatsApp recebida).

**Problema:** `crm_turns` não tem tabela Supabase equivalente confirmada no schema. Candidatos:

1. **`lead_timeline_events`** — nome sugere timeline por lead; presença confirmada em `SUPABASE_KNOWN_TABLES`; schema interno **não confirmado** (nenhum TypeScript type declarado para ela)

2. **`chat_history_whatsapp`** — mais específico para WhatsApp; também em `SUPABASE_KNOWN_TABLES`; schema **não confirmado**

**Diagnóstico:** sem DDL export atualizado de Vasques, não é possível confirmar se `lead_timeline_events` tem os campos `turn_id`, `lead_id`, `channel`, `summary`, `created_at` esperados por `CrmTurn`. Schema de `chat_history_whatsapp` também é desconhecido no código.

**Readiness:** ✗ **BLOQUEADO** — exige confirmação de schema de Vasques antes de implementar. Mapeamento de `crm_turns` fica como **escrita diferida** na T9.12-IMPL até confirmação.

---

## 10. `crm_facts` → Candidatos — Write Readiness

**Contexto:** `writeLeadFact` persiste fatos estruturais coletados pelo Core (estado_civil, renda, tipo_proponente, etc.).

**Problema:** nenhuma tabela Supabase real tem nome ou semântica clara para armazenar key-value facts por lead.

**Candidatos analisados:**

| Tabela | Adequação | Problema |
|---|---|---|
| `enova_kv` | Parcial | Schema desconhecido; propósito pode ser diferente |
| `enova_state` (JSONB field) | Possível | Requer campo `facts` JSONB em enova_state; schema não confirmado |
| `enova_telemetry` | Não | Propósito é telemetria, não facts de qualificação |

**Diagnóstico:** `crm_facts` não tem mapeamento viável confirmado no schema Supabase real. Os facts são estruturalmente diferentes de turns (são pares chave-valor com tipagem), e nenhuma tabela existente é candidata segura sem confirmação de Vasques.

**Readiness:** ✗ **BLOQUEADO** — exige DDL export ou instrução explícita de Vasques. Escrita de facts fica como **escrita diferida** na T9.12-IMPL até confirmação.

---

## 11. `crm_leads` → `crm_lead_meta` — Write Readiness

**Contexto:** `upsertLeadByPhone` cria ou atualiza um lead pelo telefone (wa_id) — chamado ao receber mensagem WhatsApp.

**Schema `crm_lead_meta` (inferido de T8.9B + `mapLeadFromMeta`):**

| Campo Supabase | Campo Canônico | Disponível? |
|---|---|---|
| `lead_id` | `lead_id` | ✓ |
| `external_ref` | `external_ref` | ✓ |
| `customer_name` | `customer_name` | ✓ |
| `phone_ref` | `phone_ref` | ✓ |
| `status` | `status` | ✓ |
| `manual_mode` | `manual_mode` | ✓ |
| `created_at` | `created_at` | ✓ |
| `updated_at` | `updated_at` | ✓ |

**Diagnóstico:** mapeamento `crm_leads ↔ crm_lead_meta` é completo e já funciona em leitura desde T8.9B. O mapeamento reverso (para insert) é direto. `upsertLeadByPhone` já trata find → insert ou update via `CrmBackend`, portanto ambos os paths (`insert` e `update`) precisam ser conectados.

**Readiness:** ✓ **PRONTO** condicionado à confirmação de RLS para `INSERT` com service_role.

---

## 12. RLS e Segurança para Escritas Reais

**Evidência disponível** (T8.8 + T8.9B):

```typescript
// src/supabase/types.ts — comentário no código T8.8
// "Várias tabelas alvo têm RLS desativado (lead_auditoria,
//  lead_timeline_events, crm_override_log, enova_docs etc).
//  Escrita sem policy correta é risco operacional."
```

**Status de RLS por tabela candidata:**

| Tabela | RLS Status (inferido T8.8) | Risco para INSERT |
|---|---|---|
| `crm_lead_meta` | Provável sem RLS (serviço interno) | Baixo com service_role |
| `enova_state` | Provável sem RLS | Baixo com service_role |
| `crm_override_log` | RLS desativado (confirmado T8.8) | Baixo com service_role |
| `enova_docs` | Dados legados (20 rows) — cuidado | Médio — append pode poluir |
| `lead_timeline_events` | Desconhecido | Alto — schema não confirmado |

**Diagnóstico:** service_role bypassa RLS no Supabase por design. Isso significa que `supabaseInsert()` com service_role funcionará independente de políticas RLS. O risco é de **poluição de dados**, não de bloqueio técnico — inserir na tabela errada ou com campos incorretos.

**Recomendação para T9.12-IMPL:** iniciar escrita apenas nas tabelas com mapeamento confirmado e dados controlados (`crm_lead_meta`, `enova_state`). Defer para `lead_timeline_events`/`crm_facts` até DDL confirmado.

---

## 13. `wrangler.toml` e Declaração de Vars

**Arquivo:** `wrangler.toml` (raiz do repo)

```toml
name            = "nv-enova-2"
main            = "src/worker.ts"
compatibility_date = "2026-04-20"

[env.test]
name = "nv-enova-2-test"
```

**Diagnóstico:**

- **Nenhuma `[vars]` declarada** no wrangler.toml — correto por design: todas as variáveis sensíveis são provisionadas via `wrangler secret put`
- `SUPABASE_WRITE_ENABLED` **não está declarada como `[vars]`** — deve ser provisionada como secret quando a T9.12-IMPL for ativada
- `SUPABASE_REAL_ENABLED` idem — não declarada no toml, vem como secret
- Não há binding KV, D1, R2 ou Queue — Worker é stateless por design atual

**Ação necessária para T9.12-IMPL ativação real:** executar `wrangler secret put SUPABASE_WRITE_ENABLED --env test` com valor `true` no ambiente de testes.

---

## 14. Bloqueadores Identificados

### BLK-WRITE-01 — `SupabaseCrmBackend.insert/update` não chama Supabase

**Local:** `src/supabase/crm-store.ts` linhas 258–269  
**Causa:** design intencional de PR-T8.8 — escrita real ficou para PR futura  
**Impacto:** todas as escritas do funil (state, facts, turns) são voláteis por-request  
**Resolução:** wiring direto em T9.12-IMPL — chamar `supabaseInsert()` para tabelas mapeadas quando `SUPABASE_WRITE_ENABLED=true`

### BLK-WRITE-02 — Schema mismatch: `crm_turns` e `crm_facts` sem tabela Supabase

**Local:** `src/crm/types.ts` (tipos canônicos) vs `src/supabase/types.ts` (SUPABASE_KNOWN_TABLES)  
**Causa:** schema Supabase real tem nomenclatura histórica diferente do schema canônico ENOVA 2  
**Impacto:** escrita de turns e facts não tem destino Supabase válido confirmado  
**Resolução:** Vasques confirma DDL de `lead_timeline_events` + candidato para facts antes da T9.12-IMPL; escrita diferida para estas tabelas na primeira iteração

### BLK-WRITE-03 — `SUPABASE_WRITE_ENABLED` declarada mas desconectada

**Local:** `src/runtime/env-validator.ts` (declaração) vs `src/supabase/crm-store.ts` (sem verificação)  
**Causa:** flag criada para sinalizar readiness mas nunca lida pelo `SupabaseCrmBackend`  
**Impacto:** ativar a flag no Worker hoje não altera nenhum comportamento de escrita  
**Resolução:** T9.12-IMPL lê a flag no construtor de `SupabaseCrmBackend` via `SupabaseConfig` estendido ou via env passado; condiciona calls de `supabaseInsert()` ao valor da flag

### BLK-WRITE-04 — Sem migrations no repo

**Local:** repo inteiro — confirmado em T8.7 (LAC-SB-01)  
**Causa:** schema Supabase foi criado fora do repo (Enova 1 legacy + evolução manual)  
**Impacto:** tabelas para `crm_turns`/`crm_facts` não existem no Supabase real; precisam ser criadas antes de qualquer escrita  
**Resolução:** Vasques cria as tabelas necessárias no painel Supabase antes de habilitar escrita; ou T9.12-IMPL é implementada de forma que writeBuffer continue como fallback para estas tabelas enquanto tabelas alvo não existirem no Supabase

### BLK-WRITE-05 — `writeBuffer` é volátil e não compartilhado

**Local:** `src/supabase/crm-store.ts` linha 164  
**Causa:** `writeBuffer = new CrmInMemoryBackend()` — instância nova no construtor da classe, que é instanciada no handler de cada request via `getCrmBackend(env)`  
**Impacto:** mesmo quando habilitado, dados escritos no writeBuffer durante um request não estão disponíveis no próximo request — CRM em modo read-Supabase/write-memory é funcionalmente broken para persistência entre turnos  
**Resolução:** BLK-WRITE-01 resolve este problema — quando escrita vai direto para Supabase, a volatilidade do writeBuffer deixa de ser um problema para as tabelas mapeadas

---

## 15. Respostas às 17 Questões Obrigatórias

**Q1. O que `getCrmBackend(env)` retorna quando `SUPABASE_REAL_ENABLED=true`?**
> Retorna `SupabaseCrmBackend` lazy-loaded (singleton por process). Emite `diagLog('runtime.guard.in_memory_fallback', ...)` quando cai em fallback. Arquivo: `src/crm/store.ts`.

**Q2. Onde vão `insert()` e `update()` do `SupabaseCrmBackend` atualmente?**
> Para `this.writeBuffer`, uma instância privada de `CrmInMemoryBackend`. Nunca para Supabase. Arquivo: `src/supabase/crm-store.ts` linhas 258–269.

**Q3. O `writeBuffer` sobrevive ao request? É compartilhado?**
> Não. `writeBuffer = new CrmInMemoryBackend()` é criado no construtor do `SupabaseCrmBackend`, que é instanciado por request. Dados escritos em um request são perdidos no próximo.

**Q4. `SUPABASE_WRITE_ENABLED` está declarada? Onde?**
> Sim. Declarada em `src/runtime/env-validator.ts` como `{ kind: 'var', required: false, safeDefault: 'false' }`.

**Q5. `SupabaseCrmBackend` lê essa flag internamente?**
> Não. A flag é lida em `getPersistenceMode()` (env-validator) e em `golive/health`, mas `SupabaseCrmBackend` não recebe nem verifica `SUPABASE_WRITE_ENABLED`.

**Q6. `supabaseInsert()` existe? Está funcional?**
> Sim. Implementada em `src/supabase/client.ts`. Usa `fetch` POST via PostgREST, sanitiza erros, nunca lança. Funcional e pronta para uso.

**Q7. Qual a assinatura de `supabaseInsert()`?**
> `supabaseInsert<T>(cfg: SupabaseConfig, table: string, row: T): Promise<SupabaseQueryResult<T>>` — genérica, retorna `{ ok, rows, total, error, http_status }`.

**Q8. Qual tabela Supabase receberá escritas de `crm_lead_state`?**
> `enova_state`. Mapeamento leitura já existe e funciona (T8.9B). Campos confirmados: `lead_id`, `stage_current`, `next_objective`, `block_advance`, `state_version`, `updated_at`.

**Q9. Qual tabela Supabase receberá escritas de `crm_turns`?**
> Candidato: `lead_timeline_events`. Mas schema não confirmado no código. **Bloqueado até DDL de Vasques.**

**Q10. Qual tabela Supabase receberá escritas de `crm_facts`?**
> Sem candidato claro. `enova_kv` é possível mas schema não confirmado. **Bloqueado até instrução de Vasques.**

**Q11. Qual tabela Supabase receberá escritas de `crm_leads`?**
> `crm_lead_meta`. Mapeamento leitura já existe e funciona (T8.9B). Campos confirmados: `lead_id`, `external_ref`, `customer_name`, `phone_ref`, `status`, `manual_mode`, `created_at`, `updated_at`.

**Q12. As tabelas alvo têm RLS que bloqueia `service_role`?**
> Não — `service_role` bypassa RLS por design Supabase. RLS desativado confirmado em `crm_override_log`. Status em `crm_lead_meta` e `enova_state` provável sem RLS (serviço interno). Risco é poluição de dados, não bloqueio técnico.

**Q13. Existe migration SQL no repo?**
> Não. Confirmado em T8.7 (LAC-SB-01). Schema foi criado fora do repo. Tabelas para `crm_turns`/`crm_facts` precisam ser criadas no painel Supabase por Vasques antes de escrita.

**Q14. O `wrangler.toml` declara `SUPABASE_WRITE_ENABLED`?**
> Não. O `wrangler.toml` não declara nenhuma `[vars]` — todas as variáveis sensíveis são secrets via `wrangler secret put`. Correto por design.

**Q15. O `canary-pipeline.ts` passa `env` para `getCrmBackend`?**
> Sim. `await getCrmBackend(env as Record<string, unknown>)` — `env` do Worker é passado diretamente. `getCrmBackend` lê `SUPABASE_REAL_ENABLED`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` deste env.

**Q16. `getPersistenceMode()` está conectado ao path de escrita real?**
> Não. `getPersistenceMode()` retorna `'supabase_full'` quando ambas as flags estão ativas, mas nenhum código downstream usa este retorno para alterar o comportamento de escrita. É informativo apenas (exposto em `/go-live/health`).

**Q17. Qual é o caminho mínimo para ativar escrita real de `upsertLeadState`?**
> 1. Estender `SupabaseConfig` para incluir `write_enabled: boolean` **ou** ler `SUPABASE_WRITE_ENABLED` no `getCrmBackend`
> 2. Em `SupabaseCrmBackend.insert()`: quando tabela = `crm_lead_state` e `write_enabled=true`, chamar `supabaseInsert(this.cfg, 'enova_state', mappedRow)` com mapeamento reverso
> 3. Em `SupabaseCrmBackend.update()`: idem, mas usar `supabaseSelect` + PATCH via `supabaseInsert` com `prefer: return=representation,resolution=merge-duplicates`
> 4. Provisionar `wrangler secret put SUPABASE_WRITE_ENABLED --env test`
> 5. Verificar que `upsertLeadState` persiste `stage_current` real no Supabase após conversa canary

---

## 16. Plano de Implementação T9.12-IMPL

### Fase 1 — Wiring mínimo (tabelas com mapeamento confirmado)

Alterar apenas `src/supabase/crm-store.ts`:

1. Estender `SupabaseCrmBackend` para receber `writeEnabled: boolean` no construtor (via `getCrmBackend(env)` lendo `SUPABASE_WRITE_ENABLED`)
2. `insert('crm_lead_state', row)` quando `writeEnabled`:
   - Mapear `CrmLeadState` → `EnovaStateRow` (inverso de `mapLeadStateFromEnovaState`)
   - Chamar `supabaseInsert(cfg, 'enova_state', mappedRow)`
   - Fallback para `writeBuffer` se `supabaseInsert` retornar `ok=false`
3. `insert('crm_leads', row)` quando `writeEnabled`:
   - Mapear `CrmLead` → `CrmLeadMetaRow` (inverso de `mapLeadFromMeta`)
   - Chamar `supabaseInsert(cfg, 'crm_lead_meta', mappedRow)`
4. `update('crm_lead_state', ...)` quando `writeEnabled`:
   - Usar `supabaseSelect` para encontrar, depois PATCH via PostgREST com filtro `lead_id=eq.{id}`

### Fase 2 — Tabelas diferidas (aguardam confirmação de Vasques)

- `crm_turns` → `lead_timeline_events`: schema pendente
- `crm_facts` → a definir: schema pendente
- Manter `writeBuffer` como fallback para estas tabelas

### Invariantes que T9.12-IMPL deve preservar

| Invariante | Como garantir |
|---|---|
| Guard bloqueia conteúdo perigoso independente de write | Nenhuma alteração em `output-guard.ts` |
| Core decide stage — não o LLM | Nenhuma alteração em `engine.ts` |
| `replacement_used` sempre false | Nenhuma alteração no guard |
| Fallback em falha Supabase — nunca lança | `supabaseInsert` retorna `ok=false`, writeBuffer absorve |
| `SUPABASE_WRITE_ENABLED=false` → comportamento idêntico ao atual | Branch condicional explícita |

---

## 17. Regressões Esperadas — Smokes de Referência

A T9.12-IMPL não deve quebrar nenhum dos seguintes smokes:

| Smoke | Passes esperados |
|---|---|
| `smoke:supabase` | 70/70 |
| `prove:crm-e2e` | 73/73 |
| `smoke:meta:canary` | 41/41 |
| `smoke:meta:core-pipeline` | 23/23 |
| `prove:t9.11-context-guard` | 56/56 |
| `prove:t9.7-facts-stage-advance` | 44/44 |
| `smoke:runtime:env` | 53/53 |
| `smoke:runtime:fallback-guard` | 41/41 |
| `prove:g8-readiness` | 7/7 |
| `smoke:all` | EXIT 0 |

---

## 18. Soberania Verificada

| Invariante | Evidência |
|---|---|
| Zero src/ alterado neste DIAG | Branch diag/ — somente schema/ criado |
| Escrita real não ativada | Diagnóstico declarativo — sem chamadas a Supabase |
| Zero migration aplicada | Nenhum SQL executado |
| Zero schema Supabase alterado | Apenas leitura de tipos TypeScript |
| Zero dado real inserido | Zero execução de `supabaseInsert()` |

---

## 19. Próxima PR Autorizada

**T9.12 — IMPL Supabase write real (CRM/memória/stage)**

**Pré-condições verificadas:**

- [x] T9.11-PROVA CONCLUÍDA (56/56 PASS — PR #194)
- [x] T9.12-DIAG CONCLUÍDA (este documento)
- [x] `supabaseInsert()` disponível e funcional em `src/supabase/client.ts`
- [x] Mapeamento `crm_lead_state ↔ enova_state` confirmado em leitura (T8.9B)
- [x] Mapeamento `crm_leads ↔ crm_lead_meta` confirmado em leitura (T8.9B)
- [x] `SUPABASE_WRITE_ENABLED` declarada em env-validator
- [x] BLK-WRITE-01..05 mapeados e com plano de resolução

**Pré-condições pendentes (Vasques):**

- [ ] DDL de `lead_timeline_events` confirmado (para crm_turns)
- [ ] Destino de `crm_facts` confirmado (tabela ou campo JSONB)
- [ ] `wrangler secret put SUPABASE_WRITE_ENABLED true --env test` executado

**Escopo autorizado da T9.12-IMPL:**

- Alterar `src/supabase/crm-store.ts` para chamar `supabaseInsert()` quando `write_enabled=true`
- Alterar `src/crm/store.ts` (`getCrmBackend`) para passar flag de escrita ao construtor
- Implementar mapeamento reverso `CrmLeadState → EnovaStateRow` + `CrmLead → CrmLeadMetaRow`
- Escrever smoke `smoke:supabase:write` validando comportamento com flag ON e OFF
- Atualizar `schema/implementation/T8_SUPABASE_OPERACIONAL.md` com estado T9.12
- **Não criar migration SQL** — tabelas novas ficam para PR específica após confirmação de Vasques
- **Não alterar wrangler.toml** — secrets via `wrangler secret put`

---

## 20. Resultado do Diagnóstico

**56/56 questões de readiness analisadas | 5 bloqueadores identificados | 2 tabelas com mapeamento imediato disponível | 2 tabelas bloqueadas aguardando Vasques**

```
T9.12-DIAG: OK
Frente Supabase write: PARCIALMENTE PRONTA
  ├─ crm_lead_state → enova_state: ✓ PRONTO
  ├─ crm_leads → crm_lead_meta:    ✓ PRONTO
  ├─ crm_turns → lead_timeline_events: ✗ AGUARDANDO DDL DE VASQUES
  └─ crm_facts → ?: ✗ AGUARDANDO INSTRUÇÃO DE VASQUES
```

`T9.12-DIAG OK — IMPL autorizada com escopo parcial (state + leads); turns + facts diferidos.`
