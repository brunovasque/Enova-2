# TASK_CLASSIFICATION — Classificação Canônica de Tarefas e PRs — ENOVA 2

## Finalidade

Este documento define as classes canônicas de tarefas e PRs da ENOVA 2.
Toda tarefa ou PR **deve** ser classificada explicitamente em uma das classes abaixo antes da execução.
A classificação define o que a tarefa pode fazer, o que não pode fazer, quais arquivos deve atualizar obrigatoriamente e se pode ou não alterar o próximo passo autorizado.

## Precedência

Este documento está subordinado ao A00, A01 e A02.
A classificação nunca substitui o contrato ativo nem a precedência documental oficial.

---

## Classes canônicas

### 1. `contratual`

**Quando usar:**
Tarefa que executa diretamente um item contratado no contrato ativo da frente.
O contrato existe, está aberto e esta tarefa está dentro do escopo exato contratado.

**O que pode fazer:**
- Executar as entregas previstas no contrato ativo.
- Criar ou modificar artefatos técnicos e documentais autorizados pelo contrato.
- Avançar o estado da frente conforme o A01.

**O que não pode fazer:**
- Sair do escopo contratado sem atualização formal do contrato.
- Abrir trabalho em outra frente sem autorização.
- Alterar próximo passo autorizado sem evidência de que o contrato atual foi cumprido.

**Arquivos obrigatoriamente atualizados ao final:**
- `schema/status/<FRENTE>_STATUS.md` — estado atual, última PR, entregas, pendências.
- `schema/handoffs/<FRENTE>_LATEST.md` — contexto narrativo completo, com o que foi e o que não foi feito.
- Contrato da frente, se houve mudança de estado (aberto → em execução → concluído).
- `schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md`, se o estado mudou.

**Pode alterar próximo passo autorizado?**
Sim, se a entrega fechar o item contratado e o A01 aponta para o passo seguinte.

---

### 2. `governança`

**Quando usar:**
Tarefa que cria, atualiza ou endurece regras operacionais, schemas, templates, workflow, contratos ou documentação de governança.
Não envolve implementação funcional. Não pertence diretamente a um contrato de frente técnica.

**O que pode fazer:**
- Criar ou atualizar arquivos de governança: CODEX_WORKFLOW, schemas, AGENT_CONTRACT, PULL_REQUEST_TEMPLATE, README, A00/A01/A02 (com autorização).
- Criar ou atualizar estrutura de contexto vivo (status, handoffs, índices).
- Registrar legados, transcrições ou contexto operacional.

**O que não pode fazer:**
- Criar código funcional, workers, apps, integrações reais ou scaffold técnico.
- Alterar a ordem macro do A01 sem autorização explícita.
- Abrir ou fechar contratos de frentes técnicas.

**Arquivos obrigatoriamente atualizados ao final:**
- `schema/status/<FRENTE>_STATUS.md` — se o estado da frente mudou em razão desta governança.
- `schema/handoffs/<FRENTE>_LATEST.md` — registrar o que foi feito e por quê.
- Quaisquer arquivos de governança que foram alterados.

**Pode alterar próximo passo autorizado?**
Sim, se a governança esclarece ou redefine o caminho operacional da frente.

---

### 3. `fora_de_contrato`

**Quando usar:**
Tarefa necessária e legítima, mas que não pertence ao contrato ativo da frente.
Pode ser uma correção urgente, uma necessidade operacional emergente ou uma tarefa de suporte que surgiu durante a execução.

**O que pode fazer:**
- Executar o que for estritamente necessário para a finalidade emergente.
- Documentar a justificativa e o impacto.

**O que não pode fazer:**
- Expandir o escopo além da necessidade imediata que a justificou.
- Alterar o próximo passo autorizado da frente principal sem declaração explícita e justificativa.
- Ser usada para introduzir implementação funcional não autorizada.

**Arquivos obrigatoriamente atualizados ao final:**
- `schema/handoffs/<FRENTE>_LATEST.md` — registrar que foi uma tarefa fora de contrato, a justificativa, e se alterou ou não o próximo passo autorizado.
- `schema/status/<FRENTE>_STATUS.md` — atualizar se o estado da frente foi afetado.

**Pode alterar próximo passo autorizado?**
Somente com declaração explícita, justificativa documentada e aprovação implícita ou explícita.

**Obrigação adicional:**
Marcar explicitamente no handoff e no status:
```
Classificação: fora_de_contrato
Justificativa: <por que foi necessária>
Impacto no próximo passo autorizado: <alterou / não alterou> — <descrição>
```

---

### 4. `correcao_incidental`

**Quando usar:**
Correção de bug, inconsistência ou erro encontrado no caminho da tarefa principal — diretamente causado ou fortemente acoplado ao código ou documentação que está sendo alterado.
A correção é pequena, cirúrgica e não expande o escopo da tarefa original.

**O que pode fazer:**
- Corrigir o problema diretamente relacionado à tarefa em andamento.
- Registrar a correção na resposta final e no handoff.

**O que não pode fazer:**
- Expandir para correções não relacionadas.
- Tratar bugs que não têm relação direta com o escopo da tarefa.
- Abrir refatoração.

**Arquivos obrigatoriamente atualizados ao final:**
- Mesmos arquivos da tarefa principal (status + handoff).
- A correção deve ser mencionada explicitamente na seção "Alterações realizadas" da resposta final.

**Pode alterar próximo passo autorizado?**
Não, salvo se a correção revelar um bloqueio que mude o estado da frente.

---

### 5. `hotfix`

**Quando usar:**
Correção urgente e crítica que não pode esperar o fluxo normal de contrato.
Normalmente envolve bug em produção, inconsistência bloqueante ou ruptura de governança grave.
Deve ser declarado como hotfix no início da tarefa.

**O que pode fazer:**
- Corrigir o problema crítico identificado.
- Atualizar todos os documentos afetados pela ruptura.

**O que não pode fazer:**
- Expandir o escopo além do problema crítico.
- Substituir o contrato ativo ou a governança normal.
- Ser usado como atalho para evitar o ritual obrigatório de execução.

**Arquivos obrigatoriamente atualizados ao final:**
- `schema/status/<FRENTE>_STATUS.md` — refletir o estado pós-hotfix.
- `schema/handoffs/<FRENTE>_LATEST.md` — registrar o hotfix, a causa raiz, o que foi corrigido e o impacto.
- Qualquer arquivo diretamente afetado pela ruptura.

**Pode alterar próximo passo autorizado?**
Sim, se o hotfix resolve um bloqueio e o A01 aponta para retomada.

**Obrigação adicional:**
Declarar explicitamente no início:
```
Classificação: hotfix
Problema crítico identificado: <descrição>
Impacto declarado: <o que estava rompido>
```

---

### 6. `diagnostico`

**Quando usar:**
Tarefa exclusiva de leitura, análise e diagnóstico.
Nenhum arquivo é alterado. O objetivo é produzir um diagnóstico documentado para subsidiar a próxima decisão ou tarefa.

**O que pode fazer:**
- Ler, analisar, comparar e diagnosticar o estado atual.
- Produzir documento de diagnóstico.
- Declarar ambiguidades, riscos, bloqueios e recomendações.

**O que não pode fazer:**
- Criar ou alterar artefatos além do documento de diagnóstico.
- Executar qualquer entrega técnica ou documental fora do diagnóstico.
- Declarar próximo passo autorizado alterado (apenas recomendar).

**Arquivos obrigatoriamente atualizados ao final:**
- Nenhuma atualização obrigatória de status ou handoff, salvo se o diagnóstico revelar estado diferente do documentado — neste caso, atualizar o status com as descobertas.
- Documento de diagnóstico produzido deve ser referenciado no handoff da frente.

**Pode alterar próximo passo autorizado?**
Não diretamente. O diagnóstico pode recomendar uma mudança, mas a decisão cabe ao humano ou a uma tarefa subsequente do tipo `governança` ou `contratual`.

---

## Tabela resumo

| Classe               | Contrato obrigatório? | Pode mexer em código? | Pode alterar próximo passo? | Obrigação especial                    |
|----------------------|----------------------|----------------------|----------------------------|---------------------------------------|
| `contratual`         | Sim                  | Sim (autorizado)     | Sim (se item concluído)    | Atualizar status + handoff + contrato |
| `governança`         | Não                  | Não                  | Sim (se redefine caminho)  | Não abrir código funcional            |
| `fora_de_contrato`   | Não                  | Restrito             | Só com justificativa       | Declarar justificativa e impacto      |
| `correcao_incidental`| Não                  | Sim (cirúrgico)      | Não                        | Mencionar na resposta final           |
| `hotfix`             | Não                  | Sim (crítico)        | Sim (se remove bloqueio)   | Declarar causa raiz e impacto         |
| `diagnostico`        | Não                  | Não                  | Não                        | Produzir documento de diagnóstico     |

---

## Uso no workflow

A classificação da tarefa deve aparecer:

1. Na declaração de abertura obrigatória do `CODEX_WORKFLOW` (bloco `ESTADO HERDADO`).
2. No `PULL_REQUEST_TEMPLATE` — campo `Classificação da tarefa`.
3. No `HANDOFF_SCHEMA` — campo `Classificação da tarefa`.
4. No `STATUS_SCHEMA` — campo `Classe da última tarefa`.

Qualquer tarefa não classificada explicitamente é **não conforme** e deve ser parada até que a classificação seja declarada.

---

## Obrigação universal de declaração de dados persistidos

**Independente da classe da tarefa**, toda tarefa deve declarar explicitamente no ESTADO HERDADO e no ESTADO ENTREGUE:

```
Mudanças em dados persistidos (Supabase): nenhuma
```
ou
```
Mudanças em dados persistidos (Supabase): sim
  [campos obrigatórios conforme schema/DATA_CHANGE_PROTOCOL.md seção 4.2]
```

Esta declaração é obrigatória em **todas** as classes: `contratual`, `governança`, `fora_de_contrato`, `correcao_incidental`, `hotfix` e `diagnostico`.

Ausência desta declaração = tarefa não conforme, independente da classe.

Ver `schema/DATA_CHANGE_PROTOCOL.md` para tipos canônicos, campos obrigatórios, regra de parada e exemplos.
