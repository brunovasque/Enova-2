# CODEX_WORKFLOW — Protocolo Obrigatório de Execução da ENOVA 2

## 1. Ordem oficial de leitura antes de qualquer tarefa

Toda execução começa com leitura nesta sequência:

1. `schema/A00_PLANO_CANONICO_MACRO.md`
2. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. Contrato específico da frente ativa
5. Legados aplicáveis indicados pelo A02

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

Ao final de cada tarefa, se o estado da frente mudou:
- Atualizar o documento correspondente (contrato da frente, A01 ou handoff) para refletir a nova realidade.
- Não deixar documentos desatualizados em relação ao estado executado.
- A documentação deve sempre representar o estado real, não o estado planejado.

## 7. Regra de parada

Se qualquer das condições abaixo for identificada, parar e reportar em vez de improvisar:

- Ambiguidade estrutural não resolvida pelo A00, A01 ou A02
- Conflito documental entre camadas da precedência
- Ausência de contrato ativo explícito para a frente
- Escopo que ultrapassa o contrato ativo sem autorização

**Regra de parada não é falha — é conformidade.**
