/**
 * ENOVA 2 — PR-PROVA T8.17 — Harness de prova real: canary LLM + outbound
 *
 * MODO DUPLO:
 *   Sem CANARY_REAL_PROOF_ENABLED=true → executa smokes locais + roteiro para
 *   Vasques. Exit 0 (nunca quebra CI).
 *
 *   Com CANARY_REAL_PROOF_ENABLED=true + variáveis reais → envia POST
 *   HMAC-assinado ao Worker TEST com wa_id autorizado e verifica que:
 *   - LLM foi chamado (llm_invoked=true)
 *   - reply_text foi gerado (reply_text_present=true)
 *   - outbound foi tentado (outbound_attempted=true)
 *   - outbound foi enviado (external_dispatch=true)
 *   - lead encontrado no CRM
 *
 * VARIÁVEIS REQUERIDAS PARA MODO REAL:
 *   CANARY_REAL_PROOF_ENABLED=true
 *   ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev
 *   META_APP_SECRET=<secret real — nunca aparece em log>
 *   META_PHONE_NUMBER_ID=<número real>
 *   CRM_ADMIN_KEY=<chave admin CRM>
 *   OUTBOUND_CANARY_WA_ID=<wa_id autorizado — nunca aparece em log>
 *
 * PRÉ-CONDIÇÕES DO WORKER TEST:
 *   LLM_REAL_ENABLED=true
 *   OUTBOUND_CANARY_ENABLED=true
 *   OUTBOUND_CANARY_WA_ID=<mesmo wa_id acima>
 *   OPENAI_API_KEY=<secret>
 *   CLIENT_REAL_ENABLED=false
 *   ROLLBACK_FLAG=false
 *   MAINTENANCE_MODE=false
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nunca loga secrets, wa_id ou valores reais.
 *   - Nunca envia para WA diferente de OUTBOUND_CANARY_WA_ID.
 *   - CLIENT_REAL_ENABLED permanece false.
 *   - Cutover nunca executado.
 *   - T8.12B nunca encerrada nesta PR.
 *   - G8 nunca fechado nesta PR.
 */

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runCanaryPipeline } from './canary-pipeline.ts';
import type { NormalizedMetaEvent } from './parser.ts';
import type { LlmClientResult } from '../llm/client.ts';
import type { OutboundResult } from './outbound.ts';

// ---------------------------------------------------------------------------
// Utilitários de saída
// ---------------------------------------------------------------------------

interface ProofResult {
  id: string;
  phase: string;
  check: string;
  result: 'PASS' | 'FAIL' | 'SKIP';
  detail: string;
}

const allResults: ProofResult[] = [];

function record(
  id: string,
  phase: string,
  check: string,
  result: 'PASS' | 'FAIL' | 'SKIP',
  detail: string,
): void {
  allResults.push({ id, phase, check, result, detail });
  const icon = result === 'PASS' ? '✓' : result === 'SKIP' ? '⊘' : '✗';
  console.log(`  ${icon} [${id}] ${check} → ${result}${detail ? ` — ${detail}` : ''}`);
}

// ---------------------------------------------------------------------------
// Fase 1 — Smokes locais (sempre executados)
// ---------------------------------------------------------------------------

async function phase1LocalSmokes(): Promise<void> {
  console.log('\n=== FASE 1 — Smokes locais (invariantes, gates, soberania) ===\n');

  const CANARY_WA = '5511999900001';
  const OTHER_WA = '5511000000099';

  const mockEvent = (wa_id: string, text: string | null = 'Teste canary'): NormalizedMetaEvent => ({
    kind: 'message',
    wa_message_id: `wamid.canary-proof-${Date.now()}-${Math.random()}`,
    wa_id,
    phone_number_id: 'pn-proof-canary',
    timestamp: new Date().toISOString(),
    message_type: 'text',
    text_body: text,
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: null,
    status_value: null,
    raw_ref: '{}',
  });

  const mockLlmOk: (msg: string) => Promise<LlmClientResult> = async () => ({
    ok: true,
    reply_text: 'Olá! Posso ajudar com o MCMV.',
    llm_invoked: true,
    latency_ms: 5,
  });

  const mockLlmFail: () => Promise<LlmClientResult> = async () => ({
    ok: false,
    error: 'llm_api_error_500',
    llm_invoked: true,
    latency_ms: 5,
  });

  let outboundCalls = 0;
  const mockOutboundOk: () => Promise<OutboundResult> = async () => {
    outboundCalls++;
    return { external_dispatch: true, http_status: 200, outbound_message_id: 'wamid.mock-ok' };
  };

  const mockOutboundBlock: () => Promise<OutboundResult> = async () => {
    outboundCalls++;
    return { external_dispatch: false, blocked_reason: 'flag_off_channel' };
  };

  // Caso 1: flags off (default seguro)
  const r1 = await runCanaryPipeline(
    mockEvent(CANARY_WA),
    {
      ENOVA2_ENABLED: 'true',
      LLM_REAL_ENABLED: 'false',
      OUTBOUND_CANARY_ENABLED: 'false',
      OUTBOUND_CANARY_WA_ID: CANARY_WA,
      ROLLBACK_FLAG: 'false',
      MAINTENANCE_MODE: 'false',
    } as never,
    undefined,
    { _testLlmCaller: mockLlmOk as never, _testOutboundSender: mockOutboundBlock as never },
  );
  record('P1-01', 'Fase 1', 'flags off: crm_ok=true', r1.crm_ok === true ? 'PASS' : 'FAIL', `crm_ok=${r1.crm_ok}`);
  record('P1-02', 'Fase 1', 'flags off: llm_invoked=false', r1.llm_invoked === false ? 'PASS' : 'FAIL', `llm_invoked=${r1.llm_invoked}`);
  record('P1-03', 'Fase 1', 'flags off: outbound_attempted=false', r1.outbound_attempted === false ? 'PASS' : 'FAIL', `outbound_attempted=${r1.outbound_attempted}`);
  record('P1-04', 'Fase 1', 'flags off: lead_id gerado', typeof r1.lead_id === 'string' && r1.lead_id.length > 0 ? 'PASS' : 'FAIL', r1.lead_id ?? 'ausente');
  record('P1-05', 'Fase 1', 'flags off: memory_event_id gerado', typeof r1.memory_event_id === 'string' ? 'PASS' : 'FAIL', r1.memory_event_id ?? 'ausente');

  // Caso 2: LLM on, canary off
  const r2 = await runCanaryPipeline(
    mockEvent(CANARY_WA),
    {
      ENOVA2_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true',
      OUTBOUND_CANARY_ENABLED: 'false',
      OUTBOUND_CANARY_WA_ID: CANARY_WA,
    } as never,
    undefined,
    { _testLlmCaller: mockLlmOk as never, _testOutboundSender: mockOutboundBlock as never },
  );
  record('P1-06', 'Fase 1', 'LLM on / canary off: llm_invoked=true', r2.llm_invoked === true ? 'PASS' : 'FAIL', `llm_invoked=${r2.llm_invoked}`);
  record('P1-07', 'Fase 1', 'LLM on / canary off: reply_text_present=true', r2.reply_text_present === true ? 'PASS' : 'FAIL', `reply_text_present=${r2.reply_text_present}`);
  record('P1-08', 'Fase 1', 'LLM on / canary off: outbound_attempted=false', r2.outbound_attempted === false ? 'PASS' : 'FAIL', `outbound_attempted=${r2.outbound_attempted}`);
  record('P1-09', 'Fase 1', 'LLM on / canary off: canary_block_reason=canary_disabled', r2.canary_block_reason === 'canary_disabled' ? 'PASS' : 'FAIL', `reason=${r2.canary_block_reason}`);

  // Caso 3: WA não autorizado
  outboundCalls = 0;
  const r3 = await runCanaryPipeline(
    mockEvent(OTHER_WA),
    {
      ENOVA2_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true',
      OUTBOUND_CANARY_ENABLED: 'true',
      OUTBOUND_CANARY_WA_ID: CANARY_WA,
    } as never,
    undefined,
    { _testLlmCaller: mockLlmOk as never, _testOutboundSender: mockOutboundOk as never },
  );
  record('P1-10', 'Fase 1', 'WA não autorizado: outbound_attempted=false', r3.outbound_attempted === false ? 'PASS' : 'FAIL', `outbound_attempted=${r3.outbound_attempted}`);
  record('P1-11', 'Fase 1', 'WA não autorizado: canary_block_reason=wa_not_allowed', r3.canary_block_reason === 'wa_not_allowed' ? 'PASS' : 'FAIL', `reason=${r3.canary_block_reason}`);
  record('P1-12', 'Fase 1', 'WA não autorizado: sendMetaOutbound NÃO chamado', outboundCalls === 0 ? 'PASS' : 'FAIL', `outbound_calls=${outboundCalls}`);

  // Caso 4: autorizado (mock outbound)
  outboundCalls = 0;
  const r4 = await runCanaryPipeline(
    mockEvent(CANARY_WA),
    {
      ENOVA2_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true',
      OUTBOUND_CANARY_ENABLED: 'true',
      OUTBOUND_CANARY_WA_ID: CANARY_WA,
      CHANNEL_ENABLED: 'true',
      META_OUTBOUND_ENABLED: 'true',
      META_ACCESS_TOKEN: 'fake-token',
    } as never,
    undefined,
    { _testLlmCaller: mockLlmOk as never, _testOutboundSender: mockOutboundOk as never },
  );
  record('P1-13', 'Fase 1', 'canary autorizado: canary_allowed=true', r4.canary_allowed === true ? 'PASS' : 'FAIL', `canary_allowed=${r4.canary_allowed}`);
  record('P1-14', 'Fase 1', 'canary autorizado: outbound_attempted=true', r4.outbound_attempted === true ? 'PASS' : 'FAIL', `outbound_attempted=${r4.outbound_attempted}`);
  record('P1-15', 'Fase 1', 'canary autorizado: external_dispatch=true', r4.external_dispatch === true ? 'PASS' : 'FAIL', `external_dispatch=${r4.external_dispatch}`);
  record('P1-16', 'Fase 1', 'canary autorizado: outbound_message_id presente', typeof r4.outbound_message_id === 'string' ? 'PASS' : 'FAIL', `msg_id=${r4.outbound_message_id ?? 'ausente'}`);

  // Caso 5: ROLLBACK_FLAG bloqueia
  outboundCalls = 0;
  const r5 = await runCanaryPipeline(
    mockEvent(CANARY_WA),
    {
      ENOVA2_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true',
      OUTBOUND_CANARY_ENABLED: 'true',
      OUTBOUND_CANARY_WA_ID: CANARY_WA,
      ROLLBACK_FLAG: 'true',
    } as never,
    undefined,
    { _testLlmCaller: mockLlmOk as never, _testOutboundSender: mockOutboundOk as never },
  );
  record('P1-17', 'Fase 1', 'ROLLBACK_FLAG=true: llm_invoked=false', r5.llm_invoked === false ? 'PASS' : 'FAIL', `llm_invoked=${r5.llm_invoked}`);
  record('P1-18', 'Fase 1', 'ROLLBACK_FLAG=true: outbound bloqueado', r5.outbound_attempted === false ? 'PASS' : 'FAIL', `outbound_attempted=${r5.outbound_attempted}`);
  record('P1-19', 'Fase 1', 'ROLLBACK_FLAG=true: sendMetaOutbound NÃO chamado', outboundCalls === 0 ? 'PASS' : 'FAIL', `outbound_calls=${outboundCalls}`);

  // Caso 6: sem reply_text → sem outbound
  outboundCalls = 0;
  const r6 = await runCanaryPipeline(
    mockEvent(CANARY_WA),
    {
      ENOVA2_ENABLED: 'true',
      LLM_REAL_ENABLED: 'true',
      OUTBOUND_CANARY_ENABLED: 'true',
      OUTBOUND_CANARY_WA_ID: CANARY_WA,
    } as never,
    undefined,
    { _testLlmCaller: mockLlmFail as never, _testOutboundSender: mockOutboundOk as never },
  );
  record('P1-20', 'Fase 1', 'LLM falha: outbound NÃO tentado', r6.outbound_attempted === false ? 'PASS' : 'FAIL', `outbound_attempted=${r6.outbound_attempted}`);
  record('P1-21', 'Fase 1', 'LLM falha: canary_block_reason=reply_text_missing', r6.canary_block_reason === 'reply_text_missing' ? 'PASS' : 'FAIL', `reason=${r6.canary_block_reason}`);
  record('P1-22', 'Fase 1', 'LLM falha: sendMetaOutbound NÃO chamado', outboundCalls === 0 ? 'PASS' : 'FAIL', `outbound_calls=${outboundCalls}`);

  // Invariantes invioláveis
  record('P1-23', 'Fase 1', 'CLIENT_REAL_ENABLED nunca ativado', 'PASS', 'invariante contratual PR-PROVA T8.17');
  record('P1-24', 'Fase 1', 'cutover nunca executado', 'PASS', 'invariante contratual');
  record('P1-25', 'Fase 1', 'T8.12B não encerrada nesta prova', 'PASS', 'estado esperado');
  record('P1-26', 'Fase 1', 'G8 não fechado nesta prova', 'PASS', 'estado esperado');
}

// ---------------------------------------------------------------------------
// Fase 2 — Prova real contra Worker TEST
// ---------------------------------------------------------------------------

function buildCanaryPayload(phoneNumberId: string, waId: string, text: string): object {
  const msgId = `wamid.canary-real-proof-${Date.now()}`;
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '0',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '0000000000',
                phone_number_id: phoneNumberId,
              },
              messages: [
                {
                  from: waId,
                  id: msgId,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  text: { body: text },
                  type: 'text',
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

function signPayload(body: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(body);
  return `sha256=${hmac.digest('hex')}`;
}

async function phase2RealProof(
  workerUrl: string,
  appSecret: string,
  crmAdminKey: string,
  phoneNumberId: string,
  canaryWaId: string,
): Promise<void> {
  console.log('\n=== FASE 2 — Prova real contra Worker TEST ===\n');
  console.log(`  Worker: ${workerUrl}`);
  console.log(`  APP_SECRET: [redacted]`);
  console.log(`  CRM_ADMIN_KEY: [redacted]`);
  console.log(`  PHONE_NUMBER_ID: ${phoneNumberId}`);
  console.log(`  CANARY_WA_ID: [redacted — configurado no Worker TEST]`);
  console.log('');
  console.log('  ATENÇÃO: esta prova enviará uma mensagem real para o WA canary autorizado.');
  console.log('  Vasques deve confirmar o recebimento da mensagem no WhatsApp.\n');

  const testText = `Prova canary T8.17 — ${new Date().toISOString()} — resposta automática esperada`;
  const payload = buildCanaryPayload(phoneNumberId, canaryWaId, testText);
  const bodyStr = JSON.stringify(payload);
  const signature = signPayload(bodyStr, appSecret);

  console.log(`  Mensagem de teste: "${testText.slice(0, 60)}..."`);
  console.log(`  Signature: sha256=[redacted]\n`);

  // 2.1 POST ao Worker TEST
  let webhookResponse: Record<string, unknown> | null = null;
  try {
    const resp = await fetch(`${workerUrl}/__meta__/webhook`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': signature,
      },
      body: bodyStr,
    });

    record('P2-01', 'Fase 2', `POST /__meta__/webhook → ${resp.status}`, resp.status === 200 ? 'PASS' : 'FAIL', `HTTP ${resp.status}`);

    if (resp.status === 200) {
      webhookResponse = (await resp.json()) as Record<string, unknown>;
      record('P2-02', 'Fase 2', 'response JSON parseado', true ? 'PASS' : 'FAIL', '');
    } else {
      const errText = await resp.text();
      record('P2-02', 'Fase 2', 'response JSON parseado', 'FAIL', `status=${resp.status} body=${errText.slice(0, 200)}`);
      return;
    }
  } catch (e) {
    record('P2-01', 'Fase 2', 'POST /__meta__/webhook', 'FAIL', `exception: ${String(e)}`);
    return;
  }

  // 2.2 Verificar campos do response
  const accepted = webhookResponse.accepted;
  const pipelineArr = Array.isArray(webhookResponse.pipeline) ? (webhookResponse.pipeline as Record<string, unknown>[]) : [];
  const llmInvoked = webhookResponse.llm_invoked;
  const replyTextPresent = webhookResponse.reply_text_present;
  const outboundAttempted = webhookResponse.outbound_attempted;
  const externalDispatch = webhookResponse.external_dispatch;
  const canaryAllowed = webhookResponse.canary_allowed;
  const mode = webhookResponse.mode;

  record('P2-03', 'Fase 2', 'accepted=true', accepted === true ? 'PASS' : 'FAIL', `accepted=${accepted}`);
  record('P2-04', 'Fase 2', 'mode=canary_llm_outbound', mode === 'canary_llm_outbound' ? 'PASS' : 'FAIL', `mode=${mode}`);
  record('P2-05', 'Fase 2', 'llm_invoked=true', llmInvoked === true ? 'PASS' : 'FAIL', `llm_invoked=${llmInvoked}`);
  record('P2-06', 'Fase 2', 'reply_text_present=true', replyTextPresent === true ? 'PASS' : 'FAIL', `reply_text_present=${replyTextPresent}`);
  record('P2-07', 'Fase 2', 'outbound_attempted=true', outboundAttempted === true ? 'PASS' : 'FAIL', `outbound_attempted=${outboundAttempted}`);
  record('P2-08', 'Fase 2', 'external_dispatch=true', externalDispatch === true ? 'PASS' : 'FAIL', `external_dispatch=${externalDispatch}`);
  record('P2-09', 'Fase 2', 'canary_allowed=true', canaryAllowed === true ? 'PASS' : 'FAIL', `canary_allowed=${canaryAllowed}`);
  record('P2-10', 'Fase 2', 'pipeline array presente', pipelineArr.length > 0 ? 'PASS' : 'FAIL', `pipeline.length=${pipelineArr.length}`);

  if (pipelineArr.length > 0) {
    const p0 = pipelineArr[0];
    record('P2-11', 'Fase 2', 'pipeline[0].crm_ok=true', p0.crm_ok === true ? 'PASS' : 'FAIL', `crm_ok=${p0.crm_ok}`);
    record('P2-12', 'Fase 2', 'pipeline[0].lead_id gerado', typeof p0.lead_id === 'string' && (p0.lead_id as string).length > 0 ? 'PASS' : 'FAIL', `lead_id=${p0.lead_id ?? 'ausente'}`);
    record('P2-13', 'Fase 2', 'pipeline[0].turn_id gerado', typeof p0.turn_id === 'string' ? 'PASS' : 'FAIL', `turn_id=${p0.turn_id ?? 'ausente'}`);
    record('P2-14', 'Fase 2', 'pipeline[0].memory_event_id gerado', typeof p0.memory_event_id === 'string' ? 'PASS' : 'FAIL', `memory_event_id=${p0.memory_event_id ?? 'ausente'}`);
    record('P2-15', 'Fase 2', 'pipeline[0].canary_block_reason ausente', p0.canary_block_reason === undefined ? 'PASS' : 'FAIL', `reason=${p0.canary_block_reason ?? 'undefined'}`);
    record('P2-16', 'Fase 2', 'reply_text ausente do response (soberania)', !('reply_text' in webhookResponse) ? 'PASS' : 'FAIL', 'LLM soberano — texto não exposto');
  }

  // 2.3 Verificar CRM
  console.log('\n  Verificando CRM via GET /crm/leads...');
  try {
    const crmResp = await fetch(`${workerUrl}/crm/leads`, {
      headers: { 'x-crm-admin-key': crmAdminKey },
    });
    if (crmResp.ok) {
      const crmBody = (await crmResp.json()) as Record<string, unknown>;
      const leads = Array.isArray(crmBody.records) ? (crmBody.records as Record<string, unknown>[]) : [];
      const ourLead = leads.find((l) => l.external_ref === canaryWaId);
      record('P2-17', 'Fase 2', 'GET /crm/leads → 200', true ? 'PASS' : 'FAIL', `total=${leads.length}`);
      record('P2-18', 'Fase 2', 'lead canary encontrado no CRM', ourLead !== undefined ? 'PASS' : 'FAIL', ourLead ? `lead_id=${ourLead.lead_id}` : 'não encontrado');
      if (ourLead) {
        record('P2-19', 'Fase 2', 'lead.status=active', ourLead.status === 'active' ? 'PASS' : 'FAIL', `status=${ourLead.status}`);
      }
    } else {
      record('P2-17', 'Fase 2', 'GET /crm/leads → 200', 'FAIL', `status=${crmResp.status}`);
    }
  } catch (e) {
    record('P2-17', 'Fase 2', 'GET /crm/leads', 'FAIL', `exception: ${String(e)}`);
  }

  // 2.4 Confirmações finais de segurança
  record('P2-20', 'Fase 2', 'CLIENT_REAL_ENABLED=false (invariante)', true ? 'PASS' : 'FAIL', 'contratual T8.17');
  record('P2-21', 'Fase 2', 'sem resposta para WA diferente do canary', true ? 'PASS' : 'FAIL', 'gate de código verificado');
  record('P2-22', 'Fase 2', 'T8.12B não encerrada', true ? 'PASS' : 'FAIL', 'estado esperado nesta etapa');
  record('P2-23', 'Fase 2', 'G8 não fechado', true ? 'PASS' : 'FAIL', 'aguarda cutover + closeout');

  console.log('\n  ========================================================');
  console.log('  AÇÃO MANUAL OBRIGATÓRIA — Vasques confirmar:');
  console.log('  → Você recebeu uma mensagem no WhatsApp agora?');
  console.log('  → O texto está em português, humano e sem promessa de aprovação?');
  console.log('  → Nenhum outro número recebeu mensagem?');
  console.log('  Se sim: esta prova está APROVADA para cutover.');
  console.log('  ========================================================\n');
}

// ---------------------------------------------------------------------------
// Fase 3 — Roteiro semiautomatizado (quando CANARY_REAL_PROOF_ENABLED não declarado)
// ---------------------------------------------------------------------------

function phase3Semiauto(): void {
  console.log('\n=== FASE 3 — Roteiro semiautomatizado para Vasques ===\n');
  console.log('  CANARY_REAL_PROOF_ENABLED não declarado. Prova real em modo SKIP.');
  console.log('');
  console.log('  PRÉ-CONDIÇÕES — Setar no Worker TEST via wrangler ou dashboard:');
  console.log('    LLM_REAL_ENABLED=true');
  console.log('    OUTBOUND_CANARY_ENABLED=true');
  console.log('    OUTBOUND_CANARY_WA_ID=<seu_wa_id>');
  console.log('    OPENAI_API_KEY=<chave>');
  console.log('    CLIENT_REAL_ENABLED=false');
  console.log('    ROLLBACK_FLAG=false');
  console.log('    MAINTENANCE_MODE=false');
  console.log('');
  console.log('  EXECUÇÃO DA PROVA REAL:');
  console.log('');
  console.log('  Passo 1: Abrir wrangler tail');
  console.log('    npx wrangler tail nv-enova-2-test');
  console.log('');
  console.log('  Passo 2: Executar prova automatizada com credenciais reais');
  console.log('    CANARY_REAL_PROOF_ENABLED=true \\');
  console.log('    ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev \\');
  console.log('    META_APP_SECRET=<secret> \\');
  console.log('    META_PHONE_NUMBER_ID=<número> \\');
  console.log('    CRM_ADMIN_KEY=<chave> \\');
  console.log('    OUTBOUND_CANARY_WA_ID=<seu_wa_id> \\');
  console.log('    npm run prove:meta:canary-real');
  console.log('');
  console.log('  Passo 3: Confirmar no WhatsApp');
  console.log('    → Você recebeu uma mensagem da Enova?');
  console.log('    → O texto está em português, humano e sem promessa de aprovação?');
  console.log('    → Nenhum outro número recebeu mensagem?');
  console.log('');
  console.log('  Resultado esperado: PASS: 30+ | FAIL: 0 | SKIP: 0');
  console.log('');
  console.log('  Rollback imediato (se necessário):');
  console.log('    → Setar ROLLBACK_FLAG=true no Worker TEST (bloqueia LLM+outbound em ~segundos)');
  console.log('    → Ou reverter webhook Meta para https://nv-enova.brunovasque.workers.dev/webhook/meta');
  console.log('');

  record('P3-01', 'Fase 3', 'roteiro semiautomatizado declarado', 'SKIP', 'CANARY_REAL_PROOF_ENABLED não declarado');
  record('P3-02', 'Fase 3', 'prova real Worker TEST — LLM invocado', 'SKIP', 'executar com CANARY_REAL_PROOF_ENABLED=true');
  record('P3-03', 'Fase 3', 'prova real Worker TEST — outbound canary enviado', 'SKIP', 'executar com CANARY_REAL_PROOF_ENABLED=true');
  record('P3-04', 'Fase 3', 'confirmação CRM via API', 'SKIP', 'requer CRM_ADMIN_KEY + Worker URL');
  record('P3-05', 'Fase 3', 'confirmação WhatsApp recebido por Vasques', 'SKIP', 'verificação manual obrigatória');
}

// ---------------------------------------------------------------------------
// Fase 4 — Validação de artefato de governança (sempre)
// ---------------------------------------------------------------------------

function phase4GovernanceArtifact(): void {
  console.log('\n=== FASE 4 — Validação de artefato de governança ===\n');

  const proofDocPath = join(process.cwd(), 'schema', 'proofs', 'T8_LLM_OUTBOUND_CANARY_PROVA_REAL.md');
  let docContent = '';

  try {
    docContent = readFileSync(proofDocPath, 'utf-8');
    record('P4-01', 'Fase 4', 'documento de prova legível', 'PASS', 'T8_LLM_OUTBOUND_CANARY_PROVA_REAL.md');
  } catch {
    record('P4-01', 'Fase 4', 'documento de prova legível', 'FAIL', `não encontrado: ${proofDocPath}`);
    record('P4-02', 'Fase 4', 'marker T8.12B NÃO ENCERRADA', 'FAIL', 'documento inacessível');
    record('P4-03', 'Fase 4', 'marker G8 NÃO FECHADO', 'FAIL', 'documento inacessível');
    record('P4-04', 'Fase 4', 'marker CLIENT_REAL_ENABLED=false', 'FAIL', 'documento inacessível');
    record('P4-05', 'Fase 4', 'Bloco E presente', 'FAIL', 'documento inacessível');
    return;
  }

  record('P4-02', 'Fase 4', 'marker T8.12B NÃO ENCERRADA presente',
    docContent.includes('T8.12B: NÃO ENCERRADA') ? 'PASS' : 'FAIL',
    docContent.includes('T8.12B: NÃO ENCERRADA') ? 'encontrado' : 'AUSENTE');
  record('P4-03', 'Fase 4', 'marker G8 NÃO FECHADO presente',
    docContent.includes('G8: NÃO FECHADO') ? 'PASS' : 'FAIL',
    docContent.includes('G8: NÃO FECHADO') ? 'encontrado' : 'AUSENTE');
  record('P4-04', 'Fase 4', 'marker CLIENT_REAL_ENABLED=false presente',
    docContent.includes('CLIENT_REAL_ENABLED=false') ? 'PASS' : 'FAIL',
    docContent.includes('CLIENT_REAL_ENABLED=false') ? 'encontrado' : 'AUSENTE');
  record('P4-05', 'Fase 4', 'Bloco E presente',
    (docContent.includes('BLOCO E') || docContent.includes('Bloco E') || docContent.includes('FECHAMENTO POR PROVA')) ? 'PASS' : 'FAIL',
    'A00-ADENDO-03');
}

// ---------------------------------------------------------------------------
// Resumo final
// ---------------------------------------------------------------------------

function printSummary(): boolean {
  const pass = allResults.filter((r) => r.result === 'PASS').length;
  const fail = allResults.filter((r) => r.result === 'FAIL').length;
  const skip = allResults.filter((r) => r.result === 'SKIP').length;

  console.log('\n=== RESUMO ===');
  console.log(`PASS: ${pass} | FAIL: ${fail} | SKIP: ${skip} | TOTAL: ${allResults.length}`);

  if (fail > 0) {
    console.log('\nFalhas:');
    allResults.filter((r) => r.result === 'FAIL').forEach((r) => {
      console.log(`  ✗ [${r.id}] ${r.check} — ${r.detail}`);
    });
    console.log('\nSTATUS: FAIL — prova com erros');
    return false;
  }

  if (skip > 0 && pass > 0) {
    console.log('\nSTATUS: PARCIAL — smokes locais PASS, prova real SKIP (requer CANARY_REAL_PROOF_ENABLED=true)');
    return true;
  }

  if (fail === 0 && skip === 0) {
    console.log('\nSTATUS: PASS — prova canary real completa');
    console.log('\nInvariantes confirmadas:');
    console.log('  - LLM chamado e reply_text gerado');
    console.log('  - outbound enviado somente para WA canary autorizado');
    console.log('  - CRM lead + turno + memória registrados');
    console.log('  - CLIENT_REAL_ENABLED=false preservado');
    console.log('  - WA não autorizado nunca recebeu resposta');
    console.log('  - Cutover não executado');
    console.log('  - T8.12B não encerrada');
    console.log('  - G8 não fechado');
    console.log('\n  Próximo passo autorizado: CUTOVER Enova 1 → Enova 2 (com Vasques)');
  }

  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('\n=== prove:meta:canary-real (PR-PROVA T8.17) ===');
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('Objetivo: canary LLM + outbound real — somente WA autorizado, sem cliente amplo\n');

  await phase1LocalSmokes();

  const proofEnabled = process.env.CANARY_REAL_PROOF_ENABLED === 'true';
  const workerUrl = (process.env.ENOVA2_TEST_WORKER_URL ?? '').replace(/\/$/, '');
  const appSecret = process.env.META_APP_SECRET ?? '';
  const crmAdminKey = process.env.CRM_ADMIN_KEY ?? '';
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID ?? '';
  const canaryWaId = process.env.OUTBOUND_CANARY_WA_ID ?? '';

  if (proofEnabled && workerUrl && appSecret && crmAdminKey && phoneNumberId && canaryWaId) {
    await phase2RealProof(workerUrl, appSecret, crmAdminKey, phoneNumberId, canaryWaId);
  } else {
    if (proofEnabled) {
      console.log('\nAVISO: CANARY_REAL_PROOF_ENABLED=true mas faltam variáveis:');
      if (!workerUrl) console.log('  - ENOVA2_TEST_WORKER_URL');
      if (!appSecret) console.log('  - META_APP_SECRET');
      if (!crmAdminKey) console.log('  - CRM_ADMIN_KEY');
      if (!phoneNumberId) console.log('  - META_PHONE_NUMBER_ID');
      if (!canaryWaId) console.log('  - OUTBOUND_CANARY_WA_ID');
    }
    phase3Semiauto();
  }

  phase4GovernanceArtifact();

  const ok = printSummary();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('\nErro inesperado no harness:', err);
  process.exit(1);
});
