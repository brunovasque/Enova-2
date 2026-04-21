# STATUS VIVO — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | PR 29 — PR4 textual: modelo mínimo de resposta livre governada |
| Pendência contratual                       | próximos recortes textuais da atendente especialista MCMV; provedor LLM real e prompt final de produção completo ainda não abertos |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes |
| Estado atual                               | em execução |
| Classe da última tarefa                    | contratual |
| Última PR relevante                        | PR 29 — PR4 textual: modelo mínimo de resposta livre governada |
| Último commit funcional                    | `3cbeba4d120748e62fa79497c5c470872d6a750b` — `feat(speech): criar resposta livre governada` |
| Pendência remanescente herdada             | após a PR 28 ainda faltava explicitar como a resposta livre da IA permanece alinhada ao Core e ao contrato cognitivo sem virar script |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV após resposta livre governada, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria |
| Legados aplicáveis                         | L03 obrigatório; L01/L02/L19 complementares; família legada do recorte ativo conforme PR |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-21T11:46:39.4804111-03:00 |

---

## 1. Nome da frente

Speech Engine e Surface Única.

Interpretação obrigatória: Atendente Especialista MCMV com Governança Estrutural.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

PR 29 — PR4 textual: modelo mínimo de resposta livre governada.

O recorte adicionou `src/speech/free-response.ts` para validar uma resposta livre autorada pela IA contra policy, surface e contrato cognitivo. A governança continua invisível e estrutural: preserva `next_objective`, bloqueios e limites MCMV/CEF, rejeita promessa de aprovação e não escreve texto alternativo.

## 2c. Pendência contratual

Executar os próximos recortes textuais da atendente especialista MCMV, preservando IA soberana e sem fala mecânica.

Ainda não foram abertos: provedor LLM real, prompt final de produção completo, áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria.

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
- smoke específico cobrindo fallback não dominante, ausência de texto final gerado pelo mecânico, proibição de script rígido dominante e rejeição de promessa de aprovação.

## 5. Classe da última tarefa

**contratual**

## 6. Última PR relevante

PR 29 — PR4 textual: modelo mínimo de resposta livre governada.

## 7. Último commit funcional

`3cbeba4d120748e62fa79497c5c470872d6a750b` — `feat(speech): criar resposta livre governada`.

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

## 9. Pendências

- Próximos recortes textuais da atendente especialista MCMV.
- Integração futura com provedor LLM real e prompt final de produção completo, em recorte próprio.
- Áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria seguem bloqueados nesta frente.

## 10. Pendência remanescente herdada

Após a PR 28, ainda faltava explicitar o modelo mínimo de resposta livre sob governança estrutural. Este recorte prova que a IA pode adaptar tom e profundidade ao contexto sem contrariar o Core, sem ignorar bloqueios e sem promessa de aprovação.

## 11. Bloqueios

- Áudio/multimodalidade plena permanece bloqueado.
- Supabase permanece fora deste contrato inicial.
- Meta/WhatsApp permanece fora deste contrato inicial.
- Telemetria permanece fora deste contrato inicial.
- Qualquer fala mecânica é bloqueio por A00-ADENDO-01.
- Fallback dominante continua proibido.
- Resposta engessada por stage continua proibida.

## 12. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV após resposta livre governada, ainda sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

Esse próximo recorte deve continuar provando que a IA escreve a resposta final, que a governança estrutural apenas restringe/valida/informa e que a postura consultiva MCMV não vira script rígido.

## 13. Legados aplicáveis

- Obrigatório: L03.
- Complementares: L01, L02, L19 e família legada do recorte ativo.

## 14. Última atualização

2026-04-21T11:46:39.4804111-03:00 — PR 29: modelo mínimo de resposta livre governada.

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — ancoragem L03/L19, fluxo LLM-first, conversa livre sob governança, MCMV/CEF e não promessa de aprovação; sem regra nova de negócio nesta PR
