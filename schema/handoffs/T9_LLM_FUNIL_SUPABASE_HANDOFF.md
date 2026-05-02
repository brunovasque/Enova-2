# HANDOFF — T9 LLM Funil + Supabase — ENOVA 2

## Identificação

* **Base macro lida:** `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — sim — blocos CRM, persistência, funil LLM
* **Bíblia de PRs lida:** `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — sim — seção T9
* **Fase macro:** T9
* **Épico/microetapa do mestre:** T9.12 — Diagnóstico Supabase write real (CRM / Memória / Stage)
* **PR atual — ID lógico desta Bíblia:** PR-T9.12-DIAG
* **PR atual — número/título no GitHub:** #195 — "docs(t9): PR-T9.12-DIAG — Diagnóstico Supabase write real (CRM/memória/stage)"
* **Branch:** `diag/t9.12-supabase-write-real`
* **Data de conclusão:** 2026-05-02
* **Classificação da tarefa:** diagnostico

## Vínculo contratual

* **Contrato ativo:** `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`
* **Recorte executado do contrato:** T9.12-DIAG — leitura estática do write path, 17 questões respondidas, 5 bloqueadores mapeados
* **Houve desvio de contrato?** não
* **Contrato encerrado nesta PR?** não

## Objetivo executado

Diagnóstico completo da camada de escrita Supabase do runtime ENOVA 2 — identificação de todos os bloqueadores entre o write path atual (writeBuffer in-memory) e escrita real no Supabase.

## Escopo

* **Escopo incluído:**
  - Leitura e análise estática de `src/supabase/crm-store.ts`, `src/crm/service.ts`, `src/crm/store.ts`, `src/supabase/client.ts`
  - Mapeamento completo do write path: `canary-pipeline → getCrmBackend → upsertLeadState/writeLeadFact/createConversationTurn → SupabaseCrmBackend → writeBuffer`
  - Análise de mapeamento tabelas canônicas ↔ tabelas Supabase reais
  - Verificação de `SUPABASE_WRITE_ENABLED` e seu (des)vínculo ao write path
  - Produção de `schema/diagnostics/T9_SUPABASE_WRITE_REAL_DIAG.md` (20 seções, 17 questões)
  - Atualização de `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
  - Atualização de `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`

* **Escopo proibido / explicitamente NÃO incluído:**
  - Nenhuma alteração em `src/`
  - Nenhuma alteração em `package.json`, `wrangler.toml`
  - Nenhuma migration, DDL ou schema Supabase real
  - Nenhuma criação de smoke, proof ou harness
  - Nenhuma ativação de cliente real, WhatsApp real ou go-live

## Arquivos alterados

| Arquivo | Tipo de mudança | Resumo |
|---------|-----------------|--------|
| `schema/diagnostics/T9_SUPABASE_WRITE_REAL_DIAG.md` | criado | Diagnóstico completo — 20 seções, 17 questões, 5 bloqueadores |
| `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | alterado | Gate T9.12-DIAG registrado |
| `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | alterado | T9.12-DIAG prepended como entrada mais recente |

## Bloqueadores identificados

| Código | Localização | Descrição | Severidade |
|--------|-------------|-----------|------------|
| BLK-WRITE-01 | `src/supabase/crm-store.ts` — `insert()` / `update()` | Toda escrita desviada para `writeBuffer` (in-memory, volátil), nunca Supabase | CRÍTICO |
| BLK-WRITE-02 | `src/crm/service.ts` — `createConversationTurn` / `writeLeadFact` | `crm_turns` e `crm_facts` sem tabela Supabase mapeada | BLOQUEANTE PARCIAL |
| BLK-WRITE-03 | `src/crm/store.ts` — factory `getCrmBackend` | `SUPABASE_WRITE_ENABLED` declarada mas não lida nem usada no write path | BLOQUEANTE |
| BLK-WRITE-04 | repo inteiro | Sem migrations no repo — novas tabelas requerem DDL manual por Vasques | BLOQUEANTE PARCIAL |
| BLK-WRITE-05 | `src/supabase/crm-store.ts` — `writeBuffer` | `writeBuffer` é instância por-request — dados perdidos entre requests sem qualquer persistência | CRÍTICO |

## Mecanismo disponível para T9.12-IMPL

- `supabaseInsert()` funcional em `src/supabase/client.ts` — pronta para wiring imediato
- Mapeamento `crm_lead_state ↔ enova_state` confirmado em leitura (T8.9B)
- Mapeamento `crm_leads ↔ crm_lead_meta` confirmado em leitura (T8.9B)

## Status de prontidão por tabela

| Tabela Canônica | Tabela Supabase | Status | Ação necessária |
|----------------|-----------------|--------|-----------------|
| `crm_lead_state` | `enova_state` | ✓ PRONTO | Wiring direto via `supabaseInsert()` |
| `crm_leads` | `crm_lead_meta` | ✓ PRONTO | Wiring direto via `supabaseInsert()` |
| `crm_turns` | `lead_timeline_events` | ✗ AGUARDA DDL | DDL de Vasques necessário |
| `crm_facts` | `?` | ✗ AGUARDA INSTRUÇÃO | Destino a definir por Vasques |

## Testes / evidências mínimas

* PR-DIAG puro — sem alterações de código, sem testes de runtime
* Evidência: `schema/diagnostics/T9_SUPABASE_WRITE_REAL_DIAG.md` (20 seções, 17 questões respondidas com referências de arquivo e linha)
* Estado herdado confirmado: T9.11-PROVA CONCLUÍDA — 56/56 PASS (PR #194)

## Gates

* **Gate atual:** G9 — ABERTO
* **Gate atingido nesta PR?** não
* **Se não, por quê:** T9.12-IMPL ainda pendente; pré-condições aguardam Vasques (DDL, `SUPABASE_WRITE_ENABLED`)

## Pendências / riscos

* **Pendências remanescentes:**
  - DDL de `lead_timeline_events` confirmado (para `crm_turns`) — aguarda Vasques
  - Destino de `crm_facts` definido — aguarda Vasques
  - `wrangler secret put SUPABASE_WRITE_ENABLED true --env test` — aguarda Vasques
  - T9.12 — IMPL Supabase write real (CRM/memória/stage) — próxima PR autorizada

* **Riscos remanescentes:**
  - `writeBuffer` volátil: qualquer crash entre request e persistência futura perde dados de stage/facts/turns
  - Flag `SUPABASE_WRITE_ENABLED` desconectada — write real não pode ser ativado sem refactoring do `getCrmBackend`

* **Mudanças em dados persistidos (Supabase):** nenhuma — PR-DIAG read-only
* **Permissões Cloudflare necessárias:** nenhuma adicional nesta PR

## Exceção contratual

Nenhuma exceção contratual nesta PR.

## Próximo passo autorizado

**T9.12 — IMPL Supabase write real (CRM/memória/stage)**

Pré-condições pendentes de Vasques antes de iniciar T9.12-IMPL:
1. DDL de `lead_timeline_events` confirmado
2. Destino de `crm_facts` definido
3. `wrangler secret put SUPABASE_WRITE_ENABLED true --env test`

## Fontes de verdade consultadas

```
Índice de contratos lido:    schema/contracts/_INDEX.md
Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md
Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
Diagnóstico produzido:       schema/diagnostics/T9_SUPABASE_WRITE_REAL_DIAG.md
```
