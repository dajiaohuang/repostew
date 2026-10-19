# Orchestration

Roles own decisions; the [harness](harness.md) owns execution and lifecycle. Project state is authoritative;
session context, task handles and structured replies are evidence/transport, not another coordination record.
Use only the roles needed: serial work may combine responsibilities without creating extra agents.

## Coordinator execution

Use the [four-duty C contract and delivery decision](../roles/coordinator.md): select, assign, check actual
submission, continue. [Assemble](worker-assembly.md) one complete unit and dispatch once; reserve accepted,
starting and queued work before refill. Serial by default; authorized independent units use available capacity.
Route deltas to the current writer. Adopt usable results without redoing engineering; unfinished delivery
requires continuation or a concrete recovery owner, not archival as complete. [Resource handoffs](storage.md)
require writer/process stop. A finite unit never shrinks the whole selection.

### Decide the next action on every wake

Resume the whole mandate on active assignment, result, continuation or compaction turns.
An authorized heartbeat follows the bounded C-routing contract below, not unrestricted action branches:
- **Act:** feasible authorized work remains—continue it or dispatch/route a concrete complete unit now.
- **Wait:** relevant work is actually in flight or capacity is occupied—yield to its supported result path.
- **Block:** retain affected scope, evidence/unknowns, responsible owner and next condition for reevaluation.
- **Finish:** establish completion of the whole selected scope, not only the latest turn or batch.

Integrate first, then choose. Summaries, record corrections and promises are not action; zero children is
not a wait condition. Unknown eligibility requires bounded selection, not invented completion/blockage.
No fresh user prompt or next heartbeat is needed for already authorized feasible work.

### Supervisor intervention and authorized heartbeat

Use [event-driven refill and heartbeat fallback](refill.md). C closes the loop in the same result turn;
a local failure is not a whole-domain stop. The single authorized S heartbeat catches missed refill using
existing summaries, necessary lifecycle/queued-message facts and volume capacity. It may send one specific,
deduplicated continuation to the current C for a refill or already-authorized disposition gap, never directly W.
No new source/forge reads, engineering, restart/cancel, files/state writes, tests, Git, cleanup or schedule
changes; no self-queued bypass. Unchanged sufficient blockers or an equivalent in-flight message mean no send.
An ineffective prior correction requires bounded diagnosis/report, not repeated prompts or inferred restart rights.
Active failure/completion events retain normal recovery; no phase extension, user/platform-limit waiver or new authority.

### Dependencies, capacity and completion

- Prioritize unfinished work. A dependency blocks only dependent actions; required reassessment gates retain
  their named repository/group/pass scope. Independent units within the permitted stage may proceed.
- Complete repository input may proceed during independent capture. Failed/missing capture blocks its
  dependent input/position, not all engineering; partial capture never establishes a complete source range.
- Apply user, aggregate and actual backend limits. Limits are not quotas; explain material unused capacity
  by concrete constraints, not utilization receipts. Do not manufacture work, stack calls past limits or
  infer capacity from model/provider names. If results arrive only by batch, refill at that supported boundary.
- Distinguish an ended model/tool activity, settled execution, completed assignment and complete mandate.
  A yielded owner may retain live descendants; parent status/empty queues never prove their termination.
  Final/structured reports do not independently verify their claims. Do not retest usable engineering finals.
- Separate coverage, engineering/public outcomes, resource release and source-position advancement.
  Waiting for one repository's review/CI/merge does not block unrelated eligible work.
- Obey evidenced source/account/endpoint limits and Retry-After; never evade them. A passed retry boundary
  permits one authorized reevaluation, not assumed recovery, blind retries, a new timer or resumed paused job.

### Task boundaries and context reuse

Continue feasible steps inside the existing unit; do not redispatch simply because a tool or turn ended.
An optional completion reminder cannot grant authority, certify success or restart an exhausted budget.
A completed finite unit releases default Worker/model binding. Select later execution by authorized
capability, capacity and relevant context, not cache targets; task, context and model are separate choices.
Reuse evidence with scope/base/head/limits, not whole transcripts. Suitable same-task deltas or bounded
corrections may reuse original context; otherwise hand off after affected writers stop. Never reset failure
budgets or authority on executor changes. Clarification does not restore writes; independent reviews remain independent.

### Drain, pause, cancel and replacement

Drain forbids new units/refill and post-completion follow-ups; accepted units finish their already authorized
steps within existing budgets unless a stricter stop scope applies. Pause forbids new work until authorized
resumption; specify whether accepted work drains or is cancelled. Cancel requests termination, not proof of it. Before replacement confirm affected writers, queued writes and owned mutating processes
stopped; preserve work and reconcile uncertain mutations. A tool timeout/returned call is not process-stop
proof. Stop only identified task-owned processes within authority, never shared services.
Coordinator replacement includes descendants and prevents old refill. Supervisor-only handoff stops its
runs/timers/queued writes and retires its governance authority, retaining unchanged domain owners unless
replacement is separately authorized. Native references do not transfer ownership. Cleared independent
scopes may restart without an inferred global drain; preserve paused schedules and exact authority.

### Minimal communication during execution

Use [Worker communication](../roles/worker.md#result-and-continuation). After eligible action,
wait through supported events/waits, not progress/log polling or duplicate result relays. Wait timeout alone
is not failure or replacement authority. Send one combined applicable delta to the affected current owner;
do not wake completed Workers indiscriminately. Recover a material omitted outcome once from suitable
original context or exact evidence; otherwise retain unknowns. No optional-field demands or second acceptance.
Human-facing updates are separate. Use [templates](../prompts/README.md), not copied global briefs.

### Lightweight intake and state updates

Read affected current sections before focused edits; reread after relevant writer/selection changes.
Batch finite identity/membership/exclusion checks, reuse valid results and retain individual failures.
Capture owners establish source completeness; Workers do not recapture complete windows. Advance only
fully captured, handled/reliably retained ranges. Navigation/review does not establish audit completion;
reclassification preserves prior coverage/private evidence/history without claiming unperformed work.
Project writers own root state.md and local work/work.md. Coordinators own navigation/positions and only
resource facts after a stopped-writer handoff, not a second project mirror. Designated editors/append windows
serialize globals and workspace policy/shared-state Git. Repository Workers publish their own units;
serialize only same-project/checkout/shared-index writes, not independent repositories. No hidden queues.

### Detect errors through existing signals, not routine audits

Intervene on failures, contradictions, writer collisions, concrete suspected stalls or authority/privacy
violations. At natural completion/refill points use available lifecycle timestamps to flag unusually old
work; inspect only the flagged operation once. Distinguish running tools, model/backend waits, external
gates and missing inputs. Time alone proves no failure; a sent delta cannot interrupt a running tool.
Correct through its owner, preserve unrelated success and use native events thereafter. Ordinary tool,
path, encoding or invocation failures are recoverable, not permanent prohibitions. Follow [bounded recovery](execution-recovery.md):
keep cumulative attempts, diagnose before retry, reconcile uncertain mutations first; after three failed repairs
of one fault stop and notify the user. No custom watcher, blind retries or permission laundering.
Independent reassessment is selected engineering work, not routine acceptance.
