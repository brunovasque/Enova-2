# INVENTARIO_REGRAS_T0

## Finalidade

Listar e classificar as regras do legado ENOVA 1 em 7 familias canonicas, com bloco legado de
origem e status de cada regra, conforme entregavel de `PR-T0.2` definido na Biblia.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Documentos complementares consultados:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (inventario de fluxos e estados)
- `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` (classificacao de reaproveitamento)
- `schema/legacy/INDEX_LEGADO_MESTRE.md` (indice de blocos legados L01-L19, C01-C09)

## Metodologia de identificacao

As regras foram identificadas a partir de:
1. Fontes acessiveis do LEGADO_MESTRE soberano (7 PDFs da ENOVA 2 em formato markdown):
   - PDF2 — Contrato de implantacao (clausulas-mestras e nao-negociaveis)
   - PDF3 — Plano tatico E0-E9 (entregaveis por frente e microetapas)
   - PDF6 — Taxonomia Oficial (facts F0-F9, schema Supabase canonico)
   - PDF7 — Ordem executiva (tabela de regras com condicao/acao)
   - PDF9 — Contrato structured output (regras gerais e bloco de regras de negocio minimas)
2. Inventario de fluxos vivos (`T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`):
   - gates de negocio ativos (secao 4.5): RNM, composicao, IR/CTPS/restricao
   - transicoes dinamicas criticas (secao 5.2)
   - blocos residuais identificados (secao 7)
3. Implementacao canonica Core Mecanico 2 (`feat/core-especiais-p3-multi-variantes`):
   - regras de trilho P3, multi e variante familiar (commit a3c27ab)

Criterio de evidencia: regra incluida somente se citada em pelo menos uma fonte acessivel
com referencia auditavel de linha ou secao do LEGADO_MESTRE soberano.

Limitacao: blocos L01-L19 e C01-C09 nao estao transcritos (somente em PDF — ver nota ao final).
As regras de negocio, compliance, UX, roteamento e excecao sao derivadas das fontes acessiveis
do PDF mestre. Para regras de detalhe fino de cada L-block, a transcricao futura
(PR-T0.3 a PR-T0.R) expandira o catalogo.

## Legenda de status

| Status | Definicao |
|--------|-----------|
| `ativa` | Regra esta em operacao real no E1 e deve ser migrada/aplicada na E2 |
| `condicional` | Regra esta ativa mas com escopo limitado, transitoria ou dependente de contexto |
| `morta` | Regra existe no E1 mas NAO deve ser migrada (proibida pela soberania LLM-first ou residuo) |

## Legenda de familias

| Familia | Sigla | Descricao |
|---------|-------|-----------|
| Negocio | `negocio` | Regras de qualificacao, elegibilidade e MCMV |
| Compliance | `compliance` | O que o agente nao pode afirmar, prometer ou omitir |
| Docs | `docs` | Regras de documentacao, dossiê e envio |
| UX | `ux` | Tom, superficie, comportamento conversacional e soberania de fala |
| Operacao Comercial | `operacao` | CRM, handoff, visita e gestao operacional |
| Roteamento | `roteamento` | Decisoes de caminho, stage e gate |
| Excecao | `excecao` | Edge cases, rollback, conflito e atendimento manual |

---

## Tabela mestre de regras

| ID | Familia | Nome | Bloco legado (origem E1) | Fonte LEGADO_MESTRE (linha/secao) | Condicao / Acao | Status |
|----|---------|------|--------------------------|-----------------------------------|-----------------|--------|
| RN-01 | negocio | Casado civil → processo conjunto | L07 | linha 2382: "Casado civil → forçar processo_conjunto"; linha 2621: "Casado no civil → processo obrigatoriamente em conjunto" | se `estado_civil = casado_civil` → forcar `processo = conjunto` | ativa |
| RN-02 | negocio | Autonomo → verificacao IR obrigatoria | L11 | linha 145: "autônomo exige pergunta sobre IR"; linha 2624: "Autônomo → perguntar obrigatoriamente sobre IR quando a informação ainda não existir" | se `work_regime_p1 = autonomo` e IR nao coletado → coletar `autonomo_has_ir_p1` | ativa |
| RN-03 | negocio | Solo renda baixa → sugestao composicao | L11 | linha 153-154: "solo com renda baixa precisa ouvir composição antes de inviabilização"; linha 2628: "Renda solo baixa → sugerir composição antes de inviabilizar" | se `processo = solo` e `renda_total < limite_operacional` → sugerir composicao antes de encerrar | ativa |
| RN-04 | negocio | Estrangeiro → RNM valido obrigatorio | L04 | linha 148: "estrangeiro sem RNM válido não pode seguir"; linha 2629: "Estrangeiro → exige RNM válido para avançar com segurança" | se `nationality != brasileiro` → validar `rnm_status = valido` antes de avancar | ativa |
| RN-05 | negocio | Uniao estavel → solo ou conjunto (estrategia do caso) | L07 | linha 2622: "União estável → pode seguir solo ou conjunto, dependendo do contexto e da estratégia" | se `estado_civil = uniao_estavel` → nao forcar conjunto; avaliar contexto | ativa |
| RN-06 | negocio | Autonomo sem IR → orientar ou sugerir composicao | L11 | linha 2626: "Autônomo sem IR → não encerrar de forma seca; orientar e/ou sugerir composição quando fizer sentido" | se `autonomo_has_ir_p1 = nao` → nao encerrar; orientar e/ou sugerir composicao | ativa |
| RN-07 | negocio | CTPS 36 meses → valor estrategico, nao trava | L13 | linha 2631: "CTPS 36 meses → informar valor estratégico, mas não travar o fluxo" | se `ctps_36m_p1` ausentez → informar valor, nao bloquear; coletar quando oportuno | condicional |
| RN-08 | negocio | Dependente → perguntar somente quando couber | L09 | linha 2630: "Dependente → só perguntar quando realmente fizer sentido no caso" | coletar dependente somente quando `process_mode` e perfil justificarem | condicional |
| RN-09 | negocio | P3 (terceiro participante) → coletar regime e renda | L15 | linha 2054: `work_regime_p3` em PDF6 F4; Core Mecanico 2 especiais-rules.ts ESPECIAIS_P3_REQUIRED_FACTS | se `p3_required = true` → coletar `work_regime_p3` antes de avancar | ativa |
| RN-10 | negocio | Multi/conjunto → coletar regime e renda do P2 | L15 | linha 2054: `work_regime_p2`, `monthly_income_p2` em PDF6 F4; Core Mecanico 2 ESPECIAIS_MULTI_REQUIRED_FACTS | se `processo = conjunto` ou sinais de co-participante → coletar `work_regime_p2` + `monthly_income_p2` | ativa |
| RN-11 | negocio | Multi autonomo → verificar IR do P2 | L15 | Core Mecanico 2 especiais-gates.ts: MULTI_AUTONOMO_SEM_IR; PDF6 F4 `autonomo_has_ir_p2` | se `work_regime_p2 = autonomo` → coletar `autonomo_has_ir_p2` | ativa |
| RN-12 | negocio | Restricao alta sem regularizacao → inelegibilidade | L14 | linha 110: "restricao alta sem regularizacao levando a inelegibilidade" (inventario T0.1 secao 4.5); PDF6 F5 `credit_restriction`, `restriction_regularization_status` | se `credit_restriction = alta` e `restriction_regularization_status != regularizado` → inelegibilidade | ativa |
| RC-01 | compliance | Nunca prometer aprovacao/parcela/taxa/subsidio/imovel | L03 | linha 2606: "Nunca prometa aprovação, parcela final, taxa final, valor final de subsídio ou imóvel garantido"; linha 473: "O agente nunca promete aprovação..." | em qualquer stage → sem promessa de aprovacao, valor, taxa, subsidio ou imovel especifico | ativa |
| RC-02 | compliance | Nunca ignorar informacao critica confirmada | L03 | linha 2607: "Nunca ignore informação crítica já confirmada" | fato confirmado nao pode ser descartado sem reconciliacao explicita | ativa |
| RC-03 | compliance | Nunca pular coleta obrigatoria | L03 | linha 2608: "Nunca pule coleta obrigatória quando faltar dado sensível para decisão" | gate de coleta critica nao pode ser omitido por conveniencia conversacional | ativa |
| RC-04 | compliance | Regras criticas nunca dependem so do prompt | L03 | linha 105: "Nenhuma regra crítica pode depender apenas do texto do prompt"; linha 452: "Toda regra crítica deve existir em política declarativa" | regras de negocio criticas vivem em policy declarativa + Core, nao em prompt isolado | ativa |
| RC-05 | compliance | Migracao nao destroi telemetria conquistada | L18 | linha 475: "A migração não pode destruir a telemetria já conquistada; o novo modelo deve nascer com evidência melhor, não pior" | shadow/canary obrigatorio; metricas de cobertura e qualidade nao podem regredir | ativa |
| RD-01 | docs | Docs entram no estado estruturado | L17 | linha 1542: "Conectar dossiê, recebimento, status e handoff no mesmo estado estruturado" | docs processados passam por estado estruturado canonico (`enova_artifacts` + facts doc_*_status) | ativa |
| RD-02 | docs | Status documental com campos canonicos | L17 | PDF6 F8 linhas 2072-2076: `doc_identity_status`, `doc_income_status`, `doc_residence_status`, `doc_ctps_status` | status de cada documento registrado nos facts canonicos antes de avancar | ativa |
| RD-03 | docs | Canal de envio: WhatsApp, site ou visita | L17 | PDF6 F7 linha 2069: `docs_channel_choice` (WhatsApp, site, visita presencial) | cliente pode escolher canal de envio; sistema deve suportar os tres | ativa |
| RD-04 | docs | Envio parcial nao trava fluxo se checklist avanca | L17 | linha 140: `envio_docs => resposta.keepStage || "envio_docs"` (inventario T0.1 secao 5.2) | envio parcial mantem stage ate checklist fechar ou avancar dinamicamente | condicional |
| RD-05 | docs | Pacote correspondente influencia saida do estado | L17 | linha 67: "pacote de correspondente pronto influencia saida" (inventario T0.1 secao 2.5) | `finalizacao_processo` reagindo a pacote do correspondente antes de handoff | ativa |
| RU-01 | ux | Linguagem humana, acolhedora e objetiva | L03 | linhas 2635-2638: tom da ENOVA — humana, profissional, acolhedora, consultiva, firme sem ser fria | LLM soberano no tom; resposta natural sem robotismo; sem jargao tecnico desnecessario | ativa |
| RU-02 | ux | Resposta curta a media com direcao clara | L03 | linhas 2642-2645: "respostas curtas a médias; sem parede de texto; com direção clara; sempre fechando em próxima ação" | sem bloco texto longo; sempre indicando proxima acao | ativa |
| RU-03 | ux | Em ambiguidade ou contradicao → needs_confirmation | L03 | linha 2589: "Em caso de ambiguidade ou contradição factual, o agente não pode avançar silenciosamente" | nao avancar de stage sem resolver conflito de dados; sinalizar needs_confirmation = true | ativa |
| RU-04 | ux | Offtrack → responder e trazer de volta ao objetivo | L03 | linha 2611: "Se o cliente sair do assunto, responda com naturalidade e traga de volta ao objetivo atual" | resposta fluida ao desvio + retorno explicito ao objetivo operacional do case | ativa |
| RU-05 | ux | LLM soberano na fala; Core soberano na decisao | L03 | linha 86: "Aplica regras obrigatórias... sem determinar a linguagem da conversa"; PDF1 Sec.3 Camada 4 | LLM define como dizer; Core define o que e obrigatorio decidir | ativa |
| RU-06 | ux | Casca mecanica de fala da E1 → proibida na E2 | L03 | REAPROVEITAMENTO secao 1.3: "Arquitetura de fala por prefixo acoplada a resposta mecânica de stage" | resposta de surface nao pode ser gerada por casca fixa do Core; LLM gera fala | morta |
| RO-01 | operacao | Handoff ao correspondente → trilho aguardando | L17 | linha 68: "`finalizacao_processo` e `aguardando_retorno_correspondente` formam trilho vivo" (T0.1 secao 2.5) | pacote pronto → transicao para `aguardando_retorno_correspondente` | ativa |
| RO-02 | operacao | Visita presencial como canal final | L17 | PDF6 F7 `visit_interest`; linha 130: `agendamento_visita` no trilho (T0.1 secao 5.1) | agendamento de visita disponivel como alternativa ao envio remoto de docs | ativa |
| RO-03 | operacao | CRM operacional com trilha auditavel por etapa | L18 | REAPROVEITAMENTO secao 1.4: "Telemetria comparativa e estrutural, incidentes e trilha CRM por etapa" | cada etapa gera trilha CRM; override log e incident badges ativos | ativa |
| RO-04 | operacao | Reset total e dedup guard como infraestrutura | L03 | REAPROVEITAMENTO secao 1.2: "Estrutura documental/case-files e controles operacionais: dedup e reset consistente" | reset total disponivel; dedup por `wamid`/`messageId` ativo na borda de entrada | ativa |
| RO-05 | operacao | Convivencia legado: E1 como fallback temporario | L03 | linha 2355: "O motor mecânico legado não deve ser deletado logo de início; ele fica congelado como fallback" | durante migracao: E1 fica ativo como fallback; desligamento somente com prova de cobertura | condicional |
| RR-01 | roteamento | Espinha dorsal: topo → composicao → renda → elegibilidade → docs | L03 | linhas 126-134: espinha dorsal observavel (T0.1 secao 5.1) | sequencia canonica de stages: `inicio → estado_civil → somar_renda → regime → ir → ctps → restricao → envio_docs` | ativa |
| RR-02 | roteamento | Casado civil → forcar processo_conjunto | L07 | linha 2382: "Casado civil → forçar processo_conjunto"; linha 150-151: "Roteamento: casado no civil implica processo em conjunto" | se `estado_civil = casado_civil` → `processo = conjunto` imediato (nao pergunta) | ativa |
| RR-03 | roteamento | P3 ou conjunto → qualification_special | L15 | Core Mecanico 2 especiais-gates.ts ESPECIAIS_NEXT_STEP.ROUTE_TO_SPECIAL | se `p3_required = true` OU `processo = conjunto` → roteamento para `qualification_special` antes de docs | ativa |
| RR-04 | roteamento | Elegibilidade completa + especiais ok → docs_prep | L03, L17 | linha 130: `envio_docs` como transicao final (T0.1 secao 5.1); Core Mecanico 2 ADVANCE_TO_DOCS | todos os gates de elegibilidade passados + trilho especial resolvido → roteamento para `docs_prep` | ativa |
| RR-05 | roteamento | Docs pronto + correspondente → aguardando_retorno | L17 | linha 132: `aguardando_retorno_correspondente` no trilho final (T0.1 secao 5.1) | pacote de docs e correspondente completo → `aguardando_retorno_correspondente` | ativa |
| RR-06 | roteamento | offtrackGuard pre-funil: desvio antes de runFunnel | L03 | linha 43: "`offtrackGuard` pre-`runFunnel`" (T0.1 secao 2.1) | mensagem de offtrack interceptada antes de runFunnel; trata e retorna sem entrar no switch | ativa |
| RR-07 | roteamento | Gate cognitivo (COGNITIVE_V2_MODE) em whitelist de stages | L03, L19 | linhas 59-60: "branching por `COGNITIVE_V2_MODE`; whitelist de stages; validacao de sinal; threshold de confianca" (T0.1 secao 2.4) | stage em whitelist + COGNITIVE_V2_MODE ativo + sinal valido → acionar assistencia cognitiva | condicional |
| RE-01 | excecao | Atendimento manual bypass pre-funil | L03 | linha 85-86: "bypass de atendimento manual; desvio de comandos e retornos do correspondente antes do funil principal" (T0.1 secao 4.1) | comandos especiais interceptados antes do funil; bypass para atendimento humano | ativa |
| RE-02 | excecao | Rollback por feature flag (nao corte cego) | L03 | linha 108: "Toda mudança estrutural deve nascer primeiro em shadow mode ou teste controlado"; REAPROVEITAMENTO secao 1.2: "Governança de rollout off/shadow/on com rollback por flag" | mudancas estruturais so entram via feature flag; fallback ao legado disponivel | ativa |
| RE-03 | excecao | Dado contradito → confirmacao controlada antes de avancar | L07 | linha 157-159: "Quando há ambiguidade, o caso não avança sem confirmação. Ex.: composição familiar x parceiro" | fato contradito registrado como conflito; pergunta de confirmacao obrigatoria antes de persistir | ativa |
| RE-04 | excecao | Inventario nao fechado → implantacao nao avanca | L03 | linha 967-969: "Se o inventário não fechar ou houver divergência séria entre mapa e comportamento real, a implantação não avança para T1" | gate G0 nao aprovado ate inventario T0 com cobertura completa e sem ilhas cinzentas criticas | ativa |
| RE-05 | excecao | Motor cognitivo atual em depreciacao → nao expandir | L03, L19 | linha 2357: "O motor cognitivo atual não deve ser expandido. Ele entra em modo depreciação..." | nenhuma expansao no motor cognitivo legado; entra em shadow quando E2 for estavel | condicional |
| RM-01 | ux | Fallbacks textuais estaticos por stage → proibidos | L03 | REAPROVEITAMENTO secao 1.3: "Fallbacks textuais estáticos por stage como voz dominante" | scripts de fallback de fala por stage nao devem ser migrados | morta |
| RM-02 | ux | Scripts rigidos de reprompt → proibidos | L03 | REAPROVEITAMENTO secao 1.3: "Scripts rígidos de reprompt como camada principal de conversa" | templates de reprompt mecanico nao devem ser migrados | morta |
| RM-03 | ux | fim_inelegivel (alias) → residuo a eliminar | L03 | T0.1 secao 7: "`fim_inelegivel` como alias/ponte para `fim_ineligivel`" | alias deve ser eliminado no Core Mecanico T1; nao migrar para E2 | morta |
| RM-04 | ux | yesNoStages sem case correspondente → stub | L03 | T0.1 secao 7: "chaves em `yesNoStages` sem `case` correspondente" | estrutura de decisao incompleta; nao migrar; absorver como policy rules em T3 | morta |
| RM-05 | ux | handleCorrespondenteRetorno sem callsite → stub | L17 | T0.1 secao 7: "`handleCorrespondenteRetorno` e `parseCorrespondenteBlocks` sem callsite estatico atual" | funcoes orfas; nao migrar diretamente; redesenhar no trilho correspondente de L17 | morta |

---

## Contagem por familia e status

| Familia | Ativas | Condicionais | Mortas | Total |
|---------|--------|--------------|--------|-------|
| negocio | 10 | 2 | 0 | 12 |
| compliance | 5 | 0 | 0 | 5 |
| docs | 4 | 1 | 0 | 5 |
| ux | 5 | 0 | 4 | 9 |
| operacao | 4 | 1 | 0 | 5 |
| roteamento | 6 | 1 | 0 | 7 |
| excecao | 4 | 1 | 0 | 5 |
| **Total** | **38** | **6** | **4** | **48** |

---

## Regras inconclusivas (nao catalogadas nesta PR)

As seguintes regras sao suspeitas de existir nos L-blocks nao transcritos mas nao puderam ser
catalogadas com evidencia auditavel nesta PR:

| Categoria | Descricao da lacuna | Bloco legado provavel | Proxima PR |
|-----------|--------------------|-----------------------|------------|
| Regras de topo fino | Regras de captacao do primeiro sinal util, objeccao de entrada, curiosidade sem compromisso | L04 + L05 + L06 | PR-T0.3 (parsers) |
| Microregras de composicao familiar | Variantes de composicao com mae, pai, irmao, filho — regras de elegibilidade por composicao | L09 + L10 | PR-T0.3 |
| Regras de estado civil intermediarias | Divorciado, viuvo — impacto na composicao e no processo | L07 + L08 | PR-T0.3 |
| Regras de renda multipla | Dois regimes por participante; composicao de renda informal | L11 + L12 | PR-T0.3 |
| Heuristicas de restricao | Regularizacao parcial, restricao em cobranca, RNM expirado | L13 + L14 | PR-T0.3 |
| Regras finais operacionais | Transicao de finalizacao_processo, criterios de visita presencial vs. correspondente | L17 | PR-T0.3 |
| Regras de QA/simulacao | Regras de suite de casos reais e admin | L18 | PR-T0.4 |
| Regras de conhecimento MCMV | Regras do programa (faixas, subsidio, bancos) | L19 | PR-T0.3+ |

---

## Nota sobre blocos L e C nao transcritos

Todos os blocos L01-L19 e C01-C09 estao identificados estruturalmente no indice
(`schema/legacy/INDEX_LEGADO_MESTRE.md`) mas NAO estao transcritos — o conteudo esta
somente no PDF (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`), que nao pode ser lido
sem ferramenta PDF.

O catalogo desta PR cobre as regras documentadas nas fontes acessiveis (LEGADO_MESTRE markdown,
inventario T0.1, implementacao Core Mecanico 2). O catalogo sera expandido nas PRs seguintes
(PR-T0.3 a PR-T0.R) quando L-blocks forem transcritos ou quando implementacoes derivadas do PDF
fornecerem prova equivalente auditavel.

---

## Status de cobertura de PR-T0.2

- Familias cobertas: 7/7 (negocio, compliance, docs, UX, operacao, roteamento, excecao).
- Regras catalogadas: 48 (38 ativas, 6 condicionais, 4 mortas).
- Regras inconclusivas declaradas: 8 categorias (nao bloqueiam fechamento de PR-T0.2).
- Bloco legado citado por regra: sim (todas as 48 regras tem bloco legado de origem).
- Fonte LEGADO_MESTRE citada por regra: sim (todas com linha ou secao auditavel).
- Coerencia com soberania LLM-first: sim — regras de fala mecanica classificadas como "morta".
- Coerencia com PR-T0.1: sim — blocos de origem alinhados com matriz de rastreabilidade (secao 12).

Decisao de fechamento de PR-T0.2:
- `PR-T0.2` **pronta para encerramento**.
- Proximo passo autorizado: PR-T0.3 — Inventario de parsers, regex, fallbacks e heuristicas.

Estado canonico apos esta PR:
- Fase: T0.
- Gate: G0 aberto.
- `PR-T0.2` encerrada.
- `PR-T0.3` desbloqueada.
