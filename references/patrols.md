# Patrol cadence and shared execution

## Three complementary entry points

Configurable workspace baseline, not automatically installed or resumed:

- 1 hour: [notifications + selected mail](workflows/notifications.md), independent positions/deduplicated action.
- 6 hours: [followed new issues](workflows/followed-issues.md), full union capture/nonempty Worker batches.
- 24 hours: [open-object fallback](workflows/open-objects.md), all open/unfinished scope, deepen deltas/unknowns.

## One execution stream, bounded repository parallelism

Use one existing stream when available; complete unfinished passes first. Capture/group through
[orchestration](orchestration.md); [Workers](../roles/worker.md) receive finite [incremental tasks](work-forms/incremental-feedback.md).
Separate source positions; retain unresolved work before advancement. No new audit/mail rescan in fallback.
Requested concurrency only, one repository writer and serialized shared edits; authorized merge or defer conflicts.
Trust unchanged handling; inspect actual CI/head changes. No polling registry, repeated tests/clones or progress loops.
Scheduler owns cadence/activation/APIs; update matching jobs only when authorized, preserve paused/retired jobs.
Wakeups/intervals are not active/completed coverage or deadlines. Quiet unchanged runs; report material progress,
failures, gaps or necessary user action. Scope never authorizes mailbox expansion, email sends or new schedules.
