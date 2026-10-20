# RepoStew monorepo

- `harnesses/pi/` owns the execution runtime, its setup, tests and runtime documentation.
- `skill/` owns portable repository workflows, integrations and package tools; follow `skill/AGENTS.md`.
- Root READMEs introduce both components. Keep English mirrors, Chinese copy and `docs/` aligned.
- Workspace records, credentials, runtime databases and local configurations stay outside published source.
- Preserve component boundaries: runtime implementation belongs in the harness; workflow policy in the Skill.
- After path changes, validate Skill policy/packages and affected harness configuration and prompt loading.
