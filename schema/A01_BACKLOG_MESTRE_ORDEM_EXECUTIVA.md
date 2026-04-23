## ADENDO DE REBASE CANONICO — 2026-04-22

O tronco macro soberano da implantacao passa a ser `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

Este A01 permanece como painel operacional auxiliar, mas a ordem executiva oficial fica corrigida para
T0-T7:

1. T0 — Congelamento, inventario e mapa do legado vivo.
2. T1 — Constituicao do agente e contrato cognitivo canonico.
3. T2 — Estado estruturado, memoria e reconciliacao.
4. T3 — Policy engine v1 e guardrails declarativos.
5. T4 — Orquestrador de turno LLM-first.
6. T5 — Migracao do funil prioritario.
7. T6 — Docs, multimodal e superficies de canal.
8. T7 — Shadow mode, canary, cutover e desativacao do legado.

Fase real atual: T0. Gate aberto: G0. Proximo passo autorizado: T0-PR2 — inventario legado vivo.
As frentes ja arquivadas permanecem como recortes tecnicos/historicos, nao como conclusao da
implantacao macro.

ENOVA 2 — A01
Backlog Mestre e Ordem Executiva
Documento operacional-mestre de implantação. Alinhado ao A00 e governado pelo A02.
Função deste documento: definir a ordem oficial de implantação da ENOVA 2, o backlog
executivo por frente, os gates de bloqueio, os pacotes mínimos de documento por aba e o
critério de passagem entre fases. Nada entra em execução fora da ordem deste A01, salvo
revisão explícita do A00.
1. Como este A01 deve ser usado
Este documento é o painel de comando do projeto. Em qualquer aba técnica, a pergunta central
deixa de ser “o que parece urgente?” e passa a ser “qual frente está ativa, qual contrato está
ativo, o que está bloqueado e qual é o próximo passo único autorizado?”.
O A01 não substitui o A00. O A00 define a direção, os princípios e a precedência. O A01
transforma essa direção em ordem de trabalho, fases, backlog, gates e dependências.
Em toda frente, a regra executiva é: contrato antes de implementação, implementação antes de
promoção, prova antes de expansão.
2. Precedência documental aplicada à execução
O A01 deve ser lido sempre em conjunto com o A00 e com o A02.
A ordem executiva oficial é: A00 manda no macro; A01 manda na sequência e no estado da
implantação; A02 define o menor pacote documental por aba; o contrato específico da frente
ativa manda nos detalhes daquela frente; os 19 legados seguem como fonte de verdade do
negócio.
3. Frentes oficiais e ordem de ataque
As frentes oficiais, herdadas do A00, são: (1) Core Mecânico 2; (2) Speech Engine e Surface Única;
(3) Contexto, Extração Estruturada e Memória Viva; (4) Supabase Adapter e Persistência; (5)
Áudio e Multimodalidade; (6) Meta/WhatsApp; (7) Telemetria e Observabilidade; (8) Rollout.
A ordem de ataque não é arbitrária. Ela existe para impedir repetir o erro estrutural da ENOVA
1: plugar fala, canal e multimodalidade antes de existir fundação de decisão, extração e
persistência confiáveis.
Página 2
4. Ordem executiva macro obrigatória
A implantação da ENOVA 2 deve seguir as fases abaixo. Nenhuma fase abre sem entregar o
mínimo da fase anterior.
Fase Objetivo operacional Depende de Sai quando
0
Fechar a fundação
documental: A00 +
A01 + A02 +
contratos-base
mínimos aprovados.
Visão e acervo legado
Trio-base coerente e
ordem oficial
validada.
1
Abrir repo novo,
scaffold técnico e
shape macro do
sistema.
Fase 0
Repositório separado
com base limpa, CI
mínima e convenções
estabilizadas.
2
Subir Core + Speech +
Supabase mínimo
para texto puro no
topo e composição
simples.
Fase 1
Primeira fatia
operacional completa
funcionando fim a
fim.
3
Plugar extração
multi-intenção e
memória curta úteis.
Fase 2
Capacidade de captar
mais de um fato por
turno sem perder
trilho.
4
Adicionar áudio endto-end no mesmo
cérebro
conversacional.
Fase 3
Áudio transcrevendo,
extraindo e
persistindo no mesmo
modelo do texto.
5
Consolidar telemetria
profunda, painel
admin e
observabilidade.
Fase 4
Diagnóstico
explicável por lead,
decisão e surface.
6
Rodar shadow mode
controlado. Fase 5
Comparação segura
sem substituir a
ENOVA 1.
7
Abrir canary e corte
progressivo. Fase 6
Entrada gradual em
produção com
rollback claro.
5. Backlog mestre por prioridade
 Prioridade 0 — abrir repo novo, estrutura de pastas, convenção de nomes, variáveis de
ambiente, CI mínima, política de testes e regra de migração segura.
 Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da
fala.
Página 3
 Prioridade 2 — modelar o Speech Engine com surface única, política explícita para
transições e proibição de camadas concorrentes.
 Prioridade 3 — definir o schema de extração estruturada do turno: slots, sinais, contexto,
objeções, pendências, evidências e confiança.
 Prioridade 4 — criar o Supabase Adapter com namespace novo, persistência explicável e
trilho de compatibilidade com a ENOVA 1.
 Prioridade 5 — plugar áudio e multimodalidade no mesmo pipeline de extração e
persistência.
 Prioridade 6 — plugar canal Meta/WhatsApp e operacionalizar entrada/saída real.
 Prioridade 7 — consolidar telemetria, admin, shadow mode, canary e cutover.
Regra prática: se uma tarefa não empurra a prioridade ativa ou não reduz risco de bloqueio da
prioridade ativa, ela não entra agora.
6. Gates de bloqueio e critérios de passagem
 Gate 1 — sem contrato da frente, não começa implementação.
 Gate 2 — sem smoke da frente, não promove para a frente seguinte.
 Gate 3 — sem previsibilidade operacional em texto puro, áudio e canal ficam bloqueados.
 Gate 4 — sem persistência íntegra e explicável, memória viva e multimodalidade ficam
bloqueadas.
 Gate 5 — sem observabilidade mínima, não existe shadow, canary nem cutover.
 Gate 6 — sem coerência entre A00, A01 e A02, nenhum pacote de frente é dado como pronto.
Regra de falha: se uma frente abrir ambiguidade estrutural, ela para e volta para contrato. Patch
local não substitui correção de fundação.
7. Entregáveis mínimos por frente
Frente Entregável mínimo Prova mínima Estado para seguir
Core Mecânico 2
Contrato + modelo de
objetivos/stages +
decisão previsível
Smoke de trilho e
next step autorizado Apto a plugar fala
Speech Engine
Surface única +
política de transição +
fallback controlado
Turnos sem
duplicação, sem
silêncio e sem disputa
de camadas
Apto a plugar
extração
Extração/Contexto Schema de sinais e
multi-intenção
Prova de captura de
múltiplos fatos no
mesmo turno
Apto a persistir
Supabase Adapter
Namespace/tabelas/
colunas novas e
critérios de escrita
Persistência
explicável com
origem e confiança
Apto a memória útil
Áudio
Transcrição +
extração +
persistência no
Áudio salvando e
avançando sem
descolar do texto
Apto a canal real
Página 4
mesmo fluxo
Meta/WhatsApp Adapter do canal e
operação real
Loop completo com
entrada e saída reais Apto a shadow
Telemetria
Eventos, sintomas,
divergências e
inspeção admin
Diagnóstico por lead e
decisão Apto a rollout
8. Política de novas abas e pacote mínimo de arquivos
Para manter coerência com o A00 e com o A02, toda aba nova deve seguir o menor pacote
documental suficiente. Nunca reenviar tudo por reflexo.
 Aba estratégica / coordenação — enviar A00 + A01 + A02.
 Aba de construção de frente — enviar A00 + A01 + A02 + contrato da frente ativa.
 Aba de execução Copilot/Codex — enviar A00 + A01 + A02 + contrato da frente ativa +
handoff específico. Só anexar legado complementar quando o A02 indicar dependência
direta.
 Aba de revisão de regra de negócio — enviar trio-base + contrato da frente + classe legada
relevante.
 Aba de incidentes / regressão — enviar trio-base + frente ativa + evidência do bug + legado
da regra atingida.
9. Regra de PR, branch e execução
 Uma frente por vez. Não misturar Core, Speech, Supabase, Áudio e Canal na mesma PR sem
necessidade comprovada.
 Uma fatia operacional por vez. A PR deve fechar entrada -> extração -> decisão -> fala ->
persistência -> telemetria do recorte atacado, mesmo que mínimo.
 Diagnóstico antes de patch. Toda PR começa com leitura e prova do problema; sem isso,
para.
 Prova antes de promoção. Toda mudança precisa de smoke, evidência e plano de rollback.
Se a frente ficar grande demais para uma PR segura, o correto é quebrar. O contrato manda mais
que a ansiedade.
10. Política de convivência com a ENOVA 1
A ENOVA 1 continua como operação vigente até a ENOVA 2 provar confiabilidade mínima. A
ENOVA 2 nasce em repo separado, reaproveitando Supabase, Meta e regras do negócio com
cuidado deliberado de escrita e compatibilidade.
 Não reutilizar como base a arquitetura híbrida de speech da ENOVA 1.
 Usar a ENOVA 1 como fonte de regras, telemetria, microregras e validações já aprendidas.
 Nenhum rollout da ENOVA 2 pode corromper a operação atual.
Página 5
11. Plano de entrada em produção da ENOVA 2
 Etapa 1 — texto puro em fatia pequena, com telemetria e persistência explicáveis.
 Etapa 2 — shadow mode controlado, comparando decisão e surface com a operação vigente.
 Etapa 3 — canary com tráfego pequeno e rollback simples.
 Etapa 4 — cutover progressivo por frente/fatia, nunca por entusiasmo.
12. Próximo passo autorizado após este A01
Com A00, A01 e A02 coerentes, o próximo passo autorizado é abrir ou revisar o contrato da
frente ativa inicial: Core Mecânico 2, seguido por Speech Engine e Supabase Adapter. Áudio, Meta
e rollout permanecem bloqueados até a fundação mínima texto-puro ficar operacional.
13. Regra executiva final
A partir deste A01, a disciplina do projeto passa a ser esta: um macro manda, um backlog manda
na execução, um índice manda no pacote de envio e um contrato manda na frente ativa. Isso
existe para impedir que a ENOVA 2 nasça forte na visão e fraca na implantação.
