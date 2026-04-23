# STATUS — Indice de Status Vivos

## Finalidade

Este indice centraliza o status macro da implantacao e os status historicos por frente.

O tronco macro soberano e:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

## Status macro ativo

| Escopo | Arquivo de status | Estado atual | Gate | Proximo passo autorizado |
|--------|-------------------|--------------|------|--------------------------|
| Implantacao macro LLM-first | `IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | T0 — Congelamento, inventario e mapa do legado vivo | G0 — inventario legado aberto | T0-PR2 — inventario legado vivo |

## Recortes historicos por frente

Os status abaixo sao preservados como memoria de recortes tecnicos. Eles nao declaram a implantacao
macro como concluida.

| # | Frente | Arquivo de status | Estado canonico apos rebase |
|---|--------|-------------------|-----------------------------|
| 1 | Core Mecânico 2 | `CORE_MECANICO_2_STATUS.md` | historico tecnico/local |
| 2 | Speech Engine e Surface Única | `SPEECH_ENGINE_SURFACE_UNICA_STATUS.md` | historico tecnico/local |
| 3 | Contexto, Extração Estruturada e Memória Viva | `CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md` | historico tecnico/local |
| 4 | Supabase Adapter e Persistência | `SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md` | historico tecnico/local |
| 5 | Áudio e Multimodalidade | `AUDIO_E_MULTIMODALIDADE_STATUS.md` | historico tecnico/local |
| 6 | Meta/WhatsApp | `META_WHATSAPP_STATUS.md` | historico tecnico/local |
| 7 | Telemetria e Observabilidade | `TELEMETRIA_E_OBSERVABILIDADE_STATUS.md` | historico tecnico/local |
| 8 | Rollout | `ROLLOUT_STATUS.md` | historico tecnico/local |

## Contratos extraordinarios historicos

| # | Modulo | Arquivo de status | Estado canonico apos rebase |
|---|--------|-------------------|-----------------------------|
| E1 | Memoria, Base Normativa, Regras Comerciais e Aprendizado Operacional | `EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md` | historico tecnico/local |

## Regras

1. Toda tarefa futura deve consultar primeiro `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
2. Toda tarefa futura deve consultar `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` para localizar a PR correta na sequencia inviolavel.
3. O status macro ativo e a fonte primaria de estado de implantacao.
4. Status historicos por frente continuam uteis como memoria tecnica, mas nao promovem gate macro.
5. T1 permanece bloqueada ate G0 aprovado.

## Ultima sincronizacao

- 2026-04-22 — Rebase canonico aplicado. Fase real: T0. Gate aberto: G0. Proximo passo autorizado: T0-PR2 — inventario legado vivo.
- 2026-04-23 — Continuidade documental de `PR-T0.1` registrada com internalizacao canonica da classificacao ENOVA 1 em `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`. G0 permanece aberto.
- 2026-04-23 — Continuidade documental de `PR-T0.1` registrada com internalizacao canonica do inventario vivo real da ENOVA 1 em `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`. G0 permanece aberto.
