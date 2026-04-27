# CONTRACTS — Indice Canonico de Contratos — ENOVA 2

## Finalidade

Este indice registra o contrato ativo da implantacao e preserva os contratos historicos por frente.

O tronco macro soberano e:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Em conflito de macro, ordem ou gate, o mestre em `schema/source/` prevalece.

## Precedencia

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` > A00 > A01 > A00-ADENDO-01 > A00-ADENDO-02 > A00-ADENDO-03 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa > documentos legados aplicáveis

Adendos canônicos ativos:
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala, mecânico jamais com prioridade de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade da Enova 2 como atendente especialista MCMV; guia de leitura das fases T1/T3/T4/T5/T6 com travas contra má interpretação.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Prova parcial/inconclusiva/lacunosa bloqueia fechamento de etapa, gate, contrato e avanço de próxima PR. Bloco E obrigatório em toda PR que tente fechar etapa.

Toda abertura de contrato de frente deve declarar conformidade com os três adendos.

---

## Contrato macro ativo

| Fase | Contrato ativo | Status | Gate | Data de abertura | PR atual | Proximo passo autorizado |
|------|----------------|--------|------|------------------|----------|--------------------------|
| T5 — Migração do funil core e integração de canal | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` | **aberto** | G4 APROVADO; G5 — paridade funcional | 2026-04-26 | PR-T5.3 (aberta — F2 composição familiar) | PR-T5.4 (após merge T5.3) |

## Contratos encerrados

| Fase | Contrato arquivado | Status | Gate | Data de encerramento | PR que encerrou |
|------|-------------------|--------|------|----------------------|-----------------|
| T4 — Orquestrador de turno LLM-first | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md` | encerrado | G4 — APROVADO | 2026-04-25 | PR-T4.R |
| T3 — Policy engine v1 e guardrails declarativos | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md` | encerrado | G3 — APROVADO | 2026-04-25 | PR-T3.R |
| T2 — Estado estruturado, memória e reconciliação | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md` | encerrado | G2 — APROVADO | 2026-04-24 | PR-T2.R |
| T1 — Constituição do agente e contrato cognitivo canônico | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md` | encerrado | G1 — APROVADO | 2026-04-23 | PR-T1.R |
| T0 — Congelamento, inventario e mapa do legado vivo | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md` | encerrado | G0 — aprovado | 2026-04-23 | PR-T0.R |

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
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — obrigatório em toda PR que tente fechar etapa, gate, contrato ou avançar próxima PR autorizada

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
│   ├── CONTRATO_IMPLANTACAO_MACRO_T0.md  (encerrado — manter para referência até archival completo)
│   └── CONTRATO_IMPLANTACAO_MACRO_T1.md  (skeleton — aguardando PR-T1.0)
├── archive/
│   ├── CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md  (T0 encerrado formalmente)
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
- 2026-04-23 — Evidencia documental adicional de continuidade de `PR-T0.1` internalizada em `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`; contrato T0 permanece aberto em G0.
- 2026-04-23 — Adicionado A00-ADENDO-03 (`schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`) na cadeia de precedência. Regra canônica: "Evidência manda no estado." Prova insuficiente bloqueia fechamento de etapa/gate/contrato. Toda abertura de contrato de frente deve declarar conformidade com A00-ADENDO-01, A00-ADENDO-02 e A00-ADENDO-03.
- 2026-04-23 — PR-T0.R executada. Contrato T0 ENCERRADO. G0 APROVADO. T0 arquivado em `archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`. Skeleton T1 criado em `active/CONTRATO_IMPLANTACAO_MACRO_T1.md`. Próximo passo autorizado: PR-T1.0.
- 2026-04-23 — PR-T1.0 executada. Contrato T1 ABERTO formalmente conforme CONTRACT_SCHEMA.md. Corpo preenchido: objetivo, escopo, critérios de aceite, quebra de PRs (T1.1–T1.R), gate G1, legados aplicáveis. PR-T1.1 desbloqueada. Próximo passo: PR-T1.1.
- 2026-04-23 — PR-T1.1 executada. T1_CAMADAS_CANONICAS.md criado: 5 camadas canônicas (TOM/REGRA/VETO/SUGESTÃO MANDATÓRIA/REPERTÓRIO) com definições, anti-padrões, travas LLM-first e classificação completa das 48 regras T0. PR-T1.2 desbloqueada. Próximo passo: PR-T1.2.
- 2026-04-23 — PR-T1.2 executada. T1_SYSTEM_PROMPT_CANONICO.md v1 criado: 6 seções em camadas (identidade/papel operacional/proibições/condução/conhecimento/objetivo); 7 anti-padrões proibidos; 6 cenários adversariais documentados; conformidade com T1_CAMADAS_CANONICAS verificada. PR-T1.3 desbloqueada. Próximo passo: PR-T1.3.
- 2026-04-23 — PR-T1.3 executada. T1_TAXONOMIA_OFICIAL.md criado: 6 categorias canônicas (FACTS 18 tipos, OBJETIVOS 9, PENDÊNCIAS 6, CONFLITOS 4, RISCOS 8, AÇÕES 11); todas as 48 regras T0 mapeadas; trava LLM-first verificada. PR-T1.4 desbloqueada. Próximo passo: PR-T1.4.
- 2026-04-23 — PR-T1.4 executada. T1_CONTRATO_SAIDA.md criado: 13 campos canônicos com semântica, responsável e travas LLM-first; 8 invariantes; 6 cenários sintéticos; amarração completa à T1.3. PR-T1.5 desbloqueada. Próximo passo: PR-T1.5.
- 2026-04-23 — PR-T1.5 executada. T1_COMPORTAMENTOS_E_PROIBICOES.md criado: 15 comportamentos obrigatórios; 13 proibições absolutas; 8 padrões de condução; 12 cenários adversariais; amarração às 5 camadas e 13 campos de saída; 9 anti-padrões. PR-T1.R desbloqueada. Próximo passo: PR-T1.R.
- 2026-04-23 — PR-T1.R executada. READINESS_G1.md criado: smoke 6/6 PRs; 12/12 critérios cumpridos; G1 APROVADO. Contrato T1 ENCERRADO e arquivado. Skeleton T2 criado. PR-T2.0 desbloqueada. Próximo passo: PR-T2.0.
- 2026-04-23 — PR-T2.0 executada. Contrato T2 ABERTO formalmente conforme CONTRACT_SCHEMA.md. Corpo preenchido: objetivo, escopo, fora de escopo, dependências, entradas, saídas, critérios de aceite, provas, bloqueios, quebra de PRs (T2.1–T2.R), gate G2, legados, referências. PR-T2.1 desbloqueada. Próximo passo: PR-T2.1.
- 2026-04-24 — PR-T2.1 executada. T2_DICIONARIO_FATOS.md criado: 50 chaves canônicas (35 fact_*, 9 derived_*, 6 signal_*); auditoria E1→E2 completa (42 campos mapeados); 7 categorias de memória com limites LLM-first; 10 regras invioláveis; cobertura das 5 microetapas do mestre. PR-T2.2 desbloqueada. Próximo passo: PR-T2.2.
- 2026-04-24 — PR-T2.2 executada. T2_LEAD_STATE_V1.md criado: 11 blocos canônicos (CaseMeta, OperationalState/11 campos, FactBlock/35 fact_*, DerivedBlock/9 derived_*, Pending/6 PEND_*, Conflicts/4 CONF_*, SignalBlock/6 signal_*, HistorySummary/4 camadas+snapshot, VasquesNotes, NormativeContext); 12 regras LS-01..LS-12; mapeamento campo↔fato↔regra T0; compatibilidade E1→E2. PR-T2.3 desbloqueada. Próximo passo: PR-T2.3.
- 2026-04-24 — PR-T2.3 executada. T2_POLITICA_CONFIANCA.md criado: 6 origens canônicas (EXPLICIT_TEXT, INDIRECT_TEXT, AUDIO_TRANSCRIPT/3 níveis, DOCUMENT, INFERENCE/2 tipos, OPERATOR_NOTE); mapa de transição por origem; 12 fatos críticos; condições de confirmação/conflito/bloqueio; 9 source values; 5 casos sintéticos; 12 regras PC-01..PC-12. PR-T2.4 desbloqueada. Próximo passo: PR-T2.4.
- 2026-04-24 — PR-T2.4 executada. T2_RECONCILIACAO.md criado: tipologia formal 7 estados (hypothesis/captured/inferred/confirmed/contradicted/pending/obsolete); protocolo reconciliação 7 etapas; hierarquia de prioridade por origem; 10 domínios específicos (renda, estado civil, regime, composição/P2, IR autônomo, restrição, RNM, áudio ruim, Vasques vs confirmed, doc ilegível); 10 casos sintéticos RC-01..RC-10; tabela de transições; 12 anti-padrões AP-01..AP-12; 10 regras RC-01..RC-10. PR-T2.5 desbloqueada. Próximo passo: PR-T2.5.
- 2026-04-24 — PR-T2.5 executada. T2_RESUMO_PERSISTIDO.md criado: 4 camadas de memória (L1/L2/L3/L4); protocolo de snapshot com 7 triggers e shape SnapshotExecutivo completo; regras anti-contaminação RC-AN-01..07; memória Vasques RV-01..07; aprendizado sem script RA-01..05; tabela E1→E2 (27 campos + 7 descartados + stages); 10 casos sintéticos SP-01..SP-10; 12 anti-padrões AP-RP-01..12; 10 regras RP-01..10. PR-T2.R desbloqueada. Próximo passo: PR-T2.R.
- 2026-04-24 — PR-T2.R executada. READINESS_G2.md criado: smoke 6/6 PASS; critérios 8/8 CUMPRIDOS; coerência verificada em 8 dimensões; cenários V1/V2/V3 PASS; zero violações LLM-first; zero lacunas bloqueantes. G2 APROVADO. Contrato T2 ENCERRADO e arquivado em archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md. Skeleton T3 criado em active/. PR-T3.0 desbloqueada. Próximo passo: PR-T3.0.
- 2026-04-24 — PR-T3.0 executada. Contrato T3 ABERTO formalmente conforme CONTRACT_SCHEMA.md. Corpo preenchido: §1–§17 + Bloco E (objetivo, escopo, fora de escopo, dependências, entradas, saídas S1–S6, critérios CA-01..CA-10, provas P-T3-01..05, bloqueios B-01..05, quebra PRs T3.0–T3.R, gate G3). PR-T3.1 desbloqueada. Próximo passo: PR-T3.1.
- 2026-04-25 — PR-T3.1 executada. T3_CLASSES_POLITICA.md criado: 5 classes canônicas (bloqueio, obrigação, confirmação, sugestão_mandatória, roteamento); shape PolicyDecision com invariante sem reply_text; prioridade entre classes; 4 efeitos operacionais formais (§8); integração lead_state v1 + política de confiança; 5 exemplos sintéticos; 10 anti-padrões AP-CP-01..10; 10 regras CP-01..10; microetapa 2 coberta. PR-T3.2 desbloqueada. Próximo passo: PR-T3.2.
- 2026-04-24 — PR-T3.2 executada. T3_REGRAS_CRITICAS_DECLARATIVAS.md criado: 4 regras críticas (R_CASADO_CIVIL_CONJUNTO, R_AUTONOMO_IR, R_SOLO_BAIXA_COMPOSICAO, R_ESTRANGEIRO_SEM_RNM); payloads declarativos sem reply_text; bloqueio somente em R_ESTRANGEIRO_SEM_RNM (nationality confirmed + RNM inválido); R_SOLO_BAIXA_COMPOSICAO nunca emite bloqueio; tabela validação cruzada §6; 14 chaves verificadas contra T2_DICIONARIO_FATOS; 10 anti-padrões AP-RC-01..10; 10 regras RC-INV-01..10; microetapa 1 coberta. PR-T3.3 desbloqueada. Próximo passo: PR-T3.3.
- 2026-04-25 — PR-T3.3 executada. T3_ORDEM_AVALIACAO_COMPOSICAO.md criado: pipeline 6 estágios numerados (reconciliação → bloqueios → confirmações → obrigações → sugestões → roteamentos); matriz de composição 5×5; regra de desempate em 4 níveis; 8 combinações específicas detalhadas; política de colisão com 10 códigos canônicos (COL-*) + proibição de colisão silenciosa; shape PolicyDecisionSet com decisions/collisions/evaluation_meta; 10 cenários sintéticos SC-01..10; validação cruzada T3.1/T3.2/T2; 12 anti-padrões AP-OC-01..12; 12 regras RC-INV-01..12; microetapas 3 e 4 cobertas. PR-T3.4 desbloqueada. Próximo passo: PR-T3.4.
- 2026-04-25 — PR-T3.4 executada. T3_VETO_SUAVE_VALIDADOR.md criado: VetoSuaveRecord com 5 tipos de risco, 3 resoluções, escalada condicional para bloqueio, ciclo de vida e acknowledged; extensão PolicyDecisionSet com soft_vetos[] e invariante de separação; validador posicionado como passo 4 de 6 no pipeline de turno; ValidationContext + LLMResponseMeta + ValidationResult com safe_fields e blocked_fields; checklist VC-01..VC-09 (9 itens — 5 critical, 4 advisory, incluindo VC-09 template mecânico); lógica de decisão agregada APPROVE/REJECT/REQUIRE_REVISION/PREVENT_PERSISTENCE; 12 cenários SC-VS-01..12; validação cruzada T3.1/T3.2/T3.3/T2+A00-ADENDO-02; 11 anti-padrões AP-VS-01..11; 11 regras RC-VS-01..11; todas as 5 microetapas T3 cobertas. PR-T3.5 desbloqueada. Próximo passo: PR-T3.5.
- 2026-04-25 — PR-T3.5 executada. T3_SUITE_TESTES_REGRAS.md criado: 24 casos declarativos (mínimo 20, CA-06 cumprido): 4 positivos TC-POS-01..04; 4 negativos TC-NEG-01..04; 4 ambíguos TC-AMB-01..04; 4 colisões TC-COL-01..04 (COL-BLOCK-OBLIG, coexistência, COL-CONF-CONF-LEVEL, COL-BLOCK-ROUTE); 4 regressões TC-REG-01..04 (RC-INV-01/03/04/05); 2 ordem/composição TC-ORD-01..02; 2 validador TC-VAL-01..02; critérios PASS/FAIL globais (§10); validação cruzada T3.1/T3.2/T3.3/T3.4/T2 em 18 linhas; 8 anti-padrões AP-ST; 5 microetapas T3 cobertas. PR-T3.R desbloqueada. Próximo passo: PR-T3.R.
- 2026-04-25 — PR-T3.R executada. READINESS_G3.md criado: smoke 5/5 PASS (S1–S5); coerência 11 dimensões PASS; cenários V1/V2/V3 PASS; critérios CA-01..CA-10 10/10 CUMPRIDOS; zero lacunas bloqueantes; 5 lacunas não bloqueantes (LNB-01..05) declaradas e justificadas. G3 APROVADO. Contrato T3 ENCERRADO e arquivado em archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md. Skeleton T4 criado em active/. PR-T4.0 desbloqueada. Próximo passo: PR-T4.0.
- 2026-04-25 — PR-T4.0 executada. Contrato T4 ABERTO formalmente conforme CONTRACT_SCHEMA.md. Corpo preenchido: §1–§17 + Bloco E (objetivo, escopo, fora de escopo, dependências, entradas, saídas S1–S6, critérios CA-01..CA-10, provas P-T4-01..05, bloqueios B-01..05, quebra PRs T4.0–T4.R, gate G4). TurnoEntrada e TurnoSaida como shapes canônicos; 8-step pipeline declarado; fallbacks documentados; Bloco E aplicado. PR-T4.1 desbloqueada. Próximo passo: PR-T4.1.
- 2026-04-25 — PR-T4.1 executada. T4_ENTRADA_TURNO.md criado: shape TurnoEntrada com 6 campos obrigatórios (turn_id, case_id, message_text, channel, lead_state, current_objective) e 4 opcionais (attachments, prior_decisions, soft_vetos_ctx, context_override); sequência de validação V1–V6; montagem de ContextoTurno; 13 campos proibidos com códigos TE-*; TE-INV-01..10; 12 anti-padrões AP-TE; 5 exemplos sintéticos; validação cruzada T1/T2/T3; microetapa 1 coberta; Bloco E aplicado. PR-T4.2 desbloqueada. Próximo passo: PR-T4.2.
- 2026-04-25 — PR-T4.3 executada. T4_VALIDACAO_PERSISTENCIA.md criado: ProposedStateDelta com regras de construção; reconciliação T2.4 integrada com ConflictRecord; ValidationContext montado (LLMResponseMeta nunca reply_text bruto); validador VC-01..09 em totalidade; PersistDecision com 4 resultados (APPROVE/REQUIRE_REVISION/PREVENT_PERSISTENCE/REJECT); safe_fields/blocked_fields; REJECT→revert+T4.5; reply_text não reescrito; T4.3 não entrega ao canal; VP-INV-01..12; 12 anti-padrões AP-VP; 5 exemplos; microetapa 3 coberta; Bloco E. PR-T4.4 desbloqueada. Próximo passo: PR-T4.4.
- 2026-04-25 — PR-T4.2 executada. T4_PIPELINE_LLM.md criado: shape PipelinePrompt com 4 blocos (§SYS, §CTX, §POL, §OUT) e invariante de ordem; LLMCallContract com uma única chamada LLM por turno; LLMResult com reply_text IMUTÁVEL após captura — rota direta para T4.4 sem transitar por T4.3; facts_updated_candidates sempre source:"llm_collected"/confirmed:false; 6 tipos de ParseError; malformed → fallback imediato, nunca retry; tabela de roteamento por componente; §OUT instrui formato nunca conteúdo; LLP-INV-01..10; 12 anti-padrões AP-LLP; 5 exemplos sintéticos; microetapa 2 coberta; Bloco E aplicado. PR-T4.3 desbloqueada. Próximo passo: PR-T4.3.
- 2026-04-25 — PR-T4.4 executada. T4_RESPOSTA_RASTRO_METRICAS.md criado: entrega condicional de reply_text por reply_routing; T4.4 não produz nem reescreve conteúdo de fala — apenas entrega reply_text capturado pelo LLM quando reply_routing="T4.4"; shape TurnoRastro 15 campos; 10 métricas declarativas; camadas L1/L2/L3/L4 pós-turno; RR-INV-01..12; 12 anti-padrões AP-RR; 5 exemplos sintéticos; microetapa 4 coberta; Bloco E. PR-T4.5 desbloqueada. Próximo passo: PR-T4.5.
- 2026-04-25 — PR-T4.5 executada. T4_FALLBACKS.md criado: 4 cenários obrigatórios (erro_modelo, formato_invalido, omissao_campos, contradicao_seria); shapes FallbackContext, FallbackDecision, FallbackTrace; retry único apenas para erro_modelo (FB-RETRY-01); FB-INV-01..12; 13 anti-padrões AP-FB; 5 exemplos sintéticos FB-E1..E5; microetapa 5 coberta; Bloco E. PR-T4.6 desbloqueada. Próximo passo: PR-T4.6.
- 2026-04-25 — PR-T4.6 executada. T4_BATERIA_E2E.md criado: 10 cenários declarativos (E2E-PC-01..04 pipeline_completo, E2E-FB-01..04 fallback 4/4, E2E-BD-01 borda stage+L3, E2E-BD-02 regressão VC-01); métricas declarativas 10 cenários; matriz cobertura artefatos T4.1..T4.5; CA-01..09 9/9; fallback 4/4; 20 dimensões cross-ref; Bloco E. PR-T4.R desbloqueada. Próximo passo: PR-T4.R.
- 2026-04-25 — PR-T4.R executada. READINESS_G4.md criado: smoke S1–S6 6/6 PASS; CA-01..CA-10 10/10 CUMPRIDOS; 5 microetapas cobertas; coerência cross-artefato verificada; soberania LLM intacta; zero reply_text mecânico; zero lacunas bloqueantes; 5 não bloqueantes (LNB-G4-01..05). G4 APROVADO. Contrato T4 ENCERRADO e arquivado em archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md. Skeleton T5 criado em active/CONTRATO_IMPLANTACAO_MACRO_T5.md. PR-T5.0 desbloqueada. Próximo passo: PR-T5.0.
- 2026-04-26 — PR-T5.0 executada. Contrato T5 ABERTO formalmente conforme CONTRACT_SCHEMA.md. Corpo preenchido: §1–§17 + Bloco E (objetivo, escopo, fora de escopo, dependências, entradas, saídas S1–S9, critérios CA-01..CA-10, provas P-T5-01..05, bloqueios B-01..B-10, quebra PRs T5.0–T5.R, gate G5). 10 PRs mapeadas: T5.0 (abertura), T5.1 (mapa fatias), T5.2–T5.6 (contratos de fatia), T5.7 (paridade), T5.8 (shadow), T5.R (readiness G5). PR-T5.1 desbloqueada. Próximo passo: PR-T5.1.
