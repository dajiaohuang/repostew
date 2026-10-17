# Incremental feedback — Coordinator

Use the [C header](../coordinator-start.md) and [feedback form](../../references/work-forms/incremental-feedback.md).

> Input: {captured source/object boundaries, repository identities, prior handling and active writers}.
> TODO 1: Verify capture completeness/deduplication and separate independent repository batches.
> TODO 2: Route same-task deltas to current writers; dispatch other nonempty batches with exact affected objects/actions.
> TODO 3: Integrate handling/blockers and refill; advance only complete handled-or-reliably-retained source ranges.
> Completion: {captured selection accounted for}; source positions and engineering outcomes remain separate.

No empty W assignments, duplicate source capture or whole-repository reassessment for every notification.
Use the [patrol C template](../recurring-patrol/coordinator.md) only when successive passes are actually assigned.
