# STATUS VIVO — Rollout — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Rollout |
| Contrato ativo | `schema/contracts/active/CONTRATO_ROLLOUT.md` |
| Estado do contrato | em execucao |
| Ultima PR executou qual recorte | PR3 — runtime minimo/controladores de rollout |
| Pendencia contratual | PR4 da Frente 8 |
| Contrato encerrado? | nao |
| Item do A01 | Prioridade 7 — shadow mode, canary e cutover com rollback |
| Estado atual | em execucao |
| Classe da ultima tarefa | contratual |
| Ultima PR relevante | PR3 — runtime minimo/controladores de rollout |
| Ultimo commit | commit desta PR3 (runtime minimo da Frente 8) |
| Pendencia remanescente herdada | PR2 fechou contrato tecnico; PR3 fechou runtime minimo; falta PR4 |
| Proximo passo autorizado | PR4 — smoke integrado final + closeout formal da Frente 8 |
| Legados aplicaveis | L18 obrigatorio; L03 e C* complementares quando confirmados |
| Mudancas em dados persistidos (Supabase) | nenhuma |
| Permissoes Cloudflare necessarias | nenhuma adicional |
| Fontes consultadas — ultima tarefa | ver secao 17 |
| Ultima atualizacao | 2026-04-22 |

---

## 1. Nome da frente

Rollout.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_ROLLOUT.md`

## 2a. Estado do contrato

em execucao

## 2b. Ultima PR executou qual recorte do contrato

PR3 — runtime minimo/controladores de rollout:

- criados `src/rollout/types.ts`, `src/rollout/guards.ts`, `src/rollout/controller.ts` e `src/rollout/smoke.ts`;
- aplicado hook minimo de rollout no `src/worker.ts` sem alterar surface final;
- adicionados controles locais tecnicos para gate_status, promotion_block, rollback_ready e rollout_boundary_blocked;
- adicionada evidencia tecnica local em buffer de rollout;
- adicionado script `smoke:rollout` e integracao no `smoke:all`;
- sem abertura de rollout real ou ativacao externa.

## 2c. Pendencia contratual

- PR4 — smoke integrado final + closeout formal da Frente 8.

## 2d. Contrato encerrado?

nao

## 3. Item do A01

Prioridade 7 — consolidar rollout (shadow mode, canary e cutover com rollback).

## 4. Estado atual

em execucao

A Frente 8 agora possui runtime minimo/controladores locais no Worker/repo, com escopo tecnico fechado e sem ativacao real externa.

## 5. Classe da ultima tarefa

contratual

## 6. Ultima PR relevante

PR3 — runtime minimo/controladores de rollout.

## 7. Ultimo commit

Commit desta PR3 (runtime minimo da Frente 8).

## 8. Entregas concluidas

- runtime minimo local de rollout implementado;
- hooks/guards minimos ativos no entrypoint do Worker;
- criterios tecnicos de promocao/bloqueio e rollback_ready avaliaveis;
- evidencias tecnicas locais de gate e boundary disponiveis;
- smoke especifico da PR3 criado e passando;
- integridade de frentes anteriores preservada.

## 9. Pendencias

- PR4 — smoke integrado final + closeout formal da Frente 8.

## 10. Pendencia remanescente herdada

A PR2 deixou PR3 e PR4 pendentes. Esta PR3 fechou o runtime minimo/controladores locais e manteve PR4 como passo final.

## 11. Bloqueios

Bloqueios obrigatorios da frente (enquanto nao autorizados):

- nao abrir rollout real completo nesta PR3;
- nao abrir deploy externo/manual;
- nao abrir dashboard externo/ferramenta externa obrigatoria;
- nao presumir Meta real ou Supabase real novo/produtivo;
- nao abrir secrets, bindings, vars ou pipeline externa obrigatoria.

## 12. Proximo passo autorizado

PR4 — smoke integrado final + closeout formal da Frente 8.

## 13. Legados aplicaveis

- L18 obrigatorio.
- L03 complementar.
- C* complementar quando confirmado por leitura direta do PDF mestre.

## 14. Ultima atualizacao

2026-04-22 — Codex.

## 15. Mudancas em dados persistidos (Supabase) — ultima tarefa

Mudancas em dados persistidos (Supabase): nenhuma

## 16. Permissoes Cloudflare necessarias — ultima tarefa

Permissoes Cloudflare necessarias: nenhuma adicional

## 17. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Indice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_ROLLOUT.md`
  Contrato tecnico lido:       `schema/rollout/FRENTE8_ROLLOUT_TECHNICAL_CONTRACT.md`
  Status da frente lido:       `schema/status/ROLLOUT_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/ROLLOUT_LATEST.md`
  Runtime audit lido:          `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`
  Protocolo de permissao:      `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
  Bootstrap runtime:           `docs/BOOTSTRAP_CLOUDFLARE.md`
  Worker/config lidos:         `src/worker.ts`, `wrangler.toml`
  Integridade frente 6:        `src/meta/types.ts`, `src/meta/validate.ts`, `src/meta/ingest.ts`, `src/meta/smoke.ts`
  Integridade frente 7:        `src/telemetry/types.ts`, `src/telemetry/emit.ts`, `src/telemetry/smoke.ts`
  Smokes lidos:                `src/core/smoke.ts`, `src/worker-route-smoke.ts`
  Artefatos runtime PR3:       `src/rollout/types.ts`, `src/rollout/guards.ts`, `src/rollout/controller.ts`, `src/rollout/smoke.ts`
