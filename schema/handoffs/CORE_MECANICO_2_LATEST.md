# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                        |
|--------------------------------------------|------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                              |
| Data                                       | 2026-04-20T01:00:00Z                                                        |
| Estado da frente                           | não iniciada (bootstrap infra concluído)                                     |
| Classificação da tarefa                    | fora_de_contrato                                                             |
| Última PR relevante                        | PR #5 — bootstrap técnico mínimo Cloudflare Workers (wrangler.toml)         |
| Item do A01 atendido                       | Fase 1 — scaffold técnico (bootstrap Cloudflare Workers)                     |
| Próximo passo autorizado                   | Abrir contrato do Core Mecânico 2                                            |
| Próximo passo foi alterado?                | não                                                                          |
| Tarefa fora de contrato?                   | sim — justificativa: scaffold técnico alinhado à Fase 1 do A01, executado antes do contrato do Core para preparar a infra |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                      |

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
