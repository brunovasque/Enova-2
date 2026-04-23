# REBASE CANONICO DA IMPLANTACAO — ENOVA 2

## Status

Documento canonico ativo de governanca.

Data: 2026-04-22

## Base macro soberana

A base macro soberana da implantacao passa a ser:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Este arquivo e a transcricao markdown canonicamente operavel do legado mestre e prevalece sobre
qualquer documento atual do repositorio quando houver conflito de macro, ordem de execucao,
gates ou criterio de implantacao.

O PDF em `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` permanece como fonte bruta
original. O markdown em `schema/source/` e o tronco recorrente de leitura para execucao diaria.

## Declaracao de rebase

O repositorio contem fundacao tecnica e documental relevante: Worker tecnico, smokes locais,
contratos por frente, closeouts formais, runtime minimo local de canal, telemetria, rollout e E1.

Isso nao equivale ao cumprimento completo da implantacao macro da ENOVA 2.

Os contratos e frentes encerrados antes deste rebase passam a ser interpretados como recortes
historicos, tecnicos, locais ou estruturais. Eles sao material aproveitavel para a implantacao, mas nao
provam LLM real, Supabase real novo/produtivo, Meta real, STT/TTS real, shadow real, canary real,
cutover real ou desligamento do legado.

## Ordem macro oficial

| Fase | Nome oficial | Objetivo macro | Gate de saida |
|------|--------------|----------------|---------------|
| T0 | Congelamento, inventario e mapa do legado vivo | Mapear o que esta vivo, morto, critico, sensivel e dependente do legado | G0 — inventario legado aprovado |
| T1 | Constituicao do agente e contrato cognitivo canonico | Fechar identidade, limites, taxonomia, prompt canonico e saida estruturada do agente | G1 — contrato do agente aprovado |
| T2 | Estado estruturado, memoria e reconciliacao | Substituir contexto cru por estado auditavel, versionado e reconciliavel | G2 — estado v1 aprovado |
| T3 | Policy engine v1 e guardrails declarativos | Tornar regras criticas explicitas, testaveis e auditaveis | G3 — policy v1 aprovada |
| T4 | Orquestrador de turno LLM-first | Subir o ciclo unico entrada -> interpretacao -> decisao governada -> resposta -> persistencia | G4 — orquestrador v1 aprovado |
| T5 | Migracao do funil prioritario | Migrar topo, identificacao, composicao, renda, elegibilidade e pre-docs por fatias | G5 — shadow mode/paridade minima aprovado |
| T6 | Docs, multimodal e superficies de canal | Acoplar audio, imagem, sticker e docs ao mesmo eixo de estado e politicas | G6 — cutover parcial aprovado |
| T7 | Shadow mode, canary, cutover e desativacao do legado | Trocar efetivamente o eixo do atendimento com rollback imediato | G7 — cutover total aprovado |

## Gates oficiais

| Gate | Nome | Prova exigida | Saida permitida | Rollback se falhar |
|------|------|---------------|-----------------|--------------------|
| G0 | Inventario legado | Mapa do que esta vivo, morto, critico e sensivel | Assinar migracao e abrir T1 | Nao iniciar implantacao |
| G1 | Contrato do agente | Prompt canonico, politicas e taxonomia aprovados | Abrir desenvolvimento do estado | Reescrever contrato |
| G2 | Estado v1 | Schema e persistencia validados em casos criticos | Subir policy engine | Manter legado |
| G3 | Policy v1 | Obrigacao, bloqueio e roteamento passando | Ligar orquestrador | Desligar policy nova |
| G4 | Orquestrador v1 | Turnos completos, auditaveis e estaveis | Iniciar shadow mode | Recuar para piloto interno |
| G5 | Shadow mode | Paridade minima com casos reais e metricas | Abrir trafego controlado | Voltar ao legado |
| G6 | Cutover parcial | Risco aceito e monitoramento em tempo real | Migrar frentes escolhidas | Reversao da frente |
| G7 | Cutover total | Frentes estaveis e backlog critico zerado | Desligar motores antigos por etapa | Reativar camada anterior |

## Estado operacional real apos o rebase

Fase macro verdadeira: T0 — Congelamento, inventario e mapa do legado vivo.

Gate aberto: G0 — Inventario legado.

Proximo passo unico autorizado: T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo
contra o mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## O que e aproveitavel

- Contratos arquivados e closeouts das frentes 1-8 como memoria tecnica de recortes ja explorados.
- Runtime tecnico local em `src/` como prototipo aproveitavel, nao como implantacao macro concluida.
- Smokes locais como evidencias de integridade de repo, nao como prova de operacao real.
- E1 como modulo tecnico local arquivado, aproveitavel para T1/T2/T3, nao como motor operacional completo.
- Protocolos de governanca, status, handoffs e validacao de PR como trilho de execucao.

## O que permanece parcial, local, mock ou estrutural

- Worker e rotas tecnicas existem em recortes minimos.
- Canal Meta/WhatsApp e apenas tecnico/local; nao ha operacao Meta real.
- Telemetria e rollout sao minimos/locais; nao ha dashboard externo, shadow real, canary real ou cutover.
- E1 tem runtime tecnico/local; nao ha ingestao real de normativos, motor comercial real ou aprendizado grande.
- Supabase real novo/produtivo, persistencia macro v1, LLM real e STT/TTS real nao estao provados como implantacao macro.

## Fora de escopo deste rebase

- Implementar LLM real.
- Implementar Supabase real novo/produtivo.
- Implementar Meta real.
- Implementar STT/TTS real.
- Abrir shadow, canary, cutover ou rollout real.
- Criar UI, painel, dashboard externo ou ferramenta externa obrigatoria.
- Apagar material historico util sem contrato proprio.

## Regra obrigatoria para tarefas futuras

Toda tarefa futura deve ler, antes do recorte ativo:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. O contrato, fase ou PR ativa do recorte atual

Se houver conflito entre documentos atuais do repo e o mestre em `schema/source/`, prevalece o
mestre.

## Sequencia travada

1. Concluir T0 contra G0.
2. So abrir T1 depois de G0 aprovado.
3. So abrir T2 depois de G1 aprovado.
4. So abrir T3 depois de G2 aprovado.
5. So abrir T4 depois de G3 aprovado.
6. So abrir T5 depois de G4 aprovado.
7. So abrir T6 depois de G5 aprovado.
8. So abrir T7 depois de G6 aprovado.
9. So declarar implantacao macro concluida depois de G7 aprovado.
