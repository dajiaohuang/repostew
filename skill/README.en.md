# RepoStew Skill

**Portable workflows for repository discovery, repair, contribution and maintenance.**

[中文](README.zh.md) · [Load the Skill](SKILL.md) · [Integrations](integrations/README.md) · [Repository overview](../README.md)

The Skill defines how agents investigate actual use, complete bounded repository work,
publish repairs and handle follow-up. It supplies roles, task forms and workflow rules.
Execution comes from the harness you use.

## What is included

| Directory | Responsibility |
| --- | --- |
| [SKILL.md](SKILL.md) | Entry point and complete workflow index |
| [roles/](roles/) | Supervisor, Coordinator, Worker and Maintainer responsibilities |
| [prompts/](prompts/README.md) | Task forms and continuation/handoff templates |
| [references/](references/) | Investigation, delivery, feedback, state and resource rules |
| [integrations/](integrations/README.md) | Packages and adapters for supported hosts |

## Use it

1. Load [SKILL.md](SKILL.md) in a compatible agent environment.
2. Select a workspace outside this source tree for project records and working material.
3. Assign a scoped task using the linked role and task form.

The Skill does not start an execution service. It can run independently of the
[RepoStew execution harness](../harnesses/pi/README.md); that harness can also use
this directory through its `policyDir` configuration.

## Build and verify

From this directory:

```sh
rtk python scripts/validate-policy.py
rtk python scripts/test-policy-boundaries.py
rtk python scripts/build-package.py
rtk python scripts/validate-package.py
```

The bundle is generated at `dist/repostew/`. Use `--output <new-directory>` for
another build. Follow [integration setup](integrations/README.md) to install it.
Generated copies are not source files.

The core workflow is harness-neutral. Platform-specific behavior stays in the
integration adapters and [harness references](references/harness.md).

[MIT](../LICENSE)
