# HANDOFFS — Indice de Handoffs

## Finalidade

Este indice centraliza o handoff macro da implantacao e preserva handoffs historicos por frente.

O tronco macro soberano e:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

## Handoff macro ativo

| Escopo | Ultimo handoff | Data | Proximo passo autorizado |
|--------|----------------|------|--------------------------|
| Implantacao macro LLM-first | `IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | 2026-04-23 | T0-PR2 — inventario legado vivo |

## Handoffs historicos por frente

Os handoffs abaixo preservam continuidade tecnica, mas nao equivalem a implantacao macro concluida.

| # | Frente | Ultimo handoff | Estado canonico apos rebase |
|---|--------|----------------|-----------------------------|
| 1 | Core Mecânico 2 | `CORE_MECANICO_2_LATEST.md` | historico tecnico/local |
| 2 | Speech Engine e Surface Única | `SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` | historico tecnico/local |
| 3 | Contexto, Extração Estruturada e Memória Viva | `CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md` | historico tecnico/local |
| 4 | Supabase Adapter e Persistência | `SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md` | historico tecnico/local |
| 5 | Áudio e Multimodalidade | `AUDIO_E_MULTIMODALIDADE_LATEST.md` | historico tecnico/local |
| 6 | Meta/WhatsApp | `META_WHATSAPP_LATEST.md` | historico tecnico/local |
| 7 | Telemetria e Observabilidade | `TELEMETRIA_E_OBSERVABILIDADE_LATEST.md` | historico tecnico/local |
| 8 | Rollout | `ROLLOUT_LATEST.md` | historico tecnico/local |

## Contratos extraordinarios historicos

| # | Modulo | Ultimo handoff | Estado canonico apos rebase |
|---|--------|----------------|-----------------------------|
| E1 | Memoria, Base Normativa, Regras Comerciais e Aprendizado Operacional | `EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md` | historico tecnico/local |

## Regras

1. Toda tarefa futura deve ler o handoff macro ativo.
2. Toda tarefa futura deve ler tambem o handoff especifico do recorte ativo, quando houver.
3. Handoffs historicos nao autorizam abertura de fase macro sem gate correspondente.
4. O proximo passo unico autorizado e T0-PR2 (equivalente a `PR-T0.1` na Bíblia Canônica de PRs).
5. **Todo handoff novo deve seguir `schema/handoffs/PR_HANDOFF_TEMPLATE.md`** — formato obrigatorio.
6. **A sequencia inviolavel de PRs esta em `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`** — leitura obrigatoria antes de qualquer handoff novo.

## Ultima sincronizacao

- 2026-04-22 — Rebase canonico aplicado. Criado handoff macro em `IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`.
- 2026-04-23 — Handoff macro atualizado com continuidade documental de `PR-T0.1` e internalizacao canonica da classificacao ENOVA 1.
- 2026-04-23 — Handoff macro atualizado com continuidade documental de `PR-T0.1` e internalizacao canonica do inventario vivo real da ENOVA 1.
