# HANDOFF — Speech Engine e Surface Única — ENOVA 2

| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Speech Engine e Surface Única |
| Data                                       | 2026-04-21T17:01:27.000Z |
| Estado da frente                           | prova final executada — aguardando closeout formal |
| Classificação da tarefa                    | acceptance smoke |
| Última PR relevante                        | PR 33 — prova final / acceptance smoke da Frente 2 |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` |
| Recorte executado do contrato              | PR 33 — Cenário 15 integrado: prova da cadeia completa policy → cognitive → free-response → composite-turn → surface → multimodal-readiness |
| Pendência contratual remanescente          | encerramento formal do contrato (PR closeout) |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | não |
| Item do A01 atendido                       | Fase 2 — Prioridade 2: Speech Engine e Surface Única — Gate 2 satisfeito |
| Próximo passo autorizado                   | PR closeout formal — encerrar contrato via `CONTRACT_CLOSEOUT_PROTOCOL.md`, arquivar contrato, declarar Frente 3 |
| Próximo passo foi alterado?                | sim — saiu de "PR 33 = prova final" para "PR closeout = encerramento formal" |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | ver seção 20 |

---

## 1. Contexto curto

O Core Mecânico 2 foi encerrado formalmente e a PR 25 abriu o contrato sucessor. As PRs 26–31 executaram os 5 recortes canônicos da Frente 2. A PR 32 consolidou os critérios de fechamento em `schema/FRENTE2_CLOSEOUT_READINESS.md`.

A PR 33 é a prova final / acceptance smoke: adicionou o Cenário 15 integrado ao `src/speech/smoke.ts`, cobrindo o fluxo completo policy → cognitive → free-response → composite-turn → surface → multimodal-readiness com 29 assertions explicitamente mapeadas aos 7 critérios de aceite da seção 2 do `FRENTE2_CLOSEOUT_READINESS.md`. Resultado: 15/15 cenários passando, `all_passed = true`. Gate 2 (A01) formalmente satisfeito.

## 2. Classificação da tarefa

**acceptance smoke**

## 3. Última PR relevante

PR 33 — prova final / acceptance smoke da Frente 2.

## 4. O que a PR anterior fechou

- PR 32 criou `schema/FRENTE2_CLOSEOUT_READINESS.md` com checklist canônico de 7 critérios finais de aceite.
- PR 32 mapeou cada critério ao artefato entregue nas PRs 25–31.
- PR 32 preparou formalmente a PR 33 como "prova final / acceptance smoke".
- Smoke 14/14 passando (validado em 2026-04-21T16:16:35Z).

## 5. O que a PR anterior NÃO fechou

- Execução da prova integrada final (Cenário 15).
- Confirmação objetiva de `all_passed = true` com 15/15 cenários.
- Encerramento formal do contrato.

## 6. Diagnóstico confirmado (PR 33)

- Baseline herdado da PR 32: 14/14 cenários passando.
- Cenário 15 integrado adicionado e aprovado: 15/15 passando, `all_passed = true`.
- Todos os 7 critérios da seção 2 do `FRENTE2_CLOSEOUT_READINESS.md` provados com assertions explícitas [2.1]–[2.7] + [FINAL].
- Nenhum item bloqueado (seção 4 do FRENTE2_CLOSEOUT_READINESS.md) foi aberto.
- Smoke:all completo: 20/20 Core + 5/5 Worker + 15/15 Speech — regressão zero.

## 7. O que foi feito na PR 33

- Adicionado `smokeScenario15_ProvaFinalIntegrada()` ao `src/speech/smoke.ts`:
  - Cobre o fluxo completo: policy → cognitive → free-response (via composite-turn) → surface → multimodal-readiness.
  - 29 assertions explicitamente mapeadas aos critérios [2.1] a [2.7] + [FINAL].
  - Resultado: passed = true, all_passed = true (15/15).
- Atualizado `schema/FRENTE2_CLOSEOUT_READINESS.md`:
  - Status: "prova final executada — aguardando closeout formal".
  - Cada critério marcado como "✅ Prova integrada executada na PR 33".
  - Gate 2 marcado como satisfeito.
- Atualizado `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md`.
- Atualizado `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` (este arquivo).

## 8. O que não foi feito na PR 33

- Não foi criada nova feature de speech.
- Não foi criada nova feature cognitiva.
- Não foram alterados artefatos técnicos existentes em `src/speech/` (somente adicionado o Cenário 15 ao smoke).
- Não foi criado gerador mecânico de resposta.
- Não foi criado template rígido por stage.
- Não foi criado parser mecânico dominante.
- Não foi criado fallback dominante.
- Não foi criado pipeline multimodal real.
- Não foi criado áudio real, STT real, TTS real, mídia real ou canal real.
- Não foi criado prompt final de produção completo.
- Não foi integrado provedor LLM real.
- Não foi aberta multimodalidade plena, Supabase, Meta/WhatsApp, Worker ou telemetria.
- Não houve mudança no Core, Worker ou na arquitetura consolidada.
- O contrato não foi encerrado.

## 9. O que a PR 33 fechou

- Cenário 15 — prova final integrada cobrindo todos os critérios da Frente 2 em cadeia.
- Gate 2 (A01): "sem smoke da frente, não promove para frente seguinte" — **satisfeito**.
- `schema/FRENTE2_CLOSEOUT_READINESS.md` atualizado para refletir prova executada.
- Vivos da frente (status + handoff) atualizados para refletir estado "prova final executada — aguardando closeout formal".

## 10. O que continua pendente após a PR 33

- **PR closeout** — encerramento formal do contrato via `CONTRACT_CLOSEOUT_PROTOCOL.md`:
  - Preencher bloco `--- ENCERRAMENTO DE CONTRATO ---` com todos os campos obrigatórios.
  - Mapear cada critério de aceite do contrato ao smoke ou prova que o satisfez.
  - Declarar pendências remanescentes (itens bloqueados da seção 4 do FRENTE2_CLOSEOUT_READINESS.md).
  - Mover contrato ativo para `schema/contracts/archive/`.
  - Atualizar `schema/contracts/_INDEX.md`, status e handoff para encerramento.
  - Declarar Frente 3 (Contexto, Extração e Memória Viva) como próxima.
- Integração futura com provedor LLM real e prompt final de produção, em PR/recorte próprio pós-closeout.
- Áudio real, STT/TTS real, multimodalidade plena, Supabase, Meta/WhatsApp, Worker e telemetria permanecem fora do escopo desta frente.

## 11. Esta tarefa foi fora de contrato?

**não**

É a PR de acceptance smoke autorizada pelo contrato (§9) e pelo `FRENTE2_CLOSEOUT_READINESS.md` (§5).

## 11a. Contrato ativo

`schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`

## 11b. Recorte executado do contrato

Cenário 15 integrado: prova da cadeia completa policy → cognitive → free-response → composite-turn → surface → multimodal-readiness.

## 11c. Pendência contratual remanescente

PR closeout formal — encerramento via `CONTRACT_CLOSEOUT_PROTOCOL.md`.

## 11d. Houve desvio de contrato?

**não**

## 11e. Contrato encerrado nesta PR?

**não**

## 12. Arquivos relevantes

- `src/speech/smoke.ts` ← Cenário 15 adicionado nesta PR
- `schema/FRENTE2_CLOSEOUT_READINESS.md` ← atualizado nesta PR
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md` ← atualizado nesta PR
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` ← este arquivo, atualizado nesta PR
- `src/speech/policy.ts`
- `src/speech/surface.ts`
- `src/speech/cognitive.ts`
- `src/speech/free-response.ts`
- `src/speech/composite-turn.ts`
- `src/speech/multimodal-readiness.ts`

## 13. Item do A01 atendido

Fase 2 — Prioridade 2: modelar o Speech Engine com surface única, política explícita para transições e proibição de camadas concorrentes.

Gate 2 (A01): "sem smoke da frente, não promove para frente seguinte" — **satisfeito** (15/15 cenários).

## 14. Estado atual da frente

**prova final executada — aguardando closeout formal**

## 15. Próximo passo autorizado

**PR closeout formal — encerramento da Frente 2.**

A PR de closeout deve cumprir o `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`, mapear cada critério ao smoke que o satisfez (Cenários 1–15), arquivar o contrato ativo e declarar a Frente 3 (Contexto, Extração e Memória Viva) como próxima.

## 16. Riscos

- Nenhum risco técnico: a prova integrada não abriu nova feature e regressão zero foi confirmada.
- Risco remanescente: a PR de closeout deve ser estritamente protocolar — sem abrir nova capacidade funcional.

## 17. Provas

- `npm run smoke:all` — 20/20 Core + 5/5 Worker + 15/15 Speech — regressão zero (2026-04-21T17:01:27Z).
- `src/speech/smoke.ts` — Cenário 15 adicionado, `all_passed = true`.
- Nenhum artefato técnico existente (`policy.ts`, `surface.ts`, `cognitive.ts`, `free-response.ts`, `composite-turn.ts`, `multimodal-readiness.ts`) foi alterado.
- `mechanical_text_generated=false` permanece preservado na surface.
- Nenhum item bloqueado (seção 4 do FRENTE2_CLOSEOUT_READINESS.md) foi aberto.

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
  Closeout readiness lido:     `schema/FRENTE2_CLOSEOUT_READINESS.md`
  Artefatos técnicos lidos:    `src/speech/policy.ts`, `surface.ts`, `cognitive.ts`, `free-response.ts`, `composite-turn.ts`, `multimodal-readiness.ts`, `smoke.ts`
