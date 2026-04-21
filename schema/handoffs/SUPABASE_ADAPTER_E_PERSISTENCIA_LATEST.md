# HANDOFF — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Data | 2026-04-21 |
| Estado da frente | em execução |
| Classificacao da tarefa | contratual |
| Ultima PR relevante | PR 43 — política de merge/update/consistência e estratégia de TTL |
| Contrato ativo | `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` |
| Recorte executado do contrato | PR 43 — política de merge/update/consistência e estratégia de TTL |
| Pendencia contratual remanescente | PR44 |
| Houve desvio de contrato? | nao |
| Contrato encerrado nesta PR? | nao |
| Item do A01 atendido | Prioridade 4 — política de consistência do Adapter declarada e provada com smoke |
| Proximo passo autorizado | PR 44 — smoke persistente com Supabase real + closeout formal da Frente 4 |
| Proximo passo foi alterado? | nao |
| Tarefa fora de contrato? | nao (recorte contratual da PR 43) |
| Mudancas em dados persistidos (Supabase) | nenhuma — política declarativa sem migration real, sem conexão ao banco |
| Permissoes Cloudflare necessarias | nenhuma adicional |

---

## 1. Contexto curto

A PR 42 entregou a casca técnica mínima do Supabase Adapter com interfaces, boundaries e smoke base.
Nesta **PR 43**, entregamos a **política canônica de consistência** em `src/adapter/policy.ts` — o arquivo que define explicitamente:

- como cada entidade é escrita (append / upsert / overwrite / insert_versioned)
- o que acontece no reprocessamento (ignore / update / replace / append)
- quais campos são imutáveis após insert
- a monotonicidade de status por entidade (transições válidas e inválidas)
- TTL da memória viva: 48h padrão, 72h estendido, 24h mínimo, 72h máximo
- regras de leitura, refresh e descarte da memória viva
- mapa de compatibilidade ENOVA 1: 8 campos permitidos, 17 proibidos
- pre_write_validation obrigatória antes de upsertProjection

O smoke da PR 43 (`src/adapter/policy-smoke.ts`) valida toda esta declaração — 8 cenários, ✅ PASSOU.

**A PR 44 implementa o runtime que RESPEITA esta política.** Este arquivo (policy.ts) é declarativo — não contém lógica de negócio.

## 2. Classificacao da tarefa

contratual

## 3. Ultima PR relevante

PR 42 — adapter base de leitura/escrita canônica (casca técnica, interfaces, boundaries, smoke base).

## 4. O que a PR anterior fechou

- casca técnica mínima do Supabase Adapter (`src/adapter/`)
- interfaces de leitura/escrita das 10 entidades (`types.ts`)
- boundaries e ownership de layers (`boundaries.ts`)
- SupabaseAdapterBase com stubs documentados (`index.ts`)
- smoke do adapter base: 4 cenários, 68 assertions, ✅ PASSOU (`smoke.ts`)

## 5. O que a PR anterior NAO fechou

- política exata de append vs merge vs overwrite por entidade
- estratégia de TTL da memória viva (valores numéricos formais)
- mapa de compatibilidade ENOVA 1 detalhado para projection_bridge
- smoke de política (sem Supabase real ainda)

## 6. Diagnostico confirmado

- `schema/contracts/_INDEX.md` confirmou Frente 4 ativa com PR 43 como próximo passo autorizado
- status e handoff da PR 42 confirmaram: `Próximo passo autorizado: PR 43`
- `FRENTE4_PERSISTABLE_DATA_CONTRACT.md` lido como contrato autoritativo das 10 entidades
- contrato ativo confirmou: PR 43 é recorte contratual autorizado com microetapas 1-5

## 7. O que foi feito

- criado `src/adapter/policy.ts` — política canônica de consistência (PR 43):
  - **Seção A** — Tipos canônicos: WriteStrategy, ReprocessBehavior, MonotonicityLevel, EntityConsistencyPolicy
  - **Seção B** — Política por entidade (10 políticas declaradas individualmente):
    - POLICY_LEAD: upsert, ignore, idempotency por external_ref
    - POLICY_LEAD_STATE: insert_versioned, ignore, idempotency por (lead_id, source_turn_id)
    - POLICY_TURN_EVENTS: append, ignore, idempotency por idempotency_key
    - POLICY_SIGNALS: upsert, ignore, idempotency por (turn_id, signal_key)
    - POLICY_MEMORY_RUNTIME: overwrite, replace, idempotency por lead_id
    - POLICY_DOCUMENTS: upsert, update, idempotency por (lead_id, doc_type)
    - POLICY_DOSSIER: overwrite, replace, idempotency por lead_id
    - POLICY_VISIT_SCHEDULE: append, ignore, idempotency por (lead_id, source_turn_id)
    - POLICY_OPERATIONAL_HISTORY: append, ignore, idempotency por (lead_id, turn_id, event_type)
    - POLICY_PROJECTION_BRIDGE: overwrite, replace, idempotency por (lead_id, target_system)
  - **Seção C** — TTL da memória viva:
    - TTL_DEFAULT_HOURS = 48
    - TTL_EXTENDED_HOURS = 72
    - TTL_MINIMUM_HOURS = 24
    - TTL_MAXIMUM_HOURS = 72
    - regra de leitura expirada: found: false
    - regra de refresh: upsert a cada turno estende TTL
    - regra de descarte: expirado pode ser deletado — não é audit trail
  - **Seção D** — Projection bridge ENOVA 1:
    - PROJECTION_BRIDGE_ENOVA1_ALLOWED_FIELDS (8 campos)
    - PROJECTION_BRIDGE_ENOVA1_PROHIBITED_FIELDS (17 campos)
    - compatibility_map com fonte e condição de cada campo
    - pre_write_validation obrigatória
  - **Seção E** — Monotonicidade de status por entidade:
    - STATUS_MONOTONICITY: lead, signals, documents, visit_schedule
    - transições válidas e inválidas declaradas explicitamente
  - **Seção F** — POLICY_SUMMARY: tabela-resumo de 10 linhas com never_regresses por entidade
  - **ADAPTER_CONSISTENCY_POLICY** — objeto canônico unificado para PR 44
- criado `src/adapter/policy-smoke.ts` — smoke da PR 43:
  - 8 cenários, todos os critérios de aceite da PR 43 validados, ✅ PASSOU
  - Cenário 1: cobertura das 10 entidades na política consolidada
  - Cenário 2: estratégias de escrita por entidade
  - Cenário 3: campos imutáveis e TTL
  - Cenário 4: TTL numérico e invariantes lógicos
  - Cenário 5: projection bridge — campos permitidos, proibidos e mapa ENOVA 1
  - Cenário 6: monotonicidade de status (transições válidas e inválidas)
  - Cenário 7: consistência entre POLICY_SUMMARY e ENTITY_CONSISTENCY_POLICY
  - Cenário 8: metadados, vínculos contratuais e soberanias
- atualizado `package.json` — adicionado `smoke:adapter:policy` e incluído em `smoke:all`
- atualizado `schema/contracts/_INDEX.md` — PR 43 como última PR que executou
- atualizado `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- atualizado `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md` (este arquivo)

## 8. O que nao foi feito

- nao foi implementado Supabase client real
- nao foi criada migration SQL real
- nao foi criada tabela real no banco
- nao foi implementado write path runtime real (policy.ts é declarativo)
- nao foi criado endpoint funcional novo
- nao houve mudanca em audio, Meta/WhatsApp, telemetria ou rollout
- smoke persistente com dados reais (fica para PR 44)

## 9. O que esta PR fechou

- microetapa 1 da PR 43: política de append vs merge vs overwrite por entidade ✅
- microetapa 2 da PR 43: estratégia de TTL da memória viva ✅
- microetapa 3 da PR 43: mapa de compatibilidade ENOVA 1 para projection_bridge ✅
- microetapa 4 da PR 43: expiração/limpeza da memória viva definida ✅
- microetapa 5 da PR 43: smoke de política executado e aprovado ✅

## 10. O que continua pendente apos esta PR

- PR 44 — smoke persistente com cliente Supabase real + closeout formal da Frente 4

## 11. Esta tarefa foi fora de contrato?

nao

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`

## 11b. Recorte executado do contrato

PR 43 — política de merge/update/consistência e estratégia de TTL — todas as 5 microetapas concluídas.

## 11c. Pendencia contratual remanescente

PR44.

## 11d. Houve desvio de contrato?

nao

## 11e. Contrato encerrado nesta PR?

nao

## 12. Arquivos relevantes

- `src/adapter/policy.ts` ← **criado nesta PR 43**
- `src/adapter/policy-smoke.ts` ← **criado nesta PR 43**
- `package.json` ← atualizado nesta PR 43 (smoke:adapter:policy + smoke:all)
- `src/adapter/types.ts` (contrato autoritativo de tipos — PR 42)
- `src/adapter/boundaries.ts` (ownership de layers — PR 42)
- `src/adapter/index.ts` (SupabaseAdapterBase com stubs — PR 42)
- `src/adapter/smoke.ts` (smoke base — PR 42)
- `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md` (contrato autoritativo — PR 41)
- `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
- `schema/contracts/_INDEX.md`
- `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`

## 13. Item do A01 atendido

Prioridade 4 — política de consistência do Adapter declarada, testada e aprovada. Comportamento explícito por entidade, TTL da memória viva e mapa de compatibilidade ENOVA 1 formalizados.

## 14. Estado atual da frente

em execução

## 15. Proximo passo autorizado

PR 44 — smoke persistente com cliente Supabase real + closeout formal da Frente 4:
1. acceptance smoke de persistência com dados reais
2. prova de consistência por replay seguro respeitando policy.ts
3. prova de soberania preservada (Core regra, IA fala, Adapter persiste)
4. executar `CONTRACT_CLOSEOUT_PROTOCOL.md`
5. arquivar contrato e atualizar vivos

## 16. Riscos

- risco de drift da PR 44 em relação à política declarada em policy.ts — mitigação: PR 44 deve importar ADAPTER_CONSISTENCY_POLICY e validar por entidade
- risco de campo proibido vazar para projection_payload_json — mitigação: pre_write_validation declarada e validada no smoke
- risco de TTL não ser respeitado no runtime — mitigação: getActiveMemory deve checar expires_at antes de retornar
- risco de status regredir em signals/documents/visits — mitigação: STATUS_MONOTONICITY com transições inválidas declaradas e testadas

## 17. Provas

- `src/adapter/policy.ts` criado — 10 políticas, TTL, projection_bridge, monotonicity, POLICY_SUMMARY
- `src/adapter/policy-smoke.ts` criado e executado: 8/8 cenários passaram, exit 0
- `package.json` atualizado com `smoke:adapter:policy`
- `schema/contracts/_INDEX.md` atualizado — PR 43 como última PR executada
- `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md` atualizado
- smoke do adapter base (PR 42) continua passando: 4/4 cenários, exit 0

## 18. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma — política declarativa sem migration real, sem conexão ao banco

## 19. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Contrato de dados lido:      `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Adapter base lido:           `src/adapter/types.ts`, `src/adapter/boundaries.ts`, `src/adapter/index.ts`, `src/adapter/smoke.ts`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`

---

## ESTADO HERDADO (para PR 44)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR 43 — política de merge/update/consistência e estratégia de TTL
Contrato ativo: schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md
Objetivo imutável do contrato: persistência canônica idempotente e auditável com separação de soberanias
Recorte a executar na PR 44: smoke persistente com Supabase real + closeout formal da Frente 4
Item do A01: Prioridade 4
Estado atual da frente: em execução
O que a PR 43 fechou: política de consistência completa, TTL da memória viva, mapa de compatibilidade ENOVA 1, smoke de política aprovado
O que a PR 43 NAO fechou: runtime real do Supabase, migration, smoke persistente com dados reais
Por que a PR 44 existe: provar o behavior declarado na política com dados reais e encerrar formalmente a Frente 4
Esta tarefa está dentro do contrato ativo: dentro
Objetivo da PR 44: smoke persistente integrado + closeout formal
Escopo: acceptance smoke de persistência, prova de replay seguro, prova de soberania, closeout protocolar
Fora de escopo: áudio, Meta/WhatsApp, telemetria, rollout
Houve desvio de contrato?: nao
Mudanças em dados persistidos (Supabase): a declarar na PR 44 (primeiro write real)
Permissões Cloudflare necessárias: nenhuma adicional
```


---

## 1. Contexto curto

A PR 41 entregou o contrato de dados persistíveis completo com as 10 entidades, ownership, idempotência e zonas de soberania.
Nesta PR 42, entregamos a **casca técnica mínima do Supabase Adapter** em `src/adapter/` — com interfaces de leitura/escrita, boundaries explícitas e smoke base.

O adapter nasce como camada única e explícita. Todo write/read futuro das tabelas `enova2_*` passa por esta camada. O Core entrega payload — o Adapter projeta/persiste. Speech e Context não escrevem direto.

## 2. Classificacao da tarefa

contratual

## 3. Ultima PR relevante

PR 41 — contrato de dados e shape persistivel (10 entidades, shape fechado).

## 4. O que a PR anterior fechou

- contrato de dados persistíveis completo criado (`FRENTE4_PERSISTABLE_DATA_CONTRACT.md`)
- 10 entidades com campos, tipos, ownership, idempotência, versionamento e retenção
- quatro zonas de soberania de dados declaradas
- smoke documental/estrutural do contrato executado (seção 13.1)

## 5. O que a PR anterior NAO fechou

- interfaces TypeScript de read/write do adapter
- casca técnica do adapter (módulo, classe, stubs)
- boundaries explícitas de layer (quem pode, quem não pode escrever direto)
- smoke do adapter base

## 6. Diagnostico confirmado

- `schema/contracts/_INDEX.md` confirmou Frente 4 ativa com PR 42 como próximo passo autorizado
- status e handoff da PR 41 confirmaram: `Próximo passo autorizado: PR 42 — adapter base de leitura/escrita canonica`
- `FRENTE4_PERSISTABLE_DATA_CONTRACT.md` lido como contrato autoritativo das 10 entidades
- contrato ativo confirmou: PR 42 é recorte contratual autorizado com microetapas 1-5

## 7. O que foi feito

- criado `src/adapter/types.ts` — interfaces e tipos das 10 entidades:
  - `AdapterLeadRecord`, `AdapterLeadWriteInput`, `AdapterLeadUpdateInput`
  - `AdapterLeadStateRecord`, `AdapterLeadStateWriteInput`
  - `AdapterTurnEventRecord`, `AdapterTurnEventWriteInput`
  - `AdapterSignalRecord`, `AdapterSignalWriteInput`, `AdapterSignalStatusUpdateInput`
  - `AdapterMemoryRuntimeRecord`, `AdapterMemoryRuntimeWriteInput`
  - `AdapterDocumentRecord`, `AdapterDocumentWriteInput`, `AdapterDocumentStatusUpdateInput`
  - `AdapterDossierRecord`, `AdapterDossierWriteInput`
  - `AdapterVisitScheduleRecord`, `AdapterVisitScheduleWriteInput`, `AdapterVisitStatusUpdateInput`
  - `AdapterOperationalHistoryRecord`, `AdapterOperationalHistoryAppendInput`
  - `AdapterProjectionBridgeRecord`, `AdapterProjectionBridgeWriteInput`
  - `AdapterWriteResult<T>`, `AdapterReadResult<T>`, `AdapterListResult<T>`
  - `IAdapterLeadOps` ... `IAdapterProjectionBridgeOps` (10 interfaces de operação)
  - `ISupabaseAdapter` (interface completa — extends todas as 10)
- criado `src/adapter/boundaries.ts` — boundaries e ownership:
  - `ADAPTER_ROLE` — papel soberano (persistence_only, may_decide_business_rule: false...)
  - `ADAPTER_ALLOWED_CALLERS` — worker, core_mechanical, async_worker, human_admin
  - `ADAPTER_PROHIBITED_DIRECT_WRITERS` — context_extraction, speech_engine, llm_layer...
  - `CORE_SOVEREIGN_FIELDS` — campos que o Adapter projeta, nunca calcula (6 campos)
  - `ADAPTER_WRITE_OWNERSHIP` — mapa de ownership das 10 entidades (writer: 'adapter' em todas)
  - `ADAPTER_CANONICAL_CONSTRAINTS` — 11 constraints declaradas em código
- criado `src/adapter/index.ts` — `SupabaseAdapterBase`:
  - única porta de entrada para write/read das tabelas `enova2_*`
  - stubs documentados para todas as 26 operações (10 entidades)
  - PLACEHOLDER marcado — implementação runtime na PR 44
  - constraints, role, coreSovereignFields, writeOwnership declarados na instância
- criado `src/adapter/smoke.ts` — smoke do adapter base:
  - 4 cenários, 68 assertions, ✅ PASSOU
  - Cenário 1: instância, role e constraints canônicas
  - Cenário 2: stubs retornam not_implemented para todas as 10 entidades
  - Cenário 3: boundaries, campos soberanos do Core e ownership por layer
  - Cenário 4: cobertura completa das 10 entidades (operações + ownership)
- atualizado `package.json` — adicionado `smoke:adapter` e incluído em `smoke:all`
- atualizado `schema/contracts/_INDEX.md` — PR 42 como última PR que executou
- atualizado `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- atualizado `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`

## 8. O que nao foi feito

- nao foi implementado Supabase client real
- nao foi criada migration SQL real
- nao foi criada tabela real no banco
- nao foi criado write path runtime real (placeholder para PR 44)
- nao foi criado endpoint funcional novo
- nao houve mudanca em audio, Meta/WhatsApp, telemetria ou rollout
- politica de TTL exata da memoria viva (fica para PR 43)
- estrategia de append vs merge vs overwrite por entidade (fica para PR 43)
- mapa de compatibilidade ENOVA 1 detalhado (fica para PR 43)
- smoke persistente com dados reais (fica para PR 44)

## 9. O que esta PR fechou

- microetapa 1 da PR 42: interfaces de leitura/escrita declaradas
- microetapa 2 da PR 42: ownership de cada write path declarado explicitamente
- microetapa 3 da PR 42: integração centralizada em `src/adapter/` sem espalhar chamada direta
- microetapa 4 da PR 42: sem canal externo, sem áudio, sem Meta
- microetapa 5 da PR 42: smoke do adapter base executado e aprovado

## 10. O que continua pendente apos esta PR

- PR 43 — politica de merge/update/consistencia e estrategia de TTL
- PR 44 — smoke persistente + closeout formal da frente

## 11. Esta tarefa foi fora de contrato?

nao

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`

## 11b. Recorte executado do contrato

PR 42 — adapter base de leitura/escrita canônica — todas as 5 microetapas concluídas.

## 11c. Pendencia contratual remanescente

PR43 e PR44.

## 11d. Houve desvio de contrato?

nao

## 11e. Contrato encerrado nesta PR?

nao

## 12. Arquivos relevantes

- `src/adapter/types.ts` ← **criado nesta PR 42**
- `src/adapter/boundaries.ts` ← **criado nesta PR 42**
- `src/adapter/index.ts` ← **criado nesta PR 42**
- `src/adapter/smoke.ts` ← **criado nesta PR 42**
- `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md` (contrato autoritativo — PR 41)
- `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
- `schema/contracts/_INDEX.md`
- `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`

## 13. Item do A01 atendido

Prioridade 4 — casca técnica mínima do Supabase Adapter entregue com interfaces, boundaries e smoke base aprovado.

## 14. Estado atual da frente

em execução

## 15. Proximo passo autorizado

PR 43 — politica de merge/update/consistencia e estrategia de TTL da memoria viva:
1. política exata de append vs merge vs overwrite por entidade
2. estratégia de TTL da memória viva (24h–72h — parâmetros formais)
3. mapa de compatibilidade ENOVA 1 detalhado para projection_bridge
4. smoke de política (sem Supabase real ainda)

## 16. Riscos

- risco de drift da implementação runtime (PR 44) em relação aos tipos declarados aqui — mitigação: ISupabaseAdapter deve ser implementada fielmente
- risco de TTL da memória viva não ser definido antes da PR 44 — mitigação: PR 43 cobre isso obrigatoriamente
- risco de escrita direta nas tabelas bypassar o Adapter — mitigação: ADAPTER_PROHIBITED_DIRECT_WRITERS declarado em código e em smoke

## 17. Provas

- `src/adapter/types.ts` criado (10 entidades, 26 operações, ISupabaseAdapter)
- `src/adapter/boundaries.ts` criado (ADAPTER_ROLE, ALLOWED_CALLERS, PROHIBITED_DIRECT_WRITERS, CORE_SOVEREIGN_FIELDS, WRITE_OWNERSHIP, CONSTRAINTS)
- `src/adapter/index.ts` criado (SupabaseAdapterBase com stubs documentados)
- `src/adapter/smoke.ts` criado e executado: 4/4 cenários passaram, 68 assertions, exit 0
- `package.json` atualizado com `smoke:adapter`
- status, handoff e _INDEX.md atualizados

## 18. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma — casca com stubs, sem migration real, sem conexao ao banco

## 19. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Contrato de dados lido:      `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md`
  Schema canonico lido:        `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — paginas 126-127

---



A Frente 3 foi encerrada formalmente na PR39 e autorizou a abertura da Frente 4.
Nesta PR40, abrimos a governanca completa da Frente 4 com contrato ativo, vivos e desenho canonico de persistencia, sem implementacao real de Supabase.

O foco foi estruturar a frente para execucao em cinco PRs (40-44), mantendo as soberanias separadas: Core decide regras, IA fala, Adapter persiste.

## 2. Classificacao da tarefa

governanca

## 3. Ultima PR relevante

PR 39 — acceptance smoke + closeout da Frente 3.

## 4. O que a PR anterior fechou

- acceptance smoke final da Frente 3
- closeout protocolar da Frente 3
- contrato da Frente 3 arquivado
- Frente 4 definida como proximo passo autorizado

## 5. O que a PR anterior NAO fechou

- abertura formal do contrato da Frente 4
- criacao dos vivos da Frente 4
- desenho canonico da persistencia da Frente 4

## 6. Diagnostico confirmado

- `schema/contracts/_INDEX.md` mostrava a Frente 4 como "aguardando abertura"
- status/handoff da Frente 3 confirmavam encerramento e proximo passo autorizado para abrir Frente 4
- `INDEX_LEGADO_MESTRE` confirma L03 e L18 como blocos obrigatorios para Supabase Adapter
- PDF mestre (paginas 126-127) foi consultado e reforca:
  - separacao cerebro conversacional x escrita fisica
  - idempotencia e auditabilidade obrigatorias
  - estrategia `enova2_*`/auxiliares e projecao controlada

## 7. O que foi feito

- criado `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
- criado `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md`
- criado `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- criado `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
- atualizado `schema/contracts/_INDEX.md`
- atualizado `schema/status/_INDEX.md`
- atualizado `schema/handoffs/_INDEX.md`

## 8. O que nao foi feito

- nao foi implementado Supabase real
- nao foi criada migration SQL real
- nao foi criada tabela real
- nao foi criado write path/runtime real
- nao foi criado endpoint funcional
- nao houve mudanca em audio, Meta/WhatsApp, telemetria ou rollout

## 9. O que esta PR fechou

- abertura contratual completa da Frente 4
- quebra oficial PR40-PR44 com microetapas
- desenho canonico de dados/persistencia da frente
- abertura dos vivos da frente (status e handoff)

## 10. O que continua pendente apos esta PR

- PR 41 — contrato de dados e shape persistivel
- PR 42 — adapter base de leitura/escrita canonica
- PR 43 — politica de merge/update/consistencia
- PR 44 — smoke persistente + closeout formal

## 11. Esta tarefa foi fora de contrato?

nao

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`

## 11b. Recorte executado do contrato

PR 40 — abertura contratual da frente + schema canonico documental.

## 11c. Pendencia contratual remanescente

PR41, PR42, PR43 e PR44.

## 11d. Houve desvio de contrato?

nao

## 11e. Contrato encerrado nesta PR?

nao

## 12. Arquivos relevantes

- `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
- `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md`
- `schema/contracts/_INDEX.md`
- `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
- `schema/status/_INDEX.md`
- `schema/handoffs/_INDEX.md`

## 13. Item do A01 atendido

Prioridade 4 — criacao da base contratual para Supabase Adapter e Persistencia explicavel.

## 14. Estado atual da frente

contrato aberto

## 15. Proximo passo autorizado

PR 41 — contrato de dados e shape persistivel, mantendo o recorte sem migration real e sem write path runtime real.

## 16. Riscos

- risco de drift para implementacao real de banco antes da PR41/PR42
- risco de misturar persistencia com autoria de fala
- risco de persistencia caotica (texto bruto sem governanca)

## 17. Provas

- contrato ativo da Frente 4 aberto no indice de contratos
- status vivo da Frente 4 criado
- handoff vivo da Frente 4 criado
- documento canonico de persistencia criado
- consulta ao PDF mestre paginas 126-127 registrada

## 18. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma

## 19. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Status da frente lido:       `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03/L18 identificados como nao transcritos
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — paginas 126-127
