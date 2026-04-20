# CODEX_WORKFLOW — Protocolo Obrigatório de Execução da ENOVA 2

> **Este documento é a lei operacional única entre PRs.**
> Nenhuma tarefa começa ou termina sem cumprir integralmente este protocolo.
> Qualquer PR futura deve poder ser retomada exclusivamente pelo repositório, sem depender de conversa ou memória de sessão.

---

## 1. Ordem oficial de leitura antes de qualquer tarefa

Toda execução começa com leitura nesta sequência — **obrigatória, sem exceção**:

1. `schema/A00_PLANO_CANONICO_MACRO.md`
2. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. Contrato específico da frente ativa (seguindo formato de `schema/CONTRACT_SCHEMA.md`)
5. Status vivo da frente ativa (`schema/status/<FRENTE>_STATUS.md`)
6. Último handoff da frente ativa (`schema/handoffs/<FRENTE>_LATEST.md`)
7. `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre unificado
8. `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos aplicáveis à frente ativa
9. `schema/TASK_CLASSIFICATION.md`
10. `schema/DATA_CHANGE_PROTOCOL.md`
11. `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
12. `schema/CONTRACT_SCHEMA.md`
13. `schema/STATUS_SCHEMA.md`
14. `schema/HANDOFF_SCHEMA.md`
15. `schema/status/CORE_MECANICO_2_STATUS.md`
16. `schema/handoffs/CORE_MECANICO_2_LATEST.md`
17. `docs/BOOTSTRAP_CLOUDFLARE.md`

Nenhuma tarefa começa sem confirmar esta leitura.

---

## 2. Precedência documental oficial

**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia. O legado manda nas regras de negócio; o pacote canônico manda na arquitetura, na ordem executiva e na forma de implantação.

---

## 3. Fluxo obrigatório de execução — 11 etapas

Toda tarefa deve percorrer as 11 etapas abaixo, **em ordem, sem pular nenhuma**:

```
Etapa 1 — Leitura canônica obrigatória (seção 1 deste documento)
Etapa 2 — Leitura do status vivo da frente
Etapa 3 — Leitura do último handoff da frente
Etapa 4 — Leitura do contrato ativo (se existir)
Etapa 5 — Leitura dos blocos aplicáveis do legado mestre
Etapa 6 — Declaração do ESTADO HERDADO (bloco obrigatório — ver seção 4)
Etapa 7 — Classificação da tarefa (ver schema/TASK_CLASSIFICATION.md)
Etapa 8 — Execução (dentro do escopo declarado)
Etapa 9 — Declaração do ESTADO ENTREGUE (bloco obrigatório — ver seção 5)
Etapa 10 — Atualização viva obrigatória do repositório (ver seção 6)
Etapa 11 — Resposta final padronizada (ver seção 7)
```

**Tarefa sem as etapas 6, 7, 9 e 10 é não conforme e não deve ser aceita.**

---

## 4. Bloco obrigatório: ESTADO HERDADO

Antes de executar (Etapa 6), o agente deve declarar explicitamente o estado herdado da frente:

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: <contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico>
Última PR relevante: <número e título da última PR que afetou esta frente>
Contrato ativo: <nome do contrato ou "Nenhum contrato ativo">
Item do A01: <fase/prioridade/item exato>
Estado atual da frente: <não iniciada | contrato aberto | em execução | bloqueada | concluída>
O que a última PR fechou: <lista objetiva>
O que a última PR NÃO fechou: <lista objetiva>
Por que esta tarefa existe: <justificativa operacional>
Esta tarefa está dentro ou fora do contrato ativo: <dentro | fora — com justificativa se fora>
Objetivo desta tarefa: <objetivo claro e verificável>
Escopo: <o que está incluído>
Fora de escopo: <o que NÃO está incluído>
Mudanças em dados persistidos (Supabase): <nenhuma | sim — se sim, ver schema/DATA_CHANGE_PROTOCOL.md seção 4.2>
Permissões Cloudflare necessárias: <nenhuma adicional | sim — se sim, ver schema/CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2>
```

Este bloco é a âncora de rastreabilidade entre PRs. Sem ele, a tarefa não começa.

> **Regra de dados persistidos:** A declaração `Mudanças em dados persistidos (Supabase)` é obrigatória em todo ESTADO HERDADO — inclusive quando a resposta for `nenhuma`. Ver `schema/DATA_CHANGE_PROTOCOL.md` para tipos canônicos, campos obrigatórios e regra de parada.

> **Regra de permissões Cloudflare:** A declaração `Permissões Cloudflare necessárias` é obrigatória em todo ESTADO HERDADO — inclusive quando a resposta for `nenhuma adicional`. Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para escopo, campos obrigatórios e regra de parada.

---

## 5. Bloco obrigatório: ESTADO ENTREGUE

Ao final da execução (Etapa 9), o agente deve declarar explicitamente o estado entregue:

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: <lista objetiva e verificável>
O que foi fechado nesta PR: <lista dos itens que foram concluídos>
O que continua pendente: <lista do que não coube ou não foi feito>
O que ainda não foi fechado do contrato ativo: <itens do contrato ainda em aberto>
O próximo passo autorizado foi alterado? <sim | não — se sim, descrever a mudança>
Esta tarefa foi fora de contrato? <sim | não — se sim, justificar>
Arquivos vivos atualizados: <lista de arquivos de status/handoff/contrato efetivamente atualizados>
Mudanças em dados persistidos (Supabase): <nenhuma | sim — se sim, ver schema/DATA_CHANGE_PROTOCOL.md seção 4.2>
Permissões Cloudflare necessárias: <nenhuma adicional | sim — se sim, ver schema/CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2>
```

> **Regra de dados persistidos:** A declaração `Mudanças em dados persistidos (Supabase)` é obrigatória em todo ESTADO ENTREGUE — inclusive quando a resposta for `nenhuma`. Se `sim`, todos os campos do bloco detalhado (tabela, tipo, colunas, motivo, impacto, rollback) devem ter sido declarados antes da execução. Ver `schema/DATA_CHANGE_PROTOCOL.md`.

> **Regra de permissões Cloudflare:** A declaração `Permissões Cloudflare necessárias` é obrigatória em todo ESTADO ENTREGUE — inclusive quando a resposta for `nenhuma adicional`. Se `sim`, todos os campos do bloco detalhado devem ter sido declarados. Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.

---

## 6. Atualização viva obrigatória ao final de qualquer tarefa

Ao final de **qualquer tarefa**, independente de ser contratual ou fora de contrato:

1. **Status vivo da frente** (`schema/status/<FRENTE>_STATUS.md`) — atualizar estado atual, última PR, último commit, classe da última tarefa, entregas, pendências, bloqueios e próximo passo autorizado.
2. **Handoff da frente** (`schema/handoffs/<FRENTE>_LATEST.md`) — atualizar com contexto completo: o que foi feito, o que não foi feito, classificação da tarefa, o que a PR anterior fechou/não fechou, o que esta PR fechou/não fechou, riscos e provas.
3. **Contrato da frente** — se houve mudança de estado contratual (aberto → em execução → concluído), atualizar o contrato.
4. **A01/A02/README_EXECUCAO** — se a governança mudou, atualizar o documento correspondente.
5. **Índices** (`schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md`) — atualizar se houve mudança de estado ou novo handoff.

**Regra especial para tarefa fora de contrato:**
Se a tarefa é classificada como `fora_de_contrato`:
- Marcar explicitamente nos arquivos de status e handoff.
- Declarar a justificativa.
- Declarar se alterou ou não o próximo passo autorizado da frente principal.

Regras complementares:
- Não deixar documentos desatualizados em relação ao estado executado.
- A documentação deve sempre representar o estado real, não o estado planejado.
- Atualizar o documento correspondente (contrato da frente, A01 ou handoff) para refletir a nova realidade.

---

## 7. Formato obrigatório de resposta final

Toda tarefa encerrada deve incluir a resposta final completa neste formato:

```
WORKFLOW_ACK: ok

Summary
-------
<resumo objetivo do que foi feito>

Diagnóstico confirmado
----------------------
<o que foi analisado e confirmado antes da execução>

Classificação da tarefa
-----------------------
<contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico>
<justificativa, se fora_de_contrato ou hotfix>

Estado herdado
--------------
<última PR relevante, o que ela fechou, o que ela não fechou>

Alterações realizadas
---------------------
<lista de arquivos criados/alterados com descrição do que mudou>

Item do A01 atendido
--------------------
<fase, prioridade ou item exato do A01 que esta tarefa executa>

Estado atual da frente
----------------------
<em que fase/estado a frente se encontra após esta entrega>

Estado entregue
---------------
<o que foi fechado, o que continua pendente, se o próximo passo foi alterado>

Próximo passo autorizado
------------------------
<qual é o próximo passo explicitamente autorizado pelo A01 e contrato ativo>

Riscos / Pendências
-------------------
<riscos conhecidos, ambiguidades, dependências não resolvidas>

PR / Branch / Commit / Rollback
--------------------------------
<referências de versionamento e plano de rollback>

Smoke tests / Validação
------------------------
<evidências de que a entrega está correta e coerente>

Provas
------
<links, diffs, logs, capturas ou qualquer evidência verificável>
```

---

## 8. Regras de execução

- **Uma frente por vez.** Não misturar Core, Speech, Supabase, Áudio e Canal na mesma PR sem necessidade comprovada.
- **Sem drift.** O escopo não pode crescer durante a execução sem atualização explícita do contrato.
- **Sem implementação fora do contrato ativo.** Nenhuma linha de código funcional, integração real ou arquitetura técnica entra sem autorização do contrato da frente.
- **Sem mistura de frentes sem necessidade comprovada e documentada.**
- **Diagnóstico antes de patch.** Toda mudança começa com leitura e prova do problema.
- **Prova antes de promoção.** Toda entrega precisa de smoke, evidência e plano de rollback.
- **Sem pular etapas.** O fluxo de 11 etapas é obrigatório. Pular etapas é não conformidade.
- **Sem contexto implícito.** Estado herdado e estado entregue devem ser declarados explicitamente — nunca implícitos.

---

## 9. Regra de continuidade entre PRs

Toda PR deve descrever explicitamente:

- **De qual PR ela continua** — número e título.
- **O que herdou** — o que estava pendente, aberto ou incompleto na PR anterior que esta PR recebe como contexto.
- **O que resolveu do herdado** — o que foi fechado do que estava pendente.
- **O que permanece aberto** — o que não coube ou não foi fechado nesta PR.

Esta regra existe para prevenir drift e perda de contexto entre sessões e entre agentes.
O repositório deve ser a única fonte de verdade sobre o estado da frente — não a conversa.

---

## 10. Classificação de tarefa — referência rápida

Toda tarefa deve ser classificada em uma das seguintes classes (definição completa em `schema/TASK_CLASSIFICATION.md`):

| Classe               | Uso resumido                                                      |
|----------------------|-------------------------------------------------------------------|
| `contratual`         | Dentro do contrato ativo da frente                                |
| `governança`         | Cria/atualiza regras, schemas, workflow, documentação operacional |
| `fora_de_contrato`   | Necessária mas fora do contrato ativo — declarar justificativa    |
| `correcao_incidental`| Correção cirúrgica acoplada ao trabalho em andamento              |
| `hotfix`             | Correção urgente e crítica                                        |
| `diagnostico`        | Somente leitura, análise e diagnóstico — nenhuma entrega técnica  |

**Tarefa não classificada = tarefa não conforme.**

---

## 11. Schemas obrigatórios de governança

Os seguintes schemas definem o formato obrigatório de artefatos de governança:

- `schema/CONTRACT_SCHEMA.md` — formato obrigatório de qualquer contrato novo de frente.
- `schema/STATUS_SCHEMA.md` — formato obrigatório de status vivo por frente.
- `schema/HANDOFF_SCHEMA.md` — formato obrigatório de handoff persistido por frente.
- `schema/TASK_CLASSIFICATION.md` — classificação canônica de tarefas e PRs.
- `schema/DATA_CHANGE_PROTOCOL.md` — protocolo obrigatório de mudanças em dados persistidos do Supabase.
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — protocolo obrigatório de permissões Cloudflare.

Nenhum contrato, status ou handoff deve ser criado fora destes formatos.

---

## 12. Estrutura de contexto vivo

O repositório mantém contexto vivo em:

- `schema/status/` — status vivos por frente (índice em `_INDEX.md`)
- `schema/handoffs/` — handoffs persistidos por frente (índice em `_INDEX.md`)
- `schema/legacy/` — legado mestre unificado (índice em `INDEX_LEGADO_MESTRE.md`, conteúdo em `LEGADO_MESTRE_ENOVA1_ENOVA2.md`)
- `schema/source/` — PDF mestre original (`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`)

---

## 13. Regra de parada

Se qualquer das condições abaixo for identificada, parar e reportar em vez de improvisar:

- Ambiguidade estrutural não resolvida pelo A00, A01 ou A02
- Conflito documental entre camadas da precedência
- Ausência de contrato ativo explícito para a frente
- Escopo que ultrapassa o contrato ativo sem autorização
- Estado herdado não declarado ou inconsistente com o repositório
- Classificação de tarefa ausente ou incompatível com o escopo
- Mudança em dados persistidos (Supabase) sem declaração completa dos campos obrigatórios (tabela, tipo, colunas, motivo, impacto, rollback) — ver `schema/DATA_CHANGE_PROTOCOL.md` seção 5
- Introdução de dependência de recurso Cloudflare sem declaração completa dos campos obrigatórios (recurso, ação, permissões suficientes, impacto) — ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` seção 5

**Regra de parada não é falha — é conformidade.**

---

## 14. Protocolo de dados persistidos (Supabase)

Toda tarefa deve declarar explicitamente se há ou não mudanças em dados persistidos do Supabase.

Ver `schema/DATA_CHANGE_PROTOCOL.md` para:
- Tipos canônicos de mudança (`create_table`, `add_column`, `alter_column`, etc.)
- Campos obrigatórios de declaração quando houver mudança
- Regra de parada para mudança não declarada
- Regra de rollback e compatibilidade retroativa
- O que é proibido
- Exemplos de declaração

**Declaração obrigatória em todo ESTADO HERDADO e ESTADO ENTREGUE:**
```
Mudanças em dados persistidos (Supabase): nenhuma
```
ou
```
Mudanças em dados persistidos (Supabase): sim
  [campos obrigatórios conforme DATA_CHANGE_PROTOCOL.md seção 4.2]
```

Ausência desta declaração = tarefa não conforme.

---

## 15. Protocolo de permissões Cloudflare

Toda tarefa deve declarar explicitamente se há ou não necessidade nova de permissão Cloudflare.

Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para:
- Recursos cobertos (Workers, KV, R2, D1, Queues, Service Bindings, Routes, Secrets, Vars, Observability)
- Campos obrigatórios de declaração quando houver necessidade nova
- Regra de parada para necessidade não declarada
- Regra de escopo mínimo do token
- Regra de aviso preventivo ao usuário
- Exemplos de declaração

**Declaração obrigatória em todo ESTADO HERDADO e ESTADO ENTREGUE:**
```
Permissões Cloudflare necessárias: nenhuma adicional
```
ou
```
Permissões Cloudflare necessárias: sim
  [campos obrigatórios conforme CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2]
```

Ausência desta declaração = tarefa não conforme.
