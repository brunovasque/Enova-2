# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T11:28:21.7507270-03:00 |
| Estado da frente                           | em execução |
| Classificação da tarefa                    | contratual |
| Última PR relevante                        | PR 28 — PR3 textual: contrato cognitivo mínimo da atendente especialista MCMV |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR3 textual — contrato cognitivo mínimo: COMO a IA deve agir como atendente especialista MCMV |
| Pendência contratual remanescente          | próximos recortes textuais da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV após o contrato cognitivo mínimo |
| Próximo passo foi alterado?                | sim — saiu de contrato cognitivo mínimo para o próximo recorte textual da atendente |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. A PR 26 executou a política textual mínima: um envelope de governança para a IA soberana, sem resposta final ao cliente.

A PR 27 criou a primeira surface final mínima escrita pela IA. Este recorte executa o próximo passo: contrato cognitivo mínimo da atendente especialista MCMV, definindo postura consultiva, limites de conhecimento MCMV/CEF, respeito ao Core e proibições de fala mecânica, script rígido e fallback dominante.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR 28 — PR3 textual: contrato cognitivo mínimo da atendente especialista MCMV.

## 4. O que a PR anterior fechou

- PR 27 criou `src/speech/surface.ts`.
- PR 27 provou que a surface final aceita apenas autoria `llm`.
- PR 27 provou que autoria `mechanical` é rejeitada.
- PR 27 manteve `mechanical_text_generated=false` e fallback não dominante.

## 5. O que a PR anterior NÃO fechou

- Contrato cognitivo mínimo da atendente especialista MCMV.
- Diretrizes de postura consultiva humana, qualificação inteligente e limites MCMV/CEF.
- Integração com provedor LLM real.
- Prompt final de produção completo.

## 6. Diagnóstico confirmado

- `src/speech/policy.ts` continua sendo envelope estrutural e não escreve resposta final.
- `src/speech/surface.ts` publica somente draft autorado pela IA e rejeita autoria mecânica.
- O menor ponto seguro para introduzir o contrato cognitivo era um módulo separado, consumível pela IA e compatível com policy/surface, sem virar gerador de fala.
- A prova objetiva precisava demonstrar IA como dona do contrato cognitivo, mecânico restrito à governança estrutural, proibição de promessa de aprovação, script rígido e fallback dominante.

## 7. O que foi feito

- Criado `src/speech/cognitive.ts` com `buildMcmvCognitiveContract()`.
- O contrato cognitivo declara `cognitive_owner=llm` e `final_surface_authority=llm`.
- O mecânico fica limitado a `structural_governance_only`.
- O contrato cobre postura consultiva humana, qualificação inteligente de perfil, conhecimento MCMV/CEF responsável, exploração de possibilidades reais e governança estrutural invisível.
- O contrato proíbe fala mecânica, script rígido dominante, fallback dominante, resposta engessada por stage e mecânico com prioridade de fala.
- `src/speech/smoke.ts` foi ampliado para 6 cenários.

## 8. O que não foi feito

- Não foi criado gerador mecânico de resposta.
- Não foi criado template rígido por stage.
- Não foi criado fallback dominante.
- Não foi criado prompt final de produção completo.
- Não foi integrado provedor LLM real.
- Não foi aberta multimodalidade, áudio, Supabase, Meta/WhatsApp ou telemetria.
- Não houve mudança no Core nem no Worker.

## 9. O que esta PR fechou

- Contrato cognitivo mínimo da atendente especialista MCMV.
- Prova de que a IA é dona da orientação cognitiva e da surface final.
- Prova de que o mecânico permanece somente como governança estrutural.
- Prova de que conhecimento MCMV/CEF não autoriza promessa de aprovação.
- Prova de que script rígido, fallback dominante e resposta engessada por stage seguem proibidos.

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

PR3 textual — contrato cognitivo mínimo: COMO a IA deve agir como atendente especialista MCMV.

## 11c. Pendência contratual remanescente

Próximos recortes textuais da atendente especialista MCMV.

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
- `src/speech/smoke.ts`
- `src/speech/surface.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV após o contrato cognitivo mínimo, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

## 16. Riscos

- O contrato cognitivo ainda é mínimo e estrutural; não é prompt final de produção completo.
- Provedor LLM real e prompt final de produção ficam para recorte próprio.
- Próximas PRs devem preservar a regra de que o mecânico informa/restringe, mas não escreve nem dita script.

## 17. Provas

- `npm run smoke:speech` passou com 6/6 cenários.
- Cenário 5 prova o contrato cognitivo mínimo da atendente MCMV: IA dona, mecânico estrutural, postura consultiva, qualificação inteligente e não promessa de aprovação.
- Cenário 6 prova compatibilidade com policy e surface: preserva `next_objective`, preserva bloqueio, mantém surface autorada pela IA e proíbe resposta engessada por stage/fallback dominante.
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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — ancoragem L03/L19, fluxo LLM-first, contrato cognitivo, MCMV/CEF e não promessa de aprovação; sem regra nova de negócio nesta PR
