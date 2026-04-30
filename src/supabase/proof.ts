/**
 * ENOVA 2 — PR-T8.9 — Prova Supabase real + documentos + dossiê
 *
 * Dual-mode proof script:
 *   - Default (sem env real): imprime SKIPPED_REAL_ENV_MISSING, sai com 0.
 *     Nunca falha CI. Pode rodar em smoke:all sem risco.
 *   - Modo real (SUPABASE_REAL_ENABLED=true + URL + KEY):
 *     executa 8 fases de prova contra o banco real, sem alterar schema.
 *
 * Env vars:
 *   SUPABASE_REAL_ENABLED=true         — gate obrigatório para modo real
 *   SUPABASE_URL                        — base URL PostgREST
 *   SUPABASE_SERVICE_ROLE_KEY           — service role (nunca exposta em stdout)
 *   SUPABASE_PROOF_LEAD_REF (opcional)  — lead_id ou external_ref para foco
 *   SUPABASE_PROOF_WRITE_ENABLED=true   — habilita insert append-only em crm_override_log
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nunca expor SUPABASE_SERVICE_ROLE_KEY em stdout/stderr.
 *   - Nunca alterar schema, RLS, bucket policies.
 *   - Nunca delete/reset real.
 *   - Insert real apenas com SUPABASE_PROOF_WRITE_ENABLED=true.
 *   - operator_id='t8_9_proof'; reason inclui 'PR-T8.9 prova controlada'.
 *   - Se schema de escrita divergir do esperado: WRITE_REAL_SKIPPED_SCHEMA_UNCONFIRMED.
 */

import { getSupabaseConfig, getSupabaseReadiness, maskSupabaseUrl } from './readiness.ts';
import { supabaseInsert, supabaseSelect } from './client.ts';
import type { SupabaseConfig } from './types.ts';
import { SUPABASE_KNOWN_BUCKETS, SUPABASE_KNOWN_TABLES } from './types.ts';

// ---------------------------------------------------------------------------
// Env resolution
// ---------------------------------------------------------------------------

const env = {
  SUPABASE_REAL_ENABLED: process.env.SUPABASE_REAL_ENABLED,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_PROOF_LEAD_REF: process.env.SUPABASE_PROOF_LEAD_REF ?? null,
  SUPABASE_PROOF_WRITE_ENABLED: process.env.SUPABASE_PROOF_WRITE_ENABLED === 'true',
};

// ---------------------------------------------------------------------------
// Helpers de output (nunca imprimem o service role)
// ---------------------------------------------------------------------------

const PROOF_TAG = 'PROVA-SUPABASE-REAL | PR-T8.9';

function line(label: string, result: string, detail?: string) {
  const padded = label.padEnd(32, '.');
  const out = detail ? `${padded} ${result}  ${detail}` : `${padded} ${result}`;
  console.log(out);
}

function maskKey(raw: string | undefined): string {
  if (!raw || raw.length < 8) return '(ausente)';
  return `${raw.slice(0, 6)}…(${raw.length} chars)`;
}

// ---------------------------------------------------------------------------
// Storage REST API (independente do PostgREST client)
// ---------------------------------------------------------------------------

interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  [k: string]: unknown;
}

async function listStorageBuckets(cfg: SupabaseConfig): Promise<{
  ok: boolean;
  buckets: StorageBucket[];
  error: string | null;
}> {
  const url = `${cfg.url.replace(/\/$/, '')}/storage/v1/bucket`;
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: cfg.serviceRoleKey,
        authorization: `Bearer ${cfg.serviceRoleKey}`,
        'content-type': 'application/json',
      },
    });
    const text = await resp.text();
    if (!resp.ok) {
      return { ok: false, buckets: [], error: `http_${resp.status}: ${text.slice(0, 200)}` };
    }
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { return { ok: false, buckets: [], error: 'json_parse_failed' }; }
    if (!Array.isArray(parsed)) return { ok: false, buckets: [], error: 'unexpected_shape' };
    return { ok: true, buckets: parsed as StorageBucket[], error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch_failed';
    return { ok: false, buckets: [], error: `network: ${msg}` };
  }
}

// ---------------------------------------------------------------------------
// Fases de prova
// ---------------------------------------------------------------------------

interface ProofPhase {
  id: string;
  label: string;
  passed: boolean;
  skipped: boolean;
  detail: string;
}

async function runProof(cfg: SupabaseConfig): Promise<ProofPhase[]> {
  const phases: ProofPhase[] = [];
  const leadRef = env.SUPABASE_PROOF_LEAD_REF;
  const writeEnabled = env.SUPABASE_PROOF_WRITE_ENABLED;

  // P1: Readiness estrutural (sem chamada HTTP)
  {
    const readiness = getSupabaseReadiness(env);
    const urlMasked = maskSupabaseUrl(env.SUPABASE_URL);
    const ok = readiness.ready;
    const detail = `mode=${readiness.mode} url=${urlMasked ?? '(vazio)'} warnings=${readiness.warnings.length}`;
    phases.push({ id: 'P1', label: 'Readiness estrutural', passed: ok, skipped: false, detail });
    line('[P1] Readiness', ok ? 'OK' : 'FAIL', detail);
  }

  // P2: Auth inválida → espera 4xx (confirma endpoint acessível)
  {
    const badCfg: SupabaseConfig = { url: cfg.url, serviceRoleKey: 'INVALID_PROOF_KEY_T8_9' };
    const result = await supabaseSelect(badCfg, 'crm_lead_meta', { limit: 1 });
    const expectAuth = !result.ok && result.http_status !== null && result.http_status >= 400;
    const detail = `http_status=${result.http_status ?? 'null'} ok=${result.ok}`;
    phases.push({ id: 'P2', label: 'Auth inválida (espera 4xx)', passed: expectAuth, skipped: false, detail });
    line('[P2] Auth inválida (espera 4xx)', expectAuth ? 'OK' : 'FAIL', detail);
  }

  // P3: Leitura crm_lead_meta
  {
    const opts = leadRef
      ? { limit: 10, filters: { lead_id: `eq.${leadRef}` } }
      : { limit: 20, order: 'created_at.desc' };
    const result = await supabaseSelect(cfg, 'crm_lead_meta', opts);
    const ok = result.ok;
    const detail = ok
      ? `rows=${result.rows.length} lead_ref=${leadRef ?? 'all'}`
      : `error=${result.error?.slice(0, 100)}`;
    phases.push({ id: 'P3', label: 'Leitura crm_lead_meta', passed: ok, skipped: false, detail });
    line('[P3] crm_lead_meta', ok ? 'OK' : 'FAIL', detail);
  }

  // P4: Leitura enova_docs
  {
    const opts = leadRef
      ? { limit: 20, filters: { lead_id: `eq.${leadRef}` } }
      : { limit: 20, order: 'updated_at.desc' };
    const result = await supabaseSelect(cfg, 'enova_docs', opts);
    const ok = result.ok;
    const detail = ok
      ? `rows=${result.rows.length}`
      : `error=${result.error?.slice(0, 100)}`;
    phases.push({ id: 'P4', label: 'Leitura enova_docs', passed: ok, skipped: false, detail });
    line('[P4] enova_docs', ok ? 'OK' : 'FAIL', detail);
  }

  // P5: Leitura enova_state + crm_override_log (dossier snapshot)
  {
    const stateOpts = leadRef
      ? { limit: 5, filters: { lead_id: `eq.${leadRef}` } }
      : { limit: 10, order: 'updated_at.desc' };
    const overrideOpts = leadRef
      ? { limit: 10, filters: { lead_id: `eq.${leadRef}` } }
      : { limit: 10, order: 'created_at.desc' };

    const [stateRes, overrideRes] = await Promise.all([
      supabaseSelect(cfg, 'enova_state', stateOpts),
      supabaseSelect(cfg, 'crm_override_log', overrideOpts),
    ]);
    const ok = stateRes.ok && overrideRes.ok;
    const detail = ok
      ? `state_rows=${stateRes.rows.length} override_rows=${overrideRes.rows.length} lead_ref=${leadRef ?? 'all'}`
      : `state_ok=${stateRes.ok} override_ok=${overrideRes.ok}`;
    phases.push({ id: 'P5', label: 'Dossier snapshot (state+overrides)', passed: ok, skipped: false, detail });
    line('[P5] Dossier snapshot', ok ? 'OK' : 'FAIL', detail);
  }

  // P6: Leitura enova_document_files (documentos físicos)
  {
    const opts = leadRef
      ? { limit: 20, filters: { lead_id: `eq.${leadRef}` } }
      : { limit: 20, order: 'created_at.desc' };
    const result = await supabaseSelect(cfg, 'enova_document_files', opts);
    const ok = result.ok;
    const detail = ok
      ? `rows=${result.rows.length}`
      : `error=${result.error?.slice(0, 100)}`;
    phases.push({ id: 'P6', label: 'Leitura enova_document_files', passed: ok, skipped: false, detail });
    line('[P6] enova_document_files', ok ? 'OK' : 'FAIL', detail);
  }

  // P7: Storage buckets (lista via Storage REST API)
  {
    const storageResult = await listStorageBuckets(cfg);
    const ok = storageResult.ok;
    let detail: string;
    if (ok) {
      const names = storageResult.buckets.map((b) => b.name);
      const knownNames = SUPABASE_KNOWN_BUCKETS.map((b) => b.name);
      const matchCount = names.filter((n) => knownNames.includes(n)).length;
      detail = `found=${storageResult.buckets.length} known_matched=${matchCount}/${knownNames.length} buckets=[${names.join(',')}]`;
    } else {
      detail = `error=${storageResult.error?.slice(0, 150)}`;
    }
    phases.push({ id: 'P7', label: 'Storage buckets', passed: ok, skipped: false, detail });
    line('[P7] Storage buckets', ok ? 'OK' : 'FAIL', detail);
  }

  // P8: Write append-only (opcional — apenas com SUPABASE_PROOF_WRITE_ENABLED=true)
  {
    if (!writeEnabled) {
      const detail = 'SUPABASE_PROOF_WRITE_ENABLED não setado. Insert real pulado.';
      phases.push({ id: 'P8', label: 'Write append-only (opcional)', passed: true, skipped: true, detail });
      line('[P8] Write (opcional)', 'SKIPPED', detail);
    } else {
      const proofLeadId = leadRef ?? `proof_t8_9_${Date.now()}`;
      const proofRow = {
        lead_id: proofLeadId,
        operator_id: 't8_9_proof',
        override_type: 'note',
        target_field: 'proof_checkpoint',
        old_value: null,
        new_value: 'PR-T8.9_proof_marker',
        reason: `PR-T8.9 prova controlada — ${new Date().toISOString()}`,
        created_at: new Date().toISOString(),
      };

      const insertResult = await supabaseInsert(cfg, 'crm_override_log', proofRow);

      if (insertResult.ok) {
        const insertedRow = insertResult.rows[0] as Record<string, unknown> | undefined;
        const insertedId = insertedRow?.override_id ?? 'returned_without_id';
        const detail = `override_id=${insertedId} lead_id=${proofLeadId}`;
        phases.push({ id: 'P8', label: 'Write append-only real', passed: true, skipped: false, detail });
        line('[P8] Write append-only', 'OK', detail);
      } else {
        // Verifica se parece divergência de schema vs erro de rede
        const isSchemaError =
          insertResult.http_status !== null &&
          (insertResult.http_status === 400 || insertResult.http_status === 422 || insertResult.http_status === 404);
        const statusLabel = isSchemaError
          ? 'WRITE_REAL_SKIPPED_SCHEMA_UNCONFIRMED'
          : 'WRITE_REAL_FAILED';
        const detail = `status=${insertResult.http_status} error=${insertResult.error?.slice(0, 150)}`;
        phases.push({ id: 'P8', label: 'Write append-only real', passed: false, skipped: isSchemaError, detail: `${statusLabel}: ${detail}` });
        line('[P8] Write append-only', statusLabel, detail);
      }
    }
  }

  return phases;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n${PROOF_TAG} | ${today}`);
  console.log('='.repeat(60));

  const readiness = getSupabaseReadiness(env);

  // Modo skip: sem env real → exit 0, nunca falha CI
  if (!readiness.ready) {
    console.log('\nSKIPPED: SKIPPED_REAL_ENV_MISSING');
    console.log(
      '  SUPABASE_REAL_ENABLED não é "true" ou envs ausentes. Prova pulada — nunca falha CI.',
    );
    console.log(
      '  Para rodar em modo real: SUPABASE_REAL_ENABLED=true SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> tsx src/supabase/proof.ts',
    );
    if (readiness.errors.length > 0) {
      console.log(`  Erros de readiness: ${readiness.errors.join(' | ')}`);
    }
    console.log('\nEXIT 0 (skipped)');
    process.exit(0);
  }

  // Modo real
  const cfg = getSupabaseConfig(env);
  if (!cfg) {
    console.error('ERRO INTERNO: readiness OK mas getSupabaseConfig retornou null. Abortando.');
    process.exit(1);
  }

  console.log(`\nModo real ativo.`);
  console.log(`  url_masked  : ${maskSupabaseUrl(env.SUPABASE_URL)}`);
  console.log(`  service_role: ${maskKey(env.SUPABASE_SERVICE_ROLE_KEY)}`);
  console.log(`  lead_ref    : ${env.SUPABASE_PROOF_LEAD_REF ?? '(não setado — leitura geral)'}`);
  console.log(`  write_enabled: ${env.SUPABASE_PROOF_WRITE_ENABLED}`);
  console.log(`  known_tables: ${SUPABASE_KNOWN_TABLES.length}`);
  console.log(`  known_buckets: ${SUPABASE_KNOWN_BUCKETS.length}`);
  console.log('');

  const phases = await runProof(cfg);

  console.log('');
  console.log('='.repeat(60));

  const total = phases.length;
  const skipped = phases.filter((p) => p.skipped).length;
  const passed = phases.filter((p) => p.passed).length;
  const failed = phases.filter((p) => !p.passed && !p.skipped).length;

  console.log(`RESULTADO: ${passed}/${total} PASS | ${skipped} SKIPPED | ${failed} FAIL`);

  if (failed > 0) {
    console.log('\nFases com falha:');
    for (const p of phases.filter((x) => !x.passed && !x.skipped)) {
      console.log(`  [${p.id}] ${p.label}: ${p.detail}`);
    }
    console.log('\nEXIT 1 (falha em modo real)');
    process.exit(1);
  }

  console.log('\nPROVA-SUPABASE-REAL CONCLUÍDA');
  console.log('EXIT 0 (ok)');
  process.exit(0);
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  // Nunca expor service role em erro não tratado
  const safe = msg.replace(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', '***');
  console.error(`ERRO NÃO TRATADO: ${safe}`);
  process.exit(1);
});
