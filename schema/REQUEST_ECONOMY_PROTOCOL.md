# REQUEST_ECONOMY_PROTOCOL — Protocolo de Economia de Request

> **Documento de governança obrigatório.**
> Todo agente, PR e automação da ENOVA 2 deve seguir este protocolo.
> Precedência: subordinado ao A00, A01, A02 e ao CODEX_WORKFLOW.

---

## 1. Finalidade

Este documento existe para impedir desperdício de request, inflação de custo operacional e automação desgovernada na ENOVA 2.

Todo prompt, PR, correção e automação deve operar com **escopo máximo fechado e custo mínimo justificável**.

---

## 2. Princípios obrigatórios

### 2.1 Escopo fechado antes de abrir qualquer tarefa

- Toda tarefa, PR ou correção deve ter escopo declarado **antes de executar**.
- Nenhum agente deve abrir investigação livre, escanear arquivos sem necessidade ou consumir request por precaução.
- O escopo não pode crescer durante a execução sem atualização explícita do contrato e nova PR.

### 2.2 Resolver o máximo dentro do escopo comprovado

- Dentro do escopo autorizado, o agente deve resolver o máximo possível sem abrir PR extra desnecessária.
- Evitar múltiplas PRs para o que cabe em uma única PR dentro do mesmo escopo comprovado.
- Correções incidentais diretamente relacionadas ao trabalho em andamento devem ser feitas na mesma PR (classe `correcao_incidental`).

### 2.3 Preferência por modelo barato

| Complexidade da tarefa       | Modelo preferido         | Quando escalar                          |
|------------------------------|--------------------------|-----------------------------------------|
| Baixa — governança, docs     | Sonnet ou equivalente    | Não escalar                             |
| Média — refatoração, scripts | Sonnet ou equivalente    | Só escalar com justificativa clara      |
| Alta — arquitetura, lógica   | Modelo mais caro         | Somente com justificativa documentada   |

**Regra:** só usar modelo mais caro quando a complexidade justificar claramente e a justificativa estiver registrada na PR ou no handoff.

### 2.4 Evitar investigação aberta sem necessidade

- Não solicitar leitura de múltiplos arquivos quando um bastaria.
- Não reenviar pacote documental completo quando o escopo da tarefa é pontual.
- O pacote mínimo canônico (A00 + A01 + A02 + contrato ativo) é suficiente para abrir nova aba — não adicionar documentos desnecessários.
- Documentos legados só entram quando o A02 indicar que aquela frente depende deles.

### 2.5 Preferir automação determinística sobre LLM

- Onde regex, check de arquivo ou script simples resolve: usar isso.
- Não usar LLM para validação que pode ser feita deterministicamente.
- Não criar agente autônomo onde um script bash ou node.js resolve.
- Não criar loop automático de correção.
- Não criar automação recursiva ou dependente de modelo.

### 2.6 Evitar automação cara e prematura

- Não criar workflows complexos onde um script simples resolve.
- Não criar múltiplos workflows redundantes para a mesma validação.
- Não criar bots executores autônomos.
- Toda nova automação deve declarar seu custo operacional esperado e por que é necessária.

---

## 3. Regras de aplicação por contexto

### 3.1 Prompts e sessões de agente

- Prompts devem vir fechados, com escopo declarado e objetivo mensurável.
- Evitar prompts do tipo "veja tudo e me diga o que fazer".
- Preferir prompts do tipo "execute X dentro do contrato Y, conforme arquivo Z".
- Quanto mais fechado o prompt, menor o consumo de request e menor o risco de drift.

### 3.2 Correções e bugfixes

- Correção de bug deve ser cirúrgica e confinada ao escopo comprovado.
- Não refatorar fora do combinado como efeito colateral de um bugfix.
- Se o bugfix revelar necessidade de refatoração maior: parar, documentar e abrir nova PR com contrato.

### 3.3 PRs e escopo

- Toda PR deve declarar seu escopo antes de ser aberta.
- PRs de governança são baratas em custo de request: preferir resolver o máximo na mesma PR.
- PRs de implementação técnica devem ser por fatia operacional completa, conforme A00 seção 13.

### 3.4 Automações e workflows

- Toda nova automação deve ser avaliada pelo critério: "isso pode ser resolvido com script simples?".
- Se sim: usar script simples.
- Se não: documentar por que não pode, e justificar a complexidade da automação proposta.
- Toda automação deve declarar seu custo operacional (tempo de execução, dependências, custo de API).

---

## 4. O que é proibido

- Abrir investigação livre sem objetivo declarado.
- Usar modelo caro para tarefa que Sonnet resolve.
- Criar automação que depende de LLM onde regex resolve.
- Criar múltiplos workflows redundantes para a mesma gate.
- Reenviar pacote documental completo quando o escopo é pontual.
- Criar bot autônomo executor sem supervisão humana explícita.
- Abrir múltiplas PRs para o que cabe em uma dentro do mesmo escopo comprovado.
- Deixar escopo em aberto para "investigar depois" dentro de uma PR já aberta.

---

## 5. Declaração obrigatória em PRs

Toda PR que envolva automação, modelo ou custo operacional relevante deve declarar:

```
Custo operacional estimado: <baixo | médio | alto — justificativa>
Modelo utilizado: <Sonnet | modelo mais caro — justificativa se mais caro>
Automação introduzida: <nenhuma | sim — descrição e justificativa>
```

Esta declaração é recomendada; obrigatória em PRs de automação ou infra.

---

## 6. Gate de conformidade (automatizado)

A partir desta PR, o repositório passa a ter gate automatizado de validação de PR:
- `.github/workflows/pr-governance-check.yml` — valida presença de campos obrigatórios no corpo da PR
- `scripts/validate_pr_governance.js` — script determinístico (sem LLM, sem dependência externa)

O gate não usa modelo. Ele usa regex e checagem de presença de campo. Custo: praticamente zero além do GitHub Actions gratuito.

---

## 7. Referências

- `schema/CODEX_WORKFLOW.md` — lei operacional única entre PRs
- `schema/TASK_CLASSIFICATION.md` — classificação canônica de tarefas
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo de execução contratual
- `.github/AGENT_CONTRACT.md` — mandato e regras do agente
- `.github/workflows/pr-governance-check.yml` — gate automatizado
- `scripts/validate_pr_governance.js` — script de validação

---

## 8. Precedência

Este documento é subordinado a: **schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md > A00 > A01 > A02 > CODEX_WORKFLOW > contratos ativos**.

Em caso de conflito com este documento, prevalece a cadeia de precedência acima.

---

*Criado em: 2026-04-20 | Classe: governança | PR de origem: PR #9*
