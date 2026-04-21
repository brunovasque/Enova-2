# CONTRATO — FRENTE 3 — CONTEXTO, EXTRAÇÃO ESTRUTURADA E MEMÓRIA VIVA — ENOVA 2

## 1. Identificação canônica

- Nome da frente: **Frente 3 — Contexto, Extração Estruturada e Memória Viva**
- Classificação: **contratual**
- Estado inicial do contrato: **aberto**
- Data de abertura: **2026-04-21**
- Precedência aplicada: **A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > este contrato > legados aplicáveis**
- Frente sucessora de: **Speech Engine e Surface Única**
- Próxima frente após encerramento esperado: **Frente 4 — Supabase Adapter e Persistência**

---

## 2. Base documental obrigatória

Este contrato só pode ser executado com leitura e respeito integral a:

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/CODEX_WORKFLOW.md`
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
- `schema/contracts/_INDEX.md`
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/CONTRACT_SCHEMA.md`
- `schema/STATUS_SCHEMA.md`
- `schema/HANDOFF_SCHEMA.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` e/ou `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`

---

## 3. Objetivo imutável do contrato

Esta frente existe para introduzir, provar e consolidar na ENOVA 2 a camada de:

- **contexto útil do turno**
- **extração estruturada de sinais**
- **captação de múltiplas informações no mesmo turno**
- **memória viva mínima e útil entre turnos**

sem violar a soberania do Core nas regras e sem devolver ao mecânico qualquer prioridade de fala.

Objetivo operacional final da frente:

> Permitir que a ENOVA 2 capte mais de um fato, intenção, dúvida, objeção ou sinal relevante no mesmo turno, transforme isso em estrutura útil e confiável, preserve trilho e governança, entregue memória curta útil para o próximo raciocínio, e prove esse comportamento por acceptance smoke formal.

---

## 4. Item do A01 atendido

- **Fase 3**
- **Prioridade 3**
- **Item:** plugar extração multi-intenção e memória curta úteis
- **Sai quando:** houver capacidade comprovada de captar mais de um fato por turno sem perder trilho

---

## 5. Relação com o A00

Esta frente implementa diretamente os elementos do A00 relacionados a:

- `Conversation Brain`
- `Extraction & Slot Resolver`
- memória viva como contexto útil consolidado
- captação de múltiplas informações no mesmo turno
- separação entre:
  - Core/Policy decidindo regra
  - IA mantendo soberania na fala final

Esta frente **não** substitui Speech.
Esta frente **não** substitui Core.
Esta frente **não** abre persistência real nova por conta própria.
Esta frente existe para **informar melhor** o Core e a IA.

---

## 6. Princípios obrigatórios da frente

### 6.1 IA soberana na fala
Nenhuma entrega desta frente pode transformar extractor, contexto, memória ou parser em autor da resposta final ao cliente.

### 6.2 Mecânico soberano na regra
Nada desta frente pode decidir stage, gate, elegibilidade ou próximo passo por conta própria fora da política já autorizada.

### 6.3 Estrutura serve à conversa, não a substitui
O resultado da extração deve alimentar raciocínio, governança e continuidade. Nunca virar surface mecânica dominante.

### 6.4 Multi-intenção sem colapso de trilho
A frente deve suportar o caso em que o cliente traz mais de uma informação no mesmo turno sem perder:
- objetivo atual
- bloqueios
- governança estrutural
- rastreabilidade

### 6.5 Memória viva mínima
Memória viva não é histórico caótico, não é prompt inflado, não é dump textual. Deve guardar apenas contexto útil para o próximo raciocínio.

### 6.6 Sem antecipação de frentes futuras
Esta frente não pode puxar para dentro de si:
- Supabase Adapter completo
- áudio real
- multimodalidade plena
- Meta/WhatsApp
- telemetria profunda
- rollout

---

## 7. Escopo incluído

Este contrato inclui:

1. Definição do shape canônico do turno estruturado.
2. Definição do shape canônico de sinais extraídos.
3. Definição de candidatos a slot, pendências, ambiguidades, evidências e confiança.
4. Captação de múltiplas informações no mesmo turno.
5. Consolidação mínima de contexto útil do turno.
6. Consolidação mínima de memória viva útil entre turnos.
7. Integração conceitual com Core e Speech sem dar fala ao mecânico.
8. Smoke tests da frente.
9. Acceptance smoke final.
10. Closeout formal da frente.

---

## 8. Fora de escopo

Ficam explicitamente fora desta frente:

- persistência real completa de Supabase Adapter
- criação de schema/tabelas/namespace definitivo da Frente 4
- áudio real
- STT real
- TTS real
- multimodalidade plena
- Meta/WhatsApp
- telemetria profunda/admin completo
- rollout/shadow/canary
- prompt final de produção completo
- integração com provedor LLM real
- qualquer reintrodução de fala mecânica
- qualquer surface de resposta autorada por extractor/contexto/parser

---

## 9. Legados aplicáveis

Blocos legados aplicáveis a esta frente:

- **Obrigatório:** L03
- **Complementares prioritários:** L19
- **Complementares conforme recorte:** L01-L02 e famílias do funil tocadas pelos smokes

Regra:
- usar o legado como **fonte de verdade de negócio**
- não usar o legado como modelo para reimplantar bagunça estrutural de speech, bridges rígidas ou fallback dominante

---

## 10. Entregável macro da frente

Ao final da frente, a ENOVA 2 deve possuir:

- uma estrutura explícita para representar o turno do cliente
- uma estrutura explícita para representar múltiplos sinais no mesmo turno
- uma forma canônica de separar:
  - fatos
  - intenções
  - dúvidas
  - objeções
  - candidatos a slot
  - pendências
  - ambiguidades
  - evidências
  - confiança
- memória viva mínima e útil
- smoke final provando que múltiplas informações são absorvidas sem perder trilho nem devolver prioridade de fala ao mecânico

---

## 11. PRs oficiais desta frente

Esta frente será executada em **5 PRs canônicas**.

### PR 35 — ABERTURA CONTRATUAL DA FRENTE 3

**Classificação:** governança / contratual

**Objetivo da PR:**
Abrir formalmente a Frente 3 no repositório, sem implementação funcional.

**Deve entregar:**
- este contrato ativo criado em `schema/contracts/active/`
- update em `schema/contracts/_INDEX.md`
- criação de `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
- criação de `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`

**Não deve fazer:**
- não criar código funcional da frente
- não abrir Supabase
- não abrir áudio
- não abrir Meta
- não inventar microescopo fora deste contrato

**Critério de pronto da PR 35:**
A Frente 3 passa a existir formalmente no repositório com objetivo, escopo, microetapas, critérios de aceite e closeout já definidos.

---

### PR 36 — SCHEMA BASE DE CONTEXTO E EXTRAÇÃO ESTRUTURADA

**Classificação:** contratual

**Objetivo da PR:**
Criar o shape canônico mínimo da camada de contexto e extração estruturada.

**Microetapas obrigatórias:**
1. Definir o pacote semântico do turno.
2. Definir o shape de sinais extraídos.
3. Separar explicitamente:
   - fatos
   - intenções
   - dúvidas
   - objeções
   - candidatos a slot
   - pendências
   - ambiguidades
   - evidências
   - confiança
4. Garantir que esse shape seja insumo estrutural para Core e Speech, não motor de fala.
5. Criar smoke mínimo da estrutura base.

**Deve provar:**
- o turno pode ser representado de forma única e estruturada
- a estrutura não escreve resposta ao cliente
- a estrutura não decide regra de negócio

**Não deve fazer:**
- persistência real completa
- memória viva ainda sofisticada
- multi-turno profundo
- áudio/mídia real

**Critério de pronto da PR 36:**
Existe shape canônico útil, legível e testado para representar contexto e extração do turno.

---

### PR 37 — MÚLTIPLAS INFORMAÇÕES NO MESMO TURNO

**Classificação:** contratual

**Objetivo da PR:**
Fazer a ENOVA 2 absorver mais de um fato/intenção/sinal no mesmo turno sem perder trilho.

**Microetapas obrigatórias:**
1. Receber um turno composto com múltiplos sinais.
2. Consolidar os sinais sem colapsar em string solta.
3. Preservar objetivo atual e bloqueios.
4. Distinguir o que pode ser aceito, o que fica pendente e o que exige confirmação.
5. Garantir que o resultado informe o Core sem virar decisão autônoma.
6. Garantir que o resultado informe a IA sem virar surface mecânica.
7. Criar smoke específico de multi-intenção.

**Exemplos de casos que esta PR deve cobrir conceitualmente:**
- cliente responde a pergunta atual e faz uma dúvida junto
- cliente informa dois dados de perfil no mesmo turno
- cliente traz objeção + dado de renda
- cliente mistura resposta, medo e pergunta no mesmo texto

**Não deve fazer:**
- decisão final de gate por conta própria
- resposta final autorada pelo extractor
- resolver persistência real definitiva

**Critério de pronto da PR 37:**
A frente prova captura de múltiplos fatos no mesmo turno sem perder trilho, cumprindo o “sai quando” do A01 no plano funcional parcial.

---

### PR 38 — MEMÓRIA VIVA MÍNIMA E ÚTIL

**Classificação:** contratual

**Objetivo da PR:**
Consolidar memória curta útil entre turnos, sem virar dump textual e sem invadir a Frente 4.

**Microetapas obrigatórias:**
1. Definir o que pode entrar em memória viva.
2. Definir o que não pode entrar em memória viva.
3. Criar mecanismo mínimo de consolidação de contexto útil para o próximo raciocínio.
4. Garantir que memória viva:
   - preserve sinais ainda relevantes
   - não replique histórico bruto
   - não substitua estado estrutural do Core
   - não assuma persistência final da Frente 4
5. Criar smoke específico de memória viva mínima.

**Memória viva pode conter, por exemplo:**
- dúvida aberta ainda não resolvida
- objeção em aberto
- dado contextual útil já compreendido
- pendência relevante para o próximo turno
- preferência/constrangimento útil de conversa

**Memória viva não pode conter, por exemplo:**
- transcript bruto completo
- resposta final inteira anterior como dependência
- estado estrutural soberano do funil
- persistência definitiva de banco da Frente 4

**Critério de pronto da PR 38:**
Existe memória viva mínima, útil, explicável e testada, sem invadir Supabase Adapter nem reintroduzir fala mecânica.

---

### PR 39 — ACCEPTANCE SMOKE + CLOSEOUT READINESS + CLOSEOUT FORMAL

**Classificação:** governança / contratual / closeout

**Objetivo da PR:**
Fechar formalmente a Frente 3 com prova integrada e encerramento protocolar.

**Microetapas obrigatórias:**
1. Criar acceptance smoke final da frente.
2. Provar cenário integrado cobrindo:
   - contexto estruturado
   - extração de múltiplos sinais
   - preservação de trilho
   - memória viva mínima
   - IA permanecendo soberana na fala
   - mecânico sem prioridade de fala
3. Criar artefato de closeout readiness da frente.
4. Executar o `CONTRACT_CLOSEOUT_PROTOCOL.md`.
5. Arquivar este contrato.
6. Atualizar vivos:
   - `schema/contracts/_INDEX.md`
   - status da frente
   - handoff da frente
7. Declarar a próxima frente autorizada: **Frente 4 — Supabase Adapter e Persistência**

**Critério de pronto da PR 39:**
Acceptance smoke final passando + closeout protocolar executado + contrato arquivado + próxima frente declarada.

---

## 12. Ordem obrigatória de execução

A ordem desta frente é **imutável**:

1. PR 35 — abertura contratual
2. PR 36 — schema base
3. PR 37 — múltiplas informações no mesmo turno
4. PR 38 — memória viva mínima
5. PR 39 — acceptance + closeout

Nenhuma PR pode:
- pular ordem
- absorver escopo de PR posterior sem justificativa formal
- misturar Frente 3 com Frente 4/5/6/7/8

---

## 13. Critérios de aceite da frente

A Frente 3 só pode ser considerada concluída quando provar todos os itens abaixo:

### C1 — Turno estruturado
Existe estrutura canônica do turno, explícita e testável.

### C2 — Sinais estruturados
Existe separação explícita entre fatos, intenções, dúvidas, objeções, pendências, ambiguidades, evidências e confiança.

### C3 — Multi-intenção real
A ENOVA 2 consegue captar mais de um fato/sinal no mesmo turno sem perder trilho.

### C4 — Governança preservada
Nada desta frente decide regra de negócio fora do Core.

### C5 — IA continua soberana na fala
Nada desta frente escreve ao cliente nem desloca a surface final autorada pela IA.

### C6 — Memória viva mínima útil
Existe consolidação mínima de contexto útil entre turnos, sem virar dump textual e sem invadir persistência final.

### C7 — Smoke integrado final
Existe acceptance smoke final cobrindo o comportamento integrado da frente.

---

## 14. Critérios de não conformidade

Qualquer um dos itens abaixo bloqueia a frente:

- extractor/contexto/memória escrevendo resposta final ao cliente
- parser mecânico dominante voltando a conduzir a surface
- memória viva virando histórico bruto ou prompt inflado
- estrutura tentando decidir gate/stage por conta própria
- frente absorvendo Supabase Adapter completo
- frente puxando áudio real, Meta ou telemetria profunda
- ausência de smoke por microetapa
- ausência de acceptance smoke final
- ausência de closeout formal

---

## 15. Riscos e bloqueios conhecidos

### R1 — Drift para fala mecânica
Risco de transformar extractor em autor de resposta.
**Mitigação:** smoke explícito e leitura obrigatória do adendo de soberania da IA.

### R2 — Drift para Frente 4
Risco de empurrar persistência completa para dentro desta frente.
**Mitigação:** limitar esta frente a memória viva mínima e shape estrutural.

### R3 — Dump textual disfarçado de memória
Risco de chamar histórico bruto de memória viva.
**Mitigação:** contrato fixa memória viva como contexto útil mínimo e explicável.

### R4 — Multi-intenção virar confusão sem governança
Risco de captar muita coisa e quebrar trilho.
**Mitigação:** toda estrutura deve preservar objetivo atual, bloqueios e pendências.

---

## 16. Regras de implementação

1. Uma PR por recorte.
2. Diagnóstico antes de patch.
3. Smoke obrigatório por PR.
4. Sem refatoração solta fora do recorte.
5. Sem mistura com outras frentes.
6. Sem mudar o objetivo do contrato durante PR de execução.
7. Qualquer desvio exige revisão formal do contrato.
8. Toda PR deve atualizar os vivos conforme `CODEX_WORKFLOW.md`.

---

## 17. Estado inicial da frente

- Contrato ativo: **este contrato**
- Estado inicial: **aberto**
- Última frente encerrada: **Speech Engine e Surface Única**
- Próximo passo autorizado ao abrir este contrato: **PR 35 — abertura contratual da Frente 3**
- Mudanças em dados persistidos (Supabase): **nenhuma**
- Permissões Cloudflare necessárias: **nenhuma adicional**

---

## 18. Próximo passo autorizado após este contrato

O próximo passo autorizado após a criação deste contrato é:

> **Executar a PR 35 — abertura contratual da Frente 3 no repositório, sem implementação funcional.**

---

## 19. Próximo passo autorizado após encerramento da frente

Após o closeout formal desta frente, o próximo passo autorizado passa a ser:

> **Abertura do contrato da Frente 4 — Supabase Adapter e Persistência**

---

## 20. Encerramento esperado da frente

Esta frente só encerra quando:

- PR 35, 36, 37, 38 e 39 estiverem concluídas
- todos os critérios C1–C7 estiverem provados
- o acceptance smoke final estiver passando
- o `CONTRACT_CLOSEOUT_PROTOCOL.md` tiver sido executado
- este contrato tiver sido movido para `schema/contracts/archive/`
- o `_INDEX`, status e handoff estiverem atualizados
- a Frente 4 estiver declarada como próxima frente autorizada

---

## 21. Bloco executivo curto

Resumo executivo desta frente:

- **abrir** o modelo canônico de contexto/extração/memória
- **estruturar** múltiplos sinais do turno
- **provar** captação de mais de um fato por turno sem perder trilho
- **consolidar** memória viva mínima e útil
- **encerrar formalmente** a frente com acceptance smoke e closeout

---

## 22. Conformidade obrigatória com soberania da IA

Este contrato declara conformidade integral com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`

Regra-mãe aplicada nesta frente:

> A IA é soberana em raciocínio e fala.  
> O mecânico informa, valida, restringe e preserva estado.  
> O mecânico jamais recebe prioridade de fala.

Qualquer PR desta frente que viole isso é não conforme e deve parar imediatamente.
