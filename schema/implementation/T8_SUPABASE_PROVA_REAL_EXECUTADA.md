# T8_SUPABASE_PROVA_REAL_EXECUTADA — Execução real Supabase (PR-T8.9B)

**PR**: PR-T8.9B | **Tipo**: PR-PROVA | **Status**: CONCLUÍDA — frente Supabase ENCERRADA  
**Base**: PR-T8.9 (harness instalado)  
**Data**: 2026-04-30  
**Branch**: feat/t8-pr-t8-9b-execucao-real-supabase

---

## §1 — Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.9B |
| Tipo | PR-PROVA |
| Base | PR-T8.9 — harness `prove:supabase-real` instalado |
| Objetivo | Execução real Supabase com env real controlada e registro de evidência positiva |
| Resultado final | **8/8 PASS \| 1 SKIPPED \| 0 FAIL — EXIT 0** |
| Frente Supabase | **ENCERRADA** — leitura real aprovada em todas as fases |

---

## §2 — Ambiente

| Item | Status |
|---|---|
| Modo skip testado (Claude Code) | SIM — `SKIPPED_REAL_ENV_MISSING` / exit 0 |
| Modo real testado (Vasques local) | SIM — três rodadas; rodada 3 positiva |
| URL mascarada | `https://jsqvhmnjsbmtfyyukwsr.supabase.co` |
| Service role exposta? | NÃO — impresso apenas `eyJhbG…(219 chars)` |
| Node.js | v24.14.1 |
| fetch disponível | `true` (typeof=function) |
| Data da execução positiva | 2026-04-30 |

---

## §3 — Comandos executados

```bash
# Vasques rodou localmente (segredo nunca exposto aqui):
SUPABASE_REAL_ENABLED=true \
SUPABASE_URL=<masked: https://jsqvhmnjsbmtfyyukwsr.supabase.co> \
SUPABASE_SERVICE_ROLE_KEY=<masked: eyJhbG...219 chars> \
npm run prove:supabase-real
```

---

## §4 — Resultado do modo skip

```
PROVA-SUPABASE-REAL | PR-T8.9 | 2026-04-30
============================================================
SKIPPED: SKIPPED_REAL_ENV_MISSING
  SUPABASE_REAL_ENABLED não é "true" ou envs ausentes. Prova pulada — nunca falha CI.
EXIT 0 (skipped)
```

---

## §5 — Histórico de execuções reais

### Rodada 1 — bloqueio de rede local

**Resultado**: 2/8 PASS — `network_error: fetch failed` em P2–P7.  
**Causa**: conectividade local bloqueada. Vasques resolveu.  
**Correção**: bloco P0 de diagnóstico de rede adicionado ao harness.

### Rodada 2 — coluna `updated_at` inexistente em `enova_docs`

**Resultado**: 7/8 PASS — P4 falhou: `column enova_docs.updated_at does not exist`.  
**Causa**: `enova_docs` não tem `updated_at`; coluna real é `created_at`.  
**Correção**: `proof.ts` P4 e `crm-store.ts readDocuments()` corrigidos: `updated_at.desc` → `created_at.desc`.

### Rodada 3 — **resultado final positivo** ✅

```
PROVA-SUPABASE-REAL | PR-T8.9 | 2026-04-30

Modo real ativo.
url_masked      : https://jsqvhmnjsbmtfyyukwsr.supabase.co
service_role   : eyJhbG...(219 chars)
lead_ref        : (não setado — leitura geral)
write_enabled  : false
known_tables    : 30
known_buckets   : 4

--- Diagnóstico de rede (P0) ---
Node.js: v24.14.1
fetch disponível: true (typeof=function)
endpoint neutro (https://httpstat.us/200): FAIL — fetch failed | cause: other side closed [UND_ERR_SOCKET]
Supabase /rest/v1/ HEAD: status=401 (esperado sem auth — OK)
--- Fim P0 ---

[P1] Readiness ............ OK  mode=supabase_real warnings=3
[P2] Auth inválida ........ OK  http_status=401 ok=false
[P3] crm_lead_meta ........ OK  rows=6 lead_ref=all
[P4] enova_docs ........... OK  rows=20
[P5] Dossier snapshot ..... OK  state_rows=10 override_rows=0 lead_ref=all
[P6] enova_document_files . OK  rows=0
[P7] Storage buckets ...... OK  found=4/4 known_matched=4/4 buckets=[emailsnv,documentos-pre-analise,enavia-brain,enavia-brain-test]
[P8] Write opcional ....... SKIPPED  SUPABASE_PROOF_WRITE_ENABLED não setado. Insert real pulado.

RESULTADO: 8/8 PASS | 1 SKIPPED | 0 FAIL

PROVA-SUPABASE-REAL CONCLUÍDA
EXIT 0 (ok)
```

---

## §6 — Análise da rodada 3

| Fase | Status | Evidência |
|---|---|---|
| P1 Readiness estrutural | **PASS** | `mode=supabase_real warnings=3` — envs reconhecidas, readiness OK |
| P2 Auth inválida (espera 4xx) | **PASS** | `http_status=401` — endpoint real confirmado, auth funcional |
| P3 Leitura `crm_lead_meta` | **PASS** | `rows=6` — 6 leads reais lidos |
| P4 Leitura `enova_docs` | **PASS** | `rows=20` — 20 documentos reais lidos (coluna `created_at` confirmada) |
| P5 Dossier snapshot | **PASS** | `state_rows=10 override_rows=0` — estado de 10 leads + log de overrides |
| P6 Leitura `enova_document_files` | **PASS** | `rows=0` — tabela existe, sem arquivos físicos no momento |
| P7 Storage buckets | **PASS** | `found=4/4 known_matched=4/4` — 4 buckets reais encontrados e confirmados |
| P8 Write append-only | **SKIPPED** | sem `SUPABASE_PROOF_WRITE_ENABLED` — decisão correta de segurança |

### Nota sobre P0 — endpoint neutro

`httpstat.us` retornou `UND_ERR_SOCKET` (FAIL), mas o Supabase `/rest/v1/ HEAD` retornou `401` — conectividade com o Supabase real está OK. O endpoint neutro falhou por restrição específica do ambiente local de Vasques, sem impacto na prova real.

### Storage — 4 buckets confirmados

| Bucket | Público | Objetos | Status |
|---|---|---|---|
| `documentos-pre-analise` | Sim | 141 | Confirmado — risco de policy documentado |
| `emailsnv` | Não | 0 | Confirmado |
| `enavia-brain` | Sim | 112 | Confirmado — risco de policy documentado |
| `enavia-brain-test` | Não | 0 | Confirmado |

---

## §7 — Correções aplicadas nesta PR-T8.9B

| Arquivo | Correção | Motivo |
|---|---|---|
| `src/supabase/proof.ts` — P4 | `updated_at.desc` → `created_at.desc` | `enova_docs.updated_at` não existe |
| `src/supabase/crm-store.ts` — `readDocuments()` | `updated_at.desc` → `created_at.desc` | mesmo bug no Worker runtime |
| `src/supabase/proof.ts` — P0 | `runNetworkDiagnostics()` adicionado | diagnóstico de conectividade |
| `src/supabase/proof.ts` | `extractNetworkCause()` adicionado | extrai `.cause` do erro undici |

**Outras ocorrências verificadas — sem alteração necessária**:
- `types.ts:186` `EnovaDocsRow.updated_at?` — type declaration opcional, fallback gracioso no mapper
- `crm-store.ts:130` `asString(row.updated_at) || nowIso()` — fallback safe se campo ausente
- `proof.ts:271` `enova_state` com `updated_at.desc` — coluna existe, P5 PASSOU
- `smoke.ts:181` `crm_lead_meta` com `updated_at` — coluna existe, P3 PASSOU

---

## §8 — Segurança

| Verificação | Status |
|---|---|
| Service role apareceu em stdout? | **NÃO** — apenas `eyJhbG…(219 chars)` |
| URL completa exposta? | **NÃO** — apenas host base |
| Segredo em output de erro? | **NÃO** — `safeErrorMessage` e `extractNetworkCause` sanitizam |
| Schema alterado (DDL)? | **NÃO** |
| RLS alterado? | **NÃO** |
| Bucket/storage policy alterado? | **NÃO** |
| Delete/update/reset real? | **NÃO** |
| Write real executado? | **NÃO** — P8 SKIPPED (decisão correta) |
| WhatsApp real? | **NÃO** |
| LLM real? | **NÃO** |
| Cliente real / go-live? | **NÃO** |
| Migration? | **NÃO** |

---

## §9 — Resultado final

| Critério | Status |
|---|---|
| Conexão real Supabase | **APROVADO** — P2 401 + P3–P7 positivos |
| Leitura real `crm_lead_meta` | **APROVADO** — 6 rows |
| Leitura real `enova_docs` | **APROVADO** — 20 rows |
| Dossiê real (`enova_state` + `crm_override_log`) | **APROVADO** — 10 states, 0 overrides |
| `enova_document_files` | **APROVADO** — tabela existe (vazia) |
| Storage buckets | **APROVADO** — 4/4 confirmados |
| Write append-only | **SKIPPED** por segurança — PR posterior se necessário |
| Service role nunca exposta | **CONFIRMADO** |
| **Frente Supabase** | **ENCERRADA** — leitura real provada |

---

## §10 — Limitações remanescentes (não bloqueantes para encerramento)

1. **Write real não testado**: P8 SKIPPED por segurança. Schema de `crm_override_log` existe, mas write real requer decisão explícita de Vasques e PR própria.
2. **`enova_document_files` vazia**: `rows=0` — tabela existe no schema mas sem dados. Normal se nenhum arquivo físico foi carregado.
3. **`override_rows=0`**: `crm_override_log` sem registros no momento da prova. Tabela existe e é acessível.
4. **RLS desativado**: 9 tabelas com RLS off — risco documentado desde PR-T8.7. PR posterior.
5. **Buckets públicos**: `documentos-pre-analise` (141 obj) e `enavia-brain` (112 obj) — risco documentado. PR posterior.
6. **`enova_document_files` sem mapeamento no `SupabaseCrmBackend`**: leitura bruta na prova; mapeamento completo para PR posterior.

---

## §11 — Próximas frentes (pós-encerramento Supabase)

1. Ativar RLS nas 9 tabelas desativadas (`crm_lead_meta`, `crm_override_log`, `crm_stage_history`, `enova_docs`, `enova_document_files`, `enova_incidents`, `enova_telemetry`, `lead_auditoria`, `lead_timeline_events`)
2. Revisar policy dos buckets públicos (`documentos-pre-analise`, `enavia-brain`)
3. Integração Meta/WhatsApp real (frente separada, autorização Vasques)
4. LLM real controlado (frente separada)
5. Atendimento de cliente real (pós-G8)
6. Write append-only em `crm_override_log` se Vasques autorizar
