# Issue tracker: GitHub

This project's tickets and specifications live in GitHub Issues. Use `gh` to read, create, comment on, label and close issues.

## Conventions

- Create an issue: `gh issue create --title "..." --body "..."`.
- Read an issue: `gh issue view <number>`.
- List issues: `gh issue list`.
- Add or remove a label: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close an issue: `gh issue close <number> --comment "..."`.

Infer the repository from `origin`.

## Pull requests as a triage surface

**No.** External pull requests do not automatically enter the triage flow.

## Publishing or retrieving issues

When a skill asks to publish to the tracker, create a GitHub Issue. When it asks for the relevant issue, read that issue.
