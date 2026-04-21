# FRENTE 2 — CLOSEOUT READINESS — Speech Engine e Surface Única — ENOVA 2

> **Status:** em consolidação para closeout — PR 32 (critérios consolidados, prova final pendente)
> **Contrato ativo:** `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md`
> **Última atualização:** PR 32 — consolidação de critérios de fechamento e preparação de acceptance smoke

---

## Finalidade deste documento

Este documento existe para tornar impossível qualquer dúvida sobre o que falta para encerrar formalmente a Frente 2.

Ele não encerra o contrato. Ele não abre nova feature. Ele consolida os critérios finais de aceite da frente, mapeia cada critério ao que já foi entregue nas PRs anteriores, e declara explicitamente o que será provado na PR 33 (acceptance smoke) e encerrado formalmente na PR de closeout.

**Este documento é vivo.** Deve ser atualizado em cada PR de consolidação/prova/closeout.

---

## 1. Estado herdado — o que as PRs 25–31 entregaram

| PR | Título / Recorte | Artefato entregue | Estado |
|----|------------------|-------------------|--------|
| PR 25 | Abertura do contrato da Frente 2 | `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` | ✅ entregue |
| PR 26 | PR1 canônica — política textual mínima | `src/speech/policy.ts` | ✅ entregue |
| PR 27 | PR2 canônica — surface final mínima | `src/speech/surface.ts` | ✅ entregue |
| PR 28 | PR3 canônica — contrato cognitivo mínimo | `src/speech/cognitive.ts` | ✅ entregue |
| PR 29 | PR4 canônica — resposta livre governada | `src/speech/free-response.ts` | ✅ entregue |
| PR 30 | Turno composto governado | `src/speech/composite-turn.ts` | ✅ entregue |
| PR 31 | PR5 canônica — preparação multimodal mínima | `src/speech/multimodal-readiness.ts` | ✅ entregue |
| PR 32 | Consolidação de critérios de fechamento | `schema/FRENTE2_CLOSEOUT_READINESS.md` + vivos | ✅ esta PR |

Smoke textual mínimo: **14/14 cenários passando** (validado na PR 32, executado em 2026-04-21T16:16:35Z).

---

## 2. Checklist de critérios finais de aceite da Frente 2

Cada critério abaixo é explícito, verificável e rastreável a um artefato entregue.

### 2.1 Uma única surface final por turno

> **Critério (A00 §14.1 + Contrato §8):** Nenhuma outra camada pode competir pela fala final depois que a resposta for montada.

| Item | Artefato | Status |
|------|----------|--------|
| `surface_owner = 'llm'` fixado em `SpeechPolicyEnvelope` | `src/speech/policy.ts` | ✅ coberto |
| `buildAiFinalSurface` aceita apenas `author='llm'` | `src/speech/surface.ts` | ✅ coberto |
| `mechanical_text_generated = false` imutável na surface | `src/speech/surface.ts` | ✅ coberto |
| Autoria mecânica gera `final_surface_author_must_be_llm` e rejeita publicação | `src/speech/surface.ts` + smoke cenário 4 | ✅ coberto |
| Prova em smoke | Cenários 3, 4 | ✅ coberto |

**O que falta:** prova final integrada (PR 33).

---

### 2.2 Mecânico sem prioridade de fala

> **Critério (A00-ADENDO-01 P1 + Contrato §8 + ADENDO §3.4):** O mecânico JAMAIS tem qualquer prioridade de fala. Ele informa e restringe, mas não redige resposta ao cliente.

| Item | Artefato | Status |
|------|----------|--------|
| `mechanical_speech_priority = 'forbidden'` | `src/speech/policy.ts` | ✅ coberto |
| `mechanical_may_write_customer_text = false` | `src/speech/policy.ts`, `src/speech/surface.ts`, `src/speech/free-response.ts` | ✅ coberto |
| `mechanical_role = 'structural_governance_only'` | `src/speech/cognitive.ts` | ✅ coberto |
| `governance_role = 'restricts_validates_informs_only'` | `src/speech/free-response.ts` | ✅ coberto |
| `mechanical_parser_priority = 'forbidden'` | `src/speech/composite-turn.ts` | ✅ coberto |
| `governance_wrote_text = false` imutável em resposta e turno composto | `src/speech/free-response.ts`, `src/speech/composite-turn.ts` | ✅ coberto |
| Prova em smoke | Cenários 1, 2, 4, 6, 10, 11, 12 | ✅ coberto |

**O que falta:** prova final integrada (PR 33).

---

### 2.3 Resposta livre sob governança estrutural

> **Critério (Contrato §8 + A00-ADENDO-01 §3.3):** A IA é soberana em raciocínio, condução conversacional e fala. A governança restringe, valida, informa — nunca redige resposta final.

| Item | Artefato | Status |
|------|----------|--------|
| `response_owner = 'llm'` e `response_mode = 'free_under_structural_governance'` | `src/speech/free-response.ts` | ✅ coberto |
| `governance_role = 'restricts_validates_informs_only'` | `src/speech/free-response.ts` | ✅ coberto |
| Liberdades: adaptar tom, profundidade, naturalidade | `src/speech/free-response.ts` (`FREEDOMS`) | ✅ coberto |
| Restrições estruturais: `next_objective`, bloqueios, `nao_contrariar_core` | `src/speech/free-response.ts` (`STRUCTURAL_CONSTRAINTS`) | ✅ coberto |
| Resposta livre aceita sob governança | Smoke cenário 7 | ✅ coberto |
| Resposta livre respeita bloqueio estrutural | Smoke cenário 8 | ✅ coberto |

**O que falta:** prova final integrada (PR 33).

---

### 2.4 Múltiplas informações no mesmo turno sem perder trilho

> **Critério (A00 §14.3 + Contrato §8):** O sistema deve ser capaz de captar múltiplas informações no mesmo turno e preservar `next_objective`, bloqueios e limites MCMV/CEF.

| Item | Artefato | Status |
|------|----------|--------|
| `multiple_information_supported = true` | `src/speech/composite-turn.ts` | ✅ coberto |
| `interpretation_owner = 'llm'` | `src/speech/composite-turn.ts` | ✅ coberto |
| `mechanical_parser_priority = 'forbidden'` | `src/speech/composite-turn.ts` | ✅ coberto |
| Sinal que tenta sobrescrever `next_objective` é rejeitado | `src/speech/composite-turn.ts` (`assertCompositeTurnConformance`) | ✅ coberto |
| Sinal que tenta desbloquear estruturalmente é rejeitado | `src/speech/composite-turn.ts` | ✅ coberto |
| Turno composto com múltiplos sinais mantém IA livre | Smoke cenário 10 | ✅ coberto |
| Turno composto respeita bloqueio estrutural | Smoke cenário 11 | ✅ coberto |
| Turno composto não sobrescreve Core | Smoke cenário 12 | ✅ coberto |

**O que falta:** prova final integrada (PR 33).

---

### 2.5 Promessa de aprovação proibida

> **Critério (Contrato §8 + ADENDO §3.3 + cognitive `knowledge_boundaries`):** A IA nunca pode prometer aprovação, valor de entrada, parcela ou imóvel.

| Item | Artefato | Status |
|------|----------|--------|
| `nao_prometer_aprovacao` em `knowledge_boundaries` | `src/speech/cognitive.ts` | ✅ coberto |
| `nao_prometer_aprovacao` em `structural_constraints` | `src/speech/free-response.ts` | ✅ coberto |
| Detecção de padrões de promessa de aprovação em texto | `src/speech/free-response.ts` (`APPROVAL_PROMISE_PATTERNS`) | ✅ coberto |
| `approval_promise_not_allowed` em violações quando detectado | `src/speech/free-response.ts` | ✅ coberto |
| `promessa_de_aprovacao_permanece_proibida` em preparação multimodal | `src/speech/multimodal-readiness.ts` | ✅ coberto |
| Resposta com promessa rejeitada na resposta livre | Smoke cenário 9 | ✅ coberto |
| Turno composto com promessa rejeitado | Smoke cenário 13 | ✅ coberto |

**O que falta:** prova final integrada (PR 33).

---

### 2.6 Preparação multimodal mínima sem áudio real

> **Critério (A00 §14.5 preparatório + Contrato §4 fora de escopo):** Áudio e texto convergem para o mesmo modelo — mas áudio real, STT/TTS real, canal real e mídia real permanecem desligados nesta frente.

| Item | Artefato | Status |
|------|----------|--------|
| `readiness_status = 'preparatory_contract_only'` | `src/speech/multimodal-readiness.ts` | ✅ coberto |
| `pipeline_role = 'input_output_adapter_only'` — modalidade não vira novo cérebro | `src/speech/multimodal-readiness.ts` | ✅ coberto |
| `modality_changes_decision_authority = false` | `src/speech/multimodal-readiness.ts` | ✅ coberto |
| `modality_changes_speech_authority = false` | `src/speech/multimodal-readiness.ts` | ✅ coberto |
| Runtime locks: `real_audio_enabled`, `stt_provider_enabled`, `tts_provider_enabled`, `external_channel_enabled`, `media_processing_enabled` — todos `false` | `src/speech/multimodal-readiness.ts` | ✅ coberto |
| Preparação multimodal permanece contratual e não abre áudio real | Smoke cenário 14 | ✅ coberto |

**O que falta:** prova final integrada (PR 33). Áudio real, STT/TTS real e multimodalidade plena permanecem bloqueados e são escopo da Frente 5.

---

### 2.7 Postura consultiva MCMV — não vira script rígido

> **Critério (Contrato §8 + A00-ADENDO-01 §3.2):** A atendente especialista MCMV conduz com naturalidade e inteligência contextual — sem script textual duro dominante.

| Item | Artefato | Status |
|------|----------|--------|
| `mode = 'mcmv_specialist_consultative'` | `src/speech/cognitive.ts` | ✅ coberto |
| `postura_consultiva_humana` em `specialist_principles` | `src/speech/cognitive.ts` | ✅ coberto |
| `conduzir_com_naturalidade_sem_trilho_duro` em `required_behaviors` | `src/speech/cognitive.ts` | ✅ coberto |
| `script_rigido_dominante` em `forbidden_behaviors` | `src/speech/cognitive.ts` | ✅ coberto |
| `resposta_engessada_por_stage` em `forbidden_behaviors` | `src/speech/cognitive.ts` | ✅ coberto |
| `fallback_dominante` em `forbidden_behaviors` (policy + cognitive + free-response) | `src/speech/policy.ts`, `src/speech/cognitive.ts`, `src/speech/free-response.ts` | ✅ coberto |
| Contrato cognitivo proíbe script rígido e fallback dominante | Smoke cenário 5, 6 | ✅ coberto |

**O que falta:** prova final integrada (PR 33).

---

## 3. Critérios do A01 aplicáveis à Frente 2 e seu estado

| Critério A01 | Relevante para Frente 2? | Status |
|--------------|--------------------------|--------|
| Fase 2 — Prioridade 2: Speech Engine com surface única, política explícita e proibição de camadas concorrentes | ✅ sim | ✅ entregue (PRs 25–32) |
| Gate 1: sem contrato da frente, não começa implementação | ✅ sim | ✅ satisfeito (PR 25) |
| Gate 2: sem smoke da frente, não promove para frente seguinte | ✅ sim | 🟡 smoke 14/14 passando — prova final pendente (PR 33) |
| Gate 3: previsibilidade operacional em texto puro antes de áudio | ✅ sim | ✅ satisfeito (texto puro entregue) |
| Gate 6: coerência entre A00, A01 e A02 | ✅ sim | ✅ satisfeito (todos os artefatos coerentes) |
| Entregável mínimo: surface única + política de transição + fallback controlado | ✅ sim | ✅ entregue |
| Prova mínima: turnos sem duplicação, sem silêncio e sem disputa de camadas | ✅ sim | ✅ provado em smoke (14 cenários) |

---

## 4. O que está fora do escopo desta frente (bloqueado formalmente)

Os seguintes itens foram declarados **fora de escopo** no contrato ativo e devem ser abertos apenas em seus próprios contratos de frente, conforme A01:

| Item bloqueado | Frente responsável |
|---------------|--------------------|
| Persistência explicável no Supabase | Frente 4 |
| Provedor LLM real e prompt final de produção | Recorte próprio (pós-closeout Frente 2) |
| Áudio real, STT real, TTS real | Frente 5 |
| Multimodalidade plena | Frente 5 |
| Canal Meta/WhatsApp | Frente 6 |
| Telemetria e observabilidade | Frente 7 |
| Shadow mode, canary, rollout | Frente 8 |
| Worker | Frente específica |

Qualquer PR que tente abrir estes itens dentro da Frente 2 é **não conforme** e deve ser parada.

---

## 5. O que a PR 33 deve provar (acceptance smoke)

A PR 33 é a **prova final / acceptance smoke** da Frente 2. Ela não abre nova feature. Ela prova que os critérios acima são satisfeitos em conjunto, de forma integrada e verificável.

**O que a PR 33 deve demonstrar:**

1. Todos os 14 cenários de smoke existentes passando (regressão zero).
2. Cenário integrado cobrindo o fluxo completo: policy → cognitive → free-response → composite-turn → surface, com todas as camadas em sequência.
3. Conformidade verificável de cada critério da seção 2 deste documento, em forma de smoke ou prova equivalente.
4. Confirmação explícita de que nenhum dos itens da seção 4 (bloqueados) foi aberto.
5. Resultado: `all_passed = true` sem exceção.

**O que a PR 33 NÃO faz:**
- Não encerra o contrato formalmente.
- Não cria nova feature.
- Não abre Supabase, Meta/WhatsApp, Worker, telemetria, áudio real ou multimodalidade plena.

---

## 6. O que a PR de closeout formal deve fazer

A PR de closeout (posterior à PR 33) deve:

1. Cumprir integralmente o `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`.
2. Preencher o bloco `--- ENCERRAMENTO DE CONTRATO ---` com todos os campos obrigatórios.
3. Mapear cada critério de aceite do contrato ao smoke ou prova que o satisfez.
4. Declarar explicitamente as pendências remanescentes (itens bloqueados da seção 4).
5. Mover `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` para `schema/contracts/archive/`.
6. Atualizar `schema/contracts/_INDEX.md`, status e handoff para refletir encerramento.
7. Declarar o próximo contrato autorizado (Frente 3 — Contexto, Extração e Memória Viva).

---

## 7. Declaração de conformidade negativa — o que não foi feito

Esta PR 32 confirma que **nenhuma** das seguintes ações foi executada:

- ✅ Não foi criada nova feature de speech.
- ✅ Não foi criada nova feature cognitiva.
- ✅ Não foi aberto áudio real.
- ✅ Não foi aberto STT/TTS real.
- ✅ Não foi aberta multimodalidade plena.
- ✅ Não foi integrado provedor LLM real.
- ✅ Não foi criado prompt final de produção completo.
- ✅ Não houve mudança em Supabase.
- ✅ Não houve mudança em Meta/WhatsApp.
- ✅ Não houve mudança em telemetria.
- ✅ Não houve mudança em Worker.
- ✅ Não houve mudança na arquitetura já consolidada.
- ✅ O contrato não foi encerrado nesta PR.
- ✅ Nenhuma nova frente foi aberta.

---

## 8. Referências

- `schema/A00_PLANO_CANONICO_MACRO.md` — §14 (critérios macro de pronto da ENOVA 2)
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md` — Fase 2, Prioridade 2; §6 (gates de bloqueio)
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` — regras P1–P9 de proibição formal
- `schema/contracts/active/CONTRATO_ATENDENTE_ESPECIALISTA_MCMV_GOVERNANCA_ESTRUTURAL.md` — §8 (critérios de aceite), §9 (provas obrigatórias)
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — protocolo formal de encerramento
- `schema/status/SPEECH_ENGINE_SURFACE_UNICA_STATUS.md` — status vivo da frente
- `schema/handoffs/SPEECH_ENGINE_SURFACE_UNICA_LATEST.md` — handoff vivo da frente
- `src/speech/policy.ts`, `surface.ts`, `cognitive.ts`, `free-response.ts`, `composite-turn.ts`, `multimodal-readiness.ts`, `smoke.ts`
