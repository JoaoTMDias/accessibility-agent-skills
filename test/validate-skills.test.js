import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function validate(example) {
  return spawnSync(
    process.execPath,
    ["bin/validate-skills.js", `examples/skill-contract/${example}`],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
}

test("validate-skills aceita um núcleo portátil válido", () => {
  const result = validate("valid");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 núcleo portátil válido/);
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
