// smoke:core:text-extractor — T9.6
// Valida que extractFactsFromText extrai corretamente por stage.
// Exit 0 = todos os checks passaram.

import { extractFactsFromText } from './text-extractor.ts';

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

function eq(label: string, got: unknown, expected: unknown): void {
  check(label, got === expected, `got: ${JSON.stringify(got)} expected: ${JSON.stringify(expected)}`);
}

function empty(label: string, result: Record<string, unknown>): void {
  check(label, Object.keys(result).length === 0, `got keys: ${Object.keys(result).join(', ') || '(none)'}`);
}

function noThrow(label: string, fn: () => unknown): void {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${label}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${label} — threw: ${String(e)}`);
  }
}

console.log('\n=== smoke:core:text-extractor — T9.6 ===\n');

// ── discovery ────────────────────────────────────────────────────────────────
console.log('── discovery ──');

eq('D1: "quero comprar" → customer_goal comprar_imovel',
  extractFactsFromText('Quero comprar uma casa', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D2: "minha casa minha vida" → customer_goal comprar_imovel',
  extractFactsFromText('Quero saber sobre minha casa minha vida', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D3: "financiamento" → customer_goal comprar_imovel',
  extractFactsFromText('Tenho interesse em financiamento', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D4: "como funciona" → customer_goal entender_programa',
  extractFactsFromText('Como funciona o MCMV?', 'discovery')['customer_goal'],
  'entender_programa');

eq('D5: "quero entender" → customer_goal entender_programa',
  extractFactsFromText('Quero entender melhor o programa', 'discovery')['customer_goal'],
  'entender_programa');

eq('D6: "quero saber sobre" → customer_goal entender_programa',
  extractFactsFromText('Quero saber sobre o programa', 'discovery')['customer_goal'],
  'entender_programa');

// T9.15C — Linguagem natural real (discovery) ─────────────────────────────────
console.log('\n── discovery — T9.15C ──');

eq('D-C1: frase real do canary → customer_goal comprar_imovel',
  extractFactsFromText('Sou solteiro, compro sozinho e ganho 3500 CLT.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C2: "Compro sozinho" isolado → customer_goal comprar_imovel',
  extractFactsFromText('Compro sozinho.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C3: "Vou comprar um apartamento" → customer_goal comprar_imovel',
  extractFactsFromText('Vou comprar um apartamento.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C4: "Tenho interesse no programa" → customer_goal comprar_imovel',
  extractFactsFromText('Tenho interesse no programa.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C5: "Quero participar do Minha Casa Minha Vida" → customer_goal comprar_imovel',
  extractFactsFromText('Quero participar do Minha Casa Minha Vida.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C6: "Pretendo comprar pelo MCMV" → customer_goal comprar_imovel',
  extractFactsFromText('Pretendo comprar pelo MCMV.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C7: "Gostaria de comprar uma casa" → customer_goal comprar_imovel',
  extractFactsFromText('Gostaria de comprar uma casa.', 'discovery')['customer_goal'],
  'comprar_imovel');

eq('D-C8: "Quero financiar meu imóvel" → customer_goal comprar_imovel',
  extractFactsFromText('Quero financiar meu imóvel.', 'discovery')['customer_goal'],
  'comprar_imovel');

// T9.15E — nome_completo em discovery ────────────────────────────────────────
console.log('\n── discovery — nome_completo T9.15E ──');

eq('D-N1: "Bruno Vasques" → nome_completo preservado',
  extractFactsFromText('Bruno Vasques', 'discovery')['nome_completo'],
  'Bruno Vasques');

eq('D-N2: "Maria Santos Silva" → nome_completo preservado',
  extractFactsFromText('Maria Santos Silva', 'discovery')['nome_completo'],
  'Maria Santos Silva');

eq('D-N3: "João Carlos Oliveira" → nome_completo preservado',
  extractFactsFromText('João Carlos Oliveira', 'discovery')['nome_completo'],
  'João Carlos Oliveira');

// Negativos: textos funcionais não devem ser capturados como nome
{
  const r4 = extractFactsFromText('Sou solteiro', 'discovery');
  check('D-N4: "Sou solteiro" → sem nome_completo', !('nome_completo' in r4));
}
{
  const r5 = extractFactsFromText('Olá tudo bem', 'discovery');
  check('D-N5: "Olá tudo bem" → sem nome_completo', !('nome_completo' in r5));
}
{
  const r6 = extractFactsFromText('Sou brasileiro', 'discovery');
  check('D-N6: "Sou brasileiro" → sem nome_completo', !('nome_completo' in r6));
}

// T9.15E — nacionalidade em discovery ────────────────────────────────────────
console.log('\n── discovery — nacionalidade T9.15E ──');

eq('D-E1: "Sou brasileiro" no discovery → nacionalidade brasileiro',
  extractFactsFromText('Sou brasileiro', 'discovery')['nacionalidade'],
  'brasileiro');

eq('D-E2: "Sou brasileira" no discovery → nacionalidade brasileiro',
  extractFactsFromText('Sou brasileira', 'discovery')['nacionalidade'],
  'brasileiro');

eq('D-E3: "Sou estrangeiro" no discovery → nacionalidade estrangeiro',
  extractFactsFromText('Sou estrangeiro', 'discovery')['nacionalidade'],
  'estrangeiro');

eq('D-E4: "Sou naturalizado" no discovery → nacionalidade naturalizado',
  extractFactsFromText('Sou naturalizado', 'discovery')['nacionalidade'],
  'naturalizado');

// T9.15E — rnm_valido em discovery ───────────────────────────────────────────
console.log('\n── discovery — rnm_valido T9.15E ──');

{
  const r = extractFactsFromText('Meu RNM está válido', 'discovery');
  check('D-R1: "Meu RNM está válido" → rnm_valido true', r['rnm_valido'] === true, `got: ${r['rnm_valido']}`);
}
{
  const r = extractFactsFromText('Não tenho RNM', 'discovery');
  check('D-R2: "Não tenho RNM" → rnm_valido false', r['rnm_valido'] === false, `got: ${r['rnm_valido']}`);
}

// T9.15C — Regressões negativas (falsos positivos) ────────────────────────────
console.log('\n── discovery — regressões negativas T9.15C ──');

empty('D-N1: "Compro comida todo dia" → sem customer_goal',
  extractFactsFromText('Compro comida todo dia.', 'discovery'));

empty('D-N2: "Compro roupa às vezes" → sem customer_goal',
  extractFactsFromText('Compro roupa às vezes.', 'discovery'));

empty('D-N3: "Não quero comprar nada agora" → sem customer_goal (negação)',
  extractFactsFromText('Não quero comprar nada agora.', 'discovery'));

// ── qualification_civil ───────────────────────────────────────────────────────
console.log('\n── qualification_civil ──');

eq('C1: "sou solteira" → estado_civil solteiro',
  extractFactsFromText('Sou solteira', 'qualification_civil')['estado_civil'],
  'solteiro');

eq('C2: "sou solteiro" → estado_civil solteiro',
  extractFactsFromText('Eu sou solteiro', 'qualification_civil')['estado_civil'],
  'solteiro');

eq('C3: "sou casado" → estado_civil casado_civil',
  extractFactsFromText('Sou casado no civil', 'qualification_civil')['estado_civil'],
  'casado_civil');

eq('C4: "sou casada" → estado_civil casado_civil',
  extractFactsFromText('Eu sou casada', 'qualification_civil')['estado_civil'],
  'casado_civil');

eq('C5: "união estável" → estado_civil uniao_estavel',
  extractFactsFromText('Tenho união estável', 'qualification_civil')['estado_civil'],
  'uniao_estavel');

eq('C6: "moro junto" → estado_civil uniao_estavel',
  extractFactsFromText('Moro junto com meu namorado', 'qualification_civil')['estado_civil'],
  'uniao_estavel');

eq('C7: "divorciado" → estado_civil divorciado',
  extractFactsFromText('Sou divorciado', 'qualification_civil')['estado_civil'],
  'divorciado');

eq('C8: "viúva" → estado_civil viuvo',
  extractFactsFromText('Sou viúva', 'qualification_civil')['estado_civil'],
  'viuvo');

eq('C9: "sozinho" → processo solo',
  extractFactsFromText('Vou comprar sozinho', 'qualification_civil')['processo'],
  'solo');

eq('C10: "só eu" → processo solo',
  extractFactsFromText('Serei só eu mesmo', 'qualification_civil')['processo'],
  'solo');

eq('C11: "eu e minha esposa" → processo conjunto',
  extractFactsFromText('Vou fazer com eu e minha esposa', 'qualification_civil')['processo'],
  'conjunto');

eq('C12: "eu e meu marido" → processo conjunto',
  extractFactsFromText('Eu e meu marido queremos comprar', 'qualification_civil')['processo'],
  'conjunto');

eq('C13: "com minha mãe" → processo composicao_familiar',
  extractFactsFromText('Vou fazer com minha mãe', 'qualification_civil')['processo'],
  'composicao_familiar');

eq('C14: "com meus pais" → processo composicao_familiar',
  extractFactsFromText('Seria com meus pais', 'qualification_civil')['processo'],
  'composicao_familiar');

// ── qualification_renda ───────────────────────────────────────────────────────
console.log('\n── qualification_renda ──');

eq('R1: "CLT" → regime_trabalho clt',
  extractFactsFromText('Trabalho CLT', 'qualification_renda')['regime_trabalho'],
  'clt');

eq('R2: "carteira assinada" → regime_trabalho clt',
  extractFactsFromText('Tenho carteira assinada', 'qualification_renda')['regime_trabalho'],
  'clt');

eq('R3: "autônomo" → regime_trabalho autonomo',
  extractFactsFromText('Sou autônomo', 'qualification_renda')['regime_trabalho'],
  'autonomo');

eq('R4: "freelancer" → regime_trabalho autonomo',
  extractFactsFromText('Trabalho como freelancer', 'qualification_renda')['regime_trabalho'],
  'autonomo');

eq('R5: "aposentado" → regime_trabalho aposentado',
  extractFactsFromText('Sou aposentado', 'qualification_renda')['regime_trabalho'],
  'aposentado');

eq('R6: "aposentadoria" → regime_trabalho aposentado',
  extractFactsFromText('Recebo aposentadoria', 'qualification_renda')['regime_trabalho'],
  'aposentado');

eq('R7: "servidor público" → regime_trabalho servidor',
  extractFactsFromText('Sou servidor público', 'qualification_renda')['regime_trabalho'],
  'servidor');

eq('R8: "funcionário público" → regime_trabalho servidor',
  extractFactsFromText('Trabalho como funcionário público', 'qualification_renda')['regime_trabalho'],
  'servidor');

eq('R9: "informal" → regime_trabalho informal',
  extractFactsFromText('Trabalho informal', 'qualification_renda')['regime_trabalho'],
  'informal');

eq('R10: "bico" → regime_trabalho informal',
  extractFactsFromText('Faço bico', 'qualification_renda')['regime_trabalho'],
  'informal');

const renda3500 = extractFactsFromText('Minha renda é R$ 3.500', 'qualification_renda')['renda_principal'];
check('R11: "R$ 3.500" → renda_principal 3500', renda3500 === 3500, `got: ${renda3500}`);

const renda4mil = extractFactsFromText('Ganho 4 mil por mês', 'qualification_renda')['renda_principal'];
check('R12: "ganho 4 mil" → renda_principal 4000', renda4mil === 4000, `got: ${renda4mil}`);

const renda2500 = extractFactsFromText('Recebo 2500 por mês', 'qualification_renda')['renda_principal'];
check('R13: "recebo 2500" → renda_principal 2500', renda2500 === 2500, `got: ${renda2500}`);

// ── qualification_eligibility ─────────────────────────────────────────────────
console.log('\n── qualification_eligibility ──');

eq('E1: "brasileiro" → nacionalidade brasileiro',
  extractFactsFromText('Sou brasileiro', 'qualification_eligibility')['nacionalidade'],
  'brasileiro');

eq('E2: "brasileira" → nacionalidade brasileiro',
  extractFactsFromText('Sou brasileira', 'qualification_eligibility')['nacionalidade'],
  'brasileiro');

eq('E3: "estrangeiro" → nacionalidade estrangeiro',
  extractFactsFromText('Sou estrangeiro', 'qualification_eligibility')['nacionalidade'],
  'estrangeiro');

eq('E4: "naturalizado" → nacionalidade naturalizado',
  extractFactsFromText('Sou naturalizado', 'qualification_eligibility')['nacionalidade'],
  'naturalizado');

// ── docs_prep ─────────────────────────────────────────────────────────────────
console.log('\n── docs_prep ──');

eq('P1: "por aqui" → docs_channel_choice whatsapp',
  extractFactsFromText('Posso mandar por aqui', 'docs_prep')['docs_channel_choice'],
  'whatsapp');

eq('P2: "whatsapp" → docs_channel_choice whatsapp',
  extractFactsFromText('Mando pelo WhatsApp', 'docs_prep')['docs_channel_choice'],
  'whatsapp');

eq('P3: "site" → docs_channel_choice site',
  extractFactsFromText('Prefiro pelo site', 'docs_prep')['docs_channel_choice'],
  'site');

eq('P4: "link" → docs_channel_choice site',
  extractFactsFromText('Me manda o link', 'docs_prep')['docs_channel_choice'],
  'site');

eq('P5: "presencial" → docs_channel_choice visita_presencial',
  extractFactsFromText('Prefiro ir pessoalmente', 'docs_prep')['docs_channel_choice'],
  'visita_presencial');

eq('P6: "plantão" → docs_channel_choice visita_presencial',
  extractFactsFromText('Posso ir ao plantão', 'docs_prep')['docs_channel_choice'],
  'visita_presencial');

// ── visit ─────────────────────────────────────────────────────────────────────
console.log('\n── visit ──');

eq('V1: "quero visitar" → visit_interest sim',
  extractFactsFromText('Quero visitar o imóvel', 'visit')['visit_interest'],
  'sim');

eq('V2: "sim" → visit_interest sim',
  extractFactsFromText('Sim, quero', 'visit')['visit_interest'],
  'sim');

eq('V3: "não quero" → visit_interest nao',
  extractFactsFromText('Não quero visitar agora', 'visit')['visit_interest'],
  'nao');

eq('V4: "talvez" → visit_interest talvez',
  extractFactsFromText('Talvez depois', 'visit')['visit_interest'],
  'talvez');

eq('V5: "vou ver" → visit_interest talvez',
  extractFactsFromText('Vou ver se consigo', 'visit')['visit_interest'],
  'talvez');

// ── T9.16A — confirmações contextuais ─────────────────────────────────────────
console.log('\n── T9.16A: confirmações contextuais ──');

eq('CTX1: "sim" + pendingObjective=perguntar_rnm_e_validade → rnm_valido=true',
  extractFactsFromText('sim', 'discovery', 'perguntar_rnm_e_validade')['rnm_valido'],
  true);

eq('CTX2: "prazo indeterminado" + pendingObjective=perguntar_rnm_e_validade → rnm_valido=true',
  extractFactsFromText('prazo indeterminado', 'discovery', 'perguntar_rnm_e_validade')['rnm_valido'],
  true);

eq('CTX3: "solteiro" + stage=qualification_civil + pendingObjective=coletar_estado_civil → estado_civil=solteiro',
  extractFactsFromText('solteiro', 'qualification_civil', 'coletar_estado_civil')['estado_civil'],
  'solteiro');

eq('CTX4: "nao" + pendingObjective=perguntar_rnm_e_validade → rnm_valido=false',
  extractFactsFromText('nao', 'discovery', 'perguntar_rnm_e_validade')['rnm_valido'],
  false);

eq('CTX5: "casado" + pendingObjective=coletar_estado_civil → estado_civil=casado_civil',
  extractFactsFromText('casado', 'qualification_civil', 'coletar_estado_civil')['estado_civil'],
  'casado_civil');

eq('CTX6: "sozinho" + pendingObjective=coletar_processo → processo=solo',
  extractFactsFromText('sozinho', 'qualification_civil', 'coletar_processo')['processo'],
  'solo');

eq('CTX7: "sim" sem pendingObjective → rnm_valido ausente (sem contexto, "sim" não deve extrair)',
  extractFactsFromText('sim', 'discovery', undefined)['rnm_valido'],
  undefined);

eq('CTX8: pendingObjective irrelevante não interfere em extração normal',
  extractFactsFromText('quero comprar uma casa', 'discovery', 'coletar_processo')['customer_goal'],
  'comprar_imovel');

// ── T9.16C — confirmação contextual de conhecimento MCMV (greeting) ──────────
console.log('\n── T9.16C: confirmação contextual greeting MCMV ──');

eq('CTX9: "sim" + pendingObjective=apresentar_e_verificar_conhecimento → customer_goal=comprar_imovel',
  extractFactsFromText('sim', 'discovery', 'apresentar_e_verificar_conhecimento')['customer_goal'],
  'comprar_imovel');

eq('CTX10: "já conheço" + pendingObjective=apresentar_e_verificar_conhecimento → customer_goal=comprar_imovel',
  extractFactsFromText('já conheço', 'discovery', 'apresentar_e_verificar_conhecimento')['customer_goal'],
  'comprar_imovel');

eq('CTX11: "não" + pendingObjective=apresentar_e_verificar_conhecimento → customer_goal=entender_programa',
  extractFactsFromText('não', 'discovery', 'apresentar_e_verificar_conhecimento')['customer_goal'],
  'entender_programa');

eq('CTX12: "não conheço" + pendingObjective=apresentar_e_verificar_conhecimento → customer_goal=entender_programa',
  extractFactsFromText('não conheço', 'discovery', 'apresentar_e_verificar_conhecimento')['customer_goal'],
  'entender_programa');

// segurança do bloco contextual greeting
eq('CTX13: "sim" sem pendingObjective → customer_goal ausente (sem contexto)',
  extractFactsFromText('sim', 'discovery', undefined)['customer_goal'],
  undefined);

eq('CTX14: pendingObjective=apresentar_e_verificar_conhecimento não interfere em rnm_valido',
  extractFactsFromText('sim', 'discovery', 'apresentar_e_verificar_conhecimento')['rnm_valido'],
  undefined);

// ── T9.17A — composição, dependentes, autonomo_tem_ir, ctps_36 ───────────────
console.log('\n── T9.17A: F2 completo (composição / dependentes / renda) ──');

eq('CTX15: "com minha mãe" → composition_actor=mae (qualification_civil)',
  extractFactsFromText('com minha mãe', 'qualification_civil')['composition_actor'],
  'mae');

eq('CTX16: "minha namorada" → composition_actor=parceiro (qualification_civil)',
  extractFactsFromText('minha namorada', 'qualification_civil')['composition_actor'],
  'parceiro');

eq('CTX17: "ela é casada no civil" + pendingObjective=coletar_estado_civil_p3 → estado_civil_p3=casado_civil',
  extractFactsFromText('ela é casada no civil', 'qualification_civil', 'coletar_estado_civil_p3')['estado_civil_p3'],
  'casado_civil');

eq('CTX18: "sim tenho 2 filhos" + pendingObjective=coletar_dependents_applicable → dependents_applicable=true',
  extractFactsFromText('sim tenho 2 filhos', 'qualification_civil', 'coletar_dependents_applicable')['dependents_applicable'],
  true);

eq('CTX19: "dois" + pendingObjective=coletar_dependents_count → dependents_count=2',
  extractFactsFromText('dois', 'qualification_civil', 'coletar_dependents_count')['dependents_count'],
  2);

eq('CTX20: "declaro ir" → autonomo_tem_ir=true (qualification_renda)',
  extractFactsFromText('declaro ir', 'qualification_renda')['autonomo_tem_ir'],
  true);

eq('CTX21: "sozinho" + pendingObjective=Estado civil coletado... + stage=discovery → processo=solo',
  extractFactsFromText(
    'sozinho',
    'discovery',
    'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).',
  )['processo'],
  'solo');

eq('CTX22: "com minha esposa" + pendingObjective=Estado civil coletado... + stage=discovery → processo=conjunto',
  extractFactsFromText(
    'com minha esposa',
    'discovery',
    'Estado civil coletado. Agora perguntar se o cliente pretende comprar sozinho(a) ou se vai ter alguém junto no processo — cônjuge, familiar ou parceiro(a).',
  )['processo'],
  'conjunto');

eq('CTX23: "Não conheço, sou Bruno Vasques" + pendingObjective=apresentar_e_verificar_conhecimento → nome_completo=Bruno Vasques',
  extractFactsFromText(
    'Não conheço, sou Bruno Vasques',
    'discovery',
    'apresentar_e_verificar_conhecimento',
  )['nome_completo'],
  'Bruno Vasques');

eq('CTX24: "Solteiro" + pendingObjective=Perguntar APENAS o estado civil... + stage=discovery → estado_civil=solteiro',
  extractFactsFromText(
    'Solteiro',
    'discovery',
    'Perguntar APENAS o estado civil do cliente: solteiro(a), casado(a) no civil, união estável ou divorciado(a)/viúvo(a). Uma pergunta só. Não perguntar mais nada.',
  )['estado_civil'],
  'solteiro');

eq('CTX25: "Nao tenho" + pendingObjective=perguntar_rnm_e_validade + stage=discovery → rnm_valido=false (negativas primeiro)',
  extractFactsFromText(
    'Nao tenho',
    'discovery',
    'perguntar_rnm_e_validade',
  )['rnm_valido'],
  false);

eq('CTX26: "Tenho prazo indeterminado" + pendingObjective=perguntar_rnm_e_validade + stage=discovery → rnm_valido=true',
  extractFactsFromText(
    'Tenho prazo indeterminado',
    'discovery',
    'perguntar_rnm_e_validade',
  )['rnm_valido'],
  true);

eq('CTX27: "casado no civil" + pendingObjective=coletar_estado_civil_p3 + stage=qualification_civil → estado_civil_p3=casado_civil',
  extractFactsFromText(
    'casado no civil',
    'qualification_civil',
    'coletar_estado_civil_p3',
  )['estado_civil_p3'],
  'casado_civil');

eq('CTX28: "Estamos em uniao estavel" + pendingObjective=coletar_estado_civil_p3 + stage=qualification_civil → estado_civil_p3=uniao_estavel',
  extractFactsFromText(
    'Estamos em uniao estavel',
    'qualification_civil',
    'coletar_estado_civil_p3',
  )['estado_civil_p3'],
  'uniao_estavel');

eq('CTX29: "carteira assinada" + pendingObjective=coletar_regime_trabalho + stage=qualification_civil → regime_trabalho=clt (cross-stage)',
  extractFactsFromText(
    'carteira assinada',
    'qualification_civil',
    'coletar_regime_trabalho',
  )['regime_trabalho'],
  'clt');

eq('CTX30: "Ganho R$ 2.000 por mes" + pendingObjective=avancar_para_qualification_renda + stage=qualification_civil → renda_principal=2000 (cross-stage)',
  extractFactsFromText(
    'Ganho R$ 2.000 por mes',
    'qualification_civil',
    'avancar_para_qualification_renda',
  )['renda_principal'],
  2000);

// ── T9.27: parseRendaFlexivel — extensos, número puro, notação k ─────────────
console.log('\n── T9.27: renda flexivel ──');

eq('CTX31: "2500" puro + qualification_renda → renda_principal=2500',
  extractFactsFromText('2500', 'qualification_renda')['renda_principal'],
  2500);

eq('CTX32: "tres mil" extenso + qualification_renda → renda_principal=3000',
  extractFactsFromText('tres mil', 'qualification_renda')['renda_principal'],
  3000);

eq('CTX33: "tres mil e quinhentos" + qualification_renda → renda_principal=3500',
  extractFactsFromText('tres mil e quinhentos', 'qualification_renda')['renda_principal'],
  3500);

eq('CTX34: "Nao tenho familiar" + verificar_alternativa_rnm + discovery → alternativa_rnm=sem_familiar_brasileiro',
  extractFactsFromText(
    'Nao tenho familiar',
    'discovery',
    'verificar_alternativa_rnm',
  )['alternativa_rnm'],
  'sem_familiar_brasileiro');

eq('CTX34b: "solteiro" + coletar_estado_civil_p3 + discovery → estado_civil_p3=solteiro (sem vazar estado_civil)',
  extractFactsFromText(
    'solteiro',
    'discovery',
    'coletar_estado_civil_p3',
  )['estado_civil'],
  undefined);

eq('CTX35: "solteiro" + coletar_estado_civil_p3 + discovery → estado_civil_p3=solteiro',
  extractFactsFromText(
    'solteiro',
    'discovery',
    'coletar_estado_civil_p3',
  )['estado_civil_p3'],
  'solteiro');

eq('CTX36: "tem validade" + perguntar_rnm_e_validade + discovery → rnm_valido=false (camada1 específica)',
  extractFactsFromText(
    'Sim tenho mas tem validade',
    'discovery',
    'perguntar_rnm_e_validade',
  )['rnm_valido'],
  false);

// ── T9.28: guard P3, nacionalidade conservadora, normalizeAlternativaRnm ──────
console.log('\n── T9.28: gaps C4/C6 ──');

eq('CTX37a: "Casada no civil" + coletar_estado_civil_p3 + qualification_civil → estado_civil_p3=casado_civil',
  extractFactsFromText(
    'Casada no civil',
    'qualification_civil',
    'coletar_estado_civil_p3',
  )['estado_civil_p3'],
  'casado_civil');

eq('CTX37b: "Casada no civil" + coletar_estado_civil_p3 + qualification_civil → estado_civil=undefined (sem vazar)',
  extractFactsFromText(
    'Casada no civil',
    'qualification_civil',
    'coletar_estado_civil_p3',
  )['estado_civil'],
  undefined);

eq('CTX38a: "Nao tenho familiar brasileiro" + verificar_alternativa_rnm + discovery → alternativa_rnm=sem_familiar_brasileiro',
  extractFactsFromText(
    'Nao tenho familiar brasileiro',
    'discovery',
    'verificar_alternativa_rnm',
  )['alternativa_rnm'],
  'sem_familiar_brasileiro');

eq('CTX38b: "Nao tenho familiar brasileiro" + verificar_alternativa_rnm + discovery → nacionalidade=undefined (sem capturar)',
  extractFactsFromText(
    'Nao tenho familiar brasileiro',
    'discovery',
    'verificar_alternativa_rnm',
  )['nacionalidade'],
  undefined);

eq('CTX39: "Sou brasileiro" sem pendingObjective + discovery → nacionalidade=brasileiro (fallback conservador)',
  extractFactsFromText(
    'Sou brasileiro',
    'discovery',
  )['nacionalidade'],
  'brasileiro');

eq('CTX40: "Brasileiro" + perguntar_nacionalidade + discovery → nacionalidade=brasileiro (contextual)',
  extractFactsFromText(
    'Brasileiro',
    'discovery',
    'perguntar_nacionalidade',
  )['nacionalidade'],
  'brasileiro');

// ── segurança ─────────────────────────────────────────────────────────────────
console.log('\n── segurança ──');

empty('S1: texto vazio retorna {}', extractFactsFromText('', 'discovery'));
empty('S2: texto nulo/vazio retorna {}', extractFactsFromText('   ', 'qualification_civil'));
empty('S3: texto sem fact retorna {}', extractFactsFromText('Olá tudo bem?', 'discovery'));
empty('S4: texto sem fact em renda retorna {}', extractFactsFromText('Boa tarde!', 'qualification_renda'));
empty('S5: stages sem heurística retornam {}', extractFactsFromText('dados do doc', 'docs_collection'));
empty('S6: broker_handoff sem heurística retorna {}', extractFactsFromText('tudo certo', 'broker_handoff'));

noThrow('S7: não lança exceção com texto vazio',
  () => extractFactsFromText('', 'discovery'));

noThrow('S8: não lança exceção com texto inválido',
  () => extractFactsFromText('!!!@@@###$$$', 'qualification_renda'));

// Verifica que output não contém secrets
const outputLines: string[] = [];
const origLog = console.log;
const origErr = console.error;
console.log = (...a: unknown[]) => { outputLines.push(a.map(String).join(' ')); origLog(...a); };
console.error = (...a: unknown[]) => { outputLines.push(a.map(String).join(' ')); origErr(...a); };

extractFactsFromText('OPENAI_API_KEY serviceRoleKey META_ACCESS_TOKEN', 'discovery');

console.log = origLog;
console.error = origErr;

const joined = outputLines.join('\n');
check('S9: não vaza OPENAI_API_KEY no output', !joined.includes('OPENAI_API_KEY'));
check('S10: não vaza serviceRoleKey no output', !joined.includes('serviceRoleKey'));

// ── Resultado ─────────────────────────────────────────────────────────────────
console.log(`\n=== Resultado: ${pass} PASS | ${fail} FAIL ===\n`);

if (fail > 0) {
  console.error('smoke:core:text-extractor FALHOU');
  process.exit(1);
}

console.log('smoke:core:text-extractor OK\n');
