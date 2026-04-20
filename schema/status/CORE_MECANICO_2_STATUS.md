# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | Nenhum contrato ativo — aguardando abertura                                               |
| Item do A01                                | Fase 0 concluída / Fase 1 — Prioridade 1 aguardando                                      |
| Estado atual                               | não iniciada                                                                              |
| Classe da última tarefa                    | governança                                                                                |
| Última PR relevante                        | PR #4 — endurecimento de governança com protocolo obrigatório de dados persistidos (Supabase) |
| Último commit                              | Nenhum commit de implementação técnica                                                    |
| Pendência remanescente herdada             | Abertura de contrato formal do Core Mecânico 2 (herdada da PR #2, preservada)            |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2 (preservado)                                           |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03, L04–L17 (conforme INDEX_LEGADO_MESTRE.md)           |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Última atualização                         | 2026-04-20T00:26:00Z                                                                      |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

Nenhum contrato ativo — aguardando abertura.
A frente depende da conclusão da fundação documental (Fase 0) e da organização do contexto vivo do repositório para que o contrato possa ser aberto com segurança.

## 3. Item do A01

- **Fase**: Fase 0 (fundação documental) — concluída com trio-base + workflow endurecido + classificação de tarefas.
- **Próxima fase**: Fase 1 — scaffold técnico e shape macro.
- **Prioridade do backlog**: Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.
- **Gate aplicável**: Gate 1 — sem contrato da frente, não começa implementação.

## 4. Estado atual

**não iniciada**

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica.
A fundação documental (A00 + A01 + A02 + CODEX_WORKFLOW endurecido + TASK_CLASSIFICATION) está pronta.
O workflow de continuidade entre PRs foi endurecido com obrigação de ESTADO HERDADO, classificação de tarefa e ESTADO ENTREGUE.

## 5. Classe da última tarefa

**governança** — tarefa exclusiva de endurecimento de governança operacional com protocolo obrigatório de dados persistidos. Nenhuma implementação funcional aberta.

## 6. Última PR relevante

PR #4 — Endurecimento de governança com protocolo obrigatório de dados persistidos (Supabase).
- Criou `schema/DATA_CHANGE_PROTOCOL.md` com tipos canônicos, campos obrigatórios, regras de rollback e compatibilidade.
- Endureceu `CODEX_WORKFLOW.md` com bloco obrigatório de dados persistidos em ESTADO HERDADO e ESTADO ENTREGUE, seção 14 (protocolo de dados), regra de parada para mudança não declarada.
- Atualizou `TASK_CLASSIFICATION.md` com obrigação universal de declaração de dados em todas as classes.
- Atualizou `PULL_REQUEST_TEMPLATE.md` com campos explícitos de dados persistidos (tabela, tipo, colunas, impacto, rollback).
- Atualizou `AGENT_CONTRACT.md` com regras 13–15: declaração obrigatória, bloqueio total sem rastreabilidade, parada imediata.
- Atualizou `HANDOFF_SCHEMA.md` com seção 18 obrigatória de dados persistidos.
- Atualizou `STATUS_SCHEMA.md` com seção 15 de dados persistidos e novo campo no cabeçalho.
- Atualizou `README_EXECUCAO.md` com seção de protocolo de dados persistidos.
- Atualizou `README.md` com `DATA_CHANGE_PROTOCOL.md` como documento canônico.

## 7. Último commit

Nenhum commit de implementação técnica. Apenas commits documentais e de governança.

## 8. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW com protocolo obrigatório de execução (11 etapas)
- [x] TASK_CLASSIFICATION com 6 classes canônicas de tarefas
- [x] README_EXECUCAO com ordem de leitura e regras de continuidade
- [x] AGENT_CONTRACT com mandato, classificação obrigatória e regra de continuidade entre PRs
- [x] PULL_REQUEST_TEMPLATE com estado herdado, classificação, o que fecha/não fecha
- [x] CONTRACT_SCHEMA — formato obrigatório de contrato novo
- [x] STATUS_SCHEMA — formato com classe da última tarefa e pendência remanescente herdada
- [x] HANDOFF_SCHEMA — formato com classificação, PR anterior, o que fechou/não fechou
- [x] Estrutura de status vivos e handoffs
- [x] Incorporação dos legados em legado mestre unificado
- [x] DATA_CHANGE_PROTOCOL — protocolo obrigatório de mudanças em dados persistidos do Supabase
- [x] Rastreabilidade total de dados: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template

## 9. Pendências

- [ ] Abrir contrato formal do Core Mecânico 2 (próximo passo autorizado)
- [ ] Definir objetivos/stages do Core Mecânico 2 no contrato
- [ ] Scaffold técnico do repositório (Fase 1 do A01)

## 10. Pendência remanescente herdada

Da PR #2: abertura de contrato formal do Core Mecânico 2.
Esta pendência permanece em aberto — a PR #3 não a afetou.

## 11. Bloqueios

Nenhum bloqueio ativo.
Gate 1 do A01 se aplica: sem contrato da frente, não começa implementação.

## 12. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo o formato definido em `schema/CONTRACT_SCHEMA.md`, com:
- Escopo alinhado ao A01 (Prioridade 1)
- Legados aplicáveis conforme A02 e INDEX_LEGADO_MESTRE.md (blocos L03 + L04-L17)
- Dependências satisfeitas (trio-base + workflow endurecido + contexto vivo + classificação de tarefas)

**Próximo passo preservado** em relação à PR #2.

## 13. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Blocos obrigatórios**: L03, L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 14. Última atualização

- **Data**: 2026-04-20T00:26:00Z
- **Responsável**: Copilot (PR #4 — protocolo de dados persistidos)
