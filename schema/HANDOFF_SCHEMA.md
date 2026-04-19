# HANDOFF_SCHEMA — Formato Obrigatório de Handoff Persistido por Frente

## Finalidade

Este documento define o formato canônico obrigatório para o handoff persistido de cada frente da ENOVA 2.
O handoff é o registro de continuidade operacional: ele permite que qualquer agente ou humano retome o trabalho de uma frente sem perder contexto, decisões já tomadas ou riscos identificados.
O handoff complementa o status vivo — enquanto o status registra o estado, o handoff registra o contexto narrativo para continuidade.

## Precedência

Este schema está subordinado ao A00, A01 e A02.
O handoff nunca substitui o contrato da frente nem a precedência documental oficial.

---

## Estrutura obrigatória de handoff persistido

Todo handoff de frente deve conter, na ordem abaixo, as seguintes seções:

### 1. Contexto curto

Resumo objetivo do estado atual da frente em no máximo 3 parágrafos.
Deve responder: "O que alguém precisa saber para retomar esta frente agora?"

### 2. Diagnóstico confirmado

O que foi analisado, verificado e confirmado antes ou durante a execução.
Inclui leituras feitas, documentos consultados, decisões validadas e premissas confirmadas.

### 3. O que foi feito

Lista objetiva do que foi entregue, criado, alterado ou aprovado.
Cada item deve ser verificável (referência a PR, commit, arquivo ou evidência).

### 4. O que não foi feito

Lista explícita do que ficou pendente, do que foi deliberadamente excluído e do que não coube nesta entrega.
Deve indicar se cada item pendente é bloqueio, decisão deliberada ou limitação de escopo.

### 5. Arquivos relevantes

Lista de arquivos criados, alterados ou que devem ser consultados para continuidade.
Caminhos relativos à raiz do repositório.

### 6. Item do A01 atendido

Indicação explícita de qual fase, prioridade e item do A01 foi atendido (total ou parcialmente) por esta entrega.

### 7. Estado atual da frente

Estado da frente após esta entrega, usando os valores canônicos definidos no STATUS_SCHEMA:
`não iniciada` | `contrato aberto` | `em execução` | `bloqueada` | `concluída`

### 8. Próximo passo autorizado

Qual é o passo imediato autorizado para continuar esta frente.
Deve ser coerente com o A01, o contrato ativo e o status vivo.

### 9. Riscos

Riscos identificados, ambiguidades não resolvidas, dependências externas ou condições que podem afetar a continuidade.

### 10. Provas

Evidências apresentadas para validar a entrega: diffs, PRs, commits, smoke tests, capturas, logs ou qualquer artefato verificável.

---

## Regras de uso

1. **Atualização obrigatória ao final de cada tarefa** — Se o estado da frente mudou, o handoff deve ser atualizado (ou um novo handoff criado) antes de encerrar a tarefa.
2. **Arquivo por frente** — Cada frente tem seu próprio arquivo de handoff mais recente em `schema/handoffs/`.
3. **Nomenclatura** — O arquivo do handoff mais recente segue o padrão: `<NOME_DA_FRENTE>_LATEST.md`.
4. **Handoffs históricos** — Se necessário preservar o histórico, handoffs anteriores podem ser renomeados com sufixo de data: `<NOME_DA_FRENTE>_<YYYY-MM-DD>.md`. O `_LATEST.md` sempre aponta para o estado mais recente.
5. **Complementar ao status** — O handoff registra contexto narrativo; o status registra estado objetivo. Ambos devem ser atualizados juntos.
6. **Não substituir o contrato** — O handoff descreve o que aconteceu e o que vem a seguir, mas o contrato é quem autoriza a execução.

---

## Exemplo de cabeçalho mínimo

```markdown
# HANDOFF — <Nome da Frente> — ENOVA 2

| Campo                     | Valor                                      |
|---------------------------|---------------------------------------------|
| Frente                    | <nome>                                      |
| Data                      | <data ISO 8601>                             |
| Estado da frente          | <estado canônico>                           |
| Item do A01 atendido      | <fase/prioridade/item>                      |
| Próximo passo autorizado  | <descrição>                                 |
```
