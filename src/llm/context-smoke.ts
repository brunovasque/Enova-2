// smoke:llm:context — T9.8
// Verifica LlmContext, buildDynamicSystemPrompt e integração com callLlm (mock).
// Não chama LLM real. Exit 0 = OK.

import { buildDynamicSystemPrompt } from './client.ts';
import type { LlmContext } from './client.ts';
import { callLlm } from './client.ts';

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

function baseContext(overrides: Partial<LlmContext> = {}): LlmContext {
  return {
    stage_current: 'qualification_civil',
    stage_after: 'qualification_renda',
    next_objective: 'Perguntar estado civil e se vai comprar sozinho ou com cônjuge.',
    facts_count: 2,
    facts_summary: {
      customer_goal: 'comprar_imovel',
      estado_civil: 'solteiro',
    },
    speech_intent: 'solicitar_estado_civil',
    ...overrides,
  };
}

async function main(): Promise<void> {
  console.log('\n=== smoke:llm:context — T9.8 ===\n');

  // ─── Bloco 1: buildDynamicSystemPrompt — estrutura básica ─────────────────

  console.log('── Bloco 1: buildDynamicSystemPrompt — estrutura básica ──');

  const ctx1 = baseContext();
  const prompt1 = buildDynamicSystemPrompt(ctx1);

  check('1.1: retorna string não vazia', typeof prompt1 === 'string' && prompt1.length > 0);
  check('1.2: contém regra base (Não aprove)', prompt1.includes('Não aprove financiamento'));
  check('1.3: contém stage_current', prompt1.includes('qualification_civil'));
  check('1.4: contém stage_after', prompt1.includes('qualification_renda'));
  check('1.5: contém next_objective', prompt1.includes('Perguntar estado civil'));
  check('1.6: contém speech_intent', prompt1.includes('solicitar_estado_civil'));
  check('1.7: contém facts listados', prompt1.includes('customer_goal') && prompt1.includes('estado_civil'));
  check('1.8: tamanho ≤ 4800 chars (orçamento 1200 tokens)', prompt1.length <= 4800, `len=${prompt1.length}`);

  // ─── Bloco 2: sanitização de valores sensíveis ────────────────────────────

  console.log('\n── Bloco 2: sanitização de valores sensíveis ──');

  const ctx2 = baseContext({
    facts_summary: {
      renda_principal: 'informado(a)',
      cpf: 'informado(a)',
      estado_civil: 'solteiro',
    },
  });
  const prompt2 = buildDynamicSystemPrompt(ctx2);

  check('2.1: prompt não contém valor bruto renda_principal numérico', !/renda_principal:\s*\d/.test(prompt2));
  check('2.2: renda_principal não expõe 3500', !prompt2.includes('3500'));
  check('2.3: cpf não expõe número real', !prompt2.includes('000.000'));
  check('2.4: estado_civil preservado', prompt2.includes('solteiro'));

  // ─── Bloco 3: edge cases ─────────────────────────────────────────────────

  console.log('\n── Bloco 3: edge cases ──');

  const ctxNoFacts = baseContext({ facts_summary: {}, facts_count: 0, speech_intent: undefined });
  const promptNoFacts = buildDynamicSystemPrompt(ctxNoFacts);
  check('3.1: sem facts — ainda retorna string válida', typeof promptNoFacts === 'string' && promptNoFacts.length > 0);
  check('3.2: sem facts — contém regra base', promptNoFacts.includes('Não aprove'));
  check('3.3: sem speech_intent — não lança exceção', promptNoFacts.length > 0);

  const ctxSameStage = baseContext({ stage_after: 'qualification_civil' });
  const promptSameStage = buildDynamicSystemPrompt(ctxSameStage);
  check('3.4: stage_after = stage_current — não duplica seção de próxima etapa', !promptSameStage.includes('Próxima etapa'));

  const manyFacts: Record<string, string> = {};
  for (let i = 0; i < 20; i++) manyFacts[`fact_${i}`] = `val_${i}`;
  const ctxManyFacts = baseContext({ facts_summary: manyFacts, facts_count: 20 });
  const promptManyFacts = buildDynamicSystemPrompt(ctxManyFacts);
  check('3.5: com 20 facts — ainda ≤ 4800 chars', promptManyFacts.length <= 4800, `len=${promptManyFacts.length}`);
  check('3.6: com 20 facts — máx 8 listados', (promptManyFacts.match(/  - fact_/g) ?? []).length <= 8);

  // ─── Bloco 4: callLlm — sem API key, retorna erro sem lançar ──────────────

  console.log('\n── Bloco 4: callLlm — contrato de erro sem API key ──');

  const result4a = await callLlm('Olá', {});
  check('4.1: sem API key → ok=false', result4a.ok === false);
  check('4.2: sem API key → llm_invoked=false', result4a.llm_invoked === false);
  check('4.3: sem API key → error = openai_api_key_missing', result4a.error === 'openai_api_key_missing');

  const result4b = await callLlm('Olá', {}, baseContext());
  check('4.4: sem API key + context → também retorna error limpo', result4b.ok === false && result4b.llm_invoked === false);

  // ─── Bloco 5: callLlm — mensagem vazia ────────────────────────────────────

  console.log('\n── Bloco 5: callLlm — mensagem vazia ──');

  const result5 = await callLlm('   ', { OPENAI_API_KEY: 'sk-fake-smoke' });
  check('5.1: mensagem vazia → ok=false', result5.ok === false);
  check('5.2: mensagem vazia → llm_invoked=false', result5.llm_invoked === false);
  check('5.3: mensagem vazia → error = user_message_empty', result5.error === 'user_message_empty');

  // ─── Bloco 6: Segurança — output não vaza secrets ─────────────────────────

  console.log('\n── Bloco 6: segurança — sem secrets no output ──');

  const serialized = JSON.stringify([result4a, result4b, result5]);
  check('6.1: output não contém sk- de credencial', !(/sk-[A-Za-z0-9_\-]{10,}/.test(serialized)));
  check('6.2: output não contém Bearer token', !(/Bearer\s+\S{10,}/.test(serialized)));
  check('6.3: output não contém OPENAI_API_KEY', !serialized.includes('OPENAI_API_KEY'));

  const secretInPrompt = buildDynamicSystemPrompt(baseContext());
  check('6.4: prompt dinâmico não contém sk-', !(/sk-[A-Za-z0-9_\-]{10,}/.test(secretInPrompt)));
  check('6.5: prompt dinâmico não contém Bearer', !(/Bearer\s+\S{10,}/.test(secretInPrompt)));

  // ─── Resultado ────────────────────────────────────────────────────────────

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`RESULTADO: ${pass} PASS | ${fail} FAIL`);
  console.log(`─────────────────────────────────────────────`);

  if (fail > 0) {
    console.error('\n✗ SMOKE FALHOU — smoke:llm:context NÃO confirmado.');
    process.exit(1);
  }

  console.log('\n✓ smoke:llm:context OK — LlmContext e buildDynamicSystemPrompt validados.');
  process.exit(0);
}

main().catch((e) => {
  console.error('SMOKE EXCEPTION:', String(e));
  process.exit(1);
});
