# schema/source — Tronco Soberano do Legado Mestre

Este diretorio contem o tronco soberano da implantacao macro da ENOVA 2.

## Arquivos presentes

- `LEGADO_MESTRE_ENOVA1_ENOVA2.md` — markdown soberano de leitura recorrente
- `LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — PDF mestre bruto/original

## Status

> **MARKDOWN SOBERANO DISPONIVEL NO REPOSITORIO**
>
> O markdown mestre em `schema/source/` e a base macro soberana da implantacao.
> Nenhuma outra versao ou copia deve substituir este arquivo sem revisao formal.

## Papel dos arquivos

1. **Markdown soberano**: `LEGADO_MESTRE_ENOVA1_ENOVA2.md` prevalece para macro, gates, ordem T0-T7 e regra executiva.
2. **PDF bruto**: `LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` permanece como fonte original para auditoria e divergencias de transcricao.
3. **Documentos derivados**: arquivos em `schema/legacy/`, `schema/contracts/`, `schema/status/` e `schema/handoffs/` operacionalizam o mestre, mas nao podem contradize-lo.

## Arquivos derivados

| Arquivo | Papel |
|---------|-------|
| `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Derivacao auxiliar por blocos |
| `schema/legacy/INDEX_LEGADO_MESTRE.md` | Indice operacional auxiliar de blocos |
| `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md` | Rebase canonico da implantacao |
| `schema/implantation/PLANO_EXECUTIVO_T0_T7.md` | Plano executivo derivado do mestre |

## Regra de atualização

- O markdown soberano e o PDF nao devem ser alterados sem registro formal.
- Qualquer nova versao deve ser versionada com sufixo de data e documentada neste README.
- Toda tarefa futura deve ler `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` antes do contrato/fase ativa.
