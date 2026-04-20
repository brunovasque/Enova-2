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

### 2. Classificação da tarefa

Classificação canônica da tarefa que gerou este handoff:
`contratual` | `governança` | `fora_de_contrato` | `correcao_incidental` | `hotfix` | `diagnostico`

Se a classificação for `fora_de_contrato` ou `hotfix`, incluir justificativa explícita.
Ver definições completas em `schema/TASK_CLASSIFICATION.md`.

### 3. Última PR relevante

Número e título da última PR que afetou esta frente antes desta entrega.

### 4. O que a PR anterior fechou

Lista objetiva do que foi entregue e fechado pela PR anterior.

### 5. O que a PR anterior NÃO fechou

Lista objetiva do que ficou pendente, excluído ou não foi possível na PR anterior.
Indica o que esta PR herda como contexto aberto.

### 6. Diagnóstico confirmado

O que foi analisado, verificado e confirmado antes ou durante a execução.
Inclui leituras feitas, documentos consultados, decisões validadas e premissas confirmadas.

### 7. O que foi feito

Lista objetiva do que foi entregue, criado, alterado ou aprovado nesta PR.
Cada item deve ser verificável (referência a PR, commit, arquivo ou evidência).

### 8. O que não foi feito

Lista explícita do que ficou pendente, do que foi deliberadamente excluído e do que não coube nesta entrega.
Deve indicar se cada item pendente é bloqueio, decisão deliberada ou limitação de escopo.

### 9. O que esta PR fechou

Lista objetiva dos itens que foram definitivamente concluídos e fechados nesta PR.

### 10. O que continua pendente após esta PR

Lista do que permanece em aberto e deve ser tratado na próxima tarefa.
Distinguir entre: pendência de contrato, pendência de governança e pendência de legado.

### 11. Esta tarefa foi fora de contrato?

Declarar explicitamente: `sim` | `não`
Se sim:
- Justificativa: `<por que foi necessária>`
- Impacto no próximo passo autorizado: `alterou | não alterou` — `<descrição>`

### 11a. Contrato ativo

Referência ao contrato ativo da frente durante esta entrega.
Se não houver contrato ativo: `Nenhum contrato ativo`.
Caminho: `schema/contracts/active/<NOME>.md`

### 11b. Recorte executado do contrato

Qual parte do contrato ativo esta PR executou.
Se não executou contrato (governança/infra): `N/A`.

### 11c. Pendência contratual remanescente

Itens do contrato ativo que permanecem abertos após esta PR.
Se não há contrato ativo: `N/A`.

### 11d. Houve desvio de contrato?

Declarar explicitamente: `não` | `sim`
Se sim:
- Tipo de desvio: `<novo escopo | nova frente | entrega fora do objetivo | outro>`
- Descrição: `<o que aconteceu>`
- Ação tomada: `<parada | revisão formal | novo contrato>`

Ver `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` seção 6.

### 11e. Contrato encerrado nesta PR?

Declarar explicitamente: `não` | `sim`
Se sim: incluir bloco de encerramento conforme `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` seção 4.
Indicar próximo contrato autorizado.

### 12. Arquivos relevantes

Lista de arquivos criados, alterados ou que devem ser consultados para continuidade.
Caminhos relativos à raiz do repositório.

### 13. Item do A01 atendido

Indicação explícita de qual fase, prioridade e item do A01 foi atendido (total ou parcialmente) por esta entrega.

### 14. Estado atual da frente

Estado da frente após esta entrega, usando os valores canônicos definidos no STATUS_SCHEMA:
`não iniciada` | `contrato aberto` | `em execução` | `bloqueada` | `concluída`

### 15. Próximo passo autorizado

Qual é o passo imediato autorizado para continuar esta frente.
Deve ser coerente com o A01, o contrato ativo e o status vivo.
Declarar explicitamente se este próximo passo foi alterado em relação ao que estava definido antes desta PR.

### 16. Riscos

Riscos identificados, ambiguidades não resolvidas, dependências externas ou condições que podem afetar a continuidade.

### 17. Provas

Evidências apresentadas para validar a entrega: diffs, PRs, commits, smoke tests, capturas, logs ou qualquer artefato verificável.

### 18. Mudanças em dados persistidos (Supabase)

Declaração obrigatória — inclusive quando não houver mudança:

```
Mudanças em dados persistidos (Supabase): nenhuma
```

ou, se houver mudança:

```
Mudanças em dados persistidos (Supabase): sim
  Tabela(s) afetada(s):    <lista>
  Tipo(s) de mudança:      <tipos canônicos — ver schema/DATA_CHANGE_PROTOCOL.md seção 3>
  Coluna(s) afetada(s):   <lista ou "N/A">
  O que ficou pendente:    <qualquer mudança de dado iniciada mas não concluída nesta PR>
  Rollback disponível:     <sim | não — referência ao plano de rollback>
```

Ver `schema/DATA_CHANGE_PROTOCOL.md` para tipos canônicos, campos obrigatórios e regra de parada.

### 19. Permissões Cloudflare necessárias

Declaração obrigatória — inclusive quando não houver necessidade nova:

```
Permissões Cloudflare necessárias: nenhuma adicional
```

ou, se houver necessidade nova:

```
Permissões Cloudflare necessárias: sim
  Recurso Cloudflare afetado:          <recurso>
  Permissão necessária:                <permissão>
  Permissões atuais suficientes?        <sim | não | incerto>
  O que ficou pendente:                <o que ainda precisa ser feito para satisfazer a permissão>
  Onde ajustar:                         <token Cloudflare | GitHub Secrets | wrangler.toml | Cloudflare Dashboard | outro>
  Risco se não ajustar:                <impacto de não ampliar as permissões>
```

Se a frente ficou bloqueada por permissão Cloudflare insuficiente, refletir isso no campo `Estado da frente` (seção 14) e no `Próximo passo autorizado` (seção 15).

Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para escopo, campos obrigatórios e regra de parada.

---

## Regras de uso

1. **Atualização obrigatória ao final de qualquer tarefa** — Independente de ser contratual ou fora de contrato, o handoff deve ser atualizado (ou um novo handoff criado) antes de encerrar a tarefa.
2. **Arquivo por frente** — Cada frente tem seu próprio arquivo de handoff mais recente em `schema/handoffs/`.
3. **Nomenclatura** — O arquivo do handoff mais recente segue o padrão: `<NOME_DA_FRENTE>_LATEST.md`.
4. **Handoffs históricos** — Se necessário preservar o histórico, handoffs anteriores podem ser renomeados com sufixo de data: `<NOME_DA_FRENTE>_<YYYY-MM-DD>.md`. O `_LATEST.md` sempre aponta para o estado mais recente.
5. **Complementar ao status** — O handoff registra contexto narrativo; o status registra estado objetivo. Ambos devem ser atualizados juntos.
6. **Não substituir o contrato** — O handoff descreve o que aconteceu e o que vem a seguir, mas o contrato é quem autoriza a execução.
7. **Continuidade entre PRs** — O handoff deve sempre indicar explicitamente de qual PR ele continua e o que herdou.

---

## Exemplo de cabeçalho mínimo

```markdown
# HANDOFF — <Nome da Frente> — ENOVA 2

| Campo                                      | Valor                                                        |
|--------------------------------------------|--------------------------------------------------------------|
| Frente                                     | <nome>                                                       |
| Data                                       | <data ISO 8601>                                              |
| Estado da frente                           | <estado canônico>                                            |
| Classificação da tarefa                    | <contratual | governança | fora_de_contrato | ...>            |
| Última PR relevante                        | <número e título>                                            |
| Contrato ativo                             | <caminho ou "Nenhum">                                         |
| Recorte executado do contrato              | <descrição ou "N/A">                                          |
| Pendência contratual remanescente          | <lista ou "N/A">                                              |
| Houve desvio de contrato?                  | <não | sim>                                                    |
| Contrato encerrado nesta PR?               | <não | sim>                                                    |
| Item do A01 atendido                       | <fase/prioridade/item>                                       |
| Próximo passo autorizado                   | <descrição>                                                  |
| Próximo passo foi alterado?                | <sim | não>                                                   |
| Tarefa fora de contrato?                   | <sim | não>                                                   |
| Mudanças em dados persistidos (Supabase)   | <nenhuma | sim — ver seção 18>                               |
| Permissões Cloudflare necessárias          | <nenhuma adicional | sim — ver seção 19>                      |
```
