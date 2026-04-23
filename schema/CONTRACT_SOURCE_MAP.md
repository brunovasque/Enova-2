# CONTRACT_SOURCE_MAP — Mapa de Fontes e Ponte Documental Operacional — ENOVA 2

## Finalidade

Este documento conecta o tronco macro soberano, o contrato ativo, o status vivo, o handoff e o legado
operacional auxiliar.

## Tronco soberano

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Se houver conflito entre documentos atuais do repo e esse arquivo, prevalece o arquivo mestre.

## Mapa de fontes

| Artefato | Caminho canonico | Papel | Precedencia | Quando consultar |
|----------|------------------|-------|-------------|------------------|
| Mestre macro markdown | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Tronco soberano T0-T7, G0-G7, ordem executiva e macro de implantacao | 1ª | Sempre |
| PDF mestre bruto | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` | Fonte original para auditoria e divergencia de transcricao | Auxiliar ao markdown soberano | Quando houver duvida de fidelidade/transcricao |
| Rebase canonico | `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md` | Estado canonico atual da implantacao apos rebase | Subordinado ao mestre | Sempre em tarefas macro |
| Plano T0-T7 | `schema/implantation/PLANO_EXECUTIVO_T0_T7.md` | Plano executivo derivado do mestre | Subordinado ao mestre | Sempre em tarefas macro |
| Indice de contratos | `schema/contracts/_INDEX.md` | Contrato/fase ativa e historicos | Subordinado ao mestre | Sempre |
| Contrato ativo | `schema/contracts/active/<NOME>.md` | Autorizacao formal do recorte atual | Subordinado ao mestre e aos protocolos | Sempre antes de execucao contratual |
| Status vivo | `schema/status/<NOME>_STATUS.md` | Estado persistido do recorte atual | Complementar | Sempre |
| Handoff vivo | `schema/handoffs/<NOME>_LATEST.md` | Continuidade operacional do recorte atual | Complementar | Sempre |
| Indice legado auxiliar | `schema/legacy/INDEX_LEGADO_MESTRE.md` | Localizacao operacional de blocos L/C | Auxiliar | Quando a tarefa consumir blocos por familia |
| Markdown legado auxiliar | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Derivacao por blocos quando aplicavel | Auxiliar | Quando a tarefa exigir bloco especifico |

## Precedencia

```text
schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  > A00
  > A01
  > A00-ADENDO-01
  > A02
  > CONTRACT_EXECUTION_PROTOCOL
  > contrato/fase ativa
  > documentos legados aplicaveis
```

## Fluxo de descoberta

1. Ler `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
2. Ler `schema/contracts/_INDEX.md`.
3. Identificar contrato/fase ativa.
4. Ler contrato ativo em `schema/contracts/active/`.
5. Ler status vivo do recorte ativo.
6. Ler handoff vivo do recorte ativo.
7. Ler `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md` e `schema/implantation/PLANO_EXECUTIVO_T0_T7.md` quando a tarefa tocar macro.
8. Ler `schema/legacy/INDEX_LEGADO_MESTRE.md` e derivados apenas quando houver consumo de blocos legados especificos.

## Regra de ausencia de contrato ativo

Ausencia de contrato ativo continua sendo condicao de parada para execucao contratual. Tarefas de
governanca, diagnostico ou correcao incidental podem prosseguir sem abrir execucao de negocio, desde
que declarem a condicao.

## Declaracao obrigatoria de fontes

Toda tarefa deve declarar:

```text
Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
Indice de contratos lido:    schema/contracts/_INDEX.md
Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausencia declarada
Status vivo lido:            schema/status/<NOME>_STATUS.md
Handoff vivo lido:           schema/handoffs/<NOME>_LATEST.md
Rebase canonico lido:        schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md | N/A
Plano T0-T7 lido:            schema/implantation/PLANO_EXECUTIVO_T0_T7.md | N/A
Indice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md | N/A
Legado markdown auxiliar:    schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md | N/A
PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf | nao consultado
```

Nunca declarar como lido um arquivo nao consultado.
