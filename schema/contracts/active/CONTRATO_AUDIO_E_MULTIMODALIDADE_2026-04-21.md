# CONTRATO — FRENTE 5 — AUDIO E MULTIMODALIDADE — ENOVA 2

| Campo                             | Valor |
|-----------------------------------|-------|
| Frente                            | Audio e Multimodalidade |
| Fase do A01                       | Fase 4 (audio end-to-end no mesmo cerebro conversacional) |
| Prioridade do A01                 | Prioridade 5 |
| Dependencias                      | Frente 1 encerrada; Frente 2 encerrada; Frente 3 encerrada; Frente 4 encerrada |
| Legados aplicaveis                | L03 (obrigatorio), L19 (obrigatorio) |
| Referencias obrigatorias          | A00, A01, A02, A00-ADENDO-01, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, CONTRACT_SCHEMA, INDEX_LEGADO_MESTRE, PDF mestre |
| Blocos legados obrigatorios       | L03, L19 |
| Blocos legados complementares     | C* quando confirmados por PDF |
| Ordem minima de leitura da frente | A00 -> A01 -> A00-ADENDO-01 -> A02 -> este contrato -> L03 -> L19 |
| Status                            | Aberto |
| Ultima atualizacao                | 2026-04-21 |

---

## 1. Identificacao canonica

- Nome da frente: **Frente 5 — Audio e Multimodalidade**
- Classificacao: **governanca/contratual de abertura**
- Estado inicial do contrato: **aberto**
- Data de abertura: **2026-04-21**
- Precedencia aplicada: **A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > este contrato > legados aplicaveis**
- Frente predecessora: **Frente 4 — Supabase Adapter e Persistencia (encerrada na PR44)**
- Proxima frente apos closeout esperado: **Frente 6 — Meta/WhatsApp**

## 2. Base documental obrigatoria

Este contrato so pode ser executado com leitura integral de:

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
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`
- `schema/status/SUPABASE_ADAPTER_E_PERSISTENCIA_STATUS.md`
- `schema/handoffs/SUPABASE_ADAPTER_E_PERSISTENCIA_LATEST.md`
- `schema/status/AUDIO_E_MULTIMODALIDADE_STATUS.md`
- `schema/handoffs/AUDIO_E_MULTIMODALIDADE_LATEST.md`

## 3. Objetivo imutavel do contrato

Esta frente existe para adicionar audio end-to-end ao mesmo cerebro conversacional da ENOVA 2, garantindo que:

- transcricao de audio produza evidencia de entrada com confianca mensuravel
- audio transcrito vire o mesmo pacote semantico que o texto ja usa
- o mesmo Extractor processe o pacote semantico de audio
- o mesmo Core decida regra, stage e proximo objetivo
- a mesma persistencia canonica da Frente 4 salve os sinais extraidos
- a mesma surface unica final por turno entregue a resposta ao cliente
- a IA continue soberana na fala; o Core continue soberano na regra

Objetivo operacional final:

> Ter um pipeline multimodal canonico capaz de receber audio, transcrever, produzir evidencia de entrada, normalizar o pacote semantico, extrair sinais estruturados, decidir via Core, falar via IA e persistir via Adapter — sem criar trilho paralelo de decisao, sem dar soberania de regra ao pipeline de audio, e sem criar canal Meta/WhatsApp.

## 4. Item do A01 atendido

- **Prioridade 5**
- **Item:** adicionar audio end-to-end no mesmo cerebro conversacional da ENOVA 2
- **Sai quando:** audio transcrevendo, extraindo e persistindo no mesmo modelo do texto, com closeout formal da frente

## 5. Relacao com A00 e adendo de soberania

Esta frente implementa no A00 os componentes:

- `Media Pipeline` — transcreve audio, normaliza texto, produz evidencia de entrada com score de confianca
- `Conversation Brain` — consolida turno do cliente como pacote semantico unico (texto ou audio)

Regra-matriz permanente (do A00):

- IA continua soberana na fala
- Core continua soberano nas regras e no stage
- Extractor transforma pacote semantico em sinais estruturados — nao fala e nao decide regra
- Adapter persiste e projeta — nunca fala e nunca decide regra de negocio
- Nenhuma camada de audio ganha soberania de decisao ou de fala

Principio do A00 (secao 4.6) aplicado diretamente a esta frente:

> Audio e texto devem alimentar o mesmo cerebro conversacional, a mesma extracao de sinais e a mesma persistencia.

## 6. Principios obrigatorios da frente

1. **Mesmo cerebro:** audio entra no mesmo cerebro conversacional do texto — sem trilho paralelo.
2. **Mesmo extractor:** pacote semantico de audio converge ao mesmo Extractor estruturado ja existente.
3. **Mesma decisao:** Core continua soberano na regra de negocio, gate e proximo objetivo.
4. **Mesma persistencia:** sinais extraidos de audio vao para o mesmo Adapter canonico da Frente 4.
5. **Mesma surface:** uma unica resposta final por turno — nenhuma surface concorrente criada.
6. **IA soberana na fala:** o pipeline de audio nunca escreve resposta ao cliente.
7. **Evidencia de entrada:** transcricao produz evidencia rastreavel com confianca — nao e estado soberano.
8. **Sem canal externo:** nenhuma integracao com Meta/WhatsApp nesta frente.
9. **Sem rollout:** nenhum shadow/canary/cutover nesta frente.
10. **Sem telemetria profunda:** telemetria de produto pertence a Frente 7.

## 7. Escopo incluido

1. Definicao do objeto canonico de entrada de audio (PR46).
2. Definicao de metadados, confianca, evidencia e normalizacao da transcricao (PR46).
3. Definicao do que e transcricao, o que e evidencia e o que nao pode vazar para estado soberano (PR46).
4. Definicao de como audio vira o mesmo pacote semantico usado pelo texto (PR47).
5. Definicao de como multiplos fatos/intencoes em audio convergem ao mesmo Extractor (PR47).
6. Definicao de ambiguidade, confirmacao e confianca no recorte multimodal (PR47).
7. Casca tecnica minima do pipeline multimodal (PR48).
8. Integracao no recorte da frente com speech e persistencia ja existentes (PR48).
9. Smoke integrado de audio provando o fluxo completo (PR49).
10. Closeout formal da frente (PR49).

## 8. Fora de escopo

- canal Meta/WhatsApp
- rollout/shadow/canary
- telemetria profunda da Frente 7
- qualquer decisao de negocio pelo pipeline de audio
- qualquer surface concorrente ao Speech Engine
- implementacao de canal externo nesta frente
- STT/TTS real com servico de producao (casca tecnica e integracao in-process sao suficientes para esta frente)
- autoria de fala por transcritor, parser de audio ou pipeline de media
- logica de audio separada do cerebro conversacional do texto

## 9. Entradas da frente

- Frente 1 encerrada: Core Mecanico 2 com decisao estrutural estavel.
- Frente 2 encerrada: Speech Engine com IA soberana na fala e surface unica.
- Frente 3 encerrada: Extractor de sinais estruturados e memoria viva operacional.
- Frente 4 encerrada: Supabase Adapter canonico com persistencia idempotente e auditavel.
- Referencia legada L03 (mapa canonico do funil) e L19 (analista MCMV, interpretacao de perfil).
- PDF mestre como fonte canonica de negocio.

## 10. Saidas esperadas da frente

- objeto canonico de entrada de audio definido
- pipeline multimodal base implementado como casca tecnica minima
- convergencia audio → pacote semantico → Extractor provada
- decisao pelo Core sem trilho paralelo provada
- persistencia canonica da Frente 4 funcionando para sinais de audio
- smoke integrado de audio passando (transcricao → extracao → decisao → fala → persistencia)
- closeout formal com contrato arquivado

## 11. Legados aplicaveis

- **Obrigatorios:** L03 (mapa canonico do funil — stages, gates, microregras) e L19 (analista MCMV, interpretacao de perfil e perguntas adicionais inteligentes)
- **Complementares:** C* quando confirmados por necessidade real no PDF mestre
- **Fonte PDF:** `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — consultar secoes de audio, multimodalidade e interpretacao de perfil

## 12. Entregavel macro da frente

Ao final, a ENOVA 2 deve ter um pipeline multimodal operacional onde:

- audio entra e e transcrito com evidencia rastreavel
- a transcricao vira o mesmo pacote semantico do texto
- o mesmo Extractor estruturado processa o pacote
- o mesmo Core decide regra e stage
- o mesmo Adapter persiste sinais extraidos
- a mesma surface unica entrega a resposta ao cliente
- nenhum trilho paralelo de audio existe

## 13. PRs oficiais da frente (ordem imutavel)

### PR 45 — Abertura contratual da Frente 5

**Classificacao:** governanca  
**Objetivo:** abrir contrato, vivos e base documental da frente (sem implementacao funcional).  
**Deve entregar:** contrato ativo + `_INDEX` atualizado + status + handoff.  
**Nao deve entregar:** implementacao de audio, transcritor real, pipeline funcional, canal externo.

### PR 46 — Contrato de audio, transcricao e evidencia de entrada

**Classificacao:** contratual  
**Objetivo:** definir o objeto canonico de entrada de audio e o contrato de transcricao.  
**Microetapas:**
1. definir objeto canonico de entrada de audio (campos, tipos, metadados)
2. definir metadados de transcricao: confianca, source, duracao, codec, lingua
3. definir o que e evidencia de entrada e o que nao pode vazar para estado soberano
4. definir normalizacao minima do texto transcrito antes de entrar no cerebro conversacional
5. smoke documental/estrutural do contrato de audio

### PR 47 — Convergencia audio → pacote semantico → extracao estruturada

**Classificacao:** contratual  
**Objetivo:** definir como audio vira o mesmo pacote semantico usado pelo texto.  
**Microetapas:**
1. definir como a transcricao normalizada vira pacote semantico identico ao do texto
2. definir como multiplos fatos/intencoes em audio convergem ao mesmo Extractor
3. definir tratamento de ambiguidade e confianca no recorte multimodal
4. definir confirmacao de slot quando confianca de audio e baixa
5. smoke de convergencia semantica (audio vs texto → mesmo pacote)

### PR 48 — Pipeline base multimodal + integracao com speech/persistencia

**Classificacao:** contratual  
**Objetivo:** criar casca tecnica minima do pipeline multimodal integrado.  
**Microetapas:**
1. criar casca tecnica do Media Pipeline (recebe audio, devolve transcricao + evidencia)
2. integrar transcricao com Conversation Brain (mesmo pacote semantico)
3. integrar pacote semantico de audio com Extractor existente
4. integrar sinais extraidos com Adapter da Frente 4 (persistencia canonica)
5. smoke do pipeline base multimodal (sem Meta/WhatsApp, sem rollout)

### PR 49 — Smoke integrado de audio + closeout formal da Frente 5

**Classificacao:** contratual + closeout  
**Objetivo:** provar o fluxo completo de audio e encerrar o contrato formalmente.  
**Microetapas:**
1. smoke integrado: audio → transcricao → extracao → decisao → fala → persistencia
2. provar convergencia: audio e texto alimentam o mesmo modelo
3. provar soberania preservada: IA fala, Core decide, Adapter persiste, sem trilho paralelo
4. executar `CONTRACT_CLOSEOUT_PROTOCOL.md`
5. arquivar contrato e atualizar vivos

## 14. Criterios de aceite da frente

C1. Audio entra no mesmo cerebro conversacional do texto — sem trilho paralelo de decisao.  
C2. Transcricao produz evidencia de entrada rastreavel com confianca mensuravel.  
C3. Pacote semantico de audio e identico ao do texto (mesmo formato, mesma interface).  
C4. Extractor estruturado funciona no recorte multimodal sem modificacao de soberania.  
C5. Persistencia continua explicavel: sinais de audio salvos via Adapter canonico da Frente 4.  
C6. IA continua soberana na fala; nenhuma camada de audio escreve resposta ao cliente.  
C7. Core continua soberano na regra de negocio; nenhuma decisao tomada pelo pipeline de audio.  
C8. Surface unica continua unica; nenhuma surface concorrente criada.  
C9. Closeout formal concluido somente apos smoke integrado de audio aprovado.

## 15. Criterios de closeout

O contrato so pode encerrar quando:

1. PR45, PR46, PR47, PR48 e PR49 estiverem concluidas.
2. C1-C9 estiverem comprovados por evidencias objetivas.
3. Smoke integrado de audio (transcricao → extracao → decisao → fala → persistencia) estiver passando.
4. `CONTRACT_CLOSEOUT_PROTOCOL.md` estiver integralmente cumprido.
5. Contrato for movido para `schema/contracts/archive/`.
6. `_INDEX`, status e handoff da frente estiverem atualizados.

## 16. Criterios de nao conformidade

- Pipeline de audio criando trilho paralelo de decisao separado do Core.
- Transcritor ou parser de audio assumindo autoria de fala ou decisao de regra.
- Persistencia de audio sem passar pelo Adapter canonico da Frente 4.
- Canal Meta/WhatsApp criado nesta frente.
- Rollout ou shadow mode iniciado nesta frente.
- Telemetria profunda da Frente 7 misturada nesta frente.
- Qualquer surface concorrente ao Speech Engine criada nesta frente.
- Evidencia de audio tratada como estado soberano sem politica explicita.
- Qualquer implementacao fora da ordem PR45→PR49.

## 17. Riscos e bloqueios conhecidos

R1. **Drift de cerebro:** pipeline de audio tentando criar logica de conversacao separada do texto.  
Mitigacao: principio do pacote semantico unico — audio e texto devem produzir o mesmo objeto antes do Extractor.

R2. **Soberania de transcricao:** transcritor ou parser de audio assumindo autoria de decisao ou de fala.  
Mitigacao: limites de soberania declarados no contrato + smoke de soberania na PR49.

R3. **Confianca descontrolada:** sinal de audio com baixa confianca vazar como fato confirmado.  
Mitigacao: politica de confianca e confirmacao de slot definida na PR47.

R4. **Persistencia divergente:** sinais de audio salvos fora do Adapter canonico da Frente 4.  
Mitigacao: integracao direta com o Adapter existente na PR48, sem novo adapter de audio.

R5. **Scope creep:** tentativa de incluir Meta/WhatsApp, rollout ou telemetria profunda nesta frente.  
Mitigacao: criterios de nao conformidade explicitos + revisao formal obrigatoria se houver desvio.

## 18. Regras de implementacao da frente

1. Uma PR por recorte oficial.
2. Diagnostico READ-ONLY antes de qualquer patch.
3. Smoke obrigatorio por PR.
4. Sem refatoracao solta.
5. Sem mistura com outras frentes.
6. Sem alteracao silenciosa do objetivo do contrato.
7. Qualquer desvio exige revisao formal.
8. Atualizacao viva obrigatoria em toda PR.

## 19. Estado inicial da frente

- Contrato ativo: **este contrato**
- Estado inicial: **contrato aberto**
- Ultima frente encerrada: **Frente 4 (PR44)**
- Proximo passo autorizado ao abrir: **PR46 — contrato de audio, transcricao e evidencia de entrada**
- Mudancas em dados persistidos (Supabase): **nenhuma nesta PR45**
- Permissoes Cloudflare necessarias: **nenhuma adicional**

## 20. Proximo passo autorizado

> **Executar PR46 — contrato de audio, transcricao e evidencia de entrada da Frente 5, ainda sem STT/TTS real e sem implementacao de canal externo.**

## 21. Bloco executivo curto

- abrir governanca completa da Frente 5
- definir o objeto canonico de audio e a convergencia com o cerebro conversacional existente
- quebrar execucao em PR46-PR49 com microetapas claras
- preservar soberania do Core e da IA em todo o pipeline de audio
- impedir trilho paralelo, fala mecanica e persistencia divergente

## 22. Conformidade com soberania da IA

Este contrato declara conformidade integral com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`

Regra-matriz aplicada:

> IA soberana em raciocinio e fala — inclusive na fala sobre informacoes de audio.  
> Core soberano em regra de negocio, gate e stage — o pipeline de audio nunca decide regra.  
> Extractor soberano apenas na transformacao do pacote semantico em sinais estruturados.  
> Supabase Adapter soberano apenas em persistencia estrutural auditavel.  
> Nenhuma camada de audio ou transcricao tem permissao para escrever resposta final ao cliente ou decidir regra de negocio.
