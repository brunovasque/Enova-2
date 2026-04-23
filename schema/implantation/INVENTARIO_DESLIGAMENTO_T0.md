# INVENTARIO_DESLIGAMENTO_T0

## Finalidade

Classificar cada peça do legado ENOVA 1 em ordem de desligamento futuro: o que sai primeiro,
o que precisa conviver durante a migração, o que deve ser redesenhado antes de migrar, e o que
se transforma em conhecimento/política na ENOVA 2.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Documentos cruzados obrigatoriamente:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (PR-T0.1)
- `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` (PR-T0.1 complementar)
- `schema/implantation/INVENTARIO_REGRAS_T0.md` (PR-T0.2 — 48 regras)
- `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` (PR-T0.3 — 27 pontos)
- `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` (PR-T0.4 — 28 itens)
- `schema/implantation/MATRIZ_RISCO_T0.md` (PR-T0.5 — 26 riscos)

## Nota de soberania

Todo item classificado como `desligar_imediato` ou `proibido` relacionado a fala mecânica está
amparado pelos adendos canônicos:
- **A00-ADENDO-01** (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`): IA soberana na fala; mecânico
  jamais com prioridade de fala.
- **A00-ADENDO-02** (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`): casca mecânica de fala
  da E1 é arquitetura proibida na E2.

A classificação de desligamento destes itens **não é negociável** e não pode ser revertida por
exceção contratual, reutilização parcial ou "aproveitamento de estrutura".

## Nota de bifurcação E1 vs E2

Este inventário aplica a bifurcação canônica de PR-T0.1 §13:
- **Itens E1**: existem no runtime real da Enova 1 — têm plano de desligamento ativo.
- **Itens E2 (design-alvo)**: tabelas/objetos Supabase descritos no LEGADO_MESTRE como design
  da E2 — não se "desligam"; se **implementam** na E2 com namespace separado (`enova2_*`).

## Legenda de classificação de desligamento

| Classificação | Código | Definição |
|---------------|--------|-----------|
| Desligar imediato | `DI` | Morto/proibido — não migrar, não referenciar; eliminar antes de T1 |
| Redesenho obrigatório | `RO` | Residual — não migrar diretamente; redesenhar antes de qualquer migração |
| Convivência temporária | `CT` | Ativo E1 que fica como fallback durante shadow/canary; desligar com prova de cobertura |
| Migrar e desligar | `MD` | Ativo E1 a ser migrado para E2; desligar E1 após prova de cobertura na E2 |
| Reaproveitamento conhecimento | `RC` | Não se desliga — se transforma em policy/memória na E2; o conhecimento permanece |

## Legenda de fase alvo de desligamento

| Fase | Definição |
|------|-----------|
| `pre-T1` | Deve ser eliminado antes de abrir T1 |
| `T1` | Desligar durante T1 (contrato cognitivo) |
| `T3` | Desligar durante T3 (policy engine) |
| `T4` | Desligar durante T4 (orquestrador) |
| `T5` | Desligar durante T5 (migração de funil) |
| `T7` | Desligar durante T7 (cutover/desligamento ordenado) |

## Critérios de desligamento canônicos

| Critério | ID | Definição |
|----------|----|-----------|
| Prova de cobertura de turno | CDC-01 | `turn.fallback_used = 0` por N turnos consecutivos em canary (N a definir em T5) |
| Cobertura de stages migrados | CDC-02 | 100% dos stages do switch(stage) cobertos por policy rules em T3/T4 com smoke documental |
| Smoke de idempotência | CDC-03 | Deduplicação por `wamid` funcionando na E2 sem dependência do E1 |
| Prova de trilha CRM equivalente | CDC-04 | CRM E2 com cobertura >= CRM E1 (eventos, etapas, incidents) — validação via telemetria comparativa |
| Emitter persistente ativo | CDC-05 | Emitter assíncrono E2 com persistência em `enova_events` em produção; `console.log` E1 pode ser desligado |
| Critério de RNM transcrito | CDC-06 | L04 transcrito; regex de RNM validado em smoke antes de desligar gate E1 |
| Policy rules declarativas ativas | CDC-07 | Regras família `negocio/compliance/docs` implementadas como policy declarativa em T3; smoke de cobertura passando |

---

## Seção 1 — Desligar imediatamente (antes de T1)

> Itens mortos ou proibidos pelos adendos canônicos. Não devem ser migrados, referenciados como
> modelo nem reutilizados sob nenhuma forma. Eliminação obrigatória antes de abrir T1.

| ID | Origem (PR) | Tipo | Nome | Fase alvo | Dependência de fallback | Critério de desligamento | Risco (MATRIZ) |
|----|-------------|------|------|-----------|------------------------|--------------------------|----------------|
| DS-DI-01 | SF-03 (PR-T0.4) | superfície | Surface de fala mecânica por stage (rawArr/helper/bridge) | pre-T1 | Nenhuma — proibida; sem fallback | Eliminação completa antes de T1; não há critério de cobertura aplicável — item proibido | RZ-TM-01 (crítico) |
| DS-DI-02 | PH-F05 (PR-T0.3) | fallback | Cadeia fallback/rawArr/helper/bridge de fala E1 | pre-T1 | Nenhuma — proibida | Eliminação da cadeia de speech; substituída por soberania LLM na E2 | RZ-TM-01 (crítico) |
| DS-DI-03 | RM-01 (PR-T0.2) | regra (morta) | Fallbacks textuais estáticos por stage como voz dominante | pre-T1 | Nenhuma | Não migrar scripts de fala por stage; regra morta por A00-ADENDO-01/02 | RZ-TM-01 (crítico) |
| DS-DI-04 | RM-02 (PR-T0.2) | regra (morta) | Scripts rígidos de reprompt como camada principal | pre-T1 | Nenhuma | Não migrar templates de reprompt mecânico | RZ-TM-01 (crítico) |
| DS-DI-05 | PH-F02 + RM-03 (PR-T0.3 + PR-T0.2) | fallback + regra (mortos) | `fim_inelegivel` alias/ponte para `fim_ineligivel` | pre-T1 | Nenhuma | Eliminar alias no Core Mecânico T1; consolidar em nomenclatura única `fim_ineligivel` | RZ-EL-05 |
| DS-DI-06 | RM-04 (PR-T0.2) | regra (morta) | `yesNoStages` stubs incompletos como estrutura de gate | pre-T1 | Nenhuma | Descartar estrutura com gaps; migrar somente o padrão de gate yes/no para policy rules | RZ-EL-06 |
| DS-DI-07 | RU-06 (PR-T0.2) | regra (morta) | Casca mecânica de fala por prefixo acoplada ao stage | pre-T1 | Nenhuma | Proibida por A00-ADENDO-01/02; eliminação junto com DS-DI-01/02 | RZ-TM-01 (crítico) |

---

## Seção 2 — Redesenho obrigatório antes de migrar

> Itens residuais que existem no E1 mas sem callsite ativo ou com formato não documentado.
> Não devem ser migrados diretamente. Redesenho obrigatório antes de qualquer uso na E2.

| ID | Origem (PR) | Tipo | Nome | Fase alvo | Dependência de fallback E1 | Critério para liberar redesenho | Risco (MATRIZ) |
|----|-------------|------|------|-----------|---------------------------|--------------------------------|----------------|
| DS-RD-01 | PH-P02 + RM-05 (PR-T0.3 + PR-T0.2) | parser + regra (residuais) | `parseCorrespondenteBlocks` + `handleCorrespondenteRetorno` — funções órfãs | T1/T5 | SF-05 (trilho correspondente) depende destas funções | Transcrever L17; redesenhar trilho correspondente do zero em T1/T5 com callsite ativo e formato documentado | RZ-DC-01 (alto) |
| DS-RD-02 | PH-F01 (PR-T0.3) | fallback (residual) | `UNKNOWN_STAGE_REFERENCED` — fallback de stage desconhecido | T3 | Sintoma de gap no switch(stage) | Eliminar ao migrar switch(stage) para policy rules em T3; presença indica stage não mapeado | RZ-EL-06 |
| DS-RD-03 | PH-S07 (PR-T0.3) | stage (residual) | `yesNoStages` com stubs sem case correspondente | T3 | Nenhuma (estub incompleto) | Migrar somente o padrão de gate sim/não determinístico; descartar estrutura com gaps | RZ-EL-06 |
| DS-RD-04 | SF-07 + EP-03 (PR-T0.4) | superfície + endpoint (residuais) | Fluxo admin/simulação e endpoint de controle/QA | T1 | Nenhuma (não produtivo) | Isolar completamente do fluxo produtivo antes de T1; implementar rota separada e autenticada na E2 | — |
| DS-RD-05 | PH-H04 (PR-T0.3) | heurística | `isModoFamiliar` — critério de modo familiar não documentado | T1/T3 | PH-S02 (roteamento restrição parceiro) depende diretamente | Transcrever L07/L09 para extrair critério formal; redesenhar com critério documentado antes de migrar PH-S02 | RZ-EL-03 (alto) |

---

## Seção 3 — Convivência temporária (shadow/canary durante migração)

> Itens ativos no E1 que devem permanecer como fallback estrutural durante shadow e canary.
> Desligamento somente após prova de cobertura formal (critério CDC-xx aplicável).
> Expandir ou modificar estes itens no E1 é proibido — permanecem congelados.

| ID | Origem (PR) | Tipo | Nome | Fase de convivência | Fase de desligamento | Dependências que consomem este item | Critério de desligamento | Risco (MATRIZ) |
|----|-------------|------|------|---------------------|---------------------|-------------------------------------|--------------------------|----------------|
| DS-CT-01 | PH-F03 + RO-05 (PR-T0.3 + PR-T0.2) | fallback + regra | E1 congelado como fallback de migração (`route_fallback = true`) | T1–T5 (shadow/canary) | T5–T7 | Toda a migração E2 depende deste fallback durante shadow; `turn.fallback_used` rastreia consumo | CDC-01 (`turn.fallback_used = 0` por N turnos); critério N definido em T5 | RZ-ES-02 (alto) |
| DS-CT-02 | SF-06 + PH-S06 (PR-T0.4 + PR-T0.3) | superfície + stage | Motor cognitivo `COGNITIVE_V2_MODE` em depreciação | T1–T3 (shadow) | T3–T4 | PH-H02, PH-H03, TE-02 dependem deste motor; PH-H07 alimenta o scoring | Deprecar em shadow mode ao estabilizar motor cognitivo E2 em T3; não expandir no E1 | RZ-EL-07 (médio) |
| DS-CT-03 | TE-01 (PR-T0.4) | telemetria | Emitter `[ENOVA_EVENT]` via `console.log` E1 | T4–T5 (convivência com E2) | T5 | Todo o pipeline de telemetria E1 passa por este emitter; TE-06 (`turn.fallback_used`) depende de TE-01 | CDC-05 (emitter persistente E2 com `enova_events` em produção e cobertura >= TE-01) | RZ-TE-01 (alto) |
| DS-CT-04 | TE-13 (PR-T0.4) | telemetria | CRM operacional E1 — trilha auditável por etapa | T4–T5 | T7 | Trilha auditável conquista do E1; RC-05 proíbe destruição antes de equivalente E2 | CDC-04 (trilha CRM E2 com cobertura >= E1; telemetria comparativa validada) | RZ-TE-03 (alto) |
| DS-CT-05 | PH-R01 (PR-T0.3) | regex | Validação de formato/validade de RNM (regex desconhecido L04) | T1 (gate ativo) | T1 (após CDC-06) | Gate de elegibilidade para estrangeiros (RN-04); nenhuma alternativa disponível sem L04 transcrito | CDC-06 (L04 transcrito; regex validado em smoke com casos reais de RNM) | RZ-EL-01 (alto/bloqueante G0) |
| DS-CT-06 | SF-01 (PR-T0.4) | superfície | `runFunnel` — espinha dorsal de 73 stages | T1–T5 (convivência estágio por estágio) | T5–T7 | Toda a lógica de coleta, roteamento e gate do E1 passa por `runFunnel`; é o fallback estrutural principal | CDC-02 (100% dos stages cobertos por policy rules E2 com smoke) | — |

---

## Seção 4 — Migrar e desligar com prova de cobertura

> Itens ativos no E1 que devem ser migrados para a E2 e depois desligados no E1 após prova
> de cobertura. Não desligar antes do critério ser cumprido.

| ID | Origem (PR) | Tipo | Nome | Fase de migração | Fase de desligamento E1 | Dependências diretas | Critério de desligamento E1 | Risco (MATRIZ) |
|----|-------------|------|------|-----------------|------------------------|---------------------|----------------------------|----------------|
| DS-MD-01 | SF-02 (PR-T0.4) | superfície | Pré-funil — dedupe, bypass, offtrack | T1 | T1 (após smoke) | EP-01, EP-02; toda entrada depende desta camada | CDC-03 (dedupe por `wamid` na E2 sem falha; smoke de idempotência) | — |
| DS-MD-02 | SF-04 (PR-T0.4) | superfície | `envio_docs` — coleta e processamento de documentação | T1/T5 | T5 (após prova docs E2) | CT-04 (docs WhatsApp), CT-06 (site), CT-07 (visita), PH-F04 (keepStage), PH-S03 (roteamento 3 caminhos) | CDC-02 (cobertura de stage `envio_docs` por E2); timeout explícito implementado (RZ-DC-02) | RZ-DC-02 (alto/bloqueante) |
| DS-MD-03 | EP-01 + EP-02 (PR-T0.4) | endpoint | Webhooks WhatsApp/Meta — texto e mídia | T1 | T5–T7 (canary) | Toda a entrada do sistema; rota única confirmada em E1 | Canary E2 estável; `turn.fallback_used = 0` (CDC-01) | — |
| DS-MD-04 | CT-01 (PR-T0.4) | canal | Texto/interativo WhatsApp — canal principal | T1 | T7 | Fluxo principal de atendimento; 100% das mensagens MCMV entram por aqui | CDC-01 + CDC-02 (cobertura completa do canal na E2) | — |
| DS-MD-05 | CT-04 + CT-07 (PR-T0.4) | canal | Documento WhatsApp + visita presencial | T1/T5 | T5 | SF-04 (`envio_docs`), SF-05 (trilho correspondente), RD-01..RD-05 | CDC-02 para stage `envio_docs`; prova de trilho de docs E2 | RZ-DC-02 |
| DS-MD-06 | PH-R02 (PR-T0.3) | regex | Deduplição de mensagem por `wamid`/`messageId` | T1 | T1 (após CDC-03) | SF-02 (pré-funil), EP-01; base de idempotência do sistema | CDC-03 (dedupe E2 validado sem falha) | — |
| DS-MD-07 | PH-H01 (PR-T0.3) | heurística | `offtrackGuard` — detecção de desvio pré-funil | T3 | T3 (após gate cognitivo E2) | SF-02 (pré-funil), RR-06; intercepta antes de `runFunnel` | CDC-07 (gate cognitivo E2 com smoke de offtrack classificado corretamente) | RZ-EL-02 (alto) |
| DS-MD-08 | PH-H07 (PR-T0.3) | heurística | `needs_confirmation` — flag de ambiguidade/contradição | T3 | T3 (após policy rules E2) | RU-03, RE-03; alimenta scoring cognitivo (+3 — peso máximo); gate de avanço de stage | CDC-07 (policy E2 com `needs_confirmation` implementado e smoke de casos reais) | RZ-TM-03 (alto) |
| DS-MD-09 | PH-S08 (PR-T0.3) | stage | Espinha dorsal sequencial de 73 stages (`switch(stage)`) | T3/T5 (estágio por estágio) | T5–T7 | Toda a lógica de coleta e roteamento E1; source of truth do fluxo vivo | CDC-02 (100% dos stages cobertos por policy rules E2 com smoke) | — |
| DS-MD-10 | PH-S09 (PR-T0.3) | stage | Roteamento para `qualification_special` (P3/multi/conjunto) | T1 | T1 (Core Mecânico 2 já implementado) | RN-09, RN-10, RR-03; branch `feat/core-especiais-p3-multi-variantes` (commit a3c27ab) | Core Mecânico 2 já provado; smoke de gate de entrada no trilho especial | — |
| DS-MD-11 | PH-H05 (PR-T0.3) | heurística | `low_solo_income` / `limite_operacional` não transcrito | T1 | T1 (após CDC-06 equivalente L11) | RN-03 (sugestão de composição antes de inviabilizar) | L11 transcrito; `limite_operacional` validado com casos reais antes de migrar RN-03 | RZ-EL-04 (alto/bloqueante G0) |
| DS-MD-12 | CT-02 + CT-03 (PR-T0.4) | canal | Áudio e imagem WhatsApp — canais condicionais | T6 | T6 (após pipeline áudio/imagem E2) | TE-10 (`enova_artifacts`); PH-P01 (extração de renda de áudio) | L17/L18 transcritos; pipeline multimodal E2 em produção | RZ-TE-04 (médio) |
| DS-MD-13 | PH-S01–PH-S05 (PR-T0.3) | stage (5 branches) | Branches de stage dinâmicos (fase, restrição parceiro, docs, parceiro_renda) | T3/T5 | T5 | Cada branch é dependência direta de uma regra de negócio (RN-10, RN-12, RD-04, RD-05) | CDC-02 por branch; cada branch migrado individualmente com smoke | — |
| DS-MD-14 | TE-06 (PR-T0.4) | telemetria | Eventos `db.persisted` / `turn.responded` / `turn.fallback_used` | T4 | T5 | Monitoramento de migração; `turn.fallback_used` é o critério CDC-01 | CDC-05 (emitter E2 capturando estes eventos com persistência confirmada) | RZ-TE-05 (médio) |

---

## Seção 5 — Reaproveitamento como conhecimento/política (não se desliga — se transforma)

> Regras de negócio MCMV, compliance e operação do E1 que não se "desligam": viram
> policy rules declarativas em T3 e memória estruturada em T2. O conhecimento é soberano.
> A forma de entrega muda (hardcoded E1 → policy declarativa E2), mas o conteúdo permanece.

| ID | Origem (PR-T0.2) | Família | Regras abrangidas | Forma na E1 | Forma na E2 | Fase de transformação |
|----|-----------------|---------|-------------------|-------------|-------------|----------------------|
| DS-RC-01 | RN-01 a RN-12 | negocio | 12 regras de qualificação MCMV (estado civil, regime, IR, CTPS, restrição, P3, multi) | Lógica hardcoded no Core Mecânico (switch/if/gates) | Policy rules declarativas em T3; alimentam decisões do LLM | T1 (design) → T3 (implementação) |
| DS-RC-02 | RC-01 a RC-05 | compliance | 5 regras de compliance (nunca prometer, nunca ignorar fato confirmado, migração não destrói telemetria) | Regras embutidas no prompt + Core | Policy declarativa em T3; RC-05 como gate de rollout em T4/T5 | T1 → T3 |
| DS-RC-03 | RD-01 a RD-05 | docs | 5 regras de documentação (estado estruturado, status canonico, canal de envio) | Stage `envio_docs` + keepStage + facts doc_* | SF-04 migrado com timeout; facts doc_* em `enova_leads`/`enova_artifacts` E2 | T1/T5 |
| DS-RC-04 | RU-01 a RU-05 | ux | 5 regras de UX/tom (linguagem humana, resposta curta, ambiguidade → confirmação, offtrack) | Parcialmente no prompt E1; parcialmente na casca mecânica (morta — DS-DI-01 a DS-DI-04) | LLM soberano aplica RU-01/02/04; RU-03 via `needs_confirmation`; RU-05 via separação LLM × Core | T1 |
| DS-RC-05 | RO-01 a RO-04 | operacao | 4 regras operacionais (handoff correspondente, visita, CRM/trilha, reset/dedup) | Lógica de stage e infrastructure E1 | RO-01/02 em trilho correspondente redesenhado (DS-RD-01); RO-03 via CRM E2 (TE-13 → CRM E2); RO-04 via dedupe E2 (DS-MD-06) | T1/T5 |
| DS-RC-06 | RR-01 a RR-06 | roteamento | 6 regras de roteamento (espinha dorsal, casado→conjunto, P3/especiais, docs, correspondente, offtrack) | `runFunnel` switch(stage) + branches dinâmicos | Policy engine T3/T4; roteamento declarativo substituindo switch(stage) E1 | T3/T5 |
| DS-RC-07 | RE-01 a RE-04 | excecao | 4 regras de exceção (bypass manual, rollback por flag, dado contradito, inventário não fechado) | Controles de borda no pré-funil + governance | RE-01 via routing E2; RE-02 via feature flags E2; RE-03 via `needs_confirmation`; RE-04 via gate G0 | T1/T3 |

---

## Dependências de fallback — mapa de ordem de desligamento

> Regra: um item E1 só pode ser desligado depois que todos os itens que dependem dele
> na E2 estejam provados com cobertura formal.

```
[Entrada]
  CT-01 (texto) + CT-04 (docs) + CT-07 (visita)
    → EP-01 / EP-02 (webhooks) — DS-MD-03 [T7 last]
      → SF-02 (pré-funil: dedupe, bypass, offtrack) — DS-MD-01 [T1 after smoke]
        → PH-R02 (dedupe wamid) — DS-MD-06 [T1 after CDC-03]
        → PH-H01 (offtrackGuard) — DS-MD-07 [T3 after CDC-07]
          → SF-01 (runFunnel 73 stages) — DS-CT-06 [T5–T7 last fallback]
            → PH-S08 (switch espinha dorsal) — DS-MD-09 [T5–T7]
            → SF-04 (envio_docs) — DS-MD-02 [T5 after prova docs]
              → PH-F04 (keepStage) — embedded em SF-04 [migra com SF-04]
            → PH-H07 (needs_confirmation) — DS-MD-08 [T3 after CDC-07]
            → PH-F03 (fallback E1 congelado) — DS-CT-01 [T5–T7 last: CDC-01]

[Fallback de migração]
  PH-F03 (route_fallback=true) ← monitorado por TE-06 (turn.fallback_used) ← DS-CT-03 (TE-01)
    → desligar PH-F03 somente com CDC-01 (turn.fallback_used=0)
    → desligar TE-01 somente com CDC-05 (emitter E2 persistente ativo)

[Telemetria]
  TE-01 (console.log) → TE-13 (CRM E1) → desligar somente com CDC-04 + CDC-05

[Mortos / Imediatos — sem dependência]
  DS-DI-01..DS-DI-07: SF-03, PH-F05, RM-01, RM-02, fim_inelegivel, yesNoStages-stubs, RU-06
    → eliminar pre-T1; não há dependência de fallback
```

---

## Resumo executivo — contagem por classificação

| Classificação | Itens | Fase mínima de início | Observação |
|---------------|-------|-----------------------|-----------|
| Desligar imediato (DI) | 7 | pre-T1 | Mortos/proibidos; eliminação obrigatória |
| Redesenho obrigatório (RO) | 5 | T1/T3 | Residuais; não migrar diretamente |
| Convivência temporária (CT) | 6 | T1–T5 | Fallbacks ativos; critério CDC-xx obrigatório |
| Migrar e desligar (MD) | 14 | T1–T7 | Ativos E1; desligar com prova de cobertura |
| Reaproveitamento conhecimento (RC) | 7 grupos | T1–T5 | Regras MCMV → policy declarativa |
| **Total** | **39** | — | Cobre todo o inventário mapeado em PR-T0.1..T0.4 |

---

## Inconclusivos declarados (não catalogados por limitação de L-blocks)

| Categoria | Descrição | Bloco legado | Impacto no desligamento |
|-----------|-----------|-------------|------------------------|
| Schema real de tabelas E1 | Schema exato das tabelas Supabase E1 desconhecido | L18 | Não é possível definir critério de desligamento de TE-07 a TE-12 antes de L18 transcrito |
| CRM E1 real | Formato exato do CRM e trilha por etapa desconhecido | L18 | DS-CT-04 (TE-13) permanece indefinidamente até CDC-04 ser definido com base em L18 |
| Telemetria de áudio E1 | Como áudio é transcrito/rastreado no E1 | L17, L18 | DS-MD-12 (CT-02/CT-03) não pode ter critério de desligamento definido antes de L17 transcrito |
| Regex e parsers de detalhe fino | RNM, CPF/CNPJ, parsing numérico de renda | L04, L11 | DS-CT-05 (PH-R01) e DS-MD-11 (PH-H05) bloqueados até L04/L11 transcritos |
| Regras de topo fino | Captação do primeiro sinal, objeção de entrada | L04–L06 | Possível item de DS-RC-01 incompleto; a ser completado em PR-T0.R |
| Regras de composição/estado civil | Variantes de composição, divorciado/viúvo | L07–L10 | Possível ampliação de DS-RC-01; a ser completado em PR-T0.R |
| Regras de restrição fina | Regularização parcial, RNM expirado | L13–L14 | Possível ampliação de DS-RC-01; a ser completado em PR-T0.R |

---

## § — Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md
Estado da evidência:                   completa — 39 itens em 5 classificações, cobrindo todo o
                                       inventário mapeado em PR-T0.1 a PR-T0.4; critério de aceite
                                       de PR-T0.6 (Bíblia §PR-T0.6) plenamente atendido
Há lacuna remanescente?:               sim — schema real E1 de tabelas Supabase, CRM E1 e telemetria
                                       de áudio em L17/L18 não transcritos impedem definição completa
                                       de critérios CDC para TE-07 a TE-13 e DS-MD-12; declarados
                                       em §Inconclusivos; não bloqueiam PR-T0.6
Há item parcial/inconclusivo bloqueante?: não — todos os 39 itens têm evidência auditável nos
                                       inventários anteriores (PR-T0.1 a PR-T0.5); inconclusivos
                                       de L-blocks são limitações estruturais de acesso
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.R — Readiness e closeout do gate G0
```
