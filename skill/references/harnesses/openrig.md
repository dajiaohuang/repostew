# OpenRig

Use the selected instance's native seats, queue, delivery receipts and lifecycle.
An agent role plus an explicit assignment is enough for queue-supported ongoing
orchestration. Use Workflow only when the task actually needs declared step
dependencies and exits; do not migrate live queue work merely to obtain a wake.

## Coordinator event turn

On assignment, result, dependency resolution or a native recovery wake:

1. Resolve native identity and the current campaign row. Read all pending results
   for this owner before treating their originating Workers as free.
2. Claim each result and register the Worker's reported facts. C has no approval or
   engineering-acceptance authority. Return feasible remaining
   work to the same Worker with the exact delta and original task lineage.
3. Reconcile pending, claimed, starting and unresolved assignments with the live
   roster. They all occupy capacity. A result alone does not prove process stop.
4. While authorized independent work and free compatible Workers exist, screen and
   dispatch complete units. Continue the next bounded source page when the current
   page is exhausted. A page boundary, one result or one rejected candidate is not
   a reason to end the turn.
5. Append a substantive checkpoint to the owned campaign row: source cursor,
   disposition, active assignment IDs, remaining capacity and exact next action.
   Then continue feasible work, wait on actual native dependencies, or close the
   finite campaign truthfully. Do not invent an approval or external blocker.

The checkpoint supports native recovery; it does not replace project state.md or
create another task database. Count all pages when deriving full source coverage.
Never emit fake progress solely to obtain another watchdog wake.

All Coordinators may share the native execution view's
`q6_parallelism.idle_seats_with_capacity` as an advisory refill signal.
It is daemon-wide and can include Coordinators or seats outside an assignment.
Resolve actual authorized destinations using the native roster and queue,
including pending assignments and unprocessed results. The count is not a
reservation: multiple Coordinators must retain disjoint agreed Worker scopes
or use an actual native atomic admission mechanism before sharing destinations.
Do not add independent counters, polling loops or another task database.
Pi's optional `repostew_openrig_slots` tool reads this same native count and
projects an explicitly configured authorized Worker set without mutating it.

## Native queue operations

Use current CLI help. The checked OpenRig surface supports:

- `rig queue create --id <stable-unit-id> --destination <seat> --body-file <file>`:
  durable assignment and default destination nudge. Confirm known writers and
  identity before admission; a stable ID deduplicates that create, not every
  competing assignment to a repository.
- `rig queue claim <id>`: accept native ownership.
- `rig queue handoff-and-complete <id> --to <coordinator> --body-file <result>`:
  atomic close plus result obligation and default wake. Closure means the source
  step handed over, not that the whole campaign was accepted or completed.
- `rig queue block <id> --on <live-child-id> --continuation <text>`: a real
  dependency wait. Use only when no independently feasible campaign work remains.
  Other child results still create their own C inbox obligations and wake C.
  Reconcile the existing blocked parent when a result arrives; do not create a
  replacement campaign or wait for every child before refilling free capacity.
- `rig queue show`, `transitions`, `parked` and the live roster: inspect exact
  ownership, receipts and recovery. Sent, claimed, processed and delivered are
  different claims.

The terminal handoff path stores its wake intent with the native transition.
Reuse native recovery after an uncertain send; never add an unconditional second
`rig send` or recreate the job. Use structured tool arguments or body files for
multiline text; shell interpolation of Markdown can execute code.

## Continuity and stopping

The existing daemon's parked-owner check and wake ladder are bounded recovery,
not the normal refill loop. They do not choose engineering work or prove progress.
Do not add per-C timers, a second queue, an agent_end self-prompt loop or an
independent task database.

Normal native turn completion differs from explicit user Stop. Honor Stop,
pause, drain, exhausted limits and target restrictions. Preserve incomplete
work and its exact continuation. When the user takes over old work, cancel the
automation obligation with that reason after reconciling issued commands;
never label the repository outcome delivered or abandoned.

## Worker unit

Use the [six-step W contract](../../roles/worker.md) and the existing native task.
Submitted code returns only “已投稿” and its URL; do not demand head, tests or CI
fields. No-finding, duplicate, already-fixed or inability to continue returns a short
reason. Finish feasible authorized task-owned cleanup before returning capacity.
Capture, local-only and content/database tasks keep their explicit deliverables.
Unknown sends/writes are reconciled against the exact native row and target before
retry; a request-ID preamble alone does not establish persisted queue creation.

Pi can run the existing RepoStew native extension for tools and role guidance.
OpenRig owns dispatch and wake; the extension does not own a competing loop.
Local processes and command timeouts must follow the installed tool's units.
Use [fixed contracts and current facts](openrig-context.md) when constructing or updating seats.
Raw availability is not assignment eligibility: apply current user holds, exclusions,
authorized roster and actual capabilities before dispatch. Continuing domains capture
only authorized necessary increments; finite source exhaustion grants no expanded source.

For terminal recovery, address the exact owning session and pane; pane identifiers may be
session-local. Never use a shared terminal-server shutdown to repair one seat. Establish isolation
from actual process/server ownership, not directory names or environment labels. A failed or
permission-denied process query does not establish that the task process stopped; use the original
execution handle or an effective task-scoped process lineage. Preserve unknowns without imposing a
whole-machine process census on ordinary synchronous commands with no background-process evidence.
