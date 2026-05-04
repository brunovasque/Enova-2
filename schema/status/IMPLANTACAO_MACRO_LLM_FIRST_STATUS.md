# IMPLANTACAO_MACRO_LLM_FIRST_STATUS

## Estado atual

**T10.6A-DIAG CRIADA — CONVERSAS DESATUALIZADAS DIAGNOSTICADAS** (2026-05-03) — PR-DIAG READ-ONLY; causa raiz identificada: aba Conversas lê `enova_state.fase_conversa` (dados legados Enova-1, ex: `clt_renda_perfil_informativo`, `quem_pode_somar`) e `enova_log` com tags `meta_minimal`/`DECISION_OUTPUT`/`SEND_OK` (escritos SOMENTE pelo Enova-1 — Worker Enova-2 NÃO escreve esses tags); `/bases` e `/crm` funcionam porque leem `crm_lead_meta`/`enova_attendance_meta` (tabelas gerenciadas pelo próprio painel); diagnóstico documentado em `schema/diagnostics/T10_6A_CONVERSATIONS_STALE_DATA_DIAG.md`; G10.5 APROVADO (Vasques confirmou `ok=true` na health); zero src/ alterado; zero Supabase; zero panel-nextjs alterado; **próxima ação T10**: T10.6B-FIX (corrigir conversations para não exibir dados E1 obsoletos) ou T10.6-CRM-LINK (ligar CRM real com Supabase — paralela). **T9/G9 permanece separado e não é fechado por esta PR**.

**T10.5C-FIX IMPLEMENTADA — ENDPOINT HEALTH CORRIGIDO** (2026-05-03) — PR-FIX contratual; `panel-nextjs/app/api/health/route.ts` alterado: todas as 6 ocorrências de `/__admin__/health` substituídas por `/__admin__/go-live/health` (type literal linha 15 + chamada fetch linha 61 + 4 JSON responses linhas 137/155/186/203); `npm run build` PASS — ✓ Compiled successfully, 25 rotas incluindo `/api/health` (Dynamic); zero TypeScript errors; zero erros de lint; zero src/ alterado; zero Supabase schema; zero segredo commitado; prova criada: `schema/proofs/T10_5C_PANEL_HEALTH_ENDPOINT_FIX_PROOF.md`; **lacuna controlada**: LAC-T10.5C-01 — validação real `/api/health` em Vercel PROD depende de merge + auto-deploy Vercel + Vasques testar; **próxima ação T10**: Vasques testa `https://enova-2.vercel.app/api/health` após merge — se `ok: true` → G10.5 APROVADO → T10.6-CRM-LINK autorizada; se ainda falhar → novo diagnóstico baseado no retorno real; **G10.5 permanece ABERTO até validação real Vasques**. **T9/G9 permanece separado e não é fechado por esta PR**.

**T10.5B-DIAG CRIADA — DIAGNÓSTICO HEALTH PANEL→WORKER CONCLUÍDO** (2026-05-03) — PR-DIAG READ-ONLY; causa raiz do 404 identificada: panel chama `/__admin__/health` que não existe no Worker; Worker tem `/__admin__/go-live/health` (GOLIVE_HEALTH_ROUTE) e `/crm/health` — nenhuma rota `/__admin__/health`; header `X-CRM-Admin-Key` correto em ambos os lados; WORKER_BASE_URL correto; divergência única e isolada: path de endpoint; recomendação: **Opção A — ajustar panel para `/__admin__/go-live/health`** (sem tocar src/); documento criado: `schema/diagnostics/T10_5B_PANEL_WORKER_HEALTH_DIAG.md`; **próxima ação T10**: T10.5C-FIX (PR-FIX) — ajustar endpoint em `panel-nextjs/app/api/health/route.ts`; G10.5 permanece ABERTO. **T9/G9 permanece separado e não é fechado por esta PR**.

**T10.5-RUN EXECUTADA — BUILD LOCAL VALIDADO** (2026-05-03) — `npm install` concluído (67 pacotes, Node.js v24.14.1); `npm run build` PASS sem erros — ✓ Compiled successfully, 25 rotas geradas incluindo `/api/health` (Dynamic); zero erros TypeScript; zero erros de lint; G10.3 APROVADO; prova criada: `schema/proofs/T10_5_PANEL_RUN_BUILD_HEALTH_PROOF.md`; zero `src/` alterado; zero Supabase schema; zero segredo commitado; `.env.local` não existe — apenas `.env.example` com valores vazios; nenhuma correção de código necessária (build passou na primeira execução); **lacunas controladas**: LAC-T10.5-01 preview Vercel (G10.4 ABERTO — requer deploy Vasques), LAC-T10.5-02 `/api/health` com Worker real (G10.5 ABERTO — requer envs reais + deploy); **Próxima ação autorizada T10**: T10.6-CRM-LINK (conforme instrução Vasques — build local validado). **T9/G9 permanece separado e não é fechado por esta PR**.

**T10.4-ADAPT EXECUTADA + FIX CRÍTICO APLICADO** (2026-05-03) — adaptação mínima de envs e auth do `panel-nextjs/` concluída; `.env.example` criado com `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `CRM_ADMIN_KEY`, `ENOVA_ADMIN_KEY`, `WORKER_BASE_URL`, `OPENAI_API_KEY` (sem valores reais); helper `panel-nextjs/app/lib/get-admin-key.ts` criado — resolve `CRM_ADMIN_KEY` preferencial com fallback `ENOVA_ADMIN_KEY`; 4 rotas de auth guard (incoming) atualizadas para usar `getAdminKey()` — `crm/route.ts`, `prefill/route.ts`, `client-profile/route.ts`, `case-files/diagnostic/route.ts`; 3 arquivos de chamada outgoing ao Worker atualizados: header `x-enova-admin-key` → `X-CRM-Admin-Key`, chave via `getAdminKey()` — `send/route.ts`, `health/route.ts`, `bases/_shared.ts`; **FIX 2ª passagem**: `"ENOVA_ADMIN_KEY"` removido de todos os arrays de envs obrigatórias (`AUTH_ENVS`, `REQUIRED_ENVS`, `CALL_NOW_ENVS`) — `CRM_ADMIN_KEY` sozinha agora é válida; verificação `!getAdminKey()` adicionada em todos os 7 pontos de uso — 500 `"missing CRM_ADMIN_KEY or ENOVA_ADMIN_KEY"` quando ambas ausentes; header hardcoded `"x-enova-admin-key": envMap.ENOVA_ADMIN_KEY` em `bases/_shared.ts` corrigido para `"X-CRM-Admin-Key": getAdminKey(envMap...)`; `.gitignore` atualizado com exceção `!panel-nextjs/.env.example`; `README.md` reescrito para Enova-2/panel-nextjs (caminhos, setup, envs, Vercel, Worker Cloudflare); zero `src/` alterado; zero Supabase schema; zero D:\Enova; zero segredo commitado; prova criada/atualizada: `schema/proofs/T10_4_PANEL_ADAPT_ENV_AUTH_PROOF.md`; WORKER_BASE_URL já era lida de env — nenhum hardcode encontrado; painel ainda NÃO teve build/deploy validado (lacuna T10.5); **Próxima ação autorizada T10**: T10.5-RUN (`npm install`, `next build`, preview Vercel, `/api/health`). **T9/G9 permanece separado e não é fechado por esta PR**.

**T10.3-IMPORT EXECUTADA** (2026-05-03) — import bruto do painel Enova 1 para `panel-nextjs/` concluído; origem: `D:\Enova\panel`; destino: `panel-nextjs/`; 100 arquivos copiados (origem=100, destino=100, delta=0); 8/8 arquivos principais presentes (`package.json`, `next.config.js`, `tsconfig.json`, `app/layout.tsx`, `app/components/PanelNav.tsx`, `app/crm/CrmUI.tsx`, `app/api/crm/route.ts`, `app/api/crm/_shared.ts`); `.gitignore` root atualizado com entradas `panel-nextjs/node_modules/`, `panel-nextjs/.next/`, `panel-nextjs/.env*`; `D:\Enova` permaneceu READ-ONLY (zero alteração); `src/` Worker não alterado (zero diff em src/); nenhum segredo copiado; nenhuma adaptação funcional; prova criada: `schema/proofs/T10_3_PANEL_IMPORT_PROOF.md`; G10.2 APROVADO; **Próxima ação autorizada T10**: T10.4-ADAPT (envs, auth, WORKER_BASE_URL, build mínimo). **T9/G9 permanece separado e não é fechado por esta PR**.

**T10.2-CONTRACT EXECUTADA** (2026-05-03) — contrato formal T10 criado: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`; G10.1 APROVADO (contrato aprovado); frente T10 Panel/CRM aberta formalmente; sequência oficial: T10.3-IMPORT → T10.4-ADAPT → T10.5-RUN → T10.6-CRM-LINK → T10.7-READINESS; gates G10.1..G10.7 declarados; 10 critérios CA-T10-01..10 definidos; 7 provas P-T10-01..07 definidas; 5 bloqueios BLK-T10-01..05 mapeados; 13 regras duras declaradas; 7 riscos mapeados; T9 PERMANECE ABERTO e independente; zero `src/` alterado; zero arquivo em `D:\Enova` alterado; zero Supabase/RLS/migration alterado. **Próxima ação autorizada T10**: T10.3-IMPORT (PR-IMPL — import bruto `D:\Enova\panel` → `panel-nextjs/`). **Próxima ação autorizada T9**: T9.14-IMPL.

**T10.1-DIAG CRIADA** (2026-05-03) — abertura diagnóstica da frente Panel/CRM; `schema/diagnostics/T10_1_PANEL_CRM_ENOVA1_CROSSCHECK.md` criado; diagnóstico READ-ONLY de `D:\Enova\panel`; achados: painel Enova 1 = Next.js 14.2.5 + React 18 + TypeScript, 7 abas, 13 rotas API, 26 arquivos lógica IA; tabelas Supabase principais: `enova_state`, `crm_lead_meta`, `crm_leads_v1` (VIEW), `crm_override_log`, `enova_attendance_v1`, `enova_attendance_meta`, `bases_leads_v1`, `enova_prefill_meta`, `enova_log`; envs necessárias: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `ENOVA_ADMIN_KEY`, `WORKER_BASE_URL`, `OPENAI_API_KEY`; gap de auth: `x-enova-admin-key` (Enova 1) ≠ `X-CRM-Admin-Key` (Enova-2); painel NÃO pode rodar dentro do Cloudflare Worker — precisa ser projeto Next.js separado; estratégia recomendada: Vercel para painel (menor risco), Worker Cloudflare para runtime; plano: T10.2-CONTRACT → T10.3-IMPORT → T10.4-ADAPT → T10.5-RUN → T10.6-CRM-LINK; T9 PERMANECE ABERTO; nenhum src/ alterado; nenhum arquivo em D:\Enova alterado.

Fase macro ativa: **T9 — Integração LLM ↔ Funil Mecânico ↔ Supabase Real ↔ Telemetria** — contrato T9 aberto formalmente em 2026-05-01 via PR-T9.0 (docs/t9-contrato-llm-funil-supabase-runtime). Contrato T8 ENCERRADO — G8 APROVADO frente WhatsApp PROD + LLM + Outbound.

**Veredito G7: APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS** — PR-T7.R executada em 2026-04-29.

Gate anterior: G7 — APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS em 2026-04-29 via PR-T7.R.

Gate anterior: **G8 — APROVADO FRENTE WHATSAPP PROD + LLM + OUTBOUND** (2026-05-01)

Gate atual: **G9 — ABERTO** — contrato T9 aberto 2026-05-01; T9.1/T9.2/T9.3/T9.4/T9.5/T9.6-DIAG/T9.6-IMPL/T9.7/T9.8-DIAG/T9.8-IMPL/T9.9-DIAG/T9.9-IMPL/T9.10-DIAG/T9.10-IMPL/T9.11/T9.12-DIAG/T9.12-IMPL CONCLUÍDAS; **T9.13-PROVA CRIADA** (2026-05-03); T9.13G-FIX CONCLUÍDA (PR #203); T9.13I-DIAG CONCLUÍDA (PR #206); T9.13J-DIAG CONCLUÍDA (PR #207); **T9.13J-FIX VALIDADA POR PROVA REAL (PR #208)** — Vasques executou `prove:t9.13-supabase-write-real-test` em 2026-05-03 — resultado: **68 PASS | 0 FAIL | 0 SKIP**; `lead_pool='COLD_POOL'` gravado e preservado; `lead_temp='COLD'` gravado e preservado; BLK-T9.13H-LEAD-POOL-VALUE + BLK-T9.13I-NOT-NULL-FULL + BLK-T9.13J-CHECK-CONSTRAINT RESOLVIDOS; bloqueio remanescente único: **BLK-T9.13-STATE-MAPPING** (enova_state — mapeamento stage_current pendente Vasques); **T9.13K-DIAG CRIADA** (2026-05-03) — diagnóstico BLK-T9.13-STATE-MAPPING: candidatos mapeados (`fase_conversa`=principal, `last_processed_stage`=secundário, `last_user_stage`=fraco, `intro_etapa`=descartado para stage_current); método de prova segura proposto (SQL direto no Supabase SQL Editor sem deploy); **Matriz de compatibilidade adicionada** (§16 do diag T9.13K, 2026-05-03): SQL Vasques confirmou schema `enova_state` — `fase_conversa` text nullable default 'inicio', `intro_etapa`/`last_processed_stage`/`last_user_stage` nullable sem default; distribuição real `fase_conversa`: 10 valores mapeados (inicio/inicio_nome/inicio_programa/docs_opcao/confirmar_interesse/primeiro/proxy_teste_5/clt_renda_perfil_informativo/quem_pode_somar/system_counter); tradução T9→legado: discovery→'inicio' ALTA conf, docs_prep→'docs_opcao' ALTA conf, qualification_renda→'clt_renda_perfil_informativo' candidato, qualification_eligibility→'quem_pode_somar' candidato; qualification_civil/visit BLOQUEADOS (sem candidato legado claro); CRM/panel antigo NÃO acessível (git: apenas remote Enova-2, sem submodule — gap §16.5); camada de tradução explícita obrigatória antes de qualquer escrita real; BLK-T9.13-STATE-MAPPING PERMANECE ATIVO; próximo passo: Vasques confirma mapeamentos faltantes (qualification_civil/visit) → PR-T9.13K-FIX ou PR-T9.14-IMPL implementa `mapLeadStateToEnovaState` com `STAGE_TO_FASE_CONVERSA` completo → desbloqueio BLK-T9.13-STATE-MAPPING → escrita real de `crm_lead_state`; **T9.13L-DIAG CRIADA** (2026-05-03) — crosscheck real Enova 1 (`brunovasque/Enova`): `crm_leads_v1.sql` confirma `fase_conversa AS fase_funil` — CRM operacional começa apenas em `envio_docs`/`aguardando_retorno_correspondente`/`agendamento_visita`/`visita_confirmada`/`finalizacao_processo` (+ flags aprovado/reprovado); `CrmUI.tsx` confirma PASTA=envio_docs / ANALISE=aguardando_retorno / VISITA=agendamento+visita_confirmada+finalizacao; conclusão: stages pré-docs (`discovery`, `qualification_civil`, `qualification_renda`, `qualification_eligibility`) NÃO devem entrar no CRM operacional; T9.13K §16.4 retificada — candidatos `clt_renda_perfil_informativo`/`quem_pode_somar` para stages pré-docs DESCARTADOS (causariam invisibilidade no painel CRM); mapper conservador documentado: `docs_prep → envio_docs`, `analysis_waiting → aguardando_retorno_correspondente`, `visit_scheduling → agendamento_visita`, `visit_confirmed → visita_confirmada`, `finalization → finalizacao_processo`; aprovado/reprovado por flags (não `fase_conversa`); pré-docs mantêm `inicio` (default banco); BLK-T9.13-STATE-MAPPING PERMANECE ATIVO; T9.13K-FIX NÃO autorizada se mapear stages pré-docs para CRM; próxima ação: PR-FIX só após mapper conservador confirmado por Vasques — SQL direto Vasques confirmou: NOT NULL sem DEFAULT [`wa_id`, `lead_pool`, `lead_temp`]; CHECK `crm_lead_meta_lead_pool_check` aceita `'COLD_POOL'`/`'WARM_POOL'`; NOT NULL com DEFAULT (não enviar) [`tags`, `auto_outreach_enabled`, `is_paused`, `created_at`, `updated_at`, `is_archived`]; Decisão canônica Vasques: `lead_pool='COLD_POOL'`/`lead_temp='COLD'` para todo lead novo (base fria inicial); `mapLeadToMeta` atualizado: `lead_pool='COLD_POOL'`, `lead_temp='COLD'`, `wa_id`, `updated_at` (sem campos com DEFAULT); `CrmLeadMetaRow` recebe `lead_temp?`, JSDoc atualizado com SQL confirmado; `payloadKeysLead=['wa_id','lead_pool','lead_temp','updated_at']`; P5.8/P5.9/P7.6/P7.7 checks atualizados para valores canônicos; BLK-T9.13H-LEAD-POOL-VALUE + BLK-T9.13I-NOT-NULL-FULL + BLK-T9.13J-CHECK-CONSTRAINT RESOLVIDOS; smokes: prove:t9.13 local 19/19, smoke:supabase:write-real 39/39, smoke:supabase 70/70, smoke:runtime:env 53/53, smoke:runtime:fallback-guard 41/41, prove:g8-readiness 7/7 PASS; próxima ação: Vasques reexecuta prova real → P5.8/P5.9 PASS esperados; BLK-T9.13-STATE-MAPPING permanece ativo — probe incremental NOT NULL completo: `src/supabase/not-null-probe.ts` criado com `runNotNullFullDiag` (cascata: information_schema → pg_catalog → incremental_probe com wa_id isolado `t9_13_probe_*`, MAX_ITERATIONS=20, extrai violated_column de pg_message a cada 23502, nunca loga details/payload/secrets); P0.5 em write-real-test-proof.ts substituído por full probe; emite `[NOT_NULL FULL DIAG crm_lead_meta]` com `required_columns`, `values_suggested`, `probe_succeeded`, `iterations`; P0.6 + `[NOT_NULL INFERENCE]` mantidos; lead_temp confirmado como próxima NOT NULL (evidência pós-PR #205); BLK-T9.13I-NOT-NULL-FULL registrado; smokes: prove:t9.13 local 19/19, smoke:supabase:write-real 39/39, smoke:supabase 70/70, smoke:runtime:env 53/53, smoke:runtime:fallback-guard 41/41, prove:g8-readiness 7/7 PASS; próxima ação: Vasques reexecuta prova real → [NOT_NULL FULL DIAG] revela lista completa → T9.13I-FIX aplica todas de uma vez; **T9.13H-DIAG CONCLUÍDA** (2026-05-03, PR #204) — parsePgError + P0.5/P0.6 + [NOT_NULL INFERENCE]; **T9.13H-FIX EXECUTADA** (2026-05-03) — `[NOT_NULL INFERENCE]` confirmou `violated_column=lead_pool` (23502 real); busca no repo: zero uso canônico de `lead_pool` em código TS; valor de prova `'t9_13_test'` adotado; BLK-T9.13H-LEAD-POOL-VALUE registrado (valor canônico de produção pendente Vasques); `CrmLeadMetaRow.lead_pool` adicionado; `mapLeadToMeta` envia `lead_pool='t9_13_test'`; `payloadKeysLead=['wa_id','lead_pool','updated_at']`; P5.8+P7.6 verificam lead_pool no Supabase; matriz T9_13G atualizada; smokes: prove:t9.13 local 19/19 PASS, smoke:supabase:write-real 39/39, smoke:supabase 70/70, smoke:runtime:env 53/53, smoke:runtime:fallback-guard 41/41, prove:g8-readiness 7/7 PASS; próxima ação: Vasques reexecuta prova real → P5.8 PASS ou nova 23502 → [NOT_NULL INFERENCE] revela próxima coluna (2026-05-03) — harness dual-mode instalado; modo local 19/19 PASS; modo TEST real resultou em **34 PASS | 1 FAIL | 0 SKIP** (P8.4 `stage_current atualizado`); **T9.13B-FIX EXECUTADA** (2026-05-03) — `SupabaseCrmBackend.update()` corrigido: `Object.assign({}, existing, patch)` garante patch aplicado ao retorno; log diagnóstico P8 adicionado à prova; `smoke:supabase:write-real` 39/39 PASS, `prove:t9.13` local 19/19 PASS, `smoke:supabase` 70/70, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` 7/7 PASS; prova real pós-fix resultou em **41 PASS | 16 FAIL** — causa raiz identificada pelos logs: `crm_lead_meta` usa `wa_id` como PK (não `lead_id`); `enova_state.lead_id` é UUID (não texto); **T9.13C-FIX EXECUTADA** (2026-05-03) — `CrmLeadMetaRow.lead_id` → `wa_id`; `mapLeadFromMeta/mapLeadToMeta` corrigidos; prova usa `randomUUID()` para enova_state e filtros `wa_id=eq.${testWaId}`; smokes: `smoke:supabase:write-real` 39/39, `prove:t9.13` local 19/19, `smoke:supabase` 70/70, todas baterias PASS; prova real pós-T9.13C resultou em **39 PASS | 18 FAIL** — SELECT retorna `ok=true rows=0`: upsert falha silenciosamente e cai em writeBuffer; **T9.13D-DIAG CRIADA** (2026-05-02) — `WriteDiagEntry` + `writeLog[]` adicionados a `SupabaseCrmBackend`; `supabaseWriteLead`/`supabaseWriteLeadState` retornam resultado completo do PostgREST; `insert()`/`update()` registram ok/http_status/rows/error/used_fallback no writeLog; prova adiciona `[DIAG WRITE P5/P6/P7/P8]` após cada operação; objetivo: Vasques re-executa e envia logs `[DIAG WRITE]` para identificar erro real do upsert; nenhuma correção de schema/runtime aplicada; smokes: `smoke:supabase:write-real` 39/39, `prove:t9.13` local 19/19, `smoke:supabase` 70/70, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` 7/7 PASS; próxima ação: **Vasques re-executa prova real e envia `[DIAG WRITE P5/P6/P7/P8]`**; **T9.13E-FIX EXECUTADA** (2026-05-02) — causa confirmada pelos logs T9.13D: `customer_name` não existe em `crm_lead_meta` (PGRST204), `block_advance` não existe em `enova_state` (PGRST204); `CrmLeadMetaRow.customer_name` removida da interface; `EnovaStateRow.block_advance` removida da interface; `mapLeadToMeta` omite `customer_name`; `mapLeadStateToEnovaState` omite `block_advance`; P5.10 removida da prova (campo inexistente no Supabase); campos preservados no CRM canônico e writeBuffer; smokes: `smoke:supabase:write-real` 39/39, `prove:t9.13` local 19/19, `smoke:supabase` 70/70, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` 7/7 PASS; próxima ação: **T9.13E — Vasques re-executa prova real após alinhamento de colunas**; **T9.13F-FIX EXECUTADA** (2026-05-03) — novos PGRST204 pós-T9.13E: `crm_lead_meta.external_ref` não existe, `enova_state.next_objective` não existe; correção em lote: `CrmLeadMetaRow.external_ref` removida da interface; `EnovaStateRow.next_objective` removida da interface; `mapLeadToMeta` omite `external_ref`; `mapLeadStateToEnovaState` omite `next_objective`; P5.8 e P6.9 removidas da prova; sonda P0 de schema discovery adicionada ao início de `runRealProofs`: SELECT * limit=1 em `crm_lead_meta` e `enova_state` → `Object.keys(row)` → imprime `[SCHEMA DIAG]` com `real_columns`, `payload_keys`, `missing_from_real`, `kept`; P0.1–P0.4 verificam que payload não tem colunas ausentes antes de qualquer upsert; payloads limpos: `crm_lead_meta=[wa_id, phone_ref, status, manual_mode, updated_at]`, `enova_state=[lead_id, stage_current, state_version, updated_at]`; smokes: `prove:t9.13` local 19/19 PASS, core smoke PASS; próxima ação: **Vasques re-executa prova real — P0 produz [SCHEMA DIAG] com colunas reais confirmadas; upsert deve produzir PASS sem novos PGRST204**; **T9.13F real-run resultou em 41 PASS | 17 FAIL** — P0 detectou desalinhamento mas NÃO fez fail-fast: prova continuou e upserts falharam com `PGRST204 manual_mode`/`stage_current` (causa: `crm_lead_meta` real não tem `phone_ref/status/manual_mode`; `enova_state` real não tem `stage_current/state_version`); **T9.13G-FIX EXECUTADA** (2026-05-03) — três frentes: (1) **fail-fast no P0**: se P0.3 ou P0.4 falhar, prova encerra ANTES de P5–P8 com bloco `[FAIL-FAST DIAG <tabela>]` indicando real_columns/payload_keys/missing_from_real/kept/próxima ação; (2) **crm_lead_meta payload reduzido**: `mapLeadToMeta` agora envia apenas `wa_id + updated_at` (campos confirmados pelo P0 real); P5/P7 adaptados para verificar apenas wa_id; (3) **BLK-T9.13-STATE-MAPPING**: `crm_lead_state` permanece em writeBuffer — `enova_state` real tem múltiplos candidatos legado (`fase_conversa`, `last_processed_stage`, `last_user_stage`, `intro_etapa`) sem prova canônica de qual usar; `SupabaseCrmBackend.insert/update` para `crm_lead_state` agora registra writeLog com `attempted_real_write=false`, `used_fallback=true`, `error='BLK-T9.13-STATE-MAPPING'`; P6/P8 verificam writeBuffer via `backend.findOne` em vez do Supabase; matriz payload×schema documentada em `schema/diagnostics/T9_13G_PAYLOAD_SCHEMA_MATRIX.md`; smokes: `prove:t9.13` local 19/19, `smoke:supabase:write-real` 39/39, `smoke:supabase` 70/70, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` 7/7 PASS; campos preservados no CRM canônico/writeBuffer (não removidos): `external_ref`, `customer_name`, `phone_ref`, `status`, `manual_mode` em `CrmLead`; `stage_current`, `next_objective`, `block_advance`, `state_version`, `policy_flags`, `risk_flags` em `CrmLeadState`; próxima ação: **Vasques re-executa prova real com fail-fast P0 — esperado: P0.3 PASS (crm_lead_meta payload limpo) + P0.4 PASS (enova_state payload reduzido a lead_id+updated_at) + P5/P7 PASS (upsert real crm_lead_meta) + P6/P8 confirmam BLK-T9.13-STATE-MAPPING com writeBuffer**; **T9.13M-FIX EXECUTADA** (2026-05-03) — BLK-T9.13-STATE-MAPPING RESOLVIDO; `mapStageCurrentToFaseConversa()` exportada em `src/supabase/crm-store.ts` — mapper conservador autorizado por Vasques (T9.13L §6.2): `docs_prep→envio_docs`, `analysis_waiting→aguardando_retorno_correspondente`, `visit_scheduling→agendamento_visita`, `visit_confirmed→visita_confirmada`, `finalization→finalizacao_processo`; pré-docs (`discovery`/`qualification_civil`/`qualification_renda`/`qualification_eligibility`) → `null` (não gravam CRM operacional — preservam default `'inicio'`); `mapLeadStateToEnovaState()` atualizada — payload seguro: `lead_id` + `updated_at` + `fase_conversa` (somente quando mapeado, campo omitido quando null); `EnovaStateRow.fase_conversa` adicionado explicitamente em `src/supabase/types.ts`; `SupabaseCrmBackend.insert/update` para `crm_lead_state` desbloqueados — `attempted_real_write=true`, fallback `writeBuffer` preservado; P3b (12 checks mapper local), P6/P8 (real write checks), P6b (docs_prep com UUID real), P8a (analysis_waiting update) adicionados à prova; smokes: `prove:t9.13` **101 PASS | 0 FAIL | 0 SKIP**, `smoke:supabase:write-real` 39/39, `smoke:supabase` 70/70, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` 7/7 PASS; lacuna documentada: FK constraint 23503 em `enova_state.lead_id` — UUIDs de teste não têm lead correspondente (comportamento esperado — runtime real usa UUID de lead existente); branch: `fix/t9.13m-state-mapping-conservative`; próxima ação: commit/push + PR contra main → T9.14-IMPL ou T9.13N-PROVA com UUID real de lead existente.

**Estado T9 (2026-05-02):** PR-T9.0 (contrato executivo) concluída. **PR-T9.1 CONCLUÍDA** — `wrangler.toml` atualizado com bloco `[vars]` + `[env.test.vars]` (12 vars com defaults seguros; 8 secrets documentados); `src/runtime/env-validator.ts` criado (20 envs canônicas, separação var/secret, `validateEnvs`, `getPersistenceMode`, nunca vaza valores); `src/runtime/env-smoke.ts` criado; `smoke:runtime:env` **53/53 PASS**. **PR-T9.2 CONCLUÍDA** — fallback guard com telemetria explícita em `getCrmBackend()`: dois `diagLog` separados com `reason: 'flag_off' | 'envs_missing'`; `/crm/health` expõe `persistence_mode`; `/__admin__/go-live/health` expõe `supabase_runtime_active`; `src/runtime/fallback-guard-smoke.ts` **39/39 PASS**; regressões: `smoke:runtime:env` 53/53, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:meta:canary` 41/41, `prove:g8-readiness` 7/7 PASS. BLK-05 (Supabase silent fallback) RESOLVIDO. **PR-T9.3 CONCLUÍDA** — DIAG integração Core ↔ pipeline; `schema/diagnostics/T9_CORE_PIPELINE_INTEGRACAO_DIAG.md` criado; veredito: T9.4 viável com patch cirúrgico; `runCoreEngine` mapeado (assinatura, input, output, 9 caminhos por stage); ponto de integração em `canary-pipeline.ts` entre Passo 1 e Passo 2 identificado; parsers L04–L17 usam `facts_current` (não raw_text direto); 4 lacunas documentadas: BLK-01 (Core nunca chamado), BLK-02 (stage nunca persistido), `upsertLeadState` ausente em service.ts, `stage_at_turn: 'unknown'`; patch mínimo T9.4 documentado; smoke `smoke:meta:core-pipeline` especificado (8 checks). Zero src/ alterado. **PR-T9.4 CONCLUÍDA** — `runCoreEngine` conectado ao `canary-pipeline.ts` (BLK-01 RESOLVIDO); `upsertLeadState` criado em `src/crm/service.ts` (BLK-02 RESOLVIDO); Passo 1.5 inserido entre CRM e LLM em `canary-pipeline.ts`; `stage_at_turn` corrigido em `pipeline.ts` (não mais `'unknown'`); `src/meta/core-pipeline-smoke.ts` criado; `smoke:meta:core-pipeline` **23/23 PASS**; regressões: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:runtime:fallback-guard` 39/39, `smoke:runtime:env` 53/53, `prove:g8-readiness` 7/7 PASS. **PR-T9.5 CONCLUÍDA** — prova `stage_current` persiste entre turnos; `src/meta/stage-persistence-proof.ts` criado; 5 cenários (34/34 PASS): C1 lead novo persiste stage após turno 1, C2 mesmo lead turno 2 lê stage existente (state_version=2), C3 lead com `qualification_civil` NÃO reseta para `discovery` (stage_after=qualification_civil, state_version=3, stage_at_turn=qualification_civil), C4 pipeline não lança exceção, C5 nenhum secret no output; `prove:t9.5-stage-persistence` adicionado ao `package.json`; zero bugs na T9.4 — persistência comprovada. **PR-T9.6-DIAG CONCLUÍDA** — DIAG extração de facts do texto WhatsApp real; `schema/diagnostics/T9_FACTS_TEXTO_REAL_DIAG.md` criado; mapa completo de fact_keys por parser e stage (L04–L17); BLK-03 mapeado; estratégia heurística confirmada; Zero src/ alterado. **PR-T9.6-IMPL CONCLUÍDA** — BLK-03 RESOLVIDO; `src/core/text-extractor.ts` criado — `extractFactsFromText(text, stage)` pura, determinística, sem I/O, sem exceções; blocos [B]+[C] adicionados ao Passo 1.5 em `canary-pipeline.ts`: extração → `writeLeadFact` (status: `'pending'`, confidence: 0.7/0.9) → rele CRM → `runCoreEngine` vê facts no mesmo turno; `diagLog('text_extractor.result', ...)` seguro (sem texto do cliente, sem secrets); heurísticas para 6 stages (discovery, qualification_civil, qualification_renda, qualification_eligibility, docs_prep, visit) — 58 patterns normalizados; `src/core/text-extractor-smoke.ts` criado; `smoke:core:text-extractor` **58/58 PASS**; regressões: `smoke:meta:core-pipeline` 23/23, `prove:t9.5-stage-persistence` 34/34, `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:runtime:fallback-guard` 41/41, `smoke:runtime:env` 53/53, `prove:g8-readiness` 7/7 PASS. **PR-T9.7 CONCLUÍDA** — prova end-to-end facts extraídos e stage avança; `src/meta/facts-stage-advance-proof.ts` criado; 5 cenários (44/44 PASS): A texto discovery extrai `customer_goal: 'comprar_imovel'` → stage avança para `qualification_civil`, B texto civil extrai `estado_civil: 'solteiro'` + `processo: 'solo'` → stage avança para `qualification_renda`, C texto renda extrai `regime_trabalho: 'clt'` + `renda_principal: 3500` → stage avança para `qualification_eligibility`, D texto genérico sem fact → stage não reseta (permanece em `qualification_civil`), E nenhum secret no output; `prove:t9.7-facts-stage-advance` adicionado ao `package.json`; regressões: `smoke:core:text-extractor` 58/58, `smoke:meta:core-pipeline` 23/23, `prove:t9.5-stage-persistence` 34/34, `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:runtime:fallback-guard` 41/41, `smoke:runtime:env` 53/53, `prove:g8-readiness` 7/7 PASS. **PR-T9.8-DIAG CONCLUÍDA** — Diagnóstico LlmContext estruturado; `schema/diagnostics/T9_LLM_CONTEXT_DIAG.md` criado (16 seções); veredito: T9.8 viável com patch cirúrgico em 2 arquivos; BLK-04 identificado (`factsMap` fora de escopo em Passo 2 — hoist necessário); `LlmContext` shape mínimo definido; estratégia de compatibilidade com chamadas atuais; budget prompt ≤1200 tokens; smokes exigidos documentados; zero src/ alterado. **PR-T9.8-IMPL CONCLUÍDA** — BLK-04 RESOLVIDO; `src/llm/client.ts` exporta `LlmContext` + `buildDynamicSystemPrompt` + `callLlm(msg, env, context?)` (terceiro param opcional — retrocompatível); `src/meta/canary-pipeline.ts`: `cachedFacts` hoistado para escopo externo, `llmContext` construído com sanitização (`renda_principal`/`cpf` → `'informado(a)'`, máx 8 facts, máx 4800 chars prompt), `llmCaller` recebe context como terceiro arg, `diagLog('llm.context.built', ...)` emite apenas contagens; `src/llm/context-smoke.ts` criado; `smoke:llm:context` **30/30 PASS**; regressões: `smoke:meta:canary` 41/41, `smoke:meta:core-pipeline` 23/23, `prove:t9.7-facts-stage-advance` 44/44, `prove:t9.5-stage-persistence` 58/58, `smoke:core:text-extractor` PASS, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` G8 APROVADO PASS. **PR-T9.9-DIAG CONCLUÍDA** — Diagnóstico Output Guard para respostas do LLM; `schema/diagnostics/T9_OUTPUT_GUARD_DIAG.md` criado (17 seções); veredito: T9.9 viável com patch cirúrgico (1 novo módulo, 1 bloco em `canary-pipeline.ts`); ponto exato de integração identificado (L288→L289 do canary-pipeline.ts pós-T9.8); matriz block/warn/allow definida (12 riscos, 7 patterns bloqueantes); anti-falso-positivo documentado (regex específicos de contexto, distinção promessa/condicional); telemetria `diagLog('llm.output_guard.result', ...)` especificada; shape `LlmOutputGuardResult` + `LlmGuardReasonCode` definidos; smokes exigidos: `smoke:llm:output-guard` ≥20, + 9 regressões; zero src/ alterado. **PR-T9.9-IMPL CONCLUÍDA** — Output Guard implementado; `src/llm/output-guard.ts` criado — módulo puro, 10 reason codes, 7 regras simples (SIMPLE_BLOCK_RULES) + 1 regra contextual com detecção de negação (`checkApprovalPromise`), 2 avisos (text_too_long ≥1000 chars, document_request_out_of_stage em stages precoces); `src/meta/canary-pipeline.ts` atualizado — import `applyOutputGuard`, bloco guard inserido entre L288→L289, `diagLog('llm.output_guard.result', ...)` seguro (sem texto, sem facts values, sem secrets), bloqueio via `replyText=undefined` → outbound detecta `'reply_text_missing'` automaticamente, nenhum fallback inventado; `src/llm/output-guard-smoke.ts` criado; `smoke:llm:output-guard` **48/48 PASS**; regressões: `smoke:llm:context` 30/30, `smoke:meta:canary` 41/41, `smoke:meta:core-pipeline` 23/23, `prove:t9.7-facts-stage-advance` 44/44, `prove:t9.5-stage-persistence` 58/58, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` G8 APROVADO. **Próxima PR autorizada: T9.11 — PROVA LLM usa contexto sem quebrar stage/guard.** **PR-T9.10-DIAG CONCLUÍDA** — Diagnóstico memória curta / contexto histórico controlado; `schema/diagnostics/T9_SHORT_MEMORY_CONTEXT_DIAG.md` criado (17 seções); veredito: T9.10 viável com patch cirúrgico; `getLeadTimeline` identificada em `src/crm/service.ts:147` — já existe e retorna turnos ordenados; `CrmTurn.raw_input_summary` = `text_body.slice(0, 200)` (set em `pipeline.ts:129`); `LlmContext.recent_turns` já declarado em `client.ts:47` mas nunca populado; `buildDynamicSystemPrompt` não renderiza `recent_turns` — precisa de atualização; ponto de integração: Bloco [E] no Passo 1.5 de `canary-pipeline.ts`, após `cachedFacts = factsMap`, usando o mesmo `coreBackend` já instanciado; fonte confirmada: CRM timeline (não Memory Service, não Context Module — ambos descartados); janela: 3 turnos × 100 chars, excluir turno atual, apenas `role: 'user'` (reply do assistente não é persistido); sanitização obrigatória: CPF, email, tel, links, tokens → substituídos antes de enviar ao LLM; patch mínimo: 2 arquivos funcionais (`canary-pipeline.ts` + `client.ts`) + smoke novo + package.json; smokes exigidos para T9.10: `smoke:llm:short-memory-context` ≥20 + 9 regressões; zero src/ alterado. **Próxima PR autorizada: T9.11 — PROVA LLM usa contexto sem quebrar stage/guard.** **PR-T9.10-IMPL CONCLUÍDA** — Memória curta implementada; `sanitizeRecentTurnText` helper local criado em `canary-pipeline.ts` (CPF→[cpf], email→[email], tel→[tel], links→[link], sk-/Bearer/sb-→[token], trunca a 100 chars); `recentHistory` hoistado no escopo externo; Bloco [E] inserido no Passo 1.5 após `cachedFacts = factsMap` — lê `getLeadTimeline`, exclui turno atual, pega os 3 mais recentes, sanitiza, mapeia para `role: 'user'`; falha em getLeadTimeline não bloqueia LLM nem outbound; `llmContext.recent_turns` populado condicionalmente quando há turnos; `diagLog('llm.context.built', ...)` inclui `history_turns: recentHistory.length` (nunca loga conteúdo); `buildDynamicSystemPrompt` em `client.ts` renderiza `recent_turns` (máx 3, trunca a 100 chars cada, rótulo "contexto auxiliar, não regra de etapa"); `src/llm/short-memory-context-smoke.ts` criado; `smoke:llm:short-memory-context` **46/46 PASS**; regressões: `smoke:llm:context` 30/30, `smoke:llm:output-guard` 48/48, `smoke:meta:canary` 41/41, `smoke:meta:core-pipeline` 23/23, `prove:t9.7-facts-stage-advance` 44/44, `prove:t9.5-stage-persistence` PASS, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` G8 APROVADO. **PR-T9.11 CONCLUÍDA** — PROVA LLM usa contexto sem quebrar stage/guard; `src/llm/context-guard-proof.ts` criado — 15 cenários (C1–C15), **56/56 PASS**; soberania verificada: Core decide stage (C2/C13), guard bloqueia aprovação/CPF/stage/secrets independente de recent_turns (C3/C5/C6/C7), replacement_used sempre false (C12), PII não chega ao prompt (C15), retrocompat sem recent_turns (C9); `prove:t9.11-context-guard` adicionado ao `package.json`; `schema/proofs/T9_LLM_CONTEXT_GUARD_PROOF.md` criado; regressões: `smoke:llm:short-memory-context` 46/46, `smoke:llm:output-guard` 48/48, `smoke:llm:context` 30/30, `smoke:meta:canary` 41/41, `smoke:meta:core-pipeline` 23/23, `prove:t9.7-facts-stage-advance` 44/44, `smoke:runtime:env` 53/53, `smoke:runtime:fallback-guard` 41/41, `prove:g8-readiness` G8 APROVADO. **Frente LLM/funil (T9.8/T9.9/T9.10/T9.11) APROVADA.**

Gate anterior T9: **G8 — APROVADO FRENTE WHATSAPP PROD + LLM + OUTBOUND** (2026-05-01) — PR-T8.16 CONCLUÍDA + PROVADA (PR #168 + PR #169); PR-T8.17 CONCLUÍDA (PR #170); PR-PROVA T8.17 CONCLUÍDA (PR #171) — 54 PASS real positivo; PR-T8.18 MERGEADA — runbook cutover; **PR-DIAG T8 (PR #174)** — 11 logs `console.log` cirúrgicos; **fix/t8-prod-client-real-flag (PR #175)** — gate `CLIENT_REAL_ENABLED` implementado no pipeline; **PR-T8.R CLOSEOUT** — `prove:g8-readiness` 7/7 PASS, `meta_ready=true`, G8 APROVADO frente WhatsApp; smokes 41/41 + 26/26 + 20/20 + 35/35 PASS. **Ressalva:** G8 frente WhatsApp apenas — funil completo (stages/MCMV) é a próxima frente.

**Estado Meta/WhatsApp (2026-05-01):** Worker PROD `nv-enova-2` publicado; cutover concluído; PROD recebeu inbound real; pipeline completo inbound → CRM → memória → LLM → outbound executado; **WhatsApp respondendo naturalmente** com LLM (Vasques confirmou PROD); `external_dispatch=true`, `meta_status=200`, `mode=client_real_outbound`; diagnóstico PR-DIAG + fix `CLIENT_REAL_ENABLED` resolveram o gap; **G8 APROVADO frente WhatsApp**. Roadmap oficial: `schema/implementation/T8_ROADMAP_PRODUCAO_WHATSAPP.md`. Próxima frente: integração LLM ↔ funil mecânico/stages/regras MCMV.

Restrições operacionais herdadas de G7: telemetria (RA-G7-01), smoke runtime (RA-G7-02), feature flags runtime (RA-G7-05), WhatsApp real (RA-G7-08).

Contrato T8 ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` — aberto em 2026-04-29 via PR-T8.0.

PR-T8.1 concluída: `schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md` criado em 2026-04-29.

PR-T8.2 concluída: `schema/diagnostics/T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md` criado em 2026-04-29 — 57 itens contratuais mapeados (T1–T7); 2 conflitos críticos (CONF-01: CI/CD auto-deploy; CONF-02: canal incompleto); 4 lacunas bloqueantes G8 (LLM real, Supabase real, CRM, WhatsApp outbound).

PR-T8.3 concluída: `schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md` criado em 2026-04-29 — 37 componentes CRM/infra mapeados; 11 tabelas canônicas Supabase identificadas; 9 itens proibidos de reaproveitar; plano de migração sequenciado (PR-T8.4 backend / PR-T8.5 frontend / PR-T8.6 prova).

PR-T8.4 concluída: `src/crm/` (types.ts, store.ts, service.ts, panel.ts, routes.ts) + `src/worker.ts` atualizado com roteamento `/crm/*` em 2026-04-29; **26 endpoints** cobrindo as **7 abas do painel operacional** (Conversas, Bases, Atendimento, CRM, Dashboard, Incidentes, ENOVA IA); backend in-process `CrmInMemoryBackend` isolado do adapter core; auth segura via `X-CRM-Admin-Key` com flag `CRM_ALLOW_DEV_TOKEN` (sem fallback universal); empty-state declarado com schema estável; flags `real_supabase`/`real_llm`/`real_whatsapp` explicitamente `false`; restrições invioláveis satisfeitas; `schema/implementation/T8_BACKEND_CRM_OPERACIONAL.md` criado/atualizado com matriz backend por aba. Mergeada como PR #149.

PR-T8.5 concluída: `src/panel/handler.ts` (HTML/CSS/JS embutidos) + `src/panel/smoke.ts` + `src/worker.ts` atualizado com roteamento `/panel` em 2026-04-29; **frontend do painel operacional** servido em `/panel` com **7 abas** consumindo os 26 endpoints da PR-T8.4; admin key via `localStorage` (sem hardcode); empty-state estável; flags `real_*: false` exibidas no header global e por aba; smoke `npm run smoke:panel` 30/30 PASS; `schema/implementation/T8_FRONTEND_PAINEL_OPERACIONAL.md` criado. Sem alteração de workflow/deploy, contrato T8, cliente real, WhatsApp real, Supabase real ou LLM real.

PR-T8.6 concluída: `src/panel/e2e-smoke.ts` criado em 2026-04-29 — **prova automatizada E2E** de PR-T8.4 (backend) + PR-T8.5 (painel); **73/73 checks PASS** em 6 categorias (C1 health/painel, C2 auth, C3 fluxo CRM completo com create→override→manual-mode→attendance→case-file→reset→auditoria preservada, C4 7 abas, C5 flags real_*:false, C6 restrições invioláveis); `npm run prove:crm-e2e` adicionado ao `smoke:all`; `schema/implementation/T8_PROVA_CRM_END_TO_END.md` criado com evidência de cada check; invariante de auditoria comprovada: override_log tem 2 entradas pós-reset (C3-18).

PR-T8.7 concluída: `schema/diagnostics/T8_SUPABASE_DIAGNOSTICO.md` criado em 2026-04-29 — diagnóstico Supabase real (PR-DIAG); schema real do Supabase não confirmado no repo; 10 lacunas identificadas (LAC-SB-01..10): zero SQL migrations, zero `@supabase/supabase-js`, zero bindings no wrangler.toml, 3 nomenclaturas paralelas (enova_*, enova2_*, crm_*), ausência de 2 tabelas sem representação TS (prompt_registry, eval_runs), storage/bucket não declarado, RLS não configurado, env vars ausentes, wrangler bindings ausentes; plano PR-T8.8 condicional à chegada de DDL export de Vasques; zero src/ alterado, zero migration, zero package change, zero Supabase real alterado.

PR-T8.8 concluída: `src/supabase/` (types.ts, readiness.ts, client.ts, crm-store.ts, smoke.ts) criado em 2026-04-30 — **Supabase operacional controlado** (PR-IMPL); cliente HTTP minimalista em fetch puro (sem `@supabase/supabase-js`); feature flag `SUPABASE_REAL_ENABLED` + envs `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`; `getCrmBackend(env)` factory resolve in-memory/Supabase por request; `SupabaseCrmBackend` com leitura real de `crm_lead_meta`, `enova_state`, `enova_docs`, `crm_override_log` e **escrita 100% in-memory** (writeBuffer interno) — zero escrita real, zero alteração de schema, zero alteração de RLS, zero alteração de bucket; `/crm/health` expõe `mode` + `supabase_readiness` (com `url_masked`, sem segredo); 503 quando flag ON sem envs; `smoke:supabase` 70/70 PASS adicionado a `smoke:all`; `prove:crm-e2e` continua 73/73 PASS sem alteração; `schema/implementation/T8_SUPABASE_OPERACIONAL.md` criado (15 seções). Sem `@supabase/supabase-js`, sem migration, sem RLS change, sem bucket change, sem WhatsApp real, sem LLM real, sem cliente real, sem workflow/deploy alterado.

PR-T8.9 concluída: `src/supabase/proof.ts` criado em 2026-04-29 — **Harness de prova Supabase real instalado** (PR-PROVA parcial); script dual-mode: sem env real → `SKIPPED_REAL_ENV_MISSING` exit 0 (nunca falha CI); com env real → executa 8 fases de prova (P1 readiness estrutural, P2 auth inválida 4xx, P3 leitura `crm_lead_meta`, P4 leitura `enova_docs`, P5 dossier snapshot `enova_state`+`crm_override_log`, P6 leitura `enova_document_files`, P7 storage buckets via `storage/v1/bucket`, P8 write append-only opcional com `SUPABASE_PROOF_WRITE_ENABLED=true`); service role nunca exposta em stdout; `prove:supabase-real` adicionado ao `package.json` (fora de `smoke:all`); `smoke:supabase` 70/70 PASS retrocompatível; `prove:crm-e2e` 73/73 PASS retrocompatível; `smoke:all` todas etapas PASS; `schema/implementation/T8_SUPABASE_PROVA_DOCS_DOSSIE.md` criado (12 seções). Sem src/ funcional alterado, sem migration, sem RLS change, sem bucket change, sem WhatsApp real, sem LLM real, sem cliente real, sem workflow/deploy alterado. **ATENÇÃO**: `prove:supabase-real` rodou em modo SKIPPED (sem env real) — prova real Supabase NÃO foi executada. Frente Supabase permanece aberta até execução real positiva (PR-T8.9B).

PR-T8.9B concluída: execução real Supabase aprovada em 2026-04-30 — **8/8 PASS | 1 SKIPPED | 0 FAIL — EXIT 0** (rodada 3, Vasques local, Node.js v24.14.1); P1 readiness OK, P2 auth 401 OK, P3 `crm_lead_meta` OK `rows=6`, P4 `enova_docs` OK `rows=20`, P5 dossier OK `state_rows=10 override_rows=0`, P6 `enova_document_files` OK `rows=0`, P7 storage buckets OK `found=4/4 known_matched=4/4` ([emailsnv, documentos-pre-analise, enavia-brain, enavia-brain-test]), P8 SKIPPED (write não habilitado — correto); service role nunca exposta; zero migration, zero RLS alterado, zero bucket alterado, zero delete/update/reset, zero WhatsApp real, zero LLM real, zero cliente real; correções aplicadas na frente: `proof.ts` P4 e `crm-store.ts readDocuments()` `updated_at.desc` → `created_at.desc`; `schema/implementation/T8_SUPABASE_PROVA_REAL_EXECUTADA.md` criado com evidência completa das três rodadas; `smoke:supabase` 70/70 PASS, `prove:crm-e2e` 73/73 PASS, `smoke:all` PASS. **Frente Supabase ENCERRADA** — leitura real provada (ressalva: write real amplo e RLS/storage policy seguem para PRs próprias).

PR-T8.10 concluída: `schema/diagnostics/T8_META_WORKER_DIAGNOSTICO.md` criado em 2026-04-30 — diagnóstico Meta/WhatsApp + Worker runtime (PR-DIAG); cruzamento completo T6.7 × código real em 29 itens; achados críticos: zero env vars Meta declarados no wrangler.toml, zero endpoint GET de webhook challenge, zero validação X-Hub-Signature-256, zero parsing de payload bruto Meta, zero outbound real; o que existe: rota POST `/__meta__/ingest` com envelope interno (não webhook real), smoke:meta 14/14 PASS, rollout guard `allow_meta_real_activation: false` hardcoded; 11 riscos mapeados (R-T810-01..11); plano objetivo para PR-T8.11 em 9 blocos (challenge, assinatura, inbound parser, dedupe, outbound stub, feature flags, logs, smokes, rollback); PR-T8.11 autorizada condicionalmente; zero src/ alterado, zero workflow/deploy alterado, zero secret exposto.

PR-T8.11 concluída: `src/meta/{signature,parser,dedupe,outbound,webhook,webhook-env,webhook-smoke}.ts` criados + `src/worker.ts`/`src/rollout/guards.ts`/`package.json` atualizados em 2026-04-30 — **Implementação Meta/WhatsApp + Worker inbound/outbound** (PR-IMPL); rota `GET|POST /__meta__/webhook` operacional; GET challenge valida `hub.mode`/`hub.verify_token` contra `META_VERIFY_TOKEN` e retorna `hub.challenge` em texto puro com 200; POST valida `X-Hub-Signature-256` HMAC-SHA256 com `META_APP_SECRET` (Web Crypto, comparação timing-safe) antes de qualquer parse — assinatura ausente → 401, inválida → 403; parser de payload bruto Meta (`object: whatsapp_business_account`/`entry[].changes[].value.{messages,statuses}[]`) extrai `wa_message_id`/`wa_id`/`phone_number_id`/`timestamp`/`type`/`text.body`/`media.id`/`media.mime_type`; dedupe in-memory por `wa_message_id` (interface `DedupeStore` estável para futuro KV/Supabase, FIFO 1000 chaves); outbound (`sendMetaOutbound`) **bloqueado por default** — exige `CHANNEL_ENABLED=true` E `META_OUTBOUND_ENABLED=true` E `META_ACCESS_TOKEN` E `phone_number_id` E `wa_id` E `reply_text` não vazio; outbound NUNCA chamado automaticamente pelo inbound nesta PR; 12 eventos de telemetria Meta dedicados (`meta.webhook.challenge.{ok,fail}`, `meta.webhook.signature.{ok,fail}`, `meta.webhook.inbound.{accepted,duplicate,invalid}`, `meta.webhook.status.received`, `meta.webhook.media.stub`, `meta.outbound.{blocked,ready,failed}`); secret nunca em log/error/response; `smoke:meta:webhook` adicionado ao `smoke:all` — **20/20 PASS**; `smoke:meta` 14/14 PASS retrocompatível; `smoke:supabase` 70/70 PASS, `prove:crm-e2e` 73/73 PASS, `smoke:all` PASS exit 0; `schema/implementation/T8_META_WORKER_IMPL.md` criado (14 seções). Sem cliente real, sem LLM real, sem outbound real automático, sem mídia real baixada, sem migration, sem RLS/bucket alterado, sem WhatsApp real amplo, sem deploy/workflow, sem secret exposto, sem alteração no `wrangler.toml` (secrets via `wrangler secret put`).

PR-T8.12 harness instalado (prova real NÃO executada): `src/meta/proof-controlled.ts` + `schema/proofs/T8_META_WHATSAPP_PROVA_CONTROLADA.md` + `package.json` (`prove:meta-controlada`) criados em 2026-04-30 — **Harness de prova Meta/WhatsApp controlada instalado** (PR-PROVA parcial); script dual-mode instalado e funcional — sem `META_REAL_ENABLED`: 25 PASS | 0 FAIL | 6 SKIP exit 0 (nunca falha CI); P1 smokes unitários 100% PASS (signature HMAC, parser, dedupe, outbound, challenge, POST processado); **P2–P7 SKIPPED — prova real NÃO executada** (secrets Meta reais ausentes, Worker não publicado em test, webhook Meta não registrado); P8 invariantes soberania 6/6 PASS; zero cliente real, zero outbound real, zero WhatsApp real amplo; **frente Meta/WhatsApp estado: HARNESS_INSTALADO_PROVA_REAL_PENDENTE** — frente NÃO encerrada.

PR-T8.12B executada com bloqueio formal registrado: `schema/proofs/T8_META_WHATSAPP_PROVA_REAL_EXECUTADA.md` criado em 2026-04-30 — **Execução real Meta/WhatsApp controlada** (PR-PROVA); P1 smokes locais 25 PASS | 0 FAIL | 6 SKIP | exit 0; P7 outbound bloqueado por default comprovado localmente; P2–P7 bloqueados por ausência de: `META_VERIFY_TOKEN`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID` no ambiente Claude Code + Worker test não publicado + webhook Meta não registrado; bloqueio formal registrado com passo a passo completo para Vasques ativar a prova real; zero secret exposto; zero cliente real; zero WhatsApp real amplo; zero migration; zero workflow alterado; **frente Meta/WhatsApp estado: BLOQUEADA_AGUARDANDO_VASQUES** — frente NÃO encerrada. Próxima ação obrigatória por Vasques: provisionar secrets (`wrangler secret put META_VERIFY_TOKEN --env test` + demais), publicar Worker test (`wrangler deploy --env test`), registrar webhook no painel Meta Developers, executar `prove:meta-controlada` em modo real — resultado esperado: `27 PASS | 0 FAIL | 4 SKIP | PARCIAL_COM_PROVA_LOCAL_REAL` (P2/P3 passam localmente; P4–P7 permanecem SKIP no script até evidência externa documentada de challenge real, inbound real e logs Cloudflare).

PR-T8.13 concluída: `src/memory/{types,sanitize,store,service,routes,smoke}.ts` criados + `src/crm/routes.ts`/`package.json` atualizados em 2026-04-30 — **Memória evolutiva + telemetria operacional** (PR-IMPL); 7 categorias canônicas implementadas (`attendance_memory`, `learning_candidate`, `contract_memory`, `performance_memory`, `error_memory`, `commercial_memory`, `product_memory`); ciclo de aprendizado com status `draft|validated|rejected|promoted`, **promoção NUNCA automática** — exige `applyLearningDecision` com `operator_id` E `reason` não vazios; store in-memory FIFO 5000 com interface `MemoryStore` estável para futura integração Supabase via flag `MEMORY_SUPABASE_ENABLED`; sanitização ativa em toda escrita (META_*/SUPABASE_*/OPENAI_*/CRM_ADMIN_KEY/Bearer/JWT/sb-/sk-/ghp_/ghs_/sha256=/base64≥80 redigidos; campos `authorization`/`cookie`/`x-hub-signature*`/`password`/`secret`/`token` redigidos; truncamento `summary 500c`, `decision_reason 500c`, `operator_id 100c`); 6 endpoints novos sob `/crm/memory/*` (status, lead/:ref, learning-candidates GET/POST, event POST, decision POST) — auth `X-CRM-Admin-Key` uniforme; telemetria emite eventos `f7.core.persistence_signal.memory.{event.recorded,candidate.{created,validated,rejected,promoted,decision}}`; `smoke:memory` 17/17 PASS adicionado a `smoke:all`; `smoke:supabase` 70/70 PASS, `prove:crm-e2e` 73/73 PASS, `smoke:meta:webhook` 20/20 PASS, `smoke:all` EXIT 0 retrocompatíveis; `schema/implementation/T8_MEMORIA_TELEMETRIA_OPERACIONAL.md` criado (15 seções). Sem alteração de Worker runtime, sem alteração de painel UI, sem alteração de Meta webhook, sem cliente real, sem LLM real, sem outbound real, sem migration, sem RLS/storage, sem workflow/deploy, sem secret exposto. **Frente memória/telemetria: BASE_OPERACIONAL_INSTALADA** — prova formal executada em PR-T8.14.

PR-T8.14 concluída: `src/memory/proof.ts` criado + `prove:memory-telemetry` adicionado ao `package.json` + `schema/proofs/T8_MEMORIA_TELEMETRIA_PROVA.md` criado em 2026-04-30 — **Prova memória + telemetria + regressão contratual** (PR-PROVA); 9 provas programáticas (P1–P9): evento de atendimento salvo, candidato draft sem auto-promoção, decisão humana exige operator_id+reason, telemetria emite `f7.core.persistence_signal.memory.*`, sanitização redige 100% dos segredos, rotas `/crm/memory/*` operacionais via Worker (14 assertions), regressão soberana (sem reply_text/decide_stage/fact_* em rotas CRM), invariantes soberanas (12 assertions); `prove:memory-telemetry` **9/9 PASS**; `smoke:memory` 17/17 PASS, `smoke:all` EXIT 0, `prove:crm-e2e` 73/73 PASS, `prove:meta-controlada` 25/0/6 retrocompat; **Frente memória/telemetria: APROVADA_LOCAL_IN_MEMORY** — persistência Supabase real fica para PR futura; Meta/WhatsApp continua bloqueada.

**G8 não fechado.** Frente Meta/WhatsApp continua **BLOQUEADA_AGUARDANDO_VASQUES** (PR-T8.12B); persistência real de memória continua in-memory (integração Supabase real para PR futura); atendimento real ainda não provado.

PR-T8.15 concluída: `src/golive/{flags,rollback,harness,health,smoke}.ts` criados + `src/worker.ts` atualizado com rota `/__admin__/go-live/health` + `package.json` atualizado com `smoke:golive` em 2026-04-30 — **Feature flags, rollback técnico e harness de go-live** (PR-IMPL); 10 flags canônicas com default seguro `false`/`0` (`ENOVA2_ENABLED`, `CHANNEL_ENABLED`, `META_OUTBOUND_ENABLED`, `LLM_REAL_ENABLED`, `CLIENT_REAL_ENABLED`, `CANARY_PERCENT`, `ROLLBACK_FLAG`, `MAINTENANCE_MODE`, `GOLIVE_HARNESS_ENABLED`, `MEMORY_SUPABASE_ENABLED`); `isOperationallyAllowed()` com 8 bloqueios em cascata — ROLLBACK_FLAG bloqueia tudo, MAINTENANCE_MODE bloqueia atendimento, cada flag real exige ativação explícita; `isFullGoLiveAllowed()` atalho que exige todas as flags reais; `evaluateGoLiveReadiness()` harness que avalia readiness sem executar nada real — `meta_ready=false` (aguarda Vasques), `g8_allowed=false`; `GET /__admin__/go-live/health` retorna readiness completo (auth X-CRM-Admin-Key, sem secrets, 200/401/405); `smoke:golive` **18/18 PASS**; `smoke:all` EXIT 0; `prove:crm-e2e` 73/73 PASS; `prove:memory-telemetry` 9/9 PASS; `prove:meta-controlada` 25/0/6 retrocompat; `schema/implementation/T8_FLAGS_ROLLBACK_GOLIVE_HARNESS.md` criado (14 seções). Sem cliente real, sem LLM real, sem WhatsApp real, sem outbound real, sem migration, sem RLS, sem workflow/deploy, sem secret exposto. **G8 NÃO FECHADO — aguarda PR-T8.R com autorização de Vasques.**

PR-T8.R executada em 2026-04-30 — **Readiness/Closeout G8 com bloqueio formal** (PR-PROVA/CLOSEOUT); `prove:g8-readiness` **7/7 PASS** (R1 CRM operacional, R2 Supabase leitura real documental, R3 Meta técnica OK + prova real BLOQUEADA, R4 memória/telemetria aprovada, R5 flags/rollback/harness operacional, R6 segurança confirmada, R7 G8 NÃO fechado documentado); `smoke:all` EXIT 0, `prove:crm-e2e` 73/73, `prove:memory-telemetry` 9/9, `prove:meta-controlada` 25/0/6 retrocompat; `schema/proofs/T8_READINESS_CLOSEOUT_G8.md` criado (16 seções); `src/golive/closeout-smoke.ts` criado; `prove:g8-readiness` adicionado ao `package.json`. **VEREDITO: NO-GO CONTROLADO — G8 NÃO FECHADO.** Única trava remanescente: Meta/WhatsApp prova real externa (PR-T8.12B — aguardando Vasques). Contrato T8 permanece aberto.

**G8 APROVADO — FRENTE WHATSAPP PROD + LLM + OUTBOUND (2026-05-01):** Vasques confirmou PROD respondendo naturalmente. Próxima frente: integração LLM ↔ funil mecânico / stages / regras MCMV.

PR-DIAG LLM-FUNIL-SISTEMA-INTEIRO-READONLY em execução em 2026-05-01 — **Diagnóstico completo para integração LLM ↔ funil mecânico** (PR-DIAG/READ-ONLY); contexto: G8 frente WhatsApp APROVADA, próxima frente é integrar LLM ao funil/stages/MCMV; achados: (1) **2 sistemas paralelos isolados** — pipeline WhatsApp (`src/meta/canary-pipeline.ts`) e Core mecânico (`src/core/engine.ts`) nunca se cruzam em runtime; (2) **LLM cego ao funil** — `callLlm(text_body)` recebe apenas mensagem atual, sem stage, facts, históriço; (3) **Funil mecânico completo** — 9 stages + parsers L04–L17 + gates operacionais, mas chamados APENAS via `POST /__core__/run` (rota técnica); (4) **`runCoreEngine` não é importado em `src/meta/`** (grep confirmou 0 matches); (5) **Supabase silenciosamente desligado em PROD** — `getCrmBackend` cai em `CrmInMemoryBackend` sem nenhuma telemetria/aviso quando `SUPABASE_REAL_ENABLED!=='true'`; (6) **`wrangler.toml` declara zero bindings** (linhas 15-16 explicitam); (7) **CrmLeadState.stage_current nunca é escrito em runtime real** — `stage_at_turn='unknown'` literal em service.ts:448; (8) **Memória/CRM/override 100% in-memory FIFO** — perde tudo no restart; (9) **Context module existe mas não é usado** (`src/context/{schema,living-memory,multi-signal}.ts`); 6 BLOQUEANTES identificados (BLK-01..06), 7 IMPORTANTES (IMP-01..07), 5 OPCIONAIS (OPC-01..05); plano de 15 micro-PRs (T9.0–T9.R) separados em runtime/Supabase/funil/LLM/telemetria/provas; smokes retrocompat: `smoke:meta:webhook` 20/20 PASS, `smoke:meta:pipeline` PASS, `smoke:meta:canary` 41/41, `smoke:meta:client-real-flag` 35/35, `prove:g8-readiness` 7/7; documentos criados: `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md` (16 seções), `schema/diagnostics/LLM_FUNIL_MAPA_CONEXOES.md`, `schema/diagnostics/SUPABASE_RUNTIME_READINESS.md`, `schema/handoffs/LLM_FUNIL_NEXT_CONTRACT_HANDOFF.md`; zero alteração runtime, zero implementação, zero alteração de flags/envs/secrets/rotas; T8/G8 frente WhatsApp APROVADO permanece intacto; G9 NÃO ABERTO. **Próxima ação autorizada: abrir contrato T9 (PR-DOC) com cláusulas invioláveis, plano de 15 micro-PRs e critérios G9.**

PR-T8.R CLOSEOUT FINAL concluída em 2026-05-01 — **G8 APROVADO — FRENTE WHATSAPP PROD + LLM + OUTBOUND** (PR-PROVA/CLOSEOUT); `prove:g8-readiness` **7/7 PASS** — R3 meta_ready=true PROD aprovado por Vasques, R7 G8 APROVADO FRENTE WHATSAPP; `src/golive/harness.ts` atualizado — `meta_ready=true`, artificial trava removida; `src/golive/closeout-smoke.ts` atualizado — R3/R5/R7 refletem PROD aprovado; `schema/proofs/T8_G8_WHATSAPP_PROD_CLOSEOUT.md` criado — 4 evidências Vasques; `schema/implementation/T8_ROADMAP_PRODUCAO_WHATSAPP.md` atualizado — Etapas 5+6+7 CONCLUÍDA; smokes: `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26, `smoke:meta:client-real-flag` 35/35 PASS; **Ressalva:** G8 frente WhatsApp apenas — funil completo (stages/MCMV) próxima frente. Contrato T8 frente WhatsApp ENCERRADO.

fix/PR-IMPL T8-CLIENT-REAL-FLAG em execução em 2026-05-01 — **Correção: CLIENT_REAL_ENABLED não refletido no runtime PROD** (fix estrutural); investigação confirmou 3 bugs: (1) `canary-pipeline.ts` não lia `CLIENT_REAL_ENABLED` — gate de outbound não tinha caminho client_real; (2) `diagLog` hardcodava `client_real_allowed: false`; (3) `MetaWorkerEnv` não declarava `CLIENT_REAL_ENABLED`; correções: gate cascade atualizado com caminho `clientRealEnabled` antes dos checks canary — `CLIENT_REAL_ENABLED=true` permite qualquer WA sem exigir `OUTBOUND_CANARY_WA_ID`; `CanaryReport` adicionado `client_real_allowed: boolean` e `mode: 'client_real_outbound'`; `MetaWorkerEnv` atualizado; `src/meta/client-real-flag-smoke.ts` criado — **35/35 PASS**; `smoke:meta:canary` 41/41, `smoke:meta:webhook` 20/20, `smoke:meta:pipeline` 26/26 PASS; `schema/diagnostics/T8_CLIENT_REAL_FLAG_PROD_DIAGNOSTIC.md` criado; T8.12B NÃO ENCERRADA; G8 NÃO FECHADO.

PR-DIAG T8-PROD-TELEMETRIA em execução em 2026-05-01 — **Telemetria cirúrgica para diagnosticar bloqueio PROD** (PR-DIAG); contexto: cutover executado, PROD recebeu POST webhook OK mas resposta WhatsApp não chegou; causa opaca — `emitTelemetry` vai para buffer em memória, não para `wrangler tail`; solução: `src/meta/prod-diag.ts` criado — `maskId` + `diagLog(console.log)`; 11 pontos de log adicionados: `webhook.ts` (logs 1 received, 2 signature, 3 parsed, 4 dedupe, 5 flags.snapshot, 11 webhook.final) + `canary-pipeline.ts` (logs 6 pipeline.result, 7 llm.gate, 8 llm.result, 9 outbound.gate, 10 outbound.result) + `outbound.ts` (campo `error_body_sanitized` em `OutboundResult`); `schema/diagnostics/T8_PROD_WEBHOOK_OUTBOUND_TELEMETRY.md` criado com árvore de diagnóstico completa; smokes: `smoke:meta:canary` 41/41 PASS, `smoke:meta:pipeline` 26/26 PASS, `smoke:meta:webhook` 20/20 PASS; nenhuma regra de negócio alterada, nenhuma flag default alterada, CLIENT_REAL_ENABLED não alterado; T8.12B NÃO ENCERRADA; G8 NÃO FECHADO. **Próxima ação: Vasques deploya esta PR no PROD, envia mensagem real, inspeciona `wrangler tail` para identificar gate exato do bloqueio.**

PR-T8.18 em execução em 2026-05-01 — **Cutover controlado Enova 2 em produção WhatsApp** (PR-OPS/GO-LIVE CONTROLADO); `schema/operations/T8_CUTOVER_ENOVA2_PROD.md` criado — runbook completo: endpoint PROD confirmado via `wrangler.toml` (`https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook`), deploy `npx wrangler deploy`, secrets/flags, 3 fases (A pré-cutover, B cutover, C monitoramento), rollback 3 níveis (Nível 1 preferencial=flags/segundos, Nível 2 parcial, Nível 3 emergência extrema/webhook Enova 1), ampliação Fase D (decisão Vasques), closeout Fase E; `schema/proofs/T8_CUTOVER_PROD_CHECKLIST.md` criado — checklist operacional por fase com checkboxes; rollback preferencial = `ROLLBACK_FLAG=true` (flags); retorno à Enova 1 = Nível 3 emergência extrema, não caminho preferencial; CLIENT_REAL_ENABLED=false para cutover inicial; T8.12B NÃO ENCERRADA; G8 NÃO FECHADO. **Próxima ação: Vasques executa cutover conforme checklist.**

PR-PROVA T8.17 em execução em 2026-05-01 — **Prova real canary LLM + outbound controlado** (PR-PROVA); `src/meta/canary-real-proof.ts` criado — harness dual-mode: sem credenciais: 31 PASS | 0 FAIL | 5 SKIP exit 0 (smokes locais + P4 governança completos); com `CANARY_REAL_PROOF_ENABLED=true` + credenciais: executa POST HMAC-assinado ao Worker TEST com wa_id canary e verifica resposta completa: `llm_invoked=true`, `reply_text_present=true`, `outbound_attempted=true`, `external_dispatch=true`, `canary_allowed=true`, lead no CRM; `prove:meta:canary-real` adicionado ao `package.json`; `schema/proofs/T8_LLM_OUTBOUND_CANARY_PROVA_REAL.md` criado (9 seções + Bloco E); `smoke:all` 73/73 PASS retrocompat; Bloco E: evidência PARCIAL — smokes locais PASS, prova real Worker TEST SKIP (requer Vasques com flags canary ativas + credenciais reais). T8.12B NÃO ENCERRADA; G8 NÃO FECHADO. **Próxima ação: Vasques executa** `npm run prove:meta:canary-real` com `CANARY_REAL_PROOF_ENABLED=true` + credenciais + flags ativas no Worker TEST.

PR-PROVA T8.17 em execução em 2026-05-01 — **Prova real canary LLM + outbound controlado** (PR-PROVA); `src/meta/canary-real-proof.ts` criado — harness dual-mode: sem credenciais: 31 PASS | 0 FAIL | 5 SKIP exit 0 (smokes locais + P4 governança completos); com `CANARY_REAL_PROOF_ENABLED=true` + credenciais: executa POST HMAC-assinado ao Worker TEST com wa_id canary e verifica resposta completa: `llm_invoked=true`, `reply_text_present=true`, `outbound_attempted=true`, `external_dispatch=true`, `canary_allowed=true`, lead no CRM; `prove:meta:canary-real` adicionado ao `package.json`; `schema/proofs/T8_LLM_OUTBOUND_CANARY_PROVA_REAL.md` criado (9 seções + Bloco E); `smoke:all` 73/73 PASS retrocompat; Bloco E: evidência PARCIAL — smokes locais PASS, prova real Worker TEST SKIP (requer Vasques com flags canary ativas + credenciais reais). T8.12B NÃO ENCERRADA; G8 NÃO FECHADO. **Próxima ação: Vasques executa** `npm run prove:meta:canary-real` com `CANARY_REAL_PROOF_ENABLED=true` + credenciais + flags ativas no Worker TEST.

PR-T8.17 concluída em 2026-05-01 — **LLM + outbound canary controlado** (PR-IMPL acelerada/controlada); `src/llm/client.ts` criado — cliente LLM mínimo (OpenAI `gpt-4o-mini`, fetch puro, sem SDK); `src/meta/canary-pipeline.ts` criado — orquestrador completo: `runInboundPipeline` (CRM+memória) → LLM gated `LLM_REAL_ENABLED` → outbound gated `OUTBOUND_CANARY_ENABLED` + `wa_id === OUTBOUND_CANARY_WA_ID`; gates em cascata: ROLLBACK_FLAG > MAINTENANCE_MODE > LLM_REAL_ENABLED > OUTBOUND_CANARY_ENABLED > wa_id check; `src/meta/webhook.ts` atualizado para chamar `runCanaryPipeline` (substitui `runInboundPipeline`); `MetaWorkerEnv` extendido com 6 novas vars; `CanonicalFlags` extendido com `outbound_canary_enabled` + `outbound_canary_wa_id`; `src/meta/canary-smoke.ts` criado — **41/41 PASS** sem LLM real/outbound real; `smoke:all` EXIT 0 — 73/73 PASS sem regressão; `schema/implementation/T8_LLM_OUTBOUND_CANARY.md` criado; CLIENT_REAL_ENABLED permanece false; T8.12B NÃO ENCERRADA; G8 NÃO FECHADO. **Próxima PR autorizada: PR-PROVA T8.17** — prova real canary com Vasques.

PR-PROVA T8.16 concluída (positiva) em 2026-05-01 — **41 PASS | 0 FAIL** — harness fix aplicado (Fase 4 governança); prova real executada por Vasques com `ENOVA2_PROOF_ENABLED=true`: POST `/__meta__/webhook` → 200, lead criado no CRM com `external_ref=wa_id`, `llm_invoked=false`, `outbound_attempted=false`, sem `reply_text`. T8.12B NÃO ENCERRADA; G8 NÃO FECHADO.

PR-PROVA T8.16 em execução em 2026-05-01 — **Prova inbound real Meta → CRM + memória** (PR-PROVA); `src/meta/pipeline-real-proof.ts` criado — harness dual-mode: sem credenciais: 16 PASS | 0 FAIL | 5 SKIP exit 0 (esmokes locais completos); com `ENOVA2_PROOF_ENABLED=true` + credenciais: executa POST HMAC-assinado ao Worker TEST e verifica resposta do pipeline + CRM; `prove:meta:pipeline-real` adicionado ao `package.json`; `schema/proofs/T8_INBOUND_CRM_MEMORIA_PROVA_REAL.md` criado; `smoke:meta:pipeline` 26/26 PASS; `smoke:all` EXIT 0; Bloco E: evidência PARCIAL — prova local PASS, prova real Worker TEST SKIP (requer Vasques); **próxima ação: Vasques executa** `npm run prove:meta:pipeline-real` com credenciais reais + documentar evidência de inbound real + pipeline respondido. Sem LLM real, sem outbound real, sem resposta WhatsApp, sem cutover, sem G8 fechado.

PR-T8.16 concluída em 2026-05-01 — **Acoplamento inbound Meta → CRM + memória** (PR-IMPL); `src/meta/pipeline.ts` criado — orquestrador: evento normalizado → `upsertLeadByPhone` → `createConversationTurn` → `registerMemoryEvent(source:'meta_webhook', category:'attendance_memory')` → relatório técnico; `upsertLeadByPhone` + `createConversationTurn` adicionados a `src/crm/service.ts`; `POST /crm/conversations` adicionado a `src/crm/routes.ts`; `src/meta/webhook.ts` atualizado para chamar pipeline quando `ENOVA2_ENABLED=true` + `event.kind === 'message'` + não duplicate; `ENOVA2_ENABLED` adicionado ao `MetaWorkerEnv`; `src/meta/pipeline-smoke.ts` criado; `smoke:meta:pipeline` **26/26 PASS**; `smoke:all` EXIT 0 sem regressão; `schema/implementation/T8_INBOUND_CRM_MEMORIA.md` criado; `schema/implementation/T8_ROADMAP_PRODUCAO_WHATSAPP.md` atualizado. Invariantes: LLM nunca chamado, outbound nunca enviado, reply_text nunca gerado, ENOVA2_ENABLED gate operacional, pipeline não lança exceções (captura interna). **Próxima PR autorizada: PR-PROVA da T8.16** — provar com mensagem real no Worker TEST.

PR-DIAG T8-META-INBOUND-CUTOVER concluída em 2026-05-01 — **Diagnóstico do acoplamento inbound Meta → CRM/eventos/memória/LLM/outbound + cutover Enova 1 → Enova 2** (PR-DIAG); 10 questões obrigatórias respondidas: (1) inbound termina em `src/meta/webhook.ts` linha 259 sem nenhuma chamada downstream; (2) nada é gravado (apenas dedupe in-memory + telemetria in-memory); (3) zero integração CRM/conversa/eventos; (4) zero Supabase; (5) zero LLM; (6) outbound explicitamente bloqueado por código (`pr_t811_no_auto_outbound`); (7) flags necessárias para resposta real: ENOVA2_ENABLED+CHANNEL_ENABLED+META_OUTBOUND_ENABLED (já ativas no TEST) + LLM_REAL_ENABLED+CLIENT_REAL_ENABLED (sem implementação/autorização); (8) flags que devem permanecer OFF: LLM_REAL_ENABLED, CLIENT_REAL_ENABLED; (9) risco de 1 único número WhatsApp: cutover deve ser janela controlada com Vasques presente — rollback em ~30s via painel Meta; (10) 10 lacunas mapeadas (LAC-IB-01..10); plano de PRs: PR-T8.16 (IMPL acoplamento inbound→CRM+memória, sem LLM) → PR-T8.16.P → PR-T8.17 (IMPL LLM+outbound) → PR-T8.17.P → CUTOVER → PR-T8.R.2. `schema/diagnostics/T8_META_INBOUND_CUTOVER_DIAGNOSTICO.md` criado. Zero `src/` alterado, zero `wrangler.toml`, zero Supabase, zero produção, zero G8 alterado. **Próxima PR autorizada: PR-T8.16 — PR-IMPL acoplamento inbound → CRM + memória (sem LLM).**

INFRA-META-01 concluída em 2026-04-30 — **Preparação do ambiente TEST Cloudflare para PR-T8.12B** (INFRA/GOVERNANÇA); `schema/implementation/INFRA_META_01_AMBIENTE_TEST_CLOUDFLARE.md` criado com passo a passo completo em 9 fases para Vasques: provisionar 4 secrets Meta no Worker test, publicar `nv-enova-2-test` (`wrangler deploy --env test`), registrar webhook no painel Meta Developers, executar `prove:meta-controlada` com `META_REAL_ENABLED=true`, documentar evidências de challenge real + inbound real + logs Cloudflare, re-executar `prove:g8-readiness`; checklist de 10 itens em §9; estrutura do webhook documentada; bloqueios de segurança do outbound documentados; regressão retrocompat: `smoke:meta:webhook` 20/20, `smoke:golive` 18/18, `prove:meta-controlada` 25/0/6, `smoke:all` EXIT 0; zero `src/` alterado, zero `wrangler.toml` alterado, zero secret exposto, zero webhook real registrado, zero G8 alterado; **frente Meta/WhatsApp permanece BLOQUEADA_AGUARDANDO_VASQUES**.

Contrato T7 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md` (G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS; PR-T7.R executada em 2026-04-29).

Contrato T6 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md` (G6 APROVADO; PR-T6.R executada em 2026-04-28).

Contrato T5 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md` (G5 APROVADO; PR-T5.R executada em 2026-04-28).

Contrato T4 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md`.

Contrato T3 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md`.

Contrato T2 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`.

Contrato T1 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`.

Base soberana: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## Ultima tarefa relevante

`PR-T7.R` — Readiness/Closeout G7:
`schema/implantation/READINESS_G7.md` criado — 17 seções; veredito G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS.
CA-G7-01..22 (22/22 CUMPRIDOS); B-G7-01..14 declarados (todos não aplicáveis);
Riscos aceitos RA-G7-01..08 consolidados (telemetria, smoke, canary real, divergências, flags, thresholds, rollback meta, WhatsApp);
Riscos não aceitos RNA-G7-01..06 (S4 — cliente real, MCMV, promessa indevida, lead_state, legado, reply_text mecânico);
Contrato T7 encerrado formalmente via CONTRACT_CLOSEOUT_PROTOCOL §4; arquivado em `archive/CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md`;
Próxima fase T8 planejada: diagnóstico técnico de aderência contrato × código real; PR-T8.0 autorizada (pending: Vasques);
Critérios mínimos para T8 definidos: CT8-01..10;
O que G7 NÃO autoriza: go-live real, cliente real, WhatsApp real, deploy, cutover real, uso comercial;
Bloco E: Fechamento permitido: sim.
Zero src/; zero runtime; zero WhatsApp real; zero reply_text; zero fact_*; zero go-live; zero cliente real. Implantação macro T0–T7 ENCERRADA DOCUMENTALMENTE.

## Ultima tarefa anterior (PR-T7.7)

`PR-T7.7` — Checklist executivo de go/no-go:
`schema/implantation/T7_GO_NO_GO_EXECUTIVO.md` criado — 18 seções; consolidação de evidências T7.1–T7.6 e recomendação executiva antes do closeout G7.
Checklist CHK-T77-01..20 com 20/20 PASS; evidências de cada PR tabeladas;
Riscos aceitos RA-T77-01..08 (telemetria, smoke, canary real, divergências, flags, thresholds, rollback runtime, WhatsApp);
Riscos não aceitos RNA-T77-01..06 (cliente real sem G7, violação MCMV, promessa indevida, perda de lead_state, legado antes de G7, reply_text mecânico);
12 bloqueantes BLK-T77-01..12 com estado atual (3 pendentes de runtime: BLK-T77-07/11/12);
4 decisões possíveis (GO/GO PARCIAL/GO COM RESTRIÇÕES/NO-GO) com pré-condições, consequências e próxima ação;
Recomendação executiva: GO PARA CLOSEOUT G7 DOCUMENTAL (condicional a BLK-T77-07/11/12);
Autorização humana Vasques definida: obrigatória para G7; veto soberano; formato de registro com data/escopo;
14 critérios mínimos CR-T7R-01..14 para PR-T7.R;
Payload canônico §13 para PR-T7.R: go_no_go_status, recommended_decision, approved_for_closeout_g7, t7_artifacts_complete, blockers, accepted_risks, rejected_risks, human_authorization_required, evidence_paths, recommendation;
CA-T7.7-01..20 todos satisfeitos; B-T7.7-01..14 declarados; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero WhatsApp real; zero reply_text; zero fact_*; zero G7 aprovado; zero go-live. PR-T7.R desbloqueada.

## Ultima tarefa anterior (PR-T7.6)

`PR-T7.6` — Rollback operacional comprovado:
`schema/implantation/T7_ROLLBACK_OPERACIONAL.md` criado — 20 seções; protocolo formal de rollback operacional comprovado antes do go/no-go executivo.
Gatilhos GT-01..GT-12: GT-01..GT-05 imediatos (violação MCMV, falha crítica, promessa indevida, tráfego real não autorizado, veto Vasques) e GT-06..GT-12 por degradação;
Procedimento operacional P-01..P-14 com responsável, tempo máximo e evidência gerada; metas CO-PARCIAL/CO-TOTAL-INTERNO < 5 min; CO-TOTAL-CLIENTE meta < 3 min;
Preservação de estado: lead_state nunca excluído, 7 campos invariantes, shape pós-rollback obrigatório;
Shape de log com 16 campos canônicos; retenção mínima 90 dias; 8 regras de dossiê RD-01..RD-08;
Reversão de flags: 6 flags com estados antes/depois, responsável, evidência e ordem de alteração;
8 cenários de smoke/simulação RBK-01..RBK-08 (um por tipo de gatilho), cada um com objetivo, estado inicial, ação esperada, evidência obrigatória, PASS/FAIL e bloqueia T7.7;
14 critérios de sucesso SUC-01..SUC-14; 11 critérios de falha FAL-01..FAL-11;
Matriz de decisão: 8 condições com rollback aprovado/bloqueia T7.7/exige Vasques/exige investigação/próxima ação;
Payload canônico §15 para T7.7: rollback_approved, rollback_mode_tested, triggers_fired, procedure_completed, smoke_results, state_preserved, log_preserved, dossier_preserved, success_criteria, blocking_items, recommendation;
CA-T7.6-01..19 todos satisfeitos; B-T7.6-01..14 declarados; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero rollback real; zero cutover real; zero canary real; zero WhatsApp real; zero reply_text; zero fact_*. PR-T7.7 desbloqueada.

## Ultima tarefa anterior (PR-T7.5)

`PR-T7.5` — Cutover parcial ou total governado:
`schema/implantation/T7_CUTOVER_GOVERNADO.md` criado — 19 seções; protocolo formal de cutover antes de rollback comprovado.
Pré-condições CC-01..CC-14 com checklist; 4 modos de cutover (CO-PARCIAL, CO-TOTAL-INTERNO, CO-TOTAL-CLIENTE, CO-NOGO);
Caminho A (progressivo: parcial→total-interno→total-cliente) e Caminho B (total-interno direto com justificativa formal);
MET-01..10 com thresholds distintos por modo; MET-03/08/09 zero absoluto em todos os modos;
Gate CUTOVER_GATE_STATUS com 6 estados (blocked/ready/approved/no_go/in_progress/completed) e transições formais;
8 travas TR-01..TR-08 contra entrada real sem decisão formal;
Rollback de cutover RC-01..RC-08 e procedimento RK-1..RK-11 (preservar logs/lead_state/dossiê, nunca apagar evidência);
Matriz de decisão formal por condição (parcial/total/exige Vasques/exige T7.6/próxima ação);
Payload canônico §14 para T7.6: approved_for_rollback_proof, cutover_mode_selected, cutover_gate_status, metrics_summary, rollback_requirements;
CA-T7.5-01..21 todos satisfeitos; B-T7.5-01..14 declarados; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero cutover real; zero canary real; zero WhatsApp real; zero reply_text; zero fact_*. PR-T7.6 desbloqueada.

## Ultima tarefa anterior (PR-T7.4)

`PR-T7.4` — Canary interno e pré-produção:
`schema/implantation/T7_CANARY_INTERNO.md` criado — 18 seções; protocolo formal de canary interno antes de cutover.
Pré-condições PC-01..PC-12 com checklist e evidência exigida; ambientes AMB-01..04 com proibições absolutas;
Volumes Caminho A (A0 0% → A1 5% → A2 20% → A3 50% → A4 100% interno) e Caminho B (B0/B1 comprimido);
MET-01..10 com thresholds por etapa (avançar/pausar/rollback); MET-03/08/09 zero absoluto em todas as etapas;
Critérios de pausa PAU-01..PAU-12 com distinção pausa vs rollback; rollback ROL-01..08 e procedimento R1..R10;
Janela de observação: 24h mínimo / 50 turnos (A1) até 1.000 turnos (A4) / grupos A..I obrigatórios por janela;
Matriz de aprovação: técnico para A1/A2; Vasques obrigatório para A3/A4/Caminho B/cliente real/cutover; veto Vasques soberano;
Relação Caminho A vs B: B nunca dispensa smoke/rollback/telemetria/go-no-go/decisão humana;
Payload canônico §13 para T7.5: approved_for_cutover, cutover_mode, metrics_summary, incidents, rollbacks_triggered, recommendation;
CA-T7.4-01..20 todos satisfeitos; B-T7.4-01..15 declarados; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero shadow real; zero canary real; zero cutover; zero WhatsApp real; zero reply_text; zero fact_*. PR-T7.5 desbloqueada.

## Ultima tarefa anterior (PR-T7.3)

`PR-T7.3` — Matriz de divergências e hardening:
`schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` criado — 17 seções; classificação formal de divergências e hardening antes de canary/cutover.
12 categorias DIV-MA..DIV-BA (DIV-RM e DIV-BA: bloqueantes absolutos com ação `block` e decisão Vasques obrigatória);
Graduação S0–S4 com regras de elevação automática e relação severidade→decisão;
6 decisões canônicas (accept, accept_with_note, fix_required, investigate, block, defer) com restrições e shapes;
20 hardenings catalogados HD-T73-001..020 em 9 tipos (HD-PROMPT, HD-POLICY, HD-STATE, HD-FUNIL, HD-DOC, HD-CANAL, HD-OBS, HD-ROLLBACK, HD-OPR);
Hardenings DIV-RM obrigatórios HD-T73-001..005 e DIV-BA HD-T73-006..009 com `bloqueia_t74: true`;
12 bloqueios absolutos BLK-T73-01..12; 12 critérios de liberação para T7.4; relação Caminho A vs B;
Payload canônico de saída para T7.4: approved_for_canary, canary_mode, unresolved_divergences, accepted_risks, required_hardenings, blocking_items, recommendation;
CA-T7.3-01..15 todos satisfeitos; B-T7.3-01..12 declarados; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero shadow real; zero canary; zero cutover; zero WhatsApp real; zero reply_text; zero fact_*. PR-T7.4 desbloqueada.

## Ultima tarefa anterior (PR-T7.2)

`PR-T7.2` — Shadow/simulação controlada:
`schema/implantation/T7_SHADOW_SIMULACAO.md` criado — 15 seções; simulação controlada antes de clientes reais.
9 grupos (A topo/abertura, B estado civil/composição, C renda/regime/IR, D restrição/elegibilidade, E documentos/dossiê,
F canal/mídia/WhatsApp simulado, G aprovação/reprovação/visita, H regressão T1–T6, I adversarial/fala indevida);
70 cenários com IDs, fonte contratual, PASS/FAIL, divergência candidata e bloqueio T7.3 declarado;
9 tipos TIP-01..09 (sintético, histórico replay, adversarial, regressão, canal, dossiê, MCMV, objeção, finalização);
MET-01..10 com thresholds Caminho A e Caminho B; logs com 19 campos + extensões;
12 gatilhos de congelamento FREEZE-01..12 (incluindo violação MCMV, reply_text mecânico, WhatsApp real, src/);
Saída para T7.3: payload com divergence_id, category_candidate (DIV-MA..DIV-BA), severity, recommendation;
CA-T7.2-01..15 todos satisfeitos; B-T7.2-01..12 declarados; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero shadow real; zero canary; zero cutover; zero WhatsApp real; zero reply_text; zero fact_*. PR-T7.3 desbloqueada.

## Ultima tarefa anterior (PR-T7.1)

`PR-T7.1` — Pré-flight de go-live e travas operacionais:
`schema/implantation/T7_PREFLIGHT_GO_LIVE.md` criado — 15 seções; condições mínimas de go-live mapeadas.
Feature flags (ENOVA2_ENABLED, CANARY_PERCENT, CHANNEL_ENABLED, SHADOW_MODE, CUTOVER_MODE, ROLLBACK_FLAG);
Fallback para estado anterior (lead_state preservado, logs imutáveis, dossiê preservado);
Métricas MET-01..MET-10 com thresholds Caminho A e Caminho B;
Logs com 19 campos obrigatórios por turno; retenção mínima; formato de evidência de rollback;
Comparação T1–T6: critérios de paridade por contrato; camada de comparação declarativa para T7.2;
Bloqueios B-T7.1-01..12 (inclui bloqueio absoluto vs. MCMV, vs. reply_text mecânico, vs. cliente real sem G7);
CA-T7.1-01..12 todos satisfeitos; Bloco E com Fechamento permitido: sim.
Zero src/; zero runtime; zero shadow/canary/cutover real; zero WhatsApp real; zero reply_text; zero fact_*. PR-T7.2 desbloqueada.

## Ultima tarefa anterior (PR-T7.0)

`PR-T7.0` — Abertura formal do contrato T7:
`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` — skeleton substituído por contrato formal completo.
24 seções: objetivo, escopo, fora de escopo, dependências, entradas, saídas S1–S8, CA-T7-01..12,
provas P-T7-01..07, bloqueios B-T7-01..10, quebra PRs T7.0–T7.R, caminhos A e B (gradual e arrojado),
gate G7, legados, referências, adendos, Bloco E.
Contexto operacional: Enova ainda NÃO atende clientes reais — T7 é preparação e liberação de go-live.
Caminho A (gradual): T7.1→T7.2→T7.3→T7.4→T7.5→T7.6→T7.7→T7.R.
Caminho B (arrojado): cutover total antes de clientes reais se pré-flight, rollback e go/no-go passarem.
Zero src/; zero runtime; zero shadow/canary real; zero reply_text; zero fact_*. PR-T7.1 desbloqueada.

## Ultima tarefa anterior (PR-T6.R)

`PR-T6.R` — Readiness/Closeout G6:
`schema/implantation/READINESS_G6.md` criado — readiness formal da T6; G6 APROVADO.
Smoke S1–S9: 9/9 PASS; CA-T6-01..10: 10/10 PASS; B-T6-01..10: 10/10 desbloqueados;
BLQ-01..15: 15/15 satisfeitos; adendos A00-ADENDO-01/02/03 respeitados em toda T6.
Contrato T6 arquivado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`.
Skeleton T7 criado: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`.
Lacunas não bloqueantes: STT (T6-LA-01), OCR (T6-LF-01), AT-05 (normativa MCMV).
Zero src/; zero runtime; zero canal real; zero reply_text; zero fact_*; zero shadow/canary/cutover. PR-T7.0 desbloqueada.

## Ultima tarefa anterior (PR-T6.9)

`PR-T6.9` — Suite declarativa de testes/sandbox multicanal:
`schema/implantation/T6_SUITE_TESTES_MULTICANAL.md` criado — suite de validação declarativa T6.2–T6.8.
Princípio central: "Teste valida governança — não cria runtime."
53 cenários declarativos em 9 grupos (A–H + I):
Grupo A (texto puro): A-01..A-05; Grupo B (imagem/PDF/doc): B-01..B-08;
Grupo C (áudio): C-01..C-06; Grupo D (sticker/mídia inútil): D-01..D-06;
Grupo E (adapter Meta/WhatsApp): E-01..E-06; Grupo F (dossiê/correspondente): F-01..F-08;
Grupo G (aprovação/reprovação/visita): G-01..G-04; Grupo H (regressão T1-T5): H-01..H-05;
Grupo I (cliente some/reenvio/follow-up): I-01..I-05;
Matriz de cobertura T6.2–T6.8 + T4/T3/T2/T5; 13 invariantes INV-01..13;
Critérios globais PASS (PF-01..10) / FAIL (FL-01..12);
15 bloqueantes BLQ-01..15 para PR-T6.R; 20 proibições PROB-T69-01..20;
13 critérios CA-T6.9-01..13; Bloco E §24 com estado completo.
Zero src/; zero runtime; zero sandbox real; zero reply_text; zero fact_*; zero READINESS_G6. PR-T6.R desbloqueada.

## Ultima tarefa anterior (PR-T6.8)

`PR-T6.8` — Dossiê operacional e link do correspondente:
`schema/implantation/T6_DOSSIE_OPERACIONAL.md` criado — contrato declarativo do dossiê operacional.
Regra-mãe: "Dossiê organiza, não decide. Não escreve reply_text, não decide stage, não cria fact_*."
14 estados; DS-01..08; docs mínimos CLT/servidor/aposentado/autônomo/MEI/empresário/informal;
RC-F5-36/35/37/38; benefícios não financiáveis; SL-01..10; ENV-01..08; RET-01..08; RET-03;
VIS-01..08; REP-01..08; 17 eventos de auditoria; PROB-DOS-01..20; CA-T6.8-01..21; Bloco E §27.
Zero src/; zero fact_*; zero reply_text; zero dossiê real; zero runtime. PR-T6.9 desbloqueada.

## Ultima tarefa anterior (PR-T6.7)

`PR-T6.7` — Adapter Meta/WhatsApp governado:
`schema/implantation/T6_ADAPTER_META_WHATSAPP.md` criado — contrato declarativo do adapter.
Regra-mãe: "Adapter é canal, não cérebro. Adapter não escreve reply_text, não decide stage,
não cria fact_*, não valida documento, não transcreve áudio, não interpreta aprovação. Só transporta."
Fluxo inbound 16 etapas: validação assinatura → dedupe → idempotência → extração identificadores
→ normalização AdapterEventoBruto → T6_SURFACE_CANAL → T4 → LLM → T4.4 → outbound;
Fluxo outbound 11 etapas: IntencaoEnvioOutbound → payload técnico Meta → rate limit → retry → envio;
13 invariantes INV-AD-01..13; WH-01..07 (challenge); SIG-01..09 (assinatura);
IDP-01..10 (idempotência); DD-01..08 (dedupe por wa_message_id);
RTI-01..03 + RTO-01..09 (retry); 14 erros ERR-AD-01..14;
RL-01..07 (rate limit); MID-01..14 (mídia roteada T6.3/T6.4/T6.5/T6.6);
ST-01..08 (status events como system_event); §18 separação canal/cérebro;
SEC-01..10 (segurança mínima + variáveis conceituais); 13 eventos de observabilidade;
20 proibições PROB-AD-01..20; 21 critérios CA-T6.7-01..21; Bloco E §26 com 25 evidências.
Zero src/; zero fact_*; zero reply_text; zero webhook real; zero env/secret; zero runtime. PR-T6.8 desbloqueada.

## Ultima tarefa anterior (PR-T6.6)

`PR-T6.6` — Sticker, mídia inútil e mensagens não textuais:
`schema/implantation/T6_STICKER_MIDIA_INUTIL.md` criado — contrato declarativo para sujeira de canal.
Princípio-mãe: "Sujeira de canal não é decisão. Sticker não confirma dado. Emoji não decide stage.
Mídia inútil não quebra funil. Tudo passa pela mesma governança T6_SURFACE_CANAL → T4 → T3 → T2 → T5."
21+ subtipos em 9 categorias: sticker, emoji/reação, imagem sem doc, print confuso, áudio inaudível,
mídia repetida, arquivo corrompido, mensagem vazia/fraca, mídia ambígua/sem dono;
fluxo EM-01..EM-06: Recepção → Classificação de utilidade → Definição de risco → Entrega T4 →
Conduta LLM → Persistência limitada;
attachment shape para mídia inútil com `utility_classification` e `risk_flags[]`;
8 limites de persistência LP-01..08; 20 proibições PROB-STK-01..20;
20 critérios CA-T6.6-01..20; Bloco E §23 com 25 evidências.
Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime. PR-T6.7 desbloqueada.

## Ultima tarefa anterior (PR-T6.5)

`PR-T6.5` — Áudio no mesmo cérebro conversacional:
`schema/implantation/T6_AUDIO_CEREBRO_CONVERSACIONAL.md` criado — contrato declarativo de áudio.
Regra-mãe: "Áudio é entrada conversacional. Não é cérebro. Não escreve reply_text. Não decide stage."
Fluxo EA-01..EA-08: Recepção → Lacuna STT → Transcrição como hipótese → Classificação conversacional
→ Extração de candidatos a fato → Validação T4/T3/T2 → Resposta via LLM → Falha/áudio ruim;
15+ tipos de áudio por qualidade e conteúdo conversacional;
âncora T2_POLITICA_CONFIANCA §3.3 — O3 AUDIO_TRANSCRIPT: audio_good→captured / audio_medium→captured/low / audio_poor→hypothesis;
7 níveis de confiança declarados (audio_unavailable, transcription_unavailable, low/medium/high, partial, conflicting);
14 informações críticas com confirmação obrigatória (renda, regime, estado civil, restrição, CPF/RG, etc.);
STT como lacuna futura T6-LA-01 (transcript_text=null; sistema continua sem transcrição);
13 casos problemáticos tratados; 20 proibições PROB-AUD-01..20; 23 critérios CA-T6.5-01..23;
Bloco E §19 com 25 evidências.
Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero STT real. PR-T6.6 desbloqueada.

## Ultima tarefa anterior (PR-T6.4)

`PR-T6.4` — Pipeline de imagem/PDF/documento:
`schema/implantation/T6_PIPELINE_IMAGEM_PDF.md` criado — pipeline declarativo de imagem/PDF/documento.
Fluxo EP-01..EP-07: Recepção → Classificação hipotética → Associação P1/P2/P3 → Validação declarativa
→ Estado documental → Contexto T4/LLM → Referência dossiê futuro;
19+ tipos de entrada cobertos (imagens, PDFs, casos especiais); 11 estados de T6.3 reaproveitados;
classificação hipotética com fontes e limites; 14 casos problemáticos tratados (ilegível, protegido,
corrompido, duplicado, vencido, sem dono, CNPJ, benefício assistencial, etc.);
relação com T6.8 (dossiê operacional); 20 proibições PROB-PIP-01..20;
OCR como lacuna futura; Bloco E §19 com 26 evidências.
Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero OCR real. PR-T6.5 desbloqueada.

## Ultima tarefa anterior (PR-T6.3)

`PR-T6.3` — Contrato de anexos e documentos:
`schema/implantation/T6_CONTRATO_ANEXOS_DOCUMENTOS.md` criado — governança documental de anexos MCMV.
35+ tipos documentais aceitos (identificação, residência, renda por regime, docs civis, regularização, informativos);
11 estados documentais (received, classified_hypothesis, needs_owner, needs_review, accepted_for_dossier,
rejected_unreadable, rejected_wrong_type, duplicate, expired_or_outdated, informational_only, pending_replacement);
associação P1/P2/P3 + multi-renda/multi-regime (RC-F5-38); 18 perfis/regime documentados;
14 finalidades documentais; regras de validade declarativa (prazo, legibilidade, completude);
OCR e classificação automática declarados como lacunas futuras (T6-LF-01..07);
18 proibições absolutas PROB-AD-01..18; 10 riscos com mitigação; 20 critérios de aceite.
Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime. PR-T6.4 desbloqueada.

## Ultima tarefa anterior (PR-T6.2)

`PR-T6.2` — Surface única de canal:
`schema/implantation/T6_SURFACE_CANAL.md` criado — contrato declarativo da camada de entrada única.
8 input_types: text, document, image, audio, sticker, button_or_link, system_event, unknown_or_invalid;
shape SurfaceEventNormalizado com ~20 campos + sub-shape NormalizedInput;
10 invariantes INV-SC-01..10 (sem reply_text, sem fact_*, sem decisão de stage, sem T3/T2/T5 paralelos);
13 proibições absolutas PROB-SC-01..13;
routing: Canal bruto → Surface → SurfaceEventNormalizado → TurnoEntrada(T4.1) → T4_PIPELINE_LLM;
regra-mãe confirmada: "T6 não cria outro cérebro".
Zero src/; zero fact_*; zero runtime; zero reply_text; zero decisão de stage. PR-T6.3 desbloqueada.

## Ultima tarefa anterior (PR-T6.1)

`PR-T6.1` — Pré-flight cirúrgico de riscos herdados T5:
`schema/implantation/T6_PREFLIGHT_RISCOS_T5.md` criado:
AT-01 CORRIGIDO — ponteiro F2 §3.1 "divorciado"/"viúvo" agora apontam corretamente para F5 (RC-F5-36/35);
AT-03 ANTECIPADO — §2.5 nota preventiva sobre separado(a) sem averbação adicionada em F2; dois caminhos; referência cruzada F5 RC-F5-37; sem fact_*;
AT-04 EXPLICITADO — RC-F5-38 multi-renda/multi-regime adicionada em F5; VS-F5-13; AP-F5-19; 38 regras; 23 itens validação;
AT-05 — lacuna normativa planejada; sem ação; frente futura.
Zero src/; zero fact_*; zero runtime; zero reply_text. PR-T6.2 desbloqueada.

## Ultima tarefa anterior (PR-T6.0)

`PR-T6.0` — Abertura formal do contrato T6:
`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` criado: §1–§17 + Bloco E;
regra-mãe "T6 não cria outro cérebro — tudo que entra por canal passa pela mesma governança T1→T2→T3→T4→T5";
11 PRs declaradas (T6.0–T6.9 + T6.R); CA-T6-01..10; B-T6-01..10 (B-T6-04 = bloqueio permanente canal paralelo);
gate G6 "multimodal sob mesma governança"; riscos R-T6-01..10; conformidade A00-ADENDO-01/02/03 declarada;
AT-01/03/04 a tratar em PR-T6.1 (pré-flight cirúrgico); AT-05 lacuna normativa planejada através de T6;
inventário explicitamente fora de escopo. Contrato T6 ABERTO. PR-T6.1 desbloqueada.

## Ultima tarefa anterior (PR-T5.R)

`PR-T5.R` — Readiness / Closeout G5:
`schema/implantation/T5_READINESS_CLOSEOUT_G5.md` criado:
Smoke S1–S8 8/8 PASS; CA-01..CA-10 10/10 CUMPRIDOS; CE-01..CE-09 9/9 satisfeitas;
4 atenções aceitas por Vasques (AT-01/03/04/05 — não bloqueantes); 0 bloqueantes;
veredito G5: PRONTO COM ATENÇÃO — APROVADO; inventário fora de escopo deliberado;
soberania LLM verificada; zero fact_*/current_phase novos; zero src/runtime/Supabase.
Contrato T5 ENCERRADO e arquivado. G5 APROVADO. PR-T6.0 autorizada.

## Ultima tarefa anterior (PR-T5.8)

`PR-T5.8` — Plano declarativo de shadow/sandbox F1–F5:
`schema/implantation/T5_PLANO_SHADOW_SANDBOX.md` criado:
48 cenários declarativos (SHD-A-01..03 F1; SHD-B-04..10 F2; SHD-C-11..26 F3; SHD-D-27..29 F4;
SHD-E-30..48 F5); pré-condições PC-01..08 (declarativas) + PC-F-01..06 (futuras runtime);
matriz de evidências 15 campos; 16 critérios de sucesso (CS-01..16); 8 critérios de falha (CF-01..08);
tratamento AT-01 (ponteiro F2 averbação), AT-03 (separado sem averbação timing), AT-04 (regime
múltiplo implícito), AT-05 (base normativa — lacuna planejada, não bloqueante); 7 riscos controlados
(RC-01..07); 8 riscos bloqueantes (RB-01..08); 9 condições de entrada para PR-T5.R (CE-01..09);
zero runtime; zero fact_* inventado; zero inventário; zero regra comercial nova.

## Ultima tarefa anterior (PR-T5.7)

`PR-T5.7` — Matriz de paridade funcional F1–F5:
`schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` criado:
Validação declarativa cruzada de 43 stages (F1:7, F2:7, F3:21, F4:3, F5:5); 8/8 current_phase
canônicos cobertos; 6 estados civis; 14 regimes + benefícios; dossiê completo (21 itens);
correspondente/visita/finalização verificados; 54+ lacunas aceitas (F1-LF-01..02, F2-LF-01..05,
F3-LF-01..09, F4-LF-01..08, F5-LF-01..35); 4 atenções identificadas (AT-01, AT-03, AT-04, AT-05 — não bloqueantes);
0 bloqueantes; veredito: PODE SEGUIR COM ATENÇÃO; PR-T5.8 / PR-T5.R autorizados.

## Ultima tarefa anterior (PR-T5.6-fix)

`PR-T5.6-fix` — Correção cirúrgica de documentos civis finos da fatia F5:
`schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` corrigido:
3 regras comerciais adicionadas (RC-F5-35: viúvo/certidão de óbito; RC-F5-36: divorciado/certidão
com averbação; RC-F5-37: separado sem averbação/dois caminhos — regularizar ou seguir em conjunto);
4 lacunas declaradas (LF-32: certidão de óbito; LF-33: certidão com averbação; LF-34: separado
sem averbação; LF-35: regularização pendente); 2 VS + 3 AP + 3 SYN + 4 validações cruzadas;
Bloco E atualizado; zero fact_* criado; inventário não incluído; união estável e P3/familiar
não reabertos. PR-T5.7 autorizada após merge.

## Ultima tarefa anterior (PR-T5.6)

`PR-T5.6` — Contrato declarativo da fatia F5: documentação / dossiê / correspondente / visita / handoff:
`schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` criado:
contrato declarativo completo da fatia F5 (current_phase: docs_prep → docs_collection →
broker_handoff → awaiting_broker → visit_conversion); 5 stages cobertos (envio_docs,
agendamento_visita, aguardando_retorno_correspondente, finalizacao, finalizacao_processo);
9 fatos T2 canônicos (Groups IX, X + derived: fact_doc_identity_status, fact_doc_income_status,
fact_doc_residence_status, fact_doc_ctps_status, fact_docs_channel_choice, fact_visit_interest,
fact_current_intent, derived_doc_risk, derived_dossier_profile); 28 lacunas de schema futuras
(LF-01..28); 33 regras comerciais Vasques (RC-F5-01..33); regra-mãe: Enova conduz para análise,
não pede permissão; coleta ativa (não passiva); 3 follow-ups obrigatórios antes do plantão;
toda aprovação vira agendamento de visita com todos os decisores; critério rigoroso
finalizacao_processo (respostas curtas não disparam encerramento); 6 OBR + 2 CONF + 6 SGM +
5 ROT + 10 VS; 15 anti-padrões; 10 cenários sintéticos; 18 validações cruzadas; Bloco E completo.
PR-T5.7 desbloqueada após merge.

## Ultima tarefa anterior (PR-T5.5)

`PR-T5.5` — Contrato declarativo da fatia F4: elegibilidade / restrição:
`schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` criado:
contrato declarativo completo da fatia F4 (current_phase: qualification/qualification_special →
docs_prep na saída positiva); 3 stages ativos cobertos (restricao, regularizacao_restricao,
fim_inelegivel); 2 stages fora do recorte ativo documentados como opcionais/futuros
(verificar_averbacao, verificar_inventario); 3 fatos T2 canônicos (Group VII + derived);
8 lacunas de schema futuras (LF-01..08); 8 regras comerciais Vasques documentadas (RC-F4-01..08);
regra canônica: restrição declarada NÃO é bloqueio automático; fim_inelegivel é temporário;
divergência com mapa legado documentada e justificada (RC-F4-01 supersede mapa); 2 OBR +
2 CONF + 3 SGM + 2 ROT + 6 VS; 10 anti-padrões; 7 cenários sintéticos; 15 validações cruzadas;
Bloco E completo. PR-T5.6 desbloqueada após merge.

## Ultima tarefa anterior (PR-T5.4)

`PR-T5.4` — Contrato declarativo da fatia F3: renda / regime / composição:
`schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` criado:
contrato declarativo completo da fatia F3 (current_phase: qualification / qualification_special);
21 stages legados cobertos; 16 fatos/derived T2 canônicos (Groups IV–VIII); 9 lacunas de schema
futuras (LF-01..09, incluindo LF-05 benefício não financiável, LF-09 desempregado enum gap);
18 regras comerciais Vasques documentadas (RC-F3-01..18); 9 obrigações T3 (OBR-F3-01..09
incluindo cross-fatia F2→F3 dependente); 5 confirmações (CONF-F3-01..05); 7 sugestões
mandatórias (SGM-F3-01..07); 3 roteamentos (ROT-F3-01..03); 6 vetos suaves; 14 critérios
de saída; 10 anti-padrões; 10 cenários sintéticos; 26 validações cruzadas; Bloco E completo.
PR-T5.5 desbloqueada após merge.

## Ultima tarefa anterior (PR-T5.3)

`PR-T5.3` — Contrato declarativo da fatia F2: qualificação inicial / composição familiar:
`schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` criado:
contrato declarativo completo da fatia F2 (current_phase: qualification); 7 stages legados
cobertos (estado_civil, confirmar_casamento, interpretar_composicao, confirmar_avo_familiar,
dependente, financiamentos_conjunto, quem_pode_somar); 8 fatos/derived T2 canônicos
(Groups III e VIII); 5 lacunas de schema futuras (LF-01..05, incluindo LF-05 base normativa
MCMV/CEF); 9 regras comerciais Vasques documentadas (§5); 5 classes de política T3
(OBR-F2-01..03, CONF-F2-01/02, SGM-F2-01..05, ROT-F2-01/02); nota bloqueio LF-01;
7 cenários sintéticos (SYN-F2-01..07); 21 itens de validação cruzada; Bloco E completo.
PR-T5.4 desbloqueada após merge.

## Ultima tarefa anterior (PR-T5.2-fix)

`PR-T5.2-fix` — Correção das premissas de topo e RNM em T5_FATIA_TOPO_ABERTURA.md:
`schema/implantation/T5_FATIA_TOPO_ABERTURA.md` corrigido (v2): (1) removida premissa de
"confirmar intenção de compra" — F1 identifica contexto inicial suficiente; curiosidade,
simulação e dúvida são entradas válidas; fact_customer_goal status mínimo = captured;
(2) regra RNM corrigida — apenas validade indeterminada (sem data de vencimento) aceita
para financiamento; validade determinada (com data, mesmo não expirada) = bloqueio;
LF-02 declarada para distinção determinada/indeterminada (sem criar fact_*);
(3) CONF-F1-01 rebaixada de hard para soft; OBR-F1-02 ajustada;
(4) SYN-F1-03/05/06 reescritos; BLQ-F1-01 nota LF-02 adicionada;
(5) 2 novas provas P-T5-04/05; 3 novos itens §13.
PR-T5.3 desbloqueada após merge.

## Ultima tarefa anterior (PR-T5.2)

`PR-T5.2` — Contrato da fatia F1 topo/abertura/primeira intenção:
`schema/implantation/T5_FATIA_TOPO_ABERTURA.md` criado: contrato declarativo completo da
fatia F1 (current_phase: discovery); 7 stages legados cobertos (inicio..inicio_tem_validade);
6 fatos/derived T2 canônicos (fact_lead_name, fact_customer_goal, fact_nationality,
fact_rnm_status, derived_rnm_required, derived_rnm_block); LF-01 declarada (data validade
RNM — lacuna de schema futura; fact_rnm_status="vencido" captura o efeito);
5 classes de política T3 (4 obrigações, 3 confirmações, 1 bloqueio hard BLQ-F1-01
R_ESTRANGEIRO_SEM_RNM, 3 sugestões mandatórias, 1 roteamento);
3 vetos suaves (VS-F1-01..03); 6 critérios de saída mensuráveis;
relação completa com pipeline T4; 10 classes de risco; 10 anti-padrões;
7 cenários sintéticos (SYN-F1-01..07);
validação cruzada 18 itens confirmados; Bloco E + provas P-T5-01..03 PASS.
PR-T5.3 desbloqueada.

## Ultima tarefa anterior

`PR-T5.1` — Mapa de fatias do funil core e ordem de migração:
`schema/implantation/T5_MAPA_FATIAS.md` criado: 45 stages legados mapeados para 5 fatias core
(F1: 7 stages / discovery, F2: 7 stages / qualification, F3: 21 stages /
qualification+qualification_special, F4: 5 stages / elegibilidade, F5: 5 stages /
docs+handoff); fase informativa/comercial transversal (7 campos — 2 com fact_key T2
confirmada: fact_has_fgts + fact_entry_reserve_signal; 5 lacunas informativas futuras);
critérios de entrada/saída por fatia; fatos mínimos T2 + políticas T3 + relação T4 por
fatia; 8 correções de tipo semântico (legacy expected NUMBER → boolean/enum correto);
10 anti-padrões proibidos (AP-01..AP-10); validação cruzada T2/T3/T4 (15 entradas);
grafo de dependências de migração; Bloco E completo. PR-T5.2 desbloqueada.

## Ultima tarefa anterior

`PR-T5.0` — Abertura formal do contrato T5:
`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` substituído:
skeleton → contrato completo com §1–§17 + Bloco E; objetivo T5: migração do
funil core por fatias declarativas sem if/else de fala; 10 PRs mapeadas
(T5.0–T5.8 + T5.R); saídas S1–S9 declaradas; CA-01..CA-10 definidos;
B-01..B-10 (bloqueios incluindo B-04 if/else de fala = não conformidade
imediata e B-07 Meta/WhatsApp proibido antes G5); gate G5 (paridade
funcional = cobertura de casos, não paridade de fala); conformidade
A00-ADENDO-01/02/03 declarada; _INDEX, STATUS e LATEST atualizados.
PR-T5.1 desbloqueada.

## Ultima tarefa anterior

`PR-T4.R` — Readiness/Closeout G4:
`schema/implantation/READINESS_G4.md` criado: smoke S1–S6 (6/6 PASS);
CA-01..CA-10 (10/10 CUMPRIDOS); 5 microetapas T4 cobertas; coerência
cross-artefato verificada em 10 invariantes + 8 transições de pipeline;
soberania LLM intacta (zero reply_text mecânico em qualquer artefato/resultado);
fallback 4/4 com FB-INV-01..04 confirmados; bateria E2E 10 cenários (CA-09);
zero lacunas bloqueantes; 5 lacunas não bloqueantes (LNB-G4-01..05) todas
intencionais; decisão G4 APROVADO; contrato T4 encerrado via
CONTRACT_CLOSEOUT_PROTOCOL e arquivado; skeleton T5 criado; PR-T5.0 desbloqueada.

## Ultima tarefa anterior

`PR-T4.6` — Bateria E2E sandbox + latência/custo:
`schema/implantation/T4_BATERIA_E2E.md` criado: 10 cenários declarativos completos —
E2E-PC-01..04 (pipeline_completo: APPROVE CLT, REQUIRE_REVISION autônomo VC-06,
PREVENT_PERSISTENCE confirmed indevido VC-07, REJECT colisão silenciosa VC-04);
E2E-FB-01..04 (fallback: erro_modelo retry_llm_safe, formato_invalido sem retry,
omissao_campos request_reformulation, contradicao_seria via T4.3→T4.4→T4.5);
E2E-BD-01 (borda: APPROVE + ACAO_AVANÇAR_STAGE + L3 snapshot via snapshot_candidate);
E2E-BD-02 (regressão: VC-01 REJECT reply_text mecânico detectado).
Cada cenário contém: prior state, TurnoEntrada, LLMResult simulado, LLMResponseMeta,
ProposedStateDelta, PolicyDecisionSet, ValidationResult, PersistDecision, rota,
TurnoRastro/FallbackTrace, métricas declarativas, critérios PASS.
Adicionalmente: §7 cobertura artefatos T4.1..T4.5; §8 CA-01..09 9/9; §9 fallback 4/4;
§10 métricas consolidadas; §11 anti-padrões; §12 cross-ref 20 dimensões; §13 microetapas;
Bloco E completo.
PR-T4.R desbloqueada.

## Ultima tarefa anterior

`PR-T4.5` — Fallbacks de segurança:
`schema/implantation/T4_FALLBACKS.md` criado: 4 cenários obrigatórios (erro_modelo,
formato_invalido, omissao_campos, contradicao_seria); shapes `FallbackContext`,
`FallbackDecision`, `FallbackTrace`; regra de não uso de `reply_text` rejeitado
(FB-INV-01); fallback nunca promete aprovação (FB-INV-02), nunca avança stage
(FB-INV-03), nunca persiste fato `confirmed` (FB-INV-04); retry seguro único apenas
para `erro_modelo` (FB-RETRY-01); FallbackTrace obrigatório em todo acionamento
(FB-INV-07); 13 anti-padrões AP-FB; 5 exemplos sintéticos FB-E1..FB-E5; microetapa 5
coberta; Bloco E.
PR-T4.6 desbloqueada.

## Ultima tarefa anterior

`PR-T4.4` — Resposta final + rastro + métricas mínimas:
`schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` criado: regras de entrega condicional
de `reply_text` (`reply_routing = "T4.4"` → entrega; `REJECT/T4.5"` → não entrega); T4.4
nunca escreve/edita/substitui `reply_text`; shape `TurnoRastro` com 15 campos; métricas
mínimas declarativas (latência total/LLM, tokens input/output/total, validation_result,
persist_decision, facts_persisted_count, facts_blocked_count, reply_routing); camadas
L1/L2/L3/L4 com regras de atualização pós-turno; TurnoRastro como auditoria pura (não
fonte de fala); tratamento declarativo de erro de canal; RR-INV-01..12; 13 anti-padrões
AP-RR; 5 exemplos sintéticos; microetapa 4 coberta; Bloco E.
PR-T4.5 desbloqueada.

## Ultima tarefa anterior

`PR-T4.3` — Validação policy engine + reconciliação antes de persistir:
`schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` criado: `ProposedStateDelta` com regras
de construção (VP-DELTA-01..05); reconciliação T2.4 integrada com `ConflictRecord` canônico;
`ValidationContext` montado com `LLMResponseMeta` (nunca `reply_text` bruto); validador
VC-01..09 executado em totalidade; `PersistDecision` com 4 resultados; `safe_fields`/
`blocked_fields` por regra de confiança/VC; REJECT→revert+T4.5; PREVENT_PERSISTENCE→campos
bloqueados+reply_text entregue via T4.4; T4.3 não reescreve nem entrega reply_text;
VP-INV-01..12; 12 anti-padrões AP-VP; 5 exemplos sintéticos; microetapa 3 coberta; Bloco E.
PR-T4.4 desbloqueada.

`PR-T4.2` — Pipeline LLM com contrato único (anteriormente):
`schema/implantation/T4_PIPELINE_LLM.md` criado: shape `PipelinePrompt` com 4 blocos
(§SYS, §CTX com 7 subseções, §POL opcional, §OUT); invariante de ordem dos blocos;
`LLMCallContract` com única chamada LLM por turno; `LLMResult` com `reply_text` IMUTÁVEL
após captura — rota direta para T4.4, nunca transita por T4.3; `facts_updated_candidates`
sempre `source:"llm_collected"`, `confirmed:false`; 6 tipos de `ParseError`; malformed →
fallback imediato, nunca retry; §OUT instrui formato, nunca conteúdo; LLP-INV-01..10;
12 anti-padrões AP-LLP; 5 exemplos sintéticos; microetapa 2 coberta; Bloco E.
PR-T4.3 desbloqueada.

`PR-T4.1` — Padronização da entrada do turno (anteriormente):
`schema/implantation/T4_ENTRADA_TURNO.md` criado: shape `TurnoEntrada` com 6 campos
obrigatórios (turn_id, case_id, message_text, channel, lead_state, current_objective);
4 campos opcionais (attachments, prior_decisions, soft_vetos_ctx, context_override);
sequência de validação V1–V6; montagem de `ContextoTurno`; 13+ campos proibidos com
códigos TE-*; 10 regras invioláveis TE-INV-01..10; 12 anti-padrões AP-TE;
5 exemplos sintéticos; validação cruzada T1/T2/T3; microetapa 1 coberta; Bloco E.
PR-T4.2 desbloqueada.

`PR-T4.0` — Abertura formal do contrato T4 (anteriormente):
`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` preenchido com corpo completo
(§1–§17 + Bloco E): objetivo do orquestrador de turno; shapes TurnoEntrada e TurnoSaida;
pipeline 8 etapas; 10 critérios de aceite CA-01..CA-10; quebra de PRs T4.0–T4.R;
gate G4 definido; fallbacks documentados; Bloco E aplicado. PR-T4.1 desbloqueada.

`PR-T3.R` — Readiness/Closeout de G3 (anteriormente):
`schema/implantation/READINESS_G3.md` criado: smoke documental S1–S5 (5/5 PASS);
coerência verificada em 11 dimensões; cenários sintéticos V1/V2/V3 (3/3 PASS);
critérios CA-01..CA-10 (10/10 CUMPRIDOS); zero lacunas bloqueantes; 5 lacunas
não bloqueantes (LNB-01..05) declaradas e justificadas. G3 APROVADO.
Contrato T3 ENCERRADO e arquivado. Skeleton T4 criado. PR-T4.0 desbloqueada.

## O que a PR-T4.5 fechou

- Criou `schema/implantation/T4_FALLBACKS.md` com:
  - §2 Condições de acionamento: 5 triggers, caminhos direto (T4.2→T4.5) e via T4.4;
  - §3 Shapes: `FallbackContext` (sem `reply_text`), `FallbackDecision` (lead_state_change="none"),
    `FallbackTrace` (lead_state_preserved invariante), `ErrorDetail`, `ResponseStrategy`;
  - §4 Cenários obrigatórios (4): `erro_modelo` (§4.1), `formato_invalido` (§4.2),
    `omissao_campos` (§4.3), `contradicao_seria` (§4.4);
  - §5 Resposta segura: retry LLM único apenas para `erro_modelo` (FB-RETRY-01);
    proibições absolutas (aprovação, stage, confirmed, template dominante);
  - §6 Rastro e métricas: `FallbackTrace` obrigatório (FB-INV-07); métricas mínimas;
    relação com `TurnoRastro`;
  - §7 Regra de não uso de `reply_text` rejeitado: FB-INV-01 + AP-FB-01 + §7.3;
  - §8 FB-INV-01..12; §9 AP-FB-01..13; §10 5 exemplos FB-E1..E5;
  - §11 Cross-ref T1/T2/T3/T4.1..T4.4 em 14 dimensões; §12 microetapa 5 coberta;
  - Bloco E completo.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T4.5; próximo → PR-T4.6.

## O que a PR-T4.6 fechou

- Criou `schema/implantation/T4_BATERIA_E2E.md` com:
  - §1 Tabela geral 10 cenários: ID, categoria, trigger/decisão, rota, result;
  - §2 Convenções: métricas declarativas, prior_state simplificado, critérios globais G-01..G-08;
  - §3 Estrutura de cada cenário (8 campos obrigatórios);
  - §4 Cenários pipeline_completo (§4.1–§4.4): E2E-PC-01 APPROVE CLT apply_full→T4.4;
    E2E-PC-02 REQUIRE_REVISION autônomo VC-06 apply_partial→T4.4;
    E2E-PC-03 PREVENT_PERSISTENCE VC-07 apply_partial→T4.4;
    E2E-PC-04 REJECT VC-04 colisão silenciosa revert→T4.5;
  - §5 Cenários fallback (§5.1–§5.4): E2E-FB-01 erro_modelo retry_llm_safe (único retry);
    E2E-FB-02 formato_invalido sem retry request_reformulation;
    E2E-FB-03 omissao_campos request_reformulation;
    E2E-FB-04 contradicao_seria REJECT via T4.3→T4.4→T4.5;
  - §6 Cenários borda/regressão: E2E-BD-01 APPROVE + ACAO_AVANÇAR_STAGE + L3 snapshot
    (profile_summary de snapshot_candidate — nunca de reply_text);
    E2E-BD-02 regressão VC-01 REJECT reply_text mecânico;
  - §7 Cobertura artefatos T4.1..T4.5 (5/5 cobertos);
  - §8 CA-01..09 9/9 cobertos; §9 fallback 4/4; §10 métricas declarativas consolidadas;
  - §11 anti-padrões verificados (AP-TE, AP-LLP, AP-VP, AP-RR, AP-FB);
  - §12 cross-ref T1/T2/T3/T4.1..T4.5 em 20 dimensões; §13 microetapas cobertas;
  - Bloco E completo — PR-T4.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T4.6; próximo → PR-T4.R.

## O que a PR-T4.R fechou

- Criou `schema/implantation/READINESS_G4.md` com:
  - §1 Smoke documental S1–S6 — 6/6 PASS;
  - §2 CA-01..CA-10 — 10/10 CUMPRIDOS com evidência por critério;
  - §3 Coerência cross-artefato: 8 transições de pipeline + 10 invariantes verificados;
  - §4 Soberania LLM: intacta; zero reply_text mecânico em resultados E2E;
  - §5 Zero lacunas bloqueantes; 5 não bloqueantes (LNB-G4-01..05);
  - §6 Decisão formal G4 APROVADO;
  - §7 Encerramento contrato T4 via CONTRACT_CLOSEOUT_PROTOCOL;
  - §8 Conformidade A00-ADENDO-01/02/03; §9 Bloco E.
- Arquivou contrato T4 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md`.
- Criou skeleton T5 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md`.
- Atualizou `schema/contracts/_INDEX.md`: T4 encerrado/arquivado; T5 skeleton ativo; PR-T5.0 próximo passo.

## O que a PR-T4.R não fechou

- Não abriu T5 com corpo completo (skeleton criado — PR-T5.0 preencherá).
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G5 não aberto.

## O que a PR-T4.6 não fechou

- Readiness G4 → PR-T4.R.
- Nenhum runtime/código (`src/`).
- G4 não fechado (encerrado por PR-T4.R).

## O que a PR-T4.5 não fechou

- Bateria E2E sandbox → PR-T4.6.
- Readiness G4 → PR-T4.R.
- Nenhum runtime/código (`src/`).
- G4 não fechado.

## Proximo passo autorizado

PR-T5.0 — Abertura formal do contrato T5 (`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md`).

Leituras obrigatórias para PR-T5.0:
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T5
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §L (PRs T5)
3. `schema/contracts/_INDEX.md`
4. `schema/implantation/READINESS_G4.md` (gate de entrada T5)
5. `schema/CONTRACT_SCHEMA.md`
6. Adendos A00-ADENDO-01/02/03

---

## O que a PR-T3.R fechou

- Criou `schema/implantation/READINESS_G3.md` com:
  - §1 Smoke documental S1–S5 — 5/5 PASS (T3_CLASSES, T3_REGRAS_CRITICAS, T3_ORDEM,
    T3_VETO_SUAVE, T3_SUITE_TESTES);
  - §2 Coerência verificada em 11 dimensões (classes↔regras, fact_keys↔dicionário,
    política_confiança↔disparo, pipeline↔prioridade, colisões↔regras, PolicyDecisionSet,
    ValidationContext↔lead_state, cobertura_cruzada, LLM-first, soberania_LLM, MCMV);
  - §3 Cenários sintéticos V1/V2/V3 (4 regras simultâneas, validador VC-09, RC-INV-03) — 3/3 PASS;
  - §4 Critérios de aceite CA-01..CA-10 — 10/10 CUMPRIDOS;
  - §5 Lacunas: zero bloqueantes; 5 não bloqueantes (LNB-01..05) declaradas e justificadas;
  - §6 Decisão formal G3 APROVADO;
  - §7 Encerramento de contrato T3 (checklist CONTRACT_CLOSEOUT_PROTOCOL);
  - §8 Skeleton T4; §9 Conformidade com adendos; Bloco E.
- Arquivou contrato T3 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md`.
- Criou skeleton T4 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md`.
- Atualizou `schema/contracts/_INDEX.md`: T3 encerrado/arquivado; T4 skeleton ativo; PR-T4.0 próximo passo.

## O que a PR-T3.R nao fechou

- Não abriu T4 com corpo (skeleton criado — PR-T4.0 preencherá).
- Não implementou orquestrador de turno.
- Não alterou `src/`, `package.json`, `wrangler.toml`.
- G4 não aberto.

## O que a PR-T2.R fechou

- Criou `schema/implantation/READINESS_G2.md` com:
  - §1 Smoke documental PR-T2.0 a PR-T2.5 — 6/6 PASS;
  - §2 Verificação de coerência em 8 dimensões (dict↔lead_state↔política↔reconciliação↔resumo;
    nomes canônicos; separação tipos; LLM-first; snapshot≠lead_state; sobrescrita silenciosa;
    inferência≠confirmed; E1≠arquitetura);
  - §3 Cenários sintéticos V1/V2/V3 (conflito origem, áudio ruim, snapshot vs. fact) — 3/3 PASS;
  - §4 Verificação dos 8 critérios de aceite do contrato T2 — 8/8 CUMPRIDOS;
  - §5 Lacunas identificadas: 5 não bloqueantes declaradas com justificativa; zero bloqueantes;
  - §6 Decisão formal G2 APROVADO;
  - §7 Encerramento de contrato T2 (checklist CONTRACT_CLOSEOUT_PROTOCOL);
  - §8 Bloco E: fechamento permitido; PR-T3.0 desbloqueada.
- Arquivou contrato T2 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`.
- Atualizou status do contrato T2 ativo para ENCERRADO.
- Criou skeleton T3 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md`.
- Atualizou `schema/contracts/_INDEX.md`: T2 encerrado/arquivado; T3 skeleton ativo; PR-T3.0 próximo passo.

## O que a PR-T2.R nao fechou

- Contrato T3 com corpo (PR-T3.0 preencherá).
- Nenhuma implementação T3 (policy engine real, regras, guardrails).
- G3 não aberto.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T2.5 fechou

`PR-T2.5` — resumo persistido + compatibilidade E1→E2: `schema/implantation/T2_RESUMO_PERSISTIDO.md`
criado com 4 camadas de memória (L1 curto prazo / L2 factual estruturada / L3 snapshot executivo /
L4 histórico frio); protocolo de snapshot com 7 eventos de trigger, shape completo SnapshotExecutivo,
o que entra/não entra; 7 regras anti-contaminação (RC-AN-01..07); memória Vasques (RV-01..07);
aprendizado sem script (RA-01..05); tabela E1→E2 (27 campos + 7 descartados + stages);
10 casos sintéticos SP-01..SP-10; 12 anti-padrões AP-RP-01..12; 10 regras RP-01..10.
PR-T2.R desbloqueada.

## O que a PR-T2.5 fechou

- Criou `schema/implantation/T2_RESUMO_PERSISTIDO.md` com:
  - §1 Quatro camadas de memória (L1/L2/L3/L4) com definições, limites e regras;
  - §2 Protocolo de snapshot: 7 eventos de trigger, o que entra/não entra, shape completo
    SnapshotExecutivo com `approval_prohibited = true` invariante;
  - §3 Regras anti-contaminação de facts (RC-AN-01..07) + hierarquia de precedência de leitura;
  - §4 Memória Vasques — 4 tipos, 7 regras de limite e auditabilidade (RV-01..07);
  - §5 Aprendizado por atendimento — 5 regras RA-01..05, como existe sem virar script;
  - §6 Compatibilidade transitória E1→E2: 7 princípios (RB-01..07), tabela 27 campos,
    7 campos descartados, tabela de stages E1→current_phase E2, como preservar sem manter vício;
  - §7 Cobertura das 5 microetapas do mestre (§4 e §5 cobertas aqui);
  - §8 10 casos sintéticos SP-01..SP-10 (conversa longa, retorno tardio, snapshot conflitante,
    campo sem equivalente E2, campo derivável, L4 auditoria, Vasques prioridade, aprendizado,
    resumo com aprovação bloqueada, migração sem vício);
  - §9 12 anti-padrões AP-RP-01..AP-RP-12;
  - §10 10 regras invioláveis RP-01..RP-10;
  - §11 Amarração ao lead_state v1 e artefatos T2;
  - §12 Bloco E: fechamento permitido; PR-T2.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.5 executada; próximo passo PR-T2.R.

## O que a PR-T2.5 nao fechou

- READINESS_G2.md — smoke documental de todos os 6 artefatos T2 e decisão formal G2 — escopo PR-T2.R.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado (requer PR-T2.R).

## O que a PR-T2.4 fechou

- Criou `schema/implantation/T2_RECONCILIACAO.md` com:
  - §1 Tipologia formal de 7 estados com definições e regras internas;
  - §2 Protocolo de reconciliação em 7 etapas com fluxograma ASCII;
  - §3 Hierarquia de prioridade por origem (não automática);
  - §4 10 domínios específicos de reconciliação (renda, estado civil, regime de trabalho,
    composição/P2, IR autônomo, restrição, RNM, áudio ruim, nota Vasques vs confirmed,
    documento ilegível);
  - §5 10 casos sintéticos RC-01..RC-10 com passo a passo;
  - §6 Tabela completa de transições de status com condições e autoridade;
  - §7 12 anti-padrões AP-01..AP-12;
  - §8 10 regras invioláveis RC-01..RC-10;
  - §9 Mapeamento ao lead_state v1 e política de confiança;
  - §10 Bloco E: fechamento permitido; PR-T2.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.4 executada; próximo passo PR-T2.5.

## O que a PR-T2.4 nao fechou

- T2_RESUMO_PERSISTIDO.md — escopo T2.5.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado.

## O que a PR-T2.3 fechou

- Criou `schema/implantation/T2_POLITICA_CONFIANCA.md` com:
  - 6 origens canônicas cobertas: texto explícito, texto indireto, áudio (3 níveis), documento,
    inferência (mecânica + LLM), nota manual Vasques;
  - Mapa de transição de status por origem (§4 — tabela);
  - Lista canônica de 12 fatos críticos (§5);
  - Condições de confirmação obrigatória (§6 — 7 situações);
  - Condições de geração de conflito (§7 — com proibição de conflito silencioso);
  - Condições de bloqueio de avanço de stage (§8 — 6 condições);
  - 9 valores canônicos de `FactEntry.source` (§9.1);
  - 5 casos sintéticos de validação (§10: S1–S5);
  - Amarração ao lead_state v1 (§11);
  - 12 regras invioláveis PC-01..PC-12;
  - Cobertura das 5 origens do mestre + Vasques (§13);
  - Bloco E: fechamento permitido; PR-T2.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.3 executada; próximo passo PR-T2.4.

## O que a PR-T2.3 nao fechou

- Reconciliação formal e mecanismo de resolução de conflito — escopo T2.4.
- Tipologia detalhada bruto/confirmado/hipótese/pendência no lead_state — escopo T2.4.
- T2_RESUMO_PERSISTIDO.md — escopo T2.5.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado.

## O que a PR-T2.2 fechou

- Criou `schema/implantation/T2_LEAD_STATE_V1.md` com:
  - 11 blocos canônicos: CaseMeta, OperationalState (11 campos do mestre PDF6), FactBlock (35 fact_*
    por grupo I–X com status canônicos), DerivedBlock (9 derived_* com condições de derivação),
    Pending (6 PEND_* tipos), Conflicts (4 CONF_* tipos + protocolo de resolução), SignalBlock (6
    signal_*), HistorySummary (4 camadas + shape snapshot executivo), VasquesNotes (shape auditável),
    NormativeContext (referência compartilhada);
  - 12 regras invioláveis LS-01..LS-12;
  - Tabela de mapeamento campo ↔ fato canônico ↔ regra T0;
  - Tabela de compatibilidade transitória E1→E2;
  - Bloco E: fechamento permitido; PR-T2.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.2; próximo passo PR-T2.3.

## O que a PR-T2.2 nao fechou

- Não criou T2_POLITICA_CONFIANCA.md (política de confiança por origem — escopo T2.3).
- Não detalhando tipologia completa bruto/confirmado/hipótese/pendência (escopo T2.4).
- Não criou T2_RESUMO_PERSISTIDO.md (escopo T2.5).
- Não implementou Supabase real.
- Não alterou `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T2.1 fechou

- Criou `schema/implantation/T2_DICIONARIO_FATOS.md` com:
  - 50 chaves canônicas: 35 `fact_*`, 9 `derived_*`, 6 `signal_*`;
  - Auditoria E1→E2 completa (42 campos): renomeados, eliminados como primários, rebaixados a derived/signal;
  - 7 categorias de memória (atendimento, normativa/MCMV, comercial, manual Vasques, regras funil, aprendizado, telemetria);
  - Limites LLM-first por categoria + 10 regras invioláveis (M-01..M-10);
  - Tabela E1→E2 consolidada (§5);
  - Cobertura das 5 microetapas do mestre declarada;
  - Bloco E: fechamento permitido; PR-T2.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T2 → em execução; próximo passo PR-T2.2.

## O que a PR-T2.1 nao fechou

- Não criou T2_LEAD_STATE_V1.md (schema estrutural — escopo T2.2).
- Não implementou Supabase real.
- Não alterou `src/`, `package.json`, `wrangler.toml`.
- Tipologia completa de status do fato (bruto/confirmado/inferência/hipótese/pendência) em T2.4.

## O que a PR-T2.0 fechou

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` com corpo completo (CONTRACT_SCHEMA.md):
  - §1 Objetivo; §2 Escopo; §3 Fora de escopo; §4 Dependências; §5 Entradas; §6 Saídas;
  - §7 Critérios de aceite (8 verificáveis); §8 Provas obrigatórias; §9 Bloqueios (8 condições);
  - §10 Próximo passo; §11 Relação A01; §12 Relação legados; §13 Referências; §14 Blocos legados;
  - §15 Ordem mínima de leitura; §16 Quebra de PRs T2.0–T2.R; §17 Gate G2.
  - Adendos A00-ADENDO-01/02/03 declarados.
- Atualizou `schema/contracts/_INDEX.md`: T2 aberto; PR-T2.1 próximo passo.
- Bloco E: fechamento permitido; PR-T2.1 desbloqueada.

## O que a PR-T2.0 nao fechou

- Não criou artefatos de execução T2 (T2_DICIONARIO_FATOS, T2_LEAD_STATE_V1, etc.) — esses são escopo T2.1+.
- Não implementou Supabase real.
- Não alterou `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T1.R fechou

- Criou `schema/implantation/READINESS_G1.md` com:
  - Smoke documental de PR-T1.0 a PR-T1.5 — 6/6 PASS;
  - Verificação dos 12/12 critérios de aceite do contrato T1 com evidência por critério;
  - Validação de coerência entre artefatos em 5 dimensões: camadas↔system prompt, taxonomia↔contrato
    de saída, comportamentos↔contrato de saída, comportamentos↔camadas, regras T0↔taxonomia↔camadas;
  - Verificação dos adendos A00-ADENDO-01/02/03 em todos os artefatos T1;
  - 4 lacunas identificadas e classificadas como não bloqueantes (L18 não transcrito; runtime
    não testado; TurnoSaida sem schema concreto; 32 casos vs. "20-30" — supera o mínimo);
  - 3 casos sintéticos cobrindo 3 dimensões: estilo (aprovação), regra (casado civil), saída (conflito IR);
  - Decisão formal G1 APROVADO com justificativa;
  - Bloco E: fechamento permitido; PR-T2.0 desbloqueada.
- Encerrou contrato T1 via CONTRACT_CLOSEOUT_PROTOCOL.md: checklist completo; critérios cumpridos; evidências declaradas.
- Arquivou contrato T1 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`.
- Criou skeleton T2 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Atualizou `schema/contracts/_INDEX.md`: T1 encerrado/arquivado; T2 skeleton ativo; PR-T2.0 próximo passo.

## O que a PR-T1.R nao fechou

- Nao abriu T2 com corpo completo (skeleton criado — PR-T2.0 preencherá).
- Nao implementou LLM real.
- Nao criou schema Supabase (escopo T2).
- Nao criou policy engine (escopo T3).
- Nao alterou `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T4.3 fechou

- Criou `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` com:
  - §1 Posição no pipeline: Etapa 4 de 5 (pós-LLM, pré-resposta); tabela de entradas/saídas;
  - §2 Shape `ProposedStateDelta`: `FactDeltaEntry[]`, regras VP-DELTA-01..05;
    nunca `confirmed` de `llm_collected`; nunca `reply_text` no delta;
  - §3 Reconciliação T2.4 integrada: protocolo por fato, `ConflictRecord` gerado para
    `confirmed` contradito, sem sobrescrita silenciosa, VP-CONFL-01..04;
  - §4 Montagem de `ValidationContext`: shapes canônicos de T3.4; `LLMResponseMeta`
    sem `reply_text` bruto; `PolicyDecisionSet` pré-computado (sem re-execução T3);
    VP-VC-01..05;
  - §5 Execução validador VC-01..09: tabela resumo severidade/FAIL; ordem sequencial;
    lógica de decisão agregada REJECT > PREVENT_PERSISTENCE > REQUIRE_REVISION > APPROVE;
  - §6 `PersistDecision` + `ValidationResult`: shape completo; mapeamento decision→action;
    `reply_routing` (`REJECT→T4.5`; demais→T4.4);
  - §7 `safe_fields` / `blocked_fields`: regras de determinação; VP-STATUS-01/02;
    elevação para `confirmed` só em turno subsequente com origem ≥ EXPLICIT_TEXT;
  - §8 Conflitos (§8.1) e colisões (§8.2): ConflictRecord para fatos `confirmed` contraditos;
    VP-COL-01/02 para colisões não registradas → REJECT;
  - §9 Aplicação de `PersistDecision` ao `lead_state`: fluxo por decision; REJECT→revert;
    `validation_log` como registro auditável;
  - §10 `reply_text` não reescrito: T4.3 não lê, não reescreve, não entrega; tabela por
    componente; rota determinada por `PersistDecision.reply_routing`;
  - §11 Quando `lead_state` pode ser atualizado: condições suficientes e condições de bloqueio;
  - §12 VP-INV-01..12;
  - §13 12 anti-padrões proibidos AP-VP-01..12;
  - §14 5 exemplos sintéticos (APPROVE, REQUIRE_REVISION/VC-06, PREVENT_PERSISTENCE/VC-07,
    REJECT/VC-04 colisão silenciosa, PREVENT_PERSISTENCE/VC-05 confiança baixa);
  - §15 Microetapa 3 coberta;
  - §16 Validação cruzada T2/T3/T4.1/T4.2 em 18 dimensões;
  - Bloco E: PR-T4.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 PR atual → PR-T4.3; próximo → PR-T4.4.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

## O que a PR-T4.3 nao fechou

- T4_RESPOSTA_RASTRO_METRICAS.md (microetapa 4 — PR-T4.4).
- T4_FALLBACKS.md (microetapa 5 — PR-T4.5).
- T4_BATERIA_E2E.md e READINESS_G4.md.
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

## O que a PR-T4.4 fechou

- Criou `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` com:
  - §1 Posição no pipeline: Etapa 5 de 5; tabela entradas/saídas;
  - §2 Regras de entrega condicional de `reply_text`: flowchart por `reply_routing`;
    T4.4 não escreve/edita/substitui; tabela por ValidationResult; roteamento T4.5;
    tratamento declarativo de erro de canal; RR-ROUT-01/02; RR-CANAL-01/02;
  - §3 Shape `TurnoRastro` com 15 campos: turn_id, case_id, channel, validation_result
    (ValidationResultSummary), persist_decision (PersistDecisionSummary),
    policy_decisions_applied, facts_persisted, facts_blocked, conflicts_registered
    (ConflictRef[]), reply_routing, channel_delivery_status, channel_error_code,
    latency_ms, latency_llm_ms, tokens_input/output/total, timestamp,
    turn_start_timestamp; RR-RAST-01/02 (`reply_text` nunca em campo operacional);
  - §4 Métricas mínimas: tabela com 10 métricas, campo, origem, descrição; cálculo
    latency_ms; shape TokensUsed; usos futuros declarados;
  - §5 Camadas de memória pós-turno: L1 sempre (RR-L1-01), L2 condicional por
    lead_state_action (RR-L2-01/02), L3 por evento de snapshot (RR-L3-01/02),
    L4 arquivamento automático (RR-L4-01/02); ordem 8 passos pós-turno (§5.6);
  - §6 Distinção TurnoRastro vs. TurnoSaida — artefatos complementares distintos;
  - §7 RR-INV-01..12;
  - §8 12 anti-padrões AP-RR-01..12;
  - §9 5 exemplos sintéticos (APPROVE, REQUIRE_REVISION, PREVENT_PERSISTENCE,
    REJECT não entregue T4.5, APPROVE com snapshot L3);
  - §10 Microetapa 4 coberta;
  - §11 Validação cruzada T1/T2/T3/T4.1/T4.2/T4.3 em 18 dimensões;
  - Bloco E: PR-T4.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 PR atual → PR-T4.4; próximo → PR-T4.5.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

## O que a PR-T4.4 nao fechou

- T4_FALLBACKS.md (microetapa 5 — PR-T4.5).
- T4_BATERIA_E2E.md e READINESS_G4.md.
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

## Proximo passo autorizado

PR-T4.5 — Fallbacks de segurança (`T4_FALLBACKS.md`).

Leituras obrigatórias para PR-T4.5:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S5, §7 CA-08, §16 PR-T4.5)
2. `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` (reply_routing T4.5; TurnoRastro)
3. `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` (REJECT → T4.5; PersistDecision)
4. `schema/implantation/T4_PIPELINE_LLM.md` (erros fatais; ParseError codes)
5. `schema/implantation/T4_ENTRADA_TURNO.md` (erros de entrada → fallback)
6. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
8. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

## O que a PR-T4.2 fechou

- Criou `schema/implantation/T4_PIPELINE_LLM.md` com:
  - §1 Posição no pipeline: Etapa 3 de 5 (após montagem de ContextoTurno, antes de policy/validação);
  - §2 Shape `PipelinePrompt` com 4 blocos de ordem inviolável: §SYS (contrato cognitivo),
    §CTX (ContextoTurno serializado em 7 subseções), §POL (decisões/vetos, opcional),
    §OUT (schema de saída esperada — instrui formato, nunca conteúdo);
  - §3 Definição detalhada de cada bloco: §CTX 7 subseções (turno_atual, fatos_confirmados,
    fatos_pendentes, conflitos, histórico, vetos_suaves, objetivo_operacional);
    §OUT JSON schema instruction com reply_text, facts_updated, confidence,
    next_objective_candidate;
  - §4 `LLMCallContract`: model_id, max_tokens, temperature, turn_id, case_id, raw_response,
    latency_ms, tokens_used, call_timestamp, error?; invariante de 1 chamada por turno;
    malformed → fallback imediato, nunca retry;
  - §5 `LLMOutputRaw` e `LLMResult`: reply_text (IMUTÁVEL), facts_updated_candidates
    (sempre source:"llm_collected"/confirmed:false), confidence, next_objective_candidate?,
    parse_successful, parse_errors[], latency_ms, tokens_used, call_timestamp; 6 ParseError
    codes (INVALID_JSON, MISSING_REPLY_TEXT, UNKNOWN_FACT_KEY, INVALID_OBJ_TYPE,
    INVALID_CONFIDENCE_SCORE, EXTRA_FIELDS);
  - §6 Captura do reply_text com invariante de imutabilidade; 5 rotas de fallback por tipo
    de erro fatal; proibição de improviso de reply_text;
  - §7 Captura parcial de TurnoSaida: tabela LLM produz × mecânico produz;
  - §8 Tratamento de saída malformada: 5 fatais (INVALID_JSON, MISSING_REPLY_TEXT,
    LLM_TIMEOUT, LLM_UNAVAILABLE, LLM_RATE_LIMIT) + 4 não fatais (UNKNOWN_FACT_KEY,
    EXTRA_FIELDS, INVALID_OBJ_TYPE, INVALID_CONFIDENCE_SCORE);
  - §9 Separação de componentes com diagrama de roteamento: reply_text → T4.4 direto;
    facts_updated_candidates → T4.3; confidence → T4.4+T4.3; next_objective_candidate → T4.3;
    parse_errors não fatais → T4.4 rastro; métricas → T4.4 TurnoRastro;
  - §10 Invariante de não sobrescrita do reply_text: tabela de conformidade por componente;
  - §11 10 regras invioláveis LLP-INV-01..10;
  - §12 12 anti-padrões proibidos AP-LLP-01..12;
  - §13 5 exemplos sintéticos (E1 CLT normal, E2 reply_text ausente, E3 campos extras,
    E4 veto suave ativo, E5 T4.3 bloqueia persistência mas reply_text entregue);
  - §14 Cobertura de microetapa 2 confirmada;
  - §15 Validação cruzada T1/T2/T3/T4.1 em 17 dimensões;
  - Bloco E: PR-T4.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 PR atual → PR-T4.2; próximo → PR-T4.3.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa = PR-T4.2.

## O que a PR-T4.2 nao fechou

- T4_VALIDACAO_PERSISTENCIA.md (microetapa 3 — PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md (microetapa 4 — PR-T4.4).
- T4_FALLBACKS.md (microetapa 5 — PR-T4.5).
- T4_BATERIA_E2E.md e READINESS_G4.md.
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

## Proximo passo autorizado

PR-T4.3 — Validação policy engine + reconciliação antes de persistir (`T4_VALIDACAO_PERSISTENCIA.md`).

Leituras obrigatórias para PR-T4.3:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S3, §7 CA-04/CA-06, §16 PR-T4.3)
2. `schema/implantation/T4_PIPELINE_LLM.md` (LLMResult — saída que entra no validador)
3. `schema/implantation/T4_ENTRADA_TURNO.md` (prior_decisions, soft_vetos_ctx)
4. `schema/implantation/T3_CLASSES_POLITICA.md` (classes de decisão avaliadas)
5. `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (pipeline de composição)
6. `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (ValidationContext + ValidationResult)
7. `schema/implantation/T2_LEAD_STATE_V1.md` (estado que será ou não atualizado)
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

## O que a PR-T4.1 fechou

- Criou `schema/implantation/T4_ENTRADA_TURNO.md` com:
  - §1 Shape `TurnoEntrada` com 6 campos obrigatórios e 4 opcionais; `ChannelEnum`; invariante global LLM-first;
  - §2 Definição detalhada de cada campo obrigatório: turn_id, case_id, message_text, channel, lead_state, current_objective — com origem, semântica, validação, tratamento de ausência, proibições;
  - §3 Campos opcionais: attachments, prior_decisions, soft_vetos_ctx, context_override — com shapes e regras;
  - §4 13 campos explicitamente proibidos com códigos de erro TE-* canônicos;
  - §5 Sequência de validação V1–V6 com tabela de erros fatais/não-fatais e shapes ValidationError/ValidationWarning;
  - §6 Montagem de `ContextoTurno`: 10 componentes obrigatórios, 5 condicionais, proibições de contexto, shape completo de ContextoTurno;
  - §7 Tabela consolidada de campos ausentes com ação e código;
  - §8 Posição no pipeline do orquestrador (Etapas 1–2 de 5);
  - §9 10 regras invioláveis TE-INV-01..10;
  - §10 12 anti-padrões proibidos AP-TE-01..12;
  - §11 5 exemplos sintéticos (primeiro turno, intermediário, objective ausente, campo proibido, vetos suaves);
  - §12 Cobertura de microetapa 1 confirmada;
  - §13 Validação cruzada T1/T2/T3 em 14 dimensões;
  - Bloco E: PR-T4.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 status → em execução; PR atual → PR-T4.1; próximo → PR-T4.2.

## O que a PR-T4.1 nao fechou

- T4_PIPELINE_LLM.md (microetapa 2 — PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md (microetapa 3 — PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md (microetapa 4 — PR-T4.4).
- T4_FALLBACKS.md (microetapa 5 — PR-T4.5).
- T4_BATERIA_E2E.md e READINESS_G4.md.
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

## Proximo passo autorizado

PR-T4.2 — Pipeline LLM com contrato único (`T4_PIPELINE_LLM.md`).

Leituras obrigatórias para PR-T4.2:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S2, §7 CA-03, §16 PR-T4.2)
2. `schema/implantation/T4_ENTRADA_TURNO.md` (shape ContextoTurno; montagem de entrada)
3. `schema/implantation/T1_CONTRATO_SAIDA.md` (TurnoSaida shape — o que o LLM deve produzir)
4. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` (identidade e papel do LLM)
5. `schema/implantation/T2_LEAD_STATE_V1.md` (estado que o prompt incorpora)
6. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
8. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

## O que a PR-T4.0 fechou

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` com corpo completo (CONTRACT_SCHEMA.md):
  - §1 Objetivo: orquestrador coordena, nunca fala; reply_text exclusivamente do LLM;
  - §2 Escopo: 6 saídas verificáveis (T4_ENTRADA, T4_PIPELINE_LLM, T4_VALIDACAO, T4_RESPOSTA,
    T4_FALLBACKS, READINESS_G4);
  - §3 Fora de escopo: src/, regras de política (T3), schema de estado (T2), speech, canais;
  - §4 Dependências: G3 APROVADO (desbloqueado) + 5 artefatos T3 + TurnoSaida T1;
  - §5 Entradas: TurnoEntrada shape + 5 artefatos de contexto;
  - §6 Saídas S1–S6 com caminho, PR criadora e conteúdo mínimo;
  - §7 Critérios de aceite CA-01..CA-10 (orquestrador mudo, entrada padronizada, LLM único,
    policy integrado, validador pós-LLM, reconciliação antes de persistir, rastro, fallbacks,
    ≥10 E2E, Bloco E em G4);
  - §8 Provas P-T4-01..P-T4-05;
  - §9 Bloqueios B-01..B-05 (B-01/B-02 desbloqueados);
  - §10 Próximo passo: PR-T4.1;
  - §11 A01: T4 semanas 7–8, prioridade 5, G3→G4;
  - §12 Legados aplicáveis com PRs criadoras;
  - §13 Referências: 12 documentos;
  - §14 Blocos legados obrigatórios/complementares;
  - §15 Ordem mínima de leitura por PR;
  - §16 Quebra PRs T4.0–T4.R: 8 PRs com artefato/dependência/microetapa;
  - §17 Gate G4: condições aprovação/reprovação, consequências, artefato READINESS_G4.
  - Bloco E: PR-T4.1 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 aberto; PR-T4.0 executada; PR-T4.1 próximo passo.

## O que a PR-T4.0 nao fechou

- Não criou T4_ENTRADA_TURNO.md (escopo T4.1).
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

## Proximo passo autorizado

PR-T4.1 — Padronização da entrada do turno (`T4_ENTRADA_TURNO.md`).

Leituras obrigatórias para PR-T4.1:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§5 entradas, §7 CA-01/CA-02)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção K — PR-T4.1)
3. `schema/implantation/T1_CONTRATO_SAIDA.md` (TurnoSaida — shape canônico de saída)
4. `schema/implantation/T2_LEAD_STATE_V1.md` (lead_state que entra no turno)
5. `schema/implantation/T3_CLASSES_POLITICA.md` (classes que o pipeline usa)
6. `schema/implantation/READINESS_G3.md` (evidência de G3)
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

## O que a PR-T3.3 fechou

- Criou `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` com:
  - §1 Visão geral do pipeline com 6 estágios numerados (reconciliação → bloqueios →
    confirmações → obrigações → sugestões → roteamentos);
  - §2 Especificação detalhada de cada estágio com pré-condições, regras candidatas,
    ordenação interna e saídas;
  - §3 Princípios canônicos de composição (RC-COMP-01..10) + matriz 5×5 entre classes +
    tabela de prioridade global + lista canônica de criticidade de fato (13 níveis) +
    regra de desempate residual;
  - §4 Oito combinações específicas detalhadas (bloqueio+obrigação, bloqueio+confirmação,
    bloqueio+roteamento, obrigação+confirmação, obrigação+sugestão, múltiplas obrigações,
    múltiplas confirmações, múltiplos roteamentos);
  - §5 Política de colisão com 10 códigos canônicos (COL-BLOCK-OBLIG, COL-BLOCK-ROUTE,
    COL-OBLIG-ROUTE, COL-CONF-ROUTE, COL-CONF-OBLIG, COL-ROUTING-MULTI, COL-OBLIG-OBLIG-PRIO,
    COL-CONF-CONF-LEVEL, COL-RECONCILE-FAIL, COL-INVALID-PHASE) + shape `CollisionRecord` +
    proibição absoluta de colisão silenciosa;
  - §6 Shape `PolicyDecisionSet` com `decisions[]`, `collisions[]`, `evaluation_meta` e
    invariantes;
  - §7 10 cenários sintéticos SC-01..10 (todos os exigidos pelo escopo: casado civil + solo +
    renda baixa, autônomo + IR ausente + renda baixa, estrangeiro sem RNM + outra regra,
    renda fraca + composição sugerida, P3 entrando depois de solo, restrição vs avanço,
    duas obrigações simultâneas, duas confirmações simultâneas, bloqueio + roteamento,
    sugestão competindo com obrigação);
  - §8 Validação cruzada com T3.1, T3.2 e T2 (classes, prioridade, regras críticas, chaves
    canônicas, status, OperationalState);
  - §9 12 anti-padrões AP-OC-01..12 (incluindo AP-OC-10: proibição de inventar regra nova
    nesta camada);
  - §10 Cobertura: microetapas 3 e 4 do mestre T3 cobertas; 1, 2 e 5 declaradas como escopo
    de outras PRs;
  - §11 12 regras invioláveis RC-INV-01..12 (incluindo RC-INV-08: autônomo sem IR não é
    inelegível automático; RC-INV-10: solo baixa nunca emite bloqueio nem seta inelegível);
  - Bloco E: PR-T3.3 fechada; PR-T3.4 desbloqueada.

## O que a PR-T3.3 nao fechou

- T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- READINESS_G3.md (escopo PR-T3.R).
- Nenhuma implementação real em src/. Nenhuma alteração em package.json, wrangler.toml.
- G3 não fechado.

## O que a PR-T3.2 fechou

- Criou `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` com:
  - §1 Tabela-resumo dos 4 regras com rule_id, fatos de entrada, classes emitidas e severidade;
  - §2 R_CASADO_CIVIL_CONJUNTO: fatos `fact_estado_civil` + `fact_process_mode`; 3 decisões
    (confirmação baixa confiança + obrigação); NUNCA emite bloqueio; efeito: `must_ask_now`;
  - §3 R_AUTONOMO_IR: fato `fact_work_regime_p1` + `fact_autonomo_has_ir_p1`; 3 variantes:
    obrigação (ausente), confirmação (parcial/não_informado), sugestão_mandatória ("não" — não
    automático inelegível); NUNCA declara inelegibilidade automática;
  - §4 R_SOLO_BAIXA_COMPOSICAO: fatos `fact_process_mode` + `fact_monthly_income_p1` +
    `derived_composition_needed`; INVARIANTE: NUNCA emite bloqueio; NUNCA seta
    `elegibility_status="ineligible"`; classes: sugestão_mandatória + obrigação;
  - §5 R_ESTRANGEIRO_SEM_RNM: fatos `fact_nationality` + `fact_rnm_status` + derivados;
    3 decisões graduais — confirmação (captured), obrigação (RNM ausente), bloqueio
    (somente quando `nationality.status="confirmed"` e RNM inválido); naturalizado excluído;
  - §6 Tabela de validação cruzada: 10 variantes × fato→classe→efeito;
  - §7 14 chaves canônicas verificadas contra T2_DICIONARIO_FATOS;
  - §8 10 anti-padrões AP-RC-01..10;
  - §9 10 regras invioláveis RC-INV-01..10;
  - §10 Cobertura de microetapas: microetapa 1 coberta; 2/3/4/5 delegadas;
  - Bloco E: PR-T3.2 fechada; PR-T3.3 desbloqueada.

## O que a PR-T3.2 nao fechou

- T3_ORDEM_AVALIACAO_COMPOSICAO.md (microetapas 3 e 4 — escopo PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Nenhuma implementação real em src/. Nenhuma alteração em package.json, wrangler.toml.
- G3 não fechado.

## O que a PR-T3.1 fechou

- Criou `schema/implantation/T3_CLASSES_POLITICA.md` com:
  - Shape `PolicyDecision` com invariante global (sem `reply_text` em nenhum payload de `action`);
  - §2 Classe BLOQUEIO: "bloquear avanço" formal; payload `BloqueioAction`; distinção de veto suave;
  - §3 Classe OBRIGAÇÃO: "exigir ação"; payload `ObrigacaoAction`; diferença de `blocked_by`;
  - §4 Classe CONFIRMAÇÃO: "pedir confirmação"; payload `ConfirmacaoAction`; distinção de obrigação;
  - §5 Classe SUGESTÃO MANDATÓRIA: "apenas orientar"; payload `SugestaoMandatoriaAction`;
  - §6 Classe ROTEAMENTO: "desviar objetivo"; payload `RoteamentoAction`; efeito no lead_state;
  - §7 Prioridade entre classes: bloqueio (1) > obrigação (2) > confirmação (3) > sugestão (4) > roteamento (5);
  - §8 Definições formais dos 4 efeitos operacionais (microetapa 2 do mestre T3 coberta);
  - §9 Integração com lead_state v1: 10 campos e quais classes os modificam;
  - §10 Integração com política de confiança: regras PC-INT-01..05;
  - §11 10 anti-padrões AP-CP-01..10;
  - §12 5 exemplos sintéticos (bloqueio/obrigação/confirmação/sugestão/roteamento);
  - §13 Cobertura de microetapas: microetapa 2 coberta; 1/3/4/5 delegadas;
  - §14 10 regras invioláveis CP-01..10;
  - Bloco E: fechamento PR-T3.1 permitido; PR-T3.2 desbloqueada.

## O que a PR-T3.1 nao fechou

- T3_REGRAS_CRITICAS_DECLARATIVAS.md (microetapa 1 — escopo PR-T3.2).
- T3_ORDEM_AVALIACAO_COMPOSICAO.md (microetapas 3 e 4 — escopo PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Nenhuma implementação real em src/. Nenhuma alteração em package.json, wrangler.toml.
- G3 não fechado.

## O que a PR-T3.0 fechou

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` com corpo completo (CONTRACT_SCHEMA.md):
  - §1 Objetivo: policy engine decide mas não fala; 5 entregas ao final de T3;
  - §2 Escopo: 8 itens verificáveis (T3_CLASSES → T3_REGRAS → T3_ORDEM → T3_VETO → T3_SUITE → READINESS_G3);
  - §3 Fora de escopo: src/, orquestrador T4, Supabase real, reply_text no engine;
  - §4 Dependências: G2 APROVADO (desbloqueado) + T2 encerrado (desbloqueado) + 6 artefatos T2;
  - §5 Entradas: 8 artefatos de entrada com condições;
  - §6 Saídas: S1–S6 com caminho, PR criadora e conteúdo mínimo;
  - §7 Critérios de aceite: CA-01..CA-10 (LLM-first, 4 regras, ordem estável, veto suave, validador, ≥20 testes, coerência lead_state, microetapas);
  - §8 Provas: P-T3-01..P-T3-05;
  - §9 Bloqueios: B-01..B-05 (B-01 e B-02 desbloqueados);
  - §10 Próximo passo: PR-T3.1;
  - §11 A01: T3 semanas 5–6, prioridade 4, G2→G3;
  - §12 Legados: L03 obrigatório + 12 complementares com PR e contexto;
  - §13 Referências: 14 documentos;
  - §14 Blocos legados obrigatórios/complementares com quando consultar;
  - §15 Ordem mínima de leitura por PR;
  - §16 Quebra PRs T3.0–T3.R: 7 PRs com artefato/dependência/microetapa;
  - §17 Gate G3: condições aprovação/reprovação, consequências, artefato READINESS_G3.
  - Bloco E: PR-T3.1 desbloqueada.

## O que a PR-T3.0 nao fechou

- Não criou T3_CLASSES_POLITICA.md (escopo T3.1).
- Não implementou nenhuma regra ou classe de política.
- Não alterou src/, package.json, wrangler.toml.
- G3 não fechado.

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- G1 APROVADO. G2 APROVADO. T3 aberta formalmente.
- G3 aberto — bloqueado até PR-T3.R (readiness de T3).
- PR-T3.1 desbloqueada. PRs T3.2–T3.R ainda bloqueadas.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## O que a PR-T1.3 fechou (historico)

- Criou `schema/implantation/T1_TAXONOMIA_OFICIAL.md` com 6 categorias canônicas (FACTS 18 tipos,
  OBJETIVOS 9, PENDÊNCIAS 6, CONFLITOS 4, RISCOS 8, AÇÕES 11); 48 regras T0 mapeadas; trava
  LLM-first verificada; PR-T1.4 desbloqueada.

## O que a PR-T1.2 fechou (historico)

- Criou `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com:
  - §1 Identidade (TOM): Enova — analista especialista Minha Casa Minha Vida, fala humana, nunca sistema;
  - §2 Papel operacional (REGRA): como o LLM recebe e usa contexto do mecânico sem expô-lo ao cliente;
  - §3 Proibições absolutas (VETO): 5 proibições declarativas sem templates de recusa;
  - §4 Condução em contextos específicos (SUGESTÃO MANDATÓRIA): 7 orientações de conduta sem scripts;
  - §5 Conhecimento especialista (REPERTÓRIO): substrato Minha Casa Minha Vida sem template de uso;
  - §6 Objetivo final: qualificar com inteligência, honestidade e naturalidade;
  - Tabela de conformidade seção × camada;
  - 7 anti-padrões explicitamente proibidos;
  - 6 cenários adversariais documentados sem execução de LLM real;
  - Cobertura de microetapas do mestre verificada;
  - Bloco E com fechamento permitido e PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.2 concluída; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.3 como próximo passo.

## O que a PR-T1.1 fechou (historico)

- Criou `schema/implantation/T1_CAMADAS_CANONICAS.md` com:
  - fundamento normativo canônico (soberania LLM na fala; soberania mecânico na regra);
  - mapa de responsabilidades por camada (proprietário, competência, proibição);
  - definição completa de cada camada: TOM (LLM soberano), REGRA (mecânico soberano),
    VETO (mecânico emite flag, LLM comunica), SUGESTÃO MANDATÓRIA (mecânico instrui→LLM executa),
    REPERTÓRIO (substrato de contexto passivo do LLM);
  - anti-padrões e travas LLM-first por camada;
  - modelo de interação ASCII (mecânico→contexto→LLM→reply_text→canal);
  - classificação completa das 48 regras T0 com camada primária e secundária;
  - sumário: TOM 3, REGRA 28, VETO 8, SUGESTÃO MANDATÓRIA 8, REPERTÓRIO L19+L03;
  - cobertura das microetapas do LEGADO_MESTRE verificada;
  - Bloco E com fechamento permitido e PR-T1.2 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.1 concluída; PR-T1.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.2 como próximo passo.

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- PR-T1.2 desbloqueada. Demais PRs T1.3–T1.R ainda bloqueadas.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## O que a PR-T1.0 fechou (historico)

- Preencheu corpo formal de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - objetivo, escopo, fora de escopo, dependências, entradas, saídas;
  - critérios de aceite (sistema LLM-first, bateria adversarial, soberania de fala);
  - provas obrigatórias;
  - bloqueios;
  - quebra de PRs T1.0–T1.R com artefatos definidos;
  - gate G1 com condições de aprovação e regra de rollback;
  - legados aplicáveis (L03/L19 obrigatórios; L04–L18 complementares);
  - referências obrigatórias (20 documentos);
  - ordem mínima de leitura: L19 → L03.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto formalmente; PR-T1.1 desbloqueada.

## O que a PR-T0.R fechou (historico)

- Criou `schema/implantation/READINESS_G0.md` com:
  - smoke documental de PR-T0.1 a PR-T0.6: todos encerrados com Bloco E;
  - 6/6 criterios de aceite T0 cumpridos;
  - analise dos 7 bloqueantes G0: RZ-TM-01 e RZ-ES-04 satisfeitos; RZ-EL-01, RZ-EL-04,
    RZ-DC-02, RZ-TE-02, RZ-TE-03 declarados com escopo T1+;
  - verificacao de coerencia entre todos os inventarios;
  - 5 limitacoes residuais estruturais declaradas;
  - decisao formal G0 APROVADO COM LIMITACOES RESIDUAIS FORMALMENTE DECLARADAS;
  - encerramento de contrato conforme CONTRACT_CLOSEOUT_PROTOCOL.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - status `encerrado`; PR-T0.R marcada como concluida; T1 autorizada.
- Copiou contrato T0 para `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (skeleton — sem corpo).
- Atualizou `schema/contracts/_INDEX.md`:
  - T0 encerrado/arquivado; T1 skeleton como proximo contrato ativo.

## O que a PR-T0.6 fechou (historico)

- Criou `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` com:
  - 39 itens em 5 classificacoes: 7 DI (desligar imediato pre-T1), 5 RO (redesenho obrigatorio),
    6 CT (convivencia temporaria shadow/canary), 14 MD (migrar e desligar), 7 RC (reaproveitamento);
  - 7 criterios de desligamento canonicos (CDC-01 a CDC-07);
  - mapa de dependencias de fallback (EP/CT-01 → SF-02 → SF-01 → PH-F03);
  - referencia cruzada com MATRIZ_RISCO (PR-T0.5) por item onde aplicavel;
  - soberania LLM-first verificada: DS-DI-01 a DS-DI-07 classificados como imediatos/proibidos;
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.6).
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.6 marcada como concluida; PR-T0.R desbloqueada.

## O que a PR-T1.0 nao fechou

- Nao escreveu prompt, taxonomia, comportamentos ou politicas (T1.1+).
- Nao implementou LLM real.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).

## Proximo passo autorizado

PR-T1.1 — Separação canônica: tom × regra × veto × sugestão × repertório.

Leituras obrigatorias para PR-T1.1:
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T1.1)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/INVENTARIO_REGRAS_T0.md`
7. `schema/implantation/READINESS_G0.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- T1 skeleton aberto. Execucao de T1 bloqueada ate PR-T1.0 preencher o corpo do contrato.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## Atualizacao 2026-04-23 — Abertura formal do contrato T1 (PR-T1.0)

Ultima tarefa relevante:
- `PR-T1.0` — contrato T1 preenchido conforme CONTRACT_SCHEMA.md; PR-T1.1 desbloqueada.

O que esta PR fechou:
- Preencheu corpo de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto.

O que esta PR nao fechou:
- Nenhum entregavel tecnico de T1 (T1.1+). Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.R (readiness e closeout do gate G0)

Ultima tarefa relevante:
- `PR-T0.R` — smoke documental de PR-T0.1 a PR-T0.6; G0 APROVADO; contrato T0 encerrado; T1 skeleton criado.

O que esta PR fechou:
- Criou `schema/implantation/READINESS_G0.md`.
- Encerrou contrato T0; arquivou em `archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou skeleton `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`.
- Atualizou `schema/contracts/_INDEX.md`: T0 encerrado, T1 skeleton ativo.

O que esta PR nao fechou:
- Nao abriu T1 com corpo. Nao implementou desligamento. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T1.0 — Abertura formal da fase T1.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.2 (inventario de regras por familia)

Ultima tarefa relevante:
- `PR-T0.2` — inventario de regras do legado em 7 familias canonicas; 48 regras com bloco legado e status.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_REGRAS_T0.md`.
- Atualizou contrato: PR-T0.2 concluida; PR-T0.3 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.4 — Inventario de canais, superficies e telemetria.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.6 (inventario de desligamento futuro e convivencia)

Ultima tarefa relevante:
- `PR-T0.6` — 39 itens em 5 classificacoes; mapa de dependencias de fallback; 7 CDC canonicos.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`.
- Atualizou contrato: PR-T0.6 concluida; PR-T0.R desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao implementou desligamento. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.R — Readiness e closeout do gate G0.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.5 (matriz de risco operacional do legado vivo)

Ultima tarefa relevante:
- `PR-T0.5` — 26 riscos em 5 categorias; 7 bloqueantes para G0; referencia cruzada PR-T0.1 a PR-T0.4.

O que esta PR fechou:
- Criou `schema/implantation/MATRIZ_RISCO_T0.md`.
- Atualizou contrato: PR-T0.5 concluida; PR-T0.6 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao implementou mitigacao. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.6 — Inventario de desligamento futuro e convivencia.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.4 (inventario de canais, superficies e telemetria)

Ultima tarefa relevante:
- `PR-T0.4` — 28 itens catalogados em 4 tipos (canal, superficie, endpoint, telemetria); bifurcacao
  E1/E2 aplicada; SF-03 fala mecanica classificada morta; fluxo de dados por canal consolidado.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`.
- Atualizou contrato: PR-T0.4 concluida; PR-T0.5 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.5 — Matriz de risco operacional do legado vivo.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.3 (inventario de parsers, heuristicas e branches de stage)

Ultima tarefa relevante:
- `PR-T0.3` — 27 pontos de decisao mecanica catalogados em 5 tipos; bloco legado e regra associada por item.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`.
- Atualizou contrato: PR-T0.3 concluida; PR-T0.4 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.4 — Inventario de canais, superficies e telemetria.

---

## Atualizacao 2026-04-23 — Adendo canônico A00-ADENDO-02 publicado

Ultima tarefa relevante:
- Governança macro — criar adendo canônico forte de soberania LLM-MCMV, amarrar à Bíblia, ao workflow e aos documentos vivos.

O que esta PR fechou:
- Criou `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): identidade da Enova 2 como atendente especialista MCMV, visão LLM-first, divisão canônica LLM × mecânico, guia de leitura T1/T3/T4/T5/T6, proibições formais, reaproveitamento correto da E1.
- Inseriu o A00-ADENDO-02 na cadeia de precedência documental do `schema/CODEX_WORKFLOW.md`.
- Inseriu leituras obrigatórias A00-ADENDO-01 e A00-ADENDO-02 no `schema/CODEX_WORKFLOW.md` e na Bíblia.
- Criou seção S0 na Bíblia com travas LLM-first explícitas para T1, T3, T4, T5 e T6.
- Atualizou `schema/contracts/_INDEX.md`, `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` e `README.md`.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2 / PR-T0.1).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- `PR-T0.1` — inventario legado vivo e mapa de aproveitamento do repo contra o mestre.
- **A PR-T0.1 deve ler obrigatoriamente o A00-ADENDO-02 antes de executar.**

---

## Historico — Atualizacao 2026-04-23 — Workflow macro amarrado operacionalmente (PR anterior)

Ultima tarefa relevante (PR anterior):
- Governanca macro — amarrar operacionalmente no `schema/CODEX_WORKFLOW.md` a Biblia de PRs, templates obrigatorios, gates T0-T7/G0-G7 e regra de excecao contratual.

O que esta PR fechou:
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de leitura previa da PR macro.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de abertura de PR via `schema/execution/PR_EXECUTION_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de fechamento com handoff via `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava formal de excecao contratual com autorizacao manual exclusiva do Vasques.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava explicita de nao pular gates T0-T7/G0-G7.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava de nao misturar escopos e a checagem final obrigatoria de coerencia Biblia + contrato ativo + handoff vivo.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo contra o mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

---

## Atualizacao 2026-04-23 — Internalizacao canonica do reaproveitamento ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no proprio repo a classificacao executiva da base da ENOVA 1 para orientar reaproveitamento sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` com consolidacao canônica interna de:
  - cognitivo util reaproveitavel;
  - mecanico estrutural util reaproveitavel;
  - mecanico de fala explicitamente proibido;
  - riscos de copia sem filtro;
  - blocos prioritarios da ENOVA 1 para absorcao futura.
- Atualizou referencia de evidencia em:
  - `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`;
  - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (PR-T0.1).
- Reforcou diretriz de uso da E1 como materia-prima futura, sem refatoracao funcional agora.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional nem migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo).

---

## Atualizacao 2026-04-23 — Internalizacao canonica do inventario do legado vivo real da ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no repositorio ENOVA 2 o inventario do legado vivo real da ENOVA 1, sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - objetivo e criterio de evidencia do inventario;
  - fluxos vivos reais;
  - stages/estados vivos reais;
  - gates vivos reais;
  - transicoes reais e ativas;
  - blocos inconclusivos;
  - blocos com padrao de residuo/stub/legado morto;
  - divergencias entre documentacao e runtime;
  - implicacoes para T0.1 e conclusao objetiva.
- Reforcou no recorte T0.1 que a internalizacao anterior de reaproveitamento e o novo inventario vivo real sao complementares.
- Atualizou referencias minimas em contrato ativo e Biblia para consolidacao de evidencia T0.1.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional ou migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0 automaticamente.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo), com foco na preparacao de readiness de G0 sem abrir escopo funcional.

---

## Atualizacao 2026-04-23 — Inventario operacional auditavel de T0.1 (continuidade documental)

Ultima tarefa relevante:
- T0 (continuidade documental de `PR-T0.1`) — consolidar matriz de rastreabilidade de fluxos/estados e declarar lacuna remanescente sem fechamento indevido de gate.

O que esta PR fechou:
- Atualizou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - matriz de rastreabilidade operacional (fluxos topo->pos-envio_docs -> bloco legado correspondente);
  - inventario de estados/campos usados com classificacao de prova;
  - checklist de cobertura de `PR-T0.1` e decisao explicita de nao fechamento automatico.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para refletir:
  - `T0-PR1` concluida;
  - `T0-PR2` em execucao (continuidade de `PR-T0.1`);
  - lacuna remanescente documentada para readiness de G0.

O que esta PR nao fechou:
- Nao encerrou `PR-T0.1`.
- Nao fechou G0.
- Nao abriu T1.
- Nao implementou alteracao funcional em runtime.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` ate eliminar a lacuna remanescente de prova para fechamento formal da etapa.
