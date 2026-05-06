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
// Extração de nome completo — heurística conservadora para discovery
// ---------------------------------------------------------------------------

// Palavras funcionais que nunca aparecem em nomes próprios
const PALAVRAS_FUNCIONAIS_NOME = new Set([
  'sou', 'estou', 'vou', 'quero', 'gosto', 'tenho', 'moro', 'faco', 'trabalho',
  'como', 'por', 'que', 'uma', 'um', 'e', 'o', 'a', 'os', 'as', 'de', 'da', 'do',
  'em', 'no', 'na', 'ao', 'para', 'com', 'sem', 'me', 'te', 'se', 'nos', 'nao',
  'sim', 'olha', 'oi', 'ola', 'tudo', 'bem', 'bom', 'dia', 'tarde', 'noite',
  'obrigado', 'obrigada', 'ok', 'certo', 'claro', 'pode', 'meu', 'minha', 'seu', 'sua',
  'isso', 'isto', 'aqui', 'la', 'assim', 'entao', 'mais', 'menos', 'muito', 'pouco',
  'quando', 'onde', 'quem', 'qual', 'quanto', 'ja', 'ainda', 'so', 'tambem',
  'brasileiro', 'brasileira', 'estrangeiro', 'estrangeira', 'naturalizado', 'naturalizada',
  'rnm', 'registro',
]);

// Keywords do programa que nunca compõem nomes
const KEYWORDS_PROGRAMA_NOME = new Set([
  'mcmv', 'comprar', 'imovel', 'financiar', 'casa', 'programa', 'habitacional',
  'credito', 'banco', 'caixa', 'financiamento', 'proprio', 'propria', 'apartamento',
]);

/**
 * Tenta extrair nome completo do texto normalizado.
 * Heurística conservadora: texto com 2-5 palavras, apenas letras, sem palavras funcionais
 * e sem keywords de programa. Retorna o texto original preservado ou null.
 */
function extractNomeCompletoCandidato(n: string, original: string): string | null {
  const palavras = n.split(' ').filter((p) => p.length > 0);

  if (palavras.length < 2 || palavras.length > 5) return null;
  if (palavras.some((p) => PALAVRAS_FUNCIONAIS_NOME.has(p))) return null;
  if (palavras.some((p) => !/^[a-z]+$/.test(p))) return null;
  if (palavras.some((p) => KEYWORDS_PROGRAMA_NOME.has(p))) return null;
  if (palavras.some((p) => p.length < 3)) return null;

  return original.trim();
}

// ---------------------------------------------------------------------------
// Extração por stage
// ---------------------------------------------------------------------------

function extractDiscovery(n: string, original: string, pendingObjective?: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // Negação explícita bloqueia intenção de compra ("não quero comprar nada agora")
  const isNegation = contains(n, 'nao quero comprar', 'nao tenho interesse em comprar');

  // Entender tem prioridade: "como funciona o MCMV" é entender, não comprar
  // Padrões usados são específicos para evitar falsos positivos com textos de triagem inicial
  if (
    contains(n, 'como funciona', 'quero entender', 'me explica', 'pode explicar',
      'o que e o mcmv', 'o que e minha casa', 'saber sobre o programa',
      'quero informacoes', 'quero informacao', 'explica o programa')
  ) {
    facts['customer_goal'] = 'entender_programa';
  } else if (
    !isNegation &&
    // "minha casa minha vida" sem sinal de entender = intenção de comprar
    // T9.15C: vocabulário natural real adicionado ("compro sozinho", "vou comprar", etc.)
    contains(n, 'minha casa minha vida', 'quero comprar', 'comprar imovel',
      'financiamento', 'programa habitacional', 'casa propria', 'quero a casa',
      'quero um imovel', 'quero financiar', 'minha casa', 'financiar imovel',
      'compro sozinho', 'compro sozinha', 'vou comprar', 'pretendo comprar',
      'gostaria de comprar', 'tenho interesse')
  ) {
    facts['customer_goal'] = 'comprar_imovel';
  } else if (contains(n, 'enviar documentos', 'enviar docs', 'mandar documentos', 'mando os docs')) {
    facts['customer_goal'] = 'enviar_docs';
  } else if (contains(n, 'quero visitar', 'agendar visita', 'ver o imovel', 'ver o apartamento')) {
    facts['customer_goal'] = 'visitar_imovel';
  }

  // nome_completo: heurística conservadora — texto simples que parece um nome próprio
  const nomeCandidate = extractNomeCompletoCandidato(n, original);
  if (nomeCandidate !== null) {
    facts['nome_completo'] = nomeCandidate;
  }

  // nacionalidade no topo (rota canônica T9.15E: coletar antes de estado civil)
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

  // Confirmação contextual de RNM — quando sistema estava aguardando resposta sobre RNM (T9.16A)
  if (pendingObjective === 'perguntar_rnm_e_validade') {
    if (
      contains(n, 'sim', 'tenho', 'possuo', 'prazo indeterminado', 'indeterminado',
        'sem prazo', 'permanente', 'por tempo indeterminado')
    ) {
      facts['rnm_valido'] = true;
    } else if (
      contains(n, 'nao', 'nao tenho', 'nao possuo', 'determinado', 'tem validade',
        'com validade', 'vence', 'expira', 'prazo determinado')
    ) {
      facts['rnm_valido'] = false;
    }
  }

  // rnm_valido — negação primeiro para evitar falsos positivos ("Não tenho RNM" tem "tenho rnm")
  if (facts['rnm_valido'] === undefined) {
    if (
      contains(n, 'sem rnm', 'nao tenho rnm', 'rnm invalido', 'rnm vencido', 'rnm expirado')
    ) {
      facts['rnm_valido'] = false;
    } else if (
      contains(n, 'rnm valido', 'rnm ok', 'tenho rnm', 'meu rnm', 'registro valido', 'rnm em dia')
    ) {
      facts['rnm_valido'] = true;
    }
  }

  return facts;
}

function extractQualificationCivil(n: string, pendingObjective?: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // Confirmação contextual de estado civil — quando sistema estava aguardando estado civil (T9.16A)
  if (
    pendingObjective === 'coletar_estado_civil' ||
    pendingObjective === 'avancar_para_qualification_civil' ||
    pendingObjective === 'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).'
  ) {
    if (contains(n, 'solteiro', 'solteira')) {
      facts['estado_civil'] = 'solteiro';
    } else if (contains(n, 'casado', 'casada')) {
      facts['estado_civil'] = 'casado_civil';
    } else if (contains(n, 'uniao', 'junto', 'junta', 'amasiado', 'amasiada')) {
      facts['estado_civil'] = 'uniao_estavel';
    } else if (contains(n, 'divorciado', 'divorciada', 'separado', 'separada')) {
      facts['estado_civil'] = 'divorciado';
    } else if (contains(n, 'viuvo', 'viuva')) {
      facts['estado_civil'] = 'viuvo';
    }
  }

  // Confirmação contextual de processo — quando sistema estava aguardando processo (T9.16A)
  if (pendingObjective === 'coletar_processo') {
    if (contains(n, 'sozinho', 'sozinha', 'so eu', 'apenas eu')) {
      facts['processo'] = 'solo';
    } else if (
      contains(n, 'junto', 'juntos', 'conjuge', 'esposa', 'marido', 'companheiro', 'companheira')
    ) {
      facts['processo'] = 'conjunto';
    }
  }

  // estado_civil — keywords específicas (apenas quando contextual não resolveu)
  if (facts['estado_civil'] === undefined) {
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
  }

  // processo — keywords específicas (apenas quando contextual não resolveu)
  if (facts['processo'] === undefined) {
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
  pendingObjective?: string,
): Record<string, unknown> {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) return {};

    const n = normalize(text);
    if (!n) return {};

    switch (stage) {
      case 'discovery':
        return extractDiscovery(n, text, pendingObjective);
      case 'qualification_civil':
        return extractQualificationCivil(n, pendingObjective);
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
