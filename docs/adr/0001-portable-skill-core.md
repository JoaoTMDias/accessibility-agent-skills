# Portable skill core

Each skill keeps its portable core in `skills/<name>/SKILL.md`. Environment-specific installation, permissions, invocation and integrations live in optional overlays at `overlays/<environment>/<name>/`, each with a short `README.md` for manual activation or installation.

Every skill uses these exact sections: `Purpose and boundaries`, `Required inputs`, `Expected outcome`, `Sources`, `Optional tools`, `Limitations and uncertainty`, and `Quality criteria`. Additional sections may follow them.

Accessibility recommendations cite suitable primary sources. External sources provide a direct `https://` URL, responsible organisation, and version or access date. Local references use repository-relative paths. Structural validation checks format; human review checks authority and relevance.

Missing essential sources or tools must be declared as limitations. Results describe evidence, method and limits without unsupported conformance claims.

One command validates portable cores, project rules, local references and URL format. `CHECKLIST.md` covers activation, missing input, a negative case and expected result. Validation runs locally and in GitHub Actions, where its required check blocks integration into `main`.

`docs/skill-contract.md` is the source of truth for contract `1.0.0`. Contract versions follow Semantic Versioning: major versions change mandatory rules, minor versions add compatible optional rules, and patch versions clarify wording.
