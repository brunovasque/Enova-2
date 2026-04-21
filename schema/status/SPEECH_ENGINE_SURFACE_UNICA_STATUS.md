# STATUS VIVO — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Contrato ativo                             | Nenhum — contrato anterior encerrado em 2026-04-21 |
| Estado do contrato                         | encerrado |
| Última PR executou qual recorte            | PR closeout — encerramento formal da Frente 2 |
| Pendência contratual                       | nenhuma — contrato encerrado formalmente; pendências remanescentes são escopo de frentes futuras (ver seção 9) |
| Contrato encerrado?                        | sim |
| Item do A01                                | Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes |
| Estado atual                               | encerrado — Frente 2 concluída formalmente |
| Classe da última tarefa                    | governança / closeout |
| Última PR relevante                        | PR closeout — encerramento formal da Frente 2 |
| Último commit funcional                    | PR 33 — `feat(speech): PR 33 acceptance smoke — Cenário 15 integrado` |
| Pendência remanescente herdada             | nenhuma contratual — frentes futuras são responsáveis pelas pendências declaradas no bloco de encerramento |
| Próximo passo autorizado                   | Abertura do contrato da Frente 3 — Contexto, Extração Estruturada e Memória Viva |
| Legados aplicáveis                         | L03 obrigatório; L01/L02/L19 complementares; família legada do recorte ativo conforme PR |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-21T17:24:15Z |

---

## 1. Nome da frente

Speech Engine e Surface Única.

Interpretação obrigatória: Atendente Especialista MCMV com Governança Estrutural.

## 2. Contrato ativo

Nenhum — contrato anterior encerrado em 2026-04-21.

Contrato arquivado em: `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md`

## 2a. Estado do contrato

**encerrado**

## 2b. Última PR executou qual recorte do contrato

PR closeout — encerramento formal da Frente 2 (Speech Engine e Surface Única).

Cumpriu integralmente o `CONTRACT_CLOSEOUT_PROTOCOL.md`: bloco `--- ENCERRAMENTO DE CONTRATO ---` preenchido, contrato arquivado, índice atualizado, status e handoff atualizados, Frente 3 declarada como próxima.

## 2c. Pendência contratual

Nenhuma — contrato encerrado formalmente. Pendências remanescentes são escopo de frentes futuras:
- Provedor LLM real e prompt final de produção → recorte próprio pós-closeout
- Áudio real, STT real, TTS real → Frente 5
- Multimodalidade plena → Frente 5
- Canal Meta/WhatsApp → Frente 6
- Telemetria → Frente 7
- Shadow mode, canary, rollout → Frente 8
- Worker → frente específica
- Supabase Adapter → Frente 4

## 2d. Contrato encerrado?

**sim — 2026-04-21T17:24:15Z**

## 3. Item do A01

- Fase: Fase 2
- Prioridade: Prioridade 2
- Item: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes

## 4. Estado atual

**encerrado — Frente 2 concluída formalmente em 2026-04-21**

A frente entregou e provou:

- envelope estrutural de política para IA soberana;
- primeira surface final mínima que publica somente texto autorado pela IA;
- rejeição explícita de autoria mecânica para resposta final;
- contrato cognitivo mínimo da atendente especialista MCMV;
- modelo mínimo de resposta livre governada;
- modelo mínimo de turno composto governado;
- fronteira preparatória mínima para multimodalidade/áudio futuro;
- smoke específico cobrindo 15 cenários (acceptance smoke PR 33 — 15/15 passando, `all_passed = true`);
- checklist canônico de critérios de fechamento em `schema/FRENTE2_CLOSEOUT_READINESS.md`;
- **encerramento formal via `CONTRACT_CLOSEOUT_PROTOCOL.md`** — bloco de encerramento preenchido, contrato arquivado.

## 5. Classe da última tarefa

**governança / closeout**

## 6. Última PR relevante

PR closeout — encerramento formal da Frente 2 (Speech Engine e Surface Única).

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
- **PR 33:** Cenário 15 — prova final integrada adicionado ao `src/speech/smoke.ts`. Cobre o fluxo completo policy → cognitive → free-response → composite-turn → surface → multimodal-readiness com 29 assertions mapeadas aos 7 critérios de aceite. Resultado: 15/15 cenários passando, `all_passed = true`. Gate 2 (A01) formalmente satisfeito.

## 9. Pendências

- **Nenhuma pendência contratual remanescente.**
- Integração futura com provedor LLM real e prompt final de produção completo, em recorte próprio pós-closeout (fora de escopo desta frente).
- Áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria seguem bloqueados e são escopo de frentes específicas (ver seção 2c).

## 10. Pendência remanescente herdada

Nenhuma pendência contratual. Contrato encerrado formalmente em 2026-04-21T17:24:15Z.

## 11. Bloqueios

- Áudio real, STT/TTS real e multimodalidade plena permanecem bloqueados.
- Supabase permanece fora deste contrato inicial.
- Meta/WhatsApp permanece fora deste contrato inicial.
- Telemetria permanece fora deste contrato inicial.
- Qualquer fala mecânica é bloqueio por A00-ADENDO-01.
- Fallback dominante continua proibido.
- Resposta engessada por stage continua proibida.

## 12. Próximo passo autorizado

**Abertura do contrato da Frente 3 — Contexto, Extração Estruturada e Memória Viva.**

A Frente 3 é a próxima frente autorizada conforme A01 (Fase 3 — Prioridade 3). O contrato da Frente 3 deve seguir o formato `schema/CONTRACT_SCHEMA.md` e ser aprovado antes de qualquer implementação.

## 13. Legados aplicáveis

- Obrigatório: L03.
- Complementares: L01, L02, L19 e família legada do recorte ativo.

## 14. Última atualização

2026-04-21T17:24:15Z — PR closeout: encerramento formal da Frente 2 executado — contrato arquivado, Frente 3 declarada como próxima.

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

Fontes de verdade consultadas — última tarefa:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` (antes do arquivamento)
  Status da frente lido:       `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`
  Closeout readiness lido:     `schema/FRENTE2_CLOSEOUT_READINESS.md`
  Protocol lido:               `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
  Contrato arquivado em:       `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md`
