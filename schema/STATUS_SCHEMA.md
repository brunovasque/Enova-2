# STATUS_SCHEMA — Formato Obrigatório de Status Vivo por Frente

## Finalidade

Este documento define o formato canônico obrigatório para o status vivo de cada frente da ENOVA 2.
O status vivo é o registro persistido do estado atual de uma frente, atualizado ao final de cada tarefa.
Ele existe para que qualquer agente ou humano saiba o estado real da frente sem depender de conversa, memória de sessão ou inferência.

## Precedência

Este schema está subordinado ao A00, A01 e A02.
O status vivo nunca substitui o contrato da frente nem a precedência documental oficial.

---

## Estrutura obrigatória de status vivo

Todo status de frente deve conter, na ordem abaixo, as seguintes seções:

### 1. Nome da frente

Nome canônico da frente, idêntico ao usado no A01 e no contrato.

### 2. Contrato ativo

Referência ao contrato atualmente ativo para esta frente.
Se não houver contrato aberto, declarar explicitamente: `Nenhum contrato ativo — aguardando abertura`.

### 3. Item do A01

Indicação explícita de qual fase, prioridade e item do A01 esta frente está executando ou aguardando.

### 4. Estado atual

Um dos seguintes valores canônicos:
- `não iniciada` — frente ainda sem contrato aberto ou execução técnica.
- `contrato aberto` — contrato aprovado, execução técnica ainda não iniciada.
- `em execução` — execução técnica ativa.
- `bloqueada` — execução parada por dependência, ambiguidade ou gate não satisfeito.
- `concluída` — entrega aceita e provas apresentadas.

### 5. Última PR

Número ou referência da última PR associada a esta frente.
Se nenhuma PR foi aberta, declarar: `Nenhuma PR aberta`.

### 6. Último commit

Hash ou referência do último commit associado a esta frente.
Se nenhum commit foi feito, declarar: `Nenhum commit relevante`.

### 7. Entregas concluídas

Lista de entregas já aceitas e fechadas para esta frente.
Cada entrega deve referenciar a PR e/ou o contrato correspondente.

### 8. Pendências

Lista de itens pendentes para esta frente. Cada pendência deve indicar o que falta e qual é o bloqueio (se houver).

### 9. Bloqueios

Condições que impedem o avanço da frente.
Referência a gates do A01, dependências de outras frentes ou ambiguidades não resolvidas.

### 10. Próximo passo autorizado

Qual é o passo imediato autorizado para esta frente, conforme o A01 e o contrato ativo.
Deve ser específico o suficiente para que o próximo agente ou humano saiba exatamente o que fazer.

### 11. Legados aplicáveis

Lista dos documentos legados (L01–L19) que são fonte de verdade de negócio para esta frente.
Deve seguir a amarração definida no A02.

### 12. Última atualização

Data e hora (ISO 8601) da última atualização deste status.
Indicar também o agente ou humano responsável pela atualização.

---

## Regras de uso

1. **Atualização obrigatória ao final de cada tarefa** — Se o estado da frente mudou, o status vivo deve ser atualizado antes de encerrar a tarefa.
2. **Coerência com o contrato** — O status vivo deve refletir o estado real, não o planejado. Se houver divergência, o status prevalece como registro de fato.
3. **Não substituir pelo handoff** — O status vivo e o handoff são complementares. O status registra o estado; o handoff registra o contexto para continuidade.
4. **Arquivo por frente** — Cada frente tem seu próprio arquivo de status em `schema/status/`.
5. **Nomenclatura** — O nome do arquivo segue o padrão: `<NOME_DA_FRENTE>_STATUS.md`.

---

## Exemplo de cabeçalho mínimo

```markdown
# STATUS VIVO — <Nome da Frente> — ENOVA 2

| Campo                     | Valor                                      |
|---------------------------|---------------------------------------------|
| Frente                    | <nome>                                      |
| Contrato ativo            | <referência ou "Nenhum">                    |
| Item do A01               | <fase/prioridade/item>                      |
| Estado atual              | <não iniciada / contrato aberto / em execução / bloqueada / concluída> |
| Última PR                 | <referência ou "Nenhuma">                   |
| Último commit             | <hash ou "Nenhum">                          |
| Próximo passo autorizado  | <descrição>                                 |
| Legados aplicáveis        | <L0x, L0y, ...>                             |
| Última atualização        | <data ISO 8601>                             |
```
