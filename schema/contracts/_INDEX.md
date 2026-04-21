# CONTRACTS — Índice de Contratos Ativos por Frente — ENOVA 2

## Finalidade

Este índice é o registro canônico de qual contrato está ativo em cada frente da ENOVA 2.
Ele deve ser consultado obrigatoriamente antes de qualquer PR de execução, conforme o `CODEX_WORKFLOW.md`.

**Regra fundamental:** cada frente pode ter no máximo **1 contrato ativo** por vez.
Contratos anteriores são movidos para `schema/contracts/archive/`.

## Precedência

**A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente > documentos legados aplicáveis**

Este índice está subordinado ao A00, A01, ao A00-ADENDO-01, ao A02 e ao `CONTRACT_EXECUTION_PROTOCOL.md`.

---

## Contratos ativos por frente

| # | Frente | Contrato ativo | Status do contrato | Data de abertura | PR que abriu | Última PR que executou | Contrato anterior arquivado | Próximo contrato esperado |
|---|--------|----------------|-------------------|-----------------|-------------|----------------------|---------------------------|--------------------------|
| 1 | Core Mecânico 2 | *(nenhum — contrato anterior encerrado)* | encerrado | 2026-04-20 | PR de abertura | PR 23 — L17: Final operacional, docs, visita e handoff | `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_2026-04-21.md` | Contrato do Speech Engine |
| 2 | Speech Engine e Surface Única | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` | em execução | 2026-04-21 | PR 25 — abertura do contrato da frente sucessora do Core | PR1 textual mínima — política de IA soberana | — | Próximo recorte textual autorizado da atendente especialista MCMV |
| 3 | Contexto, Extração e Memória Viva | *(nenhum — aguardando abertura)* | aguardando abertura | — | — | — | — | — |
| 4 | Supabase Adapter e Persistência | *(nenhum — aguardando abertura)* | aguardando abertura | — | — | — | — | — |
| 5 | Áudio e Multimodalidade | *(nenhum — aguardando abertura)* | aguardando abertura | — | — | — | — | — |
| 6 | Meta/WhatsApp | *(nenhum — aguardando abertura)* | aguardando abertura | — | — | — | — | — |
| 7 | Telemetria e Observabilidade | *(nenhum — aguardando abertura)* | aguardando abertura | — | — | — | — | — |
| 8 | Rollout | *(nenhum — aguardando abertura)* | aguardando abertura | — | — | — | — | — |

---

## Status canônicos de contrato

| Status | Significado |
|--------|-------------|
| `aguardando abertura` | Nenhum contrato ativo para esta frente — aguardando criação |
| `aberto` | Contrato criado e aprovado, execução autorizada |
| `em execução` | Pelo menos uma PR de execução já foi feita contra este contrato |
| `em revisão` | Contrato em processo de revisão formal (objetivo, escopo ou critérios sendo alterados) |
| `encerrado` | Contrato encerrado via `CONTRACT_CLOSEOUT_PROTOCOL.md` |
| `arquivado` | Contrato movido para `archive/` após encerramento |

---

## Estrutura de diretórios

```text
schema/contracts/
├── _INDEX.md                          ← este arquivo (índice canônico)
├── CONTRACT_EXECUTION_PROTOCOL.md     ← protocolo de execução contratual
├── CONTRACT_CLOSEOUT_PROTOCOL.md      ← protocolo de encerramento de contrato
├── active/                            ← contratos ativos (1 por frente, máximo)
│   └── .gitkeep
└── archive/                           ← contratos encerrados e arquivados
    └── .gitkeep
```

---

## Regras

1. **Um contrato ativo por frente.** Nunca dois contratos ativos para a mesma frente.
2. **Contratos anteriores vão para `archive/`.** Nenhum contrato antigo permanece em `active/`.
3. **Este índice é atualizado obrigatoriamente** sempre que um contrato é aberto, encerrado ou arquivado.
4. **Toda PR de execução deve ler este índice** antes de executar — conforme `CODEX_WORKFLOW.md`.
5. **Contrato ativo não pode ser alterado silenciosamente por PR de execução.** Qualquer alteração de contrato é classificada como revisão contratual/governança.
6. **Contrato só encerra via protocolo formal** — ver `CONTRACT_CLOSEOUT_PROTOCOL.md`.

---

## Documentos complementares

- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — como uma PR executa um recorte do contrato ativo
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — como um contrato encerra formalmente
- `schema/CONTRACT_SCHEMA.md` — formato obrigatório de qualquer contrato novo
