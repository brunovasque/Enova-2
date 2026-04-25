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

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.5 (matriz de risco operacional do legado vivo)

### Objetivo executado

`PR-T0.5` — produzir matriz de risco cruzando fluxos (PR-T0.1), regras (PR-T0.2),
parsers/heuristicas (PR-T0.3) e canais/superficies/telemetria (PR-T0.4), classificando
o impacto operacional de cada risco por severidade, probabilidade, evidencia e mitigacao sugerida.

### O que foi feito

- Criado `schema/implantation/MATRIZ_RISCO_T0.md` com:
  - 26 riscos catalogados em 5 categorias (elegibilidade, tom/fala, docs, telemetria, estrutural);
  - 3 criticos: RZ-TM-01 (casca mecanica de fala — proibida A00-ADENDO-01/02), RZ-TE-02 (schema
    E1 desconhecido), RZ-ES-04 (abertura de T1 sem G0);
  - 14 altos: parsers/regex sem criterio (RZ-EL-01/04), offtrackGuard (RZ-EL-02), isModoFamiliar
    (RZ-EL-03), fallback default_path (RZ-TM-02), needs_confirmation (RZ-TM-03), correspondente
    orphan (RZ-DC-01), keepStage sem timeout (RZ-DC-02), emitter console.log (RZ-TE-01), CRM E1
    (RZ-TE-03), L-blocks (RZ-ES-01), fallback sem criterio de desligamento (RZ-ES-02), namespace
    E1/E2 (RZ-ES-03), fechamento sem prova (RZ-ES-05);
  - 9 medios: scoring cognitivo (RZ-EL-07/08), alias fim_inelegivel (RZ-EL-05), stubs yesNoStages
    (RZ-EL-06), renda multipla (RZ-TM-04), roteamento docs (RZ-DC-03), site sem doc (RZ-DC-04),
    artefatos (RZ-DC-05), audio telemetria (RZ-TE-04), turn.fallback_used (RZ-TE-05);
  - referencia cruzada auditavel com PR-T0.1 a PR-T0.4 por item;
  - 7 bloqueantes para G0 declarados na tabela de sintese;
  - 7 categorias de inconclusivos declaradas (L-blocks nao transcritos; nao bloqueiam PR-T0.5);
  - Bloco E (A00-ADENDO-03) incorporado no documento.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.5 concluida; PR-T0.6 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma mitigacao implementada (fora do escopo de PR-T0.5).
- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.5 e PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/MATRIZ_RISCO_T0.md
Estado da evidência:                   completa — 26 riscos catalogados em 5 categorias,
                                       cobrindo todas as fontes acessíveis; referência cruzada
                                       com PR-T0.1 a PR-T0.4; critério de aceite de PR-T0.5
                                       (Bíblia §PR-T0.5) plenamente atendido
Há lacuna remanescente?:               sim — riscos de L-blocks não transcritos (L04, L07-L14,
                                       L17, L18) declarados em §Inconclusivos; não bloqueiam
                                       PR-T0.5 (mesmo critério PR-T0.2/T0.3/T0.4)
Há item parcial/inconclusivo bloqueante?: não — todos os 26 riscos têm evidência auditável
                                       nos inventários anteriores; inconclusivos de L-blocks são
                                       limitações estruturais de acesso
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.6 — Inventário de desligamento futuro e convivência
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` encerrada.
- `PR-T0.5` **encerrada** — Bloco E: fechamento valido (evidencia completa dentro do escopo;
  inconclusivos de L-blocks sao limitacoes estruturais nao bloqueantes; soberania LLM-first
  verificada; 7 bloqueantes para G0 declarados canonicamente).
- G0 aberto.
- `PR-T0.6` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.6`** — Inventario de desligamento futuro e convivencia.

### Leituras obrigatorias para PR-T0.6

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.6)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
10. `schema/implantation/MATRIZ_RISCO_T0.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
13. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
14. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.6 (inventario de desligamento futuro e convivencia)

### Objetivo executado

`PR-T0.6` — classificar cada peca do legado E1 em ordem de desligamento futuro: o que sai primeiro,
o que convive durante migracao (shadow/canary), o que deve ser redesenhado antes de migrar, e o que
se transforma em conhecimento/politica na E2. Definir criterios de desligamento canonicos.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` com:
  - 39 itens em 5 classificacoes: 7 DI (desligar imediato pre-T1), 5 RO (redesenho obrigatorio),
    6 CT (convivencia temporaria shadow/canary), 14 MD (migrar e desligar), 7 RC (reaproveitamento);
  - DS-DI-01 a DS-DI-07: SF-03, PH-F05, RM-01, RM-02, fim_inelegivel, yesNoStages-stubs, RU-06
    classificados como imediatos/proibidos (pre-T1) — proibidos por A00-ADENDO-01/02;
  - 7 criterios de desligamento canonicos (CDC-01 a CDC-07): turn.fallback_used=0, cobertura stages,
    smoke idempotencia, trilha CRM equivalente, emitter persistente, RNM transcrito, policy rules;
  - mapa de dependencias de fallback (EP/CT → SF-02 → SF-01 → PH-F03 → CDC-01 last);
  - referencia cruzada com MATRIZ_RISCO (RZ-xx) por item onde aplicavel;
  - 7 categorias de inconclusivos declaradas (L17/L18 — nao bloqueiam PR-T0.6);
  - Bloco E (A00-ADENDO-03) incorporado.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.6 concluida; PR-T0.R desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhum desligamento implementado (fora do escopo de PR-T0.6).
- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md
Estado da evidência:                   completa — 39 itens em 5 classificações, cobrindo todo
                                       o inventário mapeado em PR-T0.1 a PR-T0.4; critério de
                                       aceite de PR-T0.6 (Bíblia §PR-T0.6) plenamente atendido
Há lacuna remanescente?:               sim — schema real E1 de tabelas Supabase, CRM E1 e
                                       telemetria de áudio em L17/L18 não transcritos impedem
                                       definição completa de critérios CDC para TE-07 a TE-13
                                       e DS-MD-12; declarados em §Inconclusivos; não bloqueiam
Há item parcial/inconclusivo bloqueante?: não — todos os 39 itens têm evidência auditável nos
                                       inventários anteriores (PR-T0.1 a PR-T0.5)
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.R — Readiness e closeout do gate G0
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` encerrada.
- `PR-T0.5` encerrada.
- `PR-T0.6` **encerrada** — Bloco E: fechamento valido; soberania LLM-first verificada;
  criterios CDC canonicos definidos; mapa de dependencias de fallback publicado.
- G0 aberto.
- `PR-T0.R` desbloqueada — todos os 6 inventarios T0 publicados.

### Proximo passo autorizado

- **`PR-T0.R`** — Readiness e closeout do gate G0.

### Leituras obrigatorias para PR-T0.R

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.R)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
10. `schema/implantation/MATRIZ_RISCO_T0.md`
11. `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
13. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
14. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
15. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.R (readiness e closeout do gate G0)

### Objetivo executado

`PR-T0.R` — validar completude da fase T0 com smoke documental de todos os 6 inventarios,
decidir formalmente sobre G0, encerrar o contrato T0 e criar skeleton de T1.

### O que foi feito

- Criado `schema/implantation/READINESS_G0.md` com:
  - smoke documental de PR-T0.1 a PR-T0.6: 6/6 encerrados com Bloco E valido;
  - verificacao de 6/6 criterios de aceite de T0: todos cumpridos;
  - analise dos 7 bloqueantes para G0: RZ-TM-01 e RZ-ES-04 satisfeitos com evidencia;
    RZ-EL-01, RZ-EL-04, RZ-DC-02, RZ-TE-02, RZ-TE-03 declarados com escopo T1+;
  - verificacao de coerencia entre todos os 6 inventarios: referencias cruzadas validas;
  - 5 limitacoes residuais estruturais declaradas (L-blocks, keepStage, schema E1) — escopo T1+;
  - decisao formal G0 APROVADO COM LIMITACOES RESIDUAIS FORMALMENTE DECLARADAS;
  - encerramento de contrato conforme CONTRACT_CLOSEOUT_PROTOCOL;
  - Bloco E (A00-ADENDO-03) incorporado.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - status `encerrado`; PR-T0.R marcada como concluida; T1 autorizada.
- Copiou contrato T0 para `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (skeleton — sem corpo).
- Atualizou `schema/contracts/_INDEX.md`:
  - T0 encerrado/arquivado; T1 skeleton como proximo contrato ativo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` e este handoff.

### O que nao foi feito

- Nenhuma implementacao de T1 (skeleton apenas; corpo sera preenchido em PR-T1.0).
- Nenhum desligamento implementado.
- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G0.md +
                                        PR-T0.1 a PR-T0.6 (inventários seção 1 do READINESS_G0)
Estado da evidência:                   completa — smoke documental de todos os 6 inventários
                                        realizado; 6/6 critérios de aceite T0 verificados;
                                        7 bloqueantes G0 analisados com resolução declarada
Há lacuna remanescente?:               sim — 5 limitações residuais estruturais declaradas
                                        (L17/L18, L04, L11, keepStage, schema E1); TODAS com
                                        escopo T1+ e NÃO bloqueantes para gate documental T0
Há item parcial/inconclusivo bloqueante?: não — nenhum critério de aceite T0 ficou parcial;
                                        inconclusivos são de transcrição PDF (fora do escopo T0)
                                        ou de implementação futura (escopo T1+)
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T0 encerrada; G0 aprovado; T1 autorizada
Próxima PR autorizada:                 PR-T1.0 — abertura formal da fase T1
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` encerrada.
- `PR-T0.5` encerrada.
- `PR-T0.6` encerrada.
- `PR-T0.R` **encerrada** — G0 APROVADO — contrato T0 ENCERRADO — T1 AUTORIZADA.
- G0 APROVADO em 2026-04-23.
- T0 arquivado.
- T1 skeleton ativo — aguardando PR-T1.0.

### Proximo passo autorizado

- **`PR-T1.0`** — Abertura formal da fase T1 (preenchimento do corpo do contrato T1).

### Leituras obrigatorias para PR-T1.0

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T1.0)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`
5. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
6. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
7. `schema/implantation/READINESS_G0.md`
8. `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`
9. `schema/implantation/MATRIZ_RISCO_T0.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — abertura formal do contrato T1 (PR-T1.0)

### Objetivo executado

`PR-T1.0` — preencher formalmente o corpo do contrato T1 conforme CONTRACT_SCHEMA.md,
declarar objetivo, escopo, critérios de aceite, quebra de PRs e gate G1.

### O que foi feito

- Preencheu corpo completo de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - objetivo: transformar conhecimento da Enova em contrato operacional claro para o LLM;
  - escopo: 5 dimensões (identidade, tom/regra, comportamentos, saída, bateria adversarial);
  - fora de escopo: prompt real, schema Supabase, policy engine, orquestrador, runtime;
  - dependências e entradas: G0 aprovado + 6 inventários T0 encerrados;
  - saídas: 7 artefatos T1 definidos (T1.0–T1.R) com arquivos e PRs;
  - critérios de aceite: 13 critérios incluindo soberania LLM-first, bateria adversarial,
    nenhuma fala mecânica, rollback de "resposta bonita mas operacionalmente frouxa";
  - provas obrigatórias: Bloco E por PR, bateria 10+ casos, 20–30 casos consistência;
  - quebra de PRs: PR-T1.0 concluída; PR-T1.1 desbloqueada; PR-T1.2–T1.R bloqueadas;
  - gate G1: condições de aprovação e regra de rollback explícitas;
  - legados aplicáveis: L03 e L19 obrigatórios; L04–L18 complementares por segmento;
  - 20 referências obrigatórias listadas;
  - ordem mínima de leitura: L19 → L03.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto formalmente; PR-T1.1 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhum entregável técnico de T1 (PR-T1.1 a PR-T1.R — aguardam prompts específicos).
- Nenhuma implementação de LLM real, prompt, taxonomia ou políticas.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Estado da evidência:                   completa — contrato T1 preenchido conforme CONTRACT_SCHEMA.md
                                        com todas as 16 seções obrigatórias; quebra de PRs definida;
                                        gate G1 explícito; legados aplicáveis declarados
Há lacuna remanescente?:               não — PR-T1.0 é de abertura de contrato (governança),
                                        não de inventário ou prova técnica; escopo cumprido
                                        integralmente
Há item parcial/inconclusivo bloqueante?: não — contrato T1 atende CONTRACT_SCHEMA.md;
                                        nenhuma seção omitida; critérios de aceite verificáveis
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         contrato T1 aberto formalmente; PR-T1.1 desbloqueada
Próxima PR autorizada:                 PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório
```

### Estado atual pos-encerramento

- Fase macro: T1 — contrato aberto formalmente.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.5 + PR-T1.R.
- `PR-T1.0` **encerrada**.
- `PR-T1.1` desbloqueada.
- `PR-T1.2–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.1`** — Separação canônica: tom × regra × veto × sugestão × repertório.

### Leituras obrigatorias para PR-T1.1

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + legados L19 → L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T1.1)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/INVENTARIO_REGRAS_T0.md`
7. `schema/implantation/READINESS_G0.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — separacao canonica das 5 camadas do agente (PR-T1.1)

### Objetivo executado

`PR-T1.1` — Criar `schema/implantation/T1_CAMADAS_CANONICAS.md` separando as 5 dimensões canônicas
do agente (TOM / REGRA / VETO / SUGESTÃO MANDATÓRIA / REPERTÓRIO), classificando as 48 regras T0
e protegendo a soberania de fala do LLM.

### O que foi feito

- Criado `schema/implantation/T1_CAMADAS_CANONICAS.md` com:
  - fundamento normativo canônico: soberania LLM na fala; soberania mecânico na regra e decisão
    operacional; nenhuma camada pode cruzar essa fronteira;
  - mapa de responsabilidades por camada (proprietário, competência, o que pertence, o que é proibido);
  - definições completas das 5 camadas:
    - **TOM**: LLM soberano — orienta estilo, energia, profundidade, jamais prescreve palavras;
    - **REGRA**: mecânico soberano — obrigações operacionais (coletar, verificar, rotear), recebida
      pelo LLM como contexto estruturado; nunca fala ao cliente diretamente;
    - **VETO**: mecânico emite flag de bloqueio; LLM comunica a negação naturalmente; nunca vira
      template de resposta;
    - **SUGESTÃO MANDATÓRIA**: mecânico instrui "você DEVE sugerir X neste contexto"; LLM decide
      as palavras; não força texto nem substitui raciocínio;
    - **REPERTÓRIO**: substrato de conhecimento disponível passivamente ao LLM (L19, L03, casos
      históricos); informa sem roteirizar;
  - anti-padrões e travas LLM-first por camada;
  - modelo de interação ASCII (MECÂNICO→contexto estruturado→LLM→reply_text→CANAL);
  - classificação completa das 48 regras T0 com camada primária e secundária;
  - sumário de distribuição: TOM 3, REGRA 28, VETO 8, SUGESTÃO MANDATÓRIA 8, REPERTÓRIO L19+L03;
  - cobertura das microetapas do LEGADO_MESTRE verificada;
  - Bloco E com fechamento permitido.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - PR-T1.1 marcada como concluída; PR-T1.2 desbloqueada.
- Atualizado `schema/contracts/_INDEX.md`:
  - PR-T1.2 como PR atual e próximo passo; sincronização 2026-04-23 registrada.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`:
  - ultima tarefa PR-T1.1; próximo passo PR-T1.2; histórico PR-T1.0 preservado.

### O que nao foi feito

- System prompt não criado (PR-T1.2).
- Taxonomia oficial não criada (PR-T1.3).
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).
- Nenhum LLM real ativado.
- Nenhuma mudança de gate.

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.1
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         5 camadas definidas; 48 regras T0 classificadas; travas
                                       LLM-first sem exceção; soberania de fala do LLM protegida
Estado da evidência:                   completa — T1_CAMADAS_CANONICAS.md gerado com cobertura
                                       total das regras T0 e das microetapas do LEGADO_MESTRE
Há lacuna remanescente?:               não — L04–L17 não transcritos de PDF mas não necessários
                                       para separação de princípio; classificação feita via
                                       INVENTARIO_REGRAS_T0 (fonte canônica dos 48 itens)
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_CAMADAS_CANONICAS.md criado; PR-T1.1 encerrada;
                                       PR-T1.2 desbloqueada
Próxima PR autorizada:                 PR-T1.2 — System prompt canônico em camadas
```

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.2–T1.5 + PR-T1.R.
- `PR-T1.1` **encerrada**.
- `PR-T1.2` **desbloqueada**.
- `PR-T1.3–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.2`** — System prompt canônico em camadas (sem ambiguidade central).

### Leituras obrigatorias para PR-T1.2

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.2)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md` (obrigatório — base desta PR)
5. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
6. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — system prompt canonico em camadas (PR-T1.2)

### Objetivo executado

`PR-T1.2` — Criar `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com o system prompt
da Enova 2 estruturado em camadas, orientando identidade, limites e raciocínio do LLM sem
scripts, templates ou fala mecânica.

### O que foi feito

- Criado `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com:
  - §1 Identidade (TOM): "Ana", analista especialista MCMV, fala humana, adapta tom ao momento;
  - §2 Papel operacional (REGRA): como o LLM recebe contexto estruturado do mecânico (objetivo,
    restrições, pendências, flags) sem expô-lo ao cliente;
  - §3 Proibições absolutas (VETO): 5 proibições declarativas — aprovação, avanço sem fatos,
    contradição não reconciliada, linguagem de sistema, exposição da mecânica interna;
  - §4 Condução em contextos (SUGESTÃO MANDATÓRIA): 7 orientações de raciocínio — ambiguidade,
    offtrack, renda baixa, autônomo sem IR, CTPS curto, insistência em valores, dado contradito;
  - §5 Conhecimento especialista (REPERTÓRIO): substrato MCMV como competência intrínseca, sem
    template de uso;
  - §6 Objetivo final: qualificar leads com inteligência, honestidade e naturalidade;
  - Tabela de conformidade seção×camada verificada; 7 anti-padrões proibidos;
    6 cenários adversariais documentados; cobertura de microetapas do mestre verificada;
  - Bloco E: fechamento permitido; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.2 concluída; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.3 como PR atual e próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.2; próximo passo PR-T1.3.

### O que nao foi feito

- Taxonomia oficial não criada (PR-T1.3).
- Contrato de saída não criado (PR-T1.4).
- Comportamentos canônicos não criados (PR-T1.5).
- Prompt não carregado em runtime (correto — escopo de T3/T4).
- Nenhum LLM real ativado.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.2
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         prompt v1 em 6 seções cobrindo as 5 camadas; identidade,
                                       limites e objetivos cobertos; remetendo às camadas via
                                       tabela de conformidade; bateria adversarial mínima
                                       documentada sem execução de LLM real
Estado da evidência:                   completa — T1_SYSTEM_PROMPT_CANONICO.md v1 gerado com
                                       estrutura em camadas, anti-padrões proibidos, cenários
                                       adversariais, conformidade com T1_CAMADAS_CANONICAS verificada
Há lacuna remanescente?:               não — prompt cobre identidade, limites, objetivos e
                                       remete às camadas; não está em runtime (correto);
                                       taxonomia/contrato de saída são escopo de T1.3/T1.4
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_SYSTEM_PROMPT_CANONICO.md v1 publicado; PR-T1.2
                                       encerrada; PR-T1.3 desbloqueada
Próxima PR autorizada:                 PR-T1.3 — Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações)
```

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.3–T1.5 + PR-T1.R.
- `PR-T1.2` **encerrada**.
- `PR-T1.3` **desbloqueada**.
- `PR-T1.4–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.3`** — Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações).

### Leituras obrigatorias para PR-T1.3

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.3)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` (obrigatório — base desta PR)
6. `schema/implantation/INVENTARIO_REGRAS_T0.md`
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — taxonomia oficial do agente (PR-T1.3)

### Objetivo executado

`PR-T1.3` — Criar `schema/implantation/T1_TAXONOMIA_OFICIAL.md` definindo a taxonomia canônica
de facts, objetivos, pendências, conflitos, riscos e ações — organizando o raciocínio do agente
sem escrever fala, amarrada aos 48 itens do inventário T0.

### O que foi feito

- Criado `schema/implantation/T1_TAXONOMIA_OFICIAL.md` com:
  - §1 Finalidade e princípio canônico: "A taxonomia organiza o raciocínio — ela nunca escreve a fala";
  - §2 Tabela de uso: 6 categorias × quem produz / consome / não pode conter;
  - §3 FACTS (18 tipos em 8 grupos):
    - F1 Perfil pessoal: estado civil, nationality, rnm_status, dependente;
    - F2 Regime/renda P1: work_regime_p1, monthly_income_p1, autonomo_has_ir_p1, ctps_36m_p1;
    - F3 Processo/composição: processo, p3_required;
    - F4 P2: work_regime_p2, monthly_income_p2, autonomo_has_ir_p2;
    - F5 P3: work_regime_p3;
    - F6 Elegibilidade: credit_restriction, restriction_regularization_status;
    - F7 Documentação: doc_identity/income/residence/ctps/channel;
    - F8 Operacional: visit_interest;
  - §4 OBJETIVOS (9): OBJ_COLETAR, OBJ_CONFIRMAR, OBJ_SUGERIR_COMPOSICAO, OBJ_ORIENTAR_IR,
    OBJ_INFORMAR_CTPS, OBJ_RETORNAR_AO_TRILHO, OBJ_AVANÇAR_STAGE, OBJ_PREPARAR_DOCS, OBJ_HANDOFF;
  - §5 PENDÊNCIAS (6): PEND_SLOT_VAZIO, PEND_CONFIRMACAO, PEND_DOCUMENTO, PEND_P2_SLOT,
    PEND_P3_SLOT, PEND_RNM;
  - §6 CONFLITOS (4): CONF_DADO_CONTRADITO, CONF_COMPOSICAO, CONF_PROCESSO, CONF_RENDA;
  - §7 RISCOS (8 em 5 severidades): BLOQUEANTE (inelegibilidade restrição/RNM), ORIENTATIVO
    (renda baixa, IR autônomo, CTPS curto), VETO (promessa), INFORMATIVO (offtrack),
    OPERACIONAL (dados conflitantes);
  - §8 AÇÕES (11): ACAO_AVANÇAR_STAGE, ACAO_ROTEAR_SPECIAL/DOCS/AGUARDANDO, ACAO_FORCAR_CONJUNTO,
    ACAO_SINALIZAR_CONFLITO, ACAO_INELEGIBILIDADE, ACAO_KEEPSTAGE, ACAO_HANDOFF,
    ACAO_BYPASS_MANUAL, ACAO_ROLLBACK_FLAG;
  - §9 Tabela completa: 48 regras T0 → categorias de taxonomia (cobertura total);
  - §10 Resumo de contagem por categoria;
  - §11 O que esta taxonomia NÃO é (não é schema Supabase, não é contrato de saída, não é policy
    engine, não é roteiro);
  - §12 Cobertura de microetapas do mestre (7/7 verificadas);
  - Bloco E: fechamento permitido; PR-T1.4 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.3 concluída; PR-T1.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.4 como PR atual e próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.3; próximo passo PR-T1.4.

### O que nao foi feito

- Contrato de saída não criado (PR-T1.4).
- Comportamentos canônicos não criados (PR-T1.5).
- Taxonomia não carregada em runtime (correto — escopo T3/T4).
- Nenhum LLM real ativado.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.3
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         6 categorias definidas; 48 regras T0 mapeadas; nenhum
                                       campo redige fala; princípio "taxonomia organiza raciocínio"
                                       declarado e verificado em todos os tipos
Estado da evidência:                   completa — T1_TAXONOMIA_OFICIAL.md gerado com 56 tipos
                                       canônicos; cobertura total das regras T0; trava LLM-first
                                       verificada; microetapas do mestre cobertas 7/7
Há lacuna remanescente?:               não — taxonomia cobre o escopo completo de PR-T1.3;
                                       campos de saída estruturada (reply_text, schema) são
                                       escopo de PR-T1.4 (contrato de saída)
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_TAXONOMIA_OFICIAL.md publicado; PR-T1.3 encerrada;
                                       PR-T1.4 desbloqueada
Próxima PR autorizada:                 PR-T1.4 — Contrato de saída do agente
```

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.4–T1.5 + PR-T1.R.
- `PR-T1.3` **encerrada**.
- `PR-T1.4` **desbloqueada**.
- `PR-T1.5–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.4`** — Contrato de saída do agente (reply_text + facts + objetivo + flags + bloqueios).

### Leituras obrigatorias para PR-T1.4

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.4)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md`
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (obrigatório — base desta PR)
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — contrato de saida do agente (PR-T1.4)

### Objetivo executado

`PR-T1.4` — Criar `schema/implantation/T1_CONTRATO_SAIDA.md` definindo a interface conceitual
de saída estruturada do agente ENOVA 2 por turno — campos, semântica, responsabilidade e travas
LLM-first. Sem implementação de runtime, sem schema Supabase, sem policy engine.

### O que foi feito

- Criado `schema/implantation/T1_CONTRATO_SAIDA.md` com:
  - Princípio canônico: `reply_text` é sempre e exclusivamente do LLM; demais campos são
    estruturais — organizam estado e decisão, nunca falam com o cliente;
  - §1 Tabela de soberania: 13 campos × soberano × trava canônica;
  - §2 Shape descritivo completo (TurnoSaida + sub-shapes FactsUpdated, Objective, Pending,
    Conflict, Risk, Action, Block, Confidence, Flags);
  - §3 Semântica completa de cada campo:
    - `reply_text` — LLM soberano — texto ao cliente;
    - `turn_id` / `case_id` — identidade do turno/case;
    - `facts_updated` — F1–F8 da taxonomia; source + confirmed flag;
    - `next_objective` — OBJ_* da taxonomia; mecânico declara; LLM conduz;
    - `pending` — PEND_* da taxonomia; slots obrigatórios ausentes;
    - `conflicts` — CONF_* da taxonomia; implica needs_confirmation=true;
    - `risks` — RISCO_* da taxonomia com severidade;
    - `actions_executed` — ACAO_* da taxonomia; mecânico executa;
    - `blocks` — bloqueios semânticos internos;
    - `needs_confirmation` — flag obrigatória (boolean);
    - `confidence` — único campo de meta-avaliação do LLM (high/medium/low);
    - `flags` — sinais operacionais (bypass_manual, rollback_flag, offtrack);
  - §4 Tabela resumo: campos × responsável × proibição absoluta;
  - §5 Amarração completa à T1_TAXONOMIA_OFICIAL por seção;
  - §6 8 invariantes de consistência interna (I-01 a I-08);
  - §7 6 cenários sintéticos de validação:
    - C1: lead CLT básico — coleta limpa sem pendências;
    - C2: lead autônomo sem IR — risco orientativo + objetivo de orientação;
    - C3: lead casado civil — ACAO_FORCAR_CONJUNTO + coleta P2;
    - C4: restrição de crédito bloqueante — inelegibilidade;
    - C5: conflito de dado contradito — needs_confirmation=true + OBJ_CONFIRMAR;
    - C6: lead offtrack — RISCO_OFFTRACK + OBJ_RETORNAR_AO_TRILHO;
  - §8 Ciclo de vida do contrato por turno (canal-agnóstico);
  - §9 O que este contrato NÃO é (não é schema Supabase, não é runtime, não é policy
    engine, não é template, não é system prompt);
  - §10 Cobertura de microetapas do mestre (8/8 verificadas);
  - Bloco E: fechamento permitido; PR-T1.5 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.4 concluída; PR-T1.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.5 como próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.4; próximo passo PR-T1.5.

### O que nao foi feito

- Comportamentos canônicos e proibições não criados (PR-T1.5).
- Schema Supabase não definido (escopo T2).
- Policy engine não criado (escopo T3).
- Parser/serializer de runtime não implementado (escopo T4).
- Nenhum LLM real ativado.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.4
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         13 campos canônicos definidos; reply_text soberano do
                                       LLM verificado; shape descritivo completo; 8 invariantes
                                       de consistência; 6 cenários sintéticos (>5 exigidos);
                                       amarração completa à taxonomia T1.3; cobertura das
                                       microetapas do mestre 8/8
Estado da evidência:                   completa — T1_CONTRATO_SAIDA.md gerado com todos os
                                       campos exigidos pelo mestre; invariantes declaradas;
                                       cenários sintéticos validam conformidade de cada campo;
                                       nenhum campo estrutural contém fala ao cliente
Há lacuna remanescente?:               não — schema Supabase é escopo T2; policy engine é
                                       escopo T3; serialização runtime é escopo T4 (todos
                                       corretamente fora do escopo desta PR)
Há item parcial/inconclusivo bloqueante?: não — todos os 13 campos têm definição canônica
                                       completa com semântica, responsável, trava LLM-first
                                       e amarração à taxonomia
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_CONTRATO_SAIDA.md publicado; PR-T1.4 encerrada;
                                       PR-T1.5 desbloqueada
Próxima PR autorizada:                 PR-T1.5 — Comportamentos canônicos e proibições
```

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.R.
- `PR-T1.4` **encerrada**.
- `PR-T1.5` **encerrada**.
- `PR-T1.R` **desbloqueada**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.5`** — Comportamentos canônicos e proibições.

### Leituras obrigatorias para PR-T1.5

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.5)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md`
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md`
7. `schema/implantation/T1_CONTRATO_SAIDA.md` (obrigatório — base desta PR)
8. `schema/implantation/INVENTARIO_REGRAS_T0.md`
9. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
10. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
13. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
14. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — comportamentos canonicos e proibicoes (PR-T1.5)

### Objetivo executado

`PR-T1.5` — Criar `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` definindo os
comportamentos obrigatórios, proibições absolutas e padrões de condução do agente ENOVA 2.
Sem implementação de runtime, sem LLM real, sem policy engine, sem template ou script.

### O que foi feito

- Criou `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` com:
  - §1 Princípio de leitura: comportamento = conduta, nunca script; proibição = veto, nunca template;
  - §2 15 comportamentos obrigatórios (C-01..C-15): direção no turno, conflito→needs_confirmation,
    coleta de fatos, off-track→retornar objetivo, risco→registrar, bloqueio→comunicar naturalmente,
    dado contradito→reconciliar, objeção→acolher com substância, renda solo→composição,
    autônomo sem IR→orientar, CTPS→valor estratégico sem bloquear, inelegibilidade→comunicar+alternativa,
    confidence low→continuar, insistência→não ceder, processo conjunto→coletar P2 naturalmente;
  - §3 13 proibições absolutas (V-01..V-13): prometer aprovação/parcela/taxa/subsídio/imóvel,
    avançar sem facts obrigatórios, descartar fato confirmado sem reconciliação, reply_text mecânico,
    template ou script por stage, fallback textual estático, expor mecânica interna, encerrar sem
    alternativa quando há alternativa, coletar dado desnecessário, ignorar conflito e avançar, expandir E1;
  - §4 8 padrões de condução (dúvida, objeção, conflito de informação, risco identificado,
    bloqueio declarado, lead off-track, insistência em valor/taxa/aprovação, áudio ruim);
  - §5 12 cenários adversariais: ambiguidade pura, contradição de fato confirmado, prolixo,
    evasivo, insistência em preço, insistência em aprovação, lead testa limites, documentação
    parcial, inelegibilidade implícita, questionamento de dado anterior, pergunta técnica sobre
    processo interno, mudança de posição após confirmação;
  - §6.1 Amarração às 5 camadas: TOM/REGRA/VETO/SUGESTÃO MANDATÓRIA/REPERTÓRIO × comportamentos e proibições;
  - §6.2 Amarração aos 13 campos de saída: reply_text, facts_updated, next_objective, conflicts,
    risks, blocks, needs_confirmation, confidence, pending, actions_executed, flags.offtrack, flags.bypass_manual;
  - §7 9 anti-padrões comportamentais proibidos;
  - §8 Cobertura dos critérios do mestre verificada;
  - Bloco E: fechamento permitido; PR-T1.R desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.5 concluída; PR-T1.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.R como próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.5; próximo passo PR-T1.R.

### O que nao foi feito

- Readiness G1 não criado (PR-T1.R).
- LLM real não implementado.
- Runtime não alterado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.5
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         15 comportamentos obrigatórios; 13 proibições absolutas;
                                       8 padrões de condução; 12 cenários adversariais;
                                       amarração completa às 5 camadas e 13 campos de saída;
                                       soberania LLM-first reforçada em todas as seções;
                                       9 anti-padrões comportamentais documentados
Lacuna remanescente:                   nenhuma — bateria adversarial cobre os 6 cenários
                                       obrigatórios do mestre (ambiguidade, contradição,
                                       prolixo, evasivo, áudio ruim, insistência em preço);
                                       amarração às camadas e ao contrato de saída completa
Há item parcial bloqueante?:           não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_COMPORTAMENTOS_E_PROIBICOES.md publicado;
                                       PR-T1.5 encerrada; PR-T1.R desbloqueada
Próxima PR autorizada:                 PR-T1.R — Readiness e closeout do gate G1
```

### Estado atual do repositorio (pós PR-T1.5)

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.R.
- `PR-T1.5` **encerrada**.
- `PR-T1.R` **desbloqueada**.
- Runtime: inalterado.

### Proximo passo autorizado (pós PR-T1.5)

- **`PR-T1.R`** — Readiness e closeout do gate G1.

### Leituras obrigatorias para PR-T1.R

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L18 para bateria adversarial)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.R)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
5. Todos os artefatos T1: T1_CAMADAS_CANONICAS, T1_SYSTEM_PROMPT_CANONICO, T1_TAXONOMIA_OFICIAL,
   T1_CONTRATO_SAIDA, T1_COMPORTAMENTOS_E_PROIBICOES (smoke documental)
6. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
7. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — readiness G1 e closeout do contrato T1 (PR-T1.R)

### Objetivo executado

`PR-T1.R` — Smoke documental de PR-T1.0 a PR-T1.5; validação de coerência entre artefatos;
decisão formal G1; criação de READINESS_G1.md; closeout contrato T1; skeleton T2.

### O que foi feito

- Criou `schema/implantation/READINESS_G1.md` com:
  - Smoke documental de PR-T1.0 a PR-T1.5: 6/6 PASS com evidências por artefato;
  - Verificação dos 12/12 critérios de aceite do contrato T1 com evidência por critério;
  - Validação de coerência em 5 dimensões: camadas↔system prompt, taxonomia↔contrato de saída,
    comportamentos↔contrato de saída, comportamentos↔camadas, regras T0↔taxonomia↔camadas;
  - Verificação de adendos A00-ADENDO-01/02/03 em todos os artefatos T1 (tabela §2.6);
  - 4 lacunas identificadas e classificadas como não bloqueantes com justificativa;
  - 3 casos sintéticos cobrindo 3 dimensões: estilo/regra/saída (§5);
  - Decisão formal G1 APROVADO (§6.4) — T2 AUTORIZADA;
  - Bloco E: fechamento permitido; PR-T2.0 desbloqueada.
- Encerrou contrato T1 formalmente via CONTRACT_CLOSEOUT_PROTOCOL.md:
  - Bloco ENCERRAMENTO DE CONTRATO preenchido no contrato ativo;
  - Checklist completo — 12/12 critérios de aceite individualmente marcados como cumpridos;
  - Evidências declaradas: PR #83..#88, diffs em schema/implantation/.
- Arquivou contrato T1 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`.
- Atualizou status do contrato ativo para **ENCERRADO — G1 APROVADO**.
- Criou skeleton T2 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`:
  - Microetapas do mestre (seção T2) listadas;
  - Escopo previsto;
  - Fora de escopo;
  - Próximo passo: PR-T2.0 com leituras obrigatórias.
- Atualizou `schema/contracts/_INDEX.md`: T1 encerrado/arquivado; T2 skeleton ativo; PR-T2.0 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: fase T2; G1 APROVADO; PR-T2.0 próximo passo.

### O que nao foi feito

- T2 não aberto com corpo completo (skeleton criado — PR-T2.0 preencherá).
- LLM real não implementado.
- Schema Supabase não definido (escopo T2).
- Runtime não alterado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.R
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         smoke documental 6/6 PRs passando; 12/12 critérios
                                       de aceite T1 cumpridos com evidência documental
                                       completa; coerência entre todos os artefatos T1
                                       verificada em 5 dimensões; G1 APROVADO
Lacuna remanescente:                   nenhuma bloqueante — 4 limitações residuais declaradas
                                       e classificadas como fora do escopo de T1 no próprio
                                       contrato T1 §3 (L18 não transcrito; runtime não testado;
                                       TurnoSaida sem schema concreto; 32 vs. "20-30" casos)
Há item parcial bloqueante?:           não — todos os critérios têm evidência completa
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T1.R encerrada; G1 APROVADO; contrato T1 encerrado
                                       e arquivado; skeleton T2 criado; PR-T2.0 desbloqueada
Próxima PR autorizada:                 PR-T2.0 — Abertura do contrato de Estado Estruturado
```

### Estado atual do repositorio

- Fase macro: **T2** — skeleton ativo; aguardando PR-T2.0.
- G0: APROVADO.
- G1: **APROVADO** em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- Contrato T1: **ENCERRADO** e arquivado.
- Contrato T2: skeleton em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.0`** — Abertura do contrato de Estado Estruturado e Memória v1.

### Leituras obrigatorias para PR-T2.0

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.0)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` (skeleton a preencher)
4. `schema/implantation/READINESS_G1.md` (smoke e limitações residuais T1)
5. `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`
6. Artefatos T1: T1_CAMADAS_CANONICAS, T1_SYSTEM_PROMPT_CANONICO, T1_TAXONOMIA_OFICIAL,
   T1_CONTRATO_SAIDA, T1_COMPORTAMENTOS_E_PROIBICOES
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`
13. `schema/CONTRACT_SCHEMA.md`

---

## Atualizacao 2026-04-23 — abertura formal do contrato T2 (PR-T2.0)

### Objetivo executado

`PR-T2.0` — preencher formalmente o contrato T2 (Estado Estruturado, Memória e Reconciliação)
conforme `schema/CONTRACT_SCHEMA.md`, sem executar implementação.

### Estado herdado

- Branch `feat/t2-pr20-abertura-contrato` criada limpa a partir de main pós-PR-T1.R.
- G1 APROVADO em 2026-04-23 via PR-T1.R.
- Contrato T1 encerrado e arquivado.
- Skeleton T2 existente em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Todos os artefatos T1 disponíveis: T1_CAMADAS_CANONICAS, T1_SYSTEM_PROMPT_CANONICO,
  T1_TAXONOMIA_OFICIAL, T1_CONTRATO_SAIDA, T1_COMPORTAMENTOS_E_PROIBICOES.

### O que foi feito

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` com corpo completo:
  - Cabeçalho canônico com todos os campos do CONTRACT_SCHEMA.md;
  - Adendos A00-ADENDO-01/02/03 declarados explicitamente;
  - §1 Objetivo: contrato T2 define schema de estado estruturado sem implementar em produção;
  - §2 Escopo: 6 artefatos (dicionário, lead_state, política confiança, reconciliação, resumo persistido, readiness G2);
  - §3 Fora de escopo: T3 (policy), T4 (orquestrador), T5 (migração), T6 (áudio), migrations Supabase, runtime;
  - §4 Dependências: G1 APROVADO + 7 artefatos T1 declarados com status;
  - §5 Entradas: 7 documentos fontes listados;
  - §6 Saídas: tabela com 6 artefatos, PR criadora e descrição;
  - §7 Critérios de aceite: 8 critérios verificáveis declarados;
  - §8 Provas obrigatórias: por PR e PR-T2.R;
  - §9 Bloqueios: 8 condições bloqueantes com ação exigida;
  - §10 Próximo passo: PR-T2.1 com 8 leituras obrigatórias;
  - §11 Relação A01: fase T2, semanas 3–4, gate G2;
  - §12 Relação legados: L03 obrigatório; L05/L19 complementares primários; L04/L07–L17 por microetapa;
  - §13 Referências obrigatórias: 20 documentos listados;
  - §14 Blocos legados: obrigatórios (L03) e complementares organizados;
  - §15 Ordem mínima: L03 → L05 → L19 (expandida por microetapa);
  - §16 Quebra de PRs T2.0–T2.R com entregáveis e dependências;
  - §17 Gate G2: condições de aprovação, reprovação e consequências;
  - Microetapas do mestre (5 itens) com amarração às PRs.
- Atualizou `schema/contracts/_INDEX.md`: status T2 skeleton → aberto; próximo passo PR-T2.1.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa PR-T2.0; próximo passo PR-T2.1.

### O que nao foi feito

- Nenhum artefato de execução T2 criado (T2_DICIONARIO_FATOS, T2_LEAD_STATE_V1, etc.) — esses são escopo PR-T2.1+.
- Nenhuma migration Supabase criada.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- Nenhum LLM real testado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T2.0
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md
Critério de aceite verificado:         Contrato T2 preenchido conforme CONTRACT_SCHEMA.md;
                                       todas as 17 seções obrigatórias presentes; 8 critérios
                                       de aceite declarados; quebra de PRs T2.0–T2.R com
                                       entregáveis; gate G2 com condições formais; adendos
                                       A00-ADENDO-01/02/03 declarados; legados mapeados;
                                       índice, status e handoff atualizados
Lacuna remanescente:                   nenhuma bloqueante — artefatos de execução T2 são
                                       escopo de PR-T2.1 a PR-T2.5, não de PR-T2.0
Há item parcial bloqueante?:           não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.0 encerrada; contrato T2 aberto formalmente;
                                       PR-T2.1 desbloqueada
Próxima PR autorizada:                 PR-T2.1 — Nomes canônicos dos fatos
```

### Estado atual do repositorio

- Fase macro: **T2** — contrato aberto; PR-T2.1 próxima.
- G0: APROVADO.
- G1: **APROVADO** em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- Contrato T2: **aberto** em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.1`** — Nomes canônicos dos fatos (sem duplicidade semântica).

### Leituras obrigatorias para PR-T2.1

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` (contrato aberto)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.1)
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — State Store, fatos centrais/derivados)
4. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (56 tipos — base para dicionário)
5. `schema/implantation/T1_CONTRATO_SAIDA.md` (13 campos — fatos que LLM preenche)
6. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
7. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — dicionario canonico de fatos (PR-T2.1)

### Objetivo executado

`PR-T2.1` — criar `schema/implantation/T2_DICIONARIO_FATOS.md` com nomes canônicos únicos,
mapeamento E1→E2, 7 categorias de memória com limites LLM-first e 10 regras invioláveis.

### Estado herdado

- Branch `feat/t2-pr21-dicionario-fatos` criada limpa a partir de main pós-PR-T2.0.
- Contrato T2 aberto: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- G1 APROVADO; G2 aberto.
- Artefatos T1 completos como base de entrada.

### O que foi feito

- Criou `schema/implantation/T2_DICIONARIO_FATOS.md` com:
  - **§1** Princípio de uso: prefixos `fact_`/`derived_`/`signal_`; memória ≠ fala.
  - **§2** Auditoria de duplicidade semântica: 42 campos E1 analisados; 4 eliminados como fatos primários (`rnm_required`, `dependents_applicable`, `subsidy_band_hint`) ou rebaixados (`has_multi_income_p1`, sinais cognitivos E1); `marital_status` renomeado para `fact_estado_civil`.
  - **§3** Dicionário canônico: 50 chaves estáveis em 12 grupos (I a XII): 35 `fact_*`, 9 `derived_*`, 6 `signal_*`.
  - **§4** 7 categorias de memória com limites explícitos por categoria: atendimento, normativa/MCMV, comercial, manual Vasques, regras do funil, aprendizado por atendimento, operacional/telemetria.
  - **§5** Tabela consolidada E1→E2: cada campo E1 com decisão (renomeado, eliminado, adicionado, alinhado T1).
  - **§6** Contagem final: 50 chaves totais.
  - **§7** 10 regras LLM-first invioláveis (M-01..M-10).
  - **§8** Cobertura das 5 microetapas do mestre declarada.
  - **§9** Bloco E: fechamento permitido; PR-T2.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T2 → em execução; próximo passo PR-T2.2.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa PR-T2.1; próximo passo PR-T2.2.

### O que nao foi feito

- T2_LEAD_STATE_V1.md não criado (escopo PR-T2.2).
- Nenhuma migration Supabase.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- Tipologia completa de status do fato (bruto/confirmado/inferência/hipótese/pendência) — detalhamento em T2.4.
- G2 não fechado (requer PR-T2.R).

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T2.1
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md
Critério de aceite verificado:         T2_DICIONARIO_FATOS.md cobre todos os fatos centrais e
                                       derivados do mestre seção T2; 50 chaves canônicas sem
                                       duplicidade semântica; 7 categorias de memória com limites;
                                       10 regras LLM-first; tabela E1→E2 exaustiva; 5 microetapas
                                       do mestre cobertas
Lacuna remanescente:                   nenhuma bloqueante — tipologia de status do fato
                                       (bruto/confirmado/etc.) é detalhada em T2.4 conforme
                                       sequência da Bíblia (T2.3 antes de T2.4)
Há item parcial bloqueante?:           não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.1 encerrada; T2_DICIONARIO_FATOS.md publicado;
                                       PR-T2.2 desbloqueada
Próxima PR autorizada:                 PR-T2.2 — Schema lead_state v1
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.2 próxima.
- G0: APROVADO.
- G1: APROVADO em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.2`** — Schema `lead_state` v1.

### Leituras obrigatorias para PR-T2.2

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.2)
3. `schema/implantation/T2_DICIONARIO_FATOS.md` (base obrigatória)
4. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — estado canônico, PDF6 pp. 4–5)
5. `schema/implantation/T1_CONTRATO_SAIDA.md` (13 campos de saída)
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (OBJ_*, PEND_*, CONF_*, RISCO_*)
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — schema lead_state v1 (PR-T2.2)

### Objetivo executado

`PR-T2.2` — criar `schema/implantation/T2_LEAD_STATE_V1.md`: schema estrutural canônico do
`lead_state` com todos os blocos, shapes, status de fatos, regras invioláveis e mapeamento
campo ↔ fato ↔ regra.

### Estado herdado

- Branch `feat/t2-pr22-lead-state-v1` criada limpa a partir de main pós-PR-T2.1.
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves: 35 fact_*, 9 derived_*, 6 signal_*).
- T1_TAXONOMIA_OFICIAL.md, T1_CONTRATO_SAIDA.md, mestre seção T2 (PDF6) lidos.

### O que foi feito

- Criou `schema/implantation/T2_LEAD_STATE_V1.md` com:
  - **§1** Visão geral do shape `LeadState` com 10 sub-blocos.
  - **§2** `CaseMeta`: lead_id, case_id, created_at, last_updated, channel_origin.
  - **§3** `OperationalState`: 11 campos do mestre PDF6 (current_phase, current_objective,
    progress_score, risk_level, must_ask_now, blocked_by, recommended_next_actions,
    open_contradictions, last_policy_decision, handoff_readiness, needs_confirmation,
    elegibility_status); 8 valores canônicos de `current_phase`.
  - **§4** `FactBlock`: 35 fact_* por grupos I–X; shape FactEntry com 5 campos;
    5 status canônicos (captured/confirmed/inferred/contradicted/obsolete) com
    transições permitidas e proibidas; índice por grupo com stage de exigibilidade.
  - **§5** `DerivedBlock`: 9 derived_*; shape DerivedEntry com `stale` flag; índice
    com condições de derivação.
  - **§6** `Pending`: 6 PEND_* tipos (PEND_SLOT_VAZIO/CONFIRMACAO/DOCUMENTO/P2_SLOT/P3_SLOT/RNM);
    shape com stage e turno de criação.
  - **§7** `Conflicts`: 4 CONF_* tipos (CONF_DADO_CONTRADITO/COMPOSICAO/PROCESSO/RENDA);
    protocolo de resolução em 6 passos.
  - **§8** `SignalBlock`: 6 signal_*; shape SignalEntry; distinção explícita signal_multi_income_p1
    vs fact_has_multi_income_p1.
  - **§9** `HistorySummary`: 4 camadas (L1 curto prazo, L2 factual estruturada, L3 snapshot
    executivo, L4 histórico frio); shape SnapshotExecutivo com `approval_prohibited = true`
    invariante.
  - **§10** `VasquesNotes`: shape auditável (note_id, content, note_type, author, created_at,
    reason, applies_to, supersedes); 4 tipos de nota; regras de prioridade.
  - **§11** `NormativeContext`: referência compartilhada; não por lead.
  - **§12** 12 regras invioláveis LS-01..LS-12.
  - **§13** Tabela de mapeamento campo ↔ fato canônico ↔ regra T0 (48 linhas).
  - **§14** Tabela de compatibilidade transitória E1→E2 (11 mapeamentos).
  - **§15** Bloco E: fechamento permitido; PR-T2.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.2 executada; próximo passo PR-T2.3.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa PR-T2.2;
  próximo passo PR-T2.3.

### O que nao foi feito

- T2_POLITICA_CONFIANCA.md não criado (escopo PR-T2.3).
- Tipologia detalhada bruto/confirmado/hipótese/pendência não documentada formalmente (T2.4).
- T2_RESUMO_PERSISTIDO.md não criado (escopo T2.5).
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado (requer PR-T2.R após T2.3–T2.5).

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_LEAD_STATE_V1.md
PR que fecha:                          PR-T2.2
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 11 blocos canônicos; 35 fact_*; 9 derived_*;
                                       6 signal_*; 6 PEND_*; 4 CONF_*; 4 camadas de memória;
                                       12 regras invioláveis; mapeamento campo↔fato↔regra;
                                       compatibilidade E1→E2; Bloco E no documento.
Há item parcial bloqueante?:           não — política de confiança (T2.3), reconciliação
                                       formal (T2.4) e resumo persistido detalhado (T2.5)
                                       são escopos das próximas PRs, não lacunas desta.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.2 encerrada; T2_LEAD_STATE_V1.md publicado;
                                       PR-T2.3 desbloqueada
Próxima PR autorizada:                 PR-T2.3 — Política de confiança por origem do dado
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.3 próxima.
- G0: APROVADO.
- G1: APROVADO em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.3`** — Política de confiança por origem do dado.

### Leituras obrigatorias para PR-T2.3

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.3)
3. `schema/implantation/T2_LEAD_STATE_V1.md` (base obrigatória)
4. `schema/implantation/T2_DICIONARIO_FATOS.md`
5. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — origens de dado)
6. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
7. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — política de confiança por origem (PR-T2.3)

### Objetivo executado

`PR-T2.3` — criar `schema/implantation/T2_POLITICA_CONFIANCA.md`: política canônica de confiança
por origem do dado, definindo quando dados atingem cada status, quando exigem confirmação, quando
geram conflito e quando bloqueiam avanço de stage.

### Estado herdado

- Branch `feat/t2-pr23-politica-confianca` criada limpa a partir de main pós-PR-T2.2.
- `T2_LEAD_STATE_V1.md` publicado (11 blocos, 5 status de fato).
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves canônicas).
- Mestre seção T2 (PDF6, p. 5–6), T1_CONTRATO_SAIDA, T1_TAXONOMIA lidos.

### O que foi feito

- Criou `schema/implantation/T2_POLITICA_CONFIANCA.md` com:
  - **§1** Referência cruzada com status canônicos do lead_state v1 (+ `hypothesis`).
  - **§2** Tabela das 6 origens com nível de confiança e status máximo atingível.
  - **§3** Política detalhada por origem:
    - O1 `EXPLICIT_TEXT`: alto; críticos exigem confirmação; contradição gera conflito.
    - O2 `INDIRECT_TEXT`: baixo; nunca `confirmed` diretamente; fatos críticos = `hypothesis`.
    - O3 `AUDIO_TRANSCRIPT`: 3 níveis (bom/médio/ruim); áudio ruim não persiste.
    - O4 `DOCUMENT`: alto; conflito com fala anterior; documento ilegível = `hypothesis`.
    - O5 `INFERENCE`: mecânica → `inferred`; LLM → `hypothesis`; nunca `confirmed`.
    - O6 `OPERATOR_NOTE`: auditável; não sobrescreve `confirmed` sem reconciliação.
  - **§4** Mapa de transição de status por origem (tabela executiva).
  - **§5** Lista canônica de 12 fatos críticos com motivo de criticidade.
  - **§6** 7 condições de confirmação obrigatória antes de `confirmed`.
  - **§7** Tabela de geração de conflito + proibição de conflito silencioso.
  - **§8** 6 condições de bloqueio de avanço de stage por confiança.
  - **§9** Registro obrigatório por atualização + 9 valores canônicos de `source`.
  - **§10** 5 casos sintéticos (S1–S5: indireto→confirmado, doc↔fala, áudio ruim, inferência bloqueada, Vasques x confirmed).
  - **§11** Amarração campo por campo ao lead_state v1.
  - **§12** 12 regras invioláveis PC-01..PC-12.
  - **§13** Cobertura das 5 origens do mestre + Vasques.
  - **§14** Bloco E.
- Atualizou `schema/contracts/_INDEX.md`: PR-T2.3 executada; próximo PR-T2.4.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Reconciliação formal e tipologia detalhada — escopo PR-T2.4.
- T2_RESUMO_PERSISTIDO.md — escopo T2.5.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_POLITICA_CONFIANCA.md
PR que fecha:                          PR-T2.3
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 6 origens cobertas; mapa de transição por origem;
                                       12 fatos críticos; condições de confirmação/conflito/
                                       bloqueio; 9 source values; 5 casos sintéticos;
                                       12 regras PC-01..PC-12; cobertura do mestre verificada.
Há item parcial bloqueante?:           não — reconciliação formal e tipologia hipótese/pendência
                                       são escopo T2.4, não lacunas desta PR.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.3 encerrada; T2_POLITICA_CONFIANCA.md publicado;
                                       PR-T2.4 desbloqueada
Próxima PR autorizada:                 PR-T2.4 — Reconciliação e tipologia
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.4 próxima.
- G0: APROVADO. G1: APROVADO em 2026-04-23. G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.4`** — Reconciliação e tipologia (bruto/confirmado/inferência/hipótese/pendência).

### Leituras obrigatorias para PR-T2.4

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.4)
3. `schema/implantation/T2_POLITICA_CONFIANCA.md` (base obrigatória)
4. `schema/implantation/T2_LEAD_STATE_V1.md`
5. `schema/implantation/T2_DICIONARIO_FATOS.md`
6. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — casos de mudança de versão)
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — reconciliação e tipologia (PR-T2.4)

### Objetivo executado

`PR-T2.4` — criar `schema/implantation/T2_RECONCILIACAO.md`: tipologia formal de estados de fato,
protocolo canônico de reconciliação, hierarquia de prioridade por origem, 10 domínios específicos,
anti-padrões e regras invioláveis.

### Estado herdado

- Branch `feat/t2-pr23-politica-confianca` (reaproveitada para PR-T2.4).
- `T2_POLITICA_CONFIANCA.md` publicado (6 origens, 12 regras PC-01..PC-12).
- `T2_LEAD_STATE_V1.md` publicado (11 blocos, 5 status canônicos).
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves canônicas).

### O que foi feito

- Criou `schema/implantation/T2_RECONCILIACAO.md` com:
  - **§1** Tipologia formal de 7 estados: `hypothesis`, `captured`, `inferred`, `confirmed`,
    `contradicted`, `pending`, `obsolete`; regras internas RC-H1, RC-C1, RC-I1, RC-CF1,
    RC-CO1, RC-P1, RC-OB1.
  - **§2** Protocolo de reconciliação em 7 etapas com fluxograma ASCII:
    - Etapa 1: receber novo dado;
    - Etapa 2: verificar existência no lead_state;
    - Etapa 3A: primeiro registro → `captured`;
    - Etapa 3B: fato existe → avaliar compatibilidade;
    - Etapa 4: gerar CONF_* em conflicts[];
    - Etapa 5: LLM conduz confirmação (OBJ_CONFIRMAR);
    - Etapa 6: resolução — confirmado/obsoleto; Conflict.resolved = true;
    - Etapa 7: trilha de auditoria obrigatória.
  - **§3** Hierarquia de prioridade por origem (não automática): DOCUMENT > EXPLICIT_TEXT
    recente > confirmed anterior > áudio > indireto > inferência; Vasques especial.
  - **§4** 10 domínios específicos de reconciliação:
    - §4.1 Renda (CONF_RENDA);
    - §4.2 Estado civil (CONF_DADO_CONTRADITO / CONF_COMPOSICAO);
    - §4.3 Regime de trabalho (CONF_DADO_CONTRADITO);
    - §4.4 Composição e P2 (CONF_COMPOSICAO / CONF_PROCESSO);
    - §4.5 IR autônomo (CONF_DADO_CONTRADITO);
    - §4.6 Restrição (CONF_DADO_CONTRADITO — ACAO_INELEGIBILIDADE só após confirmed);
    - §4.7 RNM (CONF_DADO_CONTRADITO — mesma regra);
    - §4.8 Áudio ruim (protocolo de recoleta);
    - §4.9 Nota Vasques vs confirmed (bloqueio sem reconciliação formal);
    - §4.10 Documento ilegível (hypothesis não persiste).
  - **§5** 10 casos sintéticos RC-01..RC-10 com passo a passo tabular.
  - **§6** Tabela de transições de status (todas as transições com condições e autoridade).
  - **§7** 12 anti-padrões AP-01..AP-12.
  - **§8** 10 regras invioláveis RC-01..RC-10.
  - **§9** Mapeamento ao lead_state v1 e política de confiança.
  - **§10** Bloco E: fechamento permitido; PR-T2.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T2.4 executada; próximo PR-T2.5.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- T2_RESUMO_PERSISTIDO.md não criado (escopo PR-T2.5).
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado (requer PR-T2.R após T2.5).

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_RECONCILIACAO.md
PR que fecha:                          PR-T2.4
Estado da evidência:                   completa
Há lacuna remanescente?:               não — tipologia 7 estados; protocolo 7 etapas; 10 domínios
                                       específicos; 10 casos sintéticos; tabela de transições
                                       completa; 12 anti-padrões; 10 regras invioláveis;
                                       mapeamento ao lead_state v1 e política de confiança.
Há item parcial bloqueante?:           não — resumo persistido (T2_RESUMO_PERSISTIDO.md) é
                                       escopo T2.5, não lacuna desta PR.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.4 encerrada; T2_RECONCILIACAO.md publicado;
                                       PR-T2.5 desbloqueada
Próxima PR autorizada:                 PR-T2.5 — Resumo persistido (T2_RESUMO_PERSISTIDO.md)
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.5 próxima.
- G0: APROVADO. G1: APROVADO em 2026-04-23. G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: publicado.
- T2_RECONCILIACAO.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.5`** — Resumo persistido (T2_RESUMO_PERSISTIDO.md).

### Leituras obrigatorias para PR-T2.5

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.5)
3. `schema/implantation/T2_RECONCILIACAO.md` (base obrigatória)
4. `schema/implantation/T2_POLITICA_CONFIANCA.md`
5. `schema/implantation/T2_LEAD_STATE_V1.md`
6. `schema/implantation/T2_DICIONARIO_FATOS.md`
7. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — resumo e persistência)
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — resumo persistido e compatibilidade E1→E2 (PR-T2.5)

### Objetivo executado

`PR-T2.5` — criar `schema/implantation/T2_RESUMO_PERSISTIDO.md`: mecanismo canônico de resumo
persistido para conversas longas (4 camadas de memória, protocolo de snapshot, regras anti-
contaminação) e mapa completo de compatibilidade transitória E1→E2 (campos, stages, vícios).

### Estado herdado

- Branch `feat/t2-pr25-resumo-persistido` criada limpa a partir de main pós-PR-T2.4.
- `T2_RECONCILIACAO.md` publicado (7 estados, protocolo 7 etapas, 10 domínios).
- `T2_POLITICA_CONFIANCA.md` publicado (6 origens, 12 regras PC-01..PC-12).
- `T2_LEAD_STATE_V1.md` publicado (HistorySummary com 4 camadas e SnapshotExecutivo).
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves, tabela E1→E2 base).

### O que foi feito

- Criou `schema/implantation/T2_RESUMO_PERSISTIDO.md` com:
  - **§1** Quatro camadas de memória (L1/L2/L3/L4): definições, limites, regras de acesso;
    L1 = últimos 5 turnos; L2 = lead_state.facts (verdade canônica); L3 = snapshot executivo
    (1 ativo por case); L4 = histórico frio (imutável, auditável, só sob demanda).
  - **§2** Protocolo de snapshot: 7 eventos de trigger (stage_advance, conflict_resolved,
    session_end, handoff, retorno ≥24h, override_priority, eligibility_change); shape completo
    SnapshotExecutivo com 12 campos incluindo `approval_prohibited = true` invariante; lista
    canônica de inclusões e exclusões (RP-SN-01..07).
  - **§3** Regras anti-contaminação (RC-AN-01..07): resumo não promove status, L4 não reabre
    conflitos, snapshot não substitui reconciliação; hierarquia de precedência de leitura.
  - **§4** Memória Vasques: 4 tipos de nota, 7 regras de limite (RV-01..07).
  - **§5** Aprendizado por atendimento: 5 regras RA-01..05; padrão vs. script; formas válidas
    e proibidas.
  - **§6** Compatibilidade transitória E1→E2: 7 princípios (RB-01..07); tabela 27 campos com
    treatment (status de entrada, ação de migração); 7 campos E1 descartados com motivo;
    tabela de mapeamento stages E1 → current_phase E2; como preservar sem manter vício.
  - **§7** Cobertura das 5 microetapas do mestre (microetapas 4 e 5 cobertas aqui).
  - **§8** 10 casos sintéticos SP-01..SP-10.
  - **§9** 12 anti-padrões AP-RP-01..AP-RP-12.
  - **§10** 10 regras invioláveis RP-01..RP-10.
  - **§11** Amarração campo por campo ao lead_state v1.
  - **§12** Bloco E: fechamento permitido; PR-T2.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T2.5 executada; próximo PR-T2.R.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- READINESS_G2.md não criado (escopo PR-T2.R).
- G2 não fechado (requer PR-T2.R).
- Skeleton T3 não criado (requer G2 aprovado).
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_RESUMO_PERSISTIDO.md
PR que fecha:                          PR-T2.5
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 4 camadas de memória; protocolo snapshot completo;
                                       RC-AN-01..07; RV-01..07; RA-01..05; tabela E1→E2
                                       (27 campos + 7 descartados + stages); SP-01..SP-10;
                                       AP-RP-01..12; RP-01..10; cobertura microetapas 4 e 5
                                       do mestre; soberania LLM-first verificada.
Há item parcial bloqueante?:           não — READINESS_G2.md é escopo PR-T2.R.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.5 encerrada; T2_RESUMO_PERSISTIDO.md publicado;
                                       PR-T2.R desbloqueada
Próxima PR autorizada:                 PR-T2.R — Readiness/Closeout G2
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.R próxima.
- G0: APROVADO. G1: APROVADO em 2026-04-23. G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: publicado.
- T2_RECONCILIACAO.md: publicado.
- T2_RESUMO_PERSISTIDO.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.R`** — Readiness/Closeout G2 (smoke documental 6/6 artefatos + decisão formal G2 + skeleton T3).

### Leituras obrigatorias para PR-T2.R

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.R)
3. `schema/implantation/T2_RESUMO_PERSISTIDO.md` (base obrigatória)
4. `schema/implantation/T2_RECONCILIACAO.md`
5. `schema/implantation/T2_POLITICA_CONFIANCA.md`
6. `schema/implantation/T2_LEAD_STATE_V1.md`
7. `schema/implantation/T2_DICIONARIO_FATOS.md`
8. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
9. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
10. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — readiness e closeout G2 (PR-T2.R)

### Objetivo executado

`PR-T2.R` — criar `schema/implantation/READINESS_G2.md`: smoke documental de PR-T2.0 a PR-T2.5,
verificação de coerência entre artefatos, 3 cenários sintéticos de validação, verificação dos
8 critérios de aceite do contrato T2, decisão formal G2, encerramento de contrato T2 e skeleton T3.

### Estado herdado

- Branch `feat/t2-pr2r-readiness-g2` criada limpa a partir de main pós-PR-T2.5.
- Todos os 6 artefatos T2 publicados (T2.0→T2.5): contrato + dicionário + lead_state +
  política + reconciliação + resumo.
- G1 APROVADO em 2026-04-23 (READINESS_G1.md).

### O que foi feito

- Criou `schema/implantation/READINESS_G2.md` com:
  - **§1** Smoke documental PR-T2.0 a PR-T2.5 — 6/6 PASS com evidências detalhadas por artefato.
  - **§2** Verificação de coerência em 8 dimensões: dict↔lead_state↔política↔reconciliação↔resumo;
    nomes canônicos; separação tipos; LLM-first (tabela artefato×regra); snapshot≠lead_state;
    sobrescrita silenciosa; inferência≠confirmed; E1≠arquitetura.
  - **§3** 3 cenários sintéticos: V1 (conflito texto vs. documento), V2 (áudio ruim + confirmed),
    V3 (snapshot antigo + approval_prohibited) — todos PASS.
  - **§4** Verificação 8/8 critérios de aceite do contrato T2 §7 — todos CUMPRIDOS.
  - **§5** Lacunas: 5 não bloqueantes com justificativa; zero bloqueantes.
  - **§6** Decisão formal: G2 APROVADO.
  - **§7** Encerramento de contrato T2 (checklist CONTRACT_CLOSEOUT_PROTOCOL.md completo).
  - **§8** Bloco E: fechamento permitido; PR-T3.0 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`: status → ENCERRADO.
- Arquivou contrato T2 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`.
- Criou skeleton `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md`.
- Atualizou `schema/contracts/_INDEX.md`: T2 encerrado/arquivado; T3 skeleton ativo; PR-T3.0 próximo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: gate G2 aprovado; G3 aberto; T3 skeleton.

### O que nao foi feito

- Contrato T3 com corpo não preenchido (PR-T3.0 preencherá).
- Nenhuma implementação de policy engine (T3+).
- G3 não aberto (requer PR-T3.R após execução de T3).
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G2.md
PR que fecha:                          PR-T2.R (gate G2 + contrato T2)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — smoke 6/6 PASS; critérios 8/8 CUMPRIDOS;
                                       8 dimensões de coerência verificadas; 3 cenários
                                       sintéticos PASS; zero violações LLM-first;
                                       5 limitações residuais declaradas como não bloqueantes
                                       com justificativa objetiva.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         G2 APROVADO; contrato T2 ENCERRADO e arquivado;
                                       skeleton T3 criado; PR-T3.0 desbloqueada.
Próxima PR autorizada:                 PR-T3.0 — Abertura do contrato de Policy Engine v1 (T3)
```

### Estado atual do repositorio

- Fase macro: **T3** — skeleton ativo; PR-T3.0 próxima.
- G0: APROVADO. G1: APROVADO (2026-04-23). G2: **APROVADO (2026-04-24)**. G3: aberto — aguardando PR-T3.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: publicado.
- T2_RECONCILIACAO.md: publicado.
- T2_RESUMO_PERSISTIDO.md: publicado.
- READINESS_G2.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.0`** — Abertura formal do contrato de Policy Engine v1 (T3).

### Leituras obrigatorias para PR-T3.0

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (skeleton — a preencher)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T3.0)
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3)
4. `schema/implantation/READINESS_G2.md` (evidência G2 aprovado)
5. `schema/implantation/T2_RECONCILIACAO.md`
6. `schema/implantation/T2_POLITICA_CONFIANCA.md`
7. `schema/implantation/T2_LEAD_STATE_V1.md`
8. `schema/implantation/T2_DICIONARIO_FATOS.md`
9. `schema/CONTRACT_SCHEMA.md` (formato canônico de contrato)
10. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
11. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
13. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
14. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
15. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — PR-T3.0: Abertura formal do contrato T3

### Objetivo executado

Preencher formalmente o skeleton T3 com o corpo completo do contrato, conforme CONTRACT_SCHEMA.md,
sem implementar policy engine real.

### O que foi feito

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` com §1–§17 + Bloco E:
  - §1 Objetivo: policy engine decide mas não fala; cinco entregas canônicas ao final de T3;
  - §2 Escopo: 8 itens (T3_CLASSES_POLITICA, T3_REGRAS_CRITICAS_DECLARATIVAS, T3_ORDEM_AVALIACAO_COMPOSICAO, T3_VETO_SUAVE_VALIDADOR, T3_SUITE_TESTES_REGRAS, READINESS_G3 + tracking);
  - §3 Fora de escopo: src/, T4, Supabase real, reply_text no engine;
  - §4 Dependências: G2 APROVADO (desbloqueado) + T2 encerrado (desbloqueado) + 6 artefatos T2;
  - §5–§6 Entradas (8 artefatos com condições) e Saídas (S1–S6 com PR criadora e conteúdo mínimo);
  - §7 Critérios de aceite CA-01..CA-10: LLM-first no engine, 4 regras codificadas, ordem estável, veto suave distinto, validador ≥3 itens, ≥20 testes, coerência com lead_state v1, 5 microetapas cobertas, G3 com Bloco E;
  - §8 Provas P-T3-01..P-T3-05; §9 Bloqueios B-01..B-05 (B-01 e B-02 desbloqueados);
  - §10 Próximo passo: PR-T3.1; §11 A01: T3 semanas 5–6 prioridade 4;
  - §12 Legados: L03 obrigatório + 12 complementares (L05, L07–L17, L19) com PR e contexto;
  - §13 Referências: 14 documentos; §14 Blocos obrigatórios/complementares com quando consultar;
  - §15 Ordem mínima de leitura por PR; §16 Quebra T3.0–T3.R (7 PRs); §17 Gate G3 completo;
  - Bloco E: PR-T3.1 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`:
  - Fase ativa: T3; contrato ativo: aberto — PR-T3.0 executada; próximo passo: PR-T3.1.
- Atualizou `schema/contracts/_INDEX.md`:
  - Row T3: status skeleton → aberto; PR atual → PR-T3.0 executada; próximo → PR-T3.1;
  - Última sincronização: PR-T3.0 entrada adicionada.

### O que não foi feito

- Não criou T3_CLASSES_POLITICA.md (escopo PR-T3.1).
- Não implementou nenhuma classe, regra ou validador.
- Não alterou src/, package.json, wrangler.toml.
- G3 não fechado.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — nenhum campo de saída do engine produz reply_text (CA-01, CA-08 declarados).
- A00-ADENDO-02: confirmada — identidade MCMV preservada; L19 amarrado para regras de perfil.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md
PR que fecha:                          PR-T3.0 (abertura do contrato T3)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — §1–§17 preenchidos; skeleton substituído por corpo
                                       formal; CA-01..CA-10 definidos; PRs T3.0–T3.R mapeadas;
                                       gate G3 com condições objetivas; Bloco E presente.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         contrato T3 ABERTO; PR-T3.1 desbloqueada.
Próxima PR autorizada:                 PR-T3.1 — Classes canônicas de política
```

### Estado atual do repositorio

- Fase macro: **T3** — contrato aberto; PR-T3.1 próxima.
- G0: APROVADO. G1: APROVADO (2026-04-23). G2: APROVADO (2026-04-24). G3: aberto.
- T3_CLASSES_POLITICA.md: pendente (PR-T3.1).
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: pendente (PR-T3.2).
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: pendente (PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md: pendente (PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md: pendente (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.1`** — Classes canônicas de política.

### Leituras obrigatorias para PR-T3.1

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (contrato T3 — §1–§17)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção J — PR-T3.1)
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3 — microetapa 2)
4. **L03** — Mapa Canônico do Funil (obrigatório)
5. `schema/implantation/T2_LEAD_STATE_V1.md`
6. `schema/implantation/T2_POLITICA_CONFIANCA.md`
7. `schema/implantation/READINESS_G2.md`
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T3.1: Classes canônicas de política

### Objetivo executado

Criar `schema/implantation/T3_CLASSES_POLITICA.md` com as cinco classes canônicas do policy
engine v1, seus payloads mínimos, prioridade entre classes, definições formais dos quatro
efeitos operacionais (microetapa 2 do mestre T3) e integração com lead_state v1.

### O que foi feito

- Criou `schema/implantation/T3_CLASSES_POLITICA.md` com:
  - Shape `PolicyDecision` com invariante global: `action` nunca contém `reply_text` (CP-01);
  - §2 Classe BLOQUEIO — "bloquear avanço": `BloqueioAction` com `advance_allowed=false`; distinção formal de veto suave;
  - §3 Classe OBRIGAÇÃO — "exigir ação": `ObrigacaoAction`; afeta `must_ask_now` mas não `blocked_by`;
  - §4 Classe CONFIRMAÇÃO — "pedir confirmação": `ConfirmacaoAction`; não persiste dado automaticamente;
  - §5 Classe SUGESTÃO MANDATÓRIA — "apenas orientar": `SugestaoMandatoriaAction`; insumo de raciocínio, nunca script;
  - §6 Classe ROTEAMENTO — "desviar objetivo": `RoteamentoAction`; só executado sem bloqueio ativo;
  - §7 Prioridade: bloqueio(1) > obrigação(2) > confirmação(3) > sugestão_mandatória(4) > roteamento(5);
  - §8 Definições formais dos 4 efeitos operacionais (microetapa 2 T3 coberta);
  - §9 Integração com 10 campos do lead_state v1 — quais classes os modificam;
  - §10 5 regras de integração com política de confiança (PC-INT-01..05);
  - §11 10 anti-padrões AP-CP-01..10;
  - §12 5 exemplos sintéticos (um por classe);
  - §13 Cobertura de microetapas: microetapa 2 coberta; 1/3/4/5 delegadas;
  - §14 10 regras invioláveis CP-01..10;
  - Bloco E: PR-T3.2 desbloqueada.

### O que não foi feito

- Não criou T3_REGRAS_CRITICAS_DECLARATIVAS.md (escopo PR-T3.2).
- Não implementou motor real em src/.
- Não alterou package.json, wrangler.toml.
- G3 não fechado.

### Provas entregues

- **P-T3-01:** grep de `reply_text`, `mensagem_usuario`, `texto_cliente` em payloads de `action` — ausência confirmada.
- **P-T3-02:** todas as fact_keys referenciadas existem em T2_DICIONARIO_FATOS §3 (verificadas: `fact_rnm_status`, `fact_monthly_income_p1`, `fact_nationality`, `fact_work_regime_p1`, `fact_estado_civil`, `fact_process_mode`, `fact_p3_required`, `fact_has_multi_income_p1`, `fact_current_intent`, `fact_channel_origin`).
- **P-T3-03:** microetapa 2 do mestre T3 coberta em §8; §13 declara cobertura explícita por microetapa.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — engine emite `PolicyDecision` estruturado; LLM soberano na fala.
- A00-ADENDO-02: confirmada — identidade MCMV preservada; engine orienta sem engessar fala.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_CLASSES_POLITICA.md
PR que fecha:                          PR-T3.1 (classes canônicas de política)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 5 classes definidas; payloads sem reply_text;
                                       prioridade entre classes definida; 4 efeitos formais (§8);
                                       integração lead_state v1 (§9) e confiança (§10);
                                       10 anti-padrões; 5 exemplos; 10 regras; microetapa 2
                                       coberta; provas P-T3-01/02/03 presentes no Bloco E.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.1 CONCLUÍDA; PR-T3.2 desbloqueada.
Próxima PR autorizada:                 PR-T3.2 — Codificação declarativa das regras críticas
```

### Estado atual do repositorio

- Fase macro: **T3** — em execução; PR-T3.2 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: aberto.
- T3_CLASSES_POLITICA.md: **publicado**.
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: pendente (PR-T3.2).
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: pendente (PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md: pendente (PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md: pendente (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.2`** — Codificação declarativa das regras críticas.

### Leituras obrigatorias para PR-T3.2

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (§2, §7 CA-02, §16 T3.2)
2. `schema/implantation/T3_CLASSES_POLITICA.md` (classes e payloads)
3. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção J — PR-T3.2)
4. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3 — microetapa 1)
5. **L03** — Mapa Canônico do Funil (obrigatório)
6. L07–L08 — Estado Civil (casado civil→conjunto)
7. L09–L10 — Composição Familiar (solo baixa→composição)
8. L11–L12 — Regime e Renda (autônomo→IR)
9. L19 — Memorial MCMV (estrangeiro sem RNM→bloqueio)
10. `schema/implantation/T2_LEAD_STATE_V1.md`
11. `schema/implantation/T2_POLITICA_CONFIANCA.md`
12. `schema/implantation/T2_DICIONARIO_FATOS.md`
13. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
14. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
15. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
