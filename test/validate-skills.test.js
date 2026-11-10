import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function validate(example) {
  return validateDirectory(`examples/skill-contract/${example}`);
}

function validateDirectory(directory) {
  return spawnSync(
    process.execPath,
    ["bin/validate-skills.js", directory],
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
