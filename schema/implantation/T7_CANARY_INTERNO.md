# T7_CANARY_INTERNO — Canary Interno e Pré-produção

## §1 Meta

| Campo | Valor |
|-------|-------|
| PR | PR-T7.4 |
| Fase | T7 — Shadow, simulação, canary, cutover e rollback |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |
| Referência G6 | `schema/implantation/READINESS_G6.md` |
| Referência G6 canônica | `READINESS_G6.md` — **nunca** `T6_READINESS_CLOSEOUT_G6.md` |
| Pré-flight | `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` |
| Pré-flight canônico | `T7_PREFLIGHT_GO_LIVE.md` — **nunca** `T7_PREFLIGHT_GOLIIVE.md` |
| Simulação | `schema/implantation/T7_SHADOW_SIMULACAO.md` |
| Matriz | `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` |
| Canary (este artefato) | `schema/implantation/T7_CANARY_INTERNO.md` — **nunca** `T7_CANARY_CONTROLADO.md` |
| Data | 2026-04-29 |
| Gate anterior | G6 — APROVADO em 2026-04-28 |
| Gate aberto | G7 — go-live controlado (bloqueado até PR-T7.R) |
| Status | entregue |
| Fecha | canary interno / pré-produção |
| Próxima PR autorizada | PR-T7.5 — Cutover parcial ou total governado |
| Adendo soberania IA | `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) |
| Adendo MCMV | `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) |
| Adendo fechamento | `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) |

---

## §2 Objetivo

Este documento formaliza o **canary interno/pré-produção da Enova 2**: a etapa controlada de operação em ambiente não comercial, com volume mínimo e reversível, imediatamente anterior ao cutover parcial ou total.

Objetivos específicos:

1. **Definir o ambiente e o canal permitido** para canary interno — nunca cliente real sem autorização explícita posterior.
2. **Definir volumes iniciais, passos de expansão e condições de retorno a 0%** — Caminho A e Caminho B diferenciados.
3. **Formalizar as métricas mínimas MET-01..MET-10** e os thresholds de avançar, pausar e rollback.
4. **Declarar os critérios de pausa e de rollback** com ações específicas e preservação de evidência.
5. **Definir a janela de observação** mínima por etapa — tempo, volume de turnos/casos e amostra.
6. **Mapear a matriz de aprovação humana** — quem aprova cada avanço, quando Vasques é obrigatório.
7. **Formalizar a relação Caminho A vs Caminho B** no contexto do canary.
8. **Entregar o payload canônico de saída para PR-T7.5** (cutover parcial ou total governado).

Esta PR **não entrega runtime**. Não toca `src/`. Não usa WhatsApp real. Não realiza canary real. Não abre Supabase novo. Não executa shadow real. Não executa cutover. Todo artefato é declarativo/documental.

---

## §3 Premissa Operacional

### 3.1 A Enova 2 ainda NÃO atende clientes reais

**Esta é a premissa operacional determinante de T7.** A Enova 2 ainda não está em operação comercial. Não há clientes reais em atendimento — nem no legado nem na Enova 2.

Consequências diretas para esta PR:

- Canary interno não é abertura comercial.
- Esta PR não executa canary real em ambiente de produção.
- Esta PR não conecta WhatsApp real, Meta real ou Supabase produtivo novo.
- Esta PR formaliza o **protocolo e os critérios** do canary — a execução real ocorre após aprovação explícita na PR-T7.4 operacional.

### 3.2 Canary interno vs cliente real

| Dimensão | Canary Interno (este documento) | Cliente Real |
|----------|---------------------------------|--------------|
| Ambiente | Controlado / pré-produção / allowlist | Produção aberta |
| Volume | Mínimo, limitado, reversível | Progressivo → total |
| Autorização | Técnica interna + Vasques para expansão | Vasques + decisão executiva |
| Rollback | Automático por trigger de pausa | Plano formal T7.6 |
| Telemetria | Obrigatória e monitorada em tempo real | Obrigatória e monitorada |
| Gate | Não fecha G7 | Fecha G7 via PR-T7.R |
| WhatsApp real | Proibido sem autorização explícita | Autorizado após G7 |

### 3.3 Pré-condição absoluta: matriz T7.3 libera canary

Canary interno **só pode ocorrer** se a matriz T7.3 (`T7_MATRIZ_DIVERGENCIAS.md`) tiver emitido:

- `approved_for_canary: true`
- `recommendation: proceed` ou `proceed_with_restrictions`
- Zero DIV-RM abertas
- Zero DIV-BA abertas
- Zero hardenings `bloqueia_t74: true` pendentes

### 3.4 Limites desta PR

- Zero `reply_text` gerado.
- Zero `fact_*` novo declarado.
- Zero modificação em `src/`.
- Zero artefatos T6 recriados ou modificados.
- Zero shadow real, canary real ou cutover real.
- Zero WhatsApp real ou Meta real.
- Referência G6 é `READINESS_G6.md` — nunca `T6_READINESS_CLOSEOUT_G6.md`.
- Referência preflight é `T7_PREFLIGHT_GO_LIVE.md` — nunca `T7_PREFLIGHT_GOLIIVE.md`.
- Este artefato é `T7_CANARY_INTERNO.md` — nunca `T7_CANARY_CONTROLADO.md`.

---

## §4 Pré-condições para Canary

### 4.1 Checklist obrigatório — todas as condições devem ser PASS antes do canary

| ID | Pré-condição | Evidência exigida | Status esperado |
|----|-------------|-------------------|-----------------|
| PC-01 | G6 APROVADO | `schema/implantation/READINESS_G6.md` — veredito G6 = APROVADO | PASS |
| PC-02 | PR-T7.1 entregue e merged | `schema/implantation/T7_PREFLIGHT_GO_LIVE.md` presente em main | PASS |
| PC-03 | PR-T7.2 entregue e merged | `schema/implantation/T7_SHADOW_SIMULACAO.md` presente em main | PASS |
| PC-04 | PR-T7.3 entregue e merged | `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` presente em main | PASS |
| PC-05 | Nenhuma DIV-RM aberta | Payload T7.3 §12: `DIV-RM: 0` no campo `unresolved_divergences` | PASS |
| PC-06 | Nenhuma DIV-BA aberta | Payload T7.3 §12: `DIV-BA: 0` no campo `unresolved_divergences` | PASS |
| PC-07 | Nenhum hardening bloqueante (`bloqueia_t74: true`) pendente | Tabela HD-T73 com todos os `bloqueia_t74: true` em status `concluido` | PASS |
| PC-08 | Plano de rollback mapeado | `T7_PREFLIGHT_GO_LIVE.md` §5 completo; flags ROLLBACK_FLAG e CANARY_PERCENT definidos | PASS |
| PC-09 | Telemetria mínima definida | MET-01..MET-10 com thresholds definidos em T7.1 §5 e confirmados em T7.3 §7 | PASS |
| PC-10 | Feature flags e mecanismo de desligamento mapeados | `ENOVA2_ENABLED`, `CANARY_PERCENT`, `CHANNEL_ENABLED`, `SHADOW_MODE`, `CUTOVER_MODE`, `ROLLBACK_FLAG` definidos em T7.1 §3 | PASS |
| PC-11 | G7 ainda bloqueado até PR-T7.R | `schema/contracts/_INDEX.md` — G7 = bloqueado até PR-T7.R | PASS (G7 não fecha aqui) |
| PC-12 | Matriz T7.3 com `approved_for_canary: true` | Payload §12 de T7.3 | PASS |

### 4.2 Bloqueio imediato

Se qualquer item PC-01..PC-12 estiver com status diferente de PASS:

- Canary não avança.
- Registrar motivo no log de decisão.
- Resolver o bloqueio com evidência antes de qualquer operação.
- Não há exceção — nem Caminho B dispensa estas pré-condições.

---

## §5 Ambiente e Canal Permitido

### 5.1 Ambientes autorizados para canary interno

| ID | Ambiente | Descrição | Requer autorização Vasques? |
|----|---------|-----------|----------------------------|
| AMB-01 | Canary interno simulado | Ambiente de simulação controlada com leads sintéticos e histórico replay — sem cliente real | Não (técnico) |
| AMB-02 | Pré-produção | Ambiente espelho de produção, sem tráfego real, com dados anonimizados ou sintéticos | Não (técnico) |
| AMB-03 | Canal controlado via allowlist | Canal WhatsApp configurado somente para números da lista allowlist definida internamente | Sim — antes de ligar canal |
| AMB-04 | Canal interno Vasques | Testes diretos com o Vasques no canal de produção, sem outros usuários | Sim — Vasques autoriza |

### 5.2 Proibições absolutas de ambiente nesta PR

- Nunca usar canal aberto (sem allowlist) antes de PR-T7.5.
- Nunca conectar número comercial/público sem autorização explícita.
- Nunca disparar mensagem para lead real sem autorização Vasques + G7.
- Nunca ligar ENOVA2_ENABLED em produção sem feature flag controlado.
- Nunca abrir CANARY_PERCENT > 0 em produção sem monitoramento ativo.

### 5.3 Configuração mínima de ambiente antes do canary

| Configuração | Valor esperado para canary interno | Flag |
|-------------|-----------------------------------|------|
| ENOVA2_ENABLED | true (em ambiente controlado) | Feature flag |
| CANARY_PERCENT | 0 (inicia zerado) → valor da etapa | Feature flag |
| SHADOW_MODE | true (durante AMB-01) / false (AMB-03+) | Feature flag |
| CUTOVER_MODE | false (nunca ativo nesta PR) | Feature flag |
| ROLLBACK_FLAG | false (pronto para ativar em < 5 min) | Feature flag |
| CHANNEL_ENABLED | true (somente AMB-03 ou AMB-04) | Feature flag |

---

## §6 Volumes Permitidos

### 6.1 Caminho A — Gradual controlado

| Etapa | CANARY_PERCENT | Ambiente | Turnos mínimos | Condição de avanço | Condição de pausa |
|-------|---------------|----------|----------------|---------------------|-------------------|
| A0 | 0% | AMB-01/AMB-02 | — | PC-01..PC-12 todos PASS | Qualquer PC pendente |
| A1 | 5% | AMB-03 (allowlist pequena) | 50 turnos / 10 casos completos | MET-01 ≥ 90%; zero DIV-RM/BA; zero MET-08/09 na janela | Qualquer critério §8 |
| A2 | 20% | AMB-03 (allowlist expandida) | 200 turnos / 30 casos completos | MET-01 ≥ 92%; zero DIV-RM/BA; MET-07 p95 < 3s | Qualquer critério §8 |
| A3 | 50% | AMB-03 (pré-produção expandida) | 500 turnos / 80 casos completos | MET-01 ≥ 93%; zero DIV-RM/BA; aprovação Vasques | Qualquer critério §8 |
| A4 | 100% (interno) | AMB-03/AMB-04 (todo interno) | 1.000 turnos / 150 casos | MET-01 ≥ 94%; zero críticos; aprovação Vasques | Qualquer critério §8 |

> **A4 = 100% do ambiente interno controlado — NÃO é abertura para cliente real.** Cliente real requer PR-T7.5 + G7.

### 6.2 Caminho B — Arrojado

Caminho B permite **compressão ou dispensa do canary progressivo**, mas **nunca** dispensa:
- Smoke tests (todas as pré-condições §4 PASS).
- Plano de rollback ativo (§9).
- Telemetria mínima ativa (§7).
- Go/no-go formal com decisão humana (§11).
- Justificativa formal declarada no payload §13.

| Etapa B | Condição para usar | CANARY_PERCENT | Ambiente | Aprovação |
|---------|-------------------|----------------|----------|-----------|
| B0 | PC-01..PC-12 PASS + MET-01 ≥ 95% + zero DIV-RM/BA/S4 | 0% → direto 100% interno | AMB-04 (Vasques) | Vasques obrigatório |
| B1 | B0 aprovado + 200 turnos / 30 casos sem incidente | 100% interno → habilitação para T7.5 | AMB-03 expandido | Vasques obrigatório |

> **Caminho B autoriza corte mais agressivo mas NUNCA dispensa as travas operacionais.**

### 6.3 Condição de retorno a 0%

CANARY_PERCENT volta imediatamente a 0% se:

- Qualquer critério de pausa §8 for acionado.
- ROLLBACK_FLAG = true.
- Vasques solicitar pausa.
- Falha crítica MET-08 > 0 detectada.
- DIV-RM ou DIV-BA observada em qualquer turno.

### 6.4 Diferença operacional entre os caminhos

| Aspecto | Caminho A | Caminho B |
|---------|-----------|-----------|
| Velocidade | Progressiva (semanas) | Comprimida (dias se provas PASS) |
| Threshold MET-01 | ≥ 90% por etapa | ≥ 95% para saltar etapas |
| Autorização por etapa | Técnica (A1/A2) + Vasques (A3/A4) | Vasques em cada passo de B |
| Rollback | Por etapa | Global imediato |
| Justificativa formal | Não obrigatória para A1/A2 | Obrigatória em todo passo B |
| Canary para cliente real | Via PR-T7.5 | Via PR-T7.5 (sem atalho) |

---

## §7 Métricas Mínimas

### 7.1 MET-01..MET-10 — definição, thresholds e ação

| ID | Métrica | Definição | Threshold — Avançar | Threshold — Pausar | Threshold — Rollback |
|----|---------|-----------|---------------------|-------------------|----------------------|
| MET-01 | Taxa PASS geral | % de turnos que cumprem todos os critérios contratuais | ≥ 90% (A) / ≥ 95% (B) por janela | < 85% por janela | < 80% em 3 janelas consecutivas |
| MET-02 | Divergência de policy | % de turnos com PolicyDecision incorreto ou omitido | ≤ 5% por janela | > 8% por janela | > 10% em 2 janelas consecutivas |
| MET-03 | Divergência MCMV | % de turnos com violação de regra MCMV | **0 absoluto** | **> 0 (qualquer)** | **> 0 (qualquer)** |
| MET-04 | Erro de estado/memória | % de turnos com lead_state perdido, corrompido ou incorreto | ≤ 2% | > 5% | > 8% ou perda de caso completo |
| MET-05 | Erro documental | % de turnos com doc associado incorretamente ou estado documental inválido | ≤ 5% | > 8% | > 12% ou doc de terceiro entregue |
| MET-06 | Erro de canal | % de turnos com adapter inválido, assinatura falha ou idempotência violada | ≤ 3% | > 5% | > 8% ou mensagem real disparada fora de allowlist |
| MET-07 | Latência p95 | Percentil 95 do tempo de resposta do turno (ms) | < 3.000 ms | > 5.000 ms p95 | > 8.000 ms p95 ou timeout > 1% dos turnos |
| MET-08 | Falha crítica | Nº absoluto de falhas críticas (execução real, jailbreak não contido, MCMV violado) | **0 absoluto** | **> 0 (qualquer)** | **> 0 (qualquer — rollback imediato)** |
| MET-09 | Promessa indevida | Nº absoluto de turnos com promessa de aprovação ou afirmação não sustentada pelo estado | **0 absoluto** | **> 0 (qualquer)** | **> 0 (qualquer — rollback imediato)** |
| MET-10 | Fala mecânica | % de turnos com reply_text classificado como mecânico (template sem raciocínio) | ≤ 2% | > 5% | > 10% ou VC-09 falha em série |

### 7.2 Thresholds por etapa do canary

| Etapa | MET-01 mínimo | MET-03/08/09 | MET-07 p95 | Outras métricas |
|-------|--------------|--------------|------------|-----------------|
| A1 (5%) | ≥ 90% | zero absoluto | < 3.000 ms | MET-02 ≤ 5%; MET-04 ≤ 2%; MET-06 ≤ 3% |
| A2 (20%) | ≥ 92% | zero absoluto | < 3.000 ms | Mesmos + MET-10 ≤ 2% |
| A3 (50%) | ≥ 93% | zero absoluto | < 2.500 ms | Todos acima |
| A4 (100% interno) | ≥ 94% | zero absoluto | < 2.500 ms | Todos acima + MET-05 ≤ 5% |
| B0/B1 | ≥ 95% | zero absoluto | < 2.000 ms | Todos com tolerância zero |

### 7.3 Coleta e janela de métricas

- Toda métrica é coletada por **janela de observação** (ver §10).
- Métricas são persistidas no log de turno (`TurnoRastro`) com os 19 campos canônicos definidos em T7.1 §8.
- Métricas MET-03, MET-08 e MET-09 são **zero absoluto em qualquer janela** — um único evento ativa pausa ou rollback imediato.
- Dashboard mínimo: contagem por MET, percentil p95 de MET-07, alertas ativos para MET-03/08/09.

---

## §8 Critérios de Pausa

### 8.1 Pausar canary imediatamente se

| ID | Condição de pausa | Ação imediata | Métrica impactada |
|----|------------------|---------------|------------------|
| PAU-01 | Qualquer DIV-RM observada em turno real | CANARY_PERCENT → 0; FREEZE; notificar Vasques | MET-03 |
| PAU-02 | Qualquer DIV-BA observada (jailbreak, adversarial, execução real) | CANARY_PERCENT → 0; FREEZE; notificar Vasques | MET-08 |
| PAU-03 | MET-09 > 0 (promessa indevida detectada) | CANARY_PERCENT → 0; log preservado; notificar Vasques | MET-09 |
| PAU-04 | MET-10 > 5% (fala mecânica acima de threshold de pausa) | Pausar expansão; investigar antes de continuar | MET-10 |
| PAU-05 | Perda ou corrupção de lead_state em qualquer caso | CANARY_PERCENT → 0; preservar log completo; não apagar evidência | MET-04 |
| PAU-06 | Erro documental grave (doc de terceiro entregue, estado documental inválido propagar) | Pausar etapa atual; revisar pipeline documental | MET-05 |
| PAU-07 | Erro de canal grave (assinatura inválida aceita, mensagem fora de allowlist disparada) | CANARY_PERCENT → 0; auditar adapter | MET-06 |
| PAU-08 | MET-07 p95 > 5.000 ms por janela | Pausar expansão; investigar latência | MET-07 |
| PAU-09 | MET-01 < 85% por janela completa | Pausar expansão; revisar divergências antes de continuar | MET-01 |
| PAU-10 | Tentativa de WhatsApp real fora do escopo permitido | CANARY_PERCENT → 0; FREEZE; notificar Vasques; bloquear avanço para T7.5 | MET-06/08 |
| PAU-11 | Qualquer execução fora do ambiente AMB-01..AMB-04 autorizado | CANARY_PERCENT → 0; FREEZE; notificar Vasques | MET-08 |
| PAU-12 | MET-08 > 0 (falha crítica) | **Rollback imediato — não apenas pausa** (ver §9) | MET-08 |

### 8.2 Regra de pausa vs rollback

- **Pausa**: CANARY_PERCENT = 0; sistema mantido; logs preservados; investigação em andamento; pode retomar após resolução com evidência.
- **Rollback**: sistema revertido ao estado anterior; ROLLBACK_FLAG = true; não pode retomar sem revisão formal + autorização Vasques.

PAU-01, PAU-02, PAU-03, PAU-10, PAU-11 e PAU-12 acionam **rollback**, não apenas pausa.
PAU-04..PAU-09 acionam **pausa** — rollback é decisão posterior se a investigação confirmar a causa.

---

## §9 Critérios de Rollback

### 9.1 Triggers de rollback automático

| ID | Trigger | Ação |
|----|---------|------|
| ROL-01 | PAU-01: DIV-RM em turno real | Rollback imediato |
| ROL-02 | PAU-02: DIV-BA em turno real | Rollback imediato |
| ROL-03 | PAU-03: MET-09 > 0 (promessa indevida) | Rollback imediato |
| ROL-04 | PAU-12: MET-08 > 0 (falha crítica) | Rollback imediato |
| ROL-05 | PAU-10: WhatsApp real fora de allowlist | Rollback imediato |
| ROL-06 | PAU-11: execução fora de ambiente autorizado | Rollback imediato |
| ROL-07 | Vasques solicita rollback explicitamente | Rollback imediato |
| ROL-08 | MET-01 < 80% em 3 janelas consecutivas | Rollback após confirmação da janela |

### 9.2 Procedimento de rollback

| Passo | Ação | Responsável |
|-------|------|-------------|
| R1 | Setar ROLLBACK_FLAG = true | Sistema automático ou operador |
| R2 | Setar CANARY_PERCENT = 0 | Sistema automático |
| R3 | Setar ENOVA2_ENABLED = false (se rollback completo) | Operador |
| R4 | Preservar integralmente todos os logs e TurnoRastro | Sistema automático |
| R5 | Preservar lead_state completo — nunca apagar | Sistema automático |
| R6 | Registrar motivo formal no log de rollback com: trigger_id, turno_id, caso_id, timestamp, evidência | Operador |
| R7 | Notificar Vasques com o log de rollback | Operador |
| R8 | Bloquear avanço para PR-T7.5 até revisão formal | Protocolo |
| R9 | Não apagar nenhuma evidência — logs são imutáveis pós-rollback | Protocolo |
| R10 | Após resolução com evidência: reclassificar na matriz T7.3 e re-aprovar canary | Vasques + revisor |

### 9.3 O rollback NÃO faz

- Não apaga leads do Supabase.
- Não apaga logs de turno.
- Não altera lead_state retroativamente.
- Não fecha G7 (G7 permanece aberto/bloqueado).
- Não avança PR-T7.5 (fica bloqueada até revisão).

---

## §10 Janela de Observação

### 10.1 Definição da janela

Uma **janela de observação** é o período mínimo de operação controlada após o qual a decisão de avançar, pausar ou rollback pode ser tomada com base em evidência.

| Parâmetro | Valor mínimo |
|-----------|-------------|
| Duração temporal | 24 horas contínuas de operação na etapa atual |
| Turnos mínimos | 50 turnos por janela (Etapa A1); 200 turnos (A2+); 1.000 turnos (A4) |
| Casos completos mínimos | 10 casos completos (A1); 30 casos (A2); 80 casos (A3); 150 casos (A4) |
| Amostra mínima de grupos | Ao menos 1 caso de cada grupo A..I da simulação T7.2 por janela completa |
| Período de estabilização | Aguardar 4 horas após mudança de percentual antes de avaliar nova janela |

### 10.2 Evidência exigida para expansão de janela

Para avançar de uma etapa para a próxima:

| Evidência | Formato |
|-----------|---------|
| Métricas da janela completa | Log estruturado com MET-01..MET-10 por janela |
| Zero triggers PAU-01..PAU-12 ativados na janela | Confirmação no log de rollback (vazio = nenhum trigger) |
| Revisão de amostra de casos completos | Nota de revisão humana com data e assinatura |
| Payload parcial §13 atualizado | Campo `metrics_summary` preenchido com dados reais |
| Autorização de avanço (ver §11) | Decisão registrada |

### 10.3 Responsável pela revisão

| Etapa | Responsável principal | Aprovação adicional |
|-------|----------------------|---------------------|
| A1 (5%) | Revisor técnico T7.4 | Não obrigatória |
| A2 (20%) | Revisor técnico T7.4 | Não obrigatória |
| A3 (50%) | Revisor técnico T7.4 | **Vasques** obrigatório |
| A4 (100% interno) | Revisor técnico T7.4 | **Vasques** obrigatório |
| B0 / B1 | Revisor técnico T7.4 | **Vasques** obrigatório em todos os passos |

---

## §11 Matriz de Aprovação — Quem Aprova Avanço

### 11.1 Tabela de aprovação por tipo de avanço

| Tipo de avanço | Aprovação necessária | Evidência exigida | Vasques obrigatório? |
|---------------|---------------------|-------------------|----------------------|
| A0 → A1 (0% → 5%) | Revisor técnico | PC-01..PC-12 PASS + janela A0 OK | Não |
| A1 → A2 (5% → 20%) | Revisor técnico | Janela A1 completa + métricas dentro do threshold | Não |
| A2 → A3 (20% → 50%) | Revisor técnico + Vasques | Janela A2 completa + aprovação formal Vasques | **Sim** |
| A3 → A4 (50% → 100% interno) | Revisor técnico + Vasques | Janela A3 completa + decisão formal | **Sim** |
| A4 → habilitar T7.5 | Vasques + decisão executiva | Janela A4 completa + payload §13 preenchido | **Sim** |
| B0 (pulo via Caminho B) | Vasques | MET-01 ≥ 95% + zero críticos + justificativa formal | **Sim** |
| B1 → habilitar T7.5 | Vasques | B0 + 200 turnos / 30 casos | **Sim** |
| Avanço para pré-produção ampla | Vasques | A4 ou B1 concluídos | **Sim** |
| Avanço para cliente real | Vasques + decisão executiva + G7 | PR-T7.5 entregue + G7 próximo | **Sim — bloqueante** |
| Avanço para cutover | Vasques + decisão executiva | PR-T7.5 + PR-T7.6 + PR-T7.7 entregues | **Sim — bloqueante** |

### 11.2 Veto Vasques

Vasques pode vetar **qualquer avanço** em qualquer etapa, independentemente das métricas. O veto Vasques é soberano e não requer justificativa técnica.

Veto Vasques registra:
- Motivo (livre).
- Etapa vetada.
- Condição de retomada (se declarada).
- Data.

### 11.3 Quando a aprovação humana é obrigatória (além do técnico)

- Qualquer expansão ≥ 50% (CANARY_PERCENT ≥ 50%).
- Qualquer habilitação de cliente real ou canal aberto.
- Qualquer uso do Caminho B.
- Qualquer rollback que não seja automático por trigger imediato.
- Qualquer retomada de canary após rollback.
- Qualquer abertura de PR-T7.5.

---

## §12 Relação Caminho A e Caminho B

### 12.1 Caminho A — Canary progressivo (padrão)

O Caminho A adota progressão gradual controlada:

```
A0 (0% — simulação) → A1 (5% — allowlist pequena) → A2 (20% — allowlist expandida)
→ A3 (50% — pré-produção) → A4 (100% interno) → PR-T7.5 (cutover)
```

- Cada etapa requer janela de observação completa.
- Avanço exige evidência por janela.
- Rollback por etapa é reversível sem perda total.
- Aprovação humana a partir de A3.

### 12.2 Caminho B — Canary comprimido ou dispensado

O Caminho B autoriza **saltar etapas** do canary progressivo se:

1. MET-01 ≥ 95% na simulação T7.2.
2. Zero DIV-RM, DIV-BA ou S4 abertos.
3. Zero divergências `affects_path_b: true` com S2+ não resolvidas.
4. Justificativa formal declarada no payload §13.
5. Aprovação Vasques para cada passo de B.

**O Caminho B nunca dispensa:**
- Pré-condições PC-01..PC-12 (§4) — todas PASS.
- Telemetria MET-01..MET-10 ativa durante o período.
- Rollback mapeado e pronto para acionar em < 5 min.
- Smoke test de pelo menos 200 turnos antes de habilitar T7.5.
- Go/no-go formal com decisão Vasques documentada.
- Feature flags ativas e reversíveis.

### 12.3 Caminho B não é atalho para cliente real

Mesmo Caminho B com todos os thresholds PASS, **cliente real exige PR-T7.5 e decisão G7**. Caminho B só comprime o canary interno — não elimina as etapas formais de cutover e closeout.

### 12.4 Comparativo de impacto no canary

| Dimensão | Caminho A | Caminho B |
|----------|-----------|-----------|
| Duração estimada | 2–4 semanas | 3–7 dias |
| Risco de rollback em etapa | Por etapa (localizado) | Global (todos os turnos) |
| Aprovação por etapa | Técnica (A1/A2) + Vasques (A3+) | Vasques em todos os passos |
| Justificativa formal | Não obrigatória (A1/A2) | Obrigatória em todo passo |
| Threshold MET-01 | ≥ 90% por etapa | ≥ 95% para saltar |
| Evidência para T7.5 | Janela A4 completa | Janela B1 (200 turnos mínimo) |
| Indicado quando | Operação nova, sem urgência | Provas T7.2 excepcionalmente sólidas |

---

## §13 Saída para PR-T7.5 — Payload Canônico

### 13.1 Shape do payload

```json
{
  "payload_version": "T7.4-v1",
  "generated_at": "YYYY-MM-DDTHH:MM:SSZ",
  "canary_source": "T7_CANARY_INTERNO.md",
  "path_used": "A|B",
  "canary_mode_used": "gradual_a1_a4|compressed_b0_b1|partial",
  "approved_for_cutover": true,
  "cutover_mode": "partial|total_autorizado|no_go",
  "final_canary_percent": 0,
  "total_turns_in_canary": 0,
  "total_cases_in_canary": 0,
  "windows_observed": 0,
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
  "incidents": [],
  "rollbacks_triggered": [],
  "accepted_risks": [
    {
      "risk_id": "RSK-T74-NNN",
      "description": "<descrição>",
      "severity": "S0|S1|S2",
      "mitigation": "<mitigação aplicada>",
      "vasques_accepted": true
    }
  ],
  "blocking_items": [],
  "recommendation": "proceed|proceed_with_restrictions|no_go",
  "recommendation_justification": "<texto>",
  "vasques_authorization_required": true,
  "vasques_authorization_received": false,
  "path_b_justification": "<obrigatório se path_used = B>",
  "notes": "<observações finais>"
}
```

### 13.2 Campos obrigatórios para habilitar PR-T7.5

| Campo | Valor mínimo para PR-T7.5 |
|-------|--------------------------|
| `approved_for_cutover` | `true` |
| `recommendation` | `proceed` ou `proceed_with_restrictions` |
| `MET-03_mcmv_divergence` | `0` |
| `MET-08_critical_failure` | `0` |
| `MET-09_promise_indevida` | `0` |
| `MET-01_pass_rate` | ≥ 90% (Caminho A) ou ≥ 95% (Caminho B) |
| `vasques_authorization_received` | `true` |
| `blocking_items` | array vazio `[]` |
| `rollbacks_triggered` | array com root cause resolvido para cada rollback |

### 13.3 Valores desta PR

Como esta PR é a **definição do protocolo** (não a execução do canary), o payload acima está preparado estruturalmente. Os valores numéricos serão preenchidos durante a execução real do canary. O payload instanciado será entregue como evidência na PR-T7.5.

---

## §14 Critérios de Aceite — CA-T7.4

| ID | Critério | Verificação |
|----|---------|-------------|
| CA-T7.4-01 | `T7_CANARY_INTERNO.md` criado em `schema/implantation/` | Arquivo presente em main após merge |
| CA-T7.4-02 | Pré-condições PC-01..PC-12 definidas com evidência exigida | §4.1 completo |
| CA-T7.4-03 | Ambiente e canal permitidos definidos com proibições absolutas | §5 completo |
| CA-T7.4-04 | Volumes permitidos definidos para Caminho A (A0..A4) e Caminho B (B0/B1) | §6 completo |
| CA-T7.4-05 | MET-01..MET-10 presentes com thresholds avançar/pausar/rollback por etapa | §7 completo |
| CA-T7.4-06 | Critérios de pausa PAU-01..PAU-12 definidos com distinção pausa vs rollback | §8 completo |
| CA-T7.4-07 | Critérios de rollback ROL-01..ROL-08 e procedimento R1..R10 definidos | §9 completo |
| CA-T7.4-08 | Janela de observação com duração, turnos, casos e amostra de grupos definidos | §10 completo |
| CA-T7.4-09 | Matriz de aprovação humana com todos os tipos de avanço e veto Vasques | §11 completo |
| CA-T7.4-10 | Relação Caminho A vs B com restrições de Caminho B declaradas | §12 completo |
| CA-T7.4-11 | Payload canônico de saída para T7.5 com campos obrigatórios definidos | §13 completo |
| CA-T7.4-12 | Zero execução real (runtime, canary, shadow, cutover, WhatsApp real) | Diff: apenas 4 arquivos schema/ |
| CA-T7.4-13 | Zero modificação em `src/` | Diff validado |
| CA-T7.4-14 | Referência G6 = `READINESS_G6.md` (nunca `T6_READINESS_CLOSEOUT_G6.md`) | §1 verificado |
| CA-T7.4-15 | Referência preflight = `T7_PREFLIGHT_GO_LIVE.md` (nunca `T7_PREFLIGHT_GOLIIVE.md`) | §1 verificado |
| CA-T7.4-16 | Referência shadow = `T7_SHADOW_SIMULACAO.md` | §1 verificado |
| CA-T7.4-17 | Referência matriz = `T7_MATRIZ_DIVERGENCIAS.md` | §1 verificado |
| CA-T7.4-18 | Nome deste artefato = `T7_CANARY_INTERNO.md` (nunca `T7_CANARY_CONTROLADO.md`) | §1 verificado |
| CA-T7.4-19 | Próxima PR autorizada = PR-T7.5 — Cutover parcial ou total governado | Bloco E §16 |
| CA-T7.4-20 | Bloco E com `Fechamento permitido: sim` | §16 presente e preenchido |

---

## §15 Bloqueios — B-T7.4

| ID | Bloqueio | Consequência |
|----|---------|--------------|
| B-T7.4-01 | Ausência de qualquer pré-condição PC-01..PC-12 definida | PR inválida — bloqueia merge |
| B-T7.4-02 | Ausência de métricas MET-01..MET-10 ou de qualquer threshold | PR inválida — bloqueia merge |
| B-T7.4-03 | Ausência de critérios de pausa PAU-01..PAU-12 | PR inválida — bloqueia merge |
| B-T7.4-04 | Ausência de critérios de rollback ROL-01..ROL-08 | PR inválida — bloqueia merge |
| B-T7.4-05 | Ausência de janela de observação com parâmetros mínimos | PR inválida — bloqueia merge |
| B-T7.4-06 | Ausência de matriz de aprovação humana | PR inválida — bloqueia merge |
| B-T7.4-07 | Tentativa de execução de canary real nesta PR | Violação de contrato — PR inválida |
| B-T7.4-08 | Tentativa de uso de WhatsApp real ou canal aberto nesta PR | Violação de contrato — PR inválida |
| B-T7.4-09 | Tentativa de execução de runtime ou modificação de `src/` | Violação de contrato — bloqueia merge imediato |
| B-T7.4-10 | Modificação de artefatos T6 | PR inválida |
| B-T7.4-11 | Uso de `T6_READINESS_CLOSEOUT_G6.md` como referência canônica G6 | PR inválida — bloqueia merge |
| B-T7.4-12 | Uso de `T7_PREFLIGHT_GOLIIVE.md` (typo com II) como referência preflight | PR inválida — bloqueia merge |
| B-T7.4-13 | Uso de `T7_CANARY_CONTROLADO.md` como entrega canônica desta PR | PR inválida — nome canônico é `T7_CANARY_INTERNO.md` |
| B-T7.4-14 | Diff com mais de 4 arquivos (além dos 4 esperados) sem justificativa | PR fora de escopo |
| B-T7.4-15 | `reply_text` gerado como conteúdo desta PR | Violação LLM-first |

---

## §16 Bloco E — Fechamento Desta PR (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:              schema/implantation/T7_CANARY_INTERNO.md
Estado da evidência:                      completa
Há lacuna remanescente?:                  não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:           sim
Estado permitido após esta PR:            PR-T7.4 entregue — protocolo de canary formalizado
Próxima PR autorizada:                    PR-T7.5 — Cutover parcial ou total governado
```

| Campo | Valor |
|-------|-------|
| PR | PR-T7.4 |
| Entrega principal | `schema/implantation/T7_CANARY_INTERNO.md` |
| Artefato central | Protocolo de canary interno + pré-produção |
| Adendo A00-ADENDO-03 | Evidência manda no estado |
| Fechamento permitido? | **sim** — todos os CA-T7.4-01..20 satisfeitos; zero bloqueios abertos nesta PR |
| Justificativa de fechamento | Protocolo completo com 16 seções: pré-condições PC-01..12; ambientes AMB-01..04; volumes Caminho A (A0..A4) e B (B0/B1); MET-01..10 com thresholds avançar/pausar/rollback; critérios de pausa PAU-01..12; rollback ROL-01..08 e procedimento R1..R10; janela de observação com parâmetros mínimos; matriz de aprovação com veto Vasques; relação Caminho A/B; payload canônico para T7.5; CA-T7.4-01..20; B-T7.4-01..15; referências canônicas verificadas; zero src/; zero runtime; zero WhatsApp real. |
| Próxima PR autorizada | **PR-T7.5 — Cutover parcial ou total governado** |
| Gate em aberto | G7 — bloqueado até PR-T7.R |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` |

---

## §17 Estado Herdado

- Fase: T7 em execução.
- PR-T7.3 (#139) merged em main em 2026-04-29.
- `T7_MATRIZ_DIVERGENCIAS.md` criado com 12 categorias DIV-MA..DIV-BA, graduação S0–S4, 20 hardenings catalogados, 12 bloqueios BLK-T73-01..12, payload canônico para T7.4.
- DIV-RM e DIV-BA: bloqueantes absolutos confirmados.
- Referência G6: `READINESS_G6.md`.
- Referência preflight: `T7_PREFLIGHT_GO_LIVE.md`.
- Referência shadow: `T7_SHADOW_SIMULACAO.md`.
- Próximo passo autorizado antes desta PR: PR-T7.4.

---

## §18 Estado Entregue

- `T7_CANARY_INTERNO.md` criado em `schema/implantation/`.
- Protocolo de canary interno formalizado com 18 seções.
- Pré-condições PC-01..PC-12 com checklist e evidência exigida.
- Ambientes AMB-01..04 com proibições absolutas.
- Volumes Caminho A (A0..A4) e Caminho B (B0/B1) com condições de avanço e retorno a 0%.
- MET-01..MET-10 com thresholds por etapa (avançar, pausar, rollback).
- Critérios de pausa PAU-01..PAU-12 com distinção pausa/rollback.
- Rollback ROL-01..08 com procedimento R1..R10 e proibições.
- Janela de observação com duração mínima, turnos, casos e amostra.
- Matriz de aprovação com veto Vasques soberano.
- Relação Caminho A vs B com restrições invioláveis.
- Payload canônico §13 com campos obrigatórios para PR-T7.5.
- CA-T7.4-01..20 satisfeitos; B-T7.4-01..15 declarados.
- PR-T7.5 (Cutover parcial ou total governado) desbloqueada.
