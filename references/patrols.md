# Patrol cadence and shared execution

## Three complementary entry points

Configurable workspace baseline, not automatically installed or resumed:

- 1 hour: [notifications + selected mail](workflows/notifications.md), independent positions/deduplicated action.
- 6 hours: [followed new issues](workflows/followed-issues.md), full union capture/nonempty Worker batches.
- 24 hours: [open-object fallback](workflows/open-objects.md), all open/unfinished scope, deepen deltas/unknowns.

## One execution stream, bounded repository parallelism

Use one existing stream when available; resume unfinished capture/handling before a new pass of the
same source/scope. Do not stack overlapping captures; outstanding engineering alone does not block a
separately authorized next source window once earlier input is captured and reliably routed/retained.
Complete independent repository inputs may dispatch
while other capture continues; position advancement retains its own full-coverage gate.
Capture/group through [orchestration](orchestration.md); [Workers](../roles/worker.md) receive finite
[incremental tasks](work-forms/incremental-feedback.md). The capture Coordinator directly owns dispatch and handling
outcomes; saving/routing a window is not completion. A batch is not the whole Coordinator selection.
Separate source positions; retain unresolved work before advancement. One source's failure/external wait
blocks its dependent work, not independent sources or captured engineering. No new audit/mail rescan in fallback.
Requested concurrency only, one writer per project's shared state.md/local work/; serialize global positions
and Git publication, not independent project facts. Merge through authorized communication or defer conflicts.
Reuse complete usable capture/unchanged handling; inspect actual CI/head changes. Recover missing local
capture first, then fill unrecoverable/failed capture gaps within the original authorized scope, without
repeating complete windows or inventing through. A new window requires existing source/pass authority;
it does not imply permission to activate a paused schedule. No polling registry, repeated tests/clones or progress loops.
Scheduler owns cadence/activation/APIs; update matching jobs only when authorized, preserve paused/retired jobs.
Use orchestration's [Supervisor heartbeat](orchestration.md#supervisor-intervention-and-authorized-heartbeat)
when explicitly enabled: one Supervisor timer, actual in-scope continuation, no per-domain timers.
Scheduler pause and assignment authority are distinct; neither infer revocation nor bypass an explicit work pause.
Wakeups/intervals are not active/completed coverage or deadlines. Quiet unchanged runs only after deciding no eligible action; report material progress,
failures, gaps or necessary user action. Scope never authorizes mailbox expansion, email sends or new schedules.
