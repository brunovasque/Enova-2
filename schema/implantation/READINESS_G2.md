# READINESS_G2 — Smoke Documental e Decisão do Gate G2 — ENOVA 2

## Finalidade

Este documento executa o smoke documental de PR-T2.0 a PR-T2.5 e declara a decisão formal sobre
o Gate G2 (estado estruturado funcional — schema publicado, política aprovada, reconciliação
mapeada, resumo persistido definido, compatibilidade E1→E2 mapeada).

É o documento-base de evidência da PR-T2.R — Readiness e closeout do gate G2.

**Base soberana:**
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T2 (critérios de pronto por fase — T2)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` — critérios de aceite §7
- `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — seção PR-T2.R
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## 1. Smoke documental — PR-T2.0 a PR-T2.5

### 1.1 PR-T2.0 — Abertura formal do contrato T2

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | Objetivo §1, Escopo §2, Fora de escopo §3, Dependências §4, Entradas §5, Saídas §6, Critérios de aceite §7 (8 critérios), Provas §8, Bloqueios §9, Gate G2 §17, Quebra de PRs §16 (T2.0–T2.R), Microetapas do mestre §18, Legados §14, Referências §13 |
| Adendos declarados | A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 — todos declarados |
| Dependência de G1 | `READINESS_G1.md` — G1 APROVADO em 2026-04-23 — verificado |
| Bloco E | PR-T2.0 não encerra etapa com Bloco E próprio — é abertura de contrato; Bloco E aplicado nas PRs de entrega (T2.1–T2.5) |
| Conclusão | **PASS** — contrato T2 aberto formalmente com corpo completo |

---

### 1.2 PR-T2.1 — Dicionário canônico de fatos

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T2_DICIONARIO_FATOS.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 princípio de uso (prefixos fact_/derived_/signal_); §2 auditoria duplicidade E1→E2; §3 dicionário canônico (grupos I–XII); §4 categorias de memória (7 categorias); §5 tabela consolidada E1→E2; §6 contagem final; §7 regras invioláveis M-01..M-10; §8 cobertura microetapas; §9 Bloco E |
| Fatos canônicos | 35 `fact_*` (grupos I–X) — critério ≥14 **ATENDIDO** (35 ≥ 14) |
| Fatos derivados | 9 `derived_*` (grupo XI) — critério ≥6 **ATENDIDO** (9 ≥ 6) |
| Sinais cognitivos | 6 `signal_*` (grupo XII) — separados de fatos por namespace e semântica |
| Duplicidade semântica | §2 resolve: `has_multi_income_p1` → signal + fact separados; `rnm_required` → eliminado (derivável); `dependents_applicable` → eliminado (derivável); `subsidy_band_hint` → rebaixado a derived — **ZERO duplicidades remanescentes** |
| LLM-first | M-01: "Nenhuma categoria de memória pode gerar reply_text" — declarado e verificado |
| E1 como fonte | Princípio declarado em §1: "E1 é fonte, não arquitetura" |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T2.2 desbloqueada |
| Conclusão | **PASS** |

---

### 1.3 PR-T2.2 — Schema `lead_state` v1

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T2_LEAD_STATE_V1.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 shape geral; §2 CaseMeta; §3 OperationalState (11 campos, 8 valores `current_phase`); §4 FactBlock (35 fact_*, 5 status, FactEntry shape); §5 DerivedBlock (9 derived_*, DerivedEntry shape); §6 Pending (6 PEND_*); §7 Conflicts (4 CONF_*, protocolo resolução); §8 SignalBlock (6 signal_*); §9 HistorySummary (4 camadas, SnapshotExecutivo); §10 VasquesNotes; §11 NormativeContext; §12 regras LS-01..LS-12; §13 tabela mapeamento; §14 compatibilidade E1→E2; §15 Bloco E |
| Fatos centrais | 35 fact_* — critério ≥14 **ATENDIDO** |
| Fatos derivados | 9 derived_* — critério ≥6 **ATENDIDO** |
| Metadados de confiança | `FactEntry.source` (9 valores canônicos), `FactEntry.confirmed` (boolean), `FactEntry.confidence` (enum), `FactEntry.turn_set` (rastreabilidade) |
| Objetivo atual | `operational.current_objective` com `type` (OBJ_*) e `target_fact` |
| Histórico resumido | `history` com L1/L2/L3/L4 e SnapshotExecutivo shape |
| Pendências | `pending[]` com 6 PEND_* tipos |
| Conflitos | `conflicts[]` com 4 CONF_* tipos + protocolo resolução 6 passos |
| Amarração ao dicionário | LS-10: "chaves de facts e derived devem ser nomes canônicos do T2_DICIONARIO_FATOS.md" — explícito |
| LLM-first | LS-09: "LLM não persiste dados diretamente"; `approval_prohibited = true` invariante (LS-07) |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T2.3 desbloqueada |
| Conclusão | **PASS** |

---

### 1.4 PR-T2.3 — Política de confiança por origem

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T2_POLITICA_CONFIANCA.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 referência cruzada status; §2 tabela 6 origens; §3 política por origem; §4 mapa de transição; §5 fatos críticos (12); §6 quando exige confirmação (7 condições); §7 quando gera conflito; §8 quando bloqueia avanço; §9 registro obrigatório + 9 source values; §10 casos sintéticos S1–S5; §11 amarração lead_state; §12 regras PC-01..PC-12; §13 cobertura origens do mestre; §14 Bloco E |
| Origens do mestre | 5 origens do mestre cobertas: EXPLICIT_TEXT ✓, INDIRECT_TEXT ✓, AUDIO_TRANSCRIPT ✓, DOCUMENT ✓, INFERENCE ✓ — critério de aceite §7.3 **ATENDIDO** |
| 6ª origem (Vasques) | OPERATOR_NOTE adicionada além das 5 do mestre — **não viola** o critério (que exige "exatamente as 5 do mestre cobertos", não "somente 5") |
| 12 fatos críticos | §5 lista completa — `fact_monthly_income_p1`, `fact_estado_civil`, `fact_work_regime_p1`, `fact_has_restriction`, `fact_process_mode`, `fact_nationality`, `fact_composition_actor`, `fact_autonomo_has_ir_p1`, `fact_monthly_income_p2`, `fact_rnm_status`, `fact_work_regime_p2`, `fact_ctps_36m_p1` |
| Inferência → confirmed | PC-03: "Inferência nunca atinge status `confirmed`" — declarado explicitamente |
| Conflito silencioso | PC-08: "Conflito silencioso é proibido" — declarado explicitamente |
| LLM-first | PC-11: "Nenhuma política de confiança produz `reply_text`" — declarado |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T2.4 desbloqueada |
| Conclusão | **PASS** |

---

### 1.5 PR-T2.4 — Reconciliação e tipologia

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T2_RECONCILIACAO.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 tipologia 7 estados (1.1 tabela, 1.2 definições); §2 protocolo 7 etapas + fluxograma ASCII; §3 prioridade entre origens; §4 reconciliação por domínio (10 domínios); §5 casos sintéticos RC-01..RC-10; §6 tabela de transições; §7 anti-padrões AP-01..AP-12; §8 regras RC-01..RC-10; §9 amarração lead_state; §10 Bloco E |
| 5 tipos canônicos | `hypothesis` ✓, `captured` (bruto) ✓, `inferred` (inferência) ✓, `confirmed` ✓, `pending` ✓ — critério §7.4 **ATENDIDO** |
| 2 tipos adicionais | `contradicted` + `obsolete` — estados terminais/bloqueantes; enriquecem sem violar o critério |
| Casos do mestre | Renda ajustada: RC-01 ✓ | Estado civil corrigido: RC-02, RC-03 ✓ | Parceiro entra depois: RC-04 ✓ | Autônomo revela IR: RC-05 ✓ — critério §7.4 **ATENDIDO** |
| Protocolo de 7 etapas | receber → verificar existência → 1º registro ou compatibilidade → gerar CONF_* → LLM confirma → resolver → auditoria |
| Confirmed imutável | RC-02: "Fato `confirmed` é imutável sem reconciliação formal" — declarado |
| Inferência não vence confirmed | RC-08: "`derived_*` não sobrescreve `fact_*`" — declarado |
| LLM-first | RC-09: "Nenhum bloco de reconciliação produz `reply_text`" — declarado |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T2.5 desbloqueada |
| Conclusão | **PASS** |

---

### 1.6 PR-T2.5 — Resumo persistido + compatibilidade E1→E2

| Campo | Resultado |
|-------|----------|
| Artefato | `schema/implantation/T2_RESUMO_PERSISTIDO.md` |
| Status | PRESENTE E COMPLETO |
| Seções verificadas | §1 quatro camadas (L1–L4); §2 protocolo snapshot; §3 anti-contaminação; §4 memória Vasques; §5 aprendizado sem script; §6 compatibilidade E1→E2; §7 cobertura microetapas; §8 casos SP-01..SP-10; §9 anti-padrões AP-RP-01..12; §10 regras RP-01..10; §11 amarração lead_state; §12 Bloco E |
| Mecanismo de compressão | L3 (snapshot executivo) com shape SnapshotExecutivo completo, 7 triggers de criação — critério §7.5 **ATENDIDO** |
| Mapa E1→E2 | §6.2 tabela 27 campos com treatment + 7 descartados + §6.3 tabela stages — critério §7.5 **ATENDIDO** |
| Snapshot ≠ lead_state | RP-02: "Resumo nunca sobrescreve `lead_state`" — declarado. RC-AN-01..07: regras anti-contaminação completas |
| L4 não contamina ativo | RP-L4-01: "L4 não carregado automaticamente"; RP-L4-03: "L4 não reabre conflitos fechados" |
| approval_prohibited invariante | RP-01: "`approval_prohibited = true` é invariante em todo SnapshotExecutivo" — declarado |
| E1 é ponte transitória | RP-10: "Compatibilidade E1→E2 vigora até T5" — declarado. RB-07: "E1 é fonte de evidência, não destino" |
| LLM-first | RP-04: "`reply_text` de turno anterior não é dado persistido. Fala não é memória." |
| Bloco E | `Fechamento permitido nesta PR?: sim` — PR-T2.R desbloqueada |
| Conclusão | **PASS** |

---

## 2. Verificação de coerência entre artefatos

### 2.1 Dicionário ↔ lead_state ↔ política ↔ reconciliação ↔ resumo

| Verificação | Evidência | Status |
|-------------|-----------|:------:|
| Chaves do dicionário (T2.1) usadas como referência no lead_state (T2.2) | LS-10: "chaves devem ser nomes canônicos do T2_DICIONARIO_FATOS.md" | PASS |
| Status canônicos (T2.2) referenciados na política (T2.3) | §1 de T2_POLITICA_CONFIANCA referencia explicitamente T2_LEAD_STATE_V1 status | PASS |
| Origens (T2.3) usadas pelo protocolo de reconciliação (T2.4) | §3 de T2_RECONCILIACAO usa origens DOCUMENT/EXPLICIT_TEXT/AUDIO do T2.3 | PASS |
| Protocolo de reconciliação (T2.4) integrado ao resumo (T2.5) | RC-AN-05: "Snapshot não substitui reconciliação"; RP-03 referencia T2_RECONCILIACAO.md §2 explicitamente | PASS |
| CONF_* de T2.2 gerados pelo protocolo de T2.4 | §4 Conflitos no T2.2 + §2 Protocolo em T2.4 + §7 T2.3 — consistentes | PASS |
| PEND_* de T2.2 gerados pela política de T2.3 | PEND_SLOT_VAZIO/CONFIRMACAO/DOCUMENTO alinhados entre artefatos | PASS |
| SnapshotExecutivo shape de T2.2 §9.3 alinhado com T2.5 §2 | T2.5 §2 usa e expande o shape de T2.2 §9.3 sem contradição | PASS |
| VasquesNotes de T2.2 §10 alinhadas com limites T2.5 §4 | Tipos de nota e regras consistentes entre os dois documentos | PASS |

### 2.2 Nomes canônicos — ausência de sinônimos não-canônicos

| Verificação | Evidência | Status |
|-------------|-----------|:------:|
| Nenhum sinônimo de `fact_monthly_income_p1` (ex.: `renda`, `income_p1`, `salary`) em artefatos T2 | Busca transversal — todos os documentos usam prefixo canônico `fact_` | PASS |
| Nenhuma chave E1 sem mapeamento persistida como FactEntry | T2.5 §6.2 lista campos E1 e ações de migração; AP-RP-06 proíbe explicitamente | PASS |
| Nenhum campo `has_multi_income_p1` sem separação signal/fact | T2.1 §2 e T2.5 §6.2 (SP-10) resolvem a ambiguidade | PASS |

### 2.3 Separação fatos / sinais / derivados / hipóteses / pendências

| Tipo | Onde definido | Separação verificada |
|------|--------------|:-------------------:|
| `fact_*` (bruto/confirmado) | T2.1 grupos I–X; T2.2 §4 | ✓ |
| `derived_*` (calculado automaticamente) | T2.1 grupo XI; T2.2 §5 | ✓ |
| `signal_*` (cognitivo operacional, não fact) | T2.1 grupo XII; T2.2 §8 | ✓ |
| `hypothesis` (pré-captura, não persiste) | T2.3 §3.5; T2.4 §1.2; PC-02 | ✓ |
| `pending` (PEND_*) | T2.2 §6; T2.4 §1.2 estado `pending` | ✓ |
| `contradicted` (conflito ativo) | T2.4 §1.2 | ✓ |
| `obsolete` (histórico terminal) | T2.4 §1.2; RC-OB1..3 | ✓ |

### 2.4 Soberania LLM-first — memória não redige reply_text

| Artefato | Regra explícita anti-reply_text | Status |
|----------|--------------------------------|:------:|
| T2_DICIONARIO_FATOS | M-01: "Nenhuma categoria de memória pode gerar reply_text" | ✓ |
| T2_LEAD_STATE_V1 | LS-09: "LLM não persiste dados diretamente — o mecânico registra; o LLM coleta via conversa" | ✓ |
| T2_POLITICA_CONFIANCA | PC-11: "Nenhuma política de confiança produz reply_text" | ✓ |
| T2_RECONCILIACAO | RC-09: "Nenhum bloco de reconciliação produz reply_text — o LLM conduz via linguagem natural" | ✓ |
| T2_RESUMO_PERSISTIDO | RP-04: "reply_text de turno anterior não é dado persistido. Fala não é memória." AP-RP-05, AP-RP-10 | ✓ |

**Resultado: ZERO violações de soberania LLM-first nos 6 artefatos T2. PASS.**

### 2.5 Snapshot não sobrescreve fact confirmado

| Regra | Artefato | Enunciado | Status |
|-------|----------|-----------|:------:|
| RP-02 | T2_RESUMO_PERSISTIDO | "Resumo nunca sobrescreve `lead_state`. Em divergência, `lead_state` L2 prevalece." | ✓ |
| RP-03 | T2_RESUMO_PERSISTIDO | "Fato `confirmed` em L2 não pode ser revertido por informação de L3 ou L4. Exige reconciliação formal." | ✓ |
| RC-AN-01 | T2_RESUMO_PERSISTIDO | "Texto do `profile_summary` nunca pode ser usado como evidência para confirmar fato." | ✓ |
| RC-AN-05 | T2_RESUMO_PERSISTIDO | "Snapshot não substitui reconciliação." | ✓ |
| LS-07 | T2_LEAD_STATE_V1 | "`approval_prohibited = true` no snapshot executivo é invariante — nunca pode ser false." | ✓ |

### 2.6 Reconciliação impede sobrescrita silenciosa

| Regra | Evidência | Status |
|-------|-----------|:------:|
| RC-02 | "Fato `confirmed` é imutável sem reconciliação formal com trilha auditável." | ✓ |
| RC-03 | "Conflito silencioso é proibido — toda contradição gera `CONF_*` registrado." | ✓ |
| PC-08 | "Conflito silencioso é proibido — toda contradição deve ser registrada como `Conflict`." | ✓ |
| AP-01 | "Substituir fact_* confirmado sem registrar CONF_*" — anti-padrão explícito | ✓ |

### 2.7 Política de confiança impede inferência virar confirmed

| Regra | Evidência | Status |
|-------|-----------|:------:|
| PC-03 | "Inferência (mecânica ou LLM) nunca atinge status `confirmed`." | ✓ |
| PC-07 | "Inferência semântica do LLM gera `hypothesis`; não persiste sem coleta direta." | ✓ |
| RC-08 | "Inferência nunca vence fato confirmado — `derived_*` não sobrescreve `fact_*`." | ✓ |
| RC-I1 | "Inferência mecânica `inferred` nunca vira `confirmed` diretamente — exige confirmação do lead." | ✓ |
| PC-12 | "`derived_eligibility_probable` nunca substitui confirmação dos fatos de base." | ✓ |

### 2.8 E1 não tratado como arquitetura final

| Regra | Evidência | Status |
|-------|-----------|:------:|
| T2.1 §1 | "E1 é fonte, não arquitetura" | ✓ |
| RB-07 | "E1 é fonte de evidência histórica; `lead_state` E2 é a fonte de verdade a partir da migração." | ✓ |
| RP-10 | "Compatibilidade E1→E2 é ponte transitória (vigora até T5)." | ✓ |
| A00-ADENDO-02 | Proíbe que Enova 2 seja executada como continuação mecânica da E1. | ✓ |

---

## 3. Cenários sintéticos de validação

### Cenário V1 — Conflito de origem: texto vs. documento (cobre T2.3 + T2.4)

**Contexto:** Lead declarou renda de R$3.500 por texto explícito (status: `confirmed`).
Documento posterior apresenta holerite de R$2.800.

**Protocolo esperado:**
1. Novo dado (DOCUMENT) chega. T2_POLITICA_CONFIANCA §3.4: documento válido → `captured` com source `document`.
2. T2_RECONCILIACAO §2: fato existe + status `confirmed` + incompatível → Etapa 4: gerar `CONF_RENDA`.
3. `needs_confirmation = true`. T2.2 §7.4: LLM recebe `OBJ_CONFIRMAR`.
4. Lead confirma R$2.800 (holerite). Fato: `value = 2800, status = confirmed, source = confirmed`.
5. Fato anterior (3.500) → `obsolete`, arquivado em L4.
6. T2_RECONCILIACAO RC-10: trilha auditável completa (turno detecção, turno resolução, source vencedor, source descartado, Conflict.id).

**Verificação:** RC-02 (confirmed imutável sem reconciliação) ✓ | RC-03 (sem conflito silencioso) ✓ | PC-08 ✓ | T2.5 RP-03 ✓

**Resultado: PASS**

---

### Cenário V2 — Origem de áudio ruim + proteção de confirmed (cobre T2.3 + T2.2)

**Contexto:** Lead mencionou estado civil por áudio de qualidade ruim. Fato `fact_estado_civil`
ainda não existe no `lead_state`.

**Protocolo esperado:**
1. Turno com áudio ruim. T2_POLITICA_CONFIANCA §3.3: `audio_poor` não persiste como `FactEntry`.
2. Mecânico NÃO registra `fact_estado_civil = "casado", status = captured, source = audio_poor`.
3. Mecânico gera `PEND_CONFIRMACAO` para `fact_estado_civil` com `origin = audio_poor`.
4. LLM conduz recoleta: "Desculpe, tive dificuldade de entender. Pode confirmar seu estado civil?"
5. Recoleta por texto explícito → `fact_estado_civil.status = captured, source = llm_collected`.
6. Fato crítico (§5 de T2.3): exige confirmação explícita antes de `confirmed` (PC-04).
7. Lead confirma → `confirmed`.

**Verificação:** PC-06 (áudio ruim não persiste) ✓ | PC-04 (confirmação obrigatória) ✓ | T2.4 Domínio §4.8 ✓

**Resultado: PASS**

---

### Cenário V3 — Resumo antigo vs. fato atual + invariante approval_prohibited (cobre T2.5 + T2.2 + T2.3)

**Contexto:** Snapshot L3 gerado no turno 10 registrou `confirmed_facts = ["fact_monthly_income_p1"]`
com `profile_summary` mencionando "renda compatível com programa". No turno 15, lead informa que
renda caiu (mudança de emprego).

**Protocolo esperado:**
1. Novo valor de renda detectado. T2_RECONCILIACAO §2: fato `confirmed` + incompatível → `CONF_RENDA`.
2. T2_RESUMO_PERSISTIDO RC-AN-01: snapshot não é evidência de confirmação. Reconciliação obrigatória.
3. Lead confirma nova renda. Fato atualizado via reconciliação formal. Fato anterior → `obsolete`.
4. Novo snapshot gerado após resolução com `confirmed_facts[]` atualizado.
5. `profile_summary` NÃO menciona aprovação: RP-01 (`approval_prohibited = true` invariante).
6. T2_RESUMO_PERSISTIDO AP-RP-01: `profile_summary` com aprovação → snapshot rejeitado.

**Verificação:** RP-02 (snapshot não sobrescreve) ✓ | RP-03 (confirmed exige reconciliação) ✓ | RP-01 (approval_prohibited) ✓ | A00-ADENDO-02 ✓

**Resultado: PASS**

---

## 4. Verificação dos 8 critérios de aceite do contrato T2 (§7)

| # | Critério | Evidência | Status |
|---|----------|-----------|:------:|
| 1 | `T2_DICIONARIO_FATOS.md` cobre fatos centrais e derivados do mestre T2 sem duplicidade semântica | 50 chaves (35+9+6); §2 resolve todas as duplicidades conhecidas E1; M-01..M-10 | **CUMPRIDO** |
| 2 | `T2_LEAD_STATE_V1.md` define schema completo com ≥14 fatos centrais, ≥6 derivados, pendências, conflitos, objetivo, histórico e metadados de confiança, amarrados ao dicionário T2.1 | 35 fact_* (≥14 ✓), 9 derived_* (≥6 ✓), 6 PEND_*, 4 CONF_*, OperationalState 11 campos, HistorySummary 4 camadas, FactEntry com source/confirmed/confidence; LS-10 amarra ao dicionário | **CUMPRIDO** |
| 3 | `T2_POLITICA_CONFIANCA.md` cobre as 5 origens do mestre: texto explícito, indireto, áudio, documento, inferência | EXPLICIT_TEXT ✓, INDIRECT_TEXT ✓, AUDIO_TRANSCRIPT (3 níveis) ✓, DOCUMENT ✓, INFERENCE (2 tipos) ✓ — 5/5 do mestre cobertos; 6ª origem (Vasques) adicional | **CUMPRIDO** |
| 4 | `T2_RECONCILIACAO.md` cobre 5 tipos canônicos e casos de conflito do mestre (renda, estado civil, parceiro depois, autônomo IR) | hypothesis/captured/inferred/confirmed/pending = 5 canônicos ✓; RC-01 (renda) ✓, RC-02/RC-03 (estado civil) ✓, RC-04 (parceiro depois) ✓, RC-05 (autônomo IR) ✓ | **CUMPRIDO** |
| 5 | `T2_RESUMO_PERSISTIDO.md` define mecanismo de compressão e mapeia fatos E1 | L3 snapshot como mecanismo de compressão; tabela E1→E2 com 27 campos + 7 descartados + stages | **CUMPRIDO** |
| 6 | Nenhum artefato T2 viola soberania LLM-first | §2.4 deste documento: M-01, PC-11, RC-09, RP-04 em todos os 5 artefatos de entrega; zero violações encontradas | **CUMPRIDO** |
| 7 | `READINESS_G2.md` (este documento) aprova G2 com smoke 6/6 e critérios verificados | Smoke 6/6 PASS; cenários V1/V2/V3 PASS; critérios 1–8 verificados | **CUMPRIDO** |
| 8 | Índice, status e handoff atualizados ao final de cada PR | Commits: T2.0 (contrato) → T2.1 (dicionário) → T2.2 (lead_state) → T2.3 (confiança) → T2.4 (reconciliação) → T2.5 (resumo); cada commit atualiza _INDEX.md + STATUS.md + LATEST.md | **CUMPRIDO** |

**Resultado: 8/8 critérios CUMPRIDOS.**

---

## 5. Lacunas identificadas

### 5.1 Lacunas não bloqueantes

| Lacuna | Natureza | Por que não bloqueia G2 |
|--------|----------|-------------------------|
| L04, L07–L14, L17, L18 (L-blocks) não transcritos do repositório E1 | Acesso ao código legado não disponível para leitura direta | Declarado como limitação estrutural desde PR-T0.1; T2 é documental e não depende dos L-blocks para definir schema; impacto será avaliado em T4/T5 |
| Runtime não implementado (`src/` inalterado) | T2 é fase documental; implementação é T4/T5 | Contrato T2 §3 (Fora de escopo) declara explicitamente: "Implementação de runtime — T2 é estrutural/documental" |
| Supabase schema não criado | T2 não implementa persistência real | Contrato T2 §3 declara: "Aplicar migrations ou alterações em Supabase real — em nenhuma PR de T2" |
| LLM real não testado | T2 é documental | T2 produz artefatos que guiam T3/T4; teste com LLM real ocorre em T3+ |
| Nenhum teste de integração E1→E2 com dados reais | T5 é a fase de migração funcional | T2.5 define o mapa; execução é T5 |

### 5.2 Lacunas bloqueantes

**NENHUMA.**

Não foram identificadas lacunas estruturais nos artefatos T2 que:
- Violem soberania LLM-first;
- Permitam inferência virar `confirmed` sem confirmação do lead;
- Permitam sobrescrita silenciosa de fato `confirmed`;
- Permitam snapshot sobrescrever `lead_state`;
- Criem duplicidade semântica entre fatos/sinais/derived;
- Tratem E1 como arquitetura final;
- Permitam memória redigir `reply_text`.

---

## 6. Decisão formal — Gate G2

### 6.1 Justificativa

Os 6 artefatos de T2 foram entregues integralmente:

1. `T2_DICIONARIO_FATOS.md` — 50 chaves canônicas sem duplicidade semântica, E1→E2 auditada.
2. `T2_LEAD_STATE_V1.md` — schema completo com 11 blocos, 35+9+6 chaves, 12 regras.
3. `T2_POLITICA_CONFIANCA.md` — 6 origens (5 do mestre + Vasques), 12 regras PC.
4. `T2_RECONCILIACAO.md` — 7 estados, protocolo 7 etapas, 10 domínios, casos do mestre cobertos.
5. `T2_RESUMO_PERSISTIDO.md` — 4 camadas, snapshot, E1→E2 tabela completa, 10 regras.
6. `READINESS_G2.md` (este documento) — smoke 6/6 PASS, critérios 8/8 CUMPRIDOS.

Os 8 critérios de aceite do contrato T2 §7 foram todos verificados com evidência completa.

Nenhuma violação de soberania LLM-first foi encontrada. Nenhuma lacuna estrutural bloqueante foi
identificada. Todas as microetapas obrigatórias do mestre seção T2 foram cobertas pelos artefatos.

As limitações residuais (L-blocks não transcritos, runtime não implementado, Supabase não criado)
foram declaradas desde T0, são estruturais ao escopo documental de T2, e não afetam a validade dos
documentos canônicos produzidos.

### 6.2 Decisão

```
╔══════════════════════════════════════════════════════════╗
║              G2 — APROVADO                               ║
║                                                          ║
║  Evidência: smoke 6/6 PASS, critérios 8/8 CUMPRIDOS     ║
║  Data: 2026-04-24                                        ║
║  PR: PR-T2.R                                             ║
╚══════════════════════════════════════════════════════════╝
```

**Consequência:** Contrato T2 ENCERRADO. Skeleton T3 autorizado. PR-T3.0 desbloqueada.

---

## 7. Encerramento de contrato T2

```
--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim — schema canônico de estado estruturado definido
                                        completo (dicionário, lead_state, confiança, reconciliação,
                                        resumo/E1→E2); nenhuma PR de escopo T2 pendente.
Critérios de aceite cumpridos?:         sim — 8/8 verificados na §4 deste documento
Fora de escopo respeitado?:             sim — nenhum src/, package.json, wrangler.toml alterado;
                                        nenhuma migration Supabase; nenhum runtime criado;
                                        policy engine não iniciado (T3+)
Pendências remanescentes:               nenhuma bloqueante. Limitações residuais estruturais
                                        (L-blocks não transcritos) declaradas como não bloqueantes
                                        desde PR-T0.1; impacto avaliado em T4/T5.
Evidências / provas do encerramento:    PR #90 (T2.0), #91 (T2.1), #93 (T2.2), #94 (T2.3),
                                        #95 (T2.4), #96 (T2.5), esta PR-T2.R;
                                        commits: contrato + 6 artefatos + tracking + READINESS_G2;
                                        smoke 6/6 PASS; cenários V1/V2/V3 PASS;
                                        critérios 8/8 CUMPRIDOS
Data de encerramento:                   2026-04-24
PR que encerrou:                        PR-T2.R — Readiness/Closeout G2
Destino do contrato encerrado:          archive (schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md)
Próximo contrato autorizado:            CONTRATO_IMPLANTACAO_MACRO_T3.md (skeleton — sem corpo)
```

---

## 8. Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G2.md
PR que fecha:                          PR-T2.R
Estado da evidência:                   completa
Há lacuna remanescente?:               não — smoke 6/6 artefatos T2 PASS; critérios de aceite
                                       8/8 CUMPRIDOS; coerência entre artefatos verificada em
                                       8 dimensões; soberania LLM-first verificada em todos os
                                       artefatos; 3 cenários sintéticos PASS; lacunas não
                                       bloqueantes declaradas com justificativa objetiva.
Há item parcial/inconclusivo bloqueante?: não — limitações residuais (L-blocks, runtime,
                                       Supabase) são estruturais ao escopo documental de T2 e
                                       declaradas como não bloqueantes com justificativa.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.R encerrada; G2 APROVADO; contrato T2 ENCERRADO e
                                       arquivado; skeleton T3 criado; PR-T3.0 desbloqueada.
Próxima PR autorizada:                 PR-T3.0 — Abertura do contrato de Policy Engine v1 (T3)
```
