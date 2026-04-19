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
| Legados aplicáveis        | Legado mestre unificado — blocos L03, L04–L17 (conforme INDEX_LEGADO_MESTRE.md) |
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
Os legados estão organizados em legado mestre unificado, pronto para receber o PDF mestre.

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
- [x] Incorporação dos legados em legado mestre unificado (estrutura pronta para PDF)

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
- Legados aplicáveis conforme A02 e INDEX_LEGADO_MESTRE.md (blocos L03 + L04-L17)
- Dependências satisfeitas (trio-base + workflow + contexto vivo)

## 11. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Blocos obrigatórios**: L03, L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 12. Última atualização

- **Data**: 2026-04-19T22:44:00Z
- **Responsável**: Copilot (PR #2 — camada de contexto vivo)
