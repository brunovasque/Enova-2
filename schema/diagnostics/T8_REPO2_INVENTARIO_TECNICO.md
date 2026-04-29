# T8_REPO2_INVENTARIO_TECNICO — Inventário Técnico Real do Repo2

## §1 Meta

| Campo | Valor |
|-------|-------|
| PR | PR-T8.1 |
| Tipo | PR-DIAG |
| Fase | T8 |
| Data | 2026-04-29 |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` |
| Gate | G8 — em aberto |
| Próxima PR | PR-T8.2 — Matriz contrato T1–T7 × código real |
| Restrições herdadas G7 | RA-G7-01 (telemetria), RA-G7-02 (smoke), RA-G7-05 (flags), RA-G7-08 (WhatsApp) |

---

## §2 Objetivo

Mapear tecnicamente o estado real do Repo2 — o que existe, o que está funcional, o que está implementado apenas em modo técnico local, o que está ausente e o que conflita com o contrato T1–T7.

Este é um diagnóstico **sem alteração de código**. Nenhuma implementação foi feita nesta PR.

---

## §3 Inventário da estrutura do repo

### 3.1 Árvore de pastas raiz

```
Enova-2/
├── .github/
│   ├── AGENT_CONTRACT.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── deploy.yml          ← pipeline CI/CD ativo
├── .gitignore
├── CLAUDE.md                   ← governança Claude Code
├── README.md
├── docs/
│   └── BOOTSTRAP_CLOUDFLARE.md
├── package.json
├── package-lock.json
├── schema/                     ← governança macro (contratos, handoffs, status, diagnósticos)
│   ├── contracts/
│   ├── diagnostics/            ← CRIADO nesta PR
│   ├── execution/
│   ├── handoffs/
│   ├── implantation/
│   ├── source/
│   ├── status/
│   └── [demais subpastas]
├── scripts/
│   ├── autofix_pr_governance.js
│   └── validate_pr_governance.js
├── src/                        ← runtime técnico do Worker
│   ├── adapter/
│   ├── audio/
│   ├── context/
│   ├── core/
│   ├── e1/
│   ├── meta/
│   ├── rollout/
│   ├── speech/
│   ├── telemetry/
│   ├── worker-route-smoke.ts
│   └── worker.ts               ← entrypoint Cloudflare Worker
└── wrangler.toml               ← configuração Cloudflare Workers
```

### 3.2 Arquivos de governança (schema/)

| Subpasta | Conteúdo | Status |
|----------|----------|--------|
| `schema/contracts/active/` | Contratos T0–T8 ativos; T8 Rev2 | Existe |
| `schema/contracts/archive/` | Contratos encerrados T0–T7 | Existe |
| `schema/execution/` | Bíblia Canônica de PRs, templates | Existe |
| `schema/handoffs/` | Handoffs de todas as PRs | Existe |
| `schema/status/` | Status macro atual | Existe |
| `schema/implantation/` | Artefatos T0–T7 (inventários, readiness, etc.) | Existe |
| `schema/source/` | LEGADO_MESTRE_ENOVA1_ENOVA2.md | Existe |
| `schema/diagnostics/` | Diagnósticos T8 | **CRIADO nesta PR** |

Total de arquivos markdown em schema/: ~120 (governança documental completa T0–T8).

### 3.3 Runtime técnico (src/)

| Módulo | Arquivos | Função |
|--------|----------|--------|
| `src/worker.ts` | 1 arquivo | Entrypoint Cloudflare Worker — 3 rotas ativas |
| `src/worker-route-smoke.ts` | 1 arquivo | Smoke test de rota do Worker |
| `src/core/` | 15 arquivos | Core Mecânico 2 — motor de decisão estrutural |
| `src/adapter/` | 8 arquivos | Supabase Adapter (in-memory — sem Supabase real) |
| `src/audio/` | 5 arquivos | Pipeline de áudio (STT stub — sem STT real) |
| `src/context/` | 4 arquivos | Memória viva, multi-signal, schema |
| `src/e1/` | 7 arquivos | Módulo E1 — base normativa, comercial, memória local |
| `src/meta/` | 4 arquivos | Ingest Meta/WhatsApp (técnico local — sem Meta real) |
| `src/rollout/` | 4 arquivos | Rollout guard (bloqueado em technical_local_only) |
| `src/speech/` | 7 arquivos | Speech engine / surface LLM-first (sem LLM real) |
| `src/telemetry/` | 3 arquivos | Telemetria (buffer in-process — sem emissão externa) |

**Total src/:** 59 arquivos TypeScript.

---

## §4 Worker / Backend

### 4.1 Entrypoint

Arquivo: `src/worker.ts`
Plataforma: Cloudflare Workers
Tecnologia: TypeScript + Wrangler 3.114.17

### 4.2 Rotas existentes

| Rota | Método | Handler | Status |
|------|--------|---------|--------|
| `GET /` | GET | `handleRoot` | Implementado — retorna health JSON |
| `POST /__core__/run` | POST | `handleCoreRun` | Implementado — executa core engine |
| `POST /__meta__/ingest` | POST | `handleMetaIngest` | Implementado — aceita envelope Meta (técnico local) |

### 4.3 Rotas ausentes (lacunas vs. contrato T8)

| Rota | Contrato | Status |
|------|----------|--------|
| Webhook Meta/WhatsApp challenge (GET `/__meta__/webhook`) | T6.7 / T8 §5.4 | **AUSENTE** |
| Admin endpoints (health, smoke, flags) | T8 §PR-T8.15 | **AUSENTE** |
| CRM endpoints (leads, conversas, documentos, dossiê) | T8 §PR-T8.4 | **AUSENTE** |
| Outbound WhatsApp | T6.7 / T8 §5.4 | **AUSENTE** |

### 4.4 Integração com módulos

| Módulo importado | Status |
|-----------------|--------|
| `src/core/engine.ts` — `runCoreEngine` | Funcional |
| `src/meta/ingest.ts` — `handleMetaIngest` | Funcional (modo técnico local) |
| `src/rollout/controller.ts` — `applyRolloutGuard` | Funcional (sempre `promotion_block: true`) |
| `src/e1/memory.ts` — `applyE1CoreHook` | Funcional (memória in-process) |
| `src/telemetry/emit.ts` — múltiplas funções | Funcional (buffer in-process apenas) |

### 4.5 Bindings Wrangler (wrangler.toml)

```toml
name = "nv-enova-2"
main = "src/worker.ts"
compatibility_date = "2026-04-20"

[env.test]
name = "nv-enova-2-test"
```

**Bindings declarados:** nenhum (sem KV, R2, D1, Queue, Service Bindings, Secrets declarados no toml).
Secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` existem no GitHub Actions para deploy.

### 4.6 Integração com LLM

**Status: AUSENTE.** Nenhum endpoint LLM real está integrado ao Worker. O módulo `src/speech/` define o contrato cognitivo (LLM-first, surface única) mas não contém chamada HTTP a nenhuma API de LLM (Anthropic, OpenAI, etc.). O campo `speech_intent` é apenas um sinal estrutural retornado pelo core.

### 4.7 Riscos Worker/Backend

| ID | Achado | Severidade |
|----|--------|------------|
| RK-W-01 | Pipeline CI/CD (`deploy.yml`) faz **deploy automático em produção** em qualquer push/merge em `main` — sem gate de aprovação humana | CRÍTICO |
| RK-W-02 | Nenhuma binding Supabase real declarada no `wrangler.toml` | ALTO |
| RK-W-03 | Feature flags `ENOVA2_ENABLED`, `CHANNEL_ENABLED` e `ROLLBACK_FLAG` não implementadas | ALTO |
| RK-W-04 | Endpoint de webhook Meta/WhatsApp challenge ausente | ALTO |
| RK-W-05 | Integração LLM real ausente — Worker não conecta a nenhuma API de IA | ALTO |
| RK-W-06 | Sem endpoint admin/smoke/health separado do `GET /` | MÉDIO |

---

## §5 Frontend / Painel

### 5.1 Status

**Frontend: AUSENTE no Repo2.**

Nenhum arquivo `.tsx`, `.jsx`, `.html`, `.css` ou pasta de framework frontend (Next.js, React, Vue, Svelte) foi encontrado no Repo2.

### 5.2 Achados

| Item | Status |
|------|--------|
| Páginas web | **AUSENTE** |
| Componentes React/Vue/Svelte | **AUSENTE** |
| CRM frontend | **AUSENTE** |
| Painel de leads | **AUSENTE** |
| Painel de documentos/dossiê | **AUSENTE** |
| Autenticação frontend | **AUSENTE** |
| API consumida por frontend | **AUSENTE** |

### 5.3 Implicação

Todo o CRM do Repo2 deve ser migrado do Repo1 (conforme T8 §5.2 e PR-T8.3 / PR-T8.4 / PR-T8.5). Não há nada de frontend a aproveitar no Repo2 hoje.

---

## §6 Supabase

### 6.1 Status

**Supabase real: NÃO CONECTADO.**

O módulo `src/adapter/` implementa um Supabase Adapter completo via `SupabaseAdapterRuntime`, mas utiliza `InMemoryPersistenceBackend` — armazenamento in-process (Maps em memória), não o Supabase real.

### 6.2 Tabelas cobertas pelo adapter (in-memory)

| Tabela | Operações cobertas | Backend |
|--------|-------------------|---------|
| `enova2_lead` | upsertLead, updateLead, getLead | In-memory |
| `enova2_lead_state_v2` | writeLeadState, getCurrentLeadState | In-memory |
| `enova2_turn_events_v2` | writeTurnEvent, getTurnEvents, getTurnEvent | In-memory |
| `enova2_signal_records_v2` | writeSignals, updateSignalStatus, getSignalsByLead, getSignalsByTurn | In-memory |
| `enova2_memory_runtime_v2` | upsertMemoryRuntime, getActiveMemory (com TTL) | In-memory |
| `enova2_document_records_v2` | upsertDocument, updateDocumentStatus, getDocumentsByLead | In-memory |
| `enova2_dossier_v2` | upsertDossier, getDossier | In-memory |
| `enova2_visit_schedule_v2` | writeVisitSchedule, updateVisitStatus, getVisitSchedulesByLead | In-memory |
| `enova2_operational_history_v2` | appendHistoryEvent, getHistoryByLead | In-memory |
| `enova2_projection_bridge_v2` | upsertProjection (com pre_write_validation), getProjection | In-memory |

### 6.3 O que está ausente para Supabase real

| Item | Status |
|------|--------|
| `@supabase/supabase-js` instalado | **AUSENTE** — não está em `package.json` |
| Migrations SQL reais | **AUSENTE** — nenhum arquivo `.sql` no repo |
| Binding Supabase no `wrangler.toml` | **AUSENTE** |
| Variáveis de ambiente Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) | **AUSENTE** |
| RLS/policies declaradas | **AUSENTE** |
| Buckets de storage | **AUSENTE** |
| Backend real (`@supabase/supabase-js` plugado ao PersistenceBackend) | **AUSENTE** |

### 6.4 Ponto positivo

A arquitetura do `PersistenceBackend` é uma abstração limpa — plugar `@supabase/supabase-js` real requer apenas uma nova implementação de `PersistenceBackend` sem refatorar a camada de negócio.

### 6.5 Riscos Supabase

| ID | Achado | Severidade |
|----|--------|------------|
| RK-S-01 | Nenhum dado é persistido além do processo — reinício do Worker apaga tudo | CRÍTICO |
| RK-S-02 | Migrations SQL não existem — schema real do Supabase desconhecido | CRÍTICO |
| RK-S-03 | `@supabase/supabase-js` não instalado nem declarado | ALTO |
| RK-S-04 | Buckets de storage não declarados — documentos não têm destino real | ALTO |
| RK-S-05 | RLS/policies ausentes — sem controle de acesso a dados reais | ALTO |

---

## §7 Meta / WhatsApp

### 7.1 Status

**Meta/WhatsApp: PARCIALMENTE IMPLEMENTADO — modo técnico local apenas.**

O módulo `src/meta/` implementa:
- Ingest de mensagens inbound via `POST /__meta__/ingest`
- Validação de envelope `MetaInboundEnvelope` (versão `front6.v1`)
- Tipos de evento: `inbound.message.text`, `inbound.message.audio_stub`, `inbound.message.media_stub`, `inbound.delivery.status`, `inbound.system.ping`
- Integração com E1 memory hook (`applyE1ChannelHook`)
- Emissão de telemetria (buffer in-process)

### 7.2 O que existe

| Item | Status |
|------|--------|
| Rota POST `/__meta__/ingest` | Existe — modo técnico local |
| Validação de envelope | Existe |
| Tipos de evento inbound | 5 tipos definidos |
| Integração E1 hook | Existe |
| Telemetria de inbound | Existe (buffer in-process) |

### 7.3 O que está ausente (vs. contrato T6.7 / T8 §5.4)

| Item | Status |
|------|--------|
| Webhook GET challenge (`hub.verify_token`) | **AUSENTE** |
| Verificação de assinatura X-Hub-Signature-256 | **AUSENTE** — validação de assinatura não implementada |
| Outbound (envio de mensagem ao lead) | **AUSENTE** |
| Mídia real (inbound de imagem/áudio/sticker/documento) | **AUSENTE** |
| Dedupe/idempotência real | **PARCIAL** — campo `idempotency_key` validado, sem store real |
| Retry com backoff | **AUSENTE** |
| Rate limit | **AUSENTE** |
| Templates WhatsApp | **AUSENTE** |
| `WHATSAPP_TOKEN` / `VERIFY_TOKEN` envs | **AUSENTE** |
| Integração real com Graph API Meta | **AUSENTE** (`real_meta_integration: false`) |
| Dispatch real de respostas ao WhatsApp | **AUSENTE** (`external_dispatch: false`) |

### 7.4 Riscos Meta/WhatsApp

| ID | Achado | Severidade |
|----|--------|------------|
| RK-M-01 | Sem webhook challenge — Meta não consegue verificar o endpoint | CRÍTICO |
| RK-M-02 | Sem verificação de assinatura — qualquer request POST é aceito | CRÍTICO |
| RK-M-03 | Sem outbound — Worker não consegue responder ao lead no WhatsApp | CRÍTICO |
| RK-M-04 | Envs `WHATSAPP_TOKEN` e `VERIFY_TOKEN` ausentes | ALTO |
| RK-M-05 | Sem integração real com Graph API Meta | ALTO |

---

## §8 CRM Repo2

### 8.1 Status

**CRM no Repo2: TOTALMENTE AUSENTE.**

Nenhum componente de CRM existe no Repo2:
- Sem páginas de listagem de leads.
- Sem painel de detalhe de lead.
- Sem visualização de conversas.
- Sem painel de documentos/dossiê.
- Sem gestão de status/fase.
- Sem autenticação de painel.

### 8.2 O que existe de relação com CRM

| Item | Onde | Status |
|------|------|--------|
| Estrutura de lead (`enova2_lead`) | `src/adapter/runtime.ts` | In-memory apenas |
| Operações de lead (upsert, update, get) | `src/adapter/runtime.ts` | In-memory apenas |
| `isTechnicalCrmLeadKnown`, `registerTechnicalCrmLeadRef` | `src/e1/store.ts` | Técnico local |
| `crm_write_enabled: false` | `src/e1/memory.ts` | Explicitamente bloqueado |
| `external_dispatch_enabled: false` | `src/e1/memory.ts` | Explicitamente bloqueado |

### 8.3 Implicação

O CRM completo (backend + frontend) deve ser migrado integralmente do Repo1 conforme T8 §5.2 (PR-T8.3 → PR-T8.4 → PR-T8.5 → PR-T8.6).

---

## §9 Testes Existentes

### 9.1 Scripts de smoke

| Comando npm | Arquivo | O que testa |
|-------------|---------|-------------|
| `npm run smoke` | `src/core/smoke.ts` | Core engine (stages, gates, parsers) |
| `npm run smoke:worker` | `src/worker-route-smoke.ts` | Rotas do Worker (GET /, POST /__core__/run) |
| `npm run smoke:telemetry` | `src/telemetry/smoke.ts` | Buffer de telemetria |
| `npm run smoke:rollout` | `src/rollout/smoke.ts` | Rollout guard |
| `npm run smoke:e1` | `src/e1/smoke.ts` | Módulo E1 |
| `npm run smoke:meta` | `src/meta/smoke.ts` | Ingest Meta (técnico local) |
| `npm run smoke:speech` | `src/speech/smoke.ts` | Speech engine / surface |
| `npm run smoke:context` | `src/context/smoke.ts` | Living memory, multi-signal |
| `npm run smoke:adapter` | `src/adapter/smoke.ts` | Adapter básico |
| `npm run smoke:adapter:policy` | `src/adapter/policy-smoke.ts` | Policy de consistência do Adapter |
| `npm run smoke:adapter:runtime` | `src/adapter/runtime-smoke.ts` | Runtime in-memory do Adapter |
| `npm run smoke:audio` | `src/audio/smoke.ts` | Pipeline de áudio (stub) |
| `npm run smoke:all` | — | Todos os smokes acima em sequência |

### 9.2 Limitações dos testes existentes

| Item | Situação |
|------|----------|
| Testes unitários formais (Jest, Vitest) | **AUSENTES** — `"test": "echo Error: no test specified"` |
| Testes de integração real | **AUSENTES** |
| Testes e2e | **AUSENTES** |
| Smoke tests com Supabase real | **AUSENTES** — tudo in-process |
| Smoke tests com Meta/WhatsApp real | **AUSENTES** — modo técnico local |
| Smoke tests de CRM | **AUSENTES** — CRM inexistente |

### 9.3 Governança de PR

| Item | Situação |
|------|----------|
| `scripts/validate_pr_governance.js` | Existe — valida campos obrigatórios no body da PR |
| `scripts/autofix_pr_governance.js` | Existe — corrige campos automaticamente |
| `.github/PULL_REQUEST_TEMPLATE.md` | Existe — template de body de PR |
| `.github/AGENT_CONTRACT.md` | Existe — contrato do agente CI |

---

## §10 Riscos e Lacunas Consolidados

### 10.1 Tabela de riscos

| ID | Área | Achado | Evidência | Risco | Severidade | Impacto | Recomendação |
|----|------|--------|-----------|-------|-----------|---------|--------------|
| RK-W-01 | CI/CD | Deploy automático em prod em qualquer push em `main` sem gate humano | `.github/workflows/deploy.yml` — job `deploy-prod-auto` | Merge de PR de runtime ativa produção automaticamente | CRÍTICO | Go-live involuntário antes de T8 completa | Adicionar gate de aprovação manual antes do deploy prod (PR-T8.15) |
| RK-W-02 | Worker | Nenhuma binding Supabase real no `wrangler.toml` | `wrangler.toml` — sem bindings declarados | Worker não consegue conectar ao Supabase real | ALTO | Persistência zero além do processo | Declarar bindings em PR-T8.8 |
| RK-W-03 | Feature flags | `ENOVA2_ENABLED`, `CHANNEL_ENABLED`, `ROLLBACK_FLAG` não implementadas | `src/rollout/guards.ts` — `promotion_block: true` hardcoded | Sem mecanismo de desligamento rápido | ALTO | Incapaz de reverter sem deploy | Implementar em PR-T8.15 |
| RK-W-04 | Worker | Webhook challenge Meta ausente | `src/worker.ts` — rotas mapeadas | Meta não consegue verificar webhook | CRÍTICO | WhatsApp real impossível | Implementar em PR-T8.11 |
| RK-W-05 | LLM | Nenhuma integração LLM real | `src/speech/` — sem chamada HTTP a API LLM | Worker não gera resposta inteligente | ALTO | Enova 2 não conversa com ninguém | Implementar em PR-T8 (frente LLM, a definir) |
| RK-S-01 | Supabase | Dados perdidos a cada restart do Worker | `src/adapter/runtime.ts` — `InMemoryPersistenceBackend` | Lead state, conversas e documentos não persistem | CRÍTICO | Operação impossível sem Supabase real | Implementar em PR-T8.8 |
| RK-S-02 | Supabase | Migrations SQL inexistentes | Nenhum arquivo `.sql` no repo | Schema real desconhecido | CRÍTICO | Supabase real vazio / incorreto | Criar em PR-T8.8 via PR-T8.7 |
| RK-S-03 | Supabase | `@supabase/supabase-js` não instalado | `package.json` — sem dependência | Adapter não pode conectar ao Supabase | ALTO | Bloqueante para Supabase real | Instalar em PR-T8.8 |
| RK-M-01 | Meta | Webhook challenge ausente | `src/meta/` — sem rota GET | Meta rejeita o webhook | CRÍTICO | WhatsApp real impossível | Implementar em PR-T8.11 |
| RK-M-02 | Meta | Verificação de assinatura ausente | `src/meta/validate.ts` — sem X-Hub-Signature-256 | Endpoint vulnerável a requests falsos | CRÍTICO | Risco de segurança e dados falsos | Implementar em PR-T8.11 |
| RK-M-03 | Meta | Sem outbound | `src/meta/` — sem envio a Graph API | Worker aceita mas não responde | CRÍTICO | Lead não recebe resposta | Implementar em PR-T8.11 |
| RK-CRM-01 | CRM | Frontend totalmente ausente no Repo2 | Nenhum arquivo `.tsx`/`.html` | Sem interface operacional | ALTO | Operação cega — sem painel | Migrar do Repo1 em PR-T8.3/T8.4/T8.5 |
| RK-LLM-01 | LLM | Nenhuma integração com API LLM | `src/speech/` — apenas contrato cognitivo | Enova 2 não gera resposta LLM | CRÍTICO | Sistema não opera como atendente | Diagnosticar em PR-T8.2 e implementar |
| RK-TEL-01 | Telemetria | Telemetria apenas em buffer in-process | `src/telemetry/emit.ts` — buffer local | Sem logs externos visíveis | MÉDIO | Operação sem observabilidade real | Implementar em PR-T8.13 |

### 10.2 Resumo por severidade

| Severidade | Quantidade | Exemplos |
|-----------|-----------|---------|
| CRÍTICO | 8 | Deploy auto prod, sem Supabase real, sem webhook challenge, sem outbound, sem LLM, sem signature, sem migrations |
| ALTO | 6 | Sem bindings, sem flags, sem CRM frontend, sem @supabase-js, sem RLS, sem LLM API |
| MÉDIO | 1 | Telemetria só in-process |

---

## §11 Conclusão

### 11.1 O que existe no Repo2

| Componente | Estado | Observação |
|-----------|--------|------------|
| Cloudflare Worker entrypoint | EXISTE — funcional técnico local | 3 rotas: GET /, POST /__core__/run, POST /__meta__/ingest |
| Core Mecânico 2 (engine, parsers, gates) | EXISTE — funcional técnico local | Cobre todas as stages do funil MCMV |
| Supabase Adapter (contrato e runtime) | EXISTE — in-memory apenas | 10 tabelas cobertas; sem Supabase real |
| Meta/WhatsApp ingest (técnico local) | EXISTE — modo técnico local | Aceita envelope, não despacha real |
| Speech engine / cognitive contract | EXISTE — sem LLM real | Contrato LLM-first implementado, sem LLM |
| Audio pipeline (stub) | EXISTE — stub | Sem STT/TTS real |
| Telemetria (buffer in-process) | EXISTE — sem emissão externa | Logs apenas in-process |
| Rollout guard (técnico local) | EXISTE — sempre bloqueado | `promotion_block: true` hardcoded |
| E1 memory (módulo local) | EXISTE — in-memory | Normativa, comercial, memória local |
| Context / living memory | EXISTE — técnico local | Multi-signal, schema, memória viva |
| Scripts de governança de PR | EXISTE | validate_pr_governance.js, autofix |
| Smoke tests por módulo | EXISTE — in-process | 12 comandos npm run smoke:* |
| CI/CD pipeline | EXISTE — ativo | Deploy automático em prod em push/main |

### 11.2 O que não existe no Repo2

| Componente | Impacto | Próxima PR |
|-----------|---------|------------|
| CRM frontend (painel, leads, conversas, docs, dossiê) | CRÍTICO — sem interface operacional | PR-T8.3/T8.5 |
| CRM backend (rotas, endpoints de lead/conversa/docs) | CRÍTICO — sem API de painel | PR-T8.4 |
| Supabase real (`@supabase/supabase-js` + migrations) | CRÍTICO — zero persistência real | PR-T8.7/T8.8 |
| Integração LLM real (Anthropic/Claude) | CRÍTICO — sem resposta inteligente | A diagnosticar em PR-T8.2 |
| Webhook challenge Meta/WhatsApp | CRÍTICO — WhatsApp real impossível | PR-T8.11 |
| Outbound Meta/WhatsApp (respostas ao lead) | CRÍTICO — canal impossível | PR-T8.11 |
| Verificação de assinatura Meta | CRÍTICO — risco de segurança | PR-T8.11 |
| Feature flags de rollback (ENOVA2_ENABLED, etc.) | ALTO — sem mecanismo de desligamento | PR-T8.15 |
| Testes unitários / integração reais | ALTO — cobertura apenas por smoke in-process | PR-T8.x |
| Telemetria externa (Logflare, Axiom, etc.) | MÉDIO — sem observabilidade real | PR-T8.13 |
| Bindings no wrangler.toml (Supabase, envs) | ALTO — Worker não conecta a nada real | PR-T8.8 |

### 11.3 O que está parcial

| Componente | O que existe | O que falta |
|-----------|-------------|------------|
| Meta ingest | Aceita e valida envelope inbound | Challenge, assinatura, outbound, dedupe real |
| Supabase Adapter | Contrato + runtime in-memory completo | Backend real, migrations, envs |
| Telemetria | Buffer in-process com estrutura canônica | Emissão externa, dashboards |
| Speech engine | Contrato LLM-first, cognitive contract | Chamada real a API LLM |
| Rollout guard | Guard ativo, `promotion_block: true` | Flags configuráveis, mecanismo real de toggle |

### 11.4 Desvio crítico identificado: CI/CD ativo em main

**Risco imediato (RK-W-01):** O pipeline `.github/workflows/deploy.yml` faz **deploy automático em produção** (`nv-enova-2`) em qualquer push ou merge em `main`. Isso significa que qualquer PR de implementação (PR-T8.4, PR-T8.8, PR-T8.11, etc.) mergeada em `main` será automaticamente deploiada em produção.

Isso conflita com RNA-G7-01 (zero go-live real sem T8 completo + autorização Vasques) e com a regra de que G8 requer atendimento controlado antes de expansão.

**Recomendação:** Antes de qualquer PR-IMPL, diagnosticar e propor proteção do pipeline prod na PR-T8.2 ou como sub-tarefa prévia.

### 11.5 Próxima PR autorizada

**PR-T8.2 — Matriz contrato T1–T7 × código real** está autorizada.

Pré-condição satisfeita: este inventário mapeia com clareza o que existe, o que falta e o que está parcial no Repo2.

A PR-T8.2 deve:
- Cruzar cada frente contratual (T1–T7) com o código real mapeado aqui.
- Classificar cada item como: `existe` / `parcial` / `ausente` / `conflitante`.
- Produzir lista priorizada de implementação.
- Avaliar o risco do CI/CD em produção e propor mitigação.

---

## §12 Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:       schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md (este arquivo)
Estado da evidência:               completa — inventário baseado em leitura real dos arquivos do repo;
                                   59 arquivos TypeScript inspecionados; wrangler.toml lido;
                                   package.json verificado; CI/CD pipeline lido;
                                   nenhuma inferência — tudo derivado de leitura direta
Há lacuna remanescente?:           sim — Repo1 não foi lido nesta PR (escopo de PR-T8.3);
                                   integração LLM real não mapeada em detalhe (PR-T8.2);
                                   schema Supabase real não existe para mapear;
                                   estas lacunas são de escopo da próxima PR, não bloqueiam
                                   este fechamento de diagnóstico
Há item parcial/inconclusivo bloqueante?: não — todos os módulos src/ foram lidos;
                                   conclusões são baseadas em evidência direta;
                                   lacunas identificadas são declaradas explicitamente
Fechamento permitido nesta PR?:    sim — PR-T8.1 entrega o inventário técnico real do Repo2
                                   conforme especificado no contrato T8 §6 PR-T8.1;
                                   entrega obrigatória criada: T8_REPO2_INVENTARIO_TECNICO.md;
                                   critérios de aceite satisfeitos; zero src/ alterado;
                                   zero runtime; zero implementação
Estado permitido após esta PR:     T8.1 encerrada; PR-T8.2 desbloqueada
Próxima PR autorizada:             PR-T8.2 — Matriz contrato T1–T7 × código real (tipo: PR-DIAG)
```
