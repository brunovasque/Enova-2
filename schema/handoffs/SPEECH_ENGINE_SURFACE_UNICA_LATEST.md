# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T12:24:16.7397546-03:00 |
| Estado da frente                           | em execução |
| Classificação da tarefa                    | contratual |
| Última PR relevante                        | PR 31 — PR5 canônica: preparação para multimodalidade/áudio |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR5 canônica — preparação para multimodalidade/áudio futuro sob governança estrutural |
| Pendência contratual remanescente          | próximos recortes textuais/preparatórios da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | próximo recorte textual/preparatório da atendente especialista MCMV após fronteira multimodal mínima |
| Próximo passo foi alterado?                | sim — saiu de preparação multimodal mínima para o próximo recorte textual/preparatório da atendente |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. A PR 26 executou a política textual mínima: um envelope de governança para a IA soberana, sem resposta final ao cliente.

A PR 27 criou a primeira surface final mínima escrita pela IA. A PR 28 criou o contrato cognitivo mínimo da atendente especialista MCMV. A PR 29 criou o modelo mínimo de resposta livre governada. A PR 30 criou o turno composto governado. Este recorte executa a preparação mínima para multimodalidade/áudio futuro: modalidade como forma de entrada/saída sob a mesma governança, sem áudio real, STT/TTS, canal, mídia real, Worker ou integração externa.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR 31 — PR5 canônica: preparação para multimodalidade/áudio.

## 4. O que a PR anterior fechou

- PR 30 criou `src/speech/composite-turn.ts`.
- PR 30 provou que múltiplas informações podem informar a IA sem parser mecânico dominante.
- PR 30 preservou `next_objective`, bloqueios e limites MCMV/CEF.
- PR 30 rejeitou tentativa de sobrescrever Core e promessa explícita de aprovação.

## 5. O que a PR anterior NÃO fechou

- Preparação mínima para multimodalidade/áudio futuro.
- Prova de que áudio futuro não vira novo cérebro, não muda autoridade da fala e não abre áudio real cedo demais.
- Integração com provedor LLM real.
- Prompt final de produção completo.

## 6. Diagnóstico confirmado

- `src/speech/policy.ts` continua sendo envelope estrutural e não escreve resposta final.
- `src/speech/surface.ts` publica somente draft autorado pela IA e rejeita autoria mecânica.
- `src/speech/cognitive.ts` orienta COMO a IA deve agir sem virar script rígido.
- `src/speech/free-response.ts` valida resposta livre autorada pela IA contra policy/cognitive/surface.
- `src/speech/composite-turn.ts` organiza sinais já interpretados como contexto para a IA, sem parser mecânico dominante.
- O menor ponto seguro para preparação multimodal era um módulo separado de contrato/readiness, sem processar mídia real e sem tocar Worker, Core, canal ou provedor.
- A prova objetiva precisava demonstrar que áudio futuro fica travado como modalidade/adaptador, que `next_objective`/bloqueios seguem preservados e que promessa de aprovação continua proibida.

## 7. O que foi feito

- Criado `src/speech/multimodal-readiness.ts` com `buildMultimodalReadinessContract()`.
- O contrato preparatório declara `readiness_status=preparatory_contract_only`, `authority_owner=llm`, `pipeline_role=input_output_adapter_only` e `governance_role=same_structural_governance_as_text`.
- A camada fixa que modalidade futura não muda autoridade de decisão nem autoridade de fala.
- Runtime locks mantêm `real_audio_enabled`, `stt_provider_enabled`, `tts_provider_enabled`, `external_channel_enabled` e `media_processing_enabled` como `false`.
- `src/speech/smoke.ts` foi ampliado para 14 cenários.

## 8. O que não foi feito

- Não foi criado gerador mecânico de resposta.
- Não foi criado template rígido por stage.
- Não foi criado parser mecânico dominante.
- Não foi criado fallback dominante.
- Não foi criado pipeline multimodal real.
- Não foi criado áudio real, STT real, TTS real, mídia real ou canal real.
- Não foi criado prompt final de produção completo.
- Não foi integrado provedor LLM real.
- Não foi aberta multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria.
- Não houve mudança no Core nem no Worker.

## 9. O que esta PR fechou

- Preparação mínima para multimodalidade/áudio futuro.
- Prova de que áudio futuro é somente forma de entrada/saída, não novo cérebro.
- Prova de que a IA permanece autoridade de fala e surface final.
- Prova de que áudio real, STT/TTS, canal externo e mídia real continuam desligados.
- Prova de que `next_objective`, bloqueios e proibição de promessa de aprovação continuam preservados.

## 10. O que continua pendente após esta PR

- Próximos recortes textuais/preparatórios da atendente especialista MCMV.
- Integração futura com provedor LLM real e prompt final de produção completo, em PR própria.
- Evolução de conhecimento MCMV/CEF e estilo consultivo, sem script rígido.
- Áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker e telemetria permanecem fora do escopo.

## 11. Esta tarefa foi fora de contrato?

**não**

É uma PR de execução dentro do contrato ativo da frente.

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

PR5 canônica — preparação para multimodalidade/áudio futuro sob governança estrutural.

## 11c. Pendência contratual remanescente

Próximos recortes textuais/preparatórios da atendente especialista MCMV após fronteira multimodal mínima.

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
- `src/speech/multimodal-readiness.ts`
- `src/speech/smoke.ts`
- `src/speech/surface.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

Próximo recorte textual/preparatório da atendente especialista MCMV após fronteira multimodal mínima, sem áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria.

## 16. Riscos

- A fronteira multimodal ainda é preparatória e não é pipeline real.
- Provedor LLM real e prompt final de produção ficam para recorte próprio.
- Próximas PRs devem preservar que modalidade futura informa/transporta entrada e saída, mas não substitui a IA, o Core nem a governança estrutural.

## 17. Provas

- `npm run smoke:speech` passou com 14/14 cenários.
- Cenário 14 prova que preparação multimodal permanece apenas contratual.
- Cenário 14 prova que áudio futuro não vira novo cérebro.
- Cenário 14 prova que áudio real, STT real, TTS real e canal externo continuam desligados.
- Cenário 14 prova que `next_objective` e proibição de promessa de aprovação continuam preservados.
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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — páginas 3, 8, 12, 13, 14, 124 e 125; conversa livre governada, multimodal sob mesma governança, áudio como apresentação e dependência futura de persistência; sem áudio real nesta PR
