import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

function validate(example: string) {
  return validateDirectory(`examples/skill-contract/${example}`);
}

function validateDirectory(directory: string) {
  return spawnSync(
    process.execPath,
    ["dist/bin/validate-skills.js", directory],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
}

test("validate-skills aceita um núcleo portátil válido", () => {
  const result = validate("valid");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 núcleo portátil válido/);
});

test("validate-skills aceita fontes externas com data ou versão e referências internas válidas", () => {
  const result = validate("valid-sources");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 núcleo portátil válido/);
});

test("validate-skills exige uma fonte ou uma explicação de inaplicabilidade", () => {
  const result = validate("invalid-empty-sources");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Sources tem de indicar uma fonte ou 'Não se aplica: <motivo>'/);
});

test("validate-skills exige motivo quando as fontes não se aplicam", () => {
  const result = validate("invalid-not-applicable");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /'Não se aplica' tem de incluir um motivo/);
});

test("validate-skills explica fontes externas sem URL https, entidade ou data", () => {
  const result = validate("invalid-sources");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /URL directo em https/);
  assert.match(result.stderr, /https:\/\/example\.com\/.*entidade responsável/);
  assert.match(result.stderr, /https:\/\/example\.com\/.*versão ou data/);
  assert.match(result.stderr, /tem de seguir o formato de fonte externa/);
  assert.match(result.stderr, /URL directo em https/);
});

test("validate-skills rejeita referências internas cujo symlink sai do repositório", () => {
  const skillRoot = mkdtempSync(join(repositoryRoot, ".validate-skills-"));
  const externalRoot = mkdtempSync(join(tmpdir(), "validate-skills-"));

  try {
    const skillDirectory = join(skillRoot, "accessibility-review");
    const referencesDirectory = join(skillDirectory, "references");
    const externalFile = join(externalRoot, "method.md");
    mkdirSync(referencesDirectory, { recursive: true });
    writeFileSync(externalFile, "# Método\n");
    symlinkSync(externalFile, join(referencesDirectory, "method.md"));
    writeFileSync(
      join(skillDirectory, "SKILL.md"),
      `---\nname: accessibility-review\ndescription: Analisa uma interface.\n---\n\n## Purpose and boundaries\n\nLimites.\n\n## Required inputs\n\nEntradas.\n\n## Expected outcome\n\nResultado.\n\n## Sources\n\n- [Método](references/method.md)\n\n## Optional tools\n\nNão se aplica: sem ferramentas.\n\n## Limitations and uncertainty\n\nLimites.\n\n## Quality criteria\n\nCritérios.\n`,
    );

    const result = validateDirectory(skillRoot);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /referência interna 'references\/method\.md' sai do repositório/);
  } finally {
    rmSync(skillRoot, { recursive: true, force: true });
    rmSync(externalRoot, { recursive: true, force: true });
  }
});

test("validate-skills explica referências internas inexistentes", () => {
  const result = validate("invalid-references");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /referência interna 'references\/ausente\.md' não existe/);
  assert.match(result.stderr, /referência interna '.*fora-do-repositorio\.md' sai do repositório/);
  assert.match(result.stderr, /referência interna 'references' tem de apontar para um ficheiro/);
  assert.match(result.stderr, /referência interna '#metodo' tem de apontar para um ficheiro relativo/);
  assert.match(result.stderr, /referência interna '\/docs\/skill-contract\.md' tem de ser relativa/);
});

test("validate-skills aceita um nome que coincide exactamente com o directório", () => {
  const result = validate("valid-unrestricted-name");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 núcleo portátil válido/);
});

test("validate-skills explica a ausência de frontmatter", () => {
  const result = validate("invalid");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /frontmatter YAML inicial é obrigatório/);
});

test("validate-skills explica YAML inválido", () => {
  const result = validate("invalid");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /frontmatter YAML inválido/);
});

test("validate-skills explica metadados e nome do directório diferentes", () => {
  const result = validate("invalid");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /metadado obrigatório 'description'/);
  assert.match(result.stderr, /não coincide com o directório/);
  assert.match(result.stderr, /secção obrigatória 'Quality criteria' está em falta/);
});

test("validate-skills exige as secções pela ordem do contrato", () => {
  const result = validate("invalid");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /esperada a secção obrigatória 'Purpose and boundaries' antes de 'Required inputs'/);
});

test("validate-skills detecta um directório imediato sem SKILL.md", () => {
  const result = validate("invalid");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing-skill-file: falta o ficheiro SKILL\.md/);
});

test("validate-skills aceita um núcleo real sem overlay quando tem CHECKLIST.md", () => {
  const project = createProject({ checklist: true });

  try {
    const result = validateDirectory(join(project, "skills"));

    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("validate-skills exige CHECKLIST.md para um núcleo real", () => {
  const project = createProject();

  try {
    const result = validateDirectory(join(project, "skills"));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /falta o ficheiro CHECKLIST\.md/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("validate-skills exige os quatro casos no CHECKLIST.md", () => {
  const project = createProject({ checklist: true, checklistContent: "# Checklist\n\n- Activação\n" });

  try {
    const result = validateDirectory(join(project, "skills"));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /CHECKLIST\.md tem de incluir 'entrada em falta'/);
    assert.match(result.stderr, /CHECKLIST\.md tem de incluir 'caso negativo'/);
    assert.match(result.stderr, /CHECKLIST\.md tem de incluir 'resultado esperado'/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("validate-skills aceita um overlay com README.md", () => {
  const project = createProject({ checklist: true, overlayReadme: true });

  try {
    const result = validateDirectory(join(project, "skills"));

    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("validate-skills explica a ausência de README.md num overlay", () => {
  const project = createProject({ checklist: true, overlayWithoutReadme: true });

  try {
    const result = validateDirectory(join(project, "skills"));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /overlays\/codex\/accessibility-review: falta o ficheiro README\.md/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("validate-skills exige instruções num README.md de overlay", () => {
  const project = createProject({ checklist: true, overlayReadme: true, overlayReadmeContent: "" });

  try {
    const result = validateDirectory(join(project, "skills"));

    assert.equal(result.status, 1);
    assert.match(result.stderr, /README\.md tem de conter instruções manuais de activação ou instalação/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("check-language aceita inglês e detecta português fora da allowlist", () => {
  const directory = mkdtempSync(join(repositoryRoot, ".language-check-"));
  const english = join(directory, "english.md");
  const portuguese = join(directory, "portuguese.md");
  try {
    writeFileSync(english, "The validator reports clear errors.\n");
    writeFileSync(portuguese, "O validador não apresenta erros claros.\n");
    const accepted = spawnSync(process.execPath, ["dist/bin/check-language.js", english], { cwd: repositoryRoot, encoding: "utf8" });
    const rejected = spawnSync(process.execPath, ["dist/bin/check-language.js", portuguese], { cwd: repositoryRoot, encoding: "utf8" });
    assert.equal(accepted.status, 0, accepted.stderr);
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /Portuguese content detected/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createProject({ checklist = false, checklistContent = checklistContents, overlayReadme = false, overlayReadmeContent = "# Activação\n\nCopiar manualmente este overlay.\n", overlayWithoutReadme = false } = {}) {
  const project = mkdtempSync(join(repositoryRoot, ".validate-skills-"));
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
description: Analisa uma interface.
---

## Purpose and boundaries

Limites.

## Required inputs

Entradas.

## Expected outcome

Resultado.

## Sources

Não se aplica: exemplo de teste.

## Optional tools

Não se aplica: sem ferramentas.

## Limitations and uncertainty

Limites.

## Quality criteria

Critérios.
`;

const checklistContents = `## Activação

Executar o skill.

## Entrada em falta

O skill pede a informação em falta.

## Caso negativo

O skill declara a limitação.

## Resultado esperado

O skill devolve o resultado definido.
`;
