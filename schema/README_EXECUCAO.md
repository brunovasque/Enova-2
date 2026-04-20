# README_EXECUCAO — Ordem de execução documental

## Protocolo de execução
Antes de executar qualquer tarefa, leia e siga o `CODEX_WORKFLOW.md`.
O `CODEX_WORKFLOW.md` define o fluxo obrigatório de 11 etapas: leitura canônica → estado herdado → classificação → execução → estado entregue → atualização viva → resposta final.

**O CODEX_WORKFLOW é a lei operacional única entre PRs. Nenhuma etapa pode ser pulada.**

## Ordem de leitura obrigatória
1. `A00_PLANO_CANONICO_MACRO.md`
2. `A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. `CODEX_WORKFLOW.md` — protocolo de execução (11 etapas)
5. Contrato específico da frente ativa (formato em `CONTRACT_SCHEMA.md`)
6. Status vivo da frente ativa (`status/<FRENTE>_STATUS.md`)
7. Último handoff da frente ativa (`handoffs/<FRENTE>_LATEST.md`)
8. `legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre unificado
9. `legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos aplicáveis à frente ativa

## Precedência documental
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia acima.

## Classificação de tarefa (obrigatória em toda tarefa)
Toda tarefa deve ser classificada em uma das classes canônicas definidas em `TASK_CLASSIFICATION.md`:
- `contratual` — dentro do contrato ativo
- `governança` — cria/atualiza governança e documentação operacional
- `fora_de_contrato` — necessária mas fora do contrato ativo (declarar justificativa)
- `correcao_incidental` — correção cirúrgica acoplada à tarefa em andamento
- `hotfix` — correção urgente e crítica
- `diagnostico` — somente leitura e análise

Tarefa não classificada = tarefa não conforme.

## Estado herdado e estado entregue (obrigatórios)
Toda tarefa deve declarar explicitamente:
- **ESTADO HERDADO** (antes de executar): última PR relevante, o que ela fechou, o que não fechou, contrato ativo, item do A01, justificativa desta tarefa.
- **ESTADO ENTREGUE** (ao final): o que foi feito, o que foi fechado, o que continua pendente, se o próximo passo foi alterado, arquivos vivos atualizados.

Ver formato completo em `CODEX_WORKFLOW.md` seções 4 e 5.

## Contrato ativo (obrigatório em toda nova frente)
Toda nova frente deve declarar explicitamente:
- `WORKFLOW_ACK: ok`
- qual contrato está ativo;
- qual item do A01 está sendo executado;
- qual vínculo com A02 e com os legados aplicáveis.

Todo contrato segue o formato definido em `CONTRACT_SCHEMA.md`.

## Contexto vivo do repositório

O repo mantém memória operacional persistida em:
- `schema/status/` — status vivo por frente (formato em `STATUS_SCHEMA.md`)
- `schema/handoffs/` — handoff persistido por frente (formato em `HANDOFF_SCHEMA.md`)
- `schema/legacy/` — legado mestre unificado (índice em `legacy/INDEX_LEGADO_MESTRE.md`, conteúdo em `legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`)
- `schema/source/` — PDF mestre original (`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`)

Para saber o estado de qualquer frente: consultar `schema/status/_INDEX.md`.
Para retomar qualquer frente: consultar `schema/handoffs/_INDEX.md`.
Para saber quais legados ler: consultar `schema/legacy/INDEX_LEGADO_MESTRE.md`.

## Pacote mínimo para abertura de nova aba/frente
Nenhuma nova aba/frente inicia sem o pacote mínimo:
- Handoff da frente (com estado herdado preenchido)
- A00
- A01
- A02
- CODEX_WORKFLOW.md
- TASK_CLASSIFICATION.md
- Status vivo da frente
- Legados aplicáveis

## Regra de atualização viva (obrigatória ao final de qualquer tarefa)
Ao final de QUALQUER tarefa, independente de ser contratual ou fora de contrato:
1. Atualizar o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`) — incluindo classe da última tarefa e pendência remanescente herdada.
2. Atualizar o handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`) — com o que a PR anterior fechou/não fechou, o que esta PR fechou/não fechou.
3. Confirmar o item do A01 atendido.
4. Declarar o próximo passo autorizado (preservado ou alterado).
5. Se `fora_de_contrato`: registrar justificativa e impacto no próximo passo.

## Regra de continuidade entre PRs
Toda PR deve descrever:
- De qual PR ela continua.
- O que herdou.
- O que resolveu do herdado.
- O que permanece aberto.

O repositório é a única fonte de verdade sobre o estado da frente — não a conversa.
