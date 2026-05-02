# Handoff — Próximo contrato T9: LLM ↔ Funil ↔ Persistência

**Tipo:** PR-DIAG / READ-ONLY (handoff)  
**Data:** 2026-05-01  
**Branch desta PR:** `diag/llm-funil-sistema-inteiro-readonly`  
**Documento principal:** `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md`

> Resumo limpo para abrir o contrato T9. Tudo aqui é entregável da PR-DIAG; nada implementado ainda.

---

## Estado real (depois da PR #176 — G8 frente WhatsApp APROVADO)

### Funcionando em PROD
- Webhook Meta + assinatura HMAC + parser + dedupe
- Pipeline canary completo: CRM upsert + memória + LLM + outbound
- Outbound real com `external_dispatch=true`
- LLM gpt-4o-mini respondendo
- 11 logs `meta.prod.*` em wrangler tail
- Flags + rollback + harness + health endpoints
- ROLLBACK_FLAG soberano

### Não funcionando ainda
- LLM cego ao funil (recebe só `text_body`, sem stage/facts/históriço)
- Core mecânico (`runCoreEngine`) **não é chamado pelo pipeline WhatsApp**
- Stage do lead nunca é persistido em runtime real
- Parsers L04–L17 nunca recebem texto do WhatsApp
- Supabase silenciosamente desligado em PROD (fallback in-memory)
- Memória/CRM/override perdem tudo no restart
- `wrangler.toml` zero bindings declarados
- Sem trace ponta-a-ponta correlacionando wa_id → outbound_id

---

## Tipo do próximo contrato

**T9 — Integração LLM ↔ Funil Mecânico ↔ Persistência Real**

Este contrato amplia, **não revoga**, o T8/G8 frente WhatsApp.

---

## Objetivo do T9

Conectar o LLM ao funil mecânico de forma que cada conversa real:
1. Identifique stage atual do lead (Core mecânico decide)
2. Extraia facts da fala via parsers L04–L17
3. Persista stage e facts em Supabase real
4. Forneça contexto estruturado ao LLM (stage, facts, históriço, regras)
5. Valide saída do LLM via guard mecânico
6. Garanta rastreabilidade ponta-a-ponta

---

## Cláusulas obrigatórias (invariantes do contrato T9)

1. **LLM nunca decide stage.** Mecânico decide.
2. **LLM nunca aprova financiamento.** Output guard valida.
3. **LLM nunca altera regra MCMV.** System prompt + guard.
4. **`ROLLBACK_FLAG=true` permanece soberano.** Bloqueia tudo em segundos.
5. **`CLIENT_REAL_ENABLED=true` continua exigido para outbound real.**
6. **Persistência Supabase real ativa ANTES de fechar G9.** Não pode haver stage efêmero.
7. **Output guard LLM ativo ANTES de fechar G9.**
8. **Toda PR-IMPL precisa de PR-DIAG anterior + PR-PROVA antes de fechar frente.**
9. **Smoke real ponta-a-ponta com Vasques antes de fechar G9.**
10. **Nenhuma PR pode fechar T8/G8 frente WhatsApp.** Continua APROVADO.

---

## Plano canônico de PRs T9 (resumo)

| Ordem | PR | Tipo | Frente |
|---|---|---|---|
| 1 | T9.0 — abrir contrato T9 | DOC | governança |
| 2 | T9.1 — declarar bindings em wrangler.toml | INFRA | runtime |
| 3 | T9.2 — Supabase fallback guard com telemetria explícita | IMPL | runtime |
| 4 | T9.3 — DIAG integração Core ↔ pipeline | DIAG | funil |
| 5 | T9.4 — IMPL chamada runCoreEngine no canary-pipeline | IMPL | funil |
| 6 | T9.5 — PROVA stage_current persiste entre turnos | PROVA | funil |
| 7 | T9.6 — IMPL parsers L04–L17 chamados com texto real | IMPL | funil |
| 8 | T9.7 — PROVA facts extraídos persistem | PROVA | funil |
| 9 | T9.8 — IMPL LLM recebe LlmContext estruturado | IMPL | LLM |
| 10 | T9.9 — IMPL output guard LLM | IMPL | LLM |
| 11 | T9.10 — PROVA conversa real 5+ turnos com Vasques | PROVA | LLM/funil |
| 12 | T9.11 — IMPL Supabase write real (CRM/memória) | IMPL | persistência |
| 13 | T9.12 — PROVA persistência sobrevive restart | PROVA | persistência |
| 14 | T9.13 — IMPL telemetria ponta-a-ponta (trace_id) | IMPL | observabilidade |
| 15 | T9.R — Closeout G9 frente Funil-LLM | CLOSEOUT | governança |

Detalhamento técnico em `schema/diagnostics/LLM_FUNIL_SISTEMA_INTEIRO_READONLY.md` §15.

---

## Gaps de severidade BLOQUEANTE (precisam vir antes ou junto de T9.4)

| ID | Descrição |
|---|---|
| BLK-01 | Pipeline WhatsApp não chama `runCoreEngine` |
| BLK-02 | `CrmLeadState.stage_current` nunca é escrito em runtime real |
| BLK-03 | Parsers L04–L17 nunca recebem texto WhatsApp real |
| BLK-04 | LLM recebe apenas texto cru sem contexto |
| BLK-05 | Persistência Supabase silenciosamente desligada em PROD |
| BLK-06 | `wrangler.toml` sem bindings declarados |

---

## Decisão pendente para Vasques

### A. Persistência Supabase real é pré-condição de T9?

- **Opção 1**: T9 inteira exige Supabase real ativo. Pipeline novo nunca corre em modo efêmero. Mais seguro, mais lento.
- **Opção 2**: T9 conecta LLM↔funil em modo in-memory primeiro, Supabase real vem em paralelo. Mais rápido para validar fluxo, mas stage continua efêmero até T9.11.

Recomendação técnica: **Opção 2** com canary controlado — pipeline novo só ativa para `OUTBOUND_CANARY_WA_ID`, todo o resto continua no fluxo atual. Vasques valida em conversa real antes de ampliar.

### B. Output guard LLM é hard-fail ou soft-fail?

- **Hard-fail**: se LLM falar "aprovado", outbound não envia, Vasques recebe alert.
- **Soft-fail**: outbound envia, mas evento `learning_candidate` cria draft de objeção.

Recomendação técnica: **hard-fail** para promessas de aprovação MCMV; soft-fail para mudança de assunto.

### C. Quanto contexto histórico passar ao LLM?

- Últimos 3 turnos? 5? 10?
- Resumo automático (LLM compacta)?
- Apenas facts extraídos pelo Core?

Recomendação técnica: **3 últimos turnos brutos + facts atuais + stage + next_objective** como ponto de partida. Ajustar com smoke.

---

## Arquivos novos esperados (T9 completa)

### Código
- `src/llm/output-guard.ts` (novo)
- `src/llm/context.ts` (novo — interface LlmContext)
- `src/meta/canary-pipeline.ts` (atualizado para chamar Core)
- `src/crm/service.ts` (atualizado para persistir stage)
- `src/supabase/crm-store.ts` (atualizado com writes reais)
- `wrangler.toml` (atualizado com vars declaradas)

### Smokes/provas
- `src/meta/funil-llm-smoke.ts` (novo)
- `src/meta/funil-llm-real-proof.ts` (novo)
- `src/llm/output-guard-smoke.ts` (novo)
- `src/supabase/write-real-proof.ts` (novo)

### Documentos
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T9.md`
- `schema/diagnostics/T9_*.md` (vários)
- `schema/proofs/T9_*.md` (vários)
- `schema/implementation/T9_*.md` (vários)

---

## Critério de aceite global (G9)

A frente Funil-LLM-Persistência só é encerrada quando:

1. PROD `nv-enova-2` chama `runCoreEngine` para cada inbound `message`.
2. `CrmLeadState.stage_current` é gravado em Supabase real após cada turno.
3. Conversa real avança de `discovery` → `qualification_civil` → `qualification_renda` em ≥3 turnos com Vasques.
4. Restart do Worker preserva stage e memória.
5. Output guard bloqueia tentativa de promessa de aprovação em smoke.
6. Trace ponta-a-ponta visível em `wrangler tail` com `correlation_id` único.
7. Smoke `prove:g9-readiness` 100% PASS.
8. Vasques confirma fluxo natural em ≥5 conversas reais.

---

## Pontos invariantes que **não podem ser tocados** em T9

- `ROLLBACK_FLAG=true` continua bloqueando tudo
- `CLIENT_REAL_ENABLED=true` continua exigido para outbound amplo
- Webhook Meta GET challenge + assinatura HMAC inalterados
- Outbound nunca envia sem `external_dispatch=true`
- Secrets nunca aparecem em log/error/response
- LLM permanece soberano da fala (mas com contexto)
- Mecânico permanece soberano da estrutura (e ativo no runtime)

---

## Próxima ação autorizada

**Abrir contrato T9** via PR-DOC declarando:
- objetivo
- cláusulas invioláveis
- plano de PRs (15 micro-PRs)
- critérios de aceite (G9)
- referências a esta DIAG e ao closeout T8

Após contrato aberto, sequência canônica: T9.1 → T9.2 → T9.3 → T9.4...

---

## Resumo em uma linha

**A Enova 2 responde WhatsApp, mas o LLM e o funil são dois sistemas paralelos que nunca conversam — T9 conecta eles + faz Supabase real funcionar de verdade.**
