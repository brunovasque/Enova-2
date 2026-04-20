# STATUS — Índice de Status Vivos por Frente

## Finalidade

Este índice centraliza todas as frentes da ENOVA 2 e seus respectivos arquivos de status vivo.
Qualquer agente ou humano deve consultar este índice para localizar o estado atual de qualquer frente.

## Formato dos arquivos de status

Todo arquivo de status segue o formato definido em `schema/STATUS_SCHEMA.md`.

## Precedência

Este índice está subordinado ao A00, A01, A02 e ao STATUS_SCHEMA.

---

## Frentes registradas

| # | Frente                                         | Arquivo de status                            | Estado atual     |
|---|------------------------------------------------|----------------------------------------------|------------------|
| 1 | Core Mecânico 2                                | `CORE_MECANICO_2_STATUS.md`                  | em execução      |
| 2 | Speech Engine e Surface Única                  | *(a criar)*                                  | não iniciada     |
| 3 | Contexto, Extração Estruturada e Memória Viva  | *(a criar)*                                  | não iniciada     |
| 4 | Supabase Adapter e Persistência                | *(a criar)*                                  | não iniciada     |
| 5 | Áudio e Multimodalidade                        | *(a criar)*                                  | não iniciada     |
| 6 | Meta/WhatsApp                                  | *(a criar)*                                  | não iniciada     |
| 7 | Telemetria e Observabilidade                   | *(a criar)*                                  | não iniciada     |
| 8 | Rollout                                        | *(a criar)*                                  | não iniciada     |

---

## Regras

1. Cada frente deve ter exatamente um arquivo de status vivo neste diretório.
2. O status é atualizado ao final de cada tarefa, conforme o CODEX_WORKFLOW.
3. O estado nesta tabela deve refletir sempre o estado mais recente do arquivo de status correspondente.
4. Novas frentes devem ser adicionadas a esta tabela antes da abertura de contrato.
