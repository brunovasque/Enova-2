# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                          | Valor                                                                        |
|--------------------------------|------------------------------------------------------------------------------|
| Frente                         | Core Mecânico 2                                                              |
| Data                           | 2026-04-20T00:07:00Z                                                        |
| Estado da frente               | não iniciada                                                                 |
| Classificação da tarefa        | governança                                                                   |
| Última PR relevante            | PR #3 — endurecimento do workflow de continuidade e rastreabilidade          |
| Item do A01 atendido           | Fase 0 — fundação documental endurecida                                      |
| Próximo passo autorizado       | Abrir contrato do Core Mecânico 2                                            |
| Próximo passo foi alterado?    | não                                                                          |
| Tarefa fora de contrato?       | não (governança é classe válida sem contrato de frente técnica)              |

---

## 1. Contexto curto

O repositório fundador da ENOVA 2 está pronto e com workflow de governança endurecido. O trio-base canônico (A00 + A01 + A02) define a visão, a ordem executiva e a amarração com os legados. O CODEX_WORKFLOW agora exige 11 etapas obrigatórias, incluindo declaração explícita de ESTADO HERDADO (antes da execução) e ESTADO ENTREGUE (ao final). A classificação de tarefa é agora canônica e obrigatória em toda PR.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica. A fundação documental (incluindo o novo TASK_CLASSIFICATION.md com 6 classes canônicas) está pronta. O repositório está preparado para a abertura formal do contrato como próximo passo autorizado.

PR #3 herda o contexto da PR #2 e não altera o próximo passo autorizado (abertura de contrato do Core Mecânico 2).

## 2. Classificação da tarefa

**governança**

Esta PR cria e atualiza regras operacionais, schemas, templates, workflow e documentação de governança. Nenhuma implementação funcional foi aberta. Nenhum código de Core, Speech, Supabase, Áudio ou Meta foi tocado.

## 3. Última PR relevante

**PR #2** — Criação da camada de contexto vivo e incorporação dos 19 legados (documental, sem implementação funcional).

## 4. O que a PR #2 fechou

- Trio-base canônico: A00 + A01 + A02
- CODEX_WORKFLOW com protocolo obrigatório de execução
- README_EXECUCAO com ordem de leitura
- AGENT_CONTRACT com mandato e regras
- PULL_REQUEST_TEMPLATE com formato padrão
- CONTRACT_SCHEMA, STATUS_SCHEMA, HANDOFF_SCHEMA
- Estrutura de status vivos, handoffs e legados
- Legado mestre unificado com placeholders por bloco

## 5. O que a PR #2 NÃO fechou

- Contrato formal do Core Mecânico 2 (deliberadamente excluído — escopo era fundação documental)
- Workflow endurecido com ESTADO HERDADO, classificação de tarefa e ESTADO ENTREGUE (pendente para esta PR)
- TASK_CLASSIFICATION.md (ainda não existia)
- Campo de classificação nos schemas, templates e AGENT_CONTRACT

## 6. Diagnóstico confirmado

- CODEX_WORKFLOW anterior não exigia declaração explícita de estado herdado, classificação de tarefa nem estado entregue.
- HANDOFF_SCHEMA não tinha campos de PR anterior, o que fechou/não fechou, classificação.
- STATUS_SCHEMA não tinha campo de classe da última tarefa nem pendência remanescente herdada.
- PULL_REQUEST_TEMPLATE não exigia estado herdado nem o que a PR fecha/não fecha.
- AGENT_CONTRACT não obrigava declaração do contexto herdado nem marcação de tarefa fora de contrato.
- Ausência de TASK_CLASSIFICATION.md tornava a classificação implícita e não canônica.

## 7. O que foi feito (PR #3)

- Criado `schema/TASK_CLASSIFICATION.md` com 6 classes canônicas: contratual, governança, fora_de_contrato, correcao_incidental, hotfix, diagnostico. Para cada classe: quando usar, o que pode/não pode fazer, arquivos obrigatórios, se pode alterar próximo passo.
- Endurecido `schema/CODEX_WORKFLOW.md`: fluxo de 11 etapas, bloco ESTADO HERDADO obrigatório, bloco ESTADO ENTREGUE obrigatório, regra de continuidade entre PRs, regra especial para fora_de_contrato, tabela de classificação, referência ao TASK_CLASSIFICATION.md.
- Atualizado `schema/HANDOFF_SCHEMA.md`: adicionados campos de classificação, última PR, o que a PR anterior fechou/não fechou, o que esta PR fechou, o que continua pendente, se foi fora de contrato.
- Atualizado `schema/STATUS_SCHEMA.md`: adicionados campos de classe da última tarefa, pendência remanescente herdada, rastreabilidade da última PR com descrição.
- Atualizado `.github/PULL_REQUEST_TEMPLATE.md`: adicionados campos de classificação, última PR relevante, estado herdado (o que fechou/não fechou, justificativa), o que esta PR fecha/não fecha, arquivos vivos atualizados.
- Atualizado `.github/AGENT_CONTRACT.md`: adicionadas regras de não pular etapas, declarar contexto herdado, classificar tarefas, marcar fora_de_contrato, regra de continuidade entre PRs.
- Atualizado `schema/README_EXECUCAO.md`: apontamento para CODEX_WORKFLOW endurecido e TASK_CLASSIFICATION.md, regras de estado herdado/entregue, regra de continuidade.
- Atualizado `README.md`: adicionado TASK_CLASSIFICATION.md como documento canônico e schema de governança, descrição do protocolo de execução atualizada.
- Atualizado este handoff e o status do Core Mecânico 2 para refletir a PR #3.

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Esta PR é exclusivamente de governança.
- **Implementação técnica** — nenhuma. Nenhum código funcional.
- **Conteúdo integral dos legados** — placeholders permanecem. PDF mestre deve ser incorporado.

## 9. O que esta PR fechou

- Workflow de continuidade endurecido com ESTADO HERDADO e ESTADO ENTREGUE obrigatórios.
- Classificação canônica de tarefas (TASK_CLASSIFICATION.md criado).
- Rastreabilidade explícita entre PRs em todos os schemas e templates.
- Regra de tarefa fora de contrato formalizada.
- Todos os arquivos de governança atualizados para coerência com o novo workflow.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Scaffold técnico do repositório (Fase 1 do A01, após contrato aprovado).

## 11. Esta tarefa foi fora de contrato?

**não** — governança é classe válida sem necessidade de contrato de frente técnica. Esta PR executa uma necessidade operacional de governança alinhada com a Fase 0 do A01.

## 12. Arquivos relevantes

- `schema/TASK_CLASSIFICATION.md` *(criado)*
- `schema/CODEX_WORKFLOW.md` *(endurecido)*
- `schema/HANDOFF_SCHEMA.md` *(atualizado)*
- `schema/STATUS_SCHEMA.md` *(atualizado)*
- `.github/PULL_REQUEST_TEMPLATE.md` *(atualizado)*
- `.github/AGENT_CONTRACT.md` *(atualizado)*
- `schema/README_EXECUCAO.md` *(atualizado)*
- `README.md` *(atualizado)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 0** — Fundação documental: workflow endurecido, classificação de tarefas canonizada, rastreabilidade entre PRs formalizada.
- **Status da Fase 0**: concluída com workflow de governança operacional completo e endurecido.

## 14. Estado atual da frente

**não iniciada**

A frente Core Mecânico 2 está pronta para abertura de contrato. A governança operacional está completa e endurecida.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅

**Próximo passo preservado** — igual ao definido na PR #2.

## 16. Riscos

- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado e transcrito. Risco: se o conteúdo não for transcrito antes da abertura do contrato do Core, o agente pode não ter acesso completo às regras de negócio.
- **Mitigação** — O INDEX_LEGADO_MESTRE.md indica claramente quais blocos consultar por frente. O PDF mestre pode ser enviado como complemento.

## 17. Provas

- PR #3 criada com escopo exclusivamente de governança operacional.
- Nenhum arquivo de código funcional, integração, worker ou app criado.
- TASK_CLASSIFICATION.md criado com 6 classes canônicas e definições completas.
- CODEX_WORKFLOW.md endurecido com 11 etapas, ESTADO HERDADO, ESTADO ENTREGUE.
- Todos os schemas, templates e AGENT_CONTRACT atualizados para coerência.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #3.
