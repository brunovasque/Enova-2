# PR-T9.20b-review — sandwich pattern: instrução obrigatória âncora dupla

**PR:** #257 — https://github.com/brunovasque/Enova-2/pull/257
**Branch:** `fix/t9.20b-system-prompt-sandwich`
**Base:** `main` (commit `d1c188f` — estado pós-PR #256)
**Commit:** `15441de`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, substituição de buildDynamicSystemPrompt

---

## Problema corrigido

Após T9.20, o `next_objective` aparecia apenas uma vez no prompt dinâmico. Em modelos que
dão peso maior ao meio do contexto, a instrução podia ser diluída pelo SYSTEM_PROMPT_BASE
(regras de negócio) e pelo contexto situacional. O LLM ainda podia seguir a sequência de
referência em vez da instrução específica do turno.

---

## Mudança — novo buildDynamicSystemPrompt (sandwich pattern, 5 blocos)

```
BLOCO 1 — INSTRUÇÃO OBRIGATÓRIA (next_objective) — VEM PRIMEIRO
   "INSTRUÇÃO OBRIGATÓRIA — LEIA ANTES DE QUALQUER COISA:"
   "Você deve executar EXATAMENTE e APENAS isto agora:"
   {next_objective}
   "NÃO faça nada além disso. NÃO antecipe. NÃO reordene."

BLOCO 2 — SYSTEM_PROMPT_BASE (identidade, tom, regras de negócio MCMV)
   [conteúdo inalterado]

BLOCO 3 — SEQUÊNCIA DE REFERÊNCIA (11 etapas declarativas)
   "SEQUÊNCIA DO ATENDIMENTO (referência de contexto — quem manda é a INSTRUÇÃO acima):"
   1. Apresentar-se + verificar MCMV
   2. Nome completo
   3. Nacionalidade → RNM se estrangeiro
   4. Estado civil
   5. Processo (solo/conjunto/composição) + regras de casamento civil
   6. Regime de trabalho
   7. Renda mensal → autônomo/IR/dependentes
   8. Contexto (onde mora/trabalha/compra)
   9. Elegibilidade (restrição/FGTS/entrada/parcela)
   10. Documentos
   11. Correspondente → visita

BLOCO 4 — SITUAÇÃO ATUAL (facts ✓ + histórico)
   "SITUAÇÃO ATUAL DO ATENDIMENTO:"
   Já coletado: ✓ nome_completo: ...
   Últimas mensagens: ...

BLOCO 5 — LEMBRETE FINAL (âncora dupla)
   "LEMBRETE FINAL — ANTES DE RESPONDER:"
   "Sua única ação neste turno é executar a INSTRUÇÃO OBRIGATÓRIA do início."
   "A sequência acima é referência de contexto — não substitui a instrução."
   "Uma pergunta só. Não antecipe. Não reordene."
```

---

## Invariantes preservados

- `SYSTEM_PROMPT_BASE` — conteúdo sem alteração (bloco 2 intacto)
- Facts internos (`_*`) filtrados — preservado
- Limite 8000 chars — preservado
- `callLlm`, `LlmContext`, `LLM_MODEL`, `LLM_MAX_TOKENS`, `LLM_TEMPERATURE` — sem alteração
- Zero diff fora de `src/llm/client.ts`
- LLM soberano da fala; Core soberano de stage/facts/gates

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **103/103 PASS** |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Critério de sucesso (pós-deploy — requer Vasques)

Mesmo critério T9.20: 7 turnos sem loop, seguindo `next_objective` do Core.
Adicional: LLM não deve seguir a sequência de referência autonomamente — deve
seguir a instrução do turno mesmo quando a sequência sugere etapa diferente.

---

## Rollback

```bash
git revert 15441de
```

Seguro: 1 arquivo, strings, zero schema, zero migration, zero flags.
