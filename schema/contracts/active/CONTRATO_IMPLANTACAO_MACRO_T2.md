# CONTRATO — T2 Estado Estruturado, Memória e Reconciliação — ENOVA 2

| Campo                             | Valor                                                                             |
|-----------------------------------|-----------------------------------------------------------------------------------|
| Frente                            | T2 — Estado estruturado, memória e reconciliação                                  |
| Fase do A01                       | T2 (Semanas 3–4 da implantação macro)                                             |
| Prioridade do A01                 | 3                                                                                 |
| Dependências                      | G1 APROVADO (READINESS_G1.md), contrato T1 encerrado                             |
| Legados aplicáveis                | L03 (obrigatório); L04–L19 (conforme microetapa)                                 |
| Status                            | skeleton — aguardando PR-T2.0                                                     |
| Última atualização                | 2026-04-23                                                                        |

> **SKELETON** — Este contrato não está ativo para execução. PR-T2.0 deve preencher o corpo
> completo conforme `schema/CONTRACT_SCHEMA.md`.

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## Microetapas obrigatórias do mestre (seção T2)

Conforme `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T2:

1. Definir nomes canônicos dos fatos (sem duplicidade semântica).
2. Separar fato bruto, fato confirmado, inferência, hipótese e pendência.
3. Política de confiança por origem (texto explícito, indireto, áudio, doc, inferência).
4. Resumo persistido para turnos longos.
5. Mapear fatos vindos do legado e como serão reconciliados.

---

## Escopo previsto (a ser detalhado em PR-T2.0)

- Schema canônico de fatos (Supabase).
- Separação semântica: fato bruto × confirmado × inferência × hipótese × pendência.
- Política de confiança por origem de dado.
- Mecanismo de resumo persistido para conversas longas.
- Mapeamento de fatos legados E1 → estrutura T2.
- Reconciliação de dados contraditórios.

---

## Fora de escopo (preliminar)

- Policy engine declarativo — T3.
- Orquestrador de turno — T4.
- Migração funcional do funil E1 — T5.
- Áudio/multimodalidade — T6.
- Qualquer alteração em `src/`, `package.json`, `wrangler.toml` sem PR-T2.x autorizada.

---

## Próximo passo autorizado

PR-T2.0 — Abertura do contrato de Estado Estruturado (preencher este skeleton).

Leituras obrigatórias para PR-T2.0:
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.0)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` (este skeleton)
4. `schema/implantation/READINESS_G1.md` (smoke e limitações residuais de T1)
5. `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`
6. Artefatos T1 completos (T1_CAMADAS, T1_CONTRATO_SAIDA, T1_TAXONOMIA, T1_COMPORTAMENTOS)
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`
13. `schema/CONTRACT_SCHEMA.md`

---

## Histórico de atualizações

### 2026-04-23 — Skeleton criado via PR-T1.R

- Skeleton criado após G1 APROVADO.
- T2 autorizada conforme trava 8.5 do CODEX_WORKFLOW.
- PR-T2.0 desbloqueada para preencher o corpo deste contrato.
