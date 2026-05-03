# T9.13L — Diagnóstico Crosscheck Enova 1 CRM Legado × stage_current Enova 2

**Tipo**: PR-DIAG | **Branch**: `diag/t9.13l-enova1-crm-crosscheck`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`
**Bloqueio ativo**: `BLK-T9.13-STATE-MAPPING` (permanece ativo)
**Data**: 2026-05-03
**Relacionado a**: `schema/diagnostics/T9_13K_STATE_MAPPING_DIAG.md` §16.5 (gap CRM/panel não acessível)

---

## 1. Objetivo

Registrar o crosscheck direto realizado no repositório legado `brunovasque/Enova` (Enova 1),
preenchendo o gap identificado em `T9_13K_STATE_MAPPING_DIAG.md` §16.5 —
"CRM/panel antigo não acessível nesta execução".

Vasques acessou diretamente o Repo1 e forneceu evidências concretas de:
- como a view `crm_leads_v1` consome `fase_conversa` no SQL
- como o painel CRM (`CrmUI.tsx`) classifica leads por aba com base em `fase_conversa`

Com essas evidências, é possível determinar com segurança:
1. Quais valores de `fase_conversa` correspondem ao CRM operacional
2. Quais stages T9 pré-docs **não devem** ser mapeados para o CRM operacional
3. A estratégia de mapper conservador para a PR-FIX futura

---

## 2. Contexto herdado — T9.13K-DIAG (PR #209 + PR #210)

A T9.13K-DIAG estabeleceu:
- `fase_conversa` é o candidato principal para receber `stage_current` no schema real de `enova_state`
- O schema real foi confirmado por SQL: text nullable, default `'inicio'`
- A distribuição de valores PROD foi mapeada: 10 valores (`inicio`, `inicio_nome`, `inicio_programa`,
  `docs_opcao`, `confirmar_interesse`, `primeiro`, `proxy_teste_5`, `clt_renda_perfil_informativo`,
  `quem_pode_somar`, `system_counter`)
- Gap registrado em §16.5: sem acesso direto ao código legado que consome `fase_conversa`

**Lacuna crítica de §16.4 (T9.13K):**
- `qualification_civil` → sem candidato legado claro — **BLOQUEADO**
- `visit` → sem candidato legado claro — **BLOQUEADO**

Esta PR resolve o gap §16.5 com evidências diretas do Repo1.

---

## 3. Evidência 1 — `schema/crm_leads_v1.sql` (Enova 1, `brunovasque/Enova`)

### 3.1 Mapeamento confirmado

A view `crm_leads_v1` faz:
```sql
e.fase_conversa AS fase_funil
```

Isto confirma que `fase_conversa` é o campo de funil exposto para o CRM operacional.

### 3.2 Filtro de entrada no CRM operacional

O WHERE da view `crm_leads_v1` inclui leads no CRM operacional quando `e.fase_conversa` está em:

```sql
fase_conversa IN (
  'envio_docs',
  'aguardando_retorno_correspondente',
  'agendamento_visita',
  'visita_confirmada',
  'finalizacao_processo'
)
```

Ou quando há:
- `e.processo_aprovado IS TRUE`
- `e.processo_reprovado IS TRUE`
- `e.visita_confirmada IS TRUE`
- Ou status CRM manual em `crm_lead_meta`

### 3.3 Conclusão direta da evidência 1

| Conclusão | Implicação para T9 |
|---|---|
| CRM operacional começa em `envio_docs` | Stages anteriores a `envio_docs` são pré-CRM |
| Filtro por `fase_conversa` = conjunto de 5 valores pós-docs | Valores fora desse conjunto não entram no CRM |
| aprovado/reprovado vêm por flags (`processo_aprovado`, `processo_reprovado`) | Não se usa `fase_conversa` para indicar aprovação |
| `visita_confirmada` como flag booleana separada | Entrada no CRM por flag, não só por `fase_conversa` |

---

## 4. Evidência 2 — `panel/app/crm/CrmUI.tsx` (Enova 1, `brunovasque/Enova`)

### 4.1 Classificação de abas do painel

O painel CRM classifica leads por aba com base em `fase_conversa`:

| Aba do painel | Valores de `fase_conversa` | Correspondente T9 |
|---|---|---|
| **PASTA** | `envio_docs` | `docs_prep` (saída) |
| **ANALISE** | `aguardando_retorno_correspondente` | `analysis_waiting` |
| **VISITA** | `agendamento_visita`, `visita_confirmada`, `finalizacao_processo` | `visit_scheduling`, `visit_confirmed`, `finalization` |

Aprovado/reprovado vêm por **flags/status**, não apenas por `fase_conversa`.

### 4.2 Conclusão direta da evidência 2

- O painel só renderiza leads que já estão em `envio_docs` ou posterior
- Stages de qualificação pré-docs não são visíveis no painel CRM operacional
- Isso é intencional — o CRM legado é o painel pós-qualificação

---

## 5. Diagnóstico consolidado — CRM legado é pós-docs

Com as duas evidências combinadas:

### 5.1 O que o CRM legado espera

O CRM legado (`crm_leads_v1` + `CrmUI.tsx`) **apenas opera sobre leads que já passaram da qualificação**.
Ele espera valores de `fase_conversa` que correspondem a etapas de documentação, análise, visita
e finalização.

### 5.2 O que os stages T9 pré-docs representam

Os stages pré-docs do pipeline T9:
- `discovery` — lead recém-identificado, ainda sem qualificação
- `qualification_civil` — coleta de estado civil, regime, composição familiar
- `qualification_renda` — coleta de regime de trabalho, renda, IR
- `qualification_eligibility` — verificação de elegibilidade MCMV

**Esses stages são pré-CRM operacional.** O CRM legado não foi projetado para recebê-los.

### 5.3 Risco de forçar stages pré-docs no CRM

Se o mapper T9 gravar `qualification_civil`, `qualification_renda`, etc. em `fase_conversa`:

| Risco | Impacto |
|---|---|
| `crm_leads_v1` não filtra esses valores | Lead **não aparece** em nenhuma aba do CRM |
| Panel CRM exibe lead em estado inconsistente | Operadores não conseguem trabalhar o lead |
| Lógica CRM legada não prevê esses estados | Workflows podem quebrar ou produzir ruído |
| Reversão difícil em produção | Leads "perdidos" no CRM operacional |

### 5.4 Retificação da leitura anterior (T9.13K §16.4)

A T9.13K §16.4 listou como candidatos:
- `qualification_renda` → `clt_renda_perfil_informativo` (MÉDIA)
- `qualification_eligibility` → `quem_pode_somar` (MÉDIA)

**Retificação com base no crosscheck Enova 1:**

| Stage T9 | Candidato §16.4 | Retificação após crosscheck |
|---|---|---|
| `qualification_renda` | `clt_renda_perfil_informativo` | **DESCARTAR** — este valor existe na distribuição PROD mas é um stage pré-CRM. Gravar em `fase_conversa` causaria lead invisível no painel CRM. |
| `qualification_eligibility` | `quem_pode_somar` | **DESCARTAR** — mesma razão. Stage pré-CRM operacional. |
| `qualification_civil` | (sem candidato) | Confirmado sem candidato — stage pré-docs, não deve entrar no CRM |
| `discovery` | `inicio` | **MANTER** — `inicio` é o default do banco; lead recém-criado; não causa problema no CRM pois lead não aparece na view (filtro pós-docs) |

**Conclusão**: Os stages pré-docs devem permanecer como `inicio` (ou NULL) em `fase_conversa`.
Eles **não devem** ser mapeados para valores específicos de CRM operacional.

---

## 6. Estratégia de mapper conservador

### 6.1 Princípio

> O mapper conservador **não força entrada no CRM operacional** para stages pré-docs.
> Ele só grava valores operacionais quando o lead alcança documentação, análise ou visita.

### 6.2 Tabela de tradução correta (T9 → fase_conversa)

| Stage T9 canônico | Valor `fase_conversa` a gravar | Justificativa |
|---|---|---|
| `discovery` | `'inicio'` (ou omitir — usa default) | Stage inicial; lead não entra no CRM view; valor default seguro |
| `qualification_civil` | Não gravar / manter `inicio` | Pré-docs; sem equivalente CRM; gravar causaria invisibilidade no painel |
| `qualification_renda` | Não gravar / manter `inicio` | Idem |
| `qualification_eligibility` | Não gravar / manter `inicio` | Idem |
| `docs_prep` | `'envio_docs'` | Início do CRM operacional; lead entra em PASTA |
| `analysis_waiting` | `'aguardando_retorno_correspondente'` | Lead em análise pelo correspondente bancário |
| `visit_scheduling` | `'agendamento_visita'` | Lead com visita sendo agendada |
| `visit_confirmed` | `'visita_confirmada'` | Visita confirmada |
| `finalization` | `'finalizacao_processo'` | Lead em processo de finalização |

**Tratamento especial de aprovado/reprovado:**
- Gravados via flags booleanas (`processo_aprovado`, `processo_reprovado`) em `enova_state`
- Não se altera `fase_conversa` para indicar aprovação — isso quebra a lógica do CRM

### 6.3 O que NÃO implementar

```typescript
// PROIBIDO — gravar stages pré-docs como valores CRM
const STAGE_TO_FASE_CONVERSA_ERRADO = {
  'qualification_civil':    'clt_renda_perfil_informativo', // ERRADO
  'qualification_renda':    'clt_renda_perfil_informativo', // ERRADO  
  'qualification_eligibility': 'quem_pode_somar',           // ERRADO
};
```

```typescript
// CORRETO — mapper conservador pós-crosscheck Enova 1
const STAGE_TO_FASE_CONVERSA = {
  'discovery':               'inicio',
  'qualification_civil':     null,  // não gravar — manter 'inicio' (default)
  'qualification_renda':     null,  // não gravar — manter 'inicio' (default)
  'qualification_eligibility': null, // não gravar — manter 'inicio' (default)
  'docs_prep':               'envio_docs',
  'analysis_waiting':        'aguardando_retorno_correspondente',
  'visit_scheduling':        'agendamento_visita',
  'visit_confirmed':         'visita_confirmada',
  'finalization':            'finalizacao_processo',
};
```

---

## 7. O que este diagnóstico mudou vs. T9.13K

### 7.1 Correção de §16.4 (T9.13K)

| Item | T9.13K §16.4 | Após T9.13L |
|---|---|---|
| `qualification_renda → clt_renda_perfil_informativo` | Candidato MÉDIA | **Descartado** — pré-CRM operacional |
| `qualification_eligibility → quem_pode_somar` | Candidato MÉDIA | **Descartado** — pré-CRM operacional |
| `qualification_civil → (sem candidato)` | Bloqueado | Confirmado: **não deve ser mapeado para CRM** |
| `visit → (sem candidato)` | Bloqueado | Separado em sub-stages: `visit_scheduling/confirmed/finalization` mapeados |

### 7.2 Novo entendimento do BLK

O bloqueio `BLK-T9.13-STATE-MAPPING` permanece ativo, mas com uma resolução mais simples:
- **Não é necessário** encontrar um valor CRM para todos os stages T9
- Stages pré-docs simplesmente **não gravam em `fase_conversa`**
- O CRM legado foi preservado: só enxerga leads quando já estão em etapa operacional real

---

## 8. Relação com T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO

O diagnóstico `T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md` (PR-T8.3) declarou:

> "O Repo1 não foi acessado diretamente — diagnóstico baseado no mapa canônico já internalizado no Repo2."

Esta PR T9.13L complementa aquele diagnóstico com acesso **direto** ao Repo1:
- T8.3 mapeou as tabelas Supabase (`enova_state_v2`, etc.) a partir do legado mestre
- T9.13L mapeou **como o CRM consome `fase_conversa`** via código real (`crm_leads_v1.sql`, `CrmUI.tsx`)

---

## 9. Bloqueios formais

| ID | Status | Causa |
|---|---|---|
| `BLK-T9.13-STATE-MAPPING` | **PERMANECE ATIVO** | Mapper conservador definido mas ainda não implementado em `src/` |

---

## 10. O que NÃO foi feito nesta PR

| Ação | Status |
|---|---|
| Alterar qualquer arquivo em `src/` | **Não feito** — PR-DIAG pura |
| Habilitar escrita real de `crm_lead_state` | **Não feito** |
| Remover `BLK-T9.13-STATE-MAPPING` | **Não feito** |
| Alterar schema Supabase, RLS, buckets | **Não feito** |
| Criar migration | **Não feito** |
| Habilitar LLM real, WhatsApp real, outbound real | **Não feito** |
| Fechar G9 | **Não feito** |

---

## 11. Próximo passo autorizado

Após esta PR:

1. **PR-FIX (T9.13K-FIX ou T9.14-IMPL)** — implementar mapper conservador:
   - `STAGE_TO_FASE_CONVERSA` conforme §6.2 desta PR
   - `mapLeadStateToEnovaState` atualizado: stages pré-docs → `null` (não gravar) ou `'inicio'` (default)
   - `SupabaseCrmBackend` desbloqueado para `crm_lead_state`
   - `BLK-T9.13-STATE-MAPPING` removido
   - Prova real: `prove:t9.13-supabase-write-real-test` com escrita real de `enova_state`

**Condição para autorizar PR-FIX:**
- Vasques confirma explicitamente a estratégia do mapper conservador (§6.2)
- A PR-FIX **NÃO está autorizada** se tentar mapear todos os stages pré-docs para CRM operacional

---

## 12. Referências cruzadas

| Documento | Relevância |
|---|---|
| `schema/diagnostics/T9_13K_STATE_MAPPING_DIAG.md` | Gap §16.5 preenchido por esta PR |
| `schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md` | Diagnóstico anterior sem acesso direto ao Repo1 |
| `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md` | Contrato ativo — T9.13 na sequência de PRs |
| `brunovasque/Enova` → `schema/crm_leads_v1.sql` | Evidência 1: filtro CRM operacional |
| `brunovasque/Enova` → `panel/app/crm/CrmUI.tsx` | Evidência 2: classificação de abas PASTA/ANALISE/VISITA |

---

## 13. Smoke tests

| Suite | Status |
|---|---|
| `src/` alterado | **zero** — PR-DIAG pura |
| PR Governance Check | Valida body da PR |
| Baseline herdada (T9.13J-FIX) | 68 PASS \| 0 FAIL \| 0 SKIP |

**Motivo**: Esta é uma PR-DIAG documental pura. Nenhum arquivo de código foi alterado.
A baseline de 68 PASS herdada da T9.13J-FIX permanece intacta.
