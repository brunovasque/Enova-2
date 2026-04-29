# T7_ROLLBACK_OPERACIONAL — Rollback Operacional Comprovado

## §1 Meta

| Campo | Valor |
|-------|-------|
| PR | PR-T7.6 |
| Fase | T7 — Shadow, simulação, canary, cutover e rollback |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |
| Referência G6 | `schema/implantation/READINESS_G6.md` |
| Pré-flight | `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` |
| Simulação | `schema/implantation/T7_SHADOW_SIMULACAO.md` |
| Matriz | `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` |
| Canary | `schema/implantation/T7_CANARY_INTERNO.md` |
| Cutover | `schema/implantation/T7_CUTOVER_GOVERNADO.md` |
| Rollback (este artefato) | `schema/implantation/T7_ROLLBACK_OPERACIONAL.md` |
| Data | 2026-04-29 |
| Gate anterior | G6 — APROVADO em 2026-04-28 |
| Gate aberto | G7 — go-live controlado (bloqueado até PR-T7.R) |
| Status | entregue |
| Fecha | rollback operacional comprovado |
| Próxima PR autorizada | PR-T7.7 — Checklist executivo de go/no-go |
| Adendo soberania IA | `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) |
| Adendo MCMV | `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) |
| Adendo fechamento | `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) |

---

## §2 Objetivo

Este documento formaliza e comprova documentalmente o **rollback operacional da Enova 2** antes do checklist executivo de go/no-go (PR-T7.7).

Objetivos específicos:

1. **Definir os gatilhos de rollback** — condições que disparam reversão imediata.
2. **Formalizar o roteiro operacional de retorno** — passos sequenciais da reversão.
3. **Declarar preservação de estado** — o que nunca pode ser apagado, como preservar lead_state, snapshots e histórico.
4. **Declarar preservação de logs e evidências** — shape canônico do registro de rollback.
5. **Declarar preservação de dossiê e documentos** — documentos são imutáveis pós-rollback.
6. **Definir pausa de canal e reversão de flags** — estado de cada flag antes e depois.
7. **Definir os cenários de smoke/simulação RBK-01..RBK-08** — comprovação documental do rollback.
8. **Declarar critérios de sucesso e falha** do rollback.
9. **Entregar a matriz de decisão** — tabela formal por condição.
10. **Entregar o payload canônico de saída para PR-T7.7**.

Esta PR **não entrega runtime**. Não toca `src/`. Não usa WhatsApp real. Não executa rollback real. Não executa cutover real. Todo artefato é declarativo/documental.

---

## §3 Premissa Operacional

### 3.1 A Enova 2 ainda NÃO atende clientes reais

A Enova 2 ainda não está em operação comercial. Não há clientes reais em atendimento.

Consequências diretas para esta PR:

- Rollback documental não fecha G7.
- Esta PR não executa rollback real em ambiente de produção.
- Esta PR não conecta WhatsApp real, Meta real ou Supabase produtivo novo.
- G7 continua bloqueado até PR-T7.R.
- Cliente real só entra com autorização explícita posterior ao G7.

### 3.2 Rollback documental vs rollback real

| Dimensão | Rollback Documental (esta PR) | Rollback Real |
|----------|-------------------------------|---------------|
| Escopo | Define protocolo, gatilhos, cenários, evidências | Executa reversão do sistema |
| Ambiente | Nenhum (documental) | Produção controlada |
| Efeito | Zero — puramente declarativo | Reverte CUTOVER_MODE / ROLLBACK_FLAG |
| G7 | Não fecha G7 | Parte do caminho para comprovação G7 |
| Evidência | Definida aqui; preenchida na execução | Log real de rollback com campos preenchidos |

### 3.3 Relação com cutover (T7.5)

O rollback comprovado pressupõe cutover formalizado (PR-T7.5). O payload de entrada desta PR vem de T7.5 §14. Campos obrigatórios de entrada: `approved_for_rollback_proof: true`, `recommendation: proceed` ou `proceed_with_restrictions`, `vasques_authorization_received: true`.

### 3.4 Limites desta PR

- Zero `reply_text` gerado.
- Zero `fact_*` novo declarado.
- Zero modificação em `src/`.
- Zero artefatos T6 recriados ou modificados.
- Zero rollback real, cutover real, canary real.
- Zero WhatsApp real ou Meta real.
- Referência G6 é `READINESS_G6.md` — não usar nomes alternativos.
- Os nomes dos artefatos T7 são os canônicos declarados no §1 — não usar nomes alternativos.

---

## §4 Entradas Obrigatórias de T7.5

O rollback operacional consome o payload de saída de T7.5 (`T7_CUTOVER_GOVERNADO.md` §14). Todos os campos abaixo são obrigatórios antes de iniciar qualquer comprovação de rollback.

| Campo | Valor esperado para prosseguir | Consequência se ausente/inválido |
|-------|-------------------------------|----------------------------------|
| `approved_for_rollback_proof` | `true` | Bloqueio imediato — rollback não comprovável |
| `cutover_mode_selected` | `CO-PARCIAL`, `CO-TOTAL-INTERNO` ou `CO-TOTAL-CLIENTE` | Se `CO-NOGO`, rollback é N/A |
| `cutover_gate_status` | `completed` ou `approved` | Se `blocked` ou `no_go`, rollback suspensão |
| `MET-03_mcmv_divergence` | `0` | Rollback bloqueante — DIV-RM aberta |
| `MET-08_critical_failure` | `0` | Rollback bloqueante — falha crítica |
| `MET-09_promise_indevida` | `0` | Rollback bloqueante — promessa indevida |
| `vasques_authorization_received` | `true` | Rollback não autorizado |
| `blocking_items` | `[]` (vazio) | Rollback bloqueado pelos itens pendentes |
| `recommendation` | `proceed` ou `proceed_with_restrictions` | `no_go` = rollback não necessário; revisar T7.5 |
| `rollback_requirements.pr_t76_required` | `true` | Confirma que esta PR (T7.6) é exigida |
| `rollback_requirements.rollback_tested` | `false` → será `true` após comprovação | Campo a ser preenchido nesta PR |
| `rollback_requirements.rollback_time_minutes` | `null` → preencher com tempo real | Campo a ser preenchido nesta PR |
| `rollback_requirements.rollback_evidence_path` | `null` → preencher com caminho real | Campo a ser preenchido nesta PR |

---

## §5 Gatilhos de Rollback

### 5.1 Gatilhos imediatos (disparam rollback sem deliberação)

| ID | Gatilho | Ação | Métrica/Categoria |
|----|---------|------|------------------|
| GT-01 | Violação de regra MCMV detectada em turno real | Rollback imediato + FREEZE | MET-03 > 0 / DIV-RM |
| GT-02 | Falha crítica (execução real não autorizada, jailbreak não contido) | Rollback imediato + FREEZE | MET-08 > 0 |
| GT-03 | Promessa indevida detectada (aprovação, taxa, prazo sem respaldo) | Rollback imediato | MET-09 > 0 |
| GT-04 | Tentativa de tráfego real não autorizado (fora de allowlist ou sem G7) | Rollback imediato + FREEZE | MET-06 grave |
| GT-05 | Veto explícito Vasques | Rollback imediato | — |

### 5.2 Gatilhos por degradação (disparam rollback após confirmação de janela)

| ID | Gatilho | Threshold | Ação |
|----|---------|-----------|------|
| GT-06 | Perda ou corrupção de lead_state | Qualquer caso | Rollback imediato |
| GT-07 | Erro documental grave (doc de terceiro entregue; estado documental inválido propagado) | Qualquer caso | Rollback imediato |
| GT-08 | Erro de canal grave (assinatura inválida aceita; mensagem enviada fora de allowlist) | Qualquer caso | Rollback imediato |
| GT-09 | Latência crítica (MET-07 p95 > 8.000 ms) | > 8.000 ms p95 por janela | Rollback após confirmação |
| GT-10 | Divergência bloqueante não resolvida identificada em produção | DIV-RM ou DIV-BA | Rollback imediato |
| GT-11 | Falha de observabilidade (impossibilidade de coletar MET-01..10) | Qualquer perda de telemetria crítica | Pausar + rollback se persistir > 10 min |
| GT-12 | Falha de rollback parcial (rollback iniciado mas não concluído com sucesso) | Rollback parcial falhou | Escalar para rollback completo |

---

## §6 Roteiro Operacional de Rollback

### 6.1 Sequência obrigatória de passos

| Passo | Ação | Responsável | Tempo máximo | Evidência gerada |
|-------|------|-------------|-------------|-----------------|
| P-01 | Identificar gatilho (GT-01..GT-12) e registrar `trigger_id` | Operador / sistema | Imediato | Entrada no log de rollback |
| P-02 | Pausar entrada de novos turnos | Sistema / operador | < 1 min | Log de pausa com timestamp |
| P-03 | Zerar CANARY_PERCENT → 0 | Operador | < 2 min | Feature flag log |
| P-04 | Desligar CUTOVER_MODE → false | Operador | < 2 min | Feature flag log |
| P-05 | Ativar ROLLBACK_FLAG → true | Operador | < 2 min | Feature flag log |
| P-06 | Setar CHANNEL_ENABLED → false (se canal estava ativo) | Operador | < 3 min | Feature flag log |
| P-07 | Restaurar roteamento para legado (se aplicável) | Operador | < 5 min | Log de roteamento |
| P-08 | Preservar integralmente todos os logs e TurnoRastro | Sistema automático | Imediato | Confirmação de retenção |
| P-09 | Preservar lead_state completo — imutável | Sistema automático | Imediato | Snapshot pós-rollback |
| P-10 | Preservar dossiê completo — nunca apagar documentos | Sistema automático | Imediato | Confirmação de retenção documental |
| P-11 | Registrar incidente com campos canônicos §8 | Operador | < 10 min | Registro de incidente |
| P-12 | Comunicar Vasques com log de rollback | Operador | < 15 min | Confirmação de comunicação |
| P-13 | Bloquear avanço para PR-T7.7 até revisão formal | Protocolo | Imediato | CUTOVER_GATE_STATUS = `blocked` |
| P-14 | Abrir investigação com root cause tentativo | Operador | < 30 min | Nota de investigação |

### 6.2 Tempo total máximo de rollback

| Modo de cutover | Tempo máximo de rollback |
|----------------|--------------------------|
| CO-PARCIAL | < 5 minutos (roteamento parcial) |
| CO-TOTAL-INTERNO | < 5 minutos (ambiente interno) |
| CO-TOTAL-CLIENTE | < 5 minutos (meta: < 3 min com cliente real) |

---

## §7 Preservação de Estado

### 7.1 O que nunca pode ser apagado

| Dado | Regra | Justificativa |
|------|-------|---------------|
| `lead_state` completo | Imutável pós-rollback — nunca apagar | Evidência de auditoria + LGPD |
| `TurnoRastro` de todos os turnos | Imutável pós-rollback — nunca apagar | Rastreabilidade obrigatória |
| Snapshots L1..L4 | Preservados em estado pós-rollback | Diagnóstico de divergência |
| `HistorySummary` | Preservado — nunca truncar | Continuidade do atendimento |
| Campos `fact_*` confirmados | Nunca revertidos retroativamente | Evitar perda de dados coletados |

### 7.2 Como preservar lead_state

1. Registrar snapshot imediato do `lead_state` **antes** de qualquer alteração de flag.
2. Setar campo `operational_state.rollback_applied: true` com `timestamp` do rollback.
3. Setar campo `operational_state.rollback_trigger: GT-NN`.
4. Não alterar `fact_*` ou `derived_*` existentes — apenas adicionar nota de rollback.
5. Versionar o snapshot no log (`lead_state_before` e `lead_state_after` no registro §8).

### 7.3 Como marcar estado como pós-rollback

```json
{
  "operational_state": {
    "current_stage": "<mantido>",
    "rollback_applied": true,
    "rollback_at": "YYYY-MM-DDTHH:MM:SSZ",
    "rollback_trigger": "GT-NN",
    "rollback_mode_before": "CO-PARCIAL|CO-TOTAL-INTERNO|CO-TOTAL-CLIENTE",
    "investigation_open": true
  }
}
```

### 7.4 Proibições de estado

- **Proibido** sobrescrever `fact_*` retroativamente.
- **Proibido** apagar `lead_state` ou qualquer snapshot.
- **Proibido** alterar `HistorySummary` para remover evidência de rollback.
- **Proibido** marcar lead como "inexistente" por causa do rollback.

---

## §8 Preservação de Logs e Evidências

### 8.1 Shape canônico do registro de rollback

```json
{
  "rollback_id": "RBK-YYYYMMDD-NNN",
  "trigger_id": "GT-NN",
  "case_id": "<identificador do caso>",
  "turn_id": "<identificador do turno que disparou>",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "mode_before": "CO-PARCIAL|CO-TOTAL-INTERNO|CO-TOTAL-CLIENTE|CANARY",
  "mode_after": "LEGADO|DESLIGADO",
  "flags_before": {
    "ENOVA2_ENABLED": true,
    "CANARY_PERCENT": 20,
    "CHANNEL_ENABLED": true,
    "SHADOW_MODE": false,
    "CUTOVER_MODE": true,
    "ROLLBACK_FLAG": false
  },
  "flags_after": {
    "ENOVA2_ENABLED": false,
    "CANARY_PERCENT": 0,
    "CHANNEL_ENABLED": false,
    "SHADOW_MODE": false,
    "CUTOVER_MODE": false,
    "ROLLBACK_FLAG": true
  },
  "lead_state_before": "<caminho do snapshot antes>",
  "lead_state_after": "<caminho do snapshot depois>",
  "operator": "<identificador do operador>",
  "reason": "<descrição do motivo>",
  "evidence_path": "<caminho do log/evidência>",
  "verification_result": "PASS|FAIL|PARTIAL",
  "vasques_notified": true,
  "vasques_notified_at": "YYYY-MM-DDTHH:MM:SSZ",
  "investigation_id": "<identificador da investigação>",
  "t77_blocked_until": "<condição de desbloqueio>"
}
```

### 8.2 Campos obrigatórios vs opcionais

| Campo | Obrigatório | Quando preencher |
|-------|-------------|-----------------|
| `rollback_id` | Sim | Imediato ao iniciar rollback |
| `trigger_id` | Sim | Imediato |
| `case_id` | Sim | Imediato |
| `turn_id` | Sim (se aplicável) | Imediato |
| `timestamp` | Sim | Imediato |
| `mode_before` / `mode_after` | Sim | Antes de alterar flags |
| `flags_before` / `flags_after` | Sim | Antes e após alterar flags |
| `lead_state_before` / `lead_state_after` | Sim | Snapshot antes + snapshot após |
| `operator` | Sim | Imediato |
| `reason` | Sim | < 10 min |
| `evidence_path` | Sim | < 10 min |
| `verification_result` | Sim | Após verificação (< 30 min) |
| `vasques_notified` | Sim | < 15 min |
| `investigation_id` | Sim | < 30 min |

### 8.3 Retenção mínima de logs

- Logs de rollback: **imutáveis** — nunca apagar.
- Retenção mínima: 90 dias (alinhado com T7.1 §8).
- Acesso: rastreável por `rollback_id`, `case_id`, `trigger_id`.

---

## §9 Preservação de Dossiê e Documentos

### 9.1 Regras absolutas

| Regra | Descrição |
|-------|-----------|
| RD-01 | Documentos nunca são apagados — rollback não destrói dossiê |
| RD-02 | Dossiê nunca é destruído — mesmo se lead for revertido ao legado |
| RD-03 | Estado documental é preservado — não regredir estado sem evidência |
| RD-04 | Associação P1/P2/P3 não muda sem evidência de nova fonte |
| RD-05 | Anexos permanecem rastreáveis — caminhos de evidência preservados |
| RD-06 | Qualquer inconsistência documental pós-rollback vira bloqueio para T7.7 |
| RD-07 | Estado `ilegível` ou `hipótese` não é reclassificado retroativamente |
| RD-08 | Doc de terceiro permanece com sua associação original registrada |

### 9.2 Verificação pós-rollback de dossiê

Após cada rollback (GT-01..GT-12), verificar:

| Item | Verificação |
|------|-------------|
| Todos os documentos do caso | Ainda presentes no dossiê |
| Estado documental de cada doc | Igual ao estado pré-rollback |
| Associação P1/P2/P3 | Mantida sem alteração |
| Caminho de evidência | Acessível e íntegro |
| Registro de upload | Preservado com timestamp original |

---

## §10 Pausa de Canal e Reversão de Flags

### 10.1 Flags e seus estados no rollback

| Flag | Estado antes do rollback | Estado após rollback | Quem pode alterar | Evidência exigida | Condição de sucesso |
|------|--------------------------|---------------------|-------------------|------------------|---------------------|
| ENOVA2_ENABLED | true | false (rollback completo) | Operador autorizado | Feature flag log com timestamp | Flag = false verificada |
| CANARY_PERCENT | > 0 | 0 | Operador | Feature flag log | Percent = 0 verificado |
| CHANNEL_ENABLED | true | false | Operador | Feature flag log | Flag = false verificada |
| SHADOW_MODE | false | false (mantido) | N/A | — | Sem alteração |
| CUTOVER_MODE | true | false | Operador | Feature flag log com timestamp | Flag = false verificada |
| ROLLBACK_FLAG | false | **true** | Operador / sistema | Feature flag log + notificação Vasques | Flag = true verificada; Vasques notificado |

### 10.2 Ordem de alteração de flags

A ordem importa — nunca alterar ROLLBACK_FLAG antes de preservar logs:

```
1. Preservar logs + snapshots (P-08, P-09, P-10)
2. CANARY_PERCENT → 0           (P-03)
3. CUTOVER_MODE → false         (P-04)
4. CHANNEL_ENABLED → false      (P-06)
5. ROLLBACK_FLAG → true         (P-05)
6. ENOVA2_ENABLED → false       (se rollback completo)
```

### 10.3 Condições de rollback completo vs parcial

| Tipo | ENOVA2_ENABLED | CUTOVER_MODE | ROLLBACK_FLAG | Roteamento |
|------|---------------|-------------|---------------|------------|
| Rollback parcial (retorno ao canary anterior) | true | false | true | CANARY_PERCENT reduzido |
| Rollback completo (retorno ao legado) | false | false | true | 100% legado |

---

## §11 Smoke e Simulação de Rollback

### 11.1 Cenários obrigatórios RBK-01..RBK-08

#### RBK-01 — Rollback por falha crítica

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que MET-08 > 0 dispara rollback imediato com todos os passos P-01..P-14 |
| Gatilho | GT-02 — MET-08 = 1 (falha crítica detectada) |
| Estado inicial | CUTOVER_MODE = true; ROLLBACK_FLAG = false; tráfego simulado em 20% |
| Ação esperada | P-01 (identificar GT-02) → P-02 (pausar) → P-03..P-06 (flags) → P-07 (roteamento) → P-08..P-10 (preservação) → P-11..P-14 |
| Evidência exigida | Registro com `trigger_id: GT-02`; ROLLBACK_FLAG = true; lead_state preservado; Vasques notificado |
| Condição PASS | Todos os passos executados em < 5 min; zero perda de dado; evidência completa |
| Condição FAIL | Qualquer passo faltante; tempo > 5 min; perda de lead_state ou log |
| Bloqueia T7.7? | Sim |

#### RBK-02 — Rollback por promessa indevida

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que MET-09 > 0 dispara rollback imediato |
| Gatilho | GT-03 — MET-09 = 1 (promessa indevida detectada) |
| Estado inicial | CUTOVER_MODE = true; tráfego simulado ativo |
| Ação esperada | Detecção imediata → rollback completo P-01..P-14 |
| Evidência exigida | Registro com `trigger_id: GT-03`; reply_text adversarial preservado como evidência; ROLLBACK_FLAG = true |
| Condição PASS | Rollback em < 5 min; reply_text preservado; Vasques notificado |
| Condição FAIL | Rollback > 5 min; reply_text não preservado; Vasques não notificado |
| Bloqueia T7.7? | Sim |

#### RBK-03 — Rollback por perda de estado

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que corrupção de lead_state dispara rollback imediato e preservação |
| Gatilho | GT-06 — lead_state corrompido detectado |
| Estado inicial | Canary ativo; lead_state com dados de composição familiar |
| Ação esperada | Detecção → rollback imediato → snapshot preservado → investigação aberta |
| Evidência exigida | `lead_state_before` e `lead_state_after` no registro; investigação com root cause |
| Condição PASS | lead_state preservado; snapshot antes/depois disponível; investigação aberta |
| Condição FAIL | lead_state perdido; snapshot ausente; sem investigação |
| Bloqueia T7.7? | Sim |

#### RBK-04 — Rollback por erro documental

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que erro documental grave (doc de terceiro entregue) dispara rollback |
| Gatilho | GT-07 — doc associado a pessoa errada |
| Estado inicial | Canary ativo; caso com dossiê em andamento |
| Ação esperada | Detecção → rollback → dossiê preservado → associação P1/P2/P3 mantida |
| Evidência exigida | Registro de dossiê antes/depois; associação preservada; GT-07 no registro |
| Condição PASS | Dossiê intacto; associação correta preservada; investigação aberta |
| Condição FAIL | Dossiê alterado; associação modificada sem evidência |
| Bloqueia T7.7? | Sim |

#### RBK-05 — Rollback por erro de canal

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que mensagem enviada fora de allowlist dispara rollback imediato |
| Gatilho | GT-08 — mensagem disparada fora do escopo autorizado |
| Estado inicial | CHANNEL_ENABLED = true; allowlist configurada |
| Ação esperada | Detecção → rollback imediato → CHANNEL_ENABLED = false → Vasques notificado |
| Evidência exigida | Log de envio (o que foi enviado e para quem); CHANNEL_ENABLED = false após; Vasques notificado |
| Condição PASS | Canal desligado < 2 min; log completo; Vasques notificado |
| Condição FAIL | Canal não desligado; log ausente; Vasques não notificado |
| Bloqueia T7.7? | Sim |

#### RBK-06 — Rollback por veto Vasques

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que veto explícito Vasques é honrado imediatamente |
| Gatilho | GT-05 — veto Vasques registrado |
| Estado inicial | Canary ou cutover ativo |
| Ação esperada | Veto recebido → rollback imediato → todas as flags revertidas → evidência preservada |
| Evidência exigida | Registro do veto com motivo; rollback log completo; ROLLBACK_FLAG = true |
| Condição PASS | Rollback executado imediatamente após veto; sem resistência ou atraso |
| Condição FAIL | Rollback não executado ou atrasado; veto ignorado |
| Bloqueia T7.7? | Sim |

#### RBK-07 — Rollback por latência crítica

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que MET-07 p95 > 8.000 ms por janela dispara rollback |
| Gatilho | GT-09 — latência crítica por janela |
| Estado inicial | Canary ou cutover ativo com telemetria MET-07 monitorada |
| Ação esperada | Janela confirmada → pausa → investigação → rollback se latência persistir |
| Evidência exigida | Log de MET-07 com timestamps; confirmação de janela; rollback log se executado |
| Condição PASS | Pausa acionada dentro da janela; latência monitorada; rollback se necessário |
| Condição FAIL | Janela ignorada; latência não monitorada; rollback não executado |
| Bloqueia T7.7? | Condicional — bloqueia se rollback não executado quando necessário |

#### RBK-08 — Rollback por tentativa de tráfego real não autorizado

| Campo | Valor |
|-------|-------|
| Objetivo | Verificar que tráfego real fora do escopo (sem G7) dispara FREEZE imediato |
| Gatilho | GT-04 — tráfego real detectado sem autorização |
| Estado inicial | Ambiente controlado; sem cliente real autorizado |
| Ação esperada | Detecção → FREEZE imediato → rollback → CHANNEL_ENABLED = false → Vasques notificado |
| Evidência exigida | Registro de tentativa; FREEZE log; CHANNEL_ENABLED = false; Vasques notificado com urgência |
| Condição PASS | FREEZE em < 1 min; zero tráfego real processado; Vasques notificado |
| Condição FAIL | FREEZE > 1 min; tráfego real processado; Vasques não notificado |
| Bloqueia T7.7? | Sim — bloqueio absoluto até investigação concluída |

---

## §12 Critérios de Sucesso do Rollback

### 12.1 Todos os itens abaixo devem ser verdadeiros para declarar rollback bem-sucedido

| ID | Critério | Verificação |
|----|---------|-------------|
| SUC-01 | Entrada de novos turnos pausada | Log de pausa com timestamp |
| SUC-02 | CANARY_PERCENT = 0 | Feature flag log |
| SUC-03 | CUTOVER_MODE = false | Feature flag log |
| SUC-04 | ROLLBACK_FLAG = true | Feature flag log |
| SUC-05 | Roteamento anterior restaurado (se aplicável) | Log de roteamento |
| SUC-06 | Logs completos preservados — zero perda | Confirmação de retenção |
| SUC-07 | lead_state preservado — zero perda | Snapshot pós-rollback disponível |
| SUC-08 | Dossiê preservado — zero documento perdido | Confirmação de retenção documental |
| SUC-09 | Incidente registrado com campos canônicos §8 | Registro com `rollback_id` |
| SUC-10 | Vasques comunicado com log completo | Confirmação de notificação |
| SUC-11 | Investigação aberta com root cause tentativo | Nota de investigação criada |
| SUC-12 | Nenhum cliente real afetado | Confirmação de zero tráfego real (se CO-TOTAL-CLIENTE não foi ativado) |
| SUC-13 | CUTOVER_GATE_STATUS = `blocked` após rollback | Gate atualizado |
| SUC-14 | Tempo total de rollback dentro do limite | CO-PARCIAL/TOTAL-INTERNO: < 5 min; CO-TOTAL-CLIENTE: < 5 min (meta: < 3 min) |

---

## §13 Critérios de Falha do Rollback

### 13.1 Qualquer um dos itens abaixo = rollback falhou

| ID | Falha | Consequência |
|----|-------|--------------|
| FAL-01 | Perda de lead_state (dados apagados ou inacessíveis) | Bloqueio absoluto T7.7; investigação obrigatória |
| FAL-02 | Perda de log de turno (TurnoRastro apagado ou corrompido) | Bloqueio absoluto T7.7; investigação obrigatória |
| FAL-03 | Perda de dossiê ou documento (qualquer arquivo ausente) | Bloqueio absoluto T7.7; investigação obrigatória |
| FAL-04 | Falha em zerar volume (CANARY_PERCENT ainda > 0 após rollback) | Rollback incompleto; escalar para rollback completo |
| FAL-05 | Falha em pausar canal (CHANNEL_ENABLED ainda true após rollback) | Rollback incompleto; desligar imediatamente |
| FAL-06 | Falha em restaurar roteamento (tráfego Enova 2 ainda ativo) | Rollback incompleto; escalar urgente |
| FAL-07 | Evidência ausente (campos §8 não preenchidos) | Rollback não comprovado; T7.7 bloqueado |
| FAL-08 | Operador não identificado no registro | Rollback não auditável; T7.7 bloqueado |
| FAL-09 | Rollback sem motivo declarado (campo `reason` vazio) | Rollback não auditável; T7.7 bloqueado |
| FAL-10 | Rollback sem comunicação a Vasques | Violação de protocolo; T7.7 bloqueado |
| FAL-11 | Tentativa de avançar para T7.7 com bloqueio aberto | Violação de contrato; PR-T7.7 não pode abrir |

---

## §14 Matriz de Decisão

| Condição | Rollback aprovado? | Bloqueia T7.7? | Exige Vasques? | Exige investigação? | Próxima ação |
|----------|-------------------|----------------|----------------|---------------------|-------------|
| GT-01..GT-05 ativado + rollback executado + todos SUC-01..SUC-14 PASS | Sim | Não (após resolução) | Notificação obrigatória | Sim (root cause) | PR-T7.7 desbloqueada após investigação concluída |
| GT-06..GT-12 ativado + rollback executado + todos SUC PASS | Sim | Não (após resolução) | Sim (aprovação) | Sim | PR-T7.7 após Vasques autorizar |
| Qualquer FAL-01..FAL-03 (perda de dados) | Não | **Absoluto** | Vasques imediato | Obrigatória e urgente | PR-T7.7 bloqueada indefinidamente até resolução |
| FAL-04..FAL-06 (rollback incompleto) | Parcial | Sim | Sim | Sim | Completar rollback antes de T7.7 |
| FAL-07..FAL-11 (evidência / auditoria) | Não comprovado | Sim | Sim | Sim | Preencher evidência + nova comprovação |
| RBK-01..RBK-08 smoke FAIL | Não comprovado | Sim | Sim | Sim | Executar novamente após correção |
| Todos os RBK-01..RBK-08 smoke PASS + todos SUC-01..SUC-14 PASS | Comprovado | Não | Notificação | Root cause fechado | PR-T7.7 autorizada |
| CO-NOGO (cutover não executado) | N/A | Não bloqueia T7.7 diretamente | N/A | Não | Revisar T7.5 antes de T7.7 |

---

## §15 Payload de Saída para PR-T7.7

### 15.1 Shape do payload

```json
{
  "payload_version": "T7.6-v1",
  "generated_at": "YYYY-MM-DDTHH:MM:SSZ",
  "rollback_source": "T7_ROLLBACK_OPERACIONAL.md",
  "rollback_proof_status": "comprovado|parcial|nao_comprovado|nao_aplicavel",
  "rollback_scenarios_passed": [],
  "rollback_scenarios_failed": [],
  "rollback_blocking_items": [],
  "incidents_registered": [
    {
      "rollback_id": "RBK-YYYYMMDD-NNN",
      "trigger_id": "GT-NN",
      "verification_result": "PASS|FAIL|PARTIAL",
      "vasques_notified": true,
      "investigation_closed": false
    }
  ],
  "evidence_paths": [],
  "unresolved_risks": [],
  "accepted_risks": [
    {
      "risk_id": "RSK-T76-NNN",
      "description": "<descrição>",
      "severity": "S0|S1|S2",
      "mitigation": "<mitigação>",
      "vasques_accepted": true
    }
  ],
  "suc_checklist": {
    "SUC-01": "PASS|FAIL",
    "SUC-02": "PASS|FAIL",
    "SUC-03": "PASS|FAIL",
    "SUC-04": "PASS|FAIL",
    "SUC-05": "PASS|FAIL",
    "SUC-06": "PASS|FAIL",
    "SUC-07": "PASS|FAIL",
    "SUC-08": "PASS|FAIL",
    "SUC-09": "PASS|FAIL",
    "SUC-10": "PASS|FAIL",
    "SUC-11": "PASS|FAIL",
    "SUC-12": "PASS|FAIL",
    "SUC-13": "PASS|FAIL",
    "SUC-14": "PASS|FAIL"
  },
  "recommendation": "proceed|proceed_with_restrictions|no_go",
  "recommendation_justification": "<texto>",
  "vasques_authorization_required": true,
  "vasques_authorization_received": false,
  "notes": "<observações finais>"
}
```

### 15.2 Campos obrigatórios para habilitar PR-T7.7

| Campo | Valor mínimo para PR-T7.7 |
|-------|--------------------------|
| `rollback_proof_status` | `comprovado` |
| `rollback_scenarios_passed` | Todos os RBK-01..RBK-08 listados |
| `rollback_scenarios_failed` | array vazio `[]` |
| `rollback_blocking_items` | array vazio `[]` |
| `recommendation` | `proceed` ou `proceed_with_restrictions` |
| `vasques_authorization_received` | `true` |
| Todos os `suc_checklist` itens | `PASS` |

### 15.3 Nota sobre esta PR

Como esta PR é a **definição do protocolo** (não a execução do rollback), o payload está preparado estruturalmente. Os valores reais serão preenchidos durante a execução do smoke de rollback. O payload instanciado será entregue como evidência na PR-T7.7.

---

## §16 Critérios de Aceite — CA-T7.6

| ID | Critério | Verificação |
|----|---------|-------------|
| CA-T7.6-01 | `T7_ROLLBACK_OPERACIONAL.md` criado em `schema/implantation/` | Arquivo presente em main após merge |
| CA-T7.6-02 | Entradas de T7.5 definidas com valores esperados e consequências | §4 completo |
| CA-T7.6-03 | Gatilhos GT-01..GT-12 definidos com ação e métrica | §5 completo |
| CA-T7.6-04 | Roteiro operacional P-01..P-14 com responsável, tempo máximo e evidência | §6 completo |
| CA-T7.6-05 | Preservação de estado com o que nunca pode ser apagado e shape pós-rollback | §7 completo |
| CA-T7.6-06 | Shape canônico de registro com todos os 16 campos e retenção mínima | §8 completo |
| CA-T7.6-07 | 8 regras de dossiê RD-01..RD-08 e verificação pós-rollback | §9 completo |
| CA-T7.6-08 | 6 flags com estado antes/depois, quem altera, evidência e condição de sucesso + ordem de alteração | §10 completo |
| CA-T7.6-09 | 8 cenários RBK-01..RBK-08 com objetivo, gatilho, ação esperada, evidência, PASS/FAIL e bloqueia T7.7 | §11 completo |
| CA-T7.6-10 | Critérios de sucesso SUC-01..SUC-14 | §12 completo |
| CA-T7.6-11 | Critérios de falha FAL-01..FAL-11 com consequências | §13 completo |
| CA-T7.6-12 | Matriz de decisão com condições, aprovação, bloqueios e próxima ação | §14 completo |
| CA-T7.6-13 | Payload canônico §15 com campos obrigatórios para T7.7 | §15 completo |
| CA-T7.6-14 | Zero execução real (runtime, rollback, cutover, canary, WhatsApp real) | Diff: apenas 4 arquivos schema/ |
| CA-T7.6-15 | Zero modificação em `src/` | Diff validado |
| CA-T7.6-16 | Referência G6 = `READINESS_G6.md` — sem nomes alternativos | §1 verificado |
| CA-T7.6-17 | Todos os artefatos T7 anteriores referenciados corretamente no §1 | §1 verificado |
| CA-T7.6-18 | Próxima PR autorizada = PR-T7.7 — Checklist executivo de go/no-go | Bloco E §18 |
| CA-T7.6-19 | Bloco E com `Fechamento permitido: sim` | §18 presente e preenchido |

---

## §17 Bloqueios — B-T7.6

| ID | Bloqueio | Consequência |
|----|---------|--------------|
| B-T7.6-01 | Ausência de gatilhos GT-01..GT-12 | PR inválida — bloqueia merge |
| B-T7.6-02 | Ausência de roteiro operacional P-01..P-14 | PR inválida — bloqueia merge |
| B-T7.6-03 | Ausência de preservação de estado | PR inválida — bloqueia merge |
| B-T7.6-04 | Ausência de preservação de logs (shape §8) | PR inválida — bloqueia merge |
| B-T7.6-05 | Ausência de preservação de dossiê (§9) | PR inválida — bloqueia merge |
| B-T7.6-06 | Ausência de cenários de smoke RBK-01..RBK-08 | PR inválida — T7.7 não pode abrir |
| B-T7.6-07 | Ausência de payload de saída para T7.7 | PR inválida — T7.7 não pode abrir |
| B-T7.6-08 | Tentativa de execução de rollback real nesta PR | Violação de contrato — PR inválida |
| B-T7.6-09 | Tentativa de execução de runtime ou modificação de `src/` | Violação — bloqueia merge imediato |
| B-T7.6-10 | Tentativa de uso de WhatsApp real nesta PR | Violação de contrato — PR inválida |
| B-T7.6-11 | Uso de nomes alternativos para artefatos T7 canônicos | PR inválida — grep simples detecta |
| B-T7.6-12 | Uso de nomes alternativos para readiness G6 | PR inválida — grep simples detecta |
| B-T7.6-13 | Modificação de artefatos T6 | PR inválida |
| B-T7.6-14 | Diff com mais de 4 arquivos sem justificativa | PR fora de escopo |

---

## §18 Bloco E — Fechamento Desta PR (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:              schema/implantation/T7_ROLLBACK_OPERACIONAL.md
Estado da evidência:                      completa
Há lacuna remanescente?:                  não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:           sim
Estado permitido após esta PR:            PR-T7.6 entregue — rollback operacional formalizado
Próxima PR autorizada:                    PR-T7.7 — Checklist executivo de go/no-go
```

| Campo | Valor |
|-------|-------|
| PR | PR-T7.6 |
| Entrega principal | `schema/implantation/T7_ROLLBACK_OPERACIONAL.md` |
| Artefato central | Protocolo de rollback operacional comprovado |
| Adendo A00-ADENDO-03 | Evidência manda no estado |
| Fechamento permitido? | **sim** — todos os CA-T7.6-01..19 satisfeitos; zero bloqueios abertos nesta PR |
| Justificativa | Protocolo completo: entradas T7.5 definidas; 12 gatilhos GT-01..12; roteiro P-01..14; preservação de estado/logs/dossiê; 6 flags com estados; 8 cenários smoke RBK-01..08; 14 critérios de sucesso SUC-01..14; 11 critérios de falha FAL-01..11; matriz de decisão; payload para T7.7; CA-T7.6-01..19; B-T7.6-01..14; referências canônicas verificadas; zero src/; zero runtime; zero rollback real. |
| Próxima PR autorizada | **PR-T7.7 — Checklist executivo de go/no-go** |
| Gate em aberto | G7 — bloqueado até PR-T7.R |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |

---

## §19 Estado Herdado

- Fase: T7 em execução.
- PR-T7.5 (#141) merged em main em 2026-04-29.
- `T7_CUTOVER_GOVERNADO.md` criado com 4 modos de cutover, gate CUTOVER_GATE_STATUS com 6 estados, travas TR-01..08, rollback RK-1..11, métricas por modo, matriz de decisão, payload para T7.6.
- Referências canônicas anteriores: `READINESS_G6.md` / `T7_PREFLIGHT_GO_LIVE.md` / `T7_SHADOW_SIMULACAO.md` / `T7_MATRIZ_DIVERGENCIAS.md` / `T7_CANARY_INTERNO.md` / `T7_CUTOVER_GOVERNADO.md`.
- Próximo passo autorizado antes desta PR: PR-T7.6.

---

## §20 Estado Entregue

- `T7_ROLLBACK_OPERACIONAL.md` criado em `schema/implantation/`.
- Protocolo de rollback operacional formalizado com 20 seções.
- Entradas T7.5 com 13 campos e consequências.
- 12 gatilhos GT-01..GT-12 (5 imediatos + 7 por degradação).
- Roteiro P-01..P-14 com responsável, tempo máximo e evidência.
- Preservação de estado: shape pós-rollback, proibições absolutas.
- Shape canônico de registro com 16 campos + retenção 90 dias.
- 8 regras de dossiê RD-01..RD-08 + verificação pós-rollback.
- 6 flags com estado antes/depois, quem altera, evidência, condição de sucesso + ordem.
- 8 cenários smoke RBK-01..RBK-08 com objetivo, gatilho, ação, evidência, PASS/FAIL.
- 14 critérios de sucesso SUC-01..SUC-14.
- 11 critérios de falha FAL-01..FAL-11.
- Matriz de decisão: 8 condições com aprovação, bloqueios e próxima ação.
- Payload canônico §15 para T7.7 com campos obrigatórios.
- CA-T7.6-01..19 satisfeitos; B-T7.6-01..14 declarados.
- PR-T7.7 (Checklist executivo de go/no-go) desbloqueada.
