# PR-T9.22-review — Suite de testes do funil completo (diagnóstico estático + smoke de conversação)

**PR:** #259 — https://github.com/brunovasque/Enova-2/pull/259
**Branch:** `fix/t9.22-funil-test-suite`
**Base:** `main`
**Commit:** `7481683`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — nova_suite_testes — 4 arquivos (2 novos core + 1 doc + package.json)

---

## Objetivo

Criar suite de testes do funil completo em 2 níveis:
1. **Diagnóstico estático** — chama parsers/gates diretamente com facts sintéticos, verificando que cada stage detecta bloqueios e autoriza avanço corretamente
2. **Smoke de conversação** — simula 3 conversas multi-turno usando `runCoreEngine`, verificando a sequência canônica de coleta de facts

---

## Arquivos criados

### `src/core/funil-static-diagnostic.ts`

29 casos em 5 seções:

| Seção | Casos | Cobertura |
|---|---|---|
| DISCOVERY | D1–D5 (11 checks) | vazio, customer_goal, nome, nacionalidade, estrangeiro sem rnm |
| QUALIFICATION_CIVIL | C1–C4 (8 checks) | vazio, estado_civil, processo, casado |
| QUALIFICATION_RENDA | R1–R3 (5 checks) | vazio, regime, renda completa |
| QUALIFICATION_ELIGIBILITY | E1–E2 (2 checks) | sem nacionalidade, brasileiro |
| SEQUÊNCIA CANÔNICA | SEQ-* (3 checks) | lead modelo completo percorre 3 stages |

**Resultado:** 29/29 PASS

### `src/core/funil-conversation-smoke.ts`

29 casos em 3 conversas:

| Conversa | Turnos | Cenário |
|---|---|---|
| CV1 | T1–T10 (19 checks) | Brasileiro solteiro CLT — caminho dourado completo |
| CV2 | T1–T3 (6 checks) | Estrangeiro sem RNM / com RNM válido |
| CV3 | T1–T2 (4 checks) | Casado — rejeição de solo + aceite de conjunto |

**Resultado:** 29/29 PASS

### `docs/diagnostics/FUNIL-QUALIFICACAO/MAPA-GAPS-ESTATICO.md`

Output capturado dos 2 suites + 5 gaps documentados:
- **GAP-1** — `customer_goal` rejeita valores livres (intencional, normalizado pelo text-extractor)
- **GAP-2** — `nome_completo` lido corretamente de `facts_current` (confirmado, não é gap)
- **GAP-3** — `qualification_eligibility` avança com apenas `nacionalidade` (intencional por design)
- **GAP-4** — `qualification_special` sem cobertura nesta suite (candidato T9.23+)
- **GAP-5** — stages final operacional sem cobertura (candidato T9.24+)

---

## Gap crítico detectado durante implementação

Nos testes iniciais, `customer_goal: 'comprar'` retornava `null` no parser — o topo não avançava.

**Causa:** `normalizeCustomerGoal` em `topo-parser.ts` aceita apenas valores canônicos:
```
'comprar_imovel' | 'entender_programa' | 'enviar_docs' | 'visitar_imovel' | 'outro'
```

**Correção nos testes:** substituir `'comprar'` por `'comprar_imovel'`.

**Impacto em produção:** nulo — o `text-extractor.ts` já normaliza os valores antes de persistir no Supabase. O gap seria relevante apenas se o LLM retornasse um valor livre diretamente para `facts`, o que não ocorre no pipeline real.

---

## Sequência canônica confirmada

```
[1] discovery              — apresentar_e_verificar_conhecimento
[2] discovery              — explicar_mcmv_e_coletar_nome_completo
[3] discovery              — perguntar_nacionalidade
[4] discovery → civil      — (avanço automático ao completar topo)
[5] qualification_civil    — coletar_estado_civil
[6] qualification_civil    — coletar_processo
[7] civil → renda          — (avanço automático)
[8] qualification_renda    — coletar_regime_trabalho
[9] qualification_renda    — coletar_renda_principal
[10] renda → eligibility   — (avanço automático)
```

---

## Invariantes preservados

- `src/core/engine.ts` — sem alteração
- `src/core/topo-parser.ts` / `meio-a-parser.ts` / `meio-b-parser.ts` — sem alteração
- `src/core/topo-gates.ts` / `meio-a-gates.ts` / `meio-b-gates.ts` — sem alteração
- LLM soberano da fala — não tocado
- Core soberano de stage/facts/gates — não tocado

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **104/104 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run smoke:core:funil-static` | **29/29 PASS** |
| `npm run smoke:core:funil-conversation` | **29/29 PASS** |

---

## Rollback

```bash
git revert 7481683
```

Seguro: apenas arquivos de teste e doc. Zero alteração em código de produção.
