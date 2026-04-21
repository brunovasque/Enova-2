# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T10:33:37.2046058-03:00 |
| Estado da frente                           | em execução |
| Classificação da tarefa                    | contratual |
| Última PR relevante                        | PR1 textual mínima — política de IA soberana sem fala mecânica |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR1 textual mínima — envelope de política para IA soberana |
| Pendência contratual remanescente          | próximos recortes textuais da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | próximo recorte textual da atendente especialista MCMV |
| Próximo passo foi alterado?                | sim — saiu da PR1 textual mínima para o próximo recorte textual |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. Esta tarefa executou a PR1 textual mínima da frente "Speech Engine e Surface Única", mantendo a interpretação obrigatória como Atendente Especialista MCMV com Governança Estrutural.

A frente deve ser entendida como Atendente Especialista MCMV com Governança Estrutural: a IA é soberana em raciocínio e fala; o mecânico restringe, valida, informa e registra, mas jamais escreve a resposta ao cliente.

O recorte implementado não redige resposta ao cliente. Ele produz apenas um envelope estrutural para a IA soberana consumir: proprietário da surface, restrições, padrões proibidos e decisão estrutural herdada do Core.

## 2. Classificação da tarefa

**contratual**

## 3. Última PR relevante

PR1 textual mínima — política de IA soberana sem fala mecânica.

## 4. O que a PR anterior fechou

- Contrato ativo da frente aberto.
- Status e handoff iniciais criados.
- Próximo passo autorizado passou a ser PR1 textual mínima.

## 5. O que a PR anterior NÃO fechou

- Recorte textual mínimo ainda não existia.
- Não havia smoke da frente Speech/Atendente MCMV.

## 6. Diagnóstico confirmado

- `schema/contracts/_INDEX.md` marcava a frente Speech Engine e Surface Única como aberta e aguardando PR1.
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md` e `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` apontavam PR1 textual mínima como próximo passo.
- O código existente só possuía `speech_intent` estrutural no Core e resposta técnica do Worker; não havia surface conversacional final.
- O recorte mínimo seguro é uma política estrutural para a IA soberana, não um gerador de fala.

## 7. O que foi feito

- Criado `src/speech/policy.ts` com envelope de política textual mínima.
- Criado `src/speech/smoke.ts` para provar IA soberana, mecânico sem fala e fallback não dominante.
- Adicionado script `smoke:speech`.
- `smoke:all` passou a incluir o smoke textual mínimo.
- Atualizados contrato, índice, status e handoff para estado em execução.

## 8. O que não foi feito

- Não foi criada resposta final ao cliente.
- Não foi criado prompt técnico final de produção.
- Não foi criada rota pública nova.
- Não foi aberta multimodalidade, áudio, Supabase, Meta/WhatsApp ou telemetria.

## 9. O que esta PR fechou

- PR1 textual mínima da frente.
- Prova de que a política preserva `surface_owner=llm`.
- Prova de que `mechanical_may_write_customer_text=false`.
- Prova de que fallback é guardrail não dominante.

## 10. O que continua pendente após esta PR

- Próximos recortes textuais da atendente especialista MCMV.
- Surface final real escrita pela IA ainda fica para PR futura.

## 11. Esta tarefa foi fora de contrato?

**não**

É uma PR de execução dentro do contrato ativo da frente.

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

PR1 textual mínima — envelope de política para IA soberana.

## 11c. Pendência contratual remanescente

Próximos recortes textuais da atendente especialista MCMV.

## 11d. Houve desvio de contrato?

**não**

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`
- `schema/contracts/_INDEX.md`
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
- `schema/status/_INDEX.md`
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md`
- `schema/handoffs/_INDEX.md`
- `src/speech/policy.ts`
- `src/speech/smoke.ts`
- `package.json`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**em execução**

## 15. Próximo passo autorizado

Próximo recorte textual da atendente especialista MCMV, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

## 16. Riscos

- O recorte ainda não produz surface final real; isso é deliberado para evitar fala mecânica.
- PR futura deve continuar provando que o LLM escreve a resposta final.
- Supabase, Meta/WhatsApp, telemetria, áudio e multimodalidade seguem bloqueados.

## 17. Provas

- `npm run smoke:speech` passou com 2/2 cenários.
- `npm run smoke:all` passou com Core, Worker e Speech.
- `src/speech/policy.ts` não contém texto de atendimento ao cliente.
- `src/speech/smoke.ts` prova `surface_owner=llm`, `mechanical_speech_priority=forbidden` e fallback não dominante.

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
  Legado markdown consultado:  N/A — abertura governança sem consumo de regra transcrita
  PDF mestre consultado:       não consultado — tarefa de governança contratual sem definição de regra de negócio nova
