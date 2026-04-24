# T2_DICIONARIO_FATOS — Dicionário Canônico de Fatos — ENOVA 2

## Finalidade

Este documento define o **vocabulário canônico de fatos** da ENOVA 2: quais fatos existem, quais são
seus nomes únicos sem duplicidade semântica, de onde cada um veio (E1 ou novo), e em que categoria
de memória cada um se encaixa.

É o pré-requisito obrigatório de:
- `T2_LEAD_STATE_V1.md` (PR-T2.2) — schema estrutural usa esses nomes como chaves estáveis;
- `T2_POLITICA_CONFIANCA.md` (PR-T2.3) — política de confiança refere-se a cada fato por nome canônico;
- `T2_RECONCILIACAO.md` (PR-T2.4) — reconciliação opera sobre esses nomes;
- `T2_RESUMO_PERSISTIDO.md` (PR-T2.5) — snapshot usa o dicionário como índice.

**Princípio canônico:**
> Fatos informam o LLM. Fatos não falam com o cliente. O `reply_text` é sempre e exclusivamente do LLM.
> Nenhuma categoria de memória pode produzir texto de resposta, roteiro ou template de fala.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T2, PDF6 (facts F0–F9, estado canônico, política de memória)
- `schema/implantation/T1_TAXONOMIA_OFICIAL.md` — 18 tipos de facts confirmados em T1
- `schema/implantation/T1_CONTRATO_SAIDA.md` — 13 campos de saída do turno
- `schema/implantation/INVENTARIO_REGRAS_T0.md` — 48 regras em 7 famílias (fonte de facts de negócio)
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` — inventário real da E1
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## 1. Princípio de uso

| Regra | Descrição |
|-------|-----------|
| **Nomes únicos** | Cada conceito tem exatamente um nome canônico. Nenhum sinônimo alternativo pode ser usado como chave de persistência. |
| **Prefix `fact_`** | Fatos coletáveis do lead têm prefixo `fact_`. |
| **Prefix `derived_`** | Fatos calculados/inferidos automaticamente a partir de outros fatos têm prefixo `derived_`. |
| **Prefix `signal_`** | Sinais cognitivos operacionais têm prefixo `signal_`. Não são fatos de negócio. |
| **Memória ≠ fala** | Nenhuma categoria de memória pode gerar `reply_text`. Memória é contexto para o LLM raciocinar. |
| **E1 é fonte, não arquitetura** | Os campos E1 abaixo são insumos de evidência. O nome canônico E2 prevalece. |

---

## 2. Auditoria de duplicidade semântica E1 → E2

Esta seção registra os casos onde E1 tinha campos com semântica sobreposta e define o nome canônico
único da E2, prevenindo persistência paralela.

| Campo E1 original | Campo E1 alternativo / sobreposição | Nome canônico E2 | Resolução |
|-------------------|--------------------------------------|------------------|-----------|
| `lead_name` | — | `fact_lead_name` | Nome direto; sem sobreposição |
| `preferred_name` | — | `fact_preferred_name` | Distinto de `fact_lead_name`: é como o lead prefere ser chamado no turno |
| `nationality` | — | `fact_nationality` | Direto; alinhado com T1 |
| `rnm_required` | derivado de `nationality != "brasileiro"` | **ELIMINADO** — `derived_rnm_required` | `rnm_required` era redundante: a obrigação de RNM é derivada de `fact_nationality`. E2 não persiste campo derivável como fato primário. |
| `rnm_status` | — | `fact_rnm_status` | Direto; alinhado com T1 |
| `marital_status` | — | `fact_estado_civil` | E1 usava `marital_status` em inglês; E2 usa nomenclatura em português alinhada ao domínio MCMV |
| `process_mode` | — | `fact_process_mode` | Renomeado para consistência com prefixo `fact_`; valores: `solo`, `conjunto`, `composicao_familiar` |
| `composition_actor` | — | `fact_composition_actor` | Papel do co-participante (cônjuge, pai, irmão etc.); complementa `fact_process_mode` |
| `p3_required` | — | `fact_p3_required` | Alinhado com T1; sem sobreposição |
| `work_regime_p1` | — | `fact_work_regime_p1` | Direto; alinhado com T1 |
| `monthly_income_p1` | — | `fact_monthly_income_p1` | Direto; alinhado com T1 |
| `has_multi_income_p1` | — | `signal_multi_income_p1` (perceptivo) + `fact_has_multi_income_p1` (confirmado) | E1 tinha um único campo booleano ambíguo. E2 separa: `signal_multi_income_p1` = sinal perceptivo observado no turno antes de confirmação explícita; `fact_has_multi_income_p1` = fato confirmado diretamente pelo lead ("tenho mais de uma fonte de renda"). Sem duplicidade: namespaces distintos, semântica distinta. |
| `autonomo_has_ir_p1` | — | `fact_autonomo_has_ir_p1` | Direto; alinhado com T1 |
| `ctps_36m_p1` | — | `fact_ctps_36m_p1` | Direto; alinhado com T1 |
| `work_regime_p2` | — | `fact_work_regime_p2` | Direto; alinhado com T1 |
| `monthly_income_p2` | — | `fact_monthly_income_p2` | Direto; alinhado com T1 |
| `autonomo_has_ir_p2` | — | `fact_autonomo_has_ir_p2` | Direto; alinhado com T1 |
| `ctps_36m_p2` | — | `fact_ctps_36m_p2` | Adicionado: presente no PDF6 E1; ausente na T1 (lacuna coberta aqui) |
| `work_regime_p3` | — | `fact_work_regime_p3` | Direto; alinhado com T1 |
| `credit_restriction` | — | `fact_credit_restriction` | Direto; alinhado com T1 |
| `restriction_regularization_status` | — | `fact_restriction_regularization_status` | Direto; alinhado com T1 |
| `has_fgts` | — | `fact_has_fgts` | Sinal de FGTS; contexto de entrada/capacidade financeira |
| `entry_reserve_signal` | — | `fact_entry_reserve_signal` | Sinal de reserva para entrada; informacional |
| `benefits_signal` | — | `fact_benefits_signal` | Bolsa Família, aposentadoria etc.; contexto de renda complementar |
| `dependents_count` | `fact_dependente` (T1 — presença booleana) | `fact_dependente` (booleano) + `fact_dependents_count` (número) | E1 tinha só `dependents_count`; T1 tinha só presença. E2 separa: `fact_dependente` = sim/não; `fact_dependents_count` = número quando `fact_dependente = sim` |
| `dependents_applicable` | derivado de `process_mode` + perfil | **ELIMINADO** — `derived_dependents_applicable` | Era redundante: aplicabilidade da pergunta sobre dependente é derivável do estado do processo. E2 não persiste como fato primário. |
| `subsidy_band_hint` | derivado de renda + composição | **ELIMINADO** — `derived_subsidy_band_hint` | Era um dado inferido, não coletado. E2 trata como fact derivado. |
| `current_intent` | — | `fact_current_intent` | Intenção operacional: entender programa, seguir análise, enviar docs, visita |
| `docs_channel_choice` | — | `fact_docs_channel_choice` | Direto; alinhado com T1 |
| `visit_interest` | — | `fact_visit_interest` | Direto; alinhado com T1 |
| `stalled_reason` | — | `signal_stalled_reason` | Motivo de travamento; sinal operacional, não fato de negócio. Prefixo `signal_`. |
| `document_identity_type` | — | `fact_document_identity_type` | Tipo de documento de identidade (RG, CNH, passaporte etc.) |
| `customer_confusion_level` | — | `signal_confusion_level` | Sinal cognitivo; não é fato do lead — é percepção operacional do turno |
| `urgency_signal` | — | `signal_urgency` | Sinal cognitivo operacional |
| `trust_signal` | — | `signal_trust` | Sinal cognitivo operacional |
| `offtrack_type` | — | `signal_offtrack_type` | Sinal cognitivo; tipo de desvio (curiosidade, objeção, desabafo, lateral) |
| `channel_origin` | — | `fact_channel_origin` | Canal de origem do lead (WhatsApp, site etc.) |
| `language_mode` | — | `fact_language_mode` | Idioma/mistura linguística do lead |
| `customer_goal` | — | `fact_customer_goal` | Objetivo geral declarado pelo lead (comprar, entender, visitar etc.) |

**Fatos novos na E2 sem correspondente direto na E1:**

| Nome canônico E2 | Origem | Descrição |
|-----------------|--------|-----------|
| `fact_monthly_income_p3` | Mestre seção T2 | Renda do P3 — ausente na E1 mas exigível pelo contrato MCMV em trilho P3 |

---

## 3. Dicionário canônico de fatos — E2

### 3.1 Grupo I — Identidade e contexto base

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_lead_name` | Nome completo do lead | string | Turno 1 | ativo |
| `fact_preferred_name` | Como o lead prefere ser chamado | string | Coleta direta | ativo |
| `fact_channel_origin` | Canal de origem (WhatsApp, site, etc.) | enum | Sistema | ativo |
| `fact_language_mode` | Idioma/mistura linguística | enum | Observação de turno | ativo |
| `fact_customer_goal` | Objetivo geral declarado (comprar, entender, docs, visita) | enum | Coleta direta | ativo |

### 3.2 Grupo II — Nacionalidade e elegibilidade documental

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_nationality` | Nacionalidade (brasileiro, estrangeiro, naturalizado) | enum | Coleta direta | ativo |
| `fact_rnm_status` | Status do RNM para estrangeiros (válido, vencido, ausente, indeterminado) | enum | Coleta direta | ativo |
| `fact_document_identity_type` | Tipo de documento de identidade (RG, CNH, passaporte etc.) | enum | Coleta direta | ativo |

### 3.3 Grupo III — Estado civil e composição do processo

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_estado_civil` | Estado civil declarado (solteiro, união_estável, casado_civil, divorciado, viúvo) | enum | Coleta direta | ativo |
| `fact_process_mode` | Modo do processo (solo, conjunto, composicao_familiar) | enum | Derivado/coleta | ativo |
| `fact_composition_actor` | Papel do co-participante (cônjuge, parceiro, pai, mãe, irmão etc.) | string | Coleta direta | ativo |
| `fact_p3_required` | Processo exige terceiro participante | boolean | Derivado/coleta | ativo |

### 3.4 Grupo IV — Trabalho, renda e formalização — P1

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_work_regime_p1` | Regime de trabalho P1 (CLT, autônomo, servidor, aposentado, informal, múltiplo) | enum | Coleta direta | ativo |
| `fact_monthly_income_p1` | Renda mensal declarada P1 | decimal | Coleta direta | ativo |
| `fact_has_multi_income_p1` | Lead confirmou explicitamente possuir múltiplas fontes de renda P1 | boolean | Coleta direta | ativo |
| `fact_autonomo_has_ir_p1` | P1 autônomo tem declaração de IR (sim, não, parcial, não_informado) | enum | Coleta direta | ativo |
| `fact_ctps_36m_p1` | P1 tem CTPS com 36 meses contínuos (sim, não, parcial, não_informado) | enum | Coleta direta | ativo |

### 3.5 Grupo V — Co-participante P2

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_work_regime_p2` | Regime de trabalho P2 | enum | Coleta direta | ativo |
| `fact_monthly_income_p2` | Renda mensal P2 | decimal | Coleta direta | ativo |
| `fact_autonomo_has_ir_p2` | P2 autônomo tem IR | enum | Coleta direta | ativo |
| `fact_ctps_36m_p2` | P2 tem CTPS 36 meses | enum | Coleta direta | ativo |

### 3.6 Grupo VI — Terceiro participante P3

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_work_regime_p3` | Regime de trabalho P3 | enum | Coleta direta | ativo |
| `fact_monthly_income_p3` | Renda mensal P3 | decimal | Coleta direta | ativo |

### 3.7 Grupo VII — Restrições e reservas

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_credit_restriction` | Nível de restrição de crédito (nenhuma, baixa, média, alta) | enum | Coleta direta | ativo |
| `fact_restriction_regularization_status` | Status de regularização (regularizada, em_andamento, não_regularizada) | enum | Coleta direta | ativo |
| `fact_has_fgts` | Lead possui FGTS | boolean | Coleta direta | ativo |
| `fact_entry_reserve_signal` | Sinal de reserva para entrada (sim, não, talvez) | enum | Coleta direta | ativo |
| `fact_benefits_signal` | Sinal de benefícios sociais (Bolsa Família, aposentadoria etc.) | string | Coleta direta | ativo |

### 3.8 Grupo VIII — Dependente e contexto familiar

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_dependente` | Lead possui dependente(s) (sim, não) | boolean | Coleta direta | ativo |
| `fact_dependents_count` | Número de dependentes (quando `fact_dependente = sim`) | integer | Coleta direta | ativo |

### 3.9 Grupo IX — Documentação

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_doc_identity_status` | Status do documento de identidade (faltando, parcial, recebido, validado) | enum | Coleta/recebimento | ativo |
| `fact_doc_income_status` | Status da comprovação de renda | enum | Coleta/recebimento | ativo |
| `fact_doc_residence_status` | Status do comprovante de residência | enum | Coleta/recebimento | ativo |
| `fact_doc_ctps_status` | Status da CTPS | enum | Coleta/recebimento | ativo |
| `fact_docs_channel_choice` | Canal escolhido para envio de docs (WhatsApp, site, visita) | enum | Coleta direta | ativo |

### 3.10 Grupo X — Intenção operacional

| Chave canônica | Descrição | Tipo de dado | Fonte primária | Status E2 |
|---------------|-----------|-------------|---------------|----------|
| `fact_current_intent` | Intenção operacional atual (entender_programa, seguir_análise, enviar_docs, visitar) | enum | Coleta/inferência | ativo |
| `fact_visit_interest` | Interesse em visita presencial (sim, não, talvez) | enum | Coleta direta | ativo |

### 3.11 Grupo XI — Fatos derivados (calculados automaticamente)

> **Regra:** fatos derivados não apagam fatos brutos. Ambos coexistem com proveniência.
> Fatos derivados **não** são coletados diretamente — são computados pelo mecânico a partir de fatos confirmados.

| Chave canônica | Descrição | Derivado de | Status E2 |
|---------------|-----------|------------|----------|
| `derived_rnm_required` | RNM é obrigatório para este lead | `fact_nationality != "brasileiro"` | ativo |
| `derived_eligibility_probable` | Elegibilidade provável do lead para MCMV | múltiplos facts (renda, restrição, docs, composição) | ativo |
| `derived_composition_needed` | Composição familiar necessária para viabilizar renda | `fact_monthly_income_p1 < limite` + `fact_process_mode = solo` | ativo |
| `derived_rnm_block` | Bloqueio ativo por RNM inválido/ausente | `derived_rnm_required = true` + `fact_rnm_status != "válido"` | ativo |
| `derived_needs_confirmation` | Há fato em conflito aguardando confirmação do lead | conflito ativo no estado | ativo |
| `derived_doc_risk` | Risco documental detectado (incompleto/crítico) | fact_doc_*_status | ativo |
| `derived_dossier_profile` | Perfil de dossiê do lead (simples, médio, complexo) | composição + regime + docs | ativo |
| `derived_subsidy_band_hint` | Faixa provável de subsídio (sem prometer resultado bancário) | renda total + composição | ativo |
| `derived_dependents_applicable` | Pergunta sobre dependente faz sentido para este caso | `fact_process_mode` + perfil | ativo |

### 3.12 Grupo XII — Sinais cognitivos operacionais

> **Regra:** sinais cognitivos não são fatos de negócio. Informam o LLM sobre o estado conversacional,
> não sobre o caso MCMV. Nunca determinam decisão de negócio (elegibilidade, bloqueio, avanço).

| Chave canônica | Descrição | Natureza | Status E2 |
|---------------|-----------|---------|----------|
| `signal_confusion_level` | Nível de confusão do lead no turno (baixo, médio, alto) | perceptivo/operacional | ativo |
| `signal_urgency` | Urgência percebida do lead (baixo, médio, alto) | perceptivo/operacional | ativo |
| `signal_trust` | Nível de confiança/rapport percebido (baixo, médio, alto) | perceptivo/operacional | ativo |
| `signal_offtrack_type` | Tipo de desvio (curiosidade, objeção, desabafo, pergunta_lateral) | operacional | ativo |
| `signal_stalled_reason` | Motivo de travamento (tempo, medo, docs, curiosidade etc.) | operacional | ativo |
| `signal_multi_income_p1` | Sinal de múltiplas fontes de renda P1 (antes de confirmar) | perceptivo | ativo |

---

## 4. Categorias de memória — E2

T2 reconhece **7 categorias de memória** com papéis e limites distintos. Nenhuma categoria pode
produzir `reply_text` — todas informam o LLM, que decide como falar.

### 4.1 Memória de atendimento

**O que é:** fatos coletados e confirmados neste case específico (lead + sessions). É a coleção de
`fact_*` do Grupo I ao X. Persiste entre sessões e não pode ser descartada sem reconciliação.

**Pode:**
- Guardar qualquer `fact_*` confirmado pelo lead.
- Ser atualizada via reconciliação explícita (não por sobrescrita silenciosa).
- Informar o LLM sobre o perfil atual do lead.
- Alimentar `derived_*` como base de cálculo.

**Não pode:**
- Produzir texto de resposta.
- Ser descartada sem que o conflito seja registrado e resolvido.
- Guardar fatos de outro lead no mesmo registro.
- Ser marcada como `confirmed` sem evidência suficiente de coleta direta.

---

### 4.2 Memória normativa/MCMV

**O que é:** base de conhecimento das regras do programa MCMV: faixas de renda, exigências por
perfil, documentação obrigatória, restrições legais. Vem do legado (L03, L19, INVENTARIO_REGRAS_T0)
e é estática por versão de política. Não é específica por lead.

**Pode:**
- Informar o LLM sobre regras do programa ao raciocinar sobre um caso.
- Ser consultada pelo policy engine para aplicar regras.
- Ser atualizada via change review formal quando a política MCMV mudar.

**Não pode:**
- Inventar regra ausente na base normativa real.
- Prometer aprovação, taxa, valor de subsídio ou imóvel garantido.
- Ser misturada com facts do lead (são camadas distintas).
- Gerar `reply_text` diretamente — o LLM usa o conhecimento para raciocinar e falar com naturalidade.

---

### 4.3 Memória comercial

**O que é:** dados de elegibilidade provável, faixa de subsídio estimada, handoff_readiness e
perfil de dossiê. É principalmente composta de `derived_*`. Informa decisões operacionais sobre
o case.

**Pode:**
- Guardar `derived_eligibility_probable`, `derived_subsidy_band_hint`, `derived_dossier_profile`.
- Informar o LLM sobre a situação operacional do case.
- Ser usada pelo mecânico para decidir próxima ação autorizada.

**Não pode:**
- Prometer aprovação, taxa, parcela ou imóvel específico.
- Substituir `derived_eligibility_probable` por promessa de aprovação real.
- Ser exposta ao lead como certeza bancária.
- Gerar `reply_text`.

---

### 4.4 Memória manual inserida pelo Vasques

**O que é:** contexto, instruções, overrides ou dados inseridos manualmente pelo Vasques (operador)
no sistema — por exemplo, uma nota sobre um lead específico, uma regra temporária de conduta ou
uma prioridade de atendimento.

**Pode:**
- Sobrepor ou complementar fatos de atendimento com prioridade declarada e auditável.
- Definir conduta especial para um lead específico.
- Ser registrada com timestamp, autoria e motivo.

**Não pode:**
- Criar regra MCMV que não existe na base normativa real.
- Sobrepor um fato confirmado sem registro de reconciliação.
- Ficar invisível ao sistema (toda inserção manual deve ser auditável).
- Gerar `reply_text` automaticamente sem passar pelo LLM.

**Regra de prioridade:** memória manual do Vasques tem prioridade sobre `derived_*` e sobre
`signal_*`, mas **não** sobre `fact_*` confirmados sem reconciliação explícita.

---

### 4.5 Memória de regras do funil

**O que é:** definição canônica dos stages, gates, transições e pré-requisitos de avanço do funil
MCMV. Não é específica por lead — é a estrutura operacional do processo. Vem de L03 e do
INVENTARIO_REGRAS_T0.

**Pode:**
- Definir quais fatos são obrigatórios por stage.
- Declarar condições de bloqueio e avanço.
- Alimentar `OBJ_*` e `PEND_*` no estado do case.

**Não pode:**
- Gerar `reply_text` diretamente (o LLM decide como conduzir para o objetivo do stage).
- Ser alterada por lead, sessão ou LLM sem change review formal.
- Criar novas regras de funil sem autorização contratual.

---

### 4.6 Memória de aprendizado por atendimento

**O que é:** padrões observados em atendimentos reais — quais situações geram confusão, quais
objeções são recorrentes, quais fluxos travam, quais perfis precisam de mais turnos. É agregada
(não por lead), e serve para melhorar o raciocínio do LLM e as políticas do sistema.

> **Trava crítica:** aprender com atendimentos ≠ escrever resposta automática.

**Pode:**
- Informar ajustes de conduta do LLM (não scripts).
- Alimentar datasets de validação (PR-T2.R, T7).
- Documentar lacunas e edge cases operacionais.

**Não pode:**
- Gerar template de resposta a partir de atendimentos anteriores.
- Criar script de fala "que funcionou antes".
- Substituir raciocínio contextual do LLM por replay de turno anterior.
- Ser usada para prometer resultados ("leads com esse perfil costumam ser aprovados").

---

### 4.7 Memória operacional/telemetria

**O que é:** logs por turno, métricas de decisão, policy events, violações, latências, sinais de
confiança, shadow mode data. Não é acessível ao lead. Serve a auditoria, debugging e rollback.

**Pode:**
- Registrar todos os eventos de governança do case.
- Alimentar dashboard operacional (Vasques).
- Ser consultada em investigação de incidentes.
- Alimentar shadow mode e comparação antes/depois de cutover.

**Não pode:**
- Ser exposta ao lead.
- Gerar `reply_text` ou influenciar a fala de forma implícita.
- Substituir fatos de atendimento como fonte de verdade do case.

---

## 5. Tabela consolidada E1 → E2

| Campo E1 | Status no E1 | Nome canônico E2 | Categoria de memória | Decisão |
|----------|-------------|-----------------|---------------------|---------|
| `lead_name` | ativo | `fact_lead_name` | atendimento | renomeado com prefixo |
| `preferred_name` | ativo | `fact_preferred_name` | atendimento | renomeado com prefixo |
| `channel_origin` | ativo | `fact_channel_origin` | atendimento | renomeado com prefixo |
| `language_mode` | ativo | `fact_language_mode` | atendimento | renomeado com prefixo |
| `customer_goal` | ativo | `fact_customer_goal` | atendimento | renomeado com prefixo |
| `nationality` | ativo | `fact_nationality` | atendimento | renomeado com prefixo |
| `rnm_required` | derivado | `derived_rnm_required` | comercial/derived | eliminado como fato primário; passa a derived |
| `rnm_status` | ativo | `fact_rnm_status` | atendimento | renomeado com prefixo |
| `document_identity_type` | ativo | `fact_document_identity_type` | atendimento | renomeado |
| `marital_status` | ativo | `fact_estado_civil` | atendimento | renomeado para português |
| `process_mode` | ativo | `fact_process_mode` | atendimento | renomeado com prefixo |
| `composition_actor` | ativo | `fact_composition_actor` | atendimento | renomeado com prefixo |
| `p3_required` | ativo | `fact_p3_required` | atendimento | renomeado com prefixo |
| `work_regime_p1` | ativo | `fact_work_regime_p1` | atendimento | alinhado com T1 |
| `monthly_income_p1` | ativo | `fact_monthly_income_p1` | atendimento | alinhado com T1 |
| `has_multi_income_p1` | ambíguo E1 | `signal_multi_income_p1` | telemetria/operacional | **desdobrado**: sinal perceptivo → `signal_multi_income_p1`; confirmação explícita → `fact_has_multi_income_p1` (abaixo) |
| (desdobrado de `has_multi_income_p1`) | confirmado | `fact_has_multi_income_p1` | atendimento | fato confirmado pelo lead; separado do sinal perceptivo |
| `autonomo_has_ir_p1` | ativo | `fact_autonomo_has_ir_p1` | atendimento | alinhado com T1 |
| `ctps_36m_p1` | ativo | `fact_ctps_36m_p1` | atendimento | alinhado com T1 |
| `work_regime_p2` | ativo | `fact_work_regime_p2` | atendimento | alinhado com T1 |
| `monthly_income_p2` | ativo | `fact_monthly_income_p2` | atendimento | alinhado com T1 |
| `autonomo_has_ir_p2` | ativo | `fact_autonomo_has_ir_p2` | atendimento | alinhado com T1 |
| `ctps_36m_p2` | ativo | `fact_ctps_36m_p2` | atendimento | adicionado: ausente em T1, presente em E1 PDF6 |
| `work_regime_p3` | ativo | `fact_work_regime_p3` | atendimento | alinhado com T1 |
| (ausente) | — | `fact_monthly_income_p3` | atendimento | **novo** — exigido pelo trilho P3 |
| `credit_restriction` | ativo | `fact_credit_restriction` | atendimento | alinhado com T1 |
| `restriction_regularization_status` | ativo | `fact_restriction_regularization_status` | atendimento | alinhado com T1 |
| `has_fgts` | ativo | `fact_has_fgts` | atendimento | renomeado com prefixo |
| `entry_reserve_signal` | ativo | `fact_entry_reserve_signal` | atendimento | renomeado com prefixo |
| `benefits_signal` | ativo | `fact_benefits_signal` | atendimento | renomeado com prefixo |
| `dependents_count` | ativo | `fact_dependents_count` | atendimento | separado de `fact_dependente` (booleano) |
| (`fact_dependente` T1) | novo E2 | `fact_dependente` | atendimento | adicionado de T1; booleano de presença |
| `dependents_applicable` | derivado | `derived_dependents_applicable` | comercial/derived | eliminado como fato primário |
| `subsidy_band_hint` | derivado | `derived_subsidy_band_hint` | comercial/derived | eliminado como fato primário |
| `current_intent` | ativo | `fact_current_intent` | atendimento | renomeado com prefixo |
| `docs_channel_choice` | ativo | `fact_docs_channel_choice` | atendimento | alinhado com T1 |
| `visit_interest` | ativo | `fact_visit_interest` | atendimento | alinhado com T1 |
| `stalled_reason` | sinal | `signal_stalled_reason` | telemetria/operacional | rebaixado a signal: não é fato de negócio |
| `doc_identity_status` | ativo | `fact_doc_identity_status` | atendimento | renomeado com prefixo |
| `doc_income_status` | ativo | `fact_doc_income_status` | atendimento | renomeado com prefixo |
| `doc_residence_status` | ativo | `fact_doc_residence_status` | atendimento | renomeado com prefixo |
| `doc_ctps_status` | ativo | `fact_doc_ctps_status` | atendimento | renomeado com prefixo |
| `customer_confusion_level` | sinal | `signal_confusion_level` | telemetria/operacional | rebaixado a signal |
| `urgency_signal` | sinal | `signal_urgency` | telemetria/operacional | rebaixado a signal |
| `trust_signal` | sinal | `signal_trust` | telemetria/operacional | rebaixado a signal |
| `offtrack_type` | sinal | `signal_offtrack_type` | telemetria/operacional | rebaixado a signal |

---

## 6. Contagem final do dicionário E2

| Namespace | Quantidade | Grupo |
|-----------|-----------|-------|
| `fact_*` (coletáveis) | 35 | I a X |
| `derived_*` (calculados) | 9 | XI |
| `signal_*` (cognitivos) | 6 | XII |
| **Total de chaves canônicas** | **50** | — |

---

## 7. Limites LLM-first — regras invioláveis

| # | Regra |
|---|-------|
| M-01 | Nenhuma categoria de memória pode gerar `reply_text`. O `reply_text` é exclusivo do LLM. |
| M-02 | Memória normativa/MCMV não pode inventar regra ausente na base normativa real. |
| M-03 | Memória comercial não pode prometer aprovação, taxa, parcela, valor de subsídio ou imóvel específico. |
| M-04 | Memória manual do Vasques deve ser auditável: timestamp, autoria e motivo são obrigatórios. |
| M-05 | Aprendizado por atendimento não pode gerar scripts ou templates de fala. |
| M-06 | Sinais cognitivos (`signal_*`) não determinam decisão de negócio (elegibilidade, bloqueio, avanço de stage). |
| M-07 | Facts confirmados (`confirmed`) não podem ser sobrescritos silenciosamente — exigem reconciliação explícita. |
| M-08 | Fatos derivados (`derived_*`) não apagam fatos brutos (`fact_*`); ambos coexistem com proveniência. |
| M-09 | O LLM não persiste dados diretamente — o mecânico registra; o LLM coleta via conversa. |
| M-10 | Memória operacional/telemetria não é acessível ao lead e não influencia a fala de forma implícita. |

---

## 8. Cobertura das microetapas do mestre

| Microetapa (mestre seção T2) | Cobertura neste documento |
|------------------------------|--------------------------|
| Definir nomes canônicos dos fatos e evitar duplicidade semântica | §2 (auditoria), §3 (dicionário completo com prefixos estáveis) — COBERTA |
| Separar fato bruto, confirmado, inferência, hipótese e pendência | Tipologia declarada na §3.11 (derived), §3.12 (signal); separação fato×derivado definida; detalhamento completo em T2.4 |
| Política de confiança por origem | Origens identificadas por campo na §5 (fonte primária); detalhamento completo em T2.3 |
| Resumo persistido para turnos longos | Categorias de memória em §4 definem o que entra em cada camada; detalhamento em T2.5 |
| Mapear fatos do legado e como reconciliar | §5 (tabela E1→E2 completa) — COBERTA; reconciliação em T2.4 |

---

## 9. Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_DICIONARIO_FATOS.md (este documento)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 50 chaves canônicas; auditoria E1→E2 completa;
                                       7 categorias de memória com limites; 10 regras LLM-first;
                                       cobertura das 5 microetapas do mestre declarada;
                                       duplicidade semântica multi-renda P1 resolvida:
                                       signal_multi_income_p1 (perceptivo, turno) ≠
                                       fact_has_multi_income_p1 (confirmado diretamente pelo lead);
                                       fact_multi_income_signal_p1 eliminado
Há item parcial/inconclusivo bloqueante?: não — sem duplicidade semântica remanescente;
                                       namespaces fact_*/derived_*/signal_* sem sobreposição
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.1 encerrada; T2_DICIONARIO_FATOS.md publicado;
                                       PR-T2.2 desbloqueada
Próxima PR autorizada:                 PR-T2.2 — Schema lead_state v1
```
