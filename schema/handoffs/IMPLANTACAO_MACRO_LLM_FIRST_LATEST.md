# IMPLANTACAO_MACRO_LLM_FIRST_LATEST

## Contexto

O repositorio foi rebaseado canonicamente para seguir o macro original do legado mestre, agora em:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

O estado anterior transmitia que as frentes e o contrato extraordinario E1 encerravam o macro. Isso foi
corrigido: esses recortes permanecem como fundacao tecnica/local/documental aproveitavel, mas a
implantacao macro real continua aberta.

## Estado herdado

- Frentes 1-8 arquivadas como recortes tecnicos historicos.
- E1 arquivado como modulo tecnico/local extraordinario.
- Indices/status/handoffs centrais indicavam encerramento amplo demais.
- Mestre em `schema/source/` define T0-T7 e G0-G7 como ordem soberana.

## Estado entregue

- Criada camada canonica de rebase em `schema/implantation/`.
- Criado contrato ativo T0.
- Criado status/handoff macro.
- Atualizados indices centrais para apontar fase real: T0/G0.
- Atualizada regra de leitura obrigatoria do mestre em toda tarefa futura.

## Proximo passo unico autorizado

T0-PR2 — inventario legado vivo.

## Leituras obrigatorias para a proxima tarefa

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
3. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md`
6. `schema/implantation/PLANO_EXECUTIVO_T0_T7.md`

## Limites

- Nao abrir LLM real.
- Nao abrir Supabase real novo/produtivo.
- Nao abrir Meta real.
- Nao abrir STT/TTS real.
- Nao abrir shadow, canary, cutover ou rollout real.
- Nao tratar runtime tecnico local como prova de implantacao macro.

## Atualizacao 2026-04-23 — Bíblia canônica de PRs publicada

- Publicada `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (sequência inviolável de PRs derivada do mestre).
- Publicado `schema/execution/PR_EXECUTION_TEMPLATE.md` (template canônico obrigatório de abertura de PR).
- Publicado `schema/handoffs/PR_HANDOFF_TEMPLATE.md` (template canônico obrigatório de handoff por PR).
- Atualizados `README.md`, `schema/contracts/_INDEX.md`, `schema/handoffs/_INDEX.md`, `schema/status/_INDEX.md`.

### Regra canônica de exceção contratual (Bíblia §S — soberana)

- **Regra padrão:** seguir o contrato literalmente. Nenhuma quebra, flexibilização, "atalho útil" ou "quebra benéfica" pode ser feita por interpretação do executor.
- **Somente o Vasques pode autorizar manualmente uma exceção contratual**, de forma explícita, específica, temporária e registrada (motivo, benefício esperado, escopo exato, duração/PRs afetadas, condição de retorno).
- Encerrada a causa específica, o projeto **retorna automaticamente à normalidade do contrato**.
- Limites duros nunca exceptuáveis: soberania da IA na fala (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`), regras de negócio MCMV, gates G0..G7, mudanças Supabase silenciosas, encerramento implícito de contrato.
- Aplicação obrigatória nos templates de abertura e handoff (campos explícitos).

### Estado atual da exceção contratual

- **Exceção contratual ativa?:** não.
- A próxima PR (`PR-T0.1`) **deve declarar explicitamente** `Exceção contratual autorizada pelo Vasques?: não` no body (conforme `PR_EXECUTION_TEMPLATE.md`) e operar literalmente conforme o contrato T0.

### Próximo passo (reafirmado)

- `PR-T0.1 — Inventário de fluxos e estados vivos` (equivalente a `T0-PR2 — inventario legado vivo`).
- Leituras obrigatórias adicionais: Bíblia §G + §S, `PR_EXECUTION_TEMPLATE.md`, `PR_HANDOFF_TEMPLATE.md`.

## Atualizacao 2026-04-23 — Adendo canônico A00-ADENDO-02 publicado (soberania LLM-MCMV)

### Objetivo executado

Criar adendo canônico forte (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`) que:

- Posiciona a Enova 2 explicitamente como **atendente especialista MCMV**, humana na fala, LLM-first de verdade, com soberania de raciocínio e fala.
- Proíbe formalmente que a Enova 2 seja executada como continuação mecânica da Enova 1.
- Define o papel correto do conhecimento normativo, memória e telemetria: suporte ao LLM, nunca casca dominante.
- Inclui guia de leitura com travas explícitas para T1, T3, T4, T5 e T6 — as fases com maior risco de má interpretação.
- Define o uso correto da E1: matéria-prima de conhecimento, regras, telemetria e ativos úteis; sem refatoração imediata, sem recriar casca mecânica.

### Prioridade máxima de interpretação

**Este adendo (A00-ADENDO-02) passa a ser leitura obrigatória antes de qualquer PR de T1, T3, T4, T5 ou T6.**

Sua posição na cadeia de precedência:

```
LEGADO_MESTRE > A00 > A01 > A00-ADENDO-01 > A00-ADENDO-02 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo
```

### O que foi feito

- Criado `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): identidade, visão de produto, divisão canônica LLM × mecânico, papel do conhecimento normativo, reaproveitamento correto da E1, proibições formais, guia de leitura por fase.
- Atualizado `schema/CODEX_WORKFLOW.md`: adendo adicionado na lista de leitura obrigatória (item 32) e na cadeia de precedência (seção 2); alertas explícitos para T1/T3/T4/T5/T6.
- Atualizado `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`: cadeia de precedência atualizada (seção A), leituras obrigatórias por PR (seção E com items 10 e 11), nova seção S0 com travas LLM-first por fase.
- Atualizado `schema/contracts/_INDEX.md`: precedência, adendos ativos, regra de leitura, data de sincronização.
- Atualizado `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` (este arquivo): registro deste adendo como prioridade máxima de interpretação.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: registro desta PR.
- Atualizado `README.md`: referência ao novo adendo na cadeia de precedência e nos documentos canônicos.

### O que não foi feito

- Nenhuma alteração em runtime.
- Nenhuma alteração em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma alteração no macro soberano (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`).
- Nenhuma refatoração da Enova 1.
- Nenhuma abertura de implementação funcional.
- Nenhuma mudança de gate ou de próximo passo autorizado.

### Regra de E1 atualizada

- A Enova 1 não deve ser refatorada nesta etapa (T0).
- O uso da E1 é apenas de diretriz de reaproveitamento futuro: inventário, mapeamento, referência de regras.
- Quando a fase de memória (T2) chegar, a base da E1 será usada como matéria-prima (dados, regras, casos, estrutura de estado). A integração será definida no contrato T2.
- O uso da E1 foca em: **conhecimento, telemetria, regras, ativos úteis** — nunca em casca mecânica de atendimento.

### Exceção contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Próximo passo autorizado (inalterado)

- `PR-T0.1` / `T0-PR2` — inventário de fluxos e estados vivos.
- **A PR-T0.1 deve ser executada lendo obrigatoriamente o novo adendo A00-ADENDO-02.**

### Leituras obrigatórias da próxima PR (reafirmadas e expandidas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/execution/PR_EXECUTION_TEMPLATE.md`
6. `schema/handoffs/PR_HANDOFF_TEMPLATE.md`
7. `schema/CODEX_WORKFLOW.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## Atualizacao 2026-04-23 — WORKFLOW macro amarrado como regra viva (histórico)

### Objetivo executado (PR anterior)

Transformar em regra operacional obrigatoria no `schema/CODEX_WORKFLOW.md` aquilo que ja estava aprovado no repo:
macro soberano, Biblia de PRs, templates canônicos, gates T0-T7/G0-G7 e excecao contratual manual do Vasques.

### O que foi feito

- O `schema/CODEX_WORKFLOW.md` passou a exigir leitura previa obrigatoria de PR macro com:
  - `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
  - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
  - contrato ativo da fase
  - handoff vivo da fase
  - o proprio `schema/CODEX_WORKFLOW.md`
- O `schema/CODEX_WORKFLOW.md` passou a exigir abertura de PR com o bloco de `schema/execution/PR_EXECUTION_TEMPLATE.md`.
- O `schema/CODEX_WORKFLOW.md` passou a exigir fechamento com handoff no formato `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.
- O `schema/CODEX_WORKFLOW.md` passou a bloquear excecao contratual sem autorizacao manual explicita do Vasques.
- O `schema/CODEX_WORKFLOW.md` passou a listar explicitamente os limites duros nao exceptuaveis.
- O `schema/CODEX_WORKFLOW.md` passou a travar formalmente os gates T0-T7/G0-G7 sem salto.
- O `schema/CODEX_WORKFLOW.md` passou a travar mistura de escopo e exigir checagem final Biblia + contrato ativo + handoff vivo antes de encerrar PR.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma mudanca de gate ou de proximo passo autorizado.

### Excecao contratual

- Excecao ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Proximo passo autorizado (inalterado)

- `PR-T0.1` / `T0-PR2` — inventario de fluxos e estados vivos.

### Leituras obrigatorias da proxima PR (reafirmadas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/execution/PR_EXECUTION_TEMPLATE.md`
6. `schema/handoffs/PR_HANDOFF_TEMPLATE.md`
7. `schema/CODEX_WORKFLOW.md`
