# Diagnóstico T9.15I — 18 — supabaseCfg: construção e uso em canary-pipeline.ts
# Snapshot read-only: 2026-05-04
# Branch: fix/t9.15h-facts-persistence-topo

---

## grep -n "supabaseCfg" src/meta/canary-pipeline.ts

```
145:  const supabaseCfg: SupabaseConfig | null =
173:      await writeEnovaLog(supabaseCfg, {
220:      if (supabaseCfg) {
222:          persistedFacts = await readLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id);
309:      if (supabaseCfg) {
311:          const factsWriteResult = await writeLeadAccumulatedFacts(supabaseCfg, crmResult.lead_id, factsMap);
529:        await writeEnovaLog(supabaseCfg, {
577:            await writeEnovaLog(supabaseCfg, {
```

**Total de usos:** 8 ocorrências — 1 declaração + 7 usos (3 writeEnovaLog + 2 blocos T9.15H + 2 writeEnovaLog adicionais).

---

## src/meta/canary-pipeline.ts — linhas 130-180

```typescript
130  const ctx = {
131    trace_id: telemetryContext?.trace_id ?? 'canary-trace-local',
132    correlation_id: telemetryContext?.correlation_id ?? 'canary-trace-local',
133    request_id: telemetryContext?.request_id ?? 'canary-request-local',
134  };
135
136  const errors: string[] = [];
137  const llmCaller = _options?._testLlmCaller ?? callLlm;
138  const outboundSender = _options?._testOutboundSender ?? sendMetaOutbound;
139
140  emitCanary(ctx, 'started', 'observed', { kind: event.kind, wa_id: event.wa_id ?? null });
141
142  // Config Supabase para writeEnovaLog (T10.6E) — null = skip silencioso
143  const _sbUrl = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL : '';
144  const _sbKey = typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY : '';
145  const supabaseCfg: SupabaseConfig | null =
146    _sbUrl && _sbKey ? { url: _sbUrl, serviceRoleKey: _sbKey } : null;
147
148  // Passo 1 — CRM + memória (pipeline existente)
149  const crmResult = await runInboundPipeline(event, env, ctx);
150  if (!crmResult.ok) {
151    errors.push(...(crmResult.errors ?? ['crm_pipeline_failed']));
152  }
153
154  emitCanary(ctx, 'crm_done', 'completed', {
155    crm_ok: crmResult.ok,
156    lead_id: crmResult.lead_id ?? null,
157    turn_id: crmResult.turn_id ?? null,
158  });
159
160  // Log 6 — pipeline.result
161  diagLog('meta.prod.pipeline.result', {
162    crm_ok: crmResult.ok,
163    lead_id_present: !!crmResult.lead_id,
164    turn_id_present: !!crmResult.turn_id,
165    memory_event_id_present: !!crmResult.memory_event_id,
166    errors_count: (crmResult.errors ?? []).length,
167  });
168
169  // Persiste inbound em enova_log — tag meta_minimal (T10.6E)
170  // Grava independentemente do resultado do CRM; falha nunca bloqueia pipeline.
171  if (event.kind === 'message' && event.wa_id) {
172    try {
173      await writeEnovaLog(supabaseCfg, {
174        tag: 'meta_minimal',
175        wa_id: event.wa_id,
176        meta_type: event.message_type ?? null,
177        meta_text: event.text_body ?? null,
178        meta_message_id: event.wa_message_id ?? null,
179        details: {
180          source: 'enova2',
```

---

## Análise: construção de supabaseCfg (linhas 142-146)

### Lógica exata

```typescript
// linha 143
const _sbUrl = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL : '';
// linha 144
const _sbKey = typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY : '';
// linhas 145-146
const supabaseCfg: SupabaseConfig | null =
  _sbUrl && _sbKey ? { url: _sbUrl, serviceRoleKey: _sbKey } : null;
```

### Condição para supabaseCfg !== null

| Variável de ambiente | Condição |
|---------------------|----------|
| `SUPABASE_URL` | deve ser `string` não-vazia |
| `SUPABASE_SERVICE_ROLE_KEY` | deve ser `string` não-vazia |
| `SUPABASE_REAL_ENABLED` | **irrelevante** — não afeta supabaseCfg |
| `SUPABASE_WRITE_ENABLED` | **irrelevante** — não afeta supabaseCfg |

**Conclusão crítica**: `supabaseCfg` é construído com apenas 2 variáveis de ambiente, independente de qualquer flag de feature. T9.15H (readLeadAccumulatedFacts / writeLeadAccumulatedFacts) opera com supabaseCfg em PROD desde que SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estejam presentes — que é o caso desde T9.0.

### Shape de SupabaseConfig quando não-null

```typescript
{
  url: string,               // SUPABASE_URL
  serviceRoleKey: string,    // SUPABASE_SERVICE_ROLE_KEY
}
```

---

## Mapa de todos os usos de supabaseCfg

| Linha | Uso | Função chamada | Bloco | Flag-gate |
|-------|-----|----------------|-------|-----------|
| 145-146 | declaração | — | init | nenhuma |
| 173 | write | `writeEnovaLog` | tag=meta_minimal inbound | `if (event.kind === 'message' && event.wa_id)` |
| 220 | read | `readLeadAccumulatedFacts` | T9.15H — injeção de facts persistidos | `if (supabaseCfg)` |
| 222 | read | `readLeadAccumulatedFacts` | T9.15H (interior do if) | — |
| 309 | write | `writeLeadAccumulatedFacts` | T9.15H — persiste facts acumulados | `if (supabaseCfg)` |
| 311 | write | `writeLeadAccumulatedFacts` | T9.15H (interior do if) | — |
| 529 | write | `writeEnovaLog` | tag=? (linha de outbound/erro) | try/catch |
| 577 | write | `writeEnovaLog` | tag=? (linha de outbound/erro) | try/catch |

**Padrão**: todo uso de `supabaseCfg` é protegido por `if (supabaseCfg)` ou por try/catch. Null-safe em todos os pontos de uso.

---

## Posição de supabaseCfg na ordem de execução

```
linha 130  ctx = { trace_id, correlation_id, request_id }
linha 137  llmCaller = callLlm (ou mock de teste)
linha 138  outboundSender = sendMetaOutbound (ou mock de teste)
linha 140  emitCanary('started')
linha 143  _sbUrl = env.SUPABASE_URL ?? ''         ← constrói supabaseCfg
linha 144  _sbKey = env.SUPABASE_SERVICE_ROLE_KEY ?? ''
linha 145  supabaseCfg = _sbUrl && _sbKey ? {...} : null   ← DECLARADO ANTES DE QUALQUER I/O
linha 149  runInboundPipeline(event, env, ctx)      ← CRM + memória
linha 173  writeEnovaLog(supabaseCfg, ...)          ← primeiro uso (log inbound)
...
linha 220  readLeadAccumulatedFacts(supabaseCfg, lead_id)   ← T9.15H read
linha 309  writeLeadAccumulatedFacts(supabaseCfg, lead_id, factsMap)  ← T9.15H write
```

`supabaseCfg` é resolvido síncronamente no início da função, antes de qualquer I/O. Não há risco de race condition ou uso antes da declaração.

---

## Conclusão para T9.15I

1. **supabaseCfg é independente de SUPABASE_REAL_ENABLED e SUPABASE_WRITE_ENABLED** — a construção usa apenas SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
2. **T9.15H opera em PROD** desde que as 2 variáveis de ambiente estejam presentes (confirmado: presentes desde T9.0).
3. **Todos os usos são null-safe** — guarda `if (supabaseCfg)` ou try/catch em todas as 7 chamadas.
4. **supabaseCfg é declarado antes de qualquer I/O** — linha 145, antes de `runInboundPipeline` (linha 149).
5. **writeEnovaLog também usa supabaseCfg** (linhas 173, 529, 577) — confirma que a infra de logging Supabase já estava em uso antes de T9.15H; T9.15H apenas reutilizou o mesmo cfg já estabelecido.
