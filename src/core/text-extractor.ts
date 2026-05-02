/**
 * ENOVA 2 — Core — Extrator de Facts do Texto WhatsApp (T9.6)
 *
 * Função pura: texto → facts estruturados para o stage atual.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Zero I/O: sem OpenAI, sem Supabase, sem env, sem side effects.
 *   - Nunca lança exceção. Retorna {} para qualquer entrada inválida.
 *   - Não decide stage. Extrai apenas — quem decide é o Core (engine.ts).
 *   - LLM é soberano da fala. Este módulo não gera fala.
 *   - Não loga texto completo do cliente.
 *   - Extrai apenas facts relevantes ao stage atual para minimizar ruído.
 *
 * Precisão: heurísticas mínimas determinísticas (T9.6).
 * Extração semântica de alta fidelidade: T9.8 (LlmContext estruturado).
 */

import type { StageId } from './types.ts';

// ---------------------------------------------------------------------------
// Normalização interna
// ---------------------------------------------------------------------------

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^\w\s]/g, ' ')         // pontuação → espaço
    .replace(/\s+/g, ' ')
    .trim();
}

function contains(normalized: string, ...terms: string[]): boolean {
  return terms.some((t) => normalized.includes(t));
}

// ---------------------------------------------------------------------------
// Extração por stage
// ---------------------------------------------------------------------------

function extractDiscovery(n: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // Entender tem prioridade: "como funciona o MCMV" é entender, não comprar
  // Padrões usados são específicos para evitar falsos positivos com textos de triagem inicial
  if (
    contains(n, 'como funciona', 'quero entender', 'me explica', 'pode explicar',
      'o que e o mcmv', 'o que e minha casa', 'saber sobre o programa',
      'quero informacoes', 'quero informacao', 'explica o programa')
  ) {
    facts['customer_goal'] = 'entender_programa';
  } else if (
    // "minha casa minha vida" sem sinal de entender = intenção de comprar
    contains(n, 'minha casa minha vida', 'quero comprar', 'comprar imovel',
      'financiamento', 'programa habitacional', 'casa propria', 'quero a casa',
      'quero um imovel', 'quero financiar', 'minha casa', 'financiar imovel')
  ) {
    facts['customer_goal'] = 'comprar_imovel';
  } else if (contains(n, 'enviar documentos', 'enviar docs', 'mandar documentos', 'mando os docs')) {
    facts['customer_goal'] = 'enviar_docs';
  } else if (contains(n, 'quero visitar', 'agendar visita', 'ver o imovel', 'ver o apartamento')) {
    facts['customer_goal'] = 'visitar_imovel';
  }

  return facts;
}

function extractQualificationCivil(n: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // estado_civil
  if (contains(n, 'sou solteiro', 'sou solteira', 'estou solteiro', 'estou solteira')) {
    facts['estado_civil'] = 'solteiro';
  } else if (
    contains(n, 'sou casado', 'sou casada', 'casado no civil', 'casada no civil',
      'casamento civil', 'tenho casamento civil')
  ) {
    facts['estado_civil'] = 'casado_civil';
  } else if (
    contains(n, 'uniao estavel', 'moro junto', 'moro com minha', 'moro com meu',
      'amasiado', 'amasiada', 'vivemos juntos', 'vivemos juntas')
  ) {
    facts['estado_civil'] = 'uniao_estavel';
  } else if (contains(n, 'divorciado', 'divorciada', 'separado', 'separada')) {
    facts['estado_civil'] = 'divorciado';
  } else if (contains(n, 'viuvo', 'viuva', 'meu marido faleceu', 'minha esposa faleceu')) {
    facts['estado_civil'] = 'viuvo';
  }

  // processo
  if (contains(n, 'sozinho', 'so eu', 'apenas eu', 'sou eu so', 'eu sozinha', 'eu sozinho')) {
    facts['processo'] = 'solo';
  } else if (
    contains(n, 'eu e minha esposa', 'eu e meu marido', 'minha esposa', 'meu marido',
      'nos dois', 'meu companheiro', 'minha companheira', 'meu conjuge', 'minha conjuge')
  ) {
    facts['processo'] = 'conjunto';
  } else if (
    contains(n, 'com minha mae', 'com meu pai', 'com meus pais', 'com familiar',
      'composicao familiar', 'minha irma', 'meu irmao', 'minha filha', 'meu filho')
  ) {
    facts['processo'] = 'composicao_familiar';
  }

  return facts;
}

function extractQualificationRenda(n: string, original: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // regime_trabalho
  if (
    contains(n, 'clt', 'carteira assinada', 'registrado', 'registrada',
      'com carteira', 'empregado registrado', 'trabalho de carteira')
  ) {
    facts['regime_trabalho'] = 'clt';
  } else if (
    contains(n, 'autonomo', 'autonoma', 'freelancer', 'trabalho por conta',
      'trabalho por minha conta', 'conta propria', 'prestador de servico')
  ) {
    facts['regime_trabalho'] = 'autonomo';
  } else if (
    contains(n, 'aposentado', 'aposentada', 'aposentadoria', 'recebo aposentadoria',
      'sou aposentado', 'sou aposentada')
  ) {
    facts['regime_trabalho'] = 'aposentado';
  } else if (
    contains(n, 'servidor', 'servidora', 'funcionario publico', 'funcionaria publica',
      'funcao publica', 'concursado', 'concursada', 'prefeitura', 'estado governo')
  ) {
    facts['regime_trabalho'] = 'servidor';
  } else if (
    contains(n, 'informal', 'bico', 'sem registro', 'sem carteira',
      'nao tenho carteira', 'trabalho informal')
  ) {
    facts['regime_trabalho'] = 'informal';
  }

  // renda_principal — opera no texto original para preservar R$, pontos e vírgulas
  const renda = extractRenda(original);
  if (renda !== null) {
    facts['renda_principal'] = renda;
  }

  return facts;
}

function extractRenda(original: string): number | null {
  const t = original.toLowerCase();

  // "4 mil", "3,5 mil", "3.5 mil"
  const milMatch = t.match(/(\d+(?:[,.]\d+)?)\s*mil/);
  if (milMatch) {
    const val = parseFloat(milMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0 && val < 100) return Math.round(val * 1000);
  }

  // "R$ 3.500", "R$3500", "R$ 3.500,00"
  const rMatch = t.match(/r\$\s*([\d.,]+)/);
  if (rMatch) {
    const parsed = parseBrMoney(rMatch[1]);
    if (parsed !== null) return parsed;
  }

  // "renda de 4000", "renda 4000", "ganho 4000", "recebo 4000", "salario de 3500"
  const keyMatch = t.match(/(?:renda\s+(?:de\s+)?|ganho\s+|recebo\s+|salario\s+(?:de\s+)?)([\d.,]+)/);
  if (keyMatch) {
    const parsed = parseBrMoney(keyMatch[1]);
    if (parsed !== null) return parsed;
  }

  return null;
}

function parseBrMoney(raw: string): number | null {
  const s = raw.trim();
  let val: number;

  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) {
    // "3.500" ou "3.500,00" — ponto como milhar, vírgula como decimal
    val = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  } else if (/^\d+,\d{1,2}$/.test(s)) {
    // "3500,00" — vírgula como decimal
    val = parseFloat(s.replace(',', '.'));
  } else {
    // "3500", "4000.00"
    val = parseFloat(s.replace(',', '.'));
  }

  if (!isNaN(val) && val >= 100 && val <= 999999) return val;
  return null;
}

function extractQualificationEligibility(n: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  if (contains(n, 'brasileiro', 'brasileira', 'nasci no brasil', 'sou do brasil')) {
    facts['nacionalidade'] = 'brasileiro';
  } else if (
    contains(n, 'estrangeiro', 'estrangeira', 'nao sou brasileiro', 'nao sou brasileira',
      'sou de outro pais', 'sou imigrante')
  ) {
    facts['nacionalidade'] = 'estrangeiro';
  } else if (contains(n, 'naturalizado', 'naturalizada', 'naturalizacao')) {
    facts['nacionalidade'] = 'naturalizado';
  }

  return facts;
}

function extractDocsPrep(n: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  if (
    contains(n, 'whatsapp', 'por aqui', 'te mando aqui', 'mando aqui',
      'pelo zap', 'pelo whats', 'nessa conversa')
  ) {
    facts['docs_channel_choice'] = 'whatsapp';
  } else if (
    contains(n, 'site', 'link', 'portal', 'plataforma', 'pelo site', 'no site',
      'pelo link', 'sistema online')
  ) {
    facts['docs_channel_choice'] = 'site';
  } else if (
    contains(n, 'presencial', 'plantao', 'plantão', 'visita presencial',
      'ir pessoalmente', 'aparecer', 'ir ate voces', 'ir la')
  ) {
    facts['docs_channel_choice'] = 'visita_presencial';
  }

  return facts;
}

function extractVisit(n: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // Negação primeiro — "não quero visitar" contém "quero visitar" e dispararia 'sim'
  if (
    n === 'nao' || n === 'nao ' ||
    contains(n, 'nao quero', 'nao tenho interesse', 'dispenso',
      'por enquanto nao', 'nao agora', 'nao quero visitar', 'sem interesse')
  ) {
    facts['visit_interest'] = 'nao';
  } else if (
    contains(n, 'talvez', 'vou ver', 'possivelmente', 'depende', 'quem sabe', 'vou pensar')
  ) {
    facts['visit_interest'] = 'talvez';
  } else if (
    contains(n, 'sim', 'quero visitar', 'quero conhecer', 'agendar visita',
      'quero ver', 'topei', 'pode agendar', 'quero ir', 'adoraria')
  ) {
    facts['visit_interest'] = 'sim';
  }

  return facts;
}

// ---------------------------------------------------------------------------
// Ponto de entrada público
// ---------------------------------------------------------------------------

/**
 * Extrai facts estruturados do texto WhatsApp bruto para o stage atual.
 *
 * Regras:
 * - Função pura: sem I/O, sem side effects, determinística.
 * - Nunca lança exceção.
 * - Retorna {} para texto vazio, nulo ou sem facts reconhecidos.
 * - Extrai apenas facts relevantes ao stage passado.
 * - LLM decide fala; Core decide stage; este extrator apenas mapeia texto → chave/valor.
 */
export function extractFactsFromText(
  text: string,
  stage: StageId,
): Record<string, unknown> {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) return {};

    const n = normalize(text);
    if (!n) return {};

    switch (stage) {
      case 'discovery':
        return extractDiscovery(n);
      case 'qualification_civil':
        return extractQualificationCivil(n);
      case 'qualification_renda':
        return extractQualificationRenda(n, text);
      case 'qualification_eligibility':
        return extractQualificationEligibility(n);
      case 'docs_prep':
        return extractDocsPrep(n);
      case 'visit':
        return extractVisit(n);
      // Stages sem heurística simples segura — retorna {} intencionalmente
      case 'qualification_special':
      case 'docs_collection':
      case 'broker_handoff':
        return {};
      default:
        return {};
    }
  } catch {
    return {};
  }
}
