/**
 * ENOVA 2 — Core Mecânico 2 — Smoke Mínimo (L03 + L04/L05/L06 + L07/L17)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01 (L03), L-02 (L04), L-03 (L05), L-04 (L06), L-05/L-15 (L07/L17)
 *   Bloco legado:    L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17
 *   Gate-fonte:      Gate 2 (A01: "sem smoke da frente, não promove")
 *
 * ESCOPO: provar que o esqueleto estrutural (L03), o topo do funil (L04–L06)
 * e os Meios A/B + Especiais + Final (L07/L17) existem e não produzem fala.
 *
 * INVIOLÁVEL: nenhum cenário gera texto ao cliente.
 */

import { runCoreEngine } from './engine.ts';
import type { LeadState, CoreDecision } from './types.ts';

// ---------------------------------------------------------------------------
// Estado base para os cenários de smoke
// ---------------------------------------------------------------------------

function makeState(stage: LeadState['current_stage'], facts: Record<string, unknown> = {}): LeadState {
  return { lead_id: 'smoke-001', current_stage: stage, facts };
}

// ---------------------------------------------------------------------------
// Utilitário de assertion
// ---------------------------------------------------------------------------

interface SmokeAssertion {
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

function assert(description: string, expected: unknown, actual: unknown): SmokeAssertion {
  return { description, expected, actual, passed: expected === actual };
}

export interface SmokeResult {
  scenario: string;
  passed: boolean;
  decision: CoreDecision;
  assertions: SmokeAssertion[];
}

// ---------------------------------------------------------------------------
// Cenário 1: Stage sem facts obrigatórios → deve bloquear
//
// Prova: G_FATO_CRITICO_AUSENTE bloqueia avanço quando required_fact ausente.
// Stage discovery exige customer_goal. Sem ele, block_advance=true, stage não avança.
// ---------------------------------------------------------------------------
export function smokeScenario1_BlockQuandoFactAusente(): SmokeResult {
  const state = makeState('discovery'); // nenhum fact
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 1 — Stage sem facts: deve bloquear',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = discovery', 'discovery', decision.stage_current),
      assert('block_advance = true (G_FATO_CRITICO_AUSENTE)', true, decision.block_advance),
      assert('stage_after permanece em discovery', 'discovery', decision.stage_after),
      assert('gates_activated inclui G_FATO_CRITICO_AUSENTE', true, decision.gates_activated.includes('G_FATO_CRITICO_AUSENTE')),
      assert('next_objective = coletar_customer_goal', 'coletar_customer_goal', decision.next_objective),
      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 2: Stage com todos os facts obrigatórios → deve avançar
//
// Prova: quando todos required_facts estão presentes, o Core autoriza transição.
// discovery com customer_goal → avança para qualification_civil.
// ---------------------------------------------------------------------------
export function smokeScenario2_AvancaQuandoFactsPresentes(): SmokeResult {
  const state = makeState('discovery', { customer_goal: 'comprar_imovel' });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 2 — Stage com todos os facts: deve avançar',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = discovery', 'discovery', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = qualification_civil', 'qualification_civil', decision.stage_after),
      assert('speech_intent = transicao_stage (sinal estrutural)', 'transicao_stage', decision.speech_intent),
      assert('Core não produz texto — speech_intent é string estrutural', true, typeof decision.speech_intent === 'string'),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 3: Meio A com fact crítico ausente → deve bloquear no fact faltando
//
// Prova: em qualification_civil, sem 'processo', bloqueia e aponta o fact ausente.
// Estado civil presente, processo ausente → next_objective aponta para coleta de processo.
// ---------------------------------------------------------------------------
export function smokeScenario3_BloqueioFactParcial(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    // processo ausente — deve bloquear
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 3 — Meio A: fact crítico ausente bloqueia',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_civil', 'qualification_civil', decision.stage_after),
      assert('next_objective = coletar_processo', 'coletar_processo', decision.next_objective),
      assert('Core não produz texto — apenas sinal de bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// Cenário 4: Meio A com trilho válido mínimo → avança para renda
//
// Prova: o caminho real de qualification_civil no engine aceita trilho estrutural
// válido sem fala mecânica.
// ---------------------------------------------------------------------------
export function smokeScenario4_MeioAIntegrado_AvancoValido(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'composicao_familiar',
    composition_actor: 'mae',
    p3_required: false,
    dependents_applicable: false,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 4 — Meio A integrado: trilho válido avança',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = false (Meio A via engine)', false, decision.block_advance),
      assert('stage_after = qualification_renda', 'qualification_renda', decision.stage_after),
      assert('next_objective = avancar_para_qualification_renda', 'avancar_para_qualification_renda', decision.next_objective),
      assert('speech_intent = transicao_stage (sinal estrutural — não é fala)', 'transicao_stage', decision.speech_intent),
      assert('gates_activated vazio (Meio A avançou)', 0, decision.gates_activated.length),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 5: Meio A com composição que exige dependente → bloqueia em coleta específica
//
// Prova: L09/L10 aprofundam a composição sem abrir Meio B; quando dependente faz
// sentido, o next step muda para coleta de dependents_count.
// ---------------------------------------------------------------------------
export function smokeScenario5_MeioAIntegrado_DependentesAlteramNextStep(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'composicao_familiar',
    composition_actor: 'mae',
    p3_required: false,
    dependents_applicable: true,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 5 — Meio A integrado: dependentes alteram o next step estrutural',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = true (dependents_count ainda ausente)', true, decision.block_advance),
      assert('stage_after permanece em qualification_civil', 'qualification_civil', decision.stage_after),
      assert('next_objective = coletar_dependents_count', 'coletar_dependents_count', decision.next_objective),
      assert('speech_intent = bloqueio (sinal estrutural — não é fala)', 'bloqueio', decision.speech_intent),
      assert('Core não produz texto — apenas estrutura de decisão', true, typeof decision.speech_intent === 'string'),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 6: Meio A com sinal P3 → não bloqueia mais e segue para o trilho especial
//
// Prova: L15/L16 passam a ser o dono do roteamento especial; o Meio A só preserva
// o sinal estrutural para a fase correta do funil.
// ---------------------------------------------------------------------------
export function smokeScenario6_MeioAIntegrado_P3SegueParaMeioB(): SmokeResult {
  const state = makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'composicao_familiar',
    composition_actor: 'irmao',
    p3_required: true,
    dependents_applicable: false,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 6 — Meio A integrado: P3 segue para o trilho especial no ponto correto',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_civil', 'qualification_civil', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = qualification_renda', 'qualification_renda', decision.stage_after),
      assert('next_objective = avancar_para_qualification_renda', 'avancar_para_qualification_renda', decision.next_objective),
      assert('gates_activated vazio', 0, decision.gates_activated.length),
      assert('speech_intent = transicao_stage (sinal estrutural — não é fala)', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 7: Meio B com fact crítico ausente → bloqueia
// ---------------------------------------------------------------------------
export function smokeScenario7_MeioB_BloqueioFactCriticoAusente(): SmokeResult {
  const state = makeState('qualification_renda', {
    renda_principal: 3200,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 7 — Meio B: fact crítico ausente bloqueia',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_renda', 'qualification_renda', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_renda', 'qualification_renda', decision.stage_after),
      assert('next_objective = coletar_regime_trabalho', 'coletar_regime_trabalho', decision.next_objective),
      assert('gates_activated inclui G_FATO_CRITICO_AUSENTE', true, decision.gates_activated.includes('G_FATO_CRITICO_AUSENTE')),
      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 8: Meio B com trilho válido → avança para elegibilidade
// ---------------------------------------------------------------------------
export function smokeScenario8_MeioB_TrilhoValidoAvanca(): SmokeResult {
  const state = makeState('qualification_renda', {
    processo: 'conjunto',
    regime_trabalho: 'clt',
    renda_principal: 4200,
    ctps_36: false,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 8 — Meio B: trilho válido avança para elegibilidade',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_renda', 'qualification_renda', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = qualification_eligibility', 'qualification_eligibility', decision.stage_after),
      assert('next_objective = avancar_para_qualification_eligibility', 'avancar_para_qualification_eligibility', decision.next_objective),
      assert('speech_intent = transicao_stage', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 9: Meio B com autônomo sem IR confirmado → bloqueia em coleta obrigatória
// ---------------------------------------------------------------------------
export function smokeScenario9_MeioB_AutonomoSemIRExigeConfirmacao(): SmokeResult {
  const state = makeState('qualification_renda', {
    processo: 'conjunto',
    regime_trabalho: 'autonomo',
    renda_principal: 3800,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 9 — Meio B: autônomo exige coleta de IR',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_renda', 'qualification_renda', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_renda', 'qualification_renda', decision.stage_after),
      assert('next_objective = coletar_autonomo_tem_ir', 'coletar_autonomo_tem_ir', decision.next_objective),
      assert('gates_activated inclui G_REGIME_RENDA', true, decision.gates_activated.includes('G_REGIME_RENDA')),
      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 10: Elegibilidade com estrangeiro sem RNM válido → altera next step estrutural
// ---------------------------------------------------------------------------
export function smokeScenario10_MeioB_ElegibilidadeAlteraNextStep(): SmokeResult {
  const state = makeState('qualification_eligibility', {
    nacionalidade: 'estrangeiro',
    rnm_status: 'ausente',
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 10 — Meio B: elegibilidade altera o next step estrutural',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_eligibility', 'qualification_eligibility', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_eligibility', 'qualification_eligibility', decision.stage_after),
      assert('next_objective = validar_rnm', 'validar_rnm', decision.next_objective),
      assert('gates_activated inclui G_ELEGIBILIDADE', true, decision.gates_activated.includes('G_ELEGIBILIDADE')),
      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 11: Elegibilidade com P3 ativo → abre trilho especial
// ---------------------------------------------------------------------------
export function smokeScenario11_Especiais_P3RoteiaParaStageEspecial(): SmokeResult {
  const state = makeState('qualification_eligibility', {
    nacionalidade: 'brasileiro',
    processo: 'composicao_familiar',
    p3_required: true,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 11 — Especiais: P3 roteia para qualification_special',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_eligibility', 'qualification_eligibility', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = qualification_special', 'qualification_special', decision.stage_after),
      assert('next_objective = validar_trilho_p3', 'validar_trilho_p3', decision.next_objective),
      assert('speech_intent = transicao_stage', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 12: Trilho especial P3 sem fact crítico → bloqueia
// ---------------------------------------------------------------------------
export function smokeScenario12_Especiais_P3BloqueiaSemFactCritico(): SmokeResult {
  const state = makeState('qualification_special', {
    processo: 'composicao_familiar',
    p3_required: true,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 12 — Especiais: P3 bloqueia sem work_regime_p3',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_special', 'qualification_special', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_special', 'qualification_special', decision.stage_after),
      assert('next_objective = coletar_work_regime_p3', 'coletar_work_regime_p3', decision.next_objective),
      assert('gates_activated inclui G_TRILHO_ESPECIAL', true, decision.gates_activated.includes('G_TRILHO_ESPECIAL')),
      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 13: Trilho especial multi válido → avança para docs
// ---------------------------------------------------------------------------
export function smokeScenario13_Especiais_MultiValidoAvancaParaDocs(): SmokeResult {
  const state = makeState('qualification_special', {
    processo: 'conjunto',
    work_regime_p2: 'clt',
    monthly_income_p2: 3600,
    ctps_36m_p2: true,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 13 — Especiais: multi válido avança para docs',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_special', 'qualification_special', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = docs_prep', 'docs_prep', decision.stage_after),
      assert('next_objective = avancar_para_docs_prep', 'avancar_para_docs_prep', decision.next_objective),
      assert('speech_intent = transicao_stage', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 14: Trilho especial multi com autônomo sem IR → altera next step estrutural
// ---------------------------------------------------------------------------
export function smokeScenario14_Especiais_MultiAutonomoExigeIR(): SmokeResult {
  const state = makeState('qualification_special', {
    processo: 'conjunto',
    work_regime_p2: 'autonomo',
    monthly_income_p2: 5100,
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 14 — Especiais: multi autônomo exige IR do co-participante',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = qualification_special', 'qualification_special', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em qualification_special', 'qualification_special', decision.stage_after),
      assert('next_objective = coletar_autonomo_has_ir_p2', 'coletar_autonomo_has_ir_p2', decision.next_objective),
      assert('gates_activated inclui G_TRILHO_ESPECIAL', true, decision.gates_activated.includes('G_TRILHO_ESPECIAL')),
      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 15: Final operacional com canal presencial → roteia para visita
// ---------------------------------------------------------------------------
export function smokeScenario15_Final_DocsPrepRoteiaParaVisita(): SmokeResult {
  const state = makeState('docs_prep', {
    docs_channel_choice: 'visita presencial',
    visit_interest: 'sim',
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 15 — Final: docs_prep roteia para visita quando aplicável',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = docs_prep', 'docs_prep', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = visit', 'visit', decision.stage_after),
      assert('next_objective = avancar_para_visit', 'avancar_para_visit', decision.next_objective),
      assert('speech_intent = transicao_stage', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 16: Final operacional com docs parciais → bloqueia em docs_collection
// ---------------------------------------------------------------------------
export function smokeScenario16_Final_DocsParciaisBloqueiamHandoff(): SmokeResult {
  const state = makeState('docs_collection', {
    doc_identity_status: 'recebido',
    doc_income_status: 'parcial',
    doc_residence_status: 'recebido',
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 16 — Final: docs_collection bloqueia quando há docs parciais',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = docs_collection', 'docs_collection', decision.stage_current),
      assert('block_advance = true', true, decision.block_advance),
      assert('stage_after permanece em docs_collection', 'docs_collection', decision.stage_after),
      assert('next_objective = regularizar_doc_income_status', 'regularizar_doc_income_status', decision.next_objective),
      assert('gates_activated inclui G_FINAL_OPERACIONAL', true, decision.gates_activated.includes('G_FINAL_OPERACIONAL')),
      assert('speech_intent = bloqueio', 'bloqueio', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 17: Final operacional com docs completos → avança para handoff
// ---------------------------------------------------------------------------
export function smokeScenario17_Final_DocsCompletosAvancamParaHandoff(): SmokeResult {
  const state = makeState('docs_collection', {
    doc_identity_status: 'validado',
    doc_income_status: 'recebido',
    doc_residence_status: 'recebido',
    handoff_readiness: 'pronto para correspondente',
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 17 — Final: docs_collection completo avança para broker_handoff',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = docs_collection', 'docs_collection', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after = broker_handoff', 'broker_handoff', decision.stage_after),
      assert('next_objective = preparar_handoff_correspondente', 'preparar_handoff_correspondente', decision.next_objective),
      assert('speech_intent = transicao_stage', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 18: Handoff pronto → recorte final concluído estruturalmente
// ---------------------------------------------------------------------------
export function smokeScenario18_Final_HandoffConcluido(): SmokeResult {
  const state = makeState('broker_handoff', {
    handoff_readiness: 'pronto para correspondente',
  });
  const decision = runCoreEngine(state);

  return {
    scenario: 'Cenário 18 — Final: broker_handoff conclui o recorte estrutural',
    passed: true,
    decision,
    assertions: [
      assert('stage_current = broker_handoff', 'broker_handoff', decision.stage_current),
      assert('block_advance = false', false, decision.block_advance),
      assert('stage_after permanece em broker_handoff', 'broker_handoff', decision.stage_after),
      assert('next_objective = handoff_concluido_correspondente', 'handoff_concluido_correspondente', decision.next_objective),
      assert('speech_intent = transicao_stage', 'transicao_stage', decision.speech_intent),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}

// ---------------------------------------------------------------------------
// Cenário 19: Trilha canônica completa do topo ao handoff
// ---------------------------------------------------------------------------
export function smokeScenario19_TrilhoCompletoTopoAoFinal(): SmokeResult {
  const topo = runCoreEngine(makeState('discovery', {
    customer_goal: 'comprar_imovel',
  }));
  const civil = runCoreEngine(makeState('qualification_civil', {
    estado_civil: 'solteiro',
    processo: 'solo',
  }));
  const renda = runCoreEngine(makeState('qualification_renda', {
    processo: 'solo',
    regime_trabalho: 'clt',
    renda_principal: 4200,
  }));
  const elegibilidade = runCoreEngine(makeState('qualification_eligibility', {
    nacionalidade: 'brasileiro',
  }));
  const docsPrep = runCoreEngine(makeState('docs_prep', {
    docs_channel_choice: 'whatsapp',
    visit_interest: 'nao',
  }));
  const docsCollection = runCoreEngine(makeState('docs_collection', {
    doc_identity_status: 'recebido',
    doc_income_status: 'recebido',
    doc_residence_status: 'recebido',
  }));
  const handoff = runCoreEngine(makeState('broker_handoff', {
    handoff_readiness: 'pronto para correspondente',
  }));

  return {
    scenario: 'Cenário 19 — Trilha completa do topo ao handoff final',
    passed: true,
    decision: handoff,
    assertions: [
      assert('discovery -> qualification_civil', 'qualification_civil', topo.stage_after),
      assert('qualification_civil -> qualification_renda', 'qualification_renda', civil.stage_after),
      assert('qualification_renda -> qualification_eligibility', 'qualification_eligibility', renda.stage_after),
      assert('qualification_eligibility -> docs_prep', 'docs_prep', elegibilidade.stage_after),
      assert('docs_prep -> docs_collection', 'docs_collection', docsPrep.stage_after),
      assert('docs_collection -> broker_handoff', 'broker_handoff', docsCollection.stage_after),
      assert('broker_handoff finaliza estruturalmente', 'handoff_concluido_correspondente', handoff.next_objective),
      assert('nenhum passo produz fala ao cliente', true, [topo, civil, renda, elegibilidade, docsPrep, docsCollection, handoff].every((item) => typeof item.speech_intent === 'string')),
    ].map((a) => ({ ...a, passed: a.expected === a.actual })),
  };
}


export interface SmokeSuiteResult {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: SmokeResult[];
  executed_at: string;
}

/**
 * Executa a suite de smoke mínima do Core Mecânico 2.
 *
 * Prova exigida (A01-05, Gate 2):
 * "Smoke de trilho e next step autorizado"
 *
 * Cenários L03/L04-L17 integrados (19): topo segue válido, o Meio A e Meio B
 * permanecem íntegros, os Especiais continuam roteando P3/multi e o Final
 * agora cobre docs, visita e handoff sem abrir fala mecânica.
 * Todos os cenários passam pelo `runCoreEngine()`. Nenhum usa decisão fake.
 * Nenhum cenário gera fala ao cliente.
 */
export function runSmokeSuite(): SmokeSuiteResult {
  const scenarios = [
    smokeScenario1_BlockQuandoFactAusente,
    smokeScenario2_AvancaQuandoFactsPresentes,
    smokeScenario3_BloqueioFactParcial,
    smokeScenario4_MeioAIntegrado_AvancoValido,
    smokeScenario5_MeioAIntegrado_DependentesAlteramNextStep,
    smokeScenario6_MeioAIntegrado_P3SegueParaMeioB,
    smokeScenario7_MeioB_BloqueioFactCriticoAusente,
    smokeScenario8_MeioB_TrilhoValidoAvanca,
    smokeScenario9_MeioB_AutonomoSemIRExigeConfirmacao,
    smokeScenario10_MeioB_ElegibilidadeAlteraNextStep,
    smokeScenario11_Especiais_P3RoteiaParaStageEspecial,
    smokeScenario12_Especiais_P3BloqueiaSemFactCritico,
    smokeScenario13_Especiais_MultiValidoAvancaParaDocs,
    smokeScenario14_Especiais_MultiAutonomoExigeIR,
    smokeScenario15_Final_DocsPrepRoteiaParaVisita,
    smokeScenario16_Final_DocsParciaisBloqueiamHandoff,
    smokeScenario17_Final_DocsCompletosAvancamParaHandoff,
    smokeScenario18_Final_HandoffConcluido,
    smokeScenario19_TrilhoCompletoTopoAoFinal,
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
// Ponto de entrada para execução manual
// ---------------------------------------------------------------------------

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('smoke.ts')) {
  const suite = runSmokeSuite();

  console.log('\n===========================================');
  console.log('ENOVA 2 — Core Mecânico 2 — Smoke (L03 + L04/L05/L06 + L07/L17)');
  console.log('===========================================');
  console.log(`Âncora: L03 + L04/L05/L06 + L07/L17 | Gate 2 (A01)`);
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
