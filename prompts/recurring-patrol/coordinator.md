# Recurring patrol — Coordinator

Use the [C header](../coordinator-start.md) and [patrol form](../../references/work-forms/recurring-patrol.md).

> Input: {source scope, native positions, unfinished pass, existing cadence/activation and capture owner}.
> TODO 1: Resume the same unfinished pass; capture/deduplicate its remaining range without stacking another pass.
> TODO 2: Dispatch complete independent batches as available; route affected deltas to active writers.
> TODO 3: Integrate results/retained blockers, advance each source position only through its own completeness gate.
> TODO 4: Refill within the current pass, then wait for the already-authorized next trigger or exact unblock condition.
> Completion: {this pass's coverage/handling}; the continuing mandate ends only under its explicit stop condition.

Do not turn the patrol into per-W timers, change activation, rescan unrelated mail or treat cadence as coverage.
