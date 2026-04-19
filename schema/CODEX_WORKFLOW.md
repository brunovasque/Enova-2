# CODEX_WORKFLOW — Protocolo Obrigatório de Execução da ENOVA 2

## 1. Ordem oficial de leitura antes de qualquer tarefa

Toda execução começa com leitura nesta sequência:

1. `schema/A00_PLANO_CANONICO_MACRO.md`
2. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. Contrato específico da frente ativa (seguindo formato de `schema/CONTRACT_SCHEMA.md`)
5. Status vivo da frente ativa (`schema/status/<FRENTE>_STATUS.md`)
6. Último handoff da frente ativa (`schema/handoffs/<FRENTE>_LATEST.md`)
7. Legados aplicáveis indicados pelo A02 e pelo `schema/legacy/INDEX_19_LEGADOS.md`

Nenhuma tarefa começa sem confirmar esta leitura.

## 2. Precedência documental oficial

**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia. O legado manda nas regras de negócio; o pacote canônico manda na arquitetura, na ordem executiva e na forma de implantação.

## 3. Declaração obrigatória de abertura de tarefa

Antes de executar qualquer tarefa, o agente deve declarar explicitamente:

```
WORKFLOW_ACK: ok
Contrato ativo: <nome do contrato ou fase do A01>
Item do A01: <fase/prioridade/item exato>
Objetivo: <objetivo desta tarefa>
Escopo: <o que está incluído>
Fora de escopo: <o que NÃO está incluído>
```

Tarefa sem essa declaração não deve ser iniciada.

## 4. Regras de execução

- **Uma frente por vez.** Não misturar Core, Speech, Supabase, Áudio e Canal na mesma PR sem necessidade comprovada.
- **Sem drift.** O escopo não pode crescer durante a execução sem atualização explícita do contrato.
- **Sem implementação fora do contrato ativo.** Nenhuma linha de código funcional, integração real ou arquitetura técnica entra sem autorização do contrato da frente.
- **Sem mistura de frentes sem necessidade comprovada e documentada.**
- **Diagnóstico antes de patch.** Toda mudança começa com leitura e prova do problema.
- **Prova antes de promoção.** Toda entrega precisa de smoke, evidência e plano de rollback.

## 5. Formato obrigatório de resposta final

Toda tarefa encerrada deve incluir a resposta final completa neste formato:

```
Summary
-------
<resumo objetivo do que foi feito>

Diagnóstico confirmado
----------------------
<o que foi analisado e confirmado antes da execução>

Alterações realizadas
---------------------
<lista de arquivos criados/alterados com descrição do que mudou>

Item do A01 atendido
--------------------
<fase, prioridade ou item exato do A01 que esta tarefa executa>

Estado atual da frente
----------------------
<em que fase/estado a frente se encontra após esta entrega>

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

## 6. Regra de atualização documental pós-tarefa

Ao final de cada tarefa, se o estado da frente mudou, atualizar obrigatoriamente:

1. **Status vivo da frente** (`schema/status/<FRENTE>_STATUS.md`) — atualizar estado atual, última PR, último commit, entregas, pendências, bloqueios e próximo passo autorizado.
2. **Handoff da frente** (`schema/handoffs/<FRENTE>_LATEST.md`) — atualizar ou criar novo handoff com contexto, diagnóstico, o que foi feito, o que não foi feito, riscos e provas.
3. **Item do A01** — confirmar qual item do A01 foi atendido (total ou parcialmente).
4. **Próximo passo autorizado** — declarar explicitamente o próximo passo, coerente com A01 e contrato ativo.
5. **Índices** (`schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md`) — atualizar se houve mudança de estado ou novo handoff.

Regras complementares:
- Não deixar documentos desatualizados em relação ao estado executado.
- A documentação deve sempre representar o estado real, não o estado planejado.
- Atualizar o documento correspondente (contrato da frente, A01 ou handoff) para refletir a nova realidade.

## 7. Schemas obrigatórios de governança

Os seguintes schemas definem o formato obrigatório de artefatos de governança:

- `schema/CONTRACT_SCHEMA.md` — formato obrigatório de qualquer contrato novo de frente.
- `schema/STATUS_SCHEMA.md` — formato obrigatório de status vivo por frente.
- `schema/HANDOFF_SCHEMA.md` — formato obrigatório de handoff persistido por frente.

Nenhum contrato, status ou handoff deve ser criado fora destes formatos.

## 8. Estrutura de contexto vivo

O repositório mantém contexto vivo em:

- `schema/status/` — status vivos por frente (índice em `_INDEX.md`)
- `schema/handoffs/` — handoffs persistidos por frente (índice em `_INDEX.md`)
- `schema/legacy/` — 19 legados incorporados (índice em `INDEX_19_LEGADOS.md`)

## 9. Regra de parada

Se qualquer das condições abaixo for identificada, parar e reportar em vez de improvisar:

- Ambiguidade estrutural não resolvida pelo A00, A01 ou A02
- Conflito documental entre camadas da precedência
- Ausência de contrato ativo explícito para a frente
- Escopo que ultrapassa o contrato ativo sem autorização

**Regra de parada não é falha — é conformidade.**
