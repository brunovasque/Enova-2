# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T10:58:44.7862454-03:00 |
| Estado da frente                           | em execução |
| Classificação da tarefa                    | contratual |
| Última PR relevante                        | PR em preparação — PR2 textual: primeira surface final mínima autorada pela IA |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR2 textual — primeira surface final mínima: IA autora, mecânico sem texto ao cliente |
| Pendência contratual remanescente          | próximos recortes textuais da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV após a surface mínima |
| Próximo passo foi alterado?                | sim — saiu de "provar surface final real" para o próximo recorte textual após a surface mínima |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. A PR 26 executou a política textual mínima: um envelope de governança para a IA soberana, sem resposta final ao cliente.

Este recorte executa o próximo passo autorizado: criar a primeira surface final mínima escrita pela IA. A camada nova não cria texto de cliente a partir de regra mecânica; ela recebe um draft autorado por `llm`, valida a conformidade do envelope e publica somente se a autoria for da IA.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR em preparação — PR2 textual: primeira surface final mínima autorada pela IA.

## 4. O que a PR anterior fechou

- PR 26 criou `src/speech/policy.ts`.
- PR 26 criou `src/speech/smoke.ts`.
- PR 26 provou `surface_owner=llm`, `mechanical_may_write_customer_text=false` e fallback não dominante.
- PR 26 não criou resposta final ao cliente.

## 5. O que a PR anterior NÃO fechou

- Surface final real escrita pela IA.
- Rejeição explícita de autoria mecânica na camada de publicação de surface.
- Integração com provedor LLM real.
- Prompt final de produção.

## 6. Diagnóstico confirmado

- `src/speech/policy.ts` continha apenas o envelope estrutural da PR 26.
- `src/speech/smoke.ts` tinha 2 cenários de política, sem surface final real.
- O menor ponto seguro para introduzir a surface era uma camada que publica texto recebido como draft da IA, sem montar phrasing por stage, sem template e sem fallback dominante.
- A prova objetiva precisava demonstrar que o texto final aceito é exatamente o draft da IA e que autoria `mechanical` é rejeitada.

## 7. O que foi feito

- Criado `src/speech/surface.ts` com `buildAiFinalSurface()`.
- A surface aceita `draft.author = "llm"` e rejeita autoria `mechanical` ou `fallback`.
- A surface retorna `final_text` somente quando a política está conforme e a autoria é da IA.
- A surface sempre declara `mechanical_text_generated=false`.
- A governança estrutural da PR 26 é preservada em `governance_snapshot`.
- `src/speech/smoke.ts` foi ampliado para 4 cenários.

## 8. O que não foi feito

- Não foi criado gerador mecânico de resposta.
- Não foi criado template rígido por stage.
- Não foi criado fallback dominante.
- Não foi integrado provedor LLM real.
- Não foi criado prompt final de produção.
- Não foi aberta multimodalidade, áudio, Supabase, Meta/WhatsApp ou telemetria.
- Não houve mudança no Core nem no Worker.

## 9. O que esta PR fechou

- Primeira surface final mínima sob soberania da IA.
- Prova de que o texto final aceito é exatamente o draft autorado pela IA.
- Prova de que autoria mecânica não publica resposta final.
- Prova de que fallback continua guardrail não dominante.

## 10. O que continua pendente após esta PR

- Próximos recortes textuais da atendente especialista MCMV.
- Integração futura com provedor LLM real e prompt final de produção, em PR própria.
- Evolução de conhecimento MCMV/CEF e estilo consultivo, sem script rígido.
- Supabase, Meta/WhatsApp, telemetria, áudio e multimodalidade permanecem fora do escopo.

## 11. Esta tarefa foi fora de contrato?

**não**

É uma PR de execução dentro do contrato ativo da frente.

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

PR2 textual — primeira surface final mínima: IA autora, mecânico sem texto ao cliente.

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
- `src/speech/smoke.ts`
- `src/speech/surface.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV após a surface mínima, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

## 16. Riscos

- A surface ainda depende de um draft recebido como saída da IA; provedor LLM real e prompt final de produção ficam para recorte próprio.
- O smoke usa fixture de draft autorado por IA para provar ownership; esse texto não é template de produção nem fala mecânica.
- Próximas PRs devem preservar a regra de que o mecânico informa e restringe, mas não escreve.

## 17. Provas

- `npm run smoke:speech` passou com 4/4 cenários.
- Cenário 3 prova que a primeira surface final aceita apenas autoria `llm` e publica exatamente o texto da IA.
- Cenário 4 prova que autoria `mechanical` é rejeitada e não publica `final_text`.
- `mechanical_text_generated=false` é invariável na surface.
- `fallback_mode=non_dominant_guardrail_only` permanece preservado.

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — ancoragem L03/fluxo LLM-first; sem regra nova de negócio nesta PR
