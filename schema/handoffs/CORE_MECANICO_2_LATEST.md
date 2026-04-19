# HANDOFF — Core Mecânico 2 — ENOVA 2

| Campo                     | Valor                                                        |
|---------------------------|--------------------------------------------------------------|
| Frente                    | Core Mecânico 2                                              |
| Data                      | 2026-04-19T22:44:00Z                                        |
| Estado da frente          | não iniciada                                                 |
| Item do A01 atendido      | Fase 0 — fundação documental concluída                       |
| Próximo passo autorizado  | Abrir contrato do Core Mecânico 2                            |

---

## 1. Contexto curto

O repositório fundador da ENOVA 2 está pronto. O trio-base canônico (A00 + A01 + A02) define a visão, a ordem executiva e a amarração com os legados. O CODEX_WORKFLOW estabelece o protocolo obrigatório de execução. A camada de contexto vivo (schemas de contrato, status e handoff, estrutura de status vivos e handoffs, legado mestre unificado) foi criada nesta PR.

A frente Core Mecânico 2 é a primeira frente oficial do projeto, conforme definido no A01. Ela ainda não possui contrato aberto nem execução técnica. O repositório está pronto para a abertura formal do contrato. Os legados estão unificados em arquivo mestre único, pronto para receber o PDF e transcrição.

## 2. Diagnóstico confirmado

- A00, A01 e A02 lidos e confirmados como coerentes.
- CODEX_WORKFLOW confirma o ritual obrigatório de execução.
- Precedência documental confirmada: A00 > A01 > A02 > contrato da frente > legados.
- A01 confirma: Fase 0 = fundação documental; Prioridade 1 = modelar o Core Mecânico 2.
- Gate 1 do A01 confirmado: sem contrato da frente, não começa implementação.
- A02 confirma legados aplicáveis ao Core: blocos L03 + L04-L17 do legado mestre unificado.

## 3. O que foi feito

- Trio-base canônico criado e coerente (A00 + A01 + A02).
- CODEX_WORKFLOW criado com protocolo obrigatório.
- README_EXECUCAO criado com ordem de leitura.
- AGENT_CONTRACT criado com mandato e regras.
- PULL_REQUEST_TEMPLATE criado com formato padrão.
- CONTRACT_SCHEMA criado — formato obrigatório de contrato novo.
- STATUS_SCHEMA criado — formato obrigatório de status vivo.
- HANDOFF_SCHEMA criado — formato obrigatório de handoff persistido.
- Estrutura de status vivos (`schema/status/`) com índice e estado inicial do Core Mecânico 2.
- Estrutura de handoffs (`schema/handoffs/`) com índice e handoff inicial do Core Mecânico 2.
- Estrutura de legados (`schema/legacy/`) com README, legado mestre unificado e índice operacional.
- Estrutura de fonte bruta (`schema/source/`) pronta para receber o PDF mestre.
- Atualização do CODEX_WORKFLOW para obrigar leitura de status, handoff e legados.
- Atualização do README, README_EXECUCAO e AGENT_CONTRACT para coerência.

## 4. O que não foi feito

- **Contrato do Core Mecânico 2** — deliberadamente não aberto nesta PR. Esta PR é exclusivamente de governança, memória operacional e organização dos legados.
- **Implementação técnica** — nenhuma. Nenhum código funcional, worker, app, integração ou backend.
- **Scaffold técnico** — pertence à Fase 1, após contrato aprovado.
- **Conteúdo integral dos legados** — legado mestre unificado criado com placeholders por bloco. O PDF mestre deve ser incorporado e transcrito bloco a bloco. A estrutura está pronta para receber o conteúdo.

## 5. Arquivos relevantes

- `schema/CONTRACT_SCHEMA.md`
- `schema/STATUS_SCHEMA.md`
- `schema/HANDOFF_SCHEMA.md`
- `schema/status/_INDEX.md`
- `schema/status/CORE_MECANICO_2_STATUS.md`
- `schema/handoffs/_INDEX.md`
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` *(este arquivo)*
- `schema/legacy/README.md`
- `schema/legacy/INDEX_19_LEGADOS.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- `schema/source/README.md`
- `schema/CODEX_WORKFLOW.md` *(atualizado)*
- `schema/README_EXECUCAO.md` *(atualizado)*
- `README.md` *(atualizado)*
- `.github/AGENT_CONTRACT.md` *(atualizado)*

## 6. Item do A01 atendido

- **Fase 0** — Fundação documental: A00 + A01 + A02 + contratos-base mínimos aprovados.
- **Status da Fase 0**: concluída — trio-base coerente, ordem oficial validada, contexto vivo estabelecido, legados organizados.

## 7. Estado atual da frente

**não iniciada**

A frente Core Mecânico 2 está pronta para abertura de contrato. Toda a fundação documental, memória operacional e organização de legados estão em vigor.

## 8. Próximo passo autorizado

**Abrir contrato do Core Mecânico 2**, seguindo:
- Formato: `schema/CONTRACT_SCHEMA.md`
- Escopo: Prioridade 1 do A01 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala
- Legados: blocos L03 + famílias L04-L17 do legado mestre unificado conforme A02 e INDEX_LEGADO_MESTRE.md
- Gate: Gate 1 será satisfeito com a aprovação do contrato
- Dependências: trio-base ✅, workflow ✅, contexto vivo ✅, legados organizados ✅

## 9. Riscos

- **Conteúdo dos legados** — O legado mestre unificado contém placeholders por bloco. O PDF mestre deve ser incorporado e transcrito. Risco: se o conteúdo não for transcrito antes da abertura do contrato do Core, o agente pode não ter acesso completo às regras de negócio.
- **Mitigação** — O INDEX_LEGADO_MESTRE.md indica claramente quais blocos consultar por frente. O PDF mestre pode ser enviado como complemento nas abas de execução até a transcrição completa.

## 10. Provas

- PR #2 criada com escopo exclusivamente documental.
- Nenhum arquivo de código funcional, integração, worker ou app criado.
- Estrutura de pastas `schema/status/`, `schema/handoffs/`, `schema/legacy/`, `schema/source/` criada e populada.
- Schemas de contrato, status e handoff definidos com campos obrigatórios.
- CODEX_WORKFLOW atualizado com ordem de leitura expandida e regra de atualização pós-tarefa.
- Legado mestre unificado com índice operacional e placeholders por bloco (L01-L19 + C01-C09).
