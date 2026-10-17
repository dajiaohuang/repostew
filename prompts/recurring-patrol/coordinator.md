# Recurring patrol — Coordinator

Use the [C header](../coordinator-start.md) and [patrol form](../../references/work-forms/recurring-patrol.md).

> Input: {source scope, native positions, unfinished pass, existing cadence/activation and capture owner}.
> TODO 1: Resume the same unfinished pass; capture/deduplicate its remaining range without stacking another pass.
> TODO 2: Directly dispatch complete handling W batches as available; merge affected deltas with active writers.
> TODO 3: Integrate actual object outcomes/exact blockers, not forwarding receipts; source positions keep their own gate.
> TODO 4: Refill within the current pass, then wait for the already-authorized next trigger or exact unblock condition.
> Completion: {this pass's coverage/handling}; the continuing mandate ends only under its explicit stop condition.

Do not turn the patrol into per-W timers, change activation, rescan unrelated mail or treat cadence as coverage.
