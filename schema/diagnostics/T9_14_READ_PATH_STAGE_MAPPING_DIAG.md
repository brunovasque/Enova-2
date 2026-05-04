# T9.14 — Diagnóstico READ PATH: `fase_conversa` → `stage_current` (T9.14-DIAG)

**Tipo**: PR-DIAG / READINESS
**Branch**: `diag/t9.14-read-path-stage-mapping`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`
**Data**: 2026-05-04
**PR anterior**: T10.7-READINESS (PR #226) — frente T10 Panel/CRM ENCERRADA POR PROVA
**Bloqueio identificado nesta PR**: `BLK-T9.14-READ-PATH` (novo)
**Status do bloqueio anterior**: `BLK-T9.13-STATE-MAPPING` — RESOLVIDO parcialmente:
  write path implementado (T9.13M-FIX), mas read path jamais implementado.

---

## 1. Objetivo

Formalizar no repositório o diagnóstico crítico de read path identificado após fechamento da
frente T10 (2026-05-04, pós-T10.7-READINESS):

> O write path grava `fase_conversa` corretamente via mapper conservador.
> O read path nunca converte `fase_conversa` de volta para `stage_current`.
> Resultado: após qualquer restart do Worker, `stage_current` sempre retorna `'discovery'`.

Este documento prepara a próxima PR de implementação (T9.14-IMPL) com escopo
seguro e delimitado: **somente o reverse mapper / read path**.

---

## 2. Contexto herdado (pós-T10.7)

### 2.1 O que T10 provou

| Prova | Status |
|-------|--------|
| Painel Vercel publicado em `https://enova-2.vercel.app/` | ✅ CONFIRMADO |
| `/api/health` → `ok=true, db_ok=true, worker_ok=true` | ✅ CONFIRMADO (Vasques) |
| `/bases` e `/crm` carregando dados reais Supabase | ✅ CONFIRMADO (Vasques) |
| Pipeline canary end-to-end: WhatsApp → Worker → LLM → enova_log → Painel | ✅ CONFIRMADO (Vasques) |
| Thread real em `/conversations` | ✅ CONFIRMADO (Vasques) |
| `enova_log`: tags `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK` escritos real | ✅ CONFIRMADO (Vasques) |
| smoke 41/41 PASS (`npm run smoke:meta:canary`) | ✅ CONFIRMADO |
| `wrangler deploy --dry-run` PASS | ✅ CONFIRMADO |

### 2.2 O que T10 NÃO provou (e por que não é dever de T10)

T10 foi uma frente Panel/CRM. Seu escopo declarado era **zero interferência com T9/G9**.
Os itens abaixo não são lacunas de T10 — são escopo da frente T9, que permanece aberta.

| Item não provado por T10 | Razão |
|--------------------------|-------|
| Descida de funil T9 (discovery → qualification → docs_prep) | Fora de escopo T10 |
| `stage_current` persistente e recarregável pós-restart | Fora de escopo T10 |
| Restart do Worker preservando stage e memória | Fora de escopo T10 — G9-04 |
| Conversa real multi-turno avançando funil (≥3 turnos) | Fora de escopo T10 — G9-03 |
| Fechamento de G9 | Fora de escopo T10 |

### 2.3 O que T9.13M-FIX entregou (write path — resolvido)

A T9.13M-FIX implementou o mapper conservador write path:

```typescript
// src/supabase/crm-store.ts — mapStageCurrentToFaseConversa (linhas 192–208)
export function mapStageCurrentToFaseConversa(stage: string | null | undefined): string | null {
  if (!stage) return null;
  switch (stage) {
    case 'docs_prep':       return 'envio_docs';
    case 'analysis_waiting': return 'aguardando_retorno_correspondente';
    case 'visit_scheduling': return 'agendamento_visita';
    case 'visit_confirmed':  return 'visita_confirmada';
    case 'finalization':     return 'finalizacao_processo';
    case 'discovery':
    case 'qualification_civil':
    case 'qualification_renda':
    case 'qualification_eligibility':
    default:
      return null;
  }
}
```

O write path está correto: stages pré-docs não gravam `fase_conversa` (preservam default `'inicio'`);
stages pós-docs gravam os valores CRM operacionais legados correspondentes.

---

## 3. Causa raiz — Read Path Ausente

### 3.1 O problema

A função `mapLeadStateFromEnovaState` em `src/supabase/crm-store.ts` (linhas 110–122) lê
`row.stage_current`:

```typescript
function mapLeadStateFromEnovaState(row: EnovaStateRow, fallbackId: number): CrmLeadState {
  return {
    state_id: `enova_state:${asString(row.lead_id) || fallbackId}`,
    lead_id: asString(row.lead_id) || `enova_state:${fallbackId}`,
    stage_current: asString(row.stage_current) || 'discovery',   // ← BUG
    next_objective: asString(row.next_objective) || '',
    block_advance: asBool(row.block_advance),
    policy_flags: {},
    risk_flags: null,
    state_version: typeof row.state_version === 'number' ? row.state_version : 0,
    updated_at: asString(row.updated_at) || nowIso(),
  };
}
```

### 3.2 Por que este código é incorreto

A coluna `stage_current` **não existe** no schema real de `enova_state`.

Confirmado com histórico de evidências:
- T9.13E: `block_advance` → PGRST204
- T9.13F: `next_objective` → PGRST204
- **T9.13G: `stage_current` → PGRST204** ← confirmação direta
- T9.13G: `state_version` → PGRST204
- Fonte: `schema/diagnostics/T9_13G_PAYLOAD_SCHEMA_MATRIX.md` §3

O tipo `EnovaStateRow` usa `[k: string]: unknown` como índice (linha 195 de `src/supabase/types.ts`),
portanto `row.stage_current` compila sem erro, mas retorna `undefined` em runtime.

**Cadeia de falha em runtime:**

```
1. Supabase retorna row sem campo stage_current (não existe)
2. row.stage_current === undefined
3. asString(undefined) → ''
4. '' || 'discovery' → 'discovery'
5. stage_current sempre retorna 'discovery' após restart
```

### 3.3 Por que o write path não ajuda

O write path foi corrigido (mapper conservador T9.13M-FIX) e grava `fase_conversa` corretamente
para stages pós-docs. Mas para stages pré-docs, **não grava nada** (preserva o default `'inicio'`
do banco). Resultado:

| Cenário | Write | Read (bug) |
|---------|-------|------------|
| Lead em `docs_prep` | Grava `fase_conversa='envio_docs'` ✅ | Lê `row.stage_current` → undefined → `'discovery'` ❌ |
| Lead em `discovery` | Não grava `fase_conversa` (pré-docs) ✅ | Lê `row.stage_current` → undefined → `'discovery'` ❌ |
| Lead em `qualification_civil` | Não grava `fase_conversa` ✅ | Lê `row.stage_current` → undefined → `'discovery'` ❌ |

**Mesmo para o caso `docs_prep` → `envio_docs`:** o valor escrito é `fase_conversa='envio_docs'`,
mas o código de leitura ignora `fase_conversa` completamente e tenta ler `stage_current`
(que não existe). Resultado: `docs_prep` retorna `'discovery'` após restart — **igual a todos os outros**.

---

## 4. Efeito operacional

### 4.1 Antes do restart (in-memory)

O `Core mecânico` (engine.ts) mantém `stage_current` in-memory durante a sessão. Enquanto o Worker
não reinicia, o stage é gerenciado corretamente pelo pipeline. Isso explica por que descida de funil
funciona em smoke local.

### 4.2 Após restart (pós-Supabase read)

1. Worker reinicia (novo deploy ou nova instância Cloudflare)
2. `readLeadStates()` chama `mapLeadStateFromEnovaState` para cada row de `enova_state`
3. `row.stage_current` = undefined → `asString(undefined)` = `''` → `'' || 'discovery'` = `'discovery'`
4. Lead volta para `discovery` independentemente do stage real gravado em `fase_conversa`
5. G9-04 não satisfeito: "restart do Worker preserva stage e memória"

### 4.3 Impacto em G9

| Critério G9 | Impacto do bug de read path |
|-------------|------------------------------|
| **G9-02** — `stage_current` gravado e lido corretamente em Supabase real | **BLOQUEADO** — leitura retorna `'discovery'` sempre |
| **G9-04** — restart preserva stage | **BLOQUEADO** — stage se perde no restart |
| G9-03 — conversa real avança stages em ≥3 turnos | Smoke local funciona (in-memory); real com restart não provado |
| G9-08 — Supabase real ativo em PROD | `crm_lead_meta` OK; read path de `enova_state` com bug |

---

## 5. Critérios G9 não provados (estado pós-T10)

| Critério | Status | Descrição |
|----------|--------|-----------|
| **G9-02** | ❌ BLOQUEADO | `stage_current` gravado/lido corretamente em Supabase real — read path incorreto |
| **G9-03** | ❌ NÃO PROVADO | Conversa real multi-turno avança stages em ≥3 turnos com Vasques |
| **G9-04** | ❌ BLOQUEADO | Restart do Worker preserva stage/memória — bug de read path |
| **G9-07** | ❌ NÃO PROVADO | Facts extraídos em produção real e persistidos de forma útil |
| **G9-09** | ❌ NÃO PROVADO | `wrangler tail` mostrando cadeia completa correlacionada |
| **G9-10** | ❌ NÃO PROVADO | Vasques confirma ≥5 conversas reais completas |

Critérios parcialmente/inconclusivamente satisfeitos:

| Critério | Status | Descrição |
|----------|--------|-----------|
| G9-01 | ⚠️ PARCIAL | PROD chama `runCoreEngine` — confirmado smoke local, não em wrangler tail real |
| G9-05 | ⚠️ PARCIAL | Output guard presente em código, smoke controlado (`prove:output-guard`) não executado |
| G9-06 | ⚠️ PARCIAL | LLM recebe LlmContext — presente em código, não confirmado em wrangler tail real |
| G9-08 | ⚠️ PARCIAL | `crm_lead_meta` OK em PROD; `enova_state` com bug de read path |

---

## 6. Por que NÃO avançar diretamente para T9.14-IMPL-full

A PR-DIAG READ-ONLY pós-T10 confirmou que o problema de read path é **o bloqueante mais
crítico e mais simples** da frente T9 atual. Os critérios G9-03, G9-07, G9-09 e G9-10
dependem de conversas reais funcionando — e conversas reais só funcionam se restart não
zera o stage.

Portanto, a ordem correta é:
1. **Esta PR: T9.14-DIAG** — formalizar o diagnóstico (este documento)
2. **Próxima: T9.14-IMPL** — implementar SOMENTE o reverse mapper (read path)
3. Após T9.14-IMPL: smoke de write/read/restart lógico
4. Subsequente: provar G9-03, G9-07, G9-09, G9-10 em conversas reais

---

## 7. Proposta para T9.14-IMPL (escopo delimitado)

### 7.1 Objetivo da próxima IMPL

Implementar o **reverse mapper** `fase_conversa → stage_current` na função
`mapLeadStateFromEnovaState` em `src/supabase/crm-store.ts`.

### 7.2 Lógica do reverse mapper

```typescript
// PROPOSTA — implementar em T9.14-IMPL
// Reverse do mapper conservador T9.13L §6.2

function mapFaseConversaToStageCurrentCanonic(faseConversa: string | null | undefined): string {
  // Fase default 'inicio' ou null = lead pré-docs → stage 'discovery'
  if (!faseConversa || faseConversa === 'inicio') return 'discovery';

  switch (faseConversa) {
    case 'envio_docs':                        return 'docs_prep';
    case 'aguardando_retorno_correspondente': return 'analysis_waiting';
    case 'agendamento_visita':                return 'visit_scheduling';
    case 'visita_confirmada':                 return 'visit_confirmed';
    case 'finalizacao_processo':              return 'finalization';
    // Valores legados E1 não mapeados para stages T9 (pré-docs operacionais E1)
    // → retornar 'discovery' conservador (seguro para stages pré-docs não reconhecidos)
    default:
      return 'discovery';
  }
}
```

Correção em `mapLeadStateFromEnovaState`:

```typescript
// ANTES (bug):
stage_current: asString(row.stage_current) || 'discovery',

// DEPOIS (correto):
stage_current: mapFaseConversaToStageCurrentCanonic(
  typeof row.fase_conversa === 'string' ? row.fase_conversa : null
),
```

### 7.3 Princípios do reverse mapper

1. **Conservador**: para qualquer valor desconhecido, retorna `'discovery'` (nunca inventa stage)
2. **Não cria colunas**: usa apenas `fase_conversa` (coluna existente confirmada por T9.13K/T9.13L)
3. **Não altera schema**: lê o que já está no banco, sem migration
4. **Não quebra pré-docs**: `fase_conversa='inicio'` ou `null` → `'discovery'` (correto)
5. **Mapeia pós-docs**: `fase_conversa='envio_docs'` → `'docs_prep'` (correto para G9-02)

### 7.4 Prova exigida pós-T9.14-IMPL

A PR T9.14-IMPL deve provar:

| Prova | Critério |
|-------|----------|
| Write `stage_current='docs_prep'` → Supabase grava `fase_conversa='envio_docs'` | G9-02 (write) |
| Read `fase_conversa='envio_docs'` → `stage_current='docs_prep'` retorna | G9-02 (read) |
| Write `stage_current='discovery'` → Supabase NÃO grava `fase_conversa` (preserva default) | mapper conservador |
| Read `fase_conversa=null` ou `'inicio'` → `stage_current='discovery'` retorna | mapper conservador |
| Simular restart: escrever → ler → confirmar stage correto (lógico) | G9-04 (lógico) |

### 7.5 Arquivos que T9.14-IMPL PODE alterar

| Arquivo | Motivo |
|---------|--------|
| `src/supabase/crm-store.ts` | Corrigir `mapLeadStateFromEnovaState` + adicionar reverse mapper |
| `src/supabase/types.ts` | Somente se necessário para tipar o reverse mapper |
| Testes/provas relacionados a T9.13/T9.14 | Somente se necessário para a prova de write/read/restart |

### 7.6 Arquivos PROIBIDOS em T9.14-IMPL

| Arquivo | Razão da proibição |
|---------|-------------------|
| `panel-nextjs/**` | Frente T10 encerrada — zero toque |
| Migrations Supabase | Sem autorização explícita de Vasques |
| `wrangler.toml` | Fora de escopo |
| `src/meta/outbound` gates | Não tocar em gates de envio real |
| Flags de rollout (`CLIENT_REAL_ENABLED`, etc.) | Fora de escopo; requer autorização Vasques |
| `src/llm/**`, `src/core/**` | Fora de escopo desta IMPL |

---

## 8. Itens Opcionais — Não Mexer Agora

Os itens abaixo são desejos futuros. Nenhuma PR do T9 atual deve tocá-los:

| Item | Status |
|------|--------|
| Memória em Supabase (MemoryStore → Supabase real) | **Opcional** — não mexer agora |
| Resumo automático de histórico (LLM compactando turnos) | **Opcional** — não mexer agora |
| KV distribuído para dedupe | **Opcional** — não mexer agora |
| RLS/storage de documentos | **Opcional** — não mexer agora |
| Frontend painel de stages/facts | **Opcional** — não mexer agora |
| `crm_turns` no Supabase (schema/destino não confirmados) | **Opcional** — não mexer agora |

---

## 9. Bloqueios formais

| ID | Status | Descrição |
|----|--------|-----------|
| `BLK-T9.14-READ-PATH` | **ATIVO** | `mapLeadStateFromEnovaState` lê `row.stage_current` (inexistente); reverse mapper `fase_conversa → stage_current` não implementado |
| `BLK-T9.13-STATE-MAPPING` | RESOLVIDO (write) — **PARCIALMENTE** | Write path OK (T9.13M-FIX); read path BLK-T9.14-READ-PATH criado para formalizar o side não resolvido |

---

## 10. O que esta PR (T9.14-DIAG) fez

| Ação | Status |
|------|--------|
| Criou `schema/diagnostics/T9_14_READ_PATH_STAGE_MAPPING_DIAG.md` | ✅ FEITO |
| Identificou `BLK-T9.14-READ-PATH` (read path ausente) | ✅ FEITO |
| Documentou causa raiz, efeito e cadeia de falha | ✅ FEITO |
| Documentou critérios G9 bloqueados e não provados | ✅ FEITO |
| Documentou o que T10 provou vs. não provou | ✅ FEITO |
| Propôs escopo delimitado de T9.14-IMPL | ✅ FEITO |
| Marcou itens opcionais como "não mexer agora" | ✅ FEITO |
| Atualizou STATUS e HANDOFF | ✅ FEITO (arquivos vivos) |

---

## 10. O que esta PR NÃO fez

| Ação | Status |
|------|--------|
| Alterar qualquer arquivo em `src/` | **Não feito** — PR-DIAG pura |
| Implementar reverse mapper | **Não feito** — escopo de T9.14-IMPL |
| Corrigir `mapLeadStateFromEnovaState` | **Não feito** — escopo de T9.14-IMPL |
| Alterar schema Supabase, RLS, migrations | **Não feito** |
| Alterar `panel-nextjs/**` | **Não feito** |
| Alterar `wrangler.toml` | **Não feito** |
| Alterar flags de ambiente | **Não feito** |
| Fechar G9 | **Não feito** |
| Autorizar T9.14-IMPL sem esta DIAG | **Não feito** — esta DIAG é pré-requisito |

---

## 11. Próximo passo autorizado

**T9.14-IMPL** — implementar reverse mapper `fase_conversa → stage_current`
conforme escopo delimitado em §7 deste documento.

**Condições para autorizar T9.14-IMPL:**
1. Esta PR T9.14-DIAG mergeada
2. Escopo restrito ao reverse mapper (somente `src/supabase/crm-store.ts` + tipos se necessário)
3. Prova de write/read/restart lógico conforme §7.4

**T9.14-IMPL NÃO está autorizada para:**
- Implementar funil completo (stages além do reverse mapper)
- Tocar panel-nextjs/
- Criar migrations
- Alterar flags de rollout
- Alterar src/llm/ ou src/core/

---

## 12. Smoke tests executados nesta PR

| Suite | Status |
|-------|--------|
| `src/` alterado | zero — PR-DIAG pura |
| `panel-nextjs/` alterado | zero |
| PR Governance Check | Valida body da PR |
| Baseline herdada (T10.7-READINESS) | smoke:meta:canary 41/41 PASS |

**Motivo**: Esta é uma PR-DIAG documental pura. Nenhum arquivo de código foi alterado.

---

## 13. Referências cruzadas

| Documento | Relevância |
|-----------|------------|
| `schema/diagnostics/T9_13K_STATE_MAPPING_DIAG.md` | Write path mapper — confirmação de `fase_conversa` como candidato principal |
| `schema/diagnostics/T9_13L_ENOVA1_CRM_CROSSCHECK.md` | Mapper conservador — estratégia confirmada por crosscheck Enova 1 |
| `src/supabase/crm-store.ts:110–122` | `mapLeadStateFromEnovaState` — função com bug de read path |
| `src/supabase/crm-store.ts:192–208` | `mapStageCurrentToFaseConversa` — write path correto (T9.13M-FIX) |
| `src/supabase/types.ts:226–235` | `EnovaStateRow` — JSDoc confirma ausência de `stage_current` no schema real |
| `schema/readiness/T10_7_PANEL_CRM_READINESS_CLOSEOUT.md` | Contexto: T10 encerrada por prova; T9 permanece aberto |
| `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` §5 | Critérios G9-01..G9-10 |

---

## 14. Veredito

```
VEREDITO T9.14-DIAG
====================
Frente T9: em execução — contrato aberto
Próxima PR autorizada: T9.14-IMPL (somente reverse mapper / read path)
Bloqueio ativo: BLK-T9.14-READ-PATH
Critérios G9 bloqueados: G9-02, G9-04
Critérios G9 não provados: G9-03, G9-07, G9-09, G9-10
Smoke local funciona (in-memory) — prova real pós-restart não feita
Avançar para T9.14-IMPL: SIM — após merge desta DIAG, escopo delimitado
Avançar para T9.14-IMPL amplo (funil completo, LLM, etc.): NÃO — somente reverse mapper
```
