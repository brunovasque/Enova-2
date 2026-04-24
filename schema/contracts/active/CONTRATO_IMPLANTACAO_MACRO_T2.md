# CONTRATO — T2 Estado Estruturado, Memória e Reconciliação — ENOVA 2

| Campo                             | Valor                                                                                                                                                                          |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Frente                            | T2 — Estado estruturado, memória e reconciliação                                                                                                                               |
| Fase do A01                       | T2 (Semanas 3–4 da implantação macro)                                                                                                                                          |
| Prioridade do A01                 | 3                                                                                                                                                                              |
| Dependências                      | G1 APROVADO (`schema/implantation/READINESS_G1.md`), contrato T1 encerrado (`schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`)                            |
| Legados aplicáveis                | L03 (obrigatório); L05, L19 (complementares primários); L04, L07–L17 (conforme microetapa)                                                                                     |
| Referências obrigatórias          | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`, `schema/A00_PLANO_CANONICO_MACRO.md`, `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`, `schema/ADENDO_CANONICO_SOBERANIA_IA.md`, `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`, `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`, `schema/legacy/INDEX_LEGADO_MESTRE.md`, `schema/CONTRACT_SCHEMA.md` |
| Blocos legados obrigatórios       | L03                                                                                                                                                                            |
| Blocos legados complementares     | L05, L19, L04, L07–L17 (por microetapa)                                                                                                                                        |
| Ordem mínima de leitura da frente | L03 → L05 → L19                                                                                                                                                                |
| Status                            | **aberto** — PR-T2.0 executada em 2026-04-23                                                                                                                                   |
| Última atualização                | 2026-04-23                                                                                                                                                                     |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs declaram conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala; mecânico jamais com prioridade de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade da Enova 2 como atendente especialista MCMV; guia de leitura correto das fases T1/T3/T4/T5/T6.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Prova parcial/inconclusiva/lacunosa bloqueia fechamento de etapa, gate, contrato e avanço de próxima PR.

---

## 1. Objetivo

Definir e documentar o schema canônico de estado estruturado do lead para a ENOVA 2: quais fatos existem, como se classificam (bruto/confirmado/inferido/hipótese/pendência), de onde vêm, quanta confiança têm, como conflitos são detectados e reconciliados, e como o estado é resumido e persistido entre turnos longos. Este contrato **não implementa nada em produção** — produz os documentos canônicos de T2 que guiarão T3 (policy engine), T4 (orquestrador) e T5 (migração funcional).

---

## 2. Escopo

- Definir nomes canônicos dos fatos sem duplicidade semântica (`T2_DICIONARIO_FATOS.md`).
- Definir o schema estrutural do `lead_state` v1: fatos centrais, fatos derivados, pendências, conflitos, objetivo atual, histórico resumido, metadados de confiança (`T2_LEAD_STATE_V1.md`).
- Definir política de confiança por origem de dado (texto explícito, indireto, áudio, doc, inferência) (`T2_POLITICA_CONFIANCA.md`).
- Definir tipologia completa do fato (bruto × confirmado × inferência × hipótese × pendência) e mecanismo de reconciliação de conflitos (`T2_RECONCILIACAO.md`).
- Definir mecanismo de resumo persistido para conversas longas e mapa de compatibilidade transitória com o legado E1 (`T2_RESUMO_PERSISTIDO.md`).
- Validar coerência entre todos os artefatos T2 e fechar gate G2 (`READINESS_G2.md`).
- Atualizar índices, status e handoffs a cada PR.

---

## 3. Fora de escopo

- **Policy engine declarativo** — T3.
- **Orquestrador de turno e gestão de fluxo** — T4.
- **Migração funcional do funil E1 para E2** — T5.
- **Áudio, STT, TTS e multimodalidade** — T6.
- **Qualquer alteração em `src/`, `package.json`, `wrangler.toml`** sem PR-T2.x formalmente autorizada.
- **Aplicar migrations ou alterações em Supabase real** — em nenhuma PR de T2.
- **Implementação de runtime** — T2 é estrutural/documental; runtime ocorre em T4/T5.
- **Expandir o motor cognitivo da E1** — proibido por A00-ADENDO-02 e T1.5 V-13.

---

## 4. Dependências

| Dependência                        | Artefato de evidência                                                                 | Status         |
|------------------------------------|--------------------------------------------------------------------------------------|----------------|
| G1 APROVADO                        | `schema/implantation/READINESS_G1.md`                                                | APROVADO       |
| Contrato T1 encerrado              | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`              | ENCERRADO      |
| T1_CAMADAS_CANONICAS disponível    | `schema/implantation/T1_CAMADAS_CANONICAS.md`                                        | PRESENTE       |
| T1_TAXONOMIA_OFICIAL disponível    | `schema/implantation/T1_TAXONOMIA_OFICIAL.md`                                        | PRESENTE       |
| T1_CONTRATO_SAIDA disponível       | `schema/implantation/T1_CONTRATO_SAIDA.md`                                           | PRESENTE       |
| T1_COMPORTAMENTOS disponível       | `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md`                              | PRESENTE       |
| T1_SYSTEM_PROMPT disponível        | `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md`                                   | PRESENTE       |

---

## 5. Entradas

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T2 (State Store, microetapas, fatos centrais/derivados).
- `schema/implantation/READINESS_G1.md` (limitações residuais e smoke de T1).
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (56 tipos em 6 categorias — base para dicionário de fatos).
- `schema/implantation/T1_CONTRATO_SAIDA.md` (13 campos de saída — fatos que o LLM preenche).
- `schema/implantation/T1_CAMADAS_CANONICAS.md` (5 camadas — garantia de soberania LLM-first no estado).
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção T2 (sequência PR-T2.0..T2.R).
- `schema/legacy/INDEX_LEGADO_MESTRE.md` (blocos L por frente).

---

## 6. Saídas

| Artefato                                         | PR criadora | Descrição resumida                                              |
|--------------------------------------------------|-------------|-----------------------------------------------------------------|
| `schema/implantation/T2_DICIONARIO_FATOS.md`    | PR-T2.1     | Nomes canônicos dos fatos sem duplicidade semântica            |
| `schema/implantation/T2_LEAD_STATE_V1.md`       | PR-T2.2     | Schema `lead_state` v1: centrais, derivados, pendências, conflitos, metadados |
| `schema/implantation/T2_POLITICA_CONFIANCA.md`  | PR-T2.3     | Política de confiança por origem (5 origens do mestre)         |
| `schema/implantation/T2_RECONCILIACAO.md`       | PR-T2.4     | Tipologia bruto/confirmado/inferência/hipótese/pendência + reconciliação |
| `schema/implantation/T2_RESUMO_PERSISTIDO.md`   | PR-T2.5     | Resumo persistido para turnos longos + mapa de compatibilidade E1 |
| `schema/implantation/READINESS_G2.md`            | PR-T2.R     | Smoke documental + decisão formal G2 + esqueleto T3            |

---

## 7. Critérios de aceite

1. `T2_DICIONARIO_FATOS.md` cobre todos os fatos centrais e derivados identificados no mestre seção T2, sem duplicidade semântica.
2. `T2_LEAD_STATE_V1.md` define schema completo com: fatos centrais (≥14), fatos derivados (≥6), pendências, conflitos, objetivo atual, histórico resumido e metadados de confiança — todos amarrados ao dicionário T2.1.
3. `T2_POLITICA_CONFIANCA.md` cobre exatamente as 5 origens citadas pelo mestre: texto explícito, texto indireto, áudio, documento físico/digital, inferência.
4. `T2_RECONCILIACAO.md` cobre os 5 tipos canônicos de fato (bruto/confirmado/inferência/hipótese/pendência) e os casos de conflito do mestre (renda ajustada, estado civil corrigido, parceiro entra depois, autônomo revela IR).
5. `T2_RESUMO_PERSISTIDO.md` define mecanismo de compressão para turnos longos e mapeia todos os fatos E1 que seguem vindo do legado até T5.
6. Nenhum artefato de T2 viola soberania LLM-first: estado/memória não podem produzir `reply_text` diretamente; campos estruturados não redigem resposta.
7. `READINESS_G2.md` aprova G2 com smoke documental completo (todos os 6 artefatos) e 12 critérios de aceite verificados.
8. Índice `schema/contracts/_INDEX.md`, status e handoff atualizados ao final de cada PR.

---

## 8. Provas obrigatórias

- **Por PR de execução (T2.1–T2.5):** diff do artefato criado + tabela de critérios de pronto verificados + Bloco E.
- **PR-T2.R:** smoke documental 6/6 artefatos com inspeção de cada um; cenários sintéticos de validação (mínimo 3, cobrindo conflito, origem e reconciliação); 12 critérios de aceite com evidência individual; decisão formal G2 APROVADO ou G2 REPROVADO com justificativa.
- **Bloco E obrigatório** (A00-ADENDO-03) em toda PR que feche etapa, gate ou contrato.

---

## 9. Bloqueios

| Condição bloqueante                              | Ação exigida                                                        |
|--------------------------------------------------|---------------------------------------------------------------------|
| G1 não aprovado                                  | Não iniciar T2. Retornar a PR-T1.R para fechar G1 primeiro.        |
| Artefato T1 ausente ou incompleto                | Completar T1 antes de avançar T2.                                   |
| Fato canônico com duplicidade semântica em T2.1  | Não avançar para T2.2 sem resolver duplicidade.                     |
| Schema `lead_state` inconsistente com dicionário | Não avançar para T2.3 sem alinhar T2.1 ↔ T2.2.                    |
| Política de confiança com menos de 5 origens     | Não avançar para T2.4.                                              |
| Reconciliação sem cobertura dos casos do mestre  | Não avançar para T2.5.                                              |
| G2 com lacuna estrutural                         | Não criar skeleton T3 nem avançar para T3.                          |
| Qualquer PR que toque `src/` sem autorização     | Reverter imediatamente.                                             |

---

## 10. Próximo passo autorizado

**PR-T2.1 — Nomes canônicos dos fatos (sem duplicidade semântica)**

Leituras obrigatórias para PR-T2.1:
1. Este contrato (`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção PR-T2.1
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T2 (State Store — fatos centrais e derivados)
4. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (56 tipos como base)
5. `schema/implantation/T1_CONTRATO_SAIDA.md` (13 campos — fatos que LLM já preenche)
6. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
7. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)
8. `schema/CODEX_WORKFLOW.md`

---

## 11. Relação com o A01

| Campo         | Valor                                                                 |
|---------------|-----------------------------------------------------------------------|
| Fase A01      | T2 — Estado estruturado, memória e reconciliação                     |
| Semanas       | 3–4 da implantação macro                                              |
| Prioridade    | 3                                                                     |
| Gate de saída | G2 — estado estruturado funcional (schema publicado, política aprovada, reconciliação mapeada) |
| Gate de entrada | G1 APROVADO                                                        |

---

## 12. Relação com legados aplicáveis

| Legado | Nome canônico                          | Relevância para T2                                                           | Tipo         |
|--------|----------------------------------------|-------------------------------------------------------------------------------|--------------|
| L03    | Mapa Canônico do Funil                 | Stages, gates e fatos exigidos em cada etapa — base do dicionário de fatos   | Obrigatório  |
| L05    | Topo do Funil — Parser                 | Critérios de extração de fatos no topo — informa tipologia e origem          | Complementar |
| L19    | Memorial do Programa / Analista MCMV   | Regras substantivas MCMV — informa fatos derivados de elegibilidade          | Complementar |
| L04    | Topo do Funil — Contrato               | Regras do topo — conforme microetapa T2.1 e T2.2                             | Complementar |
| L07–L17 | Meio A/B / Especiais / Final         | Regras de composição, renda, CTPS, docs — consultar por microetapa           | Complementar |

---

## 13. Referências obrigatórias do contrato

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — tronco macro soberano
- `schema/A00_PLANO_CANONICO_MACRO.md` — arquitetura macro
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md` — ordem operacional T0–T7
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — soberania da IA na fala
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade e guia de leitura T2
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — fechamento por prova
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo de execução
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — protocolo de encerramento
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — sequência de PRs T2
- `schema/execution/PR_EXECUTION_TEMPLATE.md` — template de execução de PR
- `schema/handoffs/PR_HANDOFF_TEMPLATE.md` — template de handoff
- `schema/CONTRACT_SCHEMA.md` — formato canônico de contrato
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice dos blocos legados
- `schema/implantation/READINESS_G1.md` — smoke e limitações residuais de T1
- `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md` — contrato T1 encerrado
- `schema/implantation/T1_CAMADAS_CANONICAS.md` — 5 camadas canônicas
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` — 56 tipos em 6 categorias
- `schema/implantation/T1_CONTRATO_SAIDA.md` — 13 campos canônicos de saída
- `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` — 15 comportamentos / 13 proibições
- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` — system prompt v1

---

## 14. Blocos legados aplicáveis

### Obrigatórios
- **L03** — Mapa Canônico do Funil: deve ser lido antes de PR-T2.1 para mapear quais fatos o funil exige em cada stage.

### Complementares primários
- **L05** — Topo do Funil — Parser: consultar ao definir tipologia de fatos extraídos no topo.
- **L19** — Memorial do Programa / Analista MCMV: consultar ao definir fatos derivados de elegibilidade e regras do programa.

### Complementares por microetapa
- **L04** — Topo do Funil — Contrato: ao definir fatos obrigatórios do stage de topo (PR-T2.1/T2.2).
- **L07–L10** — Meio A (estado civil, composição): ao mapear fatos de composição familiar (PR-T2.1/T2.2).
- **L11–L14** — Meio B (regime, renda, CTPS, gates): ao mapear fatos de renda e elegibilidade (PR-T2.1/T2.2).
- **L15–L16** — Especiais (trilhos P3, familiar): ao mapear variantes de composição (PR-T2.1/T2.2).
- **L17** — Final Operacional / Docs / Visita: ao mapear fatos de documentação e visita (PR-T2.1/T2.2).

---

## 15. Ordem mínima de leitura da frente

Para T2 ("Contexto, Extração e Memória Viva"):

```
L03 → L05 → L19
```

Expandida por microetapa:
- PR-T2.1: L03 → L05 → L19 → T1_TAXONOMIA → T1_CONTRATO_SAIDA
- PR-T2.2: L03 → L04 → L07–L14 (por composição/renda) → T2_DICIONARIO_FATOS
- PR-T2.3: L03 → L05 → L19 → T2_LEAD_STATE_V1
- PR-T2.4: L03 → L05 → T2_POLITICA_CONFIANCA
- PR-T2.5: L03 → T2_RECONCILIACAO → artefatos E1 legados aplicáveis

---

## 16. Quebra de PRs — T2

| PR        | Título canônico                                                         | Entregável principal                            | Dependência |
|-----------|-------------------------------------------------------------------------|------------------------------------------------|-------------|
| PR-T2.0   | T2 — Abertura do contrato de estado estruturado e memória v1           | Este contrato + índice/status/handoff           | G1 APROVADO |
| PR-T2.1   | T2 — Nomes canônicos de fatos (sem duplicidade semântica)               | `T2_DICIONARIO_FATOS.md`                        | PR-T2.0     |
| PR-T2.2   | T2 — Schema `lead_state` v1                                             | `T2_LEAD_STATE_V1.md`                           | PR-T2.1     |
| PR-T2.3   | T2 — Política de confiança por origem do dado                           | `T2_POLITICA_CONFIANCA.md`                      | PR-T2.2     |
| PR-T2.4   | T2 — Reconciliação e tipologia (bruto/confirmado/inferência/hipótese/pendência) | `T2_RECONCILIACAO.md`                  | PR-T2.3     |
| PR-T2.5   | T2 — Resumo persistido + compatibilidade transitória com legado         | `T2_RESUMO_PERSISTIDO.md`                       | PR-T2.4     |
| PR-T2.R   | T2 — Readiness/Closeout G2                                              | `READINESS_G2.md` + esqueleto T3                | PR-T2.5     |

---

## 17. Gate G2

**Condição de aprovação:** todos os 6 artefatos T2 criados e validados com smoke documental completo; critérios de aceite (§7) todos verificados; nenhum bloqueio aberto; Bloco E aprovado com fechamento permitido.

**Condição de reprovação:** qualquer artefato ausente; lacuna estrutural em fatos centrais/derivados; política de confiança com menos de 5 origens; caso de reconciliação do mestre não coberto; violação de soberania LLM-first.

**Consequência de G2 APROVADO:** contrato T2 encerrado; skeleton T3 criado; PR-T3.0 desbloqueada.

**Consequência de G2 REPROVADO:** T3 bloqueada; lacunas documentadas no READINESS_G2; PRs de correção autorizadas antes de nova tentativa de G2.

---

## Microetapas obrigatórias do mestre (seção T2)

Conforme `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T2:

1. **Definir nomes canônicos dos fatos** sem duplicidade semântica → PR-T2.1.
2. **Separar fato bruto, confirmado, inferência, hipótese e pendência** → PR-T2.4.
3. **Política de confiança por origem** (texto explícito, indireto, áudio, doc, inferência) → PR-T2.3.
4. **Resumo persistido para turnos longos** → PR-T2.5.
5. **Mapear fatos vindos do legado** e como serão reconciliados → PR-T2.5.

---

## Histórico de atualizações

### 2026-04-23 — Skeleton criado via PR-T1.R

- Skeleton criado após G1 APROVADO.
- T2 autorizada conforme trava 8.5 do CODEX_WORKFLOW.
- PR-T2.0 desbloqueada para preencher o corpo deste contrato.

### 2026-04-23 — Contrato aberto formalmente via PR-T2.0

- Corpo completo preenchido conforme `schema/CONTRACT_SCHEMA.md`.
- Objetivo, escopo, fora de escopo, dependências, entradas, saídas definidos.
- 8 critérios de aceite verificáveis declarados.
- Provas obrigatórias e bloqueios documentados.
- Quebra de PRs T2.0–T2.R com entregáveis e dependências.
- Gate G2 com condições de aprovação e reprovação.
- Relação com A01, legados e referências obrigatórias declaradas.
- Adendos A00-ADENDO-01/02/03 declarados.
- PR-T2.1 desbloqueada. Próximo passo: PR-T2.1.
