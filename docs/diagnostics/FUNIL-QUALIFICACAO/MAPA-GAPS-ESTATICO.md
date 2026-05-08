# MAPA-GAPS-ESTATICO — T9.22

**Data:** 2026-05-08
**Branch:** `fix/t9.22-funil-test-suite`
**Suites:** `funil-static-diagnostic.ts` (29/29) · `funil-conversation-smoke.ts` (29/29)

---

## Output do diagnóstico estático

```
=== DISCOVERY — Topo do funil ===
  ✓ [D1]    sem facts → block_advance=true
  ✓ [D1b]   sem facts → stage_after=discovery
  ✓ [D1c]   sem facts → next_objective=apresentar_e_verificar_conhecimento
  ✓ [D2]    customer_goal=comprar_imovel, sem nome → block_advance=true
  ✓ [D2b]   next_objective=explicar_mcmv_e_coletar_nome_completo
  ✓ [D3]    customer_goal+nome, sem nacionalidade → block_advance=true
  ✓ [D3b]   next_objective=perguntar_nacionalidade
  ✓ [D4]    topo completo → block_advance=false
  ✓ [D4b]   topo completo → stage_after=qualification_civil
  ✓ [D5]    estrangeiro sem rnm_valido → block_advance=true
  ✓ [D5b]   next_objective=perguntar_rnm_e_validade

=== QUALIFICATION_CIVIL — Meio A ===
  ✓ [C1]    sem facts → block_advance=true / stage_after=qualification_civil
  ✓ [C1c]   next_objective=coletar_estado_civil
  ✓ [C2]    estado_civil=solteiro, sem processo → block_advance=true
  ✓ [C2b]   next_objective=coletar_processo
  ✓ [C3]    estado_civil+processo=solo → block_advance=false / stage_after=qualification_renda
  ✓ [C4]    casado sem processo → block_advance=true

=== QUALIFICATION_RENDA — Meio B Renda ===
  ✓ [R1]    sem facts → block_advance=true / next_objective=coletar_regime_trabalho
  ✓ [R2]    regime=clt, sem renda → block_advance=true
  ✓ [R3]    regime+renda → block_advance=false / stage_after=qualification_eligibility

=== QUALIFICATION_ELIGIBILITY — Meio B Elegibilidade ===
  ✓ [E1]    sem nacionalidade → block_advance=true
  ✓ [E2]    brasileiro → block_advance=false

=== SEQUÊNCIA CANÔNICA — Lead modelo completo ===
  ✓ [SEQ-discovery]           → qualification_civil   (block=false)
  ✓ [SEQ-qualification_civil] → qualification_renda   (block=false)
  ✓ [SEQ-qualification_renda] → qualification_eligibility (block=false)

━━━ RESULTADO: 29 PASS / 0 FAIL ━━━
```

---

## Output do smoke de conversação

```
=== CONVERSA 1 — Brasileiro solteiro CLT (caminho dourado) ===
  Turno 1 — topo vazio       → next_objective=apresentar_e_verificar_conhecimento
  Turno 2 — customer_goal    → next_objective=explicar_mcmv_e_coletar_nome_completo
  Turno 3 — nome coletado    → next_objective=perguntar_nacionalidade
  Turno 4 — nacionalidade    → avança para qualification_civil (block=false)
  Turno 5 — sem estado_civil → next_objective=coletar_estado_civil
  Turno 6 — estado_civil     → next_objective=coletar_processo
  Turno 7 — processo=solo    → avança para qualification_renda (block=false)
  Turno 8 — sem regime       → block_advance=true
  Turno 9 — regime=clt       → block_advance=true (renda ausente)
  Turno 10 — renda=4500      → avança para qualification_eligibility (block=false)

=== CONVERSA 2 — Estrangeiro sem RNM (trilho de bloqueio) ===
  estrangeiro sem rnm        → next_objective=perguntar_rnm_e_validade
  rnm_valido=false           → next_objective=verificar_alternativa_rnm
  rnm_valido=true            → avança para qualification_civil (block=false)

=== CONVERSA 3 — Casado no civil (composição obrigatória) ===
  casado+solo                → block=true / next_objective=corrigir_processo_para_conjunto
  casado+conjunto            → avança para qualification_renda (block=false)

━━━ RESULTADO: 29 PASS / 0 FAIL ━━━
```

---

## Gaps identificados

### GAP-1 — `customer_goal` aceita apenas valores canônicos estritos

**Estágio:** discovery  
**Comportamento:** `customer_goal: 'comprar'` não é reconhecido. Apenas `'comprar_imovel'`, `'entender_programa'`, `'enviar_docs'`, `'visitar_imovel'`, `'outro'` são válidos.  
**Impacto:** O text-extractor deve mapear respostas como "quero comprar" → `'comprar_imovel'` antes de persistir. Se o LLM retornar um valor livre, o topo não avança.  
**Status:** Comportamento intencional conforme topo-parser.ts (VALID_CUSTOMER_GOALS). Não é bug — é restrição de interface. O text-extractor já normaliza.

### GAP-2 — Sequência discovery não verifica `nome_completo` via facts_current puro

**Estágio:** discovery  
**Comportamento:** O engine lê `nome_completo` de `facts_current` (mergeado) corretamente. Não há gap — o pipeline real persiste o nome_completo no Supabase e o carrega em `state.facts`.  
**Status:** Confirmado funcionando via D3 e D3b (PASS).

### GAP-3 — Stage `qualification_eligibility` avança sem verificar todos os facts de elegibilidade

**Estágio:** qualification_eligibility  
**Comportamento:** Com apenas `nacionalidade: 'brasileiro'`, o gate autoriza avanço (E2=PASS). Gates de documentação, renda e restrições especiais são avaliados em stages posteriores.  
**Status:** Comportamento intencional (design por layers). A elegibilidade mínima requer apenas `nacionalidade`. Gates mais refinados ficam nos stages `qualification_special` e `docs_prep`.

### GAP-4 — Stage `qualification_special` não tem teste nesta suite

**Estágio:** qualification_special  
**Motivo:** Trilhos P3 e multi-proponente ativados por condições específicas (casado_civil + p3_required, etc.) — fora do caminho dourado.  
**Status:** Lacuna intencional desta suite (T9.22 cobre o funil principal). Candidato para T9.23+ (trilhos especiais).

### GAP-5 — Stages `docs_prep`, `docs_collection`, `visit`, `broker_handoff` sem cobertura

**Motivo:** T9.22 foca no funil de qualificação (discovery → qualification_eligibility).  
**Status:** Lacuna documentada. Candidato para T9.24+ (final operacional).

---

## Sequência canônica confirmada (caminho dourado)

```
[1] discovery              → apresentar_e_verificar_conhecimento
[2] discovery              → explicar_mcmv_e_coletar_nome_completo
[3] discovery              → perguntar_nacionalidade
[4] discovery → civil      → (avanço automático ao completar topo)
[5] qualification_civil    → coletar_estado_civil
[6] qualification_civil    → coletar_processo
[7] qualification_civil → renda → (avanço automático)
[8] qualification_renda    → coletar_regime_trabalho
[9] qualification_renda    → coletar_renda_principal
[10] qualification_renda → eligibility → (avanço automático)
[11] qualification_eligibility → (avanço para docs_prep ou qualification_special)
```

Todos os passos da sequência verificados com gates reais. Zero regressão em relação a T9.21.

---

## Testes anteriores — sem regressão

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **104/104 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `funil-static-diagnostic.ts` | **29/29 PASS** |
| `funil-conversation-smoke.ts` | **29/29 PASS** |
