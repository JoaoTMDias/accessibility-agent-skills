#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const requiredSections = [
  "Purpose and boundaries",
  "Required inputs",
  "Expected outcome",
  "Sources",
  "Optional tools",
  "Limitations and uncertainty",
  "Quality criteria",
];

function parseFrontmatter(contents) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { error: "o frontmatter YAML inicial é obrigatório" };

  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.*?)\s*$/);
    if (field) fields.set(field[1], field[2].replace(/^(["'])(.*)\1$/, "$2"));
  }

  return { fields, body: contents.slice(match[0].length) };
}

function validateSkill(skillFile) {
  const errors = [];
  const parsed = parseFrontmatter(readFileSync(skillFile, "utf8"));
  if (parsed.error) return [parsed.error];

  const { fields, body } = parsed;
  const name = fields.get("name");
  const description = fields.get("description");
  if (!name) errors.push("o metadado obrigatório 'name' está em falta");
  if (!description) errors.push("o metadado obrigatório 'description' está em falta");
  if (name && !/^(?=.{1,64}$)[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    errors.push("o metadado 'name' deve ter 1–64 caracteres minúsculos, algarismos ou hífen");
  }
  if (name && name !== basename(join(skillFile, ".."))) {
    errors.push(`o metadado 'name' ('${name}') não coincide com o directório ('${basename(join(skillFile, ".."))}')`);
  }

  const headings = new Set([...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]));
  for (const section of requiredSections) {
    if (!headings.has(section)) errors.push(`a secção obrigatória '${section}' está em falta`);
  }
  return errors;
}

function findSkillFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name, "SKILL.md"))
    .filter((file) => existsSync(file) && statSync(file).isFile());
}

const root = process.argv[2] ?? "skills";
const skillFiles = findSkillFiles(root);
const failures = skillFiles.flatMap((skillFile) =>
  validateSkill(skillFile).map((error) => `${relative(process.cwd(), skillFile)}: ${error}`),
);

if (failures.length > 0) {
  console.error(`validate-skills: ${failures.length} erro(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`validate-skills: ${skillFiles.length} núcleo portátil válido(s).`);
}
