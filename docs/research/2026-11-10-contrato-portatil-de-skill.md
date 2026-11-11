# Portable skill contract

**Ticket:** Portable skill contract

**Access date:** 10-11-2026
**Scope:** interoperability of accessibility skills between Claude Code and Codex. It does not select MVP skills or define implementations.

## Conclusion

The common contract should be a directory whose name matches `name`, containing a UTF-8 `SKILL.md`. The file starts with YAML frontmatter with only `name` and `description` required; the Markdown body uses seven stable sections: **Purpose and boundaries**, **Required inputs**, **Expected outcome**, **Sources**, **Optional tools**, **Limitations and uncertainty** and **Quality criteria**. `license`, `compatibility` and `metadata` may be used when needed, but must not carry essential workflow semantics. Tools must be declared in the body as optional capability, never as a portable permission.

This preserves the part both products document (directory, `SKILL.md`, `name`, `description`, instructions and optional resources) and avoids fields that either platform treats as an extension or whose Codex behaviour is undocumented.

## Confirmed facts

### 1. Agent Skills specification

The specification defines a skill as a directory containing, at a minimum, `SKILL.md`; `scripts/`, `references/` and `assets/` are optional conventions. `SKILL.md` has YAML frontmatter followed by Markdown. [Specification — structure and frontmatter](https://agentskills.io/specification)

| Frontmatter field | Status in the specification | Confirmed rule |
| --- | --- | --- |
| `name` | required | 1–64 characters; lowercase letters, digits and hyphens; does not start or end with a hyphen, does not include `--`, and matches the parent directory. |
| `description` | required | 1–1024 characters, non-empty; explains what it does and when to use it. |
| `license` | optional | Licence or reference to a licence file. |
| `compatibility` | optional | Up to 500 characters; environment requirements. |
| `metadata` | optional | String-to-string map for additional properties. |
| `allowed-tools` | optional and experimental | String of pre-approved tools; support varies between implementations. |

The body has no required structure. The specification recommends steps, input/output examples and edge cases. It also recommends instructions under 5,000 tokens, `SKILL.md` under 500 lines, and resources loaded on demand; references should use shallow relative paths. [Specification — content, progressive disclosure and references](https://agentskills.io/specification)

### 2. Documented Claude Code support

Claude Code says it follows the Agent Skills specification and documents acceptance of the six specification fields. For distribution outside Claude Code (claude.ai upload, Skills API and `package_skill.py`), only those six fields are accepted; extra fields fail validation. [Claude Code — frontmatter compatibility](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code)

In local Claude Code, `SKILL.md` can contain additional fields including `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `disallowed-tools`, `context`, `agent`, `model`, `paths`, `hooks` and `shell`. Claude documents, for example, that `allowed-tools` grants pre-approval only during the turn that invokes the skill. [Claude Code — frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference) [Claude Code — tool pre-approval](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill)

Local project loading in Claude Code uses `.claude/skills/<name>/SKILL.md`; there are also personal, enterprise, plugin, added-directory and legacy-command scopes. [Claude Code — location and name resolution](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name)

### 3. Documented Codex support

Codex documents a skill as a directory containing `SKILL.md`, `name`, `description`, instructions and optional `scripts/`, `references/` or `assets/`. Codex and ChatGPT use `name` and `description` for discovery and load the body when they select the skill. [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills)

For local skills, Codex scans `.agents/skills` from the working directory to the repository root, and also has user, administrator and system scopes. [OpenAI — Codex locations](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)

In Codex, `agents/openai.yaml` is optional and is used for application presentation, implicit-invocation policy and tool dependencies. MCP dependencies are declared in that file, not in `SKILL.md`. [OpenAI — optional metadata](https://learn.chatgpt.com/docs/build-skills#optional-metadata) [OpenAI — MCP dependencies](https://developers.openai.com/plugins/build/skills)

### 4. Relevant differences

| Topic | Claude Code | Codex | Impact on the common contract |
| --- | --- | --- | --- |
| Local path | `.claude/skills/` | `.agents/skills/` | Installation remains outside portable content. |
| Discovery | Description; can add `when_to_use` | `name`, description and path; descriptions may be truncated by the context limit | The `description` should contain purpose, triggers and exclusions at the start. |
| Invocation control | Frontmatter fields | `agents/openai.yaml` | Do not declare invocation policy in the common contract. |
| Tools | `allowed-tools` has turn-scoped pre-approval semantics | `agents/openai.yaml` declares dependencies; the documentation checked does not assign permission semantics to `allowed-tools` | Do not use `allowed-tools` for common requirements or authorisation. |
| Dynamic context/subagent | Extensions such as `!` for shell, `CLAUDE_*` placeholders and `context: fork` | Own metadata and integration | Exclude from portable body and frontmatter. |

### 5. Boundary of what is evidenced about standard fields in Codex

Codex says skills are based on the open Agent Skills standard, but the local-creation page checked explicitly requires only `name` and `description`; it does not list behaviour for `license`, `compatibility`, `metadata` or `allowed-tools` in `SKILL.md`. It is therefore evidenced that these four fields belong to the specification, but not that each produces behaviour in local Codex. This distinction matters so that the MVP does not depend on them. [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills) [Specification — fields](https://agentskills.io/specification)

## Design inferences

These decisions are not formal requirements of the specification; they are proposed conventions for this project.

1. **Use only `name` and `description` as core fields.** They are the only two required by the specification and the only two explicitly required by the Codex documentation checked. This reduces failure points and keeps discovery portable.
2. **Make the seven Markdown sections mandatory in the project.** The specification leaves the body free, but OpenAI requires a workflow to make clear its input, steps, output, facts it cannot infer, when to ask or stop, and supporting files. The sections translate those requirements into a verifiable format. [OpenAI — defining workflow boundaries](https://developers.openai.com/plugins/build/skills)
3. **Describe tools; do not authorise them.** An “Optional tools” section can state purpose, preconditions and a manual alternative. It grants no permissions and survives configuration differences.
4. **Use relative links for included material and direct URLs for external standards.** This is compatible with the specification recommendation and makes provenance auditable.

## Recommended portable contract

### Minimum structure

| Element | Project rule | Brief rationale |
| --- | --- | --- |
| `<name>/SKILL.md` | required; `<name>` equals `name` | complies with the specification. |
| Frontmatter | required; `name` and `description` only as the base | proven common surface. |
| `references/` | optional; lengthy sources or standards per file | keeps `SKILL.md` short and enables on-demand loading. |
| `scripts/` and `assets/` | optional | only when there is a deterministic need or reusable resource. |

### Minimum semantics of each `SKILL.md`

| Section | Required content | Quality rule |
| --- | --- | --- |
| `## Purpose and boundaries` | problem it solves, when to use and not use it | do not promise unperformed validation or conformance. |
| `## Required inputs` | data, format, context and what to do when they are missing | separate required from optional; do not infer critical facts. |
| `## Expected outcome` | deliverable, format, detail and evidence to return | explicitly verifiable by the user. |
| `## Sources` | sources to consult, authority hierarchy and citation approach | prefer standards, vendors or official implementation; distinguish facts from inferences. |
| `## Optional tools` | tool, purpose, availability condition and alternative | never assume credentials, network access or permission. |
| `## Limitations and uncertainty` | method boundaries, coverage not guaranteed and when to escalate or ask | say “needs verification” where applicable. |
| `## Quality criteria` | result checklist, including applicable accessibility | observable criteria, not vague adjectives such as “good quality”. |

`description` should be concise and contain, in this order, purpose, triggers and the main exclusion. It is the information both environments use before reading the complete instructions. [Specification — progressive disclosure](https://agentskills.io/specification) [OpenAI — activation](https://learn.chatgpt.com/docs/build-skills#how-chatgpt-and-codex-use-skills)

### Permitted but unnecessary optional fields

- `license`: when distribution requires it.
- `compatibility`: only for a real environment dependency; not to declare a preference for an agent.
- `metadata`: only non-essential string-to-string pairs (for example, editorial version). Execution must not depend on it.
- `allowed-tools`: not part of the recommended contract. It may exist in a Claude Code-specific variant after security review, but it is experimental in the specification and support varies.

## Outside the common contract

Keep these in per-environment distribution or configuration overlays, never in portable `SKILL.md`:

- **Claude Code:** `.claude/skills`, invocation and argument fields, `context`, `agent`, `model`, `paths`, `shell`, `hooks`, `disallowed-tools`, the `allowed-tools` permission mechanism, `!` commands and `${CLAUDE_*}` variables.
- **Codex:** `.agents/skills`, `agents/openai.yaml` (interface, `policy.allow_implicit_invocation` and `dependencies.tools`), `~/.codex/config.toml`, plugin manifests or overlays, and Codex/ChatGPT hooks.
- **Both:** concrete connector names, credentials, absolute paths, authorisation decisions, runtime versions, UI and automations. They may be documented prerequisites, but not silent workflow conditions.

## Open questions

1. **Validation in local Codex of the four optional standard fields:** the documentation checked does not confirm whether they are preserved, ignored or used. This should be tested in a clean installation before moving from “optional metadata” to an operational dependency.
2. **Name and format of this project's overlay mechanism:** a distribution strategy has not yet been chosen (parallel folders, build generation or plugins). It does not need to be settled to write portable skills.
3. **Domain-specific quality criteria:** the contract specifies that every skill must have them; the concrete framework (for example WCAG, WAI-ARIA or assistive-technology testing) should be defined by skill type, not invented here.

## Primary sources consulted

- [Agent Skills — Specification](https://agentskills.io/specification) — accessed on 10-11-2026.
- [Claude Code — Skills](https://code.claude.com/docs/en/skills) — accessed on 10-11-2026.
- [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills) — accessed on 10-11-2026.
- [OpenAI Developers — Build skills for plugins](https://developers.openai.com/plugins/build/skills) — accessed on 10-11-2026.
- [OpenAI API — Skills](https://developers.openai.com/api/docs/guides/tools-skills) — accessed on 10-11-2026.
