import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const runValidator = (path: string) => spawnSync(process.execPath, ["dist/bin/validate-skills.js", path], { cwd: root, encoding: "utf8" });
const validate = (example: string) => runValidator(`examples/skill-contract/${example}`);

test("check-language accepts the migrated repository through the public command", () => {
  const result = spawnSync("npm", ["run", "check-language"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("validate-skills accepts valid portable cores", () => {
  for (const example of ["valid", "valid-sources", "valid-unrestricted-name"]) {
    const result = validate(example);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 valid portable core/);
  }
});

test("validate-skills reports contract violations in English", () => {
  const emptySources = validate("invalid-empty-sources");
  assert.match(emptySources.stderr, /Sources must specify a source or 'Not applicable: <reason>'/);
  const notApplicable = validate("invalid-not-applicable");
  assert.match(notApplicable.stderr, /'Not applicable' must include a reason/);
  const invalidSource = validate("invalid-sources");
  assert.match(invalidSource.stderr, /direct https:\/\/ URL/);
  assert.match(invalidSource.stderr, /responsible organisation/);
  assert.match(invalidSource.stderr, /version or date/);
  assert.match(invalidSource.stderr, /external source or internal reference format/);
  const invalidReference = validate("invalid-references");
  assert.match(invalidReference.stderr, /references\/missing\.md' does not exist/);
  assert.match(invalidReference.stderr, /outside-repository\.md' is outside the repository/);
  assert.match(invalidReference.stderr, /'references' must point to a file/);
  assert.match(invalidReference.stderr, /'#method' must point to a relative file/);
  assert.match(invalidReference.stderr, /'\/docs\/skill-contract\.md' must be relative/);
  const invalid = validate("invalid");
  assert.match(invalid.stderr, /initial YAML frontmatter is required/);
  assert.match(invalid.stderr, /invalid YAML frontmatter/);
  assert.match(invalid.stderr, /required 'description' metadata is missing/);
  assert.match(invalid.stderr, /does not match directory/);
  assert.match(invalid.stderr, /required section 'Quality criteria' is missing/);
  assert.match(invalid.stderr, /'Purpose and boundaries' must precede 'Required inputs'/);
  assert.match(invalid.stderr, /missing-skill-file: SKILL\.md is missing/);
});

test("validate-skills rejects a symlinked internal reference outside the repository", () => {
  const skillRoot = mkdtempSync(join(root, ".validate-skills-"));
  const externalRoot = mkdtempSync(join(tmpdir(), "validate-skills-"));
  try {
    const skill = join(skillRoot, "accessibility-review");
    mkdirSync(join(skill, "references"), { recursive: true });
    const method = join(externalRoot, "method.md");
    writeFileSync(method, "# Method\n");
    symlinkSync(method, join(skill, "references", "method.md"));
    writeFileSync(join(skill, "SKILL.md"), validSkill.replace("Not applicable: test example.", "- [Method](references/method.md)"));
    assert.match(runValidator(skillRoot).stderr, /references\/method\.md' is outside the repository/);
  } finally {
    rmSync(skillRoot, { recursive: true, force: true });
    rmSync(externalRoot, { recursive: true, force: true });
  }
});

test("validate-skills enforces checklists and overlay instructions", () => {
  const noChecklist = createProject();
  const incompleteChecklist = createProject({ checklist: true, checklistContent: "# Checklist\n\n- Activation\n" });
  const missingReadme = createProject({ checklist: true, overlayWithoutReadme: true });
  const emptyReadme = createProject({ checklist: true, overlayReadme: true, overlayReadmeContent: "" });
  const validOverlay = createProject({ checklist: true, overlayReadme: true });
  try {
    assert.match(runValidator(join(noChecklist, "skills")).stderr, /CHECKLIST\.md is missing/);
    const checklistErrors = runValidator(join(incompleteChecklist, "skills")).stderr;
    assert.match(checklistErrors, /'missing input'/);
    assert.match(checklistErrors, /'negative case'/);
    assert.match(checklistErrors, /'expected result'/);
    assert.match(runValidator(join(missingReadme, "skills")).stderr, /README\.md is missing/);
    assert.match(runValidator(join(emptyReadme, "skills")).stderr, /manual activation or installation instructions/);
    assert.equal(runValidator(join(validOverlay, "skills")).status, 0);
  } finally {
    for (const project of [noChecklist, incompleteChecklist, missingReadme, emptyReadme, validOverlay]) rmSync(project, { recursive: true, force: true });
  }
});

test("check-language accepts English and detects Portuguese", () => {
  const directory = mkdtempSync(join(root, ".language-check-"));
  const english = join(directory, "english.md");
  const portuguese = join(directory, "portuguese.md");
  try {
    writeFileSync(english, "The validator reports clear errors.\n");
    writeFileSync(portuguese, `O validador n${String.fromCharCode(227)}o apresenta erros claros.\n`);
    assert.equal(spawnSync(process.execPath, ["dist/bin/check-language.js", english], { cwd: root }).status, 0);
    const rejected = spawnSync(process.execPath, ["dist/bin/check-language.js", portuguese], { cwd: root, encoding: "utf8" });
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /Portuguese content detected/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("check-language scans research and specification notes", () => {
  const project = mkdtempSync(join(tmpdir(), "language-check-"));
  try {
    for (const directory of ["docs/research", "docs/specs"]) {
      const file = join(project, directory, "portuguese.md");
      mkdirSync(join(project, directory), { recursive: true });
      writeFileSync(file, `O validador n${String.fromCharCode(227)}o apresenta erros claros.\n`);
    }
    execFileSync("git", ["init", "--quiet"], { cwd: project });
    execFileSync("git", ["add", "docs"], { cwd: project });
    const result = spawnSync(process.execPath, [join(root, "dist/bin/check-language.js")], { cwd: project, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /docs\/research\/portuguese\.md/);
    assert.match(result.stderr, /docs\/specs\/portuguese\.md/);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

function createProject({ checklist = false, checklistContent = checklistContents, overlayReadme = false, overlayReadmeContent = "# Activation\n\nCopy this overlay manually.\n", overlayWithoutReadme = false } = {}) {
  const project = mkdtempSync(join(root, ".validate-skills-"));
  const skill = join(project, "skills", "accessibility-review");
  mkdirSync(skill, { recursive: true });
  writeFileSync(join(skill, "SKILL.md"), validSkill);
  if (checklist) writeFileSync(join(skill, "CHECKLIST.md"), checklistContent);
  if (overlayReadme || overlayWithoutReadme) {
    const overlay = join(project, "overlays", "codex", "accessibility-review");
    mkdirSync(overlay, { recursive: true });
    if (overlayReadme) writeFileSync(join(overlay, "README.md"), overlayReadmeContent);
  }
  return project;
}

const validSkill = `---
name: accessibility-review
description: Analyses an interface.
---

## Purpose and boundaries

Limitations.

## Required inputs

Inputs.

## Expected outcome

Outcome.

## Sources

Not applicable: test example.

## Optional tools

Not applicable: no tools.

## Limitations and uncertainty

Limitations.

## Quality criteria

Criteria.
`;

const checklistContents = `## Activation

Run the skill.

## Missing input

The skill requests the missing information.

## Negative case

The skill declares the limitation.

## Expected result

The skill returns the defined result.
`;
