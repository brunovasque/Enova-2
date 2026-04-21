# STATUS VIVO — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Contrato ativo | `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` |
| Estado do contrato | em execução |
| Ultima PR executou qual recorte | PR 41 — contrato de dados e shape persistivel |
| Pendencia contratual | executar PR 42 (adapter base de leitura/escrita canonica) |
| Contrato encerrado? | nao |
| Item do A01 | Prioridade 4 — criar Supabase Adapter com namespace novo, persistencia explicavel e trilho de compatibilidade com ENOVA 1 |
| Estado atual | em execução |
| Classe da ultima tarefa | contratual |
| Ultima PR relevante | PR 41 — contrato de dados e shape persistivel |
| Ultimo commit funcional | N/A — contrato documental (sem codigo funcional runtime) |
| Pendencia remanescente herdada | nenhuma da PR 40; contrato de dados entregue nesta PR 41 |
| Proximo passo autorizado | executar PR 42 — adapter base de leitura/escrita canonica (preservado) |
| Legados aplicaveis | L03 e L18 obrigatorios; L19 complementar quando recorte exigir |
| Mudancas em dados persistidos (Supabase) | nenhuma |
| Permissoes Cloudflare necessarias | nenhuma adicional |
| Ultima atualizacao | 2026-04-21 |

---

## 1. Nome da frente

Supabase Adapter e Persistencia.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`

## 3. Estado atual

Contrato em execução. A PR 41 entregou o contrato de dados persistíveis completo e o shape fechado para a PR 42 implementar o adapter base sem inventar.

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

## 5. Pendencias

- PR 42 — adapter base de leitura/escrita canonica
- PR 43 — politica de merge/update/consistencia
- PR 44 — smoke persistente + closeout formal da frente

## 6. Bloqueios

- sem bloqueio tecnico imediato
- shape de dados está fechado suficientemente para PR 42 implementar

## 7. Proximo passo autorizado

Executar PR 42 — adapter base de leitura/escrita canonica, criando casca tecnica minima com interfaces e boundaries, sem canal externo, sem audio, sem Meta.

## 8. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma

## 9. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 10. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Status da frente lido:       `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03/L18 identificados como nao transcritos
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — paginas 126-127 (Supabase Adapter e Persistencia Inteligente) (Supabase Adapter e Persistencia Inteligente)
