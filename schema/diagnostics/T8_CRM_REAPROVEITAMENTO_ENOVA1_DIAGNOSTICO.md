# T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO — Diagnóstico CRM/Infra Operacional Enova 1 → Enova 2

| Campo           | Valor                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------|
| PR              | PR-T8.3                                                                                   |
| Tipo            | PR-DIAG                                                                                   |
| Fase            | T8 — Diagnóstico técnico de aderência contrato × código real                             |
| Data            | 2026-04-29                                                                                |
| Autoria         | Claude Code (Mini-Enavia) — diagnóstico sem modificação de código                        |
| Alias contratual| `schema/diagnostics/T8_CRM_REPO1_DIAGNOSTICO_MIGRACAO.md` (nome no T8 §PR-T8.3)        |
| Fontes          | T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md, LEGADO_MESTRE_ENOVA1_ENOVA2.md, T8_REPO2_INVENTARIO_TECNICO.md, T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md, CONTRATO_IMPLANTACAO_MACRO_T8.md §5.2, T6_DOSSIE_OPERACIONAL.md |
| Restrição       | Repo1 não acessado diretamente — diagnóstico baseado no mapa canônico já internalizado no Repo2 |
| Próxima PR      | PR-T8.4 — PR-IMPL — Migração backend CRM operacional no Repo2                           |

---

## §1 Objetivo e Método

Este diagnóstico mapeia o CRM e a infra operacional da Enova 1 que devem ser reaproveitados na Enova 2, usando exclusivamente o conhecimento canônico já internalizado no Repo2. O Repo1 não foi acessado diretamente; a base de diagnóstico é:

1. **T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md** — classificação executiva do reaproveitamento
2. **LEGADO_MESTRE_ENOVA1_ENOVA2.md** — tabelas Supabase, flags, rotas, contratos CRM
3. **T6_DOSSIE_OPERACIONAL.md** — contrato declarativo de dossiê/correspondente
4. **T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md** — lacunas identificadas (LAC-01..12)
5. **T8_REPO2_INVENTARIO_TECNICO.md** — estado real do Repo2 hoje

**Princípio de leitura:** A Enova 2 não herda o código da Enova 1. Herda o conhecimento — regras de negócio, estrutura de controle, contratos de dados, infra operacional. A casca mecânica de fala, scripts e prefixos são descartados.

---

## §2 Legenda

| Status         | Definição                                                                           |
|----------------|-------------------------------------------------------------------------------------|
| **REAPROV.**   | Pode ser migrado/reutilizado integralmente com adaptação mínima ao contrato T1–T7   |
| **REDESENHAR** | Estrutura útil mas precisa ser redesenhada para remover acoplamento mecânico        |
| **PROIBIDO**   | Não pode ser migrado — viola A00-ADENDO-01/02 ou contrato T8                       |
| **AUSENTE**    | Não existe no Repo2 e precisa ser construído a partir do contrato canônico          |
| **PR-IMPL**    | Indica a PR-T8.x que deve implementar o item                                        |
| **PR-PROVA**   | Indica a PR-T8.x que deve provar o item                                             |

---

## §3 CRM Operacional e Meta

### 3.1 Descrição canônica

O CRM operacional é a camada de gestão de leads: identidade do lead, estado atual do atendimento, histórico de interações, status de qualificação, pendências, risco e controle operacional. É a "vista administrativa" do que o sistema está fazendo com cada lead.

**Tabelas canônicas mapeadas no Legado Mestre (§5.1):**

| Tabela | Função | Campos-núcleo |
|--------|--------|---------------|
| `enova_leads` | Identidade operacional do lead | `lead_id`, `wa_id`, `canal`, `origem`, `status`, timestamps |
| `enova_sessions` | Sessão conversacional | `session_id`, `lead_id`, `started_at`, `ended_at`, `channel_mode` |
| `enova_state_v2` | Estado estruturado atual | `lead_id`, `current_phase`, `current_objective`, `process_mode`, `completion_pct`, `risk_level` |
| `enova_facts` | Fatos atômicos confirmados ou pendentes | `fact_id`, `lead_id`, `fact_key`, `fact_value`, `confidence`, `source_turn_id`, `status` |
| `enova_turns` | Log por turno | `turn_id`, `lead_id`, `role`, `input_type`, `raw_input`, `reply_text`, `model_name`, `latency_ms` |
| `enova_policy_events` | Decisões e travas de policy | `turn_id`, `rule_code`, `action_type`, `outcome`, `reason`, `severity` |
| `enova_memory_snapshots` | Resumo de memória operacional | `lead_id`, `summary_text`, `open_questions`, `contradictions`, `next_must_ask` |
| `enova_artifacts` | Áudios, imagens, docs, transcripts | `artifact_id`, `lead_id`, `type`, `storage_path`, `parsing_status` |

### 3.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Identidade do lead (`enova_leads`) | **REAPROV.** | Estrutura canônica já mapeada; adaptar `wa_id` ao canal WhatsApp real |
| Estado estruturado (`enova_state_v2`) | **REAPROV.** | Compatível com `lead_state` v1 de T2; campos canônicos preservados |
| Fatos atômicos (`enova_facts`) | **REAPROV.** | Alinhado com dicionário `fact_*` de T2 (35 fact_*, 9 derived_*, 6 signal_*) |
| Log de turnos (`enova_turns`) | **REAPROV.** | Estrutura compatível com `TurnoSaida` de T1/T4 |
| Decisões de policy (`enova_policy_events`) | **REAPROV.** | Compatível com T3 policy engine — `rule_code`, `action_type`, `severity` |
| Sessões (`enova_sessions`) | **REAPROV.** | Adaptar `channel_mode` ao contrato de canal T6 |
| Snapshots de memória (`enova_memory_snapshots`) | **REAPROV.** | Compatível com camadas L1-L4 de T2 — reduz custo de contexto |
| Artefatos/docs (`enova_artifacts`) | **REAPROV.** | Compatível com pipeline T6.3/T6.4; `type`/`storage_path` mapeáveis ao Supabase Storage |

**No Repo2 hoje:** `InMemoryPersistenceBackend` tem 10 tabelas in-memory, nenhuma real no Supabase. O CRM como serviço (painel, APIs, rotas HTTP) é **TOTALMENTE AUSENTE**.

**PR-IMPL:** PR-T8.4 (backend) | **PR-PROVA:** PR-T8.6

---

## §4 Histórico de Estágio (Stage History)

### 4.1 Descrição canônica

Registro cronológico dos estágios pelos quais o lead passou: `current_phase` anterior, `current_phase` novo, timestamp da transição, quem ou o que gerou a mudança (LLM, policy, operador).

**Tabelas canônicas relacionadas:**
- `enova_state_v2`: mantém fase atual + `completion_pct`
- `enova_turns`: registra por turno qual fase era ativa
- `enova_policy_events`: registra quando policy gerou mudança de fase

### 4.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Registro de fase atual em `enova_state_v2` | **REAPROV.** | `current_phase`, `current_objective`, `process_mode` já mapeados |
| Trilha de transição de fase via `enova_turns` | **REAPROV.** | Log por turno contém fase ativa — histórico reconstruível |
| View de histórico de estágio por lead | **REDESENHAR** | Vista operacional pode vir do Repo1 mas precisa ser adaptada para o funil T5 (5 fatias: F1-F5) e não para stages hardcoded da Enova 1 |
| Tabela dedicada de `enova_phase_transitions` | **AUSENTE** | Não existe tabela explícita de transições; se necessário para auditoria fina, PR-T8.4 decide |

**PR-IMPL:** PR-T8.4 | **PR-PROVA:** PR-T8.6

---

## §5 Override Log

### 5.1 Descrição canônica

Registro de intervenções manuais do operador (Vasques) sobre o lead: override de stage, edição de fato, reset manual, mudança de modo. Previne que o LLM "desconheça" ações humanas diretas na base.

**Tabelas canônicas relacionadas:**
- `enova_policy_events` com `action_type = 'manual_override'`
- `enova_rollout_events` para eventos de operação

### 5.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Override log via `enova_policy_events` | **REAPROV.** | `action_type`, `outcome`, `reason` capturam qualquer intervenção manual |
| Override log dedicado como tabela separada | **REDESENHAR** | Se Repo1 tinha tabela separada, deve ser fundida com `enova_policy_events` para unificar trilha de auditoria — não criar camada paralela |
| Visibilidade do override no painel CRM | **AUSENTE** | Frontend AUSENTE no Repo2; PR-T8.5 implementa |

**PR-IMPL:** PR-T8.4 (backend) + PR-T8.5 (frontend) | **PR-PROVA:** PR-T8.6

---

## §6 Views Operacionais

### 6.1 Descrição canônica

Consultas/views que consolidam visões úteis para o operador: leads em andamento, leads com pendência documental, leads com risco alto, leads prontos para visita, leads em composição, leads com restrição.

### 6.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| View: leads por `current_phase` | **REAPROV.** | Derivável de `enova_state_v2.current_phase`; mapeia às 5 fatias T5 |
| View: leads com risco | **REAPROV.** | `enova_state_v2.risk_level` + `enova_policy_events.severity='high'` |
| View: leads com fatos pendentes | **REAPROV.** | `enova_facts.status IN ('ambiguous', 'pending')` por `lead_id` |
| View: leads prontos para correspondente | **REAPROV.** | `enova_artifacts` + `enova_state_v2.current_phase = 'F5'` |
| Views que usam stage hardcoded da Enova 1 | **PROIBIDO** | Views acopladas a stages mecânicos da Enova 1 (ex: `stage = 'ELEGIBILIDADE_MECANICA'`) não entram — mapear para fatias T5 |

**PR-IMPL:** PR-T8.4 (definição das views/endpoints) + PR-T8.5 (exibição no painel) | **PR-PROVA:** PR-T8.6

---

## §7 Painel de Arquivos (File Panel)

### 7.1 Descrição canônica

Interface para visualizar, acompanhar e gerenciar documentos do lead recebidos via canal: RG, comprovante de renda, comprovante de residência, carteira de trabalho, certidão de casamento, etc. Organizado por pessoa (P1/P2/P3) e por status (recebido, pendente, rejeitado).

**Tabelas canônicas:**
- `enova_artifacts`: `artifact_id`, `lead_id`, `type`, `storage_path`, `parsing_status`
- Supabase Storage: bucket de docs (a implementar em PR-T8.4/T8.15)

### 7.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Schema `enova_artifacts` | **REAPROV.** | Estrutura canônica alinhada com T6.3/T6.4; `type`, `storage_path`, `parsing_status` suficientes |
| Organização por pessoa (P1/P2/P3) | **REAPROV.** | T6_DOSSIE_OPERACIONAL.md declara organização por P1/P2/P3 |
| Status de documento (recebido/pendente/rejeitado) | **REAPROV.** | `parsing_status` mapeável; ampliar para `doc_status` se necessário |
| Frontend painel de arquivos | **AUSENTE** | Repo2 sem frontend; PR-T8.5 implementa |
| Supabase Storage real | **AUSENTE** | Bucket não declarado em `wrangler.toml`; sem `@supabase/supabase-js`; PR-T8.8/T8.15 implementam |
| Viewer de arquivo (PDF, imagem inline) | **REDESENHAR** | Viewer do Repo1 pode ser aproveitado mas precisa consumir URL do Supabase Storage real, não path local |

**PR-IMPL:** PR-T8.4 + PR-T8.5 | **PR-PROVA:** PR-T8.6

---

## §8 Case-Files

### 8.1 Descrição canônica

O "case-file" é o pacote completo e consolidado do lead para análise: identidade (P1/P2/P3), fatos confirmados, documentos recebidos, histórico de estágio, notas do operador, status do correspondente. É o que vai ao correspondente e o que fica para auditoria.

**Tabelas canônicas envolvidas:** `enova_leads` + `enova_state_v2` + `enova_facts` + `enova_artifacts` + `enova_memory_snapshots` + dossiê operacional (T6_DOSSIE_OPERACIONAL.md §4)

### 8.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Montagem do case-file via join das tabelas canônicas | **REAPROV.** | Estrutura mapeada no T6_DOSSIE_OPERACIONAL.md e Legado Mestre §5.1 |
| Endpoint API de case-file por lead | **AUSENTE** | Nenhuma rota HTTP de CRM no Repo2 hoje |
| Exportação do case-file para correspondente | **REDESENHAR** | Mecanismo de exportação/envio real precisa usar canal governado T6; Repo1 pode ter lógica de exportação mas sem script de fala acoplado |
| Versionamento do case-file | **REAPROV.** | `enova_facts` com histórico por `fact_key`+versão ativa permite rastreamento |

**PR-IMPL:** PR-T8.4 | **PR-PROVA:** PR-T8.6

---

## §9 Abertura Segura

### 9.1 Descrição canônica

Mecanismo que garante que um lead novo é criado de forma idempotente no sistema: `wa_id` único → `lead_id` canônico, sem duplicação, com validação de estado inicial mínimo antes de aceitar primeiro turno.

**Tabelas:** `enova_leads` com unicidade em `wa_id`

### 9.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Criação idempotente de lead (`wa_id` único) | **REAPROV.** | Regra de negócio canônica: um `wa_id` → um `lead_id` ativo; Legado Mestre §5.1 |
| Validação de estado inicial mínimo | **REAPROV.** | `enova_state_v2` com `current_phase = 'F1'` (fatia topo) ao criar |
| Dedup de leads no momento de abertura | **REAPROV.** | Ver §10 — dedup guard está listado como reaproveitável em T0_PR1 |
| Abertura mecânica de lead por stage hardcoded | **PROIBIDO** | Não reproduzir lógica de abertura acoplada a stage mecânico da Enova 1 |
| Endpoint `POST /leads` ou equivalente | **AUSENTE** | Nenhuma rota HTTP de CRM no Repo2 |

**PR-IMPL:** PR-T8.4 | **PR-PROVA:** PR-T8.6

---

## §10 Modo Manual

### 10.1 Descrição canônica

Capacidade do operador (Vasques) de assumir o atendimento diretamente, pausando o LLM, enviando mensagem manual pelo painel, e retomando o fluxo automatizado. Essencial para casos críticos, leads fora de trilho, ou situações de incidente.

**Tabelas canônicas:**
- `enova_policy_events` com `action_type = 'manual_takeover'`
- `enova_state_v2.process_mode = 'manual'`

### 10.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Flag `process_mode = 'manual'` em `enova_state_v2` | **REAPROV.** | Campo canônico previsto no Legado Mestre; compatível com funil T5 |
| Registro de ativação/desativação de modo manual | **REAPROV.** | Via `enova_policy_events` com `action_type = 'manual_takeover'/'manual_release'` |
| Painel de controle de modo manual | **AUSENTE** | Frontend AUSENTE no Repo2; PR-T8.5 implementa |
| Envio de mensagem manual pelo painel (WhatsApp outbound) | **AUSENTE** | Outbound AUSENTE (LAC-04); requer PR-T8.11 + PR-T8.5 |
| Modo manual com script de fala mecânica da Enova 1 | **PROIBIDO** | Modo manual é controle operacional — não herda script de resposta |

**PR-IMPL:** PR-T8.4 (backend) + PR-T8.5 (frontend) + PR-T8.11 (outbound) | **PR-PROVA:** PR-T8.6 + PR-T8.12

---

## §11 Deduplicação (Dedup Guard)

### 11.1 Descrição canônica

Proteção contra duplicação de leads, turnos e eventos. Garante que a mesma mensagem WhatsApp processada duas vezes não gere dois turnos distintos e que o mesmo lead não seja criado duas vezes.

**Bases canônicas:**
- T0_PR1 §1.4: "dedup guard" listado como APROVEITAR
- T6_ADAPTER_META_WHATSAPP.md: idempotência de webhooks (LAC-11 da T8.2)
- `enova_leads` com unicidade em `wa_id`

### 11.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Dedup de lead por `wa_id` | **REAPROV.** | Unicidade por `wa_id` é regra canônica simples e estável |
| Dedup de webhook Meta (idempotência por `message_id`) | **REAPROV.** | T6 adapter contrato prevê; LAC-11 confirma ausência no Repo2; PR-T8.11 implementa |
| Dedup de turno por `turn_id` | **REAPROV.** | `enova_turns` com `turn_id` único garante idempotência de escrita |
| Mecanismo de dedup em `src/meta/ingest.ts` | **AUSENTE** | LAC-11 confirmado: `src/meta/ingest.ts` não tem cache de `message_id` processado |

**PR-IMPL:** PR-T8.4 (dedup de lead e turn) + PR-T8.11 (dedup de webhook) | **PR-PROVA:** PR-T8.12

---

## §12 Reset Consistente

### 12.1 Descrição canônica

Capacidade de resetar o estado de um lead de forma segura e auditada: zerar fatos ambíguos, reiniciar fase, limpar pendências, preservar histórico bruto. "Reset total" da Enova 1 é reaproveitável mas deve preservar `enova_turns` (auditoria) e `enova_facts` com status histórico.

**Bases canônicas:**
- T0_PR1 §1.4: "reset total" listado como APROVEITAR
- Legado Mestre §5.2: regras de escrita na base — fatos têm status (`superseded`, `discarded`)

### 12.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Reset de fase (`current_phase` e `current_objective`) | **REAPROV.** | Atualizar `enova_state_v2` — operação simples e segura |
| Reset de fatos (`enova_facts.status = 'superseded'` para fatos antigos) | **REAPROV.** | Não deletar — marcar como superseded; histórico preservado |
| Preservação de `enova_turns` em qualquer reset | **REAPROV.** | Regra canônica do Legado Mestre: histórico bruto não é apagado |
| Reset que deleta dados de auditoria | **PROIBIDO** | Nunca apagar `enova_turns`, `enova_policy_events` ou fatos com evidência; Legado Mestre §Cláusula de incidentes |
| Endpoint `POST /leads/:id/reset` ou equivalente | **AUSENTE** | Nenhuma rota HTTP de CRM no Repo2 |

**PR-IMPL:** PR-T8.4 | **PR-PROVA:** PR-T8.6

---

## §13 Correspondente

### 13.1 Descrição canônica

O correspondente bancário é o parceiro humano que recebe o dossiê do lead, analisa e retorna aprovação/reprovação/pendência. O CRM registra o status do correspondente, o link do pacote enviado, e o retorno.

**Base canônica principal:** `T6_DOSSIE_OPERACIONAL.md` §2, §5, §6, §7  
**Tabelas:** `enova_leads` (status), `enova_artifacts` (docs), `enova_state_v2` (fase broker_handoff), `enova_policy_events` (retorno do correspondente)  
**Fase T5:** `F5 — docs/visita/handoff` cobre a entrega ao correspondente

### 13.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Registro de `broker_handoff` em `enova_state_v2.current_phase` | **REAPROV.** | Fase F5 do funil T5 cobre exatamente broker_handoff |
| Status do retorno do correspondente (aprovado/reprovado/pendente) | **REAPROV.** | T6_DOSSIE_OPERACIONAL.md §6 declara os estados; `enova_policy_events` registra o retorno |
| Link do correspondente (referência ao pacote) | **REDESENHAR** | Enova 1 pode ter link específico; Enova 2 deve usar URL de Supabase Storage real + contrato T6 dossiê |
| Notificação automática ao correspondente (envio real) | **AUSENTE** | T6_DOSSIE_OPERACIONAL.md §2 declara: "não implementa envio real nesta PR" — PR-T8.4 decide se implementa ou deixa como operação manual |
| Notificação automática ao Vasques quando retorno chega | **AUSENTE** | Não implementado; pode ser simples (webhook ou polling); PR-T8.4 decide |
| Geração de script de fala para o correspondente | **PROIBIDO** | Não criar script mecânico de fala para correspondente; LLM é soberano |

**PR-IMPL:** PR-T8.4 (backend dossiê/correspondente) + PR-T8.5 (painel) | **PR-PROVA:** PR-T8.6

---

## §14 Dossiê

### 14.1 Descrição canônica

Pacote organizado de documentos, informações comerciais e contexto do lead para análise de crédito MCMV. Coberto detalhadamente por `T6_DOSSIE_OPERACIONAL.md`.

**Pessoas:** P1 (titular), P2 (cônjuge/parceiro se composição), P3 (composto/outros)  
**Docs por perfil:** mapeados em `T5_FATIA_DOCS_VISITA_HANDOFF.md` e `T6_CONTRATO_ANEXOS_DOCUMENTOS.md`  
**Estados do dossiê:** incompleto / em_analise / aprovado / reprovado / pendente_complemento

### 14.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Schema do dossiê (enova_artifacts por pessoa P1/P2/P3) | **REAPROV.** | `enova_artifacts.lead_id` + `type` = suficiente; adicionar `person_role` (P1/P2/P3) se não existe |
| Estados do dossiê | **REAPROV.** | `enova_state_v2.current_phase = 'F5'` + `completion_pct` cobrem os estados |
| Docs mínimos por perfil | **REAPROV.** | Mapeados em T5_FATIA_DOCS e T6_CONTRATO_ANEXOS — não reescrever |
| Construção e montagem do dossiê (endpoint API) | **AUSENTE** | Nenhuma rota HTTP no Repo2; PR-T8.4 implementa |
| Visualização do dossiê no painel | **AUSENTE** | Frontend AUSENTE; PR-T8.5 implementa |
| Dossiê que escreve `reply_text` ou decide stage | **PROIBIDO** | Regra-mãe de T6_DOSSIE_OPERACIONAL.md §3: "dossiê organiza — não decide" |

**PR-IMPL:** PR-T8.4 + PR-T8.5 | **PR-PROVA:** PR-T8.6

---

## §15 Trilha de Retorno

### 15.1 Descrição canônica

Registro de auditoria de tudo que aconteceu no atendimento de um lead: turnos, fatos extraídos, policies disparadas, overrides manuais, mudanças de fase, retorno do correspondente. Permite investigação de qualquer incidente.

**Tabelas envolvidas:** `enova_turns` + `enova_policy_events` + `enova_facts` + `enova_rollout_events`

### 15.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Trilha via `enova_turns` (histórico bruto completo) | **REAPROV.** | Cada turno gravado = registro completo com input, reply_text, model, latência |
| Trilha via `enova_policy_events` (decisões e travas) | **REAPROV.** | `rule_code`, `action_type`, `outcome`, `reason`, `severity` por turno |
| Trilha via `enova_facts` com histórico de versão | **REAPROV.** | Legado Mestre §5.2: "facts têm unicidade lógica por lead_id + fact_key + versão ativa, permitindo histórico" |
| Trilha de correspondente (retorno) | **REAPROV.** | T6_DOSSIE_OPERACIONAL.md §7 declara a trilha de auditoria do dossiê |
| Apagar trilha de retorno por "limpeza" | **PROIBIDO** | Legado Mestre Cláusula de incidentes: "nunca apagar trilha necessária para investigar incidente recente" |
| Endpoint `GET /leads/:id/trail` ou equivalente | **AUSENTE** | Nenhuma rota HTTP no Repo2 |

**PR-IMPL:** PR-T8.4 | **PR-PROVA:** PR-T8.6

---

## §16 Telemetria Comparativa

### 16.1 Descrição canônica

Telemetria que compara o comportamento da Enova 2 contra a Enova 1 (shadow mode): mesmos casos, respostas diferentes, divergências de decisão. Também inclui telemetria estrutural: latência, custo por lead, taxa de policy violation, fallback rate.

**Base canônica:** T0_PR1 §1.4: "telemetria comparativa e estrutural" listado como APROVEITAR  
**Tabelas:** `enova_eval_runs`, `enova_rollout_events`, `enova_turns` (latency_ms, model_name)

### 16.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Telemetria estrutural por turno (`latency_ms`, `model_name` em `enova_turns`) | **REAPROV.** | Campos canônicos presentes no schema do Legado Mestre |
| Telemetria de policy violation (`enova_policy_events.severity`) | **REAPROV.** | Cada evento de policy é evidência de telemetria operacional |
| Eval runs (`enova_eval_runs`) para telemetria comparativa | **REAPROV.** | Estrutura: `run_id`, `dataset_version`, `score`, `regressions` — compatível com shadow T7 |
| Rollout events (`enova_rollout_events`) para telemetria de canary | **REAPROV.** | Estrutura: `env`, `cohort`, `action`, `trigger`, `evidence_link` |
| KPIs operacionais (schema_valid rate, fallback rate, custo/lead) | **REAPROV.** | Deriváveis de `enova_turns` + `enova_policy_events` |
| Telemetria de qualidade semântica da fala | **REDESENHAR** | T0_PR1 §1.4: "redesenhar — desacoplada de scripts fixos"; não herdar métricas de qualidade acopladas ao estilo de resposta da Enova 1 |
| Destino externo real da telemetria (Datadog, Grafana, etc.) | **AUSENTE** | RA-G7-04 (restrição ativa); `src/worker.ts` referencia telemetria sem destino externo; PR-T8.13 implementa |
| Painel de telemetria no CRM | **AUSENTE** | Frontend AUSENTE; PR-T8.5 implementa views de KPI |

**PR-IMPL:** PR-T8.4 (backend/endpoints de telemetria) + PR-T8.5 (painel KPI) + PR-T8.13 (destino externo) | **PR-PROVA:** PR-T8.14

---

## §17 Incidentes

### 17.1 Descrição canônica

Sistema de registro, triagem e resposta a incidentes operacionais: lead com comportamento inesperado, policy violation grave, falha de LLM, contradição crítica, rollback disparado.

**Base canônica:** T0_PR1 §1.4: "badges de incidentes" listado como APROVEITAR  
**Tabelas:** `enova_rollout_incidents` (`id`, `phase`, `lead_id`, `turn_id`, `severity`, `root_cause`, `action_taken`, `created_at`)  
**Protocolo:** Legado Mestre §6.6: "conter primeiro, investigar depois; registrar rollout_event e incidente; restaurar rota estável; postmortem em até 24h"

### 17.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Tabela `enova_rollout_incidents` | **REAPROV.** | Estrutura canônica no Legado Mestre; campos suficientes para triagem |
| Registro automático de incidente quando policy `severity='high'` dispara | **REAPROV.** | `enova_policy_events` + trigger para `enova_rollout_incidents` |
| Badges de incidente por lead no painel | **REDESENHAR** | T0_PR1 §1.4: "badges de incidentes" reaproveitável; mas renderização no painel precisa ser implementada no Repo2 (frontend AUSENTE) |
| Protocolo de resposta a incidente (Nível 1/2/3) | **REAPROV.** | Legado Mestre §7 define os 3 níveis — protocolo é documental, sem código a migrar |
| Endpoint para registrar/consultar incidentes | **AUSENTE** | Nenhuma rota HTTP de incidentes no Repo2 |
| Auto-notificação ao Vasques por incidente grave | **AUSENTE** | Não implementado; pode ser simples (webhook ou log); PR-T8.4 decide escopo |

**PR-IMPL:** PR-T8.4 + PR-T8.5 (badges) | **PR-PROVA:** PR-T8.6

---

## §18 Histórico CRM por Etapa

### 18.1 Descrição canônica

Vista consolidada do que aconteceu em cada etapa do funil para um lead específico: quais fatos foram coletados, quais policies dispararam, quais documentos chegaram, quanto tempo ficou em cada fase, status atual.

**Base canônica:** T0_PR1 §1.4: "histórico CRM por etapa" listado como APROVEITAR  
**Tabelas:** `enova_state_v2` + `enova_facts` + `enova_turns` + `enova_policy_events` agrupados por `current_phase`

### 18.2 Diagnóstico

| Componente | Status | Justificativa |
|---|---|---|
| Histórico de fatos por fase (join `enova_facts` × `enova_turns.current_phase`) | **REAPROV.** | Derivável das tabelas canônicas — não precisa de tabela extra |
| Vista de lead completo por etapa (API endpoint) | **AUSENTE** | Nenhuma rota HTTP no Repo2 |
| Vista de etapa no painel CRM | **AUSENTE** | Frontend AUSENTE; PR-T8.5 implementa |
| Histórico acoplado a stage mecânico da Enova 1 | **PROIBIDO** | Não migrar histórico que usa nomenclatura de stage hardcoded; mapear para fatias T5 (F1-F5) |

**PR-IMPL:** PR-T8.4 + PR-T8.5 | **PR-PROVA:** PR-T8.6

---

## §19 Tabela Consolidada: O Que Pode / Deve / É Proibido / Precisa de IMPL / Precisa de PROVA

| # | Componente CRM/Infra | Status | PR-IMPL | PR-PROVA |
|---|---|---|---|---|
| 1 | Schema Supabase (11 tabelas canônicas) | **REAPROV.** | T8.4 | T8.6 |
| 2 | CRM operacional/meta (leads, sessions, state) | **REAPROV.** | T8.4 | T8.6 |
| 3 | Histórico de estágio (turns + state) | **REAPROV.** | T8.4 | T8.6 |
| 4 | View de histórico por fatia (F1-F5) | **REDESENHAR** | T8.4 | T8.6 |
| 5 | Override log via policy_events | **REAPROV.** | T8.4 | T8.6 |
| 6 | Override log como tabela separada | **REDESENHAR** (fundir) | T8.4 | T8.6 |
| 7 | Views operacionais por fase/risco/pendência | **REAPROV.** | T8.4 | T8.6 |
| 8 | Views com stage hardcoded da Enova 1 | **PROIBIDO** | — | — |
| 9 | Painel de arquivos (schema `enova_artifacts`) | **REAPROV.** | T8.4 | T8.6 |
| 10 | Painel de arquivos (frontend) | **AUSENTE** | T8.5 | T8.6 |
| 11 | Supabase Storage para docs reais | **AUSENTE** | T8.8/T8.15 | T8.9 |
| 12 | Case-file (montagem via join) | **REAPROV.** | T8.4 | T8.6 |
| 13 | Exportação case-file para correspondente | **REDESENHAR** | T8.4 | T8.6 |
| 14 | Abertura segura (`wa_id` único) | **REAPROV.** | T8.4 | T8.6 |
| 15 | Abertura mecânica por stage hardcoded | **PROIBIDO** | — | — |
| 16 | Modo manual (`process_mode = 'manual'`) | **REAPROV.** | T8.4 | T8.6 |
| 17 | Envio manual WhatsApp pelo painel | **AUSENTE** | T8.5 + T8.11 | T8.12 |
| 18 | Modo manual com script da Enova 1 | **PROIBIDO** | — | — |
| 19 | Dedup de lead por `wa_id` | **REAPROV.** | T8.4 | T8.6 |
| 20 | Dedup de webhook Meta (message_id) | **REAPROV.** | T8.11 | T8.12 |
| 21 | Reset de fase + fatos (status superseded) | **REAPROV.** | T8.4 | T8.6 |
| 22 | Reset que deleta dados de auditoria | **PROIBIDO** | — | — |
| 23 | Correspondente (broker_handoff, estados) | **REAPROV.** | T8.4 | T8.6 |
| 24 | Link do correspondente (Supabase Storage URL) | **REDESENHAR** | T8.4 | T8.6 |
| 25 | Envio automático ao correspondente | **AUSENTE** | T8.4 (decide) | T8.6 |
| 26 | Schema do dossiê (artifacts P1/P2/P3) | **REAPROV.** | T8.4 | T8.6 |
| 27 | Dossiê que decide stage | **PROIBIDO** | — | — |
| 28 | Trilha de retorno (turns + facts + policy_events) | **REAPROV.** | T8.4 | T8.6 |
| 29 | Apagar trilha por limpeza | **PROIBIDO** | — | — |
| 30 | Telemetria estrutural (latency, model, KPIs) | **REAPROV.** | T8.4 | T8.6 |
| 31 | Telemetria comparativa (eval_runs) | **REAPROV.** | T8.4 | T8.14 |
| 32 | Telemetria de qualidade semântica da fala | **REDESENHAR** | T8.13 | T8.14 |
| 33 | Destino externo telemetria (Datadog/Grafana) | **AUSENTE** | T8.13 | T8.14 |
| 34 | Tabela `enova_rollout_incidents` | **REAPROV.** | T8.4 | T8.6 |
| 35 | Badges de incidente no painel | **REDESENHAR** | T8.5 | T8.6 |
| 36 | Auto-notificação ao Vasques (incidente grave) | **AUSENTE** | T8.4 (decide) | T8.6 |
| 37 | Histórico CRM por etapa (API + painel) | **REAPROV.** schema / **AUSENTE** API+frontend | T8.4 + T8.5 | T8.6 |

---

## §20 Plano de Migração: Sequência por PR

### PR-T8.4 — Backend CRM (PR-IMPL)
Implementar no Repo2:
- Migrations SQL: criar as 11 tabelas canônicas no Supabase real
- Endpoint `POST /leads` — abertura segura com dedup `wa_id`
- Endpoint `GET /leads/:id` — case-file consolidado
- Endpoint `GET /leads/:id/state` — estado estruturado atual
- Endpoint `GET /leads/:id/facts` — fatos por lead
- Endpoint `GET /leads/:id/trail` — trilha de retorno
- Endpoint `GET /leads` — lista com views operacionais (por fase, risco, pendência)
- Endpoint `POST /leads/:id/reset` — reset seguro (supersede fatos, não deleta)
- Endpoint `POST /leads/:id/override` — override manual (registra em policy_events)
- Endpoint `PATCH /leads/:id/mode` — toggle modo manual
- Endpoint `GET /leads/:id/dossier` — dossiê por lead
- Registrar incidente automaticamente quando policy `severity='high'`
- Integração com `InMemoryPersistenceBackend` → substituir por Supabase real (via PR-T8.8)

### PR-T8.5 — Frontend CRM (PR-IMPL)
Implementar no Repo2:
- Painel de leads (lista + filtros por fase/risco)
- Vista de lead: state, fatos, turno, dossiê, correspondente
- Painel de arquivos (P1/P2/P3, status de doc)
- Vista histórico CRM por etapa (F1-F5)
- Override log e badges de incidente
- Modo manual (toggle + envio de mensagem)
- KPIs de telemetria (latência, policy violations, fallback rate)

### PR-T8.6 — Prova CRM (PR-PROVA)
Provar:
- Abertura de lead, coleta de fatos, correspondente, trilha — ponta a ponta
- Painel abrindo e consumindo dados reais do Supabase
- Override manual registrado com trilha completa
- Reset seguro sem perda de auditoria
- Dedup funcionando (tentar criar lead duplicado)

---

## §21 O Que É Proibido Reaproveitar (Consolidado)

| Item proibido | Razão |
|---|---|
| Casca mecânica de fala (scripts, prefixos, reprompts rígidos) | Viola A00-ADENDO-01: LLM é soberano na fala |
| Fallback textual estático por stage | Viola A00-ADENDO-02: Enova 2 não é bot de regras |
| Views acopladas a stage hardcoded da Enova 1 | Stages mecânicos da Enova 1 não mapeiam para fatias T5 |
| Abertura mecânica de lead por stage | Violação do contrato de abertura segura T8 |
| Dossiê que decide stage ou escreve fala | T6_DOSSIE_OPERACIONAL.md §3: "dossiê organiza — não decide" |
| Reset que deleta `enova_turns` ou `enova_policy_events` | Violação da cláusula de incidentes do Legado Mestre |
| Modo manual com script mecânico | Modo manual é controle operacional — LLM permanece soberano quando reativado |
| Herdar telemetria acoplada a qualidade de fala roteirizada | T0_PR1 §1.4: "redesenhar" |
| Qualquer regra que retire soberania de linguagem da IA | A00-ADENDO-01 vigente em T8 |

---

## §22 Bloco E — Evidência de Conclusão

| Campo | Valor |
|-------|-------|
| Fechamento permitido | **Sim** |
| Tipo da PR | PR-DIAG |
| Artefato criado | `schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md` (este arquivo) |
| Alias contratual | `schema/diagnostics/T8_CRM_REPO1_DIAGNOSTICO_MIGRACAO.md` (T8 §PR-T8.3) |
| Fontes lidas | T0_PR1 (134 linhas), LEGADO_MESTRE §5.1/5.2/6.5/7 (~500 linhas lidas), T6_DOSSIE_OPERACIONAL.md (80 linhas), CONTRATO_IMPLANTACAO_MACRO_T8.md §5.2 (60 linhas), T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md (completo) |
| Repo1 acessado diretamente | Não — diagnóstico baseado no mapa canônico já internalizado no Repo2 |
| Código modificado | Nenhum — PR-DIAG não toca `src/` |
| Itens mapeados | 37 componentes CRM/infra (§19 tabela consolidada) |
| Contagem por status | REAPROV.: 18 | REDESENHAR: 7 | PROIBIDO: 9 | AUSENTE: 3 únicos (frontend, Storage, telemetria externa) |
| Lacunas bloqueantes para PR-T8.4 | Nenhuma — diagnóstico suficiente para iniciar migração backend |
| Tabelas canônicas mapeadas | 11 (enova_leads, enova_sessions, enova_state_v2, enova_facts, enova_turns, enova_policy_events, enova_memory_snapshots, enova_prompt_registry, enova_eval_runs, enova_rollout_events, enova_artifacts + enova_rollout_incidents) |
| Próxima PR autorizada | PR-T8.4 — PR-IMPL — Migração backend CRM operacional no Repo2 |
| Restrição herdada | Nenhuma ativação real antes de autorização de Vasques; CRM não pode usar scripts de fala da Enova 1 |
| Data de fechamento | 2026-04-29 |
