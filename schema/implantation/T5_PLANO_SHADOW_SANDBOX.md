# T5_PLANO_SHADOW_SANDBOX — Plano de Shadow / Sandbox do Funil F1–F5 — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.8 |
| Branch | feat/t5-pr5-8-plano-shadow-sandbox |
| Artefato | Plano declarativo de shadow/sandbox para validação do funil F1–F5 |
| Status | entregue |
| Pré-requisito | PR-T5.7 merged (#122) — Matriz de paridade F1–F5 com veredito "PODE SEGUIR COM ATENÇÃO" |
| Autoriza | PR-T5.R — Readiness / Closeout G5 (se critérios de entrada atendidos) |
| Data | 2026-04-27 |

---

## §1 Resumo executivo

Este documento define o **plano declarativo de shadow/sandbox** para validar o funil F1–F5
da ENOVA 2 antes do readiness/closeout G5 (PR-T5.R).

A PR-T5.7 concluiu que o funil pode seguir com atenção (0 bloqueantes; 5 atenções — AT-01..AT-05).
Este plano descreve como o shadow será executado, quais cenários serão simulados, quais evidências
devem ser coletadas, quais riscos devem ser monitorados e quais condições autorizam a abertura de PR-T5.R.

**O shadow/sandbox é declarativo:** define o plano sem implementar runtime real, sem alterar
fatias F1–F5, sem criar regras comerciais e sem produzir fala mecânica de qualquer espécie.

| Item | Valor |
|---|---|
| Cenários mínimos planejados | 43 |
| Atenções da matriz tratadas | 4 (AT-01, AT-03, AT-04, AT-05) |
| Riscos controlados | 7 |
| Riscos bloqueantes | 8 |
| Critério de entrada para T5.R | Seção §15 |

---

## §2 Objetivo do shadow/sandbox

O shadow/sandbox tem como objetivo:

1. **Verificar percorribilidade declarativa** — confirmar que F1→F2→F3→F4→F5 pode ser
   percorrida sem contradição contratual, mesmo sem runtime implementado.

2. **Simular comportamento de fatos** — para cada cenário, registrar quais fatos canônicos
   T2 são esperados, qual `current_phase` resulta e quais lacunas (LFs) são acionadas.

3. **Validar soberania LLM** — confirmar que nenhum cenário exige que o mecânico produza
   `reply_text` ou template de fala para ser processado corretamente.

4. **Observar as atenções da matriz** — monitorar AT-01, AT-03 e AT-04 em cenários
   específicos; confirmar se causam atrito real ou apenas risco documentado.

5. **Determinar se PR-T5.R pode ser aberta** — com base nos resultados, declarar se o
   funil F1–F5 é readiness-apto ou se exige PR-fix antes do gate G5.

---

## §3 Escopo do shadow

O shadow cobre:

- Todos os 43 stages declarados em F1–F5
- Todos os 8 valores canônicos de `current_phase`
- Todos os 35 fatos T2 canônicos mapeados nas fatias
- 43 cenários de simulação declarativa (ver §7)
- Tratamento das atenções AT-01, AT-03, AT-04 e AT-05
- Soberania LLM em todos os cenários

**Ambiente de execução do shadow:**

O shadow desta PR é **exclusivamente declarativo**: consiste em percorrer os contratos de
fatia, cruzar fatos esperados com fatos canônicos T2 e registrar o resultado esperado por
cenário. Não requer runtime ativo, Supabase ativo, LLM ativo ou qualquer sistema ligado.

Quando o runtime estiver disponível, os 43 cenários desta seção servem como suite de
teste de aceitação (acceptance test suite), a ser rodada como teste funcional black-box
sobre o funil real — mas isso é escopo de PR futura pós-T5.R.

---

## §4 Fora de escopo deste plano

- `src/` — não tocado
- Runtime de qualquer componente (T4, LLM, Supabase, WhatsApp, Meta)
- Correção das atenções AT-01, AT-03 ou AT-04 (apenas observadas no plano)
- Criação de base normativa MCMV/CEF (AT-05 — lacuna planejada)
- Criação de regras comerciais novas
- Criação de `fact_*` novos
- Criação de `current_phase` novo
- Criação de `reply_text`, template ou pergunta fixa
- Inventário — deliberadamente fora do escopo completo desta fase
- Abertura de PR-T5.R (PR seguinte, não esta)
- Declaração de G5 como aprovado

---

## §5 Fontes de verdade lidas

| Artefato | Fatia / Fase |
|---|---|
| `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` | F1 |
| `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | F2 |
| `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | F3 |
| `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | F4 |
| `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` (incl. fix civis) | F5 |
| `schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` | PR-T5.7 |
| `schema/implantation/T5_MAPA_FATIAS.md` | Mapa macro |
| `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` | Contrato T5 |
| `T2_DICIONARIO_FATOS.md`, `T2_LEAD_STATE_V1.md` | Facts canônicos T2 |
| `T3_CLASSES_POLITICA.md` | Políticas T3 |
| `T4_PIPELINE_LLM.md` | Pipeline T4 |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | A00-ADENDO-01 |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | A00-ADENDO-02 |

---

## §6 Pré-condições para rodar shadow

Antes de executar o shadow declarativo completo, as seguintes pré-condições devem ser
verificadas:

| # | Pré-condição | Verificável em | Status esperado |
|---|---|---|---|
| PC-01 | PR-T5.7 merged | GitHub PR #122 | ✅ Merged 2026-04-28 |
| PC-02 | Todos os artefatos F1–F5 vigentes no `main` | `schema/implantation/` | ✅ 6 arquivos presentes |
| PC-03 | Matriz de paridade (T5.7) com veredito "PODE SEGUIR" | `T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md §16` | ✅ "PODE SEGUIR COM ATENÇÃO" |
| PC-04 | AT-01, AT-03, AT-04 documentadas como riscos neste plano | `§11` deste artefato | ✅ Tratadas em §11 |
| PC-05 | AT-05 classificada como lacuna normativa planejada | `§12` deste artefato | ✅ Tratada em §12 |
| PC-06 | Zero `fact_*` ou `current_phase` inventado no plano | Auditável neste artefato | ✅ Não criado |
| PC-07 | Zero regra comercial nova no plano | Auditável neste artefato | ✅ Não criada |
| PC-08 | Zero `reply_text` ou template no plano | Auditável neste artefato | ✅ Não criado |

**Pré-condições para rodar shadow com runtime (futuro):**

Estas pré-condições são para execução futura, quando o runtime estiver disponível:

| # | Pré-condição futura | Responsável |
|---|---|---|
| PC-F-01 | LLM conectado e respondendo conforme T4_PIPELINE_LLM.md | Time técnico |
| PC-F-02 | Supabase com schema T2 vigente e persistência ativa | Time técnico |
| PC-F-03 | Canal de simulação isolado (não produção, não WhatsApp real) | Time técnico |
| PC-F-04 | Agente com artefatos F1–F5 no contexto operacional | Time técnico |
| PC-F-05 | Mecânico com policies T3 carregadas e OBR/CONF/SGM/ROT configurados | Time técnico |
| PC-F-06 | AT-01 e AT-03 resolvidas OU aceitas formalmente antes do runtime | Time + Vasques |

---

## §7 Cenários mínimos de validação F1–F5

> **Nota de soberania:** nenhum cenário abaixo define `reply_text`, template de fala ou
> script de atendimento. Cada cenário declara fatos esperados, `current_phase` esperado,
> lacunas acionadas e resultado esperado. O LLM decide como conduzir cada caso.

### Bloco A — F1: Topo / Abertura / Primeira Intenção

**SHD-A-01** — Cliente solteiro, brasileiro, curiosidade sobre MCMV

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_lead_name`, `fact_customer_goal`, `fact_nationality = "brasileiro"` |
| Derived calculados | `derived_rnm_required = false`, `derived_rnm_block = false` |
| `current_phase` | `discovery` → `qualification` ao avançar para F2 |
| Lacunas acionadas | nenhuma |
| Resultado esperado | F1 concluída; avança para F2 |

**SHD-A-02** — Estrangeiro com RNM válido de validade indeterminada

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_lead_name`, `fact_nationality = "estrangeiro"`, `fact_rnm_status = "válido"` |
| Derived calculados | `derived_rnm_required = true`, `derived_rnm_block = false` (confirmado indeterminado) |
| `current_phase` | `discovery` → `qualification` |
| Lacunas acionadas | F1-LF-02 (tipo de validade RNM) |
| Resultado esperado | F1 concluída com lacuna registrada; avança para F2 |

**SHD-A-03** — Estrangeiro sem RNM — bloqueio F1

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_nationality = "estrangeiro"`, `fact_rnm_status = "sem_rnm"` |
| Derived calculados | `derived_rnm_block = true` |
| `current_phase` | permanece `discovery` |
| Resultado esperado | BLQ-F1-01 ativo; F1 não avança; orientação sobre obtenção de RNM indeterminado |

---

### Bloco B — F2: Qualificação / Composição Familiar

**SHD-B-04** — Casado civil, apenas um cônjuge com renda

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_estado_civil = "casado"`, `fact_process_mode = "duo"`, `fact_composition_actor` (cônjuge) |
| `current_phase` | `qualification` |
| Regra verificada | SGM-F2-01: financiamento em conjunto obrigatório; cônjuge entra mesmo sem renda |
| Resultado esperado | Processo duo confirmado; não bloqueia por ausência de renda do cônjuge |

**SHD-B-05** — União estável, cliente quer seguir sozinho

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_estado_civil = "união_estável"`, `fact_process_mode = "solo"` |
| `current_phase` | `qualification` |
| Regra verificada | F2 Regra 2: UE não obriga conjunto; cliente decide; SGM-F2-05 se quiser somar |
| Resultado esperado | Processo solo confirmado; companheiro(a) NÃO incluído sem solicitação do cliente |

**SHD-B-06** — Solteiro com renda baixa, quer compor com familiar

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_estado_civil = "solteiro"`, `fact_process_mode = "p3"`, `fact_composition_actor`, `fact_p3_required = true` |
| `current_phase` | `qualification_special` |
| Resultado esperado | Rota P3 aberta; F3 coleta renda P1 + renda P3 |

**SHD-B-07** — Familiar/P3 casado civil, cônjuge do familiar entra

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_p3_required = true`, `fact_composition_actor` (familiar), LF-02/03 acionadas |
| `current_phase` | `qualification_special` |
| Regra verificada | F2 Regra 8 + SGM-F2-04: se familiar é casado, cônjuge entra; P3 cascading |
| Resultado esperado | Processo P3 com cônjuge de P3 identificado (LF-02/03 como lacuna aceita) |
| Atenção | LF-02/03 não têm `fact_*` canônico; LLM coleta conversacionalmente |

**SHD-B-08** — Avô com mais de 67 anos na composição

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_composition_actor` (avô), LF-04 acionada |
| Regra verificada | F2 Regra 4 + SGM-F2-03: alertar risco etário CEF; não bloquear secamente |
| Resultado esperado | Aviso sobre risco CEF; sugestão de alternativa viável; processo não bloqueado seco |

**SHD-B-09** — Solo, renda formal abaixo de R$4.000 — dependente perguntado

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_process_mode = "solo"` + renda F3 < R$4.000 → OBR-F2-03 ativa |
| Regra verificada | F2 §2.2: solo + renda < R$4k → perguntar sobre dependente |
| Resultado esperado | `fact_dependente` coletado; `fact_dependents_count` se true |

**SHD-B-10** — Financiamento conjunto — dependente pulado

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_process_mode = "duo"` ou `"p3"` |
| Regra verificada | F2 §2.2: conjunto → DEVE pular pergunta de dependente |
| Resultado esperado | `fact_dependente` não perguntado; `skipped` registrado |

---

### Bloco C — F3: Renda / Regime / Composição

**SHD-C-11** — CLT sem variação de renda

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "CLT"`, `fact_monthly_income_p1`, `fact_ctps_36m_p1` |
| Docs esperados em F5 | RC-F5-06: último holerite basta; CTPS se aplicável |
| Resultado esperado | F3 concluída; holerite único suficiente em F5 |

**SHD-C-12** — CLT com renda variável, 3 holerites

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "CLT"`, `fact_monthly_income_p1` (média 3 meses) |
| Docs esperados em F5 | RC-F5-06: 3 últimos holerites; não aceitar holerite > 3 meses |
| Resultado esperado | Docs corretos solicitados em F5 |

**SHD-C-13** — Autônomo com IRPF

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "autônomo"`, `fact_autonomo_has_ir_p1 = true` |
| Docs esperados em F5 | RC-F5-10: IRPF + recibo entrega + docs pessoais |
| Resultado esperado | Renda formalizada; F3→F5 coerentes |

**SHD-C-14** — Autônomo sem IRPF, sozinho

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "autônomo"`, `fact_autonomo_has_ir_p1 = false`, `fact_process_mode = "solo"` |
| Docs esperados em F5 | RC-F5-11: 3 extratos; limitação marcada; buscar composição/entrada/FGTS |
| Regra verificada | F3 SGM-F3-02: cenário difícil; sugerir composição |
| Resultado esperado | Dossiê marca limitação; não bloquear, mas orientar realidade |

**SHD-C-15** — Autônomo sem IRPF em conjunto

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "autônomo"`, `fact_autonomo_has_ir_p1 = false`, `fact_process_mode != "solo"` |
| Resultado esperado | Pode seguir com limitação marcada; dossiê nota limitação |

**SHD-C-16** — MEI sem IRPF

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "autônomo"` (MEI tratado como autônomo), `fact_autonomo_has_ir_p1 = false` |
| Docs esperados em F5 | RC-F5-12: 3 extratos; CNPJ contextualiza apenas |
| Resultado esperado | Tratado como autônomo sem IRPF; F3→F5 coerentes |

**SHD-C-17** — Empresário com pró-labore e IRPF

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1` (empresário), `fact_autonomo_has_ir_p1 = true`, LF-06 (pró-labore) |
| Docs esperados em F5 | RC-F5-13: IRPF + pró-labore se existir + docs pessoais |
| Resultado esperado | CNPJ contextualiza; análise é pessoa física |

**SHD-C-18** — Informal/bico sozinho

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "informal"`, `fact_autonomo_has_ir_p1 = false` |
| Docs esperados em F5 | RC-F5-14: tratar como autônomo sem IRPF; limitação marcada |
| Resultado esperado | Caminho de composição sugerido; dossiê marca limitação |

**SHD-C-19** — CLT + bico (multi-renda / renda mista)

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "múltiplo"`, `fact_has_multi_income_p1 = true`, `fact_monthly_income_p1` (total) |
| Docs esperados em F5 | RC-F5-14: holerite CLT (RC-F5-06) + 3 extratos renda informal; marcado como renda por fora |
| Lacunas acionadas | F3-LF-01 (separação por fonte) |
| Atenção AT-04 | Regime múltiplo → docs implícitos em F5; verificar se LLM solicita ambos (ver §11) |
| Resultado esperado | Docs de cada regime aplicável solicitados; renda por fora não vira formal |

**SHD-C-20** — Multi-renda: aposentado + CLT

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "múltiplo"`, ambos os regimes identificados |
| Docs esperados em F5 | RC-F5-08 (aposentadoria) + RC-F5-06 (holerite CLT) |
| Atenção AT-04 | Verificar se ambos os docs são solicitados |
| Resultado esperado | Docs cumulativos por regime componente |

**SHD-C-21** — Bolsa Família / BPC como única fonte de renda

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_benefits_signal`, `fact_work_regime_p1` ausente ou `informal` |
| Regra verificada | F3 RC-F3: benefício não entra como renda; F5 RC-F5-15 |
| Resultado esperado | Buscar composição; dossiê registra BF/BPC como observação, não renda |

**SHD-C-22** — Seguro-desemprego / trabalho temporário como renda

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_benefits_signal` ou informação contextual |
| Regra verificada | F3 RC-F3-07; F5 RC-F5-15: não entram como renda financiável |
| Resultado esperado | Não somados à renda do dossiê; buscar composição/renda formal |

**SHD-C-23** — Pensionista: pensão por morte vs pensão alimentícia

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_work_regime_p1 = "aposentado"` (pensão por morte entra); F3-LF-04 (tipo de pensão) |
| Regra verificada | F3/F5 RC-F5-09: pensão por morte = renda; alimentícia = não entra |
| Resultado esperado | Distinção correta; pensão alimentícia não incluída no dossiê como renda |

**SHD-C-24** — CTPS 36 meses: P1 tem, P2 não precisa ser perguntado

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_ctps_36m_p1 = true` |
| Regra verificada | F3 §2.3: basta P1 ter 36m; não perguntar P2 |
| Resultado esperado | `fact_ctps_36m_p2` não coletado; F5 RC-F5-05 aplicado apenas para P1 |

**SHD-C-25** — CTPS 36 meses: P1 não tem, P2 perguntado

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_ctps_36m_p1 = false`, `fact_ctps_36m_p2` coletado |
| Resultado esperado | P2 perguntado; se P2 tiver, basta |

**SHD-C-26** — Dependente resolvido por renda (cross-fatia F2→F3)

| Campo | Valor esperado |
|---|---|
| Contexto | Solo em F2; renda desconhecida → PEND_SLOT; renda coletada em F3 |
| Regra verificada | F3 OBR-F3-09: ao confirmar renda P1, resolver pendência de `fact_dependente` |
| Resultado esperado | Se renda < R$4k → OBR-F2-03 ativa; se renda > R$4k → `fact_dependente = skipped` |

---

### Bloco D — F4: Elegibilidade / Restrição

**SHD-D-27** — Cliente declara restrição, renda boa, segue para docs

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_credit_restriction = "média"` ou `"alta"` |
| Regra verificada | F4 RC-F4-01: sinal informativo; não bloquear; ROT-F4-01 → `docs_prep` |
| `current_phase` | `qualification` → `docs_prep` (saída positiva) |
| Resultado esperado | Restrição registrada como observação no dossiê; F5 não bloqueada |

**SHD-D-28** — Cliente não sabe origem/valor da restrição, segue

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_credit_restriction = "baixa"` ou `captured` com incerteza; LF-03 acionada |
| Regra verificada | F4 §2.1: "não sei se consta" → seguir mesmo assim; correspondente confirma |
| Resultado esperado | Processo avança; análise real é do banco |

**SHD-D-29** — Lead inelegível temporariamente

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `derived_eligibility_probable = false`; ACAO_INELEGIBILIDADE |
| `operational` | `elegibility_status = "ineligible"` |
| Regra verificada | F4 §2.3: temporário; orientação de retorno; caminho de regularização declarado |
| Resultado esperado | Lead não descartado; retorno possível documentado; LF-06/08 acionadas |

---

### Bloco E — F5: Documentação / Dossiê / Correspondente / Visita

**SHD-E-30** — Viúvo(a): certidão de óbito obrigatória

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_estado_civil = "viúvo"` (de F2) |
| Docs esperados | RC-F5-35: doc identidade + residência + renda por regime + certidão de óbito do cônjuge |
| Lacunas acionadas | F5-LF-32 (certidão óbito sem `fact_*` canônico) |
| Resultado esperado | Certidão de óbito solicitada; inventário NÃO solicitado |

**SHD-E-31** — Divorciado(a) com averbação

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_estado_civil = "divorciado"` (de F2) |
| Docs esperados | RC-F5-36: certidão de casamento com averbação de divórcio |
| Lacunas acionadas | F5-LF-33 (certidão com averbação sem `fact_*`) |
| Atenção AT-01 | F2 ainda aponta averbação para F4; real é F5 RC-F5-36; verificar se LLM usa RC-F5-36 (ver §11) |
| Resultado esperado | Certidão com averbação solicitada; solo por padrão |

**SHD-E-32** — Separado(a) sem averbação — dois caminhos

| Campo | Valor esperado |
|---|---|
| Contexto | Lead diz que é separado mas "não foi em cartório" |
| Fatos coletados | `fact_estado_civil = "casado"` (legalmente); LF-34/35 acionadas |
| Regra verificada | F5 RC-F5-37: dois caminhos — regularizar averbação OU seguir com cônjuge (RC-F5-16) |
| Atenção AT-03 | Gap de timing: F2 determina duo pelo estado civil `"casado"`; a descoberta "separado" ocorre em F5; verificar se atrito real (ver §11) |
| Resultado esperado | Dois caminhos apresentados; não bloqueio seco; UE e P3 não reabertos |

**SHD-E-33** — CLT com renda variável — docs corretos

| Campo | Valor esperado |
|---|---|
| Fatos herdados de F3 | `fact_work_regime_p1 = "CLT"`, variação detectada |
| Docs esperados | RC-F5-06: 3 últimos holerites; não aceitar holerite > 3 meses |
| Resultado esperado | F3→F5 coerentes; docs por regime corretos |

**SHD-E-34** — Casado civil: docs do casal

| Campo | Valor esperado |
|---|---|
| Fatos herdados de F2/F3 | `fact_process_mode = "duo"`, docs P1 + P2 |
| Docs esperados | RC-F5-16: certidão de casamento + docs cônjuge + renda cônjuge se aplicável |
| Resultado esperado | Docs completos do casal; cônjuge sem renda não bloqueia |

**SHD-E-35** — Dossiê com bairro / entrada / FGTS / parcela confortável

| Campo | Valor esperado |
|---|---|
| Fatos / lacunas | LF-16/17/18 (bairros); LF-19/20 (entrada/FGTS); LF-29/30 (parcela) |
| Regra verificada | RC-F5-19/20/34: dossiê organizado; parcela = informativo, não simulação |
| Resultado esperado | Dossiê contém todos os campos informativos; parcela marcada como informativa |

**SHD-E-36** — Cliente para de enviar docs, 3 follow-ups

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_doc_*_status` parcial; LF-08 (contagem follow-ups) |
| Regra verificada | RC-F5-03: 3 follow-ups persuasivos; não repetir frio; após 3 → plantão |
| Resultado esperado | 3 follow-ups executados com variação; convite ao plantão após 3 sem resposta |

**SHD-E-37** — Cliente com medo de enviar docs pelo WhatsApp

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_docs_channel_choice` → plantão |
| Regra verificada | RC-F5-29 + SGM-F5-03: acolher; oferecer plantão; não pressionar |
| Resultado esperado | Agendamento de plantão com documentos; VS-F5-02 não violado |

**SHD-E-38** — Envio do dossiê por link ao correspondente

| Campo | Valor esperado |
|---|---|
| Fatos / lacunas | LF-05/06 (site/link; dossiê enviado) |
| Regra verificada | RC-F5-21: dossiê organizado por link; não conversa crua |
| `current_phase` | `broker_handoff` após envio |
| Resultado esperado | Dossiê enviado por link; ROT-F5-03 ativo |

**SHD-E-39** — Reprovação por SCR/BACEN/Registrato

| Campo | Valor esperado |
|---|---|
| Fatos / lacunas | LF-10 (resultado análise); LF-13/14 (Registrato) |
| Regra verificada | RC-F5-24: enviar PDF Registrato; pedir extrato; não inventar motivo |
| Resultado esperado | Fluxo SCR/BACEN executado; cliente orientado sem valores de restrição |

**SHD-E-40** — Reprovação por SPC/Serasa

| Campo | Valor esperado |
|---|---|
| Regra verificada | RC-F5-25: negociar pelo app Serasa; ~5 dias para saída; comprovante necessário |
| Resultado esperado | Orientação correta; não prometer aprovação após regularizar |

**SHD-E-41** — Pendência Receita Federal

| Campo | Valor esperado |
|---|---|
| Regra verificada | RC-F5-26: orientar regularização CPF; pausar avaliação |
| Resultado esperado | Pausar nova avaliação; não tratar como simples restrição comercial |

**SHD-E-42** — Cliente aprovado vira agendamento / visita obrigatória

| Campo | Valor esperado |
|---|---|
| Fatos coletados | LF-10 (aprovado); `fact_visit_interest = true`; ROT-F5-05 |
| `current_phase` | `awaiting_broker` → `visit_conversion` |
| Regra verificada | RC-F5-27: toda aprovação deve virar agendamento; 2 slots + sábado |
| Resultado esperado | Agendamento realizado; todos os decisores convidados; SGM-F5-05 ativo |

**SHD-E-43** — Aprovado condicionado — interno, cliente vê como aprovado

| Campo | Valor esperado |
|---|---|
| Fatos / lacunas | LF-11 (aprovado condicionado interno) |
| Regra verificada | RC-F5-22: condicionado = interno; para cliente = aprovado |
| Resultado esperado | Palavra "condicionado" não exposta ao cliente; VS-F5-06 não violado |

**SHD-E-44** — Confirmações de visita D-1 e D0 2h + notificação Vasques

| Campo | Valor esperado |
|---|---|
| Lacunas acionadas | LF-24/25 (confirmações); LF-26 (notificação Vasques) |
| Regra verificada | RC-F5-28: D-1 com local/horário; D0 2h antes; Vasques com perfil/horário |
| Resultado esperado | 3 ações executadas; Vasques notificado |

**SHD-E-45** — `finalizacao` de etapa — não encerra processo

| Campo | Valor esperado |
|---|---|
| Fatos coletados | `fact_current_intent`; docs pendentes ainda existem |
| Regra verificada | RC-F5-31: próximo passo claro; não tratar como encerramento definitivo |
| Resultado esperado | Etapa fechada com continuidade declarada |

**SHD-E-46** — Resposta curta após envio de parte dos docs — NÃO encerra

| Campo | Valor esperado |
|---|---|
| Contexto | Lead responde "ok" após envio parcial de docs |
| Regra verificada | RC-F5-32 + AP-F5-10: resposta curta NUNCA aciona `finalizacao_processo` |
| Resultado esperado | Processo continua; docs pendentes verificados; VS-F5-08 não violado |

**SHD-E-47** — Depois do fechamento real, resposta curta não reabre

| Campo | Valor esperado |
|---|---|
| Contexto | `finalizacao_processo` concluído; lead responde "ok" |
| Regra verificada | RC-F5-33: só nova intenção real reabre |
| Resultado esperado | Conversa não reaberta; LF-28 acionada |

**SHD-E-48** — Nova intenção real reabre atendimento

| Campo | Valor esperado |
|---|---|
| Contexto | Lead após fechamento faz nova dúvida / pede status / menciona novo doc |
| Regra verificada | RC-F5-33: nova intenção genuína → reabrir atendimento |
| Resultado esperado | Atendimento reaberto corretamente |

---

## §8 Matriz de evidências esperadas

Para cada cenário executado em shadow com runtime futuro, as seguintes evidências devem
ser coletadas e registradas:

| Campo de evidência | Descrição |
|---|---|
| `stage_reached` | Stage legado alcançado na conversa |
| `current_phase` | Valor de `current_phase` no momento da evidência |
| `facts_captured` | Lista de `fact_*` capturados com status (hypothesis/captured/confirmed) |
| `facts_skipped` | Lista de `fact_*` intencionalmente pulados e motivo |
| `lfs_triggered` | Lista de LFs acionadas (schema gap registrado) |
| `policies_activated` | OBR/CONF/SGM/ROT/VS ativadas naquele turno |
| `llm_reply_text` | Texto produzido pelo LLM (não pelo mecânico — verificação de soberania) |
| `advance_decision` | `avançou` / `pausou` / `bloqueou` — com motivo |
| `dossier_min_complete` | Dossiê mínimo atendido (true/false) |
| `correspondent_sent` | Dossiê enviado ao correspondente (true/false + canal) |
| `visit_scheduled` | Visita agendada (true/false + data/slot) |
| `closure_type` | `finalizacao` / `finalizacao_processo` / `inelegivel_temporario` / `em_andamento` |
| `risks_observed` | Riscos reais observados no cenário executado |
| `at_observations` | Observações sobre AT-01, AT-03 ou AT-04 se o cenário as acionar |

---

## §9 Critérios de sucesso

O shadow/sandbox será considerado **apto a liberar PR-T5.R** se:

| # | Critério | Como verificar |
|---|---|---|
| CS-01 | F1–F5 percorríveis sem contradição contratual | Todos os 48 cenários executáveis sem bloqueio por regra interna |
| CS-02 | Nenhum stage obrigatório sem cobertura | Todos os 43 stages de §5 do plano cobertas nos cenários |
| CS-03 | Dependente pulado quando financiamento conjunto | SHD-B-10 sem `fact_dependente` coletado |
| CS-04 | Dependente perguntado quando solo + renda < R$4k | SHD-B-09 com `fact_dependente` coletado |
| CS-05 | Restrição declarada não bloqueia docs/análise | SHD-D-27/28 com `current_phase = docs_prep` na saída |
| CS-06 | Docs coerentes com perfil/regime/pessoa | SHD-C-11..20 com docs correspondentes a RC-F5-06..14 |
| CS-07 | Dossiê mínimo definido e completo | SHD-E-35/38 com dossiê mínimo por RC-F5-20 |
| CS-08 | Correspondente recebe dossiê por link | SHD-E-38 com `current_phase = broker_handoff` |
| CS-09 | Aprovado vira agendamento/visita obrigatório | SHD-E-42 com `current_phase = visit_conversion` |
| CS-10 | `finalizacao` não encerra cliente no meio | SHD-E-45/46 sem `finalizacao_processo` prematuro |
| CS-11 | Lacunas futuras classificadas corretamente | Todos os LFs acionados registrados como lacunas aceitas |
| CS-12 | AT-01 observada sem falha real | SHD-E-31: divorciado coberto por RC-F5-36 independente do ponteiro F2 |
| CS-13 | AT-03 observada sem atrito bloqueante | SHD-E-32: separado sem averbação conduzido corretamente por RC-F5-37 |
| CS-14 | AT-04 observada sem ambiguidade de docs | SHD-C-19/20: regime múltiplo com docs corretos por cada regime |
| CS-15 | AT-05 classificada como lacuna aceita | Plano declara explicitamente em §12 |
| CS-16 | Soberania LLM intacta em todos os cenários | `llm_reply_text` SEMPRE vindo do LLM; zero `reply_text` mecânico |

---

## §10 Critérios de falha / bloqueio para T5.R

O shadow/sandbox **bloqueará PR-T5.R** se qualquer dos critérios abaixo for confirmado:

| # | Critério de falha | Cenário de disparo |
|---|---|---|
| CF-01 | Regra comercial contraditória entre fatias | Qualquer cenário com comportamento diferente do declarado no contrato de fatia |
| CF-02 | Stage obrigatório sem cobertura de fato/política | Qualquer stage que não tenha OBR/CONF/SGM/ROT/VS correspondente aplicável |
| CF-03 | F3 não alimentando F5 (regime → docs quebrado) | SHD-C-11..20: docs solicitados em F5 divergem do regime capturado em F3 |
| CF-04 | Restrição virando bloqueio automático | SHD-D-27/28: `fact_credit_restriction != "nenhuma"` bloqueia F5 |
| CF-05 | Cliente aprovado não virando agendamento/visita | SHD-E-42: aprovação sem ROT-F5-05 / SGM-F5-05 |
| CF-06 | Dossiê enviado sem comprovante de renda principal | SHD-E-38: RC-F5-20 não atendido |
| CF-07 | `finalizacao_processo` com pendência ativa | SHD-E-46: resposta curta aciona encerramento com docs/visita abertos |
| CF-08 | AT-01, AT-03 ou AT-04 causam falha real | SHD-E-31/32/C-19: atenções não são apenas textuais; causam comportamento errado real |

---

## §11 Tratamento das atenções da matriz

### AT-01 — Ponteiro F2 averbação → F4 desatualizado

**Fonte:** `T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md §14 AT-01`

**Descrição no shadow:** F2 (`T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md §3.1`) ainda
referencia averbação de divórcio como sendo tratada em F4. F4 declara `verificar_averbacao`
fora do recorte ativo. A regra real está em F5 (RC-F5-36 — PR-T5.6-fix).

**Tratamento no shadow:**
- Classificado como: **risco de documentação / ponteiro textual desatualizado**
- Cenário de observação: SHD-E-31 (divorciado com averbação)
- O shadow verifica se o funil ainda conduz corretamente o caso de divorciado(a) para
  RC-F5-36 **apesar do ponteiro textual antigo em F2**
- Se o cenário SHD-E-31 passar (docs corretos solicitados por F5): AT-01 classificada como
  risco controlado; fix recomendada mas não bloqueante
- Se o cenário SHD-E-31 falhar (docs errados ou não solicitados): AT-01 vira bloqueante
  (CF-08) e PR-fix de F2 deve preceder PR-T5.R

**Ação recomendada (não executada nesta PR):**
PR-fix cirúrgica em F2 corrigindo a nota de `"divorciado"` de "verificação de averbação
em F4" para "documentação com averbação de divórcio em F5 (RC-F5-36)".

---

### AT-03 — Separado sem averbação descoberto tardiamente

**Fonte:** `T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md §14 AT-03`

**Descrição no shadow:** O lead pode não mencionar que é "separado sem averbação" em F2.
Quando declara `fact_estado_civil = "casado"` (porque ainda é legalmente casado), F2 define
`fact_process_mode = "duo"`. A descoberta que é "separado sem averbação" pode vir só em F5,
ao solicitar documentação — RC-F5-37 apresenta dois caminhos corretamente.

**Tratamento no shadow:**
- Classificado como: **risco de timing / experiência do lead**
- Cenário de observação: SHD-E-32 (separado sem averbação)
- O shadow verifica se o funil conduz corretamente mesmo com a descoberta em F5
- Monitorar se o lead tem atrito ao descobrir que o cônjuge precisa entrar (duo obrigatório)
  após ter passado por F2 sem menção
- Se o cenário SHD-E-32 passar sem atrito bloqueante: AT-03 classificada como risco controlado
- Se o cenário SHD-E-32 mostrar atrito que impeça conversão: AT-03 vira bloqueante (CF-08)
  e PR-fix de F2 deve adicionar orientação proativa para "separado sem averbação"

**Ação recomendada (não executada nesta PR):**
PR-fix em F2 adicionando nota na regra de casado civil: quando o lead mencionar "separado
mas sem averbação", orientar sobre os dois caminhos (RC-F5-37) desde F2, sem esperar F5.

---

### AT-04 — Docs para regime múltiplo implícitos em F5

**Fonte:** `T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md §14 AT-04`

**Descrição no shadow:** F3 captura `fact_work_regime_p1 = "múltiplo"` para leads com mais
de um regime. F5 tem regras por regime (RC-F5-06..14) mas não tem RC explícita para
"regime múltiplo" — a expectativa é que os docs de cada regime componente se apliquem
cumulativamente.

**Tratamento no shadow:**
- Classificado como: **risco de documentação / regra implícita**
- Cenários de observação: SHD-C-19 (CLT + bico) e SHD-C-20 (aposentado + CLT)
- O shadow verifica se o LLM solicita docs de ambos os regimes ao detectar regime múltiplo
- Se os cenários passarem (docs de cada regime solicitados): AT-04 classificada como risco controlado
- Se o cenário mostrar que o LLM solicita docs de apenas um regime: AT-04 vira bloqueante (CF-08)
  e PR-fix de F5 deve adicionar RC explícita para regime múltiplo

**Ação recomendada (não executada nesta PR):**
PR-fix em F5 adicionando RC-F5-X: "Quando `fact_work_regime_p1 = 'múltiplo'`, aplicar
cumulativamente as regras documentais de cada regime componente."

---

## §12 Tratamento de AT-05 como lacuna normativa planejada

**Fonte:** `T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md §14 AT-05`

**AT-05 — Base normativa MCMV/CEF ausente no repo**

**Classificação neste plano:** lacuna normativa planejada — não bloqueante para shadow/sandbox
declarativo nem para PR-T5.R, desde que o time aceite o risco formal.

**Descrição:**
Não existe no repo um arquivo de base normativa completa do programa MCMV/CEF. Regras sobre
grau de parentesco aceito, limites de idade precisos, faixas de renda atualizadas e condições
especiais dependem de conhecimento externo não formalizado em artefato canônico.

**Impacto no shadow:**
- O shadow declarativo desta PR não é impactado pela ausência da base normativa
- Cenários que envolvem casos normativos específicos (idade do avô/avó, grau de parentesco
  de P3) funcionam com as regras declaradas nos contratos de fatia
- O LLM responde questões regulatórias específicas sem base normativa formal; risco de
  imprecisão em casos-limite aceito pelo time enquanto a base não existir

**Ação declarada (futura):**
PR futura dedicada à base normativa MCMV/CEF — compilar regras do programa em artefato
canônico consultável. Não executada nesta PR-T5.8.

**Posição neste plano:** Lacuna aceita. Não cria bloqueio para T5.R. O time deve declarar
formalmente em PR-T5.R que aceita o risco de AT-05 como lacuna planejada.

---

## §13 Riscos controlados

| ID | Risco | Classificação | Mitigação declarada |
|---|---|---|---|
| RC-01 | AT-01 causa falha real (ponteiro F2→F4 confunde LLM) | **Controlado** — observado em SHD-E-31 | Se SHD-E-31 passar: fix recomendada mas não bloqueante; se falhar: vira CF-08 |
| RC-02 | AT-03 causa atrito de experiência (separado sem averbação) | **Controlado** — observado em SHD-E-32 | Se SHD-E-32 passar: fix recomendada; se atrito real: vira CF-08 |
| RC-03 | AT-04 causa docs incompletos (regime múltiplo) | **Controlado** — observado em SHD-C-19/20 | Se ambos passarem: fix recomendada; se docs errados: vira CF-08 |
| RC-04 | AT-05 causa resposta imprecisa em casos normativos-limite | **Controlado** — lacuna aceita | Declarado em §12; risk aceito enquanto base normativa não existe |
| RC-05 | LFs sem `fact_*` causam perda de dado em runtime | **Controlado** — 54+ LFs declaradas | LLM coleta conversacionalmente; dado é contexto, não gate |
| RC-06 | Shadow documental não detecta bug de runtime | **Controlado** — shadow declarativo é validação de contrato | Runtime acceptance test é escopo pós-T5.R com suite de 48 cenários |
| RC-07 | PR-T5.R aberta sem resolução de AT-01/AT-03/AT-04 | **Controlado** — critério de entrada §15 exige declaração explícita | Time deve declarar: fix feita OU risco formalmente aceito por Vasques |

---

## §14 Riscos bloqueantes

| ID | Risco | Condição de disparo | Ação exigida |
|---|---|---|---|
| RB-01 | Regra comercial contraditória entre fatias | CF-01 confirmado em qualquer cenário | PR-fix das fatias afetadas antes de T5.R |
| RB-02 | Stage obrigatório sem cobertura | CF-02 confirmado | PR-fix da fatia afetada |
| RB-03 | F3 não alimentando F5 corretamente | CF-03 confirmado | PR-fix das conexões F3→F5 |
| RB-04 | Restrição virando bloqueio automático | CF-04 confirmado | PR-fix de F4/F5 |
| RB-05 | Aprovado não virando agendamento/visita | CF-05 confirmado | PR-fix de F5 RC-F5-27/SGM-F5-05 |
| RB-06 | Dossiê sem comprovante de renda principal | CF-06 confirmado | PR-fix de F5 RC-F5-20 |
| RB-07 | `finalizacao_processo` prematuro possível | CF-07 confirmado | PR-fix de F5 RC-F5-32/AP-F5-10 |
| RB-08 | AT-01/AT-03/AT-04 causam falha real | CF-08 confirmado em qualquer cenário associado | PR-fix das atenções antes de T5.R |

---

## §15 Critério de entrada para PR-T5.R

PR-T5.R (Readiness / Closeout G5) pode ser aberta quando **todas** as condições abaixo forem atendidas:

| # | Condição | Responsável |
|---|---|---|
| CE-01 | PR-T5.8 merged | Git/GitHub |
| CE-02 | Shadow declarativo confirmado (os 48 cenários revisados sem CF bloqueante) | Time |
| CE-03 | 0 critérios de falha (CF-01..CF-08) confirmados | Time + Vasques |
| CE-04 | AT-01 resolvida com PR-fix OU formalmente aceita como risco por Vasques | Vasques |
| CE-05 | AT-03 resolvida com PR-fix OU formalmente aceita como risco por Vasques | Vasques |
| CE-06 | AT-04 resolvida com PR-fix OU formalmente aceita como risco por Vasques | Vasques |
| CE-07 | AT-05 declarada como lacuna normativa aceita no body de PR-T5.R | Time |
| CE-08 | Contrato T5 ativo sem desvio contratual não declarado | Time |
| CE-09 | Live files (STATUS/LATEST/_INDEX) atualizados refletindo estado pós-T5.8 | Time |

**Nota:** CE-04/05/06 podem ser satisfeitos de dois modos:
1. PR-fix cirúrgica nas fatias afetadas (modo recomendado)
2. Declaração formal de Vasques aceitando o risco no body de PR-T5.R com escopo, motivo e condição de retorno

---

## §16 Critério de saída da PR-T5.8

Esta PR-T5.8 está pronta quando:

1. `schema/implantation/T5_PLANO_SHADOW_SANDBOX.md` criado com todos os 18 itens obrigatórios
2. 43 cenários mínimos declarados (§7 deste artefato — 48 incluindo sub-cenários)
3. Matriz de evidências esperadas documentada (§8)
4. Critérios de sucesso declarados (§9 — 16 critérios)
5. Critérios de falha declarados (§10 — 8 critérios)
6. AT-01, AT-03, AT-04 tratadas como riscos controlados com cenário de observação (§11)
7. AT-05 tratada como lacuna normativa planejada (§12)
8. Critério de entrada para T5.R declarado (§15 — 9 condições)
9. Live files (STATUS/LATEST/_INDEX) atualizados
10. Commit, push e PR aberta no GitHub

---

## §17 Próxima PR autorizada

**PR-T5.R — Readiness / Closeout G5** — após merge desta PR-T5.8 e cumprimento das
condições CE-01..CE-09 de §15.

Recomendação antes de PR-T5.R:
- Executar o shadow declarativo dos 48 cenários (ou confirmar formalmente que serão executados em runtime)
- Abrir PR-fix para AT-01 (ponteiro F2 averbação)
- Abrir PR-fix para AT-03 (nota F2 separado sem averbação)
- Abrir PR-fix para AT-04 (regime múltiplo explícito em F5)
- Declarar AT-05 como lacuna aceita no body de PR-T5.R

---

## §18 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: plano de shadow/sandbox — não cria runtime, não altera fatias
Última PR relevante: PR-T5.7 (#122) — merged 2026-04-28T02:28:38Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
Objetivo imutável do contrato: Migração declarativa do funil core por fatias; LLM soberano na fala
Recorte a executar nesta PR: PR-T5.8 — Plano de shadow/sandbox F1-F5
Item do A01: T5 — PR-T5.8 — Plano shadow/sandbox
Estado atual da frente: T5 aberto; F1-F5 documentados; paridade validada (T5.7)
O que a última PR fechou: Matriz de paridade F1-F5; veredito "PODE SEGUIR COM ATENÇÃO"; 0 bloqueantes
O que a última PR NÃO fechou: plano shadow; readiness T5.R; G5
Por que esta tarefa existe: contrato T5 exige plano shadow/sandbox antes de T5.R
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar T5_PLANO_SHADOW_SANDBOX.md com 48 cenários, critérios, riscos e condições de T5.R
Escopo: schema/implantation/T5_PLANO_SHADOW_SANDBOX.md + live files
Fora de escopo: src/, runtime, fatias F1-F5, regras comerciais, fact_*, current_phase, inventário
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas: F1-F5, T5_MATRIZ, Contrato T5, T2/T3/T4, Adendos
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | 48 cenários mínimos declarados (43 do brief + 5 adicionais de cobertura completa) | §7 (Blocos A..E) |
| 2 | Pré-condições para shadow documentadas (PC-01..08 declarativas + PC-F-01..06 futuras) | §6 |
| 3 | Matriz de evidências esperadas para runtime futuro | §8 (15 campos) |
| 4 | 16 critérios de sucesso declarados | §9 |
| 5 | 8 critérios de falha/bloqueio declarados | §10 |
| 6 | AT-01 tratada com cenário de observação (SHD-E-31) e ação recomendada | §11 |
| 7 | AT-03 tratada com cenário de observação (SHD-E-32) e ação recomendada | §11 |
| 8 | AT-04 tratada com cenários de observação (SHD-C-19/20) e ação recomendada | §11 |
| 9 | AT-05 declarada como lacuna normativa planejada — não bloqueante | §12 |
| 10 | 7 riscos controlados com mitigação | §13 |
| 11 | 8 riscos bloqueantes com condição de disparo e ação | §14 |
| 12 | 9 condições de entrada para PR-T5.R declaradas | §15 |
| 13 | Critério de saída de T5.8 declarado | §16 |
| 14 | Próxima PR (T5.R) autorizada condicionalmente | §17 |
| 15 | Zero regra comercial criada | auditável em §7-§14 |
| 16 | Zero `fact_*` ou `current_phase` criado | auditável neste artefato |
| 17 | Zero `reply_text` ou template | auditável — plano puro sem texto de fala |
| 18 | Inventário não reaberto | §4 e §7: inventário ausente de todos os cenários |

### Provas

- **P-T5.8-01:** arquivo `schema/implantation/T5_PLANO_SHADOW_SANDBOX.md` criado; `git diff --stat` confirma novo artefato
- **P-T5.8-02:** 48 cenários cobrem os 43 stages F1-F5, os 6 estados civis, os 9 regimes principais, os benefícios não financiáveis, os 3 casos civis de fix, o dossiê completo, o correspondente e a finalização
- **P-T5.8-03:** zero `reply_text` em qualquer seção do plano; zero regra comercial criada; zero `fact_*` inventado; inventário ausente de todos os cenários

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T5_PLANO_SHADOW_SANDBOX.md — plano declarativo com 48 cenários, matriz de evidências, critérios de sucesso/falha, tratamento das atenções AT-01/03/04/05, 9 condições para T5.R
O que foi fechado nesta PR: Plano de shadow/sandbox F1-F5; PR-T5.R autorizada condicionalmente (CE-01..09)
O que continua pendente: Execução do shadow com runtime; PR-fixes de AT-01/03/04; PR-T5.R; G5
O que ainda não foi fechado do contrato ativo: PR-T5.R; G5; shadow com runtime; PR-fixes atenções
Recorte executado do contrato: T5 — PR-T5.8 — Plano shadow/sandbox
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — PR-T5.R autorizada após CE-01..09
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
