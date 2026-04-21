# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T16:17:00.000Z |
| Estado da frente                           | em consolidação para closeout |
| Classificação da tarefa                    | governança |
| Última PR relevante                        | PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR 32 — consolidação de critérios finais de aceite e preparação de closeout |
| Pendência contratual remanescente          | PR 33 (prova final / acceptance smoke); encerramento formal do contrato (PR closeout) |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | PR 33 — prova final / acceptance smoke da Frente 2 |
| Próximo passo foi alterado?                | sim — saiu de "próximo recorte textual/preparatório" para "PR 33 = prova final / acceptance smoke" |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. As PRs 26–31 executaram os 5 recortes canônicos da Frente 2: política textual mínima, surface final mínima, contrato cognitivo mínimo, resposta livre governada, turno composto governado e preparação multimodal mínima.

A PR 32 é de governança/consolidação: ela não criou nova feature técnica. Ela criou `schema/FRENTE2_CLOSEOUT_READINESS.md` com os critérios explícitos, verificáveis e vivos de fechamento da Frente 2, mapeando cada critério ao artefato entregue e declarando o que a PR 33 deve provar e o que a PR de closeout deve encerrar formalmente.

## 2. Classificação da tarefa

**governança**

## 3. Última PR relevante

PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke.

## 4. O que a PR anterior fechou

- PR 31 criou `src/speech/multimodal-readiness.ts`.
- PR 31 provou que áudio futuro é apenas modalidade/adaptador, não novo cérebro.
- PR 31 provou que áudio real, STT/TTS, canal externo e mídia real continuam desligados.
- PR 31 preservou `next_objective`, bloqueios e proibição de promessa de aprovação na fronteira multimodal.
- Smoke 14/14 passando após PR 31.

## 5. O que a PR anterior NÃO fechou

- Consolidação explícita dos critérios de fechamento da frente.
- Mapeamento de cada critério ao artefato entregue nas PRs 25–31.
- Declaração formal do que a PR 33 deve provar.
- Encerramento formal do contrato.

## 6. Diagnóstico confirmado (PR 32)

- Smoke 14/14 passando (validado em 2026-04-21T16:16:35Z).
- Todos os artefatos técnicos da Frente 2 entregues nas PRs 25–31 estão presentes e funcionais.
- Os critérios de aceite do contrato ativo (§8) foram todos implementados e provados em smoke.
- Nenhuma ambiguidade sobre o que falta para encerrar formalmente a frente — declarado em `schema/FRENTE2_CLOSEOUT_READINESS.md`.

## 7. O que foi feito na PR 32

- Criado `schema/FRENTE2_CLOSEOUT_READINESS.md`:
  - Checklist de 7 critérios finais de aceite, cada um mapeado a artefato entregue e smoke.
  - Tabela de PRs 25–32 com status de entrega.
  - Tabela de critérios do A01 e seu estado.
  - Declaração explícita do que está fora de escopo desta frente (bloqueado formalmente).
  - Declaração do que a PR 33 deve provar (acceptance smoke).
  - Declaração do que a PR de closeout deve fazer.
  - Declaração de conformidade negativa (o que não foi feito).
- Atualizado `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`:
  - Estado: "em consolidação para closeout".
  - Última PR, classe da tarefa, pendências e próximo passo autorizado atualizados.
- Atualizado `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` (este arquivo).
- Atualizado `schema/contracts/_INDEX.md`.

## 8. O que não foi feito na PR 32

- Não foi criada nova feature de speech.
- Não foi alterado nenhum artefato técnico em `src/speech/`.
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
- O contrato não foi encerrado.

## 9. O que a PR 32 fechou

- Critérios explícitos, verificáveis e vivos de fechamento da Frente 2 — consolidados em `schema/FRENTE2_CLOSEOUT_READINESS.md`.
- Mapeamento de cada critério ao que já foi entregue nas PRs 25–31.
- Preparação formal da PR 33 como "prova final / acceptance smoke".
- Atualização dos vivos da frente para refletir fase de consolidação para closeout.

## 10. O que continua pendente após a PR 32

- **PR 33** — prova final / acceptance smoke da Frente 2:
  - Execução dos critérios consolidados no `FRENTE2_CLOSEOUT_READINESS.md`.
  - Todos os cenários de smoke existentes (14) passando.
  - Cenário integrado cobrindo o fluxo completo.
  - Confirmação explícita de que nenhum item bloqueado foi aberto.
- **PR closeout** — encerramento formal do contrato via `CONTRACT_CLOSEOUT_PROTOCOL.md`.
- Integração futura com provedor LLM real e prompt final de produção, em PR/recorte próprio pós-closeout.
- Áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker e telemetria permanecem fora do escopo desta frente.

## 11. Esta tarefa foi fora de contrato?

**não**

É uma PR de governança dentro da frente ativa.

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

Consolidação de critérios finais de aceite e preparação de closeout — recorte de governança sem entrega técnica nova.

## 11c. Pendência contratual remanescente

PR 33 (prova final / acceptance smoke) e PR de closeout formal.

## 11d. Houve desvio de contrato?

**não**

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `schema/FRENTE2_CLOSEOUT_READINESS.md` ← criado nesta PR
- `schema/contracts/_INDEX.md`
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`
- `src/speech/policy.ts`
- `src/speech/surface.ts`
- `src/speech/cognitive.ts`
- `src/speech/free-response.ts`
- `src/speech/composite-turn.ts`
- `src/speech/multimodal-readiness.ts`
- `src/speech/smoke.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em consolidação para closeout**

## 15. Próximo passo autorizado

**PR 33 — prova final / acceptance smoke da Frente 2.**

A PR 33 executa os critérios consolidados em `schema/FRENTE2_CLOSEOUT_READINESS.md` sem abrir nova feature, sem abrir áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria.

## 16. Riscos

- Nenhum risco técnico novo nesta PR (sem entrega técnica).
- Risco de interpretação: a PR 33 deve ser estritamente "prova" — sem tentar abrir nova capacidade funcional.
- Risco de drift: qualquer PR entre esta e a PR 33 que tente abrir nova feature de speech deve ser parada como não conforme.

## 17. Provas

- `schema/FRENTE2_CLOSEOUT_READINESS.md` criado com critérios verificáveis e rastreáveis.
- `npm run smoke:speech` — 14/14 cenários passando (validado em 2026-04-21T16:16:35Z, antes desta PR de governança).
- Nenhum artefato técnico em `src/speech/` foi alterado nesta PR.
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
  Handoff da frente lido:      `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` (este arquivo)
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — L03 identificado, conteúdo não transcrito
  PDF mestre consultado:       não consultado — blocos aplicáveis disponíveis no markdown mestre

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
