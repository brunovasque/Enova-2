# CONTRATO ARQUIVADO — Core Mecânico 2 — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Core Mecânico 2 |
| Status | encerrado |
| Data de arquivamento | 2026-04-21T01:10:53Z |
| Objetivo imutável | Modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Legados aplicáveis | L03–L17 |
| Última PR de execução | PR 23 — L17: Final operacional, docs, visita e handoff |
| Próximo contrato autorizado | Contrato do Speech Engine e Surface Única |

## PRs que executaram o contrato

- PR 17 — L04 + L05 + L06 — topo do funil integrado ao Core principal
- PR 18 — integração mínima do Core ao Worker com `POST /__core__/run`
- PR 19 — L07 + L08 — Meio A inicial
- PR 20 — L09 + L10 — composição familiar expandida
- PR 21 — L11 + L12 + L13 + L14 — Meio B
- PR 22 — L15 + L16 — Especiais
- PR 23 — L17 — Final operacional, docs, visita e handoff

## Critérios de aceite — status final

- [x] modelo formal de objetivos/stages derivado de L03–L17
- [x] decisão determinística e next step autorizado
- [x] Core sem phrasing ou resposta final ao cliente
- [x] gates do funil aplicados conforme L03–L17
- [x] smoke de trilho topo → final
- [x] nenhuma regra aberta fora de L03–L17
- [x] Worker do Core desacoplado do Speech

## Evidências mínimas de encerramento

- PRs 17–23 merged
- PR 23 fechou L17 e provou o recorte final no Worker
- smoke topo → final comprovado
- status e handoff sincronizados no closeout

--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     schema/contracts/active/CONTRATO_CORE_MECANICO_2.md
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim
Critérios de aceite cumpridos?:         sim — todos os critérios do contrato foram atendidos
Fora de escopo respeitado?:             sim
Pendências remanescentes:               nenhuma
Evidências / provas do encerramento:    PRs 17–23, smoke topo→final, integração Worker, status/handoff sincronizados
Data de encerramento:                   2026-04-21T01:10:53Z
PR que encerrou:                        closeout direto em main após merge da PR 23
Destino do contrato encerrado:          archive (schema/contracts/archive/CONTRATO_CORE_MECANICO_2_2026-04-21.md)
Próximo contrato autorizado:            Contrato do Speech Engine e Surface Única
