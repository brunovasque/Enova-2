# STATUS VIVO — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | PR 31 — PR5 canônica: preparação para multimodalidade/áudio |
| Pendência contratual                       | próximos recortes textuais/preparatórios da atendente especialista MCMV; provedor LLM real, prompt final de produção, áudio real e multimodalidade plena ainda não abertos |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes |
| Estado atual                               | em execução |
| Classe da última tarefa                    | contratual |
| Última PR relevante                        | PR 31 — PR5 canônica: preparação para multimodalidade/áudio |
| Último commit funcional                    | `289e8a9` — `feat(speech): preparar fronteira multimodal` |
| Pendência remanescente herdada             | após a PR 30 faltava preparar a fronteira futura de multimodalidade/áudio sem abrir áudio real, STT/TTS, canal, Worker ou integração externa |
| Próximo passo autorizado                   | próximo recorte textual/preparatório da atendente especialista MCMV após fronteira multimodal mínima, sem áudio real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria |
| Legados aplicáveis                         | L03 obrigatório; L01/L02/L19 complementares; família legada do recorte ativo conforme PR |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-21T12:24:16.7397546-03:00 |

---

## 1. Nome da frente

Speech Engine e Surface Única.

Interpretação obrigatória: Atendente Especialista MCMV com Governança Estrutural.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

PR 31 — PR5 canônica: preparação para multimodalidade/áudio.

O recorte adicionou `src/speech/multimodal-readiness.ts` para declarar a fronteira preparatória de multimodalidade/áudio futuro. A camada não executa áudio real, STT, TTS, mídia, canal ou provedor externo; ela apenas fixa que modalidade futura será forma de entrada/saída sob a mesma governança, sem virar novo cérebro e sem dar prioridade de fala ao mecânico.

## 2c. Pendência contratual

Executar os próximos recortes textuais/preparatórios da atendente especialista MCMV, preservando IA soberana e sem fala mecânica.

Ainda não foram abertos: provedor LLM real, prompt final de produção completo, áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker e telemetria.

## 2d. Contrato encerrado?

**não**

## 3. Item do A01

- Fase: Fase 2
- Prioridade: Prioridade 2
- Item: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes

## 4. Estado atual

**em execução**

A frente agora possui:

- envelope estrutural de política para IA soberana;
- primeira surface final mínima que publica somente texto autorado pela IA;
- rejeição explícita de autoria mecânica para resposta final;
- contrato cognitivo mínimo da atendente especialista MCMV;
- modelo mínimo de resposta livre governada;
- modelo mínimo de turno composto governado;
- fronteira preparatória mínima para multimodalidade/áudio futuro;
- smoke específico cobrindo fallback não dominante, ausência de texto final gerado pelo mecânico, proibição de script rígido dominante, rejeição de promessa de aprovação, múltiplos sinais sem sobrescrever o Core e preparação multimodal sem áudio real.

## 5. Classe da última tarefa

**contratual**

## 6. Última PR relevante

PR 31 — PR5 canônica: preparação para multimodalidade/áudio.

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

## 9. Pendências

- Próximos recortes textuais/preparatórios da atendente especialista MCMV.
- Integração futura com provedor LLM real e prompt final de produção completo, em recorte próprio.
- Áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria seguem bloqueados nesta frente.

## 10. Pendência remanescente herdada

Após a PR 30, ainda faltava preparar a fronteira futura de multimodalidade/áudio sem abrir implementação real. Este recorte prova que áudio futuro será apenas forma de entrada/saída sob a mesma governança textual, sem mudar autoridade de decisão, sem mudar autoridade de fala e sem prioridade mecânica.

## 11. Bloqueios

- Áudio real, STT/TTS real e multimodalidade plena permanecem bloqueados.
- Supabase permanece fora deste contrato inicial.
- Meta/WhatsApp permanece fora deste contrato inicial.
- Telemetria permanece fora deste contrato inicial.
- Qualquer fala mecânica é bloqueio por A00-ADENDO-01.
- Fallback dominante continua proibido.
- Resposta engessada por stage continua proibida.

## 12. Próximo passo autorizado

Próximo recorte textual/preparatório da atendente especialista MCMV após fronteira multimodal mínima, ainda sem áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria.

Esse próximo recorte deve continuar provando que a IA escreve a resposta final, que a governança estrutural apenas restringe/valida/informa e que a postura consultiva MCMV não vira script rígido.

## 13. Legados aplicáveis

- Obrigatório: L03.
- Complementares: L01, L02, L19 e família legada do recorte ativo.

## 14. Última atualização

2026-04-21T12:24:16.7397546-03:00 — PR 31: preparação para multimodalidade/áudio.

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — páginas 3, 8, 12, 13, 14, 124 e 125; conversa livre governada, multimodal sob mesma governança, áudio como apresentação e dependência futura de persistência; sem áudio real nesta PR
