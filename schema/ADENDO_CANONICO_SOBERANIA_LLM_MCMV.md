# ADENDO CANÔNICO — SOBERANIA LLM-FIRST E IDENTIDADE DA ENOVA 2 COMO ATENDENTE ESPECIALISTA MCMV

> **Identificador canônico:** A00-ADENDO-02
> **Status:** Adendo canônico ativo — vigência imediata e transversal a todas as frentes.
> **Precedência:** Este adendo complementa e aprofunda o A00-ADENDO-01 (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`). Ambos valem juntos. Em caso de conflito aparente, o mais restritivo prevalece.
> **Leitura obrigatória:** Em toda tarefa que toque conversa, atendimento, LLM, speech, surface, fallback, multimodalidade, fluxo cognitivo, contrato cognitivo, policy engine, orquestrador, migração de funil, áudio, ou qualquer trecho de implementação que possa ser lido como "mecânico manda na fala".

---

## 1. Por que este adendo existe

O A00-ADENDO-01 estabeleceu a regra-mãe: a IA é soberana na fala, o mecânico jamais pode ter prioridade de fala. Esta regra é necessária e suficiente como trava formal.

Este adendo (A00-ADENDO-02) existe para ir além da trava: ele afirma positivamente a **identidade e a visão de produto da Enova 2** — o que ela deve ser, não apenas o que ela não pode ser. Ele também atua como **guia de leitura das fases T1, T3, T4, T5 e T6**, que contêm os maiores riscos de má interpretação.

A razão da existência deste adendo pode ser resumida em uma constatação:

> A Enova 1 acertou nas regras. A Enova 1 errou na fala. A Enova 2 nasce para acertar nos dois.

A Enova 1 produziu um sistema que sabia as regras do MCMV mas falava como bot de formulário. O mecânico venceu o turno. O cliente recebia respostas corretas entregues como robô. Isso não é qualificação inteligente — é triagem mecânica com fachada de atendimento.

A Enova 2 resolve isso na fundação, não em camadas de palha:

* **Fundação correta:** IA soberana no raciocínio e na fala.
* **Estrutura no papel certo:** governança, consistência, memória, política, trilha auditável — nunca fala.
* **Conhecimento servindo a IA:** regras, normativos, telemetria, casos, memória alimentam o LLM, não dominam a conversa.

---

## 2. Visão de produto da Enova 2

A Enova 2 é uma **atendente virtual especialista em MCMV**.

Não é um bot de qualificação com caixas de formulário encadeadas.  
Não é um motor de regras com interface de chat por cima.  
Não é uma versão melhorada de FAQ do MCMV.  
Não é a Enova 1 com LLM adicionado por fora.

A Enova 2 é uma atendente que:

| Dimensão | O que a Enova 2 faz |
|----------|---------------------|
| **Fala** | Se comunica como uma analista humana experiente — natural, contextual, adaptada ao momento da conversa |
| **Raciocínio** | Interpreta o que o cliente disse, infere intenções, identifica ambiguidades, conduz sem script |
| **Conhecimento** | Domina o MCMV: regras da CEF, faixas de renda, composição, regime, elegibilidade, documentação, exceções |
| **Condução** | Sabe quando aprofundar, quando resumir, quando confirmar, quando desviar gentilmente |
| **Qualificação** | Identifica perfil, detecta sinais de inviabilidade cedo, direciona para conversão real |
| **Governança** | Opera dentro das políticas sem que o cliente sinta a política — ela está presente como limite, não como voz |

Esta visão de produto é **inegociável**. Nenhuma implementação, contrato, PR ou fase pode desviar desta identidade.

---

## 3. O que é LLM-first na Enova 2

LLM-first não é jargão. É uma escolha de arquitetura com consequência direta na experiência do cliente.

### 3.1 LLM-first significa

* O LLM lê toda a entrada (texto, transcrição de áudio, imagem, doc) e decide como responder.
* O LLM recebe o contexto, os fatos coletados, o próximo objetivo autorizado e as restrições de política.
* O LLM redige a resposta final ao cliente — com naturalidade, tom e profundidade adequados ao momento.
* O LLM conduz o fluxo conversacional: pergunta, confirma, recapitula, redireciona, aprofunda.

### 3.2 LLM-first NÃO significa

* LLM sem restrições. O mecânico define o que é permitido, e o LLM opera dentro disso.
* LLM sem memória. O estado estruturado (T2) alimenta o LLM com contexto persistido.
* LLM sem verificação. O policy engine (T3) valida antes de persistir — não antes de falar.
* LLM como camada cosmética sobre scripts. O LLM é a camada de fala, não um enfeite sobre texto mecânico.

### 3.3 A divisão canônica de responsabilidades

```
┌─────────────────────────────────────────────────────────────────────┐
│  O que o MECÂNICO faz (legítimo, insubstituível, NUNCA NA FALA)     │
│                                                                      │
│  • Validar dados coletados contra regras MCMV                       │
│  • Decidir próximo objetivo operacional autorizado                  │
│  • Registrar estado, slots confirmados, evidências no Supabase      │
│  • Bloquear avanço para stage não autorizado pela política          │
│  • Preservar rastreabilidade e auditabilidade                       │
│  • Informar o LLM: contexto, objetivo, restrições, pendências       │
│                                                                      │
│  O mecânico ENTREGA INSUMO. O LLM ENTREGA FALA.                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  O que o LLM faz (soberano, insubstituível, NUNCA SUBSTITUÍVEL)     │
│                                                                      │
│  • Redigir a resposta final ao cliente                              │
│  • Conduzir o fluxo com naturalidade                                │
│  • Interpretar contexto, intenção e ambiguidade                     │
│  • Adaptar tom, profundidade e estrutura ao momento                 │
│  • Decidir como comunicar o que o mecânico determinou               │
│                                                                      │
│  O LLM decide COMO dizer. O mecânico decide O QUE é permitido.     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. O papel legítimo do conhecimento normativo, regras e memória

O conhecimento da Enova 2 — regras CEF, normativos MCMV, tabelas de elegibilidade, casos históricos, telemetria, memória de leads — tem papel fundamentalmente diferente do papel que tinha na Enova 1.

### Na Enova 1 (padrão que NÃO deve ser repetido):

* Regras ditavam respostas. Cada gate tinha sua mensagem pré-montada.
* Memória era consultada para decidir o que dizer, não apenas o que é verdade.
* Telemetria retroalimentava scripts, não raciocínio.
* O conhecimento era o **roteirista** da conversa.

### Na Enova 2 (padrão correto):

* Regras alimentam o LLM com restrições. O LLM decide como comunicá-las.
* Memória dá ao LLM contexto real e atualizado do lead. O LLM decide o que relevar, retomar ou aprofundar.
* Telemetria ajuda o LLM a calibrar foco: o que perfis parecidos mais precisaram ouvir.
* O conhecimento é o **substrato** da conversa — invisível para o cliente, presente no raciocínio.

### Uso legítimo do conhecimento estrutural (papel de suporte):

| Tipo de conhecimento | Papel legítimo |
|---------------------|---------------|
| Regras CEF / normativos MCMV | Restrições que o LLM obedece e comunica com naturalidade |
| Tabelas de elegibilidade | Critérios que o mecânico valida e que o LLM traduz para o cliente |
| Casos históricos / telemetria | Suporte ao raciocínio do LLM, não script de resposta |
| Memória do lead (T2) | Contexto persistido que o LLM usa para personalizar e retomar |
| Slots coletados (T2/T3) | Estado operacional que orienta o próximo objetivo do LLM |

**Regra-síntese:** o conhecimento **informa** o LLM. O LLM **raciocina e fala**.

---

## 5. O estrutural/mecânico — onde serve e onde não serve

### Serve para (papel legítimo):

1. **Memória** — persistir estado, fatos, histórico, contexto para continuidade real.
2. **Política** — garantir que regras MCMV sejam cumpridas sem depender da memória do LLM.
3. **Trilha auditável** — registrar cada decisão, cada slot, cada validação — para compliance.
4. **Segurança** — bloquear avanço onde a política não autoriza.
5. **Consistência** — garantir que o mesmo lead seja tratado com as mesmas regras em qualquer turno.
6. **Elegibilidade** — checar critérios objetivos que não dependem de interpretação de contexto.
7. **Apoio decisório** — informar ao LLM qual é o próximo objetivo autorizado, quais slots faltam, quais pendências existem.

### NÃO serve para (proibições explícitas):

1. **Dominar a fala** — o mecânico não redige a resposta ao cliente.
2. **Engessar a conversa** — sequências fixas de perguntas ditadas pelo motor de stage são Enova 1.
3. **Travar o atendimento em casca robótica** — stages rígidos que transformam o LLM em ledor de script.
4. **Substituir o raciocínio e a condução natural da IA** — o mecânico não "pensa" a conversa.
5. **Ser a voz do projeto** — nenhuma camada abaixo do LLM produz a surface final do turno.

---

## 6. Reaproveitamento da Enova 1 — o que aproveitar e o que não repetir

A Enova 1 é um ativo valioso. Ela tem anos de operação, casos reais, regras calibradas, telemetria de comportamento de leads, mapa de edge cases do MCMV. Tudo isso é matéria-prima de alto valor.

### O que reaprovitar da Enova 1:

| Ativo | Como usar |
|-------|-----------|
| Base normativa CEF / MCMV | Fonte canônica de regras para T1/T3 |
| Casos reais de leads (telemetria) | Calibração do raciocínio do LLM e testes adversariais |
| Regras comerciais operacionais | Base para policy engine (T3) e comportamentos (T1.5) |
| Edge cases mapeados | Testes de regressão e bateria adversarial em T1/T3/T4 |
| Fluxos de qualificação | Referência de cobertura para inventário T0 e migração T5 |
| Mapa de parsers/heurísticas | Inventário T0 — o que precisa ser substituído |
| Campos de estado (Supabase) | Referência para schema `lead_state` v1 (T2) |

### O que NÃO repetir da Enova 1:

| Anti-padrão | Por que não |
|-------------|-------------|
| Casca robótica de atendimento | Envolve o LLM em scripts mecânicos — mata a naturalidade |
| Fallback como voz principal | Fallback é contingência silenciosa, não motor de resposta |
| Surface engessada com frase pré-montada | Surface deve ser LLM, não template |
| Stage engine como roteirista | Stage autoriza próximo objetivo, não dita o que dizer |
| Perguntas em sequência fixa | Conversa deve ser conduzida por raciocínio, não por slot ordering |

### Regra sobre a E1 nesta etapa (T0):

* A Enova 1 **não deve ser refatorada agora**.
* O uso da E1 nesta etapa é apenas de **diretriz de reaproveitamento futuro** — inventário, mapeamento, referência de regras.
* Não há execução técnica imediata sobre a base da E1.
* Quando a fase de memória (T2) chegar, a base da E1 será usada como matéria-prima — dados, regras, casos, estrutura de estado. A forma de integração será definida no contrato T2, não antecipada agora.
* O uso da E1 foca em: **conhecimento, telemetria, regras, ativos úteis** — nunca em casca mecânica de atendimento.

---

## 7. Guia de leitura das fases com maior risco de má interpretação

As fases abaixo têm nomenclatura ou microetapas que, lidas fora do contexto deste adendo, podem ser interpretadas como "mecânico manda na fala". Este guia exige leitura anterior deste adendo e do A00-ADENDO-01 antes de executar qualquer PR dessas fases.

### T1 — Contrato cognitivo / system prompt / taxonomia / comportamentos

**Risco de má interpretação:** "Contrato cognitivo" pode ser lido como sequência rígida de comportamentos mecânicos. "Políticas proibitivas" podem ser lidas como scripts de resposta negativa.

**Interpretação correta:**
* "Contrato cognitivo" = identidade, limites e objetivos do LLM — o que ele é, não o que ele diz.
* "Políticas proibitivas" = o que o LLM nunca pode fazer, não o que ele deve dizer quando aciona uma política.
* "Comportamentos em ambiguidade, prolixo, evasivo" = como o LLM raciocina e conduz — nunca script pré-montado.
* "Formato de saída" = estrutura de dados que o LLM preenche — `reply_text` é sempre redigido pelo LLM com naturalidade.

**Trava explícita para T1:**
> O contrato cognitivo define o que o LLM é e o que não pode fazer. Ele não define o que o LLM diz. A fala é sempre do LLM, dentro dos limites do contrato.

### T3 — Policy engine / guardrails declarativos

**Risco de má interpretação:** "Policy engine" pode ser lido como motor que gera respostas baseadas em regras. "Classes de política" podem ser lidas como templates de mensagem. "Veto suave" pode ser lido como mensagem de negação pré-montada.

**Interpretação correta:**
* Policy engine = motor que avalia regras e decide o que é permitido — não o que é dito.
* "Bloquear avanço" = impedir que o LLM avance para stage não autorizado — nunca redigir a mensagem de bloqueio.
* "Classes de política" = tipos de restrição operacional (obrigação, bloqueio, sugestão, confirmação) — não templates de fala.
* "Veto suave" = flag passada ao LLM para que ele comunique a situação com naturalidade — nunca texto pré-montado.
* "Validador pós-resposta/pré-persistência" = validação do que o LLM disse, não reescrita da surface.

**Trava explícita para T3:**
> A política governa consistência. A IA governa fala e raciocínio. O policy engine NUNCA produz texto ao cliente. Ele produz flags, bloqueios e insumos para o LLM.

### T4 — Orquestrador de turno

**Risco de má interpretação:** "Orquestrador" pode ser lido como motor central que monta a resposta final. "Resposta final" na nomenclatura pode ser confundida com texto gerado pelo orquestrador. "Fallbacks" podem ser lidos como mensagens fixas de contingência.

**Interpretação correta:**
* Orquestrador = pipeline de turno que chama o LLM, coleta a saída, valida com o policy engine e persiste — nunca monta a surface.
* "Resposta final" = `reply_text` gerado pelo LLM — o orquestrador entrega ao canal, não redige.
* "Fallbacks" = contingências declaradas e mínimas — o LLM ainda conduz quando possível; fallback puro só em falha técnica.
* "Feature flags" = mecanismo de controle de rollout — não motor de resposta.

**Trava explícita para T4:**
> O orquestrador é o pipeline, não o autor. Quem escreve a resposta ao cliente é o LLM. O orquestrador garante que o LLM seja chamado, que a saída seja válida, e que o estado seja persistido.

### T5 — Migração do funil

**Risco de má interpretação:** "Migração do funil" pode ser lido como recriar o trilho da Enova 1 em nova arquitetura. "Paridade funcional" pode ser lida como reproduzir o comportamento conversacional anterior. "Shadow mode" pode ser lido como comparar scripts mecânicos.

**Interpretação correta:**
* "Migração do funil" = migrar a cobertura de casos (fatos coletados, regras verificadas, estados persistidos) — não a forma de conversa.
* "Paridade funcional" = provar que a Enova 2 cobre os mesmos cenários de negócio com resultado correto — não que usa a mesma linguagem.
* "Shadow mode" = comparar resultados de negócio (elegibilidade, classificação, completude) — não comparar texto de resposta.
* A Enova 2 pode e deve responder de forma diferente da Enova 1 — mais natural, mais inteligente — e ainda assim ter paridade funcional.

**Trava explícita para T5:**
> Paridade funcional NÃO é reproduzir a fala da Enova 1. É reproduzir a cobertura de casos de negócio com pelo menos a mesma qualidade. A forma da conversa deve ser melhor — mais humana, mais inteligente, mais contextual.

### T6 — Docs, multimodal, áudio

**Risco de má interpretação:** "Áudio" pode ser lido como abrir um motor de resposta de voz com scripts. "Representação unificada" pode ser lida como padronizar o texto de saída. "Política de confirmação por canal" pode ser lida como mensagem fixa de confirmação.

**Interpretação correta:**
* "Áudio" = canal de entrada — o LLM processa transcrição e responde com naturalidade adequada ao canal.
* "Representação unificada" = padronizar como a entrada multimodal é representada para o LLM — nunca como a saída é montada.
* "Política de confirmação por canal" = definir quando e como o LLM deve confirmar um fato — não o texto que ele usa.
* O LLM pode responder via áudio, texto, imagem de orientação — em qualquer canal, com a mesma soberania de raciocínio e fala.
* Áudio não engessa a conversa. Áudio amplia o alcance da atendente — ela ainda raciocina livre, agora em mais formatos.

**Trava explícita para T6:**
> A multimodalidade expande a superfície da Enova 2, mas não muda sua arquitetura. Em áudio, texto ou imagem: o LLM é soberano na fala. O mecânico é soberano na política. Essa divisão não muda com o canal.

---

## 8. Regras proibidas canônicas (complemento ao A00-ADENDO-01)

As regras abaixo se somam e complementam a tabela de proibições formais do A00-ADENDO-01:

| # | Proibição específica deste adendo | Classificação |
|---|-----------------------------------|---------------|
| P10 | **Recriar o padrão conversacional da Enova 1 em T5 em nome de "paridade"** | Não conforme — parada imediata |
| P11 | Interpretar "contrato cognitivo" (T1) como sequência rígida de perguntas | Não conforme |
| P12 | Usar "policy engine" (T3) para gerar texto de resposta ao cliente | Não conforme |
| P13 | Tratar "fallback" (T4) como motor principal de contingência conversacional | Não conforme |
| P14 | Assumir que áudio/multimodal (T6) exige scripts de resposta para cada canal | Não conforme |
| P15 | Usar telemetria/casos da E1 para criar scripts de resposta — e não para alimentar raciocínio | Não conforme |
| P16 | Refatorar a Enova 1 nesta fase (T0) sob qualquer justificativa de "preparação" | Não conforme |
| P17 | Abrir execução técnica sobre a E1 antes da fase de memória (T2) ser autorizada | Não conforme |
| P18 | Interpretar "paridade funcional" (T5) como paridade de texto ou de estilo de resposta | Não conforme |

---

## 9. Critério de conformidade com este adendo

Uma implementação, PR ou decisão arquitetural é **conforme** a este adendo quando:

* A identidade do projeto é "atendente especialista MCMV" — e não "bot de regras com chat".
* O LLM redige e emite a surface final do turno em todos os canais.
* Regras, normativos, memória e telemetria alimentam o LLM — não dominam a conversa.
* A Enova 1 é usada como matéria-prima de conhecimento — não como modelo de casca conversacional.
* A multimodalidade expande canais sem engessamento de scripts por canal.
* A política governa consistência e elegibilidade — nunca a fala.

Uma implementação é **não conforme** quando qualquer das proibições das seções 8 deste adendo ou da seção 4 do A00-ADENDO-01 for identificada.

---

## 10. Referência cruzada e precedência

| Documento | Relação com este adendo |
|-----------|------------------------|
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) | Regra-mãe de soberania da IA. Este adendo (A00-ADENDO-02) particulariza, aprofunda e adiciona guia de leitura por fase |
| `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Tronco macro soberano. Este adendo é uma particularização do produto e da visão — não cria novo macro |
| `schema/A00_PLANO_CANONICO_MACRO.md` | Este adendo particulariza os princípios de IA e produto do A00 |
| `schema/CODEX_WORKFLOW.md` | Este adendo integra a lista de leitura obrigatória e a cadeia de precedência |
| `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` | As travas por fase deste adendo reforçam as PRs T1, T3, T4, T5 e T6 da Bíblia |
| `schema/contracts/_INDEX.md` | Toda abertura de contrato de frente deve declarar conformidade com este adendo e com o A00-ADENDO-01 |
| `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` | Contrato vigente lido antes da criação deste adendo |

**Cadeia de precedência atualizada (com este adendo):**

```
schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  > A00 (schema/A00_PLANO_CANONICO_MACRO.md)
    > A01 (schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md)
      > A00-ADENDO-01 (schema/ADENDO_CANONICO_SOBERANIA_IA.md)
        > A00-ADENDO-02 (schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md) ← ESTE ADENDO
          > A02 (schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md)
            > schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md
              > Contrato/fase ativa em schema/contracts/active/
                > Documentos legados aplicáveis
```

---

## 11. Vigência e obrigações de próximas tarefas

* Este adendo vale imediatamente a partir de sua criação no repositório.
* É transversal a **todas as frentes**: Core, Speech Engine, Contexto, Supabase, Áudio, Meta, Telemetria e Rollout.
* A **`PR-T0.1`** (próxima PR autorizada) deve ser executada com leitura prévia deste adendo.
* Toda PR de **T1, T3, T4, T5 e T6** deve declarar explicitamente conformidade com este adendo e com o A00-ADENDO-01 antes de executar qualquer entrega.
* Nenhum contrato de frente pode ser aberto, executado ou encerrado de forma que contradiga este adendo ou o A00-ADENDO-01.
* O reaproveitamento da Enova 1 deve focar em **conhecimento, telemetria, regras e ativos úteis** — nunca em casca mecânica de atendimento.

---

*Adendo criado em: 2026-04-23*
*Identificador canônico: A00-ADENDO-02*
*Vigência: imediata e permanente*
*Vinculado a: A00-ADENDO-01, macro soberano, Bíblia, CODEX_WORKFLOW*
