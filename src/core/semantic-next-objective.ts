/**
 * ENOVA 2 — Core Mecânico 2 — Mapper Semântico de next_objective (T9.15F)
 *
 * Converte códigos internos opacos de next_objective em instruções semânticas
 * humanamente compreensíveis antes de chegarem ao LLM.
 *
 * INVIOLÁVEL: este mapper NÃO altera a decisão do Core (stage, block_advance, gates).
 * Apenas transforma a string next_objective em instrução acionável para a LLM.
 * O Core permanece soberano. O LLM recebe objetivo humano — nunca código interno.
 *
 * Lacunas (códigos sem mapeamento): retorna o código original sem modificação.
 * Isso permite detectar lacunas em smoke sem quebrar o pipeline.
 *
 * Ponto de aplicação: canary-pipeline.ts, na montagem de LlmContext.
 * NÃO aplicar no Core Engine — Core emite códigos estruturais, mapper é camada de tradução.
 */

const SEMANTIC_MAP: Readonly<Record<string, string>> = {
  // --- Topo (discovery) ---
  'apresentar_e_verificar_conhecimento':
    'Se apresentar como Enova, especialista em Minha Casa Minha Vida. Perguntar de forma '
    + 'natural se o cliente já conhece o programa ou se gostaria de entender como funciona. '
    + 'Tom: acolhedor, sem pressão.',
  'coletar_customer_goal':
    'Perguntar se o cliente tem interesse em comprar um imóvel pelo Minha Casa Minha Vida.',
  'explicar_mcmv_e_coletar_nome_completo':
    'Explicar rapidamente que o Minha Casa Minha Vida pode facilitar a compra do imóvel com condições melhores conforme o perfil e pedir o nome completo.',
  'perguntar_nacionalidade':
    'Perguntar se o cliente é brasileiro(a) ou estrangeiro(a).',
  'perguntar_rnm_e_validade':
    'Perguntar se o cliente possui RNM (Registro Nacional Migratório) por prazo indeterminado. Deixar claro que apenas RNM por prazo indeterminado é aceito pelo programa MCMV — RNM com data de validade não é permitido, independente de estar vigente.',
  'verificar_alternativa_rnm':
    'Informar ao cliente que o RNM com data de validade não é aceito pelo programa MCMV '
    + '(financiamento de até 35 anos requer prazo indeterminado). Perguntar se possui cônjuge '
    + 'ou familiar brasileiro que possa fazer o financiamento, pois nesse caso é possível '
    + 'seguir o processo no nome dessa pessoa.',
  'encerrar_sem_alternativa_rnm':
    'Informar com empatia que infelizmente sem RNM por prazo indeterminado e sem cônjuge ou '
    + 'familiar brasileiro, não é possível seguir com o financiamento pelo MCMV no momento. '
    + 'Orientar que assim que regularizar o RNM (obter prazo indeterminado), pode retornar '
    + 'que a Enova estará aqui para ajudar. Encerrar deixando a porta aberta.',

  // Topo → civil: já semi-semântico na origem (TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL)
  // Mapper padroniza para versão canônica com "(a)".
  'Perguntar estado civil: solteiro, casado, união estável ou divorciado.':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',

  // --- Meio A (qualification_civil) ---
  'coletar_estado_civil':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
  'avancar_para_qualification_civil':
    'Perguntar estado civil: solteiro(a), casado(a), união estável ou divorciado(a).',
  'coletar_processo':
    'Perguntar se pretende comprar sozinho(a) ou com alguém.',
  'avancar_para_qualification_renda':
    'Perguntar regime de trabalho e renda mensal.',

  // --- Meio B (qualification_renda) ---
  'coletar_regime_trabalho':
    'Perguntar se trabalha CLT, autônomo, servidor público, aposentado ou outro regime.',
  'coletar_renda_principal':
    'Perguntar a renda mensal aproximada.',
};

/**
 * Converte um código opaco de next_objective em instrução semântica para o LLM.
 *
 * Para códigos sem mapeamento conhecido: retorna o código original sem modificação.
 * Lacunas são intencionais — mapper mínimo cobre apenas os objetivos críticos do funil
 * principal. Códigos de trilhas especiais (P3, multi, composição complexa) retornam
 * o código original até que um mapeamento seja definido.
 */
export function toSemanticNextObjective(code: string): string {
  return SEMANTIC_MAP[code] ?? code;
}

/**
 * Verifica se um código tem mapeamento semântico definido.
 * Útil para smoke e diagnóstico de lacunas.
 */
export function hasSemanticMapping(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(SEMANTIC_MAP, code);
}

/**
 * Retorna todos os mapeamentos definidos — para inspeção e testes.
 */
export function getAllSemanticMappings(): Readonly<Record<string, string>> {
  return SEMANTIC_MAP;
}
