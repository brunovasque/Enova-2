# RNM Block, Greeting e Encerramento — Grep src/core/ e schema/implantation/
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)

---

## Grep 1: encerr|inelegiv|bloqueio|BLQ|fim_inelegivel|estrangeiro_bloqueado|rnm_block
### src/core/**/*.ts

```
engine.ts:117:      ? `resolver_bloqueio_${primaryBlock?.gate_id ?? 'desconhecido'}`
engine.ts:122:    ? 'bloqueio'
engine.ts:160:      ? 'bloqueio'
engine.ts:190:      ? 'bloqueio'
engine.ts:238:      ? 'bloqueio'
engine.ts:268:      ? 'bloqueio'
engine.ts:342:      ? 'bloqueio'
engine.ts:387:  const speechIntent: CoreDecision['speech_intent'] = blockAdvance ? 'bloqueio' : 'transicao_stage';
meio-a-rules.ts:60:// Critérios mínimos e bloqueios do Meio A
meio-b-rules.ts:67:  CTPS_ESTRATEGICA: 'ctps_estrategica_sem_bloqueio',
smoke.ts:68:      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
smoke.ts:92:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:119:      assert('Core não produz texto — apenas sinal de bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:179:      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
smoke.ts:235:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:287:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:312:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:362:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:414:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:464:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:592:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:617:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
smoke.ts:671:      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
topo-gates.ts:14: * Ele emite apenas decisão estrutural de avanço/bloqueio.
topo-gates.ts:59:   * Código do critério satisfeito ou do bloqueio ativo.
topo-rules.ts:84:// Condições de bloqueio do topo (L04 — política)
topo-rules.ts:153: * offtrack_type detectado: o lead pode estar desviando, mas o Core não encerra —
types.ts:138:  speech_intent: 'coleta_dado' | 'transicao_stage' | 'bloqueio'; // sinal estrutural
```

### Análise Grep 1

**`fim_inelegivel` / `estrangeiro_bloqueado` / `rnm_block`: AUSENTES no src/core/**

Nenhum desses termos existe em `src/core/`. O Core Mecânico 2 não tem conceito de "encerramento por inelegibilidade" implementado. Apenas:
- `speech_intent = 'bloqueio'` — sinal estrutural de bloqueio (não é encerramento)
- `block_advance = true` — bloqueia avanço no stage atual
- O lead **permanece no stage** — não é encerrado nem marcado inelegível

**Implicação crítica:** O Core não tem caminho de encerramento/inelegibilidade implementado atualmente. `fim_inelegivel` era um alias legado do Enova 1 (RM-03 — morto, não migrar). O encerramento por inelegibilidade (F4 — restrição) ficou para camadas futuras (L15+).

**`CTPS_ESTRATEGICA: 'ctps_estrategica_sem_bloqueio'`** (meio-b-rules.ts:67): sinal de que CTPS estratégica existe sem bloqueio associado — possivelmente uma lacuna de F3 (LF-09 ou similar).

---

## Grep 2: apresent|quebra_gelo|saudacao|greeting|intro|boas_vindas
### src/core/**/*.ts

```
(nenhum resultado)
```

### Análise Grep 2

**Greeting/saudação/quebra-gelo: COMPLETAMENTE AUSENTE do src/core/.**

O Core Mecânico 2 não tem nenhum conceito de apresentação, saudação ou quebra-gelo implementado. Isso é 100% coerente com a arquitetura:
- O Core emite apenas `next_objective` (instrução estrutural)
- O **LLM é soberano da fala** — decide quando e como se apresentar
- Nenhuma instrução de greeting está hardcoded no Core
- O mapper `semantic-next-objective.ts` também não tem mapeamento de saudação

**Ponto de atenção:** O turno 1 (primeiro contato) entra no Core com `state.facts = {}` e `stage = discovery`. O Core emite `next_objective = 'coletar_customer_goal'` → mapper traduz para `'Perguntar se o cliente tem interesse em comprar um imóvel pelo MCMV.'`. O LLM decide sozinho como formular — pode incluir saudação ou não.

---

## Grep 4: BLQ|block|inelegiv|encerr filtrado por rnm|estrangeiro|bloqueio
### schema/implantation/**/*.md

```
INVENTARIO_PARSERS_HEURISTICAS_T0.md:72:
  PH-R01 | regex | Validação de formato e validade de RNM | L04 |
  LEGADO_MESTRE linha 2383: "validar RNM antes de avançar" | RN-04 | ativo (inconclusivo — L04 não transcrito)
  Risco alto de negócio MCMV: regex errado = bloqueio indevido ou aceitação de RNM inválido

READINESS_G3.md:47:
  4 regras críticas: R_CASADO_CIVIL_CONJUNTO, R_AUTONOMO_IR, R_SOLO_BAIXA_COMPOSICAO, R_ESTRANGEIRO_SEM_RNM

READINESS_G3.md:52:
  Invariante R_ESTRANGEIRO: Bloqueio SOMENTE quando nationality.status = "confirmed" E RNM inválido — RC-INV-05

READINESS_G3.md:108:
  TC-REG-03 (RC-INV-05 — R_ESTRANGEIRO só bloqueia confirmed)

READINESS_G3.md:122:
  R_ESTRANGEIRO_SEM_RNM exige nationality.status = "confirmed" para emitir bloqueio

READINESS_G3.md:141:
  decisions[] = [bloqueio R_ESTRANGEIRO_SEM_RNM + obrigação R_CASADO_CIVIL_CONJUNTO + sugestão R_SOLO_BAIXA_COMPOSICAO]

T2_DICIONARIO_FATOS.md:197:
  derived_rnm_block | Bloqueio ativo por RNM inválido/ausente | derived_rnm_required=true + fact_rnm_status != "válido" | ativo

T3_ORDEM_AVALIACAO_COMPOSICAO.md:66:
  R_ESTRANGEIRO_SEM_RNM com nationality=confirmed; demais bloqueios hard

T3_ORDEM_AVALIACAO_COMPOSICAO.md:135:
  R_ESTRANGEIRO_SEM_RNM: fact_nationality.value="estrangeiro" E status="confirmed" E fact_rnm_status ∈ {sem_rnm, vencido, inválido}

T3_ORDEM_AVALIACAO_COMPOSICAO.md:163:
  Variante: nationality em captured (não permite bloqueio direto)

T3_ORDEM_AVALIACAO_COMPOSICAO.md:188:
  Variante obrigação: nationality estrangeiro confirmado E rnm_status ausente

T5_FATIA_TOPO_ABERTURA.md:201:
  fact_nationality em hypothesis NUNCA sustenta BLQ-F1-01

T5_FATIA_TOPO_ABERTURA.md:202:
  fact_nationality em captured NÃO sustenta BLQ-F1-01 diretamente — gera CONF-F1-02

T5_FATIA_TOPO_ABERTURA.md:209:
  BLQ-F1-01 cobre os casos {sem_rnm, vencido, inválido}

T5_FATIA_TOPO_ABERTURA.md:579:
  Regra RNM: validade indeterminada exigida — RNM com data de vencimento = bloqueio mesmo não expirado

T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md:136:
  inicio_rnm → fact_rnm_status, derived_rnm_block | BLQ-F1-01; somente para estrangeiros

T5_PLANO_SHADOW_SANDBOX.md:185:
  Resultado esperado: BLQ-F1-01 ativo; F1 não avança; orientação sobre obtenção de RNM indeterminado
```

### Análise Grep 4

---

## Análise consolidada: RNM block no schema vs. implementação no Core

### Contrato declarado (schema/implantation/)

| Artefato | Regra declarada |
|----------|----------------|
| `T3_ORDEM_AVALIACAO_COMPOSICAO.md:135` | `R_ESTRANGEIRO_SEM_RNM`: `nationality="estrangeiro"` + `status="confirmed"` + `rnm_status ∈ {sem_rnm, vencido, inválido}` |
| `READINESS_G3.md:52` | Bloqueio somente com `nationality.status = "confirmed"` (RC-INV-05) |
| `T5_FATIA_TOPO_ABERTURA.md:201-202` | `hypothesis` → NUNCA bloqueia; `captured` → CONF-F1-02 (não BLQ direto) |
| `T5_FATIA_TOPO_ABERTURA.md:579` | RNM com **validade determinada** (mesmo não expirado) = bloqueio |
| `T2_DICIONARIO_FATOS.md:197` | `derived_rnm_block` = fact derivado que indica bloqueio |

### Implementação atual (src/core/)

| Aspecto | Implementado? | Observação |
|---------|---------------|------------|
| Gate 4: `estrangeiro && !rnm_valido` | **SIM** (topo-gates.ts:147) | Bloqueia quando `rnm_valido` é `false` ou `null` |
| `nationality.status = "confirmed"` como pré-condição | **NÃO** | Core atual usa boolean simples; sem status de confiança |
| `hypothesis` nunca sustenta bloqueio | **N/A** | text-extractor não emite `hypothesis`; usa boolean direto |
| Distinção validade determinada/indeterminada | **NÃO** | text-extractor trata como binário (03-rnm-extractor.md — Lacuna LF-02) |
| `derived_rnm_block` como fact derivado | **NÃO** | Core calcula na hora via gate; não persiste `derived_rnm_block` |
| `fim_inelegivel` / encerramento por inelegibilidade | **NÃO** | Alias legado morto (RM-03); não implementado no Core Mecânico 2 |

### Divergências contrato ↔ implementação

1. **Status de confiança** (`confirmed` vs. `captured` vs. `hypothesis`): contrato T3 exige `nationality.status="confirmed"` para bloqueio RNM. Core atual não tem esse conceito — Gate 4 bloqueia com qualquer `rnm_valido=null`, independente do status de confiança da nacionalidade.

2. **Validade determinada/indeterminada**: contrato T5-F1 exige distinção. text-extractor não faz essa distinção — lacuna LF-02 documentada.

3. **`derived_rnm_block`**: contrato T2 declara como fact derivado persistido. Core não persiste; calcula dinamicamente no gate.

4. **Encerramento/inelegibilidade** (`fim_inelegivel`, F4): contrato T5-F4 define estágios `restricao`, `fim_inelegivel`. Core não implementa nenhum path de encerramento — leads inelegíveis ficam bloqueados indefinidamente no stage atual.
