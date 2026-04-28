# T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF — Contrato da Fatia F5: Documentação / Dossiê / Correspondente / Visita / Handoff — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T5.6 |
| Branch | feat/t5-pr5-6-fatia-documentacao-visita-handoff |
| Fatia | F5 — Documentação / dossiê / correspondente / visita / handoff |
| `current_phase` | `docs_prep` → `docs_collection` → `broker_handoff` → `awaiting_broker` → `visit_conversion` |
| Status | entregue |
| Pré-requisito | PR-T5.5 merged; `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` vigente |
| Autoriza | PR-T5.7 — Matriz de paridade funcional das fatias |
| Stages cobertos | `envio_docs`, `agendamento_visita`, `aguardando_retorno_correspondente`, `finalizacao`, `finalizacao_processo` |
| Legados aplicáveis | L11 (obrigatório — fluxo documental Meio A), L12 (obrigatório — correspondente e retorno), L13 (obrigatório — visita e agendamento) |
| Data | 2026-04-27 |
| Revisão | PR-T5.6-fix — Correção cirúrgica: documentos civis viúvo(a) / divorciado(a) / separado(a) sem averbação (RC-F5-35..37; LF-32..35) |

---

## Finalidade

Este documento é o **contrato declarativo da Fatia F5** — a quinta e última fatia do funil
core da ENOVA 2, correspondente à coleta documental, montagem de dossiê por perfil, envio
ao correspondente, tratamento do retorno, agendamento de visita e finalização do ciclo.

Ele formaliza, sem prescrever fala:

- O objetivo operacional e a sequência de `current_phase` de F5
- A regra-mãe de condução ativa (não escolha passiva)
- As regras comerciais validadas pelo Vasques para docs, dossiê, correspondente e visita
- Os fatos mínimos canônicos T2 e as lacunas de schema futuras
- As políticas T3 aplicáveis (sem produzir `reply_text`)
- Critérios de saída, anti-padrões e cenários sintéticos

**Princípio canônico desta fatia:**

> A Enova é uma máquina de pegar documentos e transformar lead qualificado em dossiê
> analisável. Ao chegar em F5, a Enova conduz — não pede permissão, não abre cardápio
> de opções antes da persuasão, não deixa o cliente escolher livremente demais.
> O dossiê é montado por perfil, não como conversa crua.
> O LLM decide como conduzir cada caso — sem roteiro fixo, sem pergunta obrigatória de ordem.

---

## §1 Enunciado operacional

### 1.1 Objetivo da F5

Converter o lead qualificado (F1–F4 concluídas) em dossiê analisável pelo correspondente.
F5 cobre:
- Coleta documental ativa e persuasiva por perfil/regime/pessoa
- Montagem de dossiê organizado (não conversa crua)
- Follow-up de documentos pendentes (mínimo 3x antes de convidar para plantão)
- Envio do dossiê por link ao correspondente (como na Enova 1)
- Tratamento do retorno (aprovado / reprovado + orientação por tipo de reprovação)
- Agendamento de visita: toda aprovação vira agendamento; plantão como saída para silêncio
- Confirmações de visita (1 dia antes + 2h antes)
- Notificação ao Vasques com perfil resumido
- Finalização de etapa e de processo com critérios claros

### 1.2 Sequência de `current_phase` em F5

Todos os valores abaixo são canônicos em `T2_LEAD_STATE_V1.md §3.3`:

| Fase | `current_phase` | Condição de ativação |
|---|---|---|
| Preparação | `docs_prep` | Entrada em F5 após F4 positiva |
| Coleta | `docs_collection` | Docs sendo solicitados e parcialmente recebidos |
| Handoff | `broker_handoff` | Dossiê mínimo montado + envio ao correspondente |
| Aguardando | `awaiting_broker` | Dossiê enviado; aguardando retorno |
| Visita | `visit_conversion` | `fact_visit_interest = true` confirmado |

Nenhum valor novo de `current_phase` pode ser criado nesta fatia.

### 1.3 Stages legados cobertos (5)

`envio_docs`, `agendamento_visita`, `aguardando_retorno_correspondente`,
`finalizacao`, `finalizacao_processo`

### 1.4 Regra-mãe de condução

> A Enova NÃO pergunta passivamente "você quer enviar documentos?".
> A Enova conduz para análise. A intenção é: "Agora vamos fazer sua análise com o banco."
> Essa frase não é template — é direção de comportamento.
> O LLM decide a fala a partir desta intenção.

---

## §2 Stages cobertos — objetivos e fatos

### 2.1 `envio_docs`

**Objetivo:** Conduzir o lead à coleta completa dos documentos necessários por perfil,
regime e pessoa — de forma ativa, persuasiva e organizada.

**Fatos envolvidos:**
- `fact_doc_identity_status` (Group IX)
- `fact_doc_income_status` (Group IX)
- `fact_doc_residence_status` (Group IX)
- `fact_doc_ctps_status` (Group IX) — SE CLT ou verificação de CTPS necessária
- `fact_docs_channel_choice` (Group IX)
- `derived_doc_risk` (derived)
- `derived_dossier_profile` (derived) — simples, médio, complexo

**Nota operacional:**
- Iniciar pedindo documentação básica e seguir conforme perfil — não abrir cardápio completo logo
- Usar persuasão leve; conduzir; não deixar cliente escolher livremente demais
- Canais possíveis: WhatsApp, site/link (LF-05), plantão — implicito na condução, não pergunta passiva
- Docs por perfil/regime: ver §5 (regras por regime)
- CTPS completa: quando informou 36 meses, não soube informar, ou validação necessária
- Docs por P2/P3 → LF-02 (sem `fact_doc_*_status_p2/p3`)
- Idade acima de 67 anos de todos os participantes → registrar; LF-21
- Profissão do autônomo → LF-03; curso superior do autônomo → LF-04

**Follow-up obrigatório:**
- Cliente que não enviou nada, enviou parte, travou ou tem medo → 3 follow-ups persuasivos
- Não repetir cobrança fria; não cobrar igual no follow-up 2 e 3
- Se não responder após 3 follow-ups → convidar para simulação/análise no plantão com documentos
- Contagem de follow-ups → LF-08

**Objeção ao WhatsApp:**
- Acolher; reforçar segurança; oferecer plantão; conduzir para próximo passo
- Não pressionar agressivamente

### 2.2 `agendamento_visita`

**Objetivo:** Agendar visita/plantão nas situações que exigem presencial — e transformar
toda aprovação em agendamento obrigatório.

**Fatos envolvidos:**
- `fact_visit_interest` (Group X)
- `fact_current_intent` (Group X)

**Condições de conversão para visita:**
- Cliente prefere presencial
- Cliente tem medo de enviar documentos pelo WhatsApp
- Cliente precisa fazer simulação no plantão
- Cliente está quente e precisa avançar
- Cliente parou de enviar documentos após follow-ups
- Cliente não concluiu documentação
- Cliente aceitou levar documentos presencialmente
- **Lead aprovado: toda aprovação deve virar agendamento** — Enova persuade lead a vir ao plantão, trazendo todos que fazem parte da decisão

**Regra de agendamento:**
- Visita não é "vir conhecer imóvel" antes da aprovação
- Lógica correta: cliente vem ao plantão com documentos; faz simulação/análise presencial; se aprovar, escolhemos imóvel conforme perfil
- Enova oferece 2 opções baseadas em slots disponíveis no Supabase (LF-23)
- Se não houver horário: oferecer sábado
- Enova assume a condução; nunca deixa cliente livre demais

**Confirmações obrigatórias (LF-24, LF-25):**
- 1 dia antes: confirmar com local e horário
- 2h antes: confirmar no dia da visita

**Notificação ao Vasques (LF-26):**
- Nome do cliente
- Perfil resumido
- Horário da visita
- Observações importantes

### 2.3 `aguardando_retorno_correspondente`

**Objetivo:** Registrar estado de espera do retorno do correspondente após envio do dossiê.

**Fatos envolvidos:**
- `fact_current_intent` (Group X)
- LF-07: correspondente responsável (sem `fact_*` canônico — mapa LF-05)
- LF-10: resultado da análise (aprovado/reprovado — sem `fact_*`)

**`current_phase` ativo:** `awaiting_broker`

**Nota operacional:**
- Não inventar status ou resultado antes de receber retorno do correspondente
- Para o cliente: existem 2 grandes resultados — aprovado ou reprovado
- Aprovado condicionado é interno — não expor ao cliente se não for necessário
- Não informar valores de restrição ao cliente
- Não informar valor de parcela possível ao cliente nessa etapa
- Retorno de reprovação: usar motivo informado pelo correspondente; nunca inventar

**Retorno SCR/BACEN/Registrato (LF-13):**
- Se reprovação envolver SCR, BACEN, margem, REFIN/PEFIN: enviar PDF Registrato ao cliente (quando existir — LF-13)
- Pedir extrato Registrato ao cliente (LF-14)
- Encaminhar ao correspondente
- Orientar regularização com base no retorno

**Retorno SPC/Serasa:**
- Orientar negociação pelo app Serasa ou agência física
- Após pagar 1ª parcela: restrição sai em ~5 dias
- Pedir comprovantes; enviar à Enova; dar sequência com correspondente
- Não prometer aprovação

**Retorno Receita Federal:**
- Orientar regularização do CPF junto à Receita
- Pausar nova avaliação até regularização
- Não tratar como simples restrição comercial

### 2.4 `finalizacao`

**Objetivo:** Fechar etapa com próximo passo claro — sem tratar como encerramento definitivo
quando há ação futura pendente.

**Fatos envolvidos:**
- `fact_current_intent` (Group X)
- `derived_doc_risk` (derived)

**Pode ocorrer quando:**
- Documentos recebidos e dossiê enviado
- Visita marcada
- Complemento/pendência solicitada
- Aguardando correspondente

**Regra:**
- Deixar próximo passo explícito
- Não falar demais
- Não tratar como encerramento definitivo se há ação futura
- Se há documento pendente, visita aberta, retorno pendente ou pendência ativa: não finalizar processo

### 2.5 `finalizacao_processo`

**Objetivo:** Registrar o encerramento real do ciclo atual — com critérios claros de quando
usar e quando não usar.

**Fatos envolvidos:**
- `fact_current_intent` (Group X) — `visitar` confirmado ou ciclo encerrado

**`current_phase` ativo:** `visit_conversion` (quando visita) ou permanece no último valor canônico

**REGRA CANÔNICA — quando usar `finalizacao_processo`:**

Só usar quando:
- Ação principal foi concluída
- Ciclo atual realmente terminou
- Não há documento pendente
- Não há visita aberta
- Não há retorno do correspondente pendente
- Não há pendência ativa de nenhum tipo

**REGRA CANÔNICA — quando NÃO reabrir conversa:**

Após fechamento final, estas respostas curtas **não reabrem conversa**:
- "ok", "tá", "blz", "boa noite", "obrigado", confirmação curta, despedida

Só voltar se houver nova intenção real:
- nova dúvida, nova objeção, novo envio de documento, pedido de visita, pedido de status, mudança de decisão

**ANTI-PADRÃO CRÍTICO:** Qualquer resposta curta em etapa anterior **nunca** aciona `finalizacao_processo` automaticamente.

---

## §3 Fatos mínimos T2

Todos os `fact_*` abaixo são chaves canônicas de `T2_DICIONARIO_FATOS.md §3`.

### 3.1 Fatos de saída de F5

| Chave canônica | Grupo T2 | Tipo | Status mínimo saída | Condição |
|---|---|---|---|---|
| `fact_doc_identity_status` | Group IX | enum | `captured` | Sempre |
| `fact_doc_income_status` | Group IX | enum | `captured` | Sempre |
| `fact_doc_residence_status` | Group IX | enum | `captured` | Sempre |
| `fact_doc_ctps_status` | Group IX | enum | `captured` | SE CLT ou CTPS necessária |
| `fact_docs_channel_choice` | Group IX | enum | `captured` | Sempre |
| `fact_visit_interest` | Group X | enum | `captured` | Sempre |
| `fact_current_intent` | Group X | enum | `captured` | Sempre |
| `derived_doc_risk` | derived | calculado | `calculated` | Sempre |
| `derived_dossier_profile` | derived | calculado | `calculated` | Sempre — informa dossiê simples/médio/complexo |

### 3.2 Fatos herdados relevantes para F5

| Chave canônica | Origem | Papel em F5 |
|---|---|---|
| `fact_work_regime_p1` / `_p2` / `_p3` | F3 | Determina docs necessários por regime |
| `fact_monthly_income_p1` / `_p2` / `_p3` | F3 | Insumo do dossiê |
| `fact_autonomo_has_ir_p1` / `_p2` | F3 | Determina docs de autônomo com/sem IRPF |
| `fact_ctps_36m_p1` / `_p2` | F3 | Determina se CTPS completa é necessária |
| `fact_estado_civil` | F2 | Determina necessidade de certidão casamento |
| `fact_process_mode` | F2 | Determina docs de P2/P3 |
| `fact_p3_required` | F2 | Determina docs de familiar |
| `fact_credit_restriction` | F4 | Observação no dossiê; não bloqueia envio |
| `fact_has_fgts` | F3 | Insumo do dossiê |
| `fact_entry_reserve_signal` | F3 | Insumo do dossiê |
| `fact_benefits_signal` | F3 | Observação no dossiê (não financiável) |

---

## §4 Lacunas de schema futuras

| # | LF | Dado ausente | Stage(s) afetados | Impacto operacional |
|---|---|---|---|---|
| 1 | LF-01 | Lista documental por perfil/regime — sem `fact_*` para lista dinâmica por tipo | `envio_docs` | Docs por perfil são regras comerciais (§5); sem persistência canônica da lista dinâmica |
| 2 | LF-02 | `fact_doc_*_status_p2` / `fact_doc_*_status_p3` — docs por P2 e P3 | `envio_docs` | Group IX cobre apenas P1; docs de co-participantes sem `fact_*` canônico |
| 3 | LF-03 | Profissão do autônomo — sem `fact_*` canônico | `envio_docs` | Informativo para dossiê e correspondente; mapa FI lacuna informativa |
| 4 | LF-04 | Curso superior do autônomo — sem `fact_*` canônico | `envio_docs` | Ajuda o correspondente; mapa FI lacuna informativa |
| 5 | LF-05 | Site/link de envio de dossiê — sem schema | `envio_docs` | Envio por link como Enova 1; sem `fact_*` ou URL canônica |
| 6 | LF-06 | Dossiê montado/enviado por link ao correspondente — sem `fact_*` | `envio_docs`, `aguardando_retorno_correspondente` | Sem flag canônica de "dossiê pronto e enviado" |
| 7 | LF-07 | Correspondente responsável atribuído — mapa-LF-05 | `aguardando_retorno_correspondente` | Handoff operacional requer `fact_*` futuro |
| 8 | LF-08 | Contagem de follow-ups de docs — sem `fact_*` | `envio_docs` | Follow-up 1/2/3 e silêncio sem persistência canônica |
| 9 | LF-09 | Silêncio do cliente na fase de docs — sem `fact_*` | `envio_docs` | Sinal de silêncio não tem `signal_*` canônico para docs |
| 10 | LF-10 | Resultado da análise do correspondente (aprovado/reprovado) — sem `fact_*` | `aguardando_retorno_correspondente` | Retorno real sem persistência canônica |
| 11 | LF-11 | Aprovado condicionado (interno) — sem `fact_*` | `aguardando_retorno_correspondente` | Diferenciação interna que não deve ser exposta ao cliente |
| 12 | LF-12 | Motivo específico da reprovação — sem `fact_*` | `aguardando_retorno_correspondente` | Usar motivo do correspondente; sem `fact_*` para persistir tipo |
| 13 | LF-13 | PDF Registrato — sem schema/arquivo canônico | `aguardando_retorno_correspondente` | PDF para orientação SCR/BACEN; sem artefato cadastrado no repo |
| 14 | LF-14 | Extrato Registrato recebido do cliente — sem `fact_*` | `aguardando_retorno_correspondente` | Recebimento de extrato para encaminhar ao correspondente |
| 15 | LF-15 | Comprovante de regularização recebido — sem `fact_*` | `aguardando_retorno_correspondente` | Após SPC/Serasa/Receita: comprovante de que regularizou |
| 16 | LF-16 | Bairro onde o cliente mora — sem `fact_*` | `envio_docs`, dossiê | Mapa FI lacuna informativa; insumo de dossiê e correspondente |
| 17 | LF-17 | Bairro onde o cliente trabalha — sem `fact_*` | `envio_docs`, dossiê | Mapa FI lacuna informativa |
| 18 | LF-18 | Bairro onde pretende comprar — sem `fact_*` | `envio_docs`, dossiê | Sem `fact_*` canônico |
| 19 | LF-19 | Valor de entrada declarado — sem `fact_*` | dossiê | `fact_entry_reserve_signal` captura sinal; valor → mapa LF-07 |
| 20 | LF-20 | FGTS disponível para uso + valor — sem `fact_*` | dossiê | `fact_has_fgts` captura presença; "disponível para uso" + valor → mapa LF-06 |
| 21 | LF-21 | Idade de todos os participantes (P1, P2, P3, cônjuge familiar) — sem `fact_*` | `envio_docs`, dossiê | Risco etário Caixa (>67 anos); sem `fact_age_*` canônico |
| 22 | LF-22 | Visita agendada (confirmado) vs interesse declarado — sem `fact_*` | `agendamento_visita` | `fact_visit_interest` captura interesse; confirmação de agendamento → sem `fact_*` |
| 23 | LF-23 | Slots disponíveis Supabase para agendamento — sem schema | `agendamento_visita` | Oferta de 2 opções baseadas em slots reais |
| 24 | LF-24 | Confirmação de visita 1 dia antes — sem `fact_*` | `agendamento_visita` | Confirmação D-1 sem persistência canônica |
| 25 | LF-25 | Confirmação de visita 2h antes no dia — sem `fact_*` | `agendamento_visita` | Confirmação D0 sem persistência canônica |
| 26 | LF-26 | Notificação ao Vasques (telefone) com perfil + horário — sem schema de integração | `agendamento_visita` | Integração de notificação pessoal sem schema canônico |
| 27 | LF-27 | Finalização real de etapa vs processo — distinção canônica — sem `fact_*` | `finalizacao`, `finalizacao_processo` | Diferenciação entre "etapa fechada" e "processo fechado por agora" |
| 28 | LF-28 | Nova intenção real após encerramento — sem `signal_*` canônico | `finalizacao_processo` | Detecção de nova intenção genuína vs confirmação de cortesia |
| 29 | LF-29 | Parcela mensal pretendida pelo cliente — sem `fact_*` canônico | `envio_docs`, dossiê | Informativo/comercial; insumo de negociação com a construtora; sem `fact_installment_target` canônico |
| 30 | LF-30 | Parcela mensal máxima confortável — sem `fact_*` canônico | `envio_docs`, dossiê | Teto comercial de negociação; define limite do atendimento; sem `fact_installment_max_comfort` canônico |
| 31 | LF-31 | Limite comercial de negociação mensal — sem `fact_*` canônico | dossiê, `agendamento_visita` | Define até onde o atendimento pode chegar; calculado a partir de LF-29/30; sem schema canônico |
| 32 | LF-32 | Certidão de óbito do cônjuge — sem `fact_*` canônico | `envio_docs`, dossiê | Estado civil viúvo(a) exige certidão de óbito; sem chave canônica para esse documento específico |
| 33 | LF-33 | Certidão de casamento com averbação de divórcio — sem `fact_*` canônico | `envio_docs`, dossiê | Divorciado(a) precisa da certidão com averbação; sem chave para distinguir "averbado" de "não averbado" |
| 34 | LF-34 | Estado civil "separado sem averbação" — sem `fact_*` diferenciado | `envio_docs`, dossiê | `fact_estado_civil` (herdado de F2) não distingue separado informal de divorciado formal; lacuna de estado civil fino |
| 35 | LF-35 | Documentação civil de regularização pendente (averbação em andamento) — sem `fact_*` | `envio_docs`, dossiê | Status intermediário entre separado sem averbação e divorciado formal; sem `signal_*` canônico |

---

## §5 Regras comerciais validadas pelo Vasques

> **Nota de soberania:** nenhuma das regras abaixo pode produzir `reply_text`, template,
> pergunta fixa ou roteiro. São regras de negócio para o mecânico e contexto para o LLM.

### RC-F5-01 — Condução ativa para documentos

Ao chegar em `envio_docs`, a Enova deve:
- Conduzir o cliente para análise — não pedir permissão para iniciar
- Iniciar pedindo documentação básica e seguir conforme perfil
- Usar persuasão leve
- Não deixar cliente escolher livremente demais
- Não abrir conversa solta
- Não transformar F5 em cardápio de opções antes da condução

### RC-F5-02 — Canais como condução, não como pergunta passiva

Canais possíveis: WhatsApp, site/link (LF-05), ida ao plantão com documentos.
Isso deve ser implícito na condução — não uma pergunta passiva inicial ao cliente.

Visita/plantão entra principalmente quando:
- cliente tem medo de enviar documentos
- cliente prefere presencial
- cliente para de responder
- cliente envia só parte dos documentos
- cliente está quente e precisa avançar
- cliente aceitou levar documentos presencialmente

Se site/link ainda não existir: declarar LF-05 e não inventar.

### RC-F5-03 — Follow-up obrigatório de documentos (mínimo 3x)

Se cliente não envia, envia parte ou some:
- fazer pelo menos 3 follow-ups persuasivos
- não repetir cobrança fria; variar abordagem nos follow-ups
- reforçar que a análise depende da documentação
- após 3 follow-ups sem resposta: convidar para simulação presencial no plantão com documentos

### RC-F5-04 — Documentação básica para todos os participantes

Para todos os participantes (P1, P2, P3):
- Documento de identificação
- Comprovante de residência
- Comprovante de renda
- CTPS completa quando aplicável
- Atenção à idade acima de 67 anos de todos os participantes (LF-21)

CPF separado: necessário apenas se não constar no documento de identificação.

### RC-F5-05 — CTPS completa

Pedir CTPS completa quando:
- Pessoa informou que possui 36 meses
- Pessoa não soube informar se possui 36 meses
- Validação do histórico for necessária

### RC-F5-06 — CLT

Documentos:
- Documento de identificação; comprovante de residência; holerite; CTPS completa se aplicável

Holerite:
- Sem variação de renda: último holerite basta
- Com variação de renda: 3 últimos holerites
- Holerite com data superior a 3 meses não serve

FGTS: extrato só se for usar; não é necessário para aprovação.

### RC-F5-07 — Servidor público / estatutário

Documentos:
- Documento de identificação; comprovante de residência; folha de pagamento ou contracheque; CTPS completa se aplicável

Não precisa documento funcional como regra base.

### RC-F5-08 — Aposentado

Documentos:
- Documento de identificação; comprovante de residência; extrato da aposentadoria; CTPS completa se aplicável

### RC-F5-09 — Pensionista

Separar obrigatoriamente:
- Pensão por morte: pode entrar como renda — pedir comprovante/extrato
- Pensão alimentícia: não entra como renda financiável
Não tratar toda pensão como renda válida.

### RC-F5-10 — Autônomo com IRPF

Documentos:
- Documento de identificação; comprovante de residência; declaração de IRPF do último ano; recibo de entrega do IRPF; CTPS completa se aplicável

Registrar no dossiê:
- Profissão do autônomo (LF-03)
- Se possui curso superior (LF-04)

### RC-F5-11 — Autônomo sem IRPF

Documentos:
- Documento de identificação; comprovante de residência; 3 últimos extratos de movimentação bancária; CTPS completa se aplicável
- Profissão (LF-03); curso superior (LF-04)

Regra:
- Autônomo sem IRPF sozinho: sem caminho normal de aprovação; dossiê marca limitação
- Autônomo sem IRPF em conjunto: pode seguir com limitação; dossiê marca limitação
- Extratos apoiam análise mas não substituem IRPF como formalização plena
- Buscar composição, entrada ou FGTS

### RC-F5-12 — MEI

Tratar como autônomo para fins de renda e documentação.

Se MEI com IRPF (pessoa física):
- Declaração IRPF; recibo de entrega; documentos pessoais; comprovante de residência; CTPS se aplicável

Se MEI sem IRPF:
- 3 últimos extratos de movimentação bancária; documentos pessoais; comprovante de residência; CTPS se aplicável; marcar limitação

CNPJ isolado não é renda válida para MCMV.

### RC-F5-13 — Empresário

Documentos:
- Documento de identificação; comprovante de residência; IRPF; pró-labore se existir (LF-F3-06); CTPS se aplicável

CNPJ contextualiza; MCMV analisa pessoa física.

### RC-F5-14 — Informal / bico

Se somente informal/bico: tratar como autônomo sem IRPF (RC-F5-11).

Se CLT com renda formal baixa + renda por fora:
- Manter renda CLT separada; holerite conforme RC-F5-06
- 3 últimos extratos de movimentação bancária da renda por fora
- Dossiê marca que renda por fora não é renda formalizada

### RC-F5-15 — Benefícios e rendas não financiáveis

Não entram como renda válida no dossiê:
- Bolsa Família; BPC; benefício assistencial; seguro-desemprego; trabalho temporário; pensão alimentícia

Podem aparecer como contexto/observação.
Se for única fonte: buscar composição.

### RC-F5-16 — Casado civil / P2

Obrigatório:
- Certidão de casamento; documento de identificação do cônjuge
- Comprovante de renda do cônjuge se tiver renda
- CTPS completa do cônjuge se aplicável

Se só um cônjuge tiver renda: não bloquear.

### RC-F5-17 — Familiar / P3

Documentos básicos + comprovante de renda conforme regime + CTPS se aplicável.

Atenção:
- Idade acima de 67 anos (LF-21)
- Se familiar for casado civil: considerar cônjuge obrigatório (herdado de F2)
- Documentos do cônjuge do familiar quando aplicável

### RC-F5-18 — Atenção à idade (todos os participantes)

Registrar/considerar idade acima de 67 anos de: P1, P2, P3, cônjuge de familiar.
Risco relevante para Caixa — não é bloqueio automático sem análise, mas deve constar no dossiê.
Sem `fact_age_*` canônico → LF-21.

### RC-F5-19 — Montagem de dossiê por perfil

O dossiê deve ser organizado — não conversa crua. Deve conter:
- Dados do pré-cadastro
- P1, P2 (se houver), P3 (se houver)
- Idade de todos os participantes (LF-21)
- Bairro onde mora (LF-16), onde trabalha (LF-17), onde pretende comprar (LF-18)
- Regime e renda válida de cada pessoa
- Renda não financiável como observação
- Profissão do autônomo (LF-03); curso superior do autônomo (LF-04)
- Documentos recebidos e documentos pendentes
- Composição do processo
- Restrição informada (observação — não bloqueia envio)
- Se possui entrada + valor (LF-19)
- Se possui FGTS + valor aproximado (LF-20); se não soube: informativo
- Parcela mensal pretendida/máxima confortável (LF-29/LF-30) — informativo/comercial; não é simulação, não é aprovação, não é promessa de parcela final; não substitui análise do banco/correspondente; captar com naturalidade no mesmo bloco de informações comerciais (entrada/FGTS/bairros), sem transformar em pergunta mecânica fixa
- Observações comerciais relevantes

`derived_dossier_profile` (simples/médio/complexo) informa a complexidade do dossiê.

### RC-F5-20 — Dossiê mínimo para envio ao correspondente

Para enviar, precisa no mínimo:
- Documentos pessoais básicos do P1
- Comprovante de residência do P1
- Comprovante de renda principal obrigatório
- Composição identificada (P2/P3 se houver) + docs básicos
- Observações sobre restrição/renda informal/benefício
- Entrada/FGTS (se houver ou se cliente não souber)
- Bairros: mora, trabalha, pretende comprar (LF-16/17/18)
- Canal de retorno
- Parcela mensal pretendida/máxima confortável (LF-29/30) **quando informada pelo cliente** — registrar como observação comercial; não é requisito bloqueante

Restrição informada não bloqueia envio.

### RC-F5-21 — Envio por link ao correspondente

Como na Enova 1: enviar dossiê organizado por link (LF-05, LF-06).

Regra:
- Não enviar conversa crua
- Não inventar status
- Não segurar análise por restrição informada
- Se faltar item essencial: pedir complemento
- Se faltar item não impeditivo: enviar com observação
- Não expor dados de forma desorganizada

### RC-F5-22 — Retorno do correspondente

Para o cliente, existem 2 grandes resultados: **aprovado** ou **reprovado**.

Aprovado condicionado é interno (LF-11). Para o cliente: tratar como aprovado.
Não expor "condicionado" ao cliente se não for necessário.

### RC-F5-23 — Retornos reais de reprovação

Motivos reais observados: restrição externa; margem insuficiente; compromissos financeiros na Caixa/outros bancos; dívidas vencidas no SCR; dívidas baixadas como prejuízo no SCR; pendência com Receita Federal; REFIN/PEFIN; SPC/Serasa; necessidade de regularização.

Regra:
- Enova usa o motivo informado pelo correspondente; nunca inventa motivo
- Nunca informa valores de restrição ao cliente
- Nunca informa valor de parcela possível ao cliente nessa etapa
- Nunca maquia reprovação

### RC-F5-24 — SCR / BACEN / Registrato

Se reprovação envolve SCR, BACEN, margem, REFIN/PEFIN com risco de constar no BACEN:
- Enviar PDF Registrato ao cliente quando esse arquivo existir (LF-13)
- Pedir extrato Registrato ao cliente (LF-14)
- Encaminhar extrato ao correspondente
- Orientar regularização com base no retorno

### RC-F5-25 — SPC / Serasa

Orientar:
- Negociar pelo app Serasa ou agência física
- Após pagar 1ª parcela: restrição sai em ~5 dias
- Guardar e enviar comprovantes à Enova (LF-15)
- Dar sequência com o correspondente depois

Não prometer aprovação.

### RC-F5-26 — Pendência Receita Federal

Se retorno indicar pendência com Receita Federal:
- Orientar regularização do CPF junto à Receita
- Pausar nova avaliação até regularização
- Não tratar como simples restrição comercial

### RC-F5-27 — Agendamento de visita (lógica correta)

Visita não é "vir conhecer imóvel" antes da aprovação.

Lógica: cliente vem ao plantão com documentos → faz simulação/análise presencial → se aprovar → escolhemos imóvel conforme perfil.

**Toda aprovação deve virar agendamento.** Enova persuade lead a vir ao plantão, trazendo todos que fazem parte da decisão (sim e não).

Oferecer 2 opções baseadas em slots Supabase (LF-23). Se não der: oferecer sábado.

### RC-F5-28 — Confirmações de visita

Obrigatórias (LF-24, LF-25):
- 1 dia antes: confirmar com local e horário
- No dia: pelo menos 2h antes

Vasques notificado (LF-26) com: nome do cliente, perfil resumido, horário, observações.

### RC-F5-29 — Objeção ao envio de documentos

Se cliente disser: "tenho medo", "por WhatsApp é complicado", "não gosto de mandar documento", "prefiro pessoalmente":
- Acolher
- Reforçar segurança
- Oferecer plantão com documentos
- Não pressionar agressivamente
- Conduzir para próximo passo objetivo

### RC-F5-30 — Silêncio durante documentação

- 3 follow-ups persuasivos (não repetir cobrança fria)
- Após 3 sem resposta: convidar para simulação presencial no plantão com documentos

### RC-F5-31 — `finalizacao` fecha etapa, não processo

`finalizacao` pode ocorrer quando: docs recebidos; dossiê enviado; visita marcada; pendência solicitada; aguardando correspondente.

Regra: deixar próximo passo claro; não falar demais; não tratar como encerramento definitivo se há ação futura.

### RC-F5-32 — `finalizacao_processo`: critério rigoroso

Só usar quando: ação principal concluída; ciclo atual realmente terminou; sem documento pendente; sem visita aberta; sem retorno pendente; sem pendência ativa.

Resposta curta em etapa anterior (ok, tá, blz, boa noite) **nunca** aciona `finalizacao_processo` automaticamente.

### RC-F5-33 — Nova intenção real após encerramento

Após `finalizacao_processo`, só voltar a responder se houver nova intenção real (LF-28):
- Nova dúvida; nova objeção; novo envio; pedido de visita; pedido de status; mudança de decisão

Confirmações de cortesia e despedidas não reabrem conversa.

### RC-F5-34 — Parcela mensal confortável: informação comercial do dossiê

Registrar no dossiê até qual valor de parcela mensal o cliente está disposto/consegue/pretende pagar.

Regras:
- Dado informativo/comercial — não é simulação, não é aprovação, não é promessa de parcela final
- Não substitui análise do banco/correspondente
- Ajuda na negociação com a construtora e define até onde o atendimento comercial pode chegar (LF-31)
- Captar com naturalidade no mesmo bloco de informações comerciais complementares do dossiê (entrada/FGTS/bairros), junto dos demais dados informativos — sem transformar em pergunta mecânica fixa
- Se cliente informar: registrar como observação comercial no dossiê (LF-29/30)
- Se cliente não informar: não bloquear avanço; campo informativo, não requisito
- Não expor ao cliente como parcela calculada ou prometida pelo banco/Caixa

### RC-F5-35 — Viúvo(a)

Se o cliente for viúvo(a), incluir no dossiê:
- Documento de identificação
- Comprovante de residência
- Comprovante de renda conforme perfil/regime (ver RC-F5-06..14)
- **Certidão de óbito do cônjuge** — necessária para comprovar estado civil e identificar a composição correta do processo

Regra:
- Certidão de óbito = documento civil obrigatório para viúvo(a) no financiamento
- NÃO incluir inventário nesta fatia (inventário fora do recorte ativo, conforme §1.4 de F4)
- Sem `fact_*` canônico para certidão de óbito → LF-32

### RC-F5-36 — Divorciado(a)

Se o cliente for divorciado(a), incluir no dossiê:
- Documento de identificação
- Comprovante de residência
- Comprovante de renda conforme perfil/regime (ver RC-F5-06..14)
- **Certidão de casamento com averbação de divórcio**, quando aplicável

Regra:
- Divórcio precisa estar formalizado/documentado para o financiamento reconhecer esse estado civil
- Se cliente não souber se possui averbação: verificar status — pode ser "separado sem averbação" → aplicar RC-F5-37
- Sem `fact_*` canônico para certidão de casamento com averbação → LF-33

### RC-F5-37 — Separado(a) sem averbação de divórcio

Se o cliente disser que é separado(a) mas ainda não possui averbação de divórcio:

- Para o financiamento, a pessoa **ainda está legalmente casada** — averbação pendente = casamento vigente perante o banco
- O processo tende a exigir financiamento em conjunto com o cônjuge

**Dois caminhos disponíveis:**
1. **Regularizar a documentação civil primeiro** — fazer a averbação de divórcio; processo fica aguardando; retomar após formalização (LF-35)
2. **Seguir em conjunto com o cônjuge** — já que legalmente ainda são casados; RC-F5-16 se aplica

Regra:
- NÃO tratar separado sem averbação como divorciado formal
- NÃO bloquear de forma seca — apresentar os dois caminhos sem travar o lead
- NÃO reabrir regra de união estável
- NÃO reabrir regra de P3/familiar casado civil
- Sem `fact_*` canônico para distinguir "separado informal" de "divorciado formal" → LF-34
- Status de regularização da averbação → LF-35

---

## §6 Políticas T3

> **Regra canônica:** nenhuma política T3 pode produzir `reply_text`.

### 6.1 Obrigações (OBR)

| ID | Condição de disparo | Fato obrigatório | Efeito em `lead_state` |
|---|---|---|---|
| OBR-F5-01 | `fact_doc_identity_status` ausente ou `faltando` | `fact_doc_identity_status` | `must_ask_now ← fact_doc_identity_status` |
| OBR-F5-02 | `fact_doc_income_status` ausente ou `faltando` | `fact_doc_income_status` | `must_ask_now ← fact_doc_income_status` |
| OBR-F5-03 | `fact_doc_residence_status` ausente ou `faltando` | `fact_doc_residence_status` | `must_ask_now ← fact_doc_residence_status` |
| OBR-F5-04 | CLT ou CTPS necessária E `fact_doc_ctps_status` ausente | `fact_doc_ctps_status` | `must_ask_now ← fact_doc_ctps_status` |
| OBR-F5-05 | `fact_docs_channel_choice` ausente | `fact_docs_channel_choice` | `must_ask_now ← fact_docs_channel_choice` |
| OBR-F5-06 | `fact_visit_interest` ausente E `current_phase` atingiu `visit_conversion` condição | `fact_visit_interest` | `must_ask_now ← fact_visit_interest` |

### 6.2 Confirmações (CONF)

| ID | Condição de disparo | Dureza | Efeito em `lead_state` |
|---|---|---|---|
| CONF-F5-01 | `fact_visit_interest` em `captured` | `hard` | `needs_confirmation = true`; `current_objective = OBJ_CONFIRMAR` |
| CONF-F5-02 | `fact_docs_channel_choice` em `captured` | `soft` | Confirmar canal escolhido |

### 6.3 Sugestões mandatórias (SGM)

| ID | Condição de disparo | Objetivo da sugestão |
|---|---|---|
| SGM-F5-01 | `derived_doc_risk` alto | Orientar LLM sobre quais docs faltam por perfil |
| SGM-F5-02 | Docs parciais + follow-ups sem resposta (LF-08) | Follow-up persuasivo; convidar para plantão após 3x |
| SGM-F5-03 | Objeção ao WhatsApp detectada | Oferecer plantão com documentos |
| SGM-F5-04 | `fact_visit_interest` captured E agendamento pendente (LF-22) | Confirmar agendamento; oferecer 2 opções de slots |
| SGM-F5-05 | Resultado aprovado recebido (LF-10) | Toda aprovação vira agendamento — persuadir lead e decisores |
| SGM-F5-06 | `derived_dossier_profile = complexo` | Orientar coleta cuidadosa; dossiê marcado como complexo |

### 6.4 Roteamentos (ROT)

| ID | Condição de disparo | Efeito |
|---|---|---|
| ROT-F5-01 | Entrada em F5 após F4 positiva | `current_phase = docs_prep` |
| ROT-F5-02 | Docs sendo coletados (ao menos 1 doc iniciado) | `current_phase = docs_collection` |
| ROT-F5-03 | Dossiê mínimo (RC-F5-20) montado + envio realizado (LF-06) | `current_phase = broker_handoff` |
| ROT-F5-04 | Handoff feito; aguardando retorno do correspondente | `current_phase = awaiting_broker` |
| ROT-F5-05 | `fact_visit_interest = true` confirmado | `current_phase = visit_conversion` |

---

## §7 Vetos suaves (VS)

| ID | Situação | Veto |
|---|---|---|
| VS-F5-01 | Pergunta passiva: "você quer enviar documentos?" como abertura de F5 | Viola RC-F5-01; Enova conduz, não pede permissão |
| VS-F5-02 | Abrir cardápio de 3 canais como primeira pergunta antes da condução | Viola RC-F5-02; canais são condução, não pergunta passiva |
| VS-F5-03 | Enviar lista universal completa de docs sem considerar perfil | Viola RC-F5-19 e regras por regime; dossiê é por perfil |
| VS-F5-04 | Informar valor de parcela possível ao cliente durante F5 | Viola RC-F5-23 |
| VS-F5-05 | Informar valores de restrição ao cliente | Viola RC-F5-23 |
| VS-F5-06 | Expor "aprovado condicionado" ao cliente como condicionado | Viola RC-F5-22 |
| VS-F5-07 | Posicionar visita como "vir conhecer imóvel" antes da aprovação | Viola RC-F5-27 |
| VS-F5-08 | Resposta curta ("ok", "tá") acionar `finalizacao_processo` automaticamente | Viola RC-F5-32; anti-padrão crítico |
| VS-F5-09 | Inventar motivo de reprovação sem retorno real do correspondente | Viola RC-F5-23 |
| VS-F5-10 | Tratar benefício assistencial (BF, BPC) como renda no dossiê | Viola RC-F5-15 |
| VS-F5-11 | Tratar separado(a) sem averbação como divorciado(a) formal | Viola RC-F5-37; sem averbação = legalmente casado(a) para o financiamento |
| VS-F5-12 | Bloquear de forma seca cliente separado(a) sem averbação sem apresentar os dois caminhos | Viola RC-F5-37; Enova apresenta caminhos, não bloqueia secamente |

---

## §8 Critérios de saída de F5 (funil core concluído)

F5 está concluída quando o ciclo ativo foi encerrado com resultado definido:

| # | Critério | Fato / derivado | Condição |
|---|---|---|---|
| 1 | Docs básicos P1 coletados | `fact_doc_identity_status`, `fact_doc_income_status`, `fact_doc_residence_status` | `captured` / `confirmed` |
| 2 | Canal de envio definido | `fact_docs_channel_choice` | `captured` |
| 3 | Dossiê montado e enviado | LF-06 | Declarada; evidência operacional |
| 4 | Interesse de visita registrado | `fact_visit_interest` | `captured` / `confirmed` |
| 5 | Risco documental calculado | `derived_doc_risk` | `calculated` |
| 6 | Perfil dossiê calculado | `derived_dossier_profile` | `calculated` |
| 7 | Próximo passo explícito | `fact_current_intent` | `captured` — o que acontece depois está definido |
| 8 | Sem OBR de doc crítico pendente | `operational.must_ask_now` | vazio ou somente não-críticos |

**Rota de resultado:**
- Aprovado → SGM-F5-05 + ROT-F5-05 → agendamento de visita
- Reprovado com caminho → orientação por tipo (RC-F5-24/25/26)
- Reprovado sem caminho → orientação de retorno futuro (herdado de F4 RC-F4-06)

---

## §9 Critérios de não saída de F5

F5 ainda não está concluída se:

| Condição de bloqueio | Motivo |
|---|---|
| `fact_doc_identity_status` ausente ou `faltando` | Gate crítico — doc de identidade obrigatório |
| `fact_doc_income_status` ausente ou `faltando` | Gate crítico — renda obrigatória |
| `fact_doc_residence_status` ausente | Gate crítico — residência obrigatória |
| `derived_doc_risk = crítico` confirmado sem resolução | Risco documental bloqueante não resolvido |
| `fact_current_intent` ausente | Intenção atual indefinida |

**Nota:** Restrição informada (`fact_credit_restriction != "nenhuma"`) **não** bloqueia saída de F5. Dossiê vai com observação.

---

## §10 Anti-padrões proibidos (AP)

| ID | Anti-padrão | Categoria de violação |
|---|---|---|
| AP-F5-01 | Pedir permissão para iniciar coleta de documentos | Viola RC-F5-01 |
| AP-F5-02 | Abrir F5 com cardápio passivo de 3 canais de envio | Viola RC-F5-02 |
| AP-F5-03 | Usar lista universal de docs sem considerar perfil/regime | Viola RC-F5-04 e regras por regime |
| AP-F5-04 | Repetir lista completa de docs quando falta apenas 1 item | Viola princípio de condução focada |
| AP-F5-05 | Copiar fala da Enova 1 como template fixo | Viola soberania LLM (A00-ADENDO-01) |
| AP-F5-06 | Inventar retorno do correspondente sem resposta real | Viola RC-F5-23 |
| AP-F5-07 | Informar valor de parcela ou restrição ao cliente | Viola RC-F5-23 |
| AP-F5-08 | Expor aprovação condicionada como condicionada ao cliente | Viola RC-F5-22 |
| AP-F5-09 | Posicionar visita como "vir conhecer imóvel" antes da aprovação | Viola RC-F5-27 |
| AP-F5-10 | Acionar `finalizacao_processo` por resposta curta em etapa anterior | Viola RC-F5-32 — anti-padrão crítico |
| AP-F5-11 | Tratar Bolsa Família ou BPC como renda no dossiê | Viola RC-F5-15 |
| AP-F5-12 | Tratar pensão alimentícia como renda válida no dossiê | Viola RC-F5-09 |
| AP-F5-13 | Criar `reply_text` mecânico em qualquer política T3 | Viola soberania LLM (A00-ADENDO-01) |
| AP-F5-14 | Criar novo `current_phase` fora dos 8 canônicos | `current_phase` canônico imutável |
| AP-F5-15 | Criar novo `fact_*` fora dos 35 canônicos T2 | Zero invenção de schema; declarar lacuna |
| AP-F5-16 | Omitir certidão de óbito do cônjuge no dossiê de viúvo(a) | Viola RC-F5-35; certidão de óbito é documento civil obrigatório para viúvo(a) |
| AP-F5-17 | Tratar separado(a) sem averbação como divorciado(a) formal no dossiê | Viola RC-F5-37; sem averbação = casado(a) civilmente para o financiamento |
| AP-F5-18 | Bloquear lead separado(a) sem averbação sem apresentar os dois caminhos possíveis | Viola RC-F5-37; Enova não bloqueia secamente — apresenta caminhos concretos |

---

## §11 Classes de risco

| Classe | Condição | Ação do mecânico |
|---|---|---|
| RISCO-F5-01 (alto) | `derived_doc_risk = crítico` + doc essencial faltando | OBR-F5-01..04; SGM-F5-01 |
| RISCO-F5-02 (alto) | Silêncio documentado + 3 follow-ups sem resposta (LF-08) | SGM-F5-02: convidar plantão |
| RISCO-F5-03 (alto) | Reprovação + motivo SCR/BACEN | RC-F5-24: Registrato flow (LF-13/14) |
| RISCO-F5-04 (alto) | Reprovação + SPC/Serasa | RC-F5-25: orientação Serasa |
| RISCO-F5-05 (alto) | Reprovação + Receita Federal | RC-F5-26: pausar avaliação |
| RISCO-F5-06 (médio) | `derived_dossier_profile = complexo` | SGM-F5-06; coleta cuidadosa |
| RISCO-F5-07 (médio) | Objeção ao WhatsApp detectada | SGM-F5-03: oferecer plantão |
| RISCO-F5-08 (médio) | Participante com idade > 67 anos (LF-21) | Registrar no dossiê; alerta |
| RISCO-F5-09 (médio) | Autônomo sem IRPF no dossiê (P1 ou P2) | Marcar limitação; RC-F5-11 |
| RISCO-F5-10 (baixo) | Resposta curta em etapa anterior | VS-F5-08; não acionar finalizacao_processo |

---

## §12 Relação com pipeline T4

| Componente T4 | Interação com F5 |
|---|---|
| `TurnoEntrada.operational.current_phase` | Sequência: docs_prep → docs_collection → broker_handoff → awaiting_broker → visit_conversion |
| `TurnoEntrada.operational.must_ask_now` | OBR-F5-01..06 preenchidas pelo mecânico; LLM recebe como insumo |
| `TurnoEntrada.lead_state.derived.doc_risk` | Calculado; LLM recebe nível de risco documental |
| `TurnoEntrada.lead_state.derived.dossier_profile` | Informa complexidade do dossiê (simples/médio/complexo) |
| `TurnoSaida.extracted_facts` | Alimenta T4.3 para persistência de fact_doc_*_status, fact_docs_channel_choice, fact_visit_interest |
| `TurnoSaida.actions` | `ACAO_AVANÇAR_STAGE` para cada transição de current_phase |
| `TurnoSaida.reply_text` | Exclusivamente do LLM — nenhuma política T3 produz texto |
| `TurnoSaida.recommended_next_actions` | Orientação sobre docs faltantes, follow-up, agendamento — nunca substitui fala do LLM |

---

## §13 Cenários sintéticos (SYN)

### SYN-F5-01 — CLT com variação de renda

Lead CLT com holerite variável.
- `fact_work_regime_p1 = CLT`; `fact_ctps_36m_p1 = true`
- Docs: 3 últimos holerites (variação); comprovante de residência; doc de identidade; CTPS completa
- RC-F5-06: holerites dos últimos 3 meses; não aceitar holerite > 3 meses
- `derived_dossier_profile = simples` (processo solo, CLT)

### SYN-F5-02 — Autônomo com IRPF + cônjuge CLT

Casal; P1 autônomo com IRPF; P2 cônjuge CLT.
- P1: declaração IRPF + recibo de entrega + docs pessoais + profissão + curso superior
- P2: holerite + docs pessoais + CTPS se aplicável
- Certidão de casamento obrigatória (casado civil herdado de F2)
- `derived_dossier_profile = médio`
- RC-F5-10 + RC-F5-16

### SYN-F5-03 — Silêncio após pedido de docs

Lead recebeu lista de docs; não enviou nada; parou de responder.
- Follow-up 1: persuasão sobre análise
- Follow-up 2: variação; reforço
- Follow-up 3: variação; última tentativa antes do plantão
- Após 3 sem resposta: SGM-F5-02 → convidar para simulação no plantão com documentos
- LF-08: contagem de follow-ups

### SYN-F5-04 — Objeção ao WhatsApp

Lead diz: "tenho medo de mandar documento pelo celular".
- VS-F5-02: não pressionar
- SGM-F5-03: acolher + oferecer plantão com documentos
- Conduzir para agendamento (ROT-F5-05)

### SYN-F5-05 — Aprovado: toda aprovação vira agendamento

Lead recebeu aprovação do correspondente.
- RC-F5-22: aprovado (condicionado interno se for o caso; não expor ao cliente)
- SGM-F5-05: persuadir lead e decisores a vir ao plantão
- ROT-F5-05: `current_phase = visit_conversion`
- Oferecer 2 opções de slots (LF-23); se não houver: oferecer sábado
- Confirmações D-1 (LF-24) + D0 2h antes (LF-25)
- Notificar Vasques (LF-26)

### SYN-F5-06 — Reprovação por SPC/Serasa

Lead reprovado por SPC/Serasa.
- RC-F5-25: orientar negociação pelo app Serasa ou agência
- Após pagar 1ª parcela: ~5 dias para sair do sistema
- Pedir comprovante (LF-15); enviar à Enova; dar sequência
- Não prometer aprovação

### SYN-F5-07 — Reprovação por SCR / BACEN

Lead reprovado por dívida no SCR / comprometimento BACEN.
- RC-F5-24: enviar PDF Registrato (LF-13 se existir)
- Pedir extrato Registrato ao cliente (LF-14)
- Encaminhar ao correspondente
- Orientar com base no retorno real

### SYN-F5-08 — P3 com dossiê complexo (avô 70 anos autônomo sem IRPF)

Lead + cônjuge + avô P3 (70 anos, autônomo sem IRPF).
- P1 + P2: docs padrão por regime
- P3: docs autônomo sem IRPF (3 extratos); profissão; curso superior
- Idade do avô (70 anos) registrada no dossiê; alerta de risco etário Caixa (LF-21)
- `derived_dossier_profile = complexo`
- RC-F5-11 + RC-F5-17 + RC-F5-18
- Dossiê marca limitação de P3 autônomo sem IRPF

### SYN-F5-09 — Finalização prematura evitada

Lead responde "ok" após envio de parte dos documentos.
- AP-F5-10: não acionar `finalizacao_processo`
- VS-F5-08: resposta curta não é encerramento
- Verificar: docs pendentes? visita aberta? retorno pendente?
- Se sim: `finalizacao` de etapa com próximo passo; não `finalizacao_processo`

### SYN-F5-10 — Dossiê mínimo com restrição informada

Lead com restrição declarada + renda boa + docs básicos enviados.
- RC-F5-20: restrição informada não bloqueia envio
- Dossiê montado com observação sobre restrição
- ROT-F5-03: envio ao correspondente
- ROT-F5-04: `awaiting_broker`
- Não inventar resultado antes do retorno do correspondente

### SYN-F5-11 — Viúvo(a): certidão de óbito obrigatória

Lead viúvo(a) em F5 para envio de documentos.
- Estado civil: viúvo(a) (herdado `fact_estado_civil` de F2)
- RC-F5-35: incluir certidão de óbito do cônjuge no dossiê além dos docs padrão
- Inventário: fora do recorte ativo desta fatia — não incluir, não mencionar como requisito
- LF-32: sem `fact_*` canônico para certidão de óbito; registrar como observação documental
- Docs completos: doc de identidade + comprovante de residência + comprovante de renda por regime + certidão de óbito do cônjuge

### SYN-F5-12 — Divorciado(a): certidão de casamento com averbação

Lead divorciado(a) formal em F5.
- Estado civil: divorciado(a) (herdado `fact_estado_civil` de F2)
- RC-F5-36: solicitar certidão de casamento com averbação de divórcio
- Se cliente não souber se tem averbação: verificar; se não tiver → RC-F5-37 (separado sem averbação)
- LF-33: sem `fact_*` canônico para certidão com averbação; registrar como observação documental
- Docs completos: doc de identidade + residência + renda por regime + certidão de casamento com averbação

### SYN-F5-13 — Separado(a) sem averbação: dois caminhos

Lead diz que é "separado, mas não foi em cartório" ou "separado mas ainda estou no papel".
- Estado civil declarado: separado informal, sem averbação → para o banco: ainda casado(a) civilmente
- RC-F5-37: apresentar os dois caminhos sem bloquear
  - Caminho 1: regularizar averbação de divórcio primeiro; processo aguarda formalização (LF-35)
  - Caminho 2: seguir em conjunto com o cônjuge, já que legalmente ainda são casados (RC-F5-16)
- NÃO tratar como divorciado(a); NÃO bloquear secamente; NÃO reabrir união estável
- LF-34 (estado civil fino) + LF-35 (regularização da averbação em andamento)
- VS-F5-11 + VS-F5-12: vetar tratamento errado e bloqueio seco

---

## §14 Validação cruzada T2 / T3 / T4

| # | Artefato referenciado | Ponto de validação | Status |
|---|---|---|---|
| 1 | `T2_DICIONARIO_FATOS.md §3.9` | `fact_doc_identity_status` — Group IX — enum | ✅ existe |
| 2 | `T2_DICIONARIO_FATOS.md §3.9` | `fact_doc_income_status` — Group IX — enum | ✅ existe |
| 3 | `T2_DICIONARIO_FATOS.md §3.9` | `fact_doc_residence_status` — Group IX — enum | ✅ existe |
| 4 | `T2_DICIONARIO_FATOS.md §3.9` | `fact_doc_ctps_status` — Group IX — enum | ✅ existe |
| 5 | `T2_DICIONARIO_FATOS.md §3.9` | `fact_docs_channel_choice` — Group IX — enum | ✅ existe |
| 6 | `T2_DICIONARIO_FATOS.md §3.10` | `fact_visit_interest` — Group X — enum | ✅ existe |
| 7 | `T2_DICIONARIO_FATOS.md §3.10` | `fact_current_intent` — Group X — enum | ✅ existe |
| 8 | `T2_DICIONARIO_FATOS.md §3.11` | `derived_doc_risk` — derived | ✅ existe |
| 9 | `T2_DICIONARIO_FATOS.md §3.11` | `derived_dossier_profile` — derived (simples/médio/complexo) | ✅ existe |
| 10 | `T2_LEAD_STATE_V1.md §3.3` | `docs_prep`, `docs_collection`, `broker_handoff`, `awaiting_broker`, `visit_conversion` — todos canônicos | ✅ 5 valores canônicos |
| 11 | `T3_CLASSES_POLITICA.md` | 5 classes: OBR, CONF, SGM, ROT, VS — zero reply_text | ✅ conforme |
| 12 | `T4_PIPELINE_LLM.md` | reply_text exclusivo do LLM; recommended_next_actions não substituem fala | ✅ conforme |
| 13 | `T5_MAPA_FATIAS.md §4.5` | 5 stages F5 cobertos; fatos mínimos alinhados | ✅ alinhado |
| 14 | `ADENDO_CANONICO_SOBERANIA_IA.md` | Zero reply_text mecânico em todas as 6 OBR + 2 CONF + 6 SGM + 5 ROT + 10 VS | ✅ auditável |
| 15 | `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | Herança de F4: derived_eligibility_probable + fact_credit_restriction (observação no dossiê) | ✅ cross-fatia documentada |
| 16 | `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | Herança de F3: work_regime, income, ctps_36m, autonomo_has_ir, has_fgts, entry_reserve | ✅ determinam docs por regime |
| 17 | `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | Herança de F2: estado_civil, process_mode, p3_required | ✅ determinam docs de P2/P3 |
| 18 | LF-01..LF-31 | 31 lacunas declaradas; zero `fact_*` inventado | ✅ sem invenção |
| 19 | RC-F5-35 (PR-T5.6-fix) | Viúvo(a): certidão de óbito obrigatória; inventário fora do recorte; sem novo `fact_*` | ✅ cirúrgico |
| 20 | RC-F5-36 (PR-T5.6-fix) | Divorciado(a): certidão de casamento com averbação; verificar se averbado ou separado sem averbação | ✅ cirúrgico |
| 21 | RC-F5-37 (PR-T5.6-fix) | Separado(a) sem averbação: dois caminhos; NÃO tratar como divorciado(a) formal; RC-F5-16 herdada para caminho conjunto | ✅ cirúrgico |
| 22 | LF-32..35 (PR-T5.6-fix) | 4 lacunas civis declaradas (certidão óbito, certidão averbação, separado sem averbação, regularização pendente); zero `fact_*` criado | ✅ sem invenção |

---

## §15 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual
Última PR relevante: PR-T5.5 (#119) — merged 2026-04-27T02:50:24Z
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
Objetivo imutável do contrato: Migração declarativa do funil core por fatias; LLM soberano na fala
Recorte a executar nesta PR: F5 — Documentação / dossiê / correspondente / visita / handoff (5 stages, PR-T5.6)
Item do A01: T5 — PR-T5.6 — F5 contrato declarativo
Estado atual da frente: contrato aberto (T5 em execução por fatias)
O que a última PR fechou: F4 coberta (elegibilidade/restrição); PR-T5.5 merged
O que a última PR NÃO fechou: F5; G5; runtime
Por que esta tarefa existe: F4 confirmou elegibilidade; F5 converte lead qualificado em dossiê analisável
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar contrato declarativo completo da F5 com 5 stages, 34 regras Vasques, facts T2, 31 lacunas e políticas T3
Escopo: schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md + live files
Fora de escopo: src/, runtime, T1/T2/T3/T4 aprovados, T5.3/T5.4/T5.5, implementação real, PR-T5.7
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Legado auxiliar:             T5_MAPA_FATIAS.md §4.5, T2_DICIONARIO_FATOS.md §3.9/3.10/3.11
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | 5 stages F5 cobertos com objetivo e fatos | §2 deste artefato |
| 2 | Sequência de 5 `current_phase` canônicos documentada | §1.2 |
| 3 | 9 fatos/derived T2 canônicos mapeados (Group IX, X + derived) | §3.1 |
| 4 | 11 fatos herdados de F2/F3/F4 documentados como insumos | §3.2 |
| 5 | 31 lacunas de schema (LF-01..31) declaradas sem criar fact_* | §4 |
| 6 | 37 regras comerciais Vasques documentadas (RC-F5-01..37; RC-F5-35..37 = correção civis — PR-T5.6-fix) | §5 |
| 7 | Regra-mãe: condução ativa, não escolha passiva | RC-F5-01, §1.4 |
| 8 | Follow-up obrigatório mínimo 3x antes de convidar plantão | RC-F5-03 |
| 9 | Docs por regime/perfil: CLT, servidor, aposentado, autônomo, MEI, empresário, informal | RC-F5-06..14 |
| 10 | Dossiê por perfil (não conversa crua): conteúdo completo documentado | RC-F5-19 |
| 11 | Dossiê mínimo para envio definido | RC-F5-20 |
| 12 | Aprovado condicionado = interno; para cliente = aprovado | RC-F5-22 |
| 13 | Retorno SCR/BACEN/Registrato: fluxo documentado | RC-F5-24, §2.3 |
| 14 | SPC/Serasa + Receita Federal: fluxos documentados | RC-F5-25/26 |
| 15 | Toda aprovação vira agendamento | RC-F5-27 |
| 16 | Confirmações D-1 + D0; notificação Vasques documentadas | RC-F5-28 |
| 17 | `finalizacao_processo` com critério rigoroso; resposta curta não aciona | RC-F5-32, AP-F5-10 |
| 18 | 6 OBR + 2 CONF + 6 SGM + 5 ROT + 12 VS — zero reply_text | §6, §7 |
| 19 | 18 anti-padrões (AP-F5-01..18; AP-F5-16..18 = civis, PR-T5.6-fix) | §10 |
| 20 | 13 cenários sintéticos (SYN-F5-01..13; SYN-F5-11..13 = civis, PR-T5.6-fix) | §13 |
| 21 | 22 itens de validação cruzada T2/T3/T4 (itens 19..22 = civis, PR-T5.6-fix) | §14 |
| 22 | Zero reply_text mecânico — soberania LLM intacta | §6, AP-F5-13 |
| 23 | Bloco E completo com ESTADO HERDADO + ESTADO ENTREGUE | este §15 |
| 24 | RC-F5-35..37: viúvo(a), divorciado(a), separado(a) sem averbação — correção cirúrgica civis (PR-T5.6-fix) | §5 |
| 25 | LF-32..35: 4 lacunas civis declaradas sem criar fact_* (PR-T5.6-fix) | §4 |

### Provas

- **P-T5.6-01:** arquivo `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` criado; `git diff --stat` confirma novo artefato
- **P-T5.6-02:** 9 fatos canônicos T2 (Groups IX, X + derived) verificados em `T2_DICIONARIO_FATOS.md §3.9/3.10/3.11`; zero fact_* inventado; 35 lacunas declaradas em §4 (LF-01..35, incluindo LF-32..35 para civis — PR-T5.6-fix)
- **P-T5.6-03:** zero reply_text em qualquer seção §6 (OBR/CONF/SGM/ROT/VS); soberania LLM auditável no artefato

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md — contrato declarativo completo da F5; adendo cirúrgico RC-F5-34 (parcela mensal confortável); PR-T5.6-fix: correção cirúrgica de documentos civis — viúvo(a) (RC-F5-35, LF-32), divorciado(a) (RC-F5-36, LF-33), separado(a) sem averbação (RC-F5-37, LF-34/35); 2 VS + 3 AP + 3 SYN + 4 itens validação cruzada adicionados
O que foi fechado nesta PR: F5 coberta com 5 stages, 37 regras, 35 lacunas, políticas T3 completas; funil core F1–F5 documentado incluindo casos civis finos
O que continua pendente: paridade funcional (T5.7), shadow (T5.8), readiness (T5.R); G5; runtime; F5 runtime implementation
O que ainda não foi fechado do contrato ativo: PR-T5.7..PR-T5.8, PR-T5.R, G5
Recorte executado do contrato: T5 §6 S5 — contrato declarativo F5 (última fatia do funil core)
Pendência contratual remanescente: paridade, shadow, readiness, G5
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado? sim — PR-T5.7 autorizada após merge desta PR
Esta tarefa foi fora de contrato? não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```

### BLOCO E A00-ADENDO-03

**Esta PR (e correção PR-T5.6-fix) está apta a fechar a etapa F5?** ✅ **SIM**

| Critério A00-ADENDO-03 | Status |
|---|---|
| Evidência real de conclusão presente | ✅ 25 evidências documentadas acima (incl. 2 da PR-T5.6-fix) |
| 35 lacunas são gaps intencionais, não prova parcial | ✅ declaradas explicitamente; LF-32..35 civis adicionados na PR-T5.6-fix |
| Nenhuma etapa fechada sem evidência | ✅ artefato criado antes do Bloco E; correção aplicada antes do commit |
| Bloco E completo | ✅ ESTADO HERDADO + ESTADO ENTREGUE + provas |
| Soberania LLM intacta | ✅ zero reply_text mecânico auditável em §6; nenhum template/fala criada na fix |
| Nenhum `fact_*` inventado | ✅ todos os 9 fatos são canônicos T2; 35 lacunas declaradas (LF-01..35) |
| `current_phase` — somente valores canônicos | ✅ 5 valores usados pertencem aos 8 canônicos |
| F1–F5 funil core coberto | ✅ F5 coberta com casos civis finos incluídos (PR-T5.6-fix) |
| PR-T5.7 autorizada após merge | ✅ §Meta + ESTADO ENTREGUE declarados |
| Inventário não incluído | ✅ RC-F5-35 declara explicitamente: inventário fora do recorte ativo |
| União estável não reaberta | ✅ RC-F5-37 declara explicitamente: não reabrir |
| P3/familiar casado civil não reaberto | ✅ RC-F5-37 declara explicitamente: não reabrir |
