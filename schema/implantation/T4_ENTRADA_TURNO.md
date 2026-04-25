# T4_ENTRADA_TURNO — Padronização da Entrada do Turno — ENOVA 2

## Finalidade

Este documento define o **schema canônico de entrada de turno** (`TurnoEntrada`) para o
orquestrador de turno LLM-first da ENOVA 2.

`TurnoEntrada` é a interface de contrato que o canal/gateway entrega ao orquestrador no início de
cada ciclo de atendimento. Ela consolida tudo o que o orquestrador precisa saber para montar o
contexto do LLM e acionar o pipeline — sem decidir, sem falar, sem persistir e sem aplicar policy.

**Princípio canônico:**

> `TurnoEntrada` carrega contexto — nunca produz resposta.
> O orquestrador lê a entrada, monta o pipeline, aciona o LLM.
> O LLM decide o que dizer. O policy engine decide as ações.
> A entrada nunca substitui nenhum dos dois.

**Pré-requisitos obrigatórios:**

- `schema/implantation/T2_LEAD_STATE_V1.md` (PR-T2.2) — shape de `lead_state` que entra no campo
  `lead_state` da `TurnoEntrada`; 11 blocos canônicos.
- `schema/implantation/T2_RESUMO_PERSISTIDO.md` (PR-T2.5) — camadas L1/L2/L3/L4 do histórico;
  base para montagem de contexto mínimo.
- `schema/implantation/T1_CONTRATO_SAIDA.md` (PR-T1.4) — `TurnoSaida` com 13 campos canônicos;
  interface que o turno produz após consumir a `TurnoEntrada`.
- `schema/implantation/T3_CLASSES_POLITICA.md` (PR-T3.1) — shape `PolicyDecision` e
  `PolicyDecisionSet`; referenciados nos campos opcionais de contexto pré-calculado.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (PR-T3.4) — `VetoSuaveRecord` e
  `soft_vetos[]`; campo opcional de contexto de política.

**Microetapa do mestre coberta por este artefato:**

> **Microetapa 1 — T4:** "Padronizar a entrada (mensagem, anexos, canal, contexto resumido,
> estado, políticas, objetivo)."

**Princípios canônicos (A00-ADENDO-01 e A00-ADENDO-02):**

> 1. `TurnoEntrada` **nunca carrega `reply_text`** — nem como campo explícito,
>    nem como sugestão, nem como contexto embutido.
> 2. `TurnoEntrada` **não decide** — não avalia regras, não aplica policy, não reconcilia.
> 3. `TurnoEntrada` **não fala** — nenhum campo se destina ao cliente.
> 4. `TurnoEntrada` **não persiste** — é lida pelo orquestrador e descartada após o turno;
>    persistência é responsabilidade exclusiva de T4.3 (pós-validação).

**Base soberana:**

- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T4 (microetapa 1)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` — §5 Entradas, §7 CA-01/CA-02
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## §1 Shape canônico `TurnoEntrada`

### 1.1 Visão geral do shape descritivo

```
TurnoEntrada {
  // — CAMPOS OBRIGATÓRIOS —
  turn_id:           string            — identificador único deste turno (gerado pelo gateway)
  case_id:           string            — identificador do case em atendimento
  message_text:      string            — texto enviado pelo lead neste turno
  channel:           ChannelEnum       — canal de origem da mensagem
  lead_state:        LeadState         — estado completo do case (shape T2_LEAD_STATE_V1)
  current_objective: Objective         — objetivo operacional declarado para este turno
                                         (shape Objective de T1_CONTRATO_SAIDA §2.2)

  // — CAMPOS OPCIONAIS PERMITIDOS —
  attachments:       Attachment[]      — opcional; pode ser vazio; ver §2
  prior_decisions:   PolicyDecisionSet — opcional; policy decisions pré-calculadas quando
                                         disponíveis do turno anterior (shape T3_ORDEM §6)
  soft_vetos_ctx:    VetoSuaveRecord[] — opcional; vetos suaves ativos do turno anterior
                                         (shape T3_VETO_SUAVE §2)
  context_override:  ContextOverride   — opcional; dados de override operacional (ver §2.5)
}
```

### 1.2 ChannelEnum — valores canônicos

```
ChannelEnum = "whatsapp" | "sms" | "web_chat" | "voice_transcript" | "operator_manual"
```

| Valor | Descrição |
|-------|-----------|
| `whatsapp` | Mensagem de texto via WhatsApp (canal primário) |
| `sms` | Mensagem via SMS |
| `web_chat` | Chat via interface web |
| `voice_transcript` | Transcrição de áudio — lead falou, gateway transcreveu |
| `operator_manual` | Entrada inserida manualmente por operador Vasques |

### 1.3 Invariante global de LLM-first

> **Nenhum campo de `TurnoEntrada` pode conter `reply_text`, `mensagem_usuario`,
> `texto_cliente`, `resposta`, `frase` ou qualquer equivalente de texto final ao cliente.**
> Se contiver, a entrada está não conforme e o orquestrador deve rejeitar o turno com
> código de erro `TE-REPLY-TEXT-PROIBIDO`.

---

## §2 Campos obrigatórios — definição detalhada

### 2.1 `turn_id`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `string` |
| Obrigatório | Sim — turno sem `turn_id` é inválido |
| Origem | **Gateway** — gerado antes de entregar ao orquestrador |
| Semântica | Identificador único global por turno; âncora de rastreabilidade e telemetria |
| Formato mínimo | UUID v4 ou equivalente único por case; não derivável de dado pessoal do lead |
| Tratamento de ausência | Turno rejeitado: `ValidationError { code: "TE-TURN-ID-AUSENTE", fatal: true }` |
| Proibido | Conter `lead_id`, `CPF`, nome ou qualquer dado pessoal identificável |

### 2.2 `case_id`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `string` |
| Obrigatório | Sim — sem `case_id` não há âncora de persistência |
| Origem | **Gateway / mecânico** — existente desde a abertura do case; transportado a cada turno |
| Semântica | Liga o turno ao case persistido; permite ao orquestrador carregar o `lead_state` correto |
| Tratamento de ausência | Turno rejeitado: `ValidationError { code: "TE-CASE-ID-AUSENTE", fatal: true }` |
| Proibido | Ser gerado dentro do orquestrador; deve existir antes do turno; não expor ao cliente |

### 2.3 `message_text`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `string` |
| Obrigatório | Sim — texto do lead; base semântica do turno |
| Origem | **Canal** — texto bruto digitado ou transcrito do lead |
| Semântica | Conteúdo da mensagem do lead para este turno; entrada primária do LLM |
| Tratamento de ausência | Se `message_text` estiver vazio E não houver `attachments`, turno rejeitado: `ValidationError { code: "TE-MSG-AUSENTE", fatal: true }`. Se vazio mas `attachments` presente, turno válido com `message_text = ""`. |
| Tamanho | Sem limite máximo obrigatório neste contrato; truncagem é responsabilidade do pipeline (T4.2) |
| Proibido | O orquestrador nunca escreve neste campo; nunca substituir por resposta gerada; nunca adicionar contexto aqui |
| Nota `voice_transcript` | Quando `channel = "voice_transcript"`, o campo contém a transcrição em texto; qualidade de áudio é indicada via `lead_state.signals.signal_audio_quality` |

### 2.4 `channel`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `ChannelEnum` |
| Obrigatório | Sim — canal define contexto de formatação e limitações de resposta |
| Origem | **Gateway** — detectado automaticamente na origem da mensagem |
| Semântica | Informa o orquestrador sobre o ambiente de entrega para que o pipeline (T4.4) formate adequadamente a resposta |
| Tratamento de ausência | Turno rejeitado: `ValidationError { code: "TE-CHANNEL-AUSENTE", fatal: true }` |
| Coerência | Deve ser coerente com `lead_state.facts.fact_channel_origin`; divergência deve gerar `ValidationWarning { code: "TE-CHANNEL-DIVERGENTE" }` (não fatal) |

### 2.5 `lead_state`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `LeadState` — shape completo de `T2_LEAD_STATE_V1.md` |
| Obrigatório | Sim — base do contexto do turno; sem ele o LLM não tem estado do case |
| Origem | **Mecânico / Supabase** — carregado pelo gateway antes de entregar ao orquestrador |
| Semântica | Snapshot do estado do case no momento de início do turno; contém meta, operational, facts, derived, pending, conflicts, signals, history, vasques_notes, normative_context |
| Tratamento de ausência | Turno rejeitado: `ValidationError { code: "TE-LEAD-STATE-AUSENTE", fatal: true }`. Orquestrador nunca cria lead_state do zero durante o turno. |
| Tratamento de `lead_state` vazio/novo | Para novo lead (primeiro turno), `lead_state` existe com `meta` preenchido e demais blocos vazios/iniciais — isso é válido. |
| Proibido | O orquestrador nunca modifica `lead_state` dentro de `TurnoEntrada`; modificação só ocorre pós-validação na etapa de persistência (T4.3). |
| Imutabilidade na entrada | `TurnoEntrada.lead_state` é lido e nunca sobrescrito pelo pipeline — o pipeline cria um `lead_state_delta` separado. |

### 2.6 `current_objective`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Objective { type: OBJ_*, target?: string }` — shape de `T1_CONTRATO_SAIDA.md §2.2` |
| Obrigatório | Sim — objetivo guia o raciocínio do LLM e a avaliação do policy engine |
| Origem | **Mecânico** — derivado do `TurnoSaida.next_objective` do turno anterior; ou `OBJ_INICIAR` no primeiro turno |
| Semântica | Instrução operacional para o turno atual: o que o orquestrador precisa que o LLM conduza |
| Tratamento de ausência | Substituição por padrão: `current_objective = { type: "OBJ_INICIAR" }` com aviso: `ValidationWarning { code: "TE-OBJECTIVE-DEFAULT-APLICADO" }` (não fatal) |
| Valores canônicos de `type` | OBJ_* de `T1_TAXONOMIA_OFICIAL.md §3`: OBJ_INICIAR, OBJ_COLETAR, OBJ_CONFIRMAR, OBJ_ORIENTAR_IR, OBJ_RETORNAR_AO_TRILHO, OBJ_AVANÇAR, OBJ_HANDOFF, OBJ_ESCALAR, OBJ_ENCERRAR |
| Proibido | Conter texto ao cliente; sequenciar perguntas; contornar o raciocínio do LLM |

---

## §3 Campos opcionais — definição detalhada

### 3.1 `attachments`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `Attachment[]` — pode ser vazio |
| Obrigatório | Não — omitido quando o turno não tem anexos |
| Origem | **Canal / gateway** — arquivos enviados pelo lead junto com a mensagem |
| Shape de cada item | `Attachment { type: enum, url: string, mime_type: string, size_bytes: integer, transcribed_text?: string }` |
| `Attachment.type` | `"document"` \| `"image"` \| `"audio"` \| `"other"` |
| Semântica | Documentos ou mídia que complementam a mensagem do lead; úteis para T4.2 (contexto do LLM) |
| Tratamento de ausência | Omissão = array vazio — válido e esperado na maioria dos turnos |
| Proibido | O orquestrador nunca gera anexo; nunca armazena dentro de `TurnoEntrada`; processamento real é escopo T4.2+ |

### 3.2 `prior_decisions`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `PolicyDecisionSet` — shape de `T3_ORDEM_AVALIACAO_COMPOSICAO.md §6` |
| Obrigatório | Não — presente apenas quando policy decisions foram pré-calculadas antes do turno (ex.: ação agendada de turno anterior) |
| Origem | **Mecânico** — calculado pelo policy engine no encerramento do turno anterior |
| Semântica | Decisions já avaliadas que o orquestrador pode aplicar diretamente sem re-invocar o engine neste turno |
| Tratamento de ausência | Omissão válida — policy engine será invocado dentro do pipeline deste turno (T4.3) |
| Proibido | Conter `reply_text` em nenhuma `PolicyDecision.action`; inventar decisions não calculadas pelo engine |

### 3.3 `soft_vetos_ctx`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `VetoSuaveRecord[]` — shape de `T3_VETO_SUAVE_VALIDADOR.md §2` |
| Obrigatório | Não — presente apenas quando vetos suaves ativos do turno anterior devem ser propagados |
| Origem | **Mecânico** — lido de `lead_state.signals` ou de `PolicyDecisionSet.soft_vetos` do turno anterior |
| Semântica | Risco soft ativo que o LLM deve ter em contexto ao formular a resposta; não bloqueia, orienta |
| Tratamento de ausência | Omissão válida — LLM opera sem vetos propagados |
| Proibido | `VetoSuaveRecord` com `acknowledged = false` sem declaração explícita de propagação consciente |

### 3.4 `context_override`

| Aspecto | Definição |
|---------|-----------|
| Tipo | `ContextOverride { reason: string, operator_id: string, override_fields: string[] }` |
| Obrigatório | Não — uso restrito a intervenção manual do Vasques |
| Origem | **Operador** (Vasques exclusivamente) |
| Semântica | Permite ao operador sinalizar que o turno deve ser tratado com contexto especial (ex.: retomada após longa pausa, correção manual de fato) |
| Tratamento de ausência | Omissão = turno normal sem override |
| Proibido | Ser preenchido por automação; ser usado para contornar validação; carregar `reply_text` |

---

## §4 Campos explicitamente proibidos

Os campos abaixo **nunca** podem fazer parte de `TurnoEntrada`, mesmo que algum componente
upstream tente incluí-los:

| Campo proibido | Código de erro | Motivo |
|----------------|---------------|--------|
| `reply_text` (qualquer forma) | `TE-REPLY-TEXT-PROIBIDO` | Violação direta de A00-ADENDO-01 — soberania do LLM na fala |
| `mensagem_usuario` | `TE-REPLY-TEXT-PROIBIDO` | Alias de reply_text |
| `texto_cliente` | `TE-REPLY-TEXT-PROIBIDO` | Alias de reply_text |
| `resposta_sugerida` | `TE-REPLY-TEXT-PROIBIDO` | Sugestão de fala mecânica — proibida |
| `template_resposta` | `TE-REPLY-TEXT-PROIBIDO` | Template de fala mecânica — proibido |
| `policy_instructions_text` | `TE-POLICY-TEXT-PROIBIDO` | Instrução textual de política — policy só emite structs |
| `facts_delta` (na entrada) | `TE-DELTA-NA-ENTRADA` | Delta de fatos é responsabilidade do pipeline pós-LLM (T4.3) |
| `validation_result` (na entrada) | `TE-VALIDACAO-NA-ENTRADA` | Resultado de validação não existe antes do turno |
| `lead_state` mutável | `TE-LEAD-STATE-MUTAVEL` | Entrada é read-only para lead_state; mutação ocorre em T4.3 |
| Campos com `score_llm_*` | `TE-SCORE-NA-ENTRADA` | Score de qualidade é produzido pelo LLM após execução, não antes |

Se qualquer campo proibido for detectado na entrada, o orquestrador **deve**:
1. Rejeitar o turno com `ValidationError` correspondente.
2. Registrar o erro no rastro de turno (`TurnoRastro`) com `error_code` e `field_name`.
3. Acionar fallback `formato_invalido` (definido em PR-T4.5).
4. **Não continuar o pipeline** com entrada não conforme.

---

## §5 Regras de validação de presença

### 5.1 Tabela de validação

| Campo | Obrigatório | Tipo de erro se ausente | Fatal? | Comportamento |
|-------|-------------|------------------------|--------|---------------|
| `turn_id` | Sim | `TE-TURN-ID-AUSENTE` | Sim | Turno rejeitado; fallback `formato_invalido` |
| `case_id` | Sim | `TE-CASE-ID-AUSENTE` | Sim | Turno rejeitado; fallback `formato_invalido` |
| `message_text` | Condicional | `TE-MSG-AUSENTE` | Sim se sem `attachments` | Ver §2.3 |
| `channel` | Sim | `TE-CHANNEL-AUSENTE` | Sim | Turno rejeitado; fallback `formato_invalido` |
| `lead_state` | Sim | `TE-LEAD-STATE-AUSENTE` | Sim | Turno rejeitado; fallback `formato_invalido` |
| `current_objective` | Sim (com default) | `TE-OBJECTIVE-DEFAULT-APLICADO` | Não | Default `OBJ_INICIAR`; aviso no rastro |
| `attachments` | Não | — | — | Omissão = array vazio |
| `prior_decisions` | Não | — | — | Omissão = policy engine invocado no pipeline |
| `soft_vetos_ctx` | Não | — | — | Omissão = sem vetos propagados |
| `context_override` | Não | — | — | Omissão = turno normal |

### 5.2 Sequência de validação obrigatória

A validação de presença deve ocorrer **antes** de qualquer etapa do pipeline (antes de T4.2):

```
TurnoEntrada recebida
       │
       ▼
[V1] Verificar campos obrigatórios (turn_id, case_id, channel, lead_state)
       │ falha → ValidationError fatal → fallback formato_invalido
       ▼
[V2] Verificar message_text × attachments
       │ ambos ausentes → ValidationError fatal → fallback formato_invalido
       ▼
[V3] Verificar campos proibidos (reply_text e equivalentes)
       │ encontrado → ValidationError fatal → fallback formato_invalido
       ▼
[V4] Verificar current_objective
       │ ausente → aplicar default OBJ_INICIAR + ValidationWarning (não fatal)
       ▼
[V5] Verificar coerência channel × lead_state.facts.fact_channel_origin
       │ divergente → ValidationWarning (não fatal) + continua
       ▼
[V6] Entrada validada — orquestrador pode montar contexto
```

### 5.3 `ValidationError` e `ValidationWarning` — shapes

```
ValidationError {
  code:        string   — código canônico TE-*
  field_name:  string   — campo que causou o erro
  fatal:       boolean  — true = turno interrompido; false = aviso apenas
  turn_id?:    string   — quando disponível (pode ser nulo se turn_id ausente)
  case_id?:    string   — quando disponível
  timestamp:   datetime — momento da detecção
}

ValidationWarning {
  code:       string   — código canônico TE-*
  field_name: string
  turn_id:    string
  case_id:    string
  timestamp:  datetime
}
```

---

## §6 Montagem de contexto mínimo

Após validação (§5), o orquestrador extrai de `TurnoEntrada` o contexto mínimo para montar o
prompt do LLM (escopo T4.2). Este documento define **o que extrair** — como montar o prompt é
escopo de T4.2.

### 6.1 Componentes obrigatórios do contexto mínimo

| Componente | Origem em TurnoEntrada | Conteúdo extraído | Regra |
|------------|------------------------|-------------------|-------|
| **Mensagem do lead** | `message_text` (+ `attachments`) | Texto do turno atual | Sempre presente |
| **Objetivo do turno** | `current_objective` | `type` + `target` | Instrução operacional para o LLM |
| **Estado do case** | `lead_state.operational` | `current_phase`, `blocked_by`, `must_ask_now`, `open_contradictions`, `needs_confirmation`, `elegibility_status`, `risk_level` | Contexto macroscópico do case |
| **Fatos coletados** | `lead_state.facts` (L2) | Todos os `fact_*` com status `confirmed` ou `captured`; cada um com `value`, `status`, `source` | Base factual para raciocínio |
| **Fatos derivados** | `lead_state.derived` | `derived_*` não obsoletos | Derivações calculadas; complementam L2 |
| **Pendências ativas** | `lead_state.pending` | Todos os `Pending` com `type` e `target` | Slots obrigatórios ainda abertos |
| **Conflitos abertos** | `lead_state.conflicts` | Todos os `Conflict` com `type` e `facts_involved` | Contradições que exigem confirmação |
| **Histórico recente** | `lead_state.history` (L1 + L3) | Últimos 3–5 turnos (L1) + snapshot executivo (L3 se existente) | Continuidade e resumo executivo |
| **Vetos suaves** | `soft_vetos_ctx` (se presente) | `VetoSuaveRecord[]` com `risk_type` e `description` | Riscos soft para raciocínio do LLM |
| **Canal** | `channel` | Canal de origem | Contexto de formatação para T4.4 |

### 6.2 Componentes condicionalmente incluídos

| Componente | Condição de inclusão | Origem | Regra |
|------------|---------------------|--------|-------|
| **Decisions pré-calculadas** | `prior_decisions` presente e não vazio | `prior_decisions.decisions[]` | Apenas como informação de contexto — não substitui invocação do policy engine em T4.3 |
| **Notas Vasques** | `lead_state.vasques_notes` não vazio | `VasquesNote[]` | Incluídas como contexto de qualificação manual |
| **Contexto normativo** | `lead_state.normative_context` | `NormativeContext` | Incluído quando `current_phase` exige referência normativa ativa |
| **Sinal de áudio** | `channel == "voice_transcript"` | `lead_state.signals.signal_audio_quality` | Incluído para alertar LLM sobre qualidade de transcrição |

### 6.3 O que NÃO entra no contexto do LLM

O orquestrador **nunca** passa ao LLM:

| Item proibido no contexto | Motivo |
|--------------------------|--------|
| `reply_text` de turnos anteriores (de L1) | L1 contém estrutura de saída — `reply_text` de turnos passados é dado de conversa, não contexto operacional; passar como "exemplo" viola soberania do LLM |
| Instruções de vocabulário ou tom | Viola A00-ADENDO-01 — LLM soberano na fala |
| Templates de resposta | Viola A00-ADENDO-01 — proibição absoluta de fala mecânica |
| `ValidationResult` em andamento | Ainda não executado neste ponto do pipeline |
| `TurnoRastro` em construção | Rastro é produzido após o turno — não disponível na entrada |
| Campos de L4 (histórico frio) | L4 não é carregado automaticamente — acesso sob demanda explícita |
| Dados de `context_override` ao LLM | Override é para o orquestrador, não para o LLM |

### 6.4 Shape do `ContextoTurno` (saída da montagem)

O orquestrador produz, a partir de `TurnoEntrada`, o `ContextoTurno` que alimenta T4.2:

```
ContextoTurno {
  turn_id:             string                  — de TurnoEntrada.turn_id
  case_id:             string                  — de TurnoEntrada.case_id
  channel:             ChannelEnum             — de TurnoEntrada.channel
  message_text:        string                  — de TurnoEntrada.message_text
  attachments:         Attachment[]            — de TurnoEntrada.attachments (pode ser vazio)
  current_objective:   Objective               — de TurnoEntrada.current_objective
  operational_ctx:     OperationalContext      — extraído de lead_state.operational
  facts_ctx:           FactEntry[]             — lead_state.facts (confirmados + captured)
  derived_ctx:         DerivedEntry[]          — lead_state.derived (não obsoletos)
  pending_ctx:         Pending[]               — lead_state.pending
  conflicts_ctx:       Conflict[]              — lead_state.conflicts
  history_l1:          TurnoRecord[]           — lead_state.history.short_term (L1)
  history_l3:          SnapshotExecutivo?      — lead_state.history.snapshot (L3) se existente
  soft_vetos:          VetoSuaveRecord[]       — de soft_vetos_ctx (pode ser vazio)
  vasques_notes:       VasquesNote[]           — de lead_state.vasques_notes (pode ser vazio)
  prior_decisions:     PolicyDecisionSet?      — de prior_decisions (pode ser nulo)
  validation_warnings: ValidationWarning[]     — warnings de V4/V5 da validação de entrada
}

OperationalContext {
  current_phase:         enum       — valor atual de current_phase
  risk_level:            enum       — risk_level atual
  blocked_by:            Block[]    — bloqueios ativos
  must_ask_now:          string[]   — fact_keys prioritários neste turno
  needs_confirmation:    boolean    — se há fato em contradição aguardando confirmação
  elegibility_status:    enum       — status de elegibilidade atual
  open_contradictions:   Conflict[] — conflitos não resolvidos
}
```

---

## §7 Tratamento de campos ausentes — tabela consolidada

| Campo ausente | Fatal? | Ação | Código | Continua pipeline? |
|---------------|--------|------|--------|--------------------|
| `turn_id` | Sim | Rejeita turno | `TE-TURN-ID-AUSENTE` | Não — fallback `formato_invalido` |
| `case_id` | Sim | Rejeita turno | `TE-CASE-ID-AUSENTE` | Não — fallback `formato_invalido` |
| `message_text` (sem attachments) | Sim | Rejeita turno | `TE-MSG-AUSENTE` | Não — fallback `formato_invalido` |
| `message_text` (com attachments) | Não | Usa `""` | — | Sim — contexto via attachments |
| `channel` | Sim | Rejeita turno | `TE-CHANNEL-AUSENTE` | Não — fallback `formato_invalido` |
| `lead_state` | Sim | Rejeita turno | `TE-LEAD-STATE-AUSENTE` | Não — fallback `formato_invalido` |
| `current_objective` | Não | Default `OBJ_INICIAR` | `TE-OBJECTIVE-DEFAULT-APLICADO` | Sim — com warning |
| `attachments` | Não | Default `[]` | — | Sim |
| `prior_decisions` | Não | Default nulo | — | Sim — engine invocado em T4.3 |
| `soft_vetos_ctx` | Não | Default `[]` | — | Sim |
| `context_override` | Não | Default nulo | — | Sim |
| Campo proibido presente | Fatal (especial) | Rejeita turno | `TE-REPLY-TEXT-PROIBIDO` etc. | Não — fallback `formato_invalido` |

---

## §8 Relação com os demais componentes do pipeline

`TurnoEntrada` é a **única interface de entrada** do orquestrador. Ela não é criada dentro do
pipeline — é recebida de fora e validada no início.

```
GATEWAY / CANAL
      │
      │  TurnoEntrada {turn_id, case_id, message_text, channel, lead_state, current_objective, ...}
      ▼
ORQUESTRADOR T4
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Etapa 1 — VALIDAÇÃO DE ENTRADA (este artefato — §5)                 │
  │   Valida presença; detecta campos proibidos; aplica defaults        │
  │                     ↓                                               │
  │ Etapa 2 — MONTAGEM DE CONTEXTO (este artefato — §6)                 │
  │   Extrai ContextoTurno de TurnoEntrada                              │
  │                     ↓                                               │
  │ Etapa 3 — PIPELINE LLM (T4_PIPELINE_LLM.md — PR-T4.2)              │
  │   Monta prompt; chama LLM; captura TurnoSaida                       │
  │                     ↓                                               │
  │ Etapa 4 — VALIDAÇÃO + PERSISTÊNCIA (T4_VALIDACAO_PERSISTENCIA — PR-T4.3) │
  │   Policy engine; validador VC-01..VC-09; reconciliação; persistência │
  │                     ↓                                               │
  │ Etapa 5 — RESPOSTA + RASTRO + MÉTRICAS (PR-T4.4)                    │
  │   Entrega reply_text ao canal; registra TurnoRastro                 │
  └─────────────────────────────────────────────────────────────────────┘
```

**Posição no pipeline:** `TurnoEntrada` é consumida apenas nas Etapas 1 e 2.
A partir da Etapa 3, o orquestrador trabalha com `ContextoTurno`, não com `TurnoEntrada` diretamente.

---

## §9 Regras invioláveis (TE-INV-01..TE-INV-10)

| Código | Regra |
|--------|-------|
| **TE-INV-01** | `TurnoEntrada` nunca carrega `reply_text` em qualquer campo — se encontrado, turno rejeitado imediatamente. |
| **TE-INV-02** | `TurnoEntrada` não toma decisão de negócio — nenhum campo instrui o LLM sobre o que dizer. |
| **TE-INV-03** | `lead_state` dentro de `TurnoEntrada` é imutável durante o pipeline de entrada; modificação só ocorre em T4.3. |
| **TE-INV-04** | `turn_id` e `case_id` são sempre gerados fora do orquestrador — nunca criados internamente. |
| **TE-INV-05** | Campo ausente fatal gera `ValidationError` e ativa fallback `formato_invalido` — nunca improviso. |
| **TE-INV-06** | `current_objective.type` é sempre um `OBJ_*` canônico de `T1_TAXONOMIA_OFICIAL.md` — nunca string livre. |
| **TE-INV-07** | `channel` deve ser um valor de `ChannelEnum` — valor desconhecido é tratado como erro fatal. |
| **TE-INV-08** | `TurnoEntrada` não persiste — é lida, validada, consumida para montar `ContextoTurno`, e descartada após o pipeline. |
| **TE-INV-09** | Erros de validação da entrada são sempre registrados no `TurnoRastro` — erro silencioso é violação contratual. |
| **TE-INV-10** | `prior_decisions` opcional nunca substitui a execução do policy engine em T4.3 — apenas fornece contexto. |

---

## §10 Anti-padrões proibidos

| Código | Anti-padrão | Violação |
|--------|-------------|---------|
| AP-TE-01 | Incluir `reply_text` em qualquer campo de `TurnoEntrada` | A00-ADENDO-01; TE-INV-01 |
| AP-TE-02 | Montar `TurnoEntrada` com `lead_state` pré-editado (campos já modificados pelo pipeline) | TE-INV-03 — entrada deve refletir estado persistido, não estado especulativo |
| AP-TE-03 | Usar `context_override` como mecanismo de injeção de resposta ou instrução de vocabulário | §3.4 — override é para orquestrador; nunca para o LLM |
| AP-TE-04 | Omitir validação de presença por "eficiência" | §5 — validação é obrigatória antes de qualquer etapa do pipeline |
| AP-TE-05 | Permitir que L4 (histórico frio) seja carregado automaticamente na entrada | §6.3 — L4 não é carregado automaticamente; acesso sob demanda explícita |
| AP-TE-06 | Tratar `current_objective` como sequência de perguntas pré-montadas | CA-01; A00-ADENDO-01 — objetivo instrui direção, não texto |
| AP-TE-07 | Propagar `reply_text` do turno anterior como parte do `history_l1` no contexto | §6.3 — reply_text passado não é contexto operacional; viola soberania LLM |
| AP-TE-08 | Criar `facts_delta` dentro de `TurnoEntrada` antes do LLM executar | §4 — delta de fatos é produzido em T4.3, nunca na entrada |
| AP-TE-09 | Aceitar `TurnoEntrada` com campo proibido e continuar o pipeline silenciosamente | §4; TE-INV-09 — erro deve ser registrado e turno rejeitado |
| AP-TE-10 | Usar `attachments` para transportar resultado de processamento de documento | §3.1 — attachments são input bruto; processamento é escopo T4.2+ |
| AP-TE-11 | Gerar `turn_id` ou `case_id` dentro do orquestrador durante o pipeline | TE-INV-04 — ambos são responsabilidade do gateway |
| AP-TE-12 | Considerar `prior_decisions` como resultado final de policy sem re-executar o engine | TE-INV-10 — engine deve rodar em T4.3 de qualquer forma |

---

## §11 Exemplos sintéticos

### E1 — Primeiro turno: lead novo, sem estado acumulado

**Cenário:** Lead recém-chegado via WhatsApp, sem histórico, primeiro contato.

```
TurnoEntrada {
  turn_id:           "turn-a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  case_id:           "case-0001-2026-04-25"
  message_text:      "Oi, quero saber como funciona o Minha Casa Minha Vida"
  channel:           "whatsapp"
  lead_state: {
    meta: {
      lead_id:        "lead-uuid-0001",
      case_id:        "case-0001-2026-04-25",
      created_at:     "2026-04-25T10:00:00Z",
      last_updated:   "2026-04-25T10:00:00Z",
      channel_origin: "whatsapp"
    },
    operational: {
      current_phase:       "discovery",
      current_objective:   { type: "OBJ_INICIAR" },
      progress_score:      0,
      risk_level:          "none",
      must_ask_now:        [],
      blocked_by:          [],
      needs_confirmation:  false,
      elegibility_status:  "unknown"
    },
    facts: {},       // nenhum fato coletado ainda
    derived: {},
    pending: [],
    conflicts: [],
    signals: {},
    history: { short_term: [], snapshot: null },
    vasques_notes: [],
    normative_context: { active_program: "MCMV" }
  }
  current_objective: { type: "OBJ_INICIAR" }
  // attachments: omitido (sem anexos)
  // prior_decisions: omitido (primeiro turno)
  // soft_vetos_ctx: omitido
}
```

**Validação esperada:** V1–V5 PASS; V4 sem default (objective presente); pipeline segue.

---

### E2 — Turno intermediário: lead com estado parcial, objetivo de coleta

**Cenário:** Lead no turno 4, em `qualification`, regime CLT confirmado, renda pendente.

```
TurnoEntrada {
  turn_id:           "turn-bbcc1122-3344-5566-7788-99aabb001122"
  case_id:           "case-0042-2026-04-25"
  message_text:      "Trabalho com carteira assinada, ganho uns 3.000 por mês"
  channel:           "whatsapp"
  lead_state: {
    // ... (meta, operational com current_phase="qualification") ...
    operational: {
      current_phase:       "qualification",
      current_objective:   { type: "OBJ_COLETAR", target: "fact_monthly_income_p1" },
      progress_score:      45,
      risk_level:          "low",
      must_ask_now:        ["fact_monthly_income_p1"],
      blocked_by:          [],
      needs_confirmation:  false,
      elegibility_status:  "unknown"
    },
    facts: {
      fact_work_regime_p1: { value: "CLT", status: "confirmed", source: "llm_collected", confirmed: true, turn_set: 2, confidence: "high" }
    },
    pending: [
      { type: "PEND_SLOT_VAZIO", target: "fact_monthly_income_p1" }
    ]
    // ...
  }
  current_objective: { type: "OBJ_COLETAR", target: "fact_monthly_income_p1" }
}
```

**Validação esperada:** Todos os campos presentes; V1–V5 PASS; pipeline segue.

---

### E3 — Turno com objective ausente: default aplicado

**Cenário:** Gateway entrega TurnoEntrada sem `current_objective` (bug de integração).

```
TurnoEntrada {
  turn_id:    "turn-ccdd3344-5566-7788-99aa-bbcc11223344"
  case_id:    "case-0100-2026-04-25"
  message_text: "Oi, continuando..."
  channel:    "whatsapp"
  lead_state: { /* estado válido */ }
  // current_objective: AUSENTE
}
```

**Resultado da validação:**
- V4 detecta ausência → default aplicado: `current_objective = { type: "OBJ_INICIAR" }`
- `ValidationWarning { code: "TE-OBJECTIVE-DEFAULT-APLICADO", field_name: "current_objective", ... }`
- Pipeline continua com objetivo padrão; warning registrado no `TurnoRastro`.

---

### E4 — Turno com campo proibido: rejeitado

**Cenário:** Bug upstream inclui sugestão de resposta na entrada.

```
TurnoEntrada {
  turn_id:            "turn-eeff5566-..."
  case_id:            "case-0200-..."
  message_text:       "Trabalho como autônomo"
  channel:            "whatsapp"
  lead_state:         { /* estado válido */ }
  current_objective:  { type: "OBJ_COLETAR", target: "fact_work_regime_p1" }
  reply_text:         "Entendido! Sendo autônomo, vou precisar de..."  // PROIBIDO
}
```

**Resultado:**
- V3 detecta campo `reply_text` → `ValidationError { code: "TE-REPLY-TEXT-PROIBIDO", field_name: "reply_text", fatal: true }`
- Turno rejeitado; fallback `formato_invalido` acionado (T4.5).
- Erro registrado no `TurnoRastro`.
- Pipeline não avança.

---

### E5 — Turno com vetos suaves propagados do turno anterior

**Cenário:** Lead autônomo, turno anterior gerou veto suave de IR pendente.

```
TurnoEntrada {
  turn_id:           "turn-ff001122-..."
  case_id:           "case-0300-..."
  message_text:      "Não, não tenho declaração de IR, nunca fiz"
  channel:           "whatsapp"
  lead_state: {
    // ... operational com qualification ...
    facts: {
      fact_work_regime_p1:    { value: "autonomo", status: "confirmed", confirmed: true },
      fact_autonomo_has_ir_p1: { value: "nao", status: "captured", confirmed: false }
    }
    // ...
  }
  current_objective: { type: "OBJ_ORIENTAR_IR", target: "fact_autonomo_has_ir_p1" }
  soft_vetos_ctx: [
    {
      risk_type:   "RISCO_IR_AUTONOMO",
      description: "Autônomo sem IR — risco de comprovação de renda reduzido",
      acknowledged: false,
      emitted_at_turn: 7
    }
  ]
}
```

**Validação:** V1–V5 PASS; `soft_vetos_ctx` presente e incluído em `ContextoTurno.soft_vetos`.

---

## §12 Cobertura das microetapas do mestre

| Microetapa do mestre (T4) | Cobertura neste documento |
|--------------------------|--------------------------|
| Microetapa 1 — "Padronizar a entrada (mensagem, anexos, canal, contexto resumido, estado, políticas, objetivo)" | Cobertura completa: §1 (shape), §2 (campos obrigatórios), §3 (campos opcionais incluindo attachments e prior_decisions), §5 (validação), §6 (montagem de contexto) ✓ |
| Microetapas 2–5 | Declaradas como escopo das PRs T4.2–T4.5; não cobertas aqui |

---

## §13 Validação cruzada com artefatos T1/T2/T3

| Referência cruzada | Campo/shape verificado | Status |
|-------------------|----------------------|--------|
| `T1_CONTRATO_SAIDA.md §2.2` | `TurnoEntrada.current_objective` usa shape `Objective {type: OBJ_*, target?}` | **PASS** — shape idêntico |
| `T1_TAXONOMIA_OFICIAL.md §3` | `current_objective.type` restrito a OBJ_* canônicos | **PASS** — TE-INV-06 |
| `T2_LEAD_STATE_V1.md §1` | `TurnoEntrada.lead_state` usa shape `LeadState` completo (11 blocos) | **PASS** — tipo referenciado |
| `T2_LEAD_STATE_V1.md §2.2` | `TurnoEntrada.case_id` = `lead_state.meta.case_id` | **PASS** — coerência obrigatória |
| `T2_LEAD_STATE_V1.md §3.2` | `OperationalContext` extrai campos de `OperationalState` | **PASS** — subset fiel |
| `T2_LEAD_STATE_V1.md §4.2` | Fatos extraídos mantêm shape `FactEntry` com `status`, `source`, `confirmed` | **PASS** — sem inventar campos |
| `T2_RESUMO_PERSISTIDO.md §1.1` | `history_l1` (L1) e `history_l3` (L3) extraídos de `lead_state.history` | **PASS** — camadas respeitadas |
| `T2_RESUMO_PERSISTIDO.md §1.2` | L4 não carregado automaticamente | **PASS** — AP-TE-05; §6.3 |
| `T3_CLASSES_POLITICA.md §1` | `prior_decisions.decisions[]` são `PolicyDecision[]` sem `reply_text` em action | **PASS** — TE-INV-01 + AP-TE-01 |
| `T3_VETO_SUAVE_VALIDADOR.md §2` | `soft_vetos_ctx` usa shape `VetoSuaveRecord[]` | **PASS** — tipo referenciado |
| `T4_CONTRATO.md §7 CA-01` | Nenhum campo de TurnoEntrada produz `reply_text` | **PASS** — §1.3; §4; TE-INV-01 |
| `T4_CONTRATO.md §7 CA-02` | Shape `TurnoEntrada` com 6 campos obrigatórios mínimos declarados | **PASS** — §2 completo |
| `A00-ADENDO-01` | Soberania LLM na fala — TurnoEntrada não redige nada | **PASS** — §1.3; §6.3; AP-TE-01..03; TE-INV-01/02 |
| `A00-ADENDO-02` | Orquestrador como coordenador — entrada não assume papel de casca dominante | **PASS** — §1; §6.3; AP-TE-06 |

---

## Bloco E — PR-T4.1

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_ENTRADA_TURNO.md (este documento)
PR que fecha:                          PR-T4.1 (Padronização da entrada do turno)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — shape TurnoEntrada com 6 campos obrigatórios e 4
                                       opcionais documentados; regras de validação V1–V6
                                       declaradas; montagem de ContextoTurno especificada;
                                       campos proibidos com códigos de erro canônicos;
                                       12 anti-padrões; 5 exemplos sintéticos; cobertura
                                       microetapa 1 confirmada; validação cruzada completa.
                                       Montagem do prompt (T4.2) e execução do pipeline
                                       (T4.3–T4.5) são escopos de PRs subsequentes —
                                       não são lacunas desta PR.
Há item parcial/inconclusivo bloqueante?: não — todos os campos têm origem, validação,
                                       tratamento de ausência e proibições documentadas;
                                       TE-INV-01..10 declaradas; invariante LLM-first
                                       verificada em cada ponto de entrada.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.1 CONCLUÍDA; T4_ENTRADA_TURNO.md publicado;
                                       PR-T4.2 desbloqueada.
Próxima PR autorizada:                 PR-T4.2 — Pipeline LLM com contrato único
```
