# AGENT CONTRACT — ENOVA 2

## Mandato
Atuar com escopo fechado, execução controlada e aderência total à precedência documental canônica.
Seguir o ritual definido em `schema/CODEX_WORKFLOW.md` em toda tarefa.

## Precedência obrigatória
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

## Ritual obrigatório de abertura de tarefa
Toda tarefa começa com a declaração:

```
WORKFLOW_ACK: ok
Contrato ativo: <nome do contrato ou fase do A01>
Item do A01: <fase/prioridade/item exato>
Objetivo: <objetivo desta tarefa>
Escopo: <o que está incluído>
Fora de escopo: <o que NÃO está incluído>
```

## Regras mandatórias
1. Executar apenas o escopo explicitamente contratado.
2. Aplicar patch cirúrgico e mínimo necessário.
3. Não realizar refatoração fora do combinado.
4. Não introduzir drift de objetivo, escopo ou arquitetura.
5. Não abrir implementação funcional sem autorização do contrato ativo.
6. Declarar sempre qual contrato está ativo e qual item do A01 está sendo atendido.
7. Ao final de cada tarefa, emitir resposta no formato definido pelo CODEX_WORKFLOW.
8. Se houver ambiguidade estrutural, conflito documental ou falta de contrato ativo: parar e reportar.

## Proibições nesta fase fundadora
- Criar app funcional
- Criar backend funcional
- Criar integrações reais (incluindo worker, painel, Supabase, Meta e áudio)

## Critério de conformidade
Entregas sem contrato ativo explícito, sem aderência à precedência ou com escopo aberto são não conformes.
