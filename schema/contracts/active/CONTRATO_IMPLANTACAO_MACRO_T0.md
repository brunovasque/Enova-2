# CONTRATO_IMPLANTACAO_MACRO_T0 — Congelamento, Inventario e Mapa do Legado Vivo

## Status

Contrato ativo.

Fase macro: T0.

Gate aberto: G0 — Inventario legado.

Base soberana: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## Objetivo imutavel

Executar a fase T0 do macro soberano: congelar a narrativa de implantacao, inventariar o legado vivo,
mapear riscos/dependencias e provar se o repositorio esta pronto para abrir T1.

## Escopo

- Governanca e inventario.
- Mapa do que existe no repo e pode ser reaproveitado.
- Mapa do que e apenas tecnico/local/mock/estrutural.
- Mapa de conflitos entre documentos anteriores e o mestre.
- Preparacao do gate G0.

## Fora de escopo

- LLM real.
- Supabase real novo/produtivo.
- Meta real.
- STT/TTS real.
- Shadow, canary, cutover ou rollout real.
- Dashboard externo, ferramenta externa obrigatoria, UI ou painel.
- Refatoracao funcional ampla.

## Quebra oficial de PRs de T0

| PR | Nome | Entrega | Estado |
|----|------|---------|--------|
| T0-PR1 | Rebase canonico da implantacao | Reposicionar repo no macro T0-T7, criar camada canonica, status/handoff macro e plano executivo | concluida |
| T0-PR2 / PR-T0.1 | Inventario legado vivo (fluxos + estados) | Mapear fluxos, estados, dependencias, materiais aproveitaveis e discrepancias contra o mestre | **encerrada em pre-readiness G0** (ver `T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` secao 14) |
| T0-PR2 / PR-T0.2 | Inventario de regras e classificacao por familia | Listar e classificar regras em 7 familias canonicas com bloco legado de origem | **proximo passo autorizado** |
| T0-PR3 | Inventario de parsers, regex, fallbacks e heuristicas | Mapear pontos de decisao mecanica | bloqueada ate PR-T0.2 |
| T0-PR4 | Inventario de canais, superficies e telemetria | Mapear superficies de entrada/saida e endpoints | bloqueada ate PR-T0.3 |
| T0-PR5 | Matriz de risco e desligamento futuro | Classificar riscos, compatibilidades, pontos de rollback | bloqueada ate PR-T0.4 |
| T0-PR6 | Inventario de desligamento futuro e convivencia | O que sai primeiro, o que convive, o que permanece | bloqueada ate PR-T0.5 |
| T0-PR7 / PR-T0.R | Readiness G0 e closeout T0 | Provar completude do inventario e fechar G0 se aprovado | bloqueada ate PR-T0.6 |

## Criterios de aceite de T0

- Mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` registrado como tronco soberano.
- Repo deixa de se apresentar como implantacao macro concluida.
- Ordem T0-T7 e gates G0-G7 persistidos.
- Status/handoff macro indicam fase real e proximo passo unico autorizado.
- Inventario legado vivo produzido e validado.
- G0 aprovado antes de T1.

## Proximo passo autorizado

PR-T0.2 — Inventario de regras e classificacao por familia (primeira PR de T0-PR2 apos encerramento de PR-T0.1).

## Atualizacao 2026-04-23 — evidencia documental de T0

Recorte executado nesta atualizacao:
- Continuidade documental de `PR-T0.1` com internalizacao canônica, no proprio repo, da classificacao executiva de reaproveitamento da ENOVA 1.

Evidencia adicionada:
- `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`

Regra consolidada nesta evidencia:
- Reaproveitamento permitido: conhecimento cognitivo util + mecanico estrutural util.
- Reaproveitamento proibido: casca mecanica de fala, fallback dominante e scripts de fala roteirizados.

Limites reafirmados:
- Sem implementacao funcional nesta PR.
- Sem mudanca em runtime.
- Sem fechamento de G0 nesta etapa.

## Atualizacao 2026-04-23 — evidencia de inventario vivo real da ENOVA 1

Recorte executado nesta atualizacao:
- Continuidade documental de `PR-T0.1` com internalizacao, no proprio repo ENOVA 2, do inventario do legado vivo real da ENOVA 1.

Evidencia adicionada:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`

Amarracao desta evidencia com T0:
- T0.1 passa a contar com duas bases complementares internas:
  - classificacao de reaproveitamento (`T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`);
  - inventario do legado vivo real (`T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`).

Limites reafirmados:
- E1 permanece materia-prima futura; sem refatoracao funcional nesta etapa.
- Sem implementacao funcional e sem mudanca de runtime.
- G0 permanece aberto ate readiness formal.

## Atualizacao 2026-04-23 — inventario operacional auditavel de T0.1 (continuidade documental)

Recorte executado nesta atualizacao:
- Consolidacao da matriz de rastreabilidade operacional do inventario T0.1 (fluxos topo -> pos-envio_docs + estados/campos com classificacao de prova).

Evidencia adicionada:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (secoes 12, 13 e 14).

Estado de fechamento desta continuidade:
- `PR-T0.1` permanece aberta.
- G0 permanece aberto.

Lacuna remanescente explicita:
- elevar rastreabilidade de "parcial estrutural" para prova validada em blocos legados criticos (L03-L17), incluindo amarracao final de estados persistidos por origem de coluna/tabela sem inferencia.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.1 em pre-readiness G0

Recorte executado nesta atualizacao:
- Eliminacao da lacuna remanescente de PR-T0.1 via prova equivalente auditavel.

Evidencias adicionadas:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (secoes 13, 14 e 15 atualizadas):
  - secao 13: origens de coluna/tabela preenchidas com referencia ao schema Supabase canonico (PDF6 Taxonomia Oficial + LEGADO_MESTRE fonte);
  - secao 14: decisao de fechamento formal de PR-T0.1 em pre-readiness G0;
  - secao 15: prova equivalente auditavel para cada bloco L03-L17 (referencias a linhas especificas do LEGADO_MESTRE soberano e PDF6).

Estado de fechamento:
- `PR-T0.1` **encerrada** em pre-readiness G0 (fluxos+estados mapeados).
- G0 permanece aberto (so fecha via PR-T0.R apos PR-T0.2..T0.6).
- `PR-T0.2` desbloqueada como proximo passo autorizado.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.
