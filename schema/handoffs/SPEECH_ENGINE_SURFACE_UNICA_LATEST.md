# HANDOFF — Speech Engine e Surface Única — ENOVA 2

## Aviso de rebase canonico — 2026-04-22

Este arquivo preserva o historico tecnico/local do recorte anterior. Apos o rebase canonico, ele nao deve ser lido como prova de implantacao macro concluida. A base macro soberana passou a ser `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`; a fase real atual e T0/G0, conforme `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.


| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T17:24:15Z |
| Estado da frente                           | encerrado — Frente 2 concluída formalmente |
| Classificação da tarefa                    | governança / closeout |
| Última PR relevante                        | PR closeout — encerramento formal da Frente 2 |
| Contrato ativo                             | Nenhum — contrato encerrado e arquivado em 2026-04-21 |
| Recorte executado do contrato              | PR closeout — encerramento formal via `CONTRACT_CLOSEOUT_PROTOCOL.md` |
| Pendência contratual remanescente          | nenhuma |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | sim — 2026-04-21T17:24:15Z |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única — encerrado formalmente |
| Próximo passo autorizado                   | Abertura do contrato da Frente 3 — Contexto, Extração Estruturada e Memória Viva |
| Próximo passo foi alterado?                | sim — saiu de "PR closeout = encerramento formal" para "Frente 3 = próxima frente autorizada" |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. As PRs 26–31 executaram os 5 recortes canônicos da Frente 2. A PR 32 consolidou os critérios de fechamento em `schema/FRENTE2_CLOSEOUT_READINESS.md`. A PR 33 executou o acceptance smoke (15/15 cenários, `all_passed = true`).

Esta PR de closeout encerrou formalmente o contrato via `CONTRACT_CLOSEOUT_PROTOCOL.md`: bloco `--- ENCERRAMENTO DE CONTRATO ---` preenchido, critérios mapeados às provas, contrato arquivado em `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md`, índice e vivos atualizados, Frente 3 declarada como próxima.

## 2. Classificação da tarefa

**governança / closeout**

## 3. Última PR relevante

PR closeout — encerramento formal da Frente 2 (Speech Engine e Surface Única).

## 4. O que a PR anterior fechou

- PR 33 entregou o Cenário 15 integrado — prova final / acceptance smoke.
- PR 33 confirmou 15/15 cenários passando, `all_passed = true`.
- PR 33 satisfez formalmente o Gate 2 (A01).

## 5. O que a PR anterior NÃO fechou

- Encerramento formal do contrato (reservado para esta PR de closeout).

## 6. Diagnóstico confirmado (PR closeout)

- Estado herdado: "prova final executada — aguardando closeout formal" (PR 33).
- Contrato ativo: `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`.
- Todos os critérios de aceite satisfeitos (15/15 smoke cenários, all_passed=true).
- Nenhum item bloqueado (seção 4 do FRENTE2_CLOSEOUT_READINESS.md) foi aberto.
- Condições do CONTRACT_CLOSEOUT_PROTOCOL (seção 3) todas verdadeiras.

## 7. O que foi feito na PR closeout

- Preenchido bloco `--- ENCERRAMENTO DE CONTRATO ---` com todos os campos obrigatórios, mapeando cada critério de aceite ao smoke/prova que o satisfez.
- Criado `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md` (contrato + bloco de encerramento).
- Removido `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`.
- Atualizado `schema/contracts/_INDEX.md`: status da Frente 2 = arquivado; próximo contrato esperado = Frente 3.
- Atualizado `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`: contrato encerrado, estado = encerrado, próximo passo = Frente 3.
- Atualizado `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` (este arquivo).
- Atualizado `schema/FRENTE2_CLOSEOUT_READINESS.md`: encerramento concluído declarado.
- Declarada a Frente 3 — Contexto, Extração Estruturada e Memória Viva — como próxima frente autorizada.

## 8. O que não foi feito na PR closeout

- Não foi criada nova feature de speech.
- Não foi criada nova feature cognitiva.
- Não foram alterados artefatos técnicos em `src/speech/`.
- Não foi aberto áudio real, STT real, TTS real.
- Não foi aberta multimodalidade plena.
- Não foi integrado provedor LLM real.
- Não foi criado prompt final de produção completo.
- Não houve mudança em Supabase, Meta/WhatsApp, Worker ou telemetria.
- Não houve mudança na arquitetura já consolidada.
- Não foi aberta a Frente 3 além da declaração formal de autorização.

## 9. O que a PR closeout fechou

- Encerramento formal da Frente 2 via `CONTRACT_CLOSEOUT_PROTOCOL.md`.
- Arquivamento do contrato ativo.
- Declaração explícita da Frente 3 como próxima frente autorizada.
- Atualização de todos os vivos: `_INDEX.md`, status, handoff, FRENTE2_CLOSEOUT_READINESS.md.

## 10. O que continua pendente após a PR closeout

- **Abertura do contrato da Frente 3** — Contexto, Extração Estruturada e Memória Viva.
- Integração futura com provedor LLM real e prompt final de produção, em PR/recorte próprio.
- Áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker e telemetria permanecem fora do escopo da Frente 2 e são responsabilidade de suas respectivas frentes.

## 11. Esta tarefa foi fora de contrato?

**não**

É a PR de closeout formal autorizada pelo `CONTRACT_CLOSEOUT_PROTOCOL.md` e pelo `FRENTE2_CLOSEOUT_READINESS.md` (§6).

## 11a. Contrato ativo

Nenhum — contrato encerrado e arquivado em 2026-04-21.

## 11b. Recorte executado do contrato

Encerramento formal via `CONTRACT_CLOSEOUT_PROTOCOL.md`.

## 11c. Pendência contratual remanescente

Nenhuma.

## 11d. Houve desvio de contrato?

**não**

## 11e. Contrato encerrado nesta PR?

**sim — 2026-04-21T17:24:15Z**

## 12. Arquivos relevantes

- `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md` ← contrato arquivado nesta PR
- `schema/contracts/_INDEX.md` ← atualizado nesta PR
- `schema/FRENTE2_CLOSEOUT_READINESS.md` ← atualizado nesta PR
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md` ← atualizado nesta PR
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` ← este arquivo, atualizado nesta PR

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

**Encerrado formalmente.** Gate 2 (A01) satisfeito (15/15 cenários — PR 33). Closeout formal executado nesta PR.

## 14. Estado atual da frente

**encerrado — Frente 2 concluída formalmente em 2026-04-21**

## 15. Próximo passo autorizado

**Abertura do contrato da Frente 3 — Contexto, Extração Estruturada e Memória Viva.**

A Frente 3 é a próxima frente autorizada conforme A01 (Fase 3 — Prioridade 3). Nenhuma PR de implementação da Frente 3 pode começar sem o contrato aprovado (Gate 1 do A01).

## 16. Riscos

- Nenhum risco técnico: a PR de closeout é estritamente protocolar/documental.
- A Frente 3 deve iniciar com contrato aprovado — Gate 1 do A01 se aplica.

## 17. Provas

- `npm run smoke:all` executado na PR 33 — 20/20 Core + 5/5 Worker + 15/15 Speech — regressão zero (2026-04-21T17:01:27Z).
- Bloco `--- ENCERRAMENTO DE CONTRATO ---` preenchido em `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md`.
- Nenhum artefato técnico em `src/speech/` foi alterado nesta PR.
- Nenhum item bloqueado (seção 4 do FRENTE2_CLOSEOUT_READINESS.md) foi aberto.

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` (antes do arquivamento)
  Status da frente lido:       `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` (este arquivo)
  Closeout readiness lido:     `schema/FRENTE2_CLOSEOUT_READINESS.md`
  Protocol lido:               `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
  Contrato arquivado em:       `schema/contracts/archive/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL_2026-04-21.md`
