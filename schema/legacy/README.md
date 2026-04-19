# LEGADOS — Camada de Base de Negócio Herdada (Modelo Unificado)

## Finalidade

Este diretório contém a base de verdade de negócio herdada da Enova 1, consolidada em um **legado mestre único**.

O legado mestre unifica os **19 documentos legados** da Enova 1 e os **9 documentos complementares** da ENOVA 2 em um único arquivo markdown derivado de um PDF mestre.

## O que os legados são

- Base de negócio herdada da Enova 1.
- Fonte de verdade para regras do funil, microregras, stages, gates, transições, composição familiar, elegibilidade, regime, renda, trilhos especiais, finalização, telemetria e comportamento do programa MCMV.
- Referência obrigatória para qualquer contrato novo que toque regras de negócio.

## O que os legados NÃO são

- Não são base de arquitetura da ENOVA 2.
- Não são contratos de implementação.
- Não substituem os contratos novos por frente.
- Não comandam a ordem executiva (que pertence ao A01).
- Não competem com a precedência documental (A00 > A01 > A02 > contrato > legados).

## Precedência

Conforme A00 (seção 7) e A02 (seção 3):
- O legado manda nas **regras de negócio**.
- O pacote canônico novo manda na **arquitetura, ordem executiva e forma de implantação**.
- Em caso de conflito, o contrato novo só vence se não violar A00, A01 e a lógica de negócio consolidada no A02.

## Estrutura

- `INDEX_LEGADO_MESTRE.md` — Índice operacional unificado com amarração por frente, âncoras e status de assimilação.
- `LEGADO_MESTRE_ENOVA1_ENOVA2.md` — Arquivo markdown canônico derivado do PDF mestre. Contém todos os blocos L01–L19 e C01–C09.

## Fonte bruta

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — PDF mestre original (a ser incorporado ao repo).

## Como usar

1. Consultar `INDEX_LEGADO_MESTRE.md` para saber quais blocos se aplicam à frente ativa.
2. Navegar às âncoras correspondentes no `LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. Nunca ler o documento inteiro por padrão — ler apenas os blocos indicados pelo índice e pelo A02.

## Regra de incorporação

1. O PDF mestre deve ser colocado em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
2. O conteúdo do PDF é transcrito bloco a bloco no `LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. A transcrição deve preservar o conteúdo original com fidelidade — **não resumir demais**.
4. Após transcrição de cada bloco, atualizar o status de assimilação no `INDEX_LEGADO_MESTRE.md`.
5. Nenhum conteúdo de regra de negócio pode ser alterado na transcrição.
