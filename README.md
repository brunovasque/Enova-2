# ENOVA 2

Este repositório é a base canônica de implantação da ENOVA 2 com **governança viva + código técnico executável local**.

## Tronco macro soberano

O tronco macro soberano da implantação é:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Se houver conflito entre documentos atuais do repo e esse arquivo mestre, prevalece o arquivo mestre.
Os documentos do repo detalham, operacionalizam e organizam o que ele manda.

## Objetivo atual do repositório
Manter governança, ordem executiva, contratos, memória operacional e runtime técnico mínimo auditável, agora recolocados no macro original T0-T7.

> O repositório **não representa implantação macro concluída**.
> Ele contém fundação técnica/documental útil e recortes locais já arquivados, mas a implantação real segue aberta em T0/G0.
> LLM real, Supabase real novo/produtivo, Meta real, STT/TTS real, shadow/canary/cutover real e rollout real continuam fora do escopo atual.

## Documentos canônicos
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — **tronco macro soberano obrigatório em toda tarefa**
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — **Bíblia Canônica de Execução por PRs (T0..T7 + pós) derivada fielmente do mestre — leitura obrigatória em toda PR**
- `schema/execution/PR_EXECUTION_TEMPLATE.md` — **template canônico obrigatório de abertura de PR**
- `schema/handoffs/PR_HANDOFF_TEMPLATE.md` — **template canônico obrigatório de handoff por PR (continuidade zero-escuro)**
- `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md` — rebase canônico da implantação
- `schema/implantation/PLANO_EXECUTIVO_T0_T7.md` — plano executivo derivado do macro T0-T7
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
- `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` — status vivo macro da implantação
- `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` — handoff vivo macro da implantação
- `schema/status/_INDEX.md` — índice de status vivos por frente
- `schema/handoffs/_INDEX.md` — índice de handoffs por frente
- `schema/contracts/_INDEX.md` — **índice de contratos ativos por frente**
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice do legado mestre unificado

## Como saber o estado de qualquer frente
1. Ler `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` para confirmar o macro soberano.
2. Ler `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` para localizar a PR correta na sequência.
3. Consultar `schema/contracts/_INDEX.md` para saber qual contrato está ativo.
4. Consultar `schema/status/_INDEX.md` para localizar o status macro e os status históricos por frente.
5. Ler o status vivo macro (`schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`).
6. Ler o último handoff macro (`schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`) — formato obrigatório em `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.

## Como saber quais legados ler
1. Consultar primeiro `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
2. Consultar `schema/legacy/INDEX_LEGADO_MESTRE.md` como índice operacional auxiliar.
3. Navegar aos blocos indicados no markdown legado derivado quando aplicável.
3. Consultar `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md` — seções 4 e 5.

## Precedência documental (obrigatória)
**schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md > A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis**

## Bíblia Canônica de Execução por PRs

A sequência inviolável de PRs de implantação macro (preparatórias + T0..T7 + pós-go-live) está em
`schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`. Esta Bíblia é a tradução fiel do mestre
em plano operacional de PRs e é **leitura obrigatória em toda PR**. Nenhuma PR futura pode nascer
fora dessa ordem.

Toda PR deve abrir-se conforme `schema/execution/PR_EXECUTION_TEMPLATE.md` e encerrar com handoff
conforme `schema/handoffs/PR_HANDOFF_TEMPLATE.md` — handoff obrigatório, nunca opcional.

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

## Auditoria de runtime Cloudflare

Para separar com precisão o que é:
- governança/documentação,
- código versionado no repo,
- e o que é verificável como publicação no Worker,

consulte `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`.

## Regra dos legados
Os **19 legados** e **9 complementares** são fonte de verdade de negócio herdada, consolidados em um **legado mestre único**.
Estão incorporados em `schema/legacy/` com índice operacional e estrutura pronta para transcrição do PDF mestre.
O PDF mestre original fica em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
