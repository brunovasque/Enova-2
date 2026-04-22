# CONTRATO TECNICO DE CANAL — ENVELOPE DE INTEGRACAO — FRENTE 6 — ENOVA 2

> **PR:** 2 — contrato tecnico do canal / envelope de integracao
> **Frente:** 6 — Meta/WhatsApp
> **Classificacao:** contratual
> **Status:** ativo
> **Precedencia:** A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > CONTRATO_META_WHATSAPP_2026-04-22 > **este documento**
> **Ultima atualizacao:** 2026-04-22

---

## Leitura obrigatoria antes deste documento

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`

---

## 1. Proposito deste documento

Definir o contrato tecnico canonico do envelope de integracao da Frente 6 antes de qualquer runtime real de webhook/canal.

Este documento fixa:

1. shape inbound e outbound;
2. eventos aceitos nesta fase;
3. regras minimas de idempotencia, retry, ack, erro e logs;
4. limites entre canal, Core, Speech e Adapter.

Este documento **nao** cria runtime real e **nao** altera deploy.

---

## 2. Escopo fechado da PR2

Incluido:

1. contrato estrutural do envelope de canal;
2. taxonomia de eventos tecnicos aceitos;
3. regras contratuais de idempotencia e correlacao;
4. contrato de ack/erro/retry;
5. contrato de logs minimos.

Nao incluido:

1. webhook Meta real;
2. rota runtime no Worker;
3. secrets/bindings/vars/routes;
4. envio real para API da Meta.

---

## 3. Envelope canonico inbound

### 3.1 Eventos inbound aceitos nesta PR2

| Evento | Uso na PR2 | Observacao |
|---|---|---|
| `inbound.message.text` | aceito | texto normalizado para fluxo comum |
| `inbound.message.audio_stub` | aceito | referencia de audio sem STT real no canal |
| `inbound.message.media_stub` | aceito | placeholder de midia para rastreio |
| `inbound.delivery.status` | aceito | status tecnico de entrega |
| `inbound.system.ping` | aceito | health/evento tecnico |

### 3.2 Campos obrigatorios

| Campo | Tipo | Regra |
|---|---|---|
| `envelope_version` | `string` | fixo `front6.v1` |
| `direction` | `string` | fixo `inbound` |
| `channel` | `string` | fixo `meta_whatsapp` |
| `event_type` | `string` | um dos eventos da secao 3.1 |
| `event_id` | `string` | id unico do evento recebido |
| `occurred_at` | `string (ISO 8601)` | timestamp da origem |
| `received_at` | `string (ISO 8601)` | timestamp de ingresso no canal adapter |
| `trace_id` | `string` | correlacao transversal do turno |
| `idempotency_key` | `string` | chave deterministica de deduplicacao |
| `lead_ref` | `string` | referencia do lead/sessao |
| `payload` | `object` | conteudo minimo do evento |

### 3.3 Exemplo canonicamente valido

```json
{
  "envelope_version": "front6.v1",
  "direction": "inbound",
  "channel": "meta_whatsapp",
  "event_type": "inbound.message.text",
  "event_id": "wamid.HBgLM...",
  "occurred_at": "2026-04-22T18:10:00Z",
  "received_at": "2026-04-22T18:10:01Z",
  "trace_id": "front6-trace-001",
  "idempotency_key": "meta_whatsapp:wamid.HBgLM...",
  "lead_ref": "lead-123",
  "payload": {
    "text": "Quero simular minha renda",
    "sender_ref": "wa:+5511999999999"
  }
}
```

---

## 4. Envelope canonico outbound

### 4.1 Eventos outbound aceitos nesta PR2

| Evento | Uso na PR2 | Observacao |
|---|---|---|
| `outbound.message.text` | aceito | surface textual final para canal |
| `outbound.message.template_stub` | aceito | placeholder estrutural, sem envio real |
| `outbound.delivery.ack` | aceito | retorno tecnico de aceite local |
| `outbound.error` | aceito | erro tecnico rastreavel |

### 4.2 Campos obrigatorios

| Campo | Tipo | Regra |
|---|---|---|
| `envelope_version` | `string` | fixo `front6.v1` |
| `direction` | `string` | fixo `outbound` |
| `channel` | `string` | fixo `meta_whatsapp` |
| `event_type` | `string` | um dos eventos da secao 4.1 |
| `dispatch_id` | `string` | id unico de despacho |
| `created_at` | `string (ISO 8601)` | timestamp de criacao |
| `trace_id` | `string` | correlacao com inbound |
| `idempotency_key` | `string` | dedupe outbound |
| `lead_ref` | `string` | referencia do lead/sessao |
| `payload` | `object` | conteudo a despachar ou erro |

### 4.3 Exemplo canonicamente valido

```json
{
  "envelope_version": "front6.v1",
  "direction": "outbound",
  "channel": "meta_whatsapp",
  "event_type": "outbound.message.text",
  "dispatch_id": "dispatch-001",
  "created_at": "2026-04-22T18:10:02Z",
  "trace_id": "front6-trace-001",
  "idempotency_key": "meta_whatsapp:dispatch-001",
  "lead_ref": "lead-123",
  "payload": {
    "text": "Perfeito. Para te ajudar melhor, me diga sua renda aproximada.",
    "surface_origin": "ai_final_surface"
  }
}
```

---

## 5. Regras de idempotencia e correlacao

1. `idempotency_key` e obrigatoria em inbound e outbound.
2. Evento duplicado com mesma `idempotency_key` deve ser marcado como `duplicate`.
3. `trace_id` deve ser propagado ponta a ponta no recorte documental da frente.
4. Ausencia de `idempotency_key` invalida o envelope.

---

## 6. Regras minimas de ack, retry e erro

### 6.1 Ack

| Status de ack | Condicao |
|---|---|
| `accepted` | envelope valido e nao duplicado |
| `duplicate` | idempotency_key ja processada |
| `invalid` | envelope sem campos obrigatorios |
| `unsupported` | evento fora da taxonomia permitida |
| `temporary_failure` | falha tecnica transitoria |

### 6.2 Retry

1. Retry so para `temporary_failure`.
2. Maximo contratual: 3 tentativas por evento.
3. Duplicado nao deve abrir retry.

### 6.3 Erro contratual

Todo erro deve carregar:

1. `error_code` tecnico estavel;
2. `error_message` curta;
3. `trace_id`;
4. `event_id` ou `dispatch_id` relacionado.

---

## 7. Logs minimos obrigatorios

Eventos de log obrigatorios nesta fase documental:

1. `channel.envelope.received`
2. `channel.envelope.rejected`
3. `channel.envelope.duplicate`
4. `channel.envelope.forwarded`
5. `channel.outbound.ack`
6. `channel.outbound.error`

Todos com `trace_id`, `event_type`, `idempotency_key` e timestamp.

---

## 8. Limites entre canal, Core, Speech e Adapter

1. Canal valida e roteia envelope; canal nao decide regra de negocio.
2. Core decide regra/stage; Core nao conhece detalhes de webhook Meta.
3. Speech fornece surface final; canal nao cria surface mecanica propria.
4. Adapter persiste estado/sinais; canal nao persiste decisao de negocio.

---

## 9. Criterios de aceite documentais da PR2

C1. Documento contratual de envelope criado e versionado no repo.  
C2. Shape inbound/outbound definido com campos obrigatorios.  
C3. Taxonomia minima de eventos definida.  
C4. Regras minimas de idempotencia definidas.  
C5. Regras minimas de ack/retry/erro definidas.  
C6. Logs minimos obrigatorios definidos.  
C7. Limites canal/Core/Speech/Adapter definidos sem drift.  
C8. Nenhuma alteracao de runtime, `src/`, `scripts/`, `package.json` ou `wrangler.toml`.

---

## 10. Smoke documental rapido da PR2

Checklist:

1. contrato ativo ainda aponta PR2 como recorte executado;
2. status/handoff da Frente 6 sincronizados com PR2 concluida;
3. `_INDEX` de contratos e status coerentes com `em execucao`;
4. nenhum arquivo de runtime alterado no diff.

---

## 11. Proximo passo autorizado

**PR3 — runtime minimo do canal no Worker (rota tecnica minima, validacao de metodo/path/body e resposta controlada).**

---

## 12. Declaracoes obrigatorias desta PR2

- Mudancas em dados persistidos (Supabase): nenhuma
- Permissoes Cloudflare necessarias: nenhuma adicional

