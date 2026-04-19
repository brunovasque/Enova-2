ENOVA 2 — A00
Plano Canônico Macro
Documento-mãe de fundação, precedência e direção arquitetural
Natureza Documento-mãe de fundação da ENOVA 2
Função Definir visão, precedência, arquitetura macro, ordem oficial de frentes e critérios de pronto
Uso obrigatório Sempre enviar junto com A01 e A02 em novas abas da ENOVA 2
Diretriz central: a ENOVA 2 não nasce para melhorar frases soltas. Ela nasce para criar uma nova
fundação operacional, multimodal, contextual e governada por contratos
1. Finalidade do A00
Este documento existe para impedir drift, retrabalho e confusão de direção na ENOVA 2. Ele não é um
contrato de implementação detalhada; ele é o documento-mãe que define o que a ENOVA 2 é, por que
ela existe, qual arquitetura deve seguir, quais documentos mandam no projeto e em que ordem as
frentes serão abertas.
A ENOVA 2 nasce como um sistema novo, em repositório separado, LLM-first por arquitetura, mas
preso a regras duras do Minha Casa Minha Vida. A Enova 1 continua como referência histórica,
operacional e de negócio, mas não como base de surface, fallback ou orquestração de fala.
2. Problema fundador que motivou a ENOVA 2
A Enova 1 provou o valor do funil, das regras, dos stages, das microregras e da telemetria. Também
provou, na prática, o limite da arquitetura híbrida atual: múltiplas camadas concorrem pela fala final;
bridges coletam slot cedo; fallbacks genéricos vazam em coleta crítica; o trilho mecânico acerta a
decisão, mas a surface final pode falar outra coisa.
A ENOVA 2 não nasce para 'melhorar wording'. Ela nasce para resolver a falha de fundação: uma única
arquitetura de decisão e uma única arquitetura de fala, com LLM natural, contextual, multimodal e
inteligente, porém sob contrato duro de negócio e persistência.
3. Objetivo macro da ENOVA 2
A ENOVA 2 deve se comportar como uma analista virtual de MCMV: natural na fala, forte em contexto,
capaz de interpretar texto e áudio, apta a lidar com múltiplas informações no mesmo turno, capaz de
responder dúvidas reais, de coletar dados com inteligência e de decidir, sob regras, o que salvar, o que
confirmar, o que perguntar e o que deixar pendente.
A ENOVA 2 deve operar com quatro soberanias claramente separadas: (1) Policy/Core decide regra e
stage; (2) Extractor transforma fala livre em sinais estruturados; (3) Speech Engine monta a resposta
final; (4) Persistence Adapter grava estado, evidências e memória operacional no Supabase.
4. Princípios fundadores e inegociáveis
4.1 O negócio manda. As regras do MCMV, do funil e das microregras legadas são a fonte de verdade
de negócio.
4.2 O mecânico segue soberano em parse, gates, next-step autorizado, critérios de elegibilidade e
persistência estrutural. O LLM não decide regra de negócio.
4.3 Uma única surface final por turno. Nenhuma outra camada pode competir pela fala final depois que
a resposta for montada.
4.4 O LLM pode ser natural, rico e consultivo, mas nunca livre para pular estágio, inventar coleta ou
contradizer a política.
4.5 O cliente nunca pode ficar sem continuidade operacional quando existe next step de coleta. Ao
mesmo tempo, nenhuma ponte pode coletar o slot do próximo stage por vazamento acidental.
4.6 Áudio e texto devem alimentar o mesmo cérebro conversacional, a mesma extração de sinais e a
mesma persistência.
4.7 O Supabase é memória operacional estruturada, não depósito caótico de texto solto.
4.8 O projeto inteiro deve ser governado por precedência documental explícita.
5. Escopo do A00
6. O A00 cobre: visão, fundação, arquitetura macro, documentos oficiais, precedência, frentes, ordem de
implantação, critérios macro de pronto, convivência com a Enova 1 e critérios de rollout.
O A00 não entra em detalhe de implementação por arquivo, payload, rota, query ou PR específica. Isso
pertence aos contratos de frente e ao Backlog Mestre + Ordem Executiva.
6. Fora de escopo do A00
Não define schema final de cada tabela.
Não define prompts linha a linha.
Não define rotas exatas da Meta.
Não define parser por regex específico.
Não substitui os contratos de Core, Speech, Contexto, Áudio, Supabase, Meta, Telemetria e Rollout.
7. Fontes de verdade e precedência documental
Ordem oficial de precedência:
1) A00 — Plano Canônico Macro da ENOVA 2.
2) A01 — Backlog Mestre + Ordem Executiva.
3) A02 — Índice Mestre de Integração dos 19 Legados e Guia de Envio.
4) Contrato específico da frente ativa.
5) 19 documentos legados do funil e das regras, como base de negócio.
6) Handoffs e anotações históricas, apenas como apoio e nunca acima das fontes anteriores.
Regra de conflito: se um documento legado colidir com um contrato novo de frente, o contrato novo só
vence se não violar o A00, o A01 e a lógica de negócio consolidada no A02.
8. Modelo macro de arquitetura da ENOVA 2
8.1 Canal Adapter: recebe eventos de texto, áudio, mídia e metadados do canal.
8.2 Media Pipeline: transcreve áudio, normaliza texto, extrai anexos e produz evidências de entrada
com score de confiança.
8.3 Conversation Brain: consolida o turno do cliente como um único pacote semântico, capaz de conter
múltiplos fatos, intenções, objeções e perguntas.
8.4 Extraction & Slot Resolver: transforma o pacote semântico em sinais estruturados, candidatos a slot,
pendências, ambiguidades e itens de confirmação.
8.5 Policy / Mechanical Core: aplica as regras do MCMV, do funil e da composição familiar; decide o
que foi aceito, o que precisa confirmar e qual próximo objetivo operacional autorizado.
8.6 Speech Engine: monta uma única resposta final, natural e contextual, obedecendo o contrato do
stage/objetivo atual.
8.7 Persistence Adapter: grava estado operacional, evidência, contexto útil, memória curta, flags de
confirmação e histórico explicável no Supabase.
8.8 Telemetry Layer: registra causas, arbitragens, divergências, confiança, sinais e sintomas
operacionais.
8.9 Admin/Observability: permite inspeção por lead, fluxo, conflito, sintoma e qualidade de extração.
9. Contratos obrigatórios abaixo do A00
9.1 Contrato do Core Mecânico e Policy Engine.
9.2 Contrato do Speech Engine e Surface Única.
9.3 Contrato de Contexto, Extração de Slots e Memória Viva.
9.4 Contrato de Áudio e Multimodalidade.
9.5 Contrato do Supabase Adapter e Persistência Inteligente.
9.6 Contrato do Canal Meta/WhatsApp e Operação de Mensageria.
9.7 Contrato da Analista MCMV Virtual e do Memorial do Programa.
9.8 Contrato de Telemetria e Diagnóstico Operacional.
9.9 Contrato de Rollout, Shadow Mode, Canary e Cutover.
10. Relação oficial com os 19 documentos legados
Os 19 documentos legados não são descartados. Eles passam a compor a camada de base de negócio
da ENOVA 2.
Eles são utilizados para: regras e microregras do funil, mapa de stages, exceções de elegibilidade,
comportamento do MCMV, telemetria validada, linguagem operacional e referências de risco.
Eles não devem ser reutilizados como base literal de arquitetura de speech, de bridges ou de fallback. A
ENOVA 2 herda as regras, não a bagunça estrutural.
11. Frentes oficiais do projeto
Frente 1 — Core Mecânico 2.
Frente 2 — Speech Engine e Surface Única.
Frente 3 — Contexto, Extração Estruturada e Memória Viva.
Frente 4 — Supabase Adapter e Persistência.
Frente 5 — Áudio e Multimodalidade.
Frente 6 — Meta/WhatsApp.
Frente 7 — Telemetria e Observabilidade.
Frente 8 — Rollout.
12. Ordem macro de implantação
Fase 0 — Fundação documental: A00, A01, A02 e contratos-base aprovados.
Fase 1 — Scaffold técnico do repo novo e shape macro do sistema.
Fase 2 — Core + Speech + Supabase mínimo com fluxo texto puro no topo e composição inicial.
Fase 3 — Extração multi-intenção e memória curta úteis.
Fase 4 — Áudio end-to-end.
Fase 5 — Telemetria profunda e admin.
Fase 6 — Shadow mode com leads controlados.
Fase 7 — Canary.
Fase 8 — Cutover progressivo.
13. Regra de fatia operacional
A ENOVA 2 não será implantada por temas soltos; será implantada por fatias operacionais completas.
Cada fatia precisa nascer com: entrada -> extração -> decisão -> fala -> persistência -> telemetria.
Exemplo de primeira fatia válida: topo + composição simples por texto, com persistência e
explicabilidade funcionando.
Áudio, memória longa e casos especiais entram depois, como novas fatias, sem atropelar a fundação.
14. Critérios macro de pronto da ENOVA 2
A ENOVA 2 só pode ser considerada operacionalmente válida quando provar:
14.1 Uma única surface final por turno.
14.2 Nenhuma coleta fora da política do stage/objetivo ativo.
14.3 Capacidade de interpretar múltiplas informações no mesmo turno sem perder trilho.
14.4 Persistência explicável no Supabase, com origem e confiança do dado.
14.5 Texto e áudio convergindo para o mesmo modelo de extração e decisão.
14.6 Telemetria suficiente para diagnosticar erro sem adivinhação.
14.7 Capacidade de operar em shadow/canary sem romper a Enova 1.
15. Convivência com a Enova 1
A Enova 1 segue como sistema operacional vigente até que a ENOVA 2 atinja critérios mínimos de
confiabilidade.
A Enova 2 deve nascer em repo separado.
O Supabase pode ser reaproveitado, mas a camada de gravação da ENOVA 2 deve ser deliberada:
novas colunas, novas tabelas auxiliares ou namespace novo quando necessário, para não corromper
operação legada.
Nada da ENOVA 2 deve pressupor substituição imediata da Enova 1.
16. Política de risco e mudança
Nenhuma frente crítica entra em produção por entusiasmo. Toda frente deve provar comportamento em
ambiente controlado.
Se uma frente abrir ambiguidade estrutural, ela para e volta para contrato.
Patch local não substitui correção de fundação.
Quando uma frente não couber com segurança em uma única PR/fase, ela deve ser quebrada. O
contrato manda mais que a pressa.
17. Regra de abertura de abas e envio de documentos
Pacote mínimo canônico para novas abas: A00 + A01 + A02.
Somente o contrato da frente ativa deve ser acrescentado além do trio-base.
Documentos legados específicos só entram quando o A02 indicar que aquela frente depende deles.
O objetivo é eliminar reenvio caótico de dezenas de arquivos.
18. Decisões fundadoras já aprovadas neste A00
Repo novo para a ENOVA 2.
Reaproveitamento de Supabase, Meta e regras de negócio da Enova 1.
Não reaproveitar a arquitetura híbrida de speech da Enova 1.
LLM-first por arquitetura, mas preso a contratos duros.
Uma única surface final por turno.
Texto e áudio tratados no mesmo cérebro conversacional.
Implantação por fatias operacionais completas.
19. Glossário executivo
Surface final: a única fala que chega ao cliente no turno.
Bridge: resposta de transição entre decisão atual e próximo objetivo.
Slot: dado estruturado de negócio extraído da fala do cliente.
Memory viva: contexto útil consolidado para o próximo raciocínio, sem virar lixo persistido.
Policy/Core: camada que aplica regras e decide o que é válido no fluxo.
Supabase Adapter: camada que traduz extração/decisão em persistência confiável.
20. Fecho executivo
Este A00 existe para impedir que a ENOVA 2 nasça poderosa na fala e fraca na estrutura. O projeto
novo deve ser mais natural que a Enova 1, mais útil que a Enova 1 e mais inteligente que a Enova 1 —
mas só será melhor se nascer com soberania, precedência e ordem documental desde o primeiro dia.
A partir deste documento, nenhuma frente da ENOVA 2 deve ser aberta no escuro. Toda execução
futura precisa obedecer ao A00, ao A01, ao A02 e ao contrato específico da frente ativa.
