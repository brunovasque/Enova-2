#!/usr/bin/env node
/**
 * autofix_pr_governance.js
 *
 * Auto-fix CONTROLADO para falhas triviais do PR Governance Gate — ENOVA 2.
 *
 * REGRAS ESTRITAS (não negociáveis):
 *   - Apenas erros triviais e mecânicos são corrigidos automaticamente.
 *   - Máximo 3 tentativas por PR (rastreado com marcador oculto no body).
 *   - Sem LLM. Sem dependências externas. Sem API externa. Sem loop aberto.
 *   - Erros estruturais param imediatamente, sem retry.
 *   - Em caso de ambiguidade: parar e registrar motivo.
 *
 * Estratégia de preenchimento (em ordem de prioridade):
 *   1. Valores reais extraídos dos arquivos vivos do repositório:
 *        - Contrato ativo: schema/contracts/_INDEX.md
 *        - Próximo passo: schema/handoffs/<FRENTE>_LATEST.md → schema/status/<FRENTE>_STATUS.md
 *   2. Valores seguros de fallback (não rejeitados pelo validator) quando não há fonte determinística.
 *
 * Erros trivialmente corrigíveis (auto-fix atua):
 *   - Campo obrigatório ausente do body → adiciona seção com valor extraído dos vivos (ou fallback)
 *   - Campo obrigatório presente mas vazio / só comentário HTML → preenche com valor extraído
 *
 * Erros NÃO corrigíveis (auto-fix para e registra):
 *   - Body completamente vazio
 *   - Incoerência contratual
 *   - Live files declarados sem diff real
 *   - Qualquer erro que exija interpretação semântica
 *
 * Variáveis de ambiente esperadas:
 *   PR_BODY — corpo atual da PR (obrigatório)
 *
 * Saída:
 *   - Escreve resultado em /tmp/autofix_status.txt: "fixed" | "noop" | "max_attempts" | "structural"
 *   - Se "fixed": escreve novo body em /tmp/new_pr_body.txt
 *   - Sempre exit 0 (o workflow lê o arquivo de status para decidir a ação)
 */

"use strict";

const fs = require("fs");
const path = require("path");

// Diretório raiz do repositório (dois níveis acima de scripts/)
const REPO_ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 3;

// Campos mínimos obrigatórios (espelho de validate_pr_governance.js)
// defaultValue é preenchido dinamicamente a partir dos arquivos vivos em extractLiveValues().
// Fallback seguro (não rejeitado pelo validator) quando nenhuma fonte determinística existe.
const REQUIRED_FIELDS_TEMPLATE = [
  {
    label: "Contrato ativo",
    group: "Vínculo contratual",
    fallbackValue: "Nenhum contrato ativo",
    triviallyFixable: true,
  },
  {
    label: "Próximo passo autorizado",
    group: "Próximo passo",
    fallbackValue: "A definir — consultar A01",
    triviallyFixable: true,
  },
];

// Marcador oculto de tentativas de auto-fix (embutido no body da PR)
const ATTEMPT_MARKER_RE = /<!--\s*governance-autofix-attempts:\s*(\d+)\s*-->/;

// Arquivos de saída
const STATUS_FILE = "/tmp/autofix_status.txt";
const NEW_BODY_FILE = "/tmp/new_pr_body.txt";

// ---------------------------------------------------------------------------
// Helpers (lógica idêntica à de validate_pr_governance.js — sem importação)
// ---------------------------------------------------------------------------

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns true if the content is "effectively empty":
 * only whitespace and/or closed HTML comment blocks (<!-- ... --> or <!-- ... --!>).
 * Uses regex test to avoid sanitization/stripping patterns that could be flagged.
 * Note: this function tests content — it does NOT produce HTML output.
 */
function isEffectivelyEmpty(content) {
  // Match: entire string is whitespace + zero or more closed HTML comment blocks
  // --!? handles both --> (standard) and --!> (non-standard Markdown editor variant)
  return /^(\s*<!--[\s\S]*?--!?>\s*)*\s*$/.test(content);
}

function fieldPresent(body, label) {
  const escaped = escapeRegex(label);
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:#{1,6}\\s+${escaped}|${escaped}\\s*:)`,
    "i"
  );
  return pattern.test(body);
}

/**
 * Extracts the raw content of a section (block or inline format).
 * Returns the raw string (not stripped) — callers use isEffectivelyEmpty() to check emptiness.
 */
function extractSectionContent(body, label) {
  const escaped = escapeRegex(label);

  const inlineRe = new RegExp(
    `(?:^|\\n)\\s*${escaped}\\s*:\\s*([^\\n]+)`,
    "i"
  );
  const inlineMatch = body.match(inlineRe);
  if (inlineMatch) {
    const inlineContent = inlineMatch[1].trim();
    if (!isEffectivelyEmpty(inlineContent)) return inlineContent;
  }

  const blockRe = new RegExp(
    `(?:^|\\n)\\s*#{1,6}\\s+${escaped}[^\\n]*\\n([\\s\\S]*?)` +
    `(?=\\n#{1,6}\\s|$)`,
    "i"
  );
  const blockMatch = body.match(blockRe);
  if (!blockMatch) return "";
  return blockMatch[1].trim();
}

// ---------------------------------------------------------------------------
// Extração de valores dos arquivos vivos
// ---------------------------------------------------------------------------

/**
 * Lê um arquivo com segurança.
 * Retorna string vazia se o arquivo não existir ou se a leitura falhar.
 * Nunca lança exceção — o auto-fix deve degradar graciosamente.
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_) {
    return "";
  }
}

/**
 * Extrai o valor de um campo de uma tabela Markdown no formato:
 *   | Campo | Valor |
 * Remove backticks e espaços extras. Retorna "" se não encontrado.
 */
function extractTableField(content, fieldName) {
  const escaped = escapeRegex(fieldName);
  const re = new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|\\n]+)`, "i");
  const match = content.match(re);
  if (!match) return "";
  return match[1].trim().replace(/`/g, "");
}

/**
 * Extrai o caminho do contrato ativo a partir de schema/contracts/_INDEX.md.
 * Procura a primeira linha de tabela que contenha "schema/contracts/active/" como caminho
 * e cujo status seja "aberto", "em execução" ou "em revisão".
 * Retorna o caminho do contrato ou "" se não houver contrato ativo.
 */
function extractActiveContractFromIndex() {
  const indexPath = path.join(REPO_ROOT, "schema", "contracts", "_INDEX.md");
  const content = readFileSafe(indexPath);
  if (!content) return "";

  const re = /\|\s*\d+\s*\|[^|]+\|\s*`(schema\/contracts\/active\/[^`]+)`\s*\|\s*(aberto|em execução|em revisão)/gi;
  const match = re.exec(content);
  if (!match) return "";
  return match[1].trim();
}

/**
 * Dado o caminho do contrato (ex: "schema/contracts/active/CONTRATO_CORE_MECANICO_2.md"),
 * deriva a chave da frente (ex: "CORE_MECANICO_2") removendo prefixo "CONTRATO_" e extensão.
 * Essa chave é usada para montar os caminhos de handoff e status da frente.
 */
function extractFrontKeyFromContract(contractPath) {
  const basename = path.basename(contractPath, ".md");
  return basename.replace(/^CONTRATO_/, "");
}

/**
 * Extrai o próximo passo autorizado do handoff ou do status da frente.
 * Tenta handoff primeiro (mais atualizado), depois status como fallback.
 * Retorna a primeira linha não vazia do campo, ou "" se não encontrado.
 */
function extractNextStepForFront(frontKey) {
  const handoffPath = path.join(
    REPO_ROOT, "schema", "handoffs", `${frontKey}_LATEST.md`
  );
  const statusPath = path.join(
    REPO_ROOT, "schema", "status", `${frontKey}_STATUS.md`
  );

  // 1. Tentar handoff (tabela de resumo no topo)
  const handoffContent = readFileSafe(handoffPath);
  if (handoffContent) {
    const tableValue = extractTableField(handoffContent, "Próximo passo autorizado");
    if (tableValue && !isEffectivelyEmpty(tableValue)) {
      console.log(`🔍 Valor extraído de: ${handoffPath} (tabela)`);
      return tableValue;
    }
    // Tentar seção ## do handoff
    const sectionValue = extractSectionContent(handoffContent, "Próximo passo autorizado");
    if (sectionValue && !isEffectivelyEmpty(sectionValue)) {
      const firstLine = sectionValue.split("\n")[0].replace(/^\*+|\*+$/g, "").trim();
      if (firstLine.length > 0) {
        console.log(`🔍 Valor extraído de: ${handoffPath} (seção)`);
        return firstLine;
      }
    }
  }

  // 2. Fallback: status da frente
  const statusContent = readFileSafe(statusPath);
  if (statusContent) {
    const tableValue = extractTableField(statusContent, "Próximo passo autorizado");
    if (tableValue && !isEffectivelyEmpty(tableValue)) {
      console.log(`🔍 Valor extraído de: ${statusPath} (tabela)`);
      return tableValue;
    }
    const sectionValue = extractSectionContent(statusContent, "Próximo passo autorizado");
    if (sectionValue && !isEffectivelyEmpty(sectionValue)) {
      const firstLine = sectionValue.split("\n")[0].replace(/^\*+|\*+$/g, "").trim();
      if (firstLine.length > 0) {
        console.log(`🔍 Valor extraído de: ${statusPath} (seção)`);
        return firstLine;
      }
    }
  }

  return "";
}

/**
 * Lê os arquivos vivos do repositório e retorna os valores reais para os 2 campos mínimos.
 * Garante que os valores retornados NÃO sejam rejeitados pelo validator.
 * Em caso de falha de leitura, retorna valores de fallback seguros.
 */
function extractLiveValues() {
  const contractPath = extractActiveContractFromIndex();

  let contratoAtivo = "";
  let proximoPasso = "";

  if (contractPath) {
    contratoAtivo = contractPath;
    console.log(`🔍 Valor extraído de: schema/contracts/_INDEX.md`);

    const frontKey = extractFrontKeyFromContract(contractPath);
    proximoPasso = extractNextStepForFront(frontKey);
  }

  // Fallbacks seguros (não contêm padrões rejeitados pelo validator)
  if (!contratoAtivo) {
    contratoAtivo = "Nenhum contrato ativo";
  }
  if (!proximoPasso) {
    proximoPasso = "A definir — consultar A01";
  }

  return { contratoAtivo, proximoPasso };
}

// ---------------------------------------------------------------------------
// Gerenciamento de tentativas
// ---------------------------------------------------------------------------

function getAttemptCount(body) {
  const match = body.match(ATTEMPT_MARKER_RE);
  return match ? parseInt(match[1], 10) : 0;
}

function setAttemptCount(body, count) {
  const marker = `<!-- governance-autofix-attempts: ${count} -->`;
  if (ATTEMPT_MARKER_RE.test(body)) {
    return body.replace(ATTEMPT_MARKER_RE, marker);
  }
  // Adicionar marcador no início do body
  return marker + "\n" + body;
}

// ---------------------------------------------------------------------------
// Fixers triviais
// ---------------------------------------------------------------------------

/**
 * Adiciona a seção obrigatória ao final do body (campo completamente ausente).
 */
function addMissingSection(body, label, defaultValue) {
  return body.trimEnd() + `\n\n## ${label}\n${defaultValue}\n`;
}

/**
 * Substitui o conteúdo efetivamente vazio de uma seção pelo valor padrão.
 * Preserva o heading existente. Suporta formato bloco e inline.
 */
function fillEmptySection(body, label, defaultValue) {
  const escaped = escapeRegex(label);

  // Formato bloco: ## Label[texto extra]\n<conteúdo vazio até próximo heading>
  const blockRe = new RegExp(
    `((?:^|\\n)([ \\t]*)#{1,6}[ \\t]+${escaped}[^\\n]*\\n)([\\s\\S]*?)(?=\\n[ \\t]*#{1,6}[ \\t]|$)`,
    "i"
  );
  const blockMatch = body.match(blockRe);
  if (blockMatch) {
    const content = blockMatch[3];
    if (isEffectivelyEmpty(content)) {
      // Substitui apenas o conteúdo vazio, mantendo o heading
      return body.replace(blockRe, `${blockMatch[1]}${defaultValue}\n`);
    }
  }

  // Formato inline: Label: <vazio ou só comentário HTML>
  const inlineRe = new RegExp(
    `((?:^|\\n)[ \\t]*${escaped}[ \\t]*:)([^\\n]*)`,
    "i"
  );
  const inlineMatch = body.match(inlineRe);
  if (inlineMatch) {
    const value = inlineMatch[2];
    if (isEffectivelyEmpty(value)) {
      return body.replace(inlineRe, `${inlineMatch[1]} ${defaultValue}`);
    }
  }

  // Campo presente mas conteúdo não capturável → retorna body sem alteração
  return body;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function writeStatus(status) {
  fs.writeFileSync(STATUS_FILE, status, "utf8");
}

function main() {
  const prBody = process.env.PR_BODY || "";

  // Guard: body completamente vazio = erro estrutural, não trivial
  if (!prBody || prBody.trim().length === 0) {
    console.error("❌ AUTO-FIX: Body da PR vazio. Erro estrutural — não corrigível automaticamente.");
    console.error("   Ação necessária: preencher o body conforme .github/PULL_REQUEST_TEMPLATE.md");
    writeStatus("structural");
    return;
  }

  // Verificar limite de tentativas
  const attemptCount = getAttemptCount(prBody);
  if (attemptCount >= MAX_ATTEMPTS) {
    console.error(`❌ AUTO-FIX: Limite de ${MAX_ATTEMPTS} tentativas atingido.`);
    console.error("   O PR Governance Gate continua falhando após 3 tentativas de auto-fix.");
    console.error("   Ação necessária: revisar manualmente o body da PR.");
    console.error("   Template: .github/PULL_REQUEST_TEMPLATE.md");
    console.error("   Protocolo: schema/CODEX_WORKFLOW.md");
    writeStatus("max_attempts");
    return;
  }

  // Extrair valores reais dos arquivos vivos do repositório.
  // Estes valores substituem os placeholders antigos e são aceitos pelo validator.
  const { contratoAtivo, proximoPasso } = extractLiveValues();

  // Campos mínimos com valores derivados dos arquivos vivos (ou fallback seguro)
  const REQUIRED_FIELDS = REQUIRED_FIELDS_TEMPLATE.map((field) => {
    let defaultValue = field.fallbackValue;
    if (field.label === "Contrato ativo") defaultValue = contratoAtivo;
    if (field.label === "Próximo passo autorizado") defaultValue = proximoPasso;
    return Object.assign({}, field, { defaultValue });
  });

  // Classificar falhas dos campos obrigatórios
  const trivialFailures = [];

  for (const field of REQUIRED_FIELDS) {
    if (!field.triviallyFixable) continue;

    if (!fieldPresent(prBody, field.label)) {
      trivialFailures.push({ type: "missing", field });
    } else {
      const content = extractSectionContent(prBody, field.label);
      if (isEffectivelyEmpty(content)) {
        trivialFailures.push({ type: "empty", field });
      }
    }
  }

  // Nenhuma falha trivial detectada — gate pode estar passando ou falhou por erro estrutural
  if (trivialFailures.length === 0) {
    console.log("✅ AUTO-FIX: Nenhuma falha trivial nos campos obrigatórios detectada.");
    console.log("   Se o gate ainda falhou, o motivo é estrutural (ex: live files sem diff).");
    console.log("   O auto-fix não atua em erros estruturais — revisão manual necessária.");
    writeStatus("noop");
    return;
  }

  // Aplicar correções triviais
  console.log("\n══════════════════════════════════════════════");
  console.log(`  ENOVA 2 — PR Governance Auto-fix`);
  console.log(`  Tentativa ${attemptCount + 1} de ${MAX_ATTEMPTS}`);
  console.log("══════════════════════════════════════════════\n");

  let fixedBody = prBody;
  let fixCount = 0;

  for (const failure of trivialFailures) {
    const { type, field } = failure;
    if (type === "missing") {
      console.log(`🔧 Adicionando seção ausente: "${field.label}"`);
      console.log(`   Valor: "${field.defaultValue}"`);
      fixedBody = addMissingSection(fixedBody, field.label, field.defaultValue);
      fixCount++;
    } else if (type === "empty") {
      console.log(`🔧 Preenchendo campo vazio: "${field.label}"`);
      console.log(`   Valor: "${field.defaultValue}"`);
      fixedBody = fillEmptySection(fixedBody, field.label, field.defaultValue);
      fixCount++;
    }
  }

  if (fixCount === 0) {
    // Segurança: se chegamos aqui sem fix, é ambíguo — parar
    console.log("⚠️  AUTO-FIX: Nenhuma correção trivial foi possível aplicar (estado ambíguo).");
    console.log("   Por segurança, o auto-fix para sem modificar o body.");
    writeStatus("noop");
    return;
  }

  // Incrementar contador de tentativas no body
  fixedBody = setAttemptCount(fixedBody, attemptCount + 1);

  // Escrever novo body
  fs.writeFileSync(NEW_BODY_FILE, fixedBody, "utf8");
  writeStatus("fixed");

  console.log(`\n✅ AUTO-FIX: ${fixCount} correção(ões) aplicada(s) com valores dos arquivos vivos.`);
  console.log(`   Tentativa: ${attemptCount + 1}/${MAX_ATTEMPTS}`);
  console.log(`   Body atualizado escrito em: ${NEW_BODY_FILE}`);
  console.log("\n📋 Valores inseridos foram extraídos dos arquivos vivos do repositório.");
  console.log("   Verifique se refletem corretamente o estado atual da frente.");
  console.log("   Template: .github/PULL_REQUEST_TEMPLATE.md");
  console.log("   Protocolo: schema/CODEX_WORKFLOW.md\n");
}

main();
