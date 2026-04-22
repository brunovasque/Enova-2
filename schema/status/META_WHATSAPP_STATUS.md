# STATUS VIVO — Meta/WhatsApp — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Meta/WhatsApp |
| Contrato ativo | `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md` |
| Estado do contrato | em execucao |
| Ultima PR executou qual recorte | PR 2 — contrato tecnico do canal / envelope de integracao |
| Pendencia contratual | PR3 (runtime minimo no Worker), PR4 (smoke integrado + closeout) |
| Contrato encerrado? | nao |
| Item do A01 | Prioridade 6 — plugar canal Meta/WhatsApp e operacionalizar entrada/saida real |
| Estado atual | em execucao |
| Classe da ultima tarefa | contratual |
| Ultima PR relevante | PR 2 — contrato tecnico do canal / envelope de integracao |
| Ultimo commit funcional | commit desta PR2 documental da Frente 6 |
| Pendencia remanescente herdada | PR2 era pendencia da PR1 e foi fechada nesta entrega |
| Proximo passo autorizado | PR 3 — runtime minimo do canal no Worker (sem rollout e sem telemetria profunda) |
| Legados aplicaveis | L18 (obrigatorio), C* (complementar quando confirmado) |
| Mudancas em dados persistidos (Supabase) | nenhuma |
| Permissoes Cloudflare necessarias | nenhuma adicional |
| Ultima atualizacao | 2026-04-22 |

---

## 1. Nome da frente

Meta/WhatsApp.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`.

## 2a. Estado do contrato

em execucao

## 2b. Ultima PR executou qual recorte do contrato

PR 2 executou recorte contratual documental:

- contrato tecnico de envelope criado em `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`;
- shape canonico inbound/outbound definido;
- eventos aceitos definidos;
- limites entre canal, Core, Speech e Adapter definidos;
- regras minimas de idempotencia, retry, ack, erro e logs definidas.

## 2c. Pendencia contratual

- PR3 — runtime minimo do canal no Worker
- PR4 — smoke integrado + closeout formal

## 2d. Contrato encerrado?

nao

## 3. Item do A01

Prioridade 6 — Meta/WhatsApp.

## 4. Estado atual

em execucao

## 5. Classe da ultima tarefa

contratual

## 6. Ultima PR relevante

PR 2 — contrato tecnico do canal / envelope de integracao.

## 7. Ultimo commit

Commit desta PR2 documental da Frente 6.

## 8. Entregas concluidas

- PR1 concluida: contrato ativo da Frente 6 aberto e vivos criados;
- PR2 concluida: contrato tecnico de envelope em `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`;
- contrato ativo, status e handoff sincronizados para estado `em execucao`;
- indices de contratos/status atualizados com o novo estado da frente.

## 9. Pendencias

- executar PR3 no recorte contratual (runtime minimo no Worker);
- executar PR4 (smoke integrado + closeout formal);
- manter escopo fechado sem abrir rollout ou telemetria profunda antes da hora.

## 10. Pendencia remanescente herdada

A PR1 deixou PR2/PR3/PR4 como pendencias. A PR2 foi fechada nesta entrega; permanecem PR3 e PR4.

## 11. Bloqueios

Nenhum bloqueio tecnico imediato.

Bloqueio de governanca ativo:
- proibido pular ordem PR1->PR2->PR3->PR4.

## 12. Proximo passo autorizado

PR 3 — runtime minimo do canal no Worker (preservado).

## 13. Legados aplicaveis

- L18 (obrigatorio)
- C* (complementar quando confirmados por leitura direta do PDF)

## 14. Ultima atualizacao

2026-04-22.

## 15. Mudancas em dados persistidos (Supabase) — ultima tarefa

Mudancas em dados persistidos (Supabase): nenhuma

## 16. Permissoes Cloudflare necessarias — ultima tarefa

Permissoes Cloudflare necessarias: nenhuma adicional

## 17. Fontes consultadas — ultima tarefa

Fontes de verdade consultadas — ultima tarefa:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`
  Status da frente lido:       `schema/status/META_WHATSAPP_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/META_WHATSAPP_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — bloco L18 (nao transcrito)
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — paginas 4, 7 e 8

