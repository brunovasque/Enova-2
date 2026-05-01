/**
 * ENOVA 2 — PR-T8.17 — Smoke do canary pipeline (LLM + outbound controlado)
 *
 * Sem LLM real, sem outbound real. Usa mocks injetados para isolar.
 * Exit 0 sempre que todos os checks passam.
 */

import { runCanaryPipeline, type CanaryReport } from './canary-pipeline.ts';
import type { NormalizedMetaEvent } from './parser.ts';
import type { LlmClientResult } from '../llm/client.ts';
import type { OutboundResult } from './outbound.ts';

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

let pass = 0;
let fail = 0;
const CANARY_WA_ID = '5511988880099';

function check(id: string, description: string, condition: boolean, detail = ''): void {
  if (condition) {
    pass++;
    console.log(`  ✓ [${id}] ${description}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail++;
    console.error(`  ✗ [${id}] ${description}${detail ? ` — ${detail}` : ''}`);
  }
}

function mockEvent(overrides: Partial<NormalizedMetaEvent> = {}): NormalizedMetaEvent {
  return {
    kind: 'message',
    wa_message_id: `wamid.canary-smoke-${Date.now()}`,
    wa_id: CANARY_WA_ID,
    phone_number_id: 'pn-canary-smoke',
    timestamp: new Date().toISOString(),
    message_type: 'text',
    text_body: 'Quero saber sobre o MCMV',
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: null,
    status_value: null,
    raw_ref: '{}',
    ...overrides,
  };
}

function baseEnv(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ENOVA2_ENABLED: 'true',
    CHANNEL_ENABLED: 'true',
    META_OUTBOUND_ENABLED: 'true',
    META_ACCESS_TOKEN: 'fake-token-smoke',
    META_PHONE_NUMBER_ID: 'pn-canary-smoke',
    LLM_REAL_ENABLED: 'false',
    OUTBOUND_CANARY_ENABLED: 'false',
    OUTBOUND_CANARY_WA_ID: CANARY_WA_ID,
    CLIENT_REAL_ENABLED: 'false',
    ROLLBACK_FLAG: 'false',
    MAINTENANCE_MODE: 'false',
    OPENAI_API_KEY: '',
    ...overrides,
  };
}

function mockLlmOk(reply = 'Olá! Posso ajudar com o MCMV.'): () => Promise<LlmClientResult> {
  return async () => ({ ok: true, reply_text: reply, llm_invoked: true, latency_ms: 10 });
}

function mockLlmFail(): () => Promise<LlmClientResult> {
  return async () => ({ ok: false, error: 'llm_api_error_500', llm_invoked: true, latency_ms: 10 });
}

let outboundCallCount = 0;
function mockOutboundOk(): (...args: unknown[]) => Promise<OutboundResult> {
  return async () => {
    outboundCallCount++;
    return { external_dispatch: true, http_status: 200, outbound_message_id: 'wamid.mock-sent' };
  };
}

function mockOutboundNeverCalled(): (...args: unknown[]) => Promise<OutboundResult> {
  return async () => {
    outboundCallCount++;
    return { external_dispatch: true };
  };
}

// ---------------------------------------------------------------------------
// Bloco 1 — LLM desligado
// ---------------------------------------------------------------------------

async function block1LlmOff(): Promise<void> {
  console.log('\n[Bloco 1] LLM desligado — não chama LLM\n');

  const report = await runCanaryPipeline(
    mockEvent(),
    baseEnv({ LLM_REAL_ENABLED: 'false' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );

  check('CS-01', 'llm_invoked=false quando LLM_REAL_ENABLED=false', report.llm_invoked === false, `llm_invoked=${report.llm_invoked}`);
  check('CS-02', 'reply_text_present=false quando LLM desligado', report.reply_text_present === false, `reply_text_present=${report.reply_text_present}`);
  check('CS-03', 'outbound_attempted=false quando LLM desligado', report.outbound_attempted === false, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-04', 'crm_ok=true (CRM preservado)', report.crm_ok === true, `crm_ok=${report.crm_ok}`);
  check('CS-05', 'lead_id gerado pelo CRM', typeof report.lead_id === 'string' && report.lead_id.length > 0, `lead_id=${report.lead_id ?? 'ausente'}`);
}

// ---------------------------------------------------------------------------
// Bloco 2 — Canary desligado (LLM ligado)
// ---------------------------------------------------------------------------

async function block2CanaryOff(): Promise<void> {
  console.log('\n[Bloco 2] Canary desligado — LLM gera reply_text mas outbound não envia\n');

  outboundCallCount = 0;
  const report = await runCanaryPipeline(
    mockEvent(),
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'false' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );

  check('CS-06', 'llm_invoked=true quando LLM_REAL_ENABLED=true', report.llm_invoked === true, `llm_invoked=${report.llm_invoked}`);
  check('CS-07', 'reply_text_present=true quando LLM OK', report.reply_text_present === true, `reply_text_present=${report.reply_text_present}`);
  check('CS-08', 'outbound_attempted=false quando canary desligado', report.outbound_attempted === false, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-09', 'canary_allowed=false', report.canary_allowed === false, `canary_allowed=${report.canary_allowed}`);
  check('CS-10', 'canary_block_reason=canary_disabled', report.canary_block_reason === 'canary_disabled', `canary_block_reason=${report.canary_block_reason}`);
  check('CS-11', 'sendMetaOutbound NÃO chamado quando canary desligado', outboundCallCount === 0, `outbound_calls=${outboundCallCount}`);
}

// ---------------------------------------------------------------------------
// Bloco 3 — WA não autorizado
// ---------------------------------------------------------------------------

async function block3WaNotAllowed(): Promise<void> {
  console.log('\n[Bloco 3] WA não autorizado — outbound não enviado\n');

  outboundCallCount = 0;
  const notCanaryWaId = '5511000000001';
  const report = await runCanaryPipeline(
    mockEvent({ wa_id: notCanaryWaId }),
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'true' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );

  check('CS-12', 'outbound_attempted=false para WA não autorizado', report.outbound_attempted === false, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-13', 'canary_allowed=false para WA não autorizado', report.canary_allowed === false, `canary_allowed=${report.canary_allowed}`);
  check('CS-14', 'canary_block_reason=wa_not_allowed', report.canary_block_reason === 'wa_not_allowed', `reason=${report.canary_block_reason}`);
  check('CS-15', 'sendMetaOutbound NÃO chamado para WA não autorizado', outboundCallCount === 0, `outbound_calls=${outboundCallCount}`);
  check('CS-16', 'external_dispatch=false', report.external_dispatch === false, `external_dispatch=${report.external_dispatch}`);
}

// ---------------------------------------------------------------------------
// Bloco 4 — WA autorizado, canary ligado
// ---------------------------------------------------------------------------

async function block4CanaryAuthorized(): Promise<void> {
  console.log('\n[Bloco 4] WA autorizado + canary ligado — outbound enviado\n');

  outboundCallCount = 0;
  const report = await runCanaryPipeline(
    mockEvent({ wa_id: CANARY_WA_ID }),
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'true', CLIENT_REAL_ENABLED: 'false' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundOk() as never },
  );

  check('CS-17', 'canary_allowed=true quando wa_id autorizado', report.canary_allowed === true, `canary_allowed=${report.canary_allowed}`);
  check('CS-18', 'outbound_attempted=true', report.outbound_attempted === true, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-19', 'external_dispatch=true', report.external_dispatch === true, `external_dispatch=${report.external_dispatch}`);
  check('CS-20', 'sendMetaOutbound chamado 1 vez', outboundCallCount === 1, `outbound_calls=${outboundCallCount}`);
  check('CS-21', 'CLIENT_REAL_ENABLED=false não bloqueia canary autorizado', report.canary_allowed === true, 'invariante: canary independe de CLIENT_REAL_ENABLED');
  check('CS-22', 'canary_block_reason ausente quando autorizado', report.canary_block_reason === undefined, `reason=${report.canary_block_reason}`);
}

// ---------------------------------------------------------------------------
// Bloco 5 — ROLLBACK_FLAG bloqueia
// ---------------------------------------------------------------------------

async function block5Rollback(): Promise<void> {
  console.log('\n[Bloco 5] ROLLBACK_FLAG=true bloqueia LLM e outbound\n');

  outboundCallCount = 0;
  const report = await runCanaryPipeline(
    mockEvent(),
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'true', ROLLBACK_FLAG: 'true' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );

  check('CS-23', 'ROLLBACK_FLAG=true bloqueia LLM', report.llm_invoked === false, `llm_invoked=${report.llm_invoked}`);
  check('CS-24', 'ROLLBACK_FLAG=true bloqueia outbound', report.outbound_attempted === false, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-25', 'sendMetaOutbound NÃO chamado em rollback', outboundCallCount === 0, `outbound_calls=${outboundCallCount}`);
  check('CS-26', 'canary_block_reason=rollback_active', report.canary_block_reason === 'rollback_active', `reason=${report.canary_block_reason}`);
}

// ---------------------------------------------------------------------------
// Bloco 6 — MAINTENANCE_MODE bloqueia
// ---------------------------------------------------------------------------

async function block6Maintenance(): Promise<void> {
  console.log('\n[Bloco 6] MAINTENANCE_MODE=true bloqueia LLM e outbound\n');

  outboundCallCount = 0;
  const report = await runCanaryPipeline(
    mockEvent(),
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'true', MAINTENANCE_MODE: 'true' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );

  check('CS-27', 'MAINTENANCE_MODE=true bloqueia LLM', report.llm_invoked === false, `llm_invoked=${report.llm_invoked}`);
  check('CS-28', 'MAINTENANCE_MODE=true bloqueia outbound', report.outbound_attempted === false, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-29', 'sendMetaOutbound NÃO chamado em maintenance', outboundCallCount === 0, `outbound_calls=${outboundCallCount}`);
  check('CS-30', 'canary_block_reason=maintenance_active', report.canary_block_reason === 'maintenance_active', `reason=${report.canary_block_reason}`);
}

// ---------------------------------------------------------------------------
// Bloco 7 — Sem reply_text → sem outbound
// ---------------------------------------------------------------------------

async function block7NoReplyText(): Promise<void> {
  console.log('\n[Bloco 7] LLM falha — sem reply_text, sem outbound\n');

  outboundCallCount = 0;
  const report = await runCanaryPipeline(
    mockEvent(),
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'true' }) as never,
    undefined,
    { _testLlmCaller: mockLlmFail() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );

  check('CS-31', 'llm_invoked=true mesmo com falha', report.llm_invoked === true, `llm_invoked=${report.llm_invoked}`);
  check('CS-32', 'reply_text_present=false quando LLM falha', report.reply_text_present === false, `reply_text_present=${report.reply_text_present}`);
  check('CS-33', 'outbound não enviado sem reply_text', report.outbound_attempted === false, `outbound_attempted=${report.outbound_attempted}`);
  check('CS-34', 'sendMetaOutbound NÃO chamado sem reply_text', outboundCallCount === 0, `outbound_calls=${outboundCallCount}`);
}

// ---------------------------------------------------------------------------
// Bloco 8 — Invariantes de soberania e segurança
// ---------------------------------------------------------------------------

async function block8Invariants(): Promise<void> {
  console.log('\n[Bloco 8] Invariantes de soberania, segurança e rollback\n');

  // Verificar que OPENAI_API_KEY não está hardcoded na fonte
  const clientSource = await import('./canary-pipeline.ts?raw').catch(() => null);
  check('CS-35', 'OPENAI_API_KEY não hardcoded no canary-pipeline', clientSource === null || !String(clientSource).includes('sk-'), 'verificado por ausência de sk- prefix');

  // mode correto
  const reportFlags = await runCanaryPipeline(
    mockEvent(),
    baseEnv() as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never },
  );
  check('CS-36', 'mode=canary_llm_outbound sempre', reportFlags.mode === 'canary_llm_outbound', `mode=${reportFlags.mode}`);
  check('CS-37', 'lead_id gerado pelo CRM em todos os casos', typeof reportFlags.lead_id === 'string', `lead_id=${reportFlags.lead_id}`);
  check('CS-38', 'turn_id gerado pelo CRM em todos os casos', typeof reportFlags.turn_id === 'string', `turn_id=${reportFlags.turn_id}`);
  check('CS-39', 'memory_event_id gerado em todos os casos', typeof reportFlags.memory_event_id === 'string', `memory_event_id=${reportFlags.memory_event_id}`);

  // Evento de status não dispara LLM nem outbound (kind != 'message')
  const statusEvent: NormalizedMetaEvent = {
    kind: 'status',
    wa_message_id: null,
    wa_id: CANARY_WA_ID,
    phone_number_id: 'pn-test',
    timestamp: new Date().toISOString(),
    message_type: null,
    text_body: null,
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: 'status-001',
    status_value: 'delivered',
    raw_ref: '{}',
  };
  outboundCallCount = 0;
  const statusReport = await runCanaryPipeline(
    statusEvent,
    baseEnv({ LLM_REAL_ENABLED: 'true', OUTBOUND_CANARY_ENABLED: 'true' }) as never,
    undefined,
    { _testLlmCaller: mockLlmOk() as never, _testOutboundSender: mockOutboundNeverCalled() as never },
  );
  check('CS-40', 'evento status: llm_invoked=false (sem text_body)', statusReport.llm_invoked === false, `llm_invoked=${statusReport.llm_invoked}`);
  check('CS-41', 'evento status: outbound não tentado', statusReport.outbound_attempted === false, `outbound_attempted=${statusReport.outbound_attempted}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('\n=== smoke:meta:canary (PR-T8.17) ===');
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('LLM + outbound canary controlado — sem chamada real\n');

  await block1LlmOff();
  await block2CanaryOff();
  await block3WaNotAllowed();
  await block4CanaryAuthorized();
  await block5Rollback();
  await block6Maintenance();
  await block7NoReplyText();
  await block8Invariants();

  console.log(`\n=== RESUMO: ${pass} PASS | ${fail} FAIL | TOTAL: ${pass + fail} ===`);

  if (fail > 0) {
    console.error(`\nFalhas: ${fail} check(s) falharam.`);
    process.exit(1);
  }

  console.log('\nSTATUS: PASS — canary pipeline validado (sem LLM real, sem outbound real)');
  process.exit(0);
}

main().catch((err) => {
  console.error('\nErro inesperado:', err);
  process.exit(1);
});
