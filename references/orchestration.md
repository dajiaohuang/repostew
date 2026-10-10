# Orchestration

## Coordinator execution

1. Capture the full selected scope/current work once; deduplicate, resolve native identity,
   route by assignment/authored history, not membership or quotas. Comments are not authorship.
2. [Assemble](worker-assembly.md) and dispatch sufficient finite assignments; engineering stays
   with Workers. Preserve explicit whole-source scope. Reuse active same-repository execution.
3. Parallelism needs authorization; process returns/refill independently. Finish all required
   reassessment and feasible actions before new-audit refill; retained external blockers need not wait.
   Finite drain/pause overrides refill; native occupied slots determine capacity, not requested counts.
   Track execution, task outcome and writer ownership separately. Refill after native release;
   cancellation needs confirmed stop before replacing a writer. Close unneeded completed native threads.
4. Trust usable final outcomes/reported writes; apply form-specific membership/position effects.
   No default wait for CI/merge, repeated testing, remote queries or readback acceptance.
5. Complete the whole selected shard: coverage, public outcomes and resources separately.
   Retain exact remaining scope/blocker/retry; zero findings or withdrawals is valid.

Worker writes its repository records; Coordinator writes shared state. Defer same-repository conflicts;
serialize shared-file writes through one agreed writer/bounded windows. No locks, claims or hidden queues.

### Minimal communication during execution

Follow [Worker communication](../roles/worker.md#communication-and-continuation).
Dispatch once; wait on completion/necessary attention, not transcript/record/progress polling.
A wait timeout alone means wait again. Native final delivery needs no second report/acknowledgement.
Send changed rules/scope/authority once as a combined delta to the original Worker.
Ask once for material omitted outcomes, or continue feasible unfinished work; no optional-field demands.
Compaction is not completion. Correct actual premature returns/chatter once; no heartbeat/enforcement service.
Human-facing updates are separate. Use [prompt templates](../prompts/README.md).

### Lightweight intake and state updates

Read affected current sections before focused edits; reread after another writer/selection change.
Process each return once. Navigation is not authoritative coverage. Review does not prove initial audit
completion or automatically alter membership; explicit reclassification removes superseded assignment
without claiming audit completion, preserving prior coverage/private evidence/history.
Advance only fully captured, handled/reliably retained source ranges. Incomplete feasible work stays open.

### Detect errors through existing signals, not routine audits

Intervene only on explicit failures, contradictions, collisions or scope/security/authority violations.
Prefer the original Worker; inspect affected evidence only and preserve unrelated success/work.
Reconcile ambiguous mutations before retry; never duplicate a writer/object. One timeout is not failure.
For evidenced suspected inactivity, make one targeted status check, then use native events.
After three failed repairs of one fault, stop that repair and retain its doubtful assumption/blocker.
Independent contribution reassessment is a selected engineering task, not routine Worker acceptance.
