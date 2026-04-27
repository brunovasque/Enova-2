# T5_FATIA_ELEGIBILIDADE_RESTRICAO — Contrato da Fatia F4: Elegibilidade / Restrição — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.5 |
| Branch | feat/t5-pr5-5-fatia-elegibilidade-restricao |
| Fatia | F4 — Elegibilidade / restrição |
| `current_phase` | `qualification` ou `qualification_special` (transição para `docs_prep` na saída bem-sucedida) |
| Status | entregue |
| Pré-requisito | PR-T5.4 merged; `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` vigente |
| Autoriza | PR-T5.6 — Contrato da fatia documentação / visita / handoff |
| Stages ativos nesta PR | `restricao`, `regularizacao_restricao`, `fim_inelegivel` |
| Stages fora do recorte ativo | `verificar_averbacao`, `verificar_inventario` — documentados em §1.4 como itens opcionais/futuros; não fazem parte do fluxo atual da Enova |
| Legados aplicáveis | L09 (obrigatório — fluxo de restrição Meio A), L10 (obrigatório — inelegibilidade e retorno) |
| Data | 2026-04-26 |

---

## Finalidade

Este documento é o **contrato declarativo da Fatia F4** — a quarta fatia do funil core da
ENOVA 2, correspondente à verificação de elegibilidade e tratamento de sinais de restrição
de crédito declarados pelo lead.

Ele formaliza, sem prescrever fala:

- O objetivo operacional da fatia e os 3 stages ativos cobertos
- As regras comerciais validadas pelo Vasques sobre restrição, regularização e inelegibilidade
- Os fatos mínimos canônicos T2 que a fatia deve coletar e confirmar
- As políticas T3 aplicáveis (sem nenhuma delas produzir `reply_text`)
- As lacunas de schema futuras (sem inventar `fact_*`)
- Os critérios de saída, anti-padrões e cenários sintéticos

**Princípio canônico desta fatia:**

> Restrição declarada pelo lead é um **sinal informativo** — nunca um bloqueio automático.
> A Enova não tem como confirmar, neste momento, se a restrição está ativa, se aparece
> na Caixa, se impede aprovação ou se já baixou. Quem confirma é a análise do
> banco/correspondente após o envio da documentação.
> `fim_inelegivel` significa **inelegível por agora** — nunca descarte definitivo.

---

## §1 Enunciado operacional

### 1.1 Objetivo da F4

Captar o sinal informativo de restrição/dívida declarada pelo lead, entender se há
possibilidade de regularização e determinar se existe algum caminho viável para seguir
para análise. F4 deixa o processo pronto para F5 (documentação / handoff) quando
há caminho viável — ou registra inelegibilidade temporária com orientação de retorno
quando não há.

F4 cobre:
- Sinal de restrição declarado pelo lead (não é certeza; é o que o lead acredita)
- Possibilidade de regularização sem exigir regularização como pré-condição
- Cálculo de `derived_eligibility_probable` a partir de todos os fatos do processo
- Orientação de retorno quando `fim_inelegivel` é atingido
- Registro das lacunas de schema relevantes para análise pós-banco

### 1.2 `current_phase` ativo

`qualification` ou `qualification_special` — herdados de F3; F4 não altera.

Na saída bem-sucedida de F4 (caminho viável confirmado):
→ `current_phase = docs_prep` (primeiro valor da sequência F5)

Na rota de inelegibilidade (`ACAO_INELEGIBILIDADE`):
→ `current_phase` permanece no último valor canônico; `operational.elegibility_status = "ineligible"`
→ **Não existe `current_phase = "encerramento"`** — os 8 valores canônicos de
`T2_LEAD_STATE_V1.md §3.3` são os únicos válidos.

### 1.3 Stages ativos cobertos nesta PR (3)

`restricao`, `regularizacao_restricao`, `fim_inelegivel`

### 1.4 Stages fora do recorte ativo da PR-T5.5

Os stages `verificar_averbacao` e `verificar_inventario` estão no mapa legado de F4
(`T5_MAPA_FATIAS.md §3.1`), mas **não fazem parte do fluxo atual da Enova** e ficam
fora desta PR por instrução explícita Vasques.

**Decisão operacional:**
- `verificar_averbacao` (divorciado): opcional/futuro — LF-mapa-03 declarada no mapa
- `verificar_inventario` (viúvo): opcional/futuro — LF-mapa-04 declarada no mapa
- Nenhuma regra, política T3 ou critério de saída desta PR os referencia como requisito
- Qualquer lógica envolvendo averbação ou inventário deve ser tratada em PR futura separada

### 1.5 Nota sobre a divergência entre o mapa legado e este contrato

`T5_MAPA_FATIAS.md §4.4.5` listava "Bloqueio restrição hard: `fact_credit_restriction = true`
+ regra terminal (T5.5)" como política de F4. Esta entrada do mapa está **supersedida pelas
regras comerciais Vasques (§5 deste documento)**. O contrato de fatia tem precedência sobre
o mapa de fatias para definição das regras operacionais reais.

**Regra canônica vigente:** `fact_credit_restriction != nenhuma` nunca aciona bloqueio
hard por si só. Ver RC-F4-01..08.

---

## §2 Stages cobertos — objetivos e fatos

### 2.1 `restricao`

**Objetivo:** Captar se o lead acredita ter restrição, dívida ou pendência — como sinal
informativo, sem bloqueio automático.

**Fatos envolvidos:** `fact_credit_restriction` (Group VII)

**Valores canônicos de `fact_credit_restriction`:** `nenhuma`, `baixa`, `média`, `alta`

**Situações cobertas por este stage:**
- "meu nome está sujo"
- "tenho uma dívida"
- "acho que tenho restrição"
- "não sei se ainda consta"
- "tenho Serasa"
- "não sei o valor"
- "já negociei"
- "já paguei, mas não sei se baixou"
- "não tenho nenhuma dívida"

**Nota operacional — REGRA CANÔNICA:**
> A Enova não sabe, neste momento, se a restrição:
> — está ativa; — aparece na Caixa; — impede aprovação; — já baixou;
> — é relevante para o banco; — é erro de cadastro; — é dívida que não trava.
> Quem confirma é a análise do banco/correspondente após o envio da documentação.

- Não pausar o processo
- Não tratar como impeditivo automático
- Marcar como sinal informativo em `fact_credit_restriction`
- Se cliente souber origem ou valor: registrar como contexto (LF-01, LF-02)
- Se cliente não souber: seguir mesmo assim
- Explicar que só a análise confirma o impacto real
- Não dizer que a Caixa vai negar sem análise

**Nota sobre lead que "não sabe":**
Se o lead declara não saber se tem restrição, o `fact_credit_restriction` pode ficar
em `captured` com status de incerteza. LF-03 declarada para capturar este sinal de
"não sei se consta" de forma mais precisa no futuro.

### 2.2 `regularizacao_restricao`

**Objetivo:** Entender se existe possibilidade de regularização — sem exigir regularização
como pré-condição para seguir.

**Fatos envolvidos:** `fact_restriction_regularization_status` (Group VII)

**Valores canônicos:** `regularizada`, `em_andamento`, `não_regularizada`

**Nota operacional:**
- Se cliente consegue regularizar: ótimo — registrar `em_andamento` ou `regularizada`
- Se não consegue regularizar agora: segue para análise mesmo assim
- Não prometer aprovação depois de regularizar
- Não exigir baixa antes dos documentos
- Regularizar ajuda, mas não é pré-condição para iniciar análise
- Quem confirma o impacto real é banco/correspondente

**Condição de ativação:** SE `fact_credit_restriction != "nenhuma"` (qualquer nível declarado)

### 2.3 `fim_inelegivel`

**Objetivo:** Registrar inelegibilidade temporária quando não há caminho viável naquele
momento, com orientação clara de retorno.

**Fatos envolvidos:** `derived_eligibility_probable` (derived)

**Ação mecânica:** `ACAO_INELEGIBILIDADE` → `operational.elegibility_status = "ineligible"`

**Condição de ativação:** `derived_eligibility_probable = false` confirmado **e** nenhum
caminho viável identificado:
- sem renda financiável
- sem composição possível
- sem entrada/FGTS/reserva quando necessário
- restrição confirmada posteriormente sem condição de resolver naquele momento
- perfil inviável naquele momento por múltiplas condições

**REGRA CANÔNICA — inelegível por agora, nunca descarte definitivo:**
- Não encerrar de forma seca
- Explicar que o perfil pode mudar
- Deixar caminho de retorno explícito
- Registrar condições para retorno (LF-06):
  - quitar/negociar dívida
  - compor renda
  - formalizar renda (IRPF)
  - juntar entrada/FGTS
  - atualizar documentação
- Registrar prazo/data estimada de reabordagem (LF-08)
- Nunca tratar como descarte definitivo

**Nota sobre `current_phase`:** O LLM conduz o encerramento temporário com dignidade
a partir do objetivo `OBJ_INELEGIVEL`. O mecânico registra via `ACAO_INELEGIBILIDADE`.
O `current_phase` permanece no último valor canônico — não existe `current_phase = "encerramento"`.

---

## §3 Fatos mínimos T2

Todos os `fact_*` abaixo são chaves canônicas de `T2_DICIONARIO_FATOS.md §3`.
Nenhuma chave foi inventada neste documento.

### 3.1 Fatos de saída de F4

| Chave canônica | Grupo T2 | Tipo | Status mínimo saída | Condição |
|---|---|---|---|---|
| `fact_credit_restriction` | Group VII | enum | `confirmed` | Sempre — gate |
| `fact_restriction_regularization_status` | Group VII | enum | `captured` | SE `fact_credit_restriction != "nenhuma"` |
| `derived_eligibility_probable` | derived | calculado | `calculated` | Sempre — determina rota de saída |

### 3.2 Fatos herdados relevantes para cálculo de `derived_eligibility_probable`

| Chave canônica | Origem | Papel em F4 |
|---|---|---|
| `fact_monthly_income_p1` | F3 | Componente de elegibilidade |
| `fact_process_mode` | F2 | Contexto de composição |
| `derived_composition_needed` | F3 | Indicador de necessidade de composição |
| `derived_subsidy_band_hint` | F3 | Faixa estimada de viabilidade |
| `fact_has_fgts` | F3 | Insumo de entrada/reserva |
| `fact_entry_reserve_signal` | F3 | Insumo de entrada/reserva |

---

## §4 Lacunas de schema futuras

| # | LF | Dado ausente | Stage(s) afetados | Impacto operacional |
|---|---|---|---|---|
| 1 | LF-01 | Origem da dívida / credora — quem é o credor | `restricao` | LLM pode coletar conversacionalmente; sem `fact_*` para persistir com semântica precisa |
| 2 | LF-02 | Valor aproximado da dívida declarada | `restricao` | Informativo; sem `fact_*` canônico; LF-07 do mapa global |
| 3 | LF-03 | Sinal de incerteza — "não sei se consta" | `restricao` | `fact_credit_restriction` captura nível declarado; ausência de certeza sobre "se consta" sem `fact_*` específico |
| 4 | LF-04 | Status da restrição após análise bancária/correspondente | `regularizacao_restricao` | `fact_restriction_regularization_status` é o que o cliente declara, não o resultado do banco |
| 5 | LF-05 | Impacto real confirmado da restrição (pós-análise) | `fim_inelegivel` | Sem `fact_*` para registrar resultado da análise de crédito |
| 6 | LF-06 | Condição de retorno futuro (o que o lead precisa fazer para voltar) | `fim_inelegivel` | Orientação de retorno sem persistência formal |
| 7 | LF-07 | Motivo específico de inelegibilidade temporária | `fim_inelegivel` | `derived_eligibility_probable = false` sem detalhe da causa |
| 8 | LF-08 | Data / prazo estimado de reabordagem | `fim_inelegivel` | Sem `fact_*` para registrar quando o lead deve voltar |

**Nota sobre averbação e inventário:**
`verificar_averbacao` e `verificar_inventario` têm lacunas declaradas no mapa global
(`T5_MAPA_FATIAS.md LF-03 e LF-04`). Estas lacunas permanecem vigentes mas estão
fora do recorte ativo desta PR. Nenhuma política T3 desta fatia as referencia.

---

## §5 Regras comerciais validadas pelo Vasques

> **Nota de soberania:** nenhuma das regras abaixo pode produzir `reply_text`, template,
> pergunta fixa ou roteiro. São regras de negócio que informam o mecânico e servem de
> contexto para o LLM raciocinar — nunca de script para o LLM repetir.

### RC-F4-01 — Restrição declarada é sinal informativo

Restrição informada pelo lead **não é bloqueio automático**.

A Enova não sabe neste momento se a restrição:
- está ativa
- aparece na Caixa
- impede aprovação
- já baixou
- é relevante para o banco
- é erro de cadastro
- é uma dívida que não trava

Quem confirma isso é a análise do banco/correspondente após o envio da documentação.

### RC-F4-02 — Stage `restricao`: captar, não bloquear

Objetivo de `restricao`: captar se o lead acredita ter restrição, dívida ou pendência.

Regra:
- não pausar o processo
- não tratar como impeditivo automático
- seguir para coleta de documentação/análise
- marcar como sinal informativo em `fact_credit_restriction`
- se cliente souber: captar valor/origem/status
- se não souber: seguir mesmo assim
- explicar que só a análise confirma o impacto real
- não dizer que a Caixa vai negar sem análise

### RC-F4-03 — Stage `regularizacao_restricao`: recomendar, não obrigar

Objetivo de `regularizacao_restricao`: entender possibilidade de regularização, sem
exigir como pré-condição.

Regra:
- se cliente consegue regularizar: ótimo
- se não consegue regularizar agora: seguir para análise mesmo assim
- não prometer aprovação depois de regularizar
- não exigir baixa antes dos documentos
- orientar que regularizar ajuda, mas não é pré-condição
- análise real vem depois dos documentos

### RC-F4-04 — Cliente com restrição e renda/composição boa

Se cliente informa restrição mas tem renda boa ou composição boa:
- manter lead vivo
- seguir para docs/análise
- tratar restrição como sinal informativo
- orientar regularização se possível
- não travar
- não prometer aprovação

### RC-F4-05 — Restrição desconhecida

Se o cliente não sabe origem, valor ou status da restrição:
- não travar
- não exigir diagnóstico prévio externo
- seguir coleta de informações e documentos
- análise do correspondente/banco define se impacta

### RC-F4-06 — `fim_inelegivel` é temporário, nunca definitivo

`fim_inelegivel` significa inelegível **por agora** — nunca descarte definitivo.

Pode acontecer quando, após avaliação e orientação completa, não há caminho viável
naquele momento. Exemplos de situações que podem chegar a `fim_inelegivel`:
- sem renda financiável de nenhum participante do processo
- sem composição possível
- sem entrada/FGTS/reserva quando necessário
- restrição sem condição de resolver naquele momento + sem renda/composição

Regra:
- não encerrar de forma seca
- explicar que o perfil pode mudar
- deixar caminho de retorno
- registrar condição futura para voltar
- nunca tratar como descarte definitivo

### RC-F4-07 — Fluxo com restrição informada segue para docs

Mesmo com sinal de restrição (`fact_credit_restriction != "nenhuma"`), o fluxo deve
seguir para:
- coleta de documentos (F5)
- envio ao correspondente/banco
- análise real

Porque só depois disso existe certeza se a restrição impacta.

### RC-F4-08 — Averbação e inventário fora do escopo atual

`verificar_averbacao` e `verificar_inventario` não fazem parte do fluxo atual da Enova.
Se aparecerem no mapa legado ou na conversa com o lead, registrar que estão fora do
recorte ativo desta PR e tratar como item opcional/futuro sem criar regra agora.

---

## §6 Políticas T3

> **Regra canônica:** nenhuma política T3 pode produzir `reply_text`. O LLM é soberano
> na fala. Políticas apenas modificam o `lead_state`.

### 6.1 Obrigações (OBR)

| ID | Condição de disparo | Fato obrigatório | Efeito em `lead_state` |
|---|---|---|---|
| OBR-F4-01 | `fact_credit_restriction` ausente | `fact_credit_restriction` | `must_ask_now ← fact_credit_restriction` |
| OBR-F4-02 | `fact_restriction_regularization_status` ausente E `fact_credit_restriction != "nenhuma"` | `fact_restriction_regularization_status` | `must_ask_now ← fact_restriction_regularization_status` |

### 6.2 Confirmações (CONF)

| ID | Condição de disparo | Dureza | Efeito em `lead_state` |
|---|---|---|---|
| CONF-F4-01 | `fact_credit_restriction` em `captured` | `hard` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR` |
| CONF-F4-02 | `fact_restriction_regularization_status` em `captured` | `soft` | `needs_confirmation = true` — confirmar se possível |

### 6.3 Nota sobre bloqueio

**`fact_credit_restriction != "nenhuma"` NUNCA aciona bloqueio hard por si só.**

A entrada do mapa legado "Bloqueio restrição hard" foi supersedida pelas regras comerciais
Vasques (RC-F4-01). Ver §1.5. Não criar `blocked_by ← R_RESTRICAO_HARD` apenas por
`fact_credit_restriction`.

O único caminho terminal de F4 é via `ACAO_INELEGIBILIDADE` (ROT-F4-02) — e somente
quando `derived_eligibility_probable = false` confirmado **e** sem nenhum caminho viável.

**Nota CP-09 (invariante herdada):** `hypothesis` nunca sustenta bloqueio hard.

### 6.4 Sugestões mandatórias (SGM)

| ID | Condição de disparo | Objetivo da sugestão |
|---|---|---|
| SGM-F4-01 | `fact_credit_restriction != "nenhuma"` | Sugerir regularização como caminho positivo (não obrigar); RC-F4-03 |
| SGM-F4-02 | `fact_restriction_regularization_status = "não_regularizada"` | Orientar que segue para análise mesmo assim; não travar |
| SGM-F4-03 | `derived_eligibility_probable = false` E caminho viável detectável | Orientar condições de retorno antes de registrar `fim_inelegivel` |

### 6.5 Roteamentos (ROT)

| ID | Condição de disparo | Efeito |
|---|---|---|
| ROT-F4-01 | F4 completa + `derived_eligibility_probable` indica viabilidade | `current_phase = docs_prep`; avançar para F5 |
| ROT-F4-02 | `derived_eligibility_probable = false` confirmado + sem caminho viável | `ACAO_INELEGIBILIDADE` → `operational.elegibility_status = "ineligible"`; `current_phase` permanece em valor canônico; LLM conduz com `OBJ_INELEGIVEL` |

---

## §7 Vetos suaves (VS)

| ID | Situação | Veto |
|---|---|---|
| VS-F4-01 | Lead informa restrição e o LLM encerra o processo imediatamente | Violação de RC-F4-01 e RC-F4-07; não encerrar; seguir para docs/análise |
| VS-F4-02 | LLM diz que a Caixa vai negar por causa da restrição declarada | Não fazer afirmação sobre resultado bancário sem análise real |
| VS-F4-03 | LLM exige regularização antes de seguir para documentação | Violação de RC-F4-03; regularização não é pré-condição |
| VS-F4-04 | LLM promete aprovação depois de o lead regularizar a restrição | Não prometer aprovação em nenhuma circunstância |
| VS-F4-05 | `fim_inelegivel` tratado como descarte definitivo sem caminho de retorno | Violação de RC-F4-06; sempre deixar caminho de retorno |
| VS-F4-06 | LLM menciona averbação ou inventário como requisito do fluxo atual | Fora do recorte ativo; não criar expectativa de fluxo que não existe agora |

---

## §8 Critérios de saída de F4

F4 está concluída — pronta para F5 (`docs_prep`) — quando todos os itens abaixo estiverem
atendidos e não houver `ACAO_INELEGIBILIDADE` disparada.

| # | Critério | Fato / derivado | Condição mínima |
|---|---|---|---|
| 1 | Restrição verificada | `fact_credit_restriction` | `confirmed` |
| 2 | Regularização verificada (se aplicável) | `fact_restriction_regularization_status` | `captured` — SE restrição declarada |
| 3 | Elegibilidade calculada | `derived_eligibility_probable` | `calculated` |
| 4 | Sem caminho terminal ativo | `operational.elegibility_status` | não `"ineligible"` |
| 5 | Sem obrigações pendentes | `operational.must_ask_now` | vazio |
| 6 | Sem bloqueio ativo | `operational.blocked_by` | vazio |

**Rota alternativa (fim_inelegivel):** F4 também se encerra via `ACAO_INELEGIBILIDADE`
quando `derived_eligibility_probable = false` + sem caminho. Neste caso, o processo
vai para `operational.elegibility_status = "ineligible"` e o LLM conduz o encerramento
temporário com orientação de retorno.

---

## §9 Critérios de não saída de F4

F4 NÃO avança para F5 se qualquer dos bloqueios abaixo persistir:

| Condição de bloqueio | Motivo |
|---|---|
| `fact_credit_restriction` ausente | Gate obrigatório — signal informativo não coletado |
| `derived_eligibility_probable` não calculado | Saída obrigatória de F4 |
| `operational.must_ask_now` contém OBR-F4-01 ou OBR-F4-02 | Obrigações pendentes |

**Nota:** `fact_credit_restriction != "nenhuma"` por si só **não** bloqueia a saída de F4.
O lead com restrição declarada **avança para F5** — a análise real acontece lá.

---

## §10 Anti-padrões proibidos (AP)

| ID | Anti-padrão | Categoria de violação |
|---|---|---|
| AP-F4-01 | Tratar `fact_credit_restriction != "nenhuma"` como bloqueio automático | Viola RC-F4-01 — restrição declarada é sinal informativo |
| AP-F4-02 | Pausar coleta de documentos porque lead tem restrição informada | Viola RC-F4-02 e RC-F4-07 |
| AP-F4-03 | Exigir regularização como pré-condição para seguir | Viola RC-F4-03 |
| AP-F4-04 | Prometer aprovação após regularização de restrição | Viola RC-F4-03 — análise real vem depois |
| AP-F4-05 | Afirmar que a Caixa vai negar sem análise real | Violação de soberania informacional — nenhum fato canônico confirma isso |
| AP-F4-06 | Tratar `fim_inelegivel` como encerramento definitivo | Viola RC-F4-06 — sempre deixar caminho de retorno |
| AP-F4-07 | Incluir averbação ou inventário como requisito do fluxo atual | Fora do recorte ativo; violação do escopo desta PR |
| AP-F4-08 | Criar `reply_text` mecânico em qualquer política T3 desta fatia | Viola soberania LLM (A00-ADENDO-01) |
| AP-F4-09 | Criar `current_phase = "encerramento"` ou qualquer valor fora dos 8 canônicos | `current_phase` não tem valor de encerramento canônico |
| AP-F4-10 | Tratar restrição desconhecida ("não sei se tenho") como restrição confirmada | LF-03 — incerteza não equivale a `fact_credit_restriction = "alta"` |

---

## §11 Classes de risco

| Classe | Condição | Ação do mecânico |
|---|---|---|
| RISCO-F4-01 (médio) | `fact_credit_restriction = "alta"` declarado | SGM-F4-01; manter lead vivo; não bloquear |
| RISCO-F4-02 (médio) | `fact_restriction_regularization_status = "não_regularizada"` | SGM-F4-02; seguir para análise mesmo assim |
| RISCO-F4-03 (alto) | `derived_eligibility_probable = false` com caminho viável ainda possível | SGM-F4-03; orientar antes de disparar `ACAO_INELEGIBILIDADE` |
| RISCO-F4-04 (alto) | `derived_eligibility_probable = false` sem nenhum caminho viável | ROT-F4-02; `ACAO_INELEGIBILIDADE`; RC-F4-06 aplicada |
| RISCO-F4-05 (baixo) | Lead não sabe se tem restrição | LF-03; não travar; `fact_credit_restriction` em incerteza; seguir |
| RISCO-F4-06 (baixo) | Lead menciona dívida paga "mas não sei se baixou" | RC-F4-05; `fact_restriction_regularization_status` captura incerteza; seguir |

---

## §12 Relação com pipeline T4

| Componente T4 | Interação com F4 |
|---|---|
| `TurnoEntrada.operational.current_phase` | `qualification` ou `qualification_special` — herdado de F3 |
| `TurnoEntrada.operational.must_ask_now` | OBR-F4-01..02 preenchidas pelo mecânico antes de entregar ao LLM |
| `TurnoEntrada.operational.elegibility_status` | Reflete estado atual; atualizado via `ACAO_INELEGIBILIDADE` |
| `TurnoEntrada.lead_state.derived.eligibility_probable` | Calculado pelo mecânico a partir de todos os fatos; LLM recebe como insumo |
| `TurnoSaida.extracted_facts` | Alimenta T4.3 para persistência de `fact_credit_restriction`, `fact_restriction_regularization_status` |
| `TurnoSaida.reply_text` | Exclusivamente do LLM — nenhuma política T3 produz texto |
| `TurnoSaida.actions` | `ACAO_INELEGIBILIDADE` quando `derived_eligibility_probable = false` + sem path |
| `TurnoSaida.actions` | `ACAO_AVANÇAR_STAGE` para `docs_prep` quando F4 completa com viabilidade |

---

## §13 Cenários sintéticos (SYN)

> Cenários para validação operacional da cobertura de casos. O LLM decide a fala em cada
> cenário — nenhum cenário prescreve roteiro.

### SYN-F4-01 — "Meu nome está sujo" com renda boa

Lead informa restrição alta; tem CLT com renda de R$4.500 e composição com cônjuge.
- `fact_credit_restriction = "alta"` (captured → confirmed)
- Manter lead vivo — RC-F4-04
- SGM-F4-01: sugerir regularização
- Seguir para docs/análise — RC-F4-07
- Não bloquear; não prometer aprovação

### SYN-F4-02 — "Não sei se tenho restrição"

Lead não tem certeza sobre status de restrição.
- `fact_credit_restriction` em incerteza — LF-03
- VS-F4-01 + RC-F4-05: não travar
- Seguir para docs; correspondente verifica na análise
- AP-F4-10: não tratar como `"alta"` por default

### SYN-F4-03 — "Já paguei, mas não sei se baixou"

Lead diz que pagou a dívida mas não confirmou a baixa.
- `fact_credit_restriction = "baixa"` ou `"média"` (dívida existia)
- `fact_restriction_regularization_status = "regularizada"` (capturado com incerteza)
- RC-F4-05: seguir mesmo com incerteza
- SGM-F4-02: seguir para análise; não exigir comprovante de baixa agora

### SYN-F4-04 — "Estou negociando a dívida"

Lead em processo de negociação.
- `fact_credit_restriction = "média"` ou `"alta"`
- `fact_restriction_regularization_status = "em_andamento"`
- RC-F4-03: não exigir baixa antes dos docs
- SGM-F4-01: ótimo que está regularizando; seguir para análise

### SYN-F4-05 — Sem renda + sem composição + sem entrada

Lead desempregado, sem renda, sem composição viável, sem FGTS/reserva.
- `derived_eligibility_probable = false` — todos os componentes ausentes
- SGM-F4-03 antes de disparar: verificar se há algum caminho
- Se nenhum caminho: ROT-F4-02 → `ACAO_INELEGIBILIDADE`
- RC-F4-06: explicar que pode voltar quando situação mudar; LF-06 + LF-07 + LF-08
- Não encerrar de forma seca

### SYN-F4-06 — Restrição com valor alto + sem composição

Lead com restrição alta, renda limitada, processo solo.
- `fact_credit_restriction = "alta"` confirmado
- `fact_restriction_regularization_status = "não_regularizada"`
- `derived_eligibility_probable` ainda pode ser positivo (depende de todos os fatores)
- SGM-F4-01 + SGM-F4-02 ativas
- Seguir para docs/análise — RC-F4-07
- Não bloquear; análise real confirma impacto

### SYN-F4-07 — Nenhuma restrição declarada

Lead afirma não ter dívida ou restrição.
- `fact_credit_restriction = "nenhuma"` confirmado
- Sem necessidade de OBR-F4-02 (nenhuma restrição → regularização não aplicável)
- `derived_eligibility_probable` calculado com base em renda/composição de F3
- ROT-F4-01 disponível se demais condições OK → `docs_prep`

---

## §14 Validação cruzada T2 / T3 / T4

| # | Artefato referenciado | Ponto de validação | Status |
|---|---|---|---|
| 1 | `T2_DICIONARIO_FATOS.md §3.7` | `fact_credit_restriction` — Group VII — enum | ✅ existe |
| 2 | `T2_DICIONARIO_FATOS.md §3.7` | `fact_restriction_regularization_status` — Group VII — enum | ✅ existe |
| 3 | `T2_DICIONARIO_FATOS.md §3.11` | `derived_eligibility_probable` — derived | ✅ existe |
| 4 | `T2_DICIONARIO_FATOS.md §3.7` | `fact_has_fgts`, `fact_entry_reserve_signal` — Group VII | ✅ existe (insumo para derived) |
| 5 | `T3_CLASSES_POLITICA.md` | 5 classes usadas: OBR, CONF, SGM, ROT, VS — zero reply_text | ✅ conforme |
| 6 | `T4_PIPELINE_LLM.md` | `ACAO_INELEGIBILIDADE` → `elegibility_status = "ineligible"` | ✅ canônico |
| 7 | `T4_PIPELINE_LLM.md` | reply_text exclusivo do LLM; políticas apenas alteram estado | ✅ conforme |
| 8 | `T2_LEAD_STATE_V1.md §3.3` | `current_phase` = docs_prep (ROT-F4-01) — valor canônico | ✅ canônico |
| 9 | `T2_LEAD_STATE_V1.md §3.3` | Sem `current_phase = "encerramento"` — não existe nos 8 canônicos | ✅ correto |
| 10 | `T5_MAPA_FATIAS.md §4.4` | 3 stages ativos: restricao, regularizacao_restricao, fim_inelegivel | ✅ cobertos |
| 11 | `T5_MAPA_FATIAS.md §4.4` | 2 stages fora de escopo: verificar_averbacao, verificar_inventario | ✅ documentados em §1.4 |
| 12 | `T5_MAPA_FATIAS.md §4.4.5` | Entrada "Bloqueio restrição hard" supersedida por RC-F4-01 | ✅ divergência documentada em §1.5 |
| 13 | `ADENDO_CANONICO_SOBERANIA_IA.md` | Zero reply_text mecânico em qualquer política | ✅ auditável |
| 14 | `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | Herança de F3: derived_subsidy_band_hint, derived_composition_needed, renda/composição | ✅ cross-fatia documentada |
| 15 | LF-01..LF-08 | 8 lacunas declaradas; zero `fact_*` novo criado | ✅ sem invenção |

---

## §15 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T5.4 (#118) — merged 2026-04-27T02:04:13Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
Objetivo imutável do contrato: Migração declarativa do funil core por fatias sem if/else de fala; LLM soberano na fala
Recorte a executar nesta PR: F4 — Elegibilidade / restrição (3 stages ativos, PR-T5.5)
Item do A01: T5 — PR-T5.5 — F4 contrato declarativo
Estado atual da frente: contrato aberto (T5 em execução por fatias)
O que a última PR fechou: F3 coberta (renda/regime/composição); PR-T5.4 merged
O que a última PR NÃO fechou: F4, F5; G5; runtime
Por que esta tarefa existe: F3 confirmou renda e composição; F4 verifica elegibilidade e sinais de restrição antes de avançar para docs
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar contrato declarativo completo da F4 com 3 stages ativos, 8 regras Vasques, facts T2, lacunas e políticas T3
Escopo: schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md + live files
Fora de escopo: verificar_averbacao, verificar_inventario, src/, runtime, T1/T2/T3/T4 aprovados, cálculo real
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md (via T5_MAPA_FATIAS.md)
  Legado markdown auxiliar:    T5_MAPA_FATIAS.md §4.4, T2_DICIONARIO_FATOS.md §3.7 e §3.11
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | 3 stages ativos cobertos com objetivo e fatos | §2 deste artefato |
| 2 | 2 stages fora de escopo documentados como opcionais/futuros | §1.4 |
| 3 | Divergência entre mapa e contrato documentada e justificada | §1.5 |
| 4 | 3 fatos T2 de saída (Group VII + derived) mapeados | §3.1 |
| 5 | 6 fatos herdados de F2/F3 relevantes para elegibilidade | §3.2 |
| 6 | 8 lacunas de schema (LF-01..08) declaradas sem criar fact_* | §4 |
| 7 | 8 regras comerciais Vasques documentadas (RC-F4-01..08) | §5 |
| 8 | `fact_credit_restriction != "nenhuma"` nunca bloqueia hard — explícito | RC-F4-01, §6.3 |
| 9 | `fim_inelegivel` = temporário, não definitivo — explícito | RC-F4-06, §2.3 |
| 10 | Regularização recomendada mas não obrigatória — explícito | RC-F4-03, AP-F4-03 |
| 11 | Não prometer aprovação após regularização — explícito | RC-F4-03, VS-F4-04 |
| 12 | Seguir para docs mesmo com restrição declarada — explícito | RC-F4-07, ROT-F4-01 |
| 13 | 2 OBR, 2 CONF, 3 SGM, 2 ROT, 6 VS declarados — zero reply_text | §6, §7 |
| 14 | 6 critérios de saída mensuráveis + rota alternativa fim_inelegivel | §8 |
| 15 | `current_phase = docs_prep` na saída bem-sucedida — valor canônico | ROT-F4-01 |
| 16 | `ACAO_INELEGIBILIDADE` via T4 — sem current_phase novo | ROT-F4-02 |
| 17 | 10 anti-padrões (AP-F4-01..10) | §10 |
| 18 | 7 cenários sintéticos cobrindo casos críticos | §13 |
| 19 | 15 itens de validação cruzada T2/T3/T4 | §14 |
| 20 | Bloco E completo com ESTADO HERDADO + ESTADO ENTREGUE | este §15 |
| 21 | Zero reply_text mecânico — soberania LLM intacta | §6, AP-F4-08 |

### Provas

- **P-T5.5-01:** arquivo `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` criado; `git diff --stat` confirma novo artefato
- **P-T5.5-02:** 3 fatos T2 canônicos (Group VII + derived) verificados em `T2_DICIONARIO_FATOS.md §3.7/3.11`; zero fact_* inventado; 8 lacunas declaradas em §4
- **P-T5.5-03:** zero reply_text em qualquer seção §6 (OBR/CONF/SGM/ROT/VS); soberania LLM auditável no artefato

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T5_FATIA_ELEGIBILIDADE_RESTRICAO.md — contrato declarativo completo da F4
O que foi fechado nesta PR: F4 coberta com 3 stages ativos, 8 regras, 8 lacunas, políticas T3 completas
O que continua pendente: F5, FP, FS; G5; runtime; verificar_averbacao e verificar_inventario (futuros opcionais)
O que ainda não foi fechado do contrato ativo: PR-T5.6..PR-T5.8, PR-T5.R, G5
Recorte executado do contrato: T5 §6 S5 — contrato declarativo F4
Pendência contratual remanescente: F5 (docs/handoff), paridade, shadow, readiness
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado? sim — PR-T5.6 autorizada após merge desta PR
Esta tarefa foi fora de contrato? não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```

### BLOCO E A00-ADENDO-03

**Esta PR está apta a fechar a etapa F4?** ✅ **SIM**

| Critério A00-ADENDO-03 | Status |
|---|---|
| Evidência real de conclusão presente | ✅ 21 evidências documentadas acima |
| Prova parcial não bloqueia — lacunas são gaps intencionais | ✅ 8 lacunas declaradas explicitamente |
| Nenhuma etapa fechada sem evidência | ✅ artefato criado antes do Bloco E |
| Bloco E completo | ✅ ESTADO HERDADO + ESTADO ENTREGUE + provas |
| Soberania LLM intacta | ✅ zero reply_text mecânico auditável |
| Nenhum `fact_*` inventado | ✅ todos os fatos são canônicos T2; 8 lacunas declaradas |
| Divergência com mapa documentada | ✅ §1.5 — RC-F4-01 supersede mapa |
| PR-T5.6 autorizada após merge | ✅ ROT-F4-01 e §Meta declarados |
