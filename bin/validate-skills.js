#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
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

  validateSources(body, skillFile, errors);
  return errors;
}

function validateSources(body, skillFile, errors) {
  const sources = body.match(/^## Sources\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? "";
  const skillDirectory = join(skillFile, "..");
  let hasSourceOrReason = false;

  for (const line of sources.split(/\r?\n/)) {
    const entry = line.trim();
    if (!entry) continue;
    if (/^não se aplica:/i.test(entry)) {
      if (/^não se aplica:\s+\S/i.test(entry)) hasSourceOrReason = true;
      else errors.push("'Não se aplica' tem de incluir um motivo");
      continue;
    }
    if (/^não se aplica(?:\.|$)/i.test(entry)) {
      errors.push("'Não se aplica' tem de incluir um motivo");
      continue;
    }

    const link = entry.match(/^- \[[^\]]+\]\(([^)]+)\)(?:\s+—\s+(.+))?\s*$/);
    if (!link) {
      errors.push("a entrada em Sources tem de seguir o formato de fonte externa ou referência interna");
      hasSourceOrReason = true;
      continue;
    }

    hasSourceOrReason = true;
    const [, target, details] = link;
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
      validateExternalSource(target, details, errors);
    } else {
      validateInternalReference(target, skillDirectory, errors);
    }
  }

  if (!hasSourceOrReason) {
    errors.push("Sources tem de indicar uma fonte ou 'Não se aplica: <motivo>'");
  }
}

function validateExternalSource(url, details, errors) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    parsedUrl = undefined;
  }
  if (parsedUrl?.protocol !== "https:" || !parsedUrl.hostname) {
    errors.push(`a fonte externa '${url}' tem de usar URL directo em https://`);
  }

  const [entity, versionOrDate, ...extra] = details?.split(" — ") ?? [];
  if (!entity) {
    errors.push(`a fonte externa '${url}' tem de indicar entidade responsável`);
    errors.push(`a fonte externa '${url}' tem de indicar versão ou data no formato YYYY-MM-DD`);
    return;
  }
  if (!versionOrDate) {
    if (isVersionOrDate(entity)) errors.push(`a fonte externa '${url}' tem de indicar entidade responsável`);
    else errors.push(`a fonte externa '${url}' tem de indicar versão ou data no formato YYYY-MM-DD`);
    return;
  }
  if (extra.length > 0) errors.push(`a fonte externa '${url}' tem de indicar apenas entidade responsável e versão ou data`);
  if (extra.length > 0) return;

  if (!isVersionOrDate(versionOrDate)) {
    errors.push(`a fonte externa '${url}' tem de indicar versão ou data no formato YYYY-MM-DD`);
  }
}

function isVersionOrDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d+(?:\.\d+)+$/.test(value);
}

function validateInternalReference(reference, skillDirectory, errors) {
  const path = reference.split(/[?#]/, 1)[0];
  if (!path) {
    errors.push(`a referência interna '${reference}' tem de apontar para um ficheiro relativo`);
    return;
  }
  if (path.startsWith("/")) {
    errors.push(`a referência interna '${reference}' tem de ser relativa`);
    return;
  }
  const target = resolve(skillDirectory, path);
  const repositoryRoot = realpathSync(process.cwd());
  if (isOutsideDirectory(target, repositoryRoot)) {
    errors.push(`a referência interna '${reference}' sai do repositório`);
  } else if (!existsSync(target)) {
    errors.push(`a referência interna '${reference}' não existe`);
  } else if (isOutsideDirectory(realpathSync(target), repositoryRoot)) {
    errors.push(`a referência interna '${reference}' sai do repositório`);
  } else if (!statSync(target).isFile()) {
    errors.push(`a referência interna '${reference}' tem de apontar para um ficheiro`);
  }
}

function isOutsideDirectory(path, directory) {
  const pathFromDirectory = relative(directory, path);
  return pathFromDirectory === ".." || pathFromDirectory.startsWith(`..${sep}`) || isAbsolute(pathFromDirectory);
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
