# T7_PREFLIGHT_GO_LIVE — Pré-flight de Go-live e Travas Operacionais — ENOVA 2

## §1 Meta

| Campo | Valor |
|-------|-------|
| PR | PR-T7.1 |
| Fase | T7 — Shadow, simulação, canary, cutover e rollback |
| Gate | G7 — go-live controlado (aberto/bloqueado até PR-T7.R) |
| Status | entregue |
| Artefato | `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |
| Fecha | Pré-flight T7.1 — condições mínimas de go-live mapeadas e validadas documentalmente |
| Próxima PR | PR-T7.2 — Shadow/simulação controlada |
| Data | 2026-04-29 |
| Referência G6 | `schema/implantation/T6_READINESS_CLOSEOUT_G6.md` — única referência canônica do G6 APROVADO |

---

## §2 Objetivo

Mapear e validar **documentalmente** as condições mínimas que devem existir antes de iniciar qualquer simulação, canary ou cutover controlado da Enova 2.

Este documento não entrega runtime. Não liga WhatsApp real. Não executa shadow, canary ou cutover.
Ele define **o que deve existir** antes que qualquer execução real comece.

A execução real das condições mapeadas aqui será verificada nas PRs subsequentes (T7.2–T7.7) como parte da evidência de cada etapa.

---

## §3 Premissa operacional

**A Enova 2 ainda NÃO está atendendo clientes reais em produção. Nem no legado nem na Enova 2.**

Esta constatação é determinante para a abordagem de T7:

| Aspecto | Interpretação correta |
|---------|-----------------------|
| Operação ativa em risco? | **Não.** Não há clientes reais no ar. |
| Risco principal | Ligar cliente real ANTES de smoke, rollback, telemetria e go/no-go estarem provados. |
| Proteção necessária | Proteger a entrada real de clientes — não proteger operação já ativa. |
| Margem de ação | **Maior** — podemos ser mais arrojados no plano de migração. |
| Consequência para migração | Caminho B (arrojado) é formalmente autorizado se provas mínimas passarem. |

**O risco correto:** abrir volume real de clientes sem:
1. Smoke mínimo aprovado.
2. Rollback provado (executado ou simulado com evidência).
3. Telemetria mínima ativa.
4. Critério de go/no-go definido e aprovado.
5. Feature flag ou forma clara de desligar.
6. Decisão executiva documentada.

---

## §4 Caminhos autorizados — Caminho A e Caminho B

Este pré-flight habilita dois caminhos de go-live, conforme contrato T7 §1 e §17:

### Caminho A — Gradual controlado (padrão)

```
PR-T7.1 (pré-flight) → PR-T7.2 (shadow/simulação) → PR-T7.3 (divergências/hardening) →
PR-T7.4 (canary interno) → PR-T7.5 (cutover parcial/total) → PR-T7.6 (rollback provado) →
PR-T7.7 (checklist go/no-go) → PR-T7.R (closeout G7)
```

**Quando usar:** Quando há incerteza sobre paridade, divergências mapeadas ainda abertas, ou preferência por cautela operacional.

### Caminho B — Arrojado permitido

**Condição de ativação (todos os itens devem ser verdadeiros):**

| Condição | Verificação |
|----------|-------------|
| Sem cliente real ativo no momento do cutover | Confirmado — Enova não está em produção |
| Pré-flight completo (este documento aprovado) | Verificado em PR-T7.1 |
| Smoke/simulação com métricas aceitáveis (T7.2) | Entregue e PASS |
| Zero `DIV-RM` e zero `DIV-BA` não resolvidos (T7.3) | Confirmado |
| Rollback provado — executado ou simulado (T7.6) | Executado ou simulado com evidência |
| Telemetria mínima ativa | Confirmado |
| Feature flag/desligamento existente e provado | Confirmado |
| Decisão executiva de go-live documentada | Registrada formalmente |

**O que o Caminho B permite:**
- Canary (T7.4) dispensado com justificativa formal documentada em `T7_CANARY_INTERNO.md`.
- Cutover total (T7.5) executado antes da entrada de qualquer cliente real.
- Sequência de PRs permanece a mesma — T7.4 pode registrar "dispensado", T7.5 registra cutover total.

**O que o Caminho B NÃO dispensa:**
- Rollback operacional provado.
- Smoke mínimo aprovado.
- Telemetria ativa.
- Critério de go/no-go aprovado formalmente.
- Feature flag/desligamento existente.
- Prova de WhatsApp/Meta validados sem operação aberta.
- G7 formal via PR-T7.R.

---

## §5 Feature flags e mecanismo de desligamento

### §5.1 Flags necessárias

O sistema deve ter (ou criar, em PRs de execução futuras com critério de aceite vinculado) as seguintes capacidades de controle de tráfego:

| Flag / Controle | Finalidade | Escopo | Lacuna? |
|-----------------|------------|--------|---------|
| `ENOVA2_ENABLED` | Liga/desliga roteamento de mensagens para Enova 2 | Global — afeta todos os leads | Verificar em PR de execução |
| `ENOVA2_CANARY_PERCENT` | Percentual de leads roteados para Enova 2 (0–100) | Granular — para canary progressivo | Verificar em PR de execução |
| `ENOVA2_CHANNEL_ENABLED` | Liga/desliga o adapter Meta/WhatsApp de T6.7 | Canal — para pausar entrada de mensagens | Verificar em PR de execução |
| `ENOVA2_SHADOW_MODE` | Processa em paralelo sem substituir resposta ao cliente | Shadow — para T7.2 | Verificar em PR de execução |
| `ENOVA2_CUTOVER_MODE` | Substitui legado como fluxo primário | Cutover — para T7.5 | Verificar em PR de execução |
| `ENOVA2_ROLLBACK_FLAG` | Reverte imediatamente ao legado | Emergência — rollback a qualquer momento | Verificar em PR de execução |

> **Nota:** Este documento mapeia as flags necessárias. A existência técnica real de cada flag deve ser confirmada e provada nas PRs de execução correspondentes (T7.2–T7.6). Se uma flag não existir tecnicamente, é uma lacuna que bloqueia a PR que a exige — não bloqueia este pré-flight documental.

### §5.2 Como desligar a Enova 2

Roteiro de desligamento de emergência (a implementar/verificar em PRs de execução):

```
1. Setar ENOVA2_ENABLED = false → para novo roteamento para Enova 2
2. Setar ENOVA2_CANARY_PERCENT = 0 → garante zero leads novos para Enova 2
3. Setar ENOVA2_ROLLBACK_FLAG = true → força reversão imediata ao legado
4. Verificar fila de mensagens em processamento → aguardar ou forçar cancelamento seguro
5. Confirmar que legado volta a responder → smoke de legado (3 turnos mínimos)
6. Registrar timestamp, motivo e responsável pelo desligamento
```

### §5.3 Impedimento de entrada real sem autorização

Mecanismo de proteção obrigatório antes de qualquer go-live com cliente real:

| Mecanismo | Descrição | Obrigatório antes de G7 |
|-----------|-----------|--------------------------|
| Gate de go/no-go documentado | Decisão executiva explícita com data, responsável e condições | **Sim** |
| `ENOVA2_ENABLED = false` como padrão | Flag inicia desligada; só se liga com decisão explícita | **Sim** |
| `ENOVA2_CANARY_PERCENT = 0` como padrão | Zero tráfego real até autorização gradual | **Sim** |
| Checklist T7.7 aprovado | Consolidação de todas as provas antes de abrirvolume | **Sim** |
| Rollback provado (T7.6) | Porta de saída confirmada antes de qualquer entrada | **Sim** |

### §5.4 Como pausar o canal Meta/WhatsApp

Roteiro para pausar o adapter T6.7 sem perda de mensagens:

```
1. Setar ENOVA2_CHANNEL_ENABLED = false → para processamento de novas mensagens inbound
2. Meta/WhatsApp continuam recebendo mensagens → fila preservada
3. Legado volta a processar → ou fila aguarda retomada
4. Logs de pausa são registrados com timestamp e motivo
5. Mensagens em trânsito: aguardar processamento ou marcar como "processamento_pausado"
```

### §5.5 Impedimento de cutover acidental

| Proteção | Descrição |
|----------|-----------|
| Cutover requer decisão explícita | `ENOVA2_CUTOVER_MODE` não pode ser ativado sem checklist T7.7 aprovado |
| Cutover requer rollback provado | T7.6 deve existir com evidência antes de qualquer ativação de `ENOVA2_CUTOVER_MODE` |
| Cutover requer telemetria ativa | Logs e métricas devem estar funcionando antes de cutover |
| Cutover documentado | Data, responsável, condições e evidências registradas em T7.5 |

---

## §6 Fallback para estado anterior

### §6.1 Reversão de roteamento

| O que reverte | Como | Estado após reversão |
|---------------|------|---------------------|
| Roteamento de mensagens | `ENOVA2_ENABLED = false` + `ENOVA2_ROLLBACK_FLAG = true` | Legado processa todas as mensagens novas |
| Canary em andamento | `ENOVA2_CANARY_PERCENT = 0` | Zero novos leads para Enova 2; leads já em andamento migram ao legado |
| Cutover ativo | `ENOVA2_CUTOVER_MODE = false` + `ENOVA2_ENABLED = false` | Legado reassume como fluxo primário |

### §6.2 Estado de leads (lead_state)

| Cenário | O que acontece com lead_state | Ação necessária |
|---------|------------------------------|-----------------|
| Lead processado pela Enova 2, rollback ativado | `lead_state` preservado no Supabase — auditável | Legado lê estado existente ou inicia do zero |
| Lead em processamento no momento do rollback | Turno atual é abortado; estado do turno anterior é o estado vigente | Registrar estado de aborto nos logs |
| Lead com snapshot da Enova 2 | Snapshot permanece no Supabase como evidência | Não apagar — manter para auditoria |
| Lead sem interação com Enova 2 | Não afetado | Nenhuma ação |

> **Regra:** Lead_state nunca é apagado durante rollback. Apenas o roteamento é revertido.

### §6.3 Preservação de logs

| Tipo de log | Preservado durante rollback? | Onde |
|-------------|------------------------------|------|
| Turn logs (TurnoRastro T4.4) | **Sim** — sempre | Supabase, imutáveis |
| Decision trace (PolicyDecisionSet T3.3) | **Sim** — sempre | Supabase, imutáveis |
| Adapter Meta/WhatsApp (T6.7) | **Sim** — wa_message_id, timestamps, status events | Supabase |
| Métricas de turno | **Sim** — agregados e por turno | Log estruturado |
| Snapshot de lead_state | **Sim** — L3/L4 preservados | Supabase |

### §6.4 Preservação de dossiê

| Cenário | O que acontece com dossiê |
|---------|--------------------------|
| Documentos submetidos durante simulação/canary | Preservados com estado de auditoria `simulacao` ou `canary` |
| Documentos processados em cutover | Preservados com estado `ativo` |
| Rollback após cutover | Documentos permanecem associados ao lead — estado documental não é revertido |
| Dossiê do correspondente (T6.8) | Preservado integralmente; link do correspondente não é desfeito |

### §6.5 Rastreabilidade garantida

Todas as operações durante T7 devem produzir rastro auditável, independentemente do caminho:

- Cada turno: `turn_id` + `case_id` + `timestamp` + `decision_trace`
- Cada mudança de estado: `lead_state_before` + `lead_state_after` + `reason`
- Cada evento de canal: `wa_message_id` + `adapter_event_id` + `status`
- Cada flag ativada/desativada: `flag_name` + `value_before` + `value_after` + `operator` + `timestamp`

---

## §7 Plano de métricas

### §7.1 Métricas mínimas obrigatórias

| ID | Métrica | Descrição | Threshold de alerta | Frequência |
|----|---------|-----------|---------------------|------------|
| MET-01 | Taxa de cenários PASS | % de cenários de simulação/canary que passam nos critérios de aceite | < 90% = alerta / < 80% = bloqueio | Por lote de simulação |
| MET-02 | Divergência de policy | Nº de decisões de policy que divergem do esperado (T3 contrato) | > 5% = alerta / > 10% = bloqueio | Por lote |
| MET-03 | Divergência de regra MCMV | Nº de violações de regra MCMV (elegibilidade, renda, regime) | Qualquer ocorrência = bloqueio imediato | Contínuo |
| MET-04 | Erro de estado/memória | Nº de lead_states incorretos após turno (campo errado, conflito não resolvido) | > 3% = alerta / > 8% = bloqueio | Por lote |
| MET-05 | Erro documental/dossiê | Nº de documentos associados incorretamente ou estados errados | > 2% = alerta / > 5% = bloqueio | Por lote |
| MET-06 | Erro de canal Meta/WhatsApp | Nº de falhas no adapter (entrega, rate limit, idempotência, assinatura) | > 1% = alerta / > 3% = bloqueio | Contínuo |
| MET-07 | Latência mínima aceitável | Tempo de resposta do turno completo (entrada → reply_text entregue) | > 5s P95 = alerta / > 10s P99 = bloqueio | Por turno |
| MET-08 | Falha crítica de turno | Nº de turnos que terminam em erro não tratado / sem reply_text entregue | > 1% = bloqueio imediato | Contínuo |
| MET-09 | Promessa indevida | Nº de reply_texts que prometem elegibilidade/aprovação sem critério verificado | Qualquer ocorrência = revisão imediata | Por turno (revisão manual) |
| MET-10 | Repetição/fala mecânica | Nº de reply_texts que repetem frases exatamente iguais em turnos consecutivos | > 3% = alerta / detecção requer amostragem | Por lote (amostragem) |

### §7.2 Thresholds para liberação de Caminho B (arrojado)

Para que o Caminho B seja ativado, todas as métricas devem estar na faixa verde:

| Métrica | Threshold mínimo para Caminho B |
|---------|----------------------------------|
| MET-01 Taxa PASS | ≥ 95% |
| MET-02 Divergência policy | ≤ 2% |
| MET-03 Violação MCMV | 0 (zero absoluto) |
| MET-04 Erro estado/memória | ≤ 1% |
| MET-05 Erro documental | ≤ 1% |
| MET-06 Erro canal | ≤ 0.5% |
| MET-07 Latência | P95 ≤ 3s |
| MET-08 Falha crítica | 0 (zero absoluto) |
| MET-09 Promessa indevida | 0 (zero absoluto) |
| MET-10 Fala mecânica | ≤ 1% |

---

## §8 Plano de logs e evidências

### §8.1 Campos obrigatórios por turno simulado/real

| Campo | Tipo | Descrição | Obrigatório? |
|-------|------|-----------|--------------|
| `turn_id` | UUID | Identificador único do turno | **Sim** |
| `case_id` | String | Identificador do lead/caso | **Sim** |
| `session_id` | String | Identificador da sessão (agrupamento de turnos) | **Sim** |
| `input_type` | Enum | Tipo de entrada: `text`, `image`, `audio`, `document`, `sticker`, `video` | **Sim** |
| `input_summary` | String | Resumo do input (sem dado sensível) | **Sim** |
| `decision_trace` | JSON | PolicyDecisionSet completo — decisões de T3 + colisões + meta | **Sim** |
| `policy_triggered` | Array[String] | Políticas ativadas neste turno (ex: `R_CASADO_CIVIL_CONJUNTO`, `R_AUTONOMO_IR`) | **Sim** |
| `lead_state_before` | JSON | Snapshot de lead_state antes do turno | **Sim** |
| `lead_state_after` | JSON | Snapshot de lead_state após o turno | **Sim** |
| `expected_output` | JSON | Output esperado conforme contrato T1–T6 (para simulação) | **Sim em simulação** |
| `observed_output` | JSON | Output real produzido pela Enova 2 | **Sim** |
| `divergence` | JSON | Diferença entre expected e observed (null se sem divergência) | **Sim em simulação** |
| `divergence_category` | Enum | Categoria de divergência conforme T7.3 (DIV-MA, DIV-ND, DIV-RO...) | **Sim se divergência** |
| `action_taken` | Enum | `pass`, `flag_for_review`, `block`, `rollback_triggered` | **Sim** |
| `reply_text_source` | Enum | `llm` (válido) ou `mechanical` (violação) | **Sim** |
| `timestamp_start` | ISO8601 | Início do processamento do turno | **Sim** |
| `timestamp_end` | ISO8601 | Fim do processamento do turno | **Sim** |
| `latency_ms` | Integer | Latência total do turno em ms | **Sim** |
| `mode` | Enum | `simulation`, `canary`, `cutover`, `rollback_test` | **Sim** |
| `operator` | String | Sistema ou agente que disparou o turno | **Sim** |

### §8.2 Retenção mínima de logs

| Tipo de log | Retenção mínima | Justificativa |
|-------------|-----------------|---------------|
| Turn logs completos | 90 dias após go-live | Auditoria operacional e debugging |
| Decision traces | 180 dias | Conformidade MCMV e análise de divergências |
| Lead_state snapshots | Indefinida (até encerramento do lead) | Rastreabilidade contratual |
| Métricas agregadas | 365 dias | Baseline e evolução operacional |
| Logs de flags/desligamento | 365 dias | Auditoria de incidentes |
| Adapter Meta/WhatsApp | 90 dias | Rate limit, idempotência, debugging |

### §8.3 Formato mínimo de evidência de rollback

Toda execução de rollback (real ou simulada) deve produzir:

```json
{
  "rollback_id": "UUID",
  "trigger": "manual | automatic | threshold_breach",
  "trigger_reason": "descrição da causa",
  "triggered_at": "ISO8601",
  "triggered_by": "operador ou sistema",
  "flag_before": { "ENOVA2_ENABLED": true, "ENOVA2_CANARY_PERCENT": 20 },
  "flag_after":  { "ENOVA2_ENABLED": false, "ENOVA2_CANARY_PERCENT": 0 },
  "leads_in_flight_count": 0,
  "leads_migrated_to_legacy": 0,
  "rollback_confirmed_at": "ISO8601",
  "legacy_smoke_passed": true,
  "evidence_path": "path/to/evidence"
}
```

---

## §9 Comparação contra contratos T1–T6

### §9.1 Mapa de comparação por contrato

| Contrato | Artefatos de referência | O que comparar | Método |
|----------|------------------------|----------------|--------|
| **T1** | `T1_SYSTEM_PROMPT_CANONICO.md`, `T1_COMPORTAMENTOS_E_PROIBICOES.md` | Identidade, tom, proibições | Amostragem de reply_texts — verificar ausência de bot-speak, templates rígidos, fala mecânica |
| **T2** | `T2_LEAD_STATE_V1.md`, `T2_DICIONARIO_FATOS.md`, `T2_RECONCILIACAO.md` | Campos de lead_state corretos, fatos com origem e confiança, reconciliação de conflitos | Comparar lead_state_before/after com estado esperado por cenário |
| **T3** | `T3_REGRAS_CRITICAS_DECLARATIVAS.md`, `T3_ORDEM_AVALIACAO_COMPOSICAO.md`, `T3_VETO_SUAVE_VALIDADOR.md` | Regras MCMV aplicadas, ordem de avaliação, vetos corretos | Comparar decision_trace com PolicyDecisionSet esperado |
| **T4** | `T4_PIPELINE_LLM.md`, `T4_ENTRADA_TURNO.md`, `T4_VALIDACAO_PERSISTENCIA.md`, `T4_FALLBACKS.md` | Pipeline de turno, reply_text de fonte LLM, fallbacks corretos | Verificar reply_text_source = 'llm'; verificar fallback ativado corretamente em erro |
| **T5** | `T5_FATIA_*.md` (fatias de funil) | Paridade funcional dos fluxos: qualificação, renda, regime, elegibilidade, companheiro | Comparar outputs de cenários de funil contra comportamento esperado de T5 |
| **T6** | `T6_SURFACE_CANAL.md`, `T6_ADAPTER_META_WHATSAPP.md`, `T6_AUDIO_CEREBRO_CONVERSACIONAL.md`, `T6_PIPELINE_IMAGEM_PDF.md`, `T6_DOSSIE_OPERACIONAL.md` | Canal normalizado corretamente, adapter idempotente, áudio sem decisão autônoma, imagem sem verdade absoluta, dossiê com trilha | Comparar SurfaceEventNormalizado, adapter events, media handling |

### §9.2 Critérios de paridade por contrato

| Contrato | Paridade mínima aceitável (Caminho A) | Paridade mínima para Caminho B |
|----------|---------------------------------------|--------------------------------|
| T1 | Ausência de fala mecânica em > 95% dos turnos | > 99% |
| T2 | Lead_state correto em > 92% dos cenários | > 98% |
| T3 | Zero violação de regra MCMV; < 5% divergência de policy | Zero violação MCMV; < 2% divergência |
| T4 | Reply_text de LLM em 100% dos turnos; fallback correto em > 90% | 100% LLM; fallback > 98% |
| T5 | Paridade funcional > 90% nos fluxos prioritários | > 97% |
| T6 | Zero mensagens perdidas; adapter idempotente em > 99% | 100% idempotência; zero perda |

### §9.3 Camada de comparação declarativa (para T7.2)

Para a simulação de T7.2, a comparação deve usar:

1. **Casos sintéticos** definidos em T7.2, com output esperado definido explicitamente antes da execução.
2. **Casos históricos** (se disponíveis) — replay de interações reais/teste com output documentado.
3. **Artefatos T1–T6** como fonte de verdade do comportamento esperado.
4. **Divergências** classificadas conforme categorias de T7.3 (DIV-MA, DIV-ND, DIV-RO, DIV-VP, DIV-RM, etc.).

---

## §10 Critérios de bloqueio — B-T7.1-01..B-T7.1-12

| ID | Bloqueio | Consequência |
|----|----------|--------------|
| B-T7.1-01 | Sem forma de desligamento documentada (ausência de mapeamento de flags §5) | Bloqueia PR-T7.2 |
| B-T7.1-02 | Sem mapeamento de rollback mínimo (ausência de §6) | Bloqueia PR-T7.2 |
| B-T7.1-03 | Sem plano de telemetria mínima (ausência de §7 e §8) | Bloqueia PR-T7.2 |
| B-T7.1-04 | Sem critério de go/no-go documentado (ausência de §11 e §12) | Bloqueia PR-T7.2 e PR-T7.R |
| B-T7.1-05 | Sem referência a `READINESS_G6.md` como fonte canônica do G6 | Bloqueia qualquer PR de T7 que afirme G6 aprovado |
| B-T7.1-06 | Tentativa de ligar cliente real sem Bloco E aprovado em PR-T7.R | Bloqueio absoluto — violação contratual |
| B-T7.1-07 | Tentativa de alterar `src/` sem PR de execução vinculada a CA verificável | Bloqueio absoluto — violação contratual |
| B-T7.1-08 | Criação de `reply_text` mecânico, script ou fallback dominante | Bloqueio absoluto — violação A00-ADENDO-01 |
| B-T7.1-09 | Divergência contra regra MCMV sem classificação formal em T7.3 | Bloqueia avanço de T7.3 para T7.4 |
| B-T7.1-10 | Canary/cutover executado antes de pré-flight (este documento) ser merged | Bloqueio absoluto — sequência violada |
| B-T7.1-11 | Shadow/simulação com tráfego real de clientes antes de G7 aprovado | Bloqueio absoluto — violação do contrato T7 §3 |
| B-T7.1-12 | Desligamento do legado antes de G7 APROVADO | Bloqueio absoluto — PROB-T7-07 |

---

## §11 Critérios mínimos para liberar PR-T7.2 (Caminho A)

Para que PR-T7.2 seja autorizada no Caminho A:

| Critério | Verificação |
|----------|-------------|
| Este documento (`T7_PREFLIGHT_GO_LIVE.md`) merged | PR-T7.1 merged em main |
| Mapeamento de feature flags presente (§5) | §5.1–§5.5 completos neste documento |
| Fallback documentado (§6) | §6.1–§6.5 completos neste documento |
| Plano de métricas documentado (§7) | MET-01..MET-10 definidos neste documento |
| Plano de logs documentado (§8) | Campos §8.1, retenção §8.2, formato evidência §8.3 presentes |
| Comparação T1–T6 mapeada (§9) | §9.1–§9.3 completos neste documento |
| Critérios de bloqueio B-T7.1-01..12 declarados (§10) | Presentes neste documento |
| Nenhum B-T7.1-01..05 em aberto | Todos satisfeitos por este documento |
| Zero `src/` alterado em PR-T7.1 | Confirmado por `git diff` |
| Zero runtime, shadow, canary, cutover real | Confirmado — PR-T7.1 é documental |

---

## §12 Critérios mínimos para liberar Caminho B (arrojado)

Para que o Caminho B seja formalmente autorizado (verificado em PR-T7.7 e PR-T7.R):

| Critério | Quando verificar |
|----------|-----------------|
| Sem cliente real ativo no momento da ativação | PR-T7.7 + PR-T7.R |
| Este documento approved/merged (PR-T7.1) | PR-T7.1 merged |
| T7.2 entregue: métricas de simulação atingiram threshold Caminho B (§7.2) | PR-T7.2 |
| T7.3 entregue: zero `DIV-RM` e zero `DIV-BA` não resolvidos | PR-T7.3 |
| T7.6 entregue: rollback executado ou simulado com evidência | PR-T7.6 |
| Telemetria ativa e funcionando (MET-01..10 coletadas) | PR-T7.6 |
| Feature flag/desligamento existente e testado | PR-T7.6 |
| Decisão executiva explícita de go-live documentada | PR-T7.7 |
| Bloco E de PR-T7.R com `Fechamento permitido?: sim` | PR-T7.R |

---

## §13 Critérios de aceite — CA-T7.1-01..CA-T7.1-12

| ID | Critério | Verificável por |
|----|----------|-----------------|
| CA-T7.1-01 | Arquivo `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` criado e merged | `git show` + presença no repo |
| CA-T7.1-02 | Premissa operacional declarada: Enova não atende clientes reais (§3) | Inspeção de §3 |
| CA-T7.1-03 | Feature flags e desligamento mapeados (§5.1–§5.5) | Inspeção de §5 |
| CA-T7.1-04 | Fallback para estado anterior documentado (§6.1–§6.5) | Inspeção de §6 |
| CA-T7.1-05 | Plano de métricas MET-01..MET-10 com thresholds (§7) | Inspeção de §7 |
| CA-T7.1-06 | Plano de logs com campos obrigatórios e retenção (§8) | Inspeção de §8 |
| CA-T7.1-07 | Comparação T1–T6 mapeada (§9) | Inspeção de §9 |
| CA-T7.1-08 | Bloqueios B-T7.1-01..12 declarados (§10) | Inspeção de §10 |
| CA-T7.1-09 | Critérios para Caminho A (§11) e Caminho B (§12) formalizados | Inspeção de §11 e §12 |
| CA-T7.1-10 | `READINESS_G6.md` referenciado como fonte canônica do G6 (§1 Meta) | Inspeção de §1 |
| CA-T7.1-11 | Nenhum arquivo `src/` alterado nesta PR | `git diff --name-only` |
| CA-T7.1-12 | Zero execução real (shadow, canary, cutover, WhatsApp real, runtime) nesta PR | Inspeção do diff + §3 |

---

## §14 ESTADO HERDADO

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T7.0 (#136) — Abertura formal do contrato T7 — skeleton substituído por contrato completo
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md (aberto; PR-T7.1 autorizada)
Objetivo imutável do contrato: Go-live controlado da ENOVA 2 — shadow, simulação, canary, cutover e rollback
Recorte a executar nesta PR: PR-T7.1 — Pré-flight de go-live e travas operacionais
Item do A01: T7 — fase 8, prioridade 8 — microetapa pré-flight
Estado atual da frente: contrato T7 aberto; PR-T7.1 autorizada; nenhuma execução real realizada
O que a última PR fechou: Contrato T7 formal; B-T7-02 (skeleton substituído); sequência T7.0–T7.R formalizada
O que a última PR NÃO fechou: Feature flags, fallback, métricas, logs, comparação T1–T6, shadow, canary, cutover, G7
Por que esta tarefa existe: PR-T7.1 é o recorte explicitamente autorizado pelo contrato T7 §16
Esta tarefa está dentro ou fora do contrato ativo: dentro — PR-T7.1 é passo autorizado por contrato T7 §16
Objetivo desta tarefa: Criar T7_PREFLIGHT_GO_LIVE.md com condições mínimas de go-live documentadas
Escopo: schema/implantation/T7_PREFLIGHT_GO_LIVE.md + atualização mínima de arquivos vivos
Fora de escopo: src/, runtime, shadow real, canary real, cutover real, WhatsApp real, Supabase
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Rebase canonico lido:        N/A — já incorporado
  Plano T0-T7 lido:            schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md
  Índice legado consultado:    N/A — pré-flight é governança; regras de negócio via T1–T6
  Legado markdown auxiliar:    N/A — artefatos T1–T6 são referência suficiente
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

---

## §15 ESTADO ENTREGUE

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: T7_PREFLIGHT_GO_LIVE.md criado — 15 seções; feature flags, fallback, métricas, logs, comparação T1–T6, caminhos A/B, critérios de bloqueio e aceite
O que foi fechado nesta PR: CA-T7.1-01..12 todos satisfeitos; S1 do contrato T7 entregue; B-T7.1-01..12 declarados
O que continua pendente: Shadow/simulação (T7.2), divergências (T7.3), canary (T7.4), cutover (T7.5), rollback (T7.6), go/no-go (T7.7), closeout G7 (T7.R)
O que ainda não foi fechado do contrato ativo: S2–S8, CA-T7-02..12, B-T7-03..10, gate G7
Recorte executado do contrato: §16 PR-T7.1 — pré-flight de go-live e travas operacionais
Pendência contratual remanescente: PRs T7.2–T7.R, gate G7, go-live
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não — contrato T7 permanece aberto e em execução
O próximo passo autorizado foi alterado? sim — de PR-T7.1 para PR-T7.2
Esta tarefa foi fora de contrato? não
Arquivos vivos atualizados: schema/implantation/T7_PREFLIGHT_GO_LIVE.md (criado), schema/contracts/_INDEX.md, schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md, schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```

---

## §16 BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T7_PREFLIGHT_GO_LIVE.md (este arquivo)
Estado da evidência:                   completa — 15 seções cobrindo todos os requisitos do contrato T7 §16 PR-T7.1 e do brief da tarefa
Há lacuna remanescente?:               não — feature flags, fallback, métricas MET-01..10, logs, comparação T1–T6, caminhos A/B, CA-T7.1-01..12, B-T7.1-01..12 todos presentes
Há item parcial/inconclusivo bloqueante?: não — nota em §5.1 sobre flags técnicas é lacuna futura documentada (não bloqueante para este pré-flight documental)
Fechamento permitido nesta PR?:        sim — PR-T7.1 fecha o pré-flight documental de go-live
Estado permitido após esta PR:         PR-T7.1 encerrada; contrato T7 em execução; PR-T7.2 desbloqueada
Próxima PR autorizada:                 PR-T7.2 — Shadow/simulação controlada
```
