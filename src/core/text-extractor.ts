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

  // Confirmação contextual de greeting — quando sistema perguntou se conhece o MCMV (T9.16C)
  // PRIMEIRO bloco: captura resposta ao greeting antes de qualquer extração por keyword.
  // Guard: nunca sobrescreve customer_goal já capturado por outro mecanismo.
  if (facts['customer_goal'] === undefined && pendingObjective === 'apresentar_e_verificar_conhecimento') {
    // Negação PRIMEIRO — "não conheço" contém "conheco" como substring; negativo tem prioridade
    if (
      contains(n, 'nao', 'nao conheco', 'nao sei', 'nunca ouvi', 'primeira vez',
        'desconheco', 'nao ouvi', 'nao tenho', 'nenhuma')
    ) {
      facts['customer_goal'] = 'entender_programa';
      facts['conhece_mcmv'] = false;
    } else if (
      contains(n, 'sim', 'ja conheco', 'conheco', 'sei', 'claro', 'ja sei')
    ) {
      facts['customer_goal'] = 'comprar_imovel';
      facts['conhece_mcmv'] = true;
    }
  }

  // Negação explícita bloqueia intenção de compra ("não quero comprar nada agora")
  const isNegation = contains(n, 'nao quero comprar', 'nao tenho interesse em comprar');

  // Extração por keyword — guardado para não sobrescrever bloco contextual acima (T9.16C)
  if (facts['customer_goal'] === undefined) {
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
  }

  // nome_completo: captura contextual quando cliente fornece nome junto à resposta de MCMV
  // ex: "Não conheço, sou Bruno Vasques" / "Sim, me chamo Ana Silva"
  if (facts['nome_completo'] === undefined) {
    if (
      pendingObjective === 'apresentar_e_verificar_conhecimento' ||
      pendingObjective === 'Apresente-se como Enova, especialista em Minha Casa Minha Vida. Faça APENAS UMA pergunta: o cliente já conhece o programa Minha Casa Minha Vida? NÃO peça nome neste turno. NÃO faça mais nenhuma pergunta. Aguarde a resposta antes de continuar.'
    ) {
      const nomeMatch = original.match(/(?:sou|me chamo|meu nome[eé é]+|chamo[- ]me)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)+)/i);
      if (nomeMatch) {
        facts['nome_completo'] = nomeMatch[1];
      }
    }
  }

  // nome_completo: heurística conservadora — texto simples que parece um nome próprio
  const nomeCandidate = extractNomeCompletoCandidato(n, original);
  if (nomeCandidate !== null) {
    facts['nome_completo'] = nomeCandidate;
  }

  // nacionalidade (T9.28: bloco contextual + fallback conservador para evitar falso positivo em
  // "Nao tenho familiar brasileiro" quando pendingObjective=verificar_alternativa_rnm)
  if (facts['nacionalidade'] === undefined) {
    if (pendingObjective === 'perguntar_nacionalidade') {
      if (contains(n, 'brasileiro', 'brasileira', 'nasci no brasil', 'sou do brasil')) {
        facts['nacionalidade'] = 'brasileiro';
      } else if (
        contains(n, 'estrangeiro', 'estrangeira', 'nasci fora',
          'nao sou brasileiro', 'nao sou brasileira')
      ) {
        facts['nacionalidade'] = 'estrangeiro';
      } else if (contains(n, 'naturalizado', 'naturalizada', 'naturalizacao')) {
        facts['nacionalidade'] = 'naturalizado';
      }
    }
    if (facts['nacionalidade'] === undefined) {
      if (
        contains(n, 'sou brasileiro', 'sou brasileira', 'nasci no brasil', 'sou do brasil')
      ) {
        facts['nacionalidade'] = 'brasileiro';
      } else if (
        contains(n, 'sou estrangeiro', 'sou estrangeira',
          'nao sou brasileiro', 'nao sou brasileira', 'sou de outro pais', 'sou imigrante')
      ) {
        facts['nacionalidade'] = 'estrangeiro';
      } else if (contains(n, 'naturalizado', 'naturalizada', 'naturalizacao')) {
        facts['nacionalidade'] = 'naturalizado';
      }
    }
  }

  // Confirmação contextual de RNM — 3 camadas (específico→explícito→genérico) (T9.16A/T9.26/T9.27)
  if (facts['rnm_valido'] === undefined) {
    if (
      pendingObjective === 'perguntar_rnm_e_validade' ||
      pendingObjective === 'Perguntar se o cliente possui RNM (Registro Nacional Migratório) por prazo indeterminado. Deixar claro que apenas RNM por prazo indeterminado é aceito pelo programa MCMV — RNM com data de validade não é permitido, independente de estar vigente.'
    ) {
      // camada 1: negativo específico — RNM com prazo/validade
      if (contains(n, 'tem validade', 'com validade', 'vence', 'expira', 'prazo determinado')) {
        facts['rnm_valido'] = false;
      // camada 2: negação explícita — "nao tenho", "nao possuo"
      } else if (contains(n, 'nao tenho', 'nao possuo')) {
        facts['rnm_valido'] = false;
      // camada 3: positivo específico — prazo indeterminado e equivalentes
      } else if (
        contains(n, 'prazo indeterminado', 'indeterminado', 'sem prazo',
          'permanente', 'por tempo indeterminado')
      ) {
        facts['rnm_valido'] = true;
      // camada 4: genérico — "sim"/"tenho" positivo, "nao" negativo
      } else if (contains(n, 'sim', 'tenho', 'possuo')) {
        facts['rnm_valido'] = true;
      } else if (contains(n, 'nao')) {
        facts['rnm_valido'] = false;
      }
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

  // alternativa_rnm — quando RNM é inválido, verificar se tem cônjuge/familiar brasileiro (T9.16B/T9.27)
  if (facts['alternativa_rnm'] === undefined) {
    if (
      pendingObjective === 'verificar_alternativa_rnm' ||
      pendingObjective === 'Informar ao cliente que o RNM com data de validade não é aceito pelo programa MCMV (financiamento de até 35 anos requer prazo indeterminado). Perguntar se possui cônjuge ou familiar brasileiro que possa fazer o financiamento, pois nesse caso é possível seguir o processo no nome dessa pessoa.'
    ) {
      // negativo específico: sem familiar
      if (contains(n, 'nao tenho familiar', 'nao tenho parente', 'sem familiar')) {
        facts['alternativa_rnm'] = 'sem_familiar_brasileiro';
      // negativo específico: sem cônjuge
      } else if (
        contains(n, 'nao tenho conjuge', 'nao tenho esposa', 'nao tenho marido',
          'nao tenho companheiro', 'nao tenho companheira')
      ) {
        facts['alternativa_rnm'] = 'sem_conjuge_brasileiro';
      // negativo genérico
      } else if (contains(n, 'nao tenho', 'nao tem', 'ninguem', 'sem alternativa', 'nenhum')) {
        facts['alternativa_rnm'] = 'sem_alternativa';
      // positivo: cônjuge
      } else if (
        contains(n, 'esposa', 'marido', 'conjuge', 'companheiro', 'companheira')
      ) {
        facts['alternativa_rnm'] = 'tem_conjuge_brasileiro';
      // positivo: familiar
      } else if (
        contains(n, 'mae', 'pai', 'irmao', 'irma', 'filho', 'filha', 'familiar', 'parente')
      ) {
        facts['alternativa_rnm'] = 'tem_familiar_brasileiro';
      }
    }
  }
  // Keywords diretas sem contexto — apenas frases específicas para evitar falsos positivos
  if (facts['alternativa_rnm'] === undefined) {
    if (contains(n, 'minha esposa e brasileira', 'meu marido e brasileiro')) {
      facts['alternativa_rnm'] = 'tem_conjuge_brasileiro';
    } else if (contains(n, 'conjuge brasileiro', 'familiar brasileiro', 'parente brasileiro')) {
      facts['alternativa_rnm'] = 'tem_familiar_brasileiro';
    }
  }

  // processo — captura contextual quando sistema aguardava resposta sobre processo (T9.17D)
  // Necessário porque stage ainda é 'discovery' quando cliente responde sobre processo após topo.
  if (facts['processo'] === undefined) {
    if (
      pendingObjective === 'avancar_para_qualification_civil' ||
      pendingObjective === 'Perguntar estado civil: solteiro, casado, união estável ou divorciado.' ||
      pendingObjective === 'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).'
    ) {
      if (contains(n, 'sozinho', 'sozinha', 'so eu', 'apenas eu', 'eu so', 'individual')) {
        facts['processo'] = 'solo';
      } else if (
        contains(n, 'junto', 'conjuge', 'esposa', 'marido', 'companheiro', 'companheira',
          'nos dois', 'minha esposa', 'meu marido')
      ) {
        facts['processo'] = 'conjunto';
      } else if (
        contains(n, 'mae', 'pai', 'irma', 'irmao', 'filho', 'filha',
          'familiar', 'parente', 'composicao')
      ) {
        facts['processo'] = 'composicao_familiar';
      }
    }
  }

  // estado_civil contextual em discovery (T9.24)
  // Reativado após T9.21 ter mudado avancar_para_qualification_civil para perguntar
  // estado civil (não processo). Stage só muda no próximo turno — precisamos capturar
  // estado_civil em discovery quando o LLM já perguntou estado civil neste turno.
  if (facts['estado_civil'] === undefined) {
    if (
      pendingObjective === 'Perguntar APENAS o estado civil do cliente: solteiro(a), casado(a) no civil, união estável ou divorciado(a)/viúvo(a). Uma pergunta só. Não perguntar mais nada.' ||
      pendingObjective === 'avancar_para_qualification_civil' ||
      pendingObjective === 'coletar_estado_civil'
    ) {
      if (contains(n, 'solteiro', 'solteira')) facts['estado_civil'] = 'solteiro';
      else if (contains(n, 'casado no civil', 'casada no civil', 'casamento civil')) facts['estado_civil'] = 'casado_civil';
      else if (contains(n, 'casado', 'casada')) facts['estado_civil'] = 'casado_civil';
      else if (contains(n, 'uniao estavel', 'união estável', 'amasiado', 'amasiada')) facts['estado_civil'] = 'uniao_estavel';
      else if (contains(n, 'divorciado', 'divorciada', 'separado', 'separada')) facts['estado_civil'] = 'divorciado';
      else if (contains(n, 'viuvo', 'viúva', 'viuva')) facts['estado_civil'] = 'viuvo';
    }
  }

  // estado_civil_p3 contextual em discovery — stage pode ainda ser discovery quando LLM
  // já perguntou estado civil do familiar (coletar_estado_civil_p3). (T9.27)
  if (facts['estado_civil_p3'] === undefined) {
    if (
      pendingObjective === 'coletar_estado_civil_p3' ||
      pendingObjective === 'Perguntar qual é o estado civil do familiar ou pessoa que vai entrar na composição. Solteiro(a), casado(a) no civil, união estável ou divorciado(a).'
    ) {
      if (contains(n, 'solteiro', 'solteira')) facts['estado_civil_p3'] = 'solteiro';
      else if (contains(n, 'casado no civil', 'casada no civil', 'casamento civil')) facts['estado_civil_p3'] = 'casado_civil';
      else if (contains(n, 'casado', 'casada')) facts['estado_civil_p3'] = 'casado_civil';
      else if (contains(n, 'uniao estavel', 'uniao', 'amasiado', 'amasiada')) facts['estado_civil_p3'] = 'uniao_estavel';
      else if (contains(n, 'divorciado', 'divorciada', 'separado', 'separada')) facts['estado_civil_p3'] = 'divorciado';
      else if (contains(n, 'viuvo', 'viuva')) facts['estado_civil_p3'] = 'viuvo';
    }
  }

  return facts;
}

function extractQualificationCivil(n: string, original: string, pendingObjective?: string): Record<string, unknown> {
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
  if (facts['estado_civil'] === undefined && pendingObjective !== 'coletar_estado_civil_p3') {
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

  // composition_actor — quem é o familiar/parceiro na composição (T9.17A)
  if (facts['composition_actor'] === undefined) {
    if (
      pendingObjective === 'coletar_composition_actor' ||
      contains(n, 'minha mae', 'meu pai', 'minha irma', 'meu irmao',
        'minha filha', 'meu filho', 'minha avo', 'meu avo')
    ) {
      if (contains(n, 'mae')) facts['composition_actor'] = 'mae';
      else if (contains(n, 'pai')) facts['composition_actor'] = 'pai';
      else if (contains(n, 'irma')) facts['composition_actor'] = 'irmao';
      else if (contains(n, 'irmao')) facts['composition_actor'] = 'irmao';
      else if (contains(n, 'filha')) facts['composition_actor'] = 'outro';
      else if (contains(n, 'filho')) facts['composition_actor'] = 'outro';
      else if (contains(n, 'avo')) facts['composition_actor'] = 'outro';
    }
    if (contains(n, 'namorada', 'namorado', 'noiva', 'noivo')) {
      facts['composition_actor'] = 'parceiro';
    }
    if (
      contains(n, 'esposa', 'marido', 'conjuge', 'companheiro', 'companheira') &&
      facts['composition_actor'] === undefined
    ) {
      facts['composition_actor'] = 'conjuge';
    }
  }

  // estado_civil_p3 — estado civil do familiar/parceiro (nunca sobrescreve estado_civil do lead)
  if (facts['estado_civil_p3'] === undefined) {
    if (
      pendingObjective === 'coletar_estado_civil_p3' ||
      pendingObjective === 'Perguntar qual é o estado civil do familiar ou pessoa que vai entrar na composição. Solteiro(a), casado(a) no civil, união estável ou divorciado(a).'
    ) {
      if (contains(n, 'solteiro', 'solteira')) {
        facts['estado_civil_p3'] = 'solteiro';
      } else if (contains(n, 'casado no civil', 'casada no civil', 'casamento civil')) {
        facts['estado_civil_p3'] = 'casado_civil';
      } else if (contains(n, 'casado', 'casada')) {
        facts['estado_civil_p3'] = 'casado_civil';
      } else if (
        contains(n, 'uniao estavel', 'uniao', 'amasiado', 'amasiada')
      ) {
        facts['estado_civil_p3'] = 'uniao_estavel';
      } else if (contains(n, 'divorciado', 'divorciada', 'separado', 'separada')) {
        facts['estado_civil_p3'] = 'divorciado';
      } else if (contains(n, 'viuvo', 'viuva')) {
        facts['estado_civil_p3'] = 'viuvo';
      }
    }
  }

  // regime_trabalho cross-stage: cliente responde em qualification_civil antes de avançar (T9.26)
  if (facts['regime_trabalho'] === undefined) {
    if (
      pendingObjective === 'avancar_para_qualification_renda' ||
      pendingObjective === 'coletar_regime_trabalho' ||
      pendingObjective === 'Perguntar regime de trabalho e renda mensal.' ||
      pendingObjective === 'Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime.'
    ) {
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
    }
  }

  // renda_principal cross-stage: cliente responde em qualification_civil antes de avançar (T9.26)
  if (facts['renda_principal'] === undefined) {
    if (
      pendingObjective === 'avancar_para_qualification_renda' ||
      pendingObjective === 'coletar_renda_principal' ||
      pendingObjective === 'Perguntar regime de trabalho e renda mensal.' ||
      pendingObjective === 'Perguntar a renda mensal aproximada.'
    ) {
      const renda = parseRendaFlexivel(original);
      if (renda !== undefined) {
        facts['renda_principal'] = renda;
      }
    }
  }

  // dependents_applicable — tem dependente menor 18 anos ou parente até 3º grau sem renda/CNPJ
  if (facts['dependents_applicable'] === undefined) {
    if (pendingObjective === 'coletar_dependents_applicable') {
      if (
        contains(n, 'sim', 'tenho', 'possuo', 'tenho filho', 'tenho filha', 'tenho dependente')
      ) {
        facts['dependents_applicable'] = true;
      } else if (contains(n, 'nao', 'nenhum')) {
        facts['dependents_applicable'] = false;
      }
    }
    if (
      contains(n, 'tenho filho', 'tenho filha', 'tenho dependente', 'filho menor', 'filha menor') &&
      facts['dependents_applicable'] === undefined
    ) {
      facts['dependents_applicable'] = true;
    }
  }

  // dependents_count — quantos dependentes
  if (facts['dependents_count'] === undefined) {
    if (pendingObjective === 'coletar_dependents_count') {
      const numMatch = n.match(/\b([1-9])\b/);
      if (numMatch) {
        facts['dependents_count'] = parseInt(numMatch[1], 10);
      } else if (contains(n, 'um ', 'uma ')) {
        facts['dependents_count'] = 1;
      } else if (contains(n, 'dois', 'duas')) {
        facts['dependents_count'] = 2;
      } else if (contains(n, 'tres')) {
        facts['dependents_count'] = 3;
      }
    }
  }

  return facts;
}

function extractQualificationRenda(n: string, original: string, pendingObjective?: string): Record<string, unknown> {
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
  const renda = parseRendaFlexivel(original);
  if (renda !== undefined) {
    facts['renda_principal'] = renda;
  }

  // autonomo_tem_ir — autônomo declarou IR nos últimos 2 anos (T9.17A)
  if (facts['autonomo_tem_ir'] === undefined) {
    if (pendingObjective === 'coletar_autonomo_tem_ir') {
      if (
        contains(n, 'sim', 'declaro', 'declarei', 'tenho ir', 'faco ir')
      ) {
        facts['autonomo_tem_ir'] = true;
      } else if (
        contains(n, 'nao', 'nao declaro', 'nao declarei', 'nenhum')
      ) {
        facts['autonomo_tem_ir'] = false;
      }
    }
    if (
      contains(n, 'declaro imposto', 'declarei imposto', 'faco declaracao',
        'declaro ir', 'declarei ir', 'fiz declaracao') &&
      facts['autonomo_tem_ir'] === undefined
    ) {
      facts['autonomo_tem_ir'] = true;
    }
    if (
      contains(n, 'nao declaro imposto', 'nunca declarei', 'nao faco declaracao') &&
      facts['autonomo_tem_ir'] === undefined
    ) {
      facts['autonomo_tem_ir'] = false;
    }
  }

  // ctps_36 — CTPS ativa há pelo menos 36 meses (T9.17A)
  if (facts['ctps_36'] === undefined) {
    if (pendingObjective === 'coletar_ctps_36') {
      if (
        contains(n, 'sim', 'tenho', 'mais de 3 anos', 'mais de tres anos')
      ) {
        facts['ctps_36'] = true;
      } else if (
        contains(n, 'nao', 'menos de 3 anos', 'menos de tres')
      ) {
        facts['ctps_36'] = false;
      }
    }
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

// Mapa de extensos numéricos em português para extração de renda
const EXTENSOS_MIL: Readonly<Record<string, number>> = {
  'um': 1, 'dois': 2, 'tres': 3, 'quatro': 4, 'cinco': 5,
  'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
};
const EXTENSOS_CENTENA: Readonly<Record<string, number>> = {
  'cem': 100, 'duzentos': 200, 'trezentos': 300, 'quatrocentos': 400,
  'quinhentos': 500, 'seiscentos': 600, 'setecentos': 700,
  'oitocentos': 800, 'novecentos': 900,
};

/**
 * Parser de renda estendido: aceita R$, "X mil", extensos, número puro e notação k.
 * Range válido: 500–100000. Retorna undefined se não parsear.
 */
function parseRendaFlexivel(original: string): number | undefined {
  // Normaliza acentos para matching de extensos ("três" → "tres")
  const tn = original
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. "[word|N] mil e [N|word_centena]" — "três mil e quinhentos", "3 mil e 500"
  const milEMatch = tn.match(/(?:(\d+(?:[,.]\d+)?)|([a-z]+))\s+mil\s+e\s+(?:(\d+)|([a-z]+))/);
  if (milEMatch) {
    const milNum = milEMatch[1]
      ? parseFloat(milEMatch[1].replace(',', '.'))
      : (EXTENSOS_MIL[milEMatch[2] ?? ''] ?? NaN);
    if (!isNaN(milNum)) {
      let rest = 0;
      if (milEMatch[3]) rest = parseInt(milEMatch[3], 10);
      else if (milEMatch[4]) rest = EXTENSOS_CENTENA[milEMatch[4] ?? ''] ?? EXTENSOS_MIL[milEMatch[4] ?? ''] ?? 0;
      const total = Math.round(milNum * 1000) + rest;
      if (total >= 500 && total <= 100000) return total;
    }
  }

  // 2. "[word] mil" — "três mil", "dois mil" (word extenso sem "e")
  const milWordMatch = tn.match(/\b([a-z]+)\s+mil\b/);
  if (milWordMatch) {
    const milVal = EXTENSOS_MIL[milWordMatch[1]];
    if (milVal !== undefined) {
      const total = milVal * 1000;
      if (total >= 500 && total <= 100000) return total;
    }
  }

  // 3. Formatos R$, "N mil" numérico, keyword-preceded (extractRenda existente)
  const via = extractRenda(original);
  if (via !== null && via >= 500 && via <= 100000) return via;

  // 4. Número puro: "2500", "4500"
  const pureMatch = tn.match(/^(\d+)$/);
  if (pureMatch) {
    const v = parseInt(pureMatch[1], 10);
    if (v >= 500 && v <= 100000) return v;
  }

  // 5. Notação k: "3k", "3,5k"
  const kMatch = tn.match(/\b(\d+(?:[,.]\d+)?)\s*k\b/);
  if (kMatch) {
    const v = Math.round(parseFloat(kMatch[1].replace(',', '.')) * 1000);
    if (v >= 500 && v <= 100000) return v;
  }

  return undefined;
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
        return extractQualificationCivil(n, text, pendingObjective);
      case 'qualification_renda':
        return extractQualificationRenda(n, text, pendingObjective);
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
