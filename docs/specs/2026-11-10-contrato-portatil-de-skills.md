# Portable accessibility skill contract 1.0.0

## Problem Statement

The project needs a consistent way to create and maintain accessibility skills that work in Claude Code and Codex. Without an executable contract, each skill can adopt different structures, sources and boundaries, and that divergence only emerges late in review.

There is also no local or GitHub check yet to prevent the integration of a structurally invalid skill.

## Solution

Define the portable contract `1.0.0`, create the single `validate-skills` command and configure validation in GitHub Actions.

Each skill will have a portable core in `SKILL.md`. Environment-specific settings will remain in optional overlays, documented but without an installer in the first version. Automated validation guarantees structure; human review guarantees quality, source relevance and the suitability of accessibility recommendations.

## User Stories

1. As a skill author, I want a common structure so that I know exactly what each skill must declare.
2. As an author, I want the portable core not to depend on Claude Code or Codex so that I can reuse it across environments.
3. As an author, I want to declare purpose and boundaries so that a skill is not used beyond what it can support.
4. As an author, I want to declare required inputs so that the agent asks for missing information instead of inventing it.
5. As an author, I want to define the expected outcome so that behaviour can be evaluated.
6. As an author of accessibility recommendations, I want to cite suitable primary sources so that recommendations have an evidence base.
7. As a reviewer, I want to see the responsible organisation and version or access date for every source so that I can assess its provenance.
8. As a user, I want the skill to declare limitations and uncertainty so that I can distinguish facts from conditional conclusions.
9. As an author, I want to declare optional tools and acceptable alternatives so that the skill remains transparent when a tool fails.
10. As a maintainer, I want to run one validation command so that I can find errors before opening a pull request.
11. As a reviewer, I want GitHub Actions to block structurally invalid changes so that the contract remains consistent.
12. As an author, I want valid and invalid internal examples so that I can understand and test the validator rules.
13. As a user of an environment overlay, I want short manual instructions so that I can enable the configuration without relying on implicit knowledge.
14. As a human reviewer, I want a short per-skill behavioural checklist so that I can confirm activation, missing inputs, boundaries and outcome.
15. As a maintainer, I want to version the contract separately so that I know when a change requires migration of existing skills.

## Implementation Decisions

- The contract will have version `1.0.0` and will be the source of truth for the portable core.
- Each portable core uses `SKILL.md` with the base metadata `name` and `description`.
- All cores include, in this order, the sections `Purpose and boundaries`, `Required inputs`, `Expected outcome`, `Sources`, `Optional tools`, `Limitations and uncertainty` and `Quality criteria`.
- A section without applicable content explicitly explains why. Additional sections are allowed after the seven required sections.
- External sources use a direct `https://` URL, the responsible organisation, and a version or access date in `YYYY-MM-DD` format. Internal references use relative paths.
- Skills that make accessibility recommendations include at least one suitable primary source. Human review confirms whether the source is genuinely primary, relevant and sufficient.
- If an essential source or required tool is unavailable, the skill declares the limitation; it does not invent or silently replace evidence.
- The validator will be implemented in TypeScript and will use only one fixed YAML dependency.
- The `validate-skills` command validates every existing core and overlay and produces clear errors.
- Validation covers metadata, consistent naming, the seven sections, source structure, URL format and local references. It does not open external URLs or assess the semantic quality of sources.
- Overlays are optional. When present, they include manual instructions in a `README.md`.
- Each skill will have a short `CHECKLIST.md` covering activation, missing input, negative case and expected outcome. It is updated only if behaviour, inputs or boundaries change.
- GitHub Actions runs the same command. A failed check must prevent integration into the main branch through a required rule.
- The contract follows Semantic Versioning: major changes modify required rules, minor changes add compatible optional rules, and patches only clarify. A major change migrates all skills in the same change.

## Testing Decisions

- The main test is the observable behaviour of the `validate-skills` command, not its implementation details.
- Validation uses valid and invalid internal examples to cover metadata, required sections, sources, URLs, local references and overlays.
- A valid example confirms that an accepted contract is processed without error.
- Each invalid example confirms one specific, understandable error.
- GitHub Actions runs the same local validation, without a second implementation of the rules.
- The manual checklist is complementary: it tests each skill's future behaviour, but does not replace structural validation.
- There are no automated activation or per-environment behaviour evals yet; they will be considered once skills and stable patterns exist.

## Out of Scope

- Creating or selecting MVP skills.
- Installing overlays automatically.
- Creating automated evals for Claude Code or Codex.
- Opening URLs, checking the availability of external sources or automatically determining whether a source is primary.
- Declaring WCAG conformance or any other overall conformance.
- Supporting different contract versions in the same repository.

## Further Notes

The first delivery builds the contract and validation foundation before usable skills are published. A skill is ready for publication only after passing structural validation and human content review.
