# Supabase Runtime Readiness — Diagnóstico operacional

**Tipo:** PR-DIAG / READ-ONLY (anexo)  
**Data:** 2026-05-01  
**Documento principal:** `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md`

> Foco específico: Supabase em PROD `nv-enova-2` está real ou simulado? Onde está a trava silenciosa?

---

## 1. Resposta direta

**Supabase NÃO está ativo em PROD `nv-enova-2`.**

Razões (todas independentes):
1. `wrangler.toml` declara **zero bindings** — linhas 15-16 explicitam.
2. Mesmo se Vasques setou via `wrangler secret put`, a flag `SUPABASE_REAL_ENABLED` provavelmente não está como `'true'`.
3. Mesmo com flag ON e envs corretas, **escrita real (UPDATE/INSERT) NÃO está implementada** — apenas leitura. Toda escrita vai para `writeBuffer` interno (in-memory).
4. Quando flag está OFF, o sistema cai em `CrmInMemoryBackend` **silenciosamente**, sem nenhum log/telemetria sinalizando o fallback.

---

## 2. Mapa das envs Supabase no código

### Envs lidas

| Env | Lida em | Linha | Tipo esperado |
|---|---|---|---|
| `SUPABASE_REAL_ENABLED` | `src/crm/store.ts` | 114 | string `'true'` |
| `SUPABASE_URL` | `src/crm/store.ts` | 115 | URL completa |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/crm/store.ts` | 117 | service role key (segredo) |
| `MEMORY_SUPABASE_ENABLED` | `src/memory/store.ts` | 139 | string `'true'` |
| `SUPABASE_ANON_KEY` | — | — | **nunca lida no runtime principal** (referenciada apenas em `supabase/types.ts` para tipo) |

### Envs sanitizadas em logs

`src/memory/sanitize.ts:24-25` — regex que redige qualquer ocorrência de service role key em logs/memória.

### Envs presentes em `wrangler.toml`

```toml
# wrangler.toml linhas 15-16:
# nenhuma binding, secret, KV, R2, D1, queue ou var foi declarada neste bootstrap
```

**Nada declarado.** Toda env precisa ser setada via `wrangler secret put` ou via dashboard Cloudflare. **Zero documentação estruturada das envs esperadas.**

---

## 3. Caminho de fallback silencioso

### `getCrmBackend(env)` — `src/crm/store.ts:113-130`

```
1. Lê env.SUPABASE_REAL_ENABLED
2. Se !== 'true' → return CrmInMemoryBackend SINGLETON
3. Lê env.SUPABASE_URL e env.SUPABASE_SERVICE_ROLE_KEY
4. Se !url || !key → return CrmInMemoryBackend SINGLETON
5. Dynamic import + instancia SupabaseCrmBackend
```

**Critical:** quando o passo 2 ou 4 cai em fallback, **nenhum log é emitido**. O Worker se comporta normalmente, mas com persistência efêmera.

### Comparação com gate explícito

`src/crm/routes.ts:207-215` tem proteção parcial:
- Se `SUPABASE_REAL_ENABLED=true` MAS envs ausentes → retorna 503 visível.
- Se `SUPABASE_REAL_ENABLED=false` ou ausente → **silencioso**.

---

## 4. Tabelas e buckets esperados

### Tabelas mapeadas em `SupabaseCrmBackend`

| Tabela canônica | Mapped to | Origem |
|---|---|---|
| `crm_lead_meta` | `CrmLead` | leads |
| `enova_state` | `CrmLeadState` (read-only projeção do Core) | Core engine |
| `enova_docs` | `CrmDocument` | dossiê documental |
| `crm_override_log` | `CrmOverrideLog` | auditoria |
| `enova_document_files` | (storage proof) | docs anexos |

### Buckets storage

`src/supabase/types.ts:107-132`:

| Bucket | Visibilidade | Uso esperado |
|---|---|---|
| `documentos-pre-analise` | público | docs leads pré-análise (sensível!) |
| `emailsnv` | privado | emails NV |
| `enavia-brain` | público | brain knowledge (público!) |
| `enavia-brain-test` | privado | brain teste |

**Provados em PR-T8.9B (8/8 PASS):** P3 leitura `crm_lead_meta` rows=6, P4 `enova_docs` rows=20, P5 `enova_state` rows=10, P7 storage 4/4 buckets confirmados.

---

## 5. Escrita real Supabase — estado

### Código atual

`src/supabase/crm-store.ts` implementa **leitura real** apenas. Toda chamada de escrita (`addLead`, `updateLead`, `addOverride`, etc.) vai para um **`writeBuffer` interno em memória**.

**Implicação:** mesmo com `SUPABASE_REAL_ENABLED=true` + envs OK em PROD, **escritas Supabase reais não acontecem**. Apenas leituras.

### O que foi explicitamente declarado em PR-T8.8

> Cliente HTTP minimalista... **escrita 100% in-memory** (writeBuffer interno) — zero escrita real, zero alteração de schema, zero alteração de RLS, zero alteração de bucket.

A frente Supabase foi declarada **encerrada em leitura** (PR-T8.9B), com escrita real explicitamente movida para PR futura.

---

## 6. Riscos operacionais

| Risco | Severidade | Razão |
|---|---|---|
| Stage do lead se perde no restart do Worker | **ALTA** | `enova_state` apenas leitura; pipeline não escreve |
| Lead duplicado entre instâncias paralelas do Worker | **ALTA** | in-memory por instância, sem KV distribuído |
| Memória attendance some no restart | **ALTA** | FIFO 5000 in-memory |
| Override log somido no restart | **MÉDIA** | in-memory; auditoria comprometida |
| Falsa sensação de persistência | **ALTA** | health endpoint pode dizer "OK" sem flag |
| Service role key vazado em log | **BAIXA** | sanitize.ts redige; bem testado |

---

## 7. Verificações operacionais para PROD

Estas verificações **não foram feitas** nesta PR (read-only). Vasques ou próxima PR devem:

```bash
# Confirmar via dashboard Cloudflare → nv-enova-2 → Settings:
# 1. Listar variáveis de ambiente declaradas
# 2. Listar secrets declarados
# 3. Confirmar valor de SUPABASE_REAL_ENABLED (esperado: ausente ou 'false')
# 4. Confirmar presença de SUPABASE_URL (esperado: ausente)
# 5. Confirmar presença de SUPABASE_SERVICE_ROLE_KEY (esperado: ausente)
```

```bash
# Confirmar via comportamento PROD:
curl https://nv-enova-2.brunovasque.workers.dev/crm/health \
  -H "x-crm-admin-key: <key>"
# Esperado: real_supabase=false ou supabase.real=false
# Se aparecer real_supabase=true mas envs ausentes → 503 e contradição
```

---

## 8. Recomendações para PR T9.1 (wrangler binding declarations)

1. Adicionar bloco `[vars]` em `wrangler.toml` declarando NOMES das envs esperadas (sem valores):
   - `SUPABASE_REAL_ENABLED` (placeholder `false`)
   - `LLM_REAL_ENABLED`
   - `CLIENT_REAL_ENABLED`
   - `MEMORY_SUPABASE_ENABLED`
   - etc.
2. Adicionar comentários documentando quais devem ser **secret** vs **var**.
3. Lista explícita: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `OPENAI_API_KEY`, `CRM_ADMIN_KEY` — todos via `wrangler secret put`.

## 9. Recomendações para PR T9.2 (Supabase fallback guard)

1. Em `getCrmBackend(env)`, emitir telemetria explícita quando cai em fallback:
   ```
   diagLog('runtime.guard.in_memory_fallback', {
     module: 'crm',
     reason: 'flag_off' | 'envs_missing',
     prod_marker: true
   });
   ```
2. Em `/crm/health`, expor explicitamente `persistence_mode: 'in_memory' | 'supabase_read_only' | 'supabase_full'`.
3. Em `/__admin__/go-live/health`, adicionar `supabase_runtime_active: boolean`.

---

## 10. Conclusão

**Supabase em PROD = decoração.** A leitura existe e foi provada offline; a escrita não existe. O fallback silencioso é a maior ameaça à integração T9, porque qualquer stage persistido pelo Core será perdido no próximo restart do Worker.

**Recomendação:** Resolver Supabase real (T9.1, T9.2, T9.11) **antes** de fechar a frente LLM↔funil, ou aceitar que stage e memória são efêmeros (decisão de Vasques).
