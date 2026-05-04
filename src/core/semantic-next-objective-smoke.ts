/**
 * ENOVA 2 — Core Mecânico 2 — Smoke do Mapper Semântico de next_objective (T9.15F)
 *
 * Prova que o mapper semântico converte corretamente os códigos opacos
 * do Core em instruções acionáveis para a LLM.
 *
 * ESCOPO: testa apenas o mapper (toSemanticNextObjective) e a rota realista
 * Core → mapper → instrução semântica.
 *
 * INVIOLÁVEL: nenhum cenário acessa I/O externo.
 * O Core emite códigos estruturais — o mapper traduz — LLM recebe instrução humana.
 */

import { toSemanticNextObjective, hasSemanticMapping } from './semantic-next-objective.ts';
import { runCoreEngine } from './engine.ts';
import type { LeadState } from './types.ts';

// ---------------------------------------------------------------------------
// Utilitários de assertion
// ---------------------------------------------------------------------------

interface Assertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

function assert(description: string, expected: unknown, actual: unknown): Assertion {
  return { description, expected, actual, passed: expected === actual };
}

interface SmokeResult {
  scenario: string;
  passed: boolean;
  assertions: Assertion[];
}

function makeState(stage: LeadState['current_stage'], facts: Record<string, unknown> = {}): LeadState {
  return { lead_id: 'semantic-smoke-001', current_stage: stage, facts };
}

// ---------------------------------------------------------------------------
// BLOCO 1 — Mapper unitário: cada código mapeado
// ---------------------------------------------------------------------------

function smokeMapper_ColetarCustomerGoal(): SmokeResult {
  const code = 'coletar_customer_goal';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: coletar_customer_goal',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar se o cliente tem interesse em comprar um imóvel pelo Minha Casa Minha Vida.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_ExplicarMcmvEColetarNome(): SmokeResult {
  const code = 'explicar_mcmv_e_coletar_nome_completo';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: explicar_mcmv_e_coletar_nome_completo',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Explicar rapidamente que o Minha Casa Minha Vida pode facilitar a compra do imóvel com condições melhores conforme o perfil e pedir o nome completo.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_PerguntarNacionalidade(): SmokeResult {
  const code = 'perguntar_nacionalidade';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: perguntar_nacionalidade',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar se o cliente é brasileiro(a) ou estrangeiro(a).',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_PerguntarRnmEValidade(): SmokeResult {
  const code = 'perguntar_rnm_e_validade';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: perguntar_rnm_e_validade',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar se o cliente estrangeiro possui RNM válido e se o documento é por prazo indeterminado.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_AvancarParaCivil_SemiSemantico(): SmokeResult {
  const code = 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: AVANCAR_PARA_CIVIL (semi-semântico → padroniza com "(a)")',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna versão canônica com "(a)"',
        'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
        result,
      ),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_ColetarEstadoCivil(): SmokeResult {
  const code = 'coletar_estado_civil';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: coletar_estado_civil',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_AvancarParaQualificationCivil(): SmokeResult {
  const code = 'avancar_para_qualification_civil';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: avancar_para_qualification_civil',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
        result,
      ),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_ColetarProcesso(): SmokeResult {
  const code = 'coletar_processo';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: coletar_processo',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar se pretende comprar sozinho(a) ou com alguém.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_AvancarParaQualificationRenda(): SmokeResult {
  const code = 'avancar_para_qualification_renda';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: avancar_para_qualification_renda',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar regime de trabalho e renda mensal.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_ColetarRegimeTrabalho(): SmokeResult {
  const code = 'coletar_regime_trabalho';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: coletar_regime_trabalho',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_ColetarRendaPrincipal(): SmokeResult {
  const code = 'coletar_renda_principal';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper unitário: coletar_renda_principal',
    passed: true,
    assertions: [
      assert('tem mapeamento definido', true, hasSemanticMapping(code)),
      assert(
        'retorna instrução semântica correta',
        'Perguntar a renda mensal aproximada.',
        result,
      ),
      assert('não retorna o código opaco', false, result === code),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeMapper_CodigoDesconhecido_RetornaOriginal(): SmokeResult {
  const code = 'coletar_algum_facto_desconhecido_xyz';
  const result = toSemanticNextObjective(code);
  return {
    scenario: 'Mapper: código desconhecido retorna original sem modificação (lacuna documentada)',
    passed: true,
    assertions: [
      assert('não tem mapeamento definido', false, hasSemanticMapping(code)),
      assert('retorna código original', code, result),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// BLOCO 2 — Rota realista: Core → mapper → instrução semântica
// ---------------------------------------------------------------------------

function smokeRota_CustomerGoalSemNome(): SmokeResult {
  const state = makeState('discovery', { customer_goal: 'comprar_imovel' });
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 1: customer_goal sem nome → objetivo pede nome (semântico)',
    passed: true,
    assertions: [
      assert('Core bloqueia em nome_completo', true, decision.block_advance),
      assert('Core emite código opaco', 'explicar_mcmv_e_coletar_nome_completo', decision.next_objective),
      assert(
        'Mapper converte para instrução semântica',
        'Explicar rapidamente que o Minha Casa Minha Vida pode facilitar a compra do imóvel com condições melhores conforme o perfil e pedir o nome completo.',
        semantic,
      ),
      assert('LLM não recebe código opaco', false, semantic === decision.next_objective),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeRota_NomePresente_NacionalidadeAusente(): SmokeResult {
  const state = makeState('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Bruno Vasques',
  });
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 2: customer_goal + nome sem nacionalidade → objetivo pergunta nacionalidade',
    passed: true,
    assertions: [
      assert('Core bloqueia em nacionalidade', true, decision.block_advance),
      assert('Core emite código opaco', 'perguntar_nacionalidade', decision.next_objective),
      assert(
        'Mapper converte para instrução semântica',
        'Perguntar se o cliente é brasileiro(a) ou estrangeiro(a).',
        semantic,
      ),
      assert('LLM não recebe código opaco', false, semantic === decision.next_objective),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeRota_NomeNacionalidadeBrasileiro_PerguntaEstadoCivil(): SmokeResult {
  const state = makeState('discovery', {
    customer_goal: 'comprar_imovel',
    nome_completo: 'Bruno Vasques',
    nacionalidade: 'brasileiro',
  });
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 3: customer_goal + nome + brasileiro → objetivo pergunta estado civil',
    passed: true,
    assertions: [
      assert('Core avança (topo completo)', false, decision.block_advance),
      assert('stage_after = qualification_civil', 'qualification_civil', decision.stage_after),
      assert(
        'Mapper entrega instrução semântica de estado civil',
        'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
        semantic,
      ),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeRota_QualCivilSemEstadoCivil(): SmokeResult {
  const state = makeState('qualification_civil', {});
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 4: qualification_civil sem estado_civil → objetivo pergunta estado civil',
    passed: true,
    assertions: [
      assert('Core bloqueia em estado_civil', true, decision.block_advance),
      assert('Core emite código opaco', 'coletar_estado_civil', decision.next_objective),
      assert(
        'Mapper converte para instrução semântica',
        'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
        semantic,
      ),
      assert('LLM não recebe código opaco', false, semantic === decision.next_objective),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeRota_QualCivilEstadoCivilSemProcesso(): SmokeResult {
  const state = makeState('qualification_civil', { estado_civil: 'solteiro' });
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 5: qualification_civil com estado_civil sem processo → objetivo pergunta se compra sozinho',
    passed: true,
    assertions: [
      assert('Core bloqueia em processo', true, decision.block_advance),
      assert('Core emite código opaco', 'coletar_processo', decision.next_objective),
      assert(
        'Mapper converte para instrução semântica',
        'Perguntar se pretende comprar sozinho(a) ou com alguém.',
        semantic,
      ),
      assert('LLM não recebe código opaco', false, semantic === decision.next_objective),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeRota_QualRendaSemRegime(): SmokeResult {
  const state = makeState('qualification_renda', { renda_principal: 3000 });
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 6: qualification_renda sem regime → objetivo pergunta regime',
    passed: true,
    assertions: [
      assert('Core bloqueia em regime_trabalho', true, decision.block_advance),
      assert('Core emite código opaco', 'coletar_regime_trabalho', decision.next_objective),
      assert(
        'Mapper converte para instrução semântica',
        'Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime.',
        semantic,
      ),
      assert('LLM não recebe código opaco', false, semantic === decision.next_objective),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

function smokeRota_QualRendaSemRenda(): SmokeResult {
  const state = makeState('qualification_renda', { regime_trabalho: 'clt' });
  const decision = runCoreEngine(state);
  const semantic = toSemanticNextObjective(decision.next_objective);

  return {
    scenario: 'Rota realista 7: qualification_renda sem renda → objetivo pergunta renda',
    passed: true,
    assertions: [
      assert('Core bloqueia em renda_principal', true, decision.block_advance),
      assert('Core emite código opaco', 'coletar_renda_principal', decision.next_objective),
      assert(
        'Mapper converte para instrução semântica',
        'Perguntar a renda mensal aproximada.',
        semantic,
      ),
      assert('LLM não recebe código opaco', false, semantic === decision.next_objective),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Runner da suite
// ---------------------------------------------------------------------------

interface SmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: SmokeResult[];
  executed_at: string;
}

function runSemanticObjectiveSuite(): SmokeSuiteResult {
  const scenarios = [
    // Bloco 1 — Mapper unitário
    smokeMapper_ColetarCustomerGoal,
    smokeMapper_ExplicarMcmvEColetarNome,
    smokeMapper_PerguntarNacionalidade,
    smokeMapper_PerguntarRnmEValidade,
    smokeMapper_AvancarParaCivil_SemiSemantico,
    smokeMapper_ColetarEstadoCivil,
    smokeMapper_AvancarParaQualificationCivil,
    smokeMapper_ColetarProcesso,
    smokeMapper_AvancarParaQualificationRenda,
    smokeMapper_ColetarRegimeTrabalho,
    smokeMapper_ColetarRendaPrincipal,
    smokeMapper_CodigoDesconhecido_RetornaOriginal,
    // Bloco 2 — Rota realista Core → mapper → semântico
    smokeRota_CustomerGoalSemNome,
    smokeRota_NomePresente_NacionalidadeAusente,
    smokeRota_NomeNacionalidadeBrasileiro_PerguntaEstadoCivil,
    smokeRota_QualCivilSemEstadoCivil,
    smokeRota_QualCivilEstadoCivilSemProcesso,
    smokeRota_QualRendaSemRegime,
    smokeRota_QualRendaSemRenda,
  ];

  const results = scenarios.map((fn) => {
    const r = fn();
    return { ...r, passed: r.assertions.every((a) => a.passed) };
  });

  const passed = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    all_passed: passed === results.length,
    results,
    executed_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Ponto de entrada
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('semantic-next-objective-smoke.ts')) {
  const suite = runSemanticObjectiveSuite();

  console.log('\n===========================================');
  console.log('ENOVA 2 — Mapper Semântico de next_objective (T9.15F)');
  console.log('===========================================');
  console.log(`Âncora: T9.15F — fix next_objective opaco → instrução semântica para LLM`);
  console.log(`Executado em: ${suite.executed_at}`);
  console.log(`Total: ${suite.total} | Passou: ${suite.passed} | Falhou: ${suite.failed}`);
  console.log(`Resultado: ${suite.all_passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  for (const r of suite.results) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.scenario}`);
    for (const a of r.assertions) {
      console.log(`   ${a.passed ? '✓' : '✗'} ${a.description}`);
      if (!a.passed) {
        console.log(`      Esperado: ${JSON.stringify(a.expected)}`);
        console.log(`      Obtido:   ${JSON.stringify(a.actual)}`);
      }
    }
    console.log('');
  }

  if (!suite.all_passed) process.exit(1);
}
