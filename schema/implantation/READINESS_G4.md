# READINESS_G4 — Smoke Documental e Decisão do Gate G4 — ENOVA 2

## Finalidade

Este documento executa o smoke documental de PR-T4.1 a PR-T4.6, verifica os critérios de aceite
CA-01..CA-10 do contrato T4, identifica lacunas bloqueantes e não bloqueantes, e declara a decisão
formal sobre o Gate G4 (orquestrador de turno funcional — pipeline completo LLM-first com entrada
padronizada, pipeline LLM, validação/persistência, resposta/rastro, fallbacks e bateria E2E).

É o documento-base de evidência da PR-T4.R — Readiness e closeout do gate G4.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T4 (microetapas obrigatórias de T4)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — critérios de aceite §7, gate G4 §17
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — seção K, PR-T4.R
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## §1 Smoke documental — PR-T4.1 a PR-T4.6

### §1.1 S1 — PR-T4.1 — Padronização da entrada do turno

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T4_ENTRADA_TURNO.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 shape `TurnoEntrada` com 6 campos obrigatórios e 4 opcionais; §2 definição de cada campo obrigatório (turn_id, case_id, message_text, channel, lead_state, current_objective); §3 campos opcionais; §4 13 campos proibidos com códigos TE-*; §5 sequência de validação V1–V6; §6 montagem de `ContextoTurno`; §7 tabela de campos ausentes; §8 posição no pipeline; §9 TE-INV-01..10; §10 AP-TE-01..12; §11 5 exemplos sintéticos; §12 microetapa 1 coberta; §13 validação cruzada T1/T2/T3; Bloco E |
| `TurnoEntrada` campos obrigatórios | 6/6 — turn_id, case_id, message_text, channel, lead_state, current_objective |
| `reply_text` em `TurnoEntrada` | PROIBIDO E DOCUMENTADO — §1 princípio: "TurnoEntrada nunca carrega reply_text"; TE-INV-01 |
| Invariante global | TurnoEntrada carrega contexto — nunca produz resposta; nunca decide; nunca fala; nunca persiste |
| `ContextoTurno` | 10 componentes obrigatórios + 5 condicionais declarados em §6 |
| Campos proibidos | 13 campos com códigos TE-* documentados (ex.: TE-01 reply_text explícito) |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T4.2 desbloqueada |
| Conclusão | **PASS** |

---

### §1.2 S2 — PR-T4.2 — Pipeline LLM com contrato único

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T4_PIPELINE_LLM.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 posição no pipeline; §2 shape `PipelinePrompt` com 4 blocos (§SYS/§CTX/§POL/§OUT); §3 definição de cada bloco; §4 `LLMCallContract` com invariante 1 chamada; §5 `LLMOutputRaw` e `LLMResult`; §6 captura de reply_text com invariante de imutabilidade; §7 captura parcial de TurnoSaida; §8 tratamento de saída malformada; §9 roteamento de componentes; §10 invariante de não sobrescrita; §11 LLP-INV-01..10; §12 AP-LLP-01..12; §13 5 exemplos sintéticos; §14 microetapa 2; §15 validação cruzada; Bloco E |
| Única chamada LLM | CONFIRMADO — §4 "Uma e somente uma chamada ao LLM por turno"; LLP-INV-04 |
| `reply_text` imutável | CONFIRMADO — "IMUTÁVEL após captura" explícito; LLP-INV-01; tabela §10 por componente |
| Saída malformada | fallback imediato — nunca retry, nunca improvisação (LLP-INV-03/04) |
| `§OUT` instrui formato | CONFIRMADO — instrui schema de saída, nunca conteúdo de fala |
| ParseError codes | 6 tipos declarados: INVALID_JSON, MISSING_REPLY_TEXT, UNKNOWN_FACT_KEY, INVALID_OBJ_TYPE, INVALID_CONFIDENCE_SCORE, EXTRA_FIELDS |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T4.3 desbloqueada |
| Conclusão | **PASS** |

---

### §1.3 S3 — PR-T4.3 — Validação policy engine + reconciliação antes de persistir

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 posição; §2 `ProposedStateDelta` VP-DELTA-01..05; §3 reconciliação T2.4; §4 `ValidationContext`; §5 validador VC-01..VC-09; §6 `PersistDecision` + `ValidationResult`; §7 safe_fields/blocked_fields; §8 conflitos/colisões; §9 aplicação ao lead_state; §10 reply_text não reescrito; §11 condições de atualização; §12 VP-INV-01..12; §13 AP-VP-01..12; §14 5 exemplos; §15 microetapa 3; §16 validação cruzada; Bloco E |
| Policy engine (T3) integrado | CONFIRMADO — §3.5 executa pipeline 6 estágios T3 sobre estado proposto |
| Reconciliação T2 antes de persistir | CONFIRMADO — §3.1 protocolo T2_RECONCILIACAO executado; ConflictRecord gerado |
| Validador VC-01..VC-09 | CONFIRMADO — §5 executa checklist completo em sequência; lógica REJECT>PREVENT_PERSISTENCE>REQUIRE_REVISION>APPROVE |
| `reply_text` em T4.3 | AUSENTE — §10 declara explicitamente que T4.3 não lê, não reescreve, não entrega reply_text |
| `PersistDecision` | 4 resultados: APPROVE, REQUIRE_REVISION, PREVENT_PERSISTENCE, REJECT |
| REJECT → T4.5 | CONFIRMADO — `reply_routing = "T4.5"` quando REJECT |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T4.4 desbloqueada |
| Conclusão | **PASS** |

---

### §1.4 S4 — PR-T4.4 — Resposta final, rastro e métricas mínimas

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 posição; §2 regras de entrega condicional de reply_text; §3 shape `TurnoRastro` 15 campos; §4 métricas mínimas 10 itens; §5 camadas L1/L2/L3/L4 pós-turno; §6 TurnoRastro vs TurnoSaida; §7 RR-INV-01..12; §8 AP-RR-01..12; §9 5 exemplos; §10 microetapa 4; §11 validação cruzada; Bloco E |
| Princípio de soberania | CONFIRMADO — "T4.4 não produz nem reescreve conteúdo de fala; apenas entrega o reply_text capturado pelo LLM quando reply_routing='T4.4'" |
| Entrega condicional | CONFIRMADO — reply_routing="T4.4" → entrega; reply_routing="T4.5" → não entrega; rota determinada por PersistDecision |
| `TurnoRastro` campos | 15 campos: turn_id, case_id, channel, validation_result, persist_decision, policy_decisions_applied, facts_persisted, facts_blocked, conflicts_registered, reply_routing, channel_delivery_status, channel_error_code, latency_ms, latency_llm_ms, tokens_input/output/total, timestamp, turn_start_timestamp |
| `TurnoRastro` vs auditoria | CONFIRMADO — "TurnoRastro é auditoria — nunca fonte mecânica de fala futura" (RR-RAST-01) |
| `profile_summary` isolado | CONFIRMADO — RR-L3-03: nunca derivado de reply_text; vem de snapshot_candidate.profile_summary |
| Métricas mínimas | 10 métricas declaradas: latency_ms, latency_llm_ms, tokens_input, tokens_output, tokens_total, validation_result, persist_decision, facts_persisted_count, facts_blocked_count, reply_routing |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T4.5 desbloqueada |
| Conclusão | **PASS** |

---

### §1.5 S5 — PR-T4.5 — Fallbacks de segurança

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T4_FALLBACKS.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 posição; §2 condições de acionamento; §3 shapes (FallbackContext, FallbackDecision, FallbackTrace, ErrorDetail, ResponseStrategy); §4 cenários obrigatórios (§4.1–§4.4); §5 resposta segura (FB-RETRY-01..02, estratégias, escalação); §6 rastro e métricas; §7 regra de não uso de reply_text rejeitado (FB-INV-01); §8 FB-INV-01..12; §9 AP-FB-01..13; §10 5 exemplos FB-E1..E5; §11 validação cruzada 14 dimensões; §12 microetapa 5; Bloco E |
| Cenários obrigatórios | 4/4 — erro_modelo (§4.1), formato_invalido (§4.2), omissao_campos (§4.3), contradicao_seria (§4.4) |
| FB-RETRY-01 | CONFIRMADO — retry LLM seguro apenas para `erro_modelo` (única tentativa); formato_invalido, omissao_campos, contradicao_seria sem retry |
| FB-INV-01 | CONFIRMADO — T4.5 nunca usa reply_text do turno falho como base/sugestão/template |
| FB-INV-02 | CONFIRMADO — T4.5 nunca promete aprovação; neutro quanto a decisão de negócio |
| FB-INV-03 | CONFIRMADO — T4.5 nunca avança stage; stage_change = "none" invariante |
| FB-INV-04 | CONFIRMADO — T4.5 nunca persiste fato confirmed; facts_persisted = [] invariante |
| FB-INV-07 | CONFIRMADO — FallbackTrace obrigatório em todo acionamento |
| Resposta segura | CONFIRMADO — mínima e humanizada, não template dominante (AP-FB-06 + §5.1) |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T4.6 desbloqueada |
| Conclusão | **PASS** |

---

### §1.6 S6 — PR-T4.6 — Bateria E2E sandbox + latência/custo

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T4_BATERIA_E2E.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 tabela geral 10 cenários; §2 convenções (G-01..G-08); §3 estrutura de cada cenário; §4 pipeline_completo §4.1..§4.4; §5 fallback §5.1..§5.4; §6 borda/regressão §6.1..§6.2; §7 cobertura artefatos T4.1..T4.5; §8 CA-01..09; §9 fallback 4/4; §10 métricas consolidadas; §11 anti-padrões; §12 cross-ref 20 dimensões; §13 microetapas; Bloco E |
| Total de cenários | **10** (≥10 exigido — CA-09 CUMPRIDO) |
| Breakdown | 4 pipeline_completo + 4 fallback + 1 borda + 1 regressão |
| Fallback 4/4 | E2E-FB-01 (erro_modelo), E2E-FB-02 (formato_invalido), E2E-FB-03 (omissao_campos), E2E-FB-04 (contradicao_seria) — CONFIRMADO |
| Estrutura de cada cenário | prior_state, TurnoEntrada, LLMResult simulado, LLMResponseMeta, ProposedStateDelta, PolicyDecisionSet, ValidationResult, PersistDecision, rota, TurnoRastro/FallbackTrace, métricas declarativas, PASS criteria |
| `reply_text` mecânico | AUSENTE em todos os resultados — zero ocorrências de reply_text no orquestrador/validador/policy/reconciliador |
| E2E-PC-03 coerência | CONFIRMADO — reply_text seguro (não afirma registro do campo bloqueado por VC-07) |
| E2E-FB-01 latência | CONFIRMADO — latency_ms=33.800ms ≥ partial_latency_ms=30.000ms (timeout+retry coerentes) |
| `profile_summary` | CONFIRMADO — E2E-BD-01: snapshot_candidate.profile_summary — nunca de reply_text (RR-L3-03) |
| Métricas declarativas | Presentes em todos os 10 cenários; latency_ms range 1.650–33.800ms; tokens_total range 228–1.068 |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T4.R desbloqueada |
| Conclusão | **PASS** |

---

## §2 Verificação CA-01..CA-10

| # | Critério | Evidência | Status |
|---|----------|-----------|--------|
| **CA-01** | Orquestrador coordena, nunca fala — `reply_text` exclusivamente do LLM | S1: TurnoEntrada nunca carrega reply_text (TE-INV-01); S2: reply_text capturado do LLM e imutável (LLP-INV-01); S3: T4.3 não escreve reply_text (§10); S4: T4.4 apenas entrega — não produz nem reescreve (RR-INV-02); S5: T4.5 não usa reply_text rejeitado (FB-INV-01); S6: E2E-BD-02 valida regressão VC-01 | **CUMPRIDO** |
| **CA-02** | Entrada do turno padronizada — `TurnoEntrada` com schema definido | S1: §1 define TurnoEntrada com turn_id, case_id, message_text, channel, lead_state, current_objective (6 obrigatórios) + 4 opcionais documentados | **CUMPRIDO** |
| **CA-03** | Pipeline LLM com contrato único — uma única chamada LLM por turno | S2: §4 "Uma e somente uma chamada ao LLM por turno" (LLP-INV-04); shape PipelinePrompt padronizado; reply_text nunca sobrescrito pós-LLM | **CUMPRIDO** |
| **CA-04** | Policy engine integrado antes de persistir — `PolicyDecisionSet` aplicado antes de qualquer persistência | S3: §3.5 executa policy engine T3 com pipeline 6 estágios sobre estado proposto pós-LLM; PolicyDecisionSet pré e pós-LLM distinguidos; soft_vetos passados como contexto ao LLM | **CUMPRIDO** |
| **CA-05** | Validador executado pós-resposta/pré-persistência — VC-01..VC-09 verificados | S3: §5 executa checklist VC-01..VC-09 em sequência; §4 monta ValidationContext completo sem reply_text bruto; REJECT e PREVENT_PERSISTENCE bloqueiam persistência; validation_log registrado | **CUMPRIDO** |
| **CA-06** | Reconciliação executada antes de persistir — estado reconciliado segundo T2_RECONCILIACAO | S3: §3.1 protocolo de reconciliação T2.4 executado por fato antes de persistir; ConflictRecord gerado para confirmed contradito; nenhum fact persiste sem reconciliação | **CUMPRIDO** |
| **CA-07** | Rastro do turno registrado — `TurnoRastro` com campos mínimos | S4: §3 shape TurnoRastro com turn_id, case_id, channel, policy_decisions_applied, validation_result, facts_persisted, latency_ms, tokens_used (tokens_input/output/total), timestamp — todos os campos mínimos presentes e mais | **CUMPRIDO** |
| **CA-08** | Fallbacks seguros cobertos — 4 cenários de falha declarados | S5: §4.1 erro_modelo (LLM timeout/indisponível); §4.2 formato_invalido (ParseError, sem retry); §4.3 omissao_campos (campo obrigatório ausente); §4.4 contradicao_seria (REJECT via VC-04); nenhum fallback produz reply_text mecânico dominante (AP-FB-06) | **CUMPRIDO** |
| **CA-09** | Bateria E2E declarativa com ≥10 cenários | S6: 10 cenários declarativos (E2E-PC-01..04, E2E-FB-01..04, E2E-BD-01, E2E-BD-02) com TurnoEntrada, resultado esperado, validação do rastro, métricas declarativas — mínimo 10 ATINGIDO | **CUMPRIDO** |
| **CA-10** | G4 decidido com Bloco E e evidência formal | Este documento (READINESS_G4.md): smoke S1–S6 PASS; CA-01..CA-09 verificados; decisão G4 formal na §5; Bloco E presente na §8 | **CUMPRIDO** |

**Resultado CA-01..CA-10: 10/10 CUMPRIDOS.**

---

## §3 Verificação de coerência entre artefatos T4.1..T4.6

### 3.1 Pipeline de dados — coerência de fluxo

| Transição | Campo | De | Para | Coerência |
|-----------|-------|-----|------|-----------|
| T4.1 → T4.2 | `TurnoEntrada` | S1: shape completo | S2: entrada do pipeline LLM via `ContextoTurno` | ✓ — `ContextoTurno` montado a partir de `TurnoEntrada.lead_state` + objetivo |
| T4.1 → T4.3 | `prior_decisions` | S1: campo opcional TurnoEntrada | S3: passado ao ValidationContext | ✓ — §4 de S3 declara que prior_decisions é contexto (não substitui execução T3) |
| T4.2 → T4.3 | `facts_updated_candidates` | S2: LLMResult campo | S3: via ProposedStateDelta | ✓ — S3 §2 constrói ProposedStateDelta a partir de facts_updated_candidates |
| T4.2 → T4.4 | `reply_text` | S2: capturado imutável | S4: entregue apenas se reply_routing="T4.4" | ✓ — imutabilidade preservada; T4.4 nunca reescreve |
| T4.3 → T4.4 | `PersistDecision.reply_routing` | S3: emitido pelo validador | S4: determina se T4.4 entrega ou T4.5 recebe | ✓ — routing coerente: REJECT→"T4.5"; demais→"T4.4" |
| T4.4 → T4.5 | `reply_routing = "T4.5"` | S4: TurnoRastro registra rota | S5: T4.5 acionado sem reply_text | ✓ — FB-INV-01 preservado; T4.5 recebe metadados, nunca o texto |
| T4.2 → T4.5 | ParseError/timeout/omissao | S2: erros fatais → fallback imediato | S5: FallbackTrigger correspondente | ✓ — LLP-INV-04 e S5 §2 alinham caminhos diretos |
| T4.1..T4.5 → T4.6 | Todos os shapes | S1..S5 | S6: cenários os exercitam | ✓ — E2E-PC-01..04, E2E-FB-01..04, E2E-BD-01..02 cobrem todos os artefatos |

### 3.2 Coerência de invariantes cross-artefato

| Invariante | Origem | Confirmação em outros artefatos | Status |
|------------|--------|---------------------------------|--------|
| `reply_text` nunca em output do orquestrador | A00-ADENDO-01 | TE-INV-01 (S1), LLP-INV-01 (S2), VP-INV-09 (S3), RR-INV-02 (S4), FB-INV-01 (S5), E2E-BD-02 (S6) | ✓ |
| `reply_text` imutável após captura LLM | LLP-INV-01 (S2) | S3 §10, S4 §2.3, S5 §7, S6 todos os cenários | ✓ |
| Uma única chamada LLM por turno | LLP-INV-04 (S2) | S3 não relança LLM; S5 FB-RETRY-01 (único retry apenas erro_modelo); S6 E2E-FB-01 | ✓ |
| Fallback nunca usa reply_text rejeitado | FB-INV-01 (S5) | S4 §7.3 (what T4.4 sends to T4.5); S6 E2E-PC-04/FB-04 | ✓ |
| Fallback nunca promete aprovação | FB-INV-02 (S5) | S6 E2E-FB-01..04 (todos response_strategy = request_reformulation ou retry) | ✓ |
| Fallback nunca avança stage | FB-INV-03 (S5) | S6: stage_advanced = false em todos os FallbackTrace | ✓ |
| `profile_summary` nunca de reply_text | RR-L3-03 (S4) | S6: E2E-BD-01 usa snapshot_candidate.profile_summary | ✓ |
| Chaves de fato canônicas (T2_DICIONARIO_FATOS) | T2 | S1..S6: todas as fact_keys verificadas contra T2 | ✓ |
| `formato_invalido` sem retry LLM | FB-RETRY-01 (S5) | S6: E2E-FB-02 confirma sem retry | ✓ |
| ConflictRecord gerado para fato contradito | VP-CONFL-01 (S3) | S4 TurnoRastro.conflicts_registered; S6 E2E-PC-03 | ✓ |

### 3.3 Cobertura das 5 microetapas do mestre T4

| Microetapa | Artefato | Status |
|------------|----------|--------|
| 1 — "Padronizar a entrada (mensagem, anexos, canal, contexto resumido, estado, políticas, objetivo)" | S1 T4_ENTRADA_TURNO | **COBERTA** |
| 2 — "Executar LLM com contrato único e capturar tanto o texto quanto a estrutura" | S2 T4_PIPELINE_LLM | **COBERTA** |
| 3 — "Passar a saída pelo policy engine e pelo reconciliador de estado antes de persistir" | S3 T4_VALIDACAO_PERSISTENCIA | **COBERTA** |
| 4 — "Gerar resposta final, registrar rastro e publicar métricas mínimas" | S4 T4_RESPOSTA_RASTRO_METRICAS | **COBERTA** |
| 5 — "Fallbacks para erro de modelo, formato inválido, omissão de campos, contradição séria" | S5 T4_FALLBACKS | **COBERTA** |

**5/5 microetapas cobertas.**

---

## §4 Verificação de soberania LLM e ausência de violações

### 4.1 Verificação de soberania LLM (A00-ADENDO-01)

| Verificação | Resultado |
|-------------|----------|
| Nenhum componente do orquestrador produz `reply_text` | CONFIRMADO — S1..S5 verificados; S6 E2E-BD-02 valida regressão |
| `reply_text` exclusivamente do LLM (S2) | CONFIRMADO — LLP-INV-01; §5 LLMResult |
| Policy engine (T3) não produz fala | CONFIRMADO — PolicyDecision.action sem campos de fala; CA-04 §3.5 S3 |
| Reconciliador (T2) não produz fala | CONFIRMADO — ConflictRecord sem reply_text; S3 §3 |
| Validador (T3.4) não produz fala | CONFIRMADO — ValidationResult sem reply_text; S3 §5 |
| T4.4 não produz nem reescreve `reply_text` | CONFIRMADO — RR-INV-02; §2 S4 princípio canônico |
| T4.5 não produz reply_text mecânico dominante | CONFIRMADO — AP-FB-06; §5.1 S5; resposta mínima e humanizada |
| Fallback nunca usa reply_text do turno falho | CONFIRMADO — FB-INV-01; S5 §7 |

**Soberania LLM: INTACTA em todos os artefatos.**

### 4.2 Verificação de ausência de `reply_text` mecânico nos cenários E2E (S6)

| Cenário | Resultado esperado | `reply_text` mecânico? |
|---------|--------------------|------------------------|
| E2E-PC-01 | APPROVE → T4.4 entrega reply_text do LLM | NÃO — reply_text do LLMResult |
| E2E-PC-02 | REQUIRE_REVISION → T4.4 entrega reply_text do LLM | NÃO — reply_text do LLMResult |
| E2E-PC-03 | PREVENT_PERSISTENCE → T4.4 entrega reply_text seguro do LLM | NÃO — reply_text do LLMResult; fala coerente com campo bloqueado |
| E2E-PC-04 | REJECT → T4.5 (reply_text do LLM não entregue) | NÃO — T4.5 responde sem usar reply_text rejeitado |
| E2E-FB-01 | retry_llm_safe → reply_text mínimo do retry | NÃO — reply_text do retry LLM |
| E2E-FB-02 | request_reformulation (sem retry) | NÃO — resposta segura mínima |
| E2E-FB-03 | request_reformulation | NÃO — resposta segura mínima |
| E2E-FB-04 | REJECT via VC-04 → T4.5 | NÃO — T4.5 sem reply_text rejeitado |
| E2E-BD-01 | APPROVE + ACAO_AVANÇAR_STAGE + L3 snapshot | NÃO — reply_text do LLMResult; profile_summary de snapshot_candidate |
| E2E-BD-02 | VC-01 REJECT (reply_text mecânico detectado) | N/A — cenário é REGRESSÃO que DETECTA e REJEITA violação |

**Zero ocorrências de reply_text mecânico em nenhum resultado esperado.**

---

## §5 Lacunas

### 5.1 Lacunas bloqueantes

**Nenhuma.**

Todos os artefatos S1–S6 estão presentes e completos. Todos os CA-01..CA-10 foram verificados com evidência suficiente. Nenhum critério tem status parcial ou inconclusivo.

### 5.2 Lacunas não bloqueantes

| Código | Descrição | Justificativa de não bloqueio |
|--------|-----------|-------------------------------|
| **LNB-G4-01** | Nenhuma implementação runtime em `src/` — T4.1..T4.6 são integralmente declarativos | Intencional — contrato T4 §3 declara "fora de escopo: implementação de código TypeScript/JavaScript em src/"; implementação real é escopo de milestone de código futuro |
| **LNB-G4-02** | Sem integração real com Supabase — estado e persistência são declarativos | Intencional — integração Supabase real requer escopo contratual próprio (pós-T4); T5+ |
| **LNB-G4-03** | Sem chamada LLM real verificada — pipeline LLM é sandbox declarativo | Intencional — T4.6 é bateria declarativa; chamada LLM real é validação de T5+; CA-09 exige cenários declarativos |
| **LNB-G4-04** | Métricas de latência são declarativas (não medidas em runtime real) | Intencional — bateria E2E é sandbox; métricas reais emergem de execução T5+; valores declarativos são plausíveis e coerentes internamente |
| **LNB-G4-05** | Skeleton T5 precisa ser preenchido com corpo completo na PR-T5.0 | Intencional — skeleton criado em PR-T4.R, corpo preenchido em PR-T5.0; não bloqueia G4 |

---

## §6 Decisão formal — Gate G4

```
╔══════════════════════════════════════════════════════════════════╗
║          GATE G4 — ORQUESTRADOR DE TURNO FUNCIONAL              ║
║                                                                  ║
║  Decisão:  G4 APROVADO                                          ║
║                                                                  ║
║  Data:     2026-04-25                                            ║
║  Baseado em: READINESS_G4.md                                     ║
╚══════════════════════════════════════════════════════════════════╝
```

**Justificativa:**

- Smoke S1–S6: **6/6 PASS**
- Critérios CA-01..CA-10: **10/10 CUMPRIDOS**
- Microetapas T4 (1–5): **5/5 COBERTAS**
- Coerência cross-artefato: **VERIFICADA** (10 invariantes + 8 transições de pipeline)
- Soberania LLM: **INTACTA** (zero reply_text mecânico em qualquer artefato ou resultado E2E)
- Fallbacks: **4/4** (erro_modelo, formato_invalido, omissao_campos, contradicao_seria)
- Bateria E2E: **10 cenários declarativos** (CA-09 ≥10 CUMPRIDO)
- Lacunas bloqueantes: **0**
- Lacunas não bloqueantes: **5** (LNB-G4-01..05) — todas justificadas; todas intencionais

**Consequência:** T5 autorizado — PR-T5.0 pode iniciar após merge desta PR.

---

## §7 Encerramento do contrato T4

```
--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim — orquestrador de turno LLM-first especificado;
                                          pipeline completo (T4.1..T4.6) declarado; G4 APROVADO
Critérios de aceite cumpridos?:         sim
  - [x] CA-01: Orquestrador coordena, nunca fala — reply_text exclusivamente do LLM
  - [x] CA-02: TurnoEntrada padronizada com schema definido
  - [x] CA-03: Pipeline LLM com contrato único (1 chamada por turno)
  - [x] CA-04: Policy engine integrado antes de persistir
  - [x] CA-05: Validador VC-01..VC-09 executado pós-resposta/pré-persistência
  - [x] CA-06: Reconciliação T2 executada antes de persistir
  - [x] CA-07: TurnoRastro com campos mínimos de auditabilidade
  - [x] CA-08: Fallbacks seguros cobertos (4/4)
  - [x] CA-09: Bateria E2E ≥10 cenários declarativos
  - [x] CA-10: G4 decidido com Bloco E e evidência formal
Fora de escopo respeitado?:             sim — nenhuma alteração em src/, package.json,
                                          wrangler.toml; sem integração real Meta/WhatsApp;
                                          sem chamada LLM real; sem shadow/canary/cutover
Pendências remanescentes:               nenhuma bloqueante — 5 não bloqueantes LNB-G4-01..05
                                          (implementação runtime, Supabase real, LLM real,
                                          métricas reais, skeleton T5 a ser preenchido)
Evidências / provas do encerramento:    PR #105 (PR-T4.0), PR #106 (PR-T4.1), PR #107 (PR-T4.2),
                                          PR #108 (PR-T4.3), PR #109 (PR-T4.4), PR #110 (PR-T4.5),
                                          PR #111 (PR-T4.6), PR #112 (PR-T4.R, esta PR);
                                          smoke S1–S6 PASS neste documento;
                                          CA-01..CA-10 verificados neste documento
Data de encerramento:                   2026-04-25
PR que encerrou:                        PR-T4.R — Readiness/Closeout G4
Destino do contrato encerrado:          archive →
                                          schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md
Próximo contrato autorizado:            T5 — Migração do funil e integração de canal
                                          (skeleton: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md)
```

---

## §8 Conformidade com adendos canônicos

| Adendo | Verificação | Status |
|--------|-------------|--------|
| **A00-ADENDO-01** (Soberania da IA na fala) | reply_text exclusivamente do LLM em todos os artefatos S1–S6; orquestrador coordena — nunca fala; zero reply_text mecânico em nenhum resultado E2E; E2E-BD-02 valida regressão VC-01 | **CONFORME** |
| **A00-ADENDO-02** (Soberania LLM-MCMV) | Orquestrador posicionado como coordenador, não casca dominante; T4.5 nunca é template rígido dominante (AP-FB-06); identidade MCMV preservada; B-06 bloqueia violação de soberania | **CONFORME** |
| **A00-ADENDO-03** (Fechamento por prova) | Bloco E presente em todos os artefatos S1–S6 e neste documento; "Fechamento permitido: sim" em todos; nenhum critério com evidência parcial declarado como cumprido; nenhuma lacuna bloqueante | **CONFORME** |

---

## §9 Bloco E — PR-T4.R

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G4.md
PR que fecha:                          PR-T4.R (Readiness/Closeout G4)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não —
                                       smoke S1–S6: 6/6 PASS;
                                       CA-01..CA-10: 10/10 CUMPRIDOS;
                                       5 microetapas T4: 5/5 cobertas;
                                       coerência cross-artefato: verificada;
                                       soberania LLM: intacta;
                                       fallbacks 4/4 cobertos;
                                       bateria E2E ≥10 cenários (10 declarativos);
                                       zero reply_text mecânico em resultados E2E;
                                       zero lacunas bloqueantes;
                                       5 lacunas não bloqueantes (LNB-G4-01..05)
                                         todas intencionais e justificadas;
                                       contrato T4 encerrado por checklist §7;
                                       skeleton T5 criado;
                                       tracking atualizado (_INDEX, STATUS, LATEST).
Há item parcial/inconclusivo bloqueante?: não —
                                       CA-01..CA-10: todos com evidência completa;
                                       S1..S6: todos com Bloco E "sim";
                                       soberania LLM: zero violações;
                                       fallback: 4/4 com invariantes FB-INV-01..04 confirmados.
Fechamento permitido nesta PR?:        sim —
                                       G4 APROVADO com justificativa formal (§6);
                                       contrato T4 encerrado via CONTRACT_CLOSEOUT_PROTOCOL (§7);
                                       skeleton T5 criado;
                                       PR-T5.0 desbloqueada.
Estado permitido após esta PR:         PR-T4.R CONCLUÍDA; READINESS_G4.md publicado;
                                       G4 APROVADO; contrato T4 ENCERRADO e arquivado;
                                       skeleton T5 criado; PR-T5.0 desbloqueada.
Próxima PR autorizada:                 PR-T5.0 — Abertura formal do contrato T5
```
