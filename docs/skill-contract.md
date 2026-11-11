# Portable skill contract 1.0.0

This contract defines the portable core of an accessibility skill. It applies to every `skills/<name>/SKILL.md`.

## Structure

- The directory contains UTF-8 `SKILL.md`.
- `name` exactly matches the directory name.
- Additional resources are optional.

## Required metadata

`SKILL.md` starts with YAML frontmatter and includes non-empty `name` and `description` values.

## Required sections

The Markdown body starts with these level-two headings in order: `Purpose and boundaries`, `Required inputs`, `Expected outcome`, `Sources`, `Optional tools`, `Limitations and uncertainty`, and `Quality criteria`.

## Sources and references

External sources use `- [Title](https://example.org/source) — Responsible organisation — version-or-date`. Versions use dot-separated numbers and access dates use `YYYY-MM-DD`. Internal references are relative to `SKILL.md`, resolve to existing files and remain inside the repository. When no source applies, use `Not applicable: <reason>`.

## Checklists and overlays

Every real skill has `CHECKLIST.md` with populated `## Activation`, `## Missing input`, `## Negative case` and `## Expected result` sections. Examples do not require a checklist. Overlays are optional at `overlays/<environment>/<name>/` and include `README.md` with `# Activation` or `# Installation` instructions.

## Local validation

`npm run validate-skills` validates portable cores directly in `skills/`. It exits non-zero and identifies the violated file or directory rule.
