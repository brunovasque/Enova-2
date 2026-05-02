// smoke:core:text-extractor — T9.6
// Valida que extractFactsFromText extrai corretamente por stage.
// Exit 0 = todos os checks passaram.

import { extractFactsFromText } from './text-extractor.ts';

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

function eq(label: string, got: unknown, expected: unknown): void {
  check(label, got === expected, `got: ${JSON.stringify(got)} expected: ${JSON.stringify(expected)}`);
}

function empty(label: string, result: Record<string, unknown>): void {
  check(label, Object.keys(result).length === 0, `got keys: ${Object.keys(result).join(', ') || '(none)'}`);
}

function noThrow(label: string, fn: () => unknown): void {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${label}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${label} — threw: ${String(e)}`);
  }
}

console.log('\n=== smoke:core:text-extractor — T9.6 ===\n');

// ── discovery ────────────────────────────────────────────────────────────────
console.log('── discovery ──');

eq('D1: "quero comprar" → customer_goal comprar_imovel',
  extractFactsFromText('Quero comprar uma casa', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D2: "minha casa minha vida" → customer_goal comprar_imovel',
  extractFactsFromText('Quero saber sobre minha casa minha vida', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D3: "financiamento" → customer_goal comprar_imovel',
  extractFactsFromText('Tenho interesse em financiamento', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D4: "como funciona" → customer_goal entender_programa',
  extractFactsFromText('Como funciona o MCMV?', 'discovery')['customer_goal'],
  'entender_programa');

eq('D5: "quero entender" → customer_goal entender_programa',
  extractFactsFromText('Quero entender melhor o programa', 'discovery')['customer_goal'],
  'entender_programa');

eq('D6: "quero saber sobre" → customer_goal entender_programa',
  extractFactsFromText('Quero saber sobre o programa', 'discovery')['customer_goal'],
  'entender_programa');

// ── qualification_civil ───────────────────────────────────────────────────────
console.log('\n── qualification_civil ──');

eq('C1: "sou solteira" → estado_civil solteiro',
  extractFactsFromText('Sou solteira', 'qualification_civil')['estado_civil'],
  'solteiro');

eq('C2: "sou solteiro" → estado_civil solteiro',
  extractFactsFromText('Eu sou solteiro', 'qualification_civil')['estado_civil'],
  'solteiro');

eq('C3: "sou casado" → estado_civil casado_civil',
  extractFactsFromText('Sou casado no civil', 'qualification_civil')['estado_civil'],
  'casado_civil');

eq('C4: "sou casada" → estado_civil casado_civil',
  extractFactsFromText('Eu sou casada', 'qualification_civil')['estado_civil'],
  'casado_civil');

eq('C5: "união estável" → estado_civil uniao_estavel',
  extractFactsFromText('Tenho união estável', 'qualification_civil')['estado_civil'],
  'uniao_estavel');

eq('C6: "moro junto" → estado_civil uniao_estavel',
  extractFactsFromText('Moro junto com meu namorado', 'qualification_civil')['estado_civil'],
  'uniao_estavel');

eq('C7: "divorciado" → estado_civil divorciado',
  extractFactsFromText('Sou divorciado', 'qualification_civil')['estado_civil'],
  'divorciado');

eq('C8: "viúva" → estado_civil viuvo',
  extractFactsFromText('Sou viúva', 'qualification_civil')['estado_civil'],
  'viuvo');

eq('C9: "sozinho" → processo solo',
  extractFactsFromText('Vou comprar sozinho', 'qualification_civil')['processo'],
  'solo');

eq('C10: "só eu" → processo solo',
  extractFactsFromText('Serei só eu mesmo', 'qualification_civil')['processo'],
  'solo');

eq('C11: "eu e minha esposa" → processo conjunto',
  extractFactsFromText('Vou fazer com eu e minha esposa', 'qualification_civil')['processo'],
  'conjunto');

eq('C12: "eu e meu marido" → processo conjunto',
  extractFactsFromText('Eu e meu marido queremos comprar', 'qualification_civil')['processo'],
  'conjunto');

eq('C13: "com minha mãe" → processo composicao_familiar',
  extractFactsFromText('Vou fazer com minha mãe', 'qualification_civil')['processo'],
  'composicao_familiar');

eq('C14: "com meus pais" → processo composicao_familiar',
  extractFactsFromText('Seria com meus pais', 'qualification_civil')['processo'],
  'composicao_familiar');

// ── qualification_renda ───────────────────────────────────────────────────────
console.log('\n── qualification_renda ──');

eq('R1: "CLT" → regime_trabalho clt',
  extractFactsFromText('Trabalho CLT', 'qualification_renda')['regime_trabalho'],
  'clt');

eq('R2: "carteira assinada" → regime_trabalho clt',
  extractFactsFromText('Tenho carteira assinada', 'qualification_renda')['regime_trabalho'],
  'clt');

eq('R3: "autônomo" → regime_trabalho autonomo',
  extractFactsFromText('Sou autônomo', 'qualification_renda')['regime_trabalho'],
  'autonomo');

eq('R4: "freelancer" → regime_trabalho autonomo',
  extractFactsFromText('Trabalho como freelancer', 'qualification_renda')['regime_trabalho'],
  'autonomo');

eq('R5: "aposentado" → regime_trabalho aposentado',
  extractFactsFromText('Sou aposentado', 'qualification_renda')['regime_trabalho'],
  'aposentado');

eq('R6: "aposentadoria" → regime_trabalho aposentado',
  extractFactsFromText('Recebo aposentadoria', 'qualification_renda')['regime_trabalho'],
  'aposentado');

eq('R7: "servidor público" → regime_trabalho servidor',
  extractFactsFromText('Sou servidor público', 'qualification_renda')['regime_trabalho'],
  'servidor');

eq('R8: "funcionário público" → regime_trabalho servidor',
  extractFactsFromText('Trabalho como funcionário público', 'qualification_renda')['regime_trabalho'],
  'servidor');

eq('R9: "informal" → regime_trabalho informal',
  extractFactsFromText('Trabalho informal', 'qualification_renda')['regime_trabalho'],
  'informal');

eq('R10: "bico" → regime_trabalho informal',
  extractFactsFromText('Faço bico', 'qualification_renda')['regime_trabalho'],
  'informal');

const renda3500 = extractFactsFromText('Minha renda é R$ 3.500', 'qualification_renda')['renda_principal'];
check('R11: "R$ 3.500" → renda_principal 3500', renda3500 === 3500, `got: ${renda3500}`);

const renda4mil = extractFactsFromText('Ganho 4 mil por mês', 'qualification_renda')['renda_principal'];
check('R12: "ganho 4 mil" → renda_principal 4000', renda4mil === 4000, `got: ${renda4mil}`);

const renda2500 = extractFactsFromText('Recebo 2500 por mês', 'qualification_renda')['renda_principal'];
check('R13: "recebo 2500" → renda_principal 2500', renda2500 === 2500, `got: ${renda2500}`);

// ── qualification_eligibility ─────────────────────────────────────────────────
console.log('\n── qualification_eligibility ──');

eq('E1: "brasileiro" → nacionalidade brasileiro',
  extractFactsFromText('Sou brasileiro', 'qualification_eligibility')['nacionalidade'],
  'brasileiro');

eq('E2: "brasileira" → nacionalidade brasileiro',
  extractFactsFromText('Sou brasileira', 'qualification_eligibility')['nacionalidade'],
  'brasileiro');

eq('E3: "estrangeiro" → nacionalidade estrangeiro',
  extractFactsFromText('Sou estrangeiro', 'qualification_eligibility')['nacionalidade'],
  'estrangeiro');

eq('E4: "naturalizado" → nacionalidade naturalizado',
  extractFactsFromText('Sou naturalizado', 'qualification_eligibility')['nacionalidade'],
  'naturalizado');

// ── docs_prep ─────────────────────────────────────────────────────────────────
console.log('\n── docs_prep ──');

eq('P1: "por aqui" → docs_channel_choice whatsapp',
  extractFactsFromText('Posso mandar por aqui', 'docs_prep')['docs_channel_choice'],
  'whatsapp');

eq('P2: "whatsapp" → docs_channel_choice whatsapp',
  extractFactsFromText('Mando pelo WhatsApp', 'docs_prep')['docs_channel_choice'],
  'whatsapp');

eq('P3: "site" → docs_channel_choice site',
  extractFactsFromText('Prefiro pelo site', 'docs_prep')['docs_channel_choice'],
  'site');

eq('P4: "link" → docs_channel_choice site',
  extractFactsFromText('Me manda o link', 'docs_prep')['docs_channel_choice'],
  'site');

eq('P5: "presencial" → docs_channel_choice visita_presencial',
  extractFactsFromText('Prefiro ir pessoalmente', 'docs_prep')['docs_channel_choice'],
  'visita_presencial');

eq('P6: "plantão" → docs_channel_choice visita_presencial',
  extractFactsFromText('Posso ir ao plantão', 'docs_prep')['docs_channel_choice'],
  'visita_presencial');

// ── visit ─────────────────────────────────────────────────────────────────────
console.log('\n── visit ──');

eq('V1: "quero visitar" → visit_interest sim',
  extractFactsFromText('Quero visitar o imóvel', 'visit')['visit_interest'],
  'sim');

eq('V2: "sim" → visit_interest sim',
  extractFactsFromText('Sim, quero', 'visit')['visit_interest'],
  'sim');

eq('V3: "não quero" → visit_interest nao',
  extractFactsFromText('Não quero visitar agora', 'visit')['visit_interest'],
  'nao');

eq('V4: "talvez" → visit_interest talvez',
  extractFactsFromText('Talvez depois', 'visit')['visit_interest'],
  'talvez');

eq('V5: "vou ver" → visit_interest talvez',
  extractFactsFromText('Vou ver se consigo', 'visit')['visit_interest'],
  'talvez');

// ── segurança ─────────────────────────────────────────────────────────────────
console.log('\n── segurança ──');

empty('S1: texto vazio retorna {}', extractFactsFromText('', 'discovery'));
empty('S2: texto nulo/vazio retorna {}', extractFactsFromText('   ', 'qualification_civil'));
empty('S3: texto sem fact retorna {}', extractFactsFromText('Olá tudo bem?', 'discovery'));
empty('S4: texto sem fact em renda retorna {}', extractFactsFromText('Boa tarde!', 'qualification_renda'));
empty('S5: stages sem heurística retornam {}', extractFactsFromText('dados do doc', 'docs_collection'));
empty('S6: broker_handoff sem heurística retorna {}', extractFactsFromText('tudo certo', 'broker_handoff'));

noThrow('S7: não lança exceção com texto vazio',
  () => extractFactsFromText('', 'discovery'));

noThrow('S8: não lança exceção com texto inválido',
  () => extractFactsFromText('!!!@@@###$$$', 'qualification_renda'));

// Verifica que output não contém secrets
const outputLines: string[] = [];
const origLog = console.log;
const origErr = console.error;
console.log = (...a: unknown[]) => { outputLines.push(a.map(String).join(' ')); origLog(...a); };
console.error = (...a: unknown[]) => { outputLines.push(a.map(String).join(' ')); origErr(...a); };

extractFactsFromText('OPENAI_API_KEY serviceRoleKey META_ACCESS_TOKEN', 'discovery');

console.log = origLog;
console.error = origErr;

const joined = outputLines.join('\n');
check('S9: não vaza OPENAI_API_KEY no output', !joined.includes('OPENAI_API_KEY'));
check('S10: não vaza serviceRoleKey no output', !joined.includes('serviceRoleKey'));

// ── Resultado ─────────────────────────────────────────────────────────────────
console.log(`\n=== Resultado: ${pass} PASS | ${fail} FAIL ===\n`);

if (fail > 0) {
  console.error('smoke:core:text-extractor FALHOU');
  process.exit(1);
}

console.log('smoke:core:text-extractor OK\n');
