# FRENTE 4 — SUPABASE ADAPTER E PERSISTENCIA — SCHEMA CANONICO DE DADOS (DESENHO)

## 1. Finalidade

Este documento define o desenho canonico de persistencia da Frente 4.
Ele e um **contrato de dados/documentacao** e nao implementacao runtime.

Nesta PR40:

- pode: definir entidades, tabelas previstas, colunas previstas, chaves, relacionamentos, ownership e governanca
- nao pode: criar migration SQL real, tabela real, escrita runtime real, endpoint funcional real

## 2. Principios canônicos

1. Core continua soberano nas regras e no stage.
2. IA continua soberana na fala final.
3. Supabase Adapter persiste estado operacional; nao escreve resposta ao cliente.
4. Persistencia deve ser idempotente, auditavel e explicavel.
5. Dado bruto nao vira estado soberano por padrao.
6. Texto final da IA nao vira estado soberano por padrao.

## 3. Entidades canônicas da Frente 4

1. `lead`
2. `lead_state_v2`
3. `turn_event_v2`
4. `signal_record_v2`
5. `memory_runtime_v2`
6. `document_record_v2`
7. `dossier_v2`
8. `visit_schedule_v2`
9. `operational_history_v2`
10. `projection_bridge_v2`

## 4. Tabelas previstas (contrato de dados)

### 4.1 `enova2_lead`

Papel: cadastro operacional minimo do lead/cliente.

Colunas previstas:

- `lead_id` (pk, text/uuid)
- `external_ref` (nullable)
- `customer_name` (nullable)
- `created_at`
- `updated_at`
- `status`

### 4.2 `enova2_lead_state_v2`

Papel: estado operacional resumido e governado.

Colunas previstas:

- `lead_state_id` (pk)
- `lead_id` (fk -> `enova2_lead.lead_id`)
- `stage_current`
- `stage_after_last_decision`
- `next_objective`
- `block_advance`
- `policy_flags_json`
- `risk_flags_json`
- `state_version`
- `source_turn_id`
- `updated_by_layer` (`core` | `adapter`)
- `created_at`
- `updated_at`

### 4.3 `enova2_turn_events_v2`

Papel: trilha de turno bruto + normalizado + decidido para auditoria.

Colunas previstas:

- `turn_id` (pk)
- `lead_id` (fk)
- `idempotency_key`
- `channel_type` (`text` | `audio` | `other`)
- `raw_input_ref` (nullable)
- `normalized_input_json`
- `semantic_package_json` (saida estruturada da Frente 3)
- `core_decision_json`
- `speech_contract_json` (restricoes, nao resposta final)
- `created_at`

### 4.4 `enova2_signal_records_v2`

Papel: sinais extraidos persistiveis e auditaveis.

Colunas previstas:

- `signal_id` (pk)
- `turn_id` (fk -> `enova2_turn_events_v2.turn_id`)
- `lead_id` (fk)
- `signal_type` (`fact` | `intent` | `question` | `objection` | `slot_candidate` | `pending` | `ambiguity`)
- `signal_key`
- `signal_value_json`
- `confidence_score`
- `status` (`accepted` | `pending` | `requires_confirmation` | `rejected`)
- `evidence_ref`
- `created_at`

### 4.5 `enova2_memory_runtime_v2`

Papel: memoria viva curta consolidada para proximo raciocinio.

Colunas previstas:

- `memory_id` (pk)
- `lead_id` (fk)
- `memory_version`
- `open_questions_json`
- `open_objections_json`
- `useful_context_json`
- `next_turn_pending_json`
- `conversation_constraints_json`
- `expires_at`
- `created_at`
- `updated_at`

### 4.6 `enova2_document_records_v2`

Papel: rastrear documentos enviados/recebidos/validados.

Colunas previstas:

- `document_id` (pk)
- `lead_id` (fk)
- `doc_type`
- `doc_status` (`requested` | `received` | `validated` | `rejected`)
- `storage_ref`
- `validation_notes_json`
- `source_turn_id`
- `created_at`
- `updated_at`

### 4.7 `enova2_dossier_v2`

Papel: visao consolidada operacional para handoff humano.

Colunas previstas:

- `dossier_id` (pk)
- `lead_id` (fk)
- `dossier_status`
- `dossier_summary_json`
- `required_docs_json`
- `ready_for_visit`
- `ready_for_broker_handoff`
- `last_compiled_at`
- `updated_at`

### 4.8 `enova2_visit_schedule_v2`

Papel: agenda/visita vinculada ao fluxo final.

Colunas previstas:

- `visit_id` (pk)
- `lead_id` (fk)
- `visit_interest`
- `visit_status` (`pending` | `scheduled` | `confirmed` | `declined` | `completed`)
- `scheduled_at` (nullable)
- `location_ref` (nullable)
- `notes_json`
- `created_at`
- `updated_at`

### 4.9 `enova2_operational_history_v2`

Papel: historico util de eventos operacionais auditaveis.

Colunas previstas:

- `history_id` (pk)
- `lead_id` (fk)
- `turn_id` (nullable fk)
- `event_type`
- `event_payload_json`
- `actor_layer` (`core` | `speech` | `context` | `adapter` | `worker`)
- `created_at`

### 4.10 `enova2_projection_bridge_v2`

Papel: projecao de compatibilidade minima para legados da ENOVA 1.

Colunas previstas:

- `projection_id` (pk)
- `lead_id` (fk)
- `target_system` (`enova1`)
- `projection_payload_json`
- `projection_status`
- `last_projection_at`
- `created_at`
- `updated_at`

## 5. Chaves e relacionamentos previstos

- Chave raiz: `enova2_lead.lead_id`
- Relacionamentos principais:
  - `enova2_lead` 1:N `enova2_turn_events_v2`
  - `enova2_lead` 1:N `enova2_signal_records_v2`
  - `enova2_lead` 1:N `enova2_document_records_v2`
  - `enova2_lead` 1:N `enova2_operational_history_v2`
  - `enova2_lead` 1:1 ou 1:N controlado `enova2_lead_state_v2`
  - `enova2_turn_events_v2` 1:N `enova2_signal_records_v2`
- Chave idempotente minima: `idempotency_key` por turno em `enova2_turn_events_v2`

## 6. Ownership por camada

- Core:
  - define `stage_current`, `next_objective`, `block_advance`, `policy_flags`
  - nao escreve diretamente no banco; escreve via contrato do adapter
- Contexto/Extracao:
  - informa `semantic_package_json` e sinais candidatos
  - nao oficializa regra de negocio nem slot soberano
- Speech:
  - informa metadados de governanca de resposta (nao texto final soberano por padrao)
- Supabase Adapter:
  - unico responsavel por traduzi-los para persistencia canonica
  - garante idempotencia, versao e trilha de evidencia

## 7. O que persiste

- estado operacional resumido do lead
- sinais estruturados relevantes
- memoria viva curta util
- estado de documentos
- estado de dossie
- estado de visita/agendamento
- historico operacional util e auditavel
- projecao minima para compatibilidade legado

## 8. O que NAO persiste por padrao

- transcript bruto completo como default global
- resposta final completa da IA como estado soberano
- decisao de regra de negocio fora do payload do Core
- dados sem evidencia de origem ou sem idempotencia
- dumps textuais sem utilidade operacional

## 9. Temporario vs canonico

- **Contexto temporario:** sinais ainda ambiguos, duvidas abertas e itens para confirmacao.
- **Persistencia canonica:** fatos/sinais apos regras de aceite da frente, com versao e evidencia.
- **Estado soberano do Core:** decisao de regra e trilho.
- **Estado persistido do Adapter:** reflexo auditavel do que o Core decidiu e do que o turno gerou.

## 10. Governanca de evolucao

1. PR41 consolida e versiona este contrato de dados.
2. PR42 cria casca de adapter de leitura/escrita conforme este desenho.
3. PR43 define merge/update/consistencia por entidade.
4. PR44 valida por smoke persistente e closeout formal.

## 11. Fontes de referencia

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
- `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` (paginas 126-127)
