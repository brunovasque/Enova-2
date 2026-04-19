# HANDOFFS — Índice de Handoffs por Frente

## Finalidade

Este índice centraliza todos os handoffs mais recentes das frentes da ENOVA 2.
Qualquer agente ou humano deve consultar este índice para localizar o último handoff de continuidade de qualquer frente.

## Formato dos arquivos de handoff

Todo arquivo de handoff segue o formato definido em `schema/HANDOFF_SCHEMA.md`.

## Precedência

Este índice está subordinado ao A00, A01, A02 e ao HANDOFF_SCHEMA.

---

## Handoffs mais recentes por frente

| # | Frente                                         | Último handoff                                | Data             |
|---|------------------------------------------------|-----------------------------------------------|------------------|
| 1 | Core Mecânico 2                                | `CORE_MECANICO_2_LATEST.md`                   | 2026-04-19       |
| 2 | Speech Engine e Surface Única                  | *(a criar)*                                   | —                |
| 3 | Contexto, Extração Estruturada e Memória Viva  | *(a criar)*                                   | —                |
| 4 | Supabase Adapter e Persistência                | *(a criar)*                                   | —                |
| 5 | Áudio e Multimodalidade                        | *(a criar)*                                   | —                |
| 6 | Meta/WhatsApp                                  | *(a criar)*                                   | —                |
| 7 | Telemetria e Observabilidade                   | *(a criar)*                                   | —                |
| 8 | Rollout                                        | *(a criar)*                                   | —                |

---

## Regras

1. Cada frente tem no máximo um arquivo `_LATEST.md` neste diretório, representando o handoff mais recente.
2. Handoffs anteriores podem ser preservados com sufixo de data (`_YYYY-MM-DD.md`).
3. O handoff é atualizado ao final de cada tarefa, conforme o CODEX_WORKFLOW.
4. A data nesta tabela deve refletir sempre a data do último handoff registrado.
5. Novas frentes devem ser adicionadas a esta tabela quando seu primeiro handoff for criado.
