# src/core/text-extractor.ts — Conteúdo Completo
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)
# Fonte: T9.6 — Extrator de Facts do Texto WhatsApp

---

## Cabeçalho e restrições invioláveis

```typescript
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
```

---

## Normalização interna

```typescript
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // remove acentos
    .replace(/[^\w\s]/g, ' ') // pontuação → espaço
    .replace(/\s+/g, ' ')
    .trim();
}

function contains(normalized: string, ...terms: string[]): boolean {
  return terms.some((t) => normalized.includes(t));
}
```

---

## Palavras funcionais e keywords de programa (blocklist para nome)

```typescript
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
```

---

## Extração de nome completo (heurística conservadora)

```typescript
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
```

**Regras da heurística:**
- 2–5 palavras (menos = nome parcial; mais = frase)
- Apenas letras (sem números, hífens, etc.)
- Nenhuma palavra funcional da blocklist
- Nenhuma keyword do programa
- Nenhuma palavra com menos de 3 caracteres

---

## extractDiscovery — Stage: discovery

```typescript
function extractDiscovery(n: string, original: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // Negação explícita bloqueia intenção de compra
  const isNegation = contains(n, 'nao quero comprar', 'nao tenho interesse em comprar');

  // Entender tem prioridade: "como funciona o MCMV" é entender, não comprar
  if (
    contains(n, 'como funciona', 'quero entender', 'me explica', 'pode explicar',
      'o que e o mcmv', 'o que e minha casa', 'saber sobre o programa',
      'quero informacoes', 'quero informacao', 'explica o programa')
  ) {
    facts['customer_goal'] = 'entender_programa';
  } else if (
    !isNegation &&
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

  // nome_completo: heurística conservadora
  const nomeCandidate = extractNomeCompletoCandidato(n, original);
  if (nomeCandidate !== null) {
    facts['nome_completo'] = nomeCandidate;
  }

  // nacionalidade (rota canônica T9.15E: coletar antes de estado civil)
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

  // rnm_valido — negação primeiro para evitar falsos positivos
  if (
    contains(n, 'sem rnm', 'nao tenho rnm', 'rnm invalido', 'rnm vencido', 'rnm expirado')
  ) {
    facts['rnm_valido'] = false;
  } else if (
    contains(n, 'rnm valido', 'rnm ok', 'tenho rnm', 'meu rnm', 'registro valido', 'rnm em dia')
  ) {
    facts['rnm_valido'] = true;
  }

  return facts;
}
```

**Ordem de prioridade customer_goal:**
1. `entender_programa` (prioridade explícita — evita classificar curiosidade como compra)
2. `comprar_imovel` (com guard de negação)
3. `enviar_docs`
4. `visitar_imovel`
5. (sem match → fact ausente)

---

## extractQualificationCivil — Stage: qualification_civil

```typescript
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
```

**Enums canônicos:**
- `estado_civil`: `solteiro` | `casado_civil` | `uniao_estavel` | `divorciado` | `viuvo`
- `processo`: `solo` | `conjunto` | `composicao_familiar`

---

## extractQualificationRenda — Stage: qualification_renda

```typescript
function extractQualificationRenda(n: string, original: string): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  // regime_trabalho
  if (contains(n, 'clt', 'carteira assinada', 'registrado', 'registrada', ...)) {
    facts['regime_trabalho'] = 'clt';
  } else if (contains(n, 'autonomo', 'autonoma', 'freelancer', ...)) {
    facts['regime_trabalho'] = 'autonomo';
  } else if (contains(n, 'aposentado', 'aposentada', ...)) {
    facts['regime_trabalho'] = 'aposentado';
  } else if (contains(n, 'servidor', 'servidora', 'funcionario publico', ...)) {
    facts['regime_trabalho'] = 'servidor';
  } else if (contains(n, 'informal', 'bico', 'sem registro', ...)) {
    facts['regime_trabalho'] = 'informal';
  }

  // renda_principal — opera no texto original (preserva R$, pontos, vírgulas)
  const renda = extractRenda(original);
  if (renda !== null) {
    facts['renda_principal'] = renda;  // número em reais (integer)
  }

  return facts;
}
```

**Enums regime_trabalho:** `clt` | `autonomo` | `aposentado` | `servidor` | `informal`

---

## extractRenda + parseBrMoney — Extração de valor numérico

```typescript
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

  // "renda de 4000", "ganho 4000", "recebo 4000", "salario de 3500"
  const keyMatch = t.match(/(?:renda\s+(?:de\s+)?|ganho\s+|recebo\s+|salario\s+(?:de\s+)?)([\d.,]+)/);
  if (keyMatch) {
    const parsed = parseBrMoney(keyMatch[1]);
    if (parsed !== null) return parsed;
  }

  return null;
}

function parseBrMoney(raw: string): number | null {
  // "3.500" ou "3.500,00" → ponto como milhar
  // "3500,00" → vírgula como decimal
  // "3500", "4000.00" → direto
  // Faixa válida: 100 ≤ val ≤ 999999
}
```

**Padrões reconhecidos:** `4 mil`, `3,5 mil`, `R$ 3.500`, `R$3500`, `renda de 4000`, `ganho 4000`, `recebo 3500`, `salario de 2800`

---

## Outros stages

```typescript
// qualification_eligibility — mesmo padrão de nacionalidade do discovery
function extractQualificationEligibility(n: string): Record<string, unknown>

// docs_prep — canal de envio de documentos
// 'whatsapp' | 'site' | 'visita_presencial'
function extractDocsPrep(n: string): Record<string, unknown>

// visit — interesse em visita
// negação primeiro (anti-padrão "não quero visitar" contém "quero visitar")
// 'nao' | 'talvez' | 'sim'
function extractVisit(n: string): Record<string, unknown>
```

---

## Ponto de entrada público: extractFactsFromText

```typescript
export function extractFactsFromText(
  text: string,
  stage: StageId,
): Record<string, unknown> {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) return {};
    const n = normalize(text);
    if (!n) return {};

    switch (stage) {
      case 'discovery':            return extractDiscovery(n, text);
      case 'qualification_civil':  return extractQualificationCivil(n);
      case 'qualification_renda':  return extractQualificationRenda(n, text);
      case 'qualification_eligibility': return extractQualificationEligibility(n);
      case 'docs_prep':            return extractDocsPrep(n);
      case 'visit':                return extractVisit(n);
      // Stages sem heurística simples segura — retorna {} intencionalmente
      case 'qualification_special':
      case 'docs_collection':
      case 'broker_handoff':       return {};
      default:                     return {};
    }
  } catch {
    return {};  // nunca lança exceção
  }
}
```

**Stages sem extração:** `qualification_special`, `docs_collection`, `broker_handoff` → retornam `{}` intencionalmente.

---

## Resumo de facts extraídos por stage

| Stage | Facts extraídos |
|-------|----------------|
| `discovery` | `customer_goal`, `nome_completo`, `nacionalidade`, `rnm_valido` |
| `qualification_civil` | `estado_civil`, `processo` |
| `qualification_renda` | `regime_trabalho`, `renda_principal` |
| `qualification_eligibility` | `nacionalidade` |
| `docs_prep` | `docs_channel_choice` |
| `visit` | `visit_interest` |
| `qualification_special`, `docs_collection`, `broker_handoff` | `{}` (vazio intencional) |
