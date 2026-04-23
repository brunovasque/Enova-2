# IMPLANTACAO_MACRO_LLM_FIRST_STATUS

## Estado atual

Fase macro ativa: T0 — Congelamento, inventario e mapa do legado vivo.

Gate aberto: G0 — Inventario legado.

Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`.

Base soberana: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## Ultima tarefa relevante

T0-PR2 / `PR-T0.1` — encerramento: L15-L16 elevados para "validada por referencia" via Core Mecanico 2
(branch `feat/core-especiais-p3-multi-variantes`, PDF E6.2/F2/F4); origem E1 bifurcada de mapeamento
alvo E2 em secao 13; todos os criterios de PR-T0.1 atendidos.

## O que esta PR fechou

- Atualizou `T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - secao 13: bifurcacao de prova — "Bloco legado (origem E1)" separado de "Mapeamento alvo E2";
    limitacao de transcricao Supabase E1 declarada explicitamente.
  - secao 14: todos os criterios de PR-T0.1 atendidos; PR-T0.1 encerrada; PR-T0.2 desbloqueada.
  - secao 15: L15-L16 elevados para "validada por referencia" via implementacao Core Mecanico 2
    (trilhos P3, multi e variante familiar; stage `qualification_special`; PDF E6.2/F2/F4).
  - secao 15 conclusao: todos os blocos L03-L17 em "validada por referencia".
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.1 marcada como concluida; PR-T0.2 desbloqueada.

## O que esta PR nao fechou

- Nao aprovou G0 (requer PR-T0.R apos PR-T0.2 a PR-T0.6).
- Nao abriu T1.
- Nao implementou LLM real, Supabase real, Meta real, STT/TTS real, shadow real, canary real ou cutover real.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).

## Proximo passo autorizado

PR-T0.2 — Inventario de regras e classificacao por familia.

Leituras obrigatorias para PR-T0.2:
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

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- T1 permanece bloqueada ate G0 aprovado.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## Atualizacao 2026-04-23 — Adendo canônico A00-ADENDO-02 publicado

Ultima tarefa relevante:
- Governança macro — criar adendo canônico forte de soberania LLM-MCMV, amarrar à Bíblia, ao workflow e aos documentos vivos.

O que esta PR fechou:
- Criou `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): identidade da Enova 2 como atendente especialista MCMV, visão LLM-first, divisão canônica LLM × mecânico, guia de leitura T1/T3/T4/T5/T6, proibições formais, reaproveitamento correto da E1.
- Inseriu o A00-ADENDO-02 na cadeia de precedência documental do `schema/CODEX_WORKFLOW.md`.
- Inseriu leituras obrigatórias A00-ADENDO-01 e A00-ADENDO-02 no `schema/CODEX_WORKFLOW.md` e na Bíblia.
- Criou seção S0 na Bíblia com travas LLM-first explícitas para T1, T3, T4, T5 e T6.
- Atualizou `schema/contracts/_INDEX.md`, `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` e `README.md`.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2 / PR-T0.1).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- `PR-T0.1` — inventario legado vivo e mapa de aproveitamento do repo contra o mestre.
- **A PR-T0.1 deve ler obrigatoriamente o A00-ADENDO-02 antes de executar.**

---

## Historico — Atualizacao 2026-04-23 — Workflow macro amarrado operacionalmente (PR anterior)

Ultima tarefa relevante (PR anterior):
- Governanca macro — amarrar operacionalmente no `schema/CODEX_WORKFLOW.md` a Biblia de PRs, templates obrigatorios, gates T0-T7/G0-G7 e regra de excecao contratual.

O que esta PR fechou:
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de leitura previa da PR macro.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de abertura de PR via `schema/execution/PR_EXECUTION_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de fechamento com handoff via `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava formal de excecao contratual com autorizacao manual exclusiva do Vasques.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava explicita de nao pular gates T0-T7/G0-G7.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava de nao misturar escopos e a checagem final obrigatoria de coerencia Biblia + contrato ativo + handoff vivo.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo contra o mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

---

## Atualizacao 2026-04-23 — Internalizacao canonica do reaproveitamento ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no proprio repo a classificacao executiva da base da ENOVA 1 para orientar reaproveitamento sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` com consolidacao canônica interna de:
  - cognitivo util reaproveitavel;
  - mecanico estrutural util reaproveitavel;
  - mecanico de fala explicitamente proibido;
  - riscos de copia sem filtro;
  - blocos prioritarios da ENOVA 1 para absorcao futura.
- Atualizou referencia de evidencia em:
  - `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`;
  - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (PR-T0.1).
- Reforcou diretriz de uso da E1 como materia-prima futura, sem refatoracao funcional agora.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional nem migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo).

---

## Atualizacao 2026-04-23 — Internalizacao canonica do inventario do legado vivo real da ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no repositorio ENOVA 2 o inventario do legado vivo real da ENOVA 1, sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - objetivo e criterio de evidencia do inventario;
  - fluxos vivos reais;
  - stages/estados vivos reais;
  - gates vivos reais;
  - transicoes reais e ativas;
  - blocos inconclusivos;
  - blocos com padrao de residuo/stub/legado morto;
  - divergencias entre documentacao e runtime;
  - implicacoes para T0.1 e conclusao objetiva.
- Reforcou no recorte T0.1 que a internalizacao anterior de reaproveitamento e o novo inventario vivo real sao complementares.
- Atualizou referencias minimas em contrato ativo e Biblia para consolidacao de evidencia T0.1.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional ou migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0 automaticamente.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo), com foco na preparacao de readiness de G0 sem abrir escopo funcional.

---

## Atualizacao 2026-04-23 — Inventario operacional auditavel de T0.1 (continuidade documental)

Ultima tarefa relevante:
- T0 (continuidade documental de `PR-T0.1`) — consolidar matriz de rastreabilidade de fluxos/estados e declarar lacuna remanescente sem fechamento indevido de gate.

O que esta PR fechou:
- Atualizou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - matriz de rastreabilidade operacional (fluxos topo->pos-envio_docs -> bloco legado correspondente);
  - inventario de estados/campos usados com classificacao de prova;
  - checklist de cobertura de `PR-T0.1` e decisao explicita de nao fechamento automatico.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para refletir:
  - `T0-PR1` concluida;
  - `T0-PR2` em execucao (continuidade de `PR-T0.1`);
  - lacuna remanescente documentada para readiness de G0.

O que esta PR nao fechou:
- Nao encerrou `PR-T0.1`.
- Nao fechou G0.
- Nao abriu T1.
- Nao implementou alteracao funcional em runtime.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` ate eliminar a lacuna remanescente de prova para fechamento formal da etapa.
