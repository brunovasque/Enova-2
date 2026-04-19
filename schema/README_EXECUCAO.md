# README_EXECUCAO — Ordem de execução documental

## Protocolo de execução
Antes de executar qualquer tarefa, leia e siga o `CODEX_WORKFLOW.md`.
O `CODEX_WORKFLOW.md` define o ritual obrigatório de declaração, execução e resposta final.

## Ordem de leitura obrigatória
1. `A00_PLANO_CANONICO_MACRO.md`
2. `A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. `CODEX_WORKFLOW.md` — protocolo de execução
5. Contrato específico da frente ativa
6. Documentos legados aplicáveis indicados pelo A02

## Precedência documental
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia acima.

## Contrato ativo (obrigatório em toda nova frente)
Toda nova frente deve declarar explicitamente:
- `WORKFLOW_ACK: ok`
- qual contrato está ativo;
- qual item do A01 está sendo executado;
- qual vínculo com A02 e com os legados aplicáveis.

## Pacote mínimo para abertura de nova aba/frente
Nenhuma nova aba/frente inicia sem o pacote mínimo:
- Handoff da frente
- A00
- A01
- A02
- CODEX_WORKFLOW.md

## Regra de atualização
- Atualizações devem preservar coerência com a precedência documental.
- Mudanças de escopo só entram após ajuste explícito do documento canônico correspondente.
- Não abrir implementação funcional fora da ordem executiva definida no A01.
- Ao final de cada tarefa, se o estado da frente mudou, atualizar a documentação correspondente.
