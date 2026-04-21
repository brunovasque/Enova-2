# HANDOFF — Supabase Adapter e Persistencia — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Supabase Adapter e Persistencia |
| Data | 2026-04-21 |
| Estado da frente | contrato aberto |
| Classificacao da tarefa | governanca |
| Ultima PR relevante | PR 39 — acceptance smoke + closeout da Frente 3 |
| Contrato ativo | `schema/contracts/active/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA.md` |
| Recorte executado do contrato | PR 40 — abertura contratual + schema canonico documental |
| Pendencia contratual remanescente | PR41, PR42, PR43 e PR44 |
| Houve desvio de contrato? | nao |
| Contrato encerrado nesta PR? | nao |
| Item do A01 atendido | Prioridade 4 — abertura formal da frente de Supabase Adapter e Persistencia |
| Proximo passo autorizado | PR 41 — contrato de dados e shape persistivel |
| Proximo passo foi alterado? | nao |
| Tarefa fora de contrato? | nao (governanca de abertura contratual da frente) |
| Mudancas em dados persistidos (Supabase) | nenhuma |
| Permissoes Cloudflare necessarias | nenhuma adicional |

---

## 1. Contexto curto

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
