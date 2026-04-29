# CONTRATO — T7 Shadow, Canary, Cutover e Rollback — ENOVA 2

> **SKELETON — Abertura formal pendente de PR-T7.0**
>
> Este arquivo é um esqueleto mínimo criado automaticamente ao fechar G6 (PR-T6.R).
> O contrato T7 completo deve ser criado em PR-T7.0, seguindo `schema/CONTRACT_SCHEMA.md`,
> com corpo executivo completo, escopo, critérios, bloqueios e gates.
> Não executar T7 antes de PR-T7.0 abrir o contrato formalmente.

| Campo                             | Valor                                                                          |
|-----------------------------------|--------------------------------------------------------------------------------|
| Frente                            | T7 — Shadow, canary, cutover e rollback                                       |
| Fase do A01                       | T7 (semanas 15–16 da implantação macro)                                       |
| Prioridade do A01                 | 8                                                                              |
| Dependências                      | G6 APROVADO — `schema/implantation/READINESS_G6.md` — **SATISFEITA em 2026-04-28** |
| Status                            | **skeleton — aguardando PR-T7.0 para abertura formal**                        |
| Última atualização                | 2026-04-28                                                                     |

---

## Pré-requisito satisfeito

G6 APROVADO em 2026-04-28 via PR-T6.R.

T6 encerrada: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`

---

## Objetivo esperado de T7 (a detalhar em PR-T7.0)

T7 entrega o **go-live controlado da ENOVA 2**: shadow mode com tráfego real de leads em paralelo
ao legado, canary gradual, cutover com confirmação e rollback seguro.

**T7 é o go-live — não é implementação de features.** Toda feature foi contratada em T1–T6.
T7 opera o que foi construído em ambiente real, com controle de tráfego e porta de saída.

---

## Escopo esperado (a detalhar em PR-T7.0)

- Shadow mode: tráfego real paralelo ao legado sem substituição
- Canary: percentual progressivo de leads para ENOVA 2
- Cutover: substituição controlada do legado
- Rollback: plano de reversão segura a qualquer momento
- Monitoramento: métricas, alertas e gate G7

---

## Fora de escopo de T7

- Novas features de T1–T6 (já foram contratadas)
- Alteração de regras MCMV (fixas em T2/T3/T5)
- Campanha comercial (fora do escopo)
- Desligamento do legado antes de G7

---

## Próxima PR autorizada

**PR-T7.0** — Abertura formal do contrato T7.

Dependência: G6 APROVADO (satisfeita em 2026-04-28).

---

## Adendos canônicos obrigatórios

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)
