# FRENTE 4 — CONTRATO DE DADOS PERSISTÍVEIS — ENOVA 2

> **Versão:** 1.0.0 (PR 41)
> **Data:** 2026-04-21
> **Status:** canônico e ativo
> **Dependência:** `FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md` (v1.0 — PR 40) refinado por esta PR 41.

---

## 0. Propósito e escopo

Este documento é o **contrato de dados persistíveis** da Frente 4 — Supabase Adapter e Persistência da ENOVA 2.

Ele **não** é implementação runtime. Ele **não** cria migration SQL real. Ele define:

- Quais entidades existem e para que servem
- Quais campos são obrigatórios e quais são opcionais
- Quais chaves (PK, FK, idempotência) garantem consistência
- Quem é o **owner** de cada escrita
- O que persiste por padrão, o que não persiste e o que precisa de confirmação
- Como a Frente 4 pretende salvar dados do cliente, docs, dossiê, visita, histórico e contexto/sinais/memória
- As quatro zonas de soberania de dados

Este contrato está forte o suficiente para a PR 42 implementar o adapter base sem inventar.

---

## 1. Precedência e soberania

```
A00 > A01 > A00-ADENDO-01 > A02 > CONTRATO_SUPABASE_ADAPTER > este contrato
```

### 1.1 Quatro zonas de soberania de dados

| Zona | Dono | O que é | Pode mudar via Adapter? |
|------|------|---------|------------------------|
| **Estado soberano do Core** | Policy/Core | Regra de negócio, stage, gates, next_objective, block_advance, policy_flags | Não — Adapter só projeta, nunca sobrescreve |
| **Dado persistido pelo Adapter** | Supabase Adapter | Reflexo auditável do que o Core decidiu e do que o turno gerou — tabelas `enova2_*` | Sim — é a responsabilidade do Adapter |
| **Memória viva temporária** | Adapter (com TTL) | Contexto útil do turno atual para o próximo raciocínio — `enova2_memory_runtime_v2` | Sim — mas tem expiração explícita |
| **Projeção de compatibilidade** | Adapter | Mapeamento controlado para sistemas legados (ENOVA 1) — `enova2_projection_bridge_v2` | Sim — mas apenas campos mapeados explicitamente |

**Regra absoluta:** o Adapter traduz o que o Core decidiu em persistência. O Adapter **não** decide regra, **não** define stage, **não** escreve resposta ao cliente.

---

## 2. O que persiste por padrão

| Categoria | O que persiste | Onde |
|-----------|---------------|------|
| Cadastro do lead/cliente | Identificação mínima e referência externa | `enova2_lead` |
| Estado operacional do lead | Stage atual, objetivo, flags de política, flags de risco | `enova2_lead_state_v2` |
| Trilha de turno | Entrada normalizada, pacote semântico, decisão do Core, metadados de speech | `enova2_turn_events_v2` |
| Sinais aceitos | Fatos, slots confirmados, evidências com confiança ≥ threshold | `enova2_signal_records_v2` |
| Estado de documentos | Status de solicitação, recebimento e validação de docs | `enova2_document_records_v2` |
| Dossiê consolidado | Visão operacional para handoff humano | `enova2_dossier_v2` |
| Visita/agendamento | Interesse, status e dados de agendamento | `enova2_visit_schedule_v2` |
| Histórico operacional | Eventos de turno, decisão e layer para auditoria | `enova2_operational_history_v2` |
| Memória viva curta | Contexto útil com TTL curto para o próximo raciocínio | `enova2_memory_runtime_v2` |

---

## 3. O que NÃO persiste por padrão

| O que | Por que não persiste |
|-------|---------------------|
| Transcript bruto completo de áudio/texto | Não tem valor operacional por padrão; gera lixo sem governança |
| Resposta final completa da IA (texto livre) | IA é soberana na fala; fala não vira estado soberano |
| Sinais ambíguos sem confirmação | Devem ficar em memória viva temporária até confirmação |
| Dumps textuais sem extração estruturada | Sem origem, sem evidência, sem utilidade para replay |
| Decisões de regra de negócio fora do payload do Core | O Core decide — o Adapter projeta o que o Core decidiu |
| Dados sem idempotência ou sem evidência de origem | Não conformidade com o princípio de auditabilidade |
| Contexto interno do LLM entre turnos não estruturado | Deve ser estruturado como sinal antes de persistir |

---

## 4. O que é temporário (com TTL)

| O que | Onde | TTL indicativo | Condição de promoção |
|-------|------|---------------|---------------------|
| Memória viva curta | `enova2_memory_runtime_v2` | 24h–72h (a definir na PR 43) | Promoção a sinal aceito via confirmação explícita |
| Sinais pendentes de confirmação | `enova2_signal_records_v2` (status `pending` / `requires_confirmation`) | Até confirmação ou expiração do turno | Confirmação → status `accepted` |
| Candidatos a slot não validados | `enova2_signal_records_v2` (status `slot_candidate`) | Até Core aceitar ou rejeitar | Aceitação → status `accepted` |

---

## 5. O que exige confirmação antes de virar persistência canônica

| Dado | Condição de confirmação | Responsável pela confirmação |
|------|------------------------|------------------------------|
| Slot de dado de negócio (renda, CPF, regime) | Core aceitar via regra + cliente confirmar explicitamente | Core (via política de aceite) |
| Documento como "validado" | Validação por regra e/ou humano | Adapter após sinal do Core |
| Dossiê como "pronto para visita" | `ready_for_visit = true` após critério do Core | Core via state; Adapter persiste |
| Agendamento confirmado | Cliente confirmar e slot disponível | Adapter após confirmação explícita |
| Sinal extraído de áudio (score < threshold) | Score de confiança subir ou confirmação explícita | Adapter + Core (threshold definido na PR 43) |

---

## 6. Entidades canônicas — definição completa

### 6.1 `enova2_lead`

**Finalidade:** cadastro operacional mínimo do lead/cliente. Âncora de todas as outras entidades.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `lead_id` | UUID | **SIM** | Chave primária — gerada pelo Adapter no primeiro turno |
| `external_ref` | TEXT nullable | não | Referência externa (ex.: ID do WhatsApp, CRM, ENOVA 1) |
| `customer_name` | TEXT nullable | não | Nome do cliente (pode ser nulo no início do funil) |
| `phone_ref` | TEXT nullable | não | Referência de canal de contato |
| `status` | TEXT | **SIM** | `active` \| `inactive` \| `archived` |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação — imutável após insert |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização — gerenciado pelo Adapter |

**Chave primária:** `lead_id` (UUID)  
**FK de:** nenhuma — esta é a âncora raiz  
**Idempotency key:** `external_ref` — previne duplicata de lead para o mesmo canal externo  
**Versionamento:** não versionado (é cadastro, não estado)  
**Evidência/origem:** `external_ref` + `created_at`  
**Owner de escrita:** Supabase Adapter (único)  
**Política de retenção:** não expira — dado de negócio permanente  

**Como é salvo:** no primeiro evento de turno de um canal desconhecido, o Adapter cria o lead com `external_ref` a partir do ID do canal. Atualizações de `customer_name` e `phone_ref` ocorrem quando sinais confirmados chegam do Core.

---

### 6.2 `enova2_lead_state_v2`

**Finalidade:** estado operacional resumido e governado do lead. Reflexo auditável do que o Core decidiu por último.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `lead_state_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `stage_current` | TEXT | **SIM** | Stage atual decidido pelo Core |
| `stage_after_last_decision` | TEXT | **SIM** | Stage anterior — para auditoria de transição |
| `next_objective` | TEXT | **SIM** | Próximo objetivo autorizado pelo Core |
| `block_advance` | BOOLEAN | **SIM** | `true` se Core bloqueou avanço de stage |
| `policy_flags_json` | JSONB | **SIM** | Flags de política aplicados pelo Core (ex.: `{"mcmv_eligible": true}`) |
| `risk_flags_json` | JSONB | não | Flags de risco identificados (ex.: `{"cpf_divergence": true}`) |
| `state_version` | INTEGER | **SIM** | Versão incremental — incrementa a cada write do Adapter |
| `source_turn_id` | UUID | **SIM** | FK → `enova2_turn_events_v2.turn_id` — turno que gerou este estado |
| `updated_by_layer` | TEXT | **SIM** | `core` \| `adapter` — quem originou a mudança |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização |

**Chave primária:** `lead_state_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`; `source_turn_id` → `enova2_turn_events_v2.turn_id`  
**Idempotency key:** `(lead_id, source_turn_id)` — o mesmo turno não pode gerar dois estados diferentes  
**Versionamento:** `state_version` (inteiro incremental — nunca decresce)  
**Evidência/origem:** `source_turn_id` + `updated_by_layer`  
**Owner de escrita:** Supabase Adapter (projeta o que o Core entregou no payload de decisão)  
**Owner de definição dos campos soberanos:** Core (Adapter não inventa `stage_current`, `next_objective` ou `block_advance` — projeta o payload do Core)  
**Política de retenção:** não expira — histórico de estado é permanente  

**Como é salvo:** após cada turno, o Core entrega um payload de decisão (`core_decision_json` em `enova2_turn_events_v2`). O Adapter extrai os campos de estado e persiste um novo registro versionado em `enova2_lead_state_v2`. A leitura do estado atual do lead = registro com `state_version` máximo.

---

### 6.3 `enova2_turn_events_v2`

**Finalidade:** trilha completa de cada turno — entrada normalizada, pacote semântico, decisão do Core e metadados de speech — para auditoria e replay.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `turn_id` | UUID | **SIM** | Chave primária — gerada pelo Adapter |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `idempotency_key` | TEXT | **SIM** | Chave única por turno (ex.: hash de `lead_id + canal + timestamp`) |
| `channel_type` | TEXT | **SIM** | `text` \| `audio` \| `other` |
| `raw_input_ref` | TEXT nullable | não | Referência ao input bruto (ex.: media_id do WhatsApp) — nunca o conteúdo bruto |
| `normalized_input_json` | JSONB | **SIM** | Input normalizado (texto limpo ou transcrição aceita) |
| `semantic_package_json` | JSONB | **SIM** | Saída estruturada da Frente 3 — sinais, intenções, ambiguidades, pendências |
| `core_decision_json` | JSONB | **SIM** | Payload completo de decisão do Core — stage, next_objective, slots aceitos, flags |
| `speech_contract_json` | JSONB | não | Metadados de governança de resposta (restrições do Speech Engine — não o texto final) |
| `turn_sequence` | INTEGER | **SIM** | Número sequencial do turno para este lead |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação — imutável |

**Chave primária:** `turn_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`  
**Idempotency key:** `idempotency_key` — reprocessar o mesmo turno não cria duplicata  
**Versionamento:** imutável (append-only) — nunca se altera um turno registrado  
**Evidência/origem:** `channel_type` + `normalized_input_json` + `semantic_package_json`  
**Owner de escrita:** Supabase Adapter  
**Política de retenção:** permanente para auditoria; candidato a arquivamento frio após X meses (a definir na PR 43)  

**O que NÃO vai aqui:** texto final da IA, transcript bruto completo como dado primário  

**Como é salvo:** a cada turno completo, o Adapter recebe o pacote estruturado (input normalizado + pacote semântico da Frente 3 + decisão do Core + metadados de speech) e persiste um único registro. O `idempotency_key` garante que reprocessamentos não corrompem o histórico.

---

### 6.4 `enova2_signal_records_v2`

**Finalidade:** sinais extraídos e persistíveis — fatos, slots, intenções, objeções e ambiguidades — com rastreabilidade de origem, confiança e status de aceite.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `signal_id` | UUID | **SIM** | Chave primária |
| `turn_id` | UUID | **SIM** | FK → `enova2_turn_events_v2.turn_id` |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `signal_type` | TEXT | **SIM** | `fact` \| `intent` \| `question` \| `objection` \| `slot_candidate` \| `pending` \| `ambiguity` |
| `signal_key` | TEXT | **SIM** | Nome canônico do sinal (ex.: `monthly_income`, `marital_status`, `has_cpf`) |
| `signal_value_json` | JSONB | **SIM** | Valor estruturado do sinal |
| `confidence_score` | NUMERIC(4,3) | **SIM** | Score de confiança [0.000–1.000] |
| `status` | TEXT | **SIM** | `accepted` \| `pending` \| `requires_confirmation` \| `slot_candidate` \| `rejected` |
| `evidence_ref` | TEXT nullable | não | Referência à evidência de origem (ex.: trecho do input normalizado) |
| `confirmed_at` | TIMESTAMPTZ nullable | não | Quando o sinal foi confirmado (aceito pelo Core + cliente) |
| `rejected_at` | TIMESTAMPTZ nullable | não | Quando o sinal foi rejeitado |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação |

**Chave primária:** `signal_id` (UUID)  
**FK de:** `turn_id` → `enova2_turn_events_v2.turn_id`; `lead_id` → `enova2_lead.lead_id`  
**Idempotency key:** `(turn_id, signal_key)` — o mesmo turno não pode produzir dois sinais com a mesma chave  
**Versionamento:** status mutável (`pending` → `accepted` / `rejected`); valor é imutável após inserção  
**Evidência/origem:** `evidence_ref` + `confidence_score` + `turn_id`  
**Owner de escrita:** Supabase Adapter (insere com base no pacote semântico da Frente 3; atualiza status com base na decisão do Core)  
**Owner de aceite:** Core (quem decide se o sinal é aceito ou rejeitado — Adapter projeta a decisão)  
**Política de retenção:** sinais `accepted` são permanentes; sinais `rejected` podem ser purgados após X dias (a definir na PR 43)  

**Como é salvo:** após cada turno, o Adapter extrai os sinais do `semantic_package_json` (Frente 3) e os insere com status `pending` ou `slot_candidate`. Em seguida, para cada sinal que o Core aceitou no `core_decision_json`, o Adapter atualiza o status para `accepted` e registra `confirmed_at`. Sinais não aceitos ficam como `pending` ou `requires_confirmation` até o próximo turno.

---

### 6.5 `enova2_memory_runtime_v2`

**Finalidade:** memória viva curta consolidada para o próximo raciocínio — contexto útil com TTL, não dado permanente.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `memory_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` (unicidade 1:1 ativo por lead) |
| `memory_version` | INTEGER | **SIM** | Versão incremental |
| `open_questions_json` | JSONB | **SIM** | Perguntas abertas do cliente ainda sem resposta |
| `open_objections_json` | JSONB | **SIM** | Objeções abertas ainda não resolvidas |
| `useful_context_json` | JSONB | **SIM** | Contexto útil condensado (não dump textual) |
| `next_turn_pending_json` | JSONB | **SIM** | O que foi deixado pendente para o próximo turno |
| `conversation_constraints_json` | JSONB | não | Restrições de speech para o próximo turno |
| `expires_at` | TIMESTAMPTZ | **SIM** | TTL explícito — após este momento, não deve ser lida |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização |

**Chave primária:** `memory_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`  
**Idempotency key:** `lead_id` — existe no máximo 1 registro ativo por lead (a política de upsert é definida na PR 43)  
**Versionamento:** `memory_version` (incremental)  
**Evidência/origem:** implícita no último `turn_id` que gerou a memória (registrar via `useful_context_json` se necessário)  
**Owner de escrita:** Supabase Adapter  
**Política de retenção:** TTL explícito (`expires_at`); padrão sugerido de 24h–72h — definido formalmente na PR 43; nunca deve sobreviver além do necessário para o próximo raciocínio  

**Diferença entre memória viva e sinal aceito:**
- Sinal aceito: fato confirmado, permanente, rastreável, auditável
- Memória viva: contexto útil temporário, sem confirmação, expirável, substituível a cada turno

**Como é salvo:** ao final de cada turno, o Adapter consolida o contexto relevante (perguntas abertas, objeções, pendências) em um upsert da `enova2_memory_runtime_v2`. Na leitura do próximo turno, o Adapter verifica `expires_at` antes de entregar a memória ao raciocínio.

---

### 6.6 `enova2_document_records_v2`

**Finalidade:** rastrear documentos enviados, recebidos e validados — com status, tipo e referência de armazenamento.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `document_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `doc_type` | TEXT | **SIM** | Tipo canônico do documento (ex.: `rg`, `cpf`, `comprovante_renda`, `certidao_casamento`) |
| `doc_status` | TEXT | **SIM** | `requested` \| `received` \| `validated` \| `rejected` |
| `storage_ref` | TEXT nullable | não | Referência ao storage (ex.: URL do R2/Storage, media_id) — nunca o conteúdo bruto |
| `validation_notes_json` | JSONB | não | Notas de validação (motivo de rejeição, ressalvas) |
| `source_turn_id` | UUID | **SIM** | FK → `enova2_turn_events_v2.turn_id` — turno que gerou o evento do documento |
| `requested_at` | TIMESTAMPTZ | não | Quando foi solicitado ao cliente |
| `received_at` | TIMESTAMPTZ | não | Quando o cliente enviou |
| `validated_at` | TIMESTAMPTZ | não | Quando foi validado |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização |

**Chave primária:** `document_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`; `source_turn_id` → `enova2_turn_events_v2.turn_id`  
**Idempotency key:** `(lead_id, doc_type)` — por tipo de documento por lead, o Adapter faz upsert (update de status, não duplicata)  
**Versionamento:** `doc_status` é mutável; `storage_ref` é imutável após recebimento  
**Evidência/origem:** `source_turn_id` + `storage_ref`  
**Owner de escrita:** Supabase Adapter  
**Owner de validação:** humano ou regra do Core — o Adapter projeta a decisão  
**Política de retenção:** permanente — documentos são dado de negócio crítico  

**Como é salvo:** quando o Core sinaliza que um documento foi solicitado, o Adapter cria um registro `requested`. Quando o cliente envia, o Adapter atualiza para `received` e registra `storage_ref`. Quando validado, atualiza para `validated` com `validation_notes_json` e `validated_at`.

---

### 6.7 `enova2_dossier_v2`

**Finalidade:** visão consolidada operacional do lead para handoff humano (corretor, atendente) — agrega o estado de todos os documentos, elegibilidade e prontidão para visita.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `dossier_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` (1:1 por lead) |
| `dossier_status` | TEXT | **SIM** | `incomplete` \| `in_progress` \| `ready_for_review` \| `approved` \| `rejected` |
| `dossier_summary_json` | JSONB | **SIM** | Resumo estruturado dos dados coletados (slots aceitos, perfil, composição familiar) |
| `required_docs_json` | JSONB | **SIM** | Lista de documentos exigidos com status de cada um |
| `eligibility_flags_json` | JSONB | não | Flags de elegibilidade calculadas pelo Core |
| `ready_for_visit` | BOOLEAN | **SIM** | `true` apenas quando Core autorizar (não decidido pelo Adapter) |
| `ready_for_broker_handoff` | BOOLEAN | **SIM** | `true` apenas quando Core autorizar |
| `last_compiled_at` | TIMESTAMPTZ | **SIM** | Última vez que o dossiê foi recompilado |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização |

**Chave primária:** `dossier_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`  
**Idempotency key:** `lead_id` — existe no máximo 1 dossiê por lead (upsert)  
**Versionamento:** `last_compiled_at` + `dossier_status`  
**Evidência/origem:** compilado a partir de `enova2_signal_records_v2` (aceitos) + `enova2_document_records_v2`  
**Owner de escrita:** Supabase Adapter (compila o dossiê a partir dos sinais e documentos)  
**Owner de `ready_for_visit` e `ready_for_broker_handoff`:** Core define; Adapter persiste  
**Política de retenção:** permanente  

**Como é salvo:** o Adapter recompila o dossiê após cada turno relevante. Ele agrega sinais aceitos, status de documentos e flags do Core para gerar o `dossier_summary_json` e o `required_docs_json`. Os campos `ready_for_visit` e `ready_for_broker_handoff` são projetados diretamente do payload do Core — o Adapter não os decide.

---

### 6.8 `enova2_visit_schedule_v2`

**Finalidade:** registrar interesse, agendamento e status de visita — vinculado ao estágio final do funil.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `visit_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `visit_interest` | BOOLEAN | **SIM** | `true` se cliente expressou interesse em visita |
| `visit_status` | TEXT | **SIM** | `pending` \| `scheduled` \| `confirmed` \| `declined` \| `completed` |
| `scheduled_at` | TIMESTAMPTZ nullable | não | Data/hora agendada — nulo até confirmação real |
| `location_ref` | TEXT nullable | não | Referência do local (empreendimento, endereço) |
| `source_turn_id` | UUID | **SIM** | FK → `enova2_turn_events_v2.turn_id` — turno que originou este registro |
| `notes_json` | JSONB | não | Notas adicionais (preferências do cliente, restrições) |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização |

**Chave primária:** `visit_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`; `source_turn_id` → `enova2_turn_events_v2.turn_id`  
**Idempotency key:** `(lead_id, source_turn_id)` — o mesmo turno não gera duas visitas  
**Versionamento:** `visit_status` é mutável  
**Evidência/origem:** `source_turn_id` + `visit_interest`  
**Owner de escrita:** Supabase Adapter  
**Owner de confirmação de visita:** processo externo ou humano — o Adapter registra o status  
**Política de retenção:** permanente  

**Como é salvo:** quando o sinal `visit_interest = true` chega do pacote semântico e o Core autoriza o stage de visita, o Adapter cria o registro com `visit_status = pending`. Confirmações e agendamentos são atualizados via eventos subsequentes.

---

### 6.9 `enova2_operational_history_v2`

**Finalidade:** histórico de eventos operacionais auditáveis — append-only, não substitui dados, apenas registra o que aconteceu e quem fez.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `history_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `turn_id` | UUID nullable | não | FK → `enova2_turn_events_v2.turn_id` (nullable para eventos fora de turno) |
| `event_type` | TEXT | **SIM** | Tipo canônico do evento (ex.: `stage_transition`, `signal_accepted`, `doc_received`, `visit_scheduled`, `dossier_compiled`) |
| `event_payload_json` | JSONB | **SIM** | Payload estruturado do evento (campos relevantes para auditoria) |
| `actor_layer` | TEXT | **SIM** | `core` \| `speech` \| `context` \| `adapter` \| `worker` \| `human` |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação — imutável (append-only) |

**Chave primária:** `history_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`; `turn_id` → `enova2_turn_events_v2.turn_id`  
**Idempotency key:** não aplicável — cada evento é único por definição; o `turn_id` e `event_type` juntos identificam o contexto  
**Versionamento:** imutável — append-only; nunca se altera um evento registrado  
**Evidência/origem:** `actor_layer` + `event_payload_json` + `turn_id`  
**Owner de escrita:** Supabase Adapter (registra eventos gerados por qualquer layer)  
**Política de retenção:** permanente para auditoria; candidato a arquivamento frio após X meses (a definir na PR 43)  

**Como é salvo:** o Adapter emite um evento a cada ação relevante: transição de stage, sinal aceito, documento recebido, visita agendada, dossiê compilado. Eventos são sempre append — nunca update ou delete.

---

### 6.10 `enova2_projection_bridge_v2`

**Finalidade:** projeção de compatibilidade controlada para sistemas legados (ENOVA 1) — apenas os campos mapeados explicitamente.

| Campo | Tipo | Obrigatório? | Descrição |
|-------|------|-------------|-----------|
| `projection_id` | UUID | **SIM** | Chave primária |
| `lead_id` | UUID | **SIM** | FK → `enova2_lead.lead_id` |
| `target_system` | TEXT | **SIM** | `enova1` (único alvo autorizado nesta PR) |
| `projection_payload_json` | JSONB | **SIM** | Campos mapeados para o sistema alvo (apenas campos definidos no mapa de compatibilidade) |
| `projection_status` | TEXT | **SIM** | `pending` \| `projected` \| `failed` \| `stale` |
| `last_projection_at` | TIMESTAMPTZ nullable | não | Última projeção bem-sucedida |
| `created_at` | TIMESTAMPTZ | **SIM** | Criação |
| `updated_at` | TIMESTAMPTZ | **SIM** | Última atualização |

**Chave primária:** `projection_id` (UUID)  
**FK de:** `lead_id` → `enova2_lead.lead_id`  
**Idempotency key:** `(lead_id, target_system)` — 1 projeção ativa por sistema alvo por lead  
**Versionamento:** `projection_status` + `last_projection_at`  
**Evidência/origem:** `projection_payload_json` é compilado a partir de sinais aceitos + state  
**Owner de escrita:** Supabase Adapter  
**Política de retenção:** permanente — compatibilidade é dado operacional  

**Regra de segurança:** apenas campos explicitamente mapeados no mapa de compatibilidade (a definir na PR 42) podem entrar em `projection_payload_json`. O Adapter não projeta campos livres nem dumps.

---

## 7. Diagrama de relacionamentos

```
enova2_lead (âncora raiz)
│
├── 1:N  enova2_lead_state_v2       (estado operacional versionado)
├── 1:N  enova2_turn_events_v2      (trilha de turnos — append-only)
│         └── 1:N  enova2_signal_records_v2  (sinais por turno)
├── 1:N  enova2_document_records_v2 (documentos)
├── 1:1  enova2_dossier_v2          (dossiê consolidado — upsert)
├── 1:N  enova2_visit_schedule_v2   (visitas/agendamentos)
├── 1:N  enova2_operational_history_v2 (histórico auditável — append-only)
├── 1:1  enova2_memory_runtime_v2   (memória viva — upsert com TTL)
└── 1:N  enova2_projection_bridge_v2 (projeções por sistema alvo)
```

---

## 8. Ownership consolidado por camada

| Layer | Pode escrever em | Não pode escrever em | Observação |
|-------|-----------------|---------------------|------------|
| **Core** | (não escreve diretamente) | todos os enova2_* | Entrega payload de decisão ao Adapter |
| **Contexto/Extração (Frente 3)** | (não escreve diretamente) | todos os enova2_* | Entrega `semantic_package_json` ao Adapter via turno |
| **Speech Engine** | (não escreve diretamente) | todos os enova2_* | Entrega `speech_contract_json` (metadados — não texto final) |
| **Supabase Adapter** | todos os enova2_* | nenhuma restrição adicional | Único responsável por traduzir payloads em persistência |
| **Worker/Processo assíncrono** | `enova2_operational_history_v2`, `enova2_projection_bridge_v2` | dados soberanos do Core | Para eventos fora do ciclo de turno síncrono |
| **Humano/Admin** | via interface admin — apenas `doc_status`, `dossier_status`, `visit_status` | dados do Core, sinais | Ações humanas sempre registradas em `enova2_operational_history_v2` |

---

## 9. Separação explícita das quatro zonas de dados

### 9.1 Estado soberano do Core

Campos que **só o Core define** — o Adapter projeta, nunca decide:

```
stage_current           → enova2_lead_state_v2.stage_current
next_objective          → enova2_lead_state_v2.next_objective
block_advance           → enova2_lead_state_v2.block_advance
policy_flags_json       → enova2_lead_state_v2.policy_flags_json
ready_for_visit         → enova2_dossier_v2.ready_for_visit
ready_for_broker_handoff → enova2_dossier_v2.ready_for_broker_handoff
signal.status accepted  → enova2_signal_records_v2.status (quando Core aceita)
```

### 9.2 Dado persistido pelo Adapter

Campos que o Adapter escreve como projeção do que o Core decidiu e do que o turno gerou:

```
enova2_lead             → identificação e referência
enova2_lead_state_v2    → reflexo do payload do Core
enova2_turn_events_v2   → trilha completa do turno
enova2_signal_records_v2 → sinais extraídos + status de aceite
enova2_document_records_v2 → estado de documentos
enova2_dossier_v2       → compilação de dados para handoff
enova2_visit_schedule_v2 → agendamento e interesse
enova2_operational_history_v2 → log auditável de eventos
enova2_projection_bridge_v2 → compatibilidade legada
```

### 9.3 Memória viva temporária

```
enova2_memory_runtime_v2 → TTL explícito (expires_at)
                         → substituída a cada turno relevante
                         → nunca é dado canônico permanente
                         → promovível a sinal aceito apenas com confirmação
```

### 9.4 Projeção de compatibilidade

```
enova2_projection_bridge_v2 → apenas campos do mapa de compatibilidade
                            → não é dado operacional da ENOVA 2
                            → não alimenta raciocínio nem fala
                            → serve apenas para convivência com ENOVA 1
```

---

## 10. Como a Frente 4 pretende salvar cada categoria

### 10.1 Dados do cliente/lead

**O problema que estamos evitando:** salvar tudo que o cliente fala como dado de negócio sem validação.

**Como salvamos:**
1. Na primeira mensagem: criar `enova2_lead` com `external_ref` e `status = active`
2. A cada sinal aceito pelo Core: atualizar campos de `enova2_lead` (`customer_name`, `phone_ref`) apenas quando sinais confirmados chegam
3. Nunca salvar dados do cliente a partir de texto bruto — apenas de sinais estruturados aceitos pelo Core

**Entidade principal:** `enova2_lead`  
**Entidade de estado:** `enova2_lead_state_v2`

---

### 10.2 Documentos

**O problema que estamos evitando:** não rastrear solicitação e recebimento; perder o status de validação; salvar o conteúdo bruto sem referência.

**Como salvamos:**
1. Quando Core solicita doc: inserir `enova2_document_records_v2` com `doc_status = requested`
2. Quando cliente envia: atualizar para `received`, registrar `storage_ref` (referência — não conteúdo)
3. Quando validado: atualizar para `validated` com `validation_notes_json` e `validated_at`
4. Nunca salvar conteúdo bruto de documento — apenas referência (`storage_ref`)

**Entidade:** `enova2_document_records_v2`

---

### 10.3 Dossiê

**O problema que estamos evitando:** dossiê desatualizado, compilado manualmente, sem governança de campos.

**Como salvamos:**
1. O Adapter compila o dossiê após cada turno relevante (stage transition, sinal aceito, doc atualizado)
2. `dossier_summary_json` agrega apenas sinais `accepted` de `enova2_signal_records_v2`
3. `required_docs_json` espelha o estado de `enova2_document_records_v2`
4. `ready_for_visit` e `ready_for_broker_handoff` são projetados do Core — nunca calculados pelo Adapter
5. Upsert por `lead_id` — nunca duplicata

**Entidade:** `enova2_dossier_v2`

---

### 10.4 Visita/agendamento

**O problema que estamos evitando:** perder o interesse do cliente; não rastrear transições de status.

**Como salvamos:**
1. Quando o pacote semântico indica `visit_interest = true` e Core autoriza: inserir com `visit_status = pending`
2. Cada mudança de status (`pending → scheduled → confirmed`) é atualizada no registro e registrada em `enova2_operational_history_v2`
3. `scheduled_at` e `location_ref` preenchidos apenas quando há dado real

**Entidade:** `enova2_visit_schedule_v2`

---

### 10.5 Histórico operacional

**O problema que estamos evitando:** perder a trilha de quem fez o quê e quando; impossibilidade de replay; debugging sem evidência.

**Como salvamos:**
1. Append-only — nenhum evento é apagado ou alterado
2. Um evento por ação relevante: transição de stage, sinal aceito, doc recebido, visita agendada, dossiê compilado
3. `actor_layer` identifica quem originou o evento
4. `event_payload_json` contém apenas os campos relevantes para auditoria — não dumps textuais

**Entidade:** `enova2_operational_history_v2`

---

### 10.6 Contexto, sinais e memória viva

**O problema que estamos evitando:** persistir tudo que o cliente disse como dado permanente; perder o contexto entre turnos; confundir dado temporário com dado canônico.

**Como salvamos:**

**Sinais (dado canônico):**
- Extraídos da Frente 3 → inseridos em `enova2_signal_records_v2` com status `pending`
- Aceitos pelo Core → status atualizado para `accepted` com `confirmed_at`
- Permanentes e auditáveis

**Memória viva (dado temporário):**
- Consolidada pelo Adapter a cada turno → upsert em `enova2_memory_runtime_v2`
- Tem TTL explícito (`expires_at`)
- Contém apenas o que é útil para o próximo raciocínio: perguntas abertas, objeções, pendências
- Não persiste transcript bruto — apenas estrutura útil

**Contexto do turno:**
- Normalizado e estruturado → persistido em `enova2_turn_events_v2.normalized_input_json` e `semantic_package_json`
- Trilha permanente mas imutável

---

## 11. Chaves de idempotência por entidade — resumo

| Entidade | Idempotency Key | Comportamento em reprocessamento |
|----------|----------------|----------------------------------|
| `enova2_lead` | `external_ref` | ON CONFLICT DO NOTHING (cria se não existe) |
| `enova2_lead_state_v2` | `(lead_id, source_turn_id)` | ON CONFLICT DO NOTHING (estado é imutável por turno) |
| `enova2_turn_events_v2` | `idempotency_key` | ON CONFLICT DO NOTHING (turno é imutável) |
| `enova2_signal_records_v2` | `(turn_id, signal_key)` | ON CONFLICT UPDATE status (pode confirmar/rejeitar) |
| `enova2_memory_runtime_v2` | `lead_id` | ON CONFLICT UPDATE (memória mais recente vence) |
| `enova2_document_records_v2` | `(lead_id, doc_type)` | ON CONFLICT UPDATE status (status progride, nunca regride) |
| `enova2_dossier_v2` | `lead_id` | ON CONFLICT UPDATE (recompilação substitui) |
| `enova2_visit_schedule_v2` | `(lead_id, source_turn_id)` | ON CONFLICT DO NOTHING por turno |
| `enova2_operational_history_v2` | N/A — append-only | Nunca conflito (sempre INSERT) |
| `enova2_projection_bridge_v2` | `(lead_id, target_system)` | ON CONFLICT UPDATE (projeção mais recente) |

---

## 12. Versionamento e convenção de naming

- Todas as tabelas da ENOVA 2 usam prefixo `enova2_` — separação de namespace em relação à ENOVA 1
- Sufixo `_v2` nas entidades de estado e evento — versionamento explícito de schema
- `_json` sufixo indica coluna JSONB — schema interno a ser refinado por entidade quando necessário
- `_ref` sufixo indica referência externa — nunca o conteúdo bruto
- Todos os IDs primários são UUIDs — sem dependência de auto-incremento do banco

---

## 13. Smoke documental/estrutural do contrato

### 13.1 Verificações de conformidade

| Verificação | Esperado | Status |
|-------------|----------|--------|
| Toda entidade tem PK definida | UUID em todas | ✅ |
| Toda entidade tem `created_at` | Presente em todas | ✅ |
| Toda entidade tem owner de escrita declarado | Adapter em todas | ✅ |
| Toda entidade tem idempotency key ou justificativa de ausência | Definido em todas | ✅ |
| Campos soberanos do Core estão isolados | `stage_current`, `next_objective`, `block_advance`, `policy_flags_json`, `ready_for_visit`, `ready_for_broker_handoff` | ✅ |
| Memória viva tem TTL explícito | `expires_at` obrigatório | ✅ |
| Histórico operacional é append-only | Sem `updated_at`, sem update | ✅ |
| Nenhuma entidade persiste texto final da IA | Nenhum campo `ai_response_text` | ✅ |
| Nenhuma entidade persiste transcript bruto como campo primário | `raw_input_ref` é referência, não conteúdo | ✅ |
| Projeção de compatibilidade tem alvo restrito | `target_system = enova1` único alvo | ✅ |

### 13.2 O que este contrato fecha da PR 41

- [x] Entidades persistíveis definidas (10 entidades)
- [x] Tabelas/colunas canônicas definidas com tipos
- [x] IDs/chaves/timestamps/versionamento definidos por entidade
- [x] O que pode e o que não pode ser persistido declarado explicitamente
- [x] Smoke documental/estrutural executado (seção 13.1)
- [x] Ownership de cada entidade explícito
- [x] Diferença entre estado soberano do Core, dado persistido pelo Adapter, memória viva e projeção de compatibilidade declarada
- [x] Como cada categoria de dado é salva documentado (seção 10)
- [x] Idempotency keys definidas por entidade (seção 11)
- [x] Versionamento e naming conventions definidos (seção 12)

---

## 14. O que este contrato NÃO fecha (fica para PR 42+)

- Migration SQL real
- Criação de tabela real no banco
- Código runtime do Adapter
- Interfaces TypeScript de read/write
- Políticas exatas de TTL da memória viva (PR 43)
- Estratégia de append vs merge vs overwrite por entidade (PR 43)
- Mapa de compatibilidade detalhado para ENOVA 1 (PR 42)
- Smoke persistente com dados reais (PR 44)

---

## 15. Fontes de referência

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
- `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
- `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md` (v1.0 — PR 40)
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` (páginas 126-127)
- Legados L03 e L18 (identificados no INDEX_LEGADO_MESTRE — não transcritos, referenciados via PDF)
