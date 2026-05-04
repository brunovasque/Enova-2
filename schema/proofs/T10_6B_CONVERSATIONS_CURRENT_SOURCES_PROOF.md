# T10.6B — Prova: Conversas Alinhadas com Fontes Atuais do Enova-2

> **Tipo**: PR-IMPL — T10.6B-FIX  
> **Branch**: `fix/t10.6b-conversations-current-sources`  
> **Data**: 2026-05-04  
> **Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`  
> **Frente**: T10 — Migração Panel/CRM  
> **Classificação**: `contratual`

---

## §1. Problema corrigido

A aba `/conversations` exibia dados obsoletos do Enova-1:
- `enova_state.fase_conversa` com stages E1: `clt_renda_perfil_informativo`, `quem_pode_somar`, `inicio`, etc.
- `enova_state.funil_status` com valores legados
- Nenhum dado de `crm_lead_meta` ou `enova_attendance_meta` era cruzado

Diagnóstico de origem: `schema/diagnostics/T10_6A_CONVERSATIONS_STALE_DATA_DIAG.md`

---

## §2. Fontes antigas rebaixadas para fallback ou suprimidas

| Campo | Fonte antiga | Comportamento pós-fix |
|-------|-------------|----------------------|
| `fase_conversa` | `enova_state.fase_conversa` (E1 stages) | Mantido como campo mas filtrado por whitelist — apenas valores E2-conhecidos exibidos |
| `funil_status` | `enova_state.funil_status` (E1 values) | **Suprimido inteiramente** — sempre `null` na resposta |
| `nome` | `enova_state.nome` (E1, pode estar desatualizado) | **Rebaixado para fallback** — `crm_lead_meta.nome` tem prioridade |
| `last_message_text` | `enova_log` tags E1: `meta_minimal`, `DECISION_OUTPUT`, `SEND_OK` | **Mantido como fallback temporário** — retorna dados E1 quando disponíveis; vazio para leads E2 puros |

---

## §3. Fontes atuais usadas

| Campo novo | Fonte atual | Tabela | Quem escreve |
|-----------|-------------|--------|--------------|
| `lead_pool` | `crm_lead_meta.lead_pool` | `crm_lead_meta` | Panel (Bases actions) |
| `lead_temp` | `crm_lead_meta.lead_temp` | `crm_lead_meta` | Panel (Bases actions) |
| `status_operacional` | `crm_lead_meta.status_operacional` | `crm_lead_meta` | Panel (Bases actions) |
| `nome` (preferido) | `crm_lead_meta.nome` | `crm_lead_meta` | Panel (Bases actions) |

---

## §4. Campos cruzados por `wa_id`

A API `/api/conversations` agora faz 3 queries paralelas (quando há wa_ids):

```
1. enova_state        → wa_id list + atendimento_manual + fase_conversa (filtrada)
2. crm_lead_meta      → nome, lead_pool, lead_temp, status_operacional
3. enova_log          → last_message_text (fallback E1 temporário)
```

Cruzamento: `crm_lead_meta.wa_id = enova_state.wa_id`

---

## §5. Normalização de badges — whitelist E2

### Badges permitidos

| Badge | Fonte | Condição |
|-------|-------|----------|
| `lead_pool` | `crm_lead_meta` | Quando a conversa existe em `crm_lead_meta` |
| `lead_temp` | `crm_lead_meta` | Quando a conversa existe em `crm_lead_meta` |
| `status_operacional` | `crm_lead_meta` | Quando definido pelo panel |
| `fase_conversa` (E2) | `enova_state` filtrada | Apenas: `envio_docs`, `aguardando_retorno_correspondente`, `agendamento_visita`, `visita_confirmada`, `finalizacao_processo` |
| `manual` | `enova_state.atendimento_manual` | Sempre visível quando `true` |

### Badges ocultados (E1 obsoletos)

Os seguintes valores de `fase_conversa` são **silenciosamente suprimidos** pela função `normalizeFaseConversa()`:

- `inicio`
- `inicio_nome`
- `inicio_programa`
- `clt_renda_perfil_informativo`
- `quem_pode_somar`
- `system_counter`
- `docs_opcao`
- `confirmar_interesse`
- `primeiro`
- `proxy_teste_5`
- **Qualquer outro valor não listado na whitelist E2**

O campo `funil_status` de `enova_state` é **sempre suprimido** (sempre retorna `null`) — os valores eram exclusivamente E1.

---

## §6. Arquivos alterados

| Arquivo | Tipo de alteração |
|---------|------------------|
| `panel-nextjs/app/api/conversations/route.ts` | Enrichment `crm_lead_meta`, normalização `fase_conversa`, supressão `funil_status`, novos campos `lead_pool`/`lead_temp`/`status_operacional` |
| `panel-nextjs/app/conversations/ConversationUI.tsx` | Tipo `Conversation` atualizado; badges E2 (lead_pool, lead_temp, status_operacional) adicionados; badges E1 (`funil_status`) removidos do JSX |

---

## §7. Arquivos NÃO alterados (confirmação de zero escopo externo)

- `panel-nextjs/app/api/messages/route.ts` — **não alterado** (thread continua usando enova_log como fallback temporário)
- `src/` (Worker Cloudflare) — **zero alterações**
- Supabase schema / migrations — **zero alterações**
- RLS — **zero alterações**
- LLM pipeline — **zero alterações**
- WhatsApp / webhook / outbound — **zero alterações**
- Vercel config / env — **zero alterações**

---

## §8. Comando de build e resultado

```bash
cd panel-nextjs && npm run build
```

**Resultado**:
```
▲ Next.js 14.2.5
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (25/25)

Route (app)
...
├ ƒ /api/conversations     0 B    0 B
└ ○ /conversations         8.54 kB  95.8 kB
```

**Zero erros TypeScript. Zero erros de lint. Build 100% PASS.**

---

## §9. Validação git diff

```bash
git diff --name-only HEAD
```

**Resultado**:
```
panel-nextjs/app/api/conversations/route.ts
panel-nextjs/app/conversations/ConversationUI.tsx
```

**Confirmação**: zero `src/`, zero migrations, zero Supabase schema.

---

## §10. Lacuna documentada (não bloqueante)

**LAC-T10.6B-01**: A thread de mensagens (`/api/messages`) continua usando `enova_log` com tags E1 como única fonte. O Enova-2 Worker não escreve esses tags — portanto, leads criados exclusivamente pelo Enova-2 terão thread vazia (sem mensagens). Esta lacuna é **esperada e conhecida**:
- Não é regressão — já era o estado antes desta PR
- Será resolvida em frente futura de eventos/logs do Worker (fora do escopo de T10)
- A lista de conversas (que é o foco desta PR) agora reflete estado atual

---

## Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_6B_CONVERSATIONS_CURRENT_SOURCES_PROOF.md
Estado da evidência:                   completa — build PASS, diff limpo, alterações implementadas
Há lacuna remanescente?:               sim — LAC-T10.6B-01: thread de mensagens ainda usa enova_log E1
                                        (não bloqueante — thread vazia para E2 já era o estado anterior)
Há item parcial/inconclusivo bloqueante?: não — badges E1 suprimidos, fontes E2 integradas, build PASS
Fechamento permitido nesta PR?:        sim — T10.6B-FIX implementada; G10.6 permanece ABERTO
                                        (G10.6 = CRM lista leads reais sem quebrar abas — requer T10.6-CRM-LINK)
Estado permitido após esta PR:         T10.6B-FIX concluída; badges E1 suprimidos; fontes E2 integradas;
                                        G10.6 ABERTO aguarda T10.6-CRM-LINK
Próxima PR autorizada:                 T10.6-CRM-LINK (ligar CRM real com Supabase; validar views)
                                        ou T10.7-READINESS após T10.6-CRM-LINK
```
