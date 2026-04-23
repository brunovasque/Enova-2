# INDEX_LEGADO_MESTRE — Índice Operacional do Legado Mestre Unificado

## Rebase canonico — 2026-04-22

O tronco macro soberano da implantacao passa a ser `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

Este indice permanece como apoio operacional por blocos L/C. Ele nao substitui o mestre em
`schema/source/` e nao prevalece em conflito de macro, ordem T0-T7 ou gates G0-G7.

## Finalidade

Este índice é o painel operacional do legado mestre unificado. Ele informa, por bloco, qual é a função, quais frentes o consomem, em que ordem deve ser lido, e qual é o status real de incorporação.

Substitui o antigo `INDEX_19_LEGADOS.md` e cobre também os 9 documentos complementares.

**Regra de uso:** antes de qualquer execução contratual, o agente deve consultar este índice para identificar os blocos obrigatórios e complementares da frente ativa — e declarar essa seleção no campo "Blocos legados aplicáveis" do contrato.

## Fonte

- **Markdown soberano de implantacao**: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **PDF mestre (fonte bruta canônica)**: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` ← **disponível no repo**
- **Markdown auxiliar por blocos**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

## Precedência

schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md > A00 > A01 > A02 > contrato/fase ativa > legado mestre auxiliar (blocos aplicáveis).

---

## Bloco L — 19 Legados da Enova 1

| Código | Nome canônico | Classe / Família | Função | Frentes aplicáveis | Ordem de leitura na frente | Âncora no mestre | Status de incorporação | Observação |
|--------|--------------|-----------------|--------|-------------------|---------------------------|-----------------|----------------------|------------|
| L01 | Plano Macro / Handoff Canônico (Parte 1) | Plano macro / handoff | Contexto geral, objetivo maior, decisões já tomadas — continuidade estratégica | Todas (governança) | 1 — ler antes do A01 quando necessário contexto histórico | `#l01` | Identificado estruturalmente — não transcrito | Título confirmado; conteúdo referenciado no PDF; sem transcrição para o markdown |
| L02 | Plano Macro / Handoff Canônico (Parte 2) | Plano macro / handoff | Continuidade do L01 — detalhamento e decisões complementares de continuidade | Todas (governança) | 2 — ler imediatamente após L01 se contexto histórico necessário | `#l02` | Identificado estruturalmente — não transcrito | Título confirmado; conteúdo referenciado no PDF; sem transcrição para o markdown |
| L03 | Mapa Canônico do Funil | Mapa canônico do funil | Stages, gates, transições e microregras do funil — referência central de fluxo | Core Mecânico 2, Speech, Contexto, Supabase | 1 — **obrigatório como primeiro bloco de negócio em qualquer frente de funil** | `#l03` | Identificado estruturalmente — não transcrito | Bloco mais crítico do legado; referência obrigatória para Core Mecânico 2; conteúdo no PDF |
| L04 | Topo do Funil — Contrato | Topo do funil | Contrato e regras operacionais do topo do funil | Core Mecânico 2 | 2 — ler após L03 para frentes de topo | `#l04` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (frente de topo); conteúdo no PDF |
| L05 | Topo do Funil — Parser | Topo do funil | Parser e critérios de extração do topo | Core Mecânico 2, Contexto/Extração | 3 — ler após L04 para implementação de parser no topo | `#l05` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 e Contexto; conteúdo no PDF |
| L06 | Topo do Funil — Critérios | Topo do funil | Critérios de aceite e validação do topo | Core Mecânico 2 | 4 — ler após L05 para critérios de gate no topo | `#l06` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2; conteúdo no PDF |
| L07 | Meio A — Estado Civil (Parte 1) | Meio A — composição | Regras de estado civil e impacto na composição familiar | Core Mecânico 2 | 5 — ler após blocos de topo para frentes de Meio A | `#l07` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Meio A); conteúdo no PDF |
| L08 | Meio A — Estado Civil (Parte 2) | Meio A — composição | Continuação de regras de composição por estado civil | Core Mecânico 2 | 6 — ler imediatamente após L07 | `#l08` | Identificado estruturalmente — não transcrito | Complementar a L07; conteúdo no PDF |
| L09 | Meio A — Composição Familiar (Parte 1) | Meio A — composição | Microregras de composição familiar — elegibilidade e dependentes | Core Mecânico 2 | 7 — ler após L07-L08 para composição familiar | `#l09` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Meio A); conteúdo no PDF |
| L10 | Meio A — Composição Familiar (Parte 2) | Meio A — composição | Continuação de microregras de composição familiar | Core Mecânico 2 | 8 — ler imediatamente após L09 | `#l10` | Identificado estruturalmente — não transcrito | Complementar a L09; conteúdo no PDF |
| L11 | Meio B — Regime e Renda (Parte 1) | Meio B — regime/renda | Regras de regime de bens, renda e IR — base para elegibilidade | Core Mecânico 2 | 9 — ler após blocos de Meio A para frentes de Meio B | `#l11` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Meio B); conteúdo no PDF |
| L12 | Meio B — Regime e Renda (Parte 2) | Meio B — regime/renda | Continuação de regras de regime e renda | Core Mecânico 2 | 10 — ler imediatamente após L11 | `#l12` | Identificado estruturalmente — não transcrito | Complementar a L11; conteúdo no PDF |
| L13 | Meio B — CTPS e Dependentes | Meio B — regime/renda | Regras de CTPS, dependentes e restrições de elegibilidade | Core Mecânico 2 | 11 — ler após L11-L12 para CTPS e dependentes | `#l13` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Meio B); conteúdo no PDF |
| L14 | Meio B — Gates e Restrições | Meio B — regime/renda | Gates de bloqueio e restrições de elegibilidade do Meio B | Core Mecânico 2 | 12 — ler após L11-L13 para validar gates de Meio B | `#l14` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Meio B); conteúdo no PDF |
| L15 | Especiais — Trilhos P3 / Multi | Especiais / familiar | Trilhos especiais e variantes P3 e multi-proponente | Core Mecânico 2 | 13 — ler após Meio A e B para trilhos especiais | `#l15` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Especiais); conteúdo no PDF |
| L16 | Especiais — Familiar e Variantes | Especiais / familiar | Composição familiar especial e variantes de elegibilidade | Core Mecânico 2 | 14 — ler imediatamente após L15 | `#l16` | Identificado estruturalmente — não transcrito | Complementar a L15; conteúdo no PDF |
| L17 | Final Operacional / Docs / Visita | Final operacional | Transição final do funil, documentos, handoff e visita | Core Mecânico 2 | 15 — ler ao tratar da fase final do funil | `#l17` | Identificado estruturalmente — não transcrito | Obrigatório para Core Mecânico 2 (Final); conteúdo no PDF |
| L18 | Runner / QA / Telemetria | Runner / QA / telemetria | Matriz de teste, critérios de aceite e observabilidade operacional | Todas (telemetria, QA, rollout) | Complementar — ler ao abrir frentes de QA, rollout ou telemetria | `#l18` | Identificado estruturalmente — não transcrito | Referência para todas as frentes em fases de prova e rollout; conteúdo no PDF |
| L19 | Memorial do Programa / Analista MCMV | Memorial do programa | Regras substantivas do programa MCMV, exigências por perfil, analista virtual | Core Mecânico 2, Contexto, Áudio, Analista MCMV | Complementar — ler ao tratar de interpretação de perfil ou política do programa | `#l19` | Identificado estruturalmente — não transcrito | Obrigatório para frente de Analista MCMV; relevante para Core e Contexto; conteúdo no PDF |

---

## Bloco C — 9 Documentos Complementares

> **ATENÇÃO:** os títulos, funções e frentes dos blocos C ainda não foram confirmados via leitura direta do PDF. As linhas abaixo representam estrutura reservada — não são afirmações de conteúdo.

| Código | Nome (provisório) | Função | Frentes aplicáveis | Ordem de leitura | Âncora no mestre | Status de incorporação | Observação |
|--------|------------------|--------|-------------------|-----------------|-----------------|----------------------|------------|
| C01 | Documento Complementar 1 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c01` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C02 | Documento Complementar 2 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c02` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C03 | Documento Complementar 3 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c03` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C04 | Documento Complementar 4 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c04` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C05 | Documento Complementar 5 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c05` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C06 | Documento Complementar 6 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c06` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C07 | Documento Complementar 7 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c07` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C08 | Documento Complementar 8 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c08` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |
| C09 | Documento Complementar 9 | A confirmar via leitura do PDF | A confirmar | A confirmar | `#c09` | Estrutura reservada — não confirmado | Título, função e frentes a definir após leitura direta do PDF |

---

## Amarração por frente — blocos obrigatórios e complementares

| Frente | Blocos obrigatórios | Blocos complementares | Ordem mínima de leitura |
|--------|--------------------|-----------------------|------------------------|
| Core Mecânico 2 | L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17 | L01, L02, L18, L19, C* | L03 → L04→L06 (topo) → L07→L10 (Meio A) → L11→L14 (Meio B) → L15→L16 (Especiais) → L17 (Final) |
| Speech Engine e Surface Única | L03 | L01, L02, família da frente ativa, C* | L03 → legados da frente ativa |
| Contexto, Extração e Memória Viva | L03, L05, L19 | família da frente ativa, C* | L03 → L05 → L19 |
| Supabase Adapter e Persistência | L03, L18 | contrato da frente ativa, C* | L03 → L18 |
| Áudio e Multimodalidade | L19 | L03, contrato da frente ativa, C* | L19 → L03 |
| Meta/WhatsApp | L18 | contrato da frente ativa, C* | L18 |
| Telemetria e Observabilidade | L18 | L03, contrato da frente ativa, C* | L18 → L03 |
| Rollout | L18 | L03, contrato da frente ativa, C* | L18 → L03 |

> **C\***: blocos complementares serão amarrados por frente após confirmação dos títulos e funções via leitura direta do PDF.

---

## Regra de consulta

1. Identificar a frente ativa.
2. Consultar a tabela "Amarração por frente" acima.
3. Verificar o status de incorporação de cada bloco necessário.
4. Se o bloco está transcrito: navegar à âncora no `LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
5. Se o bloco não está transcrito: referenciar diretamente o PDF em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
6. Nunca ler o documento inteiro por padrão.
7. Declarar os blocos consultados no campo "Blocos legados aplicáveis" do contrato ativo.

---

## Status canônicos de incorporação

| Status | Significado |
|--------|-------------|
| `Estrutura reservada — não confirmado` | Bloco C com estrutura reservada; título, função e frentes ainda não confirmados via PDF |
| `Identificado estruturalmente — não transcrito` | Título e domínio identificados; conteúdo do PDF ainda não transcrito para o markdown |
| `Transcrito` | Conteúdo transcrito do PDF com fidelidade para o markdown |
| `Revisado e validado` | Conteúdo revisado por humano e confirmado como fiel ao original |
