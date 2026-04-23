# CONTRACTS — Indice Canonico de Contratos — ENOVA 2

## Finalidade

Este indice registra o contrato ativo da implantacao e preserva os contratos historicos por frente.

O tronco macro soberano e:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Em conflito de macro, ordem ou gate, o mestre em `schema/source/` prevalece.

## Precedencia

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` > A00 > A01 > A00-ADENDO-01 > A00-ADENDO-02 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicaveis

Adendos canônicos ativos:
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala, mecânico jamais com prioridade de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade da Enova 2 como atendente especialista MCMV; guia de leitura das fases T1/T3/T4/T5/T6 com travas contra má interpretação.

Toda abertura de contrato de frente deve declarar conformidade com ambos os adendos.

---

## Contrato macro ativo

| Fase | Contrato ativo | Status | Gate aberto | Data de abertura | PR atual | Proximo passo autorizado |
|------|----------------|--------|-------------|------------------|----------|--------------------------|
| T0 — Congelamento, inventario e mapa do legado vivo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` | aberto | G0 — inventario legado | 2026-04-22 | PR-T0.1 — inventario legado vivo (continuidade documental) | T0-PR2 — inventario legado vivo |

---

## Regra de leitura obrigatoria

Toda tarefa futura deve ler:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — Bíblia Canônica de PRs (sequência inviolável)
3. `schema/contracts/_INDEX.md`
4. O contrato/fase/PR ativa do recorte atual
5. Status e handoff vivos do recorte atual (handoffs no formato `schema/handoffs/PR_HANDOFF_TEMPLATE.md`)
6. Abrir a PR conforme `schema/execution/PR_EXECUTION_TEMPLATE.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — em toda PR que toque conversa, LLM, speech ou fluxo cognitivo
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — obrigatório em toda PR de T1, T3, T4, T5 ou T6

---

## Rebase canonico

Os contratos abaixo continuam preservados como historico tecnico, mas nao representam implantacao
macro concluida. Eles comprovam recortes locais, estruturais ou tecnicos previamente explorados.

Documentos de rebase:

- `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md`
- `schema/implantation/PLANO_EXECUTIVO_T0_T7.md`
- `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
- `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`

---

## Recortes historicos por frente

| # | Frente | Contrato arquivado | Estado canonico apos rebase | Observacao |
|---|--------|--------------------|-----------------------------|------------|
| 1 | Core Mecânico 2 | `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_2026-04-21.md` | historico tecnico/local | Material aproveitavel para T0/T1/T3; nao prova policy macro completa |
| 2 | Speech Engine e Surface Única | `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md` | historico tecnico/local | Nao prova contrato cognitivo LLM-first final de T1 |
| 3 | Contexto, Extração Estruturada e Memória Viva | `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md` | historico tecnico/local | Nao prova estado macro v1 de T2 |
| 4 | Supabase Adapter e Persistência | `schema/contracts/archive/CONTRATO_SUPABASE_ADAPTER_E_PERSISTENCIA_2026-04-21.md` | historico tecnico/local | Nao prova Supabase real novo/produtivo macro |
| 5 | Áudio e Multimodalidade | `schema/contracts/archive/CONTRATO_AUDIO_E_MULTIMODALIDADE_2026-04-21.md` | historico tecnico/local | Nao prova STT/TTS real nem T6 |
| 6 | Meta/WhatsApp | `schema/contracts/archive/CONTRATO_META_WHATSAPP_2026-04-22.md` | historico tecnico/local | Nao prova Meta real |
| 7 | Telemetria e Observabilidade | `schema/contracts/archive/CONTRATO_TELEMETRIA_E_OBSERVABILIDADE_2026-04-22.md` | historico tecnico/local | Nao prova observabilidade profunda externa |
| 8 | Rollout | `schema/contracts/archive/CONTRATO_ROLLOUT_2026-04-22.md` | historico tecnico/local | Nao prova shadow/canary/cutover real |

Artefatos auxiliares antigos do Core foram arquivados para remover ambiguidade em `active/`:

- `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP_AUX_2026-04-22.md`
- `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES_AUX_2026-04-22.md`

---

## Contratos extraordinarios

Indice canonico: `schema/contracts/extraordinary/_INDEX.md`

| # | Modulo | Contrato arquivado | Estado canonico apos rebase | Observacao |
|---|--------|--------------------|-----------------------------|------------|
| E1 | Memoria, Base Normativa, Regras Comerciais e Aprendizado Operacional | `schema/contracts/extraordinary/archive/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_2026-04-22.md` | historico tecnico/local | Aproveitavel para T1/T2/T3; nao prova ingestao real, motor comercial real ou aprendizado grande |

---

## Status canonicos de contrato

| Status | Significado |
|--------|-------------|
| `aberto` | Contrato criado e execucao autorizada no recorte declarado |
| `em execucao` | Pelo menos uma PR de execucao ja foi feita contra este contrato |
| `bloqueado` | Contrato nao pode avancar sem resolver gate ou conflito |
| `encerrado` | Contrato encerrado via `CONTRACT_CLOSEOUT_PROTOCOL.md` |
| `arquivado` | Contrato movido para `archive/` apos encerramento |
| `historico tecnico/local` | Recorte preservado como evidencia tecnica, sem equivaler a implantacao macro concluida |

---

## Estrutura de diretorios

```text
schema/contracts/
├── _INDEX.md
├── CONTRACT_EXECUTION_PROTOCOL.md
├── CONTRACT_CLOSEOUT_PROTOCOL.md
├── active/
│   └── CONTRATO_IMPLANTACAO_MACRO_T0.md
├── archive/
│   └── contratos encerrados e artefatos auxiliares historicos
└── extraordinary/
    └── contratos extraordinarios ativos/arquivados
```

---

## Ultima sincronizacao

- 2026-04-22 — Rebase canonico aplicado. O macro soberano passa a ser `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
- 2026-04-22 — Repo reposicionado em T0/G0. Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`.
- 2026-04-22 — Proximo passo autorizado: T0-PR2 — inventario legado vivo.
- 2026-04-23 — Adicionado A00-ADENDO-02 (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`) na cadeia de precedência. Toda abertura de contrato de frente deve declarar conformidade com A00-ADENDO-01 e A00-ADENDO-02.
- 2026-04-23 — Evidencia documental de continuidade de `PR-T0.1` internalizada em `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`; contrato T0 permanece aberto em G0.
