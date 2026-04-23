# T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO

## Finalidade

Internalizar, dentro da ENOVA 2, a classificacao executiva da base da ENOVA 1 como evidencia canonica de T0.
Este documento elimina dependencia de link externo para entendimento do reaproveitamento.

Base soberana macro:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

## Escopo desta consolidacao

- Consolidar o que da ENOVA 1 pode ser reaproveitado na ENOVA 2.
- Consolidar o que e proibido reaproveitar.
- Preservar soberania LLM-first e adendos canonicos.
- Orientar as proximas PRs de T0 e fases seguintes.

Fora de escopo:
- Implementacao funcional de memoria, telemetria, canal, runtime ou integracoes reais.
- Refatoracao funcional da E1 nesta etapa.

## 1) Classificacao executiva da ENOVA 1 para a ENOVA 2

### 1.1 Cognitivo util para a ENOVA 2

#### Conhecimento de negocio reaproveitavel

- Base normativa/comercial consolidada: RNM, CTPS 36, composicao de renda, autonomo com/sem IR, restricao, docs por perfil, visita e correspondente.
- Catalogos canonicos organizados: FAQ, objecoes e knowledge base factual; reaproveitar como base semantica, nunca como script fixo.
- Mapa de lacunas reais: MEI, reprovacao de correspondente, doc fora de ordem, pos-visita; tratar como backlog cognitivo prioritario.

#### Conhecimento operacional reaproveitavel

- Ontologia de slots, estados e dependencias: titular, composicao, parceiro/P3, docs, correspondente, visita.
- Regras de confirmacao e conflitos: dado sensivel/ambiguo exige confirmacao.
- Sinais persistidos uteis de contexto: moradia, trabalho, FGTS, entrada, composicao, resumo de dossie.

#### Reaproveitamento com cautela

- Heuristicas de extracao/confianca do motor isolado devem ser tratadas como benchmark de cobertura, nunca como limite rigido de fala.

### 1.2 Mecanico estrutural util para a ENOVA 2

- Trilho canonico de fases/gates/nextStage como guardrail de negocio, nao como gerador de fala.
- Contratos de separacao de responsabilidade: IA interpreta; estrutura valida/persiste.
- Governanca de rollout `off/shadow/on` com rollback por flag.
- Guardas de dominio e schema para evitar drift e persistencia paralela indevida.
- Trilhas auditaveis: telemetria de decisao, incidentes, historico CRM por etapa, log de override.
- Camada operacional de painel/CRM/atendimento como infraestrutura de gestao.
- Estrutura documental/case-files e controles operacionais uteis: merge de fontes, listagem completa, abertura segura, modo manual, dedup e reset consistente.

### 1.3 Mecanico de fala proibido para a ENOVA 2

- Arquitetura de fala por prefixo acoplada a resposta mecanica de stage.
- Fallbacks textuais estaticos por stage como voz dominante.
- Reancoragem por templates fixos como resposta padrao.
- Scripts rigidos de reprompt como camada principal de conversa.
- Prioridade de parser/regex para dominar a superficie de fala.
- Travas de utilidade de fala por heuristica local rigida quando reduz naturalidade.
- Qualquer casca que force voz robotica, repetitiva ou de menu.

### 1.4 Telemetria, CRM/painel, docs, reset, seguranca e correspondente

#### Aproveitar

- Telemetria comparativa e estrutural, incidentes e trilha CRM por etapa.
- CRM operacional/meta, historico de estagio, override log, views operacionais uteis.
- Painel de arquivos com contrato estavel.
- Atendimento operacional, badges de incidentes, reset total, dedup guard.
- Contratos de correspondente e trilha de retorno.

#### Redesenhar

- Telemetria de qualidade semantica da fala.
- Modelo de decisao de offtrack para permanecer LLM-first sem fallback robotico dominante.
- Criterios de qualidade conversacional desacoplados de scripts fixos.
- Correspondente cognitivo para cenarios faltantes.

#### Nao levar

- Hardcode de mensagens de stage como motor conversacional.
- Dependencia de casca de reprompt mecanico para "parecer seguro".
- Qualquer regra que retire a soberania de linguagem da IA.

### 1.5 Riscos de copiar a ENOVA 1 sem filtro

- Reintroduzir bot voice.
- Reimportar parser-first dominante.
- Herdar acoplamentos antigos de prefixo + fallback mecanico.
- Misturar conhecimento valioso com casca mecanica.
- Duplicar camada conversacional.

### 1.6 Conclusao objetiva

- A ENOVA 1 tem alto valor para a ENOVA 2 em conhecimento de negocio, guardrails, telemetria e infraestrutura operacional.
- A casca mecanica de fala da ENOVA 1 nao deve ser migrada.
- Reaproveitamento correto: conhecimento + estrutura de controle; descarte conservador da fala roteirizada.

### 1.7 Proximos blocos da ENOVA 1 a absorver primeiro na ENOVA 2

1. Catalogos cognitivos: FAQ, objecoes, knowledge base factual.
2. Ontologia de slots/dependencias/confirmacao e lacunas priorizadas.
3. Contratos estruturais de seguranca: separacao IA/estrutura, validacao de sinal, dominio de persistencia.
4. Observabilidade operacional: shadow comparativo, incidentes, trilha CRM por etapa.
5. Infra de CRM/painel/docs/correspondente/reset, apenas em estrutura e dados, nunca scripts de fala.

## 2) Regra de reaproveitamento obrigatoria para as proximas PRs

- Permitido: conhecimento cognitivo util + mecanico estrutural util.
- Proibido: casca mecanica de fala, fallback dominante e script roteirizado de superficie.
- Toda PR que toque conversa/LLM/speech deve seguir:
  - `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
  - `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
- Em conflito interpretativo, prevalece o macro soberano e os adendos canonicos.

## 3) Tratamento da E1 nesta etapa

- E1 e materia-prima futura de memoria/conhecimento para fases apropriadas (principalmente T2/T3).
- E1 nao entra em refatoracao funcional nesta PR.
- Esta consolidacao nao abre implementacao funcional.

## 4) Vinculo com T0

Esta entrega consolida um recorte documental de T0 (continuidade de `PR-T0.1`), fortalecendo o inventario com classificacao canonica interna da ENOVA 1.

O que esta entrega fecha:
- Internalizacao canonica, dentro da ENOVA 2, da classificacao executiva da base da ENOVA 1.

O que esta entrega nao fecha:
- Implementacao real de memoria.
- Implementacao real de telemetria nova.
- Migracao funcional da E1.
- Fechamento de G0.
