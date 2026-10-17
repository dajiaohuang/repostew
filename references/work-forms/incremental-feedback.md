# Incremental feedback work form

Input: captured objects/window/boundaries, identity, prior handling, authority/resources.
Coordinator owns handling of the captured batch, not just its archive or forwarding. Supply complete deduplicated
repository inputs and directly assign independent nonempty batches; W handles affected paths and the full resulting
repair/check/reply/submission-update unit, without routine per-object governance approval. Route in-scope deltas to the active writer;
new batches after completion follow [task boundaries](../orchestration.md#task-boundaries-and-context-reuse),
not permanent same-repository Worker binding. A complete batch need not await unrelated capture or engineering.
Select [followed issues](../workflows/followed-issues.md), [notifications/mail](../workflows/notifications.md),
[open objects](../workflows/open-objects.md) or explicit feedback/maintenance requests; use applicable
contribution/delivery or authorized [maintain](../workflows/maintain.md) methods.
Capture-only work validates source identity, pagination/window and deduplication, not repairs; engineering
Workers reuse supplied capture and inspect their objects' current head/deltas, not the whole source again.
Metadata-only changes need no clone/tests. Repair checks follow affected contracts; question of value or
compatibility triggers focused evidence review, not routine full contribution reassessment per notification.
Already-resolved feedback reuses matching evidence without new edits. Empty batches need no Worker.
Finish feasible batch handling. Capture, retention and routing are not handling outcomes; retain each unresolved
object's exact blocker/next owner. Cross-domain routing must integrate the existing owner's actual result, not spawn
a competing writer or claim completion from delivery of a message.
Coordinator advances only fully captured/handled-or-retained source positions; preserve membership/source independence.
