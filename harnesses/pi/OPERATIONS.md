# Operational blockers and recovery

Operational records exposed several failure classes beyond a full disk. These
are observed categories and the corresponding implementation decisions; they are
not claims that old tasks have been reclassified or that every environment is ready.

| Observed blocker | Harness behavior / repair | Remaining requirement |
| --- | --- | --- |
| Missing final report, transport disconnect, unsettled restart | Bounded report reminder, original-session continuation, stopped-tree receipt reconciliation, independent guardian with one paused recovery | Unknown process/effect state must be reconciled; never replay a possible submission |
| Capacity waits treated as failure or idle completion | Durable child/capacity/time waits, one deferred assignment per owner, fair promotion, C-owned queue controls | A stopped or paused owner remains stopped or paused |
| A completed periodic pass never ran again | Continuous completion records the pass and enters a timed wait; finite completion stays final | Only an explicitly continuous campaign may recur |
| Source/record work misread as no progress | Retained source progress and changed evidence count; unchanged retries remain bounded | Capture does not prove handling |
| Upstream push permission mistaken for all-action denial | Preserve operation-specific metadata; permit native fork/PR/comment checks within authority | Actual endpoint denial still blocks that operation |
| One access failure stopped unrelated repositories | Separate project, host and source gates; failed inspections can be retried after repair | Authentication/rate gates stay host-wide |
| A post-submission CLA request retained a completed Worker | Separate `userAction` from execution completion; notification acceptance emits a deduplicated reminder | Never sign, certify or invent personal consent |
| Missing private reporting route or authenticated browser | Preserve the exact capability blocker and protected evidence | No automatic public substitute or credential bypass |
| Missing compiler, database, browser binary or required target OS | W owns bounded task-isolated setup and native validation within its assignment | Installation receipts do not prove usable binaries; fixtures do not replace required native tests |
| Explicit target refusal, privacy/security restriction, license/identity decision | Keep the real task boundary and continue independent eligible work | These are not infrastructure errors to retry around |

## Recovery sequence

1. Inspect the exact owner/run or original operation receipt. A dashboard summary
   is not proof that a process stopped or a remote write failed.
2. Distinguish an execution fault, missing capability, temporary capacity,
   operation-specific denial and genuine user/target restriction.
3. Repair only the affected capability or scope. A stopped writer's unknown
   effects need explicit reconciliation before continuation.
4. Continue the original task/session with previous consumption preserved.
   Independent eligible tasks may proceed; no new pass, writer or provider
   identity is created to evade a restriction.

No automatic dependency installer or blanket permission probe runs at startup.
Dependencies vary by target, and some tasks prohibit external calls. The assigned
W establishes the necessary capability when it reaches that stage. Missing
private-channel or native-platform capability remains visible, not silently
replaced by a mock or public endpoint.

## Verification boundary

The Windows source validation includes real Pi extension loading, MCP/HTTP/stdio
integration, native Job Object descendant ownership, paused service crash recovery
and isolated workflow/source/forge regression fixtures. New source adapters are
tested with deterministic native-shaped responses; this does not claim live
GitHub/GitLab account-window coverage or authenticated Outlook/private reporting.
No public contribution, signature, production task or destructive disposition is
performed by these tests.

Earlier native C/W acceptance establishes the tested runtime behavior at that
version; it does not prove every newly added workflow against a live model and
target. Linux/macOS full descendant containment and real multi-host acceptance
remain incomplete. Source publication does not hot-reload a running deployment.
