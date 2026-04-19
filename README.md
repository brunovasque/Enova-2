# ENOVA 2

Este repositório é o **núcleo documental fundador** da ENOVA 2.

## Objetivo desta fase
Estabelecer governança, ordem executiva, contratos de trabalho, memória operacional e incorporação dos legados para evolução segura do programa.

> Esta fase não implementa aplicação, backend, integrações reais, worker, painel, Supabase, Meta ou áudio.

## Documentos canônicos
- `schema/README_EXECUCAO.md`
- `schema/CODEX_WORKFLOW.md`
- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `.github/AGENT_CONTRACT.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

## Schemas de governança
- `schema/CONTRACT_SCHEMA.md` — formato obrigatório de contrato novo
- `schema/STATUS_SCHEMA.md` — formato obrigatório de status vivo por frente
- `schema/HANDOFF_SCHEMA.md` — formato obrigatório de handoff persistido

## Contexto vivo do repositório
- `schema/status/_INDEX.md` — índice de status vivos por frente
- `schema/handoffs/_INDEX.md` — índice de handoffs por frente
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice do legado mestre unificado

## Como saber o estado de qualquer frente
1. Consultar `schema/status/_INDEX.md` para localizar o arquivo de status.
2. Ler o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`).
3. Ler o último handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`).

## Como saber quais legados ler
1. Consultar `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente".
2. Navegar aos blocos indicados no `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. Consultar `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md` — seções 4 e 5.

## Precedência documental (obrigatória)
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

## Protocolo de execução
Toda tarefa segue o ritual definido em `schema/CODEX_WORKFLOW.md`:
leitura canônica → declaração de contrato ativo → execução → atualização de status e handoff → resposta final padronizada.

## Regra dos legados
Os **19 legados** e **9 complementares** são fonte de verdade de negócio herdada, consolidados em um **legado mestre único**.
Estão incorporados em `schema/legacy/` com índice operacional e estrutura pronta para transcrição do PDF mestre.
O PDF mestre original fica em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
