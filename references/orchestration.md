# Orchestration

## Coordinator execution

1. Establish the whole selected scope and existing work without narrowing it to the first batch.
   Resolve native identities, deduplicate and route by assignment/authored history, not quotas or membership.
   Comments are not authorship. A complete, deduplicated repository input may proceed while independent
   source capture continues; partial capture is not complete input or permission to advance source positions.
2. [Assemble](worker-assembly.md) finite assignments; check scope/authority, inputs, writer conflicts,
   dependencies and end conditions, not implementation. Route in-scope deltas to the current writer;
   same-repository history alone does not bind future assignments to that Worker.
   No proven defect is needed to assign an authorized audit; zero findings is valid.
3. Serial unless parallelism is authorized. Batch-select independent eligible work and dispatch into
   available authorized/backend capacity before waiting. Dispatch each assignment once, not one assignment
   per turn. Do not serialize independent repositories behind one long task or an unrelated blocker.
4. On each completion, integrate its usable result once and refill independently; do not wait for the
   whole batch. Prefer selected unfinished work; preserve explicit stage gates below. Coordinator checks
   coverage/remaining work/global effects, not second engineering acceptance, retests or remote readback.
   Do not wait for CI/merge to dispatch unrelated work. Separate coverage, public outcomes and resources.
5. End the turn and use native events/supported waits when no further eligible dispatch/action is available
   or capacity is occupied. For material unused capacity, explain the concrete input/dependency/backend
   constraint in the next substantive result, not periodic utilization receipts. A limit is not a quota,
   and 'do not fill slots artificially' is not a substitute for selection.
   No repeated audits or scope expansion to fill capacity. Complete the selected scope, not merely a batch.

### Decide the next action on every wake

A completion delivery, continuation, compaction return or authorized heartbeat resumes the whole mandate,
not just the newest message. Integrate the result, then decide before ending the turn:
- Feasible authorized work remains: select/refill or send the owning Coordinator a concrete continuation now.
- Relevant work is actually in flight or capacity is occupied: yield to its native result; do not duplicate it.
- Remaining work is blocked: retain the affected scope, evidenced reason and next condition/owner. Unknown
  eligibility requires bounded selection, not a claim that everything is blocked or complete.
- The whole selected scope is complete: state that scope and its basis, distinct from a finite batch.
A result summary, stale-record correction or promised follow-up is not dispatch. Zero children plus
unfinished feasible scope is a continuation failure, not a valid wait for nonexistent completion events.
Do not demand a new user prompt or the next heartbeat for already authorized feasible work. A completed
Coordinator turn may be resumed for its unfinished domain; this is not reviving a finished leaf audit.

### Supervisor intervention and authorized heartbeat

An explicitly authorized heartbeat belongs to the designated Supervisor, not separate timers per domain.
At each bounded tick reconcile the small domain overview, due source boundaries and known blockers with
available native facts; drill into only concrete anomalies, not every Worker/log/project. Decide and act
under the wake contract above. If a previous correction produced only a summary/no action, investigate
that failed continuation and send a specific remedy within authority; 'unchanged' does not close it.
Verify that continuation was actually accepted through native delivery/result facts; a send acknowledgement
is not execution or engineering success. Keep the outcome unresolved until real progress or an exact
blocker appears. No repeated prompts to an active owner, instant retry loop or second engineering acceptance.
Quiet means no material change and no eligible action, not silently ignoring unfinished work.
Source freshness, capture/retention and engineering completion are separate. A passed retry lower bound
allows one authorized reevaluation, never assumed recovery, rate-limit evasion or perpetual retries.
A paused scheduler is not proof that a separate standing/manual assignment was revoked; conversely a
heartbeat grants no new source/window or permission to restart paused work. Resolve that exact boundary.

### Dependencies, capacity and completion

- Priority is not a barrier: selected unfinished work is dispatched first. A true dependency blocks only
  its dependent actions. A required reassessment-before-new-audit gate applies to the explicitly selected
  stage/group; complete its feasible required actions before new audits. Name that boundary at assembly,
  never infer a whole-Coordinator/global barrier from one repository. Independent work within the current
  stage can run concurrently. Retained external blockers need not hold unrelated eligible work.
- Use the actual delegation backend's capacity and release semantics, bounded by user authorization and
  any aggregate limit. Reserve capacity for accepted/starting/queued work before further dispatch; report
  running separately from queued/occupied slots and apply any additional backend idle-thread limits.
  Do not over-dispatch because accepted work is not yet running. Model/provider name alone does not identify the backend.
  Close idle completed threads only where that backend counts them against capacity; no universal close gate.
  If the backend exposes completion only at batch return, refill at that boundary; do not invent streaming,
  stack calls past its limits or add a watcher to emulate per-child completion.
- Distinguish turn end, Worker task completion, batch completion and whole-scope completion. A yielded
  Coordinator may still own live children. A completed turn/parent status or empty parent run queue does
  not prove all descendants stopped. Use native child/task lifecycle facts, not prose or elapsed time.
- A finite Worker batch bounds its input, not the Coordinator's entire mandate. Continue eligible remaining
  work without another user 'continue'. If all remaining work is externally blocked, report exact retained
  scope/blockers/retry rather than success or indefinite busy waiting. Resume only on an authorized event.
- Source capture, engineering resolution and position advancement have separate gates. Full-source/global
  through requirements do not impose an engineering barrier on complete independent repository batches.
  A missing/failed capture blocks its dependent batch/position, not other complete independent inputs.
- Rate limits bind the evidenced source/account/endpoint scope; obey Retry-After and never evade limits.
  Continue independent permitted sources or captured local work. A retry boundary permits reevaluation,
  not an automatic new timer, polling loop or resumed paused schedule.

### Task boundaries and context reuse

A completed finite assignment releases its default Worker binding, not its evidence or unfinished scope.
For the next batch/stage, select a suitable authorized model/provider and execution using capability,
available capacity and relevant context; do not inherit the old choice solely for cache or thread reuse.
Do not manufacture tasks, violate rate limits or restart active writers to balance model counts.
A bounded, concrete omission/correction in the same task may use the original context when still suitable.
Otherwise hand off normally after the affected writer/queued writes stop; failure is not a prerequisite.
Reuse valid records, capture, repairs and checks with their scope/base/head/limits, not entire transcripts.
New task, thread/context and model are separate backend choices. Neither force fresh threads nor keep
old ones indefinitely; preserve authority, failed-attempt limits and budgets across executor changes.
Clarification does not restore write authority; independent reviews retain their independence.

### Drain, pause, cancel and replacement

Drain stops new assignments/refill/continuations while existing accepted work finishes. Pause stops new
work until authorized resumption; state explicitly whether accepted work drains or is cancelled. Cancel
requests native termination; it does not erase outcomes or itself prove termination. Before replacement,
confirm the affected writer, queued writes and task-owned mutating subprocesses stopped; preserve work
and reconcile uncertain mutations. A tool timeout/returned call alone does not prove subprocess termination;
stop only identified task-owned processes within authority, never shared services.
For replacing a Coordinator, include its descendants and prevent old refill. For a Supervisor-only handoff,
stop its timers/runs/queued writes and retire its governance authority; retain unchanged domain owners
unless their replacement is also authorized. Transfer native references without assuming task ownership.
Independent cleared scopes
may restart without a global drain unless expressly required. Preserve paused schedules and exact authority.

Each repository writer owns its shared root state.md and local work/work.md. Coordinator owns global
membership/navigation/source positions, not a second repository mirror. Serialize global writes through
their designated editor/bounded windows and Git staging through one publisher. This serializes shared
mutations, not unrelated engineering or all repositories' delivery. Defer same-project conflicts only;
no locks, claims or hidden queues.

### Minimal communication during execution

Follow [Worker communication](../roles/worker.md#communication-and-continuation).
After current eligible dispatch/refill, wait on completion/necessary attention, not transcript/record/progress
polling. A wait timeout alone is not failure or a replacement trigger; continue other eligible work or wait
again through native mechanisms. Native final delivery needs no second report/acknowledgement.
Send applicable changed rules/scope/authority once as a combined delta to the current affected writer;
no blanket wakeup of completed Workers. Clarify material omitted outcomes once using suitable original
context or exact existing evidence; retain unknowns if neither suffices. No routine second acceptance,
optional-field demands or inferred outcomes. Continue feasible unfinished work under the task boundary above.
Compaction is not completion. Correct premature returns under the wake contract; only explicitly authorized
Supervisor heartbeats are allowed, with no custom enforcement service or per-Worker polling.
Human-facing updates are separate. Use [prompt templates](../prompts/README.md).

### Lightweight intake and state updates

Read affected current sections before focused edits; reread after another writer/selection change.
Process each return once. Batch finite candidate identity/membership/exclusion checks; reuse applicable
results, refresh changed rules/identities before dependent actions, retain individual failures. Capture
owners establish source completeness; repository Workers do not repeat complete source windows.
Navigation is not authoritative coverage. Review does not prove initial audit
completion or automatically alter membership; explicit reclassification removes superseded assignment
without claiming audit completion, preserving prior coverage/private evidence/history.
Advance only fully captured, handled/reliably retained source ranges. Incomplete feasible work stays open.

### Detect errors through existing signals, not routine audits

Intervene on explicit failures, contradictions, collisions, evidenced suspected inactivity or scope/security/authority violations.
Use suitable original context for a bounded correction, or hand off under the task-boundary rules;
inspect affected evidence only and preserve unrelated success/work.
Reconcile ambiguous mutations before retry; never duplicate a writer/object. One timeout is not failure.
At natural completion/refill points, use available lifecycle timestamps to flag in-flight work unusually
old for its expected operation; inspect only flagged tasks once, distinguishing tools, model/backend waits
and external gates. Reuse available lifecycle facts, not a status sweep on every completion; unchanged
signals do not justify repeated checks. Elapsed time alone never proves failure or authorizes replacement; a sent delta does
not unblock a running tool. Correct through the owning Coordinator/Worker, then use native events.
If all work stalls, use supported native attention/timeout events, an authorized one-shot check or the
explicitly authorized Supervisor heartbeat above; do not invent schedules or claim events detect every stall.
After three failed repairs of one fault, stop that repair and retain its doubtful assumption/blocker.
Independent contribution reassessment is a selected engineering task, not routine Worker acceptance.
