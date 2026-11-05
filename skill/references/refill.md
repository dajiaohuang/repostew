# Event-driven refill and bounded heartbeat fallback

## Coordinator: close the loop in the same turn

On each assignment/result/failure event, adopt usable delivery evidence, then choose the next action before
ending the turn: continue the owning W's feasible remainder; assign an independent complete unit within
capacity; wait for named in-flight work; or retain an exact blocker/owner/next condition. Apply the
[C result registration](../roles/coordinator.md); no second engineering acceptance or invented PR.
One project's failure, overrun or external wait blocks that project, not the domain. A finished batch,
zero children or a list of residual scope is not a reason to stop selecting from authorized remaining work.
If eligibility is unknown, perform bounded selection from existing inputs, not another whole-domain audit.
Respect stage boundaries, actual writers, paused scopes, spent budgets and deadlines. No fresh sources,
empty Workers, retrospective extensions or quota-driven occupancy. A genuine exhausted phase needs an
explicit prospective decision from the authorized owner, not silent continuation or permanent abandonment.
Report the actual action/handle, named wait, or scoped blocker; do not send a routine acknowledgement.

## Progress checks

Start with current authority, including explicit pause/resume changes, and observations with their source/time.
Control-plane failure makes cached state stale or unknown; it does not prove all execution stopped.
Session liveness, tool activity, task progress, delivery, coverage and resource release are separate facts.
Completed records may include skips, partial work and receiving receipts; source cursors do not prove coverage.

Use five checks on existing evidence; report normal, a concrete gap, or insufficient evidence:

1. **Receive results:** has an available result gone unrecorded, excluding one currently being consumed?
2. **Refill:** are authorized independent units and eligible available Workers left without dispatch or a named wait?
3. **Localize dependencies:** has a constraint on one action become an unsupported whole-domain stop?
4. **Preserve scope:** has the assigned complete unit been reduced to shallow screening or a different outcome?
5. **Finish delivery:** is an existing candidate neither advancing with its owner nor held by an evidenced dependency?

Name the task, current owner, observed action and missing next step. Time or a recovery warning only selects
an object to check; running tools, backend waits and recent successful work are not failures by silence alone.
For insufficient evidence, make one targeted check and retain remaining unknowns. A concrete correction needs
verification of the expected action, not just a sent/read message; an unchanged failed correction does not
gain another generic reminder each turn. Diagnose through existing recovery within its actual authority.

Keep retained ownership distinct from execution occupancy and dispatch eligibility. External waiting can
release capacity only when no affected tool/write remains in flight and the next unit is independent;
Stop/hold still makes an idle Worker ineligible. Queued/starting work reserves capacity before pickup.
After recording a result, close its separate receiving obligation without closing unfinished engineering.
Use existing task/result links to reconcile obsolete reminders; do not create another ledger or close
system-owned reminders manually when their host requires automatic reconciliation.

## Supervisor: one authorized heartbeat, no domain timers

Events are the primary path. The heartbeat only catches missed refill or authorized disposition handoffs.
Read bounded existing domain summaries, necessary native lifecycle/queued-message facts and volume capacity;
no source/forge refresh, recursive records/log crawl or engineering inspection. For each domain decide:

- **No gap:** full completion established, real in-flight refill, occupied capacity, unchanged sufficient
  blockers, pause or expired authority: do not wake it. Report a necessary user/authority decision once.
- **Refill gap:** authorized remaining scope, available execution capacity and idle capacity without a
  sufficient domain-wide blocker: send one specific continuation to the current C. Name the retained input,
  local exclusions and complete-unit selection/refill expected; C dispatches W, not the heartbeat.
- **Disposition gap:** an existing stopped-writer handoff has eligible unprocessed release work: include
  that exact boundary in the same C message under unchanged storage authority; do not delete anything here.
- **Already routed:** an equivalent continuation is queued/in flight or its action is already underway:
  suppress another send. Use existing native message/run evidence, never a new queue/receipt ledger.
- **Ineffective prior correction:** use its outcome and one bounded lifecycle check to identify the exact
  fault/remaining decision. Do not repeat a generic 'continue', stack messages, or restart on silence alone.
  Report the unresolved intervention to the user; genuine C failure/completion events use normal recovery.

At most one combined continuation per affected C per tick. Do not message healthy active owners merely
for status. A send is not W dispatch or delivery: report which occurred, or what remains unproved.
No direct W delegation, restart/cancel, repair, tests/install, Git, file/state/position/policy writes, cleanup,
schedule changes or self-queued follow-up during a heartbeat. Its only mutation is the bounded C message.
It grants no new scope, user/platform-limit waiver, resource/abandonment authority or paused-job activation.
If a due boundary is observed in existing evidence, reevaluate only that condition within standing authority;
expiry never renews itself. No need to wait for the next tick when an active result event already permits work.
