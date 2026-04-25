# CONTRATO — T3 Policy Engine v1 e Guardrails Declarativos — ENOVA 2

| Campo                             | Valor                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Frente                            | T3 — Policy engine v1 e guardrails declarativos                                               |
| Fase do A01                       | T3 (Semanas 5–6 da implantação macro)                                                         |
| Prioridade do A01                 | 4                                                                                             |
| Dependências                      | G2 APROVADO (`schema/implantation/READINESS_G2.md`), contrato T2 encerrado (`schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`) |
| Legados aplicáveis                | L03 (obrigatório); L05, L07–L17, L19 (complementares por microetapa)                         |
| Status                            | **skeleton** — aguardando PR-T3.0 para preencher corpo                                        |
| Última atualização                | 2026-04-24                                                                                    |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala; mecânico jamais com prioridade de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade MCMV; guia de leitura T3 com travas contra má interpretação.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Bloco E obrigatório em toda PR que feche etapa.

---

## SKELETON — corpo a ser preenchido por PR-T3.0

Este skeleton autoriza a abertura formal do contrato T3.

**PR-T3.0 deve preencher:**
- §1 Objetivo
- §2 Escopo
- §3 Fora de escopo
- §4 Dependências
- §5 Entradas
- §6 Saídas
- §7 Critérios de aceite
- §8 Provas obrigatórias
- §9 Bloqueios
- §10 Próximo passo
- §11 Relação com A01
- §12 Relação com legados
- §13 Referências
- §14 Blocos legados
- §15 Ordem mínima de leitura
- §16 Quebra de PRs T3.0–T3.R
- §17 Gate G3

**Referência para PR-T3.0:**
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção PR-T3.0
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T3
- `schema/CONTRACT_SCHEMA.md` — formato canônico

**Microetapas obrigatórias do mestre (seção T3) — preview:**
1. Transformar as regras mais sensíveis primeiro (casado civil → conjunto; autônomo → IR; renda solo baixa → composição; estrangeiro sem RNM → não avançar).
2. Definir o que é "bloquear avanço", "desviar objetivo", "pedir confirmação" e "apenas orientar".
3. Ordem estável de avaliação para evitar colisão de regras.
4. Política de composição quando várias regras disparam simultaneamente.
5. Política de veto suave.

**PROIBIDO neste skeleton:**
- Implementar policy engine real.
- Alterar `src/`, `package.json`, `wrangler.toml`.
- Criar regras de negócio sem contrato T3 formalmente aberto.
- Iniciar execução de T3 antes de PR-T3.0 preencher este corpo.
