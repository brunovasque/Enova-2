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
Quando houver contrato ativo, indicar caminho: `schema/contracts/active/<NOME>.md`.

### 2a. Estado do contrato

Estado atual do contrato ativo, usando os valores canônicos definidos em `schema/contracts/_INDEX.md`:
`aguardando abertura` | `aberto` | `em execução` | `em revisão` | `encerrado` | `arquivado`

### 2b. Última PR executou qual recorte do contrato

Descrição do recorte do contrato ativo executado pela última PR.
Se a última PR não executou contrato: `N/A`.

### 2c. Pendência contratual

Itens do contrato ativo que permanecem abertos.
Se não há contrato ativo: `N/A`.

### 2d. Contrato encerrado?

Declarar explicitamente: `não` | `sim`
Se sim: indicar data de encerramento, PR que encerrou e próximo contrato autorizado.
Ver `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`.

### 3. Item do A01

Indicação explícita de qual fase, prioridade e item do A01 esta frente está executando ou aguardando.

### 4. Estado atual

Um dos seguintes valores canônicos:
- `não iniciada` — frente ainda sem contrato aberto ou execução técnica.
- `contrato aberto` — contrato aprovado, execução técnica ainda não iniciada.
- `em execução` — execução técnica ativa.
- `bloqueada` — execução parada por dependência, ambiguidade ou gate não satisfeito.
- `concluída` — entrega aceita e provas apresentadas.

### 5. Classe da última tarefa

Classificação canônica da última tarefa que atualizou este status:
`contratual` | `governança` | `fora_de_contrato` | `correcao_incidental` | `hotfix` | `diagnostico`

Se a última tarefa foi `fora_de_contrato`, indicar se alterou o próximo passo autorizado.
Ver definições completas em `schema/TASK_CLASSIFICATION.md`.

### 6. Última PR relevante

Número ou referência da última PR que afetou esta frente, com breve descrição do que ela entregou.
Se nenhuma PR foi aberta, declarar: `Nenhuma PR aberta`.

### 7. Último commit

Hash ou referência do último commit associado a esta frente.
Se nenhum commit foi feito, declarar: `Nenhum commit relevante`.

### 8. Entregas concluídas

Lista de entregas já aceitas e fechadas para esta frente.
Cada entrega deve referenciar a PR e/ou o contrato correspondente.

### 9. Pendências

Lista de itens pendentes para esta frente. Cada pendência deve indicar o que falta e qual é o bloqueio (se houver).
Distinguir entre: pendência de contrato, pendência de governança e pendência de legado.

### 10. Pendência remanescente herdada

O que ficou aberto da última PR e que esta frente carrega como contexto herdado.
Deve ser atualizado cada vez que uma nova tarefa for concluída.

### 11. Bloqueios

Condições que impedem o avanço da frente.
Referência a gates do A01, dependências de outras frentes ou ambiguidades não resolvidas.

### 12. Próximo passo autorizado

Qual é o passo imediato autorizado para esta frente, conforme o A01 e o contrato ativo.
Deve ser específico o suficiente para que o próximo agente ou humano saiba exatamente o que fazer.
Indicar explicitamente se este passo foi **preservado** ou **alterado** em relação à última atualização.

### 13. Legados aplicáveis

Lista dos documentos legados (L01–L19) que são fonte de verdade de negócio para esta frente.
Deve seguir a amarração definida no A02.

### 14. Última atualização

Data e hora (ISO 8601) da última atualização deste status.
Indicar também o agente ou humano responsável pela atualização.

### 15. Mudanças em dados persistidos (Supabase) — última tarefa

Declaração obrigatória — inclusive quando não houver mudança na última tarefa:

```
Mudanças em dados persistidos (Supabase): nenhuma
```

ou, se a última tarefa declarou mudança:

```
Mudanças em dados persistidos (Supabase): sim
  Tabela(s) afetada(s):    <lista>
  Tipo(s) de mudança:      <tipos canônicos>
  Impacto na frente:       <como esta mudança afeta o estado ou o próximo passo autorizado>
```

Se a mudança de dados afetar o estado da frente ou o próximo passo autorizado, refletir isso explicitamente nas seções 4 (Estado atual), 12 (Próximo passo autorizado) e 9 (Pendências) deste status.

Ver `schema/DATA_CHANGE_PROTOCOL.md` para tipos canônicos e campos obrigatórios.

### 16. Permissões Cloudflare necessárias — última tarefa

Declaração obrigatória — inclusive quando não houver necessidade nova na última tarefa:

```
Permissões Cloudflare necessárias: nenhuma adicional
```

ou, se a última tarefa declarou necessidade nova:

```
Permissões Cloudflare necessárias: sim
  Recurso Cloudflare afetado:    <recurso>
  Permissão necessária:          <permissão>
  Status atual:                  <pendente | satisfeita | bloqueante>
```

Se a necessidade de permissão Cloudflare bloquear o avanço da frente, refletir isso explicitamente nas seções 4 (Estado atual), 11 (Bloqueios) e 12 (Próximo passo autorizado) deste status.

Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para escopo, campos obrigatórios e regra de parada.

### 17. Fontes consultadas — última tarefa

Declaração obrigatória — inclusive quando a tarefa for de governança sem consumo de legado:

```
Fontes de verdade consultadas — última tarefa:
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência é condição de parada para execução contratual
  Status da frente lido:       schema/status/<FRENTE>_STATUS.md
  Handoff da frente lido:      schema/handoffs/<FRENTE>_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Legado markdown auxiliar:    schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado
```

**Regras:**
- O campo `Contrato ativo lido` é obrigatório — mesmo quando "Nenhum".
- O campo `PDF mestre consultado` é obrigatório quando qualquer bloco legado necessário não estiver transcrito.
- Ver `schema/CONTRACT_SOURCE_MAP.md` para o mapa completo de fontes e a precedência entre elas.

---

## Regras de uso

1. **Atualização obrigatória ao final de qualquer tarefa** — Independente de ser contratual ou fora de contrato, o status vivo deve ser atualizado antes de encerrar a tarefa.
2. **Coerência com o contrato** — O status vivo deve refletir o estado real, não o planejado. Se houver divergência, o status prevalece como registro de fato.
3. **Não substituir pelo handoff** — O status vivo e o handoff são complementares. O status registra o estado; o handoff registra o contexto para continuidade.
4. **Arquivo por frente** — Cada frente tem seu próprio arquivo de status em `schema/status/`.
5. **Nomenclatura** — O nome do arquivo segue o padrão: `<NOME_DA_FRENTE>_STATUS.md`.
6. **Rastreabilidade** — O campo "Classe da última tarefa" e "Pendência remanescente herdada" são obrigatórios para garantir continuidade entre PRs sem depender de conversa.

---

## Exemplo de cabeçalho mínimo

```markdown
# STATUS VIVO — <Nome da Frente> — ENOVA 2

| Campo                                      | Valor                                                                                    |
|--------------------------------------------|------------------------------------------------------------------------------------------|
| Frente                                     | <nome>                                                                                   |
| Contrato ativo                             | <referência ou "Nenhum">                                                                 |
| Estado do contrato                         | <aguardando abertura / aberto / em execução / em revisão / encerrado / arquivado>        |
| Última PR executou qual recorte            | <descrição ou "N/A">                                                                     |
| Pendência contratual                       | <lista ou "N/A">                                                                         |
| Contrato encerrado?                        | <não | sim>                                                                              |
| Item do A01                                | <fase/prioridade/item>                                                                   |
| Estado atual                               | <não iniciada / contrato aberto / em execução / bloqueada / concluída>                   |
| Classe da última tarefa                    | <contratual / governança / fora_de_contrato / correcao_incidental / hotfix / diagnostico>|
| Última PR relevante                        | <referência e descrição ou "Nenhuma">                                                    |
| Último commit                              | <hash ou "Nenhum">                                                                       |
| Pendência remanescente herdada             | <descrição ou "Nenhuma">                                                                 |
| Próximo passo autorizado                   | <descrição> (preservado / alterado)                                                      |
| Legados aplicáveis                         | <L0x, L0y, ...>                                                                          |
| Mudanças em dados persistidos (Supabase)   | <nenhuma | sim — ver seção 15>                                                          |
| Permissões Cloudflare necessárias          | <nenhuma adicional | sim — ver seção 16>                                                 |
| Fontes consultadas — última tarefa         | <ver seção 17>                                                                           |
| Última atualização                         | <data ISO 8601>                                                                          |
```
