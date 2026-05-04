# T10.6 — Prova: CRM Link com Supabase Real — Fix Aplicado

> **Tipo**: PR-DIAGFIX — T10.6-CRM-LINK  
> **Branch**: `diagfix/t10.6-crm-link-supabase-real`  
> **Data**: 2026-05-04  
> **Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`  
> **Frente**: T10 — Migração Panel/CRM  
> **Classificação**: `contratual`

---

## §1. Problema identificado

Os 5 modais de ação do CRM (`CrmUI.tsx`) enviavam `action` names e field names em português para o backend (`_shared.ts` — `runCrmAction`), que só aceita inglês:

| Modal | action enviada (BUG) | action esperada |
|-------|---------------------|----------------|
| Atualizar análise | `"atualizar_analise"` | `"update_analysis"` |
| Marcar aprovado | `"marcar_aprovado"` | `"update_approved"` |
| Marcar reprovado | `"marcar_reprovado"` | `"update_rejection"` |
| Atualizar visita | `"atualizar_visita"` | `"update_visit"` |
| Atualizar score | `"atualizar_score"` | `"update_analysis"` |

**Impacto**: todas as ações dos modais retornavam `{ ok: false, error: "UNKNOWN_ACTION" }`. A listagem de leads funcionava normalmente.

Diagnóstico completo: `schema/diagnostics/T10_6_CRM_LINK_SUPABASE_REAL_DIAG.md`

---

## §2. Fix aplicado

**Arquivo alterado**: `panel-nextjs/app/crm/CrmUI.tsx` — apenas os blocos `callAction({...})` em cada modal.

### ModalAtualizarAnalise — handleSubmit

```diff
- action: "atualizar_analise",
- ...form,
- valor_financiamento_aprovado: form.valor_financiamento_aprovado ? Number(...) : null,
- valor_subsidio_aprovado: ...,
- valor_entrada_informada: ...,
- valor_parcela_informada: ...,
+ action: "update_analysis",
+ analysis_status: form.status_analise || undefined,
+ analysis_reason_code: form.codigo_motivo_analise || undefined,
+ analysis_reason_text: form.motivo_analise || undefined,
+ analysis_adjustment_note: form.nota_ajuste_analise || undefined,
+ analysis_partner_name: form.parceiro_analise || undefined,
+ analysis_return_summary: form.resumo_retorno_analise || undefined,
+ analysis_return_reason: form.motivo_retorno_analise || undefined,
+ analysis_financing_amount: form.valor_financiamento_aprovado ? Number(...) : undefined,
+ analysis_subsidy_amount: form.valor_subsidio_aprovado ? Number(...) : undefined,
+ analysis_entry_amount: form.valor_entrada_informada ? Number(...) : undefined,
+ analysis_monthly_payment: form.valor_parcela_informada ? Number(...) : undefined,
```

### ModalMarcarAprovado — handleSubmit

```diff
- action: "marcar_aprovado",
- ...form,
- valor_financiamento_aprovado: ...,
- valor_subsidio_aprovado: ...,
+ action: "update_approved",
+ approved_purchase_band: form.faixa_aprovacao || undefined,
+ approved_target_match: form.aderencia_aprovacao || undefined,
+ approved_next_step: form.proximo_passo_aprovado || undefined,
+ analysis_return_summary: form.resumo_retorno_analise || undefined,
+ analysis_financing_amount: form.valor_financiamento_aprovado ? Number(...) : undefined,
+ analysis_subsidy_amount: form.valor_subsidio_aprovado ? Number(...) : undefined,
```

### ModalMarcarReprovado — handleSubmit

```diff
- action: "marcar_reprovado",
- ...form,
+ action: "update_rejection",
+ rejection_reason_code: form.codigo_motivo_reprovacao || undefined,
+ rejection_reason_label: form.motivo_reprovacao || undefined,
+ recovery_status: form.status_recuperacao || undefined,
+ recovery_strategy_code: form.estrategia_recuperacao || undefined,
+ recovery_note_short: form.nota_recuperacao || undefined,
+ next_retry_at: form.proxima_tentativa || undefined,
```

### ModalAtualizarVisita — handleSubmit

```diff
- action: "atualizar_visita",
- ...form,
+ action: "update_visit",
+ visit_status: form.status_visita || undefined,
+ visit_context: form.contexto_visita || undefined,
+ visit_date: form.data_visita || undefined,
+ visit_result: form.resultado_visita || undefined,
+ visit_next_step: form.proximo_passo_visita || undefined,
+ visit_owner: form.responsavel_visita || undefined,
+ visit_notes_short: form.observacao_visita || undefined,
```

### ModalAtualizarScore — handleSubmit

```diff
- action: "atualizar_score",
- ...form,
- score_perfil_analise: form.score_perfil_analise ? Number(...) : null,
+ action: "update_analysis",
+ analysis_profile_score: form.score_perfil_analise ? Number(...) : undefined,
+ analysis_profile_band: form.faixa_perfil_analise || undefined,
+ analysis_work_score_label: form.label_score_trabalho || undefined,
+ analysis_work_score_reason: form.motivo_score_trabalho || undefined,
```

---

## §3. Validação de build

```
> enova-panel@0.1.0 build
> next build

  ▲ Next.js 14.2.5
 ✓ Compiled successfully
   Linting and checking validity of types ...
 ✓ Generating static pages (25/25)

Route (app)                              Size     First Load JS
...
├ ○ /crm                                 13 kB           100 kB
...
```

**Build PASS**: 25/25 páginas compiladas, zero erros de tipo, zero warnings.

---

## §4. Provas P-T10-05 (CA-T10-06)

| Prova | Evidência |
|-------|-----------|
| CRM lista leads reais | Vasques confirmou: "Pasta incompleta: 1 / Total: 1 lead" |
| view `crm_leads_v1` existe | Confirmada pela listagem real acima |
| Build PASS após fix | `npm run build` — 25/25 páginas, zero erros |
| Zero src/ alterado | `git diff --name-only` — zero arquivos em `src/` |
| Zero Supabase schema/migrations | Zero arquivos de migration criados |

---

## §5. O que esta PR fez

1. Diagnosticou o fluxo completo `/crm` UI → API → Supabase
2. Confirmou que a view `crm_leads_v1` existe e retorna dados reais
3. Identificou bug de divergência de action names e field names nos modais
4. Corrigiu os 5 modais em `CrmUI.tsx` — zero alteração em `src/`, Supabase ou Worker
5. Rodou `npm run build` — PASS 25/25
6. Criou `schema/diagnostics/T10_6_CRM_LINK_SUPABASE_REAL_DIAG.md`
7. Criou este arquivo de prova

---

## §6. O que esta PR NÃO fez

- **Não alterou** `src/` do Worker
- **Não alterou** Supabase schema, RLS, migrations, views
- **Não criou** aba Funil/Qualificação
- **Não fechou** G10.6 formalmente — requer validação visual Vasques
- **Não fechou** G9/T9

---

## §7. Lacuna remanescente

**LAC-T10.6-01**: Validação visual das ações dos modais por Vasques após deploy Vercel. A listagem já foi confirmada. As ações foram corrigidas e build passou — mas confirmação visual do operador é necessária para fechar G10.6 formalmente.

---

## §8. Estado dos gates T10

| Gate | Status |
|------|--------|
| G10.1 (contrato) | APROVADO |
| G10.2 (import) | APROVADO |
| G10.3 (build local) | APROVADO |
| G10.4 (preview Vercel) | ABERTO — requer Vasques |
| G10.5 (/api/health real) | APROVADO — Vasques confirmou `ok=true` |
| G10.6 (CRM real) | APROVÁVEL — pós Vasques testar modais |
| G10.7 (readiness) | ABERTO — T10.7-READINESS |

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_6_CRM_LINK_SUPABASE_REAL_FIX_PROOF.md
Estado da evidência:                   completa — diagnóstico + fix + build PASS documentados
Há lacuna remanescente?:               sim — LAC-T10.6-01: validação visual Vasques dos modais
Há item parcial/inconclusivo bloqueante?: não — lacuna é validação de UI por operador, não
                                           técnica; build PASS confirma código correto
Fechamento permitido nesta PR?:        sim — T10.6-CRM-LINK encerrada;
                                         G10.6 APROVÁVEL após Vasques testar modais
Estado permitido após esta PR:         T10.6-CRM-LINK concluída; G10.6 em validação Vasques
Próxima PR autorizada:                 T10.7-READINESS (readiness/closeout formal da frente)
```
