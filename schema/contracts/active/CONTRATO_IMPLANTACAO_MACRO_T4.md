# CONTRATO — T4 Orquestrador de Turno LLM-first — ENOVA 2

> **SKELETON — aguardando PR-T4.0 para preenchimento do corpo completo.**
> Este arquivo foi criado por PR-T3.R como consequência de G3 APROVADO.
> PR-T4.0 deve preencher este contrato conforme `schema/CONTRACT_SCHEMA.md`.

| Campo                             | Valor                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Frente                            | T4 — Orquestrador de turno LLM-first                                                         |
| Fase do A01                       | T4 (semanas 7–8 da implantação macro)                                                        |
| Dependências                      | G3 APROVADO (`schema/implantation/READINESS_G3.md`), contrato T3 encerrado                  |
| Status                            | **skeleton** — aguardando PR-T4.0                                                            |
| Última atualização                | 2026-04-25 (criação do skeleton por PR-T3.R)                                                 |

---

## Microetapas obrigatórias do mestre T4

1. Padronizar entrada (mensagem, anexos, canal, contexto resumido, estado, políticas, objetivo).
2. Executar LLM com contrato único, capturar texto e estrutura.
3. Passar saída pelo policy engine e reconciliador antes de persistir.
4. Gerar resposta, registrar rastro, publicar métricas mínimas.
5. Fallbacks: erro de modelo, formato inválido, omissão de campos, contradição séria.

---

## Próximo passo autorizado

**PR-T4.0 — Abertura formal do contrato T4**

Preencher este skeleton com corpo completo conforme `schema/CONTRACT_SCHEMA.md`:
- §1 Objetivo; §2 Escopo; §3 Fora de escopo; §4 Dependências; §5 Entradas; §6 Saídas;
- §7 Critérios de aceite; §8 Provas; §9 Bloqueios; §10 Próximo passo; §11 Relação A01;
- §12 Legados; §13 Referências; §14 Blocos legados; §15 Ordem mínima leitura;
- §16 Quebra de PRs T4.0–T4.R; §17 Gate G4.

---

*Arquivo criado automaticamente por PR-T3.R em 2026-04-25 como consequência de G3 APROVADO.*
*Corpo a ser preenchido por PR-T4.0 conforme CONTRACT_SCHEMA.md e PR_BIBLIA_CANONICA seção K.*
