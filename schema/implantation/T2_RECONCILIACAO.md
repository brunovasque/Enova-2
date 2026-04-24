# T2_RECONCILIACAO — Reconciliação e Tipologia de Fatos — ENOVA 2

## Finalidade

Este documento define a **tipologia formal de todos os estados de fato** na ENOVA 2 e o
**protocolo canônico de reconciliação** de conflitos entre dados.

Toda mudança de dado no `lead_state` que contradiga um valor existente deve passar por
este protocolo. **Não existe sobrescrita silenciosa. Não existe dado "mais recente" que
automaticamente vence.** A história de cada fato é auditável e imutável como registro.

**Pré-requisitos obrigatórios:**
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — status e shapes de FactEntry/Conflict.
- `schema/implantation/T2_POLITICA_CONFIANCA.md` (PR-T2.3) — origens e condições de confirmação.

**Princípio canônico:**
> Reconciliação não é escolher o dado mais recente.
> Reconciliação é o processo auditável pelo qual o lead confirma qual dado é o correto,
> e o mecânico registra a transição com trilha de origem, turno e motivo.
> O LLM conduz. O mecânico decide a persistência. Nenhum bloco redige `reply_text`.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T2, p. 5–6 (tipologia, reconciliação,
  auditoria de updates, casos de mudança de versão, teste de conflitos)
- `schema/implantation/T2_LEAD_STATE_V1.md` — FactEntry, Conflict shape, status canônicos
- `schema/implantation/T2_POLITICA_CONFIANCA.md` — origens, prioridades, condições
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` — CONF_*, PEND_*, OBJ_*, ACAO_*
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. Tipologia formal de estados de fato

### 1.1 Tabela canônica dos 7 estados

| Estado | Nome formal | Persiste no `lead_state`? | Pode acionar decisão de negócio? | Requer confirmação para avançar? |
|--------|------------|:------------------------:|:--------------------------------:|:---------------------------------:|
| `hypothesis` | Hipótese cognitiva | não (pré-captura) | não — nunca | não aplicável — recoleta obrigatória |
| `captured` | Fato bruto | sim | parcialmente (fatos não críticos) | sim para fatos críticos |
| `inferred` | Inferência | sim (`derived_*` apenas) | parcialmente (`derived_*`) | sim antes de decisão bloqueante |
| `confirmed` | Fato confirmado | sim | sim — com auditabilidade | não (já confirmado) |
| `contradicted` | Conflito ativo | sim | bloqueado | sim — resolução obrigatória |
| `pending` | Pendência | sim (como `Pending[]`) | não — bloqueia avanço | não aplicável — coleta obrigatória |
| `obsolete` | Obsoleto | sim (histórico permanente) | não — estado terminal | não aplicável |

### 1.2 Definições canônicas

#### Estado 1 — `hypothesis` (Hipótese cognitiva)

**O que é:** Cogitação do LLM sobre um fato não coletado. O LLM "acha" ou "percebe" que
o lead provavelmente tem certa característica, mas o lead ainda não declarou.

**Onde fica:** No raciocínio interno do LLM durante o turno. **Não persiste como `FactEntry`.**
O mecânico registra a necessidade de coleta como `Pending`, não a hipótese em si.

**O que gera:** `PEND_SLOT_VAZIO` → `OBJ_COLETAR` para o fato correspondente.

**Regras:**
- RC-H1: Hipótese não persiste como valor de `fact_*` no `lead_state`.
- RC-H2: Hipótese nunca é apresentada ao lead como certeza ("você provavelmente é autônomo").
- RC-H3: Hipótese que se confirma por coleta direta → `captured` (não pula etapas).

---

#### Estado 2 — `captured` (Fato bruto)

**O que é:** Dado coletado via qualquer canal e registrado no `lead_state`, mas ainda não
confirmado explicitamente pelo lead. É a coleta inicial de qualquer fato.

**Onde fica:** `facts.<fact_key>` com `status = "captured"`, `confirmed = false`.

**Pode ser usado para:** Raciocínio do LLM; cálculos preliminares de `derived_*`; gerar
`OBJ_CONFIRMAR` para fatos críticos.

**Regras:**
- RC-C1: Fato bruto pode ser substituído por novo dado mais preciso sem gerar conflito formal,
  desde que o fato anterior não seja `confirmed`.
- RC-C2: Fato bruto de fato crítico (ver T2_POLITICA_CONFIANCA §5) exige passagem por
  confirmação antes de acionar qualquer decisão bloqueante.
- RC-C3: Se novo dado contradiz `captured` existente → mecânico pode aceitar o mais recente
  com registro de turno, ou gerar conflito se a contradição for relevante. Regra de ouro: se
  o lead contradiz o próprio `captured` com texto explícito, o novo dado substitui e o
  anterior entra como `obsolete` com registro.

---

#### Estado 3 — `inferred` (Inferência)

**O que é:** Fato calculado automaticamente pelo mecânico a partir de outros fatos confirmados
via regra determinística. Nunca coletado diretamente do lead. Vai exclusivamente para `derived_*`.

**Onde fica:** `derived.<derived_key>` com shape `DerivedEntry`.

**Pode ser usado para:** Informar o LLM; calcular elegibilidade provável; sinalizar riscos;
alimentar sugestões de `OBJ_*`. **Nunca para substituir `fact_*`.**

**Regras:**
- RC-I1: Inferência nunca sobrescreve `fact_*` (M-08, LS-03).
- RC-I2: Inferência nunca atinge status `confirmed` (PC-03).
- RC-I3: Se `derived_*` inferido seria usado como único suporte de decisão bloqueante
  (ex.: `derived_rnm_block` para acionar inelegibilidade), os `fact_*` de base devem ser
  `confirmed` antes de executar a ação.
- RC-I4: Quando `fact_*` de base muda, o `derived_*` dependente deve ser recalculado
  (`stale = true` até recalculado).

---

#### Estado 4 — `confirmed` (Fato confirmado)

**O que é:** Fato que o lead confirmou explicitamente durante um turno de confirmação.
É a fonte de verdade canônica para decisões de negócio.

**Onde fica:** `facts.<fact_key>` com `status = "confirmed"`, `confirmed = true`.

**Pode ser usado para:** Todas as decisões de negócio; acionamento de `ACAO_*`; base de
`derived_*`; avanço de stage; handoff.

**Regras:**
- RC-CF1: Fato confirmado é **imutável sem reconciliação formal** (RC-02, M-07, LS-02).
  Novo dado contraditório NUNCA sobrescreve — SEMPRE gera conflito registrado primeiro.
- RC-CF2: A trilha de confirmação deve incluir: `turn_set`, `source = "confirmed"`,
  `confirmed = true`, e a entrada de Conflict resolvida que levou à confirmação (quando aplicável).
- RC-CF3: Fato confirmado pode virar `contradicted` se novo dado é incompatível. O fato
  anterior permanece como `contradicted` até resolução; não some do `lead_state`.

---

#### Estado 5 — `contradicted` (Conflito ativo)

**O que é:** Fato que entrou em contradição com dado novo. O fato original permanece no
`lead_state` com este status enquanto o conflito não for resolvido.

**Onde fica:** `facts.<fact_key>` com `status = "contradicted"`; e entrada correspondente
em `conflicts[]` com `resolved = false`.

**Efeito:** `operational.needs_confirmation = true`; bloqueia avanço de stage; gera
`OBJ_CONFIRMAR`.

**Regras:**
- RC-CO1: Dado em `contradicted` não pode ser usado como base de decisão de negócio.
- RC-CO2: Conflito deve ser resolvido antes que o case avance de stage.
- RC-CO3: Após resolução: dado confirmado → `confirmed`; dado descartado → `obsolete`;
  `Conflict.resolved = true`; `needs_confirmation = false`.
- RC-CO4: Não existe resolução automática de conflito — lead sempre participa.

---

#### Estado 6 — `pending` (Pendência)

**O que é:** Slot obrigatório para o stage atual que não foi preenchido. Não é um erro — é
um estado operacional que sinaliza que coleta está em andamento.

**Onde fica:** `pending[]` com tipo `PEND_*` e `target` apontando para o `fact_key` ausente.

**Efeito:** Bloqueia avanço de stage para o slot em questão; gera `OBJ_COLETAR` ou
`OBJ_CONFIRMAR`.

**Regras:**
- RC-P1: Pendência é resolvida quando o `fact_key` alvo atinge status `captured` por origem
  confiável (para slots não críticos) ou `confirmed` (para fatos críticos do stage).
- RC-P2: Pendência não é exposta ao lead como "campo faltando" — o LLM conduz a coleta
  naturalmente.
- RC-P3: Pendência de P2/P3 só existe quando `fact_process_mode` indica processo conjunto/P3.

---

#### Estado 7 — `obsolete` (Obsoleto)

**O que é:** Fato que foi substituído por outro via reconciliação formal. Representa o valor
anterior que foi descartado pelo lead ou pelo operador com registro auditável.

**Onde fica:** Permanece em `facts.<fact_key>` com `status = "obsolete"`, como registro
histórico. Não é deletado.

**Regras:**
- RC-OB1: Obsoleto é estado terminal — não pode ser reativado como valor ativo sem novo ciclo
  de coleta e confirmação.
- RC-OB2: O registro de obsolescência deve incluir o `turn_set` da reconciliação e referência
  ao `Conflict.id` que originou a substituição.
- RC-OB3: Histórico de fatos obsoletos não pode ser apagado do `lead_state` — é trilha
  auditável permanente.

---

## 2. Protocolo de reconciliação — passo a passo

### 2.1 Fluxo canônico de entrada de novo dado

```
Novo dado recebido
        │
        ▼
┌─────────────────────────────┐
│  fact_key já existe no      │
│  lead_state?                │
└─────────────────────────────┘
     Não │                    │ Sim
         ▼                    ▼
   Registrar como       ┌─────────────────────────────┐
   captured + source    │  Status do dado existente?  │
   + turno              └─────────────────────────────┘
                          │              │             │
                          ▼              ▼             ▼
                      captured/      confirmed    contradicted
                      inferred                   (já em conflito)
                          │              │             │
                          ▼              ▼             ▼
                   Novo dado        SEMPRE gera   Aguarda
                   compatível?      CONF_*         resolução
                   /       \        imediato       do conflito
                  Sim      Não      (RC-CF1)       atual antes
                   │        │                      de novo dado
                   ▼        ▼
             Atualizar   Registrar
             com novo    CONF_* +
             source +    contradicted
             turno; old  + needs_
             → obsolete  confirmation
                         = true
```

### 2.2 Etapas detalhadas do protocolo

**Etapa 1 — Recepção do novo dado**

O mecânico recebe o novo dado via `TurnoSaida.facts_updated` com:
- `fact_key`: chave canônica do T2_DICIONARIO_FATOS
- `value`: novo valor
- `source`: origem canônica de T2_POLITICA_CONFIANCA §9.1
- `turn_set`: número do turno atual

**Etapa 2 — Verificação de existência**

O mecânico consulta `lead_state.facts[fact_key]`:
- **Não existe** → ir para Etapa 3A
- **Existe** → ir para Etapa 3B

**Etapa 3A — Primeiro registro do fato**

```
lead_state.facts[fact_key] = {
  value:      novo_valor,
  status:     "captured",
  source:     origem_registrada,
  confirmed:  false,
  turn_set:   turno_atual,
  confidence: conforme_politica_confianca
}
```
Se for fato crítico → gera `PEND_CONFIRMACAO` ou `OBJ_CONFIRMAR` conforme T2_POLITICA_CONFIANCA §6.

**Etapa 3B — Fato já existe: avaliação de compatibilidade**

3B.1 Status atual = `captured` ou `inferred`:
- Novo dado **compatível** (refinamento/confirmação): atualiza o valor; registra novo `source`
  e `turn_set`; dado anterior vai para histórico como `obsolete`.
- Novo dado **incompatível** (contradição clara): registra `CONF_DADO_CONTRADITO` ou conflito
  específico; status → `contradicted`; `needs_confirmation = true`.

3B.2 Status atual = `confirmed`:
- **Qualquer dado novo contraditório**: registra conflito CONF_* imediatamente. O fato
  confirmado permanece como `contradicted` (não como `obsolete`) até resolução. O novo dado
  entra como `captured` com `source` registrado, em paralelo. **Não substitui.** (RC-CF1)

3B.3 Status atual = `contradicted`:
- Conflito já ativo. Novo dado relacionado ao mesmo fato é registrado como contexto adicional.
  O mecânico **não empilha** novos conflitos sobre conflito não resolvido — estabiliza até
  resolução do primeiro.

**Etapa 4 — Geração de conflito (quando aplicável)**

```
lead_state.conflicts[] += {
  type:           CONF_*,
  facts_involved: [fact_key, ...],
  detected_turn:  turno_atual,
  resolution:     null,
  resolved:       false
}
lead_state.operational.needs_confirmation = true
lead_state.operational.open_contradictions += conflito
```

**Etapa 5 — Condução da confirmação (LLM)**

O mecânico passa ao LLM:
- `operational.current_objective = { type: "OBJ_CONFIRMAR", target: fact_key }`
- O LLM conduz a confirmação com naturalidade — sem expor mecânica de conflito ao lead.
- O lead declara qual dado é o correto.

**Etapa 6 — Resolução do conflito**

O mecânico registra a resolução:
```
// Dado confirmado pelo lead
lead_state.facts[fact_key] = {
  value:     valor_confirmado,
  status:    "confirmed",
  source:    "confirmed",
  confirmed: true,
  turn_set:  turno_resolucao,
  confidence: "high"
}

// Dado descartado
lead_state.facts[fact_key + "_previous"] = {
  ...dado_anterior,
  status: "obsolete"
}
// OU: manter histórico inline via registro de reconciliação

// Conflito encerrado
lead_state.conflicts[id].resolved = true
lead_state.conflicts[id].resolution = "lead confirmou <valor> no turno <n>"
lead_state.operational.needs_confirmation = false
```

**Etapa 7 — Auditoria obrigatória**

Toda reconciliação deve registrar:
- `turn_set` de detecção do conflito
- `turn_set` de resolução
- `source` do dado vencedor
- `source` do dado descartado
- Referência ao `Conflict.id`

---

## 3. Prioridade entre origens — guia para conduta do LLM

Esta hierarquia **não é automática** — o lead sempre decide em conflito. Ela orienta o LLM
sobre qual dado apresentar como "mais provável" para guiar a confirmação natural.

| Prioridade | Origem | Quando prevalece |
|------------|--------|-----------------|
| 1 — mais alta | `DOCUMENT` (legível) | Evidência objetiva; apresentar ao lead como referência |
| 2 | `EXPLICIT_TEXT` (mais recente, turno atual) | Declaração direta atual do lead |
| 3 | `confirmed` anterior (qualquer origem) | Já foi confirmado em turno anterior |
| 4 | `audio_good` / `audio_medium` | Transcrição com qualidade razoável |
| 5 | `INDIRECT_TEXT` | Baixa confiança; sempre requer reconfirmação |
| 6 — mais baixa | `INFERENCE` / `inferred` | Nunca vence dado confirmado |
| Especial | `OPERATOR_NOTE` (Vasques) | Auditável; não sobrepõe `confirmed` sem reconciliação |

**Regra crítica:** Hierarquia de prioridade **orienta a condução** do LLM, não determina
automaticamente qual dado vence. O lead sempre confirma qual é o correto.

---

## 4. Reconciliação por domínio de conflito

### 4.1 Renda — `CONF_RENDA`

**Quando ocorre:** Dado de renda falado diverge de documento enviado, ou lead ajusta renda
em turno posterior.

**Fatos envolvidos:** `fact_monthly_income_p1`, `fact_monthly_income_p2`, `fact_monthly_income_p3`.

**Protocolo específico:**
1. Documento enviado com valor diferente → `CONF_RENDA` registrado; ambos os valores preservados.
2. LLM apresenta contexto ao lead (ex.: "o holerite mostra X, você havia mencionado Y").
3. Lead confirma qual é o correto.
4. Mecânico persiste o confirmado; marca o outro como `obsolete`.
5. Se valor confirmado muda faixa de elegibilidade → recalcular `derived_eligibility_probable`
   e `derived_subsidy_band_hint`.

**Anti-padrão proibido:** Assumir que documento sempre vence fala — lead pode ter renda
adicional não refletida no holerite. O lead confirma.

---

### 4.2 Estado civil — `CONF_DADO_CONTRADITO` / `CONF_COMPOSICAO`

**Quando ocorre:** Lead muda estado civil após confirmação, ou lead casado civil declara
processo solo.

**Fatos envolvidos:** `fact_estado_civil`, `fact_process_mode`.

**Protocolo específico:**

4.2.1 Lead muda estado civil após `confirmed`:
1. `CONF_DADO_CONTRADITO` gerado imediatamente.
2. `fact_estado_civil` → `contradicted`.
3. LLM conduz confirmação natural.
4. Lead confirma novo valor → `confirmed`; anterior → `obsolete`.
5. Se novo estado civil implica `casado_civil` → `ACAO_FORCAR_CONJUNTO` reavaliada após confirmação.

4.2.2 Lead casado civil declara processo solo:
1. `CONF_COMPOSICAO` gerado.
2. Regra RN-01: casado civil implica processo conjunto.
3. LLM explica (com naturalidade) que o programa exige processo conjunto para casados no civil.
4. Lead confirma composição → `ACAO_FORCAR_CONJUNTO` executada; `fact_process_mode` → `confirmed (conjunto)`.

---

### 4.3 Regime de trabalho — `CONF_DADO_CONTRADITO`

**Quando ocorre:** Lead muda regime de trabalho após confirmação, ou regime novo implica
exigências diferentes (IR, CTPS).

**Fatos envolvidos:** `fact_work_regime_p1`, `fact_work_regime_p2`.

**Protocolo específico:**
1. Novo regime declarado → conflito se diferente do `confirmed`.
2. LLM conduz confirmação.
3. Lead confirma regime correto.
4. Se regime muda para `autônomo` → aciona `OBJ_ORIENTAR_IR` e `PEND_SLOT_VAZIO(fact_autonomo_has_ir_p1)`.
5. Se regime muda de `autônomo` para `CLT` → remove pendência de IR; verifica CTPS.

---

### 4.4 Composição e P2 — `CONF_COMPOSICAO` / `CONF_PROCESSO`

**Quando ocorre:** P2 entra depois de processo iniciado como solo; ou estado civil revela
obrigatoriedade de conjunto.

**Fatos envolvidos:** `fact_process_mode`, `fact_composition_actor`, `fact_work_regime_p2`,
`fact_monthly_income_p2`.

**Protocolo específico:**

4.4.1 P2 entra depois de solo iniciado:
1. Lead menciona cônjuge/parceiro em momento posterior.
2. `CONF_PROCESSO` gerado se `fact_process_mode = solo` confirmado.
3. LLM conduz confirmação: "você mencionou [pessoa], como fica o processo?".
4. Lead confirma processo conjunto → `fact_process_mode = conjunto` (confirmado); anterior
   `solo` → `obsolete`.
5. `PEND_P2_SLOT` gerado para `fact_work_regime_p2` e `fact_monthly_income_p2`.

4.4.2 Casado civil detectado com solo declarado (caso 4.2.2 acima): ver §4.2.

---

### 4.5 IR do autônomo — `CONF_DADO_CONTRADITO`

**Quando ocorre:** Lead autônomo afirma ter IR e depois reverte; ou diz que "não sabe" em
momento posterior.

**Fatos envolvidos:** `fact_autonomo_has_ir_p1`, `fact_autonomo_has_ir_p2`.

**Protocolo específico:**
1. Lead diz "tenho IR" → `fact_autonomo_has_ir_p1 = captured/high`.
2. Lead confirma → `confirmed`.
3. Lead depois diz "na verdade não tenho certeza" → `CONF_DADO_CONTRADITO`.
4. LLM conduz esclarecimento com naturalidade.
5. Se lead confirma que não tem IR → `confirmed (não)` ; anterior `confirmed (sim)` → `obsolete`;
   mecânico aciona `OBJ_ORIENTAR_IR` + `RISCO_IR_AUTONOMO`.
6. Se "não sabe" persiste → `captured/low`; pendência gerada; avanço de stage bloqueado para
   esse fato.

---

### 4.6 Restrição de crédito — `CONF_DADO_CONTRADITO`

**Quando ocorre:** Lead nega restrição inicialmente; depois aparece em verificação ou em
declaração posterior.

**Fatos envolvidos:** `fact_credit_restriction`, `fact_restriction_regularization_status`.

**Protocolo específico:**
1. Lead diz "não tenho restrição" → `captured`.
2. Em turno posterior lead menciona "tem uma coisa no CPF" ou documento revela → conflito.
3. `CONF_DADO_CONTRADITO` gerado.
4. LLM conduz esclarecimento (sem pressionar ou expor mecânica).
5. Lead confirma nível de restrição.
6. Se `alta` sem regularização → `ACAO_INELEGIBILIDADE` após confirmação (nunca antes).
7. `fact_restriction_regularization_status` coletado se relevante.

**Cuidado crítico:** Nunca acionar `ACAO_INELEGIBILIDADE` com dado em `captured` ou
`contradicted` — somente após `confirmed`.

---

### 4.7 Estrangeiro / RNM — `CONF_DADO_CONTRADITO`

**Quando ocorre:** Lead declara ser estrangeiro e RNM está ausente, divergente ou inválido.

**Fatos envolvidos:** `fact_nationality`, `fact_rnm_status`.

**Protocolo específico:**
1. `fact_nationality = "estrangeiro"` confirmado → `derived_rnm_required = true`.
2. `fact_rnm_status` ausente → `PEND_RNM` gerado.
3. Lead informa RNM inválido ou vencido → `fact_rnm_status = captured`; `derived_rnm_block = true`.
4. LLM conduz esclarecimento sobre situação documental.
5. Lead confirma status do RNM → `confirmed`.
6. Se `derived_rnm_block = true` com `fact_rnm_status = confirmed (inválido)` →
   `ACAO_INELEGIBILIDADE` executada; LLM informa com naturalidade.
7. Se RNM válido confirmado → bloco removido; avanço liberado.

---

### 4.8 Áudio ruim com dado crítico — protocolo de recoleta

**Quando ocorre:** Dado crítico chegou via áudio de baixa qualidade (`audio_poor`).

**Protocolo específico (conforme T2_POLITICA_CONFIANCA §3.3):**
1. Áudio recebido com qualidade ruim → dado **não persiste** como `FactEntry`.
2. Mecânico gera `PEND_SLOT_VAZIO` para o `fact_key` afetado.
3. LLM solicita reconfirmação com naturalidade (sem mencionar problema técnico).
4. Lead reenvia dado (texto ou novo áudio de boa qualidade).
5. Dado reenviado → `captured` por nova origem; segue protocolo normal.

**Anti-padrão proibido:** Persistir dado de áudio ruim como `captured` e depois "confirmar"
sem recoleta real.

---

### 4.9 Nota Vasques em conflito com fact confirmado — `operator_override` bloqueado

**Quando ocorre:** Operador tenta inserir nota do tipo `override` para `fact_*` com status
`confirmed`.

**Protocolo específico (conforme T2_LEAD_STATE_V1 §10.3, LS-11, PC-09):**
1. Nota com `type = "override"` para `fact_key` com `status = confirmed` → **BLOQUEADA**.
2. Sistema retorna erro de validação: "override proibido em fact confirmado sem reconciliação".
3. Para sobrescrever legitimamente: Vasques deve iniciar reconciliação formal:
   a. Registrar motivo auditável (`reason` obrigatório).
   b. Sistema gera conflito `CONF_DADO_CONTRADITO` com `source = operator_override`.
   c. Mecânico conduz resolução (pode ser automática se autorização executiva registrada).
   d. Fato anterior → `obsolete`; novo valor → `confirmed` via operator com trilha.
4. Nota de tipo `context` ou `conduct_instruction` → sempre permitida (não altera `FactEntry`).

---

### 4.10 Documento incompleto ou ilegível — ausência de persistência

**Quando ocorre:** Lead envia documento com campos ausentes, ilegíveis ou corrompidos.

**Protocolo específico:**
1. Documento recebido, qualidade ruim → `hypothesis` (não persiste como `FactEntry`).
2. Mecânico registra `fact_doc_*_status = captured ("parcial" ou "ilegível")`.
3. `PEND_DOCUMENTO` gerado para o documento específico.
4. LLM solicita reenvio com naturalidade.
5. Documento válido reenviado → `fact_doc_*_status = captured ("recebido")`; dados extraídos
   entram no fluxo normal de reconciliação.

---

## 5. Casos sintéticos obrigatórios

### Caso RC-01 — Renda falada diferente da renda em documento

**Estado inicial:** `fact_monthly_income_p1 = confirmed (R$ 3.500)` via texto explícito.

**Evento:** Lead envia holerite com R$ 2.950.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Holerite recebido | Detecta divergência com `confirmed` | — | — |
| — | Registra `CONF_RENDA` | — | `fact_monthly_income_p1 → contradicted` |
| — | `needs_confirmation = true` | — | Avanço bloqueado |
| — | `OBJ_CONFIRMAR(fact_monthly_income_p1)` | LLM conduz: "o holerite mostra R$ 2.950, você havia mencionado R$ 3.500. Qual é a sua renda atual?" | — |
| Lead: "o holerite está certo" | Persiste R$ 2.950 | — | `confirmed (R$ 2.950)` |
| — | R$ 3.500 → `obsolete` | — | Conflito `resolved = true` |
| — | Recalcula `derived_eligibility_probable` | — | — |

**Resultado:** `fact_monthly_income_p1 = confirmed (R$ 2.950)`. Histórico preservado.

---

### Caso RC-02 — Lead muda estado civil após confirmação

**Estado inicial:** `fact_estado_civil = confirmed (solteiro)`.

**Evento:** No turno 7, lead menciona que está em união estável.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Lead menciona união estável | Detecta divergência com `confirmed` | — | — |
| — | `CONF_DADO_CONTRADITO` gerado | — | `fact_estado_civil → contradicted` |
| — | `needs_confirmation = true` | — | — |
| — | `OBJ_CONFIRMAR` | LLM conduz com naturalidade | — |
| Lead confirma "união estável" | Persiste `união_estável` | — | `confirmed` |
| — | `solteiro` → `obsolete` | — | — |
| — | Avalia `ACAO_FORCAR_CONJUNTO` (RN-01) | — | Processo pode mudar para conjunto |

**Resultado:** Estado civil atualizado. Composição do processo reavaliada.

---

### Caso RC-03 — Cliente diz solo, mas é casado civil

**Estado inicial:** `fact_process_mode = captured (solo)`. `fact_estado_civil` ainda não confirmado.

**Evento:** Lead confirma ser `casado_civil` ao responder pergunta.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| `fact_estado_civil = confirmed (casado_civil)` | Verifica regra RN-01 | — | — |
| — | `CONF_COMPOSICAO` gerado (casado civil + solo incompatível) | — | — |
| — | `ACAO_FORCAR_CONJUNTO` aguardando confirmação | LLM explica: "Para casados no civil o programa exige processo conjunto." | — |
| Lead aceita conjunto | `ACAO_FORCAR_CONJUNTO` executada | — | `fact_process_mode = confirmed (conjunto)` |
| — | `solo` anterior → `obsolete` | — | `PEND_P2_SLOT` gerado |

**Resultado:** Processo forçado para conjunto. P2 slot gerado.

---

### Caso RC-04 — P2 entra depois de processo solo confirmado

**Estado inicial:** `fact_process_mode = confirmed (solo)`.

**Evento:** Lead menciona cônjuge com renda no turno 5.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Lead menciona cônjuge | Detecta sinal `signal_multi_income_p1` | — | — |
| — | `CONF_PROCESSO` gerado | — | `needs_confirmation = true` |
| — | `OBJ_CONFIRMAR(fact_process_mode)` | LLM: "Você mencionou seu cônjuge — vocês vão fazer o financiamento juntos?" | — |
| Lead: "sim, juntos" | Persiste `conjunto` | — | `confirmed (conjunto)` |
| — | `solo` → `obsolete` | — | — |
| — | Gera `PEND_P2_SLOT` para fact_work_regime_p2, fact_monthly_income_p2 | — | — |

**Resultado:** Processo atualizado para conjunto. P2 slots gerados.

---

### Caso RC-05 — Autônomo diz ter IR e depois reverte

**Estado inicial:** `fact_autonomo_has_ir_p1 = confirmed (sim)`.

**Evento:** Turno 8: lead diz "na verdade não tenho certeza se declarei".

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Nova declaração | `CONF_DADO_CONTRADITO` gerado | — | `fact_autonomo_has_ir_p1 → contradicted` |
| — | `needs_confirmation = true` | — | — |
| — | `OBJ_CONFIRMAR` | LLM: "Você havia confirmado que tem IR. Você declara IR ou não?" | — |
| Lead: "não declarei ainda" | Persiste `não` | — | `confirmed (não)` |
| — | `sim` → `obsolete` | — | — |
| — | Aciona `OBJ_ORIENTAR_IR` + `RISCO_IR_AUTONOMO` | — | — |

**Resultado:** IR não declarado. Risco `ORIENTATIVO` acionado.

---

### Caso RC-06 — Restrição negada, depois aparece

**Estado inicial:** `fact_credit_restriction = captured (nenhuma)` por texto explícito.

**Evento:** Lead menciona no turno 4 "tem uma pendência antiga".

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| "pendência antiga" | `INDIRECT_TEXT` → não persiste diretamente | LLM conduz: "Você mencionou uma pendência — pode me contar mais?" | — |
| Lead detalha: "uma dívida de 2019" | `CONF_DADO_CONTRADITO` gerado | — | `fact_credit_restriction → contradicted` |
| — | `OBJ_CONFIRMAR` | LLM conduz confirmação natural | — |
| Lead confirma restrição média | Persiste `média` | — | `confirmed (média)` |
| — | `nenhuma` → `obsolete` | — | — |
| — | Coleta `fact_restriction_regularization_status` | — | `PEND_SLOT_VAZIO` se ausente |

**Resultado:** Restrição confirmada como `média`. Sem inelegibilidade automática.

---

### Caso RC-07 — Estrangeiro com RNM ausente/divergente

**Estado inicial:** `fact_nationality = confirmed (estrangeiro)`. `fact_rnm_status` ausente.

**Evento:** Mecânico detecta `derived_rnm_required = true`. `PEND_RNM` gerado.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| `derived_rnm_required = true` | Gera `PEND_RNM` | LLM conduz: "preciso verificar sua situação de RNM" | — |
| Lead: "tenho mas está vencido" | Registra `fact_rnm_status = captured (vencido)` | — | — |
| — | `OBJ_CONFIRMAR` (fato crítico) | LLM confirma | `confirmed (vencido)` |
| — | `derived_rnm_block = true` | — | Bloqueio detectado |
| — | **Não executa `ACAO_INELEGIBILIDADE`** ainda | LLM informa situação com naturalidade | — |
| — | Aguarda `fact_rnm_status = confirmed (inválido)` + decisão explícita | — | — |

**Resultado:** Lead informado. Bloqueio ativo. Inelegibilidade somente após confirmação formal.

---

### Caso RC-08 — Áudio ruim trouxe dado crítico

**Estado inicial:** `fact_monthly_income_p1` ausente.

**Evento:** Lead manda áudio com qualidade ruim declarando renda.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Áudio recebido (`audio_poor`) | Não persiste valor | — | `PEND_SLOT_VAZIO(fact_monthly_income_p1)` |
| — | Sem `FactEntry` criado | LLM solicita confirmação com naturalidade | — |
| Lead reenvia texto: "R$ 2.800" | `captured/high` por `llm_collected` | — | — |
| — | `OBJ_CONFIRMAR` (fato crítico) | LLM conduz confirmação | — |
| Lead confirma | `confirmed (R$ 2.800)` | — | — |

**Resultado:** Dado crítico confirmado sem depender do áudio ruim.

---

### Caso RC-09 — Nota Vasques vs fact confirmado

**Estado inicial:** `fact_credit_restriction = confirmed (baixa)`.

**Evento:** Vasques tenta inserir `override` para `credit_restriction = alta`.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Nota `override` recebida | Valida: `fact_key` em `confirmed` | — | — |
| — | **Bloqueia override direto** (RC-CF1, LS-11) | — | Nota inválida |
| — | Notifica Vasques: "reconciliação formal necessária" | — | — |
| Vasques registra reconciliação formal com `reason` | `CONF_DADO_CONTRADITO` via `operator_override` | — | `contradicted` |
| — | `OBJ_CONFIRMAR` ou autorização executiva | — | — |
| Resolução registrada | `confirmed (alta)` + `baixa → obsolete` | — | Conflito `resolved` |

**Resultado:** Override bloqueado. Reconciliação formal aplicada com trilha auditável.

---

### Caso RC-10 — Documento incompleto ou ilegível

**Estado inicial:** `fact_doc_income_status` aguardando documento.

**Evento:** Lead envia foto do holerite desfocada.

| Etapa | Mecânico | LLM | Estado |
|-------|---------|-----|--------|
| Documento recebido com qualidade ruim | `fact_doc_income_status = captured ("parcial")` | — | — |
| — | `PEND_DOCUMENTO` gerado | LLM solicita reenvio com naturalidade | — |
| Lead reenvia foto clara | `fact_doc_income_status = captured ("recebido")` | — | — |
| — | Extrai valor de renda → entra em fluxo normal (Caso RC-01 se divergir) | — | — |

**Resultado:** Documento ilegível não persiste dado. Reenvio solicitado sem expor problema técnico.

---

## 6. Regras de transição de status — tabela consolidada

| De → Para | Condição obrigatória | Autorizado por |
|-----------|---------------------|---------------|
| `hypothesis` → `captured` | Coleta direta por origem confiável | LLM coleta; mecânico persiste |
| `captured` → `confirmed` | Confirmação explícita do lead + turno registrado | Mecânico após `OBJ_CONFIRMAR` resolvido |
| `captured` → `contradicted` | Novo dado incompatível; conflito registrado | Mecânico detecta e registra `CONF_*` |
| `captured` → `obsolete` | Dado compatível mais preciso substitui; ou reconciliação | Mecânico com registro de turno |
| `inferred` → `confirmed` | **Proibido** | — (PC-03, RC-I2) |
| `inferred` → recalculado | Fato de base mudou (`stale = true`) | Mecânico recalcula |
| `confirmed` → `contradicted` | Novo dado incompatível; conflito registrado | Mecânico — CONF_* obrigatório (RC-CF1) |
| `confirmed` → `obsolete` | Após resolução de conflito; lead confirmou outro valor | Mecânico após resolução (RC-CF3) |
| `contradicted` → `confirmed` | Lead confirma qual valor é o correto | Mecânico após resolução do CONF_* |
| `contradicted` → `obsolete` | Lead descartou este valor durante resolução | Mecânico após resolução |
| `obsolete` → qualquer | **Proibido** (estado terminal) | — (RC-OB1) |
| `pending` → resolvido | `fact_key` alvo atingiu `captured`/`confirmed` | Mecânico remove do `pending[]` |

---

## 7. Anti-padrões proibidos

| # | Anti-padrão | Consequência | Regra violada |
|---|-------------|-------------|--------------|
| AP-01 | Substituir `fact_*` confirmado sem registrar `CONF_*` | Perda de rastreabilidade; rollback obrigatório | RC-CF1, RC-02, PC-08 |
| AP-02 | Assumir que dado mais recente vence automaticamente | Conflito silencioso | RC-CF1, regra mestre T2 |
| AP-03 | Persistir dado de `audio_poor` como `FactEntry` | Dado não-confiável como base de decisão | PC-06, §3.3 do T2_POLITICA_CONFIANCA |
| AP-04 | Promover `inferred` diretamente para `confirmed` | Inferência vira verdade sem coleta | PC-03, RC-I2 |
| AP-05 | Usar `hypothesis` do LLM como dado de negócio | Especulação tratada como fato | RC-H1 |
| AP-06 | Apagar fato `obsolete` do `lead_state` | Perda de histórico auditável | RC-OB3 |
| AP-07 | Empilhar conflitos sem resolver o anterior | Estado inconsistente | §2.1 Etapa 3B.3 |
| AP-08 | `ACAO_INELEGIBILIDADE` com dado em `captured` ou `contradicted` | Inelegibilidade baseada em dado não confirmado | RC-06, RC-07 |
| AP-09 | Nota Vasques `override` em `fact_*` `confirmed` sem reconciliação | Violação de auditabilidade | RC-CF1, LS-11, PC-09 |
| AP-10 | Remover `PEND_*` sem que o fato alvo atinja o status exigido | Pendência silenciosamente resolvida | RC-P1 |
| AP-11 | LLM apresentar resultado da reconciliação mecanicamente | "Atualizei sua renda para R$ 2.950" — expõe mecânica | A00-ADENDO-01, M-01 |
| AP-12 | `derived_*` sobrescrever `fact_*` correspondente | Inferência apaga evidência direta | M-08, LS-03, RC-I1 |

---

## 8. Regras invioláveis da reconciliação

| # | Regra | Referência |
|---|-------|-----------|
| RC-01 | Toda atualização de `FactEntry` deve registrar `source`, `turn_set` e justificativa. | Mestre T2 p. 6 |
| RC-02 | Fato `confirmed` é imutável sem reconciliação formal com trilha auditável. | RC-02, M-07, LS-02 |
| RC-03 | Conflito silencioso é proibido — toda contradição gera `CONF_*` registrado. | PC-08 |
| RC-04 | Fato `obsolete` não pode ser apagado — é histórico permanente. | RC-OB3 |
| RC-05 | Reconciliação não é automática — o lead sempre participa da confirmação. | RC-CO4 |
| RC-06 | `ACAO_INELEGIBILIDADE` só é executada após `fact_*` relevante `confirmed`. | §4.6, §4.7 |
| RC-07 | Nota Vasques `override` sobre `fact_*` `confirmed` exige reconciliação formal com `reason`. | LS-11, PC-09 |
| RC-08 | Inferência nunca vence fato confirmado — `derived_*` não sobrescreve `fact_*`. | M-08, LS-03, RC-I1 |
| RC-09 | Nenhum bloco de reconciliação produz `reply_text` — o LLM conduz via linguagem natural. | A00-ADENDO-01, M-01 |
| RC-10 | Toda reconciliação registra: turno de detecção, turno de resolução, source vencedor, source descartado, Conflict.id. | §2.2 Etapa 7 |

---

## 9. Amarração ao `lead_state` v1 e à política de confiança

| Campo no `lead_state` | Impactado por este protocolo |
|-----------------------|-----------------------------|
| `facts.<key>.status` | Determinado pelas transições de §6 |
| `facts.<key>.source` | Registrado conforme T2_POLITICA_CONFIANCA §9.1 |
| `facts.<key>.confirmed` | `true` somente após `confirmed` via reconciliação |
| `facts.<key>.turn_set` | Atualizado em toda reconciliação |
| `operational.needs_confirmation` | `true` quando `contradicted` ativo (§2.2 Etapa 4) |
| `operational.open_contradictions` | Populado com `CONF_*` ativo |
| `operational.current_objective` | `OBJ_CONFIRMAR` gerado na Etapa 5 |
| `conflicts[]` | Populado na Etapa 4; `resolved = true` na Etapa 6 |
| `pending[]` | `PEND_*` gerado conforme §1.2 Estado 6; removido quando resolvido |
| `history.snapshot` | Atualizado após cada reconciliação relevante (novo milestone) |
| `vasques_notes[]` | Override bloqueado se fact `confirmed`; reconciliação via fluxo §4.9 |
| `derived.*` | Recalculado quando `fact_*` de base muda (`stale = true`) |

---

## 10. Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_RECONCILIACAO.md (este documento)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — tipologia formal dos 7 estados (§1);
                                       protocolo de reconciliação passo a passo (§2) com
                                       fluxograma e 7 etapas detalhadas;
                                       prioridade entre origens com regra crítica de
                                       não-automatismo (§3);
                                       reconciliação por domínio: renda, estado civil,
                                       regime de trabalho, composição/P2, IR autônomo,
                                       restrição, RNM, áudio ruim, Vasques, doc ilegível
                                       (§4.1–§4.10 — 10 domínios = 10 casos obrigatórios);
                                       10 casos sintéticos com tabela passo a passo (§5);
                                       tabela de transições de status (§6);
                                       12 anti-padrões proibidos (§7);
                                       10 regras invioláveis RC-01..RC-10 (§8);
                                       amarração ao lead_state v1 e política de confiança (§9).
Há item parcial/inconclusivo bloqueante?: não — resumo persistido para turnos longos e
                                       mapeamento de compatibilidade E1 são escopo de
                                       T2.5, não desta PR.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.4 encerrada; T2_RECONCILIACAO.md publicado;
                                       PR-T2.5 desbloqueada
Próxima PR autorizada:                 PR-T2.5 — Resumo persistido + compatibilidade
                                       transitória com legado E1
```
