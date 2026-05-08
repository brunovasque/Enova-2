# PR-T9.20-review — SYSTEM_PROMPT_BASE: remove FUNIL MCMV + contexto dinâmico estruturado

**PR:** #256 — https://github.com/brunovasque/Enova-2/pull/256
**Branch:** `fix/t9.20-system-prompt-contexto-dinamico`
**Base:** `main` (commit `32a62b0` — estado pós-PR #255)
**Commit:** `b5f2260`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 1 arquivo, 2 blocos

---

## Problema corrigido

O `SYSTEM_PROMPT_BASE` continha o mapa do funil F1–F10 por stage. O LLM via
`stage_current=discovery` no contexto dinâmico e agia pelo mapa interno, ignorando o
`next_objective` emitido pelo Core. Resultado: loop — perguntas repetidas mesmo após o
Core ter avançado internamente.

**Causa raiz:** duas fontes de instrução concorrentes:
- SYSTEM_PROMPT_BASE dizia "em discovery, colete nome e nacionalidade"
- next_objective dizia "pergunte processo (solo/conjunto)"
- LLM priorizava o BASE por estar no topo do contexto

**Diagnóstico:** `docs/diagnostics/FUNIL-QUALIFICACAO/CONTRATO-T9.20-SYSTEM-PROMPT-MAPA-LINEAR.md`

---

## Mudanças

### Mudança 1 — `src/llm/client.ts`: SYSTEM_PROMPT_BASE

Removida a seção `FUNIL MCMV — SEQUÊNCIA MACRO` (F1–F10, 12 linhas):

```
// REMOVIDO:
'FUNIL MCMV — SEQUÊNCIA MACRO:\n' +
'F1 Topo: interesse inicial → ...\n' +
'F2 Perfil civil/composição: ...\n' +
'F3 Contexto de moradia e compra: ...\n' +
'F4 Perfil socioeconômico: ...\n' +
'F5 Renda e formalização: ...\n' +
'F6 Elegibilidade e riscos: ...\n' +
'F7 Pré-análise: ...\n' +
'F8 Documentos: ...\n' +
'F9 Correspondente: ...\n' +
'F10 Visita: ...\n' +
'\n' +
```

**Mantidas integralmente:** MISSÃO, EM CADA TURNO, REGRAS INVIOLÁVEIS, TOM E POSTURA,
todas as REGRAS DE NEGÓCIO (RNM, estado civil, composição, renda, dependentes, documentos,
restrição, divorciado/viúvo, correspondente, visita), DÚVIDAS FORA DE HORA, FECHAMENTO.

---

### Mudança 2 — `src/llm/client.ts`: buildDynamicSystemPrompt

**ANTES (estrutura antiga):**
```
SYSTEM_PROMPT_BASE
OBJETIVO ATUAL — execute agora: {next_objective}
REGRA: faça apenas esta ação...
--- CONTEXTO DO ATENDIMENTO ATUAL ---
Etapa: {stage_current}
Próxima etapa ao avançar: {stage_after}
Intenção: {speech_intent}
Dados já coletados:
  key: value
Últimas mensagens:
  Cliente: ...
  Enova: ...
```

**DEPOIS (estrutura nova):**
```
SYSTEM_PROMPT_BASE
=== SUA TAREFA NESTE TURNO ===
{next_objective}
REGRA ABSOLUTA: execute apenas esta tarefa. Uma pergunta só. Não antecipe.

=== SITUAÇÃO ATUAL DO ATENDIMENTO ===
Já coletado:
  ✓ nome_completo: Bruno Vasques
  ✓ nacionalidade: brasileiro
  ✓ customer_goal: comprar_imovel
Últimas mensagens:
  Cliente: solteiro
  Enova: Entendido! Você pretende comprar sozinho ou com alguém?

=== FIM DO CONTEXTO ===
```

**Eliminado:** `stage_current`, `stage_after`, `speech_intent` do contexto dinâmico.
O LLM não precisa saber o stage — só precisa executar a tarefa.

---

## Invariantes preservados

- LLM soberano da fala — SYSTEM_PROMPT_BASE instrui, não roteiriza
- Core soberano de stage, facts e gates — zero alteração no Core
- Facts internos (`_*`) filtrados do prompt — preservado
- Limite 8000 chars — preservado
- `callLlm`, `LlmContext`, `LLM_MODEL`, `LLM_MAX_TOKENS`, `LLM_TEMPERATURE` — sem alteração
- Zero diff fora de `src/llm/client.ts`

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

1. "Oi" → Enova se apresenta e pergunta se conhece MCMV
2. "Sim" → pergunta nome completo
3. "Bruno Vasques" → pergunta nacionalidade
4. "Brasileiro" → pergunta estado civil
5. "Solteiro" → pergunta processo (sozinho ou com alguém)
6. "Sozinho" → pergunta regime de trabalho
7. "CLT" → pergunta renda

7/7 sem loop → T9.20 aprovado.

---

## Rollback

```bash
git revert b5f2260
```

Seguro: 1 arquivo, strings, zero schema, zero migration, zero flags.
