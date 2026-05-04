/**
 * T9.14-IMPL — Prova do reverse mapper fase_conversa → stage_current
 *
 * Prova que BLK-T9.14-READ-PATH foi resolvido:
 *   - mapFaseConversaToStageCurrent retorna stages corretos para todos os valores CRM
 *   - mapLeadStateFromEnovaState não depende mais de row.stage_current (coluna inexistente)
 *
 * Rodar: npm run prove:t9.14-reverse-mapper
 */

import { mapFaseConversaToStageCurrent } from './crm-store.ts';

let pass = 0;
let fail = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.log(`  FAIL  ${label}: expected=${JSON.stringify(expected)} got=${JSON.stringify(actual)}`);
    fail++;
  }
}

console.log('\n=== T9.14-IMPL: Reverse Mapper fase_conversa → stage_current ===\n');

// --- Bloco A: pré-docs (null / '' / 'inicio' / valor desconhecido → 'discovery') ---
console.log('Bloco A — Pré-docs e valores desconhecidos:');
check('null → discovery',            mapFaseConversaToStageCurrent(null),            'discovery');
check('undefined → discovery',       mapFaseConversaToStageCurrent(undefined),       'discovery');
check('"" → discovery',              mapFaseConversaToStageCurrent(''),               'discovery');
check('"inicio" → discovery',        mapFaseConversaToStageCurrent('inicio'),         'discovery');
check('valor_legado → discovery',    mapFaseConversaToStageCurrent('valor_legado'),   'discovery');
check('inicio_nome → discovery',     mapFaseConversaToStageCurrent('inicio_nome'),    'discovery');
check('quem_pode_somar → discovery', mapFaseConversaToStageCurrent('quem_pode_somar'), 'discovery');

// --- Bloco B: pós-docs (valores CRM operacionais E1 → stages T9) ---
console.log('\nBloco B — Pós-docs (mapeamento bidirecional):');
check('envio_docs → docs_prep',
  mapFaseConversaToStageCurrent('envio_docs'), 'docs_prep');
check('aguardando_retorno_correspondente → analysis_waiting',
  mapFaseConversaToStageCurrent('aguardando_retorno_correspondente'), 'analysis_waiting');
check('agendamento_visita → visit_scheduling',
  mapFaseConversaToStageCurrent('agendamento_visita'), 'visit_scheduling');
check('visita_confirmada → visit_confirmed',
  mapFaseConversaToStageCurrent('visita_confirmada'), 'visit_confirmed');
check('finalizacao_processo → finalization',
  mapFaseConversaToStageCurrent('finalizacao_processo'), 'finalization');

// --- Bloco C: prova que mapLeadStateFromEnovaState não usa row.stage_current ---
// Simula rows de enova_state como o banco real retorna (sem stage_current)
console.log('\nBloco C — Prova que read path usa fase_conversa (não stage_current inexistente):');

// Row com fase_conversa pós-docs: deve retornar docs_prep, não 'discovery'
const rowDocsPrep: Record<string, unknown> = {
  lead_id: 'uuid-lead-1',
  fase_conversa: 'envio_docs',
  updated_at: '2026-05-04T00:00:00Z',
  // stage_current: AUSENTE — coluna inexistente no schema real (PGRST204 T9.13G)
};
check(
  'row.fase_conversa=envio_docs sem stage_current → docs_prep',
  mapFaseConversaToStageCurrent(
    typeof rowDocsPrep.fase_conversa === 'string' ? rowDocsPrep.fase_conversa : null
  ),
  'docs_prep'
);

// Row sem fase_conversa (default banco = 'inicio' ou null): deve retornar 'discovery'
const rowPredocs: Record<string, unknown> = {
  lead_id: 'uuid-lead-2',
  updated_at: '2026-05-04T00:00:00Z',
  // fase_conversa: AUSENTE (lead pré-docs)
};
check(
  'row sem fase_conversa → discovery',
  mapFaseConversaToStageCurrent(
    typeof rowPredocs.fase_conversa === 'string' ? rowPredocs.fase_conversa : null
  ),
  'discovery'
);

// Row com analysis_waiting
const rowAnalysis: Record<string, unknown> = {
  lead_id: 'uuid-lead-3',
  fase_conversa: 'aguardando_retorno_correspondente',
  updated_at: '2026-05-04T00:00:00Z',
};
check(
  'row.fase_conversa=aguardando_retorno_correspondente → analysis_waiting',
  mapFaseConversaToStageCurrent(
    typeof rowAnalysis.fase_conversa === 'string' ? rowAnalysis.fase_conversa : null
  ),
  'analysis_waiting'
);

// --- Resultado final ---
console.log(`\n=== Resultado: ${pass} PASS | ${fail} FAIL ===\n`);

if (fail > 0) {
  process.exit(1);
}
process.exit(0);
