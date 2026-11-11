# Skill testing practice

**Access date:** 10-11-2026
**Scope:** check whether `mattpocock/skills` tests or evaluates its own skills and compare that practice with official Codex and Claude Code documentation. It does not recommend a solution for this project.

## Short conclusion

The public Matt Pocock repository did not contain an automated test or eval suite for its own skills at the point checked. This does not prove that they are never tested outside the repository. By contrast, official OpenAI and Claude Code documentation recommends behavioural evals to detect regressions after a skill works manually.

There is insufficient evidence to say that evals are common practice in every skills repository. There is evidence that they are officially supported and recommended in both environments.

## Facts about `mattpocock/skills`

### Published structure and commands

In the repository tree on `main`, checked at commit `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`, there are no directories or files named for test or eval suites (`test`, `tests`, `eval` or `evals`). The tree includes three GitHub Actions workflows and `skills/engineering/tdd/tests.md`, which is instructional material for testing code produced by an agent, not a suite that tests the skills. [Repository tree](https://api.github.com/repos/mattpocock/skills/git/trees/main?recursive=1) [Good and bad tests guide](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/tdd/tests.md)

The `package.json` declares only versioning and plugin-version checking commands. It does not declare `test`, `check` or `eval`. The release workflow installs dependencies and runs versioning; it does not run tests or evals. [package.json](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/package.json) [Release workflow](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.github/workflows/release.yml)

The `writing-for-agents` document explicitly states that, for that material, there is no automatic eval and that verification is a manual run using failure vocabulary as a diagnostic. This is a statement about that document, not a guarantee for every skill in the repository. [writing-for-agents](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/docs/productivity/writing-for-agents.md)

### Limitation of the conclusion

The absence of files and commands in the repository does not show how Matt Pocock tests locally, in external services or before publishing. The confirmed conclusion is narrower: **the public repository checked does not distribute an automated test or eval suite for its own skills**.

## Official recommendations

### OpenAI / Codex

OpenAI recommends starting with a manual run to expose assumptions and then creating a small set of prompts that covers explicit invocation, implicit invocation, context, negative control and incomplete inputs. It describes evals as a prompt, captured execution, checks and scoring. It also recommends deterministic checkers over `codex exec --json` events before adding model-based evaluation. [Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills)

### Claude Code

Claude Code provides `claude plugin eval` for plugins with skills. Each case uses a realistic prompt and graders that check the response, transcript or created files. The documentation says evals measure reliability, detect regressions and compare with a run without the plugin. It also explains that every run uses real model calls and consumes usage or budget. [Test plugins with evals](https://code.claude.com/docs/en/plugin-evals)

## Inferences

1. **Structural tests and behavioural evals answer different questions.** A `SKILL.md` checker can detect missing metadata or headings. It does not demonstrate that the environment discovers, invokes and follows the skill.
2. **Starting with structural validation only is a phase choice, not an environment rule.** Both providers document behavioural evals, but those evals require prompts, model execution and, for Claude, a plugin and execution costs.
3. **Matt Pocock should not be used as evidence against evals.** The repository shows a manual verification practice for at least one document and does not distribute automated evals; this neither invalidates the official tools nor demonstrates their prevalence in the ecosystem.

## Open questions

1. Should the project require a manual behavioural run before the first publication of each skill?
2. At what point do cost and complexity justify automated per-environment evals?
3. Should the future structural validator run in CI before behavioural evals exist?

## Primary sources consulted

- [Matt Pocock — repository tree](https://api.github.com/repos/mattpocock/skills/git/trees/main?recursive=1)
- [Matt Pocock — package.json](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/package.json)
- [Matt Pocock — release workflow](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.github/workflows/release.yml)
- [Matt Pocock — writing-for-agents](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/docs/productivity/writing-for-agents.md)
- [OpenAI — Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills)
- [Claude Code — Test plugins with evals](https://code.claude.com/docs/en/plugin-evals)
