/**
 * ENOVA 2 — Core Mecânico 2 — Tipos estruturais
 *
 * Âncora contratual (CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md):
 *   Cláusula-fonte:  L-01, A00-02, A00-06
 *   Bloco legado:    L03 — Mapa Canônico do Funil
 *   PDF-fonte:       PDF 6, pp. 2–8 (taxonomia de facts, entidades, fases macro)
 *                    PDF 7, pp. 1–4 (stack operacional, saída mínima do Core)
 *                    PDF 8, pp. 1–6 (contrato de entrada/saída do Core, Policy Engine)
 *
 * RESTRIÇÃO INVIOLÁVEL: nenhum tipo aqui representa fala, surface ou resposta ao cliente.
 * O Core é soberano da ESTRUTURA. O LLM é soberano da FALA.
 * (A00 seção 4.2, seção 4.3; PDF 8, seção 3 "O que o Core Mecânico não pode fazer")
 */

// ---------------------------------------------------------------------------
// Stages canônicos do funil — derivados de L03 (PDF 6, p. 7–8; PDF 7, p. 3)
// ---------------------------------------------------------------------------

/**
 * Identificadores canônicos de stage do funil ENOVA 2.
 * Derivados de L03 (Mapa Canônico do Funil) — PDF 6, seção 4.1 "Fases macro recomendadas".
 *
 * PDF-fonte literal: "discovery: entendimento inicial, explicação do programa, enquadramento
 * do lead. qualification: estado civil, composição, trabalho, renda, dependente, restrição,
 * elegibilidade documental. docs_prep: escolha de canal e preparação para envio de documentos.
 * docs_collection: recebimento e consolidação documental. broker_handoff: preparação do pacote
 * ao correspondente."
 */
export type StageId =
  | 'discovery'              // topo: boas-vindas, explicação, enquadramento inicial
  | 'qualification_civil'    // meio A: estado civil, composição familiar, processo
  | 'qualification_renda'    // meio B: renda, regime de trabalho, IR, CTPS
  | 'qualification_eligibility' // gates formais: elegibilidade, restrições, RNM
  | 'docs_prep'              // preparação: canal de envio, orientação de documentos
  | 'docs_collection'        // coleta: recebimento e consolidação documental
  | 'broker_handoff'         // handoff ao correspondente
  | 'visit';                 // agendamento de visita

// ---------------------------------------------------------------------------
// Estado estruturado do lead — entrada canônica do Core
// PDF-fonte: PDF 8, seção 3.1 "Estado mínimo esperado"
// ---------------------------------------------------------------------------

/**
 * Estado estruturado mínimo do lead que o Core recebe como entrada.
 * Derivado de L03 e do contrato do Core Mecânico (PDF 8, p. 2).
 *
 * PDF-fonte literal (PDF 8, p. 2): "estado_civil, processo, renda_principal,
 * regime_trabalho, autonomo_tem_ir, nacionalidade, rnm_status, dependente_qtd, ctps_36,
 * facts_confirmados, facts_ambiguos, pendencias_obrigatorias"
 */
export interface LeadState {
  lead_id: string;
  current_stage: StageId;

  // F2 — Estado civil e modo de processo (PDF 6, p. 5)
  estado_civil: 'solteiro' | 'uniao_estavel' | 'casado_civil' | 'divorciado' | 'viuvo' | null;
  processo: 'solo' | 'conjunto' | 'composicao_familiar' | null;
  composition_actor: string | null; // cônjuge, parceiro, pai, etc.

  // F3 — Regime de trabalho e renda (PDF 6, p. 5)
  regime_trabalho: 'clt' | 'autonomo' | 'servidor' | 'aposentado' | null;
  autonomo_tem_ir: boolean | null; // null = ainda não coletado
  renda_principal: number | null;

  // F1 — Nacionalidade e elegibilidade documental (PDF 6, p. 4)
  nacionalidade: 'brasileiro' | 'estrangeiro' | null;
  rnm_status: 'valido' | 'invalido' | 'ausente' | null;

  // F4 — Trabalho formal (PDF 6, p. 5)
  ctps_36: boolean | null; // CTPS ativo há pelo menos 36 meses

  // F5 — Restrições (PDF 6, p. 5)
  credit_restriction: boolean | null;

  // F6 — Dependentes (PDF 6, p. 6)
  dependente_qtd: number | null;

  // F7 — Jornada e intenção (PDF 6, p. 6)
  customer_goal: string | null;

  // F8 — Documentos (PDF 6, p. 6)
  doc_identity_status: 'faltando' | 'parcial' | 'recebido' | 'validado' | null;
  doc_income_status: 'faltando' | 'parcial' | 'recebido' | 'validado' | null;
  doc_residence_status: 'faltando' | 'parcial' | 'recebido' | 'validado' | null;

  // Metadados operacionais
  facts_confirmados: Record<string, unknown>;
  facts_ambiguos: string[];
  pendencias_obrigatorias: string[];
}

// ---------------------------------------------------------------------------
// Gates canônicos — derivados de L03, PDF 7 e PDF 8
// ---------------------------------------------------------------------------

/**
 * Identificadores canônicos de gate do funil.
 * Derivados de L03 e das regras obrigatórias do PDF 7 (p. 3) e PDF 8 (p. 3, seção 4).
 *
 * PDF-fonte literal (PDF 7, p. 3 — tabela de regras de negócio):
 * "Solo renda baixa / Autônomo / Casado civil / Estrangeiro / Dependente"
 *
 * PDF-fonte literal (PDF 8, p. 3, seção 4):
 * "R1: estado_civil = casado_civil → forçar processo = conjunto
 *  R2: regime_trabalho = autonomo → perguntar IR se ainda ausente
 *  R3: renda_principal < 3000 e processo = solo → sugerir composição
 *  R4: nacionalidade = estrangeiro e rnm_status != valido → bloquear avanço
 *  R5: output com contradição fatual → pedir confirmação
 *  R6: fato crítico ausente → não avançar objetivo"
 */
export type GateId =
  | 'G_CASADO_CONJUNTO'         // R1: casado_civil → obriga processo=conjunto
  | 'G_AUTONOMO_IR'             // R2: autonomo → coleta IR obrigatória
  | 'G_RENDA_SOLO_BAIXA'        // R3: renda<3000 e solo → sinalizar composição
  | 'G_ESTRANGEIRO_RNM'         // R4: estrangeiro sem RNM válido → bloquear
  | 'G_CONTRADICAO_FATUAL'      // R5: contradição em fact crítico → exigir confirmação
  | 'G_FATO_CRITICO_AUSENTE';   // R6: fact obrigatório ausente → não avançar

/**
 * Severidade de um gate ativado.
 * PDF-fonte: PDF 8, p. 3 (severity: critical | high | medium | low)
 */
export type GateSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Resultado da avaliação de um gate individual.
 */
export interface GateResult {
  gate_id: GateId;
  activated: boolean;      // true = gate ativado (condição satisfeita)
  severity: GateSeverity;
  block_advance: boolean;   // se true, impede transição para próximo stage
  requires_collection: string | null; // fact que precisa ser coletado, se aplicável
  reason: string;           // justificativa estrutural (não é fala ao cliente)
  source_ref: string;       // referência ao PDF-fonte (rastreabilidade contratual)
}

// ---------------------------------------------------------------------------
// Decisão estrutural do Core — saída canônica
// PDF-fonte: PDF 8, p. 2 (seção 4 "Saída mínima do Core Mecânico")
// ---------------------------------------------------------------------------

/**
 * Intenção estrutural a ser passada ao Speech Engine.
 * NÃO É FALA. É apenas o sinal de intent que o Core emite.
 * O Speech Engine é soberano para transformar este intent em fala ao cliente.
 * (A00 seção 4.2; PDF 8, seção 3 "O que o Core Mecânico não pode fazer")
 *
 * PDF-fonte literal (PDF 8, p. 2): "speech_intent" como campo de saída do Core.
 */
export type SpeechIntent =
  | 'coleta_dado'        // Core solicita coleta de um fact específico
  | 'confirmacao'        // Core solicita confirmação de contradição ou dado ambíguo
  | 'bloqueio'           // Core sinaliza bloqueio por gate crítico
  | 'sugestao_composicao' // Core sinaliza sugestão de composição (renda baixa)
  | 'transicao_stage'    // Core autoriza transição e indica próximo objetivo
  | 'handoff';           // Core sinaliza handoff ao correspondente ou visita

/**
 * Decisão estrutural emitida pelo Core Mecânico ao final de um turno.
 * Esta é a única saída do Core — estrutural, sem phrasing, sem resposta ao cliente.
 *
 * PDF-fonte literal (PDF 8, p. 2):
 * "confirmed_slots, rejected_slots, pending_slots, stage_after, next_objective,
 *  required_confirmation, persist_ops, speech_intent"
 *
 * INVIOLÁVEL: nenhum campo desta interface contém texto ao cliente.
 */
export interface CoreDecision {
  // Stage atual e próximo stage autorizado
  stage_current: StageId;
  stage_after: StageId;       // próximo stage autorizado pelo Core

  // Objetivo operacional atual — estrutural, não é fala
  next_objective: string;     // ex: "coletar_estado_civil", "validar_rnm", "avançar_docs"

  // Slots confirmados, rejeitados e pendentes
  confirmed_slots: Record<string, unknown>;
  rejected_slots: Record<string, unknown>;
  pending_slots: string[];

  // Confirmação obrigatória antes de avançar
  required_confirmation: boolean;
  confirmation_target: string | null; // fact que precisa ser confirmado

  // Gates avaliados nesta decisão
  gates_evaluated: GateResult[];
  gates_activated: GateId[];
  block_advance: boolean;     // true se algum gate bloqueante foi ativado

  // Intent estrutural para o Speech Engine (não é fala — é sinal estrutural)
  speech_intent: SpeechIntent;
  speech_intent_context: Record<string, unknown>; // contexto mínimo estrutural

  // Operações de persistência autorizadas pelo Core
  persist_ops: PersistOp[];

  // Rastreabilidade contratual
  decision_id: string;
  evaluated_at: string; // ISO 8601
  source_refs: string[]; // referências ao PDF-fonte usadas nesta decisão
}

/**
 * Operação de persistência autorizada pelo Core.
 * O Core decide o que persistir — não o Speech Engine.
 * PDF-fonte: PDF 8, p. 2 ("persist_ops" como campo de saída)
 */
export interface PersistOp {
  op: 'upsert_fact' | 'set_stage' | 'add_pending' | 'clear_pending' | 'flag_block';
  target: string;
  value: unknown;
  reason: string;
}

// ---------------------------------------------------------------------------
// Definição de stage — estrutura interna do mapa de stages
// ---------------------------------------------------------------------------

/**
 * Definição estrutural de um stage no mapa canônico.
 * Cada stage define: facts obrigatórios, próximos stages possíveis, gates aplicáveis.
 */
export interface StageDefinition {
  id: StageId;
  name: string;             // nome canônico legível
  description: string;      // descrição estrutural do objetivo do stage
  required_facts: string[]; // facts que DEVEM estar confirmados para sair deste stage
  optional_facts: string[]; // facts úteis mas não bloqueantes
  next_stages: StageId[];   // transições autorizadas a partir deste stage
  applicable_gates: GateId[]; // gates que se aplicam neste stage
  source_ref: string;       // referência ao PDF-fonte
}
