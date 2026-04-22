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
| 7 | Telemetria e Observabilidade                   | `TELEMETRIA_E_OBSERVABILIDADE_STATUS.md`     | concluída        |
| 8 | Rollout                                        | `ROLLOUT_STATUS.md`                          | encerrada        |

## Contratos Extraordinários

| # | Módulo                                                                              | Arquivo de status                                                                              | Estado atual    |
|---|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|-----------------|
| E1 | Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional                | `EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md`          | concluída |

---

## Regras

1. Cada frente deve ter exatamente um arquivo de status vivo neste diretório.
2. O status é atualizado ao final de cada tarefa, conforme o CODEX_WORKFLOW.
3. O estado nesta tabela deve refletir sempre o estado mais recente do arquivo de status correspondente.
4. Novas frentes devem ser adicionadas a esta tabela antes da abertura de contrato.

## Ultima sincronizacao

- 2026-04-22 — Frente 6 Meta/WhatsApp encerrada formalmente apos PR4, com smoke integrado final aprovado e contrato arquivado. Proxima frente autorizada: Frente 7 — Telemetria e Observabilidade.
- 2026-04-22 — Frente 7 Telemetria e Observabilidade aberta formalmente. Proximo passo autorizado: PR2 — contrato tecnico de observabilidade/telemetria.
- 2026-04-22 — Frente 7 executou PR2 (contrato tecnico de observabilidade/telemetria). Proximo passo autorizado: PR3 — runtime minimo de observabilidade no Worker/repo.
- 2026-04-22 — Frente 7 executou PR3 (runtime minimo de observabilidade no Worker/repo). Proximo passo autorizado: PR4 — smoke integrado + closeout formal da Frente 7.
- 2026-04-22 — Frente 7 executou PR4 (smoke integrado + closeout formal), encerrou e arquivou contrato. Proximo contrato autorizado: Frente 8 — Rollout.
- 2026-04-22 — Frente 8 Rollout aberta formalmente com contrato ativo e estado `contrato aberto`. Proximo passo autorizado: PR2 — contrato tecnico de rollout.
- 2026-04-22 — Frente 8 executou PR2 (contrato tecnico de rollout) e permanece em `em execucao`. Proximo passo autorizado: PR3 — runtime minimo/controladores de rollout.
- 2026-04-22 — Frente 8 executou PR4 (smoke integrado final + closeout formal), encerrou e arquivou contrato em `schema/contracts/archive/CONTRATO_ROLLOUT_2026-04-22.md`. Frente 8 é a última frente formal do macro ENOVA 2. Ativação real requer contrato extraordinário explícito quando autorizado.
- 2026-04-22 — Contrato Extraordinário E1 aberto: Módulo de Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional. Status vivo criado em `EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md`. Próximo passo autorizado: PR2 — contrato técnico do módulo.
- 2026-04-22 — Contrato Extraordinário E1 executou PR3 (runtime mínimo técnico/local em `src/e1/` com hooks mínimos no Worker/canal e smoke dedicado). Estado permanece `em execução`. Próximo passo autorizado: PR4 — smoke integrado + closeout formal do contrato extraordinário E1.
- 2026-04-22 — Contrato Extraordinário E1 executou PR4 (smoke integrado final + closeout formal), encerrou e arquivou o contrato em `schema/contracts/extraordinary/archive/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_2026-04-22.md`. Não há contrato extraordinário ativo no momento; próximo passo depende de decisão estratégica.
