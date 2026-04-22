# HANDOFF — Meta/WhatsApp — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Meta/WhatsApp |
| Data | 2026-04-22 |
| Estado da frente | contrato aberto |
| Classificacao da tarefa | governanca |
| Ultima PR relevante | PR 49 — smoke integrado de audio + closeout formal da Frente 5 |
| Contrato ativo | `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md` |
| Recorte executado do contrato | PR 1 — abertura do micro contrato da Frente 6 |
| Pendencia contratual remanescente | PR2, PR3, PR4 |
| Houve desvio de contrato? | nao |
| Contrato encerrado nesta PR? | nao |
| Item do A01 atendido | Prioridade 6 — abertura da frente Meta/WhatsApp em escopo de governanca |
| Proximo passo autorizado | PR 2 — contrato tecnico do canal / envelope de integracao |
| Proximo passo foi alterado? | nao |
| Tarefa fora de contrato? | nao |
| Mudancas em dados persistidos (Supabase) | nenhuma |
| Permissoes Cloudflare necessarias | nenhuma adicional |

---

## 1. Contexto curto

A Frente 5 foi encerrada formalmente na PR 49 e o proximo passo autorizado no estado vivo era abrir a Frente 6.

Esta PR 1 abriu somente a camada contratual/governanca da Frente 6, sem implementacao funcional de Meta/WhatsApp, sem runtime de webhook e sem alteracao de deploy.

O contrato da frente ja nasce com ordem oficial PR1->PR2->PR3->PR4 e com loop obrigatorio de consulta antes de qualquer tarefa futura.

## 2. Classificacao da tarefa

governanca

## 3. Ultima PR relevante

PR 49 — smoke integrado de audio + closeout formal da Frente 5.

## 4. O que a PR anterior fechou

- encerrou a Frente 5 com smoke integrado aprovado;
- arquivou contrato da Frente 5;
- deixou como proximo passo autorizado a abertura da Frente 6.

## 5. O que a PR anterior NAO fechou

- nao abriu contrato da Frente 6;
- nao criou status/handoff da Frente 6;
- nao definiu ordem oficial de PRs da Frente 6 no repo.

## 6. Diagnostico confirmado

- Frente 6 estava como `aguardando abertura` em `schema/contracts/_INDEX.md`.
- Nao existia contrato ativo da Frente 6 em `schema/contracts/active/`.
- `schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md` ainda marcavam Frente 6 como `(a criar)`.
- Frente 5 estava encerrada sem pendencia em status/handoff.
- A PR 0 (`schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`) foi de saneamento/auditoria, sem abrir integracao real de canal.

## 7. O que foi feito

- criado contrato ativo: `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`
- atualizacao de `schema/contracts/_INDEX.md` para Frente 6 em `aberto`
- criado status vivo: `schema/status/META_WHATSAPP_STATUS.md`
- criado handoff vivo: `schema/handoffs/META_WHATSAPP_LATEST.md`
- atualizados indices vivos de status e handoff
- registrada ordem oficial PR1/PR2/PR3/PR4
- registrado loop obrigatorio de consulta antes de cada tarefa da frente

## 8. O que nao foi feito

- nenhuma implementacao real de webhook/canal
- nenhuma alteracao de `wrangler.toml`
- nenhuma alteracao de workflow de deploy
- nenhum binding/secret/var novo
- nenhuma alteracao em Worker/Core/Speech/Context/Audio/Adapter funcional

## 9. O que esta PR fechou

- abertura formal da Frente 6 em governanca canônica;
- persistencia da ordem executiva da frente no repo;
- persistencia da regra de loop obrigatorio no contrato e nos vivos.

## 10. O que continua pendente apos esta PR

- PR2 (contrato tecnico do canal/envelope);
- PR3 (runtime minimo no Worker);
- PR4 (smoke integrado e closeout).

## 11. Esta tarefa foi fora de contrato?

nao

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`

## 11b. Recorte executado do contrato

PR 1 — abertura do micro contrato e base viva da Frente 6.

## 11c. Pendencia contratual remanescente

PR2, PR3 e PR4.

## 11d. Houve desvio de contrato?

nao

## 11e. Contrato encerrado nesta PR?

nao

## 12. Arquivos relevantes

- `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`
- `schema/contracts/_INDEX.md`
- `schema/status/META_WHATSAPP_STATUS.md`
- `schema/handoffs/META_WHATSAPP_LATEST.md`
- `schema/status/_INDEX.md`
- `schema/handoffs/_INDEX.md`

## 13. Item do A01 atendido

Prioridade 6 — abertura da frente Meta/WhatsApp por contrato antes de implementacao.

## 14. Estado atual da frente

contrato aberto

## 15. Proximo passo autorizado

PR 2 — contrato tecnico do canal / envelope de integracao (sem Meta real ainda).

## 16. Riscos

- risco de tentar pular direto para runtime sem passar pela PR2;
- risco de misturar telemetria/rollout antes da hora;
- risco de declarar integracao Cloudflare sem prova externa de runtime publicado.

## 17. Provas

- diff dos arquivos vivos e contrato ativo da Frente 6;
- indice de contratos atualizado para status `aberto`;
- indices de status/handoff atualizados com a nova frente criada.

## 18. Mudancas em dados persistidos (Supabase)

Mudancas em dados persistidos (Supabase): nenhuma

## 19. Permissoes Cloudflare necessarias

Permissoes Cloudflare necessarias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `Nenhum — ausência declarada` (antes da abertura) e `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md` (após abertura)
  Status da frente lido:       `schema/status/AUDIO_E_MULTIMODALIDADE_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/AUDIO_E_MULTIMODALIDADE_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — bloco L18 (não transcrito)
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — páginas 4, 7 e 8

