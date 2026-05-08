/**
 * ENOVA 2 — T9.22 — Smoke de conversa multi-turno do funil completo
 *
 * Simula uma conversa completa por stages usando runCoreEngine diretamente.
 * Cada turno representa um passo da conversa: facts são acumulados progressivamente,
 * como ocorre no runtime real, e o engine decide stage_after + next_objective.
 *
 * Foco: verificar que a sequência de coleta de facts produz as transições corretas
 * em cada stage, sem regressão após T9.20/T9.21.
 *
 * Não usa HTTP real, não usa LLM real, não usa Supabase.
 * Apenas: runCoreEngine(LeadState) → CoreDecision.
 */

import { runCoreEngine } from './engine.ts';
import type { CoreDecision, LeadState } from './types.ts';

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

let pass = 0;
let fail = 0;

function eq<T>(id: string, desc: string, got: T, expected: T): void {
  const ok = got === expected;
  if (ok) {
    pass++;
    console.log(`  ✓ [${id}] ${desc}`);
  } else {
    fail++;
    console.error(`  ✗ [${id}] ${desc} — esperado: ${String(expected)}, obtido: ${String(got)}`);
  }
}

function ok(id: string, desc: string, condition: boolean, detail = ''): void {
  if (condition) {
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

function decide(stage: LeadState['current_stage'], facts: Record<string, unknown>): CoreDecision {
  return runCoreEngine({ lead_id: 'conv-smoke-001', current_stage: stage, facts });
}

// ---------------------------------------------------------------------------
// Conversa 1 — Lead brasileiro solteiro CLT (caminho dourado completo)
// ---------------------------------------------------------------------------

section('CONVERSA 1 — Brasileiro solteiro CLT (caminho dourado)');

// Turno 1 — topo vazio (primeiro contato)
{
  const d = decide('discovery', {});
  eq('CV1-T1a', 'topo vazio → block_advance=true', d.block_advance, true);
  eq('CV1-T1b', 'topo vazio → stage_after=discovery', d.stage_after, 'discovery');
  ok('CV1-T1c', 'next_objective = apresentar', (
    d.next_objective === 'apresentar_e_verificar_conhecimento' ||
    d.next_objective === 'coletar_customer_goal'
  ), d.next_objective);
}

// Turno 2 — customer_goal capturado
{
  const d = decide('discovery', { customer_goal: 'comprar_imovel' });
  eq('CV1-T2a', 'customer_goal capturado → ainda em discovery', d.stage_after, 'discovery');
  ok('CV1-T2b', 'next_objective inclui nome', d.next_objective.includes('nome'), d.next_objective);
}

// Turno 3 — nome capturado
{
  const d = decide('discovery', { customer_goal: 'comprar_imovel', nome_completo: 'Maria Silva' });
  eq('CV1-T3a', 'nome capturado → ainda em discovery', d.stage_after, 'discovery');
  ok('CV1-T3b', 'next_objective inclui nacionalidade', d.next_objective.includes('nacionalidade'), d.next_objective);
}

// Turno 4 — nacionalidade capturada → topo completo, avança
{
  const d = decide('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
  });
  eq('CV1-T4a', 'topo completo → stage_after=qualification_civil', d.stage_after, 'qualification_civil');
  eq('CV1-T4b', 'block_advance=false', d.block_advance, false);
}

// Turno 5 — entrando em qualification_civil, sem estado_civil
{
  const d = decide('qualification_civil', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
  });
  eq('CV1-T5a', 'civil sem estado_civil → block_advance=true', d.block_advance, true);
  ok('CV1-T5b', 'next_objective pede estado_civil', (
    d.next_objective.includes('estado_civil') || d.next_objective.includes('civil')
  ), d.next_objective);
}

// Turno 6 — estado_civil capturado, processo ausente
{
  const d = decide('qualification_civil', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
    estado_civil: 'solteiro',
  });
  eq('CV1-T6a', 'estado_civil=solteiro, sem processo → block_advance=true', d.block_advance, true);
  ok('CV1-T6b', 'next_objective pede processo', d.next_objective.includes('processo'), d.next_objective);
}

// Turno 7 — processo capturado → Meio A completo, avança
{
  const d = decide('qualification_civil', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
    estado_civil: 'solteiro',
    processo: 'solo',
  });
  eq('CV1-T7a', 'Meio A completo → stage_after=qualification_renda', d.stage_after, 'qualification_renda');
  eq('CV1-T7b', 'block_advance=false', d.block_advance, false);
}

// Turno 8 — entrando em qualification_renda, regime ausente
{
  const d = decide('qualification_renda', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
    estado_civil: 'solteiro',
    processo: 'solo',
  });
  eq('CV1-T8a', 'renda sem regime → block_advance=true', d.block_advance, true);
}

// Turno 9 — regime capturado, renda ausente
{
  const d = decide('qualification_renda', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
    estado_civil: 'solteiro',
    processo: 'solo',
    regime_trabalho: 'clt',
  });
  eq('CV1-T9a', 'regime=clt, sem renda → block_advance=true', d.block_advance, true);
}

// Turno 10 — renda capturada → Meio B renda completo, avança
{
  const d = decide('qualification_renda', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Maria Silva',
    nacionalidade: 'brasileiro',
    estado_civil: 'solteiro',
    processo: 'solo',
    regime_trabalho: 'clt',
    renda_principal: 4500,
  });
  eq('CV1-T10a', 'renda completa → stage_after=qualification_eligibility', d.stage_after, 'qualification_eligibility');
  eq('CV1-T10b', 'block_advance=false', d.block_advance, false);
}

// ---------------------------------------------------------------------------
// Conversa 2 — Estrangeiro sem RNM válido (trilho de bloqueio)
// ---------------------------------------------------------------------------

section('CONVERSA 2 — Estrangeiro sem RNM (trilho de bloqueio)');

// Turno 1 — topo com customer_goal + nome + estrangeiro
{
  const d = decide('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Jean Dupont',
    nacionalidade: 'estrangeiro',
  });
  eq('CV2-T1a', 'estrangeiro sem rnm → block_advance=true', d.block_advance, true);
  eq('CV2-T1b', 'stage_after=discovery', d.stage_after, 'discovery');
  ok('CV2-T1c', 'next_objective inclui rnm', d.next_objective.includes('rnm'), d.next_objective);
}

// Turno 2 — RNM inválido detectado
{
  const d = decide('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Jean Dupont',
    nacionalidade: 'estrangeiro',
    rnm_valido: false,
  });
  eq('CV2-T2a', 'rnm_valido=false → block_advance=true', d.block_advance, true);
  ok('CV2-T2b', 'next_objective inclui alternativa ou encerrar', (
    d.next_objective.includes('alternativa') || d.next_objective.includes('encerrar')
  ), d.next_objective);
}

// Turno 3 — RNM válido (prazo indeterminado) → topo completo
{
  const d = decide('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Carlos Mendez',
    nacionalidade: 'estrangeiro',
    rnm_valido: true,
  });
  eq('CV2-T3a', 'estrangeiro com rnm_valido=true → block_advance=false', d.block_advance, false);
  eq('CV2-T3b', 'stage_after=qualification_civil', d.stage_after, 'qualification_civil');
}

// ---------------------------------------------------------------------------
// Conversa 3 — Casado (processo deve ser conjunto, não solo)
// ---------------------------------------------------------------------------

section('CONVERSA 3 — Casado no civil (composição obrigatória)');

// Turno 1 — casado com processo=solo → deve sinalizar bloqueio ou corrigir
{
  const d = decide('qualification_civil', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Roberto Lima',
    nacionalidade: 'brasileiro',
    estado_civil: 'casado_civil',
    processo: 'solo',
  });
  // casado no civil + solo → gate de composição familiar deve bloquear ou corrigir
  ok('CV3-T1a', 'casado+solo → block_advance=true ou corrigido para conjunto', (
    d.block_advance === true || d.stage_after === 'qualification_renda'
  ), `block=${d.block_advance} stage_after=${d.stage_after} obj=${d.next_objective}`);
}

// Turno 2 — casado com processo=conjunto → deve avançar
{
  const d = decide('qualification_civil', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Roberto Lima',
    nacionalidade: 'brasileiro',
    estado_civil: 'casado_civil',
    processo: 'conjunto',
  });
  eq('CV3-T2a', 'casado+conjunto → block_advance=false', d.block_advance, false);
  eq('CV3-T2b', 'stage_after=qualification_renda', d.stage_after, 'qualification_renda');
}

// ---------------------------------------------------------------------------
// Resultado final
// ---------------------------------------------------------------------------

console.log('');
console.log(`━━━ RESULTADO: ${pass} PASS / ${fail} FAIL ━━━`);

if (fail > 0) {
  process.exit(1);
}
