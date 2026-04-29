> **CONTRATO ENCERRADO** — G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS em 2026-04-29 via PR-T7.R.
> Arquivado em: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md`
> Readiness: `schema/implantation/READINESS_G7.md`
> Próxima fase autorizada: T8 — Diagnóstico técnico de aderência contrato × código real.
> Restrições operacionais herdadas: RA-G7-01..08 (telemetria, smoke, flags, WhatsApp — runtime pendente).
> Encerrado por: PR-T7.R (feat/t7-pr-t7-r-readiness-closeout-g7)

# CONTRATO — T7 Shadow, Canary, Cutover e Rollback — ENOVA 2

| Campo                             | Valor                                                                                              |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| Frente                            | T7 — Shadow, simulação, canary, cutover e rollback                                                |
| Fase do A01                       | T7 (semanas 15–16 + buffer da implantação macro)                                                  |
| Prioridade do A01                 | 8                                                                                                  |
| Dependências                      | G6 APROVADO — `schema/implantation/READINESS_G6.md` — **SATISFEITA em 2026-04-28**   |
| Legados aplicáveis                | L01, L02, L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17, C01–C09    |
| Referências obrigatórias          | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`, `schema/A00_PLANO_CANONICO_MACRO.md`, `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`, `schema/ADENDO_CANONICO_SOBERANIA_IA.md`, `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`, `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`, `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`, `schema/CONTRACT_SCHEMA.md`, `schema/implantation/READINESS_G6.md` |
| Blocos legados obrigatórios       | L01, L02, L06, L07, L08, L10, L15, L16, L17, C01, C02, C03, C04, C05, C07, C08, C09             |
| Blocos legados complementares     | L03, L04, L05, L09, L11, L12, L13, L14, C06                                                      |
| Ordem mínima de leitura da frente | L01 → L02 → L06 → L07 → L08 → L10 → L15 → L16 → L17 → C01 → C02 → C03 → C04 → C05 → C07       |
| Status                            | **aberto** — PR-T7.0 executada; próxima PR: PR-T7.1                                              |
| Última atualização                | 2026-04-29                                                                                         |

---

## Adendos canônicos declarados

Este contrato declara conformidade obrigatória com os três adendos canônicos ativos:

- **A00-ADENDO-01** (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`): IA soberana na fala. O mecânico jamais tem prioridade de fala. `reply_text` é exclusivamente produzido pelo LLM via T4. T7 não cria outro cérebro — opera o que T1–T6 construíram.
- **A00-ADENDO-02** (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`): Enova 2 é atendente especialista MCMV, não bot de regras. Regras MCMV são suporte ao LLM — nunca casca dominante. T7 não altera regras MCMV fixadas em T2/T3/T5.
- **A00-ADENDO-03** (`schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`): "Evidência manda no estado." Nenhum gate, etapa ou contrato encerra sem evidência completa. G7 só fecha em PR-T7.R com prova plena.

---

## §1 Objetivo

T7 entrega o **go-live controlado da ENOVA 2**: operação do sistema construído em T1–T6 em ambiente real, com controle de tráfego, telemetria, rollback seguro e gate executivo G7.

**T7 é go-live — não é criação de features.** Toda feature foi contratada e construída em T1–T6.
T7 opera, valida, controla e libera o que foi construído, com dois caminhos formalmente autorizados:

### Caminho A — Gradual controlado (padrão)

```
Pré-flight (T7.1) → Shadow/simulação (T7.2) → Divergências/hardening (T7.3) →
Canary interno (T7.4) → Cutover parcial/total (T7.5) → Rollback provado (T7.6) →
Checklist go/no-go (T7.7) → Closeout G7 (T7.R)
```

### Caminho B — Arrojado permitido

Se não houver cliente real ativo **e** se smoke, rollback e critérios de go/no-go passarem:
cutover amplo/total antes da entrada de clientes reais é **autorizado**, desde que os elementos
mínimos obrigatórios listados em §6 estejam provados.

### Contexto operacional determinante

**A Enova ainda NÃO está atendendo clientes reais em produção.** Nem no legado nem na Enova 2.
T7 prepara, valida e libera o go-live antes da entrada real de clientes.
- Não há operação ativa em risco imediato.
- Podemos ser mais arrojados no plano de migração.
- O risco real é ligar cliente real antes de smoke, rollback, monitoramento e go/no-go estarem provados — não o risco de interromper operação existente.

---

## §2 Escopo

T7 inclui exclusivamente:

1. **Pré-flight operacional**: mapeamento e validação das condições mínimas de go-live (feature flags, desligamento, fallback, métricas, logs, comparação T1–T6).
2. **Shadow/simulação controlada**: replay de casos históricos/sintéticos, comparação contra T1–T6, validação de fala LLM-first, coleta de divergências — sem tráfego real de clientes até autorização.
3. **Matriz de divergências e hardening**: classificação formal de todas as divergências da simulação antes de qualquer canary ou cutover.
4. **Canary interno/pré-produção**: volume pequeno, reversível e monitorado, somente após T7.2/T7.3 sem bloqueantes.
5. **Cutover parcial ou total governado**: substituição controlada do fluxo com prova de estabilidade e fallback; cutover total antes da entrada de clientes reais é autorizado se as provas passarem.
6. **Rollback operacional provado**: não apenas documentado — executado ou simulado de forma controlada, com evidência.
7. **Checklist executivo go/no-go**: consolidação de provas, divergências, riscos aceitos e recomendação executiva antes de fechar G7.
8. **Closeout G7 (PR-T7.R)**: decisão formal de G7 conforme `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`.
9. **Telemetria mínima**: logs estruturados, métricas de turno, alertas críticos operacionais.
10. **Feature flag e mecanismo de desligamento**: forma clara de desligar Enova 2 e reverter ao legado a qualquer momento.

---

## §3 Fora de escopo

T7 **não** inclui:

- Novas features de T1–T6 (já foram contratadas; T7 não acrescenta funcionalidade nova).
- Alteração de regras MCMV já fixadas em T2/T3/T5 — regras de negócio são imutáveis nesta fase.
- Campanha comercial ou abertura pública de novos canais.
- Desligamento do legado antes de G7 formalmente aprovado.
- Criação de `reply_text` mecânico, fallback dominante ou script de atendimento rígido.
- Alteração de `fact_*`, `current_phase` ou policy engine definidos em T2/T3.
- Criação de novo LLM, novo sistema cognitivo ou nova camada de cérebro — T7 opera o LLM contratado em T1.
- Integração com novos canais Meta/WhatsApp não especificados em T6.
- Deploy direto para produção sem go/no-go formal.
- Alteração de `src/` sem PR de execução vinculada a critério de aceite verificável desta T7.
- Abertura de volume real de clientes sem decisão G7 explícita.

---

## §4 Dependências

| Dependência | Status | Evidência |
|-------------|--------|-----------|
| G6 APROVADO | **SATISFEITA** em 2026-04-28 | `schema/implantation/READINESS_G6.md` |
| Contrato T6 encerrado | **SATISFEITA** em 2026-04-28 | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md` |
| T1–T6 entregues e merged | **SATISFEITA** | 9 PRs T6.1–T6.9 merged; T1–T5 encerrados via gates G1–G5 |
| Soberania LLM verificada | **SATISFEITA** | A00-ADENDO-01/02 respeitados em T1–T6 |
| Skeleton T7 presente | **SATISFEITA** | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` criado em PR-T6.R |
| PR-T7.0 executada | **ESTA PR** | Este contrato substitui o skeleton |

---

## §5 Entradas

Para iniciar T7, os seguintes artefatos e estados devem existir:

| Entrada | Caminho | Status |
|---------|---------|--------|
| Contrato T7 aberto formalmente | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` (este arquivo) | ✅ criado nesta PR |
| Readiness G6 | `schema/implantation/READINESS_G6.md` | ✅ existe |
| Sistema T1–T6 completo | `schema/implantation/T*_*.md` | ✅ 40+ artefatos declarativos |
| Adendos soberania | `schema/ADENDO_CANONICO_*.md` | ✅ ativos |
| Bíblia canônica PR | `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` | ✅ existe |
| Contrato T6 arquivado | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md` | ✅ existe |

---

## §6 Saídas

| ID | Artefato | PR que entrega | Conteúdo mínimo |
|----|----------|----------------|-----------------|
| S1 | `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` | PR-T7.1 | Feature flags, desligamento, fallback, plano de métricas/logs, comparação T1–T6, critérios para T7.2 e caminho arrojado |
| S2 | `schema/implantation/T7_SHADOW_SIMULACAO.md` | PR-T7.2 | Casos sintéticos+históricos, comparação T1–T6, validação LLM-first, métricas de paridade, gatilhos de congelamento |
| S3 | `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` | PR-T7.3 | Classificação formal de divergências em 12 categorias; hardening antes de canary/cutover |
| S4 | `schema/implantation/T7_CANARY_INTERNO.md` | PR-T7.4 | Ambiente/canal, volume, critérios de expansão/pausa/rollback, janela, métricas, quem aprova |
| S5 | `schema/implantation/T7_CUTOVER_GOVERNADO.md` | PR-T7.5 | Cutover parcial/total, blocos provados, fallback, estabilidade, decisão executiva, registro |
| S6 | `schema/implantation/T7_ROLLBACK_OPERACIONAL.md` | PR-T7.6 | Roteiro de rollback, gatilhos de incidente, preservação estado/logs, pausa Meta/WhatsApp, feature flag, evidências |
| S7 | `schema/implantation/T7_CHECKLIST_GONO_GO.md` | PR-T7.7 | Relatório shadow+canary, divergências, riscos aceitos, decisão recomendada |
| S8 | `schema/implantation/T7_READINESS_CLOSEOUT_G7.md` | PR-T7.R | Readiness formal, Bloco E, decisão G7 |

### Elementos mínimos obrigatórios para qualquer go-live (Caminho A ou B)

Independentemente do caminho escolhido, antes da abertura de volume real de clientes:

| Elemento | Obrigatório | Pode ser dispensado? |
|----------|-------------|----------------------|
| Rollback operacional testado/simulado | **SIM** | Nunca |
| Smoke mínimo (pré-flight passou) | **SIM** | Nunca |
| Telemetria/logs estruturados ativos | **SIM** | Nunca |
| Critério de go/no-go explícito | **SIM** | Nunca |
| Feature flag ou forma clara de desligar | **SIM** | Nunca |
| Prova de que WhatsApp/Meta não foram abertos sem validação | **SIM** | Nunca |
| Decisão executiva documentada (G7 ou equivalente) | **SIM** | Nunca |

---

## §7 Critérios de aceite

| ID | Critério | Verificável por |
|----|----------|-----------------|
| CA-T7-01 | Pré-flight completo: feature flags documentadas, desligamento definido, fallback mapeado | `T7_PREFLIGHT_GO_LIVE.md` |
| CA-T7-02 | Shadow/simulação executada com casos sintéticos e históricos; métricas de paridade coletadas | `T7_SHADOW_SIMULACAO.md` |
| CA-T7-03 | Todas as divergências classificadas em 12 categorias; bloqueantes zerados ou com decisão explícita | `T7_MATRIZ_DIVERGENCIAS.md` |
| CA-T7-04 | Canary interno executado (ou dispensado com justificativa explícita e documentada) | `T7_CANARY_INTERNO.md` |
| CA-T7-05 | Cutover com registro de decisão executiva; fallback preservado; estabilidade medida | `T7_CUTOVER_GOVERNADO.md` |
| CA-T7-06 | Rollback provado — executado ou simulado, não apenas documentado; evidências presentes | `T7_ROLLBACK_OPERACIONAL.md` |
| CA-T7-07 | Checklist go/no-go consolidado com recomendação executiva explícita | `T7_CHECKLIST_GONO_GO.md` |
| CA-T7-08 | G7 fechado formalmente via PR-T7.R com Bloco E completo e `Fechamento permitido?: sim` | `T7_READINESS_CLOSEOUT_G7.md` |
| CA-T7-09 | Soberania LLM preservada em todo T7 — zero `reply_text` mecânico, zero LLM alternativo | Inspeção de todos S1–S8 |
| CA-T7-10 | Regras MCMV de T2/T3/T5 não alteradas por nenhuma PR de T7 | Diff de `src/` + artefatos T2/T3/T5 |
| CA-T7-11 | Zero abertura de volume real de clientes antes de decisão G7 explícita | `T7_READINESS_CLOSEOUT_G7.md` + registro executivo |
| CA-T7-12 | Telemetria mínima ativa antes de qualquer go-live com cliente real | `T7_PREFLIGHT_GO_LIVE.md` + evidência runtime |

---

## §8 Provas obrigatórias

| ID | Prova | Formato | Entregue por |
|----|-------|---------|--------------|
| P-T7-01 | Pré-flight passou (feature flags, desligamento, fallback) | Inspeção declarativa de `T7_PREFLIGHT_GO_LIVE.md` | PR-T7.1 |
| P-T7-02 | Simulação executada com métricas de paridade | `T7_SHADOW_SIMULACAO.md` com cenários e resultados | PR-T7.2 |
| P-T7-03 | Divergências classificadas e bloqueantes zerados | `T7_MATRIZ_DIVERGENCIAS.md` com tabela de classificação | PR-T7.3 |
| P-T7-04 | Canary executado ou dispensado com justificativa explícita | `T7_CANARY_INTERNO.md` com decisão e critérios | PR-T7.4 |
| P-T7-05 | Rollback executado ou simulado com evidência | `T7_ROLLBACK_OPERACIONAL.md` + evidência de execução/simulação | PR-T7.6 |
| P-T7-06 | Checklist go/no-go com recomendação executiva | `T7_CHECKLIST_GONO_GO.md` completo | PR-T7.7 |
| P-T7-07 | G7 com Bloco E preenchido e `Fechamento permitido?: sim` | `T7_READINESS_CLOSEOUT_G7.md` | PR-T7.R |

---

## §9 Bloqueios

| ID | Bloqueio | Desbloqueado por |
|----|----------|-----------------|
| B-T7-01 | G6 não aprovado | G6 APROVADO em 2026-04-28 — **DESBLOQUEADO** |
| B-T7-02 | Contrato T7 é skeleton (não formal) | Esta PR-T7.0 — **DESBLOQUEADO nesta PR** |
| B-T7-03 | Pré-flight não realizado | PR-T7.1 entregue e merged |
| B-T7-04 | Shadow/simulação não executada | PR-T7.2 entregue e merged |
| B-T7-05 | Divergências não classificadas | PR-T7.3 entregue e merged |
| B-T7-06 | Rollback não provado | PR-T7.6 entregue e merged |
| B-T7-07 | Bloqueante absoluto em T7.3 não resolvido | Decisão explícita (aceitar, corrigir ou desistir) em PR-T7.3 |
| B-T7-08 | Feature flag ou desligamento não existe | PR-T7.1 |
| B-T7-09 | Telemetria mínima não ativa | PR-T7.1 (planejamento) + PR correspondente (execução) |
| B-T7-10 | G7 não aprovado | PR-T7.R com `G7 APROVADO` |

---

## §10 Próximo passo autorizado

**PR-T7.1** — Pré-flight de go-live e travas operacionais.

Desbloqueada por: PR-T7.0 executada (esta PR).

---

## §11 Relação com o A01

| Campo | Valor |
|-------|-------|
| Fase do A01 | T7 — Shadow, canary, cutover, desligamento do legado |
| Prioridade | 8 (última fase da implantação macro) |
| Item do A01 | T7 — semanas 15–16 + buffer |
| Gate de entrada | G6 — Canais controlados (APROVADO em 2026-04-28) |
| Gate de saída | G7 — Go/no-go executivo |
| Saída do mestre | Shadow mode, canary, rollback e desativação controlada do legado concluídos |

---

## §12 Relação com legados aplicáveis

Os blocos legados do tronco soberano `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` que regem T7:

- **L01–L02**: Visão de produto e missão da Enova — a Enova 2 deve ser atendente especialista, não bot de formulário.
- **L06–L08**: Funil de atendimento MCMV (topo → qualificação → renda → elegibilidade) — T7 opera este funil em go-live controlado.
- **L10**: Regras de elegibilidade MCMV — imutáveis em T7; verificadas em T7.2/T7.3 para paridade.
- **L15–L17**: Gestão de visita, handoff e desligamento — T7 inclui rollback e cutover como extensão desses blocos.
- **C01–C09**: Contratos cognitivos — T7 preserva todos os contratos cognitivos definidos em T1–T6.

---

## §13 Referências obrigatórias do contrato

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — tronco macro soberano
2. `schema/A00_PLANO_CANONICO_MACRO.md` — arquitetura e precedência
3. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md` — ordem executiva T0–T7
4. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md` — pacote documental por aba
5. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
6. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
7. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)
8. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
9. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
10. `schema/CONTRACT_SCHEMA.md`
11. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
12. `schema/execution/PR_EXECUTION_TEMPLATE.md`
13. `schema/handoffs/PR_HANDOFF_TEMPLATE.md`
14. `schema/implantation/READINESS_G6.md`
15. `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`
16. `schema/CODEX_WORKFLOW.md`

---

## §14 Blocos legados aplicáveis

### Obrigatórios (ler antes de qualquer PR de T7)

| Bloco | Caminho | Relevância para T7 |
|-------|---------|---------------------|
| L01 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §1 | Visão e missão — go-live deve honrar a identidade de produto |
| L02 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §2 | Produto Enova — T7 opera como produto, não como infraestrutura |
| L06 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §6 | Topo do funil — T7 opera topo em go-live |
| L07 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §7 | Qualificação MCMV — T7 valida paridade de qualificação |
| L08 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §8 | Renda e elegibilidade — imutável em T7 |
| L10 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §10 | Regras MCMV — T7 não altera, apenas valida paridade |
| L15 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §15 | Visita — T7 inclui handoff de visita no rollback |
| L16 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §16 | Handoff correspondente — T7 preserva canal de correspondente |
| L17 | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` §17 | Desligamento do legado — T7 é o momento operacional de transição |

### Complementares (consultar por contexto específico)

| Bloco | Relevância |
|-------|-----------|
| L03–L05 | Fluxos de estado intermediários — consultar em T7.3 para divergências |
| L09, L11–L14 | Regras complementares de negócio — consultar em T7.2 para casos de simulação |
| C06 | Contratos extraordinários de memória — consultar em T7.2 para paridade de estado |

---

## §15 Ordem mínima de leitura da frente

Para qualquer PR de T7, ler nesta ordem antes de executar:

```
L01 → L02 (visão e produto)
→ L06 → L07 → L08 → L10 (funil MCMV e regras)
→ L15 → L16 → L17 (visita, handoff, desligamento)
→ C01 → C02 → C03 → C04 → C05 (contratos cognitivos T1–T5)
→ C07 → C08 → C09 (contratos de canal T6)
→ schema/implantation/READINESS_G6.md (pré-requisito G6)
→ schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md (este contrato)
```

---

## §16 Quebra interna de PRs — T7.0 a T7.R

### PR-T7.0 — Abertura formal do contrato T7

**Objetivo:** Criar o corpo executivo completo da T7, substituindo o skeleton criado em PR-T6.R.

**Escopo:** Contrato completo conforme `schema/CONTRACT_SCHEMA.md`: objetivo, escopo, fora de escopo, dependências, entradas, saídas S1–S8, critérios CA-T7-01..12, provas P-T7-01..07, bloqueios B-T7-01..10, quebra de PRs T7.0–T7.R, caminhos A e B, gate G7, legados, referências, adendos, Bloco E.

**Fora de escopo:** Qualquer execução real — zero shadow, zero canary, zero cutover, zero runtime, zero `src/`.

**Entrega:** Este arquivo — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`.

**Próxima PR autorizada:** PR-T7.1.

---

### PR-T7.1 — Pré-flight de go-live e travas operacionais

**Objetivo:** Mapear e validar documentalmente as condições mínimas para iniciar simulação, canary ou cutover controlado.

**Deve cobrir:**
- Feature flags necessárias para habilitar/desabilitar Enova 2 sem downtime.
- Forma clara de desligamento e reversão ao legado.
- Fallback para estado anterior (lead_state, Supabase, canal).
- Plano de métricas: quais métricas medir, thresholds de alerta, frequência.
- Plano de logs: log estruturado por turno, rastreabilidade de decision, preservação de auditoria.
- Plano de comparação contra contratos T1–T6 (quais artefatos comparar, como medir paridade).
- Critérios de bloqueio (condições que impedem seguir para T7.2).
- Critérios mínimos para liberar PR-T7.2 (Caminho A) ou para permitir Caminho B (arrojado).

**Fora de escopo:** Executar shadow real, ligar tráfego real ou alterar runtime.

**Entrega:** `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`.

**Próxima PR:** PR-T7.2.

---

### PR-T7.2 — Shadow/simulação controlada

**Objetivo:** Validar Enova 2 em paralelo/simulação antes da entrada de clientes reais.

**Contexto:** Como não há atendimento real ativo hoje, esta PR trata shadow como **simulação controlada** (replay de casos históricos/sintéticos, comparação declarativa) — não como proteção de operação ativa.

**Deve cobrir:**
- Casos sintéticos cobrindo fluxos T1–T6 (qualificação, renda, elegibilidade, dossiê, canal).
- Casos históricos (se disponíveis) para validação de paridade.
- Comparação declarativa contra artefatos T1–T6 (output esperado vs. output obtido).
- Validação de fala LLM-first: nenhum `reply_text` mecânico, nenhum fallback dominante.
- Validação de estado: `lead_state` correto após cada turno simulado.
- Validação de policy: regras MCMV aplicadas corretamente.
- Validação documental/dossiê: fluxo de documentos conforme T6.8.
- Validação de WhatsApp/Meta: adapter conforme T6.7 sem operação real aberta.
- Coleta de divergências para T7.3.
- Métricas mínimas de paridade (% cenários PASS, tipos de divergência).
- Gatilhos de congelamento (condições que pausam simulação e exigem análise).

**Fora de escopo:** Tráfego real de clientes, cutover real, alteração de regras MCMV.

**Entrega:** `schema/implantation/T7_SHADOW_SIMULACAO.md`.

**Próxima PR:** PR-T7.3.

---

### PR-T7.3 — Matriz de divergências e hardening

**Objetivo:** Classificar formalmente todas as divergências coletadas em T7.2 e definir hardening necessário antes de canary ou cutover.

**Categorias obrigatórias de classificação:**

| Código | Categoria | Definição |
|--------|-----------|-----------|
| DIV-MA | Melhoria aceitável | Enova 2 melhorou em relação ao esperado — aceitável sem correção |
| DIV-ND | Divergência neutra | Diferença sem impacto em negócio ou experiência |
| DIV-RO | Risco operacional | Pode impactar fluxo, mas não viola MCMV |
| DIV-VP | Violação de policy | Viola regra interna de policy engine T3 |
| DIV-RM | Quebra de regra MCMV | Viola regra MCMV fixada em T2/T3/T5 — **bloqueante absoluto** |
| DIV-PI | Risco de promessa indevida | Pode gerar expectativa falsa no cliente |
| DIV-PL | Risco de perda de lead | Pode causar abandono ou qualificação incorreta |
| DIV-RD | Risco documental | Falha em gestão de documentos/dossiê |
| DIV-VH | Risco de visita/handoff | Falha em transição de fase ou handoff ao correspondente |
| DIV-WA | Risco de Meta/WhatsApp | Falha em adapter, entrega, rate limit ou segurança |
| DIV-ES | Risco de estado/memória | `lead_state` incorreto, snapshot corrompido, conflito de fato |
| DIV-BA | Bloqueante absoluto | Qualquer divergência que impede go-live — exige resolução antes de T7.4 |

**Regras:**
- `DIV-RM` e `DIV-BA` bloqueiam canary e cutover até resolução explícita.
- Para `DIV-BA` não resolvido: deve haver decisão formal (aceitar risco, corrigir, adiar go-live).
- Hardening: lista de correções necessárias com PR vinculada ou decisão de aceitação de risco.

**Entrega:** `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md`.

**Próxima PR:** PR-T7.4.

---

### PR-T7.4 — Canary interno ou pré-produção

**Objetivo:** Autorizar canary pequeno, reversível e monitorado somente se T7.2/T7.3 não tiverem bloqueantes.

**Contexto:** Como não há operação real ativa, o canary pode ser mais rápido e agressivo, desde que não abra volume real sem controle explícito.

**Deve conter:**
- Ambiente/canal permitido (ambiente de homologação, canal de teste, canal de pré-produção).
- Volume inicial permitido (número máximo de leads/turnos na primeira janela).
- Critérios de expansão (condições para aumentar volume).
- Critérios de pausa (condições para suspender canary temporariamente).
- Critérios de rollback (condições para reverter canary imediatamente).
- Janela de observação (tempo mínimo antes de expandir ou decidir cutover).
- Métricas mínimas monitoradas durante canary.
- Quem aprova avanço de volume (decisão executiva explícita).
- Distinção clara entre canary interno (volume controlado) e cliente real irrestrito.

**Regra especial:** Canary pode ser dispensado com justificativa explícita se Caminho B (arrojado) for escolhido e todos os elementos mínimos de §6 estiverem provados. Dispensa deve ser documentada formalmente em `T7_CANARY_INTERNO.md`.

**Entrega:** `schema/implantation/T7_CANARY_INTERNO.md`.

**Próxima PR:** PR-T7.5.

---

### PR-T7.5 — Cutover parcial ou total governado

**Objetivo:** Formalizar a substituição parcial ou total do fluxo conforme provas coletadas em T7.2–T7.4.

**Contexto:** Como não há atendimento real ativo, o contrato **permite cutover total antes da entrada de clientes reais**, desde que todos os critérios mínimos de §6 estejam cumpridos.

**Deve conter:**
- Quando cutover parcial é obrigatório (cenários onde cutover total é prematuro).
- Quando cutover total é permitido (critérios mínimos: pré-flight passou, rollback provado, telemetria ativa, go/no-go explícito, bloqueantes zerados ou aceitos).
- Quais blocos precisam estar provados antes de cada nível de cutover.
- Como preservar fallback durante e após cutover.
- Como medir estabilidade pós-cutover (métricas, janela de observação mínima).
- Como impedir abertura de volume real com cliente antes do go/no-go formal (G7 ou equivalente aprovado).
- Como registrar a decisão executiva de cutover (quem decide, data, condições, evidência).

**Entrega:** `schema/implantation/T7_CUTOVER_GOVERNADO.md`.

**Próxima PR:** PR-T7.6.

---

### PR-T7.6 — Rollback operacional e incidente real

**Objetivo:** Provar que rollback funciona de verdade — não apenas no papel.

**Contexto:** Mesmo sem cliente real ativo, rollback é obrigatório para evitar quebra de arquitetura, canal, deploy, estado, WhatsApp ou painel. T7 não é apenas go-live — é go-live **com porta de saída provada**.

**Deve conter:**
- Roteiro passo-a-passo de rollback (reversão completa da Enova 2, restauração do legado).
- Gatilhos de incidente (condições que disparam rollback automático ou manual).
- Preservação de estado (como `lead_state` é preservado durante rollback).
- Preservação de logs (audit trail permanece durante e após rollback).
- Pausa de WhatsApp/Meta (como pausar o adapter T6.7 sem perda de mensagens).
- Reversão de feature flag (como desligar Enova 2 via flag sem deploy).
- Comunicação operacional (quem é notificado, como, em quanto tempo).
- Evidências exigidas (o que deve ser coletado após rollback para prova de reversão completa).
- Teste ou simulação controlada de reversão: rollback deve ser **executado ou simulado** antes de go-live com cliente real, com evidência.

**Entrega:** `schema/implantation/T7_ROLLBACK_OPERACIONAL.md`.

**Próxima PR:** PR-T7.7.

---

### PR-T7.7 — Checklist executivo de go/no-go

**Objetivo:** Consolidar todas as provas coletadas em T7.1–T7.6, declarar pendências, riscos aceitos e emitir recomendação executiva antes de fechar G7.

**Deve conter:**
- Relatório de simulação/shadow (resumo de T7.2: cenários, métricas, divergências).
- Relatório de canary (resumo de T7.4: volume, métricas, incidentes, decisão de expansão ou dispensa).
- Divergências resolvidas (lista de todos os DIV-* com status final: resolvido, aceito, dispensado, pendente).
- Riscos aceitos explicitamente (lista de riscos com justificativa de aceite e responsável).
- Bloqueantes zerados (confirmação de que zero `DIV-BA` pendente).
- Confirmação de que não há cliente real ativo sem go/no-go aprovado.
- Decisão recomendada (uma das quatro opções abaixo):
  - `G7 APROVADO` — go-live completo autorizado.
  - `G7 APROVADO PARCIALMENTE` — go-live com restrições explícitas (listar restrições).
  - `G7 APROVADO PARA CUTOVER TOTAL ANTES DA ENTRADA DE CLIENTES REAIS` — caminho B arrojado aprovado.
  - `G7 REPROVADO` — go-live bloqueado; listar motivos e próximos passos.

**Entrega:** `schema/implantation/T7_CHECKLIST_GONO_GO.md`.

**Próxima PR:** PR-T7.R.

---

### PR-T7.R — Readiness/Closeout G7

**Objetivo:** Fechar ou reprovar formalmente G7 conforme `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`.

**Pré-requisito absoluto para aprovar G7:**

| Condição | Obrigatória |
|----------|-------------|
| Pré-flight passou (T7.1) | Sim |
| Simulação/shadow executada e medida (T7.2) | Sim |
| Divergências classificadas (T7.3) | Sim |
| Canary executado ou dispensado com justificativa (T7.4) | Sim |
| Cutover com decisão registrada (T7.5) | Sim |
| Rollback comprovado — executado ou simulado (T7.6) | Sim |
| Checklist go/no-go com recomendação executiva (T7.7) | Sim |
| Bloqueantes críticos zerados ou com decisão explícita | Sim |
| Riscos aceitos documentados | Sim |
| Fallback/desligamento existe e foi provado | Sim |
| Telemetria mínima existe e está ativa | Sim |
| Zero cliente real ativo sem go/no-go aprovado | Sim |
| Bloco E completo com `Fechamento permitido?: sim` | Sim |

**Resultados possíveis de G7:**

| Resultado | Condição |
|-----------|----------|
| `G7 APROVADO` | Todos os critérios satisfeitos; go-live pleno autorizado |
| `G7 REPROVADO` | Um ou mais critérios bloqueantes não satisfeitos |
| `G7 APROVADO PARCIALMENTE` | Aprovação com restrições explícitas declaradas |
| `G7 APROVADO PARA CUTOVER TOTAL ANTES DA ENTRADA DE CLIENTES REAIS` | Caminho B formalmente aprovado |

**Entrega:** `schema/implantation/T7_READINESS_CLOSEOUT_G7.md`.

**Esta é a última PR da implantação macro T0–T7.** Após G7 APROVADO, o projeto está em go-live.

---

## §17 Caminhos de go-live formalizados

### Caminho A — Gradual controlado (padrão)

**Sequência:** T7.1 → T7.2 → T7.3 → T7.4 → T7.5 → T7.6 → T7.7 → T7.R

**Quando usar:** Quando há incerteza sobre paridade, divergências não totalmente mapeadas, ou preferência por cautela operacional.

**Vantagens:** Menor risco de surpresa; cada etapa valida a próxima; rollback mais fácil em qualquer ponto.

### Caminho B — Arrojado permitido

**Condição de ativação:** Não há cliente real ativo **E** os seguintes elementos estão provados:

| Elemento | Status exigido |
|----------|----------------|
| Pré-flight completo (T7.1) | Entregue e PASS |
| Smoke/simulação com métricas aceitáveis (T7.2) | Entregue e PASS |
| Zero `DIV-RM` e zero `DIV-BA` não resolvidos (T7.3) | Confirmado |
| Rollback provado (T7.6) | Executado ou simulado com evidência |
| Telemetria ativa | Confirmado |
| Feature flag/desligamento | Confirmado |
| Decisão executiva explícita | Documentada |

**O que muda no Caminho B:**
- Canary (T7.4) pode ser dispensado com justificativa formal.
- Cutover total (T7.5) pode ser executado antes da entrada de qualquer cliente real.
- A sequência de PRs permanece a mesma — mas T7.4 pode ser entregue como "dispensado" e T7.5 pode registrar cutover total.

**O que NÃO muda no Caminho B:**
- Rollback operacional permanece obrigatório.
- Smoke mínimo permanece obrigatório.
- Telemetria permanece obrigatória.
- Critério de go/no-go permanece obrigatório.
- Feature flag/desligamento permanece obrigatório.
- Prova de WhatsApp/Meta validados permanece obrigatória.
- G7 formal via PR-T7.R permanece obrigatório.

---

## §18 Gate G7 — Condição de encerramento da implantação macro

G7 é o gate executivo final da implantação macro ENOVA 2.

**G7 só pode ser declarado aprovado em PR-T7.R.**

**G7 permanece bloqueado enquanto:**
- Qualquer PR de T7.1 a T7.7 não tiver sido entregue e merged.
- Houver `DIV-BA` aberto sem decisão explícita.
- Rollback não tiver sido provado.
- Telemetria mínima não estiver ativa.
- Decisão executiva de go-live não tiver sido registrada.
- Bloco E de PR-T7.R não tiver `Fechamento permitido?: sim`.

**Após G7 APROVADO:**
- A implantação macro T0–T7 está concluída.
- O contrato T7 é arquivado em `schema/contracts/archive/`.
- O sistema ENOVA 2 está em produção (go-live formal).
- Qualquer evolução futura é tratada como novo ciclo de implantação ou manutenção operacional.

---

## §19 Preservação da soberania LLM e regras MCMV

Cada PR de T7 deve declarar explicitamente:

1. **Soberania LLM preservada:** nenhuma PR de T7 cria `reply_text` mecânico, fallback dominante, LLM alternativo ou surface que sobreponha a IA na fala.
2. **Regras MCMV inalteradas:** nenhuma PR de T7 altera regras de elegibilidade, income, regime ou composição familiar fixadas em T2/T3/T5.
3. **Zero novo cérebro:** T7 não cria novo sistema cognitivo — opera o LLM-first construído em T1–T6.
4. **Canal não é cérebro:** o adapter Meta/WhatsApp de T6.7 permanece como canal de entrada, nunca como decisor.

---

## §20 Proibições absolutas em T7

| Código | Proibição |
|--------|-----------|
| PROB-T7-01 | Criar `reply_text` mecânico ou script de atendimento rígido |
| PROB-T7-02 | Alterar regras MCMV de T2/T3/T5 |
| PROB-T7-03 | Abrir volume real de clientes sem decisão G7 explícita |
| PROB-T7-04 | Criar LLM alternativo, segundo cérebro ou surface paralela |
| PROB-T7-05 | Fechar G7 sem Bloco E completo com `Fechamento permitido?: sim` |
| PROB-T7-06 | Executar shadow/canary/cutover real sem pré-flight concluído |
| PROB-T7-07 | Desligar o legado antes de G7 APROVADO |
| PROB-T7-08 | Declarar go-live sem rollback provado |
| PROB-T7-09 | Alterar `fact_*`, `current_phase` ou policy engine fora de PR contratual de T7 |
| PROB-T7-10 | Encerrar T7 implicitamente — só via PR-T7.R com CONTRACT_CLOSEOUT_PROTOCOL |

---

## §21 Rollback contratual

Se qualquer PR de T7 falhar gate interno ou se G7 for REPROVADO:

1. PR não mergeada — nenhum impacto em main.
2. Branch descartada ou aguardando correção.
3. T7 permanece ativa com status "em execução" ou "bloqueada".
4. Próxima ação: corrigir a causa do bloqueio e reabrir PR correspondente.
5. Legado permanece ativo até G7 formal.

Se PR-T7.R reprovar G7:
- Contratos T0–T6 permanecem arquivados (não reabertos).
- T7 é retomada a partir da PR que gerou o bloqueio.
- Status volta para "em execução — T7.x em correção".

---

## §22 Estado desta PR (PR-T7.0)

| Campo | Valor |
|-------|-------|
| Status da PR-T7.0 | executada |
| O que foi feito | Contrato T7 completo substituindo skeleton |
| O que fecha | B-T7-01 (G6 aprovado — já satisfeito), B-T7-02 (skeleton substituído) |
| O que NÃO fecha | B-T7-03 a B-T7-10 (abertos — dependem de PRs T7.1–T7.R) |
| Próxima PR | PR-T7.1 — Pré-flight de go-live e travas operacionais |
| Go-live autorizado? | NÃO — apenas contrato aberto; go-live requer G7 aprovado via PR-T7.R |

---

## §23 ESTADO HERDADO

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T6.R (#135) — Readiness/Closeout G6 — G6 APROVADO — T6 encerrada — T7 skeleton
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md (skeleton — aguardando PR-T7.0)
Objetivo imutável do contrato: Go-live controlado da ENOVA 2 — shadow, simulação, canary, cutover e rollback
Recorte a executar nesta PR: Abertura formal do contrato T7 — substituir skeleton por corpo executivo completo
Item do A01: T7 — fase 8, prioridade 8, semanas 15–16
Estado atual da frente: contrato skeleton aberto — aguardando abertura formal
O que a última PR fechou: G6, T6 encerrada, skeleton T7 criado, T7 desbloqueada
O que a última PR NÃO fechou: Contrato T7 formal, PRs T7.1–T7.R, go-live
Por que esta tarefa existe: Contrato T7 ainda é skeleton; PR-T7.0 é obrigação contratual antes de qualquer execução de T7
Esta tarefa está dentro ou fora do contrato ativo: dentro — PR-T7.0 é o passo explicitamente autorizado
Objetivo desta tarefa: Criar o corpo executivo completo do contrato T7 seguindo CONTRACT_SCHEMA.md
Escopo: Apenas schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md + arquivos vivos (_INDEX, STATUS, LATEST)
Fora de escopo: src/, runtime, shadow, canary, cutover, WhatsApp real, Supabase, deploy
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md (skeleton)
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Rebase canonico lido:        N/A — rebase 2026-04-22 já incorporado
  Plano T0-T7 lido:            schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    N/A — markdown soberano suficiente para governança
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

---

## §24 ESTADO ENTREGUE

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Contrato T7 completo criado — substitui skeleton por 24 seções formais
O que foi fechado nesta PR: B-T7-02 (skeleton substituído); CA-T7-01..12 declarados formalmente no contrato
O que continua pendente: PRs T7.1–T7.R (execução); go-live (aguarda G7); B-T7-03 a B-T7-10
O que ainda não foi fechado do contrato ativo: Execução T7.1–T7.R; G7; go-live
Recorte executado do contrato: §16 PR-T7.0 — abertura formal
Pendência contratual remanescente: PRs T7.1–T7.R, gate G7
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não — contrato T7 aberto e em execução a partir desta PR
O próximo passo autorizado foi alterado? sim — de PR-T7.0 para PR-T7.1
Esta tarefa foi fora de contrato? não
Arquivos vivos atualizados: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md, schema/contracts/_INDEX.md, schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md, schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```

---

## §25 BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md (este arquivo)
Estado da evidência:                   completa — contrato formal substituindo skeleton, 24 seções, conforme CONTRACT_SCHEMA.md
Há lacuna remanescente?:               não — contrato formal completo; PRs T7.1–T7.R são execução futura, não lacuna deste contrato
Há item parcial/inconclusivo bloqueante?: não — PR-T7.0 entrega contrato; execução começa em PR-T7.1
Fechamento permitido nesta PR?:        sim — PR-T7.0 fecha abertura formal do contrato T7
Estado permitido após esta PR:         PR-T7.0 encerrada; contrato T7 aberto e em execução
Próxima PR autorizada:                 PR-T7.1 — Pré-flight de go-live e travas operacionais
```
