# AGENT CONTRACT — ENOVA 2

## Mandato
Atuar com escopo fechado, execução controlada e aderência total à precedência documental canônica.
Seguir o ritual definido em `schema/CODEX_WORKFLOW.md` em toda tarefa — **sem pular nenhuma etapa**.

## Precedência obrigatória
**A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente > documentos legados aplicáveis**

## Ritual obrigatório — 16 etapas (ver CODEX_WORKFLOW.md seção 3)
Toda tarefa percorre as 16 etapas do CODEX_WORKFLOW em ordem.
Nenhuma etapa pode ser pulada. Pular etapa é não conformidade.

## Leitura obrigatória antes de qualquer tarefa
1. `schema/A00_PLANO_CANONICO_MACRO.md`
2. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. `schema/contracts/_INDEX.md` — **índice canônico de contratos ativos**
5. Contrato ativo da frente (em `schema/contracts/active/`, formato em `schema/CONTRACT_SCHEMA.md`)
6. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — **protocolo de execução contratual**
7. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — **protocolo de encerramento de contrato**
8. Status vivo da frente (`schema/status/<FRENTE>_STATUS.md`)
9. Último handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`)
10. Índice do legado mestre (`schema/legacy/INDEX_LEGADO_MESTRE.md`)
11. Blocos aplicáveis do legado mestre (`schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`)

## Declaração obrigatória de estado herdado (Etapa 8 do CODEX_WORKFLOW)
Antes de executar qualquer tarefa, o agente deve declarar o bloco `ESTADO HERDADO`:

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: <contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico>
Última PR relevante: <número e título>
Contrato ativo: <nome ou "Nenhum contrato ativo">
Objetivo imutável do contrato: <objetivo literal ou "N/A">
Recorte a executar nesta PR: <qual parte do contrato ou "N/A">
Item do A01: <fase/prioridade/item exato>
Estado atual da frente: <estado canônico>
O que a última PR fechou: <lista>
O que a última PR NÃO fechou: <lista>
Por que esta tarefa existe: <justificativa>
Esta tarefa está dentro ou fora do contrato ativo: <dentro | fora — justificativa se fora>
Objetivo desta tarefa: <objetivo>
Escopo: <incluído>
Fora de escopo: <não incluído>
Houve desvio de contrato?: <não | sim — se sim, ver CONTRACT_EXECUTION_PROTOCOL seção 6>
Mudanças em dados persistidos (Supabase): <nenhuma | sim — se sim, ver schema/DATA_CHANGE_PROTOCOL.md seção 4.2>
Permissões Cloudflare necessárias: <nenhuma adicional | sim — se sim, ver schema/CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2>
```

Tarefa sem esta declaração não deve ser iniciada.

## Classificação obrigatória de tarefa
Toda tarefa deve ser classificada em uma das classes canônicas antes da execução.
Classes canônicas (definidas em `schema/TASK_CLASSIFICATION.md`):
- `contratual` — dentro do contrato ativo
- `governança` — cria/atualiza regras e documentação operacional
- `fora_de_contrato` — necessária mas fora do contrato ativo
- `correcao_incidental` — correção cirúrgica acoplada à tarefa em andamento
- `hotfix` — correção urgente e crítica
- `diagnostico` — somente leitura e análise, nenhuma entrega técnica

Tarefa não classificada = tarefa não conforme.

## Regras mandatórias
1. Executar apenas o escopo explicitamente contratado.
2. Aplicar patch cirúrgico e mínimo necessário.
3. Não realizar refatoração fora do combinado.
4. Não introduzir drift de objetivo, escopo ou arquitetura.
5. Não abrir implementação funcional sem autorização do contrato ativo.
6. Declarar sempre qual contrato está ativo e qual item do A01 está sendo atendido.
7. Não pular etapas do fluxo de 11 etapas do CODEX_WORKFLOW.
8. Declarar explicitamente o contexto herdado da PR anterior antes de executar.
9. Declarar explicitamente o que foi herdado, o que foi resolvido e o que permanece aberto.
10. Marcar explicitamente como `fora_de_contrato` quando a tarefa não pertencer ao contrato ativo.
11. Se houver ambiguidade estrutural, conflito documental ou falta de contrato ativo: parar e reportar.
12. Ao final de cada tarefa, emitir resposta no formato definido pelo CODEX_WORKFLOW (seção 7).
13. **Declarar obrigatoriamente** em todo ESTADO HERDADO e ESTADO ENTREGUE se houve ou não mudança em dados persistidos do Supabase — inclusive quando a resposta for `nenhuma`.
14. **Nenhuma mudança** em tabela, coluna, índice, constraint ou relacionamento do Supabase pode ser executada sem declaração prévia completa e rastreabilidade total conforme `schema/DATA_CHANGE_PROTOCOL.md`.
15. **Parar imediatamente** se uma tarefa mexer em dados persistidos do Supabase sem declarar tabela, tipo de mudança, colunas afetadas, motivo, impacto e rollback.
16. **Declarar obrigatoriamente** em todo ESTADO HERDADO e ESTADO ENTREGUE se há ou não necessidade nova de permissão Cloudflare — inclusive quando a resposta for `nenhuma adicional`.
17. **Nenhuma tarefa** que passe a depender de novo recurso Cloudflare pode seguir com a necessidade de permissão implícita — declarar recurso, ação, permissões suficientes e impacto antes de prosseguir.
18. **Avisar preventivamente** ao usuário quando a PR passar a exigir novas permissões Cloudflare — nunca deixar esse risco implícito ou silencioso.
19. **Parar imediatamente** se uma tarefa introduzir dependência de recurso Cloudflare sem declaração completa dos campos obrigatórios conforme `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.

## Atualização viva obrigatória ao final de qualquer tarefa
Independente de ser tarefa contratual ou fora de contrato:
1. Atualizar o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`) — incluindo classe da última tarefa e pendência remanescente herdada.
2. Atualizar o handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`) — incluindo o que a PR anterior fechou/não fechou, o que esta PR fechou/não fechou, e se foi fora de contrato.
3. Confirmar o item do A01 atendido.
4. Declarar o próximo passo autorizado (preservado ou alterado).
5. Se a tarefa foi `fora_de_contrato`: registrar justificativa e impacto no próximo passo autorizado.

## Regra de continuidade entre PRs
Toda PR deve descrever:
- De qual PR ela continua (número e título).
- O que herdou (pendências e contexto em aberto da PR anterior).
- O que resolveu do herdado.
- O que permanece aberto.

Esta regra garante que o repositório seja a única fonte de verdade — não a conversa.

## Schemas de governança
- `schema/CONTRACT_SCHEMA.md` — formato de contrato novo
- `schema/STATUS_SCHEMA.md` — formato de status vivo
- `schema/HANDOFF_SCHEMA.md` — formato de handoff persistido
- `schema/TASK_CLASSIFICATION.md` — classificação canônica de tarefas e PRs
- `schema/DATA_CHANGE_PROTOCOL.md` — protocolo obrigatório de mudanças em dados persistidos do Supabase
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — protocolo obrigatório de permissões Cloudflare
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo obrigatório de execução contratual por PR
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — protocolo obrigatório de encerramento formal de contrato
- `schema/contracts/_INDEX.md` — índice canônico de contratos ativos por frente

## Governança contratual — regras anti-desvio

1. **PR de execução não altera contrato silenciosamente.** Qualquer alteração de objetivo, escopo, critério de aceite, fora de escopo ou condição de encerramento do contrato ativo exige classificação como `governança` (revisão contratual) e PR dedicada.
2. **Qualquer desvio de contrato deve parar.** Se a PR tenta abrir nova frente, novo escopo, fazer entrega fora do objetivo do contrato ou mudar objetivo sem revisão formal, marcar como **DESVIO DE CONTRATO**, parar e exigir revisão formal.
3. **Contrato só encerra via protocolo formal.** Nenhum contrato pode ser considerado encerrado sem cumprir integralmente o `CONTRACT_CLOSEOUT_PROTOCOL.md`. Encerramento implícito é proibido.
4. **Macro não pode ser traído por micro execução.** Nenhuma PR pode contradizer o A00, reordenar o A01 ou expandir escopo além do contrato ativo.
5. **Um contrato ativo por frente.** Contratos anteriores vão para `archive/`. O `_INDEX.md` deve sempre refletir o estado real.
6. **Toda PR de execução declara vínculo contratual.** Contrato lido, objetivo imutável, recorte executado, o que fecha, o que não fecha, desvio e encerramento.

## Protocolo de dados persistidos (Supabase)
Nenhuma mudança em schema, tabela, coluna, índice, constraint ou relacionamento do Supabase pode acontecer sem:
- Declaração explícita no ESTADO HERDADO e ESTADO ENTREGUE
- Preenchimento de todos os campos obrigatórios (tabela, tipo, colunas, motivo, impacto, rollback)
- Rastreabilidade completa no handoff e no PR template

Mesmo quando não houver mudança de dados, declarar: `Mudanças em dados persistidos (Supabase): nenhuma`

Ver `schema/DATA_CHANGE_PROTOCOL.md` para o protocolo completo.

## Protocolo de permissões Cloudflare
Nenhuma tarefa que passe a depender de novo recurso Cloudflare pode seguir com a necessidade de permissão implícita.

Toda tarefa deve declarar explicitamente no ESTADO HERDADO e ESTADO ENTREGUE se há ou não necessidade nova de permissão Cloudflare:
- Mesmo quando não houver necessidade nova, declarar: `Permissões Cloudflare necessárias: nenhuma adicional`
- Se houver necessidade nova: preencher todos os campos obrigatórios (recurso, ação, permissões suficientes, permissões adicionais, motivo, impacto, onde ajustar)
- Falha futura de deploy, binding ou recurso pode ser causada por permissão insuficiente do token — o agente deve avisar preventivamente, nunca deixar esse risco implícito
- Parar imediatamente se uma tarefa introduzir dependência de recurso Cloudflare sem declaração completa

Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para o protocolo completo.

## Protocolo de economia de request

Todo agente deve seguir rigorosamente `schema/REQUEST_ECONOMY_PROTOCOL.md`.

Regras mandatórias:
20. **Escopo fechado antes de abrir qualquer tarefa.** Nenhuma investigação livre sem objetivo declarado.
21. **Resolver o máximo dentro do escopo comprovado.** Evitar múltiplas PRs para o que cabe em uma dentro do mesmo escopo.
22. **Preferência por modelo barato.** Sonnet para tarefas de baixa/média complexidade. Modelo mais caro somente com justificativa explícita documentada.
23. **Preferir automação determinística sobre LLM.** Onde regex ou script simples resolve, não usar modelo.
24. **Proibido criar automação cara, recursiva ou dependente de LLM** onde check determinístico resolve.
25. **Prompts devem vir fechados, objetivos e com escopo declarado.** Evitar prompts abertos de investigação.

Gate automatizado de PR:
- `.github/workflows/pr-governance-check.yml` — valida campos obrigatórios (sem LLM, custo zero)
- `scripts/validate_pr_governance.js` — script determinístico de validação

## Proibições nesta fase fundadora
- Criar app funcional
- Criar backend funcional
- Criar integrações reais (incluindo worker, painel, Supabase, Meta e áudio)

## Critério de conformidade
Entregas sem contrato ativo explícito, sem aderência à precedência, sem estado herdado declarado, sem classificação de tarefa ou com escopo aberto são não conformes.
