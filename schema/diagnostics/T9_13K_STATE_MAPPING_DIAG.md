# T9.13K — Diagnóstico STATE MAPPING (`crm_lead_state` → `enova_state`)

**Tipo**: PR-DIAG | **Branch**: `diag/t9.13k-state-mapping`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`
**Bloqueio ativo**: `BLK-T9.13-STATE-MAPPING`
**Data**: 2026-05-03

---

## 1. Objetivo

Diagnosticar com segurança o bloqueio `BLK-T9.13-STATE-MAPPING` sem habilitar escrita real
de `crm_lead_state` em Supabase ainda.

Mapear os campos canônicos de `CrmLeadState` contra as colunas reais conhecidas de `enova_state`,
identificar candidatos, e propor método de prova seguro para confirmar qual coluna real recebe
`stage_current`.

---

## 2. Contexto herdado

### 2.1 O que a T9.13J-FIX entregou (prova real 68 PASS — validada por Vasques)

A PR #208 (`fix/t9.13j-lead-pool-lead-temp-canonical`) foi validada por Vasques com prova real:

```
npm run prove:t9.13-supabase-write-real-test
Resultado: 68 PASS | 0 FAIL | 0 SKIP
```

**Evidências confirmadas:**
- `lead_pool='COLD_POOL'` gravado em `crm_lead_meta` e preservado após update
- `lead_temp='COLD'` gravado em `crm_lead_meta` e preservado após update
- `payloadKeysLead=['wa_id','lead_pool','lead_temp','updated_at']` — 4 colunas válidas
- P5.8: `lead_pool === 'COLD_POOL'` PASS
- P5.9: `lead_temp === 'COLD'` PASS
- P7.6: `lead_pool` preservado PASS
- P7.7: `lead_temp` preservado PASS
- Bloqueios resolvidos: `BLK-T9.13H-LEAD-POOL-VALUE`, `BLK-T9.13I-NOT-NULL-FULL`, `BLK-T9.13J-CHECK-CONSTRAINT`

### 2.2 Bloqueio remanescente

| ID | Status | Tabela | Causa |
|---|---|---|---|
| `BLK-T9.13-STATE-MAPPING` | **ATIVO** | `enova_state` | Múltiplos candidatos legado para `stage_current` sem prova canônica de qual usar |

### 2.3 Como o bloqueio foi identificado

Durante T9.13G, o P0 schema discovery (`SELECT * limit=1 → Object.keys(row)`) revelou que
`enova_state` real **não tem as colunas** `stage_current`, `next_objective`, `block_advance`,
`state_version` — todas retornaram PGRST204 (coluna inexistente).

O schema real de `enova_state` contém múltiplos campos legado da Enova 1 que são candidatos
para receber o stage canônico do pipeline T9.

---

## 3. Schema real de `enova_state` (confirmado por P0 T9.13G)

**Schema real (subset, confirmado por `SELECT * limit=1` no banco Supabase PROD):**

```
id, lead_id, wa_id,
last_incoming_id, last_reply_id, last_intent, last_context, last_ts,
controle, atendimento_manual, updated_at,
fase_conversa, intro_etapa, funil_status, funil_opcao_docs, atualizado_em,
nome, last_processed_stage, last_user_stage,
+ dezenas de campos legado E1:
  estado_civil, regime, renda_*, docs_*, dossie_*, pacote_*,
  visita_*, p1_*, p2_*, p3_*, etc.
```

**Fonte**: `schema/diagnostics/T9_13G_PAYLOAD_SCHEMA_MATRIX.md` §3 + JSDoc `EnovaStateRow`
em `src/supabase/types.ts:211`.

---

## 4. Campos canônicos de `CrmLeadState` a mapear

Fonte: `src/crm/types.ts:78` — interface `CrmLeadState`:

| Campo canônico | Tipo TS | Semântica operacional |
|---|---|---|
| `stage_current` | `string` | Stage ativo no funil MCMV (ex: `'discovery'`, `'qualification_civil'`) |
| `next_objective` | `string` | Próximo objetivo autorizado pelo Core (ex: `'coletar_estado_civil'`) |
| `block_advance` | `boolean` | Flag de bloqueio de avanço de stage pelo policy engine |
| `state_version` | `number` | Versão incremental do estado — otimismo concorrente |
| `policy_flags` | `Record<string,unknown>` | Flags de policy ativos para este lead |
| `risk_flags` | `Record<string,unknown> \| null` | Flags de risco ativos para este lead |

---

## 5. Análise dos candidatos legado para `stage_current`

### 5.1 `fase_conversa`

**Nome no schema real**: `fase_conversa`
**Tipo provável**: `text` ou `varchar`
**Semântica legado (E1)**: campo de controle de fase da conversa no funil MCMV Enova 1.
Documentado em `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` como
mapeamento para `current_phase` (que não existe no schema real como nome de coluna).
**Argumento a favor**: nome é o mais semanticamente próximo de "fase ativa da conversa",
que é exatamente o que `stage_current` representa.
**Argumento contra**: múltiplos campos coexistem. Não há prova de que este é o campo
principal de controle de stage na Enova 1 em produção real.
**Status**: candidato principal — não confirmado.

### 5.2 `last_processed_stage`

**Nome no schema real**: `last_processed_stage`
**Tipo provável**: `text` ou `varchar`
**Semântica provável**: último stage que foi *processado* pelo pipeline — pode ser
diferente do stage *atual* se o lead está em transição ou se houve erro de processamento.
**Argumento a favor**: nome explícito de "stage". É o stage do último processamento.
**Argumento contra**: semântica ambígua — "último processado" pode ser defasado em relação
ao estado atual. Se o lead está em `qualification_civil` mas o último turno processado
falhou antes de persistir, `last_processed_stage` pode conter o stage anterior.
**Status**: candidato secundário — semântica diferente de `stage_current`.

### 5.3 `last_user_stage`

**Nome no schema real**: `last_user_stage`
**Tipo provável**: `text` ou `varchar`
**Semântica provável**: stage declarado pelo usuário (lead) ou identificado no último
turno do usuário — não necessariamente o stage do funil mecânico.
**Argumento a favor**: existe como coluna real no schema.
**Argumento contra**: nome sugere perspectiva do usuário, não do funil mecânico. O T9
precisa do stage do *funil* (decidido pelo Core), não do stage percebido pelo usuário.
**Status**: candidato fraco — semântica provavelmente incompatível.

### 5.4 `intro_etapa`

**Nome no schema real**: `intro_etapa`
**Tipo provável**: `text` ou `varchar`
**Semântica provável**: etapa de introdução/onboarding — possivelmente string com
identificador de etapa inicial ou de contexto de introdução.
**Argumento a favor**: existe como coluna real. Documentado em T9_13G como candidato
para `next_objective` (semântica de "próxima etapa").
**Argumento contra**: nome sugere introdução/onboarding, não stage de funil ativo.
Provavelmente não é o campo de controle de stage current.
**Status**: descartado como candidato para `stage_current`. Candidato para `next_objective`.

---

## 6. Análise dos demais campos canônicos

### 6.1 `next_objective` → candidato: `intro_etapa`

| Candidato | Argumento a favor | Argumento contra |
|---|---|---|
| `intro_etapa` | Nome sugere "etapa a introduzir" = próxima etapa | Semântica de intro pode ser diferente de objetivo concreto |
| `last_intent` | Último intent capturado | `last_intent` é retrospectivo, não prospectivo |
| nenhum mapeamento direto | Pode ser omitido sem impacto crítico | `next_objective` é apenas insumo para o LLM — já está no `LlmContext` |

**Recomendação provisória**: `next_objective` pode ser omitido do upsert Supabase inicialmente.
O LLM já recebe `next_objective` via `LlmContext` (T9.8). Persistir em `enova_state` é desejável
mas não bloqueante para o funcionamento do pipeline.

### 6.2 `block_advance` → sem candidato

Nenhum campo no schema real de `enova_state` tem semântica equivalente a "bloquear avanço".
Campo pode ser omitido do upsert Supabase — o bloqueio é resolvido em runtime pelo policy engine.

### 6.3 `state_version` → sem candidato direto

O schema real não tem campo explícito de versão incremental. Alternativas:
- Usar `updated_at` como proxy de versão (timestamp crescente)
- Omitir `state_version` do upsert Supabase completamente

**Recomendação**: omitir `state_version` do upsert. O controle de concorrência pode usar
`updated_at` como tiebreak.

### 6.4 `policy_flags` e `risk_flags` → nenhum candidato

Schema real não tem campos estruturados equivalentes. Candidato: campos jsonb genéricos
como `controle` (presente no schema), mas sem confirmação.
**Decisão**: omitir ambos do upsert Supabase.

---

## 7. Candidatura consolidada

| Campo canônico (`CrmLeadState`) | Candidato real (`enova_state`) | Confiança | Ação recomendada |
|---|---|---|---|
| `stage_current` | `fase_conversa` | **ALTA** — candidato principal | Confirmar com Vasques + prova segura |
| `stage_current` | `last_processed_stage` | MÉDIA — semântica diferente | Investigar semântica real |
| `next_objective` | `intro_etapa` | BAIXA | Omitir inicialmente |
| `block_advance` | (nenhum) | — | Omitir do upsert |
| `state_version` | (nenhum) | — | Omitir do upsert |
| `policy_flags` | (nenhum confirmado) | — | Omitir do upsert |
| `risk_flags` | (nenhum confirmado) | — | Omitir do upsert |

---

## 8. Proposta de prova segura — método diagnóstico

### 8.1 Objetivo da prova

Determinar com certeza:
1. Qual coluna real de `enova_state` deve receber `stage_current`
2. Se a coluna aceita os valores canônicos do pipeline T9
   (`'discovery'`, `'qualification_civil'`, `'qualification_renda'`, etc.)
3. Se `intro_etapa` aceita string de objetivo e pode servir para `next_objective`

### 8.2 Método — Consulta SQL direta (segura, sem código novo)

**Opção A (recomendada): Vasques executa SQL direto no Supabase SQL Editor**

```sql
-- 1. Ver um sample de valores reais de fase_conversa e last_processed_stage
SELECT wa_id, fase_conversa, last_processed_stage, last_user_stage, intro_etapa
FROM enova_state
WHERE fase_conversa IS NOT NULL OR last_processed_stage IS NOT NULL
LIMIT 10;

-- 2. Ver tipos das colunas candidatas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'enova_state'
  AND column_name IN ('fase_conversa', 'last_processed_stage', 'last_user_stage', 'intro_etapa')
ORDER BY column_name;

-- 3. Ver quais valores aparecem em fase_conversa (distribuição)
SELECT fase_conversa, COUNT(*) as cnt
FROM enova_state
GROUP BY fase_conversa
ORDER BY cnt DESC
LIMIT 20;
```

**Resultado esperado**: Vasques vê os valores reais nos campos candidatos e confirma
qual deles contém o stage do funil (discovery, qualification_civil, etc.) ou valores
equivalentes da Enova 1.

**Opção B (alternativa): Vasques confirma diretamente**

Vasques conhece a Enova 1. Pode confirmar diretamente:
- "O stage do funil fica em `fase_conversa`" (ou outro campo)
- "Os valores são esses: X, Y, Z" (mapear para valores canônicos T9 se necessário)

### 8.3 Critério de confirmação

A confirmação de Vasques deve declarar:
1. `stage_current` → coluna real: `____`
2. Valores aceitos pela coluna: `____` (para verificar compatibilidade com pipeline T9)
3. `next_objective` → omitir ou mapear para `____`

Com essa confirmação, uma PR-FIX posterior (T9.13K-FIX ou T9.14-IMPL) pode:
- Atualizar `mapLeadStateToEnovaState` em `src/supabase/crm-store.ts`
- Remover `BLK-T9.13-STATE-MAPPING`
- Habilitar escrita real de `crm_lead_state` em `SupabaseCrmBackend`

---

## 9. O que NÃO deve ser feito antes da confirmação

| Ação proibida | Razão |
|---|---|
| Alterar schema Supabase | Contrato T9 proíbe migration sem prova |
| Criar coluna `stage_current` em `enova_state` | Fora de escopo — o campo legado já existe |
| Escrever `fase_conversa` sem confirmação | Risco de sobrescrever dado real de produção com valor errado |
| Remover `BLK-T9.13-STATE-MAPPING` | Bloqueio permanece até prova real |
| Omitir o diagnóstico e assumir mapeamento | Não inventar mapeamento (regra contratual T9.13G §4) |

---

## 10. Impacto de não resolver o bloqueio

Enquanto `BLK-T9.13-STATE-MAPPING` permanecer ativo:

- `crm_lead_state` vai para `writeBuffer` (in-memory FIFO)
- `SupabaseCrmBackend.insert/update` para `table === 'crm_lead_state'` registra:
  `attempted_real_write=false`, `used_fallback=true`, `error='BLK-T9.13-STATE-MAPPING'`
- Pipeline T9 **funciona normalmente** — stage é gerenciado in-memory pelo Core
- Restart do Worker **perde o stage** — critério G9-04 não satisfeito
- G9-02 (`CrmLeadState.stage_current` gravado em Supabase real) **não satisfeito**

**Risco operacional**: o pipeline está funcionando, mas sem persistência de stage.
Cada restart = lead volta ao stage inicial. Isso bloqueia os critérios G9-02 e G9-04.

---

## 11. Relação com critérios G9

| Critério G9 | Dependência de BLK-T9.13-STATE-MAPPING |
|---|---|
| G9-02 — `stage_current` gravado em Supabase real | **BLOQUEADO** pelo BLK |
| G9-04 — restart preserva stage | **BLOQUEADO** pelo BLK |
| G9-08 — Supabase real ativo em PROD | Parcialmente satisfeito (`crm_lead_meta` OK; `enova_state` BLK) |
| G9-09 — trace com `correlation_id` | Não depende do BLK |

---

## 12. Próximo passo autorizado

**Vasques** executa uma das opções abaixo:

**Opção A (recomendada — sem deploy, sem código):**
```sql
-- Executar no Supabase SQL Editor:
SELECT fase_conversa, COUNT(*) FROM enova_state GROUP BY fase_conversa ORDER BY 2 DESC LIMIT 10;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='enova_state' AND column_name IN ('fase_conversa','last_processed_stage','last_user_stage','intro_etapa');
```
→ Resultado confirma qual coluna tem valores de stage → Vasques declara o mapeamento canônico.

**Opção B (alternativa — conhecimento direto):**
Vasques confirma diretamente: "stage_current vai para `fase_conversa`" (ou outro campo).

**Após confirmação de Vasques:**
Criar PR-T9.13K-FIX (ou PR-T9.14-IMPL) com:
- `mapLeadStateToEnovaState` atualizado: `fase_conversa = stage_current` (ou campo confirmado)
- `SupabaseCrmBackend` desbloqueado para `crm_lead_state`
- `BLK-T9.13-STATE-MAPPING` removido
- Prova real: `prove:t9.13-supabase-write-real-test` deve mostrar escrita real de `enova_state`

---

## 13. Bloqueios formais nesta PR

| ID | Status | Descrição |
|---|---|---|
| `BLK-T9.13-STATE-MAPPING` | **PERMANECE ATIVO** | Mapeamento não resolvido — aguardando confirmação Vasques |

---

## 14. Referências cruzadas

| Documento | Relevância |
|---|---|
| `schema/diagnostics/T9_13G_PAYLOAD_SCHEMA_MATRIX.md` | Fonte dos candidatos legado identificados pelo P0 |
| `src/supabase/types.ts:199` | `EnovaStateRow` e JSDoc com candidatos documentados |
| `src/crm/types.ts:78` | `CrmLeadState` — campos canônicos a mapear |
| `src/supabase/crm-store.ts` | `mapLeadStateToEnovaState` — função a ser corrigida após confirmação |
| `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` §4 | T9.13 na sequência de PRs |
| `schema/diagnostics/T9_13J_CHECK_CONSTRAINT_DIAG.md` | Diag anterior da série T9.13 |

---

## 15. Smoke tests executados nesta PR

| Suite | Resultado |
|---|---|
| `npm run smoke:supabase:write-real` | Não executado nesta PR (apenas diagnóstico documental) |
| `npm run prove:t9.13-supabase-write-real-test` modo local | Não executado — nenhum código alterado |
| `npm run smoke:runtime:env` | Não executado — nenhum código alterado |
| `npm run smoke:runtime:fallback-guard` | Não executado — nenhum código alterado |
| `npm run prove:g8-readiness` | Não executado — nenhum código alterado |

**Motivo**: Esta é uma PR-DIAG pura. Nenhum arquivo de código foi alterado.
Os smokes devem ser executados por Vasques para validar que a baseline continua intacta
após o merge desta PR.

**Baseline esperada (herdada de T9.13J-FIX — 68/68 PASS):**
- `prove:t9.13` modo local: 19/19 PASS / 0 FAIL / 1 SKIP
- `smoke:supabase:write-real`: 39/39 PASS
- `smoke:supabase`: 70/70 PASS
- `smoke:runtime:env`: 53/53 PASS
- `smoke:runtime:fallback-guard`: 41/41 PASS
- `prove:g8-readiness`: 7/7 PASS
