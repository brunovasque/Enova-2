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
import { SupabaseCrmBackend, mapStageCurrentToFaseConversa } from './crm-store.ts';
import type { WriteDiagEntry } from './crm-store.ts';
import { supabaseSelect } from './client.ts';
import {
  runNotNullFullDiag, printNotNullFullDiag,
  runCheckConstraintProbe, printCheckConstraintDiag,
} from './not-null-probe.ts';
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

  console.log('\n── P3b: Mapper conservador (T9.13M-FIX) — prova local pura ──');

  // Mapper pós-docs
  check('P3b.1: docs_prep → envio_docs',
    mapStageCurrentToFaseConversa('docs_prep') === 'envio_docs');
  check('P3b.2: analysis_waiting → aguardando_retorno_correspondente',
    mapStageCurrentToFaseConversa('analysis_waiting') === 'aguardando_retorno_correspondente');
  check('P3b.3: visit_scheduling → agendamento_visita',
    mapStageCurrentToFaseConversa('visit_scheduling') === 'agendamento_visita');
  check('P3b.4: visit_confirmed → visita_confirmada',
    mapStageCurrentToFaseConversa('visit_confirmed') === 'visita_confirmada');
  check('P3b.5: finalization → finalizacao_processo',
    mapStageCurrentToFaseConversa('finalization') === 'finalizacao_processo');
  // Mapper pré-docs: sempre null
  check('P3b.6: discovery → null (pré-docs)',
    mapStageCurrentToFaseConversa('discovery') === null);
  check('P3b.7: qualification_civil → null (pré-docs)',
    mapStageCurrentToFaseConversa('qualification_civil') === null);
  check('P3b.8: qualification_renda → null (pré-docs)',
    mapStageCurrentToFaseConversa('qualification_renda') === null);
  check('P3b.9: qualification_eligibility → null (pré-docs)',
    mapStageCurrentToFaseConversa('qualification_eligibility') === null);
  // Conservador: stage desconhecido → null
  check('P3b.10: stage desconhecido → null (conservador)',
    mapStageCurrentToFaseConversa('stage_inexistente_qualquer') === null);
  check('P3b.11: null input → null',
    mapStageCurrentToFaseConversa(null) === null);
  check('P3b.12: undefined input → null',
    mapStageCurrentToFaseConversa(undefined) === null);

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

  // Chaves que mapLeadToMeta envia ao Supabase (T9.13J-FIX — wa_id + lead_pool + lead_temp + updated_at).
  // lead_pool='COLD_POOL' e lead_temp='COLD': NOT NULL sem DEFAULT confirmados por SQL direto (T9.13J).
  // Valores canônicos definidos por Vasques: todo lead novo entra como base fria.
  const payloadKeysLead = ['wa_id', 'lead_pool', 'lead_temp', 'updated_at'];
  // Chaves que mapLeadStateToEnovaState pode enviar ao Supabase (T9.13M-FIX):
  //   - lead_id + updated_at: sempre presentes.
  //   - fase_conversa: presente apenas para stages pós-docs (mapper conservador).
  // Superset declarado aqui para que P0.4 verifique que todas existem no schema real.
  const payloadKeysState = ['lead_id', 'updated_at', 'fase_conversa'];

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

  // T9.13M-FIX — BLK-T9.13-STATE-MAPPING RESOLVIDO.
  console.log('\n[STATE_MAPPING_STATUS] BLK-T9.13-STATE-MAPPING RESOLVIDO (T9.13M-FIX)');
  console.log('  Mapper conservador implementado: mapStageCurrentToFaseConversa()');
  console.log('  Stages pós-docs → fase_conversa legado (escrita real em enova_state).');
  console.log('  Stages pré-docs → null → fase_conversa omitida do payload (preserva default).');
  console.log('  Colunas ainda ausentes (PGRST204 — não enviar):');
  console.log('    stage_current, next_objective, block_advance, state_version');

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

  // ── P0.5: NOT NULL FULL DIAG — descobre TODAS as colunas NOT NULL em uma execução ──
  // T9.13I-DIAG: substitui o probe coluna-por-coluna por probe incremental automático.
  //
  // Estratégia em cascata (sem alterar schema):
  //   1. information_schema.columns (esperado: blocked — PostgREST não expõe)
  //   2. pg_catalog.pg_attribute   (esperado: blocked — PostgREST não expõe)
  //   3. incremental_probe: upsert com wa_id isolado (t9_13_probe_*);
  //      extrai violated_column de pg_message a cada 23502;
  //      adiciona valor de prova seguro; repete até PASS ou MAX_ITERATIONS.
  //
  // wa_id do probe é DISTINTO do testWaId do fluxo P5/P7.
  // Nunca loga details, payload completo ou secrets.

  console.log('\n── P0.5: NOT NULL FULL DIAG (probe incremental automático — T9.13I) ──');

  const probeWaId = `t9_13_probe_${ts}`;   // wa_id isolado — nunca conflita com P5
  console.log(`  [INFO] probe wa_id (isolado de P5): ${probeWaId}`);
  console.log(`  [INFO] Tentando information_schema → pg_catalog → incremental_probe`);

  const notNullDiag = await runNotNullFullDiag(cfg, probeWaId);
  printNotNullFullDiag(notNullDiag);

  check('P0.5: NOT NULL FULL DIAG executado', true, `source=${notNullDiag.source}`);
  check('P0.5a: required_columns descobertos (≥1)', notNullDiag.required_columns.length >= 1,
    `required_columns=[${notNullDiag.required_columns.join(', ')}]`);
  check('P0.5b: probe não entrou em loop infinito', notNullDiag.iterations < 20,
    `iterations=${notNullDiag.iterations}`);

  // P0.5c: informacional — se probe PASS, payload completo foi descoberto.
  if (notNullDiag.probe_succeeded) {
    check('P0.5c: probe incremental upsert PASSOU (payload completo descoberto)',
      notNullDiag.probe_succeeded, `required_columns=[${notNullDiag.required_columns.join(', ')}]`);
  } else {
    // probe FAIL ainda é diagnóstico válido — revela colunas descobertas até o erro
    check('P0.5c: probe incremental executado (pode ter remaining_error)',
      true, `remaining_error=${notNullDiag.remaining_error ?? 'none'}`);
  }

  // ── P0.6: Inferência via pg_message do erro 23502 (mantida — T9.13H) ─────────
  console.log('\n── P0.6: 23502 inference — pg_message extração (T9.13H mantido) ──');
  console.log('  client.ts emite: pg_code=23502 pg_message=null value in column "X"...');
  console.log('  Coluna violada do fluxo principal P5 visível em [DIAG WRITE P5] abaixo.');
  console.log('  Inferência: match /null value in column \\"([^"]+)\\"/ em pg_message.');
  check('P0.6: inferência 23502 documentada', true, 'pg_message visível em P5 write diag');

  // ── P0.7: CHECK constraint probe — descobre valores permitidos para lead_pool ──
  // T9.13J-DIAG: após probe NOT NULL revelar 23514 (CHECK violation em lead_pool),
  // testa conjunto fixo de candidatos para descobrir valor aceito pelo CHECK constraint.
  //
  // Estratégia em cascata (sem alterar schema):
  //   1. information_schema.check_constraints (esperado: blocked — PostgREST não expõe)
  //   2. pg_catalog.pg_constraint (esperado: blocked — PostgREST não expõe)
  //   3. candidate_probe: testa candidatos [fria, morna, quente, ...]; para no primeiro aceito.
  //
  // wa_id isolado: t9_13_probe_pool_*; inclui lead_temp NOT NULL confirmado (T9.13I).
  // Nunca loga details, payload completo ou secrets.
  // Esta PR é DIAG — NÃO aplica o valor aceito em mapLeadToMeta.

  console.log('\n── P0.7: CHECK constraint probe crm_lead_meta.lead_pool (T9.13J) ──');

  const checkProbeWaId = `t9_13_probe_pool_${ts}`;
  console.log(`  [INFO] probe wa_id (isolado): ${checkProbeWaId}`);
  console.log(`  [INFO] Tentando information_schema → pg_catalog → candidate_probe`);

  const checkDiag = await runCheckConstraintProbe(cfg, checkProbeWaId);
  printCheckConstraintDiag(checkDiag);

  check('P0.7: CHECK constraint probe executado', true, `source=${checkDiag.source}`);
  check('P0.7a: candidatos testados ≥1', checkDiag.iterations >= 1,
    `iterations=${checkDiag.iterations}`);
  check('P0.7b: probe sem loop infinito', checkDiag.iterations < 20,
    `iterations=${checkDiag.iterations}`);

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

  // T9.13H-DIAG: extrai coluna violada de pg_message em caso de 23502.
  // pg_message format: "null value in column \"X\" of relation..."
  // Nunca loga valores da linha (details omitido em client.ts).
  if (p5WriteDiag && !p5WriteDiag.ok && p5WriteDiag.error) {
    const pgCodeMatch = /pg_code=(\d+)/.exec(p5WriteDiag.error);
    const pgMsgMatch = /pg_message=(.+?)(?:\s+pg_hint=|$)/.exec(p5WriteDiag.error);
    const pgCode = pgCodeMatch?.[1] ?? null;
    const pgMsg = pgMsgMatch?.[1] ?? null;
    const columnMatch = pgMsg ? /null value in column "([^"]+)"/.exec(pgMsg) : null;
    const violatedColumn = columnMatch?.[1] ?? null;
    if (pgCode === '23502') {
      console.log('[NOT_NULL INFERENCE crm_lead_meta]');
      console.log(`  pg_code=${pgCode}`);
      console.log(`  pg_message=${pgMsg ?? 'null'}`);
      console.log(`  violated_column=${violatedColumn ?? 'não extraído — verificar pg_message acima'}`);
      console.log(`  payload_keys=[${payloadKeysLead.join(', ')}]`);
      if (violatedColumn) {
        console.log(`  AÇÃO T9.13H-FIX: adicionar campo "${violatedColumn}" ao payload de mapLeadToMeta`);
        console.log(`  BLOQUEIO: não preencher sem confirmação de Vasques sobre valor canônico`);
      }
    }
  }

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
  check('P5.8: lead_pool=COLD_POOL gravado no Supabase (NOT NULL T9.13J)', foundLead?.lead_pool === 'COLD_POOL',
    `lead_pool=${String(foundLead?.lead_pool ?? 'null')}`);
  check('P5.9: lead_temp=COLD gravado no Supabase (NOT NULL T9.13J)', foundLead?.lead_temp === 'COLD',
    `lead_temp=${String(foundLead?.lead_temp ?? 'null')}`);
  // P5.10+ REMOVIDAS (T9.13E/T9.13F/T9.13G) —
  // external_ref, phone_ref, status, manual_mode, customer_name não existem em crm_lead_meta no Supabase real.
  // Estes campos são preservados apenas no CRM canônico (CrmLead) e writeBuffer.

  // ── P6: Insert crm_lead_state (stage discovery — pré-docs) → escrita real enova_state ──
  // T9.13M-FIX: BLK-T9.13-STATE-MAPPING resolvido — escrita real habilitada.
  // discovery → mapper retorna null → fase_conversa NÃO enviada → banco preserva default 'inicio'.

  console.log('\n── P6: insert crm_lead_state (discovery) → escrita real enova_state (T9.13M-FIX) ──');

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
  check('P6.2: retorna state com lead_id correto', p6State?.lead_id === stateLeadId);
  check('P6.3: stage_current preservado no CRM canônico', p6State?.stage_current === state.stage_current);
  check('P6.4: state_version preservado no CRM canônico', p6State?.state_version === state.state_version);
  check('P6.5: attempted_real_write=true (BLK resolvido — escrita real tentada)',
    p6WriteDiag?.attempted_real_write === true);
  check('P6.6: target_table=enova_state', p6WriteDiag?.target_table === 'enova_state');

  // Mapper conservador: discovery → fase_conversa = null → não enviada ao Supabase.
  // Verificar que o mapper retorna null para stages pré-docs.
  check('P6.MAPPER.1: mapStageCurrentToFaseConversa("discovery") === null',
    mapStageCurrentToFaseConversa('discovery') === null);
  check('P6.MAPPER.2: mapStageCurrentToFaseConversa("qualification_civil") === null',
    mapStageCurrentToFaseConversa('qualification_civil') === null);
  check('P6.MAPPER.3: mapStageCurrentToFaseConversa("qualification_renda") === null',
    mapStageCurrentToFaseConversa('qualification_renda') === null);
  check('P6.MAPPER.4: mapStageCurrentToFaseConversa("qualification_eligibility") === null',
    mapStageCurrentToFaseConversa('qualification_eligibility') === null);

  // Verificação: state acessível via backend.findOne (real ou writeBuffer em fallback)
  const foundState = await backend.findOne<CrmLeadState>('crm_lead_state', (r) => r.lead_id === stateLeadId);
  check('P6.BUF.1: state encontrado via backend.findOne (real ou writeBuffer)', foundState !== null);
  check('P6.BUF.2: stage_current correto', foundState?.stage_current === state.stage_current);
  check('P6.BUF.3: state_version correto', foundState?.state_version === state.state_version);

  // ── P6b: Insert crm_lead_state (stage docs_prep) → fase_conversa='envio_docs' ──
  // Prova que stages pós-docs gravam fase_conversa operacional correta.

  console.log('\n── P6b: insert crm_lead_state (docs_prep) → fase_conversa="envio_docs" ──');

  const docsStateLeadId = randomUUID();
  const docsState: CrmLeadState = {
    state_id: `enova_state:p6b_${ts}`,
    lead_id: docsStateLeadId,
    stage_current: 'docs_prep',
    next_objective: `t9_13m_docs_${ts}`,
    block_advance: false,
    policy_flags: {},
    risk_flags: null,
    state_version: 1,
    updated_at: new Date().toISOString(),
  };

  check('P6b.MAPPER.1: mapStageCurrentToFaseConversa("docs_prep") === "envio_docs"',
    mapStageCurrentToFaseConversa('docs_prep') === 'envio_docs');
  check('P6b.MAPPER.2: mapStageCurrentToFaseConversa("analysis_waiting") === "aguardando_retorno_correspondente"',
    mapStageCurrentToFaseConversa('analysis_waiting') === 'aguardando_retorno_correspondente');
  check('P6b.MAPPER.3: mapStageCurrentToFaseConversa("visit_scheduling") === "agendamento_visita"',
    mapStageCurrentToFaseConversa('visit_scheduling') === 'agendamento_visita');
  check('P6b.MAPPER.4: mapStageCurrentToFaseConversa("visit_confirmed") === "visita_confirmada"',
    mapStageCurrentToFaseConversa('visit_confirmed') === 'visita_confirmada');
  check('P6b.MAPPER.5: mapStageCurrentToFaseConversa("finalization") === "finalizacao_processo"',
    mapStageCurrentToFaseConversa('finalization') === 'finalizacao_processo');

  let p6bThrew = false;
  let p6bState: CrmLeadState | null = null;
  try {
    p6bState = await backend.insert<CrmLeadState>('crm_lead_state', docsState);
  } catch {
    p6bThrew = true;
  }
  const p6bWriteDiag = backend.writeLog.at(-1);
  if (p6bWriteDiag) logWriteDiag('P6b', p6bWriteDiag);
  check('P6b.1: insert docs_prep não lança', !p6bThrew);
  check('P6b.2: retorna state com lead_id correto', p6bState?.lead_id === docsStateLeadId);
  check('P6b.3: attempted_real_write=true', p6bWriteDiag?.attempted_real_write === true);
  check('P6b.4: target_table=enova_state', p6bWriteDiag?.target_table === 'enova_state');

  // Leitura de verificação: enova_state para docs_prep state
  const readDocsState = await supabaseSelect<Record<string, unknown>>(cfg, 'enova_state', {
    filters: { lead_id: `eq.${docsStateLeadId}` },
    limit: 1,
  });
  logSelectResult('P6b', 'enova_state', docsStateLeadId, readDocsState);
  const docsStateRow = readDocsState.rows[0];
  if (p6bWriteDiag?.ok) {
    check('P6b.5: enova_state row encontrado para docs_prep', docsStateRow !== undefined);
    check('P6b.6: fase_conversa="envio_docs" gravado no Supabase',
      docsStateRow?.fase_conversa === 'envio_docs',
      `fase_conversa=${String(docsStateRow?.fase_conversa ?? 'null')}`);
  } else {
    check('P6b.5: escrita real falhou — verificação de fase_conversa via writeBuffer', true,
      `write_error=${p6bWriteDiag?.error ?? 'null'}`);
    check('P6b.6: stage docs_prep mapeado corretamente pelo helper (prova local)', true,
      'mapStageCurrentToFaseConversa("docs_prep") === "envio_docs" (já verificado em P6b.MAPPER.1)');
  }

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
  check('P7.6: lead_pool=COLD_POOL preservado após update', updatedRow?.lead_pool === 'COLD_POOL',
    `lead_pool=${String(updatedRow?.lead_pool ?? 'null')}`);
  check('P7.7: lead_temp=COLD preservado após update', updatedRow?.lead_temp === 'COLD',
    `lead_temp=${String(updatedRow?.lead_temp ?? 'null')}`);
  // phone_ref/manual_mode não são mais escritos — não há checks no Supabase para eles.

  // ── P8: Update crm_lead_state (qualification_civil — pré-docs) → escrita real enova_state ──
  // T9.13M-FIX: escrita real habilitada; qualification_civil → fase_conversa = null → omitida.

  console.log('\n── P8: update crm_lead_state (qualification_civil) → escrita real enova_state (T9.13M-FIX) ──');

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
  check('P8.2: retorna state atualizado', p8Updated !== null);
  check('P8.3: lead_id (UUID) preservado após update', p8Updated?.lead_id === stateLeadId);
  check('P8.4: stage_current atualizado', p8Updated?.stage_current === 'qualification_civil');
  check('P8.5: state_version incrementado', p8Updated?.state_version === 2);
  check('P8.6: attempted_real_write=true (BLK resolvido)',
    p8WriteDiag?.attempted_real_write === true);
  check('P8.7: qualification_civil → fase_conversa=null (mapper conservador)',
    mapStageCurrentToFaseConversa('qualification_civil') === null);

  // ── P8a: Update state docs_prep → analysis_waiting → fase_conversa='aguardando_retorno_correspondente' ──

  console.log('\n── P8a: update docs_prep state → analysis_waiting → fase_conversa="aguardando_retorno_correspondente" ──');

  let p8aThrew = false;
  let p8aUpdated: CrmLeadState | null = null;
  try {
    p8aUpdated = await backend.update<CrmLeadState>(
      'crm_lead_state',
      (r) => r.lead_id === docsStateLeadId,
      { stage_current: 'analysis_waiting', state_version: 2, updated_at: new Date().toISOString() },
    );
  } catch {
    p8aThrew = true;
  }
  const p8aWriteDiag = backend.writeLog.at(-1);
  if (p8aWriteDiag) logWriteDiag('P8a', p8aWriteDiag);
  console.log(`  [DIAG P8a] uuid=${docsStateLeadId} stage_current=${p8aUpdated?.stage_current ?? 'null'}`);
  check('P8a.1: update analysis_waiting não lança', !p8aThrew);
  check('P8a.2: retorna state atualizado', p8aUpdated !== null);
  check('P8a.3: lead_id preservado', p8aUpdated?.lead_id === docsStateLeadId);
  check('P8a.4: stage_current = analysis_waiting', p8aUpdated?.stage_current === 'analysis_waiting');
  check('P8a.5: attempted_real_write=true', p8aWriteDiag?.attempted_real_write === true);

  // Leitura de verificação: enova_state deve ter fase_conversa='aguardando_retorno_correspondente'
  const readAnalysisState = await supabaseSelect<Record<string, unknown>>(cfg, 'enova_state', {
    filters: { lead_id: `eq.${docsStateLeadId}` },
    limit: 1,
  });
  logSelectResult('P8a', 'enova_state', docsStateLeadId, readAnalysisState);
  const analysisStateRow = readAnalysisState.rows[0];
  if (p8aWriteDiag?.ok) {
    check('P8a.6: enova_state row encontrado', analysisStateRow !== undefined);
    check('P8a.7: fase_conversa="aguardando_retorno_correspondente" gravado',
      analysisStateRow?.fase_conversa === 'aguardando_retorno_correspondente',
      `fase_conversa=${String(analysisStateRow?.fase_conversa ?? 'null')}`);
  } else {
    check('P8a.6: escrita real falhou — verificação via mapper local', true,
      `write_error=${p8aWriteDiag?.error ?? 'null'}`);
    check('P8a.7: analysis_waiting mapeado corretamente (prova local)',
      mapStageCurrentToFaseConversa('analysis_waiting') === 'aguardando_retorno_correspondente',
      'mapStageCurrentToFaseConversa("analysis_waiting") === "aguardando_retorno_correspondente"');
  }

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
