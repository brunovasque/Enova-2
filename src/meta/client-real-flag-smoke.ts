/**
 * ENOVA 2 — fix/t8-prod-client-real-flag — Smoke: CLIENT_REAL_ENABLED gate
 *
 * Verifica 7 cenários do gate client_real vs canary:
 *   1. CLIENT_REAL_ENABLED=false + WA diferente do canary → wa_not_allowed
 *   2. CLIENT_REAL_ENABLED=true + WA diferente do canary → permite outbound
 *   3. CLIENT_REAL_ENABLED=true + ROLLBACK_FLAG=true → bloqueia
 *   4. CLIENT_REAL_ENABLED=true + MAINTENANCE_MODE=true → bloqueia
 *   5. CLIENT_REAL_ENABLED=true + META_OUTBOUND_ENABLED=false → external_dispatch=false
 *   6. CLIENT_REAL_ENABLED=true não exige OUTBOUND_CANARY_WA_ID
 *   7. Canary autorizado continua funcionando com CLIENT_REAL_ENABLED=false
 */

import { runCanaryPipeline } from './canary-pipeline.ts';
import type { NormalizedMetaEvent } from './parser.ts';
import type { LlmClientResult } from '../llm/client.ts';
import type { OutboundResult } from './outbound.ts';

let pass = 0;
let fail = 0;

function check(id: string, description: string, condition: boolean, detail = ''): void {
  if (condition) {
    pass++;
    console.log(`  ✓ [${id}] ${description}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail++;
    console.error(`  ✗ [${id}] ${description}${detail ? ` — ${detail}` : ''}`);
  }
}

const CANARY_WA_ID = '5511988880099';
const OTHER_WA_ID = '5511977770011';

function mockEvent(wa_id = OTHER_WA_ID): NormalizedMetaEvent {
  return {
    kind: 'message',
    wa_message_id: `wamid.crf-smoke-${Date.now()}`,
    wa_id,
    phone_number_id: 'pn-crf-smoke',
    timestamp: new Date().toISOString(),
    message_type: 'text',
    text_body: 'Quero saber sobre o MCMV',
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: null,
    status_value: null,
    raw_ref: '{}',
  };
}

const mockLlmOk = async (): Promise<LlmClientResult> => ({
  ok: true,
  reply_text: 'Olá! Posso ajudá-lo com informações sobre o MCMV.',
  latency_ms: 100,
  llm_invoked: true,
});

const mockOutboundOk = async (): Promise<OutboundResult> => ({
  external_dispatch: true,
  http_status: 200,
  outbound_message_id: 'wamid.mock-sent',
});

const mockOutboundBlocked = async (): Promise<OutboundResult> => ({
  external_dispatch: false,
  blocked_reason: 'flag_off_outbound',
});

function baseEnv(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ENOVA2_ENABLED: 'true',
    CHANNEL_ENABLED: 'true',
    META_OUTBOUND_ENABLED: 'true',
    META_ACCESS_TOKEN: 'fake-token-crf-smoke',
    META_PHONE_NUMBER_ID: 'pn-crf-smoke',
    LLM_REAL_ENABLED: 'true',
    OUTBOUND_CANARY_ENABLED: 'false',
    OUTBOUND_CANARY_WA_ID: CANARY_WA_ID,
    CLIENT_REAL_ENABLED: 'false',
    ROLLBACK_FLAG: 'false',
    MAINTENANCE_MODE: 'false',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Cenário 1 — CLIENT_REAL_ENABLED=false + WA diferente → wa_not_allowed
// ---------------------------------------------------------------------------
async function cenario1(): Promise<void> {
  console.log('\n[Cenário 1] CLIENT_REAL_ENABLED=false + WA diferente do canary → wa_not_allowed');
  const env = baseEnv({
    OUTBOUND_CANARY_ENABLED: 'true',
    CLIENT_REAL_ENABLED: 'false',
  });
  const r = await runCanaryPipeline(
    mockEvent(OTHER_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundOk },
  );
  check('CRF-01', 'canary_allowed=false', !r.canary_allowed);
  check('CRF-02', 'client_real_allowed=false', !r.client_real_allowed);
  check('CRF-03', 'block_reason=wa_not_allowed', r.canary_block_reason === 'wa_not_allowed',
    `block_reason=${r.canary_block_reason}`);
  check('CRF-04', 'outbound_attempted=false', !r.outbound_attempted);
  check('CRF-05', 'external_dispatch=false', !r.external_dispatch);
}

// ---------------------------------------------------------------------------
// Cenário 2 — CLIENT_REAL_ENABLED=true + WA diferente → permite outbound
// ---------------------------------------------------------------------------
async function cenario2(): Promise<void> {
  console.log('\n[Cenário 2] CLIENT_REAL_ENABLED=true + WA diferente do canary → permite outbound');
  const env = baseEnv({ CLIENT_REAL_ENABLED: 'true' });
  const r = await runCanaryPipeline(
    mockEvent(OTHER_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundOk },
  );
  check('CRF-06', 'canary_allowed=true (client_real path)', r.canary_allowed,
    `canary_allowed=${r.canary_allowed}`);
  check('CRF-07', 'client_real_allowed=true', r.client_real_allowed,
    `client_real_allowed=${r.client_real_allowed}`);
  check('CRF-08', 'sem block_reason', r.canary_block_reason === undefined,
    `block_reason=${r.canary_block_reason}`);
  check('CRF-09', 'outbound_attempted=true', r.outbound_attempted);
  check('CRF-10', 'external_dispatch=true', r.external_dispatch);
  check('CRF-11', 'reply_text_present=true', r.reply_text_present);
  check('CRF-12', 'llm_invoked=true', r.llm_invoked);
  check('CRF-13', 'mode=client_real_outbound', r.mode === 'client_real_outbound',
    `mode=${r.mode}`);
}

// ---------------------------------------------------------------------------
// Cenário 3 — CLIENT_REAL_ENABLED=true + ROLLBACK_FLAG=true → bloqueia
// ---------------------------------------------------------------------------
async function cenario3(): Promise<void> {
  console.log('\n[Cenário 3] CLIENT_REAL_ENABLED=true + ROLLBACK_FLAG=true → bloqueia');
  const env = baseEnv({ CLIENT_REAL_ENABLED: 'true', ROLLBACK_FLAG: 'true' });
  const r = await runCanaryPipeline(
    mockEvent(OTHER_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundOk },
  );
  check('CRF-14', 'canary_allowed=false (rollback)', !r.canary_allowed);
  check('CRF-15', 'client_real_allowed=false (rollback)', !r.client_real_allowed);
  check('CRF-16', 'block_reason=rollback_active', r.canary_block_reason === 'rollback_active',
    `block_reason=${r.canary_block_reason}`);
  check('CRF-17', 'outbound_attempted=false', !r.outbound_attempted);
  check('CRF-18', 'external_dispatch=false', !r.external_dispatch);
}

// ---------------------------------------------------------------------------
// Cenário 4 — CLIENT_REAL_ENABLED=true + MAINTENANCE_MODE=true → bloqueia
// ---------------------------------------------------------------------------
async function cenario4(): Promise<void> {
  console.log('\n[Cenário 4] CLIENT_REAL_ENABLED=true + MAINTENANCE_MODE=true → bloqueia');
  const env = baseEnv({ CLIENT_REAL_ENABLED: 'true', MAINTENANCE_MODE: 'true' });
  const r = await runCanaryPipeline(
    mockEvent(OTHER_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundOk },
  );
  check('CRF-19', 'canary_allowed=false (maintenance)', !r.canary_allowed);
  check('CRF-20', 'client_real_allowed=false (maintenance)', !r.client_real_allowed);
  check('CRF-21', 'block_reason=maintenance_active', r.canary_block_reason === 'maintenance_active',
    `block_reason=${r.canary_block_reason}`);
  check('CRF-22', 'outbound_attempted=false', !r.outbound_attempted);
}

// ---------------------------------------------------------------------------
// Cenário 5 — CLIENT_REAL_ENABLED=true + META_OUTBOUND_ENABLED=false → external_dispatch=false
// ---------------------------------------------------------------------------
async function cenario5(): Promise<void> {
  console.log('\n[Cenário 5] CLIENT_REAL_ENABLED=true + META_OUTBOUND_ENABLED=false → external_dispatch=false');
  const env = baseEnv({ CLIENT_REAL_ENABLED: 'true', META_OUTBOUND_ENABLED: 'false' });
  const r = await runCanaryPipeline(
    mockEvent(OTHER_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundBlocked },
  );
  check('CRF-23', 'canary_allowed=true (gate passou)', r.canary_allowed);
  check('CRF-24', 'client_real_allowed=true', r.client_real_allowed);
  check('CRF-25', 'outbound_attempted=true', r.outbound_attempted);
  check('CRF-26', 'external_dispatch=false (outbound bloqueado por flag)', !r.external_dispatch,
    `external_dispatch=${r.external_dispatch}`);
}

// ---------------------------------------------------------------------------
// Cenário 6 — CLIENT_REAL_ENABLED=true não exige OUTBOUND_CANARY_WA_ID
// ---------------------------------------------------------------------------
async function cenario6(): Promise<void> {
  console.log('\n[Cenário 6] CLIENT_REAL_ENABLED=true sem OUTBOUND_CANARY_WA_ID → ainda permite');
  const env = baseEnv({
    CLIENT_REAL_ENABLED: 'true',
    OUTBOUND_CANARY_WA_ID: '',
    OUTBOUND_CANARY_ENABLED: 'false',
  });
  const r = await runCanaryPipeline(
    mockEvent(OTHER_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundOk },
  );
  check('CRF-27', 'canary_allowed=true sem OUTBOUND_CANARY_WA_ID', r.canary_allowed,
    `canary_allowed=${r.canary_allowed}`);
  check('CRF-28', 'client_real_allowed=true', r.client_real_allowed);
  check('CRF-29', 'external_dispatch=true', r.external_dispatch);
  check('CRF-30', 'sem block_reason', r.canary_block_reason === undefined);
}

// ---------------------------------------------------------------------------
// Cenário 7 — Canary continua funcionando com CLIENT_REAL_ENABLED=false
// ---------------------------------------------------------------------------
async function cenario7(): Promise<void> {
  console.log('\n[Cenário 7] Canary autorizado funciona com CLIENT_REAL_ENABLED=false');
  const env = baseEnv({
    CLIENT_REAL_ENABLED: 'false',
    OUTBOUND_CANARY_ENABLED: 'true',
    OUTBOUND_CANARY_WA_ID: CANARY_WA_ID,
  });
  const r = await runCanaryPipeline(
    mockEvent(CANARY_WA_ID),
    env as never,
    undefined,
    { _testLlmCaller: mockLlmOk, _testOutboundSender: mockOutboundOk },
  );
  check('CRF-31', 'canary_allowed=true', r.canary_allowed, `canary_allowed=${r.canary_allowed}`);
  check('CRF-32', 'client_real_allowed=false (canary path)', !r.client_real_allowed);
  check('CRF-33', 'sem block_reason', r.canary_block_reason === undefined);
  check('CRF-34', 'external_dispatch=true', r.external_dispatch);
  check('CRF-35', 'mode=canary_llm_outbound', r.mode === 'canary_llm_outbound', `mode=${r.mode}`);
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== smoke:meta:client-real-flag — CLIENT_REAL_ENABLED gate ===');

  await cenario1();
  await cenario2();
  await cenario3();
  await cenario4();
  await cenario5();
  await cenario6();
  await cenario7();

  console.log(`\n=== RESUMO: ${pass} PASS | ${fail} FAIL | TOTAL: ${pass + fail} ===`);
  if (fail > 0) {
    console.error('STATUS: FAIL');
    process.exit(1);
  } else {
    console.log('STATUS: PASS — CLIENT_REAL_ENABLED gate validado');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\nErro inesperado:', err);
  process.exit(1);
});
