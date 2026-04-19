# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                     | Valor                                                        |
|---------------------------|--------------------------------------------------------------|
| Frente                    | Core Mecânico 2                                              |
| Contrato ativo            | Nenhum contrato ativo — aguardando abertura                  |
| Item do A01               | Fase 0 concluída / Fase 1 — Prioridade 1 aguardando         |
| Estado atual              | não iniciada                                                 |
| Última PR                 | PR #2 (contexto vivo e legados — documental)                 |
| Último commit             | Nenhum commit de implementação técnica                       |
| Próximo passo autorizado  | Abrir contrato do Core Mecânico 2                            |
| Legados aplicáveis        | L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17 |
| Última atualização        | 2026-04-19T22:44:00Z                                        |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

Nenhum contrato ativo — aguardando abertura.
A frente depende da conclusão da fundação documental (Fase 0) e da organização do contexto vivo do repositório para que o contrato possa ser aberto com segurança.

## 3. Item do A01

- **Fase**: Fase 0 (fundação documental) — concluída com trio-base + workflow + legados organizados.
- **Próxima fase**: Fase 1 — scaffold técnico e shape macro.
- **Prioridade do backlog**: Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.
- **Gate aplicável**: Gate 1 — sem contrato da frente, não começa implementação.

## 4. Estado atual

**não iniciada**

A frente Core Mecânico 2 ainda não possui contrato aberto nem execução técnica.
A fundação documental (A00 + A01 + A02 + CODEX_WORKFLOW) está pronta.
A camada de contexto vivo (status, handoffs, schemas de contrato) está sendo estabelecida nesta PR.
Os 19 legados estão organizados e amarrados ao repositório.

## 5. Última PR

PR #2 — Criação da camada de contexto vivo e incorporação dos 19 legados (documental, sem implementação funcional).

## 6. Último commit

Nenhum commit de implementação técnica. Apenas commits documentais da fundação.

## 7. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW com protocolo obrigatório de execução
- [x] README_EXECUCAO com ordem de leitura
- [x] AGENT_CONTRACT com mandato e regras
- [x] PULL_REQUEST_TEMPLATE com formato padrão
- [x] CONTRACT_SCHEMA — formato obrigatório de contrato novo
- [x] STATUS_SCHEMA — formato obrigatório de status vivo
- [x] HANDOFF_SCHEMA — formato obrigatório de handoff persistido
- [x] Estrutura de status vivos e handoffs
- [x] Incorporação dos 19 legados em estrutura canônica

## 8. Pendências

- [ ] Abrir contrato formal do Core Mecânico 2 (próximo passo autorizado)
- [ ] Definir objetivos/stages do Core Mecânico 2 no contrato
- [ ] Scaffold técnico do repositório (Fase 1 do A01)

## 9. Bloqueios

Nenhum bloqueio ativo.
A frente está pronta para abertura de contrato assim que esta PR for aceita.
Gate 1 do A01 se aplica: sem contrato da frente, não começa implementação.

## 10. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo o formato definido em `schema/CONTRACT_SCHEMA.md`, com:
- Escopo alinhado ao A01 (Prioridade 1)
- Legados aplicáveis conforme A02 (L03 + famílias L04-L17)
- Dependências satisfeitas (trio-base + workflow + contexto vivo)

## 11. Legados aplicáveis

Conforme A02, seções 4 e 5:
- **L03** — Mapa canônico do funil (obrigatório sempre que a frente tocar funil, coleta, parse ou nextStage)
- **L04–L06** — Topo do funil (contrato, parser e critérios do topo)
- **L07–L10** — Meio A — estado civil e composição
- **L11–L14** — Meio B — regime, renda e gates
- **L15–L16** — Especiais / familiar / P3 / multi
- **L17** — Final operacional / docs / visita / correspondente

## 12. Última atualização

- **Data**: 2026-04-19T22:44:00Z
- **Responsável**: Copilot (PR #2 — camada de contexto vivo)
