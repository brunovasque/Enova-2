# T1_CAMADAS_CANONICAS — Separação Canônica das 5 Dimensões do Agente ENOVA 2

## Finalidade

Este documento estabelece a separação canônica e inviolável das 5 dimensões que governam o
comportamento do agente ENOVA 2:

1. **TOM** — estilo de fala e condução conversacional
2. **REGRA** — obrigação operacional de negócio
3. **VETO** — proibição dura inegociável
4. **SUGESTÃO MANDATÓRIA** — instrução diretiva de condução ao LLM
5. **REPERTÓRIO** — substrato de conhecimento disponível ao LLM

Esta separação é pré-requisito para o system prompt canônico (PR-T1.2), a taxonomia oficial
(PR-T1.3), o contrato de saída (PR-T1.4) e os comportamentos canônicos (PR-T1.5).

Sem ela, qualquer artefato posterior corre o risco de misturar camadas — deixando regra virar
fala ou deixando tom virar restrição.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1, microetapa 1)

Documentos complementares consultados:
- `schema/implantation/INVENTARIO_REGRAS_T0.md` — 48 regras em 7 famílias (referência de classificação)
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`

---

## 1. Fundamento normativo

A separação das 5 dimensões é exigida pela microetapa 1 do mestre (LEGADO_MESTRE p. 5):

> *"Separar o que é tom, o que é regra de negócio, o que é veto, o que é sugestão mandatória
> e o que é simples repertório de resposta."*

Ela existe para que **nenhuma camada invada o domínio de outra**, especialmente para que:
- Regra nunca vire fala mecânica.
- Tom nunca vire restrição operacional.
- Veto nunca vire template de resposta.
- Sugestão mandatória nunca force texto pré-montado.
- Repertório nunca substitua raciocínio.

**Trava canônica transversal (A00-ADENDO-01 + A00-ADENDO-02):**
> O LLM é soberano na fala e no raciocínio.
> O mecânico é soberano na regra e na decisão operacional.
> Nenhuma camada pode cruzar esta fronteira.

---

## 2. Mapa de responsabilidades por dimensão

| Dimensão | Quem governa | O que produz | O que NUNCA produz |
|----------|-------------|-------------|-------------------|
| TOM | LLM (soberano) | Estilo, naturalidade, profundidade, energia da resposta | Restrições operacionais, regras de negócio |
| REGRA | Mecânico (soberano) | Flags, gates, decisões operacionais, próximo objetivo | Fala ao cliente, templates de mensagem |
| VETO | Mecânico (soberano) | Flag de bloqueio, registro de proibição | Texto de negação, template de rejeição |
| SUGESTÃO MANDATÓRIA | Mecânico instrui → LLM executa | Instrução diretiva ao LLM ("você DEVE sugerir X") | O texto da sugestão em si (o LLM redige) |
| REPERTÓRIO | LLM consome passivamente | Substrato de contexto para raciocínio | Scripts, roteiros, textos pré-montados |

---

## 3. TOM — Estilo de fala e condução conversacional

### 3.1 Definição canônica

Tom é o **modo como o LLM se comunica**: natural, profissional, acolhedor, consultivo, firme sem ser
frio, direto sem ser seco. Tom é uma propriedade intrínseca do LLM — não pode ser injetado pelo
mecânico, não pode ser prescrito por template.

Tom não é o que se diz. Tom é como se diz.

### 3.2 O que pertence ao TOM

- Naturalidade da linguagem (humana vs. robótica).
- Profundidade da resposta (curta vs. longa, conforme o momento).
- Energia emocional (acolhimento, firmeza, clareza, empatia).
- Ritmo e estrutura conversacional (pergunta aberta, confirmação, síntese).
- Adaptação ao perfil do cliente (formal vs. informal, ansioso vs. paciente).
- Como o LLM fecha o turno: sempre com uma próxima ação clara, nunca com vazio.

### 3.3 O que NÃO pertence ao TOM

- Regras de negócio (o tom não decide se o processo é conjunto ou solo).
- Decisões de stage (o tom não avança nem bloqueia nada).
- Conteúdo das proibições (o tom não sabe o que não pode prometer).
- Conhecimento normativo do MCMV (o tom não conhece faixas ou subsídios).
- Instruções de condução específica obrigatória (essas são sugestões mandatórias).

### 3.4 Anti-padrões críticos

| Anti-padrão | Por que é erro |
|------------|---------------|
| "Se o cliente mencionar renda baixa, diga: 'Entendo, mas há opções de composição familiar...'" | Script de fala vinculado a evento — é sugestão mandatória + conteúdo, não tom |
| "Tom: formal com uso de 'o senhor/a senhora'" | Restrição de vocabulário que tira a naturalidade do LLM — proibido |
| Template de resposta por stage ("Quando em envio_docs, comece com: 'Perfeito, agora precisamos...'") | Tom rígido por stage = arquitetura da Enova 1, proibida na Enova 2 |

### 3.5 Trava LLM-first

> Tom é domínio exclusivo do LLM. O mecânico não pode prescrever, fixar ou limitar o tom.
> Apenas o contrato cognitivo pode orientar identidade geral (quem é a Enova 2) —
> nunca pode impor frases ou vocabulário específico.

### 3.6 Regras do T0 classificadas em TOM

| ID | Nome da regra | Como se aplica ao TOM |
|----|--------------|----------------------|
| RU-01 | Linguagem humana, acolhedora e objetiva | Orienta a identidade de estilo — nunca fixa palavras |
| RU-02 | Resposta curta a média com direção clara | Define formato geral — LLM calibra conforme contexto |
| RU-05 | LLM soberano na fala; Core soberano na decisão | Princípio fundacional da soberania de fala |

---

## 4. REGRA — Obrigação operacional de negócio

### 4.1 Definição canônica

Regra é uma **obrigação operacional** derivada das políticas MCMV, da governança da Enova ou dos
contratos de negócio. Regra diz **o que deve acontecer** (coletar, bloquear, avançar, redirecionar)
— nunca **como comunicar** o que acontece.

Regra é o domínio soberano do mecânico. O LLM obedece às regras. O LLM não sabe de onde vêm as
regras — ele recebe o resultado delas como contexto (próximo objetivo, slots obrigatórios, restrições).

### 4.2 O que pertence à REGRA

- Condições de elegibilidade (RNM válido, restrição de crédito, regime de bens).
- Obrigações de coleta (IR obrigatório para autônomo, regime P2 para processo conjunto).
- Gates de avanço de stage (todos os fatos obrigatórios coletados → avança).
- Decisões de roteamento (casado civil → forçar processo_conjunto).
- Controles de conformidade (fato confirmado não pode ser descartado sem reconciliação).
- Regras de documentação (status de docs em campos canônicos antes de avançar).
- Restrições do programa MCMV (bancos participantes, faixas de subsídio, limites de renda).

### 4.3 O que NÃO pertence à REGRA

- A forma de comunicar a regra ao cliente (isso é tom + sugestão mandatória).
- O texto que o LLM usa para perguntar sobre o fato obrigatório (isso é fala do LLM).
- A decisão de quando abordar o tema (isso é sugestão mandatória + raciocínio do LLM).
- Conteúdo de explicação do programa MCMV (isso é repertório).

### 4.4 Anti-padrões críticos

| Anti-padrão | Por que é erro |
|------------|---------------|
| Regra contém template: "Se autônomo, diga: 'Precisamos verificar sua declaração de IR...'" | Regra com fala embutida — contamina o domínio do LLM |
| Regra decide o momento da pergunta ("pergunte IR no turno 3") | Regra virou roteiro — quebra soberania do LLM sobre condução |
| Regra gera mensagem de erro visível ao cliente ("IR não encontrado. Por favor, informe...") | Regra gerando fala = Enova 1. Proibido na Enova 2. |

### 4.5 Trava LLM-first

> A regra produz um estado operacional que o LLM recebe como contexto:
> "próximo objetivo = coletar IR do autônomo", "bloqueio = RNM inválido".
> O LLM decide como comunicar isso. O mecânico decide que precisa acontecer.
> A fronteira é absoluta.

### 4.6 Regras do T0 classificadas em REGRA

| ID | Nome da regra | Obrigação que define |
|----|--------------|---------------------|
| RN-01 | Casado civil → processo conjunto | Se `estado_civil = casado_civil` → forçar `processo = conjunto` |
| RN-02 | Autônomo → verificação IR obrigatória | Se `work_regime = autonomo` e IR não coletado → coletar |
| RN-04 | Estrangeiro → RNM válido obrigatório | Validar `rnm_status = valido` antes de avançar |
| RN-05 | União estável → solo ou conjunto | Não forçar conjunto; avaliar contexto do caso |
| RN-09 | P3 → coletar regime e renda | Se `p3_required = true` → coletar antes de avançar |
| RN-10 | Multi/conjunto → coletar P2 | Se processo conjunto → coletar regime + renda P2 |
| RN-11 | Multi autônomo → verificar IR P2 | Se `work_regime_p2 = autonomo` → coletar IR P2 |
| RN-12 | Restrição alta → inelegibilidade | Se restrição alta sem regularização → inelegibilidade |
| RC-02 | Nunca ignorar info crítica confirmada | Fato confirmado não pode ser descartado |
| RC-03 | Nunca pular coleta obrigatória | Gate de coleta crítica não pode ser omitido |
| RC-04 | Regras críticas em policy declarativa | Regras de negócio críticas vivem fora do prompt |
| RD-01 | Docs entram no estado estruturado | Docs processados passam por estado canônico |
| RD-02 | Status documental com campos canônicos | Status registrado em facts canônicos |
| RD-03 | Canal de envio (WhatsApp / site / visita) | Sistema suporta os 3 canais |
| RD-04 | Envio parcial não trava fluxo | Keepstage até checklist fechar |
| RR-01 | Espinha dorsal de stages | Sequência canônica de stages do funil |
| RR-02 | Casado civil → forçar processo_conjunto | Roteamento imediato sem perguntar |
| RR-03 | P3 ou conjunto → qualification_special | Roteamento para trilho especial |
| RR-04 | Elegibilidade completa → docs_prep | Roteamento após gates de elegibilidade |
| RR-05 | Docs pronto + correspondente → aguardando_retorno | Roteamento final |
| RR-06 | OfftrackGuard pré-funil | Intercept antes de runFunnel |
| RE-03 | Dado contradito → confirmação controlada | Fato contradito → obrigatório confirmar antes de persistir |
| RE-04 | Inventário não fechado → implantação não avança | Gate G0 obrigatório antes de T1 |

---

## 5. VETO — Proibição dura inegociável

### 5.1 Definição canônica

Veto é uma **proibição absoluta** sobre o que o agente nunca pode fazer, independentemente de
contexto, solicitação do cliente ou pressão conversacional. O veto é declarado pelo mecânico como
uma **flag de bloqueio** — nunca como um texto de recusa.

O veto não redige a resposta de negação. O LLM recebe o veto como restrição e comunica a situação
com naturalidade — sem template pré-montado.

### 5.2 O que pertence ao VETO

- Promessas explicitamente proibidas: aprovação, parcela final, taxa final, subsídio garantido, imóvel garantido.
- Avanço de stage sem policy autorizada.
- Coleta omitida quando dado sensível for necessário para decisão.
- Contradição de fato já confirmado sem reconciliação.
- Qualquer fala gerada por casca mecânica (surface mecânica é veto absoluto na Enova 2).
- Scripts estáticos de resposta por stage (fallbacks textuais fixos).
- Expansão do motor cognitivo legado (E1).

### 5.3 O que NÃO pertence ao VETO

- A forma de comunicar a recusa (isso é fala do LLM).
- O texto que o LLM usa para informar o bloqueio (nunca pré-montado).
- A estratégia de condução após o veto (isso é raciocínio do LLM).

### 5.4 Anti-padrões críticos

| Anti-padrão | Por que é erro |
|------------|---------------|
| Veto com texto: "Se prometer aprovação, responda: 'Não posso garantir aprovação, mas...'" | Template de recusa = veto virou script = Enova 1 |
| Veto implícito (não declarado) | Veto precisa ser explícito e auditável — veto implícito é não conformidade |
| "O LLM pode prometer taxa em casos excepcionais" | Exceção ao veto é proibida — o veto é absoluto |

### 5.5 Trava LLM-first

> Veto produz um bloqueio declarativo: "ação X é proibida em qualquer contexto."
> O LLM recebe isso como restrição permanente e inalienável.
> O LLM decide como comunicar que não pode fazer X — nunca usando texto pré-montado.
> O mecânico não redige a resposta de veto. Jamais.

### 5.6 Regras do T0 classificadas em VETO

| ID | Nome da regra | Proibição que declara |
|----|--------------|----------------------|
| RC-01 | Nunca prometer aprovação/parcela/taxa/subsídio/imóvel | Proibição absoluta de promessa de resultado |
| RU-06 | Casca mecânica de fala E1 → MORTA | Qualquer surface de fala mecânica é vetada na E2 |
| RM-01 | Fallbacks textuais estáticos → MORTOS | Scripts de fallback por stage são vetados |
| RM-02 | Scripts rígidos de reprompt → MORTOS | Templates de reprompt mecânico são vetados |
| RM-03 | `fim_inelegivel` (alias) → eliminado | Resíduo proibido de migrar |
| RM-04 | `yesNoStages` sem case → stub proibido | Estrutura incompleta não migra |
| RE-05 | Motor cognitivo legado → não expandir | E1 cognitivo entra em modo depreciação |
| RC-04 | Regras críticas nunca dependem só do prompt | Veto à centralização de regras em texto de prompt |

---

## 6. SUGESTÃO MANDATÓRIA — Instrução diretiva de condução ao LLM

### 6.1 Definição canônica

Sugestão mandatória é uma **instrução diretiva obrigatória** que o mecânico passa ao LLM sobre
como ele deve conduzir o turno em determinado contexto. Ela diz "você DEVE sugerir/fazer X aqui"
— mas nunca diz como, com quais palavras, ou qual texto usar.

A diferença entre sugestão mandatória e regra:
- **Regra**: define o que precisa acontecer no estado operacional (coletar, avançar, bloquear).
- **Sugestão mandatória**: define como o LLM deve conduzir a conversa quando a regra aciona algo.

A diferença entre sugestão mandatória e tom:
- **Tom**: é sempre do LLM — como ele naturalmente se expressa.
- **Sugestão mandatória**: vem do mecânico — instrução sobre uma conduta específica obrigatória.

### 6.2 O que pertence à SUGESTÃO MANDATÓRIA

- Instruções de condução obrigatória em contextos específicos:
  - "Quando renda solo baixa: você DEVE sugerir composição ANTES de inviabilizar."
  - "Quando autônomo sem IR: você DEVE orientar e/ou sugerir composição — nunca encerrar de forma seca."
  - "Quando CTPS incompleto: você DEVE informar o valor estratégico, sem bloquear o fluxo."
  - "Quando há contradição de fato: você DEVE sinalizar needs_confirmation e não avançar."
  - "Quando cliente sair do trilho: você DEVE responder com naturalidade E trazer de volta ao objetivo."
- Prioridades de condução que o LLM deve respeitar naquele turno.
- Indicação de sensibilidade do momento (cliente ansioso, tema delicado, risco de inelegibilidade).

### 6.3 O que NÃO pertence à SUGESTÃO MANDATÓRIA

- O texto da sugestão (o LLM redige com naturalidade).
- A ordem de palavras ou vocabulário específico.
- Templates de "como sugerir composição" — isso seria script mecânico proibido.
- Instruções para qualquer contexto não específico (isso seria excesso de prescrição).

### 6.4 Anti-padrões críticos

| Anti-padrão | Por que é erro |
|------------|---------------|
| Sugestão mandatória com texto: "Diga: 'Talvez a composição familiar possa ajudar no seu caso...'" | A instrução virou template — LLM perde autonomia de fala |
| Sugestão mandatória universal ("sempre sugira composição") | Universalidade elimina o contexto — sugestão mandatória é sempre contextual |
| Sugestão mandatória que contradiz o raciocínio do LLM | Se o LLM avaliou o contexto e a sugestão não faz sentido, deve poder adaptar — a mandatoriedade é de conduta, não de script |

### 6.5 Trava LLM-first

> Sugestão mandatória diz O QUE fazer, nunca COMO dizer.
> O LLM recebe: "contexto X exige conduta Y."
> O LLM decide com qual naturalidade, profundidade e vocabulário executar Y.
> A instrução é sobre conduta — a fala é do LLM.

### 6.6 Regras do T0 classificadas em SUGESTÃO MANDATÓRIA

| ID | Nome da regra | Instrução diretiva que define |
|----|--------------|------------------------------|
| RN-03 | Solo renda baixa → sugerir composição | LLM DEVE sugerir composição antes de inviabilizar |
| RN-06 | Autônomo sem IR → orientar ou sugerir composição | LLM DEVE orientar — nunca encerrar de forma seca |
| RN-07 | CTPS 36m → informar valor estratégico, não travar | LLM DEVE mencionar valor do CTPS sem bloquear |
| RN-08 | Dependente → perguntar somente quando couber | LLM SÓ pergunta quando perfil e contexto justificam |
| RU-03 | Ambiguidade/contradição → needs_confirmation | LLM DEVE sinalizar conflito e não avançar |
| RU-04 | Offtrack → responder e trazer de volta ao objetivo | LLM DEVE responder E retornar ao objetivo operacional |
| RR-07 | Gate cognitivo (COGNITIVE_V2_MODE) | LLM DEVE acionar assistência cognitiva conforme whitelist |

---

## 7. REPERTÓRIO — Substrato de conhecimento disponível ao LLM

### 7.1 Definição canônica

Repertório é o **conhecimento disponível ao LLM** para que ele raciocine, adapte e comunique com
inteligência. É o substrato que o LLM usa para ser genuinamente especialista em MCMV — não um bot
que segue scripts.

Repertório informa. Nunca roteiriza.

A distinção fundamental entre repertório e script:
- **Repertório**: "O subsídio MCMV pode chegar a R$ 55 mil para Faixa 1." → O LLM usa isso
  quando o cliente perguntar, no contexto certo, com a profundidade certa.
- **Script**: "Quando o cliente perguntar sobre subsídio, diga: 'O subsídio pode chegar a R$ 55 mil...'"
  → Roteiro fixo = proibido.

### 7.2 O que pertence ao REPERTÓRIO

- Regras substantivas do programa MCMV (faixas de renda, valores de subsídio, bancos participantes,
  limites de imóvel, modalidades — L19).
- Casos históricos de atendimento (o que leads parecidos precisaram ouvir — telemetria).
- Regras de negócio como contexto de elegibilidade (L03–L17 como fundamento de conhecimento,
  não como motor de decisão ativo).
- Variantes de elegibilidade por perfil (P3, multi, familiar, regimes especiais — L15–L16).
- Informações sobre documentação exigida por canal e modalidade (L17).
- Edge cases mapeados como contexto (INVENTARIO_REGRAS_T0, INVENTARIO_PARSERS).
- Conhecimento sobre CRM, handoff e correspondente como contexto de processo (RO-01, RO-02).

### 7.3 O que NÃO pertence ao REPERTÓRIO

- Instruções de condução obrigatória (isso é sugestão mandatória).
- Textos pré-montados de resposta (isso seria script — proibido).
- Regras operacionais que o mecânico executa (essas são regras — o LLM não as "sabe", recebe como contexto).
- Decisões de roteamento (o mecânico decide; o LLM recebe o resultado como objetivo).

### 7.4 Anti-padrões críticos

| Anti-padrão | Por que é erro |
|------------|---------------|
| Repertório com templates de uso: "Ao mencionar subsídio, use a frase X" | Repertório virou roteiro — proibido |
| Repertório sem atualização: regras de negócio desatualizadas injetadas no contexto do LLM | Repertório desatualizado pode contaminar raciocínio — precisa de governança |
| Omitir repertório relevante do LLM para "simplificar" | LLM sem substrato adequado produz respostas superficiais ou incorretas |

### 7.5 Trava LLM-first

> Repertório é insumo para raciocínio, não instrução para fala.
> O LLM usa o repertório para pensar, adaptar e responder com inteligência.
> Nenhuma peça de repertório pode vir acompanhada de template de como usá-la.
> O LLM decide quando e como o repertório é relevante para o turno.

### 7.6 Regras e fontes do T0 classificadas em REPERTÓRIO

| ID / Fonte | Conteúdo | Como o LLM usa |
|-----------|----------|---------------|
| L19 (Memorial do Programa / Analista MCMV) | Regras substantivas MCMV, faixas, subsídio, perfis | Fundamento de especialização — LLM raciocina sobre elegibilidade com naturalidade |
| L03 (Mapa Canônico do Funil) | Stages, gates, transições — mapa cognitivo do funil | LLM sabe onde está na conversa e pode conduzir com inteligência |
| RN-01..RN-12 (regras de negócio) | Conhecimento das obrigações do caso | LLM compreende as restrições sem precisar consultar o mecânico explicitamente |
| Telemetria histórica (L18) | Casos reais de leads — o que funcionou, o que falhou | Calibração do raciocínio; testes adversariais |
| INVENTARIO_REGRAS_T0 (48 regras) | Mapa completo de regras da E1 | Substrato de conhecimento para transição E1→E2 |
| RO-01 / RO-02 / RO-03 | Processo de handoff, visita, CRM | LLM conhece o fluxo completo sem precisar de instruções a cada turno |
| RO-05 | Convivência E1 como fallback temporário | LLM sabe que E1 existe como contingência — não usa como padrão |

---

## 8. Modelo de interação entre as 5 camadas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TURNO DE ATENDIMENTO                                  │
│                                                                               │
│  MECÂNICO (soberano na regra)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  REGRA  →  avalia estado, executa gates, decide próximo objetivo        │  │
│  │  VETO   →  bloqueia ação proibida, registra flag                        │  │
│  │  SUGESTÃO MANDATÓRIA  →  instrui LLM sobre conduta obrigatória          │  │
│  └──────────────────────────────┬──────────────────────────────────────────┘  │
│                                 │ contexto estruturado                         │
│                                 │ (próximo objetivo, flags, restrições,        │
│                                 │  instrução de conduta, slots pendentes)      │
│                                 ▼                                              │
│  LLM (soberano na fala)                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  TOM       →  estilo natural, profundidade, energia da resposta         │  │
│  │  REPERTÓRIO →  conhecimento MCMV, casos, regras como substrato          │  │
│  │  RACIOCÍNIO →  interpreta contexto, decide o que comunicar e como       │  │
│  │  FALA      →  redige reply_text com naturalidade e especialidade        │  │
│  └──────────────────────────────┬──────────────────────────────────────────┘  │
│                                 │ reply_text (LLM soberano)                   │
│                                 ▼                                              │
│  CANAL  →  cliente recebe resposta natural da atendente especialista MCMV     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regra de fluxo:**
1. Mecânico processa entrada → aplica regras → emite vetos → emite sugestões mandatórias → monta contexto.
2. LLM recebe contexto → consulta repertório → raciocina → redige resposta → aplica tom.
3. Canal entrega resposta ao cliente.
4. Mecânico valida a saída do LLM (pós-resposta, pré-persistência — papel de T3).
5. Estado é persistido (papel de T2).

**O que nunca acontece:**
- O mecânico não redige nenhuma parte do `reply_text`.
- O LLM não executa nenhuma operação de state (coletar, persistir, avançar stage).
- Nenhuma camada invade a fronteira da outra.

---

## 9. Tabela de classificação completa — regras T0 por camada

| ID | Nome | Camada primária | Camada secundária (se aplicável) | Observação |
|----|------|----------------|----------------------------------|------------|
| RN-01 | Casado civil → processo conjunto | REGRA | — | Gate de roteamento |
| RN-02 | Autônomo → verificação IR | REGRA | → SUGESTÃO MANDATÓRIA (como abordar) | A regra coleta; a sugestão orienta conduta do LLM |
| RN-03 | Solo renda baixa → sugerir composição | SUGESTÃO MANDATÓRIA | ← REGRA (aciona quando `renda_total < limite`) | A regra detecta o contexto; a sugestão instrui o LLM |
| RN-04 | Estrangeiro → RNM válido | REGRA | — | Gate de elegibilidade |
| RN-05 | União estável → solo/conjunto | REGRA | — | Gate de processo |
| RN-06 | Autônomo sem IR → orientar | SUGESTÃO MANDATÓRIA | ← REGRA | Instrução de conduta: não encerrar de forma seca |
| RN-07 | CTPS 36m → informar valor estratégico | SUGESTÃO MANDATÓRIA | ← REGRA | Conduta obrigatória sem bloquear fluxo |
| RN-08 | Dependente → só quando couber | SUGESTÃO MANDATÓRIA | — | Instrução de momento da coleta |
| RN-09 | P3 → coletar regime/renda | REGRA | — | Gate de coleta especial |
| RN-10 | Multi/conjunto → coletar P2 | REGRA | — | Gate de coleta |
| RN-11 | Multi autônomo → IR P2 | REGRA | — | Gate de coleta |
| RN-12 | Restrição alta → inelegibilidade | REGRA | VETO (implícito: não avançar) | Gate de elegibilidade + bloqueio |
| RC-01 | Nunca prometer aprovação | VETO | — | Proibição absoluta de promessa |
| RC-02 | Nunca ignorar info confirmada | REGRA | VETO | Obrigação de integridade de dados |
| RC-03 | Nunca pular coleta obrigatória | REGRA | VETO | Gate de coleta crítica |
| RC-04 | Regras críticas em policy declarativa | REGRA | VETO | Meta-regra de governança |
| RC-05 | Migração não destrói telemetria | REGRA | — | Regra de rollout |
| RD-01 | Docs no estado estruturado | REGRA | — | Gate de persistência |
| RD-02 | Status documental canônico | REGRA | — | Gate de coleta |
| RD-03 | Canal de envio (3 opções) | REGRA | REPERTÓRIO (LLM conhece os 3 canais) | Regra + conhecimento |
| RD-04 | Envio parcial não trava | REGRA | — | Gate de keepstage |
| RD-05 | Pacote correspondente → saída | REGRA | — | Gate de roteamento final |
| RU-01 | Linguagem humana, acolhedora | TOM | — | Estilo fundacional |
| RU-02 | Resposta curta/média com direção | TOM | — | Formato geral |
| RU-03 | Ambiguidade → needs_confirmation | SUGESTÃO MANDATÓRIA | + REGRA (não avança) | Conduta obrigatória + gate |
| RU-04 | Offtrack → responder e trazer de volta | SUGESTÃO MANDATÓRIA | + TOM | Conduta obrigatória + estilo |
| RU-05 | LLM soberano na fala | TOM | (princípio fundacional) | Meta-regra de soberania |
| RU-06 | Casca mecânica → MORTA | VETO | — | Proibição absoluta |
| RO-01 | Handoff ao correspondente | REGRA | REPERTÓRIO | Roteamento + conhecimento do processo |
| RO-02 | Visita presencial como canal final | REGRA | REPERTÓRIO | Regra + conhecimento |
| RO-03 | CRM com trilha auditável | REGRA | — | Regra de operação |
| RO-04 | Reset total e dedup guard | REGRA | — | Infraestrutura de integridade |
| RO-05 | E1 como fallback temporário | REGRA | REPERTÓRIO (LLM sabe que E1 existe) | Regra de convivência |
| RR-01 | Espinha dorsal de stages | REGRA | REPERTÓRIO | Mapa de fluxo como contexto |
| RR-02 | Casado civil → forçar conjunto | REGRA | — | Gate de roteamento imediato |
| RR-03 | P3/conjunto → qualification_special | REGRA | — | Gate de roteamento especial |
| RR-04 | Elegibilidade → docs_prep | REGRA | — | Gate de avanço |
| RR-05 | Docs → aguardando_retorno | REGRA | — | Gate de roteamento final |
| RR-06 | OfftrackGuard pré-funil | REGRA | → SUGESTÃO MANDATÓRIA | Intercept + conduta do LLM após |
| RR-07 | Gate cognitivo (COGNITIVE_V2_MODE) | REGRA | SUGESTÃO MANDATÓRIA | Gate + instrução de conduta |
| RE-01 | Atendimento manual bypass | REGRA | — | Gate de excepção |
| RE-02 | Rollback por feature flag | REGRA | — | Regra de rollout |
| RE-03 | Dado contradito → confirmação | SUGESTÃO MANDATÓRIA | + REGRA (não persistir) | Conduta obrigatória + gate |
| RE-04 | Inventário não fechado → não avança | REGRA | VETO | Gate + proibição |
| RE-05 | Motor cognitivo legado → não expandir | VETO | — | Proibição de expansão |
| RM-01 | Fallbacks textuais estáticos → MORTOS | VETO | — | Proibição absoluta |
| RM-02 | Scripts rígidos de reprompt → MORTOS | VETO | — | Proibição absoluta |
| RM-03 | `fim_inelegivel` → eliminar | VETO | — | Resíduo proibido |
| RM-04 | `yesNoStages` sem case → stub | VETO | — | Estrutura proibida de migrar |
| RM-05 | `handleCorrespondenteRetorno` → redesenhar | VETO (migração direta) | REGRA (redesenho) | Stub proibido de migrar diretamente |

---

## 10. Sumário de classificação por camada

| Camada | IDs principais | Total de regras T0 |
|--------|---------------|-------------------|
| TOM | RU-01, RU-02, RU-05 | 3 (+ princípio de soberania) |
| REGRA | RN-01, RN-02, RN-04, RN-05, RN-09..RN-12, RC-02..RC-05, RD-01..RD-05, RO-01..RO-05, RR-01..RR-07, RE-01, RE-02, RE-04 | 28 |
| VETO | RC-01, RU-06, RM-01..RM-05, RE-04, RE-05 | 8 (4 mortas + 4 ativas) |
| SUGESTÃO MANDATÓRIA | RN-03, RN-06..RN-08, RU-03, RU-04, RE-03, RR-07 | 8 |
| REPERTÓRIO | L19, L03 (fontes primárias); RD-03, RO-01, RO-02, RO-05, RR-01 (regras c/ componente de conhecimento) | substrato: L19 + L03 obrigatórios |

> **Nota:** 28 regras têm camada primária REGRA — o mecânico executa, o LLM recebe como contexto.
> Nenhuma dessas 28 gera texto ao cliente. Isso é a trava LLM-first operando.

---

## 11. Cobertura dos critérios do mestre

| Microetapa do mestre (seção T1, p. 5) | Cobertura neste documento |
|--------------------------------------|--------------------------|
| Separar tom, regra, veto, sugestão mandatória e repertório | Seções 3–7 — 5 dimensões definidas com exemplos |
| Proteção soberania de fala do LLM | Seção 2, travas por camada (3.5, 4.5, 5.5, 6.5, 7.5) |
| Amarração das regras ao inventário T0 | Seções 3.6, 4.6, 5.6, 6.6, 7.6 + tabela seção 9 |
| Impedir que regra vire fala mecânica | Anti-padrões seções 4.4, 5.4, 6.4 |
| Impedir que veto vire template de resposta | Anti-padrão seção 5.4 |
| Impedir que sugestão force texto pré-montado | Anti-padrão seção 6.4 |
| Impedir que repertório substitua raciocínio | Anti-padrão seção 7.4 |

---

## BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T1_CAMADAS_CANONICAS.md (este documento)
Estado da evidência:                   completa — 5 dimensões definidas com definição canônica,
                                        pertencimento, não-pertencimento, anti-padrões, trava
                                        LLM-first e classificação das 48 regras T0; cobertura das
                                        7 microetapas do mestre verificada (seção 11)
Há lacuna remanescente?:               não — L04–L17 (regras finas de topo/Meio A/Meio B/Especiais)
                                        não transcritos dos PDFs mas não são necessários para a
                                        separação das 5 camadas; a separação é de princípio, não de
                                        enumeração exaustiva de regras finas (essas entram em T1.1+
                                        conforme o system prompt e a taxonomia forem escritos)
Há item parcial/inconclusivo bloqueante?: não — todas as 5 dimensões têm definição canônica
                                        completa; 48 regras T0 classificadas; modelo de interação
                                        publicado; cobertura das microetapas T1 verificada
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T1.1 encerrada; PR-T1.2 desbloqueada
Próxima PR autorizada:                 PR-T1.2 — System prompt canônico em camadas
```
