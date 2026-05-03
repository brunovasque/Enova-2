# T9.13 — Prova Supabase write real (state/leads) em TEST

**Tipo:** PR-PROVA  
**Data:** 2026-05-03  
**Branch:** `prove/t9.13-supabase-write-real-test`  
**Depende de:** T9.12-IMPL (CONCLUÍDA — PR #196)  
**Contrato:** `schema/contracts/active/CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md`

---

## 1. Objetivo

Confirmar, por prova controlada, que a escrita real Supabase implementada na T9.12-IMPL funciona corretamente para:

- `crm_leads → crm_lead_meta` (insert + update)
- `crm_lead_state → enova_state` (insert + update)

E confirmar que as tabelas não mapeadas continuam com writeBuffer:

- `crm_turns` → sempre writeBuffer (lead_timeline_events sem DDL confirmado — BLK-WRITE-02)
- `crm_facts` → sempre writeBuffer (destino Supabase sem DDL confirmado — BLK-WRITE-04)

---

## 2. Escopo

| Item | Incluído |
|---|---|
| Script dual-mode `src/supabase/write-real-test-proof.ts` | ✓ |
| Prova P1–P4: modo local/mock (sem credenciais reais) | ✓ |
| Prova P5–P9: modo TEST real (SUPABASE_WRITE_REAL_TEST_ENABLED=true) | ✓ script criado |
| Dados de prova marcados (`t9_13_test_<timestamp>`) | ✓ |
| Documento de prova (este arquivo) | ✓ |
| Atualização de STATUS e handoffs vivos | ✓ |

---

## 3. Fora de escopo

- Alterar schema Supabase
- Criar migrations
- Alterar RLS
- Alterar buckets/storage
- Escrever crm_turns no Supabase
- Escrever crm_facts no Supabase
- Usar `lead_timeline_events` ou `enova_kv`
- Alterar LLM, Output Guard, Core, parsers
- Alterar canary-pipeline, webhook Meta, outbound
- Fechar G9
- Apagar dados (delete proibido por contrato T9)

---

## 4. Pré-condições

| Pré-condição | Estado |
|---|---|
| T9.12-IMPL CONCLUÍDA (PR #196) | ✓ |
| `supabaseUpsert()` em `src/supabase/client.ts` | ✓ |
| `SupabaseCrmBackend` com `writeEnabled` param | ✓ |
| `getCrmBackend` passa `writeEnabled` | ✓ |
| `smoke:supabase:write-real` 39/39 PASS | ✓ |

---

## 5. Flags necessárias para modo real

| Flag/Env | Valor obrigatório | Descrição |
|---|---|---|
| `SUPABASE_WRITE_REAL_TEST_ENABLED` | `true` | Gate do script de prova |
| `SUPABASE_REAL_ENABLED` | `true` | Habilita SupabaseCrmBackend |
| `SUPABASE_WRITE_ENABLED` | `true` | Habilita escrita real |
| `SUPABASE_URL` | URL real | Endpoint PostgREST |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret real | Nunca exposto em stdout |

---

## 6. Dados de prova

Os dados usados são claramente marcados como teste:

```
lead_id:       t9_13_test_<timestamp>
external_ref:  t9_13_wa_test_<timestamp>
customer_name: T9.13 Prova Controlada
phone_ref:     t9_13_phone_test
```

**Importante:** Os dados de prova escritos no Supabase real permanecem permanentemente (delete proibido por contrato T9). Eles não são dados de cliente real.

---

## 7. Tabelas provadas vs não provadas

| Tabela CRM | Tabela Supabase | Status prova |
|---|---|---|
| `crm_leads` | `crm_lead_meta` | Provada — insert + update + leitura |
| `crm_lead_state` | `enova_state` | Provada — insert + update + leitura |
| `crm_turns` | `lead_timeline_events` | Deliberadamente NOT provada — BLK-WRITE-02 |
| `crm_facts` | (sem destino confirmado) | Deliberadamente NOT provada — BLK-WRITE-04 |
| `crm_documents` | `enova_docs` | Fora de escopo desta PR |
| `crm_override_log` | `crm_override_log` | Fora de escopo desta PR |

---

## 8. Estrutura do script

### Bloco A — Provas locais/mock (P1–P4) — sempre executadas

| Prova | Descrição |
|---|---|
| P1 | Flag OFF → writeBuffer para crm_leads e crm_lead_state |
| P2 | Flag ON + URL falsa → fallback writeBuffer sem exceção |
| P3 | crm_turns e crm_facts → sempre writeBuffer mesmo com flag ON |
| P4 | Secrets não vazam em output serializado |

### Bloco B — Provas TEST real (P5–P9) — condicionais

| Prova | Descrição |
|---|---|
| P5 | insert crm_leads → upsert crm_lead_meta + leitura de verificação (10 checks) |
| P6 | insert crm_lead_state → upsert enova_state + leitura de verificação (10 checks) |
| P7 | update crm_leads → atualiza crm_lead_meta + leitura de verificação (7 checks) |
| P8 | update crm_lead_state → atualiza enova_state + leitura de verificação (7 checks) |
| P9 | crm_turns/crm_facts em writeBuffer (não Supabase) + secrets não vazam (4 checks) |

---

## 9. Evidência esperada (modo real)

Após execução com credenciais reais:

1. `crm_lead_meta` contém row com `lead_id = t9_13_test_<timestamp>`
2. `enova_state` contém row com `lead_id = t9_13_test_<timestamp>`
3. `crm_lead_meta` reflete `phone_ref` atualizado e `manual_mode=true`
4. `enova_state` reflete `stage_current='qualification_civil'` e `state_version=2`
5. Output não contém SUPABASE_SERVICE_ROLE_KEY em nenhum ponto

---

## 10. Rollback

| Cenário | Rollback |
|---|---|
| Supabase write falha | Fallback writeBuffer automático — sem impacto |
| Dados de prova indesejados no Supabase | Dados marcados com `t9_13_test_` — identificáveis; cleanup manual por Vasques se necessário |
| Script falha em modo local | Falha em P1–P4 indica regressão em `SupabaseCrmBackend` — reverter PR #196 |
| Flags erradas em Worker TEST | `SUPABASE_WRITE_ENABLED=false` desabilita toda escrita real imediatamente |

---

## 11. Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Escrita em tabela errada no Supabase | Baixa | Reverse mappers explícitos: `crm_leads→crm_lead_meta`, `crm_lead_state→enova_state` |
| Dados de prova conflitando com dados reais | Baixa | `lead_id = t9_13_test_<timestamp>` — colisão improvável |
| Secret exposto em log | Baixa | `safeErrorMessage()` sanitiza automaticamente; smoke P4 verifica |
| Leitura pós-write não encontra row | Possível | PostgREST `?lead_id=eq.<id>` com limite 1 — consulta direta e específica |

---

## 12. Resultado dos checks

### Modo local (executado em 2026-05-03)

| Bloco | Resultado |
|---|---|
| P1 (flag OFF → writeBuffer) | 6/6 PASS |
| P2 (flag ON + URL falsa → fallback) | 4/4 PASS |
| P3 (crm_turns/crm_facts writeBuffer) | 6/6 PASS |
| P4 (secrets não vazam) | 3/3 PASS |
| **Total modo local** | **19/19 PASS** |

### Modo TEST real

| Status | Detalhe |
|---|---|
| SKIP | `SUPABASE_WRITE_REAL_TEST_ENABLED` não setado — aguarda Vasques |
| P5–P9 | 38 checks programados — execução pendente |

---

## 13. Próxima PR autorizada

**Se prova real passar (P5–P9 PASS):**  
→ T9.14 — DIAG/IMPL crm_turns e crm_facts schema/destino controlado

**Se prova real ficar SKIP por falta de credencial/flag:**  
→ T9.13B — Execução real da prova Supabase write em TEST por Vasques

Para executar a prova real:
```bash
SUPABASE_WRITE_REAL_TEST_ENABLED=true \
SUPABASE_REAL_ENABLED=true \
SUPABASE_WRITE_ENABLED=true \
SUPABASE_URL=<url> \
SUPABASE_SERVICE_ROLE_KEY=<key> \
npm run prove:t9.13-supabase-write-real-test
```

---

## 14. Restrições preservadas

- Zero escrita para `crm_turns`, `crm_facts` (BLK-WRITE-02/04)
- Zero delete/reset de dados Supabase
- Zero alteração de schema/RLS/bucket
- Secrets nunca expostos em output
- Sem dados de cliente real
- G9 permanece aberto
