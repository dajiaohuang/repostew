# RepoStew Pi harness

[中文](README.zh.md) · [Repository overview](../../README.md) · [Companion Skill](../../skill/README.md)

An optional execution service built around Pi's native sessions, RPC, tools and
structured results. The [RepoStew Skill](../../skill/SKILL.md) remains independent.
Installing either component starts no work.

## Start

Requires Node 24, Python 3, RTK and Pi 1.3.0 with existing provider credentials.
Run from this directory:

```text
rtk npm ci --ignore-scripts
rtk node src/cli.mjs init
```

Edit `config.local.json`: set `piCli` to the installed Pi CLI, `workspace` to
your task workspace, and choose your configured providers/models. `policyDir`
points to `../../skill`, this repository's separate workflow component. Credentials stay in Pi's auth store.
`REPOSTEW_PI_CLI` can also specify the installed CLI for development/tests.

```text
rtk node src/cli.mjs start
rtk node src/cli.mjs governance
```

The service starts paused. Assign scoped C or independent W through the
[CLI/MCP entry](GOVERNANCE.md), then explicitly resume authorized work.

## Included

- Native Pi C/W sessions, fair capacity, durable waits and original-session continuation.
- `harness_queue`: C manages only its own queue.
- Completed submissions release W; personal CLA follow-up is reported by notification handling.
- Independent guardian, one paused recovery attempt, separate lifecycle diagnostics.
- [Governance event subscriptions](EVENT-SUBSCRIPTIONS.md) and [personal-computer fleet foundation](FLEET.md).

Windows uses native Job Object ownership. Linux/macOS include SSH transport and
a process-group owner, but full descendant containment remains unverified:
their stop receipts intentionally cannot authorize unattended replacement.

## Verify

```text
rtk npm run check
rtk npm test
```

Publication validation on Windows: 77 passed, 1 POSIX-native test skipped.
This is not Linux/macOS or real multi-host acceptance. Native Pi multi-C/W
fixtures were also exercised during development; no production task data is
distributed. [Implementation provenance](PI-IMPLEMENTATION.md).

Runtime databases, local configurations, task workspaces and bindings are ignored
and must remain local. Publishing this source does not update a running service.
