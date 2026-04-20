/**
 * ENOVA 2 — Core Mecânico 2 — Tipos estruturais (L03 esqueleto + L04/L05/L06 topo)
 *
 * Âncora contratual:
 *   Cláusula-fonte:  L-01 (L03), L-02 (L04), L-03 (L05), L-04 (L06)
 *   Bloco legado:    L03 — Mapa Canônico do Funil; L04, L05, L06 — Topo do Funil
 *
 * ESCOPO DESTE ARQUIVO: esqueleto estrutural do Core + tipos do topo,
 * Meio A e Meio B inicial.
 *
 * RESTRIÇÃO INVIOLÁVEL: nenhum tipo aqui representa fala, surface ou resposta ao cliente.
 * O Core é soberano da ESTRUTURA. O LLM é soberano da FALA.
 */

// Re-export topo types (L04, L05, L06) — parte do contrato de tipos do Core
export type { CustomerGoal, CurrentIntent, OfftrackType } from './topo-rules.ts';
export type { TopoTurnExtract, TopoSignals } from './topo-parser.ts';
export type { TopoCriteriaResult } from './topo-gates.ts';
export type {
  EstadoCivil,
  ProcessoMode,
  CompositionActor,
  MeioAParseStatus,
} from './meio-a-rules.ts';
export type { MeioATurnExtract, MeioASignals } from './meio-a-parser.ts';
export type { MeioACriteriaResult } from './meio-a-gates.ts';
export type {
  RegimeTrabalho,
  Nacionalidade,
  RnmStatus,
  MeioBParseStatus,
} from './meio-b-rules.ts';
export type { MeioBTurnExtract, MeioBSignals } from './meio-b-parser.ts';
export type {
  MeioBRendaCriteriaResult,
  MeioBElegibilidadeCriteriaResult,
} from './meio-b-gates.ts';

// ---------------------------------------------------------------------------
// Stages canônicos do funil — derivados de L03
// ---------------------------------------------------------------------------

/**
 * Identificadores canônicos de stage do funil ENOVA 2.
 * Fonte: L03 — Mapa Canônico do Funil.
 *
 * Fases macro: discovery → qualification → docs_prep → docs_collection → broker_handoff.
 * Ramificação opcional: visit (paralela a docs_prep).
 */
export type StageId =
  | 'discovery'              // topo: boas-vindas, explicação, enquadramento inicial
  | 'qualification_civil'    // meio A: estado civil, composição familiar, processo
  | 'qualification_renda'    // meio B: renda, regime de trabalho
  | 'qualification_eligibility' // gates formais: elegibilidade documental
  | 'docs_prep'              // preparação: canal de envio, orientação de documentos
  | 'docs_collection'        // coleta: recebimento e consolidação documental
  | 'broker_handoff'         // handoff ao correspondente
  | 'visit';                 // agendamento de visita (ramificação)

// ---------------------------------------------------------------------------
// Estado estrutural mínimo do lead
// ---------------------------------------------------------------------------

/**
 * Estado estrutural mínimo que o Core recebe como entrada.
 * Em L03 usamos um mapa simples de facts coletados.
 * Tipagem detalhada de cada fact (F0–F8) fica para L04+.
 */
export interface LeadState {
  lead_id: string;
  current_stage: StageId;
  facts: Record<string, unknown>; // facts coletados até o momento (chave → valor)
}

// ---------------------------------------------------------------------------
// Gates estruturais — slots de gate por stage
// ---------------------------------------------------------------------------

/**
 * Identificadores estruturais de gate.
 *
 * L03 ativa apenas G_FATO_CRITICO_AUSENTE (gate estrutural de avanço).
 * Gates de regras de negócio (composição, renda, elegibilidade, restrições)
 * são slots reservados para L04–L06+.
 */
export type GateId =
  | 'G_FATO_CRITICO_AUSENTE'   // fact obrigatório do stage ausente → não avançar (L03)
  | 'G_COMPOSICAO_FAMILIAR'    // slot reservado → L04 (qualificação civil)
  | 'G_REGIME_RENDA'           // slot reservado → L05 (qualificação de renda)
  | 'G_ELEGIBILIDADE';         // slot reservado → L06 (elegibilidade documental)

/**
 * Resultado da avaliação de um gate.
 */
export interface GateResult {
  gate_id: GateId;
  activated: boolean;
  block_advance: boolean;
  missing_fact: string | null; // fact ausente que ativou o gate, se aplicável
  reason: string;              // justificativa estrutural — não é fala ao cliente
}

// ---------------------------------------------------------------------------
// Decisão estrutural do Core — saída canônica
// ---------------------------------------------------------------------------

/**
 * Decisão estrutural emitida pelo Core ao final de um ciclo.
 * INVIOLÁVEL: nenhum campo contém texto ao cliente.
 *
 * O campo speech_intent é um sinal estrutural para o Speech Engine.
 * O Speech Engine (LLM) é soberano para transformá-lo em fala.
 */
export interface CoreDecision {
  stage_current: StageId;
  stage_after: StageId;    // próximo stage autorizado (ou mesmo stage se bloqueado)
  next_objective: string;  // objetivo operacional estrutural (ex: 'coletar_customer_goal')
  block_advance: boolean;  // true = algum gate impediu transição
  gates_activated: GateId[];
  speech_intent: 'coleta_dado' | 'transicao_stage' | 'bloqueio'; // sinal estrutural
  decision_id: string;
  evaluated_at: string;    // ISO 8601
}

// ---------------------------------------------------------------------------
// Definição de stage — estrutura interna do mapa
// ---------------------------------------------------------------------------

/**
 * Definição estrutural de um stage.
 * Regras detalhadas de cada stage ficam para L04–L06+.
 */
export interface StageDefinition {
  id: StageId;
  name: string;
  required_facts: string[]; // chaves mínimas que devem estar presentes para avançar
  next_stages: StageId[];
  applicable_gates: GateId[];
}
