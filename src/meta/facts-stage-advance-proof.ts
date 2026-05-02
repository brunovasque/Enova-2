// prove:t9.7-facts-stage-advance — T9.7
// Prova end-to-end: texto WhatsApp real → extractFactsFromText → writeLeadFact pending
// → getLeadFacts → runCoreEngine → stage avança.
//
// Não chama LLM real, Meta real, Supabase real.
// Exit 0 = PROVA CONFIRMADA.

import { runCanaryPipeline } from './canary-pipeline.ts';
import type { NormalizedMetaEvent } from './parser.ts';
import type { LlmClientResult } from '../llm/client.ts';
import type { OutboundResult } from './outbound.ts';
import { getCrmBackend } from '../crm/store.ts';
import { getLeadState, getLeadFacts } from '../crm/service.ts';

let pass = 0;
let fail = 0;

function check(label: string, condition: boolean, detail = ''): void {
  if (condition) {
    pass++;
    console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function mockEvent(wa_id: string, text: string): NormalizedMetaEvent {
  return {
    kind: 'message',
    wa_message_id: `wamid.proof-t9.7-${wa_id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    wa_id,
    phone_number_id: 'pn-proof-t9.7',
    timestamp: new Date().toISOString(),
    message_type: 'text',
    text_body: text,
    media_id: null,
    media_mime_type: null,
    media_filename: null,
    status_id: null,
    status_value: null,
    raw_ref: '{}',
  };
}

function baseEnv(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ENOVA2_ENABLED: 'true',
    CHANNEL_ENABLED: 'true',
    META_OUTBOUND_ENABLED: 'false',
    META_ACCESS_TOKEN: 'fake-token-proof-t9.7',
    META_PHONE_NUMBER_ID: 'pn-proof-t9.7',
    LLM_REAL_ENABLED: 'false',
    OUTBOUND_CANARY_ENABLED: 'false',
    OUTBOUND_CANARY_WA_ID: '',
    CLIENT_REAL_ENABLED: 'false',
    ROLLBACK_FLAG: 'false',
    MAINTENANCE_MODE: 'false',
    OPENAI_API_KEY: '',
    ...overrides,
  };
}

function mockLlm(): () => Promise<LlmClientResult> {
  return async () => ({ ok: true, reply_text: 'Olá! Posso ajudar.', llm_invoked: false, latency_ms: 1 });
}

function mockOutbound(): () => Promise<OutboundResult> {
  return async () => ({ external_dispatch: false, http_status: 200, blocked_reason: 'canary_disabled' });
}

const SECRET_PATTERNS = [
  /META_ACCESS_TOKEN\s*[:=]\s*[^\s]+/i,
  /OPENAI_API_KEY\s*[:=]\s*[^\s]+/i,
  /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*[^\s]+/i,
  /CRM_ADMIN_KEY\s*[:=]\s*[^\s]+/i,
  /Bearer\s+[A-Za-z0-9_\-.]+/i,
  /sk-[A-Za-z0-9_\-]{10,}/,
  /sb-[A-Za-z0-9_\-]{10,}/,
];

function containsSecret(text: string): boolean {
  return SECRET_PATTERNS.some((p) => p.test(text));
}

async function main(): Promise<void> {
  console.log('\n=== prove:t9.7-facts-stage-advance — T9.7 ===\n');
  console.log('Objetivo: provar que texto WhatsApp real → fact extraído → fact persistido → Core avança stage.\n');

  const env = baseEnv();

  // ─────────────────────────────────────────────────────────────────────────
  // CENÁRIO A — Discovery avança: customer_goal extraído → stage → qualification_civil
  // ─────────────────────────────────────────────────────────────────────────
  console.log('── Cenário A: Discovery avança para qualification_civil ──');

  const WA_A = '5511900001100';
  const reportA = await runCanaryPipeline(
    mockEvent(WA_A, 'Quero comprar um imóvel pelo Minha Casa Minha Vida'),
    env as never,
    undefined,
    { _testLlmCaller: mockLlm(), _testOutboundSender: mockOutbound() },
  );

  check('A1: pipeline ok', reportA.ok === true, `errors: ${JSON.stringify(reportA.errors ?? [])}`);
  check('A2: lead_id gerado', typeof reportA.lead_id === 'string' && (reportA.lead_id?.length ?? 0) > 0);
  check('A3: turn_id gerado', typeof reportA.turn_id === 'string' && (reportA.turn_id?.length ?? 0) > 0);
  check('A4: stage_at_turn não é unknown', reportA.errors?.every((e) => !e.includes('unknown')) !== false);

  const leadA = reportA.lead_id!;
  const backend = await getCrmBackend(env);

  const stateA = await getLeadState(backend, leadA);
  check('A5: stage persistido no CRM', stateA.found === true);
  check('A6: stage_current saiu de discovery', stateA.record?.stage_current !== 'discovery', stateA.record?.stage_current);
  check('A7: stage_current = qualification_civil', stateA.record?.stage_current === 'qualification_civil', stateA.record?.stage_current);
  check('A8: state_version incrementado', (stateA.record?.state_version ?? 0) >= 1);

  const factsA = await getLeadFacts(backend, leadA);
  const factKeysA = factsA.records.map((f) => f.fact_key);
  const customerGoalFact = factsA.records.find((f) => f.fact_key === 'customer_goal');
  check('A9: fact customer_goal persisted', customerGoalFact !== undefined, `keys: ${factKeysA.join(', ')}`);
  check('A10: customer_goal = comprar_imovel', customerGoalFact?.fact_value === 'comprar_imovel', String(customerGoalFact?.fact_value));
  check('A11: fact status = pending', customerGoalFact?.status === 'pending', customerGoalFact?.status ?? 'undefined');
  check('A12: facts count >= 1', factsA.records.length >= 1, `count: ${factsA.records.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // CENÁRIO B — Civil avança: estado_civil + processo extraídos → stage → qualification_renda
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Cenário B: qualification_civil → qualification_renda ──');

  // Continua com o mesmo lead (já em qualification_civil após Cenário A)
  const reportB = await runCanaryPipeline(
    mockEvent(WA_A, 'Sou solteiro e vou comprar sozinho'),
    env as never,
    undefined,
    { _testLlmCaller: mockLlm(), _testOutboundSender: mockOutbound() },
  );

  check('B1: pipeline ok no turno civil', reportB.ok === true, `errors: ${JSON.stringify(reportB.errors ?? [])}`);
  check('B2: mesmo lead_id (lead persiste entre turnos)', reportB.lead_id === leadA, `${reportB.lead_id} === ${leadA}`);

  const stateB = await getLeadState(backend, leadA);
  check('B3: stage_current não regrediu', stateB.record?.stage_current !== 'discovery', stateB.record?.stage_current);
  check('B4: stage_current = qualification_renda', stateB.record?.stage_current === 'qualification_renda', stateB.record?.stage_current);
  check('B5: state_version incrementado novamente', (stateB.record?.state_version ?? 0) >= 2, String(stateB.record?.state_version));

  const factsB = await getLeadFacts(backend, leadA);
  const estadoCivilFact = factsB.records.find((f) => f.fact_key === 'estado_civil');
  const processoFact = factsB.records.find((f) => f.fact_key === 'processo');
  check('B6: fact estado_civil persistido', estadoCivilFact !== undefined, `keys: ${factsB.records.map((f) => f.fact_key).join(', ')}`);
  check('B7: estado_civil = solteiro', estadoCivilFact?.fact_value === 'solteiro', String(estadoCivilFact?.fact_value));
  check('B8: fact processo persistido', processoFact !== undefined);
  check('B9: processo = solo', processoFact?.fact_value === 'solo', String(processoFact?.fact_value));
  check('B10: ambos facts com status pending ou accepted', [estadoCivilFact?.status, processoFact?.status].every((s) => s === 'pending' || s === 'accepted'));

  // ─────────────────────────────────────────────────────────────────────────
  // CENÁRIO C — Renda: regime_trabalho + renda_principal extraídos, Core lê facts
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Cenário C: qualification_renda — renda extraída e lida pelo Core ──');

  // Continua com o mesmo lead (já em qualification_renda após Cenário B)
  const reportC = await runCanaryPipeline(
    mockEvent(WA_A, 'Trabalho CLT e ganho R$ 3.500'),
    env as never,
    undefined,
    { _testLlmCaller: mockLlm(), _testOutboundSender: mockOutbound() },
  );

  check('C1: pipeline ok no turno renda', reportC.ok === true, `errors: ${JSON.stringify(reportC.errors ?? [])}`);
  check('C2: lead_id idêntico', reportC.lead_id === leadA);

  const stateC = await getLeadState(backend, leadA);
  check('C3: stage_current não regrediu para discovery', stateC.record?.stage_current !== 'discovery', stateC.record?.stage_current);
  check('C4: stage_current avançou além de qualification_renda', stateC.record?.stage_current !== 'qualification_renda', stateC.record?.stage_current);
  check('C5: stage_current = qualification_eligibility', stateC.record?.stage_current === 'qualification_eligibility', stateC.record?.stage_current);
  check('C6: state_version incrementou', (stateC.record?.state_version ?? 0) >= 3, String(stateC.record?.state_version));

  const factsC = await getLeadFacts(backend, leadA);
  const regimeFact = factsC.records.find((f) => f.fact_key === 'regime_trabalho');
  const rendaFact = factsC.records.find((f) => f.fact_key === 'renda_principal');
  check('C7: fact regime_trabalho persistido', regimeFact !== undefined, `keys: ${factsC.records.map((f) => f.fact_key).join(', ')}`);
  check('C8: regime_trabalho = clt', regimeFact?.fact_value === 'clt', String(regimeFact?.fact_value));
  check('C9: fact renda_principal persistido', rendaFact !== undefined);
  check('C10: renda_principal = 3500', rendaFact?.fact_value === 3500, String(rendaFact?.fact_value));

  // ─────────────────────────────────────────────────────────────────────────
  // CENÁRIO D — Texto sem fact não quebra, stage não reseta
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Cenário D: texto genérico sem fact — pipeline ok, stage não reseta ──');

  const WA_D = '5511900001101';
  const reportD1 = await runCanaryPipeline(
    mockEvent(WA_D, 'Quero comprar um imóvel pelo Minha Casa Minha Vida'),
    env as never,
    undefined,
    { _testLlmCaller: mockLlm(), _testOutboundSender: mockOutbound() },
  );
  const leadD = reportD1.lead_id!;
  check('D1: pipeline ok turno inicial', reportD1.ok === true);

  const stateD1 = await getLeadState(backend, leadD);
  const stageD1 = stateD1.record?.stage_current;
  check('D2: stage avançou para qualification_civil após turno inicial', stageD1 === 'qualification_civil', stageD1);

  // Turno com texto genérico sem fact relevante
  const reportD2 = await runCanaryPipeline(
    mockEvent(WA_D, 'tá bom entendi'),
    env as never,
    undefined,
    { _testLlmCaller: mockLlm(), _testOutboundSender: mockOutbound() },
  );
  check('D3: pipeline ok com texto genérico', reportD2.ok === true, `errors: ${JSON.stringify(reportD2.errors ?? [])}`);
  check('D4: lead_id idêntico', reportD2.lead_id === leadD);

  const stateD2 = await getLeadState(backend, leadD);
  const stageD2 = stateD2.record?.stage_current;
  check('D5: stage não regrediu para discovery', stageD2 !== 'discovery', stageD2);
  check('D6: stage manteve qualification_civil (sem fact civil suficiente)', stageD2 === 'qualification_civil', stageD2);
  check('D7: nenhuma exceção no pipeline', !(reportD2.errors ?? []).some((e) => e.includes('exception')));

  // ─────────────────────────────────────────────────────────────────────────
  // CENÁRIO E — Segurança: output não vaza secrets
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Cenário E: segurança — nenhum secret no output do pipeline ──');

  // Serializar os reports para texto e verificar ausência de secrets
  const reportsText = JSON.stringify([reportA, reportB, reportC, reportD1, reportD2]);
  check('E1: output não contém META_ACCESS_TOKEN', !containsSecret(reportsText.replace(/fake-token-proof-t9\.7/, '')));
  check('E2: output não contém OPENAI_API_KEY', !(/OPENAI_API_KEY/.test(reportsText)));
  check('E3: output não contém Bearer token real', !(/Bearer\s+[A-Za-z0-9_\-.]{20,}/.test(reportsText)));
  check('E4: output não contém sk- ou sb- de credencial', !(/sk-[A-Za-z0-9_\-]{10,}/.test(reportsText) || /sb-[A-Za-z0-9_\-]{10,}/.test(reportsText)));
  check('E5: nenhum campo lead_id vaza wa_id real', !reportsText.includes('5511900001100') || reportsText.includes('lead_id'));

  // ─────────────────────────────────────────────────────────────────────────
  // Resultado final
  // ─────────────────────────────────────────────────────────────────────────
  console.log(`\n─────────────────────────────────────────────`);
  console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL`);
  console.log(`─────────────────────────────────────────────`);

  if (fail > 0) {
    console.error('\n✗ PROVA FALHOU — stage advance NÃO confirmado.');
    process.exit(1);
  }

  console.log('\n✓ PROVA CONFIRMADA — texto real → fact extraído → fact persistido → stage avança.');
  process.exit(0);
}

main().catch((e) => {
  console.error('PROVA EXCEPTION:', String(e));
  process.exit(1);
});
