# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                        |
|--------------------------------------------|------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                              |
| Data                                       | 2026-04-20T01:51:55Z                                                        |
| Estado da frente                           | não iniciada (bootstrap infra + pipeline de deploy concluídos)               |
| Classificação da tarefa                    | fora_de_contrato (infra — pipeline de deploy)                                |
| Última PR relevante                        | PR #7 — Pipeline de deploy GitHub Actions (deploy.yml — test e prod)        |
| Item do A01 atendido                       | Fase 1 — scaffold técnico: pipeline de deploy Cloudflare concluído           |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2                                            |
| Próximo passo foi alterado?                | não                                                                          |
| Tarefa fora de contrato?                   | sim — infra de pipeline alinhada à Fase 1 do A01, sem implementação funcional |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                      |
| Permissões Cloudflare necessárias          | sim — Workers Scripts:Edit (necessário para wrangler deploy — aviso preventivo ativo) |

---

## 1. Contexto curto

O repositório da ENOVA 2 estava com toda a governança pronta (trio-base, workflow, protocolo de dados, protocolo de permissões Cloudflare) e com o bootstrap técnico de Cloudflare Workers concluído (wrangler.toml + entrypoint placeholder). Esta PR #7 cria o pipeline de deploy via GitHub Actions — o entregável final do scaffold técnico da Fase 1 do A01.

O pipeline é mínimo e limpo: disparo exclusivamente manual (`workflow_dispatch`), suporte a dois ambientes (`test` e `prod`), proteção explícita de branch para deploy em produção, uso dos secrets já existentes no repositório.

Nenhuma implementação funcional foi aberta. O próximo passo autorizado não foi alterado.

## 2. Classificação da tarefa

**fora_de_contrato**

Não há contrato ativo do Core Mecânico 2. O pipeline de deploy é necessidade operacional da Fase 1 do A01 (scaffold técnico), executado antes do contrato do Core para preparar a infra de CI/CD sem abrir implementação funcional. O próximo passo autorizado não foi alterado.

## 3. Última PR relevante

**PR #6** — Protocolo obrigatório de permissões Cloudflare (governança).

## 4. O que a PR #6 fechou

- Protocolo obrigatório de permissões Cloudflare (`CLOUDFLARE_PERMISSION_PROTOCOL.md`).
- Rastreabilidade total de permissões: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template.
- Alinhamento da governança Cloudflare ao mesmo nível de clareza da governança Supabase.

## 5. O que a PR #6 NÃO fechou

- Pipeline de deploy GitHub Actions (entregue nesta PR #7).
- Contrato formal do Core Mecânico 2 (deliberadamente fora de escopo, preservado).

## 6. Diagnóstico confirmado

- O repo tinha wrangler.toml + entrypoint placeholder, mas sem pipeline de deploy automatizado.
- A Fase 1 do A01 prevê scaffold técnico completo, incluindo CI/CD.
- O pipeline mínimo era a peça faltante para completar o scaffold técnico.
- Os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` já existiam no repositório.
- Nenhum binding, secret de aplicação, KV, R2, D1, queue ou var precisou ser criado.

## 7. O que foi feito (PR #7)

- Criado `.github/workflows/deploy.yml`: disparo manual (`workflow_dispatch`) com input de ambiente (`test` | `prod`), proteção de branch para prod (falha se não for `main`), checkout, setup-node@v4, instalação de `wrangler@3.114.17` (versão patched — sem vulnerabilidade CVE), deploy com `wrangler deploy --env test` (test) ou `wrangler deploy` (prod), usando `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.
- Atualizado `docs/BOOTSTRAP_CLOUDFLARE.md`: pipeline de deploy documentado, uso local via terminal/VSCode com exports de env vars, permissões Cloudflare declaradas, aviso preventivo explícito.
- Atualizado `README.md`: referência ao pipeline criado e à documentação de uso local.
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` (este arquivo).

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.
- **Bindings, secrets de aplicação, KV, R2, D1, queues, vars** — nenhum fictício adicionado.
- **Routes customizadas** — nenhuma.
- **Deploy automático em push** — não criado. Disparo exclusivamente manual.
- **Matrix de ambientes** — não criada. Um job simples com condicionais.
- **Secrets novos** — nenhum criado. Apenas os dois já existentes são usados.

## 9. O que esta PR fechou

- Pipeline de deploy mínimo e limpo para Cloudflare Workers (test e prod).
- Proteção de branch para produção (`main` = prod, explícito e enforçado no workflow).
- Documentação de uso local via terminal e VSCode.
- Declaração explícita de permissões Cloudflare necessárias (Workers Scripts:Edit).
- Scaffold técnico completo da Fase 1 do A01.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Implementação funcional do worker (após contrato aprovado).
- Verificação do escopo do token `CLOUDFLARE_API_TOKEN` antes do primeiro deploy real.

## 11. Esta tarefa foi fora de contrato?

**sim** — classificada como `fora_de_contrato`.

Justificativa: não há contrato ativo do Core Mecânico 2. O pipeline de deploy é necessidade operacional alinhada à Fase 1 do A01, controlada e sem drift. Não abre implementação funcional, não mexe em bindings reais, não cria lógica de negócio.

Impacto no próximo passo autorizado: **não alterou** — próximo passo continua sendo abertura do contrato do Core Mecânico 2.

## 12. Arquivos relevantes

- `.github/workflows/deploy.yml` *(criado — pipeline de deploy)*
- `docs/BOOTSTRAP_CLOUDFLARE.md` *(atualizado — pipeline + uso local + permissões Cloudflare)*
- `README.md` *(atualizado — referência ao pipeline)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 1** — scaffold técnico: pipeline de deploy completo. O repo está preparado para deploy manual com proteção de branch e ambientes canônicos corretos.

## 14. Estado atual da frente

**não iniciada** (bootstrap infra + pipeline de deploy concluídos)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. O scaffold técnico completo está pronto: wrangler.toml + entrypoint placeholder + pipeline de deploy.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅, bootstrap Cloudflare ✅, protocolo de permissões Cloudflare ✅, pipeline de deploy ✅

**Próximo passo preservado** — igual ao definido na PR #6.

## 16. Riscos

- **Permissão do token Cloudflare** — O token `CLOUDFLARE_API_TOKEN` deve ter permissão `Workers Scripts:Edit` para que o deploy funcione. Verificar antes do primeiro deploy real. Onde ajustar: Cloudflare Dashboard > API Tokens > editar token.
- **Entrypoint placeholder** — `src/worker.ts` é um placeholder sem lógica. Se alguém fizer deploy antes da implementação real, o worker responderá com uma mensagem de bootstrap. Isso é intencional e documentado.
- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado antes da abertura do contrato do Core.

## 17. Provas

- PR #7 criada com escopo exclusivo de pipeline de deploy de infraestrutura.
- `.github/workflows/deploy.yml` criado com proteção de branch, disparo manual, test e prod.
- `wrangler@3.114.17` pinado — versão patched, sem vulnerabilidade CVE em `wrangler pages deploy`.
- Apenas os dois secrets já existentes no repositório são usados (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
- `docs/BOOTSTRAP_CLOUDFLARE.md` atualizado com uso local e declaração de permissões.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #7.
- Mudanças em dados persistidos (Supabase): **nenhuma**.
- Permissões Cloudflare necessárias: **sim — Workers Scripts:Edit** (declarado e documentado com aviso preventivo).

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de infraestrutura de deploy. Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.

## 19. Permissões Cloudflare necessárias

```
Permissões Cloudflare necessárias: sim

  Recurso Cloudflare afetado:          Workers Scripts
  Ação pretendida:                      Publicar/atualizar worker via wrangler deploy (prod e test)
  Permissões atuais suficientes?        incerto — depende do escopo do token CLOUDFLARE_API_TOKEN configurado no repositório
  Permissões adicionais necessárias:    Workers Scripts:Edit (mínimo necessário para wrangler deploy)
  Motivo:                               Pipeline de deploy cria/atualiza o worker nv-enova-2 (prod) e nv-enova-2-test (test)
  Impacto se não tiver permissão:       wrangler deploy falha; worker não é atualizado; deploy retorna erro de autenticação
  Pode prosseguir sem ampliar?          não — sem esta permissão, o deploy não ocorre
  Onde ajustar:                         Cloudflare Dashboard > API Tokens > editar token CLOUDFLARE_API_TOKEN
```

> **AVISO PREVENTIVO DE PERMISSÃO CLOUDFLARE:**
> Esta PR cria dependência de Workers Scripts (wrangler deploy). Se o token `CLOUDFLARE_API_TOKEN`
> não tiver permissão `Workers Scripts:Edit`, o deploy falhará no pipeline e localmente.
> Verificar o escopo do token antes do primeiro deploy real.
> Onde ajustar: Cloudflare Dashboard > API Tokens > editar token.

---

*(Handoff histórico PR #6 preservado abaixo para rastreabilidade)*

O repositório fundador da ENOVA 2 está com governança endurecida em duas camadas: protocolo de dados persistidos do Supabase (PR #4) e bootstrap técnico mínimo de Cloudflare Workers (PR #5). Esta PR #6 adiciona a terceira camada de governança: protocolo obrigatório de permissões Cloudflare, garantindo que qualquer futura PR que passe a usar ou alterar recursos Cloudflare (Workers, KV, R2, D1, Queues, Service Bindings, Routes, Secrets, Vars, Observability) seja obrigada a declarar explicitamente se as permissões atuais bastam ou não.

A tarefa foi classificada como `governança` porque cria novo protocolo de governança operacional sem abrir implementação funcional. O próximo passo autorizado não foi alterado.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica de negócio. O próximo passo autorizado continua sendo a abertura formal do contrato.

## 2. Classificação da tarefa

**governança**

Não há contrato ativo do Core Mecânico 2. Esta tarefa cria novo protocolo de governança de permissões Cloudflare — nenhuma implementação funcional aberta, nenhum recurso real criado, nenhum token alterado. O próximo passo autorizado não foi alterado.

## 3. Última PR relevante

**PR #5** — bootstrap técnico mínimo Cloudflare Workers (wrangler.toml).

## 4. O que a PR #5 fechou

- Bootstrap técnico mínimo de Cloudflare Workers: `wrangler.toml` com ambientes canônicos.
- Preparação do repo para deploy futuro sem abrir implementação funcional.
- Documentação técnica do bootstrap (`docs/BOOTSTRAP_CLOUDFLARE.md`).
- Entrypoint placeholder mínimo (`src/worker.ts`) — honesto e explicitamente documentado.

## 5. O que a PR #5 NÃO fechou

- Protocolo de permissões Cloudflare (entregue nesta PR #6).
- Contrato formal do Core Mecânico 2 (deliberadamente fora de escopo, preservado).

## 6. Diagnóstico confirmado

- O repo tinha governança de Supabase (DATA_CHANGE_PROTOCOL) mas não tinha governança equivalente para permissões Cloudflare.
- A presença do `wrangler.toml` e do entrypoint placeholder tornava visível a necessidade: qualquer futura PR que adicione bindings, secrets, KV, R2, D1 ou outros recursos Cloudflare poderia ter a necessidade de permissão implícita.
- O risco de falha silenciosa em deploy por token insuficiente é real e previsível — deve ser documentado preventivamente.
- A criação do CLOUDFLARE_PERMISSION_PROTOCOL cobre essa lacuna no mesmo nível de clareza que o DATA_CHANGE_PROTOCOL cobre dados do Supabase.

## 7. O que foi feito (PR #6)

- Criado `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`: finalidade, precedência, escopo (Workers, KV, R2, D1, Queues, Service Bindings, Routes, Secrets, Vars, Observability), campos obrigatórios de declaração, regra de parada, regra de escopo mínimo do token, regra de não ampliar sem necessidade real, regra de aviso preventivo, exemplos, integração com CODEX_WORKFLOW.
- Atualizado `schema/CODEX_WORKFLOW.md`: ordem de leitura (item 11 = CLOUDFLARE_PERMISSION_PROTOCOL), bloco ESTADO HERDADO com campo `Permissões Cloudflare necessárias`, bloco ESTADO ENTREGUE com campo `Permissões Cloudflare necessárias`, regra de parada para necessidade não declarada, seção 11 (schemas) com novo protocolo, seção 15 (protocolo Cloudflare).
- Atualizado `.github/PULL_REQUEST_TEMPLATE.md`: seção explícita de permissões Cloudflare com campos (recurso, ação, permissões suficientes, permissões adicionais, motivo, impacto, onde ajustar).
- Atualizado `.github/AGENT_CONTRACT.md`: ESTADO HERDADO com campo Cloudflare, regras 16–19 (declaração obrigatória, proibição de permissão implícita, aviso preventivo, parada imediata), seção de schemas com novo protocolo, seção de protocolo Cloudflare.
- Atualizado `schema/HANDOFF_SCHEMA.md`: seção 19 obrigatória de permissões Cloudflare, campo no cabeçalho mínimo.
- Atualizado `schema/STATUS_SCHEMA.md`: seção 16 de permissões Cloudflare, campo no cabeçalho mínimo.
- Atualizado `schema/README_EXECUCAO.md`: seção de protocolo de permissões Cloudflare com escopo e aviso preventivo.
- Atualizado `README.md`: `CLOUDFLARE_PERMISSION_PROTOCOL.md` como documento canônico e schema de governança.
- Atualizado `schema/TASK_CLASSIFICATION.md`: obrigação universal de declaração de permissões Cloudflare em todas as classes.
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`: PR #6, classe governança, entregas atualizadas, campo Cloudflare.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` (este arquivo).

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.
- **Criação de token real** — nenhuma. Protocolo é de governança, não de execução.
- **Criação de secrets reais** — nenhuma.
- **Bindings reais (KV, R2, D1, Queues)** — nenhum.
- **Pipeline de deploy** — não aberto.
- **Alteração de token existente** — nenhuma.

## 9. O que esta PR fechou

- Protocolo obrigatório de permissões Cloudflare (`CLOUDFLARE_PERMISSION_PROTOCOL.md`).
- Rastreabilidade total de permissões: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template.
- Alinhamento da governança Cloudflare ao mesmo nível de clareza da governança Supabase.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Implementação funcional do worker (após contrato aprovado).
- Pipeline de CI/CD para deploy automatizado (após contrato aprovado).

## 11. Esta tarefa foi fora de contrato?

**não** — classificada como `governança`.

Não há contrato ativo do Core Mecânico 2, mas tarefas de governança não precisam de contrato para serem executadas. Esta tarefa não altera o próximo passo autorizado.

Impacto no próximo passo autorizado: **não alterou** — próximo passo continua sendo abertura do contrato do Core Mecânico 2.

## 12. Arquivos relevantes

- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` *(criado)*
- `schema/CODEX_WORKFLOW.md` *(atualizado — ordem de leitura, ESTADO HERDADO/ENTREGUE, regra de parada, seções 11 e 15)*
- `.github/PULL_REQUEST_TEMPLATE.md` *(atualizado — seção de permissões Cloudflare)*
- `.github/AGENT_CONTRACT.md` *(atualizado — ESTADO HERDADO, regras 16–19, seções de schemas e protocolo)*
- `schema/HANDOFF_SCHEMA.md` *(atualizado — seção 19 e cabeçalho)*
- `schema/STATUS_SCHEMA.md` *(atualizado — seção 16 e cabeçalho)*
- `schema/README_EXECUCAO.md` *(atualizado — seção de protocolo Cloudflare)*
- `README.md` *(atualizado — documento canônico e schema de governança)*
- `schema/TASK_CLASSIFICATION.md` *(atualizado — obrigação universal de declaração Cloudflare)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Governança** — endurecimento de workflow: protocolo obrigatório de permissões Cloudflare, equivalente ao DATA_CHANGE_PROTOCOL para Supabase.
- **Fase 0** — fundação documental: governança de permissões Cloudflare completa.

## 14. Estado atual da frente

**não iniciada** (bootstrap infra concluído, governança de permissões Cloudflare completa)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. O repo agora tem a infra de Cloudflare pronta e a governança de permissões Cloudflare estabelecida.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅, bootstrap Cloudflare ✅, protocolo de permissões Cloudflare ✅

**Próximo passo preservado** — igual ao definido na PR #5.

## 16. Riscos

- **Entrypoint placeholder** — `src/worker.ts` é um placeholder sem lógica. Se alguém fizer deploy antes da implementação real, o worker responderá com uma mensagem de bootstrap. Isso é intencional e documentado.
- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado antes da abertura do contrato do Core.
- **Permissões do token Cloudflare** — O token atual não foi verificado para todos os recursos que serão necessários após o contrato. Isso é esperado e intencional nesta PR de governança documental: a verificação e eventual ampliação do token só ocorrerão quando uma PR futura declarar necessidade concreta de recurso Cloudflare, seguindo o `CLOUDFLARE_PERMISSION_PROTOCOL.md`. Não há ação imediata necessária — é um risco futuro documentado preventivamente.

## 17. Provas

- PR #6 criada com escopo exclusivamente de governança de permissões Cloudflare.
- Nenhum arquivo funcional criado ou alterado.
- Nenhum token, secret ou recurso Cloudflare real criado.
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` criado com estrutura equivalente ao `DATA_CHANGE_PROTOCOL.md`.
- Todos os artefatos de governança atualizados para exigir declaração obrigatória de permissões Cloudflare.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #6.
- Mudanças em dados persistidos (Supabase): **nenhuma**.
- Permissões Cloudflare necessárias: **nenhuma adicional** (esta PR é de governança documental).

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de governança documental. Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.

## 19. Permissões Cloudflare necessárias

```
Permissões Cloudflare necessárias: nenhuma adicional
```

Esta PR é de governança documental. Nenhum recurso Cloudflare real (Workers Script, KV, R2, D1, Queues, Routes, Secrets, Vars, Bindings) foi criado, alterado ou configurado. O protocolo criado não requer permissão adicional para existir — apenas para ser aplicado em PRs futuras.

---

## 1. Contexto curto

O repositório fundador da ENOVA 2 está pronto com governança de dados persistidos endurecida (PR #4) e agora com bootstrap técnico mínimo de Cloudflare Workers (PR #5). O `wrangler.toml` foi criado com os ambientes canônicos `nv-enova-2` (produção) e `nv-enova-2-test` (teste), alinhados à Fase 1 do A01 (scaffold técnico). Um entrypoint placeholder mínimo (`src/worker.ts`) foi criado apenas para satisfazer o campo `main` do `wrangler.toml` — sem lógica de produto, sem bindings, sem arquitetura prematura.

A tarefa foi classificada como `fora_de_contrato` porque não há contrato ativo do Core Mecânico 2, mas o scaffold técnico é necessidade operacional alinhada com a Fase 1 do A01 e não altera o próximo passo autorizado.

A frente Core Mecânico 2 permanece sem contrato aberto nem execução técnica de negócio. O próximo passo autorizado é a abertura formal do contrato.

## 2. Classificação da tarefa

**fora_de_contrato**

Justificativa: scaffold técnico de Cloudflare Workers alinhado à Fase 1 do A01 ("abrir repo novo, scaffold técnico e shape macro do sistema"), executado antes do contrato do Core para preparar a infra de deploy sem abrir implementação funcional. O próximo passo autorizado não foi alterado.

Impacto no próximo passo autorizado: **não alterou** — o próximo passo continua sendo a abertura do contrato do Core Mecânico 2.

## 3. Última PR relevante

**PR #4** — Endurecimento de governança com protocolo obrigatório de dados persistidos (Supabase).

## 4. O que a PR #4 fechou

- DATA_CHANGE_PROTOCOL.md criado com 13 tipos canônicos, campos obrigatórios, regras de parada/rollback/compatibilidade
- CODEX_WORKFLOW.md endurecido com bloco de dados em ESTADO HERDADO e ESTADO ENTREGUE, seção 14
- Todos os artefatos de governança atualizados para exigir declaração obrigatória de dados persistidos

## 5. O que a PR #4 NÃO fechou

- Bootstrap técnico Cloudflare Workers (entregue nesta PR #5)
- Contrato formal do Core Mecânico 2 (deliberadamente fora de escopo, preservado)

## 6. Diagnóstico confirmado

- O repo estava pronto para governança mas sem nenhum arquivo de infra/deploy.
- A Fase 1 do A01 prevê scaffold técnico antes da implementação funcional.
- `wrangler.toml` é o entregável mínimo necessário para preparar o repo para Cloudflare Workers.
- Nenhuma implementação funcional, binding ou lógica de negócio foi necessária nesta etapa.

## 7. O que foi feito (PR #5)

- Criado `wrangler.toml`: `name = "nv-enova-2"`, `main = "src/worker.ts"`, `compatibility_date = "2026-04-20"`, bloco `[env.test]` com `name = "nv-enova-2-test"`. Comentários explicando prod/test, regra de main branch, ausência de bindings fictícios, e que o bootstrap não cria pipeline de deploy.
- Criado `src/worker.ts`: entrypoint placeholder mínimo. Sem lógica de produto, sem bindings, sem arquitetura prematura. Existe apenas para satisfazer o campo `main` do `wrangler.toml`. Comentários explícitos no arquivo documentando seu propósito temporário.
- Criado `docs/BOOTSTRAP_CLOUDFLARE.md`: documentação técnica curta do bootstrap — ambientes canônicos, regra de produção (main = prod), comandos futuros de deploy, o que ainda não existe, referências.
- Atualizado `README.md`: seção de bootstrap Cloudflare Workers com link para os artefatos e regra de produção.
- Atualizado `schema/status/CORE_MECANICO_2_STATUS.md`: nova PR #5, classe fora_de_contrato, entregas atualizadas, pendências atualizadas.
- Atualizado `schema/handoffs/CORE_MECANICO_2_LATEST.md` (este arquivo).

## 8. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente fora de escopo. Próximo passo preservado.
- **Implementação funcional** — nenhuma. Nenhum código de negócio.
- **Bindings, secrets, KV, R2, D1, queues, vars** — nenhum fictício adicionado.
- **Routes customizadas** — nenhuma.
- **Observability config** — nenhuma.
- **GitHub Actions / pipeline de deploy** — não aberto.
- **Integração com Supabase** — nenhuma.
- **Schema SQL real** — nenhuma tabela, coluna ou migration real criada.

## 9. O que esta PR fechou

- Bootstrap técnico mínimo de Cloudflare Workers: `wrangler.toml` com ambientes canônicos.
- Preparação do repo para deploy futuro sem abrir implementação funcional.
- Documentação técnica do bootstrap (`docs/BOOTSTRAP_CLOUDFLARE.md`).
- Entrypoint placeholder mínimo (`src/worker.ts`) — honesto e explicitamente documentado.

## 10. O que continua pendente após esta PR

- Abertura de contrato formal do Core Mecânico 2 (próximo passo autorizado — preservado).
- Transcrição integral do conteúdo dos legados (PDF mestre).
- Implementação funcional do worker (após contrato aprovado).
- Pipeline de CI/CD para deploy automatizado (após contrato aprovado).

## 11. Esta tarefa foi fora de contrato?

**sim** — classificada como `fora_de_contrato`.

Justificativa: não há contrato ativo do Core Mecânico 2. O scaffold técnico é necessidade operacional alinhada à Fase 1 do A01, controlada e sem drift. Não abre implementação funcional, não mexe em bindings reais, não cria lógica de negócio.

Impacto no próximo passo autorizado: **não alterou** — próximo passo continua sendo abertura do contrato do Core Mecânico 2.

## 12. Arquivos relevantes

- `wrangler.toml` *(criado)*
- `src/worker.ts` *(criado — placeholder mínimo)*
- `docs/BOOTSTRAP_CLOUDFLARE.md` *(criado)*
- `README.md` *(atualizado — seção Cloudflare Workers)*
- `schema/status/CORE_MECANICO_2_STATUS.md` *(atualizado)*
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*

## 13. Item do A01 atendido

- **Fase 1** — Scaffold técnico: bootstrap mínimo de Cloudflare Workers. O repo está preparado para deploy com os ambientes canônicos corretos.
- **Prioridade 0 do backlog**: scaffold técnico, variáveis de ambiente e convenções de deploy avançados parcialmente.

## 14. Estado atual da frente

**não iniciada** (bootstrap infra concluído)

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica de negócio. O repo agora tem a infra de Cloudflare pronta para o momento em que a implementação começar.

## 15. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow endurecido ✅, contexto vivo ✅, classificação de tarefas ✅, protocolo de dados ✅, bootstrap Cloudflare ✅

**Próximo passo preservado** — igual ao definido na PR #4.

## 16. Riscos

- **Entrypoint placeholder** — `src/worker.ts` é um placeholder sem lógica. Se alguém fizer deploy antes da implementação real, o worker responderá com uma mensagem de bootstrap. Isso é intencional e documentado.
- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado antes da abertura do contrato do Core.

## 17. Provas

- PR #5 criada com escopo exclusivamente de bootstrap técnico de infra.
- `wrangler.toml` com nomes canônicos `nv-enova-2` e `nv-enova-2-test`, sem bindings fictícios.
- `src/worker.ts` com stub mínimo e comentários explícitos de placeholder.
- `docs/BOOTSTRAP_CLOUDFLARE.md` documenta o que existe e o que ainda não existe.
- Nenhum arquivo de negócio, integração real, schema SQL ou pipeline foi criado.
- Status e handoff do Core Mecânico 2 atualizados refletindo PR #5.
- Mudanças em dados persistidos (Supabase): **nenhuma**.

## 18. Mudanças em dados persistidos (Supabase)

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta PR é de scaffold técnico de infra (Cloudflare Workers). Nenhuma tabela, coluna, índice, constraint, relacionamento ou migration do Supabase foi criado, alterado ou removido.
