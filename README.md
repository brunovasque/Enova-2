# ENOVA 2

Este repositório é o **núcleo documental fundador** da ENOVA 2.

## Objetivo desta fase
Estabelecer governança, ordem executiva, contratos de trabalho, memória operacional e incorporação dos legados para evolução segura do programa.

> Esta fase não implementa aplicação, backend, integrações reais, worker, painel, Supabase, Meta ou áudio.

## Documentos canônicos
- `schema/README_EXECUCAO.md`
- `schema/CODEX_WORKFLOW.md` — **lei operacional única entre PRs** (16 etapas obrigatórias)
- `schema/TASK_CLASSIFICATION.md` — classificação canônica de tarefas e PRs
- `schema/DATA_CHANGE_PROTOCOL.md` — **protocolo obrigatório de mudanças em dados persistidos do Supabase**
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — **protocolo obrigatório de permissões Cloudflare**
- `schema/REQUEST_ECONOMY_PROTOCOL.md` — **protocolo obrigatório de economia de request e modelo**
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — **protocolo obrigatório de execução contratual por PR**
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — **protocolo obrigatório de encerramento formal de contrato**
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
- `schema/REQUEST_ECONOMY_PROTOCOL.md` — disciplina de request, modelo e automação
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — execução contratual por PR (vínculo, anti-desvio, revisão)
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — encerramento formal de contrato (checklist, evidências, archive)

## Contexto vivo do repositório
- `schema/status/_INDEX.md` — índice de status vivos por frente
- `schema/handoffs/_INDEX.md` — índice de handoffs por frente
- `schema/contracts/_INDEX.md` — **índice de contratos ativos por frente**
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice do legado mestre unificado

## Como saber o estado de qualquer frente
1. Consultar `schema/contracts/_INDEX.md` para saber qual contrato está ativo.
2. Consultar `schema/status/_INDEX.md` para localizar o arquivo de status.
3. Ler o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`).
4. Ler o último handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`).

## Como saber quais legados ler
1. Consultar `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente".
2. Navegar aos blocos indicados no `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. Consultar `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md` — seções 4 e 5.

## Precedência documental (obrigatória)
**A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente > documentos legados aplicáveis**

## Protocolo de execução
Toda tarefa segue o fluxo obrigatório de 16 etapas definido em `schema/CODEX_WORKFLOW.md`:
leitura canônica → leitura de contratos → estado herdado → classificação → vínculo contratual → checagem de desvio → execução → estado entregue → atualização viva → closeout (se aplicável) → resposta final.

Toda PR deve declarar: de qual PR continua, o que herdou, o que resolveu e o que permanece aberto.
Toda PR deve declarar vínculo contratual: contrato ativo lido, recorte executado, o que fecha e o que não fecha do contrato, desvio de contrato e encerramento.

**Toda tarefa deve declarar explicitamente se houve ou não mudança em dados persistidos do Supabase.**
Ver `schema/DATA_CHANGE_PROTOCOL.md` para o protocolo completo de rastreabilidade.

**Toda tarefa que passe a usar, alterar ou depender de qualquer recurso Cloudflare deve declarar explicitamente se as permissões atuais bastam ou não.**
Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para o protocolo completo de rastreabilidade de permissões.

**Toda PR de execução deve estar vinculada ao contrato ativo — desvio de contrato é condição de parada.**
Ver `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` para o protocolo completo de execução contratual.

**Contrato só encerra via protocolo formal — encerramento implícito é proibido.**
Ver `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` para o protocolo completo de encerramento.

## PR Governance Gate (automação de validação)

O repositório inclui gate automatizado de validação de PR:

- `.github/workflows/pr-governance-check.yml` — executa em toda PR (sem LLM, sem custo extra)
- `scripts/validate_pr_governance.js` — script determinístico de validação

**Filosofia:** a governança real está nos arquivos vivos versionados do repo (`schema/status/`, `schema/handoffs/`, `schema/contracts/`). O corpo da PR é apoio humano/checklist.

O gate bloqueia PRs que não declarem os **2 campos mínimos** no body:
- `Contrato ativo` — qual contrato da frente está ativo
- `Próximo passo autorizado` — próximo passo explicitamente autorizado

O gate também bloqueia quando o body declara arquivos vivos atualizados mas o diff não contém mudanças reais em `schema/status/`, `schema/handoffs/` ou `schema/contracts/`.

## Auto-fix controlado do PR Governance Gate

O repositório inclui camada de auto-fix **restrita e determinística** para erros triviais do gate:

- `.github/workflows/pr-governance-autofix.yml` — dispara quando o gate falha; max **3 tentativas**; para em erros estruturais
- `scripts/autofix_pr_governance.js` — script determinístico (sem LLM, sem dependências externas)

**Regras do auto-fix:**
- Atua apenas em: campo ausente do body / campo vazio
- **Não atua em:** incoerência contratual, live files sem diff, erros estruturais
- Máximo **3 tentativas** por PR (rastreado no body)
- Valores inseridos são **placeholders** — o autor deve preencher os reais

Ver `schema/CODEX_WORKFLOW.md` seção 17 e `schema/REQUEST_ECONOMY_PROTOCOL.md`.

## Regra de menção obrigatória ao agente/modelo

Toda instrução operacional (comentário de PR, issue, prompt de tarefa) deve mencionar explicitamente o agente no início:

```
@copilot+claude-sonnet-4.6
<instrução aqui>
```

- Instrução **sem `@copilot+modelo`** = **não operacional / não executável**
- Padrão preferencial: `@copilot+claude-sonnet-4.6` (Sonnet — custo baixo)
- Modelo mais caro: declarar explicitamente com justificativa
- Esta regra garante rastreabilidade de autoria e evita comandos implícitos

Ver `.github/AGENT_CONTRACT.md` regra 26 e `schema/CODEX_WORKFLOW.md` seção 18.

Ver `schema/REQUEST_ECONOMY_PROTOCOL.md` para a política de economia de request e modelo.

## Cloudflare Workers — Bootstrap técnico e pipeline de deploy

O repositório inclui o bootstrap mínimo e o pipeline de deploy para Cloudflare Workers:

- `wrangler.toml` — configura os ambientes canônicos: `nv-enova-2` (produção) e `nv-enova-2-test` (teste)
- `src/worker.ts` — entrypoint técnico mínimo com rota estrutural `POST /__core__/run`
- `.github/workflows/deploy.yml` — pipeline de deploy (automático em main + manual test/prod)
- `docs/BOOTSTRAP_CLOUDFLARE.md` — documentação técnica do bootstrap e uso local (bash, PowerShell, VSCode)

> **`main` branch representa produção.**
> Push/merge em `main` → deploy prod automático.
> Deploy manual via GitHub Actions → aba Actions → **Deploy — Cloudflare Workers** → Run workflow.

## Regra dos legados
Os **19 legados** e **9 complementares** são fonte de verdade de negócio herdada, consolidados em um **legado mestre único**.
Estão incorporados em `schema/legacy/` com índice operacional e estrutura pronta para transcrição do PDF mestre.
O PDF mestre original fica em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
