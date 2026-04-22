# CONVERGÊNCIA SEMÂNTICA DO ÁUDIO — FRENTE 5 — ENOVA 2

> **PR:** 47 — convergência áudio → pacote semântico → extração estruturada
> **Frente:** 5 — Áudio e Multimodalidade
> **Classificação:** contratual
> **Status:** ativo
> **Precedência:** A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > CONTRATO_AUDIO_E_MULTIMODALIDADE_2026-04-21 > FRENTE5_AUDIO_INPUT_CONTRACT > **este documento**
> **Última atualização:** 2026-04-22
> **Depende de:** `schema/audio/FRENTE5_AUDIO_INPUT_CONTRACT.md` (PR 46)

---

## Leitura obrigatória antes deste documento

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` — regra-mãe de soberania da IA
- `schema/contracts/active/CONTRATO_AUDIO_E_MULTIMODALIDADE_2026-04-21.md` — contrato da Frente 5
- `schema/audio/FRENTE5_AUDIO_INPUT_CONTRACT.md` — contrato de entrada de áudio (PR 46)

---

## 1. Propósito deste documento

Este documento define a **convergência semântica canônica** da ENOVA 2: como o texto normalizado produzido pelo fluxo de áudio (`normalized_text`) vira exatamente o mesmo pacote semântico que o texto puro usa, como esse pacote é entregue ao mesmo Extractor estruturado, e como confiança, ambiguidade e confirmação de áudio operam sob o mesmo modelo do cérebro conversacional.

Este documento **não implementa** STT/TTS real, pipeline funcional, canal externo, rollout, telemetria profunda ou trilho paralelo de decisão. Ele define o **contrato de convergência** que a PR 48 usará para implementar a casca técnica multimodal.

**O que está fechado após esta PR:**
- O pacote semântico de áudio é estruturalmente idêntico ao do texto — definido e verificável.
- O Extractor continua único — sem distinção por modalidade.
- Confiança baixa não vira slot confirmado — regra inegociável codificada.
- Ambiguidade é pendência/confirmação, não chute — boundary formal.
- A PR 48 pode implementar a casca técnica sem precisar inventar nenhuma dessas decisões.

---

## 2. Princípio fundador — um cérebro, uma entrada

O princípio do A00 (seção 4.6) e do contrato da Frente 5 (seção 6, princípio 1) é categórico:

> Áudio e texto devem alimentar o **mesmo** cérebro conversacional, a **mesma** extração de sinais e a **mesma** persistência.

Isso significa que:

- O Extractor não sabe se o pacote veio de áudio ou de texto.
- O Core não sabe se o slot foi extraído de áudio ou de texto.
- O Adapter não sabe se o sinal persistido veio de áudio ou de texto.
- A IA não sabe se o turno foi falado ou digitado.

A **única** diferença entre áudio e texto no cérebro conversacional está nos campos de metadado/evidência do pacote semântico: `origin`, `transcript_confidence` e `evidence_status`. Esses campos não criam trilho paralelo — eles informam o processamento padrão.

---

## 3. Boundary canônico: de `AudioInputEntry` ao pacote semântico

O boundary completo entre os objetos da Frente 5 é:

```
AudioInputEntry                    ← contrato PR 46
  └─► normalized_text              ← campo de convergência (PR 46, seção 3.3)
        └─► SemanticPackage        ← este documento (PR 47)
              └─► Extractor        ← mesmo Extractor do texto (PR 47)
                    └─► Sinais estruturados
                          └─► Core soberano (Policy/Mechanical Core)
                                └─► Adapter → Supabase
```

| Objeto | Origem | Soberania | O que carrega |
|--------|--------|-----------|---------------|
| `AudioInputEntry` | Media Pipeline | Nenhuma (entrada) | áudio bruto + transcrição + evidência + metadados |
| `normalized_text` | Normalização (PR 46, seção 7) | Nenhuma (transição) | texto limpo pronto para o cérebro |
| `SemanticPackage` | Conversation Brain | Nenhuma (input do Extractor) | texto + intenções + slots candidatos + metadados de origem |
| Sinais estruturados | Extractor | Soberania de extração | slots candidatos, intenções, objeções, pendências |
| Estado soberano | Core | Soberania de regra e decisão | slots confirmados, stage, próximo objetivo |

---

## 4. Shape do pacote semântico — `SemanticPackage`

### 4.1 Definição

`SemanticPackage` é o objeto que o Conversation Brain entrega ao Extractor estruturado. Ele é produzido a partir do `normalized_text` (áudio) ou do texto puro do cliente (texto) — e é **estruturalmente idêntico em ambos os casos**.

O Extractor recebe `SemanticPackage`. O Extractor **não recebe** `AudioInputEntry`, `transcript_text`, `transcript_confidence` ou qualquer campo bruto de áudio.

### 4.2 Campos obrigatórios do `SemanticPackage`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `package_id` | `string (UUID)` | Identificador único deste pacote semântico |
| `session_id` | `string` | Identificador da sessão conversacional (mesmo da `AudioInputEntry`) |
| `turn_id` | `string` | Identificador do turno ao qual este pacote pertence |
| `produced_at` | `string (ISO 8601)` | Timestamp de produção do pacote |
| `text` | `string` | Texto normalizado que alimenta o Extractor (= `normalized_text` para áudio; = texto limpo para texto puro) |
| `origin` | `enum` | Modalidade de origem: `text` ou `audio` |
| `confidence` | `number (0.0–1.0)` | Confiança do input: `1.0` para texto puro; `transcript_confidence` propagado para áudio |
| `evidence_status` | `enum` | Status da evidência: `usable`, `requires_confirmation`, `rejected` |
| `segments` | `SemanticSegment[]` | Lista de segmentos semânticos extraídos do turno (ver seção 4.3) |

### 4.3 Campos opcionais do `SemanticPackage`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `entry_ref` | `string` | Referência ao `entry_id` da `AudioInputEntry` de origem (áudio only; `null` para texto puro) |
| `ambiguity_flags` | `AmbiguityFlag[]` | Lista de ambiguidades identificadas no turno (ver seção 6) |
| `confirmation_required` | `boolean` | `true` se algum segmento requer confirmação explícita |
| `raw_source_ref` | `string` | Referência opaca ao evento de origem (para rastreabilidade de auditoria) |

### 4.4 Valores do enum `origin`

| Valor | Significado |
|-------|-------------|
| `text` | Input veio diretamente de texto puro (chat, API) |
| `audio` | Input veio de áudio transcrito e normalizado |

### 4.5 Valores do enum `evidence_status`

Propagado diretamente do `AudioInputEntry.evidence_status` para áudio; para texto puro, sempre `usable`.

| Valor | Significado para o Extractor |
|-------|------------------------------|
| `usable` | Pacote pode ser processado normalmente |
| `requires_confirmation` | Extractor deve marcar sinais como `pending_confirmation` |
| `rejected` | Pacote não deve gerar slots — registrar apenas como evidência rejeitada |

---

## 5. Equivalência estrutural: áudio vs. texto — o que é igual, o que é diferente

### 5.1 O que é IGUAL (estruturalmente idêntico)

| Aspecto | Texto puro | Áudio (pós-normalização) |
|---------|------------|--------------------------|
| Objeto recebido pelo Extractor | `SemanticPackage` | `SemanticPackage` |
| Campo de entrada textual | `text` | `text` (= `normalized_text`) |
| Estrutura de `segments` | `SemanticSegment[]` | `SemanticSegment[]` |
| Extractor usado | mesmo Extractor | mesmo Extractor |
| Regra de extração de slots | mesma | mesma |
| Gate/Core soberano | mesmo Core | mesmo Core |
| Persistência | mesmo Adapter | mesmo Adapter |
| Surface final | mesma IA | mesma IA |

### 5.2 O que é DIFERENTE (somente como metadado/evidência)

| Campo | Texto puro | Áudio | Impacto no Extractor |
|-------|------------|-------|----------------------|
| `origin` | `text` | `audio` | Nenhum na lógica de extração; usado apenas para rastreabilidade |
| `confidence` | `1.0` (fixo) | `transcript_confidence` (propagado) | Afeta `evidence_status` — não a lógica de extração |
| `evidence_status` | sempre `usable` | variável (ver seção 5 do INPUT_CONTRACT) | Determina se sinais vão para `pending_confirmation` |
| `entry_ref` | `null` | `entry_id` da `AudioInputEntry` | Rastreabilidade de auditoria — não afeta extração |
| `confirmation_required` | sempre `false` | depende de `evidence_status` | Dispara fluxo de confirmação — ver seção 8 |

**Regra de ouro:** qualquer campo que afete a lógica de extração, gate ou decisão do Core deve ser idêntico entre texto e áudio. Apenas campos de metadado/rastreabilidade/evidência podem diferir.

---

## 6. Como `normalized_text` vira texto do cérebro

Em termos simples e operacionais:

1. O Media Pipeline produz `AudioInputEntry` com `normalized_text` preenchido (PR 46).
2. O Conversation Brain extrai o campo `normalized_text` da `AudioInputEntry`.
3. O Conversation Brain **cria um `SemanticPackage`** com `text = normalized_text`.
4. Os demais campos de metadado (`origin = audio`, `confidence`, `evidence_status`) são propagados da `AudioInputEntry`.
5. O `SemanticPackage` é entregue ao Extractor — **que o processa como qualquer outro pacote**.
6. Para o Extractor, `text` é `text`. Não importa se veio de áudio ou de chat.

```
AudioInputEntry.normalized_text
        │
        ▼
SemanticPackage.text              ← campo único de entrada do Extractor
        │
        ▼
Extractor.process(SemanticPackage)  ← mesmo método, mesmo código, mesma lógica
```

> **O texto normalizado do áudio é o texto do cérebro exatamente da mesma forma que o texto digitado pelo cliente.**
> A normalização (PR 46, seção 7) garante que o campo está limpo o suficiente para entrar no pacote.
> O Extractor não distingue a origem — ele processa o campo `text`.

---

## 7. Segmentos semânticos — como múltiplos fatos/intenções em áudio são tratados

### 7.1 O problema: um turno de áudio pode conter vários fatos

Em texto puro, o cliente geralmente escreve uma coisa por vez. Em áudio, é comum o cliente falar várias coisas no mesmo turno:

> *"Meu nome é João Silva, minha renda é três mil e quinhentos, e quero comprar em São Paulo"*

Esse único turno de áudio contém três fatos distintos: nome, renda e localidade. O pacote semântico precisa representar todos eles.

### 7.2 Solução: `SemanticSegment` — segmentação interna ao pacote

O `SemanticPackage` carrega uma lista de `segments: SemanticSegment[]`. Cada segmento representa um fato, intenção ou objeção identificada no texto do turno.

**O Extractor produz os `SemanticSegment`s a partir do campo `text` do `SemanticPackage`.**

O Extractor já processa texto com múltiplos fatos — essa capacidade já existe para o texto puro. O áudio não exige nenhuma lógica especial: o texto normalizado do áudio entra como `text`, o Extractor extrai os segmentos da mesma forma.

### 7.3 Shape do `SemanticSegment`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `segment_id` | `string (UUID)` | Identificador único deste segmento |
| `intent` | `string` | Intenção identificada (ex: `declare_income`, `declare_name`, `declare_location`) |
| `slot_candidates` | `SlotCandidate[]` | Slots candidatos extraídos deste segmento |
| `raw_text` | `string` | Trecho do `text` que originou este segmento |
| `confidence_inherited` | `number (0.0–1.0)` | Confiança herdada do pacote (= `SemanticPackage.confidence`) |
| `ambiguity` | `AmbiguityFlag \| null` | Ambiguidade identificada neste segmento, se houver |
| `confirmation_status` | `enum` | Estado de confirmação: `not_required`, `pending`, `confirmed`, `rejected` |

### 7.4 Shape do `SlotCandidate`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `slot_name` | `string` | Nome do slot de negócio (ex: `income`, `full_name`, `city`) |
| `value_raw` | `string` | Valor extraído literalmente do texto (ex: `"três mil e quinhentos"`) |
| `value_normalized` | `string \| null` | Valor após normalização de domínio (ex: `"3500"`) — `null` se não resolvido |
| `confidence` | `number (0.0–1.0)` | Confiança neste slot candidato (≤ `confidence_inherited`) |
| `origin` | `enum` | `text` ou `audio` — propagado do pacote |
| `evidence_ref` | `string \| null` | Referência à evidência de áudio associada (áudio only) |
| `confirmation_status` | `enum` | Estado: `not_required`, `pending`, `confirmed`, `rejected` |

### 7.5 Como múltiplos segmentos convergem ao mesmo Extractor

```
SemanticPackage.text = "Meu nome é João Silva, renda três mil e quinhentos, quero comprar em São Paulo"
        │
        ▼
Extractor.process(SemanticPackage)
        │
        ├─► SemanticSegment[0]: intent=declare_name, slot_candidates=[{slot_name=full_name, value_raw="João Silva"}]
        ├─► SemanticSegment[1]: intent=declare_income, slot_candidates=[{slot_name=income, value_raw="três mil e quinhentos", value_normalized="3500"}]
        └─► SemanticSegment[2]: intent=declare_location, slot_candidates=[{slot_name=city, value_raw="São Paulo"}]
```

**Regra:** o Extractor processa o `text` inteiro e produz todos os segmentos de uma vez. Não há chamada múltipla ao Extractor por turno de áudio. O mesmo fluxo que processa texto com múltiplos fatos processa áudio com múltiplos fatos — porque o objeto entregue ao Extractor é o mesmo.

---

## 8. Tratamento de confiança — como a confiança do áudio acompanha o pacote

### 8.1 Propagação da confiança

A confiança da transcrição (`transcript_confidence` do `AudioInputEntry`) é propagada ao `SemanticPackage` como `confidence`. Essa mesma confiança é herdada por cada `SemanticSegment` como `confidence_inherited` e por cada `SlotCandidate` como `confidence`.

```
AudioInputEntry.transcript_confidence = 0.72
        │
        ▼
SemanticPackage.confidence = 0.72
        │
        ▼
SemanticSegment[*].confidence_inherited = 0.72
        │
        ▼
SlotCandidate[*].confidence = 0.72
```

### 8.2 Tabela de comportamento por faixa de confiança

| `confidence` | `evidence_status` | Comportamento do Extractor | Resultado |
|--------------|-------------------|---------------------------|-----------|
| `≥ 0.85` | `usable` | Processa normalmente; slots candidatos vão para avaliação do Core | Slot pode ser confirmado pelo Core |
| `0.50 – 0.84` | `requires_confirmation` | Marca todos os `SlotCandidate`s com `confirmation_status = pending` | IA pede confirmação ao cliente |
| `< 0.50` | `rejected` | Não extrai slots; registra apenas evidência rejeitada | IA pede reenvio ou repete pergunta |
| `transcript_status = failed` | `rejected` | Sem pacote produzido; registra falha | IA pede reenvio de áudio |

### 8.3 Regras inegociáveis de confiança no pacote semântico

**RC1. Confiança baixa não pode virar slot confirmado automaticamente.** Nunca. `confidence < 0.85` exige confirmação explícita — sem exceção.

**RC2. A confiança é do pacote, não do segmento individual.** Um turno de áudio com `confidence = 0.72` marca **todos** os seus segmentos como `requires_confirmation`, mesmo que um segmento específico pareça claro. A confiança é da transcrição como um todo, não de cada fato individualmente.

**RC3. Texto puro tem `confidence = 1.0` por definição.** O Extractor nunca marca segmentos de texto puro como `pending_confirmation` por razão de confiança (ambiguidade semântica é tratada separadamente — ver seção 9).

**RC4. A confiança é metadado de evidência — não altera a lógica de extração.** O Extractor extrai os segmentos normalmente. A confiança afeta o `confirmation_status` do resultado — não o processo de extração em si.

**RC5. Core não recebe `transcript_confidence` diretamente.** O Core recebe sinais estruturados do Extractor, com `confirmation_status` já aplicado. O Core decide se aceita o sinal — não precisa conhecer a transcrição de origem.

---

## 9. Tratamento de ambiguidade — marcação e pendência

### 9.1 O que é ambiguidade neste contexto

Ambiguidade é quando o texto de um turno (áudio ou texto) contém um fato que **não pode ser resolvido sem informação adicional do cliente**. Exemplos:

- *"minha renda é uns três mil"* → valor impreciso (não é ambiguidade de transcrição — é ambiguidade semântica)
- *"moro em São Paulo"* → cidade ou estado? (slot não resolvido)
- *"quero comprar"* → intenção clara, mas slot `modality` não declarado
- *"já tenho a documentação"* → qual documentação? (referência ambígua)

### 9.2 `AmbiguityFlag` — estrutura de marcação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `flag_id` | `string (UUID)` | Identificador único desta flag de ambiguidade |
| `segment_ref` | `string` | `segment_id` do segmento que originou a ambiguidade |
| `slot_ref` | `string \| null` | `slot_name` do slot afetado, se aplicável |
| `type` | `enum` | Tipo de ambiguidade: `value_imprecise`, `reference_unclear`, `slot_missing`, `intent_multi` |
| `description` | `string` | Descrição da ambiguidade em linguagem operacional |
| `resolution` | `enum` | Como resolver: `ask_client`, `use_context`, `defer` |

### 9.3 Valores do enum `type`

| Valor | Significado |
|-------|-------------|
| `value_imprecise` | Valor presente mas impreciso (ex: *"uns três mil"*) |
| `reference_unclear` | Referência não resolvível sem contexto (ex: *"a documentação"*) |
| `slot_missing` | Slot esperado não foi declarado no turno |
| `intent_multi` | Múltiplas intenções potencialmente conflitantes no mesmo segmento |

### 9.4 Valores do enum `resolution`

| Valor | Comportamento |
|-------|---------------|
| `ask_client` | IA deve perguntar diretamente ao cliente para resolver |
| `use_context` | Resolução possível via contexto da sessão (Extractor ou Core tenta resolver) |
| `defer` | Ambiguidade é registrada mas não bloqueia o fluxo neste momento |

### 9.5 Regras inegociáveis de ambiguidade

**RA1. Ambiguidade é pendência — não é chute.** O Extractor nunca "resolve" uma ambiguidade escolhendo um valor arbitrário. A ambiguidade é marcada como `AmbiguityFlag` e o slot afetado fica com `confirmation_status = pending` ou não é preenchido.

**RA2. Ambiguidade semântica é diferente de baixa confiança.** Um texto com `confidence = 1.0` (texto puro) pode ter `AmbiguityFlag`. Um áudio com `confidence = 0.72` pode ter segmentos claros mas com `confirmation_status = pending` por razão de confiança. São mecanismos distintos, mas ambos resultam em confirmação pendente.

**RA3. O Core não recebe ambiguidade não resolvida como slot confirmado.** Slots com `AmbiguityFlag` e `resolution = ask_client` ficam com `confirmation_status = pending` até o cliente responder.

**RA4. A IA é soberana em como perguntar.** A existência de `AmbiguityFlag` informa a IA que há algo a perguntar — mas a forma, o tom e a estrutura da pergunta pertencem exclusivamente à IA. Nenhuma camada mecânica gera a frase ao cliente.

---

## 10. Confirmação de slot quando confiança de áudio é baixa

### 10.1 O que é confirmação de slot neste contexto

Confirmação de slot é o processo pelo qual um `SlotCandidate` com `confirmation_status = pending` (por razão de confiança de áudio ou de ambiguidade semântica) passa a `confirmed` após interação explícita com o cliente.

### 10.2 Fluxo de confirmação

```
SemanticPackage.evidence_status = requires_confirmation
        │
        ▼
Extractor marca SlotCandidate.confirmation_status = pending
        │
        ▼
Core recebe sinal candidato com confirmation_status = pending
        │
        ▼
Core NÃO aceita slot como confirmado
        │
        ▼
IA (soberana na fala) pergunta ao cliente para confirmar
        │
        ├─► Cliente confirma → novo turno → SemanticPackage com confidence = 1.0 (texto) ou alta (áudio)
        │         └─► Extractor extrai → SlotCandidate.confirmation_status = confirmed → Core aceita → Adapter persiste
        │
        └─► Cliente corrige → novo turno → novo valor → mesmo fluxo
```

### 10.3 Regras inegociáveis de confirmação

**RCF1. Slot pendente não é slot confirmado.** O Core jamais trata `confirmation_status = pending` como `confirmed`. Não há tolerância, não há exceção de domínio.

**RCF2. A confirmação vem do cliente — não do sistema.** O sistema não pode auto-confirmar um slot pendente com base em contexto, heurística ou threshold ajustado. Confirmação exige turno de retorno do cliente.

**RCF3. A IA conduz a confirmação.** A IA decide **como** pedir a confirmação — tom, forma, quantidade de itens por vez. O Core sabe que há slots pendentes; a IA decide a conversa.

**RCF4. Após confirmação, o slot entra no fluxo normal.** Depois que o cliente confirma (novo turno, novo `SemanticPackage`, `evidence_status = usable`), o slot percorre o fluxo padrão: Extractor → Core → Adapter.

**RCF5. Confiança recuperada não retroage.** Uma confirmação não altera o `transcript_confidence` original da evidência. O registro de auditoria mantém o `confidence` original + o turno de confirmação — para explicabilidade.

---

## 11. Como o Extractor recebe o `SemanticPackage` — contrato de interface

### 11.1 O que o Extractor recebe

O Extractor recebe **um único `SemanticPackage` por turno** — independente de a entrada ter sido áudio ou texto. O Extractor não tem modo "áudio" e modo "texto". Ele tem um único método de processamento.

### 11.2 O que o Extractor NÃO recebe

| O que | Por quê |
|-------|---------|
| `AudioInputEntry` | O Extractor não conhece o objeto de entrada de áudio |
| `transcript_text` bruto | O Extractor não processa transcrição bruta |
| `transcript_confidence` | O Extractor recebe `confidence` já no `SemanticPackage` |
| Áudio binário | Nunca. Sem exceção. |
| Referência ao áudio bruto | O Extractor não precisa de rastreabilidade de áudio — isso é responsabilidade do Adapter |

### 11.3 O que o Extractor retorna

O Extractor retorna o `SemanticPackage` com os campos `segments`, `ambiguity_flags` e `confirmation_required` preenchidos. O Extractor **não retorna** um novo objeto — ele enriquece o `SemanticPackage` recebido.

### 11.4 Pseudocontrato de interface

```typescript
// Pseudocódigo — sem implementação nesta PR
interface SemanticPackage {
  package_id: string;          // UUID
  session_id: string;          // mesmo da sessão conversacional
  turn_id: string;             // mesmo do turno
  produced_at: string;         // ISO 8601
  text: string;                // normalized_text (áudio) ou texto puro
  origin: 'text' | 'audio';    // modalidade de origem
  confidence: number;          // 1.0 para texto; transcript_confidence para áudio
  evidence_status: 'usable' | 'requires_confirmation' | 'rejected';
  segments: SemanticSegment[]; // preenchido pelo Extractor
  entry_ref?: string;          // entry_id do AudioInputEntry (áudio only)
  ambiguity_flags?: AmbiguityFlag[];    // preenchido pelo Extractor
  confirmation_required?: boolean;      // true se qualquer slot está pending
  raw_source_ref?: string;     // referência opaca para auditoria
}

// O Extractor processa assim:
function extract(pkg: SemanticPackage): SemanticPackage {
  // MESMO método para texto e áudio
  // pkg.text é o input
  // pkg.confidence e pkg.evidence_status informam o tratamento de confirmação
  // retorna pkg com segments, ambiguity_flags e confirmation_required preenchidos
}
```

---

## 12. Diagrama completo — boundary entre objetos

```
┌──────────────────────────────────────────────────────────────────────┐
│  AudioInputEntry (PR 46)                                             │
│  Campos: entry_id, session_id, turn_id, source_type, source_ref,     │
│  duration_ms, transcript_text, transcript_confidence,                │
│  transcript_status, evidence_status, normalized_text, ...            │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ Conversation Brain extrai normalized_text
                               │ e propaga confidence + evidence_status
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SemanticPackage (este documento — PR 47)                            │
│  Campos: package_id, session_id, turn_id, produced_at,              │
│  text (= normalized_text), origin=audio, confidence,                │
│  evidence_status, segments=[], entry_ref=entry_id                   │
│                                                                      │
│  → Para texto puro: text = texto_do_cliente, origin=text,           │
│    confidence=1.0, evidence_status=usable, entry_ref=null           │
│                                                                      │
│  → Estruturalmente IDÊNTICO em ambos os casos                       │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ Extractor.extract(SemanticPackage)
                               │ — mesmo método, sem distinção de modalidade
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SemanticPackage enriquecido                                         │
│  + segments: SemanticSegment[]                                       │
│    (intent, slot_candidates, confidence_inherited, ambiguity,        │
│     confirmation_status)                                             │
│  + ambiguity_flags: AmbiguityFlag[]                                  │
│  + confirmation_required: boolean                                    │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ Core recebe sinais estruturados
                               │ (sem conhecer AudioInputEntry ou transcrição)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Policy/Core — estado soberano                                       │
│  Recebe: SemanticSegment[], SlotCandidate[], confirmation_status     │
│  Decide: aceitar slot, pedir confirmação, avançar stage              │
│  NÃO recebe: AudioInputEntry, transcript_confidence, áudio bruto    │
│  NÃO sabe: se o slot veio de áudio ou texto                         │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ Adapter persiste sinais confirmados
                               │ e evidências com origin=audio
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Persistence Adapter (Frente 4)                                      │
│  Persiste: slots confirmados (tabelas de estado)                     │
│  Persiste: evidências de áudio (tabela de evidências, origin=audio)  │
│  NÃO persiste: áudio binário, transcrição bruta como slot confirmado │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 13. Resumo dos boundaries — o que é igual, o que é específico do áudio

### 13.1 O que é IGUAL entre texto e áudio (comportamento idêntico)

- Objeto entregue ao Extractor: `SemanticPackage` (idêntico)
- Campo de input textual: `text` (idêntico)
- Lógica de extração do Extractor: idêntica
- Lógica de gate e decisão do Core: idêntica
- Persistência via Adapter: idêntica
- Surface final via IA: idêntica

### 13.2 O que é ESPECÍFICO do áudio (apenas como metadado/evidência)

| Campo | Onde vive | Impacto | Tipo |
|-------|-----------|---------|------|
| `origin = audio` | `SemanticPackage` | Rastreabilidade | Metadado |
| `confidence < 1.0` | `SemanticPackage` | Afeta `evidence_status` | Evidência |
| `evidence_status = requires_confirmation` | `SemanticPackage` | Marca slots como `pending` | Evidência |
| `entry_ref` | `SemanticPackage` | Referência à `AudioInputEntry` | Rastreabilidade |
| `confirmation_status = pending` | `SlotCandidate` | Bloqueia confirmação automática | Evidência |
| `confidence_inherited` | `SemanticSegment` | Evidência do segmento | Evidência |
| `evidence_ref` | `SlotCandidate` | Referência à evidência de áudio | Rastreabilidade |

**Nenhum desses campos muda a lógica do Extractor, do Core ou do Adapter.** Eles apenas carregam informação para rastreabilidade e para o fluxo de confirmação.

---

## 14. Smoke documental/estrutural de convergência semântica

Este smoke valida que a convergência semântica está estruturalmente coerente antes da implementação técnica (PR 48).

### 14.1 Checklist de equivalência estrutural

- [x] `SemanticPackage.text` é o único campo de entrada textual do Extractor — não há campo especial para áudio
- [x] `SemanticPackage` tem a mesma estrutura para texto e áudio — diferem apenas em `origin`, `confidence`, `evidence_status`, `entry_ref`
- [x] O Extractor não tem modo áudio — recebe `SemanticPackage` e processa `text`
- [x] O Core não conhece `AudioInputEntry` — recebe apenas `SemanticSegment[]` e `SlotCandidate[]`
- [x] O Adapter não tem lógica especial de áudio — persiste slots confirmados e evidências com `origin=audio`
- [x] A IA não tem modo áudio — recebe o estado do Core e decide a fala

### 14.2 Checklist de confiança e confirmação

- [x] `confidence < 0.85` → `evidence_status = requires_confirmation` → todos os slots `pending` — sem exceção
- [x] `confidence < 0.50` → `evidence_status = rejected` → sem extração de slots
- [x] `transcript_status = failed` → sem `SemanticPackage` produzido — IA pede reenvio
- [x] Slot `pending` não é aceito pelo Core sem turno de confirmação explícita do cliente
- [x] Auto-confirmação proibida — o sistema não pode confirmar slot pendente sem retorno do cliente
- [x] Confirmação via novo turno → novo `SemanticPackage` → fluxo normal

### 14.3 Checklist de ambiguidade

- [x] Ambiguidade é marcada como `AmbiguityFlag` — não é resolvida por chute
- [x] Slot com `AmbiguityFlag` + `resolution = ask_client` → `confirmation_status = pending`
- [x] Ambiguidade semântica (texto puro) e baixa confiança (áudio) são mecanismos distintos mas produzem o mesmo resultado: slot pendente
- [x] Core não recebe slot ambíguo não resolvido como confirmado
- [x] IA conduz a pergunta de resolução de ambiguidade — sem interferência do mecânico

### 14.4 Checklist de múltiplos fatos/intenções

- [x] `SemanticPackage` carrega `segments: SemanticSegment[]` — lista, não único
- [x] Extractor extrai múltiplos segmentos de um único `text` — mesmo para áudio
- [x] Cada segmento tem seus próprios `slot_candidates` e `confirmation_status`
- [x] Confiança é propagada de forma igual para todos os segmentos do mesmo pacote
- [x] Core processa cada `SlotCandidate` individualmente — mesma lógica para texto e áudio

### 14.5 Checklist de soberania

- [x] IA soberana na fala: nenhum campo do `SemanticPackage` redige resposta ao cliente
- [x] Core soberano na regra: `confidence` e `evidence_status` informam — não decidem gate
- [x] Extractor soberano na extração: `normalized_text` → `text` é a entrada; o Extractor decide o sinal
- [x] Adapter soberano na persistência: evidências e sinais persistem via Adapter canônico da Frente 4
- [x] Nenhum trilho paralelo de áudio criado: mesmo `SemanticPackage`, mesmo Extractor, mesmo Core
- [x] Pipeline de áudio sem soberania de fala: nunca escreve resposta ao cliente

### 14.6 Checklist de fora de escopo (confirmado como ausente nesta PR)

- [x] STT/TTS real: **ausente** — `transcript_confidence` é tratado como campo a ser preenchido
- [x] Canal Meta/WhatsApp: **ausente** — origem `whatsapp_voice` reservada para Frente 6
- [x] Pipeline funcional: **ausente** — casca técnica virá na PR 48
- [x] Rollout/shadow/canary: **ausente** — Frente 8
- [x] Telemetria profunda: **ausente** — Frente 7
- [x] Método de implementação do Extractor: **ausente** — já existe para texto; PR 48 conecta áudio
- [x] Criação de runtime real: **ausente** — este documento é contratual/documental

---

## 15. Referência de uso por PR

| PR | O que usa deste documento |
|----|--------------------------|
| **PR 46 (anterior)** | Define `AudioInputEntry` e `normalized_text` — campo de entrada para este documento |
| **PR 47 (esta)** | Define `SemanticPackage`, `SemanticSegment`, `SlotCandidate`, `AmbiguityFlag` e todo o contrato de convergência semântica |
| **PR 48** | Implementa a casca técnica que produz `SemanticPackage` a partir de `AudioInputEntry` usando as definições deste documento |
| **PR 49** | Smoke integrado: valida que áudio → `AudioInputEntry` → `SemanticPackage` → Extractor → Core → Adapter funciona de ponta a ponta |

---

## 16. Conformidade com soberania da IA

Este documento declara conformidade integral com `schema/ADENDO_CANONICO_SOBERANIA_IA.md`.

Regras aplicadas explicitamente:

- **IA soberana na fala:** nenhum campo ou camada do `SemanticPackage` redige resposta ao cliente.
- **Core soberano na regra:** `evidence_status` e `confirmation_status` informam o Core — o Core decide.
- **Extractor soberano na extração:** `SemanticPackage.text` é a entrada; o Extractor decide os segmentos e slots.
- **Adapter soberano na persistência:** evidências e sinais persistem via Adapter canônico da Frente 4.
- **Proibição P1 cumprida:** mecânico (pipeline de áudio, Extractor, Core) sem nenhuma prioridade de fala.
- **Nenhum trilho paralelo:** `SemanticPackage` é o único objeto de input do Extractor — sem versão especial para áudio.

---

## 17. Estado deste documento

| Campo | Valor |
|-------|-------|
| Status | ativo — PR 47 concluída |
| Próxima PR que consome | PR 48 — casca técnica do pipeline multimodal |
| O que esta PR entrega | Contrato canônico completo de convergência semântica do áudio |
| O que esta PR não entrega | Implementação técnica (PR 48), STT/TTS real, canal externo, rollout |
