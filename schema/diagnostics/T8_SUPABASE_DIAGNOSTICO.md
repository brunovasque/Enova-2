# T8_SUPABASE_DIAGNOSTICO — Diagnóstico Supabase Real (PR-T8.7)

---

## §1. Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.7 |
| Tipo | PR-DIAG |
| Fase | T8 |
| Data | 2026-04-29 |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` |
| Base anterior | PR-T8.4 (backend CRM in-process), PR-T8.5 (painel), PR-T8.6 (prova E2E) |
| Próxima PR | PR-T8.8 — Implementação Supabase operacional |
| Autoria | Claude Code (Mini-Enavia) — diagnóstico sem modificação de código |

---

## §2. Objetivo

Mapear o estado real do Supabase necessário para tornar a Enova 2 operacional com persistência real. Esta PR é diagnóstico puro: não cria migration, não altera Supabase, não altera Worker runtime, não implementa conexão real.

---

## §3. Fontes analisadas

| Fonte | Lida | Limitação |
|---|---|---|
| `wrangler.toml` | Sim | Sem bindings Supabase declarados |
| `package.json` | Sim | Sem `@supabase/supabase-js` |
| `src/adapter/runtime.ts` | Sim | `InMemoryPersistenceBackend` — sem Supabase real |
| `src/adapter/types.ts` | Sim | 10 entidades `enova2_*` completamente tipadas |
| `src/crm/types.ts` | Sim | 9 tabelas `crm_*` in-process |
| `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Sim | Schema canônico `enova_*` documentado |
| `schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md` | Sim | 11 tabelas canônicas mapeadas em T8.3 |
| `schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md` | Sim | Inventário completo do repo |
| `schema/diagnostics/T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md` | Sim | Status de aderência T1–T7 |
| Arquivos SQL no repo | Sim | **ZERO arquivos `.sql` encontrados** |
| Painel Supabase real | **Não acessado** | Sem acesso direto ao console/API do Supabase real |
| Schema Supabase real (export DDL) | **Não disponível** | Não foi fornecido; diagnóstico parcial inevitável |

### Declaração obrigatória sobre schema real

> **Schema real do Supabase não confirmado no repo. O diagnóstico abaixo é baseado em evidência do repo (código TypeScript, documentos contratuais, Legado Mestre). Não foram inventadas colunas, tabelas ou schemas reais. A PR-T8.8 depende de confirmação de Vasques sobre: (a) se existe projeto Supabase real, (b) se já existem tabelas criadas, (c) o DDL real das tabelas existentes.**

---

## §4. Estado atual Supabase no repo

### 4.1 Presença de pacote

| Item | Status | Evidência |
|---|---|---|
| `@supabase/supabase-js` | **AUSENTE** | `package.json` lista apenas `tsx` e `typescript` como devDependencies; nenhuma dependência de runtime |
| Migrations SQL | **AUSENTE** | `find . -name "*.sql"` retorna zero resultados; sem pasta `migrations/`, `supabase/`, ou `db/` |
| Scripts de banco | **AUSENTE** | Nenhum script de seed, fixture, ou schema em `scripts/` |
| `.supabase/` local config | **AUSENTE** | Sem configuração local do CLI Supabase |

### 4.2 Bindings e variáveis de ambiente

| Variável | `wrangler.toml` | Configurada em prod | Status |
|---|---|---|---|
| `SUPABASE_URL` | AUSENTE | Desconhecido | **BLOQUEANTE** |
| `SUPABASE_ANON_KEY` | AUSENTE | Desconhecido | **BLOQUEANTE** |
| `SUPABASE_SERVICE_ROLE_KEY` | AUSENTE | Desconhecido | **BLOQUEANTE** |
| `CRM_ADMIN_KEY` | AUSENTE no toml | A configurar via `wrangler secret put` | Parcial |
| `CRM_ALLOW_DEV_TOKEN` | AUSENTE no toml | Apenas para dev | Parcial |

O `wrangler.toml` atual declara apenas `name`, `main`, `compatibility_date` e `[env.test]` — nenhum binding funcional.

### 4.3 Tabelas referenciadas em código TypeScript

Existem **três esquemas em jogo** no repositório, todos in-memory:

#### Schema A: `enova2_*` (Adapter — `src/adapter/`)

10 tabelas tipadas em `src/adapter/types.ts`:

| Tabela | Interface TypeScript | Operações no runtime |
|---|---|---|
| `enova2_lead` | `AdapterLeadRecord` | upsertLead, updateLead, getLead |
| `enova2_lead_state_v2` | `AdapterLeadStateRecord` | writeLeadState, getCurrentLeadState |
| `enova2_turn_events_v2` | `AdapterTurnEventRecord` | writeTurnEvent, getTurnEvents, getTurnEvent |
| `enova2_signal_records_v2` | `AdapterSignalRecord` | writeSignals, updateSignalStatus, getSignalsByLead, getSignalsByTurn |
| `enova2_memory_runtime_v2` | `AdapterMemoryRuntimeRecord` | upsertMemoryRuntime, getActiveMemory (com TTL) |
| `enova2_document_records_v2` | `AdapterDocumentRecord` | upsertDocument, updateDocumentStatus, getDocumentsByLead |
| `enova2_dossier_v2` | `AdapterDossierRecord` | upsertDossier, getDossier |
| `enova2_visit_schedule_v2` | `AdapterVisitScheduleRecord` | writeVisitSchedule, updateVisitStatus, getVisitSchedulesByLead |
| `enova2_operational_history_v2` | `AdapterOperationalHistoryRecord` | appendHistoryEvent, getHistoryByLead |
| `enova2_projection_bridge_v2` | `AdapterProjectionBridgeRecord` | upsertProjection, getProjection |

#### Schema B: `crm_*` (CRM in-process — `src/crm/`)

9 tabelas tipadas em `src/crm/types.ts`, introduzidas em PR-T8.4:

| Tabela | Interface TypeScript | Papel CRM |
|---|---|---|
| `crm_leads` | `CrmLead` | Âncora de lead para o painel |
| `crm_lead_state` | `CrmLeadState` | Estado operacional por lead |
| `crm_turns` | `CrmTurn` | Histórico de conversas |
| `crm_facts` | `CrmFact` | Fatos atômicos (fact_key/fact_value) |
| `crm_documents` | `CrmDocument` | Documentos do lead |
| `crm_dossier` | `CrmDossier` | Dossiê por lead |
| `crm_policy_events` | `CrmPolicyEvent` | Eventos de policy por lead |
| `crm_override_log` | `CrmOverrideLog` | Registro imutável de overrides manuais |
| `crm_manual_mode_log` | `CrmManualModeLog` | Log de ativação/desativação de modo manual |

#### Schema C: `enova_*` (Legado Mestre — canônico contratual)

12 tabelas definidas no `LEGADO_MESTRE_ENOVA1_ENOVA2.md` e no diagnóstico T8.3:

| Tabela canônica | Mapeada para? |
|---|---|
| `enova_leads` | `enova2_lead` + `crm_leads` |
| `enova_sessions` | Sem correspondência direta no repo atual |
| `enova_state_v2` | `enova2_lead_state_v2` + `crm_lead_state` |
| `enova_facts` | `enova2_signal_records_v2` + `crm_facts` |
| `enova_turns` | `enova2_turn_events_v2` + `crm_turns` |
| `enova_policy_events` | `enova2_operational_history_v2` + `crm_policy_events` |
| `enova_memory_snapshots` | `enova2_memory_runtime_v2` |
| `enova_prompt_registry` | Sem correspondência no repo atual |
| `enova_eval_runs` | Sem correspondência no repo atual |
| `enova_rollout_events` | Sem correspondência no repo atual |
| `enova_artifacts` | `enova2_document_records_v2` + `crm_documents` |
| `enova_rollout_incidents` | Sem correspondência no repo atual |

### 4.4 Lacuna crítica identificada: divergência de schemas

O repositório tem **três nomenclaturas paralelas** para as mesmas entidades: `enova_*` (contratual/canonical), `enova2_*` (adapter TypeScript), e `crm_*` (CRM painel). A PR-T8.8 deverá definir o **schema canônico real do Supabase** e unificar as três camadas apontando para o mesmo banco.

---

## §5. Tabelas canônicas necessárias

> **Declaração:** Os campos abaixo são derivados do TypeScript do adapter (`src/adapter/types.ts`) e do Legado Mestre. Não representam um DDL confirmado no Supabase real. Para criar migrations reais, Vasques deve fornecer o schema atual do Supabase (se existir).

### 5.1 Tabela: `enova2_lead` (ou `enova_leads`)

| Campo | Tipo | Observação |
|---|---|---|
| `lead_id` | UUID PK | Gerado pelo sistema |
| `external_ref` | TEXT NULLABLE | wa_id ou referência de canal |
| `customer_name` | TEXT NULLABLE | Nome do cliente |
| `phone_ref` | TEXT NULLABLE | Telefone |
| `status` | TEXT | 'active' \| 'inactive' \| 'archived' |
| `created_at` | TIMESTAMPTZ | Imutável após insert |
| `updated_at` | TIMESTAMPTZ | Atualizado a cada operação |

**Finalidade:** âncora raiz de todas as entidades. Toda operação começa pelo `lead_id`.
**Origem contratual:** Legado Mestre §5.1, T8 §5.3, adapter `src/adapter/types.ts` entidade 1.
**Relação com CRM:** `crm_leads` é a projeção CRM desta tabela — devem ser unificadas em PR-T8.8.
**Relação com Worker:** Worker cria lead no primeiro turno inbound.
**Relação com memória:** Âncora de toda a memória operacional.
**Risco se ausente:** Impossível criar lead persistente. Zero operação real.
**Prioridade PR-T8.8:** CRÍTICO — bloqueia tudo.

---

### 5.2 Tabela: `enova2_lead_state_v2` (ou `enova_state_v2`)

| Campo | Tipo | Observação |
|---|---|---|
| `lead_state_id` | UUID PK | |
| `lead_id` | UUID FK → lead | |
| `stage_current` | TEXT | Soberano do Core — Adapter projeta |
| `stage_after_last_decision` | TEXT | Para auditoria de transição |
| `next_objective` | TEXT | Soberano do Core |
| `block_advance` | BOOLEAN | Soberano do Core |
| `policy_flags_json` | JSONB | Soberano do Core |
| `risk_flags_json` | JSONB NULLABLE | |
| `state_version` | INTEGER | Incremental — nunca decresce |
| `source_turn_id` | UUID FK → turn | |
| `updated_by_layer` | TEXT | 'core' \| 'adapter' |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Finalidade:** estado operacional resumido do lead. Reflexo do que o Core decidiu.
**Origem contratual:** T2 §lead_state_v1, Legado Mestre §5.1 `enova_state_v2`, adapter entidade 2.
**Relação com CRM:** `crm_lead_state` é projeção simplificada para o painel — unificar em PR-T8.8.
**Relação com Worker:** Worker grava estado após cada turno via Core → Adapter.
**Risco se ausente:** Lead perde estado entre sessões. Sem memória entre atendimentos.
**Prioridade PR-T8.8:** CRÍTICO.

---

### 5.3 Tabela: `enova2_turn_events_v2` (ou `enova_turns`)

| Campo | Tipo | Observação |
|---|---|---|
| `turn_id` | UUID PK | |
| `lead_id` | UUID FK → lead | |
| `idempotency_key` | TEXT UNIQUE | Dedup de webhook — evita turno duplicado |
| `channel_type` | TEXT | 'text' \| 'audio' \| 'other' |
| `raw_input_ref` | TEXT NULLABLE | Referência ao input bruto — nunca conteúdo |
| `normalized_input_json` | JSONB | Input normalizado |
| `semantic_package_json` | JSONB | Sinais, intenções, ambiguidades |
| `core_decision_json` | JSONB | Payload completo de decisão do Core |
| `speech_contract_json` | JSONB NULLABLE | Metadados de governança de resposta |
| `turn_sequence` | INTEGER | Sequência por lead |
| `created_at` | TIMESTAMPTZ | Imutável após insert — append-only |

**Finalidade:** trilha completa imutável de cada turno. Auditoria permanente.
**Origem contratual:** T1 `TurnoSaida`, Legado Mestre §5.1 `enova_turns`, adapter entidade 3.
**Relação com CRM:** `crm_turns` é projeção simplificada — unificar.
**Risco se ausente:** Sem histórico de conversas. Impossível auditoria ou rollback investigativo.
**Prioridade PR-T8.8:** CRÍTICO.

---

### 5.4 Tabela: `enova2_signal_records_v2` (ou `enova_facts`)

| Campo | Tipo | Observação |
|---|---|---|
| `signal_id` | UUID PK | |
| `turn_id` | UUID FK → turn | |
| `lead_id` | UUID FK → lead | |
| `signal_type` | TEXT | 'fact' \| 'intent' \| 'question' \| 'objection' \| 'slot_candidate' \| 'pending' \| 'ambiguity' |
| `signal_key` | TEXT | Nome canônico do sinal (fact_key) |
| `signal_value_json` | JSONB | Valor estruturado |
| `confidence_score` | NUMERIC(5,3) | [0.000–1.000] |
| `status` | TEXT | 'accepted' \| 'pending' \| 'requires_confirmation' \| 'slot_candidate' \| 'rejected' |
| `evidence_ref` | TEXT NULLABLE | |
| `confirmed_at` | TIMESTAMPTZ NULLABLE | |
| `rejected_at` | TIMESTAMPTZ NULLABLE | |
| `created_at` | TIMESTAMPTZ | Imutável após insert |

**Finalidade:** fatos atômicos confirmados ou pendentes por lead. Dicionário de fact_* do T2.
**Origem contratual:** T2 §dicionário_fatos (50 chaves: 35 fact_*, 9 derived_*, 6 signal_*).
**Relação com CRM:** `crm_facts` é projeção simplificada — unificar.
**Risco se ausente:** Lead perde fatos entre sessões. Coleta de dados reinicia do zero.
**Prioridade PR-T8.8:** CRÍTICO.

---

### 5.5 Tabela: `enova2_memory_runtime_v2` (ou `enova_memory_snapshots`)

| Campo | Tipo | Observação |
|---|---|---|
| `memory_id` | UUID PK | |
| `lead_id` | UUID FK → lead UNIQUE | 1:1 por lead |
| `memory_version` | INTEGER | Incremental |
| `open_questions_json` | JSONB | Perguntas em aberto |
| `open_objections_json` | JSONB | Objeções não resolvidas |
| `useful_context_json` | JSONB | Contexto útil do atendimento |
| `next_turn_pending_json` | JSONB | O que precisa acontecer no próximo turno |
| `conversation_constraints_json` | JSONB NULLABLE | Restrições de conversa ativas |
| `expires_at` | TIMESTAMPTZ | TTL — memória expira automaticamente |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Finalidade:** memória viva de curto prazo com TTL. Não é dado permanente — é contexto útil.
**Origem contratual:** T2 §resumo_persistido, Legado Mestre §5.1 `enova_memory_snapshots`.
**Relação com memória evolutiva:** Base para carga de contexto no próximo turno sem reprocessar.
**Risco se ausente:** LLM perde contexto entre sessões. Perguntas repetidas para o lead.
**Prioridade PR-T8.8:** ALTO.

---

### 5.6 Tabela: `enova2_document_records_v2` (ou `enova_artifacts`)

| Campo | Tipo | Observação |
|---|---|---|
| `document_id` | UUID PK | |
| `lead_id` | UUID FK → lead | |
| `doc_type` | TEXT | Tipo canônico: 'rg', 'cpf', 'comprovante_renda', etc. |
| `doc_status` | TEXT | 'requested' \| 'received' \| 'validated' \| 'rejected' |
| `storage_ref` | TEXT NULLABLE | URL/path no Supabase Storage — nunca conteúdo bruto |
| `validation_notes_json` | JSONB NULLABLE | |
| `source_turn_id` | UUID FK → turn | |
| `requested_at` | TIMESTAMPTZ NULLABLE | |
| `received_at` | TIMESTAMPTZ NULLABLE | |
| `validated_at` | TIMESTAMPTZ NULLABLE | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Finalidade:** rastreamento de documentos do lead. Status evolui; storage_ref aponta para bucket.
**Origem contratual:** T6 §docs_collection, Legado Mestre §5.1 `enova_artifacts`.
**Relação com CRM:** `crm_documents` é projeção simplificada — unificar.
**Relação com Storage:** `storage_ref` aponta para o bucket de documentos (ver §6).
**Risco se ausente:** Documentos recebidos são perdidos entre sessões.
**Prioridade PR-T8.8:** ALTO (blocante para dossiê real).

---

### 5.7 Tabela: `enova2_dossier_v2` (ou `enova_dossier`)

| Campo | Tipo | Observação |
|---|---|---|
| `dossier_id` | UUID PK | |
| `lead_id` | UUID FK → lead UNIQUE | 1:1 — upsert |
| `dossier_status` | TEXT | 'incomplete' \| 'in_progress' \| 'ready_for_review' \| 'approved' \| 'rejected' |
| `dossier_summary_json` | JSONB | Slots aceitos, perfil, composição |
| `required_docs_json` | JSONB | Docs exigidos com status |
| `ready_for_visit` | BOOLEAN | Soberano do Core — Adapter projeta |
| `ready_for_broker_handoff` | BOOLEAN | Soberano do Core — Adapter projeta |
| `compiled_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Finalidade:** dossiê consolidado para handoff humano. Organiza — não decide aprovação.
**Origem contratual:** T6 `T6_DOSSIE_OPERACIONAL.md` §4, Legado Mestre.
**Relação com CRM:** `crm_dossier` é projeção simplificada — unificar.
**Risco se ausente:** Dossiê não persiste. Correspondente não recebe pacote completo.
**Prioridade PR-T8.8:** ALTO.

---

### 5.8 Tabela: `enova2_visit_schedule_v2`

| Campo | Tipo | Observação |
|---|---|---|
| `visit_id` | UUID PK | |
| `lead_id` | UUID FK → lead | |
| `source_turn_id` | UUID FK → turn | |
| `visit_status` | TEXT | 'pending' \| 'scheduled' \| 'confirmed' \| 'cancelled' \| 'completed' |
| `visit_interest_declared` | BOOLEAN | |
| `scheduled_at` | TIMESTAMPTZ NULLABLE | |
| `location_ref` | TEXT NULLABLE | |
| `confirmation_notes_json` | JSONB NULLABLE | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Finalidade:** rastreamento de interesse e agendamento de visita ao imóvel.
**Origem contratual:** T5 §fatia_docs_visita_handoff, adapter entidade 8.
**Prioridade PR-T8.8:** MÉDIO (bloqueia fatia F5 do funil, não bloqueia operação mínima).

---

### 5.9 Tabela: `enova2_operational_history_v2`

| Campo | Tipo | Observação |
|---|---|---|
| `history_id` | UUID PK | |
| `lead_id` | UUID FK → lead | |
| `turn_id` | UUID NULLABLE FK → turn | |
| `event_type` | TEXT | stage_transition, signal_accepted, document_received, etc. |
| `actor_layer` | TEXT | core, adapter, context_extraction, speech_engine, worker, human_admin |
| `event_payload_json` | JSONB | Campos relevantes para auditoria |
| `occurred_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

**Finalidade:** histórico operacional auditável append-only. Nunca update nem delete.
**Origem contratual:** Legado Mestre §7 protocolo de incidentes, adapter entidade 9.
**Risco se ausente:** Sem trilha de auditoria. Impossível investigar incidente.
**Prioridade PR-T8.8:** CRÍTICO (equivale a `enova_policy_events` + `crm_override_log`).

---

### 5.10 Tabela: `enova2_projection_bridge_v2`

| Campo | Tipo | Observação |
|---|---|---|
| `projection_id` | UUID PK | |
| `lead_id` | UUID FK → lead | |
| `target_system` | TEXT | Atualmente só 'enova1' |
| `projection_payload_json` | JSONB | Apenas campos do mapa de compatibilidade |
| `projection_status` | TEXT | 'pending' \| 'projected' \| 'failed' \| 'stale' |
| `last_projection_at` | TIMESTAMPTZ NULLABLE | |
| `created_at` | TIMESTAMPTZ | |

**Finalidade:** convivência controlada com Enova 1 durante período de migração.
**Prioridade PR-T8.8:** BAIXO (pode ser deixado para PR posterior).

---

### 5.11 Tabelas adicionais do Legado Mestre sem correspondência TypeScript

As tabelas abaixo são canônicas no Legado Mestre e nos contratos T8, mas **não têm TypeScript correspondente no repo atual**:

| Tabela | Finalidade | Prioridade |
|---|---|---|
| `enova_sessions` | Sessão conversacional (started_at, ended_at, channel_mode) | MÉDIO |
| `enova_prompt_registry` | Registro de prompts versionados por uso | ALTO (para memória evolutiva) |
| `enova_eval_runs` | Runs de avaliação (dataset_version, score, regressions) | MÉDIO |
| `enova_rollout_events` | Eventos de rollout (env, cohort, action, trigger) | ALTO |
| `enova_rollout_incidents` | Incidentes (severity, root_cause, action_taken) | ALTO |

---

## §6. Documentos, Storage e Buckets

### 6.1 Estado atual

Supabase Storage: **COMPLETAMENTE AUSENTE** do repo.
- Nenhum bucket declarado em `wrangler.toml` ou código
- Nenhuma URL de storage referenciada no código (apenas `storage_ref` como placeholder em `AdapterDocumentRecord.storage_ref`)
- Nenhuma política de acesso a arquivo declarada

### 6.2 Necessidade de bucket

| Bucket necessário | Conteúdo | Acesso | Risco se ausente |
|---|---|---|---|
| `enova-docs` (ou equivalente) | RG, CPF, comprovante de renda, CTPS, certidão, etc. | Privado — apenas service role | Documentos do lead não têm destino real |
| `enova-audio` (se suporte a áudio) | Arquivos de áudio inbound | Privado | Áudio recebido não persiste |
| `enova-exports` | Dossiês exportados para correspondente | Presigned URL por tempo limitado | Correspondente não recebe pacote |

### 6.3 Relação com dossiê

O `dossier_summary_json` e `required_docs_json` referenciam documentos por tipo. Os documentos reais (bytes) precisam residir no bucket. O link entre tabela `enova2_document_records_v2.storage_ref` e o bucket real é o que conecta o registro ao arquivo.

### 6.4 Relação com correspondente

Quando o dossiê estiver pronto para `broker_handoff`, o Worker precisará gerar links presigned temporários dos documentos no bucket para envio ao correspondente. Sem bucket, não há documentos a enviar.

### 6.5 Riscos de link público

- Links públicos permanentes para documentos de cliente violam LGPD.
- Política mínima recomendada: **bucket privado** + **presigned URLs** com TTL de 1–24h.
- Nunca expor URL pública direta de documento de cliente.
- Nunca armazenar presigned URL no banco (expira; regenerar sempre que necessário).

### 6.6 Política mínima recomendada para PR-T8.8

```sql
-- Bucket privado (não public)
insert into storage.buckets (id, name, public) values ('enova-docs', 'enova-docs', false);

-- Apenas service role pode acessar diretamente
-- Frontend/Worker usa apenas presigned URLs geradas pelo backend com service role key
```

---

## §7. RLS, Policies e Segurança

### 7.1 Estado atual

RLS: **COMPLETAMENTE AUSENTE** do repo (sem migrations, sem policies declaradas).

### 7.2 Necessidade por tabela

| Tabela | RLS necessário | Service role | Anon key | Justificativa |
|---|---|---|---|---|
| `enova2_lead` | Sim | Leitura/escrita total | Nenhum acesso | Dados de cliente — nunca expor ao frontend público |
| `enova2_lead_state_v2` | Sim | Leitura/escrita total | Nenhum acesso | Estado operacional sensível |
| `enova2_turn_events_v2` | Sim (append-only) | Leitura/escrita total | Nenhum acesso | Auditoria — nunca expor conteúdo bruto de conversa |
| `enova2_signal_records_v2` | Sim | Leitura/escrita total | Nenhum acesso | Fatos pessoais (renda, IR, estado civil) |
| `enova2_memory_runtime_v2` | Sim | Leitura/escrita total | Nenhum acesso | Contexto sensível do atendimento |
| `enova2_document_records_v2` | Sim | Leitura/escrita total | Nenhum acesso | Referências a documentos pessoais |
| `enova2_dossier_v2` | Sim | Leitura/escrita total | Nenhum acesso | Dossiê consolidado — dado sensível |
| `enova2_visit_schedule_v2` | Sim | Leitura/escrita total | Nenhum acesso | |
| `enova2_operational_history_v2` | Sim (append-only) | Leitura/escrita total | Nenhum acesso | Auditoria permanente |
| `enova2_projection_bridge_v2` | Sim | Leitura/escrita total | Nenhum acesso | |
| Storage buckets | Sim | Acesso total | Nenhum acesso | Documentos de cliente são dados pessoais |

### 7.3 Modelo de acesso recomendado

| Componente | Chave usada | Justificativa |
|---|---|---|
| Worker (Cloudflare) | `service_role` (env var secreta) | Único ponto de entrada com acesso total; nunca exposta ao cliente |
| Painel `/panel` | Chama via Worker — não acessa Supabase diretamente | Sem `anon_key` no frontend; todo acesso mediado pelo Worker autenticado com `X-CRM-Admin-Key` |
| Admin local (Vasques) | Console Supabase + service role | Operações diretas autorizadas |

### 7.4 Separação backend/frontend

- O Worker Cloudflare é o único cliente do Supabase real.
- O painel `/panel` chama `/crm/*` no Worker, que chama o Supabase com service role.
- A `anon_key` do Supabase **nunca** é exposta ao frontend.
- A `service_role_key` **nunca** é exposta ao cliente ou ao painel.

### 7.5 Audit logs

Supabase tem audit log nativo via `pg_audit` ou logs de acesso. Para T8, a estratégia de auditoria é:
- Tabela `enova2_operational_history_v2`: auditoria aplicativa (quem fez o quê).
- Logs do Supabase real: auditoria de infraestrutura (acesso ao banco).
- Combinação das duas camadas garante conformidade LGPD.

### 7.6 Riscos LGPD/privacidade

| Risco | Severidade | Mitigação |
|---|---|---|
| Dados de cliente sem RLS (acesso público) | CRÍTICO | RLS em todas as tabelas; sem anon_key com acesso |
| Documentos com URL pública permanente | CRÍTICO | Bucket privado + presigned URLs com TTL |
| service_role_key hardcoded no código | CRÍTICO | Variável de ambiente (`wrangler secret put`) — nunca no código |
| Logs de turno com texto completo da conversa | ALTO | Armazenar `raw_input_ref` (referência), não conteúdo bruto; review do que vai em `normalized_input_json` |
| Backup sem criptografia | MÉDIO | Supabase criptografa backups por padrão; verificar política no plano |

---

## §8. Relação com CRM/Painel T8.4–T8.6

### 8.1 Estado atual do CRM in-process

O `CrmInMemoryBackend` de PR-T8.4 é um `Map<CrmTable, unknown[]>` que:
- Existe apenas durante a vida do Worker process.
- Não persiste entre requisições em ambientes serverless (Cloudflare Workers são stateless por padrão com isolamento de instância).
- Está **isolado** do `InMemoryPersistenceBackend` do adapter (`src/adapter/runtime.ts`).
- As 9 tabelas `crm_*` são independentes das 10 tabelas `enova2_*`.

### 8.2 Migração necessária para PR-T8.8

| Componente CRM | Estado atual | Ação na PR-T8.8 |
|---|---|---|
| `CrmInMemoryBackend` | In-memory isolado | Criar `CrmSupabaseBackend implements CrmBackend` com `@supabase/supabase-js` |
| `CrmBackend` interface | Abstração limpa em `src/crm/store.ts` | Plugar `CrmSupabaseBackend` sem alterar interface |
| Endpoints `/crm/*` | 26 endpoints funcionais (leitura/escrita in-memory) | Manter rotas; trocar só o backend concreto |
| Painel `/panel` | Consome `/crm/*` via fetch | Sem alteração — painel não sabe qual backend está ativo |
| Tabelas `crm_*` | TypeScript in-memory | Mapear para tabelas `enova2_*` no Supabase (ver mapeamento abaixo) |

### 8.3 Mapeamento `crm_*` → `enova2_*` para PR-T8.8

| Tabela CRM | Tabela Supabase alvo | Estratégia |
|---|---|---|
| `crm_leads` | `enova2_lead` | Mapear campos; `crm_leads.lead_id` = `enova2_lead.lead_id` |
| `crm_lead_state` | `enova2_lead_state_v2` | Mapear `stage_current`, `process_mode` para campos do adapter |
| `crm_turns` | `enova2_turn_events_v2` | `crm_turns` é subconjunto — unificar |
| `crm_facts` | `enova2_signal_records_v2` | `fact_key`/`fact_value` → `signal_key`/`signal_value_json` |
| `crm_documents` | `enova2_document_records_v2` | `storage_ref` passa a ser URL real do bucket |
| `crm_dossier` | `enova2_dossier_v2` | Mapeamento direto |
| `crm_policy_events` | `enova2_operational_history_v2` | `event_type = 'stage_transition'` ou equivalente |
| `crm_override_log` | `enova2_operational_history_v2` | `actor_layer = 'human_admin'`, `event_type = 'human_action'` |
| `crm_manual_mode_log` | `enova2_operational_history_v2` | `event_type = 'human_action'`, payload com action/activate/deactivate |

**Alternativa válida:** manter tabelas `crm_*` como tabelas reais separadas no Supabase (espelho CRM do painel), com sincronização via triggers ou leitura direta compartilhando `lead_id`. A PR-T8.8 decide a estratégia com base no schema real existente.

---

## §9. Relação com Memória Evolutiva

### 9.1 Suporte do Supabase à memória evolutiva

A memória evolutiva definida no T8 §4 depende de Supabase para persistir as 7 camadas:

| Tipo de memória | Tabela Supabase | Estado atual |
|---|---|---|
| Memória de atendimento | `enova2_memory_runtime_v2` + `enova2_turn_events_v2` | In-memory; perde ao reiniciar |
| Memória de aprendizado | `enova_prompt_registry` | **SEM CORRESPONDÊNCIA NO REPO** |
| Memória de contrato | `schema/` docs + `enova2_lead_state_v2` | Documental; state in-memory |
| Memória de desempenho | `enova_eval_runs` | **SEM CORRESPONDÊNCIA NO REPO** |
| Memória de erro | `enova2_operational_history_v2` + `enova_rollout_incidents` | In-memory |
| Memória comercial | `enova_prompt_registry` (insights) | **SEM CORRESPONDÊNCIA NO REPO** |
| Memória de produto | `enova_rollout_events` | In-memory no rollout module |

### 9.2 Regras invioláveis de memória

- Aprendizado extraído de atendimento **não vira regra automaticamente**.
- Todo insight candidato tem status `draft` até validação explícita de Vasques.
- Memória nunca altera `stage_current` sozinha.
- Memória nunca cria `fact_*` sem validação.
- Tabela `enova_prompt_registry` gerencia versionamento de prompts — mudança de prompt exige nova versão, não edição no banco.

### 9.3 O que precisa ser implementado para memória evolutiva real

1. Tabela `enova_prompt_registry` com `prompt_id`, `version`, `content_hash`, `status` (draft/active/deprecated), `created_at`.
2. Tabela `enova_eval_runs` com `run_id`, `dataset_version`, `score`, `regressions_json`, `created_at`.
3. Tabela `enova_rollout_incidents` com `id`, `severity`, `lead_id`, `turn_id`, `root_cause`, `action_taken`, `created_at`.
4. Mecanismo de TTL no `enova2_memory_runtime_v2` (PostgreSQL: `WHERE expires_at > NOW()` nas queries).
5. Para PR-T8.8: implementar as 3 tabelas acima na migration e criar endpoints para leitura no painel.

---

## §10. Lacunas e Riscos

| ID | Área | Achado | Evidência | Severidade | Impacto | Bloqueia PR-T8.8? | Recomendação |
|---|---|---|---|---|---|---|---|
| LAC-SB-01 | Pacote | `@supabase/supabase-js` ausente do `package.json` | `package.json` — sem dependência de runtime | CRÍTICO | Worker não consegue conectar ao Supabase real | Sim | Instalar em PR-T8.8 via `npm install @supabase/supabase-js` |
| LAC-SB-02 | Migrations | Zero arquivos SQL no repo | `find . -name "*.sql"` retorna vazio | CRÍTICO | Schema Supabase real desconhecido; impossível criar migrations sem confirmação do estado atual | Sim | Vasques deve exportar DDL do Supabase atual; se tabelas já existem, usar migration incremental |
| LAC-SB-03 | Env vars | `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` ausentes do `wrangler.toml` | `wrangler.toml` sem bindings | CRÍTICO | Worker não consegue autenticar no Supabase | Sim | Adicionar via `wrangler secret put` — nunca hardcodar |
| LAC-SB-04 | Divergência schemas | Três nomenclaturas paralelas: `enova_*` (contratual), `enova2_*` (adapter), `crm_*` (CRM) | `src/adapter/types.ts` vs `src/crm/types.ts` vs Legado Mestre | ALTO | PR-T8.8 precisa definir qual prefixo usa no Supabase real e mapear os demais | Sim | Escolher prefixo canônico único (recomendação: `enova2_*` conforme adapter) e criar mapeamento explícito |
| LAC-SB-05 | RLS | Sem policies RLS declaradas | Ausência de migrations | CRÍTICO | Tabelas criadas sem RLS ficam acessíveis via anon key — risco de exposição de dados de cliente | Sim | Todo `CREATE TABLE` deve incluir `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` e policies |
| LAC-SB-06 | Storage | Zero buckets declarados | `wrangler.toml`, `src/adapter/`, sem referência real | ALTO | Documentos de cliente não têm destino real; dossiê e correspondente impossíveis | Parcial (necessário para doc flow) | Criar bucket `enova-docs` privado em PR-T8.8 |
| LAC-SB-07 | Isolamento CRM | `CrmInMemoryBackend` isolado de `InMemoryPersistenceBackend` | `src/crm/store.ts` vs `src/adapter/runtime.ts` — dois Maps distintos | ALTO | Lead criado pelo Core não aparece no painel CRM e vice-versa até PR-T8.8 | Sim | PR-T8.8 unifica ambos no Supabase real via `lead_id` compartilhado |
| LAC-SB-08 | Schema real | Schema Supabase real não confirmado no repo | Sem export DDL fornecido | CRÍTICO | PR-T8.8 não pode criar migration sem saber o estado atual (pode haver tabelas já existentes) | Sim | Vasques deve fornecer: (1) URL do projeto Supabase, (2) DDL export ou `pg_dump --schema-only` |
| LAC-SB-09 | Tabelas ausentes | `enova_sessions`, `enova_prompt_registry`, `enova_eval_runs`, `enova_rollout_incidents`, `enova_rollout_events` sem TypeScript correspondente | Legado Mestre vs `src/adapter/types.ts` | ALTO | Memória evolutiva e telemetria real parcialmente impossíveis | Parcial | Criar TypeScript e migrations para estas tabelas em PR-T8.8 ou PR-T8.13 |
| LAC-SB-10 | Persistência cross-request | Worker stateless — Cloudflare Workers não mantém estado entre requests por padrão | `src/adapter/runtime.ts` `InMemoryPersistenceBackend` | CRÍTICO | Lead state, fatos e memória perdem-se a cada request sem Supabase real | Sim | Plugar `SupabasePersistenceBackend` na PR-T8.8 |

---

## §11. Plano recomendado para PR-T8.8

### Pré-condição obrigatória

Vasques deve fornecer antes da PR-T8.8:

1. **URL do projeto Supabase** (`https://[project-ref].supabase.co`)
2. **DDL export** do schema atual: `pg_dump --schema-only` ou export via Supabase Dashboard > Settings > Database > Schema Visualizer
3. **Confirmação** de se já existem tabelas (se sim, quais e com qual estrutura)
4. **service_role_key** para configuração via `wrangler secret put`
5. **Decisão** sobre prefixo canônico: usar `enova2_*` (conforme adapter TypeScript) ou criar novo prefixo

Se o Supabase real estiver vazio (sem tabelas), a PR-T8.8 pode criar migrations do zero. Se já houver tabelas, a PR-T8.8 deve criar migrations incrementais sem destruir dados.

### 11.1 Migration mínima (condicionada ao §11 pré-condição)

```
migrations/
  001_enova2_core_tables.sql      — enova2_lead, enova2_lead_state_v2, enova2_turn_events_v2
  002_enova2_signal_docs.sql      — enova2_signal_records_v2, enova2_document_records_v2
  003_enova2_memory_dossier.sql   — enova2_memory_runtime_v2, enova2_dossier_v2
  004_enova2_ops_visit.sql        — enova2_operational_history_v2, enova2_visit_schedule_v2
  005_enova2_extras.sql           — enova2_projection_bridge_v2, enova_rollout_incidents, enova_rollout_events
  006_rls_policies.sql            — RLS em todas as tabelas acima
  007_storage_buckets.sql         — bucket enova-docs privado + policies
```

### 11.2 Storage mínimo

- Criar bucket `enova-docs` (privado).
- Policy: apenas service role com acesso total.
- Gerar presigned URLs no Worker para acesso temporário (TTL 1h padrão).

### 11.3 Adapter Supabase real

Criar `src/adapter/supabase-backend.ts`:
```typescript
// SupabasePersistenceBackend implements PersistenceBackend
// Usa @supabase/supabase-js com service_role_key
// Plug-in da porta PersistenceBackend — sem alterar SupabaseAdapterRuntime
```

### 11.4 CRM Supabase backend

Criar `src/crm/supabase-store.ts`:
```typescript
// CrmSupabaseBackend implements CrmBackend
// Mapeia crm_* → enova2_* no Supabase real
// Plug-in da CrmBackend interface — sem alterar service.ts nem routes.ts
```

### 11.5 Integração CRM

- `src/crm/store.ts`: trocar `new CrmInMemoryBackend()` por `new CrmSupabaseBackend(supabaseClient)`
- Configuração do cliente Supabase via `env.SUPABASE_URL` + `env.SUPABASE_SERVICE_ROLE_KEY`

### 11.6 Variáveis e envs necessárias

| Variável | Escopo | Como declarar |
|---|---|---|
| `SUPABASE_URL` | Todos os ambientes | `wrangler secret put SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Todos os ambientes | `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` |
| `SUPABASE_ANON_KEY` | Se necessário | `wrangler secret put SUPABASE_ANON_KEY` |

### 11.7 Rollback da PR-T8.8

- Estratégia: feature flag `SUPABASE_REAL_ENABLED` no Worker.
- Se `SUPABASE_REAL_ENABLED !== 'true'` → Worker usa `InMemoryPersistenceBackend` e `CrmInMemoryBackend` (comportamento atual).
- Se `SUPABASE_REAL_ENABLED === 'true'` → Worker usa backends Supabase reais.
- Rollback: `wrangler secret put SUPABASE_REAL_ENABLED false` — não requer novo deploy.

### 11.8 Smoke test da PR-T8.8

Criar `src/adapter/supabase-smoke.ts`:
- Verificar conectividade: `select 1` no Supabase.
- Verificar tabelas: `select count(*) from enova2_lead`.
- Verificar RLS: tentar acesso sem service role → deve falhar.
- Verificar bucket: criar referência de teste e listar.
- Criar lead de teste → ler → deletar (cleanup).

---

## §12. Bloco E — Fechamento por Prova (A00-ADENDO-03)

| Campo | Valor |
|---|---|
| Evidência suficiente | **Parcial** — diagnóstico completo pelo repo; schema Supabase real não confirmado (ver §3 declaração obrigatória) |
| PR-T8.8 autorizada | **Condicional** — autorizada após Vasques fornecer: URL do projeto Supabase + DDL atual + service_role_key |
| PR-T8.8 bloqueada por falta de schema real? | **Sim** — sem o DDL atual do Supabase, a migration pode sobrescrever tabelas existentes ou criar duplicatas |
| Código modificado nesta PR | **Nenhum** — PR-DIAG; zero `src/` alterado |
| Migrations criadas | **Nenhuma** — diagnóstico apenas |
| Supabase real alterado | **Não** |
| Bloqueios remanescentes | LAC-SB-02 (schema real), LAC-SB-08 (confirmação Vasques), LAC-SB-04 (prefixo canônico) |
| Restrições herdadas | RA-G7-01 (telemetria), RA-G7-08 (WhatsApp real); CONF-01 (deploy auto em main) |
| Próxima PR autorizada | **PR-T8.8 — condicionada à chegada do schema real de Vasques** |
| Fechamento permitido | **Sim** — diagnóstico completo pelo repo entregue; limitação de acesso ao Supabase real declarada explicitamente |
| Data | 2026-04-29 |

### O que precisa ser exportado do Supabase

Para desbloquear PR-T8.8, Vasques deve fornecer:

```
1. URL do projeto: https://[project-ref].supabase.co

2. DDL export (uma das opções):
   a) Supabase Dashboard > Settings > Database > Schema
   b) pg_dump --schema-only --no-owner -h [host] -U postgres -d postgres > schema.sql
   c) Supabase CLI: supabase db dump --schema-only > schema.sql

3. Resposta a:
   - Existem tabelas criadas? Se sim, quais?
   - O projeto usa o prefixo enova_* ou enova2_* ou outro?
   - Existe bucket de storage criado?
   - Existem dados reais de lead no banco?
```

### Modelo esperado do arquivo de schema

```sql
-- Exemplo mínimo do que esperamos receber:
CREATE TABLE enova_leads (
  lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE enova_leads ENABLE ROW LEVEL SECURITY;
-- ... demais tabelas ...
```

Se o arquivo chegar, a PR-T8.8 pode criar migrations incrementais alinhadas ao que já existe.
Se o Supabase estiver vazio, a PR-T8.8 cria o schema completo do zero.
