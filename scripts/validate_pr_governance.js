#!/usr/bin/env node
/**
 * validate_pr_governance.js
 *
 * Validação determinística de conformidade de PR — ENOVA 2 PR Governance Gate.
 *
 * Sem LLM. Sem dependências externas. Sem chamadas de API.
 * Apenas regex e verificação de presença de campos obrigatórios.
 *
 * Filosofia de governança:
 *   - Fonte de verdade obrigatória = arquivos vivos versionados do repo
 *     (schema/status/, schema/handoffs/, schema/contracts/)
 *   - Corpo da PR = apoio humano / checklist — não é a fonte única de bloqueio
 *   - Gate bloqueante no body: apenas 2 campos mínimos obrigatórios
 *   - Gate bloqueante real: mudanças em arquivos vivos devem refletir o diff
 *
 * Uso:
 *   node scripts/validate_pr_governance.js
 *
 * Variáveis de ambiente esperadas:
 *   PR_BODY          — corpo completo da PR (obrigatório)
 *   CHANGED_FILES    — lista de arquivos alterados separados por newline (opcional)
 *
 * Exit code 0 = aprovado
 * Exit code 1 = reprovado (campos mínimos ausentes ou gate de arquivos vivos falhou)
 */

"use strict";

// ---------------------------------------------------------------------------
// Campos mínimos obrigatórios no corpo da PR (gate bloqueante)
// Todos os outros campos do template são checklist de apoio humano — não bloqueiam o gate.
// Checados como headings Markdown (## Campo) ou como label de linha (Campo:)
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS = [
  // Vínculo contratual mínimo
  { label: "Contrato ativo",           group: "Vínculo contratual" },
  // Próximo passo
  { label: "Próximo passo autorizado", group: "Próximo passo" },
];

// Prefixos de caminho considerados "arquivos vivos" no repositório
const LIVE_FILE_PREFIXES = [
  "schema/status/",
  "schema/handoffs/",
  "schema/contracts/",
];

// Palavras que indicam que nenhuma atualização viva foi necessária (gate relaxado)
const LIVE_FILES_EXEMPT_PATTERNS = [
  /nenhum/i,
  /none/i,
  /n\/a/i,
  /não\s+houve/i,
  /sem\s+atualiza/i,
  /não\s+aplicável/i,
];

// Campo de estado vivo — referenciado no gate de arquivos (deve coincidir com REQUIRED_FIELDS)
const LIVE_FILES_FIELD = "Arquivos vivos atualizados";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escapa caracteres especiais de regex em uma string literal.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verifica se um campo (heading ou label de linha) está presente no corpo da PR.
 * Aceita tanto "## Campo" quanto "Campo:" em qualquer linha.
 */
function fieldPresent(body, label) {
  const escaped = escapeRegex(label);
  // Aceita markdown heading (## label) ou label seguido de : ou nada no fim da linha
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:#{1,6}\\s+${escaped}|${escaped}\\s*:)`,
    "i"
  );
  return pattern.test(body);
}

/**
 * Extrai o conteúdo de texto da seção imediatamente após o heading/label.
 * Retorna a string de texto até o próximo heading ou fim do documento.
 */
function extractSectionContent(body, label) {
  const escaped = escapeRegex(label);
  // Captura o conteúdo entre o heading da seção e o próximo heading ou fim do documento:
  //   (?:^|\n)\s* — início de linha
  //   (?:#{1,6}\s+<label>|<label>\s*) — heading markdown ou label simples
  //   \n([...]*?) — conteúdo capturado (grupo 1)
  //   (?=\n#{1,6}\s|\n[A-Z][^\n]*:\s*\n|$) — lookahead: próximo heading ou fim
  const headingRe = new RegExp(
    `(?:^|\\n)\\s*` +
    `(?:#{1,6}\\s+${escaped}|${escaped}\\s*)` +
    `\\n([\\s\\S]*?)` +
    `(?=\\n#{1,6}\\s|\\n[A-Z][^\\n]*:\\s*\\n|$)`,
    "i"
  );
  const match = body.match(headingRe);
  if (!match) return "";
  // Remove HTML comments (<!-- ... -->) e resíduos do conteúdo extraído
  return stripHtmlComments(match[1]).trim();
}

/**
 * Remove comentários HTML (<!-- ... -->) e quaisquer fragmentos residuais de forma completa.
 * Trata tanto --> quanto --!> como fim de comentário (HTML5).
 */
function stripHtmlComments(text) {
  // Remove blocos fechados: padrão --> e variante --!> usada por alguns editores Markdown
  // (conforme WHATWG HTML spec, --!> é reconhecido como fechamento de comentário)
  let result = text
    .replace(/<!--[\s\S]*?--!>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  // Remove qualquer fragmento residual de abertura usando split/join
  // (abordagem recomendada para satisfazer sanitização completa de múltiplos caracteres)
  result = result.split("<!--").join("");
  return result;
}

/**
 * Verifica se uma string de conteúdo está "em branco" ou contém apenas comentários HTML.
 */
function isEffectivelyEmpty(content) {
  const cleaned = stripHtmlComments(content).trim();
  return cleaned.length === 0;
}

/**
 * Verifica se o conteúdo da seção "Arquivos vivos atualizados" indica
 * que nenhuma atualização foi necessária (justificativa aceita).
 */
function liveFilesExempt(content) {
  return LIVE_FILES_EXEMPT_PATTERNS.some((re) => re.test(content));
}

/**
 * Retorna true se houver ao menos um arquivo vivo entre os arquivos alterados.
 */
function hasLiveFileChange(changedFiles) {
  return changedFiles.some((f) =>
    LIVE_FILE_PREFIXES.some((prefix) => f.startsWith(prefix))
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const prBody = process.env.PR_BODY || "";
  const changedFilesRaw = process.env.CHANGED_FILES || "";

  if (!prBody || prBody.trim().length === 0) {
    console.error("❌ FALHA: Corpo da PR está vazio.");
    console.error("   Toda PR deve ter corpo preenchido conforme o template obrigatório.");
    process.exit(1);
  }

  const changedFiles = changedFilesRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const failures = [];
  const warnings = [];
  const passes = [];

  // ------------------------------------------------------------------
  // Checagem A–E: campos obrigatórios
  // ------------------------------------------------------------------
  for (const field of REQUIRED_FIELDS) {
    if (!fieldPresent(prBody, field.label)) {
      failures.push(`[${field.group}] Campo obrigatório ausente: "${field.label}"`);
    } else {
      passes.push(`[${field.group}] ✓ "${field.label}"`);
    }
  }

  // ------------------------------------------------------------------
  // Gate D: arquivos vivos
  // Se "Arquivos vivos atualizados" está presente e não é isento,
  // verificar se há mudança real em schema/status/, schema/handoffs/ ou schema/contracts/
  // ------------------------------------------------------------------
  const liveSection = extractSectionContent(prBody, LIVE_FILES_FIELD);

  if (fieldPresent(prBody, LIVE_FILES_FIELD)) {
    if (isEffectivelyEmpty(liveSection)) {
      warnings.push(
        `[D. Estado vivo] Seção '${LIVE_FILES_FIELD}' está em branco. ` +
        "Declare os arquivos atualizados ou justifique que nenhuma atualização foi necessária."
      );
    } else if (!liveFilesExempt(liveSection)) {
      // Seção tem conteúdo e não é isenta: verificar se arquivos vivos foram realmente alterados
      if (changedFiles.length > 0 && !hasLiveFileChange(changedFiles)) {
        failures.push(
          `[D. Estado vivo] '${LIVE_FILES_FIELD}' declara arquivos mas nenhuma ` +
          "mudança foi detectada em schema/status/, schema/handoffs/ ou schema/contracts/. " +
          "Atualize os arquivos vivos ou justifique no corpo da PR que nenhuma atualização foi necessária " +
          "(ex: 'nenhuma atualização viva necessária')."
        );
      }
    }
  }

  // ------------------------------------------------------------------
  // Saída
  // ------------------------------------------------------------------
  console.log("\n══════════════════════════════════════════════");
  console.log("  ENOVA 2 — PR Governance Check");
  console.log("══════════════════════════════════════════════\n");

  if (passes.length > 0) {
    console.log("✅ Campos presentes:");
    passes.forEach((p) => console.log("  " + p));
    console.log();
  }

  if (warnings.length > 0) {
    console.log("⚠️  Avisos (não bloqueantes):");
    warnings.forEach((w) => console.log("  " + w));
    console.log();
  }

  if (failures.length > 0) {
    console.log("❌ Falhas (bloqueantes):");
    failures.forEach((f) => console.log("  " + f));
    console.log();
    console.log("──────────────────────────────────────────────");
    console.log("RESULTADO: REPROVADO");
    console.log("──────────────────────────────────────────────");
    console.log("Corrija os campos mínimos ausentes/inválidos e atualize o corpo da PR.");
    console.log("Governança obrigatória real: arquivos vivos em schema/status/, schema/handoffs/, schema/contracts/");
    console.log("Template de referência: .github/PULL_REQUEST_TEMPLATE.md");
    console.log("Protocolo: schema/CODEX_WORKFLOW.md");
    console.log("──────────────────────────────────────────────\n");
    process.exit(1);
  }

  console.log("──────────────────────────────────────────────");
  console.log("RESULTADO: APROVADO");
  console.log("──────────────────────────────────────────────");
  console.log("Campos mínimos de governança presentes. Fonte de verdade: arquivos vivos do repo.\n");
  process.exit(0);
}

main();
