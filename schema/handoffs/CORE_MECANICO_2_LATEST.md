# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                        |
|--------------------------------------------|------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                              |
| Data                                       | 2026-04-20T00:26:00Z                                                        |
| Estado da frente                           | não iniciada                                                                 |
| Classificação da tarefa                    | governança                                                                   |
| Última PR relevante                        | PR #4 — protocolo obrigatório de dados persistidos (Supabase)                |
| Item do A01 atendido                       | Fase 0 — governança de dados persistidos endurecida                          |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2                                            |
| Próximo passo foi alterado?                | não                                                                          |
| Tarefa fora de contrato?                   | não (governança é classe válida sem contrato de frente técnica)              |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                      |

---

## 1. Contexto curto

O repositório fundador da ENOVA 2 está pronto com governança de dados persistidos endurecida. O trio-base canônico (A00 + A01 + A02) define a visão, a ordem executiva e a amarração com os legados. O CODEX_WORKFLOW exige 11 etapas obrigatórias com declaração explícita de ESTADO HERDADO e ESTADO ENTREGUE. A classificação de tarefa é canônica e obrigatória. Agora, toda tarefa ou PR deve declarar explicitamente se houve ou não mudança em dados persistidos do Supabase — inclusive quando a resposta for "nenhuma".

O `DATA_CHANGE_PROTOCOL.md` foi criado como protocolo operacional exclusivo para mudanças de schema e persistência do Supabase/Postgres da ENOVA 2. Todos os artefatos de governança (CODEX_WORKFLOW, AGENT_CONTRACT, PR Template, Handoff Schema, Status Schema, README_EXECUCAO, README) foram atualizados para exigir esta declaração.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica. O próximo passo autorizado é a abertura formal do contrato.

## 2. Classificação da tarefa

**governança**

Esta PR cria e atualiza regras operacionais, protocolo de dados, schemas, templates, workflow e documentação de governança. Nenhuma implementação funcional foi aberta. Nenhum código de Core, Speech, Supabase real, Áudio ou Meta foi tocado. Nenhuma tabela, coluna ou schema SQL real foi criado ou alterado.

## 3. Última PR relevante

**PR #3** — Endurecimento do workflow de continuidade e rastreabilidade entre PRs.

## 4. O que a PR #3 fechou

- TASK_CLASSIFICATION.md com 6 classes canônicas criado
- CODEX_WORKFLOW com fluxo de 11 etapas, ESTADO HERDADO obrigatório, ESTADO ENTREGUE obrigatório
- HANDOFF_SCHEMA com campos de classificação, PR anterior, o que fechou/não fechou
- STATUS_SCHEMA com campo de classe da última tarefa e pendência remanescente herdada
- PULL_REQUEST_TEMPLATE com campos de classificação, última PR relevante, estado herdado
- AGENT_CONTRACT com regras de não pular etapas, declarar contexto herdado, classificar tarefas
- README_EXECUCAO atualizado com workflow endurecido
- README atualizado com TASK_CLASSIFICATION como documento canônico

## 5. O que a PR #3 NÃO fechou

- Protocolo de dados persistidos (pendente para esta PR — PR #4)
- Declaração obrigatória de dados persistidos nos templates e schemas
- DATA_CHANGE_PROTOCOL.md (ainda não existia)
- Contrato formal do Core Mecânico 2 (deliberadamente excluído)

## 6. Diagnóstico confirmado

- CODEX_WORKFLOW anterior não exigia declaração de dados persistidos em nenhum bloco obrigatório.
- HANDOFF_SCHEMA, STATUS_SCHEMA, PULL_REQUEST_TEMPLATE e AGENT_CONTRACT não tinham campo de dados persistidos.
- Não havia protocolo que obrigasse declaração de tabelas, colunas, índices, constraints ou relacionamentos do Supabase.
- Não havia tipos canônicos de mudança de dados definidos.
- Não havia regra de parada explícita para mudança de dados sem declaração.
- Qualquer mudança futura em schema do Supabase poderia acontecer sem rastreabilidade ou rollback documentado.

## 7. O que foi feito (PR #4)

- Criado `schema/DATA_CHANGE_PROTOCOL.md`: finalidade, precedência, 13 tipos canônicos de mudança, campos obrigatórios (nenhuma / sim), regra de parada, o que atualizar quando houver mudança, o que é proibido, exemplos de declaração, regra de rollback, regra de compatibilidade, regra de mudança fora de contrato. Escopo: exclusivamente Supabase/Postgres da ENOVA 2.
- Endurecido `schema/CODEX_WORKFLOW.md`: bloco ESTADO HERDADO agora inclui campo obrigatório `Mudanças em dados persistidos (Supabase)`; bloco ESTADO ENTREGUE idem; seção 13 (Regra de parada) inclui parada por dados não declarados; nova seção 14 (Protocolo de dados persistidos); referência ao DATA_CHANGE_PROTOCOL na seção 11 (Schemas).
- Atualizado `schema/TASK_CLASSIFICATION.md`: nova seção "Obrigação universal de declaração de dados persistidos" ao final — obrigatória em todas as 6 classes de tarefa.
- Atualizado `.github/PULL_REQUEST_TEMPLATE.md`: nova seção "Mudanças em dados persistidos (Supabase)" com campos explícitos (tabela, tipo, colunas, motivo, impacto, compatibilidade, migração, backfill, risco, rollback). Plano de rollback atualizado para incluir rollback de dados.
- Atualizado `.github/AGENT_CONTRACT.md`: regras 13–15 adicionadas (declaração obrigatória, bloqueio total sem rastreabilidade, parada imediata). Nova seção "Protocolo de dados persistidos (Supabase)". `DATA_CHANGE_PROTOCOL.md` listado nos schemas de governança.
- Atualizado `schema/HANDOFF_SCHEMA.md`: nova seção 18 obrigatória de dados persistidos; campo `Mudanças em dados persistidos (Supabase)` no exemplo de cabeçalho mínimo.
- Atualizado `schema/STATUS_SCHEMA.md`: nova seção 15 de dados persistidos com orientação; campo no exemplo de cabeçalho mínimo.
- Atualizado `schema/README_EXECUCAO.md`: nova seção "Protocolo de dados persistidos (Supabase) — obrigatório em toda tarefa".
- Atualizado `README.md`: `DATA_CHANGE_PROTOCOL.md` listado como documento canônico e schema de governança. Protocolo de execução menciona obrigação de declaração de dados.
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`: PR #4, campo de dados persistidos, nova entrega listada.
- Atualizado este handoff.

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Esta PR é exclusivamente de governança.
- **Implementação técnica** — nenhuma. Nenhum código funcional.
- **Schema SQL real** — nenhuma tabela, coluna ou migration real foi criada. O protocolo é de governança documental, não de implementação.
- **Conteúdo integral dos legados** — placeholders permanecem. PDF mestre deve ser incorporado.

## 9. O que esta PR fechou

- Protocolo obrigatório de dados persistidos do Supabase (DATA_CHANGE_PROTOCOL.md criado).
- Declaração obrigatória de dados persistidos em todos os artefatos de governança (CODEX_WORKFLOW, AGENT_CONTRACT, PR Template, Handoff Schema, Status Schema).
- Tipos canônicos de mudança de dados definidos (13 tipos).
- Regra de parada para mudança de dados não declarada formalizada.
- Regras de rollback, compatibilidade retroativa e mudança fora de contrato documentadas.
- Rastreabilidade total de dados amarrada ao CODEX_WORKFLOW.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Scaffold técnico do repositório (Fase 1 do A01, após contrato aprovado).

## 11. Esta tarefa foi fora de contrato?

**não** — governança é classe válida sem necessidade de contrato de frente técnica. Esta PR executa uma necessidade operacional de governança alinhada com a Fase 0 do A01.

## 12. Arquivos relevantes

- `schema/DATA_CHANGE_PROTOCOL.md` *(criado)*
- `schema/CODEX_WORKFLOW.md` *(endurecido — seções 4, 5, 11, 13, 14)*
- `schema/TASK_CLASSIFICATION.md` *(atualizado — obrigação universal de dados)*
- `.github/PULL_REQUEST_TEMPLATE.md` *(atualizado — campos de dados persistidos)*
- `.github/AGENT_CONTRACT.md` *(atualizado — regras 13–15, protocolo de dados)*
- `schema/HANDOFF_SCHEMA.md` *(atualizado — seção 18, cabeçalho)*
- `schema/STATUS_SCHEMA.md` *(atualizado — seção 15, cabeçalho)*
- `schema/README_EXECUCAO.md` *(atualizado — seção de protocolo de dados)*
- `README.md` *(atualizado — DATA_CHANGE_PROTOCOL como canônico)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 0** — Fundação documental: governança de dados persistidos do Supabase endurecida. Rastreabilidade total de mudanças de schema obrigatória a partir desta PR.
- **Status da Fase 0**: concluída com protocolo de dados persistidos.

## 14. Estado atual da frente

**não iniciada**

A frente Core Mecânico 2 está pronta para abertura de contrato. A governança operacional está completa e endurecida.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅

**Próximo passo preservado** — igual ao definido na PR #3.

## 16. Riscos

- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado e transcrito. Risco: se o conteúdo não for transcrito antes da abertura do contrato do Core, o agente pode não ter acesso completo às regras de negócio.
- **Mitigação** — O INDEX_LEGADO_MESTRE.md indica claramente quais blocos consultar por frente. O PDF mestre pode ser enviado como complemento.

## 17. Provas

- PR #4 criada com escopo exclusivamente de governança operacional de dados persistidos.
- Nenhum arquivo de código funcional, integração, worker, app, schema SQL real ou migration criado.
- DATA_CHANGE_PROTOCOL.md criado com 13 tipos canônicos, campos obrigatórios, regras de parada/rollback/compatibilidade.
- CODEX_WORKFLOW.md endurecido com bloco de dados em ESTADO HERDADO e ESTADO ENTREGUE, seção 14.
- Todos os artefatos de governança atualizados para exigir declaração obrigatória de dados persistidos.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #4.
- Mudanças em dados persistidos (Supabase): **nenhuma** — esta PR é exclusivamente documental/governança.

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de governança documental pura. Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.
