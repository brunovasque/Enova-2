# T3_ORDEM_AVALIACAO_COMPOSICAO — Ordem de Avaliação e Composição de Políticas — ENOVA 2

## Finalidade

Este documento define a **ordem estável de avaliação** das políticas do policy engine v1 e a
**política de composição** quando múltiplas regras disparam no mesmo turno.

Ele **não define novas regras** — opera exclusivamente sobre as 5 classes canônicas declaradas em
`T3_CLASSES_POLITICA.md` (PR-T3.1) e as 4 regras críticas declaradas em
`T3_REGRAS_CRITICAS_DECLARATIVAS.md` (PR-T3.2). O conteúdo aqui é **ordem, composição e desempate**
— jamais redefinição de classe, regra ou semântica.

O policy engine **decide**. O LLM **fala**. Esta camada de ordenação preserva ambos os princípios.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — 5 classes canônicas e prioridade.
- `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` (PR-T3.2) — 4 regras críticas.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — `OperationalState` e shapes.
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens e níveis de confiança.
- `schema/implantation/T2_RECONCILIACAO.md` (PR-T2.4) — protocolo de conflito (pré-condição da
  avaliação de política).

**Microetapas do mestre cobertas por este artefato:**

> **Microetapa 3 — T3:** "Definir ordem estável de avaliação para evitar colisão de regras."
> **Microetapa 4 — T3:** "Definir política de composição quando várias regras disparam ao
> mesmo tempo."

**Princípios canônicos (A00-ADENDO-01, A00-ADENDO-02 e A00-ADENDO-03):**

> 1. Nenhum estágio de avaliação produz `reply_text`, `mensagem_usuario`, `texto_cliente` ou
>    qualquer texto destinado ao cliente.
> 2. Esta camada **não decide novas regras** — apenas ordena, compõe e desempata as já aprovadas.
> 3. Colisão de regras **nunca é silenciosa**. Toda colisão deve ser registrada, classificada e
>    resolvida por política explícita; o silêncio é violação contratual.

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T3 (microetapas 3 e 4).
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` — §1, §2, §7 CA-03, §16 PR-T3.3.
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01).
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02).
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03).

---

## 1. Visão geral do pipeline de avaliação

A cada turno em que o policy engine é invocado, o `lead_state` percorre seis estágios sequenciais
e numerados. **Pular estágio é não conformidade** (RC-INV-01 desta especificação).

```
TURNO ATIVO
   │
   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estágio 1 — Normalização e reconciliação prévia do lead_state                │
│   (resolver conflitos, hidratar derived_*, garantir consistência mínima)     │
└──────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estágio 2 — Avaliação de BLOQUEIOS críticos / documentais                    │
│   (R_ESTRANGEIRO_SEM_RNM com nationality=confirmed; demais bloqueios hard)   │
└──────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estágio 3 — Avaliação de CONFIRMAÇÕES obrigatórias de dados críticos         │
│   (fato em captured/inferred com confiança baixa que sustentaria decisão)    │
└──────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estágio 4 — Avaliação de OBRIGAÇÕES de coleta / ação mandatória              │
│   (fato ausente exigido pelo stage; ACAO_* de T1 ainda não cumprida)          │
└──────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estágio 5 — Avaliação de SUGESTÕES MANDATÓRIAS                                │
│   (riscos, oportunidades, contexto que orienta sem mandar ação)               │
└──────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estágio 6 — Avaliação de ROTEAMENTOS / avanço de fase                         │
│   (somente se não houver bloqueio ativo; respeitando confirmações pendentes)  │
└──────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
PolicyDecisionSet { decisions[], collisions[], evaluation_meta }
```

Cada estágio produz zero ou mais `PolicyDecision`. O resultado é o `PolicyDecisionSet`, descrito
em §6 desta especificação.

---

## 2. Ordem estável numerada de avaliação

### 2.1 Estágio 1 — Normalização e reconciliação prévia do `lead_state`

**Propósito:** garantir que o estado de entrada ao engine está consistente. Esta etapa **não emite
`PolicyDecision`** — produz apenas o `lead_state` normalizado para os estágios seguintes.

**Atividades obrigatórias:**

1. Aplicar protocolo de `T2_RECONCILIACAO.md` para qualquer fato em `contradicted` ou conflito
   ativo. Se restar conflito não resolvido, **interromper avaliação** e devolver
   `evaluation_meta.aborted = true` com `abort_reason = "unresolved_conflict"`.
2. Recalcular fatos derivados (`derived_*`) a partir dos fatos canônicos atuais — sem inventar
   regra nova; usar apenas as derivações declaradas em `T2_DICIONARIO_FATOS`.
3. Validar que todas as `fact_key` referenciadas pelas regras críticas existem no `lead_state`
   (mesmo que com status `hypothesis` ou ausente — a presença/ausência é insumo das regras).
4. Bloquear avaliação se `operational.current_phase` for nulo ou desconhecido — neste caso emitir
   apenas um diagnóstico estrutural (`evaluation_meta.aborted = true`,
   `abort_reason = "invalid_phase"`).

**Entrada:** `lead_state` bruto do turno.
**Saída:** `lead_state` normalizado + `derived_*` atualizados + flag `reconciliation_ok`.

**Pré-condição obrigatória para Estágios 2–6:** `reconciliation_ok = true`.

### 2.2 Estágio 2 — Bloqueios críticos / documentais

**Propósito:** detectar condições que impedem qualquer avanço de `current_phase` no turno.

**Regras candidatas a emitir bloqueio neste estágio (referência T3.2):**

| Origem | Regra | Condição estrita para emitir bloqueio |
|--------|-------|---------------------------------------|
| T3.2 §5 | `R_ESTRANGEIRO_SEM_RNM` | `fact_nationality.value="estrangeiro"` E `fact_nationality.status="confirmed"` E `fact_rnm_status.value` ∈ {`"sem_rnm"`,`"vencido"`,`"inválido"`} |
| Reservado | Bloqueios documentais futuros (não desta PR) | Definidos em PRs de regras posteriores. Se nenhum existir, este estágio passa direto |

**Restrições:**

- Fato em `hypothesis` **nunca** sustenta bloqueio (RC-INV-02 desta spec; CP-09 de T3.1).
- Fato em `captured` com origem de baixa confiança **não** dispara bloqueio direto — sobe para
  Estágio 3 como confirmação obrigatória.
- Inferência (`status="inferred"`) **nunca** sustenta bloqueio terminal (PC-INT-03 de T3.1).

**Saída deste estágio:** lista `blocking_decisions: PolicyDecision[]` (pode ser vazia).

**Efeito imediato no `lead_state`:** se `blocking_decisions` não vazia, atualizar
`operational.blocked_by` com cada bloqueio antes de seguir para o próximo estágio.

### 2.3 Estágio 3 — Confirmações obrigatórias de dados críticos

**Propósito:** identificar fatos em `captured`/`inferred` cuja confiança ainda não autoriza
basear decisão de elegibilidade ou rota — exigindo `confirmação` antes de qualquer obrigação que
dependa do mesmo fato.

**Critérios canônicos de disparo (referência T3.1 §10 e T3.2):**

| Critério | Origem doc | Comportamento |
|----------|------------|---------------|
| Fato em `captured` com origem `INDIRECT_TEXT` ou `AUDIO_TRANSCRIPT` ruim | PC-INT-02 (T3.1) | Sobe `confirmação` antes de qualquer obrigação que use o mesmo fato |
| `R_CASADO_CIVIL_CONJUNTO_CONFIRM` | T3.2 §2 | Quando `fact_estado_civil` em `captured` com baixa confiança |
| `R_AUTONOMO_IR` variante confirmação | T3.2 §3 | Quando `fact_autonomo_has_ir_p1` em `captured`/`inferred` ambíguo |
| `R_ESTRANGEIRO_SEM_RNM` variante confirmação | T3.2 §5 | Quando `fact_nationality` ainda em `captured` (não permite bloqueio direto) |

**Regra ordenação interna do estágio:**

1. `confirmation_level = "hard"` antes de `"soft"`.
2. Empate em `confirmation_level`: criticidade do fato (lista §3.4 deste documento).
3. Empate em criticidade: ordem alfabética de `fact_key` (determinismo).

**Restrição absoluta:** confirmação **nunca** persiste fato como `confirmed`. Apenas sinaliza
necessidade. (CP-05 de T3.1, RC-INV-04 desta spec.)

**Saída:** `confirmation_decisions: PolicyDecision[]`.

### 2.4 Estágio 4 — Obrigações de coleta / ação mandatória

**Propósito:** identificar fatos ausentes ou ações `ACAO_*` ainda não cumpridas que são
mandatórias para o `current_phase`.

**Regras candidatas (referência T3.2):**

| Origem | Regra | Quando emite obrigação |
|--------|-------|------------------------|
| T3.2 §2 | `R_CASADO_CIVIL_CONJUNTO` | `fact_estado_civil="casado_civil"` confirmado E `process_mode` ausente/`solo` |
| T3.2 §3 | `R_AUTONOMO_IR` variante obrigação | `work_regime_p1="autônomo"` E `fact_autonomo_has_ir_p1` ausente |
| T3.2 §4 | `R_SOLO_BAIXA_COMPOSICAO` parte obrigação | `process_mode="solo"` E `derived_composition_needed=true` E renda elegível para composição |
| T3.2 §5 | `R_ESTRANGEIRO_SEM_RNM` variante obrigação | `fact_nationality.value="estrangeiro"` confirmado E `fact_rnm_status` ausente |

**Regra de ordenação interna do estágio:**

1. `priority` numérico crescente (1 = maior prioridade) declarado em cada `ObrigacaoAction`.
2. Empate em `priority`: criticidade do fato (lista §3.4).
3. Empate em criticidade: stage do fato (mais cedo no funil > mais tarde).
4. Empate em stage: ordem alfabética de `required_fact`.

**Restrição:** **nenhuma obrigação pode ser emitida quando há bloqueio ativo do Estágio 2 sobre
o mesmo `fact_key`** (AP-CP-06 de T3.1; AP-OC-04 desta spec). Se isso acontecer, registrar
colisão e descartar a obrigação — mantendo apenas o bloqueio.

**Saída:** `obligation_decisions: PolicyDecision[]`.

### 2.5 Estágio 5 — Sugestões mandatórias

**Propósito:** orientar conduta do LLM em riscos não-bloqueantes, oportunidades de coleta proativa
e contextos que merecem profundidade extra.

**Regras candidatas (referência T3.2):**

| Origem | Regra | Quando emite sugestão_mandatória |
|--------|-------|----------------------------------|
| T3.2 §3 | `R_AUTONOMO_IR` variante sugestão | `work_regime_p1="autônomo"` E `autonomo_has_ir_p1="não"` confirmado |
| T3.2 §4 | `R_SOLO_BAIXA_COMPOSICAO` parte sugestão | `process_mode="solo"` E renda baixa E sinal de composição familiar disponível |
| Reservado | Sugestões adicionais futuras | Compatíveis com payload `SugestaoMandatoriaAction` de T3.1 §5 |

**Regra de ordenação interna do estágio:**

1. `urgency = "medium"` antes de `"low"`.
2. Empate em `urgency`: criticidade do fato/contexto.
3. Empate: ordem alfabética de `guidance_code`.

**Restrição absoluta:** sugestão_mandatória **nunca** vence bloqueio, confirmação ou obrigação na
composição final (RC-INV-05 desta spec; CP-06 de T3.1: `severity` nunca `"blocking"`/`"critical"`).

**Saída:** `suggestion_decisions: PolicyDecision[]`.

### 2.6 Estágio 6 — Roteamentos / avanço de fase

**Propósito:** decidir transições de `current_phase`/`current_objective` apenas quando o estado
permite avanço.

**Pré-condição rígida:** este estágio **só executa se `blocking_decisions` está vazia**. Caso
contrário, retorna lista vazia e registra que o roteamento foi suprimido por bloqueio ativo.

**Regras candidatas (referência T3.1 §6):**

| Origem | Regra exemplo | Tipo de transição |
|--------|---------------|-------------------|
| T3.1 §6 | `R_ROTEAR_P3_REQUIRED` | `transition_type="special"` |
| T3.1 §6 | `R_ADVANCE_DISCOVERY_TO_QUALIFICATION` | `transition_type="advance"` |
| T3.1 §6 | `R_ABORT_INELEGIVEL_TERMINAL` | `transition_type="abort"` (só com fato `confirmed`) |

**Regras adicionais deste estágio:**

1. Se há `confirmation_decisions` com `confirmation_level="hard"` apontando para `fact_key` que
   sustentaria o roteamento, **suprimir o roteamento** e devolver apenas a confirmação. Roteamento
   não pode ser emitido sobre dado ainda não confirmado.
2. Se há mais de um roteamento candidato com `target_phase` distintos no mesmo turno, **proibido
   escolher silenciosamente**: registrar colisão `COL-ROUTING-MULTI` (§5.2) e suprimir todos os
   roteamentos do turno.
3. Se o roteamento candidato for `transition_type="abort"` (inelegibilidade terminal), o fato que
   sustenta a inviabilidade deve estar em `status="confirmed"` — caso contrário, este estágio
   degrada para emissão de confirmação no estágio 3 do próximo turno (RC-INV-09 desta spec).

**Saída:** `routing_decisions: PolicyDecision[]` (geralmente vazia ou com 1 item).

---

## 3. Regras canônicas de composição

### 3.1 Princípios canônicos

| Código | Princípio |
|--------|-----------|
| RC-COMP-01 | **Bloqueio sempre vence roteamento.** Roteamento nunca executa se há bloqueio ativo no mesmo turno (CP-07 de T3.1). |
| RC-COMP-02 | **Confirmação de dado crítico vem antes de obrigação que dependa do mesmo dado.** Obrigação só emite quando o fato está apto (status canônico ≥ `captured` confirmado quando confiança baixa). |
| RC-COMP-03 | **Obrigação não pode sobrescrever bloqueio.** Se há bloqueio sobre `fact_key`, obrigações sobre o mesmo `fact_key` são descartadas (AP-CP-06 T3.1). |
| RC-COMP-04 | **Sugestão mandatória nunca vence** bloqueio, confirmação ou obrigação. Sua emissão é independente, mas sua execução pelo LLM é subordinada. |
| RC-COMP-05 | **Múltiplas obrigações são ordenadas, nunca descartadas silenciosamente.** Tabela de prioridade declarada em §2.4 e §3.3. |
| RC-COMP-06 | **Múltiplas confirmações são ordenadas por criticidade do fato e nível de confirmação.** Lista §3.4. |
| RC-COMP-07 | **Múltiplos roteamentos conflitantes geram colisão `COL-ROUTING-MULTI`** (§5.2) e nenhum é executado no turno. |
| RC-COMP-08 | **Regra terminal não nasce de inferência.** Toda decisão `abort` exige fato em `confirmed` (PC-INT-03 T3.1; RC-INV-09 desta spec). |
| RC-COMP-09 | **Dado em `hypothesis` nunca sustenta bloqueio nem regra terminal** (CP-09 T3.1). |
| RC-COMP-10 | **Fato em conflito segue T2_RECONCILIACAO antes da política.** Estágio 1 obrigatório. |

### 3.2 Matriz de composição entre classes

A matriz abaixo declara o resultado quando duas decisões de classes diferentes apontam para o
mesmo `target` (`fact_key`, `current_phase` ou bloco operacional) no mesmo turno.

| ↓ Já presente \\ → Nova decisão | bloqueio | obrigação | confirmação | sugestão_mandatória | roteamento |
|---|---|---|---|---|---|
| **bloqueio** | acumular: ambos vão para `blocked_by` | descartar nova obrigação (RC-COMP-03); registrar `COL-BLOCK-OBLIG` | manter ambos: confirmação fica pendente, mas não desbloqueia | manter ambos: sugestão fica registrada como contexto auxiliar | **suprimir roteamento** (RC-COMP-01); registrar `COL-BLOCK-ROUTE` |
| **obrigação** | promover para bloqueio: descartar obrigação prévia; manter bloqueio | acumular ordenadas por priority/criticidade | confirmação tem precedência: obrigação fica em standby até confirmação resolver | manter ambos: sugestão paralela | suprimir roteamento se obrigação refere-se ao mesmo fato sustentador; registrar `COL-OBLIG-ROUTE` |
| **confirmação** | promover para bloqueio só se fato confirmado contradizer; senão manter ambos | manter ambos: confirmação primeiro (estágio 3), obrigação no estágio 4 sobre o mesmo dado fica em standby | acumular: ordenadas por confirmation_level e criticidade | manter ambos: sugestão fica como contexto de raciocínio | suprimir roteamento se a confirmação afeta `fact_key` que sustentaria o roteamento; registrar `COL-CONF-ROUTE` |
| **sugestão_mandatória** | manter ambos: bloqueio dominante; sugestão fica registrada | manter ambos: obrigação dominante; sugestão paralela | manter ambos: confirmação dominante; sugestão paralela | acumular: ordenadas por urgency/criticidade | manter ambos: roteamento dominante; sugestão informa conduta da transição |
| **roteamento** | suprimir roteamento existente; emitir bloqueio (RC-COMP-01); registrar `COL-BLOCK-ROUTE` | suprimir roteamento se obrigação refere-se ao fato sustentador (RC-COMP-02 estendida); registrar `COL-OBLIG-ROUTE` | suprimir roteamento e priorizar confirmação; registrar `COL-CONF-ROUTE` | manter ambos: sugestão informa transição | colisão `COL-ROUTING-MULTI` — suprimir todos os roteamentos do turno (RC-COMP-07) |

**Leitura da matriz:** linha = decisão **já presente** no `PolicyDecisionSet` corrente; coluna =
**nova** decisão sendo considerada. A célula descreve o resultado da composição.

### 3.3 Tabela de prioridade global (resumo executivo)

| Prioridade | Classe | Estágio canônico | Sobreposição permitida sobre as inferiores |
|------------|--------|------------------|--------------------------------------------|
| 1 | `bloqueio` | Estágio 2 | Suprime roteamento (RC-COMP-01); descarta obrigação que aponta o mesmo fato |
| 2 | `obrigação` | Estágio 4 | Coloca confirmação dependente em standby até resolução; não toca bloqueio |
| 3 | `confirmação` | Estágio 3 | Suspende obrigação dependente do mesmo fato; suprime roteamento dependente |
| 4 | `sugestão_mandatória` | Estágio 5 | Não suprime nada — atua paralelamente |
| 5 | `roteamento` | Estágio 6 | Subordinado a 1, 2 e 3; emite só se nenhum dos anteriores impede |

### 3.4 Lista canônica de criticidade de fato (desempate)

Para desempate entre decisões da mesma classe sobre fatos distintos, usa-se a seguinte ordem
canônica (do mais crítico para o menos crítico). A lista deriva de `T2_DICIONARIO_FATOS` e dos
critérios de bloqueio/confirmação T3.2.

1. `fact_nationality`
2. `fact_rnm_status`
3. `fact_credit_restriction`
4. `fact_estado_civil`
5. `fact_process_mode`
6. `fact_work_regime_p1`
7. `fact_autonomo_has_ir_p1`
8. `fact_monthly_income_p1`
9. `fact_p3_required`
10. `fact_has_multi_income_p1`
11. demais `fact_*` em ordem alfabética
12. `derived_*` em ordem alfabética
13. `signal_*` em ordem alfabética

**Regra de uso:** menor índice = mais crítico = vence o desempate.

### 3.5 Regra de desempate residual

Quando todos os critérios anteriores empatam, aplica-se em ordem:

1. Decisão originada por regra crítica de T3.2 vence decisão de regra acessória.
2. Decisão com `meta.evaluated_at_turn` mais antigo vence decisão recém-emitida (estabilidade
   entre turnos).
3. Decisão com `rule_id` em ordem alfabética crescente vence (determinismo final).

---

## 4. Combinações específicas detalhadas

Esta seção detalha as oito combinações exigidas pelo escopo da PR-T3.3.

### 4.1 bloqueio + obrigação

- **Resultado:** o bloqueio domina. Se a obrigação aponta o **mesmo `fact_key`** do bloqueio,
  descartar a obrigação e registrar `COL-BLOCK-OBLIG`.
- **Se aponta `fact_key` diferente:** ambos coexistem no `PolicyDecisionSet`. O LLM lê primeiro
  o `blocked_by`; a obrigação fica em `must_ask_now` e será processada após resolução do bloqueio
  em turno futuro.
- **Justificativa contratual:** RC-COMP-03 + AP-CP-06 (T3.1).

### 4.2 bloqueio + confirmação

- **Resultado:** ambos coexistem. Bloqueio entra em `blocked_by`; confirmação entra em
  `needs_confirmation`. A confirmação **não desbloqueia** automaticamente — apenas indica que o
  fato confirmado pode mudar o cenário em turno seguinte (ex.: `fact_rnm_status` em `captured`
  precisa confirmação; mesmo confirmado, segue bloqueando se valor for inválido).
- **Justificativa contratual:** RC-COMP-01 (bloqueio dominante na execução) + CP-05 (confirmação
  não persiste).

### 4.3 bloqueio + roteamento

- **Resultado:** **roteamento sempre suprimido.** Registrar `COL-BLOCK-ROUTE` no `collisions[]` do
  set. `current_phase` e `current_objective` permanecem inalterados pelo engine no turno.
- **Justificativa contratual:** RC-COMP-01 + CP-07 (T3.1) + AP-CP-08 (T3.1).

### 4.4 obrigação + confirmação

- **Resultado:** confirmação tem precedência operacional sobre obrigação **se ambas apontam o
  mesmo `fact_key` ou o fato sustentador da obrigação**. A obrigação fica em standby (não
  emitida no turno); o LLM busca a confirmação primeiro. Se apontam fatos distintos, ambas
  coexistem (estágios 3 e 4), ordenadas por seus respectivos critérios.
- **Justificativa contratual:** RC-COMP-02; PC-INT-02 (T3.1).

### 4.5 obrigação + sugestão mandatória

- **Resultado:** ambas coexistem. Obrigação tem prioridade hierárquica (Estágio 4 antes de
  Estágio 5). Sugestão mandatória entra como contexto auxiliar — informa o LLM sobre conduta
  durante a coleta exigida pela obrigação.
- **Justificativa contratual:** §3.3 (prioridade) + RC-COMP-04 (sugestão nunca vence).

### 4.6 múltiplas obrigações

- **Resultado:** todas coexistem; ordenadas pela tabela de §2.4 (priority → criticidade → stage →
  alfabética). Todas vão para `must_ask_now` na ordem ordenada; `recommended_next_actions` recebe
  os `ACAO_*` correspondentes.
- **Justificativa contratual:** RC-COMP-05 + T3.1 §3 (payload `ObrigacaoAction.priority`).

### 4.7 múltiplas confirmações

- **Resultado:** todas coexistem; ordenadas pela tabela de §2.3 (`hard` antes de `soft` →
  criticidade → alfabética). Todas vão para `needs_confirmation` (boolean elevado a `true`); o
  `current_objective` pode ser atualizado para `OBJ_CONFIRMAR` se houver pelo menos uma `hard`.
- **Justificativa contratual:** RC-COMP-06.

### 4.8 múltiplos roteamentos

- **Resultado:** **proibido escolher silenciosamente.** Se há ≥2 roteamentos candidatos com
  `target_phase` ou `target_objective` distintos no mesmo turno: suprimir **todos** os roteamentos
  e registrar `COL-ROUTING-MULTI` em `collisions[]`. O turno termina sem avanço de fase; o LLM
  conduz a conversa com o estado atual.
- **Caso especial:** se todos os roteamentos candidatos apontam o **mesmo** `target_phase` e
  `target_objective` (idênticos campo a campo), pode-se compactar em um único `PolicyDecision` —
  isso é deduplicação, não composição silenciosa.
- **Justificativa contratual:** RC-COMP-07 + T3.1 §7 (regra "múltiplos `roteamentos`: proibido")
  + AP-CP-05 (T3.1).

---

## 5. Política de colisão (proibição de colisão silenciosa)

### 5.1 Princípio

Toda colisão entre decisões deve ser **registrada explicitamente** no campo `collisions[]` do
`PolicyDecisionSet`. **Nenhuma decisão pode ser descartada, sobrescrita ou suprimida sem entrada
correspondente em `collisions[]`** — caso contrário, o pipeline está em violação contratual
(RC-INV-03 desta spec).

### 5.2 Códigos canônicos de colisão

| Código | Significado | Resolução |
|--------|------------|-----------|
| `COL-BLOCK-OBLIG` | Bloqueio + obrigação sobre o mesmo `fact_key` | Manter bloqueio, descartar obrigação. Registrar ambas em `collisions[]` para auditoria. |
| `COL-BLOCK-ROUTE` | Bloqueio + roteamento no mesmo turno | Manter bloqueio, suprimir roteamento. Registrar. |
| `COL-OBLIG-ROUTE` | Obrigação + roteamento sustentado pelo mesmo fato | Manter obrigação, suprimir roteamento. Registrar. |
| `COL-CONF-ROUTE` | Confirmação pendente + roteamento sobre fato dependente | Manter confirmação, suprimir roteamento. Registrar. |
| `COL-CONF-OBLIG` | Confirmação + obrigação sobre o mesmo `fact_key` | Manter confirmação, colocar obrigação em standby. Registrar. |
| `COL-ROUTING-MULTI` | ≥2 roteamentos com targets distintos no mesmo turno | Suprimir todos os roteamentos. Registrar todos os candidatos. |
| `COL-OBLIG-OBLIG-PRIO` | Obrigações com mesma priority sobre fatos distintos | Resolver por criticidade (§3.4). Registrar para telemetria. |
| `COL-CONF-CONF-LEVEL` | Confirmações com mesmo `confirmation_level` | Resolver por criticidade (§3.4). Registrar. |
| `COL-RECONCILE-FAIL` | Estágio 1 não conseguiu reconciliar conflito | Abortar avaliação. `evaluation_meta.aborted = true`. |
| `COL-INVALID-PHASE` | `current_phase` nulo ou desconhecido no Estágio 1 | Abortar avaliação. Registrar diagnóstico. |

### 5.3 Shape do registro de colisão

```
CollisionRecord {
  collision_code:    string      — código canônico (§5.2)
  involved_rules:    string[]    — rule_ids envolvidos
  involved_targets:  string[]    — fact_keys ou phases envolvidos
  resolution_taken:  string      — descrição literal da resolução aplicada
  decisions_kept:    rule_id[]   — quais decisões permaneceram
  decisions_dropped: rule_id[]   — quais decisões foram suprimidas
  meta: {
    detected_at_stage: integer    — em qual estágio (1–6) a colisão foi detectada
    evaluated_at_turn: integer
  }
}
```

**Invariante:** `decisions_kept ∪ decisions_dropped = involved_rules`. Sem perda silenciosa.

---

## 6. Shape do `PolicyDecisionSet`

A saída completa do pipeline é uma estrutura única que agrega todas as decisões, colisões e
metadados de avaliação.

```
PolicyDecisionSet {
  decisions: PolicyDecision[]      — decisões mantidas após composição
                                     (ordenadas: bloqueio → obrigação → confirmação →
                                      sugestão_mandatória → roteamento)
  collisions: CollisionRecord[]    — registro explícito de toda colisão detectada
  evaluation_meta: {
    evaluated_at_turn:  integer
    lead_state_hash:    string     — hash do lead_state usado
    pipeline_version:   string     — versão do pipeline (ex.: "T3.3-v1")
    stages_executed:    integer[]  — quais estágios rodaram (1..6); falha aborta
    aborted:            boolean    — true se a avaliação foi interrompida
    abort_reason:       string     — preenchido quando aborted=true
                                     ("unresolved_conflict" | "invalid_phase" | etc.)
    reconciliation_ok:  boolean    — saída do Estágio 1
  }
}
```

**Invariantes do set:**

- `decisions` em ordem canônica de classe (1→5 da §3.3); decisões da mesma classe ordenadas pelo
  critério do estágio correspondente.
- `aborted = true` ⇒ `decisions = []` e `collisions` contém o `CollisionRecord` que justifica o
  abort.
- Toda supressão / descarte / sobrescrita está refletida em `collisions[]`. **Nenhuma exceção.**

---

## 7. Cenários sintéticos obrigatórios

Os dez cenários abaixo são exigidos pelo escopo da PR-T3.3 e exemplificam a aplicação da ordem,
composição e desempate.

### 7.1 SC-01 — Casado civil + processo solo + renda baixa

**Estado herdado relevante:**
- `fact_estado_civil = "casado_civil"` (status `confirmed`)
- `fact_process_mode = "solo"` (status `captured`)
- `fact_monthly_income_p1 = 1800` (status `confirmed`)
- `derived_composition_needed = true`
- `current_phase = "qualification"`

**Pipeline:**
1. Estágio 1: reconciliação ok.
2. Estágio 2: nenhum bloqueio.
3. Estágio 3: nenhuma confirmação obrigatória crítica.
4. Estágio 4: `R_CASADO_CIVIL_CONJUNTO` → `obrigação` sobre `fact_process_mode` (priority=1);
   `R_SOLO_BAIXA_COMPOSICAO` parte obrigação → `obrigação` sobre coleta de composição (priority=2).
5. Estágio 5: `R_SOLO_BAIXA_COMPOSICAO` parte sugestão → `sugestão_mandatória` sobre conduta de
   composição (urgency=medium).
6. Estágio 6: nenhum roteamento.

**Composição final:** 2 obrigações (ordenadas) + 1 sugestão. Sem colisão. `must_ask_now` recebe
`fact_process_mode` antes de `fact_composition_actor`.

### 7.2 SC-02 — Autônomo + IR ausente + renda baixa

**Estado:**
- `fact_work_regime_p1 = "autônomo"` (status `confirmed`)
- `fact_autonomo_has_ir_p1` ausente
- `fact_monthly_income_p1 = 1500` (status `confirmed`)
- `derived_composition_needed = true`

**Pipeline:**
1. Estágios 1–3: limpos.
2. Estágio 4: `R_AUTONOMO_IR` variante obrigação → `obrigação` sobre `fact_autonomo_has_ir_p1`
   (priority=1); `R_SOLO_BAIXA_COMPOSICAO` parte obrigação → `obrigação` (priority=2).
3. Estágio 5: `R_SOLO_BAIXA_COMPOSICAO` parte sugestão.
4. Estágio 6: nenhum roteamento.

**Composição final:** 2 obrigações + 1 sugestão. **Não há bloqueio** — autônomo sem IR não é
inelegível automático (T3.2 §3 e RC-INV-08 desta spec).

### 7.3 SC-03 — Estrangeiro sem RNM + outra regra ativa

**Estado:**
- `fact_nationality = "estrangeiro"` (status `confirmed`)
- `fact_rnm_status = "sem_rnm"` (status `confirmed`)
- `fact_estado_civil = "casado_civil"` (status `confirmed`)
- `fact_process_mode = "solo"` (status `captured`)

**Pipeline:**
1. Estágio 2: `R_ESTRANGEIRO_SEM_RNM` → `bloqueio` sobre `fact_rnm_status` (severity `blocking`).
2. Estágio 4: `R_CASADO_CIVIL_CONJUNTO` candidato a obrigação sobre `fact_process_mode`. Não
   colide com bloqueio (fact_key diferente). **Mantida.**
3. Estágio 6: nenhum roteamento (suprimido pelo bloqueio mesmo se candidato existisse —
   RC-COMP-01).

**Composição final:** 1 bloqueio + 1 obrigação. Sem colisão. `blocked_by` recebe entrada de
`R_ESTRANGEIRO_SEM_RNM`. LLM lê o bloqueio primeiro; obrigação fica em `must_ask_now` para turno
em que o bloqueio for eventualmente resolvido.

### 7.4 SC-04 — Renda capturada por origem fraca + composição sugerida

**Estado:**
- `fact_monthly_income_p1 = 2200` (status `captured`, origem `AUDIO_TRANSCRIPT` ruim)
- `fact_process_mode = "solo"` (status `confirmed`)
- `derived_composition_needed = true` (calculado a partir do valor capturado)

**Pipeline:**
1. Estágio 3: confirmação `hard` sobre `fact_monthly_income_p1` (PC-INT-02 T3.1).
2. Estágio 4: `R_SOLO_BAIXA_COMPOSICAO` parte obrigação seria emitida — **mas** depende do mesmo
   fato. Aplicar §4.4: obrigação fica em standby. Registrar `COL-CONF-OBLIG`.
3. Estágio 5: `R_SOLO_BAIXA_COMPOSICAO` sugestão **pode** continuar (não persiste decisão de
   negócio).

**Composição final:** 1 confirmação + 1 sugestão. Obrigação suspensa até a confirmação resolver.
Colisão `COL-CONF-OBLIG` registrada para auditoria.

### 7.5 SC-05 — P3/composição entrando depois de solo iniciado

**Estado:**
- `fact_process_mode = "solo"` (status `confirmed` em turno anterior)
- `fact_p3_required = true` (status `confirmed` neste turno)
- `current_phase = "qualification"`

**Pipeline:**
1. Estágios 1–5: limpos quanto a bloqueio/confirmação/obrigação/sugestão.
2. Estágio 6: candidato `R_ROTEAR_P3_REQUIRED` → `roteamento` para `qualification_special`. Sem
   bloqueio ativo, sem confirmação dependente. **Emitido.**

**Composição final:** 1 roteamento (`special`). `current_phase` será atualizado pelo mecânico
para `qualification_special`. Sem colisão.

### 7.6 SC-06 — Restrição/gate operacional vs avanço de fase

**Estado:**
- `fact_credit_restriction = true` (status `confirmed`)
- `fact_restriction_regularization_status = "não_iniciada"` (status `confirmed`)
- Estágio anterior pronto para avançar para `qualification`.

**Pipeline:**
1. Estágio 2: bloqueio terminal por restrição não regularizada (regra reservada — referência
   T3.1 §2.2).
2. Estágio 6: roteamento candidato suprimido. Registrar `COL-BLOCK-ROUTE`.

**Composição final:** 1 bloqueio + colisão `COL-BLOCK-ROUTE`. Avanço de fase impedido.

### 7.7 SC-07 — Duas obrigações simultâneas no mesmo turno

**Estado:**
- `fact_estado_civil = "casado_civil"` confirmado; `fact_process_mode = "solo"` capturado.
- `fact_work_regime_p1 = "autônomo"` confirmado; `fact_autonomo_has_ir_p1` ausente.

**Pipeline:**
1. Estágio 4: `R_CASADO_CIVIL_CONJUNTO` (priority=1, criticidade `fact_process_mode` índice 5);
   `R_AUTONOMO_IR` variante obrigação (priority=1, criticidade `fact_autonomo_has_ir_p1`
   índice 7).

**Composição final:** ambas mantidas, ordenadas: `R_CASADO_CIVIL_CONJUNTO` primeiro (criticidade
menor índice). `must_ask_now = [fact_process_mode, fact_autonomo_has_ir_p1]`. Sem colisão.

### 7.8 SC-08 — Duas confirmações simultâneas com criticidades diferentes

**Estado:**
- `fact_estado_civil = "casado_civil"` em `captured` (origem `INDIRECT_TEXT`).
- `fact_monthly_income_p1 = 2400` em `captured` (origem `AUDIO_TRANSCRIPT` ruim).

**Pipeline:**
1. Estágio 3: confirmação `hard` sobre `fact_estado_civil` (criticidade índice 4); confirmação
   `hard` sobre `fact_monthly_income_p1` (índice 8).

**Composição final:** ambas mantidas, ordenadas por criticidade: `fact_estado_civil` antes de
`fact_monthly_income_p1`. `needs_confirmation = true`. Sem colisão.

### 7.9 SC-09 — Bloqueio e roteamento disparando juntos

**Estado:**
- `fact_nationality = "estrangeiro"` confirmado; `fact_rnm_status = "vencido"` confirmado.
- `fact_p3_required = true` confirmado.

**Pipeline:**
1. Estágio 2: bloqueio `R_ESTRANGEIRO_SEM_RNM`.
2. Estágio 6: roteamento candidato `R_ROTEAR_P3_REQUIRED` — **suprimido** por RC-COMP-01.
   Colisão `COL-BLOCK-ROUTE` registrada.

**Composição final:** 1 bloqueio + colisão registrada. Sem roteamento.

### 7.10 SC-10 — Sugestão mandatória tentando competir com obrigação

**Estado:**
- `fact_work_regime_p1 = "autônomo"` confirmado; `fact_autonomo_has_ir_p1 = "não"` confirmado;
  renda baixa.

**Pipeline:**
1. Estágio 4: `R_SOLO_BAIXA_COMPOSICAO` parte obrigação → `obrigação` sobre composição.
2. Estágio 5: `R_AUTONOMO_IR` variante sugestão → `sugestão_mandatória` (autônomo sem IR não é
   inelegível); `R_SOLO_BAIXA_COMPOSICAO` parte sugestão.

**Composição final:** 1 obrigação + 2 sugestões. Sugestões nunca vencem obrigação (RC-COMP-04);
elas coexistem como contexto auxiliar para o LLM. Sem colisão.

---

## 8. Validação cruzada com T3.1, T3.2 e T2

| Item | Origem | Verificação |
|------|--------|-------------|
| Classes citadas (`bloqueio`, `obrigação`, `confirmação`, `sugestão_mandatória`, `roteamento`) | T3.1 §1 | 5/5 presentes; nenhuma classe extra inventada |
| Prioridade entre classes | T3.1 §7 | §3.3 reproduz a mesma ordem 1–5 |
| Invariante `action` sem `reply_text` | T3.1 §1 e CP-01 | Nenhum payload citado neste documento contém esses campos |
| Regras críticas referenciadas | T3.2 §1 | `R_CASADO_CIVIL_CONJUNTO`, `R_AUTONOMO_IR`, `R_SOLO_BAIXA_COMPOSICAO`, `R_ESTRANGEIRO_SEM_RNM` — 4/4 |
| Variantes de cada regra | T3.2 §2–§5 | Confirmação prévia (estado civil), obrigação/confirmação/sugestão (autônomo), sugestão+obrigação (solo baixa), confirmação/obrigação/bloqueio (estrangeiro) — todas honradas em §2 |
| Chaves de fato citadas | T2_DICIONARIO_FATOS §3 | `fact_nationality`, `fact_rnm_status`, `fact_credit_restriction`, `fact_restriction_regularization_status`, `fact_estado_civil`, `fact_process_mode`, `fact_composition_actor`, `fact_work_regime_p1`, `fact_autonomo_has_ir_p1`, `fact_monthly_income_p1`, `fact_has_multi_income_p1`, `fact_p3_required`, `fact_current_intent`, `fact_channel_origin` — todas presentes |
| Chaves derivadas citadas | T2_DICIONARIO_FATOS §4 | `derived_composition_needed`, `derived_rnm_required` — presentes |
| Campos do `OperationalState` modificados | T2_LEAD_STATE_V1 §3 | `blocked_by`, `must_ask_now`, `needs_confirmation`, `current_phase`, `current_objective`, `recommended_next_actions`, `last_policy_decision`, `risk_level`, `elegibility_status` — todos canônicos |
| Status canônicos de fato citados | T2_LEAD_STATE_V1 + T2_RECONCILIACAO | `hypothesis`, `captured`, `inferred`, `confirmed`, `contradicted` — todos canônicos |
| Pré-condição `T2_RECONCILIACAO` | T2.4 | Estágio 1 invoca o protocolo explicitamente |
| Confiança por origem | T2_POLITICA_CONFIANCA | Regras de origem `INDIRECT_TEXT`/`AUDIO_TRANSCRIPT` ruim citadas em §2.3 e SC-04 |
| Anti-padrões de T3.1 reforçados | T3.1 §11 | AP-CP-05, AP-CP-06, AP-CP-07, AP-CP-08 referenciados nas regras de composição e colisão |

---

## 9. Anti-padrões proibidos

| Código | Anti-padrão | Por que é proibido |
|--------|-------------|-------------------|
| AP-OC-01 | Saltar Estágio 1 (reconciliação) e ir direto para Estágio 2 | Estado não reconciliado pode produzir bloqueio falso a partir de fato em conflito |
| AP-OC-02 | Emitir bloqueio com fato em `hypothesis` | Pré-captura nunca é evidência (CP-09 T3.1; RC-COMP-09) |
| AP-OC-03 | Sobrescrever decisão sem registrar em `collisions[]` | Colisão silenciosa — proibida (RC-INV-03) |
| AP-OC-04 | Emitir obrigação sobre `fact_key` que já tem bloqueio ativo no mesmo turno | AP-CP-06 T3.1 + RC-COMP-03 |
| AP-OC-05 | Emitir roteamento ignorando bloqueio ativo | AP-CP-08 T3.1; RC-COMP-01 |
| AP-OC-06 | Escolher silenciosamente entre roteamentos conflitantes | RC-COMP-07; deve gerar `COL-ROUTING-MULTI` |
| AP-OC-07 | Persistir fato como `confirmed` apenas porque uma confirmação foi emitida | CP-05 T3.1; confirmação não persiste |
| AP-OC-08 | Promover sugestão mandatória a `severity = "blocking"` ou `"critical"` | CP-06 T3.1 + RC-COMP-04 |
| AP-OC-09 | Inferir avanço de fase a partir de fato em `inferred` ou `hypothesis` | RC-COMP-08 + PC-INT-03 (T3.1); regra terminal exige `confirmed` |
| AP-OC-10 | Inventar nova regra crítica nesta camada | Esta PR ordena e compõe — não decide regras (microetapas 3 e 4 do mestre, não a microetapa 1) |
| AP-OC-11 | Produzir `reply_text`/`mensagem_usuario`/`texto_cliente` em qualquer estágio | A00-ADENDO-01 + CA-01 + CA-08 |
| AP-OC-12 | Reordenar estágios fora da ordem canônica 1→6 | RC-INV-01 |

---

## 10. Cobertura das microetapas do mestre T3

| Microetapa do mestre | Cobertura neste artefato |
|----------------------|--------------------------|
| **Microetapa 1** — Transformar regras críticas | NÃO coberta aqui — escopo PR-T3.2 (já entregue) |
| **Microetapa 2** — Definir os 4 efeitos operacionais | NÃO coberta aqui — escopo PR-T3.1 (já entregue) |
| **Microetapa 3** — Ordem estável de avaliação | **COBERTA — §1, §2** |
| **Microetapa 4** — Política de composição | **COBERTA — §3, §4, §5, §6** |
| **Microetapa 5** — Política de veto suave | NÃO coberta aqui — escopo PR-T3.4 |

---

## 11. Regras invioláveis

| Código | Regra |
|--------|-------|
| RC-INV-01 | Os seis estágios são executados em ordem 1→6. Pular ou reordenar é não conformidade. |
| RC-INV-02 | Fato em `hypothesis` jamais sustenta bloqueio (confirma CP-09 T3.1). |
| RC-INV-03 | Nenhuma decisão pode ser descartada, suprimida ou sobrescrita sem entrada explícita em `collisions[]`. |
| RC-INV-04 | Confirmação nunca persiste fato — apenas sinaliza necessidade (confirma CP-05 T3.1). |
| RC-INV-05 | Sugestão mandatória nunca vence bloqueio, confirmação ou obrigação na composição final. |
| RC-INV-06 | Roteamento jamais executa quando há bloqueio ativo no mesmo turno. |
| RC-INV-07 | Roteamento jamais executa sobre fato que ainda exige confirmação `hard` no mesmo turno. |
| RC-INV-08 | Autônomo sem IR (`fact_autonomo_has_ir_p1 = "não"`) **não é inelegível automático** — emite sugestão mandatória, nunca bloqueio direto (confirma T3.2 §3). |
| RC-INV-09 | Decisão de inelegibilidade terminal (`transition_type = "abort"`) exige fato sustentador em `status = "confirmed"`. Inferência ou hipótese não basta. |
| RC-INV-10 | Renda solo baixa (`R_SOLO_BAIXA_COMPOSICAO`) **nunca emite bloqueio** e **nunca seta `elegibility_status = "ineligible"`** (confirma T3.2 §4). |
| RC-INV-11 | Toda chave referenciada é canônica em `T2_DICIONARIO_FATOS` ou `T2_LEAD_STATE_V1`. Inventar campo é não conformidade. |
| RC-INV-12 | Nenhum estágio produz `reply_text`, `mensagem_usuario`, `texto_cliente` ou equivalente (confirma A00-ADENDO-01 e CA-01). |

---

## Bloco E — PR-T3.3

| Campo | Valor |
|-------|-------|
| PR | PR-T3.3 — Ordem de avaliação e composição de políticas |
| Data | 2026-04-25 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (este documento) |
| Status | CONCLUÍDA |
| Documento-base da evidência | `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` |
| Estado da evidência | completa |
| Há lacuna remanescente? | não — 6 estágios numerados (§2); matriz de composição 5×5 (§3.2); regra de desempate em 4 níveis (§3.4–§3.5); 8 combinações específicas (§4); política de colisão com 10 códigos canônicos (§5); shape `PolicyDecisionSet` (§6); 10 cenários sintéticos SC-01..10 (§7); validação cruzada T3.1/T3.2/T2 (§8); 12 anti-padrões AP-OC-01..12 (§9); 12 regras invioláveis RC-INV-01..12 (§11); microetapas 3 e 4 cobertas (§10) |
| Há item parcial/inconclusivo bloqueante? | não |
| Fechamento permitido nesta PR? | sim |
| Estado permitido após esta PR | PR-T3.3 CONCLUÍDA; PR-T3.4 desbloqueada |
| Próxima PR autorizada | **PR-T3.4 — Veto suave + validador pós-resposta/pré-persistência** |
| Prova P-T3-01 | Inspeção do documento: nenhum payload de `action`, `decisions` ou estágio contém `reply_text`, `mensagem_usuario`, `texto_cliente`, `resposta` ou `frase`. Estágios produzem apenas `PolicyDecision` estruturadas e `CollisionRecord`. |
| Prova P-T3-02 | Todas as `fact_key` (`fact_nationality`, `fact_rnm_status`, `fact_credit_restriction`, `fact_restriction_regularization_status`, `fact_estado_civil`, `fact_process_mode`, `fact_composition_actor`, `fact_work_regime_p1`, `fact_autonomo_has_ir_p1`, `fact_monthly_income_p1`, `fact_has_multi_income_p1`, `fact_p3_required`, `fact_current_intent`, `fact_channel_origin`) e `derived_*` (`derived_composition_needed`, `derived_rnm_required`) referenciam chaves canônicas existentes em `T2_DICIONARIO_FATOS`. Nenhuma chave inventada. |
| Prova P-T3-03 | Microetapas 3 (ordem estável) e 4 (composição) cobertas — declaração explícita em §10. |
| Conformidade CA-03 | Confirmada — ordem estável numerada (§2) e proibição de colisão silenciosa (§5) |
| Conformidade CA-07 | Confirmada — todos os campos referenciam `T2_LEAD_STATE_V1` e `T2_DICIONARIO_FATOS` |
| Conformidade CA-08 | Confirmada — engine apenas estrutura e ordena `PolicyDecision`; LLM permanece soberano na fala |
| Conformidade CA-09 | Confirmada — microetapas 3 e 4 cobertas (§10); 1, 2 e 5 declaradas como escopo de outras PRs |
| Conformidade A00-ADENDO-01 | Confirmada — soberania do LLM na fala preservada; nenhum estágio escreve fala |
| Conformidade A00-ADENDO-02 | Confirmada — identidade MCMV preservada; ordem orienta sem engessar conduta |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente; estado da evidência declarado completo |
