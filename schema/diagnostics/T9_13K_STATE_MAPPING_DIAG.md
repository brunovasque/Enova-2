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

---

## 16. Matriz de compatibilidade CRM legado × stage_current Enova 2

**Data de complemento**: 2026-05-03 (mesma branch `diag/t9.13k-state-mapping`, PR #209)

### 16.1 Decisões de Vasques (contexto)

Vasques forneceu SQL com resultado real do banco PROD e confirmou as seguintes regras:

1. **Não criar colunas novas** no schema Supabase real.
2. **Não renomear colunas legadas** — preservar nomes da Enova 1.
3. **O runtime (Enova 2) se adapta ao legado** — não o contrário.

Consequência direta: `mapLeadStateToEnovaState` precisa de uma **camada de tradução explícita**
que converta valores canônicos T9 (`'discovery'`, `'qualification_civil'`, etc.) para os valores
legados existentes em `fase_conversa` antes de gravar no Supabase real.

### 16.2 Schema real confirmado por SQL (Vasques, 2026-05-03)

```
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'enova_state'
  AND column_name IN ('fase_conversa', 'intro_etapa', 'last_processed_stage', 'last_user_stage');
```

| Coluna | data_type | is_nullable | column_default |
|---|---|---|---|
| `fase_conversa` | text | YES | `'inicio'::text` |
| `intro_etapa` | text | YES | NULL |
| `last_processed_stage` | text | YES | NULL |
| `last_user_stage` | text | YES | NULL |

**Observações relevantes:**
- `fase_conversa` tem default `'inicio'` — confirma que é o campo de entrada padrão do funil.
- Os demais candidatos não têm default — são opcionais/legados de menor controle.
- Todas as colunas são nullable — escrita parcial é segura (sem risco de NOT NULL violation).

### 16.3 Distribuição real de `fase_conversa` (Vasques, 2026-05-03)

```
SELECT fase_conversa, COUNT(*) as cnt
FROM enova_state
GROUP BY fase_conversa
ORDER BY cnt DESC;
```

Valores confirmados presentes no banco PROD:

| Valor legado | Semântica provável (Enova 1) |
|---|---|
| `inicio` | Entrada padrão — lead recém-criado ou sem stage definido |
| `inicio_nome` | Etapa de coleta de nome |
| `inicio_programa` | Etapa de apresentação do programa MCMV |
| `docs_opcao` | Etapa de escolha/apresentação de documentos |
| `confirmar_interesse` | Confirmação de interesse do lead |
| `primeiro` | Não identificado — possivelmente etapa de primeiro contato |
| `proxy_teste_5` | Valor de teste — não operacional |
| `clt_renda_perfil_informativo` | Etapa de qualificação de renda CLT |
| `quem_pode_somar` | Etapa de composição de renda — quem pode somar |
| `system_counter` | Valor de sistema interno — não operacional |

### 16.4 Matriz de tradução: T9 canônico → legado `fase_conversa`

| Stage canônico T9 | Coluna real | Valor legado candidato | Confiança | Risco CRM/panel | Decisão |
|---|---|---|---|---|---|
| `discovery` | `fase_conversa` | `inicio` | **ALTA** — default já é 'inicio', entrada padrão | BAIXO — valor já existe em produção | Mapear `discovery → 'inicio'` |
| `qualification_civil` | `fase_conversa` | (sem equivalente direto na distribuição) | **BAIXA** — nenhum valor legado com nome claro | **ALTO** — panel pode não reconhecer valor novo | **BLOQUEADO** — aguardar Vasques |
| `qualification_renda` | `fase_conversa` | `clt_renda_perfil_informativo` | MÉDIA — nome sugere qualificação de renda CLT | MÉDIO — valor existe mas pode ser subconjunto | Candidato — aguardar Vasques |
| `qualification_eligibility` | `fase_conversa` | `quem_pode_somar` | MÉDIA — "quem pode somar" = composição de renda | MÉDIO — semântica parcial | Candidato — aguardar Vasques |
| `docs_prep` | `fase_conversa` | `docs_opcao` | **ALTA** — "docs_opcao" = opção de documentos | BAIXO — valor já existe em produção | Candidato forte — aguardar Vasques |
| `visit` | `fase_conversa` | (sem equivalente na distribuição) | **BAIXA** — nenhum valor `visita_*` na distribuição | **ALTO** — panel pode não reconhecer valor novo | **BLOQUEADO** — aguardar Vasques |

### 16.5 Gap registrado: CRM/panel antigo não acessível

**Tentativa de acesso:**
```sh
git remote -v
# → origin https://github.com/brunovasque/Enova-2.git
git submodule status
# → (sem saída — nenhum submódulo)
```

**Resultado**: O repositório do CRM/panel Enova 1 **não está acessível** nesta execução.
Não há submodules, não há repositório irmão montado, não há path local para o código legado.

**Impacto**:
- Não é possível verificar diretamente qual código do panel consome `fase_conversa`.
- Não é possível confirmar quais valores o panel renderiza ou espera.
- A verificação de risco de compatibilidade é baseada em inferência por nome de coluna
  e distribuição de valores — não em análise direta do código do panel.

**Decisão**: BLK permanece ativo. Nenhuma escrita em `fase_conversa` ocorre antes de
Vasques confirmar explicitamente a tabela de tradução (§16.6).

### 16.6 Tabela de tradução proposta (aguardando confirmação de Vasques)

```typescript
// PROPOSTA — NÃO implementar sem confirmação explícita de Vasques
// Ver: schema/diagnostics/T9_13K_STATE_MAPPING_DIAG.md §16.6
const STAGE_TO_FASE_CONVERSA: Record<string, string> = {
  'discovery':               'inicio',                       // alta confiança
  'qualification_civil':     '???',                          // BLOQUEADO — sem candidato
  'qualification_renda':     'clt_renda_perfil_informativo', // candidato — confirmar
  'qualification_eligibility': 'quem_pode_somar',            // candidato — confirmar
  'docs_prep':               'docs_opcao',                   // alta confiança
  'visit':                   '???',                          // BLOQUEADO — sem candidato
};
```

Esta tabela **não está implementada** em `src/`. Quando Vasques confirmar os mapeamentos
faltantes, a implementação ocorrerá em PR-FIX posterior (T9.13K-FIX ou T9.14-IMPL).

### 16.7 Risco de não usar camada de tradução

Se o runtime gravar os valores canônicos T9 diretamente em `fase_conversa`
(ex: `'discovery'`, `'qualification_civil'`, `'qualification_renda'`) sem tradução:

| Risco | Impacto |
|---|---|
| Panel Enova 1 não reconhece o valor | UI do painel pode exibir estado vazio ou inválido |
| Workflows legados que leem `fase_conversa` param | Outros processos dependentes de `fase_conversa` quebram |
| Dados históricos corrompidos conceitualmente | Métricas de distribuição de stage ficam inconsistentes |
| Reversão difícil em PROD | Valores novos propagados para todos os leads ativos |

**Conclusão**: A camada de tradução é **obrigatória** antes de qualquer escrita real em `fase_conversa`.

### 16.8 Estado do bloqueio após este complemento

| Item | Status |
|---|---|
| `fase_conversa` confirmada como candidata principal | **CONFIRMADO** (por SQL Vasques) |
| Schema real das colunas candidatas | **CONFIRMADO** (por SQL Vasques) |
| Distribuição de valores legados | **CONFIRMADO** (por SQL Vasques) |
| Tabela de tradução completa | **INCOMPLETO** — 2 stages sem candidato (`qualification_civil`, `visit`) |
| CRM/panel antigo acessível para verificação | **NÃO** — gap registrado (§16.5) |
| `BLK-T9.13-STATE-MAPPING` | **PERMANECE ATIVO** — aguardando confirmação Vasques dos mapeamentos faltantes |

---

## 17. Retificação pós-crosscheck Enova 1 (T9.13L-DIAG, 2026-05-03)

**Branch**: `diag/t9.13l-enova1-crm-crosscheck`
**Documento de evidência**: `schema/diagnostics/T9_13L_ENOVA1_CRM_CROSSCHECK.md`

Vasques acessou diretamente o repositório `brunovasque/Enova` (Enova 1) e forneceu duas evidências:

1. **`schema/crm_leads_v1.sql`**: view `crm_leads_v1` faz `e.fase_conversa AS fase_funil` e filtra
   o CRM operacional com `fase_conversa IN ('envio_docs', 'aguardando_retorno_correspondente',
   'agendamento_visita', 'visita_confirmada', 'finalizacao_processo')` — mais flags
   `processo_aprovado`/`processo_reprovado`/`visita_confirmada`.

2. **`panel/app/crm/CrmUI.tsx`**: painel classifica abas como PASTA (`envio_docs`),
   ANALISE (`aguardando_retorno_correspondente`), VISITA (`agendamento_visita`, `visita_confirmada`,
   `finalizacao_processo`). Aprovado/reprovado vêm por flags/status, não apenas por `fase_conversa`.

### 17.1 Leitura corrigida dos candidatos de §16.4

A §16.4 listou `qualification_renda → clt_renda_perfil_informativo` (MÉDIA) e
`qualification_eligibility → quem_pode_somar` (MÉDIA) como candidatos.

**Retificação**: esses mapeamentos estão **errados**. Esses são stages pré-CRM operacional.
Gravar `clt_renda_perfil_informativo` ou `quem_pode_somar` em `fase_conversa` para stages
pré-docs faria o lead **desaparecer do CRM operacional** (view `crm_leads_v1` não filtra esses valores).

### 17.2 Regra corrigida

> **Stages pré-docs (`discovery`, `qualification_civil`, `qualification_renda`,
> `qualification_eligibility`) NÃO devem ser mapeados para valores de CRM operacional
> em `fase_conversa`.**
>
> O mapper futuro deve **preservar `fase_conversa = 'inicio'` (default)** para esses stages
> e só gravar valores operacionais quando o stage T9 alcançar `docs_prep` ou posterior.

### 17.3 Mapper conservador correto

```
docs_prep              → 'envio_docs'
analysis_waiting       → 'aguardando_retorno_correspondente'
visit_scheduling       → 'agendamento_visita'
visit_confirmed        → 'visita_confirmada'
finalization           → 'finalizacao_processo'
discovery/qual_*/pré-docs → não gravar / manter 'inicio' (default banco)
aprovado/reprovado     → flags booleanas (processo_aprovado, processo_reprovado) — não fase_conversa
```

### 17.4 Impacto no BLK

`BLK-T9.13-STATE-MAPPING` **PERMANECE ATIVO** — mapper ainda não implementado em `src/`.
PR-FIX **NÃO está autorizada** se tentar mapear stages pré-docs para CRM operacional.
