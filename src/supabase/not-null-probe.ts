/**
 * ENOVA 2 — T9.13I-DIAG — Probe NOT NULL completo para `crm_lead_meta`
 *
 * Descobre TODAS as colunas NOT NULL de uma tabela em uma única execução
 * automatizada, sem alterar schema, sem dados reais, sem logar details/secrets.
 *
 * Estratégia em cascata:
 *   1. information_schema.columns via PostgREST (esperado: blocked)
 *   2. pg_catalog.pg_attribute via PostgREST (esperado: blocked)
 *   3. incremental_probe: upsert com wa_id isolado; extrai violated_column de
 *      pg_message de cada 23502; repete até PASS ou limite de iterações.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Nunca logar details (contém valores reais de linha).
 *   - Nunca logar payload completo.
 *   - Nunca logar serviceRoleKey.
 *   - Nunca alterar schema/RLS/bucket.
 *   - wa_id de probe completamente isolado (prefixo `t9_13_probe_`).
 *   - MAX_ITERATIONS = 20 — hard stop contra loop infinito.
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
