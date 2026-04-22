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
| 1 | Core Mecânico 2                                | `CORE_MECANICO_2_LATEST.md`                   | 2026-04-21       |
| 2 | Speech Engine e Surface Única                  | `SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`       | 2026-04-21       |
| 3 | Contexto, Extração Estruturada e Memória Viva  | `CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`    | 2026-04-21       |
| 4 | Supabase Adapter e Persistência                | `SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`   | 2026-04-21       |
| 5 | Áudio e Multimodalidade                        | `AUDIO_E_MULTIMODALIDADE_LATEST.md`           | 2026-04-21       |
| 6 | Meta/WhatsApp                                  | `META_WHATSAPP_LATEST.md`                     | 2026-04-22       |
| 7 | Telemetria e Observabilidade                   | `TELEMETRIA_E_OBSERVABILIDADE_LATEST.md`      | 2026-04-22       |
| 8 | Rollout                                        | `ROLLOUT_LATEST.md`                            | 2026-04-22       |

## Contratos Extraordinários

| # | Módulo                                                                              | Último handoff                                                                                      | Data       |
|---|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|------------|
| E1 | Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional                | `EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md`               | 2026-04-22 |

---

## Regras

1. Cada frente tem no máximo um arquivo `_LATEST.md` neste diretório, representando o handoff mais recente.
2. Handoffs anteriores podem ser preservados com sufixo de data (`_YYYY-MM-DD.md`).
3. O handoff é atualizado ao final de cada tarefa, conforme o CODEX_WORKFLOW.
4. A data nesta tabela deve refletir sempre a data do último handoff registrado.
5. Novas frentes devem ser adicionadas a esta tabela quando seu primeiro handoff for criado.

## Ultima sincronizacao

- 2026-04-22 — Frente 6 Meta/WhatsApp encerrada formalmente apos PR4. Proximo contrato autorizado: Frente 7 — Telemetria e Observabilidade.
- 2026-04-22 — Frente 7 Telemetria e Observabilidade aberta formalmente. Proximo passo autorizado: PR2 — contrato tecnico de observabilidade/telemetria.
- 2026-04-22 — Frente 7 executou PR2 (contrato tecnico de observabilidade/telemetria). Proximo passo autorizado: PR3 — runtime minimo de observabilidade no Worker/repo.
- 2026-04-22 — Frente 7 executou PR3 (runtime minimo de observabilidade no Worker/repo). Proximo passo autorizado: PR4 — smoke integrado + closeout formal da Frente 7.
- 2026-04-22 — Frente 7 executou PR4 (smoke integrado + closeout formal), encerrou e arquivou contrato. Proximo contrato autorizado: Frente 8 — Rollout.
- 2026-04-22 — Frente 8 Rollout aberta formalmente com handoff vivo criado. Proximo passo autorizado: PR2 — contrato tecnico de rollout.
- 2026-04-22 — Frente 8 executou PR2 (contrato tecnico de rollout) e atualizou handoff vivo. Proximo passo autorizado: PR3 — runtime minimo/controladores de rollout.
- 2026-04-22 — Frente 8 executou PR4 (smoke integrado final + closeout formal) e encerrou formalmente. Frente 8 é a última frente formal do macro ENOVA 2. Ativação real requer contrato extraordinário explícito quando autorizado.
- 2026-04-22 — Contrato Extraordinário E1 aberto: Módulo de Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional. Handoff vivo criado em `EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md`. Próximo passo autorizado: PR2 — contrato técnico do módulo.
- 2026-04-22 — Contrato Extraordinário E1 executou PR3 (runtime mínimo técnico/local) com handoff vivo atualizado. Próximo passo autorizado: PR4 — smoke integrado + closeout formal do contrato extraordinário E1.
