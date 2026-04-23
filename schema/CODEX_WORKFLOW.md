# CODEX_WORKFLOW — Protocolo Obrigatório de Execução da ENOVA 2

> **Este documento é a lei operacional única entre PRs.**
> Nenhuma tarefa começa ou termina sem cumprir integralmente este protocolo.
> Qualquer PR futura deve poder ser retomada exclusivamente pelo repositório, sem depender de conversa ou memória de sessão.

---

## 1. Lista de documentos de leitura obrigatória

> **Esta seção define os documentos a ler — não as etapas de execução.**
> A lista de leitura (abaixo) e o fluxo de execução (seção 3 — 16 etapas) são duas coisas distintas.
> `16 etapas` ≠ `31 documentos de leitura`. Não confundir.

Toda execução começa com leitura nesta sequência — **obrigatória, sem exceção**:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — **tronco macro soberano da implantação**
2. `schema/A00_PLANO_CANONICO_MACRO.md`
3. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
4. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
5. `schema/contracts/_INDEX.md` — **índice canônico de contratos ativos**
6. Contrato ativo da frente/fase (em `schema/contracts/active/`) — seguindo formato de `schema/CONTRACT_SCHEMA.md` — **se ausente: condição de parada para execução contratual (ver seção 19)**
7. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — **protocolo de execução contratual**
8. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — **protocolo de encerramento de contrato**
9. Status vivo da frente/fase ativa (`schema/status/<FRENTE_OU_FASE>_STATUS.md`)
10. Último handoff da frente/fase ativa (`schema/handoffs/<FRENTE_OU_FASE>_LATEST.md`)
11. `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md` — **estado canonico macro apos rebase**
12. `schema/implantation/PLANO_EXECUTIVO_T0_T7.md` — **ordem executiva derivada do mestre**
13. `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice operacional auxiliar do legado mestre unificado
14. `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — cópia/derivação auxiliar por blocos, quando aplicável
15. `schema/CONTRACT_SOURCE_MAP.md` — **mapa de fontes e ponte documental operacional**
16. `schema/TASK_CLASSIFICATION.md`
17. `schema/DATA_CHANGE_PROTOCOL.md`
18. `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
19. `schema/CONTRACT_SCHEMA.md`
20. `schema/STATUS_SCHEMA.md`
21. `schema/HANDOFF_SCHEMA.md`
22. `docs/BOOTSTRAP_CLOUDFLARE.md`
23. `wrangler.toml`
24. `.github/workflows/pr-governance-check.yml`
25. `.github/PULL_REQUEST_TEMPLATE.md`
26. `.github/AGENT_CONTRACT.md`
27. `scripts/validate_pr_governance.js`
28. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — **bíblia canônica de PRs da implantação macro**
29. `schema/execution/PR_EXECUTION_TEMPLATE.md` — **template canônico obrigatório de abertura de PR**
30. `schema/handoffs/PR_HANDOFF_TEMPLATE.md` — **template canônico obrigatório de fechamento/handoff de PR**
31. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` — **LEITURA OBRIGATÓRIA em toda tarefa que toque conversa, atendimento, LLM, speech, surface, fallback, multimodalidade ou fluxo cognitivo. Regra-mãe canônica: IA soberana na fala, mecânico jamais com prioridade de fala.**
32. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` — **LEITURA OBRIGATÓRIA em toda tarefa que toque contrato cognitivo, policy engine, orquestrador, migração de funil, multimodal/áudio, ou qualquer trecho que possa ser lido como "mecânico manda na fala". Adendo canônico A00-ADENDO-02: identidade da Enova 2 como atendente especialista MCMV + guia de leitura das fases T1/T3/T4/T5/T6 com travas contra má interpretação.**
33. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` — **LEITURA OBRIGATÓRIA em toda tarefa/PR que tente fechar etapa, gate, contrato ou avançar próxima PR autorizada. Adendo canônico A00-ADENDO-03: "Evidência manda no estado." Prova parcial/inconclusiva/lacunosa bloqueia fechamento. Inclui Bloco E obrigatório.**


Nenhuma tarefa começa sem confirmar esta leitura.

> **ATENÇÃO — ADENDO CANÔNICO ATIVO (A00-ADENDO-01):** `schema/ADENDO_CANONICO_SOBERANIA_IA.md` é leitura obrigatória antes de qualquer tarefa que toque conversa, LLM, speech, surface, fallback ou fluxo cognitivo. Nenhuma tarefa nessas áreas pode ser iniciada sem confirmar a leitura deste adendo. Ver seção 2 abaixo para posição na cadeia de precedência.

> **ATENÇÃO — ADENDO CANÔNICO ATIVO (A00-ADENDO-02):** `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` é leitura obrigatória antes de qualquer tarefa que toque T1 (contrato cognitivo), T3 (policy engine), T4 (orquestrador), T5 (migração do funil) ou T6 (multimodal/áudio). Proibido executar essas fases sem confirmar leitura deste adendo. Guia de leitura com travas explícitas por fase.

> **ATENÇÃO — ADENDO CANÔNICO ATIVO (A00-ADENDO-03):** `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` é leitura obrigatória antes de qualquer PR que tente encerrar etapa, fechar gate, encerrar contrato ou avançar próxima PR autorizada. Regra central: **"Evidência manda no estado."** Prova parcial, inconclusiva ou com lacuna remanescente bloqueia o fechamento — independentemente de intenção ou pressão. Inclui Bloco E obrigatório em todo fechamento.

---

## 2. Precedência documental oficial

**`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` > A00 > A01 > A00-ADENDO-01 (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`) > A00-ADENDO-02 (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`) > A00-ADENDO-03 (`schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`) > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia. O legado manda nas regras de negócio; o pacote canônico manda na arquitetura, na ordem executiva e na forma de implantação.

> **Adendo canônico ativo (A00-ADENDO-01):** `schema/ADENDO_CANONICO_SOBERANIA_IA.md` fixa como regra permanente que a IA é soberana em raciocínio e fala, e que é proibido dar qualquer prioridade de fala ao mecânico. Este adendo é transversal a todas as frentes e vigora imediatamente. Nenhum contrato de frente pode ser aberto ou executado de forma que contradiga este adendo.

> **Adendo canônico ativo (A00-ADENDO-02):** `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` fixa a identidade da Enova 2 como atendente especialista MCMV (não bot de regras), o papel correto do conhecimento normativo/memória/telemetria como suporte ao LLM (nunca como casca dominante), e inclui guia de leitura com travas explícitas para T1 (contrato cognitivo), T3 (policy engine), T4 (orquestrador), T5 (migração do funil) e T6 (multimodal/áudio). Leitura obrigatória em qualquer PR dessas fases. Nenhum contrato pode ser aberto ou executado contradizendo este adendo.

> **Adendo canônico ativo (A00-ADENDO-03):** `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` institui a regra canônica de que a evidência-base prevalece sobre qualquer intenção de fechamento. Presença de lacuna remanescente, item parcial, inconclusivo ou prova insuficiente no documento-base bloqueia: declaração de PR encerrada, avanço de próxima PR autorizada, fechamento de gate, e atualização de contrato/status/handoff como se a etapa estivesse concluída. Obrigatório em toda PR que tente fechar etapa ou avançar estado.

---

## 3. Fluxo obrigatório de execução — 16 etapas

> **Esta seção define o fluxo de execução — não a lista de documentos a ler.**
> As 16 etapas abaixo são ações sequenciais do agente. A Etapa 1 ("Leitura canônica") executa a lista de documentos da seção 1 (31 itens), mas as 16 etapas e os 31 itens de leitura são categorias distintas.
> `16 etapas de execução` ≠ `31 documentos de leitura`.

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
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência é condição de parada para execução contratual
  Status da frente lido:       schema/status/<FRENTE>_STATUS.md
  Handoff da frente lido:      schema/handoffs/<FRENTE>_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado — markdown soberano suficiente
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

### 8.1 Leitura prévia obrigatória de toda PR da implantação macro

Nenhuma PR da implantação macro pode abrir sem confirmar leitura prévia, no mínimo, de:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. Contrato ativo da fase em `schema/contracts/active/`
4. Último handoff vivo da fase em `schema/handoffs/<FASE>_LATEST.md`
5. `schema/CODEX_WORKFLOW.md`

Sem essa leitura, a PR é **não conforme**.

### 8.2 Abertura obrigatória de PR (template canônico)

Toda PR da implantação macro deve abrir com o bloco obrigatório de
`schema/execution/PR_EXECUTION_TEMPLATE.md`, incluindo:

- ID lógico da Bíblia
- Fase ativa
- Épico/microetapa do mestre
- PR anterior seguida
- Handoff seguido
- Gate de entrada
- Gate de saída esperado
- O que fecha
- O que não fecha
- Declaração de exceção contratual

Sem esse bloco preenchido com valores reais, a PR é **não conforme**.

### 8.3 Fechamento obrigatório de PR (handoff canônico)

Nenhuma PR é considerada concluída sem handoff no repo conforme
`schema/handoffs/PR_HANDOFF_TEMPLATE.md`, contendo:

- Próxima PR autorizada
- Gate atingido ou não
- O que foi feito
- O que não foi feito
- Riscos herdados
- Plano de rollback

Sem handoff atualizado, a próxima PR **não pode abrir**.

### 8.4 Trava formal de exceção contratual

Regra padrão: seguir o contrato literalmente.

Nenhuma quebra, flexibilização ou desvio pode ser feita por interpretação do executor.
Somente o **Vasques** pode autorizar manualmente exceção contratual, de forma:

- Explícita
- Específica
- Temporária
- Registrada
- Com retorno obrigatório à normalidade contratual

Se o executor perceber "necessidade de quebra", deve parar e aguardar autorização manual do Vasques.

Limites duros não exceptuáveis (mesmo com exceção):

- Fala mecânica dominante
- Surface engessada
- Fallback dominante
- Quebra da soberania da IA (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`)
- Quebra de regras MCMV
- Pulo de gates G0-G7
- Mudanças silenciosas de Supabase
- Encerramento implícito de contrato

### 8.5 Trava de não pular gates T0-T7 / G0-G7

- T1 só abre após G0
- T2 só abre após G1
- T3 só abre após G2
- T4 só abre após G3
- T5 só abre após G4
- T6 só abre após G5
- T7 só abre após G6
- Conclusão macro só após G7

### 8.6 Trava de não misturar escopos

- Uma PR = uma fase / um recorte
- Não misturar governança com implementação pesada
- Não misturar canal novo com cutover
- Não misturar P2/P3 antes de P0/P1 estabilizado
- Não abrir frente fora da sequência da Bíblia

### 8.7 Checagem final obrigatória de coerência

Antes de encerrar a PR, o executor deve verificar se a "Próxima PR autorizada" bate ao mesmo tempo com:

1. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
2. Contrato ativo
3. Handoff vivo

Se não bater, parar e corrigir os arquivos vivos antes de encerrar a PR.

### 8.8 Checagem final obrigatória de evidência — Bloco E (A00-ADENDO-03)

Antes de declarar qualquer PR encerrada, fechar gate, encerrar contrato ou avançar próxima PR autorizada, o executor deve verificar:

1. O documento-base da evidência está identificado e apontado explicitamente.
2. O estado da evidência é `completa` — não `parcial`, `incompleta` ou `ausente`.
3. Não há lacuna remanescente, item parcial, inconclusivo ou prova insuficiente no documento-base.
4. O Bloco E (`--- BLOCO E — FECHAMENTO POR PROVA ---`) está preenchido no ESTADO ENTREGUE e no body da PR.
5. Todos os arquivos vivos (status, handoff, contrato) refletem o mesmo estado do Bloco E.

**Se qualquer item acima não for verdadeiro:**
- `Fechamento permitido nesta PR?: NÃO`
- PR permanece em execução.
- Gate permanece aberto.
- Próxima PR = continuidade da mesma etapa.
- Arquivos vivos não podem indicar encerramento.

Ver `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) para o protocolo completo e o Bloco E.

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
- `schema/contracts/_INDEX.md` — índice canônico de contratos ativos por frente/fase.
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — sequência canônica obrigatória de PRs da implantação macro.
- `schema/execution/PR_EXECUTION_TEMPLATE.md` — template canônico obrigatório de abertura de PR.
- `schema/handoffs/PR_HANDOFF_TEMPLATE.md` — template canônico obrigatório de handoff de fechamento.

Nenhum contrato, status ou handoff deve ser criado fora destes formatos.

---

## 12. Estrutura de contexto vivo

O repositório mantém contexto vivo em:

- `schema/status/` — status vivos por frente/fase (índice em `_INDEX.md`)
- `schema/handoffs/` — handoffs persistidos por frente/fase (índice em `_INDEX.md`)
- `schema/contracts/` — contratos ativos e arquivados (índice em `_INDEX.md`, contratos ativos em `active/`, arquivados em `archive/`)
- `schema/source/` — tronco markdown soberano e PDF mestre original
- `schema/implantation/` — rebase canonico e plano executivo T0-T7
- `schema/execution/` — Bíblia canônica de PRs e template canônico de abertura
- `schema/legacy/` — apoio operacional por blocos (índice em `INDEX_LEGADO_MESTRE.md`, derivação em `LEGADO_MESTRE_ENOVA1_ENOVA2.md`)

**Ponte documental operacional:** ver `schema/CONTRACT_SOURCE_MAP.md` para o mapa explícito de relação entre esses artefatos, a precedência entre eles, quando consultar o PDF mestre e como declarar as fontes lidas.

---

## 13. Regra de parada

Se qualquer das condições abaixo for identificada, parar e reportar em vez de improvisar:

- Ambiguidade estrutural não resolvida pelo mestre em `schema/source/`, A00, A01 ou A02
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
1. schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md ← tronco macro soberano
2. schema/contracts/_INDEX.md          ← índice canônico de contratos ativos
3. schema/contracts/active/<NOME>.md   ← contrato ativo da frente/fase (se existir)
4. schema/status/<FRENTE_OU_FASE>_STATUS.md    ← status vivo da frente/fase
5. schema/handoffs/<FRENTE_OU_FASE>_LATEST.md  ← handoff mais recente da frente/fase
6. schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md ← rebase macro atual
7. schema/implantation/PLANO_EXECUTIVO_T0_T7.md ← ordem executiva T0-T7
8. schema/legacy/INDEX_LEGADO_MESTRE.md ← índice auxiliar de blocos legados aplicáveis
9. schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md ← derivação auxiliar por blocos, quando aplicável
10. schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf ← PDF mestre bruto, quando necessário
11. schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md ← sequência oficial de PRs e travas de exceção
12. schema/execution/PR_EXECUTION_TEMPLATE.md ← bloco obrigatório de abertura de PR
13. schema/handoffs/PR_HANDOFF_TEMPLATE.md ← bloco obrigatório de fechamento/handoff de PR
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
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência declarada
  Status da frente/fase lido:  schema/status/<FRENTE_OU_FASE>_STATUS.md
  Handoff da frente/fase lido: schema/handoffs/<FRENTE_OU_FASE>_LATEST.md
  Rebase canonico lido:        schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md | N/A
  Plano T0-T7 lido:            schema/implantation/PLANO_EXECUTIVO_T0_T7.md | N/A
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado — markdown soberano suficiente
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

**Regra adicional para implantação macro:**
- Além destes 2 campos bloqueantes do gate automatizado, o body da PR deve conter o bloco completo de
  `schema/execution/PR_EXECUTION_TEMPLATE.md` com valores reais.

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

---

## 21. Regra canônica de fechamento por prova (A00-ADENDO-03)

> **Esta seção é a transcrição operacional do adendo `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) no CODEX_WORKFLOW.**
> Nenhuma PR pode encerrar etapa, fechar gate, encerrar contrato ou avançar próxima PR autorizada sem cumprir esta regra.

### 21.1 Regra central

**"Evidência manda no estado."**

A evidência-base de uma entrega prevalece sobre qualquer intenção, declaração ou pressão de fechamento.

Se o documento-base da evidência ainda contiver qualquer marcador de insuficiência de prova (parcial, inconclusivo, lacuna remanescente, pendente de prova, não fechado, smoke não executado, etc.), então é **proibido**:

- Declarar PR/etapa encerrada.
- Avançar próxima PR autorizada.
- Fechar gate.
- Atualizar contrato/status/handoff como se a etapa estivesse concluída.

### 21.2 Bloco E obrigatório

Toda PR que tente fechar etapa, gate, contrato ou avançar próxima PR deve incluir no ESTADO ENTREGUE:

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           <caminho do arquivo com a prova>
Estado da evidência:                   completa | parcial | incompleta | ausente
Há lacuna remanescente?:               não | sim — <descrição>
Há item parcial/inconclusivo bloqueante?: não | sim — <descrição>
Fechamento permitido nesta PR?:        sim | NÃO — BLOQUEADO por insuficiência de evidência
Estado permitido após esta PR:         encerrada | em execução (continua aberta)
Próxima PR autorizada:                 <ID lógico> | continuação desta etapa
```

**Se `Estado da evidência` for `parcial`, `incompleta` ou `ausente` → `Fechamento permitido nesta PR?: NÃO`**
**Se `Há lacuna remanescente?` for `sim` → `Fechamento permitido nesta PR?: NÃO`**
**Se `Fechamento permitido nesta PR?: NÃO` → PR permanece aberta, gate permanece aberto, próxima PR = continuidade.**

**PR que tenta fechar etapa sem o Bloco E preenchido = PR não conforme.**

### 21.3 Melhora parcial não autoriza fechamento

Melhora incremental ou parcial de evidência **não** autoriza avanço de estado. Apenas evidência completa, sem lacuna remanescente, autoriza fechamento.

### 21.4 Integração com os protocolos existentes

- `CONTRACT_CLOSEOUT_PROTOCOL.md` — checklist de encerramento deve incluir o Bloco E.
- `CONTRACT_EXECUTION_PROTOCOL.md` — todo claim de fechamento deve citar documento-base e estado da evidência.
- `PR_EXECUTION_TEMPLATE.md` — Bloco E obrigatório em toda PR que tente fechar etapa.
- `PR_HANDOFF_TEMPLATE.md` — handoff deve declarar: continuidade de etapa | fechamento válido | bloqueado por prova insuficiente.

Ver `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` para o protocolo completo.

