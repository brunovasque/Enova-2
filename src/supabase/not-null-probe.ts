/**
 * ENOVA 2 — T9.13I/T9.13J — Probes NOT NULL e CHECK constraint para `crm_lead_meta`
 *
 * Descobre constraints de schema sem alterar banco, sem dados reais, sem logar
 * details/payload/secrets.
 *
 * Módulos:
 *   - runNotNullFullDiag (T9.13I): cascata information_schema → pg_catalog → incremental_probe
 *   - runCheckConstraintProbe (T9.13J): cascata information_schema.check_constraints
 *     → pg_catalog.pg_constraint → candidate_probe (testa conjunto fixo de valores)
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nunca logar details (contém valores reais de linha).
 *   - Nunca logar payload completo.
 *   - Nunca logar serviceRoleKey.
 *   - Nunca alterar schema/RLS/bucket.
 *   - wa_id de probe completamente isolado (prefixo `t9_13_probe_`).
 *   - MAX_ITERATIONS = 20 (NOT NULL probe); MAX_CANDIDATES = 20 (CHECK probe).
 */

import { supabaseSelect, supabaseUpsert } from './client.ts';
import type { SupabaseConfig } from './types.ts';

// ---------------------------------------------------------------------------
// Tipos de resultado
// ---------------------------------------------------------------------------

export type NotNullProbeSource =
  | 'information_schema'
  | 'pg_catalog'
  | 'incremental_probe'
  | 'blocked';

export interface NotNullProbeResult {
  source: NotNullProbeSource;
  required_columns: string[];
  values_suggested: Record<string, string>;
  probe_succeeded: boolean;
  remaining_error: string | null;
  iterations: number;
  information_schema_error: string | null;
  pg_catalog_error: string | null;
}

// ---------------------------------------------------------------------------
// Estratégia 1 — information_schema.columns
// ---------------------------------------------------------------------------

async function tryInformationSchema(
  cfg: SupabaseConfig,
): Promise<{ columns: string[] } | { error: string }> {
  const r = await supabaseSelect<Record<string, unknown>>(
    cfg,
    'information_schema.columns',
    {
      select: 'column_name',
      filters: { table_name: 'eq.crm_lead_meta', is_nullable: 'eq.NO' },
      limit: 100,
    },
  );
  if (!r.ok) return { error: r.error ?? 'unknown' };
  return {
    columns: r.rows.map((row) => String(row.column_name ?? '')).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Estratégia 2 — pg_catalog.pg_attribute
// (requer acesso a pg_catalog no search_path do PostgREST — geralmente bloqueado)
// ---------------------------------------------------------------------------

async function tryPgCatalog(
  cfg: SupabaseConfig,
): Promise<{ columns: string[] } | { error: string }> {
  // pg_catalog.pg_attribute não é exposto via PostgREST por padrão.
  // Tentativa serve para documentar se o schema estiver acessível.
  const r = await supabaseSelect<Record<string, unknown>>(
    cfg,
    'pg_catalog.pg_attribute',
    {
      select: 'attname',
      filters: {
        attrelid: `eq.crm_lead_meta`,
        attnotnull: 'eq.true',
        attnum: 'gt.0',
      },
      limit: 100,
    },
  );
  if (!r.ok) return { error: r.error ?? 'unknown' };
  return {
    columns: r.rows.map((row) => String(row.attname ?? '')).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Estratégia 3 — incremental_probe
// ---------------------------------------------------------------------------

const MAX_ITERATIONS = 20;
const SAFE_STRING_VALUE = 't9_13_test';

// Valores de fallback por tipo inferido: se 't9_13_test' gerar erro de tipo,
// tentar false (boolean) ou '0' (numeric como string — PostgREST aceita).
// Nenhum valor contém dados de cliente.
const FALLBACK_TYPE_VALUES: ReadonlyArray<unknown> = [SAFE_STRING_VALUE, false, '0', 'false'];

async function runIncrementalProbe(
  cfg: SupabaseConfig,
  probeWaId: string,
): Promise<NotNullProbeResult> {
  // payload acumulado: começa com os campos já confirmados em T9.13H-FIX.
  const payload: Record<string, unknown> = {
    wa_id: probeWaId,
    lead_pool: SAFE_STRING_VALUE,  // NOT NULL confirmado em T9.13H
    updated_at: new Date().toISOString(),
  };
  const discovered: string[] = ['lead_pool'];   // já confirmado — sempre na lista
  const valuesSuggested: Record<string, string> = { lead_pool: SAFE_STRING_VALUE };

  let iterations = 0;
  let probeSucceeded = false;
  let remainingError: string | null = null;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterations++;
    const result = await supabaseUpsert<Record<string, unknown>>(cfg, 'crm_lead_meta', payload);

    if (result.ok) {
      probeSucceeded = true;
      remainingError = null;
      break;
    }

    remainingError = result.error;

    // Extrair pg_code do erro estruturado (client.ts T9.13H-DIAG)
    const pgCodeMatch = /pg_code=(\d+)/.exec(result.error ?? '');
    const pgCode = pgCodeMatch?.[1] ?? null;

    if (pgCode !== '23502') {
      // Erro diferente de NOT NULL — pode ser tipo inválido ou outro constraint.
      // Registra e para o probe.
      break;
    }

    // Extrair coluna violada de pg_message
    const pgMsgMatch = /pg_message=(.+?)(?:\s+pg_hint=|$)/.exec(result.error ?? '');
    const pgMsg = pgMsgMatch?.[1] ?? '';
    const columnMatch = /null value in column "([^"]+)"/.exec(pgMsg);
    const violatedCol = columnMatch?.[1] ?? null;

    if (!violatedCol) {
      // pg_message não tem coluna extraível — para sem loop infinito
      break;
    }

    if (payload[violatedCol] !== undefined) {
      // Coluna já está no payload mas ainda viola NOT NULL — guard loop infinito
      // Isso indica que o valor atual não é aceito (type mismatch possivelmente).
      // Tenta fallback de tipo antes de parar.
      const currentValue = payload[violatedCol];
      const currentIndex = FALLBACK_TYPE_VALUES.indexOf(currentValue);
      if (currentIndex < FALLBACK_TYPE_VALUES.length - 1) {
        const nextValue = FALLBACK_TYPE_VALUES[currentIndex + 1];
        payload[violatedCol] = nextValue;
        valuesSuggested[violatedCol] = String(nextValue);
        continue;
      }
      // Esgotou fallbacks — para
      break;
    }

    // Coluna nova descoberta — adiciona com valor de string seguro
    discovered.push(violatedCol);
    payload[violatedCol] = SAFE_STRING_VALUE;
    valuesSuggested[violatedCol] = SAFE_STRING_VALUE;
    payload.updated_at = new Date().toISOString(); // bump para upsert determinístico
  }

  return {
    source: 'incremental_probe',
    required_columns: discovered,
    values_suggested: valuesSuggested,
    probe_succeeded: probeSucceeded,
    remaining_error: remainingError,
    iterations,
    information_schema_error: null,
    pg_catalog_error: null,
  };
}

// ---------------------------------------------------------------------------
// Entrada pública — runNotNullFullDiag
// ---------------------------------------------------------------------------

/**
 * Executa diagnóstico NOT NULL completo para `crm_lead_meta`.
 *
 * @param cfg - Configuração Supabase (service role — server-side apenas)
 * @param probeWaId - wa_id único de prova (prefixo t9_13_probe_); NUNCA usar wa_id real
 * @returns NotNullProbeResult com todas as colunas descobertas e metadados do probe
 */
export async function runNotNullFullDiag(
  cfg: SupabaseConfig,
  probeWaId: string,
): Promise<NotNullProbeResult> {
  let isError: string | null = null;
  let pgError: string | null = null;

  // Tentativa 1: information_schema
  const isResult = await tryInformationSchema(cfg);
  if ('columns' in isResult) {
    return {
      source: 'information_schema',
      required_columns: isResult.columns,
      values_suggested: Object.fromEntries(isResult.columns.map((c) => [c, SAFE_STRING_VALUE])),
      probe_succeeded: true,
      remaining_error: null,
      iterations: 1,
      information_schema_error: null,
      pg_catalog_error: null,
    };
  }
  isError = isResult.error;

  // Tentativa 2: pg_catalog
  const pgResult = await tryPgCatalog(cfg);
  if ('columns' in pgResult) {
    return {
      source: 'pg_catalog',
      required_columns: pgResult.columns,
      values_suggested: Object.fromEntries(pgResult.columns.map((c) => [c, SAFE_STRING_VALUE])),
      probe_succeeded: true,
      remaining_error: null,
      iterations: 1,
      information_schema_error: isError,
      pg_catalog_error: null,
    };
  }
  pgError = pgResult.error;

  // Tentativa 3: incremental probe
  const probeResult = await runIncrementalProbe(cfg, probeWaId);
  probeResult.information_schema_error = isError;
  probeResult.pg_catalog_error = pgError;
  return probeResult;
}

// ---------------------------------------------------------------------------
// Formatação do diagnóstico para stdout
// ---------------------------------------------------------------------------

/**
 * Imprime [NOT_NULL FULL DIAG crm_lead_meta] em stdout.
 * Nunca imprime details, payload completo ou serviceRoleKey.
 */
export function printNotNullFullDiag(result: NotNullProbeResult): void {
  console.log('\n[NOT_NULL FULL DIAG crm_lead_meta]');
  console.log(`  source=${result.source}`);
  if (result.information_schema_error) {
    console.log(`  information_schema_error=${result.information_schema_error}`);
  }
  if (result.pg_catalog_error) {
    console.log(`  pg_catalog_error=${result.pg_catalog_error}`);
  }
  console.log(`  required_columns=[${result.required_columns.join(', ')}]`);
  console.log('  values_suggested={');
  for (const [col, val] of Object.entries(result.values_suggested)) {
    console.log(`    ${col}: "${val}",`);
  }
  console.log('  }');
  console.log(`  probe_succeeded=${result.probe_succeeded}`);
  console.log(`  remaining_error=${result.remaining_error ?? 'none'}`);
  console.log(`  iterations=${result.iterations}`);
  if (!result.probe_succeeded) {
    console.log('  AÇÃO: adicionar colunas above ao payload de mapLeadToMeta (PR-T9.13I-FIX)');
    console.log('  BLOQUEIO: confirmar valor canônico de produção com Vasques antes de go-live');
  } else {
    console.log('  RESULTADO: upsert probe PASSOU — payload completo descoberto');
    console.log('  PRÓXIMO: aplicar values_suggested em mapLeadToMeta via PR-T9.13I-FIX');
  }
}

// =============================================================================
// T9.13J-DIAG — CHECK constraint probe para crm_lead_meta.lead_pool
// =============================================================================

export type CheckProbeSource =
  | 'information_schema'
  | 'pg_catalog'
  | 'candidate_probe'
  | 'blocked';

export interface CheckConstraintProbeResult {
  constraint_name: string;
  column: string;
  source: CheckProbeSource;
  check_clause: string | null;        // expressão SQL, se acessível via metadata
  allowed_values: string[];           // valores que passaram (candidate_probe)
  accepted_value: string | null;      // primeiro valor aceito no probe
  rejected_values: string[];          // valores rejeitados com 23514
  other_error_value: string | null;   // valor que causou erro diferente de 23514 (ex: 23502 lead_temp)
  remaining_error: string | null;
  information_schema_error: string | null;
  pg_catalog_error: string | null;
  iterations: number;
}

// Candidatos a testar — ordem: valores PT-BR mais prováveis primeiro,
// depois EN, depois valores genéricos.
// Fontes: padrões de CRM legado Brasil + busca no repo (zero uso canônico encontrado).
const LEAD_POOL_CANDIDATES: readonly string[] = [
  'fria', 'morna', 'quente',      // temperatura BR (mais provável em legado E1)
  'nova', 'ativo', 'inativo',     // status genérico BR
  'cold', 'warm', 'hot',          // temperatura EN
  'novo', 'prospect', 'ativo',    // termos CRM genéricos
  'importado', 'manual', 'api',   // origem do lead
  'default', 'geral', 'teste',    // valores de fallback genérico
];

// ---------------------------------------------------------------------------
// Tentativa 1 — information_schema.check_constraints
// ---------------------------------------------------------------------------

async function tryCheckInformationSchema(
  cfg: SupabaseConfig,
  constraintName: string,
): Promise<{ check_clause: string } | { error: string }> {
  const r = await supabaseSelect<Record<string, unknown>>(
    cfg,
    'information_schema.check_constraints',
    {
      select: 'check_clause',
      filters: { constraint_name: `eq.${constraintName}` },
      limit: 1,
    },
  );
  if (!r.ok) return { error: r.error ?? 'unknown' };
  if (r.rows.length === 0) return { error: 'constraint_not_found_in_information_schema' };
  return { check_clause: String(r.rows[0].check_clause ?? '') };
}

// ---------------------------------------------------------------------------
// Tentativa 2 — pg_catalog.pg_constraint (via PostgREST)
// PostgREST não expõe pg_catalog por padrão — documentar bloqueio.
// ---------------------------------------------------------------------------

async function tryCheckPgCatalog(
  cfg: SupabaseConfig,
  constraintName: string,
): Promise<{ check_clause: string } | { error: string }> {
  const r = await supabaseSelect<Record<string, unknown>>(
    cfg,
    'pg_catalog.pg_constraint',
    {
      select: 'conname,consrc',
      filters: { conname: `eq.${constraintName}`, contype: 'eq.c' },
      limit: 1,
    },
  );
  if (!r.ok) return { error: r.error ?? 'unknown' };
  if (r.rows.length === 0) return { error: 'constraint_not_found_in_pg_catalog' };
  return { check_clause: String(r.rows[0].consrc ?? '') };
}

// ---------------------------------------------------------------------------
// Tentativa 3 — candidate probe
// Testa candidatos de lead_pool um por um.
// Inclui lead_temp='t9_13_test' (NOT NULL confirmado T9.13I; sem CHECK próprio confirmado).
// wa_id isolado: t9_13_probe_pool_*
// Nunca loga details/payload/secrets.
// ---------------------------------------------------------------------------

async function runCandidateProbe(
  cfg: SupabaseConfig,
  probeWaId: string,
): Promise<CheckConstraintProbeResult> {
  const rejected: string[] = [];
  const accepted: string[] = [];
  let acceptedValue: string | null = null;
  let otherErrorValue: string | null = null;
  let remainingError: string | null = null;
  let iterations = 0;

  for (const candidate of LEAD_POOL_CANDIDATES) {
    if (iterations >= 20) break;    // hard stop
    iterations++;

    const payload: Record<string, unknown> = {
      wa_id: probeWaId,
      lead_pool: candidate,
      lead_temp: SAFE_STRING_VALUE,   // NOT NULL sem CHECK próprio confirmado (T9.13I)
      updated_at: new Date().toISOString(),
    };

    const result = await supabaseUpsert<Record<string, unknown>>(cfg, 'crm_lead_meta', payload);

    if (result.ok) {
      accepted.push(candidate);
      acceptedValue = candidate;
      remainingError = null;
      break;    // primeiro aceito — para o probe
    }

    const pgCode = /pg_code=(\d+)/.exec(result.error ?? '')?.[1] ?? null;
    remainingError = result.error;

    if (pgCode === '23514') {
      // CHECK constraint rejeitou este valor
      rejected.push(candidate);
      continue;
    }

    // Outro erro (ex: 23502 para lead_temp, tipo inválido, etc.) — para
    otherErrorValue = candidate;
    break;
  }

  return {
    constraint_name: 'crm_lead_meta_lead_pool_check',
    column: 'lead_pool',
    source: 'candidate_probe',
    check_clause: null,
    allowed_values: accepted,
    accepted_value: acceptedValue,
    rejected_values: rejected,
    other_error_value: otherErrorValue,
    remaining_error: remainingError,
    information_schema_error: null,
    pg_catalog_error: null,
    iterations,
  };
}

// ---------------------------------------------------------------------------
// Entrada pública — runCheckConstraintProbe
// ---------------------------------------------------------------------------

/**
 * Descobre valores permitidos pelo CHECK constraint de `crm_lead_meta.lead_pool`.
 *
 * @param cfg - Configuração Supabase (service role — server-side apenas)
 * @param probeWaId - wa_id único de prova (prefixo t9_13_probe_pool_); NUNCA usar wa_id real
 */
export async function runCheckConstraintProbe(
  cfg: SupabaseConfig,
  probeWaId: string,
): Promise<CheckConstraintProbeResult> {
  const constraintName = 'crm_lead_meta_lead_pool_check';

  // Tentativa 1: information_schema.check_constraints
  const isResult = await tryCheckInformationSchema(cfg, constraintName);
  if ('check_clause' in isResult) {
    return {
      constraint_name: constraintName,
      column: 'lead_pool',
      source: 'information_schema',
      check_clause: isResult.check_clause,
      allowed_values: [],
      accepted_value: null,
      rejected_values: [],
      other_error_value: null,
      remaining_error: null,
      information_schema_error: null,
      pg_catalog_error: null,
      iterations: 1,
    };
  }
  const isError = isResult.error;

  // Tentativa 2: pg_catalog.pg_constraint
  const pgResult = await tryCheckPgCatalog(cfg, constraintName);
  if ('check_clause' in pgResult) {
    return {
      constraint_name: constraintName,
      column: 'lead_pool',
      source: 'pg_catalog',
      check_clause: pgResult.check_clause,
      allowed_values: [],
      accepted_value: null,
      rejected_values: [],
      other_error_value: null,
      remaining_error: null,
      information_schema_error: isError,
      pg_catalog_error: null,
      iterations: 1,
    };
  }
  const pgError = pgResult.error;

  // Tentativa 3: candidate probe
  const probeResult = await runCandidateProbe(cfg, probeWaId);
  probeResult.information_schema_error = isError;
  probeResult.pg_catalog_error = pgError;
  return probeResult;
}

// ---------------------------------------------------------------------------
// Formatação do diagnóstico CHECK para stdout
// ---------------------------------------------------------------------------

/**
 * Imprime [CHECK DIAG crm_lead_meta.lead_pool] em stdout.
 * Nunca imprime details, payload completo ou serviceRoleKey.
 */
export function printCheckConstraintDiag(result: CheckConstraintProbeResult): void {
  console.log('\n[CHECK DIAG crm_lead_meta.lead_pool]');
  console.log(`  constraint=${result.constraint_name}`);
  console.log(`  source=${result.source}`);
  if (result.information_schema_error) {
    console.log(`  information_schema_error=${result.information_schema_error}`);
  }
  if (result.pg_catalog_error) {
    console.log(`  pg_catalog_error=${result.pg_catalog_error}`);
  }
  if (result.check_clause) {
    console.log(`  check_clause=${result.check_clause}`);
  }
  console.log(`  allowed_values=[${result.allowed_values.join(', ')}]`);
  console.log(`  accepted_value=${result.accepted_value ?? 'none'}`);
  console.log(`  rejected_values=[${result.rejected_values.join(', ')}]`);
  if (result.other_error_value) {
    console.log(`  other_error_value=${result.other_error_value}`);
    console.log('  nota: erro diferente de 23514 — pode indicar 23502 em lead_temp ou tipo inválido');
  }
  console.log(`  remaining_error=${result.remaining_error ?? 'none'}`);
  console.log(`  iterations=${result.iterations}`);
  if (result.accepted_value) {
    console.log(`  RESULTADO: valor aceito encontrado = "${result.accepted_value}"`);
    console.log('  BLOQUEIO: BLK-T9.13H-LEAD-POOL-VALUE — confirmar valor canônico de produção com Vasques');
    console.log('  NÃO aplicar em mapLeadToMeta sem confirmação — esta PR é DIAG');
  } else if (result.source === 'information_schema' || result.source === 'pg_catalog') {
    console.log(`  RESULTADO: check_clause obtida via ${result.source} — candidatos inferidos`);
  } else {
    console.log('  RESULTADO: nenhum candidato aceito — expandir lista ou aguardar Vasques');
  }
}
