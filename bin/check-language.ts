#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const allowlistedPaths = new Set([
  "AGENTS.md", "GLOSSARY.md", "docs/adr/0001-portable-skill-core.md",
  "docs/agents/domain.md", "docs/agents/issue-tracker.md", "docs/agents/triage-labels.md",
  "docs/skill-contract.md", "bin/validate-skills.ts", "test/validate-skills.test.ts",
  "bin/check-language.ts",
  "docs/research/2026-11-10-contrato-portatil-de-skill.md",
]);
const allowlistedPrefixes = ["examples/skill-contract/"];
const portuguesePattern = /\b(não|para|ficheiro|fonte|secção|validação|obrigatório|resultado|falta)\b|[áàâãéêíóôõúç]/i;
const files = process.argv.slice(2).length > 0 ? process.argv.slice(2) : execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split("\n");
const failures = files.filter((file) => !allowlistedPaths.has(file) && !allowlistedPrefixes.some((prefix) => file.startsWith(prefix)) && portuguesePattern.test(readFileSync(file, "utf8")));

if (failures.length) {
  console.error(`check-language: Portuguese content detected:\n${failures.map((file) => `- ${file}`).join("\n")}`);
  process.exitCode = 1;
}
