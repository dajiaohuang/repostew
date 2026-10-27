# RepoStew

**Reliable agent execution and portable repository workflows, in one repository.**

[中文](README.zh.md) · [Project page](https://dajiaohuang.github.io/repostew/)

## Choose a component

| | Execution Harness | Repository Skill |
| --- | --- | --- |
| Purpose | Run and govern ongoing agent work | Define how repository work is investigated, delivered and maintained |
| Includes | Native Pi sessions, C-owned queues, durable continuation, recovery, MCP/CLI and fleet foundations | Roles, task forms, workflow rules and host integrations |
| Directory | [`harnesses/pi/`](harnesses/pi/) | [`skill/`](skill/) |
| Start | [Harness README](harnesses/pi/README.md) | [Skill README](skill/README.md) |

The Harness owns **execution**: task lifecycle, capacity, project reservations and
operation receipts. The Skill owns **workflows**: investigation, repair, publication,
feedback and authorized maintenance.

Use the Skill independently in a compatible agent environment, or pair it with the
Harness. The Harness loads this Skill through `policyDir`; it currently retains
repository-oriented task and project concepts.

All [19 workflow selectors](harnesses/pi/WORKFLOWS.md) are integrated: canonical
forms and methods, source capture, GitHub/GitLab reads, recurring passes, delivery,
maintenance, records, backup and authorized disposition. [Operational recovery](harnesses/pi/OPERATIONS.md)
documents the fixes derived from real task failures and remaining capability limits.

## Recommended deployment options

- **OpenRig + Pi:** use OpenRig's native seats, queue and recovery with RepoStew's assembled C/W contracts and Pi extension. Start with the [configuration templates and activation guide](examples/openrig-pi/README.md), distilled from an actual independent-group deployment.
- **Standalone RepoStew Pi harness:** use the bundled execution service described below.
- **Skill only:** bring the portable workflows to another compatible host.

Choose one execution owner per task. The OpenRig examples do not start a fleet or change existing harness configuration; native Windows OpenRig remains experimental.

## Current operating contract

The canonical [Skill](skill/SKILL.md), [C/W roles](skill/roles/coordinator.md) and
[fixed contract plus short facts](skill/prompts/fixed-context.md) define the current policy.
C screens, assigns, registers facts and refills; it has no approval or engineering-acceptance role.
W owns the complete six-step unit: understand, repair, target-required tests, direct submission,
submitted/link record, and feasible authorized task-owned cleanup before capacity return.
W completes required terms/CLA/DCO using true established identity and rights facts. No routine CI
lookup/wait or second review follows submission. Private reporting/disposal retains its exact user scope.
OpenRig examples and standalone prompts use this contract; choose one execution owner per task.
The package is 0.5.1; its native Pi extension is 0.5.1. The package and extension now share this release version.

## Repository layout

```text
repostew/
├── harnesses/
│   └── pi/          Execution runtime, agents, tests and setup
├── skill/
│   ├── SKILL.md     Canonical workflow entry
│   ├── roles/       Responsibilities
│   ├── prompts/     Task forms
│   ├── references/  Workflow and platform rules
│   ├── integrations/ Host packages
│   └── scripts/     Skill build and validation
└── docs/            Bilingual project website
```

## Start

- **Run agents:** follow [Harness setup](harnesses/pi/README.md), then [governance](harnesses/pi/GOVERNANCE.md). The service starts paused.
- **Use the workflows:** read the [Skill overview](skill/README.md), then load [skill/SKILL.md](skill/SKILL.md).
- **Connect computers:** read [Fleet readiness and setup](harnesses/pi/FLEET.md). Windows native process tests have run; Linux/macOS containment and real multi-host acceptance remain incomplete.

Runtime databases, credentials and task workspaces stay local. Installing either
component creates no assignments.

## Existing users

The Skill source moved from the repository root to `skill/`. Update source paths
and set the Harness's `policyDir` to `../../skill` when using its example configuration.
Run Skill build/check commands from `skill/`; generated package layout stays unchanged.
The root [SKILL.md](SKILL.md) remains a navigation entry.

[MIT](LICENSE)

Pi integration now has independent `pi-repostew.js` (application) and `pi-openrig.js` (neutral bridge) modules. Shared `pi-runtime.js` contains mechanisms only. The default loads the application; the bridge is explicit and works independently. Profiles are `repostew.json` and `openrig-pi.json`; `pi-native.js` is the legacy combined entrypoint.
