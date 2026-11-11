# Official tools for validating skills

**Access date:** 10-11-2026
**Scope:** official tools, or tools from the authors of the Agent Skills specification, that can validate a `SKILL.md`. It includes format, package and behaviour validation. It does not select or install tools.

## Short conclusion

No official, ready-to-use Node.js/TypeScript tool was identified that validates this project's full contract. The only reference implementation of the Agent Skills specification, `skills-ref validate`, uses Python and is described by its authors as demonstrative rather than intended for production. Official Claude Code and OpenAI tools mainly validate packages, configuration or behaviour; they do not document rules for arbitrary Markdown headings or local project references.

## Confirmed facts

### Coverage by tool

| Tool | Runtime and status | Documented validation | Does not document validation of |
| --- | --- | --- | --- |
| [`skills-ref validate`](https://github.com/agentskills/agentskills/tree/main/skills-ref) | Python 3.11+; reference library. Its authors state that it is for demonstration only, not production. | Directory and `SKILL.md` existence; YAML frontmatter; `name` and `description`; allowed fields from the specification; `name` format; correspondence between directory name and `name`; length limits. | Markdown body, headings, URLs, relative links or paths, existence of local references, activation or skill outcomes. |
| [OpenAI plugin submission validation](https://developers.openai.com/plugins/deploy/submission-errors) | Service validation during plugin submission; not documented as a reusable local CLI. | `skills/<name>/SKILL.md` location; regular, readable UTF-8 file; YAML that is a map; non-empty `name`; non-empty `description` of up to 1,024 characters; non-empty body; unique plugin names. | This project's seven sections, heading semantics, source links, local resources and behavioural suitability. |
| [`claude plugin validate`](https://code.claude.com/docs/en/plugin-evals) | Claude Code CLI command for plugins. | Documentation says that it checks plugin files for syntax and schema errors. | The documentation checked does not specify rules for custom Markdown headings, local references or the seven sections. |
| [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) | Claude Code CLI command; executes prompts and graders against a plugin. | Observed behaviour against evaluation cases and graders defined by the author. | Detailed structural conformance of `SKILL.md`; it does not replace a contract linter. It requires model calls and has associated cost. |
| [Codex skill evals](https://developers.openai.com/blog/eval-skills) | OpenAI guidance and evaluation workflow based on scenario executions. | Skill quality and behaviour against project-defined tasks and evaluation criteria. | Automatic validation of the seven sections, local paths or frontmatter rules as a standalone linter. |

### The `skills-ref` reference implementation

The official [agentskills/agentskills](https://github.com/agentskills/agentskills) repository includes `skills-ref`, a Python reference library. Its [README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md) exposes the `skills-ref validate path/to/skill` command, but explicitly states that the library is demonstrative only and not intended for production. Its [project file](https://github.com/agentskills/agentskills/blob/main/skills-ref/pyproject.toml) requires Python 3.11 or later; it is not a Node.js/TypeScript tool.

The [validator code](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py) confirms coverage of structure and frontmatter: it checks the directory, `SKILL.md`, YAML and field rules. It does not analyse the Markdown body or resolve referenced resources.

### What the specification requires, and does not require

The [Agent Skills specification](https://agentskills.io/specification) requires the skill directory, `SKILL.md` and frontmatter with `name` and `description`. It defines optional fields and resource conventions, but does not impose body headings. Therefore, the seven sections and local-reference checks are additional project rules, not rules a generic specification validator must know.

### Official tools by environment

OpenAI documents skill structure and plugin-submission validation, but the documentation checked does not provide a standalone local validator for `SKILL.md`. The [API skills page](https://developers.openai.com/api/docs/guides/tools-skills) describes accepting skill bundles; the [plugin skills page](https://developers.openai.com/plugins/build/skills) describes how skills enter a plugin. Neither defines a Node.js/TypeScript CLI that accepts configurable body rules.

Claude Code documents `claude plugin validate` for plugin syntax and schema, and `claude plugin eval` for behaviour. These commands are relevant to a Claude plugin distribution, but are not documented as configurable validators for the portable contract.

## Inferences for this project's contract

1. **No official tool identified covers the seven sections and local references without additional code.** This follows because the specification leaves the body unconstrained and the documented tools are limited to format, plugin schema or behaviour.
2. **`skills-ref` can be a useful reference for base rules, but should not be assumed as the production dependency.** Its authors state that limitation and its runtime is Python rather than Node.js/TypeScript.
3. **Two-layer validation remains a useful separation:** a project structural check for the contract, followed by later behavioural evals. Claude and OpenAI eval tools show that the second layer is a different problem from structural linting.
4. **A project rule or adapter will be required to run everything in one local project check.** This is a coverage conclusion, not a decision about language, dependencies or implementation.

## Gaps and open questions

- The `claude plugin validate` documentation does not list every schema rule it applies; it only confirms the category of “syntax and schema”. The command needs to run against a sample, or more detailed documentation needs to be obtained, before claiming specific `SKILL.md` rules.
- No official documentation was identified for an API that extends `skills-ref validate` with custom headings and references.
- No official Node.js/TypeScript tool that statically validates the contract was identified. This means “not identified in the official sources checked”; it does not prove that one cannot appear or exist outside that set.
- No third-party tool was assessed: it is outside the requested scope, which prioritises official sources and the specification authors.

## Primary sources consulted

- [Agent Skills — Specification](https://agentskills.io/specification) — accessed on 10-11-2026.
- [agentskills/agentskills — official repository](https://github.com/agentskills/agentskills) — accessed on 10-11-2026.
- [skills-ref — README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md) — accessed on 10-11-2026.
- [skills-ref — `pyproject.toml`](https://github.com/agentskills/agentskills/blob/main/skills-ref/pyproject.toml) — accessed on 10-11-2026.
- [skills-ref — `validator.py`](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py) — accessed on 10-11-2026.
- [OpenAI — plugin submission errors](https://developers.openai.com/plugins/deploy/submission-errors) — accessed on 10-11-2026.
- [OpenAI — API skills](https://developers.openai.com/api/docs/guides/tools-skills) — accessed on 10-11-2026.
- [OpenAI — skills in plugins](https://developers.openai.com/plugins/build/skills) — accessed on 10-11-2026.
- [OpenAI — Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills) — accessed on 10-11-2026.
- [Claude Code — plugin validation and evaluation](https://code.claude.com/docs/en/plugin-evals) — accessed on 10-11-2026.
