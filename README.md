# ENOVA 2

Este repositório é o **núcleo documental fundador** da ENOVA 2.

## Objetivo desta fase
Estabelecer governança, ordem executiva, contratos de trabalho, memória operacional e incorporação dos legados para evolução segura do programa.

> Esta fase não implementa aplicação, backend, integrações reais, worker, painel, Supabase, Meta ou áudio.

## Documentos canônicos
- `schema/README_EXECUCAO.md`
- `schema/CODEX_WORKFLOW.md` — **lei operacional única entre PRs** (11 etapas obrigatórias)
- `schema/TASK_CLASSIFICATION.md` — classificação canônica de tarefas e PRs
- `schema/DATA_CHANGE_PROTOCOL.md` — **protocolo obrigatório de mudanças em dados persistidos do Supabase**
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — **protocolo obrigatório de permissões Cloudflare**
- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `.github/AGENT_CONTRACT.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

## Schemas de governança
- `schema/CONTRACT_SCHEMA.md` — formato obrigatório de contrato novo
- `schema/STATUS_SCHEMA.md` — formato obrigatório de status vivo por frente
- `schema/HANDOFF_SCHEMA.md` — formato obrigatório de handoff persistido
- `schema/TASK_CLASSIFICATION.md` — 6 classes canônicas de tarefas
- `schema/DATA_CHANGE_PROTOCOL.md` — rastreabilidade total de mudanças em dados do Supabase
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — rastreabilidade total de permissões Cloudflare

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
Toda tarefa segue o fluxo obrigatório de 11 etapas definido em `schema/CODEX_WORKFLOW.md`:
leitura canônica → estado herdado → classificação → execução → estado entregue → atualização viva → resposta final.

Toda PR deve declarar: de qual PR continua, o que herdou, o que resolveu e o que permanece aberto.

**Toda tarefa deve declarar explicitamente se houve ou não mudança em dados persistidos do Supabase.**
Ver `schema/DATA_CHANGE_PROTOCOL.md` para o protocolo completo de rastreabilidade.

**Toda tarefa que passe a usar, alterar ou depender de qualquer recurso Cloudflare deve declarar explicitamente se as permissões atuais bastam ou não.**
Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para o protocolo completo de rastreabilidade de permissões.

## Cloudflare Workers — Bootstrap técnico

O repositório inclui o bootstrap mínimo para deploy na plataforma Cloudflare Workers:

- `wrangler.toml` — configura os ambientes canônicos: `nv-enova-2` (produção) e `nv-enova-2-test` (teste)
- `src/worker.ts` — entrypoint placeholder mínimo (sem lógica de produto)
- `docs/BOOTSTRAP_CLOUDFLARE.md` — documentação técnica do bootstrap

> **`main` branch representa produção.** Ambiente `test` existe para validação controlada antes de promoção.
> Pipeline de deploy será criado em PR dedicada.

## Regra dos legados
Os **19 legados** e **9 complementares** são fonte de verdade de negócio herdada, consolidados em um **legado mestre único**.
Estão incorporados em `schema/legacy/` com índice operacional e estrutura pronta para transcrição do PDF mestre.
O PDF mestre original fica em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
