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
