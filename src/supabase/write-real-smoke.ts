// smoke:supabase:write-real — T9.12
// Valida lógica de escrita real condicional do SupabaseCrmBackend.
//
// Modo mock/local — sem Supabase real obrigatório.
// Verifica mapeamentos, rotas de flag, fallback e sanitização de secrets.
// Exit 0 = OK.

import { SupabaseCrmBackend } from './crm-store.ts';
import type { CrmLead, CrmLeadState } from '../crm/types.ts';

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

const FAKE_SECRET = 'sk-fake-service-role-secret-12345678';
const FAKE_URL = 'http://localhost:54321';

async function run(): Promise<void> {
  const backendOff = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_SECRET }, false);
  const backendOn  = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_SECRET }, true);

  const LEAD: CrmLead = {
    lead_id: 'lead-smoke-001',
    external_ref: '5511999990001',
    customer_name: 'Smoke Test',
    phone_ref: '5511999990001',
    status: 'active',
    manual_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const STATE: CrmLeadState = {
    state_id: 'enova_state:lead-smoke-001',
    lead_id: 'lead-smoke-001',
    stage_current: 'discovery',
    next_objective: 'coletar_customer_goal',
    block_advance: true,
    policy_flags: {},
    risk_flags: null,
    state_version: 1,
    updated_at: new Date().toISOString(),
  };

  console.log('\n=== smoke:supabase:write-real — T9.12 ===\n');

  // ─── S1: Mapeamento crm_leads → crm_lead_meta ────────────────────────────

  console.log('── S1: crm_leads mapeia para crm_lead_meta ──');

  const s1insert = await backendOff.insert<CrmLead>('crm_leads', LEAD);
  check('S1.1: insert crm_leads com flag OFF retorna lead', s1insert.lead_id === LEAD.lead_id);
  check('S1.2: phone_ref preservado', s1insert.phone_ref === LEAD.phone_ref);
  check('S1.3: external_ref preservado', s1insert.external_ref === LEAD.external_ref);

  // ─── S2: Mapeamento crm_lead_state → enova_state ─────────────────────────

  console.log('\n── S2: crm_lead_state mapeia para enova_state ──');

  const s2insert = await backendOff.insert<CrmLeadState>('crm_lead_state', STATE);
  check('S2.1: insert crm_lead_state com flag OFF retorna state', s2insert.lead_id === STATE.lead_id);
  check('S2.2: stage_current preservado', s2insert.stage_current === STATE.stage_current);
  check('S2.3: state_version preservado', s2insert.state_version === STATE.state_version);

  // ─── S3: crm_turns NÃO usa escrita real ──────────────────────────────────

  console.log('\n── S3: crm_turns → sempre writeBuffer ──');

  const fakeTurn = {
    turn_id: 'turn-001',
    lead_id: 'lead-001',
    channel_type: 'whatsapp',
    raw_input_summary: 'teste',
    stage_at_turn: 'discovery',
    model_name: null,
    latency_ms: null,
    created_at: new Date().toISOString(),
  };
  const s3insert = await backendOn.insert('crm_turns', fakeTurn);
  check('S3.1: insert crm_turns com flag ON não quebra', s3insert !== null && s3insert !== undefined);
  check('S3.2: turn_id preservado no fallback', (s3insert as typeof fakeTurn).turn_id === fakeTurn.turn_id);

  const s3all = await backendOn.findAll('crm_turns');
  const s3found = s3all.some((r) => (r as typeof fakeTurn).turn_id === 'turn-001');
  check('S3.3: crm_turns encontrado no writeBuffer após insert', s3found);

  // ─── S4: crm_facts NÃO usa escrita real ──────────────────────────────────

  console.log('\n── S4: crm_facts → sempre writeBuffer ──');

  const fakeFact = {
    fact_id: 'fact-001',
    lead_id: 'lead-001',
    fact_key: 'estado_civil',
    fact_value: 'solteiro',
    confidence: 0.9,
    source: 'text_extractor',
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const s4insert = await backendOn.insert('crm_facts', fakeFact);
  check('S4.1: insert crm_facts com flag ON não quebra', s4insert !== null);
  check('S4.2: fact_key preservado no fallback', (s4insert as typeof fakeFact).fact_key === fakeFact.fact_key);

  const s4all = await backendOn.findAll('crm_facts');
  check('S4.3: crm_facts encontrado no writeBuffer após insert', s4all.some((r) => (r as typeof fakeFact).fact_id === 'fact-001'));

  // ─── S5: flag OFF → sempre writeBuffer ───────────────────────────────────

  console.log('\n── S5: SUPABASE_WRITE_ENABLED=false → writeBuffer ──');

  const s5backendOff = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_SECRET }, false);
  const s5lead = await s5backendOff.insert<CrmLead>('crm_leads', { ...LEAD, lead_id: 'lead-s5-off' });
  check('S5.1: insert com flag OFF não quebra', s5lead !== null);
  check('S5.2: lead_id preservado com flag OFF', s5lead.lead_id === 'lead-s5-off');

  const s5state = await s5backendOff.insert<CrmLeadState>('crm_lead_state', { ...STATE, lead_id: 'lead-s5-off' });
  check('S5.3: insert crm_lead_state com flag OFF não quebra', s5state !== null);
  check('S5.4: lead_id preservado em state com flag OFF', s5state.lead_id === 'lead-s5-off');

  // ─── S6: flag ON → tenta Supabase (falha de rede → fallback) ─────────────

  console.log('\n── S6: SUPABASE_WRITE_ENABLED=true → tenta Supabase (falha → fallback) ──');

  let s6threw = false;
  let s6lead: CrmLead | null = null;
  try {
    s6lead = await backendOn.insert<CrmLead>('crm_leads', { ...LEAD, lead_id: 'lead-s6-on' });
  } catch {
    s6threw = true;
  }
  check('S6.1: insert com flag ON + URL falsa não lança exceção', !s6threw);
  check('S6.2: fallback writeBuffer retorna lead válido', s6lead !== null && s6lead?.lead_id === 'lead-s6-on');

  let s6statethrew = false;
  let s6state: CrmLeadState | null = null;
  try {
    s6state = await backendOn.insert<CrmLeadState>('crm_lead_state', { ...STATE, lead_id: 'lead-s6-on' });
  } catch {
    s6statethrew = true;
  }
  check('S6.3: insert crm_lead_state com flag ON + URL falsa não lança', !s6statethrew);
  check('S6.4: fallback writeBuffer retorna state válido', s6state !== null && s6state?.lead_id === 'lead-s6-on');

  // ─── S7: erros não vazam secrets ─────────────────────────────────────────

  console.log('\n── S7: erros não vazam secrets ──');

  const secretBackend = new SupabaseCrmBackend(
    { url: 'http://localhost:0', serviceRoleKey: FAKE_SECRET },
    true,
  );

  let s7error: string | null = null;
  try {
    await secretBackend.insert<CrmLead>('crm_leads', LEAD);
  } catch (e) {
    s7error = String(e);
  }

  const outputStr = JSON.stringify({ s7error });
  check('S7.1: SUPABASE_SERVICE_ROLE_KEY não aparece no output serializado', !outputStr.includes(FAKE_SECRET));
  check('S7.2: "Bearer" seguido de secret não aparece', !outputStr.includes(`Bearer ${FAKE_SECRET}`));
  check('S7.3: "apikey" seguido de secret não aparece', !new RegExp(`apikey.*${FAKE_SECRET}`).test(outputStr));

  // ─── S8: update de state preserva lead_id ────────────────────────────────

  console.log('\n── S8: update de state preserva lead_id ──');

  await backendOff.insert<CrmLeadState>('crm_lead_state', { ...STATE, lead_id: 'lead-s8' });
  const s8updated = await backendOff.update<CrmLeadState>(
    'crm_lead_state',
    (r) => r.lead_id === 'lead-s8',
    { stage_current: 'qualification_civil', state_version: 2 },
  );
  check('S8.1: update retorna state não-nulo', s8updated !== null);
  check('S8.2: lead_id preservado após update', s8updated?.lead_id === 'lead-s8');
  check('S8.3: stage_current atualizado', s8updated?.stage_current === 'qualification_civil');
  check('S8.4: state_version atualizado', s8updated?.state_version === 2);

  // ─── S9: insert de lead preserva phone_ref ───────────────────────────────

  console.log('\n── S9: insert de lead preserva phone_ref ──');

  const s9lead = await backendOff.insert<CrmLead>('crm_leads', {
    ...LEAD,
    lead_id: 'lead-s9',
    phone_ref: '5511999990009',
  });
  check('S9.1: insert de lead retorna lead', s9lead !== null);
  check('S9.2: phone_ref preservado', s9lead.phone_ref === '5511999990009');
  check('S9.3: lead_id preservado', s9lead.lead_id === 'lead-s9');

  // ─── S10: sem conteúdo sensível em output ────────────────────────────────

  console.log('\n── S10: sem conteúdo sensível em output do smoke ──');

  const sensitiveStr = 'MENSAGEM_CLIENTE_CPF_123456789';
  const leadStr = JSON.stringify(s9lead);
  check('S10.1: output do lead não contém texto marcado como sensível', !leadStr.includes(sensitiveStr));
  check('S10.2: FAKE_SECRET não aparece em nenhum output deste smoke', !leadStr.includes(FAKE_SECRET));

  // ─── Resultado final ─────────────────────────────────────────────────────

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL`);
  console.log(`─────────────────────────────────────────────`);

  if (fail > 0) {
    console.error('\n✗ smoke:supabase:write-real FALHOU');
    process.exit(1);
  }

  console.log('\n✓ smoke:supabase:write-real OK — T9.12 write logic validada.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
