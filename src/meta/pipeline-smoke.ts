/**
 * ENOVA 2 — PR-T8.16 — Smoke test: pipeline inbound → CRM + memória
 *
 * Verifica invariantes do pipeline sem LLM, sem outbound, sem WhatsApp real.
 */

import { runInboundPipeline } from './pipeline.ts';
import type { NormalizedMetaEvent } from './parser.ts';

interface SmokeResult {
  name: string;
  pass: boolean;
  detail?: string;
}

const results: SmokeResult[] = [];

function check(name: string, condition: boolean, detail?: string): void {
  results.push({ name, pass: condition, detail });
  const icon = condition ? '✓' : '✗';
  const suffix = detail ? ` — ${detail}` : '';
  console.log(`  ${icon} ${name}${suffix}`);
}

const mockEvent: NormalizedMetaEvent = {
  kind: 'message',
  wa_message_id: 'wamid.test123',
  wa_id: '5511999990001',
  phone_number_id: 'pn-test-001',
  timestamp: new Date().toISOString(),
  message_type: 'text',
  text_body: 'Olá, quero saber mais sobre o programa MCMV.',
  media_id: null,
  media_mime_type: null,
  media_filename: null,
  status_id: null,
  status_value: null,
  raw_ref: '{}',
};

const mockEnvEnabled = {
  ENOVA2_ENABLED: 'true',
  CHANNEL_ENABLED: 'true',
  META_OUTBOUND_ENABLED: 'true',
  LLM_REAL_ENABLED: 'false',
  CLIENT_REAL_ENABLED: 'false',
};

const mockEnvDisabled = {
  ENOVA2_ENABLED: 'false',
};

async function runSmokes(): Promise<void> {
  console.log('\n=== smoke:meta:pipeline (PR-T8.16) ===\n');

  // --- Smoke 1: pipeline retorna estrutura correta quando ENOVA2_ENABLED=true
  console.log('Bloco 1 — Pipeline com ENOVA2_ENABLED=true:');
  {
    const result = await runInboundPipeline(mockEvent, mockEnvEnabled as never);
    check('mode é crm_memory_only', result.mode === 'crm_memory_only');
    check('llm_invoked é false', result.llm_invoked === false);
    check('external_dispatch é false', result.external_dispatch === false);
    check('outbound_attempted é false', result.outbound_attempted === false);
    check('lead_id gerado', typeof result.lead_id === 'string' && result.lead_id.length > 0, result.lead_id);
    check('turn_id gerado', typeof result.turn_id === 'string' && result.turn_id.length > 0, result.turn_id);
    check('memory_event_id gerado', typeof result.memory_event_id === 'string' && result.memory_event_id.length > 0, result.memory_event_id);
    check('ok=true (sem erros)', result.ok === true);
    check('errors ausente ou vazio', !result.errors || result.errors.length === 0);
  }

  // --- Smoke 2: idempotência — mesmo wa_id retorna mesmo lead_id
  console.log('\nBloco 2 — Idempotência (mesmo wa_id):');
  {
    const r1 = await runInboundPipeline(mockEvent, mockEnvEnabled as never);
    const r2 = await runInboundPipeline(mockEvent, mockEnvEnabled as never);
    check('lead_id idêntico em chamadas repetidas', r1.lead_id === r2.lead_id, `${r1.lead_id} === ${r2.lead_id}`);
    check('turn_id diferente por chamada', r1.turn_id !== r2.turn_id);
    check('memory_event_id diferente por chamada', r1.memory_event_id !== r2.memory_event_id);
  }

  // --- Smoke 3: pipeline bloqueado quando ENOVA2_ENABLED=false
  console.log('\nBloco 3 — Bloqueio quando ENOVA2_ENABLED=false:');
  {
    const result = await runInboundPipeline(mockEvent, mockEnvDisabled as never);
    check('ok=false quando bloqueado', result.ok === false);
    check('errors contém blocked_enova2_disabled', (result.errors ?? []).includes('blocked_enova2_disabled'));
    check('lead_id ausente', result.lead_id === undefined);
    check('turn_id ausente', result.turn_id === undefined);
    check('memory_event_id ausente', result.memory_event_id === undefined);
    check('llm_invoked sempre false', result.llm_invoked === false);
    check('external_dispatch sempre false', result.external_dispatch === false);
    check('outbound_attempted sempre false', result.outbound_attempted === false);
  }

  // --- Smoke 4: evento de status não é processado como mensagem
  console.log('\nBloco 4 — Evento status (não é mensagem de atendimento):');
  {
    const statusEvent: NormalizedMetaEvent = {
      ...mockEvent,
      kind: 'status',
      text_body: null,
      wa_message_id: null,
      status_id: 'status-001',
      status_value: 'delivered',
    };
    // Pipeline aceita status mas registra sem texto
    const result = await runInboundPipeline(statusEvent, mockEnvEnabled as never);
    check('mode é crm_memory_only', result.mode === 'crm_memory_only');
    check('llm_invoked é false', result.llm_invoked === false);
    check('outbound_attempted é false', result.outbound_attempted === false);
  }

  // --- Smoke 5: invariantes soberania — sem reply_text, sem LLM
  console.log('\nBloco 5 — Soberania da IA (invariantes):');
  {
    const result = await runInboundPipeline(mockEvent, mockEnvEnabled as never);
    check('reply_text ausente no resultado', !('reply_text' in result));
    check('llm_invoked=false (soberania)', result.llm_invoked === false);
    check('external_dispatch=false', result.external_dispatch === false);
  }

  // --- Resumo
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = total - passed;

  console.log(`\n--- Resultado ---`);
  console.log(`PASS: ${passed} | FAIL: ${failed} | TOTAL: ${total}`);

  if (failed > 0) {
    console.log('\nFalhas:');
    results.filter((r) => !r.pass).forEach((r) => {
      console.log(`  ✗ ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
    });
    console.log('\nSTATUS: FAIL — pipeline inbound com erros\n');
    process.exit(1);
  } else {
    console.log('\nSTATUS: PASS — pipeline inbound → CRM + memória OK\n');
    console.log('Invariantes confirmadas:');
    console.log('  - LLM nunca chamado');
    console.log('  - Outbound nunca enviado');
    console.log('  - WhatsApp nunca respondido');
    console.log('  - reply_text nunca gerado');
    console.log('  - ENOVA2_ENABLED gate funcionando');
  }
}

runSmokes().catch((err) => {
  console.error('Erro inesperado no smoke:', err);
  process.exit(1);
});
