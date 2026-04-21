# STATUS VIVO — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Estado do contrato                         | em execução |
| Última PR executou qual recorte            | PR em preparação — PR2 textual: primeira surface final mínima autorada pela IA |
| Pendência contratual                       | próximos recortes textuais da atendente especialista MCMV; provedor LLM real e prompt final de produção ainda não abertos |
| Contrato encerrado?                        | não |
| Item do A01                                | Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes |
| Estado atual                               | em execução |
| Classe da última tarefa                    | contratual |
| Última PR relevante                        | PR em preparação — PR2 textual: primeira surface final mínima autorada pela IA |
| Último commit funcional                    | `19c83aab7fd4b48d1a2ef54e23f18a49dcace24a` — `feat(speech): criar surface final minima da ia` |
| Pendência remanescente herdada             | após a PR 26 ainda faltava provar surface final real escrita pela IA |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV após a surface mínima, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria |
| Legados aplicáveis                         | L03 obrigatório; L01/L02/L19 complementares; família legada do recorte ativo conforme PR |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes consultadas — última tarefa         | ver seção 17 |
| Última atualização                         | 2026-04-21T10:58:44.7862454-03:00 |

---

## 1. Nome da frente

Speech Engine e Surface Única.

Interpretação obrigatória: Atendente Especialista MCMV com Governança Estrutural.

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 2a. Estado do contrato

**em execução**

## 2b. Última PR executou qual recorte do contrato

PR em preparação — PR2 textual: primeira surface final mínima autorada pela IA.

O recorte saiu do envelope puramente estrutural da PR 26 e criou uma camada mínima de publicação de surface final: o texto final precisa chegar como draft autorado por `llm`; a camada de Speech apenas valida a política, preserva a governança estrutural e rejeita qualquer autoria mecânica.

## 2c. Pendência contratual

Executar os próximos recortes textuais da atendente especialista MCMV, preservando IA soberana e sem fala mecânica.

Ainda não foram abertos: provedor LLM real, prompt final de produção, áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria.

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
- smoke específico cobrindo fallback não dominante e ausência de texto final gerado pelo mecânico.

## 5. Classe da última tarefa

**contratual**

## 6. Última PR relevante

PR em preparação — PR2 textual: primeira surface final mínima autorada pela IA.

## 7. Último commit funcional

`19c83aab7fd4b48d1a2ef54e23f18a49dcace24a` — `feat(speech): criar surface final minima da ia`.

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

## 9. Pendências

- Próximos recortes textuais da atendente especialista MCMV.
- Integração futura com provedor LLM real e prompt final de produção, em recorte próprio.
- Áudio, multimodalidade plena, Supabase, Meta/WhatsApp e telemetria seguem bloqueados nesta frente.

## 10. Pendência remanescente herdada

Após a PR 26, a surface final real escrita pela IA ainda estava pendente. Este recorte implementa a primeira camada mínima dessa surface sem transformar o mecânico em autor da fala.

## 11. Bloqueios

- Áudio/multimodalidade plena permanece bloqueado.
- Supabase permanece fora deste contrato inicial.
- Meta/WhatsApp permanece fora deste contrato inicial.
- Telemetria permanece fora deste contrato inicial.
- Qualquer fala mecânica é bloqueio por A00-ADENDO-01.
- Fallback dominante continua proibido.

## 12. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV após a surface mínima, ainda sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

Esse próximo recorte deve continuar provando que a IA escreve a resposta final e que a governança estrutural apenas restringe, valida e informa.

## 13. Legados aplicáveis

- Obrigatório: L03.
- Complementares: L01, L02, L19 e família legada do recorte ativo.

## 14. Última atualização

2026-04-21T10:58:44.7862454-03:00 — PR2 textual: primeira surface final mínima autorada pela IA.

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
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — ancoragem L03/fluxo LLM-first; sem regra nova de negócio nesta PR
