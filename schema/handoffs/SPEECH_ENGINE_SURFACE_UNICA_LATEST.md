# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T11:46:39.4804111-03:00 |
| Estado da frente                           | em execução |
| Classificação da tarefa                    | contratual |
| Última PR relevante                        | PR 29 — PR4 textual: modelo mínimo de resposta livre governada |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR4 textual — modelo mínimo de resposta livre sob governança estrutural |
| Pendência contratual remanescente          | próximos recortes textuais da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV após resposta livre governada |
| Próximo passo foi alterado?                | sim — saiu de resposta livre governada para o próximo recorte textual da atendente |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. A PR 26 executou a política textual mínima: um envelope de governança para a IA soberana, sem resposta final ao cliente.

A PR 27 criou a primeira surface final mínima escrita pela IA. A PR 28 criou o contrato cognitivo mínimo da atendente especialista MCMV. Este recorte executa o próximo passo: modelo mínimo de resposta livre sob governança estrutural, preservando liberdade de tom e profundidade sem contrariar Core, bloqueios, limites MCMV/CEF ou a proibição de promessa de aprovação.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR 29 — PR4 textual: modelo mínimo de resposta livre governada.

## 4. O que a PR anterior fechou

- PR 28 criou `src/speech/cognitive.ts`.
- PR 28 definiu postura consultiva humana, qualificação inteligente e limites MCMV/CEF.
- PR 28 provou que a IA é dona do contrato cognitivo e da surface final.
- PR 28 manteve mecânico restrito à governança estrutural.

## 5. O que a PR anterior NÃO fechou

- Modelo mínimo de resposta livre sob governança estrutural.
- Prova de que a IA pode adaptar tom e profundidade sem contrariar Core ou bloqueios.
- Integração com provedor LLM real.
- Prompt final de produção completo.

## 6. Diagnóstico confirmado

- `src/speech/policy.ts` continua sendo envelope estrutural e não escreve resposta final.
- `src/speech/surface.ts` publica somente draft autorado pela IA e rejeita autoria mecânica.
- `src/speech/cognitive.ts` orienta COMO a IA deve agir sem virar script rígido.
- O menor ponto seguro para introduzir resposta livre era um módulo separado, compatível com policy/surface/cognitive, que valida autoria e restrições sem gerar fala mecânica.
- A prova objetiva precisava demonstrar resposta livre da IA, respeito a `next_objective` e bloqueios, ausência de texto escrito pela governança e rejeição de promessa de aprovação.

## 7. O que foi feito

- Criado `src/speech/free-response.ts` com `buildGovernedFreeResponse()`.
- O modelo declara `response_owner=llm`, `response_mode=free_under_structural_governance` e `governance_role=restricts_validates_informs_only`.
- O mecânico e a governança continuam sem escrever texto ao cliente.
- O modelo permite resposta livre, adaptação de tom/profundidade e condução natural, sempre respeitando `next_objective`, bloqueios estruturais e limites MCMV/CEF.
- O guardrail rejeita promessa explícita de aprovação sem reescrever texto alternativo.
- `src/speech/smoke.ts` foi ampliado para 9 cenários.

## 8. O que não foi feito

- Não foi criado gerador mecânico de resposta.
- Não foi criado template rígido por stage.
- Não foi criado fallback dominante.
- Não foi criado prompt final de produção completo.
- Não foi integrado provedor LLM real.
- Não foi aberta multimodalidade, áudio, Supabase, Meta/WhatsApp ou telemetria.
- Não houve mudança no Core nem no Worker.

## 9. O que esta PR fechou

- Modelo mínimo de resposta livre governada.
- Prova de que a IA pode responder livremente e adaptar tom/profundidade.
- Prova de que `next_objective` e bloqueios estruturais continuam preservados.
- Prova de que governança restringe/valida/informa, mas não escreve.
- Prova de que promessa de aprovação é rejeitada.

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

PR4 textual — modelo mínimo de resposta livre sob governança estrutural.

## 11c. Pendência contratual remanescente

Próximos recortes textuais da atendente especialista MCMV após resposta livre governada.

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
- `src/speech/smoke.ts`
- `src/speech/surface.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV após resposta livre governada, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

## 16. Riscos

- O modelo de resposta livre ainda é mínimo e não é prompt final de produção completo.
- Provedor LLM real e prompt final de produção ficam para recorte próprio.
- Próximas PRs devem preservar a regra de que o mecânico informa/restringe, mas não escreve nem dita script.

## 17. Provas

- `npm run smoke:speech` passou com 9/9 cenários.
- Cenário 7 prova resposta livre da IA sob governança estrutural, preservando autoria e `next_objective`.
- Cenário 8 prova que resposta livre respeita bloqueio estrutural e não faz a governança escrever texto.
- Cenário 9 prova que promessa explícita de aprovação é rejeitada e não publicada.
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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — ancoragem L03/L19, fluxo LLM-first, conversa livre sob governança, MCMV/CEF e não promessa de aprovação; sem regra nova de negócio nesta PR
