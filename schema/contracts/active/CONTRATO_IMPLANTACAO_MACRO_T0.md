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
| T0-PR1 | Rebase canonico da implantacao | Reposicionar repo no macro T0-T7, criar camada canonica, status/handoff macro e plano executivo | em execucao nesta PR |
| T0-PR2 | Inventario legado vivo | Mapear fluxos, estados, dependencias, materiais aproveitaveis e discrepancias contra o mestre | proximo passo autorizado |
| T0-PR3 | Matriz de risco e desligamento futuro | Classificar riscos, compatibilidades, pontos de rollback e dependencias de convivencia | bloqueada ate T0-PR2 |
| T0-PR4 | Readiness G0 e closeout T0 | Provar completude do inventario e fechar G0 se aprovado | bloqueada ate T0-PR3 |

## Criterios de aceite de T0

- Mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` registrado como tronco soberano.
- Repo deixa de se apresentar como implantacao macro concluida.
- Ordem T0-T7 e gates G0-G7 persistidos.
- Status/handoff macro indicam fase real e proximo passo unico autorizado.
- Inventario legado vivo produzido e validado.
- G0 aprovado antes de T1.

## Proximo passo autorizado

T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo contra o mestre.

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
