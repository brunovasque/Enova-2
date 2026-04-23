# CONTRATO_IMPLANTACAO_MACRO_T0 — Congelamento, Inventario e Mapa do Legado Vivo

## Status

Contrato encerrado — PR-T0.R concluída em 2026-04-23.

Gate G0: APROVADO — T1 autorizada.

Arquivo: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`

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
| T0-PR2 / PR-T0.1 | Inventario legado vivo (fluxos + estados) | Mapear fluxos, estados, dependencias, materiais aproveitaveis e discrepancias contra o mestre | **concluida** — L15-L16 elevados para "validada por referencia" via Core Mecanico 2 (E6.2/F2/F4); origem E1 bifurcada de mapeamento alvo E2; tabela/coluna real E1 declarada como limitacao de transcricao PDF (ver `T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` secao 14) |
| T0-PR2 / PR-T0.2 | Inventario de regras e classificacao por familia | Listar e classificar regras em 7 familias canonicas com bloco legado de origem | **concluida** — 48 regras catalogadas em 7 familias (38 ativas, 6 condicionais, 4 mortas); ver `schema/implantation/INVENTARIO_REGRAS_T0.md` |
| T0-PR3 | Inventario de parsers, regex, fallbacks e heuristicas | Mapear pontos de decisao mecanica | **concluida** — 27 pontos catalogados (17 ativos, 5 condicionais, 3 residuais, 2 mortos); ver `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` |
| T0-PR4 | Inventario de canais, superficies e telemetria | Mapear superficies de entrada/saida e endpoints | **concluida** — 28 itens catalogados (7 canais, 7 superficies, 3 endpoints, 13 telemetria); bifurcacao E1/E2 aplicada; SF-03 fala mecanica classificada morta; ver `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` |
| T0-PR5 | Matriz de risco e desligamento futuro | Classificar riscos, compatibilidades, pontos de rollback | **concluida** — 26 riscos catalogados em 5 categorias (elegibilidade, tom, docs, telemetria, estrutural); 3 criticos, 14 altos, 9 medios; 7 bloqueantes para G0 declarados; ver `schema/implantation/MATRIZ_RISCO_T0.md` |
| T0-PR6 | Inventario de desligamento futuro e convivencia | O que sai primeiro, o que convive, o que permanece | **concluida** — 39 itens em 5 classificacoes (DI/RD/CT/MD/RC); 7 mortos/imediatos declarados; 14 migrar-e-desligar com criterio CDC; mapa de dependencias de fallback publicado; ver `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` |
| T0-PR7 / PR-T0.R | Readiness G0 e closeout T0 | Provar completude do inventario e fechar G0 se aprovado | **desbloqueada** — PR-T0.6 encerrada |

## Criterios de aceite de T0

- Mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` registrado como tronco soberano.
- Repo deixa de se apresentar como implantacao macro concluida.
- Ordem T0-T7 e gates G0-G7 persistidos.
- Status/handoff macro indicam fase real e proximo passo unico autorizado.
- Inventario legado vivo produzido e validado.
- G0 aprovado antes de T1.

## Proximo passo autorizado

PR-T1.0 — Abertura da fase T1 (G0 aprovado em PR-T0.R, 2026-04-23).

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

## Atualizacao 2026-04-23 — prova equivalente parcial de PR-T0.1 (lacuna remanescente declarada)

Recorte executado nesta atualizacao:
- Complementacao documental de `PR-T0.1` com prova equivalente auditavel para blocos L03-L14 e L17 e referencia de coluna/tabela via Taxonomia Oficial PDF6.

Evidencias adicionadas:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (secoes 13, 14 e 15 atualizadas):
  - secao 13: origens de coluna/tabela referenciadas via schema Supabase canonico (PDF6 Taxonomia Oficial + LEGADO_MESTRE fonte);
  - secao 14: decisao de nao fechamento de PR-T0.1 com lacuna remanescente explicita;
  - secao 15: prova equivalente auditavel para blocos L03-L14 e L17 (referencias a linhas especificas do LEGADO_MESTRE soberano e PDF6); L15-L16 permanecem em "parcial estrutural".

Estado de fechamento:
- `PR-T0.1` **permanece aberta**.
- G0 permanece aberto.
- Lacuna remanescente: L15-L16 em "parcial estrutural" e origem legada/persistida dos estados ainda nao provada sem inferencia.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.1 (lacunas remanescentes eliminadas)

Recorte executado nesta atualizacao:
- Continuidade final de `PR-T0.1`: eliminacao das lacunas remanescentes (L15-L16 e origem legada).

Evidencias adicionadas:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (secoes 13, 14 e 15 atualizadas):
  - secao 13: bifurcacao explicita de prova — "Bloco legado (origem E1)" separado de "Mapeamento alvo E2";
    limitacao de transcricao do Supabase E1 declarada explicitamente como escopo futuro.
  - secao 14: todos os criterios atendidos; PR-T0.1 declarada pronta para encerramento; PR-T0.2 desbloqueada.
  - secao 15: L15-L16 elevados para "validada por referencia" via implementacao canonica Core Mecanico 2
    (branch `feat/core-especiais-p3-multi-variantes`, commit `a3c27abec10af5222501e8dbcfae39705900af97`,
    PDF mestre E6.2/F2/F4 como fonte declarada; stage `qualification_special`, trilhos P3 e multi).
  - secao 15 conclusao: todos os blocos L03-L17 em "validada por referencia".

Estado de fechamento:
- `PR-T0.1` **encerrada em pre-readiness G0**.
- G0 permanece aberto (requer PR-T0.R apos PR-T0.2 a PR-T0.6).
- PR-T0.2 desbloqueada.

Limites reafirmados nesta atualizacao:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.2 (inventario de regras por familia)

Recorte executado nesta atualizacao:
- `PR-T0.2` — listar e classificar regras do legado em 7 familias canonicas com bloco legado
  de origem e status por regra.

Evidencia adicionada:
- `schema/implantation/INVENTARIO_REGRAS_T0.md` com:
  - 48 regras catalogadas (38 ativas, 6 condicionais, 4 mortas);
  - 7 familias: negocio, compliance, docs, UX, operacao, roteamento, excecao;
  - bloco legado de origem por regra;
  - fonte LEGADO_MESTRE (linha ou secao) por regra;
  - regras inconclusivas declaradas (8 categorias, nao bloqueiam PR-T0.2);
  - nota sobre C01-C09 e L-blocks nao transcritos.

Estado de fechamento:
- `PR-T0.2` encerrada.
- G0 permanece aberto.
- `PR-T0.3` desbloqueada.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.3 (inventario de parsers, heuristicas e branches de stage)

Recorte executado nesta atualizacao:
- `PR-T0.3` — inventariar parsers, regex, fallbacks, heuristicas e branches de stage do legado
  com bloco legado de origem, fonte auditavel, regra associada (PR-T0.2), status e risco estrutural.

Evidencia adicionada:
- `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` com:
  - 27 pontos de decisao mecanica catalogados (17 ativos, 5 condicionais, 3 residuais, 2 mortos);
  - 5 tipos cobertos: parser (2), regex (2), fallback (7), heuristica (7), stage (9);
  - bloco legado de origem por item (L03-L19 aplicaveis);
  - fonte LEGADO_MESTRE (linha ou secao) por item;
  - regra associada (PR-T0.2 ID) por item;
  - 8 categorias de inconclusivos declaradas (L-blocks nao transcritos; nao bloqueiam PR-T0.3).

Estado de fechamento:
- `PR-T0.3` encerrada.
- G0 permanece aberto.
- `PR-T0.4` desbloqueada.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.4 (inventario de canais, superficies e telemetria)

Recorte executado nesta atualizacao:
- `PR-T0.4` — inventariar canais, superficies de interacao, endpoints e pontos de telemetria/log/evento
  do legado ENOVA 1 com bifurcacao explicita E1 (runtime) vs E2 (design-alvo), fluxo de dados por canal,
  relacao com regras (PR-T0.2) e parsers/heuristicas (PR-T0.3), status e risco estrutural.

Evidencia adicionada:
- `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` com:
  - 28 itens catalogados (7 canais, 7 superficies, 3 endpoints, 13 telemetria);
  - bifurcacao E1/E2 obrigatoria aplicada (TE-04 a TE-12 como design-alvo E2; TE-01 como emissao
    runtime E1 real, linha 3416 LEGADO_MESTRE);
  - SF-03 (superficie fala mecanica E1) classificada morta — proibida por A00-ADENDO-01/02;
  - fluxo de dados por canal consolidado (tabela CT→EP→SF);
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.4).

Estado de fechamento:
- `PR-T0.4` encerrada.
- G0 permanece aberto.
- `PR-T0.5` desbloqueada.

Proximo passo autorizado:
- PR-T0.5 — Matriz de risco operacional do legado vivo.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.5 (matriz de risco operacional do legado vivo)

Recorte executado nesta atualizacao:
- `PR-T0.5` — produzir matriz de risco cruzando fluxos (PR-T0.1), regras (PR-T0.2),
  parsers/heuristicas (PR-T0.3) e canais/superficies/telemetria (PR-T0.4), classificando
  o impacto operacional de cada risco com severidade, probabilidade e evidencia auditavel.

Evidencia adicionada:
- `schema/implantation/MATRIZ_RISCO_T0.md` com:
  - 26 riscos catalogados em 5 categorias (elegibilidade, tom/fala, docs, telemetria, estrutural);
  - 3 criticos, 14 altos, 9 medios;
  - referencia cruzada com todos os inventarios anteriores (PR-T0.1 a PR-T0.4) por item;
  - 7 riscos bloqueantes para G0 declarados explicitamente;
  - RZ-TM-01 (casca mecanica de fala) classificado como critico — proibido por A00-ADENDO-01/02;
  - RZ-TE-02/RZ-TE-03 (schema E1 e CRM E1 desconhecidos) classificados como criticos/bloqueantes;
  - RZ-ES-04 (abertura de T1 sem G0) classificado como critico;
  - 7 categorias de inconclusivos declaradas (L-blocks nao transcritos; nao bloqueiam PR-T0.5).

Estado de fechamento:
- `PR-T0.5` encerrada.
- G0 permanece aberto.
- `PR-T0.6` desbloqueada.

Proximo passo autorizado:
- PR-T0.6 — Inventario de desligamento futuro e convivencia.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.6 (inventario de desligamento futuro e convivencia)

Recorte executado nesta atualizacao:
- `PR-T0.6` — classificar cada peca do legado E1 em ordem de desligamento futuro: o que sai
  primeiro, o que convive durante migracao, o que precisa ser redesenhado e o que se transforma
  em conhecimento/politica na E2.

Evidencia adicionada:
- `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` com:
  - 39 itens em 5 classificacoes: DI (7 — desligar imediato), RO (5 — redesenho obrigatorio),
    CT (6 — convivencia temporaria), MD (14 — migrar e desligar), RC (7 grupos — reaproveitamento);
  - 7 itens mortos/proibidos (DS-DI-01 a DS-DI-07): SF-03, PH-F05, RM-01, RM-02, fim_inelegivel,
    yesNoStages-stubs, RU-06 — eliminacao obrigatoria pre-T1;
  - 7 criterios de desligamento canonicos (CDC-01 a CDC-07) para itens de convivencia e migracao;
  - mapa de dependencias de fallback (ordem de desligamento: EP/CT-01 → SF-02 → SF-01 → PH-F03);
  - referencia cruzada com MATRIZ_RISCO (RZ-xx) por item onde aplicavel;
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.6).

Estado de fechamento:
- `PR-T0.6` encerrada.
- G0 permanece aberto.
- `PR-T0.R` desbloqueada.

Proximo passo autorizado:
- PR-T0.R — Readiness e closeout do gate G0.

Limites reafirmados:
- sem runtime funcional;
- sem alteracoes em `src/`, `package.json` ou `wrangler.toml`;
- sem abertura de T1 antes de closeout formal de G0.

## Atualizacao 2026-04-23 — encerramento de PR-T0.R (readiness e closeout do gate G0)

Recorte executado nesta atualizacao:
- `PR-T0.R` — validar completude de T0, aprovar G0 formalmente e encerrar o contrato T0.

Evidencia adicionada:
- `schema/implantation/READINESS_G0.md` com:
  - smoke documental de todos os 6 inventarios (PR-T0.1 a PR-T0.6): todos encerrados com Bloco E;
  - verificacao de todos os criterios de aceite de T0: 6/6 cumpridos;
  - analise dos 7 bloqueantes para G0: 2 satisfeitos com evidencia, 5 declarados com escopo T1+;
  - verificacao de coerencia entre inventarios: todas as referencias cruzadas validas;
  - 5 limitacoes residuais estruturais declaradas (L-blocks, keepStage, schema E1) — escopo T1+;
  - decisao formal: G0 APROVADO COM LIMITACOES RESIDUAIS FORMALMENTE DECLARADAS;
  - encerramento de contrato conforme `CONTRACT_CLOSEOUT_PROTOCOL.md`;
  - Bloco E preenchido: estado `completa`, lacunas residuais nao bloqueantes, fechamento `sim`.

Estado de fechamento:
- `PR-T0.R` encerrada.
- G0 APROVADO — 2026-04-23.
- Contrato T0 ENCERRADO.
- T1 autorizada via PR-T1.0.

Destino do contrato:
- Movido para `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Proximo contrato: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (skeleton).
