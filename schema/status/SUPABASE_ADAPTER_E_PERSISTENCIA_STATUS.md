# STATUS VIVO — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Contrato ativo | `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` |
| Estado do contrato | aberto |
| Ultima PR executou qual recorte | PR 40 — abertura contratual + schema canonico de persistencia |
| Pendencia contratual | executar PR 41 (contrato de dados e shape persistivel) |
| Contrato encerrado? | nao |
| Item do A01 | Prioridade 4 — criar Supabase Adapter com namespace novo, persistencia explicavel e trilho de compatibilidade com ENOVA 1 |
| Estado atual | contrato aberto |
| Classe da ultima tarefa | governanca |
| Ultima PR relevante | PR 40 — abertura da Frente 4 |
| Ultimo commit funcional | N/A — abertura documental (sem codigo funcional runtime) |
| Pendencia remanescente herdada | nenhuma da Frente 3; frente iniciada nesta PR |
| Proximo passo autorizado | executar PR 41 — contrato de dados e shape persistivel (preservado) |
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

Contrato aberto. A frente foi iniciada em modo de governanca com desenho canonico de persistencia, sem implementacao real de banco/runtime.

## 4. Entregas concluidas

- contrato ativo da Frente 4 criado
- indice de contratos atualizado com a Frente 4 ativa
- status vivo da Frente 4 criado
- handoff vivo da Frente 4 criado
- documento canonico de dados/persistencia criado em `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md`
- quebra oficial definida em PR40, PR41, PR42, PR43 e PR44

## 5. Pendencias

- PR 41 — contrato de dados e shape persistivel (refinar e versionar o desenho canonico)
- PR 42 — adapter base de leitura/escrita canonica
- PR 43 — politica de merge/update/consistencia
- PR 44 — smoke persistente + closeout formal da frente

## 6. Bloqueios

- sem bloqueio tecnico imediato
- bloqueio de escopo: proibido implementar Supabase real na PR40

## 7. Proximo passo autorizado

Executar PR 41 — contrato de dados e shape persistivel, sem migration real e sem write path runtime real.

## 8. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma

## 9. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 10. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md`
  Status da frente lido:       `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`
  Indice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03/L18 identificados como nao transcritos
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — paginas 126-127 (Supabase Adapter e Persistencia Inteligente)
