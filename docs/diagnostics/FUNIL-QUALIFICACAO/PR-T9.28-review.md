# PR-T9.28-review — 3 gaps C4/C6

**Data:** 2026-05-09
**Branch:** fix/t9.28-gaps-c4-c6
**Commit:** 3ac9f49
**PR:** #265
**Tipo:** PR-IMPL / correcao_incidental
**Diagnóstico base:** docs/diagnostics/FUNIL-QUALIFICACAO/32-gap-analysis-c4-c6.md

---

## Escopo

`src/core/text-extractor.ts` (2 fixes) e `src/core/topo-parser.ts` (1 fix).
Zero diff em engine.ts, canary-pipeline.ts, semantic-next-objective.ts, supabase/, llm/, panel-nextjs/.

---

## FIX 1 — Guard P3 no bloco keyword estado_civil (GAP-C4)

**Arquivo:** `src/core/text-extractor.ts` — função `extractQualificationCivil`

**Problema:** Quando stage era `qualification_civil` e `pendingObjective='coletar_estado_civil_p3'`, o bloco keyword de `estado_civil` (linhas ~342-361) disparava normalmente. Cliente respondia "Casada no civil" (referindo-se ao familiar/P3), mas o bloco capturava `estado_civil='casado_civil'` para o lead principal — sobrescrevendo o valor correto (ex: 'solteiro'). Core recebia `estado_civil='casado_civil'` e ativava Gate 2 incorretamente (`corrigir_processo_para_conjunto`).

**Fix:**
```typescript
// ANTES:
if (facts['estado_civil'] === undefined) {

// DEPOIS:
if (facts['estado_civil'] === undefined && pendingObjective !== 'coletar_estado_civil_p3') {
```

O bloco `estado_civil_p3` em `extractQualificationCivil` (linhas ~425-444) já existia e captura corretamente para P3. O guard elimina apenas o falso positivo no bloco de lead principal.

---

## FIX 2 — Nacionalidade conservadora (GAP-C6A)

**Arquivo:** `src/core/text-extractor.ts` — função `extractDiscovery`

**Problema:** Bloco `nacionalidade` em `extractDiscovery` usava keyword bare `'brasileiro'`. Quando cliente respondia "Nao tenho familiar brasileiro" (pendingObjective=`verificar_alternativa_rnm`), o extractor capturava `nacionalidade='brasileiro'` — sobrescrevendo o valor persistido `'estrangeiro'`. Core recebia `nacionalidade='brasileiro'`, pulava todos os gates de RNM e avançava para `qualification_civil` incorretamente.

**Fix:** Bloco substituído por 2 camadas:

```typescript
if (facts['nacionalidade'] === undefined) {
  // Camada 1: contextual — pendingObjective certo aceita keywords bare
  if (pendingObjective === 'perguntar_nacionalidade') {
    if (contains(n, 'brasileiro', 'brasileira', 'nasci no brasil', 'sou do brasil')) {
      facts['nacionalidade'] = 'brasileiro';
    } else if (contains(n, 'estrangeiro', 'estrangeira', 'nasci fora',
        'nao sou brasileiro', 'nao sou brasileira')) {
      facts['nacionalidade'] = 'estrangeiro';
    } else if (contains(n, 'naturalizado', 'naturalizada', 'naturalizacao')) {
      facts['nacionalidade'] = 'naturalizado';
    }
  }
  // Camada 2: fallback conservador — exige frases específicas
  if (facts['nacionalidade'] === undefined) {
    if (contains(n, 'sou brasileiro', 'sou brasileira', 'nasci no brasil', 'sou do brasil')) {
      facts['nacionalidade'] = 'brasileiro';
    } else if (contains(n, 'sou estrangeiro', 'sou estrangeira',
        'nao sou brasileiro', 'nao sou brasileira', 'sou de outro pais', 'sou imigrante')) {
      facts['nacionalidade'] = 'estrangeiro';
    } else if (contains(n, 'naturalizado', 'naturalizada', 'naturalizacao')) {
      facts['nacionalidade'] = 'naturalizado';
    }
  }
}
```

**Por que conservador no fallback:**
- "Nao tenho familiar brasileiro" → não bate `'sou brasileiro'` nem `'nasci no brasil'` → não captura ✓
- "Sou brasileiro" → bate `'sou brasileiro'` → captura ✓
- "Brasileiro" com pendingObjective=`perguntar_nacionalidade` → camada 1 captura ✓

---

## FIX 3 — normalizeAlternativaRnm expande (GAP-C6B)

**Arquivo:** `src/core/topo-parser.ts`

**Problema:** `normalizeAlternativaRnm` reconhecia apenas 3 valores canônicos. T9.27 adicionou `sem_familiar_brasileiro` e `sem_conjuge_brasileiro` como valores emitidos pelo text-extractor, mas `topo-parser.ts` retornava `null` para eles. Core calculava `alternativaRnm=null` → Gate 4A disparava novamente (`verificar_alternativa_rnm`) → loop infinito.

**Fix:**
```typescript
// ANTES:
if (raw === 'sem_alternativa') return 'sem_alternativa';

// DEPOIS:
if (
  raw === 'sem_alternativa' ||
  raw === 'sem_familiar_brasileiro' ||
  raw === 'sem_conjuge_brasileiro'
) {
  return 'sem_alternativa';
}
```

Ambos os novos valores mapeiam para `'sem_alternativa'` — Gate 4B dispara (`encerrar_sem_alternativa_rnm`) e o fluxo é encerrado corretamente.

---

## Testes

`smoke:core:text-extractor` **124/124 PASS** (era 118)

Novos: CTX37a, CTX37b, CTX38a, CTX38b, CTX39, CTX40
