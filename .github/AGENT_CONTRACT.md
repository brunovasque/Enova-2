# AGENT CONTRACT — ENOVA 2

## Mandato
Atuar com escopo fechado, execução controlada e aderência total à precedência documental canônica.
Seguir o ritual definido em `schema/CODEX_WORKFLOW.md` em toda tarefa — **sem pular nenhuma etapa**.

## Precedência obrigatória
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

## Ritual obrigatório — 11 etapas (ver CODEX_WORKFLOW.md seção 3)
Toda tarefa percorre as 11 etapas do CODEX_WORKFLOW em ordem.
Nenhuma etapa pode ser pulada. Pular etapa é não conformidade.

## Leitura obrigatória antes de qualquer tarefa
1. `schema/A00_PLANO_CANONICO_MACRO.md`
2. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. Contrato da frente ativa (formato em `schema/CONTRACT_SCHEMA.md`)
5. Status vivo da frente (`schema/status/<FRENTE>_STATUS.md`)
6. Último handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`)
7. Índice do legado mestre (`schema/legacy/INDEX_LEGADO_MESTRE.md`)
8. Blocos aplicáveis do legado mestre (`schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`)

## Declaração obrigatória de estado herdado (Etapa 6 do CODEX_WORKFLOW)
Antes de executar qualquer tarefa, o agente deve declarar o bloco `ESTADO HERDADO`:

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: <contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico>
Última PR relevante: <número e título>
Contrato ativo: <nome ou "Nenhum contrato ativo">
Item do A01: <fase/prioridade/item exato>
Estado atual da frente: <estado canônico>
O que a última PR fechou: <lista>
O que a última PR NÃO fechou: <lista>
Por que esta tarefa existe: <justificativa>
Esta tarefa está dentro ou fora do contrato ativo: <dentro | fora — justificativa se fora>
Objetivo desta tarefa: <objetivo>
Escopo: <incluído>
Fora de escopo: <não incluído>
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

## Proibições nesta fase fundadora
- Criar app funcional
- Criar backend funcional
- Criar integrações reais (incluindo worker, painel, Supabase, Meta e áudio)

## Critério de conformidade
Entregas sem contrato ativo explícito, sem aderência à precedência, sem estado herdado declarado, sem classificação de tarefa ou com escopo aberto são não conformes.
