# INVENTARIO_CANAIS_TELEMETRIA_T0

## Finalidade

Inventariar os canais de entrada/saída, superfícies de interação, endpoints e pontos de
telemetria/log/eventos do legado ENOVA 1, com rastreabilidade completa por item.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Documentos complementares consultados:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (fluxos/gates/superfícies vivos)
- `schema/implantation/INVENTARIO_REGRAS_T0.md` (regras PR-T0.2 — vinculação de ID)
- `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` (parsers/heurísticas PR-T0.3 — vinculação)
- `wrangler.toml` (confirmação de runtime Cloudflare Worker)

## Metodologia

Os itens foram identificados a partir de:

1. LEGADO_MESTRE soberano (markdown acessível — linhas citadas):
   - Seção Meta/WhatsApp (linhas 4953–4990): canais de entrada, responsabilidades, casos especiais
   - Seção telemetria (linhas 3330–3416): contrato mínimo de evento, tabelas Supabase-alvo E2
   - Seção Supabase (linhas 1748–1803): objetos de persistência e schema de tabelas
   - Seção canais/superfícies (linhas 949, 2069, 2030): `docs_channel_choice`, `channel_origin`
2. Inventário de fluxos vivos T0.1 (§2.1–§2.6, §4.1–§4.6):
   - Canais de entrada reais (texto/interativo, mídia, admin)
   - Superfícies vivas (`runFunnel`, pré-funil, `envio_docs`, correspondente/visita)
3. `wrangler.toml`: confirmação de Cloudflare Worker como runtime do endpoint

Critério de evidência: item incluído somente se citado em pelo menos uma fonte acessível
com referência auditável de linha ou seção.

## Nota de bifurcação obrigatória: E1 vs E2

Esta bifurcação é obrigatória conforme PR-T0.1 §13 e PR-T0.2:

- **Origem E1**: o que existe no runtime real da Enova 1 (evidenciado por T0.1 §2.x e §4.x)
- **Mapeamento alvo E2**: o que o LEGADO_MESTRE descreve como design-alvo dos PDFs

A coluna "origem no legado E1" refere-se à evidência de existência no E1.
A coluna "fonte auditável LEGADO_MESTRE" refere-se à linha/seção do markdown soberano.
Telemetria de tabelas Supabase citadas no LEGADO_MESTRE são **design-alvo E2** —
declaradas como tal em cada item; não constituem prova de existência no E1.

## Limitação

Blocos L17-L18 não estão transcritos. O detalhe fino da telemetria real do E1 (schema exato
de tabelas, eventos específicos emitidos, formato dos logs de correspondente/admin) está
somente em PDF. Os inconclusivos estão declarados na seção §8.

## Legenda de status

| Status | Definição |
|--------|-----------|
| `ativo` | Item operacional no E1, deve ser avaliado para migração na E2 |
| `condicional` | Item ativo com escopo limitado, transitório ou inconclusivo parcial |
| `residual` | Item existe mas sem evidência de uso produtivo atual; redesenho antes de migrar |
| `morto` | Item NÃO deve ser migrado (proibido por soberania LLM-first ou legado obsoleto) |

## Legenda de tipos

| Tipo | Definição |
|------|-----------|
| `canal` | Meio de comunicação entre cliente e sistema (entrada/saída) |
| `superfície` | Camada de interação ou processamento interno visível ao fluxo de negócio |
| `endpoint` | Ponto de entrada HTTP/rede acessível externamente |
| `telemetria` | Evento, log, tabela ou métrica que registra o comportamento do sistema |

---

## Tabela mestre — Canais

| ID | Tipo | Nome | Origem no legado E1 | Fonte auditável LEGADO_MESTRE | Regras PR-T0.2 | Parsers/Heurísticas PR-T0.3 | Status | Risco estrutural |
|----|------|------|---------------------|-------------------------------|----------------|------------------------------|--------|-----------------|
| CT-01 | canal | Texto/interativo WhatsApp — canal principal de entrada | L03 | T0_PR1 §2.1: "webhook de texto/interativo roteando até `runFunnel`"; LEGADO_MESTRE linha 4964: "ingestão de texto, áudio, imagem, documento e localização; idempotência por message_id" | RO-04, RR-01, RU-01 | PH-R02 (dedupe wamid), PH-H01 (offtrackGuard), PH-S08 (73 stages) | ativo | Canal único confirmado no E1; toda a cadeia de funil parte daqui; migração deve preservar idempotência e rastreabilidade por `wamid` |
| CT-02 | canal | Áudio WhatsApp — entrada de mídia de voz | L03, L18 | T0_PR1 §2.2: "mídia suportada entra por envelope próprio; persiste metadata; chama `runFunnel` com `caption`"; LEGADO_MESTRE linha 48: "expansão cara para áudio" | RO-04 | PH-P01 (extração de renda de áudio) | condicional | Áudio tratado como envelope de mídia; transcrição/extração estruturada em produção inconclusiva (L18 não transcrito); risco de tratamento genérico sem extração de fatos |
| CT-03 | canal | Imagem WhatsApp — entrada de documento/mídia visual | L03, L17 | T0_PR1 §2.2: envelope de mídia; LEGADO_MESTRE linha 542: "sticker/imagem como sinal complementar"; linha 1802: `enova_artifacts` type=doc (design E2) | RD-01, RD-02 | PH-P02 (handleCorrespondente — residual) | condicional | Imagem como documento (RG, CPF etc.) passa por `envio_docs`; detalhe de extração em L17 não transcrito |
| CT-04 | canal | Documento WhatsApp — envio de docs via WhatsApp | L17 | T0_PR1 §2.5: "`envio_docs` processa mídia"; LEGADO_MESTRE linha 2069: `docs_channel_choice: WhatsApp, site, visita presencial` | RD-01, RD-02, RD-03, RD-04, RD-05 | PH-F04 (keepStage), PH-S03 (routing dinâmico envio_docs) | ativo | Canal ativo de coleta de documentação; `keepStage` mantém stage até checklist fechar; acoplado ao stage `envio_docs` |
| CT-05 | canal | Sticker WhatsApp — sinal complementar | L03, L18 | LEGADO_MESTRE linha 48: "expansão cara para áudio, sticker e imagem"; linha 542: "sticker/imagem como sinal complementar e nunca como decisão cega" | RU-04 | PH-H01 (offtrackGuard — sticker pode ser offtrack) | condicional | Sem extração estruturada confirmada no E1; tratado como sinal contextual; risco de interpretação genérica sem fato âncora |
| CT-06 | canal | Site — envio de docs via upload web (alternativo) | L17 | LEGADO_MESTRE linha 2069: `docs_channel_choice: WhatsApp, site, visita presencial` | RD-03 | — | condicional | Canal alternativo para documentação; integração de upload via site não documentada fora de L17 (não transcrito) |
| CT-07 | canal | Visita presencial — entrega física de docs (alternativo) | L17 | LEGADO_MESTRE linha 2069: `docs_channel_choice: ... visita presencial`; T0_PR1 §5.1: `agendamento_visita` no trilho final | RO-02, RD-03 | — | ativo | Canal final de último recurso; aciona stage `agendamento_visita`; documentado como opção operacional real |

---

## Tabela mestre — Superfícies

| ID | Tipo | Nome | Origem no legado E1 | Fonte auditável LEGADO_MESTRE | Regras PR-T0.2 | Parsers/Heurísticas PR-T0.3 | Status | Risco estrutural |
|----|------|------|---------------------|-------------------------------|----------------|------------------------------|--------|-----------------|
| SF-01 | superfície | `runFunnel` — superfície mecânica central de decisão de stage | L03 | T0_PR1 §2.3: "`runFunnel` é o trilho principal"; §3: "73 stages únicos no switch(stage)"; §5.1: espinha dorsal observável | RR-01, RR-02, RR-03, RR-04 | PH-S08 (73 cases), PH-F01 (UNKNOWN_STAGE), PH-F06 (route_reason) | ativo | Superfície de decisão central; toda entrada passa por aqui; deve ser substituída por policy rules (T3/T4); não migrar diretamente |
| SF-02 | superfície | Pré-funil — camada de controle de entrada antes do `runFunnel` | L03 | T0_PR1 §2.1/§4.1: "dedupe por `wamid`; bypass de atendimento manual; comandos e retornos de correspondente; `offtrackGuard` pre-`runFunnel`" | RE-01, RO-04, RR-06 | PH-R02 (dedupe), PH-H01 (offtrackGuard) | ativo | Camada de controle crítica; lógica de dedupe e bypass deve ser preservada ao migrar; perder aqui = duplicação ou bypass indevido |
| SF-03 | superfície | Surface de fala mecânica por stage (E1) — cadeia rawArr/helper/bridge | L03 | LEGADO_MESTRE linha 4481: "cadeia de fallback, rawArr, helper e bridge da ENOVA 1"; INVENTARIO_REGRAS RM-01, RM-02, RU-06 | RM-01, RM-02, RU-06 | PH-F05 (cadeia fallback E1 — morto) | morto | Arquitetura de fala mecânica por prefixo acoplada ao stage; proibida na E2 por A00-ADENDO-01/02; não migrar nem referenciar como modelo de fala |
| SF-04 | superfície | `envio_docs` — superfície de coleta e processamento de documentação | L17 | T0_PR1 §2.5: "processa mídia; reprocessa checklist; pode avançar dinamicamente"; §5.2: `envio_docs => keepStage \|\| nextStage \|\| nextStageAfterUpload` | RD-01, RD-02, RD-03, RD-04, RD-05 | PH-F04 (keepStage), PH-S03 (routing dinâmico) | ativo | Superfície central de coleta de docs; três caminhos de saída dinâmicos; loop de stage até checklist fechar; risco de loop sem timeout |
| SF-05 | superfície | Trilho correspondente/visita — superfície operacional pós-entrega de docs | L17 | T0_PR1 §2.5: "`finalizacao_processo` e `aguardando_retorno_correspondente` formam trilho vivo"; §5.1: espinha dorsal final | RO-01, RO-02, RD-05 | PH-P02 (handleCorrespondenteRetorno — residual), PH-S04 (restricao_parceiro nextStage) | ativo | Trilho final de handoff operacional; `handleCorrespondenteRetorno` sem callsite ativo; redesenho necessário antes de migrar o trilho |
| SF-06 | superfície | Motor cognitivo acoplado — `COGNITIVE_V2_MODE` | L03, L19 | T0_PR1 §2.4: "gate cognitivo; branching por `COGNITIVE_V2_MODE`; whitelist de stages; validação de sinal"; §6: "ativação real em produção inconclusiva" | RE-05, RR-07 | PH-H02 (scoring cognitivo), PH-H03 (threshold confiança), PH-S06 (feature flag) | condicional | Motor em depreciação; ativação `on` em produção inconclusiva; não expandir; entra em shadow quando E2 estiver estável |
| SF-07 | superfície | Fluxo de simulação/admin — superfície de QA e controle | L03, L18 | T0_PR1 §2.6: "existe fluxo executável de simulação/admin; não confundir com fluxo produtivo" | RE-04 | — | residual | Artefato de QA/admin; não deve ter tratamento igual ao produtivo; não migrar diretamente; isolar completamente do fluxo produtivo na E2 |

---

## Tabela mestre — Endpoints

| ID | Tipo | Nome | Origem no legado E1 | Fonte auditável LEGADO_MESTRE | Regras PR-T0.2 | Parsers/Heurísticas PR-T0.3 | Status | Risco estrutural |
|----|------|------|---------------------|-------------------------------|----------------|------------------------------|--------|-----------------|
| EP-01 | endpoint | Webhook WhatsApp/Meta — entrada de texto/interativo (POST, Cloudflare Worker) | L03 | T0_PR1 §2.1: "webhook de texto/interativo roteando até `runFunnel`"; LEGADO_MESTRE linha 4964: "idempotência por message_id; roteamento para transcrição/extração/decisão"; `wrangler.toml`: `main = "src/worker.ts"` | RE-01, RO-04 | PH-R02 (dedupe wamid), PH-H01 (offtrackGuard) | ativo | Único ponto de entrada confirmado no E1; Cloudflare Worker; toda a lógica parte daqui; migração deve manter rota estável, idempotente e rastreável |
| EP-02 | endpoint | Webhook WhatsApp/Meta — envelope de mídia (áudio/imagem/doc) | L03 | T0_PR1 §2.2: "mídia suportada entra por envelope próprio; persiste metadata; chama `runFunnel` com `caption`"; LEGADO_MESTRE linha 4965-4966: "normalização de payloads Meta" | RD-01, RO-04 | PH-R02 (dedupe) | ativo | Envelope separado do texto; vincula mídia ao turno via `caption`; risco de perda de vínculo mídia-turno ao migrar para E2 |
| EP-03 | endpoint | Rota admin/simulação — endpoint de controle/QA | L03, L18 | T0_PR1 §2.6: "fluxo executável de simulação/admin; não confundir com fluxo produtivo" | RE-04 | — | residual | Endpoint de controle não produtivo; deve ser isolado e protegido; não expor à mesma rota do produtivo na E2 |

---

## Tabela mestre — Telemetria

> **Nota de bifurcação:** Itens TE-04 a TE-12 são descritos no LEGADO_MESTRE como design-alvo E2
> (PDFs de planejamento). São incluídos como **referência canônica de destino**, não como prova
> de existência no E1. O E1 real usa `console.log("[ENOVA_EVENT]", ...)` (TE-01) como transporte.
> Schema exato das tabelas E1 está em L18 (não transcrito — inconclusivo declarado em §8).

| ID | Tipo | Nome | Origem no legado E1 | Fonte auditável LEGADO_MESTRE | Regras PR-T0.2 | Parsers/Heurísticas PR-T0.3 | Status | Risco estrutural |
|----|------|------|---------------------|-------------------------------|----------------|------------------------------|--------|-----------------|
| TE-01 | telemetria | Emitter `[ENOVA_EVENT]` — log estruturado via `console.log` | L03, L18 | LEGADO_MESTRE linha 3416: `console.log("[ENOVA_EVENT]", JSON.stringify(normalized))`; linhas 3411-3429: estrutura do emitter (`event_name, lead_id, turn_id, layer, severity, payload`) | RO-03 | PH-S08 (stage = ponto de emissão) | ativo | Padrão real de emissão do E1; `console.log` como transporte (sem persistência direta em DB); migrando para E2 deve ser substituído por emitter assíncrono persistente |
| TE-02 | telemetria | Evento `model.routed` — roteamento de modelo com criticidade e risco | L03, L19 | LEGADO_MESTRE linhas 3354-3361: campos `model_selected, criticality (C0-C3), risk_score, risk_reasons, route_reason` | RR-07 | PH-H02 (scoring), PH-H03 (threshold), PH-F06 (route_reason) | condicional | Evento do sistema cognitivo em depreciação; parte do pipeline de roteamento de modelo; referência para E2 — não expandir no E1 |
| TE-03 | telemetria | Evento `llm.completed` / `llm.schema_invalid` — resultado de chamada LLM | L03 | LEGADO_MESTRE linhas 3362-3370: campos `latency_ms, schema_valid, confidence, needs_confirmation, token_input_est, token_output_est` | RC-04 | PH-H07 (needs_confirmation — peso +3 no scoring) | condicional | Evento de completude de LLM; `schema_invalid` dispara fallback; `needs_confirmation` alimenta scoring cognitivo (+3) |
| TE-04 | telemetria | Evento `policy.evaluated` / `policy.blocked` — avaliação de política | design-alvo E2 (L03) | LEGADO_MESTRE linhas 3372-3379: campos `ok, block_advance, violations, required_questions, forced_updates` | RC-01, RC-02, RC-03, RC-04 | PH-H07 (needs_confirmation como input) | condicional (design E2) | Sistema de policy não plenamente operacional no E1; evento de referência para E2; implementar na frente T3 |
| TE-05 | telemetria | Evento `memory.updated` / `snapshot.generated` — atualização de memória | design-alvo E2 (L03) | LEGADO_MESTRE linhas 3380-3386: campos `facts_confirmed, facts_ambiguous, snapshot_regenerated, superseded_facts` | RC-02 | PH-H07 (needs_confirmation) | condicional (design E2) | Snapshot não implementado no E1; evento de referência para T2 (memória) |
| TE-06 | telemetria | Eventos `db.persisted` / `db.error` / `turn.responded` / `turn.fallback_used` | L03 | LEGADO_MESTRE linhas 3335-3339: eventos no contrato mínimo: `db.persisted, db.error, turn.responded, turn.fallback_used` | RO-03, RO-05 | PH-F03 (route_fallback), PH-F06 (route_reason) | ativo | Eventos de completude do turno; `turn.fallback_used` rastreia uso do legado como fallback durante migração — crítico para monitorar |
| TE-07 | telemetria | Tabela `enova_leads` — identidade do lead com canal e `wa_id` | design-alvo E2 (L03) | LEGADO_MESTRE linhas 1751-1753: campos `lead_id, wa_id, canal, origem, status, timestamps` | RO-04 | PH-R02 (dedupe por wa_id) | ativo (design E2) | `wa_id` é identificador WhatsApp do lead; `canal` e `origem` rastreiam entrada; crítico para migração de leads E1→E2 |
| TE-08 | telemetria | Tabela `enova_turns` — log auditável por turno | design-alvo E2 (L03, L18) | LEGADO_MESTRE linhas 1771-1774: campos `turn_id, lead_id, role, input_type, raw_input, reply_text, model_name, latency_ms`; linha 2181: "indexar channel_type, input_type, model_name e latency buckets" | RO-03 | PH-S08 (stage como contexto do turno) | ativo (design E2) | Log de turno com `input_type` rastreando canal; E1 não implementa com este schema; implementar na E2 como base de auditoria |
| TE-09 | telemetria | Tabela `enova_events` — telemetria canônica estruturada | design-alvo E2 (L18) | LEGADO_MESTRE linhas 3388-3408: schema completo `id, event_name, lead_id, turn_id, request_id, execution_id, layer, severity, payload_json, tags, created_at` | RO-03 | TE-01 (eventos emitidos via console.log hoje) | ativo (design E2) | Tabela de persistência da telemetria; E1 usa `console.log` em vez de persistência direta; implementar na E2 como substituto do emitter atual |
| TE-10 | telemetria | Tabela `enova_artifacts` — mídia, imagem, doc, áudio, transcrições | design-alvo E2 (L17, L18) | LEGADO_MESTRE linhas 1799-1803: campos `artifact_id, lead_id, type, storage_path, parsing_status` | RD-01, RD-02 | PH-P02 (parseCorrespondenteBlocks — residual) | ativo (design E2) | Tabela de vínculo de artefatos ao turno; `parsing_status` rastreia extração; referência para coleta de docs e interpretação de mídia |
| TE-11 | telemetria | Tabela `enova_incidents` — incidentes operacionais | design-alvo E2 (L18) | LEGADO_MESTRE linhas 3400-3408: campos `id, lead_id, turn_id, incident_type, status, root_cause, created_at, resolved_at` | RE-02, RE-04 | — | condicional (design E2) | Tabela de incidentes; não confirmada no E1; parte do design E2 de observabilidade; implementar na frente T5/T6 |
| TE-12 | telemetria | `turn_events_v2` / `lead_state_v2` — objetos de persistência E2 complementares | design-alvo E2 | LEGADO_MESTRE linhas 4932-4938: `lead_state_v2, turn_events_v2, slot_evidence_v2, audio_assets_v2, memory_runtime_v2, projection_bridge_v2` | RO-03, RC-05 | PH-P01, PH-P02 | condicional (design E2) | Namespace `enova2_*` separado do legado E1; `projection_bridge_v2` como adaptador de compatibilidade; não quebrar E1 ao implementar |
| TE-13 | telemetria | CRM operacional — trilha auditável por etapa (E1 real) | L18 | INVENTARIO_REGRAS RO-03: "telemetria comparativa e estrutural, incidentes e trilha CRM por etapa" (REAPROVEITAMENTO §1.4); LEGADO_MESTRE linha 38: "A telemetria vira instrumento obrigatório de validação" | RO-03, RC-05 | TE-01 (emitter atual) | ativo (inconclusivo — L18 não transcrito) | CRM real do E1 documentado em L18 (não transcrito); schema exato e eventos específicos inconclusivos; migração não pode destruir telemetria conquistada (RC-05) |

---

## Contagem por tipo e status

| Tipo | Ativos | Condicionais | Residuais | Mortos | Total |
|------|--------|--------------|-----------|--------|-------|
| canal | 3 | 4 | 0 | 0 | 7 |
| superfície | 4 | 1 | 1 | 1 | 7 |
| endpoint | 2 | 0 | 1 | 0 | 3 |
| telemetria | 6 | 5 | 0 | 0 | 13 |
| **Total** | **15** | **10** | **2** | **1** | **28** |

---

## Fluxo de dados por canal — visão consolidada

| Canal | Entrada | Roteamento | Superfície de processamento | Saída |
|-------|---------|------------|------------------------------|-------|
| Texto WhatsApp | EP-01 (webhook POST) | Pré-funil (SF-02): dedupe, bypass, offtrack | `runFunnel` (SF-01) → stage atual | Resposta via WhatsApp (fala: LLM na E2; mecânica na E1 — SF-03 morto) |
| Áudio WhatsApp | EP-02 (envelope mídia) | Pré-funil (SF-02) | `runFunnel` (SF-01) via `caption` | Resposta via texto/áudio |
| Imagem/Doc WhatsApp | EP-02 (envelope mídia) | Pré-funil (SF-02) | `envio_docs` (SF-04): `keepStage`, checklist | Confirmação de recebimento; avanço de stage |
| Site (docs) | CT-06 (upload web) | N/A (detalhe em L17) | `envio_docs` (SF-04) | Status de envio |
| Visita presencial | CT-07 | `agendamento_visita` stage | SF-05 (trilho correspondente) | Confirmação de agendamento |
| Admin/simulação | EP-03 | SF-07 (isolado) | SF-07 | Resposta de controle (não produtiva) |

---

## Inconclusivos declarados (não catalogados nesta PR por limitação de L-blocks)

| Categoria | Descrição da lacuna | Bloco legado provável | Próxima PR |
|-----------|--------------------|-----------------------|------------|
| Schema real de tabelas E1 | Schema exato das tabelas Supabase do E1 (nomes, campos, índices) | L18 | PR-T0.R / transcrição L18 |
| Eventos reais emitidos no E1 | Quais `event_name` realmente emitidos em produção E1 | L18 | PR-T0.R / transcrição L18 |
| Telemetria de áudio/transcrição E1 | Como áudio é processado, transcrito e vinculado ao turno no E1 | L17, L18 | PR-T0.4+ / transcrição L17 |
| Formato de retorno de correspondente | Formato exato dos blocos que `parseCorrespondenteBlocks` parseia | L17 | PR-T0.4+ / transcrição L17 |
| Endpoint de CRM/admin externo | APIs de integração com CRM externo (se houver) | L18 | PR-T0.R |
| Métricas operacionais reais | KPIs, thresholds, dashboards reais do E1 | L18 | PR-T0.R |
| Canal de saída de áudio | Se E1 responde em áudio (TTS) | L03, L18 | PR-T0.4+ |

---

## Status de cobertura de PR-T0.4

- Tipos cobertos: 4/4 (canal, superfície, endpoint, telemetria).
- Itens catalogados: 28 (15 ativos, 10 condicionais, 2 residuais, 1 morto).
- Bifurcação E1/E2 aplicada: sim — telemetria design-alvo E2 declarada explicitamente como tal.
- Bloco legado citado por item: sim (todos com bloco L ou seção de inventário T0.1).
- Fonte auditável por item: sim (linha ou seção do LEGADO_MESTRE soberano).
- Relação regras PR-T0.2: sim.
- Relação parsers/heurísticas PR-T0.3: sim (onde aplicável).
- Inconclusivos declarados: 7 categorias (L17/L18 não transcritos — não bloqueiam PR-T0.4).
- Coerência com soberania LLM-first: sim — SF-03 (fala mecânica) classificada como "morto".

Decisão de fechamento de PR-T0.4:
- `PR-T0.4` **pronta para encerramento**.
- Próximo passo autorizado: PR-T0.5 — Matriz de risco operacional do legado vivo.
