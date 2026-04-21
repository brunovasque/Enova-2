# CODEX_WORKFLOW — Protocolo Obrigatório de Execução da ENOVA 2

> **Este documento é a lei operacional única entre PRs.**
> Nenhuma tarefa começa ou termina sem cumprir integralmente este protocolo.
> Qualquer PR futura deve poder ser retomada exclusivamente pelo repositório, sem depender de conversa ou memória de sessão.

---

## 1. Lista de documentos de leitura obrigatória

> **Esta seção define os documentos a ler — não as etapas de execução.**
> A lista de leitura (abaixo) e o fluxo de execução (seção 3 — 16 etapas) são duas coisas distintas.
> `16 etapas` ≠ `26 documentos de leitura`. Não confundir.

Toda execução começa com leitura nesta sequência — **obrigatória, sem exceção**:

1. `schema/A00_PLANO_CANONICO_MACRO.md`
2. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. `schema/contracts/_INDEX.md` — **índice canônico de contratos ativos por frente**
5. Contrato ativo da frente (em `schema/contracts/active/`) — seguindo formato de `schema/CONTRACT_SCHEMA.md` — **se ausente: condição de parada (ver seção 19)**
6. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — **protocolo de execução contratual**
7. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — **protocolo de encerramento de contrato**
8. Status vivo da frente ativa (`schema/status/<FRENTE>_STATUS.md`)
9. Último handoff da frente ativa (`schema/handoffs/<FRENTE>_LATEST.md`)
10. `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre unificado
11. `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos aplicáveis à frente ativa (se transcrito; caso contrário, ver PDF em `schema/source/`)
12. `schema/CONTRACT_SOURCE_MAP.md` — **mapa de fontes e ponte documental operacional**
13. `schema/TASK_CLASSIFICATION.md`
14. `schema/DATA_CHANGE_PROTOCOL.md`
15. `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
16. `schema/CONTRACT_SCHEMA.md`
17. `schema/STATUS_SCHEMA.md`
18. `schema/HANDOFF_SCHEMA.md`
19. `schema/status/CORE_MECANICO_2_STATUS.md`
20. `schema/handoffs/CORE_MECANICO_2_LATEST.md`
21. `docs/BOOTSTRAP_CLOUDFLARE.md`
22. `wrangler.toml`
23. `.github/workflows/pr-governance-check.yml`
24. `.github/PULL_REQUEST_TEMPLATE.md`
25. `.github/AGENT_CONTRACT.md`
26. `scripts/validate_pr_governance.js`
27. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` — **LEITURA OBRIGATÓRIA em toda tarefa que toque conversa, atendimento, LLM, speech, surface, fallback, multimodalidade ou fluxo cognitivo. Regra-mãe canônica: IA soberana na fala, mecânico jamais com prioridade de fala.**
  

Nenhuma tarefa começa sem confirmar esta leitura.

> **ATENÇÃO — ADENDO CANÔNICO ATIVO (A00-ADENDO-01):** `schema/ADENDO_CANONICO_SOBERANIA_IA.md` é leitura obrigatória antes de qualquer tarefa que toque conversa, LLM, speech, surface, fallback ou fluxo cognitivo. Nenhuma tarefa nessas áreas pode ser iniciada sem confirmar a leitura deste adendo. Ver seção 2 abaixo para posição na cadeia de precedência.

---

## 2. Precedência documental oficial

**A00 > A01 > A00-ADENDO-01 (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`) > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia. O legado manda nas regras de negócio; o pacote canônico manda na arquitetura, na ordem executiva e na forma de implantação.

> **Adendo canônico ativo (A00-ADENDO-01):** `schema/ADENDO_CANONICO_SOBERANIA_IA.md` fixa como regra permanente que a IA é soberana em raciocínio e fala, e que é proibido dar qualquer prioridade de fala ao mecânico. Este adendo é transversal a todas as frentes e vigora imediatamente. Nenhum contrato de frente pode ser aberto ou executado de forma que contradiga este adendo.

---

## 3. Fluxo obrigatório de execução — 16 etapas

> **Esta seção define o fluxo de execução — não a lista de documentos a ler.**
> As 16 etapas abaixo são ações sequenciais do agente. A Etapa 1 ("Leitura canônica") executa a lista de documentos da seção 1 (26 itens), mas as 16 etapas e os 26 itens de leitura são categorias distintas.
> `16 etapas de execução` ≠ `26 documentos de leitura`.

Toda tarefa deve percorrer as 16 etapas abaixo, **em ordem, sem pular nenhuma**:

```
Etapa 1  — Leitura canônica obrigatória (seção 1 deste documento)
Etapa 2  — Leitura do índice de contratos (schema/contracts/_INDEX.md)
Etapa 3  — Leitura do contrato ativo da frente (se existir, em schema/contracts/active/)
Etapa 4  — Leitura do CONTRACT_EXECUTION_PROTOCOL e CONTRACT_CLOSEOUT_PROTOCOL
Etapa 5  — Leitura do status vivo da frente
Etapa 6  — Leitura do último handoff da frente
Etapa 7  — Leitura dos blocos aplicáveis do legado mestre
Etapa 8  — Declaração do ESTADO HERDADO (bloco obrigatório — ver seção 4)
Etapa 9  — Classificação da tarefa (ver schema/TASK_CLASSIFICATION.md)
Etapa 10 — Declaração do vínculo contratual (ver CONTRACT_EXECUTION_PROTOCOL seção 5)
Etapa 11 — Checagem de desvio de contrato (ver CONTRACT_EXECUTION_PROTOCOL seção 6)
Etapa 12 — Execução (dentro do escopo declarado)
Etapa 13 — Declaração do ESTADO ENTREGUE (bloco obrigatório — ver seção 5)
Etapa 14 — Atualização viva obrigatória do repositório (ver seção 6)
Etapa 15 — Se houver encerramento de contrato: aplicar CONTRACT_CLOSEOUT_PROTOCOL
Etapa 16 — Resposta final padronizada (ver seção 7)
```

**Tarefa sem as etapas 8, 9, 10, 11, 13 e 14 é não conforme e não deve ser aceita.**

---

## 4. Bloco obrigatório: ESTADO HERDADO

Antes de executar (Etapa 8), o agente deve declarar explicitamente o estado herdado da frente:

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: <contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico>
Última PR relevante: <número e título da última PR que afetou esta frente>
Contrato ativo: <nome do contrato ou "Nenhum contrato ativo">
Objetivo imutável do contrato: <objetivo literal do contrato ativo ou "N/A">
Recorte a executar nesta PR: <qual parte do contrato esta PR vai executar ou "N/A">
Item do A01: <fase/prioridade/item exato>
Estado atual da frente: <não iniciada | contrato aberto | em execução | bloqueada | concluída>
O que a última PR fechou: <lista objetiva>
O que a última PR NÃO fechou: <lista objetiva>
Por que esta tarefa existe: <justificativa operacional>
Esta tarefa está dentro ou fora do contrato ativo: <dentro | fora — com justificativa se fora>
Objetivo desta tarefa: <objetivo claro e verificável>
Escopo: <o que está incluído>
Fora de escopo: <o que NÃO está incluído>
Houve desvio de contrato?: <não | sim — se sim, ver CONTRACT_EXECUTION_PROTOCOL seção 6>
Mudanças em dados persistidos (Supabase): <nenhuma | sim — se sim, ver schema/DATA_CHANGE_PROTOCOL.md seção 4.2>
Permissões Cloudflare necessárias: <nenhuma adicional | sim — se sim, ver schema/CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2>
Fontes de verdade consultadas:
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência é condição de parada para execução contratual
  Status da frente lido:       schema/status/<FRENTE>_STATUS.md
  Handoff da frente lido:      schema/handoffs/<FRENTE>_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado — blocos transcritos disponíveis
```

Este bloco é a âncora de rastreabilidade entre PRs. Sem ele, a tarefa não começa.

> **Regra de dados persistidos:** A declaração `Mudanças em dados persistidos (Supabase)` é obrigatória em todo ESTADO HERDADO — inclusive quando a resposta for `nenhuma`. Ver `schema/DATA_CHANGE_PROTOCOL.md` para tipos canônicos, campos obrigatórios e regra de parada.

> **Regra de permissões Cloudflare:** A declaração `Permissões Cloudflare necessárias` é obrigatória em todo ESTADO HERDADO — inclusive quando a resposta for `nenhuma adicional`. Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para escopo, campos obrigatórios e regra de parada.

---

## 5. Bloco obrigatório: ESTADO ENTREGUE

Ao final da execução (Etapa 13), o agente deve declarar explicitamente o estado entregue:

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: <lista objetiva e verificável>
O que foi fechado nesta PR: <lista dos itens que foram concluídos>
O que continua pendente: <lista do que não coube ou não foi feito>
O que ainda não foi fechado do contrato ativo: <itens do contrato ainda em aberto>
Recorte executado do contrato: <qual parte do contrato esta PR executou>
Pendência contratual remanescente: <itens do contrato que permanecem abertos>
Houve desvio de contrato?: <não | sim — se sim, ver CONTRACT_EXECUTION_PROTOCOL seção 6>
Contrato encerrado nesta PR?: <não | sim — se sim, ver CONTRACT_CLOSEOUT_PROTOCOL>
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
- **Sem pular etapas.** O fluxo de 16 etapas é obrigatório. Pular etapas é não conformidade.
- **Sem contexto implícito.** Estado herdado e estado entregue devem ser declarados explicitamente — nunca implícitos.
- **Contrato ativo é imutável por PR de execução.** Nenhuma PR de execução pode alterar silenciosamente o contrato ativo. Qualquer alteração exige revisão contratual formal (ver `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` seção 7).
- **Desvio de contrato é condição de parada.** Toda PR de execução deve declarar explicitamente se houve desvio de contrato. Desvio identificado = parada + revisão formal.
- **Contrato só encerra via protocolo formal.** Nenhum contrato pode ser considerado encerrado sem cumprir integralmente o `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`.

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
- `schema/REQUEST_ECONOMY_PROTOCOL.md` — protocolo obrigatório de economia de request e modelo.
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo obrigatório de execução contratual por PR.
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — protocolo obrigatório de encerramento formal de contrato.
- `schema/contracts/_INDEX.md` — índice canônico de contratos ativos por frente.

Nenhum contrato, status ou handoff deve ser criado fora destes formatos.

---

## 12. Estrutura de contexto vivo

O repositório mantém contexto vivo em:

- `schema/status/` — status vivos por frente (índice em `_INDEX.md`)
- `schema/handoffs/` — handoffs persistidos por frente (índice em `_INDEX.md`)
- `schema/contracts/` — contratos ativos e arquivados (índice em `_INDEX.md`, contratos ativos em `active/`, arquivados em `archive/`)
- `schema/legacy/` — legado mestre unificado (índice em `INDEX_LEGADO_MESTRE.md`, conteúdo em `LEGADO_MESTRE_ENOVA1_ENOVA2.md`)
- `schema/source/` — PDF mestre original (`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`)

**Ponte documental operacional:** ver `schema/CONTRACT_SOURCE_MAP.md` para o mapa explícito de relação entre esses artefatos, a precedência entre eles, quando consultar o PDF mestre e como declarar as fontes lidas.

---

## 13. Regra de parada

Se qualquer das condições abaixo for identificada, parar e reportar em vez de improvisar:

- Ambiguidade estrutural não resolvida pelo A00, A01 ou A02
- Conflito documental entre camadas da precedência
- **Ausência de contrato ativo explícito para a frente** — ausência de contrato NÃO autoriza improvisação contratual; é condição de parada para execução contratual (ver `schema/CONTRACT_SOURCE_MAP.md` seção 4)
- Escopo que ultrapassa o contrato ativo sem autorização
- Estado herdado não declarado ou inconsistente com o repositório
- Classificação de tarefa ausente ou incompatível com o escopo
- **Desvio de contrato identificado** — PR tentando abrir nova frente, novo escopo, entrega fora do objetivo do contrato ou mudança de objetivo sem revisão formal (ver `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` seção 6)
- **Contrato ativo sendo alterado silenciosamente por PR de execução** — qualquer alteração de contrato sem classificação como revisão contratual/governança
- **Tentativa de encerramento implícito de contrato** — sem checklist formal de closeout (ver `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`)
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

---

## 16. Protocolo de economia de request

Toda tarefa, PR e automação deve seguir o protocolo de economia de request definido em `schema/REQUEST_ECONOMY_PROTOCOL.md`.

Princípios obrigatórios:
- **Escopo fechado antes de abrir qualquer tarefa.** Nenhuma investigação livre sem objetivo declarado.
- **Resolver o máximo dentro do escopo comprovado.** Evitar múltiplas PRs para o que cabe em uma.
- **Preferência por modelo barato.** Usar Sonnet ou equivalente para tarefas de baixa/média complexidade. Escalar apenas com justificativa documentada.
- **Preferir automação determinística sobre LLM.** Onde regex ou script simples resolve, não usar modelo.
- **Evitar automação cara e prematura.** Toda nova automação declara seu custo esperado e justifica sua existência.
- **Prompts fechados e objetivos.** Quanto mais fechado o prompt, menor o consumo de request e menor o risco de drift.

**Regra de modelo:**

| Complexidade              | Modelo preferido       | Quando escalar                      |
|---------------------------|------------------------|-------------------------------------|
| Baixa (docs, governança)  | Sonnet ou equivalente  | Não escalar                         |
| Média (scripts, refactor) | Sonnet ou equivalente  | Só com justificativa documentada    |
| Alta (arquitetura, lógica)| Modelo mais caro       | Somente com justificativa explícita |

**Gate automatizado:**
- `.github/workflows/pr-governance-check.yml` — valida 2 campos mínimos no body + gate de arquivos vivos no diff
- `.github/workflows/pr-governance-autofix.yml` — auto-fix controlado (max 3 tentativas, apenas erros triviais, sem LLM)
- `scripts/validate_pr_governance.js` — script determinístico de validação (sem LLM, custo zero)
- `scripts/autofix_pr_governance.js` — script determinístico de auto-fix (sem LLM, sem dependências externas)
- Filosofia: governança real = arquivos vivos do repo; body = apoio humano/checklist

Ver `schema/REQUEST_ECONOMY_PROTOCOL.md` para o protocolo completo.

---

## 17. Auto-fix controlado do PR Governance Gate

O repositório inclui uma camada de auto-fix **restrita e determinística** para erros triviais do gate.

### Regras absolutas do auto-fix

- **Apenas erros triviais e mecânicos** são corrigíveis automaticamente.
- **Máximo 3 tentativas** por PR (rastreado por marcador oculto no body da PR).
- **Sem LLM. Sem API externa. Sem dependência externa. Sem loop aberto.**
- **Para obrigatoriamente** ao atingir 3 tentativas ou ao encontrar erro não trivial.
- Os valores inseridos automaticamente são **placeholders** — o autor deve preencher os reais.

### O que o auto-fix pode corrigir

| Erro trivial                                   | Ação do auto-fix                        |
|------------------------------------------------|-----------------------------------------|
| Campo "Contrato ativo" ausente do body         | Adiciona seção com placeholder          |
| Campo "Próximo passo autorizado" ausente       | Adiciona seção com placeholder          |
| Campo presente mas vazio / só comentário HTML  | Substitui por placeholder               |

### O que o auto-fix NÃO pode corrigir (para imediatamente)

- Body completamente vazio
- Incoerência contratual
- Divergência entre contrato e status/handoff
- Live files declarados sem diff real
- Conflito entre arquivos vivos
- Mudança de escopo
- Qualquer erro que exija interpretação semântica

### Fluxo de funcionamento

1. PR falha o governance check.
2. O workflow de auto-fix dispara (`workflow_run` no gate com `failure`).
3. O script lê o body, detecta falhas triviais, aplica placeholders.
4. O body da PR é atualizado via API → evento `edited` dispara → gate roda novamente.
5. Repete até: gate passa | 3 tentativas | erro estrutural.
6. Após 3 tentativas ou erro estrutural: para, registra motivo, exige revisão manual.

---

## 18. Regra de menção obrigatória ao agente/modelo

Toda instrução operacional — comentário em PR, issue, tarefa ou prompt — deve mencionar explicitamente o agente e o modelo no início.

**Padrão obrigatório:**
```
@copilot+claude-sonnet-4.6
<instrução operacional aqui>
```

**Regras:**
- Comentário ou instrução **sem `@copilot+modelo`** = **não executável / não operacional**.
- Não deve disparar execução nem ser tratado como comando confiável.
- Se a tarefa exigir modelo mais caro: declarar explicitamente com justificativa.
- A menção é a âncora de rastreabilidade de autoria e custo operacional.

**Modelos e quando usar:**

| Complexidade               | Menção obrigatória                            | Quando usar                          |
|----------------------------|-----------------------------------------------|--------------------------------------|
| Baixa/média (docs, gov)    | `@copilot+claude-sonnet-4.6`                  | Padrão — preferencial                |
| Alta (arquitetura, lógica) | `@copilot+<modelo-mais-caro> (justificativa)` | Somente com justificativa explícita  |

**Exemplos válidos:**
```
@copilot+claude-sonnet-4.6
Executar próximo passo autorizado pelo A01 conforme contrato ativo.
```

**Exemplos inválidos (não operacionais, ignorar como comando):**
```
Executar o próximo passo.
Copilot, fazer X.
@copilot fazer Y.
```

Ver `.github/AGENT_CONTRACT.md` regra 26 para detalhes.

---

## 19. Protocolo de descoberta contratual e rastreabilidade de fontes

> **Este protocolo define como o agente localiza os artefatos contratuais e como deve declarar as fontes consultadas.**
> Toda execução deve percorrer este protocolo antes da Etapa 8 (ESTADO HERDADO).
> Ver `schema/CONTRACT_SOURCE_MAP.md` para o mapa completo de fontes e a ponte documental operacional.

### 19.1 Caminho de descoberta contratual (obrigatório)

Percorrer em ordem:

```
1. schema/contracts/_INDEX.md          ← índice canônico de contratos ativos por frente
2. schema/contracts/active/<NOME>.md   ← contrato ativo da frente (se existir)
3. schema/status/<FRENTE>_STATUS.md    ← status vivo da frente
4. schema/handoffs/<FRENTE>_LATEST.md  ← handoff mais recente da frente
5. schema/legacy/INDEX_LEGADO_MESTRE.md ← índice de blocos legados aplicáveis
6. schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md ← blocos transcritos (se disponíveis)
7. schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf ← PDF mestre (quando bloco não transcrito)
```

### 19.2 Regra de ausência de contrato ativo

> **Ausência de contrato ativo NÃO é licença para improvisar. É condição de parada para execução contratual.**

Se `schema/contracts/_INDEX.md` indicar "*(nenhum — aguardando abertura)*":
- Parar a execução contratual.
- Declarar no ESTADO HERDADO: `Contrato ativo lido: Nenhum — ausência é condição de parada para execução contratual`.
- Não presumir escopo, objetivo ou critérios.
- Prosseguir apenas com tarefas de `governança`, `diagnostico` ou `correcao_incidental` que não abram execução contratual de negócio.

### 19.3 Quando consultar o PDF mestre

O agente **DEVE** consultar `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` quando:
- O bloco legado necessário tiver status `Identificado estruturalmente — não transcrito`.
- Houver divergência entre o markdown e as regras de negócio esperadas (o PDF é árbitro final).
- A tarefa requer definição de blocos legados para um novo contrato.

O agente **NÃO PRECISA** consultar o PDF quando:
- O bloco está com status `Transcrito` ou `Revisado e validado` no markdown.
- A tarefa é de governança pura sem consumo de regras de negócio do legado.

### 19.4 Declaração obrigatória de fontes consultadas

Em todo ESTADO HERDADO e ESTADO ENTREGUE, adicionar o bloco:

```
Fontes de verdade consultadas:
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência declarada
  Status da frente lido:       schema/status/<FRENTE>_STATUS.md
  Handoff da frente lido:      schema/handoffs/<FRENTE>_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado — blocos transcritos disponíveis
```

**Regras:**
- `Contrato ativo lido` é obrigatório — mesmo quando "Nenhum".
- `PDF mestre consultado` é obrigatório quando qualquer bloco legado necessário não estiver transcrito.
- Caminhos explícitos à raiz do repositório.
- Nunca declarar "lido" um arquivo que não foi consultado.

**Tarefa sem este bloco de declaração de fontes = tarefa não conforme.**

---

## 20. Regra de sincronização: body da PR = reflexo mínimo dos arquivos vivos

> **O body da PR não é fonte primária de verdade — os arquivos vivos são.**
> Mas o body não pode divergir dos arquivos vivos nos 2 campos mínimos exigidos pelo gate.

### 20.1 Princípio

| Aspecto                  | Regra                                                                                      |
|--------------------------|--------------------------------------------------------------------------------------------|
| Fonte primária de verdade | Arquivos vivos: `schema/contracts/`, `schema/handoffs/`, `schema/status/`                 |
| Body da PR               | Reflexo mínimo — transcreve os campos `Contrato ativo` e `Próximo passo autorizado` dos vivos |
| Gate bloqueante          | Body vazio ou com placeholder genérico nesses 2 campos = **falha de governança**           |
| Auto-fix                 | Extrai valores reais dos vivos automaticamente quando os campos estão ausentes ou vazios   |

### 20.2 Campos obrigatórios no body (gate bloqueante)

Os seguintes campos **devem estar presentes e preenchidos com valores reais** em toda PR:

| Campo                    | Fonte de verdade para transcrição                                     |
|--------------------------|-----------------------------------------------------------------------|
| `## Contrato ativo`      | `schema/contracts/_INDEX.md` → coluna "Contrato ativo" da frente     |
| `## Próximo passo autorizado` | `schema/handoffs/<FRENTE>_LATEST.md` → campo "Próximo passo autorizado" |

**Valores aceitos:**
- Caminho real do contrato: `schema/contracts/active/<NOME>.md`
- Ausência declarada: `Nenhum contrato ativo` (quando não há contrato ativo na frente)
- Texto real extraído do handoff ou status da frente

**Valores rejeitados (placeholder puro):**
- `Nenhum contrato ativo — verificar schema/...` (instrução não resolvida)
- `Verificar schema/...` como valor primário
- `TODO`, `preencher manualmente`, `pendência de preenchimento`

### 20.3 Responsabilidade de sincronização

1. **Responsabilidade primária do agente:** ao abrir a PR, transcrever os valores reais dos arquivos vivos nos 2 campos do body. Os arquivos vivos **já devem estar atualizados** antes da abertura da PR (Etapa 14 do fluxo de execução).
2. **Auto-fix como rede de segurança:** se os campos estiverem ausentes ou vazios, o auto-fix extrai valores dos arquivos vivos e preenche automaticamente. Mas o auto-fix é fallback — não substitui a responsabilidade do agente.
3. **Body vazio ou placeholder genérico = falha de governança**, não falha do validator. O validator detecta o sintoma; a causa é a falta de sincronização com os vivos.

### 20.4 Fluxo de sincronização obrigatório

```
Etapa 14 (Atualização viva) → arquivos vivos atualizados
                           ↓
Abertura da PR             → body transcreve Contrato ativo + Próximo passo dos vivos
                           ↓
PR Governance Gate         → valida os 2 campos no body
                           ↓
Se ausentes/vazios         → auto-fix extrai dos vivos e preenche automaticamente
                           ↓
Gate aprovado              → body sincronizado com os vivos
```

**Regra de parada:** se o auto-fix não conseguir extrair valor determinístico dos arquivos vivos (arquivos inexistentes, formato não reconhecido), o gate falha e exige intervenção manual. Isso indica que os arquivos vivos não estão atualizados — a causa deve ser resolvida nos vivos, não no body.

