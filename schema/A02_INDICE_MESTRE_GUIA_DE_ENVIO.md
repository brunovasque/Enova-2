ENOVA 2 — ÍNDICE MESTRE DE
INTEGRAÇÃO
Amarração dos 19 arquivos legados ao novo modelo
e regra canônica de qual arquivo enviar em cada aba/frente
Documento operacional para reduzir carga manual, evitar drift documental
e manter precedência única entre legado + novo pacote ENOVA 2.
Regra curta: em novas abas, a base padrão passa a ser sempre "Canônico Geral + Backlog Mestre +
Ordem Executiva". Os 19 legados continuam válidos como base de negócio, mas deixam de ser carga
padrão obrigatória.
1. Objetivo deste documento
Este documento cria a amarração entre o conjunto dos 19 arquivos legados e o novo modelo
documental da ENOVA 2.
Ele define uma precedência única entre documentos, reduz a necessidade de reenviar tudo em
cada aba e estabelece qual pacote de arquivos deve ser enviado conforme a frente ativa.
A função deste material não é substituir o acervo legado. A função é organizar, governar e tornar
operacional o uso combinado do legado com os contratos novos.
2. Arquitetura documental canônica
A documentação da ENOVA 2 passa a ser lida em 3 camadas:
Camada Natureza O que contém Papel
C0 Governança
Documento Canônico
Geral + Backlog Mestre
+ Ordem Executiva
Manda na sequência,
escopo, prioridade,
bloqueios e critério de
envio
C1 Base de negócio
19 arquivos legados do
funil/MCMV/regras/mic
roregras/mapas/hando
ffs
Fonte de verdade das
regras de negócio e do
comportamento do
programa
C2 Contratos novos Contratos específicos
da ENOVA 2 por frente
Explicam como o
sistema novo
implementa a regra de
negócio com
arquitetura LLM-first
3. Regra de precedência entre documentos
Quando houver dúvida, conflito de wording, sobreposição de escopo ou interpretação diferente,
a ordem de precedência passa a ser esta:
1º — Documento Canônico Geral da ENOVA 2
2º — Backlog Mestre + Ordem Executiva
3º — Contrato específico da frente ativa
4º — Mapa Canônico do Funil
5º — Plano/Handoff/Memoriais legados relevantes da frente
6º — Demais arquivos legados de apoio
Regra prática: o legado continua mandando nas regras de negócio; o novo pacote manda na
arquitetura, na ordem executiva e na forma de implantação.
4. Normalização canônica do conjunto dos 19 legados
Para não depender do nome original de cada arquivo em toda aba, o conjunto dos 19 passa a ser
tratado por classes canônicas. Se os nomes reais variarem, o índice abaixo continua válido como
referência operacional.
Código legado Classe / família Função Quando é obrigatório
L01-L02 Plano macro / handoff
canônico
Contexto geral,
objetivo maior, estado
de evolução, decisões
já tomadas
Quando a aba exigir
contexto global ou
continuidade
estratégica
L03 Mapa canônico do
funil
Stages, gates,
transições,
microregras e
expectativas do funil
Sempre que a frente
tocar funil, coleta,
parse ou nextStage
L04-L06 Topo do funil Contrato, parser e
critérios do topo
Somente em frente de
topo
L07-L10 Meio A — estado civil e
composição
Regras e microregras
de composição
Somente em frente de
Meio A
L11-L14 Meio B — regime,
renda e gates
Regras de regime,
renda, IR, CTPS,
dependente, restrição
Somente em frente de
Meio B
L15-L16 Especiais / familiar / P3
/ multi
Trilhos especiais e
variantes
Somente em frente
especial/P3/multi
L17 Final operacional / Transição final, docs, Somente em frente
docs / visita /
correspondente
handoff, visita,
finalização final
L18 Runner / QA /
telemetria
Matriz de teste,
critérios de aceite e
observabilidade
Sempre que a aba
envolver prova,
regressão ou rollout
L19
Memorial do
programa / analista
MCMV
Regras substantivas do
programa, exigências
por perfil, critérios
complementares
Sempre que a frente
tocar interpretação de
perfil, política do
programa ou
perguntas adicionais
inteligentes
5. Amarração dos legados ao novo pacote ENOVA 2
Os contratos novos não substituem as classes legadas; eles as absorvem por responsabilidade:
Contrato novo Legados-base que alimentam
o contrato
Resultado esperado
Core Mecânico e Policy Engine L03 + L04-L17
Nova máquina de decisão usa
regras legadas sem herdar as
35k linhas
Speech Engine e Surface Única L01-L02 + L03 + famílias da
frente ativa
Uma única camada autorizada
a falar por turno
Contexto, extração e memória
viva L03 + L19
Captação de múltiplas
informações no mesmo turno
sem perder regra do funil
Áudio e multimodalidade L19 + contratos da frente ativa
Transcrição e extração
convertem áudio em slots
persistíveis
Supabase Adapter e
persistência L03 + L18
Estado novo conversa com
Supabase antigo sem
corromper a operação
Meta/WhatsApp e mensageria L18 + contratos de fala Entrega operacional do canal
sem quebrar a lógica do core
6. Pacote mínimo de arquivos por tipo de aba / frente
A regra abaixo é a parte mais importante deste documento. Ela elimina a necessidade de
reenviar tudo.
Tipo de aba / frente Pacote base
obrigatório Pacote complementar Nunca enviar por
padrão
Governança geral / visão
macro
C0 completo L01-L02 Restante do legado
Core Mecânico
Canônico Geral +
Backlog/Ordem +
Contrato Core
L03 + família legada da
frente ativa
Pacotes de áudio, Meta,
memorial completo se
não forem necessários
Speech Engine / Surface
Canônico Geral +
Backlog/Ordem +
Contrato Speech
L03 + L01-L02 + família
legada da frente ativa
Famílias de outras
frentes
Meio A / composição
Canônico Geral +
Backlog/Ordem +
contrato da frente ativa
L03 + L07-L10 + L18
quando houver QA
L11-L19 fora do
necessário
Meio B / regime-rendagates
Canônico Geral +
Backlog/Ordem +
contrato da frente ativa
L03 + L11-L14 + L18 Meio A/especiais/final
sem necessidade
Especiais / multi / P3
Canônico Geral +
Backlog/Ordem +
contrato da frente ativa
L03 + L15-L16 + L18 Demais famílias
Final / docs /
correspondente / visita
Canônico Geral +
Backlog/Ordem +
contrato da frente ativa
L03 + L17 + L18 + L19 se
houver política do
programa
Topo/Meio A/B completos
Áudio
Canônico Geral +
Backlog/Ordem +
Contrato Áudio
L03 + contrato da frente
ativa + L19
Pacotes inteiros do resto
do sistema
Supabase / persistência
Canônico Geral +
Backlog/Ordem +
Contrato Supabase
L03 + L18 + contrato da
frente ativa
Memorial/programa
completo se não houver
dependência
Meta / WhatsApp
Canônico Geral +
Backlog/Ordem +
Contrato Meta
Contrato da frente ativa +
L18 Legado fora da frente
Analista MCMV /
memorial do programa
Canônico Geral +
Backlog/Ordem +
Contrato Analista MCMV
L19 + L03 + contrato da
frente ativa
Famílias não
relacionadas
7. Regra prática de envio para novas abas
 Pacote padrão de qualquer nova aba: enviar sempre o Documento Canônico Geral + Backlog
Mestre + Ordem Executiva.
 Depois, enviar apenas 1 contrato específico da frente ativa.
 Só anexar legado complementar da família correspondente à frente.
 Nunca reenviar os 19 por padrão.
 Só escalar de pacote quando houver conflito, dúvida de regra, regressão ou necessidade de
prova profunda.
8. Escalonamento de pacote
Para reduzir carga e evitar drift, cada aba deve seguir um de 3 níveis documentais:
Nível Quando usar O que enviar Objetivo
Nível 1 — Operação
normal
Aba de execução
comum
C0 + contrato da frente Velocidade e foco
Nível 2 — Operação
com regra de negócio
Quando a frente
depende muito do
funil/programa
C0 + contrato da frente
+ L03 + família legada
da frente
Precisão sem inflar
contexto
Nível 3 — Auditoria / Quando deu erro C0 + contrato da frente Diagnóstico profundo
conflito / regressão
grave, conflito
documental ou risco
de quebra
+ L03 + família legada
da frente + L18 + L01-
L02 se necessário
com amarração total
9. Convenção de nomes recomendada
 A00 — ENOVA 2 Documento Canônico Geral
 A01 — ENOVA 2 Backlog Mestre + Ordem Executiva
 A02 — ENOVA 2 Índice Mestre de Integração dos 19 Legados (este documento)
 A03+ — Contratos novos por frente (Core, Speech, Contexto, Áudio, Supabase, Meta, Analista
MCMV etc.)
 L01-L19 — classes legadas normalizadas conforme a tabela da seção 4
10. Regra executiva final
A partir deste ponto, a pergunta operacional deixa de ser “quais dos 19 eu preciso reenviar?” e
passa a ser “qual frente está ativa e qual é o menor pacote suficiente para ela?”.
Isso reduz custo de contexto, facilita novas abas, preserva as regras legadas e mantém a
implantação da ENOVA 2 sob uma única governança canônica.

11. Atualização: modelo unificado de legados
A partir da PR #2, os 19 legados e os 9 documentos complementares deixam de existir como
arquivos separados no repositório. Eles são consolidados em um legado mestre único:
- PDF mestre: schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf
- Markdown mestre: schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md
- Índice operacional: schema/legacy/INDEX_LEGADO_MESTRE.md
A consulta passa a ser por blocos internos do legado mestre, usando as âncoras do índice
operacional. As classes canônicas (L01-L19) e os 9 complementares (C01-C09) permanecem
como referência semântica, mas apontam para blocos dentro do arquivo único.
A regra de envio por frente (seção 6) continua válida — mas em vez de "enviar L03 + L07-L10",
a instrução passa a ser "consultar blocos L03 + L07-L10 no legado mestre".
