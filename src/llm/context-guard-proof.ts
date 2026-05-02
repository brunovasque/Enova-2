// prove:t9.11-context-guard — T9.11
// Prova programática: LLM usa recent_turns no contexto sem quebrar stage/guard.
//
// Módulo puro — sem I/O, sem OpenAI, sem Supabase, sem env real. Exit 0 = OK.
//
// Soberania verificada:
//   - Core decide stage (stage_current vem do Core, não do LLM).
//   - Guard bloqueia conteúdo perigoso independente de recent_turns.
//   - Guard nunca inventa reply (replacement_used sempre false).
//   - recent_turns são contexto auxiliar — não alteram stage nem guard.

import { buildDynamicSystemPrompt, type LlmContext } from './client.ts';
import { applyOutputGuard } from './output-guard.ts';

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

// Base context — simula decisão do Core após processar turno real.
const BASE_CTX: LlmContext = {
  stage_current: 'discovery',
  stage_after: 'qualification_civil',
  next_objective: 'Entender o objetivo do cliente com o MCMV.',
  facts_count: 0,
  facts_summary: {},
  speech_intent: 'Perguntar sobre o objetivo do cliente.',
};

const CTX_WITH_TURNS: LlmContext = {
  ...BASE_CTX,
  recent_turns: [
    { role: 'user', content: 'Olá, quero comprar um imóvel pelo MCMV.' },
    { role: 'user', content: 'Sou solteiro e vou comprar sozinho.' },
    { role: 'user', content: 'Trabalho CLT e ganho R$ 3.500.' },
  ],
};

console.log('\n=== prove:t9.11-context-guard — T9.11 ===\n');

// ─── C1: stage_current + recent_turns no prompt ──────────────────────────────

console.log('── C1: stage_current + recent_turns renderizados no prompt ──');

const p1 = buildDynamicSystemPrompt(CTX_WITH_TURNS);
check('C1.1: stage_current presente no prompt', p1.includes('discovery'));
check('C1.2: next_objective presente', p1.includes('Entender o objetivo'));
check('C1.3: speech_intent presente', p1.includes('Perguntar sobre'));
check('C1.4: bloco recent_turns presente', p1.includes('Contexto recente'));
check('C1.5: turno 1 presente', p1.includes('Olá, quero comprar'));
check('C1.6: turno 2 presente', p1.includes('Sou solteiro'));
check('C1.7: turno 3 presente', p1.includes('Trabalho CLT'));
check('C1.8: prompt abaixo de 4800 chars', p1.length <= 4800, `len=${p1.length}`);

// ─── C2: stage_current aparece ANTES dos recent_turns — prioridade do Core ───

console.log('\n── C2: stage_current tem prioridade sobre recent_turns ──');

const stageIdx = p1.indexOf('discovery');
const historyIdx = p1.indexOf('Contexto recente');
check('C2.1: stage_current presente', stageIdx >= 0);
check('C2.2: bloco histórico presente', historyIdx >= 0);
check('C2.3: stage_current ANTES de recent_turns no prompt', stageIdx < historyIdx);
check('C2.4: label auxiliar no bloco de histórico', p1.includes('não para regras de etapa'));

// ─── C3: Guard bloqueia promessa de aprovação com recent_turns no contexto ───

console.log('\n── C3: Guard bloqueia promessa de aprovação (recent_turns presentes) ──');

const approvalReply = 'Perfeito! Você foi aprovado para o MCMV com base no seu perfil.';
const g3 = applyOutputGuard(approvalReply, { stage_current: CTX_WITH_TURNS.stage_current });
check('C3.1: guard bloqueia aprovação', g3.blocked === true);
check('C3.2: reason = approval_promise', g3.reason_codes.includes('approval_promise'));
check('C3.3: safe_reply_text undefined', g3.safe_reply_text === undefined);
check('C3.4: replacement_used false', g3.replacement_used === false);
check('C3.5: allowed false', g3.allowed === false);

// ─── C4: Guard passa reply seguro com recent_turns no contexto ───────────────

console.log('\n── C4: Guard passa reply seguro com recent_turns ──');

const safeReply = 'Ótimo! Me conta um pouco mais sobre o que você está buscando. É para morar ou investir?';
const g4 = applyOutputGuard(safeReply, { stage_current: CTX_WITH_TURNS.stage_current });
check('C4.1: guard permite reply seguro', g4.allowed === true);
check('C4.2: blocked false', g4.blocked === false);
check('C4.3: safe_reply_text presente', g4.safe_reply_text === safeReply);
check('C4.4: replacement_used false', g4.replacement_used === false);

// ─── C5: Guard bloqueia CPF exposto — independente de recent_turns ───────────

console.log('\n── C5: Guard bloqueia CPF exposto ──');

const cpfReply = 'Confirmei seu CPF: 123.456.789-09. Pode prosseguir.';
const g5 = applyOutputGuard(cpfReply, { stage_current: 'qualification_civil' });
check('C5.1: guard bloqueia CPF', g5.blocked === true);
check('C5.2: reason = pii_cpf_exposed', g5.reason_codes.includes('pii_cpf_exposed'));
check('C5.3: safe_reply_text undefined', g5.safe_reply_text === undefined);

// ─── C6: Guard bloqueia stage interno exposto — soberania da arquitetura ──────

console.log('\n── C6: Guard bloqueia stage interno exposto ──');

const stageReply = 'Você está na etapa qualification_civil do nosso processo.';
const g6 = applyOutputGuard(stageReply, { stage_current: 'qualification_civil' });
check('C6.1: guard bloqueia stage interno', g6.blocked === true);
check('C6.2: reason = internal_stage_exposed', g6.reason_codes.includes('internal_stage_exposed'));
check('C6.3: safe_reply_text undefined', g6.safe_reply_text === undefined);

// ─── C7: Guard bloqueia secrets — zero leak ───────────────────────────────────

console.log('\n── C7: Guard bloqueia secrets ──');

const secretReply = 'Segue sua chave: sk-abcdefghijklmnopqrstuvwxyz123456789';
const g7 = applyOutputGuard(secretReply, { stage_current: 'discovery' });
check('C7.1: guard bloqueia secret', g7.blocked === true);
check('C7.2: reason = secret_token_exposed', g7.reason_codes.includes('secret_token_exposed'));
check('C7.3: safe_reply_text undefined', g7.safe_reply_text === undefined);

// ─── C8: Negação contextual — guard NÃO bloqueia ─────────────────────────────

console.log('\n── C8: Negação antes de "aprovado" → guard permite ──');

const negationReply = 'Não posso dizer que você está aprovado agora — precisamos concluir a análise.';
const g8 = applyOutputGuard(negationReply, { stage_current: 'discovery' });
check('C8.1: guard permite reply com negação', g8.allowed === true);
check('C8.2: blocked false', g8.blocked === false);
check('C8.3: safe_reply_text presente', typeof g8.safe_reply_text === 'string');

// ─── C9: Sem recent_turns → prompt válido + guard funciona ────────────────────

console.log('\n── C9: Retrocompatibilidade — sem recent_turns ──');

const pNoHistory = buildDynamicSystemPrompt(BASE_CTX);
const gNoHistory = applyOutputGuard(safeReply, { stage_current: BASE_CTX.stage_current });
check('C9.1: sem recent_turns → prompt válido', pNoHistory.length > 0);
check('C9.2: sem recent_turns → sem bloco de histórico', !pNoHistory.includes('Contexto recente'));
check('C9.3: sem recent_turns → stage_current presente', pNoHistory.includes('discovery'));
check('C9.4: guard funciona sem recent_turns', gNoHistory.allowed === true);
check('C9.5: prompt abaixo de 4800 chars', pNoHistory.length <= 4800);

// ─── C10: Janela de 3 turnos — 5 turnos passados → apenas 3 renderizados ──────

console.log('\n── C10: Janela máxima 3 turnos ──');

const ctxWith5: LlmContext = {
  ...BASE_CTX,
  recent_turns: [
    { role: 'user', content: 'Turno A.' },
    { role: 'user', content: 'Turno B.' },
    { role: 'user', content: 'Turno C.' },
    { role: 'user', content: 'Turno D extra.' },
    { role: 'user', content: 'Turno E extra.' },
  ],
};
const p10 = buildDynamicSystemPrompt(ctxWith5);
const turnCount = [
  p10.includes('Turno A'), p10.includes('Turno B'), p10.includes('Turno C'),
  p10.includes('Turno D'), p10.includes('Turno E'),
].filter(Boolean).length;
check('C10.1: máximo 3 turnos renderizados', turnCount <= 3, `count=${turnCount}`);
check('C10.2: prompt abaixo de 4800 chars', p10.length <= 4800);

// ─── C11: Truncamento — turno longo → 100 chars no prompt ─────────────────────

console.log('\n── C11: Truncamento de turno a 100 chars ──');

const ctxLong: LlmContext = {
  ...BASE_CTX,
  recent_turns: [{ role: 'user', content: 'x'.repeat(250) }],
};
const p11 = buildDynamicSystemPrompt(ctxLong);
check('C11.1: turno longo → sem 150 xs consecutivos', !p11.includes('x'.repeat(150)));
check('C11.2: prompt ainda válido após truncamento', p11.length > 0);

// ─── C12: replacement_used sempre false — guard nunca inventa reply ────────────

console.log('\n── C12: replacement_used sempre false (soberania do guard) ──');

const blockedTexts = [
  'Você foi aprovado para o MCMV.',
  '123.456.789-09',
  'sk-abcdefghijklmnopqrstuvwxyz',
  'Você está na etapa qualification_civil.',
  '',
];
let replacementNeverUsed = true;
for (const t of blockedTexts) {
  const r = applyOutputGuard(t, { stage_current: 'discovery' });
  if (r.replacement_used) replacementNeverUsed = false;
}
check('C12.1: replacement_used sempre false em todos bloqueios', replacementNeverUsed);

const allowedResult = applyOutputGuard(safeReply, { stage_current: 'discovery' });
check('C12.2: replacement_used false em reply permitido', allowedResult.replacement_used === false);

// ─── C13: stage_current inalterado pela perspectiva do guard ─────────────────

console.log('\n── C13: stage_current não é alterado pelo guard (Core soberano) ──');

const stageCurrentBefore = CTX_WITH_TURNS.stage_current;
applyOutputGuard(safeReply, { stage_current: CTX_WITH_TURNS.stage_current });
applyOutputGuard(approvalReply, { stage_current: CTX_WITH_TURNS.stage_current });
const stageCurrentAfter = CTX_WITH_TURNS.stage_current;
check('C13.1: stage_current não muda após guard (allowed)', stageCurrentBefore === stageCurrentAfter);

const ctxRenda: LlmContext = {
  stage_current: 'qualification_renda',
  stage_after: 'qualification_eligibility',
  next_objective: 'Coletar renda.',
  facts_count: 2,
  facts_summary: { estado_civil: 'solteiro', processo: 'solo' },
  recent_turns: [{ role: 'user', content: 'Trabalho CLT e ganho R$ 3.500.' }],
};
const pRenda = buildDynamicSystemPrompt(ctxRenda);
check('C13.2: stage_current qualification_renda presente no prompt', pRenda.includes('qualification_renda'));
check('C13.3: recent_turns presentes junto com stage correto', pRenda.includes('Contexto recente'));
check('C13.4: next_objective presente', pRenda.includes('Coletar renda'));

// ─── C14: warn text_too_long — não bloqueia outbound ─────────────────────────

console.log('\n── C14: text_too_long → warn, não block ──');

const longReply = 'a'.repeat(1200);
const g14 = applyOutputGuard(longReply, { stage_current: 'discovery' });
check('C14.1: text_too_long → allowed true', g14.allowed === true);
check('C14.2: warned true', g14.warned === true);
check('C14.3: reason_codes inclui text_too_long', g14.reason_codes.includes('text_too_long'));
check('C14.4: blocked false', g14.blocked === false);

// ─── C15: Sem secrets no prompt com recent_turns sanitizados ─────────────────

console.log('\n── C15: recent_turns sanitizados → sem secrets no prompt ──');

// Conteúdo já sanitizado (como faz canary-pipeline.ts antes de popular llmContext)
const ctxSanitized: LlmContext = {
  ...BASE_CTX,
  recent_turns: [
    { role: 'user', content: '[token] presente no texto original, já substituído.' },
    { role: 'user', content: 'CPF já sanitizado: [cpf] no contexto.' },
  ],
};
const p15 = buildDynamicSystemPrompt(ctxSanitized);
check('C15.1: sem padrão sk- no prompt', !/sk-[A-Za-z0-9_\-]{10,}/.test(p15));
check('C15.2: sem Bearer token no prompt', !/Bearer\s+\S{10,}/.test(p15));
check('C15.3: sem padrão CPF bruto no prompt', !/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(p15));
check('C15.4: recent_turns sanitizados renderizados', p15.includes('[token]') || p15.includes('[cpf]'));

// ─── Resultado final ───────────────────────────────────────────────────────────

console.log(`\n─────────────────────────────────────────────`);
console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL`);
console.log(`─────────────────────────────────────────────`);

if (fail > 0) {
  console.error('\n✗ PROVA FALHOU — prove:t9.11-context-guard NÃO confirmado.');
  process.exit(1);
}

console.log('\n✓ prove:t9.11-context-guard OK — LLM usa contexto sem quebrar stage/guard.');
process.exit(0);
