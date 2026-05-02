// smoke:llm:output-guard — T9.9
// Verifica applyOutputGuard: bloqueios, avisos, anti-falso-positivo e segurança.
// Módulo puro — nenhum I/O, nenhuma chamada real. Exit 0 = OK.

import { applyOutputGuard } from './output-guard.ts';
import type { LlmOutputGuardResult, LlmGuardReasonCode } from './output-guard.ts';

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

function hasCode(result: LlmOutputGuardResult, code: LlmGuardReasonCode): boolean {
  return result.reason_codes.includes(code);
}

console.log('\n=== smoke:llm:output-guard — T9.9 ===\n');

// ─── Bloco 1: textos bloqueantes — promessa de aprovação ──────────────────

console.log('── Bloco 1: promessa de aprovação ──');

const r1a = applyOutputGuard('Você foi aprovado para o financiamento!');
check('1.1: promessa direta → blocked', r1a.blocked === true);
check('1.2: promessa direta → allowed=false', r1a.allowed === false);
check('1.3: promessa direta → reason approval_promise', hasCode(r1a, 'approval_promise'));
check('1.4: promessa direta → safe_reply_text undefined', r1a.safe_reply_text === undefined);
check('1.5: replacement_used=false (nunca inventa)', r1a.replacement_used === false);

const r1b = applyOutputGuard('Você está aprovada para o MCMV!');
check('1.6: "está aprovada" → blocked', r1b.blocked === true);
check('1.7: "está aprovada" → approval_promise', hasCode(r1b, 'approval_promise'));

const r1c = applyOutputGuard('Tenho certeza que vai ser aprovado!');
check('1.8: certeza de aprovação → blocked', r1c.blocked === true);
check('1.9: certeza de aprovação → approval_promise', hasCode(r1c, 'approval_promise'));

// ─── Bloco 2: textos bloqueantes — crédito e garantia ─────────────────────

console.log('\n── Bloco 2: crédito aprovado e garantia ──');

const r2a = applyOutputGuard('Seu crédito foi aprovado, parabéns!');
check('2.1: crédito aprovado → blocked', r2a.blocked === true);
check('2.2: crédito aprovado → credit_approved', hasCode(r2a, 'credit_approved'));

const r2b = applyOutputGuard('Garantimos o seu financiamento pelo MCMV.');
check('2.3: garantia de financiamento → blocked', r2b.blocked === true);
check('2.4: garantia de financiamento → financing_guarantee', hasCode(r2b, 'financing_guarantee'));

// ─── Bloco 3: textos bloqueantes — dados internos ─────────────────────────

console.log('\n── Bloco 3: dados internos ──');

const r3a = applyOutputGuard('Seu identificador é abc12345-1234-1234-1234-abcdef123456.');
check('3.1: UUID → blocked', r3a.blocked === true);
check('3.2: UUID → internal_id_exposed', hasCode(r3a, 'internal_id_exposed'));

const r3b = applyOutputGuard('Você está na etapa qualification_civil do sistema.');
check('3.3: stage name → blocked', r3b.blocked === true);
check('3.4: stage name → internal_stage_exposed', hasCode(r3b, 'internal_stage_exposed'));

const r3c = applyOutputGuard('Seu CPF 123.456.789-09 foi localizado.');
check('3.5: CPF → blocked', r3c.blocked === true);
check('3.6: CPF → pii_cpf_exposed', hasCode(r3c, 'pii_cpf_exposed'));

// ─── Bloco 4: textos bloqueantes — secrets ────────────────────────────────

console.log('\n── Bloco 4: secrets e tokens ──');

const r4a = applyOutputGuard('Use o token Bearer abcdefghijklmnopqrstuvwxyz123 para acessar.');
check('4.1: Bearer token longo → blocked', r4a.blocked === true);
check('4.2: Bearer token longo → secret_token_exposed', hasCode(r4a, 'secret_token_exposed'));

const r4b = applyOutputGuard('Texto vazio:');
const r4empty = applyOutputGuard('   ');
check('4.3: texto vazio (espaços) → blocked', r4empty.blocked === true);
check('4.4: texto vazio → empty_text', hasCode(r4empty, 'empty_text'));
check('4.5: texto vazio → allowed=false', r4empty.allowed === false);

// ─── Bloco 5: anti-falso-positivo — textos permitidos ─────────────────────

console.log('\n── Bloco 5: anti-falso-positivo — textos bons ──');

const r5a = applyOutputGuard('O processo de aprovação depende da análise da Caixa Econômica.');
check('5.1: "aprovação" em contexto educativo → allowed', r5a.allowed === true);
check('5.2: "aprovação" educativo → not blocked', r5a.blocked === false);

const r5b = applyOutputGuard('Pode ser que você seja elegível, mas quem decide é o banco.');
check('5.3: condicional de elegibilidade → allowed', r5b.allowed === true);

const r5c = applyOutputGuard('O banco aprova ou nega com base na sua renda e histórico.');
check('5.4: "aprova" terceiro agente → allowed', r5c.allowed === true);

const r5d = applyOutputGuard('Não posso dizer que você está aprovado, isso é responsabilidade da Caixa.');
check('5.5: negação de aprovação → allowed', r5d.allowed === true, `blocked=${r5d.blocked}`);

const r5e = applyOutputGuard('Oi! Tudo bem? Pode me contar um pouco mais sobre o que você está buscando?');
check('5.6: resposta natural simples → allowed', r5e.allowed === true);
check('5.7: resposta natural simples → not warned', r5e.warned === false);

// ─── Bloco 6: avisos (warn — não bloqueiam) ────────────────────────────────

console.log('\n── Bloco 6: avisos (warn) ──');

const longText = 'x'.repeat(1001);
const r6a = applyOutputGuard(longText);
check('6.1: texto >1000 chars → allowed (warn)', r6a.allowed === true);
check('6.2: texto >1000 chars → warned=true', r6a.warned === true);
check('6.3: texto >1000 chars → text_too_long', hasCode(r6a, 'text_too_long'));
check('6.4: texto >1000 chars → safe_reply_text presente', r6a.safe_reply_text !== undefined);

const r6b = applyOutputGuard(
  'Me envie o holerite do mês passado para continuar.',
  { stage_current: 'discovery' },
);
check('6.5: pedido doc em discovery → allowed (warn)', r6b.allowed === true, `blocked=${r6b.blocked}`);
check('6.6: pedido doc em discovery → warned=true', r6b.warned === true);
check('6.7: pedido doc em discovery → document_request_out_of_stage', hasCode(r6b, 'document_request_out_of_stage'));

const r6c = applyOutputGuard(
  'Me envie o holerite do mês passado para continuar.',
  { stage_current: 'docs_prep' },
);
check('6.8: pedido doc em docs_prep → allowed sem warn', r6c.allowed === true);
check('6.9: pedido doc em docs_prep → document warn ausente', !hasCode(r6c, 'document_request_out_of_stage'));

// ─── Bloco 7: shape e segurança do resultado ──────────────────────────────

console.log('\n── Bloco 7: shape e segurança ──');

const r7a = applyOutputGuard('Olá! Posso ajudar com informações sobre o MCMV.');
check('7.1: result.allowed é boolean', typeof r7a.allowed === 'boolean');
check('7.2: result.blocked é boolean', typeof r7a.blocked === 'boolean');
check('7.3: result.warned é boolean', typeof r7a.warned === 'boolean');
check('7.4: result.reason_codes é array', Array.isArray(r7a.reason_codes));
check('7.5: result.replacement_used é false', r7a.replacement_used === false);
check('7.6: texto bom → safe_reply_text = input', r7a.safe_reply_text === 'Olá! Posso ajudar com informações sobre o MCMV.');

// Verificar que o output do guard não contém secrets
const serialized = JSON.stringify([r1a, r2a, r3a, r4a, r4empty]);
check('7.7: output não contém sk-', !(/sk-[A-Za-z0-9_\-]{10,}/.test(serialized)));
check('7.8: output não contém Bearer token', !(/Bearer\s+\S{10,}/.test(serialized)));

// ─── Resultado final ───────────────────────────────────────────────────────

console.log(`\n─────────────────────────────────────────────`);
console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL`);
console.log(`─────────────────────────────────────────────`);

if (fail > 0) {
  console.error('\n✗ SMOKE FALHOU — smoke:llm:output-guard NÃO confirmado.');
  process.exit(1);
}

console.log('\n✓ smoke:llm:output-guard OK — Output Guard validado.');
process.exit(0);
