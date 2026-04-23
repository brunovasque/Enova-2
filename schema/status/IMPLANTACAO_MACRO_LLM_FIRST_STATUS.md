# IMPLANTACAO_MACRO_LLM_FIRST_STATUS

## Estado atual

Fase macro ativa: T0 — Congelamento, inventario e mapa do legado vivo.

Gate aberto: G0 — Inventario legado.

Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`.

Base soberana: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## Ultima tarefa relevante

T0-PR1 — rebase canonico da implantacao.

## O que esta PR fechou

- Declarou o mestre em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` como tronco macro soberano.
- Reposicionou as frentes 1-8 e E1 como recortes historicos/tecnicos/locais, nao como implantacao macro completa.
- Persistiu ordem T0-T7 e gates G0-G7.
- Criou plano executivo T0-T7.
- Abriu contrato macro T0.

## O que esta PR nao fechou

- Nao executou inventario legado vivo completo.
- Nao aprovou G0.
- Nao abriu T1.
- Nao implementou LLM real, Supabase real, Meta real, STT/TTS real, shadow real, canary real ou cutover real.

## Proximo passo autorizado

T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo contra o mestre
`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

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
