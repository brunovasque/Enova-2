# README_EXECUCAO — Ordem de execução documental

## Protocolo de execução
Antes de executar qualquer tarefa, leia e siga o `CODEX_WORKFLOW.md`.
O `CODEX_WORKFLOW.md` define o ritual obrigatório de declaração, execução e resposta final.

## Ordem de leitura obrigatória
1. `A00_PLANO_CANONICO_MACRO.md`
2. `A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. `CODEX_WORKFLOW.md` — protocolo de execução
5. Contrato específico da frente ativa (formato em `CONTRACT_SCHEMA.md`)
6. Status vivo da frente ativa (`status/<FRENTE>_STATUS.md`)
7. Último handoff da frente ativa (`handoffs/<FRENTE>_LATEST.md`)
8. `legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre unificado
9. `legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos aplicáveis à frente ativa

## Precedência documental
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia acima.

## Contrato ativo (obrigatório em toda nova frente)
Toda nova frente deve declarar explicitamente:
- `WORKFLOW_ACK: ok`
- qual contrato está ativo;
- qual item do A01 está sendo executado;
- qual vínculo com A02 e com os legados aplicáveis.

Todo contrato segue o formato definido em `CONTRACT_SCHEMA.md`.

## Contexto vivo do repositório

O repo mantém memória operacional persistida em:
- `schema/status/` — status vivo por frente (formato em `STATUS_SCHEMA.md`)
- `schema/handoffs/` — handoff persistido por frente (formato em `HANDOFF_SCHEMA.md`)
- `schema/legacy/` — legado mestre unificado (índice em `legacy/INDEX_LEGADO_MESTRE.md`, conteúdo em `legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`)
- `schema/source/` — PDF mestre original (`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`)

Para saber o estado de qualquer frente: consultar `schema/status/_INDEX.md`.
Para retomar qualquer frente: consultar `schema/handoffs/_INDEX.md`.
Para saber quais legados ler: consultar `schema/legacy/INDEX_LEGADO_MESTRE.md`.

## Pacote mínimo para abertura de nova aba/frente
Nenhuma nova aba/frente inicia sem o pacote mínimo:
- Handoff da frente
- A00
- A01
- A02
- CODEX_WORKFLOW.md
- Status vivo da frente
- Legados aplicáveis

## Regra de atualização
- Atualizações devem preservar coerência com a precedência documental.
- Mudanças de escopo só entram após ajuste explícito do documento canônico correspondente.
- Não abrir implementação funcional fora da ordem executiva definida no A01.
- Ao final de cada tarefa, se o estado da frente mudou:
  1. Atualizar o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`)
  2. Atualizar o handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`)
  3. Confirmar o item do A01 atendido
  4. Declarar o próximo passo autorizado
