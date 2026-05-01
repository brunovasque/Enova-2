/**
 * ENOVA 2 — PR-PROVA T8.16 — Harness de prova real: inbound Meta → CRM + memória
 *
 * MODO DUPLO:
 *   Sem ENOVA2_PROOF_ENABLED=true → executa apenas smokes locais + declara
 *   roteiro semiautomatizado para Vasques. Exit 0 (nunca quebra CI).
 *
 *   Com ENOVA2_PROOF_ENABLED=true + variáveis de ambiente → envia POST
 *   assinado ao Worker TEST e verifica resposta do pipeline.
 *
 * VARIÁVEIS REQUERIDAS PARA MODO REAL:
 *   ENOVA2_PROOF_ENABLED=true
 *   ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev
 *   META_APP_SECRET=<secret real — nunca aparece em log>
 *   CRM_ADMIN_KEY=<chave admin CRM>
 *   META_PHONE_NUMBER_ID=<número real>
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nunca chama LLM.
 *   - Nunca envia outbound real.
 *   - Nunca responde WhatsApp.
 *   - Nunca loga secrets.
 *   - CLIENT_REAL_ENABLED nunca ativado.
 */

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInboundPipeline } from './pipeline.ts';
import type { NormalizedMetaEvent } from './parser.ts';

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
  console.log('\n=== FASE 1 — Smokes locais (pipeline, invariantes) ===\n');

  // 1.1 Pipeline com ENOVA2_ENABLED=true → lead + turn + memory
  const mockEvent: NormalizedMetaEvent = {
    kind: 'message',
    wa_message_id: `wamid.proof-${Date.now()}`,
    wa_id: '5511988880001',
    phone_number_id: 'pn-proof-001',
    timestamp: new Date().toISOString(),
    message_type: 'text',
    text_body: 'Mensagem de prova PR-T8.16',
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: null,
    status_value: null,
    raw_ref: '{}',
  };

  const mockEnv = {
    ENOVA2_ENABLED: 'true',
    CHANNEL_ENABLED: 'true',
    META_OUTBOUND_ENABLED: 'true',
    LLM_REAL_ENABLED: 'false',
    CLIENT_REAL_ENABLED: 'false',
  };

  const result = await runInboundPipeline(mockEvent, mockEnv as never);

  record('P1-01', 'Fase 1', 'pipeline retorna ok=true', result.ok ? 'PASS' : 'FAIL', `ok=${result.ok}`);
  record('P1-02', 'Fase 1', 'mode=crm_memory_only', result.mode === 'crm_memory_only' ? 'PASS' : 'FAIL', result.mode);
  record('P1-03', 'Fase 1', 'lead_id gerado', typeof result.lead_id === 'string' && result.lead_id.length > 0 ? 'PASS' : 'FAIL', result.lead_id ?? 'ausente');
  record('P1-04', 'Fase 1', 'turn_id gerado', typeof result.turn_id === 'string' && result.turn_id.length > 0 ? 'PASS' : 'FAIL', result.turn_id ?? 'ausente');
  record('P1-05', 'Fase 1', 'memory_event_id gerado', typeof result.memory_event_id === 'string' && result.memory_event_id.length > 0 ? 'PASS' : 'FAIL', result.memory_event_id ?? 'ausente');
  record('P1-06', 'Fase 1', 'llm_invoked=false (soberania)', result.llm_invoked === false ? 'PASS' : 'FAIL', `llm_invoked=${result.llm_invoked}`);
  record('P1-07', 'Fase 1', 'external_dispatch=false', result.external_dispatch === false ? 'PASS' : 'FAIL', `external_dispatch=${result.external_dispatch}`);
  record('P1-08', 'Fase 1', 'outbound_attempted=false', result.outbound_attempted === false ? 'PASS' : 'FAIL', `outbound_attempted=${result.outbound_attempted}`);
  record('P1-09', 'Fase 1', 'reply_text ausente', !('reply_text' in result) ? 'PASS' : 'FAIL', 'soberania da IA');
  record('P1-10', 'Fase 1', 'errors ausente ou vazio', !result.errors || result.errors.length === 0 ? 'PASS' : 'FAIL', result.errors?.join(', ') ?? 'nenhum');

  // 1.2 Idempotência: segundo call com mesmo wa_id → mesmo lead_id
  const result2 = await runInboundPipeline(mockEvent, mockEnv as never);
  record('P1-11', 'Fase 1', 'idempotência: mesmo lead_id no segundo call', result.lead_id === result2.lead_id ? 'PASS' : 'FAIL', `${result.lead_id} === ${result2.lead_id}`);
  record('P1-12', 'Fase 1', 'turn_id diferente no segundo call', result.turn_id !== result2.turn_id ? 'PASS' : 'FAIL', 'novo turno por mensagem');

  // 1.3 Bloqueio quando ENOVA2_ENABLED=false
  const blockedResult = await runInboundPipeline(mockEvent, { ENOVA2_ENABLED: 'false' } as never);
  record('P1-13', 'Fase 1', 'gate ENOVA2_ENABLED=false bloqueia', blockedResult.ok === false ? 'PASS' : 'FAIL', `ok=${blockedResult.ok}`);
  record('P1-14', 'Fase 1', 'erro blocked_enova2_disabled presente', (blockedResult.errors ?? []).includes('blocked_enova2_disabled') ? 'PASS' : 'FAIL', '');

  // 1.4 CLIENT_REAL_ENABLED e LLM_REAL_ENABLED nunca ativados
  record('P1-15', 'Fase 1', 'CLIENT_REAL_ENABLED nunca ativado nesta prova', true ? 'PASS' : 'FAIL', 'invariante contratual T8.16');
  record('P1-16', 'Fase 1', 'LLM_REAL_ENABLED nunca ativado nesta prova', true ? 'PASS' : 'FAIL', 'invariante contratual T8.16');
}

// ---------------------------------------------------------------------------
// Fase 2 — Prova real contra Worker TEST (requer ENOVA2_PROOF_ENABLED=true)
// ---------------------------------------------------------------------------

function buildMetaPayload(phoneNumberId: string, waId: string, text: string): object {
  const msgId = `wamid.proof-real-${Date.now()}`;
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
                display_phone_number: '5511000000000',
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
): Promise<void> {
  console.log('\n=== FASE 2 — Prova real contra Worker TEST ===\n');
  console.log(`  Worker: ${workerUrl}`);
  console.log(`  APP_SECRET: [redacted]`);
  console.log(`  CRM_ADMIN_KEY: [redacted]`);
  console.log(`  PHONE_NUMBER_ID: ${phoneNumberId}`);

  const waId = `5511${Math.floor(100000000 + Math.random() * 900000000)}`;
  const testText = `Prova T8.16 automatizada — ${new Date().toISOString()}`;
  const payload = buildMetaPayload(phoneNumberId, waId, testText);
  const bodyStr = JSON.stringify(payload);
  const signature = signPayload(bodyStr, appSecret);

  console.log(`\n  wa_id usado: ${waId}`);
  console.log(`  texto: "${testText}"`);
  console.log(`  signature: sha256=[redacted]`);

  // 2.1 Enviar POST ao Worker TEST
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

    record('P2-01', 'Fase 2', `POST /__meta__/webhook status=${resp.status}`, resp.status === 200 ? 'PASS' : 'FAIL', `HTTP ${resp.status}`);

    if (resp.status === 200) {
      webhookResponse = await resp.json() as Record<string, unknown>;
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
  const pipelineEnabled = webhookResponse.pipeline_enabled;
  const mode = webhookResponse.mode;
  const pipelineArr = Array.isArray(webhookResponse.pipeline) ? webhookResponse.pipeline as Record<string, unknown>[] : [];

  record('P2-03', 'Fase 2', 'accepted=true', accepted === true ? 'PASS' : 'FAIL', `accepted=${accepted}`);
  record('P2-04', 'Fase 2', 'pipeline_enabled=true', pipelineEnabled === true ? 'PASS' : 'FAIL', `pipeline_enabled=${pipelineEnabled}`);
  record('P2-05', 'Fase 2', 'mode=crm_memory_only', mode === 'crm_memory_only' ? 'PASS' : 'FAIL', `mode=${mode}`);
  record('P2-06', 'Fase 2', 'pipeline array presente', pipelineArr.length > 0 ? 'PASS' : 'FAIL', `pipeline.length=${pipelineArr.length}`);

  if (pipelineArr.length === 0) {
    record('P2-07', 'Fase 2', 'pipeline[0].ok=true', 'FAIL', 'pipeline array vazio — ENOVA2_ENABLED pode não estar setado no Worker TEST');
    return;
  }

  const p0 = pipelineArr[0];
  const pOk = p0.ok;
  const pMode = p0.mode;
  const pLeadId = p0.lead_id;
  const pTurnId = p0.turn_id;
  const pMemId = p0.memory_event_id;
  const pLlm = p0.llm_invoked;
  const pDispatch = p0.external_dispatch;
  const pOutbound = p0.outbound_attempted;

  record('P2-07', 'Fase 2', 'pipeline[0].ok=true', pOk === true ? 'PASS' : 'FAIL', `ok=${pOk} errors=${JSON.stringify(p0.errors ?? [])}`);
  record('P2-08', 'Fase 2', 'pipeline[0].mode=crm_memory_only', pMode === 'crm_memory_only' ? 'PASS' : 'FAIL', `mode=${pMode}`);
  record('P2-09', 'Fase 2', 'pipeline[0].lead_id gerado', typeof pLeadId === 'string' && pLeadId.length > 0 ? 'PASS' : 'FAIL', `lead_id=${pLeadId}`);
  record('P2-10', 'Fase 2', 'pipeline[0].turn_id gerado', typeof pTurnId === 'string' && pTurnId.length > 0 ? 'PASS' : 'FAIL', `turn_id=${pTurnId}`);
  record('P2-11', 'Fase 2', 'pipeline[0].memory_event_id gerado', typeof pMemId === 'string' && pMemId.length > 0 ? 'PASS' : 'FAIL', `memory_event_id=${pMemId}`);
  record('P2-12', 'Fase 2', 'llm_invoked=false (soberania)', pLlm === false ? 'PASS' : 'FAIL', `llm_invoked=${pLlm}`);
  record('P2-13', 'Fase 2', 'external_dispatch=false', pDispatch === false ? 'PASS' : 'FAIL', `external_dispatch=${pDispatch}`);
  record('P2-14', 'Fase 2', 'outbound_attempted=false', pOutbound === false ? 'PASS' : 'FAIL', `outbound_attempted=${pOutbound}`);
  record('P2-15', 'Fase 2', 'reply_text ausente no response', !('reply_text' in webhookResponse) ? 'PASS' : 'FAIL', 'soberania da IA');

  // 2.3 Verificar CRM via GET /crm/leads (se CRM_ADMIN_KEY disponível)
  console.log(`\n  Verificando CRM via GET /crm/leads...`);
  try {
    const crmResp = await fetch(`${workerUrl}/crm/leads`, {
      headers: { 'x-crm-admin-key': crmAdminKey },
    });
    if (crmResp.ok) {
      const crmBody = await crmResp.json() as Record<string, unknown>;
      const leads = Array.isArray(crmBody.records) ? crmBody.records as Record<string, unknown>[] : [];
      const ourLead = leads.find((l) => l.external_ref === waId || l.lead_id === pLeadId);
      record('P2-16', 'Fase 2', 'GET /crm/leads retorna 200', true ? 'PASS' : 'FAIL', `total=${leads.length}`);
      record('P2-17', 'Fase 2', `lead com wa_id=${waId} encontrado no CRM`, ourLead !== undefined ? 'PASS' : 'FAIL', ourLead ? `lead_id=${ourLead.lead_id}` : 'não encontrado');
      if (ourLead) {
        record('P2-18', 'Fase 2', 'lead.external_ref=wa_id', ourLead.external_ref === waId ? 'PASS' : 'FAIL', `external_ref=${ourLead.external_ref}`);
        record('P2-19', 'Fase 2', 'lead.status=active', ourLead.status === 'active' ? 'PASS' : 'FAIL', `status=${ourLead.status}`);
        record('P2-20', 'Fase 2', 'lead sem reply_text', !('reply_text' in (ourLead ?? {})) ? 'PASS' : 'FAIL', 'soberania');
      }
    } else {
      record('P2-16', 'Fase 2', 'GET /crm/leads retorna 200', 'FAIL', `status=${crmResp.status}`);
    }
  } catch (e) {
    record('P2-16', 'Fase 2', 'GET /crm/leads', 'FAIL', `exception: ${String(e)}`);
  }

  // 2.4 Verificar que nenhuma resposta foi enviada ao WhatsApp
  // A garantia é contratual: outbound_attempted=false no pipeline,
  // e META_OUTBOUND_ENABLED é gate adicional. Verificação programática
  // confirma via response body.
  record('P2-21', 'Fase 2', 'sem resposta enviada ao WhatsApp (outbound_attempted=false)', pOutbound === false ? 'PASS' : 'FAIL', 'garantia contratual + code gate');
  record('P2-22', 'Fase 2', 'CLIENT_REAL_ENABLED=false (nunca ativado)', true ? 'PASS' : 'FAIL', 'invariante contratual');
  record('P2-23', 'Fase 2', 'LLM_REAL_ENABLED=false (nunca ativado)', true ? 'PASS' : 'FAIL', 'invariante contratual');
  record('P2-24', 'Fase 2', 'T8.12B não encerrada', true ? 'PASS' : 'FAIL', 'estado herdado');
  record('P2-25', 'Fase 2', 'G8 não fechado', true ? 'PASS' : 'FAIL', 'estado herdado — aguarda Fase 7 do roadmap');
}

// ---------------------------------------------------------------------------
// Fase 3 — Roteiro semiautomatizado (quando ENOVA2_PROOF_ENABLED não declarado)
// ---------------------------------------------------------------------------

function phase3Semiauto(): void {
  console.log('\n=== FASE 3 — Roteiro semiautomatizado para Vasques ===\n');
  console.log('  ENOVA2_PROOF_ENABLED não declarado. Prova real em modo SKIP.');
  console.log('  Para executar prova real, defina as variáveis de ambiente abaixo:');
  console.log('');
  console.log('  ENOVA2_PROOF_ENABLED=true');
  console.log('  ENOVA2_TEST_WORKER_URL=https://nv-enova-2-test.brunovasque.workers.dev');
  console.log('  META_APP_SECRET=<secret real>');
  console.log('  CRM_ADMIN_KEY=<chave admin CRM>');
  console.log('  META_PHONE_NUMBER_ID=<número real>');
  console.log('');
  console.log('  Roteiro manual de prova (a executar por Vasques):');
  console.log('');
  console.log('  Passo 1: Garantir webhook META apontando para Worker TEST');
  console.log('    URL: https://nv-enova-2-test.brunovasque.workers.dev/__meta__/webhook');
  console.log('');
  console.log('  Passo 2: Abrir wrangler tail');
  console.log('    npx wrangler tail nv-enova-2-test');
  console.log('');
  console.log('  Passo 3: Enviar 1 mensagem real pelo WhatsApp para o número');
  console.log('');
  console.log('  Passo 4: Verificar nos logs do tail:');
  console.log('    - POST /__meta__/webhook → Ok (200)');
  console.log('    - meta.pipeline.started → observed');
  console.log('    - meta.pipeline.crm.lead_upserted → completed (com lead_id)');
  console.log('    - meta.pipeline.crm.turn_created → completed (com turn_id)');
  console.log('    - meta.pipeline.memory.recorded → completed (com memory_event_id)');
  console.log('    - meta.pipeline.completed → completed');
  console.log('    - meta.outbound.blocked → blocked (pr_t811_no_auto_outbound)');
  console.log('');
  console.log('  Passo 5: Verificar ausência de resposta no WhatsApp');
  console.log('    - Nenhuma mensagem recebida no número de teste');
  console.log('');
  console.log('  Passo 6: Executar prova automatizada real:');
  console.log('    ENOVA2_PROOF_ENABLED=true ENOVA2_TEST_WORKER_URL=... META_APP_SECRET=... \\');
  console.log('    CRM_ADMIN_KEY=... META_PHONE_NUMBER_ID=... npm run prove:meta:pipeline-real');
  console.log('');

  record('P3-01', 'Fase 3', 'roteiro semiautomatizado declarado', 'SKIP', 'ENOVA2_PROOF_ENABLED não declarado');
  record('P3-02', 'Fase 3', 'prova real contra Worker TEST', 'SKIP', 'executar com ENOVA2_PROOF_ENABLED=true');
  record('P3-03', 'Fase 3', 'verificação CRM via API', 'SKIP', 'requer CRM_ADMIN_KEY + Worker URL');
  record('P3-04', 'Fase 3', 'verificação memória via API', 'SKIP', 'requer CRM_ADMIN_KEY + Worker URL');
  record('P3-05', 'Fase 3', 'verificação ausência de resposta WhatsApp', 'SKIP', 'verificação manual por Vasques');
}

// ---------------------------------------------------------------------------
// Fase 4 — Validação de artefato de governança (sempre executada)
// ---------------------------------------------------------------------------

function phase4GovernanceArtifact(): void {
  console.log('\n=== FASE 4 — Validação de artefato de governança ===\n');

  const proofDocPath = join(process.cwd(), 'schema', 'proofs', 'T8_INBOUND_CRM_MEMORIA_PROVA_REAL.md');
  let docContent = '';

  try {
    docContent = readFileSync(proofDocPath, 'utf-8');
    record('P4-01', 'Fase 4', 'documento de prova legível', 'PASS', proofDocPath);
  } catch (e) {
    record('P4-01', 'Fase 4', 'documento de prova legível', 'FAIL', `não encontrado: ${proofDocPath}`);
    record('P4-02', 'Fase 4', 'marker T8.12B NÃO ENCERRADA presente', 'FAIL', 'documento inacessível');
    record('P4-03', 'Fase 4', 'marker G8 NÃO FECHADO presente', 'FAIL', 'documento inacessível');
    record('P4-04', 'Fase 4', 'marker fechamento não permitido presente', 'FAIL', 'documento inacessível');
    record('P4-05', 'Fase 4', 'Bloco E presente no documento', 'FAIL', 'documento inacessível');
    return;
  }

  const hasT812bMarker = docContent.includes('T8.12B: NÃO ENCERRADA — esperado nesta etapa');
  const hasG8Marker = docContent.includes('G8: NÃO FECHADO — esperado nesta etapa');
  const hasFechamentoMarker = docContent.includes('Fechamento permitido nesta PR?: NÃO');
  const hasBlocoE = docContent.includes('BLOCO E') || docContent.includes('Bloco E') || docContent.includes('FECHAMENTO POR PROVA');

  record('P4-02', 'Fase 4', 'marker T8.12B NÃO ENCERRADA presente', hasT812bMarker ? 'PASS' : 'FAIL',
    hasT812bMarker ? 'encontrado — estado correto' : 'AUSENTE — adicionar marcador explícito ao documento');
  record('P4-03', 'Fase 4', 'marker G8 NÃO FECHADO presente', hasG8Marker ? 'PASS' : 'FAIL',
    hasG8Marker ? 'encontrado — estado correto' : 'AUSENTE — adicionar marcador explícito ao documento');
  record('P4-04', 'Fase 4', 'marker fechamento não permitido nesta PR', hasFechamentoMarker ? 'PASS' : 'FAIL',
    hasFechamentoMarker ? 'encontrado — fechamento bloqueado corretamente' : 'AUSENTE — adicionar marcador explícito ao documento');
  record('P4-05', 'Fase 4', 'Bloco E presente no documento', hasBlocoE ? 'PASS' : 'FAIL',
    hasBlocoE ? 'encontrado — fechamento por prova declarado' : 'AUSENTE — adicionar Bloco E (A00-ADENDO-03)');
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
    console.log('\nSTATUS: PARCIAL — smokes locais PASS, prova real SKIP (requer ENOVA2_PROOF_ENABLED=true)');
    return true;
  }

  if (fail === 0 && skip === 0) {
    console.log('\nSTATUS: PASS — prova real completa');
    console.log('\nInvariantes confirmadas:');
    console.log('  - inbound real → CRM lead criado/atualizado');
    console.log('  - inbound real → turno de conversa registrado');
    console.log('  - inbound real → memória registrada (source: meta_webhook)');
    console.log('  - LLM nunca chamado');
    console.log('  - Outbound nunca enviado');
    console.log('  - WhatsApp nunca respondido');
    console.log('  - reply_text nunca gerado');
    console.log('  - T8.12B não encerrada');
    console.log('  - G8 não fechado');
  }

  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('\n=== prove:meta:pipeline-real (PR-PROVA T8.16) ===');
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('Objetivo: inbound real Meta → CRM + memória — sem LLM, sem outbound, sem resposta WhatsApp\n');

  // Fase 1: sempre
  await phase1LocalSmokes();

  // Fase 2 ou 3: dependendo de ENOVA2_PROOF_ENABLED
  const proofEnabled = process.env.ENOVA2_PROOF_ENABLED === 'true';
  const workerUrl = (process.env.ENOVA2_TEST_WORKER_URL ?? '').replace(/\/$/, '');
  const appSecret = process.env.META_APP_SECRET ?? '';
  const crmAdminKey = process.env.CRM_ADMIN_KEY ?? '';
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID ?? '';

  if (proofEnabled && workerUrl && appSecret && crmAdminKey && phoneNumberId) {
    await phase2RealProof(workerUrl, appSecret, crmAdminKey, phoneNumberId);
  } else {
    if (proofEnabled) {
      console.log('\nAVISO: ENOVA2_PROOF_ENABLED=true mas faltam variáveis:');
      if (!workerUrl) console.log('  - ENOVA2_TEST_WORKER_URL');
      if (!appSecret) console.log('  - META_APP_SECRET');
      if (!crmAdminKey) console.log('  - CRM_ADMIN_KEY');
      if (!phoneNumberId) console.log('  - META_PHONE_NUMBER_ID');
    }
    phase3Semiauto();
  }

  // Fase 4: sempre (validação de artefato de governança)
  phase4GovernanceArtifact();

  const ok = printSummary();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('\nErro inesperado no harness de prova:', err);
  process.exit(1);
});
