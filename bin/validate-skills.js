#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import YAML from "yaml";

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
  const lines = contents.split(/\r?\n/);
  if (lines[0] !== "---") return { error: "o frontmatter YAML inicial é obrigatório" };

  const closingDelimiter = lines.indexOf("---", 1);
  if (closingDelimiter === -1) return { error: "o frontmatter YAML inicial é obrigatório" };

  const document = YAML.parseDocument(lines.slice(1, closingDelimiter).join("\n"), {
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    return { error: `frontmatter YAML inválido: ${document.errors[0].message}` };
  }

  if (!YAML.isMap(document.contents)) {
    return { error: "o frontmatter YAML deve ser um mapa de metadados" };
  }

  return {
    fields: new Map(document.contents.items.map((item) => [item.key?.value, item.value?.value])),
    body: lines.slice(closingDelimiter + 1).join("\n"),
  };
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
  if (name && name !== basename(join(skillFile, ".."))) {
    errors.push(`o metadado 'name' ('${name}') não coincide com o directório ('${basename(join(skillFile, ".."))}')`);
  }

  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]);
  for (const [index, section] of requiredSections.entries()) {
    const heading = headings[index];
    if (heading === section) continue;
    if (heading === undefined) {
      errors.push(`a secção obrigatória '${section}' está em falta`);
    } else {
      errors.push(`esperada a secção obrigatória '${section}' antes de '${heading}'`);
    }
    break;
  }
  return errors;
}

function findSkillDirectories(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name));
}

const root = process.argv[2] ?? "skills";
const skillDirectories = findSkillDirectories(root);
const failures = skillDirectories.flatMap((skillDirectory) => {
  const skillFile = join(skillDirectory, "SKILL.md");
  if (!existsSync(skillFile) || !statSync(skillFile).isFile()) {
    return [`${relative(process.cwd(), skillDirectory)}: falta o ficheiro SKILL.md`];
  }
  return validateSkill(skillFile).map((error) => `${relative(process.cwd(), skillFile)}: ${error}`);
});

if (failures.length > 0) {
  console.error(`validate-skills: ${failures.length} erro(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`validate-skills: ${skillDirectories.length} núcleo portátil válido(s).`);
}
