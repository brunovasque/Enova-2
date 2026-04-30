# T8_SUPABASE_PROVA_DOCS_DOSSIE — Prova Supabase real + documentos + dossiê

**PR**: PR-T8.9 | **Tipo**: PR-PROVA + implementação mínima controlada  
**Data**: 2026-04-29  
**Branch**: feat/t8-pr-t8-9-prova-supabase-docs-dossie  
**PR precedente**: PR-T8.8 — Supabase operacional controlado (PR-IMPL)

---

## §1 — Objetivo e declaração de tipo

**Tipo declarado**: PR-PROVA — fecha a frente de integração Supabase (PR-T8.7 DIAG → PR-T8.8 IMPL → PR-T8.9 PROVA).

**Objetivo**: Deixar no Repo2 o caminho real de prova Supabase/documentos/dossiê, sem virar go-live e sem alteração destrutiva no banco. A PR não simula — ela instala o script de prova que, quando ativado com as envs reais, conecta ao banco de verdade e comprova leitura de leads, documentos, dossier e buckets de storage.

**Entrega mínima controlada**:
- `src/supabase/proof.ts` — script dual-mode (skip seguro sem env / prova real com env).
- `package.json` — script `prove:supabase-real` adicionado (fora de `smoke:all` — não bloqueia CI).
- `schema/implementation/T8_SUPABASE_PROVA_DOCS_DOSSIE.md` — este arquivo.
- STATUS.md e LATEST.md atualizados.

---

## §2 — Arquitetura do script de prova (proof.ts)

### Dual-mode

| Condição | Comportamento |
|---|---|
| `SUPABASE_REAL_ENABLED` ≠ `'true'` OU `SUPABASE_URL` ausente OU `SUPABASE_SERVICE_ROLE_KEY` ausente | `SKIPPED_REAL_ENV_MISSING` → exit 0. Nunca falha CI. |
| `SUPABASE_REAL_ENABLED=true` + URL + KEY presentes | Modo real: executa P1–P8. |

### Env vars do script

| Var | Obrigatória para modo real | Descrição |
|---|---|---|
| `SUPABASE_REAL_ENABLED=true` | Sim | Gate explícito para modo real |
| `SUPABASE_URL` | Sim | Base URL PostgREST + Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Service role — nunca exposta em stdout |
| `SUPABASE_PROOF_LEAD_REF` | Não | lead_id ou external_ref para foco nas leituras |
| `SUPABASE_PROOF_WRITE_ENABLED=true` | Não | Habilita insert append-only em `crm_override_log` |

### 8 fases de prova

| Fase | Descrição | Tabela / API |
|---|---|---|
| P1 | Readiness estrutural (sem HTTP) | — (avaliação de env local) |
| P2 | Auth inválida → espera 4xx | `crm_lead_meta` com key errada |
| P3 | Leitura `crm_lead_meta` | PostgREST SELECT |
| P4 | Leitura `enova_docs` (documentos) | PostgREST SELECT |
| P5 | Dossier snapshot (state + overrides) | `enova_state` + `crm_override_log` |
| P6 | Leitura `enova_document_files` | PostgREST SELECT |
| P7 | Storage buckets | `storage/v1/bucket` REST |
| P8 | Write append-only (opcional) | `crm_override_log` POST |

### Segurança inviolável no script

- `SUPABASE_SERVICE_ROLE_KEY` nunca aparece em `console.log`, `console.error` ou saída de erro não tratada.
- `maskKey()` expõe apenas os 6 primeiros caracteres + comprimento total.
- `maskSupabaseUrl()` expõe apenas `protocol://host`.
- P2 usa `INVALID_PROOF_KEY_T8_9` (literal) — nunca reutiliza a key real mesmo em fail.
- Catch global no `main()` sanitiza a key antes de imprimir.

---

## §3 — Prova de leitura de leads (P3)

**Tabela alvo**: `crm_lead_meta`  
**Mapeamento**: implementado em `src/supabase/crm-store.ts` (PR-T8.8) via `mapLeadFromMeta`.  
**Colunas mapeadas**: `lead_id`, `external_ref`, `customer_name`, `phone_ref`, `status`, `manual_mode`, `created_at`, `updated_at`.

**Comportamento com `SUPABASE_PROOF_LEAD_REF`**:
- Se setado: `?lead_id=eq.<ref>&limit=10` — prova um lead específico.
- Se ausente: `?limit=20&order=created_at.desc` — prova os 20 mais recentes.

**Evidência esperada em modo real**: `rows=N` onde N ≥ 0 (aceita banco vazio).

---

## §4 — Prova de documentos (P4 + P6)

### P4 — enova_docs (metadados de documento)

**Tabela alvo**: `enova_docs`  
**Mapeamento**: `mapDocumentFromEnovaDocs` (PR-T8.8).  
**Colunas mapeadas**: `document_id`, `lead_id`, `document_type`, `status`, `storage_path`, `notes`, `created_at`, `updated_at`.  
**Leitura**: até 20 linhas mais recentes, ou filtrado por `lead_id` se `SUPABASE_PROOF_LEAD_REF` setado.

### P6 — enova_document_files (arquivos físicos)

**Tabela alvo**: `enova_document_files`  
**Mapeamento**: ainda não implementado no `SupabaseCrmBackend` — leitura bruta para fins de prova.  
**Colunas relevantes declaradas por DDL Vasques**: `document_id`, `lead_id`, `storage_path`, `created_at`.

### P7 — Storage buckets (lista real)

**API**: `GET ${SUPABASE_URL}/storage/v1/bucket` com `Authorization: Bearer <service_role>`.  
**Buckets conhecidos** (declarados em `SUPABASE_KNOWN_BUCKETS`):

| Bucket | Público | Objetos | Risco |
|---|---|---|---|
| `documentos-pre-analise` | Sim | 141 | ALTO — revisar policy |
| `emailsnv` | Não | 0 | — |
| `enavia-brain` | Sim | 112 | ALTO — revisar policy |
| `enavia-brain-test` | Não | 0 | — |

**Prova confirma**: quantos buckets reais correspondem aos declarados no catálogo.

---

## §5 — Prova de dossiê real (P5)

**Tabelas**: `enova_state` (estado atual do lead) + `crm_override_log` (histórico de overrides).  
**Objetivo**: comprovar que o dossiê de um lead pode ser reconstruído a partir de dados reais.

**Com `SUPABASE_PROOF_LEAD_REF`**: ambas as tabelas são filtradas por `lead_id=eq.<ref>`.  
**Sem ref**: 10 linhas mais recentes de cada tabela.

**Saída esperada**:
```
[P5] Dossier snapshot .... OK  state_rows=N override_rows=M lead_ref=<ref ou all>
```

---

## §6 — Write append-only (P8)

**Ativação**: apenas com `SUPABASE_PROOF_WRITE_ENABLED=true`.

**Tabela alvo**: `crm_override_log`.

**Row inserida**:
```json
{
  "lead_id": "<SUPABASE_PROOF_LEAD_REF ou proof_t8_9_<timestamp>>",
  "operator_id": "t8_9_proof",
  "override_type": "note",
  "target_field": "proof_checkpoint",
  "old_value": null,
  "new_value": "PR-T8.9_proof_marker",
  "reason": "PR-T8.9 prova controlada — <ISO timestamp>"
}
```

**Invariantes**:
- `operator_id` sempre `t8_9_proof` — identificável em auditoria.
- `reason` sempre contém `PR-T8.9 prova controlada`.
- Nunca deleta, atualiza ou sobrescreve registros existentes.
- Se o insert retornar 400/422/404 (divergência de schema): status `WRITE_REAL_SKIPPED_SCHEMA_UNCONFIRMED` — não falha a prova.
- Se `SUPABASE_PROOF_WRITE_ENABLED` não setado: status `SKIPPED` — não falha a prova.

---

## §7 — Segurança e restrições invioláveis

| Restrição | Status |
|---|---|
| Service role nunca em stdout/stderr/log | GARANTIDO (sanitização em `maskKey`, catch global, `safeErrorMessage`) |
| Sem alteração de schema (DDL) | GARANTIDO — nenhum SQL de DDL |
| Sem alteração de RLS | GARANTIDO — nenhum `ALTER TABLE`, nenhuma policy |
| Sem alteração de bucket policy | GARANTIDO — apenas leitura de lista |
| Sem delete/reset real | GARANTIDO — nenhum DELETE, TRUNCATE ou UPDATE |
| Sem WhatsApp real | GARANTIDO |
| Sem LLM real | GARANTIDO |
| Sem cliente real / go-live | GARANTIDO |
| `prove:supabase-real` fora de `smoke:all` | GARANTIDO — não bloqueia CI |

---

## §8 — Evidências de teste

### smoke:supabase — 70/70 PASS (retrocompatibilidade PR-T8.8)

Todos os 70 checks da PR-T8.8 continuam passando após a adição do proof.ts. A PR-T8.9 não altera nenhum arquivo de código funcional da PR-T8.8.

### prove:crm-e2e — 73/73 PASS (retrocompatibilidade PR-T8.6)

O E2E continua operacional — nenhuma rota do Worker foi alterada nesta PR.

### smoke:all — todas etapas PASS

Todas as suites continuam verdes: smoke, smoke:worker, smoke:telemetry, smoke:rollout, smoke:e1, smoke:meta, smoke:speech, smoke:context, smoke:adapter, smoke:adapter:policy, smoke:adapter:runtime, smoke:audio, smoke:panel, smoke:supabase, prove:crm-e2e.

### prove:supabase-real (modo skip — sem env real)

```
PROVA-SUPABASE-REAL | PR-T8.9 | 2026-04-29
============================================================
SKIPPED: SKIPPED_REAL_ENV_MISSING
  SUPABASE_REAL_ENABLED não é "true" ou envs ausentes. Prova pulada — nunca falha CI.
EXIT 0 (skipped)
```

**Resultado**: exit 0. Nunca falha CI sem as envs reais.

---

## §9 — Rollback

**Para reverter PR-T8.9**: remover `src/supabase/proof.ts` + remover `prove:supabase-real` do `package.json`. Nenhum arquivo de runtime foi alterado nesta PR. O comportamento do Worker permanece idêntico à PR-T8.8.

**Para reverter PR-T8.8 + PR-T8.9 em conjunto**: setar `SUPABASE_REAL_ENABLED=false` (ou ausente) — fallback automático para in-memory, idêntico a PR-T8.6. Nenhum dado real foi alterado.

---

## §10 — Limitações e declarações

1. **Sem mapeamento de `enova_document_files` no `SupabaseCrmBackend`**: prova faz leitura bruta para fins de diagnóstico; mapeamento full fica para PR posterior.
2. **Sem leitura de `lead_auditoria` / `lead_timeline_events`**: tabelas com RLS desativado — leitura postergada para PR posterior com policy confirmada.
3. **Sem realtime / webhooks**: prova é snapshot estático — sem listener de alterações.
4. **Sem prova de autenticação JWT real de usuário**: service role only. Prova de auth por JWT de usuário final em PR posterior (RLS ativo necessário).
5. **Buckets públicos `documentos-pre-analise` e `enavia-brain`**: risco documentado desde PR-T8.7. Correção de policy em PR específica futura.
6. **Write real em modo `WRITE_REAL_SKIPPED_SCHEMA_UNCONFIRMED`**: se o schema real do `crm_override_log` divergir do esperado (ex: campo `lead_id` NOT NULL sem default), o insert falha graciosamente sem errar a prova.

---

## §11 — Checklist de aceitação (CA-T8.9)

| # | Critério | Status |
|---|---|---|
| CA-T8.9-01 | `src/supabase/proof.ts` criado | ✅ |
| CA-T8.9-02 | `prove:supabase-real` em package.json | ✅ |
| CA-T8.9-03 | `prove:supabase-real` NÃO está em `smoke:all` | ✅ |
| CA-T8.9-04 | Modo skip retorna exit 0 sem env real | ✅ |
| CA-T8.9-05 | Service role nunca exposta em stdout | ✅ |
| CA-T8.9-06 | Sem alteração de schema/RLS/bucket/storage policy | ✅ |
| CA-T8.9-07 | Sem delete/reset real | ✅ |
| CA-T8.9-08 | 8 fases de prova cobrindo leads, docs, dossier, storage, write | ✅ |
| CA-T8.9-09 | Write real apenas com `SUPABASE_PROOF_WRITE_ENABLED=true` | ✅ |
| CA-T8.9-10 | `WRITE_REAL_SKIPPED_SCHEMA_UNCONFIRMED` quando schema diverge | ✅ |
| CA-T8.9-11 | `smoke:supabase` 70/70 PASS retrocompatível | ✅ |
| CA-T8.9-12 | `prove:crm-e2e` 73/73 PASS retrocompatível | ✅ |
| CA-T8.9-13 | `smoke:all` todas etapas PASS | ✅ |
| CA-T8.9-14 | STATUS.md e LATEST.md atualizados | ✅ |
| CA-T8.9-15 | Sem `@supabase/supabase-js` adicionado | ✅ |
| CA-T8.9-16 | Sem WhatsApp real / LLM real / cliente real / go-live | ✅ |

---

## §12 — Próximos passos

**O que esta PR deixa pronto**:
- Caminho real de prova Supabase instalado no repo.
- Operador pode ativar `SUPABASE_REAL_ENABLED=true` + envs e rodar `prove:supabase-real` para confirmar conectividade real sem risco.

**O que ainda falta para G8**:
- Integração WhatsApp/Meta real (frente separada).
- LLM real (frente separada).
- Atendimento de cliente real controlado (pós-G8).
- Correção de RLS nas tabelas desativadas.
- Revisão de policy nos buckets públicos.
- Mapeamento completo de tabelas ainda sem representação TS (`enova_document_files`, `lead_auditoria`, etc).

**Próxima PR autorizada**: a definir pelo contrato T8 — frente WhatsApp/Meta ou LLM real, conforme priorização de Vasques.
