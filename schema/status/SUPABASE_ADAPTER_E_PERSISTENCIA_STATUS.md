# STATUS VIVO — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Contrato ativo | `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` |
| Estado do contrato | em execução |
| Ultima PR executou qual recorte | PR 43 — política de merge/update/consistência e estratégia de TTL |
| Pendencia contratual | executar PR 44 (smoke persistente + closeout formal da frente) |
| Contrato encerrado? | nao |
| Item do A01 | Prioridade 4 — criar Supabase Adapter com namespace novo, persistencia explicavel e trilho de compatibilidade com ENOVA 1 |
| Estado atual | em execução |
| Classe da ultima tarefa | contratual |
| Ultima PR relevante | PR 43 — política de merge/update/consistência e estratégia de TTL |
| Ultimo commit funcional | 1c145c7 — feat(adapter): política canônica de consistência PR43 — policy.ts + policy-smoke.ts |
| Pendencia remanescente herdada | nenhuma da PR 42; casca técnica mínima entregue e política de consistência entregue |
| Proximo passo autorizado | executar PR 44 — smoke persistente + closeout formal da Frente 4 |
| Legados aplicaveis | L03 e L18 obrigatorios; L19 complementar quando recorte exigir |
| Mudancas em dados persistidos (Supabase) | nenhuma — política declarativa sem migration real, sem conexão ao banco |
| Permissoes Cloudflare necessarias | nenhuma adicional |
| Ultima atualizacao | 2026-04-21 |

---

## 1. Nome da frente

Supabase Adapter e Persistencia.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`

## 3. Estado atual

Contrato em execução. A PR 43 entregou a política canônica de consistência do Adapter — comportamento de merge/update/overwrite por entidade, TTL da memória viva e mapa de compatibilidade do projection_bridge para ENOVA 1. A implementação runtime real (com cliente Supabase) e o smoke persistente virão na PR 44.

## 4. Entregas concluidas

- contrato ativo da Frente 4 criado (PR 40)
- indice de contratos atualizado com a Frente 4 ativa (PR 40)
- status vivo da Frente 4 criado (PR 40)
- handoff vivo da Frente 4 criado (PR 40)
- documento canonico de dados/persistencia criado em `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md` (PR 40)
- quebra oficial definida em PR40, PR41, PR42, PR43 e PR44 (PR 40)
- **contrato de dados persistíveis completo criado em `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md` (PR 41)**
- **entidades, campos, ownership, idempotência, versionamento e políticas de retenção definidos por entidade (PR 41)**
- **quatro zonas de soberania de dados declaradas explicitamente (PR 41)**
- **FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md refinado para v1.1.0 com referência ao contrato autoritativo (PR 41)**
- **casca técnica mínima do Supabase Adapter criada em `src/adapter/` (PR 42)**
- **interfaces de leitura/escrita das 10 entidades declaradas em `src/adapter/types.ts` (PR 42)**
- **boundaries e ownership de layers declarados em `src/adapter/boundaries.ts` (PR 42)**
- **SupabaseAdapterBase centralizada em `src/adapter/index.ts` com stubs documentados (PR 42)**
- **smoke do adapter base executado em `src/adapter/smoke.ts` — 4 cenários, 68 assertions, ✅ PASSOU (PR 42)**
- **política canônica de consistência criada em `src/adapter/policy.ts` (PR 43):**
  - WriteStrategy por entidade (append / upsert / overwrite / insert_versioned)
  - ReprocessBehavior por entidade (ignore / update / replace / append)
  - idempotency_key por entidade (10 chaves explícitas)
  - immutable_after_insert por entidade (campos imutáveis após insert)
  - monotonicidade de status por entidade (tabela STATUS_MONOTONICITY)
  - TTL da memória viva: 48h padrão, 72h estendido, 24h mínimo
  - regra de leitura se expirada: found: false
  - regra de refresh: novo upsert a cada turno estende TTL
  - regra de descarte: dado expirado pode ser deletado — não é audit trail
  - mapa de compatibilidade ENOVA 1 (8 campos permitidos, 17 proibidos)
  - pre_write_validation obrigatória antes de upsertProjection
  - POLICY_SUMMARY: tabela-resumo de 10 linhas (uma por entidade)
- **smoke de política da PR 43 executado em `src/adapter/policy-smoke.ts` — 8 cenários, ✅ PASSOU (PR 43)**
- **`package.json` atualizado com `smoke:adapter:policy` incluído em `smoke:all` (PR 43)**

## 5. Pendencias

- PR 44 — smoke persistente com cliente Supabase real + closeout formal da frente

## 6. Bloqueios

- implementacao runtime do Supabase client para PR 44

## 7. Proximo passo autorizado

Executar PR 44 — smoke persistente integrado e closeout formal da Frente 4. A política declarada em `src/adapter/policy.ts` deve ser respeitada fielmente pelo runtime.

## 8. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma — política declarativa sem migration real, sem conexão ao banco

## 9. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 10. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Contrato de dados lido:      `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Adapter base lido:           `src/adapter/types.ts`, `src/adapter/boundaries.ts`, `src/adapter/index.ts`, `src/adapter/smoke.ts`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`

