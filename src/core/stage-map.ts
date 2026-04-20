/**
 * ENOVA 2 — Core Mecânico 2 — Mapa de Stages e Gates (L03)
 *
 * Âncora contratual (CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md):
 *   Cláusula-fonte:  L-01
 *   Bloco legado:    L03 — Mapa Canônico do Funil
 *   Gate-fonte:      Gate 2 (A01: sem smoke da frente, não promove)
 *   PDF-fonte:       PDF 6, pp. 7–8 (fases macro recomendadas)
 *                    PDF 7, pp. 2–4 (stack operacional, regras obrigatórias)
 *                    PDF 8, pp. 1–6 (Policy Engine, gates R1–R6)
 *
 * RESTRIÇÃO INVIOLÁVEL: este arquivo modela ESTRUTURA do funil.
 * Nenhuma fala, phrasing, resposta ao cliente ou surface é gerada aqui.
 * (A00 seção 4.2–4.3; CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md seção 4.3)
 */

import type {
  StageId,
  StageDefinition,
  GateId,
  GateResult,
  GateSeverity,
  LeadState,
} from './types.ts';

// ---------------------------------------------------------------------------
// Mapa canônico de stages — derivado de L03
// PDF-fonte: PDF 6, seção 4.1 "Fases macro recomendadas"
// ---------------------------------------------------------------------------

/**
 * Definições canônicas de todos os stages do funil ENOVA 2.
 *
 * Derivado de L03 (Mapa Canônico do Funil).
 * PDF-fonte literal (PDF 6, p. 7):
 * "discovery: entendimento inicial, explicação do programa, enquadramento do lead.
 *  qualification: estado civil, composição, trabalho, renda, dependente, restrição,
 *  elegibilidade documental. docs_prep: escolha de canal e preparação para envio de
 *  documentos. docs_collection: recebimento e consolidação documental.
 *  broker_handoff: preparação do pacote ao correspondente."
 */
export const STAGE_MAP: Record<StageId, StageDefinition> = {
  // -------------------------------------------------------------------------
  // discovery — TOPO do funil
  // PDF-fonte: PDF 6, p. 7 — "discovery: entendimento inicial, explicação do
  // programa, enquadramento do lead."
  // -------------------------------------------------------------------------
  discovery: {
    id: 'discovery',
    name: 'Topo — Discovery',
    description: 'Entendimento inicial, explicação do programa MCMV, enquadramento do lead.',
    required_facts: [
      'customer_goal',  // F7: o que o cliente quer (comprar imóvel, entender programa, etc.)
    ],
    optional_facts: [
      'channel_origin', // F0: de onde veio o lead
      'preferred_name', // F0: como prefere ser chamado
    ],
    next_stages: ['qualification_civil'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
    source_ref: 'PDF 6, seção 4.1; L03 — Mapa Canônico do Funil',
  },

  // -------------------------------------------------------------------------
  // qualification_civil — MEIO A
  // PDF-fonte: PDF 6, p. 7 — "qualification: estado civil, composição..."
  // PDF 7, p. 3 — "Casado civil → forçar processo_conjunto"
  // -------------------------------------------------------------------------
  qualification_civil: {
    id: 'qualification_civil',
    name: 'Meio A — Qualificação Civil',
    description: 'Estado civil, modo de processo (solo/conjunto/composição), composição familiar.',
    required_facts: [
      'estado_civil',   // F2: solteiro, união estável, casado civil, divorciado, viúvo
      'processo',       // F2: solo, conjunto, composicao_familiar
    ],
    optional_facts: [
      'composition_actor', // F2: quem compõe (cônjuge, parceiro, pai)
    ],
    next_stages: ['qualification_renda'],
    applicable_gates: [
      'G_CASADO_CONJUNTO',    // R1: casado_civil → exige processo=conjunto
      'G_FATO_CRITICO_AUSENTE',
    ],
    source_ref: 'PDF 6, seção 4.1; PDF 7, p. 3 (tabela de regras); PDF 8, p. 3 (R1); L03',
  },

  // -------------------------------------------------------------------------
  // qualification_renda — MEIO B (parte 1)
  // PDF-fonte: PDF 6, p. 7 — "qualification: ...trabalho, renda..."
  // PDF 7, p. 3 — "Autônomo → perguntar IR; Solo renda baixa → sugerir composição"
  // -------------------------------------------------------------------------
  qualification_renda: {
    id: 'qualification_renda',
    name: 'Meio B — Qualificação de Renda',
    description: 'Regime de trabalho, renda principal, IR para autônomo, CTPS.',
    required_facts: [
      'regime_trabalho',  // F3: clt, autonomo, servidor, aposentado
      'renda_principal',  // F3: valor da renda principal
    ],
    optional_facts: [
      'autonomo_tem_ir',  // F3: obrigatório apenas se regime_trabalho=autonomo
      'ctps_36',          // F4: CTPS ativo há 36+ meses
    ],
    next_stages: ['qualification_eligibility'],
    applicable_gates: [
      'G_AUTONOMO_IR',        // R2: autonomo → coleta IR obrigatória
      'G_RENDA_SOLO_BAIXA',   // R3: renda<3000 e solo → sinalizar composição
      'G_FATO_CRITICO_AUSENTE',
    ],
    source_ref: 'PDF 6, seção 4.1; PDF 7, p. 3 (tabela de regras); PDF 8, p. 3 (R2, R3); L03',
  },

  // -------------------------------------------------------------------------
  // qualification_eligibility — MEIO B (gates formais)
  // PDF-fonte: PDF 6, p. 7 — "qualification: ...dependente, restrição, elegibilidade
  // documental."
  // PDF 7, p. 3 — "Estrangeiro → validar RNM antes de avançar"
  // PDF 8, p. 3 — "R4: estrangeiro sem RNM válido → bloquear avanço"
  // -------------------------------------------------------------------------
  qualification_eligibility: {
    id: 'qualification_eligibility',
    name: 'Meio B — Gates de Elegibilidade',
    description: 'Elegibilidade documental, nacionalidade, RNM, restrições de crédito, dependentes.',
    required_facts: [
      'nacionalidade',       // F1: brasileiro, estrangeiro
      'credit_restriction',  // F5: há restrição de crédito?
    ],
    optional_facts: [
      'rnm_status',          // F1: obrigatório apenas se nacionalidade=estrangeiro
      'dependente_qtd',      // F6: número de dependentes (quando aplicável)
    ],
    next_stages: ['docs_prep'],
    applicable_gates: [
      'G_ESTRANGEIRO_RNM',      // R4: estrangeiro sem RNM válido → bloquear
      'G_FATO_CRITICO_AUSENTE',
    ],
    source_ref: 'PDF 6, seção 4.1; PDF 7, p. 3 (tabela); PDF 8, p. 3 (R4); L03',
  },

  // -------------------------------------------------------------------------
  // docs_prep — Preparação de documentos
  // PDF-fonte: PDF 6, p. 7 — "docs_prep: escolha de canal e preparação para
  // envio de documentos."
  // -------------------------------------------------------------------------
  docs_prep: {
    id: 'docs_prep',
    name: 'Docs Prep — Preparação Documental',
    description: 'Escolha do canal de envio de documentos e orientação sobre o que enviar.',
    required_facts: [
      'docs_channel_choice', // F7: WhatsApp, site, visita presencial
    ],
    optional_facts: [
      'visit_interest',      // F7: interesse em visita
    ],
    next_stages: ['docs_collection', 'visit'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
    source_ref: 'PDF 6, seção 4.1; L03 — Mapa Canônico do Funil',
  },

  // -------------------------------------------------------------------------
  // docs_collection — Coleta de documentos
  // PDF-fonte: PDF 6, p. 7 — "docs_collection: recebimento e consolidação
  // documental."
  // -------------------------------------------------------------------------
  docs_collection: {
    id: 'docs_collection',
    name: 'Docs Collection — Coleta Documental',
    description: 'Recebimento e consolidação de documentos: identidade, renda, residência.',
    required_facts: [
      'doc_identity_status',  // F8: identidade (RG, CNH, etc.)
      'doc_income_status',    // F8: comprovante de renda
      'doc_residence_status', // F8: comprovante de residência
    ],
    optional_facts: [],
    next_stages: ['broker_handoff'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
    source_ref: 'PDF 6, seção 4.1; L03 — Mapa Canônico do Funil',
  },

  // -------------------------------------------------------------------------
  // broker_handoff — Handoff ao correspondente
  // PDF-fonte: PDF 6, p. 7 — "broker_handoff: preparação do pacote ao
  // correspondente."
  // -------------------------------------------------------------------------
  broker_handoff: {
    id: 'broker_handoff',
    name: 'Broker Handoff — Handoff ao Correspondente',
    description: 'Preparação do pacote completo e handoff formal ao correspondente bancário.',
    required_facts: [],        // todos os facts anteriores devem estar confirmados
    optional_facts: [],
    next_stages: [],           // stage terminal — fim do funil principal
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
    source_ref: 'PDF 6, seção 4.1; L03 — Mapa Canônico do Funil',
  },

  // -------------------------------------------------------------------------
  // visit — Visita
  // PDF-fonte: PDF 6, p. 6 — "visit_interest: sim/não/talvez"; p. 7
  // -------------------------------------------------------------------------
  visit: {
    id: 'visit',
    name: 'Visit — Agendamento de Visita',
    description: 'Agendamento de visita ao imóvel ou ao correspondente.',
    required_facts: [
      'visit_interest', // F7: confirmação de interesse em visita
    ],
    optional_facts: [],
    next_stages: ['broker_handoff'],
    applicable_gates: ['G_FATO_CRITICO_AUSENTE'],
    source_ref: 'PDF 6, seção 4.1; L03 — Mapa Canônico do Funil',
  },
};

// ---------------------------------------------------------------------------
// Definições canônicas dos gates — derivadas de L03
// PDF-fonte: PDF 7, p. 3; PDF 8, pp. 3–6
// ---------------------------------------------------------------------------

/**
 * Metadados estruturais de cada gate canônico.
 * As condições de ativação são avaliadas no engine (engine.ts).
 */
export const GATE_DEFINITIONS: Record<
  GateId,
  { severity: GateSeverity; block_advance: boolean; source_ref: string; description: string }
> = {
  // R1 — PDF 8, p. 3 / PDF 7, p. 3
  G_CASADO_CONJUNTO: {
    severity: 'high',
    block_advance: false, // não bloqueia — força atualização de processo
    source_ref: 'PDF 7, p. 3 (Casado civil → forçar processo_conjunto); PDF 8, p. 3 (R1)',
    description: 'Casado civil exige processo em conjunto. Force processo=conjunto.',
  },

  // R2 — PDF 8, p. 3 / PDF 7, p. 3
  G_AUTONOMO_IR: {
    severity: 'medium',
    block_advance: true, // bloqueia até coletar autonomo_tem_ir
    source_ref: 'PDF 7, p. 3 (Autônomo → perguntar IR obrigatoriamente); PDF 8, p. 3 (R2)',
    description: 'Autônomo exige coleta obrigatória de autonomo_tem_ir antes de avançar.',
  },

  // R3 — PDF 8, p. 3 / PDF 7, p. 3
  G_RENDA_SOLO_BAIXA: {
    severity: 'medium',
    block_advance: false, // não bloqueia — sinaliza sugestão estrutural
    source_ref: 'PDF 7, p. 3 (Solo renda baixa → sugerir composição); PDF 8, p. 3 (R3)',
    description: 'Renda solo abaixo de 3000 requer sinalização de sugestão de composição.',
  },

  // R4 — PDF 8, p. 3 / PDF 7, p. 3
  G_ESTRANGEIRO_RNM: {
    severity: 'critical',
    block_advance: true, // bloqueia — estrangeiro sem RNM não pode avançar
    source_ref: 'PDF 7, p. 3 (Estrangeiro → validar RNM antes de avançar); PDF 8, p. 3 (R4)',
    description: 'Estrangeiro sem RNM válido não pode avançar no funil.',
  },

  // R5 — PDF 8, p. 3
  G_CONTRADICAO_FATUAL: {
    severity: 'high',
    block_advance: true, // bloqueia — contradição exige confirmação antes de avançar
    source_ref: 'PDF 8, p. 3 (R5: output com contradição fatual → pedir confirmação)',
    description: 'Contradição em fact crítico detectada. Exige confirmação antes de avançar.',
  },

  // R6 — PDF 8, p. 3
  G_FATO_CRITICO_AUSENTE: {
    severity: 'high',
    block_advance: true, // bloqueia — fato obrigatório ausente impede avanço de stage
    source_ref: 'PDF 8, p. 3 (R6: fato crítico ausente → não avançar objetivo)',
    description: 'Fact obrigatório para o stage atual está ausente. Não avançar.',
  },
};

// ---------------------------------------------------------------------------
// Avaliadores de gate — lógica estrutural de ativação
// PDF-fonte: PDF 8, pp. 3–5 (seção 4 e seção 6.1)
// ---------------------------------------------------------------------------

/**
 * Avalia se o gate G_CASADO_CONJUNTO está ativado.
 * R1: "se estado_civil = casado_civil → forçar processo = conjunto"
 * PDF 8, p. 3; PDF 7, p. 3
 */
export function evaluateGateCasadoConjunto(state: LeadState): GateResult {
  const def = GATE_DEFINITIONS.G_CASADO_CONJUNTO;
  const activated =
    state.estado_civil === 'casado_civil' && state.processo !== 'conjunto';
  return {
    gate_id: 'G_CASADO_CONJUNTO',
    activated,
    severity: def.severity,
    block_advance: false, // força atualização mas não bloqueia
    requires_collection: activated ? 'processo' : null,
    reason: activated
      ? 'Casado civil detectado. Processo deve ser conjunto. (R1 — PDF 8, p. 3)'
      : 'Casado civil não detectado ou processo já está como conjunto.',
    source_ref: def.source_ref,
  };
}

/**
 * Avalia se o gate G_AUTONOMO_IR está ativado.
 * R2: "se regime_trabalho = autonomo → perguntar IR se ainda ausente"
 * PDF 8, p. 3; PDF 7, p. 3
 */
export function evaluateGateAutonomoIR(state: LeadState): GateResult {
  const def = GATE_DEFINITIONS.G_AUTONOMO_IR;
  const activated =
    state.regime_trabalho === 'autonomo' && state.autonomo_tem_ir === null;
  return {
    gate_id: 'G_AUTONOMO_IR',
    activated,
    severity: def.severity,
    block_advance: activated,
    requires_collection: activated ? 'autonomo_tem_ir' : null,
    reason: activated
      ? 'Autônomo sem IR declarado. Coleta de autonomo_tem_ir obrigatória. (R2 — PDF 8, p. 3)'
      : 'Não autônomo ou IR já coletado.',
    source_ref: def.source_ref,
  };
}

/**
 * Avalia se o gate G_RENDA_SOLO_BAIXA está ativado.
 * R3: "se renda_principal < 3000 e processo = solo → sugerir composição"
 * PDF 8, p. 3; PDF 7, p. 3
 * Limite: 3000 — conforme PDF 7, p. 3 "limite_operacional"
 */
export function evaluateGateRendaSoloBaixa(state: LeadState): GateResult {
  const def = GATE_DEFINITIONS.G_RENDA_SOLO_BAIXA;
  const LIMITE_RENDA_SOLO = 3000; // PDF 7, p. 3: "limite_operacional"
  const activated =
    typeof state.renda_principal === 'number' &&
    state.renda_principal < LIMITE_RENDA_SOLO &&
    state.processo === 'solo';
  return {
    gate_id: 'G_RENDA_SOLO_BAIXA',
    activated,
    severity: def.severity,
    block_advance: false, // não bloqueia — sinaliza sugestão
    requires_collection: null,
    reason: activated
      ? `Renda solo (${state.renda_principal}) abaixo de ${LIMITE_RENDA_SOLO}. Sinalizar sugestão de composição. (R3 — PDF 8, p. 3)`
      : 'Renda acima do limite ou não é processo solo.',
    source_ref: def.source_ref,
  };
}

/**
 * Avalia se o gate G_ESTRANGEIRO_RNM está ativado.
 * R4: "se nacionalidade = estrangeiro e rnm_status != valido → bloquear avanço"
 * PDF 8, p. 3; PDF 7, p. 3
 */
export function evaluateGateEstrangeiroRNM(state: LeadState): GateResult {
  const def = GATE_DEFINITIONS.G_ESTRANGEIRO_RNM;
  const activated =
    state.nacionalidade === 'estrangeiro' && state.rnm_status !== 'valido';
  return {
    gate_id: 'G_ESTRANGEIRO_RNM',
    activated,
    severity: def.severity,
    block_advance: activated,
    requires_collection: activated && state.rnm_status === null ? 'rnm_status' : null,
    reason: activated
      ? `Estrangeiro sem RNM válido (status: ${state.rnm_status ?? 'ausente'}). Bloqueio total. (R4 — PDF 8, p. 3)`
      : 'Brasileiro ou RNM válido.',
    source_ref: def.source_ref,
  };
}

/**
 * Avalia se o gate G_FATO_CRITICO_AUSENTE está ativado para o stage atual.
 * R6: "fato crítico ausente → não avançar objetivo"
 * PDF 8, p. 3
 *
 * Compara os facts obrigatórios do stage atual com o estado do lead.
 */
export function evaluateGateFatoCriticoAusente(
  state: LeadState,
  stageDef: StageDefinition,
): GateResult {
  const def = GATE_DEFINITIONS.G_FATO_CRITICO_AUSENTE;

  const missingFacts = stageDef.required_facts.filter((fact) => {
    const value = (state as unknown as Record<string, unknown>)[fact];
    return value === null || value === undefined;
  });

  const activated = missingFacts.length > 0;
  return {
    gate_id: 'G_FATO_CRITICO_AUSENTE',
    activated,
    severity: def.severity,
    block_advance: activated,
    requires_collection: activated ? missingFacts[0] ?? null : null,
    reason: activated
      ? `Facts obrigatórios ausentes no stage '${stageDef.id}': [${missingFacts.join(', ')}]. Não avançar. (R6 — PDF 8, p. 3)`
      : `Todos os facts obrigatórios do stage '${stageDef.id}' estão presentes.`,
    source_ref: def.source_ref,
  };
}

/**
 * Avalia todos os gates aplicáveis ao stage atual do lead.
 * Retorna lista de GateResult com todos os gates avaliados.
 *
 * PDF-fonte: PDF 8, seção 4 "Regras mínimas obrigatórias" (R1–R6)
 */
export function evaluateApplicableGates(
  state: LeadState,
  stageDef: StageDefinition,
): GateResult[] {
  const results: GateResult[] = [];

  for (const gateId of stageDef.applicable_gates) {
    switch (gateId) {
      case 'G_CASADO_CONJUNTO':
        results.push(evaluateGateCasadoConjunto(state));
        break;
      case 'G_AUTONOMO_IR':
        results.push(evaluateGateAutonomoIR(state));
        break;
      case 'G_RENDA_SOLO_BAIXA':
        results.push(evaluateGateRendaSoloBaixa(state));
        break;
      case 'G_ESTRANGEIRO_RNM':
        results.push(evaluateGateEstrangeiroRNM(state));
        break;
      case 'G_FATO_CRITICO_AUSENTE':
        results.push(evaluateGateFatoCriticoAusente(state, stageDef));
        break;
      case 'G_CONTRADICAO_FATUAL':
        // Este gate é avaliado externamente (detecta contradição com turn_extract)
        // não é avaliado aqui sem o contexto do turno
        break;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Ordem canônica de stages — sequência do funil
// PDF-fonte: PDF 6, seção 4.1; L03
// ---------------------------------------------------------------------------

/**
 * Sequência canônica principal do funil.
 * PDF-fonte: PDF 6, p. 7 (fases macro, em ordem de execução)
 */
export const CANONICAL_STAGE_ORDER: StageId[] = [
  'discovery',
  'qualification_civil',
  'qualification_renda',
  'qualification_eligibility',
  'docs_prep',
  'docs_collection',
  'broker_handoff',
];
