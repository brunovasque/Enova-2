/**
 * ENOVA 2 — PR-T8.11 — Smoke do webhook Meta real (GET challenge + POST inbound).
 *
 * REGRAS:
 *   - Sem cliente real, sem outbound real, sem LLM real.
 *   - Usa segredo "test-app-secret" SOMENTE neste smoke (in-memory).
 *   - Exigências cobertas:
 *      - GET challenge ok / falha por token / falha por mode.
 *      - POST sem assinatura → 401.
 *      - POST assinatura inválida → 403.
 *      - POST mensagem texto válida → 200, evento normalizado.
 *      - POST duplicado → 200 + duplicate.
 *      - POST status event → 200 sem turno.
 *      - POST mídia → 200 com media stub.
 *      - Adapter nunca expõe reply_text / surface / final_text.
 *      - Outbound bloqueado por flag/token (testes diretos da função).
 */

import worker from '../worker.ts';
import {
  buildMetaOutboundPayload,
  evaluateOutboundReadiness,
  sendMetaOutbound,
  type OutboundIntent,
} from './outbound.ts';
import { computeMetaSignatureHex } from './signature.ts';
import {
  computeDedupeKey,
  parseMetaWebhookPayload,
  type NormalizedMetaEvent,
} from './parser.ts';
import { resetSharedDedupeStore } from './dedupe.ts';
import type { MetaWorkerEnv } from './webhook-env.ts';

interface Assertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

interface ScenarioResult {
  scenario: string;
  passed: boolean;
  assertions: Assertion[];
  details?: Record<string, unknown>;
}

function assert(description: string, expected: unknown, actual: unknown): Assertion {
  return {
    description,
    expected,
    actual,
    passed: JSON.stringify(expected) === JSON.stringify(actual),
  };
}

function assertTrue(description: string, condition: boolean): Assertion {
  return {
    description,
    expected: true,
    actual: condition,
    passed: condition === true,
  };
}

const TEST_VERIFY_TOKEN = 'verify-token-smoke';
const TEST_APP_SECRET = 'app-secret-smoke';

function smokeEnv(overrides: Partial<MetaWorkerEnv> = {}): MetaWorkerEnv {
  return {
    META_VERIFY_TOKEN: TEST_VERIFY_TOKEN,
    META_APP_SECRET: TEST_APP_SECRET,
    CHANNEL_ENABLED: 'false',
    META_OUTBOUND_ENABLED: 'false',
    ...overrides,
  };
}

async function callWorker(request: Request, env: MetaWorkerEnv): Promise<{ status: number; body: unknown; bodyText: string }> {
  const response = await worker.fetch(request, env as Record<string, unknown>);
  const bodyText = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    parsed = bodyText;
  }
  return { status: response.status, body: parsed, bodyText };
}

function metaPayloadText(waMessageId: string, waId = '5511999999999'): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'waba_smoke_test',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                phone_number_id: 'phone_number_id_smoke',
                display_phone_number: '+551130000000',
              },
              messages: [
                {
                  id: waMessageId,
                  from: waId,
                  timestamp: '1714492800',
                  type: 'text',
                  text: { body: 'Quero simular minha renda' },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
}

function metaPayloadStatus(statusId: string): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'waba_smoke_test',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: 'phone_number_id_smoke' },
              statuses: [
                {
                  id: statusId,
                  status: 'delivered',
                  timestamp: '1714492801',
                  recipient_id: '5511999999999',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
}

function metaPayloadMedia(): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'waba_smoke_test',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: 'phone_number_id_smoke' },
              messages: [
                {
                  id: 'wamid.smoke-media-001',
                  from: '5511999999999',
                  timestamp: '1714492802',
                  type: 'document',
                  document: {
                    id: 'media_id_smoke_001',
                    mime_type: 'application/pdf',
                    filename: 'comprovante-renda.pdf',
                    sha256: 'fake-sha-only-for-smoke',
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
}

async function postWebhookSigned(rawPayload: Record<string, unknown>, env: MetaWorkerEnv): Promise<{ status: number; body: unknown }> {
  const rawBody = JSON.stringify(rawPayload);
  const sigHex = await computeMetaSignatureHex(rawBody, TEST_APP_SECRET);
  const signature = `sha256=${sigHex}`;
  const request = new Request('https://enova.local/__meta__/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-hub-signature-256': signature,
    },
    body: rawBody,
  });
  return callWorker(request, env);
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

async function scenarioChallengeOk(): Promise<ScenarioResult> {
  const url = `https://enova.local/__meta__/webhook?hub.mode=subscribe&hub.verify_token=${TEST_VERIFY_TOKEN}&hub.challenge=challenge-abc-123`;
  const result = await callWorker(new Request(url, { method: 'GET' }), smokeEnv());
  return {
    scenario: 'GET challenge — token valido retorna challenge em texto puro',
    assertions: [
      assert('status 200', 200, result.status),
      assert('body == challenge', 'challenge-abc-123', result.bodyText),
    ],
    passed: result.status === 200 && result.bodyText === 'challenge-abc-123',
  };
}

async function scenarioChallengeTokenInvalido(): Promise<ScenarioResult> {
  const url = `https://enova.local/__meta__/webhook?hub.mode=subscribe&hub.verify_token=token-errado&hub.challenge=should-not-return`;
  const result = await callWorker(new Request(url, { method: 'GET' }), smokeEnv());
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'GET challenge — token invalido retorna 403',
    assertions: [
      assert('status 403', 403, result.status),
      assert('error = forbidden', 'forbidden', body?.error),
      assert('reason = token_mismatch', 'token_mismatch', body?.reason),
      assertTrue('challenge nao foi retornado em texto puro', !result.bodyText.includes('should-not-return')),
    ],
    passed: result.status === 403 && body?.reason === 'token_mismatch',
  };
}

async function scenarioChallengeModeInvalido(): Promise<ScenarioResult> {
  const url = `https://enova.local/__meta__/webhook?hub.mode=unsubscribe&hub.verify_token=${TEST_VERIFY_TOKEN}&hub.challenge=x`;
  const result = await callWorker(new Request(url, { method: 'GET' }), smokeEnv());
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'GET challenge — mode != subscribe retorna 403',
    assertions: [
      assert('status 403', 403, result.status),
      assert('reason = mode_invalid', 'mode_invalid', body?.reason),
    ],
    passed: result.status === 403 && body?.reason === 'mode_invalid',
  };
}

async function scenarioChallengeSemEnv(): Promise<ScenarioResult> {
  const url = `https://enova.local/__meta__/webhook?hub.mode=subscribe&hub.verify_token=qualquer&hub.challenge=x`;
  const result = await callWorker(new Request(url, { method: 'GET' }), { CHANNEL_ENABLED: 'false' });
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'GET challenge — sem META_VERIFY_TOKEN no env retorna 403',
    assertions: [
      assert('status 403', 403, result.status),
      assert('reason = verify_token_not_configured', 'verify_token_not_configured', body?.reason),
    ],
    passed: result.status === 403 && body?.reason === 'verify_token_not_configured',
  };
}

async function scenarioPostSemAssinatura(): Promise<ScenarioResult> {
  const rawBody = JSON.stringify(metaPayloadText('wamid.smoke-no-sig'));
  const result = await callWorker(
    new Request('https://enova.local/__meta__/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: rawBody,
    }),
    smokeEnv(),
  );
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'POST sem assinatura → 401 signature_missing',
    assertions: [
      assert('status 401', 401, result.status),
      assert('error = signature_invalid', 'signature_invalid', body?.error),
      assert('reason = signature_missing', 'signature_missing', body?.reason),
      assert('accepted = false', false, body?.accepted),
    ],
    passed: result.status === 401 && body?.reason === 'signature_missing',
  };
}

async function scenarioPostAssinaturaInvalida(): Promise<ScenarioResult> {
  const rawBody = JSON.stringify(metaPayloadText('wamid.smoke-bad-sig'));
  const result = await callWorker(
    new Request('https://enova.local/__meta__/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=000000000000000000000000000000000000000000000000000000000000dead',
      },
      body: rawBody,
    }),
    smokeEnv(),
  );
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'POST assinatura invalida → 403 signature_invalid',
    assertions: [
      assert('status 403', 403, result.status),
      assert('reason = signature_invalid', 'signature_invalid', body?.reason),
    ],
    passed: result.status === 403 && body?.reason === 'signature_invalid',
  };
}

async function scenarioPostTextoValido(): Promise<ScenarioResult> {
  resetSharedDedupeStore();
  const result = await postWebhookSigned(metaPayloadText('wamid.smoke-text-001'), smokeEnv());
  const body = result.body as Record<string, unknown>;
  const events = (body?.events ?? []) as Array<Record<string, unknown>>;
  const first = events[0] ?? {};
  return {
    scenario: 'POST texto valido com assinatura valida → 200 + evento normalizado',
    assertions: [
      assert('status 200', 200, result.status),
      assert('accepted = true', true, body?.accepted),
      assert('mode = technical_only', 'technical_only', body?.mode),
      assert('external_dispatch = false', false, body?.external_dispatch),
      assert('llm_invoked = false', false, body?.llm_invoked),
      assert('events_count = 1', 1, body?.events_count),
      assert('duplicates_count = 0', 0, body?.duplicates_count),
      assert('event.kind = message', 'message', first.kind),
      assert('event.message_type = text', 'text', first.message_type),
      assert('event.has_text = true', true, first.has_text),
      assert('event.has_wa_message_id = true', true, first.has_wa_message_id),
      assertTrue('nao expoe reply_text', !('reply_text' in (body ?? {}))),
      assertTrue('nao expoe surface', !('surface' in (body ?? {}))),
      assertTrue('nao expoe final_text', !('final_text' in (body ?? {}))),
      assertTrue('nao expoe stage_after', !('stage_after' in (body ?? {}))),
      assertTrue('nao expoe fact_*', !Object.keys(body ?? {}).some((k) => k.startsWith('fact_'))),
    ],
    passed: result.status === 200 && body?.events_count === 1 && body?.duplicates_count === 0,
  };
}

async function scenarioPostDuplicado(): Promise<ScenarioResult> {
  resetSharedDedupeStore();
  const env = smokeEnv();
  await postWebhookSigned(metaPayloadText('wamid.smoke-dup-001'), env);
  const result = await postWebhookSigned(metaPayloadText('wamid.smoke-dup-001'), env);
  const body = result.body as Record<string, unknown>;
  const events = (body?.events ?? []) as Array<Record<string, unknown>>;
  return {
    scenario: 'POST duplicado por wa_message_id → 200 + duplicate=true',
    assertions: [
      assert('status 200', 200, result.status),
      assert('events_count = 1', 1, body?.events_count),
      assert('duplicates_count = 1', 1, body?.duplicates_count),
      assert('event[0].duplicate = true', true, events[0]?.duplicate),
    ],
    passed: result.status === 200 && body?.duplicates_count === 1,
  };
}

async function scenarioPostStatusEvent(): Promise<ScenarioResult> {
  resetSharedDedupeStore();
  const result = await postWebhookSigned(metaPayloadStatus('wamid.smoke-status-001'), smokeEnv());
  const body = result.body as Record<string, unknown>;
  const events = (body?.events ?? []) as Array<Record<string, unknown>>;
  return {
    scenario: 'POST status event → 200 sem turno conversacional',
    assertions: [
      assert('status 200', 200, result.status),
      assert('events_count = 1', 1, body?.events_count),
      assert('event[0].kind = status', 'status', events[0]?.kind),
      assert('event[0].status_value = delivered', 'delivered', events[0]?.status_value),
      assert('event[0].has_text = false', false, events[0]?.has_text),
      assert('llm_invoked = false', false, body?.llm_invoked),
    ],
    passed: result.status === 200 && events[0]?.kind === 'status',
  };
}

async function scenarioPostMidia(): Promise<ScenarioResult> {
  resetSharedDedupeStore();
  const result = await postWebhookSigned(metaPayloadMedia(), smokeEnv());
  const body = result.body as Record<string, unknown>;
  const events = (body?.events ?? []) as Array<Record<string, unknown>>;
  return {
    scenario: 'POST midia (document/PDF) → 200 com media stub',
    assertions: [
      assert('status 200', 200, result.status),
      assert('events_count = 1', 1, body?.events_count),
      assert('event[0].kind = message', 'message', events[0]?.kind),
      assert('event[0].message_type = document', 'document', events[0]?.message_type),
      assert('event[0].has_media = true', true, events[0]?.has_media),
      assert('event[0].has_text = false', false, events[0]?.has_text),
      assertTrue('nao baixa midia real', !('media_payload' in (body ?? {}))),
    ],
    passed: result.status === 200 && events[0]?.has_media === true,
  };
}

async function scenarioOutboundFlagOff(): Promise<ScenarioResult> {
  const intent: OutboundIntent = {
    wa_id: '5511999999999',
    phone_number_id: 'pnid',
    reply_text: 'Texto aprovado pelo pipeline',
  };
  const result = await sendMetaOutbound(intent, {
    CHANNEL_ENABLED: 'false',
    META_OUTBOUND_ENABLED: 'true',
    META_ACCESS_TOKEN: 'token-fake',
  });
  return {
    scenario: 'Outbound — flag CHANNEL_ENABLED=false → bloqueado',
    assertions: [
      assert('external_dispatch = false', false, result.external_dispatch),
      assert('blocked_reason = flag_off_channel', 'flag_off_channel', result.blocked_reason),
    ],
    passed: result.external_dispatch === false && result.blocked_reason === 'flag_off_channel',
  };
}

async function scenarioOutboundOutboundFlagOff(): Promise<ScenarioResult> {
  const intent: OutboundIntent = {
    wa_id: '5511999999999',
    phone_number_id: 'pnid',
    reply_text: 'Texto aprovado',
  };
  const result = await sendMetaOutbound(intent, {
    CHANNEL_ENABLED: 'true',
    META_OUTBOUND_ENABLED: 'false',
    META_ACCESS_TOKEN: 'token-fake',
  });
  return {
    scenario: 'Outbound — META_OUTBOUND_ENABLED=false → bloqueado',
    assertions: [
      assert('external_dispatch = false', false, result.external_dispatch),
      assert('blocked_reason = flag_off_outbound', 'flag_off_outbound', result.blocked_reason),
    ],
    passed: result.blocked_reason === 'flag_off_outbound',
  };
}

async function scenarioOutboundSemToken(): Promise<ScenarioResult> {
  const intent: OutboundIntent = {
    wa_id: '5511999999999',
    phone_number_id: 'pnid',
    reply_text: 'Texto aprovado',
  };
  const result = await sendMetaOutbound(intent, {
    CHANNEL_ENABLED: 'true',
    META_OUTBOUND_ENABLED: 'true',
  });
  return {
    scenario: 'Outbound — sem META_ACCESS_TOKEN → bloqueado',
    assertions: [
      assert('external_dispatch = false', false, result.external_dispatch),
      assert('blocked_reason = access_token_missing', 'access_token_missing', result.blocked_reason),
    ],
    passed: result.blocked_reason === 'access_token_missing',
  };
}

async function scenarioOutboundReplyTextVazio(): Promise<ScenarioResult> {
  const intent: OutboundIntent = {
    wa_id: '5511999999999',
    phone_number_id: 'pnid',
    reply_text: '',
  };
  const result = evaluateOutboundReadiness(
    {
      CHANNEL_ENABLED: 'true',
      META_OUTBOUND_ENABLED: 'true',
      META_ACCESS_TOKEN: 'token-fake',
    },
    intent,
  );
  return {
    scenario: 'Outbound — reply_text vazio → bloqueado',
    assertions: [
      assert('external_dispatch = false', false, result?.external_dispatch),
      assert('blocked_reason = reply_text_missing', 'reply_text_missing', result?.blocked_reason),
    ],
    passed: result?.blocked_reason === 'reply_text_missing',
  };
}

async function scenarioOutboundPayloadCopiaLiteral(): Promise<ScenarioResult> {
  const intent: OutboundIntent = {
    wa_id: '5511999999999',
    phone_number_id: 'pnid_smoke',
    reply_text: 'Texto literal aprovado pelo pipeline',
  };
  const built = buildMetaOutboundPayload(intent);
  const url = built.url('v20.0');
  const parsed = JSON.parse(built.body) as Record<string, unknown>;
  const text = parsed.text as { body?: string } | undefined;
  return {
    scenario: 'Outbound — payload Graph API copia reply_text literal',
    assertions: [
      assert('url usa phone_number_id', 'https://graph.facebook.com/v20.0/pnid_smoke/messages', url),
      assert('messaging_product = whatsapp', 'whatsapp', parsed.messaging_product),
      assert('to = wa_id', '5511999999999', parsed.to),
      assert('type = text', 'text', parsed.type),
      assert('text.body = reply_text literal', 'Texto literal aprovado pelo pipeline', text?.body),
    ],
    passed:
      url.includes('pnid_smoke') &&
      parsed.to === '5511999999999' &&
      text?.body === 'Texto literal aprovado pelo pipeline',
  };
}

async function scenarioParserAdapterNaoFala(): Promise<ScenarioResult> {
  const parsed = parseMetaWebhookPayload(metaPayloadText('wamid.smoke-no-fala-001'));
  const evt = parsed.events[0] as NormalizedMetaEvent;
  const eventKeys = Object.keys(evt);
  return {
    scenario: 'Parser — evento normalizado nunca contem reply_text/stage/fact_*',
    assertions: [
      assertTrue('nao tem reply_text', !eventKeys.includes('reply_text')),
      assertTrue('nao tem stage', !eventKeys.includes('stage')),
      assertTrue('nao tem stage_after', !eventKeys.includes('stage_after')),
      assertTrue('nao tem fact_*', !eventKeys.some((k) => k.startsWith('fact_'))),
      assertTrue('nao tem next_objective', !eventKeys.includes('next_objective')),
      assertTrue('nao tem speech_intent', !eventKeys.includes('speech_intent')),
      assertTrue('texto preservado em text_body', evt.text_body === 'Quero simular minha renda'),
    ],
    passed:
      !eventKeys.includes('reply_text') &&
      !eventKeys.includes('stage_after') &&
      !eventKeys.some((k) => k.startsWith('fact_')),
  };
}

async function scenarioDedupeKeyEstavel(): Promise<ScenarioResult> {
  const parsed = parseMetaWebhookPayload(metaPayloadText('wamid.smoke-key-001'));
  const a = computeDedupeKey(parsed.events[0] as NormalizedMetaEvent);
  const b = computeDedupeKey(parsed.events[0] as NormalizedMetaEvent);
  return {
    scenario: 'Parser — dedupe key estavel para mesmo wa_message_id',
    assertions: [
      assert('chave 1 == chave 2', a, b),
      assertTrue('chave usa wamid', a.startsWith('message:wamid:')),
    ],
    passed: a === b && a.startsWith('message:wamid:'),
  };
}

async function scenarioIngestPreservado(): Promise<ScenarioResult> {
  const envelope = {
    envelope_version: 'front6.v1',
    direction: 'inbound',
    channel: 'meta_whatsapp',
    event_type: 'inbound.message.text',
    event_id: 'wamid.smoke-pr811-ingest',
    occurred_at: '2026-04-30T18:00:00Z',
    received_at: '2026-04-30T18:00:01Z',
    trace_id: 'pr811-trace-ingest',
    idempotency_key: 'meta_whatsapp:wamid.smoke-pr811-ingest',
    lead_ref: 'lead-pr811',
    payload: { text: 'mantém compat' },
  };
  const result = await callWorker(
    new Request('https://enova.local/__meta__/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(envelope),
    }),
    smokeEnv(),
  );
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'Ingest interno /__meta__/ingest preservado',
    assertions: [
      assert('status 202', 202, result.status),
      assert('accepted = true', true, body?.accepted),
      assert('route = /__meta__/ingest', '/__meta__/ingest', body?.route),
    ],
    passed: result.status === 202 && body?.accepted === true,
  };
}

async function scenarioRootIntegro(): Promise<ScenarioResult> {
  const result = await callWorker(
    new Request('https://enova.local/', { method: 'GET' }),
    smokeEnv(),
  );
  const body = result.body as Record<string, unknown>;
  const routes = body?.routes as Record<string, unknown>;
  return {
    scenario: 'Root tecnico anuncia rota meta_webhook',
    assertions: [
      assert('status 200', 200, result.status),
      assert('routes.meta_webhook publicada', 'GET|POST /__meta__/webhook', routes?.meta_webhook),
      assert('routes.meta_ingest preservada', 'POST /__meta__/ingest', routes?.meta_ingest),
    ],
    passed: result.status === 200 && routes?.meta_webhook === 'GET|POST /__meta__/webhook',
  };
}

async function scenarioMethodInvalido(): Promise<ScenarioResult> {
  const result = await callWorker(
    new Request('https://enova.local/__meta__/webhook', { method: 'PUT' }),
    smokeEnv(),
  );
  const body = result.body as Record<string, unknown>;
  return {
    scenario: 'Method invalido no webhook → 405',
    assertions: [
      assert('status 405', 405, result.status),
      assert('error = method_not_allowed', 'method_not_allowed', body?.error),
    ],
    passed: result.status === 405,
  };
}

async function main() {
  const scenarios: ScenarioResult[] = [];

  scenarios.push(await scenarioChallengeOk());
  scenarios.push(await scenarioChallengeTokenInvalido());
  scenarios.push(await scenarioChallengeModeInvalido());
  scenarios.push(await scenarioChallengeSemEnv());
  scenarios.push(await scenarioPostSemAssinatura());
  scenarios.push(await scenarioPostAssinaturaInvalida());
  scenarios.push(await scenarioPostTextoValido());
  scenarios.push(await scenarioPostDuplicado());
  scenarios.push(await scenarioPostStatusEvent());
  scenarios.push(await scenarioPostMidia());
  scenarios.push(await scenarioOutboundFlagOff());
  scenarios.push(await scenarioOutboundOutboundFlagOff());
  scenarios.push(await scenarioOutboundSemToken());
  scenarios.push(await scenarioOutboundReplyTextVazio());
  scenarios.push(await scenarioOutboundPayloadCopiaLiteral());
  scenarios.push(await scenarioParserAdapterNaoFala());
  scenarios.push(await scenarioDedupeKeyEstavel());
  scenarios.push(await scenarioIngestPreservado());
  scenarios.push(await scenarioRootIntegro());
  scenarios.push(await scenarioMethodInvalido());

  const allPassed = scenarios.every((s) => s.passed);

  console.log('\n===========================================');
  console.log('ENOVA 2 — PR-T8.11 — smoke webhook Meta');
  console.log('===========================================');

  for (const s of scenarios) {
    console.log(`\n${s.passed ? 'PASSOU' : 'FALHOU'} ${s.scenario}`);
    for (const a of s.assertions) {
      console.log(`  ${a.passed ? 'ok' : 'erro'} ${a.description}`);
      if (!a.passed) {
        console.log(`    Esperado: ${JSON.stringify(a.expected)}`);
        console.log(`    Obtido:   ${JSON.stringify(a.actual)}`);
      }
    }
  }

  console.log(`\nResultado final: ${allPassed ? 'PASSOU' : 'FALHOU'}`);
  console.log(`Total: ${scenarios.length} cenarios`);

  if (!allPassed) process.exit(1);
}

void main();
