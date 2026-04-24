# T2_POLITICA_CONFIANCA — Política de Confiança por Origem do Dado — ENOVA 2

## Finalidade

Este documento define a **política canônica de confiança por origem do dado** na ENOVA 2:
de onde vem cada fato coletado, qual o nível de confiança que essa origem confere, quando
o dado pode avançar de status, quando exige confirmação, quando gera conflito e quando
bloqueia avanço de stage.

Toda atribuição de status a um `fact_*` deve ser justificada por uma origem registrada.
**Origem sem registro é dado sem auditabilidade — dado sem auditabilidade não pode ser persistido
como `confirmed`.**

**Pré-requisitos obrigatórios:**
- `schema/implantation/T2_DICIONARIO_FATOS.md` (PR-T2.1) — 50 chaves canônicas.
- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — status de fato, shapes de FactEntry
  e conflito, bloco VasquesNotes.

**Princípio canônico:**
> Confiança é propriedade do dado, não da conversa.
> O LLM não decide unilateralmente que um dado é `confirmed`.
> O mecânico persiste o status baseado na origem registrada.
> Nenhuma política de confiança produz `reply_text`. Ela informa o raciocínio do LLM.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T2, p. 5–6 (política de confiança
  por origem, testes de conflito, auditoria de updates)
- `schema/implantation/T2_LEAD_STATE_V1.md` — status canônicos de fato, FactEntry shape
- `schema/implantation/T2_DICIONARIO_FATOS.md` — 50 chaves canônicas
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` — CONF_*, PEND_*, OBJ_*
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. Status canônicos de fato — referência cruzada com T2_LEAD_STATE_V1

Esta política opera sobre os mesmos status definidos em `T2_LEAD_STATE_V1.md` §4.3, com adição
de `hypothesis` que é tratado separadamente por ser pré-captura:

| Status | Significado | Pode gerar decisão de negócio? |
|--------|-------------|-------------------------------|
| `hypothesis` | LLM cogita como provável sem coleta — pré-captura | não — nunca |
| `captured` | Coletado via conversa — não ainda confirmado | parcialmente — com restrições |
| `inferred` | Calculado pelo mecânico a partir de outros fatos | parcialmente — com restrições |
| `confirmed` | Confirmado explicitamente pelo lead | sim — com auditabilidade |
| `contradicted` | Conflito ativo — aguardando resolução | bloqueado — não até resolução |
| `obsolete` | Substituído via reconciliação formal | não — estado terminal |

> **Nota sobre `hypothesis`:** é um status cognitivo de pré-captura. Não entra no `FactEntry`
> do `lead_state` como valor persistido — fica apenas no raciocínio do LLM até ser coletado
> de forma suficiente para virar `captured`. A tipologia formal de `hypothesis` no `lead_state`
> é detalhada em `T2_RECONCILIACAO.md` (PR-T2.4).

---

## 2. As 6 origens canônicas e seus parâmetros de confiança

| # | Origem | Sigla | Nível base de confiança | Status máximo atingível diretamente |
|---|--------|-------|------------------------|--------------------------------------|
| O1 | Texto explícito do lead | `EXPLICIT_TEXT` | alto | `confirmed` (com critérios — ver §3.1) |
| O2 | Texto indireto / ambíguo | `INDIRECT_TEXT` | baixo | `captured` (nunca `confirmed` sem confirmação) |
| O3 | Áudio / transcrição | `AUDIO_TRANSCRIPT` | variável (ver §3.3) | `captured` (áudio bom) / `hypothesis` (áudio ruim) |
| O4 | Documento enviado | `DOCUMENT` | alto | `captured` → `confirmed` com validação |
| O5 | Inferência LLM / mecânica | `INFERENCE` | médio | `inferred` (nunca `captured` nem `confirmed`) |
| O6 | Nota manual Vasques | `OPERATOR_NOTE` | auditável | `operator_override` (prioridade especial — ver §3.6) |

**Regra geral de elevação de status:**
> Nenhuma origem promove diretamente um dado para `confirmed` sem que o mecânico registre
> a origem, o turno e a justificativa.
> O LLM não persiste o status — ele coleta e sinaliza; o mecânico valida e persiste.

---

## 3. Política por origem

### 3.1 O1 — Texto explícito do lead (`EXPLICIT_TEXT`)

**Definição:** Lead declarou o dado diretamente, sem ambiguidade, em linguagem clara. Ex.:
"Minha renda é R$ 2.800", "Sou autônomo", "Tenho 2 filhos".

**Nível de confiança:** alto.

**Transições autorizadas:**

| Dado coletado | Status inicial | Condição para `confirmed` |
|---------------|---------------|--------------------------|
| Fato não crítico (ex.: `fact_preferred_name`, `fact_customer_goal`) | `captured` | Uma declaração clara é suficiente |
| Fato crítico de negócio (ex.: `fact_monthly_income_p1`, `fact_estado_civil`, `fact_work_regime_p1`, `fact_credit_restriction`) | `captured` | Exige confirmação explícita antes de `confirmed` (PC-04) |
| Fato de elegibilidade com impacto bloqueante (ex.: `fact_rnm_status`, `fact_credit_restriction = alta`) | `captured` | Exige confirmação antes de acionar `ACAO_INELEGIBILIDADE` |

**Cuidados críticos:**
- Texto explícito de boa qualidade pode ter **alta confiança** mas ainda assim exigir
  confirmação quando o fato for crítico para o processo.
- Um "sim" espontâneo sem contexto claro é `INDIRECT_TEXT`, não `EXPLICIT_TEXT`.
- Texto explícito que contradiz fato `confirmed` anterior → gera `CONF_DADO_CONTRADITO`
  imediatamente, mesmo com alta confiança da nova declaração.

**Casos limítrofes:**
- Lead diz "acho que ganho em torno de 3 mil" → `INDIRECT_TEXT` (ambíguo).
- Lead diz "ganho exatamente R$ 3.000 por mês" → `EXPLICIT_TEXT` → `captured`; aguarda
  confirmação para fatos de renda (PC-04).

---

### 3.2 O2 — Texto indireto / ambíguo (`INDIRECT_TEXT`)

**Definição:** Lead mencionou o dado de passagem, sem declaração clara, com hedging ("acho",
"mais ou menos", "talvez"), ou em contexto colateral. Ex.: "Devo ter uns dois filhos, acho";
"Recebo umas coisas do governo"; "Trabalhei de carteira assinada, mas agora tá diferente".

**Nível de confiança:** baixo.

**Transições autorizadas:**

| Situação | Status máximo | Ação obrigatória |
|----------|--------------|-----------------|
| Qualquer dado por texto indireto | `captured` com `confidence = "low"` | Mecânico gera `OBJ_COLETAR` para confirmar |
| Dado crítico por texto indireto | `hypothesis` (não persiste no `lead_state` como `FactEntry`) | LLM conduz coleta direta antes de `captured` |

**Regras absolutas:**
- `INDIRECT_TEXT` **nunca** promove diretamente a `confirmed` — sempre exige passagem por coleta
  explícita antes (PC-05).
- `INDIRECT_TEXT` sobre fato crítico (renda, estado civil, restrição, RNM) → status máximo
  é `captured` com confiança baixa; gera pendência `PEND_SLOT_VAZIO` enquanto não confirmado.
- O LLM **não pode** tratar texto indireto como declaração definitiva.

**Casos limítrofes:**
- Lead diz "tenho uma restrizinha no CPF" → `INDIRECT_TEXT` sobre `fact_credit_restriction`;
  `captured/low`; `OBJ_COLETAR` gerado para confirmar nível exato.
- Lead menciona "minha esposa também trabalha" → `INDIRECT_TEXT` sobre potencial P2; pode
  sinalizar `signal_multi_income_p1` (perceptivo) mas não persiste `fact_monthly_income_p2`.

---

### 3.3 O3 — Áudio / transcrição (`AUDIO_TRANSCRIPT`)

**Definição:** Dado extraído de mensagem de voz ou transcrição automática de áudio. A
confiança varia diretamente com a qualidade da transcrição.

**Níveis de qualidade e transições:**

| Qualidade do áudio | Indicadores | Status máximo | Exige confirmação? |
|--------------------|-------------|---------------|--------------------|
| Bom | Transcrição clara, sem artefatos, contexto inequívoco | `captured` (equivalente a `EXPLICIT_TEXT` de confiança media) | sim para fatos críticos |
| Médio | Palavras duvidosas, contexto parcial, possível erro de STT | `captured` com `confidence = "low"` | sim para qualquer fato de negócio |
| Ruim | Muitos erros, contexto perdido, valor numérico ilegível | `hypothesis` (não persiste como `FactEntry` sem recoleta) | não se aplica — recoleta obrigatória |

**Regras absolutas:**
- Áudio de qualidade ruim **nunca** confirma fato crítico (PC-06). O LLM deve solicitar
  reenvio ou confirmação textual.
- Fato numérico (renda, valor) transcrito de áudio com qualidade média → `captured/low`;
  gera `PEND_CONFIRMACAO` antes de usar para cálculo de elegibilidade.
- Qualidade do áudio deve ser registrada no `FactEntry.source` como
  `"audio_good"` / `"audio_medium"` / `"audio_poor"` para rastreabilidade.

**Casos limítrofes:**
- Lead manda áudio "minha renda é dois mil e oitocentos" com boa qualidade → `captured`;
  exige confirmação antes de `confirmed` para `fact_monthly_income_p1`.
- Lead manda áudio com ruído, valor inaudível → mecânico não persiste; LLM conduz recoleta.

---

### 3.4 O4 — Documento enviado (`DOCUMENT`)

**Definição:** Dado extraído de documento físico ou digital enviado pelo lead: holerite,
CTPS, RG, comprovante de residência, declaração de IR, extrato de FGTS.

**Nível de confiança:** alto — documento é evidência objetiva.

**Transições autorizadas:**

| Situação | Status atingível | Condição |
|----------|-----------------|----------|
| Documento legível, campo relevante visível, sem divergência com fala | `captured` → `confirmed` | Leitura bem-sucedida + consistência com estado atual |
| Documento diverge de fala anterior `captured` | `captured` + `CONF_RENDA` ou conflito relevante | Mecânico sinaliza conflito; LLM conduz resolução |
| Documento diverge de fala `confirmed` | `contradicted` no fato anterior + conflito | Reconciliação obrigatória antes de persistir doc como `confirmed` |
| Documento ilegível / campo ausente / qualidade ruim | `hypothesis` | Reenvio solicitado; não persiste como `FactEntry` |

**Cuidados críticos:**
- **Documento não é prova automática de verdade** — pode conflitar com declaração do lead.
  Quando diverge de fato `confirmed` anterior, gera conflito, não sobrescreve silenciosamente.
- Documento válido de fato P2 não implica que `fact_process_mode = conjunto` foi confirmado —
  a composição do processo deve ser confirmada pelo lead.
- `fact_doc_*_status` (ex.: `fact_doc_income_status`) armazena o status do documento, não
  o valor extraído do documento. O valor vai para o fato correspondente (ex.:
  `fact_monthly_income_p1`).

**Casos limítrofes:**
- Holerite mostra R$ 2.950; lead havia dito R$ 3.200 → conflito `CONF_RENDA` entre
  `fact_monthly_income_p1` (capturado por fala) e valor do documento.
- CTPS enviada mostra vínculo há 40 meses → `fact_ctps_36m_p1 = captured/high`; pode
  promover para `confirmed` sem contradição.

---

### 3.5 O5 — Inferência LLM / mecânica (`INFERENCE`)

**Definição:** Dado derivado automaticamente a partir de outros fatos confirmados — pelo
mecânico (regra determinística) ou pelo LLM (raciocínio semântico sobre o contexto).

**Nível de confiança:** médio — depende da qualidade dos fatos de base.

**Transições autorizadas:**

| Tipo de inferência | Status atingível | Pode ser base de decisão de negócio? |
|--------------------|-----------------|--------------------------------------|
| Inferência mecânica determinística (ex.: `derived_rnm_required` de `fact_nationality`) | `inferred` | sim — para `derived_*`; não substitui `fact_*` |
| Inferência semântica do LLM sobre contexto | `hypothesis` (não persiste diretamente) | não — precisa de coleta explícita |
| Inferência sobre fato não coletado | `hypothesis` → `OBJ_COLETAR` | não |

**Regras absolutas:**
- Inferência **nunca** atinge status `confirmed` (PC-07).
- Inferência mecânica produz `derived_*`, nunca sobrescreve `fact_*` (M-08, LS-03).
- O LLM pode usar inferência para raciocinar, mas não pode reportá-la ao lead como fato
  confirmado.
- Se `derived_eligibility_probable = false` por inferência → mecânico aciona orientação, mas
  **não** declara inelegibilidade sem confirmação dos fatos de base relevantes.

**Casos limítrofes:**
- `fact_nationality = "estrangeiro"` → `derived_rnm_required = inferred/high` → correto; o
  mecânico pode acionar `OBJ_COLETAR` para `fact_rnm_status`.
- LLM percebe que lead "provavelmente é CLT" por contexto → `hypothesis`; não persiste; aciona
  `OBJ_COLETAR(fact_work_regime_p1)`.

---

### 3.6 O6 — Nota manual Vasques (`OPERATOR_NOTE`)

**Definição:** Dado ou instrução inserido manualmente pelo operador (Vasques) via
`vasques_notes` no `lead_state`. Ver `T2_LEAD_STATE_V1.md` §10.

**Nível de confiança:** auditável — confiança depende de completude da nota (author + reason
+ created_at obrigatórios).

**Transições e prioridades:**

| Situação | Status / prioridade | Condição |
|----------|---------------------|----------|
| Nota do tipo `context` ou `conduct_instruction` | informa LLM; não altera `FactEntry` | sempre |
| Nota do tipo `override` sobre `derived_*` | tem prioridade sobre o derived calculado | author + reason obrigatórios |
| Nota do tipo `override` sobre `signal_*` | tem prioridade sobre o sinal | author + reason obrigatórios |
| Nota do tipo `override` sobre `fact_*` `captured`/`inferred` | aceito com registro | reconciliação registrada obrigatória |
| Nota que tenta sobrescrever `fact_*` `confirmed` | **BLOQUEADO** — não permitido sem reconciliação formal | exige reconciliação explícita (RC-02, LS-11) |

**Regras absolutas:**
- Nota sem `author`, `created_at` ou `reason` → inválida; não é processada (M-04, LS-05).
- Nota não pode criar regra MCMV ausente na base normativa real (M-02).
- Nota não gera `reply_text` automaticamente — o LLM lê e decide como incorporar (M-01).
- Nota do Vasques tem prioridade sobre `derived_*` e `signal_*`, mas **não** sobre
  `fact_*` `confirmed` sem reconciliação (LS-11).

---

## 4. Mapa de transição de status por origem

> Esta tabela é o resumo executivo das seções §3.1–§3.6.
> Para um dado crítico, sempre ler a coluna "Confirmação obrigatória antes de `confirmed`".

| Origem | hypothesis | captured | inferred | confirmed | Confirmação obrigatória antes de `confirmed` |
|--------|:----------:|:--------:|:--------:|:---------:|----------------------------------------------|
| Texto explícito (`EXPLICIT_TEXT`) | sim (limite) | sim | não | sim (com critérios) | sim para fatos críticos |
| Texto indireto (`INDIRECT_TEXT`) | sim | sim (low) | não | **nunca diretamente** | sempre — recoleta obrigatória |
| Áudio bom (`AUDIO_TRANSCRIPT/good`) | não | sim | não | não diretamente | sim para fatos de renda/composição |
| Áudio médio (`AUDIO_TRANSCRIPT/medium`) | não | sim (low) | não | não | sempre |
| Áudio ruim (`AUDIO_TRANSCRIPT/poor`) | sim | não | não | **nunca** | recoleta obrigatória antes de `captured` |
| Documento válido (`DOCUMENT`) | não | sim | não | sim (sem conflito) | sim se conflita com fala anterior |
| Inferência mecânica (`INFERENCE/mechanic`) | não | não | sim | **nunca** | — (não aplicável) |
| Inferência LLM (`INFERENCE/llm`) | sim | não | não | **nunca** | — (não aplicável) |
| Nota Vasques (`OPERATOR_NOTE`) | não | não | não | não (status especial) | reconciliação se sobrepõe `confirmed` |

---

## 5. Fatos críticos — lista canônica

Fatos críticos são aqueles cujo valor impacta diretamente elegibilidade, roteamento, composição
ou inelegibilidade. Para esses fatos, texto explícito não é suficiente para `confirmed` — exige
confirmação explícita (PC-04).

| Fato crítico | Motivo de criticidade |
|---|---|
| `fact_monthly_income_p1` | Base de cálculo de elegibilidade e faixa de subsídio |
| `fact_monthly_income_p2` | Idem para composição conjunta |
| `fact_monthly_income_p3` | Idem para trilho P3 |
| `fact_work_regime_p1` | Determina exigências de IR e CTPS |
| `fact_estado_civil` | Pode forçar `processo = conjunto` via `ACAO_FORCAR_CONJUNTO` |
| `fact_process_mode` | Define trilha e exigibilidade de P2/P3 |
| `fact_credit_restriction` | Pode acionar `ACAO_INELEGIBILIDADE` |
| `fact_rnm_status` | Pode acionar `ACAO_INELEGIBILIDADE` para estrangeiros |
| `fact_has_multi_income_p1` | Impacta cálculo de renda total (deve ser confirmado, não inferido) |
| `fact_autonomo_has_ir_p1` | Determina bloqueio operacional para autônomos |
| `fact_ctps_36m_p1` | Determina risco `RISCO_CTPS_CURTO` |
| `fact_restriction_regularization_status` | Determina se restrição pode ser contornada |

---

## 6. Quando exige confirmação antes de avançar

Um fato **exige confirmação explícita** (gera `OBJ_CONFIRMAR` ou `PEND_CONFIRMACAO`) nas
seguintes situações:

| Condição | Ação obrigatória |
|----------|-----------------|
| Fato crítico (§5) em status `captured` por qualquer origem | mecânico gera `OBJ_CONFIRMAR`; LLM conduz confirmação natural |
| Fato coletado por `INDIRECT_TEXT` independente de criticidade | mecânico gera `PEND_SLOT_VAZIO`; LLM recoleta |
| Fato coletado por áudio médio ou ruim que é crítico | mecânico gera `PEND_CONFIRMACAO`; LLM solicita reenvio/confirmação |
| Documento enviado diverge de fato `captured` anterior | mecânico gera conflito + `OBJ_CONFIRMAR` |
| Documento enviado diverge de fato `confirmed` anterior | mecânico marca `contradicted` + `needs_confirmation = true` |
| Inferência mecânica (`derived_*`) usada como base de decisão bloqueante | mecânico confirma fatos de base antes de executar ação bloqueante |
| Nota Vasques do tipo `override` sobre `fact_*` `captured` | mecânico registra reconciliação obrigatória |

**Trava LLM-first:**
> O mecânico declara a necessidade de confirmação.
> O LLM decide como, quando e com que naturalidade conduzir a confirmação.
> O LLM não anuncia mecanicamente "preciso confirmar o dado X".

---

## 7. Quando gera conflito

Um conflito (`CONF_*`) é gerado quando há contradição entre dado novo e dado já registrado:

| Situação | Tipo de conflito gerado | Status no fato anterior |
|----------|------------------------|------------------------|
| Texto explícito novo contradiz `fact_*` `confirmed` | `CONF_DADO_CONTRADITO` | fato anterior → `contradicted` |
| Texto explícito novo contradiz `fact_*` `captured` | `CONF_DADO_CONTRADITO` | mecânico pode aceitar novo; registra histórico |
| Documento contradiz fato de renda `captured` ou `confirmed` | `CONF_RENDA` | fato anterior → `contradicted` se `confirmed` |
| Lead muda composição declarada (solo → conjunto ou inverso) | `CONF_COMPOSICAO` ou `CONF_PROCESSO` | depende do status atual |
| Áudio médio/ruim produz valor que diverge do estado | não gera conflito formal — gera `PEND_CONFIRMACAO` | fato permanece inalterado |
| Inferência diverge de fato `confirmed` | não gera conflito formal — `derived_*` não sobrescreve `fact_*` | M-08, LS-03 |

**Regra sobre conflitos silenciosos:**
> Conflito silencioso é proibido. Toda contradição deve ser registrada no `lead_state`
> como `Conflict` com `facts_involved`, `detected_turn` e `resolved = false`.
> O mecânico não pode descartar o fato anterior sem reconciliação explícita (RC-02, PC-08).

---

## 8. Quando bloqueia avanço de stage

O avanço de `current_phase` (via `ACAO_AVANÇAR_STAGE`) é bloqueado nas seguintes situações
relacionadas à confiança:

| Condição | Bloqueio | Resolução |
|----------|----------|-----------|
| Fato obrigatório do stage em status `hypothesis` apenas | bloqueia avanço | LLM coleta; fato deve atingir ao menos `captured` por origem confiável |
| Fato obrigatório do stage coletado por `INDIRECT_TEXT` (sem reconfirmação) | bloqueia avanço | LLM recoleta via `EXPLICIT_TEXT` ou `DOCUMENT` |
| Fato crítico em `captured` por áudio ruim, sem confirmação | bloqueia avanço | recoleta ou confirmação textual |
| Conflito ativo (`contradicted`) em fato obrigatório do stage | bloqueia avanço | resolução via `OBJ_CONFIRMAR` |
| Inferência usada como único suporte para fato obrigatório | bloqueia avanço | coleta direta obrigatória |
| `needs_confirmation = true` no `OperationalState` | bloqueia avanço de stage | resolução do conflito primeiro |

**Regra:**
> Para avançar de stage, todos os fatos obrigatórios do stage atual devem ter status
> `captured` por origem confiável (`EXPLICIT_TEXT` ou `DOCUMENT`) ou `confirmed`.
> `inferred` e `hypothesis` bloqueiam avanço para fatos obrigatórios.

---

## 9. Registro obrigatório por atualização de fato

Toda atualização de `FactEntry` no `lead_state` deve registrar:

```
FactEntry {
  value:       any     — valor coletado
  status:      enum    — captured | confirmed | inferred | contradicted | obsolete
  source:      enum    — ver §9.1
  confirmed:   boolean — true somente após confirmação explícita
  turn_set:    integer — turno em que foi definido/atualizado
  confidence:  enum    — "high" | "medium" | "low"
}
```

### 9.1 Valores canônicos de `source` (expandidos desta política)

| Valor de `source` | Origem correspondente | Confiança base |
|-------------------|-----------------------|----------------|
| `"llm_collected"` | Texto explícito do lead (`EXPLICIT_TEXT`) | high |
| `"llm_collected_indirect"` | Texto indireto/ambíguo (`INDIRECT_TEXT`) | low |
| `"audio_good"` | Áudio com transcrição de boa qualidade | medium-high |
| `"audio_medium"` | Áudio com qualidade média | low-medium |
| `"audio_poor"` | Áudio com artefatos / valor ilegível | muito baixo (não persiste como `captured`) |
| `"document"` | Documento enviado e legível | high |
| `"document_unreadable"` | Documento ilegível ou campo ausente | inválido (não persiste) |
| `"inferred"` | Inferência mecânica determinística | medium |
| `"llm_inferred"` | Inferência semântica do LLM | low (apenas `hypothesis`) |
| `"operator_override"` | Nota manual Vasques | auditável |
| `"system"` | Atribuição por sistema (ex.: `fact_channel_origin`) | high |
| `"confirmed"` | Confirmação explícita via turno de confirmação | high (promove a `confirmed`) |

---

## 10. Casos sintéticos de validação

### Caso S1 — Texto indireto sobre renda, depois confirmação explícita

**Contexto:** Lead diz "devo ganhar umas 2 mil e poucas", depois confirma "ganho R$ 2.300".

| Momento | Origem | Status | Ação do mecânico |
|---------|--------|--------|-----------------|
| Turno 1: "devo ganhar umas 2 mil e poucas" | `INDIRECT_TEXT` | `captured/low` | gera `PEND_SLOT_VAZIO(fact_monthly_income_p1)` |
| Turno 3: "ganho R$ 2.300" | `EXPLICIT_TEXT` | `captured/high` | remove pendência; gera `OBJ_CONFIRMAR` (fato crítico) |
| Turno 4: Lead confirma "isso mesmo, R$ 2.300" | `confirmed` via `EXPLICIT_TEXT` | `confirmed/high` | persiste; pendência encerrada |

**Resultado:** `fact_monthly_income_p1 = confirmed/high`. Avança para elegibilidade.

---

### Caso S2 — Documento contradiz fala anterior confirmada

**Contexto:** Lead disse "ganho R$ 3.500" (confirmado). Depois envia holerite com R$ 2.950.

| Momento | Origem | Status | Ação do mecânico |
|---------|--------|--------|-----------------|
| Turno 2: "ganho R$ 3.500" → confirmado | `EXPLICIT_TEXT → confirmed` | `confirmed/high` | persiste |
| Turno 6: holerite com R$ 2.950 | `DOCUMENT` | — | detecta divergência com `confirmed` anterior |
| Mecânico | — | fato anterior → `contradicted` | `CONF_RENDA` gerado; `needs_confirmation = true` |
| LLM conduz confirmação natural | — | — | lead esclarece qual valor é correto |
| Lead: "o holerite está certo, corrigi antes" | `confirmed` (doc) | `confirmed/high` (R$ 2.950) | fato R$ 3.500 → `obsolete` |

**Resultado:** `fact_monthly_income_p1 = confirmed/high (R$ 2.950)`. R$ 3.500 `obsolete`.

---

### Caso S3 — Áudio ruim + recoleta

**Contexto:** Lead manda áudio sobre estado civil, com ruído. Transcrição ilegível.

| Momento | Origem | Status | Ação do mecânico |
|---------|--------|--------|-----------------|
| Áudio recebido com ruído | `audio_poor` | `hypothesis` (não persiste) | gera `PEND_SLOT_VAZIO(fact_estado_civil)` |
| LLM solicita confirmação textual naturalmente | — | — | sem script; sem expor problema técnico ao lead |
| Turno seguinte: "sou casado no civil" | `EXPLICIT_TEXT` | `captured/high` | gera `OBJ_CONFIRMAR` (fato crítico) |
| Lead confirma | `confirmed` | `confirmed/high` | persiste; `ACAO_FORCAR_CONJUNTO` pode ser avaliada |

**Resultado:** `fact_estado_civil = confirmed`. Nenhum dado persistido do áudio ruim.

---

### Caso S4 — Inferência sem coleta → bloqueio de avanço

**Contexto:** LLM percebe por contexto que lead "deve ser autônomo" mas lead nunca declarou.

| Momento | Origem | Status | Ação do mecânico |
|---------|--------|--------|-----------------|
| LLM infere `work_regime_p1 = autônomo` | `llm_inferred` | `hypothesis` | não persiste como `FactEntry` |
| Mecânico avalia stage `qualification` | — | — | `fact_work_regime_p1` ausente = `PEND_SLOT_VAZIO` |
| Avanço de stage bloqueado | — | — | `must_ask_now = ["fact_work_regime_p1"]` |
| LLM conduz coleta natural | — | — | sem perguntar mecanicamente |

**Resultado:** Avanço bloqueado corretamente. Inferência não substitui coleta.

---

### Caso S5 — Nota Vasques sobre fato confirmado

**Contexto:** Vasques insere nota com `override` para `fact_credit_restriction`.

| Situação | Status atual | Resultado |
|----------|-------------|-----------|
| `fact_credit_restriction = confirmed (baixa)` | `confirmed` | nota `override` BLOQUEADA sem reconciliação formal |
| `fact_credit_restriction = captured (baixa)` | `captured` | nota `override` aceita; reconciliação registrada |

**Resultado:** Regra LS-11 e PC-09 aplicadas. Fato `confirmed` imutável sem reconciliação.

---

## 11. Amarração ao `lead_state` v1

| Campo no `lead_state` (T2_LEAD_STATE_V1) | Impactado por esta política |
|------------------------------------------|----------------------------|
| `facts.<fact_key>.status` | Determinado pela origem (§3) e criticidade (§5) |
| `facts.<fact_key>.source` | Registrado com valor canônico de §9.1 |
| `facts.<fact_key>.confidence` | Determinado pela qualidade da origem |
| `facts.<fact_key>.confirmed` | `true` somente após `confirmed` (PC-04, PC-05) |
| `operational.needs_confirmation` | `true` quando há fato em `contradicted` (§7) |
| `operational.blocked_by` | Populado quando avanço bloqueado (§8) |
| `operational.current_objective` | `OBJ_CONFIRMAR` gerado nas condições de §6 |
| `pending[]` | `PEND_CONFIRMACAO` ou `PEND_SLOT_VAZIO` conforme §6 |
| `conflicts[]` | `CONF_*` gerado nas condições de §7 |
| `vasques_notes[]` | Regras de §3.6 aplicam-se integralmente |

---

## 12. Regras invioláveis desta política

| # | Regra | Referência |
|---|-------|-----------|
| PC-01 | Toda atualização de `FactEntry` deve registrar `source` canônico — dado sem origem rastreável não pode ser `confirmed`. | Mestre T2 p. 6 |
| PC-02 | `hypothesis` não persiste como `FactEntry` no `lead_state` — é estado cognitivo pré-captura do LLM. | §1, §3.5 |
| PC-03 | Inferência (mecânica ou LLM) nunca atinge status `confirmed`. | §3.5, M-08 |
| PC-04 | Fatos críticos (§5) exigem confirmação explícita do lead antes de `confirmed`, mesmo por texto explícito. | §3.1, §6 |
| PC-05 | Texto indireto (`INDIRECT_TEXT`) nunca promove diretamente a `confirmed`. | §3.2 |
| PC-06 | Áudio ruim (`audio_poor`) não persiste como `FactEntry` — exige recoleta antes de `captured`. | §3.3 |
| PC-07 | Inferência semântica do LLM gera `hypothesis`; não persiste sem coleta direta. | §3.5 |
| PC-08 | Conflito silencioso é proibido — toda contradição deve ser registrada como `Conflict` com `facts_involved` e `detected_turn`. | §7, RC-02 |
| PC-09 | Nota Vasques (`operator_override`) não pode sobrescrever `fact_*` `confirmed` sem reconciliação formal explícita. | §3.6, LS-11 |
| PC-10 | Para avanço de stage, fatos obrigatórios devem ter ao menos `captured` por origem confiável — `inferred` e `hypothesis` bloqueiam. | §8 |
| PC-11 | Nenhuma política de confiança produz `reply_text`. Ela informa o raciocínio do LLM. | A00-ADENDO-01, M-01 |
| PC-12 | `derived_eligibility_probable` baseado em inferência nunca substitui confirmação dos fatos de base para decisão bloqueante. | §3.5, LS-06, M-03 |

---

## 13. Cobertura das origens exigidas pelo mestre

| Microetapa do mestre (seção T2) | Cobertura neste documento |
|-------------------------------|--------------------------|
| Texto explícito | §3.1 — COBERTA |
| Resposta indireta | §3.2 — COBERTA |
| Áudio transcrito | §3.3 — COBERTA (3 níveis de qualidade) |
| Documento lido | §3.4 — COBERTA |
| Inferência semântica | §3.5 — COBERTA (mecânica + LLM) |
| Nota manual Vasques | §3.6 — COBERTA (adicionada ao mestre) |

---

## 14. Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_POLITICA_CONFIANCA.md (este documento)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 6 origens cobertas (texto explícito, indireto,
                                       áudio/3 níveis, documento, inferência/2 tipos, Vasques);
                                       mapa de transição de status por origem (§4);
                                       lista canônica de fatos críticos (§5);
                                       condições de confirmação obrigatória (§6);
                                       condições de geração de conflito (§7);
                                       condições de bloqueio de avanço de stage (§8);
                                       valores canônicos de source (§9.1);
                                       5 casos sintéticos de validação (§10);
                                       amarração ao lead_state v1 (§11);
                                       12 regras invioláveis PC-01..PC-12;
                                       cobertura das 5 origens do mestre + Vasques (§13).
Há item parcial/inconclusivo bloqueante?: não — reconciliação formal (mecanismo de resolução
                                       de conflito e tipologia completa bruto/hipótese) é
                                       escopo de T2.4, não desta PR; esta política define
                                       quando conflito é gerado e quando bloqueia, não como
                                       é resolvido internamente.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.3 encerrada; T2_POLITICA_CONFIANCA.md publicado;
                                       PR-T2.4 desbloqueada
Próxima PR autorizada:                 PR-T2.4 — Reconciliação e tipologia (bruto/confirmado/
                                       inferência/hipótese/pendência)
```
