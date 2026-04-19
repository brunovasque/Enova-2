# LEGADOS — Camada de Base de Negócio Herdada

## Finalidade

Este diretório contém a incorporação canônica dos 19 documentos legados da Enova 1 ao repositório da ENOVA 2.

Os 19 legados são a **fonte de verdade de negócio** do projeto. Eles contêm as regras do MCMV, do funil, dos stages, das microregras, dos mapas de composição, da telemetria validada e da linguagem operacional que a ENOVA 2 herda.

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

- `INDEX_19_LEGADOS.md` — Índice completo com amarração por frente, domínio, função e regra de uso.
- `L01_*.md` até `L19_*.md` — Um arquivo por legado, seguindo nomenclatura canônica.

## Como usar

1. Consultar `INDEX_19_LEGADOS.md` para saber quais legados se aplicam à frente ativa.
2. Consultar o A02 (seção 4) para entender a classe/família de cada legado.
3. Ler os legados aplicáveis antes de abrir contrato ou executar tarefa que toque regras de negócio.
4. Nunca enviar todos os 19 por padrão — seguir a política de pacote mínimo do A02 (seção 6).

## Regra de incorporação

Cada arquivo `L0x_*.md` neste diretório deve conter:
1. O conteúdo integral do documento legado original, transcrito na estrutura canônica.
2. Enquanto o conteúdo original não estiver transcrito, o arquivo funciona como **placeholder estruturado** com:
   - Nome canônico
   - Classe/família (conforme A02)
   - Função
   - Domínio
   - Frentes que dependem deste legado
   - Instrução explícita de como incorporar o conteúdo original

A incorporação deve ser feita **sem resumir demais** — o conteúdo original deve ser preservado com fidelidade.
O objetivo é que o repositório contenha a base de verdade completa, sem depender de envio externo dos documentos.
