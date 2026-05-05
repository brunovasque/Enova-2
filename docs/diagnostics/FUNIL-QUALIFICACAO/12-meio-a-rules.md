# src/core/meio-a-rules.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: L07 + L08 + L09 + L10 — Regras e Política do Meio A

---

## Cabeçalho e âncora contratual

```typescript
/**
 * ENOVA 2 — Core Mecânico 2 — Regras e Política do Meio A (L07 + L08 + L09 + L10)
 *
 * Cláusula-fonte:  L-05 e L-06 (CLAUSE_MAP — estado civil e composição familiar)
 * Bloco legado:    L07 + L08 + L09 + L10 — Meio A: composição familiar
 * Página-fonte:    PDF mestre, bloco L07/L08:
 *   - taxonomia F2: estado civil, processo, composition_actor
 *   - regra: casado civil implica processo conjunto
 *   - regra: união estável pode seguir solo ou conjunto
 *   - regra: solteiro pode seguir solo ou em composição
 *   - p3_required: se precisa terceiro participante
 *   - dependents_count / dependents_applicable: dependente só quando fizer sentido
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo só define ESTRUTURA e POLÍTICA do Meio A.
 * Não há fala, phrasing ou resposta ao cliente.
 */
```

---

## Facts do Meio A

```typescript
export const MEIO_A_REQUIRED_FACTS = ['estado_civil', 'processo'] as const;

export const MEIO_A_OPTIONAL_FACTS = [
  'composition_actor',
  'p3_required',
  'dependents_applicable',
  'dependents_count',
] as const;
```

---

## Tipos canônicos

```typescript
export type EstadoCivil =
  | 'solteiro'
  | 'uniao_estavel'
  | 'casado_civil'
  | 'divorciado'
  | 'viuvo';

export type ProcessoMode =
  | 'solo'
  | 'conjunto'
  | 'composicao_familiar';

export type CompositionActor =
  | 'conjuge'
  | 'parceiro'
  | 'pai'
  | 'mae'
  | 'irmao'
  | 'outro';

export type MeioAParseStatus = 'ready' | 'partial' | 'empty';
```

---

## Condições de bloqueio

```typescript
export const MEIO_A_BLOCKING_CONDITIONS = {
  FACTO_CRITICO_AUSENTE:              'meio_a.facto_critico_ausente',
  PROCESSO_INVALIDO_PARA_ESTADO_CIVIL: 'meio_a.processo_invalido_para_estado_civil',
  COMPOSICAO_SEM_ATOR:                'meio_a.composicao_sem_actor',
  DEPENDENTE_SEM_QUANTIDADE:          'meio_a.dependente_sem_quantidade',
  P3_REQUER_ROTEAMENTO:               'meio_a.p3_requer_roteamento',
} as const;
```

| Código | Semântica |
|--------|-----------|
| `facto_critico_ausente` | `estado_civil` ou `processo` ausentes |
| `processo_invalido_para_estado_civil` | `casado_civil` + `processo ≠ conjunto` |
| `composicao_sem_actor` | `processo=composicao_familiar` + sem `composition_actor` |
| `dependente_sem_quantidade` | `dependents_applicable=true` + sem `dependents_count` |
| `p3_requer_roteamento` | P3 detectado — reservado para uso futuro (L09/L10) |

---

## Critério de avanço

```typescript
export const MEIO_A_ADVANCE_CRITERIA = {
  TRILHO_VALIDO_ESTRUTURAL: 'meio_a.trilho_valido_estrutural',
} as const;
```

---

## Transições autorizadas

```typescript
export const MEIO_A_NEXT_STEP = {
  ADVANCE_TO_RENDA:              'qualification_renda',
  REMAIN_IN_QUALIFICATION_CIVIL: 'qualification_civil',
} as const;
```

**Único destino ao avançar:** `qualification_renda`. Não há ramificação direta do Meio A para `qualification_special` — a bifurcação P3 ocorre em `qualification_eligibility` (via engine.ts).

---

## Política de sinais de trilho

```typescript
export const MEIO_A_SIGNAL_POLICY = {
  CASADO_CIVIL_FORCA_CONJUNTO:      'casado_civil_forca_conjunto',
  COMPOSICAO_RELEVANTE_DETECTADA:   'composicao_relevante_detectada',
  COMPOSICAO_COMPLEXA_P3:           'composicao_complexa_p3',
  DEPENDENTE_APLICAVEL:             'dependente_aplicavel',
  TRILHO_VALIDO_SEM_COMPOSICAO:     'trilho_valido_sem_composicao',
} as const;
```

| Sinal | Disparado quando |
|-------|-----------------|
| `casado_civil_forca_conjunto` | Gate 2 bloqueado: casado civil com processo errado |
| `composicao_relevante_detectada` | Gate 3 bloqueado: composição sem ator; ou avanço com composition_actor confirmado |
| `composicao_complexa_p3` | Avanço com `p3_required=true` (P3 sinalizado) |
| `dependente_aplicavel` | Gate 4 bloqueado; ou avanço com dependentes confirmados |
| `trilho_valido_sem_composicao` | Avanço sem composição adicional pendente (default) |

---

## Regras Vasques F2 — mapeamento contrato → implementação

| # | Regra Vasques | Status no Core |
|---|---------------|---------------|
| R1 | casado civil → processo obrigatoriamente conjunto | **IMPLEMENTADO** — Gate 2 (meio-a-gates.ts:52) |
| R2 | união estável ≠ casamento; não obriga conjunto | **IMPLEMENTADO** — nenhum gate bloqueia `uniao_estavel + solo` |
| R3 | solteiro com composição = solo + rota composição voluntária | **IMPLEMENTADO** — `solteiro + composicao_familiar` aceito; Gate 3 coleta composition_actor |
| R4 | avô/avó >67 anos → alertar risco CEF sem bloquear | **NÃO IMPLEMENTADO** — `composition_actor` tem `outro` mas sem verificação de idade |
| R5 | dependente condicional | **IMPLEMENTADO** — `dependents_required = processo≠conjunto && dependents_applicable=true` |
| R6 | financiamentos_conjunto NUNCA = financiamento anterior | **NÃO IMPLEMENTADO** — sem fact `financiamentos_conjunto` no Meio A |
| R7 | identificar candidatos composição sem prometer aprovação | **PARCIAL** — `composition_actor` capturado; sem lógica de "candidatos" |
| R8 | familiar casado civil → cônjuge desse familiar entra (P3 cascading) | **NÃO IMPLEMENTADO** — `p3_required` detecta P3 mas sem cascading automático |
| R9 | base normativa MCMV/CEF = lacuna declarada (LF-05) | **NÃO IMPLEMENTADO** — lacuna declarada no contrato T5 |

---

## Lacunas do Meio A (derivadas da análise)

| Lacuna | Descrição | Impacto |
|--------|-----------|---------|
| Idade de `composition_actor` | Sem verificação de idade para avô/avó (R4) | Alerta CEF não emitido |
| `financiamentos_conjunto` | Fact não existe no schema atual do Meio A | R6 não verificada |
| P3 cascading | `p3_required=true` sinalizado mas sem lógica de iteração (R8) | Cônjuge do P3 não é coletado automaticamente |
| `composition_actor = 'outro'` | Tipo genérico sem discriminação de relação | Dados insuficientes para avaliação CEF |

---

## Comparação Meio A vs. Topo (rules)

| Aspecto | Topo (topo-rules.ts) | Meio A (meio-a-rules.ts) |
|---------|---------------------|--------------------------|
| Facts required | `customer_goal`, `nome_completo`, `nacionalidade` | `estado_civil`, `processo` |
| Facts opcionais | `channel_origin`, `current_intent` | `composition_actor`, `p3_required`, `dependents_applicable`, `dependents_count` |
| Tipos de bloqueio | 4 (customer_goal, nome, nacionalidade, rnm) | 5 (facto_critico, processo_invalido, composicao_sem_ator, dependente_sem_quantidade, p3_roteamento) |
| Advance criteria | `TOPO_MINIMO_COMPLETO` | `TRILHO_VALIDO_ESTRUTURAL` |
| Next step ao avançar | `qualification_civil` | `qualification_renda` |
| Sinais de trilho | `ON_TRACK`, `OFFTRACK_DETECTED` | 5 sinais distintos de composição |
