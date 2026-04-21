#!/usr/bin/env node
"use strict";

const REQUIRED_FIELDS = [
  "Contrato ativo",
  "Próximo passo autorizado",
  "Objetivo",
  "Classificação da tarefa",
  "Escopo",
  "Fora de escopo",
  "Arquivos vivos atualizados",
  "Testes / Validação",
  "Plano de rollback",
  "Contrato encerrado nesta PR?",
];

const CLOSEOUT_FIELDS = [
  "Contrato encerrado",
  "Contrato encerrado com sucesso?",
  "Objetivo do contrato cumprido?",
  "Critérios de aceite cumpridos?",
  "Fora de escopo respeitado?",
  "Pendências remanescentes",
  "Evidências / provas do encerramento",
  "Data de encerramento",
  "PR que encerrou",
  "Destino do contrato encerrado",
  "Próximo contrato autorizado",
];

const BAD_PATTERNS = [
  /placeholder/i,
  /TODO/i,
  /preencher manualmente/i,
  /verificar schema\//i,
  /pend[êe]ncia de preenchimento/i,
];

const LIVE_PREFIXES = ["schema/status/", "schema/handoffs/", "schema/contracts/"];

function clean(text) {
  return (text || "").replace(/<!--[\s\S]*?-->/g, "").trim();
}

function getSection(body, label) {
  const lines = body.split("\n");
  let active = false;
  const out = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      const title = trimmed.slice(3).trim();
      if (title === label) {
        active = true;
        continue;
      }
      if (active) break;
    }
    if (active) out.push(line);
  }
  return clean(out.join("\n"));
}

function invalidValue(value) {
  if (!value) return true;
  return BAD_PATTERNS.some((re) => re.test(value));
}

function hasLiveDiff(changedFiles) {
  return changedFiles.some((file) => LIVE_PREFIXES.some((prefix) => file.startsWith(prefix)));
}

function main() {
  const body = process.env.PR_BODY || "";
  const changedFiles = (process.env.CHANGED_FILES || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const failures = [];

  if (!clean(body)) {
    console.error("❌ FALHA: corpo da PR vazio.");
    process.exit(1);
  }

  for (const field of REQUIRED_FIELDS) {
    const value = getSection(body, field);
    if (invalidValue(value)) {
      failures.push(`Campo obrigatório ausente/vazio/inválido: ${field}`);
    }
  }

  const liveFiles = getSection(body, "Arquivos vivos atualizados");
  if (!/nenhuma atualização viva necessária|nenhuma atualiza|sem atualiza|n\/a/i.test(liveFiles)) {
    if (changedFiles.length > 0 && !hasLiveDiff(changedFiles)) {
      failures.push("Arquivos vivos atualizados sem diff real em schema/status/, schema/handoffs/ ou schema/contracts/.");
    }
  }

  if (/^sim$/i.test(getSection(body, "Contrato encerrado nesta PR?"))) {
    for (const field of CLOSEOUT_FIELDS) {
      const value = getSection(body, field);
      if (invalidValue(value)) {
        failures.push(`Closeout ausente/vazio/inválido: ${field}`);
      }
    }
  }

  console.log("\nENOVA 2 — PR Governance Check\n");

  if (failures.length > 0) {
    console.log("❌ Falhas (bloqueantes):");
    failures.forEach((f) => console.log("  " + f));
    process.exit(1);
  }

  console.log("RESULTADO: APROVADO");
}

main();
