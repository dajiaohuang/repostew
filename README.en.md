# RepoStew

**An agent execution harness for repository work that continues beyond a single chat.**

[中文](README.zh.md) · [Project page](https://dajiaohuang.github.io/repostew/) · [Quick start](harnesses/pi/README.md) · [Governance](harnesses/pi/GOVERNANCE.md)

RepoStew runs Coordinators and Workers in native **Pi sessions**, with persistent task state, fair dispatch, scoped queue control and recovery. Use your preferred chat client to govern execution through MCP or the CLI. The execution service owns the work independently of that client.

The repository also includes a portable **Skill**: the roles, task forms and repository workflows that guide discovery, audits, repairs, publication and follow-up.

## What the harness does

| Capability | Behavior |
| --- | --- |
| Native C/W execution | Coordinators organize scoped work; Workers complete repository tasks. Independent Workers are supported too. Continuations retain their Pi session and cumulative limits. |
| Coordinator-owned queues | Each C can list, prioritize, pause, resume and withdraw its own eligible pending assignments. Fair dispatch shares capacity across owners. |
| Durable continuation | Child completion, available capacity and retained events wake waiting work. Timed waits carry a deadline; external waits need a relevant update. |
| Govern from your client | MCP and CLI expose status, assignments, targeted controls and operation receipts. Event subscriptions connect execution results back to configured clients. |
| Recovery with evidence | A separate guardian allows one paused restart. Uncertain effects remain held for reconciliation instead of being silently replayed. |

Completed submissions release Workers. Later personal actions such as CLA signing go through notification handling.

## How it fits together

```text
Your governance client
        │ MCP / CLI · commands, receipts, events
        ▼
Local execution service
        ├── Coordinator → its queue → Workers
        ├── Coordinator → its queue → Workers
        └── Independent Worker
                     │
              Native Pi sessions
                     │
         Repository workspaces + forge delivery
```

One local service owns execution state and capacity. Project reservations prevent concurrent writers. Workspace Markdown records repository facts; the runtime database records execution. Credentials and working material stay on the execution machine.

## Get started

Requires **Node 24, Python 3, RTK and Pi 1.3.0**, with an existing provider login.

```sh
rtk git clone https://github.com/dajiaohuang/repostew.git
cd repostew/harnesses/pi
rtk npm ci --ignore-scripts
rtk node src/cli.mjs init
```

Edit `config.local.json` with your installed Pi CLI path, workspace and configured providers/models. Then:

```sh
rtk node src/cli.mjs start
rtk node src/cli.mjs governance
```

The service starts **paused**. Follow the [governance guide](harnesses/pi/GOVERNANCE.md) to connect your client, assign scoped work and resume it. Installation creates no assignments.

## Multiple computers

The [fleet foundation](harnesses/pi/FLEET.md) adds explicit machine enrollment, SSH transport, project placement and durable operation receipts. Each computer keeps its own service, credentials and files.

| Platform / layer | Current status |
| --- | --- |
| Windows execution | Native Job Object process ownership; native process and recovery tests exercised. |
| Linux / macOS | Transport and process-group support implemented. Full descendant containment remains unverified; unattended C/W replacement is not ready. |
| Fleet | Registration, gateway and receipt fixtures tested. Real multi-host execution has not been accepted; automatic migration and failover are not implemented. |

Publication checks: **76 tests passed, 1 POSIX-native test skipped** on Windows. See [implementation provenance](harnesses/pi/PI-IMPLEMENTATION.md).

## Use the Skill on its own

The [Skill entry](SKILL.md) works independently of the execution service. It covers repository discovery, actual-use investigation, repair and direct PR/MR delivery, feedback, authorized maintenance and resource disposition.

Use the [integration packages](integrations/README.md) in a compatible harness, or read the Skill from your checkout. Keep task state in your selected workspace.

## Documentation

| Start here | For |
| --- | --- |
| [Runtime setup](harnesses/pi/README.md) | Installation and local verification |
| [Governance](harnesses/pi/GOVERNANCE.md) | MCP/CLI, assignments, queue control and recovery |
| [Event subscriptions](harnesses/pi/EVENT-SUBSCRIPTIONS.md) | Result delivery and client wake-up |
| [Fleet](harnesses/pi/FLEET.md) | Enrollment, SSH, placement and receipts |
| [Skill and workflow index](SKILL.md) | Roles, repository work and authority |

[MIT](LICENSE)
