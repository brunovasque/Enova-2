# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T10:07:38.1335856-03:00 |
| Estado da frente                           | contrato aberto |
| Classificação da tarefa                    | governança |
| Última PR relevante                        | PR 25 — abertura do contrato da frente sucessora do Core |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | abertura contratual; nenhuma execução técnica |
| Pendência contratual remanescente          | PR1 textual mínima da atendente especialista MCMV |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única reinterpretado por A00-ADENDO-01 |
| Próximo passo autorizado                   | PR1 de execução textual mínima da atendente especialista MCMV |
| Próximo passo foi alterado?                | sim — saiu de abertura contratual para PR1 de execução |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e o próximo passo autorizado era abrir o contrato sucessor. Esta tarefa abriu a frente "Speech Engine e Surface Única" mantendo compatibilidade documental com A00/A01/A02, mas subordinando sua interpretação ao A00-ADENDO-01.

A frente deve ser entendida como Atendente Especialista MCMV com Governança Estrutural: a IA é soberana em raciocínio e fala; o mecânico restringe, valida, informa e registra, mas jamais escreve a resposta ao cliente.

Nenhuma implementação funcional foi aberta nesta tarefa.

## 2. Classificação da tarefa

**governança**

## 3. Última PR relevante

PR 25 — abertura do contrato da frente sucessora do Core.

## 4. O que a PR anterior fechou

- Core Mecânico 2 encerrado formalmente.
- Próximo passo autorizado passou a ser abertura do contrato sucessor.

## 5. O que a PR anterior NÃO fechou

- Contrato do Speech Engine e Surface Única ainda não existia.
- Status e handoff da nova frente ainda não existiam.

## 6. Diagnóstico confirmado

- `schema/contracts/_INDEX.md` marcava a frente Speech Engine e Surface Única como aguardando abertura.
- `schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md` marcavam os vivos da frente como a criar.
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` exige que "Speech Engine" não seja interpretado como fala mecânica.
- O A01 autoriza a Prioridade 2 após o Core, mas o adendo muda a interpretação: formar atendente especialista MCMV com IA soberana.

## 7. O que foi feito

- Criado contrato ativo da frente sucessora.
- Atualizado índice de contratos.
- Criado status vivo inicial da frente.
- Criado handoff inicial da frente.
- Atualizados índices de status e handoffs.
- Registrada proibição formal de fala mecânica, fallback dominante e script rígido como motor principal da conversa.

## 8. O que não foi feito

- Não foi alterado código funcional do produto.
- Não foi criado prompt técnico final de produção.
- Não foi implementada resposta final.
- Não foi aberta multimodalidade, áudio, Supabase, Meta/WhatsApp ou telemetria.

## 9. O que esta PR fechou

- Abertura contratual da frente sucessora do Core.
- Subordinação explícita da frente ao A00-ADENDO-01.
- Definição do próximo passo autorizado.

## 10. O que continua pendente após esta PR

- PR1 de execução textual mínima da atendente especialista MCMV.
- Provas futuras de surface única com IA soberana e governança invisível.

## 11. Esta tarefa foi fora de contrato?

**não**

É uma tarefa de governança para abertura do contrato da nova frente, autorizada pelo A01 e pelo estado vivo do Core encerrado.

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

Abertura contratual; nenhuma execução técnica.

## 11c. Pendência contratual remanescente

PR1 textual mínima da atendente especialista MCMV.

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

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Interpretação obrigatória: Atendente Especialista MCMV com IA soberana e governança estrutural.

## 14. Estado atual da frente

**contrato aberto**

## 15. Próximo passo autorizado

PR 1 de execução textual mínima da atendente especialista MCMV, sem áudio/multimodalidade plena, Supabase, Meta/WhatsApp ou telemetria.

## 16. Riscos

- Regressão semântica do nome "Speech Engine" para fala mecânica; mitigada por cláusula explícita de A00-ADENDO-01.
- PR futura tentar transformar fallback em cérebro; bloqueado pelo contrato.
- PR futura abrir integração externa cedo demais; bloqueado como fora de escopo.

## 17. Provas

- Contrato ativo criado com cláusulas de soberania da IA.
- Índices vivos atualizados.
- Nenhum arquivo de código funcional foi modificado.

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         Nenhum — frente aguardava abertura contratual
  Status da frente lido:       Nenhum — status criado nesta tarefa
  Handoff da frente lido:      Nenhum — handoff criado nesta tarefa
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  N/A — abertura governança sem consumo de regra transcrita
  PDF mestre consultado:       não consultado — tarefa de governança contratual sem definição de regra de negócio nova
