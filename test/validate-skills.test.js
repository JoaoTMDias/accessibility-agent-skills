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

test("validate-skills explica metadados, nome do directório e secções em falta", () => {
  const result = validate("invalid");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /metadado obrigatório 'description'/);
  assert.match(result.stderr, /não coincide com o directório/);
  assert.match(result.stderr, /secção obrigatória 'Quality criteria' está em falta/);
});
