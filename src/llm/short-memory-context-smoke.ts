// smoke:llm:short-memory-context — T9.10
// Verifica buildDynamicSystemPrompt com recent_turns, sanitização e janela de contexto.
// Módulo puro — sem I/O, sem OpenAI, sem Supabase, sem env real. Exit 0 = OK.

import { buildDynamicSystemPrompt } from './client.ts';
import type { LlmContext } from './client.ts';

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

// ---------------------------------------------------------------------------
// Helper: sanitização idêntica à usada no canary-pipeline.ts
// (Duplicada aqui para testar de forma isolada — módulo puro, sem deps de runtime)
// ---------------------------------------------------------------------------
function sanitizeRecentTurnText(text: string, maxLen = 100): string {
  return text
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[cpf]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    .replace(/\(?\d{2}\)?\s*\d{4,5}-?\d{4}/g, '[tel]')
    .replace(/https?:\/\/\S+/gi, '[link]')
    .replace(/[a-z0-9]{20,}\.supabase\.co\S*/gi, '[link]')
    .replace(/\bsk-[A-Za-z0-9_\-]{10,}/gi, '[token]')
    .replace(/Bearer\s+\S{10,}/gi, '[token]')
    .replace(/\bsb-[A-Za-z0-9_\-]{10,}/gi, '[token]')
    .trim()
    .slice(0, maxLen);
}

// Base context sem recent_turns
const baseContext: LlmContext = {
  stage_current: 'discovery',
  stage_after: 'qualification_civil',
  next_objective: 'Entender o objetivo do cliente com o MCMV.',
  facts_count: 1,
  facts_summary: { customer_goal: 'comprar_imovel' },
  speech_intent: 'Perguntar sobre o objetivo do cliente.',
};

console.log('\n=== smoke:llm:short-memory-context — T9.10 ===\n');

// ─── Bloco 1: sem recent_turns — retrocompatibilidade ─────────────────────

console.log('── Bloco 1: sem recent_turns (retrocompatibilidade) ──');

const p1 = buildDynamicSystemPrompt(baseContext);
check('1.1: sem recent_turns → prompt válido', p1.length > 0);
check('1.2: sem recent_turns → contém stage_current', p1.includes('discovery'));
check('1.3: sem recent_turns → contém next_objective', p1.includes('Entender o objetivo'));
check('1.4: sem recent_turns → sem bloco de histórico', !p1.includes('Contexto recente'));
check('1.5: sem recent_turns → abaixo de 4800 chars', p1.length <= 4800);

// ─── Bloco 2: com recent_turns — renderização ──────────────────────────────

console.log('\n── Bloco 2: renderização de recent_turns ──');

const ctxWith3Turns: LlmContext = {
  ...baseContext,
  recent_turns: [
    { role: 'user', content: 'Quero comprar um imóvel pelo MCMV.' },
    { role: 'user', content: 'Sou solteiro e vou comprar sozinho.' },
    { role: 'user', content: 'Trabalho CLT e ganho R$ 3.500.' },
  ],
};

const p2 = buildDynamicSystemPrompt(ctxWith3Turns);
check('2.1: com recent_turns → prompt contém bloco de histórico', p2.includes('Contexto recente'));
check('2.2: com recent_turns → contém label auxiliar', p2.includes('continuidade natural'));
check('2.3: com recent_turns → contém turno 1', p2.includes('Quero comprar'));
check('2.4: com recent_turns → contém turno 2', p2.includes('Sou solteiro'));
check('2.5: com recent_turns → contém turno 3', p2.includes('Trabalho CLT'));
check('2.6: com recent_turns → stage_current ainda presente', p2.includes('discovery'));
check('2.7: com recent_turns → next_objective ainda presente', p2.includes('Entender o objetivo'));
check('2.8: com recent_turns → speech_intent ainda presente', p2.includes('Perguntar sobre'));
check('2.9: com recent_turns → abaixo de 4800 chars', p2.length <= 4800, `len=${p2.length}`);

// ─── Bloco 3: janela máxima — máximo 3 turnos ─────────────────────────────

console.log('\n── Bloco 3: janela máxima (máx 3 turnos) ──');

const ctxWith5Turns: LlmContext = {
  ...baseContext,
  recent_turns: [
    { role: 'user', content: 'Turno A antigo.' },
    { role: 'user', content: 'Turno B antigo.' },
    { role: 'user', content: 'Turno C recente.' },
    { role: 'user', content: 'Turno D recente.' },
    { role: 'user', content: 'Turno E recente.' },
  ],
};

const p3 = buildDynamicSystemPrompt(ctxWith5Turns);
// buildDynamicSystemPrompt renderiza apenas os primeiros 3 do slice(0,3)
// que são A, B, C — os primeiros da lista passada
const turnAPresent = p3.includes('Turno A');
const turnDPresent = p3.includes('Turno D');
const turnEPresent = p3.includes('Turno E');
// Apenas 3 turnos devem aparecer (A, B, C quando o slice(0,3) é aplicado)
const turnCount = [
  p3.includes('Turno A'), p3.includes('Turno B'), p3.includes('Turno C'),
  p3.includes('Turno D'), p3.includes('Turno E'),
].filter(Boolean).length;
check('3.1: janela: máximo 3 turnos renderizados', turnCount <= 3, `count=${turnCount}`);
check('3.2: janela: prompt abaixo de 4800 chars', p3.length <= 4800);

// ─── Bloco 4: truncamento por turno (100 chars) ───────────────────────────

console.log('\n── Bloco 4: truncamento de turno a 100 chars ──');

const longTurn = 'x'.repeat(200);
const ctxLong: LlmContext = {
  ...baseContext,
  recent_turns: [{ role: 'user', content: longTurn }],
};

const p4 = buildDynamicSystemPrompt(ctxLong);
// O conteúdo aparece truncado a 100 chars no prompt
// Verificar que não aparecem 200 x's seguidos
const hasFullLong = p4.includes('x'.repeat(150));
check('4.1: turno longo truncado para 100 chars no prompt', !hasFullLong, `has_150_x=${hasFullLong}`);
check('4.2: turno truncado → prompt ainda válido', p4.length > 0);

// ─── Bloco 5: sanitização — CPF ───────────────────────────────────────────

console.log('\n── Bloco 5: sanitização CPF ──');

const cpfRaw = '123.456.789-09';
const cpfSanitized = sanitizeRecentTurnText(`Meu CPF é ${cpfRaw}.`);
check('5.1: CPF sanitizado → [cpf]', cpfSanitized.includes('[cpf]'));
check('5.2: CPF original não presente', !cpfSanitized.includes(cpfRaw));

// Verificar via prompt
const ctxCpf: LlmContext = {
  ...baseContext,
  recent_turns: [{ role: 'user', content: sanitizeRecentTurnText(`Meu CPF é ${cpfRaw}.`) }],
};
const p5 = buildDynamicSystemPrompt(ctxCpf);
check('5.3: CPF não aparece no prompt', !p5.includes(cpfRaw));

// ─── Bloco 6: sanitização — e-mail ────────────────────────────────────────

console.log('\n── Bloco 6: sanitização e-mail ──');

const emailRaw = 'cliente@gmail.com';
const emailSanitized = sanitizeRecentTurnText(`Pode mandar para ${emailRaw}`);
check('6.1: e-mail sanitizado → [email]', emailSanitized.includes('[email]'));
check('6.2: e-mail original não presente', !emailSanitized.includes(emailRaw));

// ─── Bloco 7: sanitização — telefone ──────────────────────────────────────

console.log('\n── Bloco 7: sanitização telefone ──');

const telRaw = '(11) 99999-1234';
const telSanitized = sanitizeRecentTurnText(`Me liga no ${telRaw}`);
check('7.1: telefone sanitizado → [tel]', telSanitized.includes('[tel]'));
check('7.2: telefone original não presente', !telSanitized.includes('99999-1234'));

// ─── Bloco 8: sanitização — links ─────────────────────────────────────────

console.log('\n── Bloco 8: sanitização links ──');

const linkRaw = 'https://drive.google.com/file/xyz';
const linkSanitized = sanitizeRecentTurnText(`Segue o link: ${linkRaw}`);
check('8.1: link http → [link]', linkSanitized.includes('[link]'));
check('8.2: URL original não presente', !linkSanitized.includes('drive.google.com'));

// ─── Bloco 9: sanitização — tokens/secrets ────────────────────────────────

console.log('\n── Bloco 9: sanitização tokens/secrets ──');

const skToken = 'sk-abcdefghijklmnopqrstuvwxyz1234567890';
const skSanitized = sanitizeRecentTurnText(`Token: ${skToken}`);
check('9.1: sk- token → [token]', skSanitized.includes('[token]'));
check('9.2: sk- original não presente', !skSanitized.includes(skToken));

const bearerToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9xxxxx';
const bearerSanitized = sanitizeRecentTurnText(bearerToken);
check('9.3: Bearer token → [token]', bearerSanitized.includes('[token]'));

const sbToken = 'sb-abcdefghijklmnopqrstuvwxyz1234567890';
const sbSanitized = sanitizeRecentTurnText(`Supabase: ${sbToken}`);
check('9.4: sb- token → [token]', sbSanitized.includes('[token]'));
check('9.5: sb- original não presente', !sbSanitized.includes(sbToken));

// ─── Bloco 10: prioridade de stage_current no prompt ──────────────────────

console.log('\n── Bloco 10: stage_current tem prioridade ──');

const ctxPriority: LlmContext = {
  stage_current: 'qualification_renda',
  stage_after: 'qualification_eligibility',
  next_objective: 'Coletar informação de renda.',
  facts_count: 2,
  facts_summary: { regime_trabalho: 'clt' },
  recent_turns: [
    { role: 'user', content: 'Quero comprar um apartamento.' },
  ],
};
const p10 = buildDynamicSystemPrompt(ctxPriority);
// stage_current deve aparecer antes do bloco de histórico
const stageIdx = p10.indexOf('qualification_renda');
const historyIdx = p10.indexOf('Contexto recente');
check('10.1: stage_current presente', stageIdx >= 0);
check('10.2: histórico presente', historyIdx >= 0);
check('10.3: stage_current aparece ANTES do histórico no prompt', stageIdx < historyIdx);
check('10.4: next_objective presente', p10.includes('Coletar informação de renda'));

// ─── Bloco 11: histórico como contexto auxiliar, não regra ────────────────

console.log('\n── Bloco 11: rótulo auxiliar no bloco de histórico ──');

const ctxAux: LlmContext = {
  ...baseContext,
  recent_turns: [{ role: 'user', content: 'Oi, tudo bem?' }],
};
const p11 = buildDynamicSystemPrompt(ctxAux);
check('11.1: contém rótulo "não para regras de etapa"', p11.includes('não para regras de etapa'));
check('11.2: contém "continuidade natural"', p11.includes('continuidade natural'));

// ─── Bloco 12: recent_turns vazio → sem bloco de histórico ────────────────

console.log('\n── Bloco 12: recent_turns vazio → sem bloco ──');

const ctxEmpty: LlmContext = {
  ...baseContext,
  recent_turns: [],
};
const p12 = buildDynamicSystemPrompt(ctxEmpty);
check('12.1: recent_turns vazio → sem bloco de histórico', !p12.includes('Contexto recente'));
check('12.2: recent_turns vazio → stage_current presente', p12.includes('discovery'));

// ─── Bloco 13: sem secrets no output serializado ──────────────────────────

console.log('\n── Bloco 13: segurança — sem secrets no output ──');

const ctxSecret: LlmContext = {
  ...baseContext,
  recent_turns: [
    { role: 'user', content: sanitizeRecentTurnText('sk-abcdefghijklmnopqrstuvwxyz secret aqui') },
  ],
};
const p13 = buildDynamicSystemPrompt(ctxSecret);
check('13.1: prompt não contém sk- secrets', !/sk-[A-Za-z0-9_\-]{10,}/.test(p13));
check('13.2: prompt não contém Bearer tokens', !/Bearer\s+\S{10,}/.test(p13));

// ─── Bloco 14: speech_intent presente quando fornecido ────────────────────

console.log('\n── Bloco 14: speech_intent presente ──');

const ctxIntent: LlmContext = {
  ...baseContext,
  speech_intent: 'Coletar estado civil do cliente.',
  recent_turns: [{ role: 'user', content: 'Olá, preciso de ajuda.' }],
};
const p14 = buildDynamicSystemPrompt(ctxIntent);
check('14.1: speech_intent presente no prompt', p14.includes('Coletar estado civil'));
check('14.2: histórico presente junto com speech_intent', p14.includes('Contexto recente'));

// ─── Bloco 15: sanitização preserva texto sem dados sensíveis ─────────────

console.log('\n── Bloco 15: sanitização não quebra texto limpo ──');

const cleanText = 'Quero comprar um apartamento pelo MCMV.';
const cleanSanitized = sanitizeRecentTurnText(cleanText);
check('15.1: texto limpo sobrevive à sanitização', cleanSanitized === cleanText);
check('15.2: texto limpo não é transformado', !cleanSanitized.includes('['));

// ─── Resultado final ───────────────────────────────────────────────────────

console.log(`\n─────────────────────────────────────────────`);
console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL`);
console.log(`─────────────────────────────────────────────`);

if (fail > 0) {
  console.error('\n✗ SMOKE FALHOU — smoke:llm:short-memory-context NÃO confirmado.');
  process.exit(1);
}

console.log('\n✓ smoke:llm:short-memory-context OK — Memória curta validada.');
process.exit(0);
