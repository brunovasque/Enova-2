# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T12:03:16.1940591-03:00 |
| Estado da frente                           | em execução |
| Classificação da tarefa                    | contratual |
| Última PR relevante                        | PR 30 — PR5 textual: múltiplas informações no mesmo turno |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR5 textual — múltiplas informações no mesmo turno sob governança estrutural |
| Pendência contratual remanescente          | próximos recortes textuais da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV após turno composto governado |
| Próximo passo foi alterado?                | sim — saiu de turno composto governado para o próximo recorte textual da atendente |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. A PR 26 executou a política textual mínima: um envelope de governança para a IA soberana, sem resposta final ao cliente.

A PR 27 criou a primeira surface final mínima escrita pela IA. A PR 28 criou o contrato cognitivo mínimo da atendente especialista MCMV. A PR 29 criou o modelo mínimo de resposta livre governada. Este recorte executa o próximo passo: múltiplas informações no mesmo turno como contexto para a IA, sem parser mecânico dominante e sem sobrescrever Core, bloqueios ou limites MCMV/CEF.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR 30 — PR5 textual: múltiplas informações no mesmo turno.

## 4. O que a PR anterior fechou

- PR 29 criou `src/speech/free-response.ts`.
- PR 29 provou que a IA pode responder livremente sob governança estrutural.
- PR 29 preservou `next_objective`, bloqueios e limites MCMV/CEF.
- PR 29 rejeitou promessa explícita de aprovação sem reescrever texto alternativo.

## 5. O que a PR anterior NÃO fechou

- Tratamento mínimo de respostas compostas com múltiplas informações no mesmo turno.
- Prova de que sinais extras não viram parser mecânico dominante nem sobrescrevem Core.
- Integração com provedor LLM real.
- Prompt final de produção completo.

## 6. Diagnóstico confirmado

- `src/speech/policy.ts` continua sendo envelope estrutural e não escreve resposta final.
- `src/speech/surface.ts` publica somente draft autorado pela IA e rejeita autoria mecânica.
- `src/speech/cognitive.ts` orienta COMO a IA deve agir sem virar script rígido.
- `src/speech/free-response.ts` valida resposta livre autorada pela IA contra policy/cognitive/surface.
- O menor ponto seguro para múltiplas informações era um módulo separado que organiza sinais já interpretados como contexto para a IA, sem parsear texto cru e sem assumir domínio de interpretação.
- A prova objetiva precisava demonstrar que a IA continua livre, que múltiplos sinais não quebram `next_objective`/bloqueios e que promessa de aprovação continua proibida.

## 7. O que foi feito

- Criado `src/speech/composite-turn.ts` com `buildGovernedCompositeTurn()`.
- O contexto declara `interpretation_owner=llm`, `mechanical_parser_priority=forbidden` e `governance_role=contextualizes_validates_informs_only`.
- Múltiplos sinais informam a IA, mas não reordenam o Core e não desbloqueiam fluxo por inferência conversacional.
- O módulo reaproveita `buildGovernedFreeResponse()` para manter surface final autorada pela IA.
- `src/speech/smoke.ts` foi ampliado para 13 cenários.

## 8. O que não foi feito

- Não foi criado gerador mecânico de resposta.
- Não foi criado template rígido por stage.
- Não foi criado parser mecânico dominante.
- Não foi criado fallback dominante.
- Não foi criado prompt final de produção completo.
- Não foi integrado provedor LLM real.
- Não foi aberta multimodalidade, áudio, Supabase, Meta/WhatsApp ou telemetria.
- Não houve mudança no Core nem no Worker.

## 9. O que esta PR fechou

- Modelo mínimo de turno composto governado.
- Prova de que múltiplos sinais podem informar a IA sem virar script rígido.
- Prova de que `next_objective` e bloqueios estruturais continuam preservados mesmo com sinais extras.
- Prova de que tentativa de sobrescrever Core é rejeitada.
- Prova de que promessa de aprovação continua rejeitada.

## 10. O que continua pendente após esta PR

- Próximos recortes textuais da atendente especialista MCMV.
- Integração futura com provedor LLM real e prompt final de produção completo, em PR própria.
- Evolução de conhecimento MCMV/CEF e estilo consultivo, sem script rígido.
- Supabase, Meta/WhatsApp, telemetria, áudio e multimodalidade permanecem fora do escopo.

## 11. Esta tarefa foi fora de contrato?

**não**

É uma PR de execução dentro do contrato ativo da frente.

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

PR5 textual — múltiplas informações no mesmo turno sob governança estrutural.

## 11c. Pendência contratual remanescente

Próximos recortes textuais da atendente especialista MCMV após turno composto governado.

## 11d. Houve desvio de contrato?

**não**

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `schema/contracts/_INDEX.md`
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`
- `src/speech/policy.ts`
- `src/speech/cognitive.ts`
- `src/speech/free-response.ts`
- `src/speech/composite-turn.ts`
- `src/speech/smoke.ts`
- `src/speech/surface.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV após turno composto governado, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

## 16. Riscos

- O modelo de turno composto ainda é mínimo e não é parser/extractor completo.
- Provedor LLM real e prompt final de produção ficam para recorte próprio.
- Próximas PRs devem preservar a regra de que múltiplos sinais informam a IA, mas não substituem a interpretação soberana nem a fala final.

## 17. Provas

- `npm run smoke:speech` passou com 13/13 cenários.
- Cenário 10 prova que turno composto mantém resposta livre da IA e reconhece múltiplos sinais sem parser mecânico dominante.
- Cenário 11 prova que turno composto respeita bloqueio estrutural e `next_objective`.
- Cenário 12 prova que tentativa de sobrescrever Core é rejeitada.
- Cenário 13 prova que promessa explícita de aprovação segue rejeitada no turno composto.
- `mechanical_text_generated=false` permanece preservado na surface.

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`
  Status da frente lido:       `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — L03 identificado, conteúdo não transcrito
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — ancoragem L03/L19, LLM conversa livremente, múltiplas informações no mesmo turno, resposta natural + payload estruturado, MCMV/CEF e não promessa de aprovação; sem regra nova de negócio nesta PR
