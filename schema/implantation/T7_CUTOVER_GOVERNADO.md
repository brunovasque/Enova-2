# T7_CUTOVER_GOVERNADO — Cutover Parcial ou Total Governado

## §1 Meta

| Campo | Valor |
|-------|-------|
| PR | PR-T7.5 |
| Fase | T7 — Shadow, simulação, canary, cutover e rollback |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |
| Referência G6 | `schema/implantation/READINESS_G6.md` |
| Pré-flight | `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` |
| Simulação | `schema/implantation/T7_SHADOW_SIMULACAO.md` |
| Matriz | `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` |
| Canary | `schema/implantation/T7_CANARY_INTERNO.md` |
| Cutover (este artefato) | `schema/implantation/T7_CUTOVER_GOVERNADO.md` |
| Data | 2026-04-29 |
| Gate anterior | G6 — APROVADO em 2026-04-28 |
| Gate aberto | G7 — go-live controlado (bloqueado até PR-T7.R) |
| Status | entregue |
| Fecha | cutover parcial ou total governado |
| Próxima PR autorizada | PR-T7.6 — Rollback operacional comprovado |
| Adendo soberania IA | `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) |
| Adendo MCMV | `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) |
| Adendo fechamento | `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) |

---

## §2 Objetivo

Este documento formaliza o **cutover parcial ou total governado da Enova 2**: a substituição controlada do fluxo legado pelo fluxo LLM-first, com gate explícito, rollback mapeado e proteção contra entrada de cliente real sem autorização formal.

Objetivos específicos:

1. **Definir as condições para cutover parcial** — subconjunto de fluxos ou segmentos substituídos, com fallback ao legado.
2. **Definir as condições para cutover total** — substituição completa antes de clientes reais, autorizada por Vasques + evidência sólida.
3. **Formalizar os modos de cutover** e quando cada um é aplicável.
4. **Definir o gate de cutover** — CUTOVER_GATE_STATUS com transições formais.
5. **Declarar proteções contra entrada real sem decisão** — cliente real nunca entra só porque cutover foi documentado.
6. **Definir critérios de rollback de cutover** com preservação obrigatória de evidência.
7. **Formalizar as métricas MET-01..MET-10** com thresholds específicos para cutover.
8. **Entregar a matriz de decisão** — tabela formal de permissão por condição.
9. **Entregar o payload canônico de saída para PR-T7.6** (rollback operacional comprovado).

Esta PR **não entrega runtime**. Não toca `src/`. Não usa WhatsApp real. Não executa cutover real. Não abre Supabase novo. Todo artefato é declarativo/documental.

---

## §3 Premissa Operacional

### 3.1 A Enova 2 ainda NÃO atende clientes reais

A Enova 2 ainda não está em operação comercial. Não há clientes reais em atendimento — nem no legado nem na Enova 2.

Consequências diretas para esta PR:

- Cutover documental não é go-live final.
- Esta PR não executa cutover real em ambiente de produção.
- Esta PR não conecta WhatsApp real, Meta real ou Supabase produtivo novo.
- G7 continua bloqueado até PR-T7.R — cutover não substitui G7.
- Cliente real só entra com autorização explícita posterior ao G7.

### 3.2 Cutover documental vs cutover real

| Dimensão | Cutover Documental (esta PR) | Cutover Real |
|----------|------------------------------|--------------|
| Escopo | Define protocolo, critérios, gates | Executa substituição do fluxo |
| Ambiente | Nenhum (documental) | Produção controlada |
| Autorização | PR mergeada + PR-T7.6 + G7 | Vasques + decisão executiva + G7 |
| Gate | Não fecha G7 | Parte do caminho para fechar G7 |
| WhatsApp real | Não ligado nesta PR | Autorizado após G7 |
| Rollback | Protocolo definido aqui | Executado em PR-T7.6 |
| Efeito | Zero — puramente declarativo | Substitui roteamento de tráfego |

### 3.3 Relação com o canary interno (T7.4)

Cutover pressupõe canary aprovado ou formalmente dispensado (Caminho B com justificativa). Canary interno (PR-T7.4) deve ter:

- `approved_for_cutover: true` no payload §13.
- `recommendation: proceed` ou `proceed_with_restrictions`.
- Vasques authorization recebida.

Sem esses campos preenchidos com evidência, CUTOVER_GATE_STATUS permanece `blocked`.

### 3.4 Limites desta PR

- Zero `reply_text` gerado.
- Zero `fact_*` novo declarado.
- Zero modificação em `src/`.
- Zero artefatos T6 recriados ou modificados.
- Zero cutover real, canary real, shadow real.
- Zero WhatsApp real ou Meta real.
- Referência G6 é `READINESS_G6.md` — não usar nomes alternativos.
- Os nomes dos artefatos T7 são os canônicos declarados no §1 — não usar nomes alternativos.

---

## §4 Pré-condições para Cutover

### 4.1 Checklist obrigatório — todas as condições devem ser PASS

| ID | Pré-condição | Evidência exigida | Status esperado |
|----|-------------|-------------------|-----------------|
| CC-01 | G6 APROVADO | `schema/implantation/READINESS_G6.md` — veredito G6 = APROVADO | PASS |
| CC-02 | PR-T7.1 entregue e merged | `T7_PREFLIGHT_GO_LIVE.md` presente em main | PASS |
| CC-03 | PR-T7.2 entregue e merged | `T7_SHADOW_SIMULACAO.md` presente em main | PASS |
| CC-04 | PR-T7.3 entregue e merged | `T7_MATRIZ_DIVERGENCIAS.md` presente em main | PASS |
| CC-05 | PR-T7.4 entregue e merged | `T7_CANARY_INTERNO.md` presente em main | PASS |
| CC-06 | Nenhuma DIV-RM aberta | Payload T7.4 §13: `DIV-RM: 0` em `unresolved_divergences` | PASS |
| CC-07 | Nenhuma DIV-BA aberta | Payload T7.4 §13: `DIV-BA: 0` em `unresolved_divergences` | PASS |
| CC-08 | Nenhum hardening bloqueante pendente | Hardenings com `bloqueia_t74: true` todos com status `concluido` | PASS |
| CC-09 | Canary interno autorizado ou formalmente dispensado | Payload T7.4 §13: `approved_for_cutover: true` + `vasques_authorization_received: true` | PASS |
| CC-10 | Telemetria mínima definida e ativa | MET-01..MET-10 com thresholds definidos em T7.1 §5 e confirmados em T7.3 §7 | PASS |
| CC-11 | Rollback mapeado e testável | `T7_PREFLIGHT_GO_LIVE.md` §5 + `T7_CANARY_INTERNO.md` §9 completos; ROLLBACK_FLAG testado | PASS |
| CC-12 | Aprovação humana formal declarada | Vasques authorization registrada no payload T7.4 §13 | PASS |
| CC-13 | G7 ainda bloqueado até PR-T7.R | `schema/contracts/_INDEX.md` — G7 = bloqueado até PR-T7.R | PASS (G7 não fecha aqui) |
| CC-14 | Feature flags de cutover configurados | CUTOVER_MODE = false (será ativado somente na execução real) | PASS |

### 4.2 Bloqueio imediato

Se qualquer item CC-01..CC-14 estiver com status diferente de PASS:

- CUTOVER_GATE_STATUS = `blocked`.
- Registrar o bloqueio no log de decisão.
- Não há exceção — nem Caminho B dispensa estas pré-condições.
- Cutover não avança até resolução com evidência.

---

## §5 Modos de Cutover

### 5.1 Modos disponíveis

| Código | Modo | Descrição |
|--------|------|-----------|
| CO-PARCIAL | Cutover parcial | Substituição de subconjunto de fluxos ou segmentos — legado ainda ativo em paralelo |
| CO-TOTAL-INTERNO | Cutover total interno | Substituição completa em ambiente interno/pré-produção — sem cliente real |
| CO-TOTAL-CLIENTE | Cutover total com cliente real | Substituição completa com tráfego real — requer PR-T7.6 + G7 + Vasques |
| CO-NOGO | Cutover bloqueado / no-go | Nenhuma substituição permitida — critérios não atingidos ou Vasques vetou |

### 5.2 Detalhamento por modo

#### CO-PARCIAL — Cutover Parcial

| Campo | Valor |
|-------|-------|
| Quando usar | MET-01 ≥ 90%; canary interno PASS (A2+); zero DIV-RM/BA; rollback mapeado |
| Pré-condições | CC-01..CC-10 PASS; CC-11 PASS; CC-13 PASS |
| Segmentos substituídos | Topo/abertura (fatia F1); qualificação inicial (F2); renda básica (F3) — fatias mais estáveis |
| Segmentos em legado | Elegibilidade avançada; handoff; visita; correspondente — até CO-TOTAL |
| Risco | Médio — legado disponível como fallback imediato |
| Rollback | CUTOVER_MODE = false; ENOVA2_ENABLED = false nos segmentos afetados; 0% de roteamento |
| Quem aprova | Revisor técnico + Vasques (se segmento tiver risco de contato real) |
| Evidência exigida | Log de janela canary A2+; métricas MET-01..10 dentro do threshold; zero incidentes bloqueantes |

#### CO-TOTAL-INTERNO — Cutover Total Interno

| Campo | Valor |
|-------|-------|
| Quando usar | MET-01 ≥ 94% (Caminho A) ou ≥ 95% (Caminho B); canary A4 ou B1 PASS; zero DIV-RM/BA/S4; rollback pronto |
| Pré-condições | CC-01..CC-14 todos PASS |
| Ambiente | Interno controlado — ainda sem cliente real |
| Risco | Médio-alto — sem legado em paralelo, mas sem cliente real |
| Rollback | ROLLBACK_FLAG = true em < 5 min; ENOVA2_ENABLED = false; roteamento zerado |
| Quem aprova | Vasques — obrigatório |
| Evidência exigida | Log canary A4 ou B1 completo; payload T7.4 §13 preenchido; zero incidentes abertos |

#### CO-TOTAL-CLIENTE — Cutover Total com Cliente Real

| Campo | Valor |
|-------|-------|
| Quando usar | CO-TOTAL-INTERNO PASS + PR-T7.6 (rollback comprovado) + PR-T7.7 (go/no-go) + G7 via PR-T7.R |
| Pré-condições | CC-01..CC-14 PASS + PR-T7.6 merged + PR-T7.7 merged + G7 aprovado |
| Ambiente | Produção real — clientes reais ativos |
| Risco | Alto — clientes reais em atendimento |
| Rollback | Plano T7.6 executável em < 5 min; legado de emergência disponível |
| Quem aprova | Vasques + decisão executiva + G7 |
| Evidência exigida | Tudo acima + PR-T7.R closeout G7 |

#### CO-NOGO — Cutover Bloqueado

| Campo | Valor |
|-------|-------|
| Quando usar | Qualquer pré-condição CC-01..CC-14 FAIL; Vasques veto; DIV-RM/BA aberta; rollback não testado |
| Ação | Manter legado; documentar motivo; agendar revisão |
| Rollback | N/A — nenhum cutover ocorreu |
| Quem decide | Qualquer revisor técnico ou Vasques |

---

## §6 Caminho A e Caminho B

### 6.1 Caminho A — Cutover progressivo (padrão)

```
Canary A4 PASS → CO-PARCIAL → observação 1 semana →
CO-TOTAL-INTERNO → observação 1 semana →
PR-T7.6 (rollback comprovado) → PR-T7.7 (go/no-go) →
CO-TOTAL-CLIENTE (com G7)
```

- Cutover parcial precede cutover total.
- Cada etapa requer janela de observação e métricas dentro do threshold.
- Rollback comprovado (PR-T7.6) obrigatório antes de CO-TOTAL-CLIENTE.
- Aprovação humana progressiva: técnica → Vasques → executiva.

### 6.2 Caminho B — Cutover comprimido ou sem clientes reais

```
Canary B1 PASS + justificativa formal → CO-TOTAL-INTERNO →
PR-T7.6 (rollback comprovado) → PR-T7.7 (go/no-go) → PR-T7.R
```

Caminho B autoriza:
- Saltar CO-PARCIAL e ir direto para CO-TOTAL-INTERNO — se canary B1 com MET-01 ≥ 95% e zero críticos.
- Cutover total antes de clientes reais sem passo gradual — desde que provas passem.

**Caminho B nunca dispensa:**
- Pré-condições CC-01..CC-14 (todas PASS).
- Rollback operacional comprovado (PR-T7.6).
- Telemetria MET-01..MET-10 ativa.
- Decisão humana formal (Vasques + executiva).
- Smoke test de CO-TOTAL-INTERNO antes de CO-TOTAL-CLIENTE.
- Gate G7 via PR-T7.R.
- Justificativa formal registrada no payload §14.

### 6.3 Comparativo Caminho A vs B para cutover

| Dimensão | Caminho A | Caminho B |
|----------|-----------|-----------|
| Etapas de cutover | Parcial → Total interno → Total cliente | Total interno (sem parcial) → Total cliente |
| Threshold MET-01 para cutover total | ≥ 94% | ≥ 95% |
| Duração estimada | 2–3 semanas | 5–10 dias |
| Justificativa formal | Não obrigatória (parcial) | Obrigatória em todo passo |
| PR-T7.6 obrigatória | Sim | Sim |
| G7 obrigatório | Sim | Sim |

---

## §7 Critérios para Cutover Parcial

### 7.1 Condições mínimas

| # | Critério | Verificação |
|---|---------|-------------|
| 1 | MET-01 ≥ 90% nas últimas 2 janelas do canary | Log de canary T7.4 |
| 2 | Canary interno — etapa A2 (20%) ou superior sem incidente bloqueante | Payload T7.4 `canary_mode_used` |
| 3 | MET-03 = 0 (zero divergência MCMV) em todas as janelas | MET-03 do log de canary |
| 4 | MET-08 = 0 (zero falha crítica) em todas as janelas | MET-08 do log de canary |
| 5 | MET-09 = 0 (zero promessa indevida) em todas as janelas | MET-09 do log de canary |
| 6 | Rollback mapeado e testável em < 10 min | T7.4 §9 validado |
| 7 | Logs e lead_state preservados | TurnoRastro completo retido |
| 8 | CUTOVER_MODE = false (será ativado na execução real apenas) | Feature flag verificado |
| 9 | Autorização técnica formal (revisor T7.5) | Nota de aprovação registrada |
| 10 | Vasques informado — autorização obrigatória se segmento tiver risco de contato real | Registro formal de decisão |

### 7.2 Segmentos autorizados para cutover parcial

| Segmento | Fatia T5 | Risco | Autorização |
|---------|----------|-------|-------------|
| Topo/abertura + identificação | F1 | Baixo | Técnica |
| Qualificação inicial + objetivo | F2 | Baixo-médio | Técnica + Vasques informado |
| Renda básica CLT/servidor | F3 | Médio | Vasques |
| Elegibilidade MCMV básica | F4 | Alto | Vasques + executiva |
| Handoff / visita / correspondente | F5–F7 | Alto | Vasques + executiva |

---

## §8 Critérios para Cutover Total

### 8.1 Condições obrigatórias — mais rígidas que CO-PARCIAL

| # | Critério | Threshold |
|---|---------|-----------|
| 1 | MET-01 nas últimas 3 janelas | ≥ 94% (Caminho A) / ≥ 95% (Caminho B) |
| 2 | MET-03 (divergência MCMV) | **0 absoluto** |
| 3 | MET-08 (falha crítica) | **0 absoluto** |
| 4 | MET-09 (promessa indevida) | **0 absoluto** |
| 5 | Zero DIV-RM abertas | Payload T7.4 confirmado |
| 6 | Zero DIV-BA abertas | Payload T7.4 confirmado |
| 7 | Zero hardening bloqueante pendente | HD-T73-001..009 todos `concluido` |
| 8 | Rollback operacional pronto e testado | PR-T7.6 entregue (para CO-TOTAL-CLIENTE) |
| 9 | Telemetria ativa e monitorada em tempo real | Dashboard MET-01..10 operacional |
| 10 | Decisão humana expressa Vasques | Registro formal com data |
| 11 | Cliente real protegido — sem entrada sem autorização adicional | CO-TOTAL-CLIENTE requer G7 |

### 8.2 Adicionais para CO-TOTAL-CLIENTE (com clientes reais)

Além dos critérios acima:

- PR-T7.6 (rollback operacional comprovado) merged em main.
- PR-T7.7 (checklist go/no-go executivo) merged em main.
- G7 aprovado via PR-T7.R.
- Vasques + decisão executiva formal documentada.
- Rollback executável em < 5 min com evidência de simulação.

---

## §9 Gate de Cutover

### 9.1 CUTOVER_GATE_STATUS

| Status | Significado | Quem pode transicionar |
|--------|-------------|----------------------|
| `blocked` | Pré-condições não satisfeitas ou veto ativo | Qualquer evento de bloqueio |
| `ready` | Todas as pré-condições CC-01..CC-14 PASS; aguardando decisão | Revisor técnico T7.5 |
| `approved` | Aprovação formal Vasques recebida; cutover pode ser iniciado | Vasques |
| `no_go` | Veto formal — cutover não ocorrerá nesta janela | Vasques ou revisor técnico |
| `in_progress` | Cutover em execução (CO-PARCIAL ou CO-TOTAL-INTERNO) | Sistema + operador |
| `completed` | Cutover concluído; sistema em estado pós-cutover | Sistema + operador |

### 9.2 Transições permitidas

```
blocked → ready       (quando CC-01..CC-14 todos PASS)
ready   → approved    (quando Vasques autoriza formalmente)
ready   → no_go       (quando Vasques veta ou critério falha)
approved → in_progress (quando execução inicia)
in_progress → completed (quando cutover concluído sem rollback)
in_progress → blocked  (quando trigger de pausa ou rollback ativado)
no_go   → blocked      (estado de retorno para nova tentativa)
completed → blocked    (se pós-cutover detectar problema grave)
```

### 9.3 Condições que voltam para `blocked`

- Qualquer trigger de rollback ativado (ROL-01..ROL-08 de T7.4).
- Veto Vasques após `approved`.
- DIV-RM ou DIV-BA detectada durante ou após cutover.
- MET-08 ou MET-09 > 0 detectado após cutover.
- Falha de infra que impeça monitoramento de MET-01..10.

### 9.4 Shape do registro de gate

```json
{
  "gate_id": "CUTOVER_GATE_T75",
  "status": "blocked|ready|approved|no_go|in_progress|completed",
  "status_updated_at": "YYYY-MM-DDTHH:MM:SSZ",
  "updated_by": "revisor_tecnico|vasques",
  "preconditions_status": {
    "CC-01": "PASS|FAIL|PENDING",
    "CC-02": "PASS|FAIL|PENDING",
    "CC-03": "PASS|FAIL|PENDING",
    "CC-04": "PASS|FAIL|PENDING",
    "CC-05": "PASS|FAIL|PENDING",
    "CC-06": "PASS|FAIL|PENDING",
    "CC-07": "PASS|FAIL|PENDING",
    "CC-08": "PASS|FAIL|PENDING",
    "CC-09": "PASS|FAIL|PENDING",
    "CC-10": "PASS|FAIL|PENDING",
    "CC-11": "PASS|FAIL|PENDING",
    "CC-12": "PASS|FAIL|PENDING",
    "CC-13": "PASS|FAIL|PENDING",
    "CC-14": "PASS|FAIL|PENDING"
  },
  "blocking_reason": "<preenchido se status = blocked ou no_go>",
  "vasques_approval_note": "<preenchido se status = approved>",
  "cutover_mode_selected": "CO-PARCIAL|CO-TOTAL-INTERNO|CO-TOTAL-CLIENTE|CO-NOGO"
}
```

---

## §10 Proteção contra Entrada Real sem Decisão

### 10.1 Travas obrigatórias

| ID | Trava | Condição de violação |
|----|-------|---------------------|
| TR-01 | Cliente real não entra só porque cutover foi documentado | Qualquer tráfego real sem autorização formal registrada |
| TR-02 | WhatsApp real não é ligado nesta PR | Qualquer tentativa de ativar canal comercial sem G7 |
| TR-03 | CUTOVER_MODE permanece `false` nesta PR | Qualquer ativação de CUTOVER_MODE = true sem aprovação |
| TR-04 | Cutover não substitui G7 | Qualquer tentativa de declarar G7 aprovado sem PR-T7.R |
| TR-05 | PR-T7.R continua sendo o fechamento final obrigatório | Qualquer encerramento de T7 sem PR-T7.R |
| TR-06 | CO-TOTAL-CLIENTE exige PR-T7.6 + PR-T7.7 + G7 — nenhum atalho | Qualquer entrada real sem essas PRs merged |
| TR-07 | Rollback deve estar testável antes de CO-TOTAL-CLIENTE | Rollback não comprovado = co-total-cliente bloqueado |
| TR-08 | Canary interno aprovado ou dispensado com justificativa formal | CO sem evidência de canary = bloqueado |

### 10.2 Declaração de estado nesta PR

Esta PR é **puramente declarativa**. Nenhuma das travas acima é violada porque:

- Zero tráfego real.
- Zero CUTOVER_MODE = true.
- Zero canal WhatsApp ativado.
- Zero leads reais processados.
- G7 permanece bloqueado.
- PR-T7.R ainda não aberta.

---

## §11 Critérios de Rollback de Cutover

### 11.1 Triggers de rollback de cutover

| ID | Trigger | Ação imediata |
|----|---------|---------------|
| RC-01 | DIV-RM detectada em turno pós-cutover | Rollback imediato: CUTOVER_MODE = false; ROLLBACK_FLAG = true |
| RC-02 | DIV-BA detectada (adversarial, execução real indevida) | Rollback imediato |
| RC-03 | MET-09 > 0 (promessa indevida) pós-cutover | Rollback imediato |
| RC-04 | MET-08 > 0 (falha crítica) pós-cutover | Rollback imediato |
| RC-05 | MET-01 < 80% em 3 janelas consecutivas pós-cutover | Rollback após confirmação |
| RC-06 | Perda ou corrupção de lead_state em qualquer caso | Rollback imediato + auditoria |
| RC-07 | Veto Vasques explícito | Rollback imediato |
| RC-08 | Rollback não comprovado detectado pré-CO-TOTAL-CLIENTE | CO-TOTAL-CLIENTE bloqueado |

### 11.2 Procedimento de rollback de cutover

| Passo | Ação | Responsável |
|-------|------|-------------|
| RK-1 | Setar CUTOVER_MODE = false | Operador / sistema |
| RK-2 | Setar ROLLBACK_FLAG = true | Operador / sistema |
| RK-3 | Setar ENOVA2_ENABLED = false (se rollback completo) | Operador |
| RK-4 | Restaurar roteamento para legado | Operador |
| RK-5 | Preservar integralmente todos os logs e TurnoRastro | Sistema automático |
| RK-6 | Preservar lead_state completo — nunca apagar | Sistema automático |
| RK-7 | Preservar dossiê completo — nunca apagar documentos | Sistema automático |
| RK-8 | Registrar incidente com: trigger_id, turno_id, caso_id, timestamp, evidência | Operador |
| RK-9 | Notificar Vasques com log de rollback | Operador |
| RK-10 | Bloquear avanço para PR-T7.6 até revisão + evidência de resolução | Protocolo |
| RK-11 | CUTOVER_GATE_STATUS → `blocked` | Protocolo |

### 11.3 O rollback NÃO faz

- Não apaga leads do Supabase.
- Não apaga logs de turno.
- Não altera lead_state retroativamente.
- Não fecha G7 (G7 permanece aberto).
- Não descarta evidência de qualquer tipo.
- Não avança PR-T7.6 automaticamente (PR-T7.6 exige revisão posterior).

---

## §12 Métricas Mínimas

### 12.1 MET-01..MET-10 — thresholds de cutover

| ID | Métrica | Threshold — Cutover Parcial | Threshold — Cutover Total Interno | Threshold — Cutover Total Cliente |
|----|---------|---------------------------|----------------------------------|----------------------------------|
| MET-01 | Taxa PASS geral | ≥ 90% nas últimas 2 janelas | ≥ 94% (A) / ≥ 95% (B) nas últimas 3 janelas | ≥ 95% nas últimas 5 janelas |
| MET-02 | Divergência de policy | ≤ 5% | ≤ 3% | ≤ 2% |
| MET-03 | Divergência MCMV | **0 absoluto** | **0 absoluto** | **0 absoluto** |
| MET-04 | Erro de estado/memória | ≤ 3% | ≤ 2% | ≤ 1% |
| MET-05 | Erro documental | ≤ 5% | ≤ 3% | ≤ 2% |
| MET-06 | Erro de canal | ≤ 3% | ≤ 2% | ≤ 1% |
| MET-07 | Latência p95 | < 3.000 ms | < 2.500 ms | < 2.000 ms |
| MET-08 | Falha crítica | **0 absoluto** | **0 absoluto** | **0 absoluto** |
| MET-09 | Promessa indevida | **0 absoluto** | **0 absoluto** | **0 absoluto** |
| MET-10 | Fala mecânica | ≤ 5% | ≤ 2% | ≤ 1% |

### 12.2 Threshold de pausa durante cutover

| Condição | Ação |
|----------|------|
| MET-01 < 85% por janela | Pausar cutover; investigar antes de continuar |
| MET-03 > 0 | Rollback imediato |
| MET-08 > 0 | Rollback imediato |
| MET-09 > 0 | Rollback imediato |
| MET-07 p95 > 5.000 ms | Pausar; investigar latência |
| MET-04 > 5% | Pausar; revisar pipeline de estado |

### 12.3 Threshold de no-go

| Condição | Ação |
|----------|------|
| MET-01 < 80% em 3 janelas consecutivas | CUTOVER_GATE_STATUS = `no_go` |
| Qualquer rollback RC-01..RC-04 ativado | CUTOVER_GATE_STATUS = `blocked` |
| Veto Vasques | CUTOVER_GATE_STATUS = `no_go` |

---

## §13 Matriz de Decisão

| Condição | CO-PARCIAL permitido? | CO-TOTAL-INTERNO permitido? | Exige Vasques? | Exige rollback comprovado (T7.6)? | Próxima ação |
|----------|----------------------|----------------------------|----------------|-----------------------------------|-------------|
| CC-01..CC-14 todos PASS + MET-01 ≥ 90% + canary A2+ | Sim | Não | Sim (informado) | Não (mas mapeado) | Iniciar CO-PARCIAL |
| CC-01..CC-14 todos PASS + MET-01 ≥ 94% + canary A4 PASS | Sim | Sim | Sim (aprovação) | Não (para CO-TOTAL-INTERNO) | Iniciar CO-TOTAL-INTERNO |
| CO-TOTAL-INTERNO PASS + PR-T7.6 merged + MET-01 ≥ 95% | N/A (já passou) | N/A (já passou) | Sim + executiva | Sim | Iniciar CO-TOTAL-CLIENTE (via G7) |
| Caminho B: canary B1 PASS + MET-01 ≥ 95% + justificativa | Não necessário | Sim | Sim (obrigatório) | Sim (para T-CLIENTE) | Iniciar CO-TOTAL-INTERNO direto |
| Qualquer CC FAIL ou Vasques veto | Não | Não | Sim | N/A | CUTOVER_GATE = blocked/no_go |
| MET-03 ou MET-08 ou MET-09 > 0 | Não | Não | N/A | N/A | Rollback imediato |
| DIV-RM ou DIV-BA aberta | Não | Não | N/A | N/A | Bloquear + resolver |
| Rollback não testável | Sim (com monitoramento intensivo) | Não | Sim | Bloqueia CO-TOTAL | Testar rollback primeiro |

---

## §14 Payload de Saída para PR-T7.6

### 14.1 Shape do payload

```json
{
  "payload_version": "T7.5-v1",
  "generated_at": "YYYY-MM-DDTHH:MM:SSZ",
  "cutover_source": "T7_CUTOVER_GOVERNADO.md",
  "path_used": "A|B",
  "approved_for_rollback_proof": true,
  "cutover_mode_selected": "CO-PARCIAL|CO-TOTAL-INTERNO|CO-TOTAL-CLIENTE|CO-NOGO",
  "cutover_gate_status": "blocked|ready|approved|no_go|in_progress|completed",
  "metrics_summary": {
    "MET-01_pass_rate": null,
    "MET-02_policy_divergence": null,
    "MET-03_mcmv_divergence": 0,
    "MET-04_state_error": null,
    "MET-05_doc_error": null,
    "MET-06_channel_error": null,
    "MET-07_p95_latency_ms": null,
    "MET-08_critical_failure": 0,
    "MET-09_promise_indevida": 0,
    "MET-10_mechanical_speech": null
  },
  "unresolved_risks": [],
  "accepted_risks": [
    {
      "risk_id": "RSK-T75-NNN",
      "description": "<descrição>",
      "severity": "S0|S1|S2",
      "mitigation": "<mitigação aplicada>",
      "vasques_accepted": true
    }
  ],
  "rollback_requirements": {
    "rollback_tested": false,
    "rollback_time_minutes": null,
    "rollback_evidence_path": null,
    "pr_t76_required": true
  },
  "blocking_items": [],
  "recommendation": "proceed|proceed_with_restrictions|no_go",
  "recommendation_justification": "<texto>",
  "vasques_authorization_required": true,
  "vasques_authorization_received": false,
  "path_b_justification": "<obrigatório se path_used = B>",
  "incidents_during_cutover": [],
  "rollbacks_triggered": [],
  "notes": "<observações finais>"
}
```

### 14.2 Campos obrigatórios para habilitar PR-T7.6

| Campo | Valor mínimo para PR-T7.6 |
|-------|--------------------------|
| `approved_for_rollback_proof` | `true` |
| `recommendation` | `proceed` ou `proceed_with_restrictions` |
| `MET-03_mcmv_divergence` | `0` |
| `MET-08_critical_failure` | `0` |
| `MET-09_promise_indevida` | `0` |
| `cutover_gate_status` | `completed` ou `approved` (com cutover executado) |
| `vasques_authorization_received` | `true` |
| `blocking_items` | array vazio `[]` |
| `rollback_requirements.pr_t76_required` | `true` (confirma necessidade de PR-T7.6) |

### 14.3 Nota sobre esta PR

Como esta PR é a **definição do protocolo** (não a execução do cutover), o payload está preparado estruturalmente. Os valores reais serão preenchidos durante a execução do cutover e entregues como evidência na PR-T7.6.

---

## §15 Critérios de Aceite — CA-T7.5

| ID | Critério | Verificação |
|----|---------|-------------|
| CA-T7.5-01 | `T7_CUTOVER_GOVERNADO.md` criado em `schema/implantation/` | Arquivo presente em main após merge |
| CA-T7.5-02 | Pré-condições CC-01..CC-14 definidas com evidência exigida | §4.1 completo |
| CA-T7.5-03 | Modos de cutover CO-PARCIAL, CO-TOTAL-INTERNO, CO-TOTAL-CLIENTE, CO-NOGO definidos | §5 completo |
| CA-T7.5-04 | Caminho A e Caminho B definidos com restrições do Caminho B | §6 completo |
| CA-T7.5-05 | Critérios para cutover parcial com segmentos autorizados | §7 completo |
| CA-T7.5-06 | Critérios para cutover total com condições mais rígidas | §8 completo |
| CA-T7.5-07 | Gate de cutover com CUTOVER_GATE_STATUS, transições e shape | §9 completo |
| CA-T7.5-08 | Proteção contra entrada real com travas TR-01..TR-08 declaradas | §10 completo |
| CA-T7.5-09 | Rollback de cutover com triggers RC-01..RC-08 e procedimento RK-1..RK-11 | §11 completo |
| CA-T7.5-10 | MET-01..10 com thresholds por modo de cutover (parcial / total interno / total cliente) | §12 completo |
| CA-T7.5-11 | Matriz de decisão com condições, permissões e próxima ação | §13 completo |
| CA-T7.5-12 | Payload canônico de saída para T7.6 com campos obrigatórios | §14 completo |
| CA-T7.5-13 | Zero execução real (runtime, cutover, canary, WhatsApp real) | Diff: apenas 4 arquivos schema/ |
| CA-T7.5-14 | Zero modificação em `src/` | Diff validado |
| CA-T7.5-15 | Referência G6 = `READINESS_G6.md` — sem nomes alternativos | §1 verificado |
| CA-T7.5-16 | Pré-flight = `T7_PREFLIGHT_GO_LIVE.md` — sem nomes alternativos | §1 verificado |
| CA-T7.5-17 | Simulação = `T7_SHADOW_SIMULACAO.md` — sem nomes alternativos | §1 verificado |
| CA-T7.5-18 | Matriz = `T7_MATRIZ_DIVERGENCIAS.md` — sem nomes alternativos | §1 verificado |
| CA-T7.5-19 | Canary = `T7_CANARY_INTERNO.md` — sem nomes alternativos | §1 verificado |
| CA-T7.5-20 | Próxima PR autorizada = PR-T7.6 — Rollback operacional comprovado | Bloco E §17 |
| CA-T7.5-21 | Bloco E com `Fechamento permitido: sim` | §17 presente e preenchido |

---

## §16 Bloqueios — B-T7.5

| ID | Bloqueio | Consequência |
|----|---------|--------------|
| B-T7.5-01 | Ausência de qualquer pré-condição CC-01..CC-14 definida | PR inválida — bloqueia merge |
| B-T7.5-02 | Ausência de modos de cutover | PR inválida — bloqueia merge |
| B-T7.5-03 | Ausência de gate de cutover (CUTOVER_GATE_STATUS) | PR inválida — bloqueia merge |
| B-T7.5-04 | Ausência de rollback de cutover | PR inválida — bloqueia merge |
| B-T7.5-05 | Ausência de métricas MET-01..10 ou thresholds | PR inválida — bloqueia merge |
| B-T7.5-06 | Ausência de autorização humana (matriz de decisão) | PR inválida — bloqueia merge |
| B-T7.5-07 | Tentativa de execução de cutover real nesta PR | Violação de contrato — PR inválida |
| B-T7.5-08 | Tentativa de uso de WhatsApp real ou canal aberto nesta PR | Violação de contrato — PR inválida |
| B-T7.5-09 | Tentativa de execução de runtime ou modificação de `src/` | Violação — bloqueia merge imediato |
| B-T7.5-10 | Modificação de artefatos T6 | PR inválida |
| B-T7.5-11 | Uso de nomes alternativos para artefatos T7 canônicos | PR inválida — grep simples detecta |
| B-T7.5-12 | Uso de nomes alternativos para readiness G6 | PR inválida — grep simples detecta |
| B-T7.5-13 | Ausência de payload de saída para T7.6 | PR inválida — PR-T7.6 não pode abrir |
| B-T7.5-14 | Diff com mais de 4 arquivos sem justificativa | PR fora de escopo |

---

## §17 Bloco E — Fechamento Desta PR (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:              schema/implantation/T7_CUTOVER_GOVERNADO.md
Estado da evidência:                      completa
Há lacuna remanescente?:                  não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:           sim
Estado permitido após esta PR:            PR-T7.5 entregue — protocolo de cutover formalizado
Próxima PR autorizada:                    PR-T7.6 — Rollback operacional comprovado
```

| Campo | Valor |
|-------|-------|
| PR | PR-T7.5 |
| Entrega principal | `schema/implantation/T7_CUTOVER_GOVERNADO.md` |
| Artefato central | Protocolo de cutover parcial ou total governado |
| Adendo A00-ADENDO-03 | Evidência manda no estado |
| Fechamento permitido? | **sim** — todos os CA-T7.5-01..21 satisfeitos; zero bloqueios abertos nesta PR |
| Justificativa | Protocolo completo: 14 pré-condições CC-01..14; 4 modos de cutover; Caminho A/B; critérios parcial/total; gate com 6 estados e transições formais; 8 travas contra entrada real; rollback RK-1..11; MET-01..10 por modo; matriz de decisão; payload para T7.6; CA-T7.5-01..21; B-T7.5-01..14; referências canônicas verificadas; zero src/; zero runtime; zero WhatsApp real; zero cutover real. |
| Próxima PR autorizada | **PR-T7.6 — Rollback operacional comprovado** |
| Gate em aberto | G7 — bloqueado até PR-T7.R |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |

---

## §18 Estado Herdado

- Fase: T7 em execução.
- PR-T7.4 (#140) merged em main em 2026-04-29.
- `T7_CANARY_INTERNO.md` criado com protocolo formal de canary: pré-condições PC-01..12, ambientes AMB-01..04, volumes A/B, MET-01..10, pausa/rollback, janela, aprovação, payload para T7.5.
- Referência G6: `READINESS_G6.md`.
- Referência preflight: `T7_PREFLIGHT_GO_LIVE.md`.
- Referência shadow: `T7_SHADOW_SIMULACAO.md`.
- Referência matriz: `T7_MATRIZ_DIVERGENCIAS.md`.
- Próximo passo autorizado antes desta PR: PR-T7.5.

---

## §19 Estado Entregue

- `T7_CUTOVER_GOVERNADO.md` criado em `schema/implantation/`.
- Protocolo de cutover governado formalizado com 19 seções.
- CC-01..CC-14 com checklist e evidência exigida.
- 4 modos de cutover (CO-PARCIAL, CO-TOTAL-INTERNO, CO-TOTAL-CLIENTE, CO-NOGO).
- Caminho A (progressivo) e Caminho B (comprimido) com restrições explícitas.
- MET-01..10 com thresholds distintos por modo (parcial / total-interno / total-cliente).
- Rollback RC-01..RC-08 + procedimento RK-1..RK-11 com proibições.
- Gate CUTOVER_GATE_STATUS com 6 estados e transições formais.
- 8 travas TR-01..TR-08 contra entrada real sem decisão.
- Matriz de decisão formal por condição.
- Payload canônico §14 para saída em T7.6 com campos obrigatórios.
- CA-T7.5-01..21 satisfeitos; B-T7.5-01..14 declarados.
- PR-T7.6 (Rollback operacional comprovado) desbloqueada.
