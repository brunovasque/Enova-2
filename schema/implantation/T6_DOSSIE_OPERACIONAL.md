# T6_DOSSIE_OPERACIONAL — Dossiê Operacional e Link do Correspondente — ENOVA 2

## Meta

| Campo | Valor |
|---|---|
| PR | PR-T6.8 |
| Branch | feat/t6-pr-t6-8-dossie-operacional |
| Artefato | Contrato declarativo do dossiê operacional e link do correspondente |
| Status | entregue |
| Pré-requisito | PR-T6.7 merged (#132 — 2026-04-28T21:36:28Z); T6_ADAPTER_META_WHATSAPP.md vigente |
| Contrato ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` |
| Autoriza | PR-T6.9 — Suite de testes/sandbox multicanal |
| Data | 2026-04-28 |

---

## §1 Resumo executivo

Este artefato declara o contrato declarativo do **dossiê operacional e link do correspondente** da
ENOVA 2. Cobre a organização dos documentos recebidos em um pacote coerente para o correspondente,
os estados do dossiê, os documentos mínimos por perfil/P1/P2/P3, as pendências documentais, a
estrutura do link do correspondente, o envio, o retorno (aprovação/reprovação/pendência), a trilha
de auditoria e as regras de aprovação → visita e reprovação → orientação.

**Princípio-mãe:** dossiê organiza — não decide. Dossiê não escreve `reply_text`, não aprova cliente,
não cria `fact_*`, não gera `current_phase` e não avança stage sozinho. Toda aprovação, reprovação
ou orientação é mediada pelo pipeline LLM-first: `T4 → T3 → T2 → T5`.

**Esta PR é declarativa — não implementa dossiê real, link real, envio real, parser real de retorno
do correspondente, notificação real ao Vasques, nem agendamento real.**

---

## §2 Finalidade do dossiê operacional

O dossiê operacional é o **pacote organizado de documentos, informações comerciais e contexto do
lead que é enviado ao correspondente bancário para análise de crédito/elegibilidade MCMV**.

**O que o dossiê faz:**
- Consolida documentos recebidos pelo canal (via T6.3/T6.4) organizados por pessoa (P1/P2/P3)
- Registra documentos pendentes, rejeitados e informativos
- Carrega informações comerciais úteis ao correspondente
- Mantém o estado atual do pacote documental
- Gera referência ao link do correspondente (conceitual)
- Registra o retorno do correspondente (aprovação, reprovação, pendência)
- Mantém trilha de auditoria de todos os eventos do dossiê
- Informa o pipeline quando aprovação → acionar visita (via T5)
- Informa o pipeline quando reprovação → acionar orientação (via T5)

**O que o dossiê NÃO faz:**
- Não escreve fala ao cliente (`reply_text` é exclusivo do LLM via T4.4)
- Não decide aprovação ou reprovação do cliente
- Não cria `fact_*` de forma autônoma
- Não cria `current_phase`
- Não avança stage sem passar pela governança T3/T2/T4
- Não monta link real
- Não envia ao correspondente nesta PR
- Não implementa parser real de retorno
- Não implementa notificação real ao Vasques
- Não implementa agendamento real de visita
- Não cria regra comercial nova
- Não altera regras T5

---

## §3 Princípio central: dossiê organiza, não decide

**Regra-mãe (herdada do contrato T6 §1, A00-ADENDO-01 e A00-ADENDO-02):**

> **Dossiê é organização operacional — não é cérebro.**
> **Dossiê não escreve `reply_text`.**
> **Dossiê não decide stage sozinho.**
> **Dossiê não cria `fact_*`.**
> **Dossiê não cria `current_phase`.**
> **Dossiê não aprova/reprova cliente.**
> **Dossiê não interpreta retorno do correspondente sem governança.**
> **Dossiê não monta link real, não envia, não cria runtime.**
>
> Tudo continua passando pela governança:
> `T6_SURFACE_CANAL → T6.3/T6.4 → T4 → T3 → T2 → T5`

O dossiê é insumo para o pipeline — não é decisor.

---

## §4 Relação com T5 documentação/visita/handoff

O dossiê operacional **expande para canal real** o que T5 declarou em `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md`:

| Artefato T5 | O que T6.8 herda/expande |
|---|---|
| F5 — Fatia documentação/visita/handoff | Estrutura de dossiê, docs mínimos, estados de aprovação/reprovação |
| RC-F5-01..38 | Regras de documentação por regime/perfil (reaproveitadas em §10) |
| RC-F5-36/35 | Divórciado/viúvo → certidão + docs específicos (AT-01 corrigido em T6.1) |
| RC-F5-37 | Separado sem averbação → caminho de regularização (AT-03 corrigido em T6.1) |
| RC-F5-38 | Multi-renda/multi-regime → docs por fonte (AT-04 explicitado em T6.1) |
| Aprovação → visita | T6.8 declara o caminho; T5 governa estágios; runtime é futuro |
| Reprovação → orientação | T6.8 declara o caminho; T5 governa orientação; template é futuro |

**Regra:** T6.8 não altera nada de T5. Apenas consome as regras já declaradas.

---

## §5 Relação com T6.3 (contrato de anexos e documentos)

T6.3 governa a **tipologia, estados e associação de documentos**. T6.8 consome:

| T6.3 | Como T6.8 usa |
|---|---|
| 11 estados documentais | Alimentam `documentos_recebidos[]`, `documentos_pendentes[]`, `documentos_rejeitados[]` |
| 35+ tipos de documento | Determinam o que vai em cada categoria do dossiê |
| Associação P1/P2/P3 | Determina como documentos são agrupados por pessoa no dossiê |
| OCR como lacuna futura | Dossiê não exige OCR; documento pode ser referenciado sem conteúdo extraído |
| 18 proibições T6.3 | Herdadas pelo dossiê — documento sem dono nunca entra como válido |

---

## §6 Relação com T6.4 (pipeline imagem/PDF/documento)

T6.4 governa o **fluxo de recepção e classificação de mídia documental**. T6.8 consome:

| T6.4 | Como T6.8 usa |
|---|---|
| EP-01..EP-07 | Documentos que chegam ao dossiê já passaram por EP-01..EP-07 |
| Estado documental EP-05 | `accepted_for_dossier` é o estado que autoriza inclusão no dossiê |
| Associação P1/P2/P3 EP-03 | Dossiê agrupa por pessoa conforme associação já definida |
| Referência T6.8 EP-07 | T6.4 EP-07 declara explicitamente que referências são preparadas para T6.8 |

---

## §7 Relação com T6.7 (adapter Meta/WhatsApp)

T6.7 governa o **transporte entre canal e surface**. T6.8 usa:

| T6.7 | Como T6.8 usa |
|---|---|
| `outbound_message_id` | Rastreabilidade de comunicação outbound com o lead/correspondente |
| Status events (delivered/read) | Podem alimentar `audit_trail[]` do dossiê |
| INV-AD-09 (adapter não modifica reply_text) | Dossiê confia que reply_text ao cliente é sempre do LLM |
| SEC-01..10 (segurança mínima) | Herdadas pelo link do correspondente |

---

## §8 Estrutura conceitual do dossiê

**Shape conceitual/documental — não implementar TypeScript, schema real, migration ou runtime.**

```
DossieOperacional {
  dossier_id:               UUID — identificador único do dossiê
  case_id:                  UUID — referência ao lead/caso na ENOVA 2
  pre_cadastro_id:          string — identificador operacional do pré-cadastro
  lead_external_id:         string | null — identificador externo se houver integração futura
  created_at:               ISO8601 — criação do dossiê
  updated_at:               ISO8601 — última atualização
  dossier_status:           DossierStatus — estado atual (§9)

  pessoas: [
    {
      pessoa_id:            UUID — identificador da pessoa
      role:                 "P1" | "P2" | "P3" — papel no financiamento
      nome:                 string — nome completo (já capturado pelo funil)
      cpf_ref:              string | null — referência ao CPF (não armazenar em claro aqui)
      regime_trabalho:      string — CLT | servidor | aposentado | autônomo | MEI | empresário | informal
      estado_civil:         string — solteiro | casado_civil | divorciado | viuvo | separado_sem_averbacao | uniao_estavel
      idade:                número | null
      alerta_idade_67:      boolean — true se participante acima de 67 anos
    }
  ]

  documentos_recebidos: [
    {
      doc_id:               UUID
      pessoa_id:            UUID — referência à pessoa dona do documento
      tipo_documento:       string — tipo conforme T6.3
      estado:               "accepted_for_dossier" — estado conforme T6.3 §6
      media_ref:            string — referência à mídia original
      received_at:          ISO8601
      classification_source: string — fonte da classificação
    }
  ]

  documentos_pendentes: [
    {
      tipo_documento:       string — tipo que está faltando
      pessoa_id:            UUID — para quem está pendente
      motivo_pendencia:     string — por que está pendente
      prioridade:           "bloqueante" | "recomendado" | "complementar"
    }
  ]

  documentos_rejeitados: [
    {
      doc_id:               UUID
      pessoa_id:            UUID
      tipo_documento:       string
      estado:               "rejected_unreadable" | "rejected_wrong_type" | "duplicate" | "expired_or_outdated"
      motivo_rejeicao:      string
      media_ref:            string
      rejected_at:          ISO8601
    }
  ]

  documentos_informativos: [
    {
      doc_id:               UUID
      pessoa_id:            UUID
      tipo_documento:       string
      estado:               "informational_only"
      observacao:           string
      media_ref:            string
    }
  ]

  rendas: [
    {
      pessoa_id:            UUID
      regime:               string — regime de trabalho
      fonte:                string — nome do empregador, CNPJ, fonte
      valor_declarado:      null — nunca armazenar valor sem contrato de dados
      classificacao:        "financiavel" | "informativa" | "nao_financiavel" | "hipotetica"
      observacao:           string | null
    }
  ]

  composicao: {
    tipo:                   "solo" | "conjunto" | "composicao_familiar"
    participantes:          UUID[] — lista de pessoa_id dos participantes
    observacao:             string | null
  }

  restricoes_informadas: [
    {
      pessoa_id:            UUID
      tipo_restricao:       string — SCR | REFIN | PEFIN | SPC | Serasa | RF | outro
      descricao:            string — descrição sem valor
      status_informado:     "informado_pelo_cliente" | "confirmado_correspondente" | "regularizado"
    }
  ]

  observacoes_comerciais: {
    bairro_mora:            string | null
    bairro_trabalha:        string | null
    bairro_pretende_comprar: string | null
    valor_entrada_disponivel: número | null — valor de entrada declarado pelo cliente, se informado
    valor_fgts_disponivel:  número | null — valor de FGTS declarado pelo cliente, se souber/informar
    tem_fgts_duvida:        boolean | null
    parcela_pretendida:     número | null — parcela que o cliente pretende pagar, se informada
    parcela_maxima_confortavel: número | null — parcela máxima confortável declarada pelo cliente, se informada
    profissao_autonomo:     string | null
    autonomo_curso_superior: boolean | null
    obs_renda_informal:     string | null
    obs_beneficio_nao_financiavel: string | null
    obs_restricao:          string | null
    obs_composicao:         string | null
    obs_docs_pendentes:     string | null
    canal_retorno:          string | null
  }

  link_correspondente: {
    link_ref:               string | null — referência conceitual ao link (não URL real nesta PR)
    generated_at:           ISO8601 | null
    access_log:             [] — registro de acessos
    status:                 "not_generated" | "generated" | "opened" | "expired"
  }

  correspondente_status:    "not_sent" | "sent" | "received" | "reviewing" | "returned"

  retorno_correspondente: {
    status:                 "pending" | "approved" | "rejected" | "pending_regularization" | null
    tipo_retorno:           string | null — tipo do retorno (SCR, RF, documental, etc.)
    observacao_interna:     string | null — observação para operação interna
    received_at:            ISO8601 | null
  }

  visit_status:             "not_applicable" | "pending_scheduling" | "scheduled" | "confirmed" | "done" | "no_show"

  audit_trail: [
    {
      event:                string — evento de auditoria (§21)
      timestamp:            ISO8601
      actor:                "system" | "lead" | "operator" | "correspondent"
      detail:               string | null
    }
  ]
}
```

---

## §9 Estados do dossiê

**Declaração declarativa — não criar enum runtime.**

| Estado | Descrição | Transição |
|---|---|---|
| `draft` | Dossiê criado mas ainda sem documentos | → `collecting_documents` quando primeiro doc recebido |
| `collecting_documents` | Recebendo documentos ativamente | → `partial_documents` se falta doc obrigatório; → `ready_for_review` se docs mínimos presentes |
| `partial_documents` | Tem alguns documentos mas falta obrigatório | → `ready_for_review` quando docs mínimos cobertos |
| `ready_for_review` | Docs mínimos presentes; aguarda revisão operacional | → `ready_to_send` após revisão; → `partial_documents` se falha encontrada |
| `ready_to_send` | Revisado; pronto para envio ao correspondente | → `sent_to_correspondent` após envio |
| `sent_to_correspondent` | Enviado ao correspondente; aguardando resposta | → `correspondent_received` quando correspondente abre |
| `correspondent_received` | Correspondente confirmou recebimento | → `correspondent_reviewing` |
| `correspondent_reviewing` | Correspondente está analisando | → `approved` | `rejected` | `pending_regularization` |
| `approved` | Correspondente aprovou | → `visit_required` (acionar visita conforme T5) |
| `rejected` | Correspondente reprovou | → orientação conforme T5 |
| `pending_regularization` | Pendência documental ou regularização necessária | → `collecting_documents` após regularização |
| `visit_required` | Aprovado; visita a ser agendada | → `visit_scheduled` após agendamento |
| `visit_scheduled` | Visita agendada com data/horário | → `done` após visita |
| `archived_temporarily` | Lead em pausa; sem descarte definitivo | → `collecting_documents` se retomar |

**Regras de transição:**

| Código | Regra |
|---|---|
| DS-01 | Dossiê `partial_documents` nunca vira `ready_to_send` |
| DS-02 | Dossiê `draft` nunca vira `sent_to_correspondent` diretamente |
| DS-03 | Estado `approved` só vira `visit_required` — nunca termina sem ação |
| DS-04 | Estado `rejected` aciona orientação conforme T5 — nunca descarta lead definitivamente sem caminho |
| DS-05 | Transição de estado não gera `reply_text` diretamente — LLM conduz via pipeline |
| DS-06 | Transição de estado não cria `fact_*` diretamente |
| DS-07 | Transição de estado pode gerar evento em `audit_trail[]` |
| DS-08 | `visit_scheduled` não altera `dossier_status` para estado terminal — visita é evento próprio |

---

## §10 Documentos mínimos por perfil/P1/P2/P3

**Reaproveitamento de T5 (RC-F5-01..38) e T6.3. Não alterar regras T5.**

### 10.1 Base documental obrigatória para todos os participantes

| Documento | Aplicabilidade |
|---|---|
| Documento de identificação (RG/CNH/CIN) | Todos os participantes |
| CPF (se não incorporado no doc de identificação) | Todos os participantes |
| Comprovante de residência (≤ 3 meses) | P1 (e P2 se diferente) |
| Comprovante de renda aplicável ao regime | Todos que compõem renda |

### 10.2 Documentos por regime de trabalho

| Regime | Documento mínimo obrigatório | Observação |
|---|---|---|
| CLT sem variação | Último holerite | Holerite deve mostrar empregador e salário |
| CLT com variação | 3 últimos holerites | Para capturar variação/comissão |
| Servidor público | Contracheque / folha de pagamento | Emitido pelo órgão |
| Aposentado / Pensionista | Extrato de aposentadoria INSS (≤ 3 meses) | Demonstrativo de benefício |
| Autônomo com IRPF | Declaração IRPF + recibo de entrega | Último exercício |
| Autônomo sem IRPF | 3 últimos extratos de movimentação bancária | Renda informativa/complementar; tem limitação de elegibilidade; buscar composição/entrada/FGTS |
| MEI | Tratar como autônomo com ou sem IRPF conforme declaração | CNPJ isolado nunca comprova renda MCMV — RG/CPF PF é o que financia |
| Empresário | Pró-labore se existir + IRPF + documentos PF | CNPJ contextualiza; financiamento é da PF |
| Informal / bico | Extratos bancários como renda complementar/informativa | Com limitação declarada; observar no dossiê |

### 10.3 Documentos por estado civil

| Estado civil | Documento adicional | Referência T5 |
|---|---|---|
| Casado civil | Certidão de casamento + documentos do cônjuge | RC-F5-01..10 |
| Divorciado | Certidão de casamento com averbação de divórcio | RC-F5-36; AT-01 corrigido em T6.1 |
| Viúvo | Certidão de casamento + certidão de óbito do cônjuge | RC-F5-35; AT-01 corrigido em T6.1 |
| Separado sem averbação | Regularizar averbação ou seguir em conjunto com cônjuge | RC-F5-37; AT-03 corrigido em T6.1 |
| Solteiro | Sem adicional | — |
| União estável | Declaração de união estável + docs do companheiro | Quando aplicável |

### 10.4 Multi-renda/multi-regime (RC-F5-38)

Cada fonte de renda tem documentação própria. O dossiê deve registrar:

```
Para cada fonte:
  (pessoa_id, regime, fonte, documentos_da_fonte[], classificacao_financiabilidade)
```

Exemplos:
- P1 CLT + aposentadoria: holerite da CLT + extrato INSS
- P1 autônomo + P2 CLT: extratos/IRPF de P1 + holerite de P2
- P1 CLT + P3 familiar CLT: docs de P1 + docs de P3

### 10.5 Benefícios não financiáveis

Os seguintes benefícios **não comprovam renda financiável MCMV** e são registrados como `classificacao: "nao_financiavel"`:

| Benefício | Tratamento no dossiê |
|---|---|
| Bolsa Família | Informativo — não integra renda financiável |
| BPC/LOAS | Informativo — não integra renda financiável |
| Benefício assistencial | Informativo — não integra renda financiável |
| Seguro-desemprego | Informativo — transitório; não integra renda financiável |
| Trabalho temporário | Informativo — transitório; não integra renda financiável |

### 10.6 CTPS

CTPS completa deve ser solicitada quando:
- Participante informou ter 36 meses de CTPS ou não sabe se possui
- Aplicável a regime CLT ou quando histórico de vínculo empregatício é relevante

### 10.7 Idade acima de 67 anos

Quando qualquer participante (P1, P2 ou P3) tem idade acima de 67 anos:
- `alerta_idade_67: true` na estrutura da pessoa
- Impacto no prazo máximo de financiamento (regra T5 — não alterar aqui)
- Correspondente deve ser informado via `observacoes_comerciais`

---

## §11 Documentos recebidos

Documentos recebidos são aqueles com estado `accepted_for_dossier` (T6.3) que já passaram pelo
pipeline T6.4 (EP-01..EP-07).

**Regras:**

| Código | Regra |
|---|---|
| DR-01 | Documento entra em `documentos_recebidos[]` somente com estado `accepted_for_dossier` (T6.3) |
| DR-02 | Cada documento está associado a uma pessoa específica (`pessoa_id`) |
| DR-03 | Cada documento tem `media_ref` preservado (referência à mídia original) |
| DR-04 | Classificação hipotética de T6.4 não é suficiente para `accepted_for_dossier` — depende de validação pelo pipeline LLM |
| DR-05 | Documento duplicado (`state=duplicate` em T6.3) não entra em `documentos_recebidos[]` |
| DR-06 | Documento vencido (`state=expired_or_outdated`) não entra em `documentos_recebidos[]` |
| DR-07 | Documento sem dono claro nunca entra como aceito — primeiro precisa de associação |
| DR-08 | `documentos_recebidos[]` não contém cópia do arquivo — apenas referência |

---

## §12 Documentos pendentes

Documentos pendentes são os obrigatórios pelo perfil/P1/P2/P3 (§10) que ainda não foram recebidos
com estado `accepted_for_dossier`.

**Regras:**

| Código | Regra |
|---|---|
| DP-01 | Pendência é calculada pela diferença entre docs mínimos obrigatórios e docs recebidos por pessoa |
| DP-02 | Pendência tem prioridade: `bloqueante` (impede envio ao correspondente) | `recomendado` | `complementar` |
| DP-03 | Doc com estado `needs_review` ou `classified_hypothesis` ainda conta como pendente |
| DP-04 | Doc com estado `rejected_unreadable` gera nova pendência (`pending_replacement`) |
| DP-05 | Pendências são informadas ao LLM para que o LLM solicite ao cliente |
| DP-06 | LLM decide como e quando solicitar doc pendente — dossiê informa a pendência, não escreve fala |
| DP-07 | Dossiê `partial_documents` tem ao menos uma pendência `bloqueante` |
| DP-08 | Dossiê `ready_for_review` tem zero pendências `bloqueante` |

---

## §13 Associação documento ↔ pessoa ↔ regime/fonte

Toda entrada do dossiê que envolve documento ou renda deve declarar:

```
(pessoa_id, regime, fonte, doc_tipo, doc_estado, classificacao_financiabilidade)
```

**Exemplos de associação:**

| Exemplo | Associação |
|---|---|
| Holerite da P1 CLT | P1, CLT, "Empresa X", holerite, accepted_for_dossier, financiavel |
| Extrato INSS do P2 aposentado | P2, aposentado, "INSS", extrato_aposentadoria, accepted_for_dossier, financiavel |
| Extrato bancário do P1 autônomo | P1, autônomo_sem_IRPF, "conta PF", extrato_bancario, accepted_for_dossier, informativa |
| Certidão de casamento do casal | P1+P2, estado_civil, "cartório", certidao_casamento, accepted_for_dossier, n/a |
| Bolsa Família P1 | P1, nao_financiavel, "governo", comprovante_beneficio, informational_only, nao_financiavel |

**Regras:**

| Código | Regra |
|---|---|
| AS-01 | Toda renda tem `classificacao_financiabilidade` declarada |
| AS-02 | `nao_financiavel` nunca soma à renda principal de elegibilidade |
| AS-03 | CNPJ isolado tem `classificacao_financiabilidade: "nao_financiavel"` ou `"informativa"` |
| AS-04 | Multi-renda RC-F5-38: cada fonte tem entrada separada |
| AS-05 | Documentos civis (certidões) associados à pessoa pertinente |

---

## §14 Informações comerciais do dossiê

As informações comerciais do dossiê auxiliam a negociação e o correspondente — não são cálculo
de aprovação nem simulação final.

**Trava obrigatória:** valores de entrada, FGTS e parcela neste dossiê são **comerciais/declarativos**,
informados pelo cliente quando houver. Não são valores aprovados pela Caixa, não configuram simulação
oficial e não prometem aprovação. Servem apenas para orientar negociação, correspondente e estratégia
comercial dentro da governança já declarada.

**Campos declarados (§8 `observacoes_comerciais`):**

| Campo | Finalidade | Restrição |
|---|---|---|
| `bairro_mora` | Contexto de localização | Não é filtro de aprovação |
| `bairro_trabalha` | Contexto de mobilidade | Não é filtro de aprovação |
| `bairro_pretende_comprar` | Contexto de preferência | Não é filtro de aprovação |
| `valor_entrada_disponivel` | Valor de entrada declarado pelo cliente, se informado | Comercial/declarativo; não é valor aprovado pela Caixa |
| `valor_fgts_disponivel` | Valor de FGTS declarado pelo cliente, se souber/informar | Comercial/declarativo; não é valor aprovado pela Caixa |
| `tem_fgts_duvida` | Cliente declarou dúvida sobre ter FGTS | Informação para correspondente |
| `parcela_pretendida` | Parcela que o cliente pretende pagar, se informada | Comercial/declarativo; não é simulação oficial |
| `parcela_maxima_confortavel` | Parcela máxima confortável declarada pelo cliente, se informada | Comercial/declarativo; não promete aprovação |
| `profissao_autonomo` | Contexto para autônomo | Auxilia correspondente na análise |
| `autonomo_curso_superior` | Pode impactar análise de autônomo sem IRPF | Informativo |
| `obs_renda_informal` | Renda informal declarada | Não é renda financiável; informativa |
| `obs_beneficio_nao_financiavel` | Benefício não financiável declarado | Observação — não entra na renda |
| `obs_restricao` | Restrição informada pelo cliente | Sem valor; sem tipo exato ao cliente |
| `obs_composicao` | Contexto da composição | Multi-renda, familiar, etc. |
| `obs_docs_pendentes` | Obs sobre pendências | Para correspondente |
| `canal_retorno` | Como correspondente retorna | WhatsApp, e-mail, ligação |

**Regras de informações comerciais:**

| Código | Regra |
|---|---|
| IC-01 | Informações comerciais ajudam negociação e correspondente — não são aprovação |
| IC-02 | Não apresentar parcelas como simulação oficial da Caixa |
| IC-03 | Não prometer aprovação com base em informações comerciais |
| IC-04 | Valores de entrada, FGTS e parcela podem existir como informação declarada pelo cliente; são apenas comerciais/declarativos |
| IC-05 | Renda informal e benefício não financiável são observações — nunca renda financiável |
| IC-06 | CNPJ isolado é observação — nunca renda financiável MCMV |

---

## §15 Link do correspondente

**Contrato conceitual do link — não implementar URL real, autenticação real ou endpoint real nesta PR.**

**Finalidade do link:**
O link do correspondente é o acesso ao dossiê organizado. O correspondente recebe o link e consegue
visualizar o pacote de documentos, informações comerciais e perfil técnico do lead.

**O que o link deve permitir (conceitual):**

| Funcionalidade | Descrição |
|---|---|
| Visualizar docs recebidos | Lista de documentos com estado e referência por pessoa |
| Visualizar docs pendentes | Lista de pendências por pessoa e prioridade |
| Visualizar perfil técnico | Perfil sem JSON bruto — apresentação legível |
| Visualizar informações comerciais | Bairros, obs de renda, canal de retorno, etc. |
| Visualizar observações | Restrições informadas (sem valor), composição, obs gerais |
| Preservar trilha de auditoria | Registro de acessos e eventos |

**O que o link NÃO expõe:**

| Restrição | Motivo |
|---|---|
| Não expõe valores de renda em claro | Contrato de dados próprio necessário |
| Não expõe valores de dívida/restrição | Nunca informar valor de restrição |
| Não expõe parcelas como simulação | Parcela é orientação — não simulação oficial |
| Não expõe JSON bruto de lead_state | Perfil legível apenas |
| Não expõe segredo/token | Nunca em URL, parâmetro ou documento |
| Não expõe dados de outra pessoa | Isolamento por `case_id` |

**Referência conceitual do link:**

```
link_ref = "dossier/{pre_cadastro_id}/{dossier_id}" [conceitual — formato futuro]
```

---

## §16 Segurança mínima do link

| Código | Requisito | Descrição |
|---|---|---|
| SL-01 | Não expor segredo no link | Sem token, App Secret ou credencial na URL |
| SL-02 | Não vazar dados de outro caso | Isolamento por `case_id` obrigatório |
| SL-03 | Registrar abertura/acesso | `audit_trail[]` com evento `dossier.correspondent_opened` |
| SL-04 | Impedir edição indevida | Link é somente leitura para o correspondente |
| SL-05 | Não permitir assunção indevida por outro correspondente | Lock operacional futuro — declarar como requisito; implementação é PR específica de runtime |
| SL-06 | Não logar dados sensíveis em excesso | Valores de renda/dívida não devem aparecer em logs |
| SL-07 | Link com tempo de expiração | Expiração conceitual — implementação futura |
| SL-08 | Autenticação do correspondente | Requisito futuro — não implementar aqui |
| SL-09 | Não criar env real nesta PR | Variáveis de link são conceituais |
| SL-10 | Não criar endpoint real em `src/` | Esta PR é declarativa |

---

## §17 Envio ao correspondente

**Declarativo — não implementar envio real nesta PR.**

**Condições para envio:**

| Condição | Regra |
|---|---|
| Docs pessoais básicos | Todos os participantes com RG/CPF/residência presentes como `accepted_for_dossier` |
| Comprovante de renda obrigatório | Pelo menos o comprovante de renda do regime de cada participante que compõe |
| Docs da composição | Quando há P2/P3, docs mínimos de cada um presentes |
| Zero pendências bloqueantes | `documentos_pendentes[]` sem item de prioridade `bloqueante` |
| Estado do dossiê | `dossier_status: "ready_to_send"` |

**Regras de envio:**

| Código | Regra |
|---|---|
| ENV-01 | Dossiê incompleto (`partial_documents`) nunca é enviado |
| ENV-02 | Docs pendentes devem aparecer claramente para o correspondente |
| ENV-03 | Restrição informada é observação — não bloqueio cego de envio |
| ENV-04 | Renda informal e benefício não financiável são observações — declarar claramente no dossiê |
| ENV-05 | Canal de retorno deve estar definido antes do envio |
| ENV-06 | Dossiê não gera `reply_text` ao enviar — LLM informa o lead via pipeline |
| ENV-07 | Envio real ao correspondente é runtime futuro — esta PR declara o contrato |
| ENV-08 | Após envio, `dossier_status` → `sent_to_correspondent`; `correspondente_status` → `sent` |

---

## §18 Retorno do correspondente

**Declarativo — não implementar parser real nesta PR.**

**Possíveis retornos operacionais:**

| Retorno | Código | Ação declarada |
|---|---|---|
| Aprovado | `approved` | → `visit_required`; acionar visita conforme §19 |
| Aprovado condicionado | `approved` (interno) | → `visit_required`; **não expor "condicionado" ao cliente como fala final** |
| Reprovado | `rejected` | → orientação conforme §20 |
| Pendência documental | `pending_regularization` | → solicitar docs faltantes via LLM |
| Necessidade regularização Receita Federal | `pending_regularization` | → orientar regularização CPF na Receita |
| Restrição externa / SCR | `pending_regularization` | → pedir Registrato para análise futura |
| Dívida vencida no SCR | `pending_regularization` | → orientar regularização; sem expor valor |
| Dívida baixada como prejuízo no SCR | `pending_regularization` | → orientar Registrato; mais complexo |
| BACEN / Registrato | `pending_regularization` | → pedir Registrato do cliente |
| Margem insuficiente / comprometimento | `rejected` ou `pending_regularization` | → composição, entrada, FGTS, ou inelegível por agora |

**Regras de retorno:**

| Código | Regra |
|---|---|
| RET-01 | Retorno do correspondente não bypassa LLM/T4/T3/T2 — informa o pipeline |
| RET-02 | Aprovado (mesmo condicionado internamente) → **cliente aprovado** para condução de visita |
| RET-03 | **Nunca expor "aprovado condicionado" como fala final ao cliente** — apenas "aprovado" |
| RET-04 | Nunca informar valores de restrição ao cliente |
| RET-05 | Nunca informar valores de parcela vindos do correspondente como simulação oficial |
| RET-06 | Retorno do correspondente alimenta `retorno_correspondente` no dossiê + `audit_trail[]` |
| RET-07 | LLM decide o texto de comunicação ao cliente com base no contexto — não o dossiê |
| RET-08 | Parser real do retorno do correspondente é runtime futuro |

---

## §19 Aprovação → visita

**Declarativo — agendamento real é runtime futuro.**

Quando `retorno_correspondente.status = "approved"`:

```
Fluxo declarado:
1. dossier_status → "approved" → "visit_required"
2. Pipeline T4 recebe contexto de aprovação
3. LLM conduz cliente para agendamento de visita
4. Oferecer 2 opções de horário (conforme disponibilidade futura)
5. Confirmar visita 1 dia antes
6. Confirmar no dia com pelo menos 2h de antecedência
7. Vasques deve ser notificado:
   - telefone
   - perfil do cliente
   - horário da visita
   (notificação real é runtime futuro)
8. visit_status → "scheduled" → "confirmed" → "done"
9. TurnoRastro registra eventos de visita
```

**Regras:**

| Código | Regra |
|---|---|
| VIS-01 | Toda aprovação gera `visit_required` — nunca aprovado sem ação |
| VIS-02 | Agendamento usa lógica já declarada em T5 |
| VIS-03 | Oferecer 2 opções de horário conforme disponibilidade futura |
| VIS-04 | Confirmação 1 dia antes + no dia (2h antecedência) |
| VIS-05 | Vasques notificado: telefone + perfil + horário (runtime futuro) |
| VIS-06 | Agendamento real é runtime futuro — esta PR declara o contrato |
| VIS-07 | LLM conduz o agendamento via pipeline — dossiê informa o estado |
| VIS-08 | `approved condicionado` internamente → cliente recebe "aprovado" → visita padrão |

---

## §20 Reprovação / pendência grave → orientação

**Declarativo — template de fala não é criado aqui.**

Quando `retorno_correspondente.status = "rejected"` ou `"pending_regularization"`:

```
Fluxo declarado:
1. dossier_status → "rejected" ou "pending_regularization"
2. Pipeline T4 recebe contexto de reprovação/pendência
3. LLM conduz orientação conforme tipo
4. Preservar lead vivo quando houver caminho de regularização
```

**Por tipo de reprovação/pendência:**

| Tipo | Orientação declarada (não é template) |
|---|---|
| SCR / Bacen | Pedir Registrato para análise futura do correspondente |
| Receita Federal | Orientar regularização do CPF na Receita |
| SPC / Serasa / REFIN / PEFIN | Orientar regularização e envio de comprovante ao correspondente |
| Margem insuficiente | Verificar composição, entrada adicional, FGTS |
| Pendência documental | Solicitar docs faltantes via pipeline |
| Reprovação sem caminho claro | Inelegível por agora; preservar lead sem descarte definitivo |

**Regras:**

| Código | Regra |
|---|---|
| REP-01 | Reprovado não é descarte definitivo — tratar como inelegível por agora |
| REP-02 | Orientação por SCR/Bacen: pedir Registrato — PDF de orientação é frente/arquivo futuro |
| REP-03 | Orientação por Receita Federal: orientar regularização CPF |
| REP-04 | Orientação SPC/Serasa: orientar regularização e comprovante |
| REP-05 | Preservar lead vivo quando houver caminho de regularização |
| REP-06 | Não expor valores de dívida |
| REP-07 | Não criar template de fala nesta PR |
| REP-08 | LLM decide o texto de orientação via pipeline |

---

## §21 Trilha de auditoria

**Declarativa — não criar logger real nesta PR.**

| Evento | Quando |
|---|---|
| `dossier.created` | Criação do dossiê |
| `dossier.document_received` | Documento recebido com referência |
| `dossier.document_classified` | Documento classificado (hipótese ou aceito) |
| `dossier.document_pending` | Pendência identificada |
| `dossier.document_rejected` | Documento rejeitado |
| `dossier.document_replaced` | Documento substituído por reenvio |
| `dossier.ready_for_review` | Docs mínimos atingidos |
| `dossier.ready_to_send` | Revisado; pronto para envio |
| `dossier.link_generated` | Link do correspondente gerado |
| `dossier.sent_to_correspondent` | Dossiê enviado ao correspondente |
| `dossier.correspondent_opened` | Correspondente abriu o link |
| `dossier.correspondent_return_received` | Retorno do correspondente recebido |
| `dossier.approved` | Aprovado pelo correspondente |
| `dossier.rejected` | Reprovado pelo correspondente |
| `dossier.pending_regularization` | Pendência de regularização identificada |
| `dossier.visit_required` | Visita requerida após aprovação |
| `dossier.visit_scheduled` | Visita agendada |

---

## §22 Proibições absolutas

| Código | Proibição |
|---|---|
| PROB-DOS-01 | Dossiê gerar `reply_text` de forma autônoma |
| PROB-DOS-02 | Dossiê decidir stage sozinho |
| PROB-DOS-03 | Dossiê aprovar ou reprovar cliente diretamente |
| PROB-DOS-04 | Dossiê criar `fact_*` de forma autônoma |
| PROB-DOS-05 | Dossiê criar `current_phase` |
| PROB-DOS-06 | Dossiê montar link real nesta PR |
| PROB-DOS-07 | Dossiê enviar ao correspondente nesta PR |
| PROB-DOS-08 | Dossiê criar parser real de retorno |
| PROB-DOS-09 | Dossiê criar notificação real ao Vasques |
| PROB-DOS-10 | Dossiê implementar agendamento real |
| PROB-DOS-11 | Dossiê aceitar documento sem dono como válido |
| PROB-DOS-12 | Dossiê marcar incompleto como pronto (`partial_documents` → `ready_to_send`) |
| PROB-DOS-13 | Dossiê expor "aprovado condicionado" ao cliente como fala |
| PROB-DOS-14 | Dossiê expor valor de restrição ao cliente |
| PROB-DOS-15 | Dossiê expor parcela como simulação oficial da Caixa |
| PROB-DOS-16 | Dossiê colocar benefício não financiável como renda válida |
| PROB-DOS-17 | Dossiê colocar CNPJ isolado como renda MCMV válida |
| PROB-DOS-18 | Dossiê alterar regras de T5 |
| PROB-DOS-19 | Dossiê abrir WhatsApp real, T7, shadow/canary/cutover |
| PROB-DOS-20 | Dossiê executar deploy ou criar código em `src/` |

---

## §23 Riscos e mitigação

| # | Risco | Mitigação declarada |
|---|---|---|
| R-DOS-01 | Dossiê incompleto enviado como completo | DS-01: `partial_documents` nunca → `ready_to_send`; ENV-01 confirma |
| R-DOS-02 | Documento sem dono entrar como válido | DR-07: documento sem `pessoa_id` nunca é `accepted_for_dossier` |
| R-DOS-03 | Aprovação condicionada exposta ao cliente | RET-03: `approved condicionado` → cliente recebe apenas "aprovado" |
| R-DOS-04 | Valor de restrição exposto | RET-04 + PROB-DOS-14: nunca informar valor; apenas orientação |
| R-DOS-05 | Parcela de correspondente como simulação | RET-05 + PROB-DOS-15: parcela não é simulação oficial da Caixa |
| R-DOS-06 | Benefício não financiável como renda | IC-05 + PROB-DOS-16: benefício é `nao_financiavel` — observação apenas |
| R-DOS-07 | CNPJ isolado como renda MCMV | AS-03 + PROB-DOS-17: CNPJ contextualiza; financiamento é da PF |
| R-DOS-08 | Retorno do correspondente gerando fala automática errada | RET-01/07: retorno informa pipeline; LLM decide fala |
| R-DOS-09 | Lead reprovado descartado definitivamente | REP-01: reprovado = inelegível por agora; preservar lead |
| R-DOS-10 | Aprovado sem acionar visita | VIS-01: aprovação → `visit_required` sem exceção |

---

## §24 Critérios de aceite da T6.8

| # | Critério | Verificação |
|---|---|---|
| CA-T6.8-01 | `T6_DOSSIE_OPERACIONAL.md` existe com conteúdo completo | Este artefato |
| CA-T6.8-02 | Estrutura conceitual do dossiê declarada (§8) | §8 |
| CA-T6.8-03 | 14 estados do dossiê declarados (§9) | §9 |
| CA-T6.8-04 | Documentos mínimos por perfil/P1/P2/P3 declarados (§10) | §10 |
| CA-T6.8-05 | Documentos recebidos declarados (§11) | §11 |
| CA-T6.8-06 | Documentos pendentes declarados (§12) | §12 |
| CA-T6.8-07 | Associação documento ↔ pessoa ↔ regime/fonte declarada (§13) | §13 |
| CA-T6.8-08 | Informações comerciais do dossiê declaradas (§14) | §14 |
| CA-T6.8-09 | Link do correspondente declarado sem runtime (§15) | §15 |
| CA-T6.8-10 | Segurança mínima do link declarada (§16) | §16 |
| CA-T6.8-11 | Envio ao correspondente declarado sem envio real (§17) | §17 |
| CA-T6.8-12 | Retorno do correspondente declarado sem parser real (§18) | §18 |
| CA-T6.8-13 | Aprovação → visita declarada (§19) | §19 |
| CA-T6.8-14 | Reprovação/pendência grave → orientação declarada (§20) | §20 |
| CA-T6.8-15 | Trilha de auditoria declarada sem logger real (§21) | §21 |
| CA-T6.8-16 | 20 proibições absolutas PROB-DOS-01..20 declaradas | §22 |
| CA-T6.8-17 | Dossiê não cria `reply_text` | §3, §22 PROB-DOS-01 |
| CA-T6.8-18 | Dossiê não cria `fact_*` | §22 PROB-DOS-04 |
| CA-T6.8-19 | Dossiê não cria `current_phase` | §22 PROB-DOS-05 |
| CA-T6.8-20 | Zero runtime implementado; zero link real; zero envio real | §2 — PR declarativa |
| CA-T6.8-21 | Próxima PR autorizada é PR-T6.9 | §26 |

---

## §25 Provas obrigatórias

| Prova | Descrição | Verificável em |
|---|---|---|
| P-T6.8-01 | `T6_DOSSIE_OPERACIONAL.md` criado com §1–§27 + Bloco E | `git diff --stat` |
| P-T6.8-02 | Zero `reply_text` declarado como output do dossiê | §3, §22 PROB-DOS-01 |
| P-T6.8-03 | Zero `fact_*` criado ou alterado | §22 PROB-DOS-04 |
| P-T6.8-04 | Zero `current_phase` criado ou alterado | §22 PROB-DOS-05 |
| P-T6.8-05 | Zero `src/` tocado | `git diff --name-only` |
| P-T6.8-06 | Zero dossiê real, link real, envio real, parser real, notificação real | `git diff --name-only` |
| P-T6.8-07 | Conformidade A00-ADENDO-01: `reply_text` é exclusivo do LLM | §3, §22 |
| P-T6.8-08 | Conformidade A00-ADENDO-02: multimodal sob mesma governança T1–T5 | §4..§7 |
| P-T6.8-09 | PR-T6.7 (#132) confirmada merged antes desta PR | `gh pr list --state merged` |
| P-T6.8-10 | Live files atualizados: STATUS, LATEST, _INDEX, CONTRATO_T6 | `git diff --stat` |

---

## §26 Próxima PR autorizada

**PR-T6.9 — Suite de testes/sandbox multicanal**

Artefato: `schema/implantation/T6_SUITE_TESTES_MULTICANAL.md`

Escopo: cenários declarativos completos de validação da governança multicanal: texto puro,
texto+imagem, PDF, áudio, mídia inválida, docs incompletos, cliente some, reenvio, aprovado→visita,
reprovado→orientação, correspondente retorna. Mínimo 11 cenários.

Dependência: PR-T6.8 mergeada (esta PR).

---

## §27 Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T6_DOSSIE_OPERACIONAL.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T6.8 encerrada; T6 em execução; PR-T6.9 desbloqueada
Próxima PR autorizada:                 PR-T6.9 — Suite de testes/sandbox multicanal
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | Regra-mãe declarada: dossiê organiza, não decide | §3 |
| 2 | Relação com T5 documentação/visita/handoff declarada | §4 |
| 3 | Relação com T6.3 anexos/documentos declarada | §5 |
| 4 | Relação com T6.4 imagem/PDF declarada | §6 |
| 5 | Relação com T6.7 adapter Meta/WhatsApp declarada | §7 |
| 6 | Estrutura conceitual DossieOperacional declarada (21 campos/blocos) | §8 |
| 7 | 14 estados do dossiê com transições e regras DS-01..08 | §9 |
| 8 | Documentos mínimos por perfil/P1/P2/P3 (§10.1..§10.7) | §10 |
| 9 | Regras de documentos recebidos DR-01..08 | §11 |
| 10 | Regras de documentos pendentes DP-01..08 | §12 |
| 11 | Associação documento↔pessoa↔regime/fonte AS-01..05 | §13 |
| 12 | 16 campos de informações comerciais com regras IC-01..06 | §14 |
| 13 | Link do correspondente conceitual declarado | §15 |
| 14 | Segurança mínima do link SL-01..10 | §16 |
| 15 | Envio ao correspondente ENV-01..08 | §17 |
| 16 | Retorno do correspondente RET-01..08 (aprovado/reprovado/pendência) | §18 |
| 17 | Aprovação → visita VIS-01..08 (confirmação + notificação Vasques) | §19 |
| 18 | Reprovação/pendência → orientação REP-01..08 | §20 |
| 19 | 17 eventos de trilha de auditoria declarados | §21 |
| 20 | 20 proibições absolutas PROB-DOS-01..20 | §22 |
| 21 | 10 riscos com mitigação R-DOS-01..10 | §23 |
| 22 | 21 critérios de aceite CA-T6.8-01..21 | §24 |
| 23 | 10 provas obrigatórias P-T6.8-01..10 | §25 |
| 24 | Zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime | §22, §25 |
| 25 | Zero link real, envio real, parser real, notificação real, agendamento real | §2, §22 |

### Estado herdado

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual — PR-T6.8 dentro do contrato T6
Última PR relevante: PR-T6.7 (#132) — merged 2026-04-28T21:36:28Z — T6_ADAPTER_META_WHATSAPP.md
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
Objetivo imutável do contrato: Canal sob mesma governança T1–T5; multimodal sem criar cérebro paralelo
Recorte a executar nesta PR: PR-T6.8 — Dossiê operacional e link do correspondente
Item do A01: T6 — Prioridade 7 — Docs, multimodal e superfícies de canal
Estado atual da frente: T6 em execução — PR-T6.8
O que a última PR fechou: Adapter Meta/WhatsApp; inbound/outbound; assinatura; idempotência; dedupe; separação canal/cérebro
O que a última PR NÃO fechou: Dossiê operacional; suite de testes; G6
Por que esta tarefa existe: A01 e contrato T6 §2 item 8 exigem PR-T6.8 após PR-T6.7
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar T6_DOSSIE_OPERACIONAL.md — contrato declarativo do dossiê
Escopo: schema/implantation/T6_DOSSIE_OPERACIONAL.md + live files
Fora de escopo: src/, runtime, dossiê real, link real, envio real, parser real, T1–T5, T6.9–T6.R
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown auxiliar:    N/A — contrato declarativo; legados por PR específica
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

### Estado entregue

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado T6_DOSSIE_OPERACIONAL.md — contrato declarativo do dossiê operacional
O que foi fechado nesta PR: Sub-contrato declarativo do dossiê e link do correspondente
O que continua pendente: PR-T6.9 (suite de testes); PR-T6.R (G6)
O que ainda não foi fechado do contrato ativo: T6.9–T6.R; gate G6; runtime; canal real
Recorte executado do contrato: T6 — PR-T6.8 — dossiê operacional e link do correspondente
Pendência contratual remanescente: PR-T6.9..T6.R
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — PR-T6.9 agora autorizada
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX, CONTRATO_T6
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
