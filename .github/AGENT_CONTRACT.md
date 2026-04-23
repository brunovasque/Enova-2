# AGENT CONTRACT — ENOVA 2

## Mandato
Atuar com escopo fechado, execução controlada e aderência total à precedência documental canônica.
Seguir o ritual definido em `schema/CODEX_WORKFLOW.md` em toda tarefa — **sem pular nenhuma etapa**.

## Precedência obrigatória
**schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md > A00 > A01 > A00-ADENDO-01 (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`) > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis**

## Ritual obrigatório — 16 etapas (ver CODEX_WORKFLOW.md seção 3)
Toda tarefa percorre as 16 etapas do CODEX_WORKFLOW em ordem.
Nenhuma etapa pode ser pulada. Pular etapa é não conformidade.

## Leitura obrigatória antes de qualquer tarefa
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — **tronco macro soberano**
2. `schema/A00_PLANO_CANONICO_MACRO.md`
3. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
4. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
5. `schema/contracts/_INDEX.md` — **índice canônico de contratos ativos**
6. Contrato ativo da frente/fase (em `schema/contracts/active/`, formato em `schema/CONTRACT_SCHEMA.md`) — **se ausente: condição de parada contratual (ver regra 11)**
7. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — **protocolo de execução contratual**
8. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — **protocolo de encerramento de contrato**
9. Status vivo da frente/fase (`schema/status/<FRENTE_OU_FASE>_STATUS.md`)
10. Último handoff da frente/fase (`schema/handoffs/<FRENTE_OU_FASE>_LATEST.md`)
11. `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md`
12. `schema/implantation/PLANO_EXECUTIVO_T0_T7.md`
13. Índice do legado mestre (`schema/legacy/INDEX_LEGADO_MESTRE.md`)
14. Blocos aplicáveis do legado mestre auxiliar (`schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`) — quando aplicável
15. `schema/CONTRACT_SOURCE_MAP.md` — **mapa de fontes e ponte documental operacional**
16. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` — **LEITURA OBRIGATÓRIA em toda tarefa que toque conversa, atendimento, LLM, speech, surface, fallback, multimodalidade ou fluxo cognitivo. Regra-mãe: IA soberana na fala — mecânico JAMAIS com prioridade de fala.**

## Declaração obrigatória de estado herdado (Etapa 8 do CODEX_WORKFLOW)
Antes de executar qualquer tarefa, o agente deve declarar o bloco `ESTADO HERDADO`:

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: <contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico>
Última PR relevante: <número e título>
Contrato ativo: <nome ou "Nenhum contrato ativo">
Objetivo imutável do contrato: <objetivo literal ou "N/A">
Recorte a executar nesta PR: <qual parte do contrato ou "N/A">
Item do A01: <fase/prioridade/item exato>
Estado atual da frente: <estado canônico>
O que a última PR fechou: <lista>
O que a última PR NÃO fechou: <lista>
Por que esta tarefa existe: <justificativa>
Esta tarefa está dentro ou fora do contrato ativo: <dentro | fora — justificativa se fora>
Objetivo desta tarefa: <objetivo>
Escopo: <incluído>
Fora de escopo: <não incluído>
Houve desvio de contrato?: <não | sim — se sim, ver CONTRACT_EXECUTION_PROTOCOL seção 6>
Mudanças em dados persistidos (Supabase): <nenhuma | sim — se sim, ver schema/DATA_CHANGE_PROTOCOL.md seção 4.2>
Permissões Cloudflare necessárias: <nenhuma adicional | sim — se sim, ver schema/CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2>
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência é condição de parada para execução contratual
  Status da frente/fase lido:  schema/status/<FRENTE_OU_FASE>_STATUS.md
  Handoff da frente/fase lido: schema/handoffs/<FRENTE_OU_FASE>_LATEST.md
  Rebase canonico lido:        schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md | N/A
  Plano T0-T7 lido:            schema/implantation/PLANO_EXECUTIVO_T0_T7.md | N/A
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado
```

Tarefa sem esta declaração não deve ser iniciada.

## Classificação obrigatória de tarefa
Toda tarefa deve ser classificada em uma das classes canônicas antes da execução.
Classes canônicas (definidas em `schema/TASK_CLASSIFICATION.md`):
- `contratual` — dentro do contrato ativo
- `governança` — cria/atualiza regras e documentação operacional
- `fora_de_contrato` — necessária mas fora do contrato ativo
- `correcao_incidental` — correção cirúrgica acoplada à tarefa em andamento
- `hotfix` — correção urgente e crítica
- `diagnostico` — somente leitura e análise, nenhuma entrega técnica

Tarefa não classificada = tarefa não conforme.

## Regras mandatórias
1. Executar apenas o escopo explicitamente contratado.
2. Aplicar patch cirúrgico e mínimo necessário.
3. Não realizar refatoração fora do combinado.
4. Não introduzir drift de objetivo, escopo ou arquitetura.
5. Não abrir implementação funcional sem autorização do contrato ativo.
6. Declarar sempre qual contrato está ativo e qual item do A01 está sendo atendido.
7. Não pular etapas do fluxo de 16 etapas do CODEX_WORKFLOW.
8. Declarar explicitamente o contexto herdado da PR anterior antes de executar.
9. Declarar explicitamente o que foi herdado, o que foi resolvido e o que permanece aberto.
10. Marcar explicitamente como `fora_de_contrato` quando a tarefa não pertencer ao contrato ativo.
11. Se houver ambiguidade estrutural, conflito documental ou falta de contrato ativo: parar e reportar.
12. Ao final de cada tarefa, emitir resposta no formato definido pelo CODEX_WORKFLOW (seção 7).
13. **Declarar obrigatoriamente** em todo ESTADO HERDADO e ESTADO ENTREGUE se houve ou não mudança em dados persistidos do Supabase — inclusive quando a resposta for `nenhuma`.
14. **Nenhuma mudança** em tabela, coluna, índice, constraint ou relacionamento do Supabase pode ser executada sem declaração prévia completa e rastreabilidade total conforme `schema/DATA_CHANGE_PROTOCOL.md`.
15. **Parar imediatamente** se uma tarefa mexer em dados persistidos do Supabase sem declarar tabela, tipo de mudança, colunas afetadas, motivo, impacto e rollback.
16. **Declarar obrigatoriamente** em todo ESTADO HERDADO e ESTADO ENTREGUE se há ou não necessidade nova de permissão Cloudflare — inclusive quando a resposta for `nenhuma adicional`.
17. **Nenhuma tarefa** que passe a depender de novo recurso Cloudflare pode seguir com a necessidade de permissão implícita — declarar recurso, ação, permissões suficientes e impacto antes de prosseguir.
18. **Avisar preventivamente** ao usuário quando a PR passar a exigir novas permissões Cloudflare — nunca deixar esse risco implícito ou silencioso.
19. **Parar imediatamente** se uma tarefa introduzir dependência de recurso Cloudflare sem declaração completa dos campos obrigatórios conforme `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.
20. **Ausência de contrato ativo NÃO autoriza improvisação contratual.** Ausência de contrato ativo é condição de parada para execução contratual. Prosseguir apenas com tarefas de `governança`, `diagnostico` ou `correcao_incidental` que não abram execução de negócio.
21. **Declarar obrigatoriamente** em todo ESTADO HERDADO e ESTADO ENTREGUE o bloco "Fontes de verdade consultadas" — com os caminhos exatos de todos os artefatos lidos como fonte de verdade. Ver `schema/CONTRACT_SOURCE_MAP.md` e `schema/CODEX_WORKFLOW.md` seção 19.
22. **Nunca declarar "lido" um arquivo que não foi efetivamente consultado.** A declaração de fontes é rastreabilidade real, não formalidade.
23. **Quando bloco legado necessário não estiver transcrito no markdown:** referenciar diretamente o PDF mestre em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` e declarar explicitamente qual seção foi consultada.
24. **O body da PR deve ser reflexo mínimo dos arquivos vivos.** Os campos `Contrato ativo` e `Próximo passo autorizado` devem ser transcritos dos arquivos vivos (`schema/contracts/_INDEX.md`, `schema/handoffs/<FRENTE>_LATEST.md`, `schema/status/<FRENTE>_STATUS.md`) — não inventados ou deixados com placeholder genérico. Placeholder genérico não é sincronização. Nenhuma PR é considerada entregue enquanto esses campos não estiverem sincronizados com os arquivos vivos ou tiverem justificativa real ("Nenhum contrato ativo").
25. **[ADENDO CANÔNICO A00-ADENDO-01] A IA é soberana em raciocínio e fala.** O LLM redige e emite a surface final do turno. Nenhuma outra camada pode sobrescrever, substituir ou deslocar a resposta do LLM como fala final ao cliente. Ver `schema/ADENDO_CANONICO_SOBERANIA_IA.md`.
26. **[ADENDO CANÔNICO A00-ADENDO-01] O mecânico JAMAIS pode ter prioridade de fala.** O mecânico valida, registra, bloqueia e preserva estado — não redige resposta ao cliente. Esta é uma regra proibida formal: JAMAIS MECÂNICO COM QUALQUER PRIORIDADE DE FALA.
27. **[ADENDO CANÔNICO A00-ADENDO-01] Qualquer implementação que reintroduza fala mecânica, fallback rígido dominante ou surface engessada deve ser tratada como não conforme.** Parar imediatamente, reportar e exigir revisão antes de seguir. Ver `schema/ADENDO_CANONICO_SOBERANIA_IA.md` seção 4 para a lista completa de proibições formais.

## Atualização viva obrigatória ao final de qualquer tarefa
Independente de ser tarefa contratual ou fora de contrato:
1. Atualizar o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`) — incluindo classe da última tarefa e pendência remanescente herdada.
2. Atualizar o handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`) — incluindo o que a PR anterior fechou/não fechou, o que esta PR fechou/não fechou, e se foi fora de contrato.
3. Confirmar o item do A01 atendido.
4. Declarar o próximo passo autorizado (preservado ou alterado).
5. Se a tarefa foi `fora_de_contrato`: registrar justificativa e impacto no próximo passo autorizado.
6. **Ao abrir a PR, verificar que o body já declara `Contrato ativo` e `Próximo passo autorizado` com valores reais transcritos dos arquivos vivos** — não placeholders genéricos. O auto-fix extrai esses valores automaticamente quando os campos estão ausentes ou vazios, mas o agente deve garantir que os arquivos vivos já estejam atualizados antes de abrir a PR.

## Regra de continuidade entre PRs
Toda PR deve descrever:
- De qual PR ela continua (número e título).
- O que herdou (pendências e contexto em aberto da PR anterior).
- O que resolveu do herdado.
- O que permanece aberto.

Esta regra garante que o repositório seja a única fonte de verdade — não a conversa.

## Schemas de governança
- `schema/CONTRACT_SOURCE_MAP.md` — mapa de fontes e ponte documental operacional (contrato ativo ↔ legado ↔ PDF ↔ status ↔ handoff)
- `schema/CONTRACT_SCHEMA.md` — formato de contrato novo
- `schema/STATUS_SCHEMA.md` — formato de status vivo
- `schema/HANDOFF_SCHEMA.md` — formato de handoff persistido
- `schema/TASK_CLASSIFICATION.md` — classificação canônica de tarefas e PRs
- `schema/DATA_CHANGE_PROTOCOL.md` — protocolo obrigatório de mudanças em dados persistidos do Supabase
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — protocolo obrigatório de permissões Cloudflare
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo obrigatório de execução contratual por PR
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — protocolo obrigatório de encerramento formal de contrato
- `schema/contracts/_INDEX.md` — índice canônico de contratos ativos por frente

## Governança contratual — regras anti-desvio

1. **PR de execução não altera contrato silenciosamente.** Qualquer alteração de objetivo, escopo, critério de aceite, fora de escopo ou condição de encerramento do contrato ativo exige classificação como `governança` (revisão contratual) e PR dedicada.
2. **Qualquer desvio de contrato deve parar.** Se a PR tenta abrir nova frente, novo escopo, fazer entrega fora do objetivo do contrato ou mudar objetivo sem revisão formal, marcar como **DESVIO DE CONTRATO**, parar e exigir revisão formal.
3. **Contrato só encerra via protocolo formal.** Nenhum contrato pode ser considerado encerrado sem cumprir integralmente o `CONTRACT_CLOSEOUT_PROTOCOL.md`. Encerramento implícito é proibido.
4. **Macro não pode ser traído por micro execução.** Nenhuma PR pode contradizer o A00, reordenar o A01 ou expandir escopo além do contrato ativo.
5. **Um contrato ativo por frente.** Contratos anteriores vão para `archive/`. O `_INDEX.md` deve sempre refletir o estado real.
6. **Toda PR de execução declara vínculo contratual.** Contrato lido, objetivo imutável, recorte executado, o que fecha, o que não fecha, desvio e encerramento.

## Protocolo de dados persistidos (Supabase)
Nenhuma mudança em schema, tabela, coluna, índice, constraint ou relacionamento do Supabase pode acontecer sem:
- Declaração explícita no ESTADO HERDADO e ESTADO ENTREGUE
- Preenchimento de todos os campos obrigatórios (tabela, tipo, colunas, motivo, impacto, rollback)
- Rastreabilidade completa no handoff e no PR template

Mesmo quando não houver mudança de dados, declarar: `Mudanças em dados persistidos (Supabase): nenhuma`

Ver `schema/DATA_CHANGE_PROTOCOL.md` para o protocolo completo.

## Protocolo de permissões Cloudflare
Nenhuma tarefa que passe a depender de novo recurso Cloudflare pode seguir com a necessidade de permissão implícita.

Toda tarefa deve declarar explicitamente no ESTADO HERDADO e ESTADO ENTREGUE se há ou não necessidade nova de permissão Cloudflare:
- Mesmo quando não houver necessidade nova, declarar: `Permissões Cloudflare necessárias: nenhuma adicional`
- Se houver necessidade nova: preencher todos os campos obrigatórios (recurso, ação, permissões suficientes, permissões adicionais, motivo, impacto, onde ajustar)
- Falha futura de deploy, binding ou recurso pode ser causada por permissão insuficiente do token — o agente deve avisar preventivamente, nunca deixar esse risco implícito
- Parar imediatamente se uma tarefa introduzir dependência de recurso Cloudflare sem declaração completa

Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para o protocolo completo.

## Protocolo de economia de request

Todo agente deve seguir rigorosamente `schema/REQUEST_ECONOMY_PROTOCOL.md`.

Regras mandatórias:
20. **Escopo fechado antes de abrir qualquer tarefa.** Nenhuma investigação livre sem objetivo declarado.
21. **Resolver o máximo dentro do escopo comprovado.** Evitar múltiplas PRs para o que cabe em uma dentro do mesmo escopo.
22. **Preferência por modelo barato.** Sonnet para tarefas de baixa/média complexidade. Modelo mais caro somente com justificativa explícita documentada.
23. **Preferir automação determinística sobre LLM.** Onde regex ou script simples resolve, não usar modelo.
24. **Proibido criar automação cara, recursiva ou dependente de LLM** onde check determinístico resolve.
25. **Prompts devem vir fechados, objetivos e com escopo declarado.** Evitar prompts abertos de investigação.

Gate automatizado de PR:
- `.github/workflows/pr-governance-check.yml` — valida 2 campos mínimos no body + gate de arquivos vivos (sem LLM, custo zero)
- `.github/workflows/pr-governance-autofix.yml` — auto-fix controlado: max 3 tentativas, apenas erros triviais, sem LLM
- `scripts/validate_pr_governance.js` — script determinístico de validação
- `scripts/autofix_pr_governance.js` — script determinístico de auto-fix (sem LLM, sem dependências externas)
- Filosofia: governança real = arquivos vivos do repo (`schema/status/`, `schema/handoffs/`, `schema/contracts/`); body da PR = apoio humano/checklist

## Regra de menção obrigatória ao agente/modelo

26. **Toda instrução operacional deve mencionar explicitamente o agente no início.**

Padrão obrigatório:
- `@copilot+claude-sonnet-4.6` — para tarefas de baixa/média complexidade (padrão preferencial)
- `@copilot+<modelo-explícito>` — para tarefas que exijam modelo diferente (com justificativa)

Regras:
- Comentário ou tarefa **sem menção explícita ao agente/modelo** = **não executável / não operacional**.
- Não deve ser tratado como comando confiável nem disparar execução automática.
- Se a tarefa exigir modelo mais caro, isso deve ser declarado explicitamente junto à menção.
- Esta regra existe para evitar comentários que parecem tarefa mas não disparam nada de forma confiável.
- A menção ao agente é a âncora de rastreabilidade de quem executou o quê — nunca omitir.

Exemplos válidos:
```
@copilot+claude-sonnet-4.6
Executar o próximo passo autorizado pelo A01 conforme o contrato ativo.
```
```
@copilot+claude-opus (justificativa: lógica de arquitetura complexa)
Revisar e redesenhar o contrato de frente para o Core Mecânico 2.
```

Exemplos inválidos (não operacionais):
```
Executar o próximo passo.              ← sem @copilot+modelo = não operacional
Copilot, fazer X.                      ← sem modelo explícito = não operacional
@copilot fazer Y.                      ← sem modelo explícito = não operacional
```

## Proibições nesta fase fundadora
- Criar app funcional
- Criar backend funcional
- Criar integrações reais (incluindo worker, painel, Supabase, Meta e áudio)

## Critério de conformidade
Entregas sem contrato ativo explícito, sem aderência à precedência, sem estado herdado declarado, sem classificação de tarefa ou com escopo aberto são não conformes.
