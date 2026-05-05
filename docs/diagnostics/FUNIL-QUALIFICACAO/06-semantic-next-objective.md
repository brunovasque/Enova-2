# src/core/semantic-next-objective.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: T9.15F — Mapper Semântico de next_objective

---

## Cabeçalho e invariáveis

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Mapper Semântico de next_objective (T9.15F)
 *
 * Converte códigos internos opacos de next_objective em instruções semânticas
 * humanamente compreensíveis antes de chegarem ao LLM.
 *
 * INVIOLÁVEL: este mapper NÃO altera a decisão do Core (stage, block_advance, gates).
 * Apenas transforma a string next_objective em instrução acionável para a LLM.
 * O Core permanece soberano. O LLM recebe objetivo humano — nunca código interno.
 *
 * Lacunas (códigos sem mapeamento): retorna o código original sem modificação.
 * Isso permite detectar lacunas em smoke sem quebrar o pipeline.
 *
 * Ponto de aplicação: canary-pipeline.ts, na montagem de LlmContext.
 * NÃO aplicar no Core Engine — Core emite códigos estruturais, mapper é camada de tradução.
 */
```

---

## SEMANTIC_MAP — Mapeamentos definidos

```typescript
const SEMANTIC_MAP: Readonly<Record<string, string>> = {

  // --- Topo (discovery) ---
  'coletar_customer_goal':
    'Perguntar se o cliente tem interesse em comprar um imóvel pelo Minha Casa Minha Vida.',

  'explicar_mcmv_e_coletar_nome_completo':
    'Explicar rapidamente que o Minha Casa Minha Vida pode facilitar a compra do imóvel com condições melhores conforme o perfil e pedir o nome completo.',

  'perguntar_nacionalidade':
    'Perguntar se o cliente é brasileiro(a) ou estrangeiro(a).',

  'perguntar_rnm_e_validade':
    'Perguntar se o cliente estrangeiro possui RNM válido e se o documento é por prazo indeterminado.',

  // Topo → civil: já semi-semântico na origem (TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL)
  // Mapper padroniza para versão canônica com "(a)".
  'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',

  // --- Meio A (qualification_civil) ---
  'coletar_estado_civil':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',

  'avancar_para_qualification_civil':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',

  'coletar_processo':
    'Perguntar se pretende comprar sozinho(a) ou com alguém.',

  'avancar_para_qualification_renda':
    'Perguntar regime de trabalho e renda mensal.',

  // --- Meio B (qualification_renda) ---
  'coletar_regime_trabalho':
    'Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime.',

  'coletar_renda_principal':
    'Perguntar a renda mensal aproximada.',
};
```

---

## Funções exportadas

```typescript
// Converte código opaco → instrução semântica. Fallback: retorna código original.
export function toSemanticNextObjective(code: string): string {
  return SEMANTIC_MAP[code] ?? code;
}

// Verifica se código tem mapeamento (útil para smoke / diagnóstico de lacunas).
export function hasSemanticMapping(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(SEMANTIC_MAP, code);
}

// Retorna todos os mapeamentos — para inspeção e testes.
export function getAllSemanticMappings(): Readonly<Record<string, string>> {
  return SEMANTIC_MAP;
}
```

---

## Tabela completa de mapeamentos

| Código interno (Core emite) | Instrução semântica (LLM recebe) |
|---|---|
| `coletar_customer_goal` | Perguntar se o cliente tem interesse em comprar um imóvel pelo Minha Casa Minha Vida. |
| `explicar_mcmv_e_coletar_nome_completo` | Explicar rapidamente que o MCMV pode facilitar a compra com condições melhores e pedir o nome completo. |
| `perguntar_nacionalidade` | Perguntar se o cliente é brasileiro(a) ou estrangeiro(a). |
| `perguntar_rnm_e_validade` | Perguntar se o cliente estrangeiro possui RNM válido e se o documento é por prazo indeterminado. |
| `Perguntar estado civil: solteiro, casado, união estável ou divorciado.` | Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a). |
| `coletar_estado_civil` | Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a). |
| `avancar_para_qualification_civil` | Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a). |
| `coletar_processo` | Perguntar se pretende comprar sozinho(a) ou com alguém. |
| `avancar_para_qualification_renda` | Perguntar regime de trabalho e renda mensal. |
| `coletar_regime_trabalho` | Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime. |
| `coletar_renda_principal` | Perguntar a renda mensal aproximada. |

---

## Cobertura e lacunas

### Coberto (11 mapeamentos)
- Topo completo: 4 gates (customer_goal, nome, nacionalidade, RNM) + transição civil
- Meio A: estado_civil, processo, avanço para renda
- Meio B inicial: regime_trabalho, renda_principal

### Não coberto (retorna código original como fallback)
- Trilhos P3 e composição complexa
- qualification_special
- qualification_eligibility
- docs_prep, docs_collection
- broker_handoff, visit

### Comportamento de lacuna (intencionalmente não-fatal)
```typescript
toSemanticNextObjective('codigo_desconhecido')
// → 'codigo_desconhecido'   (retorna o próprio código)
// O pipeline não quebra; smoke detecta lacuna pelo hasSemanticMapping()
```

---

## Ponto de aplicação no pipeline

```
canary-pipeline.ts (linha 404):
  next_objective: toSemanticNextObjective(coreDecision.next_objective),
```

O mapper é aplicado **após** a decisão do Core e **antes** da montagem do `LlmContext`. O Core emite o código estrutural; o mapper traduz; o LLM recebe a instrução humana.

---

## Posição arquitetural

```
Core Engine (engine.ts)
  → emite: next_objective = 'coletar_customer_goal'  (código opaco estrutural)
  ↓
semantic-next-objective.ts (toSemanticNextObjective)
  → traduz: 'Perguntar se o cliente tem interesse em comprar um imóvel pelo MCMV.'
  ↓
LlmContext.next_objective
  → LLM recebe instrução humana direta
  → LLM é soberano da fala — decide como formular a pergunta
```
