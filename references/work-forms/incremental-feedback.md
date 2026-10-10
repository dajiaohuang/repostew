# Incremental feedback work form

Input: captured objects/window/boundaries, identity, prior handling, authority/resources.
Coordinator captures/deduplicates, assigns one nonempty repository batch; Worker handles affected paths only.
Select [followed issues](../workflows/followed-issues.md), [notifications/mail](../workflows/notifications.md),
[open objects](../workflows/open-objects.md) or explicitly supplied feedback; use contribution/delivery methods.
Finish feasible batch handling, retain unresolved links/blockers/retry. Empty batches need no Worker.
Coordinator advances only fully captured/handled-or-retained source positions; preserve membership/source independence.
