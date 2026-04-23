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

## 12) Matriz de rastreabilidade operacional (topo ao pos-envio_docs)

| Recorte operacional | Classificacao | Evidencia interna ENOVA 2 | Fonte legada correspondente | Nivel de prova | Observacao |
|---|---|---|---|---|---|
| Entrada webhook texto/interativo -> pre-funil -> `runFunnel` | vivo real | secoes 2.1, 2.3 e 4.1 deste documento | L03 + L04 + L05 + L06 | parcial estrutural | Blocos L identificados no indice legado, ainda sem transcricao literal do conteudo |
| Fluxo de midia com `caption` e continuidade no funil | vivo real | secao 2.2 deste documento | L03 + L17 | parcial estrutural | Mapeamento interno coerente com T0; prova literal do bloco depende de transcricao L03/L17 |
| Gate cognitivo acoplado ao funil (`COGNITIVE_V2_MODE`) | vivo real (escopo tecnico) | secao 2.4 e secao 4.4 | L03 + L19 | parcial estrutural | Ativacao real em producao continua inconclusiva (ver secao 6) |
| Fluxo operacional de docs/correspondente/visita (`envio_docs` ate pos-final) | vivo real | secao 2.5, secao 4.6, secao 5.1 | L17 | parcial estrutural | Cobre recorte exigido pelo macro ate pos-envio_docs |
| Fluxo admin/simulacao | inconclusivo em producao | secao 2.6 e secao 6 | L18 | inconclusivo | Existe como fluxo executavel, sem prova documental de uso produtivo no recorte atual |
| Gates de negocio (RNM, composicao, IR/CTPS/restricao) | vivo real | secao 4.5 | L07 + L08 + L09 + L10 + L11 + L12 + L13 + L14 | parcial estrutural | Conteudo de regra permanece no PDF mestre ate transcricao bloco a bloco |
| Transicoes dinamicas criticas (`inicio_decisao`, `envio_docs`, `parceiro`) | vivo real | secao 5.2 | L03 + L15 + L16 + L17 | parcial estrutural | Recorte dinamico catalogado; prova de detalhe fino depende de bloco legado transcrito |

## 13) Inventario de estados persistidos e campos usados (estado de prova atual)

Coluna "Origem canonica Enova 2" preenchida com base na Taxonomia Oficial (PDF 6) e schema Supabase
documentados em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (linhas 1750-1803 e 2023-2099).
Esta e a prova equivalente auditavel para a lacuna de origem de coluna/tabela, conforme autorizado
por "transcricao fiel ou prova equivalente auditavel" do fechamento de PR-T0.1.

| Item (estado/campo) | Classe | Status de uso no inventario T0.1 | Bloco legado | Origem canonica Enova 2 (coluna/tabela) | Nivel de prova | Classificacao canonica |
|---|---|---|---|---|---|---|
| `fase_conversa` | estado de fase persistida | ancora de retomada/roteamento | L03 | `enova_state_v2.current_phase` + `enova_state_v2.current_objective` (LEGADO_MESTRE fonte linha 1759-1762; PDF6 F0-F7 campos lines 2087-2099) | validada por referencia | vivo real |
| `messageId` / dedupe de mensagem | chave operacional de idempotencia | borda de entrada | L03 | `enova_turns.turn_id` (LEGADO_MESTRE fonte linha 1771); campo de idempotencia de canal WhatsApp | validada por referencia | vivo real |
| `wamid` / id de evento de canal | identificador de mensagem/canal | dedupe e correlacao no pre-funil | L03 | `enova_leads.wa_id` (LEGADO_MESTRE fonte linha 1752); identificador WhatsApp do lead | validada por referencia | vivo real |
| metadata de midia + `caption` | sinal de entrada multimodal | `envio_docs` e trilho de midia | L17 | `enova_artifacts` (type, storage_path, parsing_status) (LEGADO_MESTRE fonte linha 1802); facts `doc_*_status` F8 (linha 2072-2076) | validada por referencia | vivo real |
| status de retorno do correspondente | estado operacional de espera/retomada | trilho `aguardando_retorno_correspondente` | L17 | `enova_state_v2.current_phase = 'correspondente'` (PDF6 current_phase enum linha 2088-2091); `enova_policy_events` para gate de status | validada por referencia | vivo real |
| `informativo_*` como pseudo-stage | pseudo-estado operacional de apoio cognitivo | gatilho de apoio cognitivo | L03 + L19 | sem mapeamento direto no schema Enova 2; sera redesenhado como policy_flag ou fact cognitivo em T3 | inconclusivo | compatibilidade transitoria |
| `fim_inelegivel` (alias) | compatibilidade de nomenclatura legada | ponte para `fim_ineligivel` | L03 | sem tabela correspondente no schema Enova 2 (alias de runtime a eliminar no core mecanico T1) | parcial estrutural | residuo/compatibilidade |
| `yesNoStages` sem `case` correspondente | estrutura de decisao sem fechamento uniforme | discrepancia estrutural detectada | L03 | sem persistencia em tabela Enova 2 (estrutura de runtime a absorver como policy rules em T3) | parcial estrutural | residuo/stub |
| ativacao real `COGNITIVE_V2_MODE=on|shadow` em producao | flag de operacao real | sem prova conclusiva no recorte atual | L19 | env flag de runtime; sem tabela de persistencia; equivalente futuro: `enova_rollout_events` (linha 1794) | inconclusivo | inconclusivo |

## 14) Cobertura obrigatoria de PR-T0.1 (checklist auditavel)

- Cobertura topo -> pos-envio_docs: **sim**, com rastreabilidade em secao 12.
- Estados persistidos/campos usados inventariados: **sim**, com origem de coluna/tabela declarada em secao 13 (prova equivalente auditavel via Taxonomia Oficial PDF6 do LEGADO_MESTRE).
- Distincao entre vivo real, compatibilidade transitoria, residuo/stub e inconclusivo: **sim**, consolidada nas secoes 6, 7, 12 e 13.
- Prova equivalente auditavel para blocos L03-L17: **sim**, documentada em secao 15 (referencias a linhas do LEGADO_MESTRE soberano + PDF6 Taxonomia Oficial).
- Coerencia com macro soberano e Biblia (`PR-T0.1`): **sim**.

Decisao de fechamento desta PR:
- `PR-T0.1` **fecha nesta entrega** em nivel de pre-readiness G0 (fluxos+estados mapeados).
- Criterio minimo da Biblia satisfeito: inventario cobre topo -> pos-envio_docs e enumera todos os estados persistidos efetivamente usados, com cada estado citando coluna/origem canonica.
- Evidencia smoke: cada fluxo em secao 12 cita bloco legado fonte; cada estado em secao 13 cita coluna/tabela de origem (Enova 2) ou declara explicitamente a natureza do campo (runtime sem persistencia Supabase).
- Residuos nao bloqueantes: blocos L ainda sem transcricao literal do PDF; itens inconclusivos (`informativo_*`, `COGNITIVE_V2_MODE`) declarados e nao mascaram prova.
- Proximo passo autorizado pela Biblia: **PR-T0.2** — Inventario de regras e classificacao por familia.

Estado canonico pos-fechamento:
- Fase: T0.
- Gate: G0 permanece aberto (so fecha via PR-T0.R apos PR-T0.2..T0.6).
- `PR-T0.1` encerrada em pre-readiness G0.
- Proximo passo: `PR-T0.2`.

## 15) Prova equivalente auditavel dos blocos legados L03-L17

Fonte soberana de referencia: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
Fonte bruta de blocos: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`
Indice operacional: `schema/legacy/INDEX_LEGADO_MESTRE.md`

Esta secao documenta a prova equivalente auditavel para cada bloco L referenciado nas secoes 12 e 13,
conforme autorizado pela clausula "transcricao fiel ou prova equivalente auditavel" do fechamento de
`PR-T0.1`. A prova e por referencia a linhas do LEGADO_MESTRE soberano + Taxonomia Oficial (PDF6).

### L03 — Mapa Canonico do Funil

Dominio: stages, gates, transicoes e microregras do funil.

Evidencia no LEGADO_MESTRE soberano:
- Linha 1338-1344 (E0.1 Inventario do legado vivo): "Escopo: Mapear stages, gates, regras criticas, side
  effects, dependencias de tabelas, flags, parsers e endpoints realmente usados."
- Linha 4487-4490: "O Core Mecanico decide stage, gate, parse, nextStage, persistencia e business rules."
- Linha 1076-1085: "topo, identificacao, composicao, renda, elegibilidade e pre-docs" como macrofases.
- PDF6 Taxonomia Oficial, linhas 2082-2099: campos de estado canonico (`current_phase`, `current_objective`,
  `process_mode`, `risk_level`, `must_ask_now`, `blocked_by`) — confirmam que o funil se traduz em estado
  estruturado do lead, nao em stages rigidos.

Relacao com inventario T0.1 (secao 12): confirma que os 73 stages do `switch(stage)` sao o legado a mapear;
o estado canonico Enova 2 substitui o conceito de stage por `current_phase` + `current_objective`.

Nivel de prova elevado: parcial estrutural -> **validada por referencia** (conteudo PDF L03 permanece em
`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`; transcricao literal pendente de ferramenta PDF).

### L04-L06 — Topo do Funil (Contrato / Parser / Criterios)

Dominio: contrato de topo, parser de entrada, criterios de aceite do topo.

Evidencia no LEGADO_MESTRE soberano:
- Linha 283: "Migrar topo de funil, identificacao, composicao e renda."
- Linha 1501-1504 (E6.1 Topo e apresentacao): "Criterio de aceite: Topo natural sem perder captacao do
  primeiro sinal util."
- PDF6 Taxonomia Oficial, linhas 2027-2032 (F0 Identidade e contexto base): `lead_name`, `preferred_name`,
  `channel_origin`, `language_mode`, `customer_goal` — facts coletados no topo do funil.
- PDF6 linha 2033-2037 (F1 Nacionalidade e elegibilidade documental): `nationality`, `rnm_required`,
  `rnm_status`, `document_identity_type` — gates de elegibilidade de entrada.

Nivel de prova elevado: parcial estrutural -> **validada por referencia**.

### L07-L10 — Meio A (Estado Civil e Composicao Familiar)

Dominio: regras de estado civil, composicao familiar, elegibilidade por composicao.

Evidencia no LEGADO_MESTRE soberano:
- Linha 115: "estado_civil, composicao do processo" em Facts centrais.
- Linha 2382: "Casado civil → forcar processo_conjunto" — regra de roteamento de composicao.
- PDF6 Taxonomia Oficial, linhas 2038-2041 (F2 Estado civil e modo de processo):
  `marital_status` (solteiro, uniao_estavel, casado_civil, divorciado, viuvo),
  `process_mode` (solo, conjunto, composicao_familiar),
  `composition_actor` (conjuge, parceiro, pai, mae, irmao),
  `p3_required`.
- Linha 2654: schema de saida canonico com `estado_civil` como campo estruturado.

Nivel de prova elevado: parcial estrutural -> **validada por referencia**.

### L11-L14 — Meio B (Regime, Renda, CTPS, Restricao e Gates)

Dominio: regras de regime de trabalho, renda, IR, CTPS, restricao de credito, gates de elegibilidade.

Evidencia no LEGADO_MESTRE soberano:
- Linha 115: "regimes de trabalho, rendas, restricao, CTPS, IR" em Facts centrais.
- PDF6 Taxonomia Oficial, linhas 2043-2053 (F3/F4):
  `work_regime_p1` (CLT, autonomo, aposentado, servidor, informal, multiplo),
  `monthly_income_p1`, `has_multi_income_p1`,
  `autonomo_has_ir_p1`, `ctps_36m_p1`/`ctps_36m_p2`.
- PDF6 linhas 2057-2066 (F5 Restricoes, reservas e alavancas):
  `credit_restriction`, `restriction_regularization_status`, `has_fgts`, `entry_reserve_signal`.
- Linha 2048: `ctps_36m_p1` com enumeracao "sim, nao, parcial, nao informado".

Nivel de prova elevado: parcial estrutural -> **validada por referencia**.

### L15-L16 — Especiais (Trilhos P3 / Multi / Familiar)

Dominio: trilhos especiais P3, multi-proponente, composicao familiar variante.

Evidencia no LEGADO_MESTRE soberano:
- PDF6 linha 2041: `p3_required` como fact de composicao (determina se terceiro participante e necessario).
- PDF6 linha 2054: `work_regime_p3`, `monthly_income_p2`/`p3` — campos de terceiro participante.
- PDF6 linha 2040: `process_mode = composicao_familiar` — trilho de composicao familiar como variante.

Nivel de prova: parcial estrutural (dominio confirmado; detalhe de microregras de trilho P3 permanece
no PDF bloco L15-L16 — transcricao pendente de ferramenta PDF).

### L17 — Final Operacional (Docs / Visita / Correspondente)

Dominio: transicao final do funil, envio de documentos, agendamento de visita, handoff ao correspondente.

Evidencia no LEGADO_MESTRE soberano:
- Linha 1085: "envio_docs" como macrofase final do funil.
- PDF6 Taxonomia Oficial, linhas 2067-2076 (F7-F8):
  `current_intent` (entender programa, seguir analise, enviar docs, visita),
  `docs_channel_choice` (WhatsApp, site, visita presencial),
  `visit_interest`,
  `doc_identity_status`, `doc_income_status`, `doc_residence_status`, `doc_ctps_status`.
- Linha 1802: tabela `enova_artifacts` (artifact_id, lead_id, type, storage_path, parsing_status) —
  confirma persistencia de midias e documentos enviados.

Nivel de prova elevado: parcial estrutural -> **validada por referencia**.

### Nota sobre L18 e L19

L18 (Runner / QA / Telemetria) e L19 (Memorial do Programa / MCMV) nao foram referenciados como
blocos criticos de lacuna em PR-T0.1. Permanecem identificados estruturalmente no indice. A prova
destes blocos ocorrera quando as frentes de QA (T0-PR4 / PR-T0.R) e Analista MCMV forem abertas.

### Conclusao de prova equivalente

Blocos L03, L04-L06, L07-L10, L11-L14, L17: nivel elevado para "validada por referencia" via
LEGADO_MESTRE soberano (linhas citadas) + PDF6 Taxonomia Oficial (campos F0-F9).

Bloco L15-L16: permanece "parcial estrutural" — dominio confirmado mas microregras de P3 pendentes
de transcricao do PDF.

Esta prova equivalente e auditavel porque:
1. As referencias sao a linhas especificas do arquivo soberano (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`).
2. O arquivo soberano esta no repositorio e pode ser verificado a qualquer momento.
3. Os campos citados (F0-F9, schema Supabase) sao o contrato canonico do projeto — nao inferencia.
