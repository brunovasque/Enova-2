/**
 * ENOVA 2 — T9.22 — Diagnóstico estático do funil completo
 *
 * Executa os parsers e gates de cada stage com facts sintéticos para verificar:
 *   1. Que cada stage detecta corretamente os facts mínimos exigidos
 *   2. Que o engine emite o next_objective correto quando facts estão ausentes
 *   3. Que o engine autoriza avanço quando todos os facts estão presentes
 *   4. Que a sequência canônica de stages é respeitada
 *
 * Usa apenas APIs públicas existentes — nenhuma API inventada.
 * Saída: stdout — capturar com tsx ... > output.txt
 */

import { runCoreEngine } from './engine.ts';
import type { LeadState } from './types.ts';

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

let pass = 0;
let fail = 0;

function check(id: string, desc: string, ok: boolean, detail = ''): void {
  if (ok) {
    pass++;
    console.log(`  ✓ [${id}] ${desc}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail++;
    console.error(`  ✗ [${id}] ${desc}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title: string): void {
  console.log('');
  console.log(`=== ${title} ===`);
}

function makeState(stage: LeadState['current_stage'], facts: Record<string, unknown>): LeadState {
  return { lead_id: 'diag-static-001', current_stage: stage, facts };
}

// ---------------------------------------------------------------------------
// Stage 1 — discovery (Topo)
// ---------------------------------------------------------------------------

section('DISCOVERY — Topo do funil');

// D1: Estado vazio → deve pedir apresentação
{
  const s = makeState('discovery', {});
  const d = runCoreEngine(s);
  check('D1', 'sem facts → block_advance=true', d.block_advance === true);
  check('D1b', 'sem facts → stage_after=discovery', d.stage_after === 'discovery');
  check('D1c', 'sem facts → next_objective inclui apresentar ou coletar', (
    d.next_objective === 'apresentar_e_verificar_conhecimento' ||
    d.next_objective === 'coletar_customer_goal'
  ), d.next_objective);
}

// D2: customer_goal presente mas nome ausente
{
  const s = makeState('discovery', { customer_goal: 'comprar_imovel' });
  const d = runCoreEngine(s);
  check('D2', 'customer_goal=comprar_imovel, sem nome → block_advance=true', d.block_advance === true);
  check('D2b', 'next_objective inclui nome', d.next_objective.includes('nome'), d.next_objective);
}

// D3: customer_goal + nome presentes, nacionalidade ausente
{
  const s = makeState('discovery', { customer_goal: 'comprar_imovel', nome_completo: 'Bruno Vasques' });
  const d = runCoreEngine(s);
  check('D3', 'customer_goal+nome, sem nacionalidade → block_advance=true', d.block_advance === true);
  check('D3b', 'next_objective inclui nacionalidade', d.next_objective.includes('nacionalidade'), d.next_objective);
}

// D4: Topo completo (brasileiro) → deve avançar
{
  const s = makeState('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Bruno Vasques',
    nacionalidade: 'brasileiro',
  });
  const d = runCoreEngine(s);
  check('D4', 'topo completo → can_advance (block_advance=false)', d.block_advance === false);
  check('D4b', 'topo completo → stage_after=qualification_civil', d.stage_after === 'qualification_civil');
}

// D5: Estrangeiro sem rnm → deve pedir rnm
{
  const s = makeState('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Jean Dupont',
    nacionalidade: 'estrangeiro',
  });
  const d = runCoreEngine(s);
  check('D5', 'estrangeiro sem rnm_valido → block_advance=true', d.block_advance === true);
  check('D5b', 'next_objective inclui rnm', d.next_objective.includes('rnm'), d.next_objective);
}

// ---------------------------------------------------------------------------
// Stage 2 — qualification_civil (Meio A)
// ---------------------------------------------------------------------------

section('QUALIFICATION_CIVIL — Meio A');

// C1: Meio A vazio → deve pedir estado_civil
{
  const s = makeState('qualification_civil', {});
  const d = runCoreEngine(s);
  check('C1', 'sem facts → block_advance=true', d.block_advance === true);
  check('C1b', 'sem facts → stage_after=qualification_civil', d.stage_after === 'qualification_civil');
  check('C1c', 'next_objective inclui estado_civil ou civil', (
    d.next_objective.includes('estado_civil') || d.next_objective.includes('civil')
  ), d.next_objective);
}

// C2: estado_civil presente, processo ausente
{
  const s = makeState('qualification_civil', { estado_civil: 'solteiro' });
  const d = runCoreEngine(s);
  check('C2', 'estado_civil=solteiro, sem processo → block_advance=true', d.block_advance === true);
  check('C2b', 'next_objective inclui processo', d.next_objective.includes('processo'), d.next_objective);
}

// C3: Meio A completo (solteiro solo) → deve avançar
{
  const s = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'solo',
  });
  const d = runCoreEngine(s);
  check('C3', 'estado_civil+processo → block_advance=false', d.block_advance === false);
  check('C3b', 'stage_after=qualification_renda', d.stage_after === 'qualification_renda');
}

// C4: Casado sem processo → deve pedir processo (ou corrigir para conjunto)
{
  const s = makeState('qualification_civil', { estado_civil: 'casado_civil' });
  const d = runCoreEngine(s);
  check('C4', 'casado sem processo → block_advance=true', d.block_advance === true);
}

// ---------------------------------------------------------------------------
// Stage 3 — qualification_renda (Meio B — renda)
// ---------------------------------------------------------------------------

section('QUALIFICATION_RENDA — Meio B Renda');

// R1: Renda vazia → pedir regime
{
  const s = makeState('qualification_renda', {});
  const d = runCoreEngine(s);
  check('R1', 'sem facts → block_advance=true', d.block_advance === true);
  check('R1b', 'next_objective inclui regime ou renda', (
    d.next_objective.includes('regime') || d.next_objective.includes('renda')
  ), d.next_objective);
}

// R2: regime presente, renda ausente
{
  const s = makeState('qualification_renda', { regime_trabalho: 'clt' });
  const d = runCoreEngine(s);
  check('R2', 'regime=clt, sem renda → block_advance=true', d.block_advance === true);
}

// R3: Renda completa → deve avançar
{
  const s = makeState('qualification_renda', {
    regime_trabalho: 'clt',
    renda_principal: 3000,
  });
  const d = runCoreEngine(s);
  check('R3', 'regime+renda → block_advance=false', d.block_advance === false);
  check('R3b', 'stage_after=qualification_eligibility', d.stage_after === 'qualification_eligibility');
}

// ---------------------------------------------------------------------------
// Stage 4 — qualification_eligibility (Meio B — elegibilidade)
// ---------------------------------------------------------------------------

section('QUALIFICATION_ELIGIBILITY — Meio B Elegibilidade');

// E1: Sem nacionalidade → pedir
{
  const s = makeState('qualification_eligibility', {});
  const d = runCoreEngine(s);
  check('E1', 'sem nacionalidade → block_advance=true', d.block_advance === true);
}

// E2: Brasileiro → pode avançar
{
  const s = makeState('qualification_eligibility', { nacionalidade: 'brasileiro' });
  const d = runCoreEngine(s);
  check('E2', 'brasileiro → block_advance=false', d.block_advance === false);
}

// ---------------------------------------------------------------------------
// Sequência canônica completa — um lead modelo percorre todos os stages
// ---------------------------------------------------------------------------

section('SEQUÊNCIA CANÔNICA — Lead modelo completo');

const LEAD_COMPLETO_FACTS: Record<string, unknown> = {
  customer_goal: 'comprar_imovel',
  nome_completo: 'Maria Silva',
  nacionalidade: 'brasileiro',
  estado_civil: 'solteiro',
  processo: 'solo',
  regime_trabalho: 'clt',
  renda_principal: 4500,
};

const sequencia: Array<[LeadState['current_stage'], LeadState['current_stage']]> = [
  ['discovery', 'qualification_civil'],
  ['qualification_civil', 'qualification_renda'],
  ['qualification_renda', 'qualification_eligibility'],
];

for (const [stageIn, stageOut] of sequencia) {
  const s = makeState(stageIn, LEAD_COMPLETO_FACTS);
  const d = runCoreEngine(s);
  check(
    `SEQ-${stageIn}`,
    `${stageIn} → ${stageOut} (lead completo)`,
    d.stage_after === stageOut && !d.block_advance,
    `stage_after=${d.stage_after} block=${d.block_advance}`,
  );
}

// ---------------------------------------------------------------------------
// Resultado final
// ---------------------------------------------------------------------------

console.log('');
console.log(`━━━ RESULTADO: ${pass} PASS / ${fail} FAIL ━━━`);

if (fail > 0) {
  process.exit(1);
}
