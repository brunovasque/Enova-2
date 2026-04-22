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
| 1 | Core Mecânico 2                                | `CORE_MECANICO_2_STATUS.md`                  | concluída        |
| 2 | Speech Engine e Surface Única                  | `SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`      | concluída        |
| 3 | Contexto, Extração Estruturada e Memória Viva  | `CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`   | concluída        |
| 4 | Supabase Adapter e Persistência                | `SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`  | encerrada        |
| 5 | Áudio e Multimodalidade                        | `AUDIO_E_MULTIMODALIDADE_STATUS.md`          | concluída        |
| 6 | Meta/WhatsApp                                  | `META_WHATSAPP_STATUS.md`                    | concluída        |
| 7 | Telemetria e Observabilidade                   | *(a criar)*                                  | não iniciada     |
| 8 | Rollout                                        | *(a criar)*                                  | não iniciada     |

---

## Regras

1. Cada frente deve ter exatamente um arquivo de status vivo neste diretório.
2. O status é atualizado ao final de cada tarefa, conforme o CODEX_WORKFLOW.
3. O estado nesta tabela deve refletir sempre o estado mais recente do arquivo de status correspondente.
4. Novas frentes devem ser adicionadas a esta tabela antes da abertura de contrato.

## Ultima sincronizacao

- 2026-04-22 — Frente 6 Meta/WhatsApp encerrada formalmente apos PR4, com smoke integrado final aprovado e contrato arquivado. Proxima frente autorizada: Frente 7 — Telemetria e Observabilidade.
