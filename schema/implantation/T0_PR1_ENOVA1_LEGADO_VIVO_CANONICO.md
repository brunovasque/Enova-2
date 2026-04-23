# T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO

## Finalidade

Internalizar, dentro da ENOVA 2, o inventario do legado vivo real da ENOVA 1 com evidencia documental auditavel e sem dependencia externa.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

## Escopo deste inventario

- Mapear fluxo ativo real, estados/stages/gates realmente usados e transicoes observaveis.
- Separar bloco inconclusivo de bloco com padrao de resíduo/stub/legado morto.
- Registrar divergencias entre documentacao antiga e runtime real.
- Preservar regra de evidencia: sem prova de uso real no codigo executavel atual ou teste executado no repositorio, classificar como inconclusivo.

Fora de escopo:
- Implementacao funcional de runtime, memoria, telemetria nova ou integracoes externas.
- Refatoracao da E1 nesta etapa.

## 1) Objetivo do inventario

Inventariar o legado vivo real da ENOVA 1 com evidencia auditavel, separando:

- fluxo ativo hoje;
- estado/stage/gate realmente usado;
- bloco com evidencia fraca ou inconclusiva;
- bloco com padrao de resíduo/stub/legado morto;
- divergencia entre documentacao e runtime atual.

Criterio canonico:
- sem prova de uso real no codigo executavel atual ou em teste executado no repositorio, classificar como inconclusivo.

## 2) Fluxos vivos reais

### 2.1 Fluxo de entrada real

- webhook de texto/interativo roteando ate `runFunnel`;
- pre-funil ativo com:
  - dedupe por `wamid`;
  - bypass de atendimento manual;
  - comandos e retornos de correspondente;
  - `offtrackGuard` pre-`runFunnel`.

### 2.2 Fluxo de midia

- midia suportada entra por envelope proprio;
- persiste metadata;
- chama `runFunnel` com `caption` quando existir.

### 2.3 Fluxo mecanico central

- `runFunnel` e o trilho principal de decisao de stage;
- `switch(stage)` atual contem 73 cases unicos.

### 2.4 Fluxo cognitivo acoplado ao funil

- gate cognitivo ativo;
- branching por `COGNITIVE_V2_MODE = off|shadow|on`;
- uso de contrato cognitivo, validacao de sinal, adaptacao canonica e unificacao de surface.

### 2.5 Fluxo operacional docs/correspondente/visita

- `envio_docs` processa midia;
- reprocessa checklist;
- pode avancar dinamicamente;
- pacote de correspondente pronto influencia saida;
- `finalizacao_processo` e `aguardando_retorno_correspondente` formam trilho vivo.

### 2.6 Fluxo admin/simulacao

- existe fluxo executavel de simulacao/admin;
- nao confundir com fluxo produtivo principal.

## 3) Stages/estados vivos reais

- ha 73 stages vivos no `switch(stage)` atual do `runFunnel`;
- alem disso existem pseudo-stages `informativo_*` usados como gatilho/apoio cognitivo, mas nao como `case` dedicados.

## 4) Gates vivos reais

### 4.1 Gates de entrada/roteamento

- dedupe por `messageId`;
- bypass de atendimento manual;
- desvio de comandos e retornos do correspondente antes do funil principal.

### 4.2 Gates globais no `runFunnel`

- reset QA por comando;
- reset global com retorno silencioso;
- interceptador global de saudacao com retomada de fase real.

### 4.3 Gate deterministico sim/nao

- `yesNoStages` ativo com trava de offtrack deterministica.

### 4.4 Gate cognitivo ativo

- ativacao por `shouldTriggerCognitiveAssist`;
- whitelist de stages;
- validacao de sinal;
- threshold de confianca.

### 4.5 Gates de negocio vivos

- RNM;
- estado civil/composicao;
- IR/CTPS/restricao;
- restricao alta sem regularizacao levando a ineligibilidade.

### 4.6 Gates operacionais docs/correspondente

- `envio_docs` por midia/texto/checklist/pacote pronto;
- `aguardando_retorno_correspondente` com gate de status e loop de espera.

## 5) Transicoes reais e ativas

- 73 stages unicos no `switch(stage)`;
- 309 transicoes detectadas por chamadas `step(...)` dentro de `runFunnel`;
- parte literal e parte dinamica.

### 5.1 Espinha dorsal observavel

- topo:
  - `inicio -> inicio_programa|inicio_decisao -> inicio_nome -> inicio_nacionalidade -> inicio_rnm -> inicio_rnm_validade -> estado_civil`;
- composicao/renda:
  - `estado_civil -> somar_renda_* -> regime_* -> renda* -> ir_declarado -> ctps_36* -> restricao* -> regularizacao_*`;
- operacional:
  - `envio_docs -> envio_docs|agendamento_visita|finalizacao_processo`;
- final:
  - `finalizacao_processo -> finalizacao_processo|aguardando_retorno_correspondente|agendamento_visita`;
- pos-final:
  - `aguardando_retorno_correspondente -> aguardando_retorno_correspondente|agendamento_visita|inicio_programa`.

### 5.2 Transicoes dinamicas relevantes

- `inicio_decisao => st.fase_conversa || "inicio_programa"`;
- `ctps_36_parceiro => isModoFamiliar(st) ? "restricao_parceiro" : "restricao"`;
- `envio_docs => resposta.keepStage || "envio_docs"`, `resposta.nextStage`, `nextStageAfterUpload`;
- `restricao_parceiro => nextStage`;
- `parceiro_tem_renda => nextStage`.

## 6) Blocos inconclusivos

- `finalizacao` como stage principal: inconclusivo;
- uso real de rotas admin em operacao: inconclusivo;
- ativacao real de `COGNITIVE_V2_MODE=on|shadow` em producao: inconclusivo;
- `informativo_*` como `fase_conversa` persistida: inconclusivo.

## 7) Blocos com padrao de residuo, stub ou legado morto

- `handleCorrespondenteRetorno(env, msg)` e `parseCorrespondenteBlocks(rawText)` sem callsite estatico atual;
- `fim_inelegivel` como alias/ponte para `fim_ineligivel`;
- fallbacks explicitos de `UNKNOWN_STAGE_REFERENCED` em alguns stages;
- chaves em `yesNoStages` sem `case` correspondente;
- artefatos de suite/admin nao devem ser confundidos com fluxo produtivo.

## 8) Divergencias entre documentacao e runtime

- docs marcam `inicio_nacionalidade` como orfao/desligado, mas o runtime mostra transicao ativa;
- auditoria de gates documenta ausencia de `case` que existe no runtime;
- auditoria de gates documenta duplicidade que nao bate com o `switch(stage)` atual;
- diagnostico cognitivo antigo lista escopo menor do que o efetivamente ativo;
- diagnostico antigo descreve concatenacao mecanica fixa, mas o runtime atual usa renderizacao cognitiva e tomada final.

## 9) Implicacoes para a ENOVA 2

- T0.1 deve considerar 73 stages do `switch(stage)` como trilho vivo real, nao so funil minimo;
- fluxos pre-funil entram no inventario de borda operacional;
- `informativo_*` deve ser tratado como pseudo-stage operacional, nao como lixo;
- alguns nos devem ser tratados como compatibilidade legada ate prova de desuso;
- artefatos de suite/admin nao podem ser confundidos com fluxo produtivo.

## 10) Conclusao objetiva

- o legado vivo real esta concentrado em:
  - entrada webhook;
  - `runFunnel`;
  - 73 stages;
  - gates operacionais ativos.
- existem blocos de compatibilidade legada ativos no codigo;
- ha divergencia documental relevante;
- para inventario T0.1, a fonte primaria confiavel e o codigo vivo, nao documentos antigos sem reconciliacao.

## 11) Vinculo com T0

Esta entrega consolida continuidade documental de `PR-T0.1` no proprio repo ENOVA 2.

O que esta entrega fecha:
- internalizacao canonica do inventario do legado vivo real da ENOVA 1, sem dependencia externa.

O que esta entrega nao fecha:
- implementacao real de memoria;
- implementacao real de telemetria nova;
- migracao funcional da E1;
- fechamento automatico de G0.
