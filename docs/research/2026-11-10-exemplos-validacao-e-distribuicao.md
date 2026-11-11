# Official examples of skill validation and distribution

**Access date:** 10-11-2026
**Scope:** examples for defining the portable contract's testing boundaries. It does not select MVP skills or propose an implementation.

## Short conclusion

There are three separate layers:

1. The Agent Skills specification defines the base `SKILL.md` format.
2. `skills-ref` provides reference validation of that format, but the project itself says it is not a production library.
3. Claude Code and OpenAI/Codex add their own distribution, configuration and testing mechanisms. These mechanisms do not belong to the portable core.

This supports the proposed testing boundary: validate the portable core through one interface, then test activation and outcome separately in each environment.

## Confirmed facts

### 1. What the reference validator checks

The `skills-ref` code checks that a directory exists, that it contains `SKILL.md`, that the frontmatter is readable and that it includes `name` and `description`. It also checks the format, length and correspondence between `name` and the directory name. It rejects frontmatter fields outside the set defined by the specification. [Validator code](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py)

The documented command is `skills-ref validate path/to/skill`. However, the README explicitly says that the library is a demonstration and is not intended for production. [skills-ref README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md)

**Confirmed boundary:** this validator does not prove the quality of a skill body. In the code checked, `validate()` reads the frontmatter and calls `validate_metadata()`; it does not validate Markdown headings, instruction semantics, body references or external sources. [Validator code](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py)

### 2. What official examples test

OpenAI recommends testing a skill with requests that should activate it, equivalent indirect requests, incomplete inputs, requests that should not activate it and edge cases in which it must not invent information or take an unsupported action. The documentation calls for reviewing activation and outcome quality. [OpenAI — Test the skill](https://developers.openai.com/plugins/build/skills)

Claude Code shows two checks for a skill: a request that matches the description for automatic activation, and direct invocation through the skill command. [Claude Code — create and test a skill](https://code.claude.com/docs/en/skills)

During plugin submission, OpenAI validates additional structural conditions: `SKILL.md` as a UTF-8 file, valid YAML frontmatter, non-empty `name` and `description`, and a non-empty body. [OpenAI — submission errors](https://developers.openai.com/plugins/deploy/submission-errors)

### 3. Examples of separation between core and environment

OpenAI describes `SKILL.md` as instructions and resources; MCP provides data, authorisation and controlled actions. When a skill requires MCP, the dependency is declared in `agents/openai.yaml`, not in workflow text. [OpenAI — Build skills](https://developers.openai.com/plugins/build/skills)

In OpenAI submission, `agents/openai.yaml`, where included, is skill-specific metadata and contains an `interface` separate from the plugin manifest. [OpenAI — skill agent metadata](https://developers.openai.com/plugins/deploy/submission-errors)

Claude Code allows project skills in `.claude/skills/<name>/SKILL.md` and plugin skills in `<plugin>/skills/<name>/SKILL.md`. A plugin is a larger unit, with a manifest and components such as agents, hooks and MCP. [Claude Code — skill locations](https://code.claude.com/docs/en/skills) [Claude Code — plugins](https://code.claude.com/docs/en/plugins/create)

Claude Code also adds frontmatter fields such as `disable-model-invocation` and `allowed-tools`; the latter grants temporary, environment-specific pre-approval. [Claude Code — frontmatter](https://code.claude.com/docs/en/skills)

## Inferences for this project

1. **Project validation should complement, not copy, the base format.** The `skills-ref` example shows what belongs to the format, but its own authors do not recommend it as a production dependency.
2. **Structural validation and behavioural testing are different things.** The former can confirm frontmatter, required headings and directory boundaries. The latter should use activation prompts, incomplete inputs, negative cases and edge cases.
3. **Environment overlays should be tested outside the portable core.** `agents/openai.yaml`, Claude Code fields and plugin manifests have different semantics. Validating `SKILL.md` does not prove that installation in Claude Code or Codex works.
4. **Reference checking needs an explicit decision.** The reference code does not resolve body links. The current contract requires identified sources, but has not yet decided whether future validation checks that URLs and relative paths exist.

## Open questions

1. Should project validation be limited to the seven sections or also check relative references and source format?
2. Will behavioural testing run manually in both environments, or use automation per environment?
3. Will overlays be distributed by copying, generation, symlink or plugin packages? The sources show possibilities but do not impose a choice.

## Primary sources consulted

- [Agent Skills — Specification](https://agentskills.io/specification)
- [Agent Skills — `skills-ref` README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md)
- [Agent Skills — `skills-ref` validator](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py)
- [OpenAI Developers — Build skills](https://developers.openai.com/plugins/build/skills)
- [OpenAI Developers — Plugin submission errors](https://developers.openai.com/plugins/deploy/submission-errors)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Create a plugin](https://code.claude.com/docs/en/plugins/create)
