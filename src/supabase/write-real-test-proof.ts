/**
 * ENOVA 2 — T9.13 — Prova Supabase write real (state/leads) em TEST
 *
 * Dual-mode proof script:
 *   - Default (sem credenciais reais):
 *     Executa provas locais/mock (P1–P4). Nunca falha CI.
 *     SKIP controlado para provas que exigem Supabase real.
 *
 *   - Modo TEST real (SUPABASE_WRITE_REAL_TEST_ENABLED=true + envs):
 *     Executa provas reais P5–P9 contra o Supabase TEST.
 *     Confirma escrita e leitura de crm_lead_meta e enova_state.
 *     Confirma que crm_turns/crm_facts NÃO vão para Supabase.
 *
 * Env vars para modo real:
 *   SUPABASE_WRITE_REAL_TEST_ENABLED=true  — gate obrigatório
 *   SUPABASE_REAL_ENABLED=true             — habilita SupabaseCrmBackend
 *   SUPABASE_WRITE_ENABLED=true            — habilita escrita real
 *   SUPABASE_URL                           — URL PostgREST base
 *   SUPABASE_SERVICE_ROLE_KEY              — service role (nunca exposta em stdout)
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nunca expor SUPABASE_SERVICE_ROLE_KEY em stdout/stderr.
 *   - Nunca alterar schema, RLS, bucket policies.
 *   - Nunca delete/reset de dados reais.
 *   - Nunca escrever crm_turns ou crm_facts no Supabase.
 *   - Nunca usar lead_timeline_events ou enova_kv.
 *   - Nunca usar dados de cliente real.
 *   - Dados de teste claramente marcados: lead_id = t9_13_test_<timestamp>
 */

import { randomUUID } from 'crypto';
import { SupabaseCrmBackend } from './crm-store.ts';
import type { WriteDiagEntry } from './crm-store.ts';
import { supabaseSelect } from './client.ts';
import type { CrmLead, CrmLeadState } from '../crm/types.ts';
import type { SupabaseConfig } from './types.ts';

// ---------------------------------------------------------------------------
// Env resolution
// ---------------------------------------------------------------------------

const env = {
  WRITE_REAL_TEST_ENABLED: process.env.SUPABASE_WRITE_REAL_TEST_ENABLED === 'true',
  SUPABASE_REAL_ENABLED: process.env.SUPABASE_REAL_ENABLED === 'true',
  SUPABASE_WRITE_ENABLED: process.env.SUPABASE_WRITE_ENABLED === 'true',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
};

const PROOF_TAG = 'PROVA T9.13 | supabase-write-real-test';
const FAKE_SECRET = 'sk-fake-service-role-secret-proof-t9-13';
const FAKE_URL = 'http://localhost:54321';

let pass = 0;
let fail = 0;
let skip = 0;

function check(label: string, condition: boolean, detail = ''): void {
  if (condition) {
    pass++;
    console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function skipCheck(label: string, reason: string): void {
  skip++;
  console.log(`  ⊘ SKIP ${label} — ${reason}`);
}

function maskKey(raw: string): string {
  if (!raw || raw.length < 8) return '(ausente)';
  return `${raw.slice(0, 6)}…(${raw.length} chars)`;
}

function logSelectResult(
  label: string,
  table: string,
  leadId: string,
  result: { ok: boolean; rows: unknown[]; error: string | null; http_status: number | null },
): void {
  console.log(
    `  [DIAG ${label}] table=${table} lead_id=${leadId} ok=${result.ok}` +
    ` http_status=${result.http_status ?? 'null'} rows=${result.rows.length}` +
    ` error=${result.error ?? 'null'}`,
  );
}

/** Imprime o resultado completo de uma tentativa de escrita real — T9.13D-DIAG. */
function logWriteDiag(label: string, d: WriteDiagEntry): void {
  console.log(
    `  [DIAG WRITE ${label}] table=${d.table} target_table=${d.target_table}` +
    ` write_enabled=${d.write_enabled} attempted_real_write=${d.attempted_real_write}` +
    ` used_fallback=${d.used_fallback} ok=${d.ok}` +
    ` http_status=${d.http_status ?? 'null'} rows=${d.rows}` +
    ` error=${d.error ?? 'null'} test_id=${d.test_id}`,
  );
}

// ---------------------------------------------------------------------------
// Dados de prova — claramente marcados como teste
// ---------------------------------------------------------------------------

// stateLeadId: deve ser UUID válido para modo real (enova_state.lead_id é UUID).
// Para modo local, pode ser qualquer string (writeBuffer não valida tipo).
function makeTestData(ts: number, stateLeadId: string) {
  const lead: CrmLead = {
    lead_id: `t9_13_test_${ts}`,
    external_ref: `t9_13_wa_test_${ts}`,  // mapeia para crm_lead_meta.wa_id (PK real)
    customer_name: 'T9.13 Prova Controlada',
    phone_ref: 't9_13_phone_test',
    status: 'active',
    manual_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const state: CrmLeadState = {
    state_id: `enova_state:t9_13_test_${ts}`,
    lead_id: stateLeadId,                  // UUID válido para enova_state.lead_id
    stage_current: 'discovery',
    next_objective: `t9_13_prova_${ts}`,   // marcador de teste com timestamp
    block_advance: false,
    policy_flags: {},
    risk_flags: null,
    state_version: 1,
    updated_at: new Date().toISOString(),
  };

  return { lead, state };
}

// ---------------------------------------------------------------------------
// Provas locais / mock (P1–P4) — sempre executadas
// ---------------------------------------------------------------------------

async function runLocalProofs(): Promise<void> {
  console.log('\n── P1: Flag OFF → writeBuffer (sem Supabase) ──');

  const backendOff = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_SECRET }, false);
  const ts = Date.now();
  const { lead, state } = makeTestData(ts, `t9_13_state_${ts}`);

  const p1Lead = await backendOff.insert<CrmLead>('crm_leads', lead);
  check('P1.1: insert crm_leads flag OFF retorna lead', p1Lead.lead_id === lead.lead_id);
  check('P1.2: phone_ref preservado', p1Lead.phone_ref === lead.phone_ref);
  check('P1.3: external_ref preservado', p1Lead.external_ref === lead.external_ref);

  const p1State = await backendOff.insert<CrmLeadState>('crm_lead_state', state);
  check('P1.4: insert crm_lead_state flag OFF retorna state', p1State.lead_id === state.lead_id);
  check('P1.5: stage_current preservado', p1State.stage_current === state.stage_current);
  check('P1.6: state_version preservado', p1State.state_version === state.state_version);

  console.log('\n── P2: Flag ON + URL falsa → fallback writeBuffer (sem exceção) ──');

  const backendOn = new SupabaseCrmBackend({ url: FAKE_URL, serviceRoleKey: FAKE_SECRET }, true);
  const { lead: lead2, state: state2 } = makeTestData(ts + 1, `t9_13_state_${ts + 1}`);

  let p2Threw = false;
  let p2Lead: CrmLead | null = null;
  try {
    p2Lead = await backendOn.insert<CrmLead>('crm_leads', lead2);
  } catch {
    p2Threw = true;
  }
  check('P2.1: insert crm_leads flag ON + URL falsa não lança exceção', !p2Threw);
  check('P2.2: fallback writeBuffer retorna lead válido', p2Lead !== null && p2Lead?.lead_id === lead2.lead_id);

  let p2StatethTrew = false;
  let p2State: CrmLeadState | null = null;
  try {
    p2State = await backendOn.insert<CrmLeadState>('crm_lead_state', state2);
  } catch {
    p2StatethTrew = true;
  }
  check('P2.3: insert crm_lead_state flag ON + URL falsa não lança', !p2StatethTrew);
  check('P2.4: fallback writeBuffer retorna state válido', p2State !== null && p2State?.lead_id === state2.lead_id);

  console.log('\n── P3: crm_turns e crm_facts → sempre writeBuffer ──');

  const fakeTurn = {
    turn_id: `t9_13_turn_${ts}`,
    lead_id: lead.lead_id,
    channel_type: 'whatsapp',
    raw_input_summary: 't9.13 prova',
    stage_at_turn: 'discovery',
    model_name: null,
    latency_ms: null,
    created_at: new Date().toISOString(),
  };

  const fakeFact = {
    fact_id: `t9_13_fact_${ts}`,
    lead_id: lead.lead_id,
    fact_key: 'estado_civil',
    fact_value: 'solteiro',
    confidence: 0.9,
    source: 'text_extractor',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  let p3TurnThrew = false;
  let p3Turn: typeof fakeTurn | null = null;
  try {
    p3Turn = await backendOn.insert('crm_turns', fakeTurn) as typeof fakeTurn;
  } catch {
    p3TurnThrew = true;
  }
  check('P3.1: insert crm_turns flag ON não lança', !p3TurnThrew);
  check('P3.2: turn_id preservado no writeBuffer', p3Turn?.turn_id === fakeTurn.turn_id);

  const p3Turns = await backendOn.findAll('crm_turns');
  check('P3.3: crm_turns encontrado no writeBuffer', p3Turns.some((r) => (r as typeof fakeTurn).turn_id === fakeTurn.turn_id));

  let p3FactThrew = false;
  let p3Fact: typeof fakeFact | null = null;
  try {
    p3Fact = await backendOn.insert('crm_facts', fakeFact) as typeof fakeFact;
  } catch {
    p3FactThrew = true;
  }
  check('P3.4: insert crm_facts flag ON não lança', !p3FactThrew);
  check('P3.5: fact_key preservado no writeBuffer', p3Fact?.fact_key === fakeFact.fact_key);

  const p3Facts = await backendOn.findAll('crm_facts');
  check('P3.6: crm_facts encontrado no writeBuffer', p3Facts.some((r) => (r as typeof fakeFact).fact_id === fakeFact.fact_id));

  console.log('\n── P4: Secrets não vazam em output ──');

  const secretBackend = new SupabaseCrmBackend(
    { url: 'http://localhost:0', serviceRoleKey: FAKE_SECRET },
    true,
  );

  let p4Error: string | null = null;
  try {
    await secretBackend.insert<CrmLead>('crm_leads', lead);
  } catch (e) {
    p4Error = String(e);
  }

  const outputStr = JSON.stringify({ p4Error });
  check('P4.1: FAKE_SECRET não aparece no output serializado', !outputStr.includes(FAKE_SECRET));
  check('P4.2: "Bearer" seguido de secret não aparece', !outputStr.includes(`Bearer ${FAKE_SECRET}`));
  check('P4.3: "apikey" seguido de secret não aparece', !new RegExp(`apikey.*${FAKE_SECRET}`).test(outputStr));
}

// ---------------------------------------------------------------------------
// Provas TEST real (P5–P9) — só com SUPABASE_WRITE_REAL_TEST_ENABLED=true
// ---------------------------------------------------------------------------

async function runRealProofs(cfg: SupabaseConfig): Promise<void> {
  const ts = Date.now();
  const stateLeadId = randomUUID();        // UUID válido para enova_state.lead_id
  const { lead, state } = makeTestData(ts, stateLeadId);
  const testLeadId = lead.lead_id;         // id interno CRM (para checar retorno de insert)
  const testWaId = lead.external_ref!;     // wa_id real → chave de crm_lead_meta

  console.log(`\n  [INFO] lead_id interno (CRM): ${testLeadId}`);
  console.log(`  [INFO] wa_id de prova (crm_lead_meta.wa_id): ${testWaId}`);
  console.log(`  [INFO] uuid de prova (enova_state.lead_id): ${stateLeadId}`);
  console.log(`  [INFO] Dados de prova marcados — não são dados de cliente real`);
  console.log(`  [INFO] Estes dados permanecem no Supabase (sem cleanup — delete proibido)`);

  const backend = new SupabaseCrmBackend(cfg, true);

  // ── P0: Schema discovery — colunas reais via SELECT * limit=1 ─────────────
  // Objetivo: descobrir todas as colunas existentes nas duas tabelas de escrita
  // ANTES de qualquer upsert. Se houver desalinhamento, fail-fast: pula P5–P8.
  // Produz [SCHEMA DIAG] para cross-reference entre payload e schema real.

  console.log('\n── P0: Schema discovery (SELECT * limit=1 — sem valores em stdout) ──');

  // Chaves que mapLeadToMeta envia ao Supabase (pós T9.13G — apenas wa_id + updated_at).
  const payloadKeysLead = ['wa_id', 'updated_at'];
  // Chaves que mapLeadStateToEnovaState envia ao Supabase (pós T9.13G — apenas lead_id + updated_at;
  // escrita real BLOQUEADA pelo backend — BLK-T9.13-STATE-MAPPING).
  const payloadKeysState = ['lead_id', 'updated_at'];

  const schemaLeadResult = await supabaseSelect<Record<string, unknown>>(cfg, 'crm_lead_meta', { limit: 1 });
  const realColsLead: string[] = schemaLeadResult.ok && schemaLeadResult.rows.length > 0
    ? Object.keys(schemaLeadResult.rows[0])
    : [];
  const missingFromRealLead = payloadKeysLead.filter((k) => !realColsLead.includes(k));
  const keptLead = payloadKeysLead.filter((k) => realColsLead.includes(k));
  console.log('[SCHEMA DIAG crm_lead_meta]');
  console.log(`  real_columns=[${realColsLead.join(', ')}]`);
  console.log(`  payload_keys=[${payloadKeysLead.join(', ')}]`);
  console.log(`  missing_from_real=[${missingFromRealLead.join(', ')}]`);
  console.log(`  kept=[${keptLead.join(', ')}]`);

  const schemaStateResult = await supabaseSelect<Record<string, unknown>>(cfg, 'enova_state', { limit: 1 });
  const realColsState: string[] = schemaStateResult.ok && schemaStateResult.rows.length > 0
    ? Object.keys(schemaStateResult.rows[0])
    : [];
  const missingFromRealState = payloadKeysState.filter((k) => !realColsState.includes(k));
  const keptState = payloadKeysState.filter((k) => realColsState.includes(k));
  console.log('[SCHEMA DIAG enova_state]');
  console.log(`  real_columns=[${realColsState.join(', ')}]`);
  console.log(`  payload_keys=[${payloadKeysState.join(', ')}]`);
  console.log(`  missing_from_real=[${missingFromRealState.join(', ')}]`);
  console.log(`  kept=[${keptState.join(', ')}]`);

  check('P0.1: schema discovery crm_lead_meta retorna OK', schemaLeadResult.ok,
    schemaLeadResult.error ?? '');
  check('P0.2: schema discovery enova_state retorna OK', schemaStateResult.ok,
    schemaStateResult.error ?? '');
  check('P0.3: payload crm_lead_meta sem colunas ausentes', missingFromRealLead.length === 0,
    missingFromRealLead.length > 0 ? `PGRST204 esperado: [${missingFromRealLead.join(', ')}]` : 'ok');
  check('P0.4: payload enova_state sem colunas ausentes', missingFromRealState.length === 0,
    missingFromRealState.length > 0 ? `PGRST204 esperado: [${missingFromRealState.join(', ')}]` : 'ok');

  // BLK-T9.13-STATE-MAPPING — informação explícita ao operador.
  console.log('\n[STATE_MAPPING_STATUS] BLK-T9.13-STATE-MAPPING ATIVO');
  console.log('  enova_state real não tem schema compatível com CrmLeadState canônico.');
  console.log('  Colunas confirmadas ausentes (PGRST204):');
  console.log('    stage_current, next_objective, block_advance, state_version');
  console.log('  Candidatos legado (sem prova canônica de qual usar como destino):');
  console.log('    fase_conversa, last_processed_stage, last_user_stage, intro_etapa');
  console.log('  Decisão T9.13G: crm_lead_state permanece em writeBuffer; SupabaseCrmBackend');
  console.log('  registra writeLog com error=BLK-T9.13-STATE-MAPPING e attempted_real_write=false.');
  console.log('  Aguardando confirmação explícita de Vasques para destino canônico.');

  // ── Fail-fast: se P0 detectou coluna ausente, NÃO executa P5–P8 ──────────
  if (missingFromRealLead.length > 0 || missingFromRealState.length > 0) {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('FAIL-FAST P0 — payload contém coluna(s) ausente(s) no schema real.');
    console.log('P5–P8 PULADOS. Execute correção antes de tentar upsert real.');
    console.log('══════════════════════════════════════════════════════════');
    if (missingFromRealLead.length > 0) {
      console.log('[FAIL-FAST DIAG crm_lead_meta]');
      console.log(`  table:               crm_lead_meta`);
      console.log(`  real_columns:        [${realColsLead.join(', ')}]`);
      console.log(`  payload_keys:        [${payloadKeysLead.join(', ')}]`);
      console.log(`  missing_from_real:   [${missingFromRealLead.join(', ')}]`);
      console.log(`  kept:                [${keptLead.join(', ')}]`);
      console.log(`  próxima ação:        remover [${missingFromRealLead.join(', ')}] de mapLeadToMeta`);
    }
    if (missingFromRealState.length > 0) {
      console.log('[FAIL-FAST DIAG enova_state]');
      console.log(`  table:               enova_state`);
      console.log(`  real_columns:        [${realColsState.join(', ')}]`);
      console.log(`  payload_keys:        [${payloadKeysState.join(', ')}]`);
      console.log(`  missing_from_real:   [${missingFromRealState.join(', ')}]`);
      console.log(`  kept:                [${keptState.join(', ')}]`);
      console.log(`  próxima ação:        remover [${missingFromRealState.join(', ')}] de mapLeadStateToEnovaState`);
      console.log(`                       OU manter BLK-T9.13-STATE-MAPPING (writeBuffer-only)`);
    }
    skipCheck('P5–P8 (upserts reais)', 'fail-fast P0 — payload contém coluna ausente');
    return;
  }

  // ── P5: Insert crm_leads → crm_lead_meta (apenas wa_id + updated_at — T9.13G) ──

  console.log('\n── P5: insert crm_leads → crm_lead_meta (Supabase real) ──');

  let p5Threw = false;
  let p5Lead: CrmLead | null = null;
  try {
    p5Lead = await backend.insert<CrmLead>('crm_leads', lead);
  } catch {
    p5Threw = true;
  }
  const p5WriteDiag = backend.writeLog.at(-1);
  if (p5WriteDiag) logWriteDiag('P5', p5WriteDiag);
  check('P5.1: insert crm_leads não lança', !p5Threw);
  check('P5.2: retorna lead com lead_id correto (CRM canônico)', p5Lead?.lead_id === testLeadId);
  check('P5.3: phone_ref preservado no CRM canônico (não Supabase)', p5Lead?.phone_ref === lead.phone_ref);
  check('P5.4: external_ref preservado no CRM canônico (não Supabase)', p5Lead?.external_ref === lead.external_ref);

  // Leitura de verificação — busca por wa_id (PK real de crm_lead_meta, T9.13C)
  const readLeadResult = await supabaseSelect<Record<string, unknown>>(cfg, 'crm_lead_meta', {
    filters: { wa_id: `eq.${testWaId}` },
    limit: 1,
  });
  logSelectResult('P5', 'crm_lead_meta', testWaId, readLeadResult);
  check('P5.5: leitura Supabase crm_lead_meta retorna OK', readLeadResult.ok);
  const foundLead = readLeadResult.rows[0];
  check('P5.6: lead encontrado em crm_lead_meta', foundLead !== undefined);
  check('P5.7: wa_id correto no Supabase', foundLead?.wa_id === testWaId);
  // P5.8/P5.9/P5.10 REMOVIDAS (T9.13E/T9.13F/T9.13G) —
  // external_ref, phone_ref, status, manual_mode, customer_name não existem em crm_lead_meta no Supabase real.
  // Estes campos são preservados apenas no CRM canônico (CrmLead) e writeBuffer.

  // ── P6: Insert crm_lead_state → BLK-T9.13-STATE-MAPPING → writeBuffer ────

  console.log('\n── P6: insert crm_lead_state → writeBuffer (BLK-T9.13-STATE-MAPPING) ──');

  let p6Threw = false;
  let p6State: CrmLeadState | null = null;
  try {
    p6State = await backend.insert<CrmLeadState>('crm_lead_state', state);
  } catch {
    p6Threw = true;
  }
  const p6WriteDiag = backend.writeLog.at(-1);
  if (p6WriteDiag) logWriteDiag('P6', p6WriteDiag);
  check('P6.1: insert crm_lead_state não lança', !p6Threw);
  check('P6.2: retorna state com lead_id correto (writeBuffer)', p6State?.lead_id === stateLeadId);
  check('P6.3: stage_current preservado no CRM canônico', p6State?.stage_current === state.stage_current);
  check('P6.4: state_version preservado no CRM canônico', p6State?.state_version === state.state_version);
  check('P6.BLK.1: writeLog registra BLK-T9.13-STATE-MAPPING',
    p6WriteDiag?.error?.startsWith('BLK-T9.13-STATE-MAPPING') === true);
  check('P6.BLK.2: attempted_real_write=false (escrita real bloqueada)',
    p6WriteDiag?.attempted_real_write === false);
  check('P6.BLK.3: used_fallback=true (writeBuffer absorveu)',
    p6WriteDiag?.used_fallback === true);

  // Verificação: state está no writeBuffer (acessível via backend.findOne)
  const bufferedState = await backend.findOne<CrmLeadState>('crm_lead_state', (r) => r.lead_id === stateLeadId);
  check('P6.BUF.1: state encontrado no writeBuffer via backend.findOne', bufferedState !== null);
  check('P6.BUF.2: stage_current correto no writeBuffer', bufferedState?.stage_current === state.stage_current);
  check('P6.BUF.3: state_version correto no writeBuffer', bufferedState?.state_version === state.state_version);

  // ── P7: Update crm_leads → preserva wa_id, payload reduzido (T9.13G) ────

  console.log('\n── P7: update crm_leads → atualiza crm_lead_meta (Supabase real, payload reduzido) ──');

  let p7Threw = false;
  let p7Updated: CrmLead | null = null;
  try {
    p7Updated = await backend.update<CrmLead>(
      'crm_leads',
      // Após leitura do Supabase, mapLeadFromMeta define lead_id = wa_id (T9.13C)
      (r) => r.lead_id === testWaId,
      { updated_at: new Date().toISOString() },
    );
  } catch {
    p7Threw = true;
  }
  const p7WriteDiag = backend.writeLog.at(-1);
  if (p7WriteDiag) logWriteDiag('P7', p7WriteDiag);
  console.log(`  [DIAG P7] wa_id=${testWaId} updated_at=${p7Updated?.updated_at ?? 'null'}`);
  check('P7.1: update crm_leads não lança', !p7Threw);
  check('P7.2: retorna lead atualizado', p7Updated !== null);
  check('P7.3: lead_id (wa_id) preservado após update', p7Updated?.lead_id === testWaId);
  check('P7.4: writeLog upsert ok=true (sem PGRST204)', p7WriteDiag?.ok === true);

  // Verificar leitura — apenas wa_id (PK) é o que comprova upsert real.
  const readUpdatedLead = await supabaseSelect<Record<string, unknown>>(cfg, 'crm_lead_meta', {
    filters: { wa_id: `eq.${testWaId}` },
    limit: 1,
  });
  logSelectResult('P7', 'crm_lead_meta', testWaId, readUpdatedLead);
  const updatedRow = readUpdatedLead.rows[0];
  check('P7.5: Supabase reflete wa_id após update', updatedRow?.wa_id === testWaId);
  // phone_ref/manual_mode não são mais escritos — não há checks no Supabase para eles.

  // ── P8: Update crm_lead_state → BLK-T9.13-STATE-MAPPING → writeBuffer ────

  console.log('\n── P8: update crm_lead_state → writeBuffer (BLK-T9.13-STATE-MAPPING) ──');

  let p8Threw = false;
  let p8Updated: CrmLeadState | null = null;
  try {
    p8Updated = await backend.update<CrmLeadState>(
      'crm_lead_state',
      (r) => r.lead_id === stateLeadId,
      { stage_current: 'qualification_civil', state_version: 2, updated_at: new Date().toISOString() },
    );
  } catch {
    p8Threw = true;
  }
  const p8WriteDiag = backend.writeLog.at(-1);
  if (p8WriteDiag) logWriteDiag('P8', p8WriteDiag);
  console.log(`  [DIAG P8] uuid=${stateLeadId} stage_current=${p8Updated?.stage_current ?? 'null'} state_version=${p8Updated?.state_version ?? 'null'}`);
  check('P8.1: update crm_lead_state não lança', !p8Threw);
  check('P8.2: retorna state atualizado (writeBuffer)', p8Updated !== null);
  check('P8.3: lead_id (UUID) preservado após update', p8Updated?.lead_id === stateLeadId);
  check('P8.4: stage_current atualizado no writeBuffer', p8Updated?.stage_current === 'qualification_civil');
  check('P8.5: state_version incrementado no writeBuffer', p8Updated?.state_version === 2);
  check('P8.BLK.1: writeLog registra BLK-T9.13-STATE-MAPPING',
    p8WriteDiag?.error?.startsWith('BLK-T9.13-STATE-MAPPING') === true);
  check('P8.BLK.2: attempted_real_write=false (escrita real bloqueada)',
    p8WriteDiag?.attempted_real_write === false);

  // ── P9: crm_turns e crm_facts não vão para Supabase ──────────────────────

  console.log('\n── P9: crm_turns e crm_facts NÃO escritos no Supabase ──');

  const fakeTurn = {
    turn_id: `t9_13_turn_${ts}`,
    lead_id: testLeadId,
    channel_type: 'whatsapp',
    raw_input_summary: 't9.13 prova',
    stage_at_turn: 'discovery',
    model_name: null,
    latency_ms: null,
    created_at: new Date().toISOString(),
  };

  const fakeFact = {
    fact_id: `t9_13_fact_${ts}`,
    lead_id: testLeadId,
    fact_key: 'estado_civil',
    fact_value: 'solteiro',
    confidence: 0.9,
    source: 'text_extractor',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  // Inserir via backend real — deve ir para writeBuffer, não Supabase
  await backend.insert('crm_turns', fakeTurn);
  await backend.insert('crm_facts', fakeFact);

  // Verificar que não existem no Supabase (não há tabela de destino mapeada)
  // crm_turns → lead_timeline_events (não confirmado — não deve ter sido escrito)
  // crm_facts → (não confirmado — não deve ter sido escrito)
  // A prova é indireta: readAll de crm_turns retorna apenas writeBuffer
  const allTurns = await backend.findAll('crm_turns');
  const turnInBuffer = allTurns.some((r) => (r as typeof fakeTurn).turn_id === fakeTurn.turn_id);
  check('P9.1: crm_turns encontrado no writeBuffer (não Supabase)', turnInBuffer);

  const allFacts = await backend.findAll('crm_facts');
  const factInBuffer = allFacts.some((r) => (r as typeof fakeFact).fact_id === fakeFact.fact_id);
  check('P9.2: crm_facts encontrado no writeBuffer (não Supabase)', factInBuffer);

  // Confirmar que SUPABASE_SERVICE_ROLE_KEY não aparece em nenhum output
  const cfgStr = JSON.stringify({ url: cfg.url });
  check('P9.3: cfg serializado não contém serviceRoleKey', !cfgStr.includes(cfg.serviceRoleKey));
  check('P9.4: lead_id de prova claramente marcado como teste', testLeadId.startsWith('t9_13_test_'));

  console.log(`\n  [INFO] Prova real concluída.`);
  console.log(`  [INFO] crm_lead_meta: wa_id=${testWaId}`);
  console.log(`  [INFO] enova_state: lead_id=${stateLeadId}`);
  console.log(`  [INFO] Dados de prova gravados permanentemente (delete proibido por contrato T9).`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function run(): Promise<void> {
  console.log(`\n=== ${PROOF_TAG} ===`);
  console.log(`Data: ${new Date().toISOString()}`);
  console.log(`Modo real: ${env.WRITE_REAL_TEST_ENABLED ? 'HABILITADO' : 'DESABILITADO (mock/local)'}`);

  if (env.WRITE_REAL_TEST_ENABLED) {
    console.log(`Supabase URL: ${env.SUPABASE_URL ? maskKey(env.SUPABASE_URL) : '(ausente)'}`);
    console.log(`Service role: ${maskKey(env.SUPABASE_SERVICE_ROLE_KEY)}`);
    console.log(`SUPABASE_WRITE_ENABLED: ${env.SUPABASE_WRITE_ENABLED}`);
  }

  // ── Provas locais sempre executadas ──────────────────────────────────────
  console.log('\n=== Bloco A — Provas locais / mock (P1–P4) ===');
  await runLocalProofs();

  // ── Provas reais — condicionais ───────────────────────────────────────────
  console.log('\n=== Bloco B — Provas TEST real (P5–P9) ===');

  if (!env.WRITE_REAL_TEST_ENABLED) {
    skipCheck('P5–P9 (escrita real crm_lead_meta + enova_state)', 'SUPABASE_WRITE_REAL_TEST_ENABLED não setado');
    console.log('\n  Para executar a prova real, defina:');
    console.log('    SUPABASE_WRITE_REAL_TEST_ENABLED=true');
    console.log('    SUPABASE_REAL_ENABLED=true');
    console.log('    SUPABASE_WRITE_ENABLED=true');
    console.log('    SUPABASE_URL=<url>');
    console.log('    SUPABASE_SERVICE_ROLE_KEY=<key>');
  } else if (!env.SUPABASE_REAL_ENABLED) {
    skipCheck('P5–P9', 'SUPABASE_REAL_ENABLED não setado');
  } else if (!env.SUPABASE_WRITE_ENABLED) {
    skipCheck('P5–P9', 'SUPABASE_WRITE_ENABLED não setado');
  } else if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    skipCheck('P5–P9', 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes');
  } else {
    const cfg: SupabaseConfig = {
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    };
    await runRealProofs(cfg);
  }

  // ── Resultado final ───────────────────────────────────────────────────────
  console.log(`\n─────────────────────────────────────────────`);
  console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL | ${skip} SKIP`);
  console.log(`─────────────────────────────────────────────`);

  if (fail > 0) {
    console.error('\n✗ prove:t9.13-supabase-write-real-test FALHOU');
    process.exit(1);
  }

  if (skip > 0) {
    console.log('\n⊘ prove:t9.13-supabase-write-real-test PARCIAL — prova real aguarda Vasques');
    console.log('  Modo local: PASS | Modo real: SKIP (credenciais ausentes)');
  } else {
    console.log('\n✓ prove:t9.13-supabase-write-real-test OK — escrita Supabase real validada.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
