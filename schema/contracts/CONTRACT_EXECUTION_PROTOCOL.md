# CONTRACT_EXECUTION_PROTOCOL — Protocolo de Execução Contratual — ENOVA 2

> **Este protocolo é lei operacional complementar ao CODEX_WORKFLOW.**
> Toda PR de execução está sujeita a este protocolo.
> Nenhuma PR pode executar trabalho fora do contrato ativo sem revisão formal.

---

## 1. Finalidade

Este protocolo define como o sistema documental da ENOVA 2 amarra o plano macro às PRs micro, garantindo que:

- Toda PR de execução esteja vinculada a um contrato ativo explícito
- Nenhuma PR possa expandir escopo fora do contrato ativo sem revisão formal
- Desvio de contrato seja condição explícita de parada
- Contrato ativo não possa ser alterado silenciosamente por PR de execução
- O repositório saiba, em qualquer momento, qual contrato está ativo, como uma PR executa um pedaço dele e como esse contrato encerra

---

## 2. Precedência

**schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md > A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis**

Este protocolo está subordinado ao A00, A01 e A02.
Ele tem precedência sobre qualquer decisão de frente individual quando o assunto é execução contratual.

---

## 3. Relação macro → contrato → PR

O sistema documental da ENOVA 2 opera em três camadas de execução:

| Camada | Documento | Papel |
|--------|-----------|-------|
| **Macro** | A00 — Plano Canônico Macro | Define visão, princípios, arquitetura e precedência |
| **Executiva** | A01 — Backlog Mestre + Ordem Executiva | Define ordem de implantação, fases, gates e prioridades |
| **Guia** | A02 — Índice Mestre + Guia de Envio | Define pacote documental e dependências de legados |
| **Contratual** | Contrato ativo da frente | Define escopo, critérios de aceite, fora de escopo e condição de encerramento da frente |
| **Execução** | PR individual | Executa apenas um recorte autorizado do contrato ativo |

**Regras de amarração:**

1. A00 define a visão macro — nenhuma PR pode contradizê-la.
2. A01 define a ordem executiva e o backlog mestre — nenhuma PR pode reordenar fases ou abrir frente fora da sequência.
3. A02 define leitura/envio e dependências de legados — toda PR deve respeitar o pacote documental indicado.
4. O contrato ativo define a execução da frente — a PR executa apenas recorte autorizado do contrato.
5. Nenhuma PR pode expandir escopo fora do contrato ativo sem revisão formal.

---

## 4. Regra de um contrato ativo por frente

- Cada frente da ENOVA 2 pode ter **no máximo 1 contrato ativo** por vez.
- Versões anteriores de contrato são movidas para `schema/contracts/archive/`.
- O índice `schema/contracts/_INDEX.md` deve sempre apontar qual é o contrato ativo da frente.
- Toda PR de execução da frente deve ler obrigatoriamente o contrato ativo antes de começar.
- Se a frente não possui contrato ativo, nenhuma PR de execução contratual pode ser aberta para essa frente (Gate 1 do A01).

---

## 5. Declaração obrigatória de vínculo contratual por PR

Toda PR de execução deve declarar explicitamente:

```
--- VÍNCULO CONTRATUAL ---
Contrato ativo lido:                    <caminho do contrato ativo>
Objetivo imutável do contrato:          <objetivo do contrato — transcrição literal>
Recorte executado nesta PR:             <qual parte do contrato esta PR executa>
O que esta PR fecha do contrato:        <itens do contrato concluídos por esta PR>
O que esta PR NÃO fecha do contrato:    <itens do contrato que permanecem abertos>
Esta PR altera o objetivo do contrato?: não (salvo revisão formal)
Houve desvio de contrato?:              não (salvo abrir revisão formal)
```

Este bloco é obrigatório no PR template e no ESTADO HERDADO/ESTADO ENTREGUE.

---

## 6. Regra anti-desvio de contrato

### O que constitui desvio de contrato

Desvio de contrato ocorre quando uma PR de execução:

- Abre nova frente não prevista no contrato ativo
- Abre novo escopo não previsto no contrato ativo
- Faz entrega fora do objetivo do contrato
- Muda o objetivo do contrato sem revisão formal
- Expande critérios de aceite sem autorização
- Ignora o "fora de escopo" do contrato
- Mistura entregas de frentes diferentes sem necessidade comprovada

### Consequências de desvio de contrato

Se qualquer das situações acima for identificada:

1. **Marcar como DESVIO DE CONTRATO** na PR e no handoff
2. **Parar a execução imediatamente**
3. **Exigir revisão formal** ou **abertura de novo contrato**
4. **Não aceitar a PR** até que o desvio seja resolvido

### Declaração explícita

Toda PR deve declarar:

```
Houve desvio de contrato?: não
```

Se a resposta for `sim`:
```
Houve desvio de contrato?: sim
  Tipo de desvio:          <novo escopo | nova frente | entrega fora do objetivo | outro>
  Descrição do desvio:     <o que aconteceu>
  Ação tomada:             <parada | revisão formal | novo contrato>
```

---

## 7. Protocolo de revisão contratual

### Quando uma revisão contratual é necessária

Uma revisão contratual é necessária quando é preciso mudar:

- Objetivo do contrato
- Escopo do contrato (inclusão ou exclusão de itens)
- Critérios de aceite
- Fora de escopo
- Condição de encerramento
- Dependências ou legados aplicáveis

### Como fazer revisão contratual

1. **Classificar a tarefa como `governança`** (revisão contratual)
2. **Declarar explicitamente** que é uma revisão de contrato, não execução
3. **Atualizar o contrato ativo** com as mudanças explicitamente documentadas
4. **Registrar impacto** em status e handoff
5. **Atualizar `_INDEX.md`** se necessário
6. **Não misturar** revisão contratual com execução na mesma PR

### O que é proibido

- PR de execução não revisa contrato silenciosamente
- Nenhuma mudança de objetivo, escopo, critério de aceite, fora de escopo ou condição de encerramento pode acontecer dentro de uma PR de execução
- Alterar contrato ativo sem classificar a tarefa como revisão contratual/governança é **não conformidade**

---

## 8. Regra de atualização obrigatória

Toda PR de execução contratual deve atualizar, ao final:

1. **Status da frente** (`schema/status/<FRENTE>_STATUS.md`) — incluir contrato ativo, recorte executado, pendência contratual remanescente
2. **Handoff da frente** (`schema/handoffs/<FRENTE>_LATEST.md`) — incluir contrato ativo, recorte executado, pendência contratual remanescente, desvio de contrato
3. **Índice de contratos** (`schema/contracts/_INDEX.md`) — atualizar "Última PR que executou"
4. **Contrato ativo** — se houve mudança de estado contratual (aberto → em execução → concluído)

---

## 9. Integração com o CODEX_WORKFLOW

Este protocolo complementa o `CODEX_WORKFLOW.md`.

Toda PR de execução deve, adicionalmente às 16 etapas do CODEX_WORKFLOW:

1. Ler `schema/contracts/_INDEX.md` para identificar o contrato ativo
2. Ler o contrato ativo da frente
3. Ler `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` (este documento)
4. Declarar o vínculo contratual (seção 5)
5. Fazer checagem de desvio de contrato (seção 6)
6. Atualizar status e handoff com reflexo contratual (seção 8)
7. Se houver encerramento, aplicar `CONTRACT_CLOSEOUT_PROTOCOL.md`

---

## 10. Exemplos curtos

### Exemplo A — PR de execução normal (sem desvio)

```
--- VÍNCULO CONTRATUAL ---
Contrato ativo lido:                    schema/contracts/active/CORE_MECANICO_2_V1.md
Objetivo imutável do contrato:          Modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
Recorte executado nesta PR:             Implementar modelo de objetivos/stages com decisão previsível
O que esta PR fecha do contrato:        - Modelo de objetivos/stages definido
O que esta PR NÃO fecha do contrato:    - Smoke de trilho e next step autorizado
Esta PR altera o objetivo do contrato?: não
Houve desvio de contrato?:              não
```

### Exemplo B — Tentativa de desvio detectada

```
Houve desvio de contrato?: sim
  Tipo de desvio:          novo escopo
  Descrição do desvio:     PR tentou adicionar integração com Speech Engine, que está fora do escopo do contrato do Core Mecânico 2
  Ação tomada:             parada — aguardando revisão formal ou novo contrato
```

### Exemplo C — Revisão contratual necessária

```
Classificação da tarefa: governança (revisão contratual)
Motivo da revisão:       Critério de aceite "Smoke de trilho" precisa ser refinado com cenários específicos
Campos alterados:        Critérios de aceite (seção 8 do contrato)
Impacto:                 Nenhuma mudança de objetivo ou escopo — apenas refinamento de critério de aceite
```

---

## 11. Regra de parada

Se qualquer das condições abaixo for identificada, parar e reportar:

- PR de execução sem contrato ativo declarado
- PR de execução com desvio de contrato não declarado
- Contrato ativo sendo alterado silenciosamente por PR de execução
- Objetivo do contrato sendo modificado sem revisão formal
- Escopo crescendo durante execução sem atualização explícita do contrato
- PR misturando execução contratual com revisão contratual

**Regra de parada não é falha — é conformidade.**
