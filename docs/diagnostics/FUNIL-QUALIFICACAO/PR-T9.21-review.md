# PR-T9.21-review — sequência F1→F2: estado_civil antes de processo + nome contextual no greeting

**PR:** #258 — https://github.com/brunovasque/Enova-2/pull/258
**Branch:** `fix/t9.21-sequencia-f1-f2`
**Base:** `main` (commit `aac32af` — estado pós-PR #257)
**Commit:** `a0b4fe0`
**Data:** 2026-05-08
**Tipo:** PR-IMPL — correcao_incidental — 3 arquivos

---

## Problemas corrigidos

**Bug 1 — Greeting emitia duas ações num turno:**
`apresentar_e_verificar_conhecimento` pedia "conhece MCMV?" e "qual seu nome?" no mesmo turno,
violando a regra de uma pergunta por vez.

**Bug 2 — `avancar_para_qualification_civil` pulava estado_civil:**
O mapeamento semântico emitia "perguntar processo (sozinho/conjunto)" em vez de "perguntar estado_civil".
O estado_civil nunca era perguntado antes de processo, quebrando a sequência F1→F2.

**Bug 3 — nome_completo não era capturado quando cliente respondia junto:**
"Não conheço, sou Bruno Vasques" não capturava nome porque a heurística conservadora só captura
textos com 2-5 palavras sem palavras funcionais.

---

## Mudanças

### `src/core/semantic-next-objective.ts`

**Fix A** — `apresentar_e_verificar_conhecimento`:
```
ANTES:
  Fazer UMA pergunta simples: o cliente já conhece o programa Minha Casa Minha Vida?
  + Se responder que conhece: dizer "Ótimo!" e perguntar o nome completo para iniciar.
  + Se responder que não conhece: explicar em 1 frase curta [...] e já pedir o nome completo.
  + Em qualquer caso: encerrar a mensagem pedindo o nome completo.

DEPOIS:
  Apresente-se como Enova, especialista em Minha Casa Minha Vida.
  Faça APENAS UMA pergunta: o cliente já conhece o programa Minha Casa Minha Vida?
  NÃO peça nome neste turno. NÃO faça mais nenhuma pergunta.
  Aguarde a resposta antes de continuar.
```

**Fix B** — `avancar_para_qualification_civil` e literal key `'Perguntar estado civil: ...'`:
```
ANTES (ambos):
  Perguntar APENAS se o cliente pretende comprar sozinho(a) ou terá alguém junto
  no processo — cônjuge, familiar ou parceiro(a). Uma pergunta só. Não perguntar mais nada.

DEPOIS (ambos):
  Perguntar APENAS o estado civil do cliente:
  solteiro(a), casado(a) no civil, união estável ou divorciado(a)/viúvo(a).
  Uma pergunta só. Não perguntar mais nada.
```

### `src/core/text-extractor.ts`

**Fix C** — captura contextual de `nome_completo` em `extractDiscovery`:

```typescript
if (facts['nome_completo'] === undefined) {
  if (
    pendingObjective === 'apresentar_e_verificar_conhecimento' ||
    pendingObjective === 'Apresente-se como Enova...'  // nova instrução semântica
  ) {
    const nomeMatch = original.match(
      /(?:sou|me chamo|meu nome[eé é]+|chamo[- ]me)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)+)/i
    );
    if (nomeMatch) {
      facts['nome_completo'] = nomeMatch[1];
    }
  }
}
```

Nota: regex aplicado a `original` (não a `n` normalizado) para preservar casing correto.

### `src/core/text-extractor-smoke.ts`

**CTX23** — novo caso de teste:
```typescript
eq('CTX23: "Não conheço, sou Bruno Vasques" + pendingObjective=apresentar_e_verificar_conhecimento → nome_completo=Bruno Vasques',
  extractFactsFromText('Não conheço, sou Bruno Vasques', 'discovery', 'apresentar_e_verificar_conhecimento')['nome_completo'],
  'Bruno Vasques');
```

---

## Invariantes preservados

- `src/core/engine.ts` — sem alteração
- `src/core/meio-a-gates.ts` — sem alteração
- `src/core/meio-a-parser.ts` — sem alteração
- `src/llm/client.ts` — sem alteração
- Extrator é função pura: zero I/O, zero side effects
- LLM soberano da fala; Core soberano de stage/facts/gates

---

## Resultados de teste

| Suite | Resultado |
|---|---|
| `npm run smoke` (core) | **PASS** |
| `npm run smoke:core:text-extractor` | **104/104 PASS** (CTX23 adicionado) |
| `npm run smoke:meta:canary` | **41/41 PASS** |
| `npm run prove:t9.15h-facts-persistence` | **34/34 PASS** |
| `npm run prove:t9.14-reverse-mapper` | **19/19 PASS** |

---

## Sequência correta após esta PR

```
Turno 1: Enova se apresenta + pergunta se conhece MCMV → cliente responde
Turno 2: pergunta nome completo (ou captura do turno 1 se cliente forneceu junto)
Turno 3: pergunta nacionalidade
Turno 4: pergunta estado civil (via avancar_para_qualification_civil)
Turno 5: pergunta processo (solo/conjunto/composição)
Turno 6: pergunta regime de trabalho
Turno 7: pergunta renda
```

---

## Rollback

```bash
git revert a0b4fe0
```

Seguro: 3 arquivos, strings + 1 caso de teste, zero schema, zero migration, zero flags.
