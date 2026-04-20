# schema/source — Fonte Bruta do Legado Mestre

Este diretório contém o PDF mestre único que consolida toda a base de verdade de negócio herdada da Enova 1 e dos documentos complementares da ENOVA 2.

## Arquivo presente

`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`

## Status

> **PDF DISPONÍVEL NO REPOSITÓRIO**
>
> O PDF mestre já está incorporado a este diretório.
> Ele é a fonte bruta canônica oficial do legado mestre unificado.
> Nenhuma outra versão ou cópia deve substituir este arquivo sem revisão formal.

## Papel deste PDF

1. **Fonte bruta canônica**: é o documento original de referência — prevalece sobre qualquer derivação em caso de conflito.
2. **Alimenta o legado operacional**: o conteúdo dos blocos L01–L19 e C01–C09 deve ser transcrito a partir deste PDF para `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. **Alimenta os contratos futuros**: os contratos ativos de cada frente devem declarar quais blocos do PDF são fonte de verdade de negócio para aquele contrato.
4. **Não substituir por resumo**: a transcrição deve preservar fidelidade ao original — nunca resumir regras de negócio.

## Arquivos derivados

| Arquivo | Papel |
|---------|-------|
| `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Versão markdown navegável — blocos transcritos do PDF à medida que são incorporados |
| `schema/legacy/INDEX_LEGADO_MESTRE.md` | Índice operacional — amarração de blocos às frentes, ordem de leitura e status de incorporação |

## Regra de atualização

- O PDF **não deve ser alterado** após o upload inicial sem registro formal.
- Qualquer nova versão do PDF deve ser versionada com sufixo de data e documentada neste README.
- O status de incorporação de cada bloco é rastreado exclusivamente no `INDEX_LEGADO_MESTRE.md`.
