# STATUS VIVO — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke |
| Pendência contratual                       | prova final / acceptance smoke (PR 33); encerramento formal do contrato (PR closeout); provedor LLM real, prompt final de produção, áudio real e multimodalidade plena permanecem bloqueados |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes |
| Estado atual                               | em consolidação para closeout |
| Classe da última tarefa                    | governança |
| Última PR relevante                        | PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke |
| Último commit funcional                    | `289e8a9` — `feat(speech): preparar fronteira multimodal` (última entrega técnica — PR 31) |
| Pendência remanescente herdada             | após a PR 31 faltava consolidar critérios explícitos de fechamento, mapear cada critério ao que já foi entregue nas PRs anteriores e preparar a PR de prova final/acceptance smoke |
| Próximo passo autorizado                   | PR 33 — prova final / acceptance smoke da Frente 2; sem nova feature, sem abrir Supabase, Meta/WhatsApp, Worker, telemetria, áudio real ou multimodalidade plena |
| Legados aplicáveis                         | L03 obrigatório; L01/L02/L19 complementares; família legada do recorte ativo conforme PR |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-21T16:17:00.000Z |

---

## 1. Nome da frente

Speech Engine e Surface Única.

Interpretação obrigatória: Atendente Especialista MCMV com Governança Estrutural.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke.

O recorte criou `schema/FRENTE2_CLOSEOUT_READINESS.md` com critérios explícitos, verificáveis e vivos de fechamento da Frente 2, mapeando cada critério ao que já foi entregue nas PRs 25–31 e declarando explicitamente o que será provado na PR 33 (acceptance smoke) e encerrado na PR de closeout formal. Nenhuma nova feature foi criada. Nenhum artefato técnico de speech foi alterado.

## 2c. Pendência contratual

Prova final / acceptance smoke (PR 33) e encerramento formal do contrato (PR closeout).

Ainda não foram abertos: provedor LLM real, prompt final de produção completo, áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker e telemetria.

## 2d. Contrato encerrado?

**não**

## 3. Item do A01

- Fase: Fase 2
- Prioridade: Prioridade 2
- Item: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes

## 4. Estado atual

**em consolidação para closeout**

A frente agora possui:

- envelope estrutural de política para IA soberana;
- primeira surface final mínima que publica somente texto autorado pela IA;
- rejeição explícita de autoria mecânica para resposta final;
- contrato cognitivo mínimo da atendente especialista MCMV;
- modelo mínimo de resposta livre governada;
- modelo mínimo de turno composto governado;
- fronteira preparatória mínima para multimodalidade/áudio futuro;
- smoke específico cobrindo 14 cenários: fallback não dominante, ausência de texto final gerado pelo mecânico, proibição de script rígido dominante, rejeição de promessa de aprovação, múltiplos sinais sem sobrescrever o Core e preparação multimodal sem áudio real;
- checklist canônico de critérios de fechamento em `schema/FRENTE2_CLOSEOUT_READINESS.md`.

## 5. Classe da última tarefa

**governança**

## 6. Última PR relevante

PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke.

## 7. Último commit funcional

`289e8a9` — `feat(speech): preparar fronteira multimodal`.

## 8. Entregas concluídas

- Contrato ativo da frente criado.
- Índice de contratos atualizado.
- Status vivo inicial criado.
- Handoff inicial criado.
- Subordinação a A00-ADENDO-01 registrada.
- Política textual mínima criada como envelope estrutural para a IA soberana.
- Smoke textual mínimo criado e integrado ao `smoke:all`.
- Primeira surface final mínima criada em `src/speech/surface.ts`.
- Smoke ampliado para provar que a surface aceita autoria `llm` e rejeita autoria `mechanical`.
- Contrato cognitivo mínimo criado em `src/speech/cognitive.ts`.
- Smoke ampliado para provar postura consultiva MCMV, autoridade cognitiva da IA, proibição de promessa de aprovação, proibição de script rígido e fallback dominante.
- Modelo mínimo de resposta livre governada criado em `src/speech/free-response.ts`.
- Smoke ampliado para provar resposta livre da IA, respeito a bloqueio/`next_objective`, ausência de texto escrito pela governança e rejeição de promessa de aprovação.
- Modelo mínimo de turno composto governado criado em `src/speech/composite-turn.ts`.
- Smoke ampliado para provar que múltiplas informações informam a IA sem parser mecânico dominante, sem sobrescrever `next_objective`/bloqueios e sem promessa de aprovação.
- Preparação multimodal mínima criada em `src/speech/multimodal-readiness.ts`.
- Smoke ampliado para provar que áudio futuro é apenas modalidade/adaptador, não novo cérebro, e que áudio real, STT/TTS, canal externo e processamento de mídia continuam desligados.
- **PR 32:** checklist canônico de critérios de fechamento criado em `schema/FRENTE2_CLOSEOUT_READINESS.md`, com mapeamento de cada critério ao artefato entregue e declaração explícita do que a PR 33 deve provar.

## 9. Pendências

- PR 33 — prova final / acceptance smoke: execução dos critérios consolidados no `FRENTE2_CLOSEOUT_READINESS.md`.
- Encerramento formal do contrato via `CONTRACT_CLOSEOUT_PROTOCOL.md` (PR closeout, posterior à PR 33).
- Integração futura com provedor LLM real e prompt final de produção completo, em recorte próprio pós-closeout.
- Áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria seguem bloqueados nesta frente.

## 10. Pendência remanescente herdada

Após a PR 31, faltava consolidar critérios explícitos de fechamento, mapear cada critério ao que já foi entregue nas PRs 25–31 e preparar a PR de prova final/acceptance smoke. A PR 32 entrega esse consolidado.

## 11. Bloqueios

- Áudio real, STT/TTS real e multimodalidade plena permanecem bloqueados.
- Supabase permanece fora deste contrato inicial.
- Meta/WhatsApp permanece fora deste contrato inicial.
- Telemetria permanece fora deste contrato inicial.
- Qualquer fala mecânica é bloqueio por A00-ADENDO-01.
- Fallback dominante continua proibido.
- Resposta engessada por stage continua proibida.

## 12. Próximo passo autorizado

**PR 33 — prova final / acceptance smoke da Frente 2.**

A PR 33 deve executar os critérios consolidados em `schema/FRENTE2_CLOSEOUT_READINESS.md` sem abrir nova feature, sem abrir áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria.

## 13. Legados aplicáveis

- Obrigatório: L03.
- Complementares: L01, L02, L19 e família legada do recorte ativo.

## 14. Última atualização

2026-04-21T16:17:00.000Z — PR 32: consolidação de critérios de fechamento e preparação de acceptance smoke.

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

Fontes de verdade consultadas — última tarefa:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`
  Status da frente lido:       `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — L03 identificado, conteúdo não transcrito
  PDF mestre consultado:       não consultado — blocos aplicáveis disponíveis no markdown mestre
