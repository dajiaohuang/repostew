# Incremental feedback work form

Input: captured objects/window/boundaries, identity, prior handling, authority/resources.
Coordinator captures/deduplicates, assigns one nonempty repository batch; Worker handles affected paths only.
Select [followed issues](../workflows/followed-issues.md), [notifications/mail](../workflows/notifications.md),
[open objects](../workflows/open-objects.md) or explicit feedback/maintenance requests; use applicable
contribution/delivery or authorized [maintain](../workflows/maintain.md) methods.
Capture-only work validates source identity, pagination/window and deduplication, not repairs; engineering
Workers reuse supplied capture and inspect their objects' current head/deltas, not the whole source again.
Metadata-only changes need no clone/tests. Repair checks follow affected contracts; question of value or
compatibility triggers focused evidence review, not routine full contribution reassessment per notification.
Already-resolved feedback reuses matching evidence without new edits. Empty batches need no Worker.
Finish feasible batch handling, retain unresolved links/blockers/retry.
Coordinator advances only fully captured/handled-or-retained source positions; preserve membership/source independence.
