# CONTRATO DE ENTRADA DE ÁUDIO — FRENTE 5 — ENOVA 2

> **PR:** 46 — contrato de áudio, transcrição e evidência de entrada
> **Frente:** 5 — Áudio e Multimodalidade
> **Classificação:** contratual
> **Status:** ativo
> **Precedência:** A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > CONTRATO_AUDIO_E_MULTIMODALIDADE_2026-04-21 > **este documento**
> **Última atualização:** 2026-04-22

---

## Leitura obrigatória antes deste documento

- `schema/A00_PLANO_CANONICO_MACRO.md` — princípios fundadores, especialmente seção 4.6
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` — regra-mãe de soberania da IA
- `schema/contracts/active/CONTRATO_AUDIO_E_MULTIMODALIDADE_2026-04-21.md` — contrato da Frente 5

---

## 1. Propósito deste documento

Este documento define o **contrato canônico de entrada de áudio da ENOVA 2**: o que é o objeto de entrada de áudio, quais campos ele carrega, o que é transcrição, o que é evidência, o que é normalização, o que pode ser persistido, o que exige confirmação e o que nunca pode vazar para o estado soberano do Core sem validação explícita.

Este documento **não implementa** STT/TTS real, pipeline funcional, canal externo, rollout ou telemetria profunda. Ele define o **contrato estrutural** que a PR 47 usará para convergir áudio ao mesmo pacote semântico do texto.

---

## 2. Como um áudio do cliente chega

Em termos operacionais simples:

1. O cliente envia uma mensagem de voz (via canal — a ser integrado na Frente 6).
2. O Canal Adapter recebe o evento e entrega o áudio bruto + metadados ao Media Pipeline.
3. O Media Pipeline transcreve o áudio e produz uma **evidência de entrada** com texto transcrito e score de confiança.
4. A transcrição normalizada entra no **mesmo cérebro conversacional do texto** — idêntico ao fluxo texto puro.
5. O Extractor estruturado processa o pacote semântico (texto ou áudio — mesmo objeto).
6. O Core decide regra, gate e próximo objetivo.
7. O Adapter persiste os sinais extraídos.
8. A IA entrega a surface final ao cliente.

**Regra inegociável:** áudio não tem cérebro próprio. Transcrição não decide nada. Evidência não é fato confirmado.

---

## 3. Objeto canônico de entrada de áudio — `AudioInputEntry`

### 3.1 Definição

`AudioInputEntry` é o objeto estruturado produzido pelo Media Pipeline a partir de um evento de áudio do cliente. Ele carrega o áudio bruto (por referência), os metadados do evento, a transcrição produzida e a evidência de entrada — pronto para ser normalizado e convergido ao pacote semântico do cérebro conversacional.

### 3.2 Campos obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `entry_id` | `string (UUID)` | Identificador único desta entrada de áudio |
| `session_id` | `string` | Identificador da sessão conversacional (mesmo do texto) |
| `turn_id` | `string` | Identificador do turno ao qual este áudio pertence |
| `received_at` | `string (ISO 8601)` | Timestamp de recebimento do evento de áudio |
| `source_type` | `enum` | Tipo da fonte: `whatsapp_voice`, `api_upload`, `test_stub` |
| `source_ref` | `string` | Referência opaca ao evento de origem (nunca o binário em linha) |
| `duration_ms` | `number (integer)` | Duração do áudio em milissegundos |
| `transcript_text` | `string` | Texto resultante da transcrição (pode ser vazio se falhou) |
| `transcript_confidence` | `number (0.0–1.0)` | Score de confiança da transcrição (0 = falha total, 1 = certeza máxima) |
| `transcript_status` | `enum` | Status da transcrição: `success`, `low_confidence`, `failed`, `stub` |
| `evidence_status` | `enum` | Status da evidência: `pending`, `usable`, `requires_confirmation`, `rejected` |

### 3.3 Campos opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `language` | `string (BCP 47)` | Idioma detectado ou declarado (ex: `pt-BR`) |
| `codec` | `string` | Codec do áudio (ex: `opus`, `mp3`, `ogg`, `m4a`) |
| `mime_type` | `string` | MIME type do áudio (ex: `audio/ogg`, `audio/mpeg`) |
| `sample_rate_hz` | `number` | Taxa de amostragem em Hz (ex: `16000`, `44100`) |
| `transcript_engine` | `string` | Identificador do serviço de transcrição usado (futuro — stub nesta PR) |
| `transcribed_at` | `string (ISO 8601)` | Timestamp em que a transcrição foi produzida |
| `raw_audio_ref` | `string` | Referência ao armazenamento do áudio bruto (quando retido para auditoria) |
| `normalization_applied` | `string[]` | Lista de normalizações aplicadas ao texto antes de entrar no cérebro |
| `normalized_text` | `string` | Texto normalizado pronto para o pacote semântico (após normalizações) |
| `evidence_ref` | `string` | Referência à evidência persistida (se aplicável) |
| `evidence_payload` | `object` | Payload estruturado da evidência (campos extraídos como evidência bruta) |
| `owner` | `string` | Identificador do agente/sistema que originou esta entrada |

### 3.4 Valores do enum `source_type`

| Valor | Significado |
|-------|-------------|
| `whatsapp_voice` | Mensagem de voz enviada via WhatsApp (Frente 6) |
| `api_upload` | Áudio enviado via API direta (integração futura) |
| `test_stub` | Áudio sintético gerado por stub de teste (PR 46, 47, 48) |

### 3.5 Valores do enum `transcript_status`

| Valor | Significado |
|-------|-------------|
| `success` | Transcrição bem-sucedida com confiança aceitável |
| `low_confidence` | Transcrição concluída mas com confiança abaixo do limiar |
| `failed` | Transcrição falhou completamente (áudio inaudível, erro de engine) |
| `stub` | Transcrição sintética produzida por stub (ambiente de desenvolvimento/teste) |

### 3.6 Valores do enum `evidence_status`

| Valor | Significado |
|-------|-------------|
| `pending` | Evidência produzida mas ainda não avaliada |
| `usable` | Evidência avaliada e utilizável como sinal (confiança alta o suficiente) |
| `requires_confirmation` | Evidência produzida mas requer confirmação explícita antes de virar sinal |
| `rejected` | Evidência descartada (confiança inaceitável ou áudio inválido) |

---

## 4. Camadas do fluxo de áudio — boundaries explícitos

Este é o mapa das camadas e o que cada uma representa. Cada camada tem soberania exclusiva no seu domínio.

```
┌─────────────────────────────────────────────────────────────────────┐
│  EVENTO DE ÁUDIO BRUTO                                              │
│  - arquivo binário (ogg, mp3, m4a, etc.)                           │
│  - não interpretado, não processado, não é sinal de negócio        │
│  - persiste APENAS por referência opaca, nunca em linha             │
│  - campo: source_ref, raw_audio_ref (opcional)                      │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Media Pipeline transcreve
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TRANSCRIÇÃO                                                        │
│  - texto resultante do processo de STT                              │
│  - carrega score de confiança (0.0 – 1.0)                          │
│  - NÃO é fato confirmado                                            │
│  - NÃO é estado soberano                                            │
│  - NÃO pode ser persistida como slot confirmado sem validação       │
│  - é EVIDÊNCIA DE ENTRADA — processamento, não decisão              │
│  - campos: transcript_text, transcript_confidence, transcript_status│
└─────────────────┬───────────────────────────────────────────────────┘
                  │ normalização mínima
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  EVIDÊNCIA DE ENTRADA                                               │
│  - a transcrição + metadados + confiança formam a evidência         │
│  - evidência é rastreável mas não soberana                          │
│  - pode ser persistida como evidência (não como slot)               │
│  - campos: evidence_ref, evidence_payload, evidence_status          │
│  - exige avaliação antes de virar sinal útil                        │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ normalização → pacote semântico
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TEXTO NORMALIZADO / PACOTE SEMÂNTICO                               │
│  - normalized_text: texto pronto para o cérebro conversacional      │
│  - formato IDÊNTICO ao pacote de texto puro                         │
│  - entrada única para o Extractor estruturado                       │
│  - o Extractor não sabe (nem precisa saber) se veio de áudio        │
│  - campo: normalized_text                                            │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Extractor processa
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SINAIS ESTRUTURADOS (Extractor)                                    │
│  - slots candidatos, intenções, objeções, pendências                │
│  - cada sinal carrega sua origem (incluindo audio/low_confidence)   │
│  - sinais de áudio com baixa confiança → requires_confirmation      │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Core avalia regras e gates
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ESTADO SOBERANO DO CORE (Policy/Mechanical Core)                   │
│  - SOMENTE slots confirmados entram aqui                            │
│  - transcrição com baixa confiança NUNCA entra como fato soberano  │
│  - Core não sabe de áudio — ele sabe de slots e sinais validados    │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ Adapter persiste
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PERSISTÊNCIA CANÔNICA (Supabase Adapter — Frente 4)                │
│  - sinais confirmados → tabelas de slots/estado                     │
│  - evidências de áudio → tabela de evidências (com origin=audio)    │
│  - áudio bruto → referência opaca (nunca binário no Supabase)       │
│  - transcrição bruta → evidência (não slot confirmado)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Regras de confiança e confirmação

### 5.1 Limiar de confiança mínimo

| `transcript_confidence` | Comportamento permitido |
|-------------------------|------------------------|
| `≥ 0.85` | Sinal pode ser tratado como candidato a slot — ainda requer validação do Extractor |
| `0.50 – 0.84` | Sinal vira evidência com `evidence_status = requires_confirmation` |
| `< 0.50` | Sinal vira evidência com `evidence_status = rejected` ou descartado; nunca vira fato |
| `transcript_status = failed` | Sem sinal extraído; registro de falha apenas; cérebro responde ao cliente pedindo reenvio |

> **Limiar padrão:** 0.85. Este valor é ajustável por configuração, mas o comportamento abaixo dele é inegociável: **sem confirmação explícita, não vira slot confirmado.**

### 5.2 Regras inegociáveis de confiança

R1. **Confiança baixa não pode virar fato confirmado por padrão.** Nunca.

R2. **Transcrição não é fato — é evidência.** Mesmo com confiança alta, o texto transcrito entra no cérebro como input, não como slot já preenchido.

R3. **O Core não recebe transcrição bruta.** O Core recebe sinais estruturados do Extractor — que por sua vez recebeu o pacote semântico normalizado.

R4. **Evidência de áudio é rastreável.** Todo sinal derivado de áudio deve carregar `origin = audio` e `transcript_confidence` para que a persistência seja explicável.

R5. **Confirmação explícita é exigida** quando `evidence_status = requires_confirmation`. O cérebro deve pedir ao cliente para confirmar antes de persistir o slot.

---

## 6. O que persiste e o que não persiste

### 6.1 O que PERSISTE

| O que | Onde | Como |
|-------|------|------|
| Sinais extraídos confirmados | Tabelas de slots/estado do Adapter | Via Adapter canônico da Frente 4 |
| Evidência de entrada de áudio | Tabela de evidências | Com `origin=audio`, `confidence`, `turn_id`, `session_id` |
| Referência ao áudio bruto | Campo de referência opaca | Nunca o binário — apenas o ponteiro |
| `entry_id`, `session_id`, `turn_id` | Rastreabilidade | Para auditoria e explicabilidade |
| `transcript_confidence` | Com a evidência | Para diagnóstico e conformidade |
| `evidence_status` | Com a evidência | Para saber o que foi confirmado ou pendente |

### 6.2 O que NÃO PERSISTE (ou persiste apenas como evidência)

| O que | Por quê |
|-------|---------|
| Áudio binário bruto em linha | Tamanho, custo, privacidade; apenas referência |
| Transcrição bruta como slot confirmado | Não é fato confirmado — é evidência |
| Sinais com `transcript_confidence < 0.85` sem confirmação | Não atingem limiar de confiança |
| Sinais com `evidence_status = rejected` | Descartados — não entram no estado |
| Informações extras do áudio sem relação com o funil | Não são sinais de negócio |

---

## 7. Normalização mínima do texto transcrito

Antes de o texto transcrito entrar no cérebro conversacional, as seguintes normalizações são aplicadas (sem STT/TTS real nesta PR — a casca técnica virá na PR 48):

| # | Normalização | Exemplo antes | Exemplo depois |
|---|-------------|---------------|----------------|
| N1 | Trim de espaços em branco | `"  João da Silva  "` | `"João da Silva"` |
| N2 | Remoção de marcadores de hesitação típicos de STT | `"[inaudível]"`, `"..."`, `"[ruído]"` | `""` (removidos) |
| N3 | Normalização de pontuação mínima | Texto sem ponto final | Pontuação preservada se presente |
| N4 | Detecção de texto vazio após normalização | `""` após N1/N2 | `transcript_status = failed` |
| N5 | Preservação de números como strings | `"trinta e dois mil"` | preservado (Extractor resolve) |

> **Regra:** normalização mínima — não semântica. O Extractor resolve a semântica. A normalização apenas garante que o texto está limpo o suficiente para entrar no pacote semântico.

O campo `normalization_applied` lista quais normalizações foram executadas (ex: `["N1", "N2", "N4"]`).

---

## 8. O que não pode vazar para o estado soberano do Core

| Proibição | Fundamento |
|-----------|-----------|
| Transcrição bruta com baixa confiança virando slot confirmado | R1, R2 — confiança baixa não é fato |
| Pipeline de áudio tomando decisão de stage ou gate | A00 seção 4.2 — Core soberano em regra |
| Pipeline de áudio escrevendo resposta ao cliente | ADENDO-01 — IA soberana na fala |
| Evidência de áudio persistida fora do Adapter canônico | Princípio 4 do contrato da Frente 5 |
| Áudio criando trilho paralelo de extração ou decisão | A00 seção 4.6 — mesmo cérebro |
| `evidence_status = rejected` sendo persistido como sinal | Sem limiar mínimo, sem persistência de slot |
| Informação de duração, codec ou mime_type como sinal de negócio | Metadados operacionais, não dados de funil |

---

## 9. Quando algo vira evidência, quando vira sinal, quando precisa de confirmação

| Situação | Resultado |
|----------|-----------|
| Transcrição bem-sucedida com `confidence ≥ 0.85` | Entra no pacote semântico; Extractor avalia como candidato a slot |
| Transcrição com `0.50 ≤ confidence < 0.85` | Vira evidência com `requires_confirmation`; cérebro pede confirmação ao cliente |
| Transcrição com `confidence < 0.50` | Vira evidência rejeitada; cérebro pede reenvio ou repete pergunta |
| Transcrição falhou (`status = failed`) | Sem evidência utilizável; cérebro pede reenvio |
| Extractor não extrai sinal do pacote | Sinal pendente; nenhum slot preenchido |
| Extractor extrai sinal com origem áudio | Sinal candidato; marcado com `origin = audio`, `confidence` propagada |
| Core valida sinal candidato | Slot aceito; Adapter persiste |
| Core rejeita sinal candidato | Slot não persiste; evidência permanece como registro |
| Cliente confirma explicitamente (após `requires_confirmation`) | Sinal confirmado; slot persiste via Adapter |

---

## 10. Boundaries explícitos de responsabilidade

| Camada | Soberania | Proibido |
|--------|-----------|---------|
| **Canal Adapter** | Receber evento e entregar ao Media Pipeline | Interpretar áudio, decidir confiança |
| **Media Pipeline** | Transcrever, calcular confiança, produzir evidência | Decidir regra, escrever resposta |
| **Conversation Brain** | Consolidar pacote semântico único (texto ou áudio) | Criar trilho paralelo por modalidade |
| **Extractor** | Transformar pacote semântico em sinais estruturados | Falar ao cliente, decidir gate |
| **Policy/Core** | Aplicar regras MCMV, decidir stage e next step | Receber transcrição bruta, decidir por áudio |
| **Speech Engine / IA** | Redigir surface final ao cliente | Persistir, criar slot, decidir regra |
| **Persistence Adapter** | Persistir sinais confirmados e evidências | Falar, decidir, criar novos dados sem sinal |

---

## 11. Smoke documental/estrutural do contrato de áudio

Este smoke valida que o contrato está estruturalmente coerente antes da implementação técnica (PR 48).

### 11.1 Checklist estrutural

- [x] `AudioInputEntry` tem campo `entry_id` único — rastreabilidade garantida
- [x] `session_id` e `turn_id` vinculam áudio ao mesmo contexto do texto
- [x] `source_type` diferencia origem sem criar lógica separada por canal
- [x] `duration_ms` é obrigatório — metadado operacional básico
- [x] `transcript_text` + `transcript_confidence` + `transcript_status` cobrem todos os cenários de transcrição
- [x] `evidence_status` cobre todos os estados possíveis da evidência
- [x] `normalized_text` é o campo que converge ao pacote semântico do texto
- [x] `normalization_applied` permite rastrear o que foi feito no texto
- [x] `evidence_ref` + `evidence_payload` permitem persistência rastreável da evidência
- [x] `raw_audio_ref` garante que o binário nunca está em linha
- [x] `owner` e timestamps cobrem auditoria e explicabilidade

### 11.2 Checklist de boundaries

- [x] Áudio bruto = evento → referência opaca. Nunca binário persistido em linha.
- [x] Transcrição = evidência de entrada. Não é fato, não é slot, não é estado soberano.
- [x] Evidência = rastreável, com confiança declarada. Não é decisão.
- [x] Normalização = limpeza mínima. Não é extração semântica.
- [x] Pacote semântico = entrada do Extractor. Idêntico ao do texto puro.
- [x] Estado soberano do Core = apenas sinais confirmados via Extractor + validação.
- [x] Persistência = via Adapter canônico. Nunca direta do pipeline de áudio.

### 11.3 Checklist de conformidade com soberania

- [x] IA continua soberana na fala — pipeline de áudio não redige resposta ao cliente
- [x] Core continua soberano nas regras — pipeline de áudio não decide gate nem stage
- [x] Extractor continua soberano na extração — transcrição não bypassa o Extractor
- [x] Adapter continua soberano na persistência — pipeline de áudio não persiste diretamente
- [x] Nenhum trilho paralelo de áudio criado — mesmo cérebro conversacional do texto

### 11.4 Checklist de fora de escopo (confirmado como ausente nesta PR)

- [x] STT/TTS real: **ausente** — stub declarado como `source_type = test_stub`
- [x] Canal Meta/WhatsApp: **ausente** — `source_type = whatsapp_voice` reservado para Frente 6
- [x] Pipeline funcional: **ausente** — casca técnica virá na PR 48
- [x] Rollout/shadow/canary: **ausente** — Frente 8
- [x] Telemetria profunda: **ausente** — Frente 7
- [x] Surface concorrente: **ausente** — IA continua soberana na fala

---

## 12. Referência de uso por PR

| PR | O que usa deste contrato |
|----|--------------------------|
| **PR 46 (esta)** | Define o objeto completo — não implementa nada |
| **PR 47** | Usa `normalized_text` para convergir ao pacote semântico; define como `evidence_status` afeta o slot |
| **PR 48** | Implementa a casca técnica que produz `AudioInputEntry` com `source_type = test_stub` |
| **PR 49** | Smoke integrado usando `AudioInputEntry` de ponta a ponta |

---

## 13. Conformidade com soberania da IA

Este documento declara conformidade integral com `schema/ADENDO_CANONICO_SOBERANIA_IA.md`.

Regras aplicadas explicitamente:

- **IA soberana na fala:** nenhum campo ou camada do `AudioInputEntry` escreve resposta ao cliente.
- **Core soberano na regra:** `transcript_confidence` e `evidence_status` informam o fluxo — não decidem gate.
- **Extractor soberano na extração:** `normalized_text` é a entrada; o Extractor decide o sinal.
- **Adapter soberano na persistência:** evidências e sinais persistem via Adapter canônico da Frente 4.
- **Proibição P1 cumprida:** mecânico (pipeline de áudio) sem nenhuma prioridade de fala.

---

## 14. Estado deste documento

| Campo | Valor |
|-------|-------|
| Status | ativo — PR 46 concluída |
| Próxima PR que consome | PR 47 — convergência áudio → pacote semântico |
| O que esta PR entrega | Contrato canônico completo de entrada de áudio |
| O que esta PR não entrega | Implementação técnica (PR 48), STT/TTS real, canal externo, rollout |
