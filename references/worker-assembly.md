# Construct a Worker assignment

Role = responsibility; form = coverage/progression/completion; method = investigation/delivery.
Construct ordinary text using [templates](../prompts/README.md); no compiler or task protocol.

## Establish intent before choosing a template

1. Establish outcome, exact scope, prior work, authority/resources; never infer permissions.
   For authorized managed/self-owned work, add [Maintainer](../roles/maintainer.md) and [maintain](workflows/maintain.md).
2. Choose [form](work-forms/README.md) from assignment/native authored history; comments are not authorship.
3. Capture/deduplicate; normally one complete repository batch per engineering Worker,
   one bounded source batch for discovery. Resolve known writer conflicts before dispatch.
4. Select applicable methods and action limits: investigate, repair/deliver or authorized withdrawal.
5. Establish [harness capabilities](harness.md) and [native forge mapping](forges/README.md); retain blockers,
   never silently substitute exact execution settings.

## Select execution under workspace policy

Use the selected workspace's `state/worker-routing.md` when configured; otherwise use explicit assignment
limits, never invent a model pool. Reuse its current text; refresh changed policy, not every completion.
Coordinator owns each new assignment's provider/model/effort choice: assess the preferred model's suitability
from known task facts, without trial runs; use concrete capability, known capacity or task-fit reasons for an alternative.
Permission is not a usage target; generic task labels or imagined saturation do not justify departure.
Put a short reason for nonpreferred choices in the assignment, not a new ledger or routine receipt.
If a whole round uses nonpreferred models, check its common reason and correct later choices if unsupported;
do not force ratios, invent work, restart active writers or bypass limits. Use native lifecycle signals,
not utilization polling. The designated global editor owns current policy; briefs link it instead of copying
rankings. Escalate authority gaps or exhausted allowed options, not ordinary in-policy choices.

## Compose the context

Order: [SKILL.md](../SKILL.md) + assigned role/form -> applicable methods/target rules
-> task facts/overrides. Keep unchanged shared text stable; variables last.
Select by actual actions: workspace/records for state, contribution/audit methods for engineering,
safety and submission templates for external writes, storage for resources used or assigned for disposition.
Coordinators load [orchestration](orchestration.md); leaves use Worker communication/ownership rules,
not the full assembly/scheduler or other Coordinators' briefs. Carry their applicable authority/deltas in full.
Every task keeps private-reporting/privacy boundaries; load [security](security.md) before investigating
or handling a concrete suspected finding. Do not send every method to every Worker.
Task facts: workspace, native identity and actual project home, root state.md/local work/ paths,
objects/window/base, dependencies, authority/resources, evidence, overrides, end condition and result delivery. Omit inapplicable fields/transcripts;
Workers establish ordinary unknowns; clarify indispensable missing scope/authority.

## Deliver authoritative instructions

State in ordinary text what is already supplied, missing at startup, and conditional on a named action.
Use exact accessible canonical paths or complete current applicable inline text with source labels;
a summary/path without accessible required text is insufficient. Full current text in usable context is read.
Batch known independent missing reads in the same model turn within tool/output limits; recover truncated
parts, missing dependencies or newly applicable rules only. Links are navigation, not recursive read orders.
Read target access/privacy restrictions before broad content; read action-specific requirements before that
action, never defer authority/security gates until after access or publication. A new stage, changed policy,
changed authority or missing usable context triggers affected reads, not a full restart. Completion events,
refill and continuation alone do not. Resolve conflicts before dependent actions; keep private context protected.

## Combine stages without combining away their boundaries

State each stage's input/scope/output/permission/entry condition and dependency boundary: repository,
selected group or whole pass. Distinguish unfinished-work priority from a required completion gate.
Required reassessment and feasible actions precede new audits within the specified gate; unrelated work
and independent tasks in the same stage need not wait. Missing capture blocks its dependent batch/position,
not all refill; feasible local unfinished work remains eligible work, not a reason to idle other slots.
Use [scheduling semantics](orchestration.md#dependencies-capacity-and-completion). Finite Worker batches
retain the Coordinator's whole selection; recurrence and activation belong to the scheduler.

## Dispatch, continuation and handoff

Check scope, authority, resources, dependencies, end condition and delivery once per assignment;
dispatch each assignment once. Authorized independent assignments may fill available capacity in one turn.
Keep storage responsibilities explicit: the leaf preserves evidence and hands resources off; the Coordinator
executes authorized cleanup after writer/process stop. Source disposal is not delegated back to engineering leaves.
This is assignment sufficiency, not a code audit or added PR review. Coordinator briefs retain the whole
mandate and [next-action contract](orchestration.md#decide-the-next-action-on-every-wake) across completion messages
and compaction; leaf results are input to the next decision, not instructions to end coordination.
Completed assignments do not bind the next batch to their Worker/model. Select execution under
[task boundaries](orchestration.md#task-boundaries-and-context-reuse); use [continuation](../prompts/continue.md)
only for suitable same-task context, otherwise normal [handoff](../prompts/handoff.md).
Before assigning writes elsewhere, confirm the prior writer/queued writes stopped and reconcile uncertain
mutations; replacing a Coordinator includes its descendants and disables old refill.
Retain unfinished work in repository state; native task IDs are transport handles, not claims/queues.
