# Start from any harness

For all Skill workflow selectors, registered sources and native repository reads,
see [Workflow execution](WORKFLOWS.md). `repostew_workflows` lists the catalog and
reads complete canonical methods without starting an agent. Operational failure
classes and recovery limits are documented in [Operations](OPERATIONS.md).

For incoming notifications and native conversation wake-up, see
[Event subscriptions](EVENT-SUBSCRIPTIONS.md). An ordinary MCP connection alone
does not subscribe or wake its host.

Run from any working directory on this Windows host:

```powershell
rtk proxy node /path/to/repostew/harnesses/pi/src/cli.mjs start
rtk proxy node /path/to/repostew/harnesses/pi/src/cli.mjs governance
```

`start` reuses an existing service. It starts an absent service paused under an
independent guardian; it does not create C/W or resume work. An unreachable existing owner
blocks replacement. The entry is independent of the model, chat window and
governance harness. Pi remains the execution backend for C/W.

## Durable waits and service recovery

Post-submission personal actions are separate from Worker execution state.
Completed results may include `userAction: {kind: "cla" | "dco" | "other",
reference, action}` with empty `remaining` and `blocker`. Engineering completes
as `delivered`; a notification assessment with no public update can complete as
`no_delivery`. C acceptance in incremental-feedback, notifications or recurring-patrol
(including their legacy aliases) emits the
deduplicated `user_action_required` metadata event. The user reads the exact
result to decide; it does not retain a Worker slot or project reservation after
acceptance. No signature/consent is executed automatically. Actual barriers
preventing creation of a submission still return `blocked`, without pretending
that the work was delivered.

C has one native Pi `harness_queue` tool for its own pending assignments:
`list` (paged), `priority` (-100..100), `pause`, `resume`, and `withdraw`.
Mutations require a task ID and reason; Pi tool-call IDs provide atomic,
idempotent receipts. Higher priority affects only that C's share of dispatch.
Pausing removes ready-queue pressure without aborting accepted execution.
C may resume only its own queue pause, within an enabled scope.
Operator pauses, unknown-run checks and consumed budgets remain binding.
Withdrawal is allowed only with zero attempts and no run record; it retains
history, releases the project reservation, and returns captured candidates to
selection. It does not count as delivery or a skip.
Unknown tasks can be paused for later reconciliation while unrelated work
continues within available capacity. Pausing does not assert process exit or
release the unknown task's project/capacity reservation.

C remains a native Pi session using the existing tools and structured result.
`harness_result` may include `waitFor: {kind: "children" | "capacity" | "external" | "time", until?: ISO_DATE}`.
Child/capacity waits wake on relevant retained events or available capacity.
An external wait requires an owner/result/reconciliation delta. A time wait needs
a future deadline. Waiting does not consume the no-progress failure allowance.
`continue` schedules another turn in the same C session within its retained scope.

A full ready queue retains one deferred assignment per owner, including its
project reservation and stable ID. Further admissions return `accepted:false`
instead of crashing the C. Check that value; a rejected assignment was not created.
Accepted deferred assignments promote fairly when capacity returns. Pause and
Stop still apply. Project reservations and C judgment remain authoritative.

The guardian is a separate local OS process, not an agent or scheduled job. It
starts the service paused and permits one paused restart after an unexpected
exit. It never resumes C/W, refreshes budgets or replays operations. A second
failure ends recovery and requires owner diagnosis. A live or uncertain guardian
blocks replacement. Direct `serve` remains a foreground diagnostic entry.

Lifecycle diagnostics live under `%USERPROFILE%/.repostew/diagnostics/<runtime-id>/`
(or the explicit `diagnosticsDir`). They contain codes, frames and lifecycle
metadata, not exception messages or provider/task bodies. This default separates
diagnostics from the D: task volume; it does not guarantee space on both volumes.
The guardian cannot recover after its own process or the host exits.

After restart, an already accepted result is settled once only if its owned
process receipt proves `treeStopped:true` and exit code 0. Other interrupted or
uncertain runs remain held for exact effect reconciliation. Message receipt
acknowledgment never closes a task incident.

`scripts/listen.mjs <binding> --stay-connected` keeps reconnecting its existing
read subscription with capped backoff. Pending native delivery remains held
until its exact receipt is reconciled; reconnect never repeats an uncertain send.

## MCP entry

Use the official MCP SDK stdio entry. The same configuration works in a host
that accepts the conventional `mcpServers` format:

```json
{
  "mcpServers": {
    "repostew": {
      "command": "rtk",
      "args": ["proxy", "node", "/path/to/repostew/harnesses/pi/src/governance-mcp.mjs"]
    }
  }
}
```

Codex CLI registration, if desired:

```powershell
rtk codex mcp add repostew -- rtk proxy node /path/to/repostew/harnesses/pi/src/governance-mcp.mjs
```

Claude Code registration in the current project, if desired:

```powershell
rtk claude mcp add --scope project repostew -- rtk proxy node /path/to/repostew/harnesses/pi/src/governance-mcp.mjs
```

These commands are documented, not automatically applied to global or project
client settings. Pi can use its native MCP configuration or invoke the CLI with
its shell tool. No client needs a copied control token: the adapter reads the
existing local credential file privately. The service stays loopback-only;
remote hosts need an explicitly configured local execution transport.

The tools are `repostew_start`, `repostew_status`, `repostew_inspect`,
`repostew_command`, `repostew_receipt`, `repostew_event_ack`, and
`repostew_subscription`. Connecting or disconnecting an ordinary MCP
client never starts, stops or duplicates C/W. Two clients share one execution
database and one service lock.

## Assign and control

Use a stable operation ID with the typed command schema. For CLI, save the same
object to a JSON file and run `rtk node src/cli.mjs command operation.json`.
For MCP, pass the object directly to `repostew_command`.

```json
{
  "requestId": "feedback-c-add-001",
  "command": {
    "action": "coordinator-add",
    "spec": {
      "id": "feedback",
      "maxWorkers": 2,
      "campaign": {
        "id": "captured-feedback-001",
        "workflow": "captured-feedback",
        "mandate": "Replace this with the exact authorized captured objects, retained evidence, exclusions, limits and completion conditions.",
        "allowedProjects": [{"host":"github.com","namespace":"OWNER","repo":"REPO"}],
        "allowedHosts": [],
        "workerMode": "engineering",
        "continuous": false,
        "revisitMs": 60000
      }
    }
  }
}
```

This example is a template, not authority to access OWNER/REPO. New C domains
start paused. Enable one explicitly with `resume`, target
`{"kind":"coordinator","id":"feedback"}`. Global mode must also be running.
Global resume never clears a domain pause or an interrupted/unknown task gate.

An independent W uses `action: "dispatch-independent"` and `task` with `id`,
`project`, explicit `workerMode`, and the five-field `brief`: `objectOutcome`,
`locationPrior`, `completeTodo`, `authorityResources`, `finishReturn`. It has no
C parent. Its results and recovery requests go to governance. It shares global
Worker limits, provider pools, same-project ownership and Stop semantics.

Controls target `all`, a named `coordinator`, or a named `worker`. A C target
includes its children. Pause/drain stop new dispatch; Stop clears native Pi
queues, aborts and waits for stopped owned trees. Targeted controls leave other
domains and independent W running. Stop never deletes checkouts or task history.

`wake` queues a delta for a C's next turn. `message` steers a currently running
C/W through native Pi RPC, with its own stable `messageId`; it never restarts an
idle owner. Read the current owner/run with `repostew_inspect` before recovery.

## Reconcile uncertainty

Each governance operation persists its receipt before mutation. If a client
disconnects, query `repostew_receipt` with the original `requestId`. Reusing the
same ID returns its recorded outcome and never executes the command again.
`started` or `failed-or-unknown` requires inspection; neither permits a blind
retry with a new ID. A changed command under the same ID is rejected.

`reconcile` requires the exact `runId`, stopped-tree evidence and a causal
explanation of partial/external effects. Unknown tree stop keeps ownership.
Continue uses the original task, provider, session and cumulative counters.
After three failures or exhausted continuation allowance, a new prospective
`recovery` grant must include `additionalAttempts` (1..3), a future `deadline`
and explicit `authority`. It never erases previous attempts or real prohibitions.

Closing an incident with `incident-resolve` acknowledges its disposition only;
it does not resume a task, clear provider gates or release an unknown writer.
Provider authentication failures remain isolated behind their circuit until
`clear-provider` supplies recovery evidence. Forge access/rate gates retain
their own explicit reconciliation.

## Heartbeat and events

Native Pi `agent_settled`/fault/exit events drive integration and refill. One
service-level heartbeat examines retained scope and lifecycle facts and routes
at most one deduplicated gap to each eligible idle C. It performs no discovery,
engineering, cleanup, cancellation, independent-W assignment or authority renewal.
No model call is made merely to check status. Paused/stopped domains and recovery
gates remain untouched. Independent W exceptions surface directly in governance.

Governance incidents identify the exact owner, run, category, recovery owner and
next condition; they do not copy private report bodies. The existing `/events`
stream exposes completion and `governance_attention` events. The `watch.mjs`
observer is optional and its lifetime is independent of execution.

## Boundaries

One service owns one SQLite file for this workspace. Each C has a campaign,
candidate set, event delivery scope and native Pi session. All C and independent
W share project exclusivity and global capacity. A completed project can receive
a new task after its previous stopped result is accepted; the old task cannot
resume while another owner holds it.

This release provides generic task forms and management, not new source grants,
mail capture, GitLab admission, maintainer merge authority or cleanup permission.
The existing admission adapter remains GitHub-only. Source-specific adapters and
task input must be supplied within their actual authority. Process ownership and
tool capability checks are not an OS filesystem/network sandbox.
