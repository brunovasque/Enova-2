# STATUS VIVO — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Contrato ativo | `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` |
| Estado do contrato | em execução |
| Ultima PR executou qual recorte | PR 42 — adapter base de leitura/escrita canônica |
| Pendencia contratual | executar PR 43 (politica de merge/update/consistencia) |
| Contrato encerrado? | nao |
| Item do A01 | Prioridade 4 — criar Supabase Adapter com namespace novo, persistencia explicavel e trilho de compatibilidade com ENOVA 1 |
| Estado atual | em execução |
| Classe da ultima tarefa | contratual |
| Ultima PR relevante | PR 42 — adapter base de leitura/escrita canônica |
| Ultimo commit funcional | fdff52d — feat(adapter): criar casca canônica do Supabase Adapter base — PR42 |
| Pendencia remanescente herdada | nenhuma da PR 41; casca tecnica minima do adapter entregue nesta PR 42 |
| Proximo passo autorizado | executar PR 43 — politica de merge/update/consistencia e estrategia de TTL |
| Legados aplicaveis | L03 e L18 obrigatorios; L19 complementar quando recorte exigir |
| Mudancas em dados persistidos (Supabase) | nenhuma — casca com stubs, sem migration real |
| Permissoes Cloudflare necessarias | nenhuma adicional |
| Ultima atualizacao | 2026-04-21 |

---

## 1. Nome da frente

Supabase Adapter e Persistencia.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`

## 3. Estado atual

Contrato em execução. A PR 42 entregou a casca técnica mínima do Supabase Adapter com interfaces, boundaries e smoke. A implementação runtime real (com cliente Supabase) e o smoke persistente virão nas PRs 43 e 44.

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

## 5. Pendencias

- PR 43 — politica de merge/update/consistencia e estrategia de TTL da memoria viva
- PR 44 — smoke persistente + closeout formal da frente

## 6. Bloqueios

- sem bloqueio tecnico imediato
- implementacao runtime do Supabase client para PR 44

## 7. Proximo passo autorizado

Executar PR 43 — politica de merge/update/overwrite detalhada por entidade e estrategia de TTL da memoria viva. Sem client Supabase real ainda.

## 8. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma — casca com stubs, sem migration real, sem conexao ao banco

## 9. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 10. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Contrato de dados lido:      `schema/data/FRENTE4_PERSISTABLE_DATA_CONTRACT.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — paginas 126-127

