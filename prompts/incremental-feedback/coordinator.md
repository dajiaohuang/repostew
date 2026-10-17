# Incremental feedback — Coordinator

Use the [C header](../coordinator-start.md) and [feedback form](../../references/work-forms/incremental-feedback.md).

> Input: {captured source/object boundaries, repository identities, prior handling and active writers}.
> TODO 1: Verify capture completeness/deduplication and separate independent repository batches.
> TODO 2: Directly dispatch complete feedback W units for independent batches: inspect, repair/check, reply/update submissions.
> TODO 3: Merge overlapping work with its current owner/writer; obtain handling outcomes, not merely a routing receipt.
> TODO 4: Integrate object dispositions and exact external blockers, refill and advance eligible source positions.
> Completion: every captured object has a handling outcome or exact blocker; capture/retention/forwarding alone is not completion.

Historical domain ownership is not a permanent routing gate: agree this batch's writing owner once, then dispatch.
Do not relay each routine object through governance for approval. Escalate real authority/resource/ownership gaps only.
Keep source positions separate from resolution; retain unresolved objects without calling them handled.
No empty W assignments, duplicate source capture or whole-repository reassessment for every notification.
Use the [patrol C template](../recurring-patrol/coordinator.md) only when successive passes are actually assigned.
