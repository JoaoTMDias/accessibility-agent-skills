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
type ValidationErrors = string[];
type Frontmatter = { error: string } | { fields: Map<string, unknown>; body: string };

function parseFrontmatter(contents: string): Frontmatter {
  const lines = contents.split(/\r?\n/);
  if (lines[0] !== "---") return { error: "initial YAML frontmatter is required" };

  const closingDelimiter = lines.indexOf("---", 1);
  if (closingDelimiter === -1) return { error: "initial YAML frontmatter is required" };

  const document = YAML.parseDocument(lines.slice(1, closingDelimiter).join("\n"), {
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    return { error: `invalid YAML frontmatter: ${document.errors[0].message}` };
  }

  if (!YAML.isMap(document.contents)) {
    return { error: "YAML frontmatter must be a metadata map" };
  }

  const fields = new Map<string, unknown>();
  for (const item of document.contents.items as Array<{ key?: { value?: unknown }; value?: { value?: unknown } }>) {
    if (typeof item.key?.value === "string") fields.set(item.key.value, item.value?.value);
  }
  return {
    fields,
    body: lines.slice(closingDelimiter + 1).join("\n"),
  };
}

function validateSkill(skillFile: string, requiresChecklist: boolean): ValidationErrors {
  const errors: ValidationErrors = [];
  const parsed = parseFrontmatter(readFileSync(skillFile, "utf8"));
  if ("error" in parsed) return [parsed.error];

  const { fields, body } = parsed;
  const name = fields.get("name");
  const description = fields.get("description");
  if (!name) errors.push("required 'name' metadata is missing");
  if (!description) errors.push("required 'description' metadata is missing");
  if (name && name !== basename(join(skillFile, ".."))) {
    errors.push(`'name' metadata ('${name}') does not match directory ('${basename(join(skillFile, ".."))}')`);
  }

  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]);
  for (const [index, section] of requiredSections.entries()) {
    const heading = headings[index];
    if (heading === section) continue;
    if (heading === undefined) {
      errors.push(`required section '${section}' is missing`);
    } else {
      errors.push(`required section '${section}' must precede '${heading}'`);
    }
    break;
  }

  validateSources(body, skillFile, errors);
  if (requiresChecklist) validateChecklist(skillFile, errors);
  return errors;
}

function validateChecklist(skillFile: string, errors: ValidationErrors): void {
  const checklist = join(skillFile, "..", "CHECKLIST.md");
  if (!existsSync(checklist) || !statSync(checklist).isFile()) {
    errors.push("CHECKLIST.md is missing");
    return;
  }
  const contents = readFileSync(checklist, "utf8").toLowerCase();
  for (const item of ["activation", "missing input", "negative case", "expected result"]) {
    const section = new RegExp(`^## ${item}\\s*\\n\\s*\\S`, "m");
    if (!section.test(contents)) {
      errors.push(`CHECKLIST.md must include '${item}'`);
    }
  }
}

function validateSources(body: string, skillFile: string, errors: ValidationErrors): void {
  const sources = body.match(/^## Sources\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? "";
  const skillDirectory = join(skillFile, "..");
  let hasSourceOrReason = false;

  for (const line of sources.split(/\r?\n/)) {
    const entry = line.trim();
    if (!entry) continue;
    if (/^not applicable:/i.test(entry)) {
      if (/^not applicable:\s+\S/i.test(entry)) hasSourceOrReason = true;
      else errors.push("'Not applicable' must include a reason");
      continue;
    }
    if (/^not applicable(?:\.|$)/i.test(entry)) {
      errors.push("'Not applicable' must include a reason");
      continue;
    }

    const link = entry.match(/^- \[[^\]]+\]\(([^)]+)\)(?:\s+—\s+(.+))?\s*$/);
    if (!link) {
      errors.push("a Sources entry must follow the external source or internal reference format");
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
    errors.push("Sources must specify a source or 'Not applicable: <reason>'");
  }
}

function validateExternalSource(url: string, details: string | undefined, errors: ValidationErrors): void {
  let parsedUrl: URL | undefined;
  try {
    parsedUrl = new URL(url);
  } catch {
    parsedUrl = undefined;
  }
  if (parsedUrl?.protocol !== "https:" || !parsedUrl.hostname) {
    errors.push(`external source '${url}' must use a direct https:// URL`);
  }

  const [entity, versionOrDate, ...extra] = details?.split(" — ") ?? [];
  if (!entity) {
    errors.push(`external source '${url}' must specify a responsible organisation`);
    errors.push(`external source '${url}' must specify a version or date in YYYY-MM-DD format`);
    return;
  }
  if (!versionOrDate) {
    if (isVersionOrDate(entity)) errors.push(`external source '${url}' must specify a responsible organisation`);
    else errors.push(`external source '${url}' must specify a version or date in YYYY-MM-DD format`);
    return;
  }
  if (extra.length > 0) errors.push(`external source '${url}' must specify only a responsible organisation and version or date`);
  if (extra.length > 0) return;

  if (!isVersionOrDate(versionOrDate)) {
    errors.push(`external source '${url}' must specify a version or date in YYYY-MM-DD format`);
  }
}

function isVersionOrDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d+(?:\.\d+)+$/.test(value);
}

function validateInternalReference(reference: string, skillDirectory: string, errors: ValidationErrors): void {
  const path = reference.split(/[?#]/, 1)[0];
  if (!path) {
    errors.push(`internal reference '${reference}' must point to a relative file`);
    return;
  }
  if (path.startsWith("/")) {
    errors.push(`internal reference '${reference}' must be relative`);
    return;
  }
  const target = resolve(skillDirectory, path);
  const repositoryRoot = realpathSync(process.cwd());
  if (isOutsideDirectory(target, repositoryRoot)) {
    errors.push(`internal reference '${reference}' is outside the repository`);
  } else if (!existsSync(target)) {
    errors.push(`internal reference '${reference}' does not exist`);
  } else if (isOutsideDirectory(realpathSync(target), repositoryRoot)) {
    errors.push(`internal reference '${reference}' is outside the repository`);
  } else if (!statSync(target).isFile()) {
    errors.push(`internal reference '${reference}' must point to a file`);
  }
}

function isOutsideDirectory(path: string, directory: string): boolean {
  const pathFromDirectory = relative(directory, path);
  return pathFromDirectory === ".." || pathFromDirectory.startsWith(`..${sep}`) || isAbsolute(pathFromDirectory);
}

function findSkillDirectories(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name));
}

function findOverlayDirectories(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((environment) => environment.isDirectory())
    .flatMap((environment) => findSkillDirectories(join(root, environment.name)));
}

const root = process.argv[2] ?? "skills";
const skillDirectories = findSkillDirectories(root);
const requiresChecklist = !relative(process.cwd(), resolve(root)).split(sep).includes("examples");
const failures = skillDirectories.flatMap((skillDirectory) => {
  const skillFile = join(skillDirectory, "SKILL.md");
  if (!existsSync(skillFile) || !statSync(skillFile).isFile()) {
    return [`${relative(process.cwd(), skillDirectory)}: SKILL.md is missing`];
  }
  return validateSkill(skillFile, requiresChecklist).map((error) => `${relative(process.cwd(), skillFile)}: ${error}`);
});

const overlaysRoot = join(root, "..", "overlays");
for (const overlayDirectory of findOverlayDirectories(overlaysRoot)) {
  const readme = join(overlayDirectory, "README.md");
  if (!existsSync(readme) || !statSync(readme).isFile()) {
    failures.push(`${relative(process.cwd(), overlayDirectory)}: README.md is missing`);
  } else if (!/^# (Activation|Installation)\s*\n\s*\S/m.test(readFileSync(readme, "utf8"))) {
    failures.push(`${relative(process.cwd(), readme)}: README.md must contain manual activation or installation instructions`);
  }
}

if (failures.length > 0) {
  console.error(`validate-skills: ${failures.length} error(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`validate-skills: ${skillDirectories.length} valid portable core(s).`);
}
