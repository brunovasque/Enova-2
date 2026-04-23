# PLANO EXECUTIVO T0-T7 — ENOVA 2

## Fonte soberana

Este plano deriva de `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

Ele nao cria macro novo. Ele organiza a execucao futura em fase, objetivo, microetapas, gate de
saida, dependencias, o que fecha e o que nao fecha.

## Sequencia imediata autorizada

| Ordem | PR | Objetivo | Gate |
|-------|----|----------|------|
| 1 | T0-PR1 — rebase canonico da implantacao | Reposicionar o repo no macro T0-T7, corrigir indices/status/handoffs e abrir T0 | G0 ainda aberto |
| 2 | T0-PR2 — inventario legado vivo | Mapear repo, legado vivo, fluxos, estados, dependencias, riscos e materiais aproveitaveis | Pre-readiness G0 |
| 3 | T0-PR3 — matriz de risco e desligamento futuro | Classificar regras, riscos, residuos, compatibilidades, pontos de rollback e dependencias de convivencia | Pre-readiness G0 |
| 4 | T0-PR4 — smoke documental/readiness G0 | Provar completude do inventario e fechar G0 se aprovado | G0 aprovado, T1 autorizado |

Nenhuma PR de T1 pode abrir antes do closeout formal de T0/G0.

## Plano por fase

| Fase | Objetivo | Microetapas obrigatorias | Gate de saida | Dependencias | O que fecha | O que nao fecha |
|------|----------|--------------------------|---------------|--------------|-------------|-----------------|
| T0 | Congelar, inventariar e mapear legado vivo | Mapear fluxos vivos, estados persistidos, canais, superficies, regras, riscos e desligamento futuro | G0 — inventario legado aprovado | Mestre em `schema/source/`, repo atual, status/handoffs, legados L/C | Mapa do que esta vivo/morto/critico/sensivel e proximo contrato T1 | LLM real, Supabase real, Meta real, runtime novo |
| T1 | Constituir agente e contrato cognitivo canonico | Separar tom, regra, veto, sugestao, repertorio; fechar prompt, taxonomia e formato de saida | G1 — contrato do agente aprovado | G0 aprovado | Contrato cognitivo executavel para o LLM | Orquestrador real, persistencia real, rollout |
| T2 | Criar estado estruturado, memoria e reconciliacao | Definir lead_state v1, fatos, origem, confianca, conflito, confirmacao e compatibilidade transitoria | G2 — estado v1 aprovado | G1 aprovado | Estado auditavel e reconciliavel | Policy engine completo, cutover, UI |
| T3 | Criar policy engine v1 e guardrails declarativos | Codificar obrigacao, bloqueio, sugestao mandataria, confirmacao e roteamento; testar regras criticas | G3 — policy v1 aprovado | G2 aprovado | Politicas criticas testaveis e explicaveis | Orquestrador LLM-first completo, trafego real |
| T4 | Subir orquestrador de turno LLM-first | Padronizar entrada, executar LLM, validar policy, reconciliar estado, responder e registrar rastro | G4 — orquestrador v1 aprovado | G3 aprovado | Turno completo auditavel em sandbox | Shadow real, canary, cutover total |
| T5 | Migrar funil prioritario por fatias | Migrar topo, identificacao, composicao, renda, elegibilidade e pre-docs; comparar paridade | G5 — shadow/paridade minima aprovado | G4 aprovado | Fatias prioritarias com paridade suficiente | Desligamento total do legado |
| T6 | Acoplar docs, multimodal e superficies de canal | Normalizar texto/audio/imagem/sticker/docs, separar confianca e medir custo/latencia | G6 — cutover parcial aprovado | G5 aprovado | Multimodal sob mesma governanca | Cutover total, desativacao completa |
| T7 | Executar shadow, canary, cutover e desativacao do legado | Rodar paralelo, classificar divergencias, abrir canary gradual, medir, desligar por dependencias | G7 — cutover total aprovado | G6 aprovado | Implantacao macro concluida com rollback provado | Novos produtos fora do macro |

## Gates e bloqueios

- G0 bloqueia qualquer abertura real de T1.
- G1 bloqueia estado/memoria sem contrato cognitivo.
- G2 bloqueia policy engine sem estado confiavel.
- G3 bloqueia orquestrador sem guardrails declarativos.
- G4 bloqueia shadow/canary sem turnos auditaveis.
- G5 bloqueia trafego controlado sem paridade minima.
- G6 bloqueia cutover total sem monitoramento e risco aceito.
- G7 e o unico ponto em que a implantacao macro pode ser declarada concluida.

## Regra anti-atalho

Nenhum recorte tecnico local ja existente pode ser promovido a implantacao real sem passar pelo gate
macro correspondente. Material existente pode ser reaproveitado apenas depois de inventariado em T0
e recontratado na fase correta.
