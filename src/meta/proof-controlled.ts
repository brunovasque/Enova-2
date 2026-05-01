/**
 * PR-T8.12 — Prova Meta/WhatsApp controlada (dual-mode)
 *
 * Modo skip  : META_REAL_ENABLED ausente → todos cenarios SKIPPED, exit 0
 * Modo real  : META_REAL_ENABLED=true + secrets presentes → executa prova real
 *
 * Nunca imprime secrets. Nunca falha CI por falta de env.
 */

import { computeMetaSignatureHex, verifyMetaSignature } from './signature.ts';
import { parseMetaWebhookPayload } from './parser.ts';
import { createInMemoryDedupeStore } from './dedupe.ts';
import { evaluateOutboundReadiness } from './outbound.ts';
import { handleMetaWebhookChallenge, processMetaWebhookPost } from './webhook.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
let skipped = 0;

function pass(label: string) {
  console.log(`[PASS] ${label}`);
  passed++;
}

function fail(label: string, detail?: string) {
  console.log(`[FAIL] ${label}${detail ? ' — ' + detail : ''}`);
  failed++;
}

function skip(label: string, reason: string) {
  console.log(`[SKIP] ${label} — ${reason}`);
  skipped++;
}

function section(title: string) {
  console.log(`\n--- ${title} ---`);
}

function maskSecret(s: string): string {
  if (s.length <= 6) return '***';
  return s.slice(0, 3) + '***' + s.slice(-3);
}

function assertEqual<T>(label: string, actual: T, expected: T) {
  if (actual === expected) {
    pass(label);
  } else {
    fail(label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(label: string, value: boolean, detail?: string) {
  if (value) {
    pass(label);
  } else {
    fail(label, detail ?? 'assertion false');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const META_REAL_ENABLED = process.env['META_REAL_ENABLED'] === 'true';
  const META_VERIFY_TOKEN = process.env['META_VERIFY_TOKEN'] ?? '';
  const META_APP_SECRET = process.env['META_APP_SECRET'] ?? '';
  const META_ACCESS_TOKEN = process.env['META_ACCESS_TOKEN'] ?? '';
  const META_PHONE_NUMBER_ID = process.env['META_PHONE_NUMBER_ID'] ?? '';

  // -------------------------------------------------------------------------
  // P1 — Smokes unitários (sempre executam, sem secrets reais)
  // -------------------------------------------------------------------------

  section('P1 — Smokes unitários (signature, parser, dedupe, outbound)');

  // P1.1 — computeMetaSignatureHex produz hex estável
  {
    const label = 'P1.1: computeMetaSignatureHex retorna hex de 64 chars';
    try {
      const hex = await computeMetaSignatureHex('hello', 'mysecret');
      assertEqual(label + ' (len)', hex.length, 64);
      assertTrue(label + ' (hex chars)', /^[0-9a-f]+$/.test(hex));
    } catch (e: any) {
      fail(label, e?.message);
    }
  }

  // P1.2 — verifyMetaSignature: assinatura correta → ok
  {
    const label = 'P1.2: verifyMetaSignature aceita assinatura correta';
    try {
      const body = '{"test":1}';
      const secret = 'test-secret-abc';
      const hex = await computeMetaSignatureHex(body, secret);
      const result = await verifyMetaSignature(body, `sha256=${hex}`, secret);
      assertEqual(label, result.ok, true);
    } catch (e: any) {
      fail(label, e?.message);
    }
  }

  // P1.3 — verifyMetaSignature: assinatura errada → !ok
  {
    const label = 'P1.3: verifyMetaSignature rejeita assinatura errada';
    try {
      const result = await verifyMetaSignature('body', 'sha256=' + 'a'.repeat(64), 'secret');
      assertEqual(label, result.ok, false);
    } catch (e: any) {
      fail(label, e?.message);
    }
  }

  // P1.4 — parser: mensagem de texto → kind=message
  {
    const label = 'P1.4: parser → kind=message para texto';
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            metadata: { phone_number_id: 'pnid-001' },
            messages: [{
              id: 'wamid.test001',
              from: '5511999990001',
              timestamp: '1700000001',
              type: 'text',
              text: { body: 'Oi!' },
            }],
          },
        }],
      }],
    };
    const result = parseMetaWebhookPayload(payload);
    if (result.ok && result.events.length > 0) {
      assertEqual(label + ' (kind)', result.events[0]!.kind, 'message');
      assertEqual(label + ' (wamid)', result.events[0]!.wa_message_id, 'wamid.test001');
      assertEqual(label + ' (text)', result.events[0]!.text_body, 'Oi!');
      pass(label + ' (estrutura)');
    } else {
      fail(label, 'parser retornou erro ou sem eventos');
    }
  }

  // P1.5 — parser: status → kind=status
  {
    const label = 'P1.5: parser → kind=status para status update';
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            metadata: { phone_number_id: 'pnid-001' },
            statuses: [{
              id: 'wamid.status001',
              recipient_id: '5511999990001',
              timestamp: '1700000002',
              status: 'delivered',
            }],
          },
        }],
      }],
    };
    const result = parseMetaWebhookPayload(payload);
    if (result.ok && result.events.length > 0) {
      assertEqual(label + ' (kind)', result.events[0]!.kind, 'status');
      pass(label + ' (estrutura)');
    } else {
      fail(label, 'parser retornou erro ou sem eventos');
    }
  }

  // P1.6 — dedupe: mesmo wa_message_id é bloqueado na segunda vez
  {
    const label = 'P1.6: DedupeStore bloqueia mensagem duplicada';
    const store = createInMemoryDedupeStore();
    const key = 'message:wamid:wamid.test001';
    assertTrue(label + ' (has=false antes)', !store.has(key));
    store.remember(key);
    assertTrue(label + ' (has=true depois)', store.has(key));
    assertEqual(label + ' (size)', store.size(), 1);
  }

  // P1.7 — outbound bloqueado quando flags off
  {
    const label = 'P1.7: outbound bloqueado com CHANNEL_ENABLED=false';
    const env = { CHANNEL_ENABLED: 'false', META_OUTBOUND_ENABLED: 'false' };
    const intent = { wa_id: '5511999990001', phone_number_id: 'pnid-001', reply_text: 'Teste' };
    const result = evaluateOutboundReadiness(env, intent);
    if (result && !result.sent) {
      pass(label);
    } else {
      fail(label, 'outbound deveria estar bloqueado');
    }
  }

  // P1.8 — challenge GET: token correto → retorna challenge
  {
    const label = 'P1.8: challenge GET com token correto → 200';
    const fakeEnv = { META_VERIFY_TOKEN: 'my-verify-token-123' };
    const url = new URL('https://example.com/__meta__/webhook?hub.mode=subscribe&hub.verify_token=my-verify-token-123&hub.challenge=abc123');
    const resp = handleMetaWebhookChallenge(url, fakeEnv);
    assertEqual(label + ' (status)', resp.status, 200);
    const text = await resp.text();
    assertEqual(label + ' (body)', text, 'abc123');
  }

  // P1.9 — challenge GET: token errado → 403
  {
    const label = 'P1.9: challenge GET com token errado → 403';
    const fakeEnv = { META_VERIFY_TOKEN: 'correct-token' };
    const url = new URL('https://example.com/__meta__/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=abc123');
    const resp = handleMetaWebhookChallenge(url, fakeEnv);
    assertEqual(label, resp.status, 403);
  }

  // P1.10 — POST com assinatura válida → parsed sem erros
  {
    const label = 'P1.10: POST com assinatura válida → processado';
    try {
      const rawBody = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              metadata: { phone_number_id: 'pnid-001' },
              messages: [{ id: 'wamid.p1test10', from: '5511999990001', timestamp: '1700000010', type: 'text', text: { body: 'hello' } }],
            },
          }],
        }],
      });
      const secret = 'test-secret-for-p1-10';
      const hex = await computeMetaSignatureHex(rawBody, secret);
      const fakeEnv = { META_APP_SECRET: secret, CHANNEL_ENABLED: 'false', META_OUTBOUND_ENABLED: 'false' };
      const result = await processMetaWebhookPost({ rawBody, signatureHeader: `sha256=${hex}`, env: fakeEnv });
      assertTrue(label + ' (accepted)', result.body['accepted'] === true);
      const evts = result.body['events'] as unknown[];
      assertEqual(label + ' (events)', evts?.length ?? 0, 1);
    } catch (e: any) {
      fail(label, e?.message);
    }
  }

  // -------------------------------------------------------------------------
  // P2–P7 — Provas reais (requerem secrets Cloudflare / deployment real)
  // -------------------------------------------------------------------------

  section('P2–P7 — Provas reais (requerem secrets Meta + deployment Cloudflare)');

  const BLOQUEIO_REASON = 'META_REAL_ENABLED não definido — bloqueio controlado';
  const realAvailable = META_REAL_ENABLED && !!(META_VERIFY_TOKEN && META_APP_SECRET && META_ACCESS_TOKEN && META_PHONE_NUMBER_ID);

  if (!META_REAL_ENABLED) {
    skip('P2: Assinatura HMAC com APP_SECRET real', BLOQUEIO_REASON);
    skip('P3: processMetaWebhookPost com secrets reais', BLOQUEIO_REASON);
    skip('P4: Webhook inbound real via Cloudflare', BLOQUEIO_REASON);
    skip('P5: Outbound real via Graph API', BLOQUEIO_REASON);
    skip('P6: Dedupe real (mesmo wamid duas vezes)', BLOQUEIO_REASON);
    skip('P7: Telemetria real — eventos no Supabase', BLOQUEIO_REASON);

    console.log('\n[BLOQUEIO CONTROLADO]');
    console.log('BLOQUEIO: secrets Meta ausentes no ambiente. PR-T8.12 não pode concluir prova real sem provisionamento.');
    console.log('Para executar prova real, Vasques deve:');
    console.log('  1. wrangler secret put META_VERIFY_TOKEN');
    console.log('  2. wrangler secret put META_APP_SECRET');
    console.log('  3. wrangler secret put META_ACCESS_TOKEN');
    console.log('  4. wrangler secret put META_PHONE_NUMBER_ID');
    console.log('  5. Configurar webhook no painel Meta Developers → /__meta__/webhook');
    console.log('  6. Rodar localmente:');
    console.log('     META_REAL_ENABLED=true META_VERIFY_TOKEN=... META_APP_SECRET=... \\');
    console.log('     META_ACCESS_TOKEN=... META_PHONE_NUMBER_ID=... npx tsx src/meta/proof-controlled.ts');
  } else if (!realAvailable) {
    skip('P2: Assinatura HMAC com APP_SECRET real', 'META_REAL_ENABLED=true mas secrets incompletos');
    skip('P3: processMetaWebhookPost com secrets reais', 'META_REAL_ENABLED=true mas secrets incompletos');
    skip('P4: Webhook inbound real via Cloudflare', 'META_REAL_ENABLED=true mas secrets incompletos');
    skip('P5: Outbound real via Graph API', 'META_REAL_ENABLED=true mas secrets incompletos');
    skip('P6: Dedupe real', 'META_REAL_ENABLED=true mas secrets incompletos');
    skip('P7: Telemetria real', 'META_REAL_ENABLED=true mas secrets incompletos');
    fail('Secrets incompletos', 'META_REAL_ENABLED=true mas faltam: ' +
      [
        !META_VERIFY_TOKEN && 'META_VERIFY_TOKEN',
        !META_APP_SECRET && 'META_APP_SECRET',
        !META_ACCESS_TOKEN && 'META_ACCESS_TOKEN',
        !META_PHONE_NUMBER_ID && 'META_PHONE_NUMBER_ID',
      ].filter(Boolean).join(', ')
    );
  } else {
    console.log('[INFO] Modo real ativo. Secrets detectados (mascarados):');
    console.log(`  META_VERIFY_TOKEN    = ${maskSecret(META_VERIFY_TOKEN)}`);
    console.log(`  META_APP_SECRET      = ${maskSecret(META_APP_SECRET)}`);
    console.log(`  META_ACCESS_TOKEN    = ${maskSecret(META_ACCESS_TOKEN)}`);
    console.log(`  META_PHONE_NUMBER_ID = ${maskSecret(META_PHONE_NUMBER_ID)}`);

    // P2: Assinar com APP_SECRET real e verificar localmente
    section('P2 — Assinatura HMAC com APP_SECRET real (local)');
    {
      const label = 'P2: HMAC com APP_SECRET real → verificação local ok';
      try {
        const body = '{"object":"whatsapp_business_account","entry":[]}';
        const hex = await computeMetaSignatureHex(body, META_APP_SECRET);
        const result = await verifyMetaSignature(body, `sha256=${hex}`, META_APP_SECRET);
        assertEqual(label, result.ok, true);
      } catch (e: any) {
        fail(label, e?.message);
      }
    }

    // P3: processMetaWebhookPost com secrets reais
    section('P3 — processMetaWebhookPost com secrets reais (local)');
    {
      const label = 'P3: POST simulado com APP_SECRET real → aceito';
      try {
        const rawBody = JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [{
            changes: [{
              value: {
                metadata: { phone_number_id: META_PHONE_NUMBER_ID },
                messages: [{ id: 'wamid.real-prova-001', from: '5511999990001', timestamp: String(Date.now()), type: 'text', text: { body: 'Prova T8.12' } }],
              },
            }],
          }],
        });
        const hex = await computeMetaSignatureHex(rawBody, META_APP_SECRET);
        const fakeEnv = {
          META_APP_SECRET,
          META_VERIFY_TOKEN,
          CHANNEL_ENABLED: 'false',
          META_OUTBOUND_ENABLED: 'false',
        };
        const result = await processMetaWebhookPost({ rawBody, signatureHeader: `sha256=${hex}`, env: fakeEnv });
        assertTrue(label + ' (accepted)', result.body['accepted'] === true);
        const evts = result.body['events'] as any[];
        assertEqual(label + ' (events)', evts?.length ?? 0, 1);
        assertEqual(label + ' (kind)', evts?.[0]?.kind, 'message');
      } catch (e: any) {
        fail(label, e?.message);
      }
    }

    // P4–P7 precisam de deployment real
    const DEPLOY_BLOQUEIO = 'requer deployment Cloudflare ativo + webhook Meta registrado — fora do escopo do script local';
    skip('P4: Webhook inbound real via Cloudflare', DEPLOY_BLOQUEIO);
    skip('P5: Outbound real via Graph API', DEPLOY_BLOQUEIO);
    skip('P6: Dedupe real (dois posts reais)', DEPLOY_BLOQUEIO);
    skip('P7: Telemetria real no Supabase', DEPLOY_BLOQUEIO);
  }

  // -------------------------------------------------------------------------
  // P8 — Invariantes de soberania (sempre executam)
  // -------------------------------------------------------------------------

  section('P8 — Invariantes de soberania IA/Canal');

  // P8.1 — parser nunca produz reply_text
  {
    const label = 'P8.1: parser nunca produz reply_text / stage / speech_intent';
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: {
        metadata: { phone_number_id: 'pnid-001' },
        messages: [{ id: 'wamid.p8', from: '5511999990001', timestamp: '1700000099', type: 'text', text: { body: 'Responda' } }],
      }}]}],
    };
    const result = parseMetaWebhookPayload(payload);
    if (result.ok) {
      for (const evt of result.events) {
        const k = Object.keys(evt as any);
        assertTrue(label + ' (sem reply_text)', !k.includes('reply_text'));
        assertTrue(label + ' (sem stage)', !k.includes('stage'));
        assertTrue(label + ' (sem speech_intent)', !k.includes('speech_intent'));
      }
      pass(label + ' (invariante ok)');
    } else {
      fail(label, 'parser falhou');
    }
  }

  // P8.2 — CHANNEL_ENABLED=false → outbound sempre bloqueado
  {
    const label = 'P8.2: CHANNEL_ENABLED=false → outbound bloqueado mesmo com ACCESS_TOKEN';
    const env = { CHANNEL_ENABLED: 'false', META_OUTBOUND_ENABLED: 'true', META_ACCESS_TOKEN: 'fake-token', META_PHONE_NUMBER_ID: 'pnid-001' };
    const intent = { wa_id: '5511999990001', phone_number_id: 'pnid-001', reply_text: 'teste' };
    const result = evaluateOutboundReadiness(env, intent);
    assertTrue(label, result != null && !result.sent);
  }

  // P8.3 — META_OUTBOUND_ENABLED=false → outbound bloqueado mesmo com CHANNEL_ENABLED=true
  {
    const label = 'P8.3: META_OUTBOUND_ENABLED=false → outbound bloqueado';
    const env = { CHANNEL_ENABLED: 'true', META_OUTBOUND_ENABLED: 'false', META_ACCESS_TOKEN: 'fake', META_PHONE_NUMBER_ID: 'pnid-001' };
    const intent = { wa_id: '5511999990001', phone_number_id: 'pnid-001', reply_text: 'teste' };
    const result = evaluateOutboundReadiness(env, intent);
    assertTrue(label, result != null && !result.sent);
  }

  // -------------------------------------------------------------------------
  // Resultado final
  // -------------------------------------------------------------------------

  console.log('\n========================================');
  console.log('PR-T8.12 Prova Meta/WhatsApp controlada');
  console.log(`PASS: ${passed} | FAIL: ${failed} | SKIP: ${skipped}`);
  if (failed > 0) {
    console.log('STATUS: FALHOU');
    process.exit(1);
  } else if (skipped > 0) {
    console.log('STATUS: PARCIAL — smokes PASS, provas reais SKIPPED (bloqueio controlado)');
    process.exit(0);
  } else {
    console.log('STATUS: PASSOU');
    process.exit(0);
  }
}

main().catch((e) => {
  console.error('[ERRO FATAL]', e);
  process.exit(1);
});
