# T6_PREFLIGHT_RISCOS_T5 — Pré-flight Cirúrgico de Riscos Herdados da T5 — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.1 |
| Branch | feat/t6-pr-t6-1-preflight-riscos-t5 |
| Artefato | Pré-flight cirúrgico das atenções herdadas da T5 antes de canal real |
| Status | entregue |
| Pré-requisito | PR-T6.0 merged (#125 — 2026-04-28T17:38:31Z); contrato T6 ABERTO |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.2 — Surface única de canal |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Esta PR é o **pré-flight cirúrgico** que precede qualquer implementação de canal real na T6.

Antes de abrir surface de canal (PR-T6.2), adapter Meta (PR-T6.7), pipeline de mídia (PR-T6.4/T6.5)
ou dossiê multicanal (PR-T6.8), é obrigatório eliminar as ambiguidades documentais herdadas
da T5 que poderiam propagar erros para o canal real.

**Atenções tratadas:**

| AT | Descrição | Status nesta PR |
|---|---|---|
| AT-01 | Ponteiro F2 averbação → F4 desatualizado | ✅ **CORRIGIDO** — ponteiro atualizado para F5 (RC-F5-36) |
| AT-03 | Separado sem averbação identificado tardiamente em F2 | ✅ **ANTECIPADO** — nota preventiva §2.5 adicionada em F2 |
| AT-04 | Docs para regime múltiplo implícitos em F5 | ✅ **EXPLICITADO** — RC-F5-38 adicionado em F5 |
| AT-05 | Base normativa MCMV/CEF ausente | 🔵 **LACUNA NORMATIVA PLANEJADA** — não tratada nesta PR; frente futura |

**Resultado:** 3/3 atenções bloqueantes para canal corrigidas; AT-05 declarada explicitamente
como lacuna planejada sem bloqueio. PR-T6.2 autorizada.

---

## §2 Escopo do pré-flight

Este pré-flight cobre exclusivamente as **atenções herdadas da T5 declaradas em**
`schema/implantation/T5_READINESS_CLOSEOUT_G5.md §6`:

- AT-01, AT-03, AT-04: correções documentais cirúrgicas nos artefatos T5 correspondentes
- AT-05: declaração formal de lacuna normativa planejada (sem tentar resolvê-la aqui)

**O que este pré-flight NÃO é:**

- Não implementa canal real
- Não cria superfície de WhatsApp/Meta
- Não cria pipeline de mídia
- Não implementa orquestrador de turno para canal
- Não altera T1/T2/T3/T4 aprovados
- Não abre F3/F4 (fatias de renda e elegibilidade)
- Não reabre união estável, P3/familiar, inventário
- Não cria `fact_*` novo
- Não cria `current_phase` novo
- Não cria `reply_text`
- Não toca `src/`

---

## §3 Fontes lidas

| # | Arquivo | Relevância |
|---|---|---|
| 1 | `CLAUDE.md` | Regras operacionais; permissões automáticas git |
| 2 | `schema/CODEX_WORKFLOW.md` | Protocolo de execução; 16 etapas; precedência documental |
| 3 | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Tronco macro soberano |
| 4 | `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` | Sequência canônica T6 |
| 5 | `schema/contracts/_INDEX.md` | Índice de contratos; T6 ABERTO |
| 6 | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` | §4 atenções herdadas; escopo T6.1 |
| 7 | `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` | Protocolo de execução contratual |
| 8 | `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` | Protocolo de encerramento |
| 9 | `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | Estado atual: T6 aberto; PR-T6.1 próxima |
| 10 | `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | Leituras obrigatórias PR-T6.1 |
| 11 | `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | A00-ADENDO-01; IA soberana na fala |
| 12 | `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | A00-ADENDO-02; T6 não cria outro cérebro |
| 13 | `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` | A00-ADENDO-03; Bloco E obrigatório |
| 14 | `schema/implantation/T5_READINESS_CLOSEOUT_G5.md` | §6 atenções AT-01/03/04/05; evidências |
| 15 | `schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` | Identificação original das atenções |
| 16 | `schema/implantation/T5_PLANO_SHADOW_SANDBOX.md` | Cenários de observação das atenções |
| 17 | `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` | F1 — verificação de impacto; nenhum ponteiro errado |
| 18 | `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | F2 — alvo de AT-01 e AT-03 |
| 19 | `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | F3 — verificação; não afetado |
| 20 | `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | F4 — verificação; não afetado |
| 21 | `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` | F5 — alvo de AT-04 |

---

## §4 Tabela consolidada das atenções

| AT | Classificação original | Arquivo-alvo | Tipo de correção | Status nesta PR |
|---|---|---|---|---|
| AT-01 | Atenção documental — ponteiro desatualizado | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §3.1 | Atualização de ponteiro: F4 → F5 | ✅ CORRIGIDO |
| AT-03 | Atenção operacional — identificação tardia | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §2.5 | Adição de nota preventiva em F2 | ✅ ANTECIPADO |
| AT-04 | Atenção documental — regime múltiplo implícito | `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` §5 | Adição de RC-F5-38 explícita | ✅ EXPLICITADO |
| AT-05 | Lacuna normativa — base MCMV/CEF ausente | — | Nenhuma ação; lacuna normativa planejada | 🔵 LACUNA PLANEJADA |

---

## §5 Correção aplicada — AT-01 (Ponteiro F2 → F4 desatualizado)

### Problema identificado

Em `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §3.1, a tabela de valores
canônicos de `fact_estado_civil` continha as seguintes entradas incorretas:

```
| "divorciado" | Solo por padrão; verificação de averbação em F4 (LF-F4: fora do escopo de F2) |
| "viúvo"      | Solo por padrão; verificação de inventário em F4 (fora do escopo de F2)         |
```

**Por que estava errado:**
- F4 é a fatia de elegibilidade/restrição de crédito — não a fatia de documentação civil
- A verificação de averbação (certidão de casamento com averbação de divórcio) está em F5,
  coberta pela RC-F5-36 (PR-T5.6-fix)
- A documentação civil do viúvo (certidão de óbito do cônjuge) está em F5, coberta pela
  RC-F5-35 (PR-T5.6-fix)
- Um ponteiro apontando para F4 poderia gerar interpretação errada ao construir o canal
  (ex: adapter disparar algo em F4 que pertence a F5)

### Correção aplicada

| Campo | Antes | Depois |
|---|---|---|
| `"divorciado"` | "verificação de averbação em F4 (LF-F4)" | "documentação civil (certidão de casamento com averbação de divórcio) é escopo de **F5** (RC-F5-36)" |
| `"viúvo"` | "verificação de inventário em F4" | "documentação civil obrigatória (certidão de óbito do cônjuge) é escopo de **F5** (RC-F5-35); inventário permanece fora do recorte ativo (deliberado)" |

**Arquivo alterado:** `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §3.1

**Regras comerciais:** inalteradas — apenas o ponteiro de localização foi corrigido.
Nenhuma nova regra criada. Nenhum `fact_*` criado. Nenhum `current_phase` criado.

---

## §6 Correção aplicada — AT-03 (Separado sem averbação — identificação preventiva)

### Problema identificado

O caso "separado(a), mas ainda casado(a) civilmente sem averbação" foi formalizado em F5
(RC-F5-37, PR-T5.6-fix), mas poderia ser identificado tardiamente — somente ao montar o
dossiê. Se o cliente mencionar "sou separado" em F2 (stage `estado_civil`), a Enova deveria
identificar preventivamente a situação de averbação.

Sem a nota preventiva em F2, o risco é:
- Lead avança F2→F3→F4 como "divorciado" ou ambíguo
- Em F5, ao solicitar certidão, descobre-se que não tem averbação
- Retrabalho: reorientar processo; oferecer os dois caminhos tardiamente
- Atrito desnecessário com o lead

### Correção aplicada

Adicionada a **§2.5** em `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` com:

1. **Nota preventiva** — quando o lead diz "sou separado(a)", identificar se há averbação
2. **Tabela de ações por situação** — com/sem averbação/dúvida sobre averbação
3. **Dois caminhos** — regularizar primeiro vs. seguir em conjunto
4. **Limites explícitos** — não é pergunta fixa; não cria `fact_*`; não cria `current_phase`
5. **Referência cruzada** — regra completa está em F5 RC-F5-37
6. **Lacuna de schema declarada** — sem `fact_estado_civil = "separado_sem_averbacao"` canônico

**Arquivo alterado:** `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §2.5 (novo)

**Regras comerciais:** nenhuma nova. Reafirma RC-F5-37 como referência. Nenhum `fact_*` criado.
Nenhum `current_phase` criado. Nenhum template de fala criado. União estável não reaberta.

---

## §7 Correção aplicada — AT-04 (Docs para regime múltiplo — explicitação)

### Problema identificado

F5 (T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md) cobre documentos por regime com as regras
RC-F5-06 a RC-F5-14 (CLT, servidor, aposentado, autônomo, MEI, empresário, informal/bico).
No entanto, o caso de **multi-renda / multi-regime** ficou implícito — não havia uma regra
explícita declarando que, quando houver múltiplas fontes de renda, os documentos devem ser
pedidos separadamente por fonte/regime.

Risco sem a explicitação:
- Ao implementar canal real (T6.2+), o adapter poderia tratar multi-renda como soma única
- Dossiê poderia conter renda somada sem identificar dono/regime/documento de cada fonte
- Análise do correspondente ficaria prejudicada por falta de rastreabilidade por fonte

### Correção aplicada

Adicionada **RC-F5-38** em `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` §5, após RC-F5-15:

1. **Regra principal** — cada fonte de renda deve ter: dono, regime, valor, documento e classificação
2. **Tabela de combinações** — 6 combinações frequentes (CLT+bico, CLT+CLT, aposentado+CLT,
   autônomo+CLT, MEI+informal, servidor+renda extra) com documentação esperada para cada
3. **Proibições explícitas** — não somar indiferenciado; não ignorar fontes secundárias;
   benefícios continuam não financiáveis (RC-F5-15)
4. **Lacuna de schema declarada** — sem `fact_*` canônico para múltiplas fontes; registrar
   como observação no dossiê até PR futura de T2

**Adicionado também:**
- VS-F5-13: veto suave — somar todas as fontes de renda sem separar por regime/fonte
- AP-F5-19: anti-padrão — tratar multi-renda como valor único indiferenciado
- Validação cruzada item 23 em §14: RC-F5-38 cirúrgico, zero `fact_*`
- Evidência 26 no Bloco E de F5: RC-F5-38 declarada, AT-04 explicitado, zero `fact_*`
- Contagem atualizada: 37 → 38 regras; 22 → 23 itens de validação cruzada

**Arquivo alterado:** `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` §5, §7, §10, §14, §15

**Regras de renda:** inalteradas. RC-F5-06..14 continuam vigentes; RC-F5-15 (não financiáveis)
continua vigente. RC-F5-38 é uma regra de organização documental, não uma nova regra de
elegibilidade. Nenhum `fact_*` criado. Nenhum `current_phase` criado.

---

## §8 Tratamento de AT-05 — Lacuna normativa planejada

### Problema identificado

AT-05 refere-se à ausência de base normativa MCMV/CEF completa no repo.
Regras do programa (grau de parentesco aceito, limite de idade, condições específicas de
aceitação, normativas CEF) não têm arquivo de referência no repo.

### Decisão contratual

AT-05 é declarada **lacuna normativa planejada** em todos os contratos relevantes:
- `T2_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §4 LF-05
- `CONTRATO_IMPLANTACAO_MACRO_T5.md` (AT-05 aceita por Vasques no T5_READINESS_CLOSEOUT_G5)
- `CONTRATO_IMPLANTACAO_MACRO_T6.md` §3 e §4

### Por que não tratar nesta PR

1. Base normativa completa MCMV/CEF exige frente própria com contrato específico
2. Inserir normativa parcial ou inventada seria mais danoso que a lacuna
3. Esta PR é pré-flight cirúrgico — somente atenções com correção cirúrgica viável
4. AT-05 não bloqueia canal (T6.2+) — o LLM opera com o conhecimento disponível e
   declara limitação quando há dúvida regulatória específica

### Ação declarada

- AT-05 permanece lacuna normativa planejada
- Uma frente/contrato futuro deverá organizar a base normativa MCMV/CEF
- A Enova deve declarar limitação quando houver dúvida regulatória específica
- Não inserir normativa sem autorização do Vasques

**Nenhum arquivo alterado para AT-05.**

---

## §9 Arquivos criados / alterados

| Arquivo | Operação | AT tratada | Linhas |
|---|---|---|---|
| `schema/implantation/T6_PREFLIGHT_RISCOS_T5.md` | CRIADO | AT-01/03/04/05 (documento formal) | +este arquivo |
| `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | MODIFICADO | AT-01 (§3.1), AT-03 (§2.5 novo) | ~+55 linhas |
| `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` | MODIFICADO | AT-04 (RC-F5-38, VS-F5-13, AP-F5-19, §14/§15) | ~+60 linhas |
| `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` | MODIFICADO | Registro PR-T6.1; PR-T6.2 desbloqueada | ~+2 linhas |
| `schema/contracts/_INDEX.md` | MODIFICADO | Sincronização PR-T6.1 | ~+2 linhas |
| `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` | MODIFICADO | Fase T6; PR-T6.2 próxima | ~+8 linhas |
| `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` | MODIFICADO | Seção PR-T6.1 | ~+40 linhas |

---

## §10 O que não foi alterado

| Arquivo | Motivo de não alterar |
|---|---|
| `src/` (qualquer arquivo) | Fora de escopo — T6.1 é pré-flight documental |
| `package.json` | Fora de escopo |
| `wrangler.toml` | Fora de escopo |
| `T5_FATIA_TOPO_ABERTURA.md` | Verificado: sem ponteiro F2→F4 errado; não afetado |
| `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | Verificado: não afetado pelas atenções AT-01/03/04 |
| `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | Verificado: F4 — confirmado que não é o destino dos ponteiros |
| `T1_*.md`, `T2_*.md`, `T3_*.md`, `T4_*.md` | Artefatos aprovados; T6.1 não altera T1–T4 |
| `T5_MAPA_FATIAS.md` | Mapa de fatias intocável por T6 (§3 contrato T6) |
| `T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` | Matriz de paridade — não é alvo das correções |
| `T5_PLANO_SHADOW_SANDBOX.md` | Plano shadow — não é alvo das correções |
| Base normativa MCMV/CEF | AT-05: lacuna planejada — sem ação nesta PR |
| União estável | Não reaberta |
| P3/familiar casado civil | Não reaberto |
| Inventário | Não reaberto; permanece fora do recorte ativo |
| Regras de renda (F3) | Inalteradas |
| Regras de restrição (F4) | Inalteradas |

---

## §11 Provas de zero runtime

| Prova | Verificação |
|---|---|
| Zero `src/` tocado | Nenhum arquivo em `src/` foi aberto, lido ou editado nesta PR |
| Zero `package.json` alterado | Não alterado |
| Zero `wrangler.toml` alterado | Não alterado |
| Zero migration Supabase | Nenhuma migration criada |
| Zero canal real | Nenhuma surface de canal criada |
| Zero WhatsApp/Meta | Nenhum adapter, webhook ou endpoint criado |
| Zero `fact_*` inventado | AT-01: apenas ponteiro. AT-03: lacuna declarada sem fact_*. AT-04: lacuna declarada sem fact_*. |
| Zero `current_phase` criado | Nenhum novo valor de current_phase |
| Zero `reply_text` | Nenhuma instrução de fala criada |
| Zero template de atendimento | Nenhum script, pergunta fixa ou template |
| Zero regra comercial nova fora das atenções | RC-F5-38 é explicitação de regra implícita — não inventa regra nova |

---

## §12 Critérios de saída — verificação

| Critério | Status | Evidência |
|---|---|---|
| AT-01 corrigida como ponteiro/documentação | ✅ | §3.1 F2: "divorciado" e "viúvo" → ponteiros corretos para F5 |
| AT-03 antecipada como nota preventiva em F2 | ✅ | §2.5 F2: nota sobre separado sem averbação; dois caminhos; sem regra nova |
| AT-04 explicitada para multi-renda/multi-regime em F5 | ✅ | RC-F5-38 adicionada em F5 §5; VS-F5-13; AP-F5-19 |
| AT-05 permanece lacuna normativa planejada | ✅ | §8 deste artefato; nenhuma ação sobre AT-05 |
| `T6_PREFLIGHT_RISCOS_T5.md` existe | ✅ | Este arquivo |
| Zero `src/` tocado | ✅ | §11 |
| Zero runtime implementado | ✅ | §11 |
| Zero `fact_*` novo | ✅ | §11 |
| Zero `current_phase` novo | ✅ | §11 |
| Zero `reply_text` | ✅ | §11 |
| Zero template de fala | ✅ | §11 |
| Zero regra comercial nova fora das atenções | ✅ | RC-F5-38 = explicitação de regra já implícita em RC-F5-06..14 |
| Próxima PR autorizada: PR-T6.2 | ✅ | §13 |

---

## §13 Próxima PR autorizada

**PR-T6.2 — Surface única de canal**

Contrato declarativo da camada de entrada única: texto, documento, imagem, PDF, áudio,
sticker, botão/link, evento de sistema. Invariante: canal não escreve atendimento.

Leituras obrigatórias para PR-T6.2:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` §2 item 2
2. `schema/implantation/T6_PREFLIGHT_RISCOS_T5.md` (este artefato — confirmação de pré-flight concluído)
3. `schema/implantation/T4_ENTRADA_TURNO.md` — shape TurnoEntrada que a surface alimenta
4. `schema/implantation/T4_PIPELINE_LLM.md` — contrato único LLM; reply_text imutável
5. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
6. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
7. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## §14 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T6_PREFLIGHT_RISCOS_T5.md
PR que fecha:                          PR-T6.1 — Pré-flight cirúrgico de riscos herdados T5
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não como bloqueante —
                                       AT-01: corrigido (ponteiro F5); evidência em §5.
                                       AT-03: antecipado (nota preventiva F2); evidência em §6.
                                       AT-04: explicitado (RC-F5-38 F5); evidência em §7.
                                       AT-05: lacuna normativa planejada declarada em §8;
                                              aceita por Vasques; não bloqueante.
                                       Zero fact_* criado; zero runtime; zero src/ tocado.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T6.1 CONCLUÍDA; pré-flight de riscos T5 encerrado;
                                       AT-01/03/04 tratadas; AT-05 declarada planejada;
                                       PR-T6.2 desbloqueada.
Próxima PR autorizada:                 PR-T6.2 — Surface única de canal
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | AT-01 corrigido: ponteiro §3.1 F2 `"divorciado"` → F5 (RC-F5-36) | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §3.1 |
| 2 | AT-01 corrigido: ponteiro §3.1 F2 `"viúvo"` → F5 (RC-F5-35) | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §3.1 |
| 3 | AT-03 antecipado: §2.5 adicionado em F2 — nota preventiva separado sem averbação | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §2.5 |
| 4 | AT-03: dois caminhos declarados; sem pergunta fixa; sem fact_* | §2.5; §6 deste artefato |
| 5 | AT-04 explicitado: RC-F5-38 adicionado em F5 §5 — multi-renda/multi-regime | `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` §5 |
| 6 | AT-04: VS-F5-13 + AP-F5-19 adicionados; validação cruzada #23 | `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` §7, §10, §14 |
| 7 | AT-05: lacuna normativa planejada — declarada em §8; nenhuma ação | §8 deste artefato |
| 8 | Zero `fact_*` inventado em qualquer atenção | §11; verificável por diff |
| 9 | Zero `current_phase` criado | §11; verificável por diff |
| 10 | Zero `reply_text` em qualquer correção | §11 |
| 11 | Zero `src/` tocado | §11 |
| 12 | Zero runtime | §11 |
| 13 | Zero template de fala | §11 |
| 14 | Fontes lidas: 21 documentos obrigatórios | §3 |
| 15 | Bloco E completo | este §14 |

### ESTADO HERDADO

```
Fase: T6 aberta; PR-T6.0 (#125) merged 2026-04-28T17:38:31Z.
Contrato T6: ABERTO — schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Atenções herdadas: AT-01/03/04/05 declaradas em T5_READINESS_CLOSEOUT_G5 §6.
AT-01/03/04: designadas para tratamento cirúrgico em PR-T6.1.
AT-05: declarada lacuna normativa planejada.
Próximo passo autorizado: PR-T6.1 — Pré-flight cirúrgico.
```

### ESTADO ENTREGUE

```
T6_PREFLIGHT_RISCOS_T5.md criado: 14 seções; todas as atenções documentadas e tratadas.
AT-01 CORRIGIDO: ponteiro F2 §3.1 "divorciado"/"viúvo" → F5 (RC-F5-36/35).
AT-03 ANTECIPADO: §2.5 nota preventiva em F2 sobre separado sem averbação; dois caminhos;
                  referência cruzada F5 RC-F5-37; sem fact_* novo.
AT-04 EXPLICITADO: RC-F5-38 em F5 §5 — multi-renda/multi-regime por fonte/regime;
                   VS-F5-13; AP-F5-19; validação cruzada #23; 37→38 regras; 22→23 itens.
AT-05 DECLARADA: lacuna normativa planejada; frente futura; sem ação.
Zero src/; zero runtime; zero fact_*; zero current_phase; zero reply_text.
PR-T6.2 desbloqueada.
```
