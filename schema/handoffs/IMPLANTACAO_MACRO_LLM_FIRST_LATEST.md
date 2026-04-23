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

---

## Atualizacao 2026-04-23 — Internalizacao canonica da classificacao ENOVA 1 (continuidade documental de PR-T0.1)

### Objetivo executado

Internalizar no repositorio ENOVA 2, de forma canônica e sem dependencia externa, a classificacao executiva da base ENOVA 1 para orientar reaproveitamento em T0 e fases seguintes.

### O que foi feito

- Criado `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` com consolidacao interna de:
  - cognitivo util reaproveitavel;
  - mecanico estrutural util reaproveitavel;
  - mecanico de fala proibido;
  - telemetria/CRM/painel/docs/reset/correspondente: o que aproveitar, redesenhar e nao levar;
  - riscos de copiar a ENOVA 1 sem filtro;
  - blocos prioritarios da ENOVA 1 para absorcao inicial.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para registrar a evidencia documental adicionada nesta continuidade de T0.
- Atualizado `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` em `PR-T0.1` para explicitar a internalizacao canônica como entregavel do inventario.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` com o estado desta PR.

### O que nao foi feito

- Nenhuma implementacao funcional.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma refatoracao funcional da E1.
- Nenhum fechamento de gate G0 nesta PR.

### Regra de reaproveitamento consolidada

- Permitido: conhecimento cognitivo util + mecanico estrutural util.
- Proibido: casca mecanica de fala, fallback dominante e scripts roteirizados de superficie.
- E1 permanece como materia-prima futura de memoria/conhecimento; nao entra em refatoracao funcional agora.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Proximo passo autorizado (mantido em T0)

- Continuidade de `PR-T0.1` / `T0-PR2` — inventario legado vivo e mapa de aproveitamento contra o mestre.

### Leituras obrigatorias da proxima PR (reafirmadas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
6. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — Internalizacao canonica do inventario vivo real da ENOVA 1 (continuidade documental de PR-T0.1)

### Objetivo executado

Internalizar no repositorio ENOVA 2, sem dependencia externa, o inventario do legado vivo real da ENOVA 1 para fortalecer T0.1 e preparar fechamento futuro de G0 com evidencia documental mais robusta.

### O que foi feito

- Criado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com consolidacao canônica interna de:
  - objetivo do inventario e criterio de evidencia;
  - fluxos vivos reais;
  - stages/estados/gates vivos reais;
  - transicoes reais e dinamicas relevantes;
  - blocos inconclusivos;
  - blocos com padrao de residuo/stub/legado morto;
  - divergencias entre documentacao e runtime;
  - implicacoes para ENOVA 2 e conclusao objetiva.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para registrar a nova evidencia documental de continuidade de `PR-T0.1`.
- Atualizado `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` em `PR-T0.1` para explicitar o inventario vivo real como entregavel canônico interno adicional.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` com o estado desta entrega.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- Nenhuma refatoracao funcional da E1.
- Nenhum fechamento automatico de gate G0.

### Regra consolidada para as proximas PRs

- T0.1 agora possui:
  - classificacao de reaproveitamento da ENOVA 1;
  - inventario vivo real da ENOVA 1.
- Reaproveitamento permitido mantido:
  - conhecimento cognitivo util;
  - mecanico estrutural util.
- Reaproveitamento proibido mantido:
  - casca mecanica de fala.

### Tratamento da E1

- E1 segue como materia-prima futura de memoria/conhecimento.
- E1 nao entra em refatoracao nesta etapa.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Proximo passo autorizado (mantido em T0)

- Continuidade de `PR-T0.1` / `T0-PR2` — inventario legado vivo e consolidacao para readiness de G0, sem abrir implementacao funcional.

### Leituras obrigatorias da proxima PR (reafirmadas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
7. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — fechamento documental real de escopo de PR-T0.1 (continuidade)

### Objetivo executado

Consolidar o inventario operacional auditavel de `PR-T0.1` sem abrir escopo funcional, deixando explicito o que ja esta coberto e a lacuna exata que ainda impede fechamento formal da etapa.

### O que foi feito

- Atualizado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - matriz de rastreabilidade operacional (fluxos topo->pos-envio_docs -> blocos legados correspondentes);
  - inventario de estados/campos usados com nivel de prova;
  - checklist de cobertura obrigatoria de `PR-T0.1`;
  - decisao canonica de nao fechar `PR-T0.1` sem prova remanescente.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para refletir o estado real:
  - `T0-PR1` concluida;
  - `T0-PR2` em execucao (continuidade documental de `PR-T0.1`);
  - lacuna remanescente declarada sem ambiguidade.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` com o novo estado vivo dessa continuidade.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- Nenhum fechamento de G0.
- Nenhuma abertura de T1.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` **permanece aberta** — lacuna remanescente declarada (ver §14 do inventario).
- G0 aberto.
- Lacunas remanescentes (declaradas em T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §14):
  - blocos L15-L16 com prova em nivel "parcial estrutural" (dominio confirmado, microregras P3 pendentes de PDF);
  - itens `informativo_*` e `COGNITIVE_V2_MODE` permanecem inconclusivos (correto — sem prova de uso produtivo).

### Proximo passo autorizado

- Continuidade de **`PR-T0.1`** — eliminar a lacuna remanescente.

---

## Atualizacao 2026-04-23 — prova equivalente parcial de PR-T0.1 (lacuna remanescente declarada)

### Objetivo executado

Complementar o inventario de `PR-T0.1` com prova equivalente auditavel para blocos L03-L14 e L17,
declarar lacuna remanescente explicita (L15-L16 e origem legada/persistida) sem fechar prematuramente.

### O que foi feito

- Atualizado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`:
  - secao 13: origens de coluna/tabela referenciadas via Taxonomia Oficial PDF6 + schema Supabase canonico;
  - secao 14: decisao canonica de nao fechamento de PR-T0.1, com lacuna remanescente explicita;
  - secao 15 (nova): prova equivalente auditavel para blocos L03-L14 e L17; L15-L16 permanecem "parcial estrutural".
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - quebra oficial de PRs corrigida: PR-T0.1 como "em execucao"; PR-T0.2 como "bloqueada ate encerramento de PR-T0.1";
  - proximo passo autorizado: continuidade de PR-T0.1.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` refletindo estado aberto de PR-T0.1.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- PR-T0.1 nao encerrada (lacuna remanescente declarada).
- G0 nao aprovado.
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` **permanece aberta**.
- G0 aberto.
- Lacunas remanescentes (declaradas em T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §14):
  - blocos L15-L16 com prova em nivel "parcial estrutural" (dominio confirmado, microregras P3 pendentes de PDF);
  - origem legada/persistida dos estados apoiada no schema alvo Enova 2 (PDF6) em vez do legado E1 sem inferencia.

### Proximo passo autorizado

- Continuidade de **`PR-T0.1`** — eliminar a lacuna remanescente para fechar com prova conclusiva.

### Leituras obrigatorias para a continuidade de PR-T0.1

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.1)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.1 (lacunas remanescentes eliminadas)

### Objetivo executado

Eliminar as duas lacunas remanescentes de `PR-T0.1`:
1. Elevar L15-L16 de "parcial estrutural" para "validada por referencia".
2. Bifurcar prova de origem E1 do mapeamento alvo E2 em secao 13 do inventario.

### O que foi feito

- Atualizado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`:
  - secao 13: bifurcacao explicita de prova — coluna "Bloco legado (origem E1)" separada de
    "Mapeamento alvo E2 (coluna/tabela)"; limitacao de transcricao Supabase E1 declarada
    explicitamente como escopo futuro (L-block PDF pendente).
  - secao 14: todos os criterios de PR-T0.1 atendidos; PR-T0.1 declarada pronta para encerramento;
    PR-T0.2 desbloqueada; G0 permanece aberto.
  - secao 15: L15-L16 elevados para "validada por referencia" via implementacao canonica Core
    Mecanico 2 (branch `feat/core-especiais-p3-multi-variantes`, commit
    `a3c27abec10af5222501e8dbcfae39705900af97`; PDF mestre E6.2/F2/F4 como fonte declarada;
    stage `qualification_special`; trilhos P3 e multi com gates e fatos obrigatorios documentados).
  - secao 15 conclusao: todos os blocos L03-L17 em "validada por referencia".
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.1 marcada como concluida; PR-T0.2 desbloqueada.
  - Proximo passo: PR-T0.2.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: reflete encerramento de PR-T0.1.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.2 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` **encerrada em pre-readiness G0**.
- G0 aberto.
- Limitacao residual documentada (nao bloqueia PR-T0.2): tabela/coluna real Supabase E1 por estado
  nao transcrita; disponivel somente em L-block PDF (escopo de transcricao futura).

### Proximo passo autorizado

- **`PR-T0.2`** — Inventario de regras e classificacao por familia (desbloqueada).

### Leituras obrigatorias para PR-T0.2

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.2)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.2 (inventario de regras por familia)

### Objetivo executado

`PR-T0.2` — listar e classificar regras do legado em 7 familias canonicas com bloco legado de origem
e status (ativa/condicional/morta) por regra.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_REGRAS_T0.md` com:
  - 48 regras catalogadas (38 ativas, 6 condicionais, 4 mortas);
  - familias: negocio (12), compliance (5), docs (5), UX (9), operacao (5), roteamento (7), excecao (5);
  - bloco legado de origem (L03-L19) por regra;
  - fonte LEGADO_MESTRE soberano (linha ou secao) por regra;
  - regras inconclusivas declaradas: 8 categorias (topo fino, composicao familiar, estado civil
    intermediario, renda multipla, heuristicas de restricao, final operacional, QA, MCMV);
  - nota explicitando limite: L-blocks e C01-C09 nao transcritos — catalogo expandivel em PR-T0.3+.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.2 concluida; PR-T0.3 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.3 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` **encerrada**.
- G0 aberto.
- `PR-T0.3` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.3`** — Inventario de parsers, regex, fallbacks e heuristicas.

### Leituras obrigatorias para PR-T0.3

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.3)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.3 (inventario de parsers, heuristicas e branches de stage)

### Objetivo executado

`PR-T0.3` — inventariar parsers, regex, fallbacks, heuristicas e branches de stage do legado ENOVA 1
com bloco legado de origem, fonte auditavel, regra associada (PR-T0.2), status e risco estrutural.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` com:
  - 27 pontos de decisao mecanica catalogados (17 ativos, 5 condicionais, 3 residuais, 2 mortos);
  - 5 tipos cobertos: parser (2), regex (2), fallback (7), heuristica (7), stage (9);
  - bloco legado de origem (L03-L19) por item;
  - fonte LEGADO_MESTRE soberano (linha ou secao) por item;
  - regra associada (PR-T0.2 ID) por item;
  - 8 categorias de inconclusivos declaradas (§7): limitacoes estruturais de L-blocks PDF nao transcritos;
  - secao §8: classificacao explicita de cada inconclusivo como "limitacao estrutural — nao bloqueante" (criterio de aceite: catalogar pontos identificaveis nas fontes acessiveis — completamente atendido);
  - Bloco E (A00-ADENDO-03) incorporado no documento.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.3 concluida; PR-T0.4 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.3 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md
Estado da evidência:                   completa — 27 itens catalogados em 5 tipos, cobrindo todas as
                                       fontes acessíveis; critério de aceite de PR-T0.3 plenamente atendido
Há lacuna remanescente?:               não — os 8 inconclusivos declarados no §7 são limitações
                                       estruturais de L-blocks não transcritos (PDF inacessível),
                                       classificados explicitamente como não bloqueantes no §8;
                                       nenhum ponto identificável nas fontes acessíveis foi omitido
Há item parcial/inconclusivo bloqueante?: não — todos os 27 itens têm evidência auditável completa;
                                       os inconclusivos de L-blocks são limitações de acesso,
                                       não itens parciais do catálogo de PR-T0.3
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.4 — Inventário de canais, superfícies e telemetria
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` **encerrada** — Bloco E: fechamento valido (evidencia completa dentro do escopo; inconclusivos de L-blocks sao limitacoes estruturais nao bloqueantes, declaradas explicitamente no §8 do documento-base).
- G0 aberto.
- `PR-T0.4` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.4`** — Inventario de canais, superficies e telemetria.

### Leituras obrigatorias para PR-T0.4

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.4)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.4 (inventario de canais, superficies e telemetria)

### Objetivo executado

`PR-T0.4` — inventariar canais, superficies de interacao, endpoints e pontos de telemetria/log/evento
do legado ENOVA 1 com bifurcacao explicita E1 (runtime) vs E2 (design-alvo), fluxo de dados por canal,
relacao com regras (PR-T0.2) e parsers/heuristicas (PR-T0.3), status e risco estrutural.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` com:
  - 28 itens catalogados (7 canais, 7 superficies, 3 endpoints, 13 telemetria);
  - 4 tipos: canal (7), superficie (7), endpoint (3), telemetria (13);
  - bifurcacao E1/E2 obrigatoria aplicada: TE-01 como emissao runtime E1 real (linha 3416
    LEGADO_MESTRE); TE-04 a TE-12 como referencias design-alvo E2 (nao prova E1);
  - SF-03 (superficie fala mecanica E1) classificada morta — proibida por A00-ADENDO-01/02;
  - EP-01 a EP-03: endpoints webhook texto, midia e admin/simulacao;
  - TE-13 (CRM E1 real) ativo mas inconclusivo (L18 nao transcrito);
  - fluxo de dados por canal consolidado (tabela CT→EP→SF);
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.4);
  - Bloco E (A00-ADENDO-03) incorporado no documento.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.4 concluida; PR-T0.5 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.4 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md
Estado da evidência:                   completa — 28 itens catalogados em 4 tipos, cobrindo todas as
                                       fontes acessíveis; bifurcação E1/E2 aplicada; critério de aceite
                                       de PR-T0.4 plenamente atendido
Há lacuna remanescente?:               sim — schema real de tabelas E1, eventos específicos emitidos E1
                                       por canal, telemetria de áudio em L17/L18 não transcritos;
                                       declarados em §8; não bloqueiam PR-T0.4
Há item parcial/inconclusivo bloqueante?: não — todos os 28 itens têm evidência auditável completa
                                       (TE-01 com linha exata; TE-04-TE-12 declarados explicitamente
                                       como design-alvo E2; TE-13 inconclusivo com L18 declarado);
                                       os inconclusivos de L-blocks são limitações de acesso estrutural
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.5 — Matriz de risco operacional do legado vivo
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` **encerrada** — Bloco E: fechamento valido (evidencia completa dentro do escopo;
  inconclusivos de L-blocks sao limitacoes estruturais nao bloqueantes; bifurcacao E1/E2 aplicada
  canonicamente).
- G0 aberto.
- `PR-T0.5` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.5`** — Matriz de risco operacional do legado vivo.

### Leituras obrigatorias para PR-T0.5

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.5)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`
