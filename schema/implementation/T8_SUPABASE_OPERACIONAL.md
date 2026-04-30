# T8_SUPABASE_OPERACIONAL — Supabase operacional controlado (PR-T8.8)

## 1. Meta

- **PR:** PR-T8.8
- **Tipo:** PR-IMPL
- **Fase:** T8 (em execução)
- **Base:** PR-T8.7 — `schema/diagnostics/T8_SUPABASE_DIAGNOSTICO.md`
- **Próxima PR:** PR-T8.9 — Prova Supabase + documentos + dossiê
- **Data:** 2026-04-29
- **Autor:** Claude (Anthropic) — sessão autorizada por Vasques

---

## 2. Objetivo

Implementar integração controlada do Worker/CRM com o Supabase real existente, com:

- adapter HTTP server-side em fetch puro (sem dependência nova);
- feature flag `SUPABASE_REAL_ENABLED` com fallback automático para in-memory;
- guard de envs obrigatórias (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`);
- readiness pública sem segredos;
- escrita real **proibida** nesta PR — fica em buffer in-memory até PR-T8.9 confirmar mapeamento real.

A PR não cria, dropa, renomeia, migra, faz backfill, altera RLS, altera bucket, altera storage policy nem reseta nada no Supabase real.

---

## 3. Evidência real usada (DDL export Vasques)

| Item | Valor |
|---|---|
| Colunas em `public` | 1141 |
| Indexes em `public` | 135 |
| Constraints/FKs | exportadas em versão agregada |

### Buckets reais

| Bucket | Acesso | Objetos | Risco |
|---|---|---|---|
| `documentos-pre-analise` | público | 141 | ALTO — bucket público com 141 docs sensíveis |
| `emailsnv` | privado | 0 | OK |
| `enavia-brain` | público | 112 | ALTO — bucket público com 112 objetos |
| `enavia-brain-test` | privado | 0 | OK |

### Tabelas com dados reais

| Tabela | Linhas |
|---|---|
| `enova_log` | 50180 |
| `enova_state` | 20 |
| `enova_docs` | 60 |
| `crm_lead_meta` | 6 |
| `enova_attendance_meta` | 6 |
| `enova_prefill_meta` | 4 |
| `crm_stage_history` | 1 |
| `enova_incidents` | 1 |
| `orchestrator_executions` | 10 |
| `orchestrator_workflows` | 7 |

### Tabelas com RLS desativado

`crm_lead_meta`, `crm_override_log`, `crm_stage_history`, `enova_docs`, `enova_document_files`, `enova_incidents`, `enova_telemetry`, `lead_auditoria`, `lead_timeline_events`.

Estas geram **warning** de readiness — nunca bloqueio. Correção fica para PR específica posterior conforme contrato.

---

## 4. Arquitetura implementada

### 4.1 Módulos novos

| Arquivo | Papel |
|---|---|
| `src/supabase/types.ts` | Tipos canônicos do módulo: `SupabaseConfig`, `SupabaseReadiness`, catálogos `SUPABASE_KNOWN_TABLES`, `SUPABASE_RLS_DISABLED_TABLES`, `SUPABASE_KNOWN_BUCKETS`. Linhas brutas (`CrmLeadMetaRow`, `EnovaStateRow`, `EnovaDocsRow`, `CrmOverrideLogRow`). |
| `src/supabase/readiness.ts` | `getSupabaseReadiness(env)`, `getSupabaseConfig(env)`, `getSupabaseReadinessPublic(env)`, `maskSupabaseUrl(raw)`. |
| `src/supabase/client.ts` | HTTP client minimalista para PostgREST: `supabaseSelect<T>` e `supabaseInsert<T>`. fetch puro, sem SDK. Sanitiza erros para nunca vazar `serviceRoleKey`. |
| `src/supabase/crm-store.ts` | `SupabaseCrmBackend` implementando `CrmBackend`. Leitura real para `crm_leads`, `crm_lead_state`, `crm_documents`, `crm_override_log`. Escrita 100% in-memory (writeBuffer interno). |
| `src/supabase/smoke.ts` | Smoke test 70 checks em 16 categorias — sem tocar Supabase real. |

### 4.2 Módulos alterados

| Arquivo | Alteração |
|---|---|
| `src/crm/store.ts` | Adicionada factory `getCrmBackend(env)`. Singleton `crmBackend` mantido por compatibilidade. |
| `src/crm/routes.ts` | Substituído import direto de `crmBackend` por chamada `await getCrmBackend(env)` por request. Adicionado `supabaseReadiness` e `supabaseReadinessPublic` no início. Health expõe `mode`, `real_supabase`, `supabase_readiness`. Falha rápida 503 quando flag ON sem envs. Rotas `bases/status` e `enova-ia/status|runtime` recebem readiness. |
| `src/crm/panel.ts` | `listBasesStatus(readiness?)`, `getEnovaIaStatus(readiness?)`, `getEnovaIaRuntime(readiness?)` aceitam readiness opcional para refletir modo real quando ativo. Sem readiness, mantêm comportamento PR-T8.6. |
| `package.json` | `smoke:supabase` adicionado e incluído em `smoke:all`. Sem nova dependência. Sem alteração de lockfile (não há lockfile no repo). |

### 4.3 Diagrama de dependências

```
                  request /crm/*
                        |
                        v
               handleCrmRequest(env)
                        |
                        v
            getSupabaseReadiness(env) ── 503 se flag ON sem envs
                        |
                        v
            getCrmBackend(env)
              /                  \
             /                    \
   in-memory                  SupabaseCrmBackend
   (CrmInMemoryBackend)       (cfg)
                                  |
                            supabaseSelect ──> Supabase HTTP (fetch + service role)
                                  |
                            writeBuffer ──> CrmInMemoryBackend interno (escritas)
```

---

## 5. Feature flag

### `SUPABASE_REAL_ENABLED`

| Valor | Comportamento |
|---|---|
| ausente | Modo in-memory. Idêntico a PR-T8.6. |
| `"true"` + envs presentes | Modo Supabase real (leitura controlada). |
| `"true"` sem envs | Readiness fail. `/crm/*` retorna 503 (exceto `/crm/health` que devolve 200 com diagnóstico). |
| qualquer outro valor (`"1"`, `"false"`, `"yes"`) | Tratado como ausente. |

### `SUPABASE_URL`

URL do projeto Supabase. Em logs/response sempre exposta apenas como `protocol://host` via `maskSupabaseUrl`.

### `SUPABASE_SERVICE_ROLE_KEY`

**Server-side only.** Nunca aparece em log, response, error, frontend ou painel. O cliente HTTP sanitiza qualquer erro removendo a string da mensagem antes de retornar.

### Como provisionar (operador)

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# SUPABASE_REAL_ENABLED é vars (não secret)
wrangler vars set SUPABASE_REAL_ENABLED=true   # ou via wrangler.toml [vars]
```

`wrangler.toml` não foi alterado nesta PR. O operador deve provisionar antes de ligar a flag.

---

## 6. Modo in-memory (fallback seguro)

Quando flag desligada ou envs ausentes:

- Todos os endpoints CRM operam exatamente como PR-T8.6.
- Nenhuma chamada HTTP é feita ao Supabase.
- `prove:crm-e2e` continua passando 73/73.
- `/crm/health` retorna `mode: "in_process_backend"`, `real_supabase: false`.
- Override, manual-mode, reset funcionam in-memory com auditoria preservada.

Este é o **modo padrão** em todos os ambientes até decisão consciente de ligar a flag.

---

## 7. Modo Supabase real (leitura controlada)

Quando `SUPABASE_REAL_ENABLED=true` e envs presentes:

### O que funciona

- `/crm/health` retorna `mode: "supabase_real"`, `real_supabase: true`, com `supabase_readiness` completa e warnings.
- `/crm/leads` lê `crm_lead_meta` (até 100 linhas, ordenado por `created_at desc`) e mapeia para `CrmLead`.
- `/crm/leads/:id` busca em `crm_lead_meta` + writeBuffer interno.
- `/crm/leads/:id/case-file` consolida lead, fatos, documentos (de `enova_docs`), overrides (de `crm_override_log`), policy events, manual-mode log.
- `/crm/dashboard/metrics` reflete contagens reais para leads, lead_state, documentos e overrides; tabelas sem mapeamento confirmado retornam zero.
- `/crm/bases/status` expõe catálogo de tabelas e buckets conhecidos + lista de RLS desativadas (warning).
- `/crm/enova-ia/status` e `/crm/enova-ia/runtime` refletem `supabase_real: true`.

### O que NÃO funciona (intencional)

- Escrita real em qualquer tabela.
- Reset real (proibido nesta PR).
- Override/manual-mode persistidos no Supabase real (ficam em writeBuffer).
- Storage real (sem upload, sem delete, sem mudança de policy).
- Edge Functions, Realtime, Auth — fora de escopo.

### Limites de carga

- Limite default por SELECT: **100 linhas**.
- Limite máximo por SELECT: **500 linhas**.
- Sem retry agressivo. Sem cache silencioso.
- Tabelas grandes (`enova_log` com 50180 linhas) são protegidas: nenhum endpoint atualmente lê `enova_log`. Se precisar, use ORDER BY + filtros.

---

## 8. Leituras implementadas

| Endpoint | Tabela real | Mapeamento |
|---|---|---|
| `GET /crm/leads` | `crm_lead_meta` | `lead_id`, `external_ref`, `customer_name`, `phone_ref`, `status`, `manual_mode`, `created_at`, `updated_at` |
| `GET /crm/leads/:id` | `crm_lead_meta` (filtrado) | idem |
| `GET /crm/leads/:id/case-file` | merge de `crm_lead_meta` + `enova_state` + `enova_docs` + `crm_override_log` | mapeamento completo via `SupabaseCrmBackend.findOne/findMany` |
| `GET /crm/leads/:id/dossier` | (sem mapeamento real) | retorna writeBuffer ou null |
| `GET /crm/leads/:id/policy-events` | (sem mapeamento real) | retorna writeBuffer (vazio em real) |
| `GET /crm/leads/:id/timeline` | derivado de turns no writeBuffer | empty real |
| `GET /crm/leads/:id/artifacts` | `enova_docs` filtrado por `lead_id` | mapeamento básico |
| `GET /crm/conversations` | empty real (turns sem mapeamento) + writeBuffer | exibe leads reais com turn_count=0 |
| `GET /crm/dashboard` / `metrics` | agregação sobre dados reais lidos | contagens reais para leads/lead_state/docs/overrides |
| `GET /crm/incidents` | `crm_override_log` (real) + writeBuffer | mapeamento básico |
| `GET /crm/incidents/summary` | agregação | refletindo contagens reais |
| `GET /crm/bases` / `bases/status` | metadados estáticos + catálogo Supabase | exposição de RLS-disabled tables e buckets |
| `GET /crm/enova-ia/status` / `runtime` | declarativo + readiness | `supabase_real` espelha flag |

---

## 9. Escritas implementadas

**Nenhuma escrita real foi implementada nesta PR.**

Todas as operações de escrita (`insert`, `update`) do `SupabaseCrmBackend` redirecionam para um `writeBuffer` interno (`CrmInMemoryBackend`).

### Razões para a decisão

1. Schema real (`crm_lead_meta`, `enova_state`, `enova_docs`, `crm_override_log`) tem nomenclatura e colunas diferentes do schema canônico CRM (`crm_leads`, `crm_lead_state`, `crm_documents`, `crm_override_log`). O DDL completo não foi mapeado por coluna ainda — escrita cega seria insegura.
2. Várias tabelas alvo têm RLS desativado. Escrita server-side com service role funciona, mas sem validação de policy é amplificador de risco.
3. Tabelas têm dados legados/produtivos (`enova_log` 50k linhas; `enova_state` com estado real). Append acidental polui histórico.
4. Reset/override são operações sensíveis — proibidas nesta PR conforme regra soberana.

### Plano para PR-T8.9 (PR-PROVA)

PR-T8.9 vai:

- mapear coluna-a-coluna de `crm_lead_meta`, `enova_state`, `enova_docs`, `crm_override_log` ao schema CRM canônico;
- habilitar **escrita append-only** em `crm_override_log` (auditoria — único caso seguro);
- provar persistência ponta a ponta com lead de teste em ambiente controlado;
- criar `schema/proofs/T8_SUPABASE_PROVA_OPERACIONAL.md`.

---

## 10. Limitações declaradas

- **Sem migration.** Nenhum arquivo `.sql` criado/alterado.
- **Sem RLS change.** Nenhuma policy criada/alterada/removida.
- **Sem storage change.** Nenhum bucket criado/alterado. Buckets `documentos-pre-analise` e `enavia-brain` permanecem públicos — risco declarado, correção em PR específica.
- **Sem reset real.** Reset opera apenas no writeBuffer no modo Supabase real.
- **Sem WhatsApp real.** PR-T8.11/T8.12.
- **Sem LLM real.** PR-T8.9.
- **Sem cliente real.** PR-T8.R.
- **Sem alteração de workflow/deploy.** `.github/workflows/deploy.yml` intocado.
- **Sem alteração de wrangler.toml.** Provisionamento de envs é responsabilidade do operador.
- **Sem nova dependência.** `package.json` apenas ganhou script `smoke:supabase`. `@supabase/supabase-js` **não foi adicionado** — usamos fetch puro para reduzir superfície e dependência. Pode ser adicionado em PR posterior se Storage SDK ou Realtime forem necessários.
- **Sem escrita real.** Todas as escritas vão para writeBuffer in-memory.
- **Tabelas sem mapeamento confirmado** (`crm_turns`, `crm_facts`, `crm_dossier`, `crm_policy_events`, `crm_manual_mode_log`) retornam apenas writeBuffer.

---

## 11. Segurança

### Service role

- Usada **apenas** server-side, dentro do Worker, no `Authorization: Bearer ...` e `apikey` do PostgREST.
- **Nunca** é gravada em log, response, error, header de resposta, exception, console.
- O cliente HTTP (`safeErrorMessage`) faz busca/replace defensivo de qualquer ocorrência da chave em mensagens de erro.
- Padrões `Bearer XXX` ou `apikey YYY` em mensagens de erro são parcialmente truncados como guard adicional.

### Painel

- O painel `/panel` **não acessa** Supabase direto.
- O painel chama o Worker via `X-CRM-Admin-Key` (admin key armazenada em `localStorage`).
- O Worker é o único ponto que vê service role.

### URL

- `SUPABASE_URL` é exposta apenas como `protocol://host` (host masked) em `/crm/health.supabase_readiness.url_masked`.
- Nunca expor URL completa com path/query — proteção contra leaks acidentais.

### RLS warnings

- Readiness inclui `rls_disabled_tables` para visibilidade operacional.
- Readiness inclui warning quando há buckets públicos com objetos.
- Warnings são informativos — não bloqueiam.

### Falha rápida e segura

- Flag ON sem envs → 503 com `supabase_readiness` no body. Nunca degradação silenciosa.
- Erro de rede ao Supabase real → o backend retorna lista vazia da tabela específica + writeBuffer. Sem amplificação. Sem retry.

---

## 12. Testes

### Smoke novo: `npm run smoke:supabase`

**Resultado:** `70/70 checks passed; 0 failed.`

Cobre 16 categorias:
1. C1 — readiness flag OFF (6 checks)
2. C2 — readiness flag ON sem envs (5 checks)
3. C3 — readiness flag ON com envs (6 checks)
4. C4 — `maskSupabaseUrl` (4 checks)
5. C5 — `getSupabaseConfig` (3 checks)
6. C6 — `getCrmBackend` factory (3 checks)
7. C7 — `SupabaseCrmBackend.insert` redireciona para writeBuffer (2 checks)
8. C8 — findAll de tabelas sem mapeamento (3 checks)
9. C9 — Worker `/crm/health` em modo in-memory (8 checks)
10. C10 — Worker `/crm/health` flag ON+envs com **garantia de não-vazamento de service role** (7 checks)
11. C11 — Worker `/crm/leads` flag ON sem envs → 503 (4 checks)
12. C12 — Auth ainda barra requests sem chave (1 check)
13. C13 — `/crm/bases/status` reflete catálogo real (6 checks)
14. C14 — `/crm/enova-ia/status` reflete `supabase_real:true` (3 checks)
15. C15 — Sem flag = comportamento PR-T8.6 idêntico (3 checks)
16. C16 — Readiness público com formato esperado (6 checks)

### Smoke incluído em `npm run smoke:all`

`smoke:supabase` foi adicionado ao chain `smoke:all` antes de `prove:crm-e2e`.

### Verificação de retrocompatibilidade

`npm run prove:crm-e2e` (PR-T8.6) continua passando **73/73 checks PASS** sem alteração — modo in-memory permanece idêntico.

### Smoke não toca Supabase real

`smoke:supabase` usa `https://fake-project.supabase.co` e `fake-service-role-key-...`. Nenhuma chamada HTTP é feita a um Supabase real durante CI/local — tabelas reais não recebem requests dos testes. As tentativas de fetch a um host inexistente retornam erro de rede que é capturado pelo cliente e o backend retorna lista vazia + writeBuffer (validado em C7).

---

## 13. Próxima PR

**PR-T8.9 — Prova Supabase + documentos + dossiê** (PR-PROVA).

Bloqueia se persistência falhar.

Pré-requisitos para PR-T8.9 sair:
1. Mapeamento coluna-a-coluna de `crm_lead_meta`, `enova_state`, `enova_docs` confirmado.
2. Lead de teste pronto em ambiente controlado.
3. Append-only em `crm_override_log` validado.
4. Bucket de teste para documento controlado.

---

## 14. Plano de rollback

### Rollback imediato (sem deploy)

Setar `SUPABASE_REAL_ENABLED` para qualquer valor diferente de `"true"` (ou removê-la):

```bash
wrangler vars set SUPABASE_REAL_ENABLED=false
```

Resultado:
- `getCrmBackend()` retorna `crmBackend` (in-memory).
- `/crm/health` volta a `mode: "in_process_backend"`, `real_supabase: false`.
- Comportamento idêntico a PR-T8.6.

### Rollback total (revert da PR)

`git revert <commit-da-PR-T8.8>` — não há migration para reverter, não há schema alterado, não há dado real escrito.

### Sem dados reais alterados

Nenhuma escrita real foi feita pelo Worker em modo Supabase real durante esta PR. Não há limpeza necessária no banco. As 50180 linhas de `enova_log`, 20 linhas de `enova_state`, 60 linhas de `enova_docs` e demais tabelas com dados permanecem **idênticas** ao estado pré-PR-T8.8.

---

## 15. Confirmações invioláveis

- ✅ Sem `reply_text` em qualquer endpoint.
- ✅ Sem decisão de stage em qualquer endpoint.
- ✅ Sem WhatsApp real.
- ✅ Sem LLM real.
- ✅ Sem cliente real.
- ✅ Sem migration destrutiva.
- ✅ Sem alteração de RLS.
- ✅ Sem alteração de bucket / storage policy.
- ✅ Sem alteração de workflow/deploy.
- ✅ Sem exposição de service role.
- ✅ Sem uso de anon key no painel.
- ✅ Sem reset real de dados persistidos.
- ✅ Painel não acessa Supabase direto.
- ✅ `prove:crm-e2e` 73/73 PASS sem alteração.
- ✅ `smoke:supabase` 70/70 PASS.

Adendo de soberania da IA lido (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`): sim
Adendo soberania LLM MCMV lido (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`): sim
Adendo fechamento por prova lido (`schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`): sim
